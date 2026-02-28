# SPRINTA — Adım Adım Geliştirme Yol Haritası
> **Tarih:** 23 Şubat 2026 | **Mevcut Durum:** iOS simülatörde çalışıyor ✅ | **Hedef:** 8 Modüllü Production App

---

## Önce Bunu Oku

Bu döküman iki kaynaktan oluşturulmuştur:
1. **SPRINT_DURUM_RAPORU.md** — projenin mevcut teknik durumu
2. **05-1-MODULLER_ek_moodu_l.md** — 8 modülün bilimsel ve teknik detayları

**Mevcut Durum:** FAZ 0–11 tamamlandı. Uygulamada 4 modül var (`speed_control`, `deep_comprehension`, `attention_power`, `mental_reset`). Hedef: 8 modüle çıkmak + uçtan uca seans döngüsü kurmak.

---

## MODÜLLERİN DURUMU

| # | Modül | Kod | Durum | Erişim |
|---|-------|-----|-------|--------|
| 1 | Hız Kontrolü | `speed_control` | ✅ Var (RSVP, Chunking, Pacing) | Free (3/gün) |
| 2 | Derin Kavrama | `deep_comprehension` | ✅ Var (MainIdea, DetailRecall, Inference) | Free (3/gün) |
| 3 | Dikkat Gücü | `attention_power` | ✅ Var (FocusLock, SustainedFocus) | 🔒 Premium |
| 4 | Zihinsel Sıfırlama | `mental_reset` | ✅ Var (Breathing, EyeRelaxation) | 🔒 Premium |
| 5 | Göz Egzersizleri | `eye_training` | ❌ Yok | 🔒 Premium |
| 6 | Kelime Hazinesi | `vocabulary` | ❌ Yok | 🔒 Premium |
| 7 | Strateji Modülü | `strategy` | ❌ Yok | 🔒 Premium |
| 8 | Sınav Simülasyonu | `exam_simulation` | ❌ Yok | 🔒 Premium |

**v1.0 hedefi:** Mevcut 4 modül stabil + seans döngüsü tam çalışır.
**v1.1 hedefi:** Modül 5, 6, 7 eklenir.
**v1.2 hedefi:** Modül 8 + AI özellikleri.

---

## SPRINT A — Seans Döngüsü (En Kritik, 2-3 Gün)

> **Hedef:** XP Supabase'e yazılsın, sessions + progress tab açılsın, streak bağlansın.
> Şu an XP yalnızca local Zustand store'da duruyor — uçtan uca bağlantı eksik.

---

### ADIM 1 — XP'yi Supabase'e Yaz

**Sorun:** Egzersiz bitince `onComplete(metrics)` callback'i çağrılıyor ama `xp_logs` tablosuna yazılmıyor.

**Dokunulacak dosyalar:**
- `apps/mobile/src/features/rewards/rewardStore.ts`
- `packages/api-client/src/services/performancePipeline.ts`

**Claude Code'a yaz:**
```
apps/mobile/src/features/rewards/rewardStore.ts dosyasını incele.
XP kazanma fonksiyonu çağrıldığında packages/api-client/src/services/performancePipeline.ts
üzerinden Supabase xp_logs tablosuna da kayıt düşsün.
Mevcut Zustand store'u bozmadan, Supabase yazma işlemini try/catch ile ekle.
Hata olursa local store çalışmaya devam etsin (offline-first yaklaşım).
```

---

### ADIM 2 — sessions.tsx Tab'ını Aktif Et

**Sorun:** `sessions.tsx` tab'ı gizlenmiş, kullanıcı seans geçmişini göremez.

**Dokunulacak dosyalar:**
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/sessions.tsx`

**Claude Code'a yaz:**
```
apps/mobile/app/(tabs)/_layout.tsx dosyasında sessions tab'ını aktif et.
apps/mobile/app/(tabs)/sessions.tsx dosyasını oluştur veya tamamla.

İçerik: Kullanıcının tamamladığı egzersiz seanslarının listesi.
Her seans kartında: tarih, modül adı (Hız Kontrolü / Derin Kavrama vb.), 
kazanılan XP, ARP skoru gösterilsin.

