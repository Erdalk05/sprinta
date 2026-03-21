/**
 * Privacy Policy Screen
 * App Store requirement: privacy policy must be accessible inside the app.
 * Content: KVKK Aydınlatma Metni + Gizlilik Politikası
 */
import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking,
} from 'react-native'
import { useRouter } from 'expo-router'

const PRIVACY_WEB_URL = 'https://sprinta.app/gizlilik'

export default function PrivacyPolicyScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Gizlilik Politikası</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <Text style={s.updated}>Son güncelleme: Mart 2026</Text>

        {/* Web URL */}
        <TouchableOpacity
          style={s.webLink}
          onPress={() => Linking.openURL(PRIVACY_WEB_URL)}
          activeOpacity={0.8}
        >
          <Text style={s.webLinkTxt}>🌐 Web'de görüntüle: sprinta.app/gizlilik</Text>
        </TouchableOpacity>

        <Section title="1. Veri Sorumlusu">
          {`Sprinta Eğitim Teknolojileri ("Sprinta", "biz"), 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusudur.`}
        </Section>

        <Section title="2. Hangi Veriler Toplanır?">
          {`• Ad, soyad ve e-posta adresi (kayıt sırasında)\n• Okuma hızı, anlama skoru ve egzersiz sonuçları (uygulama kullanımı)\n• Sınav hedefi ve sınıf seviyesi (kişiselleştirme)\n• Uygulama kullanım istatistikleri (performans analizi)\n\nKamera, mikrofon veya konum verisi toplanmaz.`}
        </Section>

        <Section title="3. Veriler Nasıl Kullanılır?">
          {`• Kişiselleştirilmiş öğrenme planı oluşturmak\n• Okuma performansını analiz etmek ve geliştirmek\n• Uygulama deneyimini iyileştirmek\n• Yasal yükümlülükleri yerine getirmek`}
        </Section>

        <Section title="4. Veriler Kimlerle Paylaşılır?">
          {`Verileriniz;\n• Supabase (altyapı sağlayıcı) — AB Standart Sözleşme Maddeleri kapsamında\n• Anthropic (AI modeli) — anonim performans verisi\n• RevenueCat (abonelik yönetimi)\n\nile paylaşılır. Üçüncü taraflara satılmaz.`}
        </Section>

        <Section title="5. Veri Saklama Süresi">
          {`Hesabınız aktif olduğu sürece verileriniz saklanır. Hesap silinmesinden itibaren 30 gün içinde tüm kişisel veriler sistemden kalıcı olarak silinir.`}
        </Section>

        <Section title="6. 13 Yaş Altı Çocuklar">
          {`13 yaş altı çocukların verileri, veli/vasi açık rızası olmadan işlenmez. Kayıt sırasında doğum yılı girişi zorunludur ve 13 yaş altı için veli onayı alınır.`}
        </Section>

        <Section title="7. Haklarınız (KVKK Md. 11)">
          {`• Verilerinize erişim talep etme\n• Hatalı verilerin düzeltilmesini isteme\n• Verilerin silinmesini talep etme\n• İşlemeye itiraz etme\n• Veri taşınabilirliği talep etme\n\nTalepler için: kvkk@sprinta.app`}
        </Section>

        <Section title="8. Çerezler ve Yerel Depolama">
          {`Uygulama, oturum bilgilerini ve kullanıcı tercihlerini cihaz üzerinde yerel olarak saklar (AsyncStorage / MMKV). Bu veriler üçüncü taraflarla paylaşılmaz.`}
        </Section>

        <Section title="9. İletişim">
          {`Gizlilik ile ilgili sorularınız için:\nkvkk@sprinta.app\nsprinta.app/gizlilik`}
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Section helper ───────────────────────────────────────────────
function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionBody}>{children}</Text>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn:  { width: 40, alignItems: 'flex-start' },
  backArrow:{ fontSize: 22, color: '#1A3594' },
  title:    { fontSize: 16, fontWeight: '700', color: '#111827' },

  content: { paddingHorizontal: 20, paddingTop: 16 },

  updated: {
    fontSize:     12,
    color:        '#9CA3AF',
    marginBottom: 12,
  },

  webLink: {
    backgroundColor: '#EEF2FF',
    borderRadius:    10,
    padding:         12,
    marginBottom:    20,
  },
  webLinkTxt: {
    fontSize:   13,
    color:      '#1A3594',
    fontWeight: '600',
  },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize:     14,
    fontWeight:   '700',
    color:        '#111827',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize:   13,
    color:      '#4B5563',
    lineHeight: 22,
  },
})
