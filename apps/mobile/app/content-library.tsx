import React, { useMemo, useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import { createUserContentService } from '@sprinta/api'
import type { UserContent } from '@sprinta/api'
import { useAppTheme } from '../src/theme/useAppTheme'
import type { AppTheme } from '../src/theme'
import { useAuthStore } from '../src/stores/authStore'
import { useContentProcessor } from '../src/hooks/useContentProcessor'

// ─── Supabase ─────────────────────────────────────────────────────
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
)
const contentSvc = createUserContentService(supabase)

// ─── Tab tipleri ─────────────────────────────────────────────────
type LibTab = 'hazir' | 'kutuphanem'

// ─── İçerik giriş modalı ─────────────────────────────────────────
function AddContentModal({
  onClose,
  onText,
  onUrl,
}: {
  onClose: () => void
  onText: (text: string, name: string) => void
  onUrl: (url: string) => void
}) {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const [mode, setMode] = useState<'choose' | 'text' | 'url'>('choose')
  const [input, setInput] = useState('')
  const [name, setName] = useState('')

  // Basit TextInput imports (inline)
  const { TextInput } = require('react-native')

  return (
    <View style={s.modalOverlay}>
      <View style={s.modalBox}>
        <LinearGradient
          colors={t.gradients.antrenmanlar as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.modalHeader}
        >
          <Text style={s.modalTitle}>İçerik Ekle</Text>
          <TouchableOpacity onPress={onClose} style={s.modalClose}>
            <Text style={s.modalCloseTxt}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>

        {mode === 'choose' && (
          <View style={s.modalBody}>
            <TouchableOpacity
              style={s.modalOption}
              onPress={() => setMode('text')}
            >
              <Text style={s.modalOptionIcon}>✏️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.modalOptionTitle}>Metin Yapıştır</Text>
                <Text style={s.modalOptionSub}>Herhangi bir metni kopyalayıp yapıştırın</Text>
              </View>
              <Text style={{ color: t.colors.textHint }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.modalOption}
              onPress={() => setMode('url')}
            >
              <Text style={s.modalOptionIcon}>🔗</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.modalOptionTitle}>URL'den İçe Aktar</Text>
                <Text style={s.modalOptionSub}>Web sayfası veya makale linki girin</Text>
              </View>
              <Text style={{ color: t.colors.textHint }}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'text' && (
          <View style={s.modalBody}>
            <TextInput
              placeholder="İçerik adı (örn: Tarih Makalesi)"
              placeholderTextColor={t.colors.textHint}
              value={name}
              onChangeText={setName}
              style={[s.textInput, { marginBottom: 12 }]}
            />
            <TextInput
              placeholder="Metni buraya yapıştırın…"
              placeholderTextColor={t.colors.textHint}
              value={input}
              onChangeText={setInput}
              multiline
              numberOfLines={6}
              style={[s.textInput, { height: 140, textAlignVertical: 'top' }]}
            />
            <TouchableOpacity
              onPress={() => onText(input, name || 'Metin İçerik')}
              activeOpacity={0.85}
              disabled={input.trim().length < 50}
            >
              <LinearGradient
                colors={t.gradients.hero as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[s.modalBtn, input.trim().length < 50 && { opacity: 0.4 }]}
              >
                <Text style={s.modalBtnTxt}>Analiz Et →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'url' && (
          <View style={s.modalBody}>
            <TextInput
              placeholder="https://ornek.com/makale"
              placeholderTextColor={t.colors.textHint}
              value={input}
              onChangeText={setInput}
              autoCapitalize="none"
              keyboardType="url"
              style={s.textInput}
            />
            <TouchableOpacity
              onPress={() => onUrl(input)}
              activeOpacity={0.85}
              disabled={!input.startsWith('http')}
              style={{ marginTop: 12 }}
            >
              <LinearGradient
                colors={t.gradients.hero as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[s.modalBtn, !input.startsWith('http') && { opacity: 0.4 }]}
              >
                <Text style={s.modalBtnTxt}>İçe Aktar →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

// ─── Ana ekran ────────────────────────────────────────────────────
export default function ContentLibraryScreen() {
  const router = useRouter()
  const { newContentId } = useLocalSearchParams<{ newContentId?: string }>()
  const { student } = useAuthStore()
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])

  const [activeTab, setActiveTab] = useState<LibTab>('kutuphanem')
  const [userContents, setUserContents] = useState<UserContent[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const { processText, processURL, state: processorState } = useContentProcessor()

  // ── Kullanıcı içeriklerini yükle ─────────────────────────────
  const loadUserContents = useCallback(async () => {
    if (!student) return
    setLoading(true)
    const items = await contentSvc.getUserContents(student.id)
    setUserContents(items)
    setLoading(false)
  }, [student])

  useEffect(() => {
    loadUserContents()
  }, [loadUserContents, newContentId])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadUserContents()
    setRefreshing(false)
  }

  // ── İşlemci durumu değişince chunk-select'e git ───────────────
  useEffect(() => {
    if (processorState === 'ready') {
      setShowAddModal(false)
      router.push('/content-chunk-select')
    }
  }, [processorState, router])

  const handleTextSubmit = (text: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    processText(text, name)
  }

  const handleUrlSubmit = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    processURL(url)
  }

  const handleContentPress = (content: UserContent) => {
    Haptics.selectionAsync()
    router.push({
      pathname: '/exercise/[moduleCode]/session',
      params: {
        moduleCode: content.suggested_category ?? 'speed_control',
        difficulty: '5',
        exerciseId: 'user_content',
        userContentId: content.id,
      },
    })
  }

  // ── İlerleme yüzdesi ──────────────────────────────────────────
  const getProgress = (content: UserContent) => {
    // Basit: sadece last_read_at kontrolü
    return content.last_read_at ? 40 : 0
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <LinearGradient
        colors={t.gradients.antrenmanlar as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <Text style={s.headerTitle}>📚 İçerik Kütüphanesi</Text>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={s.addBtnTxt}>+ Ekle</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {(['hazir', 'kutuphanem'] as LibTab[]).map((tab) => {
          const active = activeTab === tab
          const label = tab === 'hazir' ? '🎓 Hazır Metinler' : '📂 Kütüphanem'
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tabBtn, active && s.tabBtnActive]}
              onPress={() => {
                Haptics.selectionAsync()
                setActiveTab(tab)
              }}
              activeOpacity={0.7}
            >
              <Text style={[s.tabTxt, active && { color: t.colors.primary }]}>{label}</Text>
              {active && <View style={[s.tabUnderline, { backgroundColor: t.colors.primary }]} />}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* İçerik */}
      {activeTab === 'hazir' ? (
        <View style={s.center}>
          <Text style={{ fontSize: 40 }}>🔒</Text>
          <Text style={s.centerTitle}>Premium Özellik</Text>
          <Text style={s.centerSub}>
            Hazır editöryal metinlere erişmek için Premium'a geçin.
          </Text>
          <TouchableOpacity onPress={() => router.push('/(modals)/paywall' as any)} activeOpacity={0.85}>
            <LinearGradient
              colors={t.gradients.hero as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.premiumBtn}
            >
              <Text style={s.premiumBtnTxt}>Premium'a Geç →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={s.center}>
          <ActivityIndicator color={t.colors.primary} size="large" />
          <Text style={s.centerSub}>Yükleniyor…</Text>
        </View>
      ) : userContents.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 40 }}>📄</Text>
          <Text style={s.centerTitle}>Henüz İçerik Yok</Text>
          <Text style={s.centerSub}>
            PDF, metin veya URL ile kendi içeriklerinizi ekleyip egzersiz olarak okuyun.
          </Text>
          <TouchableOpacity
            style={[s.premiumBtn, { backgroundColor: t.colors.primary }]}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
          >
            <Text style={s.premiumBtnTxt}>+ İçerik Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={userContents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const progress = getProgress(item)
            return (
              <TouchableOpacity
                style={s.contentCard}
                onPress={() => handleContentPress(item)}
                activeOpacity={0.75}
              >
                <View style={s.contentCardTop}>
                  <View style={[s.typeChip, { backgroundColor: t.colors.primary + '20' }]}>
                    <Text style={[s.typeChipTxt, { color: t.colors.primary }]}>
                      {item.source_type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={s.contentMeta}>{item.total_words} kelime</Text>
                </View>
                <Text style={s.contentName} numberOfLines={2}>{item.source_name}</Text>
                {item.suggested_category && (
                  <Text style={s.contentCat}>#{item.suggested_category}</Text>
                )}
                {/* İlerleme çubuğu */}
                <View style={s.progressBar}>
                  <View style={[s.progressFill, { width: `${progress}%` as any, backgroundColor: t.colors.primary }]} />
                </View>
                <Text style={s.progressTxt}>{progress}% tamamlandı</Text>
              </TouchableOpacity>
            )
          }}
        />
      )}

      {/* İşlemci yükleniyor */}
      {(processorState === 'extracting' || processorState === 'analyzing' || processorState === 'chunking') && (
        <View style={s.processingOverlay}>
          <ActivityIndicator color={t.colors.primary} size="large" />
          <Text style={s.processingTxt}>
            {processorState === 'extracting' ? 'Metin çıkarılıyor…'
              : processorState === 'analyzing' ? 'İçerik analiz ediliyor…'
              : 'Bölümler oluşturuluyor…'}
          </Text>
        </View>
      )}

      {/* Add modal */}
      {showAddModal && (
        <AddContentModal
          onClose={() => setShowAddModal(false)}
          onText={handleTextSubmit}
          onUrl={handleUrlSubmit}
        />
      )}
    </SafeAreaView>
  )
}

