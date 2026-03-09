-- ================================================================
-- 041_lgs_turkce_merged.sql  
-- LGS 8. Sınıf Türkçe — Sözcükte Anlam + Cümlede Anlam
-- Birleşik migration (eski 040 + 041)
-- ================================================================

-- ================================================================
-- 040_lgs_turkce_sozcukte_anlam.sql
-- LGS 8. Sınıf Türkçe — Sözcükte Anlam
-- 10 metin × 5 soru = 50 soru
--
-- Konular:
--   1) Gerçek Anlam
--   2) Mecaz Anlam
--   3) Terim Anlam
--   4) Eş Anlamlı Sözcükler
--   5) Zıt Anlamlı Sözcükler
--   6) Çok Anlamlılık
--   7) Deyimler (1)
--   8) Deyimler (2)
--   9) Atasözleri
--  10) Karma — Sözcükler Arası Anlam İlişkileri
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- METİNLER
-- ────────────────────────────────────────────────────────────────

-- 1) Gerçek Anlam
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000001-0000-4000-a000-000000000001',
  'Karlı Bir Kış Sabahı',
  'Türkçe - Sözcükte Anlam - Gerçek Anlam',
  'LGS', 2, 278, 90,
$$Karlı bir kış sabahında uyandığımda pencereden dışarıya baktım. Bahçedeki kavak ağacı, beyaz örtüye bürünmüştü; dallarındaki kar, sabah güneşinin altında parıl parıl parlıyordu. Evin çatısından sarkan buz sarkıtları kristal sütunlar gibi dizilmişti. Ayak izi bırakmamış, bozulmamış bir kar örtüsüyle kaplı bahçe, adeta doğanın bize sunduğu bir tablo gibiydi.

Kış mevsiminin en belirgin özelliklerinden biri, suyu katı hale getirmesidir. Su, sıfır derece Celsius''ta donarak buz ya da kar kristallerine dönüşür. Bu kristallerin her biri kendine özgü altı köşeli bir şekle sahiptir; dünyada birbirinin aynı iki kar kristali bulunmadığı söylenir. Bu gerçek, doğanın sonsuz çeşitliliğini gözler önüne serer.

Soğuk havalarda don olayı, toprak yüzeyinde de görülür. Toprakta biriken su, soğuğun etkisiyle donar ve yüzeyde beyaz bir tabaka oluşturur. Çiftçiler bu durumdan hem yararlanır hem de zarar görür: don, bazı zararlı böcekleri öldürürken hassas bitkilere zarar verebilir. Büyükbabam, "Kış olmadan bahar güzelliği bilinmez" der; bu sözle mevsimler arasındaki dengenin önemini anlatır.

Karın eriyip yere işlemesi, su döngüsünün vazgeçilmez bir parçasıdır. Eriyen kar suyu, yüzey akışı oluşturur ya da toprağa sızarak yer altı sularını besler. Böylece kış mevsimi, gelecek ilkbahar ve yazın su kaynaklarını doldurur. Doğadaki her olay birbiriyle bağlantılıdır; kışı anlamak, bütün mevsim döngüsünü anlamak demektir.$$
);

-- 2) Mecaz Anlam
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000002-0000-4000-a000-000000000002',
  'Şehrin Nabzı',
  'Türkçe - Sözcükte Anlam - Mecaz Anlam',
  'LGS', 2, 274, 90,
$$İstanbul''un kalbini dinlemek isteyenler için en doğru adres, sabah saatlerinde Boğaz kıyısındaki çay bahçeleridir. Denizin soğuk nefesi yüzü okşar; martıların çığlıkları bir uyanış müziği gibi gökyüzünü doldurur. Şehir henüz tam anlamıyla uyanmamış, sokaklar derin bir uykudan çıkıyormuş gibi sessizdir. Bu anlarda İstanbul, sanki bir yüzüğün içinde gizlenmiş pırlantaya benzer; gün ilerledikçe yavaş yavaş parlar.

Öğle saatlerine gelindiğinde şehir coşkuyla titremektedir. Trafiğin dili tutulmuş kalabalığı, Kapalıçarşı''nın gözü dönmüş telaşı, kahvehanelerin kaynar tartışmaları... Tüm bu gürültü, kocaman bir makinenin çalışma sesi gibidir. Şehirde yaşayan insanlar da zamanla bu makineye dişli olur; hayatın çarkı döndükçe kendileri de döner.

Akşam olduğunda şehir biraz soluklanır. Yorgun bir çalışanın omuzlarının düşmesi gibi, yüksek binaların aydınlatma sistemleri birer birer kapanmaya başlar. Camilerin minarelerinden yükselen ezan sesi şehri sarar; şehrin gürültüsünü nazikçe siler. Bu saat, şehrin yüzünün yumuşadığı, gerçek karakterinin yeniden yüzeye çıktığı bir andır.

İstanbul''u anlatmak zordur. Milyonlarca insanın umutlarını bağrında taşıyan bu şehir, her sabah sıfırdan başlar; her akşam binlerce hikâyeyle yatar. Büyük şehirler de insanlar gibi doğar, büyür, yorulur ve bazen yenilenir. İstanbul hem bir şehir hem de yaşayan bir canlıdır.$$
);

-- 3) Terim Anlam
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000003-0000-4000-a000-000000000003',
  'Bilimlerin Ortak Dili',
  'Türkçe - Sözcükte Anlam - Terim Anlam',
  'LGS', 2, 268, 90,
$$Bilim, karmaşık olayları anlamlandırmak için özel bir dil kullanır. Bu dil; net sınırları çizilmiş kavramlardan, yani terimlerden oluşur. Örneğin "madde" sözcüğü günlük hayatta "konu" ya da "içerik" anlamında kullanılırken, kimyada kütlesi ve hacmi olan her şeyi ifade eden bir terimdir. Aynı şekilde "iş" sözcüğü günlük dilde "yapılan faaliyet" anlamındayken fizikte "kuvvet ile yer değiştirmenin çarpımı" olarak tanımlanır.

Tıp alanında da bu tür anlam ayrımları belirgindir. "Baskı" sözcüğü günlük dilde "zorbalık" ya da "baskı uygulamak" anlamında kullanılabilirken tıp ve fizik terminolojisinde "birim alana uygulanan kuvvet" anlamında bir terimdir. "Kriz" sözcüğü de sokakta şiddetli bir kavgayı çağrıştırırken tıpta belirli bir hastalığın ani ve şiddetli atak safhasını tanımlar.

Matematik ise bu anlam çatallanmasının en belirgin yaşandığı alandır. "Küme" sözcüğü bir grup nesneyi betimler; ancak matematiksel anlamda belirli koşullar taşıyan elemanlardan oluşan yapıyı tanımlar. "Fonksiyon" günlük hayatta "işlev" anlamına gelirken matematiksel anlamda giriş-çıkış ilişkisini belirleyen bir kuralı ifade eder. "Kök" de dilbilgisinde sözcüğün temel parçasını gösterirken matematikte denklemlerin çözüm kümesini ifade eder.

Bu anlam farklılıkları iletişimde kavram kargaşasına yol açabilir. Bilimsel bir metni okurken sözcüğün terim anlamına mı yoksa günlük anlamına mı geldiğini saptamak büyük önem taşır. Terimi doğru bağlamda kullanmak, hem anlaşmazlıkları hem de ciddi yanlış anlamaları önler.$$
);

-- 4) Eş Anlamlı Sözcükler
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000004-0000-4000-a000-000000000004',
  'Bir Sözcüğün Bin Yüzü',
  'Türkçe - Sözcükte Anlam - Eş Anlamlı Sözcükler',
  'LGS', 2, 272, 90,
$$Türkçe, eş anlamlı sözcükler bakımından son derece zengin bir dildir. Aynı kavramı karşılamak için birden fazla sözcüğün var olması, anlatıma incelik ve çeşitlilik katar. Örneğin "güzel" sözcüğünün yerine "hoş, alımlı, çekici, şirin" gibi pek çok sözcük kullanılabilir. Ancak bu sözcüklerin tamamen birbirinin yerine geçebileceğini söylemek her zaman doğru olmaz; çünkü her biri dile özgü ince bir anlam tonu taşır.

"Sevmek" sözcüğünü ele alalım: "sevmek, beğenmek, hoşlanmak, gönül vermek, tutkuyla bağlanmak..." Bunların hepsi olumlu duyguları ifade eder; ancak "tutkuyla bağlanmak" ile "hoşlanmak" arasında yoğunluk bakımından büyük bir fark vardır. Bu farkındalık, yazarın duyguları doğru aktarmasına yardımcı olur.

Eş anlamlı sözcükler, özellikle yazılı anlatımda sözcük çeşitliliğini artırır. Bir paragrafta aynı sözcüğü sürekli yinelemek hem sıkıcı hem de yetersiz bir anlatım izlenimi yaratır. Eş anlamlılar bu sorunu çözer; aynı kavramı farklı sözcüklerle dile getirmek metnin akıcılığını ve derinliğini artırır.

Dil öğretmenimiz sık sık şunu belirtir: "Sözcük hazinesi geniş olan biri düşüncelerini daha doğru ve etkili biçimde aktarabilir." Bu söz, eş anlamlı sözcüklerin yalnızca bir süs olmadığını; gerçek bir düşünce aracı olduğunu ortaya koymaktadır. Zengin bir söz hazinesine sahip olmak, hem anlamayı hem de anlatmayı güçlendirir.$$
);

-- 5) Zıt Anlamlı Sözcükler
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000005-0000-4000-a000-000000000005',
  'Zıtlıkların Dili',
  'Türkçe - Sözcükte Anlam - Zıt Anlamlı Sözcükler',
  'LGS', 2, 280, 90,
$$Türk şiirinin en güçlü anlatım araçlarından biri, zıt anlamlı sözcükleri yan yana getirmektir. Sabah ve akşam, doğum ve ölüm, sevinç ve hüzün... Zıtlıklar, birbirinin anlamını aydınlatır. "Aydınlık" sözcüğünü kavramak için "karanlığa" bakmak yeterlidir; "mutluluğu" tam olarak tanımlamak içinse "kederle" karşılaşmak gerekir.

Edebiyatımızda bu karşıtlık sanatına tezat adı verilir. Şair, birbirine zıt iki unsuru aynı dize içinde buluşturarak okuyucunun zihninde derin bir çarpışma yaratır. Bu çarpışma anlam katmanları üretir; okuyucuyu hem düşündürür hem duygulandırır. Kalıcı şiirlerin büyük bölümü bu güçten beslenir.

Günlük dilde de zıt anlamlı sözcükler sıkça kullanılır. "Bu kişi hem sert hem merhametli biri" dediğimizde iki zıt özelliği yan yana getiririz; insanın iç dünyasının karmaşıklığını en yalın biçimde böyle anlatırız. "Önce yıkılır, sonra yeniden inşa edersin" cümlesi, yıkımı ve inşayı karşı karşıya getirir; direnç ve umut mesajını aktarır.

Zıt anlam ilişkisi, sözcük bilgisinin temel yapı taşlarından birini oluşturur. Bir sözcüğü tam anlamıyla kavramak için hem eş anlamlısını hem de zıt anlamlısını bilmek gerekir. Dil öğrenicileri bu yöntemi şöyle açıklar: "Sözcüğü anlamak için önce nerede durduğunu bul, sonra karşısında ne durduğuna bak." Bu yaklaşım sözcük öğrenmeyi mekanik bir ezberden çıkarıp anlam ilişkileri ağına dönüştürür. Zıtlıklar yalnızca sözcük düzeyinde değil, cümle düzeyinde de anlam ilişkisi kurar.$$
);

-- 6) Çok Anlamlılık
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000006-0000-4000-a000-000000000006',
  'Sözcüğün İki Yüzü',
  'Türkçe - Sözcükte Anlam - Çok Anlamlılık',
  'LGS', 2, 275, 90,
$$Türkçede pek çok sözcük birden fazla anlam taşır. Bu özelliğe çok anlamlılık denir. "Yüz" sözcüğü hem insan bedeninin ön yüzünü hem sayının adını hem de bir yüzeyi ifade edebilir. Hangi anlamda kullanıldığını cümle belirler: "Yüzünü yıkadı" ile "Yüz kişilik grup" ve "Masanın yüzü çizilmiş" cümlelerinde aynı sözcük tamamen farklı şeyler anlatır.

"Göz" sözcüğünü ele alalım: "Gözlerini kapattı" derken görme organını kastederiz. "Çantanın gözüne koydu" derken gözden yararlanılan bir bölmeyi. "Göz kulak ol" ifadesinde ise deyimsel bir anlam devreye girer: dikkat etmek, korumak anlamı ön plana çıkar. Sözcüğün çok anlamlılığı, dilin üretkenliğini artırır; az sözcükle çok şey söylemeyi mümkün kılar.

Bu anlam çeşitliliğinin en çarpıcı örneklerinden biri "kesmek" fiilidir. "Ekmek kesmek" somut bir eylemi, "sözü kesmek" bir konuşmayı durdurmayı, "bağlantıyı kesmek" iletişimi sonlandırmayı, "soğuğu kesmek" ise ısınmayı ya da korumayı anlatır. Bu dört kullanım da aynı fiilin farklı bağlamlardaki yansımalarıdır.

Yabancı dil öğrenirken çok anlamlılık özelliği öğrencileri zorlayabilir. Sözcük sözlükte tek bir karşılıkla verilmiş olsa bile bağlama göre bambaşka anlam kazanabilir. Bu nedenle bir sözcüğü gerçekten kavramak için onu farklı cümle bağlamlarında görmek ve izlemek büyük önem taşır. Tek boyutlu sözlük tanımları, sözcüğün gerçek anlam zenginliğini çoğu zaman yansıtamaz.$$
);

-- 7) Deyimler 1
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000007-0000-4000-a000-000000000007',
  'Söz Hazinesinden Birkaç İnci',
  'Türkçe - Sözcükte Anlam - Deyimler',
  'LGS', 2, 278, 90,
