/**
 * Çalış Ekranı
 *
 * Bölüm 1 — Tanılama Testi hero kartı
 * Bölüm 2 — Göz & Dikkat Egzersizleri (15 egzersiz, accordion)
 * Bölüm 3 — Okuma Modülleri (3 modül, accordion)
 */
import React, { useState, useMemo, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/authStore'
import { useVisualMechanicsStore } from '../../src/features/visual-mechanics/store/visualMechanicsStore'
import type { ExerciseId } from '../../src/features/visual-mechanics/constants/exerciseConfig'

// ─── 15 Göz & Dikkat Egzersizi (15'den 1'e — aşağıdan yukarıya) ──
interface GozEx {
  num: number; exerciseId: ExerciseId; label: string; subtitle: string
}
const GOZ_EXERCISES: GozEx[] = [
  { num: 15, exerciseId: 'tunnel_vision_breaker',  label: 'Tünel Görüş Kırıcı',          subtitle: 'Ekranın kenarlarındaki hedefleri algıla'         },
  { num: 14, exerciseId: 'micro_pause_react',      label: 'Mikro Duraklatma Tepkisi',     subtitle: 'Hareket duran hedefi fark et'                    },
  { num: 13, exerciseId: 'split_screen_mirror',    label: 'Bölünmüş Ekran Aynası',        subtitle: 'Eşzamanlı hareket eden noktalar'                 },
  { num: 12, exerciseId: 'line_scan_sprint',       label: 'Satır Tarama Koşusu',          subtitle: 'Yatay çizgi boyunca hareket eden nokta'          },
  { num: 11, exerciseId: 'double_target_switch',   label: 'Çift Hedef Geçişi',            subtitle: 'İki hedef arasında hızlı geçiş'                  },
  { num: 10, exerciseId: 'shrink_zoom_focus',      label: 'Küçül & Yaklaş Odağı',         subtitle: 'Büyüyüp küçülen hedefi takip'                    },
  { num: 9,  exerciseId: 'circular_orbit_chase',   label: 'Dairesel Yörünge Takibi',      subtitle: 'Dairesel yörüngede hareket eden hedef'            },
  { num: 8,  exerciseId: 'random_blink_trap',      label: 'Rastgele Yanıp Sönme Tuzağı',  subtitle: 'Rastgele hedeflere tepki süresi'                  },
  { num: 7,  exerciseId: 'opposite_pull',          label: 'Karşıt Çekim',                 subtitle: 'Zıt yönlerde hareket eden iki hedef'              },
  { num: 6,  exerciseId: 'speed_dot_storm',        label: 'Hız Nokta Fırtınası',          subtitle: 'Beliren ve kaybolan noktaları takip'              },
  { num: 5,  exerciseId: 'expanding_rings_focus',  label: 'Genişleyen Halkalar Odağı',    subtitle: 'Genişleyip daralan halkaları takip'               },
  { num: 4,  exerciseId: 'peripheral_flash_hunter',label: 'Geniş Görüş (Periferik) Flash Avcısı', subtitle: 'Merkeze bakarken çevrede beliren hedefler'        },
  { num: 3,  exerciseId: 'diagonal_laser_dash',    label: 'Çapraz Lazer Koşusu',          subtitle: 'Çapraz yönde hareket eden lazer ışını'            },
  { num: 2,  exerciseId: 'vertical_pulse_track',   label: 'Dikey Nabız Takibi',           subtitle: 'Yukarı-aşağı hareket eden nabzı takip'            },
  { num: 1,  exerciseId: 'flash_jump_matrix',      label: 'Flash Atlama Matrisi',         subtitle: 'Izgara üzerinde yanan noktaları hızla takip'      },
]

// ─── 3 Okuma Modülü ───────────────────────────────────────────────
interface OkumaMod {
  icon: string; label: string; subtitle: string; duration: string; route: string
}
const OKUMA_MODULES: OkumaMod[] = [
  { icon: '⚡', label: 'RSVP Okuma',     subtitle: 'Parça parça okuma · Bionic · Hız kontrolü',  duration: '8–20 dk',  route: '/exercise/chunk-rsvp'   },
  { icon: '🌊', label: 'Akış Okuma',     subtitle: 'Satır pacing · Cursor animasyon · Sprint',   duration: '10–20 dk', route: '/exercise/flow-reading' },
  { icon: '📖', label: 'Kelime Haznesi', subtitle: 'Bağlamsal kelime öğrenme · LGS / TYT',      duration: '10–20 dk', route: '/exercise/vocabulary'   },
]

const WA_GREEN  = '#1877F2'   // Facebook / İş Bankası primary blue
const EYE_BLUE  = '#40C8F0'   // İş Bankası accent blue

// ─── Accordion Bölüm ─────────────────────────────────────────────
function AccordionSection({ title, icon, color, count, children, s }: {
  title: string; icon: string; color: string; count: number
  children: React.ReactNode
  s: ReturnType<typeof ms>
}) {
  const [open, setOpen] = useState(false)
  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setOpen(v => !v)
  }
  return (
    <View style={[s.accordion, { borderColor: color + '30' }]}>
      <TouchableOpacity style={s.accHeader} onPress={toggle} activeOpacity={0.75}>
        <View style={[s.accIconBox, { backgroundColor: color + '18' }]}>
          <Text style={s.accIcon}>{icon}</Text>
        </View>
        <View style={s.accMeta}>
          <Text style={s.accTitle}>{title}</Text>
          <Text style={s.accCount}>{count} egzersiz</Text>
        </View>
        <Text style={[s.accChevron, { color }]}>{open ? '∨' : '›'}</Text>
      </TouchableOpacity>
      {open && <View style={[s.accBody, { borderTopColor: color + '25' }]}>{children}</View>}
    </View>
  )
}

