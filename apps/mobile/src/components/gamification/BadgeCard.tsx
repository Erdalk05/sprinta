import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors } from '../../constants/colors'
import { RARITY_COLORS, RARITY_LABELS } from '../../constants/levels'
import type { Badge } from '@sprinta/api'

const ICON_MAP: Record<string, string> = {
  'play-circle':   '▶️',
  'flame':         '🔥',
  'trophy':        '🏆',
  'trending-up':   '📈',
  'check-circle':  '✅',
  'star':          '⭐',
  'award':         '🥇',
  'brain':         '🧠',
  'clipboard':     '📋',
}

interface Props {
  badge: Badge
  earned?: boolean
  onPress?: () => void
  size?: 'small' | 'medium' | 'large'
}

export function BadgeCard({ badge, earned = false, onPress, size = 'medium' }: Props) {
  const rarityColor = RARITY_COLORS[badge.rarity] ?? colors.textSecondary
  const icon = ICON_MAP[badge.iconName] ?? '🎖️'
  const isSmall = size === 'small'
  const isLarge = size === 'large'

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSmall && styles.cardSmall,
        isLarge && styles.cardLarge,
        !earned && styles.cardLocked,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Rozet ikonu */}
      <View style={[
        styles.iconContainer,
        { backgroundColor: earned ? badge.color + '25' : colors.border },
        isSmall && styles.iconSmall,
        isLarge && styles.iconLarge,
      ]}>
        <Text style={[styles.icon, isSmall && styles.iconTextSmall, isLarge && styles.iconTextLarge]}>
          {earned ? icon : '🔒'}
        </Text>
      </View>

      {/* Bilgi */}
      <View style={styles.info}>
        <Text
          style={[styles.name, isSmall && styles.nameSmall, !earned && styles.nameLocked]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>

        {!isSmall && (
          <>
            <Text style={[styles.desc, !earned && styles.descLocked]} numberOfLines={2}>
              {badge.description}
            </Text>
            <View style={styles.footer}>
              <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
                <Text style={[styles.rarityText, { color: rarityColor }]}>
                  {RARITY_LABELS[badge.rarity] ?? badge.rarity}
                </Text>
              </View>
              {earned && (
                <Text style={styles.xpReward}>+{badge.xpReward} XP</Text>
              )}
              {!earned && (
                <Text style={styles.locked}>Kilitli</Text>
              )}
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSmall: {
    padding: 10,
    gap: 8,
    borderRadius: 12,
  },
  cardLarge: {
    padding: 20,
    gap: 16,
  },
  cardLocked: {
    opacity: 0.55,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmall: { width: 36, height: 36, borderRadius: 10 },
  iconLarge: { width: 72, height: 72, borderRadius: 18 },
  icon: { fontSize: 26 },
  iconTextSmall: { fontSize: 18 },
  iconTextLarge: { fontSize: 36 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  nameSmall: { fontSize: 12, marginBottom: 0 },
  nameLocked: { color: colors.textTertiary },
  desc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginBottom: 8 },
  descLocked: { color: colors.textTertiary },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rarityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  rarityText: { fontSize: 11, fontWeight: '700' },
  xpReward: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  locked: { fontSize: 11, color: colors.textTertiary },
})
