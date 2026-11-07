import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { OvertimeEntry, SistemKerja, JenisHari } from '../../types/overtime';
import { calculateOvertime, formatRupiah } from '../../utils/calculations';

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: OvertimeEntry | null;
  onSave: (updatedEntry: OvertimeEntry) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({ isOpen, onClose, entry, onSave }) => {
  const [tanggal, setTanggal] = useState('');
  const [sistem, setSistem] = useState<SistemKerja>('5_hari');
  const [jenisHari, setJenisHari] = useState<JenisHari>('biasa');
  const [libur, setLibur] = useState(false);
  const [isHariTerpendek, setIsHariTerpendek] = useState(false);
  const [jamLembur, setJamLembur] = useState(1);
  const [upahSebulan, setUpahSebulan] = useState(6000000);
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (entry) {
      setTanggal(entry.tanggal);
      setSistem(entry.sistem);
      setJenisHari(entry.jenisHari);
      setLibur(entry.libur);
      setIsHariTerpendek(entry.isHariTerpendek || false);
      setJamLembur(entry.jamLembur);
      setUpahSebulan(entry.upahSebulan);
      setCatatan(entry.catatan || '');
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  // Live recalculate
  const calc = calculateOvertime({
    gajiPokok: upahSebulan,
    tunjanganTetap: 0,
    sistem,
    jenisHari,
    liburResmi: libur,
    isHariTerpendek,
    jamLembur,
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OvertimeEntry = {
      ...entry,
      tanggal,
      sistem,
      jenisHari,
      libur,
      isHariTerpendek,
      jamLembur,
      upahSebulan: calc.upahSebulan,
      upahSejam: calc.upahSejam,
      totalLembur: calc.totalUpahLembur,
      catatan,
      breakdown: calc.breakdown,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121F] border border-[#00F0FF]/30 rounded-lg shadow-2xl text-[#E4E1ED] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#00F0FF]/20 bg-[#0A0A12]">
          <div>
            <h3 className="font-bold text-white text-base">Edit Entri Lembur</h3>
            <p className="text-xs text-[#b9cacb]">ID: {entry.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs font-mono">
          <div>
            <label className="text-[#b9cacb] mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
              Tanggal Lembur
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#b9cacb] mb-1 block">Sistem Kerja</label>
              <select
                value={sistem}
                onChange={(e) => setSistem(e.target.value as SistemKerja)}
                className="w-full px-2.5 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
              >
                <option value="5_hari">5 Hari Kerja (40 Jam)</option>
                <option value="6_hari">6 Hari Kerja (40 Jam)</option>
              </select>
            </div>

            <div>
              <label className="text-[#b9cacb] mb-1 block">Jenis Hari</label>
              <select
                value={jenisHari}
                onChange={(e) => {
                  const val = e.target.value as JenisHari;
                  setJenisHari(val);
                  if (val === 'libur') {
                    setLibur(true);
                  } else if (val === 'biasa') {
                    setLibur(false);
                    setIsHariTerpendek(false);
                  }
                }}
                className="w-full px-2.5 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
              >
                <option value="biasa">Hari Kerja Biasa</option>
                <option value="libur">Hari Istirahat / Libur</option>
                <option value="sabtu">Sabtu</option>
                <option value="minggu">Minggu</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer text-white">
              <input
                type="checkbox"
                checked={libur || jenisHari === 'libur'}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setLibur(checked);
                  if (checked) {
                    setJenisHari('libur');
                  } else {
                    setJenisHari('biasa');
                    setIsHariTerpendek(false);
                  }
                }}
                className="accent-[#00F0FF]"
              />
              <span>Hari Libur Resmi</span>
            </label>

            {sistem === '6_hari' && (libur || jenisHari === 'libur') && (
              <label className="flex items-center gap-2 cursor-pointer text-[#FF2BD6]">
                <input
                  type="checkbox"
                  checked={isHariTerpendek}
                  onChange={(e) => setIsHariTerpendek(e.target.checked)}
                  className="accent-[#FF2BD6]"
                />
                <span>Hari Kerja Terpendek (5 jam)</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#b9cacb] mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFE600]" />
                Jam Lembur
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={jamLembur}
                onChange={(e) => setJamLembur(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <label className="text-[#b9cacb] mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#39FF14]" />
                Upah Sebulan (Rp)
              </label>
              <input
                type="number"
                step="100000"
                value={upahSebulan}
                onChange={(e) => setUpahSebulan(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#b9cacb] mb-1 block">Catatan Aktivitas</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Deployment migrasi database..."
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          {/* Live Recalculation Telemetry */}
          <div className="p-3 rounded bg-[#0A0A12] border border-[#39FF14]/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#7A7A99] block">HASIL HITUNG REVISI:</span>
              <span className="text-sm font-bold text-[#39FF14]">
                {formatRupiah(calc.totalUpahLembur)}
              </span>
            </div>
            <div className="text-right text-[11px] text-[#b9cacb]">
              Upah Sejam: {formatRupiah(calc.upahSejam)}/jam
            </div>
          </div>

          {calc.warning && (
            <div className="p-2.5 rounded bg-[#FFE600]/10 border border-[#FFE600]/30 text-[#FFE600] text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{calc.warning}</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs text-[#7A7A99] hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded text-xs font-bold bg-[#00F0FF] text-[#0A0A12] hover:bg-[#7df4ff] transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
