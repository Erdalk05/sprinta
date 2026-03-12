/**
 * ExerciseResultScreen — iOS Design
 * Zemin: #F2F2F7 · Kartlar: #FFFFFF · Aksan: #1877F2
 */

import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSoundFeedback } from '../hooks/useSoundFeedback'
import type { ExerciseScore } from '../engines/scoringEngine'
import type { VisualExerciseConfig, DifficultyLevel } from '../constants/exerciseConfig'
import type { GamificationState } from '@sprinta/api'

// ── Renk sabitleri ──────────────────────────────────────────────
const BG      = '#0F1F4B'   // Lacivert zemin (değişmez)
const PRIMARY = '#243C8F'   // Koyu mavi — kart yazıları
const ACCENT  = '#38B6D8'   // Cyan — lid şeridi + XP
const DARK    = PRIMARY     // Beyaz kartlarda koyu mavi metin
const GREY    = '#6B7A99'   // Orta ton — etiketler
const DIVIDER = '#E5ECFF'   // Açık mavi bölücü
const BLUE    = ACCENT
const BLUE_L  = ACCENT
const BLUE_D  = PRIMARY

const GRADE_COLOR: Record<ExerciseScore['grade'], string> = {
  S: '#F59E0B',   // altın
  A: '#1877F2',   // mavi
  B: '#10B981',   // yeşil
  C: '#F97316',   // turuncu
  D: '#EF4444',   // kırmızı
}

const GRADE_LABEL: Record<ExerciseScore['grade'], string> = {
  S: 'Mükemmel', A: 'Harika', B: 'İyi', C: 'Geliştirilmeli', D: 'Tekrar Dene',
}

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  1: 'Başlangıç', 2: 'Orta', 3: 'İleri', 4: 'Uzman',
}

const MILESTONES = [
  { stars: 20,  label: 'Başlangıç', badge: '🦅' },
  { stars: 50,  label: 'Usta',      badge: '🏆' },
  { stars: 100, label: 'Efsane',    badge: '💎' },
]

interface ExerciseResultScreenProps {
  score:     ExerciseScore
  config:    VisualExerciseConfig
  level:     DifficultyLevel
  onRetry:   () => void
  onExit:    () => void
  gamState?: GamificationState | null
}

export const ExerciseResultScreen: React.FC<ExerciseResultScreenProps> = ({
  score, config, level, onRetry, onExit, gamState,
}) => {
  const { playComplete } = useSoundFeedback()
  const gradeColor  = GRADE_COLOR[score.grade]
  const errorPct    = Math.round(score.errorRate * 100)
  const errorColor  = score.errorRate > 0.25 ? '#EF4444' : '#10B981'
  const totalStars  = gamState?.stats.totalStars ?? 0

  useEffect(() => {
    const id = setTimeout(() => playComplete(), 300)
    return () => clearTimeout(id)
  }, [])

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >

      {/* ── 1. HEADER: Grade dairesi + egzersiz adı ─────────────── */}
      <View style={s.card}>
        <View style={s.headerRow}>
          {/* Grade dairesi */}
          <View style={[s.gradeCircle, {
            borderColor: gradeColor,
            shadowColor: gradeColor,
          }]}>
            <Text style={[s.gradeLetter, { color: gradeColor }]}>{score.grade}</Text>
          </View>

          {/* Sağ taraf: isim + seviye + yıldızlar */}
          <View style={s.headerInfo}>
            <View style={[s.gradePill, { backgroundColor: gradeColor + '18' }]}>
              <Text style={[s.gradePillTxt, { color: gradeColor }]}>
                {GRADE_LABEL[score.grade]}
              </Text>
            </View>
            <Text style={s.exerciseName} numberOfLines={2}>{config.titleTR}</Text>
            <Text style={s.levelTxt}>Seviye {level} · {LEVEL_LABELS[level]}</Text>
            {gamState && gamState.newStars > 0 && (
              <View style={s.starsRow}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Text key={i} style={s.starIcon}>
                    {i < gamState.newStars ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── 2. STATS: 4 metrik ──────────────────────────────────── */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Performans</Text>
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: '#10B981' }]}>{score.focusStabilityScore}%</Text>
            <Text style={s.statLbl}>Odak</Text>
          </View>
          <View style={s.divider} />
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: BLUE }]}>{score.reactionTimeMs}<Text style={s.statUnit}> ms</Text></Text>
            <Text style={s.statLbl}>Tepki</Text>
          </View>
          <View style={s.divider} />
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: errorColor }]}>{errorPct}%</Text>
            <Text style={s.statLbl}>Hata</Text>
          </View>
          <View style={s.divider} />
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: gradeColor }]}>{Math.round(score.baseScore)}</Text>
            <Text style={s.statLbl}>Skor</Text>
          </View>
        </View>
      </View>

      {/* ── 3. GAMİFİKASYON: XP + günlük + seri + toplam ────────── */}
      <View style={s.card}>
        <Text style={s.cardLabel}>İlerleme</Text>
        <View style={s.statsRow}>
          {/* XP */}
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: BLUE }]}>+{score.xpEarned}</Text>
            <Text style={s.statLbl}>XP ⚡</Text>
          </View>
          <View style={s.divider} />
          {/* Bugün */}
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: '#F59E0B' }]}>{gamState?.daily.starsToday ?? 0}/3</Text>
            <Text style={s.statLbl}>Bugün ⭐</Text>
          </View>
          <View style={s.divider} />
          {/* Seri */}
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: '#F97316' }]}>{gamState?.streak.currentStreak ?? 0}</Text>
            <Text style={s.statLbl}>Seri 🔥</Text>
          </View>
          <View style={s.divider} />
          {/* Toplam */}
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: '#F59E0B' }]}>{totalStars}</Text>
            <Text style={s.statLbl}>Toplam ⭐</Text>
          </View>
        </View>
      </View>

      {/* ── 4. MİLESTONELAR ─────────────────────────────────────── */}
      <View style={s.milestoneRow}>
        {MILESTONES.map((m) => {
          const unlocked = totalStars >= m.stars
          return (
            <View
              key={m.stars}
              style={[s.milestoneBadge, unlocked && s.milestoneBadgeUnlocked]}
            >
              <Text style={s.milestoneIcon}>{unlocked ? m.badge : '🔒'}</Text>
              <Text style={[s.milestoneLabel, unlocked && { color: '#F59E0B' }]}>
                {m.label}
              </Text>
              <Text style={[s.milestoneStars, unlocked && { color: '#F59E0B', fontWeight: '700' as const }]}>
                {m.stars} ⭐
              </Text>
            </View>
          )
        })}
      </View>

      {/* ── 5. ARP KATKISI ───────────────────────────────────────── */}
      <View style={[s.card, s.arpCard]}>
        <Text style={s.arpIcon}>📈</Text>
        <Text style={s.arpText} numberOfLines={2}>{config.readingBenefitTR}</Text>
      </View>

      {/* ── 6. BUTONLAR ──────────────────────────────────────────── */}
      <TouchableOpacity style={s.retryWrap} onPress={onRetry} activeOpacity={0.85}>
        <LinearGradient
          colors={[BLUE_L, BLUE_D]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.retryBtn}
        >
          <Text style={s.retryTxt}>↺  Tekrar Dene</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={s.exitBtn} onPress={onExit} activeOpacity={0.7}>
        <Text style={s.exitTxt}>Ana Menüye Dön</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

// ── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: BG },
  content: { padding: 16, paddingBottom: 32, gap: 12 },

  // Kart — beyaz + mavi derinlik (lid efekti)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: DIVIDER,
    borderTopWidth: 3,
    borderTopColor: ACCENT,
    shadowColor: PRIMARY,
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 7,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: GREY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  gradeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 6,
  },
  gradeLetter: { fontSize: 38, fontWeight: '900' as const },
  headerInfo:  { flex: 1, gap: 4 },
  gradePill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  gradePillTxt:  { fontSize: 11, fontWeight: '700' as const },
  exerciseName:  { fontSize: 16, fontWeight: '700' as const, color: PRIMARY, lineHeight: 21 },
  levelTxt:      { fontSize: 12, color: GREY },
  starsRow:      { flexDirection: 'row', gap: 2, marginTop: 2 },
  starIcon:      { fontSize: 14 },

  // Stats / Gamification
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  statVal:  { fontSize: 20, fontWeight: '800' as const, color: PRIMARY },
  statUnit: { fontSize: 12, fontWeight: '400' as const },
  statLbl:  { fontSize: 10, color: GREY, fontWeight: '500' as const },
  divider:  { width: StyleSheet.hairlineWidth, height: 36, backgroundColor: DIVIDER },

  // Milestones
  milestoneRow: { flexDirection: 'row', gap: 10 },
  milestoneBadge: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
    shadowColor: PRIMARY,
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: DIVIDER,
    borderTopWidth: 3,
    borderTopColor: ACCENT,
  },
  milestoneBadgeUnlocked: {
    borderTopColor: '#F59E0B',
    borderColor: '#F59E0B40',
    backgroundColor: '#FFFBF0',
  },
  milestoneIcon:  { fontSize: 22 },
  milestoneLabel: { fontSize: 11, color: GREY, fontWeight: '600' as const, textAlign: 'center' },
  milestoneStars: { fontSize: 10, color: GREY },

  // ARP
  arpCard: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  arpIcon: { fontSize: 18, flexShrink: 0 },
  arpText: { flex: 1, fontSize: 12, color: GREY, lineHeight: 17 },

  // Buttons
  retryWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  retryBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryTxt: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF', letterSpacing: 0.2 },
  exitBtn:  { paddingVertical: 12, alignItems: 'center' },
  exitTxt:  { fontSize: 15, color: BLUE, fontWeight: '500' as const },
})
