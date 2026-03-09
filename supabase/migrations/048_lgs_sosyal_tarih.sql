-- =====================================================
-- 048_lgs_sosyal_tarih.sql
-- LGS Sosyal Bilgiler + İnkılap Tarihi + Vatandaşlık
-- 12 metin × 5 soru = 60 soru
-- =====================================================

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM public.text_library WHERE category LIKE 'LGS Sosyal%' OR category LIKE 'LGS İnkılap%' OR category LIKE 'LGS Vatandaşlık%') > 0 THEN
    RAISE NOTICE '048: LGS Sosyal/İnkılap/Vatandaşlık içerikleri zaten mevcut, atlanıyor.';
    RETURN;
  END IF;

  -- ─── METİNLER ────────────────────────────────────────────────────

  -- 1. Mondros Ateşkesi ve İşgaller
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000001',
    'Mondros Ateşkesi ve Anadolu''nun İşgali',
    $b$Birinci Dünya Savaşı'nın sona ermesiyle birlikte Osmanlı Devleti, 30 Ekim 1918 tarihinde İtilaf Devletleri ile Mondros Mütarekesi'ni imzaladı. Bu ateşkes belgesi Osmanlı tarihinin en ağır teslim koşullarından birini ortaya koydu. Boğazlar İtilaf devletlerine açıldı; Osmanlı ordusu terhis edildi ve stratejik noktalar işgal edilebilir hale getirildi.

Mondros'un ardından İtilaf kuvvetleri İstanbul'u fiilen işgal altına aldı. İngiliz, Fransız, İtalyan ve Yunan kuvvetleri Anadolu'nun farklı bölgelerini kontrol altına almaya başladı. Özellikle 15 Mayıs 1919'da Yunan kuvvetlerinin İzmir'e çıkması Anadolu'da derin bir öfke ve direniş duygusunu ateşledi.

Bu işgallere tepki olarak tüm yurt genelinde mitingler düzenlendi. Ege, Karadeniz ve Doğu Anadolu'da milis kuvvetleri oluşturulmaya başlandı. İşgalleri protesto eden mitingler arasında en dikkat çekeni İstanbul'daki Sultanahmet Mitingi oldu. Halkın bu örgütlü direnişi millî mücadelenin tohumlarını filizlendirdi.

Mustafa Kemal Paşa, 19 Mayıs 1919'da Samsun'a çıkarak Anadolu'daki direniş hareketinin koordinasyonunu üstlendi. Kısa süre içinde Havza ve Amasya'da toplantılar düzenledi; yayımladığı Amasya Genelgesi ile "vatanın bütünlüğünün tehlikede olduğunu ve bu tehlikeye karşı milletin kendi geleceğini belirlemesi gerektiğini" ilan etti.

Erzurum ve Sivas kongreleri ise direniş hareketine örgütsel bir çerçeve kazandırdı. Sivas Kongresi'nde bölgesel cemiyetler birleştirilerek Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti kuruldu. Böylece dağınık bir direniş, merkezi bir milli hareket biçimine dönüştü. Bu süreç, kurtuluş savaşının ilk resmi örgütsel adımı olarak tarihe geçti.$b$,
    428,
    2,
    'LGS',
    'LGS İnkılap - Millî Mücadele',
    ARRAY['inkılap', 'Mondros', 'işgal', 'Mustafa Kemal', 'LGS'],
    'published'
  );

  -- 2. Misak-ı Millî ve TBMM
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000002',
    'Misak-ı Millî ve TBMM''nin Kuruluşu',
    $b$Son Osmanlı Mebusan Meclisi, Ocak 1920'de İstanbul'da toplandı ve tarihi bir karar alarak Misak-ı Millî'yi kabul etti. Bu belge, Türk milletinin asgarî ulusal sınırlarını ve bağımsızlık taleplerini dünyaya ilan eden bir bildirge niteliği taşır. Misak-ı Millî, Mondros Mütarekesi'nin imzalandığı tarihte Türklerin çoğunlukta olduğu toprakların bölünmez bir bütün oluşturduğunu vurgulamaktaydı.

İtilaf devletleri bu kararlı tutuma tepki olarak Mart 1920'de İstanbul'u resmen işgal etti ve bazı Osmanlı milletvekilleri tutuklandı. Bu gelişme üzerine Mustafa Kemal, Ankara'da yeni bir meclisin kurulması için harekete geçti. 23 Nisan 1920'de Türkiye Büyük Millet Meclisi açıldı; bu tarih, sonraki yıllarda Ulusal Egemenlik ve Çocuk Bayramı olarak kutlanmaya başlandı.

TBMM hem yasama hem de yürütme yetkilerini bünyesinde toplayan olağanüstü bir yapıya sahipti. İcra Vekilleri Heyeti (Bakanlar Kurulu) doğrudan meclis tarafından seçilmekte ve meclise karşı sorumlu tutulmaktaydı. Meclis, Müdafaa-i Hukuk Cemiyetleri'nin düzenlediği seçimler aracılığıyla Anadolu'nun dört bir yanından gelen temsilcilerden oluşuyordu.

TBMM kısa sürede hem askerî hem de diplomatik alanlarda önemli adımlar attı. Doğuda Ermenistan, güneyde Fransız kuvvetleriyle anlaşmalar yapıldı; böylece Batı cephesine odaklanmak için gerekli ortam sağlandı. Aynı dönemde İstanbul hükümeti ile TBMM arasındaki gerilim giderek derinleşti.

TBMM'nin kuruluşu, Osmanlı hanedanlığına dayanan imparatorluk anlayışından halk iradesine dayanan millî egemenlik anlayışına geçişin somut bir ifadesiydi. Millî egemenlik ilkesi, Türk demokrasisinin ve modern devlet anlayışının temel dayanaklarından biri olarak bugün de geçerliliğini korumaktadır.$b$,
    432,
    2,
    'LGS',
    'LGS İnkılap - Millî Mücadele',
    ARRAY['inkılap', 'Misak-ı Millî', 'TBMM', 'egemenlik', 'LGS'],
    'published'
  );

  -- 3. Sakarya Savaşı ve Büyük Taarruz
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000003',
    'Sakarya Meydan Muharebesi ve Büyük Taarruz',
    $b$Yunan ordusu, Haziran 1921'de Eskişehir ve Kütahya'yı ele geçirerek Ankara'ya doğru ilerledi. TBMM bu kritik gelişme karşısında Mustafa Kemal'i Başkomutanlık yetkisiyle donatarak tüm ordunun idaresini ona devretti. Tekalif-i Milliye Emirleri çerçevesinde halktan cepheye yönelik büyük çaplı bir destek seferberliği başlatıldı.

23 Ağustos – 13 Eylül 1921 tarihleri arasında yaşanan Sakarya Meydan Muharebesi, Türk Kurtuluş Savaşı'nın en uzun soluklu muharebesini oluşturur. Türk kuvvetleri, Sakarya Nehri'nin doğusuna çekilirken bilinçli bir savunma stratejisi uyguladı. "Hatt-ı müdafaa yoktur, sath-ı müdafaa vardır; o satıh bütün vatandır" anlayışıyla her karış toprak için sonuna kadar savaşıldı.

Muharebede kazanılan zafer, Türk cephesinde büyük bir moral yenilenmesinin kapılarını araladı. Mustafa Kemal, bu başarı karşısında TBMM tarafından Mareşal rütbesi ve Gazi unvanıyla taltif edildi. Öte yandan Fransa ile Ankara Antlaşması imzalanarak güney cephesi büyük ölçüde güvence altına alındı.

26 Ağustos 1922'de başlayan Büyük Taarruz, Türk ordusu tarafından hazırlanan çok kapsamlı ve stratejik bir harekâttı. Afyonkarahisar-Dumlupınar ekseninde düşman hatları birkaç günde yarıldı; ardından başlatılan genel bir takip harekâtıyla Yunan kuvvetleri Ege'ye doğru süpürüldü. 9 Eylül 1922'de İzmir'in kurtuluşuyla işgal dönemi sona erdi.

