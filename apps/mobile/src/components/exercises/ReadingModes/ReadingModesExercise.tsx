/**
 * ReadingModesExercise.tsx
 * 7 okuma modu için unified exercise bileşeni.
 * 3 aşama: İçerik Seç → Aktif Okuma → Seans Sonu
 *
 * Mimari:
 *   - Her mod kendi View bileşenine sahip (hook kullanabilir)
 *   - Paylaşılan: SelectPhase + ResultView + Styles
 *   - Props: mode (ReadingModeKey) + onComplete + onExit
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Platform, Animated as RNAnimated,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../stores/authStore'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import ContentImportModal, {
  ImportedContent, saveRecentContent,
} from '../shared/ContentImportModal'
import { QuestionModal } from '../../../components/reading/QuestionModal'
import type { TextQuestion, QuestionAnswer } from '@sprinta/api'
import {
  MODE_CONFIGS, ReadingModeKey, ModeConfig,
  countWords, splitIntoParagraphs, buildAcademicLines, extractKeywords,
  buildMemoryBlocks, buildPredictionItems, buildRsvpChunks,
  calcWPM, calcARP, calcXP, formatDuration, MemoryBlock, PredictionItem,
} from './ReadingModesEngine'

// ─── Tipler ────────────────────────────────────────────────────────

export interface ReadingModesMetrics {
  mode:            ReadingModeKey
  avgWPM:          number
  totalWords:      number
  durationSeconds: number
  arpScore:        number
  xpEarned:        number
  completionRatio: number
  // mode-specific
  timedSuccess?:        boolean
  keywordsFound?:       number
  totalKeywords?:       number
  recallCorrect?:       number
  recallTotal?:         number
  predictionTotal?:     number
  paragraphsCompleted?: number
  paragraphsTotal?:     number
}

interface FinishResult {
  avgWPM:        number
  durationSec:   number
  completion:    number
  comprehension: number
  specific?:     Partial<ReadingModesMetrics>
}

interface ReadingViewProps {
  content:          ImportedContent
  config:           ModeConfig
  wpm:              number
  fontSize:         number
  onFontSizeChange: (s: number) => void
  onFinish:         (r: FinishResult) => void
  onExit:           () => void
  t:                AppTheme
  color:            string
}

// ─── Yardımcı: üst bar ────────────────────────────────────────────

function TopBar({
  title, onExit, right, color,
}: { title: string; onExit: () => void; right?: React.ReactNode; color: string }) {
  const t = useAppTheme()
  return (
    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',
      paddingHorizontal:16, paddingVertical:13, backgroundColor: t.colors.panel }}>
      <TouchableOpacity onPress={onExit}
        hitSlop={{ top:10, bottom:10, left:10, right:10 }}
        style={{ width:36, height:36, borderRadius:18,
          backgroundColor:'rgba(255,255,255,0.12)',
          alignItems:'center', justifyContent:'center' }}>
        <Text style={{ fontSize:18, color:'rgba(255,255,255,0.9)', fontWeight:'700' }}>✕</Text>
      </TouchableOpacity>
      <Text style={{ fontSize:16, fontWeight:'800', color:'#fff' }}>{title}</Text>
      {right ?? <View style={{ width:36 }} />}
    </View>
  )
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  const anim = useRef(new RNAnimated.Value(0)).current
  useEffect(() => {
    RNAnimated.timing(anim, { toValue: Math.min(1, value), duration: 300, useNativeDriver: false }).start()
  }, [value])
  const animWidth = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
  return (
    <View style={{ height:3, backgroundColor:'rgba(128,128,128,0.22)', marginHorizontal:16, overflow:'hidden', borderRadius:2 }}>
      <RNAnimated.View style={{ height:3, backgroundColor:color, borderRadius:2, width: animWidth }} />
    </View>
  )
}

// ── Okuma Kontrol Çubuğu: geçen süre + yazı boyutu ───────────────
function ReadingControlBar({ fontSize, onChange, color, t }: {
  fontSize: number
  onChange: (n: number) => void
  color:    string
  t:        AppTheme
}) {
  const mountRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.round((Date.now() - mountRef.current) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const ss = (elapsed % 60).toString().padStart(2, '0')
  return (
    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',
      paddingHorizontal:16, paddingVertical:7,
      backgroundColor: t.colors.panel,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.colors.border }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
        <Text style={{ fontSize:13, color }}>⏱</Text>
        <Text style={{ fontSize:15, fontWeight:'800', color: t.colors.text }}>
          {mm}:{ss}
        </Text>
      </View>
      <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(12, fontSize - 2))}
          hitSlop={{ top:8, bottom:8, left:8, right:8 }}
          style={{ width:32, height:32, borderRadius:8, backgroundColor: t.colors.surface,
            alignItems:'center', justifyContent:'center', borderWidth:1, borderColor: t.colors.border }}>
          <Text style={{ fontSize:14, fontWeight:'800', color: t.colors.textHint }}>A-</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:12, fontWeight:'700', color: t.colors.textHint, minWidth:34, textAlign:'center' }}>
          {fontSize}pt
        </Text>
        <TouchableOpacity
          onPress={() => onChange(Math.min(28, fontSize + 2))}
          hitSlop={{ top:8, bottom:8, left:8, right:8 }}
          style={{ width:32, height:32, borderRadius:8, backgroundColor: t.colors.surface,
            alignItems:'center', justifyContent:'center', borderWidth:1, borderColor: t.colors.border }}>
          <Text style={{ fontSize:14, fontWeight:'800', color: t.colors.text }}>A+</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ── Zamanlı Okuma: yuvarlak timer bileşeni ────────────────────────
const RING_R   = 22
const RING_C   = 2 * Math.PI * RING_R  // ~138.2

function CircleTimer({
  timeLeft, totalSec, color,
}: { timeLeft: number; totalSec: number; color: string }) {
  const pct        = timeLeft / Math.max(1, totalSec)
  const ringColor  = timeLeft <= 30 ? '#EF4444' : timeLeft <= 60 ? '#F59E0B' : color
  const dashOffset = RING_C * (1 - pct)
  const mm = Math.floor(timeLeft / 60)
  const ss = (timeLeft % 60).toString().padStart(2, '0')
  return (
    <View style={{ width:54, height:54, alignItems:'center', justifyContent:'center' }}>
      <Svg width={54} height={54} viewBox="0 0 54 54">
        <Circle cx={27} cy={27} r={RING_R} fill="none"
          stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
        <Circle cx={27} cy={27} r={RING_R} fill="none"
          stroke={ringColor} strokeWidth={4}
          strokeDasharray={`${RING_C} ${RING_C}`}
          strokeDashoffset={`${dashOffset}`}
          strokeLinecap="round"
          transform="rotate(-90 27 27)"
        />
      </Svg>
      <View style={{ position:'absolute', alignItems:'center', justifyContent:'center' }}>
        <Text style={{ fontSize:10, fontWeight:'900', color:ringColor, letterSpacing:-0.5 }}>
          {mm}:{ss}
        </Text>
      </View>
    </View>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 1 — ⏱️ ZAMANLI OKUMA
// ═══════════════════════════════════════════════════════════════════

function TimedView({ content, config, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const totalSec   = config.timerSeconds ?? 180
  const targetWpm  = Math.round(content.wordCount / (totalSec / 60))

  const [timeLeft,    setTimeLeft]    = useState(totalSec)
  const [scrollRatio, setScrollRatio] = useState(0)
  const [liveWpm,     setLiveWpm]     = useState(0)
  const [started,     setStarted]     = useState(false)

  const startRef       = useRef<number>(0)
  const scrollRatioRef = useRef(0)
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const urgency        = useSharedValue(0)
  const borderGlow     = useSharedValue(0)

  const urgentStyle = useAnimatedStyle(() => ({
    opacity: 1 - urgency.value * 0.35,
  }))
  const glowStyle = useAnimatedStyle(() => ({
    borderWidth: borderGlow.value * 3,
    borderColor: `rgba(239,68,68,${borderGlow.value * 0.6})`,
  }))

  const finish = useCallback((success: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const elapsed = Date.now() - startRef.current
    onFinish({
      avgWPM:        calcWPM(content.wordCount, elapsed),
      durationSec:   Math.round(elapsed / 1000),
      completion:    scrollRatioRef.current,
      comprehension: success ? 75 : 50,
      specific:      { timedSuccess: success, completionRatio: scrollRatioRef.current },
    })
  }, [content, onFinish])

  const start = useCallback(() => {
    setStarted(true)
    startRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          finish(false)
          return 0
        }
        if (prev === 31) {
          urgency.value = withRepeat(
            withSequence(withTiming(1, { duration:350 }), withTiming(0, { duration:350 })),
            -1,
          )
          borderGlow.value = withRepeat(
            withSequence(withTiming(1, { duration:400 }), withTiming(0.3, { duration:400 })),
            -1,
          )
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        }
        return prev - 1
      })
      // Canlı WPM güncelle
      const elapsed = (Date.now() - startRef.current) / 60000
      if (elapsed > 0.05) {
        const wordsRead = Math.round(content.wordCount * scrollRatioRef.current)
        setLiveWpm(wordsRead > 0 ? Math.round(wordsRead / elapsed) : 0)
      }
    }, 1000)
  }, [finish, content.wordCount, urgency, borderGlow])

  useEffect(() => {
    if (scrollRatioRef.current > 0.92 && started) {
      finish(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRatio])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const pct = Math.round(scrollRatio * 100)

  // ── Başlangıç ekranı ─────────────────────────────────────────────
  if (!started) {
    const dkNeeded  = totalSec / 60
    const difficulty = targetWpm > 280 ? '🔴 Zorlu' : targetWpm > 200 ? '🟡 Orta' : '🟢 Kolay'
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
        <TopBar title={config.label} onExit={onExit} color={color} />
        <ScrollView contentContainerStyle={{ padding:24, gap:20, paddingBottom:40 }}>
          {/* Hero */}
          <View style={{ backgroundColor: t.colors.panel, borderRadius:20, padding:24,
            alignItems:'center', gap:10 }}>
            <Text style={{ fontSize:56 }}>{config.icon}</Text>
            <Text style={{ fontSize:21, fontWeight:'900', color:'#fff', textAlign:'center' }}>
              {config.label}
            </Text>
            <Text style={{ fontSize:13, color:'rgba(255,255,255,0.75)', textAlign:'center', lineHeight:20 }}>
              {config.description}
            </Text>
          </View>

          {/* İstatistik chips */}
          <View style={{ flexDirection:'row', gap:10 }}>
            <View style={{ flex:1, backgroundColor: t.colors.surface, borderRadius:14,
              padding:14, alignItems:'center', gap:4 }}>
              <Text style={{ fontSize:24, fontWeight:'900', color }}>
                {Math.floor(dkNeeded)}<Text style={{ fontSize:14 }}> dk</Text>
              </Text>
              <Text style={{ fontSize:11, color: t.colors.textHint, fontWeight:'600' }}>Süre Limiti</Text>
            </View>
            <View style={{ flex:1, backgroundColor: t.colors.surface, borderRadius:14,
              padding:14, alignItems:'center', gap:4 }}>
              <Text style={{ fontSize:24, fontWeight:'900', color }}>
                {content.wordCount}
              </Text>
              <Text style={{ fontSize:11, color: t.colors.textHint, fontWeight:'600' }}>Kelime</Text>
            </View>
            <View style={{ flex:1, backgroundColor: t.colors.surface, borderRadius:14,
              padding:14, alignItems:'center', gap:4 }}>
              <Text style={{ fontSize:24, fontWeight:'900', color }}>
                {targetWpm}
              </Text>
              <Text style={{ fontSize:11, color: t.colors.textHint, fontWeight:'600' }}>Hedef WPM</Text>
            </View>
          </View>

          {/* Zorluk + ipucu */}
          <View style={{ backgroundColor: t.colors.surface, borderRadius:14, padding:16, gap:8 }}>
            <Text style={{ fontSize:13, fontWeight:'800', color:'rgba(255,255,255,0.8)' }}>
              {difficulty} Seviye
            </Text>
            <Text style={{ fontSize:13, color: t.colors.textHint, lineHeight:20 }}>
              Bu metni {dkNeeded} dakikada bitirmek için dakikada {targetWpm} kelime okumalısın.
              Metni kaydırarak ilerle — %92'ye ulaşınca egzersiz otomatik tamamlanır.
            </Text>
          </View>

          {/* Başlat */}
          <TouchableOpacity
            style={{ backgroundColor:color, borderRadius:18, paddingVertical:20,
              alignItems:'center', shadowColor:'#000', shadowOpacity:0.25,
              shadowRadius:10, shadowOffset:{ width:0, height:4 }, elevation:6 }}
            onPress={start}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize:18, fontWeight:'900', color:'#fff', letterSpacing:0.3 }}>
              ▶  Süreyi Başlat
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Okuma ekranı ─────────────────────────────────────────────────
  return (
    <Animated.View style={[{ flex:1 }, glowStyle]}>
      <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
        <TopBar title={config.label} onExit={() => finish(false)} color={color}
          right={
            <Animated.View style={urgentStyle}>
              <CircleTimer timeLeft={timeLeft} totalSec={totalSec} color={color} />
            </Animated.View>
          }
        />

        {/* Gelişmiş ilerleme çubuğu */}
        <View style={{ backgroundColor: t.colors.surface, paddingHorizontal:16,
          paddingVertical:8, gap:6 }}>
          <View style={{ height:8, backgroundColor:'rgba(128,128,128,0.18)',
            borderRadius:4, overflow:'hidden' }}>
            <View style={{ height:8, backgroundColor:color, borderRadius:4,
              width:`${pct}%` as `${number}%` }} />
          </View>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <Text style={{ fontSize:11, color: t.colors.textHint, fontWeight:'600' }}>
              {pct}% okundu
            </Text>
            {liveWpm > 0 && (
              <Text style={{ fontSize:11, color, fontWeight:'800' }}>
                ⚡ {liveWpm} WPM
              </Text>
            )}
            <Text style={{ fontSize:11, color: t.colors.textHint, fontWeight:'600' }}>
              Hedef: {targetWpm} WPM
            </Text>
          </View>
        </View>

        <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal:41, paddingVertical:20, paddingBottom:80 }}
          onScroll={e => {
            const { contentOffset:{ y }, contentSize:{ height }, layoutMeasurement:{ height:lh } } = e.nativeEvent
            const ratio = Math.min(1, y / Math.max(1, height - lh))
            scrollRatioRef.current = ratio
            setScrollRatio(ratio)
          }}
          scrollEventThrottle={100}
        >
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize, color: t.colors.text, lineHeight: Math.round(fontSize * 1.75), letterSpacing:0.2 }}>
            {content.text}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 2 — 📚 AKADEMİK MOD
