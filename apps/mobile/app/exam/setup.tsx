/**
 * Sınav Kurulum Ekranı — Mock Exam setup
 * Sınav tipi, ders ve soru sayısı seç
 */
import React, { useMemo, useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAppTheme } from '../../src/theme/useAppTheme'

interface ExamConfig {
  type: string
  label: string
  icon: string
  subjects: { label: string; value: string }[]
  duration: string
  defaultCount: number
}

const EXAM_CONFIGS: ExamConfig[] = [
  {
    type: 'LGS',
    label: 'LGS',
    icon: '📚',
    duration: '25 dk',
    defaultCount: 20,
    subjects: [
      { label: 'Karma (Tüm Dersler)', value: '' },
      { label: 'Türkçe', value: 'Türkçe' },
      { label: 'Matematik', value: 'Matematik' },
      { label: 'Fen Bilimleri', value: 'Fen' },
      { label: 'Sosyal Bilgiler', value: 'Sosyal' },
      { label: 'İngilizce', value: 'İngilizce' },
    ],
  },
  {
    type: 'TYT',
    label: 'TYT',
    icon: '🎯',
    duration: '40 dk',
    defaultCount: 20,
    subjects: [
      { label: 'Karma (Tüm Dersler)', value: '' },
      { label: 'Türkçe', value: 'Türkçe' },
      { label: 'Matematik', value: 'Matematik' },
      { label: 'Sosyal Bilimler', value: 'TYT Tarih' },
      { label: 'Fen Bilimleri', value: 'Fizik' },
    ],
  },
  {
    type: 'AYT',
    label: 'AYT',
    icon: '🏆',
    duration: '40 dk',
    defaultCount: 15,
    subjects: [
      { label: 'Karma (Tüm Dersler)', value: '' },
      { label: 'Edebiyat', value: 'Edebiyat' },
      { label: 'Tarih', value: 'AYT Tarih' },
      { label: 'Coğrafya', value: 'Cografya' },
      { label: 'Felsefe', value: 'Felsefe' },
    ],
  },
  {
    type: 'YDS',
    label: 'YDS / YÖKDİL',
    icon: '🌍',
    duration: '60 dk',
    defaultCount: 15,
    subjects: [
      { label: 'Akademik Okuma', value: '' },
    ],
  },
  {
    type: 'KPSS',
    label: 'KPSS',
    icon: '🏛️',
    duration: '45 dk',
    defaultCount: 20,
    subjects: [
      { label: 'Karma', value: '' },
      { label: 'Tarih', value: 'Tarih' },
      { label: 'Coğrafya', value: 'Coğrafya' },
    ],
  },
]

const QUESTION_COUNTS = [10, 15, 20, 25, 30]

