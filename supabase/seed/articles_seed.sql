-- =====================================================
-- articles_seed.sql
-- Platform genelinde (global) örnek makaleler
-- tenant_id = NULL → tüm kiracılar okuyabilir
-- =====================================================

INSERT INTO articles (subject_code, title, content_text, word_count, difficulty_level, target_exam, questions) VALUES

-- ─── TÜRKÇE ──────────────────────────────────────────
('turkce', 'Sait Faik Abasıyanık ve Kısa Hikâye Sanatı',
$$Sait Faik Abasıyanık, Türk edebiyatının en özgün hikâyecilerinden biridir. 1906'da Adapazarı'nda doğan yazar, kısa ömrüne rağmen pek çok önemli eser bırakmıştır.

Sait Faik'in hikâyelerinde gündelik hayatın sıradan insanları —balıkçılar, kahveci esnafı, çocuklar— ön plana çıkar. Yazar, bu insanların yaşamını romantik bir gözle değil; içten, sıcak ve acımasız bir gerçeklikle aktarır. Doğa ve deniz, eserlerinde vazgeçilmez bir arka plan oluşturur.

"Semaver", "Lüzumsuz Adam" ve "Son Kuşlar" en bilinen eserlerinden bazılarıdır. Hikâyelerinde doğrusal bir olay örgüsü yerine anlık gözlemler ve duygu akışları öne çıkar. Bu özelliği onu geleneksel hikâyecilerden ayırır.

Sait Faik, Türk hikâyeciliğini dünya edebiyatı düzeyine taşıyan bir yazardır. Adına düzenlenen Sait Faik Hikâye Armağanı bugün de sürdürülmektedir.$$,
165, 5, '{lgs,tyt}',
'[
  {"question": "Sait Faik hikâyelerinde hangi kesim ön plana çıkar?", "options": ["Saraylılar ve devlet adamları", "Balıkçılar ve sıradan insanlar", "Aydın sınıfı", "Askerler"], "correctIndex": 1},
  {"question": "\"Semaver\" hangi yazara aittir?", "options": ["Ömer Seyfettin", "Sait Faik Abasıyanık", "Reşat Nuri Güntekin", "Yakup Kadri"], "correctIndex": 1},
  {"question": "Sait Faik hikâyelerinde öne çıkan arka plan nedir?", "options": ["Şehir ve sanayi", "Doğa ve deniz", "Orman ve dağ", "Köy ve tarla"], "correctIndex": 1},
  {"question": "Sait Faik hikâyelerinin geleneksel hikâyecilerden farkı nedir?", "options": ["Doğrusal olay örgüsü kullanması", "Anlık gözlemler ve duygu akışlarına yer vermesi", "Tarihî olayları işlemesi", "Uzun romanlar yazması"], "correctIndex": 1}
]'::jsonb),

('turkce', 'Türkçede Cümle Türleri',
$$Türkçede cümleler çeşitli ölçütlere göre sınıflandırılır. Yapı bakımından basit, bileşik, bağlı ve girişik bileşik cümle olmak üzere dört türü vardır.

Basit cümle, tek yüklemden oluşan cümledir. "Çocuk koştu." cümlesi buna örnektir. Bileşik cümlede ise bir temel, bir ya da birden fazla yan cümle bulunur. Temel cümle, asıl yargıyı içerirken yan cümle ona bağlı ek bilgi sunar.

Anlam bakımından ise cümleler olumlu, olumsuz, soru ve ünlem cümlesi olarak ayrılır. Yüklemin türüne göre fiil ve isim cümlesi ayrımı yapılır. Fiil cümlesinde yüklem bir fiilden, isim cümlesinde ise ek fiil almış bir isimden oluşur.

Yüklemin yerine göre devrik ve kurallı cümle ayrımı da önemlidir. Türkçede kurallı cümlede yüklem sonda yer alır. Devrik cümlede ise yüklem ortada ya da başta bulunabilir. LGS Türkçe sorularında cümle türleri sıkça test edilmektedir.$$,
160, 4, '{lgs}',
'[
  {"question": "Basit cümle nasıl tanımlanır?", "options": ["İki yüklemli cümle", "Tek yüklemden oluşan cümle", "Soru cümlesi", "Devrik cümle"], "correctIndex": 1},
  {"question": "Türkçede kurallı cümlede yüklem nerede bulunur?", "options": ["Başta", "Ortada", "Sonda", "Herhangi bir yerde"], "correctIndex": 2},
  {"question": "İsim cümlesinde yüklem nasıl oluşur?", "options": ["Fiilden", "Ek fiil almış isimden", "Zarf tümlecindan", "Sıfattan"], "correctIndex": 1},
  {"question": "Bileşik cümlenin temel özelliği nedir?", "options": ["Tek yüklem içermesi", "Temel ve yan cümleden oluşması", "Soru içermesi", "Devrik olması"], "correctIndex": 1}
]'::jsonb),

