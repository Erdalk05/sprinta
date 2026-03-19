-- ================================================================
-- 070_missing_questions.sql
-- Eksik soruları tamamla:
--   AYT Biyoloji×5, AYT Fizik×5, AYT Kimya×5 → 2 soru ekle (3→5)
--   LGS İngilizce×8 → 1 soru ekle (4→5)
-- ================================================================

DO $migration$
BEGIN

-- ─── AYT BİYOLOJİ ────────────────────────────────────────────────

-- Bağışıklık Sistemi
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '077f08d5-acd0-4f6a-acd1-8326d386a1c0') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('077f08d5-acd0-4f6a-acd1-8326d386a1c0','detail',
 'Metne göre sitotoksik T hücreleri (CD8⁺) hangi görevi üstlenir?',
 '["B hücrelerini antikor üretimine teşvik eder","Virüsle enfekte olmuş veya kanserli hücreleri öldürür","Alerjen maddelere karşı IgE üretir","İmmün yanıtın aşırıya kaçmasını önler"]'::jsonb,
 1,'Metin CD8⁺ T hücrelerini "virüsle enfekte olmuş ya da kanserli hücreleri tanıyarak öldürür" şeklinde tanımlar.',3,4),
('077f08d5-acd0-4f6a-acd1-8326d386a1c0','inference',
 'Bir kişide IgE antikorlarının aşırı üretilmesi hangi duruma yol açar?',
 '["Otoimmün hastalık","Alerji belirtileri","Yetersiz bağışıklık","Kompleman aktivasyonu"]'::jsonb,
 1,'Metin IgE antikorlarının mast hücrelerini aktive ederek histamin salınımına yol açtığını ve bunun alerji belirtilerine neden olduğunu belirtir.',3,5);
END IF;

-- DNA Replikasyonu ve Protein Sentezi
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '035d978c-dd91-4a7c-b77d-a251f0354572') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('035d978c-dd91-4a7c-b77d-a251f0354572','detail',
 'Translasyon sürecinde tRNA''nın işlevi nedir?',
 '["DNA sarmalını açmak","mRNA sentezlemek","Kodona uygun aminoasidi taşımak ve mRNA ile eşleşmek","Peptit bağlarını kırmak"]'::jsonb,
 2,'Metin tRNA''yı "antikodon ucu mRNA kodonu ile eşleşirken diğer ucunda o kodona karşılık gelen aminoasidi taşır" şeklinde tanımlar.',3,4),
('035d978c-dd91-4a7c-b77d-a251f0354572','inference',
 'Okazaki fragmanlarının oluşmasının temel nedeni nedir?',
 '["Helikaz enziminin yetersiz çalışması","DNA polimerazın yalnızca 5→3 yönünde sentez yapabilmesi","Prokaryotlarda tek başlangıç noktası bulunması","İntronların çıkarılması gerekliliği"]'::jsonb,
 1,'Metin DNA polimerazın yalnızca 5→3 yönünde sentezleyebildiğini, bu nedenle geciktirilen ipliğin Okazaki fragmanları halinde oluşturulduğunu belirtir.',3,5);
END IF;

-- Evrim ve Doğal Seçilim
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '0ee2ba57-aaa6-4139-b79c-45f5359c3a3b') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('0ee2ba57-aaa6-4139-b79c-45f5359c3a3b','detail',
 'Genetik sürüklenme özellikle hangi koşulda önem kazanır?',
 '["Büyük populasyonlarda","Küçük populasyonlarda","Coğrafi izolasyon yokken","Doğal seçilimin işlediği ortamlarda"]'::jsonb,
 1,'Metin genetik sürüklenmenin "özellikle küçük populasyonlarda önem kazandığını" açıkça belirtir.',3,4),