// ═══════════════════════════════════════════════════════════════════

function AcademicView({ content, config, wpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const lines   = useMemo(() => buildAcademicLines(content.text, config.wordsPerLine ?? 8), [content])
  const [lineIdx, setLineIdx]   = useState(0)
  const [paused, setPaused]     = useState(false)
  const startRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const msPerLine = Math.round((60_000 / Math.max(1, wpm)) * (config.wordsPerLine ?? 8))

  const advance = useCallback(() => {
    setLineIdx(prev => {
      const next = prev + 1
      if (next >= lines.length) {
        const elapsed = Date.now() - startRef.current
        onFinish({
          avgWPM: calcWPM(content.wordCount, elapsed),
          durationSec: Math.round(elapsed / 1000),
          completion: 1,
          comprehension: 85,
        })
        return prev
      }
      return next
    })
  }, [lines.length, content, onFinish])

  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(advance, msPerLine)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [lineIdx, paused, advance, msPerLine])

  const progress = lines.length > 0 ? lineIdx / lines.length : 0

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={config.label} onExit={() => {
        const elapsed = Date.now() - startRef.current
        onFinish({ avgWPM: calcWPM(content.wordCount * progress, elapsed),
          durationSec: Math.round(elapsed / 1000), completion: progress, comprehension: 80 })
      }} color={color} />
      <ProgressBar value={progress} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      <ScrollView contentContainerStyle={{ paddingHorizontal:41, paddingVertical:20, paddingBottom:80 }}>
        {lines.map((line, i) => (
          <Text
            key={i}
            style={{
              fontSize:    i === lineIdx ? Math.min(28, fontSize + 2) : fontSize,
              fontWeight:  i === lineIdx ? '700' : '400',
              color:       i === lineIdx ? t.colors.text
                         : i < lineIdx  ? t.colors.textHint
                         : (t.colors.textHint + '55'),
              lineHeight:  i === lineIdx ? Math.min(42, (fontSize + 2) * 1.7) : fontSize * 1.65,
              marginBottom: 8,
              letterSpacing: 0.3,
              backgroundColor: i === lineIdx ? (color + '18') : 'transparent',
              borderRadius: 8, paddingHorizontal: i === lineIdx ? 8 : 0,
            }}
          >
            {line}
          </Text>
        ))}
      </ScrollView>

      {/* Kontroller */}
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center',
        paddingHorizontal:20, paddingBottom: Platform.OS === 'ios' ? 24 : 16, paddingTop:12,
        backgroundColor: t.colors.panel }}>
        <TouchableOpacity onPress={() => setLineIdx(p => Math.max(0, p - 1))}>
          <Text style={{ fontSize:28, color:'rgba(255,255,255,0.6)' }}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor:color, borderRadius:32, paddingHorizontal:28, paddingVertical:10 }}
          onPress={() => { Haptics.selectionAsync(); setPaused(p => !p) }}
        >
          <Text style={{ fontSize:15, fontWeight:'800', color:'#fff' }}>
            {paused ? '▶ Devam' : '⏸ Dur'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLineIdx(p => Math.min(lines.length - 1, p + 1))}>
          <Text style={{ fontSize:28, color:'rgba(255,255,255,0.6)' }}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 3 — 🔍 ANAHTAR KELİME
// ═══════════════════════════════════════════════════════════════════