-- ─── İNGİLİZCE ───────────────────────────────────────
('ingilizce', 'Present Perfect Tense',
$$Present Perfect Tense, İngilizce'de geçmişte başlayıp günümüze etkisi süren ya da az önce tamamlanan eylemleri anlatmak için kullanılır. Yapısı "have/has + past participle" şeklindedir.

Olumlu cümlede "I have eaten." (Yedim / Yemiş bulunuyorum.) yapısı kullanılır. Olumsuzda "have not (haven't) ya da has not (hasn't)" gelir. Soru cümlesi "Have you finished?" biçiminde kurulur.

Bu zaman kalıbında "since" (belirli bir andan bu yana) ve "for" (bir süre boyunca) zarf bağlaçları sıkça kullanılır. "I have lived here for five years." (Beş yıldır burada yaşıyorum.) cümlesi buna örnektir.

"Already", "yet", "just" ve "ever" gibi zaman zarfları da Present Perfect ile birlikte gelir. "I have just arrived." (Yeni geldim.) cümlesi "just" kullanımını örnekler. LGS İngilizce testlerinde bu yapı oldukça sık karşımıza çıkmaktadır.$$,
158, 5, '{lgs}',
'[
  {"question": "Present Perfect Tense yapısı nasıldır?", "options": ["was/were + V-ing", "have/has + past participle", "will + verb", "did + verb"], "correctIndex": 1},
  {"question": "\"Since\" ile \"for\" arasındaki fark nedir?", "options": ["İkisi aynı anlama gelir", "Since belirli bir noktayı, for bir süreyi belirtir", "For daha resmi bir kullanımdır", "Since gelecek için kullanılır"], "correctIndex": 1},
  {"question": "\"I have just arrived.\" cümlesinde \"just\" ne anlama gelir?", "options": ["Henüz değil", "Yeni/az önce", "Zaten", "Hiç"], "correctIndex": 1},
  {"question": "Present Perfect ile kullanılan zaman zarfı hangisidir?", "options": ["yesterday", "last week", "already", "ago"], "correctIndex": 2}
]'::jsonb),

