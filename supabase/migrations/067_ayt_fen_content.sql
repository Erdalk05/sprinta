-- ================================================================
-- 067_ayt_fen_content.sql
-- AYT Fizik (5), Kimya (5), Biyoloji (5) metinleri — 15 metin, 45 soru
-- ================================================================

-- ----------------------------------------------------------------
-- AYT FİZİK 1: Özel Görelilik Teorisi
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Özel Görelilik Teorisi',
  $BODY$Albert Einstein, 1905 yılında bilim dünyasını derinden sarsan özel görelilik teorisini yayımladı. Bu teori, fizik anlayışımızı kökten değiştiren iki temel postülat üzerine kurulmuştur: Birincisi, fizik yasaları tüm eylemsiz referans çerçevelerinde aynı biçimde geçerlidir. İkincisi ve belki de en çarpıcı olanı, ışığın boşluktaki hızının her gözlemci için sabit olduğudur; bu değer saniyede yaklaşık 299.792 kilometre olup hiçbir cisim tarafından aşılamaz.

Özel göreliliğin en ilgi çekici sonuçlarından biri zaman genişlemesidir. Işık hızına yakın hareket eden bir nesne için zamanın daha yavaş aktığı matematiksel olarak kanıtlanmıştır. Bunu somutlaştırmak için "ikizler paradoksunu" düşünebiliriz: Uzayda ışık hızına yakın bir hızla seyahat eden ikizlerden biri, Dünya'da kalan kardeşine göre daha yavaş yaşlanır. Bu etki, yüksek hızlara ulaşabilen parçacık hızlandırıcılarında bizzat gözlemlenmiştir.

Uzunluk kısalması da özel göreliliğin önemli bir tahminidir. Işık hızına yakın hareket eden bir nesnenin hareketi yönündeki boyu, durağan bir gözlemciye göre kısalmış görünür. Hız arttıkça bu kısalma daha belirgin hale gelir ve teorik olarak ışık hızına ulaşıldığında nesnenin boyu sıfıra iner; ancak bu durum gerçekleşemez çünkü kütleli bir cismin ışık hızına ulaşması sonsuz enerji gerektirir.

Einstein'ın en ünlü formülü olan E=mc², kütle ile enerjinin birbirine dönüşebilir olduğunu gösterir. Burada E enerjiyi, m kütleyi ve c ışığın hızını temsil eder. Bu eşitlik, küçük miktarda maddenin bile muazzam enerji miktarlarına karşılık geldiğini ortaya koyar. Nükleer enerji santrallerinin ve atom bombalarının çalışma prensibi bu denkleme dayanır.

Özel görelilik teorisi, modern teknoloji üzerinde de somut etkiler bırakmıştır. GPS uydu sistemleri, görelilik etkilerini hesaba katmak zorundadır. Yörüngede hızla hareket eden uydular hafif bir zaman genişlemesi yaşarken, yerçekiminin daha güçlü olduğu yüzeyde saatler farklı bir hızda ilerler. Bu iki etki düzeltilmezse GPS sistemleri günde birkaç kilometre hata yapar ve pratik kullanımlarını yitirir.

Einstein'ın teorisi başlangıçta pek çok fizikçi tarafından şüpheyle karşılandı. Ancak onlarca yıl süren deneyler ve gözlemler teorinin öngörülerini defalarca doğruladı. Özel görelilik, bugün modern fiziğin temel taşlarından biri olup parçacık fiziği, astrofizik ve kozmoloji gibi pek çok alanda vazgeçilmez bir çerçeve sunmaktadır. Newton mekaniğini geçersiz kılmak yerine onu ışık hızından çok daha düşük hızlar için geçerli bir özel durum olarak konumlandırır.$BODY$,
  'AYT Fizik',
  'AYT',
  5,
  430,
  'balanced',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Einstein''ın özel görelilik teorisi fizik anlayışımızı kökten değiştirmiş; zaman, uzunluk, kütle-enerji ilişkisi ve pratik uygulamalar bakımından devrimsel sonuçlar doğurmuştur.", "GPS sistemleri görelilik etkilerini hesaba katmak zorundadır ve bu nedenle günlük hayatta büyük hatalar oluşabilir.", "Işık hızı tüm gözlemciler için sabit olup saniyede 299.792 kilometre değerini alır.", "Zaman genişlemesi ve uzunluk kısalması yalnızca teorik kavramlardır ve deneysel olarak kanıtlanamamıştır.", "E=mc² formülü yalnızca nükleer enerji santrallerinin tasarımında kullanılmaktadır."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Özel Görelilik Teorisi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre GPS sistemlerinin görelilik etkilerini hesaba katmaması durumunda ne olur?',
  '["Uydular yörüngeden çıkar ve Dünya''ya düşer.", "GPS sistemleri günde birkaç kilometre hata üretir ve pratik kullanımını yitirir.", "Işık hızı ölçümleri yanlış hesaplanır.", "Zaman genişlemesi tamamen ortadan kalkar.", "Uydu saatleri Dünya saatleriyle eşitlenir."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Özel Görelilik Teorisi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Newton mekaniği tamamen yanlış olduğu için artık hiçbir fizik alanında kullanılmamaktadır.", "Özel görelilik teorisi, Newton mekaniğini düşük hızlar için özel bir durum olarak kapsamakta ve onu geçersiz kılmamaktadır.", "Işık hızından daha hızlı seyahat etmek teorik olarak mümkündür ancak henüz gerçekleştirilememiştir.", "İkizler paradoksu yalnızca düşünce deneyi niteliğinde olup hiçbir zaman test edilemez.", "E=mc² formülü yalnızca ışık hızına yakın hızlarda hareket eden cisimler için geçerlidir."]'::jsonb,
  1,
  'inference'
FROM text_library WHERE title = 'Özel Görelilik Teorisi';

-- ----------------------------------------------------------------
-- AYT FİZİK 2: Kuantum Mekaniği ve Dalga-Parçacık İkilemi
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Kuantum Mekaniği ve Dalga-Parçacık İkilemi',
  $BODY$Yirminci yüzyılın başlarında fizikçiler, atom altı dünyasının klasik mekanikle açıklanamayacağını fark ettiler. Bu keşif, kuantum mekaniğinin doğmasına zemin hazırladı. 1924 yılında Louis de Broglie, devrim niteliğinde bir hipotez öne sürdü: Işığın hem dalga hem parçacık özelliği gösterdiği gibi, elektronlar ve diğer madde parçacıkları da dalga özellikleri taşıyabilir. De Broglie'ye göre bir parçacığın dalga boyu, Planck sabitinin parçacığın momentumuyla oranına eşittir.

Bu hipotezi destekleyen en çarpıcı deney, çift yarık deneyidir. Bir elektron demeti iki dar yarığın bulunduğu bir engele doğrultulduğunda, engelin arkasındaki ekranda girişim deseni oluşur. Bu desen ancak dalgaların üst üste gelmesiyle açıklanabilir; oysa elektronlar parçacıktır. Daha da ilginç olan şudur: Elektronlar tek tek gönderildiğinde dahi, yeterli sayıda elektron biriktikten sonra aynı girişim deseni ortaya çıkar. Bu durum, her elektronun aynı anda her iki yarıktan geçer gibi davrandığına işaret eder.

Werner Heisenberg, 1927'de belirsizlik ilkesini formüle etti. Bu ilkeye göre bir parçacığın konumu ve momentumu aynı anda sonsuz hassasiyetle ölçülemez: Birinin belirsizliği azaldıkça diğerinin belirsizliği zorunlu olarak artar. Bu sınır, ölçüm aletlerinin yetersizliğinden değil, doğanın temel yapısından kaynaklanır. Heisenberg belirsizlik ilkesi, klasik fiziğin belirlenimci dünya görüşünü temelden sarstı.

Kuantum mekaniğinin başka bir çarpıcı fenomeni de kuantum tünelemesidir. Klasik fizikte, bir nesnenin kinetiğinden daha yüksek bir potansiyel enerji bariyerini aşması mümkün değildir. Ancak kuantum mekaniğinde parçacıkların bu bariyerin "içinden geçebildiği", yani tünellediği gözlemlenmiştir. Bu olgu, güneşin enerji üretiminde temel rol oynar: Güneşin çekirdeğindeki protonlar, kuantum tünelemesi sayesinde Coulomb bariyerini aşarak füzyon gerçekleştirebilir.

Kuantum tünelemesi teknolojik uygulamalarda da büyük önem taşır. Tünel diyotları, flash bellek devreler ve taramalı tünel mikroskobu (STM) bu prensibe dayanır. STM, yüzeylerin atomik düzeyde görüntülenmesini sağlayarak malzeme bilimi ve nanoteknolojiye büyük katkı sunar.

Kuantum mekaniği, sezgilerimize aykırı sonuçları ve olasılıksal doğasıyla klasik fizikten köklü biçimde ayrılır. Schrödinger'in denklemleri parçacıkların kesin konumlarını değil, olası konumlarının olasılık dağılımlarını verir. Bu yoruma göre ölçüm yapılana kadar parçacık birden fazla durumda aynı anda bulunabilir. Modern elektronik, yarı iletkenler ve lazer teknolojisi bu teorik çerçevenin pratik ürünleridir.$BODY$,
  'AYT Fizik',
  'AYT',
  5,
  435,
  'inference',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Kuantum mekaniği, atom altı dünyanın dalga-parçacık ikiliği, belirsizlik ilkesi ve tüneleme gibi klasik fiziğe aykırı olgularla yönetildiğini ortaya koymaktadır.", "De Broglie hipotezi yalnızca elektronlara uygulanabilir; proton ve nötronlar için geçersizdir.", "Çift yarık deneyi, elektronların yalnızca parçacık özelliği taşıdığını kanıtlamıştır.", "Heisenberg belirsizlik ilkesi, ölçüm aletlerinin yetersizliğinden kaynaklanan pratik bir sınırlamadır.", "Kuantum tünelemesi yalnızca güneşin enerji üretiminde rol oynar ve teknolojik uygulaması yoktur."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Kuantum Mekaniği ve Dalga-Parçacık İkilemi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre çift yarık deneyinde elektronlar tek tek gönderildiğinde ne gözlemlenir?',
  '["Ekranda yalnızca iki ayrı çizgi oluşur ve girişim deseni kaybolur.", "Yeterli sayıda elektron biriktikten sonra yine girişim deseni ortaya çıkar.", "Elektronlar engeli aşamaz ve ekrana ulaşamaz.", "Her elektron yalnızca bir yarıktan geçerek düz bir iz bırakır.", "Girişim deseni ancak yüksek enerjili elektronlarla elde edilebilir."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Kuantum Mekaniği ve Dalga-Parçacık İkilemi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Kuantum mekaniği yalnızca teorik bir çerçeve olup teknolojik uygulaması bulunmamaktadır.", "Heisenberg belirsizlik ilkesi gelecekte daha hassas aletler geliştirildiğinde ortadan kalkacaktır.", "Kuantum mekaniğinin sezgiye aykırı sonuçları, günümüz teknolojilerinin işleyişinde somut rol oynamaktadır.", "Klasik fizik atom altı boyutlarda da geçerliliğini korur; kuantum mekaniği gereksizdir.", "De Broglie hipotezi deneysel olarak hiç doğrulanmamış spekülatif bir öneride kalmıştır."]'::jsonb,
  2,
  'inference'
