/**
 * Paragraf Soru Pratiği — Metin Seçim Ekranı
 *
 * - text_library'den 55 metin listeler
 * - exam_type filtresiyle (tyt/lgs/ayt/kpss/ales/yds) süzme
 * - reading_progress ile ilerleme çubuğu
 * - Rastgele metin seçimi
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { supabase } from '../../src/lib/supabase'
import { useAuthStore } from '../../src/stores/authStore'

// ─── Tipler ──────────────────────────────────────────────────────
interface TextItem {
  id:         string
  title:      string
  body:       string
  exam_type:  string
  category:   string | null
  word_count: number | null
  difficulty: number | null
}

interface ProgressMap {
  [textId: string]: number  // 0-100
}

// ─── Renk Paleti (TYT/LGS exam türleri) ─────────────────────────
const EXAM_COLORS: Record<string, { header: string; badge: string }> = {
  tyt:   { header: '#1D4ED8', badge: '#3B82F6' },
  lgs:   { header: '#0891B2', badge: '#06B6D4' },
  ayt:   { header: '#7C3AED', badge: '#8B5CF6' },
  kpss:  { header: '#EA580C', badge: '#F97316' },
  ales:  { header: '#16A34A', badge: '#22C55E' },
  yds:   { header: '#DB2777', badge: '#EC4899' },
}

function getExamColor(examType: string) {
  return EXAM_COLORS[examType?.toLowerCase()] ?? { header: '#1D4ED8', badge: '#3B82F6' }
}

// ─── Filtre chip verileri ─────────────────────────────────────────
const EXAM_FILTERS = [
  { key: 'all',  label: '✨ Tümü'       },
  { key: 'tyt',  label: '🔵 TYT'        },
  { key: 'lgs',  label: '🟡 LGS'        },
  { key: 'ayt',  label: '🟣 AYT'        },
  { key: 'kpss', label: '🟠 KPSS'       },
  { key: 'ales', label: '🟢 ALES'       },
  { key: 'yds',  label: '🔴 YDS'        },
]

// ─── Yardımcı: kelime sayısı hesapla ─────────────────────────────
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── Ana Ekran ────────────────────────────────────────────────────
export default function PracticeScreen() {
  const t           = useAppTheme()
  const s           = useMemo(() => ms(t), [t])
  const router      = useRouter()
  const { student } = useAuthStore()

  const [texts,       setTexts]       = useState<TextItem[]>([])
  const [progress,    setProgress]    = useState<ProgressMap>({})
  const [loading,     setLoading]     = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  // ── Verileri yükle ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Metinleri çek
        const { data: textsData } = await supabase
          .from('text_library')
          .select('id, title, body, exam_type, category, word_count, difficulty')
          .order('exam_type', { ascending: true })
          .order('title', { ascending: true })

        setTexts((textsData as TextItem[]) ?? [])

        // Okuma ilerlemesini çek
        if (student?.id) {
          const { data: progData } = await supabase
            .from('reading_progress')
            .select('text_id, progress_pct')
            .eq('student_id', student.id)

          if (progData) {
            const map: ProgressMap = {}
            for (const row of progData as any[]) {
              map[row.text_id] = row.progress_pct ?? 0
            }
            setProgress(map)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [student?.id])

  // ── Filtrelenmiş liste ─────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return texts
    return texts.filter(tx => tx.exam_type?.toLowerCase() === activeFilter)
  }, [texts, activeFilter])

  // ── Navigasyon ─────────────────────────────────────────────────
  const openSession = useCallback((textId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({ pathname: '/practice/session', params: { textId } } as any)
  }, [router])

  const pickRandom = useCallback(() => {
    if (filtered.length === 0) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    const idx  = Math.floor(Math.random() * filtered.length)
    const text = filtered[idx]
    openSession(text.id)
  }, [filtered, openSession])

  // ── Render ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>📝 Paragraf Pratiği</Text>
          <Text style={s.headerSub}>Okuduğun metinden sorular — TYT/LGS formatı</Text>
        </View>
      </View>

      {/* ── Exam filtre chipleri ────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {EXAM_FILTERS.map(f => {
          const isActive = activeFilter === f.key
          const col = f.key === 'all' ? '#075E54' : getExamColor(f.key).header
          return (
            <TouchableOpacity
              key={f.key}
              style={[s.filterChip, isActive && { backgroundColor: col, borderColor: col }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setActiveFilter(f.key)
              }}
              activeOpacity={0.7}
            >
              <Text style={[s.filterChipTxt, isActive && { color: '#fff' }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── İçerik ─────────────────────────────────────────────── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={t.colors.primary} />
          <Text style={s.loadingTxt}>Metinler yükleniyor…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
        >
          {/* Metin sayısı özeti */}
          <Text style={s.countTxt}>{filtered.length} metin</Text>

          {/* Metin kartları */}
          {filtered.map(tx => {
            const color     = getExamColor(tx.exam_type)
            const prog      = progress[tx.id] ?? 0
            const finished  = prog >= 95
            const wc        = tx.word_count ?? countWords(tx.body ?? '')
            const examLabel = tx.exam_type?.toUpperCase() ?? 'GENEL'

            return (
              <TouchableOpacity
                key={tx.id}
                style={s.textCard}
                onPress={() => openSession(tx.id)}
                activeOpacity={0.8}
              >
                {/* Renkli sol çizgi */}
                <View style={[s.colorBar, { backgroundColor: color.header }]} />

                <View style={s.cardBody}>
                  {/* Başlık satırı */}
                  <View style={s.cardTopRow}>
                    <Text style={s.cardTitle} numberOfLines={2}>{tx.title}</Text>
                    <View style={[s.examBadge, { backgroundColor: color.header + '18', borderColor: color.header + '40' }]}>
                      <Text style={[s.examBadgeTxt, { color: color.header }]}>{examLabel}</Text>
                    </View>
                  </View>

                  {/* Meta: kelime · soru · kategori */}
                  <View style={s.cardMeta}>
                    <Text style={s.metaTxt}>📖 {wc} kelime</Text>
                    <Text style={s.metaDot}>·</Text>
                    <Text style={s.metaTxt}>❓ 5 soru</Text>
                    {tx.category ? (
                      <>
                        <Text style={s.metaDot}>·</Text>
                        <Text style={s.metaTxt}>{tx.category}</Text>
                      </>
                    ) : null}
                  </View>

                  {/* İlerleme çubuğu */}
                  {prog > 0 && (
                    <View style={s.progRow}>
                      <View style={s.progTrack}>
                        <View style={[s.progFill, { width: `${prog}%` as any, backgroundColor: color.header }]} />
                      </View>
                      <Text style={[s.progLabel, finished && s.progDone]}>
                        {finished ? '✓ BİTTİ' : `%${Math.round(prog)}`}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={s.cardArrow}>›</Text>
              </TouchableOpacity>
            )
          })}

          {/* Rastgele buton */}
          {filtered.length > 0 && (
            <TouchableOpacity style={s.randomBtn} onPress={pickRandom} activeOpacity={0.85}>
              <Text style={s.randomBtnTxt}>🎲 Rastgele Metin Seç</Text>
            </TouchableOpacity>
          )}

          {filtered.length === 0 && !loading && (
            <View style={s.center}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={s.emptyTxt}>Bu kategoride metin bulunamadı</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: t.colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 60 },

    // Header
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      backgroundColor:   t.colors.headerBg,
      paddingHorizontal: 16,
      paddingTop:        16,
      paddingBottom:     18,
      gap:               12,
    },
    backBtn:       { padding: 4 },
    backArrow:     { fontSize: 22, color: '#fff', fontWeight: '600' },
    headerCenter:  { flex: 1 },
    headerTitle:   { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    headerSub:     { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

    // Filtre chipleri
    filterRow: {
      paddingHorizontal: 16,
      paddingVertical:   12,
      gap:               8,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical:   7,
      borderRadius:      999,
      borderWidth:       1.5,
      borderColor:       t.colors.border,
      backgroundColor:   t.colors.surface,
    },
    filterChipTxt: {
      fontSize:   12,
      fontWeight: '700',
      color:      t.colors.textSub,
    },

    // Liste
    listContent: { paddingHorizontal: 16, paddingTop: 4 },
    countTxt: {
      fontSize:      11,
      fontWeight:    '600',
      color:         t.colors.textHint,
      letterSpacing: 0.5,
      marginBottom:  10,
    },

    // Metin kartı
    textCard: {
      flexDirection:   'row',
      alignItems:      'center',
      backgroundColor: t.colors.surface,
      borderRadius:    14,
      marginBottom:    10,
      overflow:        'hidden',
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      ...t.shadow.sm,
    },
    colorBar: {
      width:  4,
      alignSelf: 'stretch',
    },
    cardBody: {
      flex:    1,
      padding: 14,
      gap:     6,
    },
    cardTopRow: {
      flexDirection:  'row',
      alignItems:     'flex-start',
      gap:            8,
    },
    cardTitle: {
      flex:       1,
      fontSize:   15,
      fontWeight: '700',
      color:      t.colors.text,
      lineHeight: 22,
    },
    examBadge: {
      paddingHorizontal: 8,
      paddingVertical:   3,
      borderRadius:      6,
      borderWidth:       1,
      flexShrink:        0,
    },
    examBadgeTxt: {
      fontSize:   10,
      fontWeight: '800',
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           4,
      flexWrap:      'wrap',
    },
    metaTxt:  { fontSize: 11, color: t.colors.textSub },
    metaDot:  { fontSize: 11, color: t.colors.textHint },

    // İlerleme
    progRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           8,
      marginTop:     4,
    },
    progTrack: {
      flex:            1,
      height:          4,
      backgroundColor: t.colors.border,
      borderRadius:    2,
      overflow:        'hidden',
    },
    progFill: {
      height:       4,
      borderRadius: 2,
    },
    progLabel: {
      fontSize:   10,
      fontWeight: '700',
      color:      t.colors.textHint,
      minWidth:   34,
      textAlign:  'right',
    },
    progDone: { color: '#16A34A' },

    cardArrow: {
      fontSize:        20,
      color:           t.colors.textHint,
      paddingRight:    14,
    },

    // Rastgele butonu
    randomBtn: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'center',
      backgroundColor:   t.colors.headerBg,
      borderRadius:      14,
      paddingVertical:   16,
      marginTop:         8,
      gap:               8,
    },
    randomBtnTxt: {
      fontSize:   15,
      fontWeight: '800',
      color:      '#fff',
    },

    // Loading & empty
    loadingTxt: { fontSize: 13, color: t.colors.textSub, marginTop: 8 },
    emptyTxt:   { fontSize: 14, color: t.colors.textSub, textAlign: 'center', marginTop: 8 },
  })
}
