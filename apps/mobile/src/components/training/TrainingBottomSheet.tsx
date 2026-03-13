/**
 * TrainingBottomSheet — Reusable bottom sheet for Egzersiz and Okuma tabs.
 *
 * NOTE: Uses custom Reanimated v4 + Gesture Handler animation.
 * @gorhom/bottom-sheet is NOT used — it is incompatible with Reanimated v4.1.6
 * (crashes with "property is not writable" at runtime).
 *
 * API mirrors @gorhom/bottom-sheet for easy future migration.
 *
 * Snap points: 50% (default) | 90% (on scroll)
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  useAnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import {
  useVisualMechanicsStore,
} from '../../features/visual-mechanics/store/visualMechanicsStore'
import {
  EXERCISE_CONFIGS,
  EXERCISE_ID_LIST,
} from '../../features/visual-mechanics/constants/exerciseConfig'
import type { ExerciseId } from '../../features/visual-mechanics/constants/exerciseConfig'
import {
  EYE_EXERCISE_CONFIGS,
  CATEGORY_COLORS,
} from '@sprinta/shared'
import type { EyeExerciseConfig, CategoryType } from '@sprinta/shared'

// ─── Göz egzersizi kategori ikonları ─────────────────────────────
const EYE_CATEGORY_ICONS: Record<CategoryType | 'boss', string> = {
  saccadic:         '⚡',
  peripheral:       '👁️',
  tracking:         '🔄',
  visual_mechanics: '🎯',
  boss:             '🏆',
}
const EYE_CATEGORY_LABEL: Record<CategoryType | 'boss', string> = {
  saccadic:         'Göz Atlaması',
  peripheral:       'Çevresel Görüş',
  tracking:         'Göz Takibi',
  visual_mechanics: 'Görsel Mekanik',
  boss:             'Boss',
}

// ─── Types ────────────────────────────────────────────────────────
export type SheetType = 'egzersiz' | 'okuma' | 'akademi'

export interface TrainingSheetRef {
  open:  () => void
  close: () => void
}

interface Props {
  type:     SheetType
  onOpen?:  () => void
  onClose?: () => void
}

// ─── Constants ────────────────────────────────────────────────────
const { height: SCREEN_H } = Dimensions.get('window')
const Y_CLOSE = SCREEN_H
const Y_HALF  = SCREEN_H * 0.50   // 50% snap
const Y_FULL  = SCREEN_H * 0.08   // ~90% snap
const SPRING  = { damping: 22, stiffness: 220, mass: 0.8 } as const

// ─── Card accent colours (15 colours, cycled) ─────────────────────
const ACCENTS = [
  '#00F5FF', '#00FF94', '#6C3EE8', '#F59E0B', '#EF4444',
  '#3B82F6', '#8B5CF6', '#10B981', '#F97316', '#06B6D4',
  '#84CC16', '#EC4899', '#14B8A6', '#A855F7', '#F43F5E',
]

// ─── İçeriğe özel ikonlar — Görsel Mekanik ───────────────────────
const VISUAL_CARD_ICONS: Record<string, string> = {
  flash_jump_matrix:      '⚡',
  vertical_pulse_track:   '📈',
  diagonal_laser_dash:    '↗️',
  peripheral_flash_hunter:'👁',
  expanding_rings_focus:  '🎯',
  speed_dot_storm:        '🌩️',
  opposite_pull:          '🧲',
  random_blink_trap:      '✨',
  circular_orbit_chase:   '🌀',
  shrink_zoom_focus:      '🔍',
  double_target_switch:   '↔️',
  line_scan_sprint:       '📖',
  split_screen_mirror:    '🪞',
  micro_pause_react:      '⏹️',
  tunnel_vision_breaker:  '🦅',
  yagmur_hedef:          '🌧️',
  renk_hafiza:           '🎨',
}

// ─── İçeriğe özel ikonlar — Kartal Gözü ──────────────────────────
const EYE_CARD_ICONS: Record<string, string> = {
  // Göz Atlaması (Sakkadik)
  besgen_arena:           '🔵',
  zigzag_atlas:           '〽️',
  schulte_tablo:          '🔢',
  rakam_sprint:           '💨',
  // Çevresel Görüş (Periferik)
  meteor_yagmuru:         '☄️',
  kalp_ritim:             '💗',
  periferi_flash_avcisi:  '🔦',
  satir_panorama:         '📜',
  yildiz_agi_tarama:      '⭐',
  // Göz Takibi (Smooth Pursuit)
  pinball_goz:            '🎱',
  cup_oyunu:              '🎩',
  rastgele_flash_tuzagi:  '🎲',
  spiral_takip_ritmi:     '💫',
  dalga_surucusu:         '🌊',
  // Kelime Oyunları (Sakkadik)
  harf_zinciri:           '🔗',
  anagram_cozucu:         '🔀',
  kelime_eslestirme:      '🃏',
  hecele_atla:            '🪜',
  // Kelime Oyunları (Periferik)
  kelime_yagmuru:         '🌧️',
  cumle_yarisi:           '🏃',
  // Kelime Oyunları (Göz Takibi)
  kelime_sniper:          '🎯',
  soru_kosusu:            '📖',
  // Boss
  kartal_meydan_okumasi:  '🏆',
}

// ─── Akademi kategorileri ─────────────────────────────────────────
const AKADEMI_CATEGORIES = [
  { id: 'profil',     icon: '👤', label: 'Profil',       sub: 'Hesap, istatistikler',         route: '/(tabs)/profile'  },
  { id: 'aicoach',    icon: '🤖', label: 'AI Koç',        sub: 'Sabah brifingi, sohbet',        route: '/(tabs)/coach'    },
  { id: 'calis',      icon: '💪', label: 'Çalış',         sub: 'Tanılama, RSVP, Göz egz.',     route: '/(tabs)/sessions' },
  { id: 'istatistik', icon: '📊', label: 'İstatistikler', sub: 'ARP trendi, haftalık rapor',    route: '/(tabs)/progress' },
  { id: 'ilerleme',   icon: '📈', label: 'İlerleme',      sub: 'Seviye, XP, sıralama',          route: '/(tabs)/progress' },
  { id: 'social',     icon: '👥', label: 'Sosyal',        sub: 'Liderlik, meydan okuma',        route: '/(tabs)/social'   },
  { id: 'library',    icon: '📚', label: 'Kütüphane',     sub: 'PDF, URL, içeriklerim',         route: '/content-library' },
  { id: 'basarilar',  icon: '🏆', label: 'Başarılar',     sub: 'Rozetler, sıralama, XP',        route: '/(tabs)/progress' },
  { id: 'tercihler',  icon: '⚙️', label: 'Tercihler',     sub: 'Bildirim, gizlilik, çıkış',     route: '/(tabs)/profile'  },
] as const

// ─── Okuma modülü başlık renk paleti (29 modül) ───────────────────
const OKUMA_ACCENTS: Record<string, string> = {
  '/exercise/deep_comprehension':  '#7C3AED',
  '/exercise/chunk-rsvp':          '#0891B2',
  '/exercise/timed-reading':       '#EA580C',
  '/exercise/flow-reading':        '#059669',
  '/exercise/speed-ladder':        '#D97706',
  '/exercise/bionic-reading':      '#0284C7',
  '/exercise/keyword-scan':        '#DC2626',
  '/exercise/fixation-trainer':    '#9333EA',
  '/exercise/word-burst':          '#16A34A',
  '/exercise/auto-scroll':         '#E11D48',
  '/exercise/sentence-step':       '#0F766E',
  '/exercise/academic-mode':       '#1D4ED8',
  '/exercise/focus-filter':        '#B45309',
  '/exercise/memory-anchor':       '#6D28D9',
  '/exercise/vocabulary':          '#047857',
  '/exercise/prediction-reading':  '#C2410C',
  '/exercise/subvocal-free':       '#1E40AF',
  '/exercise/speed-camp':          '#15803D',
  '/exercise/vanishing-reading':   '#4338CA',
  '/exercise/fading-word':         '#BE185D',
  '/exercise/cloze-test':          '#7E22CE',
  '/exercise/dual-column':         '#0369A1',
  '/exercise/soru-treni':          '#B91C1C',
  '/exercise/hatali-cumle':        '#92400E',
  '/exercise/flashcard-bank':      '#0E7490',
  '/exercise/kelime-baglami':      '#3730A3',
  '/exercise/poetry-analysis':     '#86198F',
  '/exercise/graph-reading':       '#164E63',
}

// ─── Okuma module data (25 modül — ModeGrid ile aynı) ────────────
const OKUMA_MODULES = [
  { icon: '⚡', label: 'Chunk Okuma',        subtitle: 'Kelimeyi grup grup gör · hızını 2×',              route: '/exercise/chunk-rsvp'        },
  { icon: '🧠', label: 'Derin Kavrama',      subtitle: 'Serbest okuma · yazı boyutu · anlama soruları',    route: '/exercise/deep_comprehension'},
  { icon: '⏱️', label: 'Zamanlı Okuma',      subtitle: 'Süre baskısı · YKS/TYT simülasyonu',              route: '/exercise/timed-reading'     },
  { icon: '🌊', label: 'Akış Okuma',         subtitle: 'Satır pacing · anlama + hız dengesi',             route: '/exercise/flow-reading'      },
  { icon: '🪜', label: 'Hız Merdiveni',      subtitle: 'Her 30 kelimede +25 WPM · limitini zorla',        route: '/exercise/speed-ladder'      },
  { icon: '🧬', label: 'Biyonik Okuma',      subtitle: 'İlk heceler kalın · beyin tamamlar',              route: '/exercise/bionic-reading'    },
  { icon: '🔍', label: 'Anahtar Kelime',     subtitle: 'Kritik bilgiyi tara · pasaj tekniği',             route: '/exercise/keyword-scan'      },
  { icon: '👁️', label: 'Göz Genişliği',      subtitle: 'Flash gruplar · daha az göz hareketi',            route: '/exercise/fixation-trainer'  },
  { icon: '💫', label: 'Çok Kelime',         subtitle: '2-4 kelime aynı anda · span artır',               route: '/exercise/word-burst'        },
  { icon: '📜', label: 'Oto Kaydırma',       subtitle: 'Metin kendi hızında akar · ritim kur',            route: '/exercise/auto-scroll'       },
  { icon: '📝', label: 'Cümle Adım',         subtitle: 'Cümle cümle ilerle · anlama odaklı',              route: '/exercise/sentence-step'     },
  { icon: '📚', label: 'Akademik Mod',        subtitle: 'Derin anlama · ağır paragraf çözme',              route: '/exercise/academic-mode'     },
  { icon: '🎯', label: 'Dikkat Filtresi',    subtitle: 'Tek satırı gör · odaklanmayı güçlendir',          route: '/exercise/focus-filter'      },
  { icon: '🧠', label: 'Hafıza Sabitleme',   subtitle: 'Oku-gizle-hatırla · bilgiyi kalıcı yap',          route: '/exercise/memory-anchor'     },
  { icon: '📖', label: 'Kelime Haznesi',     subtitle: 'Kelime öğren · bağlamsal anlam · LGS',            route: '/exercise/vocabulary'        },
  { icon: '🔮', label: 'Tahmin Okuma',       subtitle: 'Cümle sonunu tahmin et · anlam bağlantısı',       route: '/exercise/prediction-reading'},
  { icon: '🤫', label: 'Sessiz Okuma',       subtitle: 'İç sesi bastır · subvokalizasyonu kır',           route: '/exercise/subvocal-free'     },
  { icon: '🏕️', label: 'Hızlı Okuma Kampı', subtitle: 'Günlük antrenman · WPM gelişimini izle',          route: '/exercise/speed-camp'        },
  // ── Yeni Okuma Modülleri ─────────────────────────────────────
  { icon: '🌫️', label: 'Kaybolma Okuma',     subtitle: 'Metin solar · anlama soruları',                  route: '/exercise/vanishing-reading' },
  { icon: '🗑️', label: 'Kelime Silme',       subtitle: 'Kelimeler kaybolur · hafızandan tamamla',         route: '/exercise/fading-word'       },
  { icon: '📋', label: 'Cloze Testi',        subtitle: 'Her 7. kelime boşluk · LGS formatı',              route: '/exercise/cloze-test'        },
  { icon: '📰', label: 'Çift Sütun',         subtitle: 'İki kolon · periferik span egzersizi',            route: '/exercise/dual-column'       },
  { icon: '🚂', label: 'Soru Treni',         subtitle: '40 LGS sorusu · 45dk timer',                      route: '/exercise/soru-treni'        },
  { icon: '🔎', label: 'Hatalı Cümle',       subtitle: 'Dil bilgisi hatasını bul · 20 tur',               route: '/exercise/hatali-cumle'      },
  { icon: '🃏', label: 'Flash Kart Bankası',  subtitle: 'Soruları kart formatında · işaretle/tekrar',     route: '/exercise/flashcard-bank'    },
  { icon: '🔤', label: 'Kelime Bağlamı',     subtitle: 'Altı çizili kelime · 4 şık anlam',                route: '/exercise/kelime-baglami'    },
  // ── AYT Özel Modüller ─────────────────────────────────────
  { icon: '🖊️', label: 'Şiir Analizi',       subtitle: '5 şiir · edebi sanat + anlama · AYT Edebiyat',    route: '/exercise/poetry-analysis'   },
  { icon: '📊', label: 'Grafik Okuma',       subtitle: '4 veri grafiği · yorum soruları · AYT/LGS',       route: '/exercise/graph-reading'     },
] as const

// ─── İş Bankası Kart — Mavi → tıklayınca Beyaz ───────────────────
// Shared inner content renderer
function IsbCard({
  onPress, s, flex = 1,
  children,
}: {
  onPress: () => void
  s: ReturnType<typeof ts>
  flex?: number
  children: (pressed: boolean) => React.ReactNode
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.card,
        pressed ? s.cardPressed : s.cardBlue,
        { flex },
      ]}
      onPress={onPress}
    >
      {({ pressed }) => (
        <>
          {/* Dekoratif çapraz çizgiler */}
          <View style={[s.stripe1, pressed && s.stripePressed1]} />
          <View style={[s.stripe2, pressed && s.stripePressed2]} />
          {children(pressed)}
        </>
      )}
    </Pressable>
  )
}

