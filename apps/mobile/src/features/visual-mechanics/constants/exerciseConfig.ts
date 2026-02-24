/**
 * Visual Mechanics — Egzersiz Konfigürasyonları
 * 15 göz egzersizinin tüm meta verilerini içerir.
 */

export type DifficultyLevel = 1 | 2 | 3 | 4

export type ExerciseId =
  | 'flash_jump_matrix'
  | 'vertical_pulse_track'
  | 'diagonal_laser_dash'
  | 'peripheral_flash_hunter'
  | 'expanding_rings_focus'
  | 'speed_dot_storm'
  | 'opposite_pull'
  | 'random_blink_trap'
  | 'circular_orbit_chase'
  | 'shrink_zoom_focus'
  | 'double_target_switch'
  | 'line_scan_sprint'
  | 'split_screen_mirror'
  | 'micro_pause_react'
  | 'tunnel_vision_breaker'

export interface VisualExerciseConfig {
  id: ExerciseId
  titleTR: string
  descriptionTR: string
  targetMusclesTR: string
  readingBenefitTR: string
  examBenefitTR: string
  arpEffect: {
    regressionReduction: number // 0-1
    errorRateReduction: number
    fatigueReduction: number
  }
  durationByLevel: Record<DifficultyLevel, { min: number; max: number }> // saniye
}

export const DIFFICULTY_MULTIPLIER: Record<DifficultyLevel, number> = {
  1: 1.0,
  2: 1.3,
  3: 1.6,
  4: 2.0,
}

export const DURATION_BY_LEVEL: Record<DifficultyLevel, { min: number; max: number }> = {
  1: { min: 40, max: 50 },
  2: { min: 35, max: 45 },
  3: { min: 25, max: 35 },
  4: { min: 20, max: 30 },
}

