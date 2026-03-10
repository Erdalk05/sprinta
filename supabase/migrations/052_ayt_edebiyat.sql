-- ================================================================
-- 052_ayt_edebiyat.sql
-- AYT Edebiyat — 15 metin x 5 soru = 75 soru
-- ================================================================
DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM text_library WHERE category = 'AYT Edebiyat') > 0 THEN
    RAISE NOTICE '052: already exists';
    RETURN;
  END IF;

  -- ============================================================
  -- TEXT 1: Divan Edebiyatının Temel Özellikleri ve Aruz Vezni
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000001-0000-4000-f300-000000000001',
    'Divan Edebiyatının Temel Özellikleri ve Aruz Vezni',
    'AYT Edebiyat',
    'AYT',
    4,
    445,
    3,
    $b$Divan edebiyatı, Türklerin İslam medeniyeti dairesine girmesiyle birlikte şekillenmeye başlayan ve yaklaşık altı yüz yıl boyunca varlığını sürdüren köklü bir edebiyat geleneğidir. Bu edebiyatın temel kaynakları arasında Arap ve Fars edebiyatları önemli bir yer tutar; ancak Türk şairleri bu kaynaklardan beslenerek kendine özgü bir estetik anlayış geliştirmiştir. Divan edebiyatı, saray ve medrese çevresinde gelişmiş, yüksek bir eğitim düzeyini gerektiren ve seçkin bir zümreye hitap eden bir edebiyat olarak tanımlanabilir.

Bu edebiyatın en belirgin özelliklerinden biri, aruz veznini esas almasıdır. Arap şiirinden alınan aruz, hecelerin uzunluk ve kısalık esasına dayanan bir vezin sistemidir. Türkçe doğası itibarıyla hece bakımından eşit uzunlukta hecelere sahip olduğundan, aruz vezninin uygulanması birtakım güçlükler doğurmuştur. Bu güçlüklerin aşılabilmesi için şairler zaman zaman imale ve zihaf gibi ses değiştirme yollarına başvurmuşlardır. İmale, kısa bir heceyi uzun okumak; zihaf ise uzun bir heceyi kısa okumak anlamına gelir. Bununla birlikte, Türk şairleri bu kısıtlamaları aşarak aruz veznini büyük bir ustalıkla kullanmayı başarmışlardır.

Divan edebiyatında kullanılan dil, gündegünlük konuşma dilinden oldukça farklıdır. Şiir dili Arapça ve Farsçadan alınan kelime ve tamlamalarla yüklü olup bu durum eserleri halk için anlaşılmaz kılmaktaydı. Şairler anlam derinliği sağlamak amacıyla mecaz, teşbih, istiare ve mübalağa gibi edebi sanatlara sıkça başvurmuşlardır. Söz sanatları, hem şiirin estetik değerini artırmak hem de dini, felsefi ve mistik anlamları yoğun biçimde aktarmak için işlevsel bir araç olarak kullanılmıştır.

Divan şiirinin içerik açısından başlıca konuları aşk, şarap, tabiat ve tasavvuftur. Ancak bu konular çoğunlukla sembolik düzlemde ele alınır. Örneğin şarap, dünyevi bir zevk olarak değil tasavvufi aşkın ve ilahi cezbenin simgesi olarak işlenir. Sevgili ise somut bir insan olmaktan öte, ulaşılmaz ilahi güzelliğin temsilcisi konumuna yükseltilir. Bu alegorik yaklaşım, divan şiirine katmanlı bir anlam yapısı kazandırmaktadır.

Divan edebiyatında nazım biçimleri son derece çeşitlidir. Gazel, kaside, mesnevi, rubai ve şarkı bu biçimlerin başında gelir. Her nazım biçiminin kendine özgü uyak düzeni, konu ve uzunluk kuralları bulunmaktadır. Kaside övgü şiiri olarak öne çıkarken gazel aşk ve duygu şiirinin ana biçimi olmuştur. Mesnevi ise hacimli anlatı eserlerinin kaleme alındığı nazım biçimidir. Divan edebiyatı, bu zengin nazım geleneğiyle Türk kültür tarihinin ayrılmaz bir parçasını oluşturmaktadır.$b$,
    ARRAY['divan edebiyatı','aruz vezni','nazım biçimleri','AYT'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000001-0000-4000-f300-000000000001',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Aruz vezninin Arap şiirindeki kökenleri","Divan edebiyatının temel özellikleri ve aruz vezni","Divan şairlerinin biyografileri","Türkçenin Arapça ve Farsçadan etkilenmesi"]'::jsonb,
    1,
    'Metin, divan edebiyatının genel özelliklerini ve aruz veznini kapsamlı biçimde ele almaktadır.',
    4,
    1
  ),
  (
    'f3000001-0000-4000-f300-000000000001',
    'detail',
    'Metne göre "imale" hangi anlama gelir?',
    '["Uzun bir heceyi kısa okumak","Kısa bir heceyi uzun okumak","İki heceyi birleştirerek okumak","Sessiz harfleri düşürerek okumak"]'::jsonb,
    1,
    'Metinde imale, kısa bir heceyi uzun okumak şeklinde tanımlanmaktadır.',
    4,
    2
  ),
  (
    'f3000001-0000-4000-f300-000000000001',
    'detail',
    'Divan şiirinde şarap imgesi metne göre nasıl yorumlanmalıdır?',
    '["Gerçek anlamda içki içmeyi simgeler","Günlük hayatın zorluklarını temsil eder","Tasavvufi aşkın ve ilahi cezbenin simgesidir","Şairin eğlence anlayışını yansıtır"]'::jsonb,
    2,
    'Metinde şarabın dünyevi bir zevk değil, tasavvufi aşkın ve ilahi cezbenin simgesi olduğu belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000001-0000-4000-f300-000000000001',
    'vocabulary',
    'Metinde geçen "alegorik" kelimesinin anlamı aşağıdakilerden hangisidir?',
    '["Gerçekçi ve somut","Simgesel ve mecazi anlam taşıyan","Müzikal ve ahenkli","Tarihsel ve belgesel"]'::jsonb,
    1,
    'Alegorik, simgesel ve mecazi anlam taşıyan demektir; metinde de bu anlamda kullanılmıştır.',
    4,
    4
  ),
  (
    'f3000001-0000-4000-f300-000000000001',
    'inference',
    'Metinden hareketle divan edebiyatı hakkında aşağıdaki sonuçlardan hangisine ulaşılabilir?',
    '["Halkın gündelik yaşamını yansıtmayı öncelik olarak benimsemiştir","Yalnızca dini konuları işlemiştir","Yüksek eğitim gerektiren seçkin bir zümreye hitap etmiştir","Sözlü geleneğe dayandığı için yazılı kaynakları yoktur"]'::jsonb,
    2,
    'Metin, divan edebiyatının saray ve medrese çevresinde geliştiğini ve yüksek eğitim gerektirdiğini açıkça belirtmektedir.',
    4,
    5
  );

  -- ============================================================
  -- TEXT 2: Gazel: Yapı, İçerik ve Anlam Özellikleri
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000002-0000-4000-f300-000000000002',
    'Gazel: Yapı, İçerik ve Anlam Özellikleri',
    'AYT Edebiyat',
    'AYT',
    4,
    448,
    3,
    $b$Gazel, divan edebiyatının en çok kullanılan ve en köklü nazım biçimlerinden biridir. Arapça kökenli bu kelime, "kadınlarla ve aşkla ilgili söz söylemek" anlamına gelmektedir. Bu tanım, gazelin içerik dünyasını da özetler niteliktedir; zira gazel, özünde aşk ve güzellik üzerine kurulu lirik bir şiir biçimidir. Türk edebiyatına Fars şiiri aracılığıyla geçen gazel, on üçüncü yüzyıldan itibaren Türk şairlerin elinde büyük bir ustalık düzeyine ulaşmıştır.

Gazelin yapısal özellikleri oldukça belirgindir. Gazel, genellikle beş ila on beyt arasında değişen sayıda beyitten oluşur. İlk beyte "matla" adı verilir; matla beytinin her iki mısraı da birbiriyle kafiyeli olmalıdır. Gazelin son beytine ise "makta" denir ve bu beyitte şair çoğunlukla kendi mahlasını yani takma adını kullanır. Şairin en güzel beytini yazdığı düşünülen, en çok beğenilen beyite ise "beytü''l-gazel" ya da "şah beyit" adı verilmektedir. Uyak düzeni açısından gazelde aa/ba/ca/da biçiminde bir kafiye şeması uygulanır.

Anlam açısından gazeller birkaç farklı kategoriye ayrılır. "Âşıkane gazeller" yoğun duygusal bir atmosfer içinde aşk acısını, özlemi ve vuslat özlemini işler. "Rindane gazeller" şarap, eğlence ve dünyevi zevkleri konu edinirken bu unsurlar çoğunlukla tasavvufi sembollerle iç içe geçer. "Sofiyane gazeller" ise doğrudan mistik ve dini konuları işleyerek Allah sevgisini ve tasavvuf felsefesini şiirsel bir dille aktarır. Öte yandan "Hikemî gazeller" ise didaktik bir nitelik taşır; hayat dersleri ve felsefi düşünceler içerir. Nabi bu türün en önemli temsilcilerindendir.

Divan şiirinin en önemli gazel ustalarının başında Fuzuli, Baki, Nedim ve Şeyh Galip gelir. Fuzuli, aşkı varoluşsal bir ıstırap olarak işleyen gazelleriyle öne çıkar. Baki ise dünyevi zevklerin ve anın önemini vurgulayan gazelleriyle tanınır. Nedim, lale devri İstanbul''unun renkli yaşamını şiirleştirmiş ve gazeli daha yerli bir çizgiye taşımıştır. Şeyh Galip ise tasavvufi derinliği ve özgün imgelem gücüyle diğer şairlerden ayrışır.

Gazelin dil ve üslup özellikleri de dikkat çekicidir. Şairler, benzetme, istiare, tenasüp ve leff ü neşr gibi edebi sanatlarla şiire anlam derinliği katmaktadır. Özellikle mazmun adı verilen kalıplaşmış imgeler gazelde sıkça kullanılır. Servi, gül, bülbül, lale, sümbül gibi doğa unsurları belirli sembolik anlamlarla şiirde yer alır. Bu nedenle gazeli doğru okuyabilmek için söz konusu mazmunların bilinmesi büyük önem taşımaktadır.$b$,
    ARRAY['gazel','divan şiiri','nazım biçimi','AYT Edebiyat'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000002-0000-4000-f300-000000000002',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Fuzuli''nin gazelleri üzerine bir inceleme","Gazel nazım biçiminin yapı, içerik ve anlam özellikleri","Divan edebiyatında uyak sistemleri","Türk şiirinin Fars şiirinden farkları"]'::jsonb,
    1,
    'Metin, gazelin yapısal, içeriksel ve anlam özelliklerini kapsamlı biçimde ele almaktadır.',
    4,
    1
  ),
  (
    'f3000002-0000-4000-f300-000000000002',
    'detail',
    'Metne göre "makta" nedir?',
    '["Gazelin en güzel beyti","Şairin mahlasını kullandığı son beyt","Gazelin kafiyeli ilk beyti","Tasavvufi anlam taşıyan beyt"]'::jsonb,
    1,
    'Metinde makta, şairin kendi mahlasını kullandığı gazelin son beyti olarak tanımlanmaktadır.',
    4,
    2
  ),
  (
    'f3000002-0000-4000-f300-000000000002',
    'detail',
    'Metne göre "hikemî gazeller" hangi özelliği taşır?',
    '["Yalnızca aşk konusunu işler","Tasavvufi sembollere yer vermez","Didaktik nitelik taşır ve felsefi düşünceler içerir","Şarabı doğrudan ele alır"]'::jsonb,
    2,
    'Metinde hikemî gazellerin didaktik nitelik taşıdığı ve hayat dersleri ile felsefi düşünceler içerdiği belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000002-0000-4000-f300-000000000002',
    'vocabulary',
    'Metinde geçen "mazmun" kelimesi hangi anlamda kullanılmıştır?',
    '["Şiirde kullanılan ölçü birimi","Divan şiirindeki kalıplaşmış imgeler","Şairin takma adı","Gazelin uyak düzeni"]'::jsonb,
    1,
    'Metinde mazmun, divan şiirinde kullanılan kalıplaşmış imgeler anlamında kullanılmaktadır.',
    4,
    4
  ),
  (
    'f3000002-0000-4000-f300-000000000002',
    'inference',
    'Nedim''in gazelleriyle ilgili metinden çıkarılabilecek en doğru yargı aşağıdakilerden hangisidir?',
    '["Tasavvufi derinliği ön planda tutan bir şairdir","Aşk acısını varoluşsal boyutta ele alır","Gazeli İstanbul yaşamını yansıtarak yerli bir çizgiye taşımıştır","Hikemî gazellerin en önemli temsilcisidir"]'::jsonb,
    2,
    'Metinde Nedim''in lale devri İstanbul''unun renkli yaşamını şiirleştirdiği ve gazeli daha yerli bir çizgiye taşıdığı ifade edilmektedir.',
    4,
    5
  );


  -- ============================================================
  -- TEXT 3: Tanzimat Edebiyatının Sosyal ve Siyasi Temelleri
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000003-0000-4000-f300-000000000003',
    'Tanzimat Edebiyatının Sosyal ve Siyasi Temelleri',
    'AYT Edebiyat',
    'AYT',
    4,
    450,
    3,
    $b$Tanzimat edebiyatı, 1839 yılında ilan edilen Tanzimat Fermanı''nın ardından Osmanlı toplumunda başlayan modernleşme süreciyle doğrudan bağlantılıdır. Bu dönem edebiyatı, hem biçimsel hem de içerik açısından Batı edebiyatından büyük ölçüde etkilenmiş; ancak bu etkiyi özgün bir sentezle Türk kültürel zeminine uyarlamıştır. Tanzimat edebiyatçıları, sanatı bir amaç değil, toplumu aydınlatmak ve değiştirmek için kullanılan bir araç olarak görmüşlerdir. Bu anlayış, dönemin edebiyat eserlerine güçlü bir toplumsal sorumluluk bilinci kazandırmıştır.