('0ee2ba57-aaa6-4139-b79c-45f5359c3a3b','inference',
 'İki popülasyonun farklı türler haline geldiği nasıl anlaşılır?',
 '["Farklı habitatlarda yaşamaları","Artık çiftleşip verimli yavru üretememeleri","Farklı beslenme alışkanlıklarına sahip olmaları","Renk bakımından birbirinden ayrışmaları"]'::jsonb,
 1,'Metin "yeterli genetik farklılaşma sağlandığında iki popülasyon artık çiftleşip verimli yavru üretemez ve farklı türler haline gelmiş sayılır" ifadesini kullanır.',3,5);
END IF;

-- Mitoz ve Mayoz Karşılaştırması
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'a4c1110c-e037-438f-a37a-3eec15785ee9') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('a4c1110c-e037-438f-a37a-3eec15785ee9','detail',
 'Mayoz bölünme kaç bölünme evresinden oluşur?',
 '["1","2","3","4"]'::jsonb,
 1,'Mayoz I ve Mayoz II olmak üzere iki ardışık bölünme gerçekleşir.',3,4),
('a4c1110c-e037-438f-a37a-3eec15785ee9','inference',
 'Mitozda oluşan yavru hücrelerin genetik yapısı ana hücreyle nasıldır?',
 '["Yarı yarıya farklıdır","Tamamen özdeştir","Dört kat daha fazla gen taşır","Rastgele farklıdır"]'::jsonb,
 1,'Mitoz bölünme sonucunda oluşan iki yavru hücre, ana hücreyle genetik olarak özdeştir (diploid → diploid, aynı gen dizisi).',3,5);
END IF;

-- Sinir Sistemi ve Nöron Fizyolojisi
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '6ffcd014-41db-49af-ac0e-6106a6b2efec') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('6ffcd014-41db-49af-ac0e-6106a6b2efec','detail',
 'Aksiyon potansiyelinin oluşmasında hangi iyon kanalları önce açılır?',
 '["K⁺ kanalları","Na⁺ kanalları","Ca²⁺ kanalları","Cl⁻ kanalları"]'::jsonb,
 1,'Depolarizasyon sürecinde önce Na⁺ kanalları açılarak içeriye Na⁺ girişi gerçekleşir.',3,4),
('6ffcd014-41db-49af-ac0e-6106a6b2efec','inference',
 'Miyelinli aksonlarda sinyal iletimi miyelinsizlere göre neden daha hızlıdır?',
 '["Akson çapı daha geniştir","İmpuls Ranvier boğumlarından sıçrayarak ilerler (tuzlayıcı iletim)","Daha fazla nörotransmitter salgılanır","Sinaptik aralık daha kısadır"]'::jsonb,
 1,'Miyelin kılıfı elektrik yalıtımı sağlar; impuls sadece Ranvier boğumlarında yeniden üretilir (saltatory conduction), bu da iletimi büyük ölçüde hızlandırır.',3,5);
END IF;

-- ─── AYT FİZİK ───────────────────────────────────────────────────

-- Elektromanyetik Dalgalar ve Işığın Doğası
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'ea94e520-f14c-4227-8e01-35a3d400c3ef') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('ea94e520-f14c-4227-8e01-35a3d400c3ef','detail',
 'Elektromanyetik dalgaların iletim için ortama ihtiyaç duymamasının nedeni nedir?',
 '["Düşük frekansa sahip olmaları","Değişen elektrik ve manyetik alanların birbirini oluşturması","Foton kütlesinin sıfır olması","Işık hızında yayılmaları"]'::jsonb,
 1,'EM dalgalar değişen elektrik ve manyetik alanların birbirini beslemesiyle yayılır; boşlukta herhangi bir madde gerektirmez.',3,4),
