DO $migration$
BEGIN

-- Idempotency check
IF (SELECT COUNT(*) FROM text_library WHERE category = 'YDS Okuma') > 0 THEN
  RAISE NOTICE '055: YDS Okuma content already exists, skipping.';
  RETURN;
END IF;

-- ============================================================
-- TEXT 1: The Role of Artificial Intelligence in Modern Healthcare
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000001-0000-4000-aa00-000000000001',
  'The Role of Artificial Intelligence in Modern Healthcare',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$Artificial intelligence is fundamentally transforming the landscape of modern healthcare, offering unprecedented opportunities to improve patient outcomes, streamline clinical workflows, and reduce the overall burden on healthcare systems worldwide. Over the past decade, machine learning algorithms and deep neural networks have demonstrated remarkable capabilities in diagnosing diseases with an accuracy that often rivals or surpasses that of experienced clinicians. This technological revolution is not merely a futuristic prospect but a present reality that is already reshaping how physicians, nurses, and other healthcare professionals approach patient care.

One of the most significant applications of artificial intelligence in healthcare is in medical imaging and diagnostics. Convolutional neural networks, a class of deep learning models, have been trained on millions of medical images to detect conditions such as diabetic retinopathy, lung cancer, skin lesions, and cardiovascular abnormalities. In several landmark studies, these AI systems have matched or exceeded the diagnostic performance of board-certified radiologists and dermatologists, raising important questions about the future role of human specialists in an increasingly automated medical environment.

Beyond diagnostics, artificial intelligence is playing a growing role in drug discovery and development. Traditional pharmaceutical research is an extraordinarily time-consuming and expensive process, often taking more than a decade and costing billions of dollars to bring a single new medication to market. AI-powered platforms can analyze vast chemical databases, predict molecular interactions, and identify promising drug candidates in a fraction of the time required by conventional methods. During the COVID-19 pandemic, AI tools accelerated vaccine development timelines and helped identify existing medications that could be repurposed for treating the disease.

Predictive analytics represents another domain where artificial intelligence is delivering substantial benefits. By analyzing electronic health records, genetic data, lifestyle factors, and environmental variables, AI systems can identify patients who are at high risk of developing serious conditions such as sepsis, heart failure, or diabetes. Early identification enables clinicians to intervene proactively, potentially preventing hospitalizations and saving lives. Hospitals that have implemented such predictive tools have reported measurable reductions in adverse patient events and associated healthcare costs.

However, the integration of artificial intelligence into healthcare is not without significant challenges. Concerns about algorithmic bias are particularly pressing, as AI systems trained predominantly on data from certain demographic groups may perform poorly when applied to underrepresented populations, potentially exacerbating existing health disparities. Data privacy is another critical issue, given the highly sensitive nature of medical information and the risk of unauthorized access or misuse. Additionally, questions of accountability and liability remain unresolved when AI-assisted decisions contribute to adverse patient outcomes.

The regulatory landscape for medical AI is also evolving rapidly. Agencies such as the United States Food and Drug Administration have begun developing frameworks to evaluate and approve AI-based medical devices, but the pace of technological innovation frequently outstrips the capacity of regulatory bodies to keep up. Ensuring that AI tools are rigorously validated, transparently documented, and continuously monitored after deployment is essential to maintaining patient safety and public trust. The future of AI in healthcare will ultimately depend on striking the right balance between technological innovation and ethical responsibility.$b$,
  ARRAY['yapay zeka','sağlık','tanı','makine öğrenmesi','ilaç keşfi'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000001-0000-4000-aa00-000000000001', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Yapay zekanın modern sağlık hizmetlerini dönüştürdeki rolü ve sunduğu fırsatlar ile zorluklar","Derin öğrenme algoritmalarının tıbbi görüntüleme alanındaki teknik gelişimi","COVID-19 pandemisinde yapay zekanın aşı geliştirme sürecine katkıları","Elektronik sağlık kayıtlarının veri gizliliği üzerindeki olumsuz etkileri"]'::jsonb,
  0,
  'Metin, yapay zekanın sağlık hizmetlerini nasıl dönüştürdüğünü, fırsatlarını ve zorluklarını kapsamlı biçimde ele almaktadır.',
  4, 1
),
(
  'aa000001-0000-4000-aa00-000000000001', 'detail',
  'Metne göre, konvolüsyonel sinir ağları hangi alanda uzman hekimlerle kıyaslanabilir başarım göstermiştir?',
  '["İlaç keşfi ve moleküler etkileşim tahmini","Tıbbi görüntülerin analizi ve hastalık teşhisi","Elektronik sağlık kayıtlarının tutulması","Ameliyat süreçlerinin otomatikleştirilmesi"]'::jsonb,
  1,
  'Metin, konvolüsyonel sinir ağlarının tıbbi görüntülerde radyolog ve dermatologlarla boy ölçüşebildiğini belirtmektedir.',
  4, 2
),
(
  'aa000001-0000-4000-aa00-000000000001', 'vocabulary',
  'Metinde geçen "exacerbating" kelimesinin Türkçe karşılığı aşağıdakilerden hangisidir?',
  '["Hafifletmek","Çözmek","Kötüleştirmek / şiddetlendirmek","Engellemek"]'::jsonb,
  2,
  '"Exacerbating" kelimesi mevcut eşitsizlikleri daha da kötüleştirme bağlamında kullanılmıştır.',
  4, 3
),
(
  'aa000001-0000-4000-aa00-000000000001', 'detail',
  'Metne göre, ilaç keşfinde yapay zekanın geleneksel yöntemlere göre en önemli avantajı nedir?',
  '["Klinik deneylerde gönüllü hasta sayısını artırması","Aday ilaçları çok daha kısa sürede belirleyebilmesi","Düzenleyici onay süreçlerini tamamen ortadan kaldırması","Yan etkilerin tamamen önüne geçebilmesi"]'::jsonb,
  1,
  'Metin, yapay zekanın ilaç adaylarını geleneksel yöntemlerin çok daha kısa süresinde saptayabildiğini vurgulamaktadır.',
  4, 4
),
(
  'aa000001-0000-4000-aa00-000000000001', 'inference',
  'Metinden çıkarılabilecek en mantıklı sonuç aşağıdakilerden hangisidir?',
  '["Yapay zeka yakın gelecekte tüm sağlık profesyonellerinin yerini alacaktır","Yapay zekanın sağlıktaki başarısı yalnızca teknik ilerlemeye değil etik sorumluluğa da bağlıdır","Düzenleyici kurumlar yapay zeka teknolojisinin önündeki en büyük engeldir","Algoritmik önyargı sorunu tamamen çözülmüş durumdadır"]'::jsonb,
  1,
  'Metin, teknolojik ilerleme ile etik sorumluluk arasındaki dengeye sürekli vurgu yapmaktadır.',
  4, 5
);


-- ============================================================
-- TEXT 2: Climate Change and Biodiversity Loss
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000002-0000-4000-aa00-000000000002',
  'Climate Change and Biodiversity Loss: A Global Crisis',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$The intersection of climate change and biodiversity loss represents one of the most pressing environmental crises of the twenty-first century. Scientists increasingly recognize that these two phenomena are deeply intertwined, each amplifying the effects of the other in ways that threaten the stability of ecosystems that human civilization depends upon. While individual species extinctions have occurred throughout Earth''s geological history, the current rate of biodiversity loss is estimated to be between one hundred and one thousand times the natural background rate, leading many researchers to characterize the present moment as the sixth mass extinction event in the planet''s history.

Climate change acts as a powerful driver of biodiversity loss through multiple pathways. Rising temperatures are shifting the geographic ranges of countless species, forcing them to migrate toward higher latitudes or elevations in search of suitable habitat. For species already living at the tops of mountains or in polar regions, further upward movement is simply not possible, making local extinction inevitable. Ocean warming and acidification, caused by the absorption of excess carbon dioxide, are bleaching coral reefs at an alarming rate and disrupting marine food webs that support billions of people worldwide.

Phenological mismatches represent a particularly insidious consequence of climate change for biodiversity. Many species have evolved intricate timing relationships with one another, such as flowering plants and their pollinators, or migratory birds and the insects that provide their food upon arrival. As warming causes these events to occur at different times for different species, the synchrony that sustained these ecological relationships breaks down, with cascading consequences for entire food webs. Research has documented numerous cases where such mismatches are already reducing the reproductive success of affected species.

Conversely, biodiversity loss itself exacerbates climate change by undermining the capacity of ecosystems to sequester carbon. Forests, wetlands, and ocean phytoplankton play a critical role in the global carbon cycle, absorbing carbon dioxide from the atmosphere and storing it in biomass and soils. When these ecosystems are degraded or destroyed, the carbon they have stored is released back into the atmosphere, accelerating warming. The destruction of the Amazon rainforest, often called the lungs of the Earth, is a stark illustration of how deforestation simultaneously eliminates biodiversity and contributes to climate change.

Addressing these twin crises requires coordinated action at both the global and local levels. The Kunming-Montreal Global Biodiversity Framework, adopted in 2022, set ambitious targets for protecting thirty percent of the Earth''s land and oceans by 2030. Achieving these targets will require substantial financial commitments from wealthy nations, the integration of biodiversity considerations into economic decision-making, and the recognition of indigenous communities as stewards of much of the world''s remaining biodiversity. Furthermore, transitioning to renewable energy sources and dramatically reducing greenhouse gas emissions is essential to limiting the temperature increases that are driving species toward extinction.

The window of opportunity for meaningful action is narrowing rapidly. Each year of delay allows further habitat destruction, further temperature rise, and further erosion of the natural systems that underpin human well-being. The choices made by governments, corporations, and individuals over the next decade will largely determine whether future generations inherit a planet teeming with life or one impoverished by our collective failure to act.$b$,
  ARRAY['iklim değişikliği','biyoçeşitlilik','nesil tükenmesi','ekosistem','karbon'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000002-0000-4000-aa00-000000000002', 'main_idea',
  'Bu metnin ana fikri aşağıdakilerden hangisidir?',
  '["İklim değişikliği ile biyoçeşitlilik kaybının birbirini güçlendiren ve acil eylem gerektiren küresel krizler olduğu","Amazon yağmur ormanlarının yok edilmesinin iklim üzerindeki olumsuz etkileri","Kyoto Protokolü''nün biyoçeşitlilik korumasına sağladığı katkılar","Okyanus asitlenmesinin mercan resiflerine verdiği zararın boyutları"]'::jsonb,
  0,
  'Metin boyunca iklim değişikliği ve biyoçeşitlilik kaybının karşılıklı ilişkisi ve küresel eylem gerekliliği işlenmektedir.',
  4, 1
),
(
  'aa000002-0000-4000-aa00-000000000002', 'detail',
  'Metne göre "fenolojik uyumsuzluk" (phenological mismatch) nedir?',
  '["Farklı türlerin aynı habitatta rekabete girmesi","Türlerin iklim değişikliği nedeniyle göç rotalarını değiştirmesi","Birbirine bağımlı türlerin yaşam döngüsü zamanlamalarının senkronizasyonunun bozulması","Okyanus sıcaklığının artmasıyla mercanların beyazlaması"]'::jsonb,
  2,
  'Metin, fenolojik uyumsuzluğu; bitkiler ile tozlayıcılar gibi ekolojik ilişkilerdeki zamanlama senkronunun bozulması olarak tanımlamaktadır.',
  4, 2
),
(
  'aa000002-0000-4000-aa00-000000000002', 'vocabulary',
  'Metinde geçen "sequester" kelimesinin bu bağlamdaki anlamı nedir?',
  '["Serbest bırakmak","Yaymak","Depolamak / tutmak","Dönüştürmek"]'::jsonb,
  2,
  '"Sequester carbon" ifadesi karbonun atmosferden alınarak depolanması anlamında kullanılmıştır.',
  4, 3
),
(
  'aa000002-0000-4000-aa00-000000000002', 'detail',
  'Metne göre Kunming-Montreal Küresel Biyoçeşitlilik Çerçevesi hangi hedefi belirlemektedir?',
  '["2030 yılına kadar sera gazı emisyonlarını sıfıra indirmek","2030 yılına kadar Dünya''nın kara ve okyanuslarının yüzde otuzunu koruma altına almak","Amazon yağmur ormanlarının tamamını uluslararası denetim altına almak","Zengin ülkelerin biyoçeşitlilik fonuna yüz milyar dolar katkı sağlaması"]'::jsonb,
  1,
  'Metin, çerçevenin 2030''a kadar karaların ve okyanusların %30''unun korunması hedefini benimsediğini açıkça belirtmektedir.',
  4, 4
),
(
  'aa000002-0000-4000-aa00-000000000002', 'inference',
  'Metnin son paragrafından çıkarılabilecek en uygun çıkarım hangisidir?',
  '["Biyoçeşitlilik kaybı artık durdurulamaz bir hal almıştır","Hükümetler tek başına çözüm üretebilecek kapasitededir","Önümüzdeki on yılda alınacak kararlar gelecek nesillerin doğal mirasını belirleyecektir","İklim değişikliğiyle mücadelede en etkili yöntem bireylerin tüketim alışkanlıklarını değiştirmesidir"]'::jsonb,
  2,
  'Son paragraf, önümüzdeki on yılın kararlarının kritik önemine açıkça dikkat çekmektedir.',
  4, 5
);


