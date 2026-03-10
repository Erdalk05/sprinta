-- ================================================================
-- 054_ayt_felsefe_psi.sql
-- AYT Felsefe (6 metin) + AYT Psikoloji (4 metin) = 50 soru
-- ================================================================

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM text_library WHERE category LIKE 'AYT Felsefe%' OR category LIKE 'AYT Psikoloji%') > 0 THEN
    RAISE NOTICE '054: already exists';
    RETURN;
  END IF;

-- ================================================================
-- METIN 1: AYT Felsefe — Bilgi Kuramı: Doğruluk, Gerekçe ve İnanç
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000001-0000-4000-f200-000000000001',
  'Bilgi Kuramı: Doğruluk, Gerekçe ve İnanç',
  'AYT Felsefe',
  'AYT',
  4,
  448,
  3,
  $b$
Bilgi kuramı ya da epistemoloji, felsefenin en köklü ve tartışmalı alanlarından biri olarak bilginin doğası, kaynakları, sınırları ve geçerliliği üzerine sistematik sorular yöneltir. "Bilgi nedir?" sorusu, görünürde basit olmakla birlikte üzerine düşünüldükçe derin bir karmaşıklık kazanır. Platon'dan bu yana kabul gören klasik çözümleme, bilgiyi "gerekçelendirilmiş doğru inanç" olarak tanımlar; ancak bu tanım, 1963 yılında Edmund Gettier'in kısa ama çarpıcı makalesiyle ciddi biçimde sorgulanmaya başlanmıştır.

Gettier, klasik tanımın yeterliliğini çürüten karşı örnekler sunarken, doğru ve gerekçelendirilmiş ama tesadüfi biçimde doğru olan inançların bilgi sayılamayacağını göstermiştir. Bu "Gettier sorunu" olarak bilinen problem, epistemoloji literatüründe büyük yankı uyandırmış ve bilginin analizini daha karmaşık hale getirmiştir. Filozoflar bu sorunu çözmek amacıyla çeşitli ek koşullar önermiş; nedensellik kuramı, güvenilircilik ve sağduyu epistemolojisi gibi yaklaşımlar gündeme gelmiştir.

Bilgi kuramı açısından bir diğer temel tartışma, bilginin kaynakları üzerinedir. Rasyonalistler, saf aklın deneyimden bağımsız biçimde gerçek bilgiye ulaşabileceğini savunurken, empiristler her türlü bilginin duyusal deneyime dayandığını öne sürer. Descartes'ın meşhur "Düşünüyorum, öyleyse varım" önermesi, kuşkuyu araç olarak kullanarak ulaşılan a priori kesin bilginin en ünlü örneğidir. Hume ise nedensellik ilişkisinin deneyimsel temelde kanıtlanamayacağını göstererek empirizmin sınırlarını sorgulamıştır.

Kant, bu iki büyük geleneği sentezlemeye girişmiş; zihnin dış dünyayı pasif biçimde yansıtmadığını, aksine deneyimi olanaklı kılan a priori kategorilerle aktif olarak biçimlendirdiğini ileri sürmüştür. Kant'a göre uzay, zaman ve nedensellik dış dünyaya ait özellikler değil, zihnin duyusal verileri örgütleme biçimleridir. Bu "kopernik devrimi" olarak nitelendirilen çevirme, epistemoloji tarihinde köklü bir dönüm noktası oluşturmuştur.

Çağdaş epistemolojide, bilginin sosyal boyutu da önem kazanmıştır. Feminist epistemoloji ve sosyal epistemoloji, bilgi üretiminin siyasi ve toplumsal koşullarını inceleyerek kimin ne zaman ve hangi koşullar altında bilgi ürettiğini sorgulamaktadır. Epistemolojik adalet kavramı ise bazı grupların tanıklıklarının sistematik biçimde görmezden gelinmesini sorunlaştırarak bilgi üretiminin adilliğini tartışma gündemine taşımaktadır.
  $b$,
  ARRAY['felsefe','bilgi kuramı','epistemoloji','Gettier','Kant','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000001-0000-4000-f200-000000000001','main_idea','Bu metnin ana konusu nedir?','["Gettier probleminin ortaya çıkmasıyla birlikte felsefenin sona erişi","Bilginin \"gerekçelendirilmiş doğru inanç\" olarak tanımlanmasının yeterliliği ve epistemolojik tartışmalar","Kant''ın Platon''ı eleştirmesinin tarihsel süreci","Empirizmin rasyonalizm karşısındaki kesin üstünlüğü"]'::jsonb,1,'Metin, bilginin klasik tanımını, Gettier sorununu, bilginin kaynaklarına ilişkin rasyonalizm-empirizm tartışmasını ve Kant''ın sentezini ele alarak epistemolojinin temel gündemini ortaya koymaktadır.',4,1),
('f2000001-0000-4000-f200-000000000001','detail','Gettier probleminin felsefedeki önemi nedir?','["Bilginin mümkün olmadığını kanıtlamıştır","Gerekçelendirilmiş doğru inancın bilgi için yeterli olmadığını göstermiştir","Empirizmin rasyonalizm karşısında galip geldiğini ortaya koymuştur","Kant''ın bilgi anlayışını çürütmüştür"]'::jsonb,1,'Metin, Gettier''in 1963 tarihli makalesinin klasik bilgi tanımını ciddi biçimde sorgulamaya açtığını ve yeterliliğini sınadığını belirtmektedir.',4,2),
('f2000001-0000-4000-f200-000000000001','detail','Kant''ın epistemolojiye katkısı nasıl tanımlanmaktadır?','["Empirizmin sınırlarını tamamen ortadan kaldırması","Zihnin dış dünyayı pasif biçimde yansıttığını kanıtlaması","Zihnin deneyimi a priori kategorilerle aktif olarak biçimlendirdiğini ileri sürmesi","Bilginin yalnızca duyusal verilerden oluştuğunu göstermesi"]'::jsonb,2,'Metin, Kant''ın zihnin aktif rolünü vurguladığını ve bu yaklaşımın \"kopernik devrimi\" olarak nitelendirildiğini belirtmektedir.',4,3),
('f2000001-0000-4000-f200-000000000001','vocabulary','"A priori" kavramı bu metinde ne anlama gelmektedir?','["Deneyimden sonra elde edilen","Deneyimden bağımsız, salt akla dayalı","Duyu organları aracılığıyla kazanılan","Toplumsal koşullar tarafından belirlenen"]'::jsonb,1,'A priori, felsefede deneyimden önce gelen ya da deneyimden bağımsız olarak aklın kendisinden elde edilen bilgi ve kavramları ifade eder.',4,4),
('f2000001-0000-4000-f200-000000000001','inference','Feminist epistemoloji ve epistemolojik adalet kavramlarının gündeme gelmesinden ne çıkarılabilir?','["Bilgi kuramı artık tamamen siyasi bir alan haline gelmiştir","Geleneksel epistemoloji evrensel ve tarafsız bir bilgi anlayışı geliştirmiştir","Bilgi üretiminin toplumsal güç ilişkilerinden bağımsız değerlendirilemeyeceği","Bilginin doğruluğu sosyal onaya bağlıdır"]'::jsonb,2,'Metin, sosyal epistemoloji ve feminist epistemolojinin bilgi üretiminin siyasi ve toplumsal koşullarını incelediğini belirtmektedir; bu, bilginin salt nesnel olmadığını düşündürür.',4,5);

-- ================================================================
-- METIN 2: AYT Felsefe — Varlık Felsefesi: Ontolojik Sorular
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000002-0000-4000-f200-000000000002',
  'Varlık Felsefesi: Ontolojik Sorular ve Yanıtlar',
  'AYT Felsefe',
  'AYT',
  4,
  442,
  3,
  $b$
Ontoloji ya da varlık felsefesi, var olanın özü, yapısı ve türleri üzerine sorular yönelten felsefi disiplindir. "Neler vardır?", "Varlık nedir?", "Neden hiçlik değil de bir şeyler var?" gibi sorular ontolojinin temel gündemini oluşturur. Aristoteles'in "ilk felsefe" olarak nitelendirdiği bu alan, felsefenin tüm diğer dallarına zemin hazırlamaktadır. Varlığın temel kategorileri olan töz, özellik, ilişki ve olay, yüzyıllar boyu tartışılagelen kavramlar olmuştur.

