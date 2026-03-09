/**
 * Sprinta — Kartal Gözü Game Sounds
 * Noise transient + FM synthesis → punchy, modern game feel
 * Run: node scripts/generateSounds.js
 */
const fs   = require('fs')
const path = require('path')

const OUT = path.join(__dirname, '../apps/mobile/assets/sounds')
fs.mkdirSync(OUT, { recursive: true })

const SR = 44100

function makeWav(renderFn, durationMs) {
  const n = Math.floor(SR * durationMs / 1000)
  const dataBytes = n * 2
  const buf = Buffer.alloc(44 + dataBytes)

  buf.write('RIFF', 0);  buf.writeUInt32LE(36 + dataBytes, 4)
  buf.write('WAVE', 8);  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(1, 22);  buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34); buf.write('data', 36)
  buf.writeUInt32LE(dataBytes, 40)

  for (let i = 0; i < n; i++) {
    const t = i / SR
    const p = i / n   // 0→1 progress
    const s = Math.max(-0.98, Math.min(0.98, renderFn(t, p)))
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2)
  }
  return buf
}

const sin = (f, t) => Math.sin(2 * Math.PI * f * t)
const noise = () => Math.random() * 2 - 1
const exp  = (p, k) => Math.exp(-k * p)   // k yüksek = hızlı düşüş

// ── HIT — Coin collect: noise punch + bright harmonic ding ─────────────────
fs.writeFileSync(path.join(OUT, 'hit.wav'), makeWav((t, p) => {
  const env     = exp(p, 9)
  const punch   = p < 0.06 ? noise() * 0.55 * exp(p/0.06, 5) : 0  // ilk 60ms noise punch
  const body    = (sin(880, t) * 0.50 + sin(1320, t) * 0.30 + sin(1760, t) * 0.15) * env * 0.70
  return punch + body
}, 140))

// ── MISS — Sad descend: two-tone womp ────────────────────────────────────────
fs.writeFileSync(path.join(OUT, 'miss.wav'), makeWav((t, p) => {
  const env  = exp(p, 6) * (1 - p * 0.4)
  const freq = 380 * Math.pow(0.45, p)   // 380Hz → ~170Hz
  return sin(freq, t) * env * 0.55
}, 220))

// ── APPEAR — Quick shimmer whoosh ────────────────────────────────────────────
fs.writeFileSync(path.join(OUT, 'appear.wav'), makeWav((t, p) => {
  const env   = exp(p, 18)
  const sweep = sin(3500 - p * 2500, t)  // 3500→1000Hz sweep
  const tick  = noise() * exp(p, 40) * 0.25
  return (sweep * 0.35 + tick) * env
}, 60))

// ── COMBO — Level-up arpeggio + echo ─────────────────────────────────────────
fs.writeFileSync(path.join(OUT, 'combo.wav'), makeWav((t, p) => {
  const notes = [523, 659, 784, 1047, 1319]  // C5 E5 G5 C6 E6
  const step  = 0.07  // her nota ~70ms
  const note  = notes[Math.min(Math.floor(p / (step / (1/notes.length))), notes.length - 1)]
  const idx   = Math.floor(p * notes.length)
  const lp    = (p * notes.length) % 1   // local progress within note
  const f     = notes[Math.min(idx, notes.length - 1)]
  const env   = exp(lp, 8) * (1 - p * 0.3)
  const punch = lp < 0.04 ? noise() * 0.4 * exp(lp / 0.04, 5) : 0
  return (sin(f, t) * 0.55 + sin(f * 2, t) * 0.18 + punch) * env
}, 380))

