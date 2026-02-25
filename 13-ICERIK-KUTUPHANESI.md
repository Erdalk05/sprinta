# 13 — İÇERİK KÜTÜPHANESİ
## MEB Uyumlu Metin Havuzu ve Kategorizasyon

---

## 1. İÇERİK STRATEJİSİ

SPRINTA'nın başarısı kısmen metin kalitesine bağlıdır. Tüm içerikler:
- **MEB müfredatına uygun** (8-12. sınıf seviyesi)
- **Sınav odaklı** (LGS, TYT, AYT tarzı sorular)
- **Flesch-Kincaid okunabilirlik** skoru hesaplanmış
- **Telif hakkı sorunsuz** (özgün üretim veya kamu domain)

---

## 2. METİN KATEGORİLERİ

```typescript
// packages/shared/src/constants/content.ts

export const CONTENT_CATEGORIES = {
  // Türkçe / Edebiyat
  NARRATIVE: 'Anlatma Esaslı',      // Hikaye, roman parçaları
  DESCRIPTIVE: 'Betimleme',          // Yer, kişi, olay betimleme
  ARGUMENTATIVE: 'Tartışmacı',       // Fikir yazıları, eleştiri
  INFORMATIVE: 'Bilgilendirici',     // Ansiklopedik, öğretici
  
  // Bilim / Fen
  SCIENCE_BIO: 'Biyoloji',
  SCIENCE_PHY: 'Fizik / Astronomi',
  SCIENCE_CHEM: 'Kimya / Çevre',
  
  // Sosyal
  HISTORY: 'Tarih',
  GEOGRAPHY: 'Coğrafya',
  PHILOSOPHY: 'Felsefe / Psikoloji',
  CURRENT_AFFAIRS: 'Güncel Olaylar',
} as const;

// Sınav tarzı → içerik ağırlığı
export const EXAM_CONTENT_WEIGHTS = {
  lgs:  { narrative: 0.4, informative: 0.35, argumentative: 0.25 },
  tyt:  { narrative: 0.3, informative: 0.4,  argumentative: 0.3  },
  ayt:  { narrative: 0.25, argumentative: 0.4, informative: 0.35 },
  kpss: { informative: 0.5, argumentative: 0.3, narrative: 0.2   },
};

// Güçlük → kelime sayısı ve okunabilirlik
export const DIFFICULTY_TEXT_PARAMS = {
  1:  { minWords: 80,  maxWords: 120, targetFlesch: 75 },
  2:  { minWords: 100, maxWords: 150, targetFlesch: 70 },
  3:  { minWords: 120, maxWords: 200, targetFlesch: 65 },
  4:  { minWords: 150, maxWords: 250, targetFlesch: 60 },
  5:  { minWords: 200, maxWords: 300, targetFlesch: 55 },
  6:  { minWords: 250, maxWords: 350, targetFlesch: 50 },
  7:  { minWords: 300, maxWords: 450, targetFlesch: 45 },
  8:  { minWords: 400, maxWords: 550, targetFlesch: 40 },
  9:  { minWords: 500, maxWords: 650, targetFlesch: 35 },
  10: { minWords: 600, maxWords: 800, targetFlesch: 30 },
};
```

---

## 3. ÖRNEK HAZIR METİNLER (Seed Data)