-- ─── TEKNOLOJİ ───────────────────────────────────────
('teknoloji', 'Yapay Zeka ve Makine Öğrenmesi',
$$Yapay zeka (YZ), bilgisayarların insan zekasını taklit ederek öğrenme, problem çözme ve karar verme gibi görevleri yerine getirmesini sağlayan teknoloji alanıdır. Makine öğrenmesi ise yapay zekanın en önemli alt dallarından biridir.

Makine öğrenmesinde bilgisayarlar, büyük miktarda veriden örüntü çıkararak kendi kendine öğrenir. Programcıların her kuralı tek tek yazması gerekmez; sistem, verilerden kendi kurallarını üretir.

Yapay zeka üç temel kategoride incelenir: dar yapay zeka yalnızca belirli görevleri yapar; genel yapay zeka insan gibi geniş kapsamlı düşünebilir; süper yapay zeka ise teorik olarak insanı her alanda geride bırakır. Bugün kullandığımız sistemlerin tamamı dar yapay zeka kapsamındadır.

Günlük hayatta YZ'ye pek çok yerde rastlarız: sesli asistanlar, yüz tanıma sistemleri, öneri algoritmaları ve otonom araçlar bunların en bilinen örnekleridir.$$,
165, 5, '{lgs,tyt}',
'[
  {"question": "Makine öğrenmesinin temel özelliği nedir?", "options": ["Her kuralı programcıların yazması", "Büyük verilerden örüntü çıkararak kendi kendine öğrenme", "Yalnızca matematiksel hesaplama yapma", "İnternetsiz çalışma"], "correctIndex": 1},
  {"question": "Dar yapay zeka nasıl tanımlanır?", "options": ["Her alanda insan gibi düşünür", "Yalnızca belirli görevleri yapar", "Süper zekaya sahiptir", "Duygusal karar alır"], "correctIndex": 1},
  {"question": "Aşağıdakilerden hangisi YZ uygulaması değildir?", "options": ["Yüz tanıma", "Öneri algoritması", "El hesap makinesi", "Sesli asistan"], "correctIndex": 2},
  {"question": "Makine öğrenmesi hangi alanın alt dalıdır?", "options": ["Biyoloji", "Yapay zeka", "Matematik", "Fizik"], "correctIndex": 1}
]'::jsonb),

-- ─── BİLİM ───────────────────────────────────────────
('bilim', 'Kuantum Fiziği: Dalga-Parçacık İkilemi',
$$Kuantum fiziği, atom altı parçacıkların davranışını inceleyen modern fiziğin en temel dallarından biridir. Klasik fiziğin geçerli olmadığı bu ölçekte, parçacıklar son derece tuhaf özellikler sergiler.

Dalga-parçacık ikilemi, kuantum fiziğinin temel kavramlarından biridir. Elektron ve foton gibi parçacıklar; hem dalga hem de parçacık özellikleri gösterir. Bu ikili doğa, hangi deney yapıldığına bağlı olarak farklı biçimlerde kendini ortaya koyar.

Werner Heisenberg'in belirsizlik ilkesi, bir parçacığın konumu ve momentumu hakkında aynı anda kesin bilgiye sahip olamayacağımızı söyler. Bu durum, ölçüm yapmanın bizzat sistemi etkilemesinden kaynaklanır.

Kuantum tünelleme, süperiletkenlik ve lazer teknolojisi, kuantum fiziğinin pratik uygulamalarından bazılarıdır. Kuantum bilgisayarlar ise gelecekte klasik bilgisayarları geride bırakabilecek potansiyele sahiptir.$$,
165, 7, '{tyt,ayt}',
'[
  {"question": "Dalga-parçacık ikilemi ne anlama gelir?", "options": ["Parçacıklar yalnızca dalga özelliği gösterir", "Parçacıklar hem dalga hem parçacık özelliği gösterir", "Parçacıklar yalnızca maddesel özelliklere sahiptir", "Dalgalar parçacıklara dönüşür"], "correctIndex": 1},
  {"question": "Heisenberg belirsizlik ilkesine göre ne mümkün değildir?", "options": ["Parçacık hızını ölçmek", "Hem konum hem momentin aynı anda kesin bilinmesi", "Elektron kütlesini hesaplamak", "Atom numarasını belirlemek"], "correctIndex": 1},
  {"question": "Kuantum fiziğinin pratik uygulamalarından biri nedir?", "options": ["Buhar makinesi", "Lazer teknolojisi", "İçten yanmalı motor", "Hidrolik sistemler"], "correctIndex": 1},
  {"question": "Kuantum fiziği hangi ölçekte geçerlidir?", "options": ["Makro ölçek", "Günlük hayat ölçeği", "Atom altı parçacık ölçeği", "Galaktik ölçek"], "correctIndex": 2}
]'::jsonb),

