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
  Zap,
  Cloud,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const { user, loginWithGoogle } = useAuth();
  const [dontRemind, setDontRemind] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleFinish = () => {
    onDontShowAgain(dontRemind);
    onClose();
  };

  const steps = [
    {
      num: '1',
      title: 'Profil Karyawan & Mode Penggajian (Wajib di Awal)',
      desc: 'Atur nama, perusahaan, dan pilih Mode Gaji: Bulanan (rumus 1/173 × Upah) atau Gaji Harian (rumus PP 35/2021). Profil wajib diisi di awal agar semua perhitungan lembur dan slip otomatis presisi.',
      icon: <User className="w-4 h-4 text-[#00F0FF]" />,
    },
    {
      num: '2',
      title: 'Sistem Kerja (5 Hari vs 6 Hari Kerja)',
      desc: 'Pilih 5 hari kerja (8 jam/hari, libur Sabtu & Minggu) atau 6 hari kerja (7 jam/hari, Sabtu 5 jam, libur Minggu). Pengali lembur hari libur resmi otomatis menyesuaikan regulasi PP 35/2021.',
      icon: <Briefcase className="w-4 h-4 text-[#39FF14]" />,
    },
    {
      num: '3',
      title: 'Pencatatan Kehadiran: Manual (Free) & Otomatis [PRO]',
      desc: 'Pengguna Free dapat mencatat kehadiran harian secara manual via tombol Catat Absensi. Khusus pengguna PRO (Rp 5.000), Anda dapat mengaktifkan fitur "Otomatis Masuk" dan tombol "Isi Periode Ini" (31 hari otomatis sekaligus).',
      icon: <Zap className="w-4 h-4 text-[#FFE600]" />,
    },
    {
      num: '4',
      title: 'Periode Cut-Off Fleksibel (Maksimal 31 Hari)',
      desc: 'Pantau lembur per bulan kalender, cut-off tanggal 20/25, atau rentang tanggal kustom bebas (dibatasi maksimal 31 hari dengan proteksi otomatis demi akurasi siklus gaji bulanan).',
      icon: <Calendar className="w-4 h-4 text-[#00F0FF]" />,
    },
    {
      num: '5',
      title: 'Ekspor Slip PNG Sesuai Tema & Cadangan JSON',
      desc: 'Unduh slip lembur dan gaji dalam format gambar PNG resolusi tinggi 2x Retina yang adaptif tema (latar putih bersih jika Tema Terang, atau cyber dark jika Tema Gelap). Cadangkan seluruh data via berkas JSON.',
      icon: <FileSpreadsheet className="w-4 h-4 text-[#FF2BD6]" />,
    },
    {
      num: '6',
      title: 'Keuntungan Spesial Member PRO (Rp 5.000 / 30 Hari)',
      desc: 'Buka sinkronisasi cloud Google permanen (akses aman dari HP & laptop), otomasi absensi bulanan 1-klik, dan ekspor riwayat ke file Excel (.xlsx) / CSV profesional siap kirim ke HRD.',
      icon: <Crown className="w-4 h-4 text-[#FFE600]" />,
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
                Kalkulator Lembur & Kehadiran by Kei Project (v1.2)
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
          {/* CTA Login Google di Awal */}
          {!user && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF]/15 via-[#161626] to-[#39FF14]/15 border border-[#00F0FF]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-[#00F0FF]" /> Masuk untuk Amankan Data
                </span>
                <span className="text-[10px] text-[#39FF14] font-bold">Gratis / Cloud Sync</span>
              </div>
              <p className="text-[11px] text-[#b9cacb] font-sans leading-relaxed">
                Hubungkan akun Google Anda agar data riwayat lembur otomatis tersimpan aman di cloud dan dapat dibuka dari HP maupun laptop Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  loginWithGoogle();
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-[#0F172A] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Masuk Sekarang dengan Google</span>
              </button>
            </div>
          )}

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
          <div className="p-3 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#12121F] border border-[#00F0FF]/30 text-[11px] font-sans flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-white font-bold block">Privasi Terjamin & Keamanan Data</span>
              <p className="text-[#b9cacb] leading-relaxed">
                Data Anda tersimpan privat di peramban ini. Ingin riwayat lembur aman tersimpan saat berganti HP atau laptop? Upgrade ke <strong className="text-[#00F0FF]">Kei Pro (Rp 5.000)</strong> untuk membuka <strong>Sinkronisasi Cloud Google</strong> otomatis!
              </p>
            </div>
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