('ea94e520-f14c-4227-8e01-35a3d400c3ef','inference',
 'Fotoelektrik olay klasik dalga teorisiyle açıklanamaz. Bunun temel nedeni nedir?',
 '["Işığın frekansının çok yüksek olması","Elektron kopması için eşik frekansı bulunması ve bunun yoğunlukla değil frekansla ilişkili olması","Metal yüzeyin ışığı yansıtması","Elektronların negatif yüklü olması"]'::jsonb,
 1,'Klasik teoride yoğunluk artarsa elektron kopması beklenir; ancak deneyde eşik frekansı altında hiç kopma olmuyor. Bu durum foton (kuantum) modelini gerektirdi.',3,5);
END IF;

-- Kuantum Mekaniği ve Dalga-Parçacık İkilemi
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'ccc342ec-af85-4da2-b8db-10d603cc5e42') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('ccc342ec-af85-4da2-b8db-10d603cc5e42','detail',
 'Heisenberg''in belirsizlik ilkesine göre aynı anda kesin olarak bilinemeyen büyüklükler hangileridir?',
 '["Kütlesi ve enerjisi","Konumu ve momentumu","Hızı ve kütlesi","Elektrik yükü ve kütlesi"]'::jsonb,
 1,'Heisenberg belirsizlik ilkesi: Δx · Δp ≥ ℏ/2 — konum ve momentum eş zamanlı olarak kesin bilinemez.',3,4),
('ccc342ec-af85-4da2-b8db-10d603cc5e42','inference',
 'Schrödinger dalga denklemi elektronun tam konumunu vermez, olasılık dağılımı verir. Bu durum hangi anlayışı yansıtır?',
 '["Newton mekaniğinin geçerliliğini","Kuantum sistemlerde deterministik olmayan yapıyı","Elektronun kütlesiz olduğunu","Maddenin yalnızca parçacık yapısını"]'::jsonb,
 1,'Kuantum mekaniği determinist değil probabilistiktir; dalga fonksiyonu elektronun belirli bir yerde bulunma olasılığını verir.',3,5);
END IF;

-- Nükleer Fizik ve Radyoaktivite
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'a47c1d7b-b02a-42c1-98d3-7c5f6d1814a5') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('a47c1d7b-b02a-42c1-98d3-7c5f6d1814a5','detail',
 'Alfa bozunmasında çekirdekten kopan parçacık nedir?',
 '["Bir proton","Bir nötron","Helyum-4 çekirdeği (2 proton + 2 nötron)","Bir elektron"]'::jsonb,
 2,'Alfa parçacığı ⁴He çekirdeğidir; 2 proton ve 2 nötrondan oluşur.',3,4),
('a47c1d7b-b02a-42c1-98d3-7c5f6d1814a5','inference',
 'Yarı ömrü 10 yıl olan bir radyoaktif elementin 40 yıl sonra kalan miktarı başlangıcının kaçta kaçı olur?',
 '["1/2","1/4","1/8","1/16"]'::jsonb,
 3,'40 yıl = 4 yarı ömür. Kalan miktar = (1/2)⁴ = 1/16.',3,5);
END IF;

-- Özel Görelilik Teorisi
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '26db5bcd-054d-4401-9211-1508b0f3ac9e') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('26db5bcd-054d-4401-9211-1508b0f3ac9e','detail',
 'Einstein''ın Özel Görelilik Teorisi''nin iki temel postülatından biri nedir?',
 '["Işık hızı gözlemciye göre değişir","Tüm eylemsizlik sistemlerinde fizik yasaları aynıdır","Uzay mutlak ve değişmezdir","Zaman herkes için eşit geçer"]'::jsonb,
 1,'Özel göreliliğin iki postülatı: (1) Fizik yasaları tüm eylemsizlik sistemlerinde aynıdır, (2) Işık hızı tüm eylemsizlik sistemlerinde sabittir (c ≈ 3×10⁸ m/s).',3,4),
