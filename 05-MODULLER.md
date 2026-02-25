# 05 — EĞİTİM MODÜLLERİ
## 4 Bilimsel Okuma Egzersizi Modülü

> MEB müfredatı uyumlu, sınav odaklı 4 modül  
> Her modül: teorik temel + egzersiz türleri + React Native bileşenleri

---

## İÇİNDEKİLER

1. [Modül Mimarisi](#1-modül-mimarisi)
2. [Modül 1: Hız Kontrolü](#2-modül-1-hız-kontrolü)
3. [Modül 2: Derin Kavrama](#3-modül-2-derin-kavrama)
4. [Modül 3: Dikkat Gücü](#4-modül-3-dikkat-gücü)
5. [Modül 4: Zihinsel Sıfırlama](#5-modül-4-zihinsel-sıfırlama)
6. [Egzersiz Store](#6-egzersiz-store)
7. [Modül Ekranı](#7-modül-ekranı)

---

## 1. MODÜL MİMARİSİ

```
Her modül şu bileşenleri içerir:
  - Bilimsel temel (neden bu egzersiz?)
  - Egzersiz tipleri (2-4 adet)
  - React Native bileşeni
  - Tamamlanma callback'i (performancePipeline'a bağlı)
  - Zorluk skalası (1-10)

Ortak egzersiz bileşeni arayüzü:
interface ExerciseProps {
  exerciseId: string;
  contentId?: string;
  difficulty: number;        // 1-10
  durationSeconds: number;   // Hedef süre
  onComplete: (metrics: SessionMetrics) => void;
  onExit: () => void;
}
```

### Dosya Yapısı

```
apps/mobile/src/
├── components/
│   └── exercises/
│       ├── SpeedControl/
│       │   ├── RSVPExercise.tsx
│       │   ├── ChunkingExercise.tsx
│       │   └── PacingExercise.tsx
│       ├── DeepComprehension/
│       │   ├── MainIdeaExercise.tsx
│       │   ├── DetailRecallExercise.tsx
│       │   └── InferenceExercise.tsx
│       ├── AttentionPower/
│       │   ├── FocusLockExercise.tsx
│       │   └── SustainedFocusExercise.tsx
│       └── MentalReset/
│           ├── BreathingExercise.tsx
│           └── EyeRelaxationExercise.tsx
└── screens/
    └── modules/
        ├── SpeedControlScreen.tsx
        ├── DeepComprehensionScreen.tsx
        ├── AttentionPowerScreen.tsx
        └── MentalResetScreen.tsx
```

---

## 2. MODÜL 1: HIZ KONTROLÜ

### Bilimsel Temel

LGS/TYT'de bir okuma sorusu için verilen süre: ~45 saniye.  
Türk lise öğrencisi ortalama okuma hızı: ~180-200 WPM.  
LGS için hedef: 250+ WPM, %75+ anlama.

**Egzersizler:**
- RSVP (Rapid Serial Visual Presentation): Her kelime sırayla, tek tek
- Kelime Gruplama (Chunking): 2-3 kelimelik bloklar
- Rehberli Okuma (Pacing): Kaydırmalı rehber çizgisi

---

### RSVP Egzersizi

```tsx
// apps/mobile/src/components/exercises/SpeedControl/RSVPExercise.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ExerciseProps } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RSVPConfig {
  startWpm: number;    // Başlangıç WPM (zorluktan hesaplanır)
  targetWpm: number;   // Hedef WPM
  text: string;        // Okutulacak metin
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
}

export function RSVPExercise({
  exerciseId,
  contentId,
  difficulty,
  durationSeconds,
  onComplete,
  onExit,
}: ExerciseProps) {
  // WPM zorluktan hesapla: zorluk 1 → 150 WPM, zorluk 10 → 500 WPM
  const targetWpm = 150 + (difficulty - 1) * 39;
  const intervalMs = Math.round(60000 / targetWpm);

  const [phase, setPhase] = useState<'reading' | 'questions' | 'results'>('reading');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Metni yükle (content_id'den gelecek — şimdilik örnek)
  useEffect(() => {
    const sampleText = `Güneş sistemi, güneş ve onun etrafında dönen sekiz gezegen ile
      bunların uydularından oluşur. Dünya, güneşten üçüncü gezegendir ve şu ana kadar
      bilinen tek yaşam barındıran gezegendir. Atmosfer, canlıları zararlı kozmik
      ışınımdan korurken ısı dengesini de sağlar. Okyanuslar gezegenin yüzde yetmiş
      birini kaplar ve su döngüsü aracılığıyla iklimi düzenler.`;
    
    const wordList = sampleText
      .replace(/\n/g, ' ')
      .split(' ')
      .filter(w => w.trim().length > 0);
    
    setWords(wordList);
    setCurrentWord(wordList[0] ?? '');
    
    setQuestions([
      {
        id: 'q1',
        text: 'Dünya güneşten kaçıncı gezegendir?',
        options: ['İkinci', 'Üçüncü', 'Dördüncü', 'Beşinci'],
        answerIndex: 1,
      },
      {
        id: 'q2',
        text: 'Okyanuslar Dünya yüzeyinin ne kadarını kaplar?',
        options: ['%50', '%60', '%71', '%80'],
        answerIndex: 2,
      },
    ]);
  }, []);

  const startReading = useCallback(() => {
    setIsPlaying(true);
    setStartTime(Date.now());
    
    intervalRef.current = setInterval(() => {
      setCurrentWordIndex(prev => {
        const next = prev + 1;
        
        if (next >= words.length) {
          // Bitti
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          setPhase('questions');
          setQuestionStartTime(Date.now());
          return prev;
        }
        
        // Kelime geçişi animasyonu
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: intervalMs * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: intervalMs * 0.2,
            useNativeDriver: true,
          }),
        ]).start();
        
        setCurrentWord(words[next]);
        return next;
      });
    }, intervalMs);
  }, [words, intervalMs]);

  const handleAnswer = useCallback(async (selectedIndex: number) => {
    await Haptics.selectionAsync();
    
    const responseTime = Date.now() - questionStartTime;
    setResponseTimes(prev => [...prev, responseTime]);
    setAnswers(prev => [...prev, selectedIndex]);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(qi => qi + 1);
      setQuestionStartTime(Date.now());
    } else {
      // Tüm sorular tamamlandı — sonuçları hesapla
      const allAnswers = [...answers, selectedIndex];
      const correctCount = allAnswers.filter(
        (ans, i) => ans === questions[i].answerIndex
      ).length;
      const comprehension = Math.round((correctCount / questions.length) * 100);
      
      const readingDuration = (Date.now() - startTime) / 1000;
      const actualWpm = Math.round((words.length / readingDuration) * 60);

      onComplete({
        wpm: actualWpm,
        comprehension,
        accuracy: comprehension,  // RSVP'de accuracy = comprehension
        score: Math.round((comprehension * 0.6 + (actualWpm / targetWpm * 100) * 0.4)),
        durationSeconds: Math.round(readingDuration) + Math.round((Date.now() - questionStartTime) / 1000),
        exerciseType: 'rsvp',
        moduleCode: 'speed_control',
        difficultyLevel: difficulty,
        responseTimesMs: [...responseTimes, responseTime],
      });
    }
  }, [questionIndex, questions, answers, responseTimes, questionStartTime, words.length, startTime, targetWpm, difficulty, onComplete]);

  // OKUMA AŞAMASI
  if (phase === 'reading') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onExit} style={styles.exitButton}>
            <Text style={styles.exitText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.wpmBadge}>{targetWpm} WPM</Text>
        </View>

        <View style={styles.wordDisplay}>
          {isPlaying ? (
            <Animated.Text style={[styles.word, { opacity: fadeAnim }]}>
              {currentWord}
            </Animated.Text>
          ) : (
            <Text style={styles.readyText}>
              Hazır olduğunda başla.{'\n'}
              <Text style={styles.readyHint}>Her kelime tek tek belirecek.</Text>
            </Text>
          )}
        </View>

        {/* İlerleme */}
        {isPlaying && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentWordIndex / words.length) * 100}%` },
              ]}
            />
          </View>
        )}

        {!isPlaying && words.length > 0 && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startReading}
          >
            <Text style={styles.startButtonText}>▶ Başlat</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // SORU AŞAMASI
  if (phase === 'questions') {
    const q = questions[questionIndex];
    return (
      <View style={styles.container}>
        <Text style={styles.questionHeader}>
          Soru {questionIndex + 1} / {questions.length}
        </Text>
        <Text style={styles.questionText}>{q.text}</Text>
        <View style={styles.optionsContainer}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.option}
              onPress={() => handleAnswer(i)}
            >
              <Text style={styles.optionLabel}>{String.fromCharCode(65 + i)}</Text>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  exitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: { color: '#64748B', fontSize: 16 },
  wpmBadge: {
    backgroundColor: '#312E81',
    color: '#A5B4FC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    fontSize: 14,
    fontWeight: '600',
  },
  wordDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    fontSize: 48,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    letterSpacing: 1,
  },
  readyText: {
    fontSize: 24,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 36,
  },
  readyHint: {
    fontSize: 16,
    color: '#475569',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  startButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  questionHeader: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 24,
    marginTop: 40,
  },
  questionText: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 32,
  },
  optionsContainer: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  optionLabel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    fontSize: 13,
  },
  optionText: { color: '#CBD5E1', fontSize: 16, flex: 1 },
});
```

---

## 3. MODÜL 2: DERİN KAVRAMA

### Bilimsel Temel

TYT/AYT'de paragraf sorularının %60'ı ana fikir veya çıkarım gerektirir.  
Temel problem: Hızlı okuyan öğrenci yüzeysel anlıyor.  
Hedef: Okuma sırasında "zihinde özetleme" alışkanlığı kazandırmak.

```typescript
// apps/mobile/src/components/exercises/DeepComprehension/MainIdeaExercise.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ExerciseProps } from '../types';

