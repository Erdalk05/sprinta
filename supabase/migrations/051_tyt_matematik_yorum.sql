-- Migration 051: TYT Matematik Yorumlama (8 metin × 5 soru = 40 soru)
DO $migration$
BEGIN

  IF (SELECT COUNT(*) FROM text_library WHERE category = 'TYT Matematik') > 0 THEN
    RAISE NOTICE '051: TYT Matematik icerikleri zaten mevcut, atlaniyor.';
    RETURN;
  END IF;

-- ══ METİN 1: İstatistiksel Veri Yorumlama ════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e2000001-0000-4000-e200-000000000001',
  'İstatistiksel Veri Yorumlama: Ortalama, Medyan ve Mod',
  'TYT Matematik',
  'TYT', 2, 432, 3,
  $b$
İstatistik, sayısal verileri toplama, düzenleme, analiz etme ve yorumlama bilimidir. Günlük hayatta hava durumu tahminlerinden spor istatistiklerine, sınav sonuçlarından ekonomik verilere kadar pek çok alanda istatistikten yararlanılır. TYT sınavında istatistik konusu; ortalama, medyan, mod ve çeyrekler gibi merkezi eğilim ölçüleri üzerinden sınanır.

Aritmetik ortalama, bir veri setindeki tüm değerlerin toplamının veri sayısına bölünmesiyle elde edilir. Örneğin bir sınıftaki 5 öğrencinin notları 60, 70, 75, 80 ve 90 ise ortalama (60+70+75+80+90)/5 = 75 olarak hesaplanır. Ortalama, veri setindeki aşırı değerlerden etkilendiği için her zaman en iyi merkez ölçüsü olmayabilir. Aşırı büyük ya da küçük bir değer ortalamanın yanıltıcı bir tablo çizmesine neden olabilir.

Medyan, bir veri seti küçükten büyüğe sıralandığında tam ortada kalan değerdir. Tek sayıda veri varsa ortadaki eleman, çift sayıda veri varsa ortadaki iki elemanın aritmetik ortalaması medyanı verir. Yukarıdaki örnekte beş değer zaten sıralı olduğundan medyan 75''tir. Medyan, uç değerlerden etkilenmediğinden gelir dağılımı gibi çarpık verilerde ortalamadan daha güvenilir bir merkez ölçüsüdür.

Mod (tepe değer), bir veri setinde en çok tekrar eden değerdir. Eğer hiçbir değer tekrar etmiyorsa mod yoktur; birden fazla değer eşit sıklıkta tekrar ediyorsa birden fazla mod bulunabilir. Mod, özellikle kategorik verilerle çalışırken kullanışlıdır; en çok satılan ürün rengi ya da en sık tercih edilen boyut gibi sorulara yanıt verir.

Çeyrekler ise sıralı veri setini dört eşit parçaya bölen değerlerdir. Birinci çeyrek (Q1) verinin alt yüzde yirmi beşini, ikinci çeyrek (Q2) medyanı, üçüncü çeyrek (Q3) ise üst yüzde yirmi beşini temsil eder. Çeyrekler arası açıklık, Q3 ile Q1 arasındaki fark olup verinin dağılımını göstermesi bakımından önemli bir ölçüdür.

Standart sapma ise her bir verinin aritmetik ortalamadan ne kadar uzaklaştığını gösterir. Düşük standart sapma, verilerin ortalama etrafında yoğunlaştığını; yüksek standart sapma ise verilerin geniş bir aralığa yayıldığını ifade eder. TYT sorularında standart sapmanın hesaplanması değil, kavramsal olarak yorumlanması beklenir. Bir veriye yeni bir eleman eklendiğinde ortalama, medyan ve modun nasıl değişeceğini hızla analiz etmek sınavda önemli bir avantaj sağlar.
  $b$,
  ARRAY['istatistik','ortalama','medyan','mod','çeyrekler','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e2000001-0000-4000-e200-000000000001','main_idea','Bu metnin ana konusu nedir?','["Geometri formülleri","Merkezi eğilim ölçüleri ve istatistiksel veri yorumlama","Olasılık hesaplamaları","Denklem çözme yöntemleri"]'::jsonb,1,'Metin ortalama, medyan, mod ve çeyrekler gibi merkezi eğilim ölçülerini ve bunların yorumlanmasını kapsamlı biçimde ele alır.',2,1),
('e2000001-0000-4000-e200-000000000001','detail','Bir veri setinde en çok tekrar eden değere ne ad verilir?','["Ortalama","Medyan","Mod","Standart sapma"]'::jsonb,2,'Metin modu "bir veri setinde en çok tekrar eden değer" olarak tanımlar.',1,2),
('e2000001-0000-4000-e200-000000000001','detail','5 öğrencinin notları 60, 70, 75, 80 ve 90 ise medyan kaçtır?','["70","72","75","80"]'::jsonb,2,'Sıralı 5 değerin ortancası (3. eleman) 75''tir.',1,3),
('e2000001-0000-4000-e200-000000000001','vocabulary','Çeyrekler arası açıklık nasıl hesaplanır?','["Q2 − Q1","Q3 − Q2","Q3 − Q1","En büyük − en küçük değer"]'::jsonb,2,'Metin çeyrekler arası açıklığı "Q3 ile Q1 arasındaki fark" olarak tanımlar.',2,4),
('e2000001-0000-4000-e200-000000000001','inference','Metne göre standart sapmanın TYT sınavındaki önemi nedir?','["Formülle hesaplanması beklenir","Sınavda hiç sorulmaz","Yalnızca kavramsal olarak yorumlanması beklenir","Yalnızca mod hesabında kullanılır"]'::jsonb,2,'Metin "TYT sorularında standart sapmanın hesaplanması değil, kavramsal olarak yorumlanması beklenir" der.',2,5);

