// Paylaşımlı CORS yardımcısı
// Production: ALLOWED_ORIGIN env değişkenini ayarla (örn. https://sprinta.app)
// Geliştirme: varsayılan olarak '*' kullanılır

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*'

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