export function MainIdeaExercise({
  difficulty,
  durationSeconds,
  onComplete,
  onExit,
}: ExerciseProps) {
  const [phase, setPhase] = useState<'reading' | 'question' | 'feedback'>('reading');
  const [readingStart, setReadingStart] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState(0);
  const [questionStart, setQuestionStart] = useState(0);

  // Metni zorluk seviyesine göre seç
  const passages = [
    {
      text: `Türkiye, dünyanın en eski medeniyetlerine ev sahipliği yapmıştır. 
        Anadolu toprakları üzerinde Hitit, Frig, Lidya ve daha pek çok uygarlık kurulmuştur. 
        Bu uygarlıkların bıraktığı izler, ülkenin her köşesinde görülmektedir. 
        Özellikle arkeolojik kazılar, bu tarihin ne denli zengin olduğunu gün yüzüne çıkarmaktadır.`,
      mainIdea: {
        question: 'Bu paragrafın ana fikri nedir?',
        options: [
          'Türkiye\'nin coğrafi konumu çok önemlidir.',
          'Anadolu, köklü tarihi uygarlıklara sahiptir.',
          'Arkeolojik kazılar çok pahalıdır.',
          'Hitit uygarlığı güçlüydü.',
        ],
        answerIndex: 1,
        explanation: 'Paragraf boyunca eski uygarlıklar ve zengin tarih vurgulanıyor.',
      },
    },
  ];

  const passage = passages[0];

  useEffect(() => {
    setReadingStart(Date.now());
  }, []);

  function finishReading() {
    const readTime = (Date.now() - readingStart) / 1000;
    const wordCount = passage.text.split(' ').length;
    const wpm = Math.round((wordCount / readTime) * 60);
    setQuestionStart(Date.now());
    setPhase('question');
  }

  async function handleAnswer(index: number) {
    await Haptics.selectionAsync();
    setSelectedAnswer(index);
    setResponseTime(Date.now() - questionStart);
    setPhase('feedback');
  }

  function finish() {
    const readTime = (Date.now() - readingStart) / 1000;
    const wordCount = passage.text.split(' ').length;
    const wpm = Math.round((wordCount / readTime) * 60);
    const correct = selectedAnswer === passage.mainIdea.answerIndex;

    onComplete({
      wpm,
      comprehension: correct ? 100 : 0,
      accuracy: correct ? 100 : 0,
      score: correct ? Math.min(100, 60 + difficulty * 4) : Math.max(10, 40 - difficulty * 3),
      durationSeconds: Math.round(readTime + responseTime / 1000),
      exerciseType: 'main_idea',
      moduleCode: 'deep_comprehension',
      difficultyLevel: difficulty,
      responseTimesMs: [responseTime],
    });
  }

  if (phase === 'reading') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onExit} style={styles.exitButton}>
            <Text style={styles.exitText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.phaseLabel}>ANA FİKİR</Text>
        </View>
        
        <Text style={styles.instruction}>Aşağıdaki paragrafı dikkatlice oku.</Text>
        
        <ScrollView style={styles.textContainer}>
          <Text style={styles.passageText}>{passage.text}</Text>
        </ScrollView>
        
        <TouchableOpacity style={styles.continueButton} onPress={finishReading}>
          <Text style={styles.continueText}>Soruya Geç →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'question') {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>{passage.mainIdea.question}</Text>
        <View style={styles.options}>
          {passage.mainIdea.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.option}
              onPress={() => handleAnswer(i)}
            >
              <Text style={styles.optionLabel}>{String.fromCharCode(65 + i)}</Text>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (phase === 'feedback') {
    const correct = selectedAnswer === passage.mainIdea.answerIndex;
    return (
      <View style={styles.container}>
        <Text style={[styles.feedbackTitle, { color: correct ? '#10B981' : '#EF4444' }]}>
          {correct ? '✓ Doğru!' : '✗ Yanlış'}
        </Text>
        <Text style={styles.feedbackExplanation}>{passage.mainIdea.explanation}</Text>
        <TouchableOpacity style={styles.continueButton} onPress={finish}>
          <Text style={styles.continueText}>Tamamla</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  exitButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center', justifyContent: 'center',
  },
  exitText: { color: '#64748B', fontSize: 16 },
  phaseLabel: { color: '#6366F1', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  instruction: { color: '#94A3B8', fontSize: 14, marginBottom: 16 },
  textContainer: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  passageText: { color: '#CBD5E1', fontSize: 17, lineHeight: 28 },
  continueButton: {
    backgroundColor: '#6366F1', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 24,
  },
  continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  questionText: {
    color: '#F1F5F9', fontSize: 20, fontWeight: '600',
    lineHeight: 30, marginTop: 40, marginBottom: 32,
  },
  options: { gap: 12 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E293B', borderRadius: 12, padding: 16, gap: 12,
  },
  optionLabel: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#334155', color: '#94A3B8',
    textAlign: 'center', lineHeight: 28, fontWeight: '700', fontSize: 13,
  },
  optionText: { color: '#CBD5E1', fontSize: 16, flex: 1 },
  feedbackTitle: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 80 },
  feedbackExplanation: {
    color: '#94A3B8', fontSize: 16, textAlign: 'center',
    marginTop: 16, lineHeight: 24, paddingHorizontal: 20,
  },
});
```

---

## 4. MODÜL 3: DİKKAT GÜCÜ

### Bilimsel Temel

KPSS/ALES'te uzun metinler dikkat dağınıklığına yol açar.  
"Sustained Attention" (Sürdürülmüş Dikkat) egzersizleri bu problemi çözer.  
Hedef: Uzun okuma seanslarında odak süresini artırmak.

```typescript
// apps/mobile/src/components/exercises/AttentionPower/SustainedFocusExercise.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ExerciseProps } from '../types';