FROM text_library WHERE title = 'Kuantum Mekaniği ve Dalga-Parçacık İkilemi';

-- ----------------------------------------------------------------
-- AYT FİZİK 3: Nükleer Fizik ve Radyoaktivite
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Nükleer Fizik ve Radyoaktivite',
  $BODY$Atomun çekirdeği, pozitif yüklü protonlar ve yüksüz nötronlardan oluşur. Aynı yüklü protonların birbirini itmesine karşın çekirdeğin bir arada durabilmesi, nükleer kuvvet adı verilen güçlü çekim kuvvetinin varlığıyla açıklanır. Bu kuvvet, elektromanyetik kuvvetten çok daha güçlü olmakla birlikte yalnızca çok kısa mesafelerde etkilidir. Bir çekirdeği oluşturan nükleonların (proton ve nötron) kütleleri toplamı, çekirdeğin gerçek kütlesinden fazladır; bu fark "kütle açığı" olarak adlandırılır ve Einstein'ın E=mc² formülüyle bağlanma enerjisine karşılık gelir.

Kararsız çekirdekler, kendiliğinden parçalanarak daha kararlı yapılara dönüşür; bu sürece radyoaktif bozunma denir. Üç temel bozunma türü vardır. Alfa bozunmasında çekirdek, iki proton ve iki nötrondan oluşan alfa parçacığı (helyum çekirdeği) yayar; bu parçacık kağıt gibi ince bir engel tarafından durdurulabilir. Beta bozunmasında bir nötron, protona dönüşerek elektron (beta eksi) ya da pozitron (beta artı) yayar. Gama bozunması ise çekirdekteki fazla enerjinin yüksek enerjili elektromanyetik radyasyon biçiminde salınmasıdır; gama ışınları kurşun veya kalın beton gibi yoğun maddelerle ancak kısmen engellenebilir.

Radyoaktif bozunmanın hızını tanımlayan en önemli kavram yarılanma ömrüdür. Bir radyoaktif nuklid'in yarısı kadar bozunmasının tamamlandığı süre olan yarılanma ömrü, elementin kimyasal veya fiziksel durumundan bağımsız olarak sabittir. Karbon-14'ün yaklaşık 5.730 yıllık yarılanma ömrü, arkeolojik kalıntıların tarihlendirilmesinde kullanılan radyokarbon tarihleme yönteminin temelini oluşturur.

Nükleer fisyon, ağır bir çekirdeğin (uranyum-235 veya plütonyum-239 gibi) nötron soğurarak iki daha küçük çekirdeğe bölünmesidir. Bu süreçte açığa çıkan enerji, kimyasal reaksiyonlara kıyasla milyon kez daha büyüktür. Zincirleme reaksiyon kontrolsüz sürdüğünde nükleer silah, kontrollü biçimde yönetildiğinde ise nükleer enerji santrali ortaya çıkar.

Nükleer füzyon, hafif çekirdeklerin (hidrojen izotopları gibi) birleşerek daha ağır bir çekirdek oluşturmasıdır. Güneş ve diğer yıldızlar enerjilerini bu yolla üretir. Füzyon, fisyona kıyasla çok daha fazla enerji verir ve uzun ömürlü radyoaktif atık üretmez; bu nedenle kontrollü füzyon reaktörü geliştirmek, yüzyılımızın en büyük bilimsel hedeflerinden biridir. ITER projesi bu amaçla uluslararası iş birliğiyle sürdürülen dev bir araştırma girişimidir.$BODY$,
  'AYT Fizik',
  'AYT',
  5,
  440,
  'detail',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Nükleer fizik; çekirdek yapısı, radyoaktif bozunma türleri, yarılanma ömrü ile fisyon ve füzyon reaksiyonlarını kapsayan temel bir bilim dalıdır.", "Radyoaktif bozunma yalnızca alfa ve beta türlerinden oluşur; gama bozunması bağımsız bir süreç değildir.", "Nükleer fisyon, füzyondan çok daha fazla enerji ürettiği için tercih edilen enerji kaynağıdır.", "Yarılanma ömrü, elementin kimyasal bileşimine göre değişen bir zaman dilimidir.", "Karbon-14 tarihleme yöntemi yalnızca jeolojik çalışmalarda kullanılır, arkeolojide uygulanamaz."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Nükleer Fizik ve Radyoaktivite';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre alfa parçacığının temel özelliği nedir?',
  '["Çok yüksek enerjili elektromanyetik radyasyon yayar ve kalın kurşunla durdurulur.", "İki proton ve iki nötrondan oluşan helyum çekirdeğidir; kağıt gibi ince bir engelle durdurulabilir.", "Nötronun protona dönüşmesiyle oluşan yüksüz bir parçacıktır.", "Gama ışınlarından daha büyük penetrasyon gücüne sahiptir.", "Sadece ağır çekirdeklerin nötron soğurmasıyla ortaya çıkar."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Nükleer Fizik ve Radyoaktivite';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Nükleer fisyon ve füzyon teknolojileri tamamen olgunlaşmış olup artık yeni araştırma gerektirmemektedir.", "Kontrollü nükleer füzyon reaktörü geliştirilebilirse, daha temiz ve daha verimli bir enerji kaynağı elde edilmiş olacaktır.", "Radyokarbon tarihleme yöntemi, yarılanma ömrünün kimyasal koşullara bağlı olması sayesinde güvenilir sonuçlar verir.", "Nükleer kuvvet, elektromanyetik kuvvetten daha zayıf olduğu için protonlar arasındaki itmeyi dengeleyemez.", "Zincirleme reaksiyon yalnızca nükleer silahlarda gerçekleşebilir; enerji santrallerinde bu süreç mümkün değildir."]'::jsonb,
  1,
  'inference'
FROM text_library WHERE title = 'Nükleer Fizik ve Radyoaktivite';

-- ----------------------------------------------------------------
-- AYT FİZİK 4: Elektromanyetik Dalgalar ve Işığın Doğası
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Elektromanyetik Dalgalar ve Işığın Doğası',
  $BODY$James Clerk Maxwell, 1865 yılında elektrik ve manyetizmanın birleşik bir teorisini ortaya koydu. Maxwell denklemleri, değişen elektrik alanının manyetik alan, değişen manyetik alanın da elektrik alanı oluşturduğunu göstermekteydi. Bu karşılıklı etkileşim, boşlukta kendi kendini taşıyabilen bir dalga üretir. Maxwell'in hesaplamalarına göre bu dalgaların hızı, deneysel olarak ölçülen ışık hızıyla mükemmel biçimde örtüşüyordu. Böylece ışığın elektromanyetik bir dalga olduğu ilk kez teorik düzeyde kanıtlandı.

Elektromanyetik tayfı, dalga boyu ve frekanslarına göre farklı kategorilere ayrılır. En uzun dalgaboyluna sahip radyo dalgalarından başlayarak mikrodalga, kızılötesi, görünür ışık, morötesi, X ışınları ve gama ışınlarına kadar uzanan bu tayf, tek bir fiziksel olgunun farklı enerji seviyelerindeki tezahürleridir. Tüm bu dalgalar boşlukta aynı hızla yayılır; yalnızca frekansları ve dolayısıyla taşıdıkları enerji miktarları farklıdır. Frekans arttıkça enerji artar: E = hf bağıntısı bunu matematiksel olarak ifade eder.

Işığın dalga doğası, girişim ve kırınım deneyleriyle kesin biçimde ortaya konmuştu. Ancak 1887'de Heinrich Hertz'in gerçekleştirdiği fotoelektrik etki deneyi bu tabloya ciddi bir soru işareti ekledi. Metal yüzeylere belirli bir frekanstan daha yüksek frekanslı ışık vurulduğunda elektron fırlatıldığı gözlemlendi; üstelik bu eşik frekansı aşılmadan ışığın şiddeti ne kadar artırılırsa artırılsın elektron kopamıyordu. Dalga modeli bu gözlemi açıklamakta yetersiz kalıyordu.

Einstein, 1905 yılında bu sorunu, ışığın "foton" adı verilen enerji paketlerinden oluştuğunu öne sürerek çözdü. Her foton, E = hf formülüyle ifade edilen belirli bir enerji taşır. Bir elektronu metalden koparacak fotonun taşıması gereken minimum enerji o maddeye özgü eşik frekansıyla belirlenir. Bu açıklama, ışığın hem dalga hem parçacık özelliği taşıdığını gösterir; bu ikiliğe dalga-parçacık dualitesi denir.

