// Sprinta — Çift Tema Sistemi (Gündüz / Gece)

// ─── Renk Paletleri ──────────────────────────────────────────────

const lightPalette = {
  // WhatsApp Açık Tema
  primary:      '#25D366',   // Butonlar, başarı
  primaryDark:  '#128C7E',   // Linkler, ARP vurgusu
  panelBg:      '#075E54',   // Header / navbar arka plan
  background:   '#ECE5DD',   // Ana ekran arka planı
  surface:      '#FFFFFF',   // Kart arka planları
  msgGray:      '#F0F0F0',   // Mesaj gri
  bubbleOut:    '#DCF8C6',   // Giden mesaj (açık yeşil)
  bubbleIn:     '#FFFFFF',   // Gelen mesaj
  text:         '#111111',   // Ana metin
  textSub:      '#667781',   // İkincil metin
  textHint:     '#8696A0',   // İpucu / placeholder
  iconGray:     '#8696A0',   // Devre dışı ikon
  border:       'rgba(0,0,0,0.10)',
  divider:      'rgba(0,0,0,0.08)',
  // Semantic
  success:      '#25D366',
  warning:      '#F59E0B',
  error:        '#EF4444',
  info:         '#3B82F6',
  // Modüller
  speed:        '#6C3EE8',
  comprehension:'#128C7E',
  attention:    '#F59E0B',
  reset:        '#3B82F6',
}

const darkPalette = {
  // WhatsApp Koyu Tema (eski renkler)
  primary:      '#00A884',   // Butonlar, başarı
  primaryDark:  '#25D366',   // Linkler, ARP vurgusu
  panelBg:      '#202C33',   // Header / navbar arka plan
  background:   '#0B141A',   // Ana ekran arka planı
  surface:      '#1F2C34',   // Kart arka planları
  msgGray:      '#1F2C34',   // Mesaj gri
  bubbleOut:    '#005C4B',   // Giden mesaj (koyu yeşil)
  bubbleIn:     '#1F2C34',   // Gelen mesaj
  text:         '#E9EDEF',   // Ana metin
  textSub:      '#8696A0',   // İkincil metin
  textHint:     '#667781',   // İpucu / placeholder
  iconGray:     '#667781',   // Devre dışı ikon
  border:       'rgba(134,150,160,0.15)',
  divider:      'rgba(134,150,160,0.10)',
  // Semantic
  success:      '#00A884',
  warning:      '#F59E0B',
  error:        '#EF4444',
  info:         '#38BDF8',
  // Modüller
  speed:        '#6C3EE8',
  comprehension:'#00A884',
  attention:    '#F59E0B',
  reset:        '#38BDF8',
}

// ─── Tema Fabrikası ───────────────────────────────────────────────