$$Türkçenin en renkli zenginlikleri arasında deyimler öne çıkar. Deyimler; sözcüklerin gerçek anlamlarıyla değil, toplumun benimsediği mecazi anlamlarla bir araya gelerek oluşturduğu kalıp ifadelerdir. "Eli açık" birinin elinin gerçekten açık olduğunu değil; cömert olduğunu anlatır. "Ağzı sıkı" biri ise dişlerini sıkmış değil, sır saklayan birini ifade eder.

Bir öğretmeni tanırdım; sınıfta gürültü olduğunda "Kulak verin!" derdi. Öğrenciler elbette gerçekten kulaklarını uzatmıyordu; dikkat etmeleri isteniyordu. Bu, deyimlerin günlük hayattaki en doğal kullanım biçimlerinden biridir. Deyimler, dili kısaltır ve yoğunlaştırır; uzun uzun anlatılabilecek bir durumu tek ifadeyle aktarır.

Kimi deyimler duyguları son derece etkili biçimde iletir. Birisi başarısız olduğunda "eli boş dönmek" deriz; birisi zor bir durumla karşılaştığında "ateşten gömlek giymek" deriz. Bunların hiçbiri gerçek anlamda değildir; hepsi duygu yoğunluğunu aktarmak için seçilmiş mecazi ifadelerdir. Deyimler anlatıma canlılık, ağırlık ve kültürel derinlik katar.

Deyimlerin en önemli özelliklerinden biri, parçalara ayrılıp anlaşılamamasıdır. "Ağzının payını vermek" ifadesini kelime kelime çözümlemeye çalışırsanız anlamsız bir sonuç elde edersiniz. Deyimi bir bütün olarak öğrenmek, dilin o kıvrımlı yollarında kaybolmadan yürümeyi sağlar. Deyimler aynı zamanda kültürel bellekten beslenir; her deyimin ardında bir gelenek ya da deneyim yatar.$$
);

-- 8) Deyimler 2
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000008-0000-4000-a000-000000000008',
  'Deyimlerin İzi',
  'Türkçe - Sözcükte Anlam - Deyimler',
  'LGS', 2, 273, 90,
$$Her deyimin ardında bir hikâye saklıdır. "Baltaya sap olmak" deyimi, birinin bir işte başkasına alet olmasını anlatır. Tarihsel süreçte baltaların ahşap sap kullandığı düşünüldüğünde, "sap olmak" araç olmak anlamına geliyordu. Zamanla bu somut ilişki mecazi bir anlam kazandı ve kalıplaştı. Dil, tarihin içinde büyüyen canlı bir varlıktır.

"Pişmiş aşa su katmak" deyimi, hazır ve tamamlanmış bir işe gereksiz müdahalede bulunarak onu bozmayı anlatır. "Yüzüne gözüne bulaştırmak" ise bir işi beceriksizce yapıp mahvetmek anlamındadır. Bu iki deyim de mutfak kültüründen beslenmektedir; Türk kültüründe mutfak yaşamın merkezinde yer aldığından, bu deyimler toplumsal hafızaya kolayca yerleşmiştir.

Kimi deyimlerin kaynağı ise somut gözlemlere dayanır. "Devede kulak" deyimi, deve gibi büyük bir canlıya oranla kulağın küçüklüğünden üretilmiştir; bir şeyin ne denli az ya da önemsiz olduğunu anlatmak için kullanılır. "Kızgın tavaya düşmüş gibi" ifadesi, bir sıkıntıdan kaçıp daha büyük bir sıkıntıya düşmek için kullanılır.

Deyimleri doğru kullanabilmek, dil becerisinin en önemli göstergelerinden biridir. Yanlış bağlamda kullanılan bir deyim hem anlam kargaşasına yol açar hem de komik bir durum oluşturur. Deyimlerin içinde doğduğu kültür ve bağlamla birlikte öğrenilmesi gerekir. Deyim zenginliği, bir toplumun dil becerisinin aynasıdır.$$
);

-- 9) Atasözleri
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000009-0000-4000-a000-000000000009',
  'Atalarımızdan Miras: Atasözleri',
  'Türkçe - Sözcükte Anlam - Atasözleri',
  'LGS', 2, 276, 90,
$$Atasözleri, toplumların asırlar boyunca biriktirdiği deneyim ve bilgeliğin öz ve kalıcı biçimidir. Kısa ve akılda kalıcı yapılarıyla nesiller boyu aktarılan bu sözler, günlük yaşamdan evrensel ilkeler üretir. "Damlaya damlaya göl olur" sözü yalnızca suyun birikmesinden değil; küçük çabaların zamanla büyük sonuçlar doğurduğundan söz eder.

"Sakla samanı, gelir zamanı" atasözü tutumlu olmayı, her şeyin bir gün işe yarayabileceğini öğütler. "Bugünün işini yarına bırakma" atasözü ise erteleme alışkanlığını eleştirerek anlık sorumluluk bilincine vurgu yapar. Bu iki atasözü çelişkili görünse de farklı yaşam durumlarına rehberlik eder.

Bazı atasözleri doğrudan insan ilişkileri hakkındadır. "El eli yıkar, eller yüzü" atasözü dayanışma ve karşılıklı yardımlaşmanın önemini anlatır. "Bin ölç bir biç" ise aceleci davranmaktan kaçınmayı, kararları önceden tartmayı öğütler. Bu tür atasözleri, toplumsal değerleri nesillere aktarmanın en yalın yoludur.

Atasözlerini gerçek anlamda kavramak için onları yüzeysel okumak yetmez; arkalarında yatan kültürel ve toplumsal bağlamı anlamak gerekir. "Mum dibine ışık vermez" derken mumun özelliğinden değil, kişinin yakınındaki sorunlara kör kaldığı bir örüntüden söz edilir. Bu soyutlama yeteneği, atasözlerini her çağda ve her bağlamda geçerli kılar; onları kalıcı kılan da bu evrensel özleridir.$$
);

-- 10) Karma — Sözcükler Arası Anlam İlişkileri
INSERT INTO text_library
  (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'a0000010-0000-4000-a000-000000000010',
  'Anlam Dünyasında Bir Gezinti',
  'Türkçe - Sözcükte Anlam - Karma',
  'LGS', 3, 284, 95,
$$Dilin anlam dünyasında gezintiye çıktığımızda karşımıza birbirinden ilgi çekici kıvrımlar çıkar. Bir sözcük gerçek anlamıyla kullanılabilir, mecazi bir boyut kazanabilir ya da özel bir alanda terim haline gelebilir. "Kök" sözcüğü botanik teriminde bitkinin toprak altındaki bölümünü; dilbilgisinde sözcüğün anlam taşıyan temel parçasını; günlük hayatta ise "köklü bir aile" deyişiyle soyun nereden geldiğini anlatır.

Eş anlamlı sözcükler de dilin renklerini çoğaltır. "Hızlı, çabuk, süratli, acele" sözcükleri birbirine yakın anlamlar taşır; ancak bir roman cümlesinde her birinin farklı bir ton ve ritim yaratacağını deneyimli bir yazar bilir. Zıt anlamlılar ise dilin çerçevesini çizer: "ilerlemek-gerilemek, açılmak-kapanmak, vermek-almak"... Her çift, kavramı sınırlarıyla birlikte tanımlar.

Deyimler ise dilin en renkli kısmını oluşturur. "Ağzı var dili yok" ifadesinde kişi hem ağzı hem dili olduğu hâlde konuşamayan ya da konuşmayan birini anlatır; bu imkânsızlık görüntüsü, deyimin gücünü ortaya koyar. Atasözleri de benzer biçimde toplumsal deneyimi damıtır. "Her şeyin bir zamanı vardır" sözü, aceleci davranmanın bazen fırsatları kaçırtabileceğini ima eder.

Sözcüklerin bu karmaşık anlam ağı, dili canlı bir organizma haline getirir. Sözcüğü yalnızca sözlükteki kuru tanımıyla değil; o sözcüğü kullanan toplumun bağlamıyla, tarihiyle ve kültürüyle birlikte tanımak gerekmektedir. Dil; sadece bir iletişim aracı değil, aynı zamanda bir kültür mirasıdır.$$
);


-- ────────────────────────────────────────────────────────────────
-- SORULAR  (her metine 5 LGS tarzı soru)
-- ────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════
-- METİN 1: Karlı Bir Kış Sabahı — Gerçek Anlam
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000001-0000-4000-a000-000000000001','vocabulary',
$$Aşağıdaki cümlelerin hangisinde "kar" sözcüğü mecaz anlamıyla kullanılmıştır?$$,
'["Sabah uyandığımda bahçeye kar yağmıştı.","Dağların zirvesi kar örtüsüyle kaplıydı.","Kış boyunca şiddetli kar fırtınaları yaşandı.","Dedenin saçları kar gibi ağarmıştı."]'::jsonb,
3,'Kar beyazlığı somut nesneleri ya da görünümleri betimlemek için mecaz anlamda kullanılır. "Saçları kar gibi ağarmıştı" cümlesinde kar, saçların beyazlığını anlatmak için gerçek anlamı dışında kullanılmıştır.',2,1),

-- S2
('a0000001-0000-4000-a000-000000000001','vocabulary',
$$"Erimek" sözcüğünün aşağıdaki cümlelerin hangisinde gerçek anlamıyla kullanıldığı görülmektedir?$$,
'["Kötü haber karşısında içim eridi.","Güneşin etkisiyle çatıdaki kar erimeye başladı.","Sevincinden yerinde eridi.","Çocuğun gülüşü karşısında kalbim eridi."]'::jsonb,
1,'Gerçek anlam; bir sözcüğün ilk ve somut anlamıdır. "Çatıdaki kar erimeye başladı" cümlesinde erimek, katı maddenin ısı etkisiyle sıvıya dönüşmesini anlatmakta, yani gerçek anlamda kullanılmaktadır.',2,2),

-- S3
('a0000001-0000-4000-a000-000000000001','vocabulary',
$$"Baş" sözcüğünün aşağıdaki cümlelerin hangisinde diğerlerinden farklı bir anlamda kullanıldığı görülmektedir?$$,
'["Masa başında uzun saatler çalıştı.","Sorunun başını tekrar irdeleyelim.","Tüm bu karmaşanın başında sen varsın.","Küçük kardeşinin başını okşadı."]'::jsonb,
3,'A, B ve C seçeneklerinde "baş" sözcüğü "başlangıç, kaynak, temel" anlamında kullanılmıştır. D seçeneğinde ise insan bedeninin baş kısmı, yani kafası kastedilmektedir. Bu nedenle D diğerlerinden farklı anlam taşır.',2,3),

-- S4
('a0000001-0000-4000-a000-000000000001','vocabulary',
$$Metinde geçen "bürünmek" sözcüğünün eş anlamlısı aşağıdakilerden hangisidir?$$,
'["Soyunmak","Açılmak","Kaplanmak","Dağılmak"]'::jsonb,
2,'"Bürünmek" bir örtünün ya da örtünün benzerinin etrafını sarması anlamına gelir. Bu anlamın en yakın karşılığı "kaplanmak" sözcüğüdür.',2,4),

-- S5
('a0000001-0000-4000-a000-000000000001','vocabulary',
$$Metinde büyükbabanın söylediği "Kış olmadan bahar güzelliği bilinmez" sözüyle anlatılmak istenen aşağıdakilerden hangisidir?$$,
'["Kış mevsimi bahara göre çok daha uzun sürer.","Bahar, hava sıcaklıkları bakımından kışa benzer.","Zıtlıklar birbirinin değerini ortaya çıkarır; zorluğu yaşamadan güzelliği tam anlayamazsınız.","Kış aylarında hava daima soğuk ve karlı olmak zorundadır."]'::jsonb,
2,'Bu atasözü, zıt durumların birbirinin değerini ortaya çıkardığını anlatır. Kışın zorlukları yaşanmadan baharın güzelliği tam olarak kavranamaz. Bu, zıt deneyimlerin birbirini anlamlı kıldığını vurgular.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 2: Şehrin Nabzı — Mecaz Anlam
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000002-0000-4000-a000-000000000002','vocabulary',
$$Metinde "şehrin kalbini dinlemek" ifadesinde "kalp" sözcüğü hangi anlamda kullanılmıştır?$$,
'["Vücudun kan pompalayan organı anlamında","Şehrin merkezi, özü ve canlılığının odağı anlamında","Şehirdeki hastane binası anlamında","Şehrin coğrafi koordinatı anlamında"]'::jsonb,
1,'"Kalp" sözcüğü burada gerçek anlamıyla değil, mecaz anlamıyla kullanılmıştır. Şehrin kalbini dinlemek; şehrin özünü, ruhunu ve canlılığını hissetmek anlamına gelir.',2,1),

-- S2
('a0000002-0000-4000-a000-000000000002','vocabulary',
$$"Denizin soğuk nefesi yüzü okşar" cümlesinde aşağıdakilerden hangisi doğrudur?$$,
'["Cümlede hiç mecaz anlam yoktur; gerçek bir doğa olayı anlatılmaktadır.","Yalnızca \"nefes\" sözcüğü mecaz anlamda kullanılmıştır.","\"Nefes\" ve \"okşamak\" sözcükleri birlikte mecaz anlam oluşturmaktadır.","\"Soğuk\" sözcüğü mecaz, diğerleri gerçek anlamdadır."]'::jsonb,
2,'Deniz nefes almaz, dolayısıyla "nefes" sözcüğü denize atfedilerek mecaz anlam yaratır. "Okşamak" ise insanlara özgü bir eylem olduğundan denize bağlandığında yine mecazi anlam taşır. Her ikisi de kişileştirme yoluyla mecaz anlam oluşturmaktadır.',2,2),

-- S3
('a0000002-0000-4000-a000-000000000002','vocabulary',
$$Metinde geçen "dili tutulmak" deyiminin anlamı aşağıdakilerden hangisidir?$$,
'["Dil organında fiziksel bir sorun yaşamak","Konuşamamak ya da şaşkınlık içinde susmak","Yabancı bir dil öğrenememek","Kalabalık içinde söz söyleyememek"]'::jsonb,
1,'"Dili tutulmak" deyimi, şaşkınlık, korku ya da bir başka güçlü duygu nedeniyle konuşamamayı ifade eder. Dilin gerçek anlamda tutulmasıyla ilgisi yoktur.',2,3),

