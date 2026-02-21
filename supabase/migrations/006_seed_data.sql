-- =====================================================
-- 006_seed_data.sql
-- Egzersiz tanımları + Rozet tanımları
-- =====================================================

-- =====================================================
-- EGZERSİZ TANIMLARI
-- =====================================================
INSERT INTO exercises (module_code, exercise_type, name, description, instructions, default_difficulty, xp_base, is_premium) VALUES

-- Speed Control
('speed_control', 'rsvp', 'Flash Okuma',
 'Kelimeler hızla ekranda belirir',
 'Ekranda beliren kelimeleri takip et. Anlamaya çalış, WPM artıkça zorluk artar.',
 5, 15, false),

('speed_control', 'chunking', 'Kelime Gruplama',
 'Metni kelime grupları halinde oku',
 '2-3 kelimelik gruplara odaklan, aralarındaki boşluklarda gözünü durdur.',
 4, 12, false),

('speed_control', 'pacing', 'Rehberli Okuma',
 'Işıklı rehber ile hızlı okuma',
 'Ekrandaki ışığı takip ederek oku. Geri dönme, ileriye devam et.',
 3, 10, false),

('speed_control', 'speed_burst', 'Hız Patlaması',
 '30 saniyelik yoğun hız sprinti',
 '30 saniye boyunca mümkün olan en hızlı şekilde oku.',
 7, 20, true),

-- Deep Comprehension
('deep_comprehension', 'main_idea', 'Ana Fikir Avı',
 'Paragrafın ana fikrini bul',
 'Metni oku ve en iyi ana fikri yansıtan seçeneği işaretle.',
 4, 15, false),

('deep_comprehension', 'detail_recall', 'Detay Hafızası',
 'Metin detaylarını hatırla',
 'Metni okuduktan sonra ekranı kapat, soruları yanıtla.',
 5, 15, false),

('deep_comprehension', 'inference', 'Çıkarım Ustası',
 'Metinden çıkarım yap',
 'Yazarın ima ettiği fikirleri sorgulayan soruları yanıtla.',
 7, 20, true),

('deep_comprehension', 'critical_reading', 'Eleştirel Okuma',
 'Metni analitik oku',
 'Yazarın amacını, kullandığı kanıtları ve tutarsızlıkları tespit et.',
 8, 25, true),

-- Attention Power
('attention_power', 'focus_lock', 'Odak Kilidi',
 'Dikkat dağıtıcılara rağmen odaklan',
 'Arka planda hareket ederken metni oku ve soruları yanıtla.',
 5, 15, false),

('attention_power', 'sustained_focus', 'Sürdürülmüş Dikkat',
 '5 dakika tam konsantrasyon',
 '5 dakika boyunca hiç ara vermeden oku.',
 6, 20, false),

('attention_power', 'distraction_resist', 'Dikkat Kalkanı',
 'Bildirim simulasyonlarına direnç',
 'Ekranda çıkan dikkat dağıtıcılara rağmen okumaya devam et.',
 7, 20, true),

-- Mental Reset
('mental_reset', 'breathing', '4-7-8 Nefes',
 'Stres azaltıcı nefes egzersizi',
 '4 say nefes al, 7 say tut, 8 say bırak. 4 kez tekrarla.',
 2, 10, false),

('mental_reset', 'eye_relaxation', 'Göz Dinlendirme',
 'Göz kaslarını gevşet',
 'Ekrandan uzaklaş, uzağa bak, göz kaslarını gevşet.',
 1, 8, false),

('mental_reset', 'focus_reset', 'Zihin Sıfırlama',
 'Konsantrasyonu yenile',
 'Kısa meditasyon ve odak tekrarlama egzersizi.',
 3, 12, false);

-- =====================================================
-- ROZET TANIMLARI
-- =====================================================
INSERT INTO badges (code, name, description, icon_name, color, category, rarity, condition_type, condition_value, xp_reward) VALUES

('first_session', 'İlk Adım',
 'İlk egzersizini tamamladın!',
 'play-circle', '#10B981', 'milestone', 'common', 'sessions_count', 1, 50),

('streak_3', '3 Günlük Seri',
 '3 gün üst üste çalıştın',
 'flame', '#F59E0B', 'streak', 'common', 'streak_days', 3, 100),

('streak_7', 'Haftalık Şampiyon',
 '7 gün kesintisiz çalışma',
 'flame', '#EF4444', 'streak', 'rare', 'streak_days', 7, 250),

('streak_30', 'Aylık Efsane',
 '30 gün kesintisiz!',
 'trophy', '#8B5CF6', 'streak', 'epic', 'streak_days', 30, 1000),

('arp_200', 'ARP 200',
 'ARP değerin 200 e ulaştı',
 'trending-up', '#6366F1', 'speed', 'common', 'arp_reach', 200, 200),

('arp_300', 'ARP 300',
 'Üst düzey okuma performansı',
 'trending-up', '#EC4899', 'speed', 'rare', 'arp_reach', 300, 500),

('sessions_10', '10 Egzersiz',
 '10 egzersiz tamamladın',
 'check-circle', '#10B981', 'milestone', 'common', 'sessions_count', 10, 150),

('sessions_50', '50 Egzersiz',
 '50 egzersiz tamamladın',
 'star', '#F59E0B', 'milestone', 'rare', 'sessions_count', 50, 400),

('sessions_100', 'Yüzlük Kulüp',
 '100 egzersiz tamamladın',
 'award', '#EF4444', 'milestone', 'epic', 'sessions_count', 100, 1000),

('comprehension_90', 'Anlama Uzmanı',
 'Anlama oranı 90 a ulaştı',
 'brain', '#8B5CF6', 'comprehension', 'rare', 'comprehension_reach', 90, 300),

('diagnostic_complete', 'Kendini Tanı',
 'Tanılama testini tamamladın',
 'clipboard', '#06B6D4', 'milestone', 'common', 'diagnostic', 1, 100);
