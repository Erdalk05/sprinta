# 14 — KVKK & HUKUKİ UYUMLULUK
## Kişisel Verilerin Korunması ve B2B Sözleşmeleri

---

## 1. KVKK GEREKLİLİKLERİ

SPRINTA, Türkiye'deki 6698 sayılı KVKK kapsamında kişisel veri işlemektedir. Temel yükümlülükler:

**Veri Kategorileri:**
- Kimlik (ad, soyad, e-posta)
- Eğitim (okul, sınıf, sınav hedefi)
- Performans (oturum süreleri, ARP, WPM, anlama oranı)
- Davranış (aktivite günlükleri, egzersiz geçmişi)

**Yasal Dayanak:**
- B2C: Açık rıza (KVKK m.5/1) — kayıt sırasında onay alınır
- B2B: Sözleşmenin ifası (KVKK m.5/2-c) — kurum ile hizmet sözleşmesi
- 13-18 yaş: Velayet hakkı sahibinin yazılı onayı zorunlu (KVKK + Medeni Kanun)

---

## 2. AYDINLATMA METNİ (Uygulama İçi)

```typescript
// packages/shared/src/legal/kvkk.ts

export const KVKK_AYDINLATMA_METNI = `
SPRINTA KİŞİSEL VERİ AYDINLATMA METNİ

Veri Sorumlusu: [Şirket Adı] (bundan böyle "Sprinta" olarak anılacaktır)

1. İŞLENEN KİŞİSEL VERİLER
Sprinta tarafından aşağıdaki kişisel verileriniz işlenmektedir:
• Ad, soyad ve e-posta adresi
• Eğitim bilgileri (okul, sınıf, hedef sınav)
• Performans verileri (okuma hızı, anlama oranı, egzersiz geçmişi)
• Uygulama kullanım verileri

2. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI
• Kullanıcı hesabı oluşturma ve yönetimi
• Kişiselleştirilmiş eğitim deneyimi sunma
• Performans analizi ve raporlama
• Yasal yükümlülüklerin yerine getirilmesi

3. KİŞİSEL VERİLERİN AKTARILMASI
Verileriniz; hizmet alınan teknoloji altyapısı sağlayıcılarına (Supabase/AWS - ABD) 
aktarılmaktadır. Bu aktarım, KVKK'nın 9. maddesi kapsamında yeterli koruma tedbirleri 
alınarak gerçekleştirilmektedir.

4. VERİ SAKLAMA SÜRESİ
Kişisel verileriniz, hesap aktif olduğu sürece ve hesap kapatıldıktan 3 yıl sonrasına 
kadar saklanmaktadır. Performans verileri anonimleştirilerek daha uzun süre tutulabilir.

5. HAKLARINIZ (KVKK m.11)
• Verilerinize erişim hakkı
• Düzeltme talep hakkı
• Silme/yok etme talep hakkı
• İşlemeye itiraz hakkı
• Veri taşınabilirliği hakkı

İletişim: kvkk@sprinta.app
`.trim();

export const RIZA_METNI_B2C = `
Sprinta Kişisel Veri Aydınlatma Metni'ni okudum ve anladım.
Kişisel verilerimin yukarıda belirtilen amaçlarla işlenmesine açık rızamı veriyorum.
`.trim();

export const RIZA_METNI_VELI = `
13 yaşın altındaki çocuğum/velayetindeki kişi için Sprinta'ya kayıt yaptırmaktayım.
Çocuğumun kişisel verilerinin Aydınlatma Metni'nde belirtilen amaçlarla işlenmesine
veli sıfatıyla açık rızamı veriyorum.
`.trim();
```

---

## 3. RIZA AKIŞI (Kayıt Formu)