-- S4
('a0000002-0000-4000-a000-000000000002','vocabulary',
$$"Şehirde yaşayan insanlar da zamanla bu makineye dişli olur." cümlesinde anlatılmak istenen aşağıdakilerden hangisidir?$$,
'["İnsanlar gerçek anlamda makine parçasına dönüşür.","İnsanlar zamanla şehrin işleyişine uyum sağlayarak onun ayrılmaz bir parçası haline gelir.","İnsanlar fabrikada çalışmaya mecbur kalır.","Şehirde yaşamak insanları mekanik düşünmeye iter."]'::jsonb,
1,'Bu cümlede şehir bir makineye, insanlar ise bu makinenin parçası olan dişliye benzetilmiştir. Mecaz anlam aracılığıyla bireylerin şehir sistemine uyum sağlayarak onun bir parçası haline geldiği anlatılmaktadır.',2,4),

-- S5
('a0000002-0000-4000-a000-000000000002','vocabulary',
$$Aşağıdaki ifadelerden hangisi diğerlerine göre farklı bir anlatım biçimini sergilemektedir?$$,
'["Şehir sanki bir yüzüğün içindeki pırlantaya benzer.","Trafiğin dili tutulmuş kalabalığı şehri sardı.","Hayatın çarkı döndükçe kendileri de döner.","İstanbul, Avrupa ile Asya arasında köprü görevi üstlenen önemli bir şehirdir."]'::jsonb,
3,'A, B ve C seçeneklerinde sözcükler mecaz anlamda kullanılmış ya da kişileştirme yapılmıştır. D seçeneğinde ise nesnel ve gerçek anlamda bir bilgi verilmektedir. Bu nedenle D, diğerlerinden farklı bir anlatım biçimini sergilemektedir.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 3: Bilimlerin Ortak Dili — Terim Anlam
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000003-0000-4000-a000-000000000003','vocabulary',
$$Metne göre "iş" sözcüğünün fizikte kullanılan terim anlamı aşağıdakilerden hangisidir?$$,
'["Yapılan herhangi bir faaliyet ya da etkinlik","İnsanların geçimini sağladığı meslek ya da görev","Kuvvet ile yer değiştirmenin çarpımı","Bedensel ya da zihinsel çaba harcamak"]'::jsonb,
2,'Metin, "iş" sözcüğünün günlük hayatta "yapılan faaliyet" anlamına geldiğini; fizikte ise "kuvvet ile yer değiştirmenin çarpımı" olarak tanımlandığını açıkça belirtmektedir.',2,1),

-- S2
('a0000003-0000-4000-a000-000000000003','vocabulary',
$$Aşağıdaki cümlelerin hangisinde "madde" sözcüğü terim anlamıyla kullanılmıştır?$$,
'["Bu maddeyi iyice çalışmalıyız.","Eriyen madde kabın içinde birikti.","Kanun maddesine dikkat edin.","Bu madde üzerinde daha çok duralım."]'::jsonb,
1,'"Eriyen madde" ifadesinde "madde"; kütlesi ve hacmi olan fiziksel varlık anlamında bilimsel bir terim olarak kullanılmıştır. Diğer seçeneklerde ise "madde" günlük dildeki "konu, husus" anlamında ya da hukuki anlamda kullanılmıştır.',2,2),

-- S3
('a0000003-0000-4000-a000-000000000003','vocabulary',
$$"Küme" sözcüğünün aşağıdaki cümlelerin hangisinde matematiksel terim anlamıyla kullanıldığı görülmektedir?$$,
'["Koyunlar, küme küme otlakta dolaşıyordu.","Renkli çiçekler bahçede küme oluşturuyordu.","Elemanları belirli koşulları sağlayan küme, sonlu ya da sonsuz olabilir.","Bulutlar gökyüzünde kümelendi."]'::jsonb,
2,'Matematiksel anlamda "küme"; belirli koşulları taşıyan elemanların oluşturduğu yapıdır. C seçeneğindeki "elemanları belirli koşulları sağlayan küme" ifadesi bu tanımla örtüşmektedir.',2,3),

-- S4
('a0000003-0000-4000-a000-000000000003','vocabulary',
$$Metne göre aşağıdaki sözcük çiftlerinin hangisi hem günlük dilde hem de bilimsel anlamda farklı biçimlerde kullanılmaktadır?$$,
'["Taş – yalnızca somut nesne anlamında kullanılır.","İş – hem \"yapılan faaliyet\" hem fizik terimi olarak kullanılır.","Çiçek – yalnızca bitki organı anlamında kullanılır.","Masa – yalnızca mobilya anlamında kullanılır."]'::jsonb,
1,'Metin; "iş" sözcüğünün günlük dilde "faaliyet" anlamına gelirken fizikte kuvvet ve yer değiştirme çarpımını ifade ettiğini açıklamaktadır. Bu, "iş"in hem günlük hem bilimsel anlamda farklı kullanıldığının açık bir örneğidir.',2,4),

-- S5
('a0000003-0000-4000-a000-000000000003','vocabulary',
$$Metne göre terim anlamıyla kullanılan sözcükler hakkında aşağıdakilerden hangisi doğrudur?$$,
'["Terimler her alanda aynı anlamda kullanılır.","Terimler günlük dilden farklı, net sınırları çizilmiş anlamlar taşır.","Terimler yalnızca matematik ve fizik alanları için geçerlidir.","Terim anlamları zaman içinde değişmez ve gelişmez."]'::jsonb,
1,'Metin, terimlerin belirli bilim dallarında net sınırları olan özel anlamlar taşıdığını vurgulamaktadır. Aynı sözcük farklı alanlarda farklı terim anlamı kazanabilir; bu da terimlerin günlük dilden farklı bir nitelik taşıdığını gösterir.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 4: Bir Sözcüğün Bin Yüzü — Eş Anlamlı Sözcükler
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000004-0000-4000-a000-000000000004','vocabulary',
$$"Güzel" sözcüğünün eş anlamlısı aşağıdakilerden hangisidir?$$,
'["Çirkin","Sıradan","Hoş","Donuk"]'::jsonb,
2,'"Güzel" sözcüğü; estetik açıdan beğenilen, göze ya da gönle hoş gelen anlamını taşır. Bu anlamın en yakın karşılığı "hoş" sözcüğüdür. "Çirkin" ise zıt anlamlısıdır.',1,1),

-- S2
('a0000004-0000-4000-a000-000000000004','vocabulary',
$$Metinde geçen "yinelemek" sözcüğünün eş anlamlısı aşağıdakilerden hangisidir?$$,
'["Değiştirmek","Tekrar etmek","Çoğaltmak","Silmek"]'::jsonb,
1,'"Yinelemek" sözcüğü, bir şeyi tekrar söylemek ya da yapmak anlamına gelir. Bu anlamın doğrudan eş anlamlısı "tekrar etmek" ifadesidir.',2,2),

-- S3
('a0000004-0000-4000-a000-000000000004','vocabulary',
$$Aşağıdaki sözcük çiftlerinden hangisi birbirinin tam eş anlamlısı değildir?$$,
'["hoş – güzel","büyük – iri","hızlı – süratli","sevmek – tutkuyla bağlanmak"]'::jsonb,
3,'A, B ve C seçeneklerindeki çiftler birbirinin tam eş anlamlısıdır. D seçeneğinde ise "sevmek" genel bir olumlu duyguyu ifade ederken "tutkuyla bağlanmak" çok daha yoğun ve güçlü bir duyguyu anlatır. Bu nedenle bu çift tam eş anlamlı sayılamaz.',2,3),

-- S4
('a0000004-0000-4000-a000-000000000004','vocabulary',
$$"Akıcılık" sözcüğünün eş anlamlısı aşağıdakilerden hangisidir?$$,
'["Sertlik","Pürüzsüzlük","Ağırlık","Karmaşıklık"]'::jsonb,
1,'"Akıcılık" sözcüğü; bir şeyin kesintisiz, düzenli ve pürüzsüz biçimde ilerlemesi anlamına gelir. Bu tanıma en yakın sözcük "pürüzsüzlük" tür.',2,4),

-- S5
('a0000004-0000-4000-a000-000000000004','vocabulary',
$$Metne göre eş anlamlı sözcüklerin yazılı anlatımdaki en önemli işlevi aşağıdakilerden hangisidir?$$,
'["Metni daha uzun ve ayrıntılı kılmak","Okuyucunun dikkatini dağıtmak","Sözcük çeşitliliğini artırmak ve anlamsız tekrardan kaçınmak","Metnin anlaşılmasını zorlaştırmak"]'::jsonb,
2,'Metin; aynı sözcüğü sürekli tekrar etmenin sıkıcı bir etki yarattığını ve eş anlamlıların bu sorunu çözdüğünü belirtmektedir. Eş anlamlılar sözcük çeşitliliği sağlar, metnin akıcılığını ve derinliğini artırır.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 5: Zıtlıkların Dili — Zıt Anlamlı Sözcükler
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000005-0000-4000-a000-000000000005','vocabulary',
$$"Aydınlık" sözcüğünün zıt anlamlısı aşağıdakilerden hangisidir?$$,
'["Parlak","Renkli","Karanlık","Donuk"]'::jsonb,
2,'"Aydınlık" ışığın var olduğu, parlak olan anlamına gelir. Bunun tam karşıtı ışığın olmadığı durumu ifade eden "karanlık" sözcüğüdür.',1,1),

-- S2
('a0000005-0000-4000-a000-000000000005','vocabulary',
$$Aşağıdaki sözcük çiftlerinden hangisi zıt anlamlı değildir?$$,
'["sert – yumuşak","büyük – küçük","güzel – çirkin","sabah – öğle"]'::jsonb,
3,'"Sert-yumuşak", "büyük-küçük" ve "güzel-çirkin" birbirinin zıt anlamlısıdır. "Sabah" ve "öğle" ise zıt anlamlı değil; birbirini takip eden zaman dilimlerini gösteren sözcüklerdir. "Sabah"ın zıt anlamlısı "akşam" ya da "gece"dir.',2,2),

-- S3
('a0000005-0000-4000-a000-000000000005','vocabulary',
$$Metinde geçen "yıkılmak" sözcüğünün zıt anlamlısı aşağıdakilerden hangisidir?$$,
'["Dağılmak","Çökmek","Yeniden inşa edilmek","Kırılmak"]'::jsonb,
2,'"Yıkılmak" bir yapının ya da durumun parçalanıp yok olması anlamına gelir. Bunun tam karşıtı "yeniden inşa edilmek", yani var olmak ve ayağa kalkmaktır. Bu anlam metinde de "Önce yıkılır, sonra yeniden inşa edersin" cümlesinde desteklenmektedir.',2,3),

-- S4
('a0000005-0000-4000-a000-000000000005','vocabulary',
$$Edebiyatta "tezat" sanatı için aşağıdakilerden hangisi söylenemez?$$,
'["Şair, birbirine zıt iki unsuru aynı dize içinde buluşturur.","Tezat yalnızca sözcük düzeyinde kullanılabilir; cümle düzeyinde kullanılamaz.","Tezat, okuyucuda derin bir etki ve anlam katmanı yaratır.","Zıtlıklar birbirinin anlamını aydınlatır."]'::jsonb,
1,'Metin, zıtlıkların "cümle düzeyinde de anlam ilişkisi kurduğunu" açıkça belirtmektedir. Bu nedenle B seçeneğindeki "tezat yalnızca sözcük düzeyinde kullanılabilir" ifadesi metne göre yanlıştır.',2,4),

-- S5
('a0000005-0000-4000-a000-000000000005','vocabulary',
$$Metne göre bir sözcüğü tam olarak kavramak için aşağıdakilerden hangisi önemlidir?$$,
'["Sözcüğün kökenini Osmanlıcada araştırmak","Sözcüğü yalnızca sözlükteki birinci anlamıyla öğrenmek","Sözcüğün hem eş anlamlısını hem de zıt anlamlısını bilmek","Sözcüğü farklı dillerdeki karşılıklarıyla karşılaştırmak"]'::jsonb,
2,'Metin, bir sözcüğü tam kavramak için hem eş anlamlısını hem de zıt anlamlısını bilmek gerektiğini vurgulamaktadır. Bu yöntem, sözcüğü anlam ilişkileri ağı içinde konumlandırarak daha derin kavramayı sağlar.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 6: Sözcüğün İki Yüzü — Çok Anlamlılık
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000006-0000-4000-a000-000000000006','vocabulary',
$$"Göz" sözcüğünün aşağıdaki cümlelerin hangisinde diğerlerinden farklı bir anlamda kullanıldığı görülmektedir?$$,
'["Gözlerini ovuşturarak uyandı.","Çocuk annesine şaşkın gözlerle baktı.","Çantanın üst gözüne el fenerini koydu.","Gözleri kızarmıştı; çok ağlamıştı."]'::jsonb,
2,'A, B ve D seçeneklerinde "göz" sözcüğü görme organı anlamında kullanılmıştır. C seçeneğinde ise "göz" bölme ya da cep anlamında kullanılmış olup diğerlerinden farklı bir anlam taşımaktadır.',2,1),

-- S2
('a0000006-0000-4000-a000-000000000006','vocabulary',
$$Aşağıdaki cümlelerin hangisinde "yüz" sözcüğü diğerlerinden farklı bir anlamda kullanılmıştır?$$,
'["Sabah yüzünü yıkamayı ihmal etti.","Utancından yüzü kızarmıştı.","Toplantıya yüz kişi katıldı.","Sevincinden yüzü güldü."]'::jsonb,
2,'A, B ve D seçeneklerinde "yüz" insanın yüz bölgesini ifade etmektedir. C seçeneğinde ise "yüz" sayı anlamında kullanılmıştır. Bu nedenle C, diğerlerinden farklı anlam taşır.',2,2),