-- ============================================================
-- TEXT 3: The Neuroscience of Memory Formation and Retrieval
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000003-0000-4000-aa00-000000000003',
  'The Neuroscience of Memory Formation and Retrieval',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$Memory is one of the most fundamental cognitive functions of the human brain, enabling individuals to retain information about past experiences and use that knowledge to guide future behavior. Far from being a single unified system, memory comprises multiple distinct processes and neural structures that work in concert to encode, consolidate, store, and retrieve information. Understanding the neuroscience of memory has profound implications not only for basic science but also for the treatment of conditions such as Alzheimer''s disease, post-traumatic stress disorder, and age-related cognitive decline.

The process of memory formation begins with encoding, the initial registration of information in the nervous system. When a person experiences an event, sensory information is processed in specialized cortical areas and relayed to the hippocampus, a seahorse-shaped structure located deep within the medial temporal lobe. The hippocampus plays a pivotal role in binding together the disparate elements of an experience into a coherent memory trace. Research using functional neuroimaging has shown that the depth of hippocampal activation during encoding is a strong predictor of whether a memory will be successfully retained.

Consolidation is the process by which newly formed memories are stabilized and transformed from a fragile, labile state into a more durable form. This occurs through two distinct mechanisms: synaptic consolidation, which takes place within hours of learning and involves changes in the strength of synaptic connections between neurons, and systems consolidation, which unfolds over weeks, months, or even years and involves a gradual transfer of memory storage from the hippocampus to the neocortex. Sleep plays a critical role in this latter process, as slow-wave sleep and rapid eye movement sleep are both associated with the reactivation and integration of newly acquired memories.

Retrieval, the process of bringing stored information back into conscious awareness, is not merely a passive readout of stored traces but an active reconstructive process. Each time a memory is retrieved, it enters a temporary state of vulnerability and must be reconsolidated before it can be stored again. This phenomenon of reconsolidation has important implications for therapeutic interventions aimed at modifying traumatic memories. By introducing new information during the reconsolidation window, it may be possible to update or weaken maladaptive emotional associations linked to traumatic experiences.

The molecular mechanisms underlying memory formation involve complex cascades of intracellular signaling events that ultimately lead to changes in gene expression and protein synthesis. Long-term potentiation, a persistent strengthening of synaptic transmission following repeated stimulation, is widely regarded as the primary cellular mechanism of learning and memory. The NMDA receptor, a type of glutamate receptor, serves as a molecular coincidence detector that initiates the signaling cascades leading to long-term potentiation when both pre-synaptic and post-synaptic neurons are simultaneously active.

Disruptions to memory processes underlie a range of neurological and psychiatric disorders. In Alzheimer''s disease, the progressive accumulation of amyloid plaques and neurofibrillary tangles leads to widespread neuronal death, beginning in the hippocampus and entorhinal cortex before spreading to encompass most of the neocortex. Early interventions targeting these pathological processes may hold the key to preserving cognitive function in aging populations. Advances in our understanding of memory neuroscience continue to offer new targets for therapeutic development and new insights into what it means to be a remembering creature.$b$,
  ARRAY['bellek','nörobilim','hipokampus','konsolidasyon','öğrenme'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000003-0000-4000-aa00-000000000003', 'main_idea',
  'Bu metnin temel konusu aşağıdakilerden hangisidir?',
  '["Belleğin nörobilimsel temelleri: kodlama, pekiştirme, depolama ve geri çağırma süreçleri","Alzheimer hastalığının tedavisinde kullanılan farmakolojik yöntemler","Uykunun öğrenme sürecine etkisi ve pratik önerileri","NMDA reseptörlerinin sinaptik iletim üzerindeki moleküler etkileri"]'::jsonb,
  0,
  'Metin, belleğin oluşumu ve geri çağrılmasının nörobilimsel mekanizmalarını bütünsel biçimde ele almaktadır.',
  4, 1
),
(
  'aa000003-0000-4000-aa00-000000000003', 'detail',
  'Metne göre, hafıza konsolidasyonunda uykunun rolü nedir?',
  '["Yeni anıların silinmesini engellemek","Yavaş dalga uykusu ve REM uykusu aracılığıyla yeni edinilen anıların yeniden etkinleştirilmesi ve entegrasyonunu sağlamak","Hipokampüsteki nöron bağlantılarını kalıcı olarak güçlendirmek","Amigdalanın duygusal tepkilerini baskılamak"]'::jsonb,
  1,
  'Metin, uykunun yeni anıların yeniden etkinleştirilmesi ve entegrasyonunu desteklediğini açıkça belirtmektedir.',
  4, 2
),
(
  'aa000003-0000-4000-aa00-000000000003', 'vocabulary',
  'Metinde geçen "labile" kelimesinin bu bağlamdaki anlamı hangisidir?',
  '["Kalıcı ve sağlam","Kırılgan ve değişmeye açık","Bilinçdışı ve otomatik","Yapısal ve moleküler"]'::jsonb,
  1,
  '"Labile" kelimesi, yeni oluşan anıların başlangıçta kararsız ve değişmeye açık olduğunu ifade etmektedir.',
  4, 3
),
(
  'aa000003-0000-4000-aa00-000000000003', 'detail',
  'Metne göre, uzun süreli potansiyasyon (LTP) nedir?',
  '["Tekrarlayan uyarım sonrası sinaptik iletimin kalıcı olarak güçlenmesi","Hipokampüsten neokortekse hafıza transferinin moleküler mekanizması","Travmatik anıların yeniden pekiştirilmesi sürecinde ortaya çıkan sinirsel aktivite","Amyloid plaklarının birikimini engelleyen hücresel bir savunma mekanizması"]'::jsonb,
  0,
  'Metin LTP''yi, tekrarlayan uyarım sonucu sinaptik iletimdeki kalıcı güçlenme olarak tanımlamaktadır.',
  4, 4
),
(
  'aa000003-0000-4000-aa00-000000000003', 'inference',
  'Yeniden pekiştirme (reconsolidation) fenomeni hakkında metinden çıkarılabilecek en uygun sonuç nedir?',
  '["Anılar bir kez geri çağrıldığında kalıcı olarak değiştirilemez hale gelir","Geri çağırma sırasında anıların savunmasız kalmasından yararlanarak travmatik anılar terapötik amaçla değiştirilebilir","Yeniden pekiştirme yalnızca deklaratif bellekte gerçekleşir","Travmatik anıların güçlenmesini önlemenin tek yolu uyku deprivasyonudur"]'::jsonb,
  1,
  'Metin, yeniden pekiştirme penceresinde yeni bilgi sunularak maladaptif duygusal çağrışımların zayıflatılabileceğini belirtmektedir.',
  4, 5
);


-- ============================================================
-- TEXT 4: Renewable Energy Transitions
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000004-0000-4000-aa00-000000000004',
  'Renewable Energy Transitions: Challenges and Opportunities',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$The global transition to renewable energy sources represents one of the most consequential economic and technological transformations of the twenty-first century. Driven by the urgent need to reduce greenhouse gas emissions and mitigate the worst effects of climate change, nations around the world are investing unprecedented sums in solar, wind, hydroelectric, and other forms of clean energy. The falling costs of renewable technologies, particularly solar photovoltaic panels and wind turbines, have made clean energy increasingly competitive with fossil fuels, fundamentally altering the economics of electricity generation and accelerating the pace of the energy transition.

Solar energy has experienced particularly dramatic cost reductions over the past two decades. The price of solar photovoltaic modules has fallen by more than ninety percent since 2010, driven by advances in manufacturing efficiency, economies of scale, and improvements in panel technology. In many regions of the world, utility-scale solar is now the cheapest source of new electricity generation, undercutting even natural gas and coal. Rooftop solar installations have become increasingly accessible to households and businesses, enabling distributed generation and empowering consumers to become active participants in the energy system.

Wind energy, both onshore and offshore, has similarly emerged as a major component of the global electricity mix. Offshore wind, in particular, offers substantial advantages over its onshore counterpart, including stronger and more consistent wind speeds, greater proximity to densely populated coastal areas, and reduced visual and noise impacts. The development of floating offshore wind platforms is opening up vast areas of deep ocean to energy production, potentially unlocking enormous new renewable resources. Countries such as Denmark, the United Kingdom, and China are leading the offshore wind revolution and exporting their expertise globally.

Despite this remarkable progress, the energy transition faces significant challenges that must be addressed to achieve a fully decarbonized electricity system. The intermittency of solar and wind power, which generate electricity only when the sun shines and the wind blows, poses fundamental challenges for grid stability and reliability. Addressing this challenge requires substantial investments in energy storage technologies, particularly batteries, as well as improvements in grid interconnection, demand response programs, and long-distance transmission infrastructure.

The social dimensions of the energy transition are equally important and often underappreciated. Communities that have historically depended on fossil fuel industries for employment and economic activity face severe disruptions as coal mines, oil refineries, and gas power plants are phased out. Ensuring a just transition that provides retraining opportunities, economic diversification, and targeted support for affected communities is essential to maintaining public acceptance of the energy transition and preventing the kind of political backlash that can derail progress.

International cooperation is also indispensable for accelerating the global energy transition. Developing countries, which bear a disproportionate share of climate change impacts while having contributed least to historical emissions, require substantial financial and technical assistance to build the renewable energy infrastructure they need. The Green Climate Fund and other international mechanisms provide some support, but the scale of financing available falls far short of what is needed. Closing this gap will be one of the defining challenges of international climate diplomacy in the years ahead.$b$,
  ARRAY['yenilenebilir enerji','güneş enerjisi','rüzgar enerjisi','enerji dönüşümü','karbon emisyonu'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000004-0000-4000-aa00-000000000004', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Yenilenebilir enerjiye geçişin sunduğu fırsatlar ve bu geçişin önündeki zorluklar","Güneş paneli üretimindeki teknolojik gelişmelerin ekonomik boyutu","Fosil yakıt sektöründe çalışanların yeniden istihdam sorunları","Uluslararası iklim diplomatisinin tarihsel gelişimi"]'::jsonb,
  0,
  'Metin, yenilenebilir enerjiye geçişi kapsamlı biçimde ele alarak hem fırsatları hem de teknik, sosyal ve uluslararası zorlukları incelemektedir.',
  4, 1
),
(
  'aa000004-0000-4000-aa00-000000000004', 'detail',
  'Metne göre açık deniz rüzgar enerjisinin kara rüzgar enerjisine kıyasla avantajları nelerdir?',
  '["Kurulum maliyetlerinin düşüklüğü ve düzenleyici onay süreçlerinin hızlılığı","Daha güçlü ve tutarlı rüzgar hızları, yoğun nüfus merkezlerine yakınlık ve daha az görsel etki","Enerji depolama teknolojileriyle entegrasyonunun kolaylığı","Mevcut şebeke altyapısıyla doğrudan uyumluluk"]'::jsonb,
  1,
  'Metin, açık deniz rüzgar enerjisinin daha güçlü rüzgarlar, kıyı kentlerine yakınlık ve azaltılmış görsel/gürültü etkisi gibi avantajlarını saymaktadır.',
  4, 2
),
(
  'aa000004-0000-4000-aa00-000000000004', 'vocabulary',
  'Metinde geçen "intermittency" kelimesinin Türkçe karşılığı aşağıdakilerden hangisidir?',
  '["Süreklilik","Kesintisizlik","Aralıklılık / düzensiz üretim","Verimliliği düşürme"]'::jsonb,
  2,
  '"Intermittency", güneş ve rüzgar enerjisinin yalnızca belirli koşullarda üretim yapmasını, yani aralıklı/düzensiz üretimini ifade etmektedir.',
  4, 3
),
(
  'aa000004-0000-4000-aa00-000000000004', 'detail',
  'Metne göre güneş fotovoltaik modüllerinin maliyeti 2010''dan bu yana ne kadar değişmiştir?',
  '["Yüzde elli azalmıştır","Yüzde yetmiş azalmıştır","Yüzde doksandan fazla azalmıştır","Yüzde yüz yirmi artmıştır"]'::jsonb,
  2,
  'Metin, güneş PV modül fiyatlarının 2010''dan bu yana %90''dan fazla düştüğünü açıkça belirtmektedir.',
  4, 4
),
(
  'aa000004-0000-4000-aa00-000000000004', 'inference',
  'Metnin "adil geçiş" (just transition) kavramından çıkarılabilecek en uygun sonuç hangisidir?',
  '["Fosil yakıt şirketleri yenilenebilir enerjiye geçişi finanse etmelidir","Etkilenen topluluklara yönelik destek sağlanmadan enerji dönüşümü siyasi dirençle karşılaşabilir","Kömür madencilerinin yeniden eğitim programlarına katılımı zorunlu tutulmalıdır","Gelişmekte olan ülkeler enerji dönüşümünden muaf tutulmalıdır"]'::jsonb,
  1,
  'Metin, topluluklara destek verilmeden gerçekleşen dönüşümün siyasi tepkilere yol açabileceğini vurgulamaktadır.',
  4, 5
);


