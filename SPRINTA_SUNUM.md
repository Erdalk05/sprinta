# SPRINTA — Sınav Başarın için İlk Adım
### Yapay Zeka Destekli Okuma & Öğrenme Platformu

---

## 1. PROJENİN HİKAYESİ

**Sprinta**, Türkiye'deki milyonlarca öğrencinin en büyük sorununu çözmek için doğdu:

> *"Yeterince çalışıyorum, ama hız ve anlama bir türlü gelmiyor."*

LGS, TYT, AYT, KPSS gibi sınavlarda başarı sadece konu bilgisiyle değil —
**hızlı okuma**, **anlama kapasitesi** ve **odak** ile belirleniyor.

Sprinta, bu üç beceriyi bilimsel yöntemlerle geliştiren,
yapay zeka ile kişiselleşen bir mobil öğrenme uygulaması.

---

## 2. PROBLEM

| Sorun | Gerçek
|---|---
| Türk öğrencilerin ortalama okuma hızı | 150-180 WPM
| Dünya ortalaması | 250 WPM
| Sınav sorularında zaman baskısı | Her 3 öğrenciden 1'i soruyu okuyamadan bitiyor
| Hazır uygulama eksikliği | Türkçe içerikle çalışan okuma antrenmanı yok

**Sprinta bu boşluğu dolduruyor.**

---

## 3. ÇÖZÜM: SPRINTA

Sprinta, 3 temel bileşenden oluşuyor:

### Bileşen 1 — Okuma Motor Sistemi
- 12 farklı okuma modu (Zamanlı, Akademik, Chunk RSVP, Akış Okuma...)
- Her egzersiz sonrası **ARP (Adaptif Okuma Puanı)** hesaplanır
- WPM (Kelime/Dakika) otomatik adaptasyon

### Bileşen 2 — Kütüphane & İçerik
- 55+ Türkçe metin (LGS, TYT, AYT, KPSS, ALES, YDS)
- Her metne ait anlama soruları
- Kullanıcı kendi metnini de ekleyebilir

### Bileşen 3 — Yapay Zeka Mentor
- Claude Haiku ile kişiselleştirilmiş geri bildirim
- Sınav odaklı beceri analizi
- Günlük görev ve hedef sistemi

---

## 4. TEKNİK ALT YAPI

### Kullanılan Teknolojiler

```
Mobil App     → React Native 0.81.5 + Expo 54
UI Animasyon  → Reanimated 4 (New Architecture)
Backend       → Supabase (PostgreSQL + Edge Functions)
Yapay Zeka    → Anthropic Claude Haiku
Web Admin     → Next.js 15 (App Router)
Mimari        → Monorepo (pnpm + Turborepo)
```

### Veritabanı Mimarisi
- 35+ migration ile büyüyen canlı veritabanı
- Otomatik XP tetikleyicileri (session_completed_trigger)
- Gerçek zamanlı streak ve günlük istatistik güncellemeleri

---

## 5. UYGULAMA ÖZELLİKLERİ

### Ana Sayfa — Performans Merkezi
- **PerformanceHeader**: Reanimated animasyonlu delta göstergesi, 7 günlük bar chart
- **DailyMissionCard**: SVG halka animasyonu, günlük hedef takibi
- **BrainPowerMap**: 4 beceri grid kartı + detay modal
- **WeeklyMomentumStrip**: Renk kodlu haftalık trend
- **AICoachCard**: AI destekli antrenman önerisi + zorluk + XP

### Radial FAB Navigasyon
- 5 egzersiz: Periferik Görüş / RSVP / Sakkad / Odak / Hız
- 180° yay üzerinde enerji animasyonu
- Reanimated 4 ile nabız efekti

### Egzersiz Sistemi — 12 Mod

| # | Mod | Beceri
|---|---|---
| 1 | Zamanlı Okuma | Hız + Anlama
| 2 | Akademik Okuma | Derinlik
| 3 | Anahtar Kelime Tarama | Odak
| 4 | Bellek Çangası | Hafıza
| 5 | Tahmin Okuma | Eleştirel Düşünce
| 6 | Odak Filtre | Konsantrasyon
| 7 | Sesaltı Serbest | Akışkanlık
| 8 | Biyonik Okuma | Görsel Hız
| 9 | Otomatik Kaydırma | Ritim
| 10 | Hız Merdiveni | Progresif Hız
| 11 | Kelime Patlaması | Kelime Hızı
| 12 | Cümle Adımı | Yapısal Analiz

**+ Chunk RSVP** (Kelime grupları halinde sunum)
**+ Akış Okuma** (Kayan çizgi rehberli okuma)
**+ Göz Genişliği Antrenmanı** (Fixation/Span geliştirme)
**+ Kelime Hazinesi** (MCQ flashcard sistemi)

### Anlama Soruları Sistemi
- Okuma bitince sıfır gecikmeyle quiz başlıyor
- Ana Fikir / Detay / Çıkarım soruları
- Sonuç ekranında yeniden açılabilir

### Kütüphane Sistemi
- 55 metin, 156 bölüm, 156 soru
- LGS Fen/Türkçe/Matematik/Sosyal/İngilizce
- TYT/AYT Biyoloji/Fizik/Kimya/Edebiyat
- Metin içi yer imi, not alma, vurgulama
- Okuma ilerleme göstergesi (devam et butonu)

