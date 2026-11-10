import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Calendar, 
  ArrowUpDown, 
  Crown, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { OvertimeEntry, AttendanceRecord, UserSettings } from '../../types/overtime';
import { exportOvertimeToExcel, exportOvertimeToCSV, prepareExportData } from '../../utils/excelExporter';
import { formatRupiah, formatJam } from '../../utils/calculations';
import { playCyberClick, playCyberSuccess } from '../../utils/audio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: OvertimeEntry[];
  attendanceMap: Record<string, AttendanceRecord>;
  settings: UserSettings;
  isPro: boolean;
  onOpenProModal: () => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  attendanceMap,
  settings,
  isPro,
  onOpenProModal,
  initialStartDate,
  initialEndDate,
}) => {
  const [formatType, setFormatType] = useState<'xlsx' | 'csv'>('xlsx');
  const [dateMode, setDateMode] = useState<'all' | 'custom'>(initialStartDate && initialEndDate ? 'custom' : 'all');
  const [startDate, setStartDate] = useState<string>(
    initialStartDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(
    initialEndDate || new Date().toISOString().slice(0, 10)
  );
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Preview data yang disaring secara live
  const previewData = useMemo(() => {
    return prepareExportData(entries, attendanceMap, {
      startDate: dateMode === 'custom' ? startDate : undefined,
      endDate: dateMode === 'custom' ? endDate : undefined,
      sortOrder,
    });
  }, [entries, attendanceMap, dateMode, startDate, endDate, sortOrder]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (settings.audioFeedback) playCyberSuccess();

    if (!isPro) {
      onOpenProModal();
      return;
    }

    const options = {
      startDate: dateMode === 'custom' ? startDate : undefined,
      endDate: dateMode === 'custom' ? endDate : undefined,
      sortOrder,
    };

    if (formatType === 'xlsx') {
      exportOvertimeToExcel(entries, attendanceMap, settings, options);
    } else {
      exportOvertimeToCSV(entries, attendanceMap, settings, options);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121F] border border-[#00F0FF]/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] text-[#E4E1ED] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0A0A12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#39FF14]/20 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <FileSpreadsheet className="w-5 h-5 text-[#39FF14]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg font-heading flex items-center gap-2">
                Ekspor Laporan Rekapitulasi
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#39FF14] text-[#0A0A12]">
                  EXCEL & CSV
                </span>
              </h3>
              <p className="text-xs text-[#b9cacb] font-mono">
                Format tabel terstruktur, rapi, dan siap serahkan ke HRD / Finance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Pilihan Format File */}
          <div className="space-y-1.5">
            <label className="text-[#b9cacb] font-bold uppercase text-[11px] block">
              1. Pilih Format File:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (settings.audioFeedback) playCyberClick();
                  setFormatType('xlsx');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  formatType === 'xlsx'
                    ? 'bg-[#161626] border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.25)] text-white'
                    : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-white">
                    <FileSpreadsheet className="w-4 h-4 text-[#39FF14]" />
                    <span>Excel (.xlsx)</span>
                  </div>
                  {formatType === 'xlsx' && <span className="w-2 h-2 rounded-full bg-[#39FF14]" />}
                </div>
                <div className="text-[10px] text-[#39FF14] font-sans">
                  Tabel styling rapi, formula otomatis, rekomendasi resmi HRD
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (settings.audioFeedback) playCyberClick();
                  setFormatType('csv');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  formatType === 'csv'
                    ? 'bg-[#161626] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)] text-white'
                    : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-white">
                    <FileText className="w-4 h-4 text-[#00F0FF]" />
                    <span>CSV (.csv)</span>
                  </div>
                  {formatType === 'csv' && <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />}
                </div>
                <div className="text-[10px] text-[#00F0FF] font-sans">
                  BOM UTF-8, pembatas titik koma, kompatibel semua software
                </div>
              </button>
            </div>
          </div>

          {/* Filter Rentang Tanggal (Bisa disort dari tanggal berapa-berapa) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#0A0A12] border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-[#b9cacb] font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                2. Saring Rentang Tanggal:
              </label>
              <div className="flex rounded bg-[#161626] p-0.5 border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDateMode('all')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    dateMode === 'all' ? 'bg-[#00F0FF] text-[#0A0A12] font-bold' : 'text-[#7A7A99] hover:text-white'
                  }`}
                >
                  Semua Data
                </button>
                <button
                  type="button"
                  onClick={() => setDateMode('custom')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    dateMode === 'custom' ? 'bg-[#00F0FF] text-[#0A0A12] font-bold' : 'text-[#7A7A99] hover:text-white'
                  }`}
                >
                  Rentang Kustom
                </button>
              </div>
            </div>

            {dateMode === 'custom' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-[#7A7A99] mb-1 block">Dari Tanggal:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7A99] mb-1 block">Sampai Tanggal:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#7A7A99]">
                Mengekspor seluruh riwayat lembur dan catatan absensi yang tersimpan ({entries.length} data lembur).
              </p>
            )}
          </div>

          {/* Pengurutan Baris Data (Sort Order) */}
          <div className="space-y-1.5">
            <label className="text-[#b9cacb] font-bold uppercase text-[11px] flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#FFE600]" />
              3. Urutan Baris Tanggal:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSortOrder('desc')}
                className={`py-2 px-3 rounded-lg border text-left transition-all ${
                  sortOrder === 'desc'
                    ? 'bg-[#161626] border-[#FFE600] text-white font-bold'
                    : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div>Terbaru ke Terlama</div>
                <div className="text-[10px] text-[#7A7A99] font-normal font-sans">Tanggal terkini di baris atas</div>
              </button>

              <button
                type="button"
                onClick={() => setSortOrder('asc')}
                className={`py-2 px-3 rounded-lg border text-left transition-all ${
                  sortOrder === 'asc'
                    ? 'bg-[#161626] border-[#FFE600] text-white font-bold'
                    : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div>Terlama ke Terbaru</div>
                <div className="text-[10px] text-[#7A7A99] font-normal font-sans">Kronologis awal ke akhir bulan</div>
              </button>
            </div>
          </div>

          {/* Live Data Summary Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF]/10 via-[#161626] to-[#39FF14]/10 border border-[#00F0FF]/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Ringkasan Berkas yang Akan Dihasilkan:</span>
              <span className="text-[#39FF14]">{previewData.rows.length} Baris Data</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-white/10">
              <div>
                <span className="text-[#7A7A99] block text-[10px]">Total Hari:</span>
                <span className="text-white font-bold">{previewData.totals.totalHari} Hari</span>
              </div>
              <div>
                <span className="text-[#7A7A99] block text-[10px]">Total Lembur:</span>
                <span className="text-[#00F0FF] font-bold">{formatJam(previewData.totals.totalJamLembur)}</span>
              </div>
              <div>
                <span className="text-[#7A7A99] block text-[10px]">Total Hak Upah:</span>
                <span className="text-[#39FF14] font-bold">{formatRupiah(previewData.totals.totalNominalLembur)}</span>
              </div>
            </div>
          </div>

          {/* PRO Privilege Notice if not PRO */}
          {!isPro && (
            <div className="p-3 rounded-xl bg-[#FFE600]/10 border border-[#FFE600]/30 text-[#FFE600] text-xs flex items-start gap-2.5">
              <Crown className="w-4 h-4 shrink-0 mt-0.5 text-[#FFE600]" />
              <div className="space-y-0.5">
                <span className="font-bold text-white">Fitur Eksklusif Member PRO:</span>
                <p className="text-[11px] text-[#b9cacb] font-sans leading-relaxed">
                  Ekspor file Excel (.xlsx) dan CSV dengan filter rentang tanggal kustom adalah benefit member PRO (Rp 5.000).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0A0A12] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-[#7A7A99] hover:text-white transition-colors text-xs font-mono"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={previewData.rows.length === 0}
            className={`flex-1 py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              !isPro
                ? 'bg-gradient-to-r from-[#FFE600] to-[#FF2BD6] text-[#0A0A12] hover:opacity-95'
                : 'bg-gradient-to-r from-[#00F0FF] to-[#39FF14] text-[#0A0A12] hover:opacity-95'
            } ${previewData.rows.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {!isPro ? (
              <>
                <Crown className="w-4 h-4" />
                <span>Buka Ekspor Excel dengan PRO</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download File {formatType === 'xlsx' ? 'Excel (.xlsx)' : 'CSV (.csv)'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
