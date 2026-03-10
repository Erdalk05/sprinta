-- 057_lgs_ingilizce.sql
-- LGS İngilizce Okuma Metinleri (8 metin + 32 soru)
-- text_library.difficulty: INTEGER (1=kolay, 2=orta, 3=zor)
-- text_questions.options: JSONB array, difficulty: INTEGER

DO $migration$
BEGIN
  IF EXISTS (SELECT 1 FROM text_library WHERE id = 'b5000001-0000-4000-b500-000000000001'::uuid) THEN
    RAISE NOTICE '057: already exists';
    RETURN;
  END IF;

  -- TEXT 1: Technology in Daily Life
  INSERT INTO text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'b5000001-0000-4000-b500-000000000001',
    'Technology in Our Daily Life',
    'Technology has changed the way we live in many ways. Smartphones are one of the most important inventions of the last twenty years. People use them to communicate, take photos, listen to music, and find information. Today, almost everyone has a smartphone, even young students.

The internet is another great technology. It connects people from all over the world. We can talk with friends in different countries, watch videos, and learn new things online. Many students use the internet to study and do their homework.

However, technology also has some problems. Some people spend too much time on their phones and computers. This can hurt their eyes and make them feel tired. Children sometimes prefer watching videos instead of playing outside. This is not healthy for their bodies or minds.

Experts say that we should use technology wisely. We should set time limits for screen use and take breaks. It is important to balance technology with outdoor activities, sports, and face-to-face conversations with family and friends.

Technology is a powerful tool. When we use it carefully, it can help us learn more, work better, and stay connected with the world. The key is to be in control of technology, not to let technology control us.',
    310, 1, 'LGS', 'LGS İngilizce', ARRAY['teknoloji', 'günlük hayat', 'internet'], 'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('b5000001-0000-4000-b500-000000000001', 'main_idea',
   'Bu metnin ana fikri nedir?',
   '["Akıllı telefonlar hayatı kolaylaştırır.", "Teknolojiyi bilinçli kullanmak önemlidir.", "İnternet eğitimi iyileştirir.", "Ekran başında çok zaman geçirmek zararlıdır."]'::jsonb,
   1, 'Metin hem teknolojinin faydalarını hem de zararlarını anlatır ve bilinçli kullanımı vurgular.', 1, 1),
  ('b5000001-0000-4000-b500-000000000001', 'detail',
   'Uzmanlara göre ekran kullanımıyla ilgili ne yapmalıyız?',
   '["Telefonu tamamen bırakmalıyız.", "Süre sınırı koymalı ve ara vermeliyiz.", "Sadece eğitim için kullanmalıyız.", "Yalnızca hafta sonları kullanmalıyız."]'::jsonb,
   1, 'Metin uzmanların ekran kullanımı için zaman sınırı koyulmasını ve ara verilmesini önerdiğini belirtir.', 1, 2),
  ('b5000001-0000-4000-b500-000000000001', 'vocabulary',
   '"Connects" kelimesinin Türkçe anlamı nedir?',
   '["keser", "bağlar", "korur", "geliştirir"]'::jsonb,
   1, '"Connect" bağlamak, birbirine bağlamak anlamına gelir.', 1, 3),
  ('b5000001-0000-4000-b500-000000000001', 'inference',
   'Metne göre aşağıdakilerden hangisi çıkarılabilir?',
   '["Teknoloji tamamen zararlıdır.", "İnternetsiz modern hayat mümkün değildir.", "Teknoloji hem faydalı hem de riskli olabilir.", "Akıllı telefon kullanmayan kişiler daha sağlıklıdır."]'::jsonb,
   2, 'Metin teknolojinin faydalarını ve risklerini dengeli biçimde aktarır, bu nedenle üçüncü seçenek doğrudur.', 1, 4);

  -- TEXT 2: Environment and Recycling
  INSERT INTO text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'b5000002-0000-4000-b500-000000000002',
    'Protecting Our Environment',
    'Our planet Earth is in danger. Every year, humans produce millions of tons of garbage. Plastic is one of the biggest problems. Plastic bags, bottles, and packaging take hundreds of years to break down in nature. They pollute our oceans, forests, and streets.

Recycling is one important way to help the environment. When we recycle, we use old materials to make new products. Paper, glass, metal, and plastic can all be recycled. This reduces waste and saves energy. For example, recycling one aluminum can save enough energy to power a television for three hours.

Many countries have started recycling programs. People separate their waste into different bins: paper, glass, plastic, and organic waste. Schools also teach children about recycling and environmental protection from a young age.

