import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  KVKK_AYDINLATMA_METNI,
  RIZA_METNI_B2C,
  RIZA_METNI_VELI,
} from '@sprinta/shared';

export default function ConsentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ birthYear?: string }>();
  const birthYear = parseInt(params.birthYear ?? '2000');
  const age = new Date().getFullYear() - birthYear;
  const needsParentalConsent = age < 13;
  const isMinor = age < 18;

  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [parentalAccepted, setParentalAccepted] = useState(false);

  function handleContinue() {
    if (!kvkkAccepted) {
      Alert.alert('Gerekli', 'Devam etmek için KVKK metnini kabul etmelisiniz.');
      return;
    }
    if (needsParentalConsent && !parentalAccepted) {
      Alert.alert('Gerekli', '13 yaş altı kayıt için veli onayı zorunludur.');
      return;
    }
    router.push('/(onboarding)/register' as never);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gizlilik ve İzinler</Text>

      {/* 13 Yaş Altı Uyarısı */}
      {needsParentalConsent && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ 13 yaş altı kullanıcılar için veli onayı zorunludur.
            Lütfen bu adımı ebeveynlerinizle birlikte tamamlayın.
          </Text>
        </View>
      )}

      {/* KVKK Metni */}
      <View style={styles.textBox}>
        <ScrollView style={styles.legalText} nestedScrollEnabled>
          <Text style={styles.legalContent}>{KVKK_AYDINLATMA_METNI}</Text>
        </ScrollView>
      </View>

      {/* KVKK Onay */}
      <TouchableOpacity
        style={styles.checkRow}
        onPress={() => setKvkkAccepted(!kvkkAccepted)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, kvkkAccepted && styles.checkboxChecked]}>
          {kvkkAccepted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>{RIZA_METNI_B2C}</Text>
      </TouchableOpacity>

      {/* Veli Onayı (gerekirse) */}
      {needsParentalConsent && (
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setParentalAccepted(!parentalAccepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, parentalAccepted && styles.checkboxChecked]}>
            {parentalAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>{RIZA_METNI_VELI}</Text>
        </TouchableOpacity>
      )}

      {isMinor && !needsParentalConsent && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ 13-18 yaş arası kullanıcı olarak verileriniz özel koruma kapsamındadır.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!kvkkAccepted || (needsParentalConsent && !parentalAccepted))
            && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>Kabul Et ve Devam →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  title: { color: '#F1F5F9', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  warningBox: {
    backgroundColor: '#7C2D12', borderRadius: 12, padding: 16, marginBottom: 16,
  },
  warningText: { color: '#FED7AA', fontSize: 14, lineHeight: 20 },
  textBox: {
    backgroundColor: '#1E293B', borderRadius: 12, marginBottom: 20, overflow: 'hidden',
  },
  legalText: { maxHeight: 200, padding: 16 },
  legalContent: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },
  checkRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: '#475569',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  checkLabel: { color: '#CBD5E1', fontSize: 13, flex: 1, lineHeight: 20 },
  infoBox: {
    backgroundColor: '#1E3A5F', borderRadius: 12, padding: 14, marginBottom: 16,
  },
  infoText: { color: '#93C5FD', fontSize: 13, lineHeight: 18 },
  continueButton: {
    backgroundColor: '#6366F1', borderRadius: 14,
    padding: 16, alignItems: 'center', marginVertical: 24,
  },
  continueButtonDisabled: { opacity: 0.4 },
  continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
