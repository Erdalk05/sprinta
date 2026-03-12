import React, { useState, useRef, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, TextInput, Animated, Alert, Dimensions, Pressable,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme, useThemeToggle } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/authStore'

// ─── Level adları (basit eşleme) ─────────────────────────────────
const LEVEL_NAMES: Record<number, string> = {
  1: 'Başlangıç', 2: 'Çaylak', 3: 'Öğrenci', 4: 'Pratisyen',
  5: 'Uzman', 6: 'Üstad', 7: 'Şampiyon', 8: 'Titan', 9: 'Efsane', 10: 'Tanrı',
}

const { width: W } = Dimensions.get('window')

// ─── Kategori tanımları ───────────────────────────────────────────
interface SubItem { id: string; icon: string; label: string; route?: string }
interface Category {
  id: string; icon: string; label: string; sub: string
  gradient: readonly [string, string, ...string[]]
  items: SubItem[]
}

// Kategoriler temadan türetilir — renk şeması değişince anında güncellenir
function buildCategories(t: ReturnType<typeof import('../../src/theme').buildTheme>): Category[] {
  return [
    {
      id: 'profil', icon: '👤', label: 'Profil', sub: 'Hesap, istatistikler',
      gradient: t.gradients.ayarlar as [string, string],
      items: [
        { id: 'myprofile', icon: '👤', label: 'Profilim',        route: '/(tabs)/profile' },
        { id: 'stats2',    icon: '📊', label: 'İstatistiklerim', route: '/(tabs)/progress' },
        { id: 'streak2',   icon: '🔥', label: 'Seri Takibi',     route: '/(tabs)/progress' },
      ],
    },
    {
      id: 'aicoach', icon: '🤖', label: 'AI Koç', sub: 'Sabah brifingi, sohbet',
      gradient: t.gradients.aiKoc as [string, string],
      items: [
        { id: 'briefing', icon: '☀️', label: 'Sabah Brifingi',      route: '/(tabs)/coach' },
        { id: 'chat',     icon: '💬', label: 'Serbest Sohbet',       route: '/(tabs)/coach' },
        { id: 'weakness', icon: '🔍', label: 'Zayıflık Analizi',     route: '/(tabs)/coach' },
        { id: 'content',  icon: '📝', label: 'Alıştırma Metni Üret', route: '/(tabs)/coach' },
      ],
    },
    {
      id: 'calis', icon: '💪', label: 'Çalış', sub: 'Tanılama, RSVP, Göz egzersizleri',
      gradient: t.gradients.antrenmanlar as [string, string],
      items: [
        { id: 'tanilama', icon: '🧪', label: 'Tanılama Testi',    route: '/tanilama'                    },
        { id: 'rsvp',     icon: '⚡', label: 'RSVP Okuma',        route: '/exercise/chunk-rsvp'         },
        { id: 'flow',     icon: '🌊', label: 'Akış Okuma',        route: '/exercise/flow-reading'       },
        { id: 'goz',      icon: '👁️', label: 'Kartal Gözü',        route: '/visual-mechanics'            },
        { id: 'vocab',    icon: '📖', label: 'Kelime Haznesi',     route: '/exercise/vocabulary'         },
      ],
    },
    {
      id: 'istatistik', icon: '📊', label: 'İstatistikler', sub: 'ARP trendi, haftalık rapor',
      gradient: t.gradients.istatistik as [string, string],
      items: [
        { id: 'arp',    icon: '📈', label: 'ARP Gelişimim',  route: '/(tabs)/progress' },
        { id: 'weekly', icon: '📅', label: 'Haftalık Rapor', route: '/(tabs)/progress' },
        { id: 'skills', icon: '🎯', label: 'Beceri Profili', route: '/(tabs)/progress' },
      ],
    },
    {
      id: 'ilerleme', icon: '📈', label: 'İlerleme', sub: 'Seviye, XP, sıralama',
      gradient: t.gradients.basarilar as [string, string],
      items: [
        { id: 'level',  icon: '⭐', label: 'Seviye Durumu',     route: '/(tabs)/progress' },
        { id: 'xp',     icon: '💎', label: 'XP Durumu',         route: '/(tabs)/progress' },
        { id: 'rank',   icon: '🏆', label: 'Sıralamam',         route: '/(tabs)/social'   },
      ],
    },
    {
      id: 'social', icon: '👥', label: 'Sosyal', sub: 'Liderlik, meydan okuma',
      gradient: t.gradients.social as [string, string],
      items: [
        { id: 'lb',      icon: '🏆', label: 'Liderlik Tablosu', route: '/(tabs)/social' },
        { id: 'chal',    icon: '⚔️', label: 'Meydan Okumalar',  route: '/(tabs)/social' },
        { id: 'friends', icon: '👥', label: 'Arkadaşlarım',     route: '/(tabs)/social' },
      ],
    },
    {
      id: 'library', icon: '📚', label: 'Kütüphane', sub: 'PDF, URL, içeriklerim',
      gradient: t.gradients.library as [string, string],
      items: [
        { id: 'mylib',  icon: '📂', label: 'Kütüphanem',        route: '/content-library' },
        { id: 'addpdf', icon: '📄', label: 'PDF Ekle',           route: '/content-library' },
        { id: 'addurl', icon: '🔗', label: "URL'den İçe Aktar",  route: '/content-library' },
      ],
    },
    {
      id: 'basarilar', icon: '🏆', label: 'Başarılar', sub: 'Rozetler, sıralama, XP',
      gradient: t.gradients.basarilar as [string, string],
      items: [
        { id: 'badges', icon: '🏅', label: 'Rozetlerim',    route: '/(tabs)/progress' },
        { id: 'level2', icon: '⭐', label: 'Seviye Durumu', route: '/(tabs)/progress' },
        { id: 'streak', icon: '🔥', label: 'Seri Takibi',   route: '/(tabs)/progress' },
      ],
    },
    {
      id: 'tercihler', icon: '⚙️', label: 'Tercihler', sub: 'Bildirim, gizlilik, çıkış',
      gradient: t.gradients.ayarlar as [string, string],
      items: [
        { id: 'notif',   icon: '🔔', label: 'Bildirimler',     route: '/(tabs)/profile' },
        { id: 'privacy', icon: '🔒', label: 'Gizlilik',        route: '/(tabs)/profile' },
        { id: 'help',    icon: '❓', label: 'Yardım & Destek', route: '/(tabs)/profile' },
        { id: 'logout',  icon: '⏻',  label: 'Çıkış Yap',      route: '__logout__'      },
      ],
    },
  ]
}

