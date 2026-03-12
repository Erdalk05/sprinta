import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, ScrollView } from 'react-native'
import { useEffect, useRef } from 'react'
import * as Haptics from 'expo-haptics'
import { colors } from '../../constants/colors'
import { RARITY_COLORS, RARITY_LABELS } from '../../constants/levels'
import type { Badge } from '@sprinta/api'

const ICON_MAP: Record<string, string> = {
  'play-circle': '▶️', 'flame': '🔥', 'trophy': '🏆',
  'trending-up': '📈', 'check-circle': '✅', 'star': '⭐',
  'award': '🥇', 'brain': '🧠', 'clipboard': '📋',
}

interface Props {
  visible: boolean
  badges: Badge[]
  onClose: () => void
}

export function BadgeAwardModal({ visible, badges, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible && badges.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200)
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start()
    } else {
      scaleAnim.setValue(0.6)
      opacityAnim.setValue(0)
    }
  }, [visible])

  if (badges.length === 0) return null

  const totalXp = badges.reduce((sum, b) => sum + b.xpReward, 0)

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Text style={styles.title}>
            {badges.length === 1 ? '🎖️ Yeni Rozet!' : `🎖️ ${badges.length} Yeni Rozet!`}
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.badgeList}
            showsVerticalScrollIndicator={false}
          >
            {badges.map((badge) => {
              const rarityColor = RARITY_COLORS[badge.rarity] ?? colors.textSecondary
              const icon = ICON_MAP[badge.iconName] ?? '🎖️'

              return (
                <View key={badge.id} style={[styles.badgeRow, { borderColor: badge.color + '40' }]}>
                  <View style={[styles.badgeIcon, { backgroundColor: badge.color + '20' }]}>
                    <Text style={styles.badgeEmoji}>{icon}</Text>
                  </View>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDesc}>{badge.description}</Text>
                    <View style={styles.badgeMeta}>
                      <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
                        <Text style={[styles.rarityText, { color: rarityColor }]}>
                          {RARITY_LABELS[badge.rarity]}
                        </Text>
                      </View>
                      <Text style={styles.xpText}>+{badge.xpReward} XP</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </ScrollView>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam XP Kazanıldı</Text>
            <Text style={styles.totalXP}>+{totalXp} XP ⭐</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Harika! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 20 },
  scroll: { width: '100%', maxHeight: 320 },
  badgeList: { gap: 12 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 28 },
  badgeInfo: { flex: 1 },
  badgeName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  badgeDesc: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, lineHeight: 16 },
  badgeMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rarityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  rarityText: { fontSize: 11, fontWeight: '700' },
  xpText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 12,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  totalXP: { fontSize: 16, fontWeight: '800', color: '#D97706' },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.white },
})