Veri kaynağı: packages/api-client/src/services/performancePipeline.ts
Tema: useAppTheme() + useMemo pattern.
```

---

### ADIM 3 — Streak Güncelleme

**Sorun:** Streak DB'de var (007_gamification), `streakService.ts` var ama seans bitince çağrılmıyor.

**Dokunulacak dosya:** `apps/mobile/app/exercise/[moduleCode]/result.tsx`

**Claude Code'a yaz:**
```
apps/mobile/app/exercise/[moduleCode]/result.tsx dosyasını incele.
Seans tamamlandığında packages/api-client/src/services/streakService.ts'deki
streak güncelleme fonksiyonunu çağır.
EventBus.ts'deki mevcut event tiplerini kontrol et, STREAK_UPDATED eventi emit et.
Hata durumunda kullanıcıya gösterim yapma, sadece console.warn bas.
```

---

### ADIM 4 — progress.tsx Tab'ını Aktif Et

**Sorun:** `progress.tsx` gizli. `LineChart` bileşeni hazır, ARP verisi DB'de var.

**Dokunulacak dosyalar:**
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/progress.tsx`

**Claude Code'a yaz:**
```
apps/mobile/app/(tabs)/progress.tsx dosyasını oluştur.
apps/mobile/app/(tabs)/_layout.tsx'de progress tab'ını aktif et.

İçerik:
1. ARP grafiği — src/components/ui/LineChart.tsx bileşenini kullan
2. Son 7 günlük seans verisi (performancePipeline.ts'den çek)
3. Streak takvimi — her günü daire olarak göster (tamamlanan gün yeşil, boş gün gri)
4. Toplam XP ve seviye — gamificationStore'dan al

Tema: useAppTheme() + useMemo pattern.
```

---

### ADIM 5 — Premium Kilitleme Sistemi

**Sorun:** `usePremiumGate` hook var ama modüllere bağlı değil. Free kullanıcı tüm modüllere erişiyor.

**Kural:** Free → Modül 1 ve 2 (günde 3 egzersiz). Premium → Tüm 8 modül, sınırsız.

**Dokunulacak dosyalar:**
- `apps/mobile/app/exercise/[moduleCode]/index.tsx`
- `apps/mobile/src/hooks/usePremiumGate.ts`

**Claude Code'a yaz:**
```
apps/mobile/src/hooks/usePremiumGate.ts dosyasını incele.
apps/mobile/app/exercise/[moduleCode]/index.tsx dosyasında modül seçim ekranına
premium kilitleme ekle.

Kural:
- moduleCode === 'speed_control' veya 'deep_comprehension' → Free, günde 3 egzersiz limiti
- Diğer tüm modüller → Premium gerekli

Free kullanıcı kilitli modüle tıklarsa app/(modals)/paywall.tsx'e yönlendir.
Günde 3 egzersiz limitini sessionStore'da say, her yeni günde sıfırla.
```

---

## SPRINT B — Android + App Store Hazırlığı (1-2 Gün)

---

### ADIM 6 — Android Build Test

**Sorun:** Hiç Android testi yapılmadı.

**Claude Code'a yaz:**
```
Terminal:
cd /Users/erdalkiziroglu/sprinta-22-subat-2026/apps/mobile
../../../node_modules/.bin/expo run:android

Hata çıkarsa hata mesajını paylaş.
Özellikle kontrol et:
- react-native-purchases (RevenueCat) Android gradle bağımlılıkları
- react-native-mmkv 3.3.3 Android uyumu
- react-native-reanimated v4.1.6 Android worklets
- babel.config.js — react-native-worklets/plugin Android'de de geçerli mi?
```

---

### ADIM 7 — EAS Project ID + TestFlight

**Sorun:** `app.json`'da `YOUR_EAS_PROJECT_ID` placeholder var.

**Claude Code'a yaz:**
```
Adım 1 — EAS init:
cd /Users/erdalkiziroglu/sprinta-22-subat-2026
npx eas-cli init

Adım 2 — apps/mobile/app.json'daki YOUR_EAS_PROJECT_ID'yi güncelle.

Adım 3 — apps/mobile/eas.json oluştur:
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal", "ios": { "simulator": false } },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}

Adım 4 — TestFlight build başlat:
npx eas-cli build --platform ios --profile preview
```

