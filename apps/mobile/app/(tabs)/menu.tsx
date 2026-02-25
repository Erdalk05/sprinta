import React, { useState, useRef, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, TextInput, Animated, Alert, Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme, useThemeToggle } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/authStore'

const { width: W } = Dimensions.get('window')

// ─── Kategori tanımları ───────────────────────────────────────────
interface SubItem { id: string; icon: string; label: string; route?: string }
interface Category {
  id: string; icon: string; label: string; sub: string
  gradient: readonly [string, string, ...string[]]
  items: SubItem[]
}

const CATEGORIES: Category[] = [
  {
    id: 'aicoach', icon: '🤖', label: 'AI Koç', sub: 'Sabah brifingi, analiz',
    gradient: ['#667eea', '#764ba2'],
    items: [
      { id: 'briefing', icon: '☀️', label: 'Sabah Brifingi',      route: '/ai-coach' },
      { id: 'chat',     icon: '💬', label: 'Serbest Sohbet',       route: '/ai-coach' },
      { id: 'weakness', icon: '🔍', label: 'Zayıflık Analizi',     route: '/ai-coach' },
      { id: 'content',  icon: '📝', label: 'Alıştırma Metni Üret', route: '/ai-coach' },
    ],
  },
  {
    id: 'training', icon: '💪', label: 'Antrenmanlar', sub: 'Hız, kavrama, dikkat',
    gradient: ['#f093fb', '#f5576c'],
    items: [
      { id: 'speed', icon: '⚡', label: 'Hız Antrenmanı',    route: '/exercise/speed_control'     },
      { id: 'comp',  icon: '🧠', label: 'Derin Kavrama',     route: '/exercise/deep_comprehension' },
      { id: 'attn',  icon: '🎯', label: 'Dikkat Gücü',       route: '/exercise/attention_power'    },
      { id: 'reset', icon: '🌿', label: 'Zihinsel Sıfırlama',route: '/exercise/mental_reset'       },
      { id: 'eye',   icon: '👁️', label: 'Göz Egzersizleri',  route: '/exercise/eye_training'       },
      { id: 'vocab', icon: '📖', label: 'Kelime Hazinesi',    route: '/exercise/vocabulary'         },
      { id: 'diag',  icon: '🧪', label: 'Tanılama Testi',    route: '/diagnostic'                  },
    ],
  },
  {
    id: 'programs', icon: '🎯', label: 'Programlar', sub: 'LGS, TYT, AYT, KPSS',
    gradient: ['#4facfe', '#00f2fe'],
    items: [
      { id: 'select', icon: '➕', label: 'Program Seç',   route: '/program/select'  },
      { id: 'active', icon: '▶️', label: 'Aktif Program', route: '/(tabs)/sessions' },
      { id: 'lgs',    icon: '📘', label: 'LGS Programı',  route: '/program/select'  },
      { id: 'tyt',    icon: '📗', label: 'TYT Programı',  route: '/program/select'  },
      { id: 'ayt',    icon: '📙', label: 'AYT Programı',  route: '/program/select'  },
    ],
  },
  {
    id: 'stats', icon: '📊', label: 'İstatistikler', sub: 'ARP, haftalık rapor',
    gradient: ['#43e97b', '#38f9d7'],
    items: [
      { id: 'arp',    icon: '📈', label: 'ARP Gelişimim',  route: '/(tabs)/progress' },
      { id: 'weekly', icon: '📅', label: 'Haftalık Rapor', route: '/(tabs)/progress' },
      { id: 'skills', icon: '🎯', label: 'Beceri Profili', route: '/(tabs)/progress' },
    ],
  },
  {
    id: 'achievements', icon: '🏆', label: 'Başarılar', sub: 'Rozetler, seviye, XP',
    gradient: ['#f7971e', '#ffd200'],
    items: [
      { id: 'badges', icon: '🏅', label: 'Rozetlerim',    route: '/(tabs)/progress' },
      { id: 'level',  icon: '⭐', label: 'Seviye Durumu', route: '/(tabs)/progress' },
      { id: 'streak', icon: '🔥', label: 'Seri Takibi',   route: '/(tabs)/progress' },
    ],
  },
  {
    id: 'social', icon: '👥', label: 'Sosyal', sub: 'Sıralama, meydan okuma',
    gradient: ['#11998e', '#38ef7d'],
    items: [
      { id: 'lb',      icon: '🏆', label: 'Liderlik Tablosu', route: '/(tabs)/social' },
      { id: 'chal',    icon: '⚔️', label: 'Meydan Okumalar',  route: '/(tabs)/social' },
      { id: 'friends', icon: '👥', label: 'Arkadaşlarım',     route: '/(tabs)/social' },
    ],
  },
  {
    id: 'settings', icon: '⚙️', label: 'Ayarlar', sub: 'Profil, bildirim, çıkış',
    gradient: ['#8e9eab', '#eef2f3'],
    items: [
      { id: 'profile', icon: '👤', label: 'Profilim',        route: '/(tabs)/profile' },
      { id: 'notif',   icon: '🔔', label: 'Bildirimler',     route: '/(tabs)/profile' },
      { id: 'privacy', icon: '🔒', label: 'Gizlilik',        route: '/(tabs)/profile' },
      { id: 'help',    icon: '❓', label: 'Yardım & Destek', route: '/(tabs)/profile' },
      { id: 'logout',  icon: '⏻',  label: 'Çıkış Yap',      route: '__logout__'      },
    ],
  },
]