export function SustainedFocusExercise({
  difficulty,
  durationSeconds,
  onComplete,
  onExit,
}: ExerciseProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [tapCount, setTapCount] = useState(0);         // Dikkat dağınıklığı sayacı
  const [distractors, setDistractors] = useState(0);    // Kaç dikkat dağıtıcı çıktı
  const [isActive, setIsActive] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [focusBreaks, setFocusBreaks] = useState<number[]>([]);  // Her odak kaybı zamanı
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const distractorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Örnek metin
  const text = `Fotosentez, bitkilerin güneş ışığını kullanarak besin üretme sürecidir. 
    Klorofil adı verilen yeşil pigment bu sürecin temel bileşenidir. Bitkiler, 
    karbondioksit ve suyu alarak oksijen ve glikoz üretir. Bu süreç dünya üzerindeki 
    yaşamın temel kaynağıdır. Okyanuslar da fotosentez yapan algler sayesinde oksijen 
    üretimine katkıda bulunur. Bilim insanları, fotosentezi yapay ortamda taklit ederek 
    temiz enerji üretmeye çalışmaktadır.`;

  function startExercise() {
    setIsActive(true);
    setCurrentText(text);
    setStartTime(Date.now());
    
    // Sayaç
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Dikkat dağıtıcılar (zorluk arttıkça daha sık)
    if (difficulty >= 4) {
      scheduleDistractor();
    }
  }

  function scheduleDistractor() {
    const delay = Math.max(8000, 20000 - difficulty * 1500);  // 8-18.5 saniye
    distractorRef.current = setTimeout(() => {
      setDistractors(prev => prev + 1);
      // 2 saniye sonra kaldır
      setTimeout(() => setDistractors(prev => prev - 1), 2000);
      scheduleDistractor();  // Bir sonrakini planla
    }, delay);
  }

  function handleDistractorTap() {
    // Kullanıcı dikkat dağıtıcıya tıkladı = odak kaybı
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTapCount(prev => prev + 1);
    setFocusBreaks(prev => [...prev, Date.now() - startTime]);
  }

  function finish() {
    clearInterval(timerRef.current!);
    clearTimeout(distractorRef.current!);
    
    const totalTime = (Date.now() - startTime) / 1000;
    const wordCount = text.split(' ').length;
    const wpm = Math.round((wordCount / totalTime) * 60);
    
    // Odak skoru: dikkat kayıplarına ceza
    const focusPenalty = tapCount * 10;
    const focusScore = Math.max(0, 100 - focusPenalty);
    
    onComplete({
      wpm: Math.min(wpm, 500),
      comprehension: focusScore,
      accuracy: focusScore,
      score: focusScore,
      durationSeconds: Math.round(totalTime),
      exerciseType: 'sustained_focus',
      moduleCode: 'attention_power',
      difficultyLevel: difficulty,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        {isActive && (
          <Text style={styles.timer}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </Text>
        )}
        <Text style={styles.phaseLabel}>ODAK GÜCÜ</Text>
      </View>

      {!isActive ? (
        <View style={styles.startContainer}>
          <Text style={styles.instruction}>
            Aşağıdaki metni {durationSeconds} saniye boyunca{'\n'}
            kesintisiz oku. Dikkat dağıtıcılara{'\n'}
            <Text style={styles.warning}>tıklama!</Text>
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startExercise}>
            <Text style={styles.startText}>Başlat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.readingArea}>
          <Text style={styles.readingText}>{text}</Text>
          
          {/* Dikkat dağıtıcı overlay */}
          {distractors > 0 && (
            <TouchableOpacity
              style={styles.distractorOverlay}
              onPress={handleDistractorTap}
              activeOpacity={0.9}
            >
              <Text style={styles.distractorText}>📱 BİLDİRİM!</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24, marginTop: 12,
  },
  exitButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center',
  },
  exitText: { color: '#64748B', fontSize: 16 },
  timer: { color: '#F1F5F9', fontSize: 20, fontWeight: '700' },
  phaseLabel: { color: '#F59E0B', fontWeight: '700', fontSize: 14 },
  startContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instruction: {
    color: '#94A3B8', fontSize: 18, textAlign: 'center',
    lineHeight: 28, marginBottom: 40,
  },
  warning: { color: '#EF4444', fontWeight: '700' },
  startButton: {
    backgroundColor: '#F59E0B', borderRadius: 12,
    paddingHorizontal: 40, paddingVertical: 16,
  },
  startText: { color: '#000000', fontSize: 18, fontWeight: '700' },
  readingArea: { flex: 1, position: 'relative' },
  readingText: {
    color: '#CBD5E1', fontSize: 18, lineHeight: 30,
    backgroundColor: '#1E293B', padding: 20, borderRadius: 12,
  },
  distractorOverlay: {
    position: 'absolute', top: '40%', left: '50%',
    transform: [{ translateX: -80 }, { translateY: -30 }],
    backgroundColor: '#1D4ED8', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12,
    width: 160, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
  },
  distractorText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
```

---

## 5. MODÜL 4: ZİHİNSEL SIFIRLAMA

### Bilimsel Temel

Sınav stresi dikkat ve anlamayı düşürür.  
4-7-8 Nefes Tekniği: Vagal siniri uyararak kortizol düşürür.  
Hedef: Her oturumdan önce/sonra stres regülasyonu.

```typescript
// apps/mobile/src/components/exercises/MentalReset/BreathingExercise.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ExerciseProps } from '../types';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATHING_PATTERN: { phase: BreathPhase; count: number; label: string }[] = [
  { phase: 'inhale', count: 4, label: 'Nefes Al' },
  { phase: 'hold',   count: 7, label: 'Tut' },
  { phase: 'exhale', count: 8, label: 'Bırak' },
  { phase: 'rest',   count: 1, label: 'Hazır' },
];

export function BreathingExercise({
  onComplete,
  onExit,
}: ExerciseProps) {
  const TOTAL_CYCLES = 4;
  const [cycle, setCycle] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [counter, setCounter] = useState(BREATHING_PATTERN[0].count);
  const [isActive, setIsActive] = useState(false);
  const [startTime] = useState(Date.now());
  
  const circleScale = useRef(new Animated.Value(0.5)).current;
  const circleOpacity = useRef(new Animated.Value(0.5)).current;
  
  const currentPhase = BREATHING_PATTERN[phaseIndex];

  useEffect(() => {
    if (!isActive) return;
    
    // Animasyon
    if (currentPhase.phase === 'inhale') {
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1.2, duration: currentPhase.count * 1000 - 200,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1, duration: currentPhase.count * 1000 - 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (currentPhase.phase === 'exhale') {
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 0.5, duration: currentPhase.count * 1000 - 200,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 0.5, duration: currentPhase.count * 1000 - 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Sayaç
    const interval = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          nextPhase();
          return BREATHING_PATTERN[(phaseIndex + 1) % BREATHING_PATTERN.length].count;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, phaseIndex, currentPhase]);

  function nextPhase() {
    const next = (phaseIndex + 1) % BREATHING_PATTERN.length;
    setPhaseIndex(next);
    
    if (next === 0) {
      // Bir döngü tamamlandı
      if (cycle >= TOTAL_CYCLES) {
        // Egzersiz bitti
        const duration = (Date.now() - startTime) / 1000;
        onComplete({
          wpm: 0,
          comprehension: 100,
          accuracy: 100,
          score: 100,
          durationSeconds: Math.round(duration),
          exerciseType: 'breathing',
          moduleCode: 'mental_reset',
          difficultyLevel: 1,
        });
        return;
      }
      setCycle(c => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setCounter(BREATHING_PATTERN[next].count);
  }

  const phaseColors: Record<BreathPhase, string> = {
    inhale:  '#6366F1',
    hold:    '#8B5CF6',
    exhale:  '#06B6D4',
    rest:    '#10B981',
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onExit} style={styles.exitButton}>
        <Text style={styles.exitText}>✕</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>4-7-8 Nefes Egzersizi</Text>
      <Text style={styles.subtitle}>
        Döngü {cycle} / {TOTAL_CYCLES}
      </Text>
      
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: circleScale }],
              opacity: circleOpacity,
              backgroundColor: phaseColors[currentPhase.phase],
            },
          ]}
        />
        <View style={styles.counterContainer}>
          <Text style={styles.phaseLabel}>{currentPhase.label}</Text>
          <Text style={styles.counter}>{counter}</Text>
        </View>
      </View>

      {!isActive && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setIsActive(true)}
        >
          <Text style={styles.startText}>Başlat</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24, alignItems: 'center' },
  exitButton: {
    position: 'absolute', top: 48, left: 24,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center',
  },
  exitText: { color: '#64748B', fontSize: 16 },
  title: { color: '#F1F5F9', fontSize: 22, fontWeight: '700', marginTop: 100 },
  subtitle: { color: '#64748B', fontSize: 14, marginTop: 8 },
  circleContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    width: 200, height: 200, borderRadius: 100,
    position: 'absolute',
  },
  counterContainer: { alignItems: 'center', zIndex: 1 },
  phaseLabel: { color: '#F1F5F9', fontSize: 18, fontWeight: '600' },
  counter: { color: '#FFFFFF', fontSize: 56, fontWeight: '800', marginTop: 8 },
  startButton: {
    backgroundColor: '#6366F1', borderRadius: 12,
    paddingHorizontal: 48, paddingVertical: 16, marginBottom: 60,
  },
  startText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
```

---

## 6. EGZERSİZ STORE

```typescript
// apps/mobile/src/stores/exerciseStore.ts

import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { createPerformancePipeline } from '@sprinta/api';
import { useAuthStore } from './authStore';
import type { SessionMetrics } from '@sprinta/shared';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

const pipeline = createPerformancePipeline(supabase);

interface ExerciseResult {
  sessionId: string;
  arp: number;
  xpEarned: number;
  fatigueLevel: string;
  shouldTakeBreak: boolean;
  suggestedDifficulty: number;
  arpChange: number;
}

interface ExerciseState {
  isProcessing: boolean;
  lastResult: ExerciseResult | null;
  completeExercise: (
    exerciseId: string,
    metrics: SessionMetrics,
    contentId?: string
  ) => Promise<{ success: boolean; result?: ExerciseResult; error?: string }>;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  isProcessing: false,
  lastResult: null,

  completeExercise: async (exerciseId, metrics, contentId) => {
    const student = useAuthStore.getState().student;
    if (!student) return { success: false, error: 'Kullanıcı bulunamadı' };

    set({ isProcessing: true });

    try {
      const pipelineResult = await pipeline.completeSession(
        student.id,
        exerciseId,
        metrics,
        contentId
      );

      if (!pipelineResult.success) {
        return { success: false, error: pipelineResult.error };
      }

      const result: ExerciseResult = {
        sessionId: pipelineResult.sessionId!,
        arp: pipelineResult.result!.arp,
        xpEarned: pipelineResult.result!.xpEarned,
        fatigueLevel: pipelineResult.result!.fatigueLevel,
        shouldTakeBreak: pipelineResult.result!.shouldTakeBreak,
        suggestedDifficulty: pipelineResult.result!.suggestedDifficulty,
        arpChange: pipelineResult.result!.arpChange,
      };

      set({ lastResult: result });

      // Auth store'daki öğrenci profilini güncelle
      useAuthStore.getState().updateProfile({
        currentArp: result.arp,
        totalXp: student.totalXp + result.xpEarned,
      });

      return { success: true, result };
    } catch (err) {
      return { success: false, error: 'Egzersiz kaydedilemedi' };
    } finally {
      set({ isProcessing: false });
    }
  },
}));
```

---

## 7. MODÜL EKRANI (Ortak Sarmalayıcı)

```tsx
// apps/mobile/app/(tabs)/modules/[moduleCode].tsx

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RSVPExercise } from '../../../src/components/exercises/SpeedControl/RSVPExercise';
import { MainIdeaExercise } from '../../../src/components/exercises/DeepComprehension/MainIdeaExercise';
import { SustainedFocusExercise } from '../../../src/components/exercises/AttentionPower/SustainedFocusExercise';
import { BreathingExercise } from '../../../src/components/exercises/MentalReset/BreathingExercise';
import { useExerciseStore } from '../../../src/stores/exerciseStore';
import type { SessionMetrics } from '@sprinta/shared';

