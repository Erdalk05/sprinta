# SPRINTA — Claude Code Skill
# Türkçe Görsel Bilişsel Performans Platformu
# "Oku. Anla. Kazan."

## ⚡ BU SKILL'İ OKUDUĞUNDA YAPACAKLARIN

1. Aşağıdaki PROJE BAĞLAMINI tamamen anla
2. İstenen dosyayı yaz veya görevi tamamla
3. Her kod bloğunda KURALLARA uy
4. Bitince docs/STATUS.md güncelle

---

## 🏗️ MİMARİ

```
sprinta/                        ← pnpm workspace monorepo
├── apps/
│   ├── mobile/                 ← Expo SDK 54 (öğrenci uygulaması)
│   └── web/                    ← Next.js 16 App Router (admin paneller)
├── packages/
│   ├── shared/                 ← @sprinta/shared  (tipler, engine, sabitler)
│   └── api-client/             ← @sprinta/api     (Supabase servis katmanı)
└── supabase/
    ├── migrations/             ← SQL migration dosyaları
    └── functions/              ← Deno Edge Functions
```

**Tech Stack:**
- Mobile: Expo 54.0.33 / React Native 0.81.5 / expo-router 6.0.23
- Web: Next.js 16.1.5 / Tailwind CSS 4.2.0
- Backend: Supabase 2.43.0 (PostgreSQL + Auth + Edge Functions)
- State: Zustand + MMKV
- Validation: Zod (tüm formlarda zorunlu)
- Payments: RevenueCat
- AI: Claude 3 Haiku (Anthropic Edge Function)

---

## 🎯 KPI SİSTEMİ (ANA METRİKLER)

```typescript
REI = sustainable_wpm × (comprehension / 100)
CSF = 1 − (error_rate + regression_rate + fatigue_index) / 3
ARP = REI × CSF  // ← ASIL KPI

// Sınav hedefleri:
LGS  → 180 ARP   TYT  → 240 ARP
AYT  → 280 ARP   KPSS → 290 ARP
```

---

## 👥 ROLLER

```
SUPER_ADMIN   → admin.sprinta.app  (Sprinta ekibi, tüm tenantları görür)
TENANT_ADMIN  → panel.sprinta.app  (Okul/dershane yöneticisi)
STUDENT       → mobile app only    (Öğrenci)
```

**Multi-tenant:** Her tabloda `tenant_id` + RLS. Cross-tenant erişim YASAK.

---

## 💰 FİYATLANDIRMA

```
B2C:  FREE (1 modül) | PREMIUM 79.99₺/ay | 599.99₺/yıl
B2B:  STARTER 49₺/öğ/yıl | PROFESYONEL 39₺ | KURUMSAL 29₺
```

---

## 📋 DOKÜMAN HARİTASI

Her görev için ilgili dokümanı oku:

| Görev | Doküman |
|-------|---------|
| Monorepo kurulumu | `docs/01-PROJE-KURULUMU.md` |
| Veritabanı şeması | `docs/02-DATABASE-SCHEMA.md` |
| Auth / Kayıt / Giriş | `docs/03-AUTH-ONBOARDING.md` |
| ARP/REI/CSF motoru | `docs/04-PERFORMANCE-ENGINE.md` |
| Eğitim modülleri | `docs/05-MODULLER.md` |
| Tanılama sistemi | `docs/06-TANILAMA-SISTEMI.md` |
| Gamification (XP/rozet) | `docs/07-GAMIFICATION.md` |
| AI Coach (Haiku) | `docs/08-AI-COACH.md` |
| Ödeme / RevenueCat | `docs/09-ODEME-ABONELIK.md` |
| B2B Admin Panel | `docs/10-B2B-ADMIN-PANEL.md` |
| Super Admin Panel | `docs/11-SUPER-ADMIN.md` |
| Deploy / CI-CD | `docs/12-DEPLOY-CICD.md` |
| İçerik kütüphanesi | `docs/13-ICERIK-KUTUPHANESI.md` |
| KVKK / Hukuki | `docs/14-KVKK-HUKUK.md` |

**KURAL:** Bir göreve başlamadan önce ilgili dokümanı oku. `read_file("docs/XX-...")` ile aç.

---

## ⚠️ ZORUNLU KOD KURALLARI

```
✅ TypeScript strict — 'any' YASAK, her şey tipli
✅ Zod schema — tüm form input validasyonları
✅ RLS policy — her yeni tablo için zorunlu
✅ try/catch — tüm Supabase çağrıları
✅ MMKV — offline-first state persistance
✅ Haptic feedback — tüm kullanıcı aksiyonları
✅ Türkçe error mesajları — kullanıcıya gösterilen tüm hatalar
✅ KVKK — 13 yaş altı için veli onayı kontrolü
```

---

## 🗄️ KRİTİK VERİTABANI TABLOLARI

```sql
students          -- auth_user_id, tenant_id, baseline_arp, current_arp, xp, level
cognitive_profiles-- student_id, sustainable_wpm, rei, csf, arp, stability_index
tenants           -- id, name, type, tier, max_students
sessions          -- student_id, module_code, metrics JSONB, arp, csf, rei
diagnostics       -- student_id, baseline_arp, weaknesses JSONB
daily_stats       -- student_id, date, sessions_count, arp_avg
badges            -- id, code, name, criteria JSONB
content_library   -- id, tenant_id, flesch_score, questions JSONB
```

**RLS Yardımcı Fonksiyonları (public schema):**
```sql
get_student_id()    get_tenant_id()    is_tenant_admin()
is_super_admin()    get_admin_tenant_id()
```

---

## 🔄 UYGULAMA SIRASI

```
01 → Monorepo kur          07 → Gamification
02 → DB migration çalıştır 08 → AI Coach
03 → Auth implement et     09 → Ödeme sistemi
04 → Performance engine    10 → B2B panel
05 → Modüller              11 → Super admin
06 → Tanılama              12 → Deploy
```

---

## 📍 MEVCUT DURUM

`docs/STATUS.md` dosyasını oku — hangi adımların tamamlandığını gösterir.
Her görev sonrası STATUS.md'yi güncelle.

---

## 🚨 SIKÇA YAPILAN HATALAR (YAPMA)

```
❌ tenant_id olmadan insert yapma
❌ RLS olmayan tablo oluşturma
❌ any tipi kullanma
❌ Supabase çağrısını try/catch'siz bırakma
❌ Türkçe olmayan kullanıcı hata mesajı yazma
❌ Tanılama tamamlanmadan ana ekrana yönlendirme
❌ ARP yerine sadece WPM gösterme
```
