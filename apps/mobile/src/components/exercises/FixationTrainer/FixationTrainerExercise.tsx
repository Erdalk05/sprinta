// =====================================================================
// FixationTrainerExercise.tsx — Sprint 11
// Göz Genişliği Antrenmanı — tam UI
//
// Faz akışı:
//   intro → flash → answer → feedback → (break) → result
//
// Her "tur": FIXATION_COUNT adet flash-cevap döngüsü
// Toplam: ROUNDS tur = bir antrenman seansı
// =====================================================================

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import {
  buildFixations, buildSessionSummary, calculateNextSpan,
  SPAN_LABELS, SPAN_DESCRIPTION, SPAN_COLORS,
  type FixationItem, type FixationResult,
} from './FixationTrainerEngine'

// ─── Tipler ───────────────────────────────────────────────────────

export interface FixationTrainerMetrics {
  spanLevel:      number
  newSpanLevel:   number
  accuracy:       number
  effectiveWPM:   number
  xpEarned:       number
  levelDirection: 'up' | 'down' | 'same'
  durationMs:     number
}

interface Props {
  spanLevel?: number
  onComplete: (metrics: FixationTrainerMetrics) => void
  onExit:     () => void
}

type Phase = 'intro' | 'flash' | 'answer' | 'feedback' | 'break' | 'result'

// ─── Sabitler ─────────────────────────────────────────────────────

const FIXATION_COUNT = 12   // bir turda kaç flash
const ROUNDS         = 3    // toplam tur sayısı
const BLANK_MS       = 220  // flash bittikten sonra boş ekran (ms)

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

// Antrenman içerikleri (Türkçe bağlamsal kelimeler — gerçek metin benzeri)
const TRAINING_TEXTS = [
  `Hızlı okuma becerisini geliştirmek için düzenli pratik şarttır. Her gün kısa antrenmanlar yaparak göz kaslarını güçlendirin. Beyin kelime gruplarını tanımayı zamanla öğrenir ve hız artar. Dikkat ile konsantrasyon hızlı okumada kilit rol oynar. Sabır ve düzenlilik başarının temel taşıdır. Görsel algı kapasitesi antrenmanla genişler. Okuma hızı arttıkça anlama da güçlenir. Kelime tanıma otomatikleşince yorgunluk azalır. Göz kasları güçlendikçe satır atlamalar azalır. Beyin örüntüleri anlama sürecini hızlandırır.`,
  `Türkiye sınavlarında okuma hızı büyük avantaj sağlar. YKS ve LGS metinleri uzun ve dikkat gerektirir. Hızlı okuma ile zaman baskısını aşmak mümkündür. Her paragrafı tek seferde anlamak idealdir. Sorulara odaklanmak için metni hızlı tarayın. Anahtar kelimeler bulunca anlam netleşir. Akıcı okuma sınav başarısını artırır. Düzenli pratik yapan öğrenciler daha iyi sonuç alır. Beyin antrenmanı süreklilik gerektirir. Küçük adımlarla büyük gelişmeler elde edilir.`,
  `Göz genişliği antrenmanı saniyede daha fazla bilgi almayı sağlar. Tek bir göz hareketi ile birden fazla kelime yakalanabilir. Periferik görme eğitimi bu beceriyi geliştirir. Merkezi odak ile çevre görme birlikte çalışır. Her fiksasyonda daha geniş alan taranır. Okuma sırasında göz geri gitmez hale gelir. Regresyon azaldıkça hız dramatik şekilde artar. Bilinçaltı kelime tanıma devreye girer. Motor göz becerileri güçlenir. Antrenman sonuçları birkaç haftada görülür.`,
]

// ─── Ana Bileşen ───────────────────────────────────────────────────