-- S3
('a0000006-0000-4000-a000-000000000006','vocabulary',
$$"Kesmek" sözcüğünün aşağıdaki cümlelerin hangisinde diğerlerinden farklı bir anlamda kullanıldığı görülmektedir?$$,
'["Makasla ipliği kesti.","Kasap eti küçük parçalara kesti.","Konuşmayı keserek odadan çıktı.","Bıçakla ekmeği kesti."]'::jsonb,
2,'A, B ve D seçeneklerinde "kesmek" somut ve fiziksel anlamıyla, bir nesneyi parçalara ayırmak için kullanılmıştır. C seçeneğinde ise "kesmek" konuşmayı durdurmak, bitirmek anlamında mecazi biçimde kullanılmıştır.',2,3),

-- S4
('a0000006-0000-4000-a000-000000000006','vocabulary',
$$Metne göre bir sözcüğün çok anlamlı olduğu nasıl anlaşılır?$$,
'["Sözcüğün sözlükteki ilk anlamına bakılarak","Sözcüğün kaç heceden oluştuğuna bakılarak","Sözcük aynı kalmak üzere farklı bağlamlarda farklı anlam kazanıyorsa","Sözcüğün yabancı dilden alıntı olup olmadığına bakılarak"]'::jsonb,
2,'Metin, aynı sözcüğün farklı cümle bağlamlarında farklı anlamlar kazanabildiğini örneklerle açıklamaktadır. Çok anlamlılık; sözcüğün değişmeden kalıp bağlama göre farklı anlamlar üstlenmesi durumudur.',2,4),

-- S5
('a0000006-0000-4000-a000-000000000006','vocabulary',
$$Aşağıdaki cümlelerin hangisinde "açık" sözcüğü mecaz anlamda kullanılmıştır?$$,
'["Pencereyi açık bırakmıştı.","Hava açık ve güneşliydi.","Açık yüreklilikle tüm düşüncelerini paylaştı.","Kapı açıktı, içerisi görünüyordu."]'::jsonb,
2,'"Açık yüreklilik" ifadesinde "açık" sözcüğü içtenlik, dürüstlük ve samimiyet gibi soyut nitelikleri betimlemek için mecaz anlamda kullanılmıştır. Diğer seçeneklerde ise fiziksel açıklık anlatılmaktadır.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 7: Söz Hazinesinden Birkaç İnci — Deyimler 1
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000007-0000-4000-a000-000000000007','vocabulary',
$$Metinde geçen "eli açık" deyiminin anlamı aşağıdakilerden hangisidir?$$,
'["Elini uzatarak yardım isteyen","Cömert, elindekini başkalarıyla paylaşan","Kollarını yana açan","Avucunu açarak gösteren"]'::jsonb,
1,'"Eli açık" deyimi, elini cömertçe açan yani sahip olduklarını başkalarıyla paylaşan kimseyi anlatır. Fiziksel anlamda elin açık olmasıyla ilgisi yoktur.',2,1),

-- S2
('a0000007-0000-4000-a000-000000000007','vocabulary',
$$"Ağzı sıkı" deyiminin anlamı aşağıdakilerden hangisidir?$$,
'["Dişlerini sıkan, sinirli biri","Az yiyen, iştahsız biri","Sır saklayan, ağzından laf almak güç olan biri","Dişlerinin arasında bir şey sıkışmış olan biri"]'::jsonb,
2,'"Ağzı sıkı" deyimi, sır saklayan, paylaşmak istemediği bilgileri kimseye söylemeyen birini tanımlar. Dişlerini fiziksel olarak sıkmakla ilgisi yoktur.',2,2),

-- S3
('a0000007-0000-4000-a000-000000000007','vocabulary',
$$Metinde geçen "ateşten gömlek giymek" deyimi hangi durumu anlatır?$$,
'["Çok sıcak bir ortamda bulunmak","Tutuşan bir giysiyi giymek zorunda kalmak","Büyük sıkıntı, çıkmaz ve baskı içinde kalmak","Yangın söndürme görevinde bulunmak"]'::jsonb,
2,'"Ateşten gömlek giymek" deyimi; bireyin çok ağır bir yük ya da zorlukla karşı karşıya kalmasını, adeta içinden çıkılamaz bir duruma girmesini ifade eder.',2,3),

-- S4
('a0000007-0000-4000-a000-000000000007','vocabulary',
$$Aşağıdaki deyimlerin hangisinin anlamı yanlış verilmiştir?$$,
'["Kulak vermek → dikkat etmek, dinlemek","Eli boş dönmek → beklenen sonucu almadan geri gelmek","Ağzının payını vermek → hak ettiği cevabı söylemek","Dili tutulmak → yabancı dil bilmek"]'::jsonb,
3,'"Dili tutulmak" deyimi, şaşkınlık, korku ya da güçlü bir duygu nedeniyle konuşamamayı ifade eder. "Yabancı dil bilmek" anlamına gelmez. Diğer üç deyimin anlamı doğru verilmiştir.',2,4),

-- S5
('a0000007-0000-4000-a000-000000000007','vocabulary',
$$Metne göre deyimlerin parçalara ayrılarak anlaşılamamasının nedeni aşağıdakilerden hangisidir?$$,
'["Deyimler yalnızca şiirde kullanıldığı için","Deyimlerin anlamı, onu oluşturan sözcüklerin gerçek anlamlarının toplamından farklıdır.","Deyimler eski Türkçe sözcüklerden oluştuğu için","Deyimler yabancı dillerden alıntılandığı için"]'::jsonb,
1,'Deyimler, sözcüklerin gerçek anlamlarının toplamıyla anlaşılamaz; toplumun benimsediği mecazi anlam bütünüyle kavranmalıdır. Bu nedenle deyimler bir bütün olarak öğrenilmelidir.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 8: Deyimlerin İzi — Deyimler 2
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000008-0000-4000-a000-000000000008','vocabulary',
$$Metinde geçen "baltaya sap olmak" deyiminin anlamı aşağıdakilerden hangisidir?$$,
'["Birine yardım eli uzatmak","Başkasına alet olmak, birinin işini kolaylaştırmak için araç konumuna düşmek","Ormanda çalışmaya başlamak","Bir şeyi sertlikle kesmek"]'::jsonb,
1,'"Baltaya sap olmak" deyimi; birisinin çıkarlarına hizmet eden araç durumuna düşmeyi, başkasına alet olmayı ifade eder. Sap; baltanın tutulmasını sağlayan araçtır, bu ilişkiden mecaz anlam doğmuştur.',2,1),

-- S2
('a0000008-0000-4000-a000-000000000008','vocabulary',
$$"Pişmiş aşa su katmak" deyiminin anlamı aşağıdakilerden hangisidir?$$,
'["Yemeğe su ekleyerek lezzetini artırmak","Tamamlanmış bir işe gereksiz müdahalede bulunarak onu bozmak","Acele karar vererek hata yapmak","Yemek pişirirken dikkatli olmak"]'::jsonb,
1,'"Pişmiş aşa su katmak" deyimi; hazır ve yoluna girmiş bir işi, gereksiz müdahaleyle bozmayı ya da karıştırmayı ifade eder.',2,2),

-- S3
('a0000008-0000-4000-a000-000000000008','vocabulary',
$$"Devede kulak" deyimi hangi durumda kullanılır?$$,
'["Çok büyük ve güçlü bir varlığın yanında durunca","Bir şeyin son derece az ya da önemsiz olduğunu vurgulamak için","Deve kulağının tıbbi özelliklerini anlatmak için","İşitme duyusunun zayıflığını ifade etmek için"]'::jsonb,
1,'"Devede kulak" deyimi; devinin büyüklüğüne oranla kulağının küçük kalmasından yola çıkarak oluşturulmuştur. Büyük bir bütün içinde çok küçük kalan ya da önemsiz görülen bir şeyi anlatmak için kullanılır.',2,3),

-- S4
('a0000008-0000-4000-a000-000000000008','vocabulary',
$$Aşağıdaki deyimlerin hangisi "bir işi beceriksizce yapıp mahvetmek" anlamında kullanılır?$$,
'["Baltaya sap olmak","Devede kulak","Pişmiş aşa su katmak","Yüzüne gözüne bulaştırmak"]'::jsonb,
3,'"Yüzüne gözüne bulaştırmak" deyimi; bir işi karıştırıp allak bullak etmek, beceriksizce yaparak mahvetmek anlamındadır. Diğer seçenekler farklı anlamlar taşır.',2,4),

-- S5
('a0000008-0000-4000-a000-000000000008','vocabulary',
$$Metne göre deyimlerin doğru anlaşılması için aşağıdakilerden hangisi önemlidir?$$,
'["Deyimi oluşturan her sözcüğün sözlük anlamını bilmek","Deyimi içinde doğduğu kültür ve bağlamla birlikte öğrenmek","Deyimleri yalnızca yazılı metinlerde kullanmak","Deyimlerin hangi tarihte ortaya çıktığını araştırmak"]'::jsonb,
1,'Metin, deyimlerin yanlış bağlamda kullanıldığında anlam kargaşası yarattığını belirtmekte; deyimlerin içinde doğduğu kültür ve bağlamla öğrenilmesinin şart olduğunu vurgulamaktadır.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 9: Atalarımızdan Miras — Atasözleri
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000009-0000-4000-a000-000000000009','vocabulary',
$$"Damlaya damlaya göl olur" atasözüyle anlatılmak istenen aşağıdakilerden hangisidir?$$,
'["Yağmur yağarsa göller dolar.","Su zamanla büyük birikintiler oluşturur.","Küçük ve sürekli çabalar zamanla büyük sonuçlar doğurur.","Göl kenarında biriken damlalar tehlikelidir."]'::jsonb,
2,'Bu atasözü, küçük ama sürekli çabaların ya da birikimlerin zamanla büyük sonuçlar doğuracağını anlatmaktadır. Suyun damlayan damlalarla göl oluşturması; küçük emeklerin büyük başarılar yarattığının mecazi ifadesidir.',2,1),

-- S2
('a0000009-0000-4000-a000-000000000009','vocabulary',
$$"El eli yıkar, eller yüzü" atasözüyle anlatılmak istenen aşağıdakilerden hangisidir?$$,
'["Kişisel temizliğin önemi","Dayanışma ve karşılıklı yardımlaşmanın önemi","El yıkama alışkanlığının önemi","Yabancılardan yardım istemenin yanlışlığı"]'::jsonb,
1,'Bu atasözü; insanların birbirlerine yardım etmesiyle sonuçta herkesin kazandığını, karşılıklı dayanışmanın gücünü anlatmaktadır. "El" sözcüğü burada gerçek anlamıyla değil, kişiyi temsil etmek için mecazi biçimde kullanılmıştır.',2,2),

-- S3
('a0000009-0000-4000-a000-000000000009','vocabulary',
$$"Mum dibine ışık vermez" atasözü hangi durumu anlatır?$$,
'["Mumun ışığının sınırlı bir alana ulaşması","Karanlık ortamda mumun yetersiz kalması","Kişinin başkalarına yardım ederken kendi yakınındaki sorunlara kör kalması","Mumun çabuk yanıp bitmesi"]'::jsonb,
2,'Bu atasözü; kişinin uzaktakilere yardım ederken ya da onlara önem verirken en yakınındakileri, kendi sorunlarını görmezden geldiği durumu anlatır. Mumun kendi dibine ışık verememesi bu durumun mecazi ifadesidir.',2,3),

-- S4
('a0000009-0000-4000-a000-000000000009','vocabulary',
$$Aşağıdaki durumların hangisinde "Bugünün işini yarına bırakma" atasözü kullanılması en uygundur?$$,
'["Birinin ertesi güne plan yapması","Birinin derslerini bitirmek yerine oyun oynamayı tercih etmesi","Birinin sabah erken kalkmak istemesi","Birinin işini tam zamanında yapması"]'::jsonb,
1,'Bu atasözü, erteleme alışkanlığını eleştirir ve sorumlulukların zamanında yerine getirilmesini öğütler. Dersini bırakıp oynayan öğrenci, yapmak zorunda olduğu işi ertelemiş demektir.',2,4),

-- S5
('a0000009-0000-4000-a000-000000000009','vocabulary',
$$Metinde geçen "Sakla samanı, gelir zamanı" ile "Bugünün işini yarına bırakma" atasözleri hakkında aşağıdakilerden hangisi doğrudur?$$,
'["Her ikisi de aynı anlama gelmektedir.","Her ikisi de ertelemeyi destekler.","Farklı yaşam durumlarına rehberlik ederler; biri tutumluluğu, diğeri anlık sorumluluğu vurgular.","Her ikisi de insanlar arası ilişkiler hakkındadır."]'::jsonb,
2,'"Sakla samanı, gelir zamanı" tutumluluğu ve ileri görüşlülüğü öğütlerken "Bugünün işini yarına bırakma" sorumlulukların ertelenmemesini vurgular. İkisi çelişkili görünse de farklı hayat durumlarına ayrı ayrı ışık tutar.',2,5);


