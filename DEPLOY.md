# SPRINTA — Production Deploy Rehberi

## Gereksinimler

| Araç | Versiyon | Durum |
|------|----------|-------|
| Node.js | >= 18 | ✅ |
| pnpm | 9.x | ✅ |
| EAS CLI | >= 5.0.0 | ✅ v18.0.3 |
| Supabase CLI | latest | ✅ |
| Vercel CLI | latest | ✅ |

---

## Adım 1 — Supabase Cloud Projesi Oluştur

### 1.1 Proje Oluştur
1. [supabase.com/dashboard](https://supabase.com/dashboard) → New Project
2. Proje adı: `sprinta-production`
3. Region: `eu-central-1` (Frankfurt, Türkiye'ye en yakın)
4. Güçlü bir şifre belirle (kaydet!)
5. Project Ref'i not al: `abcdefghijklmnop` (16 karakter)

### 1.2 Local'i Cloud'a Bağla
```bash
cd ~/sprinta-22-subat-2026
supabase login                                   # tarayıcıda auth
supabase link --project-ref YOUR_PROJECT_REF     # local ↔ cloud bağlantısı
```

### 1.3 Database Schema'yı Push Et
```bash
supabase db push
# Tüm migration'lar (001-011) çalışır
```

### 1.4 Edge Function Secrets Ayarla
```bash
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."  --project-ref YOUR_PROJECT_REF
# Kontrol et:
supabase secrets list --project-ref YOUR_PROJECT_REF
```

### 1.5 Edge Functions Deploy Et
```bash
supabase functions deploy ai-coach            --project-ref YOUR_PROJECT_REF
supabase functions deploy ai-weekly-report    --project-ref YOUR_PROJECT_REF
supabase functions deploy cron-risk-detection --project-ref YOUR_PROJECT_REF
supabase functions deploy cron-daily-stats    --project-ref YOUR_PROJECT_REF
```

### 1.6 Üretim Anahtarlarını Al
Dashboard → Settings → API:
- `Project URL`: `https://YOUR_PROJECT_REF.supabase.co`
- `anon public key`: `eyJ...`
- `service_role secret key`: `eyJ...` (dikkatli sakla!)

---

## Adım 2 — Vercel Web Panel Deploy

### 2.1 İlk Kurulum
```bash
cd ~/sprinta-22-subat-2026/apps/web
vercel login
vercel link                    # mevcut projeye bağla veya yeni oluştur
```

### 2.2 Environment Variables Ayarla (Vercel Dashboard)
Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL      = https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY     = eyJ...
NEXT_PUBLIC_ENV               = production
```

### 2.3 Deploy
```bash
cd ~/sprinta-22-subat-2026
vercel --prod --cwd apps/web
```

### 2.4 Domain Bağla
Vercel Dashboard → Domains → Add:
- `panel.sprinta.app` → DNS CNAME: `cname.vercel-dns.com`

---

## Adım 3 — EAS Mobile Build

### 3.1 Expo Hesabı & Proje Bağlantısı
```bash
eas login                      # expo.dev hesabın ile giriş
cd ~/sprinta-22-subat-2026/apps/mobile
eas init                       # YENİ proje veya mevcut proje bağla
# → app.json extra.eas.projectId otomatik güncellenir
```

### 3.2 Environment Variables (EAS Secrets)
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://YOUR_PROJECT_REF.supabase.co"

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "eyJ..."

eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_API_KEY_IOS \
  --value "appl_..."

eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID \
  --value "goog_..."
```

### 3.3 iOS — TestFlight Build
```bash
# Önce Apple Developer hesabı gerekli (developer.apple.com — yıllık $99)
eas build --platform ios --profile preview
# Simülatör olmadan gerçek cihaz build'i

# App Store'a gönder (uçuş testi):
eas submit --platform ios --profile production
```

**eas.json submit bölümünü güncelle:**
```json
"ios": {
  "appleId": "senin@email.com",          // Apple ID
  "ascAppId": "1234567890",              // App Store Connect → App ID
  "appleTeamId": "ABCDE12345"           // developer.apple.com → Membership
}
```

### 3.4 Android — Play Store Build
```bash
# Önce Google Play Console hesabı gerekli ($25 tek seferlik)
eas build --platform android --profile production
# → .aab dosyası oluşturulur

# Play Console'a gönder:
eas submit --platform android --profile production
```

**google-service-account.json:**
1. Google Play Console → Setup → API access → Create service account
2. JSON key indir → `apps/mobile/google-service-account.json`
3. .gitignore'a ekle (zaten ekli olmalı!)

### 3.5 Production Build (Her iki platform)
```bash
cd ~/sprinta-22-subat-2026
eas build --platform all --profile production
# EAS Build cloud'da build eder, yerel makine gerekmez
```

---

## Adım 4 — GitHub Secrets Ayarla

Repository → Settings → Secrets and variables → Actions → New secret:

| Secret Adı | Değer | Nereden |
|-----------|-------|---------|
| `SUPABASE_ACCESS_TOKEN` | `sbp_...` | supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | `abcdefghijklmnop` | Supabase proje ref |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | console.anthropic.com |
| `VERCEL_TOKEN` | `...` | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `team_...` | vercel.com/account |
| `VERCEL_PROJECT_ID_WEB` | `prj_...` | Vercel proje → Settings → General |
| `EXPO_TOKEN` | `...` | expo.dev/accounts/[user]/settings/access-tokens |

### Otomatik CI/CD:
- `main` branch'e push → TypeCheck + Test + Vercel Deploy + Supabase Deploy
- Commit mesajı `[build-mobile]` içeriyorsa → EAS iOS + Android build

---

## Adım 5 — Domain DNS Ayarları

DNS sağlayıcında (Cloudflare önerilir):

```
panel.sprinta.app    CNAME  cname.vercel-dns.com
admin.sprinta.app    CNAME  cname.vercel-dns.com      # super admin (ileride)
api.sprinta.app      CNAME  YOUR_PROJECT_REF.supabase.co
```

---

## Adım 6 — Production Test Checklist

### Supabase
- [ ] `supabase db push` başarılı (tüm migration'lar)
- [ ] Edge Functions çalışıyor: `curl https://api.sprinta.app/functions/v1/ai-coach`
- [ ] ANTHROPIC_API_KEY set edildi

### Web Panel
- [ ] `panel.sprinta.app` açılıyor
- [ ] Login çalışıyor
- [ ] Dashboard veri yükleniyor

### Mobile
- [ ] iOS TestFlight build tamamlandı
- [ ] Android internal track'e yüklendi
- [ ] Login → Diagnostic → Dashboard akışı çalışıyor
- [ ] AI Coach sabah brifingi geliyor
- [ ] RevenueCat ödeme akışı çalışıyor

---

## Hızlı Deploy Komutları

```bash
# Sadece Supabase functions deploy
supabase functions deploy ai-coach --project-ref YOUR_REF

# Sadece web deploy
vercel --prod --cwd apps/web

# Mobile preview build (iOS)
cd apps/mobile && eas build --platform ios --profile preview

# Mobile production build (her iki platform)
cd apps/mobile && eas build --platform all --profile production
```

---

## Rollback

```bash
# Supabase — önceki migration'a dön
supabase db remote changes --project-ref YOUR_REF

# Vercel — önceki deploy'a dön
vercel rollback

# EAS — önceki build'i TestFlight'tan geri çek (App Store Connect)
```
