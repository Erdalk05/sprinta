DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM text_library WHERE category LIKE 'TYT Dil Bilgisi%') > 0 THEN
    RAISE NOTICE '049: already exists';
    RETURN;
  END IF;

  -- ============================================================
  -- TEXT 1: Sözcük Türleri
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000001-0000-4000-e000-000000000001',
    'Sözcük Türleri: Türkçenin Yapı Taşları',
    'TYT Dil Bilgisi',
    'TYT',
    2,
    438,
    3,
    $b$
Türkçe, sözcüklerini anlam ve görev bakımından belirli gruplara ayırır. Bu grupları doğru tanımak, hem yazılı hem sözlü iletişimde büyük kolaylık sağlar. Sözcük türleri; isim, sıfat, zamir, zarf, fiil, edat, bağlaç ve ünlem olmak üzere sekiz ana başlık altında incelenir.

İsimler, varlıkları ve kavramları karşılayan sözcüklerdir. "Dağ, deniz, özgürlük, sevgi" gibi sözcükler isim sınıfına girer. İsimler somut ya da soyut olabilir; özel ya da cins isim biçiminde de sınıflandırılır. "Türkiye, Atatürk, İstanbul" özel isim örnekleriyken "insan, şehir, ülke" cins isimdir.

Sıfatlar, isimleri niteleyen ya da belirten sözcüklerdir. "Güzel çiçek, beş kalem, bu kitap" tamlamalarında "güzel", "beş" ve "bu" sözcükleri sıfat görevindedir. Niteleme sıfatları ismin özelliğini belirtirken belirtme sıfatları işaret, sayı, soru ya da belirsizlik anlamı taşır.

Zamirler, isimlerin yerini tutan sözcüklerdir. "Ben, sen, o, biz, siz, onlar" şahıs zamirleri; "bu, şu, o" işaret zamirleri; "kim, ne, hangisi" soru zamirleri olarak ayrılır. Zamirler cümlede isim gibi görev yapar ve yüklemle uyum içinde bulunur.

Zarflar, fiilleri, sıfatları ya da başka zarfları niteleyen sözcüklerdir. "Çok çalışmak, hızlı koşmak, yarın gelmek" örneklerinde "çok", "hızlı" ve "yarın" zarftır. Zaman zarfı, yer zarfı, durum zarfı, miktar zarfı ve soru zarfı olmak üzere beş alt türü bulunur.

Edatlar, sözcükler ya da cümleler arasında anlam ilişkisi kuran, tek başına anlamı olmayan yardımcı sözcüklerdir. "İçin, gibi, kadar, ile, göre" en sık kullanılan edatlardandır. Edatlar, kendilerinden önce gelen sözcüklerin belirli hal ekiyle kullanılmasını gerektirir.

Bağlaçlar, sözcükleri ve cümleleri birbirine bağlayan sözcüklerdir. "Ve, ile, ama, fakat, çünkü, ya da, de/da" bağlaç örnekleridir. Bağlaçlar sıralama, karşıtlık, neden-sonuç ve seçenek ilişkisi kurabilir.

Ünlemler, duygu ve heyecanı dile getiren ya da seslenme amacıyla kullanılan sözcüklerdir. "Ah, oh, ay, ey, hey, vay" ünlem örnekleridir. Ünlemler cümlenin diğer ögeleriyle sözdizimsel bağ kurmaz; çoğunlukla ünlem işaretiyle yazılır.