---

## SPRINT C — Yeni Modüller: v1.1 (3-4 Gün)

> **Hedef:** Modül 5 (Göz Egzersizleri) ve Modül 6 (Kelime Hazinesi) ekle.

---

### ADIM 8 — Modül 5: Göz Egzersizleri

**Bilimsel Temel:** Periferik görüş genişledikçe her fiksasyonda daha fazla kelime işlenir → daha az saccade → daha hızlı okuma.

**Egzersizler:**
- **Schulte Tablosu:** 5×5 grid, 1-25 sayılarını sırayla bul. Her seviyede grid büyür.
- **Genişleyen Odak:** Merkezdeki noktaya bak, yanlardaki kelimeleri oku (3°→7°→12°).
- **Satır Tarama:** Satırın ortasına bak, tüm satırı oku.

**ARP Etkisi:** `regression_rate ↓ → CSF ↑ → ARP ↑`

**Dosya Yapısı:**
```
apps/mobile/src/components/exercises/EyeTraining/
├── SchulteExercise.tsx
├── ExpandingFocusExercise.tsx
└── LineScanExercise.tsx
```

**Claude Code'a yaz:**
```
apps/mobile/src/components/exercises/EyeTraining/ klasörünü oluştur.
Önce SchulteExercise.tsx'i yaz:

Schulte Tablosu kuralları:
- 5×5 grid, içinde 1-25 arası sayılar karışık
- Kullanıcı 1'den 25'e sırayla dokunur
- Yanlış dokunmada hata sayısı artar (Haptics.notificationAsync ERROR)
- Doğru dokunmada yeşil flash (Haptics.selectionAsync)
- Tamamlama süresi ölçülür (ms cinsinden)
- Zorluk arttıkça grid 6×6, 7×7 olur (36, 49 sayı)

Metrics çıktısı (onComplete callback):
{
  completionTime: number,  // ms
  errorCount: number,
  gridSize: number,        // 5, 6 veya 7
  peripheralScore: number  // 0-100 (hata ve süreye göre)
}

ExerciseProps interface'ini src/components/exercises/types.ts'den import et.
Mevcut tema sistemi: useAppTheme() + useMemo pattern.
```

---

### ADIM 9 — Modül 6: Kelime Hazinesi

**Bilimsel Temel:** Bağlamsal öğrenme izole ezbere göre 4x daha kalıcıdır. TYT'de bilinmeyen kelime okuma hızını %30 düşürür.

**Egzersizler:**
- **Bağlam Tahmin:** Kelime boş bırakılmış cümle, doğru kelimeyi seç (TYT formatı).
- **Hızlı Eşleştirme:** 10 kelime + 10 anlam, süre baskısıyla eşleştir.
- **Sınav Kelime Seti:** LGS, TYT, AYT, KPSS, YDS için ayrı kelime havuzları.

**ARP Etkisi:** `comprehension ↑ → REI ↑ → ARP ↑`

**Dosya Yapısı:**
```
apps/mobile/src/components/exercises/Vocabulary/
├── ContextGuessExercise.tsx
├── QuickMatchExercise.tsx
└── ExamWordSetExercise.tsx
```

**Claude Code'a yaz:**
```
apps/mobile/src/components/exercises/Vocabulary/ klasörünü oluştur.
Önce ContextGuessExercise.tsx'i yaz:

Bağlam Tahmin egzersizi:
- Cümle gösterilir, bir kelime "___" ile boş bırakılmıştır
- 4 şık verilir (A, B, C, D)
- Kullanıcı seçer, doğru/yanlış gösterilir
- Her soru için response time ölçülür (ms)
- 10 soruluk seans, sonunda comprehension skoru hesaplanır

Veri kaynağı: packages/api-client/src/services/contentService.ts
content_type: 'vocabulary_context' ve exam_type filtresi kullan.
(exam_type: programStore'dan mevcut programı al — LGS/TYT/AYT/KPSS)

ExerciseProps interface, useAppTheme() pattern kullan.
```

---

## SPRINT D — AI Koç UI (2-3 Gün)

---

### ADIM 10 — AI Koç Chat Ekranı

