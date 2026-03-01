// =====================================================
// WPMTrendCard — Son 7 günlük WPM trend grafiği
//
// Veri: reading_mode_sessions (avg_wpm, created_at)
// Görsel: mini bar chart + ortalama + trend yönü
// Pure component: kendi fetch'i var (küçük, odaklı)
// =====================================================

import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'

interface DayBucket {
  label: string   // "Pzt", "Sal" …
  wpm:   number   // 0 = no data
}

// ─── Yardımcılar ──────────────────────────────────────

const TR_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

function last7DayBuckets(): DayBucket[] {
  const buckets: DayBucket[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    buckets.push({ label: TR_DAYS[d.getDay()], wpm: 0 })
  }
  return buckets
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// ─── Ana Bileşen ──────────────────────────────────────

export const WPMTrendCard = React.memo(function WPMTrendCard() {
  const t       = useAppTheme()
  const s       = useMemo(() => createStyles(t), [t])
  const student = useAuthStore(st => st.student)

  const [buckets, setBuckets] = useState<DayBucket[]>(last7DayBuckets())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!student?.id) { setLoading(false); return }
    let cancelled = false

    ;(async () => {
      try {
        const since = new Date()
        since.setDate(since.getDate() - 6)
        since.setHours(0, 0, 0, 0)

        const { data } = await (supabase as any)
          .from('reading_mode_sessions')
          .select('avg_wpm, created_at')
          .eq('student_id', student.id)
          .gt('avg_wpm', 0)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: true })

        if (cancelled || !data) return

        // Günlük ortalama hesapla
        const dayMap: Record<string, { sum: number; cnt: number }> = {}
        ;(data as { avg_wpm: number; created_at: string }[]).forEach(r => {
          const key = r.created_at.slice(0, 10)
          if (!dayMap[key]) dayMap[key] = { sum: 0, cnt: 0 }
          dayMap[key].sum += r.avg_wpm
          dayMap[key].cnt += 1
        })

        // Bucket'ları doldur
        const base = last7DayBuckets()
        for (let i = 0; i < 7; i++) {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          const key = dateKey(d)
          if (dayMap[key]) {
            base[i].wpm = Math.round(dayMap[key].sum / dayMap[key].cnt)
          }
        }
        setBuckets(base)
      } catch {
        // sessiz
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [student?.id])

  // ── Hesaplamalar ────────────────────────────────────
  const activeBuckets = buckets.filter(b => b.wpm > 0)
  const maxWpm = activeBuckets.length > 0 ? Math.max(...activeBuckets.map(b => b.wpm)) : 1
  const avgWpm = activeBuckets.length > 0
    ? Math.round(activeBuckets.reduce((s, b) => s + b.wpm, 0) / activeBuckets.length)
    : 0

  // Trend: son 2 aktif günü karşılaştır
  const lastTwo = activeBuckets.slice(-2)
  const trend   = lastTwo.length < 2
    ? 'flat'
    : lastTwo[1].wpm > lastTwo[0].wpm ? 'up'
    : lastTwo[1].wpm < lastTwo[0].wpm ? 'down'
    : 'flat'

  const ACCENT = '#3B82F6'

  if (loading) {
    return (
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.title}>📈 WPM Trendi</Text>
        </View>
        <View style={s.loadingRow}>
          {[40, 65, 30, 80, 50, 70, 45].map((h, i) => (
            <View key={i} style={[s.barBg, { height: h, opacity: 0.2 }]} />
          ))}
        </View>
      </View>
    )
  }

  if (activeBuckets.length === 0) {
    return (
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.title}>📈 WPM Trendi</Text>
          <Text style={s.emptyTxt}>Henüz seans yok</Text>
        </View>
        <Text style={s.hintTxt}>Okuma seansı tamamla, hızını takip et!</Text>
      </View>
    )
  }

  return (
    <View style={s.card}>

      {/* ── Başlık satırı ──────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.title}>📈 WPM Trendi</Text>
        <View style={s.statsRow}>
          <Text style={[s.avgWpm, { color: ACCENT }]}>{avgWpm}</Text>
          <Text style={s.wpmLabel}> ort. WPM</Text>
          <Text style={s.trendIcon}>
            {trend === 'up' ? ' ↑' : trend === 'down' ? ' ↓' : ' →'}
          </Text>
        </View>
      </View>

      {/* ── Bar chart ─────────────────────────────────── */}
      <View style={s.chartRow}>
        {buckets.map((b, i) => {
          const isToday = i === 6
          const heightPct = b.wpm > 0 ? Math.max(0.08, b.wpm / maxWpm) : 0.04
          const BAR_HEIGHT = 52
          return (
            <View key={i} style={s.barCol}>
              <View style={s.barTrack}>
                {b.wpm > 0 && (
                  <Text style={[s.barValue, { color: isToday ? ACCENT : t.colors.textHint }]}>
                    {b.wpm}
                  </Text>
                )}
                <View
                  style={[
                    s.bar,
                    {
                      height: heightPct * BAR_HEIGHT,
                      backgroundColor: b.wpm === 0
                        ? t.colors.border
                        : isToday
                          ? ACCENT
                          : ACCENT + '55',
                    },
                  ]}
                />
              </View>
              <Text style={[s.dayLabel, isToday && { color: ACCENT, fontWeight: '700' }]}>
                {b.label}
              </Text>
            </View>
          )
        })}
      </View>

      {/* ── En yüksek WPM chip ────────────────────────── */}
      <View style={s.footer}>
        <View style={s.chip}>
          <Text style={s.chipTxt}>🏆 En yüksek: {maxWpm} WPM</Text>
        </View>
        <View style={[s.chip, { backgroundColor: ACCENT + '15' }]}>
          <Text style={[s.chipTxt, { color: ACCENT }]}>
            {activeBuckets.length}/7 aktif gün
          </Text>
        </View>
      </View>
    </View>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.md,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      gap:             12,
    },
    header: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize:   t.font.sm,
      fontWeight: '800',
      color:      t.colors.text,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems:    'baseline',
    },
    avgWpm: {
      fontSize:   20,
      fontWeight: '900',
    },
    wpmLabel: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
    trendIcon: {
      fontSize:   t.font.sm,
      fontWeight: '700',
      color:      '#10B981',
    },
    chartRow: {
      flexDirection:  'row',
      alignItems:     'flex-end',
      justifyContent: 'space-between',
      height:         80,
    },
    barCol: {
      flex:       1,
      alignItems: 'center',
      gap:        4,
    },
    barTrack: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'flex-end',
      width:          '100%',
      position:       'relative',
    },
    barValue: {
      fontSize:    8,
      fontWeight:  '700',
      marginBottom: 2,
    },
    bar: {
      width:        '65%',
      borderRadius: 3,
      minHeight:    3,
    },
    barBg: {
      flex:         1,
      width:        '65%',
      borderRadius: 3,
      backgroundColor: '#6B728033',
    },
    dayLabel: {
      fontSize: 9,
      color:    t.colors.textHint,
    },
    footer: {
      flexDirection: 'row',
      gap:           8,
    },
    chip: {
      backgroundColor: t.colors.surfaceSub,
      borderRadius:    8,
      paddingHorizontal: 10,
      paddingVertical:   4,
    },
    chipTxt: {
      fontSize:   t.font.xs,
      fontWeight: '600',
      color:      t.colors.textHint,
    },
    loadingRow: {
      flexDirection:  'row',
      alignItems:     'flex-end',
      justifyContent: 'space-between',
      height:         60,
      gap:            4,
    },
    emptyTxt: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
    hintTxt: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      textAlign: 'center',
      paddingVertical: 8,
    },
  })
}
