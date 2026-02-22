import React, { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, TextInput, Dimensions,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import { useThemeToggle } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/authStore'

const { width: W } = Dimensions.get('window')

// ─── Kategori & Alt-Item Tanımları ────────────────────────────────
interface SubItem {
  id:    string
  icon:  string
  label: string
  route?: string
  action?: () => void
}

interface Category {
  id:    string
  icon:  string
  label: string
  sub:   string
  items: SubItem[]
}

const CATEGORIES: Category[] = [
  {
    id: 'aicoach', icon: '🤖', label: 'AI Koç', sub: 'Sabah brifingi, analiz, alıştırma, ...',
    items: [
      { id: 'briefing',   icon: '☀️', label: 'Sabah Brifingi',     route: '/ai-coach' },
      { id: 'chat',       icon: '💬', label: 'Serbest Sohbet',      route: '/ai-coach' },
      { id: 'weakness',   icon: '🔍', label: 'Zayıflık Analizi',    route: '/ai-coach' },
      { id: 'content',    icon: '📝', label: 'Alıştırma Metni Üret', route: '/ai-coach' },
    ],
  },
  {
    id: 'training', icon: '📚', label: 'Antrenmanlar', sub: 'Hız, kavrama, dikkat, ...',
    items: [
      { id: 'speed', icon: '⚡', label: 'Hız Antrenmanı',   route: '/exercise/speed_control'     },
      { id: 'comp',  icon: '🧠', label: 'Derin Kavrama',    route: '/exercise/deep_comprehension' },
      { id: 'attn',  icon: '🎯', label: 'Dikkat Gücü',      route: '/exercise/attention_power'    },
      { id: 'reset', icon: '🌿', label: 'Zihinsel Sıfırlama',route: '/exercise/mental_reset'       },
      { id: 'diag',  icon: '🧪', label: 'Tanılama Testi',   route: '/diagnostic'                  },
      { id: 'tasks', icon: '📅', label: 'Günlük Görevler',  route: '/(tabs)/sessions'             },
    ],
  },
  {
    id: 'programs', icon: '🎯', label: 'Programlar', sub: 'LGS, TYT, AYT, ...',
    items: [
      { id: 'select',    icon: '➕', label: 'Program Seç',    route: '/program/select'     },
      { id: 'active',    icon: '▶️', label: 'Aktif Program',  route: '/(tabs)/sessions'    },
      { id: 'lgs',       icon: '📘', label: 'LGS Programı',  route: '/program/select'      },
      { id: 'tyt',       icon: '📗', label: 'TYT Programı',  route: '/program/select'      },
      { id: 'ayt',       icon: '📙', label: 'AYT Programı',  route: '/program/select'      },
      { id: 'yds',       icon: '🌍', label: 'YDS/KPSS/ALES', route: '/program/select'      },
    ],
  },
  {
    id: 'stats', icon: '📊', label: 'İstatistikler', sub: 'ARP gelişimi, haftalık rapor, ...',
    items: [
      { id: 'arp',    icon: '📈', label: 'ARP Gelişimim',  route: '/(tabs)/progress'  },
      { id: 'weekly', icon: '📅', label: 'Haftalık Rapor', route: '/(tabs)/progress'  },
      { id: 'skills', icon: '🎯', label: 'Beceri Profili', route: '/(tabs)/progress'  },
      { id: 'diag2',  icon: '🧪', label: 'Tanılama Geçmişi',route: '/(tabs)/progress' },
    ],
  },
  {
    id: 'achievements', icon: '🏅', label: 'Başarılar', sub: 'Rozetler, seviye, XP, ...',
    items: [
      { id: 'badges',  icon: '🏅', label: 'Rozetlerim',   route: '/(tabs)/progress'  },
      { id: 'level',   icon: '⭐', label: 'Seviye Durumu', route: '/(tabs)/progress'  },
      { id: 'xphist',  icon: '📊', label: 'XP Geçmişi',   route: '/(tabs)/progress'  },
      { id: 'streak2', icon: '🔥', label: 'Seri Takibi',  route: '/(tabs)/progress'  },
    ],
  },
  {
    id: 'social', icon: '🏆', label: 'Sosyal', sub: 'Sıralama, meydan okuma, ...',
    items: [
      { id: 'lb',      icon: '🏆', label: 'Liderlik Tablosu', route: '/(tabs)/social'   },
      { id: 'chal',    icon: '⚔️', label: 'Meydan Okumalar',  route: '/(tabs)/social'   },
      { id: 'friends', icon: '👥', label: 'Arkadaşlarım',      route: '/(tabs)/social'   },
    ],
  },
  {
    id: 'settings', icon: '⚙️', label: 'Ayarlar', sub: 'Profil, bildirim, çıkış, ...',
    items: [
      { id: 'profile', icon: '👤', label: 'Profilim',        route: '/(tabs)/profile'   },
      { id: 'target',  icon: '🎓', label: 'Sınav Hedefi',    route: '/(tabs)/profile'   },
      { id: 'notif',   icon: '🔔', label: 'Bildirimler',     route: '/(tabs)/profile'   },
      { id: 'privacy', icon: '🔒', label: 'Gizlilik',        route: '/(tabs)/profile'   },
      { id: 'help',    icon: '❓', label: 'Yardım & Destek', route: '/(tabs)/profile'   },
      { id: 'logout',  icon: '⏻',  label: 'Çıkış Yap',      route: '__logout__'        },
    ],
  },
]

type ViewMode = 'grid' | 'list'
type Styles = ReturnType<typeof ms>

const CARD_W = (W - 48) / 2  // 2 sütun, 16 padding + 16 gap
const SUB_W  = (W - 64) / 3  // 3 sütun sub-grid

export default function MenuScreen() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const { isDark, toggleTheme } = useThemeToggle()
  const router  = useRouter()
  const { student, logout } = useAuthStore()
  const [search, setSearch]         = useState('')
  const [viewMode, setViewMode]     = useState<ViewMode>('grid')
  const [activeCategory, setActive] = useState<Category | null>(null)

  const name = student?.fullName?.split(' ')[0] ?? 'Öğrenci'

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
    if (item.route) {
      setTimeout(() => router.push(item.route as any), 100)
    }
  }

  const filtered = search.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) =>
          i.label.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : CATEGORIES

  return (
    <SafeAreaView style={s.root}>
      {/* ── Header (Menu + Manager/Bildirim/Tema/Çıkış) ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Menü</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn} onPress={() => router.push('/(tabs)/profile')}>
            <View style={s.managerAvatar}>
              <Text style={s.managerAvatarTxt}>{name.charAt(0)}</Text>
            </View>
            <Text style={s.headerBtnLbl}>Koç</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={toggleTheme}>
            <Text style={s.headerBtnIcon}>{isDark ? '☀️' : '🌙'}</Text>
            <Text style={s.headerBtnLbl}>{isDark ? 'Gündüz' : 'Gece'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <Text style={s.headerBtnIcon}>🔔</Text>
            <Text style={s.headerBtnLbl}>Bildirim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.headerBtn}
            onPress={() => {
              Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Çıkış', style: 'destructive', onPress: () => logout() },
              ])
            }}
          >
            <Text style={s.headerBtnIcon}>⏻</Text>
            <Text style={s.headerBtnLbl}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Arama + View toggle ── */}
      <View style={s.searchRow}>
        <View style={s.searchInput}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchTxt}
            placeholder="Ne yapmak istersin?"
            placeholderTextColor={t.colors.textHint}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[s.viewBtn, viewMode === 'grid' && s.viewBtnActive]}
          onPress={() => setViewMode('grid')}
        >
          <Text style={s.viewBtnTxt}>▦</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.viewBtn, viewMode === 'list' && s.viewBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={s.viewBtnTxt}>≡</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {viewMode === 'grid' ? (
          /* ── Grid Görünüm (2 sütun) ── */
          <View style={s.grid}>
            {filtered.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={s.gridCard}
                onPress={() => openCategory(cat)}
                activeOpacity={0.75}
              >
                <View style={s.gridCardTop}>
                  <Text style={s.gridCardLabel}>{cat.label}</Text>
                  <Text style={s.gridCardIcon}>{cat.icon}</Text>
                </View>
                <Text style={s.gridCardSub}>{cat.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* ── Liste Görünüm (accordion) ── */
          <View style={s.listWrap}>
            {filtered.map((cat) => (
              <ListCategory
                key={cat.id}
                cat={cat}
                onSelect={handleSubItem}
                s={s}
              />
            ))}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Alt Menü Modal (CGD sub-menu tarzı) ── */}
      <Modal
        visible={!!activeCategory}
        animationType="slide"
        transparent
        onRequestClose={() => setActive(null)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setActive(null)}
        >
          <View style={s.modalSheet} onStartShouldSetResponder={() => true}>
            {/* Modal başlığı */}
            <View style={s.modalHeader}>
              <Text style={s.modalIcon}>{activeCategory?.icon}</Text>
              <Text style={s.modalTitle}>{activeCategory?.label}</Text>
            </View>
            <View style={s.modalDivider} />

            {/* 3 sütun grid */}
            <View style={s.subGrid}>
              {(activeCategory?.items ?? []).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={s.subItem}
                  onPress={() => handleSubItem(item)}
                  activeOpacity={0.7}
                >
                  <View style={s.subItemBox}>
                    <Text style={s.subItemIcon}>{item.icon}</Text>
                  </View>
                  <Text style={s.subItemLabel} numberOfLines={2}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Kapat butonu */}
            <TouchableOpacity
              style={s.closeBtn}
              onPress={() => setActive(null)}
            >
              <Text style={s.closeBtnTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

// ─── Liste Kategori (accordion) ──────────────────────────────────
function ListCategory({ cat, onSelect, s }: { cat: Category; onSelect: (item: SubItem) => void; s: Styles }) {
  const [open, setOpen] = useState(false)
  return (
    <View>
      <TouchableOpacity
        style={s.listRow}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          setOpen((o) => !o)
        }}
        activeOpacity={0.7}
      >
        <Text style={s.listIcon}>{cat.icon}</Text>
        <View style={s.listInfo}>
          <Text style={s.listLabel}>{cat.label}</Text>
          <Text style={s.listSub}>{cat.sub}</Text>
        </View>
        <Text style={[s.listChevron, open && s.listChevronOpen]}>›</Text>
      </TouchableOpacity>

      {open && (
        <View style={s.accordionBody}>
          {cat.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={s.accordionItem}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={s.accordionIcon}>{item.icon}</Text>
              <Text style={s.accordionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },

    // Header — WhatsApp koyu yeşil top bar
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 14,
      backgroundColor: t.colors.panel,
    },
    headerTitle: { flex: 1, fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
    headerRight: { flexDirection: 'row', gap: 16 },
    headerBtn: { alignItems: 'center' },
    managerAvatar: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    },
    managerAvatarTxt: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
    headerBtnIcon:    { fontSize: 20, marginBottom: 2 },
    headerBtnLbl:     { fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    // Search
    searchRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: t.colors.divider,
    },
    searchInput: {
      flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: t.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12, paddingVertical: 9,
      borderWidth: 1, borderColor: t.colors.border,
    },
    searchIcon:    { fontSize: 16 },
    searchTxt:     { flex: 1, fontSize: 14, color: t.colors.text },
    viewBtn: {
      width: 36, height: 36, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: t.colors.surface,
      borderWidth: 1, borderColor: t.colors.border,
    },
    viewBtnActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    viewBtnTxt:    { fontSize: 16, color: t.colors.text },

    // Grid
    grid: {
      flexDirection: 'row', flexWrap: 'wrap',
      padding: 16, gap: 12,
    },
    gridCard: {
      width: CARD_W,
      backgroundColor: t.colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1, borderColor: t.colors.border,
      minHeight: 90,
      justifyContent: 'space-between',
    },
    gridCardTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    gridCardLabel: { fontSize: 14, fontWeight: '800', color: t.colors.text, flex: 1, flexWrap: 'wrap' },
    gridCardIcon:  { fontSize: 24, marginLeft: 6 },
    gridCardSub:   { fontSize: 11, color: t.colors.textHint, marginTop: 6, lineHeight: 15 },

    // List (accordion)
    listWrap: { paddingHorizontal: 16, paddingTop: 8 },
    listRow: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: t.colors.surface,
      borderRadius: 12, padding: 14, marginBottom: 8,
      borderWidth: 1, borderColor: t.colors.border,
    },
    listIcon:        { fontSize: 28 },
    listInfo:        { flex: 1 },
    listLabel:       { fontSize: 15, fontWeight: '700', color: t.colors.text },
    listSub:         { fontSize: 11, color: t.colors.textHint, marginTop: 2 },
    listChevron:     { fontSize: 24, color: t.colors.accent, transform: [{ rotate: '0deg' }] },
    listChevronOpen: { transform: [{ rotate: '90deg' }] },

    // Accordion body
    accordionBody: {
      backgroundColor: t.colors.surface + 'CC',
      marginTop: -8, marginBottom: 8,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      borderWidth: 1, borderTopWidth: 0, borderColor: t.colors.border,
    },
    accordionItem: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      paddingHorizontal: 18, paddingVertical: 12,
      borderTopWidth: 1, borderTopColor: t.colors.divider,
    },
    accordionIcon:  { fontSize: 20 },
    accordionLabel: { fontSize: 14, color: t.colors.text, fontWeight: '500' },

    // Modal
    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingTop: 20, paddingBottom: 32,
      paddingHorizontal: 16,
    },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
    },
    modalIcon:    { fontSize: 32 },
    modalTitle:   { fontSize: 22, fontWeight: '900', color: t.colors.text },
    modalDivider: { height: 1, backgroundColor: t.colors.divider, marginBottom: 20 },

    // Sub-item grid (3 sütun)
    subGrid: {
      flexDirection: 'row', flexWrap: 'wrap', gap: 12,
      marginBottom: 24,
    },
    subItem: { width: SUB_W, alignItems: 'center' },
    subItemBox: {
      width: 64, height: 64, borderRadius: 12,
      backgroundColor: t.colors.background,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 8,
      borderWidth: 1, borderColor: t.colors.border,
    },
    subItemIcon:  { fontSize: 28 },
    subItemLabel: {
      fontSize: 11, color: t.colors.accent,
      fontWeight: '600', textAlign: 'center', lineHeight: 14,
    },

    // Close button
    closeBtn: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: t.colors.primary,
      alignItems: 'center', justifyContent: 'center',
      alignSelf: 'center',
    },
    closeBtnTxt: { fontSize: 18, fontWeight: '700', color: '#fff' },
  })
}
