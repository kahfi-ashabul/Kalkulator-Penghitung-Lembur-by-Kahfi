import React from 'react';
import { LayoutDashboard, Calculator, Banknote, History, Scale, Settings, Sparkles, Volume2, VolumeX, Sun, Moon, User, Heart } from 'lucide-react';

export type ScreenType = 'dashboard' | 'kalkulator' | 'gaji' | 'riwayat';

interface NavigationProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  onOpenLegal: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenSupport: () => void;
  audioFeedback: boolean;
  onToggleAudio: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalEntriesCount: number;
  namaKaryawan?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onSelectScreen,
  onOpenLegal,
  onOpenSettings,
  onOpenProfile,
  onOpenSupport,
  audioFeedback,
  onToggleAudio,
  theme,
  onToggleTheme,
  totalEntriesCount,
  namaKaryawan,
}) => {
  const navItems: Array<{ id: ScreenType; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'kalkulator',
      label: 'Hitung Lembur',
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      id: 'gaji',
      label: 'Hitung Gaji',
      icon: <Banknote className="w-4 h-4" />,
    },
    {
      id: 'riwayat',
      label: 'Riwayat',
      icon: <History className="w-4 h-4" />,
      badge: totalEntriesCount,
    },
  ];

  return (
    <>
      {/* Top Deck Bar (Desktop & Tablet) */}
      <header className="sticky top-0 z-40 w-full bg-[#0A0A12]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div
            onClick={() => onSelectScreen('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded bg-[#161626] border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.3)] group-hover:border-[#00F0FF] transition-all">
              <Sparkles className="w-5 h-5 text-[#00F0FF] group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[#0F172A] dark:text-white text-base sm:text-lg tracking-tight font-heading drop-shadow-xs">
                  Kalkulator Penghitung Lembur
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#9333EA] dark:bg-[#7928CA] text-white border border-[#9333EA]/40 dark:border-purple-500/50 shadow-sm shrink-0">
                  by Kahfi
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#334155] dark:text-[#b9cacb] font-mono font-semibold">
                <span className="text-[#16A34A] dark:text-[#39FF14]">●</span>
                <span className="text-[#0F172A] dark:text-white font-bold">PP 35/2021 COMPLIANT</span>
                <span className="hidden md:inline text-[#64748B] dark:text-white/30">|</span>
                <span className="hidden md:inline text-[#475569] dark:text-[#b9cacb]">Labor Engine v1.1</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#12121F] p-1 rounded-lg border border-white/10" role="tablist">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectScreen(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all select-none ${
                    isActive
                      ? 'bg-[#1A1A2E] text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)] border border-[#00F0FF]/40'
                      : 'text-[#b9cacb] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_8px_#00F0FF]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Utilities - Simetris, Rapi, Seimbang & Seragam Tinggi */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Tombol Support / Traktir Kopi QRIS */}
            <button
              onClick={onOpenSupport}
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-[#EC4899]/15 border border-[#EC4899]/40 hover:border-[#EC4899] text-[#EC4899] hover:bg-[#EC4899]/25 text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(236,72,153,0.2)] flex items-center gap-1.5 shrink-0"
              title="Dukung pembuat aplikasi (QRIS Donasi)"
            >
              <Heart className="w-3.5 h-3.5 fill-[#EC4899] shrink-0" />
              <span className="hidden sm:inline">Support</span>
            </button>

            {/* Tombol Dasar Hukum */}
            <button
              onClick={onOpenLegal}
              className="h-9 px-3 rounded-lg bg-[#161626] border border-[#FFE600]/30 hover:border-[#FFE600] text-[#FFE600] text-xs font-mono font-bold transition-all shadow-[0_0_8px_rgba(255,230,0,0.15)] flex items-center gap-1.5"
              title="Baca rujukan PP No. 35 Tahun 2021"
            >
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Dasar Hukum</span>
            </button>

            {/* Menu Profil Karyawan Cepat */}
            <button
              onClick={onOpenProfile}
              className="h-9 px-3 rounded-lg bg-[#161626] border border-[#00F0FF]/30 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-xs font-mono font-bold transition-all group flex items-center gap-2 shadow-[0_0_8px_rgba(0,240,255,0.15)]"
              title={`Profil Karyawan: ${namaKaryawan || 'Klik untuk ubah data profil'}`}
            >
              <div className="w-5 h-5 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/50 flex items-center justify-center text-[#00F0FF] group-hover:scale-110 transition-transform shrink-0">
                <User className="w-3 h-3" />
              </div>
              <span className="hidden sm:inline max-w-[110px] md:max-w-[140px] truncate text-[11px] font-bold text-white group-hover:text-[#00F0FF]">
                {namaKaryawan || 'Profil'}
              </span>
            </button>

            {/* Divider Halus */}
            <div className="hidden sm:block w-[1px] h-5 bg-white/15 mx-0.5" />

            {/* Tombol Tema (Dark/Light) */}
            <button
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-lg bg-[#161626] border border-white/10 hover:border-[#00F0FF] text-[#00F0FF] flex items-center justify-center transition-all shrink-0"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FFE600]" /> : <Moon className="w-4 h-4 text-[#00F0FF]" />}
            </button>

            {/* Tombol Efek Suara */}
            <button
              onClick={onToggleAudio}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                audioFeedback
                  ? 'bg-[#161626] border-[#00F0FF]/30 text-[#00F0FF] hover:border-[#00F0FF]'
                  : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
              }`}
              title={audioFeedback ? 'Matikan efek suara' : 'Nyalakan efek suara'}
            >
              {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Tombol Pengaturan Aplikasi */}
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-lg bg-[#161626] border border-white/10 hover:border-[#FF2BD6] text-[#b9cacb] hover:text-[#FF2BD6] flex items-center justify-center transition-colors shrink-0"
              title="Pengaturan sistem & preferensi aplikasi"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tactical Bottom Dock */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A12]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 pb-safe"
        role="tablist"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectScreen(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-mono transition-all ${
                  isActive ? 'text-[#00F0FF]' : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
                )}
                <div className={`p-1 rounded ${isActive ? 'text-[#00F0FF]' : ''}`}>
                  {item.icon}
                </div>
                <span className="tracking-tight">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0.5 right-1 px-1 py-0.2 rounded-full text-[9px] bg-[#00F0FF] text-[#0A0A12] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