function KeywordView({ content, config, wpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const keywords = useMemo(() => new Set(extractKeywords(content.text, 24)), [content])
  const [found, setFound]   = useState<Set<string>>(new Set())
  const startRef = useRef(Date.now())

  const handleTap = (word: string) => {
    const clean = word.toLowerCase().replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '')
    if (keywords.has(clean)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setFound(prev => new Set([...prev, clean]))
    }
  }

  const finish = useCallback(() => {
    const elapsed = Date.now() - startRef.current
    onFinish({
      avgWPM: calcWPM(content.wordCount, elapsed),
      durationSec: Math.round(elapsed / 1000),
      completion: 1,
      comprehension: 70,
      specific: {
        keywordsFound:  found.size,
        totalKeywords:  keywords.size,
      },
    })
  }, [found, keywords, content, onFinish])

  // Metni kelime kelime render et, anahtar kelimeleri renklendir
  const renderText = () => {
    const words = content.text.split(/(\s+)/)
    return words.map((word, i) => {
      const clean = word.toLowerCase().replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '')
      const isKeyword = keywords.has(clean)
      const isCaught  = found.has(clean)
      if (!isKeyword) return <Text key={i} style={{ color: t.colors.text }}>{word}</Text>
      return (
        <Text
          key={i}
          onPress={() => handleTap(word)}
          style={{
            color:          isCaught ? '#fff' : color,
            fontWeight:     '800',
            backgroundColor: isCaught ? color : (color + '22'),
            borderRadius:   4,
          }}
        >
          {word}
        </Text>
      )
    })
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={config.label} onExit={finish} color={color}
        right={
          <Text style={{ fontSize:13, color: color, fontWeight:'700' }}>
            {found.size}/{keywords.size} 🎯
          </Text>
        }
      />
      <View style={{ backgroundColor: t.colors.surface, marginHorizontal:16, marginVertical:8,
        borderRadius:12, padding:12, flexDirection:'row', alignItems:'center', gap:8 }}>
        <Text style={{ fontSize:12, color: t.colors.textHint, flex:1 }}>
          Renkli kelimelere dokun — anahtar kelimeleri yakala
        </Text>
        <View style={{ width: 48, height:6, backgroundColor: t.colors.border, borderRadius:3 }}>
          <View style={{ width:`${keywords.size > 0 ? (found.size/keywords.size)*100 : 0}%` as `${number}%`,
            height:6, backgroundColor:color, borderRadius:3 }} />
        </View>
      </View>
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />
      <ScrollView contentContainerStyle={{ paddingHorizontal:41, paddingVertical:20, paddingBottom:80 }}>
        <Text style={{ fontSize, lineHeight: Math.round(fontSize * 1.9), flexWrap:'wrap' }}>
          {renderText()}
        </Text>
      </ScrollView>
      <View style={{ padding:16, paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        backgroundColor: t.colors.panel }}>
        <TouchableOpacity
          style={{ backgroundColor:color, borderRadius:14, paddingVertical:16, alignItems:'center' }}
          onPress={finish}
        >
          <Text style={{ fontSize:16, fontWeight:'800', color:'#fff' }}>
            Taramayı Tamamla ✓
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 4 — 🧠 HAFIZA SABİTLEME
// ═══════════════════════════════════════════════════════════════════

type MemPhase = 'reading' | 'recall' | 'reveal'

function MemoryView({ content, config, wpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const blocks = useMemo(() => buildMemoryBlocks(content.text, config.wordsPerBlock ?? 40), [content])
  const [blockIdx,  setBlockIdx]  = useState(0)
  const [phase,     setPhase]     = useState<MemPhase>('reading')
  const [correct,   setCorrect]   = useState(0)
  const [showTimer, setShowTimer] = useState(0)  // saniye cinsinden geri sayım
  const startRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const block = blocks[blockIdx]
  const readMs = block ? Math.round((block.wordCount / Math.max(1, wpm)) * 60_000) : 3000
  const readSec = Math.ceil(readMs / 1000)

  // Okuma fazında countdown
  useEffect(() => {
    if (phase !== 'reading') return
    setShowTimer(readSec)
    timerRef.current = setInterval(() => {
      setShowTimer(p => {
        if (p <= 1) {
          clearInterval(timerRef.current!)
          setPhase('recall')
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [blockIdx, phase]) // eslint-disable-line

  const handleRemember = (remembered: boolean) => {
    if (remembered) setCorrect(p => p + 1)
    advanceOrFinish()
  }

  const handleShowAgain = () => {
    setPhase('reveal')
    revealTimeout.current = setTimeout(() => {
      advanceOrFinish()
    }, 2500)
  }

  const advanceOrFinish = useCallback(() => {
    const nextIdx = blockIdx + 1
    if (nextIdx >= blocks.length) {
      const elapsed = Date.now() - startRef.current
      onFinish({
        avgWPM: calcWPM(content.wordCount, elapsed),
        durationSec: Math.round(elapsed / 1000),
        completion: 1,
        comprehension: Math.round((correct / blocks.length) * 100),
        specific: {
          recallCorrect: correct,
          recallTotal:   blocks.length,
        },
      })
    } else {
      setBlockIdx(nextIdx)
      setPhase('reading')
    }
  }, [blockIdx, blocks.length, correct, content, onFinish]) // eslint-disable-line

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (revealTimeout.current) clearTimeout(revealTimeout.current)
  }, [])

  const progress = blocks.length > 0 ? blockIdx / blocks.length : 0

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={`${blockIdx + 1}/${blocks.length} · 🧠 Hafıza`}
        onExit={() => {
          const elapsed = Date.now() - startRef.current
          onFinish({ avgWPM: calcWPM(content.wordCount * progress, elapsed),
            durationSec: Math.round(elapsed / 1000), completion: progress, comprehension: 70 })
        }} color={color}
      />
      <ProgressBar value={progress} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      <View style={{ flex:1, padding:24, gap:20 }}>
        {/* Durum başlığı */}
        <Text style={{ fontSize:13, fontWeight:'700', color, textAlign:'center', letterSpacing:1 }}>
          {phase === 'reading' ? `📖 OKU — ${showTimer}s kaldı`
            : phase === 'recall' ? '🧠 HATIRLA'
            : '👁 TEKRAR BAK'}
        </Text>

        {/* Metin kutusu */}
        <View style={{
          flex:1, backgroundColor: phase === 'recall' ? (color + '10') : t.colors.surface,
          borderRadius:20, padding:24, justifyContent:'center',
          borderWidth: phase === 'reading' ? 2 : 1,
          borderColor: phase === 'reading' ? color : t.colors.border,
        }}>
          {phase === 'recall' ? (
            <View style={{ alignItems:'center', gap:12 }}>
              <Text style={{ fontSize:48 }}>🤔</Text>
              <Text style={{ fontSize:16, color: t.colors.text, textAlign:'center', lineHeight:24 }}>
                Az önce okuduğun bölümü hatırlıyor musun?
              </Text>
            </View>
          ) : (
            <ScrollView>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize, color: t.colors.text, lineHeight: Math.round(fontSize * 1.75), letterSpacing:0.2 }}>
                {block?.text ?? ''}
              </Text>
            </ScrollView>
          )}
        </View>

        {/* Aksiyonlar */}
        {phase === 'recall' && (
          <View style={{ gap:12 }}>
            <TouchableOpacity
              style={{ backgroundColor:color, borderRadius:16, paddingVertical:18, alignItems:'center' }}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); handleRemember(true) }}
            >
              <Text style={{ fontSize:17, fontWeight:'800', color:'#fff' }}>✓ Anladım</Text>
            </TouchableOpacity>
            <View style={{ flexDirection:'row', gap:12 }}>
              <TouchableOpacity
                style={{ flex:1, backgroundColor: t.colors.surface, borderRadius:16,
                  paddingVertical:14, alignItems:'center', borderWidth:1, borderColor: t.colors.border }}
                onPress={() => { Haptics.selectionAsync(); handleRemember(false) }}
              >
                <Text style={{ fontSize:14, fontWeight:'700', color: t.colors.text }}>Devam Et</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex:1, backgroundColor: t.colors.surface, borderRadius:16,
                  paddingVertical:14, alignItems:'center', borderWidth:1, borderColor: color }}
                onPress={() => { Haptics.selectionAsync(); handleShowAgain() }}
              >
                <Text style={{ fontSize:14, fontWeight:'700', color }}>Tekrar Gör</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === 'reading' && (
          <TouchableOpacity
            style={{ backgroundColor: t.colors.surface, borderRadius:16,
              paddingVertical:14, alignItems:'center', borderWidth:1, borderColor: color }}
            onPress={() => {
              if (timerRef.current) clearInterval(timerRef.current)
              setPhase('recall')
            }}
          >
            <Text style={{ fontSize:15, fontWeight:'700', color }}>Hazırım →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 5 — 🔮 TAHMİN OKUMA
// ═══════════════════════════════════════════════════════════════════

function PredictionView({ content, config, wpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const items   = useMemo(() => buildPredictionItems(content.text), [content])
  const [idx,      setIdx]      = useState(0)
  const [revealed, setRevealed] = useState(false)
  const revealAnim = useSharedValue(0)
  const startRef   = useRef(Date.now())

  const reveal = useCallback(() => {
    if (revealed) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setRevealed(true)
    revealAnim.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) })
  }, [revealed, revealAnim])

  const next = useCallback(() => {
    const nextIdx = idx + 1
    if (nextIdx >= items.length) {
      const elapsed = Date.now() - startRef.current
      onFinish({
        avgWPM: calcWPM(content.wordCount, elapsed),
        durationSec: Math.round(elapsed / 1000),
        completion: 1,
        comprehension: 80,
        specific: { predictionTotal: items.length },
      })
    } else {
      setIdx(nextIdx)
      setRevealed(false)
      revealAnim.value = 0
    }
  }, [idx, items.length, content, onFinish, revealAnim])

  const maskedStyle = useAnimatedStyle(() => ({
    opacity:   1 - revealAnim.value,
    transform: [{ translateY: revealAnim.value * -4 }],
  }))
  const revealStyle = useAnimatedStyle(() => ({
    opacity:   revealAnim.value,
    transform: [{ translateY: (1 - revealAnim.value) * 8 }],
  }))

  const item = items[idx]
  if (!item) return null

  const progress = items.length > 0 ? idx / items.length : 0

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={`${idx + 1}/${items.length} · 🔮 Tahmin`}
        onExit={() => {
          const elapsed = Date.now() - startRef.current
          onFinish({ avgWPM: calcWPM(content.wordCount * progress, elapsed),
            durationSec: Math.round(elapsed / 1000), completion: progress, comprehension: 75 })
        }} color={color}
      />
      <ProgressBar value={progress} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      <View style={{ flex:1, padding:28, justifyContent:'center', gap:28 }}>
        <Text style={{ fontSize:12, fontWeight:'700', color, textAlign:'center', letterSpacing:1 }}>
          CÜMLE SONUNU TAHMİN ET
        </Text>

        {/* Cümle kutusu */}
        <View style={{ backgroundColor: t.colors.surface, borderRadius:24,
          padding:28, borderWidth:1, borderColor: t.colors.border, minHeight:160,
          justifyContent:'center' }}>
          <Text style={{ fontSize: fontSize + 2, color: t.colors.text, lineHeight: Math.round((fontSize + 2) * 1.7), fontWeight:'500' }}>
            {item.visible}{' '}
          </Text>

          {/* Masked → Revealed */}
          <View style={{ position:'relative', minHeight:36, justifyContent:'center' }}>
            <Animated.View style={[{ position:'absolute' }, maskedStyle]}>
              <TouchableOpacity onPress={reveal} activeOpacity={0.7}>
                <Text style={{ fontSize:20, fontWeight:'800', color,
                  textDecorationLine:'underline', textDecorationStyle:'dashed' }}>
                  {'_'.repeat(Math.min(12, item.masked.length))}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={revealStyle}>
              <Text style={{ fontSize:20, fontWeight:'800', color, lineHeight:34 }}>
                {item.masked}
              </Text>
            </Animated.View>
          </View>
        </View>

        {!revealed ? (
          <TouchableOpacity
            style={{ backgroundColor:color, borderRadius:18, paddingVertical:20, alignItems:'center' }}
            onPress={reveal}
          >
            <Text style={{ fontSize:17, fontWeight:'800', color:'#fff' }}>
              👆 Tahminini Ortaya Koy
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor:color, borderRadius:18, paddingVertical:20, alignItems:'center' }}
            onPress={next}
          >
            <Text style={{ fontSize:17, fontWeight:'800', color:'#fff' }}>
              Sonraki Cümle →
            </Text>
          </TouchableOpacity>
        )}

        <Text style={{ textAlign:'center', fontSize:13, color: t.colors.textHint }}>
          Tahmin et · Ortaya koy · Karşılaştır
        </Text>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 6 — 🎯 DİKKAT FİLTRESİ
// ═══════════════════════════════════════════════════════════════════

