/**
 * DailyLeaderboard — Sport Premium · Psikolojik Güvenlik
 * Top-5 · Altın/Gümüş/Bronz · Kullanıcı satırı highlight
 * Rank artışında bounce · Rank düşüşünde kırmızı YOK → teşvik mesajı
 */
import React, { useEffect, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useLeaderboardStore } from '../../../stores/leaderboardStore'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import type { LeaderboardUser } from '../../../stores/leaderboardStore'

// ─── Sabitler ─────────────────────────────────────────────────────
const GOLD   = '#FFD700'
const SILVER = '#B0B8C1'
const BRONZE = '#CD7F32'

function rankColor(rank: number): string {
  if (rank === 1) return GOLD
  if (rank === 2) return SILVER
  if (rank === 3) return BRONZE
  return '#A0ADB8'
}

function rankEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}`
}

// ─── Tek Satır ────────────────────────────────────────────────────
interface RowProps {
  user:      LeaderboardUser
  rank:      number
  deltaRank: number    // sadece current user için anlamlı
  t:         AppTheme
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bounceStyle?: any
}

function LeaderboardRow({ user, rank, deltaRank, t, bounceStyle }: RowProps) {
  const s    = useMemo(() => rowStyles(t), [t])
  const rc   = rankColor(rank)
  const isMe = user.isCurrentUser

  // Delta badge — psikolojik güvenlik: aşağı giderse yeşil/nötr, kırmızı yok
  const renderDelta = () => {
    if (deltaRank > 0) {
      return (
        <View style={[s.deltaPill, s.pillUp]}>
          <Text style={[s.deltaTxt, s.deltaUp]}>↑{deltaRank}</Text>
        </View>
      )
    }
    if (deltaRank === 0) {
      return (
        <View style={[s.deltaPill, s.pillNeutral]}>
          <Text style={[s.deltaTxt, s.deltaNeutral]}>→</Text>
        </View>
      )
    }
    // Düşüş → psikolojik güvenlik: nötr göster
    return (
      <View style={[s.deltaPill, s.pillNeutral]}>
        <Text style={[s.deltaTxt, s.deltaNeutral]}>→</Text>
      </View>
    )
  }

  const rowEl = (
    <View style={[
      s.row,
      isMe && s.rowMe,
    ]}>
      {/* Rank */}
      <View style={[s.rankCircle, { borderColor: rc }]}>
        <Text style={[s.rankTxt, { color: rc }]}>{rankEmoji(rank)}</Text>
      </View>

      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: rc + '22', borderColor: rc + '66' }]}>
        <Text style={[s.avatarTxt, { color: rc }]}>{user.initials}</Text>
      </View>

      {/* İsim */}
      <Text style={[s.name, isMe && s.nameMe]} numberOfLines={1}>{user.name}</Text>

      {/* WPM */}
      <Text style={[s.wpm, isMe && s.wpmMe]}>{user.todayWPM}</Text>
      <Text style={s.wpmUnit}>wpm</Text>

      {/* Delta */}
      {renderDelta()}
    </View>
  )

  if (isMe && bounceStyle) {
    return <Animated.View style={bounceStyle}>{rowEl}</Animated.View>
  }
  return rowEl
}

function rowStyles(t: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection:  'row',
      alignItems:     'center',
      paddingHorizontal: 14,
      paddingVertical:   10,
      gap:            8,
    },
    rowMe: {
      backgroundColor: t.colors.energyLight,
      borderWidth:     1.5,
      borderColor:     t.colors.energyGreen,
      borderRadius:    12,
      marginHorizontal: 4,
    },

    rankCircle: {
      width:       28,
      height:      28,
      borderRadius: 14,
      borderWidth:  1.5,
      alignItems:   'center',
      justifyContent: 'center',
    },
    rankTxt: { fontSize: 11, fontWeight: '800' },

    avatar: {
      width:       34,
      height:      34,
      borderRadius: 17,
      borderWidth:  1.5,
      alignItems:  'center',
      justifyContent: 'center',
    },
    avatarTxt: { fontSize: 12, fontWeight: '800' },

    name:   { flex: 1, fontSize: 13, fontWeight: '600', color: t.colors.text },
    nameMe: { fontWeight: '800', color: t.colors.deepGreen },

    wpm:     { fontSize: 15, fontWeight: '800', color: t.colors.text },
    wpmMe:   { color: t.colors.deepGreen },
    wpmUnit: { fontSize: 10, color: t.colors.textHint, marginBottom: 1 },

    deltaPill:   { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
    pillUp:      { backgroundColor: 'rgba(0,200,83,0.15)' },
    pillNeutral: { backgroundColor: t.colors.sportSoft },
    deltaTxt:    { fontSize: 11, fontWeight: '700' },
    deltaUp:     { color: '#00C853' },
    deltaNeutral:{ color: t.colors.textHint },
  })
}

// ─── Ana Bileşen ─────────────────────────────────────────────────
export function DailyLeaderboard() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const { users, currentUserRank, deltaRank } = useLeaderboardStore()

  const topFive    = users.slice(0, 5)
  const isInTop5   = currentUserRank <= 5
  const isDropped  = deltaRank < 0

  // ── Bounce animasyonu — rank artışında ──────────────────────────
  const bounceY = useSharedValue(0)
  useEffect(() => {
    if (deltaRank > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      bounceY.value = withSequence(
        withSpring(-7,  { damping: 5,  stiffness: 350 }),
        withSpring(0,   { damping: 10, stiffness: 200 }),
      )
    }
  }, [deltaRank])

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceY.value }],
  }))

  return (
    <View style={s.wrap}>
      {/* Başlık */}
      <View style={s.titleRow}>
        <Text style={s.sectionTitle}>🏆 Günlük Sıralama</Text>
        <Text style={s.dateHint}>Bugün</Text>
      </View>

      {/* Kart */}
      <View style={s.card}>
        {topFive.map((user, idx) => (
          <React.Fragment key={user.id}>
            <LeaderboardRow
              user={user}
              rank={idx + 1}
              deltaRank={user.isCurrentUser ? deltaRank : user.deltaRank}
              t={t}
              bounceStyle={user.isCurrentUser ? bounceStyle : undefined}
            />
            {/* Ayırıcı (son hariç) */}
            {idx < topFive.length - 1 && !topFive[idx + 1]?.isCurrentUser && (
              <View style={s.divider} />
            )}
          </React.Fragment>
        ))}

        {/* Kullanıcı top-5 dışındaysa */}
        {!isInTop5 && (
          <>
            <View style={s.outsideSep}>
              <View style={s.outsideLine} />
              <Text style={s.outsideTxt}>···</Text>
              <View style={s.outsideLine} />
            </View>
            <View style={s.outsideRow}>
              <Text style={s.outsideRank}>#{currentUserRank}</Text>
              <Text style={s.outsideYou}>Sen</Text>
              {deltaRank > 0 && (
                <View style={s.outsidePill}>
                  <Text style={s.outsidePillTxt}>↑{deltaRank}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Psikolojik güvenlik mesajı — sadece rank düştüğünde */}
      {isDropped && (
        <View style={s.safetyCard}>
          <Text style={s.safetyTxt}>
            💪 Bugün biraz geridesin. 2 dakikalık antrenmanla öne geçebilirsin.
          </Text>
        </View>
      )}
    </View>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    wrap: { marginHorizontal: 16, marginTop: 16 },

    titleRow: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   10,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: t.colors.text },
    dateHint:     { fontSize: 11, color: t.colors.textHint, fontWeight: '600' },

    card: {
      backgroundColor: t.colors.sportCard,
      borderRadius:    18,
      paddingVertical:  6,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 2 },
      shadowOpacity:   0.08,
      shadowRadius:    8,
      elevation:       3,
      overflow:        'hidden',
    },

    divider: {
      height:          StyleSheet.hairlineWidth,
      backgroundColor: t.colors.border,
      marginHorizontal: 14,
    },

    // Kullanıcı top-5 dışı
    outsideSep: {
      flexDirection: 'row',
      alignItems:    'center',
      marginHorizontal: 14,
      marginVertical: 4,
      gap: 6,
    },
    outsideLine: { flex: 1, height: 1, backgroundColor: t.colors.border },
    outsideTxt:  { fontSize: 12, color: t.colors.textHint },

    outsideRow: {
      flexDirection: 'row',
      alignItems:    'center',
      paddingHorizontal: 14,
      paddingVertical:    8,
      gap: 8,
    },
    outsideRank: { fontSize: 15, fontWeight: '800', color: t.colors.deepGreen },
    outsideYou:  { fontSize: 13, fontWeight: '700', color: t.colors.text, flex: 1 },
    outsidePill: {
      backgroundColor: t.colors.energyLight,
      borderRadius:    8,
      paddingHorizontal: 8,
      paddingVertical:   3,
    },
    outsidePillTxt: { fontSize: 12, fontWeight: '700', color: t.colors.energyGreen },

    // Psikolojik güvenlik
    safetyCard: {
      backgroundColor: t.colors.sportSoft,
      borderRadius:    14,
      padding:         14,
      marginTop:       10,
      borderWidth:     1,
      borderColor:     t.colors.border,
    },
    safetyTxt: {
      fontSize:   13,
      color:      t.colors.deepGreen,
      fontWeight: '600',
      lineHeight: 20,
    },
  })
}
