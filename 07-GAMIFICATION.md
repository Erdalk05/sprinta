# 07 — GAMİFİCATİON
## XP, Seviye, Rozet, Seri, Liderlik Tablosu

---

## 1. XP & SEVİYE SİSTEMİ

```typescript
// packages/shared/src/constants/levels.ts

// Seviye → Gerekli toplam XP
export const LEVEL_XP_THRESHOLDS = [
  0,      // Lv 1
  200,    // Lv 2
  500,    // Lv 3
  1000,   // Lv 4
  2000,   // Lv 5
  3500,   // Lv 6
  5500,   // Lv 7
  8000,   // Lv 8
  11000,  // Lv 9
  15000,  // Lv 10
  20000,  // Lv 11
  27000,  // Lv 12
  36000,  // Lv 13
  47000,  // Lv 14
  60000,  // Lv 15 (MAX)
];

export const LEVEL_NAMES = [
  '', 'Başlangıç', 'Aday', 'Takipçi', 'Çalışkan', 'Azimli',
  'Yetenekli', 'İleri', 'Uzman', 'Usta', 'Şampiyon',
  'Elit', 'Efsane', 'Üstat', 'Mitos', 'Titan',
];

export function getLevelFromXp(totalXp: number): number {
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpToNextLevel(totalXp: number): {
  current: number;
  required: number;
  percent: number;
} {
  const level = getLevelFromXp(totalXp);
  if (level >= LEVEL_XP_THRESHOLDS.length) {
    return { current: 0, required: 0, percent: 100 };
  }
  const currentThreshold = LEVEL_XP_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_XP_THRESHOLDS[level];
  const current = totalXp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  return {
    current,
    required,
    percent: Math.round((current / required) * 100),
  };
}
```

---

## 2. ROZETLERİ KONTROL ET

```typescript
// packages/api-client/src/services/badgeService.ts

import { createClient } from '@supabase/supabase-js';

export function createBadgeService(
  supabase: ReturnType<typeof createClient>
) {
  return {
    /**
     * Session tamamlandıktan sonra kazanılan rozetleri kontrol et
     */
    async checkAndAwardBadges(
      studentId: string,
      context: {
        sessionsCount: number;
        streakDays: number;
        currentArp: number;
        comprehension: number;
        hasCompletedDiagnostic: boolean;
      }
    ): Promise<string[]> {  // Kazanılan rozet adları
      
      // Tüm aktif rozetleri getir
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true);

      // Zaten kazanılanları getir
      const { data: earnedBadges } = await supabase
        .from('student_badges')
        .select('badge_id')
        .eq('student_id', studentId);

      const earnedIds = new Set(earnedBadges?.map(b => b.badge_id) ?? []);
      const newlyEarned: string[] = [];

      for (const badge of allBadges ?? []) {
        if (earnedIds.has(badge.id)) continue;  // Zaten kazanılmış

        let earned = false;

        switch (badge.condition_type) {
          case 'sessions_count':
            earned = context.sessionsCount >= badge.condition_value;
            break;
          case 'streak_days':
            earned = context.streakDays >= badge.condition_value;
            break;
          case 'arp_reach':
            earned = context.currentArp >= badge.condition_value;
            break;
          case 'comprehension_reach':
            earned = context.comprehension >= badge.condition_value;
            break;
          case 'diagnostic':
            earned = context.hasCompletedDiagnostic;
            break;
        }

        if (earned) {
          // Rozeti ver
          await supabase.from('student_badges').insert({
            student_id: studentId,
            badge_id: badge.id,
          });

          // XP ekle
          await supabase.rpc('add_xp', {
            p_student_id: studentId,
            p_xp: badge.xp_reward,
          });

          newlyEarned.push(badge.name);
        }
      }

      return newlyEarned;
    },

    /**
     * Öğrencinin tüm rozetlerini getir
     */
    async getStudentBadges(studentId: string) {
      const { data } = await supabase
        .from('student_badges')
        .select(`
          earned_at,
          badge:badges (
            id, code, name, description, icon_name,
            color, category, rarity, xp_reward
          )
        `)
        .eq('student_id', studentId)
        .order('earned_at', { ascending: false });

      return data ?? [];
    },
  };
}
```

### SQL: XP Ekleme Fonksiyonu

