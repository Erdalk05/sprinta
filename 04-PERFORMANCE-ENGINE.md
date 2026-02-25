# 04 — PERFORMANCE ENGINE
## ARP/REI/CSF Bilimsel Hesaplama Motoru

> **Konum:** `packages/shared/src/engine/`  
> **Prensip:** Pure TypeScript — side-effect yok, test edilebilir, offline çalışır

---

## İÇİNDEKİLER

1. [Bilimsel Temel](#1-bilimsel-temel)
2. [Tip Tanımları](#2-tip-tanımları)
3. [ARP Hesaplayıcı](#3-arp-hesaplayıcı)
4. [Yorgunluk Dedektörü](#4-yorgunluk-dedektörü)
5. [Zorluk Adaptörü](#5-zorluk-adaptörü)
6. [Stabilite Analizörü](#6-stabilite-analizörü)
7. [Mod Önerici](#7-mod-önerici)
8. [Ana Engine](#8-ana-engine)
9. [Pipeline Servisi](#9-pipeline-servisi)
10. [Birim Testleri](#10-birim-testleri)

---

## 1. BİLİMSEL TEMEL

### Neden ARP?

Geleneksel WPM ölçümünün sorunu: Hızlı ama anlamazsa değersiz.  
ARP (Advanced Reading Performance) hem hızı hem anlamayı hem de tutarlılığı tek bir sayıda birleştirir.

```
WPM=300, Anlama=%80, CSF=0.90  →  ARP = (300 × 0.80) × 0.90 = 216  ✅
WPM=450, Anlama=%40, CSF=0.65  →  ARP = (450 × 0.40) × 0.65 = 117  ❌

Daha hızlı ama çok daha kötü!
```

### Formüller

```
REI (Okuma Verimliliği İndeksi):
  REI = sustainable_wpm × (comprehension / 100)
  → "Anlayarak kaç kelime okuduğunun ölçüsü"

CSF (Bilişsel Stabilite Faktörü):
  CSF = 1 − (error_rate + regression_rate + fatigue_index) / 3
  → Değer: 0.0 (hiç tutarsız) — 1.0 (mükemmel tutarlı)
  → "Ne kadar güvenilir ve dayanıklı olduğunun ölçüsü"

ARP (Gelişmiş Okuma Performansı):
  ARP = REI × CSF
  → "Gerçek okuma performansının tek sayılık özeti"
```

### Sınav Hedef ARP Değerleri

```
MEB müfredatı analizi + alan araştırması referans değerleri:

LGS Sınavı:
  - Minimum: 150 ARP  (temel geçer)
  - Hedef:   200 ARP  (iyi sonuç)
  - Elite:   250 ARP  (üst %10)

TYT Sınavı:
  - Minimum: 200 ARP
  - Hedef:   250 ARP
  - Elite:   310 ARP

AYT Sınavı:
  - Minimum: 220 ARP
  - Hedef:   280 ARP
  - Elite:   350 ARP

KPSS Sınavı:
  - Minimum: 230 ARP
  - Hedef:   290 ARP
  - Elite:   360 ARP

ALES/YDS:
  - Minimum: 250 ARP
  - Hedef:   310 ARP
  - Elite:   390 ARP
```

---

## 2. TİP TANIMLARI

```typescript
// packages/shared/src/types/engine.ts

export interface SessionMetrics {
  // Temel ölçümler (zorunlu)
  wpm: number;                    // Kelime/dakika
  comprehension: number;          // 0-100 anlama yüzdesi
  accuracy: number;               // 0-100 doğruluk yüzdesi
  score: number;                  // 0-100 genel puan
  durationSeconds: number;        // Oturum süresi
  exerciseType: string;
  moduleCode: string;
  difficultyLevel: number;        // 1-10
  
  // Detay ölçümler (opsiyonel — mevcut egzersizde varsa gönderilir)
  regressionCount?: number;       // Geriye dönüş sayısı
  fixationDurationMs?: number;    // Ortalama sabitleme süresi (ms)
  responseTimesMs?: number[];     // Her sorunun yanıt süresi (ms)
  errorsPerMinute?: number;       // Dakika başı hata
  
  // Session içi performans bölümleri (yorgunluk tespiti için)
  firstHalfMetrics?: {
    wpm: number;
    accuracy: number;
  };
  secondHalfMetrics?: {
    wpm: number;
    accuracy: number;
  };
}

export interface PerformanceResult {
  // Hesaplanan KPI'ler
  rei: number;
  csf: number;
  arp: number;
  
  // Yorgunluk
  fatigueScore: number;         // 0-100
  fatigueLevel: FatigueLevel;
  shouldTakeBreak: boolean;
  
  // Öneri
  suggestedDifficulty: number;  // 1-10
  recommendedMode: string | null;
  
  // Trend
  arpChange: number;            // Önceki session'a kıyasla değişim
  stabilityIndex: number;       // 0-1
  
  // XP
  xpEarned: number;
}

export type FatigueLevel = 'fresh' | 'mild' | 'moderate' | 'fatigued' | 'exhausted';

export interface FatigueResult {
  score: number;
  level: FatigueLevel;
  shouldBreak: boolean;
  estimatedRecoveryMinutes: number;
}

export interface CognitiveProfile {
  sustainableWpm: number;
  peakWpm: number;
  comprehensionBaseline: number;
  stabilityIndex: number;
  fatigueThreshold: number;
  speedSkill: number;          // 0-100
  comprehensionSkill: number;  // 0-100
  attentionSkill: number;      // 0-100
  primaryWeakness: string | null;
  secondaryWeakness: string | null;
}

export interface ExamTarget {
  min: number;
  target: number;
  elite: number;
}

export const EXAM_ARP_TARGETS: Record<string, ExamTarget> = {
  lgs:   { min: 150, target: 200, elite: 250 },
  tyt:   { min: 200, target: 250, elite: 310 },
  ayt:   { min: 220, target: 280, elite: 350 },
  kpss:  { min: 230, target: 290, elite: 360 },
  ales:  { min: 250, target: 310, elite: 390 },
  yds:   { min: 260, target: 320, elite: 400 },
  other: { min: 150, target: 220, elite: 300 },
};
```

---

## 3. ARP HESAPLAYICI

```typescript
// packages/shared/src/engine/arpCalculator.ts

/**
 * REI — Okuma Verimliliği İndeksi
 * "Anlayarak okuduğun kelime sayısı"
 */
export function calculateREI(wpm: number, comprehension: number): number {
  const clampedComp = Math.max(0, Math.min(100, comprehension));
  return Math.round(wpm * (clampedComp / 100));
}

/**
 * CSF — Bilişsel Stabilite Faktörü (0.0 - 1.0)
 * "Tutarlılık ve dayanıklılık"
 */
export function calculateCSF(
  errorRate: number,       // 0-1 arası
  regressionRate: number,  // 0-1 arası
  fatigueIndex: number     // 0-1 arası
): number {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const avg = (clamp(errorRate) + clamp(regressionRate) + clamp(fatigueIndex)) / 3;
  return Math.max(0, Math.min(1, parseFloat((1 - avg).toFixed(4))));
}

/**
 * ARP — Gelişmiş Okuma Performansı
 * Ana KPI
 */
export function calculateARP(rei: number, csf: number): number {
  return Math.round(rei * csf);
}

/**
 * Tüm metrikleri session input'tan hesapla
 */
export function calculateSessionARP(metrics: {
  wpm: number;
  comprehension: number;
  errorsPerMinute?: number;
  regressionCount?: number;
  durationSeconds?: number;
  fatigueIndex?: number;
}): { rei: number; csf: number; arp: number } {
  const { wpm, comprehension } = metrics;

  // Error rate: dakika başı hatayı 0-1 aralığına normalize et
  // Referans: iyi okuyucu için <2 hata/dk = düşük hata oranı
  const errorRate = metrics.errorsPerMinute
    ? Math.min(1, metrics.errorsPerMinute / 10)
    : 0;

  // Regression rate: kelime başına geriye dönüş
  // Referans: dakikada 1 regression = kabul edilebilir
  const regressionRate = metrics.regressionCount && metrics.durationSeconds
    ? Math.min(1, (metrics.regressionCount / (metrics.durationSeconds / 60)) / 5)
    : 0;

  // Yorgunluk indeksi (opsiyonel, varsa kullan)
  const fatigueIndex = metrics.fatigueIndex ?? 0;

  const rei = calculateREI(wpm, comprehension);
  const csf = calculateCSF(errorRate, regressionRate, fatigueIndex);
  const arp = calculateARP(rei, csf);

  return { rei, csf, arp };
}

/**
 * ARP'ın sınav hedefine yakınlığını hesapla (0-100 %)
 */
export function calculateExamProgress(
  currentArp: number,
  examTarget: string
): { progressPercent: number; remainingArp: number; level: 'below' | 'min' | 'target' | 'elite' } {
  const targets = EXAM_ARP_TARGETS[examTarget] ?? EXAM_ARP_TARGETS.other;
  
  const remainingArp = Math.max(0, targets.target - currentArp);
  const progressPercent = Math.min(100, Math.round((currentArp / targets.target) * 100));
  
  let level: 'below' | 'min' | 'target' | 'elite';
  if (currentArp >= targets.elite) level = 'elite';
  else if (currentArp >= targets.target) level = 'target';
  else if (currentArp >= targets.min) level = 'min';
  else level = 'below';
  
  return { progressPercent, remainingArp, level };
}

// EXAM_ARP_TARGETS burada da tanımlı (import için)
import { EXAM_ARP_TARGETS } from '../types/engine';
```

---

## 4. YORGUNLUK DEDEKTÖRÜ

```typescript
// packages/shared/src/engine/fatigueDetector.ts

import type { FatigueResult } from '../types/engine';

/**
 * Session içi yorgunluk tespiti
 * İlk yarı vs ikinci yarı performans karşılaştırması
 */
export function detectFatigue(input: {
  firstHalf: { wpm: number; accuracy: number };
  secondHalf: { wpm: number; accuracy: number };
  responseTimes?: number[];
}): FatigueResult {
  const { firstHalf, secondHalf } = input;

  // WPM düşüşü (%)
  const wpmDrop = firstHalf.wpm > 0
    ? Math.max(0, (firstHalf.wpm - secondHalf.wpm) / firstHalf.wpm * 100)
    : 0;

  // Doğruluk düşüşü (%)
  const accuracyDrop = firstHalf.accuracy > 0
    ? Math.max(0, (firstHalf.accuracy - secondHalf.accuracy) / firstHalf.accuracy * 100)
    : 0;

  // Yanıt süresi artışı (%) — varsa
  let responseTimeIncrease = 0;
  if (input.responseTimes && input.responseTimes.length >= 4) {
    const times = input.responseTimes;
    const mid = Math.floor(times.length / 2);
    const firstAvg = average(times.slice(0, mid));
    const secondAvg = average(times.slice(mid));
    if (firstAvg > 0) {
      responseTimeIncrease = Math.max(0, (secondAvg - firstAvg) / firstAvg * 100);
    }
  }

  // Ağırlıklı yorgunluk skoru (0-100)
  const fatigueScore = Math.min(100, Math.round(
    wpmDrop * 0.40 +
    accuracyDrop * 0.35 +
    responseTimeIncrease * 0.25
  ));

  // Seviye belirleme
  let level: FatigueResult['level'];
  let shouldBreak: boolean;
  let estimatedRecoveryMinutes: number;

  if (fatigueScore < 15) {
    level = 'fresh';
    shouldBreak = false;
    estimatedRecoveryMinutes = 0;
  } else if (fatigueScore < 30) {
    level = 'mild';
    shouldBreak = false;
    estimatedRecoveryMinutes = 5;
  } else if (fatigueScore < 50) {
    level = 'moderate';
    shouldBreak = false;
    estimatedRecoveryMinutes = 10;
  } else if (fatigueScore < 70) {
    level = 'fatigued';
    shouldBreak = true;
    estimatedRecoveryMinutes = 15;
  } else {
    level = 'exhausted';
    shouldBreak = true;
    estimatedRecoveryMinutes = 30;
  }

  return { score: fatigueScore, level, shouldBreak, estimatedRecoveryMinutes };
}

/**
 * Basit yorgunluk indeksi (session yarıları yoksa)
 * Sadece toplam süre ve performans düşüşünden tahmin
 */
export function estimateFatigueIndex(
  durationMinutes: number,
  finalScore: number
): number {
  // Uzun session + düşük skor = muhtemelen yorgun
  const durationFactor = Math.min(1, durationMinutes / 45);  // 45 dk = max yorgunluk
  const scoreFactor = Math.max(0, (70 - finalScore) / 70);   // 70 altı puan = yorgunluk işareti
  return (durationFactor * 0.4 + scoreFactor * 0.6);
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
```

---

## 5. ZORLUK ADAPTÖRÜ

```typescript
// packages/shared/src/engine/difficultyAdapter.ts

/**
 * Egzersiz sonrası bir sonraki zorluk seviyesini hesapla
 * Kural tabanlı adaptif zorluk
 */
export function adaptDifficulty(
  current: number,        // 1-10 mevcut zorluk
  score: number,          // 0-100 performans puanı
  comprehension: number,  // 0-100 anlama yüzdesi
  fatigueScore: number    // 0-100 yorgunluk skoru
): number {
  let delta = 0;

  // Anlama bazlı kural (en önemli)
  if (comprehension < 60) {
    delta -= 2;  // Anlamıyorsa hemen düşür
  } else if (comprehension < 70) {
    delta -= 1;
  } else if (comprehension > 90 && score > 85) {
    delta += 1;  // Çok başarılıysa artır
  } else if (comprehension > 95 && score > 92) {
    delta += 2;
  }

  // Yorgunluk bazlı kural
  if (fatigueScore >= 50) {
    delta -= 1;  // Yorgunsa bir düşür
  } else if (fatigueScore >= 70) {
    delta -= 2;  // Çok yorgunsa iki düşür
  }

  // Puan bazlı ince ayar
  if (score < 50) delta -= 1;
  if (score > 90 && delta === 0) delta += 1;  // Başka faktör yoksa artır

  const suggested = current + delta;
  return Math.max(1, Math.min(10, suggested));
}

/**
 * Anlama oranına göre zorluk düşürme gerekiyor mu?
 */
export function shouldReduceDifficulty(
  comprehension: number,
  threshold = 70
): boolean {
  return comprehension < threshold;
}

/**
 * Zorluk artırma kriterlerini kontrol et
 */
export function shouldIncreaseDifficulty(
  comprehension: number,
  score: number,
  fatigueScore: number
): boolean {
  return comprehension > 90 && score > 85 && fatigueScore < 30;
}
```

---

## 6. STABİLİTE ANALİZÖRÜ

```typescript
// packages/shared/src/engine/stabilityAnalyzer.ts

/**
 * Son N session'ın ARP stabilite indeksini hesapla
 * 0 = çok tutarsız, 1 = çok tutarlı
 */
export function calculateStabilityIndex(arpHistory: number[]): number {
  if (arpHistory.length < 3) return 0.5;  // Yeterli veri yok, orta değer

  const mean = arpHistory.reduce((a, b) => a + b, 0) / arpHistory.length;
  if (mean === 0) return 0;

  const variance = arpHistory.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / arpHistory.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of Variation'ın tersine göre stabilite
  const cv = stdDev / mean;  // 0 = mükemmel tutarlı
  const stability = Math.max(0, Math.min(1, 1 - cv));

  return parseFloat(stability.toFixed(4));
}

/**
 * Büyüme skoru hesapla
 * Baseline ARP'a kıyasla yüzde büyüme
 */
export function calculateGrowthScore(
  baselineArp: number,
  currentArp: number
): number {
  if (baselineArp === 0) return 0;
  return parseFloat(((currentArp - baselineArp) / baselineArp * 100).toFixed(2));
}

/**
 * Plato tespiti
 * Son N session'da ARP değişimi %2'nin altındaysa plato var
 */
export function detectPlateau(arpHistory: number[], threshold = 0.02): boolean {
  if (arpHistory.length < 5) return false;
  
  const recent = arpHistory.slice(-5);
  const max = Math.max(...recent);
  const min = Math.min(...recent);
  
  if (max === 0) return false;
  return (max - min) / max < threshold;
}

/**
 * Sustainable WPM hesapla (son 10 session'ın medyanı)
 */
export function calculateSustainableWpm(wpmHistory: number[]): number {
  if (wpmHistory.length === 0) return 0;
  
  const sorted = [...wpmHistory].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  // Medyan
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}
```

---

## 7. MOD ÖNERİCİ

```typescript
// packages/shared/src/engine/modeRecommender.ts

import type { CognitiveProfile } from '../types/engine';

/**
 * Bilişsel profile göre modül önerisi
 * Zayıf noktayı tespit eder ve ilgili modülü önerir
 */
export function recommendModule(profile: CognitiveProfile): string {
  // En belirgin zayıflığı bul
  
  // Sürdürülebilir WPM çok düşük → Hız Kontrolü
  if (profile.sustainableWpm < 150) {
    return 'speed_control';
  }
  
  // Anlama çok düşük → Derin Kavrama
  if (profile.comprehensionBaseline < 65) {
    return 'deep_comprehension';
  }
  
  // Dikkat skoru düşük → Dikkat Gücü
  if (profile.attentionSkill < 50) {
    return 'attention_power';
  }
  
  // Stabilite düşük → Zihinsel Sıfırlama
  if (profile.stabilityIndex < 0.5) {
    return 'mental_reset';
  }
  
  // Hız var ama anlama gelişebilir → Derin Kavrama
  if (profile.sustainableWpm > 250 && profile.comprehensionBaseline < 80) {
    return 'deep_comprehension';
  }
  
  // Genel denge: hız geliştirilmeli
  if (profile.speedSkill < profile.comprehensionSkill) {
    return 'speed_control';
  }
  
  // Default: Hız Kontrolü
  return 'speed_control';
}

/**
 * Zayıf noktaları öncelik sıralamasıyla listele
 */
export function rankWeaknesses(
  profile: CognitiveProfile
): Array<{ module: string; score: number; label: string }> {
  const items = [
    {
      module: 'speed_control',
      score: profile.speedSkill,
      label: 'Hız Kontrolü',
    },
    {
      module: 'deep_comprehension',
      score: profile.comprehensionSkill,
      label: 'Derin Kavrama',
    },
    {
      module: 'attention_power',
      score: profile.attentionSkill,
      label: 'Dikkat Gücü',
    },
    {
      module: 'mental_reset',
      score: Math.round(profile.stabilityIndex * 100),
      label: 'Zihinsel Dayanıklılık',
    },
  ];

  // Düşük skordan yükseğe sırala (en zayıf önce)
  return items.sort((a, b) => a.score - b.score);
}
```

---

## 8. ANA ENGINE

```typescript
// packages/shared/src/engine/performanceEngine.ts

import { calculateREI, calculateCSF, calculateARP, calculateSessionARP } from './arpCalculator';
import { detectFatigue, estimateFatigueIndex } from './fatigueDetector';
import { adaptDifficulty } from './difficultyAdapter';
import { calculateStabilityIndex, calculateGrowthScore } from './stabilityAnalyzer';
import { recommendModule } from './modeRecommender';
import type {
  SessionMetrics,
  PerformanceResult,
  CognitiveProfile,
} from '../types/engine';

/**
 * Egzersiz tamamlandığında çağrılacak tek giriş noktası.
 * Tüm hesaplamaları yapar, sonuçları döndürür.
 */
export function processSession(
  metrics: SessionMetrics,
  history: SessionMetrics[],    // Son 20 session (API'dan gelir)
  profile: CognitiveProfile | null,
  baselineArp: number
): PerformanceResult {

  // ── 1. Yorgunluk ────────────────────────────────
  let fatigueResult = {
    score: 0,
    level: 'fresh' as const,
    shouldBreak: false,
    estimatedRecoveryMinutes: 0,
  };

  if (metrics.firstHalfMetrics && metrics.secondHalfMetrics) {
    fatigueResult = detectFatigue({
      firstHalf: metrics.firstHalfMetrics,
      secondHalf: metrics.secondHalfMetrics,
      responseTimes: metrics.responseTimesMs,
    });
  } else {
    // Tahmin yöntemi
    const fatigueIndex = estimateFatigueIndex(
      metrics.durationSeconds / 60,
      metrics.score
    );
    fatigueResult = {
      score: Math.round(fatigueIndex * 100),
      level: fatigueIndex > 0.7 ? 'exhausted'
           : fatigueIndex > 0.5 ? 'fatigued'
           : fatigueIndex > 0.3 ? 'moderate'
           : fatigueIndex > 0.15 ? 'mild'
           : 'fresh',
      shouldBreak: fatigueIndex > 0.5,
      estimatedRecoveryMinutes: Math.round(fatigueIndex * 30),
    };
  }

  // ── 2. ARP Hesaplama ─────────────────────────────
  const { rei, csf, arp } = calculateSessionARP({
    wpm: metrics.wpm,
    comprehension: metrics.comprehension,
    errorsPerMinute: metrics.errorsPerMinute,
    regressionCount: metrics.regressionCount,
    durationSeconds: metrics.durationSeconds,
    fatigueIndex: fatigueResult.score / 100,
  });

  // ── 3. Önceki session ile karşılaştır ────────────
  const lastArp = history.length > 0
    ? calculateSessionARP({
        wpm: history[history.length - 1].wpm,
        comprehension: history[history.length - 1].comprehension,
        durationSeconds: history[history.length - 1].durationSeconds,
      }).arp
    : arp;

  const arpChange = arp - lastArp;

  // ── 4. Stabilite ─────────────────────────────────
  const recentArps = history.slice(-9).map(h =>
    calculateSessionARP({ wpm: h.wpm, comprehension: h.comprehension }).arp
  );
  recentArps.push(arp);
  const stabilityIndex = calculateStabilityIndex(recentArps);

  // ── 5. Zorluk Önerisi ────────────────────────────
  const suggestedDifficulty = adaptDifficulty(
    metrics.difficultyLevel,
    metrics.score,
    metrics.comprehension,
    fatigueResult.score
  );

  // ── 6. Modül Önerisi ─────────────────────────────
  let recommendedMode: string | null = null;
  if (profile) {
    recommendedMode = recommendModule(profile);
  }

  // ── 7. XP Hesaplama ──────────────────────────────
  const xpEarned = calculateXP({
    score: metrics.score,
    difficultyLevel: metrics.difficultyLevel,
    fatigueLevel: fatigueResult.level,
    comprehension: metrics.comprehension,
  });

  return {
    rei,
    csf,
    arp,
    fatigueScore: fatigueResult.score,
    fatigueLevel: fatigueResult.level,
    shouldTakeBreak: fatigueResult.shouldBreak,
    suggestedDifficulty,
    recommendedMode,
    arpChange,
    stabilityIndex,
    xpEarned,
  };
}

/**
 * XP hesaplama formülü
 * Temel: zorluk × puan katsayısı
 * Bonus: anlama bonusu + yorgunluk direnci bonusu
 */
function calculateXP(input: {
  score: number;
  difficultyLevel: number;
  fatigueLevel: string;
  comprehension: number;
}): number {
  const { score, difficultyLevel, fatigueLevel, comprehension } = input;

  // Temel XP
  let xp = Math.round(difficultyLevel * (score / 100) * 15);

  // Anlama bonusu (%85+ anlama → bonus)
  if (comprehension >= 85) xp += 5;
  if (comprehension >= 95) xp += 5;

  // Yorgunluk direnci bonusu (yorgunken iyi performans)
  if (fatigueLevel === 'moderate' && score >= 70) xp += 5;
  if (fatigueLevel === 'fatigued' && score >= 60) xp += 10;

  // Minimum XP garanti et
  return Math.max(5, xp);
}

// ── Barrel Export ─────────────────────────────────
export { calculateREI, calculateCSF, calculateARP } from './arpCalculator';
export { detectFatigue } from './fatigueDetector';
export { adaptDifficulty } from './difficultyAdapter';
export { calculateStabilityIndex, calculateGrowthScore, detectPlateau } from './stabilityAnalyzer';
export { recommendModule, rankWeaknesses } from './modeRecommender';
```

---

## 9. PİPELİNE SERVİSİ

```typescript
// packages/api-client/src/services/performancePipeline.ts

import { createClient } from '@supabase/supabase-js';
import { processSession } from '@sprinta/shared';
import type { SessionMetrics } from '@sprinta/shared';

/**
 * Egzersiz tamamlandığında çağrılan tam pipeline.
 * 1. Session'ı kaydet
 * 2. Engine'i çalıştır
 * 3. Cognitive profile'ı güncelle
 * 4. Daily stats'ı güncelle
 * 5. Risk skoru güncelle (B2B)
 */
export function createPerformancePipeline(
  supabase: ReturnType<typeof createClient>
) {
  return {
    async completeSession(
      studentId: string,
      exerciseId: string,
      metrics: SessionMetrics,
      contentId?: string
    ) {
      try {
        // 1. Son 20 session'ı getir (trend için)
        const { data: history } = await supabase
          .from('sessions')
          .select('metrics')
          .eq('student_id', studentId)
          .eq('is_completed', true)
          .order('created_at', { ascending: false })
          .limit(20);

        const historyMetrics: SessionMetrics[] = (history ?? []).map(h => ({
          wpm: h.metrics.wpm ?? 0,
          comprehension: h.metrics.comprehension ?? 0,
          accuracy: h.metrics.accuracy ?? 0,
          score: h.metrics.score ?? 0,
          durationSeconds: h.metrics.duration_seconds ?? 0,
          exerciseType: h.metrics.exercise_type ?? '',
          moduleCode: h.metrics.module_code ?? '',
          difficultyLevel: h.metrics.difficulty_level ?? 5,
        }));

        // 2. Bilişsel profil getir
        const { data: profileData } = await supabase
          .from('cognitive_profiles')
          .select('*')
          .eq('student_id', studentId)
          .single();

        // 3. Öğrenci baseline ARP
        const { data: student } = await supabase
          .from('students')
          .select('baseline_arp')
          .eq('id', studentId)
          .single();

        // 4. Engine'i çalıştır
        const profile = profileData
          ? {
              sustainableWpm: profileData.sustainable_wpm,
              peakWpm: profileData.peak_wpm,
              comprehensionBaseline: profileData.comprehension_baseline,
              stabilityIndex: profileData.stability_index,
              fatigueThreshold: 50,
              speedSkill: profileData.speed_skill,
              comprehensionSkill: profileData.comprehension_skill,
              attentionSkill: profileData.attention_skill,
              primaryWeakness: profileData.primary_weakness,
              secondaryWeakness: profileData.secondary_weakness,
            }
          : null;

        const result = processSession(
          metrics,
          historyMetrics,
          profile,
          student?.baseline_arp ?? 0
        );

        // 5. Session'ı kaydet
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            student_id: studentId,
            exercise_id: exerciseId,
            content_id: contentId ?? null,
            session_type: 'exercise',
            completed_at: new Date().toISOString(),
            duration_seconds: metrics.durationSeconds,
            is_completed: true,
            metrics: {
              wpm: metrics.wpm,
              comprehension: metrics.comprehension,
              accuracy: metrics.accuracy,
              score: metrics.score,
              difficulty_level: metrics.difficultyLevel,
              exercise_type: metrics.exerciseType,
              module_code: metrics.moduleCode,
              regression_count: metrics.regressionCount ?? 0,
              duration_seconds: metrics.durationSeconds,
            },
            rei: result.rei,
            csf: result.csf,
            arp: result.arp,
            xp_earned: result.xpEarned,
            fatigue_level: result.fatigueLevel,
            suggested_difficulty: result.suggestedDifficulty,
          })
          .select()
          .single();

        if (sessionError) {
          console.error('Session kaydetme hatası:', sessionError);
          return { success: false, error: sessionError.message };
        }

        // 6. Cognitive profile'ı güncelle (her 5 session'da tam hesapla)
        await this.updateCognitiveProfile(studentId, profileData?.session_count ?? 0);

        // 7. Daily stats güncelle
        await this.updateDailyStats(studentId, {
          arp: result.arp,
          xp: result.xpEarned,
          durationMinutes: Math.round(metrics.durationSeconds / 60),
        });

        // 8. Yorgunluk logu
        if (result.fatigueScore > 30) {
          await supabase.from('fatigue_logs').insert({
            student_id: studentId,
            session_id: session.id,
            fatigue_score: result.fatigueScore,
            fatigue_level: result.fatigueLevel,
            break_recommended: result.shouldTakeBreak,
          });
        }

        return { success: true, result, sessionId: session.id };
      } catch (err) {
        console.error('Pipeline hatası:', err);
        return { success: false, error: 'Pipeline işlemi başarısız' };
      }
    },

    async updateCognitiveProfile(studentId: string, previousCount: number) {
      // Her 5 session'da bir tam yeniden hesapla
      const newCount = previousCount + 1;
      if (newCount % 5 !== 0) {
        // Sadece sayacı güncelle
        await supabase
          .from('cognitive_profiles')
          .update({ session_count: newCount })
          .eq('student_id', studentId);
        return;
      }

      // Son 20 session'dan profil hesapla
      const { data: sessions } = await supabase
        .from('sessions')
        .select('metrics, arp')
        .eq('student_id', studentId)
        .eq('is_completed', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!sessions || sessions.length < 3) return;

      const wpms = sessions.map(s => s.metrics.wpm ?? 0).filter(Boolean);
      const comps = sessions.map(s => s.metrics.comprehension ?? 0).filter(Boolean);
      const arps = sessions.map(s => s.arp ?? 0).filter(Boolean);

      const sustainableWpm = Math.round(
        wpms.sort((a, b) => a - b)[Math.floor(wpms.length / 2)]  // medyan
      );
      const peakWpm = Math.max(...wpms);
      const avgComp = Math.round(comps.reduce((a, b) => a + b, 0) / comps.length);
      const { calculateStabilityIndex } = await import('@sprinta/shared');
      const stability = calculateStabilityIndex(arps);

      await supabase
        .from('cognitive_profiles')
        .upsert({
          student_id: studentId,
          sustainable_wpm: sustainableWpm,
          peak_wpm: peakWpm,
          comprehension_baseline: avgComp,
          stability_index: stability,
          session_count: newCount,
          last_calculated_at: new Date().toISOString(),
        });
    },

    async updateDailyStats(
      studentId: string,
      data: { arp: number; xp: number; durationMinutes: number }
    ) {
      const today = new Date().toISOString().split('T')[0];

      await supabase.rpc('upsert_daily_stats', {
        p_student_id: studentId,
        p_date: today,
        p_arp: data.arp,
        p_xp: data.xp,
        p_duration_minutes: data.durationMinutes,
      });
    },
  };
}
```

### Pipeline SQL Fonksiyonu

```sql
-- supabase/migrations/004_functions_triggers.sql (devam)

CREATE OR REPLACE FUNCTION upsert_daily_stats(
  p_student_id UUID,
  p_date DATE,
  p_arp NUMERIC,
  p_xp INTEGER,
  p_duration_minutes INTEGER
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO daily_stats (student_id, date, avg_arp, xp_earned, total_minutes, sessions_count, exercises_completed)
  VALUES (p_student_id, p_date, p_arp, p_xp, p_duration_minutes, 1, 1)
  ON CONFLICT (student_id, date) DO UPDATE SET
    avg_arp = (daily_stats.avg_arp * daily_stats.sessions_count + p_arp) / (daily_stats.sessions_count + 1),
    xp_earned = daily_stats.xp_earned + p_xp,
    total_minutes = daily_stats.total_minutes + p_duration_minutes,
    sessions_count = daily_stats.sessions_count + 1,
    exercises_completed = daily_stats.exercises_completed + 1,
    goal_completed = (daily_stats.total_minutes + p_duration_minutes) >= daily_stats.daily_goal_minutes;
END;
$$;
```

---

## 10. BİRİM TESTLERİ

```typescript
// packages/shared/src/engine/__tests__/arpCalculator.test.ts

import { calculateREI, calculateCSF, calculateARP } from '../arpCalculator';

describe('ARP Hesaplayıcı', () => {
  test('REI doğru hesaplanmalı', () => {
    expect(calculateREI(300, 80)).toBe(240);   // 300 × 0.8 = 240
    expect(calculateREI(200, 100)).toBe(200);  // 200 × 1.0 = 200
    expect(calculateREI(500, 0)).toBe(0);      // Anlama 0 → REI 0
    expect(calculateREI(0, 100)).toBe(0);      // WPM 0 → REI 0
  });

  test('CSF 0-1 aralığında olmalı', () => {
    const csf = calculateCSF(0.1, 0.05, 0.1);
    expect(csf).toBeGreaterThan(0);
    expect(csf).toBeLessThanOrEqual(1);
  });

  test('CSF tüm faktörler 0 ise 1.0 olmalı', () => {
    expect(calculateCSF(0, 0, 0)).toBe(1);
  });

  test('CSF tüm faktörler 1 ise 0 olmalı', () => {
    expect(calculateCSF(1, 1, 1)).toBe(0);
  });

  test('ARP gerçekçi değer üretmeli', () => {
    const rei = calculateREI(300, 80);  // 240
    const csf = calculateCSF(0.05, 0.02, 0.05);  // ~0.96
    const arp = calculateARP(rei, csf);
    expect(arp).toBeGreaterThan(220);
    expect(arp).toBeLessThan(250);
  });

  test('Sınav avantajı örneği', () => {
    // Hızlı ama anlamayan
    const fast = calculateARP(calculateREI(450, 40), calculateCSF(0.2, 0.15, 0.3));
    // Dengeli
    const balanced = calculateARP(calculateREI(280, 85), calculateCSF(0.05, 0.03, 0.08));
    
    expect(balanced).toBeGreaterThan(fast);  // Dengeli daha iyi ARP
  });
});
```

---

## ✅ FAZ 04 TAMAMLANMA KRİTERLERİ

```
✅ Engine dosyaları oluşturuldu (tüm modüller)
✅ Birim testler geçiyor (pnpm test)
✅ TypeScript strict — hata yok
✅ processSession() bir session alıp PerformanceResult döndürüyor
✅ Pipeline servisi session'ı DB'ye yazıyor
✅ Pipeline sonrası cognitive_profiles güncelleniyor
✅ daily_stats güncelleniyor
✅ Farklı egzersiz türlerinden gelen metrikler işleniyor
```
