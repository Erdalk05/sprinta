// @sprinta/api — RevenueCat B2C Ödeme Servisi

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY = Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!
  : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!;

export const PurchasesService = {
  async initialize(userId: string) {
    await Purchases.configure({ apiKey: API_KEY });
    await Purchases.logIn(userId);
  },

  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? [];
    } catch {
      return [];
    }
  },

  async purchase(pkg: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { success: true, customerInfo };
    } catch (err: unknown) {
      const e = err as { userCancelled?: boolean; message?: string };
      if (e.userCancelled) return { success: false, error: 'cancelled' };
      return { success: false, error: e.message ?? 'Satın alma başarısız' };
    }
  },

  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, customerInfo };
    } catch (err: unknown) {
      return { success: false, error: String(err) };
    }
  },

  async isPremium(): Promise<boolean> {
    try {
      const info = await Purchases.getCustomerInfo();
      return info.entitlements.active['premium'] !== undefined;
    } catch {
      return false;
    }
  },
};
