import React, { useState, useMemo } from 'react';
import { 
  History,
  Briefcase, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Share2, 
  Copy, 
  Check, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileSpreadsheet,
  FileCode,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { OvertimeEntry, UserSettings, AttendanceRecord } from '../../types/overtime';
import { 
  formatRupiah, 
  formatTanggal, 
  formatJam, 
  getCutoffDateRange,
  clampCustomRange
} from '../../utils/calculations';
import { exportToCSV, exportToJSON } from '../../utils/exportImport';
import { playCyberClick, playCyberSuccess } from '../../utils/audio';

interface HistoryScreenProps {
  entries: OvertimeEntry[];
  settings: UserSettings;
  attendanceMap: Record<string, AttendanceRecord>;
  onNavigateToCalculator: () => void;
  onEditEntry: (entry: OvertimeEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearAllEntries: () => void;
  onOpenImportModal: () => void;
  onOpenReceipt: (entry: OvertimeEntry) => void;
  onOpenAttendanceModal?: (date?: string) => void;
  onDeleteAttendance?: (tanggal: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  entries,
  settings,
  attendanceMap,
  onNavigateToCalculator,
  onEditEntry,
  onDeleteEntry,
  onClearAllEntries,
  onOpenImportModal,
  onOpenReceipt,
  onOpenAttendanceModal,
  onDeleteAttendance,
}) => {
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterJenisHari, setFilterJenisHari] = useState<string>('all');
  
  // Flexible Payroll Cut-off Date Range State
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'kalender' | 'cut_off_20' | 'cut_off_25' | 'custom'>('all');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(11);
  const [startDate, setStartDate] = useState<string>('2026-10-21');
  const [endDate, setEndDate] = useState<string>('2026-11-20');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'lembur' | 'kehadiran'>('lembur');

  // Clear all confirmation 2-step modal state
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [clearInputConfirm, setClearInputConfirm] = useState<string>('');

  // Delete single confirmation
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Compute active date range boundary
  const activeDateRange = useMemo(() => {
    if (dateFilterMode === 'all') return null;
    return getCutoffDateRange(selectedYear, selectedMonth, dateFilterMode, startDate, endDate);
  }, [dateFilterMode, selectedYear, selectedMonth, startDate, endDate]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      // Search by note or date
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = (e.catatan || '').toLowerCase().includes(q);
        const matchDate = e.tanggal.includes(q);
        if (!matchNote && !matchDate) return false;
      }

      // Filter by jenis hari
      if (filterJenisHari !== 'all') {
        if (filterJenisHari === 'libur') {
          if (!e.libur && e.jenisHari !== 'libur') return false;
        } else if (e.jenisHari !== filterJenisHari) {
          return false;
        }
      }

      // Filter by payroll cut-off date range (Tanggal Awal & Tanggal Akhir)
      if (activeDateRange) {
        if (e.tanggal < activeDateRange.startDate || e.tanggal > activeDateRange.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [entries, searchQuery, filterJenisHari, activeDateRange]);

  // Filtered attendance list
  const filteredAttendanceList = useMemo(() => {
    const list = Object.values(attendanceMap || {});
    return list.filter((att) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = (att.catatan || '').toLowerCase().includes(q);
        const matchDate = att.tanggal.includes(q);
        const matchStatus = att.status.toLowerCase().includes(q);
        if (!matchNote && !matchDate && !matchStatus) return false;
      }
      if (activeDateRange) {
        if (att.tanggal < activeDateRange.startDate || att.tanggal > activeDateRange.endDate) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [attendanceMap, searchQuery, activeDateRange]);

    // Aggregates of filtered entries
  const totalFilteredNominal = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + curr.totalLembur, 0);
  }, [filteredEntries]);

  const totalFilteredJam = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + curr.jamLembur, 0);
  }, [filteredEntries]);

  const handleCopySingle = (e: OvertimeEntry) => {
    if (settings.audioFeedback) playCyberClick();
    const txt = [
      `*LEMBUR: ${formatTanggal(e.tanggal)}*`,
      `Sistem: ${e.sistem === '5_hari' ? '5 Hari Kerja' : '6 Hari Kerja'} | Jenis: ${e.jenisHari.toUpperCase()}${e.libur ? ' (Libur)' : ''}`,
      `Total Jam: ${e.jamLembur} Jam`,
      `Upah Sejam: ${formatRupiah(e.upahSejam)}`,
      `*Hak Upah Lembur: ${formatRupiah(e.totalLembur)}*`,
      e.catatan ? `Catatan: ${e.catatan}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(txt);
    setCopiedId(e.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (settings.audioFeedback) playCyberClick();
    const prefix = activeDateRange 
      ? `lembur-${activeDateRange.startDate}-sd-${activeDateRange.endDate}` 
      : 'riwayat-lembur-semua';
    exportToCSV(filteredEntries, attendanceMap, prefix);
  };

  const handleExportJSON = () => {
    if (settings.audioFeedback) playCyberClick();
    exportToJSON(filteredEntries, attendanceMap, 'backup-lembur-kahfi');
  };

  const handleConfirmClearAll = () => {
    if (clearInputConfirm === 'HAPUS') {
      onClearAllEntries();
      setShowClearConfirm(false);
      setClearInputConfirm('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Main Toolbar - Kiri Judul, Kanan Mentok Tombol, Tengah Space */}
      <div className="p-4 sm:p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
          {/* Sisi Kiri: Judul & Rekap Total */}
          <div className="shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white dark:text-white tracking-tight font-heading">
                Riwayat & Log Kehadiran
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                {entries.length} Lembur
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 font-bold">
                {Object.keys(attendanceMap || {}).length} Absensi
              </span>
            </div>
            <p className="text-xs text-[#b9cacb] mt-1 font-sans">
              Semua data tersimpan aman di browser Anda. Ekspor ke CSV Excel atau pulihkan dari cadangan JSON.
            </p>
          </div>

          {/* Sisi Tengah: Fleksibel Kosong */}
          <div className="hidden lg:block flex-1" />

          {/* Sisi Kanan: 2 Baris Tombol Rapi, Simetris & Ter-stretch Mengikuti Ruang */}
          <div className="flex flex-col gap-2 w-full lg:w-auto min-w-0">
            {/* Baris 1: Tombol Aksi Input (50:50 Simetris) */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => onOpenAttendanceModal?.()}
                className="h-9 px-3 rounded bg-[#39FF14]/15 border border-[#39FF14]/50 hover:bg-[#39FF14]/25 text-[#39FF14] font-bold text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(57,255,20,0.15)] whitespace-nowrap"
                title="Catat absensi masuk, sakit, izin, atau cuti"
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span>+ Catat Kehadiran</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="h-9 px-3 rounded bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-[11px] sm:text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>+ Hitung Lembur</span>
              </button>
            </div>

            {/* Baris 2: Tombol Kelola Berkas (3 Kolom Simetris Ter-stretch) */}
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                type="button"
                onClick={onOpenImportModal}
                className="h-8.5 px-2 sm:px-2.5 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap"
                title="Pulihkan data lembur dan catatan absensi dari berkas .JSON"
              >
                <Upload className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                <span>Pulihkan</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="h-8.5 px-2 sm:px-2.5 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap"
                title="Unduh file CSV Excel lengkap"
              >
                <FileText className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                <span>Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="h-8.5 px-2 sm:px-2.5 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#FF2BD6] text-white hover:text-[#FF2BD6] text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap"
                title="Backup berkas JSON lengkap"
              >
                <FileCode className="w-3.5 h-3.5 text-[#FF2BD6] shrink-0" />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Riwayat Lembur vs Log Catatan Kehadiran */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveHistoryTab('lembur')}
          className={`px-4 py-2 rounded-t-lg font-mono text-xs font-bold flex items-center gap-2 transition-all ${
            activeHistoryTab === 'lembur'
              ? 'bg-[#12121F] text-[#00F0FF] border-t-2 border-t-[#00F0FF] border-x border-white/10 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-[#7A7A99] hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Lembur</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#00F0FF]/20 text-[#00F0FF]">
            {filteredEntries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHistoryTab('kehadiran')}
          className={`px-4 py-2 rounded-t-lg font-mono text-xs font-bold flex items-center gap-2 transition-all ${
            activeHistoryTab === 'kehadiran'
              ? 'bg-[#12121F] text-[#39FF14] border-t-2 border-t-[#39FF14] border-x border-white/10 shadow-[0_0_12px_rgba(57,255,20,0.2)]'
              : 'text-[#7A7A99] hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Log Catatan Kehadiran</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#39FF14]/20 text-[#39FF14]">
            {filteredAttendanceList.length}
          </span>
        </button>
      </div>

      {/* Filter & Metric Strip */}
      <div className="p-4 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
        {/* Payroll Cut-off & Date Range Filter Toolbar */}
        <div className="p-3 rounded-lg bg-[#0A0A12] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#b9cacb] flex items-center gap-1.5 font-bold uppercase text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" /> Filter Rentang Tanggal / Cut-Off:
            </span>
            <div className="flex rounded bg-[#1A1A2E] p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setDateFilterMode('all')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  dateFilterMode === 'all' ? 'bg-[#00F0FF] text-[#0A0A12] font-bold' : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('kalender')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  dateFilterMode === 'kalender' ? 'bg-[#00F0FF] text-[#0A0A12] font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]' : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                1 - Akhir Bulan
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('custom')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  dateFilterMode === 'custom' ? 'bg-[#FF2BD6] text-white font-bold shadow-[0_0_8px_rgba(255,43,214,0.3)]' : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                Kustom
              </button>
            </div>
          </div>

          {/* Date Pickers or Month Pickers */}
          {dateFilterMode === 'kalender' || dateFilterMode === 'cut_off_20' || dateFilterMode === 'cut_off_25' ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="px-2.5 py-1 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
              >
                {[
                  { v: 1, l: 'Januari' },
                  { v: 2, l: 'Februari' },
                  { v: 3, l: 'Maret' },
                  { v: 4, l: 'April' },
                  { v: 5, l: 'Mei' },
                  { v: 6, l: 'Juni' },
                  { v: 7, l: 'Juli' },
                  { v: 8, l: 'Agustus' },
                  { v: 9, l: 'September' },
                  { v: 10, l: 'Oktober' },
                  { v: 11, l: 'November' },
                  { v: 12, l: 'Desember' },
                ].map((m) => (
                  <option key={m.v} value={m.v}>
                    {m.l}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-2.5 py-1 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
              {activeDateRange && (
                <span className="text-[11px] text-[#00F0FF] font-bold">
                  ({formatTanggal(activeDateRange.startDate)} s.d. {formatTanggal(activeDateRange.endDate)})
                </span>
              )}
            </div>
          ) : dateFilterMode === 'custom' ? (
            <div className="flex items-center gap-2">
              <span className="text-[#7A7A99]">Tgl Awal:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#FF2BD6]"
              />
              <span className="text-[#7A7A99]">Tgl Akhir:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                const { end } = clampCustomRange(startDate, e.target.value, 40);
                setEndDate(end);
              }}
                className="px-2 py-1 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#FF2BD6]"
              />
            </div>
          ) : (
            <span className="text-[11px] text-[#7A7A99]">Menampilkan seluruh rentang waktu</span>
          )}
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs font-mono">
          {/* Search Box (8 cols) */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-[#7A7A99] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari catatan lembur, keterangan pekerjaan, atau tanggal spesifik..."
              className="w-full pl-9 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white placeholder-[#7A7A99] focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          {/* Filter Jenis Hari (4 cols) */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#FF2BD6] shrink-0" />
            <select
              value={filterJenisHari}
              onChange={(e) => setFilterJenisHari(e.target.value)}
              className="w-full px-2.5 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#FF2BD6]"
            >
              <option value="all">Semua Jenis Hari</option>
              <option value="biasa">Hari Kerja Biasa</option>
              <option value="libur">Hari Istirahat / Libur</option>
              <option value="sabtu">Sabtu</option>
              <option value="minggu">Minggu</option>
            </select>
          </div>
        </div>

        {/* Aggregated Filter Telemetry Strip */}
        <div className="p-3 rounded bg-[#0A0A12] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[#7A7A99]">Tampil:</span>{' '}
              <strong className="text-white">{filteredEntries.length}</strong> entri
            </div>
            <div>
              <span className="text-[#7A7A99]">Total Jam:</span>{' '}
              <strong className="text-[#00F0FF]">{formatJam(totalFilteredJam)}</strong>
            </div>
            <div>
              <span className="text-[#7A7A99]">Akumulasi Upah:</span>{' '}
              <strong className="text-[#39FF14]">{formatRupiah(totalFilteredNominal)}</strong>
            </div>
          </div>

          {entries.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-[#ffb4ab] hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Seluruh Riwayat</span>
            </button>
          )}
        </div>
      </div>

      {/* Entries Table & Attendance Table */}
      {activeHistoryTab === 'kehadiran' ? (
        <div className="rounded-lg bg-[#12121F] border border-white/10 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A12]">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#39FF14]" />
              <h3 className="font-bold text-white text-xs font-mono">Daftar Catatan Absensi & Kehadiran</h3>
              <span className="text-[10px] text-[#7A7A99]">({filteredAttendanceList.length} hari tercatat)</span>
            </div>
            <button
              onClick={() => onOpenAttendanceModal?.()}
              className="px-3 py-1 rounded bg-[#39FF14]/15 border border-[#39FF14]/40 hover:bg-[#39FF14]/25 text-[#39FF14] font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Kehadiran Baru</span>
            </button>
          </div>

          {filteredAttendanceList.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-[#7A7A99] space-y-3">
              <Briefcase className="w-8 h-8 text-[#39FF14] mx-auto opacity-50" />
              <div>Belum ada catatan kehadiran yang tersimpan untuk filter tanggal ini.</div>
              <button
                onClick={() => onOpenAttendanceModal?.()}
                className="px-4 py-2 rounded bg-[#39FF14] text-[#0A0A12] font-bold text-xs font-mono hover:bg-[#5aff3c] transition-all"
              >
                + Catat Kehadiran Hari Ini
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-[#39FF14]/20 bg-[#0A0A12] text-[#7A7A99] uppercase text-[10px]">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-3">Status Kehadiran</th>
                    <th className="py-3 px-3 text-center">Jam Kerja Reguler</th>
                    <th className="py-3 px-4">Catatan / Keterangan</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAttendanceList.map((att) => {
                    const badgeStyles: Record<string, string> = {
                      masuk: 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/40',
                      sakit: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40',
                      izin: 'bg-[#EC4899]/15 text-[#EC4899] border-[#EC4899]/40',
                      cuti: 'bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/40',
                      libur_off: 'bg-white/5 text-[#b9cacb] border-white/10',
                    };
                    const labels: Record<string, string> = {
                      masuk: 'Masuk Kerja',
                      sakit: 'Sakit',
                      izin: 'Izin',
                      cuti: 'Cuti Resmi',
                      libur_off: 'Libur / Off',
                    };

                    return (
                      <tr key={att.tanggal} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          {formatTanggal(att.tanggal)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${badgeStyles[att.status] || ''}`}>
                            {labels[att.status] || att.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-white">
                          {att.status === 'masuk' ? `${att.jamKerjaReguler} jam` : '-'}
                        </td>
                        <td className="py-3 px-4 text-white/90 font-sans text-xs font-medium">
                          {att.catatan ? (
                            <span className="text-[#00F0FF] font-semibold">{att.catatan}</span>
                          ) : (
                            <span className="text-[#7A7A99] italic">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenAttendanceModal?.(att.tanggal)}
                              className="px-2.5 py-1 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-[#00F0FF] text-xs transition-all flex items-center gap-1"
                              title="Edit Data Kehadiran"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            {onDeleteAttendance && (
                              <button
                                onClick={() => onDeleteAttendance(att.tanggal)}
                                className="p-1 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#ffb4ab] text-[#ffb4ab] transition-all"
                                title="Hapus Data Kehadiran Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
      <div className="rounded-lg bg-[#12121F] border border-white/10 shadow-lg overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#7A7A99]">
            Tidak ada entri lembur yang cocok dengan kriteria pencarian / filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#00F0FF]/20 bg-[#0A0A12] text-[#7A7A99] uppercase text-[10px]">
                  <th className="py-3 px-4">Tanggal & Kategori</th>
                  <th className="py-3 px-3">Sistem</th>
                  <th className="py-3 px-3 text-center">Jam Lembur</th>
                  <th className="py-3 px-3 text-right">Upah Sejam (1/173)</th>
                  <th className="py-3 px-4 text-right">Total Upah Lembur</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Date & Tags */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">
                        {formatTanggal(item.tanggal)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-bold ${
                            item.jenisHari === 'minggu' || item.jenisHari === 'libur'
                              ? 'border-[#FF2BD6]/40 text-[#FF2BD6] bg-[#FF2BD6]/10'
                              : item.jenisHari === 'sabtu'
                              ? 'border-[#00F0FF]/40 text-[#00F0FF] bg-[#00F0FF]/10'
                              : 'border-white/20 text-[#b9cacb]'
                          }`}
                        >
                          {item.jenisHari === 'libur' ? 'LIBUR' : item.jenisHari}
                        </span>
                        {item.libur && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/30 font-bold">
                            LIBUR RESMI
                          </span>
                        )}
                      </div>
                      {item.catatan && (
                        <div className="text-xs text-white/90 font-sans font-medium mt-1 max-w-sm">
                          Catatan: <span className="text-[#00F0FF]">{item.catatan}</span>
                        </div>
                      )}
                    </td>

                    {/* System */}
                    <td className="py-3 px-3 text-[#b9cacb]">
                      {item.sistem === '5_hari' ? '5 Hari Kerja' : '6 Hari Kerja'}
                    </td>

                    {/* Hours */}
                    <td className="py-3 px-3 text-center font-bold text-white">
                      {formatJam(item.jamLembur)}
                    </td>

                    {/* Rate per hour */}
                    <td className="py-3 px-3 text-right text-[#00F0FF]">
                      {formatRupiah(item.upahSejam)}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right font-extrabold text-[#39FF14] text-sm">
                      {formatRupiah(item.totalLembur)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenReceipt(item)}
                          className="p-1.5 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#00F0FF] text-[#00F0FF] transition-all"
                          title="Ekspor Bukti Slip PNG"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopySingle(item)}
                          className="p-1.5 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#39FF14] text-[#39FF14] transition-all"
                          title="Salin Rincian Teks"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onEditEntry(item)}
                          className="p-1.5 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#FF2BD6] text-[#FF2BD6] transition-all"
                          title="Edit Entri"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEntryToDelete(item.id)}
                          className="p-1.5 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#ffb4ab] text-[#ffb4ab] transition-all"
                          title="Hapus Entri"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#12121F] border border-[#ffb4ab]/40 rounded-lg p-5 max-w-sm w-full text-center space-y-3">
            <Trash2 className="w-10 h-10 text-[#ffb4ab] mx-auto" />
            <h3 className="font-bold text-white text-base">Hapus Entri Lembur?</h3>
            <p className="text-xs text-[#b9cacb]">
              Entri ini akan dihapus permanen dari memori browser perangkat ini.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-1.5 rounded text-xs font-mono text-white bg-[#1A1A2E] border border-white/10 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteEntry(entryToDelete);
                  setEntryToDelete(null);
                }}
                className="px-4 py-1.5 rounded text-xs font-mono font-bold text-white bg-[#93000a] hover:bg-[#ff5449]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Clear All Confirmation Modal per PRD E */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#12121F] border border-[#ffb4ab]/50 rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-[#ffb4ab]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-white">Konfirmasi Penghapusan Total</h3>
            </div>
            <p className="text-xs text-[#b9cacb] leading-relaxed">
              Tindakan ini akan <strong>menghapus seluruh {entries.length} data riwayat lembur</strong> yang tersimpan pada peramban ini. Data yang dihapus tidak dapat dipulihkan kecuali Anda memiliki cadangan file JSON/Excel.
            </p>
            <div>
              <label className="text-[11px] font-mono text-[#ffb4ab] block mb-1">
                Ketik kata <strong className="text-white">HAPUS</strong> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={clearInputConfirm}
                onChange={(e) => setClearInputConfirm(e.target.value)}
                placeholder="HAPUS"
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-[#ffb4ab]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  setClearInputConfirm('');
                }}
                className="px-4 py-2 rounded text-xs font-mono text-[#7A7A99] hover:text-white"
              >
                Batalkan
              </button>
              <button
                disabled={clearInputConfirm !== 'HAPUS'}
                onClick={handleConfirmClearAll}
                className="px-5 py-2 rounded text-xs font-mono font-bold text-white bg-[#93000a] hover:bg-[#ff5449] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(255,180,171,0.3)]"
              >
                Hapus Semua Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