-- ─── FELSEFE ─────────────────────────────────────────
('felsefe', 'Felsefenin Tanımı ve Temel Soruları',
$$Felsefe, Yunanca "philosophia" sözcüğünden gelir; "sophia" bilgelik, "philos" ise sevgi anlamına taşır. Dolayısıyla felsefe, bilgelik sevgisi ya da bilgeliği arama çabası olarak tanımlanabilir.

Felsefenin başlıca alt dalları şunlardır: ontoloji (varlık felsefesi), epistemoloji (bilgi felsefesi), etik (ahlak felsefesi), estetik (güzellik felsefesi) ve mantık. Ontoloji "Var olan nedir?" diye sorarken epistemoloji "Bilgi mümkün müdür, kaynağı nedir?" diye sorar.

Felsefe, bilimden farklı olarak deney yoluyla değil; akıl yürütme, sorgulama ve kavramsal çözümleme yoluyla ilerler. Bu nedenle felsefi sorular kesin bir yanıta kavuşmaktan çok, düşünmeyi derinleştirmeyi amaçlar.

TYT ve AYT sınavlarında felsefe sorularının temelini bu alt dallar ve onların temel kavramları oluşturur. Felsefeye giriş yaparken hangi sorunun hangi alt dala ait olduğunu bilmek büyük kolaylık sağlar.$$,
165, 6, '{tyt,ayt}',
'[
  {"question": "\"Philosophia\" kelimesinin Türkçe anlamı nedir?", "options": ["Doğa bilimi", "Bilgelik sevgisi", "Mantık kuralları", "Ahlak araştırması"], "correctIndex": 1},
  {"question": "Epistemoloji hangi temel soruyu araştırır?", "options": ["Var olan nedir?", "Güzel olan nedir?", "Bilgi mümkün müdür?", "Ahlaki olan nedir?"], "correctIndex": 2},
  {"question": "Felsefe ile bilim arasındaki temel fark nedir?", "options": ["Felsefe deney yapar, bilim yapmaz", "Bilim akıl yürütür, felsefe yapmaz", "Felsefe deney yerine akıl yürütme kullanır", "İkisi tamamen aynıdır"], "correctIndex": 2},
  {"question": "Etik hangi soruyu araştırır?", "options": ["Var olan nedir?", "Güzel olan nedir?", "Ahlaki olan nedir?", "Bilgi nedir?"], "correctIndex": 2}
]'::jsonb),

-- ─── TARİH ───────────────────────────────────────────
('tarih', 'Fransız Devrimi ve Etkileri',
$$Fransız Devrimi (1789), dünya tarihinin en dönüm noktalarından biridir. Uzun yıllar süren ekonomik bunalım, köylü sefaletiyle birleşince halk, Kral XVI. Louis'nin mutlakiyetçi yönetimine karşı ayaklandı.

14 Temmuz 1789'da Bastille hapishanesinin basılması, devrimin sembolik başlangıç noktası olarak kabul edilir. Ardından "İnsan ve Yurttaş Hakları Bildirisi" ilan edilerek eşitlik, özgürlük ve kardeşlik ilkeleri tüm insanlığa seslendirildi.

Devrim, dünya genelinde derin izler bıraktı. Milliyetçilik akımlarının yükselişini hızlandırdı; Avrupa'daki monarşileri sarstı. Napolyon Bonapart'ın iktidarı ise devrim değerlerini kısmen koruyan, kısmen dönüştüren farklı bir evre açtı.

Osmanlı Devleti de bu süreçten etkilendi. Fransız Devrimi'nin yaydığı milliyetçilik fikirleri, Osmanlı'nın Balkan coğrafyasında önce Sırp (1804) ardından Yunan (1821) bağımsızlık hareketlerini tetikledi.$$,
168, 6, '{tyt,ayt,lgs}',
'[
  {"question": "Fransız Devrimi'nin sembolik başlangıç noktası nedir?", "options": ["Versay Antlaşması'nın imzalanması", "Bastille hapishanesinin basılması", "XVI. Louis'nin tahttan indirilmesi", "Napolyon'un iktidara gelmesi"], "correctIndex": 1},
  {"question": "Fransız Devrimi'nin temel sloganı hangi üç kavramı içerir?", "options": ["Kral, kilise, devlet", "Eşitlik, özgürlük, kardeşlik", "Adalet, barış, refah", "Güvenlik, düzen, kalkınma"], "correctIndex": 1},
  {"question": "Fransız Devrimi Osmanlı'yı nasıl etkiledi?", "options": ["Osmanlı'yı güçlendirdi", "Osmanlı'da ekonomik kalkınmayı sağladı", "Balkan milliyetçilik hareketlerini tetikledi", "Osmanlı-Fransa ittifakını pekiştirdi"], "correctIndex": 2},
  {"question": "Bastille hapishanesi kaç yılında basılmıştır?", "options": ["1776", "1789", "1804", "1815"], "correctIndex": 1}
]'::jsonb),

