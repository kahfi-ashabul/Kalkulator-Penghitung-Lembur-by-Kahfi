import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  Plus, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  CalendarRange,
  HeartPulse,
  Briefcase,
  CheckCircle2,
  SlidersHorizontal,
  Zap
} from 'lucide-react';
import { OvertimeEntry, UserSettings, AttendanceRecord, AttendanceStatus } from '../../types/overtime';
import { formatRupiah, formatTanggal, formatJam, getCutoffDateRange , clampCustomRange} from '../../utils/calculations';
import { AttendanceModal } from '../modals/AttendanceModal';
import { triggerPopunder } from '../../utils/adManager';

interface DashboardScreenProps {
  entries: OvertimeEntry[];
  settings: UserSettings;
  attendanceMap: Record<string, AttendanceRecord>;
  onSaveAttendance: (record: AttendanceRecord) => void;
  onOpenAttendanceModal?: (date?: string) => void;
  onDeleteAttendance?: (tanggal: string) => void;
  onNavigateToCalculator: () => void;
  onNavigateToHistory: () => void;
  onNavigateToSalary: () => void;
  onOpenReceipt: (entry: OvertimeEntry) => void;
  onUpdateSettings?: (newSettings: UserSettings) => void;
  isPro?: boolean;
  onOpenProModal?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  entries,
  settings,
  attendanceMap,
  onSaveAttendance,
  onOpenAttendanceModal,
  onDeleteAttendance,
  onNavigateToCalculator,
  onNavigateToHistory,
  onNavigateToSalary,
  onOpenReceipt,
  onUpdateSettings,
  isPro = false,
  onOpenProModal,
}) => {
  // Period filter states
  const [cutoffMode, setCutoffMode] = useState<'kalender' | 'cut_off_20' | 'cut_off_25' | 'custom'>('kalender');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // 1-12, default Nov 2026
  const [customStart, setCustomStart] = useState<string>('2026-10-21');
  const [customEnd, setCustomEnd] = useState<string>('2026-11-20');
  const [rangeWarning, setRangeWarning] = useState<string | null>(null);

  // Handler: Ubah Tanggal Mulai Kustom dengan Proteksi Maksimal 31 Hari
  const handleCustomStartChange = (newStart: string) => {
    setCustomStart(newStart);
    if (newStart && customEnd) {
      const dStart = new Date(newStart);
      const dEnd = new Date(customEnd);
      const diffDays = Math.round((dEnd.getTime() - dStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 31) {
        const { end } = clampCustomRange(newStart, customEnd, 31);
        setCustomEnd(end);
        setRangeWarning('Rentang melebihi batas maksimal 31 hari. Tanggal akhir otomatis dibatasi.');
      } else if (diffDays <= 0) {
        setRangeWarning('Tanggal mulai harus lebih awal dari tanggal selesai.');
      } else {
        setRangeWarning(null);
      }
    }
  };

  // Handler: Ubah Tanggal Selesai Kustom dengan Proteksi Maksimal 31 Hari
  const handleCustomEndChange = (newEnd: string) => {
    if (customStart && newEnd) {
      const dStart = new Date(customStart);
      const dEnd = new Date(newEnd);
      const diffDays = Math.round((dEnd.getTime() - dStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 31) {
        const { end } = clampCustomRange(customStart, newEnd, 31);
        setCustomEnd(end);
        setRangeWarning('Rentang melebihi batas maksimal 31 hari. Tanggal akhir otomatis dibatasi.');
      } else if (diffDays <= 0) {
        setCustomEnd(newEnd);
        setRangeWarning('Tanggal selesai harus lebih besar atau sama dengan tanggal mulai.');
      } else {
        setCustomEnd(newEnd);
        setRangeWarning(null);
      }
    } else {
      setCustomEnd(newEnd);
      setRangeWarning(null);
    }
  };

  // Sinkronkan mode pengisian absensi langsung saat pengaturan disimpan tanpa perlu refresh
  useEffect(() => {
    if (settings.modeAbsensi) {
      setAttendanceFillMode(settings.modeAbsensi);
    }
  }, [settings.modeAbsensi]);

  // Mode Pengisian Kehadiran: 'manual' (hanya yang dicatat) vs 'otomatis' (hari kerja otomatis masuk 8j)
  const [attendanceFillMode, setAttendanceFillMode] = useState<'manual' | 'otomatis'>(
    settings.modeAbsensi || 'manual'
  );

  // Attendance modal state
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('2026-11-05');

  // Hovered day for interactive telemetry inspector
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    jamReguler: number;
    jamLembur: number;
    nominal: number;
    status: AttendanceStatus;
    catatan?: string;
  } | null>(null);

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  // Active Date Range
  const activeDateRange = useMemo(() => {
    return getCutoffDateRange(selectedYear, selectedMonth, cutoffMode, customStart, customEnd);
  }, [selectedYear, selectedMonth, cutoffMode, customStart, customEnd]);

  // Filter entries within active date range
  const rangeEntries = useMemo(() => {
    return entries
      .filter((e) => e.tanggal >= activeDateRange.startDate && e.tanggal <= activeDateRange.endDate)
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [entries, activeDateRange]);

  // Aggregated KPI Metrics
  const totalUpahLembur = useMemo(() => {
    return rangeEntries.reduce((acc, curr) => acc + curr.totalLembur, 0);
  }, [rangeEntries]);

  const totalJamLembur = useMemo(() => {
    return rangeEntries.reduce((acc, curr) => acc + curr.jamLembur, 0);
  }, [rangeEntries]);

  const jumlahHariLembur = rangeEntries.length;
  const rataRataJam = jumlahHariLembur > 0 ? totalJamLembur / jumlahHariLembur : 0;

  // Estimated base and take home
  const baseSalary = settings.defaultGajiPokok + settings.defaultTunjangan;
  const estimasiTotalGaji = baseSalary + totalUpahLembur;

  // Build daily timeline from startDate to endDate
  const timelineDays = useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayNum: number;
      monthNum: number;
      dayOfWeek: number;
      jamReguler: number;
      jamLembur: number;
      nominal: number;
      status: AttendanceStatus;
      catatan?: string;
    }> = [];

    const start = new Date(activeDateRange.startDate);
    const end = new Date(activeDateRange.endDate);

    const pad = (n: number) => String(n).padStart(2, '0');

    for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
      const dateStr = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
      const dayOfWeek = cur.getDay(); // 0 is Sun, 6 is Sat

      // Get attendance record if exists
      const att = attendanceMap[dateStr];
      const isWeekend = dayOfWeek === 0 || (dayOfWeek === 6 && settings.defaultSistem === '5_hari');
      
      let status: AttendanceStatus;
      let jamReguler: number;
      let catatan = att?.catatan;

      if (att) {
        status = att.status;
        jamReguler = att.jamKerjaReguler;
      } else if (attendanceFillMode === 'otomatis') {
        // Mode Otomatis: hari kerja otomatis masuk 8j/7j
        status = isWeekend ? 'libur_off' : 'masuk';
        const defaultHours = (dayOfWeek === 6 && settings.defaultSistem === '6_hari') ? 5 : (settings.defaultSistem === '6_hari' ? 7 : 8);
        jamReguler = isWeekend ? 0 : defaultHours;
      } else {
        // Mode Manual: hari kerja yang belum dicatat tidak diisi 8j sembarangan
        status = isWeekend ? 'libur_off' : 'libur_off';
        jamReguler = 0;
      }

      // Get overtime entries for this day
      const dayEntries = rangeEntries.filter((e) => e.tanggal === dateStr);
      const dayJamLembur = dayEntries.reduce((acc, c) => acc + c.jamLembur, 0);
      const dayNominal = dayEntries.reduce((acc, c) => acc + c.totalLembur, 0);
      if (dayEntries.length > 0 && dayEntries[0].catatan) {
        catatan = dayEntries[0].catatan + (catatan ? ` • ${catatan}` : '');
      }

      list.push({
        dateStr,
        dayNum: cur.getDate(),
        monthNum: cur.getMonth() + 1,
        dayOfWeek,
        jamReguler,
        jamLembur: dayJamLembur,
        nominal: dayNominal,
        status,
        catatan,
      });
    }

    return list;
  }, [activeDateRange, attendanceMap, rangeEntries, settings.defaultSistem, attendanceFillMode]);

  // Max total daily hours for chart height scaling - DYNAMIC to prevent clipping if > 16 hours
  const highestDayHours = Math.max(0, ...timelineDays.map((d) => d.jamReguler + d.jamLembur));
  const maxTotalHours = Math.max(16, Math.ceil((highestDayHours + 2) / 4) * 4);

  // Count attendance stats
  const totalHariMasuk = timelineDays.filter((d) => d.status === 'masuk').length;
  const totalHariSakit = timelineDays.filter((d) => d.status === 'sakit').length;
  const totalHariIzin = timelineDays.filter((d) => d.status === 'izin').length;
  const totalHariCuti = timelineDays.filter((d) => d.status === 'cuti').length;

  // Akumulasi Lembur Hari Kerja Biasa Mingguan (Sesuai PP 35/2021 Pasal 26 ayat 2 - Libur resmi/akhir pekan DIKECUALIKAN)
  const regularWorkdayOvertimeHours = useMemo(() => {
    return rangeEntries
      .filter((e) => e.jenisHari === 'biasa' && !e.libur)
      .reduce((acc, curr) => acc + curr.jamLembur, 0);
  }, [rangeEntries]);

  // Evaluasi pelanggaran batas maksimal lembur hari biasa (> 4 jam/hari pada hari kerja biasa)
  const daysExceedingDailyLimit = useMemo(() => {
    return rangeEntries.filter((e) => e.jenisHari === 'biasa' && !e.libur && e.jamLembur > 4);
  }, [rangeEntries]);

  const handleToggleFillMode = (mode: 'manual' | 'otomatis') => {
    setAttendanceFillMode(mode);
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        modeAbsensi: mode,
      });
    }
  };

  // Handler: Isi Otomatis Masuk untuk seluruh hari kerja dalam periode aktif (Khusus PRO)
  const handleAutoFillMonthAttendance = () => {
    if (!isPro) {
      if (onOpenProModal) {
        onOpenProModal();
      }
      return;
    }

    const start = new Date(activeDateRange.startDate);
    const end = new Date(activeDateRange.endDate);
    const pad = (n: number) => String(n).padStart(2, '0');

    let countFilled = 0;
    for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
      const dateStr = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
      const dayOfWeek = cur.getDay();
      const isWeekend = dayOfWeek === 0 || (dayOfWeek === 6 && settings.defaultSistem === '5_hari');

      if (!isWeekend && !attendanceMap[dateStr]) {
        const defaultHours = (dayOfWeek === 6 && settings.defaultSistem === '6_hari') ? 5 : (settings.defaultSistem === '6_hari' ? 7 : 8);
        onSaveAttendance({
          tanggal: dateStr,
          status: 'masuk',
          jamKerjaReguler: defaultHours,
          catatan: 'Masuk Kerja Otomatis',
        });
        countFilled++;
      }
    }
  };

  const handleDayBarClick = (dateStr: string) => {
    setModalDate(dateStr);
    setAttendanceModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Cut-Off Period Selector */}
      <div className="p-4 sm:p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
                Dashboard Ringkasan Lembur & Kehadiran
              </h1>
            </div>
            <p className="text-xs text-[#b9cacb] mt-0.5 font-sans">
              Pantau jam kerja masuk, absensi sakit/izin, serta akumulasi lembur harian dan bulanan.
            </p>
          </div>

          {/* Action Toolbar: Rapi, Bersih, & Responsif */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Tombol Isi Cepat Periode Ini (Khusus PRO 5K) */}
            <button
              type="button"
              onClick={handleAutoFillMonthAttendance}
              className="h-9 px-3 rounded-lg bg-[#1A1A2E] border border-[#FFE600]/40 hover:border-[#FFE600] text-[#FFE600] font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-[0_0_8px_rgba(255,230,0,0.15)] cursor-pointer"
              title={isPro ? "Isi otomatis semua hari kerja periode ini yang belum tercatat absensinya" : "Fitur Otomatisasi (Isi 31 Hari Sekaligus) khusus PRO (Rp 5.000)"}
            >
              <Zap className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
              <span>Isi Periode Ini</span>
              {!isPro && (
                <span className="text-[9px] bg-gradient-to-r from-[#00F0FF] to-[#39FF14] text-[#0A0A12] font-black px-1.5 py-0.2 rounded ml-1">
                  PRO
                </span>
              )}
            </button>

            {/* Tombol Catat Absensi Manual */}
            <button
              type="button"
              onClick={() => {
                triggerPopunder(isPro);
                setModalDate(new Date().toISOString().slice(0, 10));
                setAttendanceModalOpen(true);
              }}
              className="h-9 px-3 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/50 hover:bg-[#39FF14]/25 text-[#39FF14] font-mono text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(57,255,20,0.15)] whitespace-nowrap cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>+ Catat Absensi</span>
            </button>

            {/* Tombol Hitung Lembur */}
            <button
              type="button"
              onClick={() => {
                triggerPopunder(isPro);
                onNavigateToCalculator();
              }}
              className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-[11px] sm:text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.35)] flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Hitung Lembur</span>
            </button>
          </div>
        </div>

        {/* Flexible Payroll Cut-off Toolbar */}
        <div className="p-3 rounded-lg bg-[#0A0A12] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#b9cacb] flex items-center gap-1 text-[11px] font-bold uppercase">
              <CalendarRange className="w-3.5 h-3.5 text-[#00F0FF]" /> Periode Gaji:
            </span>

            {/* Mode Presets */}
            <div className="flex rounded bg-[#1A1A2E] p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setCutoffMode('kalender')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  cutoffMode === 'kalender' ? 'bg-[#00F0FF] text-[#0A0A12] font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]' : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                1 - Akhir Bulan
              </button>
              <button
                type="button"
                onClick={() => setCutoffMode('custom')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  cutoffMode === 'custom' ? 'bg-[#FF2BD6] text-white font-bold shadow-[0_0_8px_rgba(255,43,214,0.3)]' : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                Kustom
              </button>
            </div>
          </div>

          {/* Month/Year or Custom Date Pickers */}
          {cutoffMode !== 'custom' ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
              <span className="text-[11px] text-[#00F0FF] font-bold hidden md:inline ml-1">
                ({formatTanggal(activeDateRange.startDate)} s.d. {formatTanggal(activeDateRange.endDate)})
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => handleCustomStartChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                  title="Tanggal mulai periode kustom"
                />
                <span className="text-[#00F0FF] font-bold text-xs">s.d.</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => handleCustomEndChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                  title="Tanggal selesai periode kustom"
                />
                <span className="text-[10px] text-[#00F0FF] font-mono px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 font-bold whitespace-nowrap">
                  Maks. 31 Hari
                </span>
              </div>

              {/* Notifikasi Peringatan jika melebihi batas */}
              {rangeWarning && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFE600]/15 border border-[#FFE600]/50 text-[#FFE600] text-[11px] font-mono animate-in fade-in duration-200">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#FFE600]" />
                  <span>{rangeWarning}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Gross Overtime Metric */}
        <div className="p-5 rounded-lg bg-[#12121F] border border-[#39FF14]/40 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono text-[#b9cacb]">
            <DollarSign className="w-4 h-4 text-[#39FF14]" />
            <span className="font-bold text-white tracking-wide">TOTAL UPAH LEMBUR</span>
          </div>
          <div className="mt-3 text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono text-[#39FF14] tracking-tight break-words drop-shadow-[0_0_16px_rgba(57,255,20,0.4)]">
            {formatRupiah(totalUpahLembur)}
          </div>
          <div className="mt-2 text-xs font-mono text-[#b9cacb]">
            Periode: {activeDateRange.label}
          </div>
        </div>

        {/* Total Overtime Hours & Attendance Count */}
        <div className="p-5 rounded-lg bg-[#12121F] border border-[#00F0FF]/30 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#b9cacb]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00F0FF]" />
              <span className="font-bold text-white tracking-wide">TOTAL JAM LEMBUR</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30">
              {jumlahHariLembur} Hari Lembur
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {formatJam(totalJamLembur)}
          </div>
          <div className="mt-2 text-xs font-mono text-[#b9cacb] flex items-center justify-between">
            <span>Rata-rata: {rataRataJam.toFixed(1)} jam/hari</span>
            <span className="text-[#39FF14] flex items-center gap-1 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Terpantau
            </span>
          </div>
        </div>

        {/* Total Working Days & Sick Leave */}
        <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#b9cacb]">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#39FF14]" />
              <span className="font-bold text-white tracking-wide">REKAP ABSENSI</span>
            </div>
            <button
              onClick={() => {
                setModalDate(new Date().toISOString().slice(0, 10));
                setAttendanceModalOpen(true);
              }}
              className="text-[10px] text-[#00F0FF] hover:underline"
            >
              + Edit
            </button>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {totalHariMasuk} <span className="text-xs text-[#b9cacb] font-normal">Hari Masuk</span>
          </div>
          <div className="mt-2 text-xs font-mono flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-[#F59E0B] font-bold">Sakit: {totalHariSakit} hr</span>
            <span className="text-[#EC4899] font-bold">Izin: {totalHariIzin} hr</span>
            <span className="text-[#A855F7] font-bold">Cuti: {totalHariCuti} hr</span>
          </div>
        </div>

        {/* Estimated Total Take Home Pay */}
        <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#b9cacb]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#39FF14]" />
              <span className="font-bold text-white tracking-wide">ESTIMASI GAJI PERIODE INI</span>
            </div>
            <button
              onClick={onNavigateToSalary}
              className="text-[10px] text-[#00F0FF] hover:underline flex items-center gap-0.5 font-mono font-bold"
            >
              Rincian <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-3 text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono text-white tracking-tight break-words">
            {formatRupiah(estimasiTotalGaji)}
          </div>
          <div className="mt-2 text-xs font-mono text-[#b9cacb] flex items-center gap-1.5">
            <span>Gaji Pokok + Tunjangan + Lembur</span>
          </div>
        </div>
      </div>

      {/* Peringatan Batas Maksimal Lembur PP 35/2021 (Jika Aktif di Pengaturan) */}
      {settings.enableMaxOvertimeAlert !== false && (daysExceedingDailyLimit.length > 0 || regularWorkdayOvertimeHours > 18) && (
        <div className="p-4 rounded-lg bg-[#FFE600]/10 border border-[#FFE600]/40 text-[#FFE600] text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#FFE600] mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>Peringatan Batas Maksimal Lembur (PP No. 35/2021 Pasal 26)</span>
            </div>
            {daysExceedingDailyLimit.length > 0 && (
              <p className="text-[#FFE600]">
                • Terdapat {daysExceedingDailyLimit.length} hari kerja biasa dengan lembur melebihi <strong>batas maksimal 4 jam/hari</strong> (yaitu: {daysExceedingDailyLimit.map(e => e.tanggal).join(', ')}).
              </p>
            )}
            {regularWorkdayOvertimeHours > 18 && (
              <p className="text-[#FFE600]">
                • Total lembur hari kerja biasa dalam periode ini mencapai <strong>{regularWorkdayOvertimeHours} jam</strong> (melebihi batas maksimal 18 jam/minggu untuk hari kerja biasa).
              </p>
            )}
            <p className="text-[#b9cacb] text-[11px] font-sans">
              Catatan: Lembur pada hari istirahat mingguan (Sabtu/Minggu) dan libur resmi tidak dibatasi 4 jam dan tidak dihitung ke kuota 18 jam/minggu sesuai Pasal 26 ayat (2).
            </p>
          </div>
        </div>
      )}

      {/* Interactive Stacked Bar Chart (Green Normal Work + Blue Overtime on Top) */}
      <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-3">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-heading tracking-tight">
                <TrendingUp className="w-5 h-5 text-[#00F0FF]" />
                Grafik Kehadiran & Lembur Terhubung
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] text-xs font-mono font-bold border border-[#00F0FF]/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                {activeDateRange.label}
              </span>
            </div>
            <p className="text-xs text-[#b9cacb] font-mono mt-1">
              Batang <strong className="text-emerald-600 dark:text-[#39FF14]">Hijau (Masuk Kerja)</strong> disambung Batang <strong className="text-sky-600 dark:text-[#00F0FF]">Biru (Jam Lembur)</strong> di atasnya.
            </p>
          </div>

          {/* Color Legends - Berjarak Lega, Rapi & Elegan */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-mono pt-1">
            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-emerald-500/30 dark:border-emerald-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-emerald-500/40 shrink-0" />
              <span className="font-bold text-emerald-900 dark:text-[#34D399]">Masuk Kerja</span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-sky-500/30 dark:border-sky-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#00F0FF] ring-2 ring-sky-500/40 shrink-0" />
              <span className="font-bold text-sky-900 dark:text-[#00F0FF]">Lembur</span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-amber-500/30 dark:border-amber-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] ring-2 ring-amber-500/40 shrink-0" />
              <span className="font-bold text-amber-900 dark:text-[#F59E0B]">Sakit</span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-pink-500/30 dark:border-pink-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#EC4899] ring-2 ring-pink-500/40 shrink-0" />
              <span className="font-bold text-pink-900 dark:text-[#EC4899]">Izin</span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-purple-500/30 dark:border-purple-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#A855F7] ring-2 ring-purple-500/40 shrink-0" />
              <span className="font-bold text-purple-900 dark:text-[#A855F7]">Cuti</span>
            </div>
          </div>
        </div>

        {/* Pinned Telemetry Inspector (FIXED TOOLTIP: 100% VISIBLE, NEVER CUT OFF) */}
        <div className="p-3 rounded-md bg-[#0A0A12] border border-[#00F0FF]/30 text-xs font-mono min-h-[44px] flex items-center justify-between gap-3">
          {hoveredDay ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] font-bold border border-[#00F0FF]/30">
                {formatTanggal(hoveredDay.dateStr)}
              </span>
              <span className="text-white">
                Status:{' '}
                <strong className={
                  hoveredDay.status === 'masuk' ? 'text-[#39FF14]' :
                  hoveredDay.status === 'sakit' ? 'text-[#F59E0B]' :
                  hoveredDay.status === 'izin' ? 'text-[#EC4899]' :
                  hoveredDay.status === 'cuti' ? 'text-[#A855F7]' : 'text-[#7A7A99]'
                }>
                  {hoveredDay.status.toUpperCase()}
                </strong>
                {hoveredDay.jamReguler > 0 && ` (${hoveredDay.jamReguler} jam reguler)`}
              </span>
              {hoveredDay.jamLembur > 0 && (
                <span className="text-[#00F0FF] font-bold">
                  + Lembur: {hoveredDay.jamLembur} Jam ({formatRupiah(hoveredDay.nominal)})
                </span>
              )}
              {hoveredDay.catatan && (
                <span className="text-[#b9cacb] italic">"{hoveredDay.catatan}"</span>
              )}
            </div>
          ) : (
            <div className="text-[#b9cacb] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
              <span>Arahkan kursor atau klik batang kalender untuk melihat rincian & mengedit status hari.</span>
            </div>
          )}
          <span className="text-[10px] text-[#7A7A99] shrink-0">Klik batang untuk ubah status</span>
        </div>

        {/* Mobile / Tablet Horizontal Scroll Guide */}
        <div className="flex md:hidden items-center justify-between text-[11px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/25 px-2.5 py-1.5 rounded mb-2">
          <span>⟷ Geser grafik untuk melihat semua tanggal</span>
          <span className="text-[10px] text-white/50">{timelineDays.length} Hari</span>
        </div>

        {/* Stacked Chart Area */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            {/* Chart Area with Left Y-Axis Rail and Plotting Canvas */}
            <div className="bg-[#0A0A12] border border-white/15 rounded-lg p-3 sm:p-4">
              <div className="relative flex w-full" style={{ height: '220px' }}>
                {/* Unified Reference Lines Layer: Label Badge + Tick Line + Dashed Gridline in ONE Single Continuous Row */}
                <div className="absolute inset-0 pointer-events-none select-none z-0">
                  {[4, 8, 12, 16, 20].filter(h => h <= maxTotalHours).map((h) => {
                    const pct = (h / maxTotalHours) * 100;
                    return (
                      <div
                        key={`ref-${h}`}
                        className="absolute left-0 right-0 flex items-center"
                        style={{ bottom: `${pct}%`, transform: 'translateY(50%)' }}
                      >
                        {/* Left Label + Tick Rail Area */}
                        <div className="w-36 sm:w-40 flex items-center justify-end pr-0 shrink-0">
                          <span
                            className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border whitespace-nowrap mr-1 ${
                              h === 8
                                ? 'text-[#34D399] bg-[#0A0A12] border-[#10B981]/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                : h === 12
                                ? 'text-[#00F0FF] bg-[#0A0A12] border-[#00F0FF]/60 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                                : 'text-[#7A7A99] bg-[#0A0A12] border-white/10'
                            }`}
                          >
                            {h} Jam {h === 8 ? 'Normal' : h === 12 ? 'Maks' : ''}
                          </span>
                          <div
                            className={`w-2 h-[1px] ${
                              h === 8 ? 'bg-[#10B981]' : h === 12 ? 'bg-[#00F0FF]' : 'bg-white/20'
                            }`}
                          />
                        </div>

                        {/* Right Dashed Gridline across plotting canvas - perfectly continuous with tick */}
                        <div
                          className={`flex-1 border-b border-dashed ${
                            h === 8
                              ? 'border-[#10B981]/50'
                              : h === 12
                              ? 'border-[#00F0FF]/50'
                              : 'border-white/15'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Left Y-Axis Rail Spacer */}
                <div className="w-36 sm:w-40 h-full relative shrink-0 pointer-events-none select-none" />

                {/* Plotting Box: Columns in the Exact Same Coordinate Space */}
                <div className="relative flex-1 h-full border-l border-b border-white/20 z-10">
                  {/* Columns Row */}
                  <div className="absolute inset-0 flex items-end gap-1 sm:gap-1.5 px-1 sm:px-2">
                    {timelineDays.map((item) => {
                      const totalJam = item.jamReguler + item.jamLembur;
                      const hasRegular = item.jamReguler > 0 && item.status === 'masuk';
                      const hasOvertime = item.jamLembur > 0;
                      const isSick = item.status === 'sakit';
                      const isIzin = item.status === 'izin';
                      const isCuti = item.status === 'cuti';

                      const regularPct = hasRegular ? (item.jamReguler / maxTotalHours) * 100 : 0;
                      const overtimePct = hasOvertime ? (item.jamLembur / maxTotalHours) * 100 : 0;
                      // Balok Sakit/Izin/Cuti proporsional dan tidak lebih besar dari hari kerja normal
                      const absentBarHours = settings.defaultSistem === '6_hari' ? 5 : 6;
                      const sickPct = isSick ? (absentBarHours / maxTotalHours) * 100 : 0;
                      const izinPct = isIzin ? (absentBarHours / maxTotalHours) * 100 : 0;
                      const cutiPct = isCuti ? (absentBarHours / maxTotalHours) * 100 : 0;

                      return (
                        <div
                          key={item.dateStr}
                          onClick={() => handleDayBarClick(item.dateStr)}
                          onMouseEnter={() => setHoveredDay(item)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className="flex-1 h-full flex flex-col justify-end items-center cursor-pointer group hover:bg-white/[0.04] rounded-t transition-colors relative"
                        >
                          {/* Floating Top Badge */}
                          {(totalJam > 0 || isSick || isIzin || isCuti) && (
                            <div
                              className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap"
                              style={{
                                bottom: `${Math.min(96, (hasRegular ? regularPct : 0) + (hasOvertime ? overtimePct : 0) + (isSick ? sickPct : 0) + (isIzin ? izinPct : 0) + (isCuti ? cutiPct : 0))}%`,
                                marginBottom: '4px',
                              }}
                            >
                              {hasOvertime && hasRegular ? (
                                <span className="text-[10px] font-mono font-extrabold text-[#00F0FF] bg-[#0A0A12] px-1 py-0.2 rounded border border-[#00F0FF]/60 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                                  {totalJam}j
                                </span>
                              ) : hasOvertime ? (
                                <span className="text-[10px] font-mono font-extrabold text-[#00F0FF] bg-[#0A0A12] px-1 py-0.2 rounded border border-[#00F0FF]/60 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                                  +{item.jamLembur}j
                                </span>
                              ) : hasRegular ? (
                                <span className="text-[10px] font-mono font-bold text-[#34D399] bg-[#0A0A12]/90 px-1 py-0.2 rounded border border-[#10B981]/30">
                                  {item.jamReguler}j
                                </span>
                              ) : isSick ? (
                                <span className="text-[9px] font-mono font-bold text-[#F59E0B] bg-[#0A0A12] px-1 py-0.2 rounded border border-[#F59E0B]/30">
                                  Sakit
                                </span>
                              ) : isIzin ? (
                                <span className="text-[9px] font-mono font-bold text-[#EC4899] bg-[#0A0A12] px-1 py-0.2 rounded border border-[#EC4899]/30">
                                  Izin
                                </span>
                              ) : isCuti ? (
                                <span className="text-[9px] font-mono font-bold text-[#A855F7] bg-[#0A0A12] px-1 py-0.2 rounded border border-[#A855F7]/30">
                                  Cuti
                                </span>
                              ) : null}
                            </div>
                          )}

                          {/* Stacked Bars Container */}
                          <div className="w-full max-w-[28px] h-full flex flex-col justify-end items-center relative z-10">
                            {/* Top Bar: Overtime (Cyan/Electric Blue) */}
                            {hasOvertime && (
                              <div
                                style={{ height: `${overtimePct}%` }}
                                className="w-full rounded-t-sm bg-gradient-to-t from-[#0284C7] to-[#00F0FF] border-t border-x border-[#38BDF8] shadow-[0_0_12px_rgba(0,240,255,0.45)] group-hover:brightness-125 transition-all flex items-center justify-center relative select-none"
                                title={`Lembur: ${item.jamLembur} jam`}
                              >
                                {item.jamLembur >= 2 && (
                                  <span className="text-[9px] font-mono font-extrabold text-[#0A0A12] leading-none drop-shadow">
                                    +{item.jamLembur}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Bottom Bar: Regular Hours (Green) */}
                            {hasRegular && (
                              <div
                                style={{ height: `${regularPct}%` }}
                                className={`w-full bg-gradient-to-t from-[#059669] to-[#10B981] border-x border-b border-[#34D399] shadow-[0_0_10px_rgba(160,185,129,0.35)] group-hover:brightness-125 transition-all flex items-center justify-center relative select-none ${
                                  hasOvertime ? 'rounded-none border-t border-t-[#0284C7]/60' : 'rounded-t-sm border-t'
                                }`}
                                title={`Masuk Kerja Normal: ${item.jamReguler} jam`}
                              >
                                {item.jamReguler >= 4 && (
                                  <span className="text-[9px] font-mono font-bold text-[#0A0A12] select-none">
                                    {item.jamReguler}j
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Sakit (Orange) - Polos Elegan Tanpa Teks Dobel */}
                            {isSick && (
                              <div
                                style={{ height: `${sickPct}%` }}
                                className="w-full rounded-t-sm bg-gradient-to-t from-[#D97706] to-[#F59E0B] border border-[#FBBF24] shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-all select-none"
                                title="Sakit"
                              />
                            )}

                            {/* Izin (Pink) - Polos Elegan Tanpa Teks Dobel */}
                            {isIzin && (
                              <div
                                style={{ height: `${izinPct}%` }}
                                className="w-full rounded-t-sm bg-gradient-to-t from-[#BE185D] to-[#EC4899] border border-[#F472B6] shadow-[0_0_10px_rgba(236,72,153,0.45)] transition-all select-none"
                                title="Izin"
                              />
                            )}

                            {/* Cuti (Purple / Ungu) - Polos Elegan Tanpa Teks Dobel */}
                            {isCuti && (
                              <div
                                style={{ height: `${cutiPct}%` }}
                                className="w-full rounded-t-sm bg-gradient-to-t from-[#7E22CE] to-[#A855F7] border border-[#C084FC] shadow-[0_0_10px_rgba(168,85,247,0.45)] transition-all select-none"
                                title="Cuti Resmi"
                              />
                            )}

                            {/* Off Day Baseline */}
                            {!hasRegular && !hasOvertime && !isSick && !isIzin && !isCuti && (
                              <div className="w-full h-1.5 bg-white/10 rounded-full group-hover:bg-[#00F0FF]/30 transition-colors my-0.5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* High-Contrast Date Numbers Row Directly Below Plotting Area */}
              <div className="flex w-full mt-2.5">
                <div className="w-36 sm:w-40 shrink-0" />
                <div className="flex-1 flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2">
                  {timelineDays.map((item) => {
                    const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6;
                    return (
                      <div
                        key={item.dateStr}
                        onClick={() => handleDayBarClick(item.dateStr)}
                        className="flex-1 text-center cursor-pointer"
                      >
                        <span
                          className={`block text-[10px] sm:text-[11px] font-mono font-bold py-0.5 rounded transition-all ${
                            item.jamLembur > 0
                              ? 'bg-[#00F0FF] text-[#0A0A12] shadow-[0_0_6px_rgba(0,240,255,0.4)]'
                              : item.status === 'sakit'
                              ? 'bg-[#F59E0B] text-[#0A0A12]'
                              : item.status === 'izin'
                              ? 'bg-[#EC4899] text-white shadow-[0_0_6px_rgba(236,72,153,0.4)]'
                              : item.status === 'cuti'
                              ? 'bg-[#A855F7] text-white shadow-[0_0_6px_rgba(168,85,247,0.4)]'
                              : item.jamReguler > 0
                              ? 'text-[#39FF14]'
                              : isWeekend
                              ? 'text-[#7A7A99]'
                              : 'text-[#b9cacb]'
                          }`}
                          title={`${formatTanggal(item.dateStr)} (Klik untuk edit)`}
                        >
                          {item.dayNum}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="text-center text-[10px] font-mono text-[#b9cacb] mt-2">
              Klik pada tanggal untuk mengganti status kehadiran (Masuk, Sakit, Izin, Cuti, Libur)
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries & Statutory Check */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Entri Terbaru Dalam Periode Ini */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00F0FF]" />
                Entri Lembur Periode Ini
              </h2>
              <p className="text-xs text-[#7A7A99] font-mono">
                {rangeEntries.length} entri lembur tercatat dalam rentang {activeDateRange.label}
              </p>
            </div>
            <button
              onClick={() => {
                triggerPopunder(isPro);
                onNavigateToHistory();
              }}
              className="text-xs font-mono text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Buka Riwayat Lengkap ({entries.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {rangeEntries.length === 0 ? (
            <div className="p-8 text-center rounded border border-dashed border-white/10 bg-[#0A0A12]/40">
              <Sparkles className="w-8 h-8 text-[#00F0FF] mx-auto mb-2 opacity-60" />
              <div className="text-sm font-semibold text-white">Belum Ada Lembur di Periode Ini</div>
              <p className="text-xs text-[#7A7A99] mt-1 max-w-sm mx-auto">
                Gunakan tombol di bawah untuk menghitung lembur baru (baik aturan PP 35/2021 maupun tarif manual perusahaan).
              </p>
              <button
                onClick={() => {
                  triggerPopunder(isPro);
                  onNavigateToCalculator();
                }}
                className="mt-4 px-4 py-2 rounded bg-[#00F0FF] text-[#0A0A12] font-bold text-xs font-mono hover:bg-[#7df4ff] transition-all cursor-pointer"
              >
                + Hitung Lembur Sekarang
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5 font-mono">
              {rangeEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors rounded px-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-bold">
                        {formatTanggal(entry.tanggal)}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border uppercase ${
                        entry.jenisHari === 'minggu' || entry.jenisHari === 'libur'
                          ? 'border-[#FF2BD6]/40 text-[#FF2BD6] bg-[#FF2BD6]/10'
                          : entry.jenisHari === 'sabtu'
                          ? 'border-[#00F0FF]/40 text-[#00F0FF] bg-[#00F0FF]/10'
                          : 'border-white/20 text-[#b9cacb]'
                      }`}>
                        {entry.jenisHari === 'libur' ? 'LIBUR' : entry.jenisHari} {entry.libur ? '(Resmi)' : ''}
                      </span>
                      <span className="text-xs text-[#7A7A99]">
                        • {entry.jamLembur} jam
                      </span>
                      {entry.modeHitung && entry.modeHitung !== 'pp35' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFE600]/15 text-[#FFE600] border border-[#FFE600]/30 font-bold">
                          TARIF PERUSAHAAN
                        </span>
                      )}
                    </div>
                    {entry.catatan && (
                      <div className="text-xs text-white/90 font-sans font-medium mt-1 truncate max-w-md">
                        Catatan: <span className="text-[#00F0FF]">{entry.catatan}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-sm font-bold text-[#39FF14]">
                      {formatRupiah(entry.totalLembur)}
                    </span>
                    <button
                      onClick={() => onOpenReceipt(entry)}
                      className="px-2.5 py-1 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#00F0FF] text-[#00F0FF] text-xs flex items-center gap-1 transition-all"
                      title="Lihat Slip Gambar PNG"
                    >
                      <Share2 className="w-3 h-3" />
                      <span className="text-[10px]">Slip</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Statutory PP 35/2021 Rules & Quick Audit */}
        <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#FFE600] font-bold text-sm mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Audit Jam Lembur Periode</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded bg-[#1A1A2E] border border-white/5">
                <div className="text-[#b9cacb] text-[11px]">Batas Lembur Mingguan</div>
                <div className="text-white font-bold mt-1 flex items-center justify-between">
                  <span>Maksimal 18 Jam / Minggu</span>
                  <span className="text-[#39FF14] text-[10px] font-normal">Pasal 26 (1)</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-[#00F0FF] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalJamLembur / 72) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-[#1A1A2E] border border-white/5">
                <div className="text-[#b9cacb] text-[11px]">Metode Perhitungan Fleksibel</div>
                <div className="text-white font-bold mt-1">
                  Mendukung PP 35 & Aturan Internal
                </div>
                <p className="text-[10px] text-[#7A7A99] font-sans mt-1">
                  Kalkulator kini menyediakan pilihan lembur PP 35/2021 dan tarif flat/nominal khusus perusahaan.
                </p>
              </div>

              <div className="p-3 rounded bg-[#1A1A2E] border border-white/5">
                <div className="text-[#b9cacb] text-[11px]">Status Kehadiran Periode Ini</div>
                <div className="text-white font-bold mt-1 flex items-center justify-between">
                  <span>{totalHariMasuk} Hadir • {totalHariSakit} Sakit • {totalHariIzin} Izin • {totalHariCuti} Cuti</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <button
              onClick={() => {
                triggerPopunder(isPro);
                onNavigateToSalary();
              }}
              className="w-full py-2.5 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Simulasi Slip Gaji Periode Ini <ChevronRight className="w-3.5 h-3.5 text-[#00F0FF]" />
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        selectedDate={modalDate}
        attendanceMap={attendanceMap}
        sistem={settings.defaultSistem}
        onSaveRecord={onSaveAttendance}
        onDeleteRecord={onDeleteAttendance}
      />
    </div>
  );
};
