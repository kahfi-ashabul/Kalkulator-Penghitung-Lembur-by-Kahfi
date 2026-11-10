/**
 * Popunder Ad Manager (Adsterra)
 * - 100% Non-aktif untuk Pengguna PRO
 * - Grace Period: 15 detik pertama sejak sesi web dimulai (tidak ada iklan)
 * - Cooldown: 60 detik ketat antar kemunculan iklan (tersimpan persisten di localStorage)
 * - Interceptor bawaan: Mencegah script pihak ketiga membuka popup jika cooldown 60 detik belum habis.
 */

const POPUNDER_SCRIPT_SRC = 'https://afders.org/1/249f44445acb776c0355ed1d59ad6c7a';
const GRACE_PERIOD_MS = 15 * 1000; // 15 detik
const COOLDOWN_MS = 60 * 1000;      // 60 detik

const STORAGE_KEY_LAST_AD = 'kei_last_popunder_time';
const SESSION_KEY_START = 'kei_session_start_time';

// Inisialisasi session start time jika belum tercatat di tab ini
if (typeof window !== 'undefined') {
  if (!sessionStorage.getItem(SESSION_KEY_START)) {
    sessionStorage.setItem(SESSION_KEY_START, Date.now().toString());
  }

  // Interceptor global window.open untuk memastikan iklan Adsterra patuh pada cooldown 60 detik
  const originalOpen = window.open;
  window.open = function (url?: string | URL, target?: string, features?: string): Window | null {
    const urlStr = url ? url.toString() : '';

    // 1. Izinkan selalu WhatsApp dan navigasi internal aplikasi
    if (
      urlStr.includes('whatsapp.com') ||
      urlStr.includes('wa.me') ||
      urlStr.includes(window.location.hostname) ||
      urlStr.startsWith('/') ||
      urlStr.startsWith('blob:')
    ) {
      return originalOpen.call(window, url, target, features);
    }

    // 2. Cek apakah pengguna adalah PRO
    const isPro = (window as any).__KEI_IS_PRO === true;
    if (isPro) {
      return null;
    }

    const now = Date.now();
    const sessionStart = parseInt(sessionStorage.getItem(SESSION_KEY_START) || '0', 10) || now;
    const lastAd = parseInt(localStorage.getItem(STORAGE_KEY_LAST_AD) || '0', 10) || 0;

    // 3. Grace period 15 detik di awal sesi
    if (now - sessionStart < GRACE_PERIOD_MS) {
      return null;
    }

    // 4. Cooldown ketat 60 detik
    if (now - lastAd < COOLDOWN_MS) {
      return null;
    }

    // Pemicu valid: Catat waktu tayang iklan ke localStorage
    localStorage.setItem(STORAGE_KEY_LAST_AD, now.toString());
    return originalOpen.call(window, url, target, features);
  };

  // Interceptor event klik tautan iklan di fase capture sebelum script iklan mengeksekusi
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor || !anchor.href) return;

      const href = anchor.href;
      // Jangan cegat link WhatsApp atau link internal
      if (
        href.includes('whatsapp.com') ||
        href.includes('wa.me') ||
        href.includes(window.location.hostname) ||
        href.startsWith('/') ||
        href.startsWith('blob:')
      ) {
        return;
      }

      const isPro = (window as any).__KEI_IS_PRO === true;
      const now = Date.now();
      const sessionStart = parseInt(sessionStorage.getItem(SESSION_KEY_START) || '0', 10) || now;
      const lastAd = parseInt(localStorage.getItem(STORAGE_KEY_LAST_AD) || '0', 10) || 0;

      // Blokir jika PRO, atau masih dalam grace period 15s, atau cooldown 60s belum lewat
      if (isPro || now - sessionStart < GRACE_PERIOD_MS || now - lastAd < COOLDOWN_MS) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Catat waktu iklan
      localStorage.setItem(STORAGE_KEY_LAST_AD, now.toString());
    },
    true
  );
}

export function triggerPopunder(isPro: boolean = false): boolean {
  if (typeof window !== 'undefined') {
    (window as any).__KEI_IS_PRO = isPro;
  }

  // 1. Akun PRO bebas iklan total
  if (isPro) {
    return false;
  }

  const now = Date.now();
  const sessionStart =
    typeof window !== 'undefined'
      ? parseInt(sessionStorage.getItem(SESSION_KEY_START) || '0', 10) || now
      : now;
  const lastAd =
    typeof window !== 'undefined'
      ? parseInt(localStorage.getItem(STORAGE_KEY_LAST_AD) || '0', 10) || 0
      : 0;

  // 2. Grace period di awal (15 detik)
  if (now - sessionStart < GRACE_PERIOD_MS) {
    return false;
  }

  // 3. Cooldown 60 detik ketat
  if (now - lastAd < COOLDOWN_MS) {
    return false;
  }

  // Pemicu valid: Catat timestamp ke localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_LAST_AD, now.toString());
  }

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
