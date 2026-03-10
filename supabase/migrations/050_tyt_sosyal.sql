-- ================================================================
-- 050_tyt_sosyal.sql
-- TYT Sosyal Bilimler -- 15 metin x 5 soru = 75 soru
-- Konular: Tarih (6), Cografya (4), Felsefe (3), Sosyoloji (1), Psikoloji (1)
-- ================================================================

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM text_library WHERE category LIKE 'TYT Tarih%'
    OR category LIKE 'TYT Coğrafya%'
    OR category LIKE 'TYT Felsefe%'
    OR category LIKE 'TYT Sosyoloji%'
    OR category LIKE 'TYT Psikoloji%') > 0 THEN
    RAISE NOTICE '050: already exists';
    RETURN;
  END IF;

-- ================================================================
-- METIN 1: TYT Tarih - Osmanli Kuruluş Donemi
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000001-0000-4000-e100-000000000001',
  'Osmanlı Devleti''nin Kuruluşu ve Beylikler Dönemi',
  'TYT Tarih',
  'TYT',
  2,
  438,
  3,
  $b$
Osmanlı Devleti, Anadolu Selçuklu Devleti''nin zayıflaması ve ardından Moğol istilasının yarattığı otorite boşluğunda, 13. yüzyılın sonlarında kurulan Türkmen beyliklerinden biri olarak tarih sahnesine çıktı. Söğüt ve Domaniç yöresine yerleşen Kayı boyu, Ertuğrul Gazi önderliğinde bölgede güçlü bir siyasi varlık oluşturdu. Ertuğrul Gazi''nin ölümünün ardından oğlu Osman Bey, babasının bıraktığı mirası genişleterek uç beyliğini bağımsız bir devlete dönüştürmeye başladı. Bu süreçte Osman Bey, hem siyasi hem de askeri bir lider olarak öne çıktı.

Osman Bey döneminde gerçekleştirilen en önemli askeri zaferlerden biri, 1301 yılında Bizans kuvvetleri karşısında kazanılan Bapheus Muharebesi''dir. Bu zafer, küçük bir Türkmen beyliğinin ciddi bir siyasi güce dönüştüğünün ilk somut kanıtı oldu. Osman Bey''in ölümünün ardından Orhan Bey yönetimi devraldı ve 1326''da Bursa''yı fethederek şehri devletin başkenti ilan etti. Bursa''nın alınması, Osmanlı''nın artık kalıcı bir devlet yapısına kavuştuğunu simgeliyordu ve imparatorluğun doğusundaki en büyük şehir olma özelliğini kazandırıyordu.

Beylikler döneminde Anadolu, birbiriyle rekabet eden pek çok Türk beyliğine sahne oldu. Karamanoğulları, Germiyanlar, Saruhanoğulları ve Eşrefoğulları gibi beylikler, bölgede hâkimiyet kurmaya çalıştı. Osmanlı Beyliği''nin diğer beyliklerden ayrışmasını sağlayan temel etken, Bizans sınırına yakınlığı sayesinde elde ettiği sürekli ganimet ve fetih imkânıydı. Bu durum, bölgedeki gazileri ve göçebe unsurları Osmanlı bayrağı altında toplamayı kolaylaştırdı ve beyliğin nüfusunu hızla artırdı.

Osmanlı''nın erken dönem kurumsal yapısı oldukça sade bir görünüm sergiliyordu. Divan-ı Hümayun henüz şekillenmemişti; yönetim büyük ölçüde beyin kişisel otoritesine dayanıyordu. Ancak toprak genişledikçe idari örgütlenme zorunluluk haline geldi. İlk kadılıkların kurulması, fethedilen topraklarda İslam hukukunun uygulanmasının başlangıcını simgeliyordu. Orhan Bey döneminde kurulan yaya ve müsellem birlikleri, devletin düzenli ordu anlayışına geçişinin ilk adımlarını oluşturdu ve ilerleyen dönemlerde kapıkulu sisteminin temelini attı.

Osmanlı''nın kuruluş döneminde öne çıkan bir diğer unsur, farklı din ve kültürlerden insanları bünyesinde barındırma kapasitesiydi. Fethedilen bölgelerdeki Hristiyan ahali, can ve mal güvencesi karşılığında Osmanlı idaresine bağlılığını kabul etti. Bu hoşgörü politikası, devletin kısa sürede geniş bir coğrafyaya yayılmasını kolaylaştırdı ve yerel halkın direnç göstermeden yeni yönetime uyum sağlamasına zemin hazırladı. Kuruluş döneminin bu temel dinamikleri, sonraki yüzyıllarda imparatorluğun şekillenmesinde belirleyici bir rol oynadı.
  $b$,
  ARRAY['tarih','Osmanlı','kuruluş','beylikler','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000001-0000-4000-e100-000000000001','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Osmanlı Devleti''nin kuruluşu yalnızca askeri zaferlerle açıklanabilir","Osmanlı Devleti, uygun siyasi koşullar ve stratejik konumu sayesinde beylikten güçlü bir devlete dönüştü","Beylikler dönemi Anadolu''da tam bir kaos ortamı yarattı","Bursa''nın fethi Osmanlı tarihinde anlamsız bir olaydır"]'::jsonb,1,'Metin, Osmanlı''nın beylikten devlete dönüşümünü siyasi, askeri ve kurumsal boyutlarıyla ele almaktadır.',2,1),
('e1000001-0000-4000-e100-000000000001','detail','Bapheus Muharebesi hangi yılda gerçekleşmiştir?','["1281","1301","1326","1354"]'::jsonb,1,'Metin, Bapheus Muharebesi''nin 1301 yılında Bizans kuvvetlerine karşı kazanıldığını açıkça belirtmektedir.',2,2),
('e1000001-0000-4000-e100-000000000001','detail','Osmanlı''nın diğer beyliklerden ayrışmasını sağlayan temel etken neydi?','["Moğol istilasından korunmuş olmaları","Selçuklu mirasını doğrudan devralmaları","Bizans sınırına yakınlığı sayesinde sürekli fetih imkânı bulmaları","En büyük orduya sahip olmakları"]'::jsonb,2,'Metin, Bizans sınırına yakınlığın sürekli ganimet ve fetih imkânı sunduğunu ve gazileri çektiğini vurgulamaktadır.',2,3),
('e1000001-0000-4000-e100-000000000001','vocabulary','"Uç beyliği" ifadesindeki "uç" sözcüğü bu metinde ne anlama gelmektedir?','["Keskin kenarlı","Sınır bölgesi","Küçük ve önemsiz","Eski ve köhne"]'::jsonb,1,'Uç, Ortaçağ Türk siyasi terminolojisinde devletin sınır bölgelerini tanımlamak için kullanılan bir terimdir.',2,4),
('e1000001-0000-4000-e100-000000000001','inference','Osmanlı''nın farklı dinlerden insanları bünyesinde barındırması hangi sonucu doğurdu?','["Osmanlı ordusu zayıfladı","Devlet kısa sürede geniş coğrafyaya yayıldı","Hristiyanlar zorla Müslüman yapıldı","Beyliklerle ittifak kurmak imkânsızlaştı"]'::jsonb,1,'Metin, hoşgörü politikasının yerel halkın direnç göstermeden uyum sağlamasını ve devletin yayılmasını kolaylaştırdığını belirtmektedir.',2,5);

-- ================================================================
-- METIN 2: TYT Tarih - Osmanli Klasik Donem
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000002-0000-4000-e100-000000000002',
  'Osmanlı Klasik Döneminde Devlet Yapısı ve Kurumlar',
  'TYT Tarih',
  'TYT',
  3,
  442,
  4,
  $b$
Osmanlı Devleti, 15. ve 16. yüzyıllarda ulaştığı zirve noktasında son derece karmaşık ve işlevsel bir yönetim yapısına sahipti. Bu dönem, tarihçiler tarafından genellikle "klasik dönem" olarak adlandırılır. Merkezde padişah, saltanat yetkisini tek elde toplayarak kullanırdı. Ancak padişahın yanında devlet yönetimini fiilen yürüten en yüksek kurum Divan-ı Hümayun''du. Divan, günümüzün bakanlar kuruluna benzer bir işlev görüyor ve padişah adına önemli kararlar alıyordu.

Divan-ı Hümayun, sadrazam başkanlığında toplanan bir danışma meclisiydi. Sadrazamın yanı sıra kazaskerler, defterdarlar ve nişancılar da divana katılırdı. Kazaskerler adli ve askeri konularla ilgilenirken defterdarlar mali işleri yönetirdi. Nişancı ise padişah adına çıkarılan belgeler üzerine tuğrayı basan görevliydi. Bu uzmanlaşmış yapı, Osmanlı bürokrasisinin erken dönemden itibaren son derece gelişmiş bir işbölümüne dayandığını kanıtlar.

Osmanlı askeri sisteminin temelini tımarlı sipahi ordusu oluştururdu. Devlet, belirli bir geliri olan toprak parçalarını (tımar) sipahilere tahsis eder; sipahiler de bu gelir karşılığında savaş zamanı belirli sayıda atlı asker getirirdi. Bu sistem, hem toprağın verimli işlenmesini hem de büyük bir ordu beslenmesini olanaklı kılıyordu. Kapıkulu ocakları ise doğrudan padişaha bağlı, maaşlı düzenli kuvvetlerdi. Yeniçeriler bu ocakların en seçkin ve ünlü birliğini oluşturuyordu.

Hukuki alanda Osmanlı, şeriat ile kanun arasında özgün bir denge kurdu. Şeriat İslam hukukunun temel çerçevesini belirlerken kanunnameler, padişahın örfi hukuk yetkisiyle çıkarılan düzenlemeleri kapsadı. Kanuni Sultan Süleyman döneminde hazırlanan kapsamlı kanunnameler, bu dengenin en sistematik ifadesiydi. Taşra yönetiminde eyalet-sancak-kaza hiyerarşisi uygulandı; her birimin başına devlet tarafından atanan yöneticiler getirildi.

Osmanlı Devleti''nin toplumsal yapısı millet sistemi üzerine inşa edilmişti. Farklı din ve etnik kökenlerden gelen topluluklar, kendi iç işlerini yönetme hakkına sahipti. Rum Ortodoks, Ermeni ve Yahudi toplulukları kendi dini liderlerinin yönetiminde özerk bir statüde yaşıyordu. Bu çok kültürlü yapı, imparatorluğun yüzyıllarca ayakta kalmasını destekleyen temel unsurlardan birini oluşturdu. Klasik dönem Osmanlı kurumları, sonraki yüzyıllarda hem örnek alınan hem de kökten reform yapılmasına zorlanan bir idari miras bıraktı.
  $b$,
  ARRAY['tarih','Osmanlı','klasik dönem','divan','tımar','yeniçeri','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000002-0000-4000-e100-000000000002','main_idea','Bu metinde esas olarak ele alınan konu nedir?','["Osmanlı''nın yıkılış nedenleri","Osmanlı klasik dönem yönetim yapısı ve kurumları","Yeniçerilerin padişaha karşı isyanları","Osmanlı''nın Avrupa ile ilişkileri"]'::jsonb,1,'Metin, Divan-ı Hümayun''dan tımar sistemine, hukuk yapısından millet sistemine kadar Osmanlı klasik dönem kurumlarını bütünsel biçimde ele almaktadır.',3,1),