-- ============================================================
-- TEXT 5: The Psychology of Decision Making Under Uncertainty
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000005-0000-4000-aa00-000000000005',
  'The Psychology of Decision Making Under Uncertainty',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$Human beings make thousands of decisions every day, ranging from trivial choices about what to eat for breakfast to consequential judgments about careers, relationships, and financial investments. For much of the twentieth century, economists and social scientists assumed that people made decisions by carefully weighing the costs and benefits of available options and selecting the one that maximized their expected utility. This rational actor model, elegant in its simplicity, has proven to be a powerful tool for predicting aggregate behavior in certain contexts, yet it fails to capture the systematic and predictable ways in which real human decision-making deviates from pure rationality.

The field of behavioral economics, pioneered by psychologists Daniel Kahneman and Amos Tversky, has documented numerous cognitive biases and heuristics that shape human judgment under conditions of uncertainty. One of their most influential contributions was prospect theory, which describes how people evaluate potential losses and gains. A central finding of this research is that losses loom larger than equivalent gains in the psychological landscape: losing one hundred dollars feels roughly twice as painful as gaining one hundred dollars feels pleasurable. This asymmetry, known as loss aversion, has far-reaching implications for understanding financial behavior, insurance decisions, and policy design.

Anchoring is another pervasive cognitive bias that influences judgment under uncertainty. When people are asked to estimate an unknown quantity, they tend to rely heavily on the first piece of information they encounter, or the anchor, and adjust insufficiently from that starting point. Experiments have demonstrated that even arbitrary numbers, such as the last two digits of a participant''s social security number, can significantly influence their estimates of unrelated quantities. This phenomenon has important implications for negotiation, pricing, and legal proceedings, where the framing of initial offers or recommendations can profoundly shape final outcomes.

The availability heuristic describes the tendency to judge the likelihood of an event based on how easily examples come to mind. Events that are vivid, recent, or emotionally salient are perceived as more probable than they actually are, while mundane but statistically more common events may be underestimated. This heuristic helps explain why people often overestimate the risks of dramatic events such as plane crashes or terrorist attacks while underestimating more prevalent dangers such as cardiovascular disease or diabetes. Media coverage, which disproportionately focuses on sensational events, amplifies this bias.

Overconfidence represents one of the most robust and consequential cognitive biases documented in the psychological literature. Studies across diverse populations and domains consistently find that people overestimate the accuracy of their knowledge and the likelihood that their predictions will prove correct. Entrepreneurs overestimate their chances of business success, investors overestimate their ability to outperform the market, and medical professionals sometimes overestimate their diagnostic accuracy. Understanding and mitigating overconfidence is therefore of considerable practical importance for a wide range of high-stakes decision-making contexts.

Research on decision-making under uncertainty has also revealed important insights about how emotional states influence judgment. The somatic marker hypothesis, proposed by neuroscientist Antonio Damasio, suggests that emotions play an indispensable role in guiding rational decision-making by providing rapid, intuitive signals about the likely consequences of different courses of action. Patients with damage to the ventromedial prefrontal cortex, who struggle to generate emotional responses, often make systematically poor decisions despite retaining normal levels of general intelligence, suggesting that reason and emotion are partners rather than adversaries in effective decision-making.$b$,
  ARRAY['karar verme','bilişsel önyargı','davranışsal ekonomi','belirsizlik','kayıp kaçınımı'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000005-0000-4000-aa00-000000000005', 'main_idea',
  'Bu metnin ana konusu aşağıdakilerden hangisidir?',
  '["Belirsizlik altında insan kararlarını etkileyen bilişsel önyargılar ve psikolojik mekanizmalar","Rasyonel aktör modelinin ekonomik tahminlerdeki üstünlüğü","Daniel Kahneman ve Amos Tversky''nin Nobel ödülüne katkıları","Duygusal zeka ile karar verme kalitesi arasındaki ilişki"]'::jsonb,
  0,
  'Metin, insan karar vermesini şekillendiren bilişsel önyargıları sistematik biçimde ele almaktadır.',
  4, 1
),
(
  'aa000005-0000-4000-aa00-000000000005', 'detail',
  'Metne göre "kayıp kaçınımı" (loss aversion) ne anlama gelir?',
  '["İnsanların belirsiz durumlardan her zaman kaçınma eğiliminde olması","Kayıpların psikolojik olarak eşdeğer kazançlardan yaklaşık iki kat daha ağır hissettirmesi","Yatırımcıların zarar eden hisselerini elinde tutma eğilimi","Bireylerin risk almaktan kaçınarak düşük getiri kabul etmesi"]'::jsonb,
  1,
  'Metin, 100 dolar kaybetmenin 100 dolar kazanmaktan yaklaşık iki kat daha acı verici hissettirdiğini açıkça belirtmektedir.',
  4, 2
),
(
  'aa000005-0000-4000-aa00-000000000005', 'vocabulary',
  'Metinde geçen "heuristic" kelimesinin bu bağlamdaki en uygun Türkçe karşılığı nedir?',
  '["Sistematik analiz","Sezgisel kısa yol / pratik yargılama kuralı","Olasılıksal model","Normatif çerçeve"]'::jsonb,
  1,
  '"Heuristic", karmaşık problemleri çözmek için kullanılan sezgisel zihinsel kısa yolları ifade etmektedir.',
  4, 3
),
(
  'aa000005-0000-4000-aa00-000000000005', 'detail',
  'Metne göre erişilebilirlik sezgisi (availability heuristic) hangi olguyu açıklamaktadır?',
  '["İnsanların ilk karşılaştıkları bilgiye aşırı ağırlık vermesi","Canlı ya da duygusal açıdan çarpıcı olayların gerçekte olduğundan daha olası görünmesi","Aşırı güven önyargısının girişimcilerin başarısızlık oranını artırması","Duygusal durumların mantıklı kararları olumsuz etkilemesi"]'::jsonb,
  1,
  'Metin, erişilebilirlik sezgisinin çarpıcı olayların olasılığını abartmaya yol açtığını belirtmektedir.',
  4, 4
),
(
  'aa000005-0000-4000-aa00-000000000005', 'inference',
  'Damasio''nun somatik işaretçi hipotezi hakkında metinden çıkarılabilecek en uygun sonuç hangisidir?',
  '["Duygular rasyonel karar vermeyi her zaman olumsuz etkiler","Akıl ve duygu, etkili karar vermede birbirini tamamlayan ortaklardır","Ventromedial prefrontal kortekse verilen hasar zekayı doğrudan azaltır","Duygusal zeka genel zekadan daha önemlidir"]'::jsonb,
  1,
  'Metin, duyguların rasyonel karar vermede vazgeçilmez olduğunu ve akıl ile duygunun karşı değil ortak olduğunu vurgulamaktadır.',
  4, 5
);


-- ============================================================
-- TEXT 6: Urbanization and Its Effects on Mental Health
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000006-0000-4000-aa00-000000000006',
  'Urbanization and Its Effects on Mental Health',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$For the first time in human history, more than half of the world''s population now lives in urban areas, a proportion that is expected to reach two-thirds by 2050. This unprecedented shift toward urban living has brought enormous economic opportunities, cultural richness, and access to services that were previously unavailable to rural populations. Yet it has also given rise to a distinct set of challenges for human well-being, particularly in the domain of mental health. A growing body of research suggests that urban environments are associated with elevated rates of anxiety, depression, schizophrenia, and other psychiatric disorders, raising important questions about the psychological costs of modern city life.

The relationship between urbanicity and mental health is mediated by a complex array of social, environmental, and biological factors. Social fragmentation, characterized by weak community bonds, anonymity, and limited social support networks, is consistently identified as a key risk factor for poor mental health in urban settings. The density and diversity of urban populations, while offering some social advantages, can also intensify feelings of isolation and alienation, particularly among newly arrived migrants and other socially marginalized groups. Loneliness, now recognized as a significant public health concern, is paradoxically more prevalent in densely populated cities than in rural areas.

Environmental stressors unique to urban settings also contribute to mental health burdens. Chronic noise pollution from traffic, construction, and nightlife disrupts sleep, elevates stress hormones, and impairs concentration, with demonstrable effects on mood and cognitive performance. Air pollution, primarily from vehicle emissions and industrial sources, has been linked not only to respiratory and cardiovascular disease but also to neuroinflammation and an elevated risk of depression and dementia. Green space deprivation, the lack of access to parks, gardens, and natural environments, further compounds these effects by denying urban residents the restorative benefits of nature contact.

Neurobiological research has illuminated some of the mechanisms through which urban environments influence brain function. Studies using neuroimaging have found that amygdala reactivity, a measure of threat sensitivity, is elevated in city dwellers compared to rural residents, and that this difference is proportional to the size of the city in which participants were raised. This finding suggests that early urban experience may calibrate the brain''s stress response systems in ways that persist into adulthood, potentially contributing to the elevated rates of anxiety and mood disorders observed in urban populations.

Urban planning and design have an important role to play in mitigating the mental health impacts of city life. The creation and maintenance of high-quality green spaces, the reduction of traffic noise and air pollution through zoning and emission standards, the design of neighborhoods that foster social interaction and community cohesion, and the provision of affordable housing that prevents overcrowding are all evidence-based interventions with documented mental health benefits. The concept of the fifteen-minute city, which aims to ensure that all residents have access to essential services, social amenities, and green spaces within a fifteen-minute walk or bicycle ride, has gained considerable traction as an urban planning paradigm that places human well-being at its center.

Addressing the mental health consequences of urbanization ultimately requires a whole-of-government approach that integrates public health, urban planning, housing, transportation, and social policy. The scale and urgency of the challenge demand not only incremental improvements to existing urban environments but also a fundamental rethinking of how cities are designed, governed, and experienced by their inhabitants.$b$,
  ARRAY['kentleşme','ruh sağlığı','şehir yaşamı','sosyal izolasyon','çevre kirliliği'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000006-0000-4000-aa00-000000000006', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Kentleşmenin ruh sağlığı üzerindeki olumsuz etkileri ve bu etkileri azaltmaya yönelik yaklaşımlar","Büyük şehirlerde hava kirliliğinin solunum hastalıklarına etkisi","Göç eden bireylerin kentsel uyum süreçleri","On beş dakikalık şehir modelinin ekonomik faydaları"]'::jsonb,
  0,
  'Metin, kentsel yaşamın ruh sağlığı üzerindeki olumsuz etkilerini ve çözüm yaklaşımlarını kapsamlı biçimde ele almaktadır.',
  4, 1
),
(
  'aa000006-0000-4000-aa00-000000000006', 'detail',
  'Metne göre, kentsel ortamların ruh sağlığını olumsuz etkileyen sosyal bir faktör nedir?',
  '["Nüfus yoğunluğunun kültürel çeşitliliği azaltması","Zayıf topluluk bağları, anonimlik ve sınırlı sosyal destek ağlarıyla tanımlanan sosyal parçalanma","Kentlerdeki ekonomik fırsatların rekabeti artırması","Göç yoğunluğunun konut fiyatlarını artırması"]'::jsonb,
  1,
  'Metin, sosyal parçalanmayı kentlerde kötü ruh sağlığının temel risk faktörü olarak tanımlamaktadır.',
  4, 2
),
(
  'aa000006-0000-4000-aa00-000000000006', 'vocabulary',
  'Metinde geçen "amygdala reactivity" ifadesinin Türkçe karşılığı nedir?',
  '["Amigdala küçülmesi","Amigdalanın tehdit uyarılarına verdiği tepkisellik / duyarlılık","Amigdalanın hasar görmesi","Amigdala ile prefrontal korteks arasındaki bağlantı"]'::jsonb,
  1,
  '"Amygdala reactivity", amigdalanın tehdit algısına verdiği tepki düzeyini ifade etmektedir.',
  4, 3
),
(
  'aa000006-0000-4000-aa00-000000000006', 'detail',
  'Metne göre, on beş dakikalık şehir (15-minute city) kavramının temel amacı nedir?',
  '["Şehirlerde toplu taşıma kullanımını artırmak","Tüm sakinlerin temel hizmetlere, sosyal olanaklar ve yeşil alanlara on beş dakika yürüme veya bisikletle ulaşabilmesini sağlamak","Kentsel nüfus yoğunluğunu azaltmak","Yaya ve bisiklet altyapısına yatırım yaparak trafik kirliliğini sona erdirmek"]'::jsonb,
  1,
  'Metin, on beş dakikalık şehir kavramını bu çerçevede açıkça tanımlamaktadır.',
  4, 4
),
(
  'aa000006-0000-4000-aa00-000000000006', 'inference',
  'Metinden çıkarılabilecek en uygun sonuç aşağıdakilerden hangisidir?',
  '["Kırsal alanlarda yaşayan bireyler kentlilerden daha sağlıklıdır","Kentsel ruh sağlığı sorunlarının çözümü tek bir politika alanının sorumluluğu olamaz","Hava kirliliği kentsel ruh sağlığını etkileyen en önemli tek faktördür","Nörobilim araştırmaları kentsel tasarım politikalarını şekillendirmek için yeterlidir"]'::jsonb,
  1,
  'Metin, kentsel ruh sağlığı sorunlarının çözümünün birden fazla politika alanını gerektirdiğini vurgulamaktadır.',
  4, 5
);


