-- =====================================================
-- 047_lgs_fen_tam.sql
-- LGS Fen Bilimleri: 10 metin × 5 soru = 50 soru
-- Konular: Madde, Kuvvet, Ses, Makineler, Kimya,
--          Hücre, Kalıtım, Fotosentez, Periyodik Tablo, Biyoteknoloji
-- =====================================================

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM public.text_library WHERE category LIKE 'LGS Fen%') > 0 THEN
    RAISE NOTICE '047: LGS Fen içerikleri zaten mevcut, atlanıyor.';
    RETURN;
  END IF;

  -- ─── METİNLER ────────────────────────────────────────────────────

  -- 1. Madde ve Değişim
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000001',
    'Madde ve Değişim: Fiziksel ve Kimyasal Dönüşümler',
    $b$Madde, kütlesi olan ve yer kaplayan her şeydir. Maddeler çeşitli değişimler geçirebilir; bu değişimler iki temel kategoride incelenir: fiziksel değişimler ve kimyasal değişimler. Fiziksel değişimlerde maddenin kimyasal yapısı bozulmaz, yalnızca fiziksel özellikleri değişir. Örneğin suyun donması ya da buharlaşması fiziksel değişime örnektir. Bu süreçlerde su molekülleri aynı kalır, yalnızca moleküllerin düzeni ve enerjisi değişir.

Kimyasal değişimlerde ise maddenin kimyasal yapısı köklü biçimde dönüşür ve yeni maddeler oluşur. Demirin paslanması, odunun yanması, yiyeceklerin sindirilmesi kimyasal değişime örnek gösterilebilir. Kimyasal değişimlerde genellikle ısı açığa çıkması veya soğurulması, renk değişikliği, gaz çıkışı ya da çökelti oluşumu gibi belirtiler gözlemlenir.

Maddenin özellikleri de iki grupta incelenir: öz kütleye bağlı olan yoğunluk, erime noktası ve kaynama noktası gibi ayırt edici özellikler ile kütleye bağlı olan hacim ve ağırlık gibi ayırt edici olmayan özellikler. Ayırt edici özellikler, maddeleri birbirinden ayırt etmemizi sağlar ve madde miktarına bağlı değildir.

Karışımlar, birden fazla maddenin bir araya gelmesiyle oluşur ve homojen ya da heterojen olabilir. Homojen karışımlarda (çözeltilerde) bileşenler gözle görülemeyecek kadar ince dağılır. Şeker çözeltisi bu duruma örnek verilebilir. Heterojen karışımlarda ise bileşenler gözle ayırt edilebilir; kumlu su ya da tuz-demir tozu karışımı buna örnek gösterilebilir.

Saf maddeler elementler ve bileşiklerden oluşur. Elementler yalnızca tek tür atom içerirken bileşikler farklı atomların belirli oranlarda kimyasal olarak birleşmesiyle meydana gelir. Örneğin su (H₂O), hidrojen ve oksijenin belirli oranda birleşmesiyle oluşan bir bileşiktir.

Maddelerin fiziksel ve kimyasal özelliklerinin iyi bilinmesi, günlük yaşamda karşılaştığımız pek çok olayı anlamamıza yardımcı olur. Endüstride hammadde seçimi, tarımda gübre kullanımı, tıpta ilaç üretimi gibi pek çok alanda madde bilgisi temel rol oynar. Bu nedenle fen bilimleri eğitiminin vazgeçilmez konularından biri madde ve değişimdir.$b$,
    432,
    2,
    'LGS',
    'LGS Fen - Madde ve Değişim',
    ARRAY['fen', 'madde', 'kimya', 'fiziksel değişim', 'LGS'],
    'published'
  );

  -- 2. Kuvvet ve Hareket
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000002',
    'Kuvvet ve Hareket: Newton Yasaları',
    $b$Kuvvet, cisimlerin hareket durumunu değiştiren ya da cisimleri şekil değiştirmeye zorlayan bir etkendir. Kuvvetin birimi Newton (N) olup hem büyüklük hem yön bilgisi gerektirdiğinden vektörel bir büyüklüktür. Bir cisme etki eden kuvvetlerin bileşkesi sıfırsa cisim denge halindedir; yani ya hareketsiz durur ya da sabit hızla hareket eder.

Newton'ın birinci hareket yasası olan eylemsizlik yasası, dış kuvvet etki etmediği sürece bir cismin mevcut durumunu koruyacağını belirtir. Duran bir cisim durmaya, hareket eden bir cisim de aynı doğrultuda ve aynı hızla hareket etmeye devam eder. Bu yasanın günlük yaşamdaki en bilinen örneği, aniden frene basıldığında yolcuların öne doğru yatmasıdır.

İkinci yasa, kuvvet ile ivme arasındaki ilişkiyi ifade eder: F = m × a formülüyle gösterilir. Buna göre bir cisme etki eden net kuvvet arttıkça oluşan ivme de artar; kütle arttıkça ise ivme azalır. Aynı kuvvetle daha ağır bir nesneyi hareket ettirmek daha güçtür; bu durum ikinci yasanın doğrudan sonucudur.

Üçüncü yasa ise etki-tepki ilkesidir: Her kuvvetin eşit büyüklükte ve zıt yönde bir tepkisi vardır. Yer çekimi dünyayı çekerken dünya da bizi çeker; roketin arka tarafa ittiği gazlar, roketi öne doğru iter.

Sürtünme kuvveti, iki yüzey arasında hareketin yönüne zıt yönde etki eden bir kuvvettir. Statik sürtünme hareketi başlatmayı güçleştirirken kinetik sürtünme hareket halindeki bir cismi yavaşlatır. Günlük yaşamda fren sistemleri, yürüme ve yazı yazma gibi pek çok işlem sürtünme kuvveti sayesinde gerçekleşir.

Ağırlık, yer çekiminin bir cisim üzerine uyguladığı kuvvettir; A = m × g formülüyle hesaplanır (g ≈ 10 m/s²). Kütle ise cisimde bulunan madde miktarının ölçüsüdür ve her yerde aynı kalır. Bu iki kavram arasındaki fark fizik eğitiminin temel konularından birini oluşturur.$b$,
    438,
    2,
    'LGS',
    'LGS Fen - Kuvvet ve Hareket',
    ARRAY['fen', 'kuvvet', 'hareket', 'Newton', 'LGS'],
    'published'
  );

  -- 3. Ses ve Özellikleri
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000003',
    'Ses: Üretimi, Yayılması ve Özellikleri',
    $b$Ses, maddenin titreşimi sonucunda oluşan ve ortamda dalgalar halinde yayılan bir enerji türüdür. Ses dalgaları boyuna dalgalardır; yani titreşim yönü ile yayılma yönü aynıdır. Ses, katı, sıvı ve gaz ortamlarda yayılabilir; ancak boşlukta yayılamaz çünkü ses dalgaları taşınım için madde gerektirir.