export default function FixationTrainerExercise({
  spanLevel: initialSpan = 1,
  onComplete,
  onExit,
}: Props) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  const [phase,        setPhase]        = useState<Phase>('intro')
  const [fixations,    setFixations]    = useState<FixationItem[]>([])
  const [currentIdx,   setCurrentIdx]   = useState(0)
  const [results,      setResults]      = useState<FixationResult[]>([])
  const [lastCorrect,  setLastCorrect]  = useState<boolean | null>(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [currentSpan,  setCurrentSpan]  = useState(initialSpan)
  const [showCorrect,  setShowCorrect]  = useState(false)

  const sessionStartRef  = useRef(Date.now())
  const answerStartRef   = useRef(0)
  const textIndexRef     = useRef(0)
  const flashTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reanimated değerleri
  const flashOpacity  = useSharedValue(0)
  const answerOpacity = useSharedValue(0)
  const bgScale       = useSharedValue(1)

  const flashStyle  = useAnimatedStyle(() => ({ opacity: flashOpacity.value }))
  const answerStyle = useAnimatedStyle(() => ({ opacity: answerOpacity.value }))

  // ── Oturumu başlat ──────────────────────────────────────────────
  const startSession = useCallback(() => {
    const txt   = TRAINING_TEXTS[textIndexRef.current % TRAINING_TEXTS.length]
    const items = buildFixations(txt, currentSpan, FIXATION_COUNT)
    setFixations(items)
    setCurrentIdx(0)
    setResults([])
    sessionStartRef.current = Date.now()
    setPhase('flash')
  }, [currentSpan])

  // ── Flash döngüsü ───────────────────────────────────────────────
  const runFlash = useCallback((item: FixationItem) => {
    flashOpacity.value  = 0
    answerOpacity.value = 0

    // Göster → tut → kapat
    // NOT: Reanimated 4'te withSequence içindeki withTiming callback'i
    //      güvenilmez — setTimeout ile geçiş yapıyoruz.
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: item.flashMs }),
      withTiming(0, { duration: 80 }),
    )

    // Animasyon toplam süresinin sonunda cevap fazına geç
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => {
      answerStartRef.current = Date.now()
      setPhase('answer')
      answerOpacity.value = withTiming(1, { duration: 180 })
    }, 80 + item.flashMs + 80 + BLANK_MS)
  }, [flashOpacity, answerOpacity])

  // Flash faz tetikleyici
  useEffect(() => {
    if (phase !== 'flash') return
    if (fixations.length === 0 || currentIdx >= fixations.length) return
    const timer = setTimeout(() => runFlash(fixations[currentIdx]), 80)
    return () => clearTimeout(timer)
  }, [phase, currentIdx, fixations, runFlash])

  // ── Cevap seç ──────────────────────────────────────────────────
  const handleAnswer = useCallback((optIdx: number) => {
    if (phase !== 'answer') return
    const item      = fixations[currentIdx]
    const isCorrect = optIdx === item.correctIndex
    const respMs    = Date.now() - answerStartRef.current

    Haptics.impactAsync(
      isCorrect
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    )

    const newResults = [...results, { fixationId: item.id, isCorrect, responseMs: respMs }]
    setResults(newResults)
    setLastCorrect(isCorrect)
    setShowCorrect(true)
    setPhase('feedback')
    answerOpacity.value = withTiming(0, { duration: 120 })

    setTimeout(() => {
      setShowCorrect(false)
      const next = currentIdx + 1

      if (next >= fixations.length) {
        // Tur bitti
        if (currentRound >= ROUNDS) {
          // Son tur → sonuç
          const totalMs = Date.now() - sessionStartRef.current
          const summary = buildSessionSummary(newResults, currentSpan, totalMs)
          setCurrentSpan(summary.newSpanLevel)
          setPhase('result')
        } else {
          setCurrentRound(r => r + 1)
          textIndexRef.current += 1
          setPhase('break')
        }
      } else {
        setCurrentIdx(next)
        setPhase('flash')
      }
    }, 550)
  }, [
    phase, fixations, currentIdx, results,
    currentRound, currentSpan,
  ])

  // ── Tur arası devam ────────────────────────────────────────────
  const handleContinueRound = useCallback(() => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    const txt   = TRAINING_TEXTS[textIndexRef.current % TRAINING_TEXTS.length]
    const items = buildFixations(txt, currentSpan, FIXATION_COUNT)
    setFixations(items)
    setCurrentIdx(0)
    setPhase('flash')
  }, [currentSpan])

  // ── Tamamla ────────────────────────────────────────────────────
  const handleFinish = useCallback(() => {
    const totalMs = Date.now() - sessionStartRef.current
    const summary = buildSessionSummary(results, initialSpan, totalMs)
    onComplete({
      spanLevel:      initialSpan,
      newSpanLevel:   summary.newSpanLevel,
      accuracy:       summary.accuracy,
      effectiveWPM:   summary.effectiveWPM,
      xpEarned:       summary.xpEarned,
      levelDirection: summary.levelDirection,
      durationMs:     totalMs,
    })
  }, [results, initialSpan, onComplete])

  const currentItem = fixations[currentIdx]
  const roundAcc    = results.length > 0
    ? Math.round(results.filter(r => r.isCorrect).length / results.length * 100)
    : 0
  const spanColor   = SPAN_COLORS[currentSpan] ?? '#8B5CF6'

  // ── INTRO ──────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.introWrap}>
          <Text style={{ fontSize: 72, marginBottom: 8 }}>👁️</Text>
          <Text style={s.introTitle}>Göz Genişliği{'\n'}Antrenmanı</Text>

          <View style={[s.levelBadge, { backgroundColor: spanColor + '20' }]}>
            <Text style={[s.levelBadgeTxt, { color: spanColor }]}>
              Seviye {currentSpan} — {SPAN_LABELS[currentSpan]}
            </Text>
          </View>

          <Text style={s.introDesc}>{SPAN_DESCRIPTION[currentSpan]}</Text>

          <View style={s.howBox}>
            <Text style={s.howTitle}>Nasıl çalışır?</Text>
            <Text style={s.howItem}>⚡  Ekranda kelimeler hızla çakar</Text>
            <Text style={s.howItem}>🎯  Gördüğün grubu seç (4 seçenek)</Text>
            <Text style={s.howItem}>🏆  %80 doğrulukta seviye atlarsın</Text>
            <Text style={s.howItem}>📊  {ROUNDS} tur × {FIXATION_COUNT} flash = 1 antrenman</Text>
          </View>

          <TouchableOpacity style={[s.startBtn, { backgroundColor: spanColor }]} onPress={startSession}>
            <Text style={s.startBtnTxt}>Antrenmanı Başlat →</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onExit}
            hitSlop={{ top:10, bottom:10, left:10, right:10 }}
            style={{ marginTop:16, width:40, height:40, borderRadius:20,
              backgroundColor: t.colors.surface, borderWidth:1, borderColor: t.colors.border,
              alignItems:'center', justifyContent:'center', alignSelf:'center' }}>
            <Text style={{ fontSize:18, color: t.colors.textHint, fontWeight:'700' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────
  if (phase === 'result') {
    const totalMs = Date.now() - sessionStartRef.current
    const summary = buildSessionSummary(results, initialSpan, totalMs)
    const pctColor = summary.accuracy >= 0.8
      ? '#10B981'
      : summary.accuracy >= 0.5
      ? '#F59E0B'
      : '#EF4444'
    const emoji = summary.accuracy >= 0.8 ? '🏆' : summary.accuracy >= 0.5 ? '💪' : '📖'

    return (
      <SafeAreaView style={s.root}>
        {/* X Kapat */}
        <View style={{ paddingHorizontal:16, paddingTop:8, alignItems:'flex-end' }}>
          <TouchableOpacity onPress={onExit}
            hitSlop={{ top:10, bottom:10, left:10, right:10 }}
            style={{ width:38, height:38, borderRadius:19,
              backgroundColor: t.colors.surface, borderWidth:1, borderColor: t.colors.border,
              alignItems:'center', justifyContent:'center' }}>
            <Text style={{ fontSize:18, color: t.colors.textHint, fontWeight:'700' }}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={s.resultWrap}>
          <Text style={{ fontSize: 64, marginBottom: 4 }}>{emoji}</Text>
          <Text style={s.resultTitle}>Antrenman Tamamlandı!</Text>

          <View style={[s.scoreBadge, { backgroundColor: pctColor }]}>
            <Text style={s.scorePct}>%{Math.round(summary.accuracy * 100)}</Text>
            <Text style={s.scoreLabel}>{summary.correctCount}/{summary.totalFixations} doğru</Text>
          </View>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={[s.statVal, { color: spanColor }]}>{summary.effectiveWPM}</Text>
              <Text style={s.statKey}>Etkin WPM</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statVal, { color: '#F59E0B' }]}>+{summary.xpEarned}</Text>
              <Text style={s.statKey}>XP Kazandın</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statVal, {
                color: summary.levelChanged
                  ? (summary.levelDirection === 'up' ? '#10B981' : '#EF4444')
                  : t.colors.text,
              }]}>
                {summary.newSpanLevel}
              </Text>
              <Text style={s.statKey}>Yeni Seviye</Text>
            </View>
          </View>

          {summary.levelChanged && (
            <View style={[s.levelChangeBox, {
              borderColor: summary.levelDirection === 'up' ? '#10B981' : '#EF4444',
            }]}>
              <Text style={{ fontSize: 22 }}>
                {summary.levelDirection === 'up' ? '⬆️ Seviye Atladın!' : '⬇️ Biraz Daha Pratik'}
              </Text>
              <Text style={{ color: t.colors.textHint, fontSize: t.font.sm, marginTop: 4, textAlign: 'center' }}>
                {summary.levelDirection === 'up'
                  ? `Tebrikler! ${SPAN_LABELS[summary.newSpanLevel]} seviyesine geçtin.`
                  : 'Bu seviyede birkaç antrenman daha yap.'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.startBtn, { backgroundColor: pctColor }]}
            onPress={handleFinish}
          >
            <Text style={s.startBtnTxt}>İleri →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── BREAK ──────────────────────────────────────────────────────
  if (phase === 'break') {
    return (
      <SafeAreaView style={[s.root, s.breakRoot]}>
        <Text style={{ fontSize: 48 }}>✨</Text>
        <Text style={s.breakTitle}>Tur {currentRound - 1} Tamamlandı!</Text>
        <Text style={[s.breakSub, { color: '#10B981' }]}>%{roundAcc} doğruluk</Text>
        <Text style={[s.breakSub, { color: t.colors.textHint, marginTop: 4 }]}>
          {currentRound} / {ROUNDS} tur
        </Text>
        <TouchableOpacity
          style={[s.startBtn, { marginTop: 36, backgroundColor: spanColor }]}
          onPress={handleContinueRound}
        >
          <Text style={s.startBtnTxt}>Sonraki Tur →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // ── FLASH / ANSWER / FEEDBACK ──────────────────────────────────
  if (!currentItem) return null

  return (
    <SafeAreaView style={[s.root, s.darkRoot]}>

      {/* Üst bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={onExit} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={{ color: t.colors.textHint, fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>

        <View style={s.progressTrack}>
          <View style={[s.progressFill, {
            width: `${Math.round((currentIdx / FIXATION_COUNT) * 100)}%` as any,
            backgroundColor: spanColor,
          }]} />
        </View>

        <Text style={s.counterTxt}>{currentIdx + 1}/{FIXATION_COUNT}</Text>
      </View>

      {/* Tur göstergesi */}
      <View style={s.roundRow}>
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <View
            key={i}
            style={[
              s.roundDot,
              i < currentRound - 1  && { backgroundColor: '#10B981' },
              i === currentRound - 1 && { backgroundColor: spanColor },
            ]}
          />
        ))}
      </View>

      {/* Flash alanı */}
      <View style={s.flashArea}>

        {/* Kelimeleri flash et */}
        {(phase === 'flash' || phase === 'feedback') && (
          <Animated.View style={flashStyle}>
            <Text style={s.flashTxt}>
              {currentItem.words.join('  ')}
            </Text>
          </Animated.View>
        )}

        {/* Cevap sorusu */}
        {phase === 'answer' && (
          <Animated.View style={[s.questionHint, answerStyle]}>
            <Text style={s.questionHintTxt}>Hangi grubu gördün?</Text>
          </Animated.View>
        )}

        {/* Geri bildirim */}
        {phase === 'feedback' && lastCorrect !== null && (
          <View style={[s.feedbackBadge, {
            backgroundColor: lastCorrect ? '#10B98125' : '#EF444425',
          }]}>
            <Text style={{
              fontSize:   32,
              fontWeight: '900',
              color:      lastCorrect ? '#10B981' : '#EF4444',
            }}>
              {lastCorrect ? '✓' : '✗'}
            </Text>
          </View>
        )}

      </View>

      {/* Seçenekler */}
      {phase === 'answer' && (
        <Animated.View style={[s.optionsGrid, answerStyle]}>
          {currentItem.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[s.optionBtn, { borderColor: spanColor + '40' }]}
              onPress={() => handleAnswer(i)}
              activeOpacity={0.72}
            >
              <View style={[s.optionLetter, { backgroundColor: spanColor + '25' }]}>
                <Text style={[s.optionLetterTxt, { color: spanColor }]}>
                  {OPTION_LETTERS[i]}
                </Text>
              </View>
              <Text style={s.optionTxt}>{opt.join('  ')}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Seviye etiketi */}
      <View style={s.bottomBar}>
        <Text style={[s.spanLabel, { color: spanColor }]}>
          Göz Alanı: {currentSpan} kelime — {SPAN_LABELS[currentSpan]}
        </Text>
      </View>

    </SafeAreaView>
  )
}

