/**
 * motivation.ts — Kişiselleştirilmiş motivasyon sözleri
 * 100+ Türkçe mesaj · zaman dilimi + istatistik bazlı
 */

// ─── Sabah 05-12 (30 mesaj) ──────────────────────────────────────────────────
const SABAH: string[] = [
  '{name}, günaydın! Bu sabah okumak en iyi yatırım.',
  'Sabahın bu saatinde çalışıyor olman harikulade, {name}!',
  '{name}, erken başlayanlar kazanır — sen zaten başladın!',
  'Günaydın {name}! Bugün hedefine bir adım daha yakınsın.',
  '{name}, sabah beynin en taze hali — iyi kullanıyorsun!',
  'Günaydın! Sabah rutinin seni diğerlerinden ayırıyor, {name}.',
  '{name}, bu sabah çabanla sınav gününe hazırlanıyorsun.',
  'Sabah erken okuyan {name} — bu disiplin çok değerli!',
  '{name}, her sabah okumak bilgiyi kalıcı hale getiriyor.',
  'Bu sabah başardığın her şey gün boyu seni taşır, {name}!',
  'Günaydın {name}! Bugün ne öğreneceksin, hazır mısın?',
  '{name}, sabahın sessizliğinde en derin öğrenme olur.',
  'Gün doğmadan okuyanlar gün batmadan kazanır, {name}!',
  '{name}, bu sabah öğrendiklerin sınavda sana geri dönecek.',
  'Günaydın! Beyin sabah okumayı sever, {name}.',
  '{name}, sabah motivasyonun bugün seni çok ileriye taşıyacak!',
  'Herkes uyurken sen çalışıyorsun — fark bu, {name}!',
  'Günaydın {name}! Küçük ilerlemeler büyük farklar yaratır.',
  '{name}, bu sabah öğrenilen her bilgi hazinene ekleniyor.',
  'Sabah kararlılığın gün boyu seni taşır, {name}. Harika!',
  'Günaydın! Her çalışma seansı seni güçlendiriyor, {name}.',
  '{name}, sabah beyin antrenmanı yapıyorsun. Süper!',
  'Bu sabah çalışmak kolay değildi ama yapıyorsun, {name}!',
  'Günaydın {name}! Öğrenmek düşünmeyi, düşünmek başarmayı getirir.',
  '{name}, sabahın enerjisini doğru kullanıyorsun. Bravo!',
  'Her sabah biraz daha iyi, biraz daha güçlü — devam, {name}!',
  'Günaydın! Bu adanmışlık fark yaratıyor, {name}.',
  '{name}, sabah çalışma alışkanlığın başarının temelidir.',
  'Bugün öğrendiklerin yarın sana katkı sağlayacak, {name}!',
  'Günaydın {name}! Bugün harika bir gün olacak, başlıyoruz!',
]

// ─── Öğleden sonra 12-18 (25 mesaj) ─────────────────────────────────────────
const OGLEDEN_SONRA: string[] = [
  '{name}, öğleden sonra da vazgeçmiyorsun. Süper!',
  'Bu saatte odaklanmak kolay değil, başarıyorsun {name}!',
  '{name}, yorgunluğa rağmen devam etmek güç ister. O gücü görüyorum!',
  'Öğleden sonra beyin çalıştırmak özel bir beceri, {name}.',
  '{name}, gün ortasında durmak kolaydı ama devam ettin!',
  'Çabaladığın her dakika birikime dönüşüyor, {name}.',
  '{name}, bu öğleden sonra seni daha güçlü yapıyor.',
  'Konsantrasyon kasını geliştiriyorsun, {name}. Harika!',
  '{name}, bugün öğrendiğin bilgiler sınavda işine yarayacak.',
  'Her ilerleme adımı önemli, {name}. Öne geçiyorsun!',
  'Öğleden sonra çalışmak zor ama sen yapıyorsun, {name}!',
  '{name}, günün en verimli saatlerinden birini iyi kullanıyorsun.',
  'Bu azim seni farklı kılıyor, {name}!',
  '{name}, öğrenme yolculuğunda bir durak daha geride kaldı.',
  'Yorulsan da devam etmek — işte gerçek güç bu, {name}.',
  '{name}, her çalışma seansı anlama hızını artırıyor.',
  'Bu çabayla sınav gününe hazır olacaksın, {name}!',
  '{name}, bilgi ve becerin her gün biraz daha artıyor.',
  'Öğleden sonra beyin antrenmanın devam ediyor, {name}.',
  '{name}, bu saatte bile öğreniyorsun — güçsün!',
  'Kararlılık + çalışma = başarı. Uyguluyorsun, {name}.',
  '{name}, küçük molalar ver ama bırakma. Doğru yoldasın!',
  'Her seans bir beceri, her gün bir kazanım, {name}.',
  '{name}, öğleden sonra performansın takdire şayan!',
  'Devam et {name}, bitiş çizgisine yaklaşıyorsun!',
]

