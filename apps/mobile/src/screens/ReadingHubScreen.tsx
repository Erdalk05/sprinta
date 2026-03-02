// =====================================================
// ReadingHubScreen — Sadeleştirilmiş versiyon
//
// Sadece önemli olan:
//   1. Kişiselleştirilmiş selamlama + motivasyon sözü
//   2. Kompakt stat şeridi (WPM · Seri · XP)
//   3. Okuma Modları grid
//   4. Metin Kütüphanesi
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useRouter, useFocusEffect } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuthStore }  from '../stores/authStore'
import { useAppTheme }   from '../theme/useAppTheme'
import type { AppTheme } from '../theme'
import { ModeGrid }                from '../components/reading/ModeGrid'
import { LibraryPreview }          from '../components/reading/LibraryPreview'
import { ReadingModePickerSheet }  from '../components/reading/ReadingModePickerSheet'
import type { ModeItem }           from '../components/reading/ModeGrid'
import type { LibraryText, ExamFilter } from '../components/reading/LibraryPreview'

const LIBRARY_LIMIT = 30

// ─── Motivasyon Sistemi ────────────────────────────────────────────────────

// Sabah 05-12 (30 mesaj)
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
  'Herkes uyurken sen okuyorsun — fark bu, {name}!',
  'Günaydın {name}! Küçük ilerlemeler büyük farklar yaratır.',
  '{name}, bu sabah öğrenilen her kelime hazinene ekleniyor.',
  'Sabah kararlılığın gün boyu seni taşır, {name}. Harika!',
  'Günaydın! Her okuma seansı WPM\'ini artırıyor, {name}.',
  '{name}, sabah beyin antrenmanı yapıyorsun. Süper!',
  'Bu sabah çalışmak kolay değildi ama yapıyorsun, {name}!',
  'Günaydın {name}! Okumak düşünmeyi, düşünmek başarmayı getirir.',
  '{name}, sabahın enerjisini doğru kullanıyorsun. Bravo!',
  'Her sabah biraz daha iyi, biraz daha hızlı — devam, {name}!',
  'Günaydın! Bu adanmışlık fark yaratıyor, {name}.',
  '{name}, sabah okuma alışkanlığın başarının temelidir.',
  'Bugün öğrendiklerin yarın sana katkı sağlayacak, {name}!',
  'Günaydın {name}! Bugün harika bir gün olacak, başlıyoruz!',
]

// Öğleden sonra 12-18 (25 mesaj)
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
  '{name}, her okuma seansı anlama hızını artırıyor.',
  'Bu çabayla sınav gününe hazır olacaksın, {name}!',
  '{name}, anlama hızın her gün biraz daha artıyor.',
  'Öğleden sonra beyin antrenmanın devam ediyor, {name}.',
  '{name}, bu saatte bile öğreniyorsun — güçsün!',
  'Kararlılık + çalışma = başarı. Uyguluyorsun, {name}.',
  '{name}, küçük molalar ver ama bırakma. Doğru yoldasın!',
  'Her metin bir beceri, her seans bir kazanım, {name}.',
  '{name}, öğleden sonra performansın takdire şayan!',
  'Devam et {name}, bitiş çizgisine yaklaşıyorsun!',
]

// Akşam 18-22 (25 mesaj)
const AKSAM: string[] = [
  '{name}, günü verimli kapatıyorsun. Harika!',
  'Akşam okumak bilgiyi pekiştirmenin en iyi yolu, {name}.',
  '{name}, bu akşam öğrendiklerin uyurken beyninde yerleşecek.',
  'Gün bitmeden bir çalışma daha — disiplin bu, {name}!',
  '{name}, akşamın sessizliğinde derin öğrenme olur.',
  'Bugünü boşa geçirmedin, {name}. Gurur duyabilirsin!',
  '{name}, her akşam okumak seni yarına güçlü taşır.',
  'Gün sona ererken bile çalışmak cesaretini gösteriyor, {name}.',
  '{name}, akşam beyin dinginleşir ve öğrenmeye hazır olur.',
  'Bu akşam eforun yarın meyvelerini verecek, {name}!',
  '{name}, akşam rutinin en önemli yatırımlarından biri.',
  'Günü okuyarak bitirmek en iyi kapanış, {name}!',
  '{name}, bu akşam öğrendiklerin yarın fark yaratacak.',
  'Devam etmek kolay değil ama sen yapıyorsun, {name}!',
  '{name}, akşam saatlerinde de azimli olmak — bu özel.',
  'Beynin bugün çok şey öğrendi, {name}. Devam!',
  '{name}, günün sonunda bir başarı daha. Bugün senin günün!',
  'Akşam çalışması sabah sınavlarında görünür, {name}.',
  '{name}, bu kararlılıkla hedefine ulaşacaksın.',
  'Akşam saatleri — sakin, odaklı, verimli. Tebrikler, {name}!',
  '{name}, bugün etkili çalıştın. Yarın daha da iyi olacak.',
  'Her akşam öğrenme yolculuğun devam ediyor, {name}.',
  '{name}, gün bitse de öğrenme durmuyor. Güçsün!',
  'Akşam okumak zihni güçlendirir ve stresi azaltır, {name}.',
  '{name}, bu akşam öğrendiğin her şey seni bir adım öne taşır!',
]

