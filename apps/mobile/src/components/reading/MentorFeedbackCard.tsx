// =====================================================
// MentorFeedbackCard.tsx — Sprint 9
// AI mentor geri bildirim kartı
// Pure component: props-only, no async
// =====================================================

import React, { useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import type { AiMentorFeedback, MentorImprovementFocus } from '@sprinta/api'

// ─── Sabitler ─────────────────────────────────────────

const FOCUS_LABEL: Record<MentorImprovementFocus, string> = {
  inference:     '🔎 Çıkarım',
  detail:        '📌 Ayrıntı',
  speed_control: '⚡ Hız Kontrolü',
  vocabulary:    '📖 Kelime',
  consistency:   '🔄 Süreklilik',
}

const FOCUS_COLOR: Record<MentorImprovementFocus, string> = {
  inference:     '#8B5CF6',
  detail:        '#3B82F6',
  speed_control: '#EF4444',
  vocabulary:    '#10B981',
  consistency:   '#F59E0B',
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

// ─── Props ────────────────────────────────────────────

interface MentorFeedbackCardProps {
  feedback:     AiMentorFeedback | null
  loading:      boolean
  isGenerating: boolean
  onGenerate:   () => void
}

// ─── Bileşen ──────────────────────────────────────────

export const MentorFeedbackCard = React.memo(function MentorFeedbackCard({
  feedback,
  loading,
  isGenerating,
  onGenerate,
}: MentorFeedbackCardProps) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  // ── Yükleniyor ────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.avatar}>🎓</Text>
          <View>
            <Text style={s.title}>Sprinta Mentorunuz</Text>
            <Text style={s.subtitle}>Analiz yükleniyor…</Text>
          </View>
        </View>
        <View style={[s.skeletonLine, { width: '90%' }]} />
        <View style={[s.skeletonLine, { width: '70%' }]} />
      </View>
    )
  }

  // ── Veri yok — teşvik mesajı ─────────────────────────
  if (!feedback) {
    return (
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.avatar}>🎓</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Sprinta Mentorunuz</Text>
            <Text style={s.subtitle}>Kişisel AI koç</Text>
          </View>
        </View>
        <Text style={s.emptyText}>
          İlk okuma seansını tamamla ya da birkaç soruyu yanıtla —{'\n'}
          mentorun seni analiz etsin.
        </Text>
        <TouchableOpacity
          style={[s.generateBtn, isGenerating && s.generateBtnDisabled]}
          onPress={onGenerate}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.generateBtnTxt}>✨ Analiz Başlat</Text>
          }
        </TouchableOpacity>
      </View>
    )
  }

  const focusColor = FOCUS_COLOR[feedback.improvement_focus] ?? t.colors.primary
  const days       = daysSince(feedback.generated_at)

  return (
    <View style={s.card}>

      {/* ── Başlık ───────────────────────────────────── */}
      <View style={s.headerRow}>
        <Text style={s.avatar}>🎓</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Sprinta Mentorunuz</Text>
          <Text style={s.subtitle}>
            {days === 0 ? 'Bugün güncellendi' : `${days} gün önce`}
          </Text>
        </View>
        {/* Odak rozeti */}
        <View style={[s.focusBadge, { backgroundColor: focusColor + '20' }]}>
          <Text style={[s.focusBadgeTxt, { color: focusColor }]}>
            {FOCUS_LABEL[feedback.improvement_focus]}
          </Text>
        </View>
      </View>

      {/* ── Temel içgörü ─────────────────────────────── */}
      <View style={[s.insightBox, { borderLeftColor: focusColor }]}>
        <Text style={s.insightTxt}>{feedback.key_insight}</Text>
      </View>

      {/* ── Geri bildirim metni ──────────────────────── */}
      <Text style={s.feedbackTxt}>{feedback.feedback_text}</Text>

      {/* ── Aksiyon önerileri ────────────────────────── */}
      {feedback.action_items.length > 0 && (
        <View style={s.actionsBox}>
          <Text style={s.actionsTitle}>Bu Hafta Dene</Text>
          {feedback.action_items.map((item, i) => (
            <View key={i} style={s.actionRow}>
              <View style={[s.actionDot, { backgroundColor: focusColor }]} />
              <Text style={s.actionTxt}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Yenile butonu ────────────────────────────── */}
      <TouchableOpacity
        style={[s.refreshBtn, isGenerating && s.generateBtnDisabled]}
        onPress={onGenerate}
        disabled={isGenerating}
        activeOpacity={0.8}
      >
        {isGenerating
          ? <ActivityIndicator size="small" color={focusColor} />
          : <Text style={[s.refreshBtnTxt, { color: focusColor }]}>
              ↻ Yeni Analiz
            </Text>
        }
      </TouchableOpacity>
    </View>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.md,
      gap:             t.spacing.sm,
      ...t.shadows.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.sm,
    },
    avatar: { fontSize: 28 },
    title:  {
      fontSize:   t.font.md,
      fontWeight: '800',
      color:      t.colors.text,
    },
    subtitle: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      marginTop: 1,
    },
    focusBadge: {
      paddingHorizontal: t.spacing.sm,
      paddingVertical:   3,
      borderRadius:      20,
    },
    focusBadgeTxt: {
      fontSize:   t.font.xs,
      fontWeight: '700',
    },

    // İçgörü kutusu — sol çizgili
    insightBox: {
      borderLeftWidth: 3,
      paddingLeft:     t.spacing.sm,
      paddingVertical: 4,
    },
    insightTxt: {
      fontSize:   t.font.sm,
      fontWeight: '600',
      color:      t.colors.text,
      lineHeight: 20,
    },

    // Geri bildirim metni
    feedbackTxt: {
      fontSize:  t.font.sm,
      color:     t.colors.textHint,
      lineHeight: 22,
    },

    // Aksiyon listesi
    actionsBox: {
      backgroundColor: t.colors.background,
      borderRadius:    t.radius.md,
      padding:         t.spacing.sm,
      gap:             t.spacing.xs,
    },
    actionsTitle: {
      fontSize:   t.font.xs,
      fontWeight: '700',
      color:      t.colors.text,
      marginBottom: 2,
      letterSpacing: 0.5,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems:    'flex-start',
      gap:           t.spacing.xs,
    },
    actionDot: {
      width:        6,
      height:       6,
      borderRadius: 3,
      marginTop:    6,
      flexShrink:   0,
    },
    actionTxt: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      lineHeight: 18,
      flex:       1,
    },

    // Butonlar
    generateBtn: {
      backgroundColor: t.colors.primary,
      borderRadius:    t.radius.md,
      paddingVertical: 14,
      alignItems:      'center',
    },
    generateBtnDisabled: { opacity: 0.55 },
    generateBtnTxt: {
      fontSize:   t.font.sm,
      fontWeight: '800',
      color:      '#fff',
    },
    refreshBtn: {
      alignSelf:         'flex-end',
      paddingHorizontal: t.spacing.sm,
      paddingVertical:   6,
      borderRadius:      t.radius.sm,
      backgroundColor:   t.colors.background,
      borderWidth:       1,
      borderColor:       t.colors.border,
    },
    refreshBtnTxt: {
      fontSize:   t.font.xs,
      fontWeight: '700',
    },

    // Skeleton
    skeletonLine: {
      height:          12,
      borderRadius:    6,
      backgroundColor: t.colors.border,
    },

    // Boş durum
    emptyText: {
      fontSize:   t.font.sm,
      color:      t.colors.textHint,
      textAlign:  'center',
      lineHeight: 22,
      paddingVertical: t.spacing.xs,
    },
  })
}
