-- ================================================================
-- 037b_fix.sql
-- Başarısız olan LGS UPDATE'leri ve yeni metin INSERT'leri düzelt
-- Dollar-quote ($BODY$) kullanılarak tek tırnak sorunları giderildi
-- ================================================================

-- Hücrenin Yapısı ve Organelleri
UPDATE text_library SET word_count = 450, body = $BODY$Hücre, tüm canlıların yapı ve işlev birimidir. Gözle görülemeyen bu küçük yapılar, yaşamın temel taşlarını oluştururlar. Bilim insanları hücreleri ilk kez mikroskobun icadından sonra keşfetmiş ve zamanla hücre teorisini geliştirmiştir.

Hücreler yapısal olarak iki ana gruba ayrılır: prokaryot ve ökaryot. Prokaryot hücrelerde gerçek bir çekirdek bulunmaz; genetik materyal sitoplazma içinde serbestçe yer alır. Bakteriler ve arkelerin sahip olduğu bu tür hücreler, evrimsel süreçte ilk ortaya çıkan hücre tipidir. Ökaryot hücreler ise belirgin bir çekirdeğe ve çeşitli organellere sahiptir; bitki, mantar, hayvan ve protist hücreleri bu gruba girer.

Hücrenin dışını çevreleyen hücre zarı, seçici geçirgen bir yapıya sahiptir. Bu zar, hücreye hangi maddelerin girip çıkacağını kontrol eder; böylece hücre iç ortamının dengede kalmasını sağlar. Bitki hücrelerinde hücre zarının dışında, selülozdan yapılı sert bir hücre duvarı da bulunur.

Çekirdek, hücrenin yönetim merkezidir. İçinde DNA'dan oluşan kromozomlar barınır; kalıtsal bilginin taşınması ve protein sentezinin yönlendirilmesi bu yapı sayesinde gerçekleşir. Çekirdeği saran çift katlı zar, çekirdekçik adı verilen yoğun bir bölge içerir; burada ribozomlar için gerekli RNA sentezlenir.

Mitokondri, hücrenin enerji santralidir. Hücresel solunum yoluyla besinlerden ATP üretir; bu enerji molekülü tüm hücresel faaliyetlerin yakıtıdır. Mitokondrinin kendine ait DNA'sı ve ribozomları olduğundan, bilim insanları bu organelin evrimsel süreçte bağımsız bir bakteri atadan geldiğini öne sürer. Bu görüşe endosimbiyoz teorisi denir.

Endoplazmik retikulum, hücre içinde bir taşıma ağı oluşturur. Granüllü ER üzerindeki ribozomlarda proteinler sentezlenirken, düz ER lipid sentezi ve toksin detoksifikasyonunda görev alır. Golgi aygıtı ise bu proteinleri alır, paketler ve hücrenin ihtiyaç duyduğu bölgelere gönderir; bu yüzden Golgi'ye hücrenin posta servisi de denir.

Kloroplastlar yalnızca bitki ve alg hücrelerinde bulunur. Fotosentez için gerekli klorofil pigmentini içerirler; güneş enerjisini kimyasal enerjiye dönüştürerek şeker üretirler. Tıpkı mitokondri gibi kloroplastların da kendine ait DNA'sı vardır.

Lizozomlar, hücrenin sindirim organelleridir. Kullanılmış organelleri ve zararlı maddeleri yıkarak hücreyi temiz tutar. Ribozomlar ise hem sitoplazmada serbest hem de ER yüzeyinde bağlı olarak bulunur; protein sentezinin gerçekleştiği temel yapılardır.

Bitki hücrelerinde büyük bir merkezi koful bulunur; bu yapı hücreyi şişirerek turgor basıncı oluşturur ve besin ile atık maddeleri depolar. Hayvan hücrelerinde ise daha küçük kovalar yer alır.