-- ─── PSİKOLOJİ ───────────────────────────────────────
('psikoloji', 'Pavlov ve Klasik Koşullanma',
$$Ivan Pavlov, 20. yüzyılın başında köpekler üzerinde yaptığı deneylerle öğrenme psikolojisine temel katkılar sağlamıştır. Pavlov, köpeklere yemek verirken zil sesi çaldığını fark etti; başlangıçta yalnızca yemeğe tepki veren köpekler zamanla yalnızca zil sesini duyduklarında salya salmaya başladı.

Bu süreç klasik koşullanma olarak adlandırılır. Başlangıçta nötr olan bir uyaran (zil sesi), koşulsuz uyaranla (yemek) tekrar tekrar eşleştirildiğinde, tek başına koşullu tepkiyi (salya) uyandırabilir hale gelir.

Koşulsuz uyaran doğal olarak tepkiye yol açan uyarandır; koşullu uyaran ise öğrenme yoluyla tepki uyandıran uyarandır. Bu öğrenme türü bilinçsiz gerçekleşir ve hem hayvanlarda hem insanlarda gözlemlenebilir.

Günlük yaşamda klasik koşullanmaya pek çok örnek verilebilir. Belirli bir koku, geçmişteki anıları canlandırabilir. TYT psikoloji sorularında Pavlov deneyi sıkça karşımıza çıkmaktadır.$$,
165, 5, '{tyt,lgs}',
'[
  {"question": "Pavlov deneyinde zil sesi başlangıçta nasıl bir uyarandır?", "options": ["Koşulsuz uyaran", "Koşullu uyaran", "Nötr uyaran", "Doğal uyaran"], "correctIndex": 2},
  {"question": "Klasik koşullanmada koşullu tepki nedir?", "options": ["Yemeğe verilen doğal salya tepkisi", "Yalnızca zil sesine verilen öğrenilmiş tepki", "Köpeğin yemeği görmesi", "Pavlov'un zil çalması"], "correctIndex": 1},
  {"question": "Klasik koşullanma hangi tür öğrenmeyi temsil eder?", "options": ["Bilinçli ve kasıtlı öğrenme", "Bilinçsiz ve otomatik öğrenme", "Sözel öğrenme", "Gözlemsel öğrenme"], "correctIndex": 1},
  {"question": "Günlük yaşamda klasik koşullanmaya hangi durum örnek verilebilir?", "options": ["Bisiklet sürmeyi öğrenmek", "Belirli bir koku geçmişteki anıları canlandırır", "Matematik problemini çözmek", "Yeni dil öğrenmek"], "correctIndex": 1}
]'::jsonb),

