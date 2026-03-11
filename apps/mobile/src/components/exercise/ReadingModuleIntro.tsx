/**
 * ReadingModuleIntro — Tüm okuma modülleri için ortak immersif intro ekranı.
 * Her modüle özgü renk + ikon + başlık + "Egzersizi Başlat" butonu gösterir.
 */
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

// ── Accent'ten 3 renk türet (session.tsx ile aynı) ───────────────
function getPalette(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return {
    header:  `rgb(${Math.round(r * 0.40)},${Math.round(g * 0.40)},${Math.round(b * 0.40)})` as const,
    content: `rgb(${Math.min(255, Math.round(r * 0.10 + 230))},${Math.min(255, Math.round(g * 0.10 + 230))},${Math.min(255, Math.round(b * 0.10 + 230))})` as const,
    bottom:  `rgb(${Math.round(r * 0.28)},${Math.round(g * 0.28)},${Math.round(b * 0.28)})` as const,
  }
}

// ── Modül bilgileri haritası ───────────────────────────────────────
export const MODULE_INTRO: Record<string, {
  icon:     string
  label:    string
  subtitle: string
  accent:   string
  tip:      string
}> = {
  'chunk-rsvp':        { icon: '⚡', label: 'Chunk Okuma',       subtitle: 'Kelimeler grup grup gösterilir — gözün art arda taramasını keser',       accent: '#0891B2', tip: 'Okuma hızın için en etkili RSVP yöntemlerinden biri.' },
  'timed-reading':     { icon: '⏱️', label: 'Zamanlı Okuma',     subtitle: 'Süre sayacı altında oku — YKS/TYT sınav baskısını simüle et',           accent: '#EA580C', tip: 'Zaman baskısı altında okuma hızını ve kavramayı geliştirir.' },
  'flow-reading':      { icon: '🌊', label: 'Akış Okuma',         subtitle: 'Satır satır pacing — anlama + hız dengesini kur',                       accent: '#059669', tip: 'Duraksama olmadan sürekli akış, yorgunluğu azaltır.' },
  'speed-ladder':      { icon: '🪜', label: 'Hız Merdiveni',      subtitle: 'Her 30 kelimede +25 WPM artar — konfor zonunu kır',                     accent: '#D97706', tip: 'Kademeli hız artışı kalıcı WPM kazanımı sağlar.' },
  'bionic-reading':    { icon: '🧬', label: 'Biyonik Okuma',      subtitle: 'İlk heceler kalın vurgulanır — beyin kelimeyi tamamlar',               accent: '#0284C7', tip: 'Göz daha az hareket eder, zihin daha hızlı işler.' },
  'keyword-scan':      { icon: '🔍', label: 'Anahtar Kelime',     subtitle: 'Kritik kavramları tarar — pasaj soru stratejisi',                       accent: '#DC2626', tip: 'Paragrafta ana fikri taşıyan anahtar kelimeleri yakala.' },
  'fixation-trainer':  { icon: '👁️', label: 'Göz Genişliği',     subtitle: 'Flash gruplar — tek fiksasyonda daha fazla kelime gör',                 accent: '#9333EA', tip: 'Göz genişliği arttıkça satır başı sayısı düşer.' },
  'word-burst':        { icon: '💫', label: 'Çok Kelime',          subtitle: '2-4 kelime aynı anda — periferik görüş alanını genişlet',              accent: '#16A34A', tip: 'Span kapasiten her seansta ~0.3 kelime büyür.' },
  'auto-scroll':       { icon: '📜', label: 'Oto Kaydırma',        subtitle: 'Metin kendi hızında kayar — ritim ve duruş noktalarını ortadan kaldır', accent: '#E11D48', tip: 'Gözlerin metni takip eder, bilinçsiz duraksama azalır.' },
  'sentence-step':     { icon: '📝', label: 'Cümle Adım',          subtitle: 'Cümle cümle ilerle — her adımda anlama odaklan',                       accent: '#0F766E', tip: 'Yavaş ama güçlü: kavrama oranı %40 artar.' },
  'academic-mode':     { icon: '📚', label: 'Akademik Mod',         subtitle: 'Ağır paragrafları analiz et — derin çıkarım soruları',                 accent: '#1D4ED8', tip: 'Üniversite sınav metinleri için idealdir.' },
  'focus-filter':      { icon: '🎯', label: 'Dikkat Filtresi',     subtitle: 'Tek satır odak maskesi — dikkat dağınıklığını engeller',               accent: '#B45309', tip: 'Çevresel gürültüye karşı göz odağını korur.' },
  'memory-anchor':     { icon: '🧠', label: 'Hafıza Sabitleme',    subtitle: 'Oku-gizle-hatırla — bilgiyi uzun süreli belleğe aktar',                accent: '#6D28D9', tip: 'Spaced repetition prensibinin okuma versiyonu.' },
  'vocabulary':        { icon: '📖', label: 'Kelime Haznesi',      subtitle: 'Bağlam içinde kelime öğren — MCQ formatında anlam testi',              accent: '#047857', tip: 'Kelime başına yanıt süresi ölçülür.' },
  'prediction-reading':{ icon: '🔮', label: 'Tahmin Okuma',        subtitle: 'Cümle sonunu tahmin et — anlam bağlantısı kur',                        accent: '#C2410C', tip: 'Öngörü yeteneği hız okumada en önemli bilişsel beceridir.' },
  'subvocal-free':     { icon: '🤫', label: 'Sessiz Okuma',        subtitle: 'İç sesi bastır — subvokalizasyonu kır, hızı ikiye katla',              accent: '#1E40AF', tip: 'İç ses okumayı konuşma hızına kilitler (180 WPM).' },
  'speed-camp':        { icon: '🏕️', label: 'Hızlı Okuma Kampı',  subtitle: 'Günlük antrenman programı — WPM gelişimini takip et',                 accent: '#15803D', tip: '21 günlük kamp ortalama +80 WPM kazandırır.' },
  'vanishing-reading': { icon: '🌫️', label: 'Kaybolma Okuma',     subtitle: 'Metin yavaşça solar — gördüklerini hafızadan tamamla',                 accent: '#4338CA', tip: 'Periferal bellek kapasiteni zorlar.' },
  'fading-word':       { icon: '🗑️', label: 'Kelime Silme',        subtitle: 'Kelimeler birer birer kaybolur — cümleyi hafızadan tamamla',           accent: '#BE185D', tip: 'Kısa süreli çalışma belleğini güçlendirir.' },
  'cloze-test':        { icon: '📋', label: 'Cloze Testi',          subtitle: 'Her 7. kelime boş — bağlamdan tahminde bulun',                         accent: '#7E22CE', tip: 'LGS okuma sorusu formatıyla özdeş strateji.' },
  'dual-column':       { icon: '📰', label: 'Çift Sütun',           subtitle: 'İki kolon aynı anda oku — periferik span kapasiteni artır',            accent: '#0369A1', tip: 'Gazete okuma tekniği: sütun ortasına odaklan.' },
  'soru-treni':        { icon: '🚂', label: 'Soru Treni',           subtitle: '40 LGS sorusu · 45 dakika timer · gerçek sınav simülasyonu',           accent: '#B91C1C', tip: 'Sınav koşullarında pratik yapmak başarıyı %35 artırır.' },
  'hatali-cumle':      { icon: '🔎', label: 'Hatalı Cümle',         subtitle: 'Dil bilgisi hatasını bul — 20 tur dikkat egzersizi',                  accent: '#92400E', tip: 'Türkçe soru hatasını fark etme becerisini geliştirir.' },
  'flashcard-bank':    { icon: '🃏', label: 'Flash Kart Bankası',   subtitle: 'Soruları kart formatında geç — işaretle ve tekrar et',                 accent: '#0E7490', tip: '375 soru, serbest tempo, işaretleme sistemi.' },
  'kelime-baglami':    { icon: '🔤', label: 'Kelime Bağlamı',       subtitle: 'Altı çizili kelimeyi cümleden anlamlandır · 4 şık',                   accent: '#3730A3', tip: 'LGS kelime anlam sorusunun tam format eğitimi.' },
  'poetry-analysis':   { icon: '🖊️', label: 'Şiir Analizi',        subtitle: '5 şiir · edebi sanat + anlam soruları · AYT Edebiyat',                accent: '#86198F', tip: 'Edebi sanatları cümle içinde tanıma egzersizi.' },
  'graph-reading':     { icon: '📊', label: 'Grafik Okuma',         subtitle: 'Veri grafiklerini yorumla · çıkarım soruları · AYT/LGS',              accent: '#164E63', tip: 'Görsel veri okuma hızı AYT puanını doğrudan etkiler.' },
}

