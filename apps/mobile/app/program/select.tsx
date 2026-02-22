import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import { createProgramService, ExamProgram } from '@sprinta/api'
import { theme } from '../../src/theme'
import { GradientCard } from '../../src/components/ui/GradientCard'
import { useAuthStore } from '../../src/stores/authStore'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

const EXAM_META: Record<string, { badge: string; desc: string }> = {
  lgs:  { badge: '6-8. Sınıf',      desc: '45 günlük yoğun paragraf ve hız programı' },
  tyt:  { badge: '12. Sınıf / Mezun', desc: '60 günlük TYT Türkçe odaklı program' },
  ayt:  { badge: 'SÖZ / EA / SAY',  desc: '90 günlük derinlemesine analiz programı' },
  kpss: { badge: 'Devlet Adayı',    desc: '75 günlük paragraf ve hızlı tarama' },
  ales: { badge: 'Lisansüstü',      desc: '60 günlük akademik okuma yoğunlaştırması' },
  yds:  { badge: 'Akademik İng.',   desc: '90 günlük YDS/YÖKDİL tam program' },
}

export default function ProgramSelectScreen() {
  const router = useRouter()
  const { student } = useAuthStore()
  const [programs, setPrograms] = useState<ExamProgram[]>([])
  const [loading, setLoading]   = useState(true)
  const [starting, setStarting] = useState<string | null>(null)

  useEffect(() => {
    const svc = createProgramService(supabase)
    svc.getAllPrograms().then((p) => { setPrograms(p); setLoading(false) })
  }, [])

  const handleStart = async (program: ExamProgram) => {
    if (!student) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setStarting(program.id)
    const svc = createProgramService(supabase)
    await svc.startProgram({
      studentId: student.id,
      programId: program.id,
      examType:  program.examType,
    })
    setStarting(null)
    router.replace('/(tabs)/sessions')
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>Sınav Programı Seç</Text>
        <Text style={s.sub}>Hedefe uygun 45-90 günlük bilimsel program</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {programs.map((p) => {
            const meta = EXAM_META[p.examType] ?? { badge: '', desc: p.subtitle }
            const isSelected = student?.examTarget === p.examType
            return (
              <GradientCard
                key={p.id}
                colors={[p.color + '30', theme.colors.surface]}
                style={isSelected ? [s.card, { borderColor: p.color, borderWidth: 2 }] : s.card}
              >
                {/* Üst satır */}
                <View style={s.cardTop}>
                  <Text style={s.cardIcon}>{p.icon}</Text>
                  <View style={s.cardInfo}>
                    <View style={s.cardTitleRow}>
                      <Text style={s.cardTitle}>{p.title}</Text>
                      {isSelected && (
                        <View style={[s.recBadge, { backgroundColor: p.color }]}>
                          <Text style={s.recTxt}>ÖNERİLEN</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.cardSub}>{meta.badge}</Text>
                  </View>
                </View>

                {/* Açıklama */}
                <Text style={s.cardDesc}>{meta.desc}</Text>

                {/* İstatistikler */}
                <View style={s.statsRow}>
                  <View style={s.stat}>
                    <Text style={[s.statVal, { color: p.color }]}>{p.durationDays}</Text>
                    <Text style={s.statLbl}>Gün</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.stat}>
                    <Text style={[s.statVal, { color: p.color }]}>{p.dailyMinutes}</Text>
                    <Text style={s.statLbl}>Dk/Gün</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.stat}>
                    <Text style={[s.statVal, { color: p.color }]}>{p.targetArp}</Text>
                    <Text style={s.statLbl}>Hedef ARP</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.stat}>
                    <Text style={[s.statVal, { color: p.color }]}>{p.phases.length}</Text>
                    <Text style={s.statLbl}>Aşama</Text>
                  </View>
                </View>

                {/* Aşama özeti */}
                <View style={s.phases}>
                  {p.phases.map((ph, i) => (
                    <View key={i} style={s.phaseChip}>
                      <View style={[s.phaseDot, { backgroundColor: p.color }]} />
                      <Text style={s.phaseTitle}>{ph.title}</Text>
                      <Text style={s.phaseDays}>Gün {ph.days[0]}-{ph.days[1]}</Text>
                    </View>
                  ))}
                </View>

                {/* Başlat butonu */}
                <TouchableOpacity
                  style={[s.btn, { backgroundColor: p.color }, starting === p.id && s.btnDisabled]}
                  onPress={() => handleStart(p)}
                  disabled={!!starting}
                  activeOpacity={0.8}
                >
                  {starting === p.id
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={s.btnTxt}>Bu Programı Başlat →</Text>
                  }
                </TouchableOpacity>
              </GradientCard>
            )
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: theme.colors.background },
  header:  { padding: 20, paddingBottom: 8 },
  backBtn: { marginBottom: 12 },
  backTxt: { fontSize: 14, color: theme.colors.accent },
  title:   { fontSize: 24, fontWeight: '900', color: theme.colors.text },
  sub:     { fontSize: 13, color: theme.colors.textHint, marginTop: 4 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:  { padding: 16, paddingTop: 8 },

  card:    { marginBottom: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cardIcon:{ fontSize: 36, marginRight: 12 },
  cardInfo:{ flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardTitle:    { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  recBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  recTxt:  { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  cardSub: { fontSize: 12, color: theme.colors.textHint, marginTop: 3 },
  cardDesc:{ fontSize: 13, color: theme.colors.textSub, marginBottom: 14, lineHeight: 18 },

  statsRow:{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stat:    { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLbl: { fontSize: 10, color: theme.colors.textHint, marginTop: 2 },
  statDiv: { width: 1, height: 32, backgroundColor: theme.colors.divider },

  phases:  { gap: 6, marginBottom: 16 },
  phaseChip: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phaseDot:  { width: 8, height: 8, borderRadius: 4 },
  phaseTitle:{ flex: 1, fontSize: 13, fontWeight: '600', color: theme.colors.text },
  phaseDays: { fontSize: 11, color: theme.colors.textHint },

  btn:        { borderRadius: theme.radius.pill, paddingVertical: 14, alignItems: 'center' },
  btnDisabled:{ opacity: 0.6 },
  btnTxt:     { fontSize: 15, fontWeight: '800', color: '#fff' },
})