```sql
-- supabase/seed/content.sql

-- ==============================
-- Güçlük 2 — Anlatma Esaslı
-- ==============================
INSERT INTO content_library (
  title, content, category, difficulty, word_count, flesch_score,
  target_wpm, exam_types, grade_levels, source_type
) VALUES (
  'Tohumun Yolculuğu',
  'Küçük bir tohum, güz mevsiminde annesinden ayrıldı. Rüzgar onu uzaklara taşıdı; dağ yollarından geçti, derelerin üzerinden uçtu. Sonunda verimli bir ovada toprağa düştü.
  
Kış boyunca toprak içinde uyudu. Kar altında, soğukta, karanlıkta bekledi. Kimse onun orada olduğunu bilmiyordu. Kimse onu görmüyor, kimse onu duymuyordu.
  
İlkbaharda yağmur yağdı. Toprak ısındı. Tohum içinden bir şeyler kabardı; önce ince bir filiz, sonra iki yaprak, sonra bir gövde. Güneşe doğru uzandı.
  
Yaz sonunda o küçük tohum, çevresine yüzlerce tohumunu saçan iri bir bitkiye dönüşmüştü. Her biri yeni bir yolculuğa hazır, her biri yeni bir başlangıcın umuduydu.',
  'narrative', 2, 130, 72,
  180, ARRAY['lgs', 'tyt'], ARRAY[5, 6, 7, 8],
  'original'
);

-- ==============================
-- Güçlük 4 — Bilgilendirici
-- ==============================
INSERT INTO content_library (
  title, content, category, difficulty, word_count, flesch_score,
  target_wpm, exam_types, grade_levels, source_type,
  questions
) VALUES (
  'Göç Eden Kuşlar',
  'Her yıl milyonlarca kuş, yaşam koşullarının olumsuzlaştığı bölgelerden daha uygun iklimlere doğru uzun yolculuklara çıkar. Bu doğa olayına göç adı verilir. Göç, yalnızca kuşlara özgü değildir; balıklar, kelebekler ve memeliler de mevsimlik hareketler yapar.

Kuşlar göç rotalarını nasıl belirler? Bilim insanları onlarca yıl boyunca bu soruyu araştırmış ve çarpıcı bulgulara ulaşmıştır. Kuşlar, Güneş'in konumundan ve yıldızlardan yön tayini yapabilir. Bunun yanı sıra, beyin hücrelerinde bulunan magnetit minerali sayesinde Dünya'nın manyetik alanını algılayarak adeta dahili bir pusula kullanabilirler.

Uzun mesafe göççüsü kuşlar arasında en çarpıcı örnek arktik kartalcasıdır. Bu kuş, yılda yaklaşık 70.000 kilometre uçarak Kuzey Kutbu ile Antarktika arasındaki yolculuğu tamamlar. Bu mesafe, Dünya'yı bir buçuk kez dolaşmaya eşdeğerdir.

İklim değişikliği, göç örüntülerini bozmaktadır. Bazı türler normalde göç ettikleri bölgelerde kışlamaya başlamıştır. Bu değişim, bitki ve hayvan popülasyonları arasındaki hassas dengeleri tehdit ederek tahmin edilemeyen ekolojik sonuçlar doğurabilir.',
  'science_bio', 4, 210, 60,
  220, ARRAY['lgs', 'tyt', 'ayt'], ARRAY[7, 8, 9, 10, 11, 12],
  'original',
  '[
    {
      "question": "Arktik kartalcasının yıllık göç mesafesi yaklaşık kaç kilometredir?",
      "options": ["35.000", "50.000", "70.000", "90.000"],
      "correct": 2,
      "type": "detail",
      "explanation": "Metin bu mesafenin Dünya''yı bir buçuk kez dolaşmaya eşdeğer olduğunu belirtmiştir."
    },
    {
      "question": "Metne göre kuşlar yön tayininde aşağıdakilerden hangisini kullanmaz?",
      "options": ["Güneş'in konumu", "Manyetik alan", "Yıldızlar", "Su akıntıları"],
      "correct": 3,
      "type": "detail",
      "explanation": "Metinde yalnızca Güneş, manyetik alan ve yıldızlardan söz edilmiştir."
    },
    {
      "question": "İklim değişikliğinin göç örüntüleri üzerindeki etkisi için metinde verilen bilgi aşağıdakilerden hangisidir?",
      "options": [
        "Tüm kuşlar göçü bırakmıştır",
        "Bazı türler göç etmeleri gereken yerde kışlamaktadır",
        "Göç mesafeleri kısalmaktadır",
        "Yeni göç rotaları oluşmaktadır"
      ],
      "correct": 1,
      "type": "inference",
      "explanation": "Metin, bazı türlerin normalde göç ettikleri bölgelerde kışlamaya başladığını ifade etmektedir."
    },
    {
      "question": "Bu metnin ana fikri aşağıdakilerden hangisidir?",
      "options": [
        "Arktik kartalcası dünyanın en uzun göçünü yapan kuştur",
        "Kuş göçü karmaşık bir navigasyon sistemi gerektiren doğal bir olgudur",
        "İklim değişikliği kuşları olumsuz etkilemektedir",
        "Göç sadece kuşlara özgü bir davranıştır"
      ],
      "correct": 1,
      "type": "main_idea",
      "explanation": "Metin göçü tanımlayarak nasıl gerçekleştiğini ve güncel tehditlerini bütüncül biçimde ele almaktadır."
    }
  ]'::jsonb
);

-- ==============================
-- Güçlük 6 — Tartışmacı
-- ==============================
INSERT INTO content_library (
  title, content, category, difficulty, word_count, flesch_score,
  target_wpm, exam_types, grade_levels, source_type,
  questions
) VALUES (
  'Dijital Çağda Dikkat',
  'Modern insan, tarihin hiçbir döneminde bu kadar çok bilgiye bu kadar hızlı erişemezdi. Akıllı telefonlar, sosyal medya platformları ve anlık bildirimler, düşünce akışımızı sürekli kesen bir çevre yaratmaktadır. Nörobilimciler, bu durumun dikkat süremizi köklü biçimde değiştirdiğini öne sürmektedir.

Dikkat süresi, beyinin odaklanma kapasitesiyle doğrudan ilişkilidir. Araştırmalar, sürekli bölünme halindeki bir zihnin derin düşünme için gerekli bağlantıları kurmakta güçlük çektiğini ortaya koymaktadır. Kısa videolar ve anlık içerikler, ödül sistemi olarak bilinen dopamin döngüsünü sürekli tetiklemekte; bu durum uzun soluklu okuma ve analitik düşünmeyi giderek zorlaştırmaktadır.

Öte yandan karşı görüşler de göz ardı edilemez. Dijital araçlar bilgiye erişimi demokratikleştirmiş, öğrenme olanaklarını genişletmiş ve küresel iletişimi mümkün kılmıştır. Teknolojinin kendisi sorun değil, onunla kurduğumuz ilişkidir. Bilinçli teknoloji kullanımı, dikkat eğitimi programlarıyla birleştirildiğinde olumsuz etkileri azaltmak mümkündür.

Ancak eğitimciler açısından tablo endişe vericidir. Uzun metinleri anlayarak okuma becerisi giderek azalmakta; buna bağlı olarak kavrama, çıkarım yapma ve eleştirel değerlendirme gibi üst düzey düşünme becerileri de gerilemektedir. Bu beceriler, yalnızca sınav başarısı için değil, sağlıklı bir demokratik toplumun sürdürülebilirliği açısından da temel önem taşımaktadır.',
  'argumentative', 6, 280, 50,
  260, ARRAY['tyt', 'ayt', 'kpss'], ARRAY[10, 11, 12],
  'original',
  '[
    {
      "question": "Yazar bu metinde temel olarak hangi tezi savunmaktadır?",
      "options": [
        "Dijital araçlar her koşulda zararlıdır",
        "Sürekli bölünme hali derin düşünme kapasitesini olumsuz etkilemektedir",
        "Teknoloji eğitimi zorunlu hale getirilmelidir",
        "Sosyal medya yasaklanmalıdır"
      ],
      "correct": 1,
      "type": "main_idea",
      "explanation": "Yazar, çoklu bölünmenin derin düşünmeyi engellediğini ana tez olarak sunmaktadır."
    },
    {
      "question": "Dopamin döngüsü bu metinde ne amaçla kullanılmıştır?",
      "options": [
        "Teknoloji bağımlılığının tedavisini açıklamak için",
        "Kısa içeriklerin neden çekici geldiğini açıklamak için",
        "Dijital okuryazarlığın önemini vurgulamak için",
        "Bilişsel gelişimi desteklemek için"
      ],
      "correct": 1,
      "type": "inference",
      "explanation": "Metin, dopamin döngüsünün kısa içerikleri çekici kıldığını ve bunun uzun okumayı zorlaştırdığını belirtmektedir."
    },
    {
      "question": "Üst düzey düşünme becerilerinin gerilemesinin yalnızca sınav başarısını değil, demokratik toplumu da etkilediği belirtilmiştir. Bu ifade metinde hangi amaca hizmet etmektedir?",
      "options": [
        "Eğitim sistemini eleştirmek",
        "Sorunun bireysel değil toplumsal boyutuna dikkat çekmek",
        "Teknolojiyi tamamen reddetmek",
        "Eğitimcilerin yetersizliğini göstermek"
      ],
      "correct": 1,
      "type": "inference",
      "explanation": "Yazar, meselenin sadece bireysel başarıyı değil toplumsal sağlığı da ilgilendirdiğini vurgulamaktadır."
    }
  ]'::jsonb
);
```