Sesin farklı ortamlardaki hızları birbirinden farklıdır. Ses, katılarda en hızlı, gazlarda en yavaş yayılır. Oda sıcaklığında havadaki ses hızı yaklaşık 340 m/s iken çelikteki ses hızı 5000 m/s'nin üzerindedir. Sıcaklık arttıkça gaz ortamlarda sesin hızı da artar; bu durum moleküllerin daha hızlı titreşmesiyle açıklanabilir.

Sesin üç temel özelliği vardır: frekans, genlik ve dalga boyu. Frekans, birim zamandaki titreşim sayısıdır ve Hertz (Hz) birimiyle ölçülür. Yüksek frekanslı sesler ince (tiz), düşük frekanslı sesler ise kalın (pes) bir tona sahiptir. İnsan kulağı genellikle 20 Hz ile 20.000 Hz arasındaki sesleri duyabilir; bu aralığın dışında kalan sesler ultraseson (üst) ya da infraseson (alt) olarak adlandırılır.

Genlik, sesin şiddetiyle ilgilidir. Yüksek genlikli titreşimler gürültülü, düşük genlikli titreşimler ise sessiz seslere karşılık gelir. Sesin şiddeti desibel (dB) birimiyle ölçülür. Sürekli 85 dB ve üzeri sese maruz kalmak işitme hasarına yol açabilir.

Yankı (eko) ve rezonans sesin yansımasına bağlı olgulardır. Ses bir engelle karşılaştığında bir kısmı soğurulur, bir kısmı yansır. Yansıyan sesin gecikmeli olarak duyulması yankıyı oluşturur. Rezonans ise bir cismin doğal frekansında titreştirilmesiyle ortaya çıkar ve sesin giderek güçlenmesini sağlar. Müzik aletlerinin çalışma prensibi büyük ölçüde rezonans olgusuna dayanır.$b$,
    427,
    2,
    'LGS',
    'LGS Fen - Ses',
    ARRAY['fen', 'ses', 'titreşim', 'frekans', 'LGS'],
    'published'
  );

  -- 4. Basit Makineler
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000004',
    'Basit Makineler: Kaldıraçlar ve Verim',
    $b$Basit makineler, uygulanan kuvvetin büyüklüğünü, yönünü ya da her ikisini birden değiştirerek iş yapmayı kolaylaştıran aletlerdir. Bu makineler enerji kazandırmaz; yalnızca kuvvetin uygulanma şeklini düzenler. Temel basit makineler arasında kaldıraçlar, kasnaklar, eğik düzlemler, çıkrıklar ve vidalar sayılabilir.

Kaldıraçlar, bir direnç noktası (yük), bir dayanak noktası (fulkrum) ve bir kuvvet uygulama noktasından oluşur. Birinci sınıf kaldıraçlarda dayanak noktası, kuvvet ve direnç arasında yer alır. Makas, levye ve baskül bu türe örnek verilebilir. İkinci sınıf kaldıraçlarda direnç noktası ortadadır; el arabası ve kıl maşası bu gruba girer. Üçüncü sınıf kaldıraçlarda ise kuvvet uygulama noktası ortadadır; pinset ve olta bu türün örnekleridir.

Kaldıraç denklemi şu şekilde ifade edilir: Kuvvet × Kuvvet kolu = Direnç × Direnç kolu. Kuvvet kolunu uzatmak, daha az kuvvetle daha büyük yük kaldırmayı mümkün kılar. Ancak kol uzunluğunu artırmak yükün hareket ettiği mesafeyi azaltır; bu durum işin korunumu ilkesiyle örtüşmektedir.

Kasnaklar ipler aracılığıyla yük taşıyan basit makinelerdir. Tek hareketli kasnak yükü azaltırken iple gidilen yolu artırır. Çok kasnaklı sistemlerde mekanik avantaj kasnak sayısıyla orantılı olarak artar.

Eğik düzlem, yatay ile belirli bir açı yapan yüzeydir. Yük doğrudan yukarı kaldırmak yerine eğik yüzey boyunca itildiğinde daha az kuvvet harcanır; ancak daha fazla yol kat edilir.

Verim, faydalı çıkış işinin toplam girdi işine oranıdır ve yüzde olarak ifade edilir. Gerçek makinelerde sürtünme ve diğer kayıplar nedeniyle verim her zaman yüzde yüzden azdır. Mühendisler, makine tasarımında verimliliği artırmak için sürtünmeyi azaltacak malzeme ve yağlama yöntemlerine başvurur.$b$,
    431,
    3,
    'LGS',
    'LGS Fen - Basit Makineler',
    ARRAY['fen', 'basit makineler', 'kaldıraç', 'verim', 'LGS'],
    'published'
  );

  -- 5. Kimyasal Reaksiyonlar
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000005',
    'Kimyasal Reaksiyonlar ve Tepkime Hızı',
    $b$Kimyasal reaksiyon, maddelerin atomik düzeyde yeniden düzenlenerek yeni maddeler oluşturduğu süreçtir. Reaksiyona giren maddelere reaktant, oluşan yeni maddelere ürün adı verilir. Kimyasal denklemler bu süreci sembolik olarak gösterir ve madde korunumu ilkesi uyarınca denkleştirilmesi gerekir.

Kimyasal tepkimeler birleşme, ayrışma, yer değiştirme ve çift yer değiştirme olmak üzere dört temel türde sınıflandırılır. Birleşme tepkimelerinde iki ya da daha fazla madde tek bir ürün verir; örneğin hidrojen ve oksijenin su oluşturmak için birleşmesi. Ayrışma tepkimelerinde tek bir bileşik farklı ürünlere dönüşür; kalsiyum karbonatın ısıtılması bu türe örnektir.

Tepkime hızı, birim zamanda oluşan ya da yok olan madde miktarını ifade eder. Tepkime hızını etkileyen başlıca faktörler şunlardır: reaktant konsantrasyonu, sıcaklık, yüzey alanı ve katalizörler. Konsantrasyon artışı, moleküller arası çarpışma sıklığını artırarak tepkime hızını yükseltir. Sıcaklık artışı ise moleküllerin kinetik enerjisini artırarak etkin çarpışma sayısını çoğaltır.

