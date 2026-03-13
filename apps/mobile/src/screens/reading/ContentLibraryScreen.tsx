/**
 * ContentLibraryScreen
 * 3 sekme: library (3-seviyeli kütüphane) | paste (metin yapıştır) | recent (son kullanılanlar)
 * Sınav → Ders → Metin hiyerarşisi, arama çubuğu, lazy body fetch.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../../lib/supabase'
import { mmkvStorage } from '../../stores/mmkvStorage'
import { EXAM_STRUCTURE } from '../../data/examContentStructure'
import type { ExamCategory, LessonFolder, LibraryText, LibraryLevel } from '../../types/reading'
import type { ImportedContent } from '../../components/exercises/shared/ContentImportModal'

// ─── Sabitler ─────────────────────────────────────────────────────────

const RECENT_KEY = 'chunk_rsvp_recent_v1'

// ─── Tipler ───────────────────────────────────────────────────────────

interface RecentContent {
  title:          string
  text:           string
  wordCount:      number
  source:         'library' | 'text' | 'url'
  lastWPM?:       number
  usedAt:         number
  libraryTextId?: string
}

// ─── MMKV Helpers ─────────────────────────────────────────────────────

async function loadRecent(): Promise<RecentContent[]> {
  try {
    const raw = await mmkvStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as RecentContent[]) : []
  } catch {
    return []
  }
}

async function saveToRecent(content: ImportedContent): Promise<void> {
  try {
    const existing = await loadRecent()
    const entry: RecentContent = {
      title:         content.title,
      text:          content.text,
      wordCount:     content.wordCount,
      source:        content.source,
      usedAt:        Date.now(),
      libraryTextId: content.libraryTextId,
    }
    const updated = [
      entry,
      ...existing.filter((r) => r.title !== content.title),
    ].slice(0, 10)
    await mmkvStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch {
    // silently fail
  }
}

// ─── Props ────────────────────────────────────────────────────────────

interface Props {
  accentColor:       string
  moduleKey:         string
  onContentSelected: (c: ImportedContent) => void
  onBack:            () => void
  /** Kullanıcının kayıtlı sınav türü — Kütüphane o sınava otomatik açılır */
  initialExamKey?:   string
}

type Tab = 'library' | 'paste' | 'dosya' | 'recent'

// ─── Difficulty Helpers ───────────────────────────────────────────────