-- ══ METİN 2: Grafik ve Tablo Analizi ════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e2000002-0000-4000-e200-000000000002',
  'Grafik ve Tablo Analizi: Verileri Görselleştirme',
  'TYT Matematik',
  'TYT', 2, 435, 3,
  $b$
Matematiksel verileri anlamlandırmanın en etkili yollarından biri onları görselleştirmektir. Grafikler ve tablolar, sayıların ardındaki örüntüleri, eğilimleri ve karşılaştırmaları göz önüne serer. TYT sınavında grafik ve tablo okuma soruları, öğrencilerin görsel veriyi sayısal ifadeye ya da sözlü yoruma dönüştürebildiğini ölçer.

Çizgi grafikleri, zaman içerisindeki değişimi göstermek için idealdir. Yatay eksende zaman, dikey eksende ölçülen değer yer alır. Eğrinin yükseldiği kesimler artışı, alçaldığı kesimler azalışı, yatay gittiği kesimler ise sabitliği ifade eder. Bir şirketin aylık satış rakamları ya da bir kentin yıllık ortalama sıcaklıkları çizgi grafiğiyle kolayca aktarılabilir.

Sütun grafikler, kategoriler arasındaki karşılaştırmayı ön plana çıkarır. Her sütunun yüksekliği ilgili kategorinin değerini temsil eder. Yan yana konulan sütunlarla iki farklı yılın ya da iki farklı grubun aynı kategorilerdeki değerleri kıyaslanabilir. Yığılmış sütun grafikler ise hem toplamı hem de toplamın bileşenlerini aynı anda gösterir.

Pasta grafikleri, bir bütünün parçalara bölünmüş oranını göstermek amacıyla kullanılır. Her dilimin açısı ya da yüzdesi ilgili kategorinin toplam içindeki payına karşılık gelir. Bütün dilimler toplandığında her zaman 360 derece ya da yüzde yüz elde edilir. Pasta grafiği, en büyük ya da en küçük dilimi hızla belirlemek için elverişlidir; ancak birbirine yakın değerleri karşılaştırmakta yetersiz kalabilir.

Tablolar ise birden fazla değişkeni satır ve sütunlara yerleştirerek sistematik biçimde sunar. Frekans tabloları verilerin kaç kez tekrar ettiğini gösterirken, çapraz tablolar iki değişkenin birlikte nasıl dağıldığını ortaya koyar.

Grafik yorumlama sorularında sık yapılan hatalardan biri ölçek yanılgısıdır. Dikey eksenin sıfırdan başlamadığı durumlarda değişimin abartılmış göründüğüne dikkat edilmelidir. Veri okuryazarlığı, iki grafik arasındaki ilişkileri çıkarmayı ve verinin hangi bilgileri vermediğini fark etmeyi de kapsar. Eksenleri, lejandı ve başlığı önce taramak büyük kolaylık sağlar.
  $b$,
  ARRAY['grafik','tablo','çizgi grafik','sütun grafik','pasta grafik','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e2000002-0000-4000-e200-000000000002','main_idea','Bu metnin ana fikri nedir?','["İstatistik yalnızca tablolarla ifade edilebilir","Grafik ve tablolar veriyi görselleştirerek yorumlamayı kolaylaştırır","Pasta grafik her veri türü için en iyi seçimdir","Çizgi grafikler kategorik karşılaştırmada en etkili araçtır"]'::jsonb,1,'Metin grafik ve tabloların veriyi görselleştirerek yorumlamayı kolaylaştırdığını tüm boyutlarıyla anlatır.',2,1),
('e2000002-0000-4000-e200-000000000002','detail','Metne göre zaman içindeki değişimi göstermek için hangi grafik türü en uygundur?','["Pasta grafik","Sütun grafik","Çizgi grafik","Çapraz tablo"]'::jsonb,2,'Metin "çizgi grafikleri, zaman içerisindeki değişimi göstermek için idealdir" der.',1,2),
('e2000002-0000-4000-e200-000000000002','detail','Pasta grafiğindeki tüm dilimlerin açıları toplandığında kaç derece eder?','["180","270","360","400"]'::jsonb,2,'Tam çemberin açısı 360 derecedir; pasta grafiği bir bütünü temsil ettiğinden dilimler toplamı 360° olur.',1,3),
('e2000002-0000-4000-e200-000000000002','vocabulary','Yığılmış sütun grafiğin sütun grafikten farkı nedir?','["Yalnızca kategorileri karşılaştırır","Hem toplamı hem de toplamın bileşenlerini gösterir","Yalnızca zaman serilerinde kullanılır","Pasta grafikle aynı işlevi görür"]'::jsonb,1,'Metin yığılmış sütun grafiklerin "hem toplamı hem de toplamın bileşenlerini aynı anda gösterdiğini" belirtir.',2,4),
('e2000002-0000-4000-e200-000000000002','inference','Grafik yorumlamada ölçek yanılgısı neden tehlikelidir?','["Grafik çizimi yanlış yapılır","Dikey eksen sıfırdan başlamadığında değişim abartılmış görünebilir","Yatay eksen her zaman yanlış okunur","Pasta grafiklerde dilimler eşit görünür"]'::jsonb,1,'Metin dikey eksenin sıfırdan başlamadığı durumlarda değişimin abartılmış görünebileceğini uyarır.',2,5);