We can all do small things to help our planet. We can use reusable bags instead of plastic ones. We can turn off lights when we leave a room. We can take shorter showers to save water. These small habits make a big difference over time.

It is everyone''s responsibility to protect the environment. Governments, companies, and individuals must all work together. If we act now, future generations will be able to enjoy a clean and healthy planet.',
    310, 2, 'LGS', 'LGS İngilizce', ARRAY['çevre', 'geri dönüşüm', 'doğa'], 'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('b5000002-0000-4000-b500-000000000002', 'main_idea',
   'Metnin ana konusu nedir?',
   '["Plastik atıkların tarihçesi", "Çevreyi koruma ve geri dönüşümün önemi", "Farklı ülkelerdeki çevre yasaları", "Enerji tasarrufu yöntemleri"]'::jsonb,
   1, 'Metin çevreyi korumanın önemini ve geri dönüşümü anlatmaktadır.', 2, 1),
  ('b5000002-0000-4000-b500-000000000002', 'detail',
   'Metne göre, bir alüminyum kutuyu geri dönüştürmek ne kadar enerji tasarrufu sağlar?',
   '["Bir bilgisayarı bir gün çalıştıracak kadar.", "Bir televizyonu üç saat çalıştıracak kadar.", "Bir arabayı bir saat kullanacak kadar.", "Bir buzdolabını bir gün çalıştıracak kadar."]'::jsonb,
   1, 'Metinde "recycling one aluminum can save enough energy to power a television for three hours" ifadesi geçmektedir.', 2, 2),
  ('b5000002-0000-4000-b500-000000000002', 'vocabulary',
   '"Reduce" kelimesinin Türkçe karşılığı nedir?',
   '["artırmak", "azaltmak", "değiştirmek", "korumak"]'::jsonb,
   1, '"Reduce" azaltmak anlamına gelir.', 1, 3),
  ('b5000002-0000-4000-b500-000000000002', 'inference',
   'Metne göre bireyler çevre için ne yapabilir?',
   '["Sadece hükümetlerin sorumluluğu olduğu için bireyler bir şey yapamaz.", "Alışkanlıklarını değiştirerek küçük ama etkili adımlar atabilirler.", "Yalnızca büyük şirketler çevreci olmalıdır.", "Çevre sorunları zaten çözülmüştür."]'::jsonb,
   1, 'Metin bireylerin de sorumlu olduğunu ve küçük değişikliklerin fark yaratacağını vurgular.', 2, 4);

  -- TEXT 3: Sports and Health
  INSERT INTO text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'b5000003-0000-4000-b500-000000000003',
    'Sports and a Healthy Life',
    'Being healthy is one of the most important things in life. Sports and physical activity play a big role in keeping us healthy. When we exercise regularly, our bodies become stronger and our minds become sharper.

There are many types of sports. Individual sports like swimming, running, and cycling help improve personal fitness. Team sports like football, basketball, and volleyball teach us how to work with others and develop social skills. Both types are beneficial and fun.

Studies show that children who participate in sports regularly have better concentration in school. Exercise increases blood flow to the brain, which helps with memory and learning. Students who are physically active tend to get better grades and feel happier.

However, some young people today prefer to spend their free time playing video games or watching television. A sedentary lifestyle can lead to serious health problems such as obesity, heart disease, and diabetes. Health experts recommend that children exercise for at least one hour every day.