```sql
-- supabase/migrations/004_functions_triggers.sql (devam)

CREATE OR REPLACE FUNCTION add_xp(
  p_student_id UUID,
  p_xp INTEGER
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  SELECT total_xp INTO v_current_xp FROM students WHERE id = p_student_id;
  v_new_xp := v_current_xp + p_xp;
  
  -- Seviye hesapla (basit threshold)
  v_new_level := CASE
    WHEN v_new_xp >= 60000 THEN 15
    WHEN v_new_xp >= 47000 THEN 14
    WHEN v_new_xp >= 36000 THEN 13
    WHEN v_new_xp >= 27000 THEN 12
    WHEN v_new_xp >= 20000 THEN 11
    WHEN v_new_xp >= 15000 THEN 10
    WHEN v_new_xp >= 11000 THEN 9
    WHEN v_new_xp >= 8000  THEN 8
    WHEN v_new_xp >= 5500  THEN 7
    WHEN v_new_xp >= 3500  THEN 6
    WHEN v_new_xp >= 2000  THEN 5
    WHEN v_new_xp >= 1000  THEN 4
    WHEN v_new_xp >= 500   THEN 3
    WHEN v_new_xp >= 200   THEN 2
    ELSE 1
  END;
  
  UPDATE students
  SET total_xp = v_new_xp, level = v_new_level
  WHERE id = p_student_id;
END;
$$;
```

---

## 3. SERİ SİSTEMİ

```typescript
// packages/api-client/src/services/streakService.ts

import { createClient } from '@supabase/supabase-js';

export function createStreakService(
  supabase: ReturnType<typeof createClient>
) {
  return {
    /**
     * Günlük seri güncelle (her gün ilk session sonrası çağır)
     */
    async updateStreak(studentId: string): Promise<{
      streakDays: number;
      longestStreak: number;
      streakBroken: boolean;
    }> {
      const { data: student } = await supabase
        .from('students')
        .select('streak_days, longest_streak, last_activity_at')
        .eq('id', studentId)
        .single();

      if (!student) return { streakDays: 0, longestStreak: 0, streakBroken: false };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActivity = student.last_activity_at
        ? new Date(student.last_activity_at)
        : null;
      
      let newStreak = student.streak_days;
      let streakBroken = false;

      if (!lastActivity) {
        // İlk aktivite
        newStreak = 1;
      } else {
        const lastDay = new Date(lastActivity);
        lastDay.setHours(0, 0, 0, 0);
        const dayDiff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff === 0) {
          // Bugün zaten aktif — değişiklik yok
        } else if (dayDiff === 1) {
          // Dün de aktifti — seri devam
          newStreak += 1;
        } else {
          // Boşluk var — seri sıfırla
          newStreak = 1;
          streakBroken = student.streak_days > 3;  // 3+ günlük seri kırıldıysa bildir
        }
      }

      const newLongest = Math.max(newStreak, student.longest_streak);

      await supabase
        .from('students')
        .update({
          streak_days: newStreak,
          longest_streak: newLongest,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', studentId);

      return { streakDays: newStreak, longestStreak: newLongest, streakBroken };
    },
  };
}
```

---

## 4. EGZERSİZ SONUÇ EKRANI