Hücre bölünmesi iki şekilde gerçekleşir: mitoz ve mayoz. Mitozda eşit genetik içerikli iki yavru hücre oluşur; büyüme ve onarım için kullanılır. Mayozda ise genetik çeşitliliği artıran dört haploid hücre meydana gelir; bu bölünme yalnızca üreme hücrelerinin oluşumunda görülür.$BODY$ WHERE id = '2c84c8d1-8143-44f4-812f-3c059ea98869';

-- Işığın Kırılması ve Optik Olaylar
UPDATE text_library SET word_count = 445, body = $BODY$Işık, bir ortamdan diğerine geçerken yön değiştirirse buna kırılma denir. Havadan suya geçen bir ışık demeti, iki ortam arasındaki sınırda bükülür; bu olayın arkasında ışığın farklı ortamlardaki hız farkı yatar. Işık boşlukta saniyede yaklaşık 300.000 kilometre hızla ilerlerken su içinde bu hız yaklaşık 225.000 kilometreye düşer.

Kırılma kanunu (Snell Kanunu), ışığın iki ortam arasında nasıl kırıldığını matematiksel olarak tanımlar. Buna göre gelen ışın, kırılan ışın ve iki ortamı ayıran yüzeye çizilen dik, hepsi aynı düzlemdedir. Işık daha az yoğun bir ortamdan daha yoğun bir ortama geçerken normale yaklaşır; tam tersi durumda ise normalden uzaklaşır.

Prizmalar ışığı bileşenlerine ayırır. Beyaz ışık bir prizmadan geçirildiğinde kırmızı, turuncu, sarı, yeşil, mavi, lacivert ve mor renkten oluşan spektrum elde edilir. Bu olaya dispersiyon denir. Gökkuşağı, yağmur damlalarının prizma görevi görmesiyle oluşan doğal bir dispersiyon örneğidir.

Tam iç yansıma, ışığın yoğun ortamdan seyrek ortama belirli bir açıdan geçmeye çalışırken tamamen geri yansıması olayıdır. Kritik açı adı verilen bu sınır değer aşıldığında ışık kırılmaz, sınır yüzeyden geri döner. Fiber optik kablolar, tam iç yansıma ilkesinden yararlanarak ışık sinyallerini uzun mesafelere iletir; internet altyapısının büyük bölümü bu teknolojiye dayanır.

Mercekler, ışığı kırma özelliklerine göre iki ana gruba ayrılır. Toplayıcı (konveks) mercekler kenarlardan incelerek ortada kalınlaşır; paralel gelen ışınları odak noktasında toplar. Dağıtıcı (konkav) mercekler ise ortadan incelir, kenarlardan kalınlaşır ve ışınları yayar. Gözlük camları, teleskoplar ve mikroskoplar bu iki mercek türünün farklı kombinasyonlarından oluşur.

İnsan gözü de bir optik sistem olarak çalışır. Kornea ve göz merceği, görüntüyü retina üzerine düşürür. Yakını net göremeyen miyopluk durumunda görüntü retinanın önünde oluşur; dağıtıcı mercek kullanılarak düzeltilir. Uzağı net göremeyen hipermetropide görüntü retinanın arkasında oluşur; toplayıcı mercek tedaviyi sağlar.

Aynalar da optik araçlardır. Düz aynalar cismin aynı büyüklükte simetrik görüntüsünü verir. Çukur (içbükey) aynalar ışınları odaklar; diş hekimlerinin ve otomobil farlarının bu tür aynalardan yararlanması bundandır. Tümsek (dışbükey) aynalar ise geniş bir görüş alanı sağlar; mağazalardaki güvenlik aynalar ve araç dikiz aynalar bu kategoriye girer.

Optik olaylar günlük hayatımızın her köşesinde karşımıza çıkar. Yüzme havuzundaki çubukların kırık görünmesi, serabın çöllerde oluşması, gökyüzünün mavi rengi ve batarken kırmızılaşan Güneş, hepsinin açıklaması kırılma ve saçılma ilkelerine dayanır. Fiziği anlamak, çevremizi daha bilinçli gözlemlememizi sağlar.$BODY$ WHERE id = 'ab47b8b5-8f9d-4493-8c35-60e0ecb0d8c7';

