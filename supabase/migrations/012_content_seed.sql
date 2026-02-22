-- ============================================================
-- 012_content_seed.sql
-- İçerik kütüphanesi: 25 Türkçe okuma metni
-- Kategoriler: fen, sosyal, edebiyat, tarih, coğrafya,
--              felsefe, teknoloji, sağlık, çevre, kültür&sanat
-- ============================================================

INSERT INTO content_library
  (title, body, source, category, difficulty, exam_types, grade_levels,
   word_count, avg_word_length, flesch_score, estimated_wpm_target,
   questions, is_published, is_exam_approved, source_type)
VALUES

-- ─────────────────────────────────────────────────────────────
-- 1. FEN BİLİMLERİ – cok_kolay – LGS
-- ─────────────────────────────────────────────────────────────
(
  'Fotosentez Nedir?',
  'Bitkiler, güneş ışığını kullanarak besin üretir. Bu sürece fotosentez denir. Fotosentez kloroplastlarda gerçekleşir. Kloroplastlar, yapraklara yeşil rengini veren klorofil pigmentini içerir. Bitki, karbondioksit ve suyu alır; güneş enerjisiyle glikoz ve oksijen üretir. Glikoz, bitkinin büyümesi için enerji kaynağı olarak kullanılır. Oksijen ise havaya salınır ve canlıların solunumu için gereklidir. Fotosentez sadece gündüz gerçekleşir çünkü güneş ışığına ihtiyaç duyar. Gece bitkiler solunumla enerji tüketir. Bu yüzden bitkiler hem üretici hem de tüketici konumundadır. Dünya üzerindeki tüm besin zincirlerinin temelini fotosentez yapan bitkiler oluşturur.',
  'Sprinta Orijinal',
  'fen_bilimleri',
  'cok_kolay',
  ARRAY['lgs']::exam_type[],
  ARRAY['ortaokul_8']::grade_level[],
  112, 5.8, 72.0, 140,
  '[
    {"question": "Fotosentez nerede gerçekleşir?", "options": ["Mitokondri", "Kloroplast", "Ribozom", "Çekirdek"], "correct_answer": "Kloroplast", "explanation": "Fotosentez, klorofil pigmentini içeren kloroplastlarda gerçekleşir."},
    {"question": "Fotosentez için aşağıdakilerden hangisi gerekmez?", "options": ["Güneş ışığı", "Karbondioksit", "Su", "Oksijen"], "correct_answer": "Oksijen", "explanation": "Fotosentezde oksijen ürün olarak açığa çıkar, hammadde değildir."},
    {"question": "Fotosentez sonucunda hangi gaz üretilir?", "options": ["Karbondioksit", "Azot", "Oksijen", "Hidrojen"], "correct_answer": "Oksijen", "explanation": "Bitki su moleküllerini parçalayarak oksijen gazı üretir ve havaya salar."},
    {"question": "Fotosentez neden sadece gündüz gerçekleşir?", "options": ["Gece soğuk olduğu için", "Güneş ışığına ihtiyaç duyulduğu için", "Gece karbondioksit azaldığı için", "Gece yapraklar kapandığı için"], "correct_answer": "Güneş ışığına ihtiyaç duyulduğu için", "explanation": "Fotosentez, ışık enerjisini kimyasal enerjiye dönüştürür; bu nedenle güneş ışığı şarttır."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 2. FEN BİLİMLERİ – orta – TYT
-- ─────────────────────────────────────────────────────────────
(
  'DNA ve Genetik Bilgi',
  'DNA, canlıların kalıtsal bilgisini taşıyan moleküldür. Çift sarmallı yapısı, 1953 yılında Watson ve Crick tarafından keşfedilmiştir. DNA, dört tür nükleotitten oluşur: adenin (A), timin (T), guanin (G) ve sitozin (C). Bu bazlar belirli kurallara göre eşleşir: A her zaman T ile, G her zaman C ile çift oluşturur. DNA''nın belirli bölümleri gen olarak adlandırılır; her gen, bir proteinin sentezlenmesi için gereken bilgiyi taşır. Proteinler ise hücrenin yapı ve işlev birimlerini oluşturur. İnsan genomu yaklaşık 3 milyar baz çiftinden ve 20.000–25.000 genden meydana gelir. Gen ifadesi, çevresel faktörlerden de etkilenebilir; bu durum epigenetik olarak bilinir. Kalıtsal hastalıkların önemli bir kısmı, genlerdeki mutasyonlardan kaynaklanır.',
  'Sprinta Orijinal',
  'fen_bilimleri',
  'orta',
  ARRAY['tyt']::exam_type[],
  ARRAY['lise_11', 'lise_12']::grade_level[],
  128, 6.4, 58.0, 180,
  '[
    {"question": "DNA''nın çift sarmal yapısını kim keşfetmiştir?", "options": ["Darwin ve Mendel", "Watson ve Crick", "Pasteur ve Koch", "Fleming ve Chain"], "correct_answer": "Watson ve Crick", "explanation": "James Watson ve Francis Crick, 1953 yılında X-ışını kırınım verilerini kullanarak DNA''nın çift sarmal yapısını ortaya koymuştur."},
    {"question": "Adenin (A) hangi baz ile çift oluşturur?", "options": ["Guanin", "Sitozin", "Timin", "Urasil"], "correct_answer": "Timin", "explanation": "DNA''da adenin-timin (A-T) ve guanin-sitozin (G-C) çiftleri hidrojen bağlarıyla tutunur."},
    {"question": "Epigenetik kavramı neyi ifade eder?", "options": ["DNA dizisindeki kalıcı mutasyonları", "Gen ifadesinin çevresel faktörlerden etkilenmesini", "Protein sentezi sürecini", "Kromozom sayısındaki değişimleri"], "correct_answer": "Gen ifadesinin çevresel faktörlerden etkilenmesini", "explanation": "Epigenetik, DNA dizisi değişmeksizin gen ifadesinin çevre tarafından düzenlenmesini inceler."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 3. FEN BİLİMLERİ – zor – AYT
-- ─────────────────────────────────────────────────────────────
(
  'Kuantum Mekaniğine Giriş',
  'Kuantum mekaniği, atom altı parçacıkların davranışını inceleyen fizik dalıdır. Klasik mekaniğin temel varsayımları bu ölçekte geçerliğini yitirir. Heisenberg''in belirsizlik ilkesine göre, bir parçacığın konumu ve momentumu aynı anda kesin olarak ölçülemez; birinin belirsizliği azaldıkça diğerininki artar. Dalga-parçacık ikiliği, elektronlar gibi madde parçacıklarının hem dalga hem de parçacık özelliği gösterdiğini ortaya koyar. Schrödinger denklemi, bir kuantum sisteminin zaman içindeki evrimini dalga fonksiyonu aracılığıyla betimler. Dalga fonksiyonunun karesi, parçacığın belirli bir konumda bulunma olasılığını verir. Kuantum dolanıklığı, iki parçacık arasında uzaklıktan bağımsız anlık korelasyon kurulmasına olanak tanır; bu durum Einstein''ın "uzaktan ürkütücü etki" dediği olgudur. Kuantum hesaplama ve kuantum kriptografi, bu ilkeler üzerine inşa edilen güncel teknoloji alanlarıdır.',
  'Sprinta Orijinal',
  'fen_bilimleri',
  'zor',
  ARRAY['ayt']::exam_type[],
  ARRAY['lise_12', 'universite']::grade_level[],
  148, 7.1, 42.0, 220,
  '[
    {"question": "Heisenberg''in belirsizlik ilkesine göre hangisi doğrudur?", "options": ["Parçacığın hem konumu hem momentumu kesin ölçülebilir", "Konum kesin ölçülürse momentum belirsizleşir", "Momentum kesin ölçülürse konum kesinleşir", "İkisi de kesin ölçülemez ama biri arttıkça diğeri azalır"], "correct_answer": "Konum kesin ölçülürse momentum belirsizleşir", "explanation": "Δx·Δp ≥ ℏ/2 eşitsizliği, konum belirsizliğinin azalmasının momentum belirsizliğini artırdığını gösterir."},
    {"question": "Schrödinger denkleminde dalga fonksiyonunun karesi neyi verir?", "options": ["Parçacığın hızını", "Parçacığın bulunma olasılığını", "Parçacığın enerjisini", "Parçacığın kütlesini"], "correct_answer": "Parçacığın bulunma olasılığını", "explanation": "|ψ|² olasılık yoğunluğunu tanımlar; uzayda integrali 1''e eşittir."},
    {"question": "Kuantum dolanıklığı neyi ifade eder?", "options": ["Parçacıkların birbirine fiziksel olarak bağlanması", "Uzak parçacıklar arasındaki anlık korelasyon", "Parçacıkların dalga özelliği göstermesi", "Enerji kuantaları arasındaki geçişler"], "correct_answer": "Uzak parçacıklar arasındaki anlık korelasyon", "explanation": "Dolanık parçacıklar ne kadar uzakta olursa olsun ölçüm sonuçları anında ilişkilidir."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 4. SOSYAL BİLGİLER – cok_kolay – LGS
-- ─────────────────────────────────────────────────────────────
(
  'Türkiye''nin Coğrafi Konumu',
  'Türkiye, Asya ve Avrupa kıtaları arasında bir köprü oluşturan stratejik bir konuma sahiptir. Ülkenin büyük bölümü Anadolu yarımadasında yer alır ve Asya kıtasına bağlıdır. Küçük bir kısmı ise Balkan yarımadasında bulunur ve Avrupa kıtasına dahildir. Türkiye, kuzeyden Karadeniz, batıdan Ege Denizi ve güneyden Akdeniz ile çevrilidir. Bu üç denize kıyısı olması, Türkiye''yi ticarette ve ulaşımda önemli kılar. İstanbul Boğazı ve Çanakkale Boğazı, Karadeniz ile Ege Denizi''ni birbirine bağlar. Türkiye, sekiz ülkeyle kara sınırı paylaşır: Bulgaristan, Yunanistan, Gürcistan, Ermenistan, Azerbaycan, İran, Irak ve Suriye. Bu komşularla sürdürülen ilişkiler, ülkenin dış politikasında büyük önem taşır.',
  'Sprinta Orijinal',
  'sosyal_bilgiler',
  'cok_kolay',
  ARRAY['lgs']::exam_type[],
  ARRAY['ortaokul_8']::grade_level[],
  118, 6.0, 68.0, 150,
  '[
    {"question": "Türkiye hangi iki kıta arasında yer alır?", "options": ["Afrika ve Asya", "Avrupa ve Asya", "Amerika ve Avrupa", "Asya ve Avustralya"], "correct_answer": "Avrupa ve Asya", "explanation": "Türkiye''nin büyük kısmı Asya''da (Anadolu), küçük kısmı Avrupa''da (Trakya) bulunur."},
    {"question": "Türkiye kaç ülkeyle kara sınırı paylaşır?", "options": ["5", "6", "7", "8"], "correct_answer": "8", "explanation": "Bulgaristan, Yunanistan, Gürcistan, Ermenistan, Azerbaycan, İran, Irak ve Suriye — toplam 8 ülke."},
    {"question": "İstanbul Boğazı hangi iki denizi birbirine bağlar?", "options": ["Akdeniz ve Ege", "Karadeniz ve Ege", "Karadeniz ve Akdeniz", "Ege ve Marmara"], "correct_answer": "Karadeniz ve Ege", "explanation": "İstanbul Boğazı Karadeniz ile Marmara''yı, Çanakkale Boğazı ise Marmara ile Ege''yi birleştirir; ikisi birlikte Karadeniz-Ege bağlantısını kurar."},
    {"question": "Türkiye''nin güneyini hangi deniz çevirir?", "options": ["Karadeniz", "Ege Denizi", "Akdeniz", "Kızıldeniz"], "correct_answer": "Akdeniz", "explanation": "Türkiye güneyden Akdeniz, batıdan Ege Denizi, kuzeyden Karadeniz ile çevrilidir."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 5. TÜRKÇE-EDEBİYAT – kolay – LGS / TYT
-- ─────────────────────────────────────────────────────────────
(
  'Şiir Dili ve İmge',
  'Şiir, dili en yoğun ve en ekonomik biçimde kullanan yazın türüdür. Şair, sıradan sözcükleri bir araya getirerek okuyucuda derin duygusal etkiler uyandırır. Şiirde anlam genellikle doğrudan değil, imgeler ve mecazlar aracılığıyla iletilir. İmge, somut bir nesne ya da olayı zihinsel bir tasarıma dönüştürür; böylece soyut duygu ve düşünceler somutlaşır. Örneğin "gönlüm bir deniz" imgesi, iç dünyada yaşanan taşkın duyguları görsel bir biçimde aktarır. Şiirde ritim ve ses, anlamı pekiştiren önemli unsurlardır. Uyak, şiire müzikalite kazandırırken okuyucunun dikkatini yönlendirir. Serbest şiirde uyak zorunlu değildir; anlam yükü daha ağır bir dil kullanılır. Bir şiiri okurken yalnızca sözcüklerin sözlük anlamı değil, ses, ritim ve bağlam birlikte değerlendirilmelidir.',
  'Sprinta Orijinal',
  'turkce_edebiyat',
  'kolay',
  ARRAY['lgs', 'tyt']::exam_type[],
  ARRAY['ortaokul_8', 'lise_9', 'lise_10']::grade_level[],
  130, 6.2, 63.0, 160,
  '[
    {"question": "Şiirde ''imge'' kavramı ne anlama gelir?", "options": ["Şiirin uyak düzeni", "Somut nesne ya da olayın zihinsel tasarıma dönüştürülmesi", "Şiirdeki ritim kalıbı", "Dizelerin bölümlenmesi"], "correct_answer": "Somut nesne ya da olayın zihinsel tasarıma dönüştürülmesi", "explanation": "İmge, somut öğeleri kullanarak soyut duygu ve düşünceleri görselleştiren şiirsel bir araçtır."},
    {"question": "''Gönlüm bir deniz'' ifadesinde hangi edebi sanat kullanılmıştır?", "options": ["Kişileştirme", "Teşbih (benzetme)", "Abartma", "Tezat"], "correct_answer": "Teşbih (benzetme)", "explanation": "Gönül denize benzetilmiş; benzetme yüklemi ''gibi'' ya da ''bir'' sözcüğüyle kurulmuştur."},
    {"question": "Serbest şiir hakkında aşağıdakilerden hangisi doğrudur?", "options": ["Belirli uyak zorunludur", "Ritim hiç kullanılmaz", "Uyak zorunlu değildir", "Hece ölçüsü kullanılır"], "correct_answer": "Uyak zorunlu değildir", "explanation": "Serbest şiir biçim kısıtlamalarından bağımsızdır; anlam ve ses değerleri ön plandadır."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 6. TARİH – kolay – LGS / TYT
-- ─────────────────────────────────────────────────────────────
(
  'Kurtuluş Savaşı''nın Başlangıcı',
  'Birinci Dünya Savaşı''nın ardından Osmanlı İmparatorluğu yenik duruma düştü. 1918''de imzalanan Mondros Ateşkesi ile Anadolu''nun önemli bölgeleri işgale açıldı. Yunan kuvvetleri 1919''da İzmir''i işgal etti; bu gelişme Anadolu''da büyük tepkilere yol açtı. Mustafa Kemal, 19 Mayıs 1919''da Samsun''a çıkarak Milli Mücadele''nin fitilini ateşledi. Erzurum ve Sivas kongrelerinde alınan kararlarla ulusal birlik sağlandı. 23 Nisan 1920''de Türkiye Büyük Millet Meclisi Ankara''da açıldı. Meclis, egemenliğin kayıtsız şartsız millete ait olduğunu ilan etti. Sakarya Savaşı ve Büyük Taarruz''un ardından Yunanlılar Anadolu''dan çekilmek zorunda kaldı. 24 Temmuz 1923''te imzalanan Lozan Antlaşması, Türkiye''nin bağımsızlığını uluslararası alanda tanıttı.',
  'Sprinta Orijinal',
  'tarih',
  'kolay',
  ARRAY['lgs', 'tyt']::exam_type[],
  ARRAY['ortaokul_8', 'lise_10', 'lise_11']::grade_level[],
  135, 6.5, 61.0, 165,
  '[
    {"question": "Mustafa Kemal Samsun''a hangi tarihte çıktı?", "options": ["30 Ekim 1918", "19 Mayıs 1919", "23 Nisan 1920", "24 Temmuz 1923"], "correct_answer": "19 Mayıs 1919", "explanation": "19 Mayıs 1919, Milli Mücadele''nin simgesi olarak Atatürk Günü ve Gençlik ve Spor Bayramı olarak kutlanmaktadır."},
    {"question": "TBMM hangi şehirde açılmıştır?", "options": ["İstanbul", "İzmir", "Ankara", "Samsun"], "correct_answer": "Ankara", "explanation": "23 Nisan 1920''de Ankara''da toplanan TBMM, egemenliği millete devretmiştir."},
    {"question": "Lozan Antlaşması hangi yılda imzalanmıştır?", "options": ["1919", "1920", "1922", "1923"], "correct_answer": "1923", "explanation": "24 Temmuz 1923''te imzalanan Lozan Antlaşması, Türkiye''nin uluslararası bağımsızlığını hukuken tescil etmiştir."},
    {"question": "Mondros Ateşkesi''nin önemi nedir?", "options": ["Türk bağımsızlığını ilan etmiştir", "Osmanlı''nın teslimiyetini ve işgallerin yasal zeminini oluşturmuştur", "Kurtuluş Savaşı''nın zaferle bitmesini sağlamıştır", "TBMM''nin kuruluşunu hazırlamıştır"], "correct_answer": "Osmanlı''nın teslimiyetini ve işgallerin yasal zeminini oluşturmuştur", "explanation": "1918''deki Mondros Ateşkesi, Osmanlı''yı fiilen savaş dışı bıraktı ve müttefiklere Anadolu''yu işgal etme fırsatı verdi."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 7. COĞRAFYA – orta – TYT
-- ─────────────────────────────────────────────────────────────
(
  'İklim ve Hava Durumu Farkı',
  'Hava durumu, belirli bir yerde ve belirli bir zamandaki atmosfer koşullarını ifade eder. Sıcaklık, nem, yağış ve rüzgâr hızı gibi anlık ölçümler hava durumunu oluşturur. İklim ise bir bölgenin uzun yıllar boyunca gösterdiği ortalama atmosfer koşullarıdır; genellikle en az 30 yıllık veriler esas alınır. İklimi belirleyen başlıca etkenler arasında enlem, yükselti, kara-deniz dağılımı ve bitki örtüsü sayılabilir. Ekvatora yakın bölgeler daha fazla güneş ışığı alarak sıcak ve nemli bir iklime sahipken, kutuplara gidildikçe soğuk ve kurak iklimler hâkimdir. Orografik yağış, dağların denizden gelen nemli havanın yükselerek soğumasını sağlamasıyla oluşur. Türkiye''de akdeniz, karasal, karadeniz ve yarı kurak iklim tipleri bir arada görülür; bu çeşitlilik, coğrafi konumu ve dağ kuşaklarıyla açıklanır.',
  'Sprinta Orijinal',
  'cografya',
  'orta',
  ARRAY['tyt']::exam_type[],
  ARRAY['lise_10', 'lise_11', 'lise_12']::grade_level[],
  138, 6.8, 55.0, 190,
  '[
    {"question": "Hava durumu ile iklim arasındaki temel fark nedir?", "options": ["Hava durumu uzun dönem, iklim anlık ölçümdür", "İklim anlık, hava durumu 30 yıllık ortalamadır", "Hava durumu anlık, iklim uzun dönem ortalamasıdır", "İkisi birbirinin aynısıdır"], "correct_answer": "Hava durumu anlık, iklim uzun dönem ortalamasıdır", "explanation": "Hava durumu günden güne değişirken, iklim en az 30 yıllık istatistiksel ortalamaları yansıtır."},
    {"question": "Orografik yağış nasıl oluşur?", "options": ["Deniz suyunun buharlaşmasıyla", "Nemli havanın dağ yamaçlarında yükselerek soğumasıyla", "Sıcak ve soğuk hava kütlelerinin çarpışmasıyla", "Güneş ışınlarının yüzeyi ısıtmasıyla"], "correct_answer": "Nemli havanın dağ yamaçlarında yükselerek soğumasıyla", "explanation": "Denizden gelen nemli hava dağa çarpar, yükselir, soğur ve yağış bırakır; bu olaya orografik (kabartı) yağış denir."},
    {"question": "Türkiye''de hangi iklim tipi görülmez?", "options": ["Akdeniz", "Karasal", "Karadeniz", "Muson"], "correct_answer": "Muson", "explanation": "Muson iklimi Güney ve Güneydoğu Asya''ya özgüdür; Türkiye''de akdeniz, karasal, karadeniz ve yarı kurak iklimler görülür."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 8. FELSEFE – orta – AYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Sokrates''in Diyalog Yöntemi',
  'Sokrates, MÖ 5. yüzyılda Atina''da yaşamış büyük bir Yunan filozofudur. Kendinden önceki filozoflardan farklı olarak sistematik bir yapıt bırakmamış; bilgeliğini diyaloglar yoluyla aktarmıştır. Sorularla düşünmeye yönlendirme anlamına gelen bu yönteme elenktik yöntem ya da sokratik diyalog denir. Sokrates, muhataplarını sorularıyla sıkıştırarak onların bildiklerini sandıkları şeylerin aslında ne kadar belirsiz olduğunu göstermeye çalışırdı. "Kendini bil" ilkesiyle felsefenin odağını insan ve ahlak sorunlarına taşımıştır. Ona göre erdem bilgiyle özdeştir; kötülük cehaletten kaynaklanır. Sokrates, tanrıları tanımamak ve gençleri yoldan çıkarmakla suçlanarak idam edildi. Bu ölüm, çırağı Platon''u derinden etkileyerek idealar kuramını geliştirmesine zemin hazırladı.',
  'Sprinta Orijinal',
  'felsefe',
  'orta',
  ARRAY['ayt', 'kpss']::exam_type[],
  ARRAY['lise_11', 'lise_12', 'universite']::grade_level[],
  140, 6.9, 52.0, 195,
  '[
    {"question": "Sokratik diyalog yönteminin temel amacı nedir?", "options": ["Öğrenciye bilgi ezberletmek", "Sorularla muhatapların kendi bilgisizliğini fark etmesini sağlamak", "Felsefe kitapları yazmak", "Devlet yönetimini eleştirmek"], "correct_answer": "Sorularla muhatapların kendi bilgisizliğini fark etmesini sağlamak", "explanation": "Elenktik yöntemde Sokrates, ardışık sorularla muhatabın çelişkilerini ortaya çıkarır ve gerçeği birlikte arama sürecini başlatır."},
    {"question": "Sokrates''e göre kötülüğün temel kaynağı nedir?", "options": ["Yoksulluk", "Güçsüzlük", "Cehalet", "Kıskançlık"], "correct_answer": "Cehalet", "explanation": "Sokrates, erdemin bilgiyle özdeş olduğunu savunur; dolayısıyla kötülük erdemsizliktir ve cehaletten kaynaklanır."},
    {"question": "Sokrates''in idamı hangi suçlamayı içermekteydi?", "options": ["Hırsızlık ve rüşvet", "Tanrıları tanımamak ve gençleri yoldan çıkarmak", "Siyasi komplo kurmak", "Vatana ihanet"], "correct_answer": "Tanrıları tanımamak ve gençleri yoldan çıkarmak", "explanation": "MÖ 399''da Sokrates, bu iki suçlamadan yargılanarak ölüm cezasına çarptırıldı."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 9. TEKNOLOJİ – kolay – TYT / LGS
-- ─────────────────────────────────────────────────────────────
(
  'Yapay Zekâ Nedir?',
  'Yapay zekâ, bilgisayar sistemlerinin insan benzeri akıl yürütme, öğrenme ve problem çözme becerisi kazanmasını hedefleyen bilim ve mühendislik alanıdır. 1956 yılında Dartmouth Konferansı''nda "yapay zekâ" terimi ilk kez kullanılmıştır. Makine öğrenimi, yapay zekânın alt dalı olarak öne çıkar; sistemin verilerden kendi kendine öğrenmesini sağlar. Derin öğrenme ise çok katmanlı yapay sinir ağları kullanarak görüntü tanıma ve dil işleme gibi alanlarda insana yakın başarı elde eder. Günümüzde yapay zekâ sağlık, eğitim, finans ve ulaşım gibi birçok sektörde aktif olarak kullanılmaktadır. Bununla birlikte iş gücü değişimi, veri gizliliği ve algoritmik önyargı gibi etik sorunlar da gündeme gelmektedir.',
  'Sprinta Orijinal',
  'teknoloji',
  'kolay',
  ARRAY['lgs', 'tyt']::exam_type[],
  ARRAY['ortaokul_8', 'lise_9', 'lise_10', 'lise_11']::grade_level[],
  122, 6.3, 64.0, 155,
  '[
    {"question": "\"Yapay zekâ\" terimi ilk kez hangi etkinlikte kullanılmıştır?", "options": ["MIT Sempozyumu", "Dartmouth Konferansı", "Silicon Valley Zirvesi", "Turing Konferansı"], "correct_answer": "Dartmouth Konferansı", "explanation": "1956 yılındaki Dartmouth Konferansı, yapay zekâ alanının doğum noktası olarak kabul edilir."},
    {"question": "Makine öğrenimi neyi ifade eder?", "options": ["Bilgisayarın robot gibi hareket etmesi", "Sistemin verilerden kendi kendine öğrenmesi", "İnsanların makineye bilgi girmesi", "Bilgisayarın internete bağlanması"], "correct_answer": "Sistemin verilerden kendi kendine öğrenmesi", "explanation": "Makine öğreniminde algoritma, örneklerden kuralları kendisi çıkarır ve yeni verilere genelleyebilir hale gelir."},
    {"question": "Yapay zekâ ile ilgili aşağıdaki etik endişelerden hangisi metinde geçmemektedir?", "options": ["Veri gizliliği", "Algoritmik önyargı", "Nükleer silahlanma", "İş gücü değişimi"], "correct_answer": "Nükleer silahlanma", "explanation": "Metinde iş gücü değişimi, veri gizliliği ve algoritmik önyargı belirtilmiş; nükleer silahlanmadan söz edilmemiştir."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 10. SAĞLIK – cok_kolay – LGS
-- ─────────────────────────────────────────────────────────────
(
  'Sağlıklı Beslenmenin Temelleri',
  'Sağlıklı beslenme, vücudun ihtiyaç duyduğu besin ögelerini dengeli ve yeterli miktarda almayı kapsar. Başlıca besin ögeleri arasında karbonhidratlar, proteinler, yağlar, vitaminler, mineraller ve su sayılabilir. Karbonhidratlar, vücudun birincil enerji kaynağıdır; tahıllar, meyveler ve sebzeler iyi kaynaklardır. Proteinler, kasların ve dokuların yapı taşını oluşturur; et, yumurta, baklagiller ve süt ürünleri protein açısından zengindir. Yağlar ise hormon üretimi ve yağda çözünen vitaminlerin emiliminde rol oynar; zeytinyağı ve fındık gibi doymamış yağlar sağlıklı seçeneklerdir. Günde 1,5–2 litre su içmek, metabolizmanın düzgün çalışması için gereklidir. Dünya Sağlık Örgütü, her gün en az beş porsiyon meyve ve sebze tüketilmesini önermektedir.',
  'Sprinta Orijinal',
  'saglik',
  'cok_kolay',
  ARRAY['lgs']::exam_type[],
  ARRAY['ortaokul_8', 'lise_9']::grade_level[],
  125, 5.9, 70.0, 145,
  '[
    {"question": "Vücudun birincil enerji kaynağı hangi besin ögesidir?", "options": ["Protein", "Karbonhidrat", "Yağ", "Mineral"], "correct_answer": "Karbonhidrat", "explanation": "Karbonhidratlar glikoza parçalanarak hücrelere hızlı enerji sağlar ve tercih edilen birincil yakıttır."},
    {"question": "DSÖ''nün önerdiği günlük meyve-sebze miktarı nedir?", "options": ["2 porsiyon", "3 porsiyon", "4 porsiyon", "5 porsiyon"], "correct_answer": "5 porsiyon", "explanation": "Dünya Sağlık Örgütü, kronik hastalık riskini azaltmak için günde en az 5 porsiyon meyve-sebze önermektedir."},
    {"question": "Zeytinyağı hangi yağ grubuna girer?", "options": ["Doymuş yağ", "Trans yağ", "Doymamış yağ", "Kolesterol"], "correct_answer": "Doymamış yağ", "explanation": "Zeytinyağı tekli doymamış yağ asitlerinden zengindir; kalp sağlığı için faydalıdır."},
    {"question": "Proteinlerin temel görevi nedir?", "options": ["Enerji depolamak", "Kas ve doku yapımı", "Vücut ısısını düzenlemek", "Vitamin sentezlemek"], "correct_answer": "Kas ve doku yapımı", "explanation": "Amino asitlerden oluşan proteinler, kasların, enzimlerin ve hormonların yapısını oluşturur."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 11. ÇEVRE – kolay – LGS / TYT
-- ─────────────────────────────────────────────────────────────
(
  'İklim Değişikliği ve Sera Etkisi',
  'Sera etkisi, güneşten gelen ısının atmosfer tarafından tutularak yeryüzünün ısınmasını sağlayan doğal bir süreçtir. Karbondioksit, metan ve su buharı gibi sera gazları bu süreci yönetir. Ancak sanayi devrimi ile birlikte fosil yakıt kullanımının artması, atmosferdeki karbondioksit miktarını dramatik biçimde yükseltmiştir. Bu artış, doğal dengenin bozulmasına ve küresel ısınmaya yol açmaktadır. Küresel ortalama sıcaklığın son 150 yılda yaklaşık 1,1 derece arttığı tahmin edilmektedir. Bu artışın devam etmesi, buzulların erimesine, deniz seviyesinin yükselmesine ve aşırı hava olaylarının sıklaşmasına neden olur. Kyoto Protokolü ve Paris Anlaşması, ülkelerin sera gazı salımlarını azaltmayı taahhüt ettiği uluslararası çevre sözleşmeleridir.',
  'Sprinta Orijinal',
  'cevre',
  'kolay',
  ARRAY['lgs', 'tyt']::exam_type[],
  ARRAY['ortaokul_8', 'lise_9', 'lise_10', 'lise_11']::grade_level[],
  133, 6.4, 62.0, 162,
  '[
    {"question": "Sera etkisine yol açan başlıca gazlar hangileridir?", "options": ["Oksijen ve azot", "Karbondioksit ve metan", "Argon ve helyum", "Ozon ve hidrojen"], "correct_answer": "Karbondioksit ve metan", "explanation": "CO₂, CH₄ ve su buharı sera gazlarının başında gelir; güneş ısısını atmosferde tutarak yeryüzünü ısıtır."},
    {"question": "Küresel ısınmanın temel nedeni nedir?", "options": ["Güneş''in daha fazla ışın yayması", "Fosil yakıt kullanımıyla artan sera gazı emisyonu", "Ozon tabakasının genişlemesi", "Deniz suyunun buharlaşması"], "correct_answer": "Fosil yakıt kullanımıyla artan sera gazı emisyonu", "explanation": "Sanayi devriminden bu yana kömür, petrol ve doğalgaz yakımı atmosferdeki CO₂ konsantrasyonunu %50 artırmıştır."},
    {"question": "Paris Anlaşması''nın amacı nedir?", "options": ["Nükleer silahları azaltmak", "Sera gazı salımlarını azaltarak küresel ısınmayı sınırlamak", "Deniz kirliliğini önlemek", "Ormanları koruma altına almak"], "correct_answer": "Sera gazı salımlarını azaltarak küresel ısınmayı sınırlamak", "explanation": "2015''te imzalanan Paris Anlaşması, küresel ısınmayı 1,5–2°C ile sınırlama hedefi etrafında ülkeleri bir araya getirir."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 12. KÜLTÜR & SANAT – orta – TYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Türk Sanat Müziği''nin Makam Sistemi',
  'Türk sanat müziği, makam adı verilen özgün bir ses sistemi üzerine kuruludur. Makam; belirli sesleri, bu sesler arasındaki aralıkları ve melodik hareket kurallarını bir arada tanımlayan bir çerçevedir. Batı müziğinde kullanılan majör-minör sisteminden farklı olarak Türk müziği dörtte bir ton (koma) gibi mikrotonal aralıkları bünyesinde barındırır. Rast, Uşşak, Hicaz, Sabâ ve Segâh en yaygın kullanılan makamlar arasındadır. Her makamın kendine özgü duygusal ve psikolojik bir çağrışım alanı bulunduğuna inanılır; örneğin Hicaz makamı özlem ve hüznü, Rast makamı ise neşe ve doğallığı çağrıştırır. Türk sanat müziği, Selçuklu ve Osmanlı dönemlerinde Arap, Acem ve Bizans müzik gelenekleriyle etkileşerek bugünkü biçimini almıştır.',
  'Sprinta Orijinal',
  'kultur_sanat',
  'orta',
  ARRAY['tyt', 'kpss']::exam_type[],
  ARRAY['lise_10', 'lise_11', 'lise_12', 'universite']::grade_level[],
  135, 6.7, 54.0, 185,
  '[
    {"question": "Makam kavramı Türk müziğinde neyi ifade eder?", "options": ["Çalgıların dizilişini", "Belirli sesleri, aralıkları ve melodik hareket kurallarını tanımlayan çerçeve", "Eserin hız işaretini", "Şarkının sözlü bölümünü"], "correct_answer": "Belirli sesleri, aralıkları ve melodik hareket kurallarını tanımlayan çerçeve", "explanation": "Makam, hangi seslerin kullanılacağını, tiz-pes seyir kurallarını ve güçlü sesleri belirleyen yapısal bir sistemdir."},
    {"question": "Türk müziğini Batı müziğinden ayıran temel özellik nedir?", "options": ["Yalnızca vokal kullanılması", "Koma gibi mikrotonal aralıkların kullanılması", "Akoru olmaması", "Yalnızca tek sesli olması"], "correct_answer": "Koma gibi mikrotonal aralıkların kullanılması", "explanation": "Batı sistemi yarım ton temelli eşit akort kullanırken Türk müziği 4''te 1 ton gibi daha küçük aralıklara sahiptir."},
    {"question": "Hicaz makamı hangi duyguyla ilişkilendirilir?", "options": ["Neşe ve canlılık", "Özlem ve hüzün", "Coşku ve zafer", "Huzur ve dinginlik"], "correct_answer": "Özlem ve hüzün", "explanation": "Hicaz makamının artık ikili aralığı, Orta Doğu müziğindeki hüzün ve özlem çağrışımına katkıda bulunur."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 13. TARİH – zor – AYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Tanzimat Dönemi Reformları',
  'Tanzimat Fermanı, 3 Kasım 1839''da Gülhane Parkı''nda Mustafa Reşit Paşa tarafından okunarak ilan edildi. Ferman, Osmanlı tarihinde ilk kez tüm tebaanın can, mal ve namus güvencesini hukuken taahhüt eden bir belgeydi. Bu dönemde Müslim ve gayrimüslim ayrımı gözetmeksizin eşit hukuki statü hedeflendi. 1856''da ilan edilen Islahat Fermanı ise azınlıkların haklarını daha da genişletti. Tanzimat reformlarıyla modern anlamda eğitim kurumları, kamu yönetimi ve hukuk sistemi oluşturulmaya çalışıldı. Şinasi, Namık Kemal ve Ziya Paşa gibi aydınlar, Tanzimat sonrasında meşrutiyet taleplerini dile getiren Yeni Osmanlı hareketini başlattı. 1876''da ilan edilen Kanun-i Esasi, Osmanlı''nın ilk anayasasıydı; ancak kısa süre sonra Sultan II. Abdülhamit tarafından askıya alındı.',
  'Sprinta Orijinal',
  'tarih',
  'zor',
  ARRAY['ayt', 'kpss']::exam_type[],
  ARRAY['lise_11', 'lise_12', 'universite']::grade_level[],
  145, 7.0, 46.0, 215,
  '[
    {"question": "Tanzimat Fermanı hangi tarihte ilan edilmiştir?", "options": ["1826", "1839", "1856", "1876"], "correct_answer": "1839", "explanation": "Gülhane Hatt-ı Hümayunu olarak da bilinen Tanzimat Fermanı, 3 Kasım 1839''da okunmuştur."},
    {"question": "Kanun-i Esasi nedir?", "options": ["İlk Osmanlı vergi kanunu", "Osmanlı''nın ilk anayasası", "Tanzimat Fermanı''nın diğer adı", "Islahat Fermanı''nın eki"], "correct_answer": "Osmanlı''nın ilk anayasası", "explanation": "1876''da hazırlanan Kanun-i Esasi, meclis kurarak anayasal monarşiye geçişi amaçlamış; ancak II. Abdülhamit tarafından 1878''de askıya alınmıştır."},
    {"question": "Yeni Osmanlı hareketinin temel talebi neydi?", "options": ["Halifeliğin güçlendirilmesi", "Meşrutiyet yönetimi ve anayasal düzen", "Ordu modernizasyonu", "Batı ile ittifak"], "correct_answer": "Meşrutiyet yönetimi ve anayasal düzen", "explanation": "Şinasi, Namık Kemal ve Ziya Paşa başta olmak üzere Yeni Osmanlılar, padişahın yetkilerini sınırlayan parlamenter sistemin kurulmasını savundu."},
    {"question": "1856 Islahat Fermanı''nın temel amacı neydi?", "options": ["Askeri modernleşmeyi hızlandırmak", "Azınlıkların haklarını genişletmek", "Yabancı yatırımları teşvik etmek", "Eğitimi yaygınlaştırmak"], "correct_answer": "Azınlıkların haklarını genişletmek", "explanation": "Kırım Savaşı''nın ardından Avrupalı müttefiklerin baskısıyla hazırlanan Islahat Fermanı, gayrimüslimlere eşit hak ve özgürlükler tanımayı amaçladı."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 14. FEN BİLİMLERİ – kolay – LGS
-- ─────────────────────────────────────────────────────────────
(
  'Güneş Sistemi''nin Yapısı',
  'Güneş Sistemi, Güneş''in çevresinde dönen sekiz gezegen ve bunlara ait uydular, asteroid kuşakları, kuyruklu yıldızlar ve diğer cisimlerden oluşur. Güneş, sistemin kütlesinin yaklaşık %99,86''sını oluşturur ve çekim kuvvetiyle tüm cisimleri yörüngede tutar. Gezegenler Güneş''e uzaklıklarına göre sıralanır: Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs ve Neptün. İlk dördü kaya yapılı iç gezegenler, son dördü ise gaz ya da buz devleri olarak adlandırılan dış gezegenlerdir. Mars ile Jüpiter arasında Ana Asteroid Kuşağı bulunur; bu bölgedeki cisimler tam anlamıyla bir gezegen oluşturamayacak kadar dağınık kalmıştır. Dünya, yaşamın bilindiği tek gezegendir; bunun en önemli nedeni uygun sıcaklık, sıvı su ve oksijen içeren bir atmosferin varlığıdır.',
  'Sprinta Orijinal',
  'fen_bilimleri',
  'kolay',
  ARRAY['lgs']::exam_type[],
  ARRAY['ortaokul_8']::grade_level[],
  130, 6.1, 66.0, 158,
  '[
    {"question": "Güneş Sistemi''ndeki gezegen sayısı kaçtır?", "options": ["7", "8", "9", "10"], "correct_answer": "8", "explanation": "2006''da Plüton''un cüce gezegen olarak yeniden sınıflandırılmasından bu yana Güneş Sistemi''nde 8 gezegen kabul edilmektedir."},
    {"question": "Ana Asteroid Kuşağı hangi gezegenler arasında yer alır?", "options": ["Dünya ve Mars", "Mars ve Jüpiter", "Jüpiter ve Satürn", "Satürn ve Uranüs"], "correct_answer": "Mars ve Jüpiter", "explanation": "Mars''ın ötesinde ve Jüpiter''in içinde bulunan Ana Asteroid Kuşağı, erken Güneş Sistemi''nden kalan milyonlarca küçük cisim barındırır."},
    {"question": "Dünya''da yaşamın bulunmasını sağlayan faktörler arasında hangisi yer almaz?", "options": ["Uygun sıcaklık", "Sıvı su", "Oksijen içeren atmosfer", "Halka sistemi"], "correct_answer": "Halka sistemi", "explanation": "Halka sistemi Satürn, Uranüs ve diğer dış gezegenlerde bulunur; Dünya''nın yaşam koşullarıyla ilgisi yoktur."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 15. SOSYAL BİLGİLER – orta – TYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Osmanlı''nın Yükselme Dönemi',
  'Osmanlı İmparatorluğu, 14. yüzyılın başında küçük bir beylik olarak kuruldu. Osman Gazi önderliğinde Bizans''a ait toprakları genişleterek büyümeye başladı. 1453''te Fatih Sultan Mehmet, 29 Mayıs''ta İstanbul''u fethederek Bizans İmparatorluğu''na son verdi. Bu tarih, Ortaçağ''ın kapandığı ve Yeniçağ''ın açıldığı dönüm noktası olarak kabul edilir. Yavuz Sultan Selim, Mısır seferinden dönerken halifeliği Osmanlı hanedanına bağladı. Kanuni Sultan Süleyman döneminde imparatorluk en geniş sınırlarına ulaştı: batıda Macaristan''dan doğuda İran sınırlarına, kuzeyde Karadeniz''den güneyde Hint Okyanusu kıyılarına dek yayıldı. Bu dönemde geliştirilen divan teşkilatı, tımar sistemi ve devşirme uygulaması, Osmanlı yönetim yapısının temel unsurlarını oluşturdu.',
  'Sprinta Orijinal',
  'sosyal_bilgiler',
  'orta',
  ARRAY['tyt', 'kpss']::exam_type[],
  ARRAY['lise_10', 'lise_11', 'lise_12']::grade_level[],
  142, 6.8, 56.0, 188,
  '[
    {"question": "İstanbul hangi yılda fethedilmiştir?", "options": ["1299", "1402", "1453", "1520"], "correct_answer": "1453", "explanation": "Fatih Sultan Mehmet, 29 Mayıs 1453''te İstanbul''u fethederek Bizans''a son verdi."},
    {"question": "Osmanlı''nın en geniş sınırlara ulaştığı dönem hangisidir?", "options": ["Osman Gazi", "Yavuz Sultan Selim", "Kanuni Sultan Süleyman", "II. Selim"], "correct_answer": "Kanuni Sultan Süleyman", "explanation": "16. yüzyılda Kanuni Sultan Süleyman, imparatorluğu üç kıtada 5,2 milyon km²''ye ulaştırdı."},
    {"question": "Devşirme sistemi nedir?", "options": ["Toprakları sipahilere dağıtma sistemi", "Hristiyan çocukların alınarak devlet hizmetine yetiştirilmesi", "Dini vergi toplama yöntemi", "Ordunun savaş düzeni"], "correct_answer": "Hristiyan çocukların alınarak devlet hizmetine yetiştirilmesi", "explanation": "Devşirme, Balkan ve Anadolu''daki Hristiyan ailelerden alınan çocukların Müslüman terbiyesiyle Yeniçeri ya da bürokrat olarak yetiştirilmesiydi."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 16. TÜRKÇE-EDEBİYAT – zor – AYT
-- ─────────────────────────────────────────────────────────────
(
  'Tanzimat Edebiyatı''nın Özellikleri',
  'Tanzimat edebiyatı, 1860''ta Şinasi ve Agâh Efendi''nin çıkardığı Tercüman-ı Ahval gazetesiyle başlar. Batı edebiyatından alınan roman, tiyatro ve makale gibi türler Türk edebiyatına bu dönemde girmiştir. Birinci kuşak Tanzimatçılar (Şinasi, Namık Kemal, Ziya Paşa), "sanat toplum içindir" anlayışıyla eserler verdi; özgürlük, vatan ve adalet gibi kavramlar işlendi. İkinci kuşak (Recaizade Mahmut Ekrem, Samipaşazade Sezai, Abdülhak Hamit Tarhan), "sanat sanat içindir" ilkesine yönelerek bireysel duyguları ve aşkı ön plana çıkardı. Roman türünde Şemsettin Sami''nin Taaşşuk-u Talat ve Fitnat adlı eseri ilk Türk romanı kabul edilir; bunu Namık Kemal''in İntibah''ı izler. Tanzimat edebiyatında dil sadeleştirilmeye çalışılmış, ancak tam anlamıyla sade bir dile ulaşılamamıştır.',
  'Sprinta Orijinal',
  'turkce_edebiyat',
  'zor',
  ARRAY['ayt']::exam_type[],
  ARRAY['lise_11', 'lise_12']::grade_level[],
  148, 7.2, 44.0, 220,
  '[
    {"question": "Tanzimat edebiyatının başlangıcı hangi olayla kabul edilir?", "options": ["Tanzimat Fermanı''nın ilanı", "Tercüman-ı Ahval gazetesinin yayımlanması", "Şinasi''nin Paris''ten dönmesi", "İlk Türk romanının yayımlanması"], "correct_answer": "Tercüman-ı Ahval gazetesinin yayımlanması", "explanation": "1860''ta Şinasi ve Agâh Efendi''nin çıkardığı Tercüman-ı Ahval, modern Türk basınının ve Tanzimat edebiyatının başlangıç noktasıdır."},
    {"question": "Birinci kuşak Tanzimatçıların benimsediği sanat anlayışı nedir?", "options": ["Sanat sanat içindir", "Sanat toplum içindir", "Sanat bireysel duygular içindir", "Sanat estetik içindir"], "correct_answer": "Sanat toplum içindir", "explanation": "Namık Kemal, Şinasi ve Ziya Paşa, edebiyatı toplumsal ve siyasal mesajları iletmek için bir araç olarak kullandı."},
    {"question": "İlk Türk romanı kabul edilen eser hangisidir?", "options": ["İntibah", "Araba Sevdası", "Taaşşuk-u Talat ve Fitnat", "Zehra"], "correct_answer": "Taaşşuk-u Talat ve Fitnat", "explanation": "Şemsettin Sami''nin 1872''de yayımladığı bu eser, Türk edebiyatındaki ilk roman denemesi olarak kabul edilir."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 17. TEKNOLOJİ – zor – AYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Büyük Veri ve Veri Analitiği',
  'Büyük veri (Big Data), geleneksel veritabanı araçlarıyla işlenemeyecek kadar hacimli, hızlı ve çeşitli veri kümelerini tanımlar. Bu kavramı karakterize eden üç temel özellik "3V" olarak bilinir: Hacim (Volume), Hız (Velocity) ve Çeşitlilik (Variety). Bazı kaynaklara göre Doğruluk (Veracity) ve Değer (Value) de bu listeye eklenerek 5V''ye ulaşılır. Hadoop ve Apache Spark gibi dağıtık işlem çerçeveleri, büyük veriyi paralel hesaplama yoluyla işler. Veri analitiği, ham veriden anlamlı içgörüler çıkarmayı amaçlar ve dört seviyeye ayrılır: tanımlayıcı (ne oldu?), tanısal (neden oldu?), öngörücü (ne olacak?) ve buyurgan (ne yapılmalı?). Büyük veri kullanımı, tıptan perakendeye, kentsel planlamadan finansal risk yönetimine kadar geniş bir alanda karar alma süreçlerini dönüştürmektedir.',
  'Sprinta Orijinal',
  'teknoloji',
  'zor',
  ARRAY['ayt', 'kpss']::exam_type[],
  ARRAY['lise_12', 'universite', 'yetiskin']::grade_level[],
  150, 7.3, 43.0, 225,
  '[
    {"question": "Büyük veriyi tanımlayan temel 3V nedir?", "options": ["Veritabanı, Veri ambarı, Veri gölü", "Hacim, Hız, Çeşitlilik", "Doğruluk, Değer, Hacim", "Yapısal, Yarı yapısal, Yapısız"], "correct_answer": "Hacim, Hız, Çeşitlilik", "explanation": "3V; Volume (hacim), Velocity (hız) ve Variety (çeşitlilik) ifadelerinin kısaltmasıdır."},
    {"question": "Apache Spark''ın büyük veri işlemede sunduğu avantaj nedir?", "options": ["Tek sunucuda veri depolama", "Dağıtık paralel hesaplama", "Grafik arayüz sağlama", "Gerçek zamanlı görselleştirme"], "correct_answer": "Dağıtık paralel hesaplama", "explanation": "Spark, veri kümesini birden fazla sunucuya bölerek eş zamanlı işler; bu sayede işlem süresi dramatik biçimde kısalır."},
    {"question": "Öngörücü analitik neyi hedefler?", "options": ["Geçmişteki olayları açıklamak", "Geleceği tahmin etmek", "Alınacak aksiyonu belirlemek", "Verileri depolamak"], "correct_answer": "Geleceği tahmin etmek", "explanation": "Öngörücü analitik, istatistiksel modeller ve makine öğrenimi kullanarak gelecekteki olayları tahmin eder."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 18. SAĞLIK – orta – TYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Bağışıklık Sistemi Nasıl Çalışır?',
  'Bağışıklık sistemi, vücudu bakteri, virüs, mantar ve parazit gibi yabancı maddelere karşı koruyan karmaşık bir savunma ağıdır. İki temel katmandan oluşur: doğal bağışıklık ve adaptif bağışıklık. Doğal bağışıklık, hızlı ama özgül olmayan bir tepkidir; deri, mukoza ve fagositler bu sistemin parçasıdır. Adaptif bağışıklık ise daha yavaş gelişen, özgül bir yanıttır ve T-lenfositler ile B-lenfositler tarafından yürütülür. B-lenfositler antikor üretir; antikorlar, antijenlere bağlanarak onları etkisiz kılar. Aşılar, vücuda zayıflatılmış ya da ölü patojenleri tanıtarak bağışıklık hafızası oluşturur. Otoimmün hastalıklarda ise bağışıklık sistemi hatayla vücudun kendi dokularına saldırır.',
  'Sprinta Orijinal',
  'saglik',
  'orta',
  ARRAY['tyt', 'kpss']::exam_type[],
  ARRAY['lise_10', 'lise_11', 'lise_12']::grade_level[],
  138, 6.9, 53.0, 192,
  '[
    {"question": "Doğal bağışıklığın temel özelliği nedir?", "options": ["Özgül ve yavaş tepki", "Hızlı ama özgül olmayan tepki", "Antikor üretimi", "Bağışıklık hafızası oluşturma"], "correct_answer": "Hızlı ama özgül olmayan tepki", "explanation": "Doğal bağışıklık, patojeni tanımaksızın hızla harekete geçer; fagositler, doğal öldürücü hücreler ve iltihap bu sistemin araçlarıdır."},
    {"question": "Aşıların bağışıklık sistemine katkısı nedir?", "options": ["Virüsleri doğrudan öldürmek", "Bağışıklık hafızası oluşturmak", "Ateşi düşürmek", "Bakteri büyümesini engellemek"], "correct_answer": "Bağışıklık hafızası oluşturmak", "explanation": "Aşı, vücudu gerçek enfeksiyona hazırlayan bir bağışıklık hafızası oluşturur; sonraki maruziyette hızlı ve güçlü yanıt verilir."},
    {"question": "Otoimmün hastalıklarda ne gerçekleşir?", "options": ["Bağışıklık sistemi yetersiz çalışır", "Bağışıklık sistemi vücudun kendi dokularına saldırır", "Antikor üretimi durur", "Doğal bağışıklık sistemi baskılanır"], "correct_answer": "Bağışıklık sistemi vücudun kendi dokularına saldırır", "explanation": "Otoimmün hastalıklarda (örn. romatoid artrit, tip 1 diyabet) T-hücreleri vücudun kendi antijenlerini yabancı olarak algılar."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 19. FELSEFE – zor – AYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Kant''ın Ahlak Felsefesi',
  'Immanuel Kant, 18. yüzyılın en etkili filozoflarından biridir. Ahlak felsefesinde Kant, ahlaki eylemliğin koşulsuz buyruk (kategorik imperatif) ilkesine dayanması gerektiğini savunur. Koşulsuz buyruk, herkesin aynı şekilde davranmasını evrensel bir yasa olarak isteyip istemeyeceğimizi sorgulamayı gerektirir. Bu ilkeye göre, yalnızca evrenselleştirilebilir maksimler ahlaki kabul edilebilir. Kant''a göre ahlakın temeli mutluluk ya da sonuçlar değil, görevdir; bu yaklaşım deontolojik etik olarak adlandırılır. İnsan onuruna duyulan saygıya dayanan "insanlığı amaç olarak ele al, asla yalnızca araç olarak kullanma" ilkesi, Kant ahlakının ikinci formülasyonunu oluşturur. Bu ilkeler, insan hakları hukukunun felsefi temellerinden biri sayılır.',
  'Sprinta Orijinal',
  'felsefe',
  'zor',
  ARRAY['ayt', 'kpss']::exam_type[],
  ARRAY['lise_12', 'universite', 'yetiskin']::grade_level[],
  148, 7.4, 41.0, 222,
  '[
    {"question": "Kant''ın koşulsuz buyruk ilkesi neyi sorgular?", "options": ["Eylemin mutluluk getirip getirmediğini", "Eylemin herkese uygulanabilir evrensel bir yasa olup olmadığını", "Eylemin sonuçlarının faydalı olup olmadığını", "Eylemin toplum tarafından onaylanıp onaylanmadığını"], "correct_answer": "Eylemin herkese uygulanabilir evrensel bir yasa olup olmadığını", "explanation": "Kategorik imperatif: \"Yalnızca aynı zamanda evrensel bir yasa olmasını isteyebileceğin maksime göre hareket et.\""},
    {"question": "Kant''ın ahlak anlayışı hangi etik yaklaşıma örnek teşkil eder?", "options": ["Faydacılık", "Erdem etiği", "Deontolojik etik", "Sonuç etiği"], "correct_answer": "Deontolojik etik", "explanation": "Deontolojik etik, eylemin doğruluğunu sonuçlarıyla değil, eylemin kendisinin kurala uygunluğuyla değerlendirir."},
    {"question": "\"İnsanlığı asla yalnızca araç olarak kullanma\" ilkesi ne üzerine kuruludur?", "options": ["Toplumsal fayda", "İnsan onuruna saygı", "Mutluluk ilkesi", "Doğa yasaları"], "correct_answer": "İnsan onuruna saygı", "explanation": "Kant''a göre her insan rasyonel bir varlık olarak içsel değer taşır ve bu değer çiğnenemez."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 20. COĞRAFYA – kolay – LGS / TYT
-- ─────────────────────────────────────────────────────────────
(
  'Türkiye''nin Yeryüzü Şekilleri',
  'Türkiye, çeşitli yeryüzü şekillerine ev sahipliği yapan dağlık ve platolarla kaplı bir ülkedir. Kuzey Anadolu Dağları (Karadeniz kıyısı boyunca) ve Toros Dağları (güneyde) ülkenin en uzun sıradağlarıdır. Ağrı Dağı, 5.137 metre ile Türkiye''nin en yüksek noktasını oluşturur. İç Anadolu''da step ikliminin hüküm sürdüğü geniş platolar yer alır; bu platolar tarım ve hayvancılık için önemlidir. Türkiye''nin en uzun ırmağı Kızılırmak''tır; aynı zamanda Anadolu''yu boydan boya kat ederek Karadeniz''e dökülür. Van Gölü, hem Türkiye''nin hem de Orta Doğu''nun en büyük gölüdür. Marmara Denizi, tektonik olarak oluşmuş bir iç denizdir ve İstanbul Boğazı ile Çanakkale Boğazı arasında yer alır.',
  'Sprinta Orijinal',
  'cografya',
  'kolay',
  ARRAY['lgs', 'tyt']::exam_type[],
  ARRAY['ortaokul_8', 'lise_9', 'lise_10']::grade_level[],
  128, 6.2, 64.0, 158,
  '[
    {"question": "Türkiye''nin en yüksek dağı hangisidir?", "options": ["Uludağ", "Erciyes", "Ağrı Dağı", "Süphan Dağı"], "correct_answer": "Ağrı Dağı", "explanation": "5.137 metreyle Ağrı Dağı, Türkiye''nin ve çevresinin en yüksek zirvesidir."},
    {"question": "Türkiye''nin en uzun ırmağı hangisidir?", "options": ["Fırat", "Dicle", "Kızılırmak", "Sakarya"], "correct_answer": "Kızılırmak", "explanation": "1.355 km uzunluğuyla Kızılırmak, yalnızca Türkiye sınırları içinde akan en uzun ırmaklardandır."},
    {"question": "Van Gölü hangi açıdan önemlidir?", "options": ["Türkiye''nin en tatlı su gölüdür", "Türkiye ve Orta Doğu''nun en büyük gölüdür", "Hidroelektrik üretiminde kullanılır", "Kızılırmak''ın beslediği göldr"], "correct_answer": "Türkiye ve Orta Doğu''nun en büyük gölüdür", "explanation": "Van Gölü, soda gölü özelliği taşıyan tektonik kökenli bir göl olup Orta Doğu''nun en büyük iç suyudur."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 21. ÇEVRE – zor – AYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Biyoçeşitlilik Kaybı ve Ekosistem Hizmetleri',
  'Biyoçeşitlilik, bir ekosistemde yaşayan tüm canlı türlerinin, genetik varyasyonların ve ekosistemlerin toplamıdır. Ekosistem hizmetleri; temiz su, hava arındırma, toprak oluşumu, iklim düzenlemesi ve bitki tozlaştırması gibi doğanın insanlığa sağladığı ücretsiz yararlardır. Bu hizmetlerin yıllık ekonomik değerinin küresel GSYİH''nin birçok katı olduğu tahmin edilmektedir. İnsan faaliyetleri — ormansızlaşma, aşırı avlanma, tarım alanı genişlemesi ve iklim değişikliği — biyoçeşitlilik kaybını hızlandırmaktadır. Bilim insanları, günümüzün "altıncı kitlesel yokoluş" dönemini yaşadığımızı öne sürer; tür yok oluş hızı doğal seviyenin 100–1.000 katına çıkmıştır. Ekosistem hizmetlerinin çökmesi, gıda güvensizliği, su kıtlığı ve artan doğal afet riskiyle doğrudan ilişkilidir. Koruma biyolojisi, türleri ve habitatları korumak için bilimsel stratejiler geliştirir.',
  'Sprinta Orijinal',
  'cevre',
  'zor',
  ARRAY['ayt', 'kpss']::exam_type[],
  ARRAY['lise_12', 'universite', 'yetiskin']::grade_level[],
  152, 7.1, 42.0, 218,
  '[
    {"question": "Ekosistem hizmetlerine aşağıdakilerden hangisi örnek değildir?", "options": ["Hava arındırma", "Iklim düzenlemesi", "Petrol çıkarma", "Bitki tozlaştırması"], "correct_answer": "Petrol çıkarma", "explanation": "Petrol çıkarma, doğadan yararlanılan bir hammadde kaynağıdır ancak ekosistem tarafından üretilen bir hizmet değildir."},
    {"question": "Günümüz biyoçeşitlilik kaybı hangi kavramla adlandırılır?", "options": ["Beşinci kitlesel yokoluş", "Altıncı kitlesel yokoluş", "Evrimsel uyum", "Doğal seleksiyon"], "correct_answer": "Altıncı kitlesel yokoluş", "explanation": "Holosen veya Antroposen yokoluşu olarak da bilinen bu dönemde tür yok oluş hızı, insan öncesi arka plana kıyasla 100–1.000 kat artmıştır."},
    {"question": "Biyoçeşitlilik kaybı ile gıda güvensizliği arasındaki ilişki nedir?", "options": ["Bağlantısızdır", "Biyoçeşitlilik azaldıkça tozlaştırıcılar ve toprak verimliliği azalarak gıda üretimi düşer", "Biyoçeşitlilik kaybı gıda üretimini artırır", "Yalnızca su kaynaklarını etkiler"], "correct_answer": "Biyoçeşitlilik azaldıkça tozlaştırıcılar ve toprak verimliliği azalarak gıda üretimi düşer", "explanation": "Arı gibi tozlaştırıcıların azalması ve toprak mikrobiyomunun bozulması, tarımsal verimi doğrudan tehdit eder."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 22. KÜLTÜR & SANAT – kolay – LGS / TYT
-- ─────────────────────────────────────────────────────────────
(
  'Türk Halk Müziği Geleneği',
  'Türk halk müziği, Anadolu''nun binlerce yıllık kültürel birikimini yansıtan sözlü bir gelenektir. Bu müzik, âşıklar ve ozanlar tarafından saz eşliğinde dile getirilir; saz, bağlama olarak da bilinir. Halk müziği; türkü, mani, ninni, ağıt, destan ve koşma gibi farklı biçimlere ayrılır. Türküler, doğa, aşk, savaş ve göç gibi evrensel temaları işler. Bölgeden bölgeye değişen ağızlar ve ezgiler, Türkiye''nin kültürel çeşitliliğini gözler önüne serer: Karadeniz kemençesi, Ege zeybek ezgileri ve Doğu Anadolu uzun havaları bu çeşitliliğin örnekleridir. Aşık Veysel, Hacı Bektaş Veli geleneğini sürdüren önemli bir ozan olarak tarihe geçmiştir. UNESCO, Türk âşıklık geleneğini Somut Olmayan Kültürel Miras listesine almıştır.',
  'Sprinta Orijinal',
  'kultur_sanat',
  'kolay',
  ARRAY['lgs', 'tyt']::exam_type[],
  ARRAY['ortaokul_8', 'lise_9', 'lise_10']::grade_level[],
  130, 6.3, 65.0, 162,
  '[
    {"question": "Türk halk müziğinde sazın diğer adı nedir?", "options": ["Kemençe", "Bağlama", "Ud", "Kanun"], "correct_answer": "Bağlama", "explanation": "Bağlama, Anadolu halk müziğinin simgesi olan saplı telli bir çalgıdır; tezene ya da parmakla çalınır."},
    {"question": "UNESCO''nun Türk âşıklık geleneğine yönelik tutumu nedir?", "options": ["Yasaklamıştır", "Somut Kültürel Miras listesine almıştır", "Somut Olmayan Kültürel Miras listesine almıştır", "Yok sayılmıştır"], "correct_answer": "Somut Olmayan Kültürel Miras listesine almıştır", "explanation": "UNESCO, 2009''da Türk âşıklık geleneğini İnsanlığın Somut Olmayan Kültürel Mirası listesine eklemiştir."},
    {"question": "Aşağıdakilerden hangisi halk müziği formları arasında yer almaz?", "options": ["Türkü", "Ağıt", "Mani", "Semai"], "correct_answer": "Semai", "explanation": "Semai, Türk sanat müziğinde kullanılan bir usul/form olup halk müziğinin değil klasik müziğin kategorisine girer."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 23. TÜRKÇE-EDEBİYAT – orta – TYT
-- ─────────────────────────────────────────────────────────────
(
  'Anlatı Teknikleri: Bakış Açısı ve Anlatıcı',
  'Bir edebi eserde bakış açısı, olayların kim tarafından ve nasıl aktarıldığını belirleyen temel bir anlatı unsurudur. Birinci şahıs anlatıcı, olayları bizzat yaşayan ya da gözlemleyen bir karakter olarak "ben" diliyle aktarır; okuyucuya samimi ve öznel bir deneyim sunar. Üçüncü şahıs tanrısal anlatıcı, tüm karakterlerin düşünce ve duygularına erişim sağlar; bu bakış açısı roman türünde en yaygın kullanılanıdır. Üçüncü şahıs sınırlı anlatıcı ise yalnızca belirli bir karakterin iç dünyasına odaklanır. Anlatıcının güvenilirliği de sorgulanabilir; güvenilmez anlatıcı, okuyucuyla farklı bilgi katmanları arasında bir gerilim yaratır. İkinci şahıs anlatım ise "sen" zamiriyle okuyucuyu doğrudan olaya dahil eder; daha az kullanılan ama güçlü bir tekniktir.',
  'Sprinta Orijinal',
  'turkce_edebiyat',
  'orta',
  ARRAY['tyt']::exam_type[],
  ARRAY['lise_10', 'lise_11', 'lise_12']::grade_level[],
  140, 6.6, 56.0, 188,
  '[
    {"question": "Birinci şahıs anlatıcının temel özelliği nedir?", "options": ["Tüm karakterlerin düşüncelerine erişim", "Olayları ''ben'' diliyle aktarma", "Okuyucuyu ''sen'' diliyle dahil etme", "Sınırlı bakış açısı sunma"], "correct_answer": "Olayları ''ben'' diliyle aktarma", "explanation": "Birinci şahıs anlatıcı, kendi deneyimini aktardığından öznel ve samimi bir ses oluşturur; tüm bilgilere sahip değildir."},
    {"question": "Tanrısal anlatıcının üçüncü şahıs sınırlı anlatıcıdan farkı nedir?", "options": ["Tanrısal anlatıcı tüm karakterlerin iç dünyasına ererken sınırlı yalnızca birine odaklanır", "Tanrısal anlatıcı birinci şahısla anlatır", "Sınırlı anlatıcı daha tarafsızdır", "Tanrısal anlatıcı yalnızca diyalog kullanır"], "correct_answer": "Tanrısal anlatıcı tüm karakterlerin iç dünyasına ererken sınırlı yalnızca birine odaklanır", "explanation": "Her iki tip de üçüncü şahıs zamiri kullanır; aradaki fark, erişim alanının genişliğidir."},
    {"question": "Güvenilmez anlatıcı okuyucuda hangi etkiyi yaratır?", "options": ["Güven ve netlik", "Bilgi katmanları arasında gerilim", "Sıkıcılık ve tekrar", "Anlatının hızlanması"], "correct_answer": "Bilgi katmanları arasında gerilim", "explanation": "Güvenilmez anlatıcının aktarımıyla gerçeklik arasındaki uçurum, okuyucunun aktif olarak yorumlamasını ve sorgulamasını gerektirir."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 24. FELSEFE – kolay – LGS / TYT
-- ─────────────────────────────────────────────────────────────
(
  'Platon''un Mağara Alegorisi',
  'Platon, Devlet adlı eserinde insanın bilgi ve gerçeklik anlayışını açıklamak için ünlü mağara alegorisini anlatır. Alegoriye göre doğuştan zincirlenmiş insanlar bir mağaranın içinde otururlar. Arkalarında yanan ateşin önünden geçen nesnelerin mağara duvarına düşen gölgeleri görürler ve bu gölgeleri gerçeklik sanırlar. Zincirlerinden kurtulan biri mağaradan çıkıp güneş ışığıyla aydınlanınca asıl gerçekliği kavrar. Ancak mağaraya dönüp diğerlerine gerçeği anlatmaya çalışınca inanılmaz ve tehlikeli biri olarak görülür. Platon bu alegorisi aracılığıyla bilgisizliğin köleliği, felsefi aydınlanmanın özgürleştirici gücü ve filozofun topluma karşı sorumluluğunu dile getirir.',
  'Sprinta Orijinal',
  'felsefe',
  'kolay',
  ARRAY['lgs', 'tyt']::exam_type[],
  ARRAY['ortaokul_8', 'lise_9', 'lise_10', 'lise_11']::grade_level[],
  132, 6.4, 62.0, 165,
  '[
    {"question": "Mağara alegorisinde mağara içindeki insanlar neyi temsil eder?", "options": ["Gerçeği bilen aydınları", "Bilgisizlik içindeki ve gölgeleri gerçek sanan insanları", "Filozofların öğrencilerini", "Hükümdarları"], "correct_answer": "Bilgisizlik içindeki ve gölgeleri gerçek sanan insanları", "explanation": "Mağara içindekiler sadece gölgeleri görebildiğinden bilgisizlik ve yanılsama içindedirler; duyularımızla edindiğimiz bilginin sınırlılığını simgelerler."},
    {"question": "Mağaradan çıkmak alegoride ne anlama gelir?", "options": ["Ölüm", "Felsefi aydınlanma ve gerçekliğin kavranması", "Sürgün edilmek", "Mağaraya hapsedilmek"], "correct_answer": "Felsefi aydınlanma ve gerçekliğin kavranması", "explanation": "Güneş ışığı, Platon''un idealar dünyasını temsil eder; mağaradan çıkmak, algı düzeyinden us düzeyine yükselmeyi simgeler."},
    {"question": "Mağaraya dönen kişi neden tehlikeli görülür?", "options": ["Mağarayı tahrip ettiği için", "Alışılmış gerçeklik anlayışını sorguladığı için", "Liderlik yapmak istediği için", "Ateşi söndürdüğü için"], "correct_answer": "Alışılmış gerçeklik anlayışını sorguladığı için", "explanation": "Platon, gerçeği görmüş filozofun anlatılarının insanlara anlamsız ya da tehlikeli gelebileceğini; hatta Sokrates örneğinde olduğu gibi ölüm cezasına çarptırılabileceğini ima eder."}
  ]'::jsonb,
  true, true, 'original'
),

-- ─────────────────────────────────────────────────────────────
-- 25. TEKNOLOJİ – orta – TYT / KPSS
-- ─────────────────────────────────────────────────────────────
(
  'Siber Güvenliğe Giriş',
  'Siber güvenlik, bilgisayar sistemleri, ağlar ve verileri dijital saldırılara karşı koruma bilimidir. Temel tehditlerin başında kötü amaçlı yazılımlar (malware) gelir: virüs, solucan, fidye yazılımı ve casus yazılım bu kategoriye girer. Kimlik avı (phishing), kullanıcıları sahte e-posta veya web siteleri aracılığıyla kişisel bilgilerini paylaşmaya kandırır. Sosyal mühendislik ise teknik açıkları değil insan psikolojisini hedef alır. Güçlü parola kullanımı, çok faktörlü kimlik doğrulama (MFA) ve düzenli yazılım güncellemeleri, temel koruma önlemleri arasında sayılır. Şifreleme, verileri yetkisiz erişime karşı korur; TLS/SSL protokolleri web trafiğini güvenli hale getirir. Dünya genelinde siber saldırıların maliyetinin yıllık 8 trilyon doları aştığı tahmin edilmektedir. Siber güvenlik uzmanı olmak için Kali Linux, ağ protokolleri ve etik hacking bilgisi temel altyapıyı oluşturur.',
  'Sprinta Orijinal',
  'teknoloji',
  'orta',
  ARRAY['tyt', 'kpss']::exam_type[],
  ARRAY['lise_10', 'lise_11', 'lise_12', 'universite']::grade_level[],
  145, 6.9, 55.0, 190,
  '[
    {"question": "Kimlik avı (phishing) saldırısı nasıl çalışır?", "options": ["Şifreleme anahtarlarını çalarak", "Sahte e-posta/site ile kullanıcıyı kandırarak kişisel bilgi ele geçirerek", "Fiziksel olarak bilgisayara erişerek", "Ağ trafiğini keserek"], "correct_answer": "Sahte e-posta/site ile kullanıcıyı kandırarak kişisel bilgi ele geçirerek", "explanation": "Phishing; güvenilir kurumları taklit eden sahte iletişimlerle kullanıcıları kandırarak şifre, kredi kartı gibi bilgileri çalmayı hedefler."},
    {"question": "Çok faktörlü kimlik doğrulama (MFA) ne sağlar?", "options": ["Şifre olmadan giriş", "Tek şifre yerine birden fazla doğrulama katmanı", "Otomatik virüs tarama", "Ağ şifrelemesi"], "correct_answer": "Tek şifre yerine birden fazla doğrulama katmanı", "explanation": "MFA, bilgi (şifre), sahip olunan (telefon) ve biyometri gibi birden fazla faktör gerektirerek hesap güvenliğini artırır."},
    {"question": "TLS/SSL protokollerinin amacı nedir?", "options": ["E-posta spam filtreleme", "Web trafiğini şifreleyerek güvenli iletişim sağlamak", "Virüsleri tespit etmek", "Ağ bant genişliğini artırmak"], "correct_answer": "Web trafiğini şifreleyerek güvenli iletişim sağlamak", "explanation": "TLS (Transport Layer Security), sunucu ile istemci arasındaki veri trafiğini şifreleyerek gizlice izlenmeyi (man-in-the-middle) engeller."}
  ]'::jsonb,
  true, true, 'original'
);
