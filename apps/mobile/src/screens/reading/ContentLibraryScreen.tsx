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
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
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
}

type Tab = 'library' | 'paste' | 'recent'

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

  // Recent yükle
  useEffect(() => {
    if (tab === 'recent') {
      loadRecent().then(setRecentItems)
    }
  }, [tab])

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

      {/* Tab Bar */}
      <View style={[s.tabBar, { borderBottomColor: accentColor + '20' }]}>
        {(['library', 'paste', 'recent'] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = { library: '📚 Kütüphane', paste: '✏️ Yapıştır', recent: '🕐 Son Kullanılan' }
          const active = tab === t
          return (
            <TouchableOpacity
              key={t}
              style={[s.tabItem, active && [s.tabItemActive, { borderBottomColor: accentColor }]]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.tabLabel, active && { color: accentColor, fontWeight: '800' }]}>
                {labels[t]}
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
                      style={[s.examCard, { borderColor: exam.color + '30', backgroundColor: exam.color + '10' }]}
                      onPress={() => handleExamSelect(exam)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.examIcon}>{exam.icon}</Text>
                      <Text style={[s.examLabel, { color: exam.color }]}>{exam.label}</Text>
                      <Text style={s.examSub}>{exam.lessons.length} ders</Text>
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
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.pasteLabel}>Metni buraya yapıştırın</Text>
            <TextInput
              style={[s.pasteInput, { borderColor: accentColor + '40' }]}
              multiline
              value={pasteText}
              onChangeText={setPasteText}
              placeholder="Minimum 30 karakter…"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
            <View style={s.pasteMeta}>
              <Text style={s.pasteCount}>{pasteWordCount} kelime</Text>
            </View>
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
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingVertical: 12,
    alignItems:      'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {},
  tabLabel: {
    fontSize:   12,
    fontWeight: '600',
    color:      '#6B7280',
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
    borderWidth:    1.5,
    padding:        16,
    alignItems:     'center',
    gap:            6,
    shadowColor:    '#000',
    shadowOpacity:  0.06,
    shadowRadius:   8,
    shadowOffset:   { width: 0, height: 2 },
    elevation:      2,
  },
  examIcon:  { fontSize: 32 },
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
  pasteLabel: {
    fontSize:     14,
    fontWeight:   '700',
    color:        '#374151',
    marginBottom: 6,
  },
  pasteInput: {
    backgroundColor:   '#FFFFFF',
    borderWidth:       1.5,
    borderRadius:      14,
    paddingHorizontal: 14,
    paddingVertical:   14,
    fontSize:          14,
    color:             '#111827',
    minHeight:         200,
    lineHeight:        21,
  },
  pasteMeta: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    marginTop:      6,
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
