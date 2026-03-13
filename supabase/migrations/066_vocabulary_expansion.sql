-- ================================================================
-- 066_vocabulary_expansion.sql
-- Kelime Haznesi genişletme: +300 kelime
-- LGS +90 · TYT +100 · AYT +80 · YDS +30
-- Toplam: 260 → ~560 kelime
-- ================================================================

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM vocabulary_words) >= 500 THEN
    RAISE NOTICE '066: vocabulary already expanded, skipping.';
    RETURN;
  END IF;

-- ════════════════════════════════════════════════════════════════
-- LGS — +90 kelime (Türkçe edebi, dil bilgisi, anlam, Fen, Sosyal)
-- ════════════════════════════════════════════════════════════════

INSERT INTO vocabulary_words (word, meaning, example_sentence, exam_type, difficulty, wrong_option_1, wrong_option_2, wrong_option_3) VALUES

-- ── Edebi terimler (difficulty 1-2) ───────────────────────────
('dize', 'şiirde bir satır', 'Şairin her dizesi ayrı bir duygu taşır.', 'lgs', 1, 'şiirde bir kıta', 'şiirde bir ses', 'şiirde bir tema'),
('uyak', 'dize sonlarındaki ses benzerliği', 'Şiirin uyak düzeni ABAB biçimindeydi.', 'lgs', 1, 'dizelerin ritmi', 'dize sayısı', 'şiirin başlığı'),
('dörtlük', 'dört dizeden oluşan şiir birimi', 'Halk şiirinde her dörtlük ayrı bir anlam taşır.', 'lgs', 1, 'dört sayfalık yazı', 'dört kelimeli cümle', 'dört kelimeli dize'),
('bent', 'şiirde anlam bütünlüğü olan dize grubu', 'Şiirin her bendi farklı bir tema işliyordu.', 'lgs', 2, 'şiirdeki en kısa dize', 'şiirin başlığı', 'şiirdeki uyak düzeni'),
('nazım', 'ölçülü ve uyaklı yazı; şiir biçimi', 'Divan şiiri ağırlıklı olarak nazım geleneğiyle yazılmıştır.', 'lgs', 2, 'nesir türü yazı', 'ölçüsüz şiir', 'roman türü'),
('nesir', 'ölçü ve uyak kullanılmadan yazılan düzyazı', 'Roman ve hikaye nesir türünün örnekleridir.', 'lgs', 2, 'ölçülü şiir türü', 'halk şiiri türü', 'divan şiiri türü'),
('redif', 'dize sonlarında yinelenen aynı görevdeki ek ya da kelime', 'Şiirde "gelir" kelimesinin redif olarak kullanıldığı görülüyor.', 'lgs', 3, 'dize başlarındaki ses', 'şiirdeki ölçü', 'uyak türü'),
('aliterasyon', 'şiirde aynı ünsüzün sık tekrarı', 'Şiirde "s" sesinin aliterasyon amacıyla kullanıldığı açıktır.', 'lgs', 3, 'ünlü seslerin tekrarı', 'dize sayısı tekrarı', 'kelime tekrarı'),
('asonans', 'şiirde aynı ünlünün sık tekrarı', 'Şiirde "a" sesinin asonans etkisi yarattığı görülür.', 'lgs', 3, 'ünsüz seslerin tekrarı', 'dize uzunluğu', 'uyak düzeni'),
('masal', 'olağanüstü olaylar içeren, anonim halk anlatısı', 'Masal, gerçek dışı olayları konu alan halk edebiyatı türüdür.', 'lgs', 1, 'gerçek olayları anlatan tür', 'tarihi olayları konu alan tür', 'kısa şiir türü'),
('fabl', 'hayvanların insan gibi davrandığı öğretici hikaye', 'Fablın sonunda mutlaka bir ders (öğüt) bulunur.', 'lgs', 2, 'doğaüstü varlıkların olduğu tür', 'tarihi olayları anlatan tür', 'gerçekçi roman türü'),
('anı', 'yaşanan olayların sonradan yazıya geçirildiği tür', 'Anı türünde yazar kendi yaşadıklarını birinci ağızdan aktarır.', 'lgs', 1, 'hayal edilen olayları anlatan tür', 'fıkra türü yazı', 'toplumu eleştiren yazı'),
('gezi yazısı', 'gezilen yerlerin anlatıldığı edebi tür', 'Gezi yazısında yazar gördüklerini ve yaşadıklarını aktarır.', 'lgs', 1, 'ev içi gözlemleri anlatan tür', 'tarihi anılar türü', 'eleştiri türü'),
('deneme', 'yazarın görüşlerini kanıtlama zorunluluğu olmadan aktardığı tür', 'Denemede yazar kendi düşüncelerini özgürce dile getirir.', 'lgs', 2, 'bilimsel deney sonuçlarını aktaran tür', 'olay anlatan tür', 'kişileri anlatan tür'),
('biyografi', 'bir kişinin hayatını anlatan eser', 'Atatürk''ün biyografisi pek çok yazar tarafından kaleme alınmıştır.', 'lgs', 2, 'kendi hayatını anlatan eser', 'bir dönemin tarihini anlatan eser', 'hayali kişiyi anlatan eser'),
('otobiyografi', 'kişinin kendi hayatını anlattığı eser', 'Otobiyografide kişi yaşamını birinci tekil şahısla aktarır.', 'lgs', 2, 'başkasının hayatını anlatan eser', 'iki kişinin hayatını anlatan eser', 'bir dönemin hikayesini anlatan eser'),
('fıkra (edebi)', 'günlük olaylar hakkında kısa gazete yazısı', 'Gazetenin köşe yazarı her gün bir fıkra kaleme alır.', 'lgs', 2, 'güldürücü kısa hikaye', 'uzun roman türü', 'tarihi belge'),

-- ── Dil bilgisi terimleri (difficulty 2) ──────────────────────
('özne', 'cümlede eylemi gerçekleştiren ya da hakkında yargı bildirilen öge', 'Cümledeki özneyi bulmak için "kim?" ya da "ne?" diye sorulur.', 'lgs', 1, 'cümlede hareketi anlatan öge', 'cümlede yeri anlatan öge', 'cümlede zamanı anlatan öge'),
('yüklem', 'cümlede temel yargı bildiren öge', 'Cümlenin yüklemi bulunmadan anlam tamamlanamaz.', 'lgs', 1, 'cümlede özneyi niteleyen öge', 'cümlede yeri anlatan öge', 'cümlede nesneyi niteleyen öge'),
('nesne', 'cümlede fiilin etkilediği öge', 'Cümlede "neyi?" ve "kimi?" sorularıyla nesne bulunur.', 'lgs', 2, 'cümlede eylemi yapan öge', 'cümlede yeri anlatan öge', 'cümlede zamanı anlatan öge'),
('zarf tümleci', 'cümlede zaman, yer, neden gibi anlam katan öge', '"Sabah erken uyandım." cümlesinde "sabah" zarf tümlecidir.', 'lgs', 2, 'cümlede nesneyi niteleyen öge', 'cümlede özneyi niteleyen öge', 'cümlede yüklemi niteleyen isim'),
('sıfat', 'isimden önce gelerek onu niteleyen ya da belirten sözcük', '"Güzel çiçek" tamlamasında "güzel" sıfattır.', 'lgs', 1, 'eylemi niteleyen sözcük', 'cümlede özne olan sözcük', 'yüklem olarak kullanılan sözcük'),
('zamir', 'ismin yerini tutan sözcük', '"Ben" ve "o" birer zamirdir.', 'lgs', 1, 'ismi niteleyen sözcük', 'fiili niteleyen sözcük', 'bağlama yarayan sözcük'),
('edat', 'tek başına anlamı olmayan, sözcükleri birbirine bağlayan görev sözcüğü', '"İçin", "ile", "kadar" birer edattır.', 'lgs', 2, 'isimden türeyen sözcük', 'eylemi niteleyen sözcük', 'yargı bildiren sözcük'),
('bağlaç', 'sözcükleri ve cümleleri anlam bakımından birbirine bağlayan sözcük', '"Ve", "ama", "fakat" birer bağlaçtır.', 'lgs', 1, 'cümle sonuna gelen ek', 'ismi niteleyen sözcük', 'zamirin türü'),

