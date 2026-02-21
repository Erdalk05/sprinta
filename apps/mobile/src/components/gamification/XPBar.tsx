import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'
import { getLevelFromXP, getXPProgress, getLevelInfo } from '../../constants/levels'

interface Props {
  totalXp: number
  compact?: boolean
}

export function XPBar({ totalXp, compact = false }: Props) {
  const level = getLevelFromXP(totalXp)
  const { current, needed, progress } = getXPProgress(totalXp)
  const info = getLevelInfo(level)

  if (compact) {
    return (
      <View style={styles.compact}>
        <View style={[styles.levelBadgeCompact, { backgroundColor: info.color }]}>
          <Text style={styles.levelTextCompact}>{level}</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.compactTitle}>{info.title}</Text>
          <View style={styles.trackCompact}>
            <View style={[styles.fillCompact, { width: `${progress * 100}%`, backgroundColor: info.color }]} />
          </View>
        </View>
        <Text style={styles.compactXP}>{current}/{needed}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.levelBadge, { backgroundColor: info.color }]}>
          <Text style={styles.levelNumber}>{level}</Text>
          <Text style={styles.levelLabel}>SEV</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{info.title}</Text>
          <Text style={styles.xpText}>
            {current.toLocaleString('tr')} / {needed.toLocaleString('tr')} XP
          </Text>
        </View>
        <Text style={styles.totalXP}>{totalXp.toLocaleString('tr')} XP</Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${progress * 100}%`, backgroundColor: info.color },
          ]}
        />
      </View>

      {level < 20 && (
        <Text style={styles.nextLevel}>
          Sonraki seviye: {(needed - current).toLocaleString('tr')} XP kaldı
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    lineHeight: 22,
  },
  levelLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  xpText: { fontSize: 12, color: colors.textSecondary },
  totalXP: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: { height: 10, borderRadius: 5 },
  nextLevel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 6,
    textAlign: 'right',
  },
  // compact
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  levelBadgeCompact: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelTextCompact: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.white,
  },
  compactRight: { flex: 1, gap: 4 },
  compactTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  trackCompact: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fillCompact: { height: 6, borderRadius: 3 },
  compactXP: { fontSize: 11, color: colors.textTertiary, fontVariant: ['tabular-nums'] },
})