-- ══ METİN 3: Mantık ve Çıkarım ═══════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e2000003-0000-4000-e200-000000000003',
  'Mantık ve Çıkarım: Önermeler ve Doğruluk Tabloları',
  'TYT Matematik',
  'TYT', 2, 430, 3,
  $b$
Matematiksel mantık, doğru veya yanlış olarak değerlendirilebilen ifadelerle akıl yürütme kurallarını inceler. Bu alanda temel birim önermedir. Bir önerme, doğruluğu ya da yanlışlığı kesin olarak belirlenebilen bir yargı cümlesidir. "İstanbul Türkiye''nin en kalabalık şehridir" bir önermedir; "Pencereyi kapar mısın?" ise bir önerme değildir, zira soru cümlesi doğruluk değeri taşımaz.

Önermeler birleştirilerek bileşik önermeler oluşturulur. "Ve" bağlacı ile oluşturulan konjunksiyon, iki önermenin aynı anda doğru olduğu durumlarda doğrudur; herhangi biri yanlış ise tüm ifade yanlış olur. "Veya" bağlacı ile oluşturulan ayrılım ise her iki önerme de yanlış olmadıkça doğru kabul edilir. Günlük dilde "ya da" ifadesi bazen dışlayan anlamda kullanılsa da matematikte standart "veya" kapsayıcıdır.

Koşul önermesi, "Eğer P ise Q" biçimindedir. Bu önerme yalnızca P doğru, Q yanlış olduğunda yanlıştır; diğer üç durumda doğrudur. Öğrenciler çoğunlukla P yanlışken koşulun neden doğru kabul edildiğini sorgular. Mantıksal olarak yanlış bir hipotezden her sonuç türetilebilir; bu nedenle P yanlışsa koşul önermenin doğruluğu hakkında bir iddiada bulunulmamaktadır.

İki yönlü koşul, "P ancak ve ancak Q ise" biçimindedir. Bu önerme hem P ve Q aynı anda doğru, hem de aynı anda yanlış olduğunda doğrudur; değerleri farklıysa yanlış olur. İki yönlü koşul, matematikte "gerek ve yeter koşul" kavramıyla doğrudan ilişkilidir.

Doğruluk tablosu, bir bileşik önermenin olası tüm değer kombinasyonları için sonucunu sistematik biçimde gösteren araçtır. İki değişkenli bir bileşik önerme için dört satırlı, üç değişkenli için sekiz satırlı bir tablo gerekir.

Çıkarım kuralları arasında en sık kullanılan modus ponens''tir: "P doğru ise Q doğrudur; P doğrudur; öyleyse Q doğrudur." Modus tollens ise "P doğru ise Q doğrudur; Q yanlıştır; öyleyse P yanlıştır" biçimindedir. TYT sorularında bu kurallar açıkça adlandırılmaz; ancak mantık zincirini takip ederek doğru sonuca ulaşmak gerekir.
  $b$,
  ARRAY['mantık','önerme','doğruluk tablosu','koşul','çıkarım','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e2000003-0000-4000-e200-000000000003','main_idea','Bu metnin ana konusu nedir?','["Olasılık ve sayma","Matematiksel mantık, önermeler ve çıkarım kuralları","Fonksiyonlar ve grafikler","Sayı teorisi"]'::jsonb,1,'Metin matematiksel mantık, önerme türleri, doğruluk tabloları ve çıkarım kurallarını kapsamlı ele alır.',2,1),
('e2000003-0000-4000-e200-000000000003','detail','"Ve" bağlacı ile oluşturulan konjunksiyon ne zaman doğrudur?','["En az bir önerme doğru olduğunda","Her iki önerme de doğru olduğunda","Her iki önerme de yanlış olduğunda","İlk önerme doğru olduğunda"]'::jsonb,1,'Metin konjunksiyonun "iki önermenin aynı anda doğru olduğu durumlarda doğru" olduğunu belirtir.',2,2),
('e2000003-0000-4000-e200-000000000003','detail','Koşul önermesi "Eğer P ise Q" hangi durumda YANLIŞ olur?','["P yanlış, Q doğru olduğunda","P doğru, Q doğru olduğunda","P yanlış, Q yanlış olduğunda","P doğru, Q yanlış olduğunda"]'::jsonb,3,'Metin koşul önermesinin "yalnızca P doğru, Q yanlış olduğunda yanlış" olduğunu açıklar.',2,3),
('e2000003-0000-4000-e200-000000000003','vocabulary','İki yönlü koşul ne zaman doğrudur?','["Yalnızca P doğru olduğunda","Yalnızca Q yanlış olduğunda","P ve Q aynı doğruluk değerine sahip olduğunda","P ve Q farklı doğruluk değerlerine sahip olduğunda"]'::jsonb,2,'İki yönlü koşul hem P-Q ikisi doğru hem de ikisi yanlış olduğunda doğrudur.',2,4),
('e2000003-0000-4000-e200-000000000003','inference','Üç değişkenli bir bileşik önermenin doğruluk tablosu kaç satırdan oluşur?','["Dört","Altı","Sekiz","On altı"]'::jsonb,2,'Metin "üç değişkenli için sekiz satırlı tablo gerekir" der (2³ = 8).',2,5);