-- ── Anlam bilgisi (difficulty 2-3) ────────────────────────────
('eş anlamlı', 'aynı ya da yakın anlamı olan sözcükler', '"Güzel" ve "hoş" eş anlamlı sözcüklerdir.', 'lgs', 1, 'zıt anlamlı sözcükler', 'çok anlamlı sözcükler', 'sesteş sözcükler'),
('zıt anlamlı', 'birbirine karşıt anlamı olan sözcükler', '"Büyük" ve "küçük" zıt anlamlı sözcüklerdir.', 'lgs', 1, 'aynı anlama gelen sözcükler', 'farklı seste aynı anlam', 'bağlamına göre anlam değişen sözcükler'),
('sesteş', 'yazılışı ve okunuşu aynı, anlamı farklı sözcükler', '"Yüz" (sayı) ve "yüz" (surat) sesteş sözcüklerdir.', 'lgs', 2, 'eş anlamlı sözcük türü', 'zıt anlamlı sözcük türü', 'yakın anlamlı sözcükler'),
('soyut anlam', 'beş duyu organıyla algılanamayan kavram', '"Mutluluk" ve "özgürlük" soyut anlamlı sözcüklerdir.', 'lgs', 2, 'elle tutulabilen kavram', 'gözle görülebilen kavram', 'işitilebilen kavram'),
('somut anlam', 'beş duyu organıyla algılanabilen kavram', '"Taş", "su", "ses" somut anlamlı sözcüklerdir.', 'lgs', 2, 'düşünülebilen ancak görülemeyen kavram', 'yalnızca hayal edilebilen kavram', 'sadece hissedilebilen kavram'),
('yan anlam', 'temel anlamdan uzaklaşarak kazanılan ikincil anlam', '"Kapı kolu" ifadesinde "kol" yan anlam taşır.', 'lgs', 2, 'mecaz anlam türü', 'temel anlam', 'soyut anlam'),
('çok anlamlılık', 'bir sözcüğün birden fazla anlam taşıması', '"Baş" sözcüğü çok anlamlıdır: baş ağrısı, sınıf başı.', 'lgs', 2, 'bir sözcüğün tek anlamı olması', 'iki sözcüğün aynı anlamı olması', 'sözcüklerin bağlaçla bağlanması'),
('deyim', 'gerçek anlamından uzaklaşmış kalıp söz öbeği', '"Gözü yükseklerde olmak" bir deyimdir.', 'lgs', 1, 'gerçek anlamıyla kullanılan söz', 'atasözü türü', 'bilimsel terim'),

-- ── Fen bilimleri terimleri (difficulty 2) ────────────────────
('klorofil', 'bitkilerde fotosentezi sağlayan yeşil renkli madde', 'Yaprakların yeşil rengi klorofilden kaynaklanır.', 'lgs', 2, 'hayvanlarda enerji depolayan madde', 'topraktaki mineral', 'güneşi absorbe eden atom'),
('solunum', 'besinlerin oksijen yardımıyla yakılarak enerji üretilmesi', 'Tüm canlılar solunum yaparak enerji elde eder.', 'lgs', 1, 'besinlerin güneş ışığıyla yapılması', 'canlıların beslenme biçimi', 'canlıların çoğalma süreci'),
('sindirim', 'besinlerin vücutta parçalanarak emilir hale getirilmesi', 'Sindirim ağız ile başlayıp bağırsakta tamamlanır.', 'lgs', 1, 'oksijen taşınması süreci', 'besinlerin enerji olarak depolanması', 'kanın kalp tarafından pompalanması'),
('dolaşım sistemi', 'kanın damarlar aracılığıyla vücutta taşınmasını sağlayan sistem', 'Kalp, dolaşım sisteminin merkezidir.', 'lgs', 1, 'besinleri sindiren sistem', 'solunum yapan organ', 'atık maddeleri atan sistem'),
('adaptasyon', 'canlının yaşadığı ortama uyum sağlaması', 'Deve, çöl iklimine adaptasyon sağlamış bir hayvandır.', 'lgs', 2, 'canlının başka ortama göç etmesi', 'türlerin çoğalma biçimi', 'ekosistemin değişimi'),
('organizma', 'yaşayan herhangi bir canlı varlık', 'Bakteri de bir organizmadır.', 'lgs', 1, 'cansız varlık', 'bitkisel ürün', 'mineral yapı'),
('kirletici', 'çevreyi bozan, zararlı madde ya da etken', 'Fabrika dumanları hava kirliliğine neden olan kirleticilerdir.', 'lgs', 1, 'çevreyi koruyan madde', 'temizleyici ajan', 'yararlı organik madde'),
('asit yağmuru', 'atmosferdeki asit içeren suların yağışı', 'Asit yağmuru bitkilere ve yapılara zarar verir.', 'lgs', 2, 'tuzlu yağmur türü', 'asit içeren kar yağışı', 'aside dönüşen göl suyu'),
('besin zinciri', 'bir ekosistemde beslenme ilişkisini gösteren sıra', 'Üretici-tüketici-ayrıştırıcı besin zincirini oluşturur.', 'lgs', 1, 'canlıların üremesi', 'maddelerin döngüsü', 'ekosistemin katmanları'),
('yenilenebilir enerji', 'güneş, rüzgar gibi tükenmeyecek kaynaklardan elde edilen enerji', 'Güneş panelleri yenilenebilir enerji üretir.', 'lgs', 1, 'petrol ve doğal gazdan elde edilen enerji', 'nükleer enerji', 'fosil yakıt enerjisi'),
('madde döngüsü', 'doğadaki elementlerin canlılar ve çevre arasında dolaşması', 'Karbon döngüsü, madde döngüsünün bir örneğidir.', 'lgs', 2, 'enerjinin canlılar arasında aktarımı', 'suyun buharlaşması', 'besin zinciri'),
('çekim kuvveti', 'kütleli cisimler arasındaki çekme kuvveti', 'Dünyanın çekim kuvveti nesneleri yere çeker.', 'lgs', 1, 'itme kuvveti türü', 'elektrik kuvveti', 'manyetik alan kuvveti'),
('sürtünme kuvveti', 'iki yüzey arasındaki hareketi engelleyen kuvvet', 'Lastiklerin yola teması sürtünme kuvveti oluşturur.', 'lgs', 1, 'çekim kuvveti türü', 'yer çekimi', 'elektromanyetik güç'),
('iletken', 'elektrik ya da ısıyı ileten madde', 'Bakır ve demir iyi birer iletkendir.', 'lgs', 1, 'elektriği geçirmeyen madde', 'ısıyı tutan madde', 'ışığı yansıtan madde'),
('yalıtkan', 'elektrik ya da ısıyı iletmeyen madde', 'Plastik ve tahta yalıtkandır.', 'lgs', 1, 'elektriği ileten madde', 'ısıyı ileten madde', 'manyetik özellikli madde'),

