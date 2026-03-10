-- ================================================================
-- 053_ayt_tarih_cografya.sql
-- AYT Tarih (7 metin) + AYT Cografya (5 metin) -- 60 soru
-- ================================================================

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM text_library WHERE category LIKE 'AYT Tarih%' OR category LIKE 'AYT Cografya%') > 0 THEN
    RAISE NOTICE '053: already exists';
    RETURN;
  END IF;

  -- ============================================================
  -- TEXT 1: Mondros Mutarekesi ve Isgaller Donemi
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000001-0000-4000-f100-000000000001',
    'Mondros Mütarekesi ve İşgaller Dönemi',
    'AYT Tarih',
    'AYT',
    4,
    452,
    3,
    $b$
Mondros Mütarekesi, 30 Ekim 1918'de Osmanlı İmparatorluğu ile İtilaf Devletleri arasında imzalanmış ve Birinci Dünya Savaşı'nın Osmanlı cephesindeki fiilî sona erişini simgelemiştir. Limni Adası'nın Mondros Limanı'nda İngiliz amirali Somerset Gough-Calthorpe ile Osmanlı Bahriye Nazırı Rauf Bey arasında müzakere edilen bu belge, Osmanlı Devleti'nin teslimiyetini hukuki zemine oturtmuş; ancak ilerleyen süreçte öngörülmüş olan koşulların çok ötesine geçen bir işgal sürecinin fitilini ateşlemiştir.

Mütareke metninin 7. maddesi, İtilaf Devletleri'ne stratejik açıdan önemli gördükleri bölgeleri işgal etme yetkisi tanımakta ve bu hüküm fiilen sınırsız bir müdahale kapısı açmaktaydı. Nitekim imzanın ardından gecikmeksizin harekete geçen İtilaf kuvvetleri, 13 Kasım 1918'de İstanbul Limanı'na büyük bir filonun demirlediği görülmüştür. Ardından Musul, Antep, Maraş ve Urfa gibi Anadolu şehirleri İngilizler tarafından; İzmir ve çevresi Yunanlar tarafından; Adana ve Çukurova bölgesi ise Fransızlar tarafından işgal edilmiştir.

15 Mayıs 1919'da Yunan kuvvetlerinin İzmir'e çıkarması, Osmanlı kamuoyunda derin bir sarsıntı yaratmış ve Türk millî bilincinin uyanmasını tetiklemiştir. Bu tarih, yalnızca bir işgalin başlangıcı olmayıp aynı zamanda Millî Mücadele'nin ruhsal fitilinin ateşlendiği an olarak da tarihe geçmiştir. Halkın elindeki silahların toplatılmasını öngören Mütareke hükümleri, Anadolu'nun dört bir yanında örgütlenen Müdafaa-i Hukuk cemiyetleri tarafından sessiz sedasız devre dışı bırakılmaya çalışılmıştır.

İşgal karşısında Osmanlı Devleti'nin merkezi yönetiminin aciz kalması, yerel direnişçilerin ve sonradan Millî Mücadele'nin öncüleri haline gelecek olan Mustafa Kemal gibi komutanların inisiyatif almasını zorunlu kılmıştır. Mustafa Kemal, 19 Mayıs 1919'da Samsun'a ayak basmasıyla birlikte bu direnişi örgütsel bir zemine oturtmaya başlamış; Amasya Genelgesi, Erzurum Kongresi ve ardından toplanan Sivas Kongresi, Millî Mücadele'nin siyasi ve askeri çerçevesini adım adım belirlemiştir.

Mondros'un getirdiği koşullar yalnızca askeri ya da idari değil; aynı zamanda derin bir psikolojik kırılmanın da habercisiydi. Osmanlı milletinin yüzyıllar boyunca sürdürdüğü egemenlik anlayışı sarsılmış, devletin varlığı tehdit altına girmiş ve toplumsal travma kaçınılmaz hale gelmiştir. Bu ortam içinde şekillenen direniş ruhu, yalnızca toprak bütünlüğünü değil, Türk kimliğinin ve onurunun savunusunu da kapsamış; millî bir seferberliğin düşünsel ve duygusal temellerini atmıştır.
    $b$,
    ARRAY['tarih','Mondros','işgal','mütareke','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000001-0000-4000-f100-000000000001','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Mondros Mütarekesi Osmanlıyı çöküşe sürüklemiş ve işgal sürecini başlatmıştır","Yunan işgali Millî Mücadelenin tek nedenidir","İtilaf Devletleri Osmanlıyı yalnızca denizden işgal etmiştir","Mustafa Kemal Mondrosu bizzat imzalamıştır"]'::jsonb,0,'Metin, Mondros Mütarekesinin getirdiği hükümler çerçevesinde yaşanan işgalleri ve bunların millî bilinci nasıl uyandırdığını bütünüyle ele almaktadır.',4,1),
  ('f1000001-0000-4000-f100-000000000001','detail','Mütarekenin hangi maddesi İtilaf Devletlerine stratejik bölgeleri işgal yetkisi tanımıştır?','["3. madde","5. madde","7. madde","11. madde"]'::jsonb,2,'Metinde açıkça belirtildiği üzere, 7. madde İtilaf kuvvetlerine önemli gördükleri bölgeleri işgal etme hakkını vermiştir.',4,2),
  ('f1000001-0000-4000-f100-000000000001','detail','İzmirin işgali hangi devlet tarafından gerçekleştirilmiştir?','["İngiltere","Fransa","İtalya","Yunanistan"]'::jsonb,3,'Metne göre İzmir ve çevresi Yunan kuvvetleri tarafından 15 Mayıs 1919da işgal edilmiştir.',4,3),
  ('f1000001-0000-4000-f100-000000000001','vocabulary','Metinde geçen fiilî sözcüğünün anlamı aşağıdakilerden hangisidir?','["yasal","teorik","eylemsel ve gerçek anlamda","geçici"]'::jsonb,2,'Fiilî sözcüğü gerçek, somut ve eylem bazında olan anlamına gelir; hukuki değil pratik gerçekliği ifade eder.',4,4),
  ('f1000001-0000-4000-f100-000000000001','inference','Metne göre Mondros Mütarekesinin imzalanması nasıl bir sonuç doğurmuştur?','["Osmanlı halkını tamamen teslim olmaya razı etmiştir","Millî Mücadelenin ruhsal ve örgütsel temellerini hazırlamıştır","İtilaf Devletleri arasında kalıcı bir birliktelik sağlamıştır","Anadolodaki direnişi tamamen bastırmıştır"]'::jsonb,1,'İşgallerin ve yaşanan psikolojik kırılmanın millî bilinci uyandırdığı ve Millî Mücadelenin zeminini oluşturduğu metinden çıkarılabilir.',4,5);

  -- ============================================================
  -- TEXT 2: Kurtuluş Savaşının Stratejik Dönüm Noktaları
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000002-0000-4000-f100-000000000002',
    'Kurtuluş Savaşı''nın Stratejik Dönüm Noktaları',
    'AYT Tarih',
    'AYT',
    4,
    448,
    3,
    $b$
Türk Kurtuluş Savaşı, düzensiz çete müfrezelerinden disiplinli bir ordu örgütlenmesine geçişin yaşandığı, diplomatik ve askeri boyutların iç içe geçtiği son derece karmaşık bir süreç olarak tarihe kazınmıştır. Mustafa Kemal önderliğinde yürütülen bu mücadelede bir dizi kritik dönüm noktası, savaşın seyrini belirleyici biçimde değiştirmiş ve sonucunu şekillendirmiştir.

Birinci İnönü Muharebesi, Ocak 1921'de Batı Anadolu'da Yunan kuvvetlerine karşı kazanılan bu zafer, henüz toparlanma aşamasında olan Türk düzenli ordusunun savaş meydanındaki ilk önemli başarısı olmuştur. Zafer salt askeri açıdan değil, siyasi boyutuyla da son derece belirleyici bir etki yaratmıştır: Londra Konferansı'nda Türk tarafı daha güçlü bir konumdan müzakere masasına oturabilmiş ve uluslararası kamuoyunun Millî Mücadele'yi ciddiye alması sağlanmıştır.

İkinci İnönü Muharebesi'nin ardından Yunan ordusu büyük bir taarruzla Sakarya Nehri'ne dek ilerlemiş; Ağustos-Eylül 1921'de 22 gün 22 gece süren kıyasıya bir meydan savaşı yaşanmıştır. Sakarya Meydan Muharebesi olarak tarihe geçen bu çarpışmada Mustafa Kemal, Türk kuvvetlerini bizzat komuta etmiş; ordu son derece kritik bir süreçte yeniden örgütlenmiş ve Yunan ilerleyişi durdurulmuştur. Bu zafer, Mustafa Kemal'e Gazi unvanının verilmesine ve Mareşal rütbesine yükseltilmesine zemin hazırlamıştır.

1922 yılına gelindiğinde inisiyatif tamamen Türk ordusuna geçmiş durumdaydı. 26 Ağustos 1922'de başlayan Büyük Taarruz, Afyonkarahisar bölgesinden düzenlenen ve Yunan savunma hatlarını kısa sürede parçalayan güçlü bir operasyon olarak hayata geçirilmiştir. İzleyen Başkomutan Meydan Muharebesi'nde Yunan ordusu ağır bir yenilgiye uğratılmış, 9 Eylül 1922'de ise Türk süvari birlikleri İzmir'e zaferle girmiştir. Mudanya Mütarekesi'nin imzalanmasıyla ateşkes sağlanmış ve ardından müzakere süreci başlamıştır.

