# 09 — ÖDEME & ABONELİK
## RevenueCat B2C + B2B Fiyatlandırma

---

## 1. B2C — REVENUECat ENTEGRASYONu

```typescript
// packages/api-client/src/services/purchases.ts

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY = Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!
  : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!;

export const PurchasesService = {
  async initialize(userId: string) {
    await Purchases.configure({ apiKey: API_KEY });
    await Purchases.logIn(userId);
  },

  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? [];
    } catch {
      return [];
    }
  },

  async purchase(pkg: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { success: true, customerInfo };
    } catch (err: unknown) {
      const e = err as { userCancelled?: boolean; message?: string };
      if (e.userCancelled) return { success: false, error: 'cancelled' };
      return { success: false, error: e.message ?? 'Satın alma başarısız' };
    }
  },

  async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, customerInfo };
    } catch (err: unknown) {
      return { success: false, error: String(err) };
    }
  },

  async isPremium(): Promise<boolean> {
    try {
      const info = await Purchases.getCustomerInfo();
      return info.entitlements.active['premium'] !== undefined;
    } catch {
      return false;
    }
  },
};
```

---

## 2. PAYWALL EKRANI

```tsx
// apps/mobile/app/(modals)/paywall.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PurchasesService } from '@sprinta/api';
import type { PurchasesPackage } from 'react-native-purchases';

const FEATURES = [
  '✅ 4 modülün tamamı',
  '✅ Sınırsız günlük egzersiz',
  '✅ AI kişisel koç önerileri',
  '✅ Haftalık AI raporu',
  '✅ Detaylı ARP istatistikleri',
  '✅ Tüm rozetler ve ödüller',
  '✅ Offline mod',
];

export default function PaywallScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    PurchasesService.getOfferings().then(pkgs => {
      setPackages(pkgs);
      if (pkgs.length > 0) setSelected(pkgs[0].identifier);
    });
  }, []);

  async function handlePurchase() {
    if (!selected) return;
    const pkg = packages.find(p => p.identifier === selected);
    if (!pkg) return;

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await PurchasesService.purchase(pkg);
    setIsLoading(false);

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('🎉 Premium Aktif!', 'Tüm özellikler açıldı.');
      router.back();
    } else if (result.error !== 'cancelled') {
      Alert.alert('Hata', result.error ?? 'Satın alma başarısız');
    }
  }

  async function handleRestore() {
    setIsLoading(true);
    const result = await PurchasesService.restorePurchases();
    setIsLoading(false);

    if (result.success) {
      const isPremium = await PurchasesService.isPremium();
      if (isPremium) {
        Alert.alert('✅', 'Aboneliğin geri yüklendi!');
        router.back();
      } else {
        Alert.alert('Bulunamadı', 'Aktif abonelik bulunamadı.');
      }
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.title}>SPRINTA Premium</Text>
      <Text style={styles.subtitle}>
        Sınav başarısı için maksimum hız
      </Text>

      {/* Özellikler */}
      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <Text key={i} style={styles.feature}>{f}</Text>
        ))}
      </View>

      {/* Paket Seçimi */}
      <View style={styles.packages}>
        {packages.map(pkg => {
          const isMonthly = pkg.identifier.includes('monthly');
          return (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.packageCard,
                selected === pkg.identifier && styles.packageCardSelected,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelected(pkg.identifier);
              }}
            >
              {!isMonthly && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>%37 TASARRUF</Text>
                </View>
              )}
              <Text style={styles.packageName}>
                {isMonthly ? 'Aylık' : 'Yıllık'}
              </Text>
              <Text style={styles.packagePrice}>
                {pkg.product.priceString}
              </Text>
              <Text style={styles.packagePer}>
                {isMonthly ? '/ay' : '/yıl'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Satın Al */}
      <TouchableOpacity
        style={[styles.purchaseButton, isLoading && styles.purchaseButtonDisabled]}
        onPress={handlePurchase}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.purchaseButtonText}>Premium'a Geç →</Text>
        )}
      </TouchableOpacity>

      {/* Geri Yükle */}
      <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
        <Text style={styles.restoreText}>Satın almayı geri yükle</Text>
      </TouchableOpacity>

      <Text style={styles.legal}>
        Abonelik, App Store / Google Play hesabınızdan tahsil edilir.
        İstediğiniz zaman iptal edebilirsiniz.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  closeButton: {
    position: 'absolute', top: 16, right: 16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  closeText: { color: '#64748B', fontSize: 14 },
  title: {
    fontSize: 28, fontWeight: '800', color: '#F1F5F9',
    textAlign: 'center', marginTop: 40,
  },
  subtitle: {
    color: '#94A3B8', fontSize: 16, textAlign: 'center',
    marginTop: 8, marginBottom: 24,
  },
  features: { marginBottom: 24, gap: 10 },
  feature: { color: '#CBD5E1', fontSize: 15 },
  packages: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  packageCard: {
    flex: 1, backgroundColor: '#1E293B', borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#334155',
    position: 'relative',
  },
  packageCardSelected: { borderColor: '#6366F1', backgroundColor: '#1E1B4B' },
  popularBadge: {
    position: 'absolute', top: -10,
    backgroundColor: '#6366F1', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  popularText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  packageName: { color: '#94A3B8', fontSize: 13, marginTop: 12 },
  packagePrice: { color: '#F1F5F9', fontSize: 22, fontWeight: '800', marginTop: 4 },
  packagePer: { color: '#64748B', fontSize: 12 },
  purchaseButton: {
    backgroundColor: '#6366F1', borderRadius: 14,
    padding: 18, alignItems: 'center', marginBottom: 12,
  },
  purchaseButtonDisabled: { opacity: 0.6 },
  purchaseButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  restoreButton: { alignItems: 'center', marginBottom: 12 },
  restoreText: { color: '#475569', fontSize: 13 },
  legal: {
    color: '#334155', fontSize: 11, textAlign: 'center',
    lineHeight: 18, marginBottom: 40,
  },
});
```

---

## 3. PREMIUM GATE HOOK

```typescript
// apps/mobile/src/hooks/usePremiumGate.ts

import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export function usePremiumGate() {
  const { student } = useAuthStore();
  const router = useRouter();

  /**
   * Premium özellik için erişim kontrolü.
   * Premium değilse paywall'a yönlendirir.
   */
  function requirePremium(onAllow: () => void) {
    if (student?.isPremium) {
      onAllow();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push('/(modals)/paywall');
    }
  }

  return { isPremium: student?.isPremium ?? false, requirePremium };
}
```

---

## ✅ FAZ 09 TAMAMLANMA KRİTERLERİ

```
✅ RevenueCat SDK başlatılıyor
✅ Paket teklifleri API'dan çekiliyor
✅ Satın alma akışı çalışıyor (iOS + Android)
✅ Geri yükleme çalışıyor
✅ usePremiumGate: Premium değil → paywall'a yönlendir
✅ Premium özellikler (RSVP hız burst, çıkarım, vb.) kapılı
✅ FREE kısıtlamalar: günde 3 egzersiz, 1 modül
```
