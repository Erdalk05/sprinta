export interface ModuleConfig {
  label: string
  icon: string
  color: string
  description: string
  duration: string
  tip: string
}

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  speed_control: {
    label: 'Hız Kontrolü',
    icon: '⚡',
    color: '#6C3EE8',
    description: 'Okuma hızını artır, anlayarak ilerle',
    duration: '10–15 dk',
    tip: 'Her parça ekranda belirip kaybolacak. Odaklanmaya çalış.',
  },
  deep_comprehension: {
    label: 'Derin Kavrama',
    icon: '🧠',
    color: '#059669',
    description: 'Metni derinlemesine anla ve analiz et',
    duration: '15–20 dk',
    tip: 'Metni kendi hızında oku, sonra soruları yanıtla.',
  },
  attention_power: {
    label: 'Dikkat Gücü',
    icon: '🎯',
    color: '#D97706',
    description: 'Odak ve dikkat kapasiteni geliştir',
    duration: '5–10 dk',
    tip: 'Hedef harfi en hızlı şekilde bul. Süre önemli!',
  },
  mental_reset: {
    label: 'Zihinsel Sıfırlama',
    icon: '🌿',
    color: '#0EA5E9',
    description: 'Zihnini dinlendir ve yenile',
    duration: '5 dk',
    tip: 'Nefes egzersizi: 4 san nefes al, 7 san tut, 8 san bırak.',
  },
}