-- Besinlerin Sindirimi ve Emilimi
UPDATE text_library SET word_count = 448, body = $BODY$Sindirim sistemi, vücuda alınan besinleri parçalayarak hücrelerin kullanabileceği küçük moleküllere dönüştüren karmaşık bir organlar bütünüdür. Bu süreç, hem mekanik hem de kimyasal aşamalardan oluşur ve ağızdan başlayarak anüste sona erer.

Sindirim ağızda başlar. Dişler, besinleri parçalayarak yüzey alanını artırır; bu mekanik sindirimin ilk adımıdır. Tükürük bezleri, amilaz enzimi içeren tükürüğü salgılar; amilaz nişastayı maltoza parçalamaya başlar. Besin bolus adı verilen yumru haline geldikten sonra yutulur ve yemek borusu boyunca peristaltik hareketlerle mideye taşınır.

Mide, güçlü bir kas organıdır. İçindeki hidroklorik asit ortamı, hem besinleri yumuşatır hem de zararlı mikroorganizmaları öldürür. Mide duvarlarından salgılanan pepsin enzimi proteinleri parçalamaya başlar. Mide, besinleri kimus adı verilen sıvı karışıma dönüştürerek ince bağırsağa gönderir.

İnce bağırsak, sindirim ve emilimin en yoğun yaşandığı bölgedir. Yaklaşık 6-7 metre uzunluğundaki bu organ üç bölümden oluşur: onikiparmak bağırsağı, jejunum ve ileum. Onikiparmak bağırsağına pankreastan sindirim enzimleri (lipaz, tripsin, amilaz) ve safra kesesi kanalından safra salgılanır. Safra yağları küçük damlacıklara bölerek emülsifiye eder; böylece lipaz enziminin etkisi artar.

İnce bağırsak iç yüzeyi, emilim alanını artırmak için özel bir yapıya sahiptir. Parmak şeklindeki uzantılar olan villüsler ve bunların üzerindeki mikrovillüsler toplam emilim yüzeyini büyük ölçüde genişletir. Bu yapılar sayesinde sindirilmiş besin molekülleri — amino asitler, basit şekerler, yağ asitleri — kana ve lenf sistemine geçer.

Kalın bağırsak, sindirilemeyen atıkları işler. Su ve minerallerin büyük bölümü burada geri emilir. Bağırsak florası olarak bilinen milyarlarca bakteri, bazı vitaminleri (K ve B12 gibi) sentezler ve atığın fermantasyonuna yardımcı olur. Kalan atıklar rektumda birikir ve anüs yoluyla dışarı atılır.

Pankreas, hem sindirim hem de endokrin işlevlere sahip çift işlevli bir bezdir. Sindirim enzimleri salgılamasının yanı sıra kan şekerini düzenleyen insülin ve glukagon hormonlarını da üretir. Karaciğer ise safra üretimi dışında besin maddelerini depolar, toksinleri zararsız hale getirir ve kan şekeri dengesini yönetir.

Yediğimiz besinlerin ne kadar sürede sindirildiği besin türüne göre değişir. Karbonhidratlar en hızlı (1-2 saat), proteinler orta sürede (3-4 saat), yağlar ise en yavaş (4-5 saat) sindirilir. Düzenli beslenme, yeterli su tüketimi ve probiyotik açısından zengin besinler sindirim sisteminin sağlıklı çalışmasına katkı sağlar.$BODY$ WHERE id = '02439f00-9323-4e02-bd86-1ad0404b6120';

-- Elektrik ve Manyetizma
UPDATE text_library SET word_count = 447, body = $BODY$Elektrik, yüklü parçacıkların hareketiyle ortaya çıkan bir enerji biçimidir. Atomun çekirdeği etrafında dolaşan elektronlar negatif yüklüdür; bu elektronların bir iletken üzerinden düzenli akması elektrik akımı oluşturur. Modern uygarlığın temelinde yatan bu enerji kaynağını anlamak, 8. sınıf fen bilimlerinin en kritik konularından biridir.