function FocusFilterView({ content, config, wpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const paragraphs = useMemo(() => splitIntoParagraphs(content.text), [content])
  const [paraIdx, setParaIdx] = useState(0)
  const startRef  = useRef(Date.now())
  const paraStart = useRef(Date.now())

  const next = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const nextIdx = paraIdx + 1
    if (nextIdx >= paragraphs.length) {
      const elapsed = Date.now() - startRef.current
      onFinish({
        avgWPM: calcWPM(content.wordCount, elapsed),
        durationSec: Math.round(elapsed / 1000),
        completion: 1,
        comprehension: 90,
        specific: {
          paragraphsCompleted: paragraphs.length,
          paragraphsTotal:     paragraphs.length,
        },
      })
    } else {
      setParaIdx(nextIdx)
      paraStart.current = Date.now()
    }
  }, [paraIdx, paragraphs.length, content, onFinish])

  const progress = paragraphs.length > 0 ? paraIdx / paragraphs.length : 0

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={`${paraIdx + 1}/${paragraphs.length} · 🎯 Odak`}
        onExit={() => {
          const elapsed = Date.now() - startRef.current
          onFinish({ avgWPM: calcWPM(content.wordCount * progress, elapsed),
            durationSec: Math.round(elapsed / 1000), completion: progress, comprehension: 85 })
        }} color={color}
      />
      <ProgressBar value={progress} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      <ScrollView contentContainerStyle={{ paddingHorizontal:41, paddingVertical:20, paddingBottom:100, gap:12 }}>
        {paragraphs.map((para, i) => (
          <View
            key={i}
            style={{
              backgroundColor: i === paraIdx ? (color + '15') : t.colors.surface,
              borderRadius:    16,
              padding:         16,
              borderWidth:     i === paraIdx ? 2 : StyleSheet.hairlineWidth,
              borderColor:     i === paraIdx ? color : t.colors.border,
              opacity:         i === paraIdx ? 1 : 0.25,
            }}
          >
            <Text style={{
              fontSize:   i === paraIdx ? Math.min(28, fontSize + 1) : Math.max(12, fontSize - 1),
              fontWeight: i === paraIdx ? '500' : '400',
              color:      t.colors.text,
              lineHeight: i === paraIdx ? Math.round((fontSize + 1) * 1.75) : Math.round((fontSize - 1) * 1.6),
            }}>
              {para}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ position:'absolute', bottom:0, left:0, right:0,
        backgroundColor: t.colors.panel, padding:16,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16 }}>
        <TouchableOpacity
          style={{ backgroundColor:color, borderRadius:16, paddingVertical:18,
            alignItems:'center' }}
          onPress={next}
        >
          <Text style={{ fontSize:16, fontWeight:'800', color:'#fff' }}>
            {paraIdx < paragraphs.length - 1 ? 'Sonraki Paragraf →' : '✓ Tamamlandı'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 7 — 🤫 SESSİZ OKUMA (Subvocal Suppression)
// ═══════════════════════════════════════════════════════════════════

function SubvocalView({ content, config, wpm: initWpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const [wpm, setWpm]         = useState(Math.max(300, initWpm))
  const [chunks]              = useState(() => buildRsvpChunks(content.text, 1))
  const [chunkIdx, setChunkIdx] = useState(0)
  const [isPlaying, setPlaying] = useState(false)
  const startRef  = useRef(0)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Metronom: 4 nokta, sırayla 0-3 indeksi parlar
  // Her useSharedValue ayrı hook çağrısı olmalı (hooks rules)
  const dot0 = useSharedValue(0.2)
  const dot1 = useSharedValue(0.2)
  const dot2 = useSharedValue(0.2)
  const dot3 = useSharedValue(0.2)
  const dotAnims = useMemo(() => [dot0, dot1, dot2, dot3], []) // eslint-disable-line
  const dotIdx = useRef(0)
  const metroRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const intervalMs = Math.round(60_000 / Math.max(1, wpm))

  const stopTimers = useCallback(() => {
    if (timerRef.current)  clearTimeout(timerRef.current)
    if (metroRef.current)  clearTimeout(metroRef.current)
  }, [])

  const runMetronome = useCallback(() => {
    const di = dotIdx.current % 4
    dotAnims.forEach((d, i) => {
      d.value = withTiming(i === di ? 1 : 0.2, { duration: 60 })
    })
    dotIdx.current++
    metroRef.current = setTimeout(runMetronome, intervalMs)
  }, [intervalMs]) // eslint-disable-line

  const scheduleNext = useCallback((idx: number) => {
    if (idx >= chunks.length) {
      stopTimers()
      setPlaying(false)
      const elapsed = Date.now() - startRef.current
      onFinish({
        avgWPM: calcWPM(content.wordCount, elapsed),
        durationSec: Math.round(elapsed / 1000),
        completion: 1,
        comprehension: 65,
      })
      return
    }
    setChunkIdx(idx)
    timerRef.current = setTimeout(() => scheduleNext(idx + 1), intervalMs)
  }, [chunks.length, intervalMs, content, onFinish, stopTimers])

  useEffect(() => {
    if (!isPlaying) return
    if (startRef.current === 0) startRef.current = Date.now()
    scheduleNext(chunkIdx)
    runMetronome()
    return stopTimers
  }, [isPlaying]) // eslint-disable-line

  useEffect(() => () => stopTimers(), [stopTimers])

  const progress = chunks.length > 0 ? chunkIdx / chunks.length : 0
  // Hooks rules: useAnimatedStyle map içinde çağrılamaz — ayrı çağrılar
  const dotStyle0 = useAnimatedStyle(() => ({ opacity: dot0.value }))
  const dotStyle1 = useAnimatedStyle(() => ({ opacity: dot1.value }))
  const dotStyle2 = useAnimatedStyle(() => ({ opacity: dot2.value }))
  const dotStyle3 = useAnimatedStyle(() => ({ opacity: dot3.value }))
  const dotStyles = [dotStyle0, dotStyle1, dotStyle2, dotStyle3]

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={config.label} onExit={() => { stopTimers(); onExit() }} color={color}
        right={<Text style={{ fontSize:14, fontWeight:'700', color }}>{wpm} WPM</Text>}
      />

      <View style={{ height:3, backgroundColor: t.colors.border, marginHorizontal:16 }}>
        <View style={{ height:3, backgroundColor:color, borderRadius:2,
          width:`${Math.round(progress * 100)}%` as `${number}%` }} />
      </View>
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      {/* Metronom Göstergesi */}
      <View style={{ flexDirection:'row', justifyContent:'center', gap:14,
        paddingVertical:20 }}>
        {dotStyles.map((style, i) => (
          <Animated.View
            key={i}
            style={[{
              width:22, height:22, borderRadius:11,
              backgroundColor: color,
            }, style]}
          />
        ))}
      </View>
      <Text style={{ textAlign:'center', fontSize:11, color: t.colors.textHint,
        marginTop:-8, marginBottom:8 }}>
        Görsel ritme odaklan — iç sesi sustur
      </Text>

      {/* Kelime gösterimi */}
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 }}>
        <Text style={{ fontSize: Math.max(28, fontSize + 10), fontWeight:'800', color: t.colors.text,
          textAlign:'center', letterSpacing:1 }}>
          {chunks[chunkIdx] ?? ''}
        </Text>
      </View>

      {/* WPM ayar */}
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center',
        gap:16, paddingVertical:12 }}>
        <TouchableOpacity
          style={{ backgroundColor: t.colors.surface, borderRadius:999,
            paddingHorizontal:18, paddingVertical:8, borderWidth:1, borderColor: t.colors.border }}
          onPress={() => { Haptics.selectionAsync(); setWpm(w => Math.max(300, w - 25)) }}
        >
          <Text style={{ fontSize:14, fontWeight:'700', color: t.colors.text }}>−25</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: t.colors.text, minWidth:100, textAlign:'center' }}>
          {wpm} WPM
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: t.colors.surface, borderRadius:999,
            paddingHorizontal:18, paddingVertical:8, borderWidth:1, borderColor: t.colors.border }}
          onPress={() => { Haptics.selectionAsync(); setWpm(w => Math.min(800, w + 25)) }}
        >
          <Text style={{ fontSize:14, fontWeight:'700', color: t.colors.text }}>+25</Text>
        </TouchableOpacity>
      </View>

      {/* Kontrol butonu */}
      <View style={{ paddingHorizontal:24, paddingBottom: Platform.OS === 'ios' ? 32 : 16 }}>
        <TouchableOpacity
          style={{ backgroundColor:color, borderRadius:20, paddingVertical:22, alignItems:'center' }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setPlaying(p => !p) }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize:20, fontWeight:'900', color:'#fff' }}>
            {isPlaying ? '⏸ Dur' : '▶ Başlat'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 8 — 🧬 BİYONİK OKUMA (SuperReader tarzı)
// ═══════════════════════════════════════════════════════════════════

function BionicView({ content, config, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const [scrollRatio, setScrollRatio] = useState(0)
  const startRef = useRef(Date.now())

  const finish = useCallback(() => {
    const elapsed = Date.now() - startRef.current
    onFinish({
      avgWPM:        calcWPM(content.wordCount * Math.max(0.1, scrollRatio), elapsed),
      durationSec:   Math.round(elapsed / 1000),
      completion:    scrollRatio,
      comprehension: 82,
    })
  }, [scrollRatio, content, onFinish])

  // Paragrafları kelime kelime bionic formatla
  const paragraphs = useMemo(() => splitIntoParagraphs(content.text), [content])

  const progress = scrollRatio
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={config.label} onExit={finish} color={color} />
      <ProgressBar value={progress} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal:41, paddingVertical:20, paddingBottom:100 }}
        onScroll={e => {
          const { contentOffset:{ y }, contentSize:{ height }, layoutMeasurement:{ height:lh } } = e.nativeEvent
          setScrollRatio(Math.min(1, y / Math.max(1, height - lh)))
        }}
        scrollEventThrottle={120}
      >
        {paragraphs.map((para, pi) => (
          <Text key={pi} style={{ fontSize, lineHeight: Math.round(fontSize * 1.9), marginBottom:18 }}>
            {para.split(/(\s+)/).map((chunk, wi) => {
              if (/^\s+$/.test(chunk)) return <Text key={wi}>{chunk}</Text>
              const half = Math.ceil(chunk.length / 2)
              return (
                <Text key={wi}>
                  <Text style={{ fontWeight:'900', color: t.colors.text }}>{chunk.slice(0, half)}</Text>
                  <Text style={{ fontWeight:'400', color: t.colors.text, opacity: 0.75 }}>{chunk.slice(half)}</Text>
                </Text>
              )
            })}
          </Text>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal:24, paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        paddingTop:12, backgroundColor: t.colors.panel }}>
        <TouchableOpacity
          style={{ backgroundColor:color, borderRadius:16, paddingVertical:16, alignItems:'center' }}
          onPress={finish}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize:16, fontWeight:'800', color:'#fff' }}>✓ Okumayı Bitir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 9 — 📜 OTOMATİK KAYDIRMA (SuperReader / tüm hızlı okuma)
// ═══════════════════════════════════════════════════════════════════

