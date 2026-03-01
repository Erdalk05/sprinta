#!/usr/bin/env bash
# =====================================================
# db-reset-seed.sh
# supabase db reset + tüm seed verilerini uygula
#
# Kullanım:  pnpm db:reset-seed
#            bash scripts/db-reset-seed.sh
# =====================================================

set -euo pipefail

PSQL="psql postgresql://postgres:postgres@127.0.0.1:54322/postgres"
SEED_DIR="$(dirname "$0")/../supabase/seed"

# ── Renkli çıktı ──────────────────────────────────
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

# ── 1. supabase db reset ───────────────────────────
info "supabase db reset çalışıyor (migrations + seed.sql)..."
supabase db reset || fail "supabase db reset başarısız"
ok "Migrations + test kullanıcısı uygulandı"

# ── 2. articles_full.sql (120 makale) ─────────────
info "articles_full.sql uygulanıyor..."
$PSQL -f "$SEED_DIR/articles_full.sql" -q \
  || fail "articles_full.sql başarısız"
ARTICLE_COUNT=$($PSQL -tAc "SELECT COUNT(*) FROM articles")
ok "articles tablosu: ${ARTICLE_COUNT} kayıt"

# ── 3. text_library — articles tablosundan aktar ──
info "text_library seed uygulanıyor (articles → text_library)..."
$PSQL -q << 'SQL'
-- LGS / TYT / KPSS / ALES (her gruptan maksimum)
INSERT INTO text_library (
  title, category, exam_type, difficulty,
  word_count, estimated_read_time, body, tags, status
)
SELECT
  a.title,
  a.subject_code,
  CASE
    WHEN 'lgs'  = ANY(a.target_exam) THEN 'LGS'
    WHEN 'tyt'  = ANY(a.target_exam) THEN 'TYT'
    WHEN 'ales' = ANY(a.target_exam) THEN 'ALES'
    WHEN 'kpss' = ANY(a.target_exam) THEN 'KPSS'
    ELSE 'General'
  END,
  LEAST(5, GREATEST(1, CEIL(a.difficulty_level::numeric / 2)))::int,
  a.word_count,
  GREATEST(1, ROUND(a.word_count::numeric / 150))::int,
  a.content_text,
  ARRAY[a.subject_code],
  'published'
FROM articles a
WHERE a.is_published = true
  AND a.tenant_id IS NULL
  AND LENGTH(a.content_text) > 100
ORDER BY a.target_exam[1], a.difficulty_level
LIMIT 30;
SQL
TEXT_COUNT=$($PSQL -tAc "SELECT COUNT(*) FROM text_library")
ok "text_library: ${TEXT_COUNT} kayıt"

# ── 4. Test kullanıcısını admin yap ───────────────
info "test@test.com → role=admin yapılıyor..."
$PSQL -q -c "
  UPDATE students
  SET role = 'admin'
  WHERE email = 'test@test.com';
"
ADMIN_COUNT=$($PSQL -tAc "SELECT COUNT(*) FROM students WHERE role='admin'")
ok "Admin kullanıcı sayısı: ${ADMIN_COUNT}"

# ── 5. Özet ───────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  DB Reset + Seed tamamlandı ✓${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
$PSQL -c "
  SELECT 'articles'    AS tablo, COUNT(*)::text AS sayi FROM articles
  UNION ALL
  SELECT 'text_library', COUNT(*)::text FROM text_library
  UNION ALL
  SELECT 'students (admin)', COUNT(*)::text FROM students WHERE role='admin'
  ORDER BY tablo;
" 2>/dev/null
echo ""
echo "  Test kullanıcı : test@test.com / Test1234"
echo "  Admin paneli   : http://localhost:3000/admin"
echo ""