-- ══ METİN 4: Olasılık ve Kombinatorik ══════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e2000004-0000-4000-e200-000000000004',
  'Olasılık ve Kombinatorik: Permütasyon ve Kombinasyon',
  'TYT Matematik',
  'TYT', 3, 435, 3,
  $b$
Olasılık, belirsizliği sayısal olarak ölçen matematik dalıdır. Bir olayın olasılığı; o olayın gerçekleşme sayısının tüm olası sonuçların sayısına oranıyla hesaplanır. Örneğin adil bir zarda 3 gelme olasılığı 1/6''dır çünkü altı eşit olası çıktıdan yalnızca biri 3''tür. Olasılık değeri her zaman 0 ile 1 arasında kalır; 0 imkânsız, 1 ise kesin bir olayı temsil eder.

Olasılık hesaplarının temelinde sayma ilkesi yatar. Bir olayın birden fazla aşaması varsa her aşamadaki seçenek sayıları çarpılarak toplam sonuç sayısına ulaşılır. Bu çarpma ilkesi sayesinde çok aşamalı deneylerin örnek uzayı hızla belirlenir. İki zar atıldığında toplam 6 × 6 = 36 farklı sonuç elde edilmesi bu ilkenin basit bir uygulamasıdır.

Permütasyon, belirli sayıda nesnenin sıraya dizilmesi durumunu inceler. n farklı nesneden r tanesini sıralı biçimde seçmenin yolu P(n,r) = n!/(n−r)! formülüyle hesaplanır. Sıranın önemli olduğu tüm seçimlerde permütasyon kullanılır: bir yarışmada birinci, ikinci ve üçüncünün kaç farklı şekilde belirlenebileceği gibi.

Kombinasyon ise sıranın önem taşımadığı seçimleri inceler. C(n,r) = n!/[r!(n−r)!] formülüyle bulunur. Bir komisyona 10 aday arasından 3 üye seçilecekse komisyondaki üyelerin dizilimi önem taşımadığından kombinasyon kullanılır. Permütasyon ile kombinasyon arasındaki temel fark tam da sıranın önemli olup olmadığıdır.

Olasılıkta birbirini dışlayan (ayrık) olaylar için toplama kuralı uygulanır: P(A veya B) = P(A) + P(B). Olaylar birbirini dışlamıyorsa P(A veya B) = P(A) + P(B) − P(A ve B) formülü kullanılmalıdır. Bağımsız olaylar için çarpma kuralı geçerlidir: P(A ve B) = P(A) × P(B). Olaylar bağımsız değilse koşullu olasılık devreye girer: P(B|A), yani A olayı gerçekleşmişken B olayının olasılığı.

Olasılık sorularını çözerken önce örnek uzayını belirlemek, ardından istenen olayı tanımlamak ve uygun formülü seçmek standart yaklaşımdır. Sıralamanın önemli olup olmadığını doğru tespit etmek, permütasyon-kombinasyon seçiminde belirleyici role sahiptir.
  $b$,
  ARRAY['olasılık','permütasyon','kombinasyon','sayma','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e2000004-0000-4000-e200-000000000004','main_idea','Bu metnin ana konusu nedir?','["Geometri formülleri","Olasılık, permütasyon ve kombinasyon","İstatistiksel grafikler","Sayı dizileri"]'::jsonb,1,'Metin olasılık kavramı, sayma ilkeleri, permütasyon ve kombinasyon konularını ele alır.',2,1),
('e2000004-0000-4000-e200-000000000004','detail','Metne göre bir olayın olasılığı nasıl hesaplanır?','["Gerçekleşmeme sayısının toplam sonuçlara oranı","Gerçekleşme sayısının tüm olası sonuçların sayısına oranı","Toplam sonuçların gerçekleşme sayısına oranı","Gerçekleşme ve gerçekleşmeme sayılarının toplamı"]'::jsonb,1,'Metin olasılığı "o olayın gerçekleşme sayısının tüm olası sonuçların sayısına oranı" olarak tanımlar.',2,2),
('e2000004-0000-4000-e200-000000000004','detail','Permütasyon ile kombinasyon arasındaki temel fark nedir?','["Permütasyonda nesneler tekrarlanabilir","Permütasyonda sıralama önemli, kombinasyonda önemli değildir","Kombinasyonda nesneler sıralı seçilir","Permütasyon yalnızca ikili seçimlerde kullanılır"]'::jsonb,1,'Metin "permütasyon ile kombinasyon arasındaki temel fark tam da sıranın önemli olup olmadığıdır" der.',2,3),
('e2000004-0000-4000-e200-000000000004','vocabulary','Birbirini dışlamayan A ve B olayları için P(A veya B) formülü nedir?','["P(A) + P(B)","P(A) × P(B)","P(A) + P(B) − P(A ve B)","P(A) − P(B)"]'::jsonb,2,'Metin birbirini dışlamayan olaylar için P(A veya B) = P(A) + P(B) − P(A ve B) formülünü verir.',2,4),
('e2000004-0000-4000-e200-000000000004','inference','Bir komisyona 10 aday arasından 3 üye seçilmesinde hangi yöntem kullanılır ve neden?','["Permütasyon — sıra önemlidir","Kombinasyon — üyelerin dizilimi önemli değildir","Çarpma ilkesi — çok aşamalı bir denemedir","Binom olasılığı — bağımsız olaylar söz konusudur"]'::jsonb,1,'Metin "komisyondaki üyelerin dizilimi önem taşımadığından kombinasyon kullanılır" der.',3,5);