Elektrik yükü iki türlüdür: pozitif ve negatif. Aynı cins yükler birbirini iterken, zıt cins yükler birbirini çeker. Yük birimi Coulomb (C)'dur. Protonlar pozitif, elektronlar negatif yük taşır; nötr atomlarda bu yükler birbirini dengeler.

Elektrik akımı, birim zamanda bir kesit yüzeyden geçen yük miktarıdır; birimi Amper (A)'dir. Akımın oluşabilmesi için kapalı bir devre ve bir potansiyel fark (gerilim) gerekir. Gerilim, birimi Volt (V) olan büyüklük, iki nokta arasındaki enerji farkını ifade eder. Pil ve jeneratörler bu potansiyel farkı sağlar.

Ohm Kanunu, elektrik devrelerinin anlaşılmasında temel bir araçtır. Akım, gerilimin dirence bölünmesiyle bulunur; bu formül I = V/R şeklinde yazılır. Direncin birimi Ohm'dur. Bir iletkenin direnci uzunluğuyla doğru, kesit alanıyla ters orantılıdır; aynı zamanda iletkeni oluşturan maddeye ve sıcaklığa da bağlıdır.

Devre elemanları seri ya da paralel bağlanabilir. Seri bağlı devrede akım her elemandan aynı şiddetle geçer, gerilimler ise bölüşülür. Paralel bağlı devrede gerilim tüm elemanlarda eşittir, akım ise dallara bölüşülür. Ev elektrik tesisatları genellikle paralel bağlıdır; bu sayede bir cihaz arızalandığında diğerleri etkilenmez.

Manyetizma, hareketli yüklü parçacıklarla yakından ilişkilidir. Mıknatısların ve Dünya'nın çevresinde manyetik alan oluşur; bu alan manyetik kuvvet çizgileriyle görselleştirilir. Pusula iğnesi, Dünya'nın manyetik kuzey kutbuna doğru yönelir; navigasyon tarihinde bu özellik paha biçilmez bir rol oynamıştır.

Elektromanyetizma, elektrik ve manyetizmanın birbirinden ayrılamaz iki yüzünü tanımlar. Bir iletkenden akım geçtiğinde etrafında manyetik alan oluşur; bu prensip elektrik motorlarının temelini atar. Tersine, bir manyetik alanda hareket eden iletken de akım üretir; bu ise jeneratörlerin çalışma prensibidir.

Transformatörler, elektrik gerilimini yükseltip alçaltmak için kullanılır. Güç santrallerinde üretilen yüksek gerilimli elektrik, iletim sırasındaki kayıpları azaltmak için daha da yükseltilir; evlere ulaşmadan önce ise kullanım için 220 Volt'a düşürülür.

Günümüzde elektrik; aydınlatmadan haberleşmeye, ulaşımdan sağlığa kadar her alanda hayatı kolaylaştırmaktadır. Yenilenebilir enerji kaynakları kullanılarak daha temiz elektrik üretme çalışmaları hız kazanmakta; bu alan gelecekte de önemini koruyacaktır.$BODY$ WHERE id = '9874bac9-aca9-4efc-910b-5da233ee8df8';

-- Ekosistem ve Biyoçeşitlilik
UPDATE text_library SET word_count = 443, body = $BODY$Ekosistem, bir bölgede yaşayan tüm canlı organizmaların birbirleriyle ve cansız çevreleriyle oluşturdukları karmaşık sistemi tanımlar. Ormanlar, mercan resifleri, çöller ve sulak alanlar birer ekosistem örneğidir. Her ekosistem kendi içinde bir denge barındırır; bu denge bozulduğunda zincirleme sonuçlar ortaya çıkar.

Ekosistemde enerji akışı besin zincirleriyle gerçekleşir. Üretici organizmalardaki güneş enerjisi, tüketiciler aracılığıyla aktarılır. Otçullar birincil tüketici, onları yiyen etçiller ikincil tüketici olarak adlandırılır. Ayrıştırıcılar (mantar ve bakteriler) ölü organik maddeleri parçalayarak besin maddelerini toprağa geri kazandırır.