function AutoScrollView({ content, config, wpm: initWpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const [wpm, setWpm] = useState(initWpm)
  const [isScrolling, setScrolling] = useState(false)
  const [scrollRatio, setScrollRatio]  = useState(0)
  const scrollRef    = useRef<ScrollView>(null)
  const scrollYRef   = useRef(0)
  const contentHRef  = useRef(0)
  const viewHRef     = useRef(0)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef     = useRef(0)
  const wpmRef       = useRef(wpm)
  wpmRef.current = wpm

  const TICK_MS = 80

  const stopScroll = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const finishReading = useCallback((ratio: number) => {
    stopScroll()
    setScrolling(false)
    const elapsed = Date.now() - startRef.current
    onFinish({
      avgWPM:        calcWPM(content.wordCount * Math.max(0.05, ratio), elapsed),
      durationSec:   Math.round(elapsed / 1000),
      completion:    ratio,
      comprehension: 72,
    })
  }, [content, onFinish, stopScroll])

  const startScroll = useCallback(() => {
    stopScroll()
    if (startRef.current === 0) startRef.current = Date.now()
    setScrolling(true)
    timerRef.current = setInterval(() => {
      const maxY = contentHRef.current - viewHRef.current
      if (maxY <= 0) return
      const totalMs  = (content.wordCount / Math.max(1, wpmRef.current)) * 60_000
      const pxPerTick = (maxY / totalMs) * TICK_MS
      scrollYRef.current = Math.min(scrollYRef.current + pxPerTick, maxY)
      scrollRef.current?.scrollTo({ y: scrollYRef.current, animated: false })
      const ratio = scrollYRef.current / maxY
      setScrollRatio(ratio)
      if (ratio >= 0.99) finishReading(1)
    }, TICK_MS)
  }, [content, stopScroll, finishReading])

  const pauseScroll = useCallback(() => {
    stopScroll()
    setScrolling(false)
  }, [stopScroll])

  useEffect(() => () => stopScroll(), [stopScroll])

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={config.label} onExit={() => finishReading(scrollRatio)} color={color}
        right={<Text style={{ fontSize:13, color:'rgba(255,255,255,0.85)', fontWeight:'700' }}>{wpm} WPM</Text>}
      />
      <ProgressBar value={scrollRatio} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal:41, paddingVertical:20, paddingBottom:60 }}
        onLayout={e => { viewHRef.current = e.nativeEvent.layout.height }}
        onContentSizeChange={(_, h) => { contentHRef.current = h }}
        scrollEnabled={!isScrolling}
        scrollEventThrottle={100}
      >
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize, color: t.colors.text, lineHeight: Math.round(fontSize * 1.75), letterSpacing:0.2 }}>
          {content.text}
        </Text>
      </ScrollView>

      <View style={{ paddingHorizontal:16, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        paddingTop:10, backgroundColor: t.colors.panel,
        flexDirection:'row', alignItems:'center', justifyContent:'center', gap:14 }}>
        <TouchableOpacity
          style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:999,
            paddingHorizontal:18, paddingVertical:10 }}
          onPress={() => setWpm(w => Math.max(60, w - 25))}
        >
          <Text style={{ color:'#fff', fontWeight:'700', fontSize:14 }}>−25</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor:color, borderRadius:20, paddingHorizontal:36,
            paddingVertical:14, minWidth:130, alignItems:'center' }}
          onPress={() => isScrolling ? pauseScroll() : startScroll()}
          activeOpacity={0.85}
        >
          <Text style={{ color:'#fff', fontWeight:'800', fontSize:17 }}>
            {isScrolling ? '⏸ Dur' : '▶ Başlat'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:999,
            paddingHorizontal:18, paddingVertical:10 }}
          onPress={() => setWpm(w => Math.min(600, w + 25))}
        >
          <Text style={{ color:'#fff', fontWeight:'700', fontSize:14 }}>+25</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 10 — 🪜 HIZ MERDİVENİ (Spreeder / SuperReader antrenmanı)
// ═══════════════════════════════════════════════════════════════════

