import React, { useState, useMemo, useEffect } from 'react';
import { 
  Banknote, 
  Calendar, 
  DollarSign, 
  MinusCircle, 
  PlusCircle, 
  Copy, 
  Check, 
  Share2, 
  RotateCcw,
  ShieldAlert,
  Percent,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { OvertimeEntry, UserSettings, Deductions } from '../../types/overtime';
import { formatRupiah, parseRupiah, getCutoffDateRange } from '../../utils/calculations';
import { playCyberClick, playCyberSuccess } from '../../utils/audio';

interface SalaryCalculatorScreenProps {
  entries: OvertimeEntry[];
  settings: UserSettings;
}

export const SalaryCalculatorScreen: React.FC<SalaryCalculatorScreenProps> = ({
  entries,
  settings,
}) => {
  const [mode, setMode] = useState<'bulanan' | 'harian'>('bulanan');

  // Month and Cut-off selector for pulling stored overtime
  const [cutoffMode, setCutoffMode] = useState<'kalender' | 'cut_off_20' | 'cut_off_25' | 'custom'>('kalender');
  const [selectedMonth, setSelectedMonth] = useState<number>(11);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [customStart, setCustomStart] = useState<string>('2026-10-21');
  const [customEnd, setCustomEnd] = useState<string>('2026-11-20');
  const [useStoredOvertime, setUseStoredOvertime] = useState<boolean>(true);

  // Sinkronkan default settings ke form gaji saat diubah di Pengaturan tanpa refresh
  useEffect(() => {
    setGajiPokok(settings.defaultGajiPokok || 6000000);
    setGajiPokokStr((settings.defaultGajiPokok || 6000000).toLocaleString('id-ID'));
    setTunjanganTetap(settings.defaultTunjangan || 0);
    setTunjanganTetapStr((settings.defaultTunjangan || 0).toLocaleString('id-ID'));
    setPembagiHari(settings.defaultSistem === '6_hari' ? 25 : 21);
  }, [settings.defaultGajiPokok, settings.defaultTunjangan, settings.defaultSistem]);

  // Bulanan inputs
  const [gajiPokok, setGajiPokok] = useState<number>(settings.defaultGajiPokok || 6000000);
  const [gajiPokokStr, setGajiPokokStr] = useState<string>((settings.defaultGajiPokok || 6000000).toLocaleString('id-ID'));
  const [tunjanganTetap, setTunjanganTetap] = useState<number>(settings.defaultTunjangan || 0);
  const [tunjanganTetapStr, setTunjanganTetapStr] = useState<string>((settings.defaultTunjangan || 0).toLocaleString('id-ID'));
  const [manualOvertime, setManualOvertime] = useState<number>(0);
  const [manualOvertimeStr, setManualOvertimeStr] = useState<string>('0');

  // Harian inputs
  const [upahHarianMode, setUpahHarianMode] = useState<'derived' | 'custom'>('derived');
  const [pembagiHari, setPembagiHari] = useState<number>(settings.defaultSistem === '6_hari' ? 25 : 21);
  const [customUpahHarian, setCustomUpahHarian] = useState<number>(250000);
  const [customUpahHarianStr, setCustomUpahHarianStr] = useState<string>('250.000');
  const [jumlahHariMasuk, setJumlahHariMasuk] = useState<number>(21);

  // Deductions
  const [deductions, setDeductions] = useState<Deductions>({
    bpjsKetenagakerjaan: 180000, // ~3% of 6M
    bpjsKesehatan: 60000, // 1% of 6M
    pph21: 0,
    kasbon: 0,
    lainnya: 0,
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Cut-off date range object
  const activeDateRange = useMemo(() => {
    return getCutoffDateRange(selectedYear, selectedMonth, cutoffMode, customStart, customEnd);
  }, [selectedYear, selectedMonth, cutoffMode, customStart, customEnd]);

  // Overtime sum from Riwayat for selected cut-off date range
  const storedOvertimeAmount = useMemo(() => {
    return entries
      .filter((e) => e.tanggal >= activeDateRange.startDate && e.tanggal <= activeDateRange.endDate)
      .reduce((acc, curr) => acc + curr.totalLembur, 0);
  }, [entries, activeDateRange]);

  const activeOvertimeAmount = useStoredOvertime ? storedOvertimeAmount : manualOvertime;

  // Derived daily rate
  const derivedUpahHarian = Math.round(gajiPokok / (pembagiHari || 1));
  const effectiveUpahHarian = upahHarianMode === 'derived' ? derivedUpahHarian : customUpahHarian;

  // Calculations for Bulanan Mode
  const gajiKotorBulanan = gajiPokok + tunjanganTetap + activeOvertimeAmount;
  const totalPotongan = 
    (deductions.bpjsKetenagakerjaan || 0) +
    (deductions.bpjsKesehatan || 0) +
    (deductions.pph21 || 0) +
    (deductions.kasbon || 0) +
    (deductions.lainnya || 0);

  const takeHomePayBulanan = Math.max(0, gajiKotorBulanan - totalPotongan);

  // Calculations for Harian Mode
  const pendapatanHarianTotal = effectiveUpahHarian * jumlahHariMasuk;
  const gajiKotorHarian = pendapatanHarianTotal + activeOvertimeAmount;
  const takeHomePayHarian = Math.max(0, gajiKotorHarian - totalPotongan);

  const finalTakeHomePay = mode === 'bulanan' ? takeHomePayBulanan : takeHomePayHarian;
  const finalGajiKotor = mode === 'bulanan' ? gajiKotorBulanan : gajiKotorHarian;

  const handleCopySummary = () => {
    if (settings.audioFeedback) playCyberClick();
    const lines = [
      `*SLIP ESTIMASI GAJI (${mode === 'bulanan' ? 'BULANAN' : 'HARIAN'})*`,
      `Karyawan: ${settings.namaKaryawan}`,
      `Perusahaan: ${settings.namaPerusahaan}`,
      `---------------------------------`,
      mode === 'bulanan'
        ? `Gaji Pokok: ${formatRupiah(gajiPokok)}\nTunjangan Tetap: ${formatRupiah(tunjanganTetap)}`
        : `Upah Harian: ${formatRupiah(effectiveUpahHarian)} × ${jumlahHariMasuk} Hari = ${formatRupiah(pendapatanHarianTotal)}`,
      `Hak Upah Lembur: ${formatRupiah(activeOvertimeAmount)}`,
      `*Total Penghasilan Kotor: ${formatRupiah(finalGajiKotor)}*`,
      `---------------------------------`,
      `Potongan BPJS Ketenagakerjaan: -${formatRupiah(deductions.bpjsKetenagakerjaan)}`,
      `Potongan BPJS Kesehatan: -${formatRupiah(deductions.bpjsKesehatan)}`,
      deductions.pph21 ? `Potongan PPh 21: -${formatRupiah(deductions.pph21)}` : '',
      deductions.kasbon ? `Kasbon / Pinjaman: -${formatRupiah(deductions.kasbon)}` : '',
      `Total Seluruh Potongan: -${formatRupiah(totalPotongan)}`,
      `=================================`,
      `*TAKE HOME PAY (BERSIH): ${formatRupiah(finalTakeHomePay)}*`,
      `Estimasi mandiri by Kalkulator Penghitung Lembur by Kahfi`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickPresetPotongan = () => {
    // Standard Indonesian BPJS rates (~3% Ketenagakerjaan, 1% Kesehatan)
    const base = mode === 'bulanan' ? gajiPokok : effectiveUpahHarian * jumlahHariMasuk;
    setDeductions({
      bpjsKetenagakerjaan: Math.round(base * 0.03),
      bpjsKesehatan: Math.round(base * 0.01),
      pph21: 0,
      kasbon: 0,
      lainnya: 0,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-[#12121F] border border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-heading">
            Kalkulator Hitung Gaji Karyawan
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
              GAJI + LEMBUR
            </span>
          </h1>
          <p className="text-xs text-[#b9cacb] mt-0.5 font-sans">
            Hitung estimasi gaji bulanan atau harian, integrasi otomatis upah lembur, dan rincian potongan.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded bg-[#1A1A2E] p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              if (settings.audioFeedback) playCyberClick();
              setMode('bulanan');
            }}
            className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-all ${
              mode === 'bulanan'
                ? 'bg-[#00F0FF] text-[#0A0A12] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-[#7A7A99] hover:text-white'
            }`}
          >
            Mode Bulanan
          </button>
          <button
            type="button"
            onClick={() => {
              if (settings.audioFeedback) playCyberClick();
              setMode('harian');
            }}
            className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-all ${
              mode === 'harian'
                ? 'bg-[#FF2BD6] text-white shadow-[0_0_12px_rgba(255,43,214,0.3)]'
                : 'text-[#7A7A99] hover:text-white'
            }`}
          >
            Mode Harian
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Komponen Upah Pokok */}
          <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold font-mono text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#00F0FF]" />
                1. KOMPONEN PENGHASILAN DASAR
              </span>
              <span className="text-[11px] text-[#7A7A99] font-mono">
                {mode === 'bulanan' ? 'Sistem Bulanan' : 'Sistem Harian'}
              </span>
            </div>

            {mode === 'bulanan' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-[#b9cacb] mb-1.5 block">
                    Gaji Pokok Bulanan
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/30">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={gajiPokokStr}
                      onChange={(e) => {
                        const raw = parseRupiah(e.target.value);
                        setGajiPokok(raw);
                        setGajiPokokStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                      }}
                      className="w-full pl-13 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#b9cacb] mb-1.5 block">
                    Tunjangan Tetap
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/30">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={tunjanganTetapStr}
                      onChange={(e) => {
                        const raw = parseRupiah(e.target.value);
                        setTunjanganTetap(raw);
                        setTunjanganTetapStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                      }}
                      className="w-full pl-13 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mode harian sub-choice */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="harianMode"
                      checked={upahHarianMode === 'derived'}
                      onChange={() => setUpahHarianMode('derived')}
                      className="accent-[#FF2BD6]"
                    />
                    <span>Turunkan dari Gaji Bulanan</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="harianMode"
                      checked={upahHarianMode === 'custom'}
                      onChange={() => setUpahHarianMode('custom')}
                      className="accent-[#FF2BD6]"
                    />
                    <span>Input Nominal Upah Harian Langsung</span>
                  </label>
                </div>

                {upahHarianMode === 'derived' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded bg-[#161626] border border-white/5">
                    <div>
                      <label className="text-xs font-mono text-[#b9cacb] mb-1 block">
                        Gaji Pokok Rujukan Bulanan
                      </label>
                      <input
                        type="text"
                        value={gajiPokokStr}
                        onChange={(e) => {
                          const raw = parseRupiah(e.target.value);
                          setGajiPokok(raw);
                          setGajiPokokStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                        }}
                        className="w-full px-3 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#FF2BD6]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-[#b9cacb] mb-1">
                        <span>Pembagi Hari Kerja:</span>
                        <span className="text-[#FF2BD6] font-bold">{pembagiHari} Hari</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={pembagiHari}
                          onChange={(e) => setPembagiHari(parseInt(e.target.value, 10) || 21)}
                          className="w-20 px-2 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#FF2BD6]"
                        />
                        <span className="text-[11px] text-[#7A7A99]">
                          (Default: 21 hr untuk 5 hari, 25 hr untuk 6 hari)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-mono text-[#b9cacb] mb-1 block">
                      Tarif Upah Harian (Rp/hari)
                    </label>
                    <input
                      type="text"
                      value={customUpahHarianStr}
                      onChange={(e) => {
                        const raw = parseRupiah(e.target.value);
                        setCustomUpahHarian(raw);
                        setCustomUpahHarianStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                      }}
                      className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2BD6]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-[#b9cacb] mb-1 block">
                      Jumlah Hari Masuk Kerja
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={jumlahHariMasuk}
                      onChange={(e) => setJumlahHariMasuk(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2BD6]"
                    />
                  </div>
                  <div className="p-2.5 rounded bg-[#0A0A12] border border-white/10 flex flex-col justify-center">
                    <span className="text-[11px] text-[#7A7A99] font-mono">Total Upah Kehadiran:</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {formatRupiah(pendapatanHarianTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Integrasi Upah Lembur */}
          <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold font-mono text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#39FF14]" />
                2. AKUMULASI UPAH LEMBUR
              </span>
              <span className="text-[11px] text-[#39FF14] font-mono font-bold">
                +{formatRupiah(activeOvertimeAmount)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <label className="flex items-center gap-1.5 cursor-pointer text-white">
                <input
                  type="radio"
                  name="overtimeSource"
                  checked={useStoredOvertime}
                  onChange={() => setUseStoredOvertime(true)}
                  className="accent-[#00F0FF]"
                />
                <span>Ambil Otomatis dari Riwayat Lembur</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-white">
                <input
                  type="radio"
                  name="overtimeSource"
                  checked={!useStoredOvertime}
                  onChange={() => setUseStoredOvertime(false)}
                  className="accent-[#00F0FF]"
                />
                <span>Input Nominal Manual</span>
              </label>
            </div>

            {useStoredOvertime ? (
              <div className="p-3.5 rounded bg-[#161626] border border-white/10 space-y-3 text-xs font-mono">
                {/* Cut-off Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2">
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

                  <div className="text-right">
                    <span className="text-[#7A7A99] text-[10px] block">Lembur Ditarik:</span>
                    <span className="text-sm font-bold text-[#39FF14]">
                      {formatRupiah(storedOvertimeAmount)}
                    </span>
                  </div>
                </div>

                {/* Date pickers */}
                {cutoffMode !== 'custom' ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#00F0FF]" />
                    <span>Bulan:</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                      className="px-2 py-1 rounded bg-[#1A1A2E] border border-white/10 text-white"
                    >
                      {[
                        { val: 1, label: 'Januari' },
                        { val: 2, label: 'Februari' },
                        { val: 3, label: 'Maret' },
                        { val: 4, label: 'April' },
                        { val: 5, label: 'Mei' },
                        { val: 6, label: 'Juni' },
                        { val: 7, label: 'Juli' },
                        { val: 8, label: 'Agustus' },
                        { val: 9, label: 'September' },
                        { val: 10, label: 'Oktober' },
                        { val: 11, label: 'November' },
                        { val: 12, label: 'Desember' },
                      ].map((m) => (
                        <option key={m.val} value={m.val}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                      className="px-2 py-1 rounded bg-[#1A1A2E] border border-white/10 text-white"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                    <span className="text-[11px] text-[#00F0FF] font-bold ml-auto">
                      ({activeDateRange.label})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[#7A7A99]">Mulai:</span>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="px-2 py-1 rounded bg-[#1A1A2E] border border-white/10 text-white text-xs"
                    />
                    <span className="text-[#7A7A99]">s.d.</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="px-2 py-1 rounded bg-[#1A1A2E] border border-white/10 text-white text-xs"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-mono text-[#b9cacb] mb-1 block">
                  Nominal Upah Lembur Tambahan (Rp)
                </label>
                <input
                  type="text"
                  value={manualOvertimeStr}
                  onChange={(e) => {
                    const raw = parseRupiah(e.target.value);
                    setManualOvertime(raw);
                    setManualOvertimeStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                  }}
                  className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
            )}
          </div>

          {/* Section 3: Rincian Potongan */}
          <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold font-mono text-white flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-[#ffb4ab]" />
                3. POTONGAN GAJI (MANUAL / BPJS / KASBON)
              </span>
              <button
                type="button"
                onClick={handleQuickPresetPotongan}
                className="text-[11px] font-mono text-[#00F0FF] hover:underline"
              >
                Hitung Otomatis BPJS Standar (3% + 1%)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-[#b9cacb] mb-1 block">BPJS Ketenagakerjaan (JHT & JP)</label>
                <input
                  type="number"
                  step="5000"
                  value={deductions.bpjsKetenagakerjaan}
                  onChange={(e) =>
                    setDeductions({ ...deductions, bpjsKetenagakerjaan: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#ffb4ab]"
                />
              </div>

              <div>
                <label className="text-[#b9cacb] mb-1 block">BPJS Kesehatan (1%)</label>
                <input
                  type="number"
                  step="5000"
                  value={deductions.bpjsKesehatan}
                  onChange={(e) =>
                    setDeductions({ ...deductions, bpjsKesehatan: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#ffb4ab]"
                />
              </div>

              <div>
                <label className="text-[#b9cacb] mb-1 block">Estimasi PPh 21 / Pajak</label>
                <input
                  type="number"
                  step="10000"
                  value={deductions.pph21}
                  onChange={(e) =>
                    setDeductions({ ...deductions, pph21: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#ffb4ab]"
                />
              </div>

              <div>
                <label className="text-[#b9cacb] mb-1 block">Kasbon / Pinjaman Kantor</label>
                <input
                  type="number"
                  step="50000"
                  value={deductions.kasbon}
                  onChange={(e) =>
                    setDeductions({ ...deductions, kasbon: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#ffb4ab]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Take Home Pay Telemetry & Slip Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Net Pay Card (Hero) */}
          <div className="p-6 rounded-lg bg-[#12121F] border border-[#39FF14]/40 shadow-[0_0_24px_rgba(57,255,20,0.15)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#b9cacb] flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-[#39FF14]" />
                TAKE HOME PAY (GAJI BERSIH)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14]">
                SIAP TERIMA
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#39FF14] tracking-tight drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]">
              {formatRupiah(finalTakeHomePay)}
            </div>

            <div className="p-3 rounded bg-[#0A0A12] border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#7A7A99]">Total Penghasilan Kotor:</span>
                <span className="text-white font-bold">{formatRupiah(finalGajiKotor)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#ffb4ab]">Total Potongan Gaji:</span>
                <span className="text-[#ffb4ab] font-bold">-{formatRupiah(totalPotongan)}</span>
              </div>
            </div>
          </div>

          {/* Detailed Itemized Receipt Card */}
          <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white">STRUKTUR ESTIMASI SLIP GAJI</span>
              <span className="text-[10px] text-[#00F0FF] uppercase">
                {mode === 'bulanan' ? 'BULANAN' : 'HARIAN'}
              </span>
            </div>

            {/* Income breakdown */}
            <div className="space-y-1.5 py-1">
              <div className="text-[11px] text-[#7A7A99] font-bold">PENGHASILAN:</div>
              {mode === 'bulanan' ? (
                <>
                  <div className="flex justify-between text-[#b9cacb]">
                    <span>• Gaji Pokok</span>
                    <span className="text-white">{formatRupiah(gajiPokok)}</span>
                  </div>
                  {tunjanganTetap > 0 && (
                    <div className="flex justify-between text-[#b9cacb]">
                      <span>• Tunjangan Tetap</span>
                      <span className="text-white">{formatRupiah(tunjanganTetap)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between text-[#b9cacb]">
                  <span>• Upah Harian ({jumlahHariMasuk} Hari × {formatRupiah(effectiveUpahHarian)})</span>
                  <span className="text-white">{formatRupiah(pendapatanHarianTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#39FF14] font-semibold">
                <span>• Hak Upah Lembur</span>
                <span>+{formatRupiah(activeOvertimeAmount)}</span>
              </div>
            </div>

            {/* Deductions breakdown */}
            {totalPotongan > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="text-[11px] text-[#ffb4ab] font-bold">POTONGAN:</div>
                {deductions.bpjsKetenagakerjaan > 0 && (
                  <div className="flex justify-between text-[#7A7A99]">
                    <span>• BPJS Ketenagakerjaan</span>
                    <span className="text-[#ffb4ab]">-{formatRupiah(deductions.bpjsKetenagakerjaan)}</span>
                  </div>
                )}
                {deductions.bpjsKesehatan > 0 && (
                  <div className="flex justify-between text-[#7A7A99]">
                    <span>• BPJS Kesehatan</span>
                    <span className="text-[#ffb4ab]">-{formatRupiah(deductions.bpjsKesehatan)}</span>
                  </div>
                )}
                {deductions.pph21 > 0 && (
                  <div className="flex justify-between text-[#7A7A99]">
                    <span>• PPh 21 Estimasi</span>
                    <span className="text-[#ffb4ab]">-{formatRupiah(deductions.pph21)}</span>
                  </div>
                )}
                {deductions.kasbon > 0 && (
                  <div className="flex justify-between text-[#7A7A99]">
                    <span>• Kasbon / Pinjaman</span>
                    <span className="text-[#ffb4ab]">-{formatRupiah(deductions.kasbon)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Summary Net */}
            <div className="pt-3 border-t border-[#00F0FF]/30 flex justify-between items-center text-sm font-bold">
              <span className="text-white">GAJI BERSIH (NET)</span>
              <span className="text-[#39FF14] text-base">{formatRupiah(finalTakeHomePay)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <button
              onClick={handleCopySummary}
              className="py-2.5 px-3 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#00F0FF] text-[#00F0FF] transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-[#39FF14]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Slip Gaji'}</span>
            </button>

            <button
              onClick={() => {
                if (settings.audioFeedback) playCyberSuccess();
                alert('Slip gaji siap diekspor dan dicetak.');
              }}
              className="py-2.5 px-3 rounded bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