-- ── Sosyal bilgiler / Tarih terimleri (difficulty 2-3) ─────────
('anayasa', 'devletin temel kurallarını belirleyen en üstün hukuk belgesi', 'Türkiye Cumhuriyeti anayasası 1982''de yürürlüğe girdi.', 'lgs', 2, 'milletvekillerin aldığı karar', 'yargı kararı belgesi', 'belediye yönetmeliği'),
('egemenlik', 'üstün ve bağımsız yönetme hakkı', '"Egemenlik kayıtsız şartsız milletindir." - Atatürk', 'lgs', 2, 'seçilmiş yöneticinin kararı', 'meclisin yasa yapma yetkisi', 'mahkeme kararı'),
('inkılap', 'toplumun temel yapısını köklü biçimde değiştiren devrim', 'Atatürk''ün gerçekleştirdiği inkılaplar Türkiye''yi çağdaşlaştırdı.', 'lgs', 2, 'küçük bir değişiklik', 'ekonomik kalkınma', 'askeri güçlenme'),
('nüfus', 'belirli bir bölgede yaşayan insan sayısı', 'Türkiye''nin nüfusu her yıl artmaktadır.', 'lgs', 1, 'bir şehrin yüzölçümü', 'devletin ekonomisi', 'ülkenin coğrafyası'),
('göç', 'insanların bir bölgeden başka bir bölgeye taşınması', 'Köyden kente göç kentsel nüfusu artırdı.', 'lgs', 1, 'nüfus azalması', 'doğum oranı', 'doğal afet'),
('sanayi devrimi', 'makine üretimiyle başlayan büyük ekonomik dönüşüm', 'Sanayi Devrimi İngiltere''de başladı ve tüm dünyaya yayıldı.', 'lgs', 2, 'tarım toplumuna geçiş', 'ticaret yollarının açılması', 'askeri reform dönemi'),
('rönesans', 'Avrupa''da 14-17. yüzyıllar arasındaki kültürel yeniden doğuş dönemi', 'Rönesans döneminde sanat ve bilim büyük gelişme kaydetti.', 'lgs', 2, 'karanlık çağ dönemi', 'sanayi dönemi', 'reform hareketi'),
('reform', 'mevcut sistemde yapılan iyileştirici değişiklik', 'Eğitimde reform yapılması zorunlu görülüyordu.', 'lgs', 2, 'köklü devrim', 'siyasi çöküş', 'askeri müdahale'),
('sürdürülebilirlik', 'kaynakları gelecek nesiller için koruyarak kullanım ilkesi', 'Sürdürülebilirlik çevre politikasının temelidir.', 'lgs', 3, 'kaynakların hızla tükenmesi', 'teknolojik gelişme', 'nüfus artışı'),
('kültür', 'bir toplumun yaşayış biçimi, değerleri ve sanatının bütünü', 'Her milletin kendine özgü bir kültürü vardır.', 'lgs', 1, 'ülkenin ekonomisi', 'devletin askeri gücü', 'coğrafi konum'),

-- ── Matematik terimleri (difficulty 2-3) ──────────────────────
('kesiştiren', 'iki ya da daha fazla doğruyu kesen doğru', 'İki paraleli kesen doğruya kesiştiren denir.', 'lgs', 2, 'iki doğruya paralel olan doğru', 'doğruların birleşim kümesi', 'iki açıyı birleştiren doğru'),
('asal sayı', 'yalnızca 1 ve kendisine bölünebilen 1''den büyük doğal sayı', '2, 3, 5, 7 ve 11 birer asal sayıdır.', 'lgs', 2, 'herhangi bir sayıya bölünebilen sayı', 'negatif sayı türü', 'çift sayı türü'),
('mutlak değer', 'bir sayının sıfırdan uzaklığı; her zaman negatif olmayan değer', '|-5|=5, |3|=3; mutlak değer sıfırdan küçük olamaz.', 'lgs', 2, 'bir sayının karesi', 'sayının negatif formu', 'sayının kökü'),
('köklü ifade', 'karekök ya da küpkök içeren matematiksel ifade', '√9 = 3 bir köklü ifadedir.', 'lgs', 2, 'üs ifadesi', 'kesirli ifade', 'negatif sayı'),
('üçgen eşitsizliği', 'üçgende her kenar diğer iki kenarın toplamından küçüktür kuralı', 'Üçgen çizebilmek için üçgen eşitsizliği sağlanmalıdır.', 'lgs', 3, 'üçgende açı toplamı kuralı', 'üçgende alan hesabı', 'üçgende yükseklik özelliği'),

-- ── Fen - Kimya terimleri ──────────────────────────────────────
('atom', 'maddenin en küçük yapı taşı', 'Her element kendine özgü bir atomdan oluşur.', 'lgs', 1, 'maddenin en büyük parçası', 'molekülden büyük birim', 'hücrenin bir organeli'),
('molekül', 'en az iki atomun bağlanmasıyla oluşan parçacık', 'Su molekülü iki hidrojen ve bir oksijen atomundan oluşur.', 'lgs', 1, 'tek atomlu parçacık', 'en küçük madde birimi', 'hücrenin çekirdeği'),
('element', 'tek tür atomdan oluşan saf madde', 'Demir, altın ve oksijen birer elementtir.', 'lgs', 1, 'iki farklı atomun birleşimi', 'karışık maddeler', 'tuzlu su'),
('bileşik', 'iki veya daha fazla farklı elementin belirli oranlarda birleşmesi', 'Su (H₂O) bir bileşiktir.', 'lgs', 2, 'tek tür atomdan oluşan madde', 'element karışımı', 'ayrışabilen madde'),
('çözünürlük', 'bir maddenin başka bir maddede çözünme miktarı', 'Şekerin sudaki çözünürlüğü yüksektir.', 'lgs', 2, 'maddenin erime noktası', 'maddenin yoğunluğu', 'maddenin kaynama noktası'),

-- ════════════════════════════════════════════════════════════════
-- TYT — +100 kelime (edebi sanatlar, akademik, dil anlayışı)
-- ════════════════════════════════════════════════════════════════