// ── COMPLETE — Epic 5-note victory stinger ────────────────────────────────────
fs.writeFileSync(path.join(OUT, 'complete.wav'), makeWav((t, p) => {
  const stages = [
    { f: 523,  end: 0.12 },  // C5
    { f: 659,  end: 0.24 },  // E5
    { f: 784,  end: 0.36 },  // G5
    { f: 1047, end: 0.52 },  // C6
    { f: 1319, end: 1.00 },  // E6 — held
  ]
  const st   = stages.find(s => p <= s.end) || stages[stages.length - 1]
  const prev = stages.findIndex(s => p <= s.end)
  const start = prev > 0 ? stages[prev - 1].end : 0
  const lp   = (p - start) / (st.end - start)
  const env  = prev < 4 ? exp(lp, 5) : exp(lp, 2.5)  // son nota uzun tutuluyor
  const punch = lp < 0.05 ? noise() * 0.3 * exp(lp / 0.05, 4) : 0
  const chord = sin(st.f, t) * 0.50 + sin(st.f * 1.5, t) * 0.20 + sin(st.f * 2, t) * 0.12
  return (chord * env + punch) * 0.85
}, 1100))

// ── FLIP — Kart çevirme: snap + pitch drop ───────────────────────────────────
fs.writeFileSync(path.join(OUT, 'flip.wav'), makeWav((t, p) => {
  const snap = p < 0.20 ? noise() * 0.50 * exp(p / 0.20, 8) : 0
  const freq = 1400 * Math.pow(0.50, p)   // 1400Hz → ~700Hz
  const tone = sin(freq, t) * 0.40 * exp(p, 14)
  return (snap + tone) * exp(p, 20)
}, 70))

// ── TICK — Kronometre tiki: temiz perküsif click ──────────────────────────────
fs.writeFileSync(path.join(OUT, 'tick.wav'), makeWav((t, p) => {
  const env  = exp(p, 45)
  const tone = sin(900, t) * 0.50
  const bite = p < 0.10 ? noise() * 0.30 * exp(p / 0.10, 6) : 0
  return (tone + bite) * env
}, 25))

// ── WHOOSH — Düşen/hareket sesi: inen frekans sweep ─────────────────────────
fs.writeFileSync(path.join(OUT, 'whoosh.wav'), makeWav((t, p) => {
  const env   = exp(p * p, 3) * (1 - p * 0.5)
  const freq  = 2800 * Math.pow(0.06, p)   // 2800Hz → ~170Hz
  const sweep = sin(freq, t) * 0.45
  const nz    = noise() * 0.25 * exp(p, 5)
  return (sweep + nz) * env * 0.80
}, 160))

// ── SUCCESS — Kısa başarı jingle: 3-nota arpeji ──────────────────────────────
fs.writeFileSync(path.join(OUT, 'success.wav'), makeWav((t, p) => {
  const notes = [784, 1047, 1319]   // G5 C6 E6
  const idx   = Math.min(Math.floor(p * notes.length), notes.length - 1)
  const lp    = (p * notes.length) % 1
  const f     = notes[idx]
  const env   = exp(lp, 6) * (1 - p * 0.2)
  const punch = lp < 0.05 ? noise() * 0.35 * exp(lp / 0.05, 5) : 0
  return (sin(f, t) * 0.55 + sin(f * 1.5, t) * 0.18 + punch) * env
}, 280))

// ── LEVEL_UP — Kelime/bölüm tamamlama: rising sweep ─────────────────────────
fs.writeFileSync(path.join(OUT, 'level_up.wav'), makeWav((t, p) => {
  const freq  = 300 * Math.pow(4.5, p)    // 300Hz → ~1350Hz rising
  const env   = p < 0.7 ? exp(p * 0.5, 2) : exp((p - 0.7) / 0.3, 3)
  const body  = sin(freq, t) * 0.45 + sin(freq * 1.5, t) * 0.20
  const punch = p < 0.03 ? noise() * 0.35 * exp(p / 0.03, 5) : 0
  return (body + punch) * env
}, 320))

console.log('✅ Game sounds (v3) → apps/mobile/assets/sounds/')
console.log('   hit · miss · appear · combo · complete · flip · tick · whoosh · success · level_up')