function difficultyStars(d: number): string {
  const filled = Math.min(5, Math.max(1, d))
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

function difficultyColor(d: number): string {
  if (d <= 1) return '#22C55E'
  if (d <= 2) return '#84CC16'
  if (d <= 3) return '#F59E0B'
  if (d <= 4) return '#EF4444'
  return '#7C3AED'
}

// ─── Main Component ───────────────────────────────────────────────────

export default function ContentLibraryScreen({
  accentColor,
  onContentSelected,
  onBack,
  initialExamKey,
}: Props) {
  const [tab,             setTab]             = useState<Tab>('library')
  const [level,           setLevel]           = useState<LibraryLevel>('exams')
  const [selectedExam,    setSelectedExam]    = useState<ExamCategory | null>(null)
  const [selectedLesson,  setSelectedLesson]  = useState<LessonFolder | null>(null)
  const [texts,           setTexts]           = useState<LibraryText[]>([])
  const [loading,         setLoading]         = useState(false)
  const [fetchingBody,    setFetchingBody]    = useState(false)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [pasteText,       setPasteText]       = useState('')
  const [recentItems,     setRecentItems]     = useState<RecentContent[]>([])
  const [pickedFile,      setPickedFile]      = useState<{ name: string; text: string } | null>(null)
  const [pickingFile,     setPickingFile]     = useState(false)
  const [pickError,       setPickError]       = useState<string | null>(null)

  // Recent yükle
  useEffect(() => {
    if (tab === 'recent') {
      loadRecent().then(setRecentItems)
    }
  }, [tab])

  // Hızlı Başlat: kullanıcının sınav türüne otomatik git
  useEffect(() => {
    if (!initialExamKey) return
    const exam = EXAM_STRUCTURE.find(
      (e) => e.key.toUpperCase() === initialExamKey.toUpperCase()
    )
    if (exam) {
      setSelectedExam(exam)
      setLevel('lessons')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Library Navigation ─────────────────────────────────────────────

  const handleExamSelect = useCallback((exam: ExamCategory) => {
    setSelectedExam(exam)
    setLevel('lessons')
  }, [])

  const handleLessonSelect = useCallback(async (lesson: LessonFolder) => {
    if (!selectedExam) return
    setSelectedLesson(lesson)
    setLevel('texts')
    setLoading(true)
    setSearchQuery('')
    try {
      const { data } = await (supabase as any)
        .from('text_library')
        .select('id, title, category, exam_type, difficulty, word_count')
        .eq('exam_type', selectedExam.key)
        .eq('category', lesson.category)
        .order('difficulty', { ascending: true })

      setTexts((data as LibraryText[]) ?? [])
    } catch {
      setTexts([])
    } finally {
      setLoading(false)
    }
  }, [selectedExam])

  const handleTextSelect = useCallback(async (text: LibraryText) => {
    setFetchingBody(true)
    try {
      const { data } = await (supabase as any)
        .from('text_library')
        .select('body')
        .eq('id', text.id)
        .single()

      const body = (data as { body: string } | null)?.body ?? ''
      const words = body.trim().split(/\s+/).filter(Boolean).length
      const content: ImportedContent = {
        text:             body,
        title:            text.title,
        wordCount:        text.word_count ?? words,
        source:           'library',
        estimatedMinutes: Math.max(1, Math.ceil((text.word_count ?? words) / 220)),
        libraryTextId:    text.id,
      }
      await saveToRecent(content)
      onContentSelected(content)
    } catch {
      // silently fail — user stays on screen
    } finally {
      setFetchingBody(false)
    }
  }, [onContentSelected])

  // ── File Picker ────────────────────────────────────────────────────
  const handlePickFile = useCallback(async () => {
    setPickError(null)
    setPickingFile(true)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      })
      if (result.canceled || !result.assets?.length) return
      const asset = result.assets[0]
      const mime = asset.mimeType ?? ''
      if (mime === 'text/plain' || asset.name.endsWith('.txt')) {
        const text = await FileSystem.readAsStringAsync(asset.uri)
        setPickedFile({ name: asset.name, text })
      } else {
        setPickError('Sadece .txt dosyaları okunabilir. PDF/Word desteği yakında ekleniyor.')
        setPickedFile({ name: asset.name, text: '' })
      }
    } catch {
      setPickError('Dosya açılamadı. Lütfen tekrar deneyin.')
    } finally {
      setPickingFile(false)
    }
  }, [])

  const handleFileSubmit = useCallback(() => {
    if (!pickedFile || pickedFile.text.length < 30) return
    const words = pickedFile.text.trim().split(/\s+/).filter(Boolean).length
    const content: ImportedContent = {
      text:             pickedFile.text.trim(),
      title:            pickedFile.name.replace(/\.[^.]+$/, ''),
      wordCount:        words,
      source:           'text',
      estimatedMinutes: Math.max(1, Math.ceil(words / 220)),
    }
    saveToRecent(content)
    onContentSelected(content)
  }, [pickedFile, onContentSelected])

  const handleLibraryBack = useCallback(() => {
    if (level === 'texts') {
      setLevel('lessons')
      setTexts([])
      setSearchQuery('')
    } else if (level === 'lessons') {
      setLevel('exams')
      setSelectedExam(null)
    } else {
      onBack()
    }
  }, [level, onBack])

  // ── Paste ──────────────────────────────────────────────────────────

  const pasteWordCount = useMemo(
    () => pasteText.trim().split(/\s+/).filter(Boolean).length,
    [pasteText]
  )

  const handlePasteSubmit = useCallback(() => {
    if (pasteText.trim().length < 30) return
    const content: ImportedContent = {
      text:             pasteText.trim(),
      title:            'Yapıştırılan Metin',
      wordCount:        pasteWordCount,
      source:           'text',
      estimatedMinutes: Math.max(1, Math.ceil(pasteWordCount / 220)),
    }
    saveToRecent(content)
    onContentSelected(content)
  }, [pasteText, pasteWordCount, onContentSelected])

  // ── Recent Select ──────────────────────────────────────────────────

  const handleRecentSelect = useCallback((item: RecentContent) => {
    const content: ImportedContent = {
      text:             item.text,
      title:            item.title,
      wordCount:        item.wordCount,
      source:           item.source,
      estimatedMinutes: Math.max(1, Math.ceil(item.wordCount / 220)),
      libraryTextId:    item.libraryTextId,
    }
    onContentSelected(content)
  }, [onContentSelected])

  // ── Filtered texts ─────────────────────────────────────────────────

  const filteredTexts = useMemo(() => {
    if (!searchQuery.trim()) return texts
    const q = searchQuery.toLowerCase()
    return texts.filter((t) => t.title.toLowerCase().includes(q))
  }, [texts, searchQuery])

  // ── Back Button Logic ──────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (tab !== 'library') {
      onBack()
      return
    }
    handleLibraryBack()
  }, [tab, handleLibraryBack, onBack])

  const pickedFileWordCount = useMemo(() =>
    pickedFile?.text.trim().split(/\s+/).filter(Boolean).length ?? 0,
    [pickedFile]
  )

  // ── Header title ──────────────────────────────────────────────────

  const headerTitle = useMemo(() => {
    if (tab !== 'library') return 'İçerik Seç'
    if (level === 'exams') return 'Sınav Seç'
    if (level === 'lessons' && selectedExam) return selectedExam.label
    if (level === 'texts' && selectedLesson) return selectedLesson.label
    return 'Kütüphane'
  }, [tab, level, selectedExam, selectedLesson])

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.root}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={s.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{headerTitle}</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* Tab Bar — 4 sekme */}
      <View style={[s.tabBar, { borderBottomColor: accentColor + '30' }]}>
        {([
          { key: 'library', icon: '📚', label: 'Kütüphane' },
          { key: 'paste',   icon: '✏️',  label: 'Metin'     },
          { key: 'dosya',   icon: '📄',  label: 'Dosya'     },
          { key: 'recent',  icon: '🕐',  label: 'Son'       },
        ] as { key: Tab; icon: string; label: string }[]).map(({ key, icon, label }) => {
          const active = tab === key
          return (
            <TouchableOpacity
              key={key}
              style={[s.tabItem, active && [s.tabItemActive, { borderBottomColor: accentColor }]]}
              onPress={() => setTab(key)}
            >
              <Text style={s.tabIcon}>{icon}</Text>
              <Text style={[s.tabLabel, active && { color: accentColor, fontWeight: '800' }]}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Body */}
      {tab === 'library' && (
        <>
          {/* Search — sadece texts seviyesinde */}
          {level === 'texts' && (
            <View style={s.searchWrap}>
              <TextInput
                style={[s.searchInput, { borderColor: accentColor + '40' }]}
                placeholder="Metin ara…"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>
          )}

          {loading ? (
            <View style={s.centerBox}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={[s.loadingText, { color: accentColor }]}>Metinler yükleniyor…</Text>
            </View>
          ) : (
            <ScrollView
              style={s.scroll}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {level === 'exams' && (
                <View style={s.grid2}>
                  {EXAM_STRUCTURE.map((exam) => (
                    <TouchableOpacity
                      key={exam.key}
                      style={s.examCard}
                      onPress={() => handleExamSelect(exam)}
                      activeOpacity={0.8}
                    >
                      <View style={[s.examColorStrip, { backgroundColor: exam.color }]}>
                        <Text style={s.examIcon}>{exam.icon}</Text>
                      </View>
                      <View style={s.examCardBody}>
                        <Text style={[s.examLabel, { color: exam.color }]}>{exam.label}</Text>
                        <Text style={s.examSub}>{exam.lessons.length} ders</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {level === 'lessons' && selectedExam && (
                <View style={s.listGap}>
                  {selectedExam.lessons.map((lesson) => (
                    <TouchableOpacity
                      key={lesson.category}
                      style={[s.lessonRow, { borderColor: selectedExam.color + '30' }]}
                      onPress={() => handleLessonSelect(lesson)}
                      activeOpacity={0.8}
                    >
                      <View style={[s.lessonIcon, { backgroundColor: selectedExam.color + '15' }]}>
                        <Text style={s.lessonIconText}>{lesson.icon}</Text>
                      </View>
                      <Text style={s.lessonLabel}>{lesson.label}</Text>
                      <Text style={[s.lessonArrow, { color: selectedExam.color }]}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {level === 'texts' && (
                <View style={s.listGap}>
                  {filteredTexts.length === 0 ? (
                    <View style={s.emptyBox}>
                      <Text style={s.emptyIcon}>📭</Text>
                      <Text style={s.emptyText}>
                        {searchQuery ? 'Arama sonucu bulunamadı' : 'Bu kategoride metin yok'}
                      </Text>
                    </View>
                  ) : (
                    filteredTexts.map((text) => (
                      <TouchableOpacity
                        key={text.id}
                        style={s.textCard}
                        onPress={() => handleTextSelect(text)}
                        activeOpacity={0.85}
                        disabled={fetchingBody}
                      >
                        <View style={s.textCardHeader}>
                          <Text style={s.textTitle} numberOfLines={2}>{text.title}</Text>
                          <View style={[s.diffBadge, { backgroundColor: difficultyColor(text.difficulty) + '20' }]}>
                            <Text style={[s.diffStars, { color: difficultyColor(text.difficulty) }]}>
                              {difficultyStars(text.difficulty)}
                            </Text>
                          </View>
                        </View>
                        <View style={s.textCardMeta}>
                          <Text style={s.metaChip}>{text.category}</Text>
                          {text.word_count ? (
                            <Text style={s.metaChip}>{text.word_count} kelime</Text>
                          ) : null}
                        </View>
                        {fetchingBody && (
                          <ActivityIndicator
                            size="small"
                            color={accentColor}
                            style={s.loadingOverlay}
                          />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </>
      )}

      {tab === 'paste' && (
        <KeyboardAvoidingView
          style={s.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.pasteContainer}>
            <View style={s.pasteLabelRow}>
              <Text style={s.pasteLabel}>Metni buraya yapıştırın</Text>
              <Text style={s.pasteCount}>{pasteWordCount} kelime</Text>
            </View>
            <TextInput
              style={[s.pasteInput, { borderColor: accentColor + '40' }]}
              multiline
              value={pasteText}
              onChangeText={setPasteText}
              placeholder="Minimum 30 karakter…"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                s.pasteSubmit,
                {
                  backgroundColor:
                    pasteText.trim().length >= 30 ? accentColor : '#D1D5DB',
                },
              ]}
              onPress={handlePasteSubmit}
              disabled={pasteText.trim().length < 30}
              activeOpacity={0.85}
            >
              <Text style={s.pasteSubmitText}>✓ Bu Metni Kullan</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {tab === 'dosya' && (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Desteklenen formatlar */}
          <View style={s.formatRow}>
            {[
              { icon: '📄', label: 'TXT', color: '#22C55E', note: 'Tam destek' },
              { icon: '📕', label: 'PDF', color: '#EF4444', note: 'Yakında'    },
              { icon: '📘', label: 'DOC', color: '#3B82F6', note: 'Yakında'    },
              { icon: '📗', label: 'DOCX',color: '#10B981', note: 'Yakında'    },
            ].map(({ icon, label, color, note }) => (
              <View key={label} style={[s.formatCard, { borderColor: color + '40' }]}>
                <Text style={s.formatIcon}>{icon}</Text>
                <Text style={[s.formatLabel, { color }]}>{label}</Text>
                <Text style={s.formatNote}>{note}</Text>
              </View>
            ))}
          </View>

          {/* Pick button */}
          <TouchableOpacity
            style={[s.pickBtn, { borderColor: accentColor + '50', backgroundColor: accentColor + '08' }]}
            onPress={handlePickFile}
            disabled={pickingFile}
            activeOpacity={0.8}
          >
            {pickingFile ? (
              <ActivityIndicator color={accentColor} />
            ) : (
              <>
                <Text style={s.pickBtnIcon}>📂</Text>
                <Text style={[s.pickBtnTxt, { color: accentColor }]}>Dosya Seç</Text>
                <Text style={s.pickBtnSub}>TXT, PDF, Word</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Error */}
          {pickError && (
            <View style={s.pickErrorBox}>
              <Text style={s.pickErrorTxt}>⚠️ {pickError}</Text>
            </View>
          )}

          {/* Seçilen dosya */}
          {pickedFile && (
            <View style={[s.pickedCard, { borderColor: accentColor + '40' }]}>
              <View style={s.pickedHeader}>
                <Text style={[s.pickedName, { color: accentColor }]} numberOfLines={1}>
                  📄 {pickedFile.name}
                </Text>
                <Text style={s.pickedMeta}>{pickedFileWordCount} kelime</Text>
              </View>
              {pickedFile.text.length > 0 && (
                <Text style={s.pickedPreview} numberOfLines={3}>
                  {pickedFile.text.slice(0, 200)}…
                </Text>
              )}
              <TouchableOpacity
                style={[
                  s.pasteSubmit,
                  { backgroundColor: pickedFile.text.length >= 30 ? accentColor : '#D1D5DB', marginTop: 10 },
                ]}
                onPress={handleFileSubmit}
                disabled={pickedFile.text.length < 30}
                activeOpacity={0.85}
              >
                <Text style={s.pasteSubmitText}>✓ Bu Dosyayı Kullan</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {tab === 'recent' && (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {recentItems.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>🕐</Text>
              <Text style={s.emptyText}>Henüz kullanılan metin yok</Text>
            </View>
          ) : (
            <View style={s.listGap}>
              {recentItems.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.recentCard}
                  onPress={() => handleRecentSelect(item)}
                  activeOpacity={0.85}
                >
                  <View style={[s.recentSourceDot, { backgroundColor: accentColor }]} />
                  <View style={s.recentBody}>
                    <Text style={s.recentTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={s.recentMeta}>
                      {item.wordCount} kelime
                      {item.lastWPM ? ` · ${item.lastWPM} WPM` : ''}
                    </Text>
                  </View>
                  <Text style={[s.recentArrow, { color: accentColor }]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

    </SafeAreaView>
  )
}

// ─── StyleSheet ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#F9FAFB' },
  flex1:   { flex: 1 },

  // Header
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingTop:        12,
    paddingBottom:     12,
    gap:               8,
  },
  backBtn: { paddingVertical: 4, minWidth: 56 },
  backTxt: { fontSize: 15, color: 'rgba(255,255,255,0.92)', fontWeight: '600' },
  headerTitle: {
    flex:          1,
    fontSize:      17,
    fontWeight:    '800',
    color:         '#FFFFFF',
    textAlign:     'center',
    letterSpacing: -0.3,
  },
  headerSpacer: { minWidth: 56 },

  // Tab Bar
  tabBar: {
    flexDirection:   'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex:            1,
    paddingVertical: 10,
    alignItems:      'center',
    gap:             2,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {},
  tabIcon:  { fontSize: 18 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280' },

  // Dosya tab
  formatRow: {
    flexDirection: 'row',
    gap:           10,
    marginBottom:  4,
  },
  formatCard: {
    flex:          1,
    borderRadius:  12,
    borderWidth:   1.5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems:    'center',
    gap:           3,
  },
  formatIcon:  { fontSize: 22 },
  formatLabel: { fontSize: 12, fontWeight: '800' },
  formatNote:  { fontSize: 9,  color: '#9CA3AF', fontWeight: '600' },

  pickBtn: {
    borderWidth:   2,
    borderRadius:  18,
    borderStyle:   'dashed',
    paddingVertical: 28,
    alignItems:    'center',
    gap:           6,
  },
  pickBtnIcon: { fontSize: 36 },
  pickBtnTxt:  { fontSize: 17, fontWeight: '800' },
  pickBtnSub:  { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },

  pickErrorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius:    12,
    padding:         12,
    borderWidth:     1,
    borderColor:     '#FECACA',
  },
  pickErrorTxt: { fontSize: 13, color: '#DC2626', fontWeight: '600', lineHeight: 18 },

  pickedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    borderWidth:     1.5,
    padding:         14,
    gap:             6,
    shadowColor:     '#000',
    shadowOpacity:   0.05,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  pickedHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  pickedName: { flex: 1, fontSize: 14, fontWeight: '700' },
  pickedMeta: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  pickedPreview: {
    fontSize:   12,
    color:      '#6B7280',
    lineHeight: 18,
    backgroundColor: '#F9FAFB',
    borderRadius:    8,
    padding:         8,
  },

  // Search
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical:   10,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderWidth:     1.5,
    borderRadius:    12,
    paddingHorizontal: 14,
    paddingVertical:   10,
    fontSize:        14,
    color:           '#111827',
  },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },

  // Loading
  centerBox: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     80,
    gap:            12,
  },
  loadingText: {
    fontSize:   14,
    fontWeight: '600',
  },

  // Exam Grid
  grid2: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
  examCard: {
    width:          '47%',
    borderRadius:   16,
    overflow:       'hidden',
    backgroundColor:'#FFFFFF',
    shadowColor:    '#000',
    shadowOpacity:  0.12,
    shadowRadius:   10,
    shadowOffset:   { width: 0, height: 3 },
    elevation:      4,
  },
  examColorStrip: {
    width:          '100%',
    paddingVertical: 18,
    alignItems:     'center',
    justifyContent: 'center',
  },
  examCardBody: {
    paddingVertical:  10,
    paddingHorizontal: 8,
    alignItems:     'center',
    gap:            3,
  },
  examIcon:  { fontSize: 34 },
  examLabel: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  examSub:   { fontSize: 11, color: '#6B7280', fontWeight: '500' },

  // Lessons
  listGap: { gap: 8 },
  lessonRow: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: '#FFFFFF',
    borderRadius:   14,
    borderWidth:    1,
    padding:        14,
    gap:            12,
    shadowColor:    '#000',
    shadowOpacity:  0.05,
    shadowRadius:   6,
    shadowOffset:   { width: 0, height: 1 },
    elevation:      1,
  },
  lessonIcon: {
    width:          44,
    height:         44,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
  },
  lessonIconText: { fontSize: 20 },
  lessonLabel: {
    flex:       1,
    fontSize:   15,
    fontWeight: '700',
    color:      '#111827',
  },
  lessonArrow: { fontSize: 22, fontWeight: '700' },

  // Texts
  textCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    padding:         14,
    gap:             8,
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  textCardHeader: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    gap:            10,
  },
  textTitle: {
    flex:       1,
    fontSize:   14,
    fontWeight: '700',
    color:      '#111827',
    lineHeight: 20,
  },
  diffBadge: {
    borderRadius:      8,
    paddingHorizontal: 6,
    paddingVertical:   3,
    flexShrink:        0,
  },
  diffStars: {
    fontSize:   11,
    fontWeight: '600',
  },
  textCardMeta: {
    flexDirection: 'row',
    gap:           6,
    flexWrap:      'wrap',
  },
  metaChip: {
    fontSize:          11,
    color:             '#6B7280',
    fontWeight:        '600',
    backgroundColor:   '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  loadingOverlay: {
    position: 'absolute',
    right:    14,
    bottom:   14,
  },

  // Empty
  emptyBox: {
    alignItems:     'center',
    paddingTop:     60,
    gap:            12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize:  15,
    color:     '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Paste
  pasteContainer: {
    flex:    1,
    padding: 16,
    gap:     10,
  },
  pasteLabelRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  pasteLabel: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#374151',
  },
  pasteInput: {
    flex:              1,
    backgroundColor:   '#FFFFFF',
    borderWidth:       1.5,
    borderRadius:      14,
    paddingHorizontal: 14,
    paddingVertical:   14,
    fontSize:          14,
    color:             '#111827',
    lineHeight:        21,
  },
  pasteCount: {
    fontSize:   12,
    color:      '#6B7280',
    fontWeight: '600',
  },
  pasteSubmit: {
    borderRadius:    16,
    paddingVertical: 16,
    alignItems:      'center',
    marginTop:       14,
    shadowColor:     '#000',
    shadowOpacity:   0.12,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       3,
  },
  pasteSubmitText: {
    fontSize:   16,
    fontWeight: '800',
    color:      '#FFFFFF',
  },

  // Recent
  recentCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    padding:         14,
    gap:             12,
    shadowColor:     '#000',
    shadowOpacity:   0.05,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 1 },
    elevation:       1,
  },
  recentSourceDot: {
    width:        10,
    height:       10,
    borderRadius: 5,
    flexShrink:   0,
  },
  recentBody: { flex: 1, gap: 3 },
  recentTitle: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#111827',
  },
  recentMeta: {
    fontSize:   12,
    color:      '#6B7280',
    fontWeight: '500',
  },
  recentArrow: { fontSize: 20, fontWeight: '700' },
})