function buildTheme(p: typeof lightPalette) {
  return {
    colors: {
      background:   p.background,
      surface:      p.surface,
      panel:        p.panelBg,
      primary:      p.primary,
      primaryLight: p.primaryDark,
      accent:       p.primaryDark,
      text:         p.text,
      textSub:      p.textSub,
      textHint:     p.textHint,
      iconGray:     p.iconGray,
      border:       p.border,
      divider:      p.divider,
      bubbleOut:    p.bubbleOut,
      bubbleIn:     p.bubbleIn,
      msgGray:      p.msgGray,
      success:      p.success,
      warning:      p.warning,
      error:        p.error,
      info:         p.info,
      white:        '#FFFFFF',
    },

    spacing: {
      xs: 4, sm: 8, md: 12, lg: 16,
      xl: 20, xxl: 24, xxxl: 32, huge: 48,
    },

    radius: {
      sm: 8, md: 12, lg: 16, xl: 20,
      xxl: 24, pill: 999, bubble: 18,
    },

    font: {
      xs: 11, sm: 12, md: 14, lg: 16,
      xl: 18, xxl: 22, h1: 28, h2: 24, display: 48,
    },

    shadow: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: p.background === '#0B141A' ? 0.3 : 0.08,
        shadowRadius: 4, elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: p.background === '#0B141A' ? 0.4 : 0.12,
        shadowRadius: 8, elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: p.background === '#0B141A' ? 0.5 : 0.16,
        shadowRadius: 16, elevation: 8,
      },
      green: {
        shadowColor: p.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12, elevation: 6,
      },
    },

    // ── Gelişmiş gölge sistemi (shadows.glow() destekli) ────────
    shadows: {
      sm: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: p.background === '#0B141A' ? 0.30 : 0.08,
        shadowRadius: 4, elevation: 2,
      },
      md: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: p.background === '#0B141A' ? 0.40 : 0.15,
        shadowRadius: 8, elevation: 6,
      },
      lg: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: p.background === '#0B141A' ? 0.50 : 0.20,
        shadowRadius: 16, elevation: 12,
      },
      glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.40,
        shadowRadius: 12, elevation: 8,
      }),
    },

    // ── Gradient renk tanımları ──────────────────────────────────
    gradients: {
      hero: p.background === '#0B141A'
        ? ['#1a1a2e', '#16213e', '#0f3460'] as string[]
        : ['#667eea', '#764ba2'] as string[],
      speedControl: ['#f093fb', '#f5576c'] as string[],
      deepComp:     ['#4facfe', '#00f2fe'] as string[],
      attention:    ['#43e97b', '#38f9d7'] as string[],
      mentalReset:  ['#fa709a', '#fee140'] as string[],
      eyeTraining:  ['#a18cd1', '#fbc2eb'] as string[],
      vocabulary:   ['#f6d365', '#fda085'] as string[],
      cardPrimary:  ['#1e3c72', '#2a5298'] as string[],
      cardSuccess:  ['#11998e', '#38ef7d'] as string[],
      cardWarning:  ['#f7971e', '#ffd200'] as string[],
      cardDanger:   ['#eb3349', '#f45c43'] as string[],
      streak:       ['#f7971e', '#ffd200'] as string[],
      xp:           ['#43e97b', '#38f9d7'] as string[],
      arp:          ['#4facfe', '#00f2fe'] as string[],
      aiKoc:        ['#667eea', '#764ba2'] as string[],
      antrenmanlar: ['#f093fb', '#f5576c'] as string[],
      program:      ['#4facfe', '#00f2fe'] as string[],
      istatistik:   ['#43e97b', '#38f9d7'] as string[],
      basarilar:    ['#f7971e', '#ffd200'] as string[],
      ayarlar:      ['#8e9eab', '#eef2f3'] as string[],
      examSim:      ['#667eea', '#764ba2'] as string[],
    },

    // ── Tipografi skalası ────────────────────────────────────────
    typography: {
      heroNumber: 72,
      displayLg:  48,
      displayMd:  36,
      displaySm:  28,
      titleLg:    22,
      titleMd:    18,
      body:       15,
      caption:    12,
    },

    module: {
      speed_control:      { color: p.speed,         icon: '⚡', label: 'Hız Kontrolü' },
      deep_comprehension: { color: p.comprehension, icon: '🧠', label: 'Derin Kavrama' },
      attention_power:    { color: p.attention,     icon: '🎯', label: 'Dikkat Gücü' },
      mental_reset:       { color: p.reset,         icon: '🌿', label: 'Zihinsel Sıfırlama' },
    } as Record<string, { color: string; icon: string; label: string }>,

    isDark: p.background === '#0B141A',
  }
}

// ─── Dışa Aktarılanlar ────────────────────────────────────────────

export const lightTheme = buildTheme(lightPalette)
export const darkTheme  = buildTheme(darkPalette)

/** Statik import için (henüz hook'a geçmeyen ekranlar) */
export const theme = lightTheme

export type AppTheme = typeof lightTheme

// ─── Design System Token'ları ─────────────────────────────────────
export * from './colors'
export * from './typography'
export * from './spacing'
export * from './shadows'
