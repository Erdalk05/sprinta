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
  | 'yagmur_hedef'
  | 'renk_hafiza'

export interface VisualExerciseConfig {
  id:               ExerciseId
  titleTR:          string
  categoryTR:       string   // "Göz Sıçrama Egzersizi (Sakkad)"
  categoryIcon:     string   // "⚡"
  descriptionTR:    string
  targetMusclesTR:  string
  readingBenefitTR: string
  examBenefitTR:    string
  difficultyDots:   1 | 2 | 3 | 4   // egzersizin zorluk seviyesi (UI nokta)
  baseDurationSec:  number           // saniye (Level 2 baz)
  arpEffect: {
    regressionReduction: number  // 0-1
    errorRateReduction:  number
    fatigueReduction:    number
  }
  durationByLevel: Record<DifficultyLevel, { min: number; max: number }>
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
    id:            'flash_jump_matrix',
    titleTR:       'Flash Atlama Matrisi',
    categoryTR:    'Göz Sıçrama Egzersizi (Sakkad)',
    categoryIcon:  '⚡',
    descriptionTR: 'Izgara üzerinde yanan noktaları hızla takip ederek göz sıçrama hızını artır.',
    targetMusclesTR:  'Medial ve lateral rektus kasları',
    readingBenefitTR: 'Satır değiştirme hızını artırır, sakkad süresini kısaltır',
    examBenefitTR:    'Soru arası geçiş hızını %20 artırır',
    difficultyDots:   2,
    baseDurationSec:  35,
    arpEffect: { regressionReduction: 0.30, errorRateReduction: 0.20, fatigueReduction: 0.10 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  vertical_pulse_track: {
    id:            'vertical_pulse_track',
    titleTR:       'Dikey Nabız Takibi',
    categoryTR:    'Akıcı Takip Egzersizi (Smooth Pursuit)',
    categoryIcon:  '📈',
    descriptionTR: 'Yukarı-aşağı hareket eden hedefi kesintisiz takip et.',
    targetMusclesTR:  'Superior ve inferior rektus kasları',
    readingBenefitTR: 'Paragraf değişimlerinde göz adaptasyonunu hızlandırır',
    examBenefitTR:    'Uzun paragraf okuma yorgunluğunu azaltır',
    difficultyDots:   1,
    baseDurationSec:  30,
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.25, fatigueReduction: 0.20 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  diagonal_laser_dash: {
    id:            'diagonal_laser_dash',
    titleTR:       'Çapraz Lazer Koşusu',
    categoryTR:    'Koordinasyon Egzersizi (Sakkad + Takip)',
    categoryIcon:  '✖️',
    descriptionTR: 'Çapraz yönde hareket eden lazeri takip ederek göz koordinasyonunu geliştir.',
    targetMusclesTR:  'Oblik kaslar (superior ve inferior oblique)',
    readingBenefitTR: 'Göz koordinasyonunu artırır, çapraz okuma açısını genişletir',
    examBenefitTR:    'Grafik ve tablo okuma hızını artırır',
    difficultyDots:   3,
    baseDurationSec:  40,
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.20, fatigueReduction: 0.15 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  peripheral_flash_hunter: {
    id:            'peripheral_flash_hunter',
    titleTR:       'Periferik Flash Avcısı',
    categoryTR:    'Geniş Görüş Egzersizi (Periferik)',
    categoryIcon:  '👁',
    descriptionTR: 'Merkeze bakarken çevrede beliren hedefleri yakala.',
    targetMusclesTR:  'Temporal ve nazal retina, periferik görüş alanı',
    readingBenefitTR: 'Tek fiksasyonda daha fazla kelime algılamayı sağlar',
    examBenefitTR:    'Sınav kağıdında hızlı tarama becerisini artırır',
    difficultyDots:   2,
    baseDurationSec:  35,
    arpEffect: { regressionReduction: 0.35, errorRateReduction: 0.15, fatigueReduction: 0.10 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  expanding_rings_focus: {
    id:            'expanding_rings_focus',
    titleTR:       'Genişleyen Halka Odağı',
    categoryTR:    'Odak Egzersizi (Fiksasyon)',
    categoryIcon:  '🎯',
    descriptionTR: 'Merkezde büyüyüp küçülen halkalara odaklanarak dikkat stabilitesini artır.',
    targetMusclesTR:  'Siliyer kas (lens akkomodasyon)',
    readingBenefitTR: 'Farklı uzaklıklara hızlı odaklanmayı sağlar',
    examBenefitTR:    'Soru kağıdı ile saat arası göz geçişlerini kolaylaştırır',
    difficultyDots:   1,
    baseDurationSec:  30,
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.30, fatigueReduction: 0.25 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  speed_dot_storm: {
    id:            'speed_dot_storm',
    titleTR:       'Hız Nokta Fırtınası',
    categoryTR:    'Tepki Hızı Egzersizi (Reaction Speed)',
    categoryIcon:  '⚡',
    descriptionTR: 'Ekranda aniden beliren hedeflere maksimum hızda tepki ver.',
    targetMusclesTR:  'Tüm ekstraokuler kaslar, hızlı sakkad refleksi',
    readingBenefitTR: 'Göz tepki süresini kısaltır, hızlı sakkad refleksini geliştirir',
    examBenefitTR:    'Çoktan seçmeli sorularda şık taramasını hızlandırır',
    difficultyDots:   3,
    baseDurationSec:  35,
    arpEffect: { regressionReduction: 0.30, errorRateReduction: 0.20, fatigueReduction: 0.10 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  opposite_pull: {
    id:            'opposite_pull',
    titleTR:       'Karşıt Çekim',
    categoryTR:    'Hızlı Geçiş Egzersizi (Sakkad)',
    categoryIcon:  '🧲',
    descriptionTR: 'Zıt yönlerde hareket eden iki hedef arasında gözünü hızlıca geçir.',
    targetMusclesTR:  'Medial-lateral rektus antagonist kas çifti',
    readingBenefitTR: 'İki sütun arası geçiş hızını artırır',
    examBenefitTR:    'Soru-şık arası okuma hızını optimize eder',
    difficultyDots:   2,
    baseDurationSec:  40,
    arpEffect: { regressionReduction: 0.25, errorRateReduction: 0.25, fatigueReduction: 0.15 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  random_blink_trap: {
    id:            'random_blink_trap',
    titleTR:       'Rastgele Flash Tuzağı',
    categoryTR:    'Görsel Algı Egzersizi (Visual Processing)',
    categoryIcon:  '✨',
    descriptionTR: 'Rastgele beliren hedefleri mümkün olan en kısa sürede fark et.',
    targetMusclesTR:  'Sakkadik göz hareketleri, superior colliculus aktivasyonu',
    readingBenefitTR: 'Öngörülemeyen göz hareketlerini otomatikleştirir',
    examBenefitTR:    'Panik durumunda bile hızlı görsel işleme sağlar',
    difficultyDots:   3,
    baseDurationSec:  35,
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.30, fatigueReduction: 0.10 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  circular_orbit_chase: {
    id:            'circular_orbit_chase',
    titleTR:       'Dairesel Yörünge Takibi',
    categoryTR:    'Akıcı Takip Egzersizi (Smooth Pursuit)',
    categoryIcon:  '🌀',
    descriptionTR: 'Dairesel hareket eden hedefi sabit hızla takip et.',
    targetMusclesTR:  'Tüm ekstraokuler kaslar, smooth pursuit sistemi',
    readingBenefitTR: 'Düzgün göz takip hareketini güçlendirir',
    examBenefitTR:    'Uzun cümlelerde satır kaybetmeyi önler',
    difficultyDots:   3,
    baseDurationSec:  40,
    arpEffect: { regressionReduction: 0.30, errorRateReduction: 0.20, fatigueReduction: 0.20 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  shrink_zoom_focus: {
    id:            'shrink_zoom_focus',
    titleTR:       'Küçül & Yaklaş Odağı',
    categoryTR:    'Derinlik Odak Egzersizi',
    categoryIcon:  '🔍',
    descriptionTR: 'Büyüyüp küçülen hedefi merkezi görüşte takip et.',
    targetMusclesTR:  'Siliyer kas, pupil sfinkter kası',
    readingBenefitTR: 'Dipnot ve küçük metin okuma konforunu artırır',
    examBenefitTR:    'Küçük punto sorularda görsel yorgunluğu azaltır',
    difficultyDots:   2,
    baseDurationSec:  35,
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.20, fatigueReduction: 0.35 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  double_target_switch: {
    id:            'double_target_switch',
    titleTR:       'Çift Hedef Geçişi',
    categoryTR:    'Göz Geçiş Egzersizi (Sakkad)',
    categoryIcon:  '↔️',
    descriptionTR: 'Ekrandaki iki hedef arasında hızlı göz geçişi yap.',
    targetMusclesTR:  'Binoküler füzyon kasları, vergence sistemi',
    readingBenefitTR: 'İki göz koordinasyonunu güçlendirerek çift görüntü riskini azaltır',
    examBenefitTR:    'Uzun sınav seanslarında göz yorgunluğunu geciktirir',
    difficultyDots:   2,
    baseDurationSec:  30,
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.25, fatigueReduction: 0.25 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  line_scan_sprint: {
    id:            'line_scan_sprint',
    titleTR:       'Satır Tarama Koşusu',
    categoryTR:    'Okuma Sıçrama Egzersizi (Sakkad)',
    categoryIcon:  '📖',
    descriptionTR: 'Satır boyunca hareket eden hedefleri soldan sağa takip et.',
    targetMusclesTR:  'Medial-lateral rektus, okuma sakkadı refleksi',
    readingBenefitTR: 'Doğal okuma yönündeki göz hareketini otomatikleştirir',
    examBenefitTR:    'Satır takibini %30 hızlandırır',
    difficultyDots:   3,
    baseDurationSec:  40,
    arpEffect: { regressionReduction: 0.40, errorRateReduction: 0.20, fatigueReduction: 0.10 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  split_screen_mirror: {
    id:            'split_screen_mirror',
    titleTR:       'Bölünmüş Ekran Aynası',
    categoryTR:    'Periferik Koordinasyon Egzersizi',
    categoryIcon:  '🪞',
    descriptionTR: 'Ekranın iki yarısında hareket eden hedefleri eş zamanlı takip et.',
    targetMusclesTR:  'Binoküler disparity sistemi, kortikal füzyon',
    readingBenefitTR: 'Her iki göz arasındaki senkronizasyonu güçlendirir',
    examBenefitTR:    'Çift sütunlu soru formatlarında okuma verimliliğini artırır',
    difficultyDots:   4,
    baseDurationSec:  40,
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.30, fatigueReduction: 0.20 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  micro_pause_react: {
    id:            'micro_pause_react',
    titleTR:       'Mikro Duraklama Tepkisi',
    categoryTR:    'Tepki Kontrol Egzersizi',
    categoryIcon:  '⏹',
    descriptionTR: 'Hareket durduğu anda doğru hedefe tepki ver.',
    targetMusclesTR:  'Sustained attention sistemi, inhibitory control',
    readingBenefitTR: 'Kelime duraklamalarında anlam çıkarmayı hızlandırır',
    examBenefitTR:    'Dikkat tutma süresini ve odaklanmayı artırır',
    difficultyDots:   3,
    baseDurationSec:  35,
    arpEffect: { regressionReduction: 0.15, errorRateReduction: 0.35, fatigueReduction: 0.20 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  tunnel_vision_breaker: {
    id:            'tunnel_vision_breaker',
    titleTR:       'Kartal Kilidi',
    categoryTR:    'Elite Odak Egzersizi',
    categoryIcon:  '🦅',
    descriptionTR: 'Birden fazla hedef arasından doğru olanı seç.',
    targetMusclesTR:  'Periferik retina, magnosellüler görsel yol',
    readingBenefitTR: 'Periferal görüş alanını maksimize ederek okuma genişliğini artırır',
    examBenefitTR:    'Sınav kağıdını daha az fiksasyonla tarama imkânı sağlar',
    difficultyDots:   4,
    baseDurationSec:  45,
    arpEffect: { regressionReduction: 0.35, errorRateReduction: 0.15, fatigueReduction: 0.15 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  yagmur_hedef: {
    id:            'yagmur_hedef',
    titleTR:       'Yağmur Hedef',
    categoryTR:    'Geniş Görüş Egzersizi (Periferik)',
    categoryIcon:  '🌧️',
    descriptionTR: 'Renkli daireler düşer, hedef renge dokun — renk-dikkat antrenmanı.',
    targetMusclesTR:  'Periferik retina, renk algı kasları',
    readingBenefitTR: 'Periferik renk algısını %20 artırır',
    examBenefitTR:    'Sınav kağıdında önemli bilgileri renk ile ayırt eder',
    difficultyDots:   2,
    baseDurationSec:  30,
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.25, fatigueReduction: 0.15 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
    },
  },

  renk_hafiza: {
    id:            'renk_hafiza',
    titleTR:       'Renk Hafızası',
    categoryTR:    'Görsel Hafıza Egzersizi (Flash Matrix)',
    categoryIcon:  '🎨',
    descriptionTR: 'Renkli kart çiftlerini bul — görsel hafıza + sakkadik tarama.',
    targetMusclesTR:  'Görsel kortikal hafıza, sakkadik arama',
    readingBenefitTR: 'Görsel hafıza kapasitesini artırır',
    examBenefitTR:    'Şıklar arasında hızlı görsel karşılaştırma yapar',
    difficultyDots:   2,
    baseDurationSec:  35,
    arpEffect: { regressionReduction: 0.20, errorRateReduction: 0.30, fatigueReduction: 0.15 },
    durationByLevel: {
      1: { min: 40, max: 50 }, 2: { min: 35, max: 45 },
      3: { min: 25, max: 35 }, 4: { min: 20, max: 30 },
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
  'yagmur_hedef',
  'renk_hafiza',
]