function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
    centerTitle: { fontSize: 20, fontWeight: '800', color: t.colors.text, textAlign: 'center' },
    centerSub:   { fontSize: 14, color: t.colors.textSub, textAlign: 'center', lineHeight: 20 },

    header:    { paddingBottom: 16 },
    backBtn:   { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    backTxt:   { fontSize: 15, color: 'rgba(255,255,255,0.90)' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
    addBtn:    { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    addBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },

    tabBar:       { flexDirection: 'row', backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    tabBtn:       { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
    tabBtnActive: {},
    tabTxt:       { fontSize: 13, fontWeight: '600', color: t.colors.textHint },
    tabUnderline: { position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2, borderRadius: 1 },

    list: { padding: 16, paddingBottom: 40 },
    contentCard: {
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 16,
      marginBottom: 12, borderWidth: 1, borderColor: t.colors.border,
    },
    contentCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    typeChip:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    typeChipTxt:    { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    contentMeta:    { fontSize: 12, color: t.colors.textHint },
    contentName:    { fontSize: 15, fontWeight: '700', color: t.colors.text, marginBottom: 4 },
    contentCat:     { fontSize: 12, color: t.colors.textSub, marginBottom: 10 },
    progressBar:    { height: 4, backgroundColor: t.colors.border, borderRadius: 2, overflow: 'hidden' },
    progressFill:   { height: 4, borderRadius: 2 },
    progressTxt:    { fontSize: 11, color: t.colors.textHint, marginTop: 4 },

    premiumBtn:     { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center' },
    premiumBtnTxt:  { fontSize: 15, fontWeight: '800', color: '#fff' },

    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    },
    processingTxt: { fontSize: 16, color: '#fff', fontWeight: '600' },

    // Modal
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalBox: {
      backgroundColor: t.colors.background,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      overflow: 'hidden',
    },
    modalHeader: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle:  { fontSize: 18, fontWeight: '900', color: '#fff' },
    modalClose:  { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    modalCloseTxt: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
    modalBody:   { padding: 20 },
    modalOption: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 16,
      marginBottom: 12, borderWidth: 1, borderColor: t.colors.border,
    },
    modalOptionIcon:  { fontSize: 28 },
    modalOptionTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text },
    modalOptionSub:   { fontSize: 12, color: t.colors.textSub, marginTop: 2 },
    textInput: {
      backgroundColor: t.colors.surface, borderRadius: 12, padding: 14,
      fontSize: 14, color: t.colors.text, borderWidth: 1, borderColor: t.colors.border,
    },
    modalBtn:    { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    modalBtnTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
  })
}