---

## 4. OKUNABILIRLIK SKORU HESAPLAYICI

```typescript
// packages/shared/src/utils/readabilityScorer.ts

/**
 * Türkçe metinler için uyarlanmış Flesch okunabilirlik skoru
 * Orijinal formülden Türkçe hece yapısına göre düzenlenmiştir
 */
export function calculateFleschScore(text: string): number {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  const words = text
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, ''))
    .filter(w => w.length > 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = words.reduce((sum, word) => {
    return sum + countTurkishSyllables(word);
  }, 0) / words.length;

  // Türkçe uyarlamalı Flesch formülü
  const score = 206.835
    - (1.015 * avgWordsPerSentence)
    - (84.6 * avgSyllablesPerWord);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function countTurkishSyllables(word: string): number {
  const vowels = /[aeıioöuüAEIİOÖUÜ]/g;
  const matches = word.match(vowels);
  return matches ? matches.length : 1;
}

/**
 * Hedef WPM'i güçlük seviyesine göre belirle
 */
export function getTargetWpm(difficulty: number): number {
  return 150 + (difficulty - 1) * 20;
}

/**
 * Metnin güçlük seviyesini tahmin et
 */
export function estimateDifficulty(text: string): number {
  const flesch = calculateFleschScore(text);
  const words = text.split(/\s+/).length;

  let difficulty = 5;

  // Flesch skoru düşükse → daha zor
  if (flesch >= 70) difficulty -= 2;
  else if (flesch >= 60) difficulty -= 1;
  else if (flesch <= 40) difficulty += 2;
  else if (flesch <= 50) difficulty += 1;

  // Uzun metin → daha zor
  if (words > 500) difficulty += 2;
  else if (words > 300) difficulty += 1;
  else if (words < 100) difficulty -= 2;
  else if (words < 150) difficulty -= 1;

  return Math.max(1, Math.min(10, difficulty));
}
```