Dönemin siyasi atmosferi, edebiyat üzerinde belirleyici bir etki bırakmıştır. Osmanlı Devleti''nin Batı karşısında yaşadığı askeri ve ekonomik gerileme, aydınları köklü bir modernleşme arayışına yöneltmiştir. Bu bağlamda Tanzimat aydınları, Fransız Devrimi''nin temel değerleri olan özgürlük, eşitlik ve adalet ilkelerini Osmanlı toplumuna aktarmayı hedeflemiştir. Edebiyat, bu hedefe ulaşmada en etkili araç olarak görülmüştür; dolayısıyla roman, gazete yazısı ve tiyatro gibi türler sosyal ve siyasi değişimi hızlandırmak amacıyla kullanılmıştır.

Tanzimat edebiyatı, iki kuşak halinde incelenmektedir. Birinci kuşak sanatçıları arasında Şinasi, Ziya Paşa ve Namık Kemal sayılabilir. Bu kuşak, edebiyatı her şeyden önce bir eğitim ve bilinçlendirme aracı olarak benimsemiştir. Sanat anlayışlarında "toplum için sanat" ilkesi egemendir. İkinci kuşak ise Recaizade Mahmut Ekrem ve Abdülhak Hamit Tarhan gibi isimlerden oluşur. Bu kuşak, toplumsal kaygılardan biraz uzaklaşarak bireysel duygulara ve estetik kaygılara yönelmiştir; "sanat için sanat" anlayışı bu grupta belirginleşmeye başlamıştır.

Tanzimat döneminde Türk edebiyatına pek çok yeni tür girmiştir. Roman, hikaye, modern anlamda tiyatro ve gazete edebiyatı bu dönemde ortaya çıkmış ya da güçlenmiştir. Türk edebiyatının ilk romanı sayılan Şemsettin Sami''nin Taaşşuk-ı Talat ve Fitnat adlı eseri bu dönemde yayımlanmıştır. Namık Kemal''in İntibah ve Cezmi adlı romanları ile tiyatro eserleri ise dönemin en etkili yapıtları arasında yerini almıştır.

Tanzimat edebiyatçıları dil konusunda da görüş ayrılıklarına düşmüştür. Şinasi ve Namık Kemal halkın anlayabileceği sade bir dili savunurken Ziya Paşa ve özellikle ikinci kuşak yazarlar ağır bir Osmanlı Türkçesi kullanmaya devam etmiştir. Bu gerilim, dönemin edebiyat anlayışındaki çelişkileri yansıtmaktadır. Bununla birlikte, edebiyatın toplumsal işlevi ve sanatın sosyal sorumluluğu üzerindeki vurgu, Tanzimat edebiyatını sonraki dönemlerden ayıran en belirgin özellik olmaya devam etmektedir.$b$,
    ARRAY['Tanzimat edebiyatı','modernleşme','sosyal değişim','AYT Edebiyat'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000003-0000-4000-f300-000000000003',
    'main_idea',
    'Metnin ana fikri aşağıdakilerden hangisidir?',
    '["Tanzimat Fermanı''nın siyasi sonuçları","Tanzimat edebiyatının sosyal ve siyasi temelleri ile özellikleri","Osmanlı''nın Batı karşısındaki askeri yenilgileri","Roman türünün Türk edebiyatına girişi"]'::jsonb,
    1,
    'Metin, Tanzimat edebiyatının sosyal ve siyasi arka planını, kuşaklarını ve temel özelliklerini ele almaktadır.',
    4,
    1
  ),
  (
    'f3000003-0000-4000-f300-000000000003',
    'detail',
    'Metne göre Tanzimat edebiyatının birinci kuşağının temel sanat anlayışı nedir?',
    '["Sanat için sanat","Toplum için sanat","Estetik kaygıların ön planda tutulması","Bireysel duyguların ifadesi"]'::jsonb,
    1,
    'Metinde birinci kuşak sanatçılarında "toplum için sanat" ilkesinin egemen olduğu belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000003-0000-4000-f300-000000000003',
    'detail',
    'Aşağıdakilerden hangisi metne göre Tanzimat edebiyatına kazandırılan yeni türlerden biridir?',
    '["Gazel","Kaside","Modern tiyatro","Mesnevi"]'::jsonb,
    2,
    'Metinde roman, hikaye, modern tiyatro ve gazete edebiyatının Tanzimat döneminde ortaya çıktığı ya da güçlendiği belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000003-0000-4000-f300-000000000003',
    'vocabulary',
    'Metinde "modernleşme" kavramı hangi bağlamda kullanılmaktadır?',
    '["Dini kurumların yeniden düzenlenmesi","Batı değerlerini ve kurumlarını benimseyerek toplumu dönüştürme","Yalnızca askeri reformların yapılması","Edebiyatta yeni uyak biçimlerinin denenmesi"]'::jsonb,
    1,
    'Metinde modernleşme, Batı''nın değerlerini ve kurumlarını benimseyerek toplumu dönüştürme süreci olarak ele alınmaktadır.',
    4,
    4
  ),
  (
    'f3000003-0000-4000-f300-000000000003',
    'inference',
    'Tanzimat aydınlarının Fransız Devrimi değerlerini aktarmaya çalışmasından aşağıdaki sonuçlardan hangisi çıkarılabilir?',
    '["Osmanlı''yı Fransız sömürgesi haline getirmek istediler","Edebiyatı Batı''yı taklit etmek için kullandılar","Özgürlük ve eşitlik değerlerini Osmanlı toplumuna taşımayı hedeflediler","Divan edebiyatını tümüyle reddettiler"]'::jsonb,
    2,
    'Metinde Tanzimat aydınlarının özgürlük, eşitlik ve adalet gibi Fransız Devrimi değerlerini Osmanlı toplumuna aktarmayı hedeflediği ifade edilmektedir.',
    4,
    5
  );

  -- ============================================================
  -- TEXT 4: Namık Kemal: Vatan, Hürriyet ve Roman
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000004-0000-4000-f300-000000000004',
    'Namık Kemal: Vatan, Hürriyet ve Roman',
    'AYT Edebiyat',
    'AYT',
    4,
    447,
    3,
    $b$Namık Kemal, Tanzimat döneminin en etkili ve en çok okunan yazarlarından biridir. 1840 yılında Tekirdağ''da doğan Kemal, kısa ama yoğun bir hayat sürmüş ve 1888''de Sakız''da hayatını kaybetmiştir. Edebiyat tarihi açısından bakıldığında, Namık Kemal hem divan şiirinin etkisinden kurtulmaya çalışan modern bir şair, hem de Türk edebiyatında roman ve tiyatronun gelişimine önemli katkılar sunan çok yönlü bir edebiyatçıdır. Onun kaleminden çıkan eserler, sanatsal değerinin ötesinde güçlü bir siyasi mesaj taşımaktadır.

Namık Kemal''in edebiyatında vatan ve hürriyet temaları merkezi bir yer tutar. Batı''da sürgündeyken Fransız edebiyatıyla ve özellikle Victor Hugo''nun romantizmiyle yakından tanışan Kemal, bu etkiyi kendi toplumsal gerçekliğiyle sentezlemiştir. Vatan Şarkısı başta olmak üzere pek çok şiirinde toprak, bağımsızlık ve milletin onuru kavramları işlenmiştir. Bu şiirler, döneminin okuyucularında derin bir duygusal etki uyandırmış ve vatanseverlik bilincinin gelişmesine katkı sağlamıştır. Kemal''in coşkulu üslubu ve yüksek hitabet gücü onu bir toplum önderi konumuna taşımıştır.

Tiyatro alanında da önemli eserler veren Namık Kemal''in Vatan Yahut Silistre adlı oyunu büyük yankı uyandırmıştır. 1873''te İstanbul''da sahnelenen bu oyun, seyircilerde derin bir vatan sevgisi ve bağımsızlık bilinci uyandırmış; ancak gösteri büyük bir kalabalık tarafından siyasi bir miting haline dönüştürülmüştür. Bunun üzerine Namık Kemal, dönemin iktidarı tarafından Kıbrıs''a sürgün edilmiştir. Bu olay, tiyatronun dönemin siyasi ortamındaki etkisini açıkça ortaya koymaktadır.

Roman alanındaki eserleriyle de dikkat çeken Namık Kemal, İntibah adlı romanında toplumsal ahlak ve bireyin yanlış seçimleri üzerine kurulu bir anlatı kaleme almıştır. Bu eser, Türk romanının modernleşme sürecinde önemli bir basamak olarak değerlendirilmektedir. Cezmi adlı tarihi roman ise idealize edilmiş kahraman tipi ve vatan sevgisi temasıyla öne çıkmaktadır. Her iki romanda da Batılı roman tekniklerini özümsemeye çalışan ancak zaman zaman geleneksel anlatı kalıplarına geri dönen karma bir yapı gözlemlenir.

