import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

interface Props {
  text: string
  role: 'ai' | 'user'
  time?: string
  emoji?: string
}

export function ChatBubble({ text, role, time, emoji }: Props) {
  const isAI = role === 'ai'
  return (
    <View style={[styles.row, isAI ? styles.rowLeft : styles.rowRight]}>
      {isAI && (
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
      )}
      <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
        {emoji && <Text style={styles.bubbleEmoji}>{emoji}</Text>}
        <Text style={[styles.text, isAI ? styles.textAI : styles.textUser]}>{text}</Text>
        {time && <Text style={styles.time}>{time}</Text>}
        {/* WhatsApp tarzı köşe üçgeni */}
        <View style={[styles.tail, isAI ? styles.tailLeft : styles.tailRight]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12 },
  rowLeft: { justifyContent: 'flex-start', alignItems: 'flex-end' },
  rowRight: { justifyContent: 'flex-end' },

  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, marginBottom: 4,
  },
  avatarEmoji: { fontSize: 16 },

  bubble: {
    maxWidth: '78%', borderRadius: theme.radius.bubble,
    paddingHorizontal: 14, paddingVertical: 10,
    position: 'relative',
  },
  bubbleAI: {
    backgroundColor: theme.colors.bubbleIn,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  bubbleUser: {
    backgroundColor: theme.colors.bubbleOut,
    borderBottomRightRadius: 4,
  },

  bubbleEmoji: { fontSize: 22, marginBottom: 4 },
  text: { fontSize: theme.font.md, lineHeight: 20 },
  textAI: { color: theme.colors.text },
  textUser: { color: '#E9F6EE' },
  time: {
    fontSize: 10, color: theme.colors.textHint,
    alignSelf: 'flex-end', marginTop: 4,
  },

  tail: { position: 'absolute', bottom: 0, width: 0, height: 0 },
  tailLeft: {
    left: -6,
    borderTopWidth: 8, borderTopColor: 'transparent',
    borderRightWidth: 8, borderRightColor: theme.colors.bubbleIn,
  },
  tailRight: {
    right: -6,
    borderTopWidth: 8, borderTopColor: 'transparent',
    borderLeftWidth: 8, borderLeftColor: theme.colors.bubbleOut,
  },
})