-- ══ METİN 5: Geometri Yorumlama ════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e2000005-0000-4000-e200-000000000005',
  'Geometri Yorumlama: Alan, Çevre ve Hacim Formülleri',
  'TYT Matematik',
  'TYT', 2, 430, 3,
  $b$
Geometri, şekilleri, boyutları ve konumları inceleyen matematik dalıdır. TYT sınavında geometri soruları; alan, çevre ve hacim formüllerini tanımak, doğru şekilde uygulamak ve gerçek yaşam bağlamında yorumlamayı gerektirir. Temel formülleri ezberlermenin ötesinde, bir problemde hangi formülün kullanılacağını belirleyebilmek kritik önem taşır.

Düzlemsel şekillerin alanı incelendiğinde dikdörtgenin alanı kenar uzunluklarının çarpımıyla, karenin alanı ise bir kenarın karesiyle bulunur. Üçgenin alanı tabanın yükseklikle çarpımının yarısıdır. Bu formül, üçgenin türüne bakılmaksızın geçerlidir; dik, geniş açılı ya da dar açılı her üçgen için kullanılabilir. Paralelkenarın alanı tabana indirilen yükseklikle tabanın çarpımına eşittir.

Çember geometrisinde alan ve çevre formülleri pi sayısını (yaklaşık 3,14) içerir. Bir çemberin çevresi 2πr, alanı ise πr² formülüyle bulunur. Dairesel bir bölgenin yalnızca bir kısmını kapsayan dilimin alanı, merkez açısının 360''a oranıyla tam daire alanı çarpılarak hesaplanır.

Üç boyutlu cisimlere geçildiğinde hacim kavramı devreye girer. Dikdörtgenler prizmasının hacmi uzunluk, genişlik ve yüksekliğin çarpımıyla; yüzey alanı ise altı dikdörtgen yüzün alanları toplamıyla hesaplanır. Silindirin hacmi taban dairesinin alanıyla yüksekliğin çarpımına eşitken, kürenin hacmi (4/3)πr³ formülüyle bulunur. Koninin hacmi ise aynı taban ve yüksekliğe sahip silindirin üçte biri kadardır.

Benzer şekiller, aynı biçime fakat farklı boyutlara sahip şekillerdir. İki benzer şeklin kenar oranları k ise alanlar k² oranında, hacimler ise k³ oranında değişir. Bu oran özelliği ölçekleme problemlerinde sıkça kullanılır.

Koordinat geometrisinde iki nokta arasındaki mesafe, koordinatlar arasındaki farkların karelerinin toplamının karekökü ile bulunur. Bir doğrunun eğimi, dikey değişimin yatay değişime oranıdır. Geometri sorularında şekli doğru çizmek, verileri şekle aktarmak ve hangi büyüklüklerin bilindiğini listelemek hataları en aza indirir.
  $b$,
  ARRAY['geometri','alan','çevre','hacim','koordinat','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e2000005-0000-4000-e200-000000000005','main_idea','Metne göre TYT geometri sorularında temel formülleri ezberlemenin ötesinde ne yapılması gerekir?','["Tüm geometrik şekilleri çizmek","Hangi formülün kullanılacağını belirleyebilmek","Yalnızca alan formüllerini bilmek","Koordinat geometrisini ihmal etmek"]'::jsonb,1,'Metin "temel formülleri ezberlermenin ötesinde, hangi formülün kullanılacağını belirleyebilmek kritik önem taşır" der.',2,1),
('e2000005-0000-4000-e200-000000000005','detail','Üçgenin alan formülü aşağıdakilerden hangisidir?','["Taban × Yükseklik","Taban + Yükseklik","(Taban × Yükseklik) / 2","(Taban + Yükseklik) / 2"]'::jsonb,2,'Metin "üçgenin alanı tabanın yükseklikle çarpımının yarısıdır" formülünü verir.',1,2),
('e2000005-0000-4000-e200-000000000005','detail','Koninin hacmi aynı taban ve yüksekliğe sahip silindirin hacmiyle nasıl ilişkilidir?','["Koninin hacmi silindirin iki katıdır","Koninin hacmi silindirin yarısıdır","Koninin hacmi silindirin üçte biridir","Koninin hacmi silindirin dörtte biridir"]'::jsonb,2,'Metin "koninin hacmi aynı taban ve yüksekliğe sahip silindirin üçte biri kadardır" der.',2,3),
('e2000005-0000-4000-e200-000000000005','vocabulary','İki benzer şeklin kenar oranı k ise hacim oranı nedir?','["k","k²","k³","k⁴"]'::jsonb,2,'Metin "hacimler k³ oranında değişir" der.',3,4),
('e2000005-0000-4000-e200-000000000005','inference','Bir çemberin çevre formülü nedir?','["πr²","2πr","πr","4πr"]'::jsonb,1,'Çember çevresi = 2πr formülüdür; πr² çemberin alanıdır.',1,5);