const MODULE_META = {
  speed_control:     { title: 'Hız Kontrolü', color: '#6366F1', icon: '⚡' },
  deep_comprehension:{ title: 'Derin Kavrama', color: '#10B981', icon: '🧠' },
  attention_power:   { title: 'Dikkat Gücü',  color: '#F59E0B', icon: '🎯' },
  mental_reset:      { title: 'Zihin Sıfırla', color: '#06B6D4', icon: '🌊' },
};

export default function ModuleScreen() {
  const { moduleCode } = useLocalSearchParams<{ moduleCode: string }>();
  const router = useRouter();
  const { completeExercise, isProcessing } = useExerciseStore();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const meta = MODULE_META[moduleCode as keyof typeof MODULE_META];

  async function handleExerciseComplete(exerciseId: string, metrics: SessionMetrics) {
    const result = await completeExercise(exerciseId, metrics);
    
    if (result.success && result.result) {
      router.push({
        pathname: '/exercise-result',
        params: {
          arp: String(result.result.arp),
          xpEarned: String(result.result.xpEarned),
          arpChange: String(result.result.arpChange),
          fatigueLevel: result.result.fatigueLevel,
          shouldBreak: String(result.result.shouldTakeBreak),
        },
      });
    }
    setActiveExercise(null);
  }

  // Aktif egzersiz göster
  if (activeExercise === 'rsvp') {
    return (
      <RSVPExercise
        exerciseId="rsvp-001"
        difficulty={5}
        durationSeconds={120}
        onComplete={(m) => handleExerciseComplete('rsvp-001', m)}
        onExit={() => setActiveExercise(null)}
      />
    );
  }
  // (diğer egzersiz geçişleri benzer şekilde)

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: meta?.color }]}>
        {meta?.icon} {meta?.title}
      </Text>

      <ScrollView>
        <TouchableOpacity
          style={styles.exerciseCard}
          onPress={() => { Haptics.selectionAsync(); setActiveExercise('rsvp'); }}
        >
          <Text style={styles.exerciseName}>Flash Okuma (RSVP)</Text>
          <Text style={styles.exerciseDesc}>Kelimeler ardışık belirir, hızın artar</Text>
          <Text style={styles.exerciseMeta}>⏱ 2 dk · 🎯 Hız</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 48, marginBottom: 24 },
  exerciseCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 16,
  },
  exerciseName: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
  exerciseDesc: { color: '#64748B', fontSize: 14, marginTop: 4 },
  exerciseMeta: { color: '#475569', fontSize: 12, marginTop: 8 },
});
```

---

## ✅ FAZ 05 TAMAMLANMA KRİTERLERİ

```
✅ RSVP egzersizi: Kelimeler WPM hızında belirir, sorular sorulur, metrikler döner
✅ Ana Fikir egzersizi: Metin okunur, soru cevaplar, feedback gösterir
✅ Odak egzersizi: Süre sayar, dikkat dağıtıcılar çıkar, odak skoru hesaplar
✅ Nefes egzersizi: 4-7-8 döngüsü, animasyon, 4 döngü tamamlanır
✅ onComplete() çağrıldığında exerciseStore.completeExercise() tetiklenir
✅ Pipeline başarılı: session DB'ye kaydedilir
✅ Sonuç ekranı: ARP, XP, yorgunluk bilgisi gösterilir
```
