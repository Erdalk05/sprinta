import React, { useEffect, useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import { createProgramService, StudentProgram } from '@sprinta/api'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { GradientCard } from '../../src/components/ui/GradientCard'
import { ProgressRing } from '../../src/components/ui/ProgressRing'
import { useAuthStore } from '../../src/stores/authStore'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SessionsScreen() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const router  = useRouter()
  const { student } = useAuthStore()
  const [prog, setProg]     = useState<StudentProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [doneTasks, setDone]  = useState<Set<string>>(new Set())

  const MODULE_META = useMemo(() => ({
    speed_control:      { icon: '⚡', color: t.module.speed_control.color },
    deep_comprehension: { icon: '🧠', color: t.module.deep_comprehension.color },
    attention_power:    { icon: '🎯', color: t.module.attention_power.color },
    mental_reset:       { icon: '🌿', color: t.module.mental_reset.color },
  }), [t])

  useEffect(() => {
    if (!student) { setLoading(false); return }
    const svc = createProgramService(supabase)
    svc.getActiveProgram(student.id).then((p) => {
      setProg(p)
      setLoading(false)
    })
  }, [student?.id])

  const handleTask = (moduleCode: string, taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setDone((prev) => new Set([...prev, taskId]))
    router.push({ pathname: '/exercise/[moduleCode]', params: { moduleCode } })
  }

  const handleChunkRSVP = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/exercise/chunk-rsvp' as any)
  }

  const handleFlowReading = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/exercise/flow-reading' as any)
  }

  const activePhase = prog?.program.phases.find(
    (ph) => prog.currentDay >= ph.days[0] && prog.currentDay <= ph.days[1]
  ) ?? prog?.program.phases[0]

  return (
    <SafeAreaView style={s.root}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Text style={s.title}>Çalış</Text>
        <TouchableOpacity
          style={s.changeBtn}
          onPress={() => router.push('/program/select')}
        >
          <Text style={s.changeTxt}>Program Seç</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={t.colors.primary} />
          </View>
        ) : prog ? (
          <>
            {/* ── AKTİF PROGRAM KARTI ── */}
            <GradientCard
              colors={[prog.program.color + '40', t.colors.surface]}
              style={s.progCard}
            >
              <View style={s.progTop}>
                <View style={s.progLeft}>
                  <Text style={s.progIcon}>{prog.program.icon}</Text>
                  <View>
                    <Text style={s.progTitle}>{prog.program.title}</Text>
                    <Text style={s.progDay}>Gün {prog.currentDay} / {prog.program.durationDays}</Text>
                  </View>
                </View>
                <ProgressRing
                  value={prog.progressPercent}
                  size={72}
                  stroke={7}
                  color={prog.program.color}
                  label={`${Math.round(prog.progressPercent)}%`}
                  sublabel="TAMAMLANDI"
                />
              </View>

              {/* Genel ilerleme çubuğu */}
              <View style={s.bar}>
                <View style={[s.barFill, {
                  width: `${prog.progressPercent}%` as any,
                  backgroundColor: prog.program.color,
                }]} />
              </View>

              {/* Aktif Aşama */}
              {activePhase && (
                <View style={[s.phaseBadge, { backgroundColor: prog.program.color + '25' }]}>
                  <Text style={[s.phaseNum, { color: prog.program.color }]}>AŞAMA {activePhase.phase}</Text>
                  <Text style={s.phaseTitle}>{activePhase.title}</Text>
                  <Text style={s.phaseDesc}>{activePhase.description}</Text>
                </View>
              )}
            </GradientCard>

            {/* ── BUGÜNÜN GÖREVLERİ ── */}
            <Text style={s.sectionTitle}>📅 Bugünün Görevleri</Text>
            {prog.program.dailyTasks.map((task) => {
              const meta = (MODULE_META as any)[task.module] ?? { icon: '📚', color: t.colors.primary }
              const done = doneTasks.has(task.id)
              return (
                <TouchableOpacity
                  key={task.id}
                  style={[s.taskCard, done && s.taskDone]}
                  onPress={() => !done && handleTask(task.module, task.id)}
                  activeOpacity={0.8}
                  disabled={done}
                >
                  <View style={[s.taskStripe, { backgroundColor: meta.color }]} />
                  <View style={s.taskBody}>
                    <View style={s.taskRow}>
                      <Text style={s.taskIcon}>{done ? '✅' : meta.icon}</Text>
                      <View style={s.taskInfo}>
                        <Text style={[s.taskTitle, done && s.taskTitleDone]}>{task.title}</Text>
                        <Text style={s.taskMeta}>
                          {task.duration} dk  {task.required ? '· Zorunlu' : '· İsteğe bağlı'}
                        </Text>
                      </View>
                      {!done && (
                        <View style={[s.startPill, { backgroundColor: meta.color }]}>
                          <Text style={s.startTxt}>Başla</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}

            {/* ── HIZ TEKNİKLERİ ── */}
            <Text style={[s.sectionTitle, { marginTop: 12 }]}>⚡ Hız Teknikleri</Text>
            <TouchableOpacity
              style={s.featureCard}
              onPress={handleChunkRSVP}
              activeOpacity={0.8}
            >
              <View style={[s.featureStripe, { backgroundColor: t.module.speed_control.color }]} />
              <View style={s.featureBody}>
                <View style={s.featureRow}>
                  <View style={[s.featureIcon, { backgroundColor: t.module.speed_control.color + '20' }]}>
                    <Text style={s.featureIconTxt}>⚡</Text>
                  </View>
                  <View style={s.featureInfo}>
                    <Text style={s.featureName}>Chunk RSVP</Text>
                    <Text style={s.featureDesc}>Parça parça hızlı okuma · Bionic · Akıllı yavaşlama</Text>
                  </View>
                  <View style={[s.startPill, { backgroundColor: t.module.speed_control.color }]}>
                    <Text style={s.startTxt}>Başla</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.featureCard, { marginTop: 8 }]}
              onPress={handleFlowReading}
              activeOpacity={0.8}
            >
              <View style={[s.featureStripe, { backgroundColor: '#3B82F6' }]} />
              <View style={s.featureBody}>
                <View style={s.featureRow}>
                  <View style={[s.featureIcon, { backgroundColor: '#3B82F620' }]}>
                    <Text style={s.featureIconTxt}>🌊</Text>
                  </View>
                  <View style={s.featureInfo}>
                    <Text style={s.featureName}>Akış Okuma</Text>
                    <Text style={s.featureDesc}>Satır satır pacing · Cursor animasyonu · Sprint & Cruise</Text>
                  </View>
                  <View style={[s.startPill, { backgroundColor: '#3B82F6' }]}>
                    <Text style={s.startTxt}>Başla</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* ── TÜM AŞAMALAR ── */}
            <Text style={[s.sectionTitle, { marginTop: 12 }]}>📋 Program Aşamaları</Text>
            {prog.program.phases.map((ph, i) => {
              const passed = prog.currentDay > ph.days[1]
              const active = prog.currentDay >= ph.days[0] && prog.currentDay <= ph.days[1]
              return (
                <View key={i} style={[s.phaseRow, active && s.phaseRowActive]}>
                  <View style={[
                    s.phaseCircle,
                    { backgroundColor: active
                        ? prog.program.color
                        : passed ? t.colors.success + '40' : t.colors.surface }
                  ]}>
                    <Text style={s.phaseCircleTxt}>{passed ? '✓' : ph.phase}</Text>
                  </View>
                  <View style={s.phaseContent}>
                    <Text style={[s.phaseLabel, active && { color: prog.program.color }]}>
                      {ph.title}
                      {active ? ' ← Buradasın' : passed ? ' · Tamamlandı' : ''}
                    </Text>
                    <Text style={s.phaseMeta}>Gün {ph.days[0]}–{ph.days[1]}  ·  {ph.description}</Text>
                  </View>
                </View>
              )
            })}
          </>
        ) : (
          /* ── PROGRAM YOK — seçim kartı ── */
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🎯</Text>
            <Text style={s.emptyTitle}>Henüz program seçmedin</Text>
            <Text style={s.emptySub}>
              LGS, TYT, AYT, ALES, KPSS veya YDS için
              bilimsel hazırlık programı seç.
            </Text>
            <TouchableOpacity
              style={s.selectBtn}
              onPress={() => router.push('/program/select')}
            >
              <Text style={s.selectTxt}>Program Seç →</Text>
            </TouchableOpacity>

            {/* Hız Teknikleri */}
            <Text style={[s.sectionTitle, { marginTop: 32 }]}>⚡ Hız Teknikleri</Text>
            <TouchableOpacity
              style={s.featureCard}
              onPress={handleChunkRSVP}
              activeOpacity={0.8}
            >
              <View style={[s.featureStripe, { backgroundColor: t.module.speed_control.color }]} />
              <View style={s.featureBody}>
                <View style={s.featureRow}>
                  <View style={[s.featureIcon, { backgroundColor: t.module.speed_control.color + '20' }]}>
                    <Text style={s.featureIconTxt}>⚡</Text>
                  </View>
                  <View style={s.featureInfo}>
                    <Text style={s.featureName}>Chunk RSVP</Text>
                    <Text style={s.featureDesc}>Parça parça hızlı okuma · Bionic · Akıllı yavaşlama</Text>
                  </View>
                  <View style={[s.startPill, { backgroundColor: t.module.speed_control.color }]}>
                    <Text style={s.startTxt}>Başla</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.featureCard, { marginTop: 8 }]}
              onPress={handleFlowReading}
              activeOpacity={0.8}
            >
              <View style={[s.featureStripe, { backgroundColor: '#3B82F6' }]} />
              <View style={s.featureBody}>
                <View style={s.featureRow}>
                  <View style={[s.featureIcon, { backgroundColor: '#3B82F620' }]}>
                    <Text style={s.featureIconTxt}>🌊</Text>
                  </View>
                  <View style={s.featureInfo}>
                    <Text style={s.featureName}>Akış Okuma</Text>
                    <Text style={s.featureDesc}>Satır satır pacing · Cursor animasyonu · Sprint & Cruise</Text>
                  </View>
                  <View style={[s.startPill, { backgroundColor: '#3B82F6' }]}>
                    <Text style={s.startTxt}>Başla</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Hızlı başla */}
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>veya Modül Seç</Text>
            {Object.entries(MODULE_META).map(([code, meta]) => (
              <TouchableOpacity
                key={code}
                style={s.quickCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  router.push({ pathname: '/exercise/[moduleCode]', params: { moduleCode: code } })
                }}
              >
                <Text style={s.quickIcon}>{meta.icon}</Text>
                <Text style={s.quickLabel}>{t.module[code]?.label ?? code}</Text>
                <Text style={[s.quickArrow, { color: meta.color }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ms(t: AppTheme) {
  return StyleSheet.create({
    root:    { flex: 1, backgroundColor: t.colors.background },
    topBar:  {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: t.colors.divider,
      backgroundColor: t.colors.panel,
    },
    title:     { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
    changeBtn: {
      backgroundColor: t.colors.primary + '25',
      borderRadius: 999,
      paddingHorizontal: 12, paddingVertical: 6,
    },
    changeTxt: { fontSize: 13, fontWeight: '700', color: t.colors.primaryLight },
    scroll:    { padding: 16, paddingBottom: 40 },
    center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },

    // Program kart
    progCard:  { marginBottom: 20 },
    progTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    progLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    progIcon:  { fontSize: 32 },
    progTitle: { fontSize: 15, fontWeight: '800', color: t.colors.text },
    progDay:   { fontSize: 12, color: t.colors.textHint, marginTop: 2 },
    bar:       {
      height: 4,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      borderRadius: 2, overflow: 'hidden', marginBottom: 14,
    },
    barFill:   { height: 4, borderRadius: 2 },
    phaseBadge:{ borderRadius: 12, padding: 12 },
    phaseNum:  { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 2 },
    phaseTitle:{ fontSize: 14, fontWeight: '700', color: t.colors.text },
    phaseDesc: { fontSize: 12, color: t.colors.textHint, marginTop: 2 },

    sectionTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text, marginBottom: 10 },

    // Görev kartı
    taskCard:  {
      flexDirection: 'row', backgroundColor: t.colors.surface,
      borderRadius: 16, marginBottom: 10,
      overflow: 'hidden', borderWidth: 1, borderColor: t.colors.border,
    },
    taskDone:  { opacity: 0.5 },
    taskStripe:{ width: 4, alignSelf: 'stretch' },
    taskBody:  { flex: 1, padding: 14 },
    taskRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
    taskIcon:  { fontSize: 24 },
    taskInfo:  { flex: 1 },
    taskTitle: { fontSize: 14, fontWeight: '700', color: t.colors.text },
    taskTitleDone: { textDecorationLine: 'line-through', color: t.colors.textHint },
    taskMeta:  { fontSize: 11, color: t.colors.textHint, marginTop: 2 },
    startPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
    startTxt:  { fontSize: 12, fontWeight: '700', color: '#fff' },

    // Aşama listesi
    phaseRow:  {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      backgroundColor: t.colors.surface,
      borderRadius: 12, padding: 12, marginBottom: 8,
      borderWidth: 1, borderColor: t.colors.border,
    },
    phaseRowActive: { borderColor: t.colors.primary + '60' },
    phaseCircle: {
      width: 32, height: 32, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
    },
    phaseCircleTxt: { fontSize: 13, fontWeight: '800', color: t.colors.text },
    phaseContent:   { flex: 1 },
    phaseLabel:     { fontSize: 14, fontWeight: '700', color: t.colors.text },
    phaseMeta:      { fontSize: 11, color: t.colors.textHint, marginTop: 3, lineHeight: 16 },

    // Boş ekran
    emptyWrap:  { alignItems: 'center', paddingTop: 40 },
    emptyEmoji: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '900', color: t.colors.text, marginBottom: 8 },
    emptySub:   { fontSize: 14, color: t.colors.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    selectBtn:  {
      backgroundColor: t.colors.primary,
      borderRadius: 999,
      paddingHorizontal: 28, paddingVertical: 14,
    },
    selectTxt:  { fontSize: 16, fontWeight: '800', color: '#fff' },

    // Hızlı modül
    quickCard:  {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: t.colors.surface,
      borderRadius: 16, padding: 14, marginBottom: 10,
      borderWidth: 1, borderColor: t.colors.border,
      width: '100%',
    },
    quickIcon:  { fontSize: 24 },
    quickLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: t.colors.text },
    quickArrow: { fontSize: 24, fontWeight: '300' },

    // Öne çıkan egzersiz kartı (Chunk RSVP vb.)
    featureCard: {
      flexDirection: 'row', backgroundColor: t.colors.surface,
      borderRadius: 16, marginBottom: 12,
      overflow: 'hidden', borderWidth: 1, borderColor: t.colors.border,
    },
    featureStripe: { width: 4, alignSelf: 'stretch' },
    featureBody: { flex: 1, padding: 14 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    featureIconTxt: { fontSize: 22 },
    featureInfo: { flex: 1 },
    featureName: { fontSize: 15, fontWeight: '700', color: t.colors.text },
    featureDesc: { fontSize: 12, color: t.colors.textHint, marginTop: 2 },
  })
}