Antik dönemde Parmenides, gerçek varlığın tek, değişmez ve sonsuz olduğunu savunurken, Herakleitos her şeyin değişim ve karşıtların birliği içinde bulunduğunu öne sürmüştür. Bu iki karşıt tutum, ontoloji tarihinin temel gerilimini oluşturmuş ve sonraki düşünürleri büyük ölçüde etkilemiştir. Platon''un idealar kuramı, gerçek varlığı değişmeyen idealar dünyasına yerleştirirken, Aristoteles ideaları bağımsız varlıklar olarak reddetmiş ve varlığın bireylerin içindeki töz-form birlikteliğinde bulunduğunu savunmuştur.

Orta çağda evreneller tartışması, ontolojinin en yoğun biçimde tartışıldığı dönemlerden birini oluşturmuştur. Realizm, nominalcilik ve konseptualizm olarak üç ana akıma ayrılan bu tartışmada, tümellerim gerçekten var olup olmadığı, yalnızca adlardan ibaret olup olmadığı ya da zihinsel kavramlar olup olmadığı soruları mercek altına alınmıştır.

Modern dönemde Descartes, düalist bir ontoloji benimseyerek zihin ve maddeyi iki ayrı töz olarak tanımlamıştır. Bu dualist çerçeve, zihin-beden problemini felsefi gündemin merkezine taşımış; Spinoza''nın tek töz anlayışı ve Leibniz''in monadolojisi bu probleme farklı yanıtlar sunmuştur. Çağdaş ontolojide ise fizikalizm, varlığın temelinin fiziksel olgulardan oluştuğunu ileri sürerken, fenomenoloji ve varoluşçuluk öznel deneyimi ve insan varoluşunu ön plana çıkarmaktadır.

Analitik felsefede ontoloji, dil ve mantıkla iç içe geçmiştir. Quine, "Neye bağlıyız?" sorusunu ontolojik taahhüt kavramıyla yanıtlamaya çalışmış; bir teorinin kabul ettiği varlıkların o teorinin kullandığı dil tarafından belirlendiğini savunmuştur. Bu yaklaşım, ontoloji ile dil felsefesi arasındaki sıkı bağı gözler önüne sermekte ve modern ontolojinin ne denli çok boyutlu bir disiplin haline geldiğini ortaya koymaktadır.
  $b$,
  ARRAY['felsefe','ontoloji','varlık','Aristoteles','Platon','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000002-0000-4000-f200-000000000002','main_idea','Bu metinde hangi felsefi disiplinin temel soruları ele alınmaktadır?','["Epistemoloji","Etik","Ontoloji (varlık felsefesi)","Estetik"]'::jsonb,2,'Metin, var olanın özü ve yapısı üzerine sorular yönelten varlık felsefesini (ontoloji) konu almaktadır.',4,1),
('f2000002-0000-4000-f200-000000000002','detail','Parmenides ile Herakleitos''un varlık anlayışları arasındaki temel fark nedir?','["Her ikisi de varlığın tek ve değişmez olduğunu savunmuştur","Parmenides değişimi, Herakleitos ise değişmezliği savunmuştur","Parmenides varlığın değişmez olduğunu, Herakleitos her şeyin değişim içinde olduğunu savunmuştur","Her ikisi de idealar kuramına bağlıdır"]'::jsonb,2,'Metin, Parmenides''in varlığı değişmez tek olarak gördüğünü, Herakleitos''un ise karşıtların birliği içindeki değişimi temel aldığını belirtmektedir.',4,2),
('f2000002-0000-4000-f200-000000000002','detail','Orta çağ evreneller tartışmasındaki üç temel akım nelerdir?','["İdealizm, materyalizm ve dualizm","Realizm, nominalcilik ve konseptualizm","Rasyonalizm, empirizm ve eleştiricilik","Tözcülük, oluşçuluk ve nihilizm"]'::jsonb,1,'Metin, evreneller tartışmasının realizm, nominalcilik ve konseptualizm olmak üzere üç ana akıma ayrıldığını açıkça belirtmektedir.',4,3),
('f2000002-0000-4000-f200-000000000002','vocabulary','"Töz" kavramı ontoloji bağlamında ne anlama gelir?','["Bir nesnenin rengi veya şekli","Kalıcı değişmeyen temel varlık veya gerçeklik","Nesneler arasındaki ilişki biçimi","Zihinsel bir kavram veya imge"]'::jsonb,1,'Ontolojide töz, sürekli var olan ve kendi başına bağımsız varlığı bulunan temel gerçeklik anlamına gelir; Aristoteles ve Descartes bu kavramı merkeze almıştır.',4,4),
('f2000002-0000-4000-f200-000000000002','inference','Quine''ın ontolojik taahhüt anlayışından ne çıkarılabilir?','["Varlıklar dilden bağımsız olarak keşfedilir","Hangi varlıkların var sayıldığı kullanılan teorik dile bağlıdır","Ontoloji dil felsefesinden tamamen bağımsız bir disiplindir","Fizikalizm tek doğru ontolojik yaklaşımdır"]'::jsonb,1,'Metin, Quine''ın bir teorinin benimsediği varlıkların o teorinin dilinden belirlendiğini savunduğunu aktarmaktadır; bu, ontoloji ile dil felsefesini yakından ilişkilendirir.',4,5);

-- ================================================================
-- METIN 3: AYT Felsefe — Ahlak Felsefesi: Evrensel Etik Mi, Görelilik Mi?
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000003-0000-4000-f200-000000000003',
  'Ahlak Felsefesi: Evrensel Etik mi, Görelilik mi?',
  'AYT Felsefe',
  'AYT',
  4,
  450,
  3,
  $b$
Ahlak felsefesi ya da etik, doğru ve yanlışın, iyi ve kötünün ne anlama geldiğini, ahlaki yargıların nesnel bir temeli olup olmadığını ve insanın nasıl yaşaması gerektiğini sorgular. Bu alanda iki temel karşıt tutum olan ahlaki evrenselcilik ve ahlaki görelilik, yüzyıllardır tartışılmaya devam etmektedir. Evrenselciler, belirli ahlaki ilkelerin kültür, tarih ve bireyden bağımsız olarak geçerli olduğunu savunurken; görecililer, ahlaki normların yalnızca belirli kültür ya da bireylere özgü olduğunu öne sürmektedir.

Ahlaki evrenselcilik tarihte güçlü temsilciler bulmuştur. Kant''ın deontolojik etiği, bir eylemin ahlakiliğini sonuçlarına değil evrenselleştirilebilirliğine bağlar. Kategorik buyruk olarak bilinen temel ahlak ilkesine göre, bir eylem yalnızca herkes tarafından yapılabileceği bir ilkeye dayandığında ahlaki açıdan doğrudur. Bu yaklaşım, ahlakın akıl yoluyla belirlenen evrensel ilkeler çerçevesinde değerlendirilmesini öngörmektedir. Bentham ve Mill''in faydacılığı ise farklı bir evrenselci yaklaşım sunar; bir eylemin ahlaki değerini, onun ürettiği toplam mutluluk ya da fayda belirler.

Aristoteles'in erdem etiği ise iyi yaşamı bireysel mükemmelleşme ve toplumsal bağlamda erdemi geliştirme olarak tanımlar. İyi insan, doğru alışkanlıklar edinmiş ve orta yolu bulmuş kişidir. Bu etiğin odak noktası, ne yapılması gerektiğinden çok nasıl bir karakter sahibi olunması gerektiğidir.

Buna karşın ahlaki görelilik, modern antropoloji ve sosyolojinin bulgularıyla güç kazanmıştır. Kültürden kültüre değişen ahlaki pratikler, evrensel bir ahlak ilkesinin imkânsızlığına işaret ediyor gibi görünmektedir. Ancak eleştirmenler, göreciliğin ahlaki ilerleme düşüncesini zedelediğini; soykırım ya da kölelik gibi pratiklerin hiçbir evrensel standart olmaksızın eleştirilemeyeceğini vurgulamaktadır.

