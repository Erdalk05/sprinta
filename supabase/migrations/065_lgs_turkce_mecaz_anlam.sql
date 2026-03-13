-- ================================================================
-- 065_lgs_turkce_mecaz_anlam.sql
-- LGS Türkçe — Anlam Bilgisi: Mecaz Anlam
-- 1 metin × 10 soru = 10 soru
--
-- Konu: Sözcüklerin mecaz (aktarmalı) anlam kazanması
-- Kategori: 'Türkçe' (ContentLibraryScreen: LGS → Türkçe)
-- Soru tipi: vocabulary (mecaz anlam / sözcük sorusu)
-- ================================================================

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM text_library WHERE id = 'a1000001-0000-4000-a100-000000000001') > 0 THEN
    RAISE NOTICE '065: already exists, skipping';
    RETURN;
  END IF;

  -- ============================================================
  -- METİN: Dil Sanatı — Mecaz Anlam
  -- ============================================================
  INSERT INTO text_library
    (id, title, category, exam_type, difficulty, word_count, estimated_read_time, body, tags, status)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'Anlam Bilgisi: Mecaz Anlam',
    'Türkçe',
    'LGS',
    2,
    258,
    90,
    $body$Türkçede sözcükler, gerçek anlamlarının dışına çıkarak yeni ve zengin anlamlar kazanabilir. Buna mecaz anlam denir. Bir sözcük, benzerlik veya bağlantı yoluyla başka bir kavramı karşıladığında gerçek anlamından uzaklaşmış olur; bu durum dilin anlatım gücünü büyük ölçüde artırır.

Günlük hayatımızda mecaz anlamlı kullanımlara sık sık rastlarız. "Çekmek" sözcüğü birini hayran bırakma anlamında; "keskin" sözcüğü sözlerin sert ve kırıcı etkisini anlatmak için; "soğuk" ise ilişkilerdeki mesafeyi dile getirmek amacıyla mecazi biçimde kullanılır. "Hafif" bir davranış, ağırlık ölçmekle değil; ciddiyetten uzak olmakla ilişkilidir.

Türkçe, mecaz anlamlar bakımından oldukça zengin bir dildir. "Pişmek" sözcüğü, ateşte bir şeylerin hazırlanmasının yanı sıra bir işte deneyim kazanmayı da anlatır. "Yıkılmak" bir bina için kullanıldığında somut bir anlam taşırken insanın hayal kırıklığı ve üzüntüsünü ifade etmek için mecaz anlam kazanır. "Kirli" bir oyun, toz ya da çamurla değil; dürüstlükten uzak hileli davranışlarla ilgilidir.

Mecaz anlam her yerdedir. Bir habere şaşırıp "donmak", bir sessizliği "kırmak", "boş" konuşmalar yapmak... Bunların hepsi gerçek anlamdan soyutlanmış mecazi ifadelerdir.

