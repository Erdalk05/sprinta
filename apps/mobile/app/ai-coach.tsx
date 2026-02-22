import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Keyboard,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import { createAICoachService, type AICoachMode, type AIChatMessage } from '@sprinta/api'
import { useAppTheme } from '../src/theme/useAppTheme'
import type { AppTheme } from '../src/theme'
import { useAuthStore } from '../src/stores/authStore'

const supabase   = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
const aiService  = createAICoachService(supabase)

// ─── Mesaj tipi ──────────────────────────────────────────────────
interface Message {
  id:      string
  role:    'ai' | 'user'
  text:    string
  time:    string
  mode?:   AICoachMode
}

type Styles = ReturnType<typeof ms>

// ─── Hızlı sorular ───────────────────────────────────────────────
const QUICK_QUESTIONS = [
  'Bugün hangi egzersizi yapmalıyım?',
  'ARP\'imi nasıl artırabilirim?',
  'Hız okuma teknikleri neler?',
  'Dikkatim dağılıyor, ne yapmalıyım?',
  'Sınava kaç gün var, plan yap',
]

const MODE_TABS: { key: AICoachMode; label: string; icon: string }[] = [
  { key: 'morning_briefing', label: 'Sabah Brifingi',   icon: '☀️' },
  { key: 'chat',             label: 'Serbest Sohbet',   icon: '💬' },
  { key: 'analyze_weakness', label: 'Zayıflık Analizi', icon: '🔍' },
  { key: 'generate_content', label: 'Alıştırma Metni',  icon: '📝' },
]

const now = () =>
  new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

const uid = () => Math.random().toString(36).slice(2, 9)