Namık Kemal''in dil anlayışı da dönemin tartışmaları içinde önemli bir yer tutmaktadır. Sade ve anlaşılır bir Türkçeyi savunan Kemal, edebiyatın toplumun her kesimine hitap etmesi gerektiğine inanıyordu. Bu doğrultuda gazete yazılarında ve edebiyat eleştirilerinde açık, net ve erişilebilir bir dil kullanmıştır. Onun bu tutumu, Türk nesrinin gelişmesine ve modern bir Türkçe yazı diline doğru atılan adımlara önemli katkılar sağlamıştır.$b$,
    ARRAY['Namık Kemal','Tanzimat','vatan hürriyet','roman tiyatro'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000004-0000-4000-f300-000000000004',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Tanzimat Fermanı''nın içeriği","Namık Kemal''in vatan, hürriyet ve roman anlayışı","Fransız romantizminin Türk edebiyatına etkisi","Victor Hugo ile Namık Kemal''in ilişkisi"]'::jsonb,
    1,
    'Metin, Namık Kemal''in edebiyatındaki vatan, hürriyet temalarını ve roman anlayışını ele almaktadır.',
    4,
    1
  ),
  (
    'f3000004-0000-4000-f300-000000000004',
    'detail',
    'Metne göre Vatan Yahut Silistre adlı oyunun sahnelenmesinin sonucu ne olmuştur?',
    '["Namık Kemal''e devlet ödülü verilmiştir","Oyun kapatılmış ve metin yakılmıştır","Namık Kemal Kıbrıs''a sürgün edilmiştir","Oyun Fransızca''ya çevrilmiştir"]'::jsonb,
    2,
    'Metinde oyunun büyük bir kalabalık tarafından siyasi mitinge dönüştürülmesi üzerine Namık Kemal''in Kıbrıs''a sürgün edildiği belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000004-0000-4000-f300-000000000004',
    'detail',
    'Namık Kemal''in İntibah romanının konusu metne göre nedir?',
    '["Osmanlı-Rus savaşını anlatan bir tarihi roman","Toplumsal ahlak ve bireyin yanlış seçimleri","Vatan sevgisi ve bağımsızlık mücadelesi","Osmanlı saray yaşamından kesitler"]'::jsonb,
    1,
    'Metinde İntibah''ın toplumsal ahlak ve bireyin yanlış seçimleri üzerine kurulu bir anlatı olduğu belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000004-0000-4000-f300-000000000004',
    'vocabulary',
    'Metinde "hitabet gücü" ifadesi hangi anlamda kullanılmıştır?',
    '["Yazı yazmadaki ustalık","Dinleyicileri etkileme ve ikna etme yeteneği","Şiir yazma becerisi","Yabancı dil bilgisi"]'::jsonb,
    1,
    'Hitabet, söz ve konuşmayla insanları etkileme ve ikna etme sanatıdır; metinde de bu anlamda kullanılmıştır.',
    4,
    4
  ),
  (
    'f3000004-0000-4000-f300-000000000004',
    'inference',
    'Namık Kemal''in dil anlayışına ilişkin metinden çıkarılabilecek en doğru yargı hangisidir?',
    '["Ağır Osmanlıca kullanmayı tercih etmiştir","Edebiyatın toplumun her kesimine ulaşması için sade dil savunucusu olmuştur","Yabancı kelimeleri Türkçeye kazandırmaya çalışmıştır","Dil konusunda herhangi bir görüş belirtmemiştir"]'::jsonb,
    1,
    'Metinde Namık Kemal''in sade ve anlaşılır bir Türkçeyi savunduğu ve edebiyatın toplumun her kesimine hitap etmesi gerektiğine inandığı ifade edilmektedir.',
    4,
    5
  );


  -- ============================================================
  -- TEXT 5: Servet-i Fünun Edebiyatının Estetik Anlayışı
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000005-0000-4000-f300-000000000005',
    'Servet-i Fünun Edebiyatının Estetik Anlayışı',
    'AYT Edebiyat',
    'AYT',
    4,
    452,
    3,
    $b$Servet-i Fünun edebiyatı, 1896 yılında Tevfik Fikret''in Servet-i Fünun dergisinin edebi sorumluluğunu üstlenmesiyle başlayan ve 1901''deki Hüseyin Cahit Yalçın''ın Edebiyat ve Hukuk adlı makalesinin kapatılmasına yol açmasına kadar süren yoğun ve verimli bir dönemin adıdır. Bu dönem, özellikle 1896-1901 yılları arasını kapsamakla birlikte derginin etrafında toplanan sanatçıların Tanzimat''tan belirgin biçimde ayrışan yeni bir estetik anlayış geliştirdiği bir süreç olarak değerlendirilir.

Servet-i Fünun edebiyatının temel estetik anlayışı "sanat için sanat" ilkesine dayanmaktadır. Tanzimat''ın toplumcu sanat anlayışından uzaklaşan bu dönem sanatçıları, edebiyatı bir toplum aracı olarak değil; güzelliğin, estetiğin ve bireyin iç dünyasının ifadesi olarak benimsemiştir. Bu yaklaşım, Fransız sembolizmi ve Parnasizm akımlarından beslenmiştir. Özellikle Verlaine, Baudelaire ve Sully Prudhomme gibi Fransız şairleri bu dönem Türk şairlerinin başlıca ilham kaynaklarıdır.

Servet-i Fünun şiiri, biçim ve dil açısından büyük yenilikler getirmiştir. Beyit bütünlüğü yerine anlam bütünlüğü esas alınmış; şiir, beyitten beyite devam eden bir anlam akışı içinde ele alınmıştır. Bu tekniğe "anjambman" adı verilir. Aruz vezninin Türkçenin fonetik yapısına uygulama konusunda da yeni denemeler yapılmıştır. Dil bakımından ise son derece ağır bir Osmanlıca kullanılmış; Arapça ve Farsça tamlamalar, gündelik konuşma dilinden kopuk bir şiir dili oluşturmuştur. Bu tercih, eleştirmenlerce dilin halktan uzaklaştırılması olarak değerlendirilmiştir.

Dönemin öne çıkan temalarına bakıldığında karamsarlık, hayal kırıklığı, sürgün özlemi ve kaçış arzusu dikkat çekmektedir. Sultan II. Abdülhamit''in istibdat döneminde siyasi baskılar altında yaşayan bu sanatçılar, toplumdan ve gerçeklikten kaçışı şiirde estetize etmişlerdir. "Sefalet" ve "bunaltı" yalnızca yaşanan duyguların adları değil, estetize edilen sanatsal içerikler haline gelmiştir. Bu bakımdan dönemin şiiri, bireyin bunalımını ve toplumsal çözülme kaygısını yoğun imgelerle işlemektedir.

Nesir alanında ise Halit Ziya Uşaklıgil ve Mehmet Rauf''un romanları öne çıkar. Bu romanlarda psikolojik çözümleme ön plana alınmış, karakterlerin iç dünyaları ayrıntılı biçimde işlenmiştir. Servet-i Fünun dönemi, Türk edebiyatında psikolojik romanın temelini atmış ve sonraki dönem yazarlarına güçlü bir miras bırakmıştır. Dönemin kapatılmasıyla birlikte sanatçılar dağılmış olsa da bu dönemde geliştirilen estetik anlayış ve biçim denemeleri Türk edebiyatının seyrini kalıcı olarak etkilemiştir.$b$,
    ARRAY['Servet-i Fünun','estetik anlayış','sanat için sanat','AYT Edebiyat'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000005-0000-4000-f300-000000000005',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Tevfik Fikret''in şiir anlayışı","Servet-i Fünun edebiyatının estetik anlayışı ve özellikleri","Fransız sembolizminin genel özellikleri","Türk nesrinin tarihsel gelişimi"]'::jsonb,
    1,
    'Metin, Servet-i Fünun edebiyatının estetik anlayışını, biçim özelliklerini ve dönemin ruhunu ele almaktadır.',
    4,
    1
  ),
  (
    'f3000005-0000-4000-f300-000000000005',
    'detail',
    'Metne göre "anjambman" tekniği nedir?',
    '["Şiirde farklı dillerin bir arada kullanılması","Beyitten beyite devam eden anlam akışı","Aruz yerine hece vezninin kullanılması","Şiirin düz yazı biçiminde yazılması"]'::jsonb,
    1,
    'Metinde anjambman, beyit bütünlüğü yerine anlam bütünlüğünü esas alan ve anlam akışının beyitten beyite devam etmesi olarak tanımlanmaktadır.',
    4,
    2
  ),
  (
    'f3000005-0000-4000-f300-000000000005',
    'detail',
    'Servet-i Fünun şairlerinin Tanzimat''tan en belirgin ayrılığı metne göre nedir?',
    '["Aruz yerine hece vezni kullanmaları","Edebiyatı toplum aracı değil estetik ifade alanı olarak görmeleri","Yabancı dil öğrenmelerini reddetmeleri","Siyasi konulara daha çok yer vermeleri"]'::jsonb,
    1,
    'Metinde Servet-i Fünun sanatçılarının Tanzimat''ın toplumcu sanat anlayışından uzaklaşarak "sanat için sanat" ilkesini benimsediği belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000005-0000-4000-f300-000000000005',
    'vocabulary',
    'Metinde "istibdat" kelimesi hangi anlamda kullanılmıştır?',
    '["Özgürlükçü yönetim","Baskıcı ve keyfi yönetim","Anayasal monarşi","Demokratik seçim sistemi"]'::jsonb,
    1,
    'İstibdat, baskıcı ve keyfi yönetim anlamına gelmektedir; metinde Sultan II. Abdülhamit''in dönemini nitelemek için kullanılmıştır.',
    4,
    4
  ),
  (
    'f3000005-0000-4000-f300-000000000005',
    'inference',
    'Dönemin sanatçılarının karamsarlık ve kaçış temalarını işlemesini, metinden hareketle nasıl açıklamak en doğrudur?',
    '["Kişisel başarısızlıklarından kaynaklanan hayal kırıklığı","Siyasi baskı ortamının yaratığı bunaltının sanata yansıması","Fransız edebiyatını körü körüne taklit etmeleri","Roman yazmayı şiire tercih etmeleri"]'::jsonb,
    1,
    'Metinde II. Abdülhamit''in istibdat döneminde siyasi baskı altında yaşayan sanatçıların toplumdan ve gerçeklikten kaçışı estetize ettikleri ifade edilmektedir.',
    4,
    5
  );

  -- ============================================================
  -- TEXT 6: Halit Ziya Uşaklıgil ve Türk Romanının Modernleşmesi
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000006-0000-4000-f300-000000000006',
    'Halit Ziya Uşaklıgil ve Türk Romanının Modernleşmesi',
    'AYT Edebiyat',
    'AYT',
    4,
    449,
    3,
    $b$Halit Ziya Uşaklıgil, Türk edebiyatının modernleşme sürecinde en kritik isimlerden biri olarak kabul edilmektedir. 1866 yılında İzmir''de doğan Halit Ziya, Servet-i Fünun döneminin en güçlü roman ve hikaye yazarı sıfatını kazanmıştır. Batılı anlamda ilk gerçek Türk romanlarını kaleme alan yazar, özellikle Mai ve Siyah ile Aşk-ı Memnu adlı eserleriyle Türk roman sanatına yeni bir boyut kazandırmıştır. Bu eserler yalnızca kendi dönemlerinde değil, günümüzde de Türk edebiyatının başyapıtları arasında sayılmaktadır.

Mai ve Siyah, gençlik hayalleri ile gerçeklik arasındaki çatışmayı konu alan otobiyografik izler taşıyan bir romandır. Ahmet Cemil adlı idealist genç şair, edebiyat dünyasına duyduğu yüksek tutkularla başlar; ancak hayatın ağır gerçeklikleri karşısında giderek hayal kırıklığına uğrar. Bu anlatı, Servet-i Fünun kuşağının ortak ruhsal durumunu da yansıtmakta; yenilgi duygusu ve bunalım temayı derinleştirmektedir. Roman, psikolojik karakter tahlilinin Türk edebiyatındaki ilk olgun örneklerinden birini sunar.

Aşk-ı Memnu ise Türk romanının psikolojik realizm açısından ulaştığı en yüksek noktalardan birini temsil etmektedir. Ağırlıklı olarak yasak aşkı, aldatmayı ve toplumsal ahlak anlayışını inceleyen roman, birbirinden karmaşık ve derinlikli karakterlerle örülüdür. Bihter, Adnan Bey ve Behlül üçgeni üzerine kurulan anlatı, karakterlerin iç çatışmalarını ve bilinçdışı dürtülerini olağanüstü bir incelikle aktarmaktadır. Roman, Türkçeye özgü bir üslup zenginliği ve diyalog kurma biçimi açısından da son derece önemli bir dönüm noktasıdır.

Halit Ziya''nın roman anlayışı, Fransız realist ve natüralist yazarların etkisini yansıtır. Gustave Flaubert ve Emile Zola''dan ilham alan Halit Ziya, gözleme dayalı, psikolojik derinliği ön planda tutan ve toplumsal gerçekliği nesnel bir biçimde aktaran bir roman estetiği benimsemiştir. Kahramanların psikolojik durumlarını aktarmak için iç monolog ve serbest dolaylı anlatım gibi modern tekniklere başvurması, onu döneminin diğer yazarlarından belirgin biçimde ayırır.

