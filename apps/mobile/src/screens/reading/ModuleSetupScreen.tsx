/**
 * ModuleSetupScreen
 * Modüle dokunulduğunda gösterilen zengin tanıtım ekranı.
 * Hero blok, stat chip'leri, faydalar, adımlar ve iki aksiyon butonu içerir.
 */
import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MODULE_INTRO } from '../../components/exercise/ReadingModuleIntro'

// ─── Sabit Kümeler ────────────────────────────────────────────────────

/**
 * Bu modüller yerleşik içerik kullanır (metin seçimi gereksiz).
 * Sadece tek "Başlat" butonu gösterilir.
 */
const NO_CONTENT_MODULES = new Set([
  'vocabulary',
  'soru-treni',
  'hatali-cumle',
  'flashcard-bank',
  'kelime-baglami',
  'poetry-analysis',
  'graph-reading',
  // Yerleşik içerik kullananlar:
  'vanishing-reading',
  'fading-word',
  'cloze-test',
  'dual-column',
])

// ─── Helpers ─────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const safe = hex.startsWith('#') ? hex : '#4338CA'
  const r = parseInt(safe.slice(1, 3), 16)
  const g = parseInt(safe.slice(3, 5), 16)
  const b = parseInt(safe.slice(5, 7), 16)
  return [r, g, b]
}

function deriveDark(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${Math.round(r * 0.35)},${Math.round(g * 0.35)},${Math.round(b * 0.35)})`
}

function deriveLight(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${Math.min(255, Math.round(r * 0.08 + 236))},${Math.min(255, Math.round(g * 0.08 + 236))},${Math.min(255, Math.round(b * 0.08 + 236))})`
}

// ─── Props ────────────────────────────────────────────────────────────

interface Props {
  moduleKey:     string
  onSelectText:  () => void
  onQuickStart:  () => void
  onBack:        () => void
}

// ─── Component ────────────────────────────────────────────────────────