Çağdaş ahlak felsefecileri bu ikilem arasında çeşitli aracı konumlar geliştirmiştir. Ahlaki minimalizm, evrensel olarak kabul görebilecek küçük bir temel ilkeler kümesini savunurken, yorumlayıcı etik, ahlaki normların toplumsal pratiklere ait olduğunu ancak bu pratiklerin içeriden eleştiri ve revize edilebildiğini öne sürmektedir.
  $b$,
  ARRAY['felsefe','etik','ahlak','Kant','faydacılık','erdem','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000003-0000-4000-f200-000000000003','main_idea','Bu metnin ana tartışması nedir?','["Kant''ın faydacılığı eleştirmesi","Antik Yunan ahlak anlayışının günümüzdeki yansımaları","Ahlaki evrenselcilik ile ahlaki görelilik arasındaki temel gerilim","Erdem etiğinin kategorik buyruktan üstünlüğü"]'::jsonb,2,'Metin, ahlaki evrenselcilik ile göreliliği, temel temsilcileri ve argümanlarıyla karşılaştırmalı biçimde ele almaktadır.',4,1),
('f2000003-0000-4000-f200-000000000003','detail','Kant''ın kategorik buyruğuna göre bir eylem hangi koşulda ahlaki olarak doğrudur?','["Maksimum fayda sağladığında","Herkesin uygulayabileceği evrensel bir ilkeye dayandığında","Kişiyi mutlu kıldığında","Toplumun beklentilerine uyduğunda"]'::jsonb,1,'Metin, Kant''ın kategorik buyruğunu bir eylemin herkes tarafından yapılabilecek bir ilkeye dayanması koşuluyla ahlaki olduğu ilkesi olarak tanımlamaktadır.',4,2),
('f2000003-0000-4000-f200-000000000003','detail','Ahlaki göreliliğe yöneltilen temel eleştiri nedir?','["Görelilik Kantçı etiği çürütmektedir","Görelilik soykırım gibi pratiklerin evrensel bir standart olmaksızın eleştirilememesine yol açar","Görelilik erdem etiğinin önemine işaret etmektedir","Görelilik faydacılıkla bağdaşmaz"]'::jsonb,1,'Metin, eleştirmenlerin göreliliğin soykırım ve kölelik gibi pratikleri evrensel bir standart olmaksızın eleştirilemez hale getirdiğini vurguladığını belirtmektedir.',4,3),
('f2000003-0000-4000-f200-000000000003','vocabulary','"Deontolojik etik" ifadesi bu metinde ne anlama gelir?','["Sonuçları esas alan etik yaklaşım","Erdemi merkeze alan erdem etiği","Eylemin ahlakiliğini sonuçlarına değil evrensel ilkelere göre değerlendiren etik yaklaşım","Kültürel normlara dayanan görecil etik"]'::jsonb,2,'Deontolojik etik, ahlaki yükümlülüğü ve ödevi ön plana çıkaran, bir eylemin sonuçlarından bağımsız olarak doğru ilkelere uygunluğunu ölçen etik yaklaşımdır.',4,4),
('f2000003-0000-4000-f200-000000000003','inference','Ahlaki minimalizm ve yorumlayıcı etiğin gündeme gelmesinden ne çıkarılabilir?','["Etikçiler evrenselcilik ile görelilik arasında uzlaşı noktaları aramaktadır","Evrensel etik artık tamamen terk edilmiştir","Görelilik felsefede kesin olarak kabul görmüştür","Kantçı etik günümüzde geçerliliğini yitirmiştir"]'::jsonb,0,'Metin, çağdaş filozofların bu iki kutup arasında aracı konumlar geliştirdiğini belirtmekte; bu durum, katı bir seçim yerine diyaloğun arandığına işaret etmektedir.',4,5);

-- ================================================================
-- METIN 4: AYT Felsefe — Estetik Felsefesi: Güzellik, Sanat ve Yargı
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000004-0000-4000-f200-000000000004',
  'Estetik Felsefesi: Güzellik, Sanat ve Yargı',
  'AYT Felsefe',
  'AYT',
  4,
  445,
  3,
  $b$
Estetik, güzellik, sanat ve estetik deneyimin felsefesi olarak tanımlanabilir. Antikçağdan günümüze kadar filozoflar, sanat eserinin ne olduğunu, güzelliğin nesnel mi öznel mi olduğunu ve estetik yargıların evrensellik iddiası taşıyıp taşıyamayacağını sorgulamıştır. Platon, güzelliği idealarda arayan bir yaklaşım benimserken, Aristoteles güzelliği düzgün orantı ve düzen içindeki formlarda görmüştür.

Kant, modern estetik düşüncesinin dönüm noktasını oluşturur. Yargı Gücünün Eleştirisi adlı eserinde Kant, estetik yargıyı ne tamamen öznel ne de nesnel olarak konumlandırmıştır. Güzeli yargılamak, bireyin kişisel çıkarından bağımsız biçimde, yani "çıkarsız hoşlanma" ile gerçekleşen bir deneyimdir. Ancak bu yargı evrensel bir geçerlilik iddiasında bulunur; güzel bulduğumuzu başkalarının da güzel bulmasını bekleriz. Bu durum, estetik yargının "öznellerarası" bir yapı taşıdığını gösterir.

Kant, estetik deneyimde güzel ile yüce arasında önemli bir ayrım yapar. Güzel, düzen ve uyum içinde haz verendir; yüce ise sonsuzluğu ya da muazzam gücü karşısında hem korku hem de hayranlık uyandıran bir deneyimdir. Dağlar, fırtınalar ve geniş okyanuslar yüce deneyiminin başlıca örnekleridir.

19. yüzyılda Hegel, sanatı tin''in duyusal biçimde tezahürü olarak tanımlamış ve sanat, din ve felsefenin tin''in kendini bilme sürecinin üç aşaması olduğunu ileri sürmüştür. Hegel''in sanat anlayışı, biçim ile içeriğin organik birliğini önemser; gerçek sanat eseri, evrensel bir içeriği duyusal bir biçimle mükemmel biçimde birleştirir.

20. yüzyıl ve çağdaş estetik, sanat eserinin tanımını kökten sorgulamaya açmıştır. Duchamp''ın ready-made anlayışı, sanatın bir zanaat ya da beceri meselesi olmadığını, sanatsal bağlamın belirleyici olduğunu ortaya koymuştur. Arthur Danto''nun "sanat dünyası" kavramı, bir nesnenin sanat eseri sayılmasının kurumsal bir bağlam gerektirdiğini savunmaktadır. Bu yaklaşım, estetik deneyimin yalnızca bireysel algıdan değil, sosyal ve kurumsal süreçlerden de beslendiğini göstermektedir.
  $b$,
  ARRAY['felsefe','estetik','güzellik','sanat','Kant','Hegel','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000004-0000-4000-f200-000000000004','main_idea','Bu metinde estetik felsefesi bağlamında ele alınan temel soru nedir?','["Sanatın ekonomik değerinin nasıl belirleneceği","Güzelliğin nesnel mi öznel mi olduğu ve estetik yargının niteliği","Farklı sanat akımlarının tarihsel gelişimi","Sanatçının toplumsal sorumluluğu"]'::jsonb,1,'Metin, güzelliğin doğası ve estetik yargının öznellik-nesnellik sorununu filozofların görüşleri çerçevesinde incelemektedir.',4,1),