-- ══════════════════════════════════════════════════════════════
-- METİN 10: Anlam Dünyasında Bir Gezinti — Karma
-- ══════════════════════════════════════════════════════════════
INSERT INTO text_questions
  (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
-- S1
('a0000010-0000-4000-a000-000000000010','vocabulary',
$$Metne göre "kök" sözcüğünün aşağıdaki kullanımlarından hangisi terim anlamı taşımaz?$$,
'["Bitkinin kökleri toprağın derinliklerine ulaşmıştı.","Sözcüğün kök ve ekleri dilbilgisi dersinde belirlendi.","Köklü bir aileden gelen bu çocuk, çevresine güven veriyordu.","Denklemin kökleri hesaplandı."]'::jsonb,
2,'A seçeneğinde "kök" botanik terimi, B seçeneğinde dilbilgisi terimi, D seçeneğinde matematik terimi olarak kullanılmıştır. C seçeneğinde ise "köklü" sözcüğü soyun derinliğini, köklü olmayı anlatmak için mecaz anlamda kullanılmıştır; terim değildir.',3,1),

-- S2
('a0000010-0000-4000-a000-000000000010','vocabulary',
$$Metne göre "hızlı, çabuk, süratli, acele" sözcükleri birbirine yakın anlamlı olmalarına karşın yazarlar neden dikkatli seçim yapar?$$,
'["Bu sözcüklerin hepsi birbirinin tam eş anlamlısıdır; aralarında hiçbir fark yoktur.","Her biri farklı bir ton ve ritim yaratır; metne farklı etkiler katabilir.","Bu sözcükler yalnızca şiirde kullanılabilir.","Bu sözcükler arasında yalnızca hız değil, köken farkı da vardır."]'::jsonb,
1,'Metin, eş anlamlı gibi görünen sözcüklerin her birinin dile özgü ince bir ton ve ritim taşıdığını vurgular. Bu nedenle her biri metne farklı bir etki katar; deneyimli bir yazar bu farkı gözetir.',3,2),

-- S3
('a0000010-0000-4000-a000-000000000010','vocabulary',
$$Metinde geçen "Ağzı var dili yok" deyiminin anlamı aşağıdakilerden hangisidir?$$,
'["Konuşma engeli olan, dili tutuk biri","Fikrini söyleyebilecek durumda iken suçustu yakalanan biri","Konuşabilecek durumda iken susmayı tercih eden, düşüncesini dile getirmeyen biri","Çok konuşan, her konuda fikir beyan eden biri"]'::jsonb,
2,'"Ağzı var dili yok" deyimi; konuşabilecek ortam ve imkânı olduğu hâlde sesini çıkarmayan, düşüncesini ifade etmeyen birini anlatır. Fiziksel bir engelden değil, seçimden kaynaklanan suskunluğu tanımlar.',2,3),

-- S4
('a0000010-0000-4000-a000-000000000010','vocabulary',
$$"Her şeyin bir zamanı vardır" sözü aşağıdakilerden hangisini ifade eder?$$,
'["Zaman çok değerlidir ve hızlı geçer.","Her iş için uygun bir zaman vardır; aceleci davranmak bazen fırsatları kaçırır.","İnsanlar her zaman doğru zamanda hareket eder.","Zamanı iyi kullanmak başarının tek yoludur."]'::jsonb,
1,'Bu söz, her iş için uygun bir zamanın olduğunu; aceleci ya da erken davranmanın bazen olumsuz sonuçlar doğurabileceğini öğütler. Sabırlı olmayı ve zamanlamayı doğru ayarlamayı vurgular.',2,4),

-- S5
('a0000010-0000-4000-a000-000000000010','vocabulary',
$$Metne göre bir sözcüğü tam olarak kavramak için aşağıdakilerden hangisi yeterli değildir?$$,
'["Sözcüğün sözlükteki kuru tanımını bilmek","Sözcüğü kullanan toplumun bağlamını anlamak","Sözcüğün tarihsel sürecini incelemek","Sözcüğün kültürel bağlamını kavramak"]'::jsonb,
0,'Metin, sözcükleri yalnızca sözlükteki kuru tanımıyla değil; toplumun bağlamı, tarihi ve kültürüyle birlikte tanımak gerektiğini vurgular. Sözlük tanımı tek başına yeterli değildir.',3,5);


-- Migration 041: LGS Türkçe – Cümlede Anlam (10 metin, 50 soru)
-- Kapsam: Amaç-Sonuç, Neden-Sonuç, Koşul, Karşılaştırma, Öznellik, Nesnellik, Dolaylı Anlatım, Karma

DO $migration$
BEGIN

-- ─── TEXT 1: Amaç-Sonuç Cümleleri ──────────────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000001-0000-4000-b000-000000000001',
  'Amaç ve Sonuç İlişkisi',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  2,
  290,
  3,
  $body1$
İnsanlar hayatları boyunca pek çok farklı amaç için çeşitli eylemler gerçekleştirirler. Bu eylemlerin arkasında mutlaka bir niyet, bir hedef ya da ulaşmak istenen bir sonuç bulunur. Dilde de aynı durum geçerlidir; cümleler bazen bir amacı anlatmak, bazen bir sonucu bildirmek için kurulur.

Amaç bildiren cümleler genellikle "için", "amacıyla", "diye", "maksadıyla" gibi bağlaçlarla kurulur. Örneğin "Sağlıklı olmak için her gün spor yapıyorum." cümlesinde sporun amacı sağlıklı olmaktır. Burada eylem ile amaç arasında bilinçli bir bağ kurulmuştur.

Sonuç bildiren cümleler ise bir eylemin doğurduğu durumu anlatır. "Çok çalıştığı için sınavı geçti." cümlesinde çalışmak eyleminin sonucu sınavı geçmektir. Bu yapılarda sebep ile sonuç arasında zorunlu ya da doğal bir bağ söz konusudur.

Öğrenciler bu iki yapıyı zaman zaman birbirine karıştırır. Amaç cümlelerinde özne bir şeyi yapmayı hedefler ve o doğrultuda hareket eder; sonuç henüz gerçekleşmemiş olabilir. Sonuç cümlelerinde ise eylem zaten tamamlanmış ve bir çıktı ortaya çıkmıştır.

LGS sınavlarında bu iki anlam ilişkisi sıkça sorulur. Cümleyi dikkatle okumak, bağlacın hangi işlev üstlendiğini anlamak gerekir. "Ders çalıştım, sınavı kazandım." cümlesinde neden-sonuç ilişkisi vardır; ama "Sınavı kazanmak için ders çalıştım." cümlesinde amaç-eylem ilişkisi öne çıkar.

Bu ayrımı kavramak, hem anlama hem de anlatım becerilerini geliştirir. Yazarken amaçlarımızı net ifade edebilmek, okurken ise yazarın kastını doğru yorumlayabilmek için bu yapıları iyi tanımak gerekir. Türkçemizin zengin bağlaç kadrosu bu ilişkileri çok çeşitli biçimlerde kurmamıza olanak tanır.
  $body1$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000001-0000-4000-b000-000000000001',
  'detail',
  '"Sağlıklı olmak için her gün spor yapıyorum." cümlesinde hangi anlam ilişkisi vardır?',
  '["Neden-sonuç", "Amaç-eylem", "Koşul-sonuç", "Karşılaştırma"]'::jsonb,
  1,
  'Cümlede "için" bağlacı bir amacı ifade eder: sporun amacı sağlıklı olmaktır. Bu nedenle amaç-eylem ilişkisi vardır.',
  2,
  1
),
(
  'b0000001-0000-4000-b000-000000000001',
  'detail',
  '"Çok çalıştığı için sınavı geçti." cümlesinde vurgulanan anlam ilişkisi nedir?',
  '["Amaç-eylem", "Koşul-sonuç", "Neden-sonuç", "Karşılaştırma"]'::jsonb,
  2,
  'Çalışmak eylemi bir sonuca yol açmıştır: sınavı geçmek. Bu neden-sonuç ilişkisidir.',
  2,
  2
),
(
  'b0000001-0000-4000-b000-000000000001',
  'inference',
  'Metne göre amaç cümlelerinin sonuç cümlelerinden farkı nedir?',
  '["Amaç cümlelerinde eylem zaten tamamlanmıştır.", "Amaç cümlelerinde sonuç henüz gerçekleşmemiş olabilir.", "Amaç cümlelerinde bağlaç kullanılmaz.", "Amaç cümlelerinde özne belirsizdir."]'::jsonb,
  1,
  'Metinde belirtildiğine göre amaç cümlelerinde özne bir şeyi hedefler ve o doğrultuda hareket eder; sonuç henüz gerçekleşmemiş olabilir.',
  3,
  3
),
(
  'b0000001-0000-4000-b000-000000000001',
  'detail',
  'Amaç bildiren cümlelerde hangi bağlaçlar kullanılır?',
  '["için, amacıyla, diye, maksadıyla", "ama, fakat, lakin, ne var ki", "çünkü, zira, nitekim, dolayısıyla", "eğer, şayet, -se, -sa"]'::jsonb,
  0,
  'Metinde amaç bildiren cümlelerde "için, amacıyla, diye, maksadıyla" gibi bağlaçların kullanıldığı belirtilmiştir.',
  2,
  4
),
(
  'b0000001-0000-4000-b000-000000000001',
  'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Türkçedeki bağlaçların tarihsel gelişimi", "Cümlelerde amaç ve sonuç anlam ilişkilerinin farkı", "LGS sınavında çıkan Türkçe konuları", "Sporun sağlık üzerindeki etkileri"]'::jsonb,
  1,
  'Metin, cümlelerdeki amaç ve sonuç anlam ilişkilerini açıklamakta ve ikisi arasındaki farkı ortaya koymaktadır.',
  2,
  5
);

-- ─── TEXT 2: Neden-Sonuç Cümleleri ─────────────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000002-0000-4000-b000-000000000002',
  'Neden ve Sonuç Bağlantısı',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  2,
  285,
  3,
  $body2$
Dilde neden-sonuç ilişkisi, bir olayın ya da durumun başka bir olayı ya da durumu doğurması anlamına gelir. Bu ilişki günlük konuşmalardan bilimsel metinlere kadar her yerde karşımıza çıkar. İnsanlar olaylar arasındaki bağı açıklarken çoğunlukla neden-sonuç cümlelerini kullanır.

Bu tür cümleler genellikle "çünkü", "zira", "bu nedenle", "bu yüzden", "dolayısıyla", "onun için" gibi bağlaçlarla kurulur. Örneğin "Hava soğuktu, bu yüzden mont giydim." cümlesinde soğuk hava nedendir, mont giymek ise sonuçtur. Neden ile sonuç arasındaki bağ mantıksal ve doğaldır.

Neden bazen cümlenin başında, bazen ortasında, bazen de sonunda yer alabilir. "Hasta olduğu için okula gitmedi." cümlesinde neden öne alınmıştır. "Okula gitmedi; çünkü hasta olmuştu." cümlesinde ise neden sona bırakılmıştır. Her iki yapıda da anlam aynıdır.

Öğrenciler neden-sonuç ilişkisini tanımak için şu soruyu sorabilir: "Bu durum neden gerçekleşti?" Cevap cümlede açıkça veriliyorsa neden-sonuç ilişkisi vardır. "Sınıfı kazandım." cümlesinde neden bildirilmemişken "Çok çalıştığım için sınıfı kazandım." cümlesinde neden açıkça ortadadır.

Neden-sonuç ilişkisi bazen zincirleme biçimde de kurulabilir. Bir olayın sonucu başka bir olayın nedeni olabilir. Örneğin "Yağmur yağdı, toprak ıslandı, çiçekler açtı." cümlesinde üç halka birbiriyle bağlıdır.

Bu yapıyı iyi kavramak hem metin anlama hem de yazma becerisi açısından son derece önemlidir. LGS sınavlarında neden-sonuç ilişkisi taşıyan cümleleri tanıma ve bu cümleleri diğer anlam ilişkilerinden ayırt etme sıkça sorulan bir beceridir. Dikkatli bir okuma ile bu ilişkiyi kolayca yakalamak mümkündür.
  $body2$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000002-0000-4000-b000-000000000002',
  'detail',
  '"Hava soğuktu, bu yüzden mont giydim." cümlesinde neden-sonuç ilişkisi nasıl kurulmuştur?',
  '["Mont giymek nedendir, soğuk hava sonuçtur.", "Soğuk hava nedendir, mont giymek sonuçtur.", "Her iki olay da sonuçtur.", "Cümlede neden-sonuç ilişkisi yoktur."]'::jsonb,
  1,
  'Soğuk hava durumun nedenidir; bu durumun sonucunda mont giyilmiştir.',
  2,
  1
),
(
  'b0000002-0000-4000-b000-000000000002',
  'detail',
  'Neden-sonuç ilişkisini belirlemek için öğrencilere önerilen soru nedir?',
  '["Bu durum nasıl gerçekleşti?", "Bu durum ne zaman gerçekleşti?", "Bu durum neden gerçekleşti?", "Bu durum nerede gerçekleşti?"]'::jsonb,
  2,
  'Metinde öğrencilerin "Bu durum neden gerçekleşti?" sorusunu sormaları gerektiği belirtilmiştir.',
  2,
  2
),
(
  'b0000002-0000-4000-b000-000000000002',
  'inference',
  '"Yağmur yağdı, toprak ıslandı, çiçekler açtı." cümlesindeki ilişki nasıl tanımlanmaktadır?',
  '["Tek nedenli basit ilişki", "Zincirleme neden-sonuç ilişkisi", "Karşılaştırma ilişkisi", "Amaç-sonuç ilişkisi"]'::jsonb,
  1,
  'Metinde bu cümle için "zincirleme" ifadesi kullanılmış; bir olayın sonucunun başka bir olayın nedeni olduğu açıklanmıştır.',
  3,
  3
),
(
  'b0000002-0000-4000-b000-000000000002',
  'detail',
  'Neden-sonuç ilişkisi bildiren bağlaçlar hangi seçenekte doğru verilmiştir?',
  '["için, amacıyla, diye", "çünkü, zira, bu nedenle, dolayısıyla", "eğer, şayet, -se/-sa", "ama, fakat, oysa, ne var ki"]'::jsonb,
  1,
  'Metinde neden-sonuç cümlelerinde "çünkü, zira, bu nedenle, bu yüzden, dolayısıyla" bağlaçlarının kullanıldığı belirtilmiştir.',
  2,
  4
),
(
  'b0000002-0000-4000-b000-000000000002',
  'main_idea',
  'Bu metinde ağırlıklı olarak ele alınan konu nedir?',
  '["Türkçe bağlaçların kökeni", "Neden-sonuç ilişkisinin tanımı ve cümledeki görünümü", "Zincirleme olayların doğa üzerindeki etkisi", "LGS sınavında çıkan tüm anlam ilişkileri"]'::jsonb,
  1,
  'Metin boyunca neden-sonuç ilişkisi tanımlanmış, örneklenmiş ve nasıl fark edileceği açıklanmıştır.',
  2,
  5
);

-- ─── TEXT 3: Koşul Cümleleri ────────────────────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000003-0000-4000-b000-000000000003',
  'Koşul İfadeleri ve Cümle Yapısı',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  2,
  288,
  3,
  $body3$
