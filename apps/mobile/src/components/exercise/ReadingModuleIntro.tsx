/**
 * ReadingModuleIntro — Tüm okuma modülleri için zengin intro ekranı.
 * Her modüle özgü renk + ikon + başlık + faydalar + adımlar + istatistikler.
 * Metin gerektiren modüllerde Kütüphane/Yapıştır seçici gösterilir.
 */
import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import ContentImportModal, { type ImportedContent } from '../exercises/shared/ContentImportModal'
import { usePendingReadingStore } from '../../stores/pendingReadingStore'

// Metin seçici gerektiren modüller
const CONTENT_MODULES = new Set([
  'chunk-rsvp', 'timed-reading', 'flow-reading', 'speed-ladder', 'bionic-reading',
  'keyword-scan', 'fixation-trainer', 'word-burst', 'auto-scroll', 'sentence-step',
  'academic-mode', 'focus-filter', 'memory-anchor', 'prediction-reading',
  'subvocal-free', 'speed-camp', 'vanishing-reading', 'fading-word',
  'cloze-test', 'dual-column',
  'deep_comprehension',
])

function getPalette(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return {
    header:  `rgb(${Math.round(r * 0.38)},${Math.round(g * 0.38)},${Math.round(b * 0.38)})` as const,
    content: `rgb(${Math.min(255, Math.round(r * 0.08 + 235))},${Math.min(255, Math.round(g * 0.08 + 235))},${Math.min(255, Math.round(b * 0.08 + 235))})` as const,
    bottom:  `rgb(${Math.round(r * 0.28)},${Math.round(g * 0.28)},${Math.round(b * 0.28)})` as const,
  }
}

interface ModuleInfo {
  icon:     string
  label:    string
  subtitle: string
  accent:   string
  tip:      string
  benefits: string[]     // 3 madde — kazanımlar
  steps:    string[]     // 3 adım — ne olacak
  stats:    { label: string; value: string }[]  // 2-3 rakam
}

