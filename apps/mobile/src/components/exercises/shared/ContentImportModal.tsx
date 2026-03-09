import React, { useState, useMemo, useCallback } from 'react'
import {
  Modal, View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { supabase } from '../../../lib/supabase'
import * as DocumentPicker from 'expo-document-picker'
import { File as FSFile } from 'expo-file-system'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import { mmkvStorage } from '../../../stores/mmkvStorage'

// ─── Tipler ────────────────────────────────────────────────────────

export interface ImportedContent {
  text: string
  title: string
  wordCount: number
  source: 'library' | 'text' | 'url'
  estimatedMinutes: number
  /** Kütüphane metni ID'si — QuestionModal için (source==='library' ise dolu) */
  libraryTextId?: string
}

interface QuestionRow {
  id: string
  text_id: string
  question_type: string
  question_text: string
  options: string[]
  correct_index: number
  explanation?: string | null
}

interface LibraryArticle {
  id: string
  title: string
  body: string
  word_count: number | null
  difficulty: number
  category: string
  exam_type: string
  questions: QuestionRow[]
}

interface RecentContent {
  title: string
  text: string
  wordCount: number
  source: 'library' | 'text' | 'url'
  lastWPM?: number
  usedAt: number
}

interface ContentImportModalProps {
  visible: boolean
  onClose: () => void
  onContentSelected: (content: ImportedContent) => void
  examType?: string
  subjectCode?: string
}

const RECENT_KEY = 'chunk_rsvp_recent_v1'

async function loadRecent(): Promise<RecentContent[]> {
  try {
    const raw = await mmkvStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as RecentContent[]) : []
  } catch {
    return []
  }
}

export async function saveRecentContent(content: ImportedContent, lastWPM?: number) {
  try {
    const existing = await loadRecent()
    const entry: RecentContent = {
      title: content.title,
      text: content.text,
      wordCount: content.wordCount,
      source: content.source,
      lastWPM,
      usedAt: Date.now(),
    }
    const filtered = existing.filter((r) => r.title !== content.title).slice(0, 4)
    await mmkvStorage.setItem(RECENT_KEY, JSON.stringify([entry, ...filtered]))
  } catch { /* sessiz başarısız */ }
}

// ─── PDF ham metin çıkarma ──────────────────────────────────────────

function extractPdfText(b64: string): string {
  try {
    const binary = atob(b64)
    const tjMatches = binary.match(/\(([^)]{2,200})\)\s*Tj/g) ?? []
    if (tjMatches.length > 10) {
      const words = tjMatches
        .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, ''))
        .filter((s) => /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(s))
        .join(' ')
      if (words.length > 100) return words.slice(0, 15000)
    }
    const runs = binary.match(/[\x20-\x7E\u00C0-\u017F\r\n\t]{4,}/g) ?? []
    const filtered = runs
      .filter((s) =>
        s.length > 4 &&
        !s.startsWith('/') &&
        !/^[\d\s.]+$/.test(s) &&
        /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(s),
      )
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    return filtered.slice(0, 15000)
  } catch {
    return ''
  }
}

// ─── Soru tipi etiketi ─────────────────────────────────────────────

const Q_TYPE_LABEL: Record<string, string> = {
  main_idea:  'Ana Fikir',
  detail:     'Ayrıntı',
  inference:  'Çıkarım',
  vocabulary: 'Kelime',
  tone:       'Ton',
}

// ─── Ana Bileşen ───────────────────────────────────────────────────

type TabKey = 'library' | 'text' | 'pdf' | 'recent'

interface PickedFile {
  title: string
  text: string
  wordCount: number
}