Katalizörler, tepkime için gereken aktivasyon enerjisini düşürerek süreci hızlandıran maddelerdir; tepkime sonunda kendileri değişmez. Endüstriyel süreçlerde katalizörler büyük önem taşır: Haber prosesi ile amonyak üretiminde demir katalizörü, otomobil egzoz sistemlerinde ise platin ve palladyum kullanılır.

Asit-baz reaksiyonları günlük yaşamda en sık karşılaşılan kimyasal tepkimelerdir. Asitler H⁺ iyonu verirken bazlar OH⁻ iyonu verir. Bir asitin bir bazla tepkimesi tuz ve su oluşturur; bu süreç nötrleşme olarak adlandırılır. Mide asidinin etkisini azaltmak için kullanılan antiasitler bu ilkeye dayanır.

Oksidasyon-indirgenme tepkimeleri (redoks), elektron transferini kapsayan reaksiyonlardır. Pillerde, korozyon olaylarında ve fotosentezde bu tür tepkimeler gerçekleşir. Elektrokimyasal hücreler redoks prensibini kullanarak kimyasal enerjiyi elektrik enerjisine dönüştürür.$b$,
    436,
    3,
    'LGS',
    'LGS Fen - Kimyasal Reaksiyonlar',
    ARRAY['fen', 'kimya', 'reaksiyon', 'katalizör', 'LGS'],
    'published'
  );

  -- 6. Hücre Bölünmesi
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000006',
    'Hücre Bölünmesi: Mitoz ve Mayoz',
    $b$Hücre bölünmesi, canlıların büyümesi, onarımı ve üremesi için zorunlu olan temel biyolojik süreçtir. İki ana hücre bölünme türü vardır: mitoz ve mayoz. Bu iki süreç farklı amaçlara hizmet eder ve birbirinden önemli biçimlerde ayrılır.

Mitoz bölünme, bir hücreden genetik açıdan özdeş iki hücre oluşturan süreçtir. Büyüme, yara iyileşmesi ve doku yenilenmesi mitozla gerçekleşir. Mitoz; profaz, metafaz, anafaz ve telofaz olmak üzere dört evreye ayrılır. Profazda kromozomlar belirginleşir ve çekirdek zarı çözülür. Metafazda kromozomlar hücrenin ortasında dizilir. Anafazda kardeş kromatidler ayrılarak hücrenin zıt kutuplarına çekilir. Telofazda ise çekirdek zarları yeniden oluşur ve sitokinez ile hücre ikiye bölünür.

Mayoz bölünme, eşeyli üremeye katılan gamet (sperm ve yumurta) hücrelerini üretmek amacıyla gerçekleşir. İki ardışık bölünme evresinden oluşur: mayoz I ve mayoz II. Sonuçta dört haploit hücre oluşur; bu hücreler anne ya da baba hücreyle karşılaştırıldığında yalnızca yarım kromozom takımına sahiptir.

Mayozun en önemli özelliği krossing-over olgusudur. Profaz I evresinde homolog kromozomlar çaprazlayarak gen değişimi gerçekleştirir. Bu, genetik çeşitliliği artıran temel mekanizmadır ve evrimsel açıdan büyük önem taşır.

Hücre döngüsü, S fazı (DNA replikasyonu), G1 ve G2 büyüme fazları ile mitoz olmak üzere birbirine bağlı evrelerden oluşur. Hücre döngüsünün kontrol noktaları, hasarlı ya da eksik replike edilmiş DNA'ya sahip hücrelerin bölünmesini engelleyen önemli denetim mekanizmaları işlevi görür. Bu kontrol noktalarındaki arızalar kanser gibi hastalıklara zemin hazırlayabilir.

Kök hücreler, kendini yenileme ve farklı hücre tiplerine dönüşebilme kapasitesine sahip özel hücrelerdir. Tıp dünyasında hasarlı dokuların yenilenmesi amacıyla yürütülen araştırmalarda kök hücreler büyük umut vaat etmektedir.$b$,
    430,
    3,
    'LGS',
    'LGS Fen - Hücre Bölünmesi',
    ARRAY['fen', 'biyoloji', 'hücre', 'mitoz', 'mayoz', 'LGS'],
    'published'
  );

  -- 7. Kalıtım ve Genetik
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000007',
    'Kalıtım: Mendel Yasaları ve Genetik Miras',
    $b$Kalıtım, özelliklerin ebeveynlerden yavrulara aktarılmasını inceleyen biyoloji dalıdır. Gregor Mendel, bezelye bitkisiyle yaptığı deneyler sayesinde kalıtımın temel yasalarını ortaya koymuş ve modern genetiğin kurucusu olarak kabul görmüştür. Mendel, baskın ve çekinik gen kavramlarını keşfederek özellik aktarımını tahmin etmeyi mümkün kılmıştır.

Mendel'in birinci yasası olan ayrılma yasası, bir organizmanın bir karakter için iki gen taşıdığını ve bu genlerin gamet oluşumu sırasında ayrılarak her gamete yalnızca bir gen geçtiğini ifade eder. Baskın gen (büyük harfle gösterilir) varlığında o karakter baskın şekilde ortaya çıkarken çekinik gen (küçük harfle gösterilir) yalnızca homozigot durumda kendini gösterir.

İkinci yasa ise bağımsız dağılım yasasıdır: Farklı karakterleri belirleyen gen çiftleri birbirinden bağımsız olarak dağılır. Bu yasa, aynı anda iki ya da daha fazla karakterin kalıtımını açıklar. Monohibrit çaprazlamada 3:1, dihibrit çaprazlamada 9:3:3:1 fenotip oranları elde edilir.

Genotip, bir organizmanın genetik yapısını; fenotip ise bu genetik yapının dış görünüme yansımasını ifade eder. Homozigot bireyler her iki alleli aynı (AA ya da aa), heterozigot bireyler ise farklı alleli (Aa) taşır.

Mendel kalıtımının yanı sıra bazı karakter aktarımları daha karmaşık örüntüler gösterir. Ara baskınlıkta heterozigot birey her iki ebeveynin ortasında bir fenotip sergilerken eş baskınlıkta her iki özellik de aynı anda ifade edilir. Kan grupları eş baskınlığa güzel bir örnek oluşturur.