('e1000002-0000-4000-e100-000000000002','detail','Nişancının görevi aşağıdakilerden hangisidir?','["Mali işleri yönetmek","Adli davaları karara bağlamak","Padişah adına belgelere tuğra basmak","Yeniçerileri denetlemek"]'::jsonb,2,'Metin, nişancının padişah adına çıkarılan belgeler üzerine tuğrayı basan görevli olduğunu açıkça belirtmektedir.',3,2),
('e1000002-0000-4000-e100-000000000002','detail','Tımar sisteminde sipahilerin devlete karşılıklı yükümlülüğü neydi?','["Vergi toplamak ve hazineye aktarmak","Toprak gelirleri karşılığında savaşta atlı asker getirmek","Yeniçerilere askeri eğitim vermek","Köylüleri koruyup vergi muafiyeti sağlamak"]'::jsonb,1,'Metin, sipahilerin tımar geliri karşılığında savaş zamanı belirli sayıda atlı asker getirdiğini açıkça ifade etmektedir.',3,3),
('e1000002-0000-4000-e100-000000000002','vocabulary','"Örfi hukuk" ifadesindeki "örfi" sözcüğü ne anlama gelmektedir?','["Dini kurallara dayalı","Padişahın yasama yetkisiyle oluşturduğu geleneksel kurallara dayalı","Halkın yazılı olmayan alışkanlıklarına dayalı","Yabancı hukuk sistemlerinden alınan kurallara dayalı"]'::jsonb,1,'Örfi hukuk, padişahın yasama yetkisiyle oluşturduğu ve şeriatın dışında kalan düzenlemeler bütünüdür.',3,4),
('e1000002-0000-4000-e100-000000000002','inference','Millet sisteminin imparatorluğun uzun süre ayakta kalmasına katkısı nasıl açıklanabilir?','["Farklı toplulukların asimilasyonunu hızlandırarak kültürel birlik sağladı","Toplulukların kendi işlerini yönetmesine izin vererek olası çatışmaları azalttı","Tüm halka aynı hukuku uygulayarak adaleti artırdı","Yabancı toplulukları dışlayarak iç güvenliği pekiştirdi"]'::jsonb,1,'Metin, çok kültürlü yapının ve özerk statünün imparatorluğun yüzyıllarca ayakta kalmasını desteklediğini vurgulamaktadır.',3,5);

-- ================================================================
-- METIN 3: TYT Tarih - Tanzimat Fermani
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000003-0000-4000-e100-000000000003',
  'Tanzimat Fermanı ve Osmanlı''da Modernleşme Süreci',
  'TYT Tarih',
  'TYT',
  3,
  441,
  4,
  $b$
19. yüzyılın başlarında Osmanlı İmparatorluğu, içten ve dıştan gelen baskılarla derin bir bunalım yaşıyordu. Sanayi Devrimi''nin Avrupa''da yarattığı ekonomik ve askeri üstünlük, Osmanlı''nın geri kalmışlığını gözler önüne seriyordu. Milliyetçilik akımı ise imparatorluğun Balkan topraklarında parçalanma sürecini hızlandırıyordu. Bu koşullar altında padişah II. Mahmut, devleti kurtarmak adına köklü reformlara girişti ve ardından gelen reformlar sistematik bir hal aldı.

1839 yılında Sultan Abdülmecit döneminde Hariciye Nazırı Mustafa Reşit Paşa tarafından hazırlanan Tanzimat Fermanı, Gülhane Hatt-ı Hümayunu adıyla ilan edildi. Bu belge, Osmanlı tarihinde devlet-birey ilişkisini yeniden tanımlayan bir dönüm noktasıydı. Fermanda Müslüman ve gayrimüslim tüm Osmanlı tebaasına can, mal ve namus güvencesi sağlandı. Ayrıca vergilerin düzenli ve adil biçimde toplanacağı, keyfi hapis ve sürgün uygulamalarına son verileceği taahhüt edildi. Bu taahhütler, modern anlamda bireysel hakların tanınması yolunda atılmış ilk adımı simgeliyordu.

Tanzimat döneminde eğitim, hukuk ve ordu alanlarında kapsamlı yeniliklere gidildi. Rüştiye ve idadi okulları açılarak batı tarzı laik eğitim yaygınlaştırılmaya çalışıldı. Meclis-i Ahkâm-ı Adliye adlı yargı organı oluşturularak kanunlaştırma çalışmaları hız kazandı. Bu dönemde hazırlanan Ceza Kanunnamesi ve Ticaret Kanunu, Osmanlı hukukunun Batı standartlarına yaklaştırılması çabasının ürünleriydü. Orduda da köklü değişiklikler yapılarak modern askeri okullar kuruldu.

1856''da ilan edilen Islahat Fermanı, Tanzimat''ı tamamlar nitelikte bir belgeydi. Kırım Savaşı''nın ardından Avrupa devletlerinin baskısıyla hazırlanan bu ferman, gayrimüslimlere Müslümanlarla eşit hukuki statü tanıdı. Devlet memurluğuna ve askeri göreve giriş hakları genişledi. Ancak bu gelişmeler, Müslüman toplumun bir kesiminde hoşnutsuzluğa yol açtı. Modernleşme sürecinde ortaya çıkan gerilim, Osmanlı toplumunun giderek derinleşen kimlik tartışmasının habercisiydi.

Tanzimat hareketi, Osmanlı aydınları üzerinde de derin bir etki bıraktı. Şinasi, Namık Kemal ve Ziya Paşa gibi isimler, bu dönemde Avrupa''da edindikleri fikirlerle Osmanlı modernleşmesini savunan eserler kaleme aldı. Matbuat alanındaki gelişmeler, kamuoyu kavramının ilk kez şekillenmeye başladığını gösteriyordu. Tanzimat''ın açtığı bu entelektüel ortam, ilerleyen on yıllarda Meşrutiyet hareketlerinin zeminini hazırladı.
  $b$,
  ARRAY['tarih','Tanzimat','modernleşme','Osmanlı','reform','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000003-0000-4000-e100-000000000003','main_idea','Bu metnin ana konusu aşağıdakilerden hangisidir?','["Osmanlı''nın Kırım Savaşı''ndaki başarıları","Tanzimat Fermanı ve Osmanlı modernleşme sürecinin genel seyri","Namık Kemal''in edebiyat anlayışı","Osmanlı-Avrupa ticaret ilişkileri"]'::jsonb,1,'Metin, Tanzimat Fermanı''nın ilanını ve ardından gelen kurumsal, hukuki ve entelektüel dönüşümleri bütünsel biçimde ele almaktadır.',3,1),
('e1000003-0000-4000-e100-000000000003','detail','Tanzimat Fermanı hangi padişah döneminde ilan edilmiştir?','["II. Mahmut","Abdülmecit","Abdülaziz","II. Abdülhamit"]'::jsonb,1,'Metin, Tanzimat Fermanı''nın 1839 yılında Sultan Abdülmecit döneminde ilan edildiğini açıkça belirtmektedir.',3,2),
('e1000003-0000-4000-e100-000000000003','detail','Islahat Fermanı''nın temel özelliği nedir?','["Tüm Osmanlı topraklarını tek bir idari birimde birleştirmesi","Gayrimüslimlere Müslümanlarla eşit hukuki statü tanıması","Dini eğitimi zorunlu kılması","Yabancı yatırımcılara geniş ayrıcalıklar vermesi"]'::jsonb,1,'Metin, 1856 Islahat Fermanı''nın gayrimüslimlere Müslümanlarla eşit hukuki statü tanıdığını belirtmektedir.',3,3),
('e1000003-0000-4000-e100-000000000003','vocabulary','"Keyfi" sözcüğü metinde hangi anlamda kullanılmıştır?','["Zevkli ve eğlenceli","Kurala dayanmayan, baskıcı","Ekonomik açıdan verimli","Uzun süreli ve planlı"]'::jsonb,1,'Metinde "keyfi hapis ve sürgün" ifadesi, herhangi bir hukuki dayanağı olmaksızın uygulanan cezaları tanımlamak için kullanılmıştır.',3,4),
('e1000003-0000-4000-e100-000000000003','inference','Tanzimat döneminin entelektüel ortamı ilerleyen dönemde hangi siyasi gelişmenin zeminini hazırladı?','["Osmanlı''nın toprak kayıplarının duraksatılması","Meşrutiyet hareketlerinin ortaya çıkması","Yeniçeri ocaklarının yeniden kurulması","Halifelik kurumunun güçlendirilmesi"]'::jsonb,1,'Metin, Tanzimat döneminin açtığı entelektüel ortamın ilerleyen on yıllarda Meşrutiyet hareketlerinin zeminini hazırladığını doğrudan ifade etmektedir.',3,5);

-- ================================================================
-- METIN 4: TYT Tarih - I. Dunya Savasi ve Osmanli
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000004-0000-4000-e100-000000000004',
  'I. Dünya Savaşı ve Osmanlı İmparatorluğu',
  'TYT Tarih',
  'TYT',
  3,
  445,
  4,
  $b$
I. Dünya Savaşı, 1914-1918 yılları arasında dünya tarihini derinden etkileyen bir kıyamet senaryosu olarak yaşandı. Osmanlı İmparatorluğu, bu savaşa Almanya ve Avusturya-Macaristan''dan oluşan İttifak Devletleri safında katıldı. Savaşa girme kararı, İttihat ve Terakki Cemiyeti liderliğinin yönlendirmesiyle alındı. Enver Paşa, Talat Paşa ve Cemal Paşa''dan oluşan üçlü yönetim, Almanya ile yapılan ittifak antlaşmasını ülkeyi kurtaracak çıkış yolu olarak değerlendiriyordu.

Osmanlı, savaşın ilk yıllarında farklı cephelerde eş zamanlı mücadele vermek zorunda kaldı. Çanakkale Cephesi, 1915''te İngiliz ve Fransız kuvvetlerinin Boğaz''ı ele geçirme girişimini önledi. Bu savunma, Mustafa Kemal''in askeri dehâsını dünyaya tanıtan bir zafer olarak tarihe geçti. Doğu Anadolu''da Rusya''ya karşı açılan cephede ise Sarıkamış Harekâtı büyük bir yenilgiyle sonuçlandı ve Osmanlı ordusu ağır kayıplar verdi. Filistin ve Irak cephelerinde ise İngiliz kuvvetleri karşısında giderek geri çekilindi.

Savaş yıllarında Osmanlı ekonomisi büyük sarsıntılar yaşadı. Kapitülasyonların kaldırılması ve yabancı şirketlerin faaliyetlerinin kısıtlanması, kısa vadede ekonomik bağımsızlık görüntüsü verdi. Ancak uzun süren savaş, tarımsal üretimi çökertti, enflasyon astronomik boyutlara ulaştı ve açlık toplumun geniş kesimlerini etkiledi. Savaş ekonomisi altında Ermeni nüfusuna yönelik sürgün ve katliamlar, imparatorluğun tarihindeki en tartışmalı ve trajik sayfalarından birini oluşturdu.

1918''de İttifak Devletleri''nin çökmesiyle birlikte Osmanlı İmparatorluğu da teslim olmak zorunda kaldı. Mondros Mütarekesi''nin imzalanmasıyla Osmanlı ordusu silahsızlandırıldı ve İtilaf kuvvetleri İstanbul''u işgal etti. Ardından masaya yatırılan Sevr Antlaşması, imparatorluğun fiilen sona erdirilmesi anlamına geliyordu. Bu antlaşmaya göre Anadolu, farklı devletlerin nüfuz bölgelerine bölünecek; Osmanlı''ya yalnızca küçük bir alan bırakılacaktı. Türk milletinin bu ağır koşulları kabullenmemesi, Millî Mücadele''nin fitilini ateşledi.

