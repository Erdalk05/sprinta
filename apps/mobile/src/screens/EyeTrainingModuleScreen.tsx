/**
 * EyeTrainingModuleScreen — Kartal Gözü Ana Ekranı
 *
 * 3 kategori section:
 *   - Göz Atlaması (Sakkadik)  #1877F2
 *   - Çevresel Görüş (Periferik) #00B890
 *   - Göz Takibi (Smooth Pursuit)    #FF9F1C
 * + Boss kart (full-width, #002D62)
 *
 * 8 egzersiz tamamlanınca boss açılır.
 */
import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAppTheme } from '../theme/useAppTheme'
import type { AppTheme } from '../theme'
import { useEyeTrainingStore } from '../stores/eyeTrainingStore'
import {
  EYE_EXERCISE_CONFIGS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@sprinta/shared'
import type { CategoryType, EyeExerciseConfig } from '@sprinta/shared'

const { width: SW } = Dimensions.get('window')
const CARD_W = (SW - 48) / 2  // 2 kolon, 16px kenar + 16px boşluk

// ─── Kategori sırası ──────────────────────────────────────────────
const CATEGORIES: CategoryType[] = ['saccadic', 'peripheral', 'tracking']

// ─── Egzersiz Kartı ───────────────────────────────────────────────
function ExerciseCard({
  config,
  categoryColor,
  completed,
  onPress,
}: {
  config: EyeExerciseConfig
  categoryColor: string
  completed: boolean
  onPress: () => void
}) {
  const DIFF_DOTS = ['●', '●', '●', '●'].map((d, i) => ({
    key: i,
    filled: i < config.difficulty,
  }))

  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Kategori renk şeridi */}
      <View style={[styles.cardLid, { backgroundColor: categoryColor }]}>
        <Text style={styles.cardLidText}>{config.durationSeconds}sn</Text>
        {completed && <Text style={styles.cardCheckmark}>✓</Text>}
      </View>

      {/* İçerik */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{config.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{config.description}</Text>

        {/* Zorluk + XP */}
        <View style={styles.cardFooter}>
          <View style={styles.diffRow}>
            {DIFF_DOTS.map((d) => (
              <Text
                key={d.key}
                style={[
                  styles.diffDot,
                  { color: d.filled ? categoryColor : '#C5C5C5' },
                ]}
              >
                ●
              </Text>
            ))}
          </View>
          <Text style={[styles.cardXp, { color: categoryColor }]}>+{config.xpReward} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ─── Kategori Bölümü ──────────────────────────────────────────────
function CategorySection({
  category,
  exercises,
  completedSet,
  onExercisePress,
}: {
  category: CategoryType
  exercises: EyeExerciseConfig[]
  completedSet: Set<string>
  onExercisePress: (id: string) => void
}) {
  const color = CATEGORY_COLORS[category]
  const label = CATEGORY_LABELS[category]
  const completedCount = exercises.filter(e => completedSet.has(e.id)).length

  return (
    <View style={styles.section}>
      {/* Başlık şeridi */}
      <View style={[styles.sectionHeader, { backgroundColor: color }]}>
        <Text style={styles.sectionTitle}>{label}</Text>
        <Text style={styles.sectionProgress}>{completedCount}/{exercises.length}</Text>
      </View>

      {/* 2 kolon grid */}
      <View style={styles.grid}>
        {exercises.map((cfg) => (
          <ExerciseCard
            key={cfg.id}
            config={cfg}
            categoryColor={color}
            completed={completedSet.has(cfg.id)}
            onPress={() => onExercisePress(cfg.id)}
          />
        ))}
      </View>
    </View>
  )
}

// ─── Boss Kart ────────────────────────────────────────────────────
function BossCard({
  unlocked,
  completedCount,
  onPress,
}: {
  unlocked: boolean
  completedCount: number
  onPress: () => void
}) {
  const BOSS_REQUIRED = 8

  return (
    <View style={styles.bossCard}>
      <View style={styles.bossHeader}>
        <Text style={styles.bossTrophy}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bossTitle}>Kartal Meydan Okuması</Text>
          <Text style={styles.bossSubtitle}>
            Göz Atlama (Sakkadik) + Çevresel Görüş + Takip + Flash — 4 faz
          </Text>
        </View>
        <Text style={styles.bossDuration}>50sn</Text>
      </View>

      {/* Kilitli / Açık */}
      {unlocked ? (
        <TouchableOpacity
          style={styles.bossBtn}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.bossBtnText}>⚔️ Meydan Oku</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.bossLocked}>
          <Text style={styles.bossLockIcon}>🔒</Text>
          <Text style={styles.bossLockText}>
            {completedCount}/{BOSS_REQUIRED} egzersiz tamamla
          </Text>
          <View style={styles.bossLockBar}>
            <View
              style={[
                styles.bossLockFill,
                { width: `${(completedCount / BOSS_REQUIRED) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      <Text style={styles.bossXp}>+150 XP · +12 ARP</Text>
    </View>
  )
}

// ─── Ana Ekran ────────────────────────────────────────────────────
export default function EyeTrainingModuleScreen() {
  const router = useRouter()
  const { completedExercises, bossUnlocked } = useEyeTrainingStore()
  const completedSet = useMemo(() => new Set(completedExercises), [completedExercises])

  // Kategori bazlı egzersizler
  const byCategory = useMemo(() => {
    const map: Partial<Record<CategoryType, EyeExerciseConfig[]>> = {}
    for (const cfg of EYE_EXERCISE_CONFIGS) {
      if (cfg.isBoss) continue
      if (!map[cfg.category]) map[cfg.category] = []
      map[cfg.category]!.push(cfg)
    }
    return map
  }, [])

  const bossConfig = useMemo(
    () => EYE_EXERCISE_CONFIGS.find(c => c.isBoss),
    []
  )

  const totalCompleted = completedSet.size
  const total = EYE_EXERCISE_CONFIGS.filter(c => !c.isBoss).length

  function handleExercisePress(id: string) {
    router.push(`/exercise/eye_training/${id}`)
  }

  function handleBossPress() {
    if (bossConfig) {
      router.push(`/exercise/eye_training/${bossConfig.id}`)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>👁 Kartal Gözü</Text>
            <Text style={styles.headerSub}>Göz Antrenman Modülü</Text>
          </View>

          {/* XP chip */}
          <View style={styles.xpChip}>
            <Text style={styles.xpText}>⚡ {totalCompleted * 35} XP</Text>
          </View>
        </View>

        {/* ── İlerleme ───────────────────────────────────────── */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {totalCompleted}/{total} egzersiz tamamlandı
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(totalCompleted / total) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* ── Kategoriler ────────────────────────────────────── */}
        {CATEGORIES.map((cat) => {
          const exercises = byCategory[cat] ?? []
          if (exercises.length === 0) return null
          return (
            <CategorySection
              key={cat}
              category={cat}
              exercises={exercises}
              completedSet={completedSet}
              onExercisePress={handleExercisePress}
            />
          )
        })}

        {/* ── Boss Kart ──────────────────────────────────────── */}
        <BossCard
          unlocked={bossUnlocked}
          completedCount={totalCompleted}
          onPress={handleBossPress}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
const BG = '#0F1F4B'

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 16,
    paddingTop:      16,
    paddingBottom:   12,
    gap:             8,
  },
  backBtn: {
    width:          40,
    height:         40,
    borderRadius:   20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems:     'center',
    justifyContent: 'center',
  },
  backArrow: {
    color:    '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
  },
  headerTitle: {
    color:      '#FFFFFF',
    fontSize:   22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSub: {
    color:    'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 1,
  },
  xpChip: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius:    20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth:     1,
    borderColor:     'rgba(255,215,0,0.35)',
  },
  xpText: {
    color:      '#FFD700',
    fontSize:   13,
    fontWeight: '700',
  },

  // ── İlerleme ────────────────────────────────────────────────────
  progressRow: {
    paddingHorizontal: 16,
    marginBottom:      16,
  },
  progressLabel: {
    color:        'rgba(255,255,255,0.65)',
    fontSize:     12,
    marginBottom: 6,
  },
  progressBar: {
    height:          6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius:    3,
    overflow:        'hidden',
  },
  progressFill: {
    height:          6,
    backgroundColor: '#40C8F0',
    borderRadius:    3,
  },

  // ── Section ─────────────────────────────────────────────────────
  section: {
    marginHorizontal: 16,
    marginBottom:     20,
    borderRadius:     14,
    overflow:         'hidden',
    backgroundColor: '#162040',
  },
  sectionHeader: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionTitle: {
    color:       '#FFFFFF',
    fontSize:    13,
    fontWeight:  '800',
    letterSpacing: 1.2,
    flex:        1,
  },
  sectionProgress: {
    color:      'rgba(255,255,255,0.75)',
    fontSize:   12,
    fontWeight: '700',
  },

  // ── Grid ────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    padding:       8,
    gap:           8,
  },

  // ── Egzersiz Kartı ──────────────────────────────────────────────
  card: {
    width:           CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius:    10,
    overflow:        'hidden',
  },
  cardCompleted: {
    opacity: 0.72,
  },
  cardLid: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 10,
    paddingVertical:  6,
  },
  cardLidText: {
    color:      'rgba(255,255,255,0.85)',
    fontSize:   11,
    fontWeight: '700',
  },
  cardCheckmark: {
    color:      '#FFFFFF',
    fontSize:   13,
    fontWeight: '900',
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    color:        '#1A1A2E',
    fontSize:     13,
    fontWeight:   '700',
    marginBottom: 3,
    lineHeight:   18,
  },
  cardDesc: {
    color:        '#64748B',
    fontSize:     11,
    lineHeight:   15,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  diffRow: {
    flexDirection: 'row',
    gap:           2,
  },
  diffDot: {
    fontSize: 8,
  },
  cardXp: {
    fontSize:   11,
    fontWeight: '700',
  },

  // ── Boss Kart ───────────────────────────────────────────────────
  bossCard: {
    marginHorizontal: 16,
    backgroundColor:  '#002D62',
    borderRadius:     16,
    padding:          18,
    borderWidth:      1,
    borderColor:      'rgba(255,215,0,0.25)',
  },
  bossHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    marginBottom:  14,
  },
  bossTrophy: {
    fontSize: 32,
  },
  bossTitle: {
    color:      '#FFFFFF',
    fontSize:   17,
    fontWeight: '800',
  },
  bossSubtitle: {
    color:     'rgba(255,255,255,0.6)',
    fontSize:  11,
    marginTop: 3,
    lineHeight: 15,
  },
  bossDuration: {
    color:      '#FFD700',
    fontSize:   13,
    fontWeight: '700',
  },
  bossBtn: {
    backgroundColor: '#1877F2',
    borderRadius:    12,
    paddingVertical: 13,
    alignItems:      'center',
    marginBottom:    10,
  },
  bossBtnText: {
    color:      '#FFFFFF',
    fontSize:   16,
    fontWeight: '800',
  },
  bossLocked: {
    alignItems:   'center',
    marginBottom: 10,
    gap:          6,
  },
  bossLockIcon: {
    fontSize: 24,
  },
  bossLockText: {
    color:    'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  bossLockBar: {
    width:           '100%',
    height:          6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius:    3,
    overflow:        'hidden',
  },
  bossLockFill: {
    height:          6,
    backgroundColor: '#FFD700',
    borderRadius:    3,
  },
  bossXp: {
    color:     '#FFD700',
    fontSize:  12,
    fontWeight: '700',
    textAlign: 'center',
    opacity:   0.8,
  },
})
