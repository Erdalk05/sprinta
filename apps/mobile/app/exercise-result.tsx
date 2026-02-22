import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function ExerciseResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    arp: string;
    xpEarned: string;
    arpChange: string;
    fatigueLevel: string;
    shouldBreak: string;
    newBadges?: string;
  }>();

  const arp = parseInt(params.arp ?? '0');
  const xpEarned = parseInt(params.xpEarned ?? '0');
  const arpChange = parseFloat(params.arpChange ?? '0');
  const fatigueLevel = params.fatigueLevel ?? 'fresh';
  const shouldBreak = params.shouldBreak === 'true';
  const newBadges: string[] = params.newBadges ? JSON.parse(params.newBadges) : [];

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 100, friction: 5, useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const arpChangeText = arpChange > 0
    ? `↑ +${arpChange.toFixed(0)}`
    : arpChange < 0
    ? `↓ ${arpChange.toFixed(0)}`
    : '→ 0';

  const arpChangeColor = arpChange > 0 ? '#10B981' : arpChange < 0 ? '#EF4444' : '#64748B';

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.arpContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.arpLabel}>ARP</Text>
        <Text style={styles.arpValue}>{arp}</Text>
        <Text style={[styles.arpChange, { color: arpChangeColor }]}>{arpChangeText}</Text>
      </Animated.View>

      <Animated.View style={[styles.xpBanner, { opacity: fadeAnim }]}>
        <Text style={styles.xpText}>+{xpEarned} XP 🎉</Text>
      </Animated.View>

      {newBadges.length > 0 && (
        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>🏆 Yeni Rozet!</Text>
          {newBadges.map((badge, i) => (
            <Text key={i} style={styles.badgeName}>{badge}</Text>
          ))}
        </View>
      )}

      {shouldBreak && (
        <View style={styles.breakWarning}>
          <Text style={styles.breakTitle}>😴 Mola Zamanı</Text>
          <Text style={styles.breakDesc}>
            {fatigueLevel === 'exhausted'
              ? '30 dakika mola ver, performansın çok düştü.'
              : '15 dakika dinlen, çok daha verimli olursun.'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.back()}
      >
        <Text style={styles.nextButtonText}>
          {shouldBreak ? '💤 Mola Ver' : '▶ Devam Et'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  arpContainer: {
    alignItems: 'center', justifyContent: 'center',
    marginTop: 80, marginBottom: 24,
  },
  arpLabel: { color: '#64748B', fontSize: 16, fontWeight: '600', letterSpacing: 2 },
  arpValue: { color: '#6366F1', fontSize: 80, fontWeight: '900', lineHeight: 90 },
  arpChange: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  xpBanner: {
    backgroundColor: '#312E81', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 16,
  },
  xpText: { color: '#A5B4FC', fontSize: 22, fontWeight: '700' },
  badgesContainer: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 16,
    alignItems: 'center',
  },
  badgesTitle: { color: '#F59E0B', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  badgeName: { color: '#F1F5F9', fontSize: 16, marginBottom: 4 },
  breakWarning: {
    backgroundColor: '#7C2D12', borderRadius: 16, padding: 20, marginBottom: 16,
  },
  breakTitle: { color: '#FED7AA', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  breakDesc: { color: '#FCA5A5', fontSize: 15, lineHeight: 22 },
  nextButton: {
    backgroundColor: '#6366F1', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  homeButton: {
    borderWidth: 1, borderColor: '#334155', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 40,
  },
  homeButtonText: { color: '#64748B', fontSize: 15 },
});