// ─── Akademi Card ─────────────────────────────────────────────────
function AkademiCard({
  item, onPress, s,
}: {
  item: typeof AKADEMI_CATEGORIES[number]
  index: number; onPress: () => void
  s: ReturnType<typeof ts>
}) {
  return (
    <IsbCard onPress={onPress} s={s}>
      {(pressed) => (
        <>
          <View style={[s.cardNum, pressed ? s.cardNumPressed : s.cardNumBlue]}>
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
          </View>
          <Text style={[s.cardTitle, pressed && s.cardTitlePressed]} numberOfLines={2}>{item.label}</Text>
          <Text style={[s.cardDesc,  pressed && s.cardDescPressed]}  numberOfLines={2}>{item.sub}</Text>
        </>
      )}
    </IsbCard>
  )
}

// ─── Exercise Card (2-column grid) ───────────────────────────────
function ExCard({
  id, index, onPress, s,
}: {
  id: ExerciseId; index: number; onPress: () => void
  s: ReturnType<typeof ts>
}) {
  const cfg  = EXERCISE_CONFIGS[id]
  const icon = VISUAL_CARD_ICONS[id] ?? '⚡'
  return (
    <IsbCard onPress={onPress} s={s}>
      {() => (
        <>
          {/* Sağ üst köşe numara */}
          <View style={s.numCorner}>
            <Text style={s.numCornerTxt}>{index + 1}</Text>
          </View>
          {/* İçerik ikonu */}
          <View style={s.cardNum}>
            <Text style={{ fontSize: 16 }}>{icon}</Text>
          </View>
          <Text style={s.cardTitle} numberOfLines={2}>{cfg.titleTR}</Text>
          <Text style={s.cardDesc} numberOfLines={2}>{cfg.descriptionTR}</Text>
        </>
      )}
    </IsbCard>
  )
}