Cinse bağlı kalıtımda genler cinsiyet kromozomlarında (X ya da Y) taşınır. Renk körlüğü ve hemofili, X'e bağlı çekinik karakterlere örnek gösterilebilir. Bu özellikler erkeklerde (XY) yalnızca bir bozuk X alleli varsa ortaya çıkarken kadınlarda (XX) iki bozuk allele ihtiyaç duyulur.$b$,
    436,
    3,
    'LGS',
    'LGS Fen - Kalıtım ve Genetik',
    ARRAY['fen', 'biyoloji', 'kalıtım', 'Mendel', 'genetik', 'LGS'],
    'published'
  );

  -- 8. Fotosentez ve Solunum
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000008',
    'Fotosentez ve Hücresel Solunum: Enerji Dönüşümleri',
    $b$Fotosentez, yeşil bitkilerin ve bazı mikroorganizmaların güneş ışığını kullanarak inorganik maddelerden organik besin ürettiği süreçtir. Bu süreç kloroplastlarda gerçekleşir ve iki ana aşamaya ayrılır: ışığa bağımlı reaksiyonlar ve Calvin döngüsü (ışıktan bağımsız reaksiyonlar).

Işığa bağımlı reaksiyonlar tilakoid zarında gerçekleşir. Bu aşamada klorofil ışık enerjisini soğurarak su moleküllerini parçalar; oksijen açığa çıkar ve ATP ile NADPH üretilir. Açığa çıkan oksijen, bitkiler tarafından dışarıya salınan bir "atık ürün" olsa da atmosferimizin temel bileşenini oluşturur.

Calvin döngüsü ise stromanın içinde gerçekleşir ve atmosferden alınan karbondioksit, ışığa bağımlı reaksiyonlarda üretilen ATP ve NADPH yardımıyla glikoza dönüştürülür. Bu aşamada karbondioksitin organik bileşiklere dönüşmesi karbonun fikse edilmesi olarak adlandırılır.

Genel fotosentez denklemi şöyle özetlenebilir: 6CO₂ + 6H₂O + ışık enerjisi → C₆H₁₂O₆ + 6O₂. Fotosentez hızı; ışık yoğunluğu, karbondioksit konsantrasyonu ve sıcaklıktan etkilenir. Bu faktörlerden herhangi biri sınırlayıcı olduğunda fotosentez hızı düşer.

Hücresel solunum ise fotosentezin tersi bir işlemdir: glikoz, oksijen kullanılarak karbondioksit ve suya parçalanır; bu süreçte ATP şeklinde enerji açığa çıkar. Glikoliz, Krebs döngüsü ve oksidatif fosforilasyon olmak üzere üç aşamada gerçekleşir. Aerobik solunumda bir glikoz molekülünden yaklaşık 36-38 ATP üretilir.

Anaerobik solunum ise oksijensiz koşullarda gerçekleşir ve çok daha az enerji üretir. Mayalanma (fermentasyon) anaerobik solunumun en tanınan örneğidir; ekmek yapımı ve bira üretiminde bu süreçten yararlanılır. Kaslarımızda yoğun egzersiz sırasında da geçici olarak anaerobik solunum gerçekleşir ve laktik asit birikimi yorgunluk hissine yol açar.$b$,
    439,
    3,
    'LGS',
    'LGS Fen - Fotosentez ve Solunum',
    ARRAY['fen', 'biyoloji', 'fotosentez', 'solunum', 'enerji', 'LGS'],
    'published'
  );

  -- 9. Periyodik Tablo
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000009',
    'Periyodik Tablo: Elementlerin Sınıflandırılması',
    $b$Periyodik tablo, elementleri atom numarasına göre dizileyen ve aralarındaki ilişkileri sistematik biçimde ortaya koyan temel bir kimya aracıdır. Dmitri Mendeleyev, 1869 yılında ilk kapsamlı periyodik tabloyu oluşturmuş; zamanla yapılan güncellemeler sonucunda modern periyodik tablo 118 elementi kapsar hale gelmiştir.

Modern periyodik tabloda elementler yatay satırlara (periyotlar) ve dikey sütunlara (gruplar) yerleştirilmiştir. Tabloda 7 periyot ve 18 grup bulunur. Aynı gruptaki elementler benzer kimyasal özellikler gösterirken aynı periyottaki elementlerde özellikler soldan sağa doğru düzenli bir değişim sergiler.

Elementler metal, ametal ve yarı metal (metaloit) olmak üzere üç ana kategoriye ayrılır. Metaller elektriği ve ısıyı iyi iletir, parlak görünümlüdür ve genellikle katı haldedir; demir, bakır ve alüminyum bu grubun örnekleridir. Ametaller elektriği iletmez, mat görünümlüdür ve gaz ya da katı halde bulunabilir; oksijen, azot ve kükürt ametal sınıfına girer.

Periyodik özellikler tabloda belirli eğilimler gösterir. Atom yarıçapı gruplar aşağıya doğru indikçe artar (elektron katmanı sayısı artışıyla), periyot boyunca ise sağa doğru azalır (artan çekirdek yükü elektronları daha güçlü çeker). İyonlaşma enerjisi periyot boyunca artarken elektron ilgisi de benzer bir eğilim sergiler.

Alkali metaller (Grup 1) son derece reaktif elementlerdir ve suyla şiddetli tepkime verir. Soy gazlar (Grup 18) ise kimyasal açıdan kararlı olup nadiren bileşik oluştururlar. Halojenler (Grup 17) ametal özelliklerin en belirgin sergilendiği gruptur ve çok sayıda bileşik oluşturabilirler.

Geçiş metalleri (3-12. gruplar) renkli bileşikler oluşturabilir ve birden fazla değerlik alabilir. Demir (Fe), bakır (Cu) ve çinko (Zn) en önemli geçiş metallerindendir. Endüstriyel, tıbbi ve teknolojik alanlarda bu metallerin kullanımı son derece yaygındır.$b$,
    432,
    2,
    'LGS',
    'LGS Fen - Periyodik Tablo',
    ARRAY['fen', 'kimya', 'periyodik tablo', 'elementler', 'LGS'],
    'published'
  );

  -- 10. Biyoteknoloji ve Genetik Mühendisliği
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'f0000001-0000-4000-f000-000000000010',
    'Biyoteknoloji: Genetik Mühendisliği ve Uygulamaları',
    $b$Biyoteknoloji, biyolojik sistemleri ve canlı organizmaları çeşitli ürün ve süreçler geliştirmek amacıyla kullanan multidisipliner bir alandır. Son yıllarda DNA teknolojisindeki hızlı gelişmeler biyoteknolojiyi tıp, tarım, endüstri ve çevre bilimi alanlarında devrimsel bir güce dönüştürmüştür.

Rekombinant DNA teknolojisi, bir organizmadan alınan DNA parçasını başka bir organizmanın genomuna yerleştirmeye olanak tanır. Bu süreç; DNA kesimi (kısıtlama enzimleriyle), birleştirme (DNA ligaz enzimiyle) ve bir vektör aracılığıyla konak hücreye taşıma adımlarından oluşur. Genetiği değiştirilmiş organizmaların (GDO) üretimi bu teknolojiye dayanır.

