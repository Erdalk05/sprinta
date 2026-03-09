/**
 * Kartal Gözü — Göz Antrenman Modülü Tipleri
 */

export type CategoryType = 'saccadic' | 'peripheral' | 'tracking' | 'visual_mechanics'

export interface EyeMetrics {
  reactionTimeMs: number
  accuracyPercent: number
  trackingErrorPx: number          // drag egzersizlerinde, diğerlerinde 0
  visualAttentionScore: number     // 0–100, formula: accuracy*0.6 + speed*0.4
  saccadicSpeedEstimate: number    // hedef/sn
  taskCompletionMs: number
  arpContribution: number          // sabit katkı (egzersiz config'den)
}

export interface EyeExerciseProps {
  exerciseId: string
  difficulty: 1 | 2 | 3 | 4
  durationSeconds: number
  onComplete: (metrics: EyeMetrics) => void
  onExit: () => void
}

export interface EyeExerciseConfig {
  id: string
  title: string
  description: string
  category: CategoryType
  durationSeconds: number
  difficulty: 1 | 2 | 3 | 4
  arpContribution: number
  xpReward: number
  isBoss?: boolean
  // ── Intro ekranı alanları ────────────────────────────────────
  categoryIcon: string
  musclesTR: string
  readingBenefitTR: string
  examBenefitTR: string
  arpEffect: {
    regressionReduction: number   // 0–1 kesir
    errorRateReduction: number    // 0–1 kesir
    fatigueReduction: number      // 0–1 kesir
  }
}

