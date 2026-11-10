/**
 * Popunder Ad Manager (Adsterra)
 * - 100% Non-aktif untuk Pengguna PRO
 * - Grace Period: 15 detik pertama sejak web dibuka (tidak ada iklan)
 * - Cooldown: 60 detik jeda antar pemicu iklan
 */

const POPUNDER_SCRIPT_SRC = 'https://afders.org/1/249f44445acb776c0355ed1d59ad6c7a';
const GRACE_PERIOD_MS = 15 * 1000; // 15 detik
const COOLDOWN_MS = 60 * 1000;      // 60 detik

let appStartTime = Date.now();
let lastPopunderTime = 0;

export function triggerPopunder(isPro: boolean = false): boolean {
  // 1. Akun PRO bebas iklan total
  if (isPro) {
    return false;
  }

  const now = Date.now();

  // 2. Grace period di awal (15 detik)
  if (now - appStartTime < GRACE_PERIOD_MS) {
    return false;
  }

  // 3. Cooldown 60 detik
  if (now - lastPopunderTime < COOLDOWN_MS) {
    return false;
  }

  // Pemicu valid: Catat timestamp
  lastPopunderTime = now;

  // Injeksi/jalankan script popunder Adsterra secara dinamis
  try {
    const existing = document.querySelector(`script[data-adsterra="popunder"]`);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-adsterra', 'popunder');
    script.src = POPUNDER_SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
    return true;
  } catch (err) {
    console.warn('Popunder trigger error:', err);
    return false;
  }
}
