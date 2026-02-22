import React, { useState, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, TextInput, Animated, Alert, Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useThemeToggle } from '../../src/theme/useAppTheme'
import { useAuthStore } from '../../src/stores/authStore'
import { colors } from '../../src/theme/colors'
import { typography } from '../../src/theme/typography'
import { shadows } from '../../src/theme/shadows'
import { spacing } from '../../src/theme/spacing'

const { width: W } = Dimensions.get('window')
const CARD_W = (W - spacing.md * 2 - spacing.sm) / 2

// ─── Kategori tanımları ───────────────────────────────────────────
interface SubItem { id: string; icon: string; label: string; route?: string }
interface Category { id: string; icon: string; label: string; sub: string; color: string; items: SubItem[] }

const CATEGORIES: Category[] = [
  {
    id: 'aicoach', icon: '🤖', label: 'AI Koç', sub: 'Sabah brifingi, analiz, alıştırma', color: '#6C3EE8',
    items: [
      { id: 'briefing',  icon: '☀️', label: 'Sabah Brifingi',      route: '/ai-coach' },
      { id: 'chat',      icon: '💬', label: 'Serbest Sohbet',       route: '/ai-coach' },
      { id: 'weakness',  icon: '🔍', label: 'Zayıflık Analizi',     route: '/ai-coach' },
      { id: 'content',   icon: '📝', label: 'Alıştırma Metni Üret', route: '/ai-coach' },
    ],
  },
  {
    id: 'training', icon: '💪', label: 'Antrenmanlar', sub: 'Hız, kavrama, dikkat', color: colors.primary,
    items: [
      { id: 'speed', icon: '⚡', label: 'Hız Antrenmanı',    route: '/exercise/speed_control'     },
      { id: 'comp',  icon: '🧠', label: 'Derin Kavrama',     route: '/exercise/deep_comprehension' },
      { id: 'attn',  icon: '🎯', label: 'Dikkat Gücü',       route: '/exercise/attention_power'    },
      { id: 'reset', icon: '🌿', label: 'Zihinsel Sıfırlama',route: '/exercise/mental_reset'       },
      { id: 'diag',  icon: '🧪', label: 'Tanılama Testi',    route: '/diagnostic'                  },
    ],
  },
  {
    id: 'programs', icon: '🎯', label: 'Programlar', sub: 'LGS, TYT, AYT, KPSS', color: '#F39C12',
    items: [
      { id: 'select', icon: '➕', label: 'Program Seç',    route: '/program/select'  },
      { id: 'active', icon: '▶️', label: 'Aktif Program',  route: '/(tabs)/sessions' },
      { id: 'lgs',    icon: '📘', label: 'LGS Programı',   route: '/program/select'  },
      { id: 'tyt',    icon: '📗', label: 'TYT Programı',   route: '/program/select'  },
      { id: 'ayt',    icon: '📙', label: 'AYT Programı',   route: '/program/select'  },
    ],
  },
  {
    id: 'stats', icon: '📊', label: 'İstatistikler', sub: 'ARP gelişimi, haftalık rapor', color: '#2196F3',
    items: [
      { id: 'arp',    icon: '📈', label: 'ARP Gelişimim',   route: '/(tabs)/progress' },
      { id: 'weekly', icon: '📅', label: 'Haftalık Rapor',  route: '/(tabs)/progress' },
      { id: 'skills', icon: '🎯', label: 'Beceri Profili',  route: '/(tabs)/progress' },
    ],
  },
  {
    id: 'achievements', icon: '🏆', label: 'Başarılar', sub: 'Rozetler, seviye, XP', color: '#E67E22',
    items: [
      { id: 'badges', icon: '🏅', label: 'Rozetlerim',    route: '/(tabs)/progress' },
      { id: 'level',  icon: '⭐', label: 'Seviye Durumu', route: '/(tabs)/progress' },
      { id: 'streak', icon: '🔥', label: 'Seri Takibi',   route: '/(tabs)/progress' },
    ],
  },
  {
    id: 'social', icon: '👥', label: 'Sosyal', sub: 'Sıralama, meydan okuma', color: '#16A085',
    items: [
      { id: 'lb',      icon: '🏆', label: 'Liderlik Tablosu',route: '/(tabs)/social' },
      { id: 'chal',    icon: '⚔️', label: 'Meydan Okumalar', route: '/(tabs)/social' },
      { id: 'friends', icon: '👥', label: 'Arkadaşlarım',     route: '/(tabs)/social' },
    ],
  },
  {
    id: 'settings', icon: '⚙️', label: 'Ayarlar', sub: 'Profil, bildirim, çıkış', color: '#667781',
    items: [
      { id: 'profile', icon: '👤', label: 'Profilim',         route: '/(tabs)/profile' },
      { id: 'notif',   icon: '🔔', label: 'Bildirimler',      route: '/(tabs)/profile' },
      { id: 'privacy', icon: '🔒', label: 'Gizlilik',         route: '/(tabs)/profile' },
      { id: 'help',    icon: '❓', label: 'Yardım & Destek',  route: '/(tabs)/profile' },
      { id: 'logout',  icon: '⏻',  label: 'Çıkış Yap',       route: '__logout__'      },
    ],
  },
]