-- ============================================================
-- TEXT 7: The Evolution of Language: From Symbols to Speech
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000007-0000-4000-aa00-000000000007',
  'The Evolution of Language: From Symbols to Speech',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$Language is perhaps the most distinctively human of all cognitive capacities, enabling us to communicate complex ideas, transmit cultural knowledge across generations, and construct the rich social worlds that define human civilization. Yet despite its central importance, the evolutionary origins of language remain one of the most fiercely debated questions in all of science. Unlike many other aspects of human evolution, language leaves no direct fossil record, compelling researchers to piece together its history from indirect evidence including comparative anatomy, genetics, archaeology, and the study of animal communication.

The anatomical prerequisites for spoken language include a descended larynx, precise control of the tongue and lips, and a supralaryngeal vocal tract capable of producing the wide range of sounds found in human language. While the soft tissue structures responsible for speech production do not preserve in the fossil record, the shape of the basicranium, the bony base of the skull, provides indirect evidence about the position of the larynx in extinct hominins. Studies of Neanderthal basicranial morphology have suggested that they possessed a vocal tract capable of producing at least some speech sounds, though the extent of their linguistic abilities remains debated.

The genetic underpinnings of language have been illuminated by the discovery of the FOXP2 gene, sometimes called the language gene, although this label is something of a misnomer. Mutations in FOXP2 cause severe difficulties with the coordination of facial movements required for speech, as well as broader language and grammatical impairments. The human version of FOXP2 differs from that of chimpanzees at two key amino acid positions, changes that are estimated to have occurred within the last few hundred thousand years. While FOXP2 is clearly important for speech and language, it is one of hundreds of genes that contribute to these abilities, and the notion that any single gene could explain the emergence of human language is almost certainly an oversimplification.

Archaeological evidence for symbolic thought and language includes the production of ochre-stained shells, perforated beads, and abstract engravings found at African sites dating to approximately one hundred thousand years ago. These artifacts suggest that the cognitive capacities underlying language, including the ability to create and use symbols with arbitrary meanings, may have been present in anatomically modern humans long before they spread out of Africa. The relatively sudden explosion of symbolic culture in Europe around forty thousand years ago, once interpreted as evidence of a late cognitive revolution, is now thought by many researchers to reflect demographic changes rather than a fundamental transformation in human cognitive abilities.

The relationship between language and thought has long been a subject of philosophical and scientific inquiry. The Sapir-Whorf hypothesis, in its strong form, proposes that the language we speak determines the structure of our thoughts, effectively limiting or shaping what we can think about. While the strong version of this hypothesis has been largely discredited, a weaker version suggesting that language influences certain aspects of cognition, such as color perception, spatial reasoning, and number representation, continues to receive empirical support. Languages vary enormously in their grammatical structures, vocabulary, and the distinctions they encode, and these differences may subtly shape the habitual thought patterns of their speakers.

The emergence of written language approximately five thousand years ago in Mesopotamia and independently in several other regions represents a second great revolution in human communication, enabling the transmission of knowledge across vast distances and time spans. Writing transformed not only commerce, governance, and religion but also the very nature of human cognition, creating new possibilities for abstract reasoning, accumulation of knowledge, and the development of scientific thought.$b$,
  ARRAY['dil evrimi','FOXP2','sembollük','insan evrimi','nörobilim'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000007-0000-4000-aa00-000000000007', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Dilin evrimsel kökenleri ve bu kökenleri aydınlatmaya çalışan farklı kanıt kaynakları","FOXP2 geninin insan dilindeki belirleyici rolü","Neandertallerin konuşma kapasitesine ilişkin paleontolojik kanıtlar","Sapir-Whorf hipotezinin deneysel desteklerinin incelenmesi"]'::jsonb,
  0,
  'Metin, dilin evrimini anatomik, genetik, arkeolojik ve bilişsel kanıtlar çerçevesinde kapsamlı biçimde ele almaktadır.',
  4, 1
),
(
  'aa000007-0000-4000-aa00-000000000007', 'detail',
  'Metne göre FOXP2 geninin önemi nedir?',
  '["Tek başına insan dilinin ortaya çıkışını açıklayan bir gen olması","Konuşma için gerekli yüz hareketi koordinasyonunu etkilemesi ve dil/dilbilgisi bozukluklarına yol açan mutasyonları olması","İnsanlar ile şempanzeler arasındaki en belirgin genetik farklılığı oluşturması","Neandertallerde tamamen bulunmaması nedeniyle dilin ortaya çıkışını sınırlaması"]'::jsonb,
  1,
  'Metin, FOXP2 mutasyonlarının konuşma koordinasyonu ve dil bozukluklarına yol açtığını açıklamaktadır.',
  4, 2
),
(
  'aa000007-0000-4000-aa00-000000000007', 'vocabulary',
  'Metinde geçen "misnomer" kelimesinin Türkçe karşılığı nedir?',
  '["Yanlış adlandırma / yanıltıcı isim","Teknik terim","Bilimsel sınıflandırma","Popüler kavram"]'::jsonb,
  0,
  '"Misnomer", bir şeyin yanlış ya da yanıltıcı biçimde adlandırılması anlamına gelir.',
  4, 3
),
(
  'aa000007-0000-4000-aa00-000000000007', 'detail',
  'Metne göre Avrupa''da yaklaşık kırk bin yıl önce görülen sembolik kültür patlaması günümüz araştırmacıları tarafından nasıl yorumlanmaktadır?',
  '["İnsan bilişsel kapasitelerinde geç gerçekleşen temel bir dönüşümün kanıtı","Homo sapiens ile Neandertallerin ilk kez karşılaşmasının sonucu","Demografik değişiklikleri yansıttığı, temel bilişsel kapasitelerde köklü bir dönüşümü değil","FOXP2 geninin son biçimini kazanmasıyla eş zamanlı bir gelişme"]'::jsonb,
  2,
  'Metin, bu patlamanın artık demografik değişiklikleri yansıttığının düşünüldüğünü belirtmektedir.',
  4, 4
),
(
  'aa000007-0000-4000-aa00-000000000007', 'inference',
  'Dilin kökenine ilişkin araştırmalar hakkında metinden çıkarılabilecek en uygun sonuç nedir?',
  '["Dilin evrimi tamamen çözüme kavuşturulmuş bir bilimsel sorundur","Fosil kayıt yetersizliği nedeniyle dil evriminin kesin tarihi hiçbir zaman bilinemeyecektir","Dil evrimini tek bir disiplinin verileriyle açıklamak mümkün değildir; dolaylı kanıtların bir araya getirilmesi gerekmektedir","FOXP2 geni dilin evrimini anlamak için yeterli açıklayıcı bir çerçeve sunmaktadır"]'::jsonb,
  2,
  'Metin, araştırmacıların farklı disiplinlerden dolaylı kanıtları bir araya getirdiğini sürekli vurgulamaktadır.',
  4, 5
);


-- ============================================================
-- TEXT 8: Quantum Computing: Principles and Future Applications
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000008-0000-4000-aa00-000000000008',
  'Quantum Computing: Principles and Future Applications',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$Quantum computing represents a fundamentally different approach to information processing, one that harnesses the counterintuitive principles of quantum mechanics to perform calculations that are intractable for even the most powerful classical computers. While conventional computers encode information as binary bits that can exist in one of two states, zero or one, quantum computers use quantum bits, or qubits, that can exist in a superposition of both states simultaneously. This property, along with quantum entanglement and interference, allows quantum computers to explore many possible solutions to a problem in parallel, offering the potential for exponential speedups on certain classes of problems.

The concept of superposition is central to quantum computing and distinguishes it fundamentally from classical computation. A qubit in superposition is not simply uncertain about whether it is zero or one; rather, it exists as a genuine quantum combination of both states, each with an associated probability amplitude. When a measurement is made, the superposition collapses to a definite classical state, but the quantum computation performed before measurement exploits the full complexity of the superposed state. Stringing together multiple qubits exponentially increases the computational state space: ten qubits can simultaneously represent all one thousand and twenty-four possible combinations of zeros and ones, while fifty qubits can represent more than one quadrillion states.

Entanglement is another quantum mechanical phenomenon that underpins quantum computing. When two qubits become entangled, the state of one qubit instantly influences the state of the other, regardless of the physical distance between them. This correlation, which has no classical analogue, allows quantum computers to perform coordinated operations on multiple qubits simultaneously and is a key resource for many quantum algorithms. The famous Bell inequality experiments have conclusively demonstrated that quantum entanglement is a genuine physical phenomenon that cannot be explained by any local hidden variable theory.

The practical realization of quantum computers faces formidable engineering challenges, chief among them the problem of decoherence. Qubits are extremely fragile physical systems that can lose their quantum properties through interactions with their environment, a process known as decoherence. Maintaining qubits in a coherent quantum state long enough to perform useful computations requires extreme isolation from the environment, often achieved through cooling to temperatures close to absolute zero. Error correction codes are also essential to protect quantum information from the inevitable errors that arise in any physical implementation.

The potential applications of quantum computing span a remarkably broad range of domains. In cryptography, quantum computers running Shor''s algorithm could efficiently factor large numbers, breaking the RSA encryption scheme that underpins much of modern digital security. This prospect has stimulated intensive research into post-quantum cryptographic protocols that can withstand attacks from both classical and quantum computers. In chemistry and materials science, quantum simulation could enable the accurate modeling of molecular systems with potential applications in drug design, catalyst development, and battery technology.

Quantum machine learning, quantum optimization, and quantum sensing represent additional promising application areas. However, despite remarkable progress over the past decade, current quantum computers are limited to a relatively small number of noisy qubits and have not yet demonstrated clear practical advantage over classical computers for commercially relevant problems. The path from today''s noisy intermediate-scale quantum devices to fault-tolerant universal quantum computers capable of realizing the full promise of quantum computing remains long and uncertain, requiring sustained investment in both fundamental research and engineering development.$b$,
  ARRAY['kuantum bilgisayar','qubit','süperpozisyon','dolanıklık','kriptografi'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000008-0000-4000-aa00-000000000008', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Kuantum bilgisayarların temel ilkeleri, mühendislik zorlukları ve potansiyel uygulama alanları","RSA şifrelemenin kuantum saldırılarına karşı savunmasızlığı","Klasik bilgisayarlarla kuantum bilgisayarların mevcut performans karşılaştırması","Mutlak sıfıra soğutmanın kuantum sistemlerine etkisi"]'::jsonb,
  0,
  'Metin, kuantum bilgisayarların prensiplerini, zorluklarını ve uygulama alanlarını kapsamlı biçimde ele almaktadır.',
  4, 1
),
(
  'aa000008-0000-4000-aa00-000000000008', 'detail',
  'Metne göre "decoherence" (uyumsuzlaşma) nedir?',
  '["Kubitler arasındaki dolanıklığın kasıtlı olarak bozulması","Kuantum hata düzeltme kodlarının başarısız olması","Kubitlerin çevreleriyle etkileşime girerek kuantum özelliklerini yitirmeleri","Kuantum bilgisayarların ölçüm yaparken gürültü üretmesi"]'::jsonb,
  2,
  'Metin, decoherence''ı kubitlerin çevreyle etkileşim sonucu kuantum özelliklerini kaybetmesi olarak tanımlamaktadır.',
  4, 2
),
(
  'aa000008-0000-4000-aa00-000000000008', 'vocabulary',
  'Metinde geçen "intractable" kelimesinin bu bağlamdaki anlamı nedir?',
  '["Çok hızlı biçimde çözülebilir","Klasik bilgisayarlar için pratikte çözülemez / üstesinden gelinemez","Teorik olarak imkansız","Yalnızca kuantum bilgisayarlarla çözülebilir"]'::jsonb,
  1,
  '"Intractable" hesaplamalar, klasik bilgisayarlar için pratikte çok uzun sürecek ve çözülmesi aşırı derecede zor olan hesaplamalardır.',
  4, 3
),
(
  'aa000008-0000-4000-aa00-000000000008', 'detail',
  'Metne göre Shor algoritması hangi alanda tehdit oluşturmaktadır?',
  '["Kuantum dolanıklığı deneyleri","Modern dijital güvenliğin temelini oluşturan RSA şifreleme","Makine öğrenmesi modellerinin eğitim süreci","İlaç tasarımı için moleküler modelleme"]'::jsonb,
  1,
  'Metin, Shor algoritmasının büyük sayıları çarpanlarına ayırarak RSA şifrelemeyi kırabileceğini belirtmektedir.',
  4, 4
),
(
  'aa000008-0000-4000-aa00-000000000008', 'inference',
  'Metinden kuantum bilgisayarların mevcut durumu hakkında çıkarılabilecek en uygun sonuç hangisidir?',
  '["Kuantum bilgisayarlar ticari uygulamalarda klasik bilgisayarların yerini almaya hazırdır","Hatasız evrensel kuantum bilgisayara ulaşmak uzun vadeli sürdürülmüş araştırma ve mühendislik gerektirmektedir","Gürültülü kuantum cihazlar halihazırda kriptografi alanında pratik üstünlük göstermektedir","Kuantum simülasyonu ilaç keşfi problemlerini zaten çözüme kavuşturmuştur"]'::jsonb,
  1,
  'Metin, hatasız evrensel kuantum bilgisayara giden yolun uzun ve belirsiz olduğunu açıkça belirtmektedir.',
  4, 5
);


