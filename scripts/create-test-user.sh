#!/bin/bash
# ============================================================
# create-test-user.sh
# Test kullanıcısını yeniden oluşturur.
# Supabase db reset sonrasında veya kullanıcı kaybolduğunda çalıştır:
#
#   bash scripts/create-test-user.sh
#
# Kullanıcı zaten varsa güvenli biçimde günceller (upsert).
# ============================================================

set -e

SUPABASE_URL="http://127.0.0.1:54321"
SERVICE_KEY="sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

EMAIL="test@test.com"
PASSWORD="Test1234"
FULL_NAME="Test Kullanici"

echo "🔧 Test kullanıcısı oluşturuluyor: $EMAIL"

# 1) Varsa sil, sonra yeniden oluştur (temiz upsert)
EXISTING_ID=$(psql "$DB_URL" -t -A -c \
  "SELECT id FROM auth.users WHERE email='$EMAIL' LIMIT 1;" 2>/dev/null | tr -d ' ')

if [ -n "$EXISTING_ID" ]; then
  echo "   Mevcut kullanıcı siliniyor... ($EXISTING_ID)"
  psql "$DB_URL" -c \
    "DELETE FROM auth.identities WHERE user_id='$EXISTING_ID';
     DELETE FROM auth.users      WHERE id='$EXISTING_ID';" > /dev/null 2>&1
fi

# 2) Supabase admin API ile oluştur
RESULT=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"email_confirm\": true,
    \"user_metadata\": {\"full_name\": \"$FULL_NAME\"}
  }")

NEW_ID=$(echo "$RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id','HATA'))" 2>/dev/null)

if [ "$NEW_ID" = "HATA" ] || [ -z "$NEW_ID" ]; then
  echo "❌ Kullanıcı oluşturulamadı. Supabase çalışıyor mu?"
  echo "   Kontrol: supabase status"
  exit 1
fi

# 3) students tablosunda otomatik oluştu mu?
sleep 1
STUDENT_ROW=$(psql "$DB_URL" -t -A -c \
  "SELECT email FROM students WHERE auth_user_id='$NEW_ID' LIMIT 1;" 2>/dev/null | tr -d ' ')

echo ""
echo "✅ Tamamlandı!"
echo "   Email    : $EMAIL"
echo "   Şifre    : $PASSWORD"
echo "   Auth ID  : $NEW_ID"
if [ -n "$STUDENT_ROW" ]; then
  echo "   Profil   : students tablosu ✅"
else
  echo "   Profil   : trigger bekleniyor ⏳"
fi
echo ""