Parents and schools both have important roles in encouraging children to be active. Schools should provide enough sports classes and open spaces for play. Parents should take their children to parks and sports clubs. Making exercise a fun and regular habit from childhood can lead to a long and healthy life.',
    310, 2, 'LGS', 'LGS İngilizce', ARRAY['spor', 'sağlık', 'egzersiz'], 'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('b5000003-0000-4000-b500-000000000003', 'main_idea',
   'Bu metnin ana fikri nedir?',
   '["Takım sporları bireysel sporlardan daha iyidir.", "Düzenli egzersiz ve spor sağlıklı yaşam için önemlidir.", "Video oyunları gençler için zararlıdır.", "Okul sporları çocukları mutlu eder."]'::jsonb,
   1, 'Metin spor ve egzersizin sağlık üzerindeki genel olumlu etkilerini açıklamaktadır.', 2, 1),
  ('b5000003-0000-4000-b500-000000000003', 'detail',
   'Araştırmalara göre, düzenli spor yapan çocuklar için hangisi doğrudur?',
   '["Daha az uyurlar.", "Okul başarıları daha yüksektir.", "Bireysel sporları tercih ederler.", "Sosyal problemleri azalır."]'::jsonb,
   1, 'Metin düzenli egzersiz yapan öğrencilerin daha iyi notlar aldığını ve daha mutlu hissettiklerini belirtir.', 2, 2),
  ('b5000003-0000-4000-b500-000000000003', 'vocabulary',
   '"Sedentary" kelimesinin anlamı bağlama göre nedir?',
   '["aktif", "hareketsiz", "spor seven", "rekabetçi"]'::jsonb,
   1, '"Sedentary lifestyle" hareketsiz yaşam tarzı anlamına gelir; bağlam sağlık sorunlarıyla ilişkilendirir.', 2, 3),
  ('b5000003-0000-4000-b500-000000000003', 'inference',
   'Metne göre, çocuklara spor alışkanlığı kazandırmak kimin sorumluluğundadır?',
   '["Yalnızca okulların.", "Yalnızca ebeveynlerin.", "Hem okulların hem ebeveynlerin.", "Çocukların kendilerinin."]'::jsonb,
   2, 'Metin hem okulların hem de ebeveynlerin aktif olmalarını teşvik etmede önemli rolleri olduğunu belirtir.', 2, 4);

  -- TEXT 4: Animals and Wildlife
  INSERT INTO text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'b5000004-0000-4000-b500-000000000004',
    'Endangered Animals',
    'Many animals around the world are in danger of extinction. Extinction means that a species disappears forever. Scientists estimate that hundreds of species become extinct every year due to human activities and climate change.

The main reasons for animals becoming endangered include habitat loss, hunting, and pollution. When forests are cut down, animals lose their homes and food sources. Some animals, like elephants and rhinos, are hunted illegally for their tusks and horns. Ocean pollution harms fish and sea creatures.

Conservation efforts are being made worldwide to protect endangered species. National parks and wildlife reserves provide safe areas where animals can live without being disturbed. Organizations like the WWF work to protect animals and raise awareness. Some countries have strict laws against hunting and trading wild animals.

Zoos also play a role in conservation. They participate in breeding programs to increase the population of rare animals. For example, the giant panda population has increased thanks to conservation programs in China.

We can all help protect wildlife in small ways. We should avoid buying products made from endangered animals. We can support wildlife charities and organizations. We can also reduce plastic use to protect marine life. Every action, no matter how small, contributes to protecting our planet''s biodiversity.',
    305, 2, 'LGS', 'LGS İngilizce', ARRAY['hayvanlar', 'nesli tükenmekte', 'doğa koruma'], 'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('b5000004-0000-4000-b500-000000000004', 'main_idea',
   'Metnin ana konusu nedir?',
   '["Nesli tükenmekte olan hayvanlar ve koruma çabaları", "Hayvanat bahçelerinin tarihi", "Küresel ısınmanın etkileri", "Yasadışı avcılık sorunları"]'::jsonb,
   0, 'Metin nesli tükenmekte olan hayvanları ve onları koruma yollarını ele almaktadır.', 2, 1),
  ('b5000004-0000-4000-b500-000000000004', 'detail',
   'Metne göre dev pandas neden nüfusunu artırdı?',
   '["Doğal ortamlarında av olmadığı için.", "Çin''deki koruma programları sayesinde.", "İklim değişikliğine adapte oldukları için.", "Hayvanat bahçelerinde doğal üreme artışı nedeniyle."]'::jsonb,
   1, 'Metin "the giant panda population has increased thanks to conservation programs in China" ifadesini içermektedir.', 2, 2),
  ('b5000004-0000-4000-b500-000000000004', 'vocabulary',
   '"Extinction" kelimesinin anlamı nedir?',
   '["koruma", "nüfus artışı", "yok oluş", "göç"]'::jsonb,
   2, 'Metin "extinction means that a species disappears forever" diyerek yok oluş olarak tanımlar.', 1, 3),
  ('b5000004-0000-4000-b500-000000000004', 'inference',
   'Metne göre aşağıdakilerden hangisi doğrudur?',
   '["Hayvanları yalnızca hükümetler koruyabilir.", "Bireylerin hayvanları korumada yapabileceği hiçbir şey yoktur.", "Bireysel çabalar da biyoçeşitliliğin korunmasına katkı sağlar.", "Tüm koruma çabaları başarısız olmuştur."]'::jsonb,
   2, 'Metin her bireyin küçük de olsa katkıda bulunabileceğini vurgular.', 2, 4);

  -- TEXT 5: School Life
  INSERT INTO text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'b5000005-0000-4000-b500-000000000005',
    'School Life Around the World',
    'School is an important part of every child''s life. However, school systems can be very different from country to country. In some countries, children start school at the age of five or six, while in others they start at seven.