// ─── Kartal Gözü — Göz Egzersizi Kartı (içerik ikonu + numara) ───
function EyeExCard({
  config, index, onPress,
}: {
  config: EyeExerciseConfig
  index:  number
  onPress: () => void
}) {
  const catKey = config.isBoss ? 'boss' : config.category
  const accent = CATEGORY_COLORS[catKey] ?? '#1877F2'
  const icon   = EYE_CARD_ICONS[config.id] ?? EYE_CATEGORY_ICONS[catKey]
  const label  = EYE_CATEGORY_LABEL[catKey]

  return (
    <Pressable
      style={({ pressed }) => [
        eyeCardS.card,
        { borderTopColor: accent },
        pressed ? eyeCardS.cardPressed : {},
        { flex: 1 },
      ]}
      onPress={onPress}
    >
      {({ pressed }) => (
        <>
          {/* Sağ üst köşe numara */}
          <View style={[eyeCardS.numCorner, { backgroundColor: accent + '18' }]}>
            <Text style={[eyeCardS.numCornerTxt, { color: accent }]}>{index + 1}</Text>
          </View>
          {/* İçerik ikonu */}
          <View style={[eyeCardS.iconBox, { backgroundColor: accent + '15' }]}>
            <Text style={{ fontSize: 16 }}>{icon}</Text>
          </View>
          <Text style={[eyeCardS.title, pressed && eyeCardS.titleP, { color: accent }]}
            numberOfLines={2}>
            {config.title}
          </Text>
          <Text style={[eyeCardS.desc, pressed && eyeCardS.descP]} numberOfLines={2}>
            {label} · {config.durationSeconds}sn
          </Text>
        </>
      )}
    </Pressable>
  )
}