('f2000004-0000-4000-f200-000000000004','detail','Kant''ın "çıkarsız hoşlanma" kavramı ne anlama gelir?','["Sanat eserinin maddi değerinin göz ardı edilmesi","Estetik yargının kişisel çıkardan bağımsız biçimde gerçekleşmesi","Güzelin yalnızca öznel bir duygu olduğu","Sanatın ahlaki değerlere hizmet etmesi"]'::jsonb,1,'Metin, Kant''ın güzeli yargılamayı bireyin kişisel çıkarından bağımsız gerçekleşen bir deneyim olarak tanımladığını belirtmektedir.',4,2),
('f2000004-0000-4000-f200-000000000004','detail','Kant''ın güzel ile yüce arasındaki ayrıma göre yüce deneyimi nasıl tanımlanır?','["Düzen ve uyum içinde haz veren","Sonsuzluk ya da muazzam güç karşısında hem korku hem hayranlık uyandıran","Çıkarsız hoşlanmayla elde edilen estetik zevk","Sanat eserinin kurumsal bağlamda değerlendirilmesi"]'::jsonb,1,'Metin, yücenin sonsuzluk ya da büyük güç karşısında korku ve hayranlık uyandıran bir deneyim olduğunu, dağ ve fırtınaları örnek vererek açıklamaktadır.',4,3),
('f2000004-0000-4000-f200-000000000004','vocabulary','"Öznellerarası" kavramı bu bağlamda ne anlama gelir?','["Yalnızca bir kişi tarafından deneyimlenen","Nesnel gerçekliğe dayanan","Bireysel olmakla birlikte başkalarının onayını bekleyen","Tarihsel bağlamdan bağımsız olan"]'::jsonb,2,'Öznellerarası, bireysel deneyime dayanmakla birlikte evrensel geçerlilik iddiası taşıyan; başkalarının da paylaşmasının beklendiği bir niteliği ifade eder.',4,4),
('f2000004-0000-4000-f200-000000000004','inference','Danto''nun "sanat dünyası" kavramı ve Duchamp''ın ready-made anlayışından ne çıkarılabilir?','["Sanat eseri yalnızca güzellik içeren nesnelerden oluşur","Bir nesneyi sanat eseri yapan şey onun kurumsal ve bağlamsal konumudur","Sanat evrensel ve değişmez estetik kurallara tabidir","Estetik yargı tamamen özneldir ve evrensel geçerliliği yoktur"]'::jsonb,1,'Metin, Duchamp ve Danto''nun yaklaşımlarının sanatın bir kurumsal bağlama ihtiyaç duyduğunu ortaya koyduğunu belirtmektedir; bu, bir nesnenin sanat sayılmasını zanaatten ya da güzellikten bağımsız kılar.',4,5);

-- ================================================================
-- METIN 5: AYT Felsefe — Siyaset Felsefesi: Devlet, Özgürlük ve Adalet
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000005-0000-4000-f200-000000000005',
  'Siyaset Felsefesi: Devlet, Özgürlük ve Adalet',
  'AYT Felsefe',
  'AYT',
  4,
  451,
  3,
  $b$
Siyaset felsefesi, devletin meşruiyetini, siyasi otoritenin sınırlarını, adalet ilkelerini ve bireysel özgürlük ile toplumsal düzen arasındaki ilişkiyi inceler. "Devlete itaat neden gereklidir?", "Adil bir toplum nasıl kurulur?", "Özgürlük nedir ve sınırları nelerdir?" gibi sorular bu alanın merkezinde yer alır. Bu sorulara verilen yanıtlar; liberalizm, cumhuriyetçilik, komünizm ve anarşizm gibi farklı siyasi teorilerin temelini oluşturur.

Hobbes, Locke ve Rousseau''nun geliştirdiği sosyal sözleşme teorisi, devletin meşruiyetini bireyler arasındaki varsayımsal bir sözleşmeye dayandırır. Hobbes''a göre doğa durumu, "herkesin herkese karşı savaşı" olduğundan, insanlar güvenlik karşılığında mutlak ege; meni ege;mene haklarını devrederler. Locke ise doğa durumunun görece barışçıl olduğunu, devletin ise önceden var olan doğal haklara —özellikle mülkiyet hakkına— saygı göstermekle yükümlü olduğunu savunur. Rousseau, bireyin genel iradeye tabi olduğu ve bu sayede gerçek özgürlüğe kavuştuğu bir toplum sözleşmesini tanımlar.

Özgürlük kavramı siyaset felsefesinde özellikle tartışmalı bir yer tutmaktadır. Isaiah Berlin, olumsuz özgürlük (müdahalesizlik, baskı yokluğu) ile olumlu özgürlük (öz-gerçekleştirme kapasitesi) arasındaki ayrımla bu tartışmayı netleştirmiştir. Liberaller genel olarak olumsuz özgürlüğü ön planda tutarken, cumhuriyetçiler bireyin yalnızca güç ilişkilerinden bağımsız olduğunda gerçek özgürlüğe kavuşacağını savunur.

Adalet kavramı ise John Rawls''ın çalışmalarıyla yeniden biçimlenmiştir. Rawls, "bilgisizlik perdesi" deneyi aracılığıyla adil bir toplumun ilkelerini belirlemeye çalışmıştır. Bu deneyde bireyler, toplumda işgal edecekleri konumu bilmeden hangi ilkeleri seçeceklerini hayal ederler. Rawls''a göre bu koşullarda insanlar, fırsat eşitliği ve en dezavantajlı grubun durumunu iyileştiren bir farklılık ilkesini benimseyecektir.
  $b$,
  ARRAY['felsefe','siyaset','adalet','özgürlük','Rawls','sosyal sözleşme','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000005-0000-4000-f200-000000000005','main_idea','Bu metnin ana konusu nedir?','["Demokrasi ile otoriter rejimler arasındaki farklılıklar","Devletin meşruiyeti, özgürlük ve adalet üzerine siyaset felsefesi tartışmaları","Sosyal sözleşme teorisinin tarihsel çürütülmesi","Liberal partilerin siyasi programları"]'::jsonb,1,'Metin, siyaset felsefesinin temel kavramlarını (devlet, özgürlük, adalet) filozofların görüşleri çerçevesinde ele almaktadır.',4,1),
('f2000005-0000-4000-f200-000000000005','detail','Hobbes''un devlet anlayışına göre insanlar neden haklarını devlete devreder?','["Doğa durumunda tam özgürlük yaşandığı için","Devletin adil kararlar alacağına güvendikleri için","Doğa durumunun savaş hali olduğu için güvenlik karşılığında","Genel iradeye katılmak istedikleri için"]'::jsonb,2,'Metin, Hobbes''a göre doğa durumunun "herkesin herkese karşı savaşı" olduğunu ve insanların güvenlik karşılığında haklarını devrettiklerini belirtmektedir.',4,2),
('f2000005-0000-4000-f200-000000000005','detail','Rawls''ın "bilgisizlik perdesi" deneyi ne tür bir adalet anlayışı üretir?','["Güçlünün hakkını en üstte tutan bir adalet","Fırsat eşitliği ve en dezavantajlıyı gözeten bir adalet","Mutlak eşitliği dayatan komünist bir adalet","Mülkiyet haklarını koruyan liberal bir adalet"]'::jsonb,1,'Metin, Rawls''ın bilgisizlik perdesi koşullarında bireylerin fırsat eşitliğini ve en dezavantajlı grubu gözeten ilkeleri seçeceğini savunduğunu açıklamaktadır.',4,3),
('f2000005-0000-4000-f200-000000000005','vocabulary','Berlin''in "olumlu özgürlük" kavramı ne anlama gelir?','["Herhangi bir müdahalenin bulunmaması","Kişinin kendi potansiyelini gerçekleştirme kapasitesi","Yasal güvence altına alınmış haklar","Devlet yönetimine katılma hakkı"]'::jsonb,1,'Olumlu özgürlük, müdahale yokluğunu değil; bireyin öz-gerçekleştirme ve kendi hedeflerini gerçekleştirme kapasitesini ifade eder.',4,4),
('f2000005-0000-4000-f200-000000000005','inference','Locke''un devlet anlayışından ne çıkarılabilir?','["Devlet bireyden önce gelir ve bireysel hakları belirler","Devlet, önceden var olan doğal hakları korumakla yükümlüdür, onları yaratmaz","Güvenlik için bireysel özgürlükten tamamen vazgeçilmelidir","Sosyal sözleşme bireylere hiçbir hak tanımaz"]'::jsonb,1,'Metin, Locke''a göre devletin doğal haklara —özellikle mülkiyet hakkına— saygı göstermekle yükümlü olduğunu belirtmektedir; bu, hakların devletten önce var olduğunu gösterir.',4,5);