Koşul cümleleri, bir olayın ya da eylemin gerçekleşebilmesi için başka bir koşulun yerine getirilmesi gerektiğini anlatan yapılardır. Bu cümlelerde bir şart öne sürülür ve bu şart yerine getirildiğinde ya da getirilmediğinde belirli bir sonucun ortaya çıkacağı bildirilir.

Türkçede koşul cümleleri genellikle "-se/-sa" eki, "eğer", "şayet", "bir kez" gibi ifadelerle kurulur. Örneğin "Eğer erken kalkarsan treni kaçırmazsın." cümlesinde erken kalkmak koşulun yerine getirilmesidir; treni kaçırmamak ise bu koşulun sonucudur. Koşul gerçekleşirse sonuç da gerçekleşir.

Koşul cümleleri olumlu ya da olumsuz biçimde kurulabilir. "Sıkı çalışırsan başarırsın." olumlu koşul; "Dikkat etmezsen düşersin." ise olumsuz koşul cümlesidir. Her iki yapıda da koşul ile sonuç arasında bir bağ kurulmuştur.

Bu cümle yapısı özellikle uyarı, tavsiye ve öneri bildiren metinlerde sıkça karşılaşılır. Trafik kuralları, sağlık bilgileri, eğitim tavsiyeleri gibi alanlarda koşul cümlelerine bol miktarda rastlanır. "Emniyet kemeri takmazsanız ceza ödersiniz." cümlesi hem bir uyarı hem de bir koşul cümlesidir.

LGS sınavlarında öğrencilerden koşul ilişkisi taşıyan cümleleri tanımaları ve bu cümlelerdeki anlam ilişkisini doğru adlandırmaları beklenir. Koşul cümlelerini neden-sonuç ya da amaç cümlelerinden ayırt edebilmek için "şart gerçekleşirse ne olur?" sorusunu sormak yeterlidir. Cevap cümlede verilmişse koşul-sonuç ilişkisi söz konusudur.

Koşul cümleleri gelecek zamana yönelik tahminler, planlar ve olasılıklar için de kullanılır. Dil bilincinin gelişmesiyle birlikte bu yapıları doğru kullanmak hem yazılı hem sözlü anlatımı güçlendirir.
  $body3$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000003-0000-4000-b000-000000000003',
  'detail',
  '"Eğer erken kalkarsan treni kaçırmazsın." cümlesinde koşul nedir?',
  '["Treni kaçırmamak", "Erken kalkmak", "Tren yolculuğu yapmak", "Geç kalmak"]'::jsonb,
  1,
  'Cümlede "eğer erken kalkarsan" bölümü koşuldur; bu koşul gerçekleşirse treni kaçırmama sonucu ortaya çıkacaktır.',
  2,
  1
),
(
  'b0000003-0000-4000-b000-000000000003',
  'detail',
  'Koşul cümlelerini anlamak için sorulması önerilen soru nedir?',
  '["Olay neden gerçekleşti?", "Olay ne zaman gerçekleşti?", "Şart gerçekleşirse ne olur?", "Olay kim tarafından gerçekleştirildi?"]'::jsonb,
  2,
  'Metinde koşul cümlelerini anlamak için "şart gerçekleşirse ne olur?" sorusunun sorulması gerektiği belirtilmiştir.',
  2,
  2
),
(
  'b0000003-0000-4000-b000-000000000003',
  'inference',
  'Aşağıdakilerden hangisi koşul cümlesi değildir?',
  '["Erken yatarsan dinlenmiş kalkarsın.", "Bol su içersen sağlıklı olursun.", "Çok çalıştığı için sınavı kazandı.", "Dikkat etmezsen düşersin."]'::jsonb,
  2,
  '"Çok çalıştığı için sınavı kazandı." cümlesinde "için" bağlacıyla neden-sonuç ilişkisi kurulmuştur; bu bir koşul cümlesi değildir.',
  3,
  3
),
(
  'b0000003-0000-4000-b000-000000000003',
  'detail',
  'Metne göre koşul cümleleri hangi tür metinlerde sıkça kullanılır?',
  '["Şiir ve masal", "Trafik kuralları, sağlık bilgileri, eğitim tavsiyeleri", "Tarihî belgeler ve resmî yazılar", "Roman ve hikâye"]'::jsonb,
  1,
  'Metinde trafik kuralları, sağlık bilgileri ve eğitim tavsiyeleri gibi alanlarda koşul cümlelerine sıkça rastlandığı belirtilmiştir.',
  2,
  4
),
(
  'b0000003-0000-4000-b000-000000000003',
  'main_idea',
  'Bu metnin ana fikri nedir?',
  '["Koşul cümlelerinin yalnızca uyarı metinlerinde kullanıldığı", "Koşul cümlelerinin yapısı, işlevi ve diğer cümle türlerinden farkı", "Türkçe eklerinin tarihsel değişimi", "LGS sınavında çıkan tüm Türkçe konuları"]'::jsonb,
  1,
  'Metin, koşul cümlelerinin ne olduğunu, nasıl yapıldığını ve diğer anlam ilişkilerinden nasıl ayrıldığını açıklamaktadır.',
  2,
  5
);

-- ─── TEXT 4: Karşılaştırma Cümleleri ────────────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000004-0000-4000-b000-000000000004',
  'Karşılaştırma Yoluyla Anlam',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  2,
  292,
  3,
  $body4$
Karşılaştırma, iki ya da daha fazla varlık, kavram ya da durumun benzerlik ya da farklılıklarını ortaya koymak amacıyla kullanılan bir anlatım biçimidir. Dilde karşılaştırma cümleleri, okuyucuya ya da dinleyiciye iki şey arasındaki ilişkiyi daha açık bir biçimde sunmayı sağlar.

Karşılaştırma cümleleri genellikle "daha", "-den/-dan daha", "kadar", "oranla", "kıyasla", "gibi", "yerine" gibi ifadeler içerir. Örneğin "Bu kitap ötekine kıyasla çok daha sürükleyici." cümlesinde iki kitap karşılaştırılmış ve biri daha üstün bulunmuştur. "Ahmet, Mehmet kadar dikkatli değil." cümlesinde ise iki kişi arasında dikkat açısından bir fark vurgulanmıştır.

Karşılaştırma yalnızca iki şeyin birbirine eşit olmadığını değil, eşit olduğunu da gösterebilir. "Ayşe, ablası kadar uzun boylu." cümlesi eşitlik ilişkisi kurarken "Bu yol ötekinden daha kısa." cümlesi üstünlük ilişkisi kurmaktadır.

LGS sınavlarında karşılaştırma içeren cümleleri tanımak için şu ipucu yardımcı olur: Cümlede iki ya da daha fazla unsur varsa ve bunlar belirli bir ölçüt açısından değerlendiriliyorsa karşılaştırma söz konusudur. "Demir, tahta kadar hafif değildir." cümlesinde malzeme ve ağırlık bakımından bir karşılaştırma yapılmaktadır.

Karşılaştırma cümleleri, düşünceyi somutlaştırmak ve soyut kavramları anlaşılır kılmak için oldukça etkilidir. Bilimsel yazılar, eleştiri metinleri ve günlük konuşmalar bu yapıyı yoğun biçimde kullanır.

Aynı zamanda karşılaştırma, bir konu hakkında değerlendirme yapıldığına işaret eder. Okurken karşılaştırma içeren cümleleri fark edebilmek, metni daha derinlemesine anlamayı sağlar ve sınav sorularında isabetli yanıt vermeye yardımcı olur.
  $body4$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000004-0000-4000-b000-000000000004',
  'detail',
  '"Bu kitap ötekine kıyasla çok daha sürükleyici." cümlesinde hangi anlam ilişkisi vardır?',
  '["Neden-sonuç", "Koşul-sonuç", "Karşılaştırma", "Amaç-eylem"]'::jsonb,
  2,
  '"Kıyasla" ve "daha" sözcükleri iki kitap arasında bir karşılaştırma yapıldığını göstermektedir.',
  2,
  1
),
(
  'b0000004-0000-4000-b000-000000000004',
  'detail',
  '"Ayşe, ablası kadar uzun boylu." cümlesindeki anlam ilişkisi nedir?',
  '["Üstünlük karşılaştırması", "Eşitlik karşılaştırması", "Karşıtlık", "Koşul"]'::jsonb,
  1,
  'Cümlede "kadar" sözcüğü eşitlik karşılaştırması kurmaktadır; iki kişinin boyu eşit gösterilmektedir.',
  2,
  2
),
(
  'b0000004-0000-4000-b000-000000000004',
  'inference',
  'Metne göre karşılaştırma cümlelerini anlamak için hangi ipucu verilmiştir?',
  '["Cümlede \"çünkü\" bağlacı aranmalıdır.", "Cümlede iki ya da daha fazla unsur bir ölçüt açısından değerlendirilmelidir.", "Cümle olumlu ya da olumsuz yapıda kurulmalıdır.", "Cümlede mutlaka \"daha\" sözcüğü geçmelidir."]'::jsonb,
  1,
  'Metinde, cümlede iki ya da daha fazla unsur varsa ve bunlar belirli bir ölçüt açısından değerlendiriliyorsa karşılaştırma söz konusu olduğu belirtilmiştir.',
  3,
  3
),
(
  'b0000004-0000-4000-b000-000000000004',
  'detail',
  'Aşağıdaki ifadelerden hangisi karşılaştırma cümlesinde kullanılmaz?',
  '["daha, oranla, kıyasla", "kadar, gibi, yerine", "çünkü, zira, bu nedenle", "-den/-dan daha"]'::jsonb,
  2,
  '"Çünkü, zira, bu nedenle" neden-sonuç bağlaçlarıdır ve karşılaştırma cümlelerinde kullanılmaz.',
  2,
  4
),
(
  'b0000004-0000-4000-b000-000000000004',
  'main_idea',
  'Bu metnin ana konusu aşağıdakilerden hangisidir?',
  '["Eşdeğer anlamlı sözcüklerin bulunması", "Karşılaştırma cümlelerinin yapısı ve anlam ilişkisi", "Türkçede zıt anlamlı sözcüklerin kullanımı", "Bilimsel metinlerde dil özellikleri"]'::jsonb,
  1,
  'Metin boyunca karşılaştırma cümlelerinin ne olduğu, nasıl kurulduğu ve nasıl tanınacağı anlatılmıştır.',
  2,
  5
);

-- ─── TEXT 5: Öznel Yargı İçeren Cümleler ───────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000005-0000-4000-b000-000000000005',
  'Öznel Yargının Dile Yansıması',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  3,
  295,
  3,
  $body5$
Dilde öznel yargı, konuşanın ya da yazanın kişisel görüşünü, beğenisini, duygusunu ya da değerlendirmesini yansıtan ifadeleri kapsar. Bu ifadeler kişiden kişiye değişebilir; herkesin aynı şekilde doğrulayamayacağı, tartışmaya açık nitelikteki yargılardır.

Öznel cümleler genellikle "güzel", "çirkin", "zor", "kolay", "iyi", "kötü", "sıkıcı", "heyecanlı" gibi değer yüklü sıfatlar içerir. Ayrıca "sanırım", "bence", "kanımca", "zannederim" gibi kişisel yorum ifadeleri de öznel yargının belirtisidir. Örneğin "Bu film son yılların en iyi yapımıdır." cümlesi tamamen öznel bir değerlendirmedir; herkes aynı kanıda olmayabilir.

Öznel yargı içeren cümleleri tanımak için şu test uygulanabilir: Cümle insandan insana farklı yanıt üretiyorsa özneldir. "Bu yemek lezzetlidir." dediğimizde herkes aynı fikirde olmayabilir; bu nedenle cümle özneldir.

LGS sınavlarında öznel yargı soruları sıkça karşılaşılan sorular arasındadır. Öğrencilerden genellikle öznel yargı içeren cümleyi dört seçenek arasından bulmaları istenir. Bu sorularda dikkat edilmesi gereken nokta, cümlenin ölçülüp ölçülemeyeceği ya da doğrulanıp doğrulanamayacağıdır.

Öznel yargılar bir kişinin iç dünyasını, estetik anlayışını ve kişisel deneyimini yansıtır. Eleştiri yazıları, günlükler, kişisel denemeler öznel yargılarla doludur. Bu metinlerde yazarın bakış açısı ön plana çıkar.

Öznel yargıyı nesnel yargıdan ayırt edebilmek, metin okuma becerisi açısından temel bir beceridir. Bir cümlede "kanımca", "bence", "sanırım" gibi ifadeler yoksa bile içeriğin kişisel bir değerlendirme olup olmadığına bakarak karar vermek gerekir.
  $body5$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000005-0000-4000-b000-000000000005',
  'detail',
  'Aşağıdakilerden hangisi öznel yargı içeren bir cümledir?',
  '["İstanbul, Türkiye''nin en kalabalık şehridir.", "Bu romanı okuyan herkes çok etkilenir.", "Nil Nehri, dünyanın en uzun nehirlerinden biridir.", "Su, 100 derecede kaynar."]'::jsonb,
  1,
  '"Bu romanı okuyan herkes çok etkilenir." cümlesi kişiden kişiye farklılık gösterebilecek öznel bir değerlendirmedir; herkes aynı şekilde etkilenmeyebilir.',
  3,
  1
),
(
  'b0000005-0000-4000-b000-000000000005',
  'detail',
  'Öznel yargı içeren cümleleri tanımak için kullanılan test nedir?',
  '["Cümle geçmiş zamana mı atıfta bulunuyor?", "Cümle insandan insana farklı yanıt üretiyor mu?", "Cümlede fiil var mı?", "Cümle olumlu mu kuruluyor?"]'::jsonb,
  1,
  'Metinde, cümle insandan insana farklı yanıt üretiyorsa öznel olduğu belirtilmiştir.',
  2,
  2
),
(
  'b0000005-0000-4000-b000-000000000005',
  'detail',
  'Hangi sözcükler öznel yargının belirtisi olarak sayılmıştır?',
  '["çünkü, zira, dolayısıyla", "eğer, şayet, -se/-sa", "sanırım, bence, kanımca, zannederim", "daha, kadar, oranla"]'::jsonb,
  2,
  'Metinde "sanırım, bence, kanımca, zannederim" ifadelerinin kişisel yorum bildiren öznel yargı göstergeleri olduğu açıklanmıştır.',
  2,
  3
),
(
  'b0000005-0000-4000-b000-000000000005',
  'inference',
  'Metne göre öznel yargıların en fazla hangi tür metinlerde yer aldığı söylenmiştir?',
  '["Bilimsel makaleler ve ansiklopediler", "Haber metinleri ve raporlar", "Eleştiri yazıları, günlükler, kişisel denemeler", "Yasal düzenlemeler ve yönetmelikler"]'::jsonb,
  2,
  'Metinde eleştiri yazıları, günlükler ve kişisel denemelerin öznel yargılarla dolu olduğu belirtilmiştir.',
  2,
  4
),
(
  'b0000005-0000-4000-b000-000000000005',
  'main_idea',
  'Bu metnin ana amacı nedir?',
  '["Türk edebiyatındaki eleştiri geleneğini açıklamak", "Öznel yargının ne olduğunu ve nasıl tanınacağını açıklamak", "Nesnel yargıların bilimsel metinlerdeki önemini vurgulamak", "LGS sınavı için tüm anlam ilişkilerini listelemek"]'::jsonb,
  1,
  'Metin boyunca öznel yargının tanımı, özellikleri, göstergeleri ve nasıl tanınacağı ele alınmıştır.',
  2,
  5
);

