-- content_library seed verisi
-- Mevcut şema: 002_multi_tenant.sql
-- Kolon adları: body (metin), is_published, category (enum), difficulty (enum)

-- Difficulty enum değerleri: cok_kolay, kalay, orta, zor, cok_zor
-- Category enum değerleri: turkce_edebiyat, fen_bilimleri, sosyal_bilgiler, tarih,
--                          cografya, felsefe, guncel_olaylar, teknoloji, matematik_mantik,
--                          saglik, cevre, kultur_sanat
-- Grade level enum: ilkokul_3..4, ortaokul_5..8, lise_9..12, universite, yetiskin
-- Exam type enum: lgs, tyt, ayt, kpss, ales, yds, other

-- ==============================
-- Güçlük: cok_kolay — Türkçe Edebiyat
-- ==============================
INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type
) VALUES (
  'İlk Kar',
  'Bugün sabah uyandığımda pencereden dışarı baktım. Her yer bembeyazdı. Kar yağmıştı gece. Ağaçlar birer gelin gibi süslenmişti. Bahçedeki çardak karla örtülmüştü. Ben de hemen giyindim. Dışarı çıktım. Karı avuçlarımla tuttum. Soğuğu hissettim. Komşu çocukları da çıkmıştı bahçeye. Birlikte kar topu oynadık. Çok güzel bir sabah oldu.',
  'turkce_edebiyat', 'cok_kolay', 88, 78,
  170, ARRAY['lgs']::exam_type[], ARRAY['ortaokul_5', 'ortaokul_6', 'ortaokul_7']::grade_level[],
  'original'
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type
) VALUES (
  'Tohumun Yolculuğu',
  'Küçük bir tohum, güz mevsiminde annesinden ayrıldı. Rüzgar onu uzaklara taşıdı; dağ yollarından geçti, derelerin üzerinden uçtu. Sonunda verimli bir ovada toprağa düştü.

Kış boyunca toprak içinde uyudu. Kar altında, soğukta, karanlıkta bekledi. Kimse onun orada olduğunu bilmiyordu. Kimse onu görmüyor, kimse onu duymuyordu.

İlkbaharda yağmur yağdı. Toprak ısındı. Tohum içinden bir şeyler kabardı; önce ince bir filiz, sonra iki yaprak, sonra bir gövde. Güneşe doğru uzandı.

Yaz sonunda o küçük tohum, çevresine yüzlerce tohumunu saçan iri bir bitkiye dönüşmüştü. Her biri yeni bir yolculuğa hazır, her biri yeni bir başlangıcın umuduydu.',
  'turkce_edebiyat', 'cok_kolay', 130, 72,
  180, ARRAY['lgs', 'tyt']::exam_type[], ARRAY['ortaokul_5', 'ortaokul_6', 'ortaokul_7', 'ortaokul_8']::grade_level[],
  'original'
);

-- ==============================
-- Güçlük: kalay — Coğrafya
-- ==============================
INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Anadolu''nun Coğrafi Yapısı',
  'Anadolu, üç tarafı denizlerle çevrili bir yarımada olup Asya kıtasının en batı uzantısını oluşturmaktadır. Kuzeyinde Karadeniz, güneyinde Akdeniz, batısında ise Ege Denizi bulunmaktadır. Bu konum, Anadolu''yu tarihsel süreç boyunca Doğu ile Batı arasında bir köprü haline getirmiştir.

Yarımadanın iç kesimlerinde yüksek platolar ve dağlık alanlar egemendir. Ortalama yükseltisi 1.100 metreyi aşan Anadolu, Türkiye''nin toplam yüzölçümünün büyük bölümünü kapsamaktadır. Kıyı kesimlerinde sıcak ve yağışlı bir iklim hâkimken iç kesimlerde karasal iklim özellikleri ön plana çıkmaktadır.

Bu iklim çeşitliliği, Anadolu''yu biyoçeşitlilik açısından son derece zengin kılmaktadır. Farklı iklim kuşakları, farklı bitki örtüsü tiplerini ve hayvan topluluklarını bir arada barındırmaktadır. Bu nedenle Anadolu, dünyada biyolojik çeşitlilik merkezleri arasında sayılmaktadır.',
  'cografya', 'kolay', 165, 63,
  190, ARRAY['lgs', 'tyt']::exam_type[], ARRAY['ortaokul_6', 'ortaokul_7', 'ortaokul_8', 'lise_9']::grade_level[],
  'original',
  '[
    {"question": "Anadolu''nun kuzeyinde hangi deniz bulunmaktadır?", "options": ["Ege", "Akdeniz", "Karadeniz", "Marmara"], "correct": 2, "type": "detail", "explanation": "Metinde Anadolu''nun kuzeyinde Karadeniz bulunduğu belirtilmektedir."},
    {"question": "Anadolu''nun ortalama yükseltisi kaç metredir?", "options": ["800", "950", "1.100", "1.400"], "correct": 2, "type": "detail", "explanation": "Metinde ortalama yükseltinin 1.100 metreyi aştığı ifade edilmektedir."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Kapadokya''nın Peribacaları',
  'Kapadokya, Orta Anadolu''nun derin zamanlardan süzülen bir mucizesidir. Milyonlarca yıl önce Erciyes ve Hasan dağlarından fışkıran lavlar ve küller, zamanla sertleşerek geniş bir plato oluşturdu. Yağmur ve rüzgar bu yumuşak taşı oydu, yontu; geride insanı büyüleyen şekiller bıraktı.

Peribacaları olarak bilinen bu oluşumlar, ince uzun gövdeler ve üzerlerindeki daha sert bazalt kaplarla tanınır. Sert kaya, alttaki yumuşak tüfü erozyon karşısında korurken her taş direk kendi biçimini aldı. Bazıları bir mantar gibi şişkin tepeli, bazıları sivri kuleleri andırır.

Bölge yalnızca doğal güzellikleriyle değil, insanların bu taşları oyarak oluşturduğu yeraltı şehirleri ve kaya kiliselerle de ün kazanmıştır. Binlerce yıl boyunca Hristiyanlar, bu mağaralarda ibadet etmiş ve yaşamını sürdürmüştür. Duvarları süsleyen freskler, Bizans sanatının en özgün örnekleri arasında kabul edilmektedir.',
  'cografya', 'kolay', 175, 64,
  195, ARRAY['lgs', 'tyt']::exam_type[], ARRAY['ortaokul_6', 'ortaokul_7', 'ortaokul_8', 'lise_9']::grade_level[],
  'original',
  '[
    {"question": "Peribacalarının oluşmasında hangi doğa olayları rol oynamıştır?", "options": ["Depremler ve seli", "Lav/kül + erozyon", "Buzul hareketi", "Rüzgar ve güneş"], "correct": 1, "type": "detail", "explanation": "Metin, volkanik faaliyetler ve erozyonun bu oluşumları yarattığını belirtmektedir."}
  ]'::jsonb
);

