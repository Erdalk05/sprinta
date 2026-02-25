const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function checkHealth() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('HATA: SUPABASE_URL veya SUPABASE_ANON_KEY eksik.')
    console.error('cp .env.example .env ve anahtarları doldur.')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  console.log('Veritabanı bağlantısı kontrol ediliyor...')

  try {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Bağlantı HATASI:', error.message)
      process.exit(1)
    }

    console.log('Veritabanı bağlantısı başarılı!')
    console.log(`Öğrenci sayısı: ${count ?? 0}`)
  } catch (err) {
    console.error('Beklenmeyen hata:', err)
    process.exit(1)
  }
}

checkHealth()
