import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, moduleColors } from '../../../src/constants/colors'
import { MODULE_CONFIGS } from '../../../src/constants/modules'
import { SAMPLE_EXERCISES } from '../../../src/data/sampleContent'
import { useArticles } from '../../../src/hooks/useArticles'
import { useAuthStore } from '../../../src/stores/authStore'

// Free modüller — konu metinleri de ücretsiz
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

const DIFFICULTY_STARS = (d: number) => '★'.repeat(Math.round(d / 2)) + '☆'.repeat(5 - Math.round(d / 2))

export default function ExerciseIntroScreen() {
  const { moduleCode } = useLocalSearchParams<{ moduleCode: string }>()
  const router = useRouter()
  const { student } = useAuthStore()

  const config = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const exercise = SAMPLE_EXERCISES[moduleCode]
  const accentColor = moduleColors[moduleCode] ?? colors.primary
  const isPremiumRequired = !FREE_MODULES.has(moduleCode)
  const isPremium = student?.isPremium ?? false
  const isLocked = isPremiumRequired && !isPremium

  const currentArp = student?.currentArp ?? 0
  const difficulty = currentArp > 200 ? 7 : currentArp > 150 ? 5 : 3

  // Konu makaleleri — Supabase'den çek (offline cache ile)
  const isSubjectModule = SUBJECT_MODULE_CODES.has(moduleCode)
  const { articles, loading: articlesLoading } = useArticles(
    isSubjectModule ? moduleCode : '',
  )
  const hasArticles = articles.length > 0

  const startWithArticle = (articleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({
      pathname: '/exercise/[moduleCode]/session',
      params: {
        moduleCode,
        difficulty: String(difficulty),
        exerciseId: articleId,
        articleId,
      },
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
      params: {
        moduleCode,
        difficulty: String(difficulty),
        exerciseId: exercise?.id ?? 'sample',
      },
    })
  }

  // ─── Konu modülü → makale listesi göster ──────────────────
  if (SUBJECT_MODULE_CODES.has(moduleCode)) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={[styles.subjectHeader, { backgroundColor: accentColor + '15' }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <View style={styles.subjectTitleRow}>
            <View style={[styles.iconSmall, { backgroundColor: accentColor + '25' }]}>
              <Text style={styles.iconSmallTxt}>{config.icon}</Text>
            </View>
            <View>
              <Text style={[styles.subjectTitle, { color: accentColor }]}>{config.label}</Text>
              <Text style={styles.subjectDesc}>{config.description}</Text>
            </View>
          </View>
        </View>

        {articlesLoading ? (
          <View style={styles.noArticles}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.noArticlesTxt}>Makaleler yükleniyor…</Text>
          </View>
        ) : hasArticles ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.articleList}>
            <Text style={styles.listHeader}>📚 {articles.length} Makale</Text>
            {articles.map((art, idx) => (
              <TouchableOpacity
                key={art.id}
                style={styles.articleRow}
                onPress={() => startWithArticle(art.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.articleNum, { backgroundColor: accentColor + '20' }]}>
                  <Text style={[styles.articleNumTxt, { color: accentColor }]}>{idx + 1}</Text>
                </View>
                <View style={styles.articleInfo}>
                  <Text style={styles.articleTitle}>{art.title}</Text>
                  <Text style={styles.articleMeta}>
                    {art.word_count > 0 ? `${art.word_count} kelime  ·  ` : ''}{DIFFICULTY_STARS(art.difficulty_level * 2)}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          // Makale bulunamadı → fallback sample
          <View style={styles.noArticles}>
            <Text style={styles.noArticlesTxt}>İçerik yakında eklenecek 🔄</Text>
            {exercise ? (
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: accentColor }]}
                onPress={() => startWithArticle(exercise.id)}
              >
                <Text style={styles.startText}>Örnek Makale ile Başla</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </SafeAreaView>
    )
  }

  // ─── Normal egzersiz intro ─────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <Text style={styles.title}>{config.label}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{config.duration}</Text>
          <Text style={styles.infoLabel}>Süre</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{difficulty}/10</Text>
          <Text style={styles.infoLabel}>Zorluk</Text>
        </View>
        {exercise?.wordCount ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{exercise.wordCount}</Text>
            <Text style={styles.infoLabel}>Kelime</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.tipBox, { borderLeftColor: accentColor }]}>
        <Text style={styles.tipLabel}>💡 İpucu</Text>
        <Text style={styles.tipText}>{config.tip}</Text>
      </View>

      {isLocked && (
        <View style={[styles.premiumBanner, { borderColor: accentColor }]}>
          <Text style={styles.premiumText}>🔒 Bu modül Premium üyelik gerektirir</Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: isLocked ? '#9CA3AF' : accentColor }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={styles.startText}>{isLocked ? '🔒 Premium\'a Geç' : 'Egzersizi Başlat'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Subject header
  subjectHeader: { paddingBottom: 16 },
  subjectTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4 },
  iconSmall: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconSmallTxt: { fontSize: 22 },
  subjectTitle: { fontSize: 20, fontWeight: '800' },
  subjectDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  // Article list
  articleList: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  listHeader: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, marginLeft: 4 },
  articleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: colors.border,
  },
  articleNum: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  articleNumTxt: { fontSize: 14, fontWeight: '800' },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 },
  articleMeta: { fontSize: 12, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textDisabled },

  noArticles: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 },
  noArticlesTxt: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },

  // Normal intro
  backButton: { paddingHorizontal: 20, paddingVertical: 16 },
  backText: { fontSize: 15, color: colors.textSecondary },
  header: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 16, paddingBottom: 32 },
  iconContainer: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon: { fontSize: 44 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 10, textAlign: 'center' },
  description: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  infoGrid: { flexDirection: 'row', gap: 12, marginHorizontal: 24, marginBottom: 24, justifyContent: 'center' },
  infoCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 16, alignItems: 'center' },
  infoValue: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  infoLabel: { fontSize: 12, color: colors.textTertiary },
  tipBox: { marginHorizontal: 24, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderLeftWidth: 4, marginBottom: 32 },
  tipLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  tipText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  footer: { paddingHorizontal: 24, marginTop: 'auto', paddingBottom: 24 },
  startButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  startText: { fontSize: 17, fontWeight: '700', color: colors.white },
  premiumBanner: { marginHorizontal: 24, marginBottom: 16, borderWidth: 1.5, borderRadius: 12, padding: 12, alignItems: 'center', backgroundColor: '#FEF3C7' },
  premiumText: { fontSize: 14, fontWeight: '600', color: '#92400E' },
})
