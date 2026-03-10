import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../../constants/colors'

interface Props {
  text: string
  wordCount: number
  fontSize?: number   // 14=small 17=medium(default) 20=large
  onComplete: (wpm: number) => void
  onHalfway?: () => void
}

export function TextReader({ text, wordCount, fontSize = 17, onComplete, onHalfway }: Props) {
  const [startTime] = useState(Date.now())
  const [scrollProgress, setScrollProgress] = useState(0)
  const halfwayFired = useRef(false)

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number }, contentSize: { height: number }, layoutMeasurement: { height: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const progress = (contentOffset.y + layoutMeasurement.height) / contentSize.height
    setScrollProgress(progress)

    if (!halfwayFired.current && progress >= 0.5) {
      halfwayFired.current = true
      onHalfway?.()
    }
  }

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const durationMinutes = (Date.now() - startTime) / 60000
    const wpm = Math.round(wordCount / Math.max(0.1, durationMinutes))
    onComplete(wpm)
  }

  return (
    <View style={styles.container}>
      {/* İlerleme çubuğu */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(100, scrollProgress * 100)}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.text, { fontSize, lineHeight: Math.round(fontSize * 1.65) }]}>{text}</Text>
        <View style={styles.endSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.hint}>Metni okuyunca "Bitti" butonuna bas</Text>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
          <Text style={styles.doneText}>Bitti →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  text: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.text,
    letterSpacing: 0.2,
  },
  endSpacer: {
    height: 80,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
  },
  hint: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  doneButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
})