-- ============================================================
-- TEXT 9: Social Media's Impact on Political Discourse
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000009-0000-4000-aa00-000000000009',
  'Social Media''s Impact on Political Discourse',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$The rise of social media platforms over the past two decades has fundamentally transformed the landscape of political communication, creating new opportunities for civic engagement, political mobilization, and the dissemination of information while simultaneously giving rise to serious concerns about misinformation, polarization, and the erosion of shared democratic norms. Platforms such as Facebook, Twitter, YouTube, and TikTok now serve as primary sources of news and political information for hundreds of millions of people worldwide, wielding enormous influence over the political attitudes and behaviors of their users.

One of the most consequential features of social media platforms from a political standpoint is the algorithmic curation of content. Recommendation algorithms designed to maximize user engagement tend to prioritize content that is emotionally provocative, ideologically consistent with a user''s existing beliefs, and likely to generate strong reactions such as outrage, fear, or moral indignation. This dynamic creates what critics have called filter bubbles or echo chambers, information environments in which users are predominantly exposed to viewpoints that reinforce their existing opinions and are insulated from challenging perspectives. The result can be an increasing ideological homogenization within social networks and a corresponding polarization between different political communities.

The spread of misinformation on social media platforms represents another grave concern for democratic governance. False and misleading content often spreads more rapidly and widely than accurate information, in part because it tends to be more emotionally engaging and in part because social media''s sharing mechanisms amplify content irrespective of its veracity. The phenomenon of viral misinformation reached its most dangerous expression during the COVID-19 pandemic, when false claims about the origins of the virus, the safety of vaccines, and the efficacy of unproven treatments contributed to vaccine hesitancy and cost lives. Elections have also been targeted by coordinated disinformation campaigns that exploit social media''s reach to sow doubt about electoral integrity and manipulate public opinion.

Counterintuitively, social media has also demonstrated remarkable capacity as a tool for democratic mobilization and political activism. The Arab Spring uprisings of 2010 and 2011 demonstrated how social media platforms could enable rapid coordination among protesters and broadcast events to global audiences, circumventing state-controlled media. Subsequent movements such as Black Lives Matter, #MeToo, and Fridays for Future have used social media to build coalitions, amplify marginalized voices, and pressure institutions for reform. These examples illustrate that the political consequences of social media are not uniformly negative but are shaped by the social and political contexts in which they operate.

The regulatory response to the political harms of social media has been halting and contested. Debates about content moderation pit free speech values against the need to prevent harmful content, with critics on both the political left and right accusing platforms of applying inconsistent standards. Legislative proposals for platform regulation vary widely in their approaches, ranging from antitrust measures aimed at breaking up the largest platforms to transparency requirements and algorithmic accountability frameworks. The technical complexity of the issues involved, combined with the global scale of the platforms and the jurisdictional fragmentation of regulatory authority, makes effective governance extraordinarily challenging.

Scholars and policymakers are increasingly calling for a more nuanced understanding of social media''s political effects, one that moves beyond simple narratives about either the democratizing potential or the destructive power of these technologies. The relationship between social media use and political attitudes is mediated by individual psychology, social context, platform design, and institutional environment, and addressing the genuine harms that social media poses to democratic discourse will require interventions at all of these levels.$b$,
  ARRAY['sosyal medya','siyasi söylem','dezenformasyon','yankı odası','demokrasi'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000009-0000-4000-aa00-000000000009', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Sosyal medyanın siyasi söylem üzerindeki çok yönlü etkileri ve bu etkilerin yönetilmesindeki zorluklar","Algoritmik içerik önerisinin reklam gelirlerine etkisi","COVID-19 pandemisinde yanlış bilginin yayılma hızına ilişkin istatistiksel analiz","Arap Baharı''nın sosyal medya kullanımı açısından ayrıntılı incelenmesi"]'::jsonb,
  0,
  'Metin, sosyal medyanın siyasi iletişim üzerindeki hem olumlu hem olumsuz etkilerini ve düzenleyici zorlukları kapsamlı biçimde ele almaktadır.',
  4, 1
),
(
  'aa000009-0000-4000-aa00-000000000009', 'detail',
  'Metne göre, sosyal medya algoritmalarının "filtre balonu" oluşturmasının temel nedeni nedir?',
  '["Platformların kasıtlı olarak yanlış bilgiyi teşvik etmesi","Kullanıcı katılımını en üst düzeye çıkarmak için duygusal açıdan kışkırtıcı ve ideolojik açıdan tutarlı içeriklerin önceliklendirilmesi","Siyasi partilerin algoritmaları kendi çıkarları doğrultusunda manipüle etmesi","Kullanıcıların farklı görüşlerden kasıtlı olarak kaçınma tercihi"]'::jsonb,
  1,
  'Metin, algoritmaların kullanıcı katılımını maksimize etmek için duygusal ve ideolojik açıdan tutarlı içerikleri öne çıkardığını açıklamaktadır.',
  4, 2
),
(
  'aa000009-0000-4000-aa00-000000000009', 'vocabulary',
  'Metinde geçen "veracity" kelimesinin Türkçe karşılığı nedir?',
  '["Popülerlik","Duygusallık","Doğruluk / gerçeklik","Hız"]'::jsonb,
  2,
  '"Veracity" bir bilginin doğru ve gerçek olma niteliğini ifade etmektedir.',
  4, 3
),
(
  'aa000009-0000-4000-aa00-000000000009', 'detail',
  'Metne göre Arap Baharı bağlamında sosyal medyanın rolü nedir?',
  '["Hükümetlerin muhalif grupları izlemesini kolaylaştırmak","Protestocular arasında hızlı koordinasyon sağlamak ve olayları küresel izleyicilere yayınlamak","Uluslararası toplumu demokratik müdahaleye teşvik etmek","Devlet kontrolündeki medyanın etkisini güçlendirmek"]'::jsonb,
  1,
  'Metin, Arap Baharı''nda sosyal medyanın koordinasyon ve küresel yayın aracı olarak işlev gördüğünü belirtmektedir.',
  4, 4
),
(
  'aa000009-0000-4000-aa00-000000000009', 'inference',
  'Metnin son paragrafından çıkarılabilecek en uygun sonuç hangisidir?',
  '["Sosyal medya demokrasi için her zaman zararlıdır","Sosyal medyanın siyasi etkisi tek bir müdahaleyle çözülebilir","Sosyal medyanın siyaset üzerindeki etkisi karmaşık olup birden fazla düzeyde müdahale gerektirmektedir","Platformların içerik moderasyonu sorununu kendi kendine çözmesi gerekmektedir"]'::jsonb,
  2,
  'Metin, sosyal medyanın etkisini anlamak ve ele almak için çok katmanlı yaklaşımlar gerektirdiğini vurgulamaktadır.',
  4, 5
);


-- ============================================================
-- TEXT 10: The Gut-Brain Axis: Understanding the Second Brain
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000010-0000-4000-aa00-000000000010',
  'The Gut-Brain Axis: Understanding the Second Brain',
  'YDS Okuma', 'YDS', 4, 500, 4,
  $b$The human gut contains an estimated one hundred million neurons, more than either the spinal cord or the peripheral nervous system, a fact that has led neuroscientists to refer to it as the second brain or the enteric nervous system. This vast neural network, embedded within the walls of the gastrointestinal tract, operates largely autonomously from the central nervous system, coordinating the complex muscular contractions of digestion, regulating the secretion of digestive enzymes and hormones, and communicating bidirectionally with the brain via the vagus nerve and other pathways. Research over the past two decades has revealed that this gut-brain axis plays a far more significant role in human health and behavior than was previously appreciated.

At the heart of the gut-brain relationship is the gut microbiome, the vast community of trillions of microorganisms, including bacteria, viruses, fungi, and archaea, that inhabit the human gastrointestinal tract. The composition and diversity of the gut microbiome vary considerably among individuals and are influenced by factors including diet, antibiotic use, early life exposures, and genetics. This microbial community performs essential functions for human health, including the synthesis of vitamins, the fermentation of dietary fiber into short-chain fatty acids, the training of the immune system, and the protection against colonization by pathogenic organisms.

The connection between the gut microbiome and mental health has emerged as one of the most exciting frontiers in biomedical research. Studies in germ-free mice, which are raised without any gut microbiome, have demonstrated dramatically altered stress responses and anxiety-like behaviors compared to conventionally raised animals. The transplantation of gut microbiota from anxious mice to germ-free mice can transfer anxiety-like behavior to the recipient animals, suggesting a causal role for gut microbes in shaping behavior. In human studies, associations have been reported between alterations in gut microbiome composition and conditions including depression, anxiety, autism spectrum disorder, and Parkinson''s disease.

The mechanisms through which gut microbes influence brain function are multiple and incompletely understood. Gut bacteria produce or stimulate the production of a wide range of neuroactive compounds, including serotonin, dopamine, gamma-aminobutyric acid, and various neuropeptides. Remarkably, approximately ninety percent of the body''s serotonin is produced in the gut rather than in the brain, and this peripheral serotonin plays important roles in regulating gut motility, intestinal secretion, and mood. Short-chain fatty acids produced by bacterial fermentation of dietary fiber can cross the blood-brain barrier and directly influence neuroinflammation and neurogenesis.

Dietary interventions targeting the gut microbiome have shown promise as potential therapeutic approaches for mental health conditions. Clinical trials have found that dietary patterns rich in fermented foods, dietary fiber, and plant diversity are associated with improved mental health outcomes and reduced inflammation. The emerging field of psychobiotics refers to live microorganisms that, when ingested in adequate amounts, confer a mental health benefit, and several randomized controlled trials have reported modest improvements in mood and anxiety with probiotic supplementation.

Despite the excitement surrounding gut-brain axis research, many important questions remain unanswered. The causal direction of many observed associations is difficult to establish, as poor mental health can also alter gut microbiome composition, creating bidirectional relationships that are challenging to disentangle. The translation of findings from animal models to human therapeutics has proved more difficult than initially hoped, and robust evidence for the clinical efficacy of microbiome-targeted interventions for mental health disorders remains limited.$b$,
  ARRAY['bağırsak-beyin ekseni','mikrobiyom','enterik sinir sistemi','serotonin','zihinsel sağlık'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000010-0000-4000-aa00-000000000010', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Bağırsak-beyin ekseni: ikinci beyin olarak enterik sinir sistemi ve bağırsak mikrobiyomunun ruh sağlığı üzerindeki rolü","Bağırsak mikrobiyomunun bağışıklık sistemi eğitimindeki görevi","Probiyotik takviyelerin klinik etkinliğine ilişkin güncel araştırma bulguları","Bağırsak florasını etkileyen diyet kalıplarının karşılaştırmalı analizi"]'::jsonb,
  0,
  'Metin, bağırsak-beyin eksenini enterik sinir sistemi, mikrobiyom ve ruh sağlığı bağlantısı üzerinden kapsamlı biçimde ele almaktadır.',
  4, 1
),
(
  'aa000010-0000-4000-aa00-000000000010', 'detail',
  'Metne göre, mikrop içermeyen (germ-free) farelerde yapılan araştırmalar ne göstermiştir?',
  '["Bu fareler normal farelerden daha az anksiyete benzeri davranış sergilemektedir","Bağırsak mikrobiyomunun yokluğu dramatik biçimde değişmiş stres tepkileri ve anksiyete benzeri davranışlara yol açmaktadır","Mikrobiyom naklinin fareler arasında saldırganlığı aktardığı saptanmıştır","Mikrop içermeyen farelerde bağırsak serotonin üretimi normalden yüksektir"]'::jsonb,
  1,
  'Metin, mikrop içermeyen farelerin anlamlı biçimde değişmiş stres tepkileri ve anksiyete benzeri davranışlar sergilediğini belirtmektedir.',
  4, 2
),
(
  'aa000010-0000-4000-aa00-000000000010', 'vocabulary',
  'Metinde geçen "psychobiotics" terimi nasıl tanımlanmaktadır?',
  '["Bağırsak sağlığını desteklemek için tasarlanmış diyet takviyeleri","Yeterli miktarda alındığında ruh sağlığı faydası sağlayan canlı mikroorganizmalar","Bağırsak mikrobiyomunu analiz eden biyoteknolojik araçlar","Beyin-bağırsak eksenini düzenleyen ilaçlar"]'::jsonb,
  1,
  'Metin, psikobiyotikleri yeterli miktarda alındığında ruh sağlığı faydası sağlayan canlı mikroorganizmalar olarak tanımlamaktadır.',
  4, 3
),
(
  'aa000010-0000-4000-aa00-000000000010', 'detail',
  'Metne göre vücudun serotoninin büyük çoğunluğu nerede üretilmektedir?',
  '["Beyin","Karaciğer","Bağırsak","Adrenal bezler"]'::jsonb,
  2,
  'Metin, vücudun serotoninin yaklaşık %90''ının beyinde değil bağırsakta üretildiğini açıklamaktadır.',
  4, 4
),
(
  'aa000010-0000-4000-aa00-000000000010', 'inference',
  'Metnin son paragrafından bağırsak-beyin ekseni araştırmaları hakkında çıkarılabilecek en uygun sonuç nedir?',
  '["Bağırsak mikrobiyomunu hedef alan müdahaleler ruh sağlığı bozuklukları için standart tedavi haline gelmiştir","Alan umut verici olsa da nedensellik ilişkisi belirsizliğini korumakta ve insan çalışmalarına çeviri hâlâ güçtür","Hayvan modeli bulguları insan tedavilerine doğrudan aktarılabilir","Diyet müdahaleleri ilaç tedavilerinden daha etkili olduğunu kanıtlamıştır"]'::jsonb,
  1,
  'Metin, alanın heyecan verici olduğunu ancak nedensellik ve klinik çeviri konusunda önemli soruların yanıtsız kaldığını vurgulamaktadır.',
  4, 5
);


