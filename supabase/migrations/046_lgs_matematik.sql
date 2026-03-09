-- ================================================================
-- 046_lgs_matematik.sql
-- LGS 8. Sınıf Matematik — 10 metin × 5 soru = 50 soru
-- Konular: Veri/Grafik/İstatistik/Oran/Denklem/Geometri/Olasılık
-- ================================================================

DO $migration$
BEGIN
IF (SELECT COUNT(*) FROM text_library WHERE category LIKE 'LGS Matematik%') > 0 THEN
  RETURN;
END IF;

-- ══ METİN 1: Veri Yorumlama ══════════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000001-0000-4000-c000-000000000001',
  'Veri Yorumlama ve Tablolar',
  'LGS Matematik',
  'LGS', 2, 430, 4,
  $b$
Veri yorumlama, toplanan bilgilerin anlamlı sonuçlara dönüştürülmesi sürecidir. Günlük hayatta veri yorumlamaya sıkça başvurulur: hava durumu tahminleri, market satış raporları, okul sınav sonuçları bunların başında gelir. Matematiksel veri yorumlama ise tablolar, grafikler ve çeşitli gösterimler aracılığıyla gerçekleştirilir.

Tablo, verileri satır ve sütunlar hâlinde düzenli biçimde sunan bir gösterim biçimidir. Bir tabloda hangi satır ve sütunun kesiştiği, o veriye karşılık gelen değeri verir. Örneğin bir okulun her sınıfına ait öğrenci sayısının ve sınıf başarı ortalamasının yer aldığı bir tabloda, "7-B sınıfının öğrenci sayısı" gibi sorular tablonun ilgili hücresine bakılarak yanıtlanabilir.

Frekans tablosu, bir veri kümesindeki değerlerin kaç kez tekrar ettiğini gösterir. Bir sınıftaki öğrencilerin aldığı notların frekans tablosuna bakılarak en sık alınan not, kaç öğrencinin belirli bir aralıkta not aldığı gibi bilgilere ulaşılabilir. Kümülatif frekans ise belirli bir değere kadar toplam kaç verinin bulunduğunu ifade eder.

Çizgi grafiği, zamanla değişimi göstermek için kullanılır. Bir şirketin yıllık kâr değerlerinin çizgi grafiğine bakılarak hangi yılda en fazla kâr elde edildiği, hangi dönemde düşüş yaşandığı kolayca anlaşılır. Sütun grafiği ise farklı kategoriler arasındaki karşılaştırma için tercih edilir. Aynı anda birden fazla kategoriyi karşılaştırmak gerektiğinde çoklu sütun grafiği kullanılır.

Pasta grafiği, bir bütünün parçalara ayrılmasını görsel olarak gösterir. Her dilimin açısı, o dilimin bütüne oranına göre belirlenir. Dilimin açısı = (o kategorinin değeri / toplam değer) × 360° formülüyle hesaplanır. Örneğin bir sınıftaki öğrencilerin %40'ı matematik dersini seviyorsa, pasta grafiğindeki bu dilim 0,40 × 360° = 144° açıya sahip olur.

Veri yorumlamada ortalama, ortanca ve tepe değer gibi merkezi eğilim ölçüleri de önemlidir. Ortalama, tüm verilerin toplamının veri sayısına bölünmesiyle bulunur. Ortanca, veriler sıralandığında ortada kalan değerdir. Tepe değer ise en çok tekrar eden değerdir. Bu üç ölçü bazı durumlarda birbirinden farklı sonuçlar verebilir ve her birinin kullanım amacı farklıdır.

Verilerin yanlış yorumlanması, hatalı kararlara yol açabilir. Bu nedenle grafik eksenlerine, ölçek değerlerine ve başlıklara dikkat etmek gerekir. Yanıltıcı grafikler zaman zaman eksik bilgi sunmak veya izlenimi değiştirmek amacıyla kullanılabilir. Eleştirel bir bakış açısıyla veriyi değerlendirmek, doğru sonuçlara ulaşmayı sağlar.
  $b$,
  ARRAY['matematik','veri','tablo','grafik','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000001-0000-4000-c000-000000000001','main_idea','Bu metinde esas olarak ne anlatılmaktadır?','["Frekans tablolarının yapısı","Veri yorumlamanın önemi, çeşitli grafik türleri ve temel kavramlar","Pasta grafiklerinin nasıl çizileceği","Ortalamanın nasıl hesaplandığı"]'::jsonb,1,'Metin veri yorumlama kavramını, grafik türlerini (çizgi, sütun, pasta) ve merkezi eğilim ölçülerini kapsamlı biçimde ele almaktadır.',2,1),
('c0000001-0000-4000-c000-000000000001','detail','Pasta grafiğinde bir dilimin açısı nasıl hesaplanır?','["Verinin toplamla farkı × 360°","(O kategorinin değeri / toplam değer) × 360°","Toplam değer / 360°","Veri sayısı × 90°"]'::jsonb,1,'Metinde pasta grafiği dilim açısı = (o kategorinin değeri / toplam değer) × 360° formülü verilmektedir.',2,2),
('c0000001-0000-4000-c000-000000000001','inference','Bir grafik ekseninde ölçek değerleri verilmemişse bu durum ne anlama gelebilir?','["Grafik daha doğru olur","İzleyici yanlış sonuçlara yönlendirilebilir","Ortalama hesaplanamaz","Frekans tablosu kullanılmalıdır"]'::jsonb,1,'Metin, eksik bilgili veya yanıltıcı grafiklerin yanlış yorumlara yol açabileceğini vurgular; ölçek eksikliği bunun başlıca yoludur.',3,3),
('c0000001-0000-4000-c000-000000000001','vocabulary','Metinde geçen "kümülatif frekans" ne anlama gelmektedir?','["En çok tekrar eden değer","Verilerin ortalaması","Belirli bir değere kadar toplam kaç verinin bulunduğu","Veri kümesinin en büyük değeri"]'::jsonb,2,'Metin kümülatif frekansı "belirli bir değere kadar toplam kaç verinin bulunduğu" şeklinde tanımlar.',2,4),
('c0000001-0000-4000-c000-000000000001','inference','Ortalama, ortanca ve tepe değerin farklı çıkması durumunda ne yapılmalıdır?','["Yalnızca ortalama kullanılmalıdır","Veriler yanlıştır, tekrar toplanmalıdır","Amaca uygun olan ölçü seçilmelidir","Her zaman ortanca tercih edilmelidir"]'::jsonb,2,'Metin "her birinin kullanım amacı farklıdır" ifadesiyle amaç odaklı ölçü seçimini vurgular.',3,5);