// ─── Göz Egzersizi Satırı ─────────────────────────────────────────
function GozRow({ ex, onPress, isLast, s }: {
  ex: GozEx; onPress: () => void; isLast: boolean
  s: ReturnType<typeof ms>
}) {
  return (
    <TouchableOpacity
      style={[s.exRow, isLast && s.exRowLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={s.exBadge}>
        <Text style={s.exBadgeTxt}>{ex.num}</Text>
      </View>
      <View style={s.exInfo}>
        <Text style={s.exLabel}>{ex.label}</Text>
        <Text style={s.exSub}>{ex.subtitle}</Text>
      </View>
      <Text style={s.exArrow}>›</Text>
    </TouchableOpacity>
  )
}

// ─── Okuma Modül Satırı ───────────────────────────────────────────
function ModRow({ mod, navigate, isLast, s }: {
  mod: OkumaMod; navigate: (r: string) => void; isLast: boolean
  s: ReturnType<typeof ms>
}) {
  return (
    <TouchableOpacity
      style={[s.modRow, isLast && s.modRowLast]}
      onPress={() => navigate(mod.route)}
      activeOpacity={0.7}
    >
      <Text style={s.modIcon}>{mod.icon}</Text>
      <View style={s.modInfo}>
        <Text style={s.modLabel}>{mod.label}</Text>
        <Text style={s.modSub}>{mod.subtitle}</Text>
      </View>
      <View style={s.modRight}>
        <Text style={s.modDur}>{mod.duration}</Text>
        <Text style={s.modArrow}>›</Text>
      </View>
    </TouchableOpacity>
  )
}

// ─── Ana Ekran ────────────────────────────────────────────────────
export default function SessionsScreen() {
  const t           = useAppTheme()
  const s           = useMemo(() => ms(t), [t])
  const router      = useRouter()
  const { student } = useAuthStore()
  const hasDiag     = student?.hasCompletedDiagnostic ?? false
  const setPendingExerciseId = useVisualMechanicsStore((s) => s.setPendingExerciseId)

  const navigate = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(route as any)
  }, [router])

  const navigateToExercise = useCallback((exerciseId: ExerciseId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setPendingExerciseId(exerciseId)
    router.push('/visual-mechanics' as any)
  }, [router, setPendingExerciseId])

  return (
    <SafeAreaView style={s.root}>

      {/* ── Başlık ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Çalış</Text>
        <Text style={s.headerSub}>Egzersiz seç ve başla</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ══════════════════════════════════════════════════════
            BÖLÜM 1 — Tanılama Testi
        ══════════════════════════════════════════════════════ */}
        <View style={s.heroCard}>
          <View style={s.heroLeft}>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeTxt}>
                {hasDiag ? '🔁 Tekrar Et' : '🆕 Yeni'}
              </Text>
            </View>
            <Text style={s.heroTitle}>Tanılama Testini Başlat</Text>
            <Text style={s.heroDesc}>
              {hasDiag
                ? 'ARP gelişimini ölç. Her seferinde farklı metin, 5 anlama sorusu.'
                : 'Okuma hızı ve anlama düzeyini ölç. Kişisel ARP başlangıç değerini belirle.'}
            </Text>
          </View>
          <TouchableOpacity
            style={s.heroBtn}
            onPress={() => navigate('/tanilama')}
            activeOpacity={0.85}
          >
            <Text style={s.heroBtnIcon}>⚡</Text>
            <Text style={s.heroBtnTxt}>Başla</Text>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════════════════════
            Paragraf Soru Pratiği
        ══════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={[s.heroCard, { borderColor: '#1D4ED850', marginTop: 8 }]}
          onPress={() => navigate('/(tabs)/practice')}
          activeOpacity={0.85}
        >
          <View style={s.heroLeft}>
            <View style={[s.heroBadge, { backgroundColor: '#1D4ED820' }]}>
              <Text style={[s.heroBadgeTxt, { color: '#1D4ED8' }]}>📝 TYT / LGS</Text>
            </View>
            <Text style={s.heroTitle}>Paragraf Soru Pratiği</Text>
            <Text style={s.heroDesc}>
              55 metin · TYT/LGS tarzı ABCD şıkları · Net skor · ARP'a yansır
            </Text>
          </View>
          <TouchableOpacity
            style={[s.heroBtn, { backgroundColor: '#1D4ED8' }]}
            onPress={() => navigate('/(tabs)/practice')}
            activeOpacity={0.85}
          >
            <Text style={s.heroBtnIcon}>📝</Text>
            <Text style={s.heroBtnTxt}>Başla</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ══════════════════════════════════════════════════════
            Mock Sınav
        ══════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={[s.heroCard, { borderColor: '#FF950050', marginTop: 8 }]}
          onPress={() => navigate('/exam/setup')}
          activeOpacity={0.85}
        >
          <View style={s.heroLeft}>
            <View style={[s.heroBadge, { backgroundColor: '#FF950020' }]}>
              <Text style={[s.heroBadgeTxt, { color: '#FF9500' }]}>🏆 LGS / TYT / AYT / YDS</Text>
            </View>
            <Text style={s.heroTitle}>Mock Sınav Simülatörü</Text>
            <Text style={s.heroDesc}>
              Gerçek sınav formatı · Geri sayım · Doğru/Yanlış/Net analizi · Cevap anahtarı
            </Text>
          </View>
          <TouchableOpacity
            style={[s.heroBtn, { backgroundColor: '#FF9500' }]}
            onPress={() => navigate('/exam/setup')}
            activeOpacity={0.85}
          >
            <Text style={s.heroBtnIcon}>🎯</Text>
            <Text style={s.heroBtnTxt}>Başla</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ══════════════════════════════════════════════════════
            SRS — Yanlış Cevaplar + Ders Analizi
        ══════════════════════════════════════════════════════ */}
        <View style={[s.heroCard, { borderColor: '#FF3B3050', marginTop: 8, gap: 0 }]}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 }}
            onPress={() => navigate('/exercise/wrong-answers')}
            activeOpacity={0.85}
          >
            <View style={s.heroLeft}>
              <View style={[s.heroBadge, { backgroundColor: '#FF3B3020' }]}>
                <Text style={[s.heroBadgeTxt, { color: '#FF3B30' }]}>🔁 SM-2 Tekrar</Text>
              </View>
              <Text style={s.heroTitle}>Yanlış Cevaplar</Text>
              <Text style={s.heroDesc}>
                Hatalı sorular · Aralıklı tekrar · SM-2 algoritması
              </Text>
            </View>
            <View style={[s.heroBtn, { backgroundColor: '#FF3B30' }]}>
              <Text style={s.heroBtnIcon}>🔁</Text>
              <Text style={s.heroBtnTxt}>Tekrar</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[s.heroCard, { borderColor: '#34C75950', marginTop: 8 }]}
          onPress={() => navigate('/exercise/subject-progress')}
          activeOpacity={0.85}
        >
          <View style={s.heroLeft}>
            <View style={[s.heroBadge, { backgroundColor: '#34C75920' }]}>
              <Text style={[s.heroBadgeTxt, { color: '#34C759' }]}>📊 Ders Bazlı</Text>
            </View>
            <Text style={s.heroTitle}>Ders Analizi</Text>
            <Text style={s.heroDesc}>
              Doğru/Yanlış/Net · Başarı yüzdesi · Zayıf konular
            </Text>
          </View>
          <View style={[s.heroBtn, { backgroundColor: '#34C759' }]}>
            <Text style={s.heroBtnIcon}>📊</Text>
            <Text style={s.heroBtnTxt}>İncele</Text>
          </View>
        </TouchableOpacity>

        {/* ══════════════════════════════════════════════════════
            Boss Savaşı
        ══════════════════════════════════════════════════════ */}
        <View style={[s.heroCard, { borderColor: '#8B5CF650', marginTop: 8, backgroundColor: '#0D0520' }]}>
          <View style={s.heroLeft}>
            <View style={[s.heroBadge, { backgroundColor: '#8B5CF620' }]}>
              <Text style={[s.heroBadgeTxt, { color: '#8B5CF6' }]}>⚔️ BOSS SAVAŞI</Text>
            </View>
            <Text style={[s.heroTitle, { color: '#F9FAFB' }]}>Boss Savaşı</Text>
            <Text style={s.heroDesc}>50 soru · 60 dakika · Boss'u yen! XP kazan</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'LGS Türkçe',   examType: 'LGS', subject: 'Türkçe'     },
                { label: 'LGS Fen',      examType: 'LGS', subject: 'Fen'         },
                { label: 'TYT Türkçe',   examType: 'TYT', subject: 'TYT Türkçe' },
                { label: 'AYT Edebiyat', examType: 'AYT', subject: 'AYT Edebiyat' },
              ].map(b => (
                <TouchableOpacity
                  key={b.label}
                  style={{ backgroundColor: '#8B5CF620', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#8B5CF640' }}
                  onPress={() => navigate(`/exercise/boss-exam?examType=${b.examType}&subject=${encodeURIComponent(b.subject)}` as any)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#C4B5FD', fontSize: 12, fontWeight: '700' }}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            BÖLÜM 2 — Göz & Dikkat Egzersizleri
        ══════════════════════════════════════════════════════ */}
        <Text style={s.sectionLabel}>KARTAL GÖZÜ</Text>

        <View style={s.accordionWrap}>
          <AccordionSection
            title="Kartal Gözü"
            icon="👁️"
            color={EYE_BLUE}
            count={GOZ_EXERCISES.length}
            s={s}
          >
            {GOZ_EXERCISES.map((ex, i) => (
              <GozRow
                key={ex.num}
                ex={ex}
                onPress={() => navigateToExercise(ex.exerciseId)}
                isLast={i === GOZ_EXERCISES.length - 1}
                s={s}
              />
            ))}
          </AccordionSection>
        </View>

        {/* ══════════════════════════════════════════════════════
            BÖLÜM 3 — Okuma Modülleri
        ══════════════════════════════════════════════════════ */}
        <Text style={[s.sectionLabel, { marginTop: 20 }]}>OKUMA MODÜLLERİ</Text>

        <View style={s.accordionWrap}>
          <AccordionSection
            title="Okuma Modülleri"
            icon="📖"
            color={WA_GREEN}
            count={OKUMA_MODULES.length}
            s={s}
          >
            {OKUMA_MODULES.map((mod, i) => (
              <ModRow
                key={mod.route}
                mod={mod}
                navigate={navigate}
                isLast={i === OKUMA_MODULES.length - 1}
                s={s}
              />
            ))}
          </AccordionSection>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: t.colors.background },
    scroll: { paddingBottom: 24 },

    // Header
    header: {
      backgroundColor:   t.colors.headerBg,
      paddingHorizontal: 20,
      paddingTop:        16,
      paddingBottom:     18,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

    // Hero kartı
    heroCard: {
      flexDirection:    'row',
      alignItems:       'center',
      backgroundColor:  t.colors.surface,
      marginHorizontal: 16,
      marginTop:        16,
      marginBottom:     8,
      borderRadius:     18,
      padding:          18,
      borderWidth:      1.5,
      borderColor:      WA_GREEN + '50',
      gap:              14,
      ...t.shadow.sm,
    },
    heroLeft: { flex: 1 },
    heroBadge: {
      alignSelf:         'flex-start',
      backgroundColor:   WA_GREEN + '20',
      borderRadius:      999,
      paddingHorizontal: 10,
      paddingVertical:   3,
      marginBottom:      8,
    },
    heroBadgeTxt: { fontSize: 11, fontWeight: '700', color: WA_GREEN },
    heroTitle: {
      fontSize:    17,
      fontWeight:  '800',
      color:       t.colors.text,
      marginBottom: 6,
    },
    heroDesc: { fontSize: 12, color: t.colors.textSub, lineHeight: 18 },
    heroBtn: {
      alignItems:        'center',
      justifyContent:    'center',
      backgroundColor:   WA_GREEN,
      borderRadius:      999,
      paddingHorizontal: 14,
      paddingVertical:   12,
      gap:               4,
    },
    heroBtnIcon: { fontSize: 20 },
    heroBtnTxt:  { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

    // Bölüm başlığı
    sectionLabel: {
      fontSize:          11,
      fontWeight:        '700',
      letterSpacing:     1.5,
      color:             t.colors.textHint,
      paddingHorizontal: 16,
      paddingTop:        16,
      paddingBottom:     6,
    },

    // Accordion container
    accordionWrap: {
      marginHorizontal: 16,
    },

    // Accordion kart
    accordion: {
      borderRadius:    16,
      borderWidth:     1.5,
      backgroundColor: t.colors.surface,
      overflow:        'hidden',
      ...t.shadow.sm,
    },

    // Accordion header satırı
    accHeader: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 16,
      paddingVertical:   14,
      gap:               12,
    },
    accIconBox: {
      width:          44,
      height:         44,
      borderRadius:   13,
      alignItems:     'center',
      justifyContent: 'center',
    },
    accIcon:    { fontSize: 22 },
    accMeta:    { flex: 1 },
    accTitle:   { fontSize: 15, fontWeight: '700', color: t.colors.text },
    accCount:   { fontSize: 11, color: t.colors.textSub, marginTop: 2 },
    accChevron: { fontSize: 22, fontWeight: '300' },

    // Accordion body
    accBody: {
      borderTopWidth: 1,
    },

    // Göz egzersiz satırı
    exRow: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 16,
      paddingVertical:   13,
      gap:               12,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.divider,
    },
    exRowLast: {
      borderBottomWidth: 0,
    },
    exBadge: {
      width:           28,
      height:          28,
      borderRadius:    8,
      backgroundColor: EYE_BLUE + '18',
      alignItems:      'center',
      justifyContent:  'center',
    },
    exBadgeTxt: { fontSize: 12, fontWeight: '800', color: EYE_BLUE },
    exInfo:     { flex: 1 },
    exLabel:    { fontSize: 14, fontWeight: '600', color: t.colors.text },
    exSub:      { fontSize: 11, color: t.colors.textSub, marginTop: 2 },
    exArrow:    { fontSize: 20, color: t.colors.textHint },

    // Okuma modül satırı
    modRow: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 16,
      paddingVertical:   13,
      gap:               12,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.divider,
    },
    modRowLast: {
      borderBottomWidth: 0,
    },
    modIcon:  { fontSize: 24 },
    modInfo:  { flex: 1 },
    modLabel: { fontSize: 14, fontWeight: '700', color: t.colors.text },
    modSub:   { fontSize: 11, color: t.colors.textSub, marginTop: 2 },
    modRight: { alignItems: 'flex-end', gap: 2 },
    modDur:   { fontSize: 10, color: t.colors.textHint },
    modArrow: { fontSize: 20, color: t.colors.textHint },
  })
}
