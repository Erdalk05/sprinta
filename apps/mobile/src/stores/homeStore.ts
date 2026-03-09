/**
 * homeStore — SPRINTA v4 Ana Sayfa State
 * Gerçek Supabase verisi: daily_stats + cognitive_profiles + eye_training_sessions
 */
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface SkillLevel {
  id:          string
  label:       string
  icon:        string
  value:       number     // 0–100
  description: string
  drillLabel:  string
  drillRoute:  string
}

export interface DayStat {
  label:    string
  minutes:  number
  wpm:      number
  sessions: number
  isToday:  boolean
  trend:    'up' | 'neutral' | 'down'
}

// Statik skill metadata (label/icon/description değişmez)
const SKILL_META: Omit<SkillLevel, 'value'>[] = [
  {
    id: 'hiz', label: 'Hız', icon: '⚡',
    description: 'Dakikada okunan kelime sayısı. Göz saccade hareketleri ve subvocalization kırılmasıyla gelişir.',
    drillLabel: 'Hız Kontrolü', drillRoute: '/exercise/speed_control',
  },
  {
    id: 'kavrama', label: 'Kavrama', icon: '🧠',
    description: 'Okunan metnin anlamını doğru şekilde edinme kapasitesi. Aktif okuma teknikleriyle güçlenir.',
    drillLabel: 'Derin Kavrama', drillRoute: '/exercise/deep_comprehension',
  },
  {
    id: 'periferi', label: 'Geniş Görüş (Periferik)', icon: '👁️',
    description: 'Odak noktasının çevresindeki alanı görme genişliği. Geniş periferik görüş, kelime gruplarını tek bakışta almayı sağlar.',
    drillLabel: 'Göz Antrenmanı', drillRoute: '/exercise/eye_training',
  },
  {
    id: 'sakkad', label: 'Göz Hareketi (Sakkad)', icon: '🎯',
    description: 'Gözün bir noktadan diğerine sıçrama hızı ve doğruluğu.',
    drillLabel: 'Göz Antrenmanı', drillRoute: '/exercise/eye_training',
  },
  {
    id: 'odak', label: 'Odak', icon: '🌊',
    description: 'Dikkat dağıtıcılara rağmen metne konsantre kalma süresi ve derinliği.',
    drillLabel: 'Dikkat Gücü', drillRoute: '/exercise/attention_power',
  },
]

const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

const MODULE_LABELS: Record<string, string> = {
  speed_control:      'Hız Kontrolü',
  deep_comprehension: 'Derin Kavrama',
  attention_power:    'Dikkat Gücü',
  eye_training:       'Göz Antrenmanı',
  mental_reset:       'Zihin Sıfırlama',
}

interface HomeState {
  // ── Performans ──────────────────────────────────────────────────
  currentWPM:      number
  deltaPercent:    number
  focusScore:      number
  eyeStability:    number
  lastSessionWPMs: number[]

  // ── Beceriler ────────────────────────────────────────────────────
  skills: SkillLevel[]

  // ── Haftalık ─────────────────────────────────────────────────────
  weeklyStats: DayStat[]

  // ── Günlük Görev ─────────────────────────────────────────────────
  dailyMission: {
    title:       string
    current:     number
    target:      number
    xpReward:    number
    levelTag:    string
    timeMinutes: number
  }

  // ── AI Koç ───────────────────────────────────────────────────────
  aiCoachSuggestion: string
  aiCoachDrill:      string
  aiCoachDrillRoute: string
  aiCoachXpReward:   number
  aiCoachDifficulty: string

  // ── Loading ──────────────────────────────────────────────────────
  isLoading: boolean

  // ── Actions ──────────────────────────────────────────────────────
  fetchHomeData:  (studentId: string) => Promise<void>
  setWPM:         (wpm: number, delta: number) => void
  setFocusScore:  (score: number) => void
  setEyeStability:(val: number) => void
  setSkillValue:  (id: string, value: number) => void
  bumpMission:    () => void
}