```tsx
// apps/mobile/app/(onboarding)/consent.tsx

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  KVKK_AYDINLATMA_METNI,
  RIZA_METNI_B2C,
  RIZA_METNI_VELI
} from '@sprinta/shared';

export default function ConsentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ birthYear?: string }>();
  const birthYear = parseInt(params.birthYear ?? '2000');
  const age = new Date().getFullYear() - birthYear;
  const needsParentalConsent = age < 13;
  const isMinor = age < 18;

  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [parentalAccepted, setParentalAccepted] = useState(false);

  function handleContinue() {
    if (!kvkkAccepted) {
      Alert.alert('Gerekli', 'Devam etmek için KVKK metnini kabul etmelisiniz.');
      return;
    }
    if (needsParentalConsent && !parentalAccepted) {
      Alert.alert('Gerekli', '13 yaş altı kayıt için veli onayı zorunludur.');
      return;
    }
    router.push('/(onboarding)/register');
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gizlilik ve İzinler</Text>

      {/* 13 Yaş Altı Uyarısı */}
      {needsParentalConsent && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ 13 yaş altı kullanıcılar için veli onayı zorunludur.
            Lütfen bu adımı ebeveynlerinizle birlikte tamamlayın.
          </Text>
        </View>
      )}

      {/* KVKK Metni */}
      <View style={styles.textBox}>
        <ScrollView style={styles.legalText} nestedScrollEnabled>
          <Text style={styles.legalContent}>{KVKK_AYDINLATMA_METNI}</Text>
        </ScrollView>
      </View>

      {/* KVKK Onay */}
      <TouchableOpacity
        style={styles.checkRow}
        onPress={() => setKvkkAccepted(!kvkkAccepted)}
      >
        <View style={[styles.checkbox, kvkkAccepted && styles.checkboxChecked]}>
          {kvkkAccepted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>{RIZA_METNI_B2C}</Text>
      </TouchableOpacity>

      {/* Veli Onayı (gerekirse) */}
      {needsParentalConsent && (
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setParentalAccepted(!parentalAccepted)}
        >
          <View style={[styles.checkbox, parentalAccepted && styles.checkboxChecked]}>
            {parentalAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>{RIZA_METNI_VELI}</Text>
        </TouchableOpacity>
      )}

      {isMinor && !needsParentalConsent && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ 13-18 yaş arası kullanıcı olarak verileriniz özel koruma kapsamındadır.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!kvkkAccepted || (needsParentalConsent && !parentalAccepted)) && styles.continueButtonDisabled
        ]}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Kabul Et ve Devam →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  title: { color: '#F1F5F9', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  warningBox: {
    backgroundColor: '#7C2D12', borderRadius: 12, padding: 16, marginBottom: 16,
  },
  warningText: { color: '#FED7AA', fontSize: 14, lineHeight: 20 },
  textBox: {
    backgroundColor: '#1E293B', borderRadius: 12, marginBottom: 20, overflow: 'hidden',
  },
  legalText: { maxHeight: 200, padding: 16 },
  legalContent: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },
  checkRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: '#475569',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  checkLabel: { color: '#CBD5E1', fontSize: 13, flex: 1, lineHeight: 20 },
  infoBox: {
    backgroundColor: '#1E3A5F', borderRadius: 12, padding: 14, marginBottom: 16,
  },
  infoText: { color: '#93C5FD', fontSize: 13, lineHeight: 18 },
  continueButton: {
    backgroundColor: '#6366F1', borderRadius: 14,
    padding: 16, alignItems: 'center', marginVertical: 24,
  },
  continueButtonDisabled: { opacity: 0.4 },
  continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
```

---

## 4. VERİ SİLME API

```typescript
// apps/web/app/api/account/delete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Önce student kaydını bul
    const { data: student } = await supabase
      .from('students')
      .select('id, tenant_id')
      .eq('auth_user_id', user.id)
      .single();

    if (student && !student.tenant_id) {
      // B2C: Tüm verileri sil (CASCADE ile)
      await supabase.from('students').delete().eq('id', student.id);
    } else if (student && student.tenant_id) {
      // B2B: Sadece pasife al, kurumun analistik verisi için 30 gün sakla
      await supabase.from('students').update({
        is_active: false,
        deletion_requested_at: new Date().toISOString(),
        email: `deleted_${Date.now()}@removed.invalid`,
        full_name: '[Silindi]',
      }).eq('id', student.id);
    }

    // Auth kullanıcısını sil
    await supabase.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

---

## 5. B2B VERİ İŞLEME SÖZLEŞMESİ (Özet)

```markdown
SPRINTA VERİ İŞLEME SÖZLEŞMESİ (VİS)

Taraflar:
- Veri Sorumlusu: [Kurum Adı] (Kurum)
- Veri İşleyen: [Sprinta Şirket Adı] (Sprinta)

İşlenen Veriler:
- Öğrenci kimlik bilgileri (ad, e-posta)
- Performans ve ilerleme verileri

İşleme Amacı:
- Sprinta platformunun sunulması ve kişiselleştirilmesi

Güvenlik Önlemleri:
- Veriler AES-256 şifreleme ile saklanmaktadır
- Supabase altyapısı ISO 27001 sertifikalıdır
- Yıllık güvenlik denetimleri yapılmaktadır

Veri Saklama:
- Aktif abonelik boyunca + sözleşme bitiminden 1 yıl
- Sonrasında kalıcı olarak silinir veya anonimleştirilir

Alt İşleyenler:
- Supabase Inc. (ABD) — Veritabanı altyapısı
- Anthropic PBC (ABD) — AI önerileri (anonimleştirilmiş veri)
- Vercel Inc. (ABD) — Web panel altyapısı

Bu sözleşme, Sprinta B2B hizmet sözleşmesinin ayrılmaz bir parçasıdır.
```

---

## ✅ FAZ 14 TAMAMLANMA KRİTERLERİ

```
✅ KVKK aydınlatma metni uygulama içinde erişilebilir
✅ Kayıt akışı: Açık rıza onayı alınıyor
✅ 13 yaş altı: Ebeveyn onayı zorunlu ekran
✅ 13-18 yaş: Özel koruma bildirimi
✅ Hesap silme API: B2C tamamen sil, B2B anonimleştir
✅ KVKK m.11 hakları için iletişim sayfası (kvkk@sprinta.app)
✅ B2B: Veri İşleme Sözleşmesi şablonu hazır
✅ Alt işleyenler (Supabase, Anthropic, Vercel) dokümante edildi
```
