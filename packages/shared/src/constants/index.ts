export * from './levels';
export * from './content';

/** @deprecated EXAM_ARP_TARGETS'ı types/engine'den import edin */
export const LEGACY_ARP_TARGETS = {
  LGS: 180,
  TYT: 240,
  AYT: 280,
  KPSS: 290,
} as const

export const SUBSCRIPTION_PLANS = {
  B2C_FREE: { name: 'Ücretsiz', modules: 1, price: 0 },
  B2C_PREMIUM_MONTHLY: { name: 'Premium Aylık', price: 79.99 },
  B2C_PREMIUM_YEARLY: { name: 'Premium Yıllık', price: 599.99 },
  B2B_STARTER: { name: 'Başlangıç', pricePerStudent: 49 },
  B2B_PROFESSIONAL: { name: 'Profesyonel', pricePerStudent: 39 },
  B2B_ENTERPRISE: { name: 'Kurumsal', pricePerStudent: 29 },
} as const

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  STUDENT: 'STUDENT',
} as const

export const APP_URLS = {
  SUPER_ADMIN: 'https://admin.sprinta.app',
  TENANT_ADMIN: 'https://panel.sprinta.app',
} as const
