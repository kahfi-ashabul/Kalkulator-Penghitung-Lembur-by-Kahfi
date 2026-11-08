import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building, 
  DollarSign, 
  Save, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { UserSettings } from '../../types/overtime';
import { parseRupiah } from '../../utils/calculations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveProfile: (updatedSettings: UserSettings) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveProfile,
}) => {
  const [namaKaryawan, setNamaKaryawan] = useState(settings.namaKaryawan || '');
  const [namaPerusahaan, setNamaPerusahaan] = useState(settings.namaPerusahaan || '');
  const [defaultGajiPokok, setDefaultGajiPokok] = useState(settings.defaultGajiPokok || 0);
  const [defaultTunjangan, setDefaultTunjangan] = useState(settings.defaultTunjangan || 0);
  const [gajiPokokStr, setGajiPokokStr] = useState<string>(
    settings.defaultGajiPokok ? settings.defaultGajiPokok.toLocaleString('id-ID') : ''
  );
  const [tunjanganStr, setTunjanganStr] = useState<string>(
    settings.defaultTunjangan ? settings.defaultTunjangan.toLocaleString('id-ID') : ''
  );

  // Sync state dari settings setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setNamaKaryawan(settings.namaKaryawan || '');
      setNamaPerusahaan(settings.namaPerusahaan || '');
      const gp = settings.defaultGajiPokok || 0;
      const tj = settings.defaultTunjangan || 0;
      setDefaultGajiPokok(gp);
      setDefaultTunjangan(tj);
      setGajiPokokStr(gp > 0 ? gp.toLocaleString('id-ID') : '');
      setTunjanganStr(tj > 0 ? tj.toLocaleString('id-ID') : '');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...settings,
      namaKaryawan: namaKaryawan.trim() || 'M. Kahfi',
      namaPerusahaan: namaPerusahaan.trim() || 'PT Teknologi Nusantara Mandiri',
      defaultGajiPokok,
      defaultTunjangan,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121F] border border-[#00F0FF]/30 rounded-lg shadow-2xl text-[#E4E1ED] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Modal Profil */}
        <div className="flex items-center justify-between p-4 border-b border-[#00F0FF]/20 bg-[#0A0A12]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Profil Karyawan</h3>
              <p className="text-[10px] text-[#b9cacb] font-mono">Identitas kerja & standar upah baku</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Profil */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono overflow-y-auto flex-1">
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

          {/* Standar Komponen Gaji Karyawan */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <DollarSign className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Standar Komponen Gaji Bawaan</span>
            </div>

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
                Upah 1 jam lembur dihitung 1/173 × (Gaji Pokok + Tunjangan Tetap). Bebas masukkan nominal berapapun.
              </span>
            </div>

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
              className="w-full py-2.5 rounded bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
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