Elektromanyetik dalgalar, modern yaşamın her köşesinde karşımıza çıkar. Radyo ve televizyon yayıncılığı, cep telefonu iletişimi, Wi-Fi ağları, X ışını görüntüleme, mikrodalga fırınlar, kızılötesi ısıtma sistemleri ve güneş enerjisi panelleri bu dalgaların farklı bölgelerini kullanan uygulamalar arasındadır. Elektromanyetik tayfın anlaşılması, yalnızca temel fiziğe değil tıptan haberleşmeye, savunma sanayisinden astronomiye uzanan geniş bir uygulama alanına katkı sağlamaktadır.$BODY$,
  'AYT Fizik',
  'AYT',
  4,
  438,
  'balanced',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Elektromanyetik dalgalar; Maxwell''in teorik temelleri, ışığın dalga-parçacık dualitesi ve geniş uygulama alanlarıyla modern fiziğin ve teknolojinin temel taşlarından biridir.", "Işığın dalga doğası fotoelektrik etki deneyi ile kesin olarak kanıtlanmış ve foton kavramı gereksiz hale gelmiştir.", "Maxwell denklemleri yalnızca görünür ışık için geçerli olup diğer elektromanyetik dalgalara uygulanamaz.", "Fotoelektrik etkide ışığın şiddeti artırıldığında daha fazla elektron kopar ve bu dalga modeliyle açıklanır.", "Elektromanyetik tayfın farklı bölgeleri birbirinden tamamen bağımsız fiziksel olgulardır."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Elektromanyetik Dalgalar ve Işığın Doğası';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre fotoelektrik etkide elektron kopması için gerekli temel koşul nedir?',
  '["Işığın şiddeti ne olursa olsun, yeterince uzun süre metal yüzeye vurması gerekir.", "Işığın frekansı, o maddeye özgü eşik frekansını aşmalıdır.", "Metal yüzeyin belirli bir sıcaklığın üzerinde olması zorunludur.", "Fotonların dalga boyunun görünür ışık bölgesinde bulunması gerekir.", "Işık şiddetinin minimum bir değerin üzerinde olması yeterlidir."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Elektromanyetik Dalgalar ve Işığın Doğası';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Maxwell''in denklemleri ışığın foton yapısını öngördüğü için Einstein''ın katkısı gereksiz kalmıştır.", "Işığın dalgaparçacık dualitesi, birbirini dışlayan iki modelin çelişkisini değil; doğanın farklı koşullarda farklı özellikler sergilemesini yansıtmaktadır.", "Elektromanyetik tayftaki tüm dalgalar aynı enerjiyi taşıdığından pratik uygulamalar açısından aralarında fark yoktur.", "Fotoelektrik etki deneyi, dalga modelini tamamen geçersiz kılmış ve ışığın yalnızca parçacık olduğunu kanıtlamıştır.", "Maxwell denklemleri deneysel verilerden değil, tamamen sezgisel düşünceden türetilmiştir."]'::jsonb,
  1,
  'inference'
FROM text_library WHERE title = 'Elektromanyetik Dalgalar ve Işığın Doğası';

-- ----------------------------------------------------------------
-- AYT FİZİK 5: Termodinamik Yasalar
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Termodinamik Yasalar',
  $BODY$Termodinamik, ısı, iş ve enerji arasındaki ilişkileri inceleyen bir fizik dalıdır. Temelinde dört yasa bulunmakla birlikte bilim tarihinde sonradan eklenen sıfırıncı yasayla bu sayı beşe ulaşmıştır. Sıfırıncı yasa, termal dengenin geçişken olduğunu ifade eder: A ile B dengede, B ile C dengede ise A ile C de termal dengededir. Bu yasa, sıcaklık ölçümünün kavramsal temelini oluşturur.

Birinci yasa, enerjinin korunumu ilkesinin termodinamik biçimidir. Bir sisteme verilen ısı, sistemin iç enerjisini artırır ve sistemin dışarıya yaptığı işe harcanır: Q = ΔU + W. İç enerji moleküllerin kinetik ve potansiyel enerjilerinin toplamıdır. Bu yasa, hiçbir sistemin verilen enerjiden fazlasını çıktı olarak üretemeyeceğini, yani birinci tür sürekli hareketli makinenin (perpetuum mobile) imkânsız olduğunu garantilemektedir.

İkinci yasa, belki de termodinamiğin en derin ve çarpıcı yasasıdır. Isı, kendiliğinden yalnızca sıcak cisimden soğuk cisme akar; tersi spontane olarak gerçekleşmez. Bu asimetri, entropi kavramıyla formüle edilir. Entropi, bir sistemin düzensizlik ya da olasılıksal dağılım ölçüsüdür; izole bir sistemin entropisi zamanla her zaman artar veya sabit kalır, hiçbir zaman kendiliğinden azalmaz. Bu ilke, evrenin neden tek bir yönde evrimleştiğini, zamanın neden oksal bir yapıya sahip olduğunu açıklamaya yardımcı olur.

Carnot çevrimi, iki sıcaklık rezervuarı arasında çalışan ideal bir ısı makinasının maksimum verimini tanımlar. Carnot verimliliği η = 1 − (T_soğuk / T_sıcak) formülüyle verilir; burada sıcaklıklar mutlak (Kelvin) skalasında ifade edilmelidir. Gerçek makineler sürtünme, ısı kayıpları ve tersinmez süreçler nedeniyle her zaman Carnot veriminin altında kalır. Bu sınır, buhar türbinlerinden jet motorlarına kadar tüm ısı makinalarının tasarımında temel kısıt olarak işlev görür.