-- ================================================================
-- METIN 6: AYT Felsefe — Mantık: Dedüktif ve Endüktif Akıl Yürütme
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000006-0000-4000-f200-000000000006',
  'Mantık: Dedüktif ve Endüktif Akıl Yürütme',
  'AYT Felsefe',
  'AYT',
  4,
  443,
  3,
  $b$
Mantık, geçerli çıkarımın ilkelerini ve biçimlerini inceleyen felsefi disiplindir. Aristoteles''in syllogistik mantığından Frege ve Russell''ın sembolik mantığına uzanan köklü bir tarihsel sürece sahip olan mantık, hem felsefenin hem de matematiğin temel aracı olarak işlev görmektedir. Mantık, düşüncenin normatif bilimi olarak öncüllerden sonuçlara ne zaman ve nasıl ulaşılabileceğini araştırır.

Dedüktif akıl yürütme, genel ilkelerden özel sonuçlara geçiş yapar ve geçerli bir argümanda öncüller doğruysa sonucun da zorunlu olarak doğru olduğu özelliğine sahiptir. Klasik bir örnek, "Tüm insanlar ölümlüdür, Sokrates insandır, öyleyse Sokrates ölümlüdür" biçimindeki kategorik kıyastır. Dedüktif argümanların güçlü yanı, bilginin kesin biçimde aktarılmasıdır; ancak bu yaklaşım, yeni bilgi üretmez, yalnızca öncüllerde zaten bulunan bilgiyi açıklar.

Endüktif akıl yürütme ise özel gözlemlerden genel sonuçlara ulaşır. Bir bilim insanının pek çok deney sonucunda bir kanun ya da kuram geliştirmesi endüktif bir süreçtir. David Hume, endüksiyon problemini formüle etmiş ve geçmişte gözlemlenen bir örüntünün gelecekte de geçerli olacağının mantıksal olarak kanıtlanamayacağını savunmuştur. Bu "endüksiyon problemi" olarak bilinen sorun, bilimsel bilginin kesinliği konusunda köklü şüpheler doğurmuştur.

Karl Popper, Hume''un sorununa farklı bir yanıt önermiş; bilimsel teorilerin doğrulanamayacağını ama yanlışlanabileceğini savunmuştur. Popper''a göre bir teorinin bilimsel sayılabilmesi için yanlışlanabilir olması gerekir; yani teorinin yanlış olduğunu ortaya koyabilecek olası gözlemlerin önceden belirlenebilmesi şarttır. Bu "yanlışlanabilirlik" ilkesi, bilim felsefesini derinden etkilemiştir.

Abduktif akıl yürütme ya da en iyi açıklamayı çıkarsama, mevcut kanıtları en iyi açıklayan hipotezi benimsemeyi öngörür. Tıbbi tanı koyma, suç soruşturması ve bilimsel teori seçimi, abduktif akıl yürütmenin gündelik yaşamdaki yaygın örnekleridir. Her üç akıl yürütme biçimi de birbirleriyle ilişkili olup akıl yürütmenin farklı boyutlarını tamamlayıcı biçimde yansıtmaktadır.
  $b$,
  ARRAY['felsefe','mantık','dedüksiyon','endüksiyon','Popper','Hume','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000006-0000-4000-f200-000000000006','main_idea','Bu metnin ana konusu nedir?','["Mantık tarihinin kronolojik özeti","Dedüktif, endüktif ve abduktif akıl yürütme biçimlerinin incelenmesi","Hume''un tüm felsefi görüşlerinin eleştirisi","Sembolik mantığın matematik üzerindeki etkileri"]'::jsonb,1,'Metin, mantığın temel akıl yürütme biçimlerini (dedüktif, endüktif, abduktif) tanımlayarak bunların özelliklerini ve sorunlarını ele almaktadır.',4,1),
('f2000006-0000-4000-f200-000000000006','detail','Dedüktif akıl yürütmenin temel özelliği nedir?','["Özel gözlemlerden genel sonuçlara ulaşması","Öncüller doğruysa sonucun zorunlu olarak doğru olması","En iyi açıklamayı benimsemesi","Bilim insanlarının kuram geliştirme yöntemi olması"]'::jsonb,1,'Metin, geçerli bir dedüktif argümanda öncüller doğruysa sonucun da zorunlu olarak doğru olduğunu belirtmektedir.',4,2),
('f2000006-0000-4000-f200-000000000006','detail','Hume''un endüksiyon problemi nedir?','["Genel ilkelerden özel sonuçlara ulaşmanın imkânsızlığı","Geçmişteki gözlemlere dayanan örüntülerin gelecekte de geçerli olacağının kanıtlanamaması","Yanlışlanabilirlik ilkesinin bilim için yeterli olmaması","Dedüktif argümanların yeni bilgi üretememesi"]'::jsonb,1,'Metin, Hume''un geçmişte gözlemlenen örüntülerin gelecekte geçerli olacağının mantıksal olarak kanıtlanamayacağını savunduğunu belirtmektedir.',4,3),
('f2000006-0000-4000-f200-000000000006','vocabulary','"Yanlışlanabilirlik" kavramı Popper''ın felsefesinde ne anlama gelir?','["Bir teorinin çürütülmüş olması","Bir teorinin yanlış olduğunu ortaya koyabilecek gözlemlerin önceden belirlenebilmesi","Endüktif akıl yürütmenin imkânsızlığı","Bilimin kesin bilgi üretemeyeceği"]'::jsonb,1,'Popper''a göre yanlışlanabilirlik, bir teorinin bilimsel sayılabilmesi için olası yanlışlama koşullarının önceden belirlenebilir olmasını gerektirmektedir.',4,4),
('f2000006-0000-4000-f200-000000000006','inference','Abduktif akıl yürütmenin tıbbi tanı gibi alanlarda kullanılmasından ne çıkarılabilir?','["Tıp bilimi salt dedüktif bir yapıya sahiptir","Gerçek yaşam problemlerinde yalnızca formal mantık yeterlidir","Gündelik akıl yürütme en iyi açıklamayı seçme süreçlerine dayanır","Endüktif akıl yürütme tıpta kullanılmaz"]'::jsonb,2,'Metne göre abduktif akıl yürütme, mevcut kanıtları en iyi açıklayan hipotezi benimsemeyi içerir; tıbbi tanı gibi pratik alanlarda bu yaklaşım temel rol oynar.',4,5);

-- ================================================================
-- METIN 7: AYT Psikoloji — Bilinç ve Bilinçdışı: Freud''dan Günümüze
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000007-0000-4000-f200-000000000007',
  'Bilinç ve Bilinçdışı: Freud''dan Günümüze',
  'AYT Psikoloji',
  'AYT',
  4,
  447,
  3,
  $b$
Bilinç, çevremizin ve iç durumumuzun öznel farkındalığı olarak tanımlanabilir; ancak bu tanım, psikoloji ve felsefenin en tartışmalı kavramlarından biriyle yüzleşmekten kaçınmamıza yardımcı olmaz. Bilinç neden vardır, nasıl oluşur ve fiziksel beyin süreçleriyle nasıl ilişkilenir gibi sorular, "zor problem" olarak nitelendirilen ve henüz tatmin edici bir yanıt bulunamayan sorulardır. Bu soruların yanı sıra bilinçdışı zihnin insan davranışı ve ruh sağlığı üzerindeki etkileri de psikolojinin en verimli araştırma alanlarından birini oluşturmaktadır.

Sigmund Freud, 20. yüzyılın başında geliştirdiği psikanalitik kuram aracılığıyla bilinçdışını sistematik biçimde incelemiş ve zihin modelini üç katmanlı bir yapı olarak ortaya koymuştur. Freud''a göre zihin; bilinç, bilinçöncesi ve bilinçdışından oluşmaktadır. Bilinçdışı, bastırılmış anıları, arzuları ve içgüdüsel dürtüleri barındıran ve doğrudan erişilemeyen bir alandır. Bu bastırılmış içerikler, semptomlar, rüyalar, dil sürçmeleri ve serbest çağrışım yoluyla kendini gösterebilir.