-- ==============================
-- Güçlük: orta — Fen Bilimleri + Tarih
-- ==============================
INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Göç Eden Kuşlar',
  'Her yıl milyonlarca kuş, yaşam koşullarının olumsuzlaştığı bölgelerden daha uygun iklimlere doğru uzun yolculuklara çıkar. Bu doğa olayına göç adı verilir. Göç, yalnızca kuşlara özgü değildir; balıklar, kelebekler ve memeliler de mevsimlik hareketler yapar.

Kuşlar göç rotalarını nasıl belirler? Bilim insanları onlarca yıl boyunca bu soruyu araştırmış ve çarpıcı bulgulara ulaşmıştır. Kuşlar, Güneş''in konumundan ve yıldızlardan yön tayini yapabilir. Bunun yanı sıra, beyin hücrelerinde bulunan magnetit minerali sayesinde Dünya''nın manyetik alanını algılayarak adeta dahili bir pusula kullanabilirler.

Uzun mesafe göççüsü kuşlar arasında en çarpıcı örnek arktik kartalcasıdır. Bu kuş, yılda yaklaşık 70.000 kilometre uçarak Kuzey Kutbu ile Antarktika arasındaki yolculuğu tamamlar. Bu mesafe, Dünya''yı bir buçuk kez dolaşmaya eşdeğerdir.