LGS sınavında mecaz anlam soruları, sözcüğün bağlamını doğru değerlendirmeyi gerektirir. Gerçek anlam ile mecaz anlam arasındaki farkı kavramak, Türkçe sorularında kalıcı başarının temelidir.$body$,
    ARRAY['mecaz anlam','sözcükte anlam','anlam bilgisi','LGS','Türkçe'],
    'published'
  );

  -- ============================================================
  -- SORULAR (10 adet — LGS mecaz anlam soruları)
  -- ============================================================

  -- S1 — çekmek
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Yazarın son kitabındaki bu sürükleyici anlatım, okuru adeta kendi dünyasına çekiyor." cümlesinde 'çekmek' sözcüğünün kazandığı anlam aşağıdakilerden hangisidir?$$,
    '["Bir şeyi tutup kendine doğru hareket ettirmek.","Birini veya bir şeyi kendine hayran bırakıp ilgisini üzerinde toplamak.","Bir yerden başka bir yere taşımak.","Bir nesnenin ağırlığını ölçmek."]'::jsonb,
    1,
    'Burada fiziksel bir çekme eylemi değil, ilgi uyandırma ve etkileme söz konusudur. Bu mecaz bir kullanımdır.',
    2,
    1
  );

  -- S2 — boş
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Bu kadar boş konuşmalarla vaktimizi harcamana artık tahammülümüz kalmadı." cümlesindeki 'boş' sözcüğünün aynı anlamda kullanıldığı seçenek aşağıdakilerden hangisidir?$$,
    '["Evin arkasındaki boş arsada çocuklar top oynuyordu.","İçindeki su bitince boş şişeyi çöpe attı.","Sınavda sorulardan birini emin olamadığı için boş bıraktı.","Geleceğe dair sunduğu bütün vaatlerin ne kadar boş olduğu anlaşıldı."]'::jsonb,
    3,
    'Metindeki boş kelimesi anlamsız, içeriği olmayan anlamındadır. D şıkkındaki boş vaat de aynı mecazı taşır.',
    2,
    2
  );

  -- S3 — keskin
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Söylediği bu keskin sözler, odadaki herkesin bir anda sessizleşmesine neden oldu." cümlesinde 'keskin' sözcüğünün anlamı aşağıdakilerden hangisidir?$$,
    '["Vücutta derin yaralar açan nesne.","Görüş mesafesi çok açık olan.","Kırıcı, incitici, sert etkili.","Hızla ilerleyen ve çevik olan."]'::jsonb,
    2,
    'Sözün keskin olması, fiziksel bir kesicilik değil, kalbi kıran bir sertlik ifade eder. Bu mecaz bir kullanımdır.',
    2,
    3
  );

  -- S4 — pişmek
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Yeni projesine başlarken karşılaştığı engeller onu iyice pişirmiş, tecrübe kazandırmıştı." cümlesindeki 'pişmek' ile aynı anlamda kullanıldığı seçenek hangisidir?$$,
    '["Fırındaki börekler iyice pişince tüm mutfağı güzel bir koku sardı.","Güneşin altında bekleyen meyveler iyice pişip yere dökülmüş.","Genç avukat, bu zor davalar sayesinde mesleğinde iyice pişti.","Tenceredeki etler henüz pişmediği için yemeği biraz daha bekletti."]'::jsonb,
    2,
    'Metindeki pişmek, bir işte deneyim kazanmak anlamında mecaz anlam taşır. C şıkkı da aynı mecazla kullanılmıştır.',
    2,
    4
  );

  -- S5 — soğuk
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Aralarındaki bu soğuk hava, bir türlü çözülemeyen eski bir anlaşmazlıktan kaynaklanıyordu." cümlesinde 'soğuk' sözcüğünün kazandığı anlam aşağıdakilerden hangisidir?$$,
    '["Isı derecesi normalin altında olan.","Sevgi ve samimiyetten yoksun olan, mesafeli.","Kış mevsimine özgü olan dondurucu etki.","Tadı bozulmuş olan yiyecek veya içecek."]'::jsonb,
    1,
    'İlişkilerdeki soğukluk duygusal mesafeyi anlattığı için mecaz bir kullanımdır.',
    2,
    5
  );

  -- S6 — hafif
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Onun bu hafif davranışları, iş arkadaşlarının ona olan güvenini sarsıyordu." cümlesinde 'hafif' sözcüğü hangi seçenekte aynı mecaz anlamıyla kullanılmıştır?$$,
    '["Çantası çok hafif olduğu için bütün yolu yürüyerek gitti.","Dışarıda hafif bir rüzgar esiyor, yapraklar kımıldıyordu.","Doktor, hastasına daha hafif yiyecekler tüketmesini önerdi.","Önemli bir toplantıda böyle hafif bir tavır takınması yanlıştı."]'::jsonb,
    3,
    'D şıkkındaki hafif tavır, ciddiyetten uzak anlamında mecaz anlam taşır. Diğer seçeneklerde gerçek anlam kullanılmıştır.',
    2,
    6
  );

  -- S7 — yıkılmak
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Son sınavdan düşük alınca bütün umutları bir anda yıkıldı." cümlesinde 'yıkılmak' sözcüğünün kazandığı anlam aşağıdakilerden hangisidir?$$,
    '["Bir yapının taşlarının yerinden çıkıp devrilmesi.","Gerekli olan gücü yitirip ayakta duramaz hale gelmek.","Çok üzülmek, büyük bir hayal kırıklığına uğramak.","Aşırı yorgunluktan dolayı yatağa uzanmak."]'::jsonb,
    2,
    'Umutların yıkılması, bir binanın devrilmesi değil, manevi bir çöküşü anlatır. Bu mecaz bir kullanımdır.',
    2,
    7
  );

  -- S8 — kirli
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Bu kadar kirli bir oyuna alet olduğun için sana gerçekten inanamıyorum." cümlesinde 'kirli' sözcüğünün anlamı aşağıdakilerden hangisidir?$$,
    '["Toz, çamur gibi dış etkenlerle lekelenmiş.","Yıkanma zamanı gelmiş olan giysi.","Dürüst olmayan, hileli, ahlaka aykırı.","Rengi solmuş veya parlaklığını yitirmiş."]'::jsonb,
    2,
    'Metindeki kirli oyun, leke değil hile ve dürüstlük dışı işleri ifade eder. Bu mecaz bir kullanımdır.',
    2,
    8
  );

  -- S9 — kırmak
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Herkesin sustuğu bir anda konuşarak bu sessizliği kırmayı başardı." cümlesindeki 'kırmak' ile aynı anlamda kullanıldığı seçenek hangisidir?$$,
    '["Yanlışlıkla vazoyu kırınca annesinden özür diledi.","Yeni gelen memur, ofisteki soğuk havayı bir espriyle kırdı.","Cevizleri kırmak için mutfaktan bir taş getirdi.","Kapının kolunu çok sert çevirince koldan bir parça kırdı."]'::jsonb,
    1,
    'Metindeki sessizliği kırmak, bir durumu değiştirip sonlandırmak anlamındadır. B şıkkı da aynı mecazla kullanılmıştır.',
    3,
    9
  );

  -- S10 — donmak
  INSERT INTO text_questions
    (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index)
  VALUES (
    'a1000001-0000-4000-a100-000000000001',
    'vocabulary',
    $$"Haberi duyunca yüzündeki gülümseme bir anda dondu." cümlesinde 'donmak' sözcüğünün kazandığı anlam aşağıdakilerden hangisidir?$$,
    '["Sıvı bir maddenin soğuktan katı hale geçmesi.","Havanın çok soğuması nedeniyle üşümek.","Beklenmedik bir durum karşısında şaşırıp kalmak, hareketsizleşmek.","Bir makinenin çalışırken aniden takılıp kalması."]'::jsonb,
    2,
    'Gülümsemenin donması, fiziksel bir buz tutma değil, şaşkınlık karşısında anlık bir duraklamayı anlatır.',
    2,
    10
  );

END $migration$;