```tsx
// apps/mobile/app/exercise-result.tsx

import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function ExerciseResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    arp: string;
    xpEarned: string;
    arpChange: string;
    fatigueLevel: string;
    shouldBreak: string;
    newBadges?: string;  // JSON string
  }>();

  const arp = parseInt(params.arp ?? '0');
  const xpEarned = parseInt(params.xpEarned ?? '0');
  const arpChange = parseFloat(params.arpChange ?? '0');
  const fatigueLevel = params.fatigueLevel ?? 'fresh';
  const shouldBreak = params.shouldBreak === 'true';
  const newBadges: string[] = params.newBadges ? JSON.parse(params.newBadges) : [];

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 100, friction: 5, useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const arpChangeText = arpChange > 0
    ? `↑ +${arpChange.toFixed(0)}`
    : arpChange < 0
    ? `↓ ${arpChange.toFixed(0)}`
    : '→ 0';

  const arpChangeColor = arpChange > 0 ? '#10B981' : arpChange < 0 ? '#EF4444' : '#64748B';

  return (
    <ScrollView style={styles.container}>
      {/* ARP Animasyonu */}
      <Animated.View style={[styles.arpContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.arpLabel}>ARP</Text>
        <Text style={styles.arpValue}>{arp}</Text>
        <Text style={[styles.arpChange, { color: arpChangeColor }]}>{arpChangeText}</Text>
      </Animated.View>

      {/* XP Kazanıldı */}
      <Animated.View style={[styles.xpBanner, { opacity: fadeAnim }]}>
        <Text style={styles.xpText}>+{xpEarned} XP 🎉</Text>
      </Animated.View>

      {/* Yeni Rozetler */}
      {newBadges.length > 0 && (
        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>🏆 Yeni Rozet!</Text>
          {newBadges.map((badge, i) => (
            <Text key={i} style={styles.badgeName}>{badge}</Text>
          ))}
        </View>
      )}

      {/* Yorgunluk Uyarısı */}
      {shouldBreak && (
        <View style={styles.breakWarning}>
          <Text style={styles.breakTitle}>😴 Mola Zamanı</Text>
          <Text style={styles.breakDesc}>
            {fatigueLevel === 'exhausted'
              ? '30 dakika mola ver, performansın çok düştü.'
              : '15 dakika dinlen, çok daha verimli olursun.'}
          </Text>
        </View>
      )}

      {/* Butonlar */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.back()}
      >
        <Text style={styles.nextButtonText}>
          {shouldBreak ? '💤 Mola Ver' : '▶ Devam Et'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  arpContainer: {
    alignItems: 'center', justifyContent: 'center',
    marginTop: 80, marginBottom: 24,
  },
  arpLabel: { color: '#64748B', fontSize: 16, fontWeight: '600', letterSpacing: 2 },
  arpValue: { color: '#6366F1', fontSize: 80, fontWeight: '900', lineHeight: 90 },
  arpChange: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  xpBanner: {
    backgroundColor: '#312E81', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 16,
  },
  xpText: { color: '#A5B4FC', fontSize: 22, fontWeight: '700' },
  badgesContainer: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 16,
    alignItems: 'center',
  },
  badgesTitle: { color: '#F59E0B', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  badgeName: { color: '#F1F5F9', fontSize: 16, marginBottom: 4 },
  breakWarning: {
    backgroundColor: '#7C2D12', borderRadius: 16, padding: 20, marginBottom: 16,
  },
  breakTitle: { color: '#FED7AA', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  breakDesc: { color: '#FCA5A5', fontSize: 15, lineHeight: 22 },
  nextButton: {
    backgroundColor: '#6366F1', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  homeButton: {
    borderWidth: 1, borderColor: '#334155', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 40,
  },
  homeButtonText: { color: '#64748B', fontSize: 15 },
});
```

---

## 5. ANA EKRAN (Tabs — Dashboard)