export const EXERCISE_CONFIGS: Record<ExerciseId, VisualExerciseConfig> = {
  flash_jump_matrix: {
    id: 'flash_jump_matrix',
    titleTR: 'Flash Atlama Matrisi',
    descriptionTR:
      'Izgara üzerinde yanan noktaları hızla takip ederek göz sakkad hareketini güçlendir.',
    targetMusclesTR: 'Ekstraokuler kaslar (medial ve lateral rektus)',
    readingBenefitTR: 'Satır değiştirme hızını artırır, sakkad süresini kısaltır',
    examBenefitTR: 'Soru arası geçiş hızını %20 artırır',
    arpEffect: { regressionReduction: 0.3, errorRateReduction: 0.2, fatigueReduction: 0.1 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  vertical_pulse_track: {
    id: 'vertical_pulse_track',
    titleTR: 'Dikey Nabız Takibi',
    descriptionTR:
      'Yukarı-aşağı hareket eden nabzı gözlerinle takip ederek dikey göz kaslarını çalıştır.',
    targetMusclesTR: 'Superior ve inferior rektus kasları',
    readingBenefitTR: 'Paragraf değişimlerinde göz adaptasyonunu hızlandırır',
    examBenefitTR: 'Uzun paragraf okuma yorgunluğunu azaltır',
    arpEffect: { regressionReduction: 0.2, errorRateReduction: 0.25, fatigueReduction: 0.2 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  diagonal_laser_dash: {
    id: 'diagonal_laser_dash',
    titleTR: 'Çapraz Lazer Koşusu',
    descriptionTR: 'Çapraz yönde hareket eden lazer ışınını gözlerinle takip et.',
    targetMusclesTR: 'Oblik kaslar (superior ve inferior oblique)',
    readingBenefitTR: 'Göz koordinasyonunu artırır, çapraz okuma açısını genişletir',
    examBenefitTR: 'Grafik ve tablo okuma hızını artırır',
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.2, fatigueReduction: 0.15 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  peripheral_flash_hunter: {
    id: 'peripheral_flash_hunter',
    titleTR: 'Periferik Flash Avcısı',
    descriptionTR: 'Merkeze bakarken çevrede beliren hedefleri fark et ve dokun.',
    targetMusclesTR: 'Periferik görüş alanı, temporal ve nazal retina',
    readingBenefitTR: 'Çevre görüşü genişleterek tek fiksasyonda daha fazla kelime algılama sağlar',
    examBenefitTR: 'Sınav kağıdında hızlı tarama becerisini artırır',
    arpEffect: { regressionReduction: 0.35, errorRateReduction: 0.15, fatigueReduction: 0.1 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  expanding_rings_focus: {
    id: 'expanding_rings_focus',
    titleTR: 'Genişleyen Halkalar Odağı',
    descriptionTR: 'Genişleyip daralan halkaları takip ederek göz odak kasını güçlendir.',
    targetMusclesTR: 'Siliyer kas (lens akkomodasyon)',
    readingBenefitTR: 'Farklı uzaklıklara hızlı odaklanmayı sağlar',
    examBenefitTR: 'Soru kağıdı ile saat arası göz geçişlerini kolaylaştırır',
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.3, fatigueReduction: 0.25 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  speed_dot_storm: {
    id: 'speed_dot_storm',
    titleTR: 'Hız Nokta Fırtınası',
    descriptionTR: 'Ekranda beliren ve kaybolan noktaları maksimum hızda takip et.',
    targetMusclesTR: 'Tüm ekstraokuler kaslar, hızlı sakkad refleksi',
    readingBenefitTR: 'Göz tepki süresini kısaltır, hızlı sakkad refleksini geliştirir',
    examBenefitTR: 'Çoktan seçmeli sorularda şık taramasını hızlandırır',
    arpEffect: { regressionReduction: 0.3, errorRateReduction: 0.2, fatigueReduction: 0.1 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  opposite_pull: {
    id: 'opposite_pull',
    titleTR: 'Karşıt Çekim',
    descriptionTR: 'Zıt yönlerde hareket eden iki hedef arasında gözlerini hızla geçir.',
    targetMusclesTR: 'Medial-lateral rektus antagonist kas çifti',
    readingBenefitTR: 'İki sütun arasında geçiş hızını artırır',
    examBenefitTR: 'Soru-şık arası okuma hızını optimize eder',
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.25, fatigueReduction: 0.15 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  random_blink_trap: {
    id: 'random_blink_trap',
    titleTR: 'Rastgele Yanıp Sönme Tuzağı',
    descriptionTR: 'Rastgele konumlarda beliren hedeflere dokunarak tepki süreni test et.',
    targetMusclesTR: 'Sakkadik göz hareketleri, superior colliculus aktivasyonu',
    readingBenefitTR: 'Öngörülemeyen göz hareketlerini otomatikleştirir',
    examBenefitTR: 'Panik durumunda bile hızlı görsel işleme sağlar',
    arpEffect: { regressionReduction: 0.2, errorRateReduction: 0.3, fatigueReduction: 0.1 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  circular_orbit_chase: {
    id: 'circular_orbit_chase',
    titleTR: 'Dairesel Yörünge Takibi',
    descriptionTR:
      'Dairesel yörüngede hareket eden hedefi sabit hızla gözlerinle takip et.',
    targetMusclesTR: 'Tüm ekstraokuler kaslar, smooth pursuit sistemi',
    readingBenefitTR: 'Düzgün göz takip hareketini (smooth pursuit) güçlendirir',
    examBenefitTR: 'Uzun cümlelerde satır kaybetmeyi önler',
    arpEffect: { regressionReduction: 0.3, errorRateReduction: 0.2, fatigueReduction: 0.2 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  shrink_zoom_focus: {
    id: 'shrink_zoom_focus',
    titleTR: 'Küçül & Yaklaş Odağı',
    descriptionTR:
      'Büyüyüp küçülen hedefi merkezi görüşte takip ederek odak kasını güçlendir.',
    targetMusclesTR: 'Siliyer kas, pupil sfinkter kası',
    readingBenefitTR: 'Dipnot ve küçük metin okuma konforunu artırır',
    examBenefitTR: 'Küçük punto sorularda görsel yorgunluğu azaltır',
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.2, fatigueReduction: 0.35 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  double_target_switch: {
    id: 'double_target_switch',
    titleTR: 'Çift Hedef Geçişi',
    descriptionTR:
      'Aynı anda ekranda iki hedef arasında hızlı geçiş yaparak binoküler koordinasyonu artır.',
    targetMusclesTR: 'Binoküler füzyon kasları, vergence sistemi',
    readingBenefitTR: 'İki göz koordinasyonunu güçlendirerek çift görüntü riskini azaltır',
    examBenefitTR: 'Uzun sınav seanslarında göz yorgunluğunu geciktirir',
    arpEffect: { regressionReduction: 0.2, errorRateReduction: 0.25, fatigueReduction: 0.25 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  line_scan_sprint: {
    id: 'line_scan_sprint',
    titleTR: 'Satır Tarama Koşusu',
    descriptionTR:
      'Yatay çizgi boyunca soldan sağa hızla hareket eden noktayı takip et.',
    targetMusclesTR: 'Medial-lateral rektus, okuma sakkadı refleksi',
    readingBenefitTR: 'Doğal okuma yönündeki göz hareketini otomatikleştirir',
    examBenefitTR: 'Satır takibini %30 hızlandırır',
    arpEffect: { regressionReduction: 0.4, errorRateReduction: 0.2, fatigueReduction: 0.1 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  split_screen_mirror: {
    id: 'split_screen_mirror',
    titleTR: 'Bölünmüş Ekran Aynası',
    descriptionTR: 'Ekranın iki yarısında eşzamanlı hareket eden noktaları takip et.',
    targetMusclesTR: 'Binoküler disparity sistemi, kortikal füzyon',
    readingBenefitTR: 'Her iki göz arasındaki senkronizasyonu güçlendirir',
    examBenefitTR: 'Çift sütunlu soru formatlarında okuma verimliliğini artırır',
    arpEffect: { regressionReduction: 0.2, errorRateReduction: 0.3, fatigueReduction: 0.2 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  micro_pause_react: {
    id: 'micro_pause_react',
    titleTR: 'Mikro Duraklatma Tepkisi',
    descriptionTR:
      'Hareket duran hedefi anında fark edip dokun — dikkat ve tepki zamanını test eder.',
    targetMusclesTR: 'Sustained attention sistemi, inhibitory control',
    readingBenefitTR: 'Kelime duraklamalarında anlam çıkarmayı hızlandırır',
    examBenefitTR: 'Dikkat tutma süresini ve odaklanmayı artırır',
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.35, fatigueReduction: 0.2 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
  tunnel_vision_breaker: {
    id: 'tunnel_vision_breaker',
    titleTR: 'Tünel Görüş Kırıcı',
    descriptionTR: 'Merkeze odaklanırken ekranın tam kenarlarındaki hedefleri algıla.',
    targetMusclesTR: 'Periferik retina, magnosellüler görsel yol',
    readingBenefitTR: 'Periferal görüş alanını maksimize ederek okuma genişliğini artırır',
    examBenefitTR: 'Sınav kağıdını daha az fiksasyonla tarama imkânı sağlar',
    arpEffect: { regressionReduction: 0.35, errorRateReduction: 0.15, fatigueReduction: 0.15 },
    durationByLevel: {
      1: { min: 40, max: 50 },
      2: { min: 35, max: 45 },
      3: { min: 25, max: 35 },
      4: { min: 20, max: 30 },
    },
  },
}

/** Egzersiz ID listesi (sıralı) */
export const EXERCISE_ID_LIST: ExerciseId[] = [
  'flash_jump_matrix',
  'vertical_pulse_track',
  'diagonal_laser_dash',
  'peripheral_flash_hunter',
  'expanding_rings_focus',
  'speed_dot_storm',
  'opposite_pull',
  'random_blink_trap',
  'circular_orbit_chase',
  'shrink_zoom_focus',
  'double_target_switch',
  'line_scan_sprint',
  'split_screen_mirror',
  'micro_pause_react',
  'tunnel_vision_breaker',
]