// ─── Akşam 18-22 (25 mesaj) ──────────────────────────────────────────────────
const AKSAM: string[] = [
  '{name}, günü verimli kapatıyorsun. Harika!',
  'Akşam çalışmak bilgiyi pekiştirmenin en iyi yolu, {name}.',
  '{name}, bu akşam öğrendiklerin uyurken beyninde yerleşecek.',
  'Gün bitmeden bir çalışma daha — disiplin bu, {name}!',
  '{name}, akşamın sessizliğinde derin öğrenme olur.',
  'Bugünü boşa geçirmedin, {name}. Gurur duyabilirsin!',
  '{name}, her akşam çalışmak seni yarına güçlü taşır.',
  'Gün sona ererken bile çalışmak cesaretini gösteriyor, {name}.',
  '{name}, akşam beyin dinginleşir ve öğrenmeye hazır olur.',
  'Bu akşam eforun yarın meyvelerini verecek, {name}!',
  '{name}, akşam rutinin en önemli yatırımlarından biri.',
  'Günü çalışarak bitirmek en iyi kapanış, {name}!',
  '{name}, bu akşam öğrendiklerin yarın fark yaratacak.',
  'Devam etmek kolay değil ama sen yapıyorsun, {name}!',
  '{name}, akşam saatlerinde de azimli olmak — bu özel.',
  'Beynin bugün çok şey öğrendi, {name}. Devam!',
  '{name}, günün sonunda bir başarı daha. Bugün senin günün!',
  'Akşam çalışması sabah sınavlarında kendini gösterir, {name}.',
  '{name}, bu kararlılıkla hedefine ulaşacaksın.',
  'Akşam saatleri — sakin, odaklı, verimli. Tebrikler, {name}!',
  '{name}, bugün etkili çalıştın. Yarın daha da iyi olacak.',
  'Her akşam öğrenme yolculuğun devam ediyor, {name}.',
  '{name}, gün bitse de öğrenme durmuyor. Güçsün!',
  'Akşam çalışmak zihni güçlendirir ve stresi azaltır, {name}.',
  '{name}, bu akşam öğrendiğin her şey seni bir adım öne taşır!',
]

// ─── Gece 22-05 (20 mesaj) ───────────────────────────────────────────────────
const GECE: string[] = [
  '{name}, gece bile çalışıyorsun — bu gerçek adanmışlık!',
  'Geç saate kadar bırakmıyorsun, {name}. Etkileyici!',
  '{name}, gece sessizliği en derin öğrenme ortamı.',
  'Bu saatte çalışmak kolay değil ama yapıyorsun, {name}!',
  '{name}, gece enerjin tükense de azmin tükenmez.',
  'Uyumadan önce bir çalışma daha — beyni besle, {name}!',
  '{name}, gece öğrendiklerini beynin uyurken işliyor.',
  'Bu saatte bile çalışıyorsun, {name}. Takdire değer!',
  'Geceleri çalışanlar güneş doğduğunda hazır olur, {name}.',
  '{name}, gece sessizliğinde zihnin özgürce uçuyor.',
  'Son bir bölüm daha — bunu yapabilirsin, {name}!',
  '{name}, gece kararlılığın sınav günü sana geri dönecek.',
  'Bu saatte odaklanmak gerçek bir beceri, {name}!',
  '{name}, gece geç saatte bile çalışıyorsun — gurur duy.',
  'Uyku öncesi çalışmak bilgiyi sabitlemenin yolu, {name}.',
  '{name}, gece çalışması sabah başarısının temelidir.',
  'Bu adanmışlık fark yaratıyor, {name}!',
  '{name}, gece bile Sprinta\'dasın — bu azim!',
  'Son seans — en iyi seans. Haydi {name}, son bir hamle!',
  'Gece çalışanlar, {name}, sabah şampiyonlar olarak uyanır!',
]