In Finland, one of the world''s top-ranked education systems, children do not start formal schooling until the age of seven. Finnish schools have less homework and fewer standardized tests compared to many other countries. Instead, they focus on creativity, problem-solving, and student well-being. Yet Finnish students consistently score among the highest in international tests.

In South Korea and Japan, students study very hard. They go to school for long hours and then attend private tutoring centers called "hagwons" in Korea. The pressure to succeed in exams is very high. These countries have excellent academic results, but some students feel very stressed.

In many developing countries, not all children have access to good schools. Some children must travel long distances to reach the nearest school. Others have to work to help their families instead of attending classes.

The ideal school system balances academic excellence with student happiness and mental health. Students need to learn not only mathematics and science but also social and emotional skills. Schools should be places where children feel safe, supported, and excited to learn.',
    305, 2, 'LGS', 'LGS İngilizce', ARRAY['okul', 'eğitim', 'dünya'], 'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('b5000005-0000-4000-b500-000000000005', 'main_idea',
   'Bu metnin ana fikri nedir?',
   '["Finlandiya eğitim sistemi en iyisidir.", "Okul sistemleri ülkeden ülkeye farklılık gösterir.", "Ödevler başarıyı artırır.", "Özel dersler her ülkede yaygındır."]'::jsonb,
   1, 'Metin dünyanın farklı ülkelerindeki okul sistemlerini karşılaştırarak farklılıkları ele almaktadır.', 2, 1),
  ('b5000005-0000-4000-b500-000000000005', 'detail',
   'Finlandiya okulları hakkında metinde ne söylenmektedir?',
   '["Öğrenciler çok fazla ev ödevi alır.", "Daha az ödev ve daha az standart test uygulanır.", "Öğrenciler yedi yaşında hagwon''a gider.", "Finlandiya sınavlarda düşük puan alır."]'::jsonb,
   1, 'Metin Finlandiya''nın daha az ödev ve standart test uyguladığını belirtmektedir.', 2, 2),
  ('b5000005-0000-4000-b500-000000000005', 'vocabulary',
   '"Consistently" kelimesinin anlamı nedir?',
   '["nadiren", "bazen", "tutarlı biçimde", "şaşırtıcı şekilde"]'::jsonb,
   2, '"Consistently" sürekli, tutarlı biçimde anlamına gelir.', 2, 3),
  ('b5000005-0000-4000-b500-000000000005', 'inference',
   'Metne göre ideal bir okul sistemi nasıl olmalıdır?',
   '["Yalnızca akademik başarıya odaklanmalıdır.", "Akademik başarıyı öğrenci mutluluğu ve ruh sağlığıyla dengelemelidir.", "Öğrencilerin çok çalışmasını sağlamalıdır.", "Tüm ülkelerde aynı müfredatı uygulamalıdır."]'::jsonb,
   1, 'Metin "ideal school system balances academic excellence with student happiness and mental health" demektedir.', 2, 4);

  -- TEXT 6: Food and Nutrition
  INSERT INTO text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'b5000006-0000-4000-b500-000000000006',
    'Healthy Eating Habits',
    'What we eat every day has a direct effect on our health. Good nutrition helps our bodies grow, fight diseases, and function properly. Unfortunately, many people today, especially young people, do not eat a balanced diet.

A balanced diet includes a variety of foods from different groups. Fruits and vegetables provide vitamins and minerals. Whole grains like brown rice and oats give us energy and fiber. Proteins from meat, eggs, beans, and fish help build and repair muscles. Dairy products like milk and yogurt provide calcium for strong bones.

Fast food has become very popular in recent decades. Burgers, fried chicken, chips, and sugary drinks are tasty but they are high in fat, salt, and sugar. Eating too much fast food can cause weight gain, high blood pressure, and other health problems. The World Health Organization (WHO) recommends limiting fast food consumption.

Many families are busy and find it hard to cook healthy meals at home. However, cooking does not have to be difficult or time-consuming. Simple meals with fresh ingredients can be both nutritious and delicious. Planning meals in advance can save time and help maintain a healthy diet.