Tarımsal biyoteknoloji, zararlılara dayanıklı bitkiler, kuraklığa toleranslı çeşitler ve besin değeri artırılmış ürünler geliştirilmesine katkı sağlamıştır. Bt mısır (Bacillus thuringiensis geni taşıyan mısır) ve Altın Pirinç (beta karoten sentezleyen pirinç) bu alandaki önemli başarılardandır.

Tıbbi biyoteknoloji insülin üretimi, gen terapisi ve aşı geliştirme gibi uygulamaları kapsar. Diyabet hastalarının kullandığı insülin artık transgenik bakteri kültürlerinden üretilmekte; böylece büyük miktarlarda saf insülin elde edilebilmektedir. Gen terapisi ise kalıtsal bozuklukları düzeltmek için bozuk genleri işlevsel kopyalarla değiştirmeyi amaçlar.

Polimeraz Zincir Reaksiyonu (PCR), küçük miktardaki DNA'yı milyonlarca kez çoğaltan bir tekniktir. Adli tıp, hastalık teşhisi, arkeoloji ve evrimsel çalışmalarda yaygın biçimde kullanılmaktadır. CRISPR-Cas9 ise son dönemin en dikkat çekici biyoteknolojik aracıdır; gen dizisini hassas bir biçimde kesmek ve değiştirmek için kullanılır.