export const EYE_EXERCISE_CONFIGS: EyeExerciseConfig[] = [
  // ─── Göz Atlaması (Sakkadik) ───────────────────────────────────
  {
    id: 'besgen_arena',
    title: 'Beşgen Arena',
    description: 'Beş köşe arasında zıplayan topu hızla yakala',
    category: 'saccadic',
    durationSeconds: 30,
    difficulty: 1,
    arpContribution: 3,
    xpReward: 30,
    categoryIcon: '⚡',
    musclesTR: 'Altı ekstraoküler kas koordinasyonu',
    readingBenefitTR: 'Satırlar arası geçiş hızını %40 artırır',
    examBenefitTR: 'Soru-şık tarama süresini kısaltır',
    arpEffect: { regressionReduction: 0.30, errorRateReduction: 0.25, fatigueReduction: 0.15 },
  },
  {
    id: 'zigzag_atlas',
    title: 'ZigZag Atlama Parkuru',
    description: 'Sıralı hedefleri zigzag düzeninde hızla tap\'la',
    category: 'saccadic',
    durationSeconds: 30,
    difficulty: 1,
    arpContribution: 3,
    xpReward: 25,
    categoryIcon: '⚡',
    musclesTR: 'Lateral ve medial rektus antagonist çiftleri',
    readingBenefitTR: 'Zigzag okuma paternini bozarak düz sakkad oluşturur',
    examBenefitTR: 'Çoktan seçmeli şık geçiş süresini kısaltır',
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.20, fatigueReduction: 0.10 },
  },
  {
    id: 'schulte_tablo',
    title: 'Schulte Göz Taraması',
    description: '5×5 ızgarada 1\'den 25\'e sırayla dokun',
    category: 'saccadic',
    durationSeconds: 60,
    difficulty: 2,
    arpContribution: 5,
    xpReward: 50,
    categoryIcon: '⚡',
    musclesTR: 'Tüm oküler kaslar — sakkad doğruluğu',
    readingBenefitTR: 'Sakkad verimliliği okuma hızını %35 artırır',
    examBenefitTR: 'Uzun paragraf tarama süresini kısaltır',
    arpEffect: { regressionReduction: 0.35, errorRateReduction: 0.30, fatigueReduction: 0.20 },
  },
  {
    id: 'rakam_sprint',
    title: 'Hızlı Rakam Algısı',
    description: 'Tek/çift rakamı anlık karar ver',
    category: 'saccadic',
    durationSeconds: 20,
    difficulty: 3,
    arpContribution: 4,
    xpReward: 40,
    categoryIcon: '⚡',
    musclesTR: 'Superior/inferior oblique — hızlı oryantasyon',
    readingBenefitTR: 'Kelime tanıma hızını %30 artırır',
    examBenefitTR: 'Flash bilgi işleme kapasitesini geliştirir',
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.25, fatigueReduction: 0.10 },
  },
  // ─── Çevresel Görüş (Periferik) ────────────────────────────────
  {
    id: 'meteor_yagmuru',
    title: 'Meteor Yağmuru',
    description: 'Düşen altın meteorları yakala, kırmızılardan kaç',
    category: 'peripheral',
    durationSeconds: 25,
    difficulty: 1,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '👁️',
    musclesTR: 'Periferik retina aktivasyonu — izole periferik sakkad',
    readingBenefitTR: 'Satır alt/üstünü görme — okuma alanı genişler',
    examBenefitTR: 'Uzun pasajlarda arama süresini kısaltır',
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.30, fatigueReduction: 0.20 },
  },
  {
    id: 'kalp_ritim',
    title: 'Kalp Ritmi Takibi',
    description: 'EKG dalgasının tepesini tam zamanında yakala',
    category: 'peripheral',
    durationSeconds: 30,
    difficulty: 2,
    arpContribution: 4,
    xpReward: 30,
    categoryIcon: '👁️',
    musclesTR: 'Smooth pursuit kasları — temporal ritim algısı',
    readingBenefitTR: 'Ritmik okuma hızını %20 artırır',
    examBenefitTR: 'Vurgulu ifadeleri daha hızlı algılar',
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.15, fatigueReduction: 0.25 },
  },
  {
    id: 'periferi_flash_avcisi',
    title: 'Periferi Dedektifi',
    description: 'Merkeze bak, kenarlardaki hedefleri say',
    category: 'peripheral',
    durationSeconds: 35,
    difficulty: 2,
    arpContribution: 5,
    xpReward: 40,
    categoryIcon: '👁️',
    musclesTR: 'Temporal ve nazal periferik retina',
    readingBenefitTR: 'Okuma sırasında satır kaymasını önler',
    examBenefitTR: 'Sayfa kenarlarındaki ek bilgiler görüş alanına girer',
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.20, fatigueReduction: 0.15 },
  },
  {
    id: 'satir_panorama',
    title: 'Panoramik Okuma Taraması',
    description: 'Geniş alan tarama + anlama sorusu',
    category: 'peripheral',
    durationSeconds: 40,
    difficulty: 3,
    arpContribution: 6,
    xpReward: 50,
    categoryIcon: '👁️',
    musclesTR: 'Geniş alan periferik görüş kasları',
    readingBenefitTR: 'Satırı daha az hareketle kapsayan geniş span',
    examBenefitTR: 'Uzun cümleleri tek geçişte kavrar',
    arpEffect: { regressionReduction: 0.30, errorRateReduction: 0.25, fatigueReduction: 0.20 },
  },
  {
    id: 'yildiz_agi_tarama',
    title: 'Yıldız Harita Taraması',
    description: '6 kollu yıldız üzerinde altın hedefleri bul',
    category: 'peripheral',
    durationSeconds: 30,
    difficulty: 2,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '👁️',
    musclesTR: '360° periferik alan aktivasyonu',
    readingBenefitTR: 'Sayfa düzeni algısını hızlandırır',
    examBenefitTR: 'Tablo/grafik taramayı optimize eder',
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.25, fatigueReduction: 0.15 },
  },
  // ─── Göz Takibi (Smooth Pursuit) ───────────────────────────────
  {
    id: 'pinball_goz',
    title: 'Pinball Göz Antrenmanı',
    description: 'Zıplayan topu takip et, parlayan bölgeye dokun',
    category: 'tracking',
    durationSeconds: 30,
    difficulty: 2,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '🔄',
    musclesTR: 'Smooth pursuit kasları — sürekli takip',
    readingBenefitTR: 'Dinamik satır takibini güçlendirir',
    examBenefitTR: 'Hızlı değişen bilgiyi kayıpsız takip eder',
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.25, fatigueReduction: 0.30 },
  },
  {
    id: 'cup_oyunu',
    title: 'Karışık Bardak Oyunu',
    description: 'Topu hangi bardağa sakladık? Takip et, bul!',
    category: 'tracking',
    durationSeconds: 35,
    difficulty: 2,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '🔄',
    musclesTR: 'Okülomotor tahmin kasları',
    readingBenefitTR: 'Metin içinde nesne takibi gelişir',
    examBenefitTR: 'Çözüm adımlarını zihinsel takip kapasitesi artar',
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.30, fatigueReduction: 0.20 },
  },
  {
    id: 'rastgele_flash_tuzagi',
    title: 'Flash Reaksiyon Testi',
    description: '3×3 bölge flash — doğru bölgeye dokun',
    category: 'tracking',
    durationSeconds: 25,
    difficulty: 2,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '🔄',
    musclesTR: 'Sakkad başlatma hızı — superior kolliculus',
    readingBenefitTR: 'Yanlış satıra dönüş süresini azaltır',
    examBenefitTR: 'Soru arasında odak geçişini hızlandırır',
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.20, fatigueReduction: 0.15 },
  },
  {
    id: 'spiral_takip_ritmi',
    title: 'Spiral Yörünge Takibi',
    description: 'Spiral yolu parmakla hassas takip et',
    category: 'tracking',
    durationSeconds: 35,
    difficulty: 3,
    arpContribution: 5,
    xpReward: 45,
    categoryIcon: '🔄',
    musclesTR: 'Sirküler smooth pursuit — tüm oküler kaslar',
    readingBenefitTR: 'Karmaşık sayfa düzenlerinde göz kontrolü',
    examBenefitTR: 'Çok sütunlu soru formatında navigasyon',
    arpEffect: { regressionReduction: 0.30, errorRateReduction: 0.25, fatigueReduction: 0.20 },
  },
  {
    id: 'dalga_surucusu',
    title: 'Sinüs Dalgası Sörfü',
    description: 'Sinüs dalgasını parmakla akışkan izle',
    category: 'tracking',
    durationSeconds: 30,
    difficulty: 3,
    arpContribution: 5,
    xpReward: 40,
    categoryIcon: '🔄',
    musclesTR: 'Yatay smooth pursuit — ince motor oküler kontrol',
    readingBenefitTR: 'Uzun satırlarda kaymasız akış',
    examBenefitTR: 'Matematik/formül satırlarında hata azaltır',
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.30, fatigueReduction: 0.20 },
  },
  // ─── Yeni Kelime + Okuma Oyunları ──────────────────────────────
  {
    id: 'kelime_yagmuru',
    title: 'Kelime Yağmuru',
    description: 'Ekrandan düşen kelimelerden doğru anlamlıya dokun',
    category: 'peripheral',
    durationSeconds: 30,
    difficulty: 1,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '👁️',
    musclesTR: 'Periferik retina aktivasyonu — anlam işleme hızı',
    readingBenefitTR: 'Kelime tanıma hızını ve periferik sözcük algısını artırır',
    examBenefitTR: 'LGS kelime anlamı sorularında tepki hızını geliştirir',
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.25, fatigueReduction: 0.15 },
  },
  {
    id: 'harf_zinciri',
    title: 'Harf Zinciri',
    description: 'Son harfle başlayan yeni kelimeyi 3 şıktan seç',
    category: 'saccadic',
    durationSeconds: 35,
    difficulty: 2,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '⚡',
    musclesTR: 'Sakkad hızı — kelime sonlandırma algısı',
    readingBenefitTR: 'Hızlı sakkad ve kelime başlangıcı algısını güçlendirir',
    examBenefitTR: 'Türkçe sözcük yapısı bilgisini pekiştirir',
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.20, fatigueReduction: 0.10 },
  },
  {
    id: 'kelime_eslestirme',
    title: 'Kelime Eşleştirme',
    description: '4×4 gridte türkçe↔anlam kart çiftlerini bul',
    category: 'saccadic',
    durationSeconds: 40,
    difficulty: 2,
    arpContribution: 5,
    xpReward: 40,
    categoryIcon: '⚡',
    musclesTR: 'Çoklu sakkad — görsel bellek aktivasyonu',
    readingBenefitTR: 'Görsel hafıza ve kelime dağarcığını eş zamanlı güçlendirir',
    examBenefitTR: 'Kelime anlamı eşleştirme sorularını hızlandırır',
    arpEffect: { regressionReduction: 0.30, errorRateReduction: 0.20, fatigueReduction: 0.15 },
  },
  {
    id: 'anagram_cozucu',
    title: 'Anagram Çözücü',
    description: 'Karışık harfleri doğru sırayla tap\'la',
    category: 'saccadic',
    durationSeconds: 25,
    difficulty: 2,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '⚡',
    musclesTR: 'Hızlı sakkad — harf sırası algısı',
    readingBenefitTR: 'Harf-hece-kelime tanıma döngüsünü hızlandırır',
    examBenefitTR: 'Kelime yazımı ve heceleme bilgisini pekiştirir',
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.25, fatigueReduction: 0.10 },
  },
  {
    id: 'kelime_sniper',
    title: 'Kelime Sniper',
    description: 'Tanımı gösterilen kelimeyi 3×3 gridde bul',
    category: 'tracking',
    durationSeconds: 30,
    difficulty: 2,
    arpContribution: 4,
    xpReward: 35,
    categoryIcon: '🔄',
    musclesTR: 'Smooth pursuit — kelime tarama mekaniği',
    readingBenefitTR: 'Tanım-kelime eşleştirme hızını artırır',
    examBenefitTR: 'Sözlük sorularında tarama hızını optimize eder',
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.30, fatigueReduction: 0.15 },
  },
  {
    id: 'cumle_yarisi',
    title: 'Cümle Yarışı',
    description: 'Cümleyi oku → "Okudum!" tap → WPM ölç → 5 tur',
    category: 'peripheral',
    durationSeconds: 20,
    difficulty: 1,
    arpContribution: 4,
    xpReward: 30,
    categoryIcon: '👁️',
    musclesTR: 'Horizontal smooth pursuit — cümle akışı',
    readingBenefitTR: 'Okuma hızı ölçümü ve WPM farkındalığı oluşturur',
    examBenefitTR: 'Sınav metni okuma süresi tahminini geliştirir',
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.20, fatigueReduction: 0.25 },
  },
  {
    id: 'hecele_atla',
    title: 'Heceleme Atlama',
    description: 'Kelime hecelere bölünür → sırayla tap (hece flash)',
    category: 'saccadic',
    durationSeconds: 30,
    difficulty: 1,
    arpContribution: 3,
    xpReward: 30,
    categoryIcon: '⚡',
    musclesTR: 'Sakkad doğruluğu — hece sıralaması',
    readingBenefitTR: 'Heceleme bilinci okuma doğruluğunu artırır',
    examBenefitTR: 'Türkçe harf-hece-kelime bilgisini pekiştirir',
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.20, fatigueReduction: 0.10 },
  },
  {
    id: 'soru_kosusu',
    title: 'Soru Koşusu',
    description: 'Kısa pasaj oku → süre baskısıyla cevapla → 5 tur',
    category: 'tracking',
    durationSeconds: 40,
    difficulty: 2,
    arpContribution: 6,
    xpReward: 50,
    categoryIcon: '🔄',
    musclesTR: 'Süstained attention — pasaj takip kasları',
    readingBenefitTR: 'Okuma anlama hızını ve odak süresini artırır',
    examBenefitTR: 'LGS okuma pasajı soru çözme hızını optimize eder',
    arpEffect: { regressionReduction: 0.30, errorRateReduction: 0.25, fatigueReduction: 0.20 },
  },
  // ─── Boss ──────────────────────────────────────────────────────
  {
    id: 'kartal_meydan_okumasi',
    title: 'Kartal Elit Testi',
    description: '4 faz: Schulte → Meteor → Spiral → Flash',
    category: 'saccadic',
    durationSeconds: 50,
    difficulty: 4,
    arpContribution: 12,
    xpReward: 150,
    isBoss: true,
    categoryIcon: '🏆',
    musclesTR: 'Tüm oküler kaslar — koordinasyon ve dayanıklılık',
    readingBenefitTR: 'Tüm okuma kaslarını en yüksek performansa taşır',
    examBenefitTR: 'LGS/TYT sınav dayanıklılığını optimize eder',
    arpEffect: { regressionReduction: 0.50, errorRateReduction: 0.45, fatigueReduction: 0.40 },
  },
]

export const CATEGORY_COLORS: Record<CategoryType | 'boss', string> = {
  saccadic:         '#1877F2',
  peripheral:       '#0EA5E9',
  tracking:         '#6366F1',
  visual_mechanics: '#38B6D8',
  boss:             '#7C3AED',
}

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  saccadic:         'GÖZ ATLAMASI (Sakkadik)',
  peripheral:       'ÇEVRESEL GÖRÜŞ (Periferik)',
  tracking:         'GÖZ TAKİBİ (Smooth Pursuit)',
  visual_mechanics: 'GÖRSEL MEKANİK',
}

export const CATEGORY_SHORT: Record<CategoryType, string> = {
  saccadic:         'Göz Atlaması',
  peripheral:       'Çevresel Görüş',
  tracking:         'Göz Takibi',
  visual_mechanics: 'Görsel Mekanik',
}