Biyoçeşitlilik, bir ekosistemde yaşayan tür sayısını ifade eder. Yüksek biyoçeşitlilik, ekosistemin dış baskılara karşı daha dayanıklı olmasını sağlar; tek bir hastalık ya da iklim değişikliği tüm sistemi çökertmez. Amazonlar, Hindistan yarımadası ve Güneydoğu Asya, dünya üzerindeki en biyoçeşitli bölgeler arasındadır.

Biyotik ve abiyotik faktörler birlikte ekosistemi oluşturur. Biyotik faktörler; bitkiler, hayvanlar, mantarlar ve mikroorganizmalardır. Abiyotik faktörler ise sıcaklık, ışık, su, toprak ve mineral maddeler gibi cansız çevre koşullarıdır. Bu iki grup sürekli etkileşim halindedir; toprak yapısı bitki çeşitliliğini doğrudan belirler.

Popülasyon, aynı türden bireylerin belirli bir alanda bir arada bulunmasıdır. Popülasyon büyüklüğünü av-avcı ilişkisi, besin kaynakları ve hastalık gibi etkenler düzenler. Lotka-Volterra denklemleri, bir predatör ile av popülasyonu arasındaki salınımlı dengeyi matematiksel olarak açıklar.

İklim değişikliği, ekosistemler üzerinde ciddi baskı oluşturmaktadır. Yükselen sıcaklıklar, mercan ağartması, kutup ekosistemlerinin erimesi ve deniz seviyesinin yükselmesi biyoçeşitlilik kaybını hızlandırmaktadır. Bilim insanlarının tahminlerine göre mevcut nesil tükenme hızı, doğal arka plan oranının yüzlerce katına ulaşmış durumdadır.

Türkiye, iklim ve coğrafya çeşitliliği nedeniyle küresel biyoçeşitlilik sıcak noktalarından biri sayılır. Ülkemizde 9.000'den fazla bitki türü bulunmaktadır; bunların önemli bir bölümü endemiktir, yani yalnızca Türkiye'de yetişir. Toroslar ve Karadeniz dağları bu endemik türlerin önemli yaşam alanlarıdır.

Ekosistem hizmetleri denilen kavram, insanlığın doğadan elde ettiği yararları kapsar: temiz su, temiz hava, tozlaşma, iklim düzenlemesi ve gıda üretimi bunların başında gelir. Bu hizmetlerin ekonomik değerinin küresel GSYİH'nin kat kat üzerinde olduğu tahmin edilmektedir. Dolayısıyla biyoçeşitliliği korumak, hem ekolojik hem de ekonomik açıdan vazgeçilmez bir yükümlülüktür.$BODY$ WHERE id = '7a0f841d-fb03-4d58-9ad3-b754d0a898ee';

-- Türkiye'nin Coğrafi Bölgeleri
UPDATE text_library SET word_count = 452, body = $BODY$Türkiye, 7 coğrafi bölgeye ayrılmaktadır: Karadeniz, Marmara, Ege, Akdeniz, İç Anadolu, Doğu Anadolu ve Güneydoğu Anadolu. Bu bölgeler iklim, bitki örtüsü, nüfus yoğunluğu ve ekonomik faaliyetler bakımından birbirinden belirgin biçimde ayrılır.

Karadeniz Bölgesi, dağların denize paralel uzanması nedeniyle bol yağış alır. Yıl boyunca nemli ve ılıman iklim egemendir. Bölge, Türkiye'nin fındık üretiminin neredeyse tamamını karşılar; çay ve mısır da önemli ürünler arasındadır. Ormanlar bölgenin büyük bölümünü kaplar.

