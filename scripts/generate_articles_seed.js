#!/usr/bin/env node
/**
 * generate_articles_seed.js
 * TS content dosyalarını okuyup INSERT INTO articles (...) SQL çıktısı üretir.
 * Çalıştır: node scripts/generate_articles_seed.js > supabase/seed/articles_full.sql
 */

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const DATA_DIR = path.join(__dirname, '../apps/mobile/src/data')

// ─── Dosyaları oku ve array'i çıkar ────────────────────────────────────────
function extractArray(filePath) {
  const src = fs.readFileSync(filePath, 'utf8')

  // '= [' ara — Type[] gibi tip anotasyonundaki '[' yi atla
  // Örn: `SampleExercise[] = [` → '= [' bulunca gerçek array başlangıcını bul
  // Bare array dosyalar '[\n  {' ile başlar, '= [' yoktur
  let start
  const eqBracketIdx = src.search(/=\s*\[/)
  if (eqBracketIdx !== -1) {
    start = src.indexOf('[', eqBracketIdx) // '= [' sonrasındaki '['
  } else {
    start = src.indexOf('[')               // Bare array dosya
  }
  if (start === -1) return []

  // Son '\n]' — column 0'daki kapanış (girintisiz)
  // Nested options/questions arrays: '\n        ]' gibi girintili — eşleşmez
  // Outer array: '\n]' — girintisiz
  const lastNewlineClose = src.lastIndexOf('\n]')
  if (lastNewlineClose === -1) return []

  const end = lastNewlineClose + 2 // '\n]' sonrası
  const arraySrc = src.slice(start, end)

  try {
    const sandbox = {}
    vm.createContext(sandbox)
    return vm.runInContext('(' + arraySrc + ')', sandbox)
  } catch (e) {
    console.error('Parse hatası:', filePath, e.message.slice(0, 120))
    return []
  }
}

// ─── Zorluk normalize (1-10 scale) ─────────────────────────────────────────
function normalizeDifficulty(d) {
  // Mevcut veriler 3-10 arası, bazıları direkt 1-10
  if (d <= 10) return d
  return 5 // fallback
}

// ─── SQL escape ─────────────────────────────────────────────────────────────
function pgStr(s) {
  if (!s) return "''"
  return "'" + String(s).replace(/'/g, "''") + "'"
}

function pgDollar(s) {
  // Dollar quoting — $$ ... $$ ile güvenli büyük metin
  if (!s) return "$$$$"
  // Eğer $$ içeriyorsa farklı token kullan
  const token = s.includes('$$') ? '$body$' : '$$'
  return `${token}${s}${token}`
}

// ─── exam_type belirle ──────────────────────────────────────────────────────
function examTypes(moduleCode, difficulty) {
  const d = normalizeDifficulty(difficulty)
  // LGS odaklı dersler
  const lgsSubjects = ['turkce', 'ingilizce', 'cografya', 'sosyal', 'fen', 'saglik']
  // TYT/AYT odaklı
  const tytSubjects = ['felsefe', 'psikoloji', 'teknoloji', 'bilim']
  // İkisi de
  const bothSubjects = ['tarih', 'edebiyat']

  if (lgsSubjects.includes(moduleCode)) return "'{lgs,tyt}'"
  if (tytSubjects.includes(moduleCode)) return "'{tyt,ayt}'"
  if (bothSubjects.includes(moduleCode)) return "'{lgs,tyt,ayt}'"
  return "'{lgs,tyt}'"
}

// ─── Makale → SQL satırı ────────────────────────────────────────────────────
function articleToSQL(art) {
  const subjectCode = art.moduleCode || art.subject_code || 'unknown'
  const title = pgStr(art.title)
  const contentText = pgDollar(art.content)
  const wordCount = art.wordCount || art.word_count || 0
  const difficulty = normalizeDifficulty(art.difficulty || 5)
  const targetExam = examTypes(subjectCode, difficulty)
  const questions = "'" + JSON.stringify(art.questions || []).replace(/'/g, "''") + "'::jsonb"

  return `  (${pgStr(subjectCode)}, ${title}, ${contentText}, ${wordCount}, ${difficulty}, ${targetExam}, ${questions})`
}

// ─── Tüm dosyaları oku ──────────────────────────────────────────────────────
const files = [
  'readingContent.ts',        // turkce (10) + ingilizce (10)
  'teknolojiBilimContent.ts', // teknoloji (10) + bilim (10)
  'felsefeVeTarihContent.ts', // felsefe (10) + tarih (10)
  'newArticles.ts',           // psikoloji (10) + cografya (9) + saglik (9)
  'edebiyatSosyalFenContent.ts', // edebiyat (9) + sosyal (9) + fen (9)
]

const allArticles = []
for (const file of files) {
  const fp = path.join(DATA_DIR, file)
  if (!fs.existsSync(fp)) {
    console.error('Dosya bulunamadı:', fp)
    continue
  }
  const arr = extractArray(fp)
  console.error(`${file}: ${arr.length} makale okundu`)
  allArticles.push(...arr)
}

// sampleContent.ts'den konu makalelerini de ekle (cografya-01, edebiyat-01 vb.)
const samplePath = path.join(DATA_DIR, 'sampleContent.ts')
if (fs.existsSync(samplePath)) {
  const sampleSrc = fs.readFileSync(samplePath, 'utf8')
  // SAMPLE_EXERCISES objesini çıkar
  const match = sampleSrc.match(/export\s+const\s+SAMPLE_EXERCISES[^=]*=\s*(\{[\s\S]*?\n\})/m)
  if (match) {
    try {
      const sandbox = {}
      vm.createContext(sandbox)
      const obj = vm.runInContext('(' + match[1] + ')', sandbox)
      const subjectCodes = ['cografya', 'edebiyat', 'sosyal', 'fen', 'saglik', 'turkce', 'ingilizce']
      for (const code of subjectCodes) {
        if (obj[code] && obj[code].moduleCode) {
          allArticles.push(obj[code])
          console.error(`sampleContent: ${code}-01 eklendi`)
        }
      }
    } catch (e) {
      console.error('sampleContent parse hatası:', e.message)
    }
  }
}

console.error(`\nToplam: ${allArticles.length} makale`)

// ─── Tekrar eden ID'leri temizle ─────────────────────────────────────────────
const seen = new Set()
const unique = allArticles.filter(a => {
  const key = (a.id || '') + '|' + (a.moduleCode || a.subject_code || '')
  if (seen.has(key)) { console.error(`Duplicate atlandı: ${a.id}`); return false }
  seen.add(key)
  return true
})

console.error(`Unique: ${unique.length} makale\n`)

// ─── SQL Çıktısı ─────────────────────────────────────────────────────────────
const lines = []
lines.push('-- =====================================================')
lines.push('-- articles_full.sql')
lines.push(`-- ${unique.length} makale — 12 konu — LGS/TYT/AYT`)
lines.push('-- tenant_id = NULL → global (tüm kiracılar okuyabilir)')
lines.push('-- Oluşturma: node scripts/generate_articles_seed.js')
lines.push('-- =====================================================')
lines.push('')
lines.push('INSERT INTO articles (subject_code, title, content_text, word_count, difficulty_level, target_exam, questions)')
lines.push('VALUES')

const rows = unique.map(art => articleToSQL(art))
lines.push(rows.join(',\n') + ';')
lines.push('')
lines.push(`-- ${unique.length} makale başarıyla eklendi.`)

console.log(lines.join('\n'))
