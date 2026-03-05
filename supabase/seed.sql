-- =====================================================
-- seed.sql — supabase db reset sonrası otomatik çalışır
-- Test kullanıcısı: test@test.com / Test1234
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_now     TIMESTAMPTZ := now();
BEGIN
  -- Kullanıcı zaten varsa ekleme
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'test@test.com' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    RETURN;
  END IF;

  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone, phone_change, reauthentication_token,
    is_super_admin, is_sso_user, is_anonymous
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'test@test.com',
    extensions.crypt('Test1234', extensions.gen_salt('bf')),
    v_now,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Test Kullanici"}'::jsonb,
    v_now, v_now, '', '',
    '', '', '',
    '', '', '',
    false, false, false
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', 'test@test.com', 'email_verified', true),
    'email',
    'test@test.com',
    v_now, v_now, v_now
  );
END;
$$;