Marmara Bölgesi, Türkiye'nin en kalabalık ve sanayisi en gelişmiş bölgesidir. İstanbul, Bursa ve Kocaeli bu bölgedeki önemli sanayi merkezleridir. Marmara Denizi, Karadeniz ile Ege'yi İstanbul ve Çanakkale boğazları aracılığıyla birbirine bağlar. Bölgede tarım da önemli bir yer tutar; zeytin, üzüm ve buğday başlıca tarım ürünleridir.

Ege Bölgesi, kıyıdan iç kesimlere uzanan vadilerin oluşturduğu girintili çıkıntılı kıyı şeridiyle tanınır. Akdeniz iklimiyle birlikte zeytin, incir, üzüm ve tütün yetiştirilir. İzmir, bölgenin ve Türkiye'nin en önemli liman kentlerinden biridir. Turizm, bölge ekonomisinde belirleyici bir pay taşır.

Akdeniz Bölgesi, uzun ve sıcak yazlarıyla seracılık ve narenciye üretiminin merkezi konumundadır. Antalya, küresel çapta önemli bir turizm destinasyonudur; yıllık 15 milyondan fazla turist ağırlar. Bölge aynı zamanda Türkiye'nin önemli pamuk ve susam üretim alanıdır.

İç Anadolu Bölgesi, geniş platolar ve step iklimi ile öne çıkar. Türkiye'nin tahıl ambarı olarak da anılan bu bölgede buğday ve arpa yaygın olarak yetiştirilir. Ankara, Türkiye'nin başkenti olarak siyasi ve idari açıdan kritik öneme sahiptir. Tuz Gölü, dünyanın en büyük tuz göllerinden biridir.

Doğu Anadolu Bölgesi, Türkiye'nin en yüksek ve en soğuk bölgesidir. Ağrı Dağı (5.137 m) Türkiye'nin en yüksek noktasıdır. Van Gölü, Türkiye'nin en büyük gölüdür; sodalı suyu yüzünden çok az canlı türüne ev sahipliği yapar. Hayvancılık bölge ekonomisinin belkemiğini oluşturur.

Güneydoğu Anadolu Bölgesi, Arap yarımadasına yakınlığı nedeniyle kara iklimine sahiptir. Yazları çok sıcak ve kurak geçer. Fırat ve Dicle nehirleri bu bölgeden geçer; GAP (Güneydoğu Anadolu Projesi) bu nehirlerin sularından yararlanmak amacıyla hayata geçirilmiştir. Sulama olanakları genişledikçe pamuk, mısır ve fıstık üretimi artmıştır.

Türkiye'nin coğrafi çeşitliliği ekonomik ve kültürel zenginliğin kaynağıdır. LGS coğrafya sorularında bölgelerin ekonomik özellikleri, iklim tipleri ve nüfus dağılımı sıklıkla sorulmaktadır; bu nedenle her bölgenin ayırt edici özelliklerini iyi bilmek büyük avantaj sağlar.$BODY$ WHERE id = '11ed226a-51f9-4898-9b1c-d12c9a811a8c';

-- ─── LGS YENİ METİNLER ────────────────────────────────────────

