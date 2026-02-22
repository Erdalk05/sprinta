import AsyncStorage from '@react-native-async-storage/async-storage'

export type TopicId =
  | 'reading_speed'
  | 'comprehension'
  | 'attention'
  | 'visual_tracking'
  | 'focus_duration'

export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  topicId: TopicId
  text: string
  options: Option[]
  correctOptionId: string
  weight: number
  difficultyLevel: 1 | 2 | 3
}

export interface TopicPerformance {
  topicId: TopicId
  correct: boolean
  responseTimeMs: number
}

const HISTORY_KEY = 'sprinta_quiz_history'
const HISTORY_LIMIT = 10

const TOPICS: TopicId[] = [
  'reading_speed',
  'comprehension',
  'attention',
  'visual_tracking',
  'focus_duration',
]

// 15 soru havuzu (her konudan 3)
const QUESTION_POOL: Question[] = [
  // reading_speed
  {
    id: 'rs_1',
    topicId: 'reading_speed',
    text: 'Bir sayfayı ortalama ne kadar sürede okursun?',
    options: [
      { id: 'a', text: '5 dakikadan fazla' },
      { id: 'b', text: '3-5 dakika' },
      { id: 'c', text: '1-3 dakika' },
      { id: 'd', text: '1 dakikadan az' },
    ],
    correctOptionId: 'c',
    weight: 1,
    difficultyLevel: 1,
  },
  {
    id: 'rs_2',
    topicId: 'reading_speed',
    text: 'Hızlı okurken anladıklarını kontrol eder misin?',
    options: [
      { id: 'a', text: 'Hiçbir zaman' },
      { id: 'b', text: 'Nadiren' },
      { id: 'c', text: 'Bazen' },
      { id: 'd', text: 'Her zaman' },
    ],
    correctOptionId: 'd',
    weight: 2,
    difficultyLevel: 2,
  },
  {
    id: 'rs_3',
    topicId: 'reading_speed',
    text: 'Sesli okuma hızın ve sessiz okuma hızın arasındaki fark nedir?',
    options: [
      { id: 'a', text: 'Sessiz okuma çok daha hızlı' },
      { id: 'b', text: 'Neredeyse aynı' },
      { id: 'c', text: 'Sesli okuma daha hızlı' },
      { id: 'd', text: 'Fark etmez' },
    ],
    correctOptionId: 'a',
    weight: 3,
    difficultyLevel: 3,
  },
  // comprehension
  {
    id: 'co_1',
    topicId: 'comprehension',
    text: 'Bir metin okuduktan sonra ne kadarını hatırlarsın?',
    options: [
      { id: 'a', text: 'Çok az (%20 altı)' },
      { id: 'b', text: 'Yarısından azını' },
      { id: 'c', text: 'Yarısından fazlasını' },
      { id: 'd', text: 'Neredeyse tamamını' },
    ],
    correctOptionId: 'c',
    weight: 1,
    difficultyLevel: 1,
  },
  {
    id: 'co_2',
    topicId: 'comprehension',
    text: 'Okuduğun metni kendi cümlelerinle başkasına anlatabilir misin?',
    options: [
      { id: 'a', text: 'Hayır, zorlanırım' },
      { id: 'b', text: 'Biraz anlatabilirim' },
      { id: 'c', text: 'Genellikle anlatabilirim' },
      { id: 'd', text: 'Kolaylıkla anlatabilirim' },
    ],
    correctOptionId: 'd',
    weight: 2,
    difficultyLevel: 2,
  },
  {
    id: 'co_3',
    topicId: 'comprehension',
    text: 'Bir paragrafın ana fikrini bulmak ne kadar sürüyor?',
    options: [
      { id: 'a', text: 'Çok uzun sürüyor' },
      { id: 'b', text: 'Birkaç kez okumam gerekiyor' },
      { id: 'c', text: 'İkinci okumada buluyorum' },
      { id: 'd', text: 'İlk okumada buluyorum' },
    ],
    correctOptionId: 'd',
    weight: 3,
    difficultyLevel: 3,
  },
  // attention
  {
    id: 'at_1',
    topicId: 'attention',
    text: 'Okurken dikkatinin dağılması ne sıklıkla olur?',
    options: [
      { id: 'a', text: 'Sürekli' },
      { id: 'b', text: 'Sık sık' },
      { id: 'c', text: 'Ara sıra' },
      { id: 'd', text: 'Çok nadir' },
    ],
    correctOptionId: 'd',
    weight: 1,
    difficultyLevel: 1,
  },
  {
    id: 'at_2',
    topicId: 'attention',
    text: 'Kaç dakika kesintisiz odaklanabilirsin?',
    options: [
      { id: 'a', text: '5 dakikadan az' },
      { id: 'b', text: '5-15 dakika' },
      { id: 'c', text: '15-30 dakika' },
      { id: 'd', text: '30 dakikadan fazla' },
    ],
    correctOptionId: 'c',
    weight: 2,
    difficultyLevel: 2,
  },
  {
    id: 'at_3',
    topicId: 'attention',
    text: 'Zor bir konuda konsantrasyonunu korumak için ne yaparsın?',
    options: [
      { id: 'a', text: 'Hiçbir şey yapamam, bırakırım' },
      { id: 'b', text: 'Mola veririm ama devam edemem' },
      { id: 'c', text: 'Mola vererek devam ederim' },
      { id: 'd', text: 'Teknik kullanarak odaklanırım' },
    ],
    correctOptionId: 'd',
    weight: 3,
    difficultyLevel: 3,
  },
  // visual_tracking
  {
    id: 'vt_1',
    topicId: 'visual_tracking',
    text: 'Okurken gözlerin satırı nasıl takip eder?',
    options: [
      { id: 'a', text: 'Sık sık kayıyor, yer kaybediyorum' },
      { id: 'b', text: 'Bazen kayıyor' },
      { id: 'c', text: 'Nadiren kayıyor' },
      { id: 'd', text: 'Kolayca takip ediyorum' },
    ],
    correctOptionId: 'd',
    weight: 1,
    difficultyLevel: 1,
  },
  {
    id: 'vt_2',
    topicId: 'visual_tracking',
    text: 'Bir sayfadaki grafik veya tabloyu ne kadar hızlı yorumlarsın?',
    options: [
      { id: 'a', text: 'Çok uzun sürer' },
      { id: 'b', text: 'Biraz uzun sürer' },
      { id: 'c', text: 'Ortalama sürede' },
      { id: 'd', text: 'Çok hızlı yorumlarım' },
    ],
    correctOptionId: 'd',
    weight: 2,
    difficultyLevel: 2,
  },
  {
    id: 'vt_3',
    topicId: 'visual_tracking',
    text: 'Okurken aynı satırı tekrar okuma sıklığın nedir?',
    options: [
      { id: 'a', text: 'Her satırda birkaç kez' },
      { id: 'b', text: 'Sık sık' },
      { id: 'c', text: 'Nadiren' },
      { id: 'd', text: 'Neredeyse hiç' },
    ],
    correctOptionId: 'd',
    weight: 3,
    difficultyLevel: 3,
  },
  // focus_duration
  {
    id: 'fd_1',
    topicId: 'focus_duration',
    text: 'Günde kaç saat verimli çalışabilirsin?',
    options: [
      { id: 'a', text: '1 saatten az' },
      { id: 'b', text: '1-2 saat' },
      { id: 'c', text: '2-4 saat' },
      { id: 'd', text: '4 saatten fazla' },
    ],
    correctOptionId: 'c',
    weight: 1,
    difficultyLevel: 1,
  },
  {
    id: 'fd_2',
    topicId: 'focus_duration',
    text: 'Yorulduğunda odaklanmak için ne yaparsın?',
    options: [
      { id: 'a', text: 'Çalışmayı bırakırım' },
      { id: 'b', text: 'Sosyal medyaya geçerim' },
      { id: 'c', text: 'Kısa mola veririm' },
      { id: 'd', text: 'Konuyu değiştiririm' },
    ],
    correctOptionId: 'c',
    weight: 2,
    difficultyLevel: 2,
  },
  {
    id: 'fd_3',
    topicId: 'focus_duration',
    text: 'Sabah mı yoksa akşam mı daha verimli çalışırsın?',
    options: [
      { id: 'a', text: 'Sabah erken' },
      { id: 'b', text: 'Öğleden sonra' },
      { id: 'c', text: 'Akşam' },
      { id: 'd', text: 'Gece geç saatler' },
    ],
    correctOptionId: 'a',
    weight: 3,
    difficultyLevel: 3,
  },
]

async function getQuizHistory(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

async function saveQuizHistory(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(ids.slice(-HISTORY_LIMIT)))
  } catch {
    // ignore
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function shuffleOptions(q: Question): Question {
  return { ...q, options: shuffle(q.options) }
}

export async function generateQuiz(): Promise<Question[]> {
  const history = await getQuizHistory()

  // Her konudan 1 soru seç, history'de olmayanları önceliklendir
  const shuffledTopics = shuffle([...TOPICS]).slice(0, 3)

  const selected: Question[] = shuffledTopics.map((topicId) => {
    const pool = QUESTION_POOL.filter((q) => q.topicId === topicId)
    const fresh = pool.filter((q) => !history.includes(q.id))
    const candidates = fresh.length > 0 ? fresh : pool
    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    return shuffleOptions(picked)
  })

  // Geçmişe ekle
  const newHistory = [...history, ...selected.map((q) => q.id)]
  await saveQuizHistory(newHistory)

  return selected
}

export function recordPerformance(_p: TopicPerformance): void {
  // İleride adaptif ağırlık için kullanılacak
}