-- ══ METİN 2: Oran ve Orantı ══════════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000002-0000-4000-c000-000000000002',
  'Oran ve Orantı',
  'LGS Matematik',
  'LGS', 2, 435, 4,
  $b$
Oran, iki niceliğin birbirine bölümüdür ve genellikle a/b veya a:b biçiminde gösterilir. Bölümü aynı olan iki oran eşit oranlardır. Örneğin 3/6 ile 5/10 oranları her ikisi de 1/2'ye eşit olduğundan eşit oranlar olarak kabul edilir.

Orantı, iki oranın birbirine eşit olması durumudur. a/b = c/d orantısında a ve d dış terimler, b ve c iç terimlerdir. Orantının temel özelliğine göre dış terimlerin çarpımı iç terimlerin çarpımına eşittir: a × d = b × c. Bu özellik bilinmeyen terimlerin bulunmasında kullanılır.

Doğru orantı, bir nicelik artarken diğerinin de aynı oranda artması durumudur. Örneğin bir araç saatte 60 km yol gidiyorsa 2 saatte 120 km, 3 saatte 180 km yol gider. Süre ile alınan yol doğru orantılıdır çünkü süre iki katına çıktığında yol da iki katına çıkmaktadır.

Ters orantı ise bir nicelik artarken diğerinin azalması durumudur. Eşit miktarda işi yapacak işçi sayısı ile işin biteceği gün sayısı ters orantılıdır. 4 işçi bir işi 6 günde bitiriyorsa 8 işçi aynı işi 3 günde bitirir çünkü işçi sayısı iki katına çıktığında süre yarıya düşer.

Oranlar, günlük hayatta birçok alanda karşımıza çıkar. Haritalar ve krokiler ölçek oranı kullanır. Haritada 1:100.000 ölçeği, harita üzerindeki 1 cm'nin gerçekte 100.000 cm yani 1 km'ye karşılık geldiğini gösterir. Bu nedenle haritada iki şehir arasındaki mesafe ölçülerek gerçek mesafe hesaplanabilir.

Yüzde, özel bir oran çeşididir. 100 üzerinden ifade edilen oran demek olan yüzde, birçok hesaplamada kullanılır. Bir mağazada %20 indirim yapıldığında 250 TL'lik bir ürünün indirimi 250 × 20/100 = 50 TL olur ve satış fiyatı 200 TL'ye düşer. Bankalarda faiz hesaplamaları, seçim sonuçlarındaki oy oranları ve beslenme içeriklerindeki besin yüzdeleri de oran kavramının uygulama alanlarıdır.

Karışım problemleri de oran ve orantı konusunun önemli bir bölümünü oluşturur. Belirli oranlarda karıştırılan iki maddenin ortalamasını bulmak ya da istenilen konsantrasyonu elde etmek için oran hesapları yapılır. Bu problemlerde ağırlıklı ortalama formülü sıklıkla kullanılır.
  $b$,
  ARRAY['matematik','oran','orantı','yüzde','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000002-0000-4000-c000-000000000002','main_idea','Metinde ele alınan temel matematik konusu nedir?','["Yüzde hesaplamaları","Oran ve orantı kavramları ile günlük hayattaki uygulamaları","Haritalarda ölçek kullanımı","Karışım problemleri"]'::jsonb,1,'Metin oran ve orantıyı tanımlar, doğru/ters orantıyı açıklar ve günlük hayat uygulamalarını (harita, yüzde, karışım) verir.',2,1),
('c0000002-0000-4000-c000-000000000002','detail','Orantının temel özelliğine göre a/b = c/d ise aşağıdakilerden hangisi doğrudur?','["a + d = b + c","a × b = c × d","a × d = b × c","a - b = c - d"]'::jsonb,2,'Metin orantının temel özelliğini "dış terimlerin çarpımı iç terimlerin çarpımına eşittir: a × d = b × c" şeklinde verir.',2,2),
('c0000002-0000-4000-c000-000000000002','inference','4 işçi bir işi 6 günde bitiriyorsa, aynı işi 3 günde bitirmek için kaç işçi gerekir?','["6","8","12","3"]'::jsonb,1,'Ters orantıda işçi × gün = sabit olduğundan 4 × 6 = x × 3, x = 8 işçi gerekir.',2,3),
('c0000002-0000-4000-c000-000000000002','vocabulary','Metindeki "dış terimler" kavramı a/b = c/d orantısında hangi terimleri karşılar?','["b ve c","a ve b","a ve d","c ve d"]'::jsonb,2,'Metin "a ve d dış terimler, b ve c iç terimlerdir" şeklinde tanımlar.',2,4),
('c0000002-0000-4000-c000-000000000002','detail','1:100.000 ölçekli haritada iki nokta arasındaki mesafe 3 cm ise gerçek mesafe kaç km''dir?','["3 km","30 km","300 km","3000 km"]'::jsonb,0,'1 cm = 100.000 cm = 1 km olduğundan 3 cm = 3 km gerçek mesafeye karşılık gelir.',2,5);

-- ══ METİN 3: Olasılık ════════════════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000003-0000-4000-c000-000000000003',
  'Olasılık ve Rastgele Olaylar',
  'LGS Matematik',
  'LGS', 3, 440, 4,
  $b$
Olasılık, bir olayın gerçekleşme ihtimalini sayısal olarak ifade etmenin yoludur. Günlük yaşamda "Bugün yağmur yağma ihtimali yüzde kaç?" ya da "Bu oyunda kazanma şansım nedir?" gibi soruların yanıtlarını olasılık matematiği verir.

Bir deneyde ortaya çıkabilecek tüm sonuçların oluşturduğu kümeye örneklem uzayı denir. Adil bir bozuk para atıldığında örneklem uzayı {yazı, tura} biçimindedir. Adil bir zar atıldığında ise {1, 2, 3, 4, 5, 6} örneklem uzayını oluşturur. Bir olayın olasılığı, o olayın kaç farklı biçimde gerçekleşebileceğinin örneklem uzayındaki toplam eleman sayısına bölünmesiyle hesaplanır.