-- ─── TEXT 6: Nesnel Yargı İçeren Cümleler ──────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000006-0000-4000-b000-000000000006',
  'Nesnellik ve Doğrulanabilir Bilgi',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  3,
  293,
  3,
  $body6$
Nesnel yargı, kişisel görüşten bağımsız, ölçülebilir, kanıtlanabilir ya da doğrulanabilir bilgiler içeren ifadeleri kapsar. Nesnel cümleler herkes tarafından aynı şekilde kabul edilebilecek gerçekleri bildirir. Bu cümlelerde yazarın ya da konuşanın duygu ve beğenisine yer yoktur.

Nesnel cümleler genellikle sayılar, istatistikler, tarihler, ölçülebilir nitelikler ve bilimsel veriler içerir. "Ankara, Türkiye Cumhuriyeti''nin başkentidir." ya da "Işık saniyede yaklaşık 300.000 kilometre yol alır." gibi ifadeler nesneldir; çünkü bu bilgiler herkes tarafından doğrulanabilir.

Nesnel yargıyı öznel yargıdan ayırmanın en pratik yolu şudur: Cümle bir ölçüm aracıyla ya da güvenilir bir kaynakla doğrulanabiliyorsa nesneldir. "Bu odanın sıcaklığı 22 derecedir." cümlesi termometreyle doğrulanabildiğinden nesneldir. Oysa "Bu oda çok sıcak." cümlesi kişiden kişiye değişebileceğinden özneldir.

LGS sınavlarında öğrencilerden nesnel yargı içeren cümleleri diğerlerinden ayırt etmeleri beklenir. Özellikle dört seçenek arasından "hangi cümle nesnel yargı içerir?" ya da "hangi cümle kanıtlanabilir?" biçiminde sorular sorulur. Bu tür sorularda sayı, ölçü ve tanımlama içeren seçenekler büyük olasılıkla nesnel yargıdır.

Nesnel dil bilim ve gazetecilik alanlarında temel bir gereksinimdir. Bilimsel makaleler, haber metinleri ve ansiklopedi maddeleri nesnel bir dille yazılmalıdır; çünkü bu metinlerin amacı okuyucuya doğrulanabilir bilgi sunmaktır.

Öznel ve nesnel yargı arasındaki farkı iyi kavramak, bir metni doğru okumak ve değerlendirmek için temel bir beceridir. Bu beceri aynı zamanda eleştirel düşünce ve medya okuryazarlığının da vazgeçilmez bir parçasıdır.
  $body6$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000006-0000-4000-b000-000000000006',
  'detail',
  'Aşağıdakilerden hangisi nesnel yargı içeren bir cümledir?',
  '["Bu film son yılların en güzel yapımıdır.", "Işık saniyede yaklaşık 300.000 kilometre yol alır.", "Bugünkü yemek olağanüstü lezzetliydi.", "Bence bu şarkı sıkıcı."]'::jsonb,
  1,
  '"Işık saniyede yaklaşık 300.000 kilometre yol alır." cümlesi bilimsel bir gerçek olup herkes tarafından doğrulanabilir; bu nedenle nesnel yargıdır.',
  2,
  1
),
(
  'b0000006-0000-4000-b000-000000000006',
  'detail',
  'Metne göre nesnel yargıyı öznel yargıdan ayırmanın en pratik yolu nedir?',
  '["Cümlede sıfat olup olmadığına bakmak", "Cümlenin olumlu ya da olumsuz kurulduğuna bakmak", "Cümlenin bir ölçüm aracı ya da güvenilir kaynakla doğrulanabilir olup olmadığına bakmak", "Cümlede bağlaç olup olmadığına bakmak"]'::jsonb,
  2,
  'Metinde, cümle bir ölçüm aracıyla ya da güvenilir bir kaynakla doğrulanabiliyorsa nesnel olduğu belirtilmiştir.',
  2,
  2
),
(
  'b0000006-0000-4000-b000-000000000006',
  'inference',
  '"Bu oda çok sıcak." cümlesinin öznel olduğu nasıl anlaşılır?',
  '["Cümlede fiil yoktur.", "Kişiden kişiye değişebilecek bir yargı içermektedir.", "Cümle geçmiş zamanda kurulmuştur.", "Cümlede sayı ve ölçü birimi vardır."]'::jsonb,
  1,
  'Metinde "bu oda çok sıcak" cümlesinin kişiden kişiye değişebileceği için öznel olduğu açıklanmıştır.',
  3,
  3
),
(
  'b0000006-0000-4000-b000-000000000006',
  'detail',
  'Hangi tür metinler nesnel bir dille yazılmalıdır?',
  '["Masallar ve destanlar", "Günlükler ve anı kitapları", "Bilimsel makaleler, haber metinleri ve ansiklopedi maddeleri", "Şiirler ve eleştiriler"]'::jsonb,
  2,
  'Metinde bilimsel makaleler, haber metinleri ve ansiklopedi maddelerinin nesnel dille yazılması gerektiği belirtilmiştir.',
  2,
  4
),
(
  'b0000006-0000-4000-b000-000000000006',
  'main_idea',
  'Bu metinde ağırlıklı olarak neler anlatılmaktadır?',
  '["Gazetecilik mesleğinin gereklilikleri", "Nesnel yargının tanımı, özellikleri ve öznel yargıdan farkı", "Bilim insanlarının çalışma yöntemi", "Türkçede ölçü birimlerinin kullanımı"]'::jsonb,
  1,
  'Metin boyunca nesnel yargının ne olduğu, nasıl tanınacağı ve öznel yargıdan farkı açıklanmıştır.',
  2,
  5
);

-- ─── TEXT 7: Dolaylı Anlatım ────────────────────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000007-0000-4000-b000-000000000007',
  'Dolaylı Anlatım ve Aktarma',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  3,
  287,
  3,
  $body7$
Dolaylı anlatım, birinin sözlerinin ya da düşüncelerinin başka bir kişi tarafından kendi anlatımına uyarlanarak aktarılması demektir. Söylenen söz ya da düşünce olduğu gibi aktarılmaz; aksine anlatıcının bakış açısından yeniden biçimlendirilerek verilir.

Türkçede dolaylı anlatım genellikle "-dığını/-diğini", "-acağını/-eceğini", "-ması gerektiğini", "söyledi", "düşündü", "belirtti", "ifade etti" gibi yapılarla kurulur. Örneğin "Ali, sınavı kazandığını söyledi." cümlesinde Ali''nin sözleri dolaylı olarak aktarılmıştır; doğrudan aktarımda ise şöyle olurdu: "Ali ''Sınavı kazandım.'' dedi."

Dolaylı anlatımda birinci ve ikinci kişi zamirleri üçüncü kişiye dönüşür. "Ben geleceğim." doğrudan anlatımı dolaylıya çevrildiğinde "Geleceğini söyledi." hâlini alır. Bu dönüşüm sırasında zaman ekleri de değişebilir.

LGS sınavlarında dolaylı anlatım içeren cümleleri tanıma ve bu cümleleri doğrudan anlatımdan ayırt etme sıkça sorulmaktadır. Özellikle "Aşağıdaki cümlelerden hangisi dolaylı anlatım içermektedir?" biçiminde sorular karşımıza çıkar.

Dolaylı anlatım günlük dilde oldukça yaygındır. Bir haber metninde "Yetkili, önlemlerin alındığını belirtti." ya da "Bilim insanları iklim değişikliğinin hızlandığını açıkladı." gibi cümleler dolaylı aktarıma örnektir.

Bu yapıyı doğru kavramak hem okuma anlama hem de yazma becerisi açısından önemlidir. Özellikle aktarma ve alıntı yapma gerektiren metinlerde dolaylı anlatımı doğru kullanmak anlatımı güçlendirir ve metnin akışını sağlar. Dil bilincinin gelişmesiyle birlikte bu yapı kendiliğinden doğru kullanılmaya başlanır.
  $body7$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000007-0000-4000-b000-000000000007',
  'detail',
  'Aşağıdakilerden hangisi dolaylı anlatım içeren bir cümledir?',
  '["''Bugün hava güzel.'' dedi.", "Hava bugün gerçekten güzel.", "Öğretmen, dersin yarın yapılacağını söyledi.", "Hava güzel olduğu için dışarı çıktım."]'::jsonb,
  2,
  '"Öğretmen, dersin yarın yapılacağını söyledi." cümlesinde öğretmenin sözleri "-acağını söyledi" yapısıyla dolaylı olarak aktarılmaktadır.',
  2,
  1
),
(
  'b0000007-0000-4000-b000-000000000007',
  'detail',
  '"Ben geleceğim." cümlesi dolaylı anlatıma çevrildiğinde nasıl olur?',
  '["''Ben geleceğim.'' dedi.", "Geleceğini söyledi.", "Geldi.", "Ben geleceğim diye düşündü."]'::jsonb,
  1,
  'Dolaylı anlatımda birinci kişi zamirleri üçüncü kişiye dönüşür; "Ben geleceğim." → "Geleceğini söyledi."',
  3,
  2
),
(
  'b0000007-0000-4000-b000-000000000007',
  'inference',
  'Dolaylı anlatımda doğrudan anlatımdan farklı olarak ne değişir?',
  '["Anlatımın konusu değişir.", "Kişi zamirleri ve zaman ekleri değişebilir.", "Cümle yalnızca olumlu yapıya geçer.", "Yüklem tamamen kaldırılır."]'::jsonb,
  1,
  'Metinde dolaylı anlatımda birinci ve ikinci kişi zamirlerinin üçüncü kişiye dönüştüğü ve zaman eklerinin de değişebileceği belirtilmiştir.',
  3,
  3
),
(
  'b0000007-0000-4000-b000-000000000007',
  'detail',
  'Dolaylı anlatım cümleleri hangi yapılarla kurulur?',
  '["için, amacıyla, diye", "ama, fakat, oysa", "-dığını/-diğini söyledi, belirtti, ifade etti", "eğer, şayet, -se/-sa"]'::jsonb,
  2,
  'Metinde dolaylı anlatımın "-dığını/-diğini", "söyledi", "belirtti", "ifade etti" gibi yapılarla kurulduğu açıklanmıştır.',
  2,
  4
),
(
  'b0000007-0000-4000-b000-000000000007',
  'main_idea',
  'Bu metnin konusu nedir?',
  '["Türkçede alıntı işaretlerinin kullanımı", "Dolaylı anlatımın tanımı, yapısı ve diğer anlatım biçimlerinden farkı", "Gazetecilik dilinde nesnel anlatım", "LGS sınavında metin soruları"]'::jsonb,
  1,
  'Metin, dolaylı anlatımın ne olduğunu, nasıl kurulduğunu ve doğrudan anlatımdan nasıl ayrıldığını kapsamlı biçimde ele almaktadır.',
  2,
  5
);

-- ─── TEXT 8: Koşul + Amaç Karma ─────────────────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000008-0000-4000-b000-000000000008',
  'Koşul ve Amaç Cümlelerinde Anlam',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  3,
  291,
  3,
  $body8$
Türkçede bir cümle bazen birden fazla anlam ilişkisi taşıyabilir ya da birbiriyle yakın ilişkili anlam yapıları içerebilir. Koşul ve amaç cümleleri bunların en güzel örneğidir. Bu iki yapı yüzeysel olarak birbirine benzese de anlam bakımından önemli farklılıklar taşır.

Koşul cümlelerinde bir şart öne sürülür ve bu şarta bağlı bir sonuç bildirilir. Eylem gerçekleşmesi için başka bir durumun gerçekleşmesi zorunludur. "Hava açık olursa pikniğe gideriz." cümlesinde piknige gitmek için hava koşuluna bağlılık söz konusudur.

Amaç cümlelerinde ise belirli bir hedef doğrultusunda bir eylem gerçekleştirilir. "Pikniğe gitmek için erken kalktık." cümlesinde erken kalkma eylemi bir amaca yöneliktir. Burada koşul yoktur; eylem ile amaç arasında doğrudan bir bağ vardır.

Bazen iki yapı aynı cümlede iç içe görünebilir. "Eğer erken kalkarsan piknik için iyi yer bulursun." cümlesinde hem koşul ("eğer erken kalkarsan") hem de amaç ("piknik için") birlikte kullanılmıştır. Bu tür cümlelerde bağlamı doğru okumak büyük önem taşır.

LGS sınavlarında öğrencilerden bu iki yapıyı karıştırmamaları beklenir. Koşul cümlelerinde eylemin gerçekleşmesi başka bir duruma bağlıdır; amaç cümlelerinde ise gerçekleşecek eylem önceden belirlenmiş bir hedefe yöneliktir. "İçin" bağlacı amaç ilişkisi kurarken "-se/-sa" eki koşul ilişkisi kurar.