I. Dünya Savaşı''nın Osmanlı mirası son derece ağır oldu. Balkanlar, Ortadoğu ve Kuzey Afrika''daki toprakların tamamı elden çıktı. Milyonlarca insan hayatını kaybetti ya da göç etmek zorunda kaldı. Savaş sonrası kurulan yeni devletler haritası, bugün de küresel çatışmaların zeminini oluşturmaktadır. Osmanlı''nın bu çöküşü, Türk milleti için yeni bir devletin kuruluşuna zemin hazırladı.
  $b$,
  ARRAY['tarih','I. Dünya Savaşı','Osmanlı','Çanakkale','Mondros','Sevr','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000004-0000-4000-e100-000000000004','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Çanakkale Savaşı yalnızca bir savunma zaferinden ibarettir","I. Dünya Savaşı Osmanlı İmparatorluğu''nu çöküşe sürükledi ve Millî Mücadele''nin zeminini hazırladı","Osmanlı ekonomisi savaş boyunca güçlendi","İttihat ve Terakki Cemiyeti savaşı kazanmak için doğru strateji izledi"]'::jsonb,1,'Metin, savaşın Osmanlı üzerindeki askeri, ekonomik ve siyasi yıkıcı etkilerini ve sonuçta imparatorluğun çöküşünü bütünsel biçimde aktarmaktadır.',3,1),
('e1000004-0000-4000-e100-000000000004','detail','Osmanlı I. Dünya Savaşı''nda hangi ittifakın yanında yer aldı?','["İtilaf Devletleri (İngiltere, Fransa, Rusya)","İttifak Devletleri (Almanya, Avusturya-Macaristan)","Tarafsız devletler bloğu","Yalnız savaştı, ittifak kurmadı"]'::jsonb,1,'Metin, Osmanlı''nın Almanya ve Avusturya-Macaristan''dan oluşan İttifak Devletleri safında savaşa girdiğini belirtmektedir.',3,2),
('e1000004-0000-4000-e100-000000000004','detail','Mondros Mütarekesi''nin imzalanmasının doğrudan sonucu neydi?','["Osmanlı ordusu Almanya''ya teslim oldu","Osmanlı ordusu silahsızlandırıldı ve İstanbul işgal edildi","Sevr Antlaşması''nın hükümleri iptal edildi","Mustafa Kemal sadrazam atandı"]'::jsonb,1,'Metin, Mondros Mütarekesi ile Osmanlı ordusunun silahsızlandırıldığını ve İtilaf kuvvetlerinin İstanbul''u işgal ettiğini açıkça belirtmektedir.',3,3),
('e1000004-0000-4000-e100-000000000004','vocabulary','"Kapitülasyon" sözcüğü bu bağlamda ne anlama gelmektedir?','["Savaşta teslim olma belgesi","Yabancı devletlere tanınan ticari ve hukuki ayrıcalıklar","Osmanlı''nın Avrupa ile yaptığı ittifak antlaşmaları","Osmanlı''nın toprak satış sözleşmeleri"]'::jsonb,1,'Kapitülasyonlar, yabancı devlet vatandaşlarına Osmanlı topraklarında tanınan vergi muafiyeti ve özel yargı hakkı gibi ayrıcalıklardır.',3,4),
('e1000004-0000-4000-e100-000000000004','inference','Sevr Antlaşması''nın Türk milleti tarafından kabul edilmemesi nasıl bir sürecin habercisiydi?','["Osmanlı hanedanının güçlenmesinin","Millî Mücadele''nin başlamasının","Yeni toprak fethlerinin","İtilaf Devletleri ile ittifak kurulmasının"]'::jsonb,1,'Metin, Türk milletinin Sevr''i kabullenememesinin Millî Mücadele''nin fitilini ateşlediğini doğrudan belirtmektedir.',3,5);

-- ================================================================
-- METIN 5: TYT Tarih - Milli Mucadele
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000005-0000-4000-e100-000000000005',
  'Millî Mücadele: Ankara Hükümeti ve Cepheler',
  'TYT Tarih',
  'TYT',
  3,
  443,
  4,
  $b$
Mondros Mütarekesi''nin ardından İtilaf devletlerinin Anadolu''yu işgale başlaması, Türk milletini büyük bir varoluş kriziyle yüz yüze getirdi. İstanbul hükümetinin işgaller karşısında sessiz kalması, direniş hareketlerinin örgütsüz ve dağınık kalmasına yol açıyordu. Bu kaotik ortamda Mustafa Kemal, 19 Mayıs 1919''da Samsun''a çıktı. Bu tarih, millî direniş hareketinin örgütlü bir zemine oturmasının başlangıcı sayılır.

Mustafa Kemal, Erzurum (Temmuz 1919) ve Sivas (Eylül 1919) kongrelerini toplayarak millî iradenin temsilcilerini bir araya getirdi. Bu kongrelerde alınan kararlar, işgallerin reddedilmesini ve milletin kendi geleceğini belirleme hakkını esas aldı. Misak-ı Millî belgesi, Anadolu topraklarının bütünlüğünü vazgeçilmez bir koşul olarak ortaya koydu. 23 Nisan 1920''de Ankara''da Büyük Millet Meclisi''nin açılmasıyla yeni bir ulusal hükümet fiilen kurulmuş oldu.

Millî Mücadele boyunca birden fazla cephede savaşıldı. Batı Cephesi, Yunan işgaline karşı sürdürülen mücadelenin en kritik alanıydı. İlk dönemde Kuva-yı Milliye birlikleri direniş gösterse de düzenli orduya geçiş kaçınılmaz hale geldi. İsmet İnönü komutasındaki kuvvetler, İnönü Muharebeleri''nde Yunan ordusunu iki kez püskürttü. Sakarya Meydan Muharebesi''nde ise Mustafa Kemal Paşa başkomutanlık görevini bizzat üstlenerek kazanılan zafer, savaşın seyrini kalıcı olarak değiştirdi.

Doğu Cephesi''nde Ermenistan ile yürütülen savaş kısa sürede sonuçlandı. Kazım Karabekir komutasındaki Türk kuvvetleri, Ermenistan''ı geri çekmeye zorladı ve Gümrü Antlaşması imzalandı. Güney Cephesi''nde ise Fransız kuvvetleri ve düzensiz Ermeni birlikleriyle girilen mücadelede Türk direnişi, Ankara Antlaşması''yla Fransızların Anadolu''dan çekilmesiyle son buldu. Bu başarılar, Millî Mücadele''nin siyasi meşruiyetini uluslararası arenada pekiştirdi.

Büyük Taarruz, Ağustos 1922''de Afyonkarahisar ekseninde başlatıldı ve Yunan ordusunu tarihsel bir yenilgiye uğrattı. Ard arda gelen zaferler İzmir''in kurtuluşuyla taçlandı. Mudanya Ateşkesi ardından masaya oturulan Lozan Konferansı''nda imzalanan Lozan Antlaşması (1923), Türk milletinin bağımsızlık mücadelesinin uluslararası alanda tanınmasını sağladı. Millî Mücadele, yeni Türkiye Cumhuriyeti''nin kuruluşunun önünü açtı.
  $b$,
  ARRAY['tarih','Millî Mücadele','Ankara','Büyük Taarruz','Lozan','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000005-0000-4000-e100-000000000005','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Mondros Mütarekesi Türk milletini tamamen yok etti","Millî Mücadele, örgütlü bir direniş ve kazanılan zaferlerle Türk bağımsızlığını ve Cumhuriyet''in kuruluşunu sağladı","İstanbul hükümeti Millî Mücadele''ye öncülük etti","Yunan ordusu Anadolu''yu kolayca işgal etti"]'::jsonb,1,'Metin, Mustafa Kemal''in önderliğinde yürütülen Millî Mücadele''nin örgütlenme sürecini, cephe zaferlerini ve Lozan''la sonuçlanan başarısını bütünsel biçimde aktarmaktadır.',3,1),
('e1000005-0000-4000-e100-000000000005','detail','Mustafa Kemal hangi tarihte Samsun''a çıkmıştır?','["23 Nisan 1919","19 Mayıs 1919","10 Temmuz 1919","9 Eylül 1922"]'::jsonb,1,'Metin, Mustafa Kemal''in 19 Mayıs 1919''da Samsun''a çıktığını açıkça belirtmektedir.',3,2),
('e1000005-0000-4000-e100-000000000005','detail','Doğu Cephesi''nde Ermenistan ile yapılan barış antlaşması hangisidir?','["Mondros Mütarekesi","Mudanya Ateşkesi","Gümrü Antlaşması","Lozan Antlaşması"]'::jsonb,2,'Metin, Doğu Cephesi''nde Kazım Karabekir''in Ermenistan''ı geri çekmesinin ardından Gümrü Antlaşması''nın imzalandığını belirtmektedir.',3,3),
('e1000005-0000-4000-e100-000000000005','vocabulary','"Misak-ı Millî" ifadesi ne anlama gelmektedir?','["Ulusal yemin ya da ulusal ant","Millî ordu","Millî kongre","Uluslararası antlaşma"]'::jsonb,0,'Misak-ı Millî, Türkçede "ulusal ant" ya da "ulusal yemin" anlamına gelen ve Anadolu topraklarının bütünlüğünü öngören belgedir.',3,4),
('e1000005-0000-4000-e100-000000000005','inference','Kuva-yı Milliye''den düzenli orduya geçişin kaçınılmaz hale gelmesi ne anlama gelir?','["Millî Mücadele''nin sona erdiği","Düzensiz birliklerin tek başına yeterli olmadığı ve profesyonel bir ordunun gerektiği","Mustafa Kemal''in yetkisinin kısıtlandığı","İstanbul hükümetinin mücadeleyi devraldığı"]'::jsonb,1,'Metin, Kuva-yı Milliye''nin başlangıçta direniş gösterdiğini ancak düzenli orduya geçişin kaçınılmaz hale geldiğini belirtmekte; bu, örgütlü ve profesyonel bir askeri güce ihtiyaç duyulduğunu göstermektedir.',3,5);

-- ================================================================
-- METIN 6: TYT Tarih - Ataturk Ilkeleri
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000006-0000-4000-e100-000000000006',
  'Atatürk İlkeleri: Cumhuriyetçilik ve Milliyetçilik',
  'TYT Tarih',
  'TYT',
  2,
  435,
  3,
  $b$
Türkiye Cumhuriyeti''nin kuruluş felsefesini oluşturan Atatürk ilkeleri, devletin temel yönelimini ve toplumsal dönüşümün hedeflerini belirleyen temel rehber niteliğindedir. Bu ilkeler; cumhuriyetçilik, milliyetçilik, halkçılık, devletçilik, laiklik ve inkılapçılık olarak sıralanır. Birlikte "Altı Ok" adıyla da anılır ve 1931''de Cumhuriyet Halk Partisi programına alınmış, ardından 1937''de anayasaya girmiştir.

Cumhuriyetçilik ilkesi, egemenliğin kayıtsız şartsız millete ait olduğunu savunur. Osmanlı döneminin mutlak monarşisi ve halifelik kurumu, cumhuriyet rejimiyle birlikte geride bırakıldı. 29 Ekim 1923''te Türkiye Cumhuriyeti''nin ilan edilmesi, yalnızca bir yönetim biçiminin değil; özgürlük, eşitlik ve egemenlik değerlerine dayalı yeni bir devlet anlayışının benimsenmesi anlamını taşıyordu. Cumhurbaşkanlığı makamı, seçimle belirlenerek halk iradesine dayandırıldı.

Milliyetçilik ilkesi, Türk milletinin bilinçli bir tarihsel özne olarak tanınmasını ve ulusal birlik ile bütünlüğün korunmasını öngörür. Atatürk''ün milliyetçilik anlayışı, ırk ya da din temeline değil; ortak tarih, kültür ve geleceğe duyulan aidiyet duygusuna dayanıyordu. Bu anlayış, dönemin Avrupa''sındaki etnik milliyetçiliklerden ayrışan sivil ve kapsayıcı bir nitelik taşıyordu. Millî Mücadele, bu milliyetçilik anlayışının en somut siyasi ve askeri ifadesi olarak tarihe geçti.

