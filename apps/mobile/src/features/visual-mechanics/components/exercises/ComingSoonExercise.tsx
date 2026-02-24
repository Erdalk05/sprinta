/**
 * ComingSoonExercise — Stub egzersizler için paylaşılan "Yakında" bileşeni
 * 14 stub egzersiz bu bileşeni kullanır; her biri v1.2'de tam implement edilecek.
 */

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { ExerciseProps } from '../../../../components/exercises/types'

const NEON_CYAN = '#00F5FF'
const DARK_BG = '#0A0F1F'

interface ComingSoonExerciseProps extends ExerciseProps {
  title: string
}

export const ComingSoonExercise: React.FC<ComingSoonExerciseProps> = ({ title, onExit }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>👁️</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.soon}>Yakında — v1.2</Text>
    <TouchableOpacity style={styles.btn} onPress={onExit}>
      <Text style={styles.btnText}>Geri Dön</Text>
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: NEON_CYAN,
    textAlign: 'center',
  },
  soon: {
    fontSize: 14,
    color: '#8696A0',
  },
  btn: {
    marginTop: 24,
    backgroundColor: 'rgba(0,245,255,0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.25)',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: NEON_CYAN,
  },
})
