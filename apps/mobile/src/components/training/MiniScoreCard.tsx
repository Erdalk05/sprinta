/**
 * MiniScoreCard — Egzersiz arası kısa skor ekranı
 * 2.5 saniye sonra otomatik "Devam Et"
 */

import React, { useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native'
import type { ExerciseScore } from '../../features/visual-mechanics/engines/scoringEngine'
import type { ExerciseCategory } from '../../services/dailyTrainingEngine'
import { CATEGORY_META } from '../../services/dailyTrainingEngine'

const { width: W } = Dimensions.get('window')

const GRADE_COLORS: Record<string, string> = {
  S: '#F59E0B', A: '#10B981', B: '#0EA5E9', C: '#8B5CF6', D: '#EF4444',
}

const MOTIVATIONAL: Record<string, string> = {
  S: 'Olağanüstü! Tam kontrol. 🔥',
  A: 'Harika! Odak güçleniyor. 💪',
  B: 'İyi gidiyor, devam et! 👏',
  C: 'Gelişiyorsun, pes etme. 💡',
  D: 'Her seans bir adım ileri. 🌱',
}

interface Props {
  score:         ExerciseScore
  exerciseTitle: string
  category:      ExerciseCategory
  exerciseNum:   number    // 1-4
  totalExercises: number
  onContinue:    () => void
}

export default function MiniScoreCard({
  score, exerciseTitle, category, exerciseNum, totalExercises, onContinue,
}: Props) {
  const catMeta    = CATEGORY_META[category]
  const gradeColor = GRADE_COLORS[score.grade] ?? '#8B5CF6'

  // 2.5s sonra otomatik devam
  useEffect(() => {
    const t = setTimeout(onContinue, 2500)
    return () => clearTimeout(t)
  }, [onContinue])

  return (
    <View style={s.overlay}>
      <View style={s.card}>

        {/* İlerleme */}
        <View style={s.progress}>
          {Array.from({ length: totalExercises }).map((_, i) => (
            <View
              key={i}
              style={[s.dot, i < exerciseNum && { backgroundColor: '#25D366' }]}
            />
          ))}
        </View>

        {/* Grade büyük */}
        <View style={[s.gradeBadge, { borderColor: gradeColor }]}>
          <Text style={[s.gradeText, { color: gradeColor }]}>{score.grade}</Text>
        </View>

        {/* Başlık */}
        <Text style={s.title} numberOfLines={1}>{exerciseTitle}</Text>
        <Text style={[s.catLabel, { color: catMeta.color }]}>
          {catMeta.icon} {catMeta.label}
        </Text>

        {/* Metrikler */}
        <View style={s.metricsRow}>
          <MetricChip label="Tepki" value={`${score.reactionTimeMs}ms`} color="#0EA5E9" />
          <MetricChip label="Doğruluk" value={`${Math.round((1 - score.errorRate) * 100)}%`} color="#10B981" />
          <MetricChip label="Skor" value={`${score.focusStabilityScore}`} color="#8B5CF6" />
        </View>

        {/* XP */}
        <View style={s.xpRow}>
          <Text style={s.xpLabel}>+</Text>
          <Text style={s.xpValue}>{score.xpEarned}</Text>
          <Text style={s.xpLabel}> XP kazanıldı</Text>
        </View>

        {/* Motivasyonel mesaj */}
        <Text style={s.motive}>{MOTIVATIONAL[score.grade]}</Text>

        {/* Devam Et */}
        <TouchableOpacity style={s.btn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={s.btnTxt}>
            {exerciseNum < totalExercises ? 'Devam Et  →' : 'Sonuçları Gör  →'}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[s.chip, { borderColor: color + '40' }]}>
      <Text style={[s.chipVal, { color }]}>{value}</Text>
      <Text style={s.chipLbl}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0A0F1F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: W - 40,
    backgroundColor: '#0E1628',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.15)',
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 24, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  gradeBadge: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  gradeText:  { fontSize: 36, fontWeight: '900' },
  title:      { fontSize: 16, fontWeight: '800', color: '#E9EDEF', marginBottom: 4, textAlign: 'center' },
  catLabel:   { fontSize: 12, fontWeight: '700', marginBottom: 16 },
  metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    flex: 1, alignItems: 'center', padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, borderWidth: 1,
  },
  chipVal: { fontSize: 16, fontWeight: '800' },
  chipLbl: { fontSize: 10, color: '#8696A0', marginTop: 2 },
  xpRow:    { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  xpLabel:  { fontSize: 14, color: '#8696A0' },
  xpValue:  { fontSize: 28, fontWeight: '900', color: '#25D366' },
  motive:   { fontSize: 13, color: '#8696A0', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  btn: {
    width: '100%', backgroundColor: '#00F5FF',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  btnTxt: { fontSize: 15, fontWeight: '800', color: '#0A0F1F' },
})