**Sorun:** `app/ai-coach.tsx` var, `aiCoachService.ts` var, UI eksik. `ChatBubble` bileşeni hazır.

**Claude Code'a yaz:**
```
apps/mobile/app/ai-coach.tsx dosyasını tamamla.

Mevcut bileşenler:
- src/components/ui/ChatBubble.tsx
- packages/api-client/src/services/aiCoachService.ts

Özellikler:
1. FlatList ile mesaj geçmişi (en yeni altta)
2. Kullanıcı mesajı sağda, AI mesajı solda (ChatBubble ile)
3. Altta TextInput + Gönder butonu
4. AI cevap verirken "..." loading animasyonu
5. İlk açılışta kullanıcının ARP skoru ve son seans bilgisi context olarak gönderilsin
   (gamificationStore ve sessionStore'dan al)
6. Streaming varsa aiCoachService'den al, yoksa normal response

Not: Claude Haiku API edge function üzerinden çağrılıyor (aiCoachService.ts'de mevcut).
Free kullanıcı için günlük 3 mesaj limiti uygula.
Tema: useAppTheme() + useMemo pattern.
```

---

### ADIM 11 — AI Soru Üretimi (v1.2 hazırlığı)

**Bilimsel Temel:** Soruyu cevaplamak değil, soruyu tahmin etmek derin kavrama üretir (elaborative interrogation tekniği).

**Nasıl çalışır:** Metin okunur → Claude Haiku 5 soru üretir (ana fikir, detay, çıkarım karışık) → Kullanıcı cevaplar.

**Not:** Free kullanıcıda günlük max 3, Premium'da 10 AI soru.

**Claude Code'a yaz:**
```
packages/api-client/src/services/aiCoachService.ts dosyasına
generateQuestions(text: string, examType: string) fonksiyonu ekle.

Supabase Edge Function'a POST isteği at:
{
  text: metin,
  examType: 'LGS' | 'TYT' | 'AYT' | 'KPSS',
  questionCount: 5,
  types: ['main_idea', 'detail', 'inference']
}

Dönen soruları Question[] formatında parse et:
interface Question {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
  type: 'main_idea' | 'detail' | 'inference';
}

Bu fonksiyonu DeepComprehension modülündeki InferenceExercise.tsx'den çağır.
```

---

## SPRINT E — Sosyal + Bildirimler (3-4 Gün)

---

### ADIM 12 — social.tsx Liderlik Tablosu

**Sorun:** `social.tsx` gizli. `leaderboardService.ts` ve DB hazır.

**Claude Code'a yaz:**
```
apps/mobile/app/(tabs)/social.tsx dosyasını oluştur.
apps/mobile/app/(tabs)/_layout.tsx'de social tab'ını aktif et.

İçerik:
1. Haftalık liderlik tablosu (leaderboardService.ts'den veri çek)
2. Her satır: sıra, kullanıcı adı, XP, modül rozeti
3. Mevcut kullanıcının satırı highlight'lı
4. "Beni Bul" butonu (FlatList.scrollToIndex)
5. Üst 3 için özel kart (altın/gümüş/bronz)

Tema: useAppTheme() + useMemo pattern.
```

---

### ADIM 13 — Push Notifications

**Sorun:** `expo-notifications` kurulu değil.

**Claude Code'a yaz:**
```
Adım 1 — paketi kur:
cd /Users/erdalkiziroglu/sprinta-22-subat-2026
pnpm --filter mobile add expo-notifications

Adım 2 — apps/mobile/app.json'a ekle:
"plugins": ["expo-notifications"]

Adım 3 — apps/mobile/src/services/notificationService.ts oluştur:

Fonksiyonlar:
- init(): İzin iste (requestPermissionsAsync)
- scheduleDailyReminder(): Her gün saat 19:00 "Günlük antrenmanın seni bekliyor! 🎯"
- scheduleStreakWarning(streakCount): Saat 21:00, kullanıcı seans yapmadıysa
  "Streakini kaybetmek üzeresin! {streakCount} günlük serinizi koru. 🔥"
- cancelAll(): Tüm bildirimleri iptal et (çıkış yaparken)

Adım 4 — apps/mobile/app/_layout.tsx'de uygulama açılışında notificationService.init() çağır.
```

