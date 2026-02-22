import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'

interface Props {
  text: string
  targetWpm: number          // hedef okuma hızı
  chunkSize: number          // kelime başına chunk (1-3)
  onProgress: (wordsRead: number) => void
  onComplete: () => void
  onHalfway?: () => void
}

export function ChunkReader({ text, targetWpm, chunkSize, onProgress, onComplete, onHalfway }: Props) {
  const words = text.trim().split(/\s+/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const halfwayFired = React.useRef(false)

  // ms per chunk
  const msPerChunk = Math.round((60 / targetWpm) * chunkSize * 1000)

  useEffect(() => {
    if (currentIndex >= chunks.length) {
      onComplete()
      return
    }

    // Yarı kontrolü
    if (!halfwayFired.current && currentIndex >= Math.floor(chunks.length / 2)) {
      halfwayFired.current = true
      onHalfway?.()
    }

    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        const wordsInChunk = chunks[currentIndex].split(' ').length
        onProgress(wordsInChunk)
        setCurrentIndex((prev) => prev + 1)
      }, 100) // kısa flash arası
    }, msPerChunk)

    return () => clearTimeout(timer)
  }, [currentIndex])

  const progress = currentIndex / chunks.length

  return (
    <View style={styles.container}>
      {/* İlerleme çubuğu */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Chunk gösterimi */}
      <View style={styles.chunkArea}>
        <Text style={[styles.chunk, { opacity: visible ? 1 : 0 }]}>
          {currentIndex < chunks.length ? chunks[currentIndex] : ''}
        </Text>
      </View>

      {/* İstatistikler */}
      <View style={styles.stats}>
        <Text style={styles.statText}>{currentIndex} / {chunks.length}</Text>
        <Text style={styles.statText}>{targetWpm} kelime/dk</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#6C3EE8',
    borderRadius: 2,
  },
  chunkArea: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chunk: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  stats: {
    position: 'absolute',
    bottom: 32,
    flexDirection: 'row',
    gap: 32,
  },
  statText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
})