// ─── Gradient Grid Card ───────────────────────────────────────────
function GridCard({ cat, onPress, cardW }: { cat: Category; onPress: () => void; cardW: number }) {
  const scale = useRef(new Animated.Value(1)).current
  return (
    <Animated.View style={{ transform: [{ scale }], width: cardW, marginBottom: 12 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50, bounciness: 4 }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start()
        }
        onPress={onPress}
      >
        <LinearGradient
          colors={cat.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[gCard.card, { minHeight: 110 }]}
        >
          <View style={gCard.iconBox}>
            <Text style={gCard.icon}>{cat.icon}</Text>
          </View>
          <Text style={gCard.label}>{cat.label}</Text>
          <Text style={gCard.sub} numberOfLines={2}>{cat.sub}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

const gCard = StyleSheet.create({
  card:    { borderRadius: 20, padding: 16, overflow: 'hidden' },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  icon:  { fontSize: 24 },
  label: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  sub:   { fontSize: 11, color: 'rgba(255,255,255,0.82)', lineHeight: 15 },
})

// ─── Ana Ekran ────────────────────────────────────────────────────
export default function MenuScreen() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const { isDark, toggleTheme } = useThemeToggle()
  const router  = useRouter()
  const { student, logout } = useAuthStore()
  const [search, setSearch]         = useState('')
  const [activeCategory, setActive] = useState<Category | null>(null)

  const name = student?.fullName?.split(' ')[0] ?? 'Öğrenci'

  // 2 sütun — eşit boşluklu
  const GAP    = 10
  const HPAD   = 16
  const cardW  = (W - HPAD * 2 - GAP) / 2

  const filteredCats = search.trim()
    ? CATEGORIES.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.items.some((i) => i.label.toLowerCase().includes(search.toLowerCase()))
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

  // 2 sütunlu satır oluştur
  const rows: Category[][] = []
  for (let i = 0; i < filteredCats.length; i += 2) {
    rows.push(filteredCats.slice(i, i + 2))
  }

  return (
    <SafeAreaView style={s.root}>

      {/* ── HEADER ── */}
      <LinearGradient
        colors={t.gradients.aiKoc as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View>
          <Text style={s.headerTitle}>Menü</Text>
          <Text style={s.headerSub}>Merhaba, {name} 👋</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.avatarCircle} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={s.avatarTxt}>{name.charAt(0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.themeBtn} onPress={toggleTheme}>
            <Text style={s.themeTxt}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Arama ── */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Ne yapmak istersin?"
            placeholderTextColor={t.colors.textHint}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 2×N Gradient Grid ── */}
        {rows.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map((cat) => (
              <GridCard key={cat.id} cat={cat} cardW={cardW} onPress={() => openCategory(cat)} />
            ))}
            {/* Tek eleman varsa boşluğu doldur */}
            {row.length === 1 && <View style={{ width: cardW }} />}
          </View>
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── ALT KATEGORİ MODAL (BottomSheet) ── */}
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
            {/* Modal başlık — mini gradient */}
            <LinearGradient
              colors={activeCategory.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.modalHeader}
            >
              <Text style={s.modalIcon}>{activeCategory.icon}</Text>
              <View>
                <Text style={s.modalTitle}>{activeCategory.label}</Text>
                <Text style={s.modalSub}>{activeCategory.sub}</Text>
              </View>
            </LinearGradient>
            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
              {activeCategory.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={s.subRow}
                  onPress={() => handleSubItem(item)}
                >
                  <View style={[s.subIconWrap, { backgroundColor: activeCategory.gradient[0] + '25' }]}>
                    <Text style={s.subIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[s.subLabel, item.route === '__logout__' && s.logoutLabel]}>
                    {item.label}
                  </Text>
                  <Text style={s.subChevron}>›</Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        )}
      </Modal>

    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },

    // Header
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.80)', marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatarCircle: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },
    themeBtn:  { padding: 6 },
    themeTxt:  { fontSize: 22 },

    // Scroll
    scroll: { paddingHorizontal: 16, paddingBottom: 40 },

    // Arama
    searchWrap: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.colors.surface,
      borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11,
      marginTop: 16, marginBottom: 16,
      borderWidth: 1, borderColor: t.colors.border,
      ...t.shadows.sm,
    },
    searchIcon:  { fontSize: 15, marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: t.colors.text },
    searchClear: { fontSize: 14, color: t.colors.textHint, paddingHorizontal: 4 },

    // Grid row
    row: { flexDirection: 'row', justifyContent: 'space-between' },

    // Modal overlay
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    modalSheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      paddingBottom: 40,
      maxHeight: '72%',
      ...t.shadows.lg,
    },
    modalHandle: {
      width: 36, height: 4, backgroundColor: t.colors.divider,
      borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16,
    },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      marginHorizontal: 16, marginBottom: 4,
      borderRadius: 16, padding: 16,
    },
    modalIcon:  { fontSize: 32 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    modalSub:   { fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 2 },

    // Sub items
    subRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: t.colors.divider,
    },
    subIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    subIcon:     { fontSize: 20 },
    subLabel:    { flex: 1, fontSize: 15, fontWeight: '600', color: t.colors.text },
    logoutLabel: { color: t.colors.error },
    subChevron:  { fontSize: 20, color: t.colors.textHint },
  })
}
