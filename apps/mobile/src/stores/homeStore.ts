/**
 * homeStore — SPRINTA v3 Ana Sayfa State
 * Sport Premium Edition — Mock veriler + actions
 */
import { create } from 'zustand'

export interface SkillLevel {
  id:          string
  label:       string
  icon:        string
  value:       number     // 0–100 (seviye: 1-10 = value/10)
  description: string
  drillLabel:  string
  drillRoute:  string
}

export interface DayStat {
  label:    string              // 'Pzt', 'Sal'…
  minutes:  number
  wpm:      number
  sessions: number
  isToday:  boolean
  trend:    'up' | 'neutral' | 'down'
}

interface HomeState {
  // ── Performans ─────────────────────────────────────────────────
  currentWPM:       number
  deltaPercent:     number        // +/- son oturuma göre
  focusScore:       number        // 0–100
  eyeStability:     number        // 0–100
  lastSessionWPMs:  number[]      // son 7 oturum için mini bar

  // ── Beceriler ──────────────────────────────────────────────────
  skills: SkillLevel[]

  // ── Haftalık ───────────────────────────────────────────────────
  weeklyStats: DayStat[]

  // ── Günlük Görev ───────────────────────────────────────────────
  dailyMission: {
    title:       string
    current:     number
    target:      number
    xpReward:    number
    levelTag:    string
    timeMinutes: number
  }

  // ── AI Koç ─────────────────────────────────────────────────────
  aiCoachSuggestion: string
  aiCoachDrill:      string
  aiCoachDrillRoute: string
  aiCoachXpReward:   number
  aiCoachDifficulty: string

  // ── Actions ────────────────────────────────────────────────────
  setWPM:         (wpm: number, delta: number) => void
  setFocusScore:  (score: number) => void
  setEyeStability:(val: number) => void
  setSkillValue:  (id: string, value: number) => void
  bumpMission:    () => void
}

export const useHomeStore = create<HomeState>((set) => ({
  // ── Mock Veriler ───────────────────────────────────────────────
  currentWPM:      320,
  deltaPercent:    12,
  focusScore:      87,
  eyeStability:    92,
  lastSessionWPMs: [285, 298, 310, 295, 308, 315, 320],

  skills: [
    {
      id:          'hiz',
      label:       'Hız',
      icon:        '⚡',
      value:       75,
      description: 'Dakikada okunan kelime sayısı. Göz saccade hareketleri ve subvocalization kırılmasıyla gelişir.',
      drillLabel:  'Hız Kontrolü',
      drillRoute:  '/exercise/speed_control',
    },
    {
      id:          'kavrama',
      label:       'Kavrama',
      icon:        '🧠',
      value:       68,
      description: 'Okunan metnin anlamını doğru şekilde edinme kapasitesi. Aktif okuma teknikleriyle güçlenir.',
      drillLabel:  'Derin Kavrama',
      drillRoute:  '/exercise/deep_comprehension',
    },
    {
      id:          'periferi',
      label:       'Periferik',
      icon:        '👁️',
      value:       55,
      description: 'Odak noktasının çevresindeki alanı görme genişliği. Geniş periferik görüş, kelime gruplarını tek bakışta almayı sağlar.',
      drillLabel:  'Göz Antrenmanı',
      drillRoute:  '/exercise/eye_training',
    },
    {
      id:          'sakkad',
      label:       'Sakkad',
      icon:        '🎯',
      value:       62,
      description: 'Gözün bir noktadan diğerine sıçrama hızı ve doğruluğu. Hızlı ve kesin saccade hareketleri okuma ritmini yükseltir.',
      drillLabel:  'Göz Antrenmanı',
      drillRoute:  '/exercise/eye_training',
    },
    {
      id:          'odak',
      label:       'Odak',
      icon:        '🌊',
      value:       80,
      description: 'Dikkat dağıtıcılara rağmen metne konsantre kalma süresi ve derinliği. Zihinsel dayanıklılıkla doğru orantılıdır.',
      drillLabel:  'Dikkat Gücü',
      drillRoute:  '/exercise/attention_power',
    },
  ],

  weeklyStats: [
    { label: 'Pzt', minutes: 25, wpm: 295, sessions: 2, isToday: false, trend: 'neutral'  },
    { label: 'Sal', minutes: 40, wpm: 308, sessions: 3, isToday: false, trend: 'up'       },
    { label: 'Çar', minutes: 15, wpm: 290, sessions: 1, isToday: false, trend: 'down'     },
    { label: 'Per', minutes: 55, wpm: 315, sessions: 4, isToday: false, trend: 'up'       },
    { label: 'Cum', minutes: 30, wpm: 310, sessions: 2, isToday: false, trend: 'neutral'  },
    { label: 'Cmt', minutes: 45, wpm: 318, sessions: 3, isToday: false, trend: 'up'       },
    { label: 'Paz', minutes: 20, wpm: 320, sessions: 1, isToday: true,  trend: 'up'       },
  ],

  dailyMission: {
    title:       'Günlük Hız Antrenmanı',
    current:     2,
    target:      3,
    xpReward:    150,
    levelTag:    'Lv.2',
    timeMinutes: 15,
  },

  aiCoachSuggestion:
    'Bugün sakkad hızın %8 düştü. Göz antrenmanı ile sakkad kontrolü geliştirmeyi öneririm.',
  aiCoachDrill:      'Göz Antrenmanı',
  aiCoachDrillRoute: '/exercise/eye_training',
  aiCoachXpReward:   75,
  aiCoachDifficulty: 'Lv.2',

  // ── Actions ───────────────────────────────────────────────────
  setWPM:         (wpm, delta) => set({ currentWPM: wpm, deltaPercent: delta }),
  setFocusScore:  (score) => set({ focusScore: score }),
  setEyeStability:(val)   => set({ eyeStability: val }),

  setSkillValue: (id, value) =>
    set((state) => ({
      skills: state.skills.map((s) => s.id === id ? { ...s, value } : s),
    })),

  bumpMission: () =>
    set((state) => ({
      dailyMission: {
        ...state.dailyMission,
        current: Math.min(state.dailyMission.current + 1, state.dailyMission.target),
      },
    })),
}))