-- ── Edebi sanatlar (difficulty 2-3) ───────────────────────────
('teşbih', 'iki şeyi benzeme yönüyle karşılaştırma sanatı', '"Arslan gibi savaştı." cümlesinde teşbih vardır.', 'tyt', 2, 'abartma sanatı', 'anlam aktarması', 'kişileştirme sanatı'),
('istiare', 'benzetmenin sadece benzetilen öğesiyle yapılması', '"Aslan saldırdı." (kahraman için) ifadesinde istiare vardır.', 'tyt', 3, 'benzetme sanatı', 'abartma sanatı', 'zıtlık sanatı'),
('mübalağa', 'bir olayı gerçeğin çok ötesinde abartma sanatı', '"Gözyaşlarım deniz oldu." cümlesinde mübalağa vardır.', 'tyt', 2, 'gerçekçi anlatım', 'küçümseme sanatı', 'benzetme sanatı'),
('tezat', 'zıt anlamlı kavramları yan yana kullanma sanatı', '"Gülüp ağladım." ifadesinde tezat vardır.', 'tyt', 2, 'benzetme sanatı', 'abartma sanatı', 'kişileştirme sanatı'),
('tenasüp', 'birbiriyle anlam ilgisi olan sözcükleri bir arada kullanma sanatı', '"Kalem, kağıt, mürekkep" örneğinde tenasüp vardır.', 'tyt', 3, 'zıt anlamlı sözcükleri kullanma', 'anlam daralması', 'abartma sanatı'),
('telmih', 'tarihsel ya da edebi bir olaya gönderme yapma sanatı', 'Şair "Süleyman''ın tahtı" diyerek telmih yapmıştır.', 'tyt', 3, 'kişileştirme sanatı', 'benzetme sanatı', 'abartma sanatı'),
('tecahül-i arif', 'bilip de bilmezden gelme sanatı', '"Mevsim mi değişti yoksa sen mi gittin?" ifadesinde tecahül-i arif vardır.', 'tyt', 4, 'gerçekten bilmeme', 'abartma sanatı', 'zıtlık kullanımı'),
('hüsn-i talil', 'bir olayı gerçek nedeninden farklı, güzel bir nedene bağlama sanatı', '"Çiçekler seni görünce açtı." ifadesinde hüsn-i talil vardır.', 'tyt', 4, 'gerçek neden bildirme', 'benzetme sanatı', 'mübalağa sanatı'),
('istifham', 'cevap beklenmeyen soru sorma sanatı (retorik soru)', '"Bu zulme kim dayanabilir?" ifadesinde istifham vardır.', 'tyt', 3, 'cevap beklenen soru', 'kişileştirme sanatı', 'anlam aktarması'),
('nida', 'seslenme, ünleme sanatı', '"Ey Türk gençliği!" ifadesinde nida vardır.', 'tyt', 2, 'soru sorma sanatı', 'kişileştirme sanatı', 'benzetme sanatı'),
('tekrir', 'vurgu için sözcük ya da yapıların tekrarlanması', '"Güzel güzel ötüyordu kuşlar." ifadesinde tekrir vardır.', 'tyt', 2, 'çelişki sanatı', 'gönderme sanatı', 'abartma sanatı'),
('kişileştirme', 'cansız varlıklara insan özelliği verme', '"Rüzgar uğuldu, dağlar ağladı." cümlesinde kişileştirme var.', 'tyt', 2, 'benzetme sanatı', 'abartma sanatı', 'gönderme yapma'),
('ad aktarması', 'bir kavramın ilgili olduğu başka bir kavramla anılması', '"Ankara karar verdi." ifadesinde ad aktarması vardır.', 'tyt', 3, 'mecaz anlam', 'kişileştirme', 'teşbih sanatı'),

-- ── Dil ve anlam bilgisi (difficulty 3-4) ─────────────────────
('anlam daralması', 'bir sözcüğün zamanla daha dar anlamda kullanılması', '"Oğlan" önce tüm çocukları karşılarken sonra sadece erkek çocuğu anlamına geldi.', 'tyt', 3, 'sözcüğün geniş anlam kazanması', 'sözcüğün mecaz anlam kazanması', 'sözcüğün olumsuz anlam kazanması'),
('anlam genişlemesi', 'bir sözcüğün zamanla daha geniş anlamda kullanılması', '"Yazmak" başta sadece yazı yazmayı, sonra bilgisayarda yazmayı da kapsadı.', 'tyt', 3, 'sözcüğün dar anlam kazanması', 'sözcüğün mecaz anlam kazanması', 'sözcüğün olumlu anlam kazanması'),
('anlam iyileşmesi', 'bir sözcüğün zamanla olumlu anlam kazanması', '"Bay" sözcüğü önce sıradan bir adam anlamındayken sonra saygın kişi anlamı kazandı.', 'tyt', 4, 'sözcüğün olumsuz anlam kazanması', 'sözcüğün dar anlam kazanması', 'sözcüğün anlam yitirmesi'),
('anlam kötüleşmesi', 'bir sözcüğün zamanla olumsuz anlam kazanması', '"Herif" sözcüğü önce saygın adam anlamındayken zamanla aşağılayıcı anlam kazandı.', 'tyt', 4, 'sözcüğün olumlu anlam kazanması', 'sözcüğün genişlemesi', 'sözcüğün daralması'),
('örtmece', 'rahatsız edici bir kavramın yumuşatılarak anlatılması', '"Aramızdan ayrıldı" ifadesi ölmek için örtmece kullanımıdır.', 'tyt', 3, 'abartma yöntemi', 'benzetme yöntemi', 'kişileştirme yöntemi'),
('güzel adlandırma', 'kötü çağrışımlı bir kavrama güzel ad verme', '"Çöpçü" yerine "temizlik görevlisi" demek güzel adlandırmadır.', 'tyt', 3, 'sözcük türetme yöntemi', 'anlam daralması', 'örtmece türü'),
('söz sanatı', 'dilde anlam güzelliği veya etki yaratmak için kullanılan teknik', 'Teşbih, istiare ve mübalağa birer söz sanatıdır.', 'tyt', 2, 'dil bilgisi kuralı', 'imla kuralı', 'cümle yapısı'),