-- ══ METİN 6: Sayı Teorisi ════════════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e2000006-0000-4000-e200-000000000006',
  'Sayı Teorisi: Asal Sayılar, Bölünebilme ve OBEB/OKEK',
  'TYT Matematik',
  'TYT', 2, 432, 3,
  $b$
Sayı teorisi, tam sayıların özelliklerini ve aralarındaki ilişkileri inceleyen matematiğin en köklü alanlarından biridir. TYT sınavında sayı teorisi; asal sayılar, bölünebilme kuralları ve OBEB-OKEK (ortak bölen ve kat kavramları) başlıkları altında sınanır.

Asal sayılar, yalnızca 1 ve kendisine bölünebilen 1''den büyük doğal sayılardır. 2, 3, 5, 7, 11, 13 ve 17 ilk asal sayılardır. 2, çift olan tek asal sayıdır; diğer tüm asal sayılar tektir. Bir sayının asal olup olmadığını test etmek için o sayının kareköküne kadar olan asal sayılara bölünüp bölünmediğine bakılır; hiçbirine bölünmüyorsa asal sayıdır.

Bölünebilme kuralları, bir sayının belirli bir asal sayıya bölünüp bölünmediğini kalan hesabı yapmadan belirlememizi sağlar. Bir sayı 2''ye bölünüyorsa son rakam çift; 3''e bölünüyorsa rakamların toplamı 3''ün katı; 5''e bölünüyorsa son rakam 0 ya da 5''tir. 4''e bölünme kuralı için son iki rakamdan oluşan sayının 4''e bölünebilir olması gerekir. 9''a bölünme kuralı 3 ile aynı mantıkla işler: rakamlar toplamı 9''un katı olmalıdır. Bu kısayollar büyük sayılarla çalışırken hesap hızını önemli ölçüde artırır.

Asal çarpanlara ayırma, bir sayıyı asal sayıların çarpımı olarak ifade etmektir. Örneğin 360 = 2³ × 3² × 5 olarak çarpanlara ayrılır. Asal çarpanlara ayırma hem OBEB hem de OKEK hesaplarının temelidir.

Ortak bölenlerin en büyüğü (OBEB), iki ya da daha fazla sayının ortak bölenlerinin en büyüğüdür. OBEB bulmak için sayıları asal çarpanlarına ayırıp ortak asal çarpanları en küçük kuvvetleriyle çarpmak yeterlidir. Ortak katların en küçüğü (OKEK) ise sayıların asal çarpanlarını en büyük kuvvetleriyle çarparak bulunur. İki sayının çarpımı, OBEB ile OKEK''lerinin çarpımına eşittir. Sayı teorisi soruları genellikle bölme algoritması, kalan teoremleri ve bilinmeyenli bölünebilme problemlerini içerir.
  $b$,
  ARRAY['sayı teorisi','asal sayı','bölünebilme','OBEB','OKEK','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e2000006-0000-4000-e200-000000000006','main_idea','Bu metnin konusu nedir?','["Geometri ve hacim","Sayı teorisi: asal sayılar, bölünebilme ve OBEB/OKEK","Olasılık ve kombinasyon","Fonksiyon ve grafik"]'::jsonb,1,'Metin asal sayılar, bölünebilme kuralları ve OBEB/OKEK kavramlarını kapsamlı biçimde ele alır.',2,1),
('e2000006-0000-4000-e200-000000000006','detail','Bir sayının 9''a bölünebilmesi için hangi koşul sağlanmalıdır?','["Son rakam 9 olmalıdır","Son iki rakam 9''un katı olmalıdır","Rakamlar toplamı 9''un katı olmalıdır","Çift sayı olmalıdır"]'::jsonb,2,'Metin 9''a bölünme kuralını "rakamlar toplamı 9''un katı olmalıdır" şeklinde verir.',1,2),
('e2000006-0000-4000-e200-000000000006','detail','OBEB ve OKEK arasındaki ilişki nedir?','["OBEB + OKEK = iki sayının toplamı","İki sayının çarpımı = OBEB × OKEK","OBEB = OKEK / 2","OKEK her zaman OBEB''in karesidir"]'::jsonb,1,'Metin "iki sayının çarpımı, OBEB ile OKEK''lerinin çarpımına eşittir" der.',2,3),
('e2000006-0000-4000-e200-000000000006','vocabulary','Metne göre OKEK nasıl hesaplanır?','["Ortak asal çarpanlar en küçük kuvvetleriyle çarpılır","Asal çarpanlar en büyük kuvvetleriyle çarpılır","Sayılar doğrudan çarpılır","OBEB değerinin karekökü alınır"]'::jsonb,1,'Metin "OKEK için sayıların asal çarpanlarını en büyük kuvvetleriyle çarp" der.',2,4),
('e2000006-0000-4000-e200-000000000006','inference','Asal sayıların karekök testi neden yeterlidir?','["Büyük asal sayılar nadir görünür","Karekökten büyük herhangi bir asal bölen olsaydı daha küçük bir eşi de olurdu","Tüm asal sayılar karekoke eşittir","Karekökten büyük sayılar asal olamaz"]'::jsonb,1,'Karekökten büyük bir böleni olan sayının karekökten küçük bir böleni de vardır; bu nedenle karekoke kadar test yeterlidir.',3,5);

