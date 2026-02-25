# 03 — AUTH & ONBOARDING
## Kimlik Doğrulama, Kayıt Akışı, İlk Deneyim

---

## İÇİNDEKİLER

1. [Auth Mimarisi](#1-auth-mimarisi)
2. [Kayıt Akışları](#2-kayıt-akışları)
3. [Supabase Auth Konfigürasyonu](#3-supabase-auth-konfigürasyonu)
4. [Auth Servisi (TypeScript)](#4-auth-servisi)
5. [Onboarding Adımları](#5-onboarding-adımları)
6. [Ekranlar](#6-ekranlar)
7. [Auth Store (Zustand)](#7-auth-store)

---

## 1. AUTH MİMARİSİ

```
Kayıt türleri:
  B2C (Bireysel)    → Email/şifre veya telefon OTP → students tablosu
  B2B (Kurumsal)    → Email/şifre → Kurum'un tenant'ına bağlı students tablosu
  Tenant Admin       → Email/şifre → tenant_admins tablosu (sadece super admin oluşturur)
  Super Admin        → Email/şifre → super_admins tablosu (manuel ekleme)

Auth akışı:
  1. Supabase Auth → auth.users (kimlik doğrulama)
  2. Trigger → profil tablosunu oluştur (students | tenant_admins)
  3. JWT → custom claims ile rol bilgisi
```

---

## 2. KAYIT AKIŞLARI

### B2C (Bireysel Öğrenci)

```
1. Uygulama aç
2. "Bireysel Kayıt" seç
3. Ad soyad + email + şifre gir
4. Email doğrula (Supabase magic link)
5. Sınıf seviyesini seç (dropdown)
6. Sınav hedefini seç (LGS/TYT/AYT/KPSS/ALES/YDS)
7. → Tanılama testine yönlendir (bkz. 06-TANILAMA-SISTEMI.md)
8. → Ana ekrana geç
```

### B2B (Kurum Öğrencisi)

```
1. Okul/dershane'den email ile davet alır
2. Uygulamayı indir
3. Email + kurum tarafından verilen şifreyle giriş yap
4. İlk girişte şifreyi değiştir (zorunlu)
5. Kısa tanıtım turu
6. → Tanılama testine yönlendir
7. → Ana ekrana geç
```

---

## 3. SUPABASE AUTH KONFİGÜRASYONU

### `supabase/config.toml` (Auth bölümü)

```toml
[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["exp://localhost:8081", "sprinta://auth/callback"]

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.sms]
enable_signup = false

# Geliştirmede email onayı bypass
[auth.email.smtp]
enabled = false  # dev modda email göndermez
```

### Auth Trigger — Yeni kullanıcı kaydı

```sql
-- supabase/migrations/004_functions_triggers.sql (devam)

-- Auth sonrası otomatik profil oluşturma
-- NOT: Bu tetikleyici sadece B2C öğrenci kaydında çalışır.
-- B2B öğrenciler ve adminler super_admin tarafından manuel oluşturulur.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_full_name TEXT;
  v_exam_target exam_type;
  v_grade_level grade_level;
BEGIN
  -- Metadata'dan bilgileri al
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Öğrenci');
  v_exam_target := COALESCE(
    (NEW.raw_user_meta_data->>'exam_target')::exam_type,
    'tyt'
  );
  v_grade_level := COALESCE(
    (NEW.raw_user_meta_data->>'grade_level')::grade_level,
    'lise_11'
  );
  
  -- Sadece B2C öğrenciler için (metadata'da role yoksa)
  IF NEW.raw_user_meta_data->>'role' IS NULL OR
     NEW.raw_user_meta_data->>'role' = 'student' THEN
    
    INSERT INTO students (
      auth_user_id,
      email,
      full_name,
      exam_target,
      grade_level
    ) VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      v_exam_target,
      v_grade_level
    );
    
    -- Boş bilişsel profil oluştur
    INSERT INTO cognitive_profiles (student_id)
    SELECT id FROM students WHERE auth_user_id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 4. AUTH SERVİSİ (TypeScript)

```typescript
// packages/api-client/src/services/auth.ts

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validasyon şemaları
export const RegisterSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı'),
  examTarget: z.enum(['lgs', 'tyt', 'ayt', 'kpss', 'ales', 'yds', 'other']),
  gradeLevel: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Şifre girin'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// Sonuç tipi
type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function createAuthService(supabase: ReturnType<typeof createClient>) {
  return {
    // ── Kayıt ──────────────────────────────────────
    async register(input: RegisterInput): Promise<AuthResult<{ userId: string }>> {
      try {
        const validated = RegisterSchema.parse(input);
        
        const { data, error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            data: {
              full_name: validated.fullName,
              exam_target: validated.examTarget,
              grade_level: validated.gradeLevel,
              role: 'student',
            },
          },
        });
        
        if (error) return { success: false, error: error.message };
        if (!data.user) return { success: false, error: 'Kayıt başarısız' };
        
        return { success: true, data: { userId: data.user.id } };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return { success: false, error: err.errors[0].message };
        }
        return { success: false, error: 'Kayıt sırasında hata oluştu' };
      }
    },

    // ── Giriş ──────────────────────────────────────
    async login(input: LoginInput): Promise<AuthResult<{ session: unknown }>> {
      try {
        const validated = LoginSchema.parse(input);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });
        
        if (error) {
          // Türkçe hata mesajları
          if (error.message.includes('Invalid login credentials')) {
            return { success: false, error: 'Email veya şifre hatalı' };
          }
          if (error.message.includes('Email not confirmed')) {
            return { success: false, error: 'Email adresinizi doğrulamanız gerekiyor' };
          }
          return { success: false, error: error.message };
        }
        
        if (!data.session) return { success: false, error: 'Giriş başarısız' };
        
        return { success: true, data: { session: data.session } };
      } catch (err) {
        return { success: false, error: 'Giriş sırasında hata oluştu' };
      }
    },

    // ── Çıkış ──────────────────────────────────────
    async logout(): Promise<AuthResult<void>> {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) return { success: false, error: error.message };
        return { success: true, data: undefined };
      } catch (err) {
        return { success: false, error: 'Çıkış sırasında hata oluştu' };
      }
    },

    // ── Mevcut kullanıcıyı getir ──────────────────
    async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },

    // ── Şifre sıfırlama ───────────────────────────
    async resetPassword(email: string): Promise<AuthResult<void>> {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'sprinta://auth/reset-password',
        });
        if (error) return { success: false, error: error.message };
        return { success: true, data: undefined };
      } catch (err) {
        return { success: false, error: 'Şifre sıfırlama başarısız' };
      }
    },

    // ── Şifre güncelleme (giriş sonrası zorunlu) ──
    async updatePassword(newPassword: string): Promise<AuthResult<void>> {
      try {
        if (newPassword.length < 8) {
          return { success: false, error: 'Şifre en az 8 karakter olmalı' };
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true, data: undefined };
      } catch (err) {
        return { success: false, error: 'Şifre güncelleme başarısız' };
      }
    },

    // ── Session dinleyicisi ───────────────────────
    onAuthStateChange(callback: (event: string, session: unknown) => void) {
      return supabase.auth.onAuthStateChange(callback);
    },
  };
}
```

---

## 5. ONBOARDING ADIMLARI

### Adım Sırası (B2C)

```
Adım 1 — Karşılama (1 ekran)
  └── "Sprinta'ya hoş geldin!" animasyon
  └── "Hadi başlayalım" butonu