-- ─── COĞRAFYA ────────────────────────────────────────
('cografya', 'Türkiye''nin İklim Bölgeleri',
$$Türkiye, farklı iklim tiplerinin bir arada yaşandığı eşsiz bir coğrafi konuma sahiptir. Bu çeşitlilik; enlem, yükselti, deniz etkisi ve dağların konumuyla şekillenmektedir.

Karadeniz kıyıları boyunca ılıman okyanusal iklim hüküm sürer. Yıl boyu yağış alan bu bölgede kış ve yaz arasındaki sıcaklık farkı görece azdır. Rize ve çevresinde Türkiye'nin en fazla yağış alan yerleri yer alır.

İç Anadolu, kışları soğuk ve kurak, yazları sıcak ve az yağışlı karasal iklimin egemen olduğu bölgedir. Buharlaşma yüksek olduğundan step bitki örtüsü yaygındır.

Akdeniz ikliminde ise yazlar kurak ve sıcak, kışlar ılık ve yağışlıdır. Bu iklimde maki, zeytin ve narenciye tarımı ön plana çıkar. İç Anadolu'dan kıyıya geçişte dağlar etkili bir iklim sınırı oluşturur.

Doğu Anadolu ise karasal iklimin en sert biçiminin yaşandığı bölgedir; kışlar uzun, soğuk ve karlıdır.$$,
170, 5, '{lgs,tyt}',
'[
  {"question": "Türkiye''de en fazla yağış hangi bölgede görülür?", "options": ["İç Anadolu", "Karadeniz kıyıları", "Akdeniz kıyıları", "Doğu Anadolu"], "correctIndex": 1},
  {"question": "Akdeniz ikliminin temel özelliği nedir?", "options": ["Kışlar soğuk ve kurak, yazlar serin", "Yazlar kurak ve sıcak, kışlar ılık ve yağışlı", "Yıl boyu düzenli yağış", "Yazlar soğuk, kışlar ılık"], "correctIndex": 1},
  {"question": "İç Anadolu''da step bitki örtüsünün yaygın olmasının nedeni nedir?", "options": ["Deniz etkisinin fazla olması", "Buharlaşmanın yüksek olması", "Yağışın fazla olması", "Yükseltinin düşük olması"], "correctIndex": 1},
  {"question": "Doğu Anadolu''nun iklim özelliği nedir?", "options": ["Ilıman, yağışlı", "Sıcak ve kurak", "Kışları uzun, soğuk ve karlı karasal iklim", "Okyanusal iklim"], "correctIndex": 2}
]'::jsonb),

-- ─── EDEBİYAT ────────────────────────────────────────
('edebiyat', 'Tanzimat Edebiyatı: Genel Özellikleri',
$$Tanzimat edebiyatı, 1839 Tanzimat Fermanı'nın ilanıyla birlikte başlayan ve Türk edebiyatını köklü biçimde dönüştüren bir dönemdir. Batı edebiyatı anlayışı bu dönemde Türk edebiyatına girmiş; roman, hikâye ve tiyatro türleri ilk kez ciddi biçimde denenmiştir.

Tanzimat edebiyatı iki kuşak halinde ele alınır. Birinci kuşak (1860-1876) yazarları —Şinasi, Namık Kemal, Ziya Paşa— toplumsal sorunlara odaklanmış ve edebiyatı bir araç olarak kullanmıştır. Hürriyet, vatan ve adalet bu kuşağın başlıca temaları arasındadır.

İkinci kuşak (1876-1895) yazarları ise bireysel konulara yönelmiştir. Recaizade Mahmut Ekrem ve Abdülhak Hamit Tarhan bu dönemin öne çıkan isimleridir. Sanat için sanat anlayışı bu kuşakta ağırlık kazanmıştır.

Dil açısından her iki kuşak da ağır Osmanlıca kullanmakla birlikte, Şinasi başta olmak üzere bazı yazarlar sade dili savunmuştur.$$,
168, 6, '{tyt,ayt,lgs}',
'[
  {"question": "Tanzimat edebiyatının başlangıç noktası hangisidir?", "options": ["Islahat Fermanı (1856)", "Tanzimat Fermanı (1839)", "Meşrutiyet (1876)", "Cumhuriyet (1923)"], "correctIndex": 1},
  {"question": "Tanzimat birinci kuşağının temel temaları nelerdir?", "options": ["Bireysel aşk ve hüzün", "Hürriyet, vatan ve adalet", "Doğa ve mistisizm", "Sanat için sanat"], "correctIndex": 1},
  {"question": "Türk edebiyatına Tanzimat döneminde hangi yeni türler girmiştir?", "options": ["Destan ve halk hikâyesi", "Roman, hikâye ve tiyatro", "Gazel ve kaside", "Koşma ve semai"], "correctIndex": 1},
  {"question": "İkinci Tanzimat kuşağında ağırlık kazanan anlayış hangisidir?", "options": ["Toplum için sanat", "Sanat için sanat", "Din için sanat", "Millet için sanat"], "correctIndex": 1}
]'::jsonb),