-- ══ METİN 7: Fonksiyon ve Grafik ═══════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e2000007-0000-4000-e200-000000000007',
  'Fonksiyon ve Grafik: Doğrusal Fonksiyon ve Parabol',
  'TYT Matematik',
  'TYT', 3, 433, 3,
  $b$
Fonksiyon, bir kümedeki her elemanı başka bir kümedeki tam olarak bir elemanla eşleştiren matematiksel kuraldır. Günlük hayatta fonksiyonların sayısız örneğiyle karşılaşılır: bir ürünün fiyatı miktara bağlıdır, bir borcun faizi zamana bağlıdır, bir aracın kat ettiği yol hıza bağlıdır. TYT sınavında fonksiyon soruları doğrusal fonksiyonlar, paraboller ve grafik okuma üzerine yoğunlaşır.

Doğrusal fonksiyon, f(x) = mx + b biçiminde yazılır; burada m eğimi, b ise y eksenini kesim noktasını verir. Grafik üzerinde düz bir doğru çizer. Eğim m > 0 ise doğru soldan sağa yükselir, m < 0 ise alçalır, m = 0 ise yatay bir doğru elde edilir. İki noktanın koordinatları bilindiğinde eğim dikey farkın yatay farka oranı olarak hesaplanır. Paralel doğruların eğimleri birbirine eşit, dik doğruların eğimleri ise çarpımı −1 olacak şekilde birbirinin negatif tersidir.

Parabol, f(x) = ax² + bx + c biçimindeki ikinci dereceden fonksiyonun grafiğidir. a > 0 ise parabol yukarı açık (minimum noktası var), a < 0 ise aşağı açıktır (maksimum noktası var). Parabolun eksen simetrisi x = −b/(2a) doğrusudur. Köşe noktasının x koordinatı bu değere eşittir; y koordinatı ise bu x değeri fonksiyona yerleştirilerek bulunur.

Parabolun x ekseniyle kesişim noktaları, ayırt edici (diskriminant) D = b² − 4ac değerine bağlıdır: D > 0 ise iki gerçek kök, D = 0 ise bir gerçek kök, D < 0 ise gerçek kök yoktur.

Fonksiyonun tanım kümesi, x değerlerinin alabileceği aralığı; görüntüsü kümesi ise f(x) değerlerinin aldığı aralığı ifade eder. Doğrusal bir fonksiyonun tanım ve görüntüsü kümesi genellikle tüm gerçek sayılardır. Bir parabolun görüntüsü kümesi ise köşe noktasına bağlıdır: yukarı açık parabolde köşe y değerinden büyük ya da eşit tüm sayılar görüntüsü kümesini oluşturur.

Grafik okuma sorularında bir doğrunun ya da parabolun denklemini koordinatlardan türetmek sık sık istenir. Grafik üzerindeki iki noktanın koordinatları okunarak eğim hesaplanır, ardından y = mx + b biçimindeki denkleme eğim ve bir nokta yerleştirilerek b bulunur.
  $b$,
  ARRAY['fonksiyon','doğrusal','parabol','grafik','eğim','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e2000007-0000-4000-e200-000000000007','main_idea','Bu metnin ana konusu nedir?','["Sayı teorisi","Fonksiyon ve grafik: doğrusal fonksiyon ve parabol","Olasılık hesaplamaları","Geometri formülleri"]'::jsonb,1,'Metin doğrusal fonksiyon, parabol, eğim ve grafik okuma konularını ele alır.',2,1),
('e2000007-0000-4000-e200-000000000007','detail','Doğrusal fonksiyon f(x) = mx + b''de m değeri ne anlama gelir?','["y eksenini kesim noktası","x eksenini kesim noktası","Fonksiyonun eğimi","Fonksiyonun köşe noktası"]'::jsonb,2,'f(x) = mx + b denkleminde m eğimi, b ise y kesim noktasını temsil eder.',1,2),
('e2000007-0000-4000-e200-000000000007','detail','f(x) = ax² + bx + c''de a < 0 ise parabol nasıl açılır?','["Yukarı açık, minimum noktası vardır","Aşağı açık, maksimum noktası vardır","Yatay eksene paralel olur","a değerinin etkisi yoktur"]'::jsonb,1,'Metin a < 0 olduğunda parabolun aşağı açık olduğunu ve maksimum noktasının bulunduğunu belirtir.',2,3),
('e2000007-0000-4000-e200-000000000007','vocabulary','Parabolun eksen simetrisi denklemi nedir?','["x = b / (2a)","x = −b / (2a)","x = −c / b","x = 2a / b"]'::jsonb,1,'Metin parabolun eksen simetrisinin "x = −b/(2a) doğrusu" olduğunu belirtir.',2,4),
('e2000007-0000-4000-e200-000000000007','inference','Diskriminant D < 0 olduğunda parabol hakkında ne söylenebilir?','["Parabolun iki gerçek kökü vardır","Parabolun bir gerçek kökü vardır","Parabolun gerçek kökü yoktur","Parabol x eksenine teğettir"]'::jsonb,2,'D < 0 ise denklemin gerçek sayılar kümesinde çözümü yoktur; parabol x eksenini kesmez.',3,5);