---

## SPRINT F — Profil + MMKV Cache (2-3 Gün)

---

### ADIM 14 — Profil Ekranı

**Claude Code'a yaz:**
```
apps/mobile/app/(tabs)/menu.tsx dosyasını incele.
Profil bölümüne şunları ekle veya profile.tsx olarak ayır:

1. Avatar (baş harfler, WhatsApp tarzı renkli daire)
2. Kullanıcı adı ve email (authStore)
3. Mevcut seviye + XP bar (gamificationStore) — XPBar bileşeni hazır
4. Toplam seans sayısı + toplam dakika (sessionStore)
5. Bu hafta ARP değişimi (örn: +12 puan ↑)
6. Kazanılan rozetler grid'i — BadgeCard bileşeni hazır
7. Çıkış Yap butonu (authStore.signOut)

Tema: useAppTheme() + useMemo pattern.
```

---

### ADIM 15 — MMKV Offline Cache

**Sorun:** `react-native-mmkv 3.3.3` kurulu ama kullanılmıyor. AsyncStorage'dan 10x hızlı.

**Claude Code'a yaz:**
```
apps/mobile/src/stores/mmkvStorage.ts oluştur:
Zustand persist middleware için MMKV storage adapter yaz.

import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();

export const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

Şu store'ları AsyncStorage'dan MMKV'ye geçir:
- gamificationStore.ts
- sessionStore.ts
- diagnosticStore.ts

themeStore.ts ve authStore.ts AsyncStorage'da bırак (platform uyumu için).
```

---

## SPRINT G — Sınav Simülasyonu (Modül 8) (3-4 Gün)

> **v1.2 kapsamında.** İçerik kütüphanesinden soru çeker, gerçek sınav hissi verir.

---

### ADIM 16 — Modül 8: Sınav Simülasyonu

**Bilimsel Temel:** Gerçek sınav koşullarında çalışmak normal çalışmaya göre %40 daha fazla bilgi kalıcılığı sağlar (Roediger & Karpicke, 2006). Sınav kaygısını da azaltır.

**Egzersizler:**
- **Mini Sınav (5 Soru):** Gerçek TYT/LGS formatında, süre baskısıyla.
- **Hız Turu:** 3 dakikada maksimum soru.
- **Zayıf Alan Turu:** Tanılama sisteminin tespit ettiği zayıf alandan kişiselleştirilmiş sorular.

**Claude Code'a yaz:**
```
apps/mobile/src/components/exercises/ExamSimulation/ klasörünü oluştur.

MiniExamExercise.tsx:
- 5 paragraf sorusu (contentService.ts'den exam_type filtreli çek)
- Her soru için countdown timer (örn: TYT'de soru başına 45sn)
- Soru geçişi animasyonlu (mevcut key={questionIndex} pattern kullan)
- Sonunda: kaç doğru, ortalama süre, ARP etkisi
- Her soru bir kez gösterilsin (shuffle + gösterilen soruları sessionStore'da sakla)

ExerciseProps interface kullan.
Tema: useAppTheme() + useMemo pattern.
```

---

## SPRINT H — Web Dashboard (3-5 Gün)

---

### ADIM 17 — Web Dashboard

**Claude Code'a yaz:**
```
apps/web/ dizinini tara ve mevcut durumu raporla.
Ardından apps/web/app/dashboard/page.tsx oluştur.

İçerik:
1. Toplam kullanıcı + günlük aktif kullanıcı (Supabase'den)
2. Modül kullanım dağılımı (8 modül, hangi kaç kez yapıldı)
3. Ortalama ARP skoru ve haftalık trend grafiği
4. En çok yapılan egzersiz tipi
5. Son 10 kayıt olan kullanıcı listesi
6. Premium vs Free kullanıcı oranı

Supabase bağlantısı: @sprinta/api paketini kullan.
Stil: Tailwind CSS 4.
```

---

## Teknik Hatırlatmalar

### iOS Build Komutu
```bash
cd /Users/erdalkiziloglu/sprinta-22-subat-2026/apps/mobile
../../../node_modules/.bin/expo run:ios --device "iPhone 16 Pro"
```