Bu farklılığı kavramak hem anlama hem de anlatım becerisi açısından gereklidir. Günlük hayatta yazdığımız ve söylediğimiz pek çok cümlede bu iki yapıdan biri ya da her ikisi birden bulunabilir. Dikkatli bir okur bu yapıları kolaylıkla ayırt edebilir.
  $body8$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000008-0000-4000-b000-000000000008',
  'detail',
  '"Hava açık olursa pikniğe gideriz." cümlesinde hangi anlam ilişkisi vardır?',
  '["Amaç-eylem", "Neden-sonuç", "Koşul-sonuç", "Karşılaştırma"]'::jsonb,
  2,
  '"Olursa" yapısı (-se/-sa eki) koşul bildirir; pikniğe gitmek bu koşula bağlıdır.',
  2,
  1
),
(
  'b0000008-0000-4000-b000-000000000008',
  'detail',
  '"Pikniğe gitmek için erken kalktık." cümlesinde ne tür anlam ilişkisi kurulmuştur?',
  '["Koşul-sonuç", "Amaç-eylem", "Neden-sonuç", "Karşılaştırma"]'::jsonb,
  1,
  '"İçin" bağlacı bir amacı göstermektedir; erken kalkmak belirli bir amaca yöneliktir.',
  2,
  2
),
(
  'b0000008-0000-4000-b000-000000000008',
  'inference',
  'Metne göre "için" ve "-se/-sa" bağlaçlarının farkı nedir?',
  '["Her ikisi de neden-sonuç ilişkisi kurar.", "\"için\" koşul, \"-se/-sa\" ise amaç bildirir.", "\"için\" amaç, \"-se/-sa\" ise koşul bildirir.", "Her ikisi de karşılaştırma ilişkisi kurar."]'::jsonb,
  2,
  'Metinde "için" bağlacının amaç ilişkisi, "-se/-sa" ekinin ise koşul ilişkisi kurduğu açıkça belirtilmiştir.',
  3,
  3
),
(
  'b0000008-0000-4000-b000-000000000008',
  'detail',
  '"Eğer erken kalkarsan piknik için iyi yer bulursun." cümlesinde kaç farklı anlam ilişkisi bir arada kullanılmıştır?',
  '["Yalnızca koşul", "Yalnızca amaç", "Hem koşul hem amaç", "Hem neden-sonuç hem karşılaştırma"]'::jsonb,
  2,
  'Metinde bu cümlede hem koşul ("eğer erken kalkarsan") hem amaç ("piknik için") kullanıldığı belirtilmiştir.',
  3,
  4
),
(
  'b0000008-0000-4000-b000-000000000008',
  'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Piknik planlamanın önemi", "Koşul ve amaç cümlelerinin benzerliği ve farklılığı", "Türkçedeki bağlaç çeşitleri", "Cümlede birden fazla yüklem kullanımı"]'::jsonb,
  1,
  'Metin, koşul ve amaç cümlelerinin birbirine benzeyen ancak anlam açısından farklı yapılar olduğunu açıklamaktadır.',
  2,
  5
);

-- ─── TEXT 9: Karşılaştırma ve Zıtlık ───────────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000009-0000-4000-b000-000000000009',
  'Karşılaştırma ve Zıtlık İlişkisi',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  3,
  294,
  3,
  $body9$
Dilde karşıtlık ilişkisi, iki unsuru birbirinin karşısına koyarak aralarındaki zıtlığı ön plana çıkarmayı amaçlar. Karşılaştırma ise iki unsur arasındaki farklılıkları ya da benzerlikleri ortaya koyar. Bu iki yapı birbiriyle yakından ilişkilidir; ancak anlam bakımından önemli ayrımlar taşır.

Zıtlık içeren cümleler genellikle "ama", "fakat", "oysa", "ne var ki", "buna karşın", "aksine", "tersine" gibi bağlaçlarla kurulur. Bu bağlaçlar iki durum ya da olgunun birbirinin tam karşıtı olduğunu vurgular. Örneğin "Kardeşim çok çalışkandır; oysa ben tembelim." cümlesinde iki kişinin niteliği birbirinin zıddı olarak verilmiştir.

Karşılaştırma cümlelerinde ise "daha", "kadar", "oranla", "kıyasla" gibi ifadeler kullanılır ve iki unsur belli bir ölçüt üzerinden değerlendirilir. Zıtlık mutlak bir karşıtlık bildirirken karşılaştırma derecelendirme içerebilir.

Bazen aynı cümlede hem zıtlık hem karşılaştırma bir arada bulunabilir. "Geçen yıl çok yavaş koşardım; oysa şimdi arkadaşlarımdan daha hızlıyım." cümlesinde hem zıtlık ("oysa") hem de karşılaştırma ("daha hızlı") kullanılmıştır.

LGS sınavlarında bu iki yapıyı ayırt edebilmek önemlidir. Zıtlık içeren cümleleri tanımak için bağlacın "ama, fakat, oysa" gibi bir karşıtlık bağlacı olup olmadığına bakılabilir. Karşılaştırma içeren cümleleri tanımak için ise iki unsur arasında bir derecelendirme ya da ölçüt karşılaştırması aranır.

Bu iki yapıyı doğru yorumlayabilmek, düşüncelerin nasıl organize edildiğini anlamayı sağlar. Hem yazılı hem de sözlü anlatımda zıtlık ve karşılaştırma cümleleri ifade gücünü artırır ve anlam derinliği kazandırır.
  $body9$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000009-0000-4000-b000-000000000009',
  'detail',
  '"Kardeşim çok çalışkandır; oysa ben tembelim." cümlesinde hangi anlam ilişkisi vardır?',
  '["Karşılaştırma (derecelendirme)", "Zıtlık", "Neden-sonuç", "Amaç-eylem"]'::jsonb,
  1,
  '"Oysa" bağlacı zıtlık bildiren bir bağlaçtır; iki kişinin nitelikleri birbirinin tam karşıtı olarak verilmiştir.',
  2,
  1
),
(
  'b0000009-0000-4000-b000-000000000009',
  'detail',
  'Zıtlık bildiren bağlaçlar hangi seçenekte doğru verilmiştir?',
  '["için, amacıyla, diye", "ama, fakat, oysa, buna karşın, aksine", "çünkü, zira, bu nedenle", "daha, kadar, oranla, kıyasla"]'::jsonb,
  1,
  'Metinde "ama, fakat, oysa, ne var ki, buna karşın, aksine, tersine" ifadelerinin zıtlık bildiren bağlaçlar olduğu belirtilmiştir.',
  2,
  2
),
(
  'b0000009-0000-4000-b000-000000000009',
  'inference',
  '"Geçen yıl çok yavaş koşardım; oysa şimdi arkadaşlarımdan daha hızlıyım." cümlesinde hangi anlam ilişkileri bir arada kullanılmıştır?',
  '["Yalnızca zıtlık", "Yalnızca karşılaştırma", "Hem zıtlık hem karşılaştırma", "Neden-sonuç ve amaç"]'::jsonb,
  2,
  'Metinde bu cümlede "oysa" ile zıtlık, "daha hızlı" ile karşılaştırmanın birlikte kullanıldığı açıklanmıştır.',
  3,
  3
),
(
  'b0000009-0000-4000-b000-000000000009',
  'detail',
  'Zıtlık ile karşılaştırma arasındaki temel fark nedir?',
  '["Zıtlık derecelendirme içerirken karşılaştırma mutlak karşıtlık bildirir.", "Zıtlık mutlak karşıtlık bildirirken karşılaştırma derecelendirme içerebilir.", "Her ikisi de aynı bağlaçları kullanır.", "Zıtlık yalnızca kişiler arasında kurulur."]'::jsonb,
  1,
  'Metinde "Zıtlık mutlak bir karşıtlık bildirirken karşılaştırma derecelendirme içerebilir." ifadesi açıkça yer almaktadır.',
  3,
  4
),
(
  'b0000009-0000-4000-b000-000000000009',
  'main_idea',
  'Bu metnin ana konusu aşağıdakilerden hangisidir?',
  '["Türkçedeki bağlaçların sınıflandırılması", "Karşılaştırma ve zıtlık cümlelerinin tanımı ve birbirinden farkı", "Derecelendirme sıfatlarının kullanımı", "LGS sınavında çıkan tüm bağlaç soruları"]'::jsonb,
  1,
  'Metin boyunca karşılaştırma ve zıtlık ilişkilerinin ne olduğu, nasıl kurulduğu ve birbirinden nasıl ayrıldığı anlatılmıştır.',
  2,
  5
);

-- ─── TEXT 10: Karma Cümlede Anlam ──────────────────────────────────────────
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body)
VALUES (
  'b0000010-0000-4000-b000-000000000010',
  'Cümlede Anlam İlişkileri — Karma',
  'LGS Türkçe – Cümlede Anlam',
  'LGS',
  4,
  298,
  3,
  $body10$
Bir dili yetkin biçimde kullanabilmek için cümlelerdeki anlam ilişkilerini kavramak şarttır. Türkçede cümleler amaç, neden-sonuç, koşul, karşılaştırma, öznellik, nesnellik, zıtlık ve dolaylı anlatım gibi pek çok farklı anlam ilişkisi taşıyabilir. Bu ilişkiler metnin anlamını derinleştirir ve iletişimi güçlendirir.

Amaç ilişkisinde özne belirli bir hedefe ulaşmak için eylem gerçekleştirir. Neden-sonuç ilişkisinde ise bir durum başka bir durumu doğurur. Koşul ilişkisinde sonucun gerçekleşmesi bir şarta bağlıdır. Karşılaştırma ilişkisinde iki unsur belli bir ölçüt çerçevesinde değerlendirilir.

Öznel yargılar kişisel görüş ve beğeni içerirken nesnel yargılar herkes tarafından doğrulanabilir gerçekler bildirir. Zıtlık ilişkisinde iki durum ya da nitelik birbirinin karşısına konur; dolaylı anlatımda ise birinin sözleri üçüncü bir kişi aracılığıyla aktarılır.

Sınav sorularında bu ilişkileri doğru adlandırmak için ipuçlarına dikkat etmek gerekir: "için" → amaç, "çünkü/bu nedenle" → neden-sonuç, "-se/-sa" → koşul, "daha/kadar" → karşılaştırma, "ama/oysa" → zıtlık, "-dığını söyledi" → dolaylı anlatım. Bu kalıpları ezberlemek yerine neden bu şekilde çalıştığını anlamak çok daha kalıcı bir öğrenme sağlar.

LGS sınavlarında karma anlam ilişkisi sorularında öğrencilerden bir cümlede birden fazla ilişkiyi fark etmeleri ya da karıştırılan iki ilişkiyi ayırt etmeleri beklenir. Bu tür sorularda öğrencinin hem dil bilgisi hem metin okuma becerisi ölçülür.

Cümlelerdeki anlam ilişkilerini yetkin biçimde kavramak; hem sınavlarda başarılı olmayı hem de günlük dili doğru ve etkili kullanmayı sağlar. Bu beceri, dilin tüm alanlarına nüfuz eden temel bir okuma-anlama becerisidir.
  $body10$
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'b0000010-0000-4000-b000-000000000010',
  'detail',
  'Aşağıdaki eşleştirmelerden hangisi doğrudur?',
  '["için → neden-sonuç (YANLIŞ)", "çünkü → neden-sonuç (DOĞRU)", "-se/-sa → amaç (YANLIŞ)", "daha/kadar → zıtlık (YANLIŞ)"]'::jsonb,
  1,
  'Metinde "çünkü/bu nedenle → neden-sonuç" olarak eşleştirilmiştir. "İçin" amaç, "-se/-sa" koşul, "daha/kadar" karşılaştırma bildirir.',
  3,
  1
),
(
  'b0000010-0000-4000-b000-000000000010',
  'detail',
  '"Yorgun olduğu için erken yattı." cümlesindeki anlam ilişkisi nedir?',
  '["Amaç-eylem", "Koşul-sonuç", "Neden-sonuç", "Karşılaştırma"]'::jsonb,
  2,
  '"İçin" burada amaç değil; "yorgun olduğu" durumunun neden, "erken yatmak"ın ise sonuç olduğu neden-sonuç ilişkisini bildirmektedir. "Olduğu için" yapısı neden bildirmektedir.',
  4,
  2
),
(
  'b0000010-0000-4000-b000-000000000010',
  'inference',
  'Metne göre anlam ilişkilerini ezberlemeye değil anlamaya odaklanmanın nedeni nedir?',
  '["Ezber gereksizdir, anlama yeterlidir.", "Anlamak daha kalıcı bir öğrenme sağlar.", "Sınav soruları hiçbir zaman ezber gerektirmez.", "Anlama becerisi sınav notunu artırmaz."]'::jsonb,
  1,
  'Metinde kalıpları ezberlemek yerine neden bu şekilde çalıştığını anlamanın çok daha kalıcı bir öğrenme sağladığı belirtilmiştir.',
  3,
  3
),
(
  'b0000010-0000-4000-b000-000000000010',
  'detail',
  'Dolaylı anlatım için verilen ipucu kalıbı hangisidir?',
  '["için kalıbı", "-se/-sa kalıbı", "-dığını söyledi kalıbı", "ama/oysa kalıbı"]'::jsonb,
  2,
  'Metinde dolaylı anlatım için "-dığını söyledi" kalıbının ipucu olarak verildiği görülmektedir.',
  2,
  4
),
(
  'b0000010-0000-4000-b000-000000000010',
  'main_idea',
  'Bu metnin genel amacı nedir?',
  '["Yalnızca amaç cümlelerini açıklamak", "Tüm cümle anlam ilişkilerini derleyerek karşılaştırmalı biçimde sunmak", "Nesnel ve öznel yargı farkını öğretmek", "Dolaylı anlatımın tarihsel gelişimini açıklamak"]'::jsonb,
  1,
  'Metin, Türkçedeki tüm temel anlam ilişkilerini (amaç, neden-sonuç, koşul, karşılaştırma, öznellik, nesnellik, zıtlık, dolaylı anlatım) bir arada ele almaktadır.',
  2,
  5
);

END $migration$;
