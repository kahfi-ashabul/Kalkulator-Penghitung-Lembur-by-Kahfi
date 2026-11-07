import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  BookOpen, 
  AlertTriangle,
  Trash2,
  AlertOctagon,
  SlidersHorizontal,
  ShieldCheck
} from 'lucide-react';
import { UserSettings } from '../../types/overtime';
import { defaultSettings } from '../../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onOpenGuide: () => void;
  onResetAllData?: () => void;
  onClearEntries?: () => void;
  onClearAttendance?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenGuide,
  onResetAllData,
  onClearEntries,
  onClearAttendance,
}) => {
  const [defaultSistem, setDefaultSistem] = useState(settings.defaultSistem);
  const [audioFeedback, setAudioFeedback] = useState(settings.audioFeedback);
  const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme || 'dark');
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(settings.showOnboardingGuide ?? true);
  const [enableMaxOvertimeAlert, setEnableMaxOvertimeAlert] = useState(settings.enableMaxOvertimeAlert ?? true);
  const [modeAbsensi, setModeAbsensi] = useState<'manual' | 'otomatis'>(settings.modeAbsensi || 'manual');
  
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClearEntries, setShowConfirmClearEntries] = useState(false);
  const [showConfirmClearAttendance, setShowConfirmClearAttendance] = useState(false);

  // Sync state dari settings setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setDefaultSistem(settings.defaultSistem);
      setAudioFeedback(settings.audioFeedback);
      setTheme(settings.theme || 'dark');
      setShowOnboardingGuide(settings.showOnboardingGuide ?? true);
      setEnableMaxOvertimeAlert(settings.enableMaxOvertimeAlert ?? true);
      setModeAbsensi(settings.modeAbsensi || 'manual');
      setShowConfirmReset(false);
      setShowConfirmClearEntries(false);
      setShowConfirmClearAttendance(false);
    }
  }, [isOpen, settings]);

  const handleConfirmResetAll = () => {
    if (onResetAllData) {
      onResetAllData();
    }
    setDefaultSistem(defaultSettings.defaultSistem);
    setAudioFeedback(defaultSettings.audioFeedback);
    setTheme(defaultSettings.theme || 'dark');
    setShowOnboardingGuide(defaultSettings.showOnboardingGuide ?? true);
    setEnableMaxOvertimeAlert(defaultSettings.enableMaxOvertimeAlert ?? true);
    setModeAbsensi(defaultSettings.modeAbsensi || 'manual');
    setShowConfirmReset(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      defaultSistem,
      audioFeedback,
      theme,
      showOnboardingGuide,
      enableMaxOvertimeAlert,
      modeAbsensi,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121F] border border-[#00F0FF]/30 rounded-lg shadow-2xl text-[#E4E1ED] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#00F0FF]/20 bg-[#0A0A12]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Pengaturan Sistem & Aplikasi</h3>
              <p className="text-[10px] text-[#b9cacb] font-mono">Preferensi kalkulasi, tampilan & database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono overflow-y-auto flex-1">
          {/* Theme Selector */}
          <div>
            <label className="text-[#b9cacb] mb-1.5 block font-bold">Tema Tampilan Aplikasi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-[#00F0FF] text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                    : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Mode Gelap (Cyber)</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-white border-[#00F0FF] text-[#0A0A12] shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                    : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Mode Terang</span>
              </button>
            </div>
          </div>

          {/* Sistem Kerja */}
          <div>
            <label className="text-[#b9cacb] mb-1 block font-bold">Sistem Hari Kerja Standar Perusahaan</label>
            <select
              value={defaultSistem}
              onChange={(e) => setDefaultSistem(e.target.value as any)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
            >
              <option value="5_hari">5 Hari Kerja (8 Jam/hari, 40 Jam/minggu - Libur Sabtu & Minggu)</option>
              <option value="6_hari">6 Hari Kerja (7 Jam/hari Sen-Jum, 5 Jam Sabtu - Libur Minggu)</option>
            </select>
          </div>

          {/* Mode Pengisian Absensi */}
          <div>
            <label className="text-[#b9cacb] mb-1 block font-bold">Mode Pengisian Absensi Kehadiran</label>
            <select
              value={modeAbsensi}
              onChange={(e) => setModeAbsensi(e.target.value as any)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
            >
              <option value="manual">Manual Masuk (Hanya tampilkan hari yang Anda catat kehadiran)</option>
              <option value="otomatis">Otomatis Masuk (Semua hari kerja otomatis dihitung hadir normal)</option>
            </select>
          </div>

          {/* Preferences Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            {/* Audio Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded bg-[#1A1A2E] border border-white/10 cursor-pointer">
              <span className="flex items-center gap-2 text-white">
                {audioFeedback ? (
                  <Volume2 className="w-4 h-4 text-[#00F0FF]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#7A7A99]" />
                )}
                Efek Suara Sintesis (Audio Feedback)
              </span>
              <input
                type="checkbox"
                checked={audioFeedback}
                onChange={(e) => setAudioFeedback(e.target.checked)}
                className="accent-[#00F0FF] w-4 h-4"
              />
            </label>

            {/* Overtime Limit Alert Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded bg-[#1A1A2E] border border-white/10 cursor-pointer">
              <span className="flex items-center gap-2 text-white">
                <AlertTriangle className="w-4 h-4 text-[#FFE600]" />
                Peringatan Batas Maksimal Lembur PP 35/2021 (4j/hari, 18j/minggu)
              </span>
              <input
                type="checkbox"
                checked={enableMaxOvertimeAlert}
                onChange={(e) => setEnableMaxOvertimeAlert(e.target.checked)}
                className="accent-[#00F0FF] w-4 h-4"
              />
            </label>

            {/* Onboarding Guide Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded bg-[#1A1A2E] border border-white/10 cursor-pointer">
              <span className="flex items-center gap-2 text-white">
                <BookOpen className="w-4 h-4 text-[#00F0FF]" />
                Tampilkan Panduan Awal Setiap Mulai Aplikasi
              </span>
              <input
                type="checkbox"
                checked={showOnboardingGuide}
                onChange={(e) => setShowOnboardingGuide(e.target.checked)}
                className="accent-[#00F0FF] w-4 h-4"
              />
            </label>
          </div>

          {/* Manual open guide button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGuide();
              }}
              className="w-full py-2 px-3 rounded bg-[#161626] border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10 text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buka Modal Panduan Penggunaan Sekarang</span>
            </button>
          </div>

          {/* Zona Berbahaya: 3 Pilihan Hapus */}
          <div className="pt-2 border-t border-white/10">
            <div className="p-3.5 rounded-lg border border-[#FF0055]/30 bg-[#FF0055]/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#FF0055] font-bold text-xs uppercase tracking-wider">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Zona Berbahaya</span>
                </div>
                <span className="text-[10px] text-[#FF0055]/70 font-mono">Permanent Delete</span>
              </div>
              <p className="text-[11px] text-[#b9cacb] leading-relaxed">
                Pilih data yang ingin dihapus permanen. Semua tindakan <strong className="text-[#FFE600]">tidak dapat dibatalkan</strong>.
              </p>

              {/* Tombol 1: Hapus Catatan Kehadiran */}
              <div className="space-y-1.5">
                {!showConfirmClearAttendance ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmClearAttendance(true)}
                    className="w-full py-2 px-3 rounded bg-[#FF8C00]/10 border border-[#FF8C00]/40 hover:bg-[#FF8C00]/20 text-[#FF8C00] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Catatan Kehadiran Saja</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded bg-[#161626] border border-[#FF8C00] space-y-2 animate-in fade-in duration-200">
                    <p className="text-[11px] text-[#FF8C00] font-bold">
                      Yakin hapus seluruh catatan absensi (masuk/sakit/izin/cuti)? Data lembur tetap aman.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onClearAttendance) onClearAttendance();
                          setShowConfirmClearAttendance(false);
                          onClose();
                        }}
                        className="flex-1 py-1.5 rounded bg-[#FF8C00] text-[#0A0A12] font-bold text-xs hover:bg-[#ffa733]"
                      >
                        Ya, Hapus Kehadiran
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmClearAttendance(false)}
                        className="px-3 py-1.5 rounded bg-white/10 text-white text-xs hover:bg-white/20"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol 2: Hapus Riwayat Lembur */}
              <div className="space-y-1.5">
                {!showConfirmClearEntries ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmClearEntries(true)}
                    className="w-full py-2 px-3 rounded bg-[#FF0055]/10 border border-[#FF0055]/40 hover:bg-[#FF0055]/20 text-[#FF0055] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Riwayat Lembur Saja</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded bg-[#161626] border border-[#FF0055] space-y-2 animate-in fade-in duration-200">
                    <p className="text-[11px] text-[#FF0055] font-bold">
                      Yakin hapus seluruh catatan lembur? Data kehadiran tetap aman.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onClearEntries) onClearEntries();
                          setShowConfirmClearEntries(false);
                          onClose();
                        }}
                        className="flex-1 py-1.5 rounded bg-[#FF0055] text-white font-bold text-xs hover:bg-[#ff3377]"
                      >
                        Ya, Hapus Lembur
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmClearEntries(false)}
                        className="px-3 py-1.5 rounded bg-white/10 text-white text-xs hover:bg-white/20"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol 3: Reset Semua Data (Lembur + Kehadiran + Pengaturan) */}
              <div className="space-y-1.5">
                {!showConfirmReset ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    className="w-full py-2 px-3 rounded bg-[#FF0055]/20 border border-[#FF0055]/60 hover:bg-[#FF0055]/30 text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-[#FF0055]" />
                    <span>Reset Semua Data & Pengaturan Pabrik</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded bg-[#161626] border border-[#FF0055] space-y-2 animate-in fade-in duration-200">
                    <p className="text-[11px] text-[#FF0055] font-bold">
                      PERINGATAN: Tindakan ini menghapus SEMUA catatan lembur, absensi, dan preferensi aplikasi ke kondisi baru!
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmResetAll}
                        className="flex-1 py-1.5 rounded bg-[#FF0055] text-white font-bold text-xs hover:bg-[#ff3377]"
                      >
                        Ya, Bersihkan Total
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmReset(false)}
                        className="px-3 py-1.5 rounded bg-white/10 text-white text-xs hover:bg-white/20"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Sistem</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
