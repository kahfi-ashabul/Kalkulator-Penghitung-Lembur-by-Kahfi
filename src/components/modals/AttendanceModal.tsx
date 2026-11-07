import React, { useState, useEffect } from 'react';
import { X, Check, HeartPulse, FileText, Calendar, Clock, Briefcase, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, SistemKerja } from '../../types/overtime';
import { formatTanggal } from '../../utils/calculations';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  attendanceMap: Record<string, AttendanceRecord>;
  sistem: SistemKerja;
  onSaveRecord: (record: AttendanceRecord) => void;
  onDeleteRecord?: (tanggal: string) => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  attendanceMap,
  sistem,
  onSaveRecord,
  onDeleteRecord,
}) => {
  const [tanggal, setTanggal] = useState(selectedDate);
  const [status, setStatus] = useState<AttendanceStatus>('masuk');
  const [jamKerjaReguler, setJamKerjaReguler] = useState<number>(sistem === '6_hari' ? 7 : 8);
  const [catatan, setCatatan] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Helper untuk membaca data absensi dari tanggal yang dipilih
  const loadDataForDate = (dateStr: string) => {
    if (!dateStr) return;
    const existing = attendanceMap[dateStr];
    if (existing) {
      setStatus(existing.status);
      setJamKerjaReguler(existing.jamKerjaReguler);
      setCatatan(existing.catatan || '');
    } else {
      const parts = dateStr.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const day = d.getDay(); // 0: Minggu, 6: Sabtu

      if (day === 0 || (day === 6 && sistem === '5_hari')) {
        setStatus('libur_off');
        setJamKerjaReguler(0);
        setCatatan('Libur Akhir Pekan');
      } else {
        setStatus('masuk');
        const defaultHours = (day === 6 && sistem === '6_hari') ? 5 : (sistem === '6_hari' ? 7 : 8);
        setJamKerjaReguler(defaultHours);
        setCatatan('');
      }
    }
    setShowConfirmDelete(false);
  };

  useEffect(() => {
    if (isOpen) {
      const activeDate = selectedDate || new Date().toISOString().slice(0, 10);
      setTanggal(activeDate);
      loadDataForDate(activeDate);
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleDateChange = (newDate: string) => {
    setTanggal(newDate);
    loadDataForDate(newDate);
  };

  const handleStatusSelect = (s: AttendanceStatus) => {
    setStatus(s);
    if (s === 'masuk') {
      if (jamKerjaReguler <= 0) {
        setJamKerjaReguler(sistem === '6_hari' ? 7 : 8);
      }
    } else {
      setJamKerjaReguler(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRecord({
      tanggal,
      status,
      jamKerjaReguler: status === 'masuk' ? Number(jamKerjaReguler) : 0,
      catatan: catatan.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteRecord) {
      onDeleteRecord(tanggal);
      setShowConfirmDelete(false);
      onClose();
    }
  };

  const hasExistingRecord = Boolean(attendanceMap[tanggal]);

  const statusOptions: Array<{ id: AttendanceStatus; label: string; icon: React.ReactNode; color: string; bg: string }> = [
    {
      id: 'masuk',
      label: 'Masuk Kerja',
      icon: <Briefcase className="w-4 h-4" />,
      color: '#39FF14',
      bg: 'bg-[#39FF14]/15 border-[#39FF14]/40 text-[#39FF14]',
    },
    {
      id: 'sakit',
      label: 'Sakit',
      icon: <HeartPulse className="w-4 h-4" />,
      color: '#F59E0B',
      bg: 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]',
    },
    {
      id: 'izin',
      label: 'Izin',
      icon: <FileText className="w-4 h-4" />,
      color: '#EC4899',
      bg: 'bg-[#EC4899]/15 border-[#EC4899]/40 text-[#EC4899]',
    },
    {
      id: 'cuti',
      label: 'Cuti Resmi',
      icon: <Calendar className="w-4 h-4" />,
      color: '#A855F7',
      bg: 'bg-[#A855F7]/15 border-[#A855F7]/40 text-[#A855F7]',
    },
    {
      id: 'libur_off',
      label: 'Libur / Off',
      icon: <Clock className="w-4 h-4" />,
      color: '#7A7A99',
      bg: 'bg-white/5 border-white/10 text-[#b9cacb]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121F] border border-[#00F0FF]/30 rounded-lg shadow-2xl text-[#E4E1ED] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#00F0FF]/20 bg-[#0A0A12]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00F0FF]" />
            <div>
              <h3 className="font-bold text-white text-base">Catat Status Kehadiran</h3>
              <p className="text-xs text-[#b9cacb] font-mono">{formatTanggal(tanggal)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono overflow-y-auto flex-1">
          {/* Tanggal Input */}
          <div>
            <label className="text-[#b9cacb] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                Tanggal Kehadiran
              </span>
              {hasExistingRecord && (
                <span className="text-[10px] text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded border border-[#39FF14]/30">
                  Data Terdaftar
                </span>
              )}
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => handleDateChange(e.target.value)}
              required
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/15 text-white font-mono focus:outline-none focus:border-[#00F0FF] transition-colors"
            />
          </div>

          {/* Status Selection Cards */}
          <div>
            <label className="text-[#b9cacb] mb-2 block font-bold text-white">
              Pilih Status Kehadiran Hari Ini:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleStatusSelect(opt.id)}
                    className={`p-2.5 rounded border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? `${opt.bg} shadow-lg font-bold scale-[1.02]`
                        : 'bg-[#1A1A2E] border-white/10 text-[#7A7A99] hover:text-white hover:border-white/20'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regular working hours (if Masuk) */}
          {status === 'masuk' && (
            <div className="p-3 rounded bg-[#161626] border border-[#39FF14]/30 space-y-1.5">
              <label className="text-white font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#39FF14]" />
                Jam Kerja Normal (Batang Hijau):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="14"
                  step="0.5"
                  value={jamKerjaReguler}
                  onChange={(e) => setJamKerjaReguler(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 rounded bg-[#0A0A12] border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-[#39FF14]"
                />
                <span className="text-[11px] text-[#b9cacb]">
                  {sistem === '5_hari' ? 'Standar 8 jam (5 hari)' : 'Standar 7 jam / Sabtu 5 jam (6 hari)'}
                </span>
              </div>
            </div>
          )}

          {/* Catatan / Keterangan */}
          <div>
            <label className="text-[#b9cacb] mb-1 block font-bold text-white">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Misal: Hadir shift pagi, Sakit flu, Cuti tahunan, dsb."
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/15 text-white focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          {/* Hapus Catatan Hari Ini (jika ada) */}
          {hasExistingRecord && onDeleteRecord && (
            <div className="pt-2 border-t border-white/10">
              {!showConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="w-full py-1.5 px-3 rounded bg-[#FF0055]/10 border border-[#FF0055]/30 hover:bg-[#FF0055]/20 text-[#FF0055] text-xs font-mono transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Data Absensi Tanggal Ini</span>
                </button>
              ) : (
                <div className="p-2.5 rounded bg-[#161626] border border-[#FF0055] space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-[#FFE600] text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Yakin hapus data absensi tanggal {formatTanggal(tanggal)}?</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[#b9cacb] text-xs font-mono"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1 rounded bg-[#FF0055] hover:bg-[#ff3377] text-white font-bold text-xs font-mono flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Ya, Hapus</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-[#7A7A99] hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded font-bold bg-[#00F0FF] text-[#0A0A12] hover:bg-[#7df4ff] transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Kehadiran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