-- ─── SOSYAL ──────────────────────────────────────────
('sosyal', 'Coğrafi Keşifler ve Sonuçları',
$$15. ve 16. yüzyıllarda Avrupalı kaşifler tarafından gerçekleştirilen coğrafi keşifler, dünya tarihini derinden değiştirmiştir. Bu keşifler; sömürgeciliğin başlaması, ticaret yollarının değişmesi ve kıtalar arası kültürel etkileşimin artmasıyla sonuçlanmıştır.

Portekizli kaşifler Afrika kıyılarını inerek 1488'de Bartolomeu Dias ile Ümit Burnu'nu aştı. Vasco da Gama ise 1498'de Hindistan'a ulaşarak baharat ticaret yolunu doğrudan kurdu. İspanya adına yola çıkan Kristof Kolomb, 1492'de Amerika kıtasına ulaştı.

Keşiflerin olumlu sonuçları arasında Avrupa'nın zenginleşmesi, bilimsel gelişmelerin hızlanması ve ticaretin genişlemesi sayılabilir. Olumsuz sonuçlar ise son derece ağırdır: yerli halklar sömürüldü, köle ticareti yaygınlaştı ve büyük nüfus kayıpları yaşandı.

Osmanlı açısından ise İpek Yolu'nun önemini yitirmesi ekonomik kayıplara yol açtı. Bu durum Osmanlı ekonomisini olumsuz etkilemiş ve gerileme sürecini hızlandırmıştır.$$,
170, 5, '{lgs,tyt}',
'[
  {"question": "Kristof Kolomb hangi yılda Amerika''ya ulaşmıştır?", "options": ["1488", "1492", "1498", "1522"], "correctIndex": 1},
  {"question": "Vasco da Gama''nın keşfinin önemi nedir?", "options": ["Amerika kıtasını bulması", "Dünyayı dolaşması", "Hindistan''a ulaşarak baharat yolunu açması", "Afrika''nın güneyini keşfetmesi"], "correctIndex": 2},
  {"question": "Coğrafi keşiflerin Osmanlı''ya olumsuz etkisi nedir?", "options": ["Savaş kayıpları", "İpek Yolu''nun önemini yitirmesi ve ekonomik kayıp", "Dini baskılar", "Toprak kaybı"], "correctIndex": 1},
  {"question": "Coğrafi keşiflerin olumsuz sonuçları arasında ne yer alır?", "options": ["Bilimsel gelişme", "Ticaretin genişlemesi", "Köle ticaretinin yaygınlaşması", "Avrupa''nın zenginleşmesi"], "correctIndex": 2}
]'::jsonb),