function SpeedLadderView({ content, config, wpm: initWpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const [chunks]     = useState(() => buildRsvpChunks(content.text, 1))
  const [chunkIdx,   setChunkIdx]   = useState(0)
  const [currentWpm, setCurrentWpm] = useState(initWpm)
  const [isPlaying,  setPlaying]    = useState(false)
  const startRef   = useRef(0)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wpmRef     = useRef(initWpm)
  const idxRef     = useRef(0)

  const STEP_WPM   = 25
  const STEP_WORDS = 30

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const scheduleNext = useCallback((idx: number, wpm: number) => {
    if (idx >= chunks.length) {
      stopTimer()
      setPlaying(false)
      const elapsed = Date.now() - startRef.current
      onFinish({ avgWPM: wpm, durationSec: Math.round(elapsed / 1000), completion: 1, comprehension: 68 })
      return
    }
    idxRef.current = idx
    setChunkIdx(idx)
    const nextWpm = (idx > 0 && idx % STEP_WORDS === 0)
      ? Math.min(800, wpm + STEP_WPM) : wpm
    if (nextWpm !== wpm) {
      wpmRef.current = nextWpm
      setCurrentWpm(nextWpm)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    const ms = Math.round(60_000 / Math.max(1, nextWpm))
    timerRef.current = setTimeout(() => scheduleNext(idx + 1, nextWpm), ms)
  }, [chunks.length, content, onFinish, stopTimer]) // eslint-disable-line

  useEffect(() => {
    if (!isPlaying) return
    if (startRef.current === 0) startRef.current = Date.now()
    scheduleNext(idxRef.current, wpmRef.current)
    return stopTimer
  }, [isPlaying]) // eslint-disable-line

  useEffect(() => () => stopTimer(), [stopTimer])

  const progress = chunks.length > 0 ? chunkIdx / chunks.length : 0
  const stepNum  = Math.floor(chunkIdx / STEP_WORDS) + 1
  const wordsToNext = STEP_WORDS - (chunkIdx % STEP_WORDS)

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={config.label} onExit={() => {
        stopTimer()
        const elapsed = Date.now() - startRef.current
        onFinish({ avgWPM: currentWpm, durationSec: Math.round(elapsed / 1000), completion: progress, comprehension: 68 })
      }} color={color} />
      <ProgressBar value={progress} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      {/* Level & next-step info */}
      <View style={{ flexDirection:'row', justifyContent:'center', gap:10,
        paddingHorizontal:16, paddingTop:14 }}>
        <View style={{ backgroundColor: color + '22', borderRadius:20,
          paddingHorizontal:16, paddingVertical:6 }}>
          <Text style={{ fontSize:12, color, fontWeight:'800' }}>🏆 SEVİYE {stepNum}</Text>
        </View>
        <View style={{ backgroundColor: t.colors.surface, borderRadius:20,
          paddingHorizontal:14, paddingVertical:6,
          borderWidth:1, borderColor: t.colors.border }}>
          <Text style={{ fontSize:12, color: t.colors.textHint }}>
            {wordsToNext} kelime sonra ⬆ +{STEP_WPM}
          </Text>
        </View>
      </View>

      {/* WPM Badge */}
      <View style={{ alignItems:'center', paddingTop:24 }}>
        <Text style={{ fontSize:18, fontWeight:'800', color, letterSpacing:1 }}>
          ⚡ {currentWpm} WPM
        </Text>
      </View>

      {/* Current word */}
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 }}>
        <Text style={{ fontSize: Math.max(32, fontSize + 16), fontWeight:'900', color: t.colors.text,
          textAlign:'center', letterSpacing:1 }}>
          {chunks[chunkIdx] ?? ''}
        </Text>
      </View>

      <View style={{ paddingHorizontal:24, paddingBottom: Platform.OS === 'ios' ? 32 : 16 }}>
        <TouchableOpacity
          style={{ backgroundColor:color, borderRadius:20, paddingVertical:20, alignItems:'center' }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setPlaying(p => !p) }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize:20, fontWeight:'900', color:'#fff' }}>
            {isPlaying ? '⏸ Dur' : '▶ Başlat'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 11 — 💫 ÇOK KELİME RSVP (Spreeder / EyeQ multi-word)
// ═══════════════════════════════════════════════════════════════════

function WordBurstView({ content, config, wpm, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const [groupSize, setGroupSize] = useState(2)
  const chunks    = useMemo(() => buildRsvpChunks(content.text, groupSize), [content, groupSize])
  const [chunkIdx, setChunkIdx]   = useState(0)
  const [isPlaying, setPlaying]   = useState(false)
  const startRef  = useRef(0)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idxRef    = useRef(0)

  const intervalMs = Math.round((60_000 / Math.max(1, wpm)) * groupSize)

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const scheduleNext = useCallback((idx: number) => {
    if (idx >= chunks.length) {
      stopTimer()
      setPlaying(false)
      const elapsed = Date.now() - startRef.current
      onFinish({ avgWPM: calcWPM(content.wordCount, elapsed),
        durationSec: Math.round(elapsed / 1000), completion: 1, comprehension: 74 })
      return
    }
    idxRef.current = idx
    setChunkIdx(idx)
    timerRef.current = setTimeout(() => scheduleNext(idx + 1), intervalMs)
  }, [chunks.length, intervalMs, content, onFinish, stopTimer])

  useEffect(() => {
    if (!isPlaying) return
    if (startRef.current === 0) startRef.current = Date.now()
    scheduleNext(idxRef.current)
    return stopTimer
  }, [isPlaying]) // eslint-disable-line

  useEffect(() => { idxRef.current = 0; setChunkIdx(0); setPlaying(false); stopTimer() }, [groupSize]) // eslint-disable-line
  useEffect(() => () => stopTimer(), [stopTimer])

  const progress = chunks.length > 0 ? chunkIdx / chunks.length : 0

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      <TopBar title={config.label} onExit={() => {
        stopTimer()
        const elapsed = Date.now() - startRef.current
        onFinish({ avgWPM: calcWPM(content.wordCount * progress, elapsed),
          durationSec: Math.round(elapsed / 1000), completion: progress, comprehension: 74 })
      }} color={color} />
      <ProgressBar value={progress} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      {/* Group size selector */}
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center',
        gap:10, paddingVertical:14 }}>
        <Text style={{ fontSize:12, color: t.colors.textHint, fontWeight:'600' }}>Kelime/Grup:</Text>
        {([1, 2, 3, 4] as const).map(n => (
          <TouchableOpacity
            key={n}
            style={{ width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center',
              backgroundColor: groupSize === n ? color : t.colors.surface,
              borderWidth:1, borderColor: groupSize === n ? color : t.colors.border }}
            onPress={() => setGroupSize(n)}
          >
            <Text style={{ fontSize:15, fontWeight:'800',
              color: groupSize === n ? '#fff' : t.colors.text }}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current chunk */}
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:28 }}>
        <Text style={{ fontSize: Math.max(32, fontSize + 16), fontWeight:'900', color: t.colors.text,
          textAlign:'center', letterSpacing: groupSize === 1 ? 2 : 1,
          lineHeight: Math.max(46, Math.round((fontSize + 16) * 1.35)) }}>
          {chunks[chunkIdx] ?? ''}
        </Text>
      </View>

      <View style={{ paddingHorizontal:24, paddingBottom: Platform.OS === 'ios' ? 32 : 16 }}>
        <TouchableOpacity
          style={{ backgroundColor:color, borderRadius:20, paddingVertical:20, alignItems:'center' }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setPlaying(p => !p) }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize:20, fontWeight:'900', color:'#fff' }}>
            {isPlaying ? '⏸ Dur' : '▶ Başlat'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CÜMLE ADIM GÖRÜNÜMÜ — Cümle cümle anlama odaklı okuma
// ═══════════════════════════════════════════════════════════════════
function SentenceStepView({ content, config, fontSize, onFontSizeChange, onFinish, onExit, t, color }: ReadingViewProps) {
  const sentences = useMemo(() => {
    const raw = content.text.replace(/\n+/g, ' ')
    const m = raw.match(/[^.!?]+[.!?]+/g)
    const arr = m ?? [raw]
    return arr.map(s => s.trim()).filter(s => s.split(/\s+/).length >= 3)
  }, [content.text])

  const [idx, setIdx]       = useState(0)
  const [startMs]           = useState(() => Date.now())
  const total                = sentences.length

  const handleNext = () => {
    if (idx < total - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setIdx(i => i + 1)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      const elapsed = Math.max(1, (Date.now() - startMs) / 1000)
      onFinish({
        avgWPM:       Math.round((content.wordCount / elapsed) * 60),
        comprehension: 80,
        durationSec:  Math.round(elapsed),
        completion:   1,
      })
    }
  }

  const progress = total > 0 ? (idx + 1) / total : 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <TopBar title={config.label} onExit={onExit} color={color} />
      <ProgressBar value={progress} color={color} />
      <ReadingControlBar fontSize={fontSize} onChange={onFontSizeChange} color={color} t={t} />

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 20 }}>
        {/* Sayaç */}
        <Text style={{ fontSize: 13, color: t.colors.textHint, textAlign: 'center', fontWeight: '700' }}>
          {idx + 1} / {total}
        </Text>

        {/* Cümle kartı */}
        <View style={{
          backgroundColor: color + '12',
          borderRadius: 20,
          padding: 28,
          borderWidth: 2,
          borderColor: color + '50',
          minHeight: 140,
          justifyContent: 'center',
        }}>
          <Text style={{
            fontSize,
            lineHeight: Math.round(fontSize * 1.7),
            color: t.colors.text,
            fontWeight: '500',
            textAlign: 'center',
          }}>
            {sentences[idx] ?? ''}
          </Text>
        </View>

        {/* İlerleme noktaları */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          {sentences.slice(Math.max(0, idx - 4), Math.min(total, idx + 5)).map((_, i) => {
            const absIdx = Math.max(0, idx - 4) + i
            return (
              <View key={absIdx} style={{
                width: absIdx === idx ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: absIdx === idx ? color : (absIdx < idx ? color + '60' : t.colors.border),
              }} />
            )
          })}
        </View>

        {/* Navigasyon butonları */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{
              width: 56, height: 56,
              backgroundColor: t.colors.surface,
              borderRadius: 16,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: t.colors.border,
              opacity: idx === 0 ? 0.3 : 1,
            }}
            onPress={() => { if (idx > 0) setIdx(i => i - 1) }}
            disabled={idx === 0}
          >
            <Text style={{ fontSize: 22, color: t.colors.text }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1, height: 56,
              backgroundColor: color,
              borderRadius: 16,
              alignItems: 'center', justifyContent: 'center',
            }}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>
              {idx < total - 1 ? 'İleri →' : '✓ Tamamla'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOD 13 — ✨ SERİ VURGU OKUMA (SVR)
// ═══════════════════════════════════════════════════════════════════

const SVR_WPL    = 9   // satır başına tahminî kelime
const SVR_LINE_H = 28  // lineHeight
const SVR_MIN_WPM = 60
const SVR_MAX_WPM = 500
const SVR_COLORS = [
  { hex: '#22C55E', label: 'Yeşil' },
  { hex: '#3B82F6', label: 'Mavi'  },
  { hex: '#9CA3AF', label: 'Gri'   },
  { hex: '#F97316', label: 'Turuncu' },
] as const

const SVR_MIN_FONT     = 14   // WCAG minimum
const SVR_MAX_FONT     = 26
const SVR_DEFAULT_FONT = 18   // READING_TYPOGRAPHY.standard.fontSize

function SVRView({ content, config, wpm: initWpm, onFinish, onExit, t, color }: ReadingViewProps) { // fontSize/onFontSizeChange intentionally omitted — SVRView has its own fontSize slider
  const [chunkSize,       setChunkSize]       = useState(3)
  const [wpm,             setWpm]             = useState(Math.max(SVR_MIN_WPM, initWpm))
  const [fontSize,        setFontSize]        = useState(SVR_DEFAULT_FONT)
  const [activeChunk,     setActiveChunk]     = useState(0)
  const [paused,          setPaused]          = useState(false)
  const [hlColor,         setHlColor]         = useState(color)
  const [wpmTrackWidth,   setWpmTrackWidth]   = useState(0)
  const [fontTrackWidth,  setFontTrackWidth]  = useState(0)

  const chunkSizeRef = useRef(chunkSize)
  chunkSizeRef.current = chunkSize
  // legacy alias — removed trackWidth, now split into wpmTrackWidth / fontTrackWidth

  const chunks = useMemo(() => {
    const words = content.text.split(/\s+/).filter(Boolean)
    const res: string[] = []
    for (let i = 0; i < words.length; i += chunkSize)
      res.push(words.slice(i, i + chunkSize).join(' '))
    return res
  }, [content, chunkSize])

  const startRef      = useRef(Date.now())
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef     = useRef<ScrollView>(null)
  const chunkRef      = useRef(0)
  const pausedRef     = useRef(false)
  const wpmRef        = useRef(wpm)
  const contentHRef   = useRef(0)   // gerçek içerik yüksekliği (onContentSizeChange)
  const viewportHRef  = useRef(400) // scroll view görünür yüksekliği (onLayout)
  wpmRef.current  = wpm

  const tickRef = useRef<() => void>(() => {})
  tickRef.current = () => {
    if (pausedRef.current) return
    const idx = chunkRef.current
    setActiveChunk(idx)
    // Orantılı scroll: sabit tahmin yerine gerçek içerik yüksekliği kullan
    const progress  = (idx + 0.5) / Math.max(1, chunks.length)
    const targetY   = progress * contentHRef.current - viewportHRef.current * 0.35
    scrollRef.current?.scrollTo({ y: Math.max(0, targetY), animated: false })
    if (idx >= chunks.length - 1) {
      const elapsed = Date.now() - startRef.current
      onFinish({ avgWPM: calcWPM(content.wordCount, elapsed),
        durationSec: Math.round(elapsed / 1000), completion: 1.0, comprehension: 72 })
      return
    }
    chunkRef.current = idx + 1
    const delay = Math.round((chunkSizeRef.current / Math.max(1, wpmRef.current)) * 60_000)
    timerRef.current = setTimeout(() => tickRef.current(), delay)
  }

  // Otomatik başlat — giriş ekranı yok
  useEffect(() => {
    startRef.current = Date.now()
    chunkRef.current = 0
    tickRef.current()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Chunk size değişince orantılı pozisyon koru + yeniden başlat
  const handleChunkSize = useCallback((newSize: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const wordPos = chunkRef.current * chunkSizeRef.current
    setChunkSize(newSize)
    // chunks henüz güncellenmedi, ama chunkRef'i ayarla
    setTimeout(() => {
      chunkRef.current = Math.floor(wordPos / newSize)
      if (!pausedRef.current) tickRef.current()
    }, 0)
  }, [])

  const togglePause = useCallback(() => {
    if (pausedRef.current) {
      pausedRef.current = false; setPaused(false); tickRef.current()
    } else {
      pausedRef.current = true; setPaused(true)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const pct        = chunks.length > 0 ? Math.round(((activeChunk + 1) / chunks.length) * 100) : 0
  const wpmPct     = (wpm - SVR_MIN_WPM) / (SVR_MAX_WPM - SVR_MIN_WPM)
  const fontPct    = (fontSize - SVR_MIN_FONT) / (SVR_MAX_FONT - SVR_MIN_FONT)
  const lineH      = Math.round(fontSize * 1.6)   // READING_TYPOGRAPHY: 1.6 line-height ratio

  const BLUE        = '#1A3A6C'        // ana mavi (header + footer)
  const BLUE_LIGHT  = '#2554A0'        // slider fill + vurgu
  const svrBg       = '#F0F4FA'        // metin alanı (açık mavi-gri)
  const wordsRead   = Math.min(activeChunk * chunkSize, content.wordCount)
  const remSec      = Math.max(0, Math.round((chunks.length - activeChunk - 1) * chunkSize / Math.max(1, wpm) * 60))
  const remLabel    = remSec >= 60
    ? `${Math.floor(remSec / 60)}dk ${remSec % 60}sn`
    : `${remSec}sn`

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE }}>

      {/* ── Header (MAVİ) ────────────────────────────────────────── */}
      <View style={{ backgroundColor: BLUE, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 0 }}>

        {/* Başlık satırı */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity onPress={onExit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 32, height: 32, borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>

          <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800',
            color: '#FFFFFF', letterSpacing: 0.3 }}>
            {config.icon}  {config.label}
          </Text>

          <View style={{ width: 44, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: hlColor }}>{pct}%</Text>
          </View>
        </View>

        {/* İlerleme çubuğu */}
        <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 2, marginBottom: 10 }}>
          <View style={{ height: 4, backgroundColor: hlColor, borderRadius: 2,
            width: `${pct}%` as `${number}%` }} />
        </View>

        {/* Kelime sayacı + kalan süre + renk seçici */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#FFFFFF' }}>
              {wordsRead.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', fontWeight: '500' }}>
              / {content.wordCount.toLocaleString()} kelime
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          {!paused && (
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginRight: 14 }}>
              ~{remLabel}
            </Text>
          )}

          {SVR_COLORS.map(({ hex }) => (
            <TouchableOpacity
              key={hex}
              onPress={() => setHlColor(hex)}
              style={{
                width: hlColor === hex ? 26 : 20,
                height: hlColor === hex ? 26 : 20,
                borderRadius: 13, marginLeft: 8,
                backgroundColor: hex,
                borderWidth: hlColor === hex ? 2.5 : 0,
                borderColor: '#fff',
                shadowColor: hex,
                shadowOpacity: hlColor === hex ? 0.6 : 0,
                shadowRadius: 5,
                shadowOffset: { width: 0, height: 0 },
                elevation: hlColor === hex ? 4 : 0,
              }}
            />
          ))}
        </View>
      </View>

      {/* ── Metin Alanı (flex: 1) ──────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: svrBg }}
        contentContainerStyle={{ paddingHorizontal: 38, paddingTop: 14, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onContentSizeChange={(_w, h) => { contentHRef.current = h }}
        onLayout={e => { viewportHRef.current = e.nativeEvent.layout.height }}
      >
        <Text style={{ fontSize, lineHeight: lineH, color: '#1A1A2E',
          letterSpacing: 0.2, textAlign: 'justify', fontFamily: 'Inter_400Regular' }}>  {/* Inter spec: 0.2 letter-spacing */}
          {chunks.map((chunk, i) => (
            <Text
              key={i}
              style={i === activeChunk ? {
                backgroundColor: hlColor + '30',
                color:           hlColor,
                fontWeight:      '800',
                fontFamily:      'Inter_800ExtraBold',
              } : {
                color:      '#1A1A2E',
                opacity:    i < activeChunk ? 0.35 : 0.88,
                fontFamily: 'Inter_400Regular',
              }}
            >
              {chunk}{' '}
            </Text>
          ))}
        </Text>
      </ScrollView>

      {/* ── Alt Kontrol Paneli (MAVİ) ──────────────────────────── */}
      <View style={{
        backgroundColor: BLUE,
        paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, gap: 8,
      }}>

        {/* Satır 1: Chunk seçici + Durdur/Devam */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700',
            letterSpacing: 0.5 }}>
            KELİME
          </Text>
          {([1, 2, 3, 4] as const).map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => handleChunkSize(n)}
              style={{
                width: 34, height: 34, borderRadius: 10,
                backgroundColor: chunkSize === n ? hlColor : 'rgba(255,255,255,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14, fontWeight: '900',
                color: chunkSize === n ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={togglePause}
            style={{
              backgroundColor: paused ? hlColor : 'rgba(255,255,255,0.15)',
              borderRadius: 10, paddingHorizontal: 16, height: 34,
              alignItems: 'center', justifyContent: 'center',
            }}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 13, fontWeight: '800',
              color: '#fff' }}>
              {paused ? '▶ Devam Et' : '⏸ Durdur'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Satır 2: Hız Slider */}
        <View style={{ gap: 3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 0.5 }}>
              HIZ
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>{wpm} KDK</Text>
          </View>
          <View
            style={{ height: 22, justifyContent: 'center' }}
            onLayout={e => setWpmTrackWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={e => {
              if (wpmTrackWidth <= 0) return
              const x = Math.max(0, Math.min(wpmTrackWidth, e.nativeEvent.locationX))
              setWpm(Math.round(SVR_MIN_WPM + (x / wpmTrackWidth) * (SVR_MAX_WPM - SVR_MIN_WPM)))
            }}
            onResponderMove={e => {
              if (wpmTrackWidth <= 0) return
              const x = Math.max(0, Math.min(wpmTrackWidth, e.nativeEvent.locationX))
              setWpm(Math.round(SVR_MIN_WPM + (x / wpmTrackWidth) * (SVR_MAX_WPM - SVR_MIN_WPM)))
            }}
          >
            <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 2 }}>
              <View style={{ height: 3, backgroundColor: hlColor, borderRadius: 2,
                width: `${Math.round(wpmPct * 100)}%` as `${number}%` }} />
            </View>
            <View style={{
              position: 'absolute',
              left: Math.max(0, Math.round(wpmPct * (wpmTrackWidth - 18))),
              width: 18, height: 18, borderRadius: 9,
              backgroundColor: hlColor,
              shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 }, elevation: 4,
              top: -7.5,
            }} />
          </View>
        </View>

        {/* Satır 3: Yazı Boyutu Slider */}
        <View style={{ gap: 3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 0.5 }}>
              YAZI BOYUTU
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>{fontSize}pt</Text>
          </View>
          <View
            style={{ height: 22, justifyContent: 'center' }}
            onLayout={e => setFontTrackWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={e => {
              if (fontTrackWidth <= 0) return
              const x = Math.max(0, Math.min(fontTrackWidth, e.nativeEvent.locationX))
              setFontSize(Math.round(SVR_MIN_FONT + (x / fontTrackWidth) * (SVR_MAX_FONT - SVR_MIN_FONT)))
            }}
            onResponderMove={e => {
              if (fontTrackWidth <= 0) return
              const x = Math.max(0, Math.min(fontTrackWidth, e.nativeEvent.locationX))
              setFontSize(Math.round(SVR_MIN_FONT + (x / fontTrackWidth) * (SVR_MAX_FONT - SVR_MIN_FONT)))
            }}
          >
            <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 2 }}>
              <View style={{ height: 3, backgroundColor: BLUE_LIGHT, borderRadius: 2,
                width: `${Math.round(fontPct * 100)}%` as `${number}%` }} />
            </View>
            <View style={{
              position: 'absolute',
              left: Math.max(0, Math.round(fontPct * (fontTrackWidth - 18))),
              width: 18, height: 18, borderRadius: 9,
              backgroundColor: '#FFFFFF',
              shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3,
              shadowOffset: { width: 0, height: 2 }, elevation: 3,
              top: -7.5,
            }} />
          </View>
        </View>

      </View>

    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SONUÇ EKRANI (tüm modlar için paylaşılan)