-- ══ METİN 8: Kombinatorik ve Sayma ════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e2000008-0000-4000-e200-000000000008',
  'Kombinatorik ve Sayma: Seçme ve Yerleştirme Prensipleri',
  'TYT Matematik',
  'TYT', 3, 430, 3,
  $b$
Kombinatorik, sayma problemlerinin sistematik biçimde ele alındığı matematik dalıdır. Olasılık hesaplarının temelini oluşturan bu alan, TYT sınavında seçme, sıralama ve yerleştirme soruları biçiminde karşımıza çıkar. Temel sayma ilkelerini kavramak, karmaşık görünen problemleri adımlara bölmek için vazgeçilmezdir.

Toplama ilkesine göre iki ayrı görev aynı anda yapılamıyorsa birini yapmanın m, diğerini yapmanın n yolu varsa her ikisinden birini yapmanın toplam m + n yolu vardır. Çarpma ilkesine göre ise ardışık olarak yapılabilen iki görevde birincisini yapmanın m, ikincisini yapmanın n yolu varsa her ikisini sırasıyla yapmanın toplam m × n yolu vardır.

Tekrarsız permütasyon, n farklı nesnenin tamamının sıralanmasıdır ve n! (n faktöriyel) ile hesaplanır. Beş kitap bir rafa kaç farklı şekilde dizilir sorusu 5! = 120 yanıtını verir. Kısmi permütasyonda ise n nesneden r tanesini sırayla seçmenin yolu P(n,r) = n!/(n−r)! formülüyle bulunur. Sıranın belirleyici olduğu her problemde permütasyon devreye girer.

Kombinasyon, n nesneden r tanesini sıra gözetmeksizin seçmektir. C(n,r) = n!/[r!(n−r)!] formülü kullanılır. Örneğin 12 kişilik bir gruptan 3 kişilik bir ekip oluşturulacaksa C(12,3) = 220 farklı ekip kurulabilir. Kombinasyonun önemli bir özelliği C(n,r) = C(n, n−r) eşitliğidir; yani 12 kişiden 3 seçmek, 12 kişiden 9 seçmemek anlamına gelir.

Bazı sayma problemleri kısıtlamalar içerir. "En az bir", "hiç yok", "belirli iki kişi aynı grupta" gibi koşullar tamamlayıcı sayma tekniğini gerektirir. Tamamlayıcı saymada tüm olası yollardan yasak durumlar çıkarılır: istenilen sayı = toplam − istenilmeyenler.

Tekrarlı nesnelerin permütasyonu, aynı nesnelerin birden fazla kez yer aldığı dizilimleri kapsar. n nesneden a tanesi özdeş, b tanesi özdeş ise toplam dizilim sayısı n!/(a! × b!) formülüyle hesaplanır. Kombinatorik sorularda çözüme başlamadan önce sıranın önemli olup olmadığını, kısıtlama bulunup bulunmadığını belirlemek doğru yöntemin seçilmesini sağlar.
  $b$,
  ARRAY['kombinatorik','sayma','permütasyon','kombinasyon','faktöriyel','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e2000008-0000-4000-e200-000000000008','main_idea','Bu metnin konusu nedir?','["Olasılık hesaplama","Kombinatorik: seçme, sıralama ve yerleştirme prensipleri","Geometrik diziler","Mantık ve çıkarım"]'::jsonb,1,'Metin sayma ilkeleri, permütasyon, kombinasyon ve tamamlayıcı sayma konularını ele alır.',2,1),
('e2000008-0000-4000-e200-000000000008','detail','Beş farklı kitap bir rafa kaç farklı şekilde dizilir?','["25","60","100","120"]'::jsonb,3,'5! = 5 × 4 × 3 × 2 × 1 = 120 farklı sıralama yapılabilir.',1,2),
('e2000008-0000-4000-e200-000000000008','detail','12 kişilik bir gruptan 3 kişilik bir ekip oluşturulduğunda kaç farklı ekip kurulabilir?','["120","180","220","360"]'::jsonb,2,'Metin C(12,3) = 220 değerini doğrudan verir.',2,3),
('e2000008-0000-4000-e200-000000000008','vocabulary','C(n,r) = C(n, n−r) eşitliğinin pratik anlamı nedir?','["Kombinasyon ile permütasyon sonuçları eşittir","n nesneden r seçmek, n nesneden n−r seçmemekle aynıdır","Her kombinasyon problemi permütasyona dönüştürülebilir","Sıranın önemi kombinasyon sonucunu değiştirmez"]'::jsonb,1,'Metin "12 kişiden 3 seçmek, 12 kişiden 9 seçmemek anlamına gelir" örneğiyle açıklar.',3,4),
('e2000008-0000-4000-e200-000000000008','inference','Tamamlayıcı sayma tekniği ne zaman kullanılır?','["Yalnızca sıranın önemli olduğu durumlarda","''En az'' veya yasak koşullar içeren problemlerde","Yalnızca tekrarlı nesneler söz konusu olduğunda","Toplama ilkesinin yeterli olmadığı her durumda"]'::jsonb,1,'Metin "özellikle ''en az'' içeren koşullarda büyük kolaylık sağlar" der.',3,5);

END;
$migration$;