Freud''un topografik modelinin yerini almaya başlayan yapısal modelde id, ego ve süperego birbirinden ayrışan psişik yapılar olarak tanımlanmaktadır. İd, zevk ilkesiyle işleyen ilkel dürtülerin deposu; ego, gerçeklik ilkesiyle id ile dış dünya arasındaki arabulucu; süperego ise toplumsal normları içselleştiren ahlaki yapıdır. Bu üç yapı arasındaki çatışmaların nevrotik semptomlara yol açtığı psikanalizin temel varsayımlarından biridir.

Freud''dan sonra Jung, Adler ve Horney gibi psikanalistler, onun kuramını çeşitli yönlerde geliştirmiş ya da eleştirmiştir. Jung, bireysel bilinçdışına ek olarak "kolektif bilinçdışı" kavramını geliştirmiş; kültürler ötesi arketiplerin insan psikolojisinde ortak bir zemin oluşturduğunu savunmuştur. Çağdaş psikolojide ise nörobilim, bilinçdışı süreçleri beyin imgelem teknikleriyle doğrudan inceleme olanağı sağlamış; psikodinamik kavramların birçoğu ampirik destek kazanmaya başlamıştır.
  $b$,
  ARRAY['psikoloji','bilinç','bilinçdışı','Freud','psikanaliz','Jung','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000007-0000-4000-f200-000000000007','main_idea','Bu metnin ana konusu nedir?','["Nörobilim ile psikanalizin birbirine zıt olduğu","Freud''un katkıları ve bilinçdışı psikolojisinin tarihsel-kavramsal gelişimi","Bilinç felsefesinin ontoloji ile ilişkisi","Jung''un Freud''u tamamen çürütmesi"]'::jsonb,1,'Metin, bilincin ve bilinçdışının tanımı, Freud''un topografik ve yapısal modelleri, Freud sonrası gelişmeler ve nörobilimsel yaklaşımları bir bütün olarak ele almaktadır.',4,1),
('f2000007-0000-4000-f200-000000000007','detail','Freud''un yapısal modelinde "id" nasıl tanımlanmaktadır?','["Toplumsal normları içselleştiren ahlaki yapı","Gerçeklik ilkesiyle işleyen arabulucu yapı","Zevk ilkesiyle işleyen ilkel dürtülerin deposu","Bilinçöncesi anıların depolandığı alan"]'::jsonb,2,'Metin, idi "zevk ilkesiyle işleyen ilkel dürtülerin deposu" olarak tanımlamaktadır.',4,2),
('f2000007-0000-4000-f200-000000000007','detail','Freud''a göre bilinçdışı içerikler hangi yollarla kendini gösterebilir?','["Sadece rüyalar aracılığıyla","Semptomlar, rüyalar, dil sürçmeleri ve serbest çağrışım yoluyla","Doğrudan bilinçli gözlem yoluyla","Yalnızca semptomlar ve fiziksel belirtiler aracılığıyla"]'::jsonb,1,'Metin, bilinçdışı içeriklerin semptomlar, rüyalar, dil sürçmeleri ve serbest çağrışım yoluyla kendini gösterebileceğini açıklamaktadır.',4,3),
('f2000007-0000-4000-f200-000000000007','vocabulary','"Arketip" kavramı Jung''un psikolojisinde ne anlama gelir?','["Bireysel bilinçdışındaki bastırılmış anı","Kültürler ötesi kolektif bilinçdışında ortak evrensel imgeler","Nörobilimsel süreçleri açıklayan mekanizma","Ego ile id arasındaki çatışma biçimi"]'::jsonb,1,'Jung''a göre arketipler, kolektif bilinçdışında yer alan ve kültürler ötesinde paylaşılan evrensel imgeler veya örüntülerdir.',4,4),
('f2000007-0000-4000-f200-000000000007','inference','Nörobilimin bilinçdışı süreçleri beyin imgelem teknikleriyle incelemeye başlamasından ne çıkarılabilir?','["Psikanaliz artık tamamen geçerliliğini yitirmiştir","Psikodinamik kavramların bazıları ampirik olarak desteklenebilir hale gelmiştir","Bilinç sorunu tamamen çözülmüştür","Freud''un tüm kuramları nörobilim tarafından doğrulanmıştır"]'::jsonb,1,'Metin, çağdaş nörobilimin psikodinamik kavramların ampirik destek kazanmasını sağladığını belirtmektedir; bu, psikanalizin bazı boyutlarının bilimsel incelemeye açıldığına işaret eder.',4,5);

-- ================================================================
-- METIN 8: AYT Psikoloji — Kişilik Teorileri
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000008-0000-4000-f200-000000000008',
  'Kişilik Teorileri: Psikodinamik, Hümanist ve Bilişsel Yaklaşımlar',
  'AYT Psikoloji',
  'AYT',
  4,
  445,
  3,
  $b$
Kişilik, bir bireyin düşünme, hissetme ve davranma biçimini belirleyen görece tutarlı örüntüler bütünüdür. Psikoloji tarihinde kişiliği açıklamaya yönelik pek çok farklı yaklaşım geliştirilmiş ve bu yaklaşımlar birbiriyle rekabet etmiş, birbirini tamamlamıştır. Psikodinamik, hümanist, davranışçı, bilişsel ve biyolojik perspektifler, kişiliğin farklı boyutlarına odaklanarak onu açıklamaya çalışmaktadır.

Psikodinamik yaklaşımın temsilcisi Freud, kişiliğin büyük ölçüde bilinçdışı süreçler ve çocukluk çatışmaları tarafından şekillendirildiğini savunmuştur. Freud''un psikoseksüel gelişim kuramı, kişiliğin yaşamın ilk yıllarında belirlendiğini ve bilinçdışı çatışmaların yetişkinliğe uzanan kalıcı izler bıraktığını ileri sürmektedir. Freud''dan sonra gelen Erik Erikson, kişiliğin yaşam boyu gelişim içinde biçimlendiğini vurgulamış ve sekiz gelişim evresini tanımlamıştır.

Hümanist yaklaşım, Abraham Maslow ve Carl Rogers''ın öncülüğünde kişiliği daha iyimser bir perspektiften değerlendirmiştir. Maslow''un ihtiyaçlar hiyerarşisi, insanın kendini gerçekleştirmeye doğal olarak yöneldiğini ileri sürer; en yüksek gelişim düzeyi olan öz-gerçekleştirme, yaratıcılık ve tam potansiyele ulaşmayı simgeler. Rogers ise bireyin koşulsuz olumlu kabul gördüğünde sağlıklı bir kişilik geliştirebildiğini savunmuştur.

Bilişsel yaklaşım ise kişiliği büyük ölçüde bireyin sahip olduğu düşünce kalıpları, yorumlar ve inançlar aracılığıyla açıklar. Albert Bandura''nın sosyal bilişsel kuramı, öz yeterlilik kavramını merkeze alır. Öz yeterlilik, bireyin belirli görevleri başarabileceğine ilişkin kendi inancıdır; bu inanç, girişimciliği, çabayı ve başarıyı doğrudan etkilemektedir. George Kelly''nin kişisel yapılar kuramı ise bireylerin deneyimi özgün "kişisel yapılar" aracılığıyla yorumladığını savunur.

Günümüz psikolojisi, kişiliği açıklamak için hem biyolojik hem de çevresel faktörlerin katkısını kabul eden bütünleşik bir perspektif benimsemektedir. İkiz çalışmaları, kişilik özelliklerinin kalıtımla güçlü bir ilişki içinde olduğunu ortaya koyarken, kültürel ve çevresel deneyimlerin bu mirası biçimlendirdiği de unutulmamalıdır.
  $b$,
  ARRAY['psikoloji','kişilik','Freud','Maslow','Rogers','Bandura','öz yeterlilik','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000008-0000-4000-f200-000000000008','main_idea','Bu metnin ana konusu nedir?','["Tek bir kişilik teorisinin kapsamlı açıklanması","Farklı psikolojik yaklaşımların kişiliği nasıl açıkladığına genel bakış","Freud ile Rogers arasındaki doğrudan karşılaştırma","Kişiliğin biyolojik belirleyicilerinin incelenmesi"]'::jsonb,1,'Metin, psikodinamik, hümanist, bilişsel ve biyolojik perspektifleri birlikte ele alarak kişilik psikolojisine kapsamlı bir bakış sunmaktadır.',4,1),