Adım 2 — Temel Bilgiler (1 ekran)
  └── Sınıf seviyesi dropdown
  └── Hedef sınav dropdown
  └── "Devam Et" butonu

Adım 3 — Günlük Hedef (1 ekran)
  └── "Günde kaç dakika çalışmak istersin?"
  └── 10 / 20 / 30 / 45 / 60 dk seçenekleri
  └── "Devam Et" butonu

Adım 4 — Tanılama Daveti (1 ekran)
  └── "Önce seni tanıyalım"
  └── Tanılama neden gerekli — kısa açıklama
  └── "Tanılama Testini Başlat" butonu
  └── "Şimdi değil, sonra başla" link
```

### Adım Sırası (B2B — Kurum Öğrencisi)

```
Adım 1 — İlk Giriş Şifre Değiştirme (zorunlu)
  └── Eski şifre alanı (kurum tarafından verilenin doğrulanması)
  └── Yeni şifre alanı
  └── Şifre tekrarı
  └── "Güncelle" butonu

Adım 2 — Uygulama Turu (3 swipe ekranı)
  └── Hız, Anlama, Dikkat modüllerine kısa bakış

Adım 3 — Tanılama Daveti
  └── (B2C ile aynı)
```

---

## 6. EKRANLAR

### `apps/mobile/app/(auth)/register.tsx`

```tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/authStore';