// ═══════════════════════════════════════════════════════════════════

interface ResultViewProps {
  metrics:    ReadingModesMetrics
  config:     ModeConfig
  onRepeat:   () => void
  onComplete: () => void
  onExit:     () => void
  onQuiz?:    () => void
  hasQuiz?:   boolean
  t:          AppTheme
}

function ResultView({ metrics, config, onRepeat, onComplete, onExit, onQuiz, hasQuiz, t }: ResultViewProps) {
  const color = config.color

  const modeStats = () => {
    switch (metrics.mode) {
      case 'timed':
        return metrics.timedSuccess
          ? '✅ Süre dolmadan tamamlandı!'
          : '⏱ Süre tükendi — güzel deneme!'
      case 'keyword':
        return `🔍 ${metrics.keywordsFound ?? 0}/${metrics.totalKeywords ?? 0} anahtar kelime yakalandı`
      case 'memory':
        return `🧠 ${metrics.recallCorrect ?? 0}/${metrics.recallTotal ?? 0} blok doğru hatırlandı`
      case 'prediction':
        return `🔮 ${metrics.predictionTotal ?? 0} cümle tahmin edildi`
      case 'focus_filter':
        return `🎯 ${metrics.paragraphsCompleted ?? 0} paragraf odaklı okundu`
      case 'bionic':
        return `🧬 Biyonik formatta ${metrics.totalWords} kelime okundu`
      case 'auto_scroll':
        return `📜 %${Math.round(metrics.completionRatio * 100)} tamamlandı · oto-kaydırma`
      case 'speed_ladder':
        return `🪜 Zirve hız: ${metrics.avgWPM} WPM — merdiveni çıktın!`
      case 'word_burst':
        return `💫 Çok kelime modunda ${metrics.totalWords} kelime işlendi`
      case 'sentence_step':
        return `📝 Cümle cümle ${metrics.totalWords} kelime okundu`
      default:
        return `${config.icon} Seans tamamlandı`
    }
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
      {/* X Kapat butonu */}
      <View style={{ paddingHorizontal:16, paddingTop:8, alignItems:'flex-end' }}>
        <TouchableOpacity onPress={onExit}
          hitSlop={{ top:10, bottom:10, left:10, right:10 }}
          style={{ width:38, height:38, borderRadius:19,
            backgroundColor: t.colors.surface, borderWidth:1, borderColor: t.colors.border,
            alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontSize:18, color: t.colors.textHint, fontWeight:'700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding:24, paddingBottom:60, gap:16, alignItems:'center' }}>
        <Text style={{ fontSize:60 }}>{config.icon}</Text>
        <Text style={{ fontSize:24, fontWeight:'900', color: t.colors.text }}>Tamamlandı!</Text>
        <Text style={{ fontSize:14, color, fontWeight:'700', textAlign:'center' }}>
          {modeStats()}
        </Text>

        {/* ARP Kartı */}
        <View style={{ backgroundColor:color, borderRadius:24, paddingVertical:24,
          paddingHorizontal:40, alignItems:'center', width:'100%' }}>
          <Text style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:6 }}>ARP SKORU</Text>
          <Text style={{ fontSize:72, fontWeight:'900', color:'#fff', lineHeight:80 }}>
            {metrics.arpScore}
          </Text>
          <Text style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>/400</Text>
        </View>

        {/* Metrik grid */}
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:12, width:'100%' }}>
          {[
            { label:'Ort. WPM',   value: String(metrics.avgWPM) },
            { label:'Kelimeler',  value: metrics.totalWords.toLocaleString('tr') },
            { label:'Süre',       value: formatDuration(metrics.durationSeconds) },
            { label:'Tamamlama',  value: `%${Math.round(metrics.completionRatio * 100)}` },
          ].map(m => (
            <View key={m.label} style={{ flex:1, minWidth:'40%',
              backgroundColor: t.colors.surface, borderRadius:16,
              padding:18, alignItems:'center',
              borderWidth:StyleSheet.hairlineWidth, borderColor: t.colors.border }}>
              <Text style={{ fontSize:22, fontWeight:'900', color: t.colors.text }}>{m.value}</Text>
              <Text style={{ fontSize:11, color: t.colors.textHint, marginTop:4 }}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* XP rozeti */}
        <View style={{ backgroundColor: '#F59E0B20', borderRadius:14,
          paddingVertical:14, paddingHorizontal:28,
          borderWidth:1, borderColor:'#F59E0B', width:'100%', alignItems:'center' }}>
          <Text style={{ fontSize:18, fontWeight:'800', color:'#F59E0B' }}>
            +{metrics.xpEarned} XP kazandın! ⭐
          </Text>
        </View>

        {/* Anlama Soruları butonu — yalnızca kütüphane metniyse göster */}
        {hasQuiz && onQuiz && (
          <TouchableOpacity
            style={{ width:'100%', backgroundColor:'#8B5CF6', borderRadius:16,
              paddingVertical:16, alignItems:'center', flexDirection:'row',
              justifyContent:'center', gap:8 }}
            onPress={onQuiz}
          >
            <Text style={{ fontSize:18 }}>🧠</Text>
            <Text style={{ fontSize:15, fontWeight:'700', color:'#fff' }}>Anlama Soruları</Text>
          </TouchableOpacity>
        )}

        {/* Butonlar */}
        <View style={{ flexDirection:'row', gap:12, width:'100%' }}>
          <TouchableOpacity
            style={{ flex:1, backgroundColor: t.colors.surface, borderRadius:16,
              paddingVertical:18, alignItems:'center',
              borderWidth:1, borderColor: t.colors.border }}
            onPress={onRepeat}
          >
            <Text style={{ fontSize:15, fontWeight:'700', color: t.colors.text }}>Tekrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex:2, backgroundColor:color, borderRadius:16,
              paddingVertical:18, alignItems:'center' }}
            onPress={onComplete}
          >
            <Text style={{ fontSize:15, fontWeight:'700', color:'#fff' }}>İleri →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ═══════════════════════════════════════════════════════════════════

interface Props {
  mode:            ReadingModeKey
  onComplete:      (metrics: ReadingModesMetrics) => void
  onExit:          () => void
  /** Kütüphaneden gelen metin — varsa okuma fazına direkt geç */
  initialContent?: ImportedContent
  /** Modüle özgü vurgu rengi — ReadingModuleFlow'dan gelir */
  accentColor?:    string
}

