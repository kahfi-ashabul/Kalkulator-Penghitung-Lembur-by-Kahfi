import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building, 
  DollarSign, 
  Save, 
  Sparkles,
  ShieldCheck,
  Briefcase,
  Clock,
  Crown,
  Lock
} from 'lucide-react';
import { UserSettings, SistemKerja } from '../../types/overtime';
import { parseRupiah } from '../../utils/calculations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveProfile: (updatedSettings: UserSettings) => void;
  isPro?: boolean;
  onOpenProModal?: () => void;
  isMandatory?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveProfile,
  isPro = false,
  onOpenProModal,
  isMandatory = false,
}) => {
  const [namaKaryawan, setNamaKaryawan] = useState(settings.namaKaryawan || '');
  const [namaPerusahaan, setNamaPerusahaan] = useState(settings.namaPerusahaan || '');
  const [modeGaji, setModeGaji] = useState<'bulanan' | 'harian'>(settings.modeGaji || 'bulanan');
  const [defaultGajiPokok, setDefaultGajiPokok] = useState(settings.defaultGajiPokok || 0);
  const [defaultTunjangan, setDefaultTunjangan] = useState(settings.defaultTunjangan || 0);
  const [defaultUpahHarian, setDefaultUpahHarian] = useState(settings.defaultUpahHarian || 250000);
  const [defaultSistem, setDefaultSistem] = useState<SistemKerja>(settings.defaultSistem || '5_hari');
  const [modeAbsensi, setModeAbsensi] = useState<'manual' | 'otomatis'>(settings.modeAbsensi || 'manual');
  
  const [gajiPokokStr, setGajiPokokStr] = useState<string>(
    settings.defaultGajiPokok ? settings.defaultGajiPokok.toLocaleString('id-ID') : ''
  );
  const [tunjanganStr, setTunjanganStr] = useState<string>(
    settings.defaultTunjangan ? settings.defaultTunjangan.toLocaleString('id-ID') : ''
  );
  const [upahHarianStr, setUpahHarianStr] = useState<string>(
    settings.defaultUpahHarian ? settings.defaultUpahHarian.toLocaleString('id-ID') : '250.000'
  );

  // Sync state dari settings setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setNamaKaryawan(settings.namaKaryawan || '');
      setNamaPerusahaan(settings.namaPerusahaan || '');
      setModeGaji(settings.modeGaji || 'bulanan');
      const gp = settings.defaultGajiPokok || 0;
      const tj = settings.defaultTunjangan || 0;
      const uh = settings.defaultUpahHarian || 250000;
      setDefaultGajiPokok(gp);
      setDefaultTunjangan(tj);
      setDefaultUpahHarian(uh);
      setDefaultSistem(settings.defaultSistem || '5_hari');
      setModeAbsensi(settings.modeAbsensi || 'manual');
      setGajiPokokStr(gp > 0 ? gp.toLocaleString('id-ID') : '');
      setTunjanganStr(tj > 0 ? tj.toLocaleString('id-ID') : '');
      setUpahHarianStr(uh > 0 ? uh.toLocaleString('id-ID') : '250.000');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSelectModeAbsensi = (mode: 'manual' | 'otomatis') => {
    if (mode === 'otomatis' && !isPro) {
      if (onOpenProModal) {
        onOpenProModal();
      }
      return;
    }
    setModeAbsensi(mode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...settings,
      namaKaryawan: namaKaryawan.trim() || 'Karyawan',
      namaPerusahaan: namaPerusahaan.trim() || 'Perusahaan',
      modeGaji,
      defaultGajiPokok,
      defaultTunjangan,
      defaultUpahHarian,
      defaultSistem,
      modeAbsensi,
      profileCompleted: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121F] border border-[#00F0FF]/30 rounded-xl shadow-2xl text-[#E4E1ED] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Modal Profil */}
        <div className="flex items-center justify-between p-4 border-b border-[#00F0FF]/20 bg-[#0A0A12]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Profil Karyawan</h3>
                {isMandatory && (
                  <span className="text-[10px] bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/40 px-1.5 py-0.5 rounded font-mono font-bold">
                    Wajib Diisi di Awal
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#b9cacb] font-mono">Identitas kerja, sistem kerja, & standar upah baku</p>
            </div>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isMandatory && (
          <div className="px-4 py-2 bg-[#FFE600]/10 border-b border-[#FFE600]/20 text-[#FFE600] text-[11px] font-mono flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Lengkapi data Profil Karyawan Anda untuk memastikan perhitungan upah dan slip lembur akurat.</span>
          </div>
        )}

        {/* Form Profil */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs font-mono overflow-y-auto flex-1">
          {/* Identitas Karyawan */}
          <div className="space-y-3">
            <div>
              <label className="text-[#b9cacb] mb-1 flex items-center gap-1.5 font-bold">
                <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                Nama Lengkap Karyawan
              </label>
              <input
                type="text"
                value={namaKaryawan}
                onChange={(e) => setNamaKaryawan(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
                placeholder="Contoh: M. Kahfi"
                required
              />
              <span className="text-[10px] text-[#7A7A99] mt-0.5 block">
                Digunakan untuk cetak slip lembur dan estimasi gaji.
              </span>
            </div>

            <div>
              <label className="text-[#b9cacb] mb-1 flex items-center gap-1.5 font-bold">
                <Building className="w-3.5 h-3.5 text-[#FF2BD6]" />
                Nama Perusahaan / Kantor
              </label>
              <input
                type="text"
                value={namaPerusahaan}
                onChange={(e) => setNamaPerusahaan(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#FF2BD6]"
                placeholder="Contoh: PT Teknologi Nusantara"
                required
              />
            </div>
          </div>

          {/* Sistem Hari Kerja Standar Perusahaan */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="text-white font-bold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#00F0FF]" />
              Sistem Hari Kerja Standar Perusahaan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultSistem('5_hari')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  defaultSistem === '5_hari'
                    ? 'bg-[#1A1A2E] border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="font-bold text-xs text-white">5 Hari Kerja</div>
                <div className="text-[10px] text-[#b9cacb] mt-0.5">8 jam/hari (Senin - Jumat)</div>
                <div className="text-[9px] text-[#7A7A99]">Libur: Sabtu & Minggu</div>
              </button>

              <button
                type="button"
                onClick={() => setDefaultSistem('6_hari')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  defaultSistem === '6_hari'
                    ? 'bg-[#1A1A2E] border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="font-bold text-xs text-white">6 Hari Kerja</div>
                <div className="text-[10px] text-[#b9cacb] mt-0.5">7 jam/hari (Sabtu 5 jam)</div>
                <div className="text-[9px] text-[#7A7A99]">Libur: Minggu saja</div>
              </button>
            </div>
          </div>

          {/* Mode Sistem Penggajian */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="text-white font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#FFE600]" />
              Mode Sistem Penggajian
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModeGaji('bulanan')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  modeGaji === 'bulanan'
                    ? 'bg-[#1A1A2E] border-[#FFE600] text-[#FFE600] shadow-[0_0_10px_rgba(255,230,0,0.2)]'
                    : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="font-bold text-xs text-white">Gaji Bulanan</div>
                <div className="text-[10px] text-[#b9cacb] mt-0.5">Gaji pokok tetap per bulan</div>
                <div className="text-[9px] text-[#7A7A99]">Dasar lembur: 1/173 × Upah</div>
              </button>

              <button
                type="button"
                onClick={() => setModeGaji('harian')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  modeGaji === 'harian'
                    ? 'bg-[#1A1A2E] border-[#FFE600] text-[#FFE600] shadow-[0_0_10px_rgba(255,230,0,0.2)]'
                    : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="font-bold text-xs text-white">Gaji Harian</div>
                <div className="text-[10px] text-[#b9cacb] mt-0.5">Upah dihitung per hari kerja</div>
                <div className="text-[9px] text-[#7A7A99]">Dasar lembur: PP 35/2021 (21x / 25x)</div>
              </button>
            </div>
          </div>

          {/* Mode Pengisian Absensi Kehadiran */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#39FF14]" />
                Mode Pengisian Absensi Kehadiran
              </label>
              {!isPro && (
                <span className="text-[10px] text-[#FFE600] font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#FFE600]" /> PRO Feature
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectModeAbsensi('manual')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  modeAbsensi === 'manual'
                    ? 'bg-[#1A1A2E] border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Isi Manual</span>
                  <span className="text-[9px] bg-white/10 px-1.5 py-0.2 rounded text-[#b9cacb]">Semua Akun</span>
                </div>
                <div className="text-[10px] text-[#b9cacb] mt-1">
                  Catat kehadiran satu per satu per hari secara manual via kalender / tombol Catat Absensi.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectModeAbsensi('otomatis')}
                className={`p-2.5 rounded-lg border text-left transition-all relative ${
                  modeAbsensi === 'otomatis'
                    ? 'bg-[#1A1A2E] border-[#39FF14] text-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                    : 'bg-[#161626] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Otomatis Masuk</span>
                  <span className="text-[9px] bg-gradient-to-r from-[#00F0FF] to-[#39FF14] text-[#0A0A12] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    {isPro ? 'PRO' : <><Lock className="w-2.5 h-2.5" /> PRO 5K</>}
                  </span>
                </div>
                <div className="text-[10px] text-[#b9cacb] mt-1">
                  Hari kerja otomatis dianggap hadir normal (8j / 7j) tanpa perlu diisi satu per satu.
                </div>
              </button>
            </div>
            {!isPro && modeAbsensi === 'manual' && (
              <p className="text-[10px] text-[#7A7A99]">
                💡 Akun Gratis hanya mendukung <strong>Isi Manual</strong>. Upgrade ke <strong>PRO (Rp 5.000)</strong> untuk mengaktifkan Otomatis Masuk & Isi Periode Sekaligus.
              </p>
            )}
          </div>

          {/* Standar Komponen Gaji Karyawan */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <DollarSign className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Standar Komponen Gaji Bawaan ({modeGaji === 'harian' ? 'Mode Harian' : 'Mode Bulanan'})</span>
            </div>

            {modeGaji === 'bulanan' ? (
              <div>
                <label className="text-[#b9cacb] mb-1 block">Gaji Pokok Bulanan (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-[#7A7A99]">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={gajiPokokStr}
                    onChange={(e) => {
                      const raw = parseRupiah(e.target.value);
                      setDefaultGajiPokok(raw);
                      setGajiPokokStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                    }}
                    className="w-full pl-10 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono focus:outline-none focus:border-[#39FF14]"
                    placeholder="0"
                  />
                </div>
                <span className="text-[10px] text-[#7A7A99] mt-0.5 block">
                  Upah 1 jam lembur dihitung 1/173 × (Gaji Pokok + Tunjangan Tetap).
                </span>
              </div>
            ) : (
              <div>
                <label className="text-[#b9cacb] mb-1 block">Upah Harian Pokok (Rp/hari)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-[#7A7A99]">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={upahHarianStr}
                    onChange={(e) => {
                      const raw = parseRupiah(e.target.value);
                      setDefaultUpahHarian(raw);
                      setUpahHarianStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                    }}
                    className="w-full pl-10 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono focus:outline-none focus:border-[#FFE600]"
                    placeholder="250.000"
                  />
                </div>
                <span className="text-[10px] text-[#7A7A99] mt-0.5 block">
                  Sesuai PP 35/2021 Pasal 32: Upah sebulan dihitung {defaultSistem === '6_hari' ? '25' : '21'} × upah sehari. Upah 1 jam lembur = upah sebulan / 173.
                </span>
              </div>
            )}

            <div>
              <label className="text-[#b9cacb] mb-1 block">Tunjangan Tetap (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-[#7A7A99]">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={tunjanganStr}
                  onChange={(e) => {
                    const raw = parseRupiah(e.target.value);
                    setDefaultTunjangan(raw);
                    setTunjanganStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                  }}
                  className="w-full pl-10 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono focus:outline-none focus:border-[#39FF14]"
                  placeholder="0"
                />
              </div>
              <span className="text-[10px] text-[#7A7A99] mt-0.5 block">
                Opsional, komponen tunjangan tetap bulanan (PP No. 35/2021). Bebas masukkan nominal berapapun.
              </span>
            </div>
          </div>

          <div className="p-3 rounded bg-[#0A0A12] border border-[#00F0FF]/20 flex items-center gap-2 text-[11px] text-[#00F0FF]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#39FF14]" />
            <span>Data profil disimpan privat di peramban dan langsung tersinkron ke semua modul.</span>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Karyawan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