Cumhuriyetçilik ile milliyetçilik, birbirini tamamlayan ve pekiştiren ilkelerdir. Millet egemenliği olmadan cumhuriyet anlamsız kalır; cumhuriyet güvencesi olmadan ise millî kimlik kolayca baskı altına alınabilir. Bu iki ilkenin birlikte hayata geçirilmesi, bütün vatandaşların ortak bir siyasi kimlik etrafında örgütlenmesini sağladı. Eğitimde Türkçenin ortak dil olarak kullanılması, tarih yazımının ulusal bir perspektife oturtulması ve medeni kanunun kabulü, bu ilkelerin somut uygulamaları arasında sayılabilir.

Atatürk ilkelerinin modern Türkiye''deki önemi tartışılmaya devam etmektedir. Ancak bu ilkelerin Osmanlı''nın çöküş deneyiminden çıkarılmış dersler ışığında şekillendiği, çağdaş ve bağımsız bir ulus-devlet yaratma amacı taşıdığı konusunda geniş bir uzlaşı mevcuttur. Cumhuriyetçilik ve milliyetçilik ilkeleri, bu büyük dönüşümün hem ideolojik hem de kurumsal temelini oluşturdu.
  $b$,
  ARRAY['tarih','Atatürk','cumhuriyetçilik','milliyetçilik','ilkeler','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000006-0000-4000-e100-000000000006','main_idea','Bu metnin temel konusu nedir?','["Atatürk''ün kişisel yaşamı","Cumhuriyetçilik ve milliyetçilik ilkelerinin anlamı ve uygulamaları","Osmanlı hanedanının tarihi","Türkiye''nin ekonomik kalkınması"]'::jsonb,1,'Metin, Atatürk ilkeleri arasından cumhuriyetçilik ve milliyetçiliği ele alarak bu iki ilkenin anlamını, temelini ve birbiriyle ilişkisini açıklamaktadır.',2,1),
('e1000006-0000-4000-e100-000000000006','detail','"Altı Ok" hangi yılda Türkiye Cumhuriyeti Anayasası''na girmiştir?','["1923","1931","1937","1946"]'::jsonb,2,'Metin, Altı Ok''un 1937 yılında anayasaya girdiğini açıkça belirtmektedir.',2,2),
('e1000006-0000-4000-e100-000000000006','detail','Atatürk''ün milliyetçilik anlayışının diğer Avrupa milliyetçiliklerinden temel farkı nedir?','["Dini unsurları ön plana çıkarması","Irk ya da din değil; ortak tarih, kültür ve aidiyet duygusuna dayanması","Yalnızca Türk etnik kökeninden gelenleri kapsaması","Askeri üstünlüğü esas alması"]'::jsonb,1,'Metin, Atatürk''ün milliyetçiliğinin ırk ya da din temeline değil ortak tarih ve kültüre dayandığını ve bu nedenle sivil ve kapsayıcı olduğunu vurgulamaktadır.',2,3),
('e1000006-0000-4000-e100-000000000006','vocabulary','"Egemenlik" sözcüğü bu metinde ne anlama gelmektedir?','["Ekonomik güç ve servet","Yönetme hakkı ve üstün otorite","Askeri kuvvet","Uluslararası tanınırlık"]'::jsonb,1,'Egemenlik, siyasi bağlamda bir ülke ya da toprak üzerindeki yönetme ve karar verme hakkını ifade etmektedir.',2,4),
('e1000006-0000-4000-e100-000000000006','inference','Cumhuriyetçilik ve milliyetçilik ilkelerinin birlikte uygulanması ne sağladı?','["Yalnızca Müslüman vatandaşların haklarını korudu","Tüm vatandaşların ortak bir siyasi kimlik etrafında örgütlenmesini sağladı","Azınlıkların ülkeden göç etmesine yol açtı","Tek parti iktidarını kalıcı kıldı"]'::jsonb,1,'Metin, bu iki ilkenin birlikte hayata geçirilmesinin tüm vatandaşların ortak bir siyasi kimlik etrafında örgütlenmesini sağladığını belirtmektedir.',2,5);

-- ================================================================
-- METIN 7: TYT Cografya - Turkiye Iklim Bolgeleri
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000007-0000-4000-e100-000000000007',
  'Türkiye İklim Bölgeleri ve Özellikleri',
  'TYT Coğrafya',
  'TYT',
  2,
  432,
  3,
  $b$
Türkiye, orta kuşakta yer alması ve üç tarafının denizlerle çevrili olması nedeniyle birbirinden belirgin biçimde farklı iklim tiplerine sahip bir ülkedir. Bu çeşitlilik; coğrafi konum, denizden uzaklık, yükselti ve dağların uzanış yönü gibi faktörlerin birleşik etkisiyle ortaya çıkmaktadır. Ülkede esas olarak beş farklı iklim tipi gözlemlenir: Akdeniz iklimi, Karadeniz iklimi, Karasal iklim, geçiş iklimi ve Doğu Anadolu''nun sert karasal iklimi.

Akdeniz iklimi; Ege, Akdeniz kıyıları ve Güneydoğu Anadolu''nun batı kesimlerinde hâkimdir. Bu bölgelerde yazlar uzun, sıcak ve kurak; kışlar ılık ve yağışlıdır. Toplam yağış miktarı 600-1000 mm arasında değişmekte olup yağışların büyük bölümü kış aylarına düşer. Bu iklim tipi, zeytin, turunçgil, incir ve üzüm gibi bitki örtüsünü destekler. Maki formasyonu, Akdeniz iklimine özgü en yaygın bitki topluluğudur.

Karadeniz kıyıları, yıl boyunca yağış alan ender bölgeler arasındadır. Kuzeydeki dağ silsileleri, Karadeniz''den gelen nemli ve serin hava kütlelerini karşılar. Bu nedenle bölgede yağış, mevsimsel bir dağılım göstermez; her mevsim bol yağış düşer ve yıllık yağış 1000-2500 mm''ye ulaşabilir. Bu nemli koşullar, çay ve fındık tarımı için ideal ortam sağlar. Bölgenin bitki örtüsü, gür yapraklı orman formasyonuyla öne çıkar.

İç Anadolu, kıyılardan uzak ve yüksek plato yapısıyla karasal iklimin özelliklerini sergiler. Yazlar sıcak ve kurak, kışlar ise soğuk ve kar yağışlı geçer. Yıllık yağış ortalaması 300-400 mm gibi düşük bir değerdedir. Step bitki örtüsünün hâkim olduğu bu bölgede tahıl tarımı önem taşır. Tuz Gölü ve çevresindeki kapalı havzalar, aşırı kurak iklimin bir ürünüdür.

Doğu Anadolu, Türkiye''nin en sert iklim koşullarına sahip bölgesidir. Yüksek rakım ve kıtadan gelen soğuk hava kütlelerinin etkisiyle kışlar çok uzun ve şiddetli geçer. Erzurum''da yıllık ortalama sıcaklık 3°C dolayındadır ve kar örtüsü birkaç aya yayılır. Yaz mevsimi kısa olmakla birlikte sıcak geçer. Bu iklim tipi tarım sezonunu kısaltır; hayvancılık ve otlak ekonomisi bölgede önem kazanır.
  $b$,
  ARRAY['coğrafya','iklim','Türkiye','Akdeniz','Karadeniz','karasal','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000007-0000-4000-e100-000000000007','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Türkiye''de yalnızca Karadeniz iklimi görülür","Türkiye, konumu ve yapısı nedeniyle birbirinden farklı birçok iklim tipine sahiptir","İç Anadolu''da yağış miktarı oldukça yüksektir","Akdeniz kıyıları kışın kar alır"]'::jsonb,1,'Metin, Türkiye''deki beş farklı iklim tipini ve bunların özelliklerini sistematik biçimde aktarmaktadır.',2,1),
('e1000007-0000-4000-e100-000000000007','detail','Karadeniz bölgesinde yıllık yağış miktarı ne kadara ulaşabilir?','["300-400 mm","600-1000 mm","1000-2500 mm","2500-4000 mm"]'::jsonb,2,'Metin, Karadeniz bölgesinde yıllık yağışın 1000-2500 mm''ye ulaşabildiğini açıkça belirtmektedir.',2,2),
('e1000007-0000-4000-e100-000000000007','detail','Akdeniz iklimine özgü en yaygın bitki topluluğu hangisidir?','["Step","Tundra","Maki","Tayga"]'::jsonb,2,'Metin, maki formasyonunun Akdeniz iklimine özgü en yaygın bitki topluluğu olduğunu açıkça belirtmektedir.',2,3),
('e1000007-0000-4000-e100-000000000007','vocabulary','"Formasyonu" sözcüğü bu metinde ne anlama gelmektedir?','["Askeri birlik düzeni","Belirli bir ortamda oluşan bitki topluluğu","Dağ sırası","İklim ölçüm yöntemi"]'::jsonb,1,'Coğrafya terminolojisinde formasyon, benzer koşullar altında gelişen bitki topluluklarını tanımlayan bir kavramdır.',2,4),
('e1000007-0000-4000-e100-000000000007','inference','Doğu Anadolu''da tarım sezonunun kısa olmasının temel nedeni nedir?','["Toprak yapısının tarıma uygun olmaması","Yüksek rakım ve sert kış koşullarının uzun sürmesi","Yağış miktarının çok yüksek olması","Su kaynaklarının yetersizliği"]'::jsonb,1,'Metin, yüksek rakım ve uzun, şiddetli kışların tarım sezonunu kısalttığını belirtmektedir; bu durum coğrafi koşullardan kaynaklanmaktadır.',2,5);

-- ================================================================
-- METIN 8: TYT Cografya - Turkiye Nufus Dagilimi ve Goc
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000008-0000-4000-e100-000000000008',
  'Türkiye Nüfus Dağılımı ve Göç Olgusu',
  'TYT Coğrafya',
  'TYT',
  2,
  440,
  3,
  $b$
Nüfus, bir ülkenin ekonomik ve sosyal gelişiminin en temel göstergelerinden biridir. Türkiye''nin nüfusu, 1923''te kuruluşta yaklaşık 13 milyon iken günümüzde 85 milyonu aşmıştır. Bu çarpıcı artış, çok sayıda demografik, tıbbi ve sosyal faktörün birlikte yarattığı sonuçtur. Ölüm oranlarının düşmesi, doğurganlık oranlarının uzun süre yüksek kalması ve sağlık hizmetlerinin yaygınlaşması bu faktörlerin başında gelir.

Türkiye''de nüfus dağılımı son derece dengesizdir. Batı ve kuzey kıyıları, İç Anadolu''nun büyük kentleri ve Güneydoğu Anadolu''nun verimli ova bölgeleri yoğun nüfuslanmıştır. Buna karşılık Doğu Anadolu''nun dağlık alanları, iç Ege''nin bazı ilçeleri ve sarp kıyı bölgeleri seyrek nüfusludur. İstanbul, yaklaşık 16 milyon nüfusuyla hem Türkiye''nin hem de Avrupa''nın en kalabalık kenti konumundadır. Nüfus yoğunluğundaki bu dengesizlik, ekonomik gelişmişlik farklılıklarıyla yakından ilişkilidir.

Göç olgusu, Türkiye''nin nüfus dağılımını şekillendiren en güçlü dinamiklerden biridir. 1950''lerin sonundan itibaren hız kazanan iç göç hareketi, kırsal kesimden büyük kentlere doğru yoğun bir nüfus akışına yol açtı. Sanayi kuruluşlarının batı illerine ve kıyı bölgelerine yığılması, bu göç dalgasının temel çekim gücünü oluşturdu. Ekonomik güvencesizlik, tarımsal mekanizasyon ve kentsel yaşamın sunduğu fırsatlar ise itici faktörler arasında sayılabilir.

Dış göç hareketleri de Türkiye açısından önemli bir boyut taşır. 1960''lı yıllarda başlayan misafir işçi göçü, Almanya başta olmak üzere pek çok Batı Avrupa ülkesine milyonlarca Türk vatandaşının yerleşmesiyle sonuçlandı. Bu durum hem işgücü açığını kapayan bir çözüm sundu hem de ülkeye döviz girişi sağladı. Günümüzde ise Türkiye, özellikle Suriyeli mülteciler nedeniyle büyük çaplı uluslararası göç almakta ve bu durum önemli sosyal ve ekonomik sonuçlar doğurmaktadır.

