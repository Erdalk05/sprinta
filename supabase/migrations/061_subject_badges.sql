-- Migration 061: Subject & Boss Battle Badges
-- Idempotent: skip if already inserted

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM badges WHERE category = 'subject') >= 20 THEN
    RAISE NOTICE '061: subject badges already exist, skipping.';
    RETURN;
  END IF;

  -- LGS Badges
  INSERT INTO badges (code, name, description, icon_name, color, category, rarity, condition_type, condition_value, xp_reward, is_active)
  VALUES
    ('lgs_bronze',  'LGS Bronz',  'LGS sorularında 50 doğru cevaba ulaştın!',            'medal',     '#CD7F32', 'subject', 'common',    'lgs_correct_count',  50,  100,  true),
    ('lgs_silver',  'LGS Gümüş',  'LGS sorularında 150 doğru cevaba ulaştın!',           'medal',     '#C0C0C0', 'subject', 'common',    'lgs_correct_count',  150, 250,  true),
    ('lgs_gold',    'LGS Altın',  'LGS sorularında 300 doğru cevaba ulaştın!',            'trophy',    '#FFD700', 'subject', 'rare',      'lgs_correct_count',  300, 500,  true),
    ('lgs_legend',  'LGS Efsane', 'LGS sorularında 500 doğru cevaba ulaştın. Efsane!',   'crown',     '#FF6B35', 'subject', 'legendary', 'lgs_correct_count',  500, 1000, true);

  -- TYT Badges
  INSERT INTO badges (code, name, description, icon_name, color, category, rarity, condition_type, condition_value, xp_reward, is_active)
  VALUES
    ('tyt_bronze',  'TYT Bronz',  'TYT sorularında 50 doğru cevaba ulaştın!',            'medal',     '#CD7F32', 'subject', 'common',    'tyt_correct_count',  50,  100,  true),
    ('tyt_silver',  'TYT Gümüş',  'TYT sorularında 150 doğru cevaba ulaştın!',           'medal',     '#C0C0C0', 'subject', 'common',    'tyt_correct_count',  150, 250,  true),
    ('tyt_gold',    'TYT Altın',  'TYT sorularında 300 doğru cevaba ulaştın!',            'trophy',    '#FFD700', 'subject', 'rare',      'tyt_correct_count',  300, 500,  true),
    ('tyt_legend',  'TYT Efsane', 'TYT sorularında 500 doğru cevaba ulaştın. Efsane!',   'crown',     '#FF6B35', 'subject', 'legendary', 'tyt_correct_count',  500, 1000, true);

  -- AYT Badges
  INSERT INTO badges (code, name, description, icon_name, color, category, rarity, condition_type, condition_value, xp_reward, is_active)
  VALUES
    ('ayt_bronze',  'AYT Bronz',  'AYT sorularında 50 doğru cevaba ulaştın!',            'medal',     '#CD7F32', 'subject', 'common',    'ayt_correct_count',  50,  100,  true),
    ('ayt_silver',  'AYT Gümüş',  'AYT sorularında 150 doğru cevaba ulaştın!',           'medal',     '#C0C0C0', 'subject', 'common',    'ayt_correct_count',  150, 250,  true),
    ('ayt_gold',    'AYT Altın',  'AYT sorularında 300 doğru cevaba ulaştın!',            'trophy',    '#FFD700', 'subject', 'rare',      'ayt_correct_count',  300, 500,  true),
    ('ayt_legend',  'AYT Efsane', 'AYT sorularında 500 doğru cevaba ulaştın. Efsane!',   'crown',     '#FF6B35', 'subject', 'legendary', 'ayt_correct_count',  500, 1000, true);

  -- YDS Badges
  INSERT INTO badges (code, name, description, icon_name, color, category, rarity, condition_type, condition_value, xp_reward, is_active)
  VALUES
    ('yds_bronze',  'YDS Bronz',  'YDS sorularında 50 doğru cevaba ulaştın!',            'medal',     '#CD7F32', 'subject', 'common',    'yds_correct_count',  50,  100,  true),
    ('yds_silver',  'YDS Gümüş',  'YDS sorularında 150 doğru cevaba ulaştın!',           'medal',     '#C0C0C0', 'subject', 'common',    'yds_correct_count',  150, 250,  true),
    ('yds_gold',    'YDS Altın',  'YDS sorularında 300 doğru cevaba ulaştın!',            'trophy',    '#FFD700', 'subject', 'rare',      'yds_correct_count',  300, 500,  true),
    ('yds_legend',  'YDS Efsane', 'YDS sorularında 500 doğru cevaba ulaştın. Efsane!',   'crown',     '#FF6B35', 'subject', 'legendary', 'yds_correct_count',  500, 1000, true);

  -- General / Boss Badges
  INSERT INTO badges (code, name, description, icon_name, color, category, rarity, condition_type, condition_value, xp_reward, is_active)
  VALUES
    ('boss_slayer_1', 'Boss Yenilmez', 'İlk Boss Savaşı''nı kazandın!',              'lightning', '#7C3AED', 'subject', 'common', 'boss_wins',    1,  300, true),
    ('boss_slayer_5', 'Boss Avcısı',   '5 Boss Savaşı kazandın. Düşmanlar korkuyor!','lightning', '#4F46E5', 'subject', 'rare',   'boss_wins',    5,  750, true),
    ('streak_30',     '30 Günlük Seri','30 gün üst üste çalıştın. Efsane disiplin!', 'fire',      '#F59E0B', 'subject', 'rare',   'streak_days', 30,  500, true),
    ('perfectionist', 'Mükemmeliyetçi','Sınavda tüm soruları doğru yanıtladın!',     'star',      '#10B981', 'subject', 'rare',   'perfect_exam', 1,  400, true);

  RAISE NOTICE '061: 20 subject+boss badges başarıyla eklendi.';
END;
$migration$;
