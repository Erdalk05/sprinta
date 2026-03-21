/**
 * Help & Support Screen
 * App Store requirement: support URL / contact method must be accessible.
 */
import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Linking,
} from 'react-native'
import { useRouter } from 'expo-router'

const NAVY = '#1A3594'
const SUPPORT_EMAIL = 'destek@sprinta.app'
const SUPPORT_URL   = 'https://sprinta.app/destek'

const FAQ = [
  {
    q: 'ARP skoru nedir?',
    a: 'ARP (Adaptive Reading Performance), okuma hızını, anlama puanını ve tamamlama oranını birleştiren bileşik performans skorudur. 0–400 arasında değer alır.',
  },
  {
    q: 'Çalışmalarım kaydedilmiyor, ne yapmalıyım?',
    a: 'İnternet bağlantınızı kontrol edin. Bağlantı olmadan egzersizler cihazda kaydedilir ve bağlantı sağlandığında otomatik senkronize edilir.',
  },
  {
    q: 'Aboneliğimi nasıl iptal ederim?',
    a: 'iOS: Ayarlar → Apple ID → Abonelikler → Sprinta → İptal Et.\nAndroid: Google Play → Abonelikler → Sprinta → İptal Et.',
  },
  {
    q: 'Verilerimi nasıl silerim?',
    a: 'Hesap silme talebinizi kvkk@sprinta.app adresine iletebilirsiniz. Talebin ardından 30 gün içinde tüm verileriniz silinir.',
  },
  {
    q: 'Uygulamayı kaç cihazda kullanabilirim?',
    a: 'Tek hesapla birden fazla cihazda giriş yapabilirsiniz. İlerlemeniz tüm cihazlarda senkronize edilir.',
  },
  {
    q: 'Tanılama testini tekrar yapabilir miyim?',
    a: 'Şu anda tanılama testi tek seferlik yapılabilmektedir. Yeniden test için destek ekibiyle iletişime geçin.',
  },
]

export default function HelpSupportScreen() {
  const router = useRouter()
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Yardım & Destek</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Contact buttons */}
        <View style={s.contactRow}>
          <TouchableOpacity
            style={[s.contactBtn, { backgroundColor: NAVY }]}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            activeOpacity={0.85}
          >
            <Text style={s.contactBtnIcon}>✉️</Text>
            <Text style={s.contactBtnTxt}>E-posta Gönder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.contactBtn, { backgroundColor: '#10B981' }]}
            onPress={() => Linking.openURL(SUPPORT_URL)}
            activeOpacity={0.85}
          >
            <Text style={s.contactBtnIcon}>🌐</Text>
            <Text style={s.contactBtnTxt}>Destek Merkezi</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>SIK SORULAN SORULAR</Text>

        {FAQ.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={s.faqItem}
            onPress={() => setOpenIdx(openIdx === i ? null : i)}
            activeOpacity={0.75}
          >
            <View style={s.faqHeader}>
              <Text style={s.faqQ}>{item.q}</Text>
              <Text style={s.faqChevron}>{openIdx === i ? '▲' : '▼'}</Text>
            </View>
            {openIdx === i && (
              <Text style={s.faqA}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={s.version}>Sprinta v1.0.0 · destek@sprinta.app</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn:   { width: 40, alignItems: 'flex-start' },
  backArrow: { fontSize: 22, color: NAVY },
  title:     { fontSize: 16, fontWeight: '700', color: '#111827' },

  content: { paddingTop: 16, paddingHorizontal: 16 },

  contactRow: {
    flexDirection: 'row', gap: 12, marginBottom: 24,
  },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 14,
  },
  contactBtnIcon: { fontSize: 18 },
  contactBtnTxt:  { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1, marginBottom: 10,
  },

  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  faqQ:       { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827', paddingRight: 8 },
  faqChevron: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  faqA: {
    fontSize: 13, color: '#4B5563', lineHeight: 22,
    marginTop: 10,
  },

  version: {
    fontSize: 12, color: '#D1D5DB', textAlign: 'center', marginTop: 24,
  },
})