Üçüncü yasa ise mutlak sıfır sıcaklığa (0 Kelvin, −273,15 °C) ulaşmanın imkânsızlığını ifade eder. Sıcaklık mutlak sıfıra yaklaştıkça bir sistemin entropisi sıfıra yaklaşır; ancak tam olarak bu noktaya hiçbir sonlu süreç dizisiyle ulaşılamaz. Kriyo-fizik alanındaki araştırmacılar, mutlak sıfıra milikelvin mertebesinde yaklaşmayı başarmışlardır; bu koşullarda süperiletkenlik ve süperakışkanlık gibi egzotik kuantum fenomenleri ortaya çıkar. Termodinamik yasaları bütünü, enerji dönüşümlerinin sınırlarını belirleyerek mühendislik tasarımlarına evrensel bir çerçeve sunar.$BODY$,
  'AYT Fizik',
  'AYT',
  4,
  432,
  'detail',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Termodinamik yasaları, enerji korunumundan entropi artışına ve mutlak sıfıra kadar ısı ile enerjinin evrensel sınırlarını belirleyen temel ilkeler bütünüdür.", "Carnot çevrimi gerçek makinelerde uygulanabilir ve tüm ısı makinaları bu verimliliğe ulaşabilir.", "Entropi yalnızca kimyasal reaksiyonlarda kullanılan bir kavramdır ve mekanik sistemlerle ilgisi yoktur.", "Birinci yasa, ısının kendiliğinden yalnızca soğuktan sıcağa aktığını ifade eder.", "Mutlak sıfır sıcaklığına modern teknoloji sayesinde kesin olarak ulaşılabilmektedir."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Termodinamik Yasalar';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre Carnot verimini belirleyen temel faktör nedir?',
  '["Makinenin yapıldığı malzeme ve çalışma süresi.", "Soğuk ve sıcak rezervuarların mutlak sıcaklıkları arasındaki oran.", "Kullanılan yakıtın kimyasal enerji içeriği.", "Makinenin çevrim süresi ve dönme hızı.", "İkinci yasa gereği verim her zaman %50 ile sınırlıdır."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Termodinamik Yasalar';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["İkinci yasanın entropi artışı ilkesi göz önüne alındığında, mükemmel verimli gerçek bir ısı makinası yapımı termodinamik açıdan imkânsızdır.", "Süperiletkenlik ve süperakışkanlık olayları mutlak sıfırın üzerindeki sıcaklıklarda gözlemlenir.", "Termodinamik yasaları yalnızca buhar makinaları için geçerli olup modern elektrikli sistemlere uygulanamaz.", "Entropinin artması zamanın iki yönde de işleyebileceğine işaret etmektedir.", "Birinci yasa, perpetuum mobile makinasının yapılmasını teorik olarak mümkün kılmaktadır."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Termodinamik Yasalar';

-- ================================================================
-- AYT KİMYA METİNLERİ
-- ================================================================

-- ----------------------------------------------------------------
-- AYT KİMYA 1: Kimyasal Bağlar ve Moleküler Yapı
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Kimyasal Bağlar ve Moleküler Yapı',
  $BODY$Kimyasal bağlar, atomları bir arada tutan elektrosta tik kuvvetlerdir ve maddenin yapısını, özelliklerini belirlemede temel rol oynar. Üç ana bağ türü bulunmaktadır: iyonik bağ, kovalent bağ ve metalik bağ.

İyonik bağ, bir metalin elektronunu elektronegatif bir ametale aktarmasıyla oluşur. Sodyum klorür (sofra tuzu) bunun klasik örneğidir. Sodyum atomu bir elektronu klora vererek Na⁺ katyonuna, klor ise Cl⁻ anyonuna dönüşür; zıt yüklerin elektrostatik çekimi bağı oluşturur. İyonik bileşikler yüksek erime noktası, katı hâlde iletkenlik yokluğu ancak suda çözündüklerinde ya da eriyik hâlde elektrik iletkenliği gibi belirgin özellikler gösterir.

Kovalent bağ, atomların elektron çiftini ortaklaşa kullanmasıyla meydana gelir. Elektronegativite farkı küçük ya da sıfır olan atomlar arasında tercih edilen bu bağ türünde, paylaşılan elektron sayısına göre tekli, ikili veya üçlü bağlar oluşabilir. H₂O, CO₂ ve N₂ kovalent bağlı moleküllerin bildik örnekleridir. Elektronegativite farkı büyük olduğunda kovalent bağ kutupsal hale gelir; böyle bir molekülde elektron yoğunluğu elektronegatif atoma doğru kayar.

VSEPR (Valans Kabuk Elektron Çifti İtmesi) teorisi, moleküllerin üç boyutlu geometrisini tahmin etmek için kullanılır. Teoriye göre bağ ve ortaklanmamış elektron çiftleri birbirini iterek mümkün olan en uzak konuma yerleşir. Dört bağlayıcı çift içeren metan (CH₄) düzgün dörtyüzlü (tetrahedral) geometriye sahipken, su molekülünde (H₂O) iki ortaklanmamış çift bağ açısını 109,5°'den 104,5°'ye indirerek "bükümlü" geometriyi ortaya çıkarır.

Metalik bağ, metal atomlarının değerlik elektronlarını serbest bırakarak oluşturduğu "elektron denizi" modeliyle açıklanır. Bu serbestçe hareket eden elektronlar metaller arasında ısı ve elektriğin kolaylıkla iletilmesini sağlar. Metallerin yüksek erime noktası, parlaklık, şekil verilebilirlik ve dövülebilirlik özellikleri metalik bağın doğasından kaynaklanır.

Moleküller arası kuvvetler de maddenin fiziksel özelliklerini büyük ölçüde belirler. Dipol-dipol etkileşimleri, London dağılma kuvvetleri ve hidrojen bağı bu kuvvetlerin başlıcalarıdır. Hidrojen bağı özellikle önemlidir: Su, flor ile hidrojen, oksijen ile hidrojen ya da azot ile hidrojen arasında oluşan bu güçlü intermolekül kuvveti, suyun olağandışı yüksek kaynama noktasını ve yaşam için kritik özelliklerini açıklar. Moleküler geometri ve bağ polaritesi, bir maddenin çözünürlüğünden biyolojik aktivitesine kadar pek çok özelliğini doğrudan etkiler.$BODY$,
  'AYT Kimya',
  'AYT',
  4,
  435,
  'balanced',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Kimyasal bağlar; iyonik, kovalent ve metalik türleriyle atomları bir arada tutar ve moleküler geometriyle birlikte maddenin özelliklerini belirler.", "VSEPR teorisi yalnızca organik moleküllere uygulanabilir; inorganik bileşikler için geçersizdir.", "İyonik bağlı bileşikler her koşulda elektrik iletebilir.", "Metalik bağ, elektron ortaklaşmasına dayandığı için kovalent bağın özel bir türüdür.", "Hidrojen bağı, kovalent bağdan daha güçlüdür ve metallerin elektrik iletkenliğini açıklar."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Kimyasal Bağlar ve Moleküler Yapı';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre su molekülünün "bükümlü" geometrisi nasıl açıklanmaktadır?',
  '["Oksijen atomunun büyük atom yarıçapı bağ açısını daraltır.", "İki ortaklanmamış elektron çifti bağ açısını 109,5°''den 104,5°''ye indirerek bükümlü geometriyi oluşturur.", "Su molekülünde üçlü kovalent bağ bulunması geometriyi etkiler.", "Hidrojen atomlarının yüksek elektronegatifliği bağ açısını küçültür.", "Metalik bağ bileşeni bağ açılarını düzensizleştirir."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Kimyasal Bağlar ve Moleküler Yapı';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Hidrojen bağı, suyun yüksek kaynama noktası ve yaşam destekleyici özellikleri üzerinde belirleyici bir etkiye sahiptir.", "London dağılma kuvvetleri, tüm bağ türleri arasında en güçlü olanıdır.", "İyonik bileşikler katı hâlde elektrik ilettikleri için metallerin yerini alabilir.", "VSEPR teorisine göre tüm moleküller tetrahedral geometriye sahip olmalıdır.", "Metalik bağdaki elektron denizi, iyonik bağın bir alt türü olarak kabul edilmektedir."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Kimyasal Bağlar ve Moleküler Yapı';

-- ----------------------------------------------------------------
-- AYT KİMYA 2: Asit-Baz Dengesi ve pH
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Asit-Baz Dengesi ve pH',
  $BODY$Asit ve baz kavramları, farklı teorik çerçevelerle tanımlanabilir. Arrhenius tanımına göre asitler suda H⁺ iyonu veren, bazlar ise OH⁻ iyonu veren maddelerdir. Bu tanım pek çok tepkimeyi açıklamakla birlikte oldukça kısıtlıdır. Brønsted-Lowry teorisi daha geniş bir perspektif sunar: Asitler proton (H⁺) veren, bazlar proton kabul eden türlerdir. Bu tanım, su olmayan çözücülerdeki asit-baz tepkimelerini de kapsayabilir. Lewis teorisi ise en geniş kapsamlıdır: Elektron çifti kabul eden türler Lewis asidi, elektron çifti veren türler Lewis bazıdır.

Suyun kendi kendine iyonlaşması (otoiyonizasyon), asit-baz kimyasının merkezindedir. Oda sıcaklığında iki su molekülünün etkileşimiyle H₃O⁺ ve OH⁻ iyonları oluşur. Bu denge sabiti Kw = [H₃O⁺][OH⁻] = 1×10⁻¹⁴ olarak tanımlanır. Hem asit hem baz konsantrasyonları logaritmik pH skalasıyla ifade edilir: pH = −log[H₃O⁺]. Nötr çözelti pH = 7, asidik çözelti pH < 7, bazik çözelti ise pH > 7 değerine sahiptir.

Güçlü asitler (HCl, H₂SO₄, HNO₃ gibi) sulu çözeltide tamamen iyonlaşırken, zayıf asitler (CH₃COOH gibi) kısmen iyonlaşır. Zayıf asidin iyonlaşma dengesi, asit iyonlaşma sabiti Ka ile nitelenir. Ka değeri büyüdükçe asit daha güçlü, küçüldükçe daha zayıftır. Benzer biçimde bazlar için Kb değeri kullanılır. Bir konjuge asit-baz çifti için Ka × Kb = Kw bağıntısı geçerlidir.

Tampon çözeltiler, az miktarda asit veya baz eklendiğinde pH'ı hemen hemen sabit tutan sistemlerdir. Zayıf asit ve eşlenik bazının karışımından ya da zayıf baz ve eşlenik asidinden oluşurlar. Kan, yaklaşık 7,4 pH değerini karbonat-bikarbonat tamponu sayesinde dar bir aralıkta tutar; bu denge yaşamsal öneme sahiptir. Henderson-Hasselbalch denklemi, tampon çözeltilerin pH'ının hesaplanmasında yaygın olarak kullanılır.

Nötralizasyon tepkimeleri asit ve baz arasında tuz ve su oluşturan tepkimelerdir. Güçlü asit ile güçlü bazın nötralizasyonundan elde edilen tuzun sulu çözeltisi nötr pH gösterirken, zayıf asit-güçlü baz tuzları bazik, güçlü asit-zayıf baz tuzları ise asidik çözelti oluşturur. Bu hidroliz etkisi, tuzların pH üzerindeki davranışını anlamak açısından önemlidir. Asit-baz dengesi biyokimya, ilaç formülasyonu, gıda teknolojisi ve endüstriyel süreçlerde kritik rol oynar.$BODY$,
  'AYT Kimya',
  'AYT',
  5,
  432,
  'detail',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Asit-baz dengesi; farklı teorik tanımlar, pH ölçeği, tampon sistemler ve nötralizasyon tepkimeleriyle kimyanın ve biyolojinin temel kavramlarından birini oluşturur.", "Arrhenius teorisi en kapsamlı asit-baz tanımını sunduğundan diğer teorilere gerek yoktur.", "Tampon çözeltiler yalnızca kan gibi biyolojik sıvılarda bulunur; laboratuvarda hazırlanamaz.", "pH skalasında 7''den büyük değerler asidik, küçük değerler bazik çözeltileri gösterir.", "Güçlü asit-güçlü baz nötralizasyonundan oluşan tuz çözeltisi her zaman asidik pH gösterir."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Asit-Baz Dengesi ve pH';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre kanın pH değerini yaklaşık 7,4''te sabit tutan mekanizma nedir?',
  '["Güçlü asit-baz tampon sisteminin sürekli nötralizasyon tepkimesi gerçekleştirmesi.", "Karbonat-bikarbonat tampon sistemi.", "Kan hücrelerinin asit ya da bazı bağlaması.", "Suyun otoiyonizasyon dengesinin kan pH''ını düzenlemesi.", "Kw sabitinin vücut sıcaklığında 7,4 değerini alması."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Asit-Baz Dengesi ve pH';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Zayıf asit-güçlü baz nötralizasyonundan oluşan tuz çözeltisi, hidroliz nedeniyle bazik pH gösterecektir.", "Ka değeri küçük olan asitler, Ka değeri büyük olanlara kıyasla daha güçlüdür.", "Brønsted-Lowry ve Lewis teorileri birbiriyle çeliştiğinden birlikte kullanılamaz.", "Güçlü asitler sulu çözeltide kısmen iyonlaştığından pH hesabı zayıf asit formülleriyle yapılmalıdır.", "pH = 7 olan tüm çözeltiler nötr olduğundan hiçbiri tampon işlevi göremez."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Asit-Baz Dengesi ve pH';

-- ----------------------------------------------------------------
-- AYT KİMYA 3: Kimyasal Denge ve Le Chatelier İlkesi
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Kimyasal Denge ve Le Chatelier İlkesi',
  $BODY$Kimyasal denge, ileri ve geri tepkimelerin hızlarının eşitlendiği durumdur. Bu noktada tepkimelerin durduğu sanılsa da reaktan ve ürünler sürekli dönüşüm içindedir; yalnızca net değişim sıfırdır. Denge sabitinin matematiksel ifadesi, denge koşullarında ürünlerin konsantrasyonları çarpımının reaktanların konsantrasyonları çarpımına oranıdır. Konsantrasyonlar mol/litre cinsinden ifade edildiğinde Kc, kısmi basınçlar kullanıldığında ise Kp sembolü kullanılır.

Kc değeri büyük olduğunda denge ürün tarafına yatmış, küçük olduğunda reaktan tarafına yatmış demektir. Kc ile Kp arasındaki ilişki Δn gaz mol sayısı değişimine bağlıdır: Kp = Kc(RT)^Δn. Bir tepkimenin Gibbs serbest enerji değişimiyle denge sabiti arasındaki bağ ΔG° = −RT ln K denkliğiyle verilir. Bu bağıntı, denge konumunun termodinamik kökenini ortaya koyar.

Homojen dengede tüm türler aynı fazda bulunur; gaz fazı ya da çözelti içi tepkimeler buna örnek gösterilebilir. Heterojen dengede ise farklı fazlar söz konusudur; örneğin kalsiyum karbonatın ısıtılmasıyla oluşan CO₂ ile CaO arasındaki denge. Heterojen dengelerde saf katı ve saf sıvıların aktiviteleri 1 olarak alındığından denge bağıntısına dahil edilmez.

Henri Le Chatelier, 1884'te yayımladığı ilkesiyle kimyasal dengeye getirilen bir bozukluğun sistemin bu bozukluğu gidermek yönünde tepki vereceğini öngördü. Konsantrasyon artışı, baskı değişimi veya sıcaklık değişikliği gibi etkenler dengeyi kaydırabilir. Gaz fazı tepkimesinde basınç artırılırsa denge, toplam mol sayısının azaldığı tarafa kayar. Ekzotermik tepkimelerde sıcaklık artırılırsa denge, ısıyı tüketen geri tepkime yönüne kayar ve Kc küçülür; endotermik tepkimelerde ise tersi geçerlidir.

Haber-Bosch prosesi Le Chatelier ilkesinin endüstriyel uygulamasının en başarılı örneğidir. Azot ve hidrojenin amonyağa dönüştürüldüğü bu tepkime hem ekzotermik hem de mol sayısını azaltıcı yöndedir. Düşük sıcaklık denge verimini artırsa da tepkime hızını yetersiz kılar; yüksek sıcaklık ise hızı artırır ancak verimi düşürür. Bu çelişkiyi aşmak için uygun katalizör (demir bazlı) kullanılır ve optimum koşullar belirlenmiştir: yaklaşık 400-500°C sıcaklık, 150-300 atm basınç. Haber-Bosch prosesi, dünya tarımının gübre ihtiyacını karşılayan sentetik amonyak üretiminin temelini oluşturarak milyarlarca insanın beslenmesine katkı sağlamaktadır.$BODY$,
  'AYT Kimya',
  'AYT',
  5,
  440,
  'inference',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Kimyasal denge; denge sabiti, Le Chatelier ilkesi ve endüstriyel uygulamalar çerçevesinde tepkimelerin dinamik dengesini açıklayan temel bir kimya kavramıdır.", "Kimyasal dengede tepkimeler tamamen durur ve reaktan ile ürün konsantrasyonları değişmez.", "Le Chatelier ilkesi yalnızca ekzotermik tepkimelere uygulanabilir.", "Kc değeri her zaman Kp değerine eşittir ve aralarında dönüşüm formülü gerekmez.", "Haber-Bosch prosesinde düşük sıcaklık hem denge verimini hem de tepkime hızını artırır."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Kimyasal Denge ve Le Chatelier İlkesi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre Haber-Bosch prosesinde yüksek basınç uygulanmasının nedeni nedir?',
  '["Tepkime sıcaklığını düşürerek enerji tasarrufu sağlamak.", "Tepkime ekzotermik olduğundan ısı üretimini artırmak.", "Tepkime mol sayısını azaltan yönde ilerlediğinden basınç artışı dengeyi amonyak oluşumu yönüne kaydırır.", "Katalizörün etkinliğini artırmak için gereklidir.", "Azot gazının reaktifliğini artırarak aktivasyon enerjisini düşürmek."]'::jsonb,
  2,
  'detail'
FROM text_library WHERE title = 'Kimyasal Denge ve Le Chatelier İlkesi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Endüstriyel kimyasal prosesler, denge ve kinetik arasındaki uzlaşmayı optimize ederek hem verimli hem de ekonomik koşullar bulmak zorundadır.", "Kimyasal denge sabitinin büyük ya da küçük olması tepkimenin gerçekleşip gerçekleşmediğini değil, hızını belirler.", "Heterojen dengelerde katı maddelerin konsantrasyonları Kc bağıntısına dahil edilmelidir.", "Le Chatelier ilkesi gereği ekzotermik tepkimelerde sıcaklık artırılırsa Kc değeri artar.", "Haber-Bosch prosesinde katalizör kullanılmasının amacı dengeyi ürün tarafına kaydırmaktır."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Kimyasal Denge ve Le Chatelier İlkesi';

-- ----------------------------------------------------------------
-- AYT KİMYA 4: Organik Kimya: Fonksiyonel Gruplar
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Organik Kimya: Fonksiyonel Gruplar',
  $BODY$Organik kimyada fonksiyonel gruplar, organik moleküllerin kimyasal davranışını belirleyen atom dizilişleridir. Her fonksiyonel grup kendine özgü tepkimeler verir; bu nedenle bir bileşiğin fonksiyonel grubunu tanımak, onun kimyasal özelliklerini büyük ölçüde öngörmeyi sağlar.

Alkoller, hidroksil (-OH) grubunu içerir. Su ile hidrojen bağı kurabilmeleri sayesinde düşük molekül ağırlıklı alkoller suda tamamen çözünür. Birincil, ikincil ve üçüncül alkoller; oksidasyona verdikleri tepkimeler bakımından birbirinden ayrılır. Birincil alkoller önce aldehite, sonra karboksilik asite yükseltgenir. İkincil alkoller ketona yükseltgenir. Üçüncül alkoller ise kolayca yükseltgenemez.

Aldehitler (-CHO) ve ketonlar (C=O) karbonil grubu içerir; aralarındaki fark, karbonil karbonuna bağlı atom veya grupların yapısındadır. Aldehitler zincirin ucunda bulunurken ketonlar iki karbon zincirinin arasında yer alır. Aldehitler yükseltgenerek karboksilik asite dönüşürken ketonlar bu tepkimeye direnir.

Karboksilik asitler (-COOH) zayıf asit özelliği gösterir. Organik asitlerin en bilinen örneği asetik asittir; sirkede yaklaşık %3-5 oranında bulunur. Karboksilik asitler, alkollerle ester bağı oluşturmak üzere tepkimeye girebilir.

Esterler (-COO-), asidik ve alkollü bir bileşenin dehidrasyon tepkimesiyle oluşur. Meyvelerin ve parfümlerin büyük bölümünde ester yapısına sahip bileşikler sorumludur; örneğin izoamil asetat muz aromasını verir. Yağlar ve bitkisel yağlar da uzun zincirli karboksilik asitlerin (yağ asitlerinin) gliserol ile oluşturduğu triesterlerdir.

Aminler (-NH₂) bazik özellik gösterir; bu özelliklerini azotun paylaşılmamış elektron çiftine borçludurlar. Aminoasitler hem amino hem de karboksil grubu içerir ve proteinin yapı taşlarını oluşturur. Peptit bağı, bir aminoasidin karboksil grubu ile diğerinin amino grubu arasındaki kondansasyon tepkimesiyle meydana gelir.

Adlandırma sistemi, IUPAC kurallarına göre ana zincir, konum numarası ve fonksiyonel grup sonekine dayanır. Alkoller -ol, aldehitler -al, ketonlar -on, karboksilik asitler -oik asit sonekiyle adlandırılır. Fonksiyonel grup öncelik sırası, bileşiğin ana adını belirler. Organik kimyadaki bu sistematik yaklaşım, milyonlarca bileşiğin tutarlı biçimde adlandırılmasını ve tanımlanmasını mümkün kılar.$BODY$,
  'AYT Kimya',
  'AYT',
  4,
  428,
  'detail',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Organik kimyada fonksiyonel gruplar, bileşiklerin kimyasal davranışını belirler; her grubun kendine özgü özellikleri ve tepkimeleri vardır.", "Tüm organik bileşikler hem aldehit hem de keton grubu içerdiğinden aralarındaki ayrım yapay bir sınıflandırmadır.", "Karboksilik asitler güçlü asit özelliği gösterir ve suda tamamen iyonlaşır.", "Alkoller yükseltgenme tepkimesine girmez; yalnızca ester oluşturabilir.", "IUPAC adlandırma sistemi yalnızca alkoller ve esterler için geliştirilmiştir."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Organik Kimya: Fonksiyonel Gruplar';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre birincil ve ikincil alkollerin yükseltgenme ürünleri arasındaki fark nedir?',
  '["Birincil alkoller ketona, ikincil alkoller aldehite yükseltgenir.", "Birincil alkoller önce aldehite sonra karboksilik asite, ikincil alkoller ise ketona yükseltgenir.", "Her iki tür de doğrudan karboksilik asite yükseltgenir.", "Birincil alkoller yükseltgenemezken ikincil alkoller önce ketona dönüşür.", "İkincil alkoller karboksilik asite, birincil alkoller ise ketona yükseltgenir."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Organik Kimya: Fonksiyonel Gruplar';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Aminoasitlerin hem amino hem karboksil grubu içermesi, proteinlerin oluşumundaki peptit bağının kimyasal temelini açıklamaktadır.", "Esterler meyve aromasını oluşturduğundan tüm organik bileşikler arasında en kolay sentezlenenidir.", "Ketonların yükseltgenme tepkimine girmemesi onların kimyasal açıdan daha zayıf olduğunu gösterir.", "Organik asitlerin güçlü asit özelliği taşıması onları sanayi uygulamaları için tercih edilen bileşikler yapar.", "Üçüncül alkoller kolayca yükseltgenebildiğinden birincil ve ikincil alkollere göre daha reaktiftir."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Organik Kimya: Fonksiyonel Gruplar';

-- ----------------------------------------------------------------
-- AYT KİMYA 5: Elektrokimya: Piller ve Elektroliz
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Elektrokimya: Piller ve Elektroliz',
  $BODY$Elektrokimya, kimyasal tepkimelerle elektrik enerjisi arasındaki dönüşümleri inceler. İki temel uygulama alanı bulunur: elektrik üretmek için kendiliğinden gerçekleşen oksidasyon-indirgenme tepkimelerini kullanan galvanik piller ve elektrik enerjisini kimyasal değişime dönüştüren elektroliz hücreleri.

Galvanik pilde (voltaik pil) iki farklı metal elektrot, bir elektrolit çözelti veya bağlantı köprüsüyle birbirine bağlanır. Anotta yükseltgenme (elektron kaybı), katotta ise indirgenme (elektron kazanımı) gerçekleşir. Elektron akışı dış devre üzerinden anattan katota doğru ilerlerken iyon akışı elektrolit içinde dengeyi sağlar. Hücrenin standart hücre potansiyeli E°hücre = E°katot − E°anot formülüyle hesaplanır. Standart elektrot potansiyelleri, standart hidrojen elektroduna (SHE) referansla ölçülür ve bu değer tanımsal olarak sıfır kabul edilir.

Nernst denklemi, standart olmayan koşullarda pil gerilimini hesaplamaya olanak tanır: E = E° − (RT/nF) × ln Q. Burada n elektron sayısını, F Faraday sabitini, Q tepkime bölümünü temsil eder. Denge konumunda (Q = K olduğunda) E = 0 olur; yani pil boşalmıştır.

Lityum-iyon piller, modern elektronik cihazların ve elektrikli araçların enerji kaynağıdır. Yüksek enerji yoğunlukları ve şarj edilebilme özellikleri bu pilleri özellikle değerli kılar. Kurşun-asit pilleri ise otomobil aküleri olarak yaygın kullanım alanı bulmuştur; ucuz ve güvenilir olmalarına karşın düşük enerji yoğunlukları bir dezavantajdır.

Elektrolizde harici elektrik kaynağı kendiliğinden gerçekleşmeyen tepkimeleri zorla yürütür. Elektroliz hücresinde de anot yükseltgenme, katot indirgenme yeridir; ancak elektron akışının yönü galvanik pilin tersine haricidir. Faraday'ın elektroliz yasaları bu süreci nicel olarak tanımlar: Birinci yasa, elektrotta biriken ya da çözünen madde miktarının geçen yükle doğru orantılı olduğunu belirtir. İkinci yasa ise eşit miktarda yükün farklı elektrolitleri eşdeğer miktarlarda ayrıştırdığını ifade eder. Alüminyum metalinin Hall-Héroult prosesiyle eritilmiş kriyolitteki alüminyum oksit çözeltisinin elektrolizi yoluyla üretilmesi, endüstriyel elektrolizin en önemli örneklerinden biridir. Klorun ve sodyum hidroksitin klor-alkali elektrolitik tesislerinde üretimi de bu yasa çerçevesinde gerçekleşir.$BODY$,
  'AYT Kimya',
  'AYT',
  5,
  435,
  'balanced',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Elektrokimya; galvanik piller, Nernst denklemi, elektroliz ve Faraday yasaları aracılığıyla kimyasal ve elektriksel enerji arasındaki dönüşümleri açıklayan temel bir kimya dalıdır.", "Galvanik pil ile elektroliz hücresi özdeş çalışma prensipleri nedeniyle birbiri yerine kullanılabilir.", "Faraday sabitinin değeri tepkimeden tepkimeye değiştiğinden her hesaplamada yeniden belirlenmesi gerekir.", "Standart hücre potansiyeli her zaman pozitif olmak zorundadır; aksi hâlde tepkime gerçekleşmez.", "Lityum-iyon piller elektroliz prensibine göre çalışır ve şarj edilemez."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Elektrokimya: Piller ve Elektroliz';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre galvanik pilde anot ve katotta hangi süreçler gerçekleşir?',
  '["Anotta indirgenme, katotta yükseltgenme gerçekleşir.", "Anotta yükseltgenme, katotta indirgenme gerçekleşir.", "Her iki elektrotta da yükseltgenme eş zamanlı olarak gerçekleşir.", "Anotta iyon birikimine, katotta gaz salınımına neden olur.", "Anot ve katotta gerçekleşen tepkimeler sıcaklığa bağlı olarak yer değiştirebilir."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Elektrokimya: Piller ve Elektroliz';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Nernst denklemine göre bir pilin gerilimi denge konumuna yaklaştıkça sıfıra yaklaştığından, pillerin kullanıcıya sunduğu enerji sınırlıdır.", "Faraday yasaları yalnızca sulu çözeltiler için geçerli olup erimiş tuzların elektrolizinde uygulanamaz.", "Alüminyum üretiminin elektrolize dayanması, bu metalin doğada saf hâlde bol miktarda bulunduğunu gösterir.", "Galvanik pilde harici elektrik kaynağı olmadan tepkime gerçekleşemez.", "Lityum-iyon piller, kurşun-asit pillere kıyasla daha düşük enerji yoğunluğuna sahip olduğundan elektrikli araçlarda kullanılamaz."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Elektrokimya: Piller ve Elektroliz';

-- ================================================================
-- AYT BİYOLOJİ METİNLERİ
-- ================================================================

-- ----------------------------------------------------------------
-- AYT BİYOLOJİ 1: DNA Replikasyonu ve Protein Sentezi
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'DNA Replikasyonu ve Protein Sentezi',
  $BODY$DNA'nın genetik bilgiyi aktarma işlevi iki temel süreçle gerçekleşir: replikasyon (kendini kopyalama) ve protein sentezi (ifade). Her ikisi de hücrenin sürdürülebilirliği ve organizmanın genetik devamlılığı açısından hayati öneme sahiptir.

DNA replikasyonu semikonservatif yolla gerçekleşir; yani her yeni çift sarmallı DNA, anne zincirden bir iplik ve yeni sentezlenen bir iplik içerir. Matthew Meselson ve Franklin Stahl, 1958'de N¹⁵ izotopu kullanarak yaptıkları deney bu mekanizmayı kesin biçimde kanıtlamıştır. Replikasyon, "başlangıç noktası" adı verilen özgün DNA dizilerinden başlatılır. Prokaryotlarda tek bir başlangıç noktası bulunurken ökaryotlarda replikasyon eş zamanlı olarak binlerce noktadan yürütülür.

Helikaz enzimi DNA sarmalını açarak tek zincirli şablonlar oluşturur. Ancak DNA polimeraz yeni ipliği yalnızca 5'→3' yönünde sentezleyebilir. Şablon zincirleri zıt yönde yöneldiğinden bir zincir (öncü iplik) kesintisiz sentezlenirken diğeri (geciktirilen iplik) Okazaki fragmanları adı verilen kısa parçalar halinde oluşturulur. DNA ligaz bu parçaları birleştirerek kesintisiz zinciri tamamlar. Proofread (denetleme) mekanizması sayesinde DNA polimeraz yanlış yerleştirilen nükleotidleri düzelterek yüksek doğruluk sağlar.

Protein sentezi iki aşamada gerçekleşir. Transkripsiyon sürecinde RNA polimeraz, DNA şablonunu kullanarak haberci RNA (mRNA) sentezler. Ökaryotlarda bu süreç çekirdekte tamamlandıktan sonra mRNA'nın işlenmesi (splicing) başlar; kodlama içermeyen intronlar çıkarılarak eksonlar birleştirilir.

Translasyonda ribozomlar mRNA üzerindeki kodonları (üç nükleotidlik birimler) okuyarak aminoasitleri belirler. Transfer RNA (tRNA) antikodon ucu mRNA kodonu ile eşleşirken diğer ucunda o kodona karşılık gelen aminoasidi taşır. Ribozom aminoasitler arasında peptit bağları kurarak polipeptit zinciri oluşturur. Genetik kod, 64 kodon ile 20 aminoasit arasındaki eşlemeyi tanımlar; kodun yedekli (dejenere) yapısı sayesinde bazı aminoasitler birden fazla kodon tarafından kodlanır. Başlangıç kodonu AUG metiyonini, durdurma kodonları (UAA, UAG, UGA) ise polipeptit zincirinin sonunu belirler. Protein sentezinin hataları mutasyona, bu da hastalıklara yol açabilir; ancak bazı mutasyonlar evrimsel çeşitlilik açısından faydalıdır.$BODY$,
  'AYT Biyoloji',
  'AYT',
  5,
  435,
  'detail',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["DNA replikasyonu ve protein sentezi; semikonservatif kopyalama, transkripsiyon ve translasyon mekanizmalarıyla genetik bilginin korunmasını ve işlevsel proteinlere dönüştürülmesini sağlar.", "DNA replikasyonu yalnızca prokaryotlarda semikonservatif yolla gerçekleşir; ökaryotlarda farklı mekanizmalar kullanılır.", "Genetik kodun yedekli yapısı biyolojik açıdan dezavantajlıdır çünkü mutasyonların etkisini artırır.", "mRNA, hem transkripsiyon hem translasyon sürecinde sentezlenen bir moleküldür.", "Protein sentezinin hataları her zaman zararlı sonuçlar doğurur ve hiçbir zaman faydalı olamaz."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'DNA Replikasyonu ve Protein Sentezi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre geciktirilen ipliğin (lagging strand) süreksiz sentezlenme nedeni nedir?',
  '["DNA polimerazın görevini tamamlamadan önce kopmasından kaynaklanır.", "DNA polimerazın yeni ipliği yalnızca 5''→3'' yönünde sentezleyebilmesi, zıt yönlü şablon için süreksiz sentezi zorunlu kılar.", "Helikaz enziminin geciktirilen ipliği yavaş açmasından dolayı Okazaki fragmanları oluşur.", "Ökaryotlardaki intronlar geciktirilen iplikte daha yoğun bulunduğundan sentez kesintiye uğrar.", "DNA ligaz, geciktirilen iplikte yoktur; dolayısıyla parçalar birleştirilmeden kalır."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'DNA Replikasyonu ve Protein Sentezi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Genetik kodun yedekli (dejenere) yapısı, bazı mutasyonların aminoasit dizisini değiştirmediğinden organizmaları mutasyonların her zaman zararlı etkisinden kısmen korur.", "Semikonservatif replikasyon, DNA kopyalarının her bölünmede özgün diziden tamamen farklılaşmasına neden olur.", "Ökaryotlarda splicing işlemi, protein çeşitliliğini azaltmak amacıyla intronları korurken eksonları çıkarır.", "DNA polimerazın proofreading mekanizması olmaması mutasyon oranını düşürür.", "Prokaryotlardaki tek başlangıç noktası, ökaryotlardan daha hızlı DNA replikasyonuna yol açar."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'DNA Replikasyonu ve Protein Sentezi';

-- ----------------------------------------------------------------
-- AYT BİYOLOJİ 2: Mitoz ve Mayoz Karşılaştırması
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Mitoz ve Mayoz Karşılaştırması',
  $BODY$Hücre bölünmesi; büyüme, doku onarımı ve üreme gibi temel yaşamsal işlevlerin merkezinde yer alır. İki farklı bölünme türü bulunmaktadır: mitoz ve mayoz. Bu iki süreç benzer mekanizmalar kullansa da farklı amaçlara hizmet eder ve birbirinden önemli özelliklerle ayrılır.

Mitoz, somatik (vücut) hücrelerinde gerçekleşen ve genetik olarak özdeş iki yavru hücre üretimini sağlayan bölünme türüdür. Hücre döngüsü, bölünme öncesi hazırlık aşaması olan interfaz ile mitoz bölünmenin kendisinden oluşur. İnterfazda hücre büyür (G1 fazı), DNA'sını kopyalar (S fazı) ve yeni bölünme için hazırlanır (G2 fazı). Profazda kromozomlar yoğunlaşarak görünür hale gelir, iğ iplikleri oluşmaya başlar. Metafazda kromozomlar hücrenin ekvator düzlemine dizilir; bu aşama karyotip analizleri için idealdir. Anafazda kardeş kromatitler ayrılarak kutuplara çekilir. Telofazda çekirdek zarları yeniden oluşur ve sitokinez gerçekleşerek iki yavru hücre tamamlanır.

Mayoz, yalnızca üreme organlarındaki eşey hücrelerinde (gamet üretiminde) gerçekleşir. İki ardışık bölünme içerir: mayoz I ve mayoz II. Sonuçta bir diploid (2n) hücreden dört haploid (n) hücre üretilir. Bu özelliği sayesinde fertilizasyon sırasında iki gametin birleşmesiyle türün kromozom sayısı nesiller boyu sabit kalır.

Mayozun genetik çeşitlilik açısından en kritik özelliği, mayoz I profazında gerçekleşen krossing-over (çaprazlanma) sürecidir. Homolog kromozomlar yan yana geldiğinde (sinapsis) genetik materyal alışverişi yapar. Bu rekombinasyon, yavru hücrelerin genomlarının anne ve baba genomlarından farklı olmasını sağlar. Bağımsız açılma da krossing-overa ek bir çeşitlilik kaynağı sunar: Farklı kromozom çiftleri metafaz I'de bağımsız biçimde ayrıldığından 2²³ farklı kombinasyon teorik olarak mümkündür.

Mitoz ve mayoz arasındaki temel farklar şöyle özetlenebilir: Mitoz bir bölünme ile iki özdeş diploid hücre üretirken mayoz iki bölünme sonucunda dört genetik olarak çeşitli haploid hücre üretir. Mitoz somatik hücrelerde büyüme ve onarım için kullanılırken mayoz üreme hücrelerinde genetik çeşitlilik ve türün devamlılığı için işlev görür. Krossing-over yalnızca mayozda gerçekleşirken iğ ipliği oluşumu her iki bölünmede de gözlenir. Bu iki mekanizma, hem bireysel canlının gelişimini hem de türün evrimsel adaptasyonunu birlikte mümkün kılar.$BODY$,
  'AYT Biyoloji',
  'AYT',
  4,
  432,
  'balanced',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Mitoz ve mayoz; farklı amaçlara hizmet eden, biri genetik özdeşlik diğeri genetik çeşitlilik sağlayan iki temel hücre bölünme mekanizmasıdır.", "Mitoz ve mayoz özdeş süreçlerdir; aralarındaki tek fark gerçekleştikleri hücre türüdür.", "Krossing-over yalnızca telofaz evresinde gerçekleşir ve genetik çeşitlilik üzerinde etkisi sınırlıdır.", "Mayozda üretilen yavru hücreler, anne hücreyle genetik olarak özdeştir.", "Hücre döngüsünün S fazında mitoz bölünme tamamlanır."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Mitoz ve Mayoz Karşılaştırması';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre mayozda genetik çeşitliliği artıran iki mekanizma nelerdir?',
  '["İnterfaz ve G1 fazı.", "Krossing-over ve bağımsız açılma.", "Mitoz I ve mitoz II bölünmeleri.", "Sitozinez ve telofaz evresi.", "DNA replikasyonu ve profaz yoğunlaşması."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Mitoz ve Mayoz Karşılaştırması';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Mayozun yarattığı genetik çeşitlilik, türlerin değişen çevre koşullarına evrimsel adaptasyonu için temel bir kaynak oluşturmaktadır.", "Mitoz bölünme yalnızca embriyonik gelişim sürecinde gerçekleşir ve yetişkin organizmalarda tamamen durur.", "Krossing-over sıklığı azaltılırsa türlerin genetik çeşitliliği artar.", "Metafaz evresinde karyotip analizi yapılabilmesi, bu aşamada DNA replikasyonunun yeniden başladığını gösterir.", "Haploid hücrelerden oluşan organizmaların mayoza ihtiyacı yoktur."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Mitoz ve Mayoz Karşılaştırması';

-- ----------------------------------------------------------------
-- AYT BİYOLOJİ 3: Sinir Sistemi ve Nöron Fizyolojisi
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Sinir Sistemi ve Nöron Fizyolojisi',
  $BODY$Sinir sistemi, organizmanın iç ve dış çevreden bilgi toplamasını, bu bilgiyi işlemesini ve uygun tepkilerin koordinasyonunu sağlayan karmaşık bir ağdır. Temel yapı birimi nörondur; insan beyninde yaklaşık 86 milyar nöron bulunduğu tahmin edilmektedir.

Bir nöron; hücre gövdesi (soma), dallanmış uzantılar olan dendritler ve tek uzun çıkıntı olan aksondan oluşur. Dendritler sinyalleri soma'ya taşırken akson uyarıyı bir sonraki nörona ya da efektör organa iletir. Miyelinli nöronlarda akson, yağ içerikli miyelin kılıfıyla çevrilidir; bu kılıf, Ranvier boğumları arasında sinyalin sıçrayarak (saltatory conduction) iletilmesini sağlar ve iletim hızını önemli ölçüde artırır.

Nöronal iletişimin fizyolojik temeli aksiyon potansiyelidir. Dinlenme halindeki nöronun hücre içi yüzü, sodyum-potasyum pompası aracılığıyla yaklaşık −70 mV değerinde negatif tutulur. Yeterli uyarı ile hücre zarındaki sodyum kanalları açılır, sodyum iyonları içeri akar (depolarizasyon) ve zar potansiyeli yaklaşık +30 mV'a çıkar. Ardından potasyum kanallarının açılmasıyla zar yeniden negatifleşir (repolarizasyon) ve kısa süreli bir hiperpolarizasyon fazı yaşanır. Aksiyon potansiyeli hep ya hiç yasasına uyar: Eşik değer aşıldığında tam büyüklükte gerçekleşir, eşiğin altında hiç gerçekleşmez.

Bir nörondan diğerine iletim ise sinaps aracılığıyla gerçekleşir. Presinaptik nöronun akson terminaline ulaşan aksiyon potansiyeli, sinaptik veziküllerdeki nörotransmitterlerin sinaptik aralığa salınmasını tetikler. Nörotransmitterler, postsinaptik nöronun dendrit ya da soma membranındaki reseptörlere bağlanarak yeni bir uyarı oluşturabilir (uyarıcı sinaps) ya da uyarıyı baskılayabilir (baskılayıcı sinaps). Asetilkolin, dopamin, serotonin, GABA ve glutamat en önemli nörotransmitterler arasındadır.

Sinir sistemi organizasyonu iki ana bölümden oluşur. Merkezi sinir sistemi (MSS), beyin ve omuriligi kapsar; bilginin entegrasyonu ve koordinasyonu bu bölümde gerçekleşir. Çevresel sinir sistemi (PNS), MSS'ni vücudun diğer organlarına bağlayan sinirlerden oluşur ve somatik (istemli) ile otonom (istemsiz) olarak ikiye ayrılır. Otonom sinir sistemi, kalp atışı, solunum ve sindirim gibi hayati fonksiyonları otomatik olarak düzenleyen sempatik ve parasempatik kollardan meydana gelir.$BODY$,
  'AYT Biyoloji',
  'AYT',
  5,
  437,
  'detail',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Sinir sistemi; nöron yapısı, aksiyon potansiyeli, sinaptik iletim ve MSS/PNS organizasyonu aracılığıyla organizmanın bilgi işleme ve koordinasyon merkezini oluşturur.", "Nöronal iletim yalnızca elektriksel sinyaller aracılığıyla gerçekleşir; kimyasal mesajcıların rolü ikincil derecede önemlidir.", "Miyelin kılıfı nöronun iletim hızını azaltarak enerji tasarrufu sağlar.", "Aksiyon potansiyeli hep ya hiç yasasına uymaz; uyarı şiddetine bağlı olarak büyüklüğü değişir.", "Otonom sinir sistemi istemli kasların kontrolünden sorumludur."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Sinir Sistemi ve Nöron Fizyolojisi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre miyelin kılıfının nöral iletim üzerindeki etkisi nedir?',
  '["Aksiyon potansiyelinin büyüklüğünü artırarak sinyalin daha güçlü iletilmesini sağlar.", "Ranvier boğumları arasında sıçrayarak iletimi mümkün kılarak iletim hızını önemli ölçüde artırır.", "Sodyum kanallarının dinlenme potansiyelini yükseltir.", "Sinapslarda nörotransmitter salınımını hızlandırır.", "MSS ile PNS arasındaki bağlantıyı doğrudan kurar."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Sinir Sistemi ve Nöron Fizyolojisi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Belirli nörotransmitterlerin yetersizliği ya da fazlalığı dopamin, serotonin gibi sistemleri etkileyerek ruhsal ve nörolojik hastalıklara zemin hazırlayabilir.", "Hep ya hiç yasası gereği uyarı şiddeti ne olursa olsun aksiyon potansiyeli aynı hızda ilerler.", "Parasempatik sinir sistemi tehlike anında sempatik sistemin yerini alarak vücudu savaş-kaç tepkisine hazırlar.", "Sinaptik iletimde yalnızca uyarıcı nörotransmitterler işlev görür; baskılayıcılar yalnızca patolojik durumlarda ortaya çıkar.", "MSS, çevresel sinir sisteminden bağımsız çalıştığından PNS hasarı MSS işlevlerini etkilemez."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Sinir Sistemi ve Nöron Fizyolojisi';

-- ----------------------------------------------------------------
-- AYT BİYOLOJİ 4: Bağışıklık Sistemi
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Bağışıklık Sistemi',
  $BODY$Bağışıklık sistemi, organizmanın patojenlere (bakteri, virüs, mantar, parazit) ve yabancı maddelere karşı savunma mekanizmasını oluşturur. İki ana kola ayrılır: doğal (özgüsüz) immünite ve adaptif (özgün) immünite.

Doğal immünite hızlı ancak özgüsüz bir savunma hattıdır. Deri ve mukozal yüzeyler ilk bariyer olarak işlev görür; altındaki epitel hücreler patojenlerle temas halinde inflamatuar sitokinler salgılar. Nötrofiller, makrofajlar ve doğal öldürücü (NK) hücreler bu tabakada yer alan önemli efektör hücrelerdir. Kompleman sistemi de doğal immünitenin önemli bileşenlerinden biridir; opsonizasyon, membran atak kompleksi oluşturma ve inflamasyonu tetikleme yoluyla patojen temizliğine katkıda bulunur.

Adaptif immünite özgün, güçlü ve hafıza özelliğine sahip bir savunma sistemidir. Lenfositler bu sistemin temel hücreleridir; B lenfositler kemik iliğinde, T lenfositler timus bezinde olgunlaşır. Antijenler, patojen yüzeyindeki yabancı moleküller olup immün yanıtı tetikleyen yapılardır. B hücreleri, plazmaya hücrelerine farklılaşarak antijene özgü antikorlar üretir. Antikorlar (immünoglobulinler), Y şeklinde glikoprotein yapısındadır ve antijene kilitlenebilir; nötralizasyon, opsonizasyon ve kompleman aktivasyonu gibi mekanizmalarla patojenin etkisizleştirilmesine katkı sağlar.

T hücreleri ise farklı alt gruplara ayrılır. Sitotoksik T hücreleri (CD8⁺), virüsle enfekte olmuş ya da kanserli hücreleri tanıyarak öldürür. Yardımcı T hücreleri (CD4⁺) hem B hücrelerini antikor üretimine teşvik eder hem de diğer immün hücreleri koordine eder. Düzenleyici T hücreleri ise immün yanıtın aşırıya kaçmasını önler.

Aşılar, adaptif immünitenin hafıza özelliğinden yararlanır. Zayıflatılmış ya da öldürülmüş patojen, patojenin parçaları ya da mRNA aşılarında olduğu gibi protein üretim talimatları verilerek birincil immün yanıt uyarılır. Daha sonra aynı patojenle karşılaşıldığında hafıza hücreleri hızla çoğalarak güçlü bir ikincil yanıt verir.

Alerjiler, bağışıklık sisteminin zararsız maddelere (polenlere, gıdalara) aşırı tepkisiyle ortaya çıkar. IgE antikorları mast hücrelerini aktive ederek histamin salınımına yol açar; bu da alerji belirtilerini oluşturur. Otoimmün hastalıklarda ise sistem kendi vücut dokularını yabancı olarak tanıyarak bunlara saldırır. Romatoid artrit, Tip 1 diyabet ve lupus bu hastalıklar arasında sayılabilir. Bağışıklık sisteminin dengesinin bozulması hem aşırı tepkiyi hem de yetersiz korumayı beraberinde getirebilir.$BODY$,
  'AYT Biyoloji',
  'AYT',
  5,
  440,
  'balanced',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Bağışıklık sistemi; doğal ve adaptif immünite kollarıyla patojenlerden koruma sağlar; aşılar, alerjiler ve otoimmün hastalıklar bu sistemin farklı çalışma boyutlarını yansıtır.", "Doğal immünite adaptif immüniteden üstündür çünkü özgün yanıt verme ve hafıza özelliklerine sahiptir.", "B hücreleri timus bezinde, T hücreleri ise kemik iliğinde olgunlaşır.", "Alerji, bağışıklık sisteminin patojenlerle ilk karşılaşmasında verdiği normal bir birincil yanıttır.", "Otoimmün hastalıklar, bağışıklık sisteminin patojen eksikliğinde tamamen işlevsiz kalmasından kaynaklanır."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Bağışıklık Sistemi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre sitotoksik T hücrelerinin (CD8⁺) temel işlevi nedir?',
  '["B hücrelerini antikor üretimine teşvik etmek ve immün yanıtı koordine etmek.", "Virüsle enfekte olmuş ya da kanserli hücreleri tanıyarak öldürmek.", "Allerjik reaksiyonlarda mast hücrelerini aktive ederek histamin salınımını tetiklemek.", "Kompleman sistemini aktive ederek opsonizasyonu başlatmak.", "İmmün yanıtın aşırıya kaçmasını önlemek için düzenleyici işlev görmek."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Bağışıklık Sistemi';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Aşıların etkinliği, adaptif immünitenin hafıza özelliğine dayandığından ikincil immün yanıt birincil yanıttan çok daha hızlı ve güçlü gerçekleşir.", "Doğal immünite yeterince güçlü olduğundan aşılar yalnızca otoimmün hastalığı olan kişilere gereklidir.", "IgE antikorları, viral enfeksiyonlara karşı en etkili antikorlar olduğundan aşı üretiminde kullanılır.", "Düzenleyici T hücrelerinin yokluğu bağışıklık yanıtını zayıflatarak enfeksiyonlara karşı direnci artırır.", "B hücrelerinin antikor üretimi, CD8⁺ T hücrelerinin yönlendirmesi olmadan gerçekleşemez."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Bağışıklık Sistemi';

-- ----------------------------------------------------------------
-- AYT BİYOLOJİ 5: Evrim ve Doğal Seçilim
-- ----------------------------------------------------------------
INSERT INTO text_library (title, body, category, exam_type, difficulty, word_count, skill_focus, status) VALUES (
  'Evrim ve Doğal Seçilim',
  $BODY$Biyolojinin en bütünleştirici teorisi olan evrim, canlı türlerinin zaman içinde değişip farklılaştığını ve ortak atalardan köken aldığını öngörür. Charles Darwin ve Alfred Russel Wallace, 1858'de doğal seçilim mekanizmasını bağımsız olarak ortaya koydular; Darwin'in "Türlerin Kökeni" adlı eseri ertesi yıl yayımlanarak bilim tarihinin en etkili kitaplarından biri oldu.

Darwin'in doğal seçilim teorisi dört temel gözleme dayanır. Birincisi, her türün potansiyeli var olan kaynak kapasitesinin üzerinde yavru üretmesidir. İkincisi, bireyler arasında kalıtsal varyasyon bulunmasıdır. Üçüncüsü, kaynaklar için rekabet sonucunda bireyler arasında hayatta kalma ve üreme farklılıklarının ortaya çıkmasıdır. Dördüncüsü ise hayatta kalanların özelliklerini daha başarılı biçimde sonraki nesillere aktarmasıdır. Bu sürecin yeterince uzun sürmesiyle türler değişir, uyum sağlar ya da nükleer olabilir.

Genetik sürüklenme, özellikle küçük popülasyonlarda önem kazanan bir evrimsel mekanizmadır. Allel frekanslarının rastgele değişmesi olarak tanımlanan bu süreç, doğal seçilimden bağımsız işler. Şişe boynu etkisi (bir popülasyonun ani küçülmesi) ve kurucu etkisi (küçük bir grubun yeni bir popülasyon kurması) genetik sürüklenmenin iki klasik örneğidir; bu durumlarda genetik çeşitlilik önemli ölçüde azalabilir.

İzolasyon mekanizmaları türleşmenin anahtarıdır. Coğrafi izolasyon (allopatrik türleşme), populasyonlar fiziksel bir engel (dağ, deniz, nehir gibi) tarafından ayrıldığında farklı selektif baskılar ve genetik sürükleme nedeniyle bağımsız evrimleşmelerine yol açar. Yeterli genetik farklılaşma sağlandığında bu iki popülasyon artık çiftleşip verimli yavru üretemez ve farklı türler haline gelmiş sayılır.

Fosil kayıtları evrim teorisinin en güçlü kanıtlarından birini sunar. Katmanlı kayaçlardaki fosil dizileri, canlı formlarının kademeli olarak değiştiğini göstermektedir. Anatomi kanıtları da önemlidir: Homolog yapılar (insanın eli, balinanın yüzgeci, yarasanın kanadı benzer kemik planına sahiptir) ortak atadan köken aldıklarına işaret eder. Embriyolojik kanıtlar, memeliler ve balıklar gibi uzak akraba türlerin erken embriyo döneminde şaşırtıcı benzerlikler gösterdiğini ortaya koyar. Moleküler biyolojinin gelişmesiyle birlikte DNA dizileri karşılaştırmaları evrimsel ilişkileri son derece kesin biçimde saptamamızı mümkün kılmaktadır. Evrim teorisi, biyolojinin tüm alt dallarını ortak bir çerçeve altında birleştiren vazgeçilmez bir kavramsal temeldir.$BODY$,
  'AYT Biyoloji',
  'AYT',
  4,
  438,
  'inference',
  'published'
);

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["Evrim teorisi; doğal seçilim, genetik sürüklenme, izolasyon mekanizmaları ve çok yönlü kanıtlarıyla canlı çeşitliliğini ve türlerin değişimini açıklayan biyolojinin en bütünleştirici teorisidir.", "Darwin''in teorisi yalnızca paleontoloji verilerine dayanır; moleküler biyoloji evrimle ilgisizdir.", "Genetik sürüklenme doğal seçilimle aynı mekanizma olup yalnızca büyük popülasyonlarda etkilidir.", "Coğrafi izolasyon türleşmeye yol açmaz; ancak mevcut türler arasındaki üremeyi kısa süreli engeller.", "Homolog yapılar evrensel bir tasarımın ürünü olup ortak atayla ilgisi yoktur."]'::jsonb,
  0,
  'main_idea'
FROM text_library WHERE title = 'Evrim ve Doğal Seçilim';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metne göre şişe boynu etkisi nedir ve popülasyon üzerindeki temel sonucu nedir?',
  '["Büyük bir popülasyonun iki eşit gruba bölünmesiyle genetik çeşitliliğin ikiye katlandığı bir süreçtir.", "Bir popülasyonun ani biçimde küçülmesiyle ortaya çıkan, genetik çeşitliliği önemli ölçüde azaltabilen genetik sürüklenme örneğidir.", "Doğal seçilimin olumsuz allelleri ortadan kaldırması sonucu popülasyonun homojenleşmesidir.", "Küçük bir grubun yeni bir bölgede popülasyon kurması ve kurucu etkisine yol açmasıdır.", "Coğrafi izolasyon sonucunda oluşan ve türleşmeye zorunlu olarak yol açan bir mekanizmadır."]'::jsonb,
  1,
  'detail'
FROM text_library WHERE title = 'Evrim ve Doğal Seçilim';

INSERT INTO text_questions (text_id, question_text, options, correct_index, question_type)
SELECT id, 'Metinden çıkarılabilecek en mantıklı çıkarım aşağıdakilerden hangisidir?',
  '["Fosil kayıtları, anatomi, embriyoloji ve moleküler biyoloji gibi birbirinden bağımsız kanıt kaynaklarının evrim teorisini desteklemesi, teorinin güvenilirliğini önemli ölçüde artırmaktadır.", "Doğal seçilim, küçük popülasyonlarda genetik sürüklenmeden daha etkili bir evrimsel kuvvettir.", "Homolog yapıların farklı işlevler üstlenmesi, ortak atadan köken geldikleri fikrinin zayıf bir kanıtıdır.", "Allopatrik türleşme yalnızca ada ekosistemlerinde gerçekleşebilir.", "Moleküler biyoloji teknikleri evrimsel ilişkileri inceler; ancak fosil kayıtlarından elde edilen bilgileri çürütmüştür."]'::jsonb,
  0,
  'inference'
FROM text_library WHERE title = 'Evrim ve Doğal Seçilim';