// ── Bileşen ───────────────────────────────────────────────────────
interface Props {
  moduleKey: string   // route adı: 'chunk-rsvp', 'timed-reading', vb.
  onStart:  () => void
  onBack:   () => void
}

export default function ReadingModuleIntro({ moduleKey, onStart, onBack }: Props) {
  const info = MODULE_INTRO[moduleKey]
  if (!info) {
    // Bilinmeyen modül — hemen başlat
    onStart()
    return null
  }

  const pal = getPalette(info.accent)

  return (
    <SafeAreaView style={[s.root, { backgroundColor: pal.content }]}>

      {/* ── İmmersif Header ─────────────────────────────────────── */}
      <View style={[s.header, { backgroundColor: pal.header }]}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <View style={s.heroRow}>
          <LinearGradient
            colors={[info.accent, info.accent + 'BB']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.iconWrap}
          >
            <Text style={s.icon}>{info.icon}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>{info.label}</Text>
            <Text style={s.subtitle} numberOfLines={2}>{info.subtitle}</Text>
          </View>
        </View>
      </View>

      {/* ── İçerik ──────────────────────────────────────────────── */}
      <View style={s.body}>

        {/* İpucu kartı */}
        <View style={[s.tipCard, { borderLeftColor: info.accent, backgroundColor: '#fff' }]}>
          <Text style={[s.tipLabel, { color: info.accent }]}>💡 Nasıl Çalışır?</Text>
          <Text style={s.tipText}>{info.tip}</Text>
        </View>

        {/* Renk çubuğu (dekoratif) */}
        <View style={[s.colorBar, { backgroundColor: info.accent + '20', borderColor: info.accent + '35' }]}>
          <View style={[s.colorDot, { backgroundColor: info.accent }]} />
          <Text style={[s.colorBarTxt, { color: info.accent }]}>
            {info.label} hazır
          </Text>
        </View>

      </View>

      {/* ── Başlat Butonu ─────────────────────────────────────────── */}
      <View style={[s.footer, { backgroundColor: pal.bottom }]}>
        <TouchableOpacity
          style={[s.startBtn, { backgroundColor: info.accent }]}
          onPress={onStart}
          activeOpacity={0.85}
        >
          <Text style={s.startTxt}>⚡  Egzersizi Başlat</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1 },

  // Header
  header: {
    paddingBottom: 24,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingTop:        12,
    paddingBottom:     10,
  },
  backTxt: { fontSize: 15, color: 'rgba(255,255,255,0.90)', fontWeight: '600' },
  heroRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            14,
    paddingHorizontal: 20,
    paddingTop:     4,
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.30, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  icon:     { fontSize: 32 },
  label:    { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 4, lineHeight: 17 },

  // Body
  body: {
    flex: 1,
    padding: 20,
    gap:     14,
  },
  tipCard: {
    borderRadius:    16,
    borderLeftWidth: 4,
    padding:         16,
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  tipLabel: { fontSize: 12, fontWeight: '800', marginBottom: 6, letterSpacing: 0.3 },
  tipText:  { fontSize: 14, lineHeight: 20, color: '#374151', fontWeight: '500' },

  colorBar: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
    borderRadius:   14,
    borderWidth:    1,
    padding:        14,
  },
  colorDot:    { width: 10, height: 10, borderRadius: 5 },
  colorBarTxt: { fontSize: 13, fontWeight: '700' },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop:        14,
    paddingBottom:     12,
  },
  startBtn: {
    borderRadius:   18,
    paddingVertical: 18,
    alignItems:     'center',
    shadowColor:    '#000',
    shadowOpacity:  0.25,
    shadowRadius:   10,
    shadowOffset:   { width: 0, height: 4 },
    elevation:      6,
  },
  startTxt: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
})
