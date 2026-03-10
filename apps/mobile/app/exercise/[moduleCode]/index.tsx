import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator,
  Modal, FlatList, useWindowDimensions,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import * as Haptics from 'expo-haptics'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated'
import { moduleColors } from '../../../src/constants/colors'
import { MODULE_CONFIGS } from '../../../src/constants/modules'
import { SAMPLE_EXERCISES } from '../../../src/data/sampleContent'
import { useArticles } from '../../../src/hooks/useArticles'
import { useAuthStore } from '../../../src/stores/authStore'
import { useSessionStore } from '../../../src/stores/sessionStore'
import { useAppTheme } from '../../../src/theme/useAppTheme'
import { supabase } from '../../../src/lib/supabase'
import type { AppTheme } from '../../../src/theme'

// ── MMKV sync helper (custom text + recent items) ─────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _cmkv: any = null
function getCMKV() {
  if (_cmkv) return _cmkv
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv')
    _cmkv = new MMKV({ id: 'sprinta-content-picker' })
  } catch { _cmkv = null }
  return _cmkv
}

const CUSTOM_TEXT_KEY = 'pending_custom_exercise'
const RECENT_KEY = 'content_recent_list'

interface RecentItem { id: string; title: string; wordCount: number; usedAt: string }

function loadRecent(): RecentItem[] {
  const m = getCMKV()
  if (!m) return []
  try { return JSON.parse(m.getString(RECENT_KEY) ?? '[]') } catch { return [] }
}
function saveRecent(item: RecentItem): void {
  const m = getCMKV()
  if (!m) return
  try {
    const list = loadRecent().filter(r => r.id !== item.id)
    list.unshift(item)
    m.set(RECENT_KEY, JSON.stringify(list.slice(0, 10)))
  } catch { /**/ }
}
// ─────────────────────────────────────────────────────────────────────

const MODULE_METRICS: Record<string, { icon: string; label: string; desc: string }[]> = {
  speed_control: [
    { icon: '⚡', label: 'Okuma Hızı (WPM)', desc: 'Gerçek okuma süresi ölçülür' },
    { icon: '🧠', label: 'Anlama Oranı',     desc: 'Sorularla test edilir' },
    { icon: '📈', label: 'ARP Etkisi',       desc: 'Hız skoru profiline yansır' },
  ],
  deep_comprehension: [
    { icon: '🧠', label: 'Kavrama Derinliği', desc: 'Çok katmanlı sorularla değerlendirilir' },
    { icon: '⏱',  label: 'Tepki Süresi',      desc: 'Her soruda milisaniye hassasiyetinde' },
    { icon: '📈', label: 'ARP Etkisi',         desc: 'Kavrama skoru profiline yansır' },
  ],
  attention_power: [
    { icon: '🎯', label: 'Odak Hassasiyeti',  desc: 'Hedef bulma doğruluk oranı' },
    { icon: '⚡', label: 'Tepki Hızı',        desc: 'Milisaniye düzeyinde ölçülür' },
    { icon: '📈', label: 'ARP Etkisi',        desc: 'Dikkat skoru profiline yansır' },
  ],
  eye_training: [
    { icon: '👁️', label: 'Görsel Tarama Hızı', desc: 'Schulte tamamlama süresi' },
    { icon: '🎯', label: 'Göz Koordinasyonu',   desc: 'Sıralı hedef takip doğruluğu' },
    { icon: '📈', label: 'ARP Etkisi',           desc: 'Periferik görüş profiline yansır' },
  ],
  mental_reset: [
    { icon: '🌊', label: 'Nefes Ritmi',       desc: '4-7-8 döngü uyumu izlenir' },
    { icon: '🧘', label: 'Dinlenme Kalitesi', desc: 'Tamamlama oranıyla ölçülür' },
    { icon: '📈', label: 'Odak Yenileme',     desc: 'Sonraki seansa hazırlık skoru' },
  ],
  vocabulary: [
    { icon: '📖', label: 'Kelime Tanıma',    desc: 'Bağlamsal tahmin doğruluğu' },
    { icon: '⏱',  label: 'Öğrenme Hızı',    desc: 'Kelime başına yanıt süresi' },
    { icon: '📈', label: 'ARP Etkisi',       desc: 'Kelime hazinesi profiline yansır' },
  ],
}

const DEFAULT_METRICS = [
  { icon: '📖', label: 'Okuma Hızı',   desc: 'Gerçek WPM ölçülür' },
  { icon: '🧠', label: 'Anlama Oranı', desc: 'Sorularla değerlendirilir' },
  { icon: '📈', label: 'ARP Etkisi',   desc: 'Bilişsel profile yansır' },
]

