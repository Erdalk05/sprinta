// usePremiumGate — Premium erişim kontrolü
// Premium değilse paywall'a yönlendirir.

import { useAuthStore } from '../stores/authStore';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

export function usePremiumGate() {
  const { student } = useAuthStore();
  const router = useRouter();

  function requirePremium(onAllow: () => void) {
    if (student?.isPremium) {
      onAllow();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push('/(modals)/paywall' as Href);
    }
  }

  return { isPremium: student?.isPremium ?? false, requirePremium };
}