---

## 5. İÇERİK YÖNETİM SERVİSİ

```typescript
// packages/api-client/src/services/contentService.ts

import { createClient } from '@supabase/supabase-js';

export function createContentService(
  supabase: ReturnType<typeof createClient>
) {
  return {
    /**
     * Öğrencinin profiline uygun metin getir
     */
    async getAdaptiveContent(params: {
      studentId: string;
      exerciseType: string;
      difficulty: number;
      examTarget: string;
      excludeIds?: string[];
    }) {
      const { data } = await supabase
        .from('content_library')
        .select('id, title, content, category, difficulty, word_count, questions')
        .contains('exam_types', [params.examTarget])
        .gte('difficulty', Math.max(1, params.difficulty - 1))
        .lte('difficulty', Math.min(10, params.difficulty + 1))
        .not('id', 'in', `(${(params.excludeIds ?? []).join(',')})`)
        .order('RANDOM()')
        .limit(1)
        .single();

      return data;
    },

    /**
     * Son kullanılan metinlerin ID'lerini getir (tekrar önlemek için)
     */
    async getRecentlyUsedContentIds(
      studentId: string,
      limit = 20
    ): Promise<string[]> {
      const { data } = await supabase
        .from('sessions')
        .select('metrics')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const ids: string[] = [];
      data?.forEach(session => {
        const contentId = (session.metrics as { contentId?: string })?.contentId;
        if (contentId) ids.push(contentId);
      });

      return ids;
    },
  };
}
```

---

## 6. İÇERİK EKLEME ARACI (Admin)

```tsx
// apps/web/app/(admin)/content/new/page.tsx

'use client';

import { useState } from 'react';
import { calculateFleschScore, estimateDifficulty } from '@sprinta/shared';

export default function NewContentPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('informative');
  const [examTypes, setExamTypes] = useState<string[]>(['tyt']);

  // Otomatik hesaplanan değerler
  const wordCount = content.split(/\s+/).filter(w => w).length;
  const fleschScore = content.length > 50 ? calculateFleschScore(content) : 0;
  const estimatedDiff = content.length > 50 ? estimateDifficulty(content) : 5;

  async function handleSave() {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, content, category, examTypes,
        wordCount, fleschScore, difficulty: estimatedDiff,
      }),
    });
    if (res.ok) alert('İçerik kaydedildi!');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Yeni İçerik Ekle</h1>

      <div className="space-y-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Başlık"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white"
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Metin içeriği..."
          rows={12}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white"
        />

        {/* Otomatik metrikler */}
        {content.length > 50 && (
          <div className="bg-slate-700 rounded-lg p-4 flex gap-6">
            <div>
              <p className="text-slate-400 text-xs">Kelime</p>
              <p className="text-white font-bold">{wordCount}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Flesch</p>
              <p className="text-white font-bold">{fleschScore}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Tahmini Güçlük</p>
              <p className="text-indigo-400 font-bold">{estimatedDiff}/10</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
        >
          Kaydet
        </button>
      </div>
    </div>
  );
}
```

---

## ✅ FAZ 13 TAMAMLANMA KRİTERLERİ

```
✅ Seed data: En az 15 farklı metin yüklendi
✅ Her güçlük seviyesi (1-10) için en az 1 metin mevcut
✅ Her sınav tipi (LGS, TYT, AYT, KPSS) için metinler var
✅ Sorular JSONB formatında (main_idea, detail, inference tipleri)
✅ Flesch skoru ve güçlük otomatik hesaplanıyor
✅ Adaptive content servis: Profil'e uygun metin seçiyor
✅ Son kullanılan metinler hariç tutuluyor (tekrar önleme)
✅ Admin panelinde içerik ekleme arayüzü var
```