-- ─── FEN ─────────────────────────────────────────────
('fen', 'Fotosentez ve Solunum',
$$Fotosentez, yeşil bitkilerin güneş ışığını kullanarak karbondioksit ve suyu şekere dönüştürdüğü yaşamsal bir süreçtir. Bu tepkime kloroplastlarda gerçekleşir. Temel denklem: 6CO₂ + 6H₂O + ışık enerjisi → C₆H₁₂O₆ + 6O₂ şeklindedir.

Fotosentezin iki temel aşaması vardır: ışığa bağımlı tepkimeler (klorofil tarafından ışık enerjisinin soğurulması) ve ışıktan bağımsız tepkimeler (Calvin döngüsü ile şeker üretimi).

Hücresel solunum ise fotosentezin tersidir. Besinlerdeki kimyasal enerji, oksijen kullanılarak hücrelerin kullanabileceği ATP enerjisine dönüştürülür. Bu süreç mitokondrilerde gerçekleşir. Temel denklem: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP şeklindedir.

Bitkiler hem fotosentez hem de solunum yapar. Gündüz ışık yeterliyken fotosentez baskındır; alınan CO₂ miktarı verilen O₂'den fazladır. LGS fen sorularında bu iki sürecin karşılaştırılması sıkça test edilmektedir.$$,
170, 5, '{lgs}',
'[
  {"question": "Fotosentez bitkinin hangi organelinde gerçekleşir?", "options": ["Mitokondri", "Ribozom", "Kloroplast", "Çekirdek"], "correctIndex": 2},
  {"question": "Fotosentezin temel ürünleri nelerdir?", "options": ["CO₂ ve H₂O", "Şeker (C₆H₁₂O₆) ve O₂", "ATP ve CO₂", "H₂O ve ATP"], "correctIndex": 1},
  {"question": "Hücresel solunum hangi organelde gerçekleşir?", "options": ["Kloroplast", "Ribozom", "Mitokondri", "Koful"], "correctIndex": 2},
  {"question": "Hücresel solunumun amacı nedir?", "options": ["Şeker üretmek", "O₂ üretmek", "ATP enerjisi üretmek", "CO₂ depolamak"], "correctIndex": 2}
]'::jsonb),

-- ─── SAĞLIK ──────────────────────────────────────────
('saglik', 'Bağışıklık Sistemi: Nasıl Çalışır?',
$$Bağışıklık sistemi, vücudumuzu hastalık yapıcı mikroorganizmalara karşı koruyan karmaşık bir savunma mekanizmasıdır. İki temel bileşenden oluşur: doğal bağışıklık ve kazanılmış bağışıklık.

Doğal bağışıklık, doğuştan sahip olduğumuz ilk savunma hattıdır. Cilt, mukoza zarları ve kandaki bazı hücreler bu katmanda görev yapar. Bir yabancı madde vücuda girdiğinde bu savunma anında devreye girer.

Kazanılmış bağışıklık ise antijene özgü tepkilere dayanır. B lenfositleri antikor üretirken T lenfositleri enfekte hücreleri tanıyıp yok eder. En önemli özelliği, karşılaşılan patojeni "hatırlama" yeteneğidir. Bu sayede aynı mikroorganizmayla tekrar karşılaşıldığında yanıt çok daha hızlı ve güçlü olur.

Aşılar bu hafıza mekanizmasını kullanır: zayıflatılmış ya da parçalanmış patojen vücuda verilerek bağışıklık sistemi eğitilir. Böylece gerçek enfeksiyon durumunda vücut hazırlıklı olur.$$,
168, 5, '{lgs,tyt}',
'[
  {"question": "Bağışıklık sisteminin kaç temel bileşeni vardır?", "options": ["Bir", "İki", "Üç", "Dört"], "correctIndex": 1},
  {"question": "Doğal bağışıklığın temel özelliği nedir?", "options": ["Antikor üretmesi", "Doğuştan var olması ve anında devreye girmesi", "Yalnızca virüslere karşı çalışması", "Aşıyla kazanılması"], "correctIndex": 1},
  {"question": "Kazanılmış bağışıklıkta antikor üreten hücreler hangileridir?", "options": ["T lenfositleri", "B lenfositleri", "Kırmızı kan hücreleri", "Trombositler"], "correctIndex": 1},
  {"question": "Aşıların çalışma prensibi nedir?", "options": ["Vücuda güçlü antibiyotik vermek", "Bağışıklık sistemini zayıflatmak", "Hafıza mekanizmasını kullanarak vücudu eğitmek", "Virüsleri doğrudan öldürmek"], "correctIndex": 2}
]'::jsonb);