-- ============================================================
-- TEXT 11: Dark Matter and the Expansion of the Universe
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000011-0000-4000-aa00-000000000011',
  'Dark Matter and the Expansion of the Universe',
  'YDS Okuma', 'YDS', 5, 500, 4,
  $b$One of the most profound mysteries in modern physics is the nature of the invisible components that dominate the universe''s composition. Ordinary matter, the kind that makes up stars, planets, and everything we can directly observe, accounts for only approximately five percent of the total energy content of the universe. The remaining ninety-five percent consists of two enigmatic entities: dark matter, which comprises roughly twenty-seven percent, and dark energy, which constitutes approximately sixty-eight percent. Despite decades of intensive research, the fundamental nature of both remains unknown, representing perhaps the greatest unsolved problems in cosmology and fundamental physics.

Dark matter was first postulated in the 1930s by Swiss astronomer Fritz Zwicky, who noticed that the galaxies in the Coma Cluster were moving too rapidly to be held together by the gravitational pull of visible matter alone. Subsequent observations by Vera Rubin in the 1970s provided even more compelling evidence: the orbital speeds of stars in spiral galaxies do not decrease with distance from the galactic center as would be expected if visible matter were the only gravitational source, but instead remain approximately constant, implying the existence of a large halo of unseen mass surrounding each galaxy. This missing mass, subsequently named dark matter, interacts gravitationally with ordinary matter but does not emit, absorb, or reflect light, rendering it invisible to conventional astronomical instruments.

Gravitational lensing provides some of the most spectacular observational evidence for dark matter. When light from distant galaxies passes near a massive object, its path is bent by gravity, distorting the appearance of the background source. The degree of lensing observed in galaxy clusters far exceeds what could be produced by visible matter alone, requiring the presence of enormous quantities of dark matter. The Bullet Cluster, formed by the collision of two galaxy clusters, provides a particularly compelling illustration: the visible hot gas from the two clusters slowed down upon collision and remains concentrated in the center, while the dark matter, inferred from gravitational lensing, passed through largely unimpeded and is now distributed in two separate clumps.

Despite overwhelming indirect evidence for dark matter''s existence, its particle nature remains elusive. Numerous candidate particles have been proposed, including weakly interacting massive particles, axions, and sterile neutrinos. Weakly interacting massive particles, or WIMPs, were long considered the most promising candidates because they arise naturally in extensions of the Standard Model of particle physics and would be produced in the right abundance to account for the observed dark matter density. However, decades of direct detection experiments designed to observe WIMPs scattering off atomic nuclei have yielded no convincing positive signals, placing increasingly stringent constraints on WIMP parameter space.

Dark energy is even more mysterious than dark matter. Its existence was inferred in 1998 from observations of Type Ia supernovae, which revealed that the expansion of the universe is not slowing down as expected due to gravitational attraction but is actually accelerating. This unexpected finding, which earned its discoverers the 2011 Nobel Prize in Physics, implies the existence of a form of energy that pervades all of space and exerts a repulsive gravitational effect. The cosmological constant, originally introduced by Einstein as a static term in his field equations and later abandoned as his greatest blunder, is the simplest theoretical explanation for dark energy, but whether it represents a true vacuum energy or some dynamic evolving field remains an open question.

The quest to understand dark matter and dark energy is driving the development of some of the most ambitious scientific instruments ever constructed. The Euclid space telescope, launched in 2023, aims to map the large-scale structure of the universe with unprecedented precision, providing new constraints on dark energy models. Underground detectors in laboratories around the world continue to search for dark matter particles with ever-increasing sensitivity. The answers, when they come, will revolutionize our understanding of the fundamental nature of reality.$b$,
  ARRAY['karanlık madde','karanlık enerji','evrenin genişlemesi','gravitasyonel mercekleme','kozmoloji'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000011-0000-4000-aa00-000000000011', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Evrenin bileşimindeki görünmez bileşenler: karanlık madde ve karanlık enerjinin doğası ile bunlara ilişkin kanıtlar","Fritz Zwicky ve Vera Rubin''in gözlemsel astrofizikteki öncü katkıları","WIMP tespiti için tasarlanmış doğrudan algılama deneylerinin teknik ayrıntıları","Euclid Uzay Teleskobu''nun büyük ölçekli evren haritalamasındaki rolü"]'::jsonb,
  0,
  'Metin, karanlık madde ve karanlık enerjiyi kanıtları, aday parçacıkları ve açık sorularla birlikte kapsamlı biçimde ele almaktadır.',
  5, 1
),
(
  'aa000011-0000-4000-aa00-000000000011', 'detail',
  'Metne göre Bullet Cluster, karanlık maddeye ilişkin ne göstermektedir?',
  '["Karanlık maddenin ısınmış gazla birlikte merkeze toplandığını","Karanlık maddenin çarpışma sırasında büyük ölçüde engelsiz geçerek iki ayrı yığın oluşturduğunu","Karanlık maddenin elektromanyetik radyasyon yaydığını","Karanlık maddenin yalnızca galaksi kümelerinde bulunduğunu"]'::jsonb,
  1,
  'Metin, Bullet Cluster''da karanlık maddenin çarpışmadan geçip iki ayrı yığın oluşturduğunu, görünür gazın ise merkezde kaldığını belirtmektedir.',
  5, 2
),
(
  'aa000011-0000-4000-aa00-000000000011', 'vocabulary',
  'Metinde geçen "elusive" kelimesinin bu bağlamdaki anlamı nedir?',
  '["Tehlikeli","Yaygın olarak bulunan","Bulunması veya anlaşılması güç olan / ele geçmez","Teorik olarak imkansız"]'::jsonb,
  2,
  '"Elusive", karanlık madde parçacığının doğasının hâlâ ele geçmez ve anlaşılması güç olduğunu ifade etmektedir.',
  5, 3
),
(
  'aa000011-0000-4000-aa00-000000000011', 'detail',
  'Metne göre karanlık enerji, 1998 yılında nasıl keşfedilmiştir?',
  '["WIMP dedektörlerinden elde edilen sinyaller aracılığıyla","Ia tipi süpernovaların gözlemlerinin evrenin genişlemesinin beklenmedik biçimde hızlandığını ortaya koymasıyla","Kozmolojik sabitin Einstein''ın alan denklemlerine dahil edilmesiyle","Euclid Uzay Teleskobu''nun büyük ölçekli yapı haritalamasıyla"]'::jsonb,
  1,
  'Metin, karanlık enerjinin Ia tipi süpernovaların gözlemlerinden çıkarıldığını açıkça belirtmektedir.',
  5, 4
),
(
  'aa000011-0000-4000-aa00-000000000011', 'inference',
  'Metinden karanlık madde araştırmasının mevcut durumu hakkında çıkarılabilecek en uygun sonuç nedir?',
  '["Karanlık madde zaten keşfedilmiş olup yalnızca ayrıntılar doğrulanmayı beklemektedir","Varlığına ilişkin dolaylı kanıtlar güçlü olmasına rağmen parçacık doğası deneylerle henüz doğrulanamamıştır","WIMP''ler karanlık madde adayı olma özelliğini yitirmiş ve konu kapatılmıştır","Yeraltı detektörleri WIMP sinyallerini zaten tespit etmeye başlamıştır"]'::jsonb,
  1,
  'Metin, dolaylı kanıtların güçlü olduğunu ancak onlarca yıllık doğrudan algılama deneylerinin henüz pozitif sinyal vermediğini vurgulamaktadır.',
  5, 5
);


-- ============================================================
-- TEXT 12: Epigenetics: How Environment Shapes Gene Expression
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000012-0000-4000-aa00-000000000012',
  'Epigenetics: How Environment Shapes Gene Expression',
  'YDS Okuma', 'YDS', 5, 500, 4,
  $b$The central dogma of molecular biology, which describes the flow of genetic information from DNA to RNA to protein, has long been understood as the fundamental mechanism through which hereditary information is expressed. However, over the past three decades, the emerging field of epigenetics has revealed an additional layer of genetic regulation that operates above the level of the DNA sequence itself, profoundly complicating and enriching our understanding of how genes are controlled and how organisms respond to their environments. Epigenetics refers to heritable changes in gene expression that do not involve alterations in the underlying DNA sequence, mediated instead by chemical modifications to either the DNA itself or the proteins around which it is wrapped.

The two primary mechanisms of epigenetic regulation are DNA methylation and histone modification. DNA methylation involves the addition of a methyl group to cytosine residues in the DNA molecule, typically at CpG dinucleotides. Methylation of gene promoter regions is generally associated with transcriptional silencing, effectively switching off the expression of the affected gene. Histone modification involves chemical changes to the histone proteins that form the core of the nucleosome, the fundamental unit of chromatin packaging. Acetylation of histones generally opens up chromatin structure and promotes gene expression, while other modifications such as methylation or phosphorylation can either activate or repress transcription depending on the specific residue and modification involved.

Environmental factors play a profound role in shaping epigenetic patterns throughout an individual''s lifetime. Diet, physical activity, stress, exposure to toxins, and social experiences can all induce epigenetic changes that alter gene expression patterns, with consequences for health and disease. The Dutch Hunger Winter study, which examined the health outcomes of individuals who were in utero during a severe famine in the Netherlands in 1944 to 1945, demonstrated that early nutritional deprivation can induce epigenetic changes that persist throughout an individual''s life, influencing the risk of metabolic diseases including obesity and type 2 diabetes.

Perhaps the most remarkable and controversial aspect of epigenetics is the possibility of transgenerational epigenetic inheritance, the transmission of epigenetic marks from parent to offspring. Studies in both animal models and humans have provided evidence that environmental exposures experienced by parents or even grandparents can influence the health and behavioral traits of subsequent generations through epigenetic mechanisms. If confirmed and proven to be widespread, transgenerational epigenetic inheritance would challenge the classical Mendelian framework of genetics and revive, in a molecular guise, aspects of Lamarckian theories of inheritance based on the heritability of acquired characteristics.

The field of epigenomics, which applies high-throughput genomic technologies to characterize the complete set of epigenetic marks across the genome, has generated enormous datasets that are beginning to illuminate the complex relationships between epigenetic patterns, gene expression, and disease. Epigenome-wide association studies, analogous to genome-wide association studies for DNA sequence variants, are identifying epigenetic variants associated with complex diseases such as cancer, cardiovascular disease, and neuropsychiatric disorders. Cancer, in particular, is characterized by widespread epigenetic abnormalities, including global DNA hypomethylation and focal hypermethylation of tumor suppressor gene promoters, and epigenetic drugs are now approved for the treatment of certain hematological malignancies.