Kentleşme oranı, 1950''de yüzde on beşin altındayken bugün yüzde seksenin üzerine çıkmıştır. Bu dönüşüm, büyük kentlerde gecekondu bölgelerinin oluşmasına, altyapı sorunlarına ve kentsel yoksulluğa zemin hazırladı. Bununla birlikte eğitim, sağlık ve ulaşım olanaklarına erişim açısından kent nüfusu önemli kazanımlar elde etti. Nüfus politikaları ve göç yönetimi, Türkiye''nin güncel gündemindeki öncelikli meseleler arasında yer almaktadır.
  $b$,
  ARRAY['coğrafya','nüfus','göç','kentleşme','Türkiye','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000008-0000-4000-e100-000000000008','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Türkiye''nin nüfusu hiç artmamıştır","Türkiye''de nüfus dengesiz dağılmış olup iç ve dış göç bu dağılımı şekillendirmektedir","Türkiye tamamen kentsel bir ülkedir","Göç yalnızca olumlu sonuçlar doğurur"]'::jsonb,1,'Metin, Türkiye''nin nüfus büyümesini, dengesiz dağılımını ve iç ile dış göç süreçlerini bütünsel biçimde ele almaktadır.',2,1),
('e1000008-0000-4000-e100-000000000008','detail','Türkiye''de kentleşme oranı bugün yaklaşık kaç yüzdedir?','["Yüzde kırk","Yüzde elli","Yüzde altmış beş","Yüzde seksen''in üzeri"]'::jsonb,3,'Metin, kentleşme oranının günümüzde yüzde seksenin üzerine çıktığını belirtmektedir.',2,2),
('e1000008-0000-4000-e100-000000000008','detail','İç göç hareketlerinin temel çekim gücü neydi?','["Doğu''nun güvenlik sorunları","Sanayi kuruluşlarının batı illerine yığılması","Devletin zorunlu yerleşim politikaları","Batı''daki verimli topraklar"]'::jsonb,1,'Metin, sanayi kuruluşlarının batı illerine ve kıyı bölgelerine yığılmasının göçün temel çekim gücünü oluşturduğunu açıkça belirtmektedir.',2,3),
('e1000008-0000-4000-e100-000000000008','vocabulary','"Demografik" sözcüğü bu metinde ne anlama gelmektedir?','["Coğrafi ya da topoğrafik","Nüfusun yapısı ve değişimiyle ilgili","Ekonomik ve mali","Kültürel ve etnik"]'::jsonb,1,'Demografik, nüfusun yapısını, büyüklüğünü ve zaman içindeki değişimini inceleyen demografi bilimiyle ilgili bir sıfattır.',2,4),
('e1000008-0000-4000-e100-000000000008','inference','Büyük kentlerde gecekondu bölgelerinin oluşmasının temel nedeni nedir?','["Hükümetin planlı bir politikasının sonucu","Hızlı ve plansız kentleşmenin barınma talebini karşılayamaması","Yabancı yatırımcıların arazi satın alması","Kırsal nüfusun tarımda zenginleşmesi"]'::jsonb,1,'Metin, yüksek kentleşme oranının altyapı sorunlarına ve gecekondu bölgelerine yol açtığını belirtmektedir; bu durum hızlı göçün kontrolsüz kentleşme yarattığını göstermektedir.',2,5);

-- ================================================================
-- METIN 9: TYT Cografya - Turkiye Tarim Bolgeleri
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000009-0000-4000-e100-000000000009',
  'Türkiye Tarım Bölgeleri ve Ürünleri',
  'TYT Coğrafya',
  'TYT',
  2,
  436,
  3,
  $b$
Türkiye, farklı iklim kuşakları ve çeşitli toprak yapısı sayesinde tarımsal açıdan son derece zengin bir ülkedir. Geniş verimli ovalar, kıyı şeridinin deniz etkisiyle ılımlanan iklimi ve Anadolu''nun bereketli platolar silsilesi, çok sayıda ürünün bir arada yetiştirilmesine olanak tanır. Bu çeşitlilik, Türkiye''yi dünyada pek çok tarım ürününde ilk beş üretici arasına taşır. Buna karşın tarımda verimlilik, gelişmiş ülkelerin gerisinde kalmaya devam etmektedir.

Karadeniz Bölgesi, yüksek yağış miktarı ve ılıman kıyı şeridi sayesinde kendine özgü ürünleriyle öne çıkar. Türkiye fındık üretiminin yüzde doksanından fazlası bu bölgede gerçekleşir; ülkemiz dünya fındık üretiminde tartışmasız liderdir. Rize ve çevresinde yoğunlaşan çay üretimi de bölgenin tarımsal kimliğinin ayrılmaz bir parçasıdır. Mısır tarımı ise özellikle bölgenin iç kesimlerinde hâlâ yaygın biçimde yapılmaktadır.

Ege Bölgesi, Türkiye''nin en değerli tarım alanlarından birini oluşturur. Bakır, çok yıllık tarım sistemine uygun geniş ve verimli ovaları barındırır. Zeytin, incir, üzüm ve tütün bu bölgenin geleneksel ürünleridir. Büyük Menderes ve Gediz ovalarında pamuk üretimi de önemli bir yer tutar. Bölgenin ılıman Akdeniz iklimi, bu ürünlerin gelişmesi için ideal koşullar sunar.

Güneydoğu Anadolu Bölgesi, sulama projelerinin hayata geçirilmesiyle tarımsal potansiyelini tam anlamıyla ortaya koymaya başlamıştır. Güneydoğu Anadolu Projesi (GAP) kapsamında inşa edilen barajlar ve sulama kanalları, milyonlarca hektarlık araziyi sulamaya açmıştır. Pamuk, antepfıstığı, kırmızıbiber ve buğday bu bölgenin önde gelen ürünleridir. Urfa ve Mardin ovaları, sulama öncesine kıyasla çok daha üretken bir konuma gelmiştir.

İç Anadolu, Türkiye''nin temel tahıl ambarıdır. Uzun, yüz yıllardır süregelen kuru tarım geleneği, geniş buğday ve arpa tarlalarını bölgenin simgesi haline getirmiştir. Konya Ovası, Türkiye''nin en büyük tahıl ekiliş alanlarından birini oluşturur. Şeker pancarı ve haşhaş da İç Anadolu''nun önemli endüstriyel bitkileri arasındadır. Son yıllarda damla sulama ve modern tarım tekniklerinin yaygınlaşması, bölgenin tarımsal verimliliğini artırmaya başlamıştır.
  $b$,
  ARRAY['coğrafya','tarım','Türkiye','Karadeniz','Ege','GAP','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000009-0000-4000-e100-000000000009','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Türkiye yalnızca buğday üretir","Türkiye''nin farklı bölgeleri iklim ve coğrafyalarına uygun çeşitli tarım ürünleri yetiştirmektedir","Karadeniz bölgesi Türkiye''nin tek tarım bölgesidir","GAP projesi tarıma zarar vermiştir"]'::jsonb,1,'Metin, Türkiye''nin farklı coğrafya bölgelerinde yetişen tarım ürünlerini ve bölgesel özellikleri sistematik biçimde ele almaktadır.',2,1),
('e1000009-0000-4000-e100-000000000009','detail','Türkiye dünya fındık üretiminde kaçıncı sıradadır?','["İkinci","Üçüncü","Birinci","Beşinci"]'::jsonb,2,'Metin, Türkiye''nin dünya fındık üretiminde tartışmasız lider olduğunu belirtmektedir.',2,2),
('e1000009-0000-4000-e100-000000000009','detail','GAP projesinin Güneydoğu Anadolu tarımına katkısı nedir?','["Fındık bahçelerinin oluşturulması","Barajlar ve sulama kanallarıyla milyonlarca hektarlık araziyi sulamaya açması","Çay üretiminin bölgeye taşınması","Orman alanlarının tarım arazisine dönüştürülmesi"]'::jsonb,1,'Metin, GAP kapsamında inşa edilen baraj ve sulama kanallarının milyonlarca hektarlık araziyi sulamaya açtığını belirtmektedir.',2,3),
('e1000009-0000-4000-e100-000000000009','vocabulary','"Endüstriyel bitki" ifadesi ne anlama gelmektedir?','["Fabrikada üretilen yapay bitki","Doğrudan gıda olarak değil; işlenerek sanayide kullanılan tarım ürünü","Yalnızca ihraç edilen bitki","Yabancı kökenli egzotik bitki"]'::jsonb,1,'Endüstriyel bitki, hasat edildikten sonra doğrudan tüketilmeyip şeker, yağ veya ilaç gibi ürünlere işlenen tarım bitkilerini tanımlar.',2,4),
('e1000009-0000-4000-e100-000000000009','inference','İç Anadolu''da damla sulama ve modern tarım tekniklerinin yaygınlaşması ne anlama gelmektedir?','["Bölgenin tarım dışı sektörlere yönelmekte olduğu","Bölgenin tarımsal verimliliğini artırmaya çalıştığı","İç Anadolu''nun sanayi merkezi haline geldiği","Tarımın tamamen gerilediği"]'::jsonb,1,'Metin, bu tekniklerin bölgenin tarımsal verimliliğini artırmaya başladığını belirtmekte; bu durum, mevcut kaynakların daha etkin kullanıldığını göstermektedir.',2,5);

-- ================================================================
-- METIN 10: TYT Cografya - Dogal Afetler Deprem Volkanizma
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000010-0000-4000-e100-000000000010',
  'Doğal Afetler: Deprem Kuşakları ve Volkanizma',
  'TYT Coğrafya',
  'TYT',
  3,
  444,
  4,
  $b$
Yer kabuğu, milyonlarca yıl boyunca hareket halinde olan büyük levhalardan oluşur. Bu levhaların birbirine sürtündüğü, birbirinin altına girdiği ya da birbirinden uzaklaştığı sınır bölgeleri, deprem ve volkanik aktivitenin en yoğun yaşandığı alanlardır. Dünya genelinde iki ana deprem kuşağı tanımlanmıştır: Alp-Himalaya Kuşağı ve Pasifik Ateş Çemberi. Türkiye, Alp-Himalaya Kuşağı üzerinde yer aldığından sismik açıdan son derece aktif bir konumdadır.

Türkiye''nin jeolojik yapısında Kuzey Anadolu Fay Hattı (KAF) ve Doğu Anadolu Fay Hattı (DAF) belirleyici rol oynar. Kuzey Anadolu Fay Hattı, yaklaşık 1500 km uzunluğuyla Saros Körfezi''nden Doğu Anadolu''ya kadar uzanır. Bu fay hattı boyunca geçen yüzyılda pek çok yıkıcı deprem yaşanmıştır; 1939 Erzincan, 1999 Marmara ve 2023 Kahramanmaraş depremleri bunların en çarpıcı örnekleridir. Doğu Anadolu Fay Hattı ise Arap ve Anadolu levhalarının sınırını tanımlar.

Depremler, yalnızca anlık yıkım değil; zemin sıvılaşması, heyelan, tsunami ve yangın gibi ikincil afetlere de zemin hazırlar. Kıyı ve alüvyon zeminlerde inşa edilen yapılar, deprem dalgalarını daha güçlü hisseder. Bu nedenle zemin etüdü yapılmadan yürütülen yapılaşma, deprem riskini katbekat artırır. Türkiye''de deprem önleme stratejisinin temelini binaların güçlendirilmesi, dönüştürülmesi ve ileri uyarı sistemleri oluşturmaktadır.

