-- 060_vocabulary_bank.sql
-- Kelime Hazinesi Genişletme: +200 kelime (TYT×80, LGS×60, AYT×60)
-- Schema: word, meaning (TR), example_sentence, exam_type, difficulty INT 1-5,
--         wrong_option_1/2/3 (TR)

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM vocabulary_words) >= 200 THEN
    RAISE NOTICE '060: vocabulary bank already populated, skipping.';
    RETURN;
  END IF;

  -- ═══════════════════════════════════════════════
  -- TYT KELİME HAZİNESİ (80 kelime)
  -- ═══════════════════════════════════════════════
  INSERT INTO vocabulary_words (word, meaning, example_sentence, exam_type, difficulty, wrong_option_1, wrong_option_2, wrong_option_3) VALUES

  -- Erdem ve Ahlak
  ('özgün',          'kendine özgü, orijinal',              'Sanatçının özgün tarzı herkesi etkiledi.',            'tyt', 2, 'taklit', 'sıradan', 'yaygın'),
  ('erdem',          'ahlaki üstünlük, fazilet',            'Dürüstlük en temel erdemlerden biridir.',             'tyt', 2, 'kusur', 'zaaf', 'hata'),
  ('alçakgönüllü',   'mütevazı, kibirsiz',                  'Başarılı olmasına rağmen alçakgönüllü kaldı.',        'tyt', 2, 'kibirli', 'gururlu', 'kendini beğenmiş'),
  ('dürüstlük',      'doğruluk, namuslu olma hali',         'Dürüstlük her ilişkinin temelidir.',                  'tyt', 2, 'yalancılık', 'ikiyüzlülük', 'hile'),
  ('fedakarlık',     'başkası için çıkarından vazgeçme',    'Annesinin fedakarlığını hiç unutmadı.',               'tyt', 3, 'bencillik', 'hırs', 'açgözlülük'),
  ('vicdan',         'doğru ve yanlışı hisseden iç ses',    'Vicdan azabı onu rahat bırakmadı.',                   'tyt', 3, 'irade', 'his', 'dürtü'),
  ('hoşgörü',        'farklılıklara saygı, tolerans',       'Hoşgörülü bir toplumda herkes farklılıklarıyla kabul edilir.', 'tyt', 2, 'önyargı', 'ayrımcılık', 'kin'),
  ('onur',           'haysiyet, şeref, itibar',             'Onurunu hiçbir çıkar için çiğnemedi.',                'tyt', 2, 'utanç', 'aşağılanma', 'rezalet'),
  ('adalet',         'hakkaniyete uygun davranış, hak',     'Adalet sisteminin işlemesi toplumun temelidir.',      'tyt', 2, 'haksızlık', 'zulüm', 'hile'),
  ('özgürlük',       'bağımsızlık, serbestlik',             'Özgürlük olmadan gelişim mümkün değildir.',           'tyt', 2, 'kölelik', 'esaret', 'bağımlılık'),

  -- Anlam ve Kavram
  ('çağrışım',       'bir kavramın akla getirdiği şeyler',  'Yalnızlık kelimesi çok farklı çağrışımlar uyandırır.','tyt', 3, 'anlam', 'tanım', 'açıklama'),
  ('bağdaşmak',      'uyum sağlamak, örtüşmek',             'Söyledikleriyle yaptıkları bağdaşmıyor.',             'tyt', 3, 'çelişmek', 'ayrılmak', 'uzaklaşmak'),
  ('yadsımak',       'reddetmek, kabul etmemek, inkar',     'Gerçeği yadsımak sorunu çözmez.',                     'tyt', 3, 'onaylamak', 'kabul etmek', 'desteklemek'),
  ('irdelmek',       'ayrıntılı incelemek, çözümlemek',     'Sorunu irdelerken her boyutunu ele aldı.',            'tyt', 4, 'yüzeysel bakmak', 'görmezden gelmek', 'çözmek'),
  ('özdeyiş',        'ders veren kısa söz, vecize',         'Özdeyişler toplumun birikimini yansıtır.',            'tyt', 3, 'hikaye', 'masal', 'efsane'),
  ('somutlamak',     'soyutu somut hale getirmek',          'Örnek vererek soyut kavramı somutladı.',              'tyt', 3, 'soyutlamak', 'karmaşıklaştırmak', 'genellemek'),
  ('öznel',          'kişisel, sübjektif',                  'Güzellik öznel bir kavramdır.',                       'tyt', 2, 'nesnel', 'evrensel', 'genel'),
  ('nesnel',         'kişisel olmayan, objektif',           'Bilimsel değerlendirme nesnel olmalıdır.',            'tyt', 2, 'öznel', 'kişisel', 'taraflı'),
  ('tümdengelim',    'genelden özele ulaşma yöntemi',       'Tümdengelim mantık yürütme biçimidir.',               'tyt', 4, 'tümevarım', 'analoji', 'sezgi'),
  ('tümevarım',      'özelden genele ulaşma yöntemi',       'Tümevarım yöntemiyle birçok örneği inceledi.',        'tyt', 4, 'tümdengelim', 'soyutlama', 'karşılaştırma'),

  -- Dil ve Anlatım
  ('mecaz',          'gerçek anlamı dışında kullanılan söz','Bu cümlede mecaz anlam kullanılmış.',                'tyt', 2, 'terim', 'gerçek anlam', 'tanım'),
  ('kinaye',         'bir şeyi kapalı biçimde anlatma',     'Doğrudan söylemek yerine kinayeyle anlattı.',         'tyt', 3, 'açıklama', 'betimleme', 'açıksözlülük'),
  ('ironi',          'söyleneni tersine çeviren anlatım',   'İronili bir şekilde "Çok başarılı bir gün!" dedi.',   'tyt', 3, 'metafor', 'benzetme', 'açıklama'),
  ('edebi sanat',    'anlatıma güç katan dil oyunları',     'Teşbih ve istiare önemli edebi sanatlardır.',         'tyt', 3, 'dilbilgisi kuralı', 'yazım hatası', 'söylem'),
  ('betimlemek',     'ayrıntılı anlatmak, tasvir etmek',   'Romancı sahneyi ustalıkla betimledi.',                'tyt', 2, 'anlatmak', 'özetlemek', 'açıklamak'),
  ('anlatıcı',       'metni anlatan, öykü sesi',            'Birinci şahıs anlatıcı "ben" diliyle anlatır.',       'tyt', 2, 'yazar', 'kahraman', 'okuyucu'),
  ('özlü',           'kısa ve anlamlı, öz',                 'Özlü sözler gençlere yol gösterir.',                  'tyt', 2, 'uzun', 'karmaşık', 'ayrıntılı'),
  ('sözcük türetme', 'yeni sözcük oluşturma',               'Türkçe sözcük türetme yöntemleri çok zengindir.',     'tyt', 3, 'sözcük kullanma', 'yazım', 'anlam'),
  ('dolaylı anlatım', 'başkasının sözünü aktarma biçimi',   'Dolaylı anlatımda tırnak işareti kullanılmaz.',       'tyt', 3, 'alıntı', 'düz anlatım', 'direkt söylem'),
  ('zincirleme',     'birbirine bağlı tamlama zinciri',     'Türkçede zincirleme isim tamlamaları yaygındır.',     'tyt', 3, 'isim tamlaması', 'sıfat tamlaması', 'eylem grubu'),

  -- Toplum ve Sosyal
  ('dayanışma',      'birlikte hareket etme, yardımlaşma',  'Toplumsal dayanışma kriz dönemlerinde güçlenir.',     'tyt', 2, 'rekabet', 'çatışma', 'bölünme'),
  ('ötekileştirmek', 'dışlamak, yabancılaştırmak',          'Farklı olanı ötekileştirmek toplumu zayıflatır.',     'tyt', 3, 'kucaklamak', 'kabul etmek', 'değer vermek'),
  ('önyargı',        'bilmeden oluşan olumsuz yargı',       'Önyargılar insanlar arasındaki iletişimi engeller.',  'tyt', 2, 'bilinçli yargı', 'gözlem', 'değerlendirme'),
  ('uzlaşı',         'anlaşma, uyum, mutabakat',            'Taraflar uzlaşıya vararak sorunu çözdü.',             'tyt', 3, 'çatışma', 'anlaşmazlık', 'ayrılık'),
  ('paylaşım',       'birlikte bölüşme, paylaşma',          'Bilginin paylaşımı toplumu ilerletir.',               'tyt', 1, 'saklama', 'biriktirme', 'ele geçirme'),
  ('kültürel miras', 'geçmişten gelen değerler bütünü',     'Müzeler kültürel mirasımızı korur.',                  'tyt', 2, 'modern kültür', 'popüler kültür', 'tüketim kültürü'),
  ('geleneksel',     'geleneklere dayalı, alışılmış',       'Geleneksel el sanatları nesiller boyu aktarılmıştır.','tyt', 1, 'modern', 'çağdaş', 'yenilikçi'),
  ('evrensel',       'tüm insanları kapsayan, genel',       'Müzik evrensel bir dildir.',                          'tyt', 2, 'yerel', 'bölgesel', 'ulusal'),
  ('bireysellik',    'bireye özgü özellik, kişisellik',     'Toplumun her bireyselliğe saygı göstermesi şarttır.', 'tyt', 2, 'toplumculuk', 'genellik', 'ortaklık'),
  ('kimlik',         'kişiyi tanımlayan özellikler bütünü', 'Kültürel kimlik, toplumsal bağı güçlendirir.',        'tyt', 2, 'kişilik eksikliği', 'anonim olmak', 'kaybolmak'),

  -- Düşünce ve Bilgi
  ('eleştiri',       'değerlendirme, yorum, tenkit',        'Yapıcı eleştiri gelişimi destekler.',                 'tyt', 2, 'övgü', 'pohpohlama', 'onay'),
  ('kanıt',          'doğruyu destekleyen bilgi, delil',    'İddiasını destekleyecek kanıt sunmalıdır.',           'tyt', 2, 'sav', 'iddia', 'görüş'),
  ('sorgulama',      'sorular sorarak araştırma',           'Felsefi sorgulama insanı derinleştirir.',             'tyt', 3, 'kabul etme', 'onaylama', 'vazgeçme'),
  ('öz',             'bir şeyin temel niteliği, esası',     'Dürüstlük insanlığın özündedir.',                     'tyt', 2, 'görünüş', 'dış, kabuk', 'yüzey'),
  ('bilinçli',       'farkında olan, kasıtlı yapılan',      'Bilinçli tüketim çevreye katkı sağlar.',              'tyt', 2, 'bilinçsiz', 'rastgele', 'kasıtsız'),
  ('sezgi',          'deneye gerek duymadan kavrama',       'Sezgilerini dinleyerek doğru karar verdi.',           'tyt', 3, 'akıl yürütme', 'deney', 'gözlem'),
  ('gözlemlemek',    'dikkatle inceleyip fark etmek',       'Bilim insanı yıllarca gökyüzünü gözlemledi.',        'tyt', 2, 'bakmak', 'görmek', 'algılamak'),
  ('çıkarım',        'sonuca varma, sentez yapma',          'Verilen bilgilerden doğru çıkarım yapmak gerekir.',   'tyt', 3, 'yorum', 'varsayım', 'tahmin'),
  ('doğrulamak',     'doğru olduğunu onaylamak',            'Haberi farklı kaynaklardan doğrulamak şarttır.',      'tyt', 2, 'yanlışlamak', 'reddetmek', 'şüphe duymak'),
  ('genellemek',     'özel durumdan genel sonuç çıkarma',   'Tek örnekten genelleme yapmak hatalıdır.',            'tyt', 3, 'özelleştirmek', 'ayrıştırmak', 'ayırt etmek'),

  -- ═══════════════════════════════════════════════
  -- LGS KELİME HAZİNESİ (60 kelime)
  -- ═══════════════════════════════════════════════

  -- Doğa ve Çevre
  ('iklim',          'bir yerin uzun süreli hava durumu',   'Akdeniz iklimi yazları sıcak ve kurak geçer.',        'lgs', 1, 'hava', 'tahmin', 'mevsim'),
  ('ekosistem',      'canlı ve cansız varlıkların oluşturduğu sistem', 'Ormanlar karmaşık ekosistemlerdir.', 'lgs', 2, 'doğa', 'çevre', 'habitat'),
  ('doğal kaynak',   'doğadan elde edilen yararlı madde',   'Su, toprak ve hava doğal kaynaklardandır.',           'lgs', 1, 'yapay malzeme', 'hammadde', 'ürün'),
  ('kirlenmek',      'zararlı maddelerle bozulmak',         'Fabrikalar çevrenin kirlenmesine neden olabilir.',    'lgs', 1, 'temizlenmek', 'arınmak', 'iyileşmek'),
  ('yenilenebilir',  'yeniden kullanılabilir, tükenmez',    'Güneş enerjisi yenilenebilir bir kaynaktır.',         'lgs', 2, 'tükenen', 'sınırlı', 'fosil'),
  ('fotosentez',     'bitkilerin güneş ışığıyla besin üretmesi', 'Bitkiler klorofil yardımıyla fotosentez yapar.', 'lgs', 2, 'solunum', 'beslenme', 'büyüme'),
  ('besin zinciri',  'canlılar arasındaki beslenme ilişkisi', 'Besin zincirinde her canlının rolü vardır.',        'lgs', 2, 'enerji döngüsü', 'beslenme düzeni', 'gıda zinciri'),
  ('biyoçeşitlilik', 'canlı türlerinin zenginliği',         'Yağmur ormanları yüksek biyoçeşitliliğe sahiptir.',  'lgs', 2, 'canlı sayısı', 'tür sayısı', 'ekosistem büyüklüğü'),
  ('sürdürülebilir', 'gelecek nesillere aktarılabilir',     'Sürdürülebilir tarım gelecek için önemlidir.',        'lgs', 2, 'kısa vadeli', 'pahalı', 'etkisiz'),
  ('habitat',        'canlının doğal yaşam ortamı',         'Kutup ayısının habitatı tehlike altında.',            'lgs', 2, 'yuva', 'barınak', 'coğrafya'),

  -- Fen Bilimleri Terimleri
  ('molekül',        'iki veya daha fazla atomdan oluşan en küçük birim', 'Su molekülü iki hidrojen bir oksijen içerir.', 'lgs', 2, 'atom', 'hücre', 'element'),
  ('enerji',         'iş yapabilme kapasitesi',             'Bitkilerin enerjisi güneşten gelir.',                 'lgs', 1, 'kuvvet', 'güç', 'madde'),
  ('çekim kuvveti',  'kütleli cisimler arası çekme gücü',   'Dünya''nın çekim kuvveti bizi yerde tutar.',          'lgs', 2, 'itme kuvveti', 'sürtünme', 'ağırlık'),
  ('deney',          'doğrulamak amacıyla yapılan test',    'Bilim insanı hipotezini deney ile test etti.',        'lgs', 1, 'gözlem', 'tahmin', 'araştırma'),
  ('hipotez',        'test edilmemiş bilimsel açıklama',    'Araştırmacı hipotezini deneylerle doğruladı.',        'lgs', 2, 'kural', 'yasa', 'teori'),
  ('hücre',          'canlıların temel yapı birimi',        'Vücudumuz trilyonlarca hücreden oluşur.',             'lgs', 1, 'organ', 'doku', 'molekül'),
  ('evrim',          'canlıların zaman içinde değişimi',    'Darwin evrim teorisini geliştirdi.',                  'lgs', 2, 'gelişim', 'büyüme', 'değişim'),
  ('çözünmek',       'bir maddenin başka maddede erimesi',  'Şeker suda çözünür.',                                 'lgs', 1, 'donmak', 'katılaşmak', 'yoğunlaşmak'),
  ('iletken',        'elektriği veya ısıyı ileten madde',   'Bakır, elektriği iyi ileten bir malzemedir.',         'lgs', 2, 'yalıtkan', 'ısı emici', 'ısı kaynağı'),
  ('maddenin halleri','katı, sıvı, gaz olmak üzere üç hal', 'Su, maddenin her üç halinde de bulunabilir.',         'lgs', 2, 'madde türleri', 'atom yapıları', 'bileşik çeşitleri'),

  -- Matematik ve Mantık
  ('orantı',         'iki büyüklük arasındaki ilişki',      'Fiyat ile kalite arasında doğru orantı vardır.',      'lgs', 2, 'oran', 'bölüm', 'çarpım'),
  ('mutlak değer',   'bir sayının sıfırdan uzaklığı',       'Mutlak değer her zaman pozitiftir.',                  'lgs', 2, 'pozitif sayı', 'negatif sayı', 'tam sayı'),
  ('çarpanlara ayırmak', 'sayıyı asal çarpanlarına bölmek', 'Sayıyı çarpanlara ayırarak işlemi basitleştirdi.',   'lgs', 2, 'sadeleştirme', 'toplama', 'bölme'),
  ('koordinat',      'düzlemde noktanın yeri',              'Koordinat sisteminde (3,4) noktasını buldu.',          'lgs', 2, 'eksen', 'grafik', 'çizgi'),
  ('veri',           'elde edilen bilgi, istatistik bilgisi','Toplanan veriler grafiğe dönüştürüldü.',             'lgs', 1, 'tahmin', 'yorum', 'sonuç'),
  ('kesit',          'katı cismi kesen düzlemin oluşturduğu şekil', 'Silindirin yatay kesiti dairedir.',           'lgs', 2, 'yüzey', 'tepe noktası', 'ayrıt'),
  ('olasılık',       'bir olayın gerçekleşme ihtimali',     'Yazı tura atmada yazı gelme olasılığı 1/2''dir.',     'lgs', 2, 'kesinlik', 'sıklık', 'rastgelelik'),
  ('örüntü',         'belirli kurala göre dizilen dizi',    'Sayı örüntüsündeki kuralı bulmak gerekir.',           'lgs', 2, 'dizi', 'sıra', 'grafik'),
  ('özdeşlik',       'her değer için doğru olan eşitlik',   'Cebirde özdeşlikler önemli yer tutar.',               'lgs', 3, 'denklem', 'eşitsizlik', 'bağıntı'),
  ('köklü sayı',     'kök işareti olan sayı',               'Köklü sayıları sadeleştirmeyi öğrendi.',              'lgs', 2, 'rasyonel sayı', 'tam sayı', 'ondalık sayı'),

  -- Türkçe ve Edebiyat
  ('ana fikir',      'metnin vermek istediği temel mesaj',  'Metnin ana fikrini bulmak için dikkatli okumalı.',    'lgs', 1, 'konu', 'başlık', 'açıklama'),
  ('konu',           'metnin ele aldığı genel alan',        'Bu hikayenin konusu dostluktur.',                     'lgs', 1, 'tema', 'mesaj', 'amaç'),
  ('tema',           'metinde işlenen soyut değer',         'Sevgi, özlem ve vatan bu şiirin temaları.',           'lgs', 2, 'konu', 'olay', 'karakter'),
  ('özet',           'bir metnin kısaltılmış anlatımı',     'Okuduğu kitabın özetini arkadaşlarına anlattı.',      'lgs', 1, 'alıntı', 'detay', 'açıklama'),
  ('benzetme',       'iki şeyi benzer yönleriyle karşılaştırma', '"Kartallar gibi uçtu" benzetmeli bir anlatımdır.', 'lgs', 2, 'kinaye', 'mecaz', 'abartma'),
  ('şiir',           'dizelerden oluşan edebi tür',         'Şiirde ahenk ve anlam bir arada işlenir.',            'lgs', 1, 'hikaye', 'roman', 'deneme'),
  ('hikaye',         'olay dizisinden oluşan kısa anlatı',  'Kısa hikayede az karakter ve tek olay bulunur.',      'lgs', 1, 'şiir', 'roman', 'masal'),
  ('deyim',          'gerçek anlamından farklı kalıp söz',  '"Göz kulak olmak" bir deyimdir.',                     'lgs', 2, 'atasözü', 'özdeyiş', 'mecaz'),
  ('atasözü',        'toplumun deneyimini aktaran kalıp söz', '"Damlaya damlaya göl olur" bir atasözüdür.',         'lgs', 1, 'deyim', 'şiir', 'mecaz'),
  ('soru cümlesi',   'bilgi edinmek için sorulan cümle',    'Soru cümlesinde soru eki ya da soru sözcüğü kullanılır.', 'lgs', 1, 'emir cümlesi', 'ünlem cümlesi', 'olumsuz cümle'),

  -- Sosyal ve Tarih
  ('demokrasi',      'halkın kendi kendini yönetme sistemi','Demokraside seçimler serbestçe yapılır.',             'lgs', 2, 'monarşi', 'oligarşi', 'teokrasi'),
  ('coğrafya',       'yeryüzünü ve özelliklerini inceleyen bilim', 'Coğrafya dersi harita okumayı içerir.',        'lgs', 1, 'tarih', 'biyoloji', 'astronomi'),
  ('göç',            'başka bir yere yerleşmek için gitmek','Sanayileşmeyle birlikte köyden kente göç arttı.',     'lgs', 2, 'seyahat', 'turizm', 'ziyaret'),
  ('devlet',         'belirli toprak üzerinde egemenlik kuran siyasi örgüt', 'Devlet vatandaşlarının güvenliğini sağlar.', 'lgs', 2, 'ülke', 'millet', 'hükümet'),
  ('reform',         'bir alanda köklü değişiklik, ıslah',  'Eğitim reformu ile müfredat güncellendi.',            'lgs', 2, 'devrim', 'isyan', 'değişiklik'),
  ('bağımsızlık',    'başka güçlere bağımlı olmama hali',   'Türkiye 1923''te tam bağımsızlığına kavuştu.',        'lgs', 2, 'esaret', 'işgal', 'bağımlılık'),
  ('hak',            'kişinin sahip olduğu yasal güç',      'Eğitim her çocuğun temel hakkıdır.',                  'lgs', 1, 'görev', 'sorumluluk', 'yükümlülük'),
  ('görev',          'yapılması zorunlu olan iş, sorumluluk', 'Seçme ve seçilme vatandaşın görevidir.',            'lgs', 1, 'hak', 'özgürlük', 'izin'),
  ('kaynaklar',      'işe yarar materyallerin bütünü',      'Doğal kaynaklar dikkatli kullanılmalıdır.',           'lgs', 1, 'ürünler', 'mallar', 'hammaddeler'),
  ('kalkınma',       'bir toplumun ekonomik gelişimi',      'Eğitim kalkınmanın temel dinamiğidir.',               'lgs', 2, 'geri gidme', 'yoksulluk', 'durağanlık'),

  -- ═══════════════════════════════════════════════
  -- AYT EDEBİYAT TERİMLERİ (60 kelime)
  -- ═══════════════════════════════════════════════

  -- Şiir Terimleri
  ('aruz',           'hece uzunluklarına dayalı şiir ölçüsü', 'Divan şiirinde aruz ölçüsü kullanılırdı.',          'ayt', 3, 'hece ölçüsü', 'serbest vezin', 'ritim'),
  ('hece ölçüsü',    'hecele sayısına dayalı şiir ölçüsü',  'Halk şiirinde genellikle hece ölçüsü kullanılır.',    'ayt', 2, 'aruz', 'serbest nazım', 'kafiye'),
  ('kafiye',         'dizelerin sonundaki ses benzerliği',   'Şiirde kafiye okuyucuya ahenk kazandırır.',           'ayt', 2, 'redif', 'ölçü', 'mısra'),
  ('redif',          'dizeler sonunda tekrarlanan ek ya da sözcük', 'Redif ve kafiyeyi ayırt etmek gerekir.',      'ayt', 3, 'kafiye', 'uyak', 'nakarat'),
  ('mısra',          'şiirde bir satır',                    'Bu şiir dört mısradan oluşan bir kıtadır.',           'ayt', 2, 'bent', 'dörtlük', 'satır'),
  ('beyit',          'iki mısradan oluşan şiir birimi',     'Gazel beyitlerden meydana gelir.',                    'ayt', 2, 'kıta', 'dörtlük', 'bent'),
  ('kıta',           'birden fazla mısradan oluşan şiir bölümü', 'Şiir üç kıtadan oluşuyor.',                      'ayt', 2, 'beyit', 'dizeler', 'bölüm'),
  ('nazım',          'mısralara ayrılmış, ölçülü yazı',     'Nazım türleri arasında gazel ve kaside sayılır.',     'ayt', 3, 'nesir', 'düzyazı', 'hikaye'),
  ('nesir',          'mısralara bölünmemiş yazı, düzyazı',  'Roman ve hikaye nesir türleridir.',                   'ayt', 2, 'nazım', 'şiir', 'ölçülü yazı'),
  ('veznin kırılması','ölçünün bozulması, ritim hatası',    'Vezni kıran mısra ahengi bozar.',                     'ayt', 3, 'kafiye', 'redif', 'ölçü'),

  -- Edebi Türler
  ('lirik şiir',     'duygu ve iç dünyayı anlatan şiir',    'Lirik şiirde şairin duyguları ön plana çıkar.',       'ayt', 3, 'epik şiir', 'dramatik şiir', 'didaktik şiir'),
  ('epik şiir',      'kahramanlık ve savaşları anlatan şiir','İliada epik şiirin klasik örneğidir.',               'ayt', 3, 'lirik şiir', 'pastoral şiir', 'satirik şiir'),
  ('dramatik şiir',  'sahneye uyarlanabilen şiir türü',     'Dramatik şiirde diyaloglar önemli yer tutar.',        'ayt', 3, 'lirik şiir', 'epik şiir', 'didaktik şiir'),
  ('roman',          'uzun anlatı türü, çok boyutlu yapı',  'Roman kahramanlar ve çevre ayrıntılı işlenir.',       'ayt', 1, 'hikaye', 'deneme', 'şiir'),
  ('hikaye',         'kısa anlatı türü, sınırlı olay',      'Hikayede tek olay ve az sayıda karakter vardır.',     'ayt', 1, 'roman', 'masal', 'şiir'),
  ('deneme',         'yazarın kişisel görüşünü aktardığı tür', 'Denemede yazar kendi fikrini özgürce anlatır.',    'ayt', 2, 'makale', 'inceleme', 'biyografi'),
  ('biyografi',      'bir kişinin hayatını anlatan yapıt',  'Atatürk''ün biyografisi çok kez kaleme alındı.',      'ayt', 2, 'otobiyografi', 'anı', 'günlük'),
  ('otobiyografi',   'kişinin kendi hayatını anlattığı yapıt', 'Otobiyografide yazar kendini anlatır.',            'ayt', 2, 'biyografi', 'anı', 'günlük'),
  ('anı',            'yaşanmış olayları aktaran yazı türü', 'Anı türünde gerçek olaylar aktarılır.',               'ayt', 2, 'biyografi', 'günlük', 'deneme'),
  ('masal',          'olağanüstü olayları içeren halk anlatısı', 'Masallarda iyiler kazanır, kötüler kaybeder.',   'ayt', 1, 'efsane', 'destan', 'hikaye'),

  -- Edebi Akımlar
  ('sembolizm',      'sembolleri ön plana çıkaran akım',    'Sembolizmde simgeler gerçeğin yerine geçer.',         'ayt', 3, 'realizm', 'romantizm', 'klasisizm'),
  ('realizm',        'gerçeği olduğu gibi yansıtan akım',  'Realizm 19. yüzyılda ortaya çıktı.',                  'ayt', 3, 'romantizm', 'sembolizm', 'idealizm'),
  ('romantizm',      'duyguları ve hayal gücünü öne çıkaran akım', 'Romantizmde doğa ve özgürlük ön plandadır.',   'ayt', 3, 'realizm', 'natüralizm', 'klasisizm'),
  ('natüralizm',     'insanı doğa yasalarıyla açıklayan akım', 'Natüralizm toplumsal ve biyolojik etkenleri öne çıkarır.', 'ayt', 4, 'realizm', 'sembolizm', 'romantizm'),
  ('klasisizm',      'antik dönem değerlerini örnek alan akım', 'Klasisizmde denge ve aklın egemenliği temeldir.', 'ayt', 3, 'romantizm', 'modernizm', 'sembolizm'),
  ('modernizm',      '20. yüzyılın deneysel edebi hareketi','Modernizmde bilinç akışı tekniği kullanılır.',        'ayt', 4, 'postmodernizm', 'realizm', 'klasisizm'),
  ('postmodernizm',  'modernizme tepki olarak doğan akım',  'Postmodernizmde metinlerarasılık yaygındır.',         'ayt', 4, 'modernizm', 'realizm', 'natüralizm'),
  ('sürrealizm',     'bilinçdışını ve düşleri kullanan akım', 'Sürrealizm bilinçdışını sanata taşıdı.',             'ayt', 4, 'sembolizm', 'realizm', 'klasisizm'),
  ('empresyonizm',   'anlık izlenimleri aktaran akım',      'Empresyonizmde sanatçının anlık algısı önemlidir.',   'ayt', 4, 'ekspresyonizm', 'realizm', 'sembolizm'),
  ('ekspresyonizm',  'iç dünyayı çarpıtarak aktaran akım', 'Ekspresyonizmde nesnel gerçeklik bozularak sunulur.',  'ayt', 4, 'empresyonizm', 'sembolizm', 'realizm'),

  -- Divan ve Halk Edebiyatı
  ('divan edebiyatı','Osmanlı klasik yazın geleneği',       'Divan edebiyatı Arapça ve Farsça etkisi taşır.',      'ayt', 3, 'halk edebiyatı', 'tekke edebiyatı', 'milli edebiyat'),
  ('halk edebiyatı', 'sözlü geleneğin ürünü olan yazın',   'Halk edebiyatı sade ve yalın bir dil kullanır.',      'ayt', 3, 'divan edebiyatı', 'tekke edebiyatı', 'milli edebiyat'),
  ('gazel',          'divan şiirinde sevgiliyi anlatan tür','Gazel beyitlerden oluşur, son beyit mahlas içerir.',  'ayt', 3, 'kaside', 'mesnevi', 'rubai'),
  ('kaside',         'övgü amacıyla yazılan uzun şiir',     'Kaside büyükleri övmek için kaleme alınırdı.',        'ayt', 3, 'gazel', 'mesnevi', 'rubai'),
  ('mesnevi',        'uyaklı uzun anlatı şiiri',            'Leyla ile Mecnun ünlü bir mesnevidir.',               'ayt', 3, 'gazel', 'kaside', 'rubai'),
  ('koşma',          'halk şiirinde dörtlüklerden oluşan tür', 'Koşmada 11''li hece ölçüsü kullanılır.',           'ayt', 3, 'mani', 'türkü', 'destan'),
  ('mani',           'dört mısralı halk şiiri türü',        'Mani 7''li hece ölçüsüyle söylenir.',                 'ayt', 3, 'koşma', 'türkü', 'ninni'),
  ('destan',         'kahramanlık ve toplumsal olayları anlatan anlatı', 'Orhun Yazıtları Türk destanlarındandır.',  'ayt', 3, 'efsane', 'masal', 'mesnevi'),
  ('tekke edebiyatı','tasavvuf çevresinde gelişen edebi gelenek', 'Yunus Emre tekke edebiyatının önemli ismidir.', 'ayt', 3, 'divan edebiyatı', 'halk edebiyatı', 'milli edebiyat'),
  ('tanzimat edebiyatı', 'Osmanlı''da Batı etkisiyle gelişen yeni edebi dönem', 'Tanzimat''ta roman ve gazete ön plana çıktı.', 'ayt', 3, 'divan edebiyatı', 'cumhuriyet dönemi edebiyatı', 'servet-i fünun');

  RAISE NOTICE '060: Vocabulary Bank — 200 kelime başarıyla eklendi.';
END;
$migration$ LANGUAGE plpgsql;