('f2000008-0000-4000-f200-000000000008','detail','Maslow''un ihtiyaçlar hiyerarşisinde en üst gelişim düzeyi nedir?','["Güvenlik ihtiyacı","Ait olma ve sevgi ihtiyacı","Saygınlık ihtiyacı","Öz-gerçekleştirme"]'::jsonb,3,'Metin, öz-gerçekleştirmenin Maslow''un hiyerarşisinde en yüksek gelişim düzeyi olduğunu ve yaratıcılık ile tam potansiyele ulaşmayı simgelediğini belirtmektedir.',4,2),
('f2000008-0000-4000-f200-000000000008','detail','Bandura''nın öz yeterlilik kavramı nedir?','["Bireyin bilinçdışı dürtülerini kontrol etme kapasitesi","Bireyin belirli görevleri başarabileceğine ilişkin kendi inancı","Freud''un ego kavramının bilişsel karşılığı","Kalıtımsal kişilik özelliklerinin toplamı"]'::jsonb,1,'Metin, öz yeterliliği bireyin belirli görevleri başarabileceğine dair inancı olarak tanımlamakta ve bunun girişimciliği, çabayı ve başarıyı etkilediğini belirtmektedir.',4,3),
('f2000008-0000-4000-f200-000000000008','vocabulary','"Psikoseksüel gelişim" kavramı bu metinde ne anlama gelir?','["Cinsellikle ilgili ruh sağlığı bozuklukları","Freud''un kişiliğin yaşamın ilk yıllarında bilinçdışı çatışmalarla biçimlendiğini savunan gelişim kuramı","Erikson''un sekiz gelişim evresi modeli","Biyolojik faktörlerin kişilik üzerindeki etkisini inceleyen alan"]'::jsonb,1,'Freud''un psikoseksüel gelişim kuramı, kişiliğin erken çocukluk dönemindeki bilinçdışı çatışmalar aracılığıyla biçimlendiğini savunmaktadır.',4,4),
('f2000008-0000-4000-f200-000000000008','inference','İkiz çalışmalarının kişilik üzerinde kalıtımın etkisini göstermesi, ancak çevresel deneyimlerin de rol oynaması ne anlama gelir?','["Kişilik tamamen kalıtımla belirlenir","Çevre kalıtımı tamamen geçersiz kılar","Kişilik hem kalıtımsal hem de çevresel faktörlerin etkileşimiyle şekillenir","Psikoloji kişiliği henüz açıklayamamaktadır"]'::jsonb,2,'Metin, günümüz psikolojisinin hem biyolojik hem çevresel faktörleri kabul ettiğini belirtmektedir; bu, kişiliğin etkileşimsel bir yapısı olduğunu gösterir.',4,5);

-- ================================================================
-- METIN 9: AYT Psikoloji — Sosyal Psikoloji: Grup Dinamikleri
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000009-0000-4000-f200-000000000009',
  'Sosyal Psikoloji: Grup Dinamikleri ve Uyum Davranışı',
  'AYT Psikoloji',
  'AYT',
  4,
  448,
  3,
  $b$
Sosyal psikoloji, bireylerin başkalarının varlığından —gerçek, hayali ya da ima edilmiş— nasıl etkilendiğini inceler. Bu alan, grup içindeki davranışsal süreçleri, sosyal etki mekanizmalarını ve bireyin toplumsal çevresine uyum biçimlerini araştırmaktadır. Sosyal psikoloji, bireysel psikoloji ile sosyoloji arasında bir köprü kurarak insan davranışının hem bireysel hem de toplumsal boyutunu aydınlatmaya çalışmaktadır.

Solomon Asch''ın 1950''lerdeki uyum deneyleri, sosyal baskının bireysel yargı üzerindeki güçlü etkisini dramatik biçimde ortaya koymuştur. Deneyde katılımcılardan, uzunlukları açıkça farklı olan çizgiler arasında eşit olanları seçmeleri istenmiştir. Çoğunluğun kasıtlı olarak yanlış yanıt verdiği durumlarda katılımcıların yaklaşık üçte biri doğru yanıtı bilmelerine karşın çoğunluğa uymayı tercih etmiştir. Bu bulgu, normatif sosyal etkinin —sosyal kabulden dışlanmama kaygısının— ne denli güçlü olabileceğini göstermektedir.

Stanley Milgram''ın otoriteye itaat deneyleri ise sosyal psikoloji tarihinin en çarpıcı ve tartışmalı bulgularını sunmuştur. Deneyde katılımcıların büyük çoğunluğu, salt bir otorite figürünün talimatı üzerine başka birine —olduğunu sandıkları— ağır elektrik şoku uygulamayı kabul etmiştir. Milgram bu deneyle, totaliter rejimlerin bireyler üzerindeki itaat mekanizmalarını anlamaya yönelik sorularına yanıt aramıştır.

Grup düşüncesi (groupthink), özellikle homojen ve birbirinden kopmamış gruplarda gözlemlenen ve eleştirel değerlendirmenin uyum baskısı altında bastırıldığı bir süreçtir. Irving Janis, tarihteki önemli siyasi başarısızlıkları —Domuzlar Körfezi çıkarması gibi— grup düşüncesiyle açıklamıştır. Buna karşın sosyal kolaylaştırma, bireylerin başkalarının varlığında dominant davranışlarını daha iyi sergilediklerini göstermektedir.

Son olarak, atıfsal önyargılar sosyal psikolojinin önemli bir alt alanını oluşturmaktadır. Temel atıf hatası, bireylerin başkalarının davranışlarını çevresel faktörlerden çok kişisel özelliklere bağlama eğilimini tanımlar. Bu önyargı, sosyal yargıları, ön yargıları ve kişilerarası çatışmaları büyük ölçüde biçimlendirmektedir.
  $b$,
  ARRAY['psikoloji','sosyal','grup dinamiği','uyum','Asch','Milgram','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000009-0000-4000-f200-000000000009','main_idea','Bu metnin ana konusu nedir?','["Bireysel karar verme süreçleri üzerine bilişsel psikoloji","Sosyal psikolojinin grup dinamikleri, uyum ve sosyal etki üzerindeki bulguları","Milgram''ın etik ihlallerinin psikoloji tarihindeki sonuçları","Grup düşüncesini önlemenin pratik yolları"]'::jsonb,1,'Metin, sosyal psikolojinin uyum, otorite, grup düşüncesi ve atıfsal önyargı gibi temel konularını kapsamlı biçimde ele almaktadır.',4,1),
('f2000009-0000-4000-f200-000000000009','detail','Asch deneyleri neyi göstermiştir?','["Bireylerin her zaman bağımsız yargıda bulunduğunu","Çoğunluk baskısının bireyin doğru yanıtı bilse bile yanlış cevap vermesine yol açabileceğini","Sosyal baskının yalnızca otoriteryan kişilikleri etkilediğini","Grup uyumunun kaliteli karar almayı artırdığını"]'::jsonb,1,'Metin, Asch''ın deneyinde katılımcıların yaklaşık üçte birinin doğruyu bilmelerine karşın çoğunluğa uyum sağladığını gösterdiğini belirtmektedir.',4,2),
('f2000009-0000-4000-f200-000000000009','detail','Grup düşüncesi (groupthink) kavramı ne anlama gelir?','["Grup üyelerinin birbirinden bağımsız düşündüğü yaratıcı süreç","Uyum baskısı altında eleştirel değerlendirmenin bastırıldığı grup süreci","Bireylerin başkalarının varlığında dominant davranışlarını daha iyi sergilemesi","Karar almada azınlık görüşünün sistematik olarak bastırılmaması"]'::jsonb,1,'Metin, grup düşüncesini eleştirel değerlendirmenin uyum baskısı altında bastırıldığı ve genellikle homojen gruplarda gözlemlenen bir süreç olarak tanımlamaktadır.',4,3),
('f2000009-0000-4000-f200-000000000009','vocabulary','"Temel atıf hatası" ne anlama gelir?','["Başkalarının davranışlarını nedenleriyle doğru açıklama","Kendi hatalarımızı dışsal faktörlere yükleme","Başkalarının davranışlarını çevresel faktörler yerine kişisel özelliklere bağlama eğilimi","Grupta çoğunluk görüşüne uyma davranışı"]'::jsonb,2,'Temel atıf hatası, başkalarının davranışlarını kişisel özelliklerine (karakter, niyet) bağlama ve durumsal/çevresel faktörleri göz ardı etme eğilimini tanımlar.',4,4),
('f2000009-0000-4000-f200-000000000009','inference','Milgram''ın deneyinin totaliter rejimlerdeki itaat mekanizmalarını anlamak amacıyla tasarlanmasından ne çıkarılabilir?','["Bireyler hiçbir koşulda otorite figürlerine itaat etmez","Normal bireylerin bile otorite baskısı altında ahlak dışı davranışlarda bulunabileceği","Toplumsal şiddeti yalnızca kötü niyetli insanlar gerçekleştirir","Sosyal psikoloji deneyleri etik açıdan her zaman sorgulanamaz"]'::jsonb,1,'Metin, Milgram''ın totaliter rejimlerdeki itaat mekanizmalarını anlamaya çalıştığını belirtmektedir; bu, normal bireylerin de otorite altında ahlak dışı davranışlar sergileyebileceğine işaret eder.',4,5);

