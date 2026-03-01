-- ================================================================
-- 035_vocabulary.sql
-- Kelime hazinesi egzersizi için kelime listesi
-- TYT / LGS / AYT düzeyi — Türkçe kelimeler + MCQ seçenekleri
-- ================================================================

CREATE TABLE IF NOT EXISTS vocabulary_words (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  word           text    NOT NULL,
  meaning        text    NOT NULL,
  example_sentence text,
  exam_type      text    NOT NULL DEFAULT 'all'
    CHECK (exam_type IN ('lgs', 'tyt', 'ayt', 'all')),
  difficulty     int     NOT NULL DEFAULT 2
    CHECK (difficulty BETWEEN 1 AND 5),
  -- 3 yanlış seçenek (MCQ için)
  wrong_option_1 text    NOT NULL,
  wrong_option_2 text    NOT NULL,
  wrong_option_3 text    NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vocab_exam_diff
  ON vocabulary_words(exam_type, difficulty);

-- RLS — Herkes okuyabilir (anon dahil)
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vocab_select_all"
  ON vocabulary_words FOR SELECT TO anon, authenticated
  USING (true);

-- ─── Kelime Seed Verisi (40 kelime) ──────────────────────────────

INSERT INTO vocabulary_words
  (word, meaning, example_sentence, exam_type, difficulty,
   wrong_option_1, wrong_option_2, wrong_option_3)
VALUES
-- ── TYT / Tüm sınavlar — Zorluk 2 ──────────────────────────────
('ivedi',       'Acil, çok çabuk yapılması gereken',
 'İvedi bir toplantı çağrısı aldım.',
 'all', 2, 'Gereksiz', 'Ertelenmiş', 'Sıradan'),

('müsrif',      'Savurgan, çok harcayan',
 'Müsrif biri paraya değer vermez.',
 'all', 2, 'Tutumlu', 'Cömert', 'İhtiyatlı'),

('mahkûm',      'Suçlu bulunan, ceza almış kişi',
 'Mahkûm pişmanlığını dile getirdi.',
 'all', 2, 'Tanık', 'Savcı', 'Mağdur'),

('mecaz',       'Gerçek anlamı dışında kullanılan söz',
 'Bu cümlede mecaz anlam kullanılmış.',
 'all', 2, 'Somut ifade', 'Düz anlam', 'Argo'),

('erdem',       'Ahlaki üstünlük, fazilet',
 'Dürüstlük en önemli erdemlerden biridir.',
 'all', 2, 'Kusur', 'Adet', 'Alışkanlık'),

('baskın',      'Baskı yaparak üstün gelen',
 'Güçlü sesler müzikte baskın çıktı.',
 'all', 2, 'Zayıf', 'Sessiz', 'Geri planda kalan'),

('tekin',       'Güvenli, emin, emniyetli',
 'O yol gece tekin değil.',
 'all', 2, 'Tehlikeli', 'Hızlı', 'Kalabalık'),

('yalın',       'Süssüz, sade, katışıksız',
 'Yalın bir anlatım tercih etti.',
 'all', 2, 'Süslü', 'Karmaşık', 'Biçimsel'),

-- ── TYT — Zorluk 3 ───────────────────────────────────────────────
('müstehak',    'Hak etmiş olan, layık',
 'Bu başarıyı müstehaktı zaten.',
 'tyt', 3, 'Layık olmayan', 'Şanslı', 'Rastlantısal'),

('ihtiyati',    'Önlem amaçlı, tedbiri olan',
 'İhtiyati tedbir kararı alındı.',
 'tyt', 3, 'Acil', 'Gönüllü', 'Keyfi'),

('muğlak',      'Anlaşılması güç, belirsiz',
 'Cevabı çok muğlaktı.',
 'tyt', 3, 'Net', 'Açık', 'Anlaşılır'),

('mütevazı',    'Alçakgönüllü, gösterişsiz',
 'Mütevazı biri gibi konuştu.',
 'tyt', 3, 'Kibirli', 'Gururlu', 'Gösterişli'),

('acımasız',    'Merhametin olmadığı, zalim',
 'Acımasız bir eleştiriye uğradı.',
 'tyt', 3, 'Nazik', 'Sabırlı', 'Anlayışlı'),

('kaçınılmaz',  'Önüne geçilemeyen, zorunlu',
 'Kaçınılmaz bir son olarak gördü.',
 'tyt', 3, 'Engellenebilir', 'İsteğe bağlı', 'Tesadüfi'),

('öz',          'Bir şeyin en temel, özgün niteliği',
 'Konunun özünü kavramak önemli.',
 'tyt', 3, 'Dış', 'Görünüş', 'Biçim'),

('çelişki',     'İki düşüncenin birbirine aykırı düşmesi',
 'Söyledikleri çelişki içeriyordu.',
 'tyt', 3, 'Uyum', 'Benzerlik', 'Destekleme'),

('sezgi',       'Akıl yürütmeden elde edilen iç duygu',
 'Sezgisi onu doğruya yöneltti.',
 'tyt', 3, 'Kanıt', 'Analiz', 'Deney'),

('bütünlük',    'Parçaların bir araya gelerek oluşturduğu tam yapı',
 'Metnin bütünlüğünü bozmamak gerekir.',
 'tyt', 3, 'Parçalılık', 'Dağınıklık', 'Eksiklik'),

-- ── TYT — Zorluk 4 ───────────────────────────────────────────────
('istidlal',    'Bir sonucu mantıksal olarak çıkarma',
 'İstidlal yeteneği geliştirilmeli.',
 'tyt', 4, 'Tahmin', 'Ezber', 'Sezgi'),

('münhasıran',  'Yalnızca, sadece, özel olarak',
 'Bu hak münhasıran size aittir.',
 'tyt', 4, 'Kısmen', 'Genel olarak', 'Herkese açık'),

('mürekkep',    'Birden fazla şeyden oluşan, bileşik',
 'Mürekkep bir yapıya sahip.',
 'tyt', 4, 'Basit', 'Tekil', 'Saf'),

('özgün',       'Başkasından alınmamış, kendine özgü',
 'Özgün bir yaklaşım sergiledi.',
 'tyt', 4, 'Kopya', 'Taklit', 'Ödünç alınmış'),

-- ── LGS — Zorluk 2 ───────────────────────────────────────────────
('yurt',        'Vatan, memleket ya da barınak',
 'Bu topraklar bizim yurdumuz.',
 'lgs', 2, 'Yabancı', 'Geçici yer', 'Sığınak'),

('ödül',        'Başarı karşılığı verilen değer',
 'Yarışmada ödül kazandı.',
 'lgs', 2, 'Ceza', 'Görev', 'Anlaşma'),

('gözlem',      'Dikkatli bakarak bilgi edinme',
 'Gözlem yaparak sonuç çıkardı.',
 'lgs', 2, 'Hayal', 'Tahmin', 'Sezgi'),

('zemin',       'Taban, altlık, temel',
 'Zemin çok kaygan, dikkatli ol.',
 'lgs', 2, 'Tavan', 'Kenar', 'Köşe'),

('özen',        'Titizlik, dikkate değer çalışma',
 'Özenle hazırlanmış bir proje.',
 'lgs', 2, 'Dikkatsizlik', 'Acelecilik', 'Umursamazlık'),

('acıklı',      'Üzüntü veren, içler sıkıcı',
 'Acıklı bir hikâye anlattı.',
 'lgs', 2, 'Komik', 'Mutlu', 'Neşeli'),

('varsayım',    'Kanıtlanmamış ön kabul, hipotez',
 'Bu varsayım henüz doğrulanmadı.',
 'lgs', 2, 'Kanıt', 'Sonuç', 'Gerçek'),

('ivme',        'Hız değişiminin oranı (fizik/mecaz)',
 'Projenin ivmesi arttı.',
 'lgs', 2, 'Yavaşlama', 'Duraksamа', 'Gerileme'),

-- ── AYT — Zorluk 4 ───────────────────────────────────────────────
('epistemoloji','Bilginin kaynağı ve sınırlarını inceleyen felsefe dalı',
 'Epistemoloji Kant''ta önemli bir yer tutar.',
 'ayt', 4, 'Psikoloji', 'Ontoloji', 'Kozmoloji'),

('deontoloji',  'Görev ve yükümlülüklere dayalı ahlak teorisi',
 'Deontoloji sonuçtan bağımsız olarak görev vurgular.',
 'ayt', 4, 'Sonuç etiği', 'Erdem etiği', 'Hedonizm'),

('paradigma',   'Bir alanda genel kabul görmüş düşünce çerçevesi',
 'Yeni araştırma mevcut paradigmayı sorguluyor.',
 'ayt', 4, 'Teori', 'Deney', 'Gözlem'),

('tümdengelim', 'Genelden özele mantık yürütme biçimi',
 'Tümdengelim yöntemi ile sonuca ulaşıldı.',
 'ayt', 4, 'Tümevarım', 'Analoji', 'İstidlal'),

('özgürlükçü',  'Bireysel özgürlüğe önem veren tutum',
 'Özgürlükçü bir felsefi tutum benimsedi.',
 'ayt', 4, 'Baskıcı', 'Kolektivist', 'Otoriter'),

('dialektik',   'Zıt görüşleri tartışarak gerçeğe ulaşma yöntemi',
 'Diyalektik düşünce karşıtlıklarla ilerler.',
 'ayt', 4, 'Dogma', 'İnanç', 'Sezgi'),

-- ── AYT — Zorluk 5 ───────────────────────────────────────────────
('varoluşçuluk','İnsanın özünün varoluşundan sonra geldiğini savunan akım',
 'Sartre varoluşçuluğun önemli temsilcisidir.',
 'ayt', 5, 'Determinizm', 'Materyalizm', 'Nihilizm'),

('hermenötik',  'Yorumlama ve anlama yöntemini inceleyen alan',
 'Hermenötik metin yorumunda kritik rol oynar.',
 'ayt', 5, 'Retorik', 'Semiyoloji', 'Fenomenoloji'),

('teleoloji',   'Amaç ve ereklilik üzerine kurulu felsefe',
 'Teleoloji doğanın bir amaca yönelik işlediğini savunur.',
 'ayt', 5, 'Kozmoloji', 'Ontoloji', 'Aksiyoloji'),

('nominalizm',  'Tümel kavramların gerçek varlıkları olmadığını savunan görüş',
 'Nominalizme göre sadece bireyler gerçektir.',
 'ayt', 5, 'Realizm', 'İdealizm', 'Materyalizm')
;
