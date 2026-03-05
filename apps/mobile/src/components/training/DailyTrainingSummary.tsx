/**
 * DailyTrainingSummary — Günlük antrenman final özeti
 * Total XP, güçlü/zayıf alan, seri güncellemesi, bilişsel skor deltası
 */

import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native'
import type { ExerciseScore } from '../../features/visual-mechanics/engines/scoringEngine'
import type { DailyPlan, ExerciseCategory } from '../../services/dailyTrainingEngine'
import { CATEGORY_META } from '../../services/dailyTrainingEngine'

const GRADE_ORDER = ['S', 'A', 'B', 'C', 'D']

interface Props {
  plan:          DailyPlan
  scores:        ExerciseScore[]
  streakDays:    number
  onFinish:      () => void
}

export default function DailyTrainingSummary({ plan, scores, streakDays, onFinish }: Props) {
  const totalXp     = scores.reduce((s, sc) => s + sc.xpEarned, 0)
  const avgScore    = Math.round(scores.reduce((s, sc) => s + sc.focusStabilityScore, 0) / scores.length)
  const grades      = scores.map((s) => s.grade)
  const bestGrade   = grades.sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b))[0] ?? 'B'

  // Category scores
  const catScores: Partial<Record<ExerciseCategory, number[]>> = {}
  plan.exercises.forEach((ex, i) => {
    if (!catScores[ex.category]) catScores[ex.category] = []
    catScores[ex.category]!.push(scores[i]?.focusStabilityScore ?? 0)
  })

  let strongestCat: ExerciseCategory = plan.exercises[0]?.category ?? 'sakkadik'
  let weakestCat:   ExerciseCategory = plan.weakestCategory
  let highestAvg    = 0
  let lowestAvg     = Infinity

  for (const [cat, vals] of Object.entries(catScores) as [ExerciseCategory, number[]][]) {
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length
    if (avg > highestAvg) { highestAvg = avg; strongestCat = cat }
    if (avg < lowestAvg)  { lowestAvg  = avg; weakestCat  = cat }
  }

  // Cognitive score delta (simple estimate: avg improvement vs 60 baseline)
  const cogDelta = avgScore - 60

  const strong = CATEGORY_META[strongestCat]
  const weak   = CATEGORY_META[weakestCat]

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Başlık */}
      <Text style={s.heading}>Antrenman Tamamlandı! 🎉</Text>

      {/* XP hero */}
      <View style={s.xpCard}>
        <Text style={s.xpLabel}>Toplam XP</Text>
        <Text style={s.xpValue}>+{totalXp}</Text>
        <Text style={s.xpSub}>En İyi Not: {bestGrade} · Ort. Skor: {avgScore}</Text>
      </View>

      {/* Güçlü / Zayıf */}
      <View style={s.row}>
        <AreaCard
          title="En Güçlü"
          icon={strong.icon}
          label={strong.label}
          color={strong.color}
          bg="#0A2A14"
        />
        <AreaCard
          title="Gelişim Alanı"
          icon={weak.icon}
          label={weak.label}
          color={weak.color}
          bg="#1A0A2A"
        />
      </View>

      {/* Bilişsel skor */}
      <View style={[s.deltaCard, { borderColor: cogDelta >= 0 ? '#10B981' : '#EF4444' }]}>
        <Text style={s.deltaTitle}>🧠 Bilişsel Skor Deltası</Text>
        <Text style={[s.deltaValue, { color: cogDelta >= 0 ? '#10B981' : '#EF4444' }]}>
          {cogDelta >= 0 ? '+' : ''}{cogDelta} puan
        </Text>
        <Text style={s.deltaSub}>
          {cogDelta >= 10
            ? 'Mükemmel performans!'
            : cogDelta >= 0
            ? 'Dengede kaldın.'
            : 'Yarın daha iyi olacak.'}
        </Text>
      </View>

      {/* Streak */}
      <View style={s.streakCard}>
        <Text style={s.streakIcon}>🔥</Text>
        <View>
          <Text style={s.streakVal}>{streakDays} günlük seri</Text>
          <Text style={s.streakSub}>Antrenmanın işlendi!</Text>
        </View>
      </View>

      {/* Egzersiz kartları */}
      <Text style={s.sectionLbl}>BUGÜNKÜ EGZERSİZLER</Text>
      {plan.exercises.map((ex, i) => {
        const sc = scores[i]
        const meta = CATEGORY_META[ex.category]
        return (
          <View key={ex.exerciseId} style={[s.exRow, { borderColor: meta.color + '30' }]}>
            <View style={[s.exNum, { backgroundColor: meta.color + '20' }]}>
              <Text style={[s.exNumTxt, { color: meta.color }]}>{i + 1}</Text>
            </View>
            <View style={s.exInfo}>
              <Text style={s.exTitle} numberOfLines={1}>{ex.exerciseId.replace(/_/g, ' ')}</Text>
              <Text style={[s.exCat, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
            </View>
            {sc && (
              <View style={s.exScore}>
                <Text style={[s.exGrade, { color: GRADE_COLORS[sc.grade] }]}>{sc.grade}</Text>
                <Text style={s.exXp}>+{sc.xpEarned} XP</Text>
              </View>
            )}
          </View>
        )
      })}

      {/* Bitir */}
      <TouchableOpacity style={s.btn} onPress={onFinish} activeOpacity={0.85}>
        <Text style={s.btnTxt}>Tamamlandı ✓</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

function AreaCard({
  title, icon, label, color, bg,
}: { title: string; icon: string; label: string; color: string; bg: string }) {
  return (
    <View style={[s.areaCard, { backgroundColor: bg, borderColor: color + '40' }]}>
      <Text style={s.areaTitle}>{title}</Text>
      <Text style={s.areaIcon}>{icon}</Text>
      <Text style={[s.areaLabel, { color }]}>{label}</Text>
    </View>
  )
}

const GRADE_COLORS: Record<string, string> = {
  S: '#F59E0B', A: '#10B981', B: '#0EA5E9', C: '#8B5CF6', D: '#EF4444',
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#0A0F1F' },
  content: { padding: 20, paddingTop: 48 },

  heading: { fontSize: 24, fontWeight: '900', color: '#E9EDEF', marginBottom: 20, textAlign: 'center' },

  xpCard: {
    backgroundColor: '#0E2A1A', borderRadius: 20, padding: 20,
    alignItems: 'center', marginBottom: 14,
    borderWidth: 1.5, borderColor: 'rgba(37,211,102,0.3)',
  },
  xpLabel: { fontSize: 12, color: '#8696A0', letterSpacing: 1, textTransform: 'uppercase' },
  xpValue: { fontSize: 52, fontWeight: '900', color: '#1877F2' },
  xpSub:   { fontSize: 12, color: '#8696A0' },

  row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  areaCard: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1,
  },
  areaTitle: { fontSize: 10, color: '#8696A0', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  areaIcon:  { fontSize: 28, marginBottom: 6 },
  areaLabel: { fontSize: 13, fontWeight: '800' },

  deltaCard: {
    backgroundColor: '#0E1628', borderRadius: 16, padding: 16,
    alignItems: 'center', marginBottom: 14, borderWidth: 1.5,
  },
  deltaTitle: { fontSize: 13, fontWeight: '700', color: '#8B5CF6', marginBottom: 6 },
  deltaValue: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  deltaSub:   { fontSize: 12, color: '#8696A0' },

  streakCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1A0E06', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', marginBottom: 20,
  },
  streakIcon: { fontSize: 32 },
  streakVal:  { fontSize: 18, fontWeight: '800', color: '#F97316' },
  streakSub:  { fontSize: 12, color: '#8696A0' },

  sectionLbl: {
    fontSize: 11, fontWeight: '700', color: '#8696A0',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  exRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0E1628', borderRadius: 14, padding: 12,
    borderWidth: 1, marginBottom: 8,
  },
  exNum: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  exNumTxt: { fontSize: 14, fontWeight: '800' },
  exInfo:   { flex: 1 },
  exTitle:  { fontSize: 13, fontWeight: '700', color: '#E9EDEF', textTransform: 'capitalize' },
  exCat:    { fontSize: 11, marginTop: 2 },
  exScore:  { alignItems: 'flex-end' },
  exGrade:  { fontSize: 20, fontWeight: '900' },
  exXp:     { fontSize: 10, color: '#1877F2' },

  btn: {
    backgroundColor: '#1877F2', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 10,
  },
  btnTxt: { fontSize: 17, fontWeight: '800', color: '#0A0F1F' },
})
