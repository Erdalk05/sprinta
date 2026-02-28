// Sprinta — WhatsApp Renk Sistemi
// Tek şema: WhatsApp kimliği, güven, tanıdıklık, yeşil

export interface ColorScheme {
  id: string
  name: string
  emoji: string
  tagline: string
  primary: string
  secondary: string
  heroGrad: readonly [string, string]
  heroGradLight: readonly [string, string]
  glow: string
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id:            'whatsapp',
    name:          'WhatsApp',
    emoji:         '💬',
    tagline:       'Güven · Bağlantı · Akış',
    primary:       '#25D366',
    secondary:     '#128C7E',
    heroGrad:      ['#0B141A', '#075E54'],
    heroGradLight: ['#075E54', '#25D366'],
    glow:          '#25D366',
  },
]

export const DEFAULT_SCHEME_ID = 'whatsapp'

export function getScheme(_id?: string): ColorScheme {
  return COLOR_SCHEMES[0]
}
