import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * AdScripts — Muat iklan Popunder & Social Bar hanya untuk pengguna non-PRO.
 * Script dimuat secara dinamis agar bisa dikontrol berdasarkan status langganan.
 */
export function AdScripts() {
  const { isPro } = useAuth();

  useEffect(() => {
    // Jangan muat iklan untuk pengguna PRO (bebas iklan)
    if (isPro) return;

    const scripts: HTMLScriptElement[] = [];

    const addScript = (src: string) => {
      const script = document.createElement('script');
      script.setAttribute('data-cfasync', 'false');
      script.src = src;
      script.async = false;
      document.head.appendChild(script);
      scripts.push(script);
    };

    // Popunder
    addScript('https://afders.org/1/249f44445acb776c0355ed1d59ad6c7a');

    // Social Bar
    addScript('https://bicea.org/14/b8c9323ac23aacba04b95fa515119375');

    // Cleanup saat komponen unmount (opsional, karena ad scripts biasanya persist)
    return () => {
      scripts.forEach((s) => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
    };
  }, [isPro]);

  return null;
}