Volkanizma ise yerin derinliklerindeki magmanın yeryüzüne çıkması sonucu oluşan süreçtir. Türkiye''de aktif volkan sayısı oldukça sınırlı olsa da geçmişte volkanik kökenli pek çok yer şekli oluşmuştur. Ağrı Dağı, Erciyes Dağı, Hasan Dağı ve Karadağ bu oluşumların önde gelen örnekleridir. Kapadokya''nın eşsiz peribacası manzarası da milyonlarca yıl önce gerçekleşen volkanik patlamalar ve ardından gelen erozyon süreçlerinin birlikte yarattığı bir eseridir.

Doğal afet yönetimi, modern devletlerin öncelikli sorumlulukları arasında yer almaktadır. Erken uyarı sistemleri, afet bilinci eğitimi ve sağlam yapılaşma standartları, can ve mal kayıplarını en aza indirmenin vazgeçilmez araçlarıdır. Türkiye, yaşadığı yıkıcı deprem deneyimlerinden ders çıkararak afet yönetimi alanında önemli kurumsal adımlar atmıştır. Bununla birlikte fay hatları üzerindeki yapılaşmanın azaltılması ve kentsel dönüşüm programlarının hayata geçirilmesi, henüz tamamlanmamış öncelikli bir gündem maddesidir.
  $b$,
  ARRAY['coğrafya','deprem','volkanizma','fay','doğal afet','Türkiye','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000010-0000-4000-e100-000000000010','main_idea','Bu metnin temel konusu nedir?','["Türkiye''de yalnızca volkanizma görülür","Türkiye''nin deprem kuşakları üzerindeki konumu, fay hatları ve volkanik yer şekilleri","Kapadokya''nın turizm değeri","Deprem sigortası sistemi"]'::jsonb,1,'Metin, Türkiye''nin deprem riskini yaratan levha hareketlerini, fay hatlarını, volkanizmayı ve afet yönetimini kapsamlı biçimde ele almaktadır.',3,1),
('e1000010-0000-4000-e100-000000000010','detail','Kuzey Anadolu Fay Hattı''nın uzunluğu yaklaşık kaç kilometredir?','["500 km","1000 km","1500 km","2000 km"]'::jsonb,2,'Metin, Kuzey Anadolu Fay Hattı''nın yaklaşık 1500 km uzunluğuyla Saros Körfezi''nden Doğu Anadolu''ya kadar uzandığını belirtmektedir.',3,2),
('e1000010-0000-4000-e100-000000000010','detail','Kapadokya''nın peribacaları nasıl oluşmuştur?','["Buzul erozyonu ve rüzgâr aşınmasıyla","Volkanik patlamalar ve ardından gelen erozyon süreçleriyle","Deniz çekilmesi ve tuz birikintisiyle","İnsan eliyle oyulan kaya yapılarıyla"]'::jsonb,1,'Metin, Kapadokya''nın peribacası manzarasının milyonlarca yıl önce gerçekleşen volkanik patlamalar ve ardından gelen erozyon süreçlerinin ürünü olduğunu açıkça belirtmektedir.',3,3),
('e1000010-0000-4000-e100-000000000010','vocabulary','"Sismik" sözcüğü ne anlama gelmektedir?','["Volkanik faaliyetlerle ilgili","Deprem ve yer sarsıntısıyla ilgili","İklim değişikliğiyle ilgili","Deniz dibiyle ilgili"]'::jsonb,1,'Sismik, Yunanca sismós (sarsıntı) kökünden gelir ve deprem ya da yer titreşimleriyle ilgili anlamına gelmektedir.',3,4),
('e1000010-0000-4000-e100-000000000010','inference','Zemin etüdü yapılmadan inşaat yapılmasının deprem riskini artırması ne anlama gelir?','["Binaların güzel görünmesini engeller","Zemin türünün deprem hasarı üzerinde doğrudan belirleyici olduğu","Depremlerin daha sık meydana geldiği","Fay hatlarının hareket ettiği"]'::jsonb,1,'Metin, alüvyon ve kıyı zeminlerinin deprem dalgalarını güçlendirdiğini belirtmekte; bu durum uygun olmayan zeminde inşaatın riski artırdığını kanıtlamaktadır.',3,5);

-- ================================================================
-- METIN 11: TYT Felsefe - Felsefenin Tanimi ve Temel Sorulari
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000011-0000-4000-e100-000000000011',
  'Felsefenin Tanımı, Konusu ve Temel Soruları',
  'TYT Felsefe',
  'TYT',
  2,
  437,
  3,
  $b$
Felsefe, Yunanca philia (sevgi) ve sophia (bilgelik) sözcüklerinden türeyen bir kelimedir; "bilgelik sevgisi" olarak çevrilebilir. Bu tanım, felsefenin özünü son derece isabetli biçimde özetler: felsefe, bilgiye ulaşmış olmaktan çok bilgiye duyulan yoğun ilgi ve merakla beslenen bir düşünce etkinliğidir. Antik Yunan''da ortaya çıkan bu gelenek, o tarihten bu yana insan düşüncesinin en temel yönelimlerinden biri olmayı sürdürmektedir.

Felsefenin en temel soruları şu başlıklar altında gruplanabilir: Varlık nedir? Bilgi mümkün müdür ve nasıl elde edilir? İyi ve kötü nedir, ahlaki değerlerin temeli ne olmalıdır? Güzel olan nedir, estetik deneyimin kaynağı nasıl açıklanabilir? Bu sorular, sıradan merak ya da bilimsel araştırmanın sınırlarını aşan, insan varoluşunun köklerine inen evrensel sorulardır. Felsefenin farklı alt dalları da bu soruların etrafında şekillenir.

Felsefe, alt dalları aracılığıyla kendine özgü inceleme alanları tanımlamıştır. Ontoloji varlık ve var oluşun doğasını; epistemoloji bilginin nasıl elde edildiğini ve sınırlarını; etik ahlaki ilkeleri ve değerleri; estetik güzelliği ve sanatı; mantık doğru düşünmenin kurallarını ele alır. Bu dallar birbirinden bağımsız değildir; pek çok felsefi sorun bu alanların kesişiminde belirir ve ancak çoklu bir bakış açısıyla yanıtlanabilir.

Felsefenin bilimden farkı sıkça tartışılan bir meseledir. Bilim, gözlem ve deney yoluyla doğrulanabilir ya da yanlışlanabilir önermeler üretmeye çalışır. Felsefe ise bu türden doğrudan sınanmaya kapalı olan temel kavramları ve varsayımları sorgular. Bilimin kendisine sorduğu "Nasıl?" sorusunun arkasındaki "Neden?" ve "Ne anlama gelir?" sorularını yanıtlamaya çalışır. Bu nedenle felsefe, bilimin neyi araştırdığını ve ne anlama geldiğini sorgulayan üst bir düşünce etkinliği olarak değerlendirilebilir.

Felsefe yapmak, hazır yanıtlar sunmaktan çok soruları derinleştirmek anlamına gelir. Sokrates''in "Bildiğim tek şey hiçbir şey bilmediğimdir" sözü, bu tutumun simgesi olmuştur. Felsefi sorgulama, doğrulanmış bilgilerin ötesine geçerek insan aklının sınırlarını zorlar. Eleştirel düşünme, kavramsal netlik ve tutarlı argümantasyon, felsefenin temel araçlarıdır. Bu nedenle felsefe, salt bir akademik disiplin olmanın ötesinde, özgür ve bağımsız düşüncenin pratik okulu olarak da işlev görür.
  $b$,
  ARRAY['felsefe','ontoloji','epistemoloji','etik','Sokrates','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000011-0000-4000-e100-000000000011','main_idea','Bu metnin ana konusu aşağıdakilerden hangisidir?','["Felsefenin tarihsel gelişimi","Felsefenin tanımı, temel soruları, alt dalları ve bilimden farkı","Yalnızca etik ve ahlak felsefesi","Antik Yunan matematikçileri"]'::jsonb,1,'Metin, felsefenin tanımından temel sorularına, alt dallarından bilimle ilişkisine kadar felsefenin genel çerçevesini bütünsel biçimde ele almaktadır.',2,1),
('e1000011-0000-4000-e100-000000000011','detail','Epistemoloji hangi alanı inceler?','["Varlık ve var oluşun doğasını","Güzelliği ve sanatı","Bilginin nasıl elde edildiğini ve sınırlarını","Toplumsal kurumları"]'::jsonb,2,'Metin, epistemolojinin bilginin nasıl elde edildiğini ve sınırlarını ele aldığını açıkça belirtmektedir.',2,2),
('e1000011-0000-4000-e100-000000000011','detail','Sokrates''in "Bildiğim tek şey hiçbir şey bilmediğimdir" sözü felsefede neyi simgeler?','["Bilimin üstünlüğünü","Felsefi sorgulamanın hazır yanıtlar değil sorular derinleştirme tutumunu","Matematiksel düşüncenin önemini","Dini inancın felsefeye üstünlüğünü"]'::jsonb,1,'Metin, bu sözü felsefenin hazır yanıtlar sunmak yerine soruları derinleştirme tutumunun simgesi olarak konumlandırmaktadır.',2,3),
('e1000011-0000-4000-e100-000000000011','vocabulary','"Argümantasyon" sözcüğü bu metinde ne anlama gelmektedir?','["Tartışma ve kavga etme eylemi","Geçerli gerekçelere dayalı uslamlama ve kanıtlama süreci","Sanatsal yaratım süreci","Deneysel gözlem yöntemi"]'::jsonb,1,'Argümantasyon, mantıksal gerekçeler ve kanıtlar ortaya koyarak bir sonuca ulaşma sürecini tanımlayan felsefi ve mantıksal bir terimdir.',2,4),
('e1000011-0000-4000-e100-000000000011','inference','Felsefenin bilime yönelik "üst düşünce etkinliği" olarak tanımlanması ne anlama gelir?','["Felsefenin bilimden daha az önemli olduğu","Felsefenin bilimlerin temel kavramlarını ve varsayımlarını sorguladığı","Felsefe ile bilimin hiçbir ilgisinin bulunmadığı","Felsefenin bilimin sonuçlarını kabul ettiği"]'::jsonb,1,'Metin, felsefenin bilimin varsayımlarını ve anlamını sorguladığını belirtmektedir; bu durum felsefenin bilimlerin üzerinde konumlandığını ortaya koyar.',2,5);

-- ================================================================
-- METIN 12: TYT Felsefe - Varlik Felsefesi: Idealizm ve Materyalizm
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000012-0000-4000-e100-000000000012',
  'Varlık Felsefesi: İdealizm ve Materyalizm',
  'TYT Felsefe',
  'TYT',
  3,
  440,
  4,
  $b$
Varlık felsefesi ya da ontoloji, "var olan nedir?" sorusunu merkeze alarak gerçekliğin temel doğasını araştırır. Bu alan, yüzyıllar boyunca düşünürlerin en köklü anlaşmazlıklarından birine zemin hazırlamıştır: Dünya temelde zihinsel mi yoksa maddesel mi bir yapıya sahiptir? Bu soruya verilen yanıtlar, iki temel felsefi akımın doğmasına yol açmıştır: idealizm ve materyalizm.

İdealizm, gerçekliğin özünün zihin, bilinç ya da idea olduğunu savunur. Bu anlayışa göre maddesel dünya, ancak zihnin onu algılaması ve düşünmesi sayesinde var olur ya da anlam kazanır. Platon''un idea kuramı, bu akımın antik çağdaki en etkili ifadesiydi. Platon''a göre duyularla algıladığımız dünya, gerçek varlıkların —ideaların— gölgeden ibaret bir yansımasıdır. Gerçek bilgiye ulaşmak, duyular dünyasını aşarak saf akılla ideaları kavramakla mümkündür.