// Varsayılan değerler (fetch öncesi gösterilir)
const DEFAULT_SKILLS: SkillLevel[] = SKILL_META.map(m => ({ ...m, value: 0 }))

export const useHomeStore = create<HomeState>((set, get) => ({
  currentWPM:      0,
  deltaPercent:    0,
  focusScore:      0,
  eyeStability:    0,
  lastSessionWPMs: [],
  skills:          DEFAULT_SKILLS,

  weeklyStats: DAY_LABELS.map((label, i) => ({
    label, minutes: 0, wpm: 0, sessions: 0,
    isToday: new Date().getDay() === i,
    trend: 'neutral' as const,
  })),

  dailyMission: {
    title: 'Günlük Antrenman', current: 0, target: 3,
    xpReward: 150, levelTag: 'Lv.1', timeMinutes: 15,
  },

  aiCoachSuggestion: 'Bugün bir egzersiz tamamla ve AI Koç önerini al.',
  aiCoachDrill:      'Göz Antrenmanı',
  aiCoachDrillRoute: '/exercise/eye_training',
  aiCoachXpReward:   75,
  aiCoachDifficulty: 'Lv.1',

  isLoading: false,

  // ── Gerçek Supabase fetch ────────────────────────────────────────
  fetchHomeData: async (studentId: string) => {
    set({ isLoading: true })
    try {
      const today = new Date()
      const since = new Date(today)
      since.setDate(today.getDate() - 6)
      const sinceStr = since.toISOString().split('T')[0]

      // 1️⃣  Son 7 gün daily_stats
      const { data: statsRows } = await supabase
        .from('daily_stats')
        .select('date, avg_wpm, total_minutes, sessions_count, xp_earned, avg_arp')
        .eq('student_id', studentId)
        .gte('date', sinceStr)
        .order('date', { ascending: true })

      // 2️⃣  cognitive_profiles
      const { data: profile } = await supabase
        .from('cognitive_profiles')
        .select('sustainable_wpm, speed_skill, comprehension_skill, attention_skill, fatigue_resistance, primary_weakness, session_count, stability_index')
        .eq('student_id', studentId)
        .maybeSingle()

      // 3️⃣  Göz antrenmanı kategorik skorlar (son 30 gün)
      const { data: eyeRows } = await supabase
        .from('eye_training_sessions')
        .select('category, visual_attention_score')
        .eq('student_id', studentId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      // ── weekly stats ───────────────────────────────────────────
      type StatRow = { date: string; avg_wpm: number; total_minutes: number; sessions_count: number; xp_earned: number; avg_arp: number }
      const statsMap: Record<string, StatRow> = {}
      statsRows?.forEach((r: StatRow) => { statsMap[r.date] = r })

      const weeklyStats: DayStat[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(since)
        d.setDate(since.getDate() + i)
        const key = d.toISOString().split('T')[0]
        const row = statsMap[key]
        const dayLabel = DAY_LABELS[d.getDay()]
        const isToday = key === today.toISOString().split('T')[0]
        return {
          label:    dayLabel,
          minutes:  row?.total_minutes  ?? 0,
          wpm:      row?.avg_wpm        ?? 0,
          sessions: row?.sessions_count ?? 0,
          isToday,
          trend:    'neutral' as const,
        }
      })

      // trend hesapla
      for (let i = 1; i < weeklyStats.length; i++) {
        const prev = weeklyStats[i - 1].wpm
        const curr = weeklyStats[i].wpm
        weeklyStats[i].trend = curr > prev ? 'up' : curr < prev ? 'down' : 'neutral'
      }

      // ── WPM ─────────────────────────────────────────────────────
      const wpmArr = weeklyStats.map(d => d.wpm).filter(w => w > 0)
      const currentWPM = profile?.sustainable_wpm
        ?? (wpmArr.length ? wpmArr[wpmArr.length - 1] : 0)

      let deltaPercent = 0
      if (wpmArr.length >= 2) {
        const prev = wpmArr[wpmArr.length - 2]
        const curr = wpmArr[wpmArr.length - 1]
        if (prev > 0) deltaPercent = Math.round(((curr - prev) / prev) * 100)
      }

      // ── Göz kategorik ortalama ───────────────────────────────────
      const catAvg = (cat: string) => {
        const rows = eyeRows?.filter(r => r.category === cat) ?? []
        if (!rows.length) return 0
        return Math.round(rows.reduce((s, r) => s + Number(r.visual_attention_score), 0) / rows.length)
      }
      const periScore  = catAvg('peripheral')
      const saccScore  = catAvg('saccadic')
      const eyeStab    = profile?.stability_index
        ? Math.round(Number(profile.stability_index) * 100)
        : Math.round((periScore + saccScore) / 2)

      // ── Skills ──────────────────────────────────────────────────
      const skillValues: Record<string, number> = {
        hiz:      profile?.speed_skill         ?? 0,
        kavrama:  profile?.comprehension_skill ?? 0,
        periferi: periScore,
        sakkad:   saccScore,
        odak:     profile?.attention_skill     ?? 0,
      }
      const skills: SkillLevel[] = SKILL_META.map(m => ({
        ...m, value: skillValues[m.id] ?? 0,
      }))

      // ── Bugünün seans sayısı → günlük görev ─────────────────────
      const todayKey = today.toISOString().split('T')[0]
      const todayStats = statsMap[todayKey]
      const sessionsDone = todayStats?.sessions_count ?? 0
      const xpToday = todayStats?.xp_earned ?? 0

      // ── AI Koç — cognitive_profiles.primary_weakness'e göre ─────
      const weakness = profile?.primary_weakness as string | null
      const drillLabel = weakness ? (MODULE_LABELS[weakness] ?? 'Göz Antrenmanı') : 'Göz Antrenmanı'
      const drillRoute = weakness === 'speed_control'      ? '/exercise/speed_control'
                       : weakness === 'deep_comprehension' ? '/exercise/deep_comprehension'
                       : weakness === 'attention_power'    ? '/exercise/attention_power'
                       : '/exercise/eye_training'
      const aiSuggestion = weakness
        ? `${drillLabel} alanında gelişim fırsatın var. Bugün bu egzersizi tamamlayarak ARP'ını yükseltebilirsin.`
        : 'Tüm alanlarda dengeli ilerliyorsun. Bugün hız antrenmanıyla WPM puanını artır.'

      set({
        currentWPM,
        deltaPercent,
        focusScore:      profile?.attention_skill   ?? 0,
        eyeStability:    eyeStab,
        lastSessionWPMs: wpmArr.slice(-7),
        skills,
        weeklyStats,
        dailyMission: {
          title:       'Günlük Antrenman',
          current:     Math.min(sessionsDone, 3),
          target:      3,
          xpReward:    Math.max(150 - xpToday, 0),
          levelTag:    `Lv.${profile?.session_count ? Math.ceil(profile.session_count / 10) : 1}`,
          timeMinutes: 15,
        },
        aiCoachSuggestion: aiSuggestion,
        aiCoachDrill:      drillLabel,
        aiCoachDrillRoute: drillRoute,
        aiCoachXpReward:   75,
        aiCoachDifficulty: `Lv.${Math.max(1, Math.round((profile?.speed_skill ?? 10) / 20))}`,
        isLoading: false,
      })
    } catch (e) {
      console.error('homeStore.fetchHomeData hatası:', e)
      set({ isLoading: false })
    }
  },

  // ── Anında güncelleme (egzersiz bitince çağrılır) ───────────────
  setWPM:          (wpm, delta) => set({ currentWPM: wpm, deltaPercent: delta }),
  setFocusScore:   (score)     => set({ focusScore: score }),
  setEyeStability: (val)       => set({ eyeStability: val }),

  setSkillValue: (id, value) =>
    set(state => ({
      skills: state.skills.map(s => s.id === id ? { ...s, value } : s),
    })),

  bumpMission: () =>
    set(state => ({
      dailyMission: {
        ...state.dailyMission,
        current: Math.min(state.dailyMission.current + 1, state.dailyMission.target),
      },
    })),
}))