export const MODULE_INTRO: Record<string, ModuleInfo> = {
  'chunk-rsvp': {
    icon: '⚡', label: 'Chunk Okuma', accent: '#0891B2',
    subtitle: 'Kelimeler grup grup gösterilir — gözün art arda taramasını keser',
    tip: 'Okuma hızın için en etkili RSVP yöntemlerinden biri.',
    benefits: ['WPM hızını %30-50 artırır', 'Göz geri dönüşlerini sıfırlar', 'Odak kapasitesini güçlendirir'],
    steps:    ['Ekranda kelime grupları belirir', 'Her grubu tek bakışta yakala', 'Hız arttıkça chunk boyutu büyür'],
    stats:    [{ label: 'Süre', value: '5 dk' }, { label: 'Grup Boyutu', value: '2-4 kelime' }, { label: 'Hedef', value: '+50 WPM' }],
  },
  'timed-reading': {
    icon: '⏱️', label: 'Zamanlı Okuma', accent: '#EA580C',
    subtitle: 'Süre sayacı altında oku — YKS/TYT sınav baskısını simüle et',
    tip: 'Zaman baskısı altında okuma hızını ve kavramayı geliştirir.',
    benefits: ['Sınav baskısına alışıklık kazandırır', 'Anlama oranını koruyarak hızlanır', 'Gerçek TYT formatını simüle eder'],
    steps:    ['Süre sayacı başlar', 'Metni olabildiğince hızlı oku', 'Süre bitince anlama soruları gelir'],
    stats:    [{ label: 'Süre', value: '3 dk' }, { label: 'Soru', value: '3 adet' }, { label: 'Format', value: 'TYT/LGS' }],
  },
  'flow-reading': {
    icon: '🌊', label: 'Akış Okuma', accent: '#059669',
    subtitle: 'Satır satır pacing — anlama + hız dengesini kur',
    tip: 'Duraksama olmadan sürekli akış, yorgunluğu azaltır.',
    benefits: ['Göz takibini akıcı hale getirir', 'Zihinsel yorgunluğu azaltır', 'Anlama + hız dengesini geliştirir'],
    steps:    ['Çizgi metnin üzerinden kayar', 'Gözlerin çizgiyi takip eder', 'Hızı kaydırıcıyla ayarlayabilirsin'],
    stats:    [{ label: 'Süre', value: '5 dk' }, { label: 'Hız', value: 'Ayarlanabilir' }, { label: 'Mod', value: 'Sürekli akış' }],
  },
  'speed-ladder': {
    icon: '🪜', label: 'Hız Merdiveni', accent: '#D97706',
    subtitle: 'Her 30 kelimede +25 WPM artar — konfor zonunu kır',
    tip: 'Kademeli hız artışı kalıcı WPM kazanımı sağlar.',
    benefits: ['Kademeli hız artışıyla kalıcı gelişim', 'Konfor zonunu sistematik olarak kırar', 'Düzenli pratikle WPM kazanımı sağlar'],
    steps:    ['1. basamakta rahat hızla başla', 'Her bölümde hız otomatik artar', 'En yüksek WPM basamağına ulaş'],
    stats:    [{ label: 'Basamak', value: '6 seviye' }, { label: 'Artış', value: '+25 WPM' }, { label: 'Süre', value: '~6 dk' }],
  },
  'bionic-reading': {
    icon: '🧬', label: 'Biyonik Okuma', accent: '#0284C7',
    subtitle: 'İlk heceler kalın vurgulanır — beyin kelimeyi tamamlar',
    tip: 'Göz daha az hareket eder, zihin daha hızlı işler.',
    benefits: ['Beyin kalıp tanıma hızını artırır', 'Göz hareketi azaltılabilir', 'Dikkat dağınıklığını azaltır'],
    steps:    ['Her kelimenin ilk hecesi kalın görünür', 'Beyin geri kalanını tahmin eder', 'Hız arttıkça oran değişir'],
    stats:    [{ label: 'Süre', value: '5 dk' }, { label: 'Vurgu', value: 'İlk %40 hece' }, { label: 'Teknik', value: 'Bionic' }],
  },
  'keyword-scan': {
    icon: '🔍', label: 'Anahtar Kelime', accent: '#DC2626',
    subtitle: 'Kritik kavramları tarar — pasaj soru stratejisi',
    tip: 'Paragrafta ana fikri taşıyan anahtar kelimeleri yakala.',
    benefits: ['Pasajda hızlı bilgi bulmayı öğretir', 'LGS okuma soru stratejisini geliştirir', 'Odak kelime hafızasını güçlendirir'],
    steps:    ['Metni vurgulu anahtar kelimelerle oku', 'Her paragrafın kilit kavramını işaretle', 'Anlama soruları için bu kavramları kullan'],
    stats:    [{ label: 'Süre', value: '4 dk' }, { label: 'Kelime', value: 'Vurgulu tarama' }, { label: 'Hedef', value: 'LGS/TYT' }],
  },
  'fixation-trainer': {
    icon: '👁️', label: 'Göz Genişliği', accent: '#9333EA',
    subtitle: 'Flash gruplar — tek fiksasyonda daha fazla kelime gör',
    tip: 'Göz genişliği arttıkça satır başı sayısı düşer.',
    benefits: ['Tek bakışta daha fazla kelime alır', 'Satır başı sayısını azaltır', 'Periferik görüşü geliştirir'],
    steps:    ['Kelime grupları ekranın ortasında belirir', 'Gözlerini sabit tut, grubu algıla', 'Grup büyüklüğü ilerledikçe artar'],
    stats:    [{ label: 'Süre', value: '3 dk' }, { label: 'Flash', value: '0.3-0.8 sn' }, { label: 'Grup', value: '2-5 kelime' }],
  },
  'word-burst': {
    icon: '💫', label: 'Çok Kelime', accent: '#16A34A',
    subtitle: '2-4 kelime aynı anda — periferik görüş alanını genişlet',
    tip: 'Span kapasiten her seansta ~0.3 kelime büyür.',
    benefits: ['Periferik görüş açısını genişletir', 'Satır tarama verimliliğini artırır', 'Düzenli pratikle span kapasiten gelişir'],
    steps:    ['2 kelime birlikte flash olur', 'Gözlerini ortaya sabitle', 'Grup büyüdükçe span kapasiten artar'],
    stats:    [{ label: 'Süre', value: '4 dk' }, { label: 'Başlangıç', value: '2 kelime' }, { label: 'Hedef', value: '4 kelime span' }],
  },
  'auto-scroll': {
    icon: '📜', label: 'Oto Kaydırma', accent: '#E11D48',
    subtitle: 'Metin kendi hızında kayar — ritim ve duruş noktalarını kaldır',
    tip: 'Gözlerin metni takip eder, bilinçsiz duraksama azalır.',
    benefits: ['Okuma ritmini otomatik kurar', 'Bilinçsiz duraksama ve geri dönüşü engeller', 'Sürekli ilerlemeyi zorunlu kılar'],
    steps:    ['Metin otomatik aşağı kayar', 'Ritmi bozmadan takip et', 'Hızı dilediğin zaman ayarla'],
    stats:    [{ label: 'Süre', value: '5 dk' }, { label: 'Hız', value: 'Ayarlanabilir' }, { label: 'Kaydırma', value: 'Sürekli' }],
  },
  'sentence-step': {
    icon: '📝', label: 'Cümle Adım', accent: '#0F766E',
    subtitle: 'Cümle cümle ilerle — her adımda anlama odaklan',
    tip: 'Yavaş ama güçlü: kavrama oranı %40 artar.',
    benefits: ['Derin anlama ve çıkarım becerisi gelişir', 'Cümle yapısını çözümlemeyi öğretir', 'Akademik metin okuma için ideal'],
    steps:    ['Her adımda 1 cümle gösterilir', 'İleri butonuyla bir sonraki cümleye geç', 'Her 5 cümlede kısa özet sorusu'],
    stats:    [{ label: 'Format', value: 'Cümle cümle' }, { label: 'Kavrama', value: '+40%' }, { label: 'Hedef', value: 'Akademik' }],
  },
  'academic-mode': {
    icon: '📚', label: 'Akademik Mod', accent: '#1D4ED8',
    subtitle: 'Ağır paragrafları analiz et — derin çıkarım soruları',
    tip: 'Üniversite sınav metinleri için idealdir.',
    benefits: ['YKS/AYT metin analizini geliştir', 'Çıkarım ve değerlendirme sorularına hazırlan', 'Akademik kelime haznesini güçlendir'],
    steps:    ['Uzun akademik metin gösterilir', 'Oku ve not al', 'Çıkarım + değerlendirme soruları gelir'],
    stats:    [{ label: 'Metin', value: '400+ kelime' }, { label: 'Soru', value: '3-5 adet' }, { label: 'Hedef', value: 'AYT/YKS' }],
  },
  'focus-filter': {
    icon: '🎯', label: 'Dikkat Filtresi', accent: '#B45309',
    subtitle: 'Tek satır odak maskesi — dikkat dağınıklığını engeller',
    tip: 'Çevresel gürültüye karşı göz odağını korur.',
    benefits: ['Dikkat dağınıklığını tamamen engeller', 'Satır atlama hatasını sıfırlar', 'ADHD dostu okuma modu'],
    steps:    ['Sadece aktif satır görünür', 'Geri kalan karartılmış olur', 'Satır aşağı otomatik ilerler'],
    stats:    [{ label: 'Süre', value: '5 dk' }, { label: 'Görünen', value: '1 satır' }, { label: 'Mod', value: 'Odak maskesi' }],
  },
  'memory-anchor': {
    icon: '🧠', label: 'Hafıza Sabitleme', accent: '#6D28D9',
    subtitle: 'Oku-gizle-hatırla — bilgiyi uzun süreli belleğe aktar',
    tip: 'Spaced repetition prensibinin okuma versiyonu.',
    benefits: ['Uzun süreli bellek pekiştirir', 'Aktif hatırlama becerisini geliştirir', 'Sınav öncesi bilgi kalıcılığını artırır'],
    steps:    ['Metin 8 saniye gösterilir', 'Metin solar ve kaybolur', 'Hafızadan MCQ sorularını yanıtla'],
    stats:    [{ label: 'Süre', value: '8 sn görünür' }, { label: 'Soru', value: '3 MCQ' }, { label: 'Etki', value: '+60% kalıcılık' }],
  },
  'vocabulary': {
    icon: '📖', label: 'Kelime Haznesi', accent: '#047857',
    subtitle: 'Bağlam içinde kelime öğren — MCQ formatında anlam testi',
    tip: 'Kelime başına yanıt süresi ölçülür.',
    benefits: ['TYT/LGS kelime sorularını çözme becerisi', 'Bağlamdan anlam çıkarmayı öğretir', '10 kelime/seans ile düzenli büyüme'],
    steps:    ['Kelime cümle içinde gösterilir', '4 şıktan doğru anlamı seç', 'XP kazan ve kelimeleri işaretle'],
    stats:    [{ label: 'Kelime/Seans', value: '10 adet' }, { label: 'Format', value: '4 şıklı MCQ' }, { label: 'Bank', value: '40+ kelime' }],
  },
  'prediction-reading': {
    icon: '🔮', label: 'Tahmin Okuma', accent: '#C2410C',
    subtitle: 'Cümle sonunu tahmin et — anlam bağlantısı kur',
    tip: 'Öngörü yeteneği hız okumada en önemli bilişsel beceridir.',
    benefits: ['Anlam tahmin yeteneğini güçlendirir', 'Hız okumada öngörü kapasitesini artırır', 'Bağlam duyarlılığını geliştirir'],
    steps:    ['Cümle yarıda kesilir', 'Devamını 4 şıktan tahmin et', 'Doğru tahmin WPM bonusu verir'],
    stats:    [{ label: 'Tur', value: '10 cümle' }, { label: 'Şık', value: '4 seçenek' }, { label: 'Bonus', value: '+XP tahmin' }],
  },
  'subvocal-free': {
    icon: '🤫', label: 'Sessiz Okuma', accent: '#1E40AF',
    subtitle: 'İç sesi azalt — okuma hızını ve akıcılığını artır',
    tip: 'Subvokalizasyonu azaltmak okuma hızını artırabilir; tamamen ortadan kaldırmaya çalışmak yerine bilinçli olarak azaltmak hedeflenir.',
    benefits: ['İç ses farkındalığı gelişir', 'Okuma akıcılığı artar', 'Zihinsel ses-görsel denge kurulur'],
    steps:    ['Metni okurken zihinsel sese dikkat et', 'Sesi bastırmak yerine hafifletmeyi hedefle', 'Anlama kalitesini koruyarak hızı artır'],
    stats:    [{ label: 'Süre', value: '5 dk' }, { label: 'Hedef', value: 'Akıcılık' }, { label: 'Teknik', value: 'Farkındalık' }],
  },
  'speed-camp': {
    icon: '🏕️', label: 'Hızlı Okuma Kampı', accent: '#15803D',
    subtitle: 'Günlük antrenman programı — WPM gelişimini takip et',
    tip: 'Düzenli günlük antrenman kalıcı WPM kazanımının temelidir.',
    benefits: ['Sistematik 21 günlük gelişim programı', 'Her gün WPM ölçümü ve takibi', 'Streak bonusu ile motivasyon desteği'],
    steps:    ['Günlük 5 dakikalık antrenman', 'WPM ölçümü ve grafiği', '21. günde büyük test ve rozet'],
    stats:    [{ label: 'Program', value: '21 gün' }, { label: 'Günlük', value: '5 dk' }, { label: 'Hedef', value: 'WPM artış' }],
  },
  'vanishing-reading': {
    icon: '🌫️', label: 'Kaybolma Okuma', accent: '#4338CA',
    subtitle: 'Metin yavaşça solar — gördüklerini hafızadan tamamla',
    tip: 'Periferik bellek kapasiteni zorlar.',
    benefits: ['Kısa süreli görsel belleği güçlendirir', 'Anlama derinliğini artırır', 'Sınav metnini parça parça okuma stratejisi'],
    steps:    ['Metin 8 saniye tam görünür', 'Ardından yavaşça solar ve kaybolur', '3 MCQ anlama sorusunu yanıtla'],
    stats:    [{ label: 'Görünürlük', value: '8 saniye' }, { label: 'Soru', value: '3 MCQ' }, { label: 'Zorluk', value: 'Orta-İleri' }],
  },
  'fading-word': {
    icon: '🗑️', label: 'Kelime Silme', accent: '#BE185D',
    subtitle: 'Kelimeler birer birer kaybolur — cümleyi hafızadan tamamla',
    tip: 'Kısa süreli çalışma belleğini güçlendirir.',
    benefits: ['Çalışma belleği kapasitesini artırır', 'Kelime sırasını zihinsel olarak tutar', 'LGS cümle tamamlama stratejisi'],
    steps:    ['Tam cümle gösterilir', 'Kelimeler 500ms aralıklarla kaybolur', 'Silinen kelimeleri hafızadan tamamla'],
    stats:    [{ label: 'Cümle', value: '10-15 kelime' }, { label: 'Aralık', value: '500 ms' }, { label: 'Tur', value: '8 cümle' }],
  },
  'cloze-test': {
    icon: '📋', label: 'Cloze Testi', accent: '#7E22CE',
    subtitle: 'Her 7. kelime boş — bağlamdan tahminde bulun',
    tip: 'LGS okuma sorusu formatıyla özdeş strateji.',
    benefits: ['LGS okuma soru tipini birebir simüle eder', 'Bağlamdan kelime tahmini becerisi gelişir', 'Sınav puanı doğrudan artar'],
    steps:    ['Paragraf her 7. kelime boşlukla verilir', '4 şıktan doğru kelimeyi seç', 'Tüm boşluklar tamamlanınca skor'],
    stats:    [{ label: 'Boşluk', value: 'Her 7. kelime' }, { label: 'Şık', value: '4 seçenek' }, { label: 'Hedef', value: 'LGS format' }],
  },
  'dual-column': {
    icon: '📰', label: 'Çift Sütun', accent: '#0369A1',
    subtitle: 'İki kolon aynı anda oku — periferik span kapasiteni artır',
    tip: 'Gazete okuma tekniği: sütun ortasına odaklan.',
    benefits: ['Periferik görüş genişliğini artırır', 'Sütun ortasına odaklanma disiplini kurar', 'Okunan alan iki katına çıkar'],
    steps:    ['Metin 2 kolona bölünür', 'Gözlerini orta çizgiye sabitle', 'Her iki kolonu tek bakışla tara'],
    stats:    [{ label: 'Kolon', value: '2 sütun' }, { label: 'Teknik', value: 'Merkez odak' }, { label: 'Etki', value: '+80% alan' }],
  },
  'soru-treni': {
    icon: '🚂', label: 'Soru Treni', accent: '#B91C1C',
    subtitle: '40 LGS sorusu · 45 dakika timer · gerçek sınav simülasyonu',
    tip: 'Sınav koşullarında pratik yapmak zaman yönetimini ve performansı güçlendirir.',
    benefits: ['Gerçek LGS sınav koşullarını simüle eder', 'Zaman yönetimi becerisini geliştirir', 'Performans analiziyle zayıf noktaları bulur'],
    steps:    ['45 dakika geri sayım başlar', '40 soru sırayla gelir', 'Süre bitince detaylı analiz raporun hazır'],
    stats:    [{ label: 'Soru', value: '40 adet' }, { label: 'Süre', value: '45 dakika' }, { label: 'Format', value: 'LGS gerçek' }],
  },
  'hatali-cumle': {
    icon: '🔎', label: 'Hatalı Cümle', accent: '#92400E',
    subtitle: 'Dil bilgisi hatasını bul — 20 tur dikkat egzersizi',
    tip: 'Türkçe soru hatasını fark etme becerisini geliştirir.',
    benefits: ['Türkçe dil bilgisi kurallarını pekiştirir', 'Hata fark etme refleksini hızlandırır', 'LGS Türkçe sorusunda +5 puan potansiyeli'],
    steps:    ['Dil bilgisi hatalı cümle gösterilir', '4 şıktan hatayı içeren seçeneği bul', '20 tur sonunda doğruluk oranını gör'],
    stats:    [{ label: 'Tur', value: '20 soru' }, { label: 'Şık', value: '4 seçenek' }, { label: 'Konu', value: 'Dil bilgisi' }],
  },
  'flashcard-bank': {
    icon: '🃏', label: 'Flash Kart Bankası', accent: '#0E7490',
    subtitle: 'Soruları kart formatında geç — işaretle ve tekrar et',
    tip: '375 soru, serbest tempo, işaretleme sistemi.',
    benefits: ['375 soru serbest tempoda çalışılır', 'Yanlışları işaretle, sonra tekrar et', 'Konuya göre filtreleme imkânı'],
    steps:    ['Kart önü: soru gösterilir', 'Kartı çevir: cevap ve açıklama görünür', 'Doğru/Yanlış işaretle, sonraki karta geç'],
    stats:    [{ label: 'Soru', value: '375 kart' }, { label: 'Tempo', value: 'Serbest' }, { label: 'Filtre', value: 'Konuya göre' }],
  },
  'kelime-baglami': {
    icon: '🔤', label: 'Kelime Bağlamı', accent: '#3730A3',
    subtitle: 'Altı çizili kelimeyi cümleden anlamlandır · 4 şık',
    tip: 'LGS kelime anlam sorusunun tam format eğitimi.',
    benefits: ['LGS kelime-anlam sorusu birebir format', 'Bağlamdan anlam çıkarma becerisini geliştirir', 'Kelime haznesini genişletir'],
    steps:    ['Cümle içinde altı çizili kelime gösterilir', '4 şıktan doğru anlamı seç', 'Her turda farklı bağlam ve kelime'],
    stats:    [{ label: 'Format', value: 'LGS birebir' }, { label: 'Şık', value: '4 seçenek' }, { label: 'Tur', value: '10 soru' }],
  },
  'poetry-analysis': {
    icon: '🖊️', label: 'Şiir Analizi', accent: '#86198F',
    subtitle: '5 şiir · edebi sanat + anlam soruları · AYT Edebiyat',
    tip: 'Edebi sanatları cümle içinde tanıma egzersizi.',
    benefits: ['AYT Edebiyat şiir sorularına hazırlar', 'Teşbih, istiare, mecaz sanatlarını tanır', 'Anlam ve tema analizi becerisi kazandırır'],
    steps:    ['Şiir dörtlükleriyle gösterilir', 'Edebi sanat ve anlam soruları gelir', '5 şiir tamamlandığında analiz raporu'],
    stats:    [{ label: 'Şiir', value: '5 adet' }, { label: 'Soru', value: 'Edebi sanat' }, { label: 'Hedef', value: 'AYT Ede.' }],
  },
  'daily-training': {
    icon: '🚀', label: 'Günlük Antrenman', accent: '#FF6B35',
    subtitle: 'Her gün bir metin seç · hızını ölç · anlama soruları',
    tip: 'Günlük düzenli pratik, WPM artışını 3×e katlar.',
    benefits: ['Sınava özel içerikle her gün pratik yaparsın', 'WPM ve anlama oranını takip edersin', 'Streak bonusuyla motivasyonun canlı kalır'],
    steps:    ['Sınavını seç (LGS, TYT, AYT...)', 'Ders ve metin seç', 'Oku · Soruları yanıtla · Puanı gör'],
    stats:    [{ label: 'Süre', value: '5-10 dk' }, { label: 'Format', value: 'Sınava özel' }, { label: 'Hedef', value: '+WPM her gün' }],
  },
  'graph-reading': {
    icon: '📊', label: 'Grafik Okuma', accent: '#164E63',
    subtitle: 'Veri grafiklerini yorumla · çıkarım soruları · AYT/LGS',
    tip: 'Görsel veri okuma hızı AYT puanını doğrudan etkiler.',
    benefits: ['Tablo ve grafik yorumlama hızını artırır', 'Veri çıkarımı ve karşılaştırma becerisi', 'AYT Matematik ve LGS Fen soruları için şart'],
    steps:    ['Çubuk/çizgi/pasta grafik gösterilir', 'Veri yorumlama soruları gelir', 'Çıkarım ve karşılaştırma sorularını yanıtla'],
    stats:    [{ label: 'Grafik', value: '5 farklı tip' }, { label: 'Soru', value: 'Veri çıkarım' }, { label: 'Hedef', value: 'AYT/LGS' }],
  },
  'deep_comprehension': {
    icon: '🧠', label: 'Derin Kavrama', accent: '#7C3AED',
    subtitle: 'Serbest hızda oku · yazı boyutunu ayarla · anlama soruları',
    tip: 'Ağır akademik metinleri derinlemesine çözümlemek için en etkili mod.',
    benefits: ['Serbest tempoda derin anlama becerisi', 'Yazı boyutu konfora göre ayarlanabilir', 'Çıkarım ve değerlendirme sorularıyla pekiştir'],
    steps:    ['Uzun akademik metin gösterilir', 'Yazı boyutunu ve hızı isteğine göre ayarla', 'Çıkarım + değerlendirme soruları gelir'],
    stats:    [{ label: 'Metin', value: '400+ kelime' }, { label: 'Soru', value: '3-5 MCQ' }, { label: 'Hedef', value: 'AYT/YKS' }],
  },
}

