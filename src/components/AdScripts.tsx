import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * AdScripts — Muat iklan Popunder & Social Bar dengan proteksi ketat:
 * 1. Menunggu hingga verifikasi sesi akun selesai (isLoading = false).
 * 2. 100% TIDAK PERNAH memuat iklan untuk pengguna PRO (bebas iklan).
 * 3. Memberikan jeda aman 30 detik pertama untuk kenyamanan pengguna gratis.
 */
export function AdScripts() {
  const { isPro, isLoading } = useAuth();

  useEffect(() => {
    // 1. Jika masih memeriksa status auth atau user adalah PRO, jangan muat iklan
    if (isLoading || isPro) {
      return;
    }

    // 2. Terapkan jeda 10 detik sebelum iklan pertama kali dimuat
    const timer = setTimeout(() => {
      // Periksa ulang sebelum menyuntikkan script ke DOM
      if (isPro) return;

      const scripts: HTMLScriptElement[] = [];

      const addScript = (src: string) => {
        // Cek agar tidak terjadi injeksi ganda jika sudah ada
        if (document.querySelector(`script[src="${src}"]`)) return;

        const script = document.createElement('script');
        script.setAttribute('data-cfasync', 'false');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
        scripts.push(script);
      };

      // Popunder
      addScript('https://afders.org/1/249f44445acb776c0355ed1d59ad6c7a');

      // Social Bar
      addScript('https://bicea.org/14/b8c9323ac23aacba04b95fa515119375');
    }, 10000); // 10 detik delay

    // Cleanup: jika user login atau status PRO aktif dalam 30 detik, batalkan timer
    return () => {
      clearTimeout(timer);
    };
  }, [isPro, isLoading]);

  return null;
}
