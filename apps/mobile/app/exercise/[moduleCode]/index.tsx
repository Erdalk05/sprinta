import React, { useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { moduleColors } from '../../../src/constants/colors'
import { MODULE_CONFIGS } from '../../../src/constants/modules'
import { SAMPLE_EXERCISES } from '../../../src/data/sampleContent'
import { useArticles } from '../../../src/hooks/useArticles'
import { useAuthStore } from '../../../src/stores/authStore'
import { useAppTheme } from '../../../src/theme/useAppTheme'
import type { AppTheme } from '../../../src/theme'

// Modül bazlı ölçüm kriterleri
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

// Free modüller
const FREE_MODULES = new Set([
  'speed_control', 'deep_comprehension',
  'cografya', 'edebiyat', 'sosyal', 'fen', 'saglik',
  'turkce', 'ingilizce', 'teknoloji', 'bilim', 'felsefe', 'tarih', 'psikoloji',
])

// Konu makale listesi olan modüller
const SUBJECT_MODULE_CODES = new Set([
  'turkce', 'ingilizce', 'teknoloji', 'bilim', 'felsefe', 'tarih', 'psikoloji',
  'cografya', 'edebiyat', 'sosyal', 'fen', 'saglik',
])

const DIFFICULTY_STARS = (d: number) => {
  const stars = Math.min(5, Math.max(0, Math.round((d ?? 0) / 2)))
  return '★'.repeat(stars) + '☆'.repeat(5 - stars)
}

export default function ExerciseIntroScreen() {
  const { moduleCode } = useLocalSearchParams<{ moduleCode: string }>()
  const router = useRouter()
  const { student } = useAuthStore()
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])

  const config      = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const exercise    = SAMPLE_EXERCISES[moduleCode]
  const accentColor = moduleColors[moduleCode] ?? t.colors.primary
  const isLocked = !FREE_MODULES.has(moduleCode) && !(student?.isPremium ?? false)

  const currentArp = student?.currentArp ?? 0
  const difficulty  = currentArp > 200 ? 7 : currentArp > 150 ? 5 : 3

  // Tema'dan modül gradienti al
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

  // Konu makaleleri
  const isSubjectModule = SUBJECT_MODULE_CODES.has(moduleCode)
  const { articles, loading: articlesLoading } = useArticles(
    isSubjectModule ? moduleCode : '',
  )
  const hasArticles = articles.length > 0

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
    router.push({
      pathname: '/exercise/[moduleCode]/session',
      params: { moduleCode, difficulty: String(difficulty), exerciseId: exercise?.id ?? 'sample' },
    })
  }

  // ─── Konu modülü → makale listesi ────────────────────────────
  if (SUBJECT_MODULE_CODES.has(moduleCode)) {
    return (
      <SafeAreaView style={s.root}>
        <LinearGradient
          colors={moduleGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.subjectHeader}
        >
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backTxtWhite}>← Geri</Text>
          </TouchableOpacity>
          <View style={s.subjectTitleRow}>
            <View style={s.iconSmall}>
              <Text style={s.iconSmallTxt}>{config.icon}</Text>
            </View>
            <View>
              <Text style={s.subjectTitle}>{config.label}</Text>
              <Text style={s.subjectDesc}>{config.description}</Text>
            </View>
          </View>
        </LinearGradient>

        {articlesLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={s.centerTxt}>Makaleler yükleniyor…</Text>
          </View>
        ) : hasArticles ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.articleList}>
            <Text style={s.listHeader}>📚 {articles.length} Makale</Text>
            {articles.map((art, idx) => (
              <TouchableOpacity
                key={art.id}
                style={s.articleRow}
                onPress={() => startWithArticle(art.id)}
                activeOpacity={0.75}
              >
                <View style={[s.articleNum, { backgroundColor: accentColor + '20' }]}>
                  <Text style={[s.articleNumTxt, { color: accentColor }]}>{idx + 1}</Text>
                </View>
                <View style={s.articleInfo}>
                  <Text style={s.articleTitle}>{art.title}</Text>
                  <Text style={s.articleMeta}>
                    {art.word_count > 0 ? `${art.word_count} kelime  ·  ` : ''}{DIFFICULTY_STARS(art.difficulty_level * 2)}
                  </Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={s.center}>
            <Text style={s.centerTxt}>İçerik yakında eklenecek 🔄</Text>
            {exercise && (
              <TouchableOpacity
                style={[s.startBtn, { backgroundColor: accentColor }]}
                onPress={() => startWithArticle(exercise.id)}
              >
                <Text style={s.startTxt}>Örnek Makale ile Başla</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    )
  }

  // ─── Normal egzersiz intro ────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      {/* ── Gradient Hero Header ── */}
      <LinearGradient
        colors={moduleGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.heroHeader}
      >
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxtWhite}>← Geri</Text>
        </TouchableOpacity>
        <View style={s.heroContent}>
          <View style={s.heroIconBox}>
            <Text style={s.heroIcon}>{config.icon}</Text>
          </View>
          <Text style={s.heroTitle}>{config.label}</Text>
          <Text style={s.heroDesc}>{config.description}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hızlı Bilgi Şeridi ── */}
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

        {/* ── Ölçüm Kriterleri ── */}
        <View style={s.metricsSection}>
          <Text style={s.metricsTitle}>📊 Bu Seansta Ölçülür</Text>
          {(MODULE_METRICS[moduleCode] ?? DEFAULT_METRICS).map((m, i) => (
            <View key={i} style={s.metricRow}>
              <View style={[s.metricIcon, { backgroundColor: accentColor + '18' }]}>
                <Text style={{ fontSize: 16 }}>{m.icon}</Text>
              </View>
              <View style={s.metricInfo}>
                <Text style={s.metricLabel}>{m.label}</Text>
                <Text style={s.metricDesc}>{m.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── İpucu ── */}
        <View style={[s.tipBox, { borderLeftColor: accentColor }]}>
          <Text style={s.tipLabel}>💡 İpucu</Text>
          <Text style={s.tipText}>{config.tip}</Text>
        </View>

        {/* ── Premium banner ── */}
        {isLocked && (
          <View style={[s.premiumBanner, { borderColor: accentColor }]}>
            <Text style={s.premiumText}>🔒 Bu modül Premium üyelik gerektirir</Text>
          </View>
        )}

        {/* ── Başla Butonu ── */}
        {isLocked ? (
          <TouchableOpacity style={[s.startBtn, { backgroundColor: t.colors.textHint }]} onPress={handleStart}>
            <Text style={s.startTxt}>🔒 Premium'a Geç</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient
              colors={moduleGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.startBtn}
            >
              <Text style={s.startTxt}>⚡ Egzersizi Başlat</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },

    // Konu modülü header
    subjectHeader: { paddingBottom: 20 },
    backBtn:       { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    backTxtWhite:  { fontSize: 15, color: 'rgba(255,255,255,0.90)' },
    subjectTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4 },
    iconSmall:     { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
    iconSmallTxt:  { fontSize: 24 },
    subjectTitle:  { fontSize: 20, fontWeight: '800', color: '#fff' },
    subjectDesc:   { fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 2 },

    // Makale listesi
    articleList: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
    listHeader:  { fontSize: 13, fontWeight: '700', color: t.colors.textHint, marginBottom: 12, marginLeft: 4 },
    articleRow:  {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 14,
      marginBottom: 10, borderWidth: 1, borderColor: t.colors.border,
    },
    articleNum:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    articleNumTxt: { fontSize: 14, fontWeight: '800' },
    articleInfo:   { flex: 1 },
    articleTitle:  { fontSize: 15, fontWeight: '600', color: t.colors.text, marginBottom: 4 },
    articleMeta:   { fontSize: 12, color: t.colors.textSub },
    chevron:       { fontSize: 20, color: t.colors.textHint },

    center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 },
    centerTxt: { fontSize: 16, color: t.colors.textSub, textAlign: 'center' },

    // Gradient hero header
    heroHeader: { paddingBottom: 28 },
    heroContent:{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 },
    heroIconBox:{ width: 88, height: 88, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    heroIcon:   { fontSize: 44 },
    heroTitle:  { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8, textAlign: 'center' },
    heroDesc:   { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22 },

    scroll: { padding: 20, paddingBottom: 40 },

    // Bilgi kartları
    infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 20, justifyContent: 'center' },
    infoCard: {
      flex: 1, backgroundColor: t.colors.surface, borderRadius: 16, padding: 16,
      alignItems: 'center', borderWidth: 1, borderColor: t.colors.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    infoValue: { fontSize: 17, fontWeight: '900', marginBottom: 3 },
    infoLabel: { fontSize: 11, color: t.colors.textHint, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Ölçüm kriterleri
    metricsSection: {
      backgroundColor: t.colors.surface,
      borderRadius: 16, padding: 16, marginBottom: 16,
      borderWidth: 1, borderColor: t.colors.border,
      gap: 12,
    },
    metricsTitle: { fontSize: 13, fontWeight: '700', color: t.colors.text, marginBottom: 4 },
    metricRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
    metricIcon:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    metricInfo:   { flex: 1 },
    metricLabel:  { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 2 },
    metricDesc:   { fontSize: 12, color: t.colors.textHint },

    // İpucu
    tipBox:  {
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 16,
      borderLeftWidth: 4, marginBottom: 20,
      borderWidth: 1, borderColor: t.colors.border,
    },
    tipLabel: { fontSize: 13, fontWeight: '700', color: t.colors.textSub, marginBottom: 6 },
    tipText:  { fontSize: 14, color: t.colors.textSub, lineHeight: 20 },

    // Premium
    premiumBanner: { borderWidth: 1.5, borderRadius: 12, padding: 12, alignItems: 'center', backgroundColor: '#1877F212', marginBottom: 20 },
    premiumText:   { fontSize: 14, fontWeight: '600', color: '#92400E' },

    // Başla butonu
    startBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 8 },
    startTxt: { fontSize: 18, fontWeight: '800', color: '#fff' },
  })
}
