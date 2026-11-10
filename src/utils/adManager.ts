/**
 * Popunder Ad Manager (Adsterra)
 * - 100% Non-aktif untuk Pengguna PRO
 * - Grace Period: 60 detik pertama sejak halaman dibuka/direfresh (tidak ada iklan sama sekali)
 * - Cooldown: 60 detik ketat antar kemunculan iklan (tersimpan persisten di localStorage)
 * - Interceptor bawaan: Mencegah script pihak ketiga membuka popup jika grace period atau cooldown 60 detik belum terpenuhi.
 */

const POPUNDER_SCRIPT_SRC = 'https://afders.org/1/249f44445acb776c0355ed1d59ad6c7a';
const GRACE_PERIOD_MS = 60 * 1000; // 60 detik penuh
const COOLDOWN_MS = 60 * 1000;     // 60 detik penuh

const STORAGE_KEY_LAST_AD = 'kei_last_popunder_time';

// Waktu saat halaman dimuat di memori tab ini
const pageLoadedAt = typeof window !== 'undefined' ? Date.now() : 0;

// Flag izin sementara saat triggerPopunder secara sah mengizinkan 1 popunder
let adAuthorizedUntil = 0;

/**
 * Cek apakah penayangan iklan saat ini diizinkan
 */
export function canShowAd(isPro: boolean = false): boolean {
  if (typeof window === 'undefined') return false;

  const proActive = isPro || (window as any).__KEI_IS_PRO === true;
  if (proActive) return false;

  const now = Date.now();

  // 1. Grace Period: Wajib tunggu 60 detik sejak tab dimuat
  if (now - pageLoadedAt < GRACE_PERIOD_MS) {
    return false;
  }

  // 2. Cooldown: Wajib tunggu 60 detik sejak iklan terakhir
  const lastAd = parseInt(localStorage.getItem(STORAGE_KEY_LAST_AD) || '0', 10) || 0;
  if (now - lastAd < COOLDOWN_MS) {
    return false;
  }

  return true;
}

if (typeof window !== 'undefined') {
  // Jika pengunjung baru pertama kali datang, inisialisasi cooldown agar tidak langsung kena iklan
  if (!localStorage.getItem(STORAGE_KEY_LAST_AD)) {
    localStorage.setItem(STORAGE_KEY_LAST_AD, Date.now().toString());
  }

  // Interceptor global window.open untuk memastikan iklan Adsterra patuh pada aturan 60s
  const originalOpen = window.open;
  window.open = function (url?: string | URL, target?: string, features?: string): Window | null {
    const urlStr = url ? url.toString() : '';

    // 1. Izinkan selalu WhatsApp, link internal, atau blob download
    if (
      urlStr.includes('whatsapp.com') ||
      urlStr.includes('wa.me') ||
      urlStr.includes(window.location.hostname) ||
      urlStr.startsWith('/') ||
      urlStr.startsWith('blob:') ||
      urlStr === ''
    ) {
      return originalOpen.call(window, url, target, features);
    }

    // 2. Cek apakah pengguna adalah PRO
    const isPro = (window as any).__KEI_IS_PRO === true;
    if (isPro) {
      return null;
    }

    const now = Date.now();

    // 3. Jika baru saja diotorisasi oleh triggerPopunder dalam jendela 5 detik
    if (now < adAuthorizedUntil) {
      adAuthorizedUntil = 0;
      localStorage.setItem(STORAGE_KEY_LAST_AD, now.toString());
      return originalOpen.call(window, url, target, features);
    }

    // 4. Periksa apakah syarat 60 detik terpenuhi
    if (!canShowAd(isPro)) {
      return null;
    }

    // Pemicu valid: Catat waktu tayang iklan ke localStorage
    localStorage.setItem(STORAGE_KEY_LAST_AD, now.toString());
    return originalOpen.call(window, url, target, features);
  };

  // Interceptor event klik tautan iklan di fase capture
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor || !anchor.href) return;

      const href = anchor.href;
      // Jangan cegat link WhatsApp atau link internal aplikasi
      if (
        href.includes('whatsapp.com') ||
        href.includes('wa.me') ||
        href.includes(window.location.hostname) ||
        href.startsWith('/') ||
        href.startsWith('blob:') ||
        href.startsWith('javascript:') ||
        href === '#' ||
        href === window.location.href
      ) {
        return;
      }

      const isPro = (window as any).__KEI_IS_PRO === true;
      const now = Date.now();

      // Izinkan jika ada otorisasi aktif
      if (now < adAuthorizedUntil) {
        adAuthorizedUntil = 0;
        localStorage.setItem(STORAGE_KEY_LAST_AD, now.toString());
        return;
      }

      // Blokir jika PRO, atau masih dalam grace period 60s, atau cooldown 60s
      if (!canShowAd(isPro)) {
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

/**
 * Pemicu popunder saat user berinteraksi penting (ganti tab, simpan, ekspor)
 */
export function triggerPopunder(isPro: boolean = false): boolean {
  if (typeof window !== 'undefined') {
    (window as any).__KEI_IS_PRO = isPro;
  }

  // Cek apakah memenuhi syarat 60s grace period & 60s cooldown
  if (!canShowAd(isPro)) {
    return false;
  }

  const now = Date.now();
  // Berikan jendela otorisasi 5 detik untuk script popunder membuka jendela
  adAuthorizedUntil = now + 5000;
  localStorage.setItem(STORAGE_KEY_LAST_AD, now.toString());

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
