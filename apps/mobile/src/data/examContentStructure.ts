/**
 * EXAM_STRUCTURE — DB'deki text_library.exam_type ve category değerleriyle birebir eşleşir.
 * Kaynak: SELECT DISTINCT exam_type, category FROM text_library ORDER BY exam_type, category
 */
import type { ExamCategory } from '../types/reading'

export const EXAM_STRUCTURE: ExamCategory[] = [
  {
    key:   'LGS',
    label: 'LGS',
    icon:  '📚',
    color: '#059669',
    lessons: [
      { category: 'Türkçe',         label: 'Türkçe',         icon: '📖' },
      { category: 'Matematik',      label: 'Matematik',      icon: '🔢' },
      { category: 'Fen Bilimleri',  label: 'Fen Bilimleri',  icon: '🔬' },
      { category: 'Sosyal Bilgiler',label: 'Sosyal Bilgiler',icon: '🌍' },
      { category: 'İngilizce',      label: 'İngilizce',      icon: '🌐' },
      { category: 'Tarih',          label: 'Tarih',          icon: '📜' },
      { category: 'Vatandaşlık',    label: 'Vatandaşlık',    icon: '🏛️' },
    ],
  },
  {
    key:   'TYT',
    label: 'TYT',
    icon:  '🎯',
    color: '#0891B2',
    lessons: [
      { category: 'Edebiyat',      label: 'Edebiyat',      icon: '✍️' },
      { category: 'Biyoloji',      label: 'Biyoloji',      icon: '🧬' },
      { category: 'Fizik',         label: 'Fizik',         icon: '⚗️' },
      { category: 'Kimya',         label: 'Kimya',         icon: '🧪' },
      { category: 'TYT Matematik', label: 'Matematik',     icon: '🔢' },
      { category: 'TYT Tarih',     label: 'Tarih',         icon: '📜' },
      { category: 'TYT Coğrafya',  label: 'Coğrafya',      icon: '🗺️' },
      { category: 'TYT Felsefe',   label: 'Felsefe',       icon: '💭' },
      { category: 'TYT Psikoloji', label: 'Psikoloji',     icon: '🧠' },
      { category: 'TYT Sosyoloji', label: 'Sosyoloji',     icon: '👥' },
    ],
  },
  {
    key:   'AYT',
    label: 'AYT',
    icon:  '🏆',
    color: '#D97706',
    lessons: [
      { category: 'AYT Edebiyat', label: 'Edebiyat', icon: '✍️' },
      { category: 'AYT Tarih',    label: 'Tarih',    icon: '📜' },
      { category: 'AYT Cografya', label: 'Coğrafya', icon: '🗺️' },
      { category: 'AYT Felsefe',  label: 'Felsefe',  icon: '💭' },
      { category: 'AYT Psikoloji',label: 'Psikoloji',icon: '🧠' },
    ],
  },
  {
    key:   'YDS',
    label: 'YDS / YÖKDİL',
    icon:  '🌐',
    color: '#7C3AED',
    lessons: [
      { category: 'YDS Okuma', label: 'Okuma Parçaları', icon: '📖' },
    ],
  },
  {
    key:   'ALES',
    label: 'ALES',
    icon:  '📊',
    color: '#DC2626',
    lessons: [
      { category: 'Akademik',       label: 'Akademik',       icon: '📚' },
      { category: 'Ekonomi',        label: 'Ekonomi',        icon: '💰' },
      { category: 'Felsefe',        label: 'Felsefe',        icon: '💭' },
      { category: 'Psikoloji',      label: 'Psikoloji',      icon: '🧠' },
      { category: 'Sosyoloji',      label: 'Sosyoloji',      icon: '👥' },
      { category: 'Teknoloji',      label: 'Teknoloji',      icon: '💻' },
      { category: 'Nörobilim',      label: 'Nörobilim',      icon: '🔬' },
      { category: 'Dilbilim',       label: 'Dilbilim',       icon: '🗣️' },
      { category: 'İstatistik',     label: 'İstatistik',     icon: '📈' },
      { category: 'Çevre Bilimleri',label: 'Çevre Bilimleri',icon: '🌿' },
    ],
  },
  {
    key:   'KPSS',
    label: 'KPSS',
    icon:  '🏛️',
    color: '#0369A1',
    lessons: [
      { category: 'Tarih',        label: 'Tarih',        icon: '📜' },
      { category: 'Coğrafya',     label: 'Coğrafya',     icon: '🗺️' },
      { category: 'Ekonomi',      label: 'Ekonomi',      icon: '💰' },
      { category: 'Hukuk',        label: 'Hukuk',        icon: '⚖️' },
      { category: 'Siyasi Tarih', label: 'Siyasi Tarih', icon: '🏛️' },
      { category: 'Türk İnkılabı',label: 'Türk İnkılabı',icon: '🇹🇷' },
      { category: 'Dış Politika', label: 'Dış Politika', icon: '🌍' },
    ],
  },
  {
    key:   'General',
    label: 'Genel',
    icon:  '🌟',
    color: '#4338CA',
    lessons: [
      { category: 'Bilim',     label: 'Bilim',     icon: '🔭' },
      { category: 'Çevre',     label: 'Çevre',     icon: '🌿' },
      { category: 'Dilbilim',  label: 'Dilbilim',  icon: '🗣️' },
      { category: 'Doğa',      label: 'Doğa',      icon: '🌳' },
      { category: 'Kültür',    label: 'Kültür',    icon: '🎭' },
      { category: 'Sağlık',    label: 'Sağlık',    icon: '💊' },
      { category: 'Teknoloji', label: 'Teknoloji', icon: '💻' },
    ],
  },
]