export default function ExamSetupScreen() {
  const t = useAppTheme()
  const router = useRouter()
  const [selectedExam, setSelectedExam] = useState(EXAM_CONFIGS[0])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedCount, setSelectedCount] = useState(20)

  const s = useMemo(() => StyleSheet.create({
    container:   { flex: 1, backgroundColor: t.colors.background },
    header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.lg, paddingBottom: t.spacing.md, gap: 12 },
    backBtn:     { padding: 8 },
    backText:    { fontSize: 20, color: t.colors.text },
    title:       { fontSize: t.font.xxl, fontWeight: '800', color: t.colors.text },
    sectionLbl:  { fontSize: t.font.sm, fontWeight: '700', color: t.colors.textSub, marginHorizontal: t.spacing.lg, marginTop: t.spacing.xl, marginBottom: t.spacing.md, textTransform: 'uppercase', letterSpacing: 0.8 },
    examRow:     { flexDirection: 'row', paddingHorizontal: t.spacing.lg, gap: 10, flexWrap: 'wrap' },
    examChip:    { paddingHorizontal: 16, paddingVertical: 10, borderRadius: t.radius.pill, backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.border, flexDirection: 'row', gap: 6, alignItems: 'center' },
    examChipSel: { backgroundColor: t.colors.primary + '15', borderColor: t.colors.primary },
    examChipTxt: { fontSize: t.font.md, color: t.colors.text, fontWeight: '600' },
    examChipTxtSel: { color: t.colors.primary },
    subjectCard: { marginHorizontal: t.spacing.lg, marginBottom: 8, padding: 14, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.border },
    subjectCardSel: { borderColor: t.colors.primary, backgroundColor: t.colors.primary + '10' },
    subjectTxt:  { fontSize: t.font.md, color: t.colors.text, fontWeight: '500' },
    subjectTxtSel: { color: t.colors.primary, fontWeight: '700' },
    countRow:    { flexDirection: 'row', paddingHorizontal: t.spacing.lg, gap: 10 },
    countChip:   { flex: 1, paddingVertical: 10, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.border, alignItems: 'center' },
    countChipSel:{ backgroundColor: t.colors.primary + '15', borderColor: t.colors.primary },
    countTxt:    { fontSize: t.font.md, color: t.colors.text, fontWeight: '600' },
    countTxtSel: { color: t.colors.primary },
    footer:      { padding: t.spacing.xl },
    startBtn:    { paddingVertical: 16, borderRadius: t.radius.lg, backgroundColor: t.colors.primary, alignItems: 'center' },
    startBtnTxt: { fontSize: t.font.xl, fontWeight: '800', color: '#FFF' },
    infoBox:     { marginHorizontal: t.spacing.lg, marginTop: t.spacing.md, padding: t.spacing.md, backgroundColor: t.colors.surface, borderRadius: t.radius.md, flexDirection: 'row', gap: 8, alignItems: 'center' },
    infoTxt:     { fontSize: t.font.sm, color: t.colors.textSub, flex: 1 },
  }), [t])

  const handleStart = () => {
    router.push({
      pathname: '/exam/[examType]',
      params: {
        examType: selectedExam.type,
        subject: selectedSubject,
        count: String(selectedCount),
      },
    })
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Mock Sınav</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Exam Type */}
        <Text style={s.sectionLbl}>Sınav Tipi</Text>
        <View style={s.examRow}>
          {EXAM_CONFIGS.map((cfg) => {
            const selected = selectedExam.type === cfg.type
            return (
              <TouchableOpacity
                key={cfg.type}
                style={[s.examChip, selected && s.examChipSel]}
                onPress={() => {
                  setSelectedExam(cfg)
                  setSelectedSubject('')
                  setSelectedCount(cfg.defaultCount)
                }}
              >
                <Text>{cfg.icon}</Text>
                <Text style={[s.examChipTxt, selected && s.examChipTxtSel]}>{cfg.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Info */}
        <View style={s.infoBox}>
          <Text>⏱️</Text>
          <Text style={s.infoTxt}>
            {selectedExam.label} sınavı: {selectedExam.duration} · Seçilen: {selectedCount} soru
          </Text>
        </View>

        {/* Subject */}
        <Text style={s.sectionLbl}>Ders Seçimi</Text>
        {selectedExam.subjects.map((sub) => {
          const selected = selectedSubject === sub.value
          return (
            <TouchableOpacity
              key={sub.value}
              style={[s.subjectCard, selected && s.subjectCardSel]}
              onPress={() => setSelectedSubject(sub.value)}
            >
              <Text style={[s.subjectTxt, selected && s.subjectTxtSel]}>
                {selected ? '● ' : '○ '}{sub.label}
              </Text>
            </TouchableOpacity>
          )
        })}

        {/* Question Count */}
        <Text style={s.sectionLbl}>Soru Sayısı</Text>
        <View style={s.countRow}>
          {QUESTION_COUNTS.map((n) => {
            const selected = selectedCount === n
            return (
              <TouchableOpacity
                key={n}
                style={[s.countChip, selected && s.countChipSel]}
                onPress={() => setSelectedCount(n)}
              >
                <Text style={[s.countTxt, selected && s.countTxtSel]}>{n}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.startBtn} onPress={handleStart}>
          <Text style={s.startBtnTxt}>Sınavı Başlat →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
