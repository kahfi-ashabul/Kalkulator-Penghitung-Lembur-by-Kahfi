/**
 * Ad Manager — Non-aktif permanen (100% Bebas Iklan untuk semua pengguna)
 * Seluruh script iklan pihak ketiga telah dihapus demi privasi, keamanan, dan performa maksimal.
 */

export function canShowAd(): boolean {
  return false;
}

export function triggerPopunder(_isPro: boolean = false): boolean {
  // Tidak ada iklan yang dimuat atau dieksekusi
  return false;
}