('26db5bcd-054d-4401-9211-1508b0f3ac9e','inference',
 'Işık hızına yakın hareket eden uzay gemisinde zaman daha yavaş geçer. Bu etkiye ne ad verilir?',
 '["Uzay bükmesi","Zaman genişlemesi (zaman dilasyonu)","Kütle artışı","Uzunluk kasılması"]'::jsonb,
 1,'Görelilik teorisinde hız arttıkça zaman daha yavaş geçer; buna zaman dilasyonu (time dilation) denir.',3,5);
END IF;

-- Termodinamik Yasalar
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '26fd5a61-c367-4793-83d6-f7484f8a60e4') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('26fd5a61-c367-4793-83d6-f7484f8a60e4','detail',
 'Termodinamiğin birinci yasası neyi ifade eder?',
 '["Entropi spontan süreçlerde her zaman artar","Enerji yaratılamaz yok edilemez yalnızca dönüştürülebilir","Mutlak sıfırda entropi sıfırdır","Isı sıcak cisimden soğuk cisme kendiliğinden geçer"]'::jsonb,
 1,'Birinci yasa enerji korunumudur: ΔU = Q − W. Enerji yaratılamaz ya da yok edilemez, yalnızca biçim değiştirir.',2,4),
('26fd5a61-c367-4793-83d6-f7484f8a60e4','inference',
 'Termodinamiğin ikinci yasasına göre neden gerçek makinelerin verimi hiçbir zaman %100 olamaz?',
 '["Yakıt yeterince verimli yakılmaz","Her gerçek süreçte entropi artar ve bir miktar enerji düzensiz ısıya dönüşür","Pistonlar sürtünmesiz yapılamaz","Birinci yasa bunu yasaklar"]'::jsonb,
 1,'İkinci yasa gereği izole sistemde entropi azalamaz; her gerçek süreçte bir kısım enerji geri kazanılamayan ısı formuna dönüşür ve verim %100 olamaz.',3,5);
END IF;

-- ─── AYT KİMYA ───────────────────────────────────────────────────

-- Asit-Baz Dengesi ve pH
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '3d5b1016-f13e-4291-920d-284deb276072') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('3d5b1016-f13e-4291-920d-284deb276072','detail',
 'pH 7''nin altındaki bir çözeltinin özelliği nedir?',
 '["Bazik","Nötr","Asidik","Tampon"]'::jsonb,
 2,'pH = -log[H⁺]; pH < 7 → asidik, pH = 7 → nötr, pH > 7 → bazik.',1,4),
('3d5b1016-f13e-4291-920d-284deb276072','inference',
 'Güçlü bir asit çözeltisine az miktarda kuvvetli baz eklendiğinde pH nasıl değişir?',
 '["Hızla 7''ye yükselir","Tampon etkisi gösterir ve az değişir","Belirgin biçimde artar ama 7''nin altında kalır","Hiç değişmez"]'::jsonb,
 2,'Tampon çözelti olmadığı için pH belirgin artar; ancak asit hâlâ fazla olduğundan 7''nin altında kalır.',3,5);
END IF;

-- Elektrokimya: Piller ve Elektroliz
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '5781a608-5750-4b67-8061-417afbc8eb0b') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('5781a608-5750-4b67-8061-417afbc8eb0b','detail',
 'Galvanik hücrede elektron akışı hangi yönde gerçekleşir?',
 '["Katottan anota","Anotta oksitlenme anotta indirgenme","Anottan (oksitlenme elektrodu) katoda (indirgenme elektrodu)","Tuz köprüsü üzerinden elektronlar akar"]'::jsonb,
 2,'Galvanik hücrede elektron akışı: anot (oksitlenme) → dış devre → katot (indirgenme). Tuz köprüsü iyonları taşır, elektron taşımaz.',3,4),
('5781a608-5750-4b67-8061-417afbc8eb0b','inference',
 'Elektroliz ve galvanik hücre arasındaki temel fark nedir?',
 '["Kullanılan elementler farklıdır","Galvanik hücre kimyasal enerjiyi elektriğe, elektroliz elektriği kimyasal enerjiye dönüştürür","Her ikisi de ısı üretir","Elektrolizde elektron akışı yoktur"]'::jsonb,
 1,'Galvanik hücre kendiliğinden gerçekleşen redoks → elektrik enerjisi. Elektrolizde dış elektrik kaynağı zorla redoks tepkimesi yaptırır.',3,5);