### Gamification & XP Sistemi
- Her egzersiz → XP kazanımı → Supabase'e otomatik yazılır
- Seviye sistemi (XP'ye göre)
- Günlük streak takibi
- Rozet sistemi
- Challenge/düello sistemi (sosyal)

---

## 6. ADMIN PANELI (Web)

Next.js tabanlı admin dashboard:

- **Metin Yönetimi**: İçerik ekleme/düzenleme, bölüm yönetimi
- **AI Metadata**: Claude Haiku ile otomatik zorluk/kategori tespiti
- **Soru Havuzu**: Her metne soru ekleme
- **Kullanıcı İstatistikleri**: Sınav türü bazlı analitik
- **Rol Sistemi**: Admin/öğretmen/öğrenci rolleri

---

## 7. YAPAY ZEKA ENTEGRASYONLARİ

### AI Mentor (Sprint 9)
- Okuma seansı bitince kişiselleştirilmiş geri bildirim
- Claude Haiku ile Supabase Edge Function üzerinden
- "Bu metin senin için biraz zor görünüyor, hızını 180 WPM'e düşürmeyi dene"

### Adaptif WPM
- Son 5 seans ortalaması otomatik başlangıç hızı
- "🤖 Adaptif: 220 WPM" göstergesi
- Kişiye özel öğrenme hızı

### Sınav Zekası (Sprint 8)
- Soru tipi bazlı performans analizi
- Sınav odaklı beceri tavsiyesi
- Kullanıcının zayıf alanlarını tespit etme

---

## 8. PERFORMANS & MİMARİ KARARLAR

### Neden Supabase?
- Gerçek zamanlı veri + Row Level Security
- Edge Functions ile sunucu kodunu minimize et
- 35 migration ile evrilebilir şema

### Neden Reanimated 4?
- 60 FPS animasyonlar (UI thread'de çalışır)
- New Architecture uyumlu
- Cursor animasyonları, puls efektleri, geçişler

### MMKV Storage
- AsyncStorage'dan 10x hızlı
- Egzersiz ayarları, tema tercihi kalıcı saklama

### Tek Supabase Singleton
- Tüm 20+ bileşen aynı istemciyi kullanır
- Auth state konflikti yok
- Token yenileme otomatik

---

## 9. GELİŞTİRME YOLCULUĞU

```
Sprint 1-3   → Temel auth, öğrenci kaydı, dashboard
Sprint 4     → Okuma Merkezi (Reading Hub)
Sprint 5     → Kitap okuyucu (Bölüm sistemi)
Sprint 6     → Admin paneli + AI metadata
Sprint 7     → Gamification (XP, rozet, streak)
Sprint 8     → Sınav Zekası analitik
Sprint 9     → AI Mentor + 7 okuma modu
Sprint 10    → Sosyal (challenge sistemi)
Sprint 11    → 12 okuma modu + Kelime hazinesi
Sprint 12    → Quiz flow + No-scroll UX iyileştirmeleri
```

**Toplam: 35+ veritabanı migration, 200+ bileşen, 12 egzersiz modu**

---

## 10. HEDEF KİTLE & PİYASA

| Segment | Büyüklük
|---|---
| LGS (8. sınıf) | 1.2 milyon öğrenci/yıl
| TYT/AYT | 2.8 milyon öğrenci/yıl
| KPSS | 1.5 milyon aday/yıl
| Toplam adreslenebilir piyasa | **5.5 milyon+**

**Türkiye'de Türkçe içerikle çalışan, bilimsel okuma antrenmanı yapan başka bir uygulama yok.**

---

## 11. DEMO

### Kullanıcı Akışı

```
1. Kayıt → Sınıf seviyesi + Hedef sınav seç
2. Ana Sayfa → Günlük görev + Performans özeti
3. Radial FAB → Egzersiz seç
4. Kütüphane → Konuya göre metin seç
5. Okuma → Adaptif hız ile oku
6. Quiz → Anlama sorularını cevapla
7. Sonuç → XP kazan, ARP puanı gör
8. AI Mentor → Kişisel tavsiye al
```

### Ekran Görüntüleri
- Kayıt ekranı: Sınıf seviyesi + hedef sınav seçimi
- Ana Sayfa: Canlı performans verileri
- Egzersiz seçim: 12 mod grid
- Okuma ekranı: Kayan rehber çizgili
- Quiz: Anlama soruları
- Sonuç: ARP + XP + AI geri bildirimi

---

## 12. NEDEN SPRINTA KAZANIR

1. **Dil Avantajı** — %100 Türkçe içerik, Türk sınavlarına özel
2. **Bilim Tabanlı** — ARP algoritması, adaptif WPM, göz genişliği antrenmanı
3. **Gamification** — XP, rozet, streak, arkadaş challengeı
4. **Yapay Zeka** — Her öğrenci için kişisel koç
5. **Hız** — Reanimated 4 + New Architecture = akıcı deneyim
6. **Kapsamlı** — Tek uygulamada: okuma + anlama + kelime + sınav analizi

---

## KAPANIŞ

> **Sprinta sadece bir okuma uygulaması değil.**
> Öğrencinin sınav performansını bilimsel olarak ölçen,
> yapay zeka ile kişiselleştiren ve
> her gün daha iyi bir okuyucu yapan
> **akıllı öğrenme platformu.**

**Sınav başarın için ilk adım — SPRINTA.**

---

*Geliştirici: Erdal Kızıroğlu | Teknoloji: React Native + Supabase + Claude AI*
*Platform: iOS (Android yolda) | Versiyon: 1.0 Beta | Tarih: Mart 2026*