const FREE_MODULES = new Set([
  'speed_control', 'deep_comprehension',
  'cografya', 'edebiyat', 'sosyal', 'fen', 'saglik',
  'turkce', 'ingilizce', 'teknoloji', 'bilim', 'felsefe', 'tarih', 'psikoloji',
])

const SUBJECT_MODULE_CODES = new Set([
  'turkce', 'ingilizce', 'teknoloji', 'bilim', 'felsefe', 'tarih', 'psikoloji',
  'cografya', 'edebiyat', 'sosyal', 'fen', 'saglik',
])

const READING_SETUP_MODULES = new Set(['speed_control', 'deep_comprehension'])

const DIFFICULTY_STARS = (d: number) => {
  const stars = Math.min(5, Math.max(0, Math.round((d ?? 0) / 2)))
  return '★'.repeat(stars) + '☆'.repeat(5 - stars)
}

// ── WPM Slider (Reanimated v4 — loop-free, filled track) ─────────────
const WPM_MIN = 100, WPM_MAX = 500

function WpmSlider({ value, onChange, accentColor, trackWidth }: { value: number; onChange: (v: number) => void; accentColor: string; trackWidth?: number }) {
  const { width } = useWindowDimensions()
  const trackW = trackWidth ?? Math.max(160, width - 72)
  const range = WPM_MAX - WPM_MIN
  const thumbX = useSharedValue(((value - WPM_MIN) / range) * trackW)
  const startX = useSharedValue(0)

  useEffect(() => {
    thumbX.value = ((value - WPM_MIN) / range) * trackW
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const pan = Gesture.Pan()
    .onBegin(() => { startX.value = thumbX.value })
    .onUpdate((e) => {
      const nx = Math.max(0, Math.min(trackW, startX.value + e.translationX))
      thumbX.value = nx
      runOnJS(onChange)(Math.round(WPM_MIN + (nx / trackW) * range))
    })

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }))
  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(0, thumbX.value + 11),
  }))

  return (
    <GestureDetector gesture={pan}>
      <View style={{ height: 40, justifyContent: 'center', width: trackW }}>
        {/* Track background */}
        <View style={{ height: 6, backgroundColor: accentColor + '20', borderRadius: 3, overflow: 'hidden' }}>
          {/* Filled portion */}
          <Animated.View style={[{ height: 6, backgroundColor: accentColor, borderRadius: 3, position: 'absolute' }, fillStyle]} />
        </View>
        {/* Thumb */}
        <Animated.View style={[
          { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', position: 'absolute',
            top: 7, borderWidth: 3, borderColor: accentColor,
            shadowColor: accentColor, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
          thumbStyle,
        ]} />
      </View>
    </GestureDetector>
  )
}
// ─────────────────────────────────────────────────────────────────────

interface ContentItem { id: string; title: string; word_count: number; category: string; exam_type: string }
type PickerTab = 'library' | 'text' | 'file' | 'recent'

const PICKER_TABS: { key: PickerTab; icon: string; label: string }[] = [
  { key: 'library', icon: '📚', label: 'Kütüphane' },
  { key: 'text',    icon: '✏️',  label: 'Metin'     },
  { key: 'file',    icon: '📄', label: 'Dosya'     },
  { key: 'recent',  icon: '🕐', label: 'Son'       },
]

const MODAL_NAVY = '#1A3594'

// Modül öğrenim kartları (Türkçe, kısaltmalar parantez içinde)
const MODULE_LEARN_CARDS: Record<string, { icon: string; text: string }[]> = {
  speed_control: [
    { icon: '⚡', text: 'Kelimeler grup grup gösterilir — RSVP (Rapid Serial Visual Presentation) yöntemi' },
    { icon: '📊', text: 'Her seans gerçek WPM (Kelime/Dakika) hızın ölçülür' },
    { icon: '🧠', text: 'Seans sonunda anlama (comprehension) soruları gelir, ARP puanına yansır' },
  ],
  deep_comprehension: [
    { icon: '📖', text: 'Metni kendi hızında kaydırarak okursun — göz yorgunluğu azalır' },
    { icon: '🔤', text: 'Yazı boyutunu (punto) seans sırasında bile ayarlayabilirsin' },
    { icon: '🧠', text: 'Derin analiz ve çıkarım (inference) soruları — ARP kavrama puanına işlenir' },
  ],
}