Modern idealizmin en önemli temsilcisi ise Alman filozof Georg Wilhelm Friedrich Hegel''dir. Hegel''e göre gerçeklik, diyalektik bir süreç içinde kendini gerçekleştiren mutlak Tinin (Geist) açılımıdır. Tarih, bu mutlak Tinin özgürlük bilincine doğru ilerleyişinin sahnesidir. İdealizmin ortak paydası, var olanın anlaşılabilmesi için maddenin ötesinde zihinsel ya da tinsel bir ilkenin bulunması gerektiği düşüncesidir.

Materyalizm ise tam aksi yönde konumlanır. Bu akım, temel gerçekliğin madde olduğunu ve her şeyin madde ile onun hareketlerinden türediğini savunur. Antik Yunan''da Demokritos, evrenin küçük bölünemez parçacıklar olan atomlardan oluştuğunu öne sürmüş ve bu düşünce materyalizmin ilk sistematik ifadelerinden birini oluşturmuştur. Modern dönemde ise Karl Marx ve Friedrich Engels, diyalektik materyalizmi geliştirerek tarihin maddi üretim ilişkileriyle şekillendiğini savunmuşlardır.

Günümüzde idealizm ile materyalizm arasındaki karşıtlık, nörobilim ve bilinç araştırmaları alanında yeni biçimler almaktadır. Bilincin beyin süreçlerinden mi yoksa beynin ötesinde tinsel bir boyuttan mı kaynaklandığı, felsefenin güncelliğini koruyan tartışmaları arasındadır. Her iki akım da günümüz felsefesinde daha nüanslı ve karmaşık biçimler kazanmıştır; ancak bu temel gerilim varlığını sürdürmektedir.
  $b$,
  ARRAY['felsefe','idealizm','materyalizm','Platon','Hegel','ontoloji','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000012-0000-4000-e100-000000000012','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Platon ile Hegel aynı felsefi akıma mensuptur","İdealizm ve materyalizm, gerçekliğin temel doğasına ilişkin birbirinin zıttı iki temel felsefi tutumu temsil eder","Materyalizm dini inançlarla örtüşmektedir","Varlık felsefesi yalnızca Antik Yunan''a aittir"]'::jsonb,1,'Metin, idealizm ve materyalizmi karşılaştırarak varlık felsefesinin temel tartışmasını ve bu iki akımın temsilcilerini sistematik biçimde ele almaktadır.',3,1),
('e1000012-0000-4000-e100-000000000012','detail','Platon''a göre duyular dünyası nedir?','["Gerçek var olanların ta kendisi","İdeaların gölgeden ibaret yansıması","Maddenin en yüce biçimi","Yalnızca atomlardan oluşan bir yapı"]'::jsonb,1,'Metin, Platon''a göre duyular dünyasının gerçek varlıkların —ideaların— gölgeden ibaret bir yansıması olduğunu açıkça belirtmektedir.',3,2),
('e1000012-0000-4000-e100-000000000012','detail','Demokritos''un varlık felsefesine temel katkısı nedir?','["Mutlak Tin kavramını geliştirmesi","Evrenin atomlardan oluştuğunu öne sürerek materyalizmin erken ifadesini oluşturması","İdeaların var olduğunu kanıtlaması","Diyalektik yöntemi geliştirmesi"]'::jsonb,1,'Metin, Demokritos''un atomcu görüşüyle materyalizmin ilk sistematik ifadelerinden birini oluşturduğunu belirtmektedir.',3,3),
('e1000012-0000-4000-e100-000000000012','vocabulary','"Diyalektik" sözcüğü bu metinde hangi anlamda kullanılmaktadır?','["Tek yönlü ve değişmez","Karşıt güçlerin çatışması ve sentezi yoluyla ilerleyen","Matematiksel ve kesin","Sanatsal ve yaratıcı"]'::jsonb,1,'Diyalektik, Hegel ve Marx''ın kullandığı anlamıyla, tez-antitez-sentez döngüsüyle ilerleyen çelişkili süreç anlamına gelmektedir.',3,4),
('e1000012-0000-4000-e100-000000000012','inference','Bilincin kaynağına ilişkin nörobilimsel tartışmaların idealizm-materyalizm karşıtlığıyla ilişkisi nedir?','["Bu tartışmanın felsefeyle ilgisi yoktur","Bu güncel tartışma, idealizm-materyalizm karşıtlığının çağdaş formunu temsil etmektedir","Nörobilim idealizmi kesin olarak çürütmüştür","Materyalizm bilimle çelişmektedir"]'::jsonb,1,'Metin, bilinç araştırmalarının bu temel felsefi gerilimi günümüzde de canlı tuttuğunu belirtmektedir.',3,5);

-- ================================================================
-- METIN 13: TYT Felsefe - Bilgi Felsefesi: Empirizm ve Rasyonalizm
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000013-0000-4000-e100-000000000013',
  'Bilgi Felsefesi: Empirizm ve Rasyonalizm',
  'TYT Felsefe',
  'TYT',
  3,
  442,
  4,
  $b$
Bilgi felsefesi ya da epistemoloji, "Bilgi nedir?", "Gerçek bilgiye nasıl ulaşılır?" ve "Bilginin sınırları nelerdir?" gibi temel soruları ele alır. Bu sorulara verilen yanıtlar tarih boyunca iki temel kampı birbirinden keskin biçimde ayırmıştır: empirizm ve rasyonalizm. Bu iki akım, bilginin kaynağı konusunda birbirinin zıddı yönlere işaret eder.

Rasyonalizm, güvenilir bilginin kaynağının akıl olduğunu savunur. Rasyonalistlere göre bazı bilgiler, deneyimden bağımsız olarak yalnızca akıl yürütme aracılığıyla elde edilebilir. Bu tür bilgilere a priori bilgi denir. Fransız düşünür René Descartes, rasyonalizmin en önemli temsilcilerindendir. "Düşünüyorum, öyleyse varım" önermesinde Descartes, hiçbir duyusal deneyime dayanmadan salt akıl yürütmeyle kendisinin var olduğuna ulaşmıştır. Baruch Spinoza ve Gottfried Wilhelm Leibniz, bu geleneği daha da ileri taşıdı.

Empirizm ise tüm bilgilerin sonuçta duyusal deneyimden kaynaklandığını öne sürer. İnsan zihni başlangıçta boş bir levha (tabula rasa) gibidir ve doğuştan gelen hiçbir bilgi taşımaz; bütün bilgiler dünya deneyimiyle yazılır. John Locke bu görüşün en berrak ifadesini sunmuştur. George Berkeley ve David Hume da empirist geleneği geliştirmiş; özellikle Hume, nedensellik gibi temel kavramların deneysel temeline meydan okuyarak sert bir skeptisizme ulaşmıştır.

Immanuel Kant, 18. yüzyılda bu iki karşıt yaklaşımı uzlaştırmaya çalıştı. Kant''a göre bilgi ne salt akıldan ne de salt deneyimden gelir; ikisinin bir araya gelmesiyle oluşur. Zaman, uzay ve nedensellik gibi kategoriler, zihnin deneyimi örgütlemek için önceden sahip olduğu kavramsal çerçevedir. Deneyimin içeriğini zihin, bu kategoriler aracılığıyla işler ve anlamlı bilgiye dönüştürür. Bu sentez, modern epistemoloji tarihinin en önemli dönüm noktalarından biri sayılmaktadır.

Günümüzde empirizm ve rasyonalizm arasındaki tartışma; bilişsel bilim, yapay zekâ ve dil edinimi gibi alanlarda farklı biçimler kazanmaya devam etmektedir. İnsan beyninin bilgiyi doğuştan gelen yapılarla mı yoksa yalnızca deneyimle mi işlediği, hem felsefi hem de bilimsel açıdan yanıt arayan güncel bir sorundur. Epistemolojinin bu klasik tartışması, modern bilimlerin en sıcak araştırma gündemlerinden birini oluşturmaktadır.
  $b$,
  ARRAY['felsefe','epistemoloji','empirizm','rasyonalizm','Descartes','Kant','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000013-0000-4000-e100-000000000013','main_idea','Bu metnin ana konusu nedir?','["Bilimin tarihsel gelişimi","Bilginin kaynağını açıklayan empirizm ve rasyonalizm akımları ile Kant''ın sentezi","Matematiksel ispatların önemi","Duyuların güvenilmezliği"]'::jsonb,1,'Metin, epistemoloji alanında empirizm ve rasyonalizmi karşılaştırarak Kant''ın sentez girişimini ve günümüzdeki yansımalarını kapsamlı biçimde ele almaktadır.',3,1),
('e1000013-0000-4000-e100-000000000013','detail','"Tabula rasa" kavramı kime aittir ve ne anlama gelir?','["Descartes; doğuştan gelen bilgilerin var olduğu anlamına gelir","Locke; zihnin başlangıçta boş bir levha gibi olduğu anlamına gelir","Kant; deneyim ve aklın sentezini ifade eder","Hume; nedenselliğin var olmadığı anlamına gelir"]'::jsonb,1,'Metin, "tabula rasa" kavramının John Locke''a ait olduğunu ve zihnin başlangıçta boş bir levha gibi olduğunu ifade ettiğini açıkça belirtmektedir.',3,2),
('e1000013-0000-4000-e100-000000000013','detail','Kant, empirizm ve rasyonalizmi nasıl uzlaştırdı?','["Yalnızca aklın bilginin kaynağı olduğunu kanıtlayarak","Bilginin hem deneyimden hem de zihnin önceden sahip olduğu kategorilerden oluştuğunu savunarak","Duyuların her zaman yanıltıcı olduğunu göstererek","Bilginin tamamen şüpheyle karşılanması gerektiğini öne sürerek"]'::jsonb,1,'Metin, Kant''ın bilginin ne salt akıldan ne de salt deneyimden geldiğini, ikisinin bir araya gelmesiyle oluştuğunu savunduğunu açıkça belirtmektedir.',3,3),
('e1000013-0000-4000-e100-000000000013','vocabulary','"A priori" ifadesi ne anlama gelmektedir?','["Deneyimden sonra elde edilen","Deneyimden bağımsız, akıl yoluyla elde edilen","Sezgiye dayalı","Toplumsal uzlaşıya dayalı"]'::jsonb,1,'A priori, Latince kökenli bir terim olup deneyimden önce ya da deneyimden bağımsız olarak akıl yoluyla elde edilen bilgiyi tanımlar.',3,4),
('e1000013-0000-4000-e100-000000000013','inference','Hume''un nedensellik gibi kavramların deneysel temeline meydan okuması hangi sonucu doğurdu?','["Empirizmin tamamen terk edilmesine yol açtı","Sert bir skeptisizme ulaşarak bilginin sınırları konusunda radikal bir tutum sergiledi","Kant ile tam uyum içinde bir felsefe ortaya koydu","Rasyonalizmin kesin doğruluğunu kanıtladı"]'::jsonb,1,'Metin, Hume''un bu sorgulamasının sert bir skeptisizme —bilgiye olan şüpheciliğe— ulaştığını açıkça belirtmektedir.',3,5);

-- ================================================================
-- METIN 14: TYT Sosyoloji - Toplumsal Degisme ve Kuresellesme
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000014-0000-4000-e100-000000000014',
  'Toplumsal Değişme ve Küreselleşme',
  'TYT Sosyoloji',
  'TYT',
  2,
  439,
  3,
  $b$
Toplumsal değişme, bir toplumun yapısında, kurumlarında, değerlerinde ve ilişkilerinde zaman içinde gerçekleşen dönüşümlerin tümünü kapsar. Bu değişim sürekli ve kaçınılmazdır; hiçbir toplum donmuş ve sabit bir yapıya sahip değildir. Sosyoloji, toplumsal değişmenin nedenlerini, biçimlerini ve sonuçlarını anlama çabası içinde sistematik bir bakış açısı geliştirmiştir. Değişimin hızı, yönü ve kapsamı, toplumdan topluma ve dönemden döneme büyük farklılıklar gösterir.

