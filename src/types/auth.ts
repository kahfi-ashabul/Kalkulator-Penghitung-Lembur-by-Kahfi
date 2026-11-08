export interface UserProfile {
  id: string;
  email: string;
  is_pro: boolean;
  expires_at: string | null; // ISO timestamp string
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionPlan = 'monthly' | 'yearly';

export interface PlanDetail {
  id: SubscriptionPlan;
  name: string;
  price: number;
  priceFormatted: string;
  periodDays: number;
  description: string;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanDetail> = {
  monthly: {
    id: 'monthly',
    name: 'Paket Bulanan',
    price: 10000,
    priceFormatted: 'Rp 10.000',
    periodDays: 30,
    description: 'Akses Pro selama 30 hari',
  },
  yearly: {
    id: 'yearly',
    name: 'Paket Tahunan',
    price: 100000,
    priceFormatted: 'Rp 100.000',
    periodDays: 365,
    description: 'Akses Pro 365 hari penuh (Hemat 2 bulan)',
    badge: 'PALING HEMAT',
  },
};

export interface SubscriptionCountdown {
  isExpired: boolean;
  isLifetime?: boolean;
  days: number;
  hours: number;
  minutes: number;
  formatted: string;
}

/**
 * Utilitas untuk menghitung sisa hari dan jam masa aktif berdasarkan kolom expires_at
 */
export function calculateRemainingSubscription(expiresAt?: string | null): SubscriptionCountdown {
  if (!expiresAt) {
    return {
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      formatted: 'Belum Berlangganan',
    };
  }

  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return {
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      formatted: 'Masa Aktif Berakhir',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let formatted = '';
  if (days > 0) {
    formatted = `${days} hari ${hours} jam`;
  } else if (hours > 0) {
    formatted = `${hours} jam ${minutes} menit`;
  } else {
    formatted = `${Math.max(1, minutes)} menit`;
  }

  return {
    isExpired: false,
    days,
    hours,
    minutes,
    formatted,
  };
}