// ─── Stiller ──────────────────────────────────────────────────────
function createStyles(t: AppTheme) {
  const { width } = Dimensions.get('window')

  return StyleSheet.create({
    root: {
      flex:            1,
      backgroundColor: t.colors.background,
    },
    darkRoot: {
      backgroundColor: t.isDark ? '#050C08' : '#0A1A0F',
    },

    // ── Intro ────────────────────────────────────────
    introWrap: {
      flex:            1,
      alignItems:      'center',
      justifyContent:  'center',
      paddingHorizontal: 28,
      gap:             12,
    },
    introTitle: {
      fontSize:   28,
      fontWeight: '900',
      color:      t.colors.text,
      textAlign:  'center',
      lineHeight: 36,
    },
    levelBadge: {
      paddingHorizontal: 20,
      paddingVertical:   8,
      borderRadius:      24,
      marginTop:         4,
    },
    levelBadgeTxt: {
      fontSize:   t.font.sm,
      fontWeight: '800',
    },
    introDesc: {
      fontSize:  t.font.sm,
      color:     t.colors.textHint,
      textAlign: 'center',
      lineHeight: 20,
    },
    howBox: {
      width:           '100%',
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.md,
      gap:             8,
    },
    howTitle: {
      fontSize:   t.font.sm,
      fontWeight: '800',
      color:      t.colors.text,
      marginBottom: 4,
    },
    howItem: {
      fontSize:  t.font.sm,
      color:     t.colors.textHint,
      lineHeight: 20,
    },
    startBtn: {
      width:           '100%',
      borderRadius:    t.radius.md,
      paddingVertical: 18,
      alignItems:      'center',
      marginTop:       8,
    },
    startBtnTxt: {
      fontSize:   t.font.md,
      fontWeight: '900',
      color:      '#fff',
    },

    // ── Top bar ──────────────────────────────────────
    topBar: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 20,
      paddingVertical:   14,
      gap:               12,
    },
    progressTrack: {
      flex:            1,
      height:          4,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius:    2,
      overflow:        'hidden',
    },
    progressFill: {
      height:       4,
      borderRadius: 2,
    },
    counterTxt: {
      fontSize:   t.font.xs,
      color:      'rgba(255,255,255,0.50)',
      fontWeight: '700',
      minWidth:   36,
      textAlign:  'right',
    },

    // ── Tur noktaları ─────────────────────────────────
    roundRow: {
      flexDirection:  'row',
      justifyContent: 'center',
      gap:            8,
      marginBottom:   8,
    },
    roundDot: {
      width:        8,
      height:       8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.18)',
    },

    // ── Flash alanı ───────────────────────────────────
    flashArea: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    flashTxt: {
      fontSize:        Math.min(42, width * 0.09),
      fontWeight:      '900',
      color:           '#FFFFFF',
      textAlign:       'center',
      letterSpacing:   2,
    },
    questionHint: {
      alignItems: 'center',
    },
    questionHintTxt: {
      fontSize:   t.font.md,
      color:      'rgba(255,255,255,0.50)',
      fontWeight: '600',
    },
    feedbackBadge: {
      marginTop:    20,
      width:        64,
      height:       64,
      borderRadius: 32,
      alignItems:   'center',
      justifyContent: 'center',
    },

    // ── Seçenekler ────────────────────────────────────
    optionsGrid: {
      paddingHorizontal: 20,
      paddingBottom:     8,
      gap:               10,
    },
    optionBtn: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             12,
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius:    t.radius.md,
      padding:         14,
      borderWidth:     1,
    },
    optionLetter: {
      width:        32,
      height:       32,
      borderRadius: 16,
      alignItems:   'center',
      justifyContent: 'center',
      flexShrink:   0,
    },
    optionLetterTxt: {
      fontSize:   t.font.sm,
      fontWeight: '900',
    },
    optionTxt: {
      flex:       1,
      fontSize:   t.font.sm,
      color:      '#FFFFFF',
      fontWeight: '600',
      letterSpacing: 1,
    },

    // ── Alt bar ───────────────────────────────────────
    bottomBar: {
      alignItems:     'center',
      paddingVertical: 12,
    },
    spanLabel: {
      fontSize:   t.font.xs,
      fontWeight: '700',
    },

    // ── Break ─────────────────────────────────────────
    breakRoot: {
      alignItems:     'center',
      justifyContent: 'center',
      gap:            8,
    },
    breakTitle: {
      fontSize:   26,
      fontWeight: '900',
      color:      t.colors.text,
    },
    breakSub: {
      fontSize:   t.font.md,
      fontWeight: '700',
    },

    // ── Result ────────────────────────────────────────
    resultWrap: {
      flex:            1,
      alignItems:      'center',
      justifyContent:  'center',
      paddingHorizontal: 28,
      gap:             14,
    },
    resultTitle: {
      fontSize:   22,
      fontWeight: '900',
      color:      t.colors.text,
    },
    scoreBadge: {
      borderRadius:      24,
      paddingVertical:   24,
      paddingHorizontal: 48,
      alignItems:        'center',
      width:             '100%',
    },
    scorePct: {
      fontSize:   54,
      fontWeight: '900',
      color:      '#fff',
      lineHeight: 60,
    },
    scoreLabel: {
      fontSize:   t.font.sm,
      color:      'rgba(255,255,255,0.80)',
      fontWeight: '600',
    },
    statsRow: {
      flexDirection:  'row',
      gap:            12,
      width:          '100%',
    },
    statBox: {
      flex:            1,
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         14,
      alignItems:      'center',
      gap:             4,
    },
    statVal: {
      fontSize:   22,
      fontWeight: '900',
      color:      t.colors.text,
    },
    statKey: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      fontWeight: '600',
      textAlign: 'center',
    },
    levelChangeBox: {
      width:        '100%',
      borderWidth:  1,
      borderRadius: t.radius.md,
      padding:      t.spacing.md,
      alignItems:   'center',
      gap:          4,
    },
  })
}