export default function ContentImportModal({
  visible,
  onClose,
  onContentSelected,
  examType,
  subjectCode,
}: ContentImportModalProps) {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])

  const [activeTab, setActiveTab]     = useState<TabKey>('library')
  const [articles, setArticles]       = useState<LibraryArticle[]>([])
  const [recents, setRecents]         = useState<RecentContent[]>([])
  const [loading, setLoading]         = useState(false)
  const [manualText, setManualText]   = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [urlText, setUrlText]         = useState('')
  const [urlLoading, setUrlLoading]   = useState(false)

  // Seçili metin — soru önizleme
  const [previewArticle, setPreviewArticle] = useState<LibraryArticle | null>(null)
  const [expandedQIdx, setExpandedQIdx]     = useState<number | null>(null)

  // PDF tab state
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError]     = useState<string | null>(null)
  const [pickedFile, setPickedFile]   = useState<PickedFile | null>(null)

  // ── Kütüphane yükle (metin + sorular) ──────────────────────────
  const loadLibrary = useCallback(async () => {
    setLoading(true)
    try {
      // 1) Metinleri çek
      let query = (supabase as any)
        .from('text_library')
        .select('id, title, body, word_count, difficulty, category, exam_type')
        .eq('status', 'published')
        .order('difficulty')
        .limit(40)

      if (subjectCode) query = query.eq('exam_type', subjectCode)

      const { data: textsData } = await query
      const texts: Omit<LibraryArticle, 'questions'>[] = (textsData as any[]) ?? []

      // 2) Soruları çek (authenticated RLS — herkes okuyabilir)
      const textIds = texts.map((tx) => tx.id)
      let questionsData: QuestionRow[] = []
      if (textIds.length > 0) {
        const { data: qData } = await (supabase as any)
          .from('text_questions')
          .select('id, text_id, question_type, question_text, options, correct_index, explanation')
          .in('text_id', textIds)
        questionsData = (qData as QuestionRow[]) ?? []
      }

      // 3) Soruları text_id'ye göre grupla
      const qMap = new Map<string, QuestionRow[]>()
      for (const q of questionsData) {
        const arr = qMap.get(q.text_id) ?? []
        arr.push(q)
        qMap.set(q.text_id, arr)
      }

      // 4) Birleştir
      const combined: LibraryArticle[] = texts.map((tx) => ({
        ...tx,
        questions: qMap.get(tx.id) ?? [],
      }))

      setArticles(combined)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [subjectCode])

  // Modal açılınca yükle
  const handleShow = useCallback(async () => {
    loadLibrary()
    const r = await loadRecent()
    setRecents(r)
  }, [loadLibrary])

  React.useEffect(() => {
    if (visible) handleShow()
  }, [visible, handleShow])

  // Tab değişince sıfırla
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setPreviewArticle(null)
    setExpandedQIdx(null)
    if (tab !== 'pdf') {
      setPickedFile(null)
      setFileError(null)
    }
  }

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

  const selectArticle = (a: LibraryArticle) => {
    const wc = a.word_count ?? wordCount(a.body)
    onContentSelected({
      text: a.body,
      title: a.title,
      wordCount: wc,
      source: 'library',
      estimatedMinutes: Math.max(1, Math.round(wc / 250)),
      libraryTextId: a.id,
    })
  }

  const submitManual = () => {
    const wc = wordCount(manualText)
    if (wc < 20) return
    onContentSelected({
      text: manualText.trim(),
      title: manualTitle.trim() || 'Manuel Metin',
      wordCount: wc,
      source: 'text',
      estimatedMinutes: Math.max(1, Math.round(wc / 250)),
    })
  }

  const submitURL = async () => {
    if (!urlText.startsWith('http')) return
    setUrlLoading(true)
    try {
      const res = await fetch(urlText, { headers: { Accept: 'text/html,text/plain' } })
      const html = await res.text()
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
      const wc = wordCount(text)
      onContentSelected({
        text,
        title: urlText,
        wordCount: wc,
        source: 'url',
        estimatedMinutes: Math.max(1, Math.round(wc / 250)),
      })
    } catch {
      // URL erişilemedi
    } finally {
      setUrlLoading(false)
    }
  }

  // ── Dosya seç ───────────────────────────────────────────────────
  const pickDocument = async (mode: 'pdf' | 'txt') => {
    setFileError(null)
    setPickedFile(null)
    setFileLoading(true)
    try {
      const mimeTypes =
        mode === 'txt'
          ? ['text/plain', 'text/markdown']
          : [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]

      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: true,
      })

      if (result.canceled) { setFileLoading(false); return }

      const asset = result.assets[0]
      const uri   = asset.uri
      const name  = asset.name ?? 'Dosya'
      const mime  = asset.mimeType ?? ''

      const isTxt = mime === 'text/plain' || mime === 'text/markdown' ||
                    name.endsWith('.txt')  || name.endsWith('.md')
      const isPdf = mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf')

      if (isTxt) {
        const text = await new FSFile(uri).text()
        const trimmed = text.replace(/\s+/g, ' ').trim().slice(0, 20000)
        const wc = wordCount(trimmed)
        if (wc < 10) {
          setFileError('Dosyada yeterli metin bulunamadı.')
          return
        }
        setPickedFile({ title: name.replace(/\.\w+$/, ''), text: trimmed, wordCount: wc })

      } else if (isPdf) {
        const b64 = await new FSFile(uri).base64()
        const text = extractPdfText(b64)
        const wc   = wordCount(text)
        if (wc < 20) {
          setFileError(
            'PDF\'den metin otomatik çıkarılamadı.\nPDF\'i açıp metni kopyalayarak ✏️ Metin sekmesini kullanabilirsin.',
          )
          return
        }
        setPickedFile({ title: name.replace(/\.pdf$/i, ''), text, wordCount: wc })

      } else {
        setFileError('Desteklenmeyen dosya türü. .pdf, .txt veya .docx seç.')
      }
    } catch {
      setFileError('Dosya okunamadı. Lütfen tekrar dene.')
    } finally {
      setFileLoading(false)
    }
  }

  const submitPickedFile = () => {
    if (!pickedFile) return
    onContentSelected({
      text: pickedFile.text,
      title: pickedFile.title,
      wordCount: pickedFile.wordCount,
      source: 'text',
      estimatedMinutes: Math.max(1, Math.round(pickedFile.wordCount / 250)),
    })
  }

  const diffStars = (d: number) => '★'.repeat(Math.min(5, d)) + '☆'.repeat(Math.max(0, 5 - d))

  // ── Soru önizleme paneli ────────────────────────────────────────
  if (previewArticle) {
    const wc = previewArticle.word_count ?? wordCount(previewArticle.body)
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => { setPreviewArticle(null); setExpandedQIdx(null) }} style={s.backBtn}>
              <Text style={s.backTxt}>← Geri</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle} numberOfLines={1}>{previewArticle.title}</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.scroll} contentContainerStyle={[s.scrollContent, { gap: 14 }]}>
            {/* Metin meta */}
            <View style={s.previewMeta}>
              <Text style={s.previewMetaTxt}>{previewArticle.exam_type}</Text>
              <Text style={s.previewMetaTxt}>{diffStars(previewArticle.difficulty)}</Text>
              <Text style={s.previewMetaTxt}>{wc} kelime</Text>
              <Text style={s.previewMetaTxt}>~{Math.max(1, Math.round(wc / 250))} dk</Text>
            </View>

            {/* Metin önizleme */}
            <View style={s.textPreviewBox}>
              <Text style={s.textPreviewLabel}>📄 Metin Önizleme</Text>
              <Text style={s.textPreviewBody} numberOfLines={8}>
                {previewArticle.body}
              </Text>
            </View>

            {/* Sorular */}
            {previewArticle.questions.length > 0 ? (
              <>
                <Text style={s.qSectionTitle}>
                  📝 Anlama Soruları ({previewArticle.questions.length})
                </Text>
                {previewArticle.questions.map((q, qi) => (
                  <TouchableOpacity
                    key={q.id}
                    style={s.qCard}
                    onPress={() => setExpandedQIdx(expandedQIdx === qi ? null : qi)}
                    activeOpacity={0.85}
                  >
                    {/* Soru başlık satırı */}
                    <View style={s.qCardHeader}>
                      <View style={s.qTypeBadge}>
                        <Text style={s.qTypeTxt}>{Q_TYPE_LABEL[q.question_type] ?? q.question_type}</Text>
                      </View>
                      <Text style={s.qNum}>S{qi + 1}</Text>
                      <Text style={s.qExpandIcon}>{expandedQIdx === qi ? '▲' : '▼'}</Text>
                    </View>

                    <Text style={s.qText}>{q.question_text}</Text>

                    {/* Şıklar (expand edilince) */}
                    {expandedQIdx === qi && (
                      <View style={s.optionsWrap}>
                        {(q.options as string[]).map((opt, oi) => (
                          <View
                            key={oi}
                            style={[
                              s.optRow,
                              oi === q.correct_index && s.optCorrect,
                            ]}
                          >
                            <Text style={[
                              s.optLetter,
                              oi === q.correct_index && s.optLetterCorrect,
                            ]}>
                              {String.fromCharCode(65 + oi)}
                            </Text>
                            <Text style={[
                              s.optText,
                              oi === q.correct_index && s.optTextCorrect,
                            ]}>
                              {opt}
                            </Text>
                            {oi === q.correct_index && (
                              <Text style={s.checkMark}>✓</Text>
                            )}
                          </View>
                        ))}
                        {q.explanation ? (
                          <View style={s.explanationBox}>
                            <Text style={s.explanationLabel}>💡 Açıklama</Text>
                            <Text style={s.explanationText}>{q.explanation}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <Text style={s.emptyTxt}>Bu metin için soru bulunamadı.</Text>
            )}
          </ScrollView>

          {/* Seç butonu */}
          <View style={s.bottomBar}>
            <TouchableOpacity style={s.submitBtn} onPress={() => selectArticle(previewArticle)} activeOpacity={0.85}>
              <Text style={s.submitTxt}>Bu Metni Kullan →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>📖 İçerik Seç</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={s.tabs}>
            {(['library', 'text', 'pdf', 'recent'] as TabKey[]).map((tab) => {
              const labels: Record<TabKey, string> = {
                library: '📚 Kütüphane',
                text:    '✏️ Metin',
                pdf:     '📄 Dosya',
                recent:  '🕐 Son',
              }
              return (
                <TouchableOpacity
                  key={tab}
                  style={[s.tab, activeTab === tab && s.tabActive]}
                  onPress={() => handleTabChange(tab)}
                >
                  <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>{labels[tab]}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* ── TAB: Kütüphane ── */}
          {activeTab === 'library' && (
            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
              {loading ? (
                <ActivityIndicator size="large" color={t.colors.primary} style={s.loader} />
              ) : articles.length === 0 ? (
                <Text style={s.emptyTxt}>İçerik bulunamadı. İnternet bağlantını kontrol et.</Text>
              ) : (
                articles.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={s.articleCard}
                    onPress={() => { setPreviewArticle(a); setExpandedQIdx(null) }}
                    activeOpacity={0.75}
                  >
                    <View style={s.articleInfo}>
                      <Text style={s.articleTitle} numberOfLines={2}>{a.title}</Text>
                      <View style={s.articleMetaRow}>
                        <Text style={s.articleMeta}>
                          {a.word_count ?? '?'} kelime · {diffStars(a.difficulty)} · ~{Math.max(1, Math.round((a.word_count ?? 250) / 250))} dk
                        </Text>
                        {a.questions.length > 0 && (
                          <View style={s.qCountBadge}>
                            <Text style={s.qCountTxt}>📝 {a.questions.length} soru</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.articleExamType}>{a.exam_type} · {a.category}</Text>
                    </View>
                    <Text style={s.chevron}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}

          {/* ── TAB: Metin Gir ── */}
          {activeTab === 'text' && (
            <ScrollView style={s.scroll} contentContainerStyle={[s.scrollContent, { gap: 12 }]} keyboardShouldPersistTaps="handled">
              <TextInput
                style={s.titleInput}
                placeholder="Başlık (isteğe bağlı)"
                placeholderTextColor={t.colors.textHint}
                value={manualTitle}
                onChangeText={setManualTitle}
              />
              <TextInput
                style={s.textArea}
                placeholder="Metni buraya yapıştır veya yaz... (min 20 kelime)"
                placeholderTextColor={t.colors.textHint}
                value={manualText}
                onChangeText={setManualText}
                multiline
                maxLength={10_000}
                textAlignVertical="top"
              />
              <Text style={s.charCount}>{wordCount(manualText)} kelime</Text>

              <View style={s.divider} />
              <Text style={s.orLabel}>veya URL'den yükle</Text>
              <View style={s.urlRow}>
                <TextInput
                  style={[s.titleInput, { flex: 1 }]}
                  placeholder="https://..."
                  placeholderTextColor={t.colors.textHint}
                  value={urlText}
                  onChangeText={setUrlText}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <TouchableOpacity style={s.urlBtn} onPress={submitURL} disabled={urlLoading}>
                  {urlLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.urlBtnTxt}>Yükle</Text>}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[s.submitBtn, wordCount(manualText) < 20 && s.submitDisabled]}
                onPress={submitManual}
                disabled={wordCount(manualText) < 20}
              >
                <Text style={s.submitTxt}>Bu Metni Kullan →</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── TAB: Dosya ── */}
          {activeTab === 'pdf' && (
            <ScrollView
              style={s.scroll}
              contentContainerStyle={[s.scrollContent, { gap: 14 }]}
              keyboardShouldPersistTaps="handled"
            >
              {!pickedFile && (
                <>
                  <Text style={s.fileTitle}>Dosyandan metin yükle</Text>
                  <Text style={s.fileSub}>Cihazından PDF, Word veya TXT dosyası seç</Text>

                  <TouchableOpacity
                    style={s.filePickBtn}
                    onPress={() => pickDocument('pdf')}
                    disabled={fileLoading}
                    activeOpacity={0.8}
                  >
                    {fileLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={s.filePickIcon}>📄</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.filePickLabel}>PDF veya Word Seç</Text>
                          <Text style={s.filePickSub}>.pdf · .docx · .doc</Text>
                        </View>
                        <Text style={s.filePickArrow}>›</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.filePickBtn, { backgroundColor: t.colors.info }]}
                    onPress={() => pickDocument('txt')}
                    disabled={fileLoading}
                    activeOpacity={0.8}
                  >
                    {fileLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={s.filePickIcon}>📝</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.filePickLabel}>Metin Dosyası Seç</Text>
                          <Text style={s.filePickSub}>.txt · .md</Text>
                        </View>
                        <Text style={s.filePickArrow}>›</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {fileError && (
                    <View style={s.errorBox}>
                      <Text style={s.errorTxt}>{fileError}</Text>
                      <TouchableOpacity onPress={() => setActiveTab('text')} style={s.errorBtn}>
                        <Text style={s.errorBtnTxt}>✏️ Metin Gir'e Git</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={s.divider} />
                  <Text style={s.orLabel}>İpucu: PDF metni seçemezsen kopyala-yapıştır yöntemini kullan</Text>
                  <TouchableOpacity onPress={() => setActiveTab('text')}>
                    <Text style={[s.orLabel, { color: t.colors.primary, fontWeight: '600', marginTop: 4 }]}>
                      ✏️ Metin Gir sekmesine git →
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {pickedFile && (
                <>
                  <View style={s.filePreviewHeader}>
                    <Text style={s.filePreviewIcon}>✅</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.filePreviewName} numberOfLines={1}>{pickedFile.title}</Text>
                      <Text style={s.filePreviewMeta}>{pickedFile.wordCount} kelime · ~{Math.max(1, Math.round(pickedFile.wordCount / 250))} dk</Text>
                    </View>
                    <TouchableOpacity onPress={() => setPickedFile(null)} style={{ padding: 6 }}>
                      <Text style={{ fontSize: 16, color: t.colors.textHint }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={s.filePreviewBox}>
                    <Text style={s.filePreviewText} numberOfLines={6}>
                      {pickedFile.text.slice(0, 400)}…
                    </Text>
                  </View>

                  <TouchableOpacity style={s.submitBtn} onPress={submitPickedFile}>
                    <Text style={s.submitTxt}>Bu Dosyayı Kullan →</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setPickedFile(null)} style={{ alignItems: 'center', marginTop: 4 }}>
                    <Text style={[s.orLabel, { color: t.colors.primary }]}>← Başka dosya seç</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          )}

          {/* ── TAB: Son Kullanılanlar ── */}
          {activeTab === 'recent' && (
            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
              {recents.length === 0 ? (
                <Text style={s.emptyTxt}>Henüz içerik kullanmadın.</Text>
              ) : (
                recents.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    style={s.articleCard}
                    activeOpacity={0.75}
                    onPress={() => onContentSelected({
                      text: r.text,
                      title: r.title,
                      wordCount: r.wordCount,
                      source: r.source,
                      estimatedMinutes: Math.max(1, Math.round(r.wordCount / 250)),
                    })}
                  >
                    <View style={s.articleInfo}>
                      <Text style={s.articleTitle} numberOfLines={1}>{r.title}</Text>
                      <Text style={s.articleMeta}>
                        {r.wordCount} kelime{r.lastWPM ? `  ·  Son WPM: ${r.lastWPM}` : ''}
                      </Text>
                    </View>
                    <Text style={s.chevron}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ─── Stiller ───────────────────────────────────────────────────────

function ms(t: AppTheme) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: t.colors.background },
    header:       {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
      backgroundColor: t.colors.panel,
    },
    headerTitle:  { flex: 1, fontSize: 17, fontWeight: '800', color: '#fff', marginHorizontal: 8 },
    backBtn:      { paddingVertical: 4, paddingHorizontal: 2 },
    backTxt:      { fontSize: 15, color: t.colors.primary, fontWeight: '600' },
    closeBtn:     { padding: 8 },
    closeTxt:     { fontSize: 18, color: 'rgba(255,255,255,0.7)' },

    tabs:         { flexDirection: 'row', backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    tab:          { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabActive:    { borderBottomWidth: 2, borderBottomColor: t.colors.primary },
    tabTxt:       { fontSize: 12, fontWeight: '600', color: t.colors.textHint },
    tabTxtActive: { color: t.colors.primary },

    scroll:       { flex: 1 },
    scrollContent:{ padding: 16, paddingBottom: 40 },
    loader:       { marginTop: 60 },
    emptyTxt:     { textAlign: 'center', color: t.colors.textHint, marginTop: 40, fontSize: 14 },

    // ── Kütüphane kartları ──────────────────────────────────────
    articleCard:  {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 14,
      marginBottom: 10, borderWidth: 1, borderColor: t.colors.border,
    },
    articleInfo:  { flex: 1, gap: 4 },
    articleTitle: { fontSize: 15, fontWeight: '600', color: t.colors.text },
    articleMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    articleMeta:  { fontSize: 12, color: t.colors.textHint },
    articleExamType: { fontSize: 11, color: t.colors.primary, fontWeight: '600' },
    qCountBadge:  {
      backgroundColor: t.colors.primary + '20',
      borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
      borderWidth: 1, borderColor: t.colors.primary + '40',
    },
    qCountTxt:    { fontSize: 11, fontWeight: '700', color: t.colors.primary },
    chevron:      { fontSize: 20, color: t.colors.textHint },

    // ── Önizleme paneli ─────────────────────────────────────────
    previewMeta:  {
      flexDirection: 'row', flexWrap: 'wrap', gap: 8,
      backgroundColor: t.colors.surface, borderRadius: 12, padding: 12,
      borderWidth: 1, borderColor: t.colors.border,
    },
    previewMetaTxt: { fontSize: 13, color: t.colors.textHint, fontWeight: '500' },

    textPreviewBox: {
      backgroundColor: t.colors.surface, borderRadius: 14,
      padding: 14, borderWidth: 1, borderColor: t.colors.border, gap: 8,
    },
    textPreviewLabel: { fontSize: 12, fontWeight: '700', color: t.colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
    textPreviewBody:  { fontSize: 14, color: t.colors.text, lineHeight: 21 },

    qSectionTitle: { fontSize: 15, fontWeight: '800', color: t.colors.text, marginTop: 4 },

    qCard:        {
      backgroundColor: t.colors.surface, borderRadius: 14,
      padding: 14, borderWidth: 1, borderColor: t.colors.border, gap: 8,
    },
    qCardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
    qTypeBadge:   {
      backgroundColor: t.colors.primary + '20',
      borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    },
    qTypeTxt:     { fontSize: 10, fontWeight: '700', color: t.colors.primary, textTransform: 'uppercase' },
    qNum:         { flex: 1, fontSize: 11, color: t.colors.textHint, fontWeight: '600' },
    qExpandIcon:  { fontSize: 12, color: t.colors.textHint },
    qText:        { fontSize: 14, fontWeight: '600', color: t.colors.text, lineHeight: 20 },

    optionsWrap:  { gap: 8, marginTop: 4 },
    optRow:       {
      flexDirection: 'row', alignItems: 'flex-start', gap: 8,
      backgroundColor: t.colors.background, borderRadius: 10,
      padding: 10, borderWidth: 1, borderColor: t.colors.border,
    },
    optCorrect:   { borderColor: '#00C853', backgroundColor: 'rgba(0,200,83,0.08)' },
    optLetter:    { fontSize: 13, fontWeight: '800', color: t.colors.textHint, width: 18 },
    optLetterCorrect: { color: '#00C853' },
    optText:      { flex: 1, fontSize: 13, color: t.colors.text, lineHeight: 18 },
    optTextCorrect: { color: '#00C853', fontWeight: '600' },
    checkMark:    { fontSize: 14, color: '#00C853', fontWeight: '900' },

    explanationBox: {
      backgroundColor: t.colors.primary + '10',
      borderRadius: 10, padding: 10, borderWidth: 1,
      borderColor: t.colors.primary + '30', gap: 4, marginTop: 4,
    },
    explanationLabel: { fontSize: 11, fontWeight: '700', color: t.colors.primary },
    explanationText:  { fontSize: 12, color: t.colors.text, lineHeight: 18 },

    bottomBar:    {
      paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingTop: 8,
      backgroundColor: t.colors.background,
      borderTopWidth: 1, borderTopColor: t.colors.border,
    },

    // ── Manuel giriş ────────────────────────────────────────────
    titleInput:   {
      backgroundColor: t.colors.surface, borderRadius: 12, padding: 12,
      fontSize: 14, color: t.colors.text, borderWidth: 1, borderColor: t.colors.border,
    },
    textArea:     {
      backgroundColor: t.colors.surface, borderRadius: 12, padding: 12,
      fontSize: 14, color: t.colors.text, borderWidth: 1, borderColor: t.colors.border,
      minHeight: 200,
    },
    charCount:    { fontSize: 12, color: t.colors.textHint, textAlign: 'right' },
    divider:      { height: 1, backgroundColor: t.colors.divider, marginVertical: 8 },
    orLabel:      { fontSize: 13, color: t.colors.textHint, textAlign: 'center' },
    urlRow:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
    urlBtn:       {
      backgroundColor: t.colors.info, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 12,
    },
    urlBtnTxt:    { color: '#fff', fontWeight: '700', fontSize: 13 },
    submitBtn:    {
      backgroundColor: t.colors.primary, borderRadius: 14,
      paddingVertical: 16, alignItems: 'center', marginTop: 8,
    },
    submitDisabled: { opacity: 0.4 },
    submitTxt:    { fontSize: 16, fontWeight: '700', color: '#fff' },

    // ── Dosya seçici ─────────────────────────────────────────────
    fileTitle:    { fontSize: 17, fontWeight: '700', color: t.colors.text, textAlign: 'center' },
    fileSub:      { fontSize: 13, color: t.colors.textHint, textAlign: 'center', marginTop: -6 },
    filePickBtn:  {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.colors.primary, borderRadius: 16, padding: 16,
    },
    filePickIcon: { fontSize: 28 },
    filePickLabel:{ fontSize: 15, fontWeight: '700', color: '#fff' },
    filePickSub:  { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    filePickArrow:{ fontSize: 22, color: 'rgba(255,255,255,0.7)' },

    errorBox:     {
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: '#EF4444', gap: 10,
    },
    errorTxt:     { fontSize: 13, color: '#EF4444', lineHeight: 20 },
    errorBtn:     {
      backgroundColor: t.colors.primary, borderRadius: 10,
      paddingVertical: 10, alignItems: 'center',
    },
    errorBtnTxt:  { color: '#fff', fontWeight: '700', fontSize: 13 },

    filePreviewHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: t.colors.border,
    },
    filePreviewIcon:   { fontSize: 24 },
    filePreviewName:   { fontSize: 14, fontWeight: '700', color: t.colors.text },
    filePreviewMeta:   { fontSize: 12, color: t.colors.textHint, marginTop: 2 },
    filePreviewBox:    {
      backgroundColor: t.colors.surface, borderRadius: 12, padding: 14,
      borderWidth: 1, borderColor: t.colors.border,
    },
    filePreviewText:   { fontSize: 13, color: t.colors.textHint, lineHeight: 20 },
  })
}