Mudanya Ateşkesi (11 Ekim 1922), askeri zaferin diplomatik zeminini oluşturdu. Ardından gerçekleşen Lozan Konferansı'nda Türkiye'nin yeni sınırları ve egemenlik hakları uluslararası arenada resmen tanındı. Bu tarihsel dönüşüm, Türk milletinin bağımsızlığına olan kararlılığının simgesi olarak tarihe geçti.$b$,
    436,
    3,
    'LGS',
    'LGS İnkılap - Millî Mücadele',
    ARRAY['inkılap', 'Sakarya', 'Büyük Taarruz', 'zafer', 'LGS'],
    'published'
  );

  -- 4. Lozan Antlaşması ve Cumhuriyet'in İlanı
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000004',
    'Lozan Antlaşması ve Cumhuriyet''in İlanı',
    $b$24 Temmuz 1923'te imzalanan Lozan Antlaşması, Türkiye'nin uluslararası camiada yeni bir devlet olarak tanındığının resmi belgesidir. Uzun ve zorlu müzakereler sonucunda varılan bu antlaşma; Türkiye'nin bugünkü sınırlarını belirlemiş, kapitülasyonları tamamen ortadan kaldırmış ve azınlık haklarına ilişkin düzenlemeler içermiştir.

Lozan'da Türk heyetini yöneten İsmet İnönü, deneyimli diplomatlara karşı uzlaşmaz ama dengeli bir tutumla müzakereleri yürüttü. Özellikle Boğazların statüsü, Yunanistan ile nüfus mübadelesi ve savaş tazminatları gibi hassas konularda Türk tezleri büyük ölçüde kabul gördü. Antlaşmanın imzalanmasıyla yaklaşık dört yıl süren yoğun müzakere ve savaş dönemi resmen kapandı.

Lozan Antlaşması'nın ardından Türkiye'de iç siyasi gelişmeler hız kazandı. Mustafa Kemal ve arkadaşları cumhuriyet rejimini kurmak için gereken siyasi zemini hazırladı. 29 Ekim 1923'te TBMM'de alınan kararla Türkiye Cumhuriyeti resmen ilan edildi ve Mustafa Kemal Atatürk ilk cumhurbaşkanı seçildi.

Cumhuriyet'in ilanı yalnızca siyasi bir rejim değişikliği değil, aynı zamanda derin toplumsal dönüşümlerin de başlangıç noktasıydı. Halifelik makamı 1924'te kaldırıldı; ardından eğitim, hukuk, alfabe ve takvim gibi temel alanlarda köklü inkılaplar hayata geçirildi. Bu reformlar Türk toplumunu modern, laik ve millî bir çizgiye taşımayı hedefliyordu.

Cumhuriyet'in kurulması; millet egemenliği, demokrasi ve laiklik ilkelerini Türkiye'nin temel değerleri olarak anayasal güvenceye bağladı. Mustafa Kemal Atatürk, "Egemenlik kayıtsız şartsız milletindir" ilkesini sadece bir söylem olarak değil, yeni devletin kurucu felsefesi olarak benimsedi. Bu tarihsel dönüşüm Türkiye'nin siyasi ve toplumsal gelişiminin belirleyici sacayaklarından birini oluşturmaktadır.$b$,
    437,
    2,
    'LGS',
    'LGS İnkılap - Lozan ve Cumhuriyet',
    ARRAY['inkılap', 'Lozan', 'Cumhuriyet', 'Atatürk', 'LGS'],
    'published'
  );

  -- 5. Atatürk İnkılapları: Siyasi ve Hukuki
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000005',
    'Atatürk İnkılapları: Siyasi ve Hukuki Alanda Dönüşüm',
    $b$Türkiye Cumhuriyeti'nin ilanıyla birlikte başlayan kapsamlı inkılap süreci, siyasi, hukuki, eğitim, kültür ve ekonomi alanlarında köklü değişimleri kapsıyordu. Bu dönüşümler, Osmanlı İmparatorluğu'nun çöküşünden doğan boşluğu doldurmayı ve Türkiye'yi çağdaş medeniyetler düzeyine taşımayı hedefliyordu.

Siyasi alanda gerçekleştirilen en köklü değişim hilafetin kaldırılmasıydı. Mart 1924'te Halifelik makamı ortadan kaldırıldı; böylece Türkiye, din ile devlet işlerini birbirinden ayırarak laik bir siyasi yapıya adım atmış oldu. Çok partili hayata ilişkin erken denemeler 1925'te (Terakkiperver Cumhuriyet Fırkası) ve 1930'da (Serbest Cumhuriyet Fırkası) yaşandı; ancak bu partiler kısa süre içinde kapatıldı.

Hukuki alanda 1926 yılında İsviçre Medeni Kanunu'ndan uyarlanan yeni bir Medeni Kanun yürürlüğe girdi. Bu kanun, kadın-erkek eşitliği, tek eşlilik ve miras hakları bakımından devrimsel bir nitelik taşıyordu. Ceza Kanunu İtalya'dan, Ticaret Kanunu ise Almanya'dan alınan modellerden yararlanılarak hazırlandı. 1937 yılında laiklik ilkesi Anayasa'ya resmen eklendi.

Seçim ve temsil haklarında da önemli adımlar atıldı. Türk kadınları, 1930'da belediye seçimlerinde oy kullanma, 1934'te ise milletvekili seçme ve seçilme hakkını kazandı. Bu tarih, birçok Batı Avrupa ülkesinden önce gerçekleşmekteydi; bu nedenle Türkiye, kadın hakları alanında öncü bir örnek olarak uluslararası kamuoyunda dikkat çekti.

Tüm bu reformların temelinde Kemalizm'in altı temel ilkesi yatmaktaydı: cumhuriyetçilik, milliyetçilik, halkçılık, devletçilik, laiklik ve inkılapçılık. Bu ilkeler 1937 yılında Anayasa'ya eklenerek anayasal güvenceye kavuşturuldu ve Türk devletinin kurucu değerleri olarak bugün de geçerliliğini korumaktadır.$b$,
    431,
    2,
    'LGS',
    'LGS İnkılap - Atatürk İnkılapları',
    ARRAY['inkılap', 'Atatürk', 'laiklik', 'hukuk', 'LGS'],
    'published'
  );

  -- 6. Atatürk İnkılapları: Eğitim ve Kültür
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000006',
    'Atatürk İnkılapları: Eğitim ve Kültür Devrimi',
    $b$Eğitim alanındaki inkılaplar, Türk toplumunun modernleşme sürecinde belirleyici bir rol üstlendi. 1924 yılında çıkarılan Tevhid-i Tedrisat Kanunu ile tüm eğitim kurumları Millî Eğitim Bakanlığı'nın çatısı altında toplandı; medreseler kapatılarak eğitimde birlik sağlandı.

1928'de hayata geçirilen Harf İnkılabı, Arap alfabesinin terk edilerek Latin harflerini temel alan yeni Türk alfabesinin benimsenmesini kapsıyordu. Bu değişiklik kısa süre içinde okuma yazma oranını dramatik biçimde artırdı. Mustafa Kemal bizzat okullara ve köylere giderek yeni alfabeyi halka öğretti; bu çaba "Başöğretmen" unvanıyla tarihsel bir anlam kazandı.

Dil devrimi kapsamında Türk Dil Kurumu 1932'de kuruldu. Öz Türkçe kelimeler ön plana çıkarılarak yabancı kökenli sözcüklerin büyük kısmı dilden arındırıldı. Bununla birlikte doğal dil evrimi göz önünde bulundurulmaksızın gerçekleştirilen bu köklü değişiklik bazı toplumsal güçlüklere de zemin hazırladı.