-- LGS Matematik 1
INSERT INTO text_library (title, body, exam_type, category, difficulty, word_count, status, estimated_read_time)
VALUES (
  'Denklemler ve Eşitsizlikler',
  $BODY$Matematik, soyut düşünmenin en güçlü araçlarından biridir. Denklemler ve eşitsizlikler, bu soyutlamanın gerçek hayatla buluştuğu kritik noktayı oluşturur. Bir denklem, iki ifadenin eşit olduğunu gösteren matematiksel bir cümledir; eşitsizlik ise bir ifadenin diğerinden büyük ya da küçük olduğunu ifade eder.

Birinci dereceden bir bilinmeyenli denklemler en temel denklem türüdür. 2x + 5 = 11 gibi bir denklemi çözmek, her iki taraftan aynı işlemi yaparak bilinmeyeni yalnız bırakmayı gerektirir. Bu örnekte her iki taraftan 5 çıkardığımızda 2x = 6 elde ederiz; her iki tarafı 2'ye böldüğümüzde x = 3 sonucuna ulaşırız.

Denklem kurma, gerçek hayat problemlerini çözmenin temelidir. "Yaşları toplamı 40 olan iki kardeşten biri diğerinden 6 yaş büyükse büyük kardeş kaç yaşındadır?" gibi bir soruda bilinmeyeni x ile göstererek x artı (x artı 6) = 40 denklemi kurulur; çözümde x = 17, yani küçük kardeşin yaşı bulunur.

Birinci dereceden eşitsizlikler de benzer yöntemlerle çözülür. Ancak her iki tarafı negatif bir sayıyla çarpma ya da bölme durumunda eşitsizlik işareti tersine döner. Örneğin -2x > 6 eşitsizliğinde her iki tarafı -2'ye böldüğümüzde x < -3 elde edilir; işaretin değişmesini unutmamak kritik bir noktadır.

İki bilinmeyenli denklem sistemleri ise iki koşulu aynı anda sağlayan değerleri bulmak için kullanılır. Yerine koyma yöntemi ve eşitleme yöntemi bu sistemleri çözmenin başlıca yollarıdır. Grafik yöntemiyle iki doğrunun kesişim noktası da çözüm olarak okunabilir.

Eşitsizliklerin sayı doğrusu üzerinde gösterimi, sınav sorularında sıkça karşılaşılan bir beceridir. Açık aralık durumunda boş daire, kapalı aralık durumunda dolu daire kullanılır. x > 3 ifadesi, 3'ün dahil olmadığı sağ yönde sonsuza uzanan bir aralığı temsil eder.

Mutlak değer, bir sayının sıfırdan uzaklığını ifade eder; her zaman pozitif ya da sıfır olur. Mutlak değer eşitsizliklerini çözerken iç ve dış aralıkları ayrı ayrı incelemek gerekir.

İkinci dereceden denklemler, LGS'nin son yıllarında sıklıkla görülür. Çarpanlara ayırma ve tam kare tamamlama temel çözüm yöntemleridir. Diskriminantın sıfırdan büyük, sıfıra eşit ya da küçük olması kök sayısını belirler.

Matematiksel düşünce, yalnızca sınav sorusu çözmek için değil; mantıklı karar verme ve problem çözme becerisi geliştirmek için de hayat boyu kullanılır. Bu nedenle denklem ve eşitsizlik konularını sağlam kavramak, akademik başarının vazgeçilmez bir parçasıdır.$BODY$,
  'LGS', 'Matematik', 2, 455, 'published', 4
);