Halit Ziya aynı zamanda kendisinden sonraki kuşaklara da ilham veren bir edebiyat ustasıdır. Türk edebiyatında psikolojik roman geleneğinin kurucusu sayılan Halit Ziya''nın anlatı tekniği, Halide Edip Adıvar, Yakup Kadri Karaosmanoğlu ve Peyami Safa gibi Cumhuriyet dönemi yazarlarını derinden etkilemiştir. Türk roman sanatının modernleşmesinde oynadığı rol, onu edebiyat tarihimizin en önemli mihenk taşlarından biri yapmaktadır.$b$,
    ARRAY['Halit Ziya','Aşk-ı Memnu','Türk romanı','modernleşme'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000006-0000-4000-f300-000000000006',
    'main_idea',
    'Bu metnin odak noktası aşağıdakilerden hangisidir?',
    '["Servet-i Fünun dergisinin tarihi","Halit Ziya''nın Türk romanının modernleşmesine katkıları","Fransız realizmi ile Türk edebiyatının karşılaştırılması","Aşk-ı Memnu''nun konu özeti"]'::jsonb,
    1,
    'Metin, Halit Ziya Uşaklıgil''in eserleri ve Türk romanının modernleşmesine katkılarını ele almaktadır.',
    4,
    1
  ),
  (
    'f3000006-0000-4000-f300-000000000006',
    'detail',
    'Metne göre Mai ve Siyah romanının ana çatışması nedir?',
    '["Doğu ile Batı medeniyetleri arasındaki çatışma","Gençlik hayalleri ile gerçeklik arasındaki çatışma","Zengin ile fakir arasındaki sınıf çatışması","Osmanlı ile Batılı değerler arasındaki gerilim"]'::jsonb,
    1,
    'Metinde Mai ve Siyah''ın gençlik hayalleri ile gerçeklik arasındaki çatışmayı konu aldığı belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000006-0000-4000-f300-000000000006',
    'detail',
    'Halit Ziya''nın roman anlayışı metne göre hangi yazarlardan etkilenmiştir?',
    '["Victor Hugo ve Emile Zola","Gustave Flaubert ve Emile Zola","Baudelaire ve Verlaine","Balzac ve Stendhal"]'::jsonb,
    1,
    'Metinde Halit Ziya''nın Gustave Flaubert ve Emile Zola''dan ilham aldığı belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000006-0000-4000-f300-000000000006',
    'vocabulary',
    'Metinde "otobiyografik izler taşıyan" ifadesi nasıl anlaşılmalıdır?',
    '["Yalnızca hayali olayları anlatan","Yazarın kendi hayatından izler barındıran","Tarihi olaylara dayanan","Başka bir yazarın eserinden alıntı yapılan"]'::jsonb,
    1,
    'Otobiyografik, yazarın kendi yaşamıyla ilgili demektir; bu ifade romanın yazarın kendi deneyimlerinden izler taşıdığını belirtmektedir.',
    4,
    4
  ),
  (
    'f3000006-0000-4000-f300-000000000006',
    'inference',
    'Halit Ziya''nın etkilediği yazarlardan hareketle aşağıdaki çıkarımlardan hangisi yapılabilir?',
    '["Halit Ziya yalnızca kendi döneminin yazarlarıyla ilgilenmiştir","Halit Ziya''nın etkisi Cumhuriyet dönemine kadar uzanmıştır","Cumhuriyet dönemi yazarları Halit Ziya''yı eleştirmiştir","Psikolojik roman Türkiye''de Cumhuriyet''le başlamıştır"]'::jsonb,
    1,
    'Metinde Halide Edip, Yakup Kadri ve Peyami Safa gibi Cumhuriyet dönemi yazarlarının Halit Ziya''dan derinden etkilendiği ifade edilmektedir.',
    4,
    5
  );


  -- ============================================================
  -- TEXT 7: Fecr-i Ati'den Milli Edebiyat'a Geçiş
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000007-0000-4000-f300-000000000007',
    'Fecr-i Ati''den Milli Edebiyat''a Geçiş',
    'AYT Edebiyat',
    'AYT',
    4,
    446,
    3,
    $b$Fecr-i Ati topluluğu, 1909 yılında bir araya gelen ve Servet-i Fünun''un dağılmasının ardından oluşan bir edebiyat grubudur. "Geleceğin Şafağı" anlamına gelen bu isim, topluluğun modernleşme ve yenilik yolundaki iştiyakını yansıtmaktadır. Topluluk, yayımladığı bildiriyle Türk edebiyatının sanatta bağımsızlık ve bireyci estetik anlayış çerçevesinde yeniden şekillenmesini savunmuştur. Ancak bu topluluk, kısa ömürlü olmuş ve üyelerinin büyük çoğunluğu zamanla Milli Edebiyat hareketine katılmıştır.

Fecr-i Ati''nin en önemli özelliği, Servet-i Fünun''un ağır dilini ve bireye kapalı estetiğini sürdürme eğilimi taşımasıdır. Ahmet Haşim ve Yahya Kemal Beyatlı bu topluluktan yetişmiş olmakla birlikte zamanla farklı yönlere evrilmiştir. Ahmet Haşim, sembolist şiir anlayışını özgün biçimde sürdürürken Yahya Kemal neo-klasik bir yönelime girmiştir. Bu iki isim, Fecr-i Ati''nin en kalıcı mirasını oluşturur ve birbirinden farklı iki estetik yolun öncüleri olarak kabul edilir.

Milli Edebiyat hareketi ise 1911 yılında Selanik''te yayın hayatına başlayan Genç Kalemler dergisiyle güçlü bir zemin bulmuştur. Ömer Seyfettin, Ali Canip Yöntem ve Ziya Gökalp''in öncülük ettiği bu hareket, edebiyatın ulusal bir ruh taşıması, halkın anlayabileceği sade bir Türkçeyle yazılması ve Anadolu gerçekliğini yansıtması gerektiğini savunmuştur. Edebiyatın estetik değeri kadar ulusal kimliği inşa etme işlevi de bu harekette ön plana çıkmıştır.

Milli Edebiyat''ın dil anlayışı, önceki dönemlerden keskin bir kopuşu temsil etmektedir. Ağır Osmanlıca yerine İstanbul Türkçesi esas alınmış; Arapça ve Farsça sözcük ve tamlamalar mümkün olduğunca terk edilmiştir. Bu yaklaşım, daha geniş bir okuyucu kitlesine ulaşma amacını taşımanın yanı sıra Türkçeyi ulusal birliğin temel taşı olarak öne çıkarma kaygısını da barındırmaktadır. Hece vezni, aruz yerine tercih edilmeye başlanmış ve bu tercih sonraki dönemlerde daha da yaygınlaşmıştır.

Konular açısından Milli Edebiyat, Anadolu insanını ve toprağını, milli tarihi ve toplumsal değerleri işlemiştir. Ömer Seyfettin''in hikayeleri, Türk kültürel kimliğinin en özlü ifadelerini sunarken Halide Edip Adıvar''ın romanları ulusal kurtuluş mücadelesini edebiyata taşımıştır. Yakup Kadri Karaosmanoğlu ise hem Milli Edebiyat hem de Cumhuriyet dönemine uzanan köprü yazarlar arasında yer alır. Bu geçiş dönemi, Türk edebiyatının modernleşme sürecinde birbirini izleyen köklü dönüşümlerin en kritik halkasını oluşturmaktadır.$b$,
    ARRAY['Fecr-i Ati','Milli Edebiyat','Ömer Seyfettin','dil hareketi'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000007-0000-4000-f300-000000000007',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Ömer Seyfettin''in hikayeciliği","Fecr-i Ati topluluğundan Milli Edebiyat hareketine geçiş süreci","Ziya Gökalp''in sosyolojik görüşleri","Hece ve aruz vezninin karşılaştırılması"]'::jsonb,
    1,
    'Metin, Fecr-i Ati''den Milli Edebiyat''a geçiş sürecini ve bu dönemin özelliklerini ele almaktadır.',
    4,
    1
  ),
  (
    'f3000007-0000-4000-f300-000000000007',
    'detail',
    'Metne göre Milli Edebiyat hareketi hangi yayın organıyla güçlü bir zemin bulmuştur?',
    '["Servet-i Fünun dergisi","Genç Kalemler dergisi","Türk Yurdu dergisi","Fecr-i Ati bildirisi"]'::jsonb,
    1,
    'Metinde Milli Edebiyat hareketinin 1911''de Selanik''te yayın hayatına başlayan Genç Kalemler dergisiyle güçlü bir zemin bulduğu belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000007-0000-4000-f300-000000000007',
    'detail',
    'Milli Edebiyat''ın dil anlayışı açısından önceki dönemlerden en belirgin farkı nedir?',
    '["Osmanlıca kullanımı artırmak","Fransızca sözcükleri Türkçeye aktarmak","Ağır Osmanlıca yerine İstanbul Türkçesini esas almak","Arapça ve Farsça grameri benimsemek"]'::jsonb,
    2,
    'Metinde Milli Edebiyat''ta ağır Osmanlıca yerine İstanbul Türkçesinin esas alındığı belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000007-0000-4000-f300-000000000007',
    'vocabulary',
    'Metinde "iştiyak" kelimesi hangi anlamda kullanılmıştır?',
    '["Korku ve endişe","Kararlılık ve inat","Heves ve şiddetli istek","Bıkkınlık ve yorgunluk"]'::jsonb,
    2,
    'İştiyak, şiddetli istek ve heves anlamına gelmektedir; metinde Fecr-i Ati''nin yenilik isteğini nitelemek için kullanılmıştır.',
    4,
    4
  ),
  (
    'f3000007-0000-4000-f300-000000000007',
    'inference',
    'Fecr-i Ati üyelerinin büyük çoğunluğunun Milli Edebiyat''a katılmasından hareketle aşağıdakilerden hangisi çıkarılabilir?',
    '["Fecr-i Ati estetik açıdan başarılı olmuştur","Fecr-i Ati''nin bireyci estetiği toplumsal ihtiyaçlarla örtüşememiştir","Milli Edebiyat hareketi Fecr-i Ati''yi siyasi olarak bastırmıştır","Her iki hareket de aynı ilkeleri paylaşmaktaydı"]'::jsonb,
    1,
    'Fecr-i Ati''nin kısa ömürlü olması ve üyelerin Milli Edebiyat''a geçmesi, topluluğun bireyci estetiğinin dönemin toplumsal ihtiyaçlarıyla örtüşmediğine işaret eder.',
    4,
    5
  );

  -- ============================================================
  -- TEXT 8: Mehmet Akif Ersoy'un Şiir Dünyası
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000008-0000-4000-f300-000000000008',
    'Mehmet Akif Ersoy''un Şiir Dünyası',
    'AYT Edebiyat',
    'AYT',
    4,
    451,
    3,
    $b$Mehmet Akif Ersoy, Türk edebiyat tarihinin en özgün ve en etkili şairlerinden biridir. 1873''te İstanbul''da doğan Akif, hem bir din bilgini hem de güçlü bir toplum önderi olarak şiir dünyasına damgasını vurmuştur. Yedi bölümden oluşan Safahat adlı eseri, şairin tüm şiirsel birikimini içermekte ve Türk şiiri tarihinde benzersiz bir yer tutmaktadır. Akif''in şiiri, hem içerik hem de biçim açısından kendinden önceki ve sonraki dönemlerden belirgin biçimde ayrışmaktadır.

Akif''in şiir anlayışının temel özelliği gerçekçiliktir. Divan edebiyatının soyut imgelemine ve Servet-i Fünun''un bireysel bunaltısına karşı çıkan Akif, şiirini doğrudan toplumsal gözleme ve gündelik hayatın gerçekliğine dayandırmıştır. İstanbul''un yoksul mahallelerini, camii avlularını ve halk arasında geçen sohbetleri canlı tablolar halinde şiirleştiren Akif, Türk şiirinde toplumsal realizmin öncüsü olarak kabul edilmektedir. Bu yaklaşım, onun şiirini bir belge değeri taşıyacak ölçüde döneminin sosyal koşullarını yansıtmaktadır.

Aruz veznini kullanan Akif, bu vezni son derece ustaca bir şekilde Türkçeye uyarlamıştır. Konuşma dilinin doğal akışını aruz kalıplarına sıkıştırma konusundaki başarısı, eleştirmenler tarafından övgüyle karşılanmıştır. Diyalog biçiminde yazılmış şiirleri, farklı toplum kesimlerinden seslerin şiire taşınmasına olanak tanımıştır. Bu teknik, şiiri yalnızca seçkin bir zümreye değil, daha geniş bir okuyucu kitlesine hitap eden bir araca dönüştürmüştür.

Din, İslam birliği ve vatanseverlik Akif''in şiirinin temel temaları arasındadır. Birinci Dünya Savaşı ve Kurtuluş Savaşı''nın ağır koşullarında kaleme aldığı şiirler, büyük bir milli duyarlılık ve direniş ruhu taşımaktadır. İstiklal Marşı, Türkiye Büyük Millet Meclisi''nin ilanının hemen ardından 1921''de yazılmış ve resmi marş olarak kabul edilmiştir. Bu eser, onun şiirinin hem estetik değerini hem de ulusal öneme erişme gücünü en belgin biçimde ortaya koymaktadır.