// ─── Ana fonksiyon ────────────────────────────────────────────────────────────
export interface MotivationResult {
  greeting: string
  icon:     string
  message:  string
}

export function selectMotivation(
  firstName:  string,
  streakDays: number,
  totalXp:    number,
  lastWpm:    number | null,
): MotivationResult {
  const hour = new Date().getHours()

  // Kişiselleştirilmiş ekstra mesajlar
  const extra: string[] = []
  if (streakDays >= 30)
    extra.push(`{name}, ${streakDays} günlük serinle efsaneleşiyorsun! Bu disiplin paha biçilmez.`)
  else if (streakDays >= 14)
    extra.push(`{name}, 2 haftayı geçti — ${streakDays} günlük seri gerçekten inanılmaz!`)
  else if (streakDays >= 7)
    extra.push(`{name}, ${streakDays} günlük serinle harika bir ritim yakaladın!`)
  else if (streakDays >= 3)
    extra.push(`{name}, ${streakDays} gün üst üste çalıştın. Seri devam ediyor!`)
  else if (streakDays === 1)
    extra.push('{name}, bugün serine başladın. Yarın da devam et!')

  if (totalXp >= 10000)
    extra.push(`{name}, ${totalXp} XP — gerçek bir Sprinta şampiyonusun!`)
  else if (totalXp >= 5000)
    extra.push(`{name}, ${totalXp} XP ile zirveye yaklaşıyorsun!`)
  else if (totalXp >= 1000)
    extra.push(`{name}, ${totalXp} XP kazandın — harika bir ilerleme!`)
  else if (totalXp >= 200)
    extra.push(`{name}, ${totalXp} XP biriktirdin. Devam et, büyük sayılar geliyor!`)

  if (lastWpm && lastWpm >= 500)
    extra.push(`{name}, ${lastWpm} WPM ile okuyorsun — bu inanılmaz bir hız!`)
  else if (lastWpm && lastWpm >= 400)
    extra.push(`{name}, son okunan ${lastWpm} WPM — süper hızlısın!`)
  else if (lastWpm && lastWpm >= 300)
    extra.push(`{name}, ${lastWpm} WPM — ortalamanın çok üzerinde. Tebrikler!`)
  else if (lastWpm && lastWpm >= 200)
    extra.push(`{name}, ${lastWpm} WPM ile güçlü bir başlangıç yapıyorsun!`)
  else if (lastWpm && lastWpm > 0)
    extra.push(`{name}, ${lastWpm} WPM — her seans seni daha ileriye götürür!`)

  // Zaman dilimine göre havuz + greeting
  let pool: string[]
  let greeting: string
  let icon: string
  if (hour >= 5 && hour < 12) {
    pool = SABAH;          greeting = 'Günaydın';      icon = '☀️'
  } else if (hour >= 12 && hour < 18) {
    pool = OGLEDEN_SONRA; greeting = 'İyi günler';     icon = '👋'
  } else if (hour >= 18 && hour < 22) {
    pool = AKSAM;          greeting = 'İyi akşamlar';  icon = '🌙'
  } else {
    pool = GECE;           greeting = 'İyi geceler';   icon = '⭐'
  }

  // %35 ihtimalle kişiselleştirilmiş (seri/XP/WPM) mesaj
  const minute = new Date().getMinutes()
  const usePersonal = extra.length > 0 && (minute % 3 === 0)
  const allMessages = usePersonal ? extra : [...pool, ...extra]

  // Her gün+saat için farklı ama tutarlı mesaj
  const seed = new Date().getDate() * 31 + new Date().getHours()
  const idx  = seed % allMessages.length
  const raw  = allMessages[idx]

  return {
    greeting,
    icon,
    message: raw.replace(/\{name\}/g, firstName),
  }
}