-- ── Fiil çatısı terimleri (difficulty 3) ──────────────────────
('etken çatı', 'öznenin eylemi kendisinin yaptığı fiil yapısı', '"Ahmet kitabı okudu." cümlesinde etken çatı vardır.', 'tyt', 2, 'eylemin başkasına yaptırılması', 'eylemin kendiliğinden olması', 'eylemin olumsuzlanması'),
('edilgen çatı', 'öznenin belli olmadığı ya da işin başkasınca yapıldığı çatı', '"Kapı açıldı." cümlesinde edilgen çatı vardır.', 'tyt', 3, 'eylemin yapana bağlı olması', 'öznenin belli olması', 'kişinin kendi yaptığı eylem'),
('dönüşlü çatı', 'öznenin eylemi kendine yaptığı çatı', '"Çocuk yıkandı." cümlesinde dönüşlü çatı vardır.', 'tyt', 3, 'öznenin başkasına yaptığı eylem', 'eylemin kendiliğinden oluşması', 'öznenin belli olmadığı durum'),
('işteş çatı', 'eylemin birlikte ya da karşılıklı yapıldığını gösteren çatı', '"İki kardeş kucaklaştı." cümlesinde işteş çatı vardır.', 'tyt', 3, 'birinin diğerine yaptığı eylem', 'eylemin kendine yapılması', 'eylemin başkasına yaptırılması'),
('ettirgen çatı', 'öznenin eylemi bir başkasına yaptırmasını gösteren çatı', '"Öğretmen ödevi yazdırdı." cümlesinde ettirgen çatı vardır.', 'tyt', 3, 'öznenin kendisinin yaptığı eylem', 'eylemin edilgen yapısı', 'karşılıklı eylem'),

-- ── Cümle bilgisi (difficulty 3-4) ────────────────────────────
('basit cümle', 'tek yüklemli cümle', '"Kuşlar uçar." basit bir cümledir.', 'tyt', 2, 'çok yüklemli cümle', 'şartlı cümle yapısı', 'olumsuz cümle'),
('birleşik cümle', 'temel cümle ve yan cümle içeren cümle', '"Gelince haber ver." bir birleşik cümledir.', 'tyt', 3, 'tek yüklemli cümle', 'olumsuz cümle', 'soru cümlesi'),
('bağımsız sıralı cümle', 'aralarında anlam bağı olan ama bağımsız cümlelerin sıralanması', '"Güneş doğdu, kuşlar öttü." bağımsız sıralı cümledir.', 'tyt', 3, 'birleşik cümle türü', 'şartlı cümle', 'soru cümlesi'),
('şart cümlesi', 'koşul bildiren yan cümle içeren yapı', '"Çalışırsan başarırsın." bir şart cümlesidir.', 'tyt', 2, 'sıralı cümle türü', 'eksik cümle', 'bağlı cümle'),

-- ── Anlatı teknikleri (difficulty 3-4) ────────────────────────
('bakış açısı', 'anlatıcının olayları gördüğü konum; birinci/üçüncü şahıs', 'Birinci tekil şahıs bakış açısı okuyucuyu daha derinden etkiler.', 'tyt', 2, 'anlatıcının ses tonu', 'romanın konusu', 'yazarın üslubu'),
('kahraman anlatıcı', 'olayların içindeki kişinin anlattığı bakış açısı türü', '"Ben" ile başlayan anlatım kahraman anlatıcıya işaret eder.', 'tyt', 3, 'tanrısal bakış açısı', 'gözlemci anlatıcı', 'belirsiz anlatıcı'),
('tanrısal anlatıcı', 'her şeyi bilen, tüm karakterlerin iç dünyasına girebilen anlatıcı', 'Klasik romanlarda çoğunlukla tanrısal anlatıcı kullanılır.', 'tyt', 3, 'kahraman anlatıcı', 'gözlemci anlatıcı', 'birinci şahıs anlatıcı'),
('iç monolog', 'karakterin düşüncelerinin doğrudan yansıtılması', 'Bilinç akışı tekniğinde iç monolog sıkça kullanılır.', 'tyt', 4, 'diyalog tekniği', 'tanım yapma', 'açıklama anlatım biçimi'),
('flashback', 'anlatıda geçmişe dönüş tekniği', 'Yazar flashback ile karakterin çocukluğunu anlattı.', 'tyt', 3, 'ileriye atma tekniği', 'konu özetleme', 'anlatının durdurulması'),

-- ── Akademik ve genel kültür (difficulty 2-4) ─────────────────
('analoji', 'iki farklı şey arasındaki benzerliğe dayanarak yapılan akıl yürütme', 'Bilim insanları analoji kurarak yeni teoriler oluşturur.', 'tyt', 3, 'zıtlıklara dayalı akıl yürütme', 'sayısal hesaplama', 'tümevarım yöntemi'),
('hipotez', 'test edilmemiş, geçici açıklama önerisi', 'Bilim insanı deneyden önce bir hipotez kurdu.', 'tyt', 2, 'kanıtlanmış gerçek', 'kesin sonuç', 'bilimsel yasa'),
('tez', 'savunulan ana fikir veya iddia', 'Akademik yazıda tez ilk paragrafta belirtilir.', 'tyt', 2, 'karşı görüş', 'sonuç bölümü', 'kanıt sunma'),
('antitez', 'bir teze karşı öne sürülen zıt görüş', 'Tartışmada her teze bir antitez ileri sürülebilir.', 'tyt', 3, 'tezi destekleyen düşünce', 'sonuç cümlesi', 'konu cümlesi'),
('önerme', 'doğru ya da yanlış olduğu belirlenebilen yargı', '"Güneş doğudan doğar." doğru bir önermedir.', 'tyt', 3, 'kanıtsız iddia', 'çelişkili yargı', 'belirsiz ifade'),
('tümdengelim', 'genelden özele giden akıl yürütme yöntemi', '"Tüm insanlar ölümlüdür, Sokrates insandır, o halde ölümlüdür." tümdengelim örneğidir.', 'tyt', 3, 'özelden genele giden yöntem', 'deneysel yöntem', 'istatistiksel yöntem'),
('tümevarım', 'özelden genele giden akıl yürütme yöntemi', 'Pek çok örnek incelenerek genel bir sonuca varılmasına tümevarım denir.', 'tyt', 3, 'genelden özele giden yöntem', 'analojik düşünme', 'sezgisel yöntem'),
('nesnel', 'kişisel yargıdan bağımsız, tarafsız', 'Bilimsel çalışmalar nesnel olmak zorundadır.', 'tyt', 2, 'kişisel yargıya dayalı', 'duygusal değerlendirme', 'öznel kanı'),
('öznel', 'kişisel düşünce ve duygulara dayalı', 'Sanat eleştirileri çoğunlukla öznel değerlendirmeler içerir.', 'tyt', 2, 'gerçeklere dayalı', 'tarafsız yargı', 'bilimsel değerlendirme'),
('retorik', 'etkili ve ikna edici konuşma sanatı', 'Siyasetçi güçlü bir retoriğe sahipti.', 'tyt', 3, 'düzgün yazı yazma', 'mimik kullanımı', 'ses tonu ayarı'),
('paradigma', 'bir alanda genel kabul görmüş düşünce çerçevesi', 'Kopernik''in teorisi bilimin paradigmasını değiştirdi.', 'tyt', 4, 'deneysel yöntem', 'mantık kuralı', 'bilimsel yasa'),
('pragmatik', 'pratik sonuçlara odaklanan, uygulamaya dayalı', 'Pragmatik bir yaklaşımla sorunu çözdüler.', 'tyt', 4, 'teorik ve soyut', 'duygusal yaklaşım', 'geleneksel yöntem'),
('empirik', 'gözlem ve deneye dayalı', 'Bilimsel bilgi empirik kanıtlara dayanmalıdır.', 'tyt', 4, 'salt akla dayalı', 'sezgisel', 'dogmatik'),

