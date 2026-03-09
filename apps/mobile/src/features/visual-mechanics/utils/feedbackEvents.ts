/**
 * Hafif event bus — ses hook'undan ExerciseProgressBar'a
 * hit / miss / combo olaylarını iletir (Zustand'sız, sıfır overhead)
 */
export type FeedbackEvent = 'hit' | 'miss' | 'combo'

type Handler = (event: FeedbackEvent, combo: number) => void

let _handler: Handler | null = null

export const feedbackEvents = {
  on:   (h: Handler)  => { _handler = h },
  off:  ()            => { _handler = null },
  emit: (e: FeedbackEvent, combo: number) => _handler?.(e, combo),
}