Türkçede bir sözcük, bulunduğu cümleye göre farklı türlere girebilir. "Yüksek" sözcüğü "Yüksek sesle konuştu" cümlesinde zarf, "Yüksek bir dağ" tamlamasında sıfat görevindedir. Bu nedenle sözcük türünü belirlerken bağlamı dikkate almak zorunludur. Sözcük türlerini iyi öğrenmek, dil bilgisinin diğer konularını anlamayı da kolaylaştırır.
    $b$,
    ARRAY['sözcük türleri','isim','sıfat','zamir','zarf','edat','bağlaç','ünlem','TYT','dil bilgisi'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000001-0000-4000-e000-000000000001','main_idea','Bu metnin ana konusu nedir?','["Türkçede cümle türleri","Sözcük türleri ve temel özellikleri","Ek türleri ve görevleri","Anlam bilgisi ve mecaz anlam"]'::jsonb,1,'Metin, Türkçedeki sekiz temel sözcük türünü tanımları ve örnekleriyle ele almaktadır.',2,1),
  ('e0000001-0000-4000-e000-000000000001','detail','Metne göre "Güzel çiçek" tamlamasında "güzel" sözcüğü hangi türdedir?','["Zarf","Zamir","Sıfat","İsim"]'::jsonb,2,'Metinde "güzel çiçek" örneği verilerek "güzel" sözcüğünün sıfat olduğu açıklanmıştır.',2,2),
  ('e0000001-0000-4000-e000-000000000001','detail','Metne göre edatların temel özelliği nedir?','["Duygu ve heyecan belirtmeleri","İsimlerin yerini tutmaları","Tek başına anlamları olmaması ve ilişki kurmaları","Fiilleri nitelendirmeleri"]'::jsonb,2,'Metin, edatları "tek başına anlamı olmayan yardımcı sözcükler" olarak tanımlamıştır.',2,3),
  ('e0000001-0000-4000-e000-000000000001','vocabulary','Metinde geçen "sözdizimsel" sözcüğü aşağıdakilerden hangisiyle açıklanabilir?','["Anlam ile ilgili","Cümle yapısı ve sözcük dizimi ile ilgili","Ses özellikleri ile ilgili","Yazım kuralları ile ilgili"]'::jsonb,1,'"Sözdizimsel" sözcüğü, cümle içindeki sözcüklerin dizilişi ve ilişkisiyle ilgili olan anlamına gelir.',2,4),
  ('e0000001-0000-4000-e000-000000000001','inference','Metinde "Bir sözcük bulunduğu cümleye göre farklı türlere girebilir" bilgisi verilmektedir. Bu bilgiden çıkarılabilecek en uygun sonuç hangisidir?','["Sözcük türleri sabit ve değişmezdir","Türkçede sekizden fazla sözcük türü vardır","Sözcük türü belirlenirken bağlam göz önünde bulundurulmalıdır","Sıfatlar yalnızca niteleme görevi yapar"]'::jsonb,2,'Sözcüklerin bağlama göre tür değiştirebilmesi, tür belirlemenin bağlam odaklı yapılması gerektiğini gösterir.',2,5);

  -- ============================================================
  -- TEXT 2: Fiil Çatıları
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000002-0000-4000-e000-000000000002',
    'Fiil Çatıları: Anlam ve Yapı',
    'TYT Dil Bilgisi',
    'TYT',
    3,
    442,
    4,
    $b$
Fiil çatısı, bir fiilin özne ve nesneyle kurduğu ilişkiyi belirleyen dil bilgisi kategorisidir. Türkçede fiil çatıları iki ana başlık altında incelenir: özne-eylem ilişkisini belirleyen çatılar ve nesne-eylem ilişkisini belirleyen çatılar.

Etken çatı, öznenin eylemi bizzat gerçekleştirdiğini gösterir. "Ali kitabı okudu." cümlesinde özne "Ali" eylemi kendisi yapmaktadır; bu nedenle fiil etken çatıdadır. Etken çatılı fiiller özel bir ek almaz; fiilin temel biçimi etken kabul edilir.

Edilgen çatı, eylemin bir özne tarafından değil de nesne üzerinde gerçekleştiğini gösterir. "Kitap okundu." cümlesinde kim okuduğu belirsizdir; fiil "-ıl/-il/-ul/-ül" ya da "-ın/-in/-un/-ün" eki alarak edilgen yapıya geçmiştir. Edilgen çatılı cümlelerde özne ya yoktur ya da "tarafından" ile verilir.

Dönüşlü çatı, öznenin eylemi kendisine yaptığını gösterir. "Çocuk yıkandı." cümlesinde çocuk kendini yıkamıştır. "-ın/-in/-un/-ün" eki dönüşlü çatıyı da karşıladığı için dönüşlü ile edilgen çatı zaman zaman karıştırılır; ancak dönüşlü çatıda özne bellidir ve eylemi kendine yapar.

İşteş çatı, eylemin birden fazla özne tarafından karşılıklı ya da birlikte yapıldığını anlatır. "Arkadaşlar kucaklaştı." cümlesinde birden fazla kişi birbirine sarılmıştır. "-ış/-iş/-uş/-üş" eki fiili işteş yapıya sokar. "Bakıştılar, çarpıştılar" bu çatının örnekleridir.

Nesne-eylem ilişkisi açısından fiiller geçişli ve geçişsiz olmak üzere ikiye ayrılır. Geçişli fiiller nesne alabilir; yani eylemin etkisi bir nesne üzerine geçer. "Kalem aldım, mektubu yazdım" cümlelerinde fiiller geçişlidir. Geçişli fiillere "neyi, kimi" sorusu sorulabilir.

Geçişsiz fiiller nesne almaz; eylemin etkisi özne üzerinde kalır. "Koştu, uyudu, geldi" örnekleri geçişsizdir. "Neyi koştu?" sorusu anlamsız olduğundan bu fiillere nesne yüklenemez. Bazı fiiller hem geçişli hem geçişsiz kullanılabilir; bu nedenle geçişlilik de bağlama göre değerlendirilir.

Ettirgen çatı, öznenin eylemi başkasına yaptırmasını ifade eder. "Öğretmen tahtayı sildirdi." cümlesinde silme işi başkasına yaptırılmıştır. "-dır/-dir/-tur/-tür" ve "-t" ekleri ettirgen çatıyı oluşturur. Ettirgen çatı, etken çatı üzerine kurulur ve geçişli bir fiil ortaya çıkarır.

Fiil çatıları, Türkçe metinleri çözümlerken cümlenin öznesi, nesnesi ve anlam katmanlarını doğru yorumlamak için kritik öneme sahiptir. TYT sınavında fiil çatısı soruları genellikle verilen bir cümlenin çatısını belirleme ya da aynı çatıda olan fiilleri eşleştirme biçiminde karşımıza çıkar.
    $b$,
    ARRAY['fiil çatısı','etken','edilgen','dönüşlü','işteş','geçişli','geçişsiz','ettirgen','TYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000002-0000-4000-e000-000000000002','main_idea','Bu metnin ana düşüncesi aşağıdakilerden hangisidir?','["Türkçede fiil ekleri çok çeşitlidir","Fiil çatıları özne ve nesneyle kurulan ilişkiyi belirler","Edilgen ve dönüşlü çatılar aynı ektir","Geçişli fiiller daima nesne alır"]'::jsonb,1,'Metin, fiil çatısını özne ve nesneyle kurulan ilişki üzerinden sistematik biçimde açıklamaktadır.',3,1),
  ('e0000002-0000-4000-e000-000000000002','detail','Metne göre ettirgen çatı nasıl oluşturulur?','["Fiile -ıl/-il eki getirilerek","Fiile -ış/-iş eki getirilerek","Etken çatı üzerine -dır/-dir ya da -t eki getirilerek","Fiile -ın/-in eki getirilerek"]'::jsonb,2,'Metin, ettirgen çatının "-dır/-dir/-tur/-tür" ve "-t" ekleriyle etken çatı üzerine kurulduğunu belirtmiştir.',3,2),
  ('e0000002-0000-4000-e000-000000000002','detail','Metne göre işteş çatıyı diğer çatılardan ayıran temel özellik nedir?','["Öznenin eylemi kendine yapması","Eylemin birden fazla özne tarafından karşılıklı ya da birlikte yapılması","Eylemin nesne üzerinde gerçekleşmesi","Öznenin belli olmaması"]'::jsonb,1,'Metin, işteş çatıyı "birden fazla özne tarafından karşılıklı ya da birlikte yapılan eylem" olarak tanımlamıştır.',3,3),
  ('e0000002-0000-4000-e000-000000000002','vocabulary','Metinde geçen "çözümlerken" sözcüğündeki "-lerken" ekinin işlevi nedir?','["Neden-sonuç ilişkisi kurar","Eş zamanlılık ve süreç bildirir","Koşul anlamı taşır","Zaman sırası gösterir"]'::jsonb,1,'"Çözümlerken" sözcüğündeki "-ken" eki eş zamanlılık yani iki eylemin aynı anda sürdüğünü bildirir.',3,4),
  ('e0000002-0000-4000-e000-000000000002','inference','Metinde "dönüşlü ile edilgen çatı zaman zaman karıştırılır" denilmektedir. Bu ifadeden çıkarılabilecek en uygun sonuç nedir?','["İki çatı tamamen aynı anlama gelir","İki çatı aynı eki alsa da anlam farkı önemlidir","Dönüşlü çatı TYT''de sorulmaz","Edilgen çatıda özne her zaman bellidir"]'::jsonb,1,'Aynı eki paylaşan iki çatının karıştırılması, anlam farklarına odaklanılması gerektiğini göstermektedir.',3,5);

  -- ============================================================
  -- TEXT 3: Cümle Türleri
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000003-0000-4000-e000-000000000003',
    'Cümle Türleri: Yapı ve Anlam',
    'TYT Dil Bilgisi',
    'TYT',
    2,
    435,
    3,
    $b$
Cümle, en az bir yüklem içeren anlam bütünüdür. Türkçede cümleler yapılarına göre basit cümle, sıralı cümle, bağlı cümle ve girişik-bileşik cümle olarak dörde ayrılır. Her tür, farklı anlam ilişkileri ve yazım özellikleri taşır.

Basit cümle, tek yüklemi olan cümledir. "Çocuklar bahçede oynuyor." Bu cümlede yalnızca "oynuyor" yüklemi bulunmaktadır. Basit cümleler yalnızca bir yargı bildirir ve yapı bakımından en sade cümle türüdür. Yüklem fiil ya da isim soylu bir sözcük olabilir.

Sıralı cümle, birden fazla yargının aralarına virgül veya noktalı virgül konularak yan yana getirilmesinden oluşur. "Güneş battı, rüzgar durdu, ortalık sessizleşti." cümlesinde üç ayrı yargı sıralı biçimde verilmiştir. Sıralı cümlelerde yargılar bağlaçsız bağlanır ve her biri kendi öznesini taşıyabilir ya da ortak özneye sahip olabilir.

Bağlı cümle, iki veya daha fazla yargının bağlaçlarla birleştirilmesinden oluşur. "Hava soğuktu ama güneş parlıyordu." cümlesinde "ama" bağlacı iki yargıyı birbirine bağlamıştır. "Ve, ile, fakat, ya da, ne...ne" gibi bağlaçlar bu görevi üstlenir. Bağlı cümlede bağlacın türü, yargılar arasındaki anlam ilişkisini belirler.

Girişik-bileşik cümle ise bir temel cümle ile ona bağlı yan cümleciklerden oluşur. Yan cümlecikler fiilimsi aldığı için ayrı bir yargı bildirmez; yalnızca temel cümlenin ögesini tamamlar. "Kapıyı açan çocuk içeri girdi." cümlesinde "kapıyı açan" yan cümleciği sıfat-fiil taşıdığından temel cümlenin öznesini nitelendirmektedir.

Cümle türleri yalnızca yapısal bir sınıflandırma değil, aynı zamanda anlam ve etki açısından da farklılık yaratır. Basit cümleler kesinlik ve yalınlık hissi verirken sıralı cümleler art arda gelişen olayları ya da koşulları aktarmakta etkilidir. Bağlı cümleler ise karşıtlık, neden-sonuç ya da eklemleme ilişkisi kurarak anlatıyı zenginleştirir.

Yazılı anlatımda cümle türü seçimi, metnin akışını ve okuyucuya verilen mesajın yoğunluğunu doğrudan etkiler. Akademik metinlerde girişik-bileşik cümlelere daha sık başvurulurken günlük dilde basit ve sıralı cümleler tercih edilir. Sınav sorularında cümle türünü belirlerken yüklem sayısını, bağlaç kullanımını ve fiilimsilerin varlığını dikkatle incelemek gerekir.
    $b$,
    ARRAY['cümle türleri','basit cümle','sıralı cümle','bağlı cümle','girişik bileşik','TYT','dil bilgisi'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000003-0000-4000-e000-000000000003','main_idea','Bu metnin ana konusu nedir?','["Türkçede yüklem türleri","Cümle türlerinin yapı ve anlam özellikleri","Noktalama işaretlerinin cümledeki işlevi","Bağlaçların anlam değerleri"]'::jsonb,1,'Metin, Türkçedeki dört cümle türünü yapı ve anlam açısından sistematik biçimde ele almaktadır.',2,1),
  ('e0000003-0000-4000-e000-000000000003','detail','Metne göre sıralı cümlenin bağlı cümleden temel farkı nedir?','["Sıralı cümlede yargı sayısı daha azdır","Sıralı cümlede yargılar bağlaçsız bağlanır","Sıralı cümlelerde ortak özne bulunmaz","Sıralı cümleler yalnızca virgülle ayrılır"]'::jsonb,1,'Metin, sıralı cümlelerde yargıların bağlaçsız yan yana getirildiğini açıkça belirtmiştir.',2,2),
  ('e0000003-0000-4000-e000-000000000003','detail','Metne göre girişik-bileşik cümleyi diğer cümle türlerinden ayıran özellik nedir?','["Birden fazla bağlaç içermesi","Yan cümleciklerin fiilimsi taşıması","Öznesinin bulunmaması","Yükleminin sıfat olması"]'::jsonb,1,'Girişik-bileşik cümlede yan cümlecikler fiilimsi aldığı için bağımsız yargı bildirmez.',2,3),
  ('e0000003-0000-4000-e000-000000000003','vocabulary','Metinde geçen "eklemleme" sözcüğü aşağıdakilerden hangisi yerine kullanılabilir?','["Karşıtlık kurma","Birbirine bağlama ve ekleme","Anlam daralması","Yargı bildirme"]'::jsonb,1,'"Eklemleme", parçaları birbirine ekleme ve bağlama anlamını taşır.',2,4),
  ('e0000003-0000-4000-e000-000000000003','inference','Metinde "Akademik metinlerde girişik-bileşik cümlelere daha sık başvurulur" bilgisinden ne çıkarılabilir?','["Akademik dil yalın ve basit olmalıdır","Girişik-bileşik cümleler karmaşık düşünce ilişkilerini aktarmaya daha uygundur","Günlük dilde bağlı cümleler kullanılmaz","Basit cümleler akademik metinlerde yanlış kabul edilir"]'::jsonb,1,'Akademik yazımın karmaşık yapısı, birden fazla ilişki kuran girişik-bileşik cümleleri gerektirmektedir.',2,5);

  -- ============================================================
  -- TEXT 4: Noktalama İşaretleri
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000004-0000-4000-e000-000000000004',
    'Noktalama İşaretleri: Kurallar ve Kullanım',
    'TYT Dil Bilgisi',
    'TYT',
    2,
    440,
    3,
    $b$
Noktalama işaretleri, yazılı dilin anlaşılmasını kolaylaştıran ve metnin yapısını belirleyen simgelerdir. Doğru kullanılan bir noktalama işareti, cümlenin anlamını netleştirir; yanlış kullanılan bir işaret ise anlam karışıklığına yol açabilir. Türkçede en yaygın noktalama işaretleri şunlardır: nokta, virgül, noktalı virgül, iki nokta, tırnak işareti, soru işareti, ünlem işareti ve kısa çizgi.

Nokta, cümlenin bitiminde kullanılır. Ayrıca kısaltmaların sonuna, sıra sayılarının ardına ve bazı başlıkların sonuna da nokta konur. "Dr., Prof., vb." kısaltmalarında nokta zorunludur. Ancak ünlü ile biten kısaltmalar nokta almaz: "TV, TDK" gibi.

Virgül, cümle içinde anlam gruplarını birbirinden ayırır. Sıralı öge grupları arasında, açıklayıcı ekler sonrasında ve yan cümlecikleri ayırmak için virgül kullanılır. "Kitap, defter ve kalem aldım." cümlesinde virgül, sıralama işlevi görür. Virgülün yanlış konulması cümlenin anlamını kökten değiştirebilir: "Git, gel." ile "Git gel." tamamen farklı anlam taşır.

Noktalı virgül, birbiriyle ilgili ancak bağımsız iki cümleyi ya da virgülle ayrılmış gruplarda alt sıralamayı belirtmek için kullanılır. "Hayat kısadır; zamanı iyi kullanmalısın." örneğinde iki yargı birbiriyle ilişkili olduğu için noktalı virgülle bağlanmıştır.

İki nokta, bir açıklama ya da örneklemenin başladığını haber verir. "Türkçede üç zaman vardır: geçmiş, şimdiki, gelecek." cümlesinde iki nokta, bir listenin geleceğini göstermektedir. İki nokta ayrıca diyaloglarda konuşmacı adının ardından da kullanılır.

Tırnak işareti, alıntı cümleleri, özel terim ve kavramlar ile ironi amacıyla kullanılır. Bana "Çalış" dedi cümlesinde tırnak, doğrudan alıntıyı çevrelemektedir. Bir sözcüğün olağan dışı ya da alaycı biçimde kullanıldığını vurgulamak için de tırnak tercih edilir.

Soru işareti, soru cümlelerinin sonuna gelir. Ünlem işareti ise heyecan, sevinç, öfke ya da seslenme içeren cümlelerin bitiminde kullanılır. Bu iki işaret, cümlenin duygusal tonunu ve iletişim amacını açıkça ortaya koyar.

Noktalama işaretlerini ustalıkla kullanmak, yazılı anlatımın kalitesini artırır. TYT sınavında noktalama soruları genellikle hatalı kullanımı bulma ya da eksik işareti tamamlama biçiminde sorulmaktadır.
    $b$,
    ARRAY['noktalama','virgül','nokta','iki nokta','tırnak','soru işareti','TYT','dil bilgisi'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000004-0000-4000-e000-000000000004','main_idea','Metnin ana amacı nedir?','["Türkçenin tarihsel gelişimini anlatmak","Noktalama işaretlerinin kurallarını ve kullanım alanlarını açıklamak","Yazım yanlışlarını örneklerle göstermek","Soru ve ünlem cümlelerini karşılaştırmak"]'::jsonb,1,'Metin, baştan sona Türkçedeki noktalama işaretlerini kuralları ve örnekleriyle açıklamaktadır.',2,1),
  ('e0000004-0000-4000-e000-000000000004','detail','Metne göre virgülün yanlış konulmasının sonucu nedir?','["Cümle anlamsız hale gelir","Cümlenin anlamı kökten değişebilir","Cümle soru anlamı kazanır","Noktalı virgül yerine geçer"]'::jsonb,1,'Metin "Git, gel." ile "Git gel." örneğini vererek virgülün yanlış kullanımının anlama etkisini somutlaştırmıştır.',2,2),
  ('e0000004-0000-4000-e000-000000000004','detail','Metne göre iki nokta hangi durumlarda kullanılır?','["Yalnızca diyaloglarda","Açıklama ya da örnekleme başlangıcında ve diyaloglarda","Soru cümlelerinin sonunda","Sıralama ve kısaltmalarda"]'::jsonb,1,'Metin, iki noktanın açıklama/örnekleme başlangıcında ve diyaloglarda kullanıldığını belirtmiştir.',2,3),
  ('e0000004-0000-4000-e000-000000000004','vocabulary','Metinde geçen "ironi" sözcüğünün bu bağlamdaki anlamı nedir?','["Doğrudan alıntı","Açık ve samimi ifade","Söylenenin tersini kasteden alaycı kullanım","Resmi yazışma biçimi"]'::jsonb,2,'"İroni", gerçek düşüncenin aksini söyleyerek alaycılık yapma sanatıdır.',2,4),
  ('e0000004-0000-4000-e000-000000000004','inference','Metinde "Doğru kullanılan bir noktalama işareti cümlenin anlamını netleştirir" denilmektedir. Bu bilgiden çıkarılabilecek en uygun sonuç nedir?','["Noktalama işaretleri yalnızca resmi yazılarda önemlidir","Anlam belirsizliğinin temel kaynağı kelime seçimidir","Noktalama işaretleri anlam aktarımının ayrılmaz bir parçasıdır","Uzun cümlelerde noktalama işaretleri gereksizdir"]'::jsonb,2,'Noktalama işaretlerinin anlam üzerindeki belirleyici etkisi, onların yazılı iletişimin temel bir unsuru olduğunu gösterir.',2,5);

  -- ============================================================
  -- TEXT 5: Anlam Bilgisi
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000005-0000-4000-e000-000000000005',
    'Anlam Bilgisi: Gerçek, Mecaz ve Yan Anlam',
    'TYT Dil Bilgisi',
    'TYT',
    3,
    445,
    4,
    $b$
Sözcüklerin anlamları sabit ve tek boyutlu değildir. Bir sözcük, kullanıldığı bağlama göre farklı anlam katmanları kazanabilir. Türkçede anlam bilgisi gerçek anlam, yan anlam, mecaz anlam ve terim anlam olmak üzere dört temel kavramla açıklanır.

Gerçek anlam, sözcüğün sözlükte yer alan ilk ve temel anlamıdır. Bu anlam bağlama bağlı değildir; sözcüğü duyunca akla ilk gelen somut ya da kavramsal karşılıktır. "Göz" sözcüğünün gerçek anlamı, insanın görme organıdır. "Baş" sözcüğünün gerçek anlamı ise vücudun üst bölümüdür.

Yan anlam, sözcüğün gerçek anlamıyla bağlantılı olmakla birlikte farklılaşmış ikincil anlamıdır. "Masanın bacağı, iğnenin gözü, şişenin boynu" örneklerinde "bacak", "göz" ve "boyun" sözcükleri insan vücudundan masaya, iğneye ve şişeye aktarılmıştır. Bu aktarma gerçek anlamla benzerlik ya da işlevsellik ilişkisine dayanır; bu nedenle yan anlam kalıcı ve sözlükte kayıtlıdır.

Mecaz anlam ise sözcüğün gerçek anlamının çok dışına çıkıldığı, tamamen soyut ya da çağrışımsal bir kullanımdır. "Kalbini kırdın" cümlesinde kalbin fiziksel olarak kırılması söz konusu değildir; buradaki "kırmak" duyguları incitmek anlamında mecaz kullanılmıştır. Mecaz anlam, sanatsal yazıda ve günlük konuşmada sıkça tercih edilir.

Terim anlam, sözcüğün belirli bir bilim, sanat ya da meslek dalında aldığı özel anlamdır. "Kök" sözcüğü günlük dilde bitkinin toprağa giren bölümünü anlatırken dil bilgisinde sözcüğün temel biçimini, matematikte ise bir denklemin çözümünü ifade eder. Terim anlam bağlama bağlıdır ve uzmanlık alanı dışında bu anlamda kullanılmaz.

Deyim ve atasözleri de anlam bilgisinin önemli parçalarıdır. Deyimler, mecaz anlamlı kalıp ifadelerdir ve sözcük sözcük çevrildiğinde asıl anlam ortaya çıkmaz. "Ağzı sıkı, kulak kabartmak, eli açık" deyimlerinde sözcüklerin gerçek anlamları birleştirildiğinde deyimin anlattığı kavram elde edilemez.

Anlam kayması da söz konusu olabilir: zaman içinde sözcüklerin anlamları genişleyebilir, daralabilir ya da tamamen değişebilir. "Uçmak" sözcüğü önceleri yalnızca kuşlar için kullanılırken bugün uçaklara, fikirlere ve hayallere de uygulanmaktadır. Anlam bilgisini kavramak, hem metin anlama hem de sözcük seçimi becerisi açısından büyük önem taşır.
    $b$,
    ARRAY['anlam bilgisi','gerçek anlam','mecaz anlam','yan anlam','terim anlam','deyim','TYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000005-0000-4000-e000-000000000005','main_idea','Metnin temel konusu nedir?','["Sözcük türleri ve görevleri","Sözcüklerin farklı anlam katmanları ve bunların özellikleri","Deyim ve atasözlerinin kökeni","Anlam kaymasının tarihi"]'::jsonb,1,'Metin, sözcüklerin gerçek, yan, mecaz ve terim anlam katmanlarını örneklerle ele almaktadır.',3,1),
  ('e0000005-0000-4000-e000-000000000005','detail','Metne göre yan anlamı gerçek anlamdan ayıran özellik nedir?','["Yan anlam sözlükte kayıtlı değildir","Yan anlam gerçek anlamla bağlantılı olmakla birlikte farklılaşmış ve sözlükte kayıtlıdır","Yan anlam yalnızca mecaz bağlamlarda kullanılır","Yan anlam terim anlama eşdeğerdir"]'::jsonb,1,'Metin, yan anlamın gerçek anlamla bağlantılı ama farklılaşmış, sözlükte kayıtlı ikincil anlam olduğunu belirtmiştir.',3,2),
  ('e0000005-0000-4000-e000-000000000005','detail','Metne göre "iğnenin gözü" ifadesinde "göz" sözcüğü hangi anlamda kullanılmıştır?','["Gerçek anlam","Mecaz anlam","Yan anlam","Terim anlam"]'::jsonb,2,'Metin "iğnenin gözü" örneğini yan anlam kapsamında vermiştir; sözcük gerçek anlamdan farklılaşarak ama bağlantıyı koruyarak kullanılmıştır.',3,3),
  ('e0000005-0000-4000-e000-000000000005','vocabulary','Metinde geçen "kalıcı" sözcüğünün bu bağlamdaki anlamı nedir?','["Geçici ve değişken","Kısa süreli","Sürekli ve yerleşmiş","Soyut ve bağlamsal"]'::jsonb,2,'"Kalıcı" sözcüğü bu bağlamda "sözlükte yerleşmiş, sürekli" anlamını taşımaktadır.',3,4),
  ('e0000005-0000-4000-e000-000000000005','inference','Metinde deyimlerin sözcük sözcük çevrildiğinde asıl anlam ortaya çıkmaz denilmektedir. Bu bilgiden ne çıkarılabilir?','["Deyimler gerçek anlamda kullanılabilir","Deyimlerin anlamı parçaların anlamlarından bağımsızdır","Deyimler yalnızca edebi metinlerde geçer","Deyimler birer terim anlamdır"]'::jsonb,1,'Deyimlerin parçaların toplamından farklı anlam taşıması, bütüncül bir kalıp olduklarını gösterir.',3,5);

  -- ============================================================
  -- TEXT 6: Paragraf Özellikleri
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000006-0000-4000-e000-000000000006',
    'Paragraf Özellikleri: Yapı ve Anlam Bütünlüğü',
    'TYT Dil Bilgisi',
    'TYT',
    2,
    432,
    3,
    $b$
Paragraf, belirli bir konuyu ya da düşünceyi geliştiren, birbiriyle bağlantılı cümlelerden oluşan yazı birimidir. İyi kurulmuş bir paragraf; giriş, gelişme ve sonuç bölümlerinden oluşur. Bu yapı, okuyucunun konuyu kolaylıkla takip etmesini sağlar.

Giriş cümlesi, paragrafın ilk cümlesidir ve ana düşünceyi doğrudan ya da dolaylı biçimde ortaya koyar. Bu cümle, okuyucunun dikkatini çekmeyi ve konunun sınırlarını belirlemeyi amaçlar. Güçlü bir giriş cümlesi, paragrafın geri kalanına yön veren bir çerçeve çizer.

Gelişme bölümü, ana düşünceyi destekleyen ayrıntıları, örnekleri, açıklamaları ve kanıtları içerir. Gelişme cümlelerine "yardımcı düşünceler" de denir. Bu cümleler, giriş cümlesinin ortaya attığı iddiayı somutlaştırır ve gerekçelendirir. Yardımcı düşünceler arasında mantıksal bir sıra bulunmalıdır; aksi takdirde metin dağınık bir görünüm kazanır.

Sonuç cümlesi, paragrafı kapatır ve ana düşünceyi pekiştirir ya da farklı bir bakış açısıyla özetler. Sonuç cümlesi, giriş cümlesinin tekrarı olmamalıdır; ancak onunla tematik bağını korumalıdır. Güçlü bir sonuç cümlesi, okuyucuya düşünme ya da eylem için bir çıkış noktası sunar.

Paragrafta konu, paragrafın içinde ele alınan somut konuyu ifade eder. Ana düşünce ise yazarın o konu hakkında söylemek istediği temel fikir ya da yargıdır. "Ormansızlaşma doğayı tahrip etmektedir." cümlesinde konu "ormansızlaşma", ana düşünce ise "doğanın tahrip edilmesi"dir.

Bir paragrafın niteliğini belirleyen birkaç temel ölçüt vardır. Birlik, paragraftaki tüm cümlelerin aynı konuya hizmet etmesini gerektirir; konudan sapan cümleler birliği bozar. Bağlaşıklık, cümleler arasındaki dilbilgisel ve anlamsal bağlantıların güçlü olmasını ifade eder. Tutarlılık ise fikirlerin birbiriyle çelişmeden akışkan bir biçimde gelişmesini sağlar.

TYT sınavında paragraf soruları; ana düşüncenin bulunması, boş bırakılan yere uygun cümlenin seçilmesi ve anlam bütünlüğünü bozan cümlenin tespiti gibi biçimlerde karşımıza çıkar. Bu nedenle paragraf yapısını kavramak, sınav başarısı açısından kritik öneme sahiptir.
    $b$,
    ARRAY['paragraf','ana düşünce','yardımcı düşünce','giriş gelişme sonuç','konu','bağlaşıklık','TYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000006-0000-4000-e000-000000000006','main_idea','Bu metnin ana konusu nedir?','["Yazı türleri ve özellikleri","Paragrafın yapısı, bölümleri ve nitelik ölçütleri","Ana düşünce ile konunun farkı","Sınavda paragraf sorularını çözme stratejileri"]'::jsonb,1,'Metin, paragrafın tanımını, yapısını ve nitelik ölçütlerini bütüncül biçimde açıklamaktadır.',2,1),
  ('e0000006-0000-4000-e000-000000000006','detail','Metne göre yardımcı düşünceler nelerdir?','["Ana düşünceyi çürüten karşı görüşler","Giriş cümlesinin farklı biçimde tekrarları","Ana düşünceyi destekleyen ayrıntı, örnek ve açıklamalar","Paragrafın konusunu belirten özetler"]'::jsonb,2,'Metin, yardımcı düşünceleri "giriş cümlesinin iddiasını somutlaştıran gelişme bölümü cümleleri" olarak tanımlamıştır.',2,2),
  ('e0000006-0000-4000-e000-000000000006','detail','Metne göre paragrafta "birlik" ne anlama gelir?','["Cümlelerin aynı uzunlukta olması","Tüm cümlelerin aynı konuya hizmet etmesi","Sonuç cümlesinin giriş cümlesini tekrarlaması","Bağlaçların düzenli kullanılması"]'::jsonb,1,'Metin, birliği "paragraftaki tüm cümlelerin aynı konuya hizmet etmesi" şeklinde tanımlamıştır.',2,3),
  ('e0000006-0000-4000-e000-000000000006','vocabulary','Metinde geçen "bağlaşıklık" sözcüğünün anlamı nedir?','["Cümlelerin kısa ve öz olması","Cümleler arasındaki dilbilgisel ve anlamsal bağlantıların güçlü olması","Paragrafın belirli bir konuya odaklanması","Fikirlerin çelişmeden gelişmesi"]'::jsonb,1,'Metin, bağlaşıklığı "cümleler arasındaki dilbilgisel ve anlamsal bağlantıların güçlü olması" şeklinde açıklamıştır.',2,4),
  ('e0000006-0000-4000-e000-000000000006','inference','Metinde "Sonuç cümlesi giriş cümlesinin tekrarı olmamalıdır" denilmektedir. Bu bilgiden ne çıkarılabilir?','["Sonuç cümlesi giriş cümlesiyle hiçbir ilişki taşımamalıdır","Sonuç cümlesi yeni bilgi eklemeli ya da farklı bir bakış açısı sunmalıdır","Sonuç cümlesi her zaman en kısa cümle olmalıdır","Sonuç cümlesi olmayan paragraflar daha etkilidir"]'::jsonb,1,'Tekrar olmaması ama tematik bağı koruması, sonuç cümlesinin yeni bir katkı sunması gerektiğini göstermektedir.',2,5);

  -- ============================================================
  -- TEXT 7: Ses Olayları
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000007-0000-4000-e000-000000000007',
    'Ses Olayları: Ünlü ve Ünsüz Değişimleri',
    'TYT Dil Bilgisi',
    'TYT',
    3,
    443,
    4,
    $b$
Türkçede sözcükler ek aldığında ya da birleştiğinde çeşitli ses değişimleri meydana gelir. Bu değişimlere "ses olayları" adı verilir. Ses olayları, Türkçenin uyum ve söyleme kolaylığı ilkelerine dayanır. Başlıca ses olayları şunlardır: ünlü uyumu, ünsüz yumuşaması, ünlü düşmesi ve ünsüz benzeşmesi.

Ünlü uyumu, Türkçenin en temel ses özelliğidir. Buna göre sözcükteki ünlüler, kalınlık-incelik ve düzlük-yuvarlaklık açısından birbiriyle uyumlu olmak zorundadır. "Kapılar" sözcüğünde "a-ı-a" ünlüleri hep kalın sıradan; "evler" sözcüğünde "e-e" ünlüleri hep ince sıradan seçilmiştir. Ek alan sözcüklerde ekin ünlüsü, sözcüğün son ünlüsüne uyar.

Ünsüz yumuşaması, sözcüklerin sonundaki sert ünsüzlerin (ç, k, p, t) ünlüyle başlayan bir ek geldiğinde yumuşak karşıtlarına dönüşmesidir. "Kitap" sözcüğü "-ım" ekini aldığında "kitabım" olur; "p" sesi "b"ye yumuşamıştır. "Renk - rengi, ağaç - ağacı, kanat - kanadı" örneklerinde de aynı olay gözlemlenir. Ancak tek heceli sözcüklerin büyük çoğunluğu bu kurala uymaz: "at - atı, kap - kabı."

Ünlü düşmesi, ünlüyle başlayan bir ek aldığında sözcüğün sonundaki hecenin ünlüsünün düşmesidir. "Alın" sözcüğü "-ım" ekini alınca "alnım" olur; orta hece ünlüsü "ı" düşmüştür. "Burun - burnu, gönül - gönlü, ağız - ağzı" bu kurala uyan sözcüklerdir. Ünlü düşmesi, söyleme kolaylığı sağlamak amacıyla gerçekleşir.

Ünsüz benzeşmesi, birbirine komşu iki ünsüzden birinin diğerine benzeme eğilimidir. Türkçede özellikle ekler sözcüğe eklenirken ünsüz benzeşmesi işler. Sert ünsüzle (ç, f, h, k, p, s, ş, t) biten sözcüklere gelen sesleme ekleri tonlulaşmaz; tam tersine yumuşak ünsüzle biten sözcüklere gelen ekler tonlanır. "Git-ti" yerine "git-di" denmez; "git" sert ünsüzle bittiği için ek "-ti" olur.

Kaynaşma olayı, iki ünlünün yan yana gelmesiyle oluşacak uyumsuzluğu önlemek için bir "y" ya da "n" ünsüzünün araya girmesidir. "Kapı-ya, oda-ya" örneklerinde "-a" datif eki doğrudan ünlüye bağlanmamakta; araya "y" sesi girmektedir.

Ses olaylarını bilmek, sözcüklerin doğru yazılması ve yanlış ekleşme biçimlerinin ayırt edilmesi açısından zorunludur. TYT sınavında ses olayları genellikle "hangi sözcükte ses olayı yoktur?" ya da "aşağıdaki sözcüklerin hangisinde ünlü düşmesi vardır?" biçiminde sorulur.
    $b$,
    ARRAY['ses olayları','ünlü uyumu','ünsüz yumuşaması','ünlü düşmesi','ünsüz benzeşmesi','kaynaşma','TYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000007-0000-4000-e000-000000000007','main_idea','Bu metnin ana konusu nedir?','["Türkçe eklerin sınıflandırılması","Türkçedeki ses olaylarının türleri ve işleyiş biçimleri","Ünlü uyumunun tarihsel gelişimi","Tek heceli sözcüklerin özellikleri"]'::jsonb,1,'Metin, Türkçedeki başlıca ses olaylarını tanımları ve örnekleriyle sistematik biçimde ele almaktadır.',3,1),
  ('e0000007-0000-4000-e000-000000000007','detail','Metne göre "alnım" sözcüğünde hangi ses olayı gerçekleşmiştir?','["Ünsüz yumuşaması","Ünsüz benzeşmesi","Ünlü düşmesi","Kaynaşma"]'::jsonb,2,'"Alın" sözcüğünün "-ım" ekini alırken orta hece ünlüsü "ı" düşmüş ve "alnım" oluşmuştur; bu ünlü düşmesidir.',3,2),
  ('e0000007-0000-4000-e000-000000000007','detail','Metne göre ünsüz benzeşmesinin temel işlevi nedir?','["Sözcüğün anlamını değiştirmek","Sert ya da yumuşak ünsüze göre ekin tonunu uyumlu kılmak","Ünlü uyumunu sağlamak","Orta hece ünlüsünü düşürmek"]'::jsonb,1,'Ünsüz benzeşmesi, sözcüğün son ünsüzüne göre ekin tonlu ya da tonsuz biçimini belirleyerek ses uyumunu sağlar.',3,3),
  ('e0000007-0000-4000-e000-000000000007','vocabulary','Metinde geçen "tonlulaşmaz" ifadesindeki "tonlu" sözcüğü ses bilgisinde ne anlama gelir?','["Yüksek perdeli ses","Gırtlak titreşimiyle çıkarılan ses","Ünlü sesi","Sert ünsüz sesi"]'::jsonb,1,'Sesbilgisinde "tonlu" gırtlak titreşimiyle oluşturulan sesi ifade eder; "b, d, g, c" tonlu ünsüz örnekleridir.',3,4),
  ('e0000007-0000-4000-e000-000000000007','inference','Metinde "Ses olaylarını bilmek sözcüklerin doğru yazılması için zorunludur" denilmektedir. Bu bilgiden ne çıkarılabilir?','["Ses olayları yalnızca konuşma diline özgüdür","Yazım yanlışlarının önemli bir kısmı ses değişimlerinin bilinmemesinden kaynaklanabilir","Ses olayları yabancı kökenli sözcüklerde daha sık görülür","Ses olayları öğrenilmese de yazım doğru olabilir"]'::jsonb,1,'Ses olaylarının yazım doğruluğuyla doğrudan ilişkisi, bu kuralları bilmemenin hata kaynağı olacağını göstermektedir.',3,5);

  -- ============================================================
  -- TEXT 8: Yapım ve Çekim Ekleri
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000008-0000-4000-e000-000000000008',
    'Yapım ve Çekim Ekleri: Türkçenin Ek Sistemi',
    'TYT Dil Bilgisi',
    'TYT',
    3,
    448,
    4,
    $b$
Türkçe, eklemeli diller ailesine mensuptur. Bu özellik, sözcüklerin köklerine çeşitli ekler getirilerek yeni sözcükler oluşturulabildiği ya da sözcüğün cümlede üstlendiği görevin değiştirilebildiği anlamına gelir. Türkçe ekler iki ana gruba ayrılır: yapım ekleri ve çekim ekleri.

Yapım ekleri, yeni sözcük türeten eklerdir. Kök ya da gövdeye gelen yapım eki, sözcüğün anlamını ve çoğunlukla türünü değiştirir. "Taş" ismine "-lık" eki gelerek "taşlık" oluşur; burada bir isimden yeni bir isim türetilmiştir. "Güzel" sıfatına "-leş" eki gelerek "güzelleşmek" fiili oluşur; bu durumda sıfattan fiil türetilmiştir. Yapım ekleri isimden isim, isimden fiil, fiilden isim ve fiilden fiil türeten olmak üzere dörde ayrılır.

İsimden fiil yapım ekleri arasında "-la/-le, -lan/-len, -laş/-leş, -al/-el" sayılabilir. "Taş-la-mak, hız-lan-mak, güzel-leş-mek, düz-el-mek" bu eklerin örnekleridir. Fiilden isim yapım ekleri ise "-ış/-iş, -ım/-im, -ma/-me, -mak/-mek, -aç/-eç, -gan/-gen" gibi çeşitli biçimler alır. "Koş-uş, bil-im, bak-ış, yaz-ma" bu gruptandır.

Çekim ekleri ise sözcüğün anlamını ya da türünü değiştirmez; yalnızca cümle içindeki görevini ve ilişkilerini belirler. İsim çekim ekleri; hal ekleri (ilgi, yönelme, bulunma, ayrılma, belirtme), çokluk eki ve iyelik ekleridir. "Evler, evlerin, evlere, evde, evden, evi" örneklerinde "ev" kökü çekim ekiyle farklı görevler üstlenmiştir.

Fiil çekim ekleri ise zamanı, kişiyi ve kipi belirler. "-dı/-di/-du/-dü" geçmiş zaman eki; "-iyor" şimdiki zaman eki; "-ecek/-acak" gelecek zaman ekidir. "-se/-sa" dilek-koşul; "-sin/-sın" istek kipi ekidir. Kişi ekleri ise "-ım/-im, -sın/-sin, -ız/-iz, -sınız/-siniz, -lar/-ler" gibi biçimler taşır.

Yapım ve çekim eklerini doğru ayırt etmek, sözcük türünü ve cümledeki işlevi doğru belirlemek açısından kritiktir. Temel kural şudur: yapım eki yeni bir sözcük üretir ve sözlükte yeni bir madde başı oluşabilir; çekim eki ise sözcüğün işlevsel biçimini verir, sözlükte ayrı madde olmaz.

TYT sınavında bu konu; "aşağıdaki sözcüklerden hangisi yapım eki almıştır?", "çekim ekini belirleyin" ya da "sözcük kök ve eklerine ayırın" biçiminde sorulur. Ek sınırlarını doğru çizmek ve her ekin işlevini kavramak, hem yazım hem anlam soruları için temel oluşturur.
    $b$,
    ARRAY['yapım eki','çekim eki','isimden fiil','fiilden isim','ek sistemi','TYT','dil bilgisi'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000008-0000-4000-e000-000000000008','main_idea','Bu metnin ana düşüncesi nedir?','["Türkçe sözcük türleri arasındaki farklar","Türkçenin ek sistemi: yapım ve çekim eklerinin özellikleri","Türkçenin eklemeli bir dil olmasının tarihsel nedenleri","Fiil çekiminin zaman kategorileri"]'::jsonb,1,'Metin, Türkçedeki yapım ve çekim eklerini işlevleri, türleri ve örnekleriyle ayrıntılı biçimde açıklamaktadır.',3,1),
  ('e0000008-0000-4000-e000-000000000008','detail','Metne göre yapım ekini çekim ekinden ayıran temel özellik nedir?','["Yapım eki her zaman sözcüğün sonuna gelir","Yapım eki yeni sözcük üretir; çekim eki sözcüğün işlevsel biçimini verir","Çekim eki sözcüğün anlamını değiştirir","Yapım eki yalnızca fiillere eklenir"]'::jsonb,1,'Metin, yapım ekinin yeni sözcük ürettiğini ve sözlükte yeni madde oluşturabileceğini, çekim ekinin ise yalnızca işlev belirlediğini açıklamıştır.',3,2),
  ('e0000008-0000-4000-e000-000000000008','detail','Metne göre "güzelleşmek" sözcüğünde kullanılan yapım ekinin türü nedir?','["İsimden isim yapım eki","İsimden fiil yapım eki","Fiilden isim yapım eki","Fiilden fiil yapım eki"]'::jsonb,1,'"Güzel" sıfatından "-leş" ekiyle "güzelleşmek" fiili türetilmiştir; bu isimden fiil yapım ekidir.',3,3),
  ('e0000008-0000-4000-e000-000000000008','vocabulary','Metinde "eklemeli dil" kavramı kullanılmaktadır. Bu kavram ne anlama gelir?','["Sözcüklerin yalnızca ön eklerle değiştiği dil","Sözcük köklerine ekler getirilerek yeni sözcük ve işlev oluşturulabilen dil türü","Sözcük sırasının anlam belirlediği dil","Bağlaç kullanımının yoğun olduğu dil"]'::jsonb,1,'"Eklemeli dil", sözcük köküne çeşitli ekler eklenerek yeni anlam ve işlev yaratılabilen dil tipini ifade eder.',3,4),
  ('e0000008-0000-4000-e000-000000000008','inference','Metinde "Yapım eki sözcükte sözlükte yeni madde başı oluşturabilir" denilmektedir. Bu bilgiden ne çıkarılabilir?','["Çekim ekli sözcükler sözlükte ayrıca yer alır","Yapım ekli sözcükler kökten bağımsız anlamlar kazanabilir","Tüm yapım ekleri türetilen sözcüğün türünü değiştirir","Çekim ekleri yeni anlam katmaz, yalnızca ilişki bildirir"]'::jsonb,3,'Sözlükte yeni madde oluşturması, yapım ekli sözcüğün kendi başına anlamsal bir varlık kazandığını gösterir; çekim eki ise bu bağımsızlığı sağlamaz.',3,5);

  -- ============================================================
  -- TEXT 9: Anlatım Bozuklukları
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000009-0000-4000-e000-000000000009',
    'Anlatım Bozuklukları: Türler ve Düzeltme Yolları',
    'TYT Dil Bilgisi',
    'TYT',
    3,
    455,
    4,
    $b$
Anlatım bozukluğu, bir cümlede anlam karışıklığı, gereksiz tekrar, eksiklik ya da çelişki bulunan durumları ifade eder. Türkçe yazılı anlatımda en sık karşılaşılan sorunlardan biri olan anlatım bozuklukları; anlama dayalı ve anlatıma dayalı olmak üzere ikiye ayrılır.

Anlama dayalı bozukluklar, sözcüklerin yanlış ya da bağlama uygun olmayan biçimde kullanılmasından kaynaklanır. Sözcük anlamı yanlışlığı bunların başında gelir. Ayrıca anlam çelişkisi de bu gruba girer: "Hayatta hiçbir şeyi düşünmeksizin ve dikkatle yaptım." cümlesinde "düşünmeksizin" ile "dikkatle" birbiriyle çelişmektedir.

Anlatıma dayalı bozukluklar ise dilbilgisel hatalardan oluşur. Eksik öge bozukluğu, cümlede gerekli bir ögenin bulunmamasıdır. "Kitapları alıp getirdi." cümlesinde özne belli değildir; ancak bağlam desteklenirse bu durum kabul edilebilir. Asıl sorun, birden fazla yükleme ortaklaşa bağlanmak zorunda olan bir öznenin ya da nesnenin eksik bırakılmasıdır. "Müdür konuştu ve alkışladı." cümlesinde "alkışlandı" yerine "alkışladı" kullanılmış; anlam karışıklığı doğmuştur.

Gereksiz sözcük kullanımı da anlatım bozukluğunun yaygın bir türüdür. "Sabahleyin erken saatlerde kalktı." cümlesinde "sabahleyin" ve "erken saatlerde" aynı anlamı tekrar etmektedir; biri yeterlidir. Benzer biçimde "en yüksek zirveye çıktı" derken "zirve" zaten "en yüksek nokta" anlamı taşıdığından "en yüksek" gereksizdir.

Yanlış ek kullanımı da önemli bir bozukluk kaynağıdır. "Ona güvenmekte fayda yoktur." cümlesi doğruyken "Ona güvenmeden fayda yoktur." cümlesi yanlış anlam verir; "-madan" eki burada kullanılmamalıdır. Eylemin kipi ya da zamanıyla bağlantılı ek hataları da bu başlık altında değerlendirilir.

Son olarak "özne-yüklem uyumsuzluğu" önemli bir bozukluk türüdür. Türkçede yüklem özneyle sayı ve kişi bakımından uyumlu olmak zorundadır. "Öğrenciler başarılıdır." yerine "Öğrenciler başarılı." yazılması aslında halk dilinde kabul görse de biçimsel yazıda yüklemle öznenin tam uyumu aranır.

TYT sınavında anlatım bozukluğu soruları, bozukluğun türünü bulma ya da düzeltilmiş biçimi seçme şeklinde karşımıza çıkar. Bu konuyu öğrenmek, hem sınav başarısı hem de yazılı anlatım kalitesi için vazgeçilmezdir.
    $b$,
    ARRAY['anlatım bozukluğu','eksik öge','gereksiz sözcük','anlam çelişkisi','yanlış ek','özne yüklem uyumu','TYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000009-0000-4000-e000-000000000009','main_idea','Bu metnin ana konusu nedir?','["Türkçede yazım yanlışları ve kurallar","Anlatım bozukluklarının türleri ve nedenlerinin açıklanması","Noktalama hatalarının cümleye etkisi","Sözcük türlerinin yanlış kullanımı"]'::jsonb,1,'Metin, anlatım bozukluklarını anlama ve anlatıma dayalı olarak sınıflandırıp her türü örneklerle açıklamaktadır.',3,1),
  ('e0000009-0000-4000-e000-000000000009','detail','Metne göre "en yüksek zirveye çıktı" cümlesindeki anlatım bozukluğunun türü nedir?','["Eksik öge","Anlam çelişkisi","Gereksiz sözcük kullanımı","Yanlış ek kullanımı"]'::jsonb,2,'"Zirve" zaten "en yüksek nokta" anlamını taşıdığından "en yüksek" gereksiz tekrardır; bu gereksiz sözcük kullanımı bozukluğudur.',3,2),
  ('e0000009-0000-4000-e000-000000000009','detail','Metne göre anlama dayalı bozukluklarla anlatıma dayalı bozukluklar arasındaki fark nedir?','["Anlama dayalı bozukluklar yalnızca akademik metinlerde görülür","Anlama dayalı bozukluklar sözcük kullanımından, anlatıma dayalı bozukluklar dilbilgisi hatalarından kaynaklanır","Anlatıma dayalı bozukluklar daha az önemlidir","İkisi arasında temel bir fark yoktur"]'::jsonb,1,'Metin, anlama dayalı bozuklukları sözcük yanlışlığına, anlatıma dayalı olanları ise dilbilgisel hatalara bağlamıştır.',3,3),
  ('e0000009-0000-4000-e000-000000000009','vocabulary','Metinde geçen "çelişki" sözcüğü bu bağlamda ne anlama gelir?','["Anlam belirsizliği","Birbiriyle bağdaşmayan, zıt anlam ilişkisi","Gereksiz tekrar","Yanlış sözcük seçimi"]'::jsonb,1,'"Çelişki" iki ifadenin birbirini dışlaması ya da birlikte doğru olamaması durumunu ifade eder.',3,4),
  ('e0000009-0000-4000-e000-000000000009','inference','Metinde anlatım bozukluklarının hem sınav başarısı hem de yazılı anlatım kalitesi için önemli olduğu vurgulanmaktadır. Bu bilgiden ne çıkarılabilir?','["Anlatım bozuklukları yalnızca sınav odaklı bir konudur","Bu konu yalnızca edebiyat metinlerini etkiler","Dil bilgisi kurallarına hâkimiyet günlük iletişimde de işlevseldir","Bozukluklar düzeltilemez çünkü dil değişkendir"]'::jsonb,2,'Hem sınav hem gerçek yazılı anlatımla ilişkilendirilmesi, dil bilgisinin sınav dışında da pratik değer taşıdığını ortaya koymaktadır.',3,5);

  -- ============================================================
  -- TEXT 10: Söz Sanatları
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'e0000010-0000-4000-e000-000000000010',
    'Söz Sanatları: Edebi Anlatımın Araçları',
    'TYT Dil Bilgisi',
    'TYT',
    3,
    450,
    4,
    $b$
Söz sanatları, dilin estetik ve etkileyici biçimde kullanılmasını sağlayan anlatım tekniklerdir. Edebi metinlerde şiirden düzyazıya kadar geniş bir alanda kullanılan söz sanatları, okuyucuda derin izlenimler yaratır ve metnin anlam katmanlarını zenginleştirir. Başlıca söz sanatları şunlardır: teşbih, istiare, kişileştirme, abartma ve tezat.

Teşbih, iki varlık ya da kavram arasında benzetme ilişkisi kurma sanatıdır. Teşbihin dört unsuru vardır: benzeyen, kendine benzetilen, benzetme yönü ve benzetme edatı. "Ahmet, aslan gibi güçlüdür." cümlesinde "Ahmet" benzeyen, "aslan" kendine benzetilen, "güçlü" benzetme yönü ve "gibi" benzetme edatıdır. Dört unsur tam yer aldığında "tam teşbih", unsurlardan biri ya da birkaçı eksikse "eksiltili teşbih" adını alır.

İstiare, teşbihin benzetme edatı ve benzetme yönünden yoksun halidir. Yalnızca benzeyen ya da yalnızca kendine benzetilen söylenerek öteki ima edilir. "Yaşam bir yolculuktur." cümlesinde "yolculuk" ile "yaşam" arasında teşbih vardır; ancak bu cümle doğrudan özdeşleştirme şeklinde kurulmuştur. Açık istiare yalnızca kendine benzetileni, kapalı istiare ise yalnızca benzeyeni söyler.

Kişileştirme, insan dışı varlıklara ya da soyut kavramlara insan özellikleri atfetme sanatıdır. "Rüzgar bana fısıldadı, dağlar haykırdı." cümlelerinde rüzgar ve dağ insana özgü eylemler gerçekleştirmektedir. Kişileştirme, doğayı ve soyut kavramları canlı ve hissiyle yüklü kılar; özellikle lirik şiirde yoğun biçimde kullanılır.

Abartma (mübalağa), bir şeyi olduğundan çok büyük ya da çok küçük gösterme sanatıdır. "Bin kez söyledim, hâlâ anlamadın." cümlesinde "bin kez" gerçek bir sayı değildir; duyguyu yoğunlaştırmak amacıyla kullanılmıştır. Abartma, okuyucunun dikkatini çekmek ve anlatıma güç kazandırmak için başvurulan etkili bir araçtır.

Tezat, zıt anlam taşıyan sözcük ya da kavramları aynı cümle ya da beyitte bir arada kullanma sanatıdır. "Gülerken ağladım, ağlarken güldüm." dizesinde "gülmek" ve "ağlamak" karşıt duygular bir arada verilmiştir. Tezat, insan ruhunun karmaşıklığını yansıtmak için sıkça tercih edilir. Divan şiirinde "gündüz-gece, ateş-su, ölüm-yaşam" tezat çiftleri çok yaygındır.

Söz sanatları, yalnızca edebi bir süs değil, aynı zamanda derin anlamlar ve duygu yoğunluğu yaratmanın temel aracıdır. TYT sınavında bu konuyu bilen öğrenci; şiir ve düzyazı parçalarında söz sanatını doğru adlandırabilir ve ilgili dizeleri diğerlerinden ayırt edebilir.
    $b$,
    ARRAY['söz sanatları','teşbih','istiare','kişileştirme','abartma','tezat','edebi sanatlar','TYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('e0000010-0000-4000-e000-000000000010','main_idea','Bu metnin ana konusu nedir?','["Türk şiirinin tarihsel gelişimi","Başlıca söz sanatlarının tanımı ve edebi işlevleri","Divan şiirinde kullanılan temalar","Şiir türleri ve biçim özellikleri"]'::jsonb,1,'Metin, beş temel söz sanatını tanımlayarak örnekler üzerinden açıklamakta ve edebi işlevlerini ortaya koymaktadır.',3,1),
  ('e0000010-0000-4000-e000-000000000010','detail','Metne göre tam teşbihin eksiltili teşbihten farkı nedir?','["Tam teşbihte benzetme edatı kullanılmaz","Tam teşbihte dört unsurun tamamı yer alır","Eksiltili teşbihte yalnızca benzetme yönü verilir","Tam teşbih yalnızca şiirde kullanılır"]'::jsonb,1,'Metin, dört unsurun tamamının yer aldığı durumu "tam teşbih", bir ya da birkaçının eksik olduğu durumu "eksiltili teşbih" olarak tanımlamıştır.',3,2),
  ('e0000010-0000-4000-e000-000000000010','detail','Metne göre kişileştirmenin temel özelliği nedir?','["Soyut kavramları somuta dönüştürmek","İnsan dışı varlıklara insan özellikleri atfetmek","Zıt kavramları yan yana kullanmak","Benzetme edatıyla ilişki kurmak"]'::jsonb,1,'Metin, kişileştirmeyi "insan dışı varlık ya da soyut kavramlara insan özellikleri atfetme" şeklinde tanımlamıştır.',3,3),
  ('e0000010-0000-4000-e000-000000000010','vocabulary','Metinde geçen "atfetme" sözcüğünün anlamı nedir?','["Benzetmek","Yüklemek, özellik vermek","Karşılaştırmak","Zıtlık göstermek"]'::jsonb,1,'"Atfetmek" bir özelliği birine ya da bir şeye yüklemek, mal etmek anlamına gelir.',3,4),
  ('e0000010-0000-4000-e000-000000000010','inference','Metinde "Söz sanatları yalnızca edebi bir süs değil, derin anlam ve duygu yoğunluğu yaratmanın temel aracıdır" denilmektedir. Bu bilgiden ne çıkarılabilir?','["Söz sanatları kullanılmadan edebi metin yazılamaz","Söz sanatlarının amacı yalnızca metni güzel göstermek değil, anlam ve duygu katmanları eklemektir","Söz sanatları anlamı zorlaştırır, bu nedenle nesir metinlerde kullanılmamalıdır","Söz sanatları şiirle sınırlıdır, düzyazıya uygulanamaz"]'::jsonb,1,'Söz sanatlarının işlevsel niteliği vurgulanarak onların yalnızca biçimsel değil, anlam ve duygu bakımından da derinlik kattığı ortaya konmaktadır.',3,5);

END;
$migration$;
