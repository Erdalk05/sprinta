import React, { useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../src/theme/useAppTheme'
import type { AppTheme } from '../src/theme'
import { useContentProcessor } from '../src/hooks/useContentProcessor'

const DURATION_OPTIONS = [5, 10, 15, 20] // dakika/bölüm seçenekleri

export default function ContentChunkSelectScreen() {
  const router = useRouter()
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])

  const {
    state,
    analysis,
    suggestedChunks,
    targetMinutes,
    updateChunkSize,
    confirmAndSave,
  } = useContentProcessor()

  const isSaving = state === 'saving'

  const handleDurationSelect = (min: number) => {
    Haptics.selectionAsync()
    updateChunkSize(min)
  }

  const handleSaveAll = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const contentId = await confirmAndSave()
    if (contentId) {
      router.replace({
        pathname: '/content-library',
        params: { newContentId: contentId },
      })
    }
  }

  const handleSaveFirst = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const contentId = await confirmAndSave()
    if (contentId && suggestedChunks.length > 0) {
      router.replace({
        pathname: '/exercise/[moduleCode]/session',
        params: {
          moduleCode: analysis?.suggestedCategory ?? 'speed_control',
          difficulty: '5',
          exerciseId: 'user_content',
          userChunkId: suggestedChunks[0].index.toString(),
          userContentId: contentId,
        },
      })
    }
  }

  if (!analysis) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <ActivityIndicator color={t.colors.primary} size="large" />
          <Text style={s.centerTxt}>İçerik analiz ediliyor…</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.root}>
      {/* ── Header ── */}
      <LinearGradient
        colors={t.gradients.antrenmanlar as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Bölüm Ayarla</Text>
        <Text style={s.headerSub}>
          {analysis.totalWords} kelime · {analysis.estimatedReadingMinutes} dk okuma
        </Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Analiz özeti ── */}
        <View style={s.analysisCard}>
          <Text style={s.sectionTitle}>📊 İçerik Analizi</Text>
          <View style={s.analysisGrid}>
            <View style={s.analysisStat}>
              <Text style={[s.analysisValue, { color: t.colors.primary }]}>{analysis.totalWords}</Text>
              <Text style={s.analysisLabel}>Kelime</Text>
            </View>
            <View style={s.analysisStat}>
              <Text style={[s.analysisValue, { color: '#22c55e' }]}>{analysis.totalParagraphs}</Text>
              <Text style={s.analysisLabel}>Paragraf</Text>
            </View>
            <View style={s.analysisStat}>
              <Text style={[s.analysisValue, { color: '#f59e0b' }]}>{analysis.readabilityScore}</Text>
              <Text style={s.analysisLabel}>Okunabilirlik</Text>
            </View>
          </View>
          {analysis.detectedTopics.length > 0 && (
            <View style={s.topicsRow}>
              {analysis.detectedTopics.map((topic) => (
                <View key={topic} style={[s.topicChip, { backgroundColor: t.colors.primary + '20' }]}>
                  <Text style={[s.topicTxt, { color: t.colors.primary }]}>{topic}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Bölüm süresi seçimi ── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>⏱ Bölüm Başına Süre</Text>
          <Text style={s.sectionSub}>Okuma hızınıza göre her bölümün kaç dakika süreceğini seçin.</Text>
          <View style={s.durationRow}>
            {DURATION_OPTIONS.map((min) => {
              const active = targetMinutes === min
              return active ? (
                <TouchableOpacity key={min} onPress={() => handleDurationSelect(min)} activeOpacity={0.85}>
                  <LinearGradient
                    colors={t.gradients.hero as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.durationBtn}
                  >
                    <Text style={s.durationTxtActive}>{min} dk</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={min}
                  style={s.durationBtnInactive}
                  onPress={() => handleDurationSelect(min)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.durationTxt, { color: t.colors.textSub }]}>{min} dk</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* ── Bölüm listesi ── */}
        <Text style={s.chunksHeader}>
          📚 {suggestedChunks.length} Bölüm Oluşturuldu
        </Text>

        {suggestedChunks.map((chunk, i) => (
          <View key={chunk.index} style={s.chunkRow}>
            <View style={[s.chunkNum, { backgroundColor: t.colors.primary + '15' }]}>
              <Text style={[s.chunkNumTxt, { color: t.colors.primary }]}>{i + 1}</Text>
            </View>
            <View style={s.chunkInfo}>
              <Text style={s.chunkPreview} numberOfLines={2}>
                {chunk.text.slice(0, 100)}…
              </Text>
              <Text style={s.chunkMeta}>
                {chunk.wordCount} kelime · ~{chunk.estimatedMinutes} dk
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />

        {/* ── Eylem butonları ── */}
        <TouchableOpacity
          onPress={handleSaveAll}
          activeOpacity={0.85}
          disabled={isSaving}
        >
          <LinearGradient
            colors={t.gradients.hero as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.actionBtn}
          >
            {isSaving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.actionBtnTxt}>📚 Tüm Bölümleri Kütüphaneye Ekle</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        {suggestedChunks.length > 0 && (
          <TouchableOpacity
            style={[s.secondaryBtn, { borderColor: t.colors.primary }]}
            onPress={handleSaveFirst}
            activeOpacity={0.75}
            disabled={isSaving}
          >
            <Text style={[s.secondaryBtnTxt, { color: t.colors.primary }]}>
              ⚡ Sadece İlk Bölümü Başlat
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function ms(t: AppTheme) {
  return StyleSheet.create({
    root:    { flex: 1, backgroundColor: t.colors.background },
    center:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    centerTxt: { fontSize: 15, color: t.colors.textSub },

    header:    { paddingBottom: 20 },
    backBtn:   { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    backTxt:   { fontSize: 15, color: 'rgba(255,255,255,0.90)' },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', paddingHorizontal: 20 },
    headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.80)', paddingHorizontal: 20, marginTop: 4 },

    scroll: { padding: 16, paddingBottom: 40 },

    analysisCard: {
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 16,
      marginBottom: 16, borderWidth: 1, borderColor: t.colors.border,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 12 },
    analysisGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    analysisStat: { flex: 1, alignItems: 'center' },
    analysisValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
    analysisLabel: { fontSize: 11, color: t.colors.textHint },
    topicsRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    topicChip:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    topicTxt:   { fontSize: 12, fontWeight: '600' },

    sectionCard: {
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 16,
      marginBottom: 16, borderWidth: 1, borderColor: t.colors.border,
    },
    sectionSub: { fontSize: 12, color: t.colors.textHint, marginBottom: 14, lineHeight: 18 },

    durationRow:       { flexDirection: 'row', gap: 10 },
    durationBtn:       { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    durationBtnInactive: {
      flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
      borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.background,
    },
    durationTxtActive: { fontSize: 14, fontWeight: '800', color: '#fff' },
    durationTxt:       { fontSize: 14, fontWeight: '600' },

    chunksHeader: { fontSize: 13, fontWeight: '700', color: t.colors.textHint, marginBottom: 10 },
    chunkRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 14,
      marginBottom: 10, borderWidth: 1, borderColor: t.colors.border,
    },
    chunkNum:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    chunkNumTxt: { fontSize: 14, fontWeight: '800' },
    chunkInfo:   { flex: 1 },
    chunkPreview: { fontSize: 13, color: t.colors.text, lineHeight: 18, marginBottom: 4 },
    chunkMeta:    { fontSize: 11, color: t.colors.textHint },

    actionBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
    actionBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },

    secondaryBtn: {
      borderRadius: 16, paddingVertical: 14, alignItems: 'center',
      borderWidth: 1.5, marginBottom: 8,
    },
    secondaryBtnTxt: { fontSize: 15, fontWeight: '700' },
  })
}