END IF;

-- Kimyasal Bağlar ve Moleküler Yapı
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'ae4511d4-b1a0-4178-9ea2-bd57dc516873') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('ae4511d4-b1a0-4178-9ea2-bd57dc516873','detail',
 'Kovalent bağ nasıl oluşur?',
 '["Bir atom elektronu tamamen diğerine aktarır","İki atom arasında elektron çifti ortaklaşa kullanılır","Pozitif ve negatif iyonlar birbirini çeker","Metal atomları elektron denizinde yüzer"]'::jsonb,
 1,'Kovalent bağ; iki atom arasında elektron çiftinin ortaklaşa kullanımıyla oluşur.',2,4),
('ae4511d4-b1a0-4178-9ea2-bd57dc516873','inference',
 'Su molekülünün (H₂O) bent (köşeli) geometrisi olmasının temel nedeni nedir?',
 '["Oksijen atomunun ağır olması","Oksijendeki iki bağ yapmayan elektron çiftinin bağları itmesi","Hidrojen atomlarının küçük olması","Bağ uzunluklarının eşit olmaması"]'::jsonb,
 1,'VSEPR teorisine göre oksijendeki iki yalnız çift, bağ çiftlerini iterek molekülü doğrusaldan uzaklaştırır ve bent yapı oluşturur.',3,5);
END IF;

-- Kimyasal Denge ve Le Chatelier İlkesi
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '0fd34809-fe08-4a4f-9f92-a5bfedce1ba9') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('0fd34809-fe08-4a4f-9f92-a5bfedce1ba9','detail',
 'Denge sabitinin (K) büyük olması ne anlama gelir?',
 '["Tepkime hiç ilerlemez","Ürünler reaktiflere göre dengede fazladır","Sıcaklık yüksektir","Tepkime yavaş gerçekleşir"]'::jsonb,
 1,'K >> 1 ise denge ürünler tarafına kaymıştır; ürün konsantrasyonları reaktiflerinkinden çok büyüktür.',3,4),
('0fd34809-fe08-4a4f-9f92-a5bfedce1ba9','inference',
 'Le Chatelier ilkesine göre ekzotermik bir tepkimede sıcaklık artırılırsa denge nasıl kayar?',
 '["Ürün tarafına kayar","Değişmez","Reaktif tarafına kayar","Denge sabiti büyür"]'::jsonb,
 2,'Ekzotermik tepkimede ısı ürün gibi davranır. Sıcaklık artışı sistemi dengeyi bozan faktörü azaltmak için reaktif tarafına iter.',3,5);
END IF;

-- Organik Kimya: Fonksiyonel Gruplar
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = '21148f8e-d247-4408-bf4d-12b36be3fa24') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('21148f8e-d247-4408-bf4d-12b36be3fa24','detail',
 'Alkollerin genel fonksiyonel grubu nedir?',
 '["-COOH (karboksil)","-OH (hidroksil)","-NH₂ (amino)","-CHO (aldehit)"]'::jsonb,
 1,'Alkoller –OH (hidroksil) fonksiyonel grubu içerir.',2,4),
('21148f8e-d247-4408-bf4d-12b36be3fa24','inference',
 'Karboksilik asitler ile alkoller tepkimeye girdiğinde hangi bileşik sınıfı oluşur?',
 '["Eter","Ester","Amin","Aldehit"]'::jsonb,
 1,'Esterleşme tepkimesi: R-COOH + R''-OH → R-COO-R'' + H₂O. Ürün esterdir.',3,5);
END IF;

-- ─── LGS İNGİLİZCE ───────────────────────────────────────────────