Akif, Safahat''ının farklı bölümlerinde çeşitli anlatı ve söylem biçimlerini bir arada kullanmıştır. Sözgelimi Asım bölümü, nesillerin gözünden toplumsal çöküşü ve kurtuluşu irdeleyen uzun bir şiirsel tartışmayı içermektedir. Berlin Hatıraları''nda ise yurt dışı gözlemlerini ve Batı medeniyetine ilişkin değerlendirmelerini paylaşmıştır. Tüm bu özellikler, Mehmet Akif Ersoy''u yalnızca bir şair olarak değil, aynı zamanda bir toplum düşünürü ve milli dava adamı olarak konumlandırmaktadır.$b$,
    ARRAY['Mehmet Akif Ersoy','Safahat','İstiklal Marşı','toplumsal gerçekçilik'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000008-0000-4000-f300-000000000008',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["İstiklal Marşı''nın yazılış hikayesi","Mehmet Akif Ersoy''un şiir dünyasının özellikleri","Safahat''taki dini temalar","Kurtuluş Savaşı''nın edebiyata yansıması"]'::jsonb,
    1,
    'Metin, Mehmet Akif Ersoy''un şiir anlayışını, temalarını ve edebiyattaki yerini kapsamlı biçimde ele almaktadır.',
    4,
    1
  ),
  (
    'f3000008-0000-4000-f300-000000000008',
    'detail',
    'Metne göre Mehmet Akif''in şiirde toplumsal realizmin öncüsü sayılmasının nedeni nedir?',
    '["Divan edebiyatının geleneklerini sürdürmesi","Şiirini doğrudan toplumsal gözleme ve gündelik hayata dayandırması","Aruz yerine hece veznini kullanması","Yalnızca dini konuları işlemesi"]'::jsonb,
    1,
    'Metinde Akif''in İstanbul''un yoksul mahallelerini ve gündelik hayatı canlı tablolar halinde şiirleştirmesiyle toplumsal realizmin öncüsü olduğu belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000008-0000-4000-f300-000000000008',
    'detail',
    'İstiklal Marşı''nın yazıldığı yıl metne göre hangisidir?',
    '["1918","1919","1920","1921"]'::jsonb,
    3,
    'Metinde İstiklal Marşı''nın 1921''de yazıldığı ve resmi marş olarak kabul edildiği belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000008-0000-4000-f300-000000000008',
    'vocabulary',
    'Metinde "duyarlılık" kelimesinin bu bağlamdaki anlamı hangisidir?',
    '["Fiziksel hassasiyet","Bir konuya gösterilen ilgi ve farkındalık","Aşırı duygusallık","Sanatsal yaratıcılık"]'::jsonb,
    1,
    'Duyarlılık, bir konuya gösterilen ilgi, farkındalık ve hassasiyet anlamına gelir; metinde milli duyarlılık, vatana duyulan hassasiyet anlamında kullanılmıştır.',
    4,
    4
  ),
  (
    'f3000008-0000-4000-f300-000000000008',
    'inference',
    'Akif''in şiirinde diyalog biçimini kullanmasından hareketle aşağıdakilerden hangisi çıkarılabilir?',
    '["Şiiri yalnızca seçkin bir zümreye hitap ettirmiştir","Farklı toplum kesimlerinden sesleri şiirleştirerek geniş bir okuyucu kitlesine ulaşmayı hedeflemiştir","Batı edebiyatındaki dram geleneğini taklit etmiştir","Diyalog tekniğini uyaktan kaçmak için kullanmıştır"]'::jsonb,
    1,
    'Metinde Akif''in diyalog tekniğiyle şiiri yalnızca seçkin bir zümreye değil daha geniş bir kitleye hitap eden bir araca dönüştürdüğü ifade edilmektedir.',
    4,
    5
  );


  -- ============================================================
  -- TEXT 9: Cumhuriyet Dönemi Türk Şiirinin Değişimi
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000009-0000-4000-f300-000000000009',
    'Cumhuriyet Dönemi Türk Şiirinin Değişimi',
    'AYT Edebiyat',
    'AYT',
    4,
    447,
    3,
    $b$Cumhuriyet''in ilanıyla birlikte 1923''ten itibaren Türk şiiri köklü bir dönüşüm sürecine girmiştir. Yeni devletin ideolojik ve kültürel programı, edebiyat üzerinde belirleyici etkiler bırakmış; özellikle dil reformu ve harf inkılabı, edebiyatın hem biçimini hem de hitap ettiği kitleyi köklü biçimde değiştirmiştir. Bu dönemde şiir, ulusal kimliği pekiştirme, yeni değerleri yayma ve geniş halk kitlelerine ulaşma işlevi üstlenmiştir.

Cumhuriyet dönemi şiirinin ilk evresi, Milli Edebiyat''ın devamı niteliğindedir. Beş Hececiler olarak bilinen Faruk Nafiz Çamlıbel, Enis Behiç Koryürek, Orhan Seyfi Orhon, Yusuf Ziya Ortaç ve Halit Fahri Ozansoy, bu dönemin öne çıkan isimleri arasındadır. Hece veznini kullanan bu şairler, Anadolu coğrafyasını ve halk kültürünü şiirleştirmiş; ancak zamanla üsluplarının yalın duygusallık içinde kaldığı yönünde eleştiriler almışlardır.

1940''lı yıllardan itibaren Türk şiirinde iki büyük dallanma belirginleşmiştir. Bunların ilki, serbest şiiri ve toplumcu içeriği savunan Garip hareketidir. Orhan Veli Kanık, Melih Cevdet Anday ve Oktay Rifat''ın öncülük ettiği bu hareket, gündelik hayatı ve sıradan insanı şiirin merkezine almış; aruzu ve heceyi terk ederek vezinsiz, kafiyesiz ve yüksek dil değerlerinden arınmış bir şiir anlayışı benimsemiştir. Bu yaklaşım, döneminin okuyucusu üzerinde büyük bir şaşkınlık ve heyecan yaratmıştır.

Öte yandan İkinci Yeni hareketi, 1950''li yıllarda Garip''e tepki olarak doğmuştur. Cemal Süreya, Turgut Uyar, Edip Cansever ve İlhan Berk gibi şairlerin temsil ettiği bu hareket, şiirde anlam kapalılığını, çarpıcı imgeciliği ve dilin sınırlarını zorlayan sözdizimini esas almıştır. İkinci Yeni şairleri, bireysel yabancılaşmayı, varoluşsal sorgulamayı ve dile içkin şiirselliği ön plana çıkarmışlardır. Bu hareket, hem savunucuları hem de eleştirmenleriyle Türk şiir tarihinin en tartışmalı dönemlerinden birini oluşturmaktadır.

Cumhuriyet dönemi şiiri, bu iki büyük hareketle sınırlı kalmamaktadır. Ahmet Hamdi Tanpınar, Cahit Sıtkı Tarancı ve Necip Fazıl Kısakürek gibi şairler, bu iki akım arasında özgün estetik çizgilerini koruyarak Türk şiirine kalıcı katkılar sunmuşlardır. Genel olarak değerlendirildiğinde, Cumhuriyet dönemi şiiri biçim ve içerik açısından büyük bir çeşitlilik sergilemekte; bu çeşitlilik, dönemin toplumsal ve siyasal dönüşümlerinin renkli bir yansıması olarak okunmaktadır.$b$,
    ARRAY['Cumhuriyet dönemi şiiri','Garip hareketi','İkinci Yeni','Beş Hececiler'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000009-0000-4000-f300-000000000009',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Orhan Veli''nin şiir tekniği","Cumhuriyet dönemi Türk şiirinin geçirdiği değişimler","Hece ve aruz vezninin karşılaştırılması","Garip hareketinin İkinci Yeni''ye etkisi"]'::jsonb,
    1,
    'Metin, Cumhuriyet dönemi Türk şiirinin geçirdiği dönüşümleri ve başlıca hareketleri ele almaktadır.',
    4,
    1
  ),
  (
    'f3000009-0000-4000-f300-000000000009',
    'detail',
    'Metne göre Garip hareketinin en belirgin özelliği aşağıdakilerden hangisidir?',
    '["Aruz veznini yenilemek","Serbest şiirle gündelik hayatı ve sıradan insanı merkeze almak","Tasavvufi temaları işlemek","Osmanlı şiir geleneğini sürdürmek"]'::jsonb,
    1,
    'Metinde Garip hareketinin gündelik hayatı ve sıradan insanı şiirin merkezine aldığı ve serbest şiiri benimsediği belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000009-0000-4000-f300-000000000009',
    'detail',
    'İkinci Yeni hareketi hangi hareketin tepkisi olarak doğmuştur?',
    '["Milli Edebiyat hareketi","Servet-i Fünun","Garip hareketi","Beş Hececiler"]'::jsonb,
    2,
    'Metinde İkinci Yeni''nin 1950''li yıllarda Garip''e tepki olarak doğduğu belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000009-0000-4000-f300-000000000009',
    'vocabulary',
    'Metinde "yabancılaşma" kavramı hangi bağlamda kullanılmıştır?',
    '["Başka bir ülkeye taşınmak","Bireyin toplumdan ve kendinden kopması","Dil öğrenememek","Geleneksel değerlere bağlı kalmak"]'::jsonb,
    1,
    'Yabancılaşma, bireyin toplumdan ve kendinden kopması anlamına gelir; İkinci Yeni şiirinde varoluşsal bir tema olarak kullanılmıştır.',
    4,
    4
  ),
  (
    'f3000009-0000-4000-f300-000000000009',
    'inference',
    'Beş Hececiler''in "yalın duygusallık" eleştirisi aldığından hareketle aşağıdakilerden hangisi çıkarılabilir?',
    '["Beş Hececiler hiç beğenilmemiştir","Hece veznini kullanan şairlerin şiirleri anlamsızdır","Sonraki şairler daha karmaşık ve derinlikli bir şiir anlayışı aradı","Hece vezni Cumhuriyet döneminde tamamen terk edilmiştir"]'::jsonb,
    2,
    'Yalın duygusallık eleştirisi, sonraki kuşakların daha derin ve çok katmanlı bir şiir dili arayışına girdiğini düşündürmektedir.',
    4,
    5
  );

  -- ============================================================
  -- TEXT 10: Yahya Kemal Beyatlı'nın Neo-Klasik Şiir Anlayışı
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000010-0000-4000-f300-000000000010',
    'Yahya Kemal Beyatlı''nın Neo-Klasik Şiir Anlayışı',
    'AYT Edebiyat',
    'AYT',
    4,
    449,
    3,
    $b$Yahya Kemal Beyatlı, Türk şiirinin en özgün ve en kalıcı seslerinden biri olarak edebiyat tarihimizdeki yerini sağlamlaştırmıştır. 1884''te Üsküp''te doğan ve 1958''de İstanbul''da hayata gözlerini yuman Beyatlı, Paris''te geçirdiği yılların kendisine kazandırdığı Fransız şiiri birikimini Türk ve Osmanlı şiiri geleneğiyle özgün bir sentez içinde buluşturmuştur. Bu sentez, onun şiirini "neo-klasik" olarak nitelendirilen özgün bir estetik çizgide konumlandırır.

Neo-klasizm, geçmişin klasik değerlerini çağdaş bir bakış açısıyla yeniden yorumlama ve güncelleştirme çabası olarak tanımlanabilir. Yahya Kemal''de bu yaklaşım, divan şiirinin biçimsel ve anlam zenginliğini özümseme, ancak bu birikimi modern bir duyarlılıkla yeniden üretme biçiminde tezahür eder. Aruz veznini titizlikle kullanan Beyatlı, bu vezni Türkçeye son derece akıcı ve doğal bir söyleyişle uyarlamıştır. Şiirlerinde Türkçenin ses değerlerini ön plana çıkarması, onu Ahmet Haşim''den belirgin biçimde ayırmaktadır.

Yahya Kemal''in şiirinin ana temaları arasında tarih, İstanbul, ölüm ve ebediyet öne çıkmaktadır. Osmanlı tarihine ve İstanbul''un güzelliklerine duyduğu derin bağlılık, şiirlerinde yoğun bir nostaljik atmosfer yaratmaktadır. Rindane Gazeller ve Ok şiiri bu temanın en çarpıcı örnekleri arasında sayılabilir. Ölüm temasını ise varoluşsal bir kaygıdan çok estetize edilmiş bir sona erme ve ebediyete kavuşma arzusu olarak işlemiştir. Bu yaklaşım, şiire derin bir lirizm ve hüzün katmaktadır.

Yahya Kemal''in dili, özenli seçilmiş sözcükler ve müzikal bir ritimle örülüdür. Şiirlerinde ses uyumuna ve ritme son derece önem veren Beyatlı, bir şiirini tamamlamak için yıllarca beklemiştir. Bu titizlik, onun şiir sayısını azaltmış; ancak her şiirinin neredeyse kusursuz bir bütünlük içinde olmasını sağlamıştır. "Kendi şiirimin sesini arıyorum" sözü onun poetikasının özünü yansıtmakta ve Türk şiirinin ses estetiğine katkısının kaynağını açıklamaktadır.

