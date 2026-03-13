/**
 * QuickStartCard — Ana Sayfa okuma kısayolu
 * İçerik Seç ekranının 4 sekmesini direkt kısayol olarak gösterir.
 * Kütüphane / Metin / Dosya / Son
 */
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

const BLUE = '#1877F2'
const BORDER = '#E3E8F0'
const BG = '#FFFFFF'
const LABEL_COLOR = '#1A1A2E'
const SUB_COLOR = '#64748B'

type Tab = 'library' | 'paste' | 'dosya' | 'recent'

const SHORTCUTS: { tab: Tab; icon: string; label: string }[] = [
  { tab: 'library', icon: '📚', label: 'Kütüphane' },
  { tab: 'paste',   icon: '✏️',  label: 'Metin'     },
  { tab: 'dosya',   icon: '📄',  label: 'Dosya'     },
  { tab: 'recent',  icon: '🕐',  label: 'Son'       },
]

export function QuickStartCard() {
  const router = useRouter()

  const go = (tab: Tab) => {
    router.push((`/exercise/quick-start?tab=${tab}`) as any)
  }

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>İçerik Seç</Text>
        <Text style={s.sub}>Hızlı okuma başlat</Text>
      </View>
      <View style={s.row}>
        {SHORTCUTS.map((item) => (
          <TouchableOpacity
            key={item.tab}
            style={s.btn}
            onPress={() => go(item.tab)}
            activeOpacity={0.75}
          >
            <Text style={s.icon}>{item.icon}</Text>
            <Text style={s.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: LABEL_COLOR,
  },
  sub: {
    fontSize: 12,
    color: SUB_COLOR,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  icon: {
    fontSize: 26,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: BLUE,
  },
})