### Cache Temizleme (Build Hata Verirse)
```bash
pkill -9 -f "node"
lsof -ti :8081 | xargs kill -9
rm -rf apps/mobile/.expo
watchman watch-del-all
rm -rf apps/mobile/node_modules/.cache
rm -rf ~/Library/Developer/Xcode/DerivedData/Sprinta-*
pnpm install
cd apps/mobile/ios && pod install
```

### Sabit Paket Versiyonları (Değiştirme!)
```
react-native-mmkv: 3.3.3      (pnpm override — native uyumsuzluk)
react: 19.1.0                 (pnpm override — RN 0.81.5 uyumu)
babel.config.js: react-native-worklets/plugin   (reanimated v4.1.6)
```

### ExerciseProps Interface (Tüm Yeni Egzersizlerde Kullan)
```typescript
interface ExerciseProps {
  exerciseId: string;
  contentId?: string;
  difficulty: number;        // 1-10
  durationSeconds: number;
  onComplete: (metrics: SessionMetrics) => void;
  onExit: () => void;
}
```

### Tema Kullanım Kuralı (Her Yeni Ekranda)
```typescript
const t = useAppTheme();
const ms = useMemo(() => createStyles(t), [t]);
```

### Test Kullanıcıları
```
test@test.com / Test1234
ayse@sprinta.app / Demo1234
mehmet@sprinta.app / Demo1234
```

---

## Özet Tablo

| Sprint | İçerik | Süre | Öncelik |
|--------|---------|------|---------|
| **A** | Seans döngüsü (XP kaydet, sessions + progress tab, premium kilitleme) | 2-3 gün | 🔴 Kritik |
| **B** | Android build + EAS + TestFlight | 1-2 gün | 🔴 Kritik |
| **C** | Modül 5 (Göz) + Modül 6 (Kelime) | 3-4 gün | 🟡 Önemli |
| **D** | AI Koç UI + AI Soru Üretimi | 2-3 gün | 🟡 Önemli |
| **E** | Sosyal tab + Push notifications | 3-4 gün | 🟡 Önemli |
| **F** | Profil ekranı + MMKV cache | 2-3 gün | 🟢 İyileştirme |
| **G** | Modül 8 (Sınav Simülasyonu) | 3-4 gün | 🟢 v1.2 |
| **H** | Web Dashboard | 3-5 gün | 🟢 v1.2 |

---

## Modül Geliştirme Sırası

```
v1.0 (Şu An — Stabil Et):
  ✅ RSVP, Chunking, Pacing          (Hız Kontrolü)
  ✅ MainIdea, DetailRecall, Inference (Derin Kavrama)
  ✅ FocusLock, SustainedFocus        (Dikkat Gücü)
  ✅ Breathing, EyeRelaxation         (Zihinsel Sıfırlama)
  → Seans döngüsü uçtan uca bağla (SPRINT A)

v1.1 (Sprint C tamamlandıktan sonra):
  → Schulte Tablosu, Genişleyen Odak, Satır Tarama  (Modül 5 — Göz)
  → Bağlam Tahmin, Hızlı Eşleştirme                 (Modül 6 — Kelime)
  → Strateji Modülü egzersizleri                     (Modül 7)

v1.2 (Sprint D-G tamamlandıktan sonra):
  → AI Soru Üretimi (DeepComprehension'a ekle)
  → Parafoveal Önizleme (AttentionPower'a ekle)
  → Mini Sınav, Hız Turu, Zayıf Alan Turu           (Modül 8 — Simülasyon)
```

---

## Eklenmeyecek Teknikler (Kesin)

| Teknik | Neden? |
|--------|--------|
| Tachistoscope | Sınav ortamında kullanım yok |
| ZigZag Scanner | Etkisi kanıtlanmamış |
| Negative Contrast | Erişilebilirlik sorunu |
| Column Engine | Türkçe için uyumsuz |
| Dual Focus | Bilişsel yük teorisiyle çelişir |
| Timed Burst Mode | Pedagojik güvenlik ilkesine aykırı |

---

*Döküman SPRINT_DURUM_RAPORU.md + 05-1-MODULLER_ek_moodu_l.md kaynaklarından oluşturulmuştur — 23 Şubat 2026*