Yahya Kemal, şiiri yaşarken kitap olarak yayımlamamıştır. Kendi Gök Kubbemiz ve Eski Şiirin Rüzgarıyle adlı şiir kitapları ölümünün ardından yayıma hazırlanmıştır. Bu durum, hem şairin titizliğinin hem de eserlerine duyduğu mükemmeliyetçi tutumun bir yansımasıdır. Türk şiirinin biçim ve ses estetiğine getirdiği katkılar bakımından Yahya Kemal, çağdaşları ve sonraki kuşaklar üzerinde derin etkiler bırakan bir usta olarak Türk edebiyatındaki yerini korumaktadır.$b$,
    ARRAY['Yahya Kemal','neo-klasizm','İstanbul şiiri','aruz vezni'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000010-0000-4000-f300-000000000010',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Yahya Kemal''in Paris yılları","Yahya Kemal''in neo-klasik şiir anlayışının özellikleri","Osmanlı şiirinin Türk şiirine etkisi","Yahya Kemal ile Ahmet Haşim''in karşılaştırılması"]'::jsonb,
    1,
    'Metin, Yahya Kemal Beyatlı''nın neo-klasik şiir anlayışını ve bu anlayışın temel özelliklerini ele almaktadır.',
    4,
    1
  ),
  (
    'f3000010-0000-4000-f300-000000000010',
    'detail',
    'Yahya Kemal''in neo-klasik anlayışı metne göre nasıl tanımlanmaktadır?',
    '["Tamamen yeni bir şiir dili oluşturmak","Divan şiiri birikimini modern duyarlılıkla yeniden yorumlamak","Hece veznine geçerek gelenekten kopmak","Yalnızca Fransız şiirini taklit etmek"]'::jsonb,
    1,
    'Metinde neo-klasizm, divan şiirinin biçimsel ve anlam zenginliğini özümseyip modern bir duyarlılıkla yeniden üretmek olarak tanımlanmaktadır.',
    4,
    2
  ),
  (
    'f3000010-0000-4000-f300-000000000010',
    'detail',
    'Yahya Kemal''in şiir kitaplarının ölümünden sonra yayımlanmasının nedeni metne göre nedir?',
    '["Eserlerini kimseyle paylaşmak istememesi","Şiir yazmayı bırakmış olması","Titizliği ve mükemmeliyetçi tutumu","Kitapların kaybolması"]'::jsonb,
    2,
    'Metinde Yahya Kemal''in şiirlerini yayımlamamasının onun titizliğinin ve mükemmeliyetçi tutumunun yansıması olduğu belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000010-0000-4000-f300-000000000010',
    'vocabulary',
    'Metinde "nostaljik" kelimesinin bağlamdaki anlamı hangisidir?',
    '["Gelecek özlemi duyan","Geçmişe özlem duyan ve onu yücelten","Yalnızlıktan kaçan","Değişime karşı direnen"]'::jsonb,
    1,
    'Nostaljik, geçmişe özlem duymak ve onu yüceltmek anlamına gelir; Yahya Kemal''in Osmanlı tarihine ve İstanbul''a duyduğu özlemi nitelemektedir.',
    4,
    4
  ),
  (
    'f3000010-0000-4000-f300-000000000010',
    'inference',
    '"Kendi şiirimin sesini arıyorum" sözünden hareketle Yahya Kemal''in şiir anlayışı hakkında ne söylenebilir?',
    '["Başka şairlerin sesini taklit etmeyi hedeflemiştir","Özgün bir ses estetiği oluşturma kaygısı taşımıştır","Müzisyenler için şiir yazmıştır","Ses uyumunun önemsiz olduğuna inanmıştır"]'::jsonb,
    1,
    'Bu söz, Yahya Kemal''in başkalarının sesini değil kendine özgü bir ses estetiği oluşturmayı hedeflediğini göstermektedir.',
    4,
    5
  );


  -- ============================================================
  -- TEXT 11: Nazım Hikmet'in Toplumcu Şiir Anlayışı
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000011-0000-4000-f300-000000000011',
    'Nazım Hikmet''in Toplumcu Şiir Anlayışı',
    'AYT Edebiyat',
    'AYT',
    4,
    453,
    3,
    $b$Nazım Hikmet Ran, Türk şiirini hem biçim hem de içerik açısından köklü biçimde dönüştüren ve dünya ölçeğinde tanınan az sayıdaki Türk şairinden biridir. 1902''de Selanik''te doğan Nazım Hikmet, 1922''de Moskova''ya giderek Marksizm''le tanışmış ve bu ideoloji, onun sanat anlayışının temel çerçevesini belirlemiştir. Şiiri, yalnızca bireysel bir estetik ifade olarak değil; toplumsal dönüşümün, halk kitlelerini bilinçlendirmenin ve insanlığın kurtuluşunu savunmanın bir aracı olarak görmüştür.

Biçim açısından Nazım Hikmet, Türk şiirinde devrim niteliğinde yenilikler getirmiştir. Aruz veznini ve kalıplaşmış nazım biçimlerini reddederek serbest nazma yönelmiştir. Şiirinde görsel düzenleme, uzun ve kısa dizelerin ritmik karşıtlığı ve konuşma dilinin doğallığı dikkat çekici teknikler arasındadır. Mayakovski''nin şiirinden etkilenen Nazım Hikmet, biçimi içerikle organik bir bütünlük içinde kullanmıştır. Bu yaklaşım, şiiri bir mesaj iletme aracı olarak salt sözel bir düzlemde değil, görsel ve ritmik bir bütün olarak ele almaktadır.

Toplumcu gerçekçilik, Nazım Hikmet''in şiirinin ideolojik ve estetik temelini oluşturmaktadır. Emekçilerin, köylülerin ve ezilen sınıfların mücadelesini şiirleştiren Nazım Hikmet, bu temaları donuk sloganlarla değil; canlı imgeler, çarpıcı karakterler ve duygusal yoğunlukla işlemiştir. Taranta Babu''ya Mektuplar, Simavne Kadısı Oğlu Şeyh Bedreddin Destanı ve İnsan Manzaraları en önemli uzun şiirleri arasındadır. İnsan Manzaraları, binlerce dizelik epik boyutuyla bir Türk romancılığı panoraması sunar niteliktedir.

Nazım Hikmet''in hayatı, şiiri kadar dramatik bir seyir izlemiştir. Uzun yıllar Türkiye''de tutuklu kalan ve ardından vatandaşlıktan çıkarılan şair, sürgünde Moskova''da hayatını tamamlamıştır. Siyasi kimliği yüzünden uzun süre Türkiye''de yasaklı kalan eserleri, ancak 1960''lı yıllardan itibaren yeniden kamuoyuyla buluşabilmiştir. Bu durum, onun toplumsal ve kültürel mirasının değerlendirilmesini karmaşık kılmış; ancak şiirinin evrensel insancıl değerleri zamana meydan okumaya devam etmiştir.

Nazım Hikmet''in şiiri, Türkiye''de olduğu kadar dünyada da büyük yankı uyandırmıştır. Yirmiden fazla dile çevrilen şiirleri, özellikle En Güzel Deniz ve Saman Sarısı gibi lirik eserleri dünya şiir antolojilerine girmiştir. Yaşamak üzerine yazdığı dizelerin yoğun insancıl duyarlılığı, onu hem siyasi bir figür hem de evrensel bir şair olarak konumlandırmaktadır. Türk şiirinin uluslararası alanda en çok tanınan ve en çok okunan temsilcisi olmayı sürdürmektedir.$b$,
    ARRAY['Nazım Hikmet','toplumcu gerçekçilik','serbest nazım','İnsan Manzaraları'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000011-0000-4000-f300-000000000011',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Marksizm''in Türk edebiyatına etkisi","Nazım Hikmet''in toplumcu şiir anlayışı ve özellikleri","Rus edebiyatıyla Türk şiirinin ilişkisi","İnsan Manzaraları''nın konu özeti"]'::jsonb,
    1,
    'Metin, Nazım Hikmet''in toplumcu şiir anlayışını, biçim yeniliklerini ve edebiyat tarihindeki yerini ele almaktadır.',
    4,
    1
  ),
  (
    'f3000011-0000-4000-f300-000000000011',
    'detail',
    'Metne göre Nazım Hikmet''in biçim anlayışındaki temel yenilik nedir?',
    '["Aruz veznini yeniden düzenlemesi","Aruz ve kalıplaşmış nazım biçimlerini reddederek serbest nazma yönelmesi","Hece veznini yaygınlaştırması","Fransız sembolizmini Türkçeye uyarlaması"]'::jsonb,
    1,
    'Metinde Nazım Hikmet''in aruz veznini ve kalıplaşmış nazım biçimlerini reddederek serbest nazma yöneldiği belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000011-0000-4000-f300-000000000011',
    'detail',
    'Nazım Hikmet''in eserleri Türkiye''de ne zaman yeniden kamuoyuyla buluşabilmiştir?',
    '["1940''lı yıllardan itibaren","1950''li yıllardan itibaren","1960''lı yıllardan itibaren","1970''li yıllardan itibaren"]'::jsonb,
    2,
    'Metinde Nazım Hikmet''in eserlerinin ancak 1960''lı yıllardan itibaren yeniden kamuoyuyla buluşabildiği belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000011-0000-4000-f300-000000000011',
    'vocabulary',
    'Metinde "epik" kelimesinin bağlamdaki anlamı hangisidir?',
    '["Kısa ve öz","Uzun, destansı ve geniş kapsamlı","Lirik ve duygusal","Hicivli ve eleştirel"]'::jsonb,
    1,
    'Epik, destansı, uzun ve geniş kapsamlı anlatı anlamına gelir; metinde İnsan Manzaraları''nın boyutunu nitelemek için kullanılmıştır.',
    4,
    4
  ),
  (
    'f3000011-0000-4000-f300-000000000011',
    'inference',
    'Nazım Hikmet''in şiirinin yirmiden fazla dile çevrilmesinden hareketle aşağıdakilerden hangisi çıkarılabilir?',
    '["Şiirinin yalnızca siyasi değeri vardır","Şiirindeki evrensel insancıl değerler onu uluslararası alanda da önemli kılmıştır","Türk şiiri dünyada yalnızca Nazım Hikmet sayesinde tanınmaktadır","Toplumcu şiirin her kültürde aynı biçimi aldığı anlaşılmaktadır"]'::jsonb,
    1,
    'Metinde şiirinin evrensel insancıl değerleri zamana meydan okumaya devam ettiği vurgulanmaktadır; bu da uluslararası yankısının kaynağını açıklamaktadır.',
    4,
    5
  );

  -- ============================================================
  -- TEXT 12: Sabahattin Ali ve Türk Hikayeciliğinde Realizm
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000012-0000-4000-f300-000000000012',
    'Sabahattin Ali ve Türk Hikayeciliğinde Realizm',
    'AYT Edebiyat',
    'AYT',
    4,
    446,
    3,
    $b$Sabahattin Ali, Türk edebiyatında realizm akımının en güçlü temsilcilerinden biri olarak kabul edilmektedir. 1907''de Gümülcine''de doğan yazar, kısa ömründe (1948''de hayatını kaybetmiştir) Türk hikaye ve roman anlayışına köklü katkılar sunmuştur. Özellikle Anadolu köylüsünün ve emekçisinin yaşam koşullarını, toplumsal eşitsizlikleri ve insanın psikolojik derinliğini ön plana çıkaran eserleri, döneminin toplumsal eleştiri geleneğinin en güçlü örneklerini oluşturmaktadır.

Sabahattin Ali''nin hikayeciliğinin en belirgin özelliği, gerçekçilik ve gözleme dayalı anlatım anlayışıdır. Köylerde ve kasabalarda yaşayan sıradan insanları merkezine alan Sabahattin Ali, onların sevinçlerini, korkularını ve adaletsizlik karşısındaki çaresizliklerini dokunaklı bir dille aktarmaktadır. Değirmen, Kağnı ve Ses adlı hikaye kitapları, bu gerçekçi yaklaşımın en yetkin örneklerini sunar. Her hikayede karşılaşılan insan portresi, özgün ve unutulmaz karakterlerin okuyucu belleğinde kalıcı izler bıraktığını ortaya koymaktadır.

Romanları da en az hikayeleri kadar güçlü olan Sabahattin Ali''nin Kürk Mantolu Madonna adlı eseri, Türk edebiyatının en çok okunan romanları arasındadır. Raif Efendi ve Madonna''nın yasak aşkını anlatan bu roman, varoluşsal yalnızlık, toplumsal baskı ve ruhsal özgürlük arayışı gibi evrensel temaları ustalıkla işler. Romantik bir atmosfer içinde gerçekçi bir çözümleme sunan roman, kuşaklar boyu okuyucu kitlesini büyülemeye devam etmektedir. İçindeki çok katmanlı anlatı yapısı ve çerçeve hikaye tekniği, bu romanı edebiyat tekniği açısından da özellikle değerli kılmaktadır.

