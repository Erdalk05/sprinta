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