-- ── Türk edebiyatı terimleri (difficulty 3-4) ─────────────────
('epik', 'kahramanlık ve savaş konularını işleyen şiir türü', 'İlyada ve Odysseia birer epik şiirdir.', 'tyt', 3, 'aşk konulu şiir türü', 'öğretici şiir türü', 'lirik şiir türü'),
('lirik', 'bireysel duyguları, aşkı işleyen şiir türü', 'Şiir lirik bir şiirdir; derin duygular içerir.', 'tyt', 2, 'kahramanlık şiiri türü', 'öğretici şiir türü', 'toplumsal şiir türü'),
('didaktik', 'öğretici, bilgi vermeyi amaçlayan', 'Didaktik şiirler okuyucuya bir şeyler öğretmeyi hedefler.', 'tyt', 3, 'duygu odaklı şiir türü', 'epik anlatı türü', 'pastoral şiir türü'),
('pastoral', 'doğa, kır hayatı ve çobanlık temalarını işleyen', 'Pastoral şiirler doğanın güzelliğini yüceltir.', 'tyt', 3, 'kentsel temalar işleyen', 'kahramanlık teması', 'öğretici amaçlı yazı'),
('hiciv', 'bir kişi ya da kurumu alaylı biçimde eleştiren yazı türü', 'Hiciv, toplumsal sorunları alay yoluyla dile getirir.', 'tyt', 3, 'övgü yazısı türü', 'anı türü', 'roman türü'),

-- ════════════════════════════════════════════════════════════════
-- AYT — +80 kelime (edebi akımlar, roman sanatı, edebiyat tarihi)
-- ════════════════════════════════════════════════════════════════

-- ── Edebi akımlar (difficulty 3-4) ────────────────────────────
('klasisizm', '17. yüzyılda Fransa''da doğan, akla ve kurallara dayalı edebi akım', 'Klasisizmde doğa ve akıl temel estetik ölçütlerdir.', 'ayt', 3, 'duyguya dayalı akım', 'gözlem ve deney akımı', 'bireysel iç dünyayı ele alan akım'),
('romantizm', 'duygu, hayal ve bireyi ön plana çıkaran 19. yüzyıl akımı', 'Romantizm, akla değil duyguya ve doğaya değer verir.', 'ayt', 3, 'akla dayalı akım', 'gözleme dayalı akım', 'toplumsal gerçekçilik akımı'),
('realizm', 'gerçeği nesnel biçimde yansıtmayı hedefleyen akım', 'Realizm, yaşamı olduğu gibi, güzelleştirmeden aktarır.', 'ayt', 3, 'duygusal ve idealize akım', 'aşkı ön plana çıkaran akım', 'akla dayalı akım'),
('natüralizm', 'insanı kalıtım ve çevrenin ürünü olarak gören, ilmi gözleme dayalı akım', 'Natüralizm, realizmi deneye dayanan bir anlayışla aşmaya çalışır.', 'ayt', 4, 'duygusal anlatımı tercih eden akım', 'bireyin iç dünyasını esas alan akım', 'romantik akımın devamı'),
('sembolizm', 'duygu ve düşünceleri simgelerle ifade eden Fransız şiir akımı', 'Sembolizmde musiki, anlam ve sembol birbiriyle iç içe geçer.', 'ayt', 4, 'gerçeği nesnel aktaran akım', 'toplumsal meseleleri ön plana çıkaran akım', 'akla ve kurala dayalı akım'),
('parnasizm', 'biçim güzelliğini ve nesnelliği ön plana çıkaran Fransız şiir akımı', 'Parnasizm, duygu yerine biçim mükemmelliğini hedefler.', 'ayt', 4, 'duyguyu önceleyen akım', 'sembolik anlatımı benimseyen akım', 'toplumsal gerçekçi akım'),
('empresyonizm', 'anlık izlenimleri ve duygu durumlarını yansıtan akım', 'Empresyonizm, sanatçının anlık algısını etkili kılar.', 'ayt', 4, 'nesnel gerçeği aktaran akım', 'toplumsal eleştiri akımı', 'akılcı kurallar akımı'),
('ekspresyonizm', 'iç dünyayı çarpıtılmış biçimlerle dışa vuran akım', 'Ekspresyonizm, gerçeği değil öznel duyguyu ön plana çıkarır.', 'ayt', 4, 'nesnel gözlemi esas alan akım', 'biçim güzelliğini önceleyen akım', 'romantik idealizm akımı'),
('varoluşçuluk', 'bireyin özgür seçimlerini ve anlam arayışını merkeze alan felsefi akım', 'Sartre''ın varoluşçuluk felsefesi Fransız edebiyatını derinden etkiledi.', 'ayt', 4, 'toplumu ön plana çıkaran akım', 'ilahi düzeni esas alan akım', 'akılcı determinizm akımı'),
('modernizm', '20. yüzyılda geleneksel formları kıran, yenilikçi sanat anlayışı', 'Modernizmde bilinç akışı ve iç monolog sıkça kullanılır.', 'ayt', 4, 'geleneksel form ve kurallara dayalı anlayış', 'toplumsal gerçekçi akım', 'romantik akım'),
('postmodernizm', 'gerçekliği ve meta-anlatıları sorgulayan çağdaş sanat anlayışı', 'Postmodern romanlarda üstkurmaca ve ironi öne çıkar.', 'ayt', 4, 'modernizmin öncülü', 'geleneksel anlatı akımı', 'klasik biçimci akım'),

-- ── Türk edebiyatı dönemleri (difficulty 3-4) ─────────────────
('Tanzimat Edebiyatı', 'Osmanlı''da 1860''ta başlayan, Batı etkisindeki edebi dönem', 'Tanzimat Edebiyatı''nda roman ve gazete gibi yeni türler ortaya çıktı.', 'ayt', 3, 'Divan şiiri dönemi', 'Cumhuriyet sonrası dönem', 'Halk edebiyatı dönemi'),
('Servet-i Fünun', '1896-1901 yılları arasındaki Batılı tekniği benimseyen edebi topluluk', 'Servet-i Fünun şairleri alışılmadık imgeler ve aruz ölçüsü kullandı.', 'ayt', 3, 'Tanzimat dönemi topluluğu', 'Milli Edebiyat dönemi', 'Cumhuriyet dönemi'),
('Fecr-i Ati', '1909''da kurulan, bireysel ve sanat için sanat anlayışını benimseyen topluluk', 'Fecr-i Ati kısa süren ancak etkili bir edebi topluluktur.', 'ayt', 4, 'Servet-i Fünun''un devamı', 'Milli Edebiyat hareketi', 'Tanzimat topluluğu'),
('Milli Edebiyat', '1911 sonrası Türkçecilik ve halk değerlerine dayanan akım', 'Milli Edebiyat döneminde sade Türkçe ve hece vezni benimsendi.', 'ayt', 3, 'Batı etkisindeki akım', 'Divan şiiri geleneği', 'bireyselci sanat akımı'),
('Divan Edebiyatı', 'Osmanlı döneminde Arapça-Farsça etkisiyle gelişen klasik Türk edebiyatı', 'Divan Edebiyatı aruz vezni ve divan şiiri geleneğiyle şekillenmiştir.', 'ayt', 3, 'sade Türkçe kullanan edebiyat', 'Batı etkisindeki dönem', 'Cumhuriyet dönemi edebiyatı'),
('Halk Edebiyatı', 'sözlü geleneğe dayanan, anonim ya da halk şairlerinin oluşturduğu edebiyat', 'Halk Edebiyatı koşma, mani ve türkü gibi biçimleri kapsar.', 'ayt', 2, 'yazılı kurallara dayalı edebiyat', 'Divan şiiri geleneği', 'Batılı edebi akım'),

