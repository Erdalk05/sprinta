/**
 * leaderboardStore — Günlük Sıralama
 * Mock veriler · todayWPM'e göre sıralı
 */
import { create } from 'zustand'

export interface LeaderboardUser {
  id:            string
  name:          string
  initials:      string   // avatar dairesi için
  todayWPM:      number
  deltaRank:     number   // + yukarı, 0 stabil, - aşağı
  isCurrentUser: boolean
}

interface LeaderboardState {
  users:           LeaderboardUser[]  // todayWPM desc sıralı
  currentUserRank: number             // 1-based
  deltaRank:       number             // günün toplam sıra değişimi
}

export const useLeaderboardStore = create<LeaderboardState>(() => ({
  users: [
    { id: '1', name: 'Ahmet K.',   initials: 'AK', todayWPM: 418, deltaRank:  3, isCurrentUser: false },
    { id: '2', name: 'Zeynep T.',  initials: 'ZT', todayWPM: 405, deltaRank:  1, isCurrentUser: false },
    { id: '3', name: 'Mehmet Y.',  initials: 'MY', todayWPM: 392, deltaRank:  0, isCurrentUser: false },
    { id: '4', name: 'Sen',        initials: '⚡', todayWPM: 320, deltaRank:  2, isCurrentUser: true  },
    { id: '5', name: 'Fatma S.',   initials: 'FS', todayWPM: 298, deltaRank: -1, isCurrentUser: false },
    { id: '6', name: 'Kemal D.',   initials: 'KD', todayWPM: 275, deltaRank:  0, isCurrentUser: false },
    { id: '7', name: 'Selin A.',   initials: 'SA', todayWPM: 260, deltaRank: -2, isCurrentUser: false },
    { id: '8', name: 'Can B.',     initials: 'CB', todayWPM: 244, deltaRank:  1, isCurrentUser: false },
  ],
  currentUserRank: 4,
  deltaRank:       2,   // bugün 2 sıra çıktı → bounce göster
}))