Bu stratejik sürecin başarısında yalnızca askeri beceri değil, TBMM'nin kurumsal olarak güçlendirilmesi, ulusal ekonominin savaş gereksinimlerine göre yeniden yapılandırılması ve ittifak ilişkilerinin ustalıkla yönetilmesi de belirleyici rol oynamıştır. 1921'de Sovyetler Birliği ile imzalanan Kars Antlaşması, Fransızlarla müzakere edilen Ankara İtilafnamesi ve İtalyanların Anadolu'dan çekilmesi, Millî Mücadele'yi uluslararası arenada önemli ölçüde güçlendirmiş ve tecrit politikasını fiilen etkisizleştirmiştir.
    $b$,
    ARRAY['tarih','Kurtuluş Savaşı','İnönü','Sakarya','Büyük Taarruz','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000002-0000-4000-f100-000000000002','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Kurtuluş Savaşı yalnızca askeri bir harekâttır","Kurtuluş Savaşının başarısı stratejik, siyasi ve diplomatik unsurların bir bileşimidir","Sakarya Muharebesi savaşın tek belirleyici noktasıdır","Büyük Taarruz beklenmedik bir gelişme olarak ortaya çıkmıştır"]'::jsonb,1,'Metin, stratejik dönüm noktalarını hem askeri hem siyasi hem de diplomatik boyutlarıyla ele alarak bütüncül bir çerçeve sunmaktadır.',4,1),
  ('f1000002-0000-4000-f100-000000000002','detail','Sakarya Meydan Muharebesi kaç gün kaç gece sürmüştür?','["11 gün 11 gece","15 gün 15 gece","22 gün 22 gece","30 gün 30 gece"]'::jsonb,2,'Metinde Sakarya Meydan Muharebesi''nin 22 gün 22 gece sürdüğü açıkça belirtilmiştir.',4,2),
  ('f1000002-0000-4000-f100-000000000002','detail','Büyük Taarruz hangi tarihte ve nereden başlatılmıştır?','["18 Temmuz 1922, İzmir cephesinden","26 Ağustos 1922, Afyonkarahisar bölgesinden","15 Mayıs 1922, Bursadan","1 Eylül 1922, Ankaradan"]'::jsonb,1,'Metne göre Büyük Taarruz 26 Ağustos 1922de Afyonkarahisar bölgesinden başlatılmıştır.',4,3),
  ('f1000002-0000-4000-f100-000000000002','vocabulary','Metinde geçen inisiyatif sözcüğünün anlamı aşağıdakilerden hangisidir?','["geri çekilme","üstünlük ve öncülük","diplomatik ilişki","ateşkes anlaşması"]'::jsonb,1,'İnisiyatif sözcüğü bir durumda önce hareket etme ve üstünlüğü ele geçirme anlamına gelir.',4,4),
  ('f1000002-0000-4000-f100-000000000002','inference','Birinci İnönü Muharebesi''nin siyasi önemi nedir?','["Yunanistanı barış müzakerelerine zorlamıştır","Türk tarafının Londra Konferansında daha güçlü bir konumda müzakere etmesini sağlamıştır","Sovyetler Birliğinin Türkiyeye destek vermesini sağlamıştır","Fransızların Anadoluyu terk etmesine yol açmıştır"]'::jsonb,1,'Metne göre Birinci İnönü zaferi, Türk tarafının Londra Konferansında daha güçlü bir konumda müzakere etmesine imkân tanımıştır.',4,5);

  -- ============================================================
  -- TEXT 3: Lozan Barış Antlaşması
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000003-0000-4000-f100-000000000003',
    'Lozan Barış Antlaşması ve Türkiye''nin Uluslararası Tanınması',
    'AYT Tarih',
    'AYT',
    4,
    455,
    3,
    $b$
Lozan Barış Antlaşması, 24 Temmuz 1923'te İsviçre'nin Lozan şehrinde imzalanmış ve Türkiye Cumhuriyeti'nin uluslararası hukuktaki egemenliğini tescil eden temel belge olma niteliği kazanmıştır. Bu antlaşma; Birinci Dünya Savaşı'nın ardından İtilaf Devletleri'nin Osmanlı'ya dayattığı ve TBMM tarafından reddedilen Sevr Antlaşması'nın hukuken geçersiz kılınmasını da beraberinde getirmiştir. Lozan, sadece bir barış belgesi olmayıp yeni kurulan Türk devletinin uluslararası tanınma sürecinin çapraz noktası olarak değerlendirilmelidir.

Müzakereler, Kasım 1922'de başlamış ve yaklaşık sekiz ay süren zorlu bir sürecin ardından sonuçlanmıştır. İsmet İnönü başkanlığındaki Türk heyeti, İngiltere, Fransa, İtalya ve Yunanistan gibi güçlü devletlerle tek tek yüzleşmek zorunda kalmıştır. Boğazlar meselesi, Musul'un geleceği, Ege adaları ve azınlık hakları başta olmak üzere pek çok kritik konu, uzun ve zorlu bir diplomatik mücadelenin gündem maddeleri arasında yer almıştır.

Antlaşmanın en tartışmalı boyutlarından biri, Türk ve Rum halkları arasında gerçekleştirilen nüfus mübadelesidir. Dini kimliğe dayalı olarak şekillendirilen bu zorunlu mübadele kapsamında yaklaşık 1,2 milyon Rum Ortodoks Hristiyan Anadolu'yu terk ederek Yunanistan'a göç ederken; yaklaşık 400.000 Müslüman ise Yunanistan'dan Türkiye'ye yerleştirilmiştir. Bu demografik dönüşüm, toplumsal açıdan son derece ağır bir deneyim olarak yaşanmış; ancak farklı bir perspektiften bakıldığında mezhepsel ve millî anlaşmazlıkların kronik bir kaynağını ortadan kaldırmıştır.

Boğazlar meselesi açısından değerlendirildiğinde, Türkiye üs tesisi ve savaş gemisi geçişi konularında önemli kısıtlamaları kabul etmek durumunda kalmış; bununla birlikte kendi topraklarında tam bir egemenlik hakkı elde etmiştir. 1936 yılında imzalanan Montrö Sözleşmesi ise Türkiye'ye Boğazlar üzerinde çok daha geniş bir denetim yetkisi tanımıştır.

Musul meselesi, antlaşma metninde nihai bir çözüme kavuşturulamamış ve Irak'ın mandater yöneticisi sıfatıyla İngiltere ile müzakere edilmek üzere ertelenmiştir. 1926'da Milletler Cemiyeti'nin Musul'u İngiliz mandasına bağlaması kararının ardından Türkiye bu bölgeden aldığı petrol gelirlerinin belirli bir bölümüne kısmen hak kazanmayı kabul etmiştir.

Lozan Antlaşması; eşit statülü devletler arasında imzalanan bir barış metni olarak kabul edilmesi, kapitülasyonların tamamen kaldırılması ve tam egemenliğin tanınması bakımından Sevr Antlaşması'ndan köklü biçimde ayrışmaktaydı. Bu belge, yeni Türk devletine hayatiyetini sürdürmesi için gereken uluslararası meşruiyeti sağlamış ve Cumhuriyet'in kuruluş sürecinin önündeki en önemli dış engeli ortadan kaldırmıştır.
    $b$,
    ARRAY['tarih','Lozan','antlaşma','egemenlik','nüfus mübadelesi','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000003-0000-4000-f100-000000000003','main_idea','Bu metnin temel konusu aşağıdakilerden hangisidir?','["Musulun İngiltereye bırakılması","Lozan Antlaşmasının Türkiyenin uluslararası tanınmasındaki belirleyici önemi","Nüfus mübadelesinin demografik sonuçları","Boğazlar üzerindeki egemenlik anlaşmazlığı"]'::jsonb,1,'Metin, Lozanı yeni Türk devletinin uluslararası tanınmasını sağlayan temel belge olarak ele almakta ve onun çok boyutlu önemini vurgulamaktadır.',4,1),
  ('f1000003-0000-4000-f100-000000000003','detail','Nüfus mübadelesi hangi kritere göre belirlenmiştir?','["Dil","Etnik köken","Din","Coğrafi konum"]'::jsonb,2,'Metne göre mübadele, etnik değil dinî kimliğe dayalı olarak şekillendirilmiştir.',4,2),
  ('f1000003-0000-4000-f100-000000000003','detail','Musul meselesi Lozanda nasıl sonuçlanmıştır?','["Türkiyeye bırakılmıştır","Fransa mandasına verilmiştir","Nihai çözüme kavuşturulamamış, İngiltere ile müzakereye bırakılmıştır","Milletler Cemiyeti bünyesinde ortak yönetim kararlaştırılmıştır"]'::jsonb,2,'Metne göre Musul meselesi Lozanda çözüme kavuşturulamamış ve İngiltere ile ikili müzakereye bırakılmıştır.',4,3),
  ('f1000003-0000-4000-f100-000000000003','vocabulary','Metinde geçen kapitülasyon sözcüğünün anlamı aşağıdakilerden hangisidir?','["savaş ilan etme hakkı","yabancılara tanınan ayrıcalıklar ve muafiyetler","anayasal haklar","toprak ilhakı"]'::jsonb,1,'Kapitülasyonlar; yabancı devletlere ve vatandaşlarına tanınan özel ayrıcalıkları ifade eden ve egemenliği kısıtlayan düzenlemelerdir.',4,4),
  ('f1000003-0000-4000-f100-000000000003','inference','Lozan ile Sevr arasındaki temel fark nedir?','["Lozan daha az toprak kaybı öngörmektedir","Lozan eşit devletler arasında imzalanmış, Sevr ise dayatmacı bir belge olmuştur","Sevr daha kısa sürede müzakere edilmiştir","Lozan yalnızca Yunanistan ile yapılmış ikili bir antlaşmadır"]'::jsonb,1,'Metne göre Lozan; eşit statülü devletler arasında imzalanmış, kapitülasyonları kaldırmış ve tam egemenliği tanımıştır. Sevr ise tamamen dayatmacı bir nitelik taşımaktaydı.',4,5);

  -- ============================================================
  -- TEXT 4: Cumhuriyetin İlanı ve Tek Parti Dönemi
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000004-0000-4000-f100-000000000004',
    'Cumhuriyetin İlanı ve Tek Parti Dönemi',
    'AYT Tarih',
    'AYT',
    4,
    450,
    3,
    $b$