-- Technology in Our Daily Life
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'b5000001-0000-4000-b500-000000000001') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('b5000001-0000-4000-b500-000000000001','inference',
 'What is the best title for this passage?',
 '["History of Computers","Technology: Benefits and Challenges in Modern Life","How to Use Social Media","Science Experiments"]'::jsonb,
 1,'The passage covers how technology affects daily life, including both benefits and challenges.',2,5);
END IF;

-- Protecting Our Environment
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'b5000002-0000-4000-b500-000000000002') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('b5000002-0000-4000-b500-000000000002','inference',
 'What is the writer''s main message about environmental protection?',
 '["Only governments can protect the environment","Every individual can make a difference through small actions","Nature will recover on its own","Technology will solve all environmental problems"]'::jsonb,
 1,'The passage emphasizes that individual actions and collective responsibility are key to protecting the environment.',2,5);
END IF;

-- Sports and a Healthy Life
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'b5000003-0000-4000-b500-000000000003') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('b5000003-0000-4000-b500-000000000003','inference',
 'According to the passage, what is the most important benefit of regular exercise?',
 '["Winning competitions","Improving both physical and mental health","Losing weight quickly","Making new friends"]'::jsonb,
 1,'The passage highlights that regular sports activity improves both physical fitness and mental well-being.',2,5);
END IF;

-- Endangered Animals
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'b5000004-0000-4000-b500-000000000004') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('b5000004-0000-4000-b500-000000000004','inference',
 'What can be inferred about the relationship between human activities and endangered animals?',
 '["Human activities rarely affect wildlife","Endangered animals cause problems for humans","Human activities such as deforestation and pollution are major threats to wildlife","Animals can adapt to any environment"]'::jsonb,
 2,'The passage implies that deforestation, pollution, and habitat destruction caused by humans are the primary reasons animals become endangered.',3,5);
END IF;

-- School Life Around the World
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'b5000005-0000-4000-b500-000000000005') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('b5000005-0000-4000-b500-000000000005','inference',
 'What does the passage suggest about education systems around the world?',
 '["All schools are the same","Education systems vary significantly across different cultures and countries","Only developed countries have good schools","Students everywhere face exactly the same challenges"]'::jsonb,
 1,'The passage presents various school systems globally, suggesting significant differences in culture, schedule, and approach to education.',2,5);
END IF;

-- Healthy Eating Habits
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'b5000006-0000-4000-b500-000000000006') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('b5000006-0000-4000-b500-000000000006','inference',
 'What is the writer trying to tell the reader about healthy eating?',
 '["Eating healthy is expensive and difficult","A balanced diet with variety is important for good health","Only vegetables are healthy","Skipping meals helps you stay healthy"]'::jsonb,
 1,'The passage encourages a balanced and varied diet as the foundation of good health.',2,5);
END IF;

-- The Benefits of Traveling
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'b5000007-0000-4000-b500-000000000007') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('b5000007-0000-4000-b500-000000000007','inference',
 'Which of the following best describes the overall tone of the passage?',
 '["Critical","Persuasive and positive","Neutral and scientific","Negative about modern travel"]'::jsonb,
 1,'The passage enthusiastically presents the benefits of traveling, using a persuasive and positive tone.',2,5);
END IF;

-- Marie Curie: A Pioneer of Science
IF (SELECT COUNT(*) FROM text_questions WHERE text_id = 'b5000008-0000-4000-b500-000000000008') < 5 THEN
INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('b5000008-0000-4000-b500-000000000008','inference',
 'What made Marie Curie''s achievements especially remarkable for her time?',
 '["She was very wealthy","She succeeded in a field dominated by men despite facing many barriers","She had a large team of assistants","She only worked in France"]'::jsonb,
 1,'Marie Curie broke gender barriers in science, winning two Nobel Prizes in an era when women faced significant discrimination in academia.',3,5);
END IF;

END $migration$;