-- ── Roman sanatı terimleri (difficulty 3-4) ────────────────────
('protagonist', 'romanın baş kahramanı, olayların odak noktasındaki karakter', 'Suç ve Ceza''da Raskolnikov protagonisttir.', 'ayt', 3, 'romanın kötü karakteri', 'yan karakter', 'anlatıcı'),
('antagonist', 'protagonistle çatışan karşı güç ya da karakter', 'Antagonist, romana çatışma ve gerilim katar.', 'ayt', 3, 'romanın baş karakteri', 'yardımcı karakter', 'anlatıcı'),
('arketip', 'insan zihninde evrensel olarak yer etmiş temel karakter ya da sembol', 'Kahraman yolculuğu, edebiyattaki en yaygın arketiplerden biridir.', 'ayt', 4, 'bireysel karakter özelliği', 'kültüre özgü simge', 'dönüşen karakter'),
('motif', 'eserde tekrarlanan anlamlı unsur, tema ya da imge', 'Su motifi pek çok romanda yeniden doğuşu simgeler.', 'ayt', 3, 'romanın ana konusu', 'tek kullanımlık unsur', 'karakterin özelliği'),
('alegori', 'soyut kavramların somut varlıklarla anlatıldığı sembolik hikaye', 'Hayvan Çiftliği bir alegori olarak otoriter rejimleri eleştirir.', 'ayt', 3, 'gerçekçi anlatım türü', 'kişisel anı türü', 'tarih yazımı'),
('ironi', 'söylenenin tersini kasteden anlatım; ince alay', '"Ne kadar zekice bir hareket!" (aptalca hareket için) ifadesi ironiktir.', 'ayt', 3, 'doğrudan eleştiri', 'abartma sanatı', 'benzetme sanatı'),
('satir', 'toplumsal aksaklıkları alay ve yergi ile eleştiren edebi tür', 'Satir, siyasi ve toplumsal eleştirinin önemli bir aracıdır.', 'ayt', 3, 'övgü yazısı', 'kişisel anı türü', 'romantik şiir'),
('parodi', 'bir eseri ya da türü taklit ederek mizahi eleştiri yapma', 'Parodi, ciddi bir eseri komik biçimde yeniden yazarak eleştirir.', 'ayt', 3, 'özgün yaratı', 'gerçekçi anlatı', 'lirik şiir'),
('üstkurmaca', 'kurmacanın kendisini konu eden anlatı tekniği', 'Postmodern romanlarda üstkurmaca sık kullanılan bir tekniktir.', 'ayt', 4, 'gerçekçi anlatım', 'tarihsel roman tekniği', 'lirik anlatı'),
('bilinç akışı', 'karakterin düşünce akışını mantıksal sıra gözetmeksizin aktarma tekniği', 'Virginia Woolf bilinç akışı tekniğinin ustalarındandır.', 'ayt', 4, 'iç monolog tekniği', 'klasik anlatı yapısı', 'epik anlatı'),
('laytmotif', 'eserde sembolik anlam taşıyan tekrarlayan müzikal ya da edebi unsur', 'Wagnerian operalarda laytmotif her karaktere özgü müzikal temayla ifade edilir.', 'ayt', 4, 'roman motifi', 'yazıya özgü sembol', 'sahneleme unsuru'),

-- ── Şiir biçimleri ve terimleri (difficulty 3-5) ──────────────
('aruz vezni', 'hecelerin uzunluk-kısalığına dayanan ölçü sistemi', 'Divan şiiri aruz vezniyle yazılırdı.', 'ayt', 3, 'hece sayısına dayalı ölçü', 'serbest ölçü', 'uyak düzeni'),
('hece vezni', 'hece sayısına dayanan ölçü sistemi', 'Halk şiiri ve Milli Edebiyat şiiri hece vezniyle yazıldı.', 'ayt', 2, 'uzunluk-kısalığa dayanan ölçü', 'serbest ölçü', 'ses akışı düzeni'),
('serbest nazım', 'ölçü ve uyak kullanmayan şiir biçimi', 'Modern şiir genellikle serbest nazımla yazılır.', 'ayt', 2, 'aruzla yazılan şiir', 'divan şiiri biçimi', 'heceyle yazılan şiir'),
('gazel', 'Divan şiirinde aşk temalı, aa-ba-ca kafiye düzenli nazım biçimi', 'Fuzuli''nin gazelleri Türk şiirinin zirvelerinden sayılır.', 'ayt', 3, 'dörtlüklerden oluşan nazım biçimi', 'epik şiir biçimi', 'halk şiiri biçimi'),
('kaside', 'Divan şiirinde övgü ya da yergi için yazılan uzun nazım biçimi', 'Kaside, genellikle bir padiş ya da veziri metheder.', 'ayt', 3, 'aşk temalı nazım biçimi', 'ağıt biçimi', 'lirik şiir biçimi'),
('koşma', 'Halk şiirinde 4+4+3 ya da 4+4+4+3 heceli, 4 dizeli kıtalardan oluşan biçim', 'Karacaoğlan''ın koşmaları halk şiirinin en güzel örneklerindendir.', 'ayt', 3, 'divan şiiri biçimi', 'aruzla yazılan biçim', 'dörtlüksüz biçim'),
('mani', 'Halk şiirinde dört dizeli, aaxa kafiyeli kısa nazım biçimi', 'Mani, halk şiirinin en yaygın kısa biçimidir.', 'ayt', 3, 'uzun divan şiiri biçimi', 'aruzla yazılan biçim', 'kahraman konulu biçim'),

-- ── Genel edebiyat ve estetik terimleri (difficulty 4-5) ───────
('katarsis', 'trajedinin izleyicide yarattığı arınma duygusu', 'Aristoteles''e göre trajedi katarsis yoluyla ruhu arındırır.', 'ayt', 4, 'mutluluk duygusu', 'estetik zevk', 'kahkaha tepkisi'),
('mimesis', 'sanatın gerçeği taklit etmesi; yansıtma', 'Aristoteles''e göre sanat mimesis, yani taklit üzerine kuruludur.', 'ayt', 4, 'sanatsal yaratı', 'özgün ifade', 'soyutlama'),
('estetik', 'güzeli ve sanatı inceleyen felsefe dalı', 'Sanat eserinin değeri estetik ölçütlerle belirlenir.', 'ayt', 3, 'dilbilim dalı', 'etik felsefesi', 'tarih felsefesi'),
('trajedi', 'kahramanın çöküşünü ve yıkımını anlatan dramatik tür', 'Antigone antik Yunan trajedisinin başyapıtlarından biridir.', 'ayt', 3, 'mutlu sonla biten dramatik tür', 'komedi türü', 'pastoral şiir türü'),
('komedi', 'güldürü ve eğlence amaçlı dramatik tür', 'Molière''in komedileri insan zaaflarını ustaca yansıtır.', 'ayt', 2, 'üzücü dramatik tür', 'epik anlatı türü', 'trajik tür'),