The therapeutic implications of epigenetics extend well beyond oncology. The reversibility of epigenetic modifications, in contrast to permanent genetic mutations, makes them attractive targets for pharmacological intervention. Epigenetic reprogramming strategies that reset aberrant methylation or acetylation patterns hold promise for treating a range of conditions, from neurodegenerative diseases to autoimmune disorders. Understanding how lifestyle interventions such as diet and exercise exert their beneficial effects through epigenetic mechanisms could also inform more personalized and effective approaches to preventive medicine.$b$,
  ARRAY['epigenetik','DNA metilasyonu','gen ifadesi','çevre','kalıtım'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000012-0000-4000-aa00-000000000012', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Epigenetiğin temel mekanizmaları, çevresel etkiler ve hastalık ile terapi üzerindeki sonuçları","DNA çift sarmalının keşfinin moleküler biyolojiye katkıları","Hollanda Açlık Kışı araştırmasının obezite üzerindeki etkileri","Epigenomik veri setlerinin biyoinformatik analizi"]'::jsonb,
  0,
  'Metin, epigenetiği mekanizmaları, çevresel etkileri ve terapötik sonuçlarıyla kapsamlı biçimde ele almaktadır.',
  5, 1
),
(
  'aa000012-0000-4000-aa00-000000000012', 'detail',
  'Metne göre, histon asetilasyonunun gen ifadesi üzerindeki etkisi nedir?',
  '["Kromatin yapısını sıkıştırarak gen ifadesini baskılar","Kromatin yapısını açarak gen ifadesini destekler","DNA metilasyonunu artırarak genleri susturur","Tümör baskılayıcı gen promotörlerini hipermetile eder"]'::jsonb,
  1,
  'Metin, histon asetilasyonunun genel olarak kromatin yapısını açarak gen ifadesini teşvik ettiğini belirtmektedir.',
  5, 2
),
(
  'aa000012-0000-4000-aa00-000000000012', 'vocabulary',
  'Metinde geçen "transgenerational epigenetic inheritance" ifadesi ne anlama gelmektedir?',
  '["Belirli bir nesilde gerçekleşen kalıcı DNA mutasyonları","Epigenetik işaretlerin ebeveynden yavruya aktarılması","Aynı bireyde farklı hücre tiplerindeki epigenetik farklılıklar","DNA dizisindeki değişikliklerle kalıtılan sağlık riskleri"]'::jsonb,
  1,
  'Metin, bu terimi çevresel maruziyetin neden olduğu epigenetik işaretlerin nesilden nesile aktarımı olarak tanımlamaktadır.',
  5, 3
),
(
  'aa000012-0000-4000-aa00-000000000012', 'detail',
  'Metne göre, kanserin epigenetik özellikleri nelerdir?',
  '["DNA hipometilasyonu ile tümör baskılayıcı gen promotörlerinin fokal hipermetilasyonu","Tüm genomda eşit DNA hipermetilasyonu","Histon asetilasyonunun tamamen yok olması","Hücresel farklılaşmanın bozulmasına yol açan RNA metilasyonu"]'::jsonb,
  0,
  'Metin, kanserin global DNA hipometilasyonu ve tümör baskılayıcı gen promotörlerinde fokal hipermetilasyon ile karakterize olduğunu açıklamaktadır.',
  5, 4
),
(
  'aa000012-0000-4000-aa00-000000000012', 'inference',
  'Epigenetik modifikasyonların tersine çevrilebilirliği hakkında metinden çıkarılabilecek en uygun sonuç nedir?',
  '["Epigenetik modifikasyonlar kalıcıdır ve ilaçlarla değiştirilemez","Tersine çevrilebilirlik, epigenetik hedefleri farmakolojik müdahaleler için kalıcı genetik mutasyonlara göre daha çekici kılmaktadır","Tersine çevrilebilirlik yalnızca kanser tedavisinde klinik öneme sahiptir","Yaşam tarzı müdahaleleri epigenetik mekanizmaları etkileyemez"]'::jsonb,
  1,
  'Metin, epigenetik modifikasyonların tersine çevrilebilirliğinin onları terapötik hedef olarak kalıcı mutasyonlara kıyasla cazip kıldığını vurgulamaktadır.',
  5, 5
);


-- ============================================================
-- TEXT 13: The Philosophy of Consciousness and Self-Awareness
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000013-0000-4000-aa00-000000000013',
  'The Philosophy of Consciousness and Self-Awareness',
  'YDS Okuma', 'YDS', 5, 500, 4,
  $b$Consciousness, the subjective experience of being aware of oneself and one''s surroundings, is simultaneously the most familiar and the most mysterious aspect of human existence. Every person has immediate, undeniable access to their own conscious experience, yet providing a satisfactory scientific or philosophical account of what consciousness is, how it arises from physical processes in the brain, and why there is subjective experience at all remains one of the deepest unsolved problems in all of inquiry. The philosopher David Chalmers has famously distinguished between the easy problems of consciousness, which concern explaining the functional and behavioral capacities associated with awareness, and the hard problem, which asks why any physical process should be accompanied by subjective experience at all.

The hard problem arises from what philosophers call the explanatory gap between objective physical descriptions and subjective experience. We can, in principle, give a complete physical and functional description of how the brain processes visual information, generates reports about what it perceives, and controls behavior, yet this description seems to leave something out: what it is like to see the redness of red, to feel the sharpness of pain, or to experience the joy of a sunset. These purely subjective, first-person qualities of experience, known as qualia, seem resistant to any third-person scientific description, generating the intuition that there is something about consciousness that cannot be reduced to physical processes.

Philosophical responses to the hard problem cover a wide spectrum. Eliminative materialists argue that folk psychological notions such as qualia and subjective experience are ultimately illusory, and that a sufficiently complete neuroscientific description will dissolve rather than solve the hard problem. Functionalists hold that mental states are defined by their causal and functional roles rather than by their physical substrate, implying that any system that implements the right functional organization will have conscious experiences regardless of whether it is made of neurons or silicon. Panpsychists take the radical position that consciousness is a fundamental feature of reality present to some degree in all physical systems, not just brains.

Empirical approaches to consciousness have proliferated in recent decades, driven partly by advances in neuroimaging and electrophysiology that allow researchers to correlate brain activity with reported conscious experiences. The global workspace theory, developed by cognitive scientist Bernard Baars, proposes that consciousness arises when information is broadcast widely across the brain through a global neuronal workspace, making it available to multiple cognitive processes simultaneously. The integrated information theory, developed by neuroscientist Giulio Tononi, attempts to provide a mathematical measure of consciousness based on the degree to which a system generates information above and beyond its component parts, quantified as the measure phi.

The question of whether artificial systems could be conscious is no longer purely hypothetical. As large language models and other AI systems display increasingly sophisticated linguistic and reasoning capabilities, questions about their potential inner experiences become pressing. Some philosophers and cognitive scientists argue that sufficiently complex information-processing systems may already possess some form of machine consciousness, while others maintain that no amount of computational sophistication can give rise to genuine subjective experience in the absence of the right kind of biological substrate. Resolving these debates will require not only better theories of consciousness but also new empirical methods for detecting consciousness in systems that cannot directly report their experiences.

Self-awareness, a higher-order form of consciousness involving the ability to represent oneself as a distinct entity in the world, has been studied through the mirror self-recognition test, in which an animal is observed to investigate a mark placed on its body that is only visible in a mirror. Humans, great apes, dolphins, and elephants have passed this test, suggesting that self-awareness is not exclusively a human trait. The neural correlates of self-awareness appear to involve the default mode network, a set of brain regions that are active during self-referential thought and deactivated during externally directed tasks.$b$,
  ARRAY['bilinç','öz farkındalık','hard problem','qualia','felsefe'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000013-0000-4000-aa00-000000000013', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Bilincin felsefesi: hard problem, felsefi yaklaşımlar, ampirik teoriler ve yapay bilinç sorusu","Entegre bilgi teorisinin matematiksel temellerinin ayrıntılı analizi","Ayna öz tanıma testinin hayvan bilinci araştırmalarındaki yeri","Büyük dil modellerinin bilinçli deneyime sahip olup olmadığına dair kesin kanıtlar"]'::jsonb,
  0,
  'Metin, bilincin felsefesini hard problem, felsefi yanıtlar, ampirik teoriler ve yapay bilinç üzerinden kapsamlı biçimde ele almaktadır.',
  5, 1
),
(
  'aa000013-0000-4000-aa00-000000000013', 'detail',
  'Metne göre, Chalmers''ın "hard problem" ile "kolay problemler" arasındaki temel ayrım nedir?',
  '["Kolay problemler nörobiyolojik, hard problem ise psikolojiktir","Kolay problemler bilincin işlevsel kapasitelerini açıklamak iken, hard problem fiziksel bir sürecin neden öznel deneyime eşlik ettiğini sormaktadır","Kolay problemler ampirik araştırmaya kapalıyken, hard problem deneysel olarak test edilebilirdir","Kolay problemler yapay zeka bilincini, hard problem ise insan bilincini konu almaktadır"]'::jsonb,
  1,
  'Metin, bu ayrımı Chalmers''a atıfla açıkça belirtmektedir: kolay problemler işlevsel kapasiteler, hard problem ise öznel deneyimin neden var olduğudur.',
  5, 2
),
(
  'aa000013-0000-4000-aa00-000000000013', 'vocabulary',
  'Metinde geçen "qualia" terimi nasıl tanımlanmaktadır?',
  '["Bilincin nöral korelatlarının ölçümü","Deneyimin tamamen öznel, birinci şahıs nitelikleri (örneğin kırmızının kırmızılığını görmek)","Birden fazla bilişsel süreç tarafından erişilebilen bilgi","Beynin kendine referans verdiği durumlarda aktif olan bölgeler"]'::jsonb,
  1,
  'Metin, qualia''yı deneyimin tamamen öznel ve birinci şahıs nitelikleri olarak tanımlamaktadır.',
  5, 3
),
(
  'aa000013-0000-4000-aa00-000000000013', 'detail',
  'Metne göre global workspace teorisi bilinci nasıl açıklamaktadır?',
  '["Bilinç, bilginin bütünleşik bilgi ölçüsü fi ile ölçülebilecek biçimde entegre edilmesiyle ortaya çıkar","Bilinç, bilginin küresel nöronal bir çalışma alanı aracılığıyla beyne yaygın biçimde yayılarak birden fazla bilişsel süreç tarafından erişilebilir hale gelmesiyle ortaya çıkar","Bilinç, beynin işlevsel organizasyonunu uygulayan herhangi bir sistemde ortaya çıkar","Bilinç, tüm fiziksel sistemlerde farklı derecelerde var olan temel bir gerçeklik özelliğidir"]'::jsonb,
  1,
  'Metin, global workspace teorisini bilginin geniş biçimde yayılarak birden fazla bilişsel sürece erişilebilir hale geldiğinde bilincin ortaya çıkması olarak tanımlamaktadır.',
  5, 4
),
(
  'aa000013-0000-4000-aa00-000000000013', 'inference',
  'Yapay sistemlerin bilinçli olup olamayacağına ilişkin metinden çıkarılabilecek en uygun sonuç nedir?',
  '["Büyük dil modelleri halihazırda bilinçlidir","Yapay sistemlerin bilinçli olup olmadığı sorusu çözüme kavuşturulmuş bir meseledir","Soru artık yalnızca varsayımsal olmayıp yanıtlanması için daha iyi teoriler ve ampirik yöntemler gerektirmektedir","Biyolojik olmayan sistemler hiçbir koşulda öznel deneyim yaşayamaz"]'::jsonb,
  2,
  'Metin, sorunun artık varsayımsal olmadığını ve çözümün daha iyi teoriler ile ampirik yöntemler gerektirdiğini vurgulamaktadır.',
  5, 5
);


-- ============================================================
-- TEXT 14: Antibiotic Resistance: A Global Public Health Emergency
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000014-0000-4000-aa00-000000000014',
  'Antibiotic Resistance: A Global Public Health Emergency',
  'YDS Okuma', 'YDS', 5, 500, 4,
  $b$Antimicrobial resistance has been described by the World Health Organization as one of the greatest threats to global health, food security, and development. The ability of bacteria, viruses, fungi, and parasites to evolve mechanisms that render previously effective treatments useless is not a new phenomenon; penicillin-resistant Staphylococcus aureus was observed within years of penicillin''s introduction in the 1940s. What is new is the accelerating pace of resistance development, the emergence of multidrug-resistant and extensively drug-resistant organisms against which few or no effective treatments exist, and the alarming slowdown in the development of new antibiotic classes to replace those that have been rendered ineffective.

Bacteria have evolved a remarkable array of strategies to resist the killing action of antibiotics. Enzymatic inactivation involves the production of enzymes, such as beta-lactamases, that break down antibiotic molecules before they can reach their targets. Target modification involves mutations in the genes encoding the bacterial proteins that antibiotics bind to, reducing the affinity of the drug for its target. Efflux pumps are membrane proteins that actively transport antibiotics out of the bacterial cell, preventing them from accumulating to effective concentrations. Reduced permeability, achieved by modifying the composition of the outer membrane in gram-negative bacteria, limits the entry of antibiotics into the cell in the first place.

The spread of antibiotic resistance is driven by a combination of biological and human factors. The evolution of resistance is an inevitable consequence of natural selection: bacteria exposed to antibiotics that kill susceptible strains will enrich resistant mutants, which can then reproduce and share their resistance genes with other bacteria through horizontal gene transfer mechanisms including conjugation, transformation, and transduction. Human behaviors dramatically accelerate this natural process. The inappropriate prescription of antibiotics for viral infections against which they have no effect, the use of subtherapeutic doses that select for resistance without eradicating infection, and the widespread prophylactic use of antibiotics in livestock agriculture all create selection pressure that drives the emergence and spread of resistant strains.

The consequences of rising antibiotic resistance are already being felt in clinical settings worldwide. Infections caused by multidrug-resistant organisms are associated with longer hospital stays, higher treatment costs, and significantly increased mortality compared to infections caused by susceptible strains. Klebsiella pneumoniae strains resistant to carbapenems, one of the last-resort antibiotic classes, are increasingly common in hospital intensive care units globally. Carbapenem-resistant Enterobacteriaceae infections are associated with mortality rates of up to fifty percent. The treatment of routine medical procedures such as surgery, chemotherapy, and organ transplantation depends critically on effective antibiotics to prevent and treat bacterial infections, and the erosion of antibiotic efficacy threatens these pillars of modern medicine.

