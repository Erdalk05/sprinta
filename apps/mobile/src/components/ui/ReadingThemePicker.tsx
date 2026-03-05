import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { READING_THEMES } from '../../constants/readingThemes'
import type { ReadingThemeKey } from '../../constants/readingThemes'
import { useThemeStore } from '../../stores/themeStore'
import { useAppTheme } from '../../theme/useAppTheme'

export function ReadingThemePicker() {
  const t               = useAppTheme()
  const readingTheme    = useThemeStore((s) => s.readingTheme)
  const setReadingTheme = useThemeStore((s) => s.setReadingTheme)

  return (
    <View style={s.row}>
      {(Object.keys(READING_THEMES) as ReadingThemeKey[]).map((key) => {
        const theme  = READING_THEMES[key]
        const active = readingTheme === key
        return (
          <TouchableOpacity
            key={key}
            onPress={() => setReadingTheme(key)}
            style={[
              s.circle,
              { backgroundColor: theme.background },
              active && { borderWidth: 2, borderColor: t.colors.primary },
            ]}
            activeOpacity={0.8}
          />
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap:           10,
    alignItems:    'center',
  },
  circle: {
    width:        28,
    height:       28,
    borderRadius: 14,
    borderWidth:  1,
    borderColor:  'rgba(0,0,0,0.15)',
  },
})