Toplumsal değişmeyi açıklamaya çalışan çeşitli kuramsal yaklaşımlar geliştirilmiştir. Evrimci yaklaşım, toplumların basitten karmaşığa doğru ilerlediğini savunur. Çatışmacı yaklaşım, değişmenin kaynağını sınıf, güç ve çıkar çatışmalarında arar. İşlevselci yaklaşım ise toplumsal değişmeyi, sistemin bütününün dengesini yeniden kurma çabası olarak yorumlar. Bu farklı perspektifler, toplumsal gerçekliğin farklı boyutlarını aydınlatmaya katkıda bulunur.

Küreselleşme, 20. yüzyılın son çeyreğinden itibaren toplumsal değişmenin en belirleyici dinamiklerinden biri haline gelmiştir. Ulaşım ve iletişim teknolojilerindeki devrimsel gelişme, ulusal sınırları aşan ekonomik, kültürel ve siyasi bağlantıları yoğunlaştırdı. Küresel ticaret ağları, çok uluslu şirketler ve uluslararası kuruluşlar, ulus-devletin egemenlik alanını daha önce görülmemiş biçimlerde sınırlamaya başladı. Bu süreç hem yeni ekonomik olanaklar hem de derin eşitsizlikler yarattı.

Kültürel küreselleşme, yerel kimlikler üzerinde derin etkiler bırakmaktadır. Amerikan popüler kültürü, Batı tüketim kalıpları ve küresel medyanın yaygınlaşması, yerel geleneklerin ve yaşam biçimlerinin aşınmasına katkıda bulunmaktadır. Buna karşılık bazı topluluklar, küreselleşmeye tepki olarak kimlik politikaları ve yerelci hareketler geliştirmiştir. Küresel ile yerel arasındaki bu dinamik gerilim, günümüz sosyolojisinin temel tartışma başlıklarından birini oluşturmaktadır.

Dijital teknoloji ve sosyal medya, toplumsal değişmeyi tarihte görülmemiş bir hızla tetiklemektedir. Bilginin yayılımı anlık bir hal alırken toplumsal hareketler, siyasi katılım biçimleri ve bireyler arası ilişkiler kökten dönüşmektedir. Bu dönüşüm beraberinde yeni eşitsizlikleri (dijital uçurum), yeni iktidar biçimlerini ve yeni dayanışma ağlarını getirmektedir. Toplumsal değişmenin bu en yeni boyutunu anlamak, sosyolojinin bugün karşı karşıya olduğu en güncel zorluklardan birini oluşturmaktadır.
  $b$,
  ARRAY['sosyoloji','toplumsal değişme','küreselleşme','kültür','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000014-0000-4000-e100-000000000014','main_idea','Bu metnin temel konusu nedir?','["Yalnızca kültürel küreselleşme","Toplumsal değişmenin tanımı, kuramsal yaklaşımları ve küreselleşmeyle ilişkisi","Sosyal medyanın ekonomiye etkisi","Ulus-devletin tarihi"]'::jsonb,1,'Metin, toplumsal değişmenin tanımından kuramsal yaklaşımlarına, küreselleşmeden dijital dönüşüme uzanan kapsamlı bir çerçeve sunmaktadır.',2,1),
('e1000014-0000-4000-e100-000000000014','detail','Çatışmacı yaklaşıma göre toplumsal değişmenin kaynağı nedir?','["Toplumun denge arayışı","Sınıf, güç ve çıkar çatışmaları","Evrimsel ve doğal ilerleme","Teknolojik yenilikler"]'::jsonb,1,'Metin, çatışmacı yaklaşımın değişmenin kaynağını sınıf, güç ve çıkar çatışmalarında aradığını açıkça belirtmektedir.',2,2),
('e1000014-0000-4000-e100-000000000014','detail','Küreselleşmeye tepki olarak bazı toplulukların geliştirdiği hareket nedir?','["Küresel ticaret birliğine katılma","Kimlik politikaları ve yerelci hareketler","Ulusal ordularını güçlendirme","Yabancı dil öğrenme programları"]'::jsonb,1,'Metin, bazı toplulukların küreselleşmeye tepki olarak kimlik politikaları ve yerelci hareketler geliştirdiğini belirtmektedir.',2,3),
('e1000014-0000-4000-e100-000000000014','vocabulary','"Dijital uçurum" ifadesi ne anlama gelmektedir?','["İnternetteki içerik farklılığı","Teknolojiye erişim ve kullanım konusundaki toplumsal eşitsizlik","Sosyal medya ağları arasındaki rekabet","Dijital cihazların fiyat farkı"]'::jsonb,1,'Dijital uçurum, bilgisayar ve internet gibi dijital teknolojilere erişim ve bunları etkin kullanma konusundaki bireyler ve topluluklar arası eşitsizliği tanımlamaktadır.',2,4),
('e1000014-0000-4000-e100-000000000014','inference','Küreselleşmenin ulus-devletin egemenliğini sınırlamaya başlaması ne anlama gelir?','["Ulus-devletlerin tamamen ortadan kalktığı","Küresel ekonomik ve siyasi aktörlerin devletlerin kararlarını giderek daha fazla etkilediği","Küreselleşmenin her zaman olumlu sonuçlar doğurduğu","Uluslararası kuruluşların güçsüz kaldığı"]'::jsonb,1,'Metin, çok uluslu şirketler ve uluslararası kuruluşların ulus-devlet egemenliğini sınırladığını belirtmektedir; bu durum, devlet dışı aktörlerin giderek artan etkisini göstermektedir.',2,5);

-- ================================================================
-- METIN 15: TYT Psikoloji - Ogrenme: Kosullanma ve Pekistirme
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'e1000015-0000-4000-e100-000000000015',
  'Öğrenme Psikolojisi: Koşullanma ve Pekiştirme',
  'TYT Psikoloji',
  'TYT',
  2,
  441,
  3,
  $b$
Öğrenme, bireyin deneyim ve pratik aracılığıyla davranışlarında ya da bilgi yapısında kalıcı değişiklikler meydana getirme sürecidir. Psikoloji bilimi, bu sürecin nasıl işlediğini anlamak için çeşitli kuramlar geliştirmiştir. Bunların en köklüsü ve en etkili olanları, koşullanma ve pekiştirme kavramları üzerine inşa edilmiş davranışçı yaklaşımlardır. Bu yaklaşımlar, öğrenmeyi gözlemlenebilir uyaran-tepki ilişkileri üzerinden açıklamaya çalışır.

Klasik koşullanma, Rus fizyologu Ivan Pavlov''un köpeklerle yaptığı deneyler aracılığıyla bilim dünyasına tanıtıldı. Pavlov, zil sesi (koşullu uyaran) ile et tozu (koşulsuz uyaran) arasında sürekli bir bağ kurduğunda, köpeklerin yalnızca zil sesini duyduklarında salya salgılamaya başladıklarını gözlemledi. Bu deneyle koşulsuz bir tepkinin (salya salgılama) koşullu bir uyarana bağlandığı gösterildi. Klasik koşullanma, özellikle duygusal tepkilerin oluşmasında belirleyici bir rol oynar.

Edimsel koşullanma ise B. F. Skinner tarafından sistematik biçimde geliştirildi. Bu modelde organizma, kendi davranışlarının sonuçlarından öğrenir. Bir davranışın ardından ödül (pekiştireç) geliyorsa o davranışın tekrarlanma olasılığı artar; ceza geliyorsa azalır. Skinner, "Skinner Kutusu" adıyla bilinen deney düzeneğinde fareler ve güvercinlerle yürüttüğü çalışmalarla bu ilişkiyi kanıtladı. Olumlu pekiştirme, olumsuz pekiştirme ve ceza bu modelin temel kavramları arasındadır.

Pekiştirme programları, bir davranışın ne zaman ve ne sıklıkla ödüllendirileceğini belirler ve bu durum öğrenme sürecini doğrudan etkiler. Sabit oranlı, değişken oranlı, sabit aralıklı ve değişken aralıklı pekiştirme programlarının her biri farklı öğrenme hızı ve direnç profilleri ortaya çıkarır. Değişken oranlı pekiştirme, en yüksek ve en direngen tepki örüntüsünü oluşturur; kumarın bağımlılık yapıcı niteliği bu olgu üzerinden açıklanabilir.

Sosyal öğrenme kuramı, Albert Bandura tarafından geliştirilerek davranışçılığı gözlem yoluyla öğrenme boyutuna taşıdı. Bandura''nın Bobo Bebek deneyleri, çocukların yetişkinlerin saldırgan davranışlarını doğrudan deneyimlemeksizin yalnızca gözlemleyerek taklit edebildiğini ortaya koydu. Gözlem yoluyla öğrenme, pekiştirme olmaksızın gerçekleşebilir ve özellikle dil, sosyal normlar ile karmaşık becerilerin edinilmesinde kilit rol oynar.
  $b$,
  ARRAY['psikoloji','öğrenme','koşullanma','pekiştirme','Pavlov','Skinner','Bandura','TYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('e1000015-0000-4000-e100-000000000015','main_idea','Bu metnin ana konusu aşağıdakilerden hangisidir?','["Yalnızca Pavlov''un deneyleri","Öğrenme psikolojisinde koşullanma, pekiştirme ve gözlem yoluyla öğrenme kuramları","Çocukların dil gelişimi","Bellek ve hatırlama süreçleri"]'::jsonb,1,'Metin, klasik koşullanmadan edimsel koşullanmaya, pekiştirme programlarından sosyal öğrenmeye uzanan öğrenme kuramlarını kapsamlı biçimde ele almaktadır.',2,1),
('e1000015-0000-4000-e100-000000000015','detail','Pavlov''un deneyinde "koşullu uyaran" neydi?','["Et tozu","Köpeklerin salya salgılaması","Zil sesi","Deney kutusu"]'::jsonb,2,'Metin, zil sesinin başlangıçta tarafsız olan ancak et tozuyla eşleştirilerek koşullu uyaran haline gelen uyaran olduğunu belirtmektedir.',2,2),
('e1000015-0000-4000-e100-000000000015','detail','Edimsel koşullanmada bir davranışın tekrarlanma olasılığını artıran etken nedir?','["Ceza","Pekiştireç (ödül)","Pasif gözlem","Klasik koşullanma"]'::jsonb,1,'Metin, bir davranışın ardından ödül (pekiştireç) geliyorsa tekrarlanma olasılığının arttığını açıkça belirtmektedir.',2,3),
('e1000015-0000-4000-e100-000000000015','vocabulary','"Pekiştireç" sözcüğü bu metinde ne anlama gelmektedir?','["Ceza aracı","Bir davranışı tekrar ettirme olasılığını artıran ödül ya da hoş sonuç","Öğrenmeyi engelleyen etken","Öğrenme programı"]'::jsonb,1,'Pekiştireç, edimsel koşullanmada bir davranışın ardından sunulan ve o davranışın tekrarlanma olasılığını artıran uyarıcıyı tanımlar.',2,4),
('e1000015-0000-4000-e100-000000000015','inference','Kumarın bağımlılık yapıcı niteliğinin değişken oranlı pekiştirme üzerinden açıklanması ne anlama gelir?','["Kumar her oyunda ödüllendirme sağlar","Belirsiz ve düzensiz ödüllerin çok güçlü ve sürdürülebilir davranış kalıpları oluşturduğu","Kumarın tamamen psikolojik bir hastalık olduğu","Ödülün cezadan daha etkili olduğu"]'::jsonb,1,'Değişken oranlı pekiştirme en direngen tepki örüntüsünü oluşturur; kumardaki belirsiz ödüller bu mekanizmayı tetikler ve davranışın sürdürülmesini sağlar.',2,5);

-- ================================================================
-- Tum metinler ve sorular basariyla eklendi
-- ================================================================
  RAISE NOTICE '050: TYT Sosyal Bilimler 15 metin + 75 soru basariyla eklendi.';
END;
$migration$;
