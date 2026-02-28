import React, { useState, useMemo, useCallback } from 'react'
import {
  Modal, View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { createClient } from '@supabase/supabase-js'
// expo-document-picker yerel stub — native link gerektirmez
const DocumentPicker = {
  getDocumentAsync: async (_opts: unknown): Promise<{ canceled: true } | { canceled: false; assets: Array<{ uri: string; name: string; mimeType?: string }> }> =>
    ({ canceled: true }),
}
import { File as ExpoFile } from 'expo-file-system'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import { mmkvStorage } from '../../../stores/mmkvStorage'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
)

// ─── Tipler ────────────────────────────────────────────────────────

export interface ImportedContent {
  text: string
  title: string
  wordCount: number
  source: 'library' | 'text' | 'url'
  estimatedMinutes: number
}

interface LibraryArticle {
  id: string
  title: string
  content_text: string
  word_count: number
  difficulty_level: number
  subject_code: string
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
    // atob → ham binary string, okunabilir ASCII dizilerini bul
    const binary = atob(b64)
    // Parantez operatörü: PDF text nesneleri "(kelime) Tj" formatında
    const tjMatches = binary.match(/\(([^)]{2,200})\)\s*Tj/g) ?? []
    if (tjMatches.length > 10) {
      const words = tjMatches
        .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, ''))
        .filter((s) => /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(s))
        .join(' ')
      if (words.length > 100) return words.slice(0, 15000)
    }
    // Fallback: okunabilir ASCII/Latin karakter dizileri
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

  const [activeTab, setActiveTab] = useState<TabKey>('library')
  const [articles, setArticles]   = useState<LibraryArticle[]>([])
  const [recents, setRecents]     = useState<RecentContent[]>([])
  const [loading, setLoading]     = useState(false)
  const [manualText, setManualText] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [urlText, setUrlText]     = useState('')
  const [urlLoading, setUrlLoading] = useState(false)

  // PDF tab state
  const [fileLoading, setFileLoading]   = useState(false)
  const [fileError, setFileError]       = useState<string | null>(null)
  const [pickedFile, setPickedFile]     = useState<PickedFile | null>(null)

  // Kütüphane yükle
  const loadLibrary = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('articles')
        .select('id, title, content_text, word_count, difficulty_level, subject_code')
        .eq('is_published', true)
        .order('difficulty_level')
        .limit(30)

      if (subjectCode) query = query.eq('subject_code', subjectCode)

      const { data } = await query
      setArticles((data as LibraryArticle[]) ?? [])
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

  // Tab değişince PDF state'i sıfırla
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    if (tab !== 'pdf') {
      setPickedFile(null)
      setFileError(null)
    }
  }

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

  const selectArticle = (a: LibraryArticle) => {
    onContentSelected({
      text: a.content_text,
      title: a.title,
      wordCount: a.word_count || wordCount(a.content_text),
      source: 'library',
      estimatedMinutes: Math.max(1, Math.round((a.word_count || 200) / 250)),
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

  // ── Dosya seç (PDF / TXT / Word) ───────────────────────────────
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
        const text = await new ExpoFile(uri).text()
        const trimmed = text.replace(/\s+/g, ' ').trim().slice(0, 20000)
        const wc = wordCount(trimmed)
        if (wc < 10) {
          setFileError('Dosyada yeterli metin bulunamadı.')
          return
        }
        setPickedFile({ title: name.replace(/\.\w+$/, ''), text: trimmed, wordCount: wc })

      } else if (isPdf) {
        const b64 = await new ExpoFile(uri).base64()
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
    } catch (e) {
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
                  <TouchableOpacity key={a.id} style={s.articleCard} onPress={() => selectArticle(a)} activeOpacity={0.75}>
                    <View style={s.articleInfo}>
                      <Text style={s.articleTitle} numberOfLines={2}>{a.title}</Text>
                      <Text style={s.articleMeta}>
                        {a.word_count} kelime · {diffStars(a.difficulty_level)} · ~{Math.max(1, Math.round(a.word_count / 250))} dk
                      </Text>
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

          {/* ── TAB: Dosya (PDF / TXT / Word) ── */}
          {activeTab === 'pdf' && (
            <ScrollView
              style={s.scroll}
              contentContainerStyle={[s.scrollContent, { gap: 14 }]}
              keyboardShouldPersistTaps="handled"
            >
              {/* Seçim butonları */}
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

              {/* Dosya seçildi → önizleme */}
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
      paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
      backgroundColor: t.colors.panel,
    },
    headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff' },
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

    articleCard:  {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 14,
      marginBottom: 10, borderWidth: 1, borderColor: t.colors.border,
    },
    articleInfo:  { flex: 1 },
    articleTitle: { fontSize: 15, fontWeight: '600', color: t.colors.text, marginBottom: 4 },
    articleMeta:  { fontSize: 12, color: t.colors.textHint },
    chevron:      { fontSize: 20, color: t.colors.textHint },

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

    // ── Dosya seçici stilleri ───────────────────────────────────
    fileTitle:    { fontSize: 17, fontWeight: '700', color: t.colors.text, textAlign: 'center' },
    fileSub:      { fontSize: 13, color: t.colors.textHint, textAlign: 'center', marginTop: -6 },
    filePickBtn:  {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.colors.primary, borderRadius: 16,
      padding: 16,
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