Addressing the antibiotic resistance crisis requires action on multiple fronts simultaneously. Antimicrobial stewardship programs, which promote the appropriate use of antibiotics in both human medicine and veterinary practice, are a cornerstone of resistance prevention. Improved diagnostics that rapidly identify the causative organism and its resistance profile enable targeted therapy rather than broad-spectrum empirical treatment. Infection prevention and control measures in healthcare settings reduce the transmission of resistant organisms between patients. Investment in the development of new antibiotics and alternative therapeutic approaches, including bacteriophage therapy, antimicrobial peptides, and monoclonal antibodies targeting virulence factors, is urgently needed.

International coordination is essential because resistant bacteria respect no borders. The One Health approach, which recognizes the interconnectedness of human, animal, and environmental health, provides a framework for addressing antimicrobial resistance in a holistic manner. Global surveillance systems that track the emergence and spread of resistant organisms, international agreements on antibiotic stewardship in agriculture, and equitable access to effective antibiotics in low- and middle-income countries are all components of a comprehensive global response to what may prove to be one of the defining public health crises of the twenty-first century.$b$,
  ARRAY['antibiyotik direnci','antimikrobiyal direnç','halk sağlığı','bakteriler','One Health'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000014-0000-4000-aa00-000000000014', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Antibiyotik direncinin küresel boyutu: nedenleri, klinik sonuçları ve çok cepheli mücadele stratejileri","Beta-laktamaz enzimlerinin biyokimyasal yapısı ve klinik önemi","Direnç gelişiminin önlenebileceği veteriner uygulamaları","WHO''nun antimikrobiyal direnç politikalarının tarihsel gelişimi"]'::jsonb,
  0,
  'Metin, antibiyotik direncini nedenleri, sonuçları ve çözüm stratejileriyle kapsamlı biçimde ele almaktadır.',
  5, 1
),
(
  'aa000014-0000-4000-aa00-000000000014', 'detail',
  'Metne göre, bakterilerin antibiyotiklere direnç geliştirdiği mekanizmalar arasında hangisi doğru tanımlanmıştır?',
  '["Efflux pompaları: antibiyotiklerin hücreye girişini engellemek için dış membran yapısını değiştirme","Hedef modifikasyonu: antibiyotik moleküllerini parçalayan enzimler üretme","Beta-laktamazlar: antibiyotikleri hücre dışına aktaran membran proteinleri","Efflux pompaları: antibiyotiklerin hücre içinde etkili konsantrasyona ulaşmasını önlemek için aktif taşıma gerçekleştiren membran proteinleri"]'::jsonb,
  3,
  'Metin, efflux pompalarını antibiyotikleri hücre dışına aktaran ve birikimini önleyen membran proteinleri olarak tanımlamaktadır.',
  5, 2
),
(
  'aa000014-0000-4000-aa00-000000000014', 'vocabulary',
  'Metinde geçen "stewardship" kelimesinin bu bağlamdaki Türkçe karşılığı nedir?',
  '["Sahiplik","Sorumlu yönetim / koruyucu kullanım","Yenilik","Denetim"]'::jsonb,
  1,
  '"Antimicrobial stewardship" antibiyotiklerin sorumlu ve uygun biçimde kullanılmasının yönetilmesi anlamına gelmektedir.',
  5, 3
),
(
  'aa000014-0000-4000-aa00-000000000014', 'detail',
  'Metne göre, insan davranışlarının antibiyotik direnç gelişimini hızlandırdığı yollardan biri nedir?',
  '["Antibiyotiklerin yalnızca hastane ortamında kullanılması","Viral enfeksiyonlar için uygunsuz antibiyotik reçetelenmesi","Dirençli bakteri suşlarının araştırma laboratuvarlarında tutulması","Çocuklarda antibiyotik kullanımının önlenmesi"]'::jsonb,
  1,
  'Metin, viral enfeksiyonlar için antibiyotik reçetelenmesini direnci hızlandıran insan davranışlarından biri olarak açıkça saymaktadır.',
  5, 4
),
(
  'aa000014-0000-4000-aa00-000000000014', 'inference',
  'One Health yaklaşımı hakkında metinden çıkarılabilecek en uygun sonuç nedir?',
  '["Antibiyotik direnci yalnızca insanlardaki tıbbi uygulamaların değiştirilmesiyle çözülebilir","İnsan, hayvan ve çevre sağlığının birbiriyle bağlantılı olduğu kabul edilerek antimikrobiyal direnç bütünleşik biçimde ele alınmalıdır","One Health yaklaşımı yalnızca gelişmekte olan ülkelere yönelik bir çerçevedir","Hayvan kaynaklı antibiyotik kullanımı insan direnci üzerinde ihmal edilebilir düzeyde etkiye sahiptir"]'::jsonb,
  1,
  'Metin, One Health''i insan, hayvan ve çevre sağlığının birbirine bağlılığını kabul ederek direnci bütünleşik biçimde ele alan bir yaklaşım olarak tanımlamaktadır.',
  5, 5
);


-- ============================================================
-- TEXT 15: The Economics of Sustainable Development
-- ============================================================
INSERT INTO text_library (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
VALUES (
  'aa000015-0000-4000-aa00-000000000015',
  'The Economics of Sustainable Development',
  'YDS Okuma', 'YDS', 5, 500, 4,
  $b$Sustainable development, defined by the Brundtland Commission in 1987 as development that meets the needs of the present without compromising the ability of future generations to meet their own needs, has become one of the organizing frameworks of global economic and environmental policy. The concept attempts to reconcile what were long seen as competing imperatives: economic growth and poverty alleviation on the one hand, and environmental protection and resource conservation on the other. The adoption of the United Nations Sustainable Development Goals in 2015, a framework of seventeen goals and one hundred and sixty-nine targets covering poverty, health, education, gender equality, clean energy, and environmental sustainability, represents the most ambitious attempt to translate the concept of sustainable development into a concrete global agenda.

Economic theory has long grappled with the challenge of incorporating environmental and social costs into market prices. The concept of externalities, costs or benefits that are experienced by parties not directly involved in a transaction, lies at the heart of environmental economics. When firms emit greenhouse gases, deplete fisheries, or generate toxic waste, they impose costs on society that are not reflected in the prices of their products, leading to the overproduction of goods with negative environmental externalities. Pigouvian taxes, which charge producers for the external costs they impose, and cap-and-trade systems, which set a ceiling on total emissions and allow polluters to buy and sell the right to emit, are the primary economic instruments designed to internalize these externalities.

The concept of natural capital, the stock of natural resources and ecosystems that provide goods and services to human societies, has gained increasing prominence in sustainable development economics. Traditional national accounting systems, such as gross domestic product, measure the flow of economic activity but fail to account for the depletion of natural capital. A country that clearcuts its forests or overfishes its coastal waters may show impressive short-term GDP growth while simultaneously destroying the natural assets that underpin its long-term economic well-being. Efforts to develop comprehensive measures of genuine progress that incorporate changes in natural capital, human capital, and social capital alongside conventional economic output are gaining traction among policymakers and economists.

The economics of sustainable development also grapples with profound questions of intergenerational equity. The discount rates used in cost-benefit analyses of long-term investments, including climate change mitigation, have enormous implications for how much weight is given to the interests of future generations. High discount rates effectively devalue the welfare of people who will live decades or centuries from now, potentially justifying inaction on problems such as climate change whose most severe consequences will be felt by future generations. Philosophers and economists have debated extensively whether it is ethically defensible to discount the welfare of future people at all, and these debates have direct implications for the stringency of climate policies that can be justified on economic grounds.

Green finance has emerged as a rapidly growing field aimed at channeling private capital toward sustainable investments. Green bonds, sustainability-linked loans, and environmental, social, and governance investing criteria are reshaping capital markets and incentivizing corporations to reduce their environmental footprints. Central banks and financial regulators are increasingly integrating climate risk into their frameworks for financial stability, recognizing that physical risks from climate impacts and transition risks from the shift to a low-carbon economy pose material threats to the stability of the financial system.

The relationship between economic growth and environmental sustainability remains contested. The environmental Kuznets curve hypothesis suggests that as countries develop economically, environmental degradation initially increases but eventually decreases as rising incomes lead to greater demand for environmental quality and the adoption of cleaner technologies. Empirical evidence for this hypothesis is mixed at best, and critics argue that it provides a dangerously complacent rationale for prioritizing growth over environmental protection in developing countries. The emerging framework of doughnut economics, developed by economist Kate Raworth, proposes that a safe and just space for humanity exists between a social foundation that ensures all people''s basic needs are met and an ecological ceiling that prevents overshooting planetary boundaries.$b$,
  ARRAY['sürdürülebilir kalkınma','çevre ekonomisi','doğal sermaye','yeşil finans','SDG'],
  'published'
);

INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
VALUES
(
  'aa000015-0000-4000-aa00-000000000015', 'main_idea',
  'Bu metnin ana konusu nedir?',
  '["Sürdürülebilir kalkınmanın ekonomik temelleri: dışsallıklar, doğal sermaye, nesiller arası hakkaniyet ve yeşil finans","BM Sürdürülebilir Kalkınma Hedefleri''nin uygulanmasındaki pratik güçlükler","Çevre Kuznets eğrisi hipotezinin ampirik kanıtlarının değerlendirilmesi","Brundtland Komisyonu''nun 1987 tanımının günümüzdeki uygulanabilirliği"]'::jsonb,
  0,
  'Metin, sürdürülebilir kalkınmanın ekonomik boyutlarını dışsallıklar, doğal sermaye, nesiller arası hakkaniyet ve yeşil finansı kapsayarak ele almaktadır.',
  5, 1
),
(
  'aa000015-0000-4000-aa00-000000000015', 'detail',
  'Metne göre "doğal sermaye" (natural capital) neden geleneksel ulusal muhasebe sistemlerinde yeterince yansıtılmamaktadır?',
  '["Doğal kaynakların parasal değerinin belirsiz olması nedeniyle","GSYH''nın yalnızca ekonomik faaliyetin akışını ölçmesi, doğal sermayenin tükenmesini hesaba katmaması nedeniyle","Çevre politikası anlaşmazlıklarının uluslararası muhasebe standartlarını engellemesi nedeniyle","Yeşil finansın piyasa teşviklerini bozması nedeniyle"]'::jsonb,
  1,
  'Metin, GSYH''nın ekonomik faaliyeti ölçtüğünü ancak doğal sermayenin tükenmesini hesaba katmadığını açıkça belirtmektedir.',
  5, 2
),
(
  'aa000015-0000-4000-aa00-000000000015', 'vocabulary',
  'Metinde geçen "internalize" kelimesinin bu ekonomik bağlamdaki anlamı nedir?',
  '["İhraç etmek","Dış maliyetleri market fiyatlarına yansıtmak / içselleştirmek","Sübvanse etmek","Düzenleme kapsamına almak"]'::jsonb,
  1,
  '"Internalize externalities" dışsal maliyetlerin piyasa fiyatlarına yansıtılması, yani içselleştirilmesi anlamına gelmektedir.',
  5, 3
),
(
  'aa000015-0000-4000-aa00-000000000015', 'detail',
  'Metne göre iskonto oranları (discount rates) iklim değişikliği politikasıyla nasıl ilişkilidir?',
  '["Yüksek iskonto oranları yeşil tahvillerin getirisini artırır","Yüksek iskonto oranları gelecek nesillerin refahını fiilen düşürür ve iklim değişikliği gibi uzun vadeli sorunlarda eylemsizliği haklı kılabilir","Düşük iskonto oranları kısa vadeli yatırımları teşvik ederek sürdürülebilir kalkınmayı engeller","İskonto oranları yalnızca özel sektörün yatırım kararlarını etkiler"]'::jsonb,
  1,
  'Metin, yüksek iskonto oranlarının gelecek nesillerin refahını değersizleştirerek uzun vadeli sorunlarda eylemsizliği meşrulaştırabileceğini açıklamaktadır.',
  5, 4
),
(
  'aa000015-0000-4000-aa00-000000000015', 'inference',
  '"Çörek ekonomisi" (doughnut economics) çerçevesinden çıkarılabilecek en uygun sonuç nedir?',
  '["Ekonomik büyüme çevresel sürdürülebilirlikle her zaman bağdaşmaz","İnsanlığın güvenli ve adil alanı, tüm temel ihtiyaçları karşılayan sosyal bir temel ile gezegensel sınırların aşılmasını önleyen ekolojik bir tavan arasında bulunmaktadır","Çörek ekonomisi çerçevesi yalnızca gelişmiş ekonomiler için geçerlidir","GSYH büyümesi ile ekolojik tavan arasında doğrudan bir çatışma yoktur"]'::jsonb,
  1,
  'Metin, çörek ekonomisini sosyal temel ile ekolojik tavan arasındaki güvenli ve adil alan olarak tanımlamaktadır.',
  5, 5
);


RAISE NOTICE '055: YDS Okuma — 15 metin ve 75 soru başarıyla eklendi.';

END; $migration$;
