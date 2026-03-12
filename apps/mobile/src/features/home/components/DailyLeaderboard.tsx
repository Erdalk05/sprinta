/**
 * DailyLeaderboard — v4 Modern Design
 * Beyaz kart · Mavi "Sen" satırı · Altın/Gümüş/Bronz madalya
 * Rank artışında bounce · Psikolojik güvenlik
 */
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withSequence, withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useLeaderboardStore } from '../../../stores/leaderboardStore'
import type { LeaderboardUser } from '../../../stores/leaderboardStore'

const BLUE   = '#2D5BE3'
const TEAL   = '#40C8F0'   // İş Bankası accent blue
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F8'
const TEXT   = '#1A1A2E'
const TEXT_H = '#8892A4'
const SOFT   = '#F0F4FF'
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
  user:        LeaderboardUser
  rank:        number
  deltaRank:   number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bounceStyle?: any
}

function LeaderboardRow({ user, rank, deltaRank, bounceStyle }: RowProps) {
  const rc   = rankColor(rank)
  const isMe = user.isCurrentUser
  const isMedal = rank <= 3

  const renderDelta = () => {
    if (deltaRank > 0) {
      return (
        <View style={[rs.deltaPill, rs.pillUp]}>
          <Text style={[rs.deltaTxt, rs.deltaUp]}>↑{deltaRank}</Text>
        </View>
      )
    }
    return (
      <View style={[rs.deltaPill, rs.pillNeutral]}>
        <Text style={[rs.deltaTxt, rs.deltaNeutral]}>→</Text>
      </View>
    )
  }

  const rowEl = (
    <View style={[rs.row, isMe && rs.rowMe]}>
      {/* Rank — madalya emoji veya düz sayı */}
      <View style={rs.rankWrap}>
        {isMedal
          ? <Text style={rs.rankEmoji}>{rankEmoji(rank)}</Text>
          : <Text style={[rs.rankNum, isMe && rs.rankNumMe]}>{rank}</Text>
        }
      </View>

      {/* Avatar — Sen için ⚡, diğerleri baş harf */}
      <View style={[
        rs.avatar,
        isMe
          ? rs.avatarMe
          : { backgroundColor: rc + '22', borderColor: rc + '66' },
      ]}>
        {isMe
          ? <Text style={rs.avatarIcon}>⚡</Text>
          : <Text style={[rs.avatarTxt, { color: rc }]}>{user.initials}</Text>
        }
      </View>

      <Text style={[rs.name, isMe && rs.nameMe]} numberOfLines={1}>{user.name}</Text>
      <Text style={[rs.wpm, isMe && rs.wpmMe]}>{user.todayWPM}</Text>
      <Text style={rs.wpmUnit}>wpm</Text>
      {renderDelta()}
    </View>
  )

  if (isMe && bounceStyle) {
    return <Animated.View style={bounceStyle}>{rowEl}</Animated.View>
  }
  return rowEl
}

const rs = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  rowMe: {
    backgroundColor: 'rgba(45,91,227,0.10)',
    borderWidth: 1.5, borderColor: BLUE,
    borderRadius: 12, marginHorizontal: 4,
  },
  rankWrap:  { width: 28, alignItems: 'center', justifyContent: 'center' },
  rankEmoji: { fontSize: 20 },
  rankNum:   { fontSize: 14, fontWeight: '800', color: TEXT_H },
  rankNumMe: { color: BLUE, fontWeight: '900' },

  avatar: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  avatarMe:  { backgroundColor: BLUE, borderColor: BLUE },
  avatarTxt: { fontSize: 13, fontWeight: '800' },
  avatarIcon:{ fontSize: 18 },
  name:        { flex: 1, fontSize: 13, fontWeight: '600', color: TEXT },
  nameMe:      { fontWeight: '800', color: BLUE },
  wpm:         { fontSize: 15, fontWeight: '800', color: TEXT },
  wpmMe:       { color: BLUE },
  wpmUnit:     { fontSize: 10, color: TEXT_H, marginBottom: 1 },
  deltaPill:   { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  pillUp:      { backgroundColor: 'rgba(0,212,170,0.12)' },
  pillNeutral: { backgroundColor: SOFT },
  deltaTxt:    { fontSize: 11, fontWeight: '700' },
  deltaUp:     { color: TEAL },
  deltaNeutral:{ color: TEXT_H },
})

// ─── Ana Bileşen ──────────────────────────────────────────────────
export function DailyLeaderboard() {
  const { users, currentUserRank, deltaRank } = useLeaderboardStore()

  const topFive   = users.slice(0, 5)
  const isInTop5  = currentUserRank <= 5
  const isDropped = deltaRank < 0

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
      <View style={s.titleRow}>
        <Text style={s.sectionTitle}>🏆 Günlük Sıralama</Text>
        <Text style={s.dateHint}>Bugün</Text>
      </View>

      <View style={s.card}>
        {topFive.map((user, idx) => (
          <React.Fragment key={user.id}>
            <LeaderboardRow
              user={user}
              rank={idx + 1}
              deltaRank={user.isCurrentUser ? deltaRank : user.deltaRank}
              bounceStyle={user.isCurrentUser ? bounceStyle : undefined}
            />
            {idx < topFive.length - 1 && !topFive[idx + 1]?.isCurrentUser && (
              <View style={s.divider} />
            )}
          </React.Fragment>
        ))}

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
const s = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 16 },

  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  dateHint:     { fontSize: 11, color: TEXT_H, fontWeight: '600' },

  card: {
    backgroundColor: CARD,
    borderRadius: 18, paddingVertical: 6,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 3, overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginHorizontal: 14,
  },

  outsideSep: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 14, marginVertical: 4, gap: 6,
  },
  outsideLine: { flex: 1, height: 1, backgroundColor: BORDER },
  outsideTxt:  { fontSize: 12, color: TEXT_H },
  outsideRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, gap: 8,
  },
  outsideRank:    { fontSize: 15, fontWeight: '800', color: BLUE },
  outsideYou:     { fontSize: 13, fontWeight: '700', color: TEXT, flex: 1 },
  outsidePill: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  outsidePillTxt: { fontSize: 12, fontWeight: '700', color: TEAL },

  safetyCard: {
    backgroundColor: SOFT,
    borderRadius: 14, padding: 14, marginTop: 10,
    borderWidth: 1, borderColor: BORDER,
  },
  safetyTxt: { fontSize: 13, color: BLUE, fontWeight: '600', lineHeight: 20 },
})
