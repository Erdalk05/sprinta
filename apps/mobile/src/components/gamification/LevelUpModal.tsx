import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import * as Haptics from 'expo-haptics'
import { colors } from '../../constants/colors'
import { getLevelInfo } from '../../constants/levels'

interface Props {
  visible: boolean
  fromLevel: number
  toLevel: number
  onClose: () => void
}

export function LevelUpModal({ visible, fromLevel, toLevel, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const info = getLevelInfo(toLevel)

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start()
    } else {
      scaleAnim.setValue(0.5)
      opacityAnim.setValue(0)
    }
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Text style={styles.emoji}>⬆️</Text>
          <Text style={styles.levelUpText}>SEVİYE ATLADI!</Text>

          <View style={[styles.levelBadge, { backgroundColor: info.color }]}>
            <Text style={styles.levelNumber}>{toLevel}</Text>
          </View>

          <Text style={styles.levelTitle}>{info.title}</Text>
          <Text style={styles.levelChange}>
            Seviye {fromLevel} → Seviye {toLevel}
          </Text>
          <Text style={styles.congrats}>
            Tebrikler! Performansın giderek güçleniyor. 💪
          </Text>

          <TouchableOpacity style={[styles.button, { backgroundColor: info.color }]} onPress={onClose}>
            <Text style={styles.buttonText}>Devam Et</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  emoji: { fontSize: 48 },
  levelUpText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textTertiary,
    letterSpacing: 2,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  levelNumber: { fontSize: 40, fontWeight: '900', color: colors.white },
  levelTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  levelChange: { fontSize: 14, color: colors.textSecondary },
  congrats: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.white },
})
