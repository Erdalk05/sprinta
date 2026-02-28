/**
 * ExerciseIntroScreen — Her egzersiz öncesi tanıtım ve level seçim ekranı
 * Scroll YOK — tüm içerik tek ekrana sığdırılmıştır (iPhone SE – Pro Max / Android)
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { DifficultyLevel, VisualExerciseConfig } from '../constants/exerciseConfig'
import { DURATION_BY_LEVEL } from '../constants/exerciseConfig'
import { useVisualMechanicsStore } from '../store/visualMechanicsStore'

// ─── Renkler ─────────────────────────────────────────────────────
const NEON_CYAN  = '#00F5FF'
const NEON_GREEN = '#00FF94'
const DARK_BG    = '#0A0F1F'
const DARK_SURF  = '#0E1628'
const DARK_BRD   = 'rgba(0,245,255,0.15)'

// ─── Responsive yardımcı ─────────────────────────────────────────
const { height: SH } = Dimensions.get('window')
// iPhone SE (1st gen) min usable ~580; ölçekleme için 700 referans
const scale = (v: number) => Math.round(v * Math.min(SH / 812, 1))

interface ExerciseIntroScreenProps {
  config: VisualExerciseConfig
  onStart: (level: DifficultyLevel) => void
  onBack:  () => void
}

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  1: 'Başlangıç', 2: 'Orta', 3: 'İleri', 4: 'Uzman',
}

// ─── Mini bilgi kutusu (3-sütun) ──────────────────────────────────
function InfoChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.chip}>
      <Text style={s.chipIcon}>{icon}</Text>
      <Text style={s.chipLabel}>{label}</Text>
      <Text style={s.chipValue} numberOfLines={3}>{value}</Text>
    </View>
  )
}

// ─── Ana bileşen ─────────────────────────────────────────────────
export const ExerciseIntroScreen: React.FC<ExerciseIntroScreenProps> = ({
  config, onStart, onBack,
}) => {
  const t = useAppTheme()
  const lastLevel            = useVisualMechanicsStore((st) => st.lastSelectedLevel)
  const setLastSelectedLevel = useVisualMechanicsStore((st) => st.setLastSelectedLevel)
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(lastLevel)
  const dur = DURATION_BY_LEVEL[selectedLevel]

  const handleStart = () => {
    setLastSelectedLevel(selectedLevel)
    onStart(selectedLevel)
  }

  return (
    <SafeAreaView style={s.root}>

      {/* ── Geri butonu ── */}
      <TouchableOpacity style={s.backBtn} onPress={onBack}>
        <Text style={s.backTxt}>← Geri</Text>
      </TouchableOpacity>

      {/* ── Başlık + Açıklama ── */}
      <Text style={s.title} numberOfLines={2}>{config.titleTR}</Text>
      <Text style={[s.desc, { color: t.colors.textHint }]} numberOfLines={2}>
        {config.descriptionTR}
      </Text>

      {/* ── 3 bilgi kutusu (yatay) ── */}
      <View style={s.chipRow}>
        <InfoChip icon="💪" label="Göz Kasları"    value={config.targetMusclesTR} />
        <InfoChip icon="📖" label="Okuma Katkısı"  value={config.readingBenefitTR} />
        <InfoChip icon="📝" label="Sınav Katkısı"  value={config.examBenefitTR} />
      </View>

      {/* ── ARP özeti (tek satır, compact) ── */}
      <View style={s.arpBar}>
        <Text style={s.arpTitle}>🧠 ARP</Text>
        <View style={s.arpStats}>
          <Text style={s.arpStat}>
            Reg <Text style={s.arpVal}>{Math.round(config.arpEffect.regressionReduction * 100)}%</Text>
          </Text>
          <Text style={s.arpDot}>·</Text>
          <Text style={s.arpStat}>
            Hata <Text style={s.arpVal}>{Math.round(config.arpEffect.errorRateReduction * 100)}%</Text>
          </Text>
          <Text style={s.arpDot}>·</Text>
          <Text style={s.arpStat}>
            Yorg <Text style={s.arpVal}>{Math.round(config.arpEffect.fatigueReduction * 100)}%</Text>
          </Text>
        </View>
      </View>

      {/* ── Level seçimi ── */}
      <Text style={s.sectionLbl}>SEVİYE SEÇ</Text>
      <View style={s.levelRow}>
        {([1, 2, 3, 4] as DifficultyLevel[]).map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[s.lvlBtn, selectedLevel === lvl && s.lvlBtnActive]}
            onPress={() => setSelectedLevel(lvl)}
          >
            <Text style={[s.lvlNum, { color: selectedLevel === lvl ? DARK_BG : NEON_CYAN }]}>
              {lvl}
            </Text>
            <Text style={[s.lvlLbl, { color: selectedLevel === lvl ? DARK_BG : '#8696A0' }]}>
              {LEVEL_LABELS[lvl]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Başlat butonu + süre ── */}
      <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
        <Text style={s.startTxt}>Egzersizi Başlat</Text>
        <Text style={s.startDur}>⏱ {dur.min}–{dur.max} saniye</Text>
      </TouchableOpacity>

    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: DARK_BG,
    paddingHorizontal: 18,
    paddingBottom:   12,
    justifyContent:  'space-between',
  },

  // Geri
  backBtn: { paddingTop: scale(10), paddingBottom: scale(4), alignSelf: 'flex-start' },
  backTxt: { fontSize: scale(14), color: '#8696A0' },

  // Başlık
  title: {
    fontSize:   scale(22),
    fontWeight: '800',
    color:      NEON_CYAN,
    marginBottom: scale(4),
  },
  desc: {
    fontSize:   scale(12),
    lineHeight: scale(17),
  },

  // 3-sütun chip
  chipRow: {
    flexDirection: 'row',
    gap:           8,
    marginTop:     scale(10),
  },
  chip: {
    flex:            1,
    backgroundColor: DARK_SURF,
    borderRadius:    12,
    padding:         scale(10),
    borderWidth:     1,
    borderColor:     DARK_BRD,
  },
  chipIcon:  { fontSize: scale(16), marginBottom: scale(4) },
  chipLabel: {
    fontSize:      scale(9),
    color:         '#8696A0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom:  scale(3),
  },
  chipValue: { fontSize: scale(11), color: '#E9EDEF', lineHeight: scale(15) },

  // ARP tek satır
  arpBar: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: DARK_SURF,
    borderRadius:    12,
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    borderWidth:     1,
    borderColor:     'rgba(0,255,148,0.15)',
    marginTop:       scale(10),
    gap:             10,
  },
  arpTitle: { fontSize: scale(12), fontWeight: '700', color: NEON_GREEN },
  arpStats: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  arpStat:  { fontSize: scale(11), color: '#8696A0' },
  arpVal:   { fontWeight: '800', color: NEON_GREEN },
  arpDot:   { fontSize: scale(11), color: '#8696A0' },

  // Level
  sectionLbl: {
    fontSize:      scale(11),
    fontWeight:    '700',
    color:         '#8696A0',
    letterSpacing: 0.8,
    marginTop:     scale(12),
    marginBottom:  scale(8),
  },
  levelRow: { flexDirection: 'row', gap: 8 },
  lvlBtn: {
    flex:            1,
    backgroundColor: DARK_SURF,
    borderRadius:    12,
    paddingVertical: scale(10),
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     DARK_BRD,
  },
  lvlBtnActive: { backgroundColor: NEON_CYAN, borderColor: NEON_CYAN },
  lvlNum:  { fontSize: scale(18), fontWeight: '800' },
  lvlLbl:  { fontSize: scale(9), marginTop: scale(3) },

  // Başlat
  startBtn: {
    backgroundColor: NEON_CYAN,
    borderRadius:    14,
    paddingVertical: scale(14),
    alignItems:      'center',
    marginTop:       scale(12),
  },
  startTxt: { fontSize: scale(16), fontWeight: '800', color: DARK_BG, letterSpacing: 0.3 },
  startDur: { fontSize: scale(11), color: DARK_BG, opacity: 0.65, marginTop: scale(2) },
})
