// =====================================================
// BookmarksDrawer — Yer imi ve notlar çekmece paneli
//
// Modal bottom sheet tarzı.
// Props: textId, studentId, currentChapterId, visible, onClose
// İşlemler: yer imi listele / not ekle / sil
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View, Text, Modal, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'

// ─── Tipler ───────────────────────────────────────────

export interface Bookmark {
  id:            string
  type:          'bookmark' | 'note' | 'highlight'
  position:      number
  note:          string | null
  selected_text: string | null
  created_at:    string
  chapter_id:    string | null
}

export interface BookmarksDrawerProps {
  visible:          boolean
  textId:           string
  studentId:        string
  currentChapterId: string | null
  currentPosition:  number        // 0–1 scroll ratio
  onClose:          () => void
}

// ─── Tip ikonu ────────────────────────────────────────
function typeIcon(type: Bookmark['type']): string {
  return type === 'note' ? '📝' : type === 'highlight' ? '🖊️' : '🔖'
}

function typeLabel(type: Bookmark['type']): string {
  return type === 'note' ? 'Not' : type === 'highlight' ? 'Alıntı' : 'Yer İmi'
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')} · ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`
}

// ─── Ana Bileşen ──────────────────────────────────────

export const BookmarksDrawer = React.memo(function BookmarksDrawer({
  visible, textId, studentId, currentChapterId, currentPosition, onClose,
}: BookmarksDrawerProps) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading,   setLoading]   = useState(false)
  const [tab,       setTab]       = useState<'list' | 'add'>('list')
  const [noteText,  setNoteText]  = useState('')
  const [addType,   setAddType]   = useState<'bookmark' | 'note'>('bookmark')
  const [saving,    setSaving]    = useState(false)

  // Yer imlerini yükle
  const loadBookmarks = useCallback(async () => {
    if (!textId || !studentId) return
    setLoading(true)
    try {
      const { data } = await (supabase as any)
        .from('text_bookmarks')
        .select('id, type, position, note, selected_text, created_at, chapter_id')
        .eq('student_id', studentId)
        .eq('text_id', textId)
        .order('created_at', { ascending: false })
        .limit(50)
      setBookmarks((data as Bookmark[]) ?? [])
    } catch { /* sessiz */ }
    finally { setLoading(false) }
  }, [textId, studentId])

  useEffect(() => {
    if (visible) {
      loadBookmarks()
      setTab('list')
      setNoteText('')
    }
  }, [visible, loadBookmarks])

  // Yeni yer imi / not kaydet
  const handleSave = useCallback(async () => {
    if (!textId || !studentId) return
    if (addType === 'note' && noteText.trim().length === 0) return
    setSaving(true)
    try {
      await (supabase as any).from('text_bookmarks').insert({
        student_id:    studentId,
        text_id:       textId,
        chapter_id:    currentChapterId,
        position:      currentPosition,
        note:          addType === 'note' ? noteText.trim() : null,
        type:          addType,
      })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setNoteText('')
      setTab('list')
      loadBookmarks()
    } catch { /* sessiz */ }
    finally { setSaving(false) }
  }, [textId, studentId, currentChapterId, currentPosition, addType, noteText, loadBookmarks])

  // Yer imi sil
  const handleDelete = useCallback((id: string) => {
    Alert.alert('Sil', 'Bu yer imini silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await (supabase as any).from('text_bookmarks').delete().eq('id', id)
          setBookmarks(prev => prev.filter(b => b.id !== id))
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        } catch { /* sessiz */ }
      }},
    ])
  }, [])

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.root}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >

          {/* ── Başlık ──────────────────────────────────── */}
          <View style={s.header}>
            <Text style={s.title}>🔖 Yer İmleri & Notlar</Text>
            <TouchableOpacity onPress={onClose}
              style={s.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Tab Seç ─────────────────────────────────── */}
          <View style={s.tabRow}>
            <TouchableOpacity
              style={[s.tab, tab === 'list' && s.tabActive]}
              onPress={() => setTab('list')}
            >
              <Text style={[s.tabTxt, tab === 'list' && s.tabTxtActive]}>
                Listele ({bookmarks.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, tab === 'add' && s.tabActive]}
              onPress={() => setTab('add')}
            >
              <Text style={[s.tabTxt, tab === 'add' && s.tabTxtActive]}>+ Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* ── Listele ─────────────────────────────────── */}
          {tab === 'list' && (
            <ScrollView contentContainerStyle={s.list}>
              {loading && (
                <Text style={s.emptyTxt}>Yükleniyor…</Text>
              )}
              {!loading && bookmarks.length === 0 && (
                <View style={s.emptyBox}>
                  <Text style={{ fontSize: 40 }}>🔖</Text>
                  <Text style={s.emptyTxt}>Henüz yer imi yok</Text>
                  <Text style={[s.emptyTxt, { fontSize: 12, marginTop: 4 }]}>
                    Okurken "+ Ekle" ile yer imi bırakabilirsin
                  </Text>
                </View>
              )}
              {bookmarks.map(bm => (
                <View key={bm.id} style={s.bmCard}>
                  <View style={s.bmTop}>
                    <View style={s.bmTypeBadge}>
                      <Text style={{ fontSize: 14 }}>{typeIcon(bm.type)}</Text>
                      <Text style={s.bmTypeLabel}>{typeLabel(bm.type)}</Text>
                    </View>
                    <Text style={s.bmDate}>{fmtDate(bm.created_at)}</Text>
                    <TouchableOpacity onPress={() => handleDelete(bm.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={s.deleteBtn}>🗑</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={s.bmPos}>%{Math.round(bm.position * 100)} konumunda</Text>

                  {bm.note != null && bm.note.length > 0 && (
                    <Text style={s.bmNote}>{bm.note}</Text>
                  )}
                  {bm.selected_text != null && bm.selected_text.length > 0 && (
                    <Text style={s.bmHighlight} numberOfLines={3}>
                      "{bm.selected_text}"
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          {/* ── Ekle ────────────────────────────────────── */}
          {tab === 'add' && (
            <ScrollView contentContainerStyle={s.addBox}>
              {/* Tip seçici */}
              <View style={s.typeRow}>
                {(['bookmark', 'note'] as const).map(tp => (
                  <TouchableOpacity
                    key={tp}
                    style={[s.typeBtn, addType === tp && { backgroundColor: t.colors.primary }]}
                    onPress={() => setAddType(tp)}
                  >
                    <Text style={{ fontSize: 18 }}>{typeIcon(tp)}</Text>
                    <Text style={[s.typeBtnTxt, addType === tp && { color: '#fff' }]}>
                      {typeLabel(tp)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Konum bilgisi */}
              <View style={s.posRow}>
                <Text style={s.posLabel}>📍 Mevcut konum:</Text>
                <Text style={[s.posLabel, { color: t.colors.primary, fontWeight: '700' }]}>
                  %{Math.round(currentPosition * 100)}
                </Text>
              </View>

              {/* Not alanı */}
              {addType === 'note' && (
                <TextInput
                  style={s.noteInput}
                  placeholder="Notunu buraya yaz…"
                  placeholderTextColor={t.colors.textHint}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                />
              )}

              {/* Kaydet */}
              <TouchableOpacity
                style={[s.saveBtn, (saving || (addType === 'note' && noteText.trim().length === 0))
                  && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={saving || (addType === 'note' && noteText.trim().length === 0)}
              >
                <Text style={s.saveBtnTxt}>
                  {saving ? 'Kaydediliyor…' : `${typeIcon(addType)} Kaydet`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },
    header: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.border,
    },
    title: { fontSize: t.font.md, fontWeight: '800', color: t.colors.text },
    closeBtn: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: t.colors.surfaceSub,
      alignItems: 'center', justifyContent: 'center',
    },
    closeTxt: { fontSize: 14, color: t.colors.textHint, fontWeight: '700' },

    tabRow: {
      flexDirection: 'row',
      paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    },
    tab: {
      flex: 1, paddingVertical: 10, borderRadius: 10,
      alignItems: 'center',
      backgroundColor: t.colors.surfaceSub,
    },
    tabActive: { backgroundColor: t.colors.primary },
    tabTxt: { fontSize: t.font.sm, fontWeight: '700', color: t.colors.textSub },
    tabTxtActive: { color: '#fff' },

    list: { padding: 16, gap: 12, paddingBottom: 40 },
    emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyTxt: { fontSize: t.font.sm, color: t.colors.textHint, textAlign: 'center' },

    bmCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.md, padding: 14, gap: 6,
      borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
    },
    bmTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bmTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    bmTypeLabel: { fontSize: t.font.xs, fontWeight: '700', color: t.colors.textSub },
    bmDate: { flex: 1, fontSize: t.font.xs, color: t.colors.textHint, textAlign: 'right' },
    deleteBtn: { fontSize: 14 },
    bmPos: { fontSize: t.font.xs, color: t.colors.textHint },
    bmNote: { fontSize: t.font.sm, color: t.colors.text, lineHeight: 20 },
    bmHighlight: {
      fontSize: t.font.sm, color: t.colors.textSub, lineHeight: 20,
      fontStyle: 'italic',
      borderLeftWidth: 3, borderLeftColor: t.colors.primary,
      paddingLeft: 8,
    },

    addBox: { padding: 20, gap: 16, paddingBottom: 40 },
    typeRow: { flexDirection: 'row', gap: 10 },
    typeBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 12, borderRadius: 12,
      backgroundColor: t.colors.surfaceSub,
      borderWidth: 1, borderColor: t.colors.border,
    },
    typeBtnTxt: { fontSize: t.font.sm, fontWeight: '700', color: t.colors.text },

    posRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    posLabel: { fontSize: t.font.sm, color: t.colors.textHint },

    noteInput: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.md, padding: 14,
      borderWidth: 1, borderColor: t.colors.border,
      fontSize: t.font.sm, color: t.colors.text,
      minHeight: 120,
    },
    saveBtn: {
      backgroundColor: t.colors.primary,
      borderRadius: t.radius.md, paddingVertical: 18,
      alignItems: 'center',
    },
    saveBtnTxt: { fontSize: t.font.md, fontWeight: '800', color: '#fff' },
  })
}
