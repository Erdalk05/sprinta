/**
 * subjectContent.ts
 * Tüm konu bazlı okuma makalelerini SUBJECT_ARTICLES haritasında birleştirir.
 * Yeni içerik eklemek için ilgili subject array'ine makale ekleyin.
 */
import type { SampleExercise } from './sampleContent'
import { ARTICLES_BY_SUBJECT } from './readingContent'

// ─── Teknoloji makaleleri ─────────────────────────────────────
const TEKNOLOJI_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — teknoloji-01 … teknoloji-10
]

// ─── Bilim makaleleri ─────────────────────────────────────────
const BILIM_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — bilim-01 … bilim-10
]

// ─── Felsefe makaleleri ───────────────────────────────────────
const FELSEFE_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — felsefe-01 … felsefe-10
]

// ─── Tarih makaleleri ─────────────────────────────────────────
const TARIH_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — tarih-01 … tarih-10
]

// ─── Psikoloji makaleleri ─────────────────────────────────────
const PSIKOLOJI_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — psikoloji-01 … psikoloji-10
]

// ─── Coğrafya (genişletilmiş) ─────────────────────────────────
const COGRAFYA_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — cografya-02 … cografya-10
]

// ─── Edebiyat (genişletilmiş) ─────────────────────────────────
const EDEBIYAT_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — edebiyat-02 … edebiyat-10
]

// ─── Sosyal Bilgiler (genişletilmiş) ──────────────────────────
const SOSYAL_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — sosyal-02 … sosyal-10
]

// ─── Fen Bilimleri (genişletilmiş) ────────────────────────────
const FEN_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — fen-02 … fen-10
]

// ─── Sağlık (genişletilmiş) ───────────────────────────────────
const SAGLIK_ARTICLES: SampleExercise[] = [
  // Agent tarafından doldurulacak — saglik-02 … saglik-10
]

/**
 * SUBJECT_ARTICLES
 * Her konu kodu → makale listesi (10 makale hedefi)
 * Makale sayısı 0 ise sampleContent.ts'deki tekli makale kullanılır (fallback)
 */
export const SUBJECT_ARTICLES: Record<string, SampleExercise[]> = {
  turkce:    ARTICLES_BY_SUBJECT['turkce']    ?? [],
  ingilizce: ARTICLES_BY_SUBJECT['ingilizce'] ?? [],
  teknoloji: TEKNOLOJI_ARTICLES,
  bilim:     BILIM_ARTICLES,
  felsefe:   FELSEFE_ARTICLES,
  tarih:     TARIH_ARTICLES,
  psikoloji: PSIKOLOJI_ARTICLES,
  cografya:  COGRAFYA_ARTICLES,
  edebiyat:  EDEBIYAT_ARTICLES,
  sosyal:    SOSYAL_ARTICLES,
  fen:       FEN_ARTICLES,
  saglik:    SAGLIK_ARTICLES,
}

/** Belirli bir konu için makale sayısını döndürür */
export function getArticleCount(moduleCode: string): number {
  return SUBJECT_ARTICLES[moduleCode]?.length ?? 0
}

/** Makale listesi — yoksa boş dizi */
export function getArticles(moduleCode: string): SampleExercise[] {
  return SUBJECT_ARTICLES[moduleCode] ?? []
}