Tarih anlayışında da köklü bir dönüşüm yaşandı. Türk Tarih Kurumu 1931'de kuruldu ve Türk milletinin kadim tarihini araştırmaya yönelik sistematik çalışmalar başlatıldı. Tarih Tezi olarak bilinen görüş, Türklerin medeniyetin gelişimine büyük katkılar sunduğunu savunarak yeni bir millî kimlik bilinci inşa etmeyi hedefledi.

Güzel sanatlar ve kültür alanında da önemli adımlar atıldı. Konservatuvarlar ve opera binaları inşa edildi; Batılı resim, heykel ve müzik anlayışı kamusal yaşama taşındı. 1934'te soyadı kanununun çıkarılmasıyla Mustafa Kemal "Atatürk" soyadını aldı; vatandaşlar da belirli bir takvim dahilinde soyadı edinmeye başladı. Tüm bu reformlar, Türkiye'nin çağdaş bir ulus-devlet kimliği kazanmasında kritik bir dönüm noktası oluşturdu.$b$,
    434,
    2,
    'LGS',
    'LGS İnkılap - Atatürk İnkılapları',
    ARRAY['inkılap', 'eğitim', 'harf', 'kültür', 'LGS'],
    'published'
  );

  -- 7. Türkiye'nin Coğrafyası
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000007',
    'Türkiye''nin Coğrafyası: Bölgeler ve Ekonomik Faaliyetler',
    $b$Türkiye, iki kıta arasında köprü konumuyla kendine özgü bir coğrafi yapıya sahiptir. Ülkenin yüzde doksan yedisi Asya kıtasında yer alırken geri kalan yüzde üçlük bölümü Avrupa'dadır. Bu stratejik konum, Türkiye'yi tarih boyunca ticaret yolları, kültürel alışveriş ve jeopolitik dengeler açısından kritik bir merkeze dönüştürmüştür.

Türkiye, yedi coğrafi bölgeye ayrılır: Karadeniz, Marmara, Ege, Akdeniz, İç Anadolu, Doğu Anadolu ve Güneydoğu Anadolu. Her bölgenin kendine özgü iklim özellikleri, coğrafi yapısı ve ekonomik faaliyetleri bulunmaktadır. Karadeniz Bölgesi yoğun yağış alır, fındık ve çay üretiminde öne çıkar; Akdeniz Bölgesi ise subtropikal iklimi sayesinde narenciye, zeytin ve meyve bahçeciliğiyle tanınır.

İç Anadolu Bölgesi, geniş bozkır alanlarıyla tahıl tarımının ve koyun yetiştiriciliğinin merkezi konumundadır. Başkent Ankara bu bölgede yer alır. Doğu Anadolu Bölgesi ise hem denizden uzak oluşu hem de yüksek irtifası nedeniyle karasal iklimin en sert biçimde yaşandığı bölgedir. Hayvancılık bu bölgenin ekonomisinde belirleyici bir öneme sahiptir.

Ege Bölgesi, düz ovalarında pamuk, tütün ve üzüm yetiştirir; aynı zamanda gelişmiş sanayisi ve aktif turizm altyapısıyla dikkat çeker. Marmara Bölgesi ise İstanbul'u barındıran Türkiye'nin en kalabalık ve sanayileşmiş bölgesidir. Tekstil, finans ve ticaret sektörlerinin merkezi olan bu bölge, ülkenin GSYİH'sına en büyük katkıyı sunar.

Güneydoğu Anadolu Bölgesi, tarihsel önemi ve Güneydoğu Anadolu Projesi (GAP) sayesinde son yıllarda önemli bir dönüşüm geçirmiştir. GAP çerçevesinde yürütülen sulama ve enerji yatırımları bölgenin tarımsal potansiyelini kökten değiştirmiş; bölge, tarım sektöründe Türkiye'nin en dinamik büyüme merkezlerinden biri haline gelmiştir.$b$,
    430,
    2,
    'LGS',
    'LGS Sosyal - Coğrafya',
    ARRAY['sosyal', 'coğrafya', 'bölgeler', 'ekonomi', 'LGS'],
    'published'
  );

  -- 8. Türkiye Ekonomisi ve Sektörler
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000008',
    'Türkiye Ekonomisi: Tarım, Sanayi ve Hizmetler',
    $b$Türkiye, yaklaşık 900 milyar dolarlık GSYİH'siyle dünyanın en büyük ekonomilerinden birini oluşturmaktadır. Türkiye ekonomisi üç temel sektörden oluşur: tarım, sanayi ve hizmetler. Bu sektörler arasında hizmet sektörü en büyük paya sahipken tarım tarihsel önemi korumaya devam etmektedir.

Tarım sektörü nüfusun yaklaşık yüzde yirmisine istihdam sağlamaktadır. Türkiye; fındık, kiraz, kayısı ve incir üretiminde dünya liderliği ya da öncü konumundadır. Çay Karadeniz'de, zeytin ağırlıklı olarak Ege ve Akdeniz'de yetiştirilir. Sulanan toprakların artmasıyla birlikte pamuk, mısır ve soya fasulyesi üretimi de kayda değer artışlar kaydetmiştir.

Sanayi sektörü son yıllarda hız kazanmış; tekstil, otomotiv, inşaat malzemeleri, elektronik ve gıda işleme alanlarında önemli bir kapasite oluşturulmuştur. Türkiye, büyük şirketlere ev sahipliği yapan serbest ticaret bölgeleri ve organize sanayi bölgeleriyle uluslararası yatırımcıları çekmeyi başarmıştır. İstanbul, Bursa, İzmir ve Ankara başlıca sanayi merkezleri arasındadır.

Turizm, Türk ekonomisi için hayati önem taşıyan bir hizmet sektörüdür. Türkiye, Akdeniz bölgesinin en çok tercih edilen turistik destinasyonlarından biri olup her yıl kırk milyonun üzerinde uluslararası ziyaretçi ağırlamaktadır. Kapadokya, Efes, Antalya sahilleri ve İstanbul'un tarihi yarımadası öne çıkan turistik bölgelerdir.

Türkiye, Avrupa ile gümrük birliği, Orta Doğu ve Türk Cumhuriyetleri ile ticaret bağları aracılığıyla geniş bir ekonomik ağ kurmuştur. Enerji ithalatına bağımlılığın azaltılması ve teknoloji ihracatının artırılması ülkenin temel ekonomi politikası hedefleri arasında yer almaktadır. Türkiye, kaynak çeşitliliği ve demografik yapısıyla bölgesinde önemli bir ekonomik güç olma potansiyelini korumaktadır.$b$,
    434,
    2,
    'LGS',
    'LGS Sosyal - Ekonomi',
    ARRAY['sosyal', 'ekonomi', 'tarım', 'sanayi', 'LGS'],
    'published'
  );

  -- 9. Demokrasi ve İnsan Hakları
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000009',
    'Demokrasi ve İnsan Hakları: Temel Kavramlar',
    $b$Demokrasi, halk egemenliğine dayanan ve vatandaşların yönetim süreçlerine doğrudan ya da temsilcileri aracılığıyla katıldığı bir yönetim biçimidir. Antik Yunan'ın Atina şehir devletlerinde filizlenen demokrasi kavramı, yüzyıllar içinde evrilmiş ve günümüzün karmaşık siyasi sistemlerini doğurmuştur.

Çağdaş demokrasinin temel unsurları şunlardır: serbest ve adil seçimler, hukuk üstünlüğü, güçler ayrılığı, ifade özgürlüğü ve basın özgürlüğü. Yasama, yürütme ve yargının birbirinden ayrılması, herhangi bir gücün aşırı yetkiyi tekelinde toplamasını engeller; bu denge sistemi demokrasinin vazgeçilmez bir güvencesidir.

