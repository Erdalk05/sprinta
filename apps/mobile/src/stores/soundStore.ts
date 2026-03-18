import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from './mmkvStorage'

interface SoundStore {
  isMuted: boolean
  toggleMute: () => void
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set) => ({
      isMuted: false,
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
    }),
    {
      name: 'sprinta-sound-settings',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
)