Sabahattin Ali''nin Marksist dünya görüşü, eserlerine güçlü bir toplumsal eleştiri boyutu katmaktadır. Güç, sınıf ve yoksulluk ilişkilerini şaşmaz bir gözlem gücüyle irdeleyen yazar, hakim sınıfların zulmüne uğrayanların sesini kararlılıkla edebiyat düzlemine taşımıştır. Bu tutum, onu döneminin siyasi otoritesiyle çatışmaya sokmuş ve çeşitli ceza ve baskılarla karşı karşıya bırakmıştır. 1948''deki ölümü hâlâ tam anlamıyla aydınlatılamamış ve şüpheli koşulları nedeniyle tartışmalı olmaya devam etmektedir.

Türk edebiyatındaki yeri değerlendirildiğinde Sabahattin Ali, hem hikayecilikte hem de romancılıkta özgün ve iz bırakan bir isim olarak öne çıkmaktadır. Onun gerçekçi, sade ve insancıl yazarlık anlayışı, kendisinden sonra gelen Orhan Kemal, Fakir Baykurt ve Yaşar Kemal gibi isimleri derinden etkilemiştir. Türk edebiyatında Anadolu gerçekçiliği geleneğinin en güçlü öncülerinden biri olarak tarihe geçen Sabahattin Ali, günümüzde de yeni okuyucu kuşaklarıyla buluşmayı sürdürmektedir.$b$,
    ARRAY['Sabahattin Ali','Kürk Mantolu Madonna','realizm','Anadolu gerçekçiliği'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000012-0000-4000-f300-000000000012',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Kürk Mantolu Madonna''nın konu özeti","Sabahattin Ali''nin gerçekçilik anlayışı ve Türk hikayeciliğine katkıları","Türk edebiyatında Marksizm''in yeri","Anadolu hikayeciliğinin tarihi"]'::jsonb,
    1,
    'Metin, Sabahattin Ali''nin gerçekçilik anlayışını, eserlerini ve Türk hikayeciliğine katkılarını ele almaktadır.',
    4,
    1
  ),
  (
    'f3000012-0000-4000-f300-000000000012',
    'detail',
    'Kürk Mantolu Madonna''nın anlatı tekniği açısından önemli özelliği metne göre nedir?',
    '["Geriye dönüş tekniğiyle anlatılması","Çok katmanlı anlatı yapısı ve çerçeve hikaye tekniği","Birden fazla anlatıcının kullanılması","Bilinç akışı tekniğine başvurulması"]'::jsonb,
    1,
    'Metinde romanın çok katmanlı anlatı yapısı ve çerçeve hikaye tekniği sayesinde edebiyat tekniği açısından değerli olduğu belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000012-0000-4000-f300-000000000012',
    'detail',
    'Metne göre Sabahattin Ali''den etkilenen yazarlar arasında hangisi yer almaktadır?',
    '["Yahya Kemal Beyatlı","Orhan Pamuk","Orhan Kemal","Ahmet Hamdi Tanpınar"]'::jsonb,
    2,
    'Metinde Orhan Kemal, Fakir Baykurt ve Yaşar Kemal''in Sabahattin Ali''den etkilendiği belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000012-0000-4000-f300-000000000012',
    'vocabulary',
    'Metinde "çözümleme" kelimesi hangi anlamda kullanılmıştır?',
    '["Bir problemi çözmek","Bir bütünü parçalara ayırarak inceleme","Farklı unsurları birleştirme","Matematiksel işlem yapma"]'::jsonb,
    1,
    'Çözümleme, bir bütünü parçalara ayırarak inceleme anlamına gelir; romanda toplumsal ve psikolojik gerçekliklerin incelenmesini nitelemektedir.',
    4,
    4
  ),
  (
    'f3000012-0000-4000-f300-000000000012',
    'inference',
    'Sabahattin Ali''nin siyasi otoritesiyle çatışmasının temel nedeni metne göre nedir?',
    '["Serbest şiir yazması","Eserlerinde hakim sınıfların zulmüne uğrayanların sesini taşıması","Yurt dışında eğitim alması","Dini konuları işlememesi"]'::jsonb,
    1,
    'Metinde güç ve yoksulluk ilişkilerini irdeleyen Sabahattin Ali''nin döneminin siyasi otoritesiyle çatışmaya girdiği belirtilmektedir.',
    4,
    5
  );


  -- ============================================================
  -- TEXT 13: Orhan Pamuk'un Postmodern Roman Tekniği
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000013-0000-4000-f300-000000000013',
    'Orhan Pamuk''un Postmodern Roman Tekniği',
    'AYT Edebiyat',
    'AYT',
    4,
    450,
    3,
    $b$Orhan Pamuk, 2006 yılında Nobel Edebiyat Ödülü''nü kazanarak Türk edebiyatını dünya sahnesinde tanıtan en önemli isim haline gelmiştir. 1952''de İstanbul''da doğan Pamuk, romanlarında postmodern tekniklerle Türk ve Doğu kimliğini, tarih ile belleği ve Doğu-Batı gerilimini derinlikli biçimde sorgulamaktadır. Eserlerindeki çok katmanlı anlatı yapısı, üstkurmaca kullanımı ve tarih ile kurgunun iç içe geçmesi, onu hem Türk hem de dünya edebiyatında özgün bir konuma yerleştirmektedir.

Postmodern roman tekniği, gerçeklikle kurgunun sınırlarını sorgulayan, çok katmanlı anlatılar kuran ve okuyucuyu metnin üretim sürecine ortak eden bir yaklaşımdır. Orhan Pamuk bu tekniği özgün biçimde kullanmaktadır. Beyaz Kale''de iki kimliğin birbiriyle yer değiştirmesi, kimliğin ve benliğin sabitliğini sorgularken; Benim Adım Kırmızı''da minyatür sanatı üzerinden Doğu ve Batı estetiği arasındaki gerilim felsefi bir derinlikte ele alınmaktadır. Bu romanlar, biçim ile içeriği eş anlı olarak sorgulayan örnek metinler olarak değerlendirilebilir.

Kar ve İstanbul adlı eserleri Pamuk''un hem edebî hem de anısal boyutlarını ortaya koyar. Kar, Türkiye''nin siyasi ve kimlik krizini Kars şehrinde geçen kurmaca bir olay örgüsüyle işlerken; İstanbul, şehrin belleğini ve hüzününü (hüzün kavramı bu romanda merkezi bir felsefi kategori olarak kullanılmaktadır) kişisel anılarla harmanlayan bir otobiyografik anlatıdır. Her iki eserde de tarih, kültür ve bireysel deneyim kesintisiz bir iç içe geçme içinde sunulmaktadır.

Pamuk''un en büyük başarılarından biri, Türkiye''ye özgü tarihsel ve kültürel meseleleri evrensel bir edebi dille ifade edebilmesidir. Masumiyet Müzesi adlı romanında, 1970''li ve 1980''li yılların İstanbul''unu bir aşk hikayesi üzerinden yeniden inşa etmekte; nesne ve anı arasındaki ilişkiyi felsefi bir soruşturmanın konusu haline getirmektedir. Hatta bu romanla bağlantılı olarak İstanbul''da gerçek bir müze kurmuş olması, kurgu ve gerçeklik arasındaki sınırı bilinçli biçimde bulanıklaştırma çabasının somut bir tezahürüdür.

Orhan Pamuk''un dil anlayışı da dikkat çekicidir. Süslü bir Türkçeyle ağır betimleyici pasajlar yazan Pamuk, tarihi atmosferleri ve psikolojik durumları yoğun bir duyusal ayrıntıyla aktarmaktadır. Eleştirmenler onun üslubunu zaman zaman aşırı ayrıntılı bulmakla birlikte, bu üslubun romanlarına özgün bir derinlik ve güzellik kattığı da kabul görmektedir. Türk edebiyatının hem ulusal hem de uluslararası alanda en fazla tanınan sesi olan Pamuk, sonraki kuşak Türk yazarları için de ilham kaynağı olmaya devam etmektedir.$b$,
    ARRAY['Orhan Pamuk','postmodern roman','Nobel','Benim Adım Kırmızı'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000013-0000-4000-f300-000000000013',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Orhan Pamuk''un Nobel Ödülü alma süreci","Orhan Pamuk''un postmodern roman tekniği ve eserleri","Türk edebiyatında Doğu-Batı çatışması","Masumiyet Müzesi''nin konu özeti"]'::jsonb,
    1,
    'Metin, Orhan Pamuk''un postmodern roman tekniğini ve bu tekniğin eserlerine nasıl yansıdığını ele almaktadır.',
    4,
    1
  ),
  (
    'f3000013-0000-4000-f300-000000000013',
    'detail',
    'Benim Adım Kırmızı romanında metne göre hangi gerilim felsefi derinlikte işlenmektedir?',
    '["Doğu ve Batı estetiği arasındaki gerilim","Birey ve devlet arasındaki çatışma","Aşk ve nefret arasındaki denge","Gelenek ve modernite çatışması"]'::jsonb,
    0,
    'Metinde Benim Adım Kırmızı''da minyatür sanatı üzerinden Doğu ve Batı estetiği arasındaki gerilimin felsefi derinlikte ele alındığı belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000013-0000-4000-f300-000000000013',
    'detail',
    'Masumiyet Müzesi romanıyla ilgili olarak metne göre aşağıdakilerden hangisi doğrudur?',
    '["Roman yalnızca kurgusal bir mekan tasviri içerir","Romanla bağlantılı gerçek bir müze kurulmuştur","Roman otobiyografik bir anlatıdır","Roman Nobel Ödülü''nü kazandırmıştır"]'::jsonb,
    1,
    'Metinde Orhan Pamuk''un bu romanla bağlantılı olarak İstanbul''da gerçek bir müze kurduğu belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000013-0000-4000-f300-000000000013',
    'vocabulary',
    'Metinde "üstkurmaca" kavramı nasıl anlaşılmalıdır?',
    '["Tarihi olayları anlatan kurgu","Metnin kendi kurgu yapısını sorgulayan yazarlık tekniği","Birden fazla anlatıcının kullanıldığı roman","Doğa tasvirlerine dayanan anlatı"]'::jsonb,
    1,
    'Üstkurmaca, bir metnin kendi kurgu yapısını ve yazılış sürecini sorgulaması anlamına gelir; postmodern romanın temel tekniklerinden biridir.',
    4,
    4
  ),
  (
    'f3000013-0000-4000-f300-000000000013',
    'inference',
    'Orhan Pamuk''un gerçek bir müze kurmasından hareketle aşağıdakilerden hangisi çıkarılabilir?',
    '["Romanını satmak için bir pazarlama stratejisi geliştirmiştir","Kurgu ve gerçeklik arasındaki sınırı bilinçli olarak bulanıklaştırmayı hedeflemiştir","Müzeciliği edebiyattan daha önemli bulduğunu göstermiştir","Türk kültür tarihini belgelemek istemiştir"]'::jsonb,
    1,
    'Metinde müze kurmanın kurgu ile gerçeklik arasındaki sınırı bilinçli biçimde bulanıklaştırma çabasının somut tezahürü olduğu belirtilmektedir.',
    4,
    5
  );

  -- ============================================================
  -- TEXT 14: Türk Edebiyatında Sembolizm ve Empresyonizm
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000014-0000-4000-f300-000000000014',
    'Türk Edebiyatında Sembolizm ve Empresyonizm',
    'AYT Edebiyat',
    'AYT',
    4,
    448,
    3,
    $b$Sembolizm ve empresyonizm, on dokuzuncu yüzyılın ikinci yarısında Fransa''da ortaya çıkan ve zamanla dünya edebiyatını derinden etkileyen iki önemli estetik akımdır. Bu akımlar, gerçekliği doğrudan ve nesnel biçimde aktarma amacı güden realizm ve natüralizme karşı bir tepki olarak gelişmiştir. Türk edebiyatına bu akımların etkisi Servet-i Fünun döneminde başlamış ve özellikle Ahmet Haşim''in şiiriyle doruğuna ulaşmıştır.

Sembolizm, duyguları, sezgileri ve bilinçdışı deneyimleri doğrudan ifade etmek yerine simgeler, imgeler ve müzikal ses düzenleri aracılığıyla aktarmayı esas alan bir akımdır. Dil, anlamı doğrudan iletmek için değil; çağrışımlar, ses efektleri ve belirsizlik yoluyla okuyucuda bir duygu hali yaratmak için kullanılır. Verlaine, Mallarmé ve Baudelaire bu akımın başlıca temsilcileridir. Türk şiirinde ise Ahmet Haşim, sembolist estetiği en özgün biçimde benimseyen şair olarak öne çıkmaktadır.

