import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
