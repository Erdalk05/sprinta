// Temel tipler

export type Role = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STUDENT'

// ExamType — DB'deki enum değerleri (küçük harf)
export type ExamType = 'lgs' | 'tyt' | 'ayt' | 'kpss' | 'ales' | 'yds' | 'other'

export interface CognitiveMetrics {
  sustainableWpm: number
  comprehension: number  // 0-100
  errorRate: number      // 0-1
  regressionRate: number // 0-1
  fatigueIndex: number   // 0-1
}

export interface ARPScores {
  rei: number
  csf: number
  arp: number
}