interface Props {
  moduleKey: string
  onStart:  () => void
  onBack:   () => void
}

export default function ReadingModuleIntro({ moduleKey, onStart, onBack }: Props) {
  const info = MODULE_INTRO[moduleKey]
  const setPending = usePendingReadingStore(s => s.set)
  const needsContent = CONTENT_MODULES.has(moduleKey)

  const [modalOpen,       setModalOpen]       = useState(false)
  const [selectedTitle,   setSelectedTitle]   = useState<string | null>(null)
  const [contentReady,    setContentReady]    = useState(!needsContent)

  const handleContentSelected = useCallback((content: ImportedContent) => {
    setModalOpen(false)
    setSelectedTitle(content.title)
    setContentReady(true)
    if (content.source === 'library' && content.libraryTextId) {
      setPending({
        textId:    content.libraryTextId,
        title:     content.title,
        examType:  '',
        category:  '',
        wordCount: content.wordCount,
      })
    } else {
      // Yapıştırılan / yazılan metin
      setPending({
        textId:     '__custom__',
        title:      content.title,
        examType:   '',
        category:   '',
        wordCount:  content.wordCount,
        customText: content.text,
      })
    }
  }, [setPending])

  if (!info) {
    onStart()
    return null
  }

  const pal = getPalette(info.accent)

  return (
    <SafeAreaView style={[s.root, { backgroundColor: pal.content }]}>

      {/* ── İmmersif Header ─────────────────────────────────────── */}
      <View style={[s.header, { backgroundColor: pal.header }]}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <View style={s.heroRow}>
          <LinearGradient
            colors={[info.accent, info.accent + 'BB']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.iconWrap}
          >
            <Text style={s.icon}>{info.icon}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>{info.label}</Text>
            <Text style={s.subtitle} numberOfLines={2}>{info.subtitle}</Text>
          </View>
        </View>
      </View>

      {/* ── Kaydırılabilir İçerik ─────────────────────────────── */}
      <ScrollView style={s.scroll} contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* İstatistik Çubukları */}
        <View style={s.statsRow}>
          {info.stats.map((st, i) => (
            <View key={i} style={[s.statBox, { borderColor: info.accent + '40', backgroundColor: '#fff' }]}>
              <Text style={[s.statVal, { color: info.accent }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Nasıl Çalışır */}
        <View style={[s.sectionCard, { borderLeftColor: info.accent, backgroundColor: '#fff' }]}>
          <Text style={[s.sectionHead, { color: info.accent }]}>💡 Nasıl Çalışır?</Text>
          <Text style={s.sectionTxt}>{info.tip}</Text>
        </View>

        {/* Adımlar */}
        <View style={[s.sectionCard, { borderLeftColor: info.accent, backgroundColor: '#fff' }]}>
          <Text style={[s.sectionHead, { color: info.accent }]}>📋 Bu Egzersizde</Text>
          {info.steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={[s.stepNum, { backgroundColor: info.accent }]}>
                <Text style={s.stepNumTxt}>{i + 1}</Text>
              </View>
              <Text style={s.stepTxt}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Kazanımlar */}
        <View style={[s.sectionCard, { borderLeftColor: info.accent, backgroundColor: '#fff' }]}>
          <Text style={[s.sectionHead, { color: info.accent }]}>🏆 Ne Kazanacaksın?</Text>
          {info.benefits.map((b, i) => (
            <View key={i} style={s.benefitRow}>
              <Text style={[s.checkMark, { color: info.accent }]}>✓</Text>
              <Text style={s.benefitTxt}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Metin Seçici — sadece metin gerektiren modüller */}
        {needsContent && (
          <TouchableOpacity
            onPress={() => setModalOpen(true)}
            style={[s.contentPicker, {
              borderColor: contentReady ? info.accent : info.accent + '50',
              backgroundColor: contentReady ? info.accent + '10' : '#fff',
            }]}
            activeOpacity={0.8}
          >
            <View style={[s.contentPickerIcon, { backgroundColor: info.accent + '20' }]}>
              <Text style={{ fontSize: 20 }}>📄</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.contentPickerLabel, { color: info.accent }]}>METİN</Text>
              <Text style={s.contentPickerVal} numberOfLines={1}>
                {selectedTitle ?? 'Kütüphaneden seç veya yapıştır'}
              </Text>
            </View>
            <View style={[s.contentPickerBtn, { backgroundColor: info.accent }]}>
              <Text style={s.contentPickerBtnTxt}>{selectedTitle ? 'Değiştir' : 'Seç ›'}</Text>
            </View>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* ── Başlat Butonu ─────────────────────────────────────────── */}
      <View style={[s.footer, { backgroundColor: pal.bottom }]}>
        <TouchableOpacity
          style={[s.startBtn, { backgroundColor: contentReady ? info.accent : '#9CA3AF' }]}
          onPress={contentReady ? onStart : () => setModalOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={s.startTxt}>
            {contentReady ? '⚡  Egzersizi Başlat' : '📄  Önce Metin Seç'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Metin Seçici Modal ──────────────────────────────────── */}
      {needsContent && (
        <ContentImportModal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          onContentSelected={handleContentSelected}
        />
      )}

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1 },

  // Header
  header: { paddingBottom: 20 },
  backBtn: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backTxt:  { fontSize: 15, color: 'rgba(255,255,255,0.90)', fontWeight: '600' },
  heroRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 4 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.30, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  icon:     { fontSize: 32 },
  label:    { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 4, lineHeight: 17 },

  // Scroll & Body
  scroll: { flex: 1 },
  body:   { padding: 16, gap: 12, paddingBottom: 24 },

  // Stats row
  statsRow:  { flexDirection: 'row', gap: 8 },
  statBox:   {
    flex: 1, borderRadius: 14, borderWidth: 1.5,
    paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  statVal:   { fontSize: 15, fontWeight: '900', letterSpacing: -0.3 },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#6B7280', marginTop: 3 },

  // Section cards
  sectionCard: {
    borderRadius: 16, borderLeftWidth: 4, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  sectionHead: { fontSize: 12, fontWeight: '800', marginBottom: 10, letterSpacing: 0.3 },
  sectionTxt:  { fontSize: 14, lineHeight: 21, color: '#374151', fontWeight: '500' },

  // Steps
  stepRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  stepNum:   { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumTxt:{ fontSize: 11, fontWeight: '900', color: '#fff' },
  stepTxt:   { flex: 1, fontSize: 13, lineHeight: 19, color: '#374151', fontWeight: '500' },

  // Benefits
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 7 },
  checkMark:  { fontSize: 14, fontWeight: '900', marginTop: 1 },
  benefitTxt: { flex: 1, fontSize: 13, lineHeight: 19, color: '#374151', fontWeight: '500' },

  // Content picker row
  contentPicker: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, borderWidth: 1.5, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  contentPickerIcon:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contentPickerLabel:   { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 3 },
  contentPickerVal:     { fontSize: 13, fontWeight: '600', color: '#374151' },
  contentPickerBtn:     { borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 },
  contentPickerBtnTxt:  { fontSize: 12, fontWeight: '800', color: '#fff' },

  // Footer
  footer: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 },
  startBtn: {
    borderRadius: 18, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  startTxt: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
})