const EXAM_OPTIONS = [
  { value: 'lgs',  label: 'LGS (8. Sınıf)' },
  { value: 'tyt',  label: 'TYT (Üniversite 1. Aşama)' },
  { value: 'ayt',  label: 'AYT (Üniversite 2. Aşama)' },
  { value: 'kpss', label: 'KPSS (Kamu)' },
  { value: 'ales', label: 'ALES (Lisansüstü)' },
  { value: 'yds',  label: 'YDS (Yabancı Dil)' },
];

const GRADE_OPTIONS = [
  { value: 'ortaokul_8', label: '8. Sınıf' },
  { value: 'lise_9',     label: '9. Sınıf' },
  { value: 'lise_10',    label: '10. Sınıf' },
  { value: 'lise_11',    label: '11. Sınıf' },
  { value: 'lise_12',    label: '12. Sınıf' },
  { value: 'universite', label: 'Üniversite' },
  { value: 'yetiskin',   label: 'Mezun / Yetişkin' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    examTarget: 'tyt',
    gradeLevel: 'lise_11',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function validate() {
    const newErrors: Partial<typeof form> = {};
    if (!form.fullName || form.fullName.trim().length < 2) {
      newErrors.fullName = 'Ad soyad en az 2 karakter olmalı';
    }
    if (!form.email || !form.email.includes('@')) {
      newErrors.email = 'Geçerli bir email girin';
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalı';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const result = await register(form);

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(onboarding)/daily-goal');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Kayıt Başarısız', result.error);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Hesap Oluştur</Text>
      <Text style={styles.subtitle}>Sınav başarın için ilk adım</Text>

      {/* Ad Soyad */}
      <View style={styles.field}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          placeholder="Adın ve soyadın"
          value={form.fullName}
          onChangeText={v => setForm(f => ({ ...f, fullName: v }))}
          autoCapitalize="words"
        />
        {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}
      </View>

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="ornek@email.com"
          value={form.email}
          onChangeText={v => setForm(f => ({ ...f, email: v.toLowerCase() }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      </View>

      {/* Şifre */}
      <View style={styles.field}>
        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="En az 8 karakter"
          value={form.password}
          onChangeText={v => setForm(f => ({ ...f, password: v }))}
          secureTextEntry
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      </View>

      {/* Sınıf Seçimi */}
      <View style={styles.field}>
        <Text style={styles.label}>Sınıf Seviyesi</Text>
        <View style={styles.optionGrid}>
          {GRADE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionChip,
                form.gradeLevel === opt.value && styles.optionChipSelected
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setForm(f => ({ ...f, gradeLevel: opt.value }));
              }}
            >
              <Text style={[
                styles.optionChipText,
                form.gradeLevel === opt.value && styles.optionChipTextSelected
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sınav Hedefi */}
      <View style={styles.field}>
        <Text style={styles.label}>Hedef Sınav</Text>
        <View style={styles.optionGrid}>
          {EXAM_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionChip,
                form.examTarget === opt.value && styles.optionChipSelected
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setForm(f => ({ ...f, examTarget: opt.value }));
              }}
            >
              <Text style={[
                styles.optionChipText,
                form.examTarget === opt.value && styles.optionChipTextSelected
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Kaydediliyor...' : 'Devam Et →'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.loginLinkText}>
          Zaten hesabın var mı? <Text style={styles.loginLinkBold}>Giriş yap</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 48,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#F1F5F9',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  optionChipSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#312E81',
  },
  optionChipText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  optionChipTextSelected: {
    color: '#A5B4FC',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  loginLinkText: {
    color: '#64748B',
    fontSize: 14,
  },
  loginLinkBold: {
    color: '#6366F1',
    fontWeight: '600',
  },
});
```

### `apps/mobile/app/(auth)/login.tsx`

```tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Eksik Bilgi', 'Email ve şifrenizi girin');
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Giriş Başarısız', result.error);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Tekrar Hoş Geldin</Text>
      <Text style={styles.subtitle}>Hesabına giriş yap</Text>

      <TextInput
        style={styles.input}
        placeholder="Email adresi"
        placeholderTextColor="#64748B"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#64748B"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={() => router.push('/(auth)/forgot-password')}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(auth)/register')}
        style={styles.registerLink}
      >
        <Text style={styles.registerLinkText}>
          Hesabın yok mu? <Text style={styles.registerLinkBold}>Kayıt ol</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#F1F5F9', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 40 },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#F1F5F9',
    marginBottom: 16,
  },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: '#6366F1', fontSize: 14 },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  registerLink: { alignItems: 'center' },
  registerLinkText: { color: '#64748B', fontSize: 14 },
  registerLinkBold: { color: '#6366F1', fontWeight: '600' },
});
```

---

## 7. AUTH STORE (Zustand)

```typescript
// apps/mobile/src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { createClient } from '@supabase/supabase-js';
import { createAuthService } from '@sprinta/api';

const storage = new MMKV({ id: 'auth-storage' });

// MMKV → Zustand persist adapter
const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface Student {
  id: string;
  email: string;
  fullName: string;
  examTarget: string;
  gradeLevel: string;
  isActive: boolean;
  isPremium: boolean;
  hasCompletedDiagnostic: boolean;
  currentArp: number;
  totalXp: number;
  level: number;
  streakDays: number;
}

interface AuthState {
  student: Student | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    examTarget: string;
    gradeLevel: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  login: (input: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Student>) => void;
}

// Supabase client (mobile)
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

const authService = createAuthService(supabase);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      student: null,
      isLoading: false,
      isAuthenticated: false,

      register: async (input) => {
        set({ isLoading: true });
        try {
          const result = await authService.register(input);
          if (!result.success) {
            return { success: false, error: result.error };
          }

          // Profili getir
          await get().refreshProfile();
          set({ isAuthenticated: true });
          return { success: true };
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (input) => {
        set({ isLoading: true });
        try {
          const result = await authService.login(input);
          if (!result.success) {
            return { success: false, error: result.error };
          }

          // Profili getir
          await get().refreshProfile();
          set({ isAuthenticated: true });
          return { success: true };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({ student: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      refreshProfile: async () => {
        try {
          const { data, error } = await supabase
            .from('students')
            .select(`
              id, email, full_name, exam_target, grade_level,
              is_active, is_premium, has_completed_diagnostic,
              current_arp, total_xp, level, streak_days
            `)
            .single();
            
          if (error || !data) return;
          
          set({
            student: {
              id: data.id,
              email: data.email,
              fullName: data.full_name,
              examTarget: data.exam_target,
              gradeLevel: data.grade_level,
              isActive: data.is_active,
              isPremium: data.is_premium,
              hasCompletedDiagnostic: data.has_completed_diagnostic,
              currentArp: data.current_arp,
              totalXp: data.total_xp,
              level: data.level,
              streakDays: data.streak_days,
            },
          });
        } catch (err) {
          console.error('Profil yüklenirken hata:', err);
        }
      },

      updateProfile: (updates) => {
        const current = get().student;
        if (current) {
          set({ student: { ...current, ...updates } });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        student: state.student,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## 8. ROUTING YAPISI

```typescript
// apps/mobile/app/_layout.tsx

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, student } = useAuthStore();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      // Auth değilse login'e yönlendir
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !student?.hasCompletedDiagnostic && !inOnboarding) {
      // Tanılama tamamlanmamışsa onboarding'e yönlendir
      router.replace('/(onboarding)/welcome');
    } else if (isAuthenticated && student?.hasCompletedDiagnostic && (inAuthGroup || inOnboarding)) {
      // Her şey tamam, ana ekrana
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, student?.hasCompletedDiagnostic]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

---

## ✅ FAZ 03 TAMAMLANMA KRİTERLERİ

```
✅ Kayıt: Yeni öğrenci oluşturuluyor, students tablosuna kaydediliyor
✅ Giriş: Email/şifre ile giriş başarılı
✅ Çıkış: Session temizleniyor
✅ Auth Guard: Giriş yapılmadan (tabs) ekranlarına ulaşılamıyor
✅ Onboarding yönlendirme: Tanılama tamamlanmamışsa onboarding ekranı açılıyor
✅ Haptic feedback: Başarı/hata durumlarında çalışıyor
✅ Hata mesajları: Türkçe gösteriliyor
✅ MMKV persist: Uygulama kapatılıp açılınca oturum devam ediyor
```