İnsan hakları, tüm bireylerin sırf insan olmaları nedeniyle doğuştan sahip oldukları evrensel haklardır. 1948 yılında Birleşmiş Milletler tarafından ilan edilen İnsan Hakları Evrensel Beyannamesi, yaşam hakkı, işkence yasağı, din ve vicdan özgürlüğü ile eğitim hakkı gibi temel hakları güvence altına almaktadır. Bu belge, uluslararası insan hakları hukukunun temel başvuru kaynağı niteliğindedir.

Türkiye'de bireysel haklar ve özgürlükler 1982 Anayasası'nda güvenceye alınmıştır. Anayasa; yaşam hakkı, kişi özgürlüğü ve güvenliği, düşünce özgürlüğü, toplanma ve dernek kurma hakkını açıkça düzenlemektedir. Temel hak ve özgürlükler, ulusal güvenlik veya kamu düzeni gibi zorunlu hallerde ancak kanunla ve ölçülülük ilkesine uygun biçimde sınırlandırılabilir.

Yurttaşlık sorumlulukları da demokratik düzenin sürdürülebilirliği açısından büyük önem taşır. Oy kullanmak, vergi ödemek, askerlik yapmak ve toplum yararına gönüllü etkinliklere katılmak bu sorumlulukların başında gelir. Bilinçli vatandaşlık eğitimi, demokratik değerlerin topluma kökleşmesinde ve yeni nesillere aktarılmasında temel bir işlev üstlenir.$b$,
    432,
    2,
    'LGS',
    'LGS Vatandaşlık - Demokrasi',
    ARRAY['vatandaşlık', 'demokrasi', 'insan hakları', 'anayasa', 'LGS'],
    'published'
  );

  -- 10. Türkiye Cumhuriyeti Anayasası
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000010',
    'Türkiye Cumhuriyeti Anayasası: Devletin Temel İlkeleri',
    $b$Türkiye Cumhuriyeti Anayasası, devletin örgütlenme biçimini, yönetim yapısını ve vatandaşların temel haklarını düzenleyen en üst hukuki belgedir. Yürürlükteki anayasa 1982 yılında kabul edilmiş; o tarihten bu yana pek çok değişikliğe uğramıştır. Anayasanın değiştirilemeyecek temel hükümleri arasında Türkiye'nin demokratik, laik ve sosyal hukuk devleti niteliği yer almaktadır.

Anayasanın başlangıç bölümü, Türk devletinin temel değerlerini ve millî ilkelerini ortaya koyar. Devletin bütünlüğü, insan onurunun korunması ve Atatürk milliyetçiliği bu değerler arasında öne çıkar. Anayasanın ilk üç maddesi hiçbir koşulda değiştirilemez ve değiştirilmesi dahi teklif edilemez; bu maddeler devletin özüne dokunan güvenceleri içerir.

Yasama yetkisi Türkiye Büyük Millet Meclisi'nde toplanmıştır. TBMM, seçmenler tarafından dört yıllık süreyle seçilen beş yüz elli sekiz milletvekilinden oluşur. Meclis yasaları yapar, bütçeyi onaylar ve hükümeti denetler; bu işlevler demokratik temsil sisteminin temel unsurlarıdır.

Yürütme yetkisi ve görevi Cumhurbaşkanı tarafından kullanılır ve yerine getirilir. Cumhurbaşkanı beş yıllık dönem için halk oylamasıyla seçilir ve en fazla iki dönem görev yapabilir. 2017 anayasa değişikliğiyle parlamenter sistemden başkanlık sistemine geçilmiş; başbakanlık makamı kaldırılmıştır.

Yargı bağımsızlığı anayasal güvence altındadır. Anayasa Mahkemesi, yasaların anayasaya uygunluğunu denetler; Danıştay idari uyuşmazlıkları, Yargıtay ise medeni ve ceza davalarına bakar. Hâkimler ve Savcılar Kurulu (HSK) yargı atamalarını yönetir; böylece yargının yürütmeden bağımsızlığı kurumsal bir zemine oturtulur.$b$,
    430,
    3,
    'LGS',
    'LGS Vatandaşlık - Anayasa',
    ARRAY['vatandaşlık', 'anayasa', 'TBMM', 'yargı', 'LGS'],
    'published'
  );

  -- 11. Küreselleşme ve Uluslararası Kuruluşlar
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000011',
    'Küreselleşme ve Uluslararası Kuruluşlar',
    $b$Küreselleşme, mal, hizmet, sermaye, bilgi ve insanların ülke sınırlarını aşarak giderek artan bir hızda dolaşıma girdiği karmaşık bir süreçtir. Bu olgu on yıllar içinde ivme kazanmış; teknoloji, ulaşım ve iletişim alanlarındaki devrimsel gelişmeler bu süreci güçlü biçimde beslemektedir.

Uluslararası kuruluşlar, devletlerin sınır ötesi ortak sorunları birlikte ele almasına zemin hazırlar. Birleşmiş Milletler (BM) 1945'te kurulmuş olup uluslararası barışı korumak, insani krizlere müdahale etmek ve küresel iş birliğini geliştirmek gibi temel görevler üstlenmiştir. BM bünyesindeki uzman kuruluşlar—DSÖ (Dünya Sağlık Örgütü), UNESCO, UNICEF ve FAO—sağlık, eğitim, çocuk hakları ve gıda güvencesi gibi alanlarda kritik işlevler yerine getirmektedir.

Dünya Ticaret Örgütü (DTÖ) küresel ticaret sistemini yönetirken Uluslararası Para Fonu (IMF) ve Dünya Bankası ekonomik istikrar ile kalkınmayı destekler. NATO gibi güvenlik ittifakları ise üye ülkelerin savunma iş birliğini organize eder. Türkiye; BM, NATO, OECD ve Ekonomik İş Birliği Teşkilatı (EİT) dahil pek çok önemli uluslararası kuruluşta etkin rol oynamaktadır.

Küreselleşmenin ekonomik açıdan tartışmalı boyutları da mevcuttur. Destekçiler, serbest ticaretin refah artışını, teknoloji transferini ve yoksulluğun azaltılmasını hızlandırdığını öne sürer. Eleştirmenler ise gelir eşitsizliğinin derinleştiğini, kültürel homojenleşmenin yerel değerleri erodi ettiğini ve küresel tedarik zincirlerine bağımlılığın kırılganlıklar doğurduğunu vurgular.

Çevre sorunları küresel iş birliğini zorunlu kılan alanların en başında gelmektedir. Paris Anlaşması ve biyolojik çeşitlilik sözleşmeleri, iklim değişikliği ve ekosistem bozulmasıyla mücadelede ulus ötesi bir çerçeve sunmaktadır. Ancak ulusal çıkarlar ile küresel yükümlülükler arasındaki gerilim çözüm arayışlarını sürekli olarak karmaşık hale getirmektedir.$b$,
    432,
    3,
    'LGS',
    'LGS Sosyal - Küreselleşme',
    ARRAY['sosyal', 'küreselleşme', 'BM', 'NATO', 'LGS'],
    'published'
  );

  -- 12. Çevre ve Sürdürülebilirlik
  INSERT INTO public.text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'd0000001-0000-4000-d000-000000000012',
    'Çevre Sorunları ve Sürdürülebilir Kalkınma',
    $b$İklim değişikliği çağımızın en acil ve kapsamlı küresel sorunlarından biridir. Karbondioksit ve metan gibi sera gazlarının atmosferdeki birikimi, sera etkisi yoluyla küresel ortalama sıcaklığın yükselmesine neden olmaktadır. Bu ısınma; kutup buzullarının erimesine, deniz seviyesinin yükselmesine, aşırı hava olaylarının sıklaşmasına ve ekosistem dengelerinin bozulmasına yol açmaktadır.