İklim değişikliği, göç örüntülerini bozmaktadır. Bazı türler normalde göç ettikleri bölgelerde kışlamaya başlamıştır. Bu değişim, bitki ve hayvan popülasyonları arasındaki hassas dengeleri tehdit ederek tahmin edilemeyen ekolojik sonuçlar doğurabilir.',
  'fen_bilimleri', 'orta', 210, 60,
  220, ARRAY['lgs', 'tyt', 'ayt']::exam_type[], ARRAY['ortaokul_7', 'ortaokul_8', 'lise_9', 'lise_10', 'lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Arktik kartalcasının yıllık göç mesafesi yaklaşık kaç kilometredir?", "options": ["35.000", "50.000", "70.000", "90.000"], "correct": 2, "type": "detail", "explanation": "Metin bu mesafenin Dünya''yı bir buçuk kez dolaşmaya eşdeğer olduğunu belirtmiştir."},
    {"question": "Metne göre kuşlar yön tayininde aşağıdakilerden hangisini kullanmaz?", "options": ["Güneş''in konumu", "Manyetik alan", "Yıldızlar", "Su akıntıları"], "correct": 3, "type": "detail", "explanation": "Metinde yalnızca Güneş, manyetik alan ve yıldızlardan söz edilmiştir."},
    {"question": "İklim değişikliğinin göç örüntüleri üzerindeki etkisi için metinde verilen bilgi aşağıdakilerden hangisidir?", "options": ["Tüm kuşlar göçü bırakmıştır", "Bazı türler göç etmeleri gereken yerde kışlamaktadır", "Göç mesafeleri kısalmaktadır", "Yeni göç rotaları oluşmaktadır"], "correct": 1, "type": "inference", "explanation": "Metin, bazı türlerin normalde göç ettikleri bölgelerde kışlamaya başladığını ifade etmektedir."},
    {"question": "Bu metnin ana fikri aşağıdakilerden hangisidir?", "options": ["Arktik kartalcası dünyanın en uzun göçünü yapan kuştur", "Kuş göçü karmaşık bir navigasyon sistemi gerektiren doğal bir olgudur", "İklim değişikliği kuşları olumsuz etkilemektedir", "Göç sadece kuşlara özgü bir davranıştır"], "correct": 1, "type": "main_idea", "explanation": "Metin göçü tanımlayarak nasıl gerçekleştiğini ve güncel tehditlerini bütüncül biçimde ele almaktadır."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'İpek Yolu''nun Önemi',
  'İpek Yolu, Çin''den Akdeniz''e uzanan, yaklaşık 6.400 kilometre boyunca devam eden kadim ticaret ve kültür güzergâhıdır. Milattan önce 2. yüzyılda Han Hanedanı döneminde düzenli işlerlik kazanan bu güzergâh, yalnızca ipek değil; baharat, porselen, kâğıt, barut ve sayısız fikir ile inancın da taşındığı çok boyutlu bir iletişim ağıydı.

Yol boyunca kurulan kervansaraylar, tüccarların dinlenmesini ve ticari ilişkiler kurmasını sağlamaktaydı. Buhara, Semerkant ve Merv gibi şehirler bu ağın kritik düğüm noktaları haline geldi; kozmopolit yapıları ve entelektüel canlılıklarıyla dönemlerinin önemli kültür merkezleri olarak tarihte yerini aldı.

İpek Yolu''nun önemi yalnızca ekonomik değildi. Budizm, İslam ve Hristiyanlık gibi büyük dinler; matematik, astronomi ve tıp gibi bilimler; müzik ve sanat gibi kültürel birikimler de bu yollar aracılığıyla farklı medeniyetler arasında köprüler kurdu. Rönesans''ın Batı''da filizlenmesinde Doğu''dan gelen bilgi birikiminin payı küçümsenmeyecek kadar büyüktür.

13. yüzyılda Moğol İmparatorluğu''nun yükselişi, güzergâhı kısmen güvenli kıldı ve Marco Polo gibi kâşiflerin kapsamlı seyahatler yapmasını mümkün hale getirdi. Ancak 15. yüzyılda deniz yollarının açılmasıyla güzergâhın ticari ağırlığı zamanla azaldı.',
  'tarih', 'orta', 255, 54,
  240, ARRAY['tyt', 'ayt', 'kpss']::exam_type[], ARRAY['lise_9', 'lise_10', 'lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "İpek Yolu''nun ticari etkinlik kazanmaya başladığı dönem aşağıdakilerden hangisidir?", "options": ["MS 2. yüzyıl", "MÖ 2. yüzyıl", "MS 13. yüzyıl", "MÖ 5. yüzyıl"], "correct": 1, "type": "detail", "explanation": "Metinde Han Hanedanı döneminde, yani MÖ 2. yüzyılda düzenli işlerlik kazandığı belirtilmektedir."},
    {"question": "Metne göre İpek Yolu''nun güvenli hale gelmesinde hangi faktör etkili olmuştur?", "options": ["Venedik tüccarların egemenliği", "Deniz yollarının açılması", "Moğol İmparatorluğu''nun yükselişi", "Kervansaray yapımı"], "correct": 2, "type": "detail", "explanation": "Metin 13. yüzyılda Moğol İmparatorluğu''nun güzergâhı kısmen güvenli kıldığını belirtmektedir."},
    {"question": "Aşağıdakilerden hangisi İpek Yolu aracılığıyla taşınanlar arasında yer almaz?", "options": ["Barut", "Porselen", "İnançlar", "Silah endüstrisi sırları"], "correct": 3, "type": "inference", "explanation": "Metinde silah endüstrisi sırlarından söz edilmemiştir."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Nöronlar ve Sinaptik İletim',
  'İnsan beyni, yaklaşık 86 milyar nörondan oluşan ve bu nöronlar arasında yüz trilyonu aşan bağlantıyı barındıran karmaşık bir ağdır. Nöronlar, elektriksel ve kimyasal sinyaller aracılığıyla birbiriyle iletişim kurar; bu iletişimin gerçekleştiği noktalara sinaps adı verilir.

Bir nöron uyarıldığında, hücre boyunca ilerleyen elektriksel bir sinyal olan aksiyon potansiyeli oluşur. Bu sinyal, aksonun ucuna ulaştığında nörotransmitter adı verilen kimyasal maddelerin sinaptik aralığa salınmasını tetikler. Nörotransmitterler karşı nöronun alıcılarına bağlanarak sinyalin devamını sağlar ya da engeller.

Öğrenme ve hafıza, sinaptik bağlantıların güçlendirilmesi ya da zayıflaması yoluyla gerçekleşir. Bu sürece sinaptik plastisite adı verilir. Uzun dönemli potansiyasyon (LTP), tekrarlayan uyarımın sinaptik iletimi kalıcı olarak güçlendirdiği bir mekanizmadır ve hafıza oluşumunun nörobilimsel temelini oluşturmaktadır.

Nörotransmitter dengesindeki bozulmalar, şizofreni, depresyon ve Parkinson hastalığı gibi pek çok nöropsikiyatrik durumla ilişkilendirilmektedir. Bu nedenle beyindeki kimyasal iletim mekanizmalarının anlaşılması, hem tıbbi tedavilerin hem de zihinsel sağlık müdahalelerinin geliştirilmesi açısından kritik önem taşımaktadır.',
  'fen_bilimleri', 'orta', 265, 53,
  250, ARRAY['ayt', 'tyt']::exam_type[], ARRAY['lise_10', 'lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "İnsan beynindeki tahmini nöron sayısı kaçtır?", "options": ["10 milyar", "86 milyar", "500 milyar", "1 trilyon"], "correct": 1, "type": "detail", "explanation": "Metinde insan beyninin yaklaşık 86 milyar nörondan oluştuğu belirtilmektedir."},
    {"question": "Sinaptik plastisite ne anlama gelmektedir?", "options": ["Nöronların yeniden üremesi", "Sinaptik bağlantıların güçlenmesi ya da zayıflaması", "Aksiyon potansiyelinin hızı", "Nörotransmitter türleri"], "correct": 1, "type": "detail", "explanation": "Metin sinaptik plastisiteyi, öğrenme ve hafızanın temeli olan bağlantı güçlendirme/zayıflatma süreci olarak tanımlamaktadır."}
  ]'::jsonb
);

-- ==============================
-- Güçlük: zor — Tartışmacı + Fizik + Güncel
-- ==============================
INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Dijital Çağda Dikkat',
  'Modern insan, tarihin hiçbir döneminde bu kadar çok bilgiye bu kadar hızlı erişemezdi. Akıllı telefonlar, sosyal medya platformları ve anlık bildirimler, düşünce akışımızı sürekli kesen bir çevre yaratmaktadır. Nörobilimciler, bu durumun dikkat süremizi köklü biçimde değiştirdiğini öne sürmektedir.

Dikkat süresi, beyinin odaklanma kapasitesiyle doğrudan ilişkilidir. Araştırmalar, sürekli bölünme halindeki bir zihnin derin düşünme için gerekli bağlantıları kurmakta güçlük çektiğini ortaya koymaktadır. Kısa videolar ve anlık içerikler, ödül sistemi olarak bilinen dopamin döngüsünü sürekli tetiklemekte; bu durum uzun soluklu okuma ve analitik düşünmeyi giderek zorlaştırmaktadır.

Öte yandan karşı görüşler de göz ardı edilemez. Dijital araçlar bilgiye erişimi demokratikleştirmiş, öğrenme olanaklarını genişletmiş ve küresel iletişimi mümkün kılmıştır. Teknolojinin kendisi sorun değil, onunla kurduğumuz ilişkidir. Bilinçli teknoloji kullanımı, dikkat eğitimi programlarıyla birleştirildiğinde olumsuz etkileri azaltmak mümkündür.

Ancak eğitimciler açısından tablo endişe vericidir. Uzun metinleri anlayarak okuma becerisi giderek azalmakta; buna bağlı olarak kavrama, çıkarım yapma ve eleştirel değerlendirme gibi üst düzey düşünme becerileri de gerilemektedir. Bu beceriler, yalnızca sınav başarısı için değil, sağlıklı bir demokratik toplumun sürdürülebilirliği açısından da temel önem taşımaktadır.',
  'felsefe', 'zor', 280, 50,
  260, ARRAY['tyt', 'ayt', 'kpss']::exam_type[], ARRAY['lise_10', 'lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Yazar bu metinde temel olarak hangi tezi savunmaktadır?", "options": ["Dijital araçlar her koşulda zararlıdır", "Sürekli bölünme hali derin düşünme kapasitesini olumsuz etkilemektedir", "Teknoloji eğitimi zorunlu hale getirilmelidir", "Sosyal medya yasaklanmalıdır"], "correct": 1, "type": "main_idea", "explanation": "Yazar, çoklu bölünmenin derin düşünmeyi engellediğini ana tez olarak sunmaktadır."},
    {"question": "Dopamin döngüsü bu metinde ne amaçla kullanılmıştır?", "options": ["Teknoloji bağımlılığının tedavisini açıklamak için", "Kısa içeriklerin neden çekici geldiğini açıklamak için", "Dijital okuryazarlığın önemini vurgulamak için", "Bilişsel gelişimi desteklemek için"], "correct": 1, "type": "inference", "explanation": "Metin, dopamin döngüsünün kısa içerikleri çekici kıldığını ve bunun uzun okumayı zorlaştırdığını belirtmektedir."},
    {"question": "Üst düzey düşünme becerilerinin gerilemesinin yalnızca sınav başarısını değil, demokratik toplumu da etkilediği belirtilmiştir. Bu ifade metinde hangi amaca hizmet etmektedir?", "options": ["Eğitim sistemini eleştirmek", "Sorunun bireysel değil toplumsal boyutuna dikkat çekmek", "Teknolojiyi tamamen reddetmek", "Eğitimcilerin yetersizliğini göstermek"], "correct": 1, "type": "inference", "explanation": "Yazar, meselenin sadece bireysel başarıyı değil toplumsal sağlığı da ilgilendirdiğini vurgulamaktadır."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Kara Delikler ve Uzay-Zaman',
  'Kara delikler, kütlelerinin o denli yoğunlaşmış olduğu uzay-zaman bölgeleridir ki ışık dahil hiçbir şey onların çekim alanından kurtulamaz. Albert Einstein''ın 1915 yılında yayımladığı Genel Görelilik Teorisi, bu nesnelerin varlığını matematiksel olarak öngörmüştür; ancak Einstein''ın kendisi başlangıçta bu tür nesnelerin gerçekte var olabileceğine inanmamıştır.

Kara deliklerin sınırını belirleyen bölgeye olay ufku adı verilir. Bu sınırın ötesine geçen madde veya radyasyon, evrenin geri kalanıyla tüm iletişimini kalıcı olarak yitirir. Hawking radyasyonu teorisine göre kara delikler, kuantum mekaniği etkileri nedeniyle zamanla enerji yayarak küçülmekte ve eninde sonunda buharlaşmaktadır; ancak bu süreç astronomik zaman ölçeklerinde gerçekleşmektedir.

2019 yılında Olay Ufku Teleskobu işbirliği, M87 galaksisinin merkezindeki kara deliğin ilk doğrudan görüntüsünü kamuoyuyla paylaştı. Yaklaşık 6,5 milyar güneş kütlesine sahip bu dev nesne, dünya çapındaki radyo teleskoplarının koordineli çalışması sayesinde görüntülenebildi.

Kara delikler yalnızca yıldızların çöküşüyle oluşmaz. Galaksilerin merkezlerinde bulunan süperkütleli kara delikler, galaksilerin oluşum süreçleriyle karmaşık bir etkileşim içindedir. Bu nesnelerin galaktik evrim üzerindeki rolü, çağdaş astrofiziğin en heyecan verici araştırma alanlarından birini oluşturmaktadır.',
  'fen_bilimleri', 'zor', 310, 46,
  270, ARRAY['ayt', 'tyt']::exam_type[], ARRAY['lise_10', 'lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Einstein''ın Genel Görelilik Teorisi ne zaman yayımlanmıştır?", "options": ["1905", "1915", "1925", "1935"], "correct": 1, "type": "detail", "explanation": "Metinde teorinin 1915 yılında yayımlandığı belirtilmektedir."},
    {"question": "M87 galaksisinin merkezindeki kara deliğin kütlesi yaklaşık kaçtır?", "options": ["1 milyon güneş kütlesi", "3,5 milyar güneş kütlesi", "6,5 milyar güneş kütlesi", "10 milyar güneş kütlesi"], "correct": 2, "type": "detail", "explanation": "Metinde bu kara deliğin yaklaşık 6,5 milyar güneş kütlesine sahip olduğu ifade edilmektedir."},
    {"question": "Hawking radyasyonu teorisine göre kara delikler zamanla ne olur?", "options": ["Daha büyük kara delikleri yutar", "Yeni yıldızlar oluşturur", "Enerji yayarak küçülür ve buharlaşır", "Beyaz cüce haline gelir"], "correct": 2, "type": "inference", "explanation": "Metin, Hawking radyasyonu teorisine göre kara deliklerin enerji yayarak buharlaştığını belirtmektedir."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Enerji Dönüşümü ve Jeopolitik',
  'Fosil yakıtlardan yenilenebilir enerji kaynaklarına geçiş, yalnızca bir iklim politikası meselesi değil; küresel güç dengelerini yeniden şekillendirecek jeopolitik bir dönüşümdür. Petrol ve doğalgaz, yüzyılın büyük bölümünde uluslararası ilişkilerin merkezinde yer almıştır. Güneş ve rüzgar enerjisine dayalı bir dünyada bu güç dengelerinin nasıl değişeceği, stratejistlerin en çok tartıştığı sorular arasındadır.

Yenilenebilir enerji teknolojilerinin merkezinde yer alan kritik mineraller; lityum, kobalt, nikel ve nadir toprak elementleri olarak sıralanmaktadır. Bu minerallerin büyük bölümünün birkaç ülkede yoğunlaşmış olması, yeni bağımlılık ilişkilerinin doğmasına zemin hazırlamaktadır. Özellikle Çin''in nadir toprak elementleri üretimindeki baskınlığı ve Demokratik Kongo Cumhuriyeti''nin kobalt rezervleri, tedarik zinciri güvenliği açısından stratejik önem taşımaktadır.

Enerji bağımsızlığı kavramı, bu dönüşümle birlikte yeni bir içerik kazanmaktadır. Güneş ışığı ve rüzgar coğrafi olarak daha geniş alanlara dağılmış olduğundan teorik olarak daha fazla ülkenin enerji üretiminde özerklik kazanmasına olanak tanımaktadır. Ancak teknoloji üretimindeki asimetri ve finansmana erişim farklılıkları, bu avantajın eşit dağılmasını engellemektedir.

Enerji dönüşümünün yönetilme biçimi, gelecek on yılların ekonomik refahını ve siyasi istikrarını belirleyecek yapısal faktörler arasındadır. Bu sürecin hem ulusal hem de uluslararası ölçekte adil, kapsayıcı ve güvenli biçimde yönetilmesi, iklim hedeflerine ulaşmanın olduğu kadar küresel barışın da ön koşuludur.',
  'guncel_olaylar', 'zor', 325, 44,
  275, ARRAY['tyt', 'ayt', 'kpss']::exam_type[], ARRAY['lise_10', 'lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Metne göre enerji dönüşümünün jeopolitik boyutu neden önemlidir?", "options": ["Yalnızca iklim değişikliğini önlemek için", "Küresel güç dengelerini yeniden şekillendirdiği için", "Petrol fiyatlarını düşürdüğü için", "Yenilenebilir enerjiyi ucuzlattığı için"], "correct": 1, "type": "main_idea", "explanation": "Metin, enerji dönüşümünü yalnızca çevre değil jeopolitik açıdan ele almakta ve güç dengelerinin değişeceğine dikkat çekmektedir."},
    {"question": "Kritik mineraller bağlamında ''yeni bağımlılık ilişkileri'' ifadesi ne anlama gelmektedir?", "options": ["Fosil yakıtlara olan bağımlılığın artması", "Az sayıda ülkenin kritik mineralleri kontrol etmesiyle oluşan bağımlılık", "Yenilenebilir enerjinin pahalı olması", "Teknoloji transferinin engellenmesi"], "correct": 1, "type": "inference", "explanation": "Metin, kritik minerallerin birkaç ülkede yoğunlaşmasının yeni bağımlılık ilişkilerine zemin hazırladığını belirtmektedir."}
  ]'::jsonb
);

-- ==============================
-- Güçlük: cok_zor — Felsefe + Tarih + Kimya + Eğitim
-- ==============================
INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Bilişsel Önyargılar ve Karar Verme',
  'İnsan zihni, sanıldığının aksine nesnel bir gözlemci değildir. Bilişsel psikolojinin son yarım yüzyıldaki bulguları, karar verme süreçlerimizin sistematik hatalar ve önyargılar tarafından şekillendirildiğini açıkça ortaya koymaktadır. Daniel Kahneman ve Amos Tversky''nin öncü çalışmaları, sezgisel düşüncenin mantıksal düşünceyle nasıl rekabet ettiğini ve çoğu zaman onu nasıl geride bıraktığını gözler önüne sermiştir.

Doğrulama önyargısı, bireylerin mevcut inançlarını destekleyen bilgileri arama ve bu bilgileri daha ağır değerlendirme eğilimini tanımlamaktadır. Bu önyargı, bilimsel çevrelerde bile kimi zaman kendini göstermekte; araştırmacıları kendi hipotezlerini çürütmek yerine doğrulamaya yönlendirmektedir.

Çerçeveleme etkisi ise aynı bilginin farklı biçimlerde sunulmasının karar üzerinde anlamlı farklılıklara yol açtığını ifade etmektedir. Örneğin "%90 hayatta kalma oranı" ile "%10 ölüm oranı" istatistiksel açıdan özdeş iki ifadedir; ancak bu iki çerçeveye göre alınan kararlar belirgin şekilde farklılaşmaktadır.

Önyargıların yalnızca bireysel kararları değil, kurumsal yapıları ve sosyal politikaları da etkilediği bilinmektedir. Bu nedenle çağdaş davranışsal ekonomi ve kamu politikası alanları, insanları daha iyi kararlar almaya yönlendiren "dürtme" (nudge) tasarımlarını giderek daha etkin biçimde kullanmaktadır.',
  'felsefe', 'cok_zor', 420, 42,
  280, ARRAY['ayt', 'kpss']::exam_type[], ARRAY['lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Kahneman ve Tversky''nin araştırmalarının temel odak noktası nedir?", "options": ["Bilinçdışı rüyaların analizi", "Sezgisel ve mantıksal düşüncenin etkileşimi", "Hafıza güçlendirme teknikleri", "Sosyal öğrenme teorisi"], "correct": 1, "type": "main_idea", "explanation": "Metin bu araştırmacıların sezgisel ve mantıksal düşüncenin rekabetini incelediğini belirtmektedir."},
    {"question": "Çerçeveleme etkisini örnekleyen ifade hangisidir?", "options": ["%90 hayatta kalma ve %10 ölüm oranının farklı kararlara yol açması", "Doğrulama önyargısının araştırmacıları etkilemesi", "Dürtme tasarımlarının politikada kullanılması", "Bilişsel önyargıların kurumları etkilemesi"], "correct": 0, "type": "detail", "explanation": "Metin, bu iki özdeş ifadenin farklı kararlara yol açmasını çerçeveleme etkisine örnek olarak göstermektedir."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Fransız Devrimi''nin Mirası',
  'Fransız Devrimi, 1789''da patlak vererek yalnızca Fransa''yı değil; monarşi, kilise ve geleneksel toplumsal hiyerarşinin temel aldığı tüm Avrupa düzenini sarstı. Özgürlük, eşitlik ve kardeşlik sloganları, evrensel insan hakları söyleminin doğduğu tarihsel kırılma noktasına işaret etmektedir. Ancak devrimci süreç, ütopik ideallerle kanlı gerçeklikler arasındaki derin gerilimi de gün yüzüne çıkardı.

Terör Dönemi (1793-1794), Robespierre önderliğindeki Jakobenlerin siyasi muhaliflerini toplu infazlarla tasfiye ettiği bir aşamadır. Yaklaşık 17.000 kişi giyotin ve diğer yöntemlerle idam edilmiş; onlarca bin kişi hapishanelerde hayatını kaybetmiştir. Özgürlük adına işlenen bu vahşet, siyasi şiddetin meşruiyet sınırları üzerine yürütülen tartışmalarda hâlâ başvurulan temel örneklerden biridir.

Napoleon Bonaparte''ın yükselişi, devrimci ideallerin bir generalin pragmatik yönetim anlayışıyla nasıl dönüştürüldüğünü gözler önüne serer. Kod Napoleon olarak bilinen Medeni Kanun, dini referanslara değil akıl ve hukuki eşitlik ilkesine dayanan modern devletin yasal çerçevesini belirledi. Bu kanun, Latin Amerika''dan Japonya''ya kadar onlarca ülkenin hukuk sistemini kalıcı biçimde etkiledi.

Devrim''in zihniyet dönüşümü açısındaki mirası belki de en kalıcı olanıdır. Meşruiyetin tanrısal iradeye değil halk iradesine dayandığı fikri, milliyetçilik, liberalizm ve sosyalizm gibi modern siyasi akımların kurucu ilkesi haline geldi. 19. yüzyıl boyunca süren devrimler dalgası, bu fikrin Avrupa sınırlarını aşarak küresel bir dönüşümün fitilini ateşlediğinin kanıtıdır.',
  'tarih', 'cok_zor', 435, 41,
  285, ARRAY['ayt', 'kpss']::exam_type[], ARRAY['lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Terör Dönemi''nde yaklaşık kaç kişi idam edilmiştir?", "options": ["5.000", "10.000", "17.000", "50.000"], "correct": 2, "type": "detail", "explanation": "Metinde Terör Dönemi''nde yaklaşık 17.000 kişinin idam edildiği belirtilmektedir."},
    {"question": "Kod Napoleon''un önemi nedir?", "options": ["Fransa''nın askeri zaferlerini kodlaması", "Dini referanslar yerine akıl ve hukuki eşitliğe dayanan bir hukuk çerçevesi oluşturması", "Napoleon''un biyografisini içermesi", "Kilise ile devlet birliğini sağlaması"], "correct": 1, "type": "detail", "explanation": "Metin Kod Napoleon''u, akıl ve hukuki eşitliğe dayanan modern devletin yasal çerçevesi olarak tanımlamaktadır."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Karbon Döngüsü ve İklim Değişikliği',
  'Karbon, yaşamın temel yapı taşlarından birini oluşturmakta ve Dünya''nın enerji dengesinin düzenlenmesinde kritik bir rol üstlenmektedir. Atmosfer, biyosfer, hidrosfer ve litosfer arasında dolaşan karbon atomları, milyonlarca yıl boyunca dengeli bir döngü içinde kalmıştır. Fosil yakıtların yakılması, ormansızlaşma ve tarımsal faaliyetler bu dengeyi köklü biçimde bozmuştur.

Sanayi Devrimi''nden bu yana atmosferdeki karbondioksit konsantrasyonu yaklaşık %50 oranında artarak tarihsel ortalamalarını çok aşmıştır. Bu artışın sera etkisini güçlendirerek küresel sıcaklıkları yükselttiği, iklim modellerinin yanı sıra buz çekirdekleri ve sediman kayıtları gibi doğrudan paleoklimatik verilerle de kanıtlanmaktadır.

Okyanus asitlenmesi, karbon döngüsünün doğrudan bir sonucudur. Denizler, salınan karbondioksidin yaklaşık üçte birini absorbe etmekte; bu süreç pH düşüşüne yol açmaktadır. Mercan resifleri başta olmak üzere kabuklu deniz canlıları, artan asitlik nedeniyle iskelet yapılarını oluşturmakta güçlük çekmektedir.

Karbon tutma ve depolama teknolojileri ile yenilenebilir enerji kaynaklarına geçiş, döngünün yeniden dengelenmesi için önerilen başlıca çözümler arasındadır. Bununla birlikte, atmosferdeki karbon birikiminin kısmen geri döndürülemez etkileri, uyum stratejilerini de zorunlu kılmaktadır. Küresel iklim politikalarının uygulanma hızı, gelecek yüzyıldaki yaşam koşullarını doğrudan belirleyecektir.',
  'cevre', 'cok_zor', 525, 37,
  290, ARRAY['ayt', 'kpss']::exam_type[], ARRAY['lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Sanayi Devrimi''nden bu yana atmosferdeki CO₂ konsantrasyonu ne kadar artmıştır?", "options": ["%20", "%35", "%50", "%75"], "correct": 2, "type": "detail", "explanation": "Metinde bu artışın yaklaşık %50 olduğu belirtilmektedir."},
    {"question": "Okyanus asitlenmesinin temel nedeni nedir?", "options": ["Termal kirlilik", "Denizlerin karbondioksit absorbe etmesi", "Plastik atıklar", "Radyoaktif maddeler"], "correct": 1, "type": "detail", "explanation": "Metin, okyanus asitlenmesinin karbon döngüsünün ve denizlerin CO₂ absorbsiyonunun doğrudan sonucu olduğunu açıklamaktadır."},
    {"question": "Metne göre karbon birikiminin bazı etkilerinin ''kısmen geri döndürülemez'' olması ne anlama gelmektedir?", "options": ["Teknolojik çözümler tamamen yetersizdir", "Yalnızca sera gazı azaltımı değil uyum stratejileri de gereklidir", "İnsan müdahalesine gerek yoktur", "İklim modelleri güvenilmezdir"], "correct": 1, "type": "inference", "explanation": "Yazar bu ifadeyle azaltım stratejilerinin yanı sıra uyum planlarına da ihtiyaç duyulduğunu vurgulamaktadır."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Eğitimde Standart Test Tartışması',
  'Standardize testler, öğrenci başarısını ölçmenin en yaygın ve aynı zamanda en tartışmalı yöntemi olmaya devam etmektedir. Savunucular, bu testlerin karşılaştırılabilir ve nesnel ölçüm imkânı sunduğunu, hesap verebilirlik mekanizmalarını güçlendirdiğini ve yüksek beklentilerin tüm öğrencilere eşit biçimde uygulanmasını sağladığını öne sürmektedir.

Karşı görüşler ise daha geniş bir eleştiri cephesi oluşturmaktadır. Araştırmalar, sosyoekonomik açıdan dezavantajlı öğrencilerin bu testlerde sistematik olarak daha düşük puan aldığını ortaya koymaktadır. Bu durum, testin bilişsel kapasiteyi mi yoksa tesadüfi aile koşullarını mı ölçtüğü sorusunu gündeme taşımaktadır. Öte yandan "sınav için öğretme" olgusu, öğretmenlerin müfredatı test içeriğine indirgemesine neden olmakta; eleştirel düşünme, yaratıcılık ve işbirliği gibi 21. yüzyıl becerilerini ölçme dışı bırakmaktadır.

Bazı ülkeler, bu ikilemin üstesinden gelmek amacıyla portföy değerlendirmesi, proje tabanlı öğrenme ve performans görevi gibi alternatif ölçme araçlarını okul sistemlerine entegre etmektedir. Bu yaklaşımların standardize testlere kıyasla daha bütüncül bir değerlendirme sunduğu savunulsa da ölçeklendirme güçlükleri ve puanlama tutarsızlığı sorunları çözüme kavuşturulamamıştır.

Daha derin bir sorun, eğitimin amacına ilişkin felsefi görüş ayrılığında yatmaktadır. Eğitim, öncelikli olarak bireyi iş hayatına mı hazırlamalı, yoksa eleştirel bir yurttaşı mı yetiştirmelidir? Kimi zaman birbiriyle çelişen bu iki amaç, ölçme-değerlendirme politikasını şekillendiren ideolojik tercihleri de beraberinde getirmektedir. Karar vericiler bu konuda uzlaşmaya varamadığı sürece standardize testler hem biçimlendirici hem de tartışmalı olmaya devam edecektir.',
  'felsefe', 'cok_zor', 550, 35,
  300, ARRAY['ayt', 'kpss']::exam_type[], ARRAY['lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Standardize testlerin savunucularının temel argümanı nedir?", "options": ["Testler yaratıcılığı ölçer", "Testler nesnel ve karşılaştırılabilir ölçüm sağlar", "Testler sosyoekonomik eşitliği artırır", "Testler 21. yüzyıl becerilerini değerlendirir"], "correct": 1, "type": "detail", "explanation": "Metin savunucuların, testlerin nesnel ve karşılaştırılabilir ölçüm sunduğunu öne sürdüğünü belirtmektedir."},
    {"question": "''Sınav için öğretme'' olgusu ne anlama gelmektedir?", "options": ["Öğretmenlerin öğrencilere sınav taktikleri vermesi", "Öğretmenlerin müfredatı test içeriğine indirgemesi", "Öğrencilerin gönüllü olarak sınava hazırlanması", "Testlerin öğretmen değerlendirmesinde kullanılması"], "correct": 1, "type": "detail", "explanation": "Metin bu kavramı, öğretmenlerin müfredatı test içeriğine indirgemesi şeklinde tanımlamaktadır."}
  ]'::jsonb
);

INSERT INTO content_library (
  title, body, category, difficulty, word_count, flesch_score,
  estimated_wpm_target, exam_types, grade_levels, source_type, questions
) VALUES (
  'Yapay Zekanın Etik Boyutları',
  'Yapay zekâ sistemleri, insan karar verme süreçlerini giderek daha fazla desteklemekte ve kimi zaman bu süreçlerin yerini almaktadır. İşe alım algoritmalarından tıbbi tanı sistemlerine, yargı karar destek araçlarından kredi derecelendirme modellerine uzanan bu yelpaze, büyük verimlilik kazanımları sunarken beraberinde derin etik sorunlar da getirmektedir.

Algoritmik önyargı sorunu, mevcut sosyal eşitsizliklerin dijital sistemlere nasıl aktarılabileceğini açıkça göstermektedir. Geçmiş verilere dayalı olarak eğitilen modeller, tarihsel ayrımcılığın izlerini taşıyan kalıpları yeniden üretme ve ölçeklendirme riski taşımaktadır. Makine öğrenmesinin şeffaflık eksikliği ise "kara kutu" kararlarına itiraz etmeyi son derece güçleştirmektedir; bu durum, hukuki hesap verebilirlik açısından ciddi bir boşluk yaratmaktadır.

Özerklik ve insan onuru eksenindeki tartışmalar farklı bir boyut açmaktadır. Kararların algoritmalara devredilmesi, bireyin öz kaderini belirleme hakkını ne ölçüde kısıtlamaktadır? Tıbbi bağlamda bir YZ sisteminin önerisi, hekim ile hasta arasındaki güven ilişkisini ve yasal sorumluluk zincirini nasıl dönüştürmektedir?

Bunların yanı sıra, otomasyonun istihdam üzerindeki etkileri ile bu sürecin yaratacağı eşitsizliklere yönelik sosyal politika eksikliği, teknoloji düzenlemesinin hükümetler için giderek acilleşen bir öncelik haline gelmesine yol açmaktadır. Bazı düşünürler, YZ''nin getireceği refahın evrensel temel gelir gibi mekanizmalar aracılığıyla toplumun tamamına yayılması gerektiğini savunmaktadır.

Etik YZ tasarımı, teknik uzmanlığın sınırlarını aşmaktadır. Felsefeciler, hukukçular, sosyal bilimciler ve etkilenen topluluklar bu süreçlerin şekillendirilmesinde etkin bir rol oynamalıdır. Aksi hâlde teknoloji, zenginler ve yoksullar arasındaki uçurumu derinleştiren yeni bir eşitsizlik vektörüne dönüşme riskini barındırmaktadır.',
  'teknoloji', 'cok_zor', 650, 31,
  310, ARRAY['ayt', 'kpss']::exam_type[], ARRAY['lise_11', 'lise_12']::grade_level[],
  'original',
  '[
    {"question": "Algoritmik önyargı sorununda temel endişe nedir?", "options": ["Algoritmaların yavaş çalışması", "Geçmiş verilerdeki ayrımcılığın yeniden üretilmesi", "YZ sistemlerinin maliyeti", "Veri gizliliğinin ihlali"], "correct": 1, "type": "main_idea", "explanation": "Metin, geçmiş verilere dayalı modellerin tarihsel ayrımcılık kalıplarını ölçeklendirme riskini temel sorun olarak göstermektedir."},
    {"question": "''Kara kutu'' metaforunu kullanmadaki amaç nedir?", "options": ["Teknik terminoloji açıklamak", "Algoritma kararlarına itiraz etmenin güçlüğünü vurgulamak", "Yapay zekânın tehlikeli olduğunu kanıtlamak", "Hâkim kararlarını eleştirmek"], "correct": 1, "type": "inference", "explanation": "Yazar bu metaforu, algoritmik kararların şeffaflık eksikliğini ve hesap verebilirlik boşluğunu ifade etmek için kullanmaktadır."},
    {"question": "Metne göre etik YZ tasarımında hangi kesimler yer almalıdır?", "options": ["Yalnızca mühendisler ve programcılar", "Hükümetler ve teknoloji şirketleri", "Felsefeciler, hukukçular, sosyal bilimciler ve etkilenen topluluklar", "Akademisyenler ve yapay zekâ araştırmacıları"], "correct": 2, "type": "detail", "explanation": "Metin açıkça felsefeciler, hukukçular, sosyal bilimciler ve etkilenen toplulukların bu sürece dahil edilmesi gerektiğini belirtmektedir."}
  ]'::jsonb
);