export default function ModuleSetupScreen({
  moduleKey,
  onSelectText,
  onQuickStart,
  onBack,
}: Props) {
  const info = MODULE_INTRO[moduleKey]

  // Bilinmeyen modül — direkt başlat
  if (!info) {
    onQuickStart()
    return null
  }

  const isNoContent = NO_CONTENT_MODULES.has(moduleKey)
  const accent      = info.accent
  const darkBg      = deriveDark(accent)
  const lightBg     = deriveLight(accent)

  return (
    <SafeAreaView style={[s.root, { backgroundColor: lightBg }]}>

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[s.headerBar, { backgroundColor: darkBg }]}>
        <TouchableOpacity
          onPress={onBack}
          style={s.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{info.label}</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* ── Kaydırılabilir İçerik ───────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero Block */}
        <LinearGradient
          colors={[darkBg, accent + 'AA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <LinearGradient
            colors={[accent, accent + 'BB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.iconCircle}
          >
            <Text style={s.iconText}>{info.icon}</Text>
          </LinearGradient>
          <Text style={s.heroTitle}>{info.label}</Text>
          <Text style={s.heroSubtitle}>{info.subtitle}</Text>
        </LinearGradient>

        {/* Stat Chip'leri */}
        <View style={s.chipsRow}>
          {info.stats.map((stat, i) => (
            <View
              key={i}
              style={[s.chip, { borderColor: accent + '40', backgroundColor: '#FFFFFF' }]}
            >
              <Text style={[s.chipValue, { color: accent }]}>{stat.value}</Text>
              <Text style={s.chipLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Neden Bu Modül? (Benefits) */}
        <View style={[s.section, { borderLeftColor: accent }]}>
          <Text style={[s.sectionTitle, { color: accent }]}>🏆 Neden Bu Modül?</Text>
          {info.benefits.map((b, i) => (
            <View key={i} style={s.benefitRow}>
              <Text style={[s.checkMark, { color: accent }]}>✓</Text>
              <Text style={s.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Nasıl Çalışır? (Steps) */}
        <View style={[s.section, { borderLeftColor: accent }]}>
          <Text style={[s.sectionTitle, { color: accent }]}>📋 Nasıl Çalışır?</Text>
          {info.steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={[s.stepNum, { backgroundColor: accent }]}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* İpucu Kartı */}
        <View style={[s.tipCard, { borderColor: accent + '30', backgroundColor: accent + '08' }]}>
          <Text style={[s.tipText, { color: accent }]}>💡 {info.tip}</Text>
        </View>

        {/* Footer için boşluk */}
        <View style={{ height: 130 }} />
      </ScrollView>

      {/* ── Sabit Footer ─────────────────────────────────────── */}
      <View style={[s.footer, { borderTopColor: accent + '20' }]}>
        {isNoContent ? (
          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: accent }]}
            onPress={onQuickStart}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>⚡  Egzersizi Başlat</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.buttonRow}>
            <TouchableOpacity
              style={[s.secondaryBtn, { borderColor: accent }]}
              onPress={onSelectText}
              activeOpacity={0.8}
            >
              <Text style={[s.secondaryBtnText, { color: accent }]}>📚 Metin Seç</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.primaryBtn, s.primaryBtnFlex, { backgroundColor: accent }]}
              onPress={onQuickStart}
              activeOpacity={0.85}
            >
              <Text style={s.primaryBtnText}>⚡ Hızlı Başlat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </SafeAreaView>
  )
}

// ─── StyleSheet ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header
  headerBar: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 16,
    paddingTop:      12,
    paddingBottom:   12,
    gap:             8,
  },
  backBtn: {
    paddingVertical: 4,
    minWidth:        60,
  },
  backTxt: {
    fontSize:   15,
    color:      'rgba(255,255,255,0.92)',
    fontWeight: '600',
  },
  headerTitle: {
    flex:       1,
    fontSize:   17,
    fontWeight: '800',
    color:      '#FFFFFF',
    textAlign:  'center',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    minWidth: 60,
  },

  // Scroll
  scroll: { flex: 1 },
  body:   { padding: 16, gap: 14, paddingBottom: 24 },

  // Hero
  hero: {
    borderRadius: 20,
    padding:      24,
    alignItems:   'center',
    gap:          10,
    overflow:     'hidden',
    shadowColor:  '#000',
    shadowOpacity: 0.18,
    shadowRadius:  12,
    shadowOffset:  { width: 0, height: 4 },
    elevation:     6,
  },
  iconCircle: {
    width:          72,
    height:         72,
    borderRadius:   22,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   4,
    shadowColor:    '#000',
    shadowOpacity:  0.25,
    shadowRadius:   10,
    shadowOffset:   { width: 0, height: 3 },
    elevation:      6,
  },
  iconText:    { fontSize: 34 },
  heroTitle: {
    fontSize:     22,
    fontWeight:   '900',
    color:        '#FFFFFF',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize:   13,
    color:      'rgba(255,255,255,0.88)',
    textAlign:  'center',
    lineHeight: 19,
    fontWeight: '500',
    maxWidth:   280,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap:           8,
  },
  chip: {
    flex:          1,
    borderRadius:  14,
    borderWidth:   1.5,
    paddingVertical:   10,
    paddingHorizontal: 6,
    alignItems:    'center',
    backgroundColor: '#FFFFFF',
    shadowColor:   '#000',
    shadowOpacity: 0.04,
    shadowRadius:  6,
    shadowOffset:  { width: 0, height: 1 },
    elevation:     1,
  },
  chipValue: {
    fontSize:     14,
    fontWeight:   '900',
    letterSpacing: -0.3,
  },
  chipLabel: {
    fontSize:   10,
    fontWeight: '600',
    color:      '#6B7280',
    marginTop:  3,
    textAlign:  'center',
  },

  // Section cards
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    borderLeftWidth: 4,
    padding:         16,
    gap:             4,
    shadowColor:     '#000',
    shadowOpacity:   0.05,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  sectionTitle: {
    fontSize:     12,
    fontWeight:   '800',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Benefits
  benefitRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           8,
    marginBottom:  6,
  },
  checkMark: {
    fontSize:   14,
    fontWeight: '900',
    marginTop:  2,
  },
  benefitText: {
    flex:       1,
    fontSize:   13,
    lineHeight: 19,
    color:      '#374151',
    fontWeight: '500',
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           10,
    marginBottom:  8,
  },
  stepNum: {
    width:          22,
    height:         22,
    borderRadius:   11,
    alignItems:     'center',
    justifyContent: 'center',
    marginTop:      1,
    flexShrink:     0,
  },
  stepNumText: {
    fontSize:   11,
    fontWeight: '900',
    color:      '#FFFFFF',
  },
  stepText: {
    flex:       1,
    fontSize:   13,
    lineHeight: 19,
    color:      '#374151',
    fontWeight: '500',
  },

  // Tip card
  tipCard: {
    borderRadius:  14,
    borderWidth:   1,
    padding:       14,
  },
  tipText: {
    fontSize:   13,
    lineHeight: 20,
    fontWeight: '600',
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop:        12,
    paddingBottom:     10,
    backgroundColor:   '#FFFFFF',
    borderTopWidth:    1,
    shadowColor:       '#000',
    shadowOpacity:     0.06,
    shadowRadius:      8,
    shadowOffset:      { width: 0, height: -2 },
    elevation:         4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap:           10,
  },
  primaryBtn: {
    borderRadius:    18,
    paddingVertical: 17,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     '#000',
    shadowOpacity:   0.20,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       5,
  },
  primaryBtnFlex: {
    flex: 1.4,
  },
  primaryBtnText: {
    fontSize:   16,
    fontWeight: '900',
    color:      '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    flex:            1,
    borderWidth:     2,
    borderRadius:    18,
    paddingVertical: 17,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    fontSize:   15,
    fontWeight: '700',
  },
})
