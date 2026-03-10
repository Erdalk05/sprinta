/**
 * ExamCountdownCard — Sınav Geri Sayım Widget'ı
 * GameHomeScreen'e eklenir; öğrenci exam_countdowns tablosundaki aktif sınavını gösterir.
 * Sınav yoksa → "Sınav tarihi ekle" CTA.
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, ScrollView, Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../stores/authStore'

interface Countdown {
  id: string
  exam_type: string
  exam_date: string
  exam_label: string | null
}

const EXAM_COLORS: Record<string, string> = {
  LGS:  '#1877F2',
  TYT:  '#1A3594',
  AYT:  '#6D28D9',
  YDS:  '#0F766E',
  ALES: '#B45309',
  KPSS: '#0F2357',
}

const EXAM_TYPES = ['LGS', 'TYT', 'AYT', 'YDS', 'ALES', 'KPSS']

function daysUntil(dateStr: string): number {
  const today  = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

function urgencyColor(days: number): string {
  if (days <= 7)  return '#EF4444'
  if (days <= 30) return '#F59E0B'
  if (days <= 90) return '#22C55E'
  return '#60A5FA'
}

export function ExamCountdownCard() {
  const { student } = useAuthStore()
  const [countdown, setCountdown] = useState<Countdown | null>(null)
  const [modalOpen, setModalOpen]  = useState(false)
  const [selType,   setSelType]    = useState('LGS')
  const [dateInput, setDateInput]  = useState('')
  const [label,     setLabel]      = useState('')
  const [saving,    setSaving]     = useState(false)

  const load = useCallback(async () => {
    if (!student?.id) return
    const { data } = await (supabase as any)
      .from('exam_countdowns')
      .select('id, exam_type, exam_date, exam_label')
      .eq('student_id', student.id)
      .eq('is_active', true)
      .order('exam_date', { ascending: true })
      .limit(1)
      .maybeSingle()
    setCountdown(data ?? null)
  }, [student?.id])

  useEffect(() => { load() }, [load])

  const handleSave = useCallback(async () => {
    if (!student?.id || !dateInput) return
    setSaving(true)
    try {
      await (supabase as any).from('exam_countdowns').insert({
        student_id: student.id,
        exam_type:  selType,
        exam_date:  dateInput,
        exam_label: label || `${new Date(dateInput).getFullYear()} ${selType}`,
        is_active:  true,
      })
      setModalOpen(false)
      setDateInput('')
      setLabel('')
      await load()
    } catch { /* sessiz */ }
    finally { setSaving(false) }
  }, [student?.id, selType, dateInput, label, load])

  const handleDelete = useCallback(async () => {
    if (!countdown) return
    await (supabase as any)
      .from('exam_countdowns')
      .update({ is_active: false })
      .eq('id', countdown.id)
    setCountdown(null)
  }, [countdown])

  // ── Sınav yoksa CTA ─────────────────────────────────────────
  if (!countdown) {
    return (
      <>
        <TouchableOpacity
          style={s.addCard}
          onPress={() => { setModalOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
          activeOpacity={0.85}
        >
          <Text style={s.addIcon}>📅</Text>
          <View style={s.addText}>
            <Text style={s.addTitle}>Sınav Tarihi Ekle</Text>
            <Text style={s.addSub}>Geri sayım başlasın!</Text>
          </View>
          <Text style={s.addArrow}>+</Text>
        </TouchableOpacity>

        <AddModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          selType={selType}
          setSelType={setSelType}
          dateInput={dateInput}
          setDateInput={setDateInput}
          label={label}
          setLabel={setLabel}
          saving={saving}
          onSave={handleSave}
        />
      </>
    )
  }

  const days  = daysUntil(countdown.exam_date)
  const color = EXAM_COLORS[countdown.exam_type] ?? '#1877F2'
  const urgency = urgencyColor(days)

  return (
    <>
      <View style={[s.card, { borderColor: color + '60' }]}>
        {/* Sol renkli şerit */}
        <View style={[s.strip, { backgroundColor: color }]} />

        <View style={s.body}>
          <View style={s.topRow}>
            <View>
              <Text style={s.examLabel}>{countdown.exam_label ?? countdown.exam_type}</Text>
              <Text style={[s.examDate, { color: urgency }]}>
                {days > 0 ? `${days} gün kaldı` : days === 0 ? '🎯 Bugün!' : 'Geçti'}
              </Text>
            </View>
            <View style={[s.dayBadge, { backgroundColor: urgency + '22', borderColor: urgency }]}>
              <Text style={[s.dayNum, { color: urgency }]}>{Math.abs(days)}</Text>
              <Text style={[s.dayLabel, { color: urgency }]}>gün</Text>
            </View>
          </View>

          {/* İlerleme çubuğu — 365 gün referans */}
          <View style={s.progressBg}>
            <View style={[
              s.progressFill,
              {
                backgroundColor: urgency,
                width: `${Math.max(2, Math.min(100, (1 - days / 365) * 100))}%`,
              },
            ]} />
          </View>

          <TouchableOpacity onPress={handleDelete}>
            <Text style={s.removeHint}>✕ Kaldır</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selType={selType}
        setSelType={setSelType}
        dateInput={dateInput}
        setDateInput={setDateInput}
        label={label}
        setLabel={setLabel}
        saving={saving}
        onSave={handleSave}
      />
    </>
  )
}

// ── Modal ─────────────────────────────────────────────────────
function AddModal({
  open, onClose, selType, setSelType, dateInput, setDateInput,
  label, setLabel, saving, onSave,
}: {
  open: boolean; onClose: () => void
  selType: string; setSelType: (v: string) => void
  dateInput: string; setDateInput: (v: string) => void
  label: string; setLabel: (v: string) => void
  saving: boolean; onSave: () => void
}) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <Text style={m.title}>Sınav Tarihi Ekle</Text>

          <Text style={m.label}>Sınav Türü</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={m.typeRow}>
            {EXAM_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[m.typeChip, selType === t && m.typeChipSel]}
                onPress={() => setSelType(t)}
              >
                <Text style={[m.typeChipTxt, selType === t && m.typeChipTxtSel]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={m.label}>Tarih (YYYY-MM-DD)</Text>
          <TextInput
            style={m.input}
            placeholder="2026-06-07"
            placeholderTextColor="#888"
            value={dateInput}
            onChangeText={setDateInput}
            keyboardType={Platform.OS === 'ios' ? 'default' : 'default'}
          />

          <Text style={m.label}>Etiket (opsiyonel)</Text>
          <TextInput
            style={m.input}
            placeholder="2026 LGS"
            placeholderTextColor="#888"
            value={label}
            onChangeText={setLabel}
          />

          <View style={m.btnRow}>
            <TouchableOpacity style={m.btnCancel} onPress={onClose}>
              <Text style={m.btnCancelTxt}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[m.btnSave, (!dateInput || saving) && m.btnDisabled]}
              onPress={onSave}
              disabled={!dateInput || saving}
            >
              <Text style={m.btnSaveTxt}>{saving ? '...' : 'Kaydet'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  addCard:  { flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: 'rgba(24,119,242,0.08)', borderRadius: 16,
              borderWidth: 1, borderColor: 'rgba(24,119,242,0.3)',
              borderStyle: 'dashed', padding: 14, marginHorizontal: 16, marginBottom: 12 },
  addIcon:  { fontSize: 24 },
  addText:  { flex: 1 },
  addTitle: { color: '#1877F2', fontWeight: '700', fontSize: 14 },
  addSub:   { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  addArrow: { color: '#1877F2', fontSize: 22, fontWeight: '900' },

  card:    { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
             borderWidth: 1, overflow: 'hidden',
             marginHorizontal: 16, marginBottom: 12, flexDirection: 'row' },
  strip:   { width: 4 },
  body:    { flex: 1, padding: 14 },
  topRow:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  examLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  examDate:  { fontSize: 13, fontWeight: '600', marginTop: 2 },

  dayBadge: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 10,
              paddingVertical: 4, alignItems: 'center', minWidth: 56 },
  dayNum:   { fontSize: 22, fontWeight: '900' },
  dayLabel: { fontSize: 10, fontWeight: '700', marginTop: -2 },

  progressBg:   { height: 4, backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 2, marginTop: 10, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  removeHint:   { color: 'rgba(255,255,255,0.3)', fontSize: 11, alignSelf: 'flex-end' },
})

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: '#1A2040', borderTopLeftRadius: 24, borderTopRightRadius: 24,
             padding: 24, paddingBottom: 40 },
  title:   { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 20 },
  label:   { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700',
             marginBottom: 8, marginTop: 12 },
  typeRow: { flexDirection: 'row' as const },
  typeChip:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                 backgroundColor: 'rgba(255,255,255,0.08)',
                 borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginRight: 8 },
  typeChipSel: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  typeChipTxt:    { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 13 },
  typeChipTxtSel: { color: '#fff' },
  input:   { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
             borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
             color: '#fff', padding: 12, fontSize: 14 },
  btnRow:     { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnCancel:  { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)' },
  btnCancelTxt: { color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  btnSave:    { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center',
                backgroundColor: '#1877F2' },
  btnDisabled: { opacity: 0.4 },
  btnSaveTxt: { color: '#fff', fontWeight: '800' },
})