// ─── Kartal Gözü Kart Stilleri — beyaz + kategori rengi üst şerit ─
const eyeCardS = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderWidth: 1, borderColor: '#E5ECFF',
    borderRadius: 20, padding: 14, minHeight: 118,
    shadowColor: '#243C8F',
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.16, shadowRadius: 18, elevation: 7,
  },
  cardPressed: {
    backgroundColor: '#EEF2FF',
    transform: [{ scale: 0.97 }],
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  // Sağ üst köşe numara rozeti
  numCorner: {
    position: 'absolute', top: 9, right: 10,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  numCornerTxt: { fontSize: 9, fontWeight: '900' },
  title:  { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  titleP: { opacity: 0.80 },
  desc:   { fontSize: 11, lineHeight: 15, color: '#8896AE' },
  descP:  { color: '#6B7A99' },
})

// ─── Okuma Card — her modülün kendine özgü rengi ──────────────────
function OkumaCard({
  item, index, onPress,
}: {
  item: typeof OKUMA_MODULES[number]
  index: number
  onPress: () => void
}) {
  const accent = OKUMA_ACCENTS[item.route] ?? '#1A3594'
  return (
    <Pressable
      style={({ pressed }) => [
        eyeCardS.card,
        { borderTopColor: accent },
        pressed ? eyeCardS.cardPressed : {},
        { flex: 1 },
      ]}
      onPress={onPress}
    >
      {({ pressed }) => (
        <>
          <View style={[eyeCardS.numCorner, { backgroundColor: accent + '18' }]}>
            <Text style={[eyeCardS.numCornerTxt, { color: accent }]}>{index + 1}</Text>
          </View>
          <View style={[eyeCardS.iconBox, { backgroundColor: accent + '15' }]}>
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
          </View>
          <Text style={[eyeCardS.title, pressed && eyeCardS.titleP, { color: accent }]} numberOfLines={2}>
            {item.label}
          </Text>
          <Text style={[eyeCardS.desc, pressed && eyeCardS.descP]} numberOfLines={2}>
            {item.subtitle}
          </Text>
        </>
      )}
    </Pressable>
  )
}

// ─── Main Component ───────────────────────────────────────────────
const TrainingBottomSheet = forwardRef<TrainingSheetRef, Props>(
  ({ type, onOpen, onClose }, ref) => {
    const t   = useAppTheme()
    const s   = useMemo(() => ts(t), [t])
    const router = useRouter()
    const setPending = useVisualMechanicsStore((st) => st.setPendingExerciseId)

    const [isOpen, setIsOpen]     = useState(false)
    const [eyePage, setEyePage]   = useState<0 | 1>(0)   // 0=Görsel Mekanik, 1=Göz Antrenmanı
    const translateY = useSharedValue(Y_CLOSE)

    // ── Navigation helpers ────────────────────────────────────────
    const navigate = useCallback((route: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      translateY.value = withSpring(Y_CLOSE, SPRING, () => runOnJS(setIsOpen)(false))
      onClose?.()
      setTimeout(() => router.push(route as any), 220)
    }, [router, translateY, onClose])

    const navigateExercise = useCallback((id: ExerciseId) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setPending(id)
      router.push('/visual-mechanics' as any)
    }, [router, setPending])

    const navigateEyeExercise = useCallback((exerciseId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      router.push(`/exercise/eye_training/${exerciseId}` as any)
    }, [router])

    // ── Open / close ──────────────────────────────────────────────
    const open = useCallback(() => {
      setIsOpen(true)
      translateY.value = withSpring(Y_FULL, SPRING)
      onOpen?.()
    }, [onOpen, translateY])

    const close = useCallback(() => {
      translateY.value = withSpring(Y_CLOSE, SPRING, () =>
        runOnJS(setIsOpen)(false),
      )
      onClose?.()
    }, [onClose, translateY])

    useImperativeHandle(ref, () => ({ open, close }), [open, close])

    const snapToFull = useCallback(() => {
      translateY.value = withSpring(Y_FULL, SPRING)
    }, [translateY])

    // ── Pan gesture (drag to snap / close) ────────────────────────
    const pan = Gesture.Pan().onEnd((e) => {
      'worklet'
      const y = translateY.value
      if (e.velocityY > 600 || y > SCREEN_H * 0.78) {
        runOnJS(close)()
      } else if (e.velocityY < -400 || y < SCREEN_H * 0.38) {
        translateY.value = withSpring(Y_FULL, SPRING)
      } else {
        translateY.value = withSpring(Y_HALF, SPRING)
      }
    })

    // ── Animated styles ───────────────────────────────────────────
    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }))

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateY.value,
        [Y_FULL, Y_CLOSE],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    }))

    if (!isOpen) return null

    const title = type === 'egzersiz' ? 'Kartal Gözü'
                : type === 'okuma'    ? 'Okuma Modülleri'
                : 'Akademi'
    const sub   = type === 'egzersiz'
                  ? (eyePage === 0 ? '👁️ Görsel Mekanik — 17 egzersiz' : '⚡ Göz Antrenmanı — 23 egzersiz')
                : type === 'okuma'    ? '25 modül'
                : '9 kategori'

    // Build 2-col pairs for all types
    const exPairs: ExerciseId[][] = []
    if (type === 'egzersiz') {
      for (let i = 0; i < EXERCISE_ID_LIST.length; i += 2) {
        exPairs.push(EXERCISE_ID_LIST.slice(i, i + 2))
      }
    }

    // Yeni Kartal Gözü göz egzersizleri
    const eyePairs: EyeExerciseConfig[][] = []
    if (type === 'egzersiz') {
      for (let i = 0; i < EYE_EXERCISE_CONFIGS.length; i += 2) {
        eyePairs.push(EYE_EXERCISE_CONFIGS.slice(i, i + 2))
      }
    }
    const okPairs: (typeof OKUMA_MODULES[number])[][] = []
    if (type === 'okuma') {
      for (let i = 0; i < OKUMA_MODULES.length; i += 2) {
        okPairs.push([...OKUMA_MODULES].slice(i, i + 2))
      }
    }
    const akPairs: (typeof AKADEMI_CATEGORIES[number])[][] = []
    if (type === 'akademi') {
      for (let i = 0; i < AKADEMI_CATEGORIES.length; i += 2) {
        akPairs.push([...AKADEMI_CATEGORIES].slice(i, i + 2))
      }
    }

    return (
      <>
        {/* ── Backdrop — boşluğa tıklanınca kapat ── */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={close}
          activeOpacity={1}
        >
          <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, backdropStyle]} />
        </TouchableOpacity>

        {/* ── Sheet ── */}
        <Animated.View style={[s.sheet, sheetStyle]}>

          {/* Handle (drag target) */}
          <GestureDetector gesture={pan}>
            <View style={s.handleWrap}>
              <View style={s.handle} />
            </View>
          </GestureDetector>

          {/* Header */}
          <View style={s.headerRow}>
            <TouchableOpacity style={s.headerBtn} onPress={close}>
              <Text style={s.headerBtnTxt}>‹ Geri</Text>
            </TouchableOpacity>
            <View style={s.headerMid}>
              <Text style={s.headerTitle}>{title}</Text>
              <Text style={s.headerSub}>{sub}</Text>
            </View>
            <TouchableOpacity style={s.headerBtn} onPress={close}>
              <Text style={s.headerBtnTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
            onScrollBeginDrag={snapToFull}
          >
            {/* ── Tab Pager — sadece egzersiz sheet'inde ── */}
            {type === 'egzersiz' && (
              <View style={s.tabPager}>
                <TouchableOpacity
                  style={[s.pageTab, eyePage === 0 && s.pageTabActive]}
                  onPress={() => setEyePage(0)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.pageTabTxt, eyePage === 0 && s.pageTabTxtActive]}>👁️ Görsel Mekanik</Text>
                  <Text style={[s.pageTabSub, eyePage === 0 && s.pageTabSubActive]}>17 egzersiz</Text>
                </TouchableOpacity>
                <View style={s.pageTabDivider} />
                <TouchableOpacity
                  style={[s.pageTab, eyePage === 1 && s.pageTabActiveEye]}
                  onPress={() => setEyePage(1)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.pageTabTxt, eyePage === 1 && { color: '#1877F2' }]}>⚡ Göz Antrenmanı</Text>
                  <Text style={[s.pageTabSub, eyePage === 1 && { color: '#1877F2' }]}>23 egzersiz</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Görsel Mekanik Tab (sol) ── */}
            {type === 'egzersiz' && eyePage === 0 && (
              <TouchableOpacity
                style={s.dailyHero}
                onPress={() => navigate('/daily-training')}
                activeOpacity={0.85}
              >
                <View style={s.dailyLeft}>
                  <Text style={s.dailyIcon}>👁️</Text>
                  <View>
                    <Text style={s.dailyTitle}>Günlük Antrenman</Text>
                    <Text style={s.dailySub}>AI seçimi · 4 egzersiz · Zayıf alana odak</Text>
                  </View>
                </View>
                <Text style={s.dailyArrow}>▶</Text>
              </TouchableOpacity>
            )}

            {type === 'egzersiz' && eyePage === 0 && exPairs.map((pair, rowIdx) => (
              <View key={rowIdx} style={s.gridRow}>
                {pair.map((id, colIdx) => (
                  <ExCard
                    key={id}
                    id={id}
                    index={rowIdx * 2 + colIdx}
                    onPress={() => navigateExercise(id)}
                    s={s}
                  />
                ))}
                {pair.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}

            {/* ── Göz Antrenmanı Tab (sağ) ── */}
            {type === 'egzersiz' && eyePage === 1 && (
              <View style={s.eyeSubRow}>
                <View style={[s.eyeCatPill, { backgroundColor: 'rgba(24,119,242,0.10)', borderColor: '#1877F2' }]}>
                  <Text style={[s.eyeCatTxt, { color: '#1877F2' }]}>⚡ Göz Atlaması</Text>
                </View>
                <View style={[s.eyeCatPill, { backgroundColor: 'rgba(14,165,233,0.10)', borderColor: '#0EA5E9' }]}>
                  <Text style={[s.eyeCatTxt, { color: '#0EA5E9' }]}>👁️ Çevresel</Text>
                </View>
                <View style={[s.eyeCatPill, { backgroundColor: 'rgba(99,102,241,0.10)', borderColor: '#6366F1' }]}>
                  <Text style={[s.eyeCatTxt, { color: '#6366F1' }]}>🔄 Takip</Text>
                </View>
              </View>
            )}

            {type === 'egzersiz' && eyePage === 1 && eyePairs.map((pair, rowIdx) => (
              <View key={`eye-${rowIdx}`} style={s.gridRow}>
                {pair.map((cfg, colIdx) => (
                  <EyeExCard
                    key={cfg.id}
                    config={cfg}
                    index={rowIdx * 2 + colIdx}
                    onPress={() => navigateEyeExercise(cfg.id)}
                  />
                ))}
                {pair.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}

            {type === 'okuma' && okPairs.map((pair, rowIdx) => (
              <View key={rowIdx} style={s.gridRow}>
                {pair.map((item, colIdx) => (
                  <OkumaCard
                    key={item.route}
                    item={item}
                    index={rowIdx * 2 + colIdx}
                    onPress={() => navigate(item.route)}
                  />
                ))}
                {pair.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}

            {type === 'akademi' && akPairs.map((pair, rowIdx) => (
              <View key={rowIdx} style={s.gridRow}>
                {pair.map((item, colIdx) => (
                  <AkademiCard
                    key={item.id}
                    item={item}
                    index={rowIdx * 2 + colIdx}
                    onPress={() => navigate(item.route)}
                    s={s}
                  />
                ))}
                {pair.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </>
    )
  },
)

TrainingBottomSheet.displayName = 'TrainingBottomSheet'
export default TrainingBottomSheet

// ─── Styles ───────────────────────────────────────────────────────
function ts(t: AppTheme) {
  return StyleSheet.create({
    // Backdrop
    backdrop: {
      backgroundColor: t.isDark ? 'rgba(0,0,0,0.72)' : 'rgba(11,20,26,0.62)',
      zIndex: 100,
    },

    // Sheet container
    sheet: {
      position:        'absolute',
      left:            0,
      right:           0,
      bottom:          0,
      height:          SCREEN_H * 0.92,
      backgroundColor: t.colors.surface,
      borderTopLeftRadius:  24,
      borderTopRightRadius: 24,
      zIndex: 101,
      shadowColor:  '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: t.isDark ? 0.5 : 0.12,
      shadowRadius: 20,
      elevation: 24,
    },

    // Handle bar — navy header üstünde beyaz
    handleWrap: {
      alignItems:       'center',
      paddingTop:       10,
      paddingBottom:    6,
      backgroundColor:  '#1A3594',
      borderTopLeftRadius:  24,
      borderTopRightRadius: 24,
    },
    handle: {
      width:           40,
      height:          4,
      borderRadius:    2,
      backgroundColor: 'rgba(255,255,255,0.40)',
    },

    // Header — İş Bankası navy
    headerRow: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 16,
      paddingVertical:   14,
      backgroundColor:   '#1A3594',
    },
    headerBtn: {
      paddingHorizontal: 8,
      paddingVertical:   6,
      minWidth: 52,
    },
    headerBtnTxt: {
      fontSize:   14,
      color:      'rgba(255,255,255,0.85)',
      fontWeight: '600',
    },
    headerMid:   { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
    headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 },

    // Content area
    content: {
      paddingHorizontal: 14,
      paddingVertical:   14,
      gap:               10,
    },

    // Günlük Antrenman hero kartı
    dailyHero: {
      flexDirection:    'row',
      alignItems:       'center',
      justifyContent:   'space-between',
      backgroundColor:  '#0F2357',
      borderRadius:     18,
      padding:          16,
      borderWidth:      1.5,
      borderColor:      'rgba(64,200,240,0.35)',
      marginBottom:     2,
    },
    dailyLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    dailyIcon:  { fontSize: 28 },
    dailyTitle: {
      fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 3,
    },
    dailySub:   { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
    dailyArrow: { fontSize: 20, color: '#40C8F0', fontWeight: '900' },

    // 2-column grid row
    gridRow: {
      flexDirection: 'row',
      gap:           10,
    },

    // ── İş Bankası Kart Stilleri — Beyaz + Mavi Derinlik ─────────
    card: {
      borderWidth:  1,
      borderRadius: 20,
      padding:      14,
      minHeight:    118,
      // overflow: 'hidden' kaldırıldı — gölge görünsün
    },
    // Varsayılan: Beyaz kart + mavi lid şeridi + mavi gölge
    cardBlue: {
      backgroundColor: '#FFFFFF',
      borderColor:     '#E5ECFF',
      borderTopWidth:  3,
      borderTopColor:  '#38B6D8',
      shadowColor:     '#243C8F',
      shadowOffset:    { width: 2, height: 8 },
      shadowOpacity:   0.16,
      shadowRadius:    18,
      elevation:       7,
    },
    // Tıklanınca: açık lacivert tint
    cardPressed: {
      backgroundColor: '#EEF2FF',
      borderColor:     '#243C8F',
      borderTopColor:  '#243C8F',
      transform:       [{ scale: 0.97 }],
    },
    // Dekoratif çapraz çizgiler — beyaz kartta çok hafif mavi
    stripe1: {
      position:        'absolute',
      bottom:          24,
      left:            -30,
      right:           -30,
      height:          1.5,
      backgroundColor: 'rgba(36,60,143,0.04)',
      transform:       [{ rotate: '-10deg' }],
    },
    stripe2: {
      position:        'absolute',
      bottom:          13,
      left:            -30,
      right:           -30,
      height:          1,
      backgroundColor: 'rgba(36,60,143,0.03)',
      transform:       [{ rotate: '-10deg' }],
    },
    stripePressed1: { backgroundColor: 'rgba(36,60,143,0.08)' },
    stripePressed2: { backgroundColor: 'rgba(36,60,143,0.05)' },

    // İkon / numara kutusu
    cardNum: {
      width:          32,
      height:         32,
      borderRadius:   9,
      alignItems:     'center',
      justifyContent: 'center',
      marginBottom:   10,
    },
    cardNumBlue:    { backgroundColor: 'rgba(36,60,143,0.08)' },
    cardNumPressed: { backgroundColor: 'rgba(36,60,143,0.14)' },
    cardNumTxt:        { fontSize: 14, fontWeight: '800' },
    cardNumTxtBlue:    { color: '#243C8F' },
    cardNumTxtPressed: { color: '#1A3594' },

    // Metin — koyu mavi başlık, gri açıklama
    cardTitle: {
      fontSize: 13, fontWeight: '700', marginBottom: 4,
      color: '#243C8F',
    },
    cardTitlePressed: { color: '#0F2357' },
    cardDesc: {
      fontSize: 11, lineHeight: 15,
      color: '#6B7A99',
    },
    cardDescPressed: { color: '#3A4F7A' },

    // ── Sağ üst köşe numara rozeti (ExCard) ─────────────────────
    numCorner: {
      position: 'absolute', top: 9, right: 10,
      width: 22, height: 22, borderRadius: 11,
      backgroundColor: 'rgba(36,60,143,0.10)',
      alignItems: 'center', justifyContent: 'center',
    },
    numCornerTxt: { fontSize: 9, fontWeight: '900', color: '#243C8F' },

    // ── Tab Pager ─────────────────────────────────────────────
    tabPager: {
      flexDirection:   'row',
      backgroundColor: t.isDark ? '#111827' : '#F0F4FF',
      borderRadius:    16,
      padding:         4,
      marginBottom:    10,
    },
    pageTab: {
      flex:           1,
      alignItems:     'center',
      paddingVertical: 8,
      borderRadius:   12,
      gap:            2,
    },
    pageTabActive: {
      backgroundColor: '#FFFFFF',
      shadowColor:     '#243C8F',
      shadowOffset:    { width: 0, height: 2 },
      shadowOpacity:   0.12,
      shadowRadius:    6,
      elevation:       3,
    },
    pageTabActiveEye: {
      backgroundColor: '#FFFFFF',
      shadowColor:     '#1877F2',
      shadowOffset:    { width: 0, height: 2 },
      shadowOpacity:   0.12,
      shadowRadius:    6,
      elevation:       3,
    },
    pageTabDivider: {
      width: 1, backgroundColor: 'rgba(36,60,143,0.12)', marginVertical: 6,
    },
    pageTabTxt: {
      fontSize: 12, fontWeight: '700', color: t.isDark ? '#64748B' : '#8896AE',
    },
    pageTabTxtActive: { color: '#243C8F' },
    pageTabSub: {
      fontSize: 10, color: t.isDark ? '#475569' : '#A0AEC0', fontWeight: '600',
    },
    pageTabSubActive: { color: '#5B72B2' },

    // ── Göz egzersizleri kategori pilleri ───────────────────────
    eyeSubRow: {
      flexDirection: 'row',
      gap:           6,
      marginBottom:  6,
      flexWrap:      'wrap',
    },
    eyeCatPill: {
      borderRadius:      20,
      borderWidth:       1,
      paddingHorizontal: 10,
      paddingVertical:   4,
    },
    eyeCatTxt: { fontSize: 10, fontWeight: '700' },

  })
}