export default function ReadingModesExercise({ mode, onComplete, onExit, initialContent, accentColor }: Props) {
  const t      = useAppTheme()
  const config = MODE_CONFIGS[mode]
  const student = useAuthStore(st => st.student)
  // Modülün kendi rengi yoksa MODE_CONFIGS rengi, varsa accentColor kullan
  const color  = accentColor ?? config.color

  type Phase = 'select' | 'reading' | 'result'
  // initialContent varsa okuma fazına direkt başla
  const [phase,        setPhase]        = useState<Phase>(initialContent ? 'reading' : 'select')
  const [content,      setContent]      = useState<ImportedContent | null>(initialContent ?? null)
  const [showImport,   setShowImport]   = useState(false)
  const [wpm,          setWpm]          = useState(config.defaultWpm)
  const [fontSize,     setFontSize]     = useState(16)
  const [adaptiveWpm,  setAdaptiveWpm]  = useState<number | null>(null)
  const [finalMetrics,  setFinalMetrics]  = useState<ReadingModesMetrics | null>(null)
  const [pendingResult, setPendingResult] = useState<FinishResult | null>(null)
  const [showQuiz,      setShowQuiz]      = useState(false)
  const [questions,     setQuestions]     = useState<TextQuestion[]>([])

  // ── Adaptif WPM: son 5 seanstan genel WPM ortalaması ─────────
  useEffect(() => {
    if (!student?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await (supabase as any)
          .from('reading_mode_sessions')
          .select('avg_wpm')
          .eq('student_id', student.id)
          .gt('avg_wpm', 0)
          .order('created_at', { ascending: false })
          .limit(5)
        if (cancelled || !data || data.length === 0) return
        const arr = (data as { avg_wpm: number }[]).map(r => r.avg_wpm)
        const avg = Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
        // Geçerli aralığa sıkıştır (60–800)
        const suggested = Math.max(60, Math.min(500, avg))
        setAdaptiveWpm(suggested)
        setWpm(suggested)
      } catch {
        // sessiz
      }
    })()
    return () => { cancelled = true }
  }, [student?.id, mode])

  const handleContentSelected = useCallback((c: ImportedContent) => {
    setContent(c)
    setShowImport(false)
  }, [])

  // Kütüphane metni için soruları çek
  const fetchAndShowQuiz = useCallback(async () => {
    const textId = content?.libraryTextId
    if (!textId) return
    try {
      const { data } = await (supabase as any)
        .from('text_questions')
        .select('id, text_id, chapter_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index')
        .eq('text_id', textId)
        .order('order_index')
        .limit(10)
      setQuestions((data as TextQuestion[]) ?? [])
      setShowQuiz(true)
    } catch {
      // sessiz — quiz olmadan devam
    }
  }, [content])

  // (quiz flow: handleFinish içinde doğrudan açılır — ayrı useEffect yok)

  const handleStart = () => {
    if (!content) { setShowImport(true); return }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setPhase('reading')
  }

  // Quiz cevaplarından gerçek comprehension + ARP/XP hesapla, result'a geç
  const finalizeMetrics = useCallback((result: FinishResult, realComprehension: number) => {
    const arp = calcARP(result.avgWPM, realComprehension, 0, result.durationSec)
    const xp  = calcXP(arp, content?.wordCount ?? 0, result.durationSec)
    const metrics: ReadingModesMetrics = {
      mode,
      avgWPM:          result.avgWPM,
      totalWords:      content?.wordCount ?? 0,
      durationSeconds: result.durationSec,
      arpScore:        arp,
      xpEarned:        xp,
      completionRatio: result.completion,
      ...result.specific,
    }
    setFinalMetrics(metrics)
    if (content) saveRecentContent(content, result.avgWPM)
    setPhase('result')
  }, [content, mode])

  const handleQuizComplete = useCallback((answers: QuestionAnswer[]) => {
    setShowQuiz(false)
    const correct = answers.filter(a => a.isCorrect).length
    const realComprehension = answers.length > 0
      ? Math.round((correct / answers.length) * 100)
      : 60
    if (pendingResult) {
      finalizeMetrics(pendingResult, realComprehension)
      setPendingResult(null)
    }
  }, [pendingResult, finalizeMetrics])

  const handleQuizSkip = useCallback(() => {
    setShowQuiz(false)
    if (pendingResult) {
      finalizeMetrics(pendingResult, pendingResult.comprehension)
      setPendingResult(null)
    }
  }, [pendingResult, finalizeMetrics])

  const handleFinish = useCallback((result: FinishResult) => {
    if (content?.source === 'library') {
      // Önce quiz aç — cevaplar gelince finalizeMetrics çağrılır
      setPendingResult(result)
      fetchAndShowQuiz()
    } else {
      // Kütüphane dışı: varsayılan comprehension ile direkt sonuç
      finalizeMetrics(result, result.comprehension)
    }
  }, [content, fetchAndShowQuiz, finalizeMetrics])

  // ── AŞAMA 1: İçerik Seç ──────────────────────────────────────────
  if (phase === 'select') {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: t.colors.background }}>
        <TopBar title={config.label} onExit={onExit} color={color} />

        <View style={{ flex:1, padding:20, gap:14 }}>
          {/* Hero */}
          <View style={{ alignItems:'center', paddingVertical:10, gap:6 }}>
            <Text style={{ fontSize:52 }}>{config.icon}</Text>
            <Text style={{ fontSize:20, fontWeight:'900', color: t.colors.text }}>
              {config.label}
            </Text>
            <Text style={{ fontSize:13, color: t.colors.textHint, textAlign:'center', lineHeight:20 }}>
              {config.description}
            </Text>
          </View>

          {/* WPM Ayarı */}
          <View style={{ backgroundColor: t.colors.surface, borderRadius:16,
            padding:14, borderWidth:1, borderColor: t.colors.border }}>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <Text style={{ fontSize:12, fontWeight:'700', color: t.colors.textHint, letterSpacing:1 }}>
                OKUMA HIZI
              </Text>
              {adaptiveWpm !== null && (
                <View style={{ flexDirection:'row', alignItems:'center', gap:4,
                  backgroundColor:'#10B98115', borderRadius:8,
                  paddingHorizontal:8, paddingVertical:3 }}>
                  <Text style={{ fontSize:10 }}>🤖</Text>
                  <Text style={{ fontSize:10, fontWeight:'700', color:'#10B981' }}>
                    Adaptif: {adaptiveWpm} WPM
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
              <TouchableOpacity
                style={{ backgroundColor: t.colors.background, borderRadius:12,
                  paddingHorizontal:16, paddingVertical:10,
                  borderWidth:1, borderColor: t.colors.border }}
                onPress={() => setWpm(w => Math.max(60, w - 25))}
              >
                <Text style={{ fontSize:16, fontWeight:'700', color: t.colors.text }}>−</Text>
              </TouchableOpacity>
              <Text style={{ fontSize:32, fontWeight:'900', color }}>
                {wpm} <Text style={{ fontSize:14, color: t.colors.textHint }}>WPM</Text>
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: t.colors.background, borderRadius:12,
                  paddingHorizontal:16, paddingVertical:10,
                  borderWidth:1, borderColor: t.colors.border }}
                onPress={() => setWpm(w => Math.min(500, w + 25))}
              >
                <Text style={{ fontSize:16, fontWeight:'700', color: t.colors.text }}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection:'row', justifyContent:'space-evenly', marginTop:12 }}>
              {([80, 120, 180, 250, 350, 500] as const).map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={{ borderRadius:10, paddingHorizontal:8, paddingVertical:6,
                    backgroundColor: wpm === preset ? color : t.colors.background,
                    borderWidth:1, borderColor: wpm === preset ? color : t.colors.border }}
                  onPress={() => setWpm(preset)}
                >
                  <Text style={{ fontSize:12, fontWeight:'700',
                    color: wpm === preset ? '#fff' : t.colors.textHint }}>
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* İçerik Seçim */}
          {content ? (
            <View style={{ backgroundColor: t.colors.surface, borderRadius:16,
              padding:16, borderWidth:1, borderColor: t.colors.border, gap:8 }}>
              <Text style={{ fontSize:16, fontWeight:'700', color: t.colors.text }}>
                {content.title}
              </Text>
              <Text style={{ fontSize:13, color: t.colors.textHint }}>
                {content.wordCount} kelime · ~{content.estimatedMinutes} dk · {content.source}
              </Text>
              <TouchableOpacity onPress={() => setShowImport(true)}
                style={{ alignSelf:'flex-start', borderRadius:999, paddingHorizontal:12,
                  paddingVertical:6, backgroundColor: t.colors.background,
                  borderWidth:1, borderColor: t.colors.border }}>
                <Text style={{ fontSize:12, color, fontWeight:'700' }}>Değiştir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{ backgroundColor: t.colors.surface, borderRadius:20, padding:28,
                alignItems:'center', borderWidth:2, borderColor: color + '50',
                borderStyle:'dashed', gap:8 }}
              onPress={() => setShowImport(true)}
            >
              <Text style={{ fontSize:40 }}>📚</Text>
              <Text style={{ fontSize:17, fontWeight:'700', color: t.colors.text }}>İçerik Seç</Text>
              <Text style={{ fontSize:13, color: t.colors.textHint }}>Kütüphane veya metin gir</Text>
            </TouchableOpacity>
          )}

          {/* Başlat */}
          <TouchableOpacity
            style={{ backgroundColor: color, borderRadius:18,
              paddingVertical:20, alignItems:'center',
              opacity: content ? 1 : 0.45 }}
            onPress={handleStart}
            disabled={!content}
          >
            <Text style={{ fontSize:18, fontWeight:'900', color:'#fff' }}>▶ Başlat</Text>
          </TouchableOpacity>
        </View>

        <ContentImportModal
          visible={showImport}
          onClose={() => setShowImport(false)}
          onContentSelected={handleContentSelected}
        />
      </SafeAreaView>
    )
  }

  // ── AŞAMA 2: Aktif Okuma ──────────────────────────────────────────
  if (phase === 'reading' && content) {
    const props: ReadingViewProps = {
      content, config, wpm, fontSize, onFontSizeChange: setFontSize,
      onFinish: handleFinish, onExit: () => setPhase('select'), t, color,
    }
    let readEl: React.ReactElement | null = null
    switch (mode) {
      case 'timed':        readEl = <TimedView        {...props} />; break
      case 'academic':     readEl = <AcademicView     {...props} />; break
      case 'keyword':      readEl = <KeywordView      {...props} />; break
      case 'memory':       readEl = <MemoryView       {...props} />; break
      case 'prediction':   readEl = <PredictionView   {...props} />; break
      case 'focus_filter': readEl = <FocusFilterView  {...props} />; break
      case 'subvocal':     readEl = <SubvocalView     {...props} />; break
      case 'bionic':       readEl = <BionicView       {...props} />; break
      case 'auto_scroll':  readEl = <AutoScrollView   {...props} />; break
      case 'speed_ladder': readEl = <SpeedLadderView  {...props} />; break
      case 'word_burst':   readEl = <WordBurstView    {...props} />; break
      case 'sentence_step':readEl = <SentenceStepView {...props} />; break
      case 'svr':          readEl = <SVRView          {...props} />; break
    }
    if (!readEl) return null
    return (
      <>
        {readEl}
        {/* Okuma biter bitmez quiz overlay — cevaplar gerçek comprehension hesabına gider */}
        <QuestionModal
          visible={showQuiz}
          questions={questions}
          textId={content?.libraryTextId ?? ''}
          chapterId={null}
          onComplete={handleQuizComplete}
          onSkip={handleQuizSkip}
        />
      </>
    )
  }

  // ── AŞAMA 3: Seans Sonu ────────────────────────────────────────────
  if (phase === 'result' && finalMetrics) {
    return (
      <>
        <ResultView
          metrics={finalMetrics}
          config={{ ...config, color }}
          onRepeat={() => {
            setPhase('select')
            setFinalMetrics(null)
          }}
          onComplete={() => onComplete(finalMetrics)}
          onExit={onExit}
          onQuiz={fetchAndShowQuiz}
          hasQuiz={content?.source === 'library'}
          t={t}
        />
        {/* Sonuç ekranında tekrar açılabilen quiz — tamamlayınca burada kalır */}
        <QuestionModal
          visible={showQuiz}
          questions={questions}
          textId={content?.libraryTextId ?? ''}
          chapterId={null}
          onComplete={() => setShowQuiz(false)}
          onSkip={() => setShowQuiz(false)}
        />
      </>
    )
  }

  return null
}