Biyoteknoloji tartışmalı etik boyutlar da barındırmaktadır. GDO'ların uzun vadeli etkileri, biyoçeşitlilik üzerindeki potansiyel riskleri ve erişim adaleti konusunda toplumsal tartışmalar sürmektedir. Bilimsel gelişmelerin sorumlu ve düzenlenmiş bir çerçevede ilerlemesi bu açıdan büyük önem taşımaktadır.$b$,
    438,
    3,
    'LGS',
    'LGS Fen - Biyoteknoloji',
    ARRAY['fen', 'biyoloji', 'biyoteknoloji', 'genetik', 'LGS'],
    'published'
  );

  -- ─── SORULAR ─────────────────────────────────────────────────────

  -- Metin 1: Madde ve Değişim (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000001',
     'Metne göre aşağıdakilerden hangisi fiziksel değişime örnek gösterilebilir?',
     '["Demirin paslanması","Suyun donması","Kâğıdın yanması","Yiyeceğin sindirilmesi"]',
     1, 'detail', 2,
     'Fiziksel değişimlerde kimyasal yapı değişmez; suyun donması buna örnektir.'),
    ('f0000001-0000-4000-f000-000000000001',
     'Metne göre "ayırt edici özellik" ile ilgili aşağıdaki ifadelerden hangisi doğrudur?',
     '["Madde miktarına bağlıdır","Her zaman değişir","Madde miktarından bağımsızdır","Yalnızca sıvılarda geçerlidir"]',
     2, 'detail', 2,
     'Yoğunluk, erime ve kaynama noktası gibi ayırt edici özellikler madde miktarından bağımsızdır.'),
    ('f0000001-0000-4000-f000-000000000001',
     'Metnin ana fikri aşağıdakilerden hangisidir?',
     '["Karışımlar iki türde incelenir","Maddenin özellikleri ve değişimleri yaşam için önemlidir","Su en saf maddedir","Bileşikler elementlerden daha değerlidir"]',
     1, 'main_idea', 2,
     'Metin, maddenin fiziksel-kimyasal değişimleri ve özelliklerinin önemi üzerine kuruludur.'),
    ('f0000001-0000-4000-f000-000000000001',
     'Aşağıdakilerden hangisi kimyasal değişimin belirtisi değildir?',
     '["Renk değişikliği","Gaz çıkışı","Kütlenin iki katına çıkması","Çökelti oluşumu"]',
     2, 'inference', 2,
     'Kimyasal değişim belirtileri arasında ısı, renk, gaz çıkışı ve çökelti sayılır; kütle değişimi belirtisi değildir.'),
    ('f0000001-0000-4000-f000-000000000001',
     'Metinde "bileşik" kelimesi nasıl tanımlanmıştır?',
     '["Birden fazla maddenin fiziksel karışımı","Tek tür atom içeren madde","Farklı atomların kimyasal birleşimiyle oluşan madde","Yalnızca gazların karışımı"]',
     2, 'vocabulary', 2,
     'Bileşik, farklı atomların belirli oranlarda kimyasal olarak birleşmesiyle oluşur.');

  -- Metin 2: Kuvvet ve Hareket (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000002',
     'Newton''un birinci yasasına göre aşağıdaki ifadelerden hangisi yanlıştır?',
     '["Dışarıdan kuvvet etki etmedikçe duran cisim durur","Hareket eden cisim aynı hızla hareket eder","Her cisim dış kuvvet olmasa da yavaşlar","Yolcuların frende öne yatması bu yasaya örnek gösterilebilir"]',
     2, 'detail', 2,
     'Birinci yasaya göre dış kuvvet etki etmediğinde cisim mevcut durumunu korur; kendiliğinden yavaşlamaz.'),
    ('f0000001-0000-4000-f000-000000000002',
     'F = m × a formülüne göre, kütle sabitken kuvvet iki katına çıkarılırsa ivme nasıl değişir?',
     '["Yarıya iner","Değişmez","İki katına çıkar","Dört katına çıkar"]',
     2, 'inference', 2,
     'F = m × a formülünde m sabitken F iki katına çıkarsa a da iki katına çıkar.'),
    ('f0000001-0000-4000-f000-000000000002',
     'Metne göre ağırlık ve kütle hakkında aşağıdakilerden hangisi doğrudur?',
     '["İkisi de her yerde aynıdır","Kütle yere göre değişir, ağırlık değişmez","Ağırlık madde miktarını ölçer","Kütle her yerde aynı kalırken ağırlık değişebilir"]',
     3, 'detail', 2,
     'Kütle madde miktarıdır ve değişmez; ağırlık yer çekimine bağlı kuvvettir ve farklı konumlarda değişebilir.'),
    ('f0000001-0000-4000-f000-000000000002',
     'Metnin ana fikri aşağıdakilerden hangisidir?',
     '["Newton yasaları günlük yaşamı anlamlandırmada temel bir çerçeve sunar","Kuvvet her zaman harekete neden olur","Sürtünme her zaman zararlıdır","İvme kütleyle doğru orantılıdır"]',
     0, 'main_idea', 2,
     'Metin, Newton yasalarını ve kuvvet-hareket ilişkisini günlük yaşamla ilişkilendirerek açıklamaktadır.'),
    ('f0000001-0000-4000-f000-000000000002',
     'Metinde "sürtünme" kavramı nasıl açıklanmıştır?',
     '["İki yüzey arasında hareket yönünde etki eden kuvvet","Hareketi kolaylaştıran güç","Ağırlıkla özdeş kavram","Yalnızca katılarda gözlemlenen bir olgu"]',
     0, 'vocabulary', 2,
     'Metin sürtünmeyi, iki yüzey arasında hareketin yönüne zıt yönde etki eden kuvvet olarak tanımlar.');

  -- Metin 3: Ses (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000003',
     'Metne göre sesin en yavaş yayıldığı ortam hangisidir?',
     '["Katılar","Sıvılar","Gazlar","Boşluk"]',
     2, 'detail', 2,
     'Ses, katılarda en hızlı, gazlarda en yavaş yayılır.'),
    ('f0000001-0000-4000-f000-000000000003',
     'Frekans artışının tona etkisi nedir?',
     '["Ses pesleşir","Ses tizleşir","Ses yükselir","Ses alçalır"]',
     1, 'detail', 2,
     'Yüksek frekanslı sesler tiz (ince), düşük frekanslı sesler pes (kalın) ses verir.'),
    ('f0000001-0000-4000-f000-000000000003',
     'Metne göre sesin boşlukta yayılamamasının nedeni nedir?',
     '["Frekansı çok yüksektir","Dalga boyu çok kısadır","Ses dalgaları madde gerektirir","Rezonans oluşamaz"]',
     2, 'inference', 2,
     'Ses mekanik dalgadır; yayılabilmek için maddesel ortam gerektirir, boşlukta yayılamaz.'),
    ('f0000001-0000-4000-f000-000000000003',
     'Metnin ana fikri aşağıdakilerden hangisidir?',
     '["Ses yalnızca katılarda yayılır","Sesin üretimi, yayılması ve özellikleri birbirine bağlı bir sistem oluşturur","Rezonans sesin temel özelliğidir","Ultraseson insan kulağı için zararlıdır"]',
     1, 'main_idea', 2,
     'Metin sesin oluşumu, yayılması, hızı ve özellikleri gibi birbiriyle bağlantılı konuları kapsamlı biçimde ele almaktadır.'),
    ('f0000001-0000-4000-f000-000000000003',
     'Metinde "rezonans" nasıl tanımlanmıştır?',
     '["Sesin engele çarpıp geri dönmesi","Cismin doğal frekansında titreşerek güçlenmesi","Sesin boşlukta yayılması","Yüksek frekanslı sesin alçak sese dönüşmesi"]',
     1, 'vocabulary', 2,
     'Metin rezonansı, bir cismin doğal frekansında titreştirilmesiyle sesin giderek güçlenmesi olarak tanımlamaktadır.');

  -- Metin 4: Basit Makineler (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000004',
     'Birinci sınıf kaldıraçta dayanak noktası nerededir?',
     '["Kuvvet ile direnç arasında","Direncin gerisinde","Kuvvetin gerisinde","Dirençle aynı noktada"]',
     0, 'detail', 3,
     'Birinci sınıf kaldıraçta dayanak (fulkrum) kuvvet ile direnç noktalarının arasında yer alır.'),
    ('f0000001-0000-4000-f000-000000000004',
     'Kaldıraç denklemi nasıl ifade edilir?',
     '["Kuvvet + Kuvvet kolu = Direnç + Direnç kolu","Kuvvet × Kuvvet kolu = Direnç × Direnç kolu","Kuvvet / Kuvvet kolu = Direnç / Direnç kolu","Kuvvet - Kuvvet kolu = Direnç - Direnç kolu"]',
     1, 'detail', 3,
     'Kaldıraç dengeleme denklemi: Kuvvet × Kuvvet kolu = Direnç × Direnç kolu.'),
    ('f0000001-0000-4000-f000-000000000004',
     'Metne göre verim neden hiç %100 ulaşamaz?',
     '["Tasarım hatası nedeniyle","Kullanıcı hatası nedeniyle","Sürtünme ve enerji kayıpları nedeniyle","Yer çekimi nedeniyle"]',
     2, 'inference', 3,
     'Gerçek makinelerde sürtünme ve diğer kayıplar nedeniyle toplam girdi işinin bir kısmı kaybedilir, verim %100 olamaz.'),
    ('f0000001-0000-4000-f000-000000000004',
     'Metnin ana fikri nedir?',
     '["Makine iş yapar","Basit makineler kuvveti dönüştürerek çalışmayı kolaylaştırır ancak enerji kazandırmaz","Kaldıraç tek faydalı basit makinedir","Eğik düzlem en verimli makinedir"]',
     1, 'main_idea', 3,
     'Metin basit makinelerin kuvveti dönüştürme prensibini, türlerini ve verim kavramını açıklamaktadır.'),
    ('f0000001-0000-4000-f000-000000000004',
     'Metinde "mekanik avantaj" kavramı nasıl kullanılmıştır?',
     '["Daha çok enerji üretme kapasitesi","Az kuvvetle büyük yük taşımayı sağlayan sistem kazancı","Makinenin verimi","Hareket eden kısımların sayısı"]',
     1, 'vocabulary', 3,
     'Metin mekanik avantajı, özellikle kasnaklar bağlamında, az kuvvetle büyük yük taşımayı mümkün kılan sistem kazancı olarak açıklamaktadır.');

  -- Metin 5: Kimyasal Reaksiyonlar (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000005',
     'Metne göre tepkime hızını artıran faktörler arasında hangisi yoktur?',
     '["Konsantrasyon artışı","Sıcaklık artışı","Yüzey alanı artışı","Ürün miktarının azalması"]',
     3, 'detail', 3,
     'Tepkime hızını artıran faktörler konsantrasyon, sıcaklık, yüzey alanı ve katalizördür; ürün miktarı bu listede yer almaz.'),
    ('f0000001-0000-4000-f000-000000000005',
     'Katalizörün özelliği nedir?',
     '["Tepkime sonunda tükenir","Ürün olarak kalır","Aktivasyon enerjisini artırır","Değişmeden kalarak tepkimeyi hızlandırır"]',
     3, 'detail', 3,
     'Katalizörler tepkime sonunda değişmeden kalır ve aktivasyon enerjisini düşürerek tepkimeyi hızlandırır.'),
    ('f0000001-0000-4000-f000-000000000005',
     'Metne göre nötrleşme tepkimesi ne oluşturur?',
     '["Asit ve baz","Tuz ve su","Sadece su","Gaz ve tuz"]',
     1, 'detail', 2,
     'Asit-baz tepkimesi (nötrleşme) tuz ve su üretir.'),
    ('f0000001-0000-4000-f000-000000000005',
     'Metnin ana fikri nedir?',
     '["Kimyasal reaksiyonlar yeni maddeler oluşturur ve hızlarını etkileyen çeşitli faktörler vardır","Her reaksiyon zararlıdır","Asit-baz tepkimeleri en önemli tepkimelerdir","Redoks yalnızca pillerde görülür"]',
     0, 'main_idea', 3,
     'Metin kimyasal reaksiyonların türlerini, hızlarını etkileyen faktörleri ve pratik uygulamalarını kapsamlı biçimde ele almaktadır.'),
    ('f0000001-0000-4000-f000-000000000005',
     'Metinde "redoks" tepkimesi nasıl tanımlanmıştır?',
     '["Isı açığa çıkaran tepkimeler","Elektron transferini kapsayan oksidasyon-indirgenme tepkimeleri","Asit-bazın birleşimi","Yalnızca metallerin katıldığı tepkimeler"]',
     1, 'vocabulary', 3,
     'Metin redoksu, elektron transferini kapsayan oksidasyon-indirgenme tepkimeleri olarak tanımlamaktadır.');

  -- Metin 6: Hücre Bölünmesi (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000006',
     'Mitoz bölünmenin amacı nedir?',
     '["Gamet üretimi","Genetik çeşitlilik","Büyüme ve onarım","Sadece üreme"]',
     2, 'detail', 3,
     'Mitoz büyüme, yara iyileşmesi ve doku yenilenmesi amacıyla gerçekleşir.'),
    ('f0000001-0000-4000-f000-000000000006',
     'Mayoz bölünme sonucunda kaç hücre oluşur ve bu hücreler nasıldır?',
     '["İki diploit hücre","Dört haploit hücre","İki haploit hücre","Dört diploit hücre"]',
     1, 'detail', 3,
     'Mayoz bölünme sonunda dört haploit hücre (gamet) oluşur.'),
    ('f0000001-0000-4000-f000-000000000006',
     'Krossing-over hangi açıdan önem taşır?',
     '["Hücre bölünmesini hızlandırır","Genetik çeşitliliği artırır","Mitoz ile mayozu birleştirir","Kanser hücrelerini önler"]',
     1, 'inference', 3,
     'Krossing-over gen değişimiyle genetik çeşitliliği artırır ve evrimsel açıdan önem taşır.'),
    ('f0000001-0000-4000-f000-000000000006',
     'Metnin ana fikri nedir?',
     '["Kanserin tek nedeni mitoz hatasıdır","Hücre bölünmesi büyüme, onarım ve üremeyi sağlayan temel bir süreçtir","Kök hücreler tüm hastalıkları iyileştirir","Mayoz mitozdan daha hızlıdır"]',
     1, 'main_idea', 3,
     'Metin mitoz ve mayoz bölünmeyi amacı, evreleri ve önemi bakımından karşılaştırmalı biçimde açıklamaktadır.'),
    ('f0000001-0000-4000-f000-000000000006',
     'Metinde "kök hücre" nasıl tanımlanmıştır?',
     '["Yalnızca kemik iliğinde bulunan hücreler","Kendini yenileme ve farklı hücre tiplerine dönüşebilen özel hücreler","Kanser hücrelerinin öncülü","Yalnızca embriyoda bulunan hücreler"]',
     1, 'vocabulary', 3,
     'Metin kök hücreyi, kendini yenileme ve farklı hücre tiplerine dönüşme kapasitesine sahip özel hücreler olarak tanımlamaktadır.');

  -- Metin 7: Kalıtım (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000007',
     'Mendel''in ayrılma yasasına göre gamet oluşumunda ne gerçekleşir?',
     '["Her gamete iki gen geçer","Her gamete yalnızca bir gen geçer","Genler tamamen çekinik kalır","Baskın genler aktarılmaz"]',
     1, 'detail', 3,
     'Ayrılma yasasına göre gen çifti gamet oluşumunda ayrılır ve her gamete yalnızca bir gen geçer.'),
    ('f0000001-0000-4000-f000-000000000007',
     'Dihibrit çaprazlamada fenotip oranı nedir?',
     '["3:1","1:2:1","9:3:3:1","1:1:1:1"]',
     2, 'detail', 3,
     'Dihibrit çaprazlamada elde edilen fenotip oranı 9:3:3:1 şeklindedir.'),
    ('f0000001-0000-4000-f000-000000000007',
     'X''e bağlı çekinik bir özellik erkeklerde neden daha sık görülür?',
     '["Erkekler daha çok X taşır","Erkekler XY olduğundan tek bozuk X alleli yeterlidir","Erkekler daha çok fiziksel aktivite yapar","Y kromozomu baskın özellik taşır"]',
     1, 'inference', 3,
     'Erkekler (XY) yalnızca bir X kromozomuna sahip olduğundan tek bozuk allelinde özellik ortaya çıkar; kadınlarda (XX) iki bozuk allele ihtiyaç vardır.'),
    ('f0000001-0000-4000-f000-000000000007',
     'Metnin ana fikri nedir?',
     '["Mendel bezelye ile çalışmıştır","Kalıtım yasaları özellik aktarımını belirli kurallara göre açıklar","Fenotip her zaman genotiple örtüşür","Cinse bağlı kalıtım olmaz"]',
     1, 'main_idea', 3,
     'Metin Mendel yasaları başta olmak üzere kalıtımın çeşitli modellerini ve bunların biyolojik önemini açıklamaktadır.'),
    ('f0000001-0000-4000-f000-000000000007',
     'Metinde "heterozigot" nasıl tanımlanmıştır?',
     '["Her iki alleli aynı olan birey","Farklı allel taşıyan birey","Yalnızca baskın gen taşıyan birey","Yalnızca çekinik gen taşıyan birey"]',
     1, 'vocabulary', 3,
     'Heterozigot, bir karakter için farklı allel (Aa) taşıyan bireydir.');

  -- Metin 8: Fotosentez ve Solunum (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000008',
     'Işığa bağımlı reaksiyonlarda hangi ürünler oluşur?',
     '["Glikoz ve CO₂","ATP, NADPH ve O₂","Sadece glikoz","CO₂ ve H₂O"]',
     1, 'detail', 3,
     'Işığa bağımlı reaksiyonlarda su parçalanır; ATP, NADPH ve O₂ oluşur.'),
    ('f0000001-0000-4000-f000-000000000008',
     'Aerobik solunumda bir glikozdan kaç ATP üretilir?',
     '["2","8","36-38","100"]',
     2, 'detail', 3,
     'Aerobik solunumda bir glikoz molekülünden yaklaşık 36-38 ATP üretilir.'),
    ('f0000001-0000-4000-f000-000000000008',
     'Metne göre anaerobik solunumun dezavantajı nedir?',
     '["O₂ tüketmesi","CO₂ salması","Çok daha az enerji üretmesi","Glikoz gerektirmesi"]',
     2, 'inference', 3,
     'Anaerobik solunum, aerobiğe kıyasla çok daha az enerji (ATP) üretir.'),
    ('f0000001-0000-4000-f000-000000000008',
     'Metnin ana fikri nedir?',
     '["Bitkiler oksijen üretir","Fotosentez ve hücresel solunum zıt yönde çalışan tamamlayıcı enerji dönüşüm süreçleridir","Mayalanma zararlıdır","Calvin döngüsü ışığa ihtiyaç duyar"]',
     1, 'main_idea', 3,
     'Metin fotosentez ve hücresel solunumu karşılaştırmalı biçimde ele alarak enerji dönüşüm süreçlerini açıklamaktadır.'),
    ('f0000001-0000-4000-f000-000000000008',
     'Metinde "fermentasyon" kavramı nasıl kullanılmıştır?',
     '["Fotosentezin başka adı","Anaerobik solunumun en tanınan örneği","Aerobik solunumun son adımı","Kloroplastta gerçekleşen süreç"]',
     1, 'vocabulary', 3,
     'Metin fermentasyonu (mayalanma) anaerobik solunumun en tanınan örneği olarak tanımlamaktadır.');

  -- Metin 9: Periyodik Tablo (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000009',
     'Periyodik tabloda aynı gruptaki elementler ne açısından benzerdir?',
     '["Atom ağırlıkları","Kimyasal özellikleri","Fiziksel halleri","Renkleri"]',
     1, 'detail', 2,
     'Aynı gruptaki elementler benzer kimyasal özellikler gösterir.'),
    ('f0000001-0000-4000-f000-000000000009',
     'Metne göre alkali metallerin özelliği nedir?',
     '["Kimyasal açıdan kararlıdırlar","Bileşik oluşturmazlar","Son derece reaktif olup suyla şiddetli tepkime verirler","Ametal özellikleri en belirgin gösterirler"]',
     2, 'detail', 2,
     'Alkali metaller (Grup 1) son derece reaktiftir ve suyla şiddetli tepkime verir.'),
    ('f0000001-0000-4000-f000-000000000009',
     'Periyot boyunca sağa gidildikçe atom yarıçapı nasıl değişir?',
     '["Artar","Değişmez","Azalır","Önce artar sonra azalır"]',
     2, 'inference', 2,
     'Periyot boyunca sağa gidildikçe artan çekirdek yükü elektronları daha güçlü çektiğinden atom yarıçapı azalır.'),
    ('f0000001-0000-4000-f000-000000000009',
     'Metnin ana fikri nedir?',
     '["Periyodik tablo elementlerin düzenli örüntülerini ve özelliklerini sistematik biçimde ortaya koyar","Tüm metaller benzer özelliktedir","Soy gazlar en tehlikeli elementlerdir","Sadece kimyacılar için gereklidir"]',
     0, 'main_idea', 2,
     'Metin periyodik tablonun yapısını, elementlerin sınıflandırılmasını ve periyodik özellik eğilimlerini açıklamaktadır.'),
    ('f0000001-0000-4000-f000-000000000009',
     'Metinde "metaloit" kavramı nasıl tanımlanmıştır?',
     '["Soy gazların diğer adı","Metal ve ametal arasındaki özelliklere sahip yarı metal","Yalnızca katı haldeki elementler","Bileşik oluşturamayan elementler"]',
     1, 'vocabulary', 2,
     'Metaloit (yarı metal), metal ile ametal arasında ara özelliklere sahip elementleri tanımlar.');

  -- Metin 10: Biyoteknoloji (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('f0000001-0000-4000-f000-000000000010',
     'Rekombinant DNA teknolojisinde hangi enzim DNA''yı keser?',
     '["DNA ligaz","Polimeraz","Kısıtlama enzimi","Helikaz"]',
     2, 'detail', 3,
     'Rekombinant DNA teknolojisinde kısıtlama enzimleri DNA''yı belirli noktalardan keser; ligaz ise parçaları birleştirir.'),
    ('f0000001-0000-4000-f000-000000000010',
     'PCR tekniğinin önemi nedir?',
     '["Proteinleri çoğaltır","Küçük miktardaki DNA''yı milyonlarca kez kopyalar","Hücreleri genç tutar","Sadece bitkilerde kullanılır"]',
     1, 'detail', 3,
     'PCR küçük miktardaki DNA örneklerini büyük miktarlarda çoğaltmak için kullanılır.'),
    ('f0000001-0000-4000-f000-000000000010',
     'Bt mısırın ne gibi bir özelliği bulunmaktadır?',
     '["Daha büyük tanelere sahiptir","Bakteri geni taşıyarak zararlılara dayanıklıdır","Daha az su gerektirir","İnsan genomuna sahiptir"]',
     1, 'inference', 3,
     'Bt mısır, Bacillus thuringiensis genini taşıdığından zararlı böceklere doğal direnç kazanmıştır.'),
    ('f0000001-0000-4000-f000-000000000010',
     'Metnin ana fikri nedir?',
     '["GDO zararlıdır","Biyoteknoloji biyolojik sistemleri kullanarak pek çok alanda devrimsel uygulamalar sunar","CRISPR tek faydalı araçtır","Tıbbi biyoteknoloji henüz gelişmemiştir"]',
     1, 'main_idea', 3,
     'Metin biyoteknolojiyi, biyolojik sistemleri çeşitli alanlarda devrimsel amaçlarla kullanan multidisipliner bir alan olarak açıklamaktadır.'),
    ('f0000001-0000-4000-f000-000000000010',
     'Metinde "gen terapisi" nasıl açıklanmıştır?',
     '["Tarım ürünlerini iyileştirme yöntemi","Kalıtsal bozuklukları düzeltmek için bozuk genleri işlevsel kopyalarla değiştirme","DNA''yı çoğaltma tekniği","Farklı türler arasında organ nakli"]',
     1, 'vocabulary', 3,
     'Gen terapisi, bozuk genleri işlevsel kopyalarla değiştirerek kalıtsal bozuklukları düzeltmeyi amaçlar.');

  RAISE NOTICE '047: 10 LGS Fen metni ve 50 soru eklendi.';
END;
$migration$;