Biyoçeşitlilik kaybı da dünya genelinde hız kazanan ciddi bir çevre sorunudur. Tarım alanlarının genişlemesi, kentleşme, kirlilik ve iklim değişikliği; birçok türü yaşam alanı kaybı ve nesli tükenme tehlikesiyle yüz yüze bırakmaktadır. Bilim insanları, tüm bu etkenlerle birleşen insan baskısının "altıncı toplu yok oluş" evresini tetiklediğini vurgulamaktadır.

Su kıtlığı, önümüzdeki dönemde daha fazla bölgeyi etkileyecek kritik bir sorun olarak öne çıkmaktadır. Tatlı su kaynaklarının yalnızca küçük bir bölümü içilebilir nitelikte olup bu kaynaklar tarım, sanayi ve nüfus artışının getirdiği yoğun baskı altındadır. Su kaynaklarının sürdürülebilir yönetimi, küresel gıda güvencesi ve toplumsal istikrar açısından stratejik bir öneme sahiptir.

Sürdürülebilir kalkınma, bugünün ihtiyaçlarını gelecek nesillerin kendi ihtiyaçlarını karşılama kapasitesine zarar vermeksizin karşılamak olarak tanımlanır. Yenilenebilir enerji kaynaklarına geçiş, döngüsel ekonomi modelleri ve yeşil kentsel tasarım bu hedefe ulaşmanın önemli araçlarıdır.