export default function AICoachScreen() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const router  = useRouter()
  const params  = useLocalSearchParams<{ mode?: AICoachMode }>()
  const { student } = useAuthStore()

  const [mode, setMode]         = useState<AICoachMode>(params.mode ?? 'morning_briefing')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const scrollRef               = useRef<ScrollView>(null)

  // History sadece chat modunda sakla
  const historyRef = useRef<AIChatMessage[]>([])

  const addMessage = useCallback((role: 'ai' | 'user', text: string, msgMode?: AICoachMode) => {
    const msg: Message = { id: uid(), role, text, time: now(), mode: msgMode }
    setMessages((prev) => [...prev, msg])
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    return msg
  }, [])

  // İlk yüklemede seçili moda göre otomatik mesaj gönder
  const runMode = useCallback(async (selectedMode: AICoachMode) => {
    if (!student) return
    if (selectedMode === 'chat') {
      setMessages([])
      historyRef.current = []
      addMessage('ai', `Merhaba ${student.fullName?.split(' ')[0] ?? 'öğrenci'}! 👋 Seninle çalışmaya hazırım. Ne öğrenmek veya sormak istersin?`)
      return
    }
    setLoading(true)
    setMessages([])
    historyRef.current = []
    try {
      let res
      if (selectedMode === 'morning_briefing') res = await aiService.getMorningBriefing(student.id)
      else if (selectedMode === 'analyze_weakness') res = await aiService.analyzeWeakness(student.id)
      else res = await aiService.generateContent(student.id)

      if (res.success) addMessage('ai', res.reply, selectedMode)
      else addMessage('ai', 'Üzgünüm, şu an cevap veremiyorum. Lütfen tekrar dene.')
    } finally {
      setLoading(false)
    }
  }, [student, addMessage])

  useEffect(() => { runMode(mode) }, [mode])

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || !student) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setInput('')
    Keyboard.dismiss()
    addMessage('user', msg)

    // History güncelle
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: msg },
    ]

    setLoading(true)
    try {
      const res = await aiService.chat(student.id, msg, historyRef.current.slice(-10))
      if (res.success) {
        addMessage('ai', res.reply, 'chat')
        historyRef.current = [
          ...historyRef.current,
          { role: 'assistant', content: res.reply },
        ]
      } else {
        addMessage('ai', 'Hata oluştu. Tekrar dene.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = (newMode: AICoachMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setMode(newMode)
  }

  return (
    <SafeAreaView style={s.root}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.coachAvatar}>
            <Text style={s.coachEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>AI Koç</Text>
            <Text style={s.headerSub}>Claude Sonnet · Kişisel Öğretmen</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Mod Seçici ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.modeScroll}
      >
        {MODE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.modeBtn, mode === tab.key && s.modeBtnActive]}
            onPress={() => handleModeChange(tab.key)}
          >
            <Text style={s.modeIcon}>{tab.icon}</Text>
            <Text style={[s.modeTxt, mode === tab.key && s.modeTxtActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Mesajlar ── */}
        <ScrollView
          ref={scrollRef}
          style={s.chat}
          contentContainerStyle={s.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarih etiketi */}
          <View style={s.dateBadge}>
            <Text style={s.dateTxt}>
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
            </Text>
          </View>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} t={t} s={s} />
          ))}

          {loading && (
            <View style={s.typingRow}>
              <View style={s.coachAvatar}>
                <Text style={s.coachEmoji}>🤖</Text>
              </View>
              <View style={s.typingBubble}>
                <ActivityIndicator size="small" color={t.colors.primary} />
                <Text style={s.typingTxt}>Düşünüyor...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Hızlı sorular (sadece chat modunda) ── */}
        {mode === 'chat' && messages.length < 3 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.quickScroll}
          >
            {QUICK_QUESTIONS.map((q) => (
              <TouchableOpacity
                key={q}
                style={s.quickChip}
                onPress={() => handleSend(q)}
              >
                <Text style={s.quickTxt}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Input ── */}
        {mode === 'chat' ? (
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Bir şey sor..."
              placeholderTextColor={t.colors.textHint}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              <Text style={s.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={s.refreshBtn}
            onPress={() => runMode(mode)}
            disabled={loading}
          >
            <Text style={s.refreshTxt}>
              {loading ? '⏳ Yükleniyor...' : '🔄 Yenile'}
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Mesaj Balonu ────────────────────────────────────────────────
function MessageBubble({ msg, t, s }: { msg: Message; t: AppTheme; s: Styles }) {
  const isAI = msg.role === 'ai'
  return (
    <View style={[s.msgRow, isAI ? s.msgRowLeft : s.msgRowRight]}>
      {isAI && (
        <View style={[s.coachAvatar, { marginRight: 8, marginBottom: 4, alignSelf: 'flex-end' }]}>
          <Text style={s.coachEmoji}>🤖</Text>
        </View>
      )}
      <View style={[s.bubble, isAI ? s.bubbleAI : s.bubbleUser]}>
        <Text style={[s.bubbleTxt, isAI ? s.bubbleTxtAI : s.bubbleTxtUser]}>
          {msg.text}
        </Text>
        <Text style={s.bubbleTime}>{msg.time}</Text>
        {isAI && <View style={s.tailLeft} />}
        {!isAI && <View style={s.tailRight} />}
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root:  { flex: 1, backgroundColor: t.colors.background },

    // Header
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: t.colors.divider,
      backgroundColor: t.colors.panel,
    },
    backBtn:      { width: 40, alignItems: 'center', justifyContent: 'center' },
    backTxt:      { fontSize: 24, color: '#FFFFFF' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    coachAvatar:  {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: t.colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    coachEmoji:   { fontSize: 18 },
    headerTitle:  { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
    headerSub:    { fontSize: 10, color: 'rgba(255,255,255,0.7)' },

    // Mode tabs
    modeScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    modeBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: t.colors.surface,
      borderWidth: 1, borderColor: t.colors.border,
    },
    modeBtnActive: { backgroundColor: t.colors.primary + '25', borderColor: t.colors.primary },
    modeIcon:     { fontSize: 14 },
    modeTxt:      { fontSize: 12, fontWeight: '600', color: t.colors.textHint },
    modeTxtActive:{ color: t.colors.primaryLight },

    // Chat
    chat:        { flex: 1 },
    chatContent: { paddingVertical: 12, paddingHorizontal: 4, paddingBottom: 20 },
    dateBadge:   { alignItems: 'center', marginBottom: 12 },
    dateTxt:     {
      fontSize: 11, color: t.colors.textHint,
      backgroundColor: t.colors.surface,
      paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
    },

    // Bubbles
    msgRow:     { flexDirection: 'row', marginVertical: 3, paddingHorizontal: 12 },
    msgRowLeft: { justifyContent: 'flex-start', alignItems: 'flex-end' },
    msgRowRight:{ justifyContent: 'flex-end' },
    bubble: {
      maxWidth: '80%', borderRadius: 18,
      paddingHorizontal: 14, paddingVertical: 10,
      position: 'relative',
    },
    bubbleAI:   {
      backgroundColor: t.colors.bubbleIn,
      borderBottomLeftRadius: 4,
      borderWidth: 1, borderColor: t.colors.border,
    },
    bubbleUser: { backgroundColor: t.colors.bubbleOut, borderBottomRightRadius: 4 },
    bubbleTxt:  { fontSize: 14, lineHeight: 20 },
    bubbleTxtAI:  { color: t.colors.text },
    bubbleTxtUser:{ color: t.isDark ? '#E9F6EE' : t.colors.text },
    bubbleTime: { fontSize: 10, color: t.colors.textHint, alignSelf: 'flex-end', marginTop: 4 },
    tailLeft: {
      position: 'absolute', bottom: 0, left: -6,
      borderTopWidth: 8, borderTopColor: 'transparent',
      borderRightWidth: 8, borderRightColor: t.colors.bubbleIn,
    },
    tailRight: {
      position: 'absolute', bottom: 0, right: -6,
      borderTopWidth: 8, borderTopColor: 'transparent',
      borderLeftWidth: 8, borderLeftColor: t.colors.bubbleOut,
    },

    // Typing
    typingRow:    { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, marginTop: 4 },
    typingBubble: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: t.colors.bubbleIn,
      borderRadius: 18, borderBottomLeftRadius: 4,
      paddingHorizontal: 14, paddingVertical: 10,
      borderWidth: 1, borderColor: t.colors.border,
      marginLeft: 8,
    },
    typingTxt: { fontSize: 13, color: t.colors.textHint },

    // Quick chips
    quickScroll: { paddingHorizontal: 12, paddingBottom: 8, paddingTop: 4, gap: 8 },
    quickChip:   {
      backgroundColor: t.colors.surface,
      borderRadius: 999,
      paddingHorizontal: 12, paddingVertical: 8,
      borderWidth: 1, borderColor: t.colors.border,
    },
    quickTxt: { fontSize: 12, color: t.colors.accent, fontWeight: '600' },

    // Input
    inputRow: {
      flexDirection: 'row', alignItems: 'flex-end', gap: 8,
      paddingHorizontal: 12, paddingVertical: 10,
      borderTopWidth: 1, borderTopColor: t.colors.divider,
      backgroundColor: t.colors.panel,
    },
    input: {
      flex: 1, minHeight: 40, maxHeight: 100,
      backgroundColor: t.colors.surface,
      borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
      fontSize: 14, color: t.colors.text,
      borderWidth: 1, borderColor: t.colors.border,
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: t.colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.4 },
    sendIcon: { fontSize: 18, color: '#fff' },

    // Refresh
    refreshBtn: {
      margin: 16, padding: 14,
      backgroundColor: t.colors.surface,
      borderRadius: 999,
      alignItems: 'center',
      borderWidth: 1, borderColor: t.colors.border,
    },
    refreshTxt: { fontSize: 14, fontWeight: '700', color: t.colors.accent },
  })
}
