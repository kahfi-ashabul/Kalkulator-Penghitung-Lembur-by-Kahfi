import React, { useState } from 'react';
import { 
  BookOpen, 
  Check, 
  X, 
  ShieldAlert, 
  ArrowRight, 
  Calculator, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  Trash2, 
  Settings, 
  Briefcase,
  Zap
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: (dontShow: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onDontShowAgain,
}) => {
  const [dontRemind, setDontRemind] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleFinish = () => {
    onDontShowAgain(dontRemind);
    onClose();
  };

  const steps = [
    {
      num: '1',
      title: 'Menu Profil Karyawan & Komponen Upah',
      desc: 'Klik tombol Profil (ikon avatar) di bar atas untuk mengisi nama Anda, nama perusahaan, serta standar gaji pokok, tunjangan tetap, dan upah harian baku. Data ini otomatis mengisi slip struk PNG & estimasi gaji.',
      icon: <User className="w-4 h-4 text-[#00F0FF]" />,
    },
    {
      num: '2',
      title: 'Mode Hitung Lembur Resmi PP 35/2021 & Mandiri',
      desc: 'Hitung lembur sesuai rumus baku ketenagakerjaan pemerintah (pengali 1.5x, 2x, 3x, 4x) atau pilih mode insentif mandiri perusahaan untuk tarif kustom internal kantor.',
      icon: <Calculator className="w-4 h-4 text-[#39FF14]" />,
    },
    {
      num: '3',
      title: 'Pencatatan Absensi & Mode Kehadiran',
      desc: 'Catat absensi masuk kerja normal, sakit, izin, atau cuti di Dashboard. Tersedia pilihan "Isi Manual" (hanya hari tercatat) atau "Otomatis Masuk" (hari kerja otomatis dihitung 8 jam/7 jam standar).',
      icon: <Briefcase className="w-4 h-4 text-[#FF2BD6]" />,
    },
    {
      num: '4',
      title: 'Periode Cut-Off Fleksibel (Maksimal 40 Hari)',
      desc: 'Pantau lembur per bulan kalender, cut-off tanggal 20/25, atau rentang tanggal kustom bebas (dibatasi maksimal 40 hari dengan notifikasi otomatis demi keakuratan visual grafik).',
      icon: <Calendar className="w-4 h-4 text-[#FFE600]" />,
    },
    {
      num: '5',
      title: 'Ekspor Slip Struk PNG, CSV Excel & Cadangan JSON',
      desc: 'Unduh slip lembur PNG siap kirim WhatsApp, ekspor rekapitulasi lembur dan absensi lengkap ke CSV Excel, serta cadangkan & pulihkan seluruh data dengan file JSON.',
      icon: <FileSpreadsheet className="w-4 h-4 text-[#00F0FF]" />,
    },
    {
      num: '6',
      title: 'Pengaturan Sistem & Manajemen Penghapusan Data',
      desc: 'Atur sistem 5/6 hari kerja, efek suara audio, serta peringatan batas maksimal lembur (4j/hari). Di Zona Berbahaya, Anda bisa memilih: Hapus Absensi Saja, Hapus Lembur Saja, atau Reset Total.',
      icon: <Settings className="w-4 h-4 text-[#FF0055]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121F] border border-[#00F0FF]/40 rounded-xl shadow-[0_0_40px_rgba(0,240,255,0.25)] text-[#E4E1ED] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#00F0FF]/20 bg-[#0A0A12] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Panduan Penggunaan Cepat
              </h2>
              <p className="text-xs text-[#b9cacb] font-sans">
                Kalkulator Penghitung Lembur & Kehadiran by Kahfi (v1.2)
              </p>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="p-1.5 rounded-lg text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#1A1A2E] border border-white/10 text-[#dbfcff] leading-relaxed">
            Selamat datang! Aplikasi ini siap membantu Anda mencatat kehadiran, menghitung hak upah lembur resmi <strong>PP 35/2021</strong> maupun <strong>insentif mandiri</strong>, serta mengelola rekapitulasi gaji bulanan.
          </div>

          <div className="space-y-3">
            {steps.map((st) => (
              <div
                key={st.num}
                className="p-3 rounded-lg bg-[#0A0A12] border border-white/5 flex items-start gap-3 hover:border-[#00F0FF]/30 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-[#161626] border border-white/20 flex items-center justify-center font-bold text-[#00F0FF] shrink-0 text-xs mt-0.5">
                  {st.num}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-white flex items-center gap-2 text-xs">
                    {st.icon}
                    <span>{st.title}</span>
                  </div>
                  <p className="text-[#b9cacb] text-[11px] font-sans leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Note Notice */}
          <div className="p-2.5 rounded-md bg-[#FFE600]/10 border border-[#FFE600]/30 text-[#FFE600] text-[11px] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Semua data tersimpan aman dan privat di browser Anda, tidak dikirim ke server manapun.</span>
          </div>
        </div>

        {/* Footer with Checkbox & CTA */}
        <div className="p-4 border-t border-white/10 bg-[#0A0A12] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#b9cacb] hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={dontRemind}
              onChange={(e) => setDontRemind(e.target.checked)}
              className="accent-[#00F0FF] w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-[11px]">Jangan tampilkan otomatis saat mulai (bisa dibuka di Pengaturan)</span>
          </label>

          <button
            onClick={handleFinish}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] shrink-0"
          >
            <span>Mulai Gunakan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