```tsx
// apps/mobile/app/(tabs)/index.tsx

import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { getLevelFromXp, getXpToNextLevel, LEVEL_NAMES } from '@sprinta/shared';
import { EXAM_ARP_TARGETS } from '@sprinta/shared';

const MODULE_CARDS = [
  { code: 'speed_control',      icon: '⚡', title: 'Hız Kontrolü',    color: '#6366F1' },
  { code: 'deep_comprehension', icon: '🧠', title: 'Derin Kavrama',   color: '#10B981' },
  { code: 'attention_power',    icon: '🎯', title: 'Dikkat Gücü',     color: '#F59E0B' },
  { code: 'mental_reset',       icon: '🌊', title: 'Zihin Sıfırla',   color: '#06B6D4' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { student, refreshProfile } = useAuthStore();

  useEffect(() => {
    refreshProfile();
  }, []);

  if (!student) return null;

  const level = getLevelFromXp(student.totalXp);
  const xpProgress = getXpToNextLevel(student.totalXp);
  const levelName = LEVEL_NAMES[level] ?? 'Titan';
  
  const examTarget = EXAM_ARP_TARGETS[student.examTarget] ?? EXAM_ARP_TARGETS.tyt;
  const arpProgress = Math.min(100, Math.round((student.currentArp / examTarget.target) * 100));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Karşılama */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {student.fullName.split(' ')[0]} 👋</Text>
          <Text style={styles.subgreeting}>
            {student.streakDays > 0
              ? `🔥 ${student.streakDays} günlük seri`
              : 'Bugün çalışmaya başla!'}
          </Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{level}</Text>
          <Text style={styles.levelName}>{levelName}</Text>
        </View>
      </View>

      {/* XP Çubuğu */}
      <View style={styles.xpBar}>
        <View style={styles.xpBarFill}>
          <View
            style={[styles.xpBarProgress, { width: `${xpProgress.percent}%` }]}
          />
        </View>
        <Text style={styles.xpText}>
          {xpProgress.current} / {xpProgress.required} XP
        </Text>
      </View>

      {/* ARP Kartı */}
      <View style={styles.arpCard}>
        <View>
          <Text style={styles.arpLabel}>Güncel ARP</Text>
          <Text style={styles.arpValue}>{student.currentArp.toFixed(0)}</Text>
        </View>
        <View style={styles.arpTarget}>
          <Text style={styles.arpTargetLabel}>
            {student.examTarget.toUpperCase()} Hedefi
          </Text>
          <Text style={styles.arpTargetValue}>{examTarget.target}</Text>
          <View style={styles.arpProgress}>
            <View style={[styles.arpProgressFill, { width: `${arpProgress}%` }]} />
          </View>
          <Text style={styles.arpProgressText}>%{arpProgress}</Text>
        </View>
      </View>

      {/* Modüller */}
      <Text style={styles.sectionTitle}>Modüller</Text>
      <View style={styles.moduleGrid}>
        {MODULE_CARDS.map(mod => (
          <TouchableOpacity
            key={mod.code}
            style={[styles.moduleCard, { borderTopColor: mod.color, borderTopWidth: 3 }]}
            onPress={() => router.push(`/(tabs)/modules/${mod.code}`)}
          >
            <Text style={styles.moduleIcon}>{mod.icon}</Text>
            <Text style={styles.moduleName}>{mod.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginTop: 60, marginBottom: 16,
  },
  greeting: { color: '#F1F5F9', fontSize: 22, fontWeight: '700' },
  subgreeting: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  levelBadge: {
    backgroundColor: '#312E81', borderRadius: 12, padding: 10, alignItems: 'center',
  },
  levelText: { color: '#A5B4FC', fontSize: 16, fontWeight: '800' },
  levelName: { color: '#6366F1', fontSize: 11, marginTop: 2 },
  xpBar: { marginBottom: 20 },
  xpBarFill: { height: 8, backgroundColor: '#1E293B', borderRadius: 4, marginBottom: 4 },
  xpBarProgress: { height: 8, backgroundColor: '#6366F1', borderRadius: 4 },
  xpText: { color: '#475569', fontSize: 12 },
  arpCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  arpLabel: { color: '#64748B', fontSize: 12 },
  arpValue: { color: '#6366F1', fontSize: 44, fontWeight: '800' },
  arpTarget: { alignItems: 'flex-end' },
  arpTargetLabel: { color: '#64748B', fontSize: 11 },
  arpTargetValue: { color: '#94A3B8', fontSize: 20, fontWeight: '700' },
  arpProgress: {
    width: 80, height: 4, backgroundColor: '#334155', borderRadius: 2, marginVertical: 4,
  },
  arpProgressFill: { height: 4, backgroundColor: '#10B981', borderRadius: 2 },
  arpProgressText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  moduleGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40,
  },
  moduleCard: {
    width: '47%', backgroundColor: '#1E293B', borderRadius: 16,
    padding: 20, alignItems: 'center',
  },
  moduleIcon: { fontSize: 32, marginBottom: 8 },
  moduleName: { color: '#CBD5E1', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
```

---

## ✅ FAZ 07 TAMAMLANMA KRİTERLERİ

```
✅ XP egzersiz sonrası ekleniyor
✅ Seviye otomatik güncelleniyor (add_xp RPC)
✅ Rozet kontrol servisi çalışıyor
✅ Yeni rozet kazanıldığında sonuç ekranında gösteriliyor
✅ Seri günlük güncelleniyor
✅ Seri kırıldığında kullanıcı bilgilendiriliyor
✅ Ana ekran: ARP, XP, seri, modüller gösteriliyor
✅ Sonuç ekranı: ARP değişimi animasyonlu gösteriliyor
```
