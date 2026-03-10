-- 056_yds_vocabulary.sql
-- YDS / YÖKDİL Akademik İngilizce Kelime Bankası (80 kelime)
-- Schema: word, meaning (TR), example_sentence (EN), exam_type='yds',
--         difficulty INT 1-5, wrong_option_1/2/3 (TR)

DO $migration$
BEGIN
  IF EXISTS (SELECT 1 FROM vocabulary_words WHERE exam_type = 'yds' LIMIT 1) THEN
    RAISE NOTICE '056: YDS vocabulary already exists, skipping.';
    RETURN;
  END IF;

  INSERT INTO vocabulary_words (word, meaning, example_sentence, exam_type, difficulty, wrong_option_1, wrong_option_2, wrong_option_3) VALUES

  -- LEVEL 2 (kolay-orta)
  ('analyze',     'çözümlemek, tahlil etmek',         'The researchers analyzed the data carefully.',                         'yds', 2, 'birleştirmek', 'saklamak', 'şikayet etmek'),
  ('approach',    'yaklaşım; yaklaşmak',               'A new approach to learning was introduced.',                          'yds', 2, 'uzaklaşmak', 'reddetmek', 'zarar vermek'),
  ('aspect',      'boyut, yön, görünüm',               'Every aspect of the problem was considered.',                         'yds', 2, 'çözüm', 'engel', 'yanlışlık'),
  ('benefit',     'fayda; faydalanmak',                'Exercise provides many health benefits.',                             'yds', 2, 'zarar', 'tehlike', 'eksiklik'),
  ('category',    'kategori, sınıf',                   'This plant belongs to a rare category.',                              'yds', 2, 'örnek', 'uygunsuzluk', 'fark'),
  ('concept',     'kavram, fikir',                     'The concept of democracy dates back centuries.',                      'yds', 2, 'nesne', 'eylem', 'duygu'),
  ('context',     'bağlam, içerik',                    'Words must be understood in context.',                                'yds', 2, 'tanım', 'özet', 'başlık'),
  ('create',      'yaratmak, oluşturmak',              'Technology has created new opportunities.',                           'yds', 2, 'yıkmak', 'kaybetmek', 'engellemek'),
  ('data',        'veri, bilgi',                       'The data collected over years were analyzed.',                        'yds', 2, 'fikir', 'tahmin', 'yorum'),
  ('define',      'tanımlamak, belirlemek',            'The term must be clearly defined.',                                   'yds', 2, 'silmek', 'karıştırmak', 'dağıtmak'),
  ('establish',   'kurmak, tesis etmek',               'The university was established in 1890.',                             'yds', 2, 'yıkmak', 'satmak', 'kaybetmek'),
  ('evidence',    'kanıt, delil',                      'There is strong evidence for this claim.',                            'yds', 2, 'şüphe', 'iddia', 'sanı'),
  ('factor',      'etken, faktör',                     'Diet is an important factor in health.',                              'yds', 2, 'sonuç', 'etki', 'kazanım'),
  ('focus',       'odaklanmak; odak noktası',          'The lecture focused on climate change.',                              'yds', 2, 'dağılmak', 'karışmak', 'uzaklaşmak'),
  ('function',    'işlev; işlev görmek',               'The brain''s primary function is to process information.',            'yds', 2, 'yapı', 'şekil', 'içerik'),
  ('identify',    'tanımlamak, tespit etmek',          'Scientists identified a new species.',                                'yds', 2, 'saklamak', 'değiştirmek', 'karıştırmak'),
  ('impact',      'etki, etkilemek',                   'Climate change impacts ecosystems globally.',                         'yds', 2, 'azaltmak', 'desteklemek', 'sınırlandırmak'),
  ('indicate',    'göstermek, belirtmek',              'The results indicate a positive trend.',                              'yds', 2, 'gizlemek', 'reddetmek', 'engellemek'),
  ('individual',  'birey; bireysel',                   'Each individual has unique characteristics.',                         'yds', 2, 'grup', 'toplum', 'kurum'),
  ('involve',     'kapsamak, içermek',                 'The project involves several teams.',                                 'yds', 2, 'dışlamak', 'sınırlamak', 'hafifletmek'),
  ('issue',       'sorun, konu; çıkarmak',             'Climate change is a global issue.',                                   'yds', 2, 'çözüm', 'destek', 'kazanım'),
  ('method',      'yöntem, metot',                     'A new method was developed for testing.',                             'yds', 2, 'sonuç', 'amaç', 'kuram'),
  ('obtain',      'elde etmek, kazanmak',              'Permission must be obtained before entry.',                           'yds', 2, 'kaybetmek', 'vermek', 'dağıtmak'),
  ('occur',       'meydana gelmek, olmak',             'Earthquakes occur along fault lines.',                                'yds', 2, 'sona ermek', 'önlenmek', 'azalmak'),
  ('outcome',     'sonuç, çıktı',                      'The outcome of the experiment was surprising.',                       'yds', 2, 'başlangıç', 'giriş', 'kaynak'),
  ('policy',      'politika, strateji',                'The government announced a new energy policy.',                       'yds', 2, 'kural ihlali', 'yanlış uygulama', 'geçici önlem'),
  ('principle',   'ilke, prensip',                     'The principle of equality is fundamental.',                           'yds', 2, 'istisna', 'sapma', 'zorunluluk'),
  ('process',     'süreç; işlemek',                    'Learning is a gradual process.',                                      'yds', 2, 'sonuç', 'çıktı', 'ürün'),
  ('provide',     'sağlamak, sunmak',                  'The program provides financial support.',                             'yds', 2, 'almak', 'talep etmek', 'reddetmek'),
  ('require',     'gerektirmek, istemek',              'This task requires careful planning.',                                'yds', 2, 'önermek', 'izin vermek', 'azaltmak'),

  -- LEVEL 3 (orta)
  ('assume',      'varsaymak, üstlenmek',              'We assume the experiment was fair.',                                  'yds', 3, 'kanıtlamak', 'inkar etmek', 'sonuçlandırmak'),
  ('assess',      'değerlendirmek, ölçmek',            'Teachers regularly assess student performance.',                      'yds', 3, 'göz ardı etmek', 'şikayetçi olmak', 'karşı çıkmak'),
  ('claim',       'iddia etmek; iddia',                'Scientists claim the discovery is significant.',                      'yds', 3, 'inkar etmek', 'kabul etmek', 'onaylamak'),
  ('conclude',    'sonuçlandırmak; sonuca varmak',     'The study concludes that exercise improves memory.',                  'yds', 3, 'başlamak', 'sürdürmek', 'ertelemek'),
  ('consider',    'dikkate almak, göz önünde bulundurmak', 'We must consider all possibilities.',                            'yds', 3, 'reddetmek', 'görmezden gelmek', 'azaltmak'),
  ('contribute',  'katkıda bulunmak',                  'Many factors contribute to success.',                                'yds', 3, 'engellemek', 'azaltmak', 'kısıtlamak'),
  ('demonstrate', 'göstermek, kanıtlamak',             'The experiment demonstrated the theory.',                            'yds', 3, 'gizlemek', 'sorgulamak', 'reddetmek'),
  ('derive',      'türemek; elde etmek',               'Many English words derive from Latin.',                               'yds', 3, 'ortadan kalkmak', 'dönüşmek', 'birleşmek'),
  ('distribute',  'dağıtmak, yaymak',                  'Resources must be distributed fairly.',                              'yds', 3, 'toplamak', 'saklamak', 'kısıtlamak'),
  ('enable',      'mümkün kılmak, imkan tanımak',      'Technology enables global communication.',                           'yds', 3, 'engellemek', 'sınırlamak', 'geciktirmek'),
  ('estimate',    'tahmin etmek; tahmin',              'Scientists estimate the universe is 14 billion years old.',           'yds', 3, 'ölçmek', 'hesaplamak', 'kanıtlamak'),
  ('evaluate',    'değerlendirmek, yargılamak',        'Students are evaluated on multiple criteria.',                        'yds', 3, 'görmezden gelmek', 'atlamak', 'ertelemek'),
  ('examine',     'incelemek, muayene etmek',          'The doctor examined the patient carefully.',                          'yds', 3, 'görmezden gelmek', 'saklamak', 'reddetmek'),
  ('explain',     'açıklamak, izah etmek',             'The professor explained the complex theory.',                         'yds', 3, 'karıştırmak', 'gizlemek', 'çarpıtmak'),
  ('generate',    'üretmek, oluşturmak',               'Solar panels generate electricity.',                                  'yds', 3, 'tüketmek', 'azaltmak', 'engellemek'),
  ('hypothesis',  'hipotez, varsayım',                 'The researcher tested a new hypothesis.',                             'yds', 3, 'sonuç', 'kanıt', 'kural'),
  ('imply',       'ima etmek, çağrıştırmak',           'His tone implied he was unhappy.',                                    'yds', 3, 'açıkça belirtmek', 'reddetmek', 'inkar etmek'),
  ('influence',   'etkilemek; etki, nüfuz',            'Culture greatly influences behavior.',                                'yds', 3, 'görmezden gelmek', 'izole etmek', 'sınırlamak'),
  ('investigate', 'araştırmak, soruşturmak',           'Detectives investigated the crime scene.',                            'yds', 3, 'görmezden gelmek', 'gizlemek', 'saptırmak'),
  ('interpret',   'yorumlamak, değerlendirmek',        'Researchers interpreted the results differently.',                    'yds', 3, 'çarpıtmak', 'inkar etmek', 'gizlemek'),
  ('justify',     'haklı çıkarmak, gerekçelendirmek', 'You must justify your decision.',                                     'yds', 3, 'eleştirmek', 'reddetmek', 'suçlamak'),
  ('maintain',    'sürdürmek; iddia etmek',            'He maintained his innocence throughout.',                             'yds', 3, 'terk etmek', 'azaltmak', 'değiştirmek'),
  ('observe',     'gözlemlemek; fark etmek',           'Scientists observed unusual behavior in animals.',                    'yds', 3, 'görmezden gelmek', 'gizlemek', 'değiştirmek'),
  ('participate', 'katılmak, iştirak etmek',           'Students participated in the discussion.',                           'yds', 3, 'çekilmek', 'reddetmek', 'engellemek'),
  ('perceive',    'algılamak, hissetmek',              'People perceive the world differently.',                              'yds', 3, 'görmezden gelmek', 'reddetmek', 'abartmak'),
  ('perspective', 'bakış açısı, perspektif',           'Consider this problem from a different perspective.',                 'yds', 3, 'sonuç', 'çözüm', 'engel'),
  ('propose',     'önermek, teklif etmek',             'The scientist proposed a new theory.',                                'yds', 3, 'reddetmek', 'eleştirmek', 'inkar etmek'),
  ('regulate',    'düzenlemek, kontrol etmek',         'The government regulates financial markets.',                         'yds', 3, 'serbest bırakmak', 'karıştırmak', 'görmezden gelmek'),
  ('reveal',      'ortaya çıkarmak, açıklamak',        'The study revealed unexpected results.',                              'yds', 3, 'gizlemek', 'saklamak', 'örtbas etmek'),
  ('role',        'rol, işlev, görev',                 'Education plays a key role in development.',                          'yds', 3, 'sonuç', 'engel', 'yük'),

  -- LEVEL 4 (zor)
  ('albeit',      'her ne kadar... olsa da, karşın',   'The study was small, albeit significant.',                            'yds', 4, 'bu nedenle', 'bununla birlikte', 'özellikle'),
  ('conceive',    'tasarlamak; kavramak',               'It is hard to conceive of a world without technology.',              'yds', 4, 'reddetmek', 'eleştirmek', 'azaltmak'),
  ('constitute',  'oluşturmak, teşkil etmek',          'This finding constitutes strong evidence.',                           'yds', 4, 'yıkmak', 'azaltmak', 'kısıtlamak'),
  ('correlate',   'bağlantılı olmak, ilişkilendirmek', 'Income correlates with education level.',                            'yds', 4, 'çelişmek', 'bağımsız olmak', 'azalmak'),
  ('critique',    'eleştiri; eleştirmek',               'The professor gave a detailed critique of the essay.',               'yds', 4, 'övgü', 'kabul', 'destek'),
  ('discern',     'ayırt etmek, sezinlemek',            'It was difficult to discern the truth.',                             'yds', 4, 'karıştırmak', 'görmezden gelmek', 'abartmak'),
  ('empirical',   'deneysel, ampirik',                  'Empirical evidence supports this theory.',                           'yds', 4, 'kuramsal', 'varsayımsal', 'soyut'),
  ('explicit',    'açık, sarih, net',                   'The author was explicit about his intentions.',                      'yds', 4, 'kapalı', 'belirsiz', 'karmaşık'),
  ('fundamental', 'temel, esaslı',                      'Trust is fundamental to any relationship.',                          'yds', 4, 'önemsiz', 'ikincil', 'yüzeysel'),
  ('inherent',    'doğasında olan, özünde var olan',    'There is an inherent risk in every investment.',                     'yds', 4, 'dışsal', 'kazanılmış', 'geçici'),
  ('mitigate',    'azaltmak, hafifletmek',              'We must mitigate the effects of pollution.',                         'yds', 4, 'artırmak', 'yoğunlaştırmak', 'şiddetlendirmek'),
  ('paradigm',    'paradigma, model, çerçeve',          'This discovery shifted the scientific paradigm.',                    'yds', 4, 'sapkınlık', 'istisna', 'çelişki'),
  ('phenomenon',  'fenomen, olgu',                      'Globalization is a modern phenomenon.',                              'yds', 4, 'kural', 'yasa', 'kavram'),
  ('prominent',   'önemli, belirgin, önde gelen',       'She is a prominent figure in science.',                              'yds', 4, 'önemsiz', 'bilinmez', 'ikincil'),
  ('rigorous',    'titiz, sıkı, kapsamlı',              'The research required rigorous testing.',                             'yds', 4, 'yüzeysel', 'gevşek', 'belirsiz'),
  ('significant', 'önemli, anlamlı',                    'The discovery was significant for medicine.',                        'yds', 4, 'önemsiz', 'sıradan', 'geçici'),
  ('subsequent',  'sonraki, takip eden',                'Subsequent studies confirmed the findings.',                         'yds', 4, 'önceki', 'eş zamanlı', 'rastlantısal'),
  ('sustain',     'sürdürmek; desteklemek',             'We must sustain our efforts to reduce pollution.',                   'yds', 4, 'terk etmek', 'zayıflatmak', 'tersine çevirmek'),
  ('validate',    'doğrulamak, geçerli kılmak',         'The experiment validated the hypothesis.',                           'yds', 4, 'geçersiz kılmak', 'çürütmek', 'sorgulamak'),
  ('variable',    'değişken; değişken olan',            'Several variables affected the outcome.',                            'yds', 4, 'sabit', 'belirli', 'doğrusal');

  RAISE NOTICE '056: YDS Vocabulary — 80 kelime başarıyla eklendi.';
END;
$migration$ LANGUAGE plpgsql;