-- ════════════════════════════════════════════════════════════════
-- YDS — +30 İngilizce akademik kelime (difficulty 3-5)
-- ════════════════════════════════════════════════════════════════

('ubiquitous', 'found or seeming to be everywhere at the same time', 'Smartphones have become ubiquitous in modern society.', 'yds', 3, 'rare and hard to find', 'dangerous and harmful', 'temporary and fleeting'),
('pervasive', 'spreading widely throughout an area or a group of people', 'Social media''s pervasive influence on youth is concerning.', 'yds', 3, 'limited to a small area', 'easily controlled', 'quickly disappearing'),
('unprecedented', 'never done or known before', 'The pandemic caused unprecedented disruption to global economies.', 'yds', 3, 'well-known and expected', 'frequently occurring', 'historically documented'),
('inherent', 'existing as a natural or permanent quality of something', 'There are inherent risks in every investment.', 'yds', 3, 'externally imposed quality', 'temporary characteristic', 'acquired through experience'),
('albeit', 'even though; although', 'The plan worked, albeit with some minor complications.', 'yds', 3, 'because of', 'in addition to', 'regardless of'),
('notwithstanding', 'in spite of; despite', 'Notwithstanding the difficulties, the project was completed on time.', 'yds', 4, 'because of the difficulties', 'in agreement with', 'with the help of'),
('hitherto', 'until now; until the particular time mentioned', 'A hitherto unknown species was discovered in the Amazon.', 'yds', 4, 'from now on', 'in the recent past', 'by that time'),
('forthcoming', 'about to happen or appear; willing to give information', 'The forthcoming election will determine the country''s future.', 'yds', 3, 'already completed', 'currently happening', 'recently concluded'),
('commensurate', 'corresponding in size or degree; proportional', 'Her salary is commensurate with her experience and skills.', 'yds', 4, 'unrelated to her skills', 'greater than deserved', 'insufficient for her work'),
('tangible', 'perceptible by touch; clear and definite, real', 'The project produced tangible results within the first year.', 'yds', 3, 'vague and uncertain', 'imaginary and conceptual', 'invisible and intangible'),
('intangible', 'unable to be touched; difficult to define or quantify', 'Brand reputation is an intangible asset of great value.', 'yds', 3, 'physically measurable', 'easily quantifiable', 'temporary and disposable'),
('scrutinize', 'to examine carefully and thoroughly', 'The committee scrutinized every detail of the proposal.', 'yds', 3, 'to ignore completely', 'to approve hastily', 'to dismiss without reading'),
('alleviate', 'to make pain, suffering, or a problem less severe', 'The new policy aims to alleviate poverty in rural areas.', 'yds', 3, 'to intensify or worsen', 'to ignore and neglect', 'to measure and quantify'),
('exacerbate', 'to make a bad situation worse', 'The drought exacerbated the food crisis in the region.', 'yds', 3, 'to improve significantly', 'to neutralize effects', 'to analyze thoroughly'),
('mitigate', 'to make less severe, serious, or painful', 'Measures were taken to mitigate the environmental impact.', 'yds', 3, 'to increase damage', 'to ignore problems', 'to delay solutions'),
('corroborate', 'to confirm or give support to a statement', 'Multiple witnesses corroborated the main suspect''s alibi.', 'yds', 4, 'to contradict evidence', 'to ignore testimony', 'to fabricate information'),
('proliferate', 'to increase rapidly in number; to spread quickly', 'Social media platforms have proliferated in recent years.', 'yds', 3, 'to decline rapidly', 'to remain stable', 'to merge together'),
('oscillate', 'to move or swing back and forth; to vary between extremes', 'Public opinion tends to oscillate between optimism and pessimism.', 'yds', 4, 'to remain constant', 'to increase steadily', 'to disappear completely'),
('ambiguous', 'open to more than one interpretation; not clear', 'The contract contained several ambiguous clauses.', 'yds', 3, 'clearly defined and precise', 'completely false', 'easily understood'),
('ambivalent', 'having mixed feelings about something; uncertain', 'She was ambivalent about accepting the job offer abroad.', 'yds', 4, 'completely certain and decided', 'strongly opposed to', 'enthusiastically supportive'),
('reciprocal', 'given or felt by each towards the other; mutual', 'The two countries signed a reciprocal trade agreement.', 'yds', 3, 'one-sided and unequal', 'compulsory and forced', 'temporary and conditional'),
('analogous', 'comparable in certain respects; similar', 'The situation is analogous to what happened in the 1930s.', 'yds', 4, 'completely different and unrelated', 'historically unprecedented', 'randomly associated'),
('autonomous', 'having the freedom to govern itself or control its own affairs', 'The region was granted autonomous status by the central government.', 'yds', 3, 'dependent on external control', 'financially supported by others', 'politically unstable'),
('demographic', 'relating to the structure of populations', 'Demographic changes are reshaping the labor market.', 'yds', 3, 'relating to geography', 'relating to economics only', 'relating to political systems'),
('empirical', 'based on observation or experience rather than theory', 'The study provided empirical evidence for the hypothesis.', 'yds', 3, 'based purely on theory', 'based on personal opinion', 'based on historical records only'),
('prevalent', 'widespread in a particular area at a particular time', 'Obesity is increasingly prevalent in developed countries.', 'yds', 3, 'rare and unusual', 'declining rapidly', 'restricted to one group'),
('cumulative', 'increasing or increased in quantity by successive additions', 'The cumulative effect of small changes can be significant.', 'yds', 3, 'decreasing over time', 'occurring all at once', 'isolated and unrelated'),
('pragmatic', 'dealing with things sensibly and realistically', 'A pragmatic approach to solving the budget deficit is needed.', 'yds', 3, 'idealistic and impractical', 'emotional and subjective', 'theoretical and abstract'),
('rhetoric', 'the art of effective speaking or writing', 'His speech was full of empty rhetoric and no concrete plans.', 'yds', 3, 'the study of logic', 'the science of numbers', 'the art of visual design'),
('phenomenon', 'a fact or situation that is observed to exist or happen', 'Climate change is a global phenomenon with local impacts.', 'yds', 3, 'a fictional event', 'a theoretical concept only', 'an unexplainable mystery');

  RAISE NOTICE '066: % kelime başarıyla eklendi.', (SELECT COUNT(*) FROM vocabulary_words);
END $migration$;
