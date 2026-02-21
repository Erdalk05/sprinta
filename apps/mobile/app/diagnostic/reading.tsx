import { useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors } from '../../src/constants/colors'
import { DIAGNOSTIC_CONTENT } from '../../src/data/diagnosticContent'
import { useDiagnosticStore } from '../../src/stores/diagnosticStore'

export default function DiagnosticReadingScreen() {
  const router = useRouter()
  const { startReading, finishReading } = useDiagnosticStore()

  useEffect(() => {
    startReading()
  }, [])

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const store = useDiagnosticStore.getState()
    const durationSeconds = store.readingStartTime
      ? (Date.now() - store.readingStartTime) / 1000
      : 60
    const durationMinutes = Math.max(0.1, durationSeconds / 60)
    const wpm = Math.round(DIAGNOSTIC_CONTENT.wordCount / durationMinutes)
    finishReading(Math.min(600, Math.max(50, wpm)))
    router.push('/diagnostic/comprehension')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <View style={styles.step}>
          <Text style={styles.stepText}>Adım 1 / 3</Text>
        </View>
        <Text style={styles.headerTitle}>Okuma Testi</Text>
        <Text style={styles.headerSub}>Kendi hızında oku, bitince butona bas</Text>
      </View>

      {/* Metin */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.articleTitle}>{DIAGNOSTIC_CONTENT.title}</Text>
        <Text style={styles.articleText}>{DIAGNOSTIC_CONTENT.passage}</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bitti butonu */}
      <View style={styles.footer}>
        <Text style={styles.wordCount}>{DIAGNOSTIC_CONTENT.wordCount} kelime</Text>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.85}>
          <Text style={styles.doneText}>Okumayı Bitirdim →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: 20, paddingTop: 24,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    alignItems: 'center', gap: 6,
  },
  step: {
    backgroundColor: colors.primary + '15', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  stepText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 13, color: colors.textSecondary },
  scroll: { flex: 1 },
  content: { padding: 24 },
  articleTitle: {
    fontSize: 20, fontWeight: '800', color: colors.text,
    marginBottom: 20, lineHeight: 28,
  },
  articleText: {
    fontSize: 17, lineHeight: 30, color: colors.text,
    letterSpacing: 0.1,
  },
  footer: {
    padding: 20, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: colors.border,
    gap: 12,
  },
  wordCount: { fontSize: 12, color: colors.textTertiary, textAlign: 'center' },
  doneButton: {
    backgroundColor: colors.primary, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  doneText: { fontSize: 17, fontWeight: '700', color: colors.white },
})