-- ================================================================
-- METIN 10: AYT Psikoloji — Piaget''nin Bilişsel Gelişim Kuramı
-- ================================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'f2000010-0000-4000-f200-000000000010',
  'Gelişim Psikolojisi: Piaget''nin Bilişsel Gelişim Kuramı',
  'AYT Psikoloji',
  'AYT',
  4,
  446,
  3,
  $b$
Jean Piaget, 20. yüzyılın en etkili gelişim psikologlarından biri olarak çocukların düşünme biçimlerinin yetişkinlerinkinden nitel olarak farklı olduğunu ortaya koyan kuramıyla tanınmaktadır. Piaget''e göre bilişsel gelişim, çocuğun çevresiyle aktif etkileşimi aracılığıyla gerçekleşen bir süreçtir; bu süreçte çocuk, deneyimlerini anlamlandırmak için şemalar inşa eder ve bu şemaları sürekli olarak yeniler. Asimilasyon ve akomodasyon, bu gelişimsel uyum sürecinin iki temel mekanizmasıdır.

Asimilasyon, yeni deneyimlerin mevcut şemalar çerçevesinde yorumlanmasıdır; akomodasyon ise mevcut şemaların yeni deneyimlere uyum sağlayacak biçimde değiştirilmesidir. Bu iki süreç arasındaki denge arayışı, bilişsel gelişimi yönlendiren dengeleme mekanizmasını oluşturur. Piaget, bilişsel gelişimi dört evreye ayırmıştır: duyusal-motor, işlem öncesi, somut işlemler ve soyut işlemler dönemi.

Duyusal-motor dönemde (0-2 yaş) bebek, dünyayı duyu organları ve motor hareketleri aracılığıyla keşfeder ve nesne kalıcılığı kavramını edinir. İşlem öncesi dönemde (2-7 yaş) çocuk dil ve sembolik düşünme kapasitesi kazanır; ancak benmerkezci bir perspektifle sınırlıdır. Somut işlemler döneminde (7-11 yaş) çocuk korunum, sınıflandırma ve mantıksal düşünme becerilerini geliştirir; ancak bu beceriler somut nesnelere bağlıdır. Soyut işlemler döneminde (11 yaş ve üzeri) ise soyut akıl yürütme, hipotetik-tümdengelimsel düşünme ve sistemli problem çözme kapasitesi ortaya çıkmaktadır.

Piaget''nin kuramı, eğitim psikolojisi üzerinde derin etkiler bırakmış; keşfederek öğrenme, yapılandırmacılık ve öğrenci merkezli öğretim anlayışının felsefi temellerini oluşturmuştur. Ancak eleştirmenler, Piaget''nin çocukların bilişsel kapasitesini kimi zaman hafife aldığını ve kültürün rolünü yeterince göz önünde bulundurmadığını ileri sürmektedir. Vygotsky''nin yakınsal gelişim alanı kavramı, sosyal etkileşim ve dil aracılığıyla gelişen bilişsel kapasiteye odaklanarak Piaget''ye önemli bir tamamlayıcı perspektif sunmaktadır.
  $b$,
  ARRAY['psikoloji','gelişim','Piaget','bilişsel gelişim','şema','Vygotsky','AYT'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
('f2000010-0000-4000-f200-000000000010','main_idea','Bu metnin ana konusu nedir?','["Vygotsky ile Piaget''nin karşılaştırmalı analizi","Piaget''nin bilişsel gelişim kuramı: evreleri, mekanizmaları ve eleştirileri","Çocuklarda dil gelişiminin sosyal süreçleri","Eğitim psikolojisinde yapılandırmacılığın tarihi"]'::jsonb,1,'Metin, Piaget''nin bilişsel gelişim kuramını asimilasyon/akomodasyon mekanizmaları, dört gelişim evresi ve kuram eleştirileri çerçevesinde kapsamlı biçimde ele almaktadır.',4,1),
('f2000010-0000-4000-f200-000000000010','detail','Piaget''nin bilişsel gelişim kuramına göre "akomodasyon" ne anlama gelir?','["Yeni deneyimlerin mevcut şemalar çerçevesinde yorumlanması","Mevcut şemaların yeni deneyimlere uyum sağlayacak biçimde değiştirilmesi","İki gelişim dönemi arasında kurulan denge","Duyusal-motor dönemde nesne kalıcılığını edinme"]'::jsonb,1,'Metin, akomodasyonu mevcut şemaların yeni deneyimlere uyum sağlayacak biçimde değiştirilmesi olarak tanımlamaktadır.',4,2),
('f2000010-0000-4000-f200-000000000010','detail','Somut işlemler döneminde (7-11 yaş) çocuklar hangi becerileri geliştirirler?','["Soyut akıl yürütme ve hipotetik düşünme","Korunum, sınıflandırma ve somut nesnelere dayalı mantıksal düşünme","Dil ve sembolik düşünme kapasitesi","Nesne kalıcılığı kavramı"]'::jsonb,1,'Metin, somut işlemler döneminde çocukların korunum, sınıflandırma ve mantıksal düşünme becerilerini geliştirdiğini, ancak bunların somut nesnelere bağlı kaldığını belirtmektedir.',4,3),
('f2000010-0000-4000-f200-000000000010','vocabulary','"Yapılandırmacılık" bu bağlamda ne anlama gelir?','["Öğretmenin bilgiyi aktararak öğrencinin pasif aldığı eğitim anlayışı","Bireyin deneyimler aracılığıyla bilgiyi aktif olarak inşa ettiği öğrenme anlayışı","Bilginin kültür ve sosyal etkileşim aracılığıyla aktarılması","Davranışçı pekiştirme ilkelerine dayanan öğretim"]'::jsonb,1,'Yapılandırmacılık, Piaget''nin kuramından beslenen ve öğrencinin bilgiyi pasif almak yerine aktif biçimde inşa ettiğini savunan eğitim yaklaşımını ifade eder.',4,4),
('f2000010-0000-4000-f200-000000000010','inference','Vygotsky''nin yakınsal gelişim alanı kavramının Piaget''nin kuramını tamamladığından ne çıkarılabilir?','["Piaget''nin kuramı tamamen yanlıştır","Bilişsel gelişim yalnızca bireysel süreçlerle değil sosyal etkileşimle de biçimlenir","Kültürün bilişsel gelişim üzerinde hiçbir etkisi yoktur","İki kuram birbirine tamamen zıttır ve uzlaşı mümkün değildir"]'::jsonb,1,'Metin, Vygotsky''nin sosyal etkileşim ve dil aracılığıyla gelişen bilişsel kapasiteye odaklandığını belirtmektedir; bu, Piaget''nin bireysel gelişim vurgusunu sosyal boyutla tamamladığına işaret eder.',4,5);

  RAISE NOTICE '054: AYT Felsefe+Psikoloji 10 metin + 50 soru basariyla eklendi.';
END;
$migration$;
