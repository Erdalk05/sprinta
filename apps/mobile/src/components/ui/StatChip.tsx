import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

interface Props {
  label: string
  value: string | number
  icon?: string
  accent?: string
}

export function StatChip({ label, value, icon, accent = theme.colors.primary }: Props) {
  return (
    <View style={[styles.chip, { borderColor: accent + '30' }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 72,
  },
  icon: { fontSize: 18, marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  label: { fontSize: 10, color: theme.colors.textHint, textAlign: 'center' },
})