Learning about nutrition from an early age is important. Schools can teach children about healthy eating through lessons and healthy school lunches. Parents can encourage children to try new foods and help them understand why good nutrition matters for their future health.',
    310, 2, 'LGS', 'LGS İngilizce', ARRAY['beslenme', 'sağlık', 'yemek'], 'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('b5000006-0000-4000-b500-000000000006', 'main_idea',
   'Metnin konusu nedir?',
   '["Fast food restoranlarının tarihi", "Sağlıklı beslenme alışkanlıkları ve dengeli diyet", "Okulların yemek programları", "Tarım ve gıda üretimi"]'::jsonb,
   1, 'Metin sağlıklı yeme alışkanlıklarının önemini ve dengeli diyeti ele almaktadır.', 1, 1),
  ('b5000006-0000-4000-b500-000000000006', 'detail',
   'Dengeli bir diyette proteinlerin kaynağı olarak ne sayılmaktadır?',
   '["Meyve ve sebzeler", "Tam tahıllar ve yulaf", "Et, yumurta, fasulye ve balık", "Süt ürünleri"]'::jsonb,
   2, 'Metin proteinlerin et, yumurta, fasulye ve balıktan geldiğini belirtir.', 1, 2),
  ('b5000006-0000-4000-b500-000000000006', 'vocabulary',
   '"Nutritious" kelimesinin anlamı nedir?',
   '["pahalı", "besleyici", "lezzetli", "kolay hazırlanan"]'::jsonb,
   1, '"Nutritious" besleyici, besin değeri yüksek anlamına gelir.', 1, 3),
  ('b5000006-0000-4000-b500-000000000006', 'inference',
   'Metne göre fast food hakkında hangisi söylenebilir?',
   '["Tamamen yasaklanmalıdır.", "Sağlıklı alternatifleri yoktur.", "Tadı güzel ama aşırı tüketilmesi sağlığa zararlıdır.", "Yalnızca yetişkinler için sorun oluşturur."]'::jsonb,
   2, 'Metin fast food''un lezzetli ama yüksek yağ, tuz ve şeker içerdiğini, aşırı tüketiminin sağlık sorunlarına yol açtığını belirtir.', 2, 4);

  -- TEXT 7: Travel and Culture
  INSERT INTO text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'b5000007-0000-4000-b500-000000000007',
    'The Benefits of Traveling',
    'Traveling is one of the best ways to learn about the world. When we visit new places, we meet different people, experience different cultures, and discover new foods and traditions. Travel opens our minds and makes us more understanding of others.

Every country has its own unique culture. Japan is famous for its technology and ancient traditions. Brazil is known for its colorful festivals and beautiful nature. Turkey has a rich history that connects East and West. Visiting these places teaches us things that no book can fully describe.

Traveling also helps us develop important personal skills. When we travel to a foreign country, we often need to communicate in a different language. This encourages us to learn new languages and become more confident communicators. We also learn to solve problems, adapt to new situations, and become more independent.

Some people think that traveling is too expensive. However, there are many affordable ways to travel. Youth hostels offer cheap accommodation. Budget airlines provide low-cost flights. Traveling during off-peak seasons can save a lot of money.