// ─── Animated card bileşeni ───────────────────────────────────────
function GridCard({ cat, onPress }: { cat: Category; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current
  return (
    <Animated.View style={[{ transform: [{ scale }] }, { width: CARD_W }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start()}
        onPress={onPress}
        style={s.gridCard}
      >
        <View style={[s.gridIconWrap, { backgroundColor: cat.color + '18' }]}>
          <Text style={s.gridIcon}>{cat.icon}</Text>
        </View>
        <Text style={s.gridLabel}>{cat.label}</Text>
        <Text style={s.gridSub} numberOfLines={2}>{cat.sub}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function MenuScreen() {
  const { isDark, toggleTheme } = useThemeToggle()
  const router  = useRouter()
  const { student, logout } = useAuthStore()
  const [search, setSearch]       = useState('')
  const [activeCategory, setActive] = useState<Category | null>(null)

  const name = student?.fullName?.split(' ')[0] ?? 'Öğrenci'

  const filteredCats = search.trim()
    ? CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.items.some(i => i.label.toLowerCase().includes(search.toLowerCase()))
      )
    : CATEGORIES

  const openCategory = (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setActive(cat)
  }

  const handleSubItem = (item: SubItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setActive(null)
    if (item.route === '__logout__') {
      Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: () => logout() },
      ])
      return
    }
    if (item.route) setTimeout(() => router.push(item.route as any), 100)
  }

  return (
    <SafeAreaView style={s.root}>

      {/* ── HEADER ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Menü</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.avatarCircle} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={s.avatarTxt}>{name.charAt(0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.themeBtn} onPress={toggleTheme}>
            <Text style={s.themeTxt}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Arama */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Ne yapmak istersin?"
            placeholderTextColor={colors.textDisabled}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2×N Grid */}
        <View style={s.grid}>
          {filteredCats.map((cat) => (
            <GridCard key={cat.id} cat={cat} onPress={() => openCategory(cat)} />
          ))}
        </View>

      </ScrollView>

      {/* ── ALT KATEGORİ MODAL ── */}
      <Modal
        visible={activeCategory !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setActive(null)}
      >
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setActive(null)} />
        {activeCategory && (
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalIcon}>{activeCategory.icon}</Text>
              <View>
                <Text style={s.modalTitle}>{activeCategory.label}</Text>
                <Text style={s.modalSub}>{activeCategory.sub}</Text>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {activeCategory.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={s.subRow}
                  onPress={() => handleSubItem(item)}
                >
                  <View style={[s.subIconWrap, { backgroundColor: activeCategory.color + '18' }]}>
                    <Text style={s.subIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[s.subLabel, item.route === '__logout__' && s.logoutLabel]}>{item.label}</Text>
                  <Text style={s.subChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 14,
    backgroundColor: colors.primaryDarker,
  },
  headerTitle:  { ...(typography.h2 as object), color: colors.white },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarTxt: { fontSize: 16, fontWeight: '800', color: colors.white },
  themeBtn:  { padding: 6 },
  themeTxt:  { fontSize: 22 },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    marginTop: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    ...shadows.sm,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, ...(typography.body as object), color: colors.textPrimary },
  searchClear: { fontSize: 14, color: colors.textDisabled, paddingHorizontal: 4 },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: 16, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    ...shadows.sm,
  },
  gridIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  gridIcon:     { fontSize: 24 },
  gridLabel:    { ...(typography.bodyMedium as object), color: colors.textPrimary, marginBottom: 4 },
  gridSub:      { ...(typography.caption as object), color: colors.textSecondary, lineHeight: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40, paddingHorizontal: spacing.md,
    maxHeight: '70%',
    ...shadows.lg,
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: colors.border,
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalIcon:   { fontSize: 32 },
  modalTitle:  { ...(typography.h3 as object), color: colors.textPrimary },
  modalSub:    { ...(typography.caption as object), color: colors.textSecondary },

  subRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  subIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  subIcon:     { fontSize: 20 },
  subLabel:    { flex: 1, ...(typography.bodyMedium as object), color: colors.textPrimary },
  logoutLabel: { color: colors.error },
  subChevron:  { fontSize: 20, color: colors.textDisabled },
})