-- LGS Matematik 2
INSERT INTO text_library (title, body, exam_type, category, difficulty, word_count, status, estimated_read_time)
VALUES (
  'Olasılık ve İstatistik',
  $BODY$Olasılık ve istatistik, gerçek hayatta belirsizliklerle başa çıkmanın matematiksel yoludur. Hava durumu tahmininden sağlık araştırmalarına, spor analizinden seçim anketlerine kadar her alanda bu konuların izlerine rastlamak mümkündür.

Olasılık, bir olayın gerçekleşme şansını 0 ile 1 arasında bir sayıyla ifade eder. 0 olasılığı imkânsız bir olayı, 1 olasılığı ise kesin bir olayı gösterir. Standart bir zarı attığımızda çift sayı gelme olasılığı 3/6 yani 1/2'dir; uygun sonuç sayısı 3 (2, 4, 6), toplam eşit olası sonuç sayısı ise 6'dır.

Örneklem uzayı, bir deneyin olası tüm sonuçlarının kümesidir. Bir madeni para iki kez atıldığında örneklem uzayı dört elemanlıdır: her iki atışta yazı veya tura kombinasyonları. Olay ise örneklem uzayının bir alt kümesidir; "en az bir yazı gelme" olayının olasılığı dörtte üçtür.

Bileşik olayların olasılığını hesaplamak için toplama ve çarpma kuralları kullanılır. Birbirini dışlayan olaylar için olasılıklar toplanır. Bağımsız olaylar için ise ayrı ayrı hesaplanan olasılıklar çarpılır; iki bağımsız zarın her ikisinin de 6 gelmesi olasılığı otuz altıda birdir.

İstatistik, verilerden anlam çıkarmayı sağlar. Verileri özetleyen merkezi eğilim ölçüleri üç tanedir: ortalama (tüm değerlerin toplamının eleman sayısına bölümü), medyan (sıralı verideki orta değer) ve mod (en sık tekrar eden değer). Bunlara ek olarak yaygınlık ölçüleri arasında ranj (en büyük ile en küçük değer farkı) sayılabilir.

Grafikler, istatistiksel verileri görselleştirmenin en etkili yoludur. Çubuk grafikler kategorik verileri, sütun grafikler karşılaştırmaları, daire grafikler oranları, çizgi grafikler ise zaman içindeki değişimi en iyi aktarır. LGS'de grafik okuma ve yorum soruları sıkça çıkmaktadır; verileri doğru yorumlayabilmek büyük bir avantajdır.

Frekans tabloları ve veri düzenleme, istatistik sorularının temelini oluşturur. Birikimli frekans, her değere kadar olan toplam frekansı gösterir. Bir sınıftaki öğrencilerin not dağılımı, frekans tablosunda düzenlendiğinde sınıfın genel performansı hakkında hızla yorum yapmak mümkün olur.

Günümüzde büyük veri ve yapay zeka uygulamalarının temelini istatistiksel yöntemler oluşturur. Bu nedenle olasılık ve istatistik konularını kavramsal düzeyde anlamak, yalnızca sınav başarısı için değil; dijital çağda eleştirel düşünme becerisi kazanmak açısından da büyük önem taşımaktadır.$BODY$,
  'LGS', 'Matematik', 3, 450, 'published', 4
);

-- LGS İngilizce
INSERT INTO text_library (title, body, exam_type, category, difficulty, word_count, status, estimated_read_time)
VALUES (
  'Technology in Our Daily Lives',
  $BODY$Technology has become an inseparable part of our lives. From the moment we wake up to the moment we go to sleep, we interact with dozens of devices and digital systems. Understanding how technology shapes our world is an important part of modern education.

Smartphones are perhaps the most visible example of how technology has transformed daily communication. A device that fits in the palm of your hand can connect you instantly to anyone in the world, give you access to the sum of human knowledge, and help you navigate unfamiliar streets. Just twenty years ago, this would have seemed like science fiction.

Social media platforms have changed the way people share information and form communities. Millions of users post updates, photos, and videos every minute, creating a constant stream of content. While these platforms help people stay connected across distances, researchers have also pointed out potential negative effects on mental health, particularly for young people who spend many hours scrolling through their feeds.

Artificial intelligence, commonly known as AI, is one of the fastest-growing areas of technology. AI systems can now recognize faces, translate languages, compose music, and even diagnose diseases with remarkable accuracy. In education, AI tools are beginning to personalize learning experiences, adapting lessons to each student's pace and style.

However, technology also brings challenges. Cybersecurity threats, misinformation, and digital addiction are serious issues that modern societies must address. Learning to use technology critically and responsibly is just as important as knowing how to use it effectively.

Renewable energy technologies offer hope for addressing climate change. Solar panels and wind turbines are becoming cheaper and more efficient every year. Electric vehicles, once considered expensive luxuries, are now being produced at prices that more families can afford.

In healthcare, technology is saving lives in remarkable ways. Robotic surgery allows doctors to perform delicate operations with greater precision. Telemedicine lets patients consult doctors from their homes, which is especially valuable in rural areas with limited access to hospitals.

Transportation technology continues to evolve rapidly. High-speed trains connect cities in hours instead of days. Self-driving vehicles, currently being tested in many countries, could reduce traffic accidents caused by human error.

For LGS students, developing strong English reading skills is essential, as much of the world's scientific and technological knowledge is first published in English. Reading about technology not only builds vocabulary but also helps you stay informed about the world you will inherit.$BODY$,
  'LGS', 'İngilizce', 2, 448, 'published', 4
);