// ─── WhatsApp Flat Grid Card ──────────────────────────────────────
const WA_GREEN = '#1877F2'   // Facebook primary blue

const ISB_BLUE = '#1877F2'   // Facebook / İş Bankası mavi

function GridCard({ cat, t, onPress, cardW }: {
  cat: Category; t: import('../../src/theme').AppTheme
  onPress: () => void; cardW: number
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        gCard.card,
        {
          width:           cardW,
          marginBottom:    10,
          backgroundColor: pressed ? ISB_BLUE + '10' : t.colors.surface,
          borderColor:     pressed ? ISB_BLUE + '60' : t.colors.border,
          transform:       [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      {/* Mavi ikon kutusu */}
      <View style={[gCard.iconBox, { backgroundColor: ISB_BLUE + '12' }]}>
        <Text style={gCard.icon}>{cat.icon}</Text>
      </View>
      <Text style={[gCard.label, { color: t.colors.text }]}>{cat.label}</Text>
      <Text style={[gCard.sub, { color: t.colors.textSub }]} numberOfLines={2}>{cat.sub}</Text>
      {/* Sağ alt: mavi ok */}
      <Text style={[gCard.arrow, { color: ISB_BLUE }]}>›</Text>
    </Pressable>
  )
}

const gCard = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    minHeight: 118,
    position: 'relative',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  icon:  { fontSize: 22 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  sub:   { fontSize: 11, lineHeight: 15 },
  arrow: { position: 'absolute', bottom: 10, right: 12, fontSize: 20, fontWeight: '300' },
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

  const name       = student?.fullName?.split(' ')[0] ?? 'Öğrenci'
  const currentArp = student?.currentArp ?? 0
  const totalXp    = student?.totalXp ?? 0
  const level      = student?.level ?? 1
  const streak     = student?.streakDays ?? 0
  const levelName  = LEVEL_NAMES[level] ?? 'Titan'
  const examTarget = student?.examTarget?.toUpperCase() ?? 'TYT'

  // 2 sütun — eşit boşluklu
  const GAP    = 10
  const HPAD   = 16
  const cardW  = (W - HPAD * 2 - GAP) / 2

  const CATEGORIES = useMemo(() => buildCategories(t), [t])

  const filteredCats = search.trim()
    ? CATEGORIES.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.items.some((i) => i.label.toLowerCase().includes(search.toLowerCase()))
      )
    : CATEGORIES

  const openCategory = (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // Çalış kategorisi doğrudan sessions tab'ına yönlendir
    if (cat.id === 'calis') {
      router.push('/(tabs)/sessions' as any)
      return
    }
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

      {/* ── HEADER — WhatsApp solid yeşil ── */}
      <View style={s.header}>
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
      </View>

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

        {/* ── Sprinta Üssü — Öğrenci özeti kartı ── */}
        {!search.trim() && (
          <View style={s.profileCard}>
            {/* Sol: ARP büyük gösterim */}
            <View style={s.arpBlock}>
              <Text style={s.arpLabel}>ARP</Text>
              <Text style={s.arpValue}>{currentArp}</Text>
              <Text style={s.examTarget}>{examTarget} hedefi</Text>
            </View>

            {/* Sağ: Stat chip'leri */}
            <View style={s.statsCol}>
              <View style={s.statChip}>
                <Text style={s.statEmoji}>⭐</Text>
                <View>
                  <Text style={[s.statVal, { color: t.colors.primary }]}>{levelName}</Text>
                  <Text style={s.statKey}>Sv. {level}</Text>
                </View>
              </View>
              <View style={s.statChip}>
                <Text style={s.statEmoji}>🔥</Text>
                <View>
                  <Text style={[s.statVal, { color: '#F97316' }]}>{streak} gün</Text>
                  <Text style={s.statKey}>Seri</Text>
                </View>
              </View>
              <View style={s.statChip}>
                <Text style={s.statEmoji}>💎</Text>
                <View>
                  <Text style={[s.statVal, { color: '#8B5CF6' }]}>{totalXp.toLocaleString('tr')}</Text>
                  <Text style={s.statKey}>XP</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── 2×N Gradient Grid ── */}
        {rows.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map((cat) => (
              <GridCard key={cat.id} cat={cat} t={t} cardW={cardW} onPress={() => openCategory(cat)} />
            ))}
            {row.length === 1 && <View style={{ width: cardW }} />}
          </View>
        ))}

        <View style={{ height: 24 }} />
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
            {/* Modal başlık — WhatsApp yeşil */}
            <View style={s.modalHeader}>
              <Text style={s.modalIcon}>{activeCategory.icon}</Text>
              <View>
                <Text style={s.modalTitle}>{activeCategory.label}</Text>
                <Text style={s.modalSub}>{activeCategory.sub}</Text>
              </View>
            </View>
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

    // Header — WhatsApp solid yeşil
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: t.colors.headerBg,
      paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
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

    divider: {
      height: 1, backgroundColor: t.colors.divider,
      marginHorizontal: 16, marginTop: 8,
    },

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

    // Sprinta Üssü — Öğrenci özeti kartı
    profileCard: {
      flexDirection:    'row',
      alignItems:       'center',
      backgroundColor:  t.colors.surface,
      borderRadius:     18,
      padding:          16,
      marginBottom:     16,
      borderWidth:      1,
      borderColor:      t.colors.border,
      gap:              16,
      ...t.shadows.sm,
    },
    arpBlock: {
      flex:        1,
      alignItems:  'flex-start',
    },
    arpLabel: {
      fontSize:   11,
      fontWeight: '700',
      color:      t.colors.textHint,
      letterSpacing: 1.5,
    },
    arpValue: {
      fontSize:   42,
      fontWeight: '900',
      color:      t.colors.primary,
      lineHeight: 50,
    },
    examTarget: {
      fontSize:  11,
      color:     t.colors.textHint,
      marginTop: 2,
    },
    statsCol: {
      gap:        8,
    },
    statChip: {
      flexDirection:  'row',
      alignItems:     'center',
      gap:            8,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      borderRadius:   10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    statEmoji: { fontSize: 16 },
    statVal:   { fontSize: 13, fontWeight: '800' },
    statKey:   { fontSize: 10, color: t.colors.textHint },

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
      borderRadius: 14, padding: 14,
      backgroundColor: t.colors.headerBg,
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