Ahmet Haşim''in şiiri, anlam kapalılığı ve müzikalite açısından Türk sembolizminin doruk noktasını temsil etmektedir. O Belde ve Piyale adlı şiir kitaplarında akşam, ay ve su gibi imgeler, yoğun sembolik anlamlarla örülüdür. Şiirinde gerçeklik değil; şiirin uyandırdığı duygu, izlenim ve atmosfer önem taşımaktadır. Haşim, şiirin anlaşılmak için değil, hissedilmek için yazıldığını savunmuş ve bu görüşünü Şiir Hakkında Bazı Mülahazalar adlı poetik denemesinde ayrıntıyla ortaya koymuştur.

Empresyonizm ise öznel anlık izlenimleri, duyusal algıları ve değişken ışık-renk etkilerini yansıtmayı ön plana alan bir akımdır. Resim sanatından edebiyata geçen bu kavram, anlatıda nesnel gerçekliğin değil gözlemcinin anlık algısının esas alınmasını ifade eder. Türk edebiyatında empresyonist öğeler, daha çok Servet-i Fünun nesri ve özellikle Halit Ziya''nın doğa betimlemelerinde gözlemlenmektedir. Ahmet Haşim''in şiiri de empresyonist çizgilerle sembolist çizgileri bir arada taşımaktadır.

Bu iki akımın Türk edebiyatına katkısı, edebiyatın biçim ve anlam anlayışında köklü bir genişleme yaratmış olmasıdır. Söz konusu akımlar sayesinde şiirde anlamın açık ve net olması zorunluluğu sorgulanmış; duygu ve izlenimin doğrudan anlamın önüne geçebileceği kabul görmüştür. Bu anlayış, sonraki dönemlerde İkinci Yeni hareketi başta olmak üzere pek çok Türk şiir akımını etkilemiş ve Türk şiirinin anlam sınırlarını kalıcı biçimde genişletmiştir.$b$,
    ARRAY['sembolizm','empresyonizm','Ahmet Haşim','Türk şiiri akımları'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000014-0000-4000-f300-000000000014',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Ahmet Haşim''in biyografisi","Türk edebiyatında sembolizm ve empresyonizmin yansımaları","Fransız şiirinin dünya edebiyatına etkisi","Servet-i Fünun döneminin kapsamlı bir incelemesi"]'::jsonb,
    1,
    'Metin, sembolizm ve empresyonizmin Türk edebiyatındaki yansımalarını ve bu akımların özelliklerini ele almaktadır.',
    4,
    1
  ),
  (
    'f3000014-0000-4000-f300-000000000014',
    'detail',
    'Metne göre sembolizmin dili kullanma biçimi nasıldır?',
    '["Anlamı doğrudan ve açıkça iletmek","Çağrışımlar ve belirsizlik yoluyla okuyucuda duygu hali yaratmak","Toplumsal mesajları anlatmak","Nesnel gerçekliği aktarmak"]'::jsonb,
    1,
    'Metinde sembolizmde dilin anlamı doğrudan iletmek için değil, çağrışımlar ve belirsizlik yoluyla okuyucuda duygu hali yaratmak için kullanıldığı belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000014-0000-4000-f300-000000000014',
    'detail',
    'Ahmet Haşim''in poetik görüşlerini ayrıntılı ortaya koyduğu eser metne göre hangisidir?',
    '["O Belde","Piyale","Şiir Hakkında Bazı Mülahazalar","Göl Saatleri"]'::jsonb,
    2,
    'Metinde Ahmet Haşim''in şiirin anlaşılmak değil hissedilmek için yazıldığı görüşünü Şiir Hakkında Bazı Mülahazalar adlı denemesinde ortaya koyduğu belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000014-0000-4000-f300-000000000014',
    'vocabulary',
    'Metinde "müzikalite" kelimesi hangi anlamda kullanılmıştır?',
    '["Müzik eşliğinde şiir okuma","Şiirde ses düzeninin müziğe benzer bir ahenk yaratması","Nota yazımıyla şiir oluşturma","Şiirin melodiye dönüştürülmesi"]'::jsonb,
    1,
    'Müzikalite, şiirde ses düzeninin müziğe benzer bir ahenk yaratması anlamına gelir; sembolist şiirin önemli bir özelliğidir.',
    4,
    4
  ),
  (
    'f3000014-0000-4000-f300-000000000014',
    'inference',
    'Sembolizmin "anlam açık ve net olmalıdır" zorunluluğunu sorgulamasından hareketle aşağıdakilerden hangisi çıkarılabilir?',
    '["Sembolist şiirler anlamsızdır","Şiirde duygu ve izlenimin anlamın önüne geçebileceği kabul görmeye başlamıştır","Sembolizm okuyucuyu dışlayan bir akımdır","Türk edebiyatı sembolizmi reddetmiştir"]'::jsonb,
    1,
    'Metinde bu akımlar sayesinde duygu ve izlenimin doğrudan anlamın önüne geçebileceğinin kabul gördüğü belirtilmektedir.',
    4,
    5
  );


  -- ============================================================
  -- TEXT 15: Modern Türk Tiyatrosunun Gelişimi
  -- ============================================================
  INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'f3000015-0000-4000-f300-000000000015',
    'Modern Türk Tiyatrosunun Gelişimi',
    'AYT Edebiyat',
    'AYT',
    4,
    452,
    3,
    $b$Modern Türk tiyatrosu, Tanzimat dönemine kadar uzanan kökleriyle birlikte yüzelli yılı aşkın bir tarihsel sürecin ürünüdür. Osmanlı toplumunda geleneksel seyirlik oyun biçimleri olan Karagöz, Hacivat, ortaoyunu ve meddah, halkın sözlü eğlence kültürünü yüzyıllarca besleyen köklü geleneklerdir. Ancak Batılı anlamda yazılı metin temelli tiyatro, Tanzimat reformlarıyla birlikte Türk kültür hayatına girmiştir. Bu süreçte hem Türk hem de Ermeni ve Rum tiyatro topluluklarının katkıları belirleyici bir rol oynamıştır.

Türk tiyatrosunun modern anlamda kuruluşunda İbrahim Şinasi''nin 1860''ta kaleme aldığı Şair Evlenmesi oyunu kritik bir yer tutmaktadır. Bu tek perdelik oyun, alaycı ve hicivli üslubuyla geleneksel kurumları eleştiren ilk modern Türkçe tiyatro yapıtı olarak kabul edilmektedir. Ardından Namık Kemal''in Vatan Yahut Silistre, Zavallı Çocuk ve Gülnihal gibi eserleri, tiyatroyu toplumsal ve siyasi bir mesaj aracı olarak güçlü biçimde kullanmıştır. Bu yapıtlar hem dramatik yazarlık açısından hem de siyasi etkileri bakımından Türk tiyatro tarihinin temel taşlarını oluşturmaktadır.

Cumhuriyet dönemiyle birlikte Türk tiyatrosu kurumsal bir yapıya kavuşmaya başlamıştır. 1914''te kurulan Darülbedayi, bugünkü İstanbul Şehir Tiyatrolarının çekirdeğini oluşturmuştur. Devlet Tiyatroları ise 1949''da kurularak ülke genelinde profesyonel sahne sanatlarının yayılmasına öncülük etmiştir. Bu kurumsal yapılar, tiyatroya devlet desteğini sağlamış ve Türk tiyatrosunun kurumsallaşmasında kritik işlev görmüştür.

Cumhuriyet dönemi tiyatro yazarlığında Haldun Taner, Aziz Nesin ve Güngör Dilmen öne çıkan isimler arasındadır. Haldun Taner''in epik tiyatro anlayışını özgün biçimde yorumladığı Keşanlı Ali Destanı, Türk tiyatrosunun en önemli yapıtlarından biri olarak kabul edilmektedir. Bu oyunda halk dilini, müziği ve toplumsal eleştiriyi bir araya getiren Taner, Brecht''in epik tiyatro anlayışını Türkiye''nin kentleşme gerçekliğiyle harmanlayarak özgün bir biçim yaratmıştır. Güngör Dilmen ise Midas''ın Kulakları gibi mitolojik konuları çağdaş bir duyarlılıkla işleyen oyunlarıyla tanınmaktadır.

Günümüz Türk tiyatrosu, devlet destekli kurumsal yapıların yanı sıra özel ve bağımsız tiyatroların da güçlenmesiyle çok sesli bir görünüm kazanmıştır. Alternatif tiyatro, çevre tiyatrosu ve deneysel sahne çalışmaları özellikle büyük şehirlerde giderek yaygınlaşmaktadır. Geleneksel Karagöz ve ortaoyunu geleneğinin modern yorumlarla yeniden sahnelenmesi, sözlü geleneğin çağdaş tiyatroyla kesişim noktalarını araştıran önemli yaratıcı deneyler olarak değerlendirilmektedir. Türk tiyatrosu, bu tarihin birikim ve çeşitliliğiyle uluslararası sahnelerde de giderek artan bir ilgiye konu olmaktadır.$b$,
    ARRAY['Türk tiyatrosu','Haldun Taner','Darülbedayi','modern tiyatro'],
    'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES
  (
    'f3000015-0000-4000-f300-000000000015',
    'main_idea',
    'Bu metnin ana konusu aşağıdakilerden hangisidir?',
    '["Osmanlı''da Karagöz ve Hacivat geleneği","Modern Türk tiyatrosunun tarihsel gelişimi","Haldun Taner''in yaşamı ve eserleri","Devlet Tiyatrolarının kurumsal yapısı"]'::jsonb,
    1,
    'Metin, modern Türk tiyatrosunun Tanzimat''tan günümüze uzanan tarihsel gelişimini ele almaktadır.',
    4,
    1
  ),
  (
    'f3000015-0000-4000-f300-000000000015',
    'detail',
    'Metne göre Türk tiyatrosunun modern anlamda kuruluşunda ilk kritik yapıt hangisidir?',
    '["Vatan Yahut Silistre","Keşanlı Ali Destanı","Şair Evlenmesi","Midas''ın Kulakları"]'::jsonb,
    2,
    'Metinde İbrahim Şinasi''nin 1860''ta kaleme aldığı Şair Evlenmesi''nin ilk modern Türkçe tiyatro yapıtı olarak kabul edildiği belirtilmektedir.',
    4,
    2
  ),
  (
    'f3000015-0000-4000-f300-000000000015',
    'detail',
    'Keşanlı Ali Destanı''nın özelliği metne göre nedir?',
    '["Mitolojik konuları işleyen bir oyundur","Halk dili, müzik ve toplumsal eleştiriyi bir araya getiren epik bir oyundur","Tarihsel bir olayı belgeleyen bir oyundur","Divan geleneğini modern tiyatroya taşıyan bir oyundur"]'::jsonb,
    1,
    'Metinde Keşanlı Ali Destanı''nın halk dilini, müziği ve toplumsal eleştiriyi bir araya getirdiği ve Brecht''in anlayışıyla Türkiye gerçekliğini harmanladığı belirtilmektedir.',
    4,
    3
  ),
  (
    'f3000015-0000-4000-f300-000000000015',
    'vocabulary',
    'Metinde "epik tiyatro" kavramı hangi anlamda kullanılmıştır?',
    '["Destan ve söylencelerden uyarlanan oyunlar","Seyirciye mesafe koyan, toplumsal eleştiriyi ön plana alan tiyatro anlayışı","Yalnızca trajik konuları işleyen oyunlar","Geleneksel Türk seyirlik oyunlarının genel adı"]'::jsonb,
    1,
    'Epik tiyatro, Brecht''in geliştirdiği, seyirciye mesafe koyan ve toplumsal eleştiriyi ön plana çıkaran bir tiyatro anlayışıdır.',
    4,
    4
  ),
  (
    'f3000015-0000-4000-f300-000000000015',
    'inference',
    'Günümüzde Karagöz ve ortaoyunu geleneğinin modern yorumlarla sahnelenmesinden hareketle aşağıdakilerden hangisi çıkarılabilir?',
    '["Geleneksel oyunlar aynı biçimiyle sürdürülmektedir","Sözlü gelenek ile çağdaş tiyatro arasında yaratıcı bir diyalog kurulmaktadır","Geleneksel oyunlar artık ilgi görmemektedir","Devlet bu oyunları yasaklamıştır"]'::jsonb,
    1,
    'Metinde bu çalışmaların sözlü geleneğin çağdaş tiyatroyla kesişim noktalarını araştıran önemli yaratıcı deneyler olduğu belirtilmektedir.',
    4,
    5
  );

  RAISE NOTICE '052: AYT Edebiyat 15 metin + 75 soru basariyla eklendi.';
END;
$migration$;