// Gece 22-05 (20 mesaj)
const GECE: string[] = [
  '{name}, gece bile çalışıyorsun — bu gerçek adanmışlık!',
  'Geç saate kadar bırakmıyorsun, {name}. Etkileyici!',
  '{name}, gece sessizliği en derin öğrenme ortamı.',
  'Bu saatte çalışmak kolay değil ama yapıyorsun, {name}!',
  '{name}, gece enerjin tükense de azmin tükenmez.',
  'Uyumadan önce bir okuma daha — beyni besle, {name}!',
  '{name}, gece öğrendiklerini beynin uyurken işliyor.',
  'Bu saatte bile okuyorsun, {name}. Takdire değer!',
  'Geceleri çalışanlar güneş doğduğunda hazır olur, {name}.',
  '{name}, gece sessizliğinde zihnin özgürce uçuyor.',
  'Son bir bölüm daha — bunu yapabilirsin, {name}!',
  '{name}, gece kararlılığın sınav günü sana geri dönecek.',
  'Bu saatte odaklanmak gerçek bir beceri, {name}!',
  '{name}, gece geç saatte bile öğreniyorsun — gurur duy.',
  'Uyku öncesi okumak bilgiyi sabitlemenin yolu, {name}.',
  '{name}, gece çalışması sabah başarısının temelidir.',
  'Bu adanmışlık fark yaratıyor, {name}!',
  '{name}, gece bile Sprinta\'dasın — bu azim!',
  'Son seans — en iyi seans. Haydi {name}, son bir hamle!',
  'Gece çalışanlar, {name}, sabah şampiyonlar olarak uyanır!',
]

function selectMotivation(
  firstName:  string,
  streakDays: number,
  totalXp:    number,
  lastWpm:    number | null,
): { greeting: string; message: string } {
  const hour = new Date().getHours()

  // Kişiselleştirilmiş ekstra mesajlar (seri/XP/WPM bazlı)
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
    extra.push('{name}, bugün serine başlıyorsun. Yarın da devam et!')

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

  // Zaman dilimine göre havuz seçimi
  let pool: string[]
  let greeting: string
  if (hour >= 5 && hour < 12) {
    pool = SABAH;           greeting = '☀️ Günaydın'
  } else if (hour >= 12 && hour < 18) {
    pool = OGLEDEN_SONRA;  greeting = '👋 İyi günler'
  } else if (hour >= 18 && hour < 22) {
    pool = AKSAM;           greeting = '🌙 İyi akşamlar'
  } else {
    pool = GECE;            greeting = '⭐ İyi geceler'
  }

  // %35 ihtimalle kişiselleştirilmiş (seri/XP/WPM), geri kalanı zamanlı havuz
  const usePersonal = extra.length > 0 && (
    (new Date().getMinutes() % 3 === 0) // sabit deterministik
  )
  const allMessages = usePersonal ? extra : [...pool, ...extra]

  // Her gün+saat için farklı ama tutarlı mesaj
  const seed = new Date().getDate() * 31 + new Date().getHours()
  const idx  = seed % allMessages.length
  const raw  = allMessages[idx]

  return {
    greeting,
    message: raw.replace(/\{name\}/g, firstName),
  }
}