In recent years, sustainable tourism has become more important. Travelers are encouraged to respect local cultures, protect natural environments, and support local businesses instead of large international companies. Being a responsible traveler means leaving a place better than you found it, and ensuring that future generations can enjoy it too.',
    310, 2, 'LGS', 'LGS İngilizce', ARRAY['seyahat', 'kültür', 'dünya'], 'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('b5000007-0000-4000-b500-000000000007', 'main_idea',
   'Bu metnin ana mesajı nedir?',
   '["Seyahat pahalıdır.", "Seyahat etmek kişisel gelişim ve kültürel anlayış için değerlidir.", "Japonya en iyi seyahat destinasyonudur.", "Bütçe havayolları en iyi seçenektir."]'::jsonb,
   1, 'Metin seyahatin eğitici ve kişisel gelişimi destekleyen faydalarını anlatmaktadır.', 2, 1),
  ('b5000007-0000-4000-b500-000000000007', 'detail',
   'Metne göre seyahat bize hangi becerileri kazandırır?',
   '["Yalnızca dil öğrenimi.", "Problem çözme, adaptasyon ve bağımsızlık.", "Yemek pişirme ve el sanatları.", "Çevre bilinci ve ekoloji."]'::jsonb,
   1, 'Metin seyahatin problem çözme, yeni durumlara uyum ve bağımsızlık kazandırdığını belirtir.', 2, 2),
  ('b5000007-0000-4000-b500-000000000007', 'vocabulary',
   '"Sustainable" kelimesinin anlamı nedir?',
   '["pahalı", "yabancı", "sürdürülebilir", "uygun fiyatlı"]'::jsonb,
   2, '"Sustainable" sürdürülebilir anlamına gelir.', 2, 3),
  ('b5000007-0000-4000-b500-000000000007', 'inference',
   'Metne göre sorumlu bir gezgin nasıl davranır?',
   '["Yalnızca büyük uluslararası otellerde kalır.", "Yerel kültüre saygı gösterir ve çevreyi korur.", "Her yerde aynı şekilde davranır.", "Yalnızca pahalı turlar tercih eder."]'::jsonb,
   1, 'Metin sorumlu gezginin yerel kültüre saygı göstermesi ve çevreyi koruması gerektiğini belirtir.', 2, 4);

  -- TEXT 8: Scientists and Inventors
  INSERT INTO text_library (id, title, body, word_count, difficulty, exam_type, category, tags, status)
  VALUES (
    'b5000008-0000-4000-b500-000000000008',
    'Marie Curie: A Pioneer of Science',
    'Marie Curie was one of the greatest scientists in history. She was born in Warsaw, Poland, in 1867. At a time when women were not allowed to attend university in Poland, she worked as a tutor to save money for her education. She later moved to Paris, where she could study at the Sorbonne University.

Curie worked extremely hard and excelled in physics and mathematics. She married Pierre Curie, a French scientist, and together they conducted research on radioactivity. Marie Curie was the first person to use the term "radioactivity" to describe the property of some elements to emit radiation.

Her most important discoveries were the radioactive elements polonium and radium. She named polonium after her homeland, Poland. In 1903, Marie Curie became the first woman to receive a Nobel Prize, which she won in Physics together with her husband and another scientist. In 1911, she won a second Nobel Prize, this time in Chemistry. She was the first person ever to win two Nobel Prizes in different sciences.

During World War I, she developed mobile X-ray units to help wounded soldiers. Her dedication to science never stopped, even under difficult circumstances.

Sadly, Curie died in 1934 from aplastic anemia, caused by her long exposure to radiation. She did not know at the time how dangerous radiation was. Her story is one of courage, determination, and love for science. She remains an inspiration for scientists, especially women, around the world.',
    315, 3, 'LGS', 'LGS İngilizce', ARRAY['Marie Curie', 'bilim', 'Nobel', 'kadın'], 'published'
  );

  INSERT INTO text_questions (text_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index) VALUES
  ('b5000008-0000-4000-b500-000000000008', 'main_idea',
   'Bu metnin ana konusu nedir?',
   '["Marie Curie''nin çocukluk yılları", "Marie Curie''nin bilime katkıları ve hayatı", "Nobel Ödülü''nün tarihi", "Radyasyonun tehlikeleri"]'::jsonb,
   1, 'Metin Marie Curie''nin bilimsel başarılarını ve hayatını anlatmaktadır.', 2, 1),
  ('b5000008-0000-4000-b500-000000000008', 'detail',
   'Marie Curie Nobel Ödülü''nü kaç kez kazandı?',
   '["Bir kez, fizik alanında.", "İki kez: fizik ve kimya alanlarında.", "Üç kez.", "Hiç kazanmadı, ödülü kocasına verildi."]'::jsonb,
   1, 'Metin Curie''nin 1903''te fizik ve 1911''de kimya alanında Nobel kazandığını belirtmektedir.', 2, 2),
  ('b5000008-0000-4000-b500-000000000008', 'vocabulary',
   '"Determination" kelimesinin anlamı nedir?',
   '["kararsızlık", "merak", "kararlılık", "utangaçlık"]'::jsonb,
   2, '"Determination" kararlılık, azim anlamına gelir.', 2, 3),
  ('b5000008-0000-4000-b500-000000000008', 'inference',
   'Curie''nin polonium elementi neden bu ismi verdiği çıkarılabilir?',
   '["Pierre Curie''nin kızının adından.", "Fransa''nın onuruna.", "Doğduğu ülke Polonya''ya duyduğu bağlılıktan.", "Elementin özelliklerinden."]'::jsonb,
   2, 'Metin "She named polonium after her homeland, Poland" demektedir — vatanına sevgisinden.', 2, 4);

  RAISE NOTICE '057: LGS İngilizce — 8 metin + 32 soru başarıyla eklendi.';
END;
$migration$ LANGUAGE plpgsql;
