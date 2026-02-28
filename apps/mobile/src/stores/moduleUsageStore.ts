/**
 * moduleUsageStore — Modül Kullanım Sayacı
 * Her startSession'da increment edilir → RadialFab top-6 dinamik seçer
 * MMKV'ye persist edilir (uygulama kapanınca kaybolmaz)
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from './mmkvStorage'
import { MODULE_CONFIGS } from '../constants/modules'

// ─── Egzersiz modülleri (route bilgisi burada; MODULE_CONFIGS'ten icon/label alınır)
export interface ExerciseModule {
  code:       string
  icon:       string
  label:      string
  shortLabel: string   // RadialFab label (≤8 karakter)
  route:      string
}

const EXERCISE_MODULES: ExerciseModule[] = [
  { code: 'speed_control',     shortLabel: 'Hız',     route: '/exercise/speed_control'     },
  { code: 'chunk_rsvp',        shortLabel: 'RSVP',    route: '/exercise/chunk-rsvp'        },
  { code: 'flow_reading',      shortLabel: 'Akış',    route: '/exercise/flow-reading'      },
  { code: 'deep_comprehension',shortLabel: 'Kavrama', route: '/exercise/deep_comprehension' },
  { code: 'attention_power',   shortLabel: 'Dikkat',  route: '/exercise/attention_power'   },
  { code: 'mental_reset',      shortLabel: 'Reset',   route: '/exercise/mental_reset'      },
  { code: 'eye_training',      shortLabel: 'Göz',     route: '/exercise/eye_training'      },
  { code: 'vocabulary',        shortLabel: 'Kelime',  route: '/exercise/vocabulary'        },
].map((m) => ({
  ...m,
  icon:  MODULE_CONFIGS[m.code]?.icon  ?? '⚡',
  label: MODULE_CONFIGS[m.code]?.label ?? m.code,
}))

// Kullanım verisi yokken gösterilecek varsayılan top-6 sırası
const DEFAULT_ORDER = [
  'speed_control', 'chunk_rsvp', 'eye_training',
  'attention_power', 'flow_reading', 'deep_comprehension',
]

// ─── Store ────────────────────────────────────────────────────────
interface ModuleUsageState {
  counts: Record<string, number>        // moduleCode → toplam kullanım
  increment: (code: string) => void
  getTopN: (n: number) => ExerciseModule[]
}

export const useModuleUsageStore = create<ModuleUsageState>()(
  persist(
    (set, get) => ({
      counts: {},

      increment: (code) => {
        set((s) => ({
          counts: { ...s.counts, [code]: (s.counts[code] ?? 0) + 1 },
        }))
      },

      getTopN: (n) => {
        const { counts } = get()
        return EXERCISE_MODULES
          .slice()
          .sort((a, b) => {
            const diff = (counts[b.code] ?? 0) - (counts[a.code] ?? 0)
            if (diff !== 0) return diff
            // Beraberlik → varsayılan öncelik sırasına göre
            const ai = DEFAULT_ORDER.indexOf(a.code)
            const bi = DEFAULT_ORDER.indexOf(b.code)
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
          })
          .slice(0, n)
      },
    }),
    {
      name: 'module-usage-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
)