29 Ekim 1923'te Türkiye Cumhuriyeti'nin resmen ilan edilmesi, yüzyıllık hanedanlık yönetiminden keskin bir kopuşu simgelemiş ve köklü bir yönetim biçimi değişikliğini fiilen hayata geçirmiştir. Bu dönüşüm, devlet yapısının hukuken yeniden tanımlanmasının çok ötesine geçerek, siyasi kültürün, toplumsal sözleşmenin ve ulusal kimliğin temelden yeniden inşa edilmesi anlamına da geliyordu.

Cumhurbaşkanı seçilen Mustafa Kemal, yönetim anlayışını Cumhuriyet Halk Fırkası (1924'te Cumhuriyet Halk Partisi adını alacak olan örgüt) aracılığıyla hayata geçirmeye çalışmıştır. 1924'teki kısa süreli Terakkiperver Cumhuriyet Fırkası denemesi ile 1930'daki Serbest Cumhuriyet Fırkası girişimi, Kemalist inkılap sürecinde siyasi çoğulculuğun sınırlarını fiilen test etmiş; ancak her iki parti de kısa sürede kapatılmak zorunda kalmıştır.

1924 Anayasası, ülkenin temel hukuki çerçevesini oluşturmuş; yasama yetkisi TBMM'de, yürütme yetkisi ise Cumhurbaşkanı ile kabine arasında paylaştırılmıştır. Ne var ki bu dönemde, zaman zaman güçlü bir şef figürünün inisiyatifini destekler nitelikte, son derece merkeziyetçi bir anlayışın hâkim olduğu görülmüştür. Yargının bağımsızlığı ve basın özgürlüğü gibi temel haklar ise pratikte ciddi kısıtlamalarla yüz yüze gelmiştir.

1925'te başlayan Şeyh Said İsyanı ve akabinde çıkarılan Takrir-i Sükûn Kanunu, hükümetin aldığı sert güvenlik önlemlerini meşrulaştırmanın hukuki zemini olarak kullanılmıştır. İstiklal Mahkemeleri; gazeteciler, muhalif siyasetçiler ve siyasi düzene tehdit olarak nitelendirilen kesimleri yargılamak üzere faaliyete geçirilmiştir. Bu dönem; inkılap hareketinin önündeki engelleri temizleme ve devlet kurumlarını sağlamlaştırma sürecinin hem stratejik hem de tartışmalı bir aşamasını temsil etmektedir.

Tek parti yönetimi 1946'ya değin kesintisiz sürmüştür. İkinci Dünya Savaşı'nın ardından patlak veren uluslararası demokratikleşme baskısı ve Batı ittifakına eklemlenme ihtiyacı, çok partili sisteme geçişi kaçınılmaz bir hal almıştır. Cumhuriyetin ilk yıllarında uygulanan tek parti modeli; modernleşme hamlelerini yukarıdan aşağıya doğru hayata geçirmek için bilinçli olarak benimsenen bir araç olmuştur. Bu model, güçlü devlet kapasitesi ile siyasi katılımın sınırlandırılmasını bir arada barındırmaktaydı.

Cumhuriyetin ilk çeyrek asrı; atılımcı ve dönüştürücü bir hükümet anlayışıyla otoriter bir kontrol mekanizmasının bir arada var olduğu, modern Türk kimliğinin inşasında belirleyici izler bırakan çok yönlü bir deneyimi yansıtmaktadır.
    $b$,
    ARRAY['tarih','Cumhuriyet','tek parti','CHP','Atatürk','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000004-0000-4000-f100-000000000004','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Cumhuriyet ilanı saltanatın devamı niteliğindedir","Cumhuriyetin ilk yılları modernleşme ile otoriter kontrolü bir arada barındırmaktadır","Tek parti dönemi başarısız bir deneyim olmuştur","1924 Anayasası yargı bağımsızlığını eksiksiz güvence altına almıştır"]'::jsonb,1,'Metin; cumhuriyetin kuruluşunu, tek parti dönemini ve modernleşme ile siyasi kısıtlama arasındaki dengeyi bütüncül bir bakış açısıyla ele almaktadır.',4,1),
  ('f1000004-0000-4000-f100-000000000004','detail','Cumhuriyet Halk Fırkası hangi yıl Cumhuriyet Halk Partisi adını almıştır?','["1923","1924","1930","1946"]'::jsonb,1,'Metne göre parti, 1924 yılında CHP adını almıştır.',4,2),
  ('f1000004-0000-4000-f100-000000000004','detail','Tek parti yönetimi ne zamana kadar sürmüştür?','["1938","1940","1945","1946"]'::jsonb,3,'Metne göre tek parti yönetimi 1946ya kadar devam etmiş ve ardından çok partili sisteme geçilmiştir.',4,3),
  ('f1000004-0000-4000-f100-000000000004','vocabulary','Metinde geçen merkeziyetçi sözcüğünün anlamı aşağıdakilerden hangisidir?','["yerel yönetimlere geniş özerklik tanıyan","gücü merkezi bir otorite etrafında toplayan","demokratik temsili ön plana çıkaran","gücü çeşitli kurumlar arasında dengeli dağıtan"]'::jsonb,1,'Merkeziyetçi; otoritenin ve karar alma yetkisinin tek bir merkezi yapıda toplandığı sistemi tanımlar.',4,4),
  ('f1000004-0000-4000-f100-000000000004','inference','1930daki Serbest Cumhuriyet Fırkası deneyiminden çıkarılabilecek sonuç aşağıdakilerden hangisidir?','["Kemalist önderlik gerçek bir çoğulculuğu benimsemiştir","Halk muhalefete hazır değildi","Erken Cumhuriyet döneminde siyasi çoğulculuğun sınırlı tutulduğu görülmüştür","Parti hükümetin zayıfladığının bir işaretiydi"]'::jsonb,2,'Fırkanın kısa sürede kapatılması, dönemin inkılap süreciyle bağdaşmayan alternatiflere tahammül etmediğini ortaya koymaktadır.',4,5);

  -- ============================================================
  -- TEXT 5: Atatürk İnkılaplarının Modernleşme Boyutu
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000005-0000-4000-f100-000000000005',
    'Atatürk İnkılaplarının Modernleşme Boyutu',
    'AYT Tarih',
    'AYT',
    4,
    453,
    3,
    $b$
Atatürk döneminde gerçekleştirilen inkılaplar; hukuk, eğitim, alfabe, takvim ve kıyafetten din ile devlet arasındaki ilişkinin yeniden tanımlanmasına uzanan geniş bir yelpazeye yayılmış, köklü ve çok boyutlu bir dönüşümü temsil etmektedir. Bu inkılapların özünde, Türkiye'yi salt kurumsal bir modernleşmenin ötesine taşıyarak düşünsel ve kültürel düzlemde de çağdaş bir forma kavuşturma iddiası yatmaktaydı.

Hukuk alanındaki dönüşüm son derece kapsamlı biçimde ele alınmıştır. İslam hukukunun temel başvuru kaynağı olma niteliği ortadan kaldırılmış; 1926 yılında İsviçre'den uyarlanan Medeni Kanun uygulamaya konulmuştur. Bu düzenleme, kadın ve erkek arasında yasal eşitliği tesis etmiş, miras ve evlilik gibi temel konulardaki hukuki çerçeveyi kökten yeniden biçimlendirmiştir. Aynı yıl hayata geçirilen Türk Ceza Kanunu ve Ticaret Kanunu ise laik hukukun kapsamını genişleterek diğer alanlara da yaymıştır.

Eğitim alanında gerçekleştirilen reformlar sistematik ve yönlendirici bir nitelik taşımaktaydı. Medreseler kapatılmış, yeni devlet okulları kurulmuş; karma eğitim uygulamaya konulmuştur. 1924 yılında çıkarılan Tevhid-i Tedrisat Kanunu ile tüm eğitim kurumları Millî Eğitim Bakanlığı çatısı altında toplandı. 1928'de gerçekleştirilen alfabe reformu, Arap kökenli Osmanlı yazısının Latin harflerine dayanan yeni Türk alfabesiyle değiştirilmesini sağlamış ve hem okuma yazma öğretimini köklü biçimde dönüştürmüş hem de Türk dilinin yazılı ifade yeteneğini güçlendirmiştir.

Görünür semboller bakımından gerçekleştirilen değişiklikler de son derece çarpıcıydı. 1925'teki şapka reformu, erkekler için fesi yasaklayarak Avrupa tarzı başlıkları zorunlu hale getirmiş ve toplumsal direnişle yüzleşmek pahasına modernleşme iradesini gözler önüne sermiştir. Tekke ve zaviyelerin kapatılması ise tasavvuf yapılanmalarını hedef alarak alternatif otorite merkezlerini etkisizleştirmeye yönelik bir adım olmuştur.

Tüm bu inkılapları birbirine bağlayan düşünce çerçevesi laikliktir. İslam'ın devlet yönetimi üzerindeki kurumsal etkisi kırılmış; dini eğitim, kamusal politika ve kişisel statü belirlemesindeki rolü köklü biçimde sınırlandırılmıştır. Hilafetin 1924'te kaldırılması ise hem iç hem de uluslararası açıdan sembolik değer taşıyan ve dini kurumun devlet otoritesinden ayrıştırılmasını tamamlayan son ve belirleyici adımı oluşturmuştur.

Tarihçiler bu inkılaplara ilişkin farklı değerlendirmeler öne sürmektedir: Bir kesim için bu dönüşümler toplumun rızası alınmaksızın yukarıdan dayatılmış modernleşme hamlelerini temsil ederken; başka bir kesim için Türkiye'nin çağdaşlaşma sürecinin vazgeçilmez temeli olarak değerlendirilmektedir.
    $b$,
    ARRAY['tarih','inkılap','modernleşme','laiklik','Atatürk','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000005-0000-4000-f100-000000000005','main_idea','Bu metnin temel mesajı aşağıdakilerden hangisidir?','["Atatürk inkılapları yalnızca kıyafet değişikliğine odaklanmıştır","Atatürk inkılapları hukuki, eğitimsel ve kültürel alanlarda kapsamlı bir modernleşmeyi hedeflemiştir","İnkılaplar toplumsal bir uzlaşı zemininde hayata geçirilmiştir","Alfabe reformu en önemli değişiklik olarak öne çıkmaktadır"]'::jsonb,1,'Metin, inkılapların hukuk, eğitim, alfabe ve laiklik gibi birbirine bağlı pek çok alanı kapsayan geniş bir modernleşme programı olduğunu ortaya koymaktadır.',4,1),
  ('f1000005-0000-4000-f100-000000000005','detail','1926 Medeni Kanunu hangi ülkenin hukukundan uyarlanmıştır?','["Fransa","Almanya","İsviçre","İtalya"]'::jsonb,2,'Metne göre Medeni Kanun, İsviçre hukukundan uyarlanarak 1926da yürürlüğe girmiştir.',4,2),
  ('f1000005-0000-4000-f100-000000000005','detail','Tevhid-i Tedrisat Kanunu ne zaman çıkarılmıştır?','["1923","1924","1925","1928"]'::jsonb,1,'Metne göre Tevhid-i Tedrisat Kanunu 1924 yılında çıkarılmış ve tüm eğitim kurumlarını Millî Eğitim Bakanlığına bağlamıştır.',4,3),
  ('f1000005-0000-4000-f100-000000000005','vocabulary','Metinde geçen laiklik kavramı aşağıdakilerden hangisini ifade etmektedir?','["İslamın toplumsal yaşamdaki rolünü güçlendirme","Din ile devlet işlerinin birbirinden ayrılması","Yalnızca kıyafet ve dış görünüşün değiştirilmesi","Eğitimin yabancı modellere göre yeniden düzenlenmesi"]'::jsonb,1,'Laiklik; devlet yönetiminde dini ilkelerin değil, akılcı ve laik ilkelerin esas alınması anlamına gelir.',4,4),
  ('f1000005-0000-4000-f100-000000000005','inference','İnkılapların yukarıdan aşağıya dayatma biçiminde nitelendirilmesinin nedeni aşağıdakilerden hangisidir?','["İnkılaplar yabancı danışmanlar tarafından tasarlanmıştır","Değişiklikler tabandan gelen halk iradesiyle değil devlet eliyle hayata geçirilmiştir","İnkılaplar etkisiz kalmış ve kalıcılık kazanamamıştır","Yalnızca kentli kesimler bu dönüşümden yararlanmıştır"]'::jsonb,1,'Metin, değişikliklerin toplumun rızası alınmaksızın hayata geçirildiğini belirterek bazı tarihçilerin bu dönüşümleri yukarıdan aşağıya dayatma olarak değerlendirdiğini ortaya koymaktadır.',4,5);

  -- ============================================================
  -- TEXT 6: İkinci Dünya Savaşında Türkiyenin Tutumu
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000006-0000-4000-f100-000000000006',
    'İkinci Dünya Savaşı''nda Türkiye''nin Tutumu',
    'AYT Tarih',
    'AYT',
    4,
    447,
    3,
    $b$
İkinci Dünya Savaşı boyunca Türkiye, Müttefik ve Mihver bloklarının baskılarını ustaca dengeleyerek dikkatli bir tarafsızlık politikası izlemiştir. Bu siyaset; bazı çevrelerce ilkesel bir tutarsızlık olarak eleştirilmiş, başka çevrelerce ise kırılgan bir ulusal güvenlik ortamında izlenen gerçekçi bir devlet aklı olarak takdirle karşılanmıştır.

Türkiye, 1939'da hem İngiltere ve Fransa ile Üçlü İttifak'ı imzalamış hem de 1941'de Almanya ile Saldırmazlık Paktı'nı akdetmiştir. Bu her iki adım da dönemin gerçekçi güvenlik hesaplamalarını yansıtıyor; Türkiye, Birinci Dünya Savaşı'ndaki talihsiz ittifak deneyiminin ve ardından yaşanan yıkımın bedelini bir daha ödemekten kaçınmaya kararlıydı.

Türkiye'yi savaşa çekmeye çalışan başlıca baskı unsurlarından biri, Almanya'dan Türkiye'ye ihraç edilen krom mineraliydi. Krom, savaş döneminin stratejik hammaddeleri arasında yer alıyor ve Almanya bu minerali silahlı kuvvetlerine yönelik çelik üretiminde büyük ölçüde kullanıyordu. Müttefikler ise Almanya'ya yapılan bu ihracatı engellemek için Türkiye üzerinde yoğun baskı uygulamaktaydı.

Winston Churchill önderliğinde İngiltere, özellikle Adana görüşmelerinin de gündeminde olan Türkiye'nin savaşa dahil olması konusunda ısrarcı olmuştur. Ancak Türk liderler bu baskıya karşı direncini korumayı başarmıştır. Türkiye'nin Doğu Anadolu'sunda Sovyet baskısına maruz kalma riski ve savaş döneminin yıkıcı ekonomik koşulları, bu direncin gerisindeki temel gerekçeler arasındaydı.

Türkiye, Müttefiklerin ısrarcı baskıları karşısında yalnızca sembolik bir angajman niteliği taşıyan ve resmi bir savaş ilanını içeren adımı ancak Şubat 1945'te atmıştır. Savaşın bu kritik son aşamasında atılan bu adım, Türkiye'nin kurucu üyeler arasında yer aldığı Birleşmiş Milletler'e üyeliğini mümkün kılmış; aynı zamanda siyasi ve ekonomik yükü en ağır dönemlerde tarafsızlığını korumuş bir ülkeye savaş sonrası düzeninde meşru bir yer edinme imkânı tanımıştır.

Savaş yıllarının Türkiye üzerindeki sosyal ve ekonomik etkileri son derece ağır olmuştur. 1942'de çıkarılan Varlık Vergisi, fiilen gayrimüslim azınlıkları orantısız biçimde hedef almış ve bu grupların önemli bir bölümünü ekonomik çöküşe sürüklemiştir. Uluslararası kuruluşlar ve azınlık toplulukları tarafından sert biçimde eleştirilen bu uygulama, dönemin sosyal politikasının en çarpıcı çelişkili boyutlarından birini oluşturmuştur.
    $b$,
    ARRAY['tarih','İkinci Dünya Savaşı','tarafsızlık','Türkiye','krom','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000006-0000-4000-f100-000000000006','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Türkiye İkinci Dünya Savaşında Almanyayı açıkça desteklemiştir","Türkiye güvenlik çıkarlarını ön planda tutan bir denge politikası izlemiştir","İngiltere Türkiye üzerinde hiçbir etki gücü oluşturamamıştır","Varlık Vergisi savaş döneminin ekonomisini canlandırmıştır"]'::jsonb,1,'Metin, Türkiyenin her iki blokla ilişkilerini ustaca dengelemesine ve savaşın dışında kalmayı başarmasına odaklanmaktadır.',4,1),
  ('f1000006-0000-4000-f100-000000000006','detail','Türkiye Almanya ile hangi yılda Saldırmazlık Paktı imzalamıştır?','["1939","1940","1941","1943"]'::jsonb,2,'Metne göre Almanya ile Saldırmazlık Paktı 1941de imzalanmıştır.',4,2),
  ('f1000006-0000-4000-f100-000000000006','detail','Varlık Vergisi kimler üzerinde orantısız bir yük oluşturmuştur?','["Büyük toprak sahipleri","Ordudaki subaylar","Gayrimüslim azınlıklar","Devlet memurları"]'::jsonb,2,'Metne göre Varlık Vergisi gayrimüslim azınlıkları orantısız biçimde etkilemiş ve bu grupların büyük çoğunluğunu ekonomik çöküşe sürüklemiştir.',4,3),
  ('f1000006-0000-4000-f100-000000000006','vocabulary','Metinde geçen angajman sözcüğünün anlamı aşağıdakilerden hangisidir?','["barış anlaşması","bir ittifaka katılma ve taahhütte bulunma","ekonomik yaptırım","toprak bütünlüğünü güvence altına alma"]'::jsonb,1,'Angajman sözcüğü; bir çatışmaya ya da ittifaka katılma ve bu kapsamda taahhütte bulunma anlamına gelir.',4,4),
  ('f1000006-0000-4000-f100-000000000006','inference','Türkiyenin 1945e kadar resmen savaşa girmemesinin gerisindeki temel gerekçe nedir?','["Almanyayı tercih ettiği için","Birinci Dünya Savaşındaki deneyimden çıkarılan dersler doğrultusunda çatışmadan uzak kalmayı seçtiği için","İngiliz baskısının yetersiz kaldığı için","Askeri gücünün yetersiz olduğunu düşündüğü için"]'::jsonb,1,'Metne göre Türk liderler, Birinci Dünya Savaşındaki talihsiz ittifak deneyiminin yarattığı derinden gelen bir çekimserlikle hareket etmişlerdir.',4,5);

  -- ============================================================
  -- TEXT 7: Soğuk Savaş Dönemi ve Türkiyenin NATO Üyeliği
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000007-0000-4000-f100-000000000007',
    'Soğuk Savaş Dönemi ve Türkiye''nin NATO Üyeliği',
    'AYT Tarih',
    'AYT',
    4,
    451,
    3,
    $b$
İkinci Dünya Savaşı'nın sona ermesinin ardından uluslararası düzen kökten bir dönüşüme sahne olmuş; bu süreçte Türkiye kendisini iki süper gücün rekabetinin tam ortasında bulmuştur. Sovyetler Birliği'nin Türkiye üzerindeki toprak taleplerini ve Boğazlar üzerinde ortak denetim isteklerini açıkça dile getirmesi, Batı ile ilişkilerin pekiştirilmesinin kaçınılmaz bir zorunluluk haline geldiğini gözler önüne sermiştir.

1947'de ilan edilen Truman Doktrini, Türkiye için kritik bir dönüm noktası olmuştur. ABD Başkanı Harry Truman'ın Kongre'ye sunduğu konuşmada Yunanistan ile Türkiye'nin Sovyet nüfuz alanına düşmemesi için açık destek taahhüdünde bulunulmuştu. Bu çerçevede Türkiye, önemli miktarda askeri ve ekonomik yardım almaya başlamış; bu yardım, Batı ittifakının oluşumuna giden süreçte kritik bir rol üstlenmiştir.

Türkiye, 1952 yılında örgüte kabul edilerek NATO üyesi olmuştur. Bu adımın hemen öncesinde, büyük güçler arasında alevlenmekte olan Kore Savaşı'na asker sevk etmesi, Türkiye'nin güvenilir bir ittifak ortağı olduğunu somut biçimde kanıtlamıştır. Türk birliklerinin Kore'deki üstün performansı, NATO üyelerinin gözünde Türkiye'nin savunma kabiliyetlerine ilişkin güveni önemli ölçüde artırmıştır.

NATO üyeliği, hem önemli kazanımlar hem de ciddi kısıtlamalar beraberinde getirmiştir. Kazanımlar arasında Sovyet tehdidine karşı güvenlik garantisi, askeri teçhizat ve eğitim desteği ile Batı kurumsal ağlarına eklemlenme yer almaktaydı. Kısıtlamalar açısından ise Türkiye'nin siyasi özerkliğinin belirli ölçüde sınırlandırıldığı, Batı standartlarına uyum baskısının arttığı ve ABD'nin bölgesel çatışmalardaki çıkarlarıyla sürtüşme riskinin ortaya çıktığı görülmüştür.

Küba Füze Krizi (1962), bu gerilimi gün yüzüne çıkaran çarpıcı bir örnek oluşturmaktadır. ABD, Sovyetlerin Küba'daki füzelerini geri çekmesi karşılığında Türkiye'deki Jupiter füzelerini gizlice kaldırma yolunu seçmiş; bu adım Türk yetkililerini devre dışı bırakmış ve ikili ilişkilerde ciddi bir güven sarsıntısı yaratmıştır.

NATO üyeliği, Türkiye'nin İkinci Dünya Savaşı'nın ardından benimsediği genel dış politika rotasının temel bileşenlerinden birini oluşturmuştur. Ne var ki bu ortaklık her zaman sorunsuz işlememiş; 1974 Kıbrıs Harekâtı'nın ardından ABD'nin uyguladığı silah ambargosu ve hizalama konusundaki defalarca yaşanan anlaşmazlıklar başta olmak üzere ilişkiye kriz dönemleri damgasını vurmuştur.
    $b$,
    ARRAY['tarih','NATO','Soğuk Savaş','Truman','Kore','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000007-0000-4000-f100-000000000007','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Türkiye NATOya katılımını pişmanlıkla karşılamıştır","Türkiyenin Soğuk Savaş dönemi dış politikası fırsatlar ve gerilimler içeren NATO eksenli bir seyir izlemiştir","NATO üyeliği Türkiyeye tam bir siyasi özerklik sağlamıştır","Kore Savaşındaki katılım gereksiz bir hataydı"]'::jsonb,1,'Metin, Türkiyenin NATO üyeliğini hem faydaları hem de kısıtlamalarıyla dengeli bir bakış açısıyla ele almaktadır.',4,1),
  ('f1000007-0000-4000-f100-000000000007','detail','Truman Doktrini hangi yılda ilan edilmiştir?','["1945","1947","1950","1952"]'::jsonb,1,'Metne göre Truman Doktrini 1947de ilan edilmiş ve Türkiyeye önemli miktarda yardım sağlanmasının önünü açmıştır.',4,2),
  ('f1000007-0000-4000-f100-000000000007','detail','Türkiye NATOya hangi yılda üye olmuştur?','["1949","1950","1952","1955"]'::jsonb,2,'Metne göre Türkiye 1952 yılında NATOya kabul edilmiştir.',4,3),
  ('f1000007-0000-4000-f100-000000000007','vocabulary','Metinde geçen özerklik sözcüğünün anlamı aşağıdakilerden hangisidir?','["mali sorumluluk","diğerlerinden bağımsız olarak hareket edebilme kapasitesi","askeri güç","diplomatik tanınma"]'::jsonb,1,'Özerklik; bir devletin başkalarından bağımsız biçimde karar alabilme ve hareket edebilme kapasitesini ifade eder.',4,4),
  ('f1000007-0000-4000-f100-000000000007','inference','Küba Füze Krizi sırasında Jupiter füzelerinin kaldırılması meselesinin Türk-Amerikan ilişkilerine yansıması ne olmuştur?','["İki ülke arasındaki ittifakı güçlendirmiştir","Türk yetkililerinin devre dışı bırakılması nedeniyle güven bunalımına yol açmıştır","Türkiyenin NATOdan çekilmesini gündeme getirmiştir","ABDnin Türkiyeden özür dilemesiyle sonuçlanmıştır"]'::jsonb,1,'Türkiyenin müzakerelerden dışlanması, ittifak içi güveni sarstığından ilişkide ciddi bir kırılmaya yol açmıştır.',4,5);

  -- ============================================================
  -- TEXT 8: Türkiyenin Fiziki Yapısı ve Dağılışı
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000008-0000-4000-f100-000000000008',
    'Türkiye''nin Fiziki Yapısı ve Dağılışı',
    'AYT Cografya',
    'AYT',
    4,
    449,
    3,
    $b$
Türkiye, dört bir yanı denizlerle çevrili ve yarımada konumundaki Anadolu ile Trakya'dan oluşan iki ana coğrafi birimden meydana gelmektedir. Yaklaşık 783.000 km² yüzölçümüyle ülke, son derece çeşitli fiziki coğrafya koşullarını bünyesinde barındırmaktadır. Anadolu'nun temel yapısı, çevresinde yüksek sıradağların uzandığı geniş bir iç plato niteliğindedir.

Kuzey Anadolu Dağları, Karadeniz kıyısı boyunca uzanmakta ve kıyıyla iç kesimler arasında güçlü bir iklim engeli oluşturmaktadır. Bu dağ kuşağı ülkenin kuzey kesimlerini bol yağışlı ve sık ormanlarla kaplı hale getirirken; Orta Anadolu Yaylası'nı karasal iklimin egemenliğinde bırakmakta ve step ile tahıl tarımı açısından son derece elverişli bir coğrafyayı ortaya çıkarmaktadır.

Toroslar ve Güneydoğu Toroslar, Akdeniz kıyısıyla iç kesimler arasında bir başka coğrafi engel niteliği taşımaktadır. Bu dağ kuşağının kıyıya bakan yamaçları, Akdeniz ikliminin etkisiyle turunçgil ve örtü bitkisi yetiştiriciliğine uygun bir ortam sunarken; iç yamaçlar çok daha sert iklim koşullarına sahiptir. Orta ve Doğu Toroslar arasında yer alan çeşitli yüksek zirveler, bölgede önemli coğrafi engeller oluşturmaktadır.

Doğu Anadolu'da yer alan Türkiye'nin en yüksek noktası Ağrı Dağı'dır. Bu bölge, Asya ile Avrupa arasındaki büyük karasal kütlelerin sıkıştırması sonucunda oluşan, tektonik açıdan son derece etkin bir yapı sergileyen ve deprem riskinin yüksek olduğu bir alandır. Van Gölü, Türkiye'nin en büyük gölü olma özelliğini taşımakta ve gölet oluşumuna zemin hazırlayan volkanik faaliyetlerle doğrudan bağlantılıdır.

Irmaklar açısından değerlendirildiğinde, Türkiye bölgesel su kaynaklarının önemli bir bölümünü beslemektedir. Fırat ve Dicle nehirleri Doğu Anadolu'dan doğarak Mezopotamya'ya akmakta; Kızılırmak ve Yeşilırmak ise Karadeniz'e dökülmektedir. Bu su kaynakları; sulama, enerji üretimi ve aşağı havza ülkeleriyle sürdürülen su politikası müzakereleri açısından hayati önem taşımaktadır.

Türkiye'nin fiziki coğrafyası, ülkenin nüfus dağılışını, tarımsal yapısını ve ekonomik faaliyetlerinin coğrafi konumlanmasını doğrudan biçimlendirmektedir. Kıyı bölgeler ekonomik olarak daha elverişli koşullar sunarken; özellikle doğu kesimlerindeki dağlık iç alanlar, ulaşım altyapısı ve ekonomik kalkınma açısından ciddi güçlükler barındırmaya devam etmektedir.
    $b$,
    ARRAY['coğrafya','fiziki yapı','dağlar','nehirler','Anadolu','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000008-0000-4000-f100-000000000008','main_idea','Bu metnin temel konusu aşağıdakilerden hangisidir?','["Türkiyenin tüm nehirleri","Türkiyenin fiziki yapısının genel özellikleri ve coğrafi önemi","Anadolunun iklim bölgeleri","Türkiyedeki deprem kuşakları"]'::jsonb,1,'Metin, Türkiyenin fiziki coğrafyasını dağlar, nehirler, yükseklikler ve bölgeler arası farklılıklar çerçevesinde bütüncül bir yaklaşımla ele almaktadır.',4,1),
  ('f1000008-0000-4000-f100-000000000008','detail','Türkiyenin en yüksek dağı hangisidir?','["Erciyes Dağı","Kaçkar Dağı","Ağrı Dağı","Süphan Dağı"]'::jsonb,2,'Metne göre Doğu Anadoluda bulunan en yüksek nokta Ağrı Dağıdır.',4,2),
  ('f1000008-0000-4000-f100-000000000008','detail','Van Gölünün oluşumu hangi coğrafi süreçle ilişkilendirilmektedir?','["Buzul erimesiyle biriken sular","Tektonik çöküntü","Volkanik faaliyetlerin gölet oluşturması","Nehir barajlaması"]'::jsonb,2,'Metne göre Van Gölünün oluşumu volkanik faaliyetlerle doğrudan bağlantılıdır.',4,3),
  ('f1000008-0000-4000-f100-000000000008','vocabulary','Metinde geçen tektonik sözcüğünün anlamı aşağıdakilerden hangisidir?','["iklimsel","yer kabuğu hareketleriyle ilgili","su kaynaklarına ilişkin","ekonomik"]'::jsonb,1,'Tektonik; yerkürenin katmanları olan levhalar ile bu levhaların hareketi sonucu ortaya çıkan depremler ve dağ oluşumu gibi yer kabuğu süreçleriyle ilgili kavramları kapsar.',4,4),
  ('f1000008-0000-4000-f100-000000000008','inference','Kuzey Anadolu Dağlarının kıyıyla iç kesimler arasındaki iklim farkı üzerindeki etkisi nasıl bir sonuç doğurmaktadır?','["Kıyıları kuru, iç kesimleri ise yağışlı kılar","İç kesimleri bol yağışlı tutarken kıyıları kuraklaştırır","Kıyıları bol yağışlı bırakırken iç kesimlerde karasal iklim koşulları oluşturur","Kuzey ve güney kıyılar arasında eşit bir yağış dağılışı yaratır"]'::jsonb,2,'Metne göre dağlar, kıyıdaki yağış kaynağını engelleyerek iç kesimlerin karasal iklim karakteri kazanmasına yol açmaktadır.',4,5);

  -- ============================================================
  -- TEXT 9: Türkiyede İklim Çeşitliliği ve Etkileyen Faktörler
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000009-0000-4000-f100-000000000009',
    'Türkiye''de İklim Çeşitliliği ve Etkileyen Faktörler',
    'AYT Cografya',
    'AYT',
    4,
    446,
    3,
    $b$
Türkiye, coğrafi konumu ve çeşitli iklim etkenlerinin bir araya gelmesiyle birden fazla iklim tipini bünyesinde barındıran ender ülkelerden biridir. Bu iklim çeşitliliği; tarımsal üretim, su yönetimi ve bölgesel kalkınma politikaları açısından hem güçlü fırsatlar hem de ciddi güçlükler sunmaktadır.

Akdeniz iklimi, güneybatı ve güney kıyı şeridinde belirgin biçimde kendini göstermektedir. Bu iklim tipinin karakteristik özelliği, yaz aylarının sıcak ve kurak geçmesi, kış aylarının ise ılıman ve yağışlı olmasıdır. Bu koşullar; zeytin, turunçgil ve şarap üzümü yetiştiriciliği için son derece elverişli bir ortam oluşturmaktadır. İzmir, Antalya ve Mersin gibi kentler bu iklim tipinin etkisi altındadır.

Karadeniz iklimi, kuzey kıyılarında belirleyici olup her mevsim düzenli ve yüksek miktarda yağış almaktadır. Çay, fındık ve mısır, bu iklim kuşağının önde gelen tarımsal ürünleri arasında yer almaktadır. Pontik Dağları'nın kıyıya paralel uzanışı ve kuzeyden esen yağışlı rüzgârları iç kesimlere geçirmemesi, bu bölgeye özgü farklı iklim koşullarının oluşmasında belirleyici rol oynamaktadır.

Orta Anadolu Yaylası'nda karasal iklim egemendir. Kışlar soğuk ve karla kaplı, yazlar ise sıcak ve oldukça kurak geçmektedir. Tahıl tarımı ve hayvancılık, bu iklim koşullarına uyum sağlamış başlıca geçim faaliyetleridir. Yıllık yağış miktarının oldukça düşük olduğu bu bölgede, su kaynaklarının verimli yönetimi büyük önem taşımaktadır.

Doğu Anadolu ise yüksek rakımın belirleyici etkisiyle kışları çok soğuk, yazları ise görece serin geçen bir iklim tipine sahiptir. Bu bölgede karlı geçen süre diğer bölgelere kıyasla oldukça uzundur. Güneydoğu Anadolu ise Suriye çölünün yakınlığı ve karakteristik kıyı özelliklerinden yoksunluğu nedeniyle yarı kurak bir iklim sergilemiş; geleneksel tarım açısından son derece güç koşulları barındırmıştır. Ancak Güneydoğu Anadolu Projesi (GAP) ile gerçekleştirilen sulama çalışmaları bölgenin tarımsal potansiyelini köklü biçimde dönüştürmüştür.

Türkiye'nin iklim çeşitliliğini şekillendiren başlıca etkenler arasında enlem ve boylam konumu, denizlerden uzaklık, yükselti ve dağ sıralarının uzanış yönü sayılabilir. Küresel iklim değişikliği, özellikle yağış düzenlerini değiştirmesi ve kuraklık dönemlerini uzatmasıyla birlikte bu coğrafi farklılıkları daha da belirgin hale getirme eğilimindedir.
    $b$,
    ARRAY['coğrafya','iklim','Akdeniz','Karadeniz','karasal','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000009-0000-4000-f100-000000000009','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Türkiyede yalnızca Akdeniz iklimi görülmektedir","Türkiye coğrafi yapısının etkisiyle birden fazla iklim tipine ev sahipliği yapmaktadır","İklim değişikliği Türkiyeyi olumsuz etkilememektedir","Karadeniz bölgesi Türkiyenin en verimli tarım alanıdır"]'::jsonb,1,'Metin; Türkiyenin çok sayıda iklim tipini barındırdığını ve bu durumu belirleyen etkenlerle sonuçlarını kapsamlı biçimde ele almaktadır.',4,1),
  ('f1000009-0000-4000-f100-000000000009','detail','Karadeniz bölgesine özgü tarımsal ürünler arasında aşağıdakilerden hangisi yer almaktadır?','["Zeytinyağı ve turunçgil","Tahıl ve hayvancılık","Çay, fındık ve mısır","Pamuk ve tütün"]'::jsonb,2,'Metne göre Karadeniz bölgesinin başlıca tarım ürünleri çay, fındık ve mısırdır.',4,2),
  ('f1000009-0000-4000-f100-000000000009','detail','GAP projesi hangi bölgenin tarımsal potansiyelini dönüştürmüştür?','["Doğu Anadolu","Orta Anadolu","Güneydoğu Anadolu","İç Batı Anadolu"]'::jsonb,2,'Metne göre GAP sulama projeleri Güneydoğu Anadolunun tarımsal kapasitesini köklü biçimde değiştirmiştir.',4,3),
  ('f1000009-0000-4000-f100-000000000009','vocabulary','Metinde geçen yarı kurak kavramı aşağıdakilerden hangisini ifade etmektedir?','["Yıl boyunca çok yağışlı bir iklim","Çöllerle karşılaştırıldığında biraz daha fazla yağış alan, kuraklığın önemli ölçüde hissedildiği bir iklim","Dört mevsimi belirgin biçimde yaşanan ılıman bir iklim","Sadece yazın kurak, kışın ise bol yağışlı geçen bir iklim"]'::jsonb,1,'Yarı kurak iklim; kurak olmakla birlikte tam çöl koşullarına ulaşmayan, kısıtlı yağış alan bölgeleri tanımlar.',4,4),
  ('f1000009-0000-4000-f100-000000000009','inference','Pontik Dağlarının Karadeniz bölgesinin iklim koşulları üzerindeki etkisi nasıl değerlendirilebilir?','["Kıyı bölgelerini kuraklığa karşı korumaktadır","Yağışlı hava kütlelerini iç kesimlere geçirerek yayılı bir ıslaklık oluşturmaktadır","Yağışlı hava kütlelerini iç kesimlere geçirmeyerek kıyı bölgelerini ıslak, iç kesimleri ise daha kurak bırakmaktadır","İklim üzerinde gözlemlenen etkisi son derece sınırlıdır"]'::jsonb,2,'Metne göre Pontik Dağları, yağışlı rüzgârları iç kesimlere geçirmeyerek kıyı bölgelerini nemli tutmakta ve bu ayrımı belirgin kılmaktadır.',4,5);

  -- ============================================================
  -- TEXT 10: Nüfus ve Göç Hareketleri: Türkiye Örneği
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000010-0000-4000-f100-000000000010',
    'Nüfus ve Göç Hareketleri: Türkiye Örneği',
    'AYT Cografya',
    'AYT',
    4,
    454,
    3,
    $b$
Türkiye'nin demografik yapısı, 20. yüzyılın ortalarından itibaren son derece hızlı bir dönüşüm sürecine girmiştir. Geç Osmanlı döneminden Cumhuriyet'in ilk yıllarına kalınan yaklaşık 12-13 milyon nüfus, bugün 85 milyonu aşmış bulunmaktadır. Bu devasa artış; hızlı bir sanayileşme sürecine, belirgin kentleşme eğilimlerine ve köklü biçimde değişen ekonomik yapılara zemin hazırlamıştır.

İç göç, çoğunlukla kırsal Anadolu'dan büyük sanayi şehirlerine doğru gerçekleşen bir hareket biçimini almıştır. 1950'lerden itibaren ivme kazanan sanayileşme süreci, İstanbul, Ankara ve İzmir'e yoğun bir nüfus akışını beraberinde getirmiş; şehirlerin eteklerinde kaçak yapılaşmanın ürünü olan ve gecekondu adıyla bilinen düzensiz yerleşim alanları hızla genişlemiştir. Bu kentsel yayılma, altyapı açığını, sosyal eşitsizlik sorunlarını ve yönetim güçlüklerini birlikte doğurmuştur.

Uluslararası göç boyutuna bakıldığında, 1950'ler ile 60'larda Türkiye misafir işçi anlaşmaları çerçevesinde Batı Almanya, Hollanda ve Belçika başta olmak üzere Avrupa ülkelerine on binlerce işçi ihraç etmiştir. Bu göçmenler ve onların torunları bugün Türkiye'nin diasporasını oluşturmakta ve ana vatanla güçlü sosyal, ekonomik ve kültürel bağlarını sürdürmektedir. Göçmenlerin gönderdiği dövizler onlarca yıl boyunca Türkiye'nin ödemeler dengesine kayda değer katkı sağlamıştır.

Türkiye'nin son dönemde karşılaştığı en büyük demografik meydan okuma, 2011 sonrasında başlayan Suriye iç savaşının yol açtığı göç dalgasıdır. Türkiye bugün yaklaşık 3,5-4 milyon kayıtlı Suriyeli mülteciyi barındırmakta ve bu rakamla dünyada en fazla mülteci kabul eden ülkeler arasında yer almaktadır. Bu durum; kentsel altyapı üzerinde ciddi baskı oluşturmakta, barınak ile hizmet talebini artırmakta ve zaman zaman toplumsal gerginliklerin fitilini ateşlemektedir.

Türkiye'nin coğrafi dağılımına bakıldığında belirgin bir eşitsizlik dikkat çekmektedir. İstanbul tek başına ülke nüfusunun yaklaşık yüzde on yedisini barındırmaktadır. Kuzeybatı Türkiye, Ankara çevresi ve Akdeniz kıyısındaki metropoller mıknatıs gibi nüfus çekerken; doğu ve iç kesimlerdeki iller genellikle göç vermeye devam etmektedir. Bu eşitsiz dağılım; kalkınma politikası tartışmalarının ve bölgesel yatırım önceliklendirmesinin odak noktalarından biri olmayı sürdürmektedir.
    $b$,
    ARRAY['coğrafya','nüfus','göç','kentleşme','mülteci','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000010-0000-4000-f100-000000000010','main_idea','Bu metnin temel konusu aşağıdakilerden hangisidir?','["Türkiyede göç politikasının tarihi","Türkiyenin nüfus artışı ile iç ve dış göç eğilimlerinin genel analizi","Türkiyenin Avrupa ile göç anlaşmaları","Gecekonduların Türk siyasetindeki rolü"]'::jsonb,1,'Metin; demografik büyüme, iç göç, dış işçi göçü ve mülteci hareketlerini kapsayan geniş bir perspektifle konuyu ele almaktadır.',4,1),
  ('f1000010-0000-4000-f100-000000000010','detail','Türk işçilerin göç ettiği başlıca Avrupa ülkeleri arasında aşağıdakilerden hangisi yer almaktadır?','["İspanya, Portekiz ve İsveç","Batı Almanya, Hollanda ve Belçika","İngiltere, Fransa ve İsviçre","Polonya, Çek Cumhuriyeti ve Avusturya"]'::jsonb,1,'Metne göre Türk işçiler ağırlıklı olarak Batı Almanya, Hollanda ve Belçikaya göç etmiştir.',4,2),
  ('f1000010-0000-4000-f100-000000000010','detail','Türkiye bugün yaklaşık kaç Suriyeli mülteciyi barındırmaktadır?','["Yaklaşık 1 milyon","Yaklaşık 2 milyon","Yaklaşık 3,5-4 milyon","Yaklaşık 6 milyon"]'::jsonb,2,'Metne göre Türkiye yaklaşık 3,5-4 milyon kayıtlı Suriyeli mülteciyi barındırmaktadır.',4,3),
  ('f1000010-0000-4000-f100-000000000010','vocabulary','Metinde geçen diaspora sözcüğünün anlamı aşağıdakilerden hangisidir?','["sınır ötesi ticaret ağları","ana vatanları dışında yaşayan ve dağılmış topluluklar","ülke içinde mevsimsel göç yapanlar","yabancı yatırım programları"]'::jsonb,1,'Diaspora; ana topraklarından uzakta, farklı ülkelere dağılmış ve bu ülkelerde yaşamaya devam eden toplulukları ifade eder.',4,4),
  ('f1000010-0000-4000-f100-000000000010','inference','Türkiyenin nüfus dağılımındaki belirgin eşitsizlikten çıkarılabilecek sonuç aşağıdakilerden hangisidir?','["Doğu bölgeleri daha yüksek yaşam standartlarına sahiptir","Bölgelerarası kalkınma farklılıkları devam etmekte ve politika önceliği gerektirmektedir","İstanbulun büyüklüğü Türkiye ekonomisi açısından sorun teşkil etmemektedir","Mülteciler yalnızca doğu bölgelerine yerleşmektedir"]'::jsonb,1,'Doğu illerinden batıya süregelen göç akışı ve nüfusun belirli bölgelerde yoğunlaşması, devam eden kalkınma eşitsizliklerini açıkça yansıtmaktadır.',4,5);

  -- ============================================================
  -- TEXT 11: Türkiyenin Ekonomik Coğrafyası ve Sektörel Analiz
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000011-0000-4000-f100-000000000011',
    'Türkiye''nin Ekonomik Coğrafyası ve Sektörel Analiz',
    'AYT Cografya',
    'AYT',
    4,
    458,
    3,
    $b$
Türkiye, tarım ağırlıklı bir yapıdan çeşitlenmiş ve sanayi ile hizmet sektörlerinin ön plana çıktığı karma bir ekonomiye dönüşüm sürecini tamamlamış bir ülkedir. Bu dönüşüm büyük ölçüde tamamlanmış olmakla birlikte; bölgesel eşitsizlikler, belirli hammaddelere olan dışa bağımlılık ve küresel piyasalara entegrasyon gibi meseleler yapısal kaygılar olarak gündemdeki yerini korumaktadır.

Tarım sektörü hâlâ önemini korumaktadır; GSYİH'ya katkısı görece azalmış olsa da aktif nüfusun önemli bir kesiminin geçimini bu sektörden sağladığı gerçeği değişmemektedir. Buğday, çay, tütün, pamuk, zeytin, üzüm ve çeşitli meyveler Türkiye'nin öne çıkan tarımsal ürünleri arasında yer almaktadır. Karadeniz bölgesi fındık ve çay, Ege bölgesi zeytin ve üzüm, Çukurova ise pamuk ve turunçgil üretiminde öne çıkmaktadır.

Sanayi sektörü önemli ölçüde çeşitlenmiş ve Türkiye otomotiv, tekstil, çimento ve elektrikli ekipman alanlarında güçlü bir üretim kapasitesi geliştirmiştir. Sanayi faaliyetleri coğrafi olarak Marmara, Ege ve Akdeniz kıyıları ile Orta Anadolu'nun belirli merkezlerinde yoğunlaşmaktadır. İstanbul ve çevresi tarihsel süreçte ülkenin ana sanayi bölgesi konumunu sürdürmektedir; bununla birlikte Organize Sanayi Bölgeleri (OSB) politikasıyla sanayi faaliyetleri diğer illere de yaygınlaştırılmaya çalışılmaktadır.

Turizm, son on yıllar içinde istihdam ve döviz kazancı açısından ekonomide giderek daha belirleyici bir konuma yükselmiştir. Akdeniz ve Ege kıyıları, İstanbul, Kapadokya ve çok sayıda arkeolojik miras alanı yoğun turist çekmektedir. Ne var ki sektörün siyasi istikrarsızlık dönemlerine olan hassasiyeti, olası kırılganlıkları gözler önüne sermekte ve sektörün büyümesini kimi zaman sekteye uğratmaktadır.

Enerji kaynakları söz konusu olduğunda Türkiye'nin bağımlılık kırılganlığı açıkça ortaya çıkmaktadır. Ülke; doğalgaz ve ham petrol ihtiyacının büyük bölümünü yurt dışından temin etmekte, bu durum hem ödemeler dengesini olumsuz etkilemekte hem de ciddi bir stratejik risk unsuru oluşturmaktadır. Bu bağımlılığı azaltmak amacıyla rüzgâr, güneş ve jeotermal kaynaklarda yenilenebilir enerji kapasitesi hızla artırılmaktadır.

Türkiye aynı zamanda Asya ile Avrupa arasındaki kritik bir enerji koridoru konumunda bulunmakta; hem boru hattı hem de sıvılaştırılmış doğalgaz terminalleri üzerinden önemli bir transit ülke işlevi üstlenmektedir. Coğrafi konumun sağladığı bu stratejik avantaj, diplomatik ilişkilerde Türkiye'ye kayda değer bir kaldıraç gücü kazandırmaktadır.
    $b$,
    ARRAY['coğrafya','ekonomi','tarım','sanayi','turizm','enerji','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000011-0000-4000-f100-000000000011','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Türkiye yalnızca tarım ekonomisine dayanmaktadır","Türkiyenin ekonomisi çok sektörlü bir yapıya dönüşmüş, ancak bölgesel eşitsizlikler ve enerji bağımlılığı sorunları sürmektedir","Turizm Türkiye ekonomisinin temel taşıdır","Sanayi faaliyetleri yalnızca İstanbulda yoğunlaşmaktadır"]'::jsonb,1,'Metin; ekonomik dönüşümü, sektörel çeşitliliği ve enerji bağımlılığı ile bölgesel dengesizlikler gibi yapısal sorunları bütüncül bir çerçevede sunmaktadır.',4,1),
  ('f1000011-0000-4000-f100-000000000011','detail','Karadeniz bölgesi hangi tarımsal ürünleriyle öne çıkmaktadır?','["Zeytin ve üzüm","Pamuk ve turunçgil","Fındık ve çay","Buğday ve mısır"]'::jsonb,2,'Metne göre Karadeniz bölgesi fındık ve çay üretiminde öne çıkmaktadır.',4,2),
  ('f1000011-0000-4000-f100-000000000011','detail','Türkiyenin enerji sektöründeki temel kırılganlığı nedir?','["Yenilenebilir enerji kapasitesinin yetersizliği","Doğalgaz ve petrol ithalatına yüksek oranda bağımlı olması","Kömür rezervlerinin tükenmesi","Nükleer santral altyapısının bulunmaması"]'::jsonb,1,'Metne göre Türkiye doğalgaz ve ham petrol ihtiyacının büyük bölümünü ithalat yoluyla karşılamakta, bu durum hem ödemeler dengesini hem de enerji güvenliğini olumsuz etkilemektedir.',4,3),
  ('f1000011-0000-4000-f100-000000000011','vocabulary','Metinde geçen transit sözcüğünün anlamı aşağıdakilerden hangisidir?','["son varış noktası","geçiş güzergâhı olarak işlev gören","üretici ve ihracatçı","tüketici ve ithalatçı"]'::jsonb,1,'Transit kavramı; malların ya da enerjinin son varış noktasına ulaşmadan geçiş yaptığı ara konumu tanımlar.',4,4),
  ('f1000011-0000-4000-f100-000000000011','inference','Türkiyenin Asya ile Avrupa arasındaki enerji koridoru konumu ona diplomatik olarak ne tür bir avantaj sağlamaktadır?','["Çevresindeki ülkeler üzerinde doğrudan siyasi kontrolü ele geçirme imkânı","Enerji iletim altyapısını stratejik bir araç olarak kullanarak diplomatik müzakerelerde kaldıraç gücü kazanma","Yakın çevresindeki ülkelerden bağımsız olarak kendi enerji fiyatlarını belirleme yetkisi","Tüm dış ticaret ortaklıklarından el çekme özgürlüğü"]'::jsonb,1,'Enerji koridoru konumu, Türkiyeye diğer ülkelerle yürütülen müzakerelerde diplomatik kaldıraç sağlamaktadır.',4,5);

  -- ============================================================
  -- TEXT 12: Bölgesel Kalkınma Farklılıkları ve Jeopolitik Konum
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f1000012-0000-4000-f100-000000000012',
    'Bölgesel Kalkınma Farklılıkları ve Jeopolitik Konum',
    'AYT Cografya',
    'AYT',
    4,
    456,
    3,
    $b$
Türkiye'nin farklı bölgeleri arasındaki kalkınma eşitsizlikleri, onlarca yıldır süregelen ve coğrafi, tarihsel ve siyasi boyutlarıyla birbirine bağlı çok katmanlı bir nitelik taşıyan bir sorun olma özelliğini korumaktadır. Bu farklılıklar yalnızca ekonomik büyüklükle sınırlı kalmamakta; gelir düzeyi, eğitim olanakları, sağlık hizmetlerine erişim ve altyapı kalitesi gibi kriterlerde de belirgin biçimde kendini göstermektedir.

Kalkınmışlık düzeyi açısından birbirinden keskin biçimde ayrışan iki bölge, Batı ve Doğu Türkiye'dir. Batı Türkiye; İstanbul, Ankara, İzmir ve Bursa gibi büyük metropolleri kapsamakta; sanayinin yoğunlaştığı, kişi başına gelirin yüksek olduğu ve altyapının güçlü olduğu bu bölge, ülke GSYİH'sının büyük bir bölümünü üretmektedir. Öte yandan Doğu ve Güneydoğu Anadolu, tarihsel süreçte çok daha düşük kişi başına gelir, sınırlı sanayi yatırımı ve yetersiz altyapı koşullarıyla nitelenmektedir.

Hükümet bu eşitsizlikleri gidermek amacıyla çok sayıda politika aracına başvurmuştur. Bu araçlar arasında Güneydoğu Anadolu Projesi (GAP) en kapsamlı olanıdır. Sulama sistemlerini, baraj yapımını ve hidroelektrik üretimini bir araya getiren bu çok bileşenli kalkınma programı; tarımsal verimi artırmış, istihdam olanakları yaratmış ve Güneydoğu Anadolu'nun kalkınma sürecine doğrudan katkı sunmuştur. Atatürk Barajı, bu programın en görünür ve simgesel yatırımlarından birini oluşturmaktadır.

Jeopolitik açıdan bakıldığında Türkiye, son derece stratejik öneme sahip bir konumda yer almaktadır. Hem Avrupa hem de Asya kıtasında toprak parçasına sahip olması; Türkiye'yi hem Batılı hem de Ortadoğu dinamikleriyle organik bağlar kurmaya yönlendirmektedir. Ülke, Avrupa Birliği ile uzun soluklu üyelik müzakerelerini sürdürmekte; NATO üyeliğini korumakta; Orta Doğu, Kafkasya ve Orta Asya'daki bölgesel süreçlerde ise etkin ve doğrudan bir aktör olarak yer almaktadır.

Boğazlar; İstanbul Boğazı ve Çanakkale Boğazı'ndan oluşmakta ve Karadeniz ile Akdeniz arasındaki deniz trafiğinin tamamen Türkiye'nin toprak suları üzerinden geçmesini zorunlu kılmaktadır. Montrö Sözleşmesi çerçevesinde Türkiye bu kritik geçiş güzergâhını denetlemekte; bu da ülkeye olağanüstü jeostratejik bir konum kazandırmaktadır.

Bölgesel eşitsizlik sorunuyla jeopolitik stratejik önemi bir arada değerlendirildiğinde, Türkiye iç kalkınma açıklarını kapatmak ile dış politikadaki potansiyelini en üst düzeyde kullanmak arasındaki köklü gerilimleri dengeleme çabasını sürdürmektedir.
    $b$,
    ARRAY['coğrafya','kalkınma','jeopolitik','GAP','Boğazlar','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('f1000012-0000-4000-f100-000000000012','main_idea','Bu metnin ana fikri aşağıdakilerden hangisidir?','["Türkiyenin jeopolitik önemi bölgesel kalkınma sorunlarından daha ağır basmaktadır","Türkiye hem iç kalkınma eşitsizlikleriyle hem de stratejik jeopolitik fırsatları yönetme güçlüğüyle yüzleşmektedir","Doğu Türkiye eşit kalkınma düzeyine ulaşmıştır","GAP projesi bölgesel dengesizlikleri tamamen gidermiştir"]'::jsonb,1,'Metin; bölgesel eşitsizlikleri ve Türkiyenin jeopolitik konumunu bir arada ele alarak bu iki boyut arasındaki gerilimi kapsamlı biçimde ortaya koymaktadır.',4,1),
  ('f1000012-0000-4000-f100-000000000012','detail','GAP projesi hangi bölgede hayata geçirilmiştir?','["Karadeniz bölgesi","Orta Anadolu","Güneydoğu Anadolu","Doğu Anadolu"]'::jsonb,2,'Metne göre GAP projesi Güneydoğu Anadolu bölgesine yönelik olarak tasarlanmış ve uygulamaya konulmuştur.',4,2),
  ('f1000012-0000-4000-f100-000000000012','detail','Türkiyenin Boğazlar üzerindeki denetim yetkisi hangi uluslararası sözleşmeyle düzenlenmiştir?','["Lozan Antlaşması","Montrö Sözleşmesi","Paris Antlaşması","Ankara İtilafnamesi"]'::jsonb,1,'Metne göre Türkiyenin Boğazlar üzerindeki kontrol yetkisi Montrö Sözleşmesi ile düzenlenmiştir.',4,3),
  ('f1000012-0000-4000-f100-000000000012','vocabulary','Metinde geçen jeostratejik sözcüğünün anlamı aşağıdakilerden hangisidir?','["ekonomik açıdan gelişmiş","konum avantajına dayalı stratejik önem","kültürel açıdan çeşitlilik barındıran","demografik açıdan hareketli"]'::jsonb,1,'Jeostratejik kavramı; bir ülkenin coğrafi konumundan kaynaklanan askeri, siyasi ya da ekonomik stratejik değeri ifade eder.',4,4),
  ('f1000012-0000-4000-f100-000000000012','inference','Doğu ve Batı Türkiye arasındaki kalkınma uçurumundan çıkarılabilecek en önemli politika sonucu nedir?','["Batı bölgeleri için yeni kısıtlamalar getirilmelidir","Bölgeler arası eşitsizliklerin giderilmesi amacıyla hedefli kalkınma politikalarına devam edilmesi zorunludur","Doğu illerindeki nüfus batı şehirlerine tamamen taşınmalıdır","Ekonomik kalkınma yalnızca büyük metropollerin güçlendirilmesiyle sağlanabilir"]'::jsonb,1,'Eşitsizliklerin on yıllardır sürmesi ve hükümetin bu konudaki politika çabası, bölgeler arası dengesizlikleri hedefleyen aktif kalkınma politikalarının zorunluluğuna işaret etmektedir.',4,5);

  RAISE NOTICE '053: AYT Tarih+Cografya 12 metin + 60 soru basariyla eklendi.';
END;
$migration$;