P(A) = (A olayının gerçekleşme sayısı) / (Toplam eleman sayısı) formülüyle hesaplanan olasılık değeri 0 ile 1 arasında bir sayıdır. P(A) = 0 ise bu olay hiçbir zaman gerçekleşmez; P(A) = 1 ise bu olay kesinlikle gerçekleşir. Adil bir zarla 7 gelme olasılığı 0, herhangi bir sayı gelme olasılığı ise 1'dir.

Bir olayın gerçekleşmeme olasılığı, 1 eksi o olayın gerçekleşme olasılığına eşittir: P(A') = 1 - P(A). Adil zarla çift sayı gelme olasılığı P(çift) = 3/6 = 1/2 ise tek sayı gelme olasılığı P(tek) = 1 - 1/2 = 1/2 olur.

Deneysel olasılık, gerçek deneylere dayanır. Bir bozuk para 100 kez atıldığında 48 kez tura geldiyse deneysel olasılık 48/100 = 0,48 olur. Teorik olasılık ise deneyi sonsuz kez tekrarladığımızda beklenen sonuçtur; adil para için 0,5'tir. Deney sayısı arttıkça deneysel olasılık teorik olasılığa yaklaşır.

Birden fazla bağımsız olayın birlikte gerçekleşme olasılığı, bu olayların olasılıklarının çarpımıyla bulunur. Adil bir para ve adil bir zar aynı anda atılırsa tura ve 6 gelme olasılığı 1/2 × 1/6 = 1/12'dir. Bu iki olay birbirini etkilemediğinden bağımsız sayılır.

Olasılık, yalnızca matematik sınıfında değil; sigortacılıkta risk hesaplamaları, tıpta hastalık tahminleri, meteorolojide hava tahmini ve oyunlarda strateji belirleme gibi pek çok alanda kullanılmaktadır. Veri toplama ve analiz becerisiyle birleşen olasılık düşüncesi, belirsizliklerle dolu gerçek hayatta daha iyi kararlar alınmasına yardımcı olur.
  $b$,
  ARRAY['matematik','olasılık','örneklem uzayı','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000003-0000-4000-c000-000000000003','main_idea','Bu metinin temel konusu nedir?','["Zar atma deneyleri","Olasılığın tanımı, hesaplanması ve gerçek hayat uygulamaları","Bağımsız olayların çarpım kuralı","Deneysel ve teorik olasılık farkı"]'::jsonb,1,'Metin olasılığı kapsamlı biçimde ele alır: tanım, formül, örneklem uzayı, bağımsız olaylar ve uygulama alanları.',2,1),
('c0000003-0000-4000-c000-000000000003','detail','P(A) = 0 olması ne anlama gelir?','["Olay kesinlikle gerçekleşir","Olay hiçbir zaman gerçekleşmez","Olay yarı yarıya ihtimalle gerçekleşir","Örneklem uzayı boştur"]'::jsonb,1,'Metin P(A) = 0 ise bu olayın hiçbir zaman gerçekleşmeyeceğini belirtir.',2,2),
('c0000003-0000-4000-c000-000000000003','inference','Adil bir zarla 5 veya 6 gelme olasılığı nedir?','["1/6","1/3","1/2","2/3"]'::jsonb,1,'5 veya 6 gelme = 2 uygun sonuç, toplam 6 sonuç; P = 2/6 = 1/3.',2,3),
('c0000003-0000-4000-c000-000000000003','vocabulary','Metinde geçen "örneklem uzayı" kavramı ne anlama gelir?','["En olası sonuç","Bir deneyde ortaya çıkabilecek tüm sonuçların kümesi","Olasılığı en yüksek olan olay","Bağımsız olayların listesi"]'::jsonb,1,'Metin örneklem uzayını "bir deneyde ortaya çıkabilecek tüm sonuçların oluşturduğu küme" olarak tanımlar.',2,4),
('c0000003-0000-4000-c000-000000000003','detail','Bir para 100 kez atıldığında 48 kez tura geldiyse deneysel olasılık nedir?','["0,50","0,52","0,48","0,40"]'::jsonb,2,'Deneysel olasılık = 48/100 = 0,48 olarak hesaplanır.',2,5);

-- ══ METİN 4: İstatistik ve Grafikler ═════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000004-0000-4000-c000-000000000004',
  'İstatistik: Ortalama, Ortanca ve Tepe Değer',
  'LGS Matematik',
  'LGS', 2, 428, 4,
  $b$
İstatistik, verilerin toplanması, düzenlenmesi, analiz edilmesi ve yorumlanmasını inceleyen bir matematik dalıdır. Bir veri kümesini tek bir sayıyla özetlemek için merkezi eğilim ölçüleri kullanılır. Bu ölçüler ortalama, ortanca ve tepe değerdir.

Ortalama (aritmetik ortalama), veri kümesindeki tüm değerlerin toplamının veri sayısına bölünmesiyle bulunur. Örneğin 5, 7, 3, 8, 7 verilerinin ortalaması (5 + 7 + 3 + 8 + 7) / 5 = 30/5 = 6'dır. Ortalama, aşırı değerlerden etkilenir. Veri kümesinde çok büyük veya çok küçük bir değer bulunursa ortalama bu değere doğru kayar.

Ortanca, veri küme küçükten büyüğe sıralandığında tam ortada kalan değerdir. Tek sayıda veri varsa ortanca doğrudan ortadaki değerdir. Veri sayısı çift ise ortadaki iki değerin ortalaması alınır. Yukarıdaki 5, 7, 3, 8, 7 verileri sıralandığında 3, 5, 7, 7, 8 olur ve ortanca 7'dir. Ortanca, aşırı değerlerden daha az etkilenmesi nedeniyle zaman zaman ortalamadan daha güvenilir bir merkezi eğilim ölçüsüdür.

Tepe değer, veri kümesinde en sık tekrarlanan değerdir. Yukarıdaki veri kümesinde 7 iki kez tekrar ettiğinden tepe değer 7'dir. Bir veri kümesinde birden fazla tepe değer bulunabilir ya da hiç olmayabilir. Tepe değer, özellikle kategorik verilerde (renk tercihleri, oy dağılımı gibi) anlamlı sonuçlar verir.

Bu üç ölçü aynı veri kümesinden farklı bilgiler çıkarabilmektedir. Bir işletme çalışanlarının maaş ortalamasını hesapladığında, yöneticilerin yüksek maaşları bu ortalamayı yukarı çekebilir ve gerçek durumu yansıtmayan bir sonuç elde edilebilir. Bu durumda ortanca daha gerçekçi bir bilgi sunar.

Dağılım ölçüleri ise verilerin ne kadar yayıldığını gösterir. Değişim aralığı, veri kümesinin en büyük ve en küçük değeri arasındaki farktır. Yukarıdaki örnekte değişim aralığı 8 - 3 = 5'tir. Standart sapma ise her veri değerinin ortalamadan ne kadar uzaklaştığını ölçen daha gelişmiş bir dağılım ölçüsüdür.

İstatistik kavramları yalnızca matematik dersinde değil; sosyal bilimlerde anket analizi, fen bilimlerinde deney sonuçlarının değerlendirilmesi ve ekonomide büyüme verilerinin yorumlanması gibi pek çok disiplinde kullanılmaktadır. Verileri doğru okuyup yorumlayan bireyler, daha bilinçli kararlar alabilirler.
  $b$,
  ARRAY['matematik','istatistik','ortalama','ortanca','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000004-0000-4000-c000-000000000004','main_idea','Metinde ele alınan temel istatistik kavramları nelerdir?','["Yalnızca ortalama hesaplama","Ortalama, ortanca, tepe değer ve dağılım ölçüleri","Standart sapma ve değişim aralığı","Frekans tablosu ve histogram"]'::jsonb,1,'Metin merkezi eğilim ölçüleri (ortalama, ortanca, tepe) ile dağılım ölçülerini (değişim aralığı, standart sapma) kapsar.',2,1),
('c0000004-0000-4000-c000-000000000004','detail','3, 5, 7, 7, 8 veri kümesinin ortancası nedir?','["5","6","7","7,5"]'::jsonb,2,'5 eleman vardır, ortadaki (3. eleman) 7''dir. Ortanca = 7.',1,2),
('c0000004-0000-4000-c000-000000000004','inference','Çalışanların maaş dağılımını özetlemek için ortalama yerine ortancanın tercih edilmesinin nedeni nedir?','["Ortanca her zaman daha büyük çıkar","Ortalama hesaplamak daha zordur","Yöneticilerin yüksek maaşları ortalamayı yukarı çekip gerçeği çarpıtabilir","Ortanca standart sapmayı küçük yapar"]'::jsonb,2,'Metin yönetici maaşlarının ortalamanın gerçek durumu yansıtmamasına yol açabileceğini ve ortancanın daha gerçekçi olduğunu belirtir.',3,3),
('c0000004-0000-4000-c000-000000000004','vocabulary','Metinde "değişim aralığı" nasıl tanımlanmıştır?','["En büyük ve en küçük değerin ortalaması","En büyük ve en küçük değer arasındaki fark","Tüm verilerin toplamı","Ortalamanın standart sapmaya oranı"]'::jsonb,1,'Metin değişim aralığını "en büyük ve en küçük değer arasındaki fark" olarak tanımlar.',2,4),
('c0000004-0000-4000-c000-000000000004','inference','Aynı veri kümesinin ortalama, ortanca ve tepe değerinin farklı çıkması ne anlama gelir?','["Veriler hatalıdır","Her ölçü farklı bir özelliği vurgular; amaca göre seçim yapılmalıdır","Ortalama her zaman yanlıştır","Veri sayısı yetersizdir"]'::jsonb,1,'Metin her ölçünün farklı bilgi sunduğunu, aşırı değerler karşısında davranışlarının ayrıştığını ve amaca uygun seçim yapılması gerektiğini belirtir.',3,5);

-- ══ METİN 5: Denklemler ve Sözel Problemler ══════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000005-0000-4000-c000-000000000005',
  'Birinci Dereceden Denklemler ve Problemler',
  'LGS Matematik',
  'LGS', 2, 432, 4,
  $b$
Denklem, bir bilinmeyenin değerini bulmak için kullanılan matematiksel bir ifadedir. Birinci dereceden bir denklem, bilinmeyenin en yüksek üssünün 1 olduğu denklemdir. Örneğin 3x + 5 = 17 birinci dereceden bir denklemdir.

Denklem çözmek için her iki tarafa aynı işlemi uygulama ilkesi kullanılır. Amacımız bilinmeyeni yalnız bırakmaktır. 3x + 5 = 17 denklemini çözmek için önce her iki taraftan 5 çıkarılır: 3x = 12. Ardından her iki taraf 3'e bölünür: x = 4. Çözümü kontrol etmek için x = 4 denklemde yerine yazılır: 3(4) + 5 = 17. Doğru!

Sözel problem, gerçek hayat durumunu matematiksel denkleme dönüştürme becerisi gerektirir. Bir sözel problemde önce bilinmeyen belirlenir ve bir değişkenle (genellikle x) gösterilir. Ardından problem ifadesindeki ilişkiler denklem biçiminde yazılır. Son olarak denklem çözülür ve sonuç problem bağlamında yorumlanır.

Örneğin "Bir kitabın 3 katı ile 12'nin toplamı 42'dir. Kitabın sayısı nedir?" probleminde bilinmeyen kitap sayısıdır. 3x + 12 = 42 denklemi kurulur; 3x = 30, x = 10 bulunur. Yanıt: 10 kitap.

Yaş problemleri, para problemleri ve hareket problemleri en sık karşılaşılan sözel problem türleridir. Yaş problemlerinde bugünkü yaş bilinmiyorsa x olarak alınır ve birkaç yıl sonraki yaş x + n, birkaç yıl önceki yaş x - n ile gösterilir. Para problemlerinde fiyat × miktar = toplam tutar ilişkisi kullanılır.

Hareket problemlerinde yol = hız × zaman formülü temel alınır. İki araç aynı noktadan aynı anda zıt yönde hareket ediyorsa aralarındaki uzaklık her iki hızın toplamı kadardır. Aynı yönde hareket eden araçlarda ise hız farkı kullanılır.

Birden fazla bilinmeyen içeren problemlerde denklem sistemi kurulur. İki bilinmeyenli bir denklem sistemini çözmek için geçerli yöntemlerden biri yerine koyma yöntemidir: bir denklemden bir bilinmeyenin ifadesi bulunur ve diğer denkleme yerleştirilir. Günlük hayatta fiyat hesaplamalarından proje planlamasına kadar pek çok alanda denklem kullanılmaktadır.
  $b$,
  ARRAY['matematik','denklem','problem','bilinmeyen','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000005-0000-4000-c000-000000000005','main_idea','Bu metin hangi matematik konusunu ele almaktadır?','["Geometri ve alan hesabı","Birinci dereceden denklemler ve sözel problem çözme","Kesirli ifadeler","İkinci dereceden denklemler"]'::jsonb,1,'Metin birinci dereceden denklem kavramını, çözüm adımlarını ve sözel problemlerdeki uygulamalarını kapsamlı şekilde ele alır.',2,1),
('c0000005-0000-4000-c000-000000000005','detail','3x + 5 = 17 denkleminin çözümü nedir?','["x = 2","x = 3","x = 4","x = 6"]'::jsonb,2,'3x = 17 - 5 = 12, x = 12/3 = 4.',1,2),
('c0000005-0000-4000-c000-000000000005','inference','"Bir kitabın 3 katı ile 12''nin toplamı 42''dir" probleminde hangi denklem kurulur?','["x + 3 = 42","12x + 3 = 42","3x + 12 = 42","3x - 12 = 42"]'::jsonb,2,'"3 katı" → 3x; "12 ile toplamı" → + 12; "42''dir" → = 42. Denklem: 3x + 12 = 42.',2,3),
('c0000005-0000-4000-c000-000000000005','vocabulary','Metinde geçen "yerine koyma yöntemi" ne anlama gelir?','["Her iki denklemi toplamak","Bir denklemden bilinmeyenin ifadesini bulup diğer denkleme yazmak","Bilinmeyeni tahmin etmek","İki denklemi birbirinden çıkarmak"]'::jsonb,1,'Metin yerine koyma yöntemini "bir denklemden bir bilinmeyenin ifadesi bulunur ve diğer denkleme yerleştirilir" şeklinde tanımlar.',2,4),
('c0000005-0000-4000-c000-000000000005','detail','Hareket problemlerinde kullanılan temel formül nedir?','["Yol = Hız + Zaman","Yol = Hız × Zaman","Hız = Yol + Zaman","Zaman = Yol × Hız"]'::jsonb,1,'Metin hareket problemleri için "yol = hız × zaman" formülünü açıkça belirtmektedir.',1,5);

-- ══ METİN 6: Geometri — Çokgenler ════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000006-0000-4000-c000-000000000006',
  'Çokgenler: Alan ve Çevre Hesapları',
  'LGS Matematik',
  'LGS', 2, 436, 4,
  $b$
Çokgen, en az üç doğru parçasından oluşan kapalı düzlem şekillerine verilen isimdir. Üç kenarlı çokgen üçgen, dört kenarlı dörtgen, beş kenarlı beşgen, altı kenarlı altıgen olarak adlandırılır. Tüm kenar uzunlukları ve tüm iç açıları birbirine eşit olan çokgenlere düzgün çokgen denir.

Üçgenin alanı = (taban × yükseklik) / 2 formülüyle hesaplanır. Taban uzunluğu 8 cm, yüksekliği 5 cm olan bir üçgenin alanı (8 × 5) / 2 = 20 cm² olur. Üçgenin çevresi ise üç kenar uzunluğunun toplamıdır.

Kare, tüm kenarları eşit ve tüm açıları 90° olan özel bir dörtgendir. Alan = kenar², çevre = 4 × kenardır. Kenarı 6 cm olan bir karenin alanı 36 cm², çevresi 24 cm'dir. Dikdörtgen ise karşılıklı kenarları eşit ve tüm açıları 90° olan dörtgendir. Alan = uzunluk × genişlik, çevre = 2 × (uzunluk + genişlik) formülleri kullanılır.

Paralelkenar, karşılıklı kenarları paralel ve eşit olan dörtgendir. Alanı = taban × yükseklik formülüyle hesaplanır; burada yükseklik iki taban arasındaki dik uzaklıktır. Eşkenar dörtgen (romb), tüm kenarları eşit olan paralelkenardır.

Yamuk, yalnızca bir çifti paralel kenarı olan dörtgendir. Alan = [(üst taban + alt taban) × yükseklik] / 2 formülüyle bulunur. Üst tabanı 4 cm, alt tabanı 8 cm, yüksekliği 5 cm olan bir yamuğun alanı [(4 + 8) × 5] / 2 = 30 cm² olur.

Daire, merkeze eşit uzaklıktaki noktaların oluşturduğu kapalı eğridir. Alan = π × r², çevre (çevrim) = 2 × π × r formülleri kullanılır; burada r yarıçaptır. π ≈ 3,14 veya 22/7 olarak kullanılır. Yarıçapı 7 cm olan bir dairenin alanı yaklaşık 3,14 × 49 ≈ 153,86 cm²'dir.

Bileşik şekillerin alanı, şekli tanıdık parçalara ayırarak her parçanın alanı ayrı ayrı hesaplandıktan sonra toplanarak ya da çıkarılarak bulunur. Gerçek hayatta duvar kaplama, bahçe sulama ve arazi ölçümü gibi birçok alanda alan ve çevre hesapları kullanılmaktadır.
  $b$,
  ARRAY['matematik','geometri','alan','çevre','çokgen','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000006-0000-4000-c000-000000000006','main_idea','Bu metinin konusu nedir?','["Üçgen ve daire özellikleri","Çeşitli çokgenlerin alan ve çevre hesaplama formülleri","Koordinat geometrisi","Simetri ve dönüşümler"]'::jsonb,1,'Metin üçgen, kare, dikdörtgen, paralelkenar, yamuk ve daireyi alan/çevre formülleriyle kapsamlı şekilde inceler.',2,1),
('c0000006-0000-4000-c000-000000000006','detail','Tabası 8 cm, yüksekliği 5 cm olan üçgenin alanı kaç cm²''dir?','["40","20","13","80"]'::jsonb,1,'Alan = (8 × 5) / 2 = 20 cm².',1,2),
('c0000006-0000-4000-c000-000000000006','inference','Üst tabanı 4 cm, alt tabanı 10 cm, yüksekliği 6 cm olan yamuğun alanı kaç cm²''dir?','["84","42","60","24"]'::jsonb,1,'Alan = [(4 + 10) × 6] / 2 = 84/2 = 42 cm².',2,3),
('c0000006-0000-4000-c000-000000000006','vocabulary','Metinde "düzgün çokgen" nasıl tanımlanmıştır?','["Yalnızca iç açıları eşit çokgen","Tüm kenar uzunlukları ve iç açıları birbirine eşit çokgen","En az altı kenarı olan çokgen","Yalnızca kenarları eşit çokgen"]'::jsonb,1,'Metin düzgün çokgeni "tüm kenar uzunlukları ve tüm iç açıları birbirine eşit olan çokgenler" şeklinde tanımlar.',2,4),
('c0000006-0000-4000-c000-000000000006','detail','Yarıçapı 7 cm olan bir dairenin çevresi (π ≈ 22/7 alınırsa) kaç cm''dir?','["44","154","22","77"]'::jsonb,0,'Çevre = 2 × π × r = 2 × (22/7) × 7 = 44 cm.',2,5);

-- ══ METİN 7: Tam Sayılar ve Örüntüler ════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000007-0000-4000-c000-000000000007',
  'Sayı Örüntüleri ve Diziler',
  'LGS Matematik',
  'LGS', 2, 425, 4,
  $b$
Sayı örüntüsü, belirli bir kurala göre oluşturulan sayı dizisidir. Dizideki her sayıya terim denir. Örüntüyü keşfetmek, sonraki terimleri tahmin etmeyi ve genel terimin formülünü bulmayı sağlar.

En basit sayı örüntüsü aritmetik dizidir. Aritmetik dizide ardışık terimler arasındaki fark sabittir ve bu sabit farka ortak fark (d) denir. 3, 7, 11, 15, ... dizisinde her terimden önce gelen terime 4 eklendiği görülür; dolayısıyla ortak fark d = 4'tür. Herhangi bir terimin değeri formülle bulunabilir: n. terim = ilk terim + (n - 1) × d. Bu dizinin 10. terimi 3 + (10-1) × 4 = 3 + 36 = 39'dur.

Geometrik dizide ardışık terimler arasındaki oran sabittir ve bu sabit orana ortak çarpan (r) denir. 2, 6, 18, 54, ... dizisinde her terim bir öncekinin 3 katıdır; dolayısıyla r = 3'tür. n. terim = ilk terim × r^(n-1) formülüyle hesaplanır.

Örüntüler yalnızca sayısal olmayabilir; şekil örüntüleri de çok yaygındır. Noktalar veya kareler belirli bir düzende dizildiğinde kaçıncı şekilde kaç eleman olduğu sorusu örüntü kuralına bakılarak yanıtlanır.

Pascal üçgeni özel bir sayı örüntüsüdür. Her sayı üzerindeki iki sayının toplamına eşittir. 1, 1-1, 1-2-1, 1-3-3-1, 1-4-6-4-1 şeklinde devam eder. Pascal üçgeninde her satırın toplamı 2 nin kuvvetlerine eşittir; 1, 2, 4, 8, 16, ... biçiminde artar. Bu üçgen binom açılımı ve olasılık hesaplarında önemli bir araçtır.

Fibonacci dizisi doğada sıkça rastlanan özel bir örüntüdür. Her terim kendinden önceki iki terimin toplamıdır: 1, 1, 2, 3, 5, 8, 13, 21, ... Bu dizi çiçek yapraklarının dizilimi, deniz kabuklarının sarmal yapısı ve dal kollamasındaki örüntüyle örtüşmektedir.

Örüntüler, matematik eğitiminde mantıksal düşünme ve genelleme becerilerini geliştirmek için kullanılır. Günlük hayatta taksitli alışverişlerde, takvim hesaplarında ve mühendislik tasarımlarında sayı örüntülerinden yararlanılır.
  $b$,
  ARRAY['matematik','örüntü','dizi','aritmetik','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000007-0000-4000-c000-000000000007','main_idea','Bu metinin temel konusu nedir?','["Geometrik şekil çizimi","Sayı örüntüleri: aritmetik dizi, geometrik dizi ve özel örüntüler","Fibonacci dizisinin doğadaki yeri","Pascal üçgeninin özellikleri"]'::jsonb,1,'Metin sayı örüntüsü, aritmetik ve geometrik diziyi, Pascal üçgenini ve Fibonacci dizisini kapsamlı biçimde ele alır.',2,1),
('c0000007-0000-4000-c000-000000000007','detail','3, 7, 11, 15, ... dizisinin 10. terimi nedir?','["35","39","43","47"]'::jsonb,1,'n. terim = 3 + (n-1) × 4. 10. terim = 3 + 9 × 4 = 3 + 36 = 39.',2,2),
('c0000007-0000-4000-c000-000000000007','inference','2, 6, 18, 54 dizisinin sonraki terimi nedir?','["108","162","72","162"]'::jsonb,1,'Geometrik dizi; ortak çarpan r = 3. 54 × 3 = 162.',2,3),
('c0000007-0000-4000-c000-000000000007','vocabulary','Metinde "ortak fark" ne anlama gelir?','["Dizinin en küçük terimi","Aritmetik dizide ardışık terimler arasındaki sabit fark","Geometrik dizideki çarpan","İlk ve son terim arasındaki fark"]'::jsonb,1,'Metin ortak farkı "ardışık terimler arasındaki sabit fark" olarak tanımlar.',2,4),
('c0000007-0000-4000-c000-000000000007','inference','Fibonacci dizisinde 8. terim nedir? (1, 1, 2, 3, 5, 8, 13, ...)','["21","13","34","18"]'::jsonb,0,'Her terim önceki ikinin toplamı: 1,1,2,3,5,8,13,21. 8. terim = 21.',2,5);

-- ══ METİN 8: Kesirler ve Rasyonel Sayılar ════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000008-0000-4000-c000-000000000008',
  'Kesirler ve Rasyonel Sayılar',
  'LGS Matematik',
  'LGS', 2, 430, 4,
  $b$
Rasyonel sayılar, a/b biçiminde yazılabilen sayılardır; burada a ve b tam sayı, b ise sıfırdan farklıdır. Kesirler, tam sayılar ve sonlu ya da periyodik ondalıklı sayılar rasyonel sayılardır. Örneğin 3/4, -5, 0,75 ve 0,333... rasyonel sayılardır.

İki kesri karşılaştırmak için payda eşitlemesi yapılır. 2/3 ile 3/4 karşılaştırılırken ortak payda 12 alınır: 8/12 ve 9/12. Böylece 3/4 > 2/3 olduğu anlaşılır. Alternatif olarak çapraz çarpım yöntemi kullanılabilir: 2 × 4 = 8 < 3 × 3 = 9 olduğundan 2/3 < 3/4'tür.

Kesirlerde toplama ve çıkarma işlemleri için paydalar eşitlenmelidir. Farklı paydalar OBEB ve OKEK yardımıyla eşitlenir. Örneğin 1/3 + 1/4 = 4/12 + 3/12 = 7/12'dir. Çarpma işleminde ise pay paylarla, payda paydalarla çarpılır: 2/3 × 3/5 = 6/15 = 2/5.

Bölme işlemi, bölenin çarptığı sayıyla bölümün kesri çevrilip çarpılmasıyla yapılır. (2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6. Kesirleri basitleştirmek için pay ve payda en büyük ortak bölenlerine (EBOB) bölünür.

Gerçek hayatta kesir ve yüzde birbirine dönüştürülerek kullanılır. 3/4 = 0,75 = %75. Bir ürünün fiyatının 3/5'i indirim yapıldığında geri kalan oran 1 - 3/5 = 2/5'tir. Reçetelerde, tamirat hesaplamalarında ve tarımsal üretim hesaplarında kesir dönüşümleri zorunludur.

Orantılı bölme, bir miktarı belirli bir oranda paylaştırmaktır. 200 TL'yi 2:3 oranında paylaştırmak için toplam parça sayısı 2 + 3 = 5'tir. Her parçanın değeri 200/5 = 40 TL'dir. Birinci kişi 2 × 40 = 80 TL, ikinci kişi 3 × 40 = 120 TL alır.

Kesirlerin anlaşılması, ileri matematik konuları için temel oluşturur. Cebir, orantı, olasılık ve analitik geometri gibi konular kesir işlemlerine doğrudan bağlıdır. Günlük alışverişten mimari planlara kadar hayatın her alanında kesir hesapları kullanılmaktadır.
  $b$,
  ARRAY['matematik','kesir','rasyonel sayı','payda','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000008-0000-4000-c000-000000000008','main_idea','Metnin temel konusu nedir?','["Ondalıklı sayı işlemleri","Rasyonel sayılar ve kesir işlemleri ile uygulamaları","Tam sayılarda bölme","EBOB ve EKEK hesapları"]'::jsonb,1,'Metin rasyonel sayıları, kesir işlemlerini (toplama/çıkarma/çarpma/bölme) ve günlük hayat uygulamalarını kapsar.',2,1),
('c0000008-0000-4000-c000-000000000008','detail','1/3 + 1/4 işleminin sonucu nedir?','["2/7","2/12","7/12","5/12"]'::jsonb,2,'Ortak payda 12; 4/12 + 3/12 = 7/12.',1,2),
('c0000008-0000-4000-c000-000000000008','inference','200 TL''yi 2:3 oranında paylaştırıldığında büyük pay kaç TL alır?','["80","100","120","150"]'::jsonb,2,'Toplam parça = 5; her parça = 40 TL. 3 parça = 120 TL.',2,3),
('c0000008-0000-4000-c000-000000000008','vocabulary','Metinde "EBOB" ne anlama gelir?','["En büyük ortak bölen","En büyük ortak bölünen","En büyük ortak çarpan","En büyük ortak kesir"]'::jsonb,0,'Metin kesirleri basitleştirmek için "en büyük ortak bölen (EBOB)" kullanıldığını belirtir.',2,4),
('c0000008-0000-4000-c000-000000000008','detail','(2/3) ÷ (4/5) işleminin sonucu nedir?','["8/15","5/6","2/4","10/15"]'::jsonb,1,'(2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6.',2,5);

-- ══ METİN 9: Dönüşüm Geometrisi ══════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000009-0000-4000-c000-000000000009',
  'Dönüşüm Geometrisi: Yansıma, Öteleme ve Dönme',
  'LGS Matematik',
  'LGS', 3, 438, 4,
  $b$
Dönüşüm geometrisi, düzlemdeki şekillerin çeşitli hareketler sonucunda nasıl değiştiğini inceleyen bir geometri dalıdır. Temel dönüşüm türleri yansıma, öteleme ve dörmedir.

Yansıma, bir şeklin bir doğruya (eksen) göre ayna görüntüsünün oluşturulmasıdır. Yansıma eksenine dik çizilip eksenin karşı tarafına geçildiğinde görüntü noktası bulunur. Görüntü ile orijinal nokta arasındaki mesafe eksen üzerinde eşittir. Örneğin bir noktanın y eksenine göre yansıması alındığında x koordinatının işareti değişir: (3, 5) noktasının y eksenine göre yansıması (-3, 5)'tir.

Öteleme, bir şeklin belirli bir yönde belirli bir miktar kaydırılmasıdır. (a, b) vektörüyle öteleme yapıldığında her nokta x koordinatına a, y koordinatına b eklenerek yeni konumunu bulur: (x, y) → (x + a, y + b). Öteleme sonucu elde edilen şekil orijinal şekille tamamen özdeştir; yalnızca konumu değişir.

Dönme, bir şeklin bir merkez noktası etrafında belirli bir açı döndürülmesidir. Dönme merkezi, dönme açısı ve dönme yönü (saat yönü veya saat yönünün tersine) dönmeyi belirleyen üç temel bilgidir. Orijin etrafında 90° saat yönünde döndürme işleminde (x, y) → (y, -x) dönüşümü gerçekleşir.

Bu dönüşümlerin hepsi boyut değiştirmez; yani şeklin boyutları ve alanı korunur. Bu dönüşümlere izometri adı verilir. Buna karşın büyütme ya da küçültme içeren dönüşümlere benzerlik dönüşümü veya homotetidir.

Simetri dönüşüm geometrisiyle yakından ilgilidir. Bir şekil belirli bir eksene göre yansıtıldığında kendisiyle örtüşüyorsa o şeklin simetri ekseni bulunmaktadır. Düzgün üçgenin 3, karenin 4, dairenin sonsuz simetri ekseni vardır.

Dönüşüm geometrisi, bilgisayar grafiği, oyun tasarımı, mimari çizim ve robotik gibi alanlarda yaygın biçimde kullanılmaktadır. Düzlemdeki görüntü işlemlerinden büyük bina planlarının hazırlanmasına kadar pek çok mühendislik uygulamasında dönüşüm denklemleri temel araçtır.
  $b$,
  ARRAY['matematik','geometri','dönüşüm','yansıma','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000009-0000-4000-c000-000000000009','main_idea','Bu metinin konusu nedir?','["Koordinat sisteminde nokta belirleme","Yansıma, öteleme ve dönme dönüşümleri","Alan ve çevre hesabı","Trigonometri"]'::jsonb,1,'Metin temel dönüşüm türlerini (yansıma, öteleme, dönme) tanımlar ve özelliklerini açıklar.',2,1),
('c0000009-0000-4000-c000-000000000009','detail','(3, 5) noktasının y eksenine göre yansıması nedir?','["(3, -5)","-3, 5)","(-3, -5)","(5, 3)"]'::jsonb,1,'Y eksenine göre yansımada x işareti değişir: (3, 5) → (-3, 5).',2,2),
('c0000009-0000-4000-c000-000000000009','inference','(2, 3) noktası (4, -1) vektörüyle öteleniyor. Yeni konum nedir?','["(6, 2)","(2, 4)","(6, -2)","(8, -3)"]'::jsonb,0,'Öteleme: (2+4, 3+(-1)) = (6, 2).',2,3),
('c0000009-0000-4000-c000-000000000009','vocabulary','Metinde "izometri" ne anlama gelmektedir?','["Şekli büyüten dönüşüm","Boyutları ve alanı koruyan dönüşüm","Yalnızca yansıma dönüşümü","Koordinat değiştiren dönüşüm"]'::jsonb,1,'Metin izometriyi "boyut değiştirmeyen yani şeklin boyutları ve alanının korunduğu dönüşümler" olarak açıklar.',2,4),
('c0000009-0000-4000-c000-000000000009','detail','Kaçıncı simetri ekseni bulunur? Kare için yanıt nedir?','["2","3","4","Sonsuz"]'::jsonb,2,'Metin "karenin 4 simetri ekseni vardır" şeklinde belirtir.',2,5);

-- ══ METİN 10: Üçgenler ve Pisagor ════════════════════════════════
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'c0000010-0000-4000-c000-000000000010',
  'Üçgenler ve Pisagor Teoremi',
  'LGS Matematik',
  'LGS', 3, 433, 4,
  $b$
Üçgen, üç kenarı ve üç açısı olan çokgenlerin en temel örneğidir. Üçgende üç iç açının toplamı her zaman 180°'dir. Bu kural üçgenin türü ne olursa olsun geçerlidir: eşkenar, ikizkenar veya çeşitkenar üçgenlerde de iç açılar toplamı daima 180°'dir.

Üçgenler iç açılarına göre üçe ayrılır. Tüm açıları 90°'den küçük olan üçgene dar açılı üçgen, bir açısı tam 90° olan üçgene dik açılı üçgen ve bir açısı 90°'den büyük olan üçgene geniş açılı üçgen denir. Dik açılı üçgende 90° olan açının karşısındaki en uzun kenara hipotenüs adı verilir.

Pisagor Teoremi, dik açılı üçgenin kenarları arasındaki temel ilişkiyi verir: dik kenarlarin karelerinin toplamı hipotenüsün karesine eşittir. Formülle ifade edilirse a² + b² = c²; burada a ve b dik kenarlar, c hipotenüstür. Dik kenarları 3 cm ve 4 cm olan bir üçgenin hipotenüsü: 3² + 4² = 9 + 16 = 25, √25 = 5 cm'dir. Bu, en temel Pisagor üçlüsü olan (3, 4, 5)'tir.

Pisagor üçlüleri, tam sayılardan oluşan ve Pisagor Teoremi'ni sağlayan kenar gruplarıdır. (3,4,5), (5,12,13), (8,15,17) bilinen üçlülerdir. Bu üçlüler kat alınarak (6,8,10), (9,12,15) gibi yeni üçlüler elde edilebilir.

Pisagor Teoremi, bir üçgenin dik açılı olup olmadığını test etmek için de kullanılır. Kenarlar a, b, c (c en büyük) olduğunda a² + b² = c² ise üçgen dik açılı, a² + b² > c² ise dar açılı, a² + b² < c² ise geniş açılıdır.

Pisagor Teoremi'nin uygulama alanları son derece geniştir. Yapı inşaatında köşelerin tam dik açıda olup olmadığını kontrol etmek, iki nokta arasındaki uzaklığı koordinat sisteminde hesaplamak, elektronik devrelerde bileşen konumlarını belirlemek ve navigasyon sistemlerinde mesafe hesaplamak bu uygulamalar arasında sayılabilir. Matematiğin en önemli teoremlerinden biri olan Pisagor Teoremi, yaklaşık 2500 yıl önce kanıtlanmış ve hâlâ aktif biçimde kullanılmaktadır.
  $b$,
  ARRAY['matematik','üçgen','pisagor','geometri','LGS'], 'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('c0000010-0000-4000-c000-000000000010','main_idea','Bu metinin temel konusu nedir?','["Açı hesaplamaları","Üçgen türleri ve Pisagor Teoremi","Koordinat geometrisi","Geometrik dönüşümler"]'::jsonb,1,'Metin üçgen türlerini, iç açı toplamını ve Pisagor Teoremi''ni kapsamlı biçimde ele alır.',2,1),
('c0000010-0000-4000-c000-000000000010','detail','Dik kenarları 3 cm ve 4 cm olan dik üçgenin hipotenüsü kaç cm''dir?','["7","5","6","√7"]'::jsonb,1,'3² + 4² = 9 + 16 = 25; √25 = 5 cm.',1,2),
('c0000010-0000-4000-c000-000000000010','inference','Kenarları 5, 12 ve 14 cm olan bir üçgen hangi türdendir?','["Dik açılı","Dar açılı","Geniş açılı","Eşkenar"]'::jsonb,2,'5² + 12² = 25 + 144 = 169; 14² = 196. 169 < 196 olduğundan geniş açılıdır.',3,3),
('c0000010-0000-4000-c000-000000000010','vocabulary','Metinde "hipotenüs" nasıl tanımlanmıştır?','["Dik açılı üçgenin en kısa kenarı","Dik açıya bitişik her iki dik kenar","Dik açının karşısındaki en uzun kenar","Eşkenar üçgendeki herhangi bir kenar"]'::jsonb,2,'Metin hipotenüsü "dik açılı üçgende 90° olan açının karşısındaki en uzun kenar" olarak tanımlar.',2,4),
('c0000010-0000-4000-c000-000000000010','inference','Pisagor Teoremi inşaatta nasıl kullanılabilir?','["Boya miktarını hesaplamak için","Köşelerin tam dik açıda olup olmadığını kontrol etmek için","Zeminin sertliğini ölçmek için","Sıcaklık değişimini hesaplamak için"]'::jsonb,1,'Metin "yapı inşaatında köşelerin tam dik açıda olup olmadığını kontrol etmek" uygulamasını açıkça belirtir.',2,5);

END $migration$;