export default function ExerciseIntroScreen() {
  const { moduleCode } = useLocalSearchParams<{ moduleCode: string }>()
  const router = useRouter()
  const { student } = useAuthStore()
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])

  const { wpmPreference, fontSizePreference, setWpmPreference, setFontSizePreference } = useSessionStore()

  const config      = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const exercise    = SAMPLE_EXERCISES[moduleCode]
  const accentColor = moduleColors[moduleCode] ?? t.colors.primary
  const isLocked    = !FREE_MODULES.has(moduleCode) && !(student?.isPremium ?? false)

  const currentArp = student?.currentArp ?? 0
  const difficulty  = currentArp > 200 ? 7 : currentArp > 150 ? 5 : 3
  const isReadingSetup = READING_SETUP_MODULES.has(moduleCode)

  const moduleGradient = useMemo((): [string, string] => {
    const map: Record<string, [string, string]> = {
      speed_control:      t.gradients.speedControl as [string, string],
      deep_comprehension: t.gradients.deepComp as [string, string],
      attention_power:    t.gradients.attention as [string, string],
      mental_reset:       t.gradients.mentalReset as [string, string],
      eye_training:       t.gradients.eyeTraining as [string, string],
      vocabulary:         t.gradients.vocabulary as [string, string],
    }
    return map[moduleCode] ?? [accentColor + 'CC', accentColor + '88']
  }, [moduleCode, t, accentColor])

  const isSubjectModule = SUBJECT_MODULE_CODES.has(moduleCode)
  const { articles, loading: articlesLoading } = useArticles(isSubjectModule ? moduleCode : '')
  const hasArticles = articles.length > 0

  // ── İçerik Seçici state ──────────────────────────────────────────
  const [selectedContent, setSelectedContent] = useState<{ id: string; title: string; wordCount: number } | null>(null)
  const [showContentPicker, setShowContentPicker] = useState(false)
  const [pickerTab, setPickerTab] = useState<PickerTab>('library')

  // Kütüphane tab
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [contentLoading, setContentLoading] = useState(false)

  // Metin tab
  const [customText, setCustomText] = useState('')

  // Dosya tab
  const [fileInfo, setFileInfo] = useState<{ name: string; text: string } | null>(null)
  const [fileLoading, setFileLoading] = useState(false)

  // Son tab
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  // ─────────────────────────────────────────────────────────────────

  const openContentPicker = useCallback(async () => {
    setShowContentPicker(true)
    setRecentItems(loadRecent())
    if (contentItems.length > 0) return
    setContentLoading(true)
    try {
      const { data } = await (supabase as any)
        .from('text_library')
        .select('id, title, word_count, category, exam_type')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(40)
      setContentItems((data ?? []) as ContentItem[])
    } catch { /**/ }
    setContentLoading(false)
  }, [contentItems.length])

  const pickFile = async () => {
    setFileLoading(true)
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['text/plain', 'text/*'], copyToCacheDirectory: true })
      if (res.canceled) { setFileLoading(false); return }
      const asset = res.assets[0]
      const text = await FileSystem.readAsStringAsync(asset.uri)
      setFileInfo({ name: asset.name, text })
    } catch { /**/ }
    setFileLoading(false)
  }

  const useCustomContent = (text: string, title: string) => {
    if (!text.trim()) return
    const wordCount = text.trim().split(/\s+/).length
    try {
      getCMKV()?.set(CUSTOM_TEXT_KEY, JSON.stringify({ text, title, wordCount }))
    } catch { /**/ }
    const item = { id: 'custom_text', title, wordCount }
    setSelectedContent(item)
    setShowContentPicker(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const selectLibraryItem = (item: ContentItem) => {
    const sel = { id: item.id, title: item.title, wordCount: item.word_count }
    setSelectedContent(sel)
    saveRecent({ ...sel, usedAt: new Date().toISOString() })
    setShowContentPicker(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const startWithArticle = (articleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({
      pathname: '/exercise/[moduleCode]/session',
      params: { moduleCode, difficulty: String(difficulty), exerciseId: articleId, articleId },
    })
  }

  const handleStart = () => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      router.push('/(modals)/paywall' as Href)
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const params: Record<string, string> = {
      moduleCode,
      difficulty: String(difficulty),
      exerciseId: selectedContent?.id ?? exercise?.id ?? 'sample',
    }
    if (selectedContent?.id === 'custom_text') {
      params.hasPendingText = '1'
    } else if (selectedContent?.id) {
      params.articleId = selectedContent.id
    }
    router.push({ pathname: '/exercise/[moduleCode]/session', params } as any)
  }

  // ─── Konu modülü → makale listesi ─────────────────────────────
  if (SUBJECT_MODULE_CODES.has(moduleCode)) {
    return (
      <SafeAreaView style={s.root}>
        <LinearGradient colors={moduleGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.subjectHeader}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backTxtWhite}>← Geri</Text>
          </TouchableOpacity>
          <View style={s.subjectTitleRow}>
            <View style={s.iconSmall}><Text style={s.iconSmallTxt}>{config.icon}</Text></View>
            <View>
              <Text style={s.subjectTitle}>{config.label}</Text>
              <Text style={s.subjectDesc}>{config.description}</Text>
            </View>
          </View>
        </LinearGradient>

        {articlesLoading ? (
          <View style={s.center}><ActivityIndicator size="large" color={accentColor} /><Text style={s.centerTxt}>Makaleler yükleniyor…</Text></View>
        ) : hasArticles ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.articleList}>
            <Text style={s.listHeader}>📚 {articles.length} Makale</Text>
            {articles.map((art, idx) => (
              <TouchableOpacity key={art.id} style={s.articleRow} onPress={() => startWithArticle(art.id)} activeOpacity={0.75}>
                <View style={[s.articleNum, { backgroundColor: accentColor + '20' }]}>
                  <Text style={[s.articleNumTxt, { color: accentColor }]}>{idx + 1}</Text>
                </View>
                <View style={s.articleInfo}>
                  <Text style={s.articleTitle}>{art.title}</Text>
                  <Text style={s.articleMeta}>{art.word_count > 0 ? `${art.word_count} kelime  ·  ` : ''}{DIFFICULTY_STARS(art.difficulty_level * 2)}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={s.center}>
            <Text style={s.centerTxt}>İçerik yakında eklenecek 🔄</Text>
            {exercise && (
              <TouchableOpacity style={[s.startBtn, { backgroundColor: accentColor }]} onPress={() => startWithArticle(exercise.id)}>
                <Text style={s.startTxt}>Örnek Makale ile Başla</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    )
  }

  // ─── Kompakt okuma kurulum ekranı (speed_control / deep_comprehension) ──
  if (isReadingSetup) {
    const estMin = selectedContent?.wordCount
      ? Math.max(1, Math.round(selectedContent.wordCount / wpmPreference))
      : null

    return (
      <SafeAreaView style={s.root}>

        {/* ── Nav bar ── */}
        <View style={s.rsNav}>
          <TouchableOpacity onPress={() => router.back()} style={s.rsBackBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[s.rsBackTxt, { color: accentColor }]}>← Geri</Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero ── */}
        <View style={s.rsHero}>
          <LinearGradient colors={moduleGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.rsHeroIconWrap}>
            <Text style={s.rsHeroIcon}>{config.icon}</Text>
          </LinearGradient>
          <Text style={[s.rsHeroTitle, { color: t.colors.text }]}>{config.label}</Text>
          <Text style={[s.rsHeroSub, { color: t.colors.textSub }]}>{config.description}</Text>
        </View>

        {/* ── Kaydırılabilir içerik ── */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>

          {/* Modül öğrenim kartları */}
          {MODULE_LEARN_CARDS[moduleCode] && (
            <View style={[s.rsLearnCard, { borderColor: accentColor + '28' }]}>
              {MODULE_LEARN_CARDS[moduleCode].map((item, i) => (
                <View key={i} style={s.rsLearnRow}>
                  <View style={[s.rsLearnIcon, { backgroundColor: accentColor + '14' }]}>
                    <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                  </View>
                  <Text style={[s.rsLearnText, { color: t.colors.textSub }]}>{item.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Ayarlar paneli */}
          <View style={s.rsPanel}>

            {/* Metin seçici */}
            <TouchableOpacity
              style={[s.rsContentRow, { borderBottomColor: t.colors.border }]}
              onPress={openContentPicker}
              activeOpacity={0.7}
            >
              <View style={[s.rsRowIconBox, { backgroundColor: accentColor + '14' }]}>
                <Text style={{ fontSize: 17 }}>📄</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rsRowLabel}>METİN</Text>
                <Text style={[s.rsRowValue, { color: selectedContent ? t.colors.text : t.colors.textSub }]} numberOfLines={1}>
                  {selectedContent?.title ?? 'Kütüphaneden seç veya yapıştır'}
                </Text>
              </View>
              <View style={[s.rsSelectBtn, { borderColor: accentColor, backgroundColor: accentColor + '10' }]}>
                <Text style={{ fontSize: 12, color: accentColor, fontWeight: '800' }}>
                  {selectedContent ? 'Değiştir' : 'Seç ›'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* WPM */}
            <View style={[s.rsWpmRow, { borderBottomColor: t.colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
                <View>
                  <Text style={s.rsRowLabel}>OKUMA HIZI</Text>
                  {estMin && (
                    <Text style={[s.rsEstTime, { color: t.colors.textHint }]}>~{estMin} dk okuma süresi</Text>
                  )}
                </View>
                <Text style={[s.rsWpmBig, { color: accentColor }]}>
                  {wpmPreference}
                  <Text style={s.rsWpmUnit}> WPM</Text>
                </Text>
              </View>
              <WpmSlider value={wpmPreference} onChange={setWpmPreference} accentColor={accentColor} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={s.rsRangeHint}>Yavaş · 100</Text>
                <Text style={s.rsRangeHint}>Hızlı · 500</Text>
              </View>
            </View>

            {/* Yazı boyutu */}
            <View style={s.rsFontRow}>
              <Text style={[s.rsRowLabel, { flex: 1 }]}>YAZI BOYUTU</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['small', 'medium', 'large'] as const).map(sz => (
                  <TouchableOpacity
                    key={sz}
                    onPress={() => setFontSizePreference(sz)}
                    activeOpacity={0.75}
                    style={[s.rsFontPill,
                      fontSizePreference === sz
                        ? { backgroundColor: accentColor, borderColor: accentColor }
                        : { backgroundColor: t.colors.background, borderColor: t.colors.border },
                    ]}
                  >
                    <Text style={[s.rsFontA, fontSizePreference === sz ? s.rsFontAActive : {},
                      { fontSize: sz === 'small' ? 12 : sz === 'medium' ? 16 : 21 }]}>A</Text>
                    <Text style={[s.rsFontLabel, { color: fontSizePreference === sz ? 'rgba(255,255,255,0.75)' : t.colors.textHint }]}>
                      {sz === 'small' ? 'Küçük' : sz === 'medium' ? 'Orta' : 'Büyük'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Alt meta chipleri */}
          <View style={s.rsMeta}>
            <View style={[s.rsMetaChip, { borderColor: accentColor + '35', backgroundColor: accentColor + '0C' }]}>
              <Text style={{ fontSize: 13 }}>⏱</Text>
              <View>
                <Text style={[s.rsMetaVal, { color: accentColor }]}>{config.duration}</Text>
                <Text style={[s.rsMetaLbl, { color: t.colors.textHint }]}>SÜRE</Text>
              </View>
            </View>
            <View style={[s.rsMetaChip, { borderColor: accentColor + '35', backgroundColor: accentColor + '0C' }]}>
              <Text style={{ fontSize: 13 }}>📊</Text>
              <View>
                <Text style={[s.rsMetaVal, { color: accentColor }]}>{difficulty}/10</Text>
                <Text style={[s.rsMetaLbl, { color: t.colors.textHint }]}>ZORLUK</Text>
              </View>
            </View>
            {selectedContent?.wordCount ? (
              <View style={[s.rsMetaChip, { borderColor: accentColor + '35', backgroundColor: accentColor + '0C' }]}>
                <Text style={{ fontSize: 13 }}>📖</Text>
                <View>
                  <Text style={[s.rsMetaVal, { color: accentColor }]}>{selectedContent.wordCount}</Text>
                  <Text style={[s.rsMetaLbl, { color: t.colors.textHint }]}>KELİME</Text>
                </View>
              </View>
            ) : null}
          </View>

        </ScrollView>

        {/* Başlat — sabit alt */}
        <View style={s.rsFooter}>
          {isLocked ? (
            <TouchableOpacity style={[s.rsStartBtn, { backgroundColor: t.colors.textHint }]} onPress={handleStart}>
              <Text style={s.rsStartTxt}>🔒 Premium'a Geç</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
              <LinearGradient colors={moduleGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.rsStartBtn}>
                <Text style={s.rsStartTxt}>⚡  Egzersizi Başlat</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* İçerik Seçici Modal */}
        <Modal visible={showContentPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowContentPicker(false)}>
          <View style={p.root}>
            <View style={p.header}>
              <Text style={p.headerTitle}>📚 İçerik Seç</Text>
              <TouchableOpacity onPress={() => setShowContentPicker(false)} style={p.closeBtn}>
                <Text style={p.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={p.tabBar}>
              {PICKER_TABS.map(tab => (
                <TouchableOpacity key={tab.key} style={[p.tabBtn, pickerTab === tab.key && p.tabBtnActive]} onPress={() => setPickerTab(tab.key)} activeOpacity={0.7}>
                  <Text style={p.tabIcon}>{tab.icon}</Text>
                  <Text style={[p.tabLabel, pickerTab === tab.key && p.tabLabelActive]}>{tab.label}</Text>
                  {pickerTab === tab.key && <View style={[p.tabUnderline, { backgroundColor: MODAL_NAVY }]} />}
                </TouchableOpacity>
              ))}
            </View>
            {pickerTab === 'library' && (
              contentLoading ? <ActivityIndicator style={{ flex: 1 }} size="large" color={MODAL_NAVY} /> : (
                <FlatList data={contentItems} keyExtractor={item => item.id} contentContainerStyle={p.listContent}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={[p.libItem, selectedContent?.id === item.id && { borderColor: MODAL_NAVY }]} onPress={() => selectLibraryItem(item)} activeOpacity={0.75}>
                      {selectedContent?.id === item.id && <Text style={[p.checkmark, { color: MODAL_NAVY }]}>✓ </Text>}
                      <View style={{ flex: 1 }}>
                        <Text style={p.libTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={p.libMeta}>{item.exam_type} · {item.category} · {item.word_count ?? '—'} kelime</Text>
                      </View>
                      <Text style={p.libChevron}>›</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<View style={p.emptyWrap}><Text style={p.emptyTxt}>İçerik bulunamadı</Text></View>}
                />
              )
            )}
            {pickerTab === 'text' && (
              <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={p.textTabContent}>
                  <Text style={p.textTabHint}>Bir metin yapıştır veya yaz.</Text>
                  <TextInput style={p.textInput} multiline placeholder="Metni buraya yapıştır…" placeholderTextColor="#AAB" value={customText} onChangeText={setCustomText} textAlignVertical="top" />
                  {customText.trim().length > 0 && <Text style={p.wordCountBadge}>{customText.trim().split(/\s+/).length} kelime</Text>}
                  <TouchableOpacity style={[p.useBtn, { backgroundColor: customText.trim().length > 20 ? MODAL_NAVY : '#CCC' }]} onPress={() => useCustomContent(customText, 'Özel Metin')} disabled={customText.trim().length <= 20} activeOpacity={0.85}>
                    <Text style={p.useBtnTxt}>✓ Bu Metni Kullan</Text>
                  </TouchableOpacity>
                </ScrollView>
              </KeyboardAvoidingView>
            )}
            {pickerTab === 'file' && (
              <View style={p.fileTabContent}>
                {fileInfo ? (
                  <>
                    <View style={p.filePreviewBox}>
                      <Text style={p.filePreviewName}>📄 {fileInfo.name}</Text>
                      <Text style={p.filePreviewMeta}>{fileInfo.text.trim().split(/\s+/).length} kelime</Text>
                      <Text style={p.filePreviewSnippet} numberOfLines={4}>{fileInfo.text.slice(0, 200)}…</Text>
                    </View>
                    <TouchableOpacity style={[p.useBtn, { backgroundColor: MODAL_NAVY }]} onPress={() => useCustomContent(fileInfo.text, fileInfo.name.replace(/\.[^.]+$/, ''))} activeOpacity={0.85}>
                      <Text style={p.useBtnTxt}>✓ Bu Dosyayı Kullan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={p.rePickBtn} onPress={pickFile}><Text style={p.rePickTxt}>Farklı Dosya Seç</Text></TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={p.fileHint}>Cihazından .txt dosyası seç.</Text>
                    {fileLoading ? <ActivityIndicator size="large" color={MODAL_NAVY} style={{ marginTop: 32 }} /> : (
                      <TouchableOpacity style={[p.useBtn, { backgroundColor: MODAL_NAVY }]} onPress={pickFile} activeOpacity={0.85}><Text style={p.useBtnTxt}>📂 Dosya Seç</Text></TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}
            {pickerTab === 'recent' && (
              recentItems.length === 0 ? (
                <View style={p.emptyWrap}>
                  <Text style={p.emptyTxt}>Henüz içerik seçilmedi</Text>
                  <Text style={[p.emptyTxt, { fontSize: 12, marginTop: 4 }]}>Kütüphane'den bir metin seçince burada görünür</Text>
                </View>
              ) : (
                <FlatList data={recentItems} keyExtractor={item => item.id} contentContainerStyle={p.listContent}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={[p.libItem, selectedContent?.id === item.id && { borderColor: MODAL_NAVY }]}
                      onPress={() => { setSelectedContent({ id: item.id, title: item.title, wordCount: item.wordCount }); setShowContentPicker(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
                      activeOpacity={0.75}>
                      {selectedContent?.id === item.id && <Text style={[p.checkmark, { color: MODAL_NAVY }]}>✓ </Text>}
                      <View style={{ flex: 1 }}>
                        <Text style={p.libTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={p.libMeta}>{item.wordCount} kelime · {new Date(item.usedAt).toLocaleDateString('tr-TR')}</Text>
                      </View>
                      <Text style={p.libChevron}>›</Text>
                    </TouchableOpacity>
                  )}
                />
              )
            )}
          </View>
        </Modal>
      </SafeAreaView>
    )
  }

  // ─── Normal egzersiz intro ─────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <LinearGradient colors={moduleGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroHeader}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxtWhite}>← Geri</Text>
        </TouchableOpacity>
        <View style={s.heroContent}>
          <View style={s.heroIconBox}><Text style={s.heroIcon}>{config.icon}</Text></View>
          <Text style={s.heroTitle}>{config.label}</Text>
          <Text style={s.heroDesc}>{config.description}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Hızlı Bilgi */}
        <View style={s.infoGrid}>
          <View style={[s.infoCard, { borderColor: accentColor + '40' }]}>
            <Text style={[s.infoValue, { color: accentColor }]}>{config.duration}</Text>
            <Text style={s.infoLabel}>SÜRE</Text>
          </View>
          <View style={[s.infoCard, { borderColor: accentColor + '40' }]}>
            <Text style={[s.infoValue, { color: accentColor }]}>{difficulty}/10</Text>
            <Text style={s.infoLabel}>ZORLUK</Text>
          </View>
          {exercise?.wordCount ? (
            <View style={[s.infoCard, { borderColor: accentColor + '40' }]}>
              <Text style={[s.infoValue, { color: accentColor }]}>{exercise.wordCount}</Text>
              <Text style={s.infoLabel}>KELİME</Text>
            </View>
          ) : null}
        </View>

        {/* Ölçüm Kriterleri */}
        <View style={s.metricsSection}>
          <Text style={s.metricsTitle}>📊 Bu Seansta Ölçülür</Text>
          {(MODULE_METRICS[moduleCode] ?? DEFAULT_METRICS).map((m, i) => (
            <View key={i} style={s.metricRow}>
              <View style={[s.metricIcon, { backgroundColor: accentColor + '18' }]}><Text style={{ fontSize: 16 }}>{m.icon}</Text></View>
              <View style={s.metricInfo}>
                <Text style={s.metricLabel}>{m.label}</Text>
                <Text style={s.metricDesc}>{m.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* İpucu */}
        <View style={[s.tipBox, { borderLeftColor: accentColor }]}>
          <Text style={s.tipLabel}>💡 İpucu</Text>
          <Text style={s.tipText}>{config.tip}</Text>
        </View>

        {isLocked && (
          <View style={[s.premiumBanner, { borderColor: accentColor }]}>
            <Text style={s.premiumText}>🔒 Bu modül Premium üyelik gerektirir</Text>
          </View>
        )}

        {isLocked ? (
          <TouchableOpacity style={[s.startBtn, { backgroundColor: t.colors.textHint }]} onPress={handleStart}>
            <Text style={s.startTxt}>🔒 Premium'a Geç</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient colors={moduleGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.startBtn}>
              <Text style={s.startTxt}>⚡ Egzersizi Başlat</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Ana ekran stiller ─────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },
    subjectHeader: { paddingBottom: 20 },
    backBtn: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    backTxtWhite: { fontSize: 15, color: 'rgba(255,255,255,0.90)' },
    subjectTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4 },
    iconSmall: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
    iconSmallTxt: { fontSize: 24 },
    subjectTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    subjectDesc: { fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
    articleList: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
    listHeader: { fontSize: 13, fontWeight: '700', color: t.colors.textHint, marginBottom: 12, marginLeft: 4 },
    articleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: t.colors.border },
    articleNum: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    articleNumTxt: { fontSize: 14, fontWeight: '800' },
    articleInfo: { flex: 1 },
    articleTitle: { fontSize: 15, fontWeight: '600', color: t.colors.text, marginBottom: 4 },
    articleMeta: { fontSize: 12, color: t.colors.textSub },
    chevron: { fontSize: 20, color: t.colors.textHint },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 },
    centerTxt: { fontSize: 16, color: t.colors.textSub, textAlign: 'center' },
    heroHeader: { paddingBottom: 28 },
    heroContent: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 },
    heroIconBox: { width: 88, height: 88, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    heroIcon: { fontSize: 44 },
    heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8, textAlign: 'center' },
    heroDesc: { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22 },
    scroll: { padding: 20, paddingBottom: 40 },
    infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 20, justifyContent: 'center' },
    infoCard: { flex: 1, backgroundColor: t.colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: t.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    infoValue: { fontSize: 17, fontWeight: '900', marginBottom: 3 },
    infoLabel: { fontSize: 11, color: t.colors.textHint, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    // ── Reading Setup (rs) ekranı ────────────────────────────────────
    rsNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 0 },
    rsBackBtn: { paddingVertical: 10 },
    rsBackTxt: { fontSize: 15, fontWeight: '600' },
    rsHero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20, gap: 8 },
    rsHeroIconWrap: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4, shadowColor: '#1A3594', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
    rsHeroIcon: { fontSize: 36 },
    rsHeroTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    rsHeroSub: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
    rsLearnCard: {
      marginHorizontal: 16,
      borderRadius: 16,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      padding: 14,
      gap: 10,
    },
    rsLearnRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    rsLearnIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    rsLearnText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '500' },
    rsPanel: {
      marginHorizontal: 16, borderRadius: 20,
      backgroundColor: t.colors.surface,
      borderWidth: 1, borderColor: t.colors.border,
      shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
      overflow: 'hidden',
    },
    rsContentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    rsRowIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    rsRowLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: '#8898B0', marginBottom: 3 },
    rsRowValue: { fontSize: 14, fontWeight: '600' },
    rsSelectBtn: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 6, flexShrink: 0 },
    rsWpmRow: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    rsEstTime: { fontSize: 11, marginTop: 1 },
    rsWpmBig: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
    rsWpmUnit: { fontSize: 14, fontWeight: '600' },
    rsRangeHint: { fontSize: 10, color: '#8898B0', fontWeight: '600' },
    rsFontRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    rsFontPill: { width: 60, height: 56, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 2 },
    rsFontA: { fontWeight: '800', color: '#8898B0' },
    rsFontAActive: { color: '#fff' },
    rsFontLabel: { fontSize: 9, fontWeight: '600' },
    rsMeta: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 14 },
    rsMetaChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 12, borderWidth: 1, padding: 10 },
    rsMetaVal: { fontSize: 14, fontWeight: '800' },
    rsMetaLbl: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 1 },
    rsFooter: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
    rsStartBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
    rsStartTxt: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
    // ── Eski compact styles (normal modüller için kullanılmıyor ama gerekebilir) ─
    infoChip: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
    infoChipTxt: { fontSize: 12, fontWeight: '700' },
    // ── Setup card (normal modüller) ─────────────────────────────────
    setupCard: {
      backgroundColor: t.colors.surface, borderRadius: 20, borderWidth: 1,
      marginBottom: 16, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    setupRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
    setupIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    setupLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 3 },
    setupValue: { fontSize: 14, fontWeight: '600' },
    setupDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
    setupChip: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'center' },
    wpmBadge: { flexDirection: 'row', alignItems: 'baseline', borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
    fontPill: { width: 38, height: 36, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    metricsSection: { backgroundColor: t.colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: t.colors.border, gap: 12 },
    metricsTitle: { fontSize: 13, fontWeight: '700', color: t.colors.text, marginBottom: 4 },
    metricRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    metricIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    metricInfo: { flex: 1 },
    metricLabel: { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 2 },
    metricDesc: { fontSize: 12, color: t.colors.textHint },
    tipBox: { backgroundColor: t.colors.surface, borderRadius: 14, padding: 16, borderLeftWidth: 4, marginBottom: 20, borderWidth: 1, borderColor: t.colors.border },
    tipLabel: { fontSize: 13, fontWeight: '700', color: t.colors.textSub, marginBottom: 6 },
    tipText: { fontSize: 14, color: t.colors.textSub, lineHeight: 20 },
    premiumBanner: { borderWidth: 1.5, borderRadius: 12, padding: 12, alignItems: 'center', backgroundColor: '#1877F212', marginBottom: 20 },
    premiumText: { fontSize: 14, fontWeight: '600', color: '#92400E' },
    startBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 8 },
    startTxt: { fontSize: 18, fontWeight: '800', color: '#fff' },
  })
}

// ─── Modal stiller ─────────────────────────────────────────────────
const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    backgroundColor: MODAL_NAVY,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 16, color: '#fff', fontWeight: '700' },

  // Tab Bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E8EDF5',
  },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2, position: 'relative',
  },
  tabBtnActive: {},
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: '#8898B0' },
  tabLabelActive: { color: MODAL_NAVY, fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 2.5, borderRadius: 2 },

  // List (Kütüphane + Son)
  listContent: { padding: 14, gap: 8 },
  libItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F9FC', borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: '#E8EDF5',
  },
  libTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 3 },
  libMeta: { fontSize: 11, color: '#8898B0' },
  libChevron: { fontSize: 18, color: '#C0C8D8', marginLeft: 8 },
  checkmark: { fontSize: 14, fontWeight: '800', marginRight: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyTxt: { fontSize: 14, color: '#8898B0', textAlign: 'center' },

  // Metin tab
  textTabContent: { padding: 16, gap: 12 },
  textTabHint: { fontSize: 13, color: '#8898B0', lineHeight: 18 },
  textInput: {
    borderWidth: 1.5, borderColor: '#E8EDF5', borderRadius: 12,
    padding: 14, minHeight: 200,
    fontSize: 15, color: '#1A1A2E', backgroundColor: '#F7F9FC',
  },
  wordCountBadge: {
    alignSelf: 'flex-end', fontSize: 12, fontWeight: '700',
    color: MODAL_NAVY, backgroundColor: MODAL_NAVY + '12',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },

  // Dosya tab
  fileTabContent: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  fileHint: { fontSize: 14, color: '#8898B0', textAlign: 'center', lineHeight: 20 },
  filePreviewBox: { width: '100%', backgroundColor: '#F7F9FC', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E8EDF5', gap: 6 },
  filePreviewName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  filePreviewMeta: { fontSize: 12, color: '#8898B0' },
  filePreviewSnippet: { fontSize: 13, color: '#4A5568', lineHeight: 18 },
  rePickBtn: { paddingVertical: 10 },
  rePickTxt: { fontSize: 13, color: '#8898B0', textDecorationLine: 'underline' },

  // Ortak buton
  useBtn: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', width: '100%' },
  useBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },
})