BM'nin 2030 Sürdürülebilir Kalkınma Hedefleri, eşitsizliklerin azaltılmasından temiz enerji erişimine, sorumlu tüketime ve iklim eylemine kadar geniş bir çerçeve sunmaktadır. Türkiye bu hedeflere ulusal politikalar ve uluslararası sözleşmeler aracılığıyla katkı sağlamaktadır. Gençlik aktivizmi ve çevre bilincinin yükselmesi sürdürülebilirlik gündemini toplumsal düzlemde güçlendiren dinamikler olarak öne çıkmaktadır.$b$,
    434,
    3,
    'LGS',
    'LGS Sosyal - Çevre',
    ARRAY['sosyal', 'çevre', 'iklim', 'sürdürülebilirlik', 'LGS'],
    'published'
  );

  -- ─── SORULAR ─────────────────────────────────────────────────────

  -- Metin 1: Mondros (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000001',
     'Mondros Mütarekesi hangi tarihe imzalanmıştır?',
     '["19 Mayıs 1919","30 Ekim 1918","23 Nisan 1920","24 Temmuz 1923"]',
     1, 'detail', 2,
     'Mondros Mütarekesi 30 Ekim 1918''de imzalanmıştır.'),
    ('d0000001-0000-4000-d000-000000000001',
     'Mustafa Kemal''in Anadolu''ya geçişinin temel amacı neydi?',
     '["İstanbul''a dönmek","Direniş hareketini koordine etmek","İtilaf devletleriyle anlaşmak","Osmanlı ordusunu yeniden kurmak"]',
     1, 'inference', 2,
     'Mustafa Kemal, Samsun''a çıkarak dağınık direniş hareketini birleştirmek ve koordine etmek için Anadolu''ya geçmiştir.'),
    ('d0000001-0000-4000-d000-000000000001',
     'Sivas Kongresi''nin önemi nedir?',
     '["Cumhuriyet ilan edildi","Bölgesel cemiyetler birleştirilerek merkezi milli hareket oluşturuldu","İzmir kurtarıldı","Misak-ı Millî kabul edildi"]',
     1, 'detail', 2,
     'Sivas Kongresi''nde bölgesel cemiyetler birleştirilerek Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti kuruldu.'),
    ('d0000001-0000-4000-d000-000000000001',
     'Metnin ana fikri nedir?',
     '["Mondros''un koşulları ağırdı","İşgaller milletin direniş ruhunu ateşleyerek örgütlü bir milli harekete dönüştü","Yunan kuvvetleri başarılı oldu","İstanbul kongre merkezi oldu"]',
     1, 'main_idea', 2,
     'Metin işgallerin direniş ruhunu nasıl örgütlü bir milli harekete dönüştürdüğünü açıklamaktadır.'),
    ('d0000001-0000-4000-d000-000000000001',
     'Metinde "Tekalif-i Milliye" yerine bağlamsal olarak eşdeğer ifade hangisidir?',
     '["Düşman işgali","Halkın cepheye destek seferberliği","Ateşkes koşulları","Milis kuvvetlerinin silahlanması"]',
     1, 'vocabulary', 2,
     'Tekalif-i Milliye, halkın cepheye yönelik büyük destek seferberliğini ifade etmektedir.');

  -- Metin 2: TBMM (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000002',
     'Misak-ı Millî hangi mecliste kabul edildi?',
     '["TBMM","Son Osmanlı Mebusan Meclisi","Sivas Kongresi","Erzurum Kongresi"]',
     1, 'detail', 2,
     'Misak-ı Millî, Son Osmanlı Mebusan Meclisi''nde Ocak 1920''de kabul edildi.'),
    ('d0000001-0000-4000-d000-000000000002',
     'TBMM''nin 23 Nisan 1920''de açılmasının temel nedeni nedir?',
     '["Seçimlerin erken yapılması","İstanbul''un işgal altına alınarak mebuslara baskı yapılması","Mondros''un kabulü","Lozan Antlaşması''nın imzalanması"]',
     1, 'inference', 2,
     'İstanbul''un Mart 1920''de işgal edilmesi ve mebuslara baskı yapılması üzerine TBMM Ankara''da açıldı.'),
    ('d0000001-0000-4000-d000-000000000002',
     'TBMM''nin yapısal özelliği neydi?',
     '["Yalnızca yasama yetkisine sahipti","Yasama ve yürütme yetkilerini bir arada tutuyordu","Yalnızca yürütme organıydı","Osmanlı hanedanına bağlıydı"]',
     1, 'detail', 2,
     'TBMM hem yasama hem yürütme yetkilerini bünyesinde toplayan olağanüstü bir yapıya sahipti.'),
    ('d0000001-0000-4000-d000-000000000002',
     'Metnin ana fikri nedir?',
     '["İstanbul tek meşru yönetimdi","TBMM''nin kuruluşu, millî egemenlik ilkesinin fiilî somutlaşmasıydı","Misak-ı Millî ulusal sınırları genişletti","TBMM savaşı kazandı"]',
     1, 'main_idea', 2,
     'Metin TBMM''nin kuruluşunu millî egemenlik anlayışına geçişin somut ifadesi olarak değerlendirmektedir.'),
    ('d0000001-0000-4000-d000-000000000002',
     'Metinde "millî egemenlik" ilkesi nasıl ifade edilmiştir?',
     '["Hükümdarın mutlak otoritesi","Halk iradesine dayanan, mecliste somutlaşan yönetim anlayışı","Yalnızca askeri komuta yetkisi","Dini otorite"]',
     1, 'vocabulary', 2,
     'Millî egemenlik, halk iradesinin mecliste temsil edilmesini ifade eden siyasi ilkedir.');

  -- Metin 3: Sakarya ve Taarruz (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000003',
     'Sakarya Meydan Muharebesi kaç gün sürdü?',
     '["15 gün","22 gün","30 gün","7 gün"]',
     1, 'detail', 2,
     '23 Ağustos - 13 Eylül 1921 arasında 22 gün sürdü.'),
    ('d0000001-0000-4000-d000-000000000003',
     'Sakarya Muharebesi''ndeki savunma stratejisinin özü neydi?',
     '["Geri çekilmeden savunma","Hattı değil, tüm vatanı savunmak","Sadece Ankara''yı korumak","Yunan kuvvetleriyle ateşkes yapmak"]',
     1, 'inference', 3,
     '"Hatt-ı müdafaa yoktur, sath-ı müdafaa vardır" ilkesi tüm vatanın savunma sahası sayıldığını ifade eder.'),
    ('d0000001-0000-4000-d000-000000000003',
     'Büyük Taarruz ne zaman başladı?',
     '["9 Eylül 1922","26 Ağustos 1922","11 Ekim 1922","23 Ağustos 1921"]',
     1, 'detail', 2,
     'Büyük Taarruz 26 Ağustos 1922''de başladı.'),
    ('d0000001-0000-4000-d000-000000000003',
     'Metnin ana fikri nedir?',
     '["Yunan kuvvetleri güçlüydü","Sakarya ve Büyük Taarruz, askeri zaferin ve bağımsızlığın kazanılmasındaki belirleyici aşamalardır","Mudanya sadece bir ateşkesti","İzmir kurtarılamadı"]',
     1, 'main_idea', 3,
     'Metin, Sakarya ve Büyük Taarruz''u kurtuluşun belirleyici askeri aşamaları olarak ele almaktadır.'),
    ('d0000001-0000-4000-d000-000000000003',
     'Metinde "Gazi" unvanı hangi başarıya karşılık verilmiştir?',
     '["TBMM''nin kurulmasına","Lozan Antlaşması''na","Sakarya Muharebesi''ndeki zafere","Büyük Taarruz''a"]',
     2, 'vocabulary', 2,
     'Gazi unvanı, Sakarya Muharebesi''ndeki zaferden sonra Mustafa Kemal''e verilmiştir.');

  -- Metin 4: Lozan ve Cumhuriyet (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000004',
     'Cumhuriyet ne zaman ilan edildi?',
     '["24 Temmuz 1923","29 Ekim 1923","23 Nisan 1920","30 Ekim 1918"]',
     1, 'detail', 1,
     'Türkiye Cumhuriyeti 29 Ekim 1923''te ilan edildi.'),
    ('d0000001-0000-4000-d000-000000000004',
     'Lozan''da en hassas konular arasında neler sayılmıştır?',
     '["Dil reformu ve eğitim","Boğazların statüsü ve nüfus mübadelesi","Sanayi politikası","Askeri ittifaklar"]',
     1, 'detail', 2,
     'Metin Boğazların statüsü, nüfus mübadelesi ve savaş tazminatlarını hassas konular olarak sayar.'),
    ('d0000001-0000-4000-d000-000000000004',
     'Cumhuriyet''in ilanının toplumsal önemi neydi?',
     '["Sadece yönetici değişimi","Derin toplumsal inkılapların başlangıç noktası oldu","Ekonomik istikrarsızlığa yol açtı","Yalnızca askeri değişim getirdi"]',
     1, 'inference', 2,
     'Cumhuriyet''in ilanı siyasi değişikliğin ötesinde; eğitim, hukuk, alfabe gibi alanlarda köklü dönüşümlerin başlangıcı oldu.'),
    ('d0000001-0000-4000-d000-000000000004',
     'Metnin ana fikri nedir?',
     '["Lozan sadece bir ateşkesti","Lozan ve Cumhuriyet''in ilanı, bağımsız modern Türkiye''nin hukuki ve siyasi temellerini attı","Halifelik kaldırılmamalıydı","İsmet İnönü başarısız oldu"]',
     1, 'main_idea', 2,
     'Metin Lozan''ı ve Cumhuriyet''in ilanını modern Türk devletinin kurucu sütunları olarak ele almaktadır.'),
    ('d0000001-0000-4000-d000-000000000004',
     'Metinde "kapitülasyon" kavramı bağlamından ne anlam çıkarılabilir?',
     '["Askeri teslim olma","Yabancı devletlerin imtiyazları (ticari ayrıcalıklar)","Toprak genişlemesi","Nüfus mübadelesi"]',
     1, 'vocabulary', 2,
     'Kapitülasyonlar, yabancı devletlerin Osmanlı topraklarında sahip olduğu hukuki ve ticari ayrıcalıklardı; Lozan''da tamamen kaldırıldı.');

  -- Metin 5: Siyasi ve Hukuki İnkılaplar (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000005',
     'Medeni Kanun hangi ülkeden uyarlanmıştır?',
     '["Almanya","İtalya","İsviçre","Fransa"]',
     2, 'detail', 2,
     '1926 tarihli Türk Medeni Kanunu İsviçre Medeni Kanunu''ndan uyarlanmıştır.'),
    ('d0000001-0000-4000-d000-000000000005',
     'Türk kadınlarının milletvekili seçme ve seçilme hakkı hangi yılda kazanıldı?',
     '["1923","1930","1934","1938"]',
     2, 'detail', 2,
     'Türk kadınları milletvekili seçme ve seçilme hakkını 1934''te kazandı.'),
    ('d0000001-0000-4000-d000-000000000005',
     'Altı temel ilkenin Anayasa''ya eklenmesi neyi ifade eder?',
     '["Bu ilkelerin geçici olduğunu","Bu ilkelerin kalıcı anayasal güvenceye kavuşturulduğunu","Bu ilkelerin tartışmalı olduğunu","Bu ilkelerin Avrupa''dan alındığını"]',
     1, 'inference', 2,
     '1937''de Anayasa''ya eklenen altı ilke kalıcı ve anayasal birer güvenceye dönüştürüldü.'),
    ('d0000001-0000-4000-d000-000000000005',
     'Metnin ana fikri nedir?',
     '["Yalnızca hukuki değişiklikler önemliydi","Siyasi ve hukuki inkılaplar Türkiye''yi laik, modern bir devlet yapısına taşıdı","Kadın hakları ihmal edildi","İnkılaplar halkın talebiyle gerçekleşti"]',
     1, 'main_idea', 2,
     'Metin siyasi ve hukuki inkılapları Türkiye''yi modern laik devlet yapısına taşıyan dönüşümler olarak sunmaktadır.'),
    ('d0000001-0000-4000-d000-000000000005',
     'Metinde "laiklik" kavramı nasıl yansıtılmaktadır?',
     '["Dini tamamen reddetmek","Din ile devlet işlerinin birbirinden ayrılması","Batı kültürünü olduğu gibi benimsemek","Kadın haklarını kısıtlamak"]',
     1, 'vocabulary', 2,
     'Laiklik, din ile devlet işlerinin birbirinden ayrılmasını ifade eden ilkedir.');

  -- Metin 6: Eğitim ve Kültür (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000006',
     'Tevhid-i Tedrisat Kanunu''nun amacı neydi?',
     '["Okul sayısını artırmak","Tüm eğitim kurumlarını Millî Eğitim Bakanlığı altında birleştirerek eğitimde birlik sağlamak","Medreseleri güçlendirmek","Yabancı okulları açmak"]',
     1, 'detail', 2,
     'Tevhid-i Tedrisat Kanunu 1924''te çıkarılmış; tüm eğitim kurumlarını tek çatı altında birleştirmiştir.'),
    ('d0000001-0000-4000-d000-000000000006',
     'Harf İnkılabı hangi yılda gerçekleşti?',
     '["1924","1926","1928","1932"]',
     2, 'detail', 1,
     'Harf İnkılabı 1928''de gerçekleşti; Arap harfleri bırakılarak Latin kökenli Türk alfabesi kabul edildi.'),
    ('d0000001-0000-4000-d000-000000000006',
     'Türk Tarih Tezi''nin temel hedefi neydi?',
     '["Osmanlı tarihi yazmak","Batı tarihini reddetmek","Türk milletinin tarihsel katkılarını ortaya koyarak yeni bir millî kimlik inşa etmek","Dini tarihi yazmak"]',
     2, 'inference', 2,
     'Türk Tarih Tezi, Türk milletinin medeniyete katkılarını vurgulayarak yeni millî kimlik bilinci oluşturmayı hedefledi.'),
    ('d0000001-0000-4000-d000-000000000006',
     'Metnin ana fikri nedir?',
     '["Eğitim reformu gereksizdi","Eğitim ve kültür inkılapları Türkiye''yi modern kimliğine kavuşturan dönüşümlerin bütünleyici parçasıdır","Soyadı kanunu önemsizdi","Dil devrimi tam anlamıyla başarıya ulaştı"]',
     1, 'main_idea', 2,
     'Metin eğitim ve kültür alanındaki inkılapları Türkiye''nin modernleşme sürecinin ayrılmaz bir parçası olarak değerlendirmektedir.'),
    ('d0000001-0000-4000-d000-000000000006',
     'Metinde "Başöğretmen" unvanı ne anlam ifade etmektedir?',
     '["Okul müdürü","Mustafa Kemal''in bizzat yeni alfabeyi öğretmedeki kişisel katkısını simgeleyen unvan","Millî Eğitim Bakanı","Üniversite rektörü"]',
     1, 'vocabulary', 2,
     'Başöğretmen unvanı, Mustafa Kemal''in okullara ve köylere giderek bizzat yeni alfabeyi öğretmesiyle kazandığı unvandır.');

  -- Metin 7: Coğrafya (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000007',
     'Türkiye''nin yüzde kaçı Asya kıtasında yer alır?',
     '["90","95","97","99"]',
     2, 'detail', 1,
     'Türkiye''nin yüzde doksan yedisi Asya''da, yüzde üçü Avrupa''dadır.'),
    ('d0000001-0000-4000-d000-000000000007',
     'Hangi bölge fındık ve çay üretiminde öne çıkar?',
     '["Ege","Akdeniz","Karadeniz","Marmara"]',
     2, 'detail', 1,
     'Karadeniz Bölgesi yoğun yağışıyla fındık ve çay üretiminin merkezidir.'),
    ('d0000001-0000-4000-d000-000000000007',
     'Marmara Bölgesi''nin ekonomik önemi nedir?',
     '["Hayvancılığın merkezi","Tahıl üretiminin kalbi","Tekstil, finans ve ticaretle en büyük GSYİH katkısı","Subtropikal meyvelerin anavatanı"]',
     2, 'inference', 2,
     'Marmara Bölgesi, İstanbul ile birlikte Türkiye''nin sanayi ve ekonomi merkezidir; GSYİH''ya en büyük katkıyı yapar.'),
    ('d0000001-0000-4000-d000-000000000007',
     'Metnin ana fikri nedir?',
     '["Türkiye küçük bir ülkedir","Türkiye''nin farklı bölgeleri kendine özgü iklim ve ekonomik faaliyetleriyle çeşitli bir coğrafi yapı sunar","GAP en önemli projedir","Akdeniz en büyük bölgedir"]',
     1, 'main_idea', 2,
     'Metin Türkiye''nin bölgelerini coğrafi, iklimsel ve ekonomik özellikleriyle kapsamlı biçimde incelemektedir.'),
    ('d0000001-0000-4000-d000-000000000007',
     'Metinde "GAP" neden önemli bulunmaktadır?',
     '["Savunma harcamaları için","Sulama ve enerji yatırımlarıyla Güneydoğu''nun tarımsal potansiyelini dönüştürdüğü için","İstanbul''u büyüttüğü için","Turistleri çektiği için"]',
     1, 'vocabulary', 2,
     'GAP, sulama ve enerji yatırımlarıyla Güneydoğu Anadolu''nun tarımsal potansiyelini kökten dönüştüren büyük bir kalkınma projesidir.');

  -- Metin 8: Ekonomi (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000008',
     'Türkiye hangi ürünlerde dünya liderliğine yakın konumdadır?',
     '["Buğday ve mısır","Fındık, kiraz, kayısı ve incir","Petrol ve doğalgaz","Pamuk ve ipek"]',
     1, 'detail', 2,
     'Türkiye fındık, kiraz, kayısı ve incir üretiminde dünya liderliği ya da öncü konumundadır.'),
    ('d0000001-0000-4000-d000-000000000008',
     'GSYİH''ya en büyük katkıyı hangi sektör yapmaktadır?',
     '["Tarım","Sanayi","Hizmetler","Madencilik"]',
     2, 'detail', 2,
     'Hizmet sektörü Türkiye GSYİH''sına en büyük payı katan sektördür.'),
    ('d0000001-0000-4000-d000-000000000008',
     'Türkiye''nin ekonomi politikasının temel hedefleri nelerdir?',
     '["Yalnızca tarımı geliştirmek","Enerji ithalatına bağımlılığı azaltmak ve teknoloji ihracatını artırmak","Sanayi bölgelerini kapatmak","Turizmden tamamen vazgeçmek"]',
     1, 'inference', 2,
     'Metin, enerji bağımlılığının azaltılması ve teknoloji ihracatının artırılmasını temel ekonomi politikası hedefleri olarak belirtmektedir.'),
    ('d0000001-0000-4000-d000-000000000008',
     'Metnin ana fikri nedir?',
     '["Türkiye yalnızca tarım ülkesidir","Türkiye, çeşitlendirilmiş sektörel yapısıyla bölgesinin önemli ekonomilerinden biridir","Turizm artık önemsizdir","Sanayi dışa bağımlıdır"]',
     1, 'main_idea', 2,
     'Metin Türkiye ekonomisini tarım, sanayi ve hizmet sektörleri ekseninde ele almaktadır.'),
    ('d0000001-0000-4000-d000-000000000008',
     'Metinde "gümrük birliği" kavramı nasıl kullanılmaktadır?',
     '["İç gümrük noktaları sistemi","Türkiye ile AB arasındaki ticareti kolaylaştıran ticaret düzenlemesi","Vergi sistemi","Tarım sübvansiyonu"]',
     1, 'vocabulary', 2,
     'Gümrük birliği, Türkiye ile Avrupa arasındaki ticari ilişkileri düzenleyen çerçeveyi ifade etmektedir.');

  -- Metin 9: Demokrasi (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000009',
     'Çağdaş demokrasinin temel unsurları arasında hangisi yer almaz?',
     '["Serbest ve adil seçimler","Hukuk üstünlüğü","Güçler ayrılığı","Tek parti yönetimi"]',
     3, 'detail', 2,
     'Tek parti yönetimi demokrasiyle bağdaşmaz; serbest seçimler, hukuk üstünlüğü ve güçler ayrılığı temel unsurlardandır.'),
    ('d0000001-0000-4000-d000-000000000009',
     'İnsan Hakları Evrensel Beyannamesi hangi yılda ilan edildi?',
     '["1923","1945","1948","1961"]',
     2, 'detail', 1,
     'İnsan Hakları Evrensel Beyannamesi BM tarafından 1948''de ilan edilmiştir.'),
    ('d0000001-0000-4000-d000-000000000009',
     'Güçler ayrılığının temel amacı nedir?',
     '["Hükümeti güçlendirmek","Herhangi bir gücün aşırı yetkiyi tekelinde toplamasını önlemek","Yargıyı zayıflatmak","Seçimleri kolaylaştırmak"]',
     1, 'inference', 2,
     'Güçler ayrılığı, yasama-yürütme-yargı arasında denge kurarak tek bir gücün aşırı yetki edinmesini engeller.'),
    ('d0000001-0000-4000-d000-000000000009',
     'Metnin ana fikri nedir?',
     '["Demokrasi mükemmel bir sistemdir","Demokrasi ve insan hakları, bireysel özgürlükleri ve toplumsal katılımı güvence altına alan birbiriyle bağlantılı kavramlardır","Türkiye demokratik değildir","İnsan hakları yalnızca hukuki belgelerle korunur"]',
     1, 'main_idea', 2,
     'Metin demokrasi ve insan haklarını, bireyin özgürlüğünü ve toplumsal katılımı destekleyen birbiriyle bağlantılı temel kavramlar olarak ele almaktadır.'),
    ('d0000001-0000-4000-d000-000000000009',
     'Metinde "bilinçli vatandaşlık" kavramı nasıl değerlendirilmektedir?',
     '["Oy kullanmayı reddetmek","Demokratik değerlerin kökleşmesinde ve aktarılmasında temel işlev üstlenmek","Yalnızca vergi ödemek","Devlete körü körüne bağlılık"]',
     1, 'vocabulary', 2,
     'Metin bilinçli vatandaşlığı, demokratik değerlerin topluma kökleşmesinde ve nesiller arası aktarımında temel bir işlev olarak tanımlamaktadır.');

  -- Metin 10: Anayasa (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000010',
     'TBMM kaç milletvekilinden oluşmaktadır?',
     '["450","500","550","600"]',
     2, 'detail', 2,
     'TBMM beş yüz elli sekiz milletvekilinden oluşur.'),
    ('d0000001-0000-4000-d000-000000000010',
     'Cumhurbaşkanı kaç yıllık süre için seçilir?',
     '["4","5","6","7"]',
     1, 'detail', 1,
     'Cumhurbaşkanı 5 yıllık dönem için halk oylamasıyla seçilir.'),
    ('d0000001-0000-4000-d000-000000000010',
     '2017 anayasa değişikliğinin temel sonucu neydi?',
     '["Meclisin güçlendirilmesi","Parlamenter sistemden başkanlık sistemine geçilmesi","Anayasa Mahkemesi''nin kaldırılması","Seçim döneminin uzatılması"]',
     1, 'inference', 2,
     '2017 değişikliğiyle parlamenter sistemden başkanlık sistemine geçildi ve başbakanlık kaldırıldı.'),
    ('d0000001-0000-4000-d000-000000000010',
     'Metnin ana fikri nedir?',
     '["Anayasa yalnızca temel hakları düzenler","Anayasa devlet yapısını, güçler dengesini ve vatandaş haklarını belirleyen en üst hukuki belgedir","TBMM sınırsız yetkiye sahiptir","Yargı yürütmeye bağlıdır"]',
     1, 'main_idea', 2,
     'Metin Türkiye Cumhuriyeti Anayasası''nı devlet yapısını, güçler dengesini ve temel hakları düzenleyen en üst belge olarak tanımlamaktadır.'),
    ('d0000001-0000-4000-d000-000000000010',
     'Metinde "yargı bağımsızlığı" neden önemli bulunmaktadır?',
     '["Mahkemelerin daha hızlı karar vermesi için","Yargının yürütmeden bağımsız biçimde işlev görmesini kurumsal zemine oturtmak için","Daha fazla hâkim atanması için","Kanunların daha kolay değiştirilmesi için"]',
     1, 'vocabulary', 2,
     'Yargı bağımsızlığı, yargı organlarının siyasi baskı olmaksızın işlev görmesini güvence altına alır.');

  -- Metin 11: Küreselleşme (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000011',
     'BM hangi yılda kurulmuştur?',
     '["1919","1939","1945","1948"]',
     2, 'detail', 1,
     'Birleşmiş Milletler 1945 yılında kurulmuştur.'),
    ('d0000001-0000-4000-d000-000000000011',
     'UNICEF''in temel odak alanı nedir?',
     '["Küresel ticaret","Sağlık","Çocuk hakları","İklim değişikliği"]',
     2, 'detail', 2,
     'UNICEF, BM''nin çocuk hakları ve refahına odaklanan uzman kuruluşudur.'),
    ('d0000001-0000-4000-d000-000000000011',
     'Küreselleşme eleştirmenlerinin temel argümanı nedir?',
     '["Teknoloji transferi zararlıdır","Gelir eşitsizliği artar, kültürel değerler erozyona uğrar","Serbest ticaret ülkeleri zayıflatır","BM çok güçlüdür"]',
     1, 'inference', 2,
     'Eleştirmenler küreselleşmenin gelir eşitsizliğini artırdığını ve kültürel homojenleşmeye yol açtığını öne sürer.'),
    ('d0000001-0000-4000-d000-000000000011',
     'Metnin ana fikri nedir?',
     '["BM en güçlü kuruluştur","Küreselleşme ve uluslararası kuruluşlar sınır ötesi sorunları ele almada kritik bir çerçeve oluşturur","NATO gereksizdir","Çevre sorunları aşılabilirdir"]',
     1, 'main_idea', 2,
     'Metin küreselleşme ve uluslararası kuruluşları, ortak sorunların çözümünde kritik bir çerçeve olarak sunmaktadır.'),
    ('d0000001-0000-4000-d000-000000000011',
     'Metinde "gümrük birliği" (DTÖ bağlamında) ne anlam taşımaktadır?',
     '["Ticaret savaşları","Küresel ticaret sistemini yöneten uluslararası kuruluş","Para birliği","Savunma ittifakı"]',
     1, 'vocabulary', 2,
     'Dünya Ticaret Örgütü (DTÖ) küresel ticaret sistemini yönetmektedir.');

  -- Metin 12: Çevre (5 soru)
  INSERT INTO public.text_questions (text_id, question_text, options, correct_index, question_type, difficulty, explanation)
  VALUES
    ('d0000001-0000-4000-d000-000000000012',
     'Sera etkisi hangi gazların birikmesiyle güçlenmektedir?',
     '["Oksijen ve azot","Karbondioksit ve metan","Argon ve helyum","Su buharı ve ozon"]',
     1, 'detail', 2,
     'Karbondioksit ve metan gibi sera gazlarının atmosferdeki birikimi sera etkisini artırır.'),
    ('d0000001-0000-4000-d000-000000000012',
     'Sürdürülebilir kalkınma nasıl tanımlanmaktadır?',
     '["Yalnızca ekonomik büyüme","Bugünkü ihtiyaçları gelecek nesillerin kapasitesine zarar vermeksizin karşılamak","Sadece çevre koruma","Teknoloji kullanımını azaltmak"]',
     1, 'detail', 2,
     'Sürdürülebilir kalkınma, bugünün ihtiyaçlarını gelecek nesillerin kaynaklarına zarar vermeden karşılamayı ifade eder.'),
    ('d0000001-0000-4000-d000-000000000012',
     'Su kıtlığı neden küresel bir sorun haline gelmektedir?',
     '["Okyanuslar küçülmektedir","Tatlı su kaynakları sınırlı; tarım, sanayi ve nüfus artışının baskısı altında","Yağış hiç kalmamıştır","Teknoloji suyu kirletmektedir"]',
     1, 'inference', 2,
     'Tatlı su kaynakları sınırlı olup tarım, sanayi ve büyüyen nüfusun yarattığı yoğun baskıyla azalmaktadır.'),
    ('d0000001-0000-4000-d000-000000000012',
     'Metnin ana fikri nedir?',
     '["İklim değişikliği abartılmaktadır","Çevre sorunları sistematik, sürdürülebilirlik odaklı ve uluslar arası iş birliğini zorunlu kılan çözümler gerektirmektedir","Paris Anlaşması yeterlidir","Gençlik aktivizmi işe yaramaz"]',
     1, 'main_idea', 3,
     'Metin çevre sorunlarını birbirine bağlı, uluslararası iş birliği ve sürdürülebilir çözümler gerektiren küresel zorluklar olarak sunmaktadır.'),
    ('d0000001-0000-4000-d000-000000000012',
     'Metinde "döngüsel ekonomi" kavramı neyle ilişkilendirilmektedir?',
     '["Finansal döngüler","Atık azaltma ve kaynakların yeniden kullanımını temel alan sürdürülebilir üretim modeli","Tarihsel ekonomik döngüler","Faiz oranları"]',
     1, 'vocabulary', 3,
     'Döngüsel ekonomi, atığı en aza indirgeyen ve kaynakları yeniden kullanarak sürdürülebilir kalkınmayı hedefleyen bir üretim modelidir.');

  RAISE NOTICE '048: 12 LGS Sosyal/İnkılap/Vatandaşlık metni ve 60 soru eklendi.';
END;
$migration$;