// ─── Ana ekran ────────────────────────────────────────
export default function ReadingHubScreen() {
  const t   = useAppTheme()
  const s   = useMemo(() => createStyles(t), [t])
  const student = useAuthStore(st => st.student)
  const router  = useRouter()

  // ── Library state ──────────────────────────────────
  const [texts,          setTexts]          = useState<LibraryText[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [filter,         setFilter]         = useState<ExamFilter>('Tümü')
  const [categoryFilter, setCategoryFilter] = useState<string>('Tümü')
  const [searchQuery,    setSearchQuery]    = useState<string>('')
  const [progressMap,    setProgressMap]    = useState<Record<string, number>>({})
  const [pickerText,     setPickerText]     = useState<LibraryText | null>(null)

  // ── Hızlı stat: son WPM ────────────────────────────
  const [lastWpm, setLastWpm] = useState<number | null>(null)

  // ── Kişiselleştirilmiş selamlama + motivasyon ──────
  const firstName = useMemo(() => {
    const full = student?.fullName ?? ''
    return full.split(' ')[0] || 'Öğrenci'
  }, [student?.fullName])

  const { greeting, message: motivMessage } = useMemo(
    () => selectMotivation(
      firstName,
      student?.streakDays ?? 0,
      student?.totalXp    ?? 0,
      lastWpm,
    ),
    [firstName, student?.streakDays, student?.totalXp, lastWpm],
  )

  // ── Library fetch ──────────────────────────────────
  const fetchTexts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('text_library')
        .select('id, title, category, exam_type, difficulty, word_count, estimated_read_time')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(LIBRARY_LIMIT)
      if (fetchError) {
        setError('Metinler yüklenemedi.')
      } else {
        setTexts((data as LibraryText[]) ?? [])
      }
    } catch {
      setError('Bağlantı hatası. Tekrar dene.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── İlerleme fetch ─────────────────────────────────
  const fetchProgress = useCallback(async () => {
    if (!student?.id) return
    try {
      const { data } = await (supabase as any)
        .from('user_reading_progress')
        .select('text_id, last_ratio')
        .eq('user_id', student.id)
      if (data) {
        const map: Record<string, number> = {}
        ;(data as { text_id: string; last_ratio: number }[]).forEach(r => {
          map[r.text_id] = r.last_ratio
        })
        setProgressMap(map)
      }
    } catch { /* sessiz */ }
  }, [student?.id])

  // ── Son WPM fetch ──────────────────────────────────
  useEffect(() => {
    if (!student?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await (supabase as any)
          .from('reading_mode_sessions')
          .select('avg_wpm')
          .eq('student_id', student.id)
          .gt('avg_wpm', 0)
          .order('created_at', { ascending: false })
          .limit(1)
        if (!cancelled && data?.[0]?.avg_wpm) setLastWpm(data[0].avg_wpm)
      } catch { /* sessiz */ }
    })()
    return () => { cancelled = true }
  }, [student?.id])

  useEffect(() => { fetchTexts() },    [fetchTexts])
  useEffect(() => { fetchProgress() }, [fetchProgress])

  useFocusEffect(
    useCallback(() => { fetchProgress() }, [fetchProgress]),
  )

  // ── Filtreli metin listesi ─────────────────────────
  const filteredTexts = useMemo(() => {
    let result = texts
    if (filter !== 'Tümü') result = result.filter(tx => tx.exam_type === filter)
    if (categoryFilter && categoryFilter !== 'Tümü')
      result = result.filter(tx => tx.category === categoryFilter)
    const q = searchQuery.trim().toLowerCase()
    if (q.length > 0)
      result = result.filter(tx =>
        tx.title.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q),
      )
    return result.map(tx => ({ ...tx, readingProgress: progressMap[tx.id] ?? 0 }))
  }, [texts, filter, categoryFilter, searchQuery, progressMap])

  // ── Handler'lar ────────────────────────────────────
  const handleModePress    = useCallback((mode: ModeItem) => {
    if (mode.comingSoon || !mode.route) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(mode.route as any)
  }, [router])

  const handleTextPress    = useCallback((text: LibraryText) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPickerText(text)
  }, [])

  const handleFilterChange   = useCallback((f: ExamFilter) => {
    setFilter(f); setCategoryFilter('Tümü')
  }, [])
  const handleCategoryChange = useCallback((c: string) => setCategoryFilter(c), [])
  const handleSearchChange   = useCallback((q: string) => setSearchQuery(q), [])
  const handleBack           = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }, [router])

  // ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>

      {/* ── Mod Seçim Sheet ──────────────────────────── */}
      <ReadingModePickerSheet
        visible={pickerText != null}
        text={pickerText}
        onClose={() => setPickerText(null)}
      />

      {/* ── Header ───────────────────────────────────── */}
      <View style={s.header}>
        {/* Sol: kullanıcı adı + selamlama */}
        <View style={s.headerLeft}>
          <Text style={s.headerName}>{firstName}</Text>
          <Text style={s.headerGreet}>{greeting}</Text>
        </View>

        {/* Sağ: ayarlar + çıkış */}
        <View style={s.headerRight}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => router.push('/(tabs)/menu' as any)}
            activeOpacity={0.7}
          >
            <Text style={s.iconBtnTxt}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={s.iconBtnTxt}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── Motivasyon kartı ─────────────────────────── */}
        <View style={s.motivCard}>
          <Text style={s.motivMsg} numberOfLines={3}>{motivMessage}</Text>
        </View>

        {/* ── Kompakt stat şeridi ──────────────────────── */}
        <View style={s.statRow}>
          <View style={s.statItem}>
            <Text style={s.statVal}>{lastWpm ?? '—'}</Text>
            <Text style={s.statLbl}>Son WPM</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{student?.streakDays ?? 0}</Text>
            <Text style={s.statLbl}>🔥 Seri</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{student?.totalXp ?? 0}</Text>
            <Text style={s.statLbl}>⭐ XP</Text>
          </View>
        </View>

        {/* ── Okuma Modları ────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚡ Okuma Modları</Text>
          <Text style={s.sectionSub}>17 mod · en popülerden az yaygına</Text>
        </View>
        <ModeGrid onModePress={handleModePress} />

        {/* ── Metin Kütüphanesi ────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📚 Metin Kütüphanesi</Text>
          <Text style={s.sectionSub}>Sınava göre filtrele · ara · başla</Text>
        </View>
        <LibraryPreview
          texts={filteredTexts}
          loading={loading}
          error={error}
          filter={filter}
          categoryFilter={categoryFilter}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onTextPress={handleTextPress}
          onRetry={fetchTexts}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    safe: {
      flex:            1,
      backgroundColor: t.colors.background,
    },

    // Header
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      paddingHorizontal: t.spacing.lg,
      paddingVertical:   t.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.divider,
      backgroundColor:   t.colors.surface,
    },
    headerLeft: {
      flex: 1,
      gap:  2,
    },
    headerName: {
      fontSize:   t.font.lg,
      fontWeight: '900',
      color:      t.colors.text,
    },
    headerGreet: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      fontWeight: '600',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           8,
    },
    iconBtn: {
      width:           36,
      height:          36,
      borderRadius:    18,
      backgroundColor: t.colors.background,
      alignItems:      'center',
      justifyContent:  'center',
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
    },
    iconBtnTxt: {
      fontSize: 16,
    },

    // İçerik
    content: {
      paddingHorizontal: t.spacing.lg,
      paddingTop:        t.spacing.md,
      gap:               t.spacing.lg,
    },

    // Motivasyon kartı
    motivCard: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      paddingHorizontal: 14,
      paddingVertical:   12,
      borderLeftWidth:   3,
      borderLeftColor:   t.colors.primary,
    },
    motivMsg: {
      fontSize:   t.font.sm,
      color:      t.colors.text,
      fontWeight: '500',
      lineHeight: 20,
    },

    // Stat şeridi
    statRow: {
      flexDirection:   'row',
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      paddingVertical: 14,
      ...t.shadows.sm,
    },
    statItem: {
      flex:       1,
      alignItems: 'center',
      gap:        2,
    },
    statVal: {
      fontSize:   20,
      fontWeight: '800',
      color:      t.colors.text,
    },
    statLbl: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      fontWeight: '600',
    },
    statDivider: {
      width:           StyleSheet.hairlineWidth,
      alignSelf:       'stretch',
      backgroundColor: t.colors.border,
      marginVertical:  4,
    },

    // Bölüm başlığı
    section: { gap: 2 },
    sectionTitle: {
      fontSize:   t.font.md,
      fontWeight: '800',
      color:      t.colors.text,
    },
    sectionSub: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
  })
}
