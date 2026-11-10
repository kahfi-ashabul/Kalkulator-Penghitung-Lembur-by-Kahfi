import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  Save, 
  Copy, 
  Share2, 
  ExternalLink, 
  AlertTriangle, 
  Check, 
  Info, 
  Clock, 
  Calendar,
  DollarSign,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  SistemKerja, 
  JenisHari, 
  OvertimeEntry, 
  UserSettings, 
  OvertimeCalculationResult,
  OvertimeCalculationMode 
} from '../../types/overtime';
import { calculateOvertime, formatRupiah, formatJam, parseRupiah, formatTanggal, detectAutoDayType, getNamaHari } from '../../utils/calculations';
import { playCyberClick, playCyberSuccess } from '../../utils/audio';
import { useAuth } from '../../context/AuthContext';
import { triggerPopunder } from '../../utils/adManager';


interface OvertimeCalculatorScreenProps {
  settings: UserSettings;
  onSaveEntry: (entry: OvertimeEntry) => void;
  onOpenReceipt: (calcResult: OvertimeCalculationResult, date: string, note?: string) => void;
  onOpenLegal: () => void;
}

export const OvertimeCalculatorScreen: React.FC<OvertimeCalculatorScreenProps> = ({
  settings,
  onSaveEntry,
  onOpenReceipt,
  onOpenLegal,
}) => {
  const { isPro } = useAuth();
  // Input states
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().slice(0, 10));
  const [gajiPokok, setGajiPokok] = useState<number>(settings.defaultGajiPokok || 6000000);
  const [gajiPokokStr, setGajiPokokStr] = useState<string>((settings.defaultGajiPokok || 6000000).toLocaleString('id-ID'));
  const [tunjanganTetap, setTunjanganTetap] = useState<number>(settings.defaultTunjangan || 0);
  const [tunjanganTetapStr, setTunjanganTetapStr] = useState<string>((settings.defaultTunjangan || 0).toLocaleString('id-ID'));
  
  const [sistem, setSistem] = useState<SistemKerja>(settings.defaultSistem || '5_hari');
  const [jenisHari, setJenisHari] = useState<JenisHari>(() =>
    detectAutoDayType(new Date().toISOString().slice(0, 10), settings.defaultSistem || '5_hari')
  );
  const [liburResmi, setLiburResmi] = useState<boolean>(false);
  const [isHariTerpendek, setIsHariTerpendek] = useState<boolean>(false);

  const [modeHitung, setModeHitung] = useState<OvertimeCalculationMode>('pp35');
  const [upahHarianPokok, setUpahHarianPokok] = useState<number>(settings.defaultUpahHarian || 200000);
  const [upahHarianPokokStr, setUpahHarianPokokStr] = useState<string>((settings.defaultUpahHarian || 200000).toLocaleString('id-ID'));
  const [manualRatePerJam, setManualRatePerJam] = useState<number>(30000);
  const [manualRatePerJamStr, setManualRatePerJamStr] = useState<string>('30.000');
  const [manualTotalNominal, setManualTotalNominal] = useState<number>(150000);
  const [manualTotalNominalStr, setManualTotalNominalStr] = useState<string>('150.000');

  // Method for regular day: 'direct' or 'total_jam'
  const [inputModeBiasa, setInputModeBiasa] = useState<'direct' | 'total_jam'>('direct');
  const [totalJamKerja, setTotalJamKerja] = useState<number>(10);
  const [jamKerjaReguler, setJamKerjaReguler] = useState<number>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const day = new Date(today + 'T00:00:00').getDay();
    if (settings.defaultSistem === '6_hari') {
      return day === 6 ? 5 : 7;
    }
    return 8;
  });
  const [jamLembur, setJamLembur] = useState<number>(8);
  const [catatan, setCatatan] = useState<string>('');

  // UI feedback states
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Update jam lembur if using totalJamKerja on normal days
  useEffect(() => {
    if (jenisHari === 'biasa' && inputModeBiasa === 'total_jam') {
      const calculated = Math.max(0, totalJamKerja - jamKerjaReguler);
      setJamLembur(calculated);
    }
  }, [jenisHari, inputModeBiasa, totalJamKerja, jamKerjaReguler]);

  const isLiburCategoryActive = jenisHari === 'libur' || jenisHari === 'sabtu' || jenisHari === 'minggu' || liburResmi;
  const isBiasaCategoryActive = !isLiburCategoryActive;

  // Execute pure calculation
  const calcResult = calculateOvertime({
    gajiPokok,
    tunjanganTetap,
    sistem,
    jenisHari,
    liburResmi,
    isHariTerpendek,
    jamLembur,
    modeHitung,
    manualRatePerJam,
    manualTotalNominal,
    upahHarianPokok,
  });

  const handleGajiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseRupiah(e.target.value);
    setGajiPokok(raw);
    setGajiPokokStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
  };

  const handleTunjanganChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseRupiah(e.target.value);
    setTunjanganTetap(raw);
    setTunjanganTetapStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
  };

  const handleTanggalChange = (newDate: string) => {
    setTanggal(newDate);
    if (!liburResmi) {
      const autoDay = detectAutoDayType(newDate, sistem);
      setJenisHari(autoDay);
    }
    if (sistem === '6_hari') {
      const day = new Date(newDate + 'T00:00:00').getDay();
      setJamKerjaReguler(day === 6 ? 5 : 7);
    } else {
      setJamKerjaReguler(8);
    }
  };

  const handleReset = () => {
    if (settings.audioFeedback) playCyberClick();
    const today = new Date().toISOString().slice(0, 10);
    setTanggal(today);
    setGajiPokok(settings.defaultGajiPokok || 6000000);
    setGajiPokokStr((settings.defaultGajiPokok || 6000000).toLocaleString('id-ID'));
    setTunjanganTetap(0);
    setTunjanganTetapStr('0');
    setSistem(settings.defaultSistem || '5_hari');
    setJenisHari(detectAutoDayType(today, settings.defaultSistem || '5_hari'));
    setLiburResmi(false);
    setIsHariTerpendek(false);
    setJamLembur(8);
    setTotalJamKerja(10);
    setJamKerjaReguler(settings.defaultSistem === '6_hari' ? (new Date(today + 'T00:00:00').getDay() === 6 ? 5 : 7) : 8);
    setCatatan('');
    setSavedSuccess(false);
  };

  const handleQuickHour = (h: number) => {
    if (settings.audioFeedback) playCyberClick();
    setJamLembur(h);
  };

  const handleSaveToHistory = () => {
    if (calcResult.totalUpahLembur <= 0 && jamLembur <= 0) return;
    if (settings.audioFeedback) playCyberSuccess();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00F0FF', '#39FF14', '#FF2BD6'],
      });
    } catch {
      // Ignore if unavailable
    }

    const newEntry: OvertimeEntry = {
      id: `khf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tanggal,
      sistem,
      jenisHari,
      libur: liburResmi,
      isHariTerpendek,
      totalJamKerja: jenisHari === 'biasa' && inputModeBiasa === 'total_jam' ? totalJamKerja : undefined,
      jamKerjaReguler: jenisHari === 'biasa' && inputModeBiasa === 'total_jam' ? jamKerjaReguler : undefined,
      jamLembur,
      upahSebulan: calcResult.upahSebulan,
      upahSejam: calcResult.upahSejam,
      totalLembur: calcResult.totalUpahLembur,
      catatan,
      dibuat: new Date().toISOString(),
      breakdown: calcResult.breakdown,
      modeHitung,
      manualRatePerJam: modeHitung === 'manual_flat' || modeHitung === 'manual_incentive' ? manualRatePerJam : undefined,
      upahHarianPokok: modeHitung === 'manual_incentive' ? upahHarianPokok : undefined,
    };

    triggerPopunder(isPro);
    onSaveEntry(newEntry);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopySummary = () => {
    triggerPopunder(isPro);
    if (settings.audioFeedback) playCyberClick();
    const isCustom = modeHitung !== 'pp35';
    const modeBadge = isCustom 
      ? 'MODE INSENTIF MANDIRI (NON-PP 35/2021)' 
      : 'STANDAR RESMI PP 35/2021';

    const jenisHariLabel = (jenisHari === 'libur' || jenisHari === 'sabtu' || jenisHari === 'minggu')
      ? 'Hari Libur / Istirahat'
      : 'Hari Kerja Biasa';

    const text = [
      `*ESTIMASI LEMBUR: [${modeBadge}]*`,
      `Tanggal: ${formatTanggal(tanggal)} (${getNamaHari(tanggal)})`,
      `Sistem: ${sistem === '5_hari' ? '5 Hari Kerja' : '6 Hari Kerja'} | Jenis: ${jenisHariLabel}${liburResmi ? ' (Libur Resmi)' : ''}`,
      modeHitung === 'manual_incentive' ? `Upah Harian Pokok: ${formatRupiah(upahHarianPokok)}` : '',
      `Total Jam Lembur: ${jamLembur} Jam`,
      modeHitung === 'pp35'
        ? `Upah Sejam (1/173): ${formatRupiah(calcResult.upahSejam)}`
        : `Tarif Insentif: ${formatRupiah(calcResult.upahSejam)}/jam`,
      `----------------------------`,
      `*TOTAL HAK UPAH LEMBUR: ${formatRupiah(calcResult.totalUpahLembur)}*`,
      modeHitung === 'manual_incentive'
        ? `*Total Terima Hari Ini (Upah Harian + Lembur): ${formatRupiah(upahHarianPokok + calcResult.totalUpahLembur)}*`
        : '',
      isCustom ? `[Perhatian: Dihitung berdasar kesepakatan mandiri/insentif perusahaan, bukan rumus baku PP 35/2021]` : '',
      catatan ? `Catatan: ${catatan}` : '',
      `Dihitung via Kalkulator Penghitung Lembur by Kahfi`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    triggerPopunder(isPro);
    const jenisHariLabel = (jenisHari === 'libur' || jenisHari === 'sabtu' || jenisHari === 'minggu')
      ? 'HARI LIBUR / ISTIRAHAT'
      : 'HARI KERJA BIASA';

    const text = [
      `*RINCIAN UPAH LEMBUR KARYAWAN*`,
      `Sesuai PP No. 35 Tahun 2021`,
      `Tanggal: ${formatTanggal(tanggal)} (${getNamaHari(tanggal)})`,
      `Total Lembur: ${jamLembur} Jam (${jenisHariLabel})`,
      `Upah Sejam: ${formatRupiah(calcResult.upahSejam)}`,
      `*Hak Lembur Kotor: ${formatRupiah(calcResult.totalUpahLembur)}*`,
      catatan ? `Catatan: ${catatan}` : '',
      `Estimasi mandiri by Kahfi Labor Engine`,
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Screen Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-[#12121F] border border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-heading">
            Kalkulator Hitung Lembur
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
              PP 35/2021
            </span>
          </h1>
          <p className="text-xs text-[#b9cacb] mt-0.5 font-sans">
            Hitung lembur hari libur/istirahat serta hari kerja biasa dengan deteksi hari otomatis dan rincian per jam transparan.
          </p>
        </div>

        <button
          onClick={onOpenLegal}
          className="text-xs font-mono text-[#FFE600] hover:underline flex items-center gap-1.5 self-start sm:self-center bg-[#1A1A2E] px-3 py-1.5 rounded border border-[#FFE600]/30"
        >
          <Info className="w-3.5 h-3.5" />
          Lihat Aturan Pengali (Pasal 31)
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Tier Parameter Inputs (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Metode Hitung & Komponen Upah */}
          <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold font-mono text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#00F0FF]" />
                1. METODE PERHITUNGAN LEMBUR
              </span>
              <span className="text-[11px] text-[#00F0FF] font-mono">
                {modeHitung === 'pp35' ? 'PP 35/2021 (Resmi)' : 'Aturan Khusus Perusahaan'}
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (settings.audioFeedback) playCyberClick();
                  setModeHitung('pp35');
                }}
                className={`p-2.5 rounded border text-left font-mono transition-all ${
                  modeHitung === 'pp35'
                    ? 'bg-[#1A1A2E] border-[#00F0FF] text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>PP 35/2021 (Resmi)</span>
                  {modeHitung === 'pp35' && <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />}
                </div>
                <div className="text-[10px] text-[#b9cacb] mt-0.5">Rumus 1/173 & Pengali UU</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (settings.audioFeedback) playCyberClick();
                  setModeHitung('manual_incentive');
                }}
                className={`p-2.5 rounded border text-left font-mono transition-all ${
                  modeHitung === 'manual_incentive'
                    ? 'bg-[#1A1A2E] border-[#39FF14] text-white shadow-[0_0_12px_rgba(57,255,20,0.25)]'
                    : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Insentif Mandiri</span>
                  {modeHitung === 'manual_incentive' && <span className="w-2 h-2 rounded-full bg-[#39FF14]" />}
                </div>
                <div className="text-[10px] text-[#39FF14] mt-0.5">Gaji Harian + Lembur Bebas</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (settings.audioFeedback) playCyberClick();
                  setModeHitung('manual_flat');
                }}
                className={`p-2.5 rounded border text-left font-mono transition-all ${
                  modeHitung === 'manual_flat'
                    ? 'bg-[#1A1A2E] border-[#FFE600] text-white shadow-[0_0_12px_rgba(255,230,0,0.25)]'
                    : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:text-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Tarif Flat / Jam</span>
                  {modeHitung === 'manual_flat' && <span className="w-2 h-2 rounded-full bg-[#FFE600]" />}
                </div>
                <div className="text-[10px] text-[#b9cacb] mt-0.5">Tarif Tetap Perusahaan</div>
              </button>
            </div>

            {/* Case 0: Mode Insentif Mandiri (Custom Daily Wage + Custom Overtime Incentive) */}
            {modeHitung === 'manual_incentive' && (
              <div className="space-y-4 pt-1 p-3.5 rounded-lg bg-[#0A0A12] border border-[#39FF14]/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#39FF14] font-mono">
                    MODE INSENTIF MANDIRI (NON-PP 35/2021)
                  </span>
                  <span className="text-[10px] text-[#FFE600] font-mono px-2 py-0.5 rounded bg-[#FFE600]/10 border border-[#FFE600]/30">
                    Kebijakan Internal Kantor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-[#b9cacb] mb-1.5 block">
                      Nominal Gaji Pokok Harian Anda (Rp)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-mono text-xs font-bold text-[#39FF14] bg-[#39FF14]/10 px-1.5 py-0.5 rounded border border-[#39FF14]/30">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={upahHarianPokokStr}
                        onChange={(e) => {
                          const raw = parseRupiah(e.target.value);
                          setUpahHarianPokok(raw);
                          setUpahHarianPokokStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                        }}
                        className="w-full pl-13 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#39FF14]"
                        placeholder="Contoh: 200.000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#b9cacb] mb-1.5 block">
                      Tarif Insentif Lembur per Jam (Rp)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-mono text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/30">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={manualRatePerJamStr}
                        onChange={(e) => {
                          const raw = parseRupiah(e.target.value);
                          setManualRatePerJam(raw);
                          setManualRatePerJamStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                        }}
                        className="w-full pl-13 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF]"
                        placeholder="Contoh: 30.000"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation breakdown summary banner */}
                <div className="p-3 rounded bg-[#12121F] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[#7A7A99]">Perhitungan:</span>{' '}
                    <span className="text-white">
                      {formatRupiah(upahHarianPokok)} (Harian) + ({jamLembur}j × {formatRupiah(manualRatePerJam)})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7A7A99]">Total Diterima Hari Ini:</span>{' '}
                    <span className="text-[#39FF14] font-bold text-sm">
                      {formatRupiah(upahHarianPokok + (jamLembur * manualRatePerJam))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Case 1: PP 35/2021 Inputs */}
            {modeHitung === 'pp35' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-mono text-[#b9cacb] mb-1.5 block">
                      Gaji Pokok Sebulan
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-mono text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/30">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={gajiPokokStr}
                        onChange={handleGajiChange}
                        className="w-full pl-13 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF]"
                        placeholder="6.000.000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-[#b9cacb] mb-1.5 block">
                      Tunjangan Tetap (Jika ada)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-mono text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/30">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={tunjanganTetapStr}
                        onChange={handleTunjanganChange}
                        className="w-full pl-13 pr-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-[#0A0A12] border border-[#00F0FF]/25 space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-[#00F0FF] font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Dasar Upah Bulanan (Pasal 32 Ayat 2 PP 35/2021)</span>
                  </div>
                  <p className="text-[11px] text-[#b9cacb] leading-relaxed">
                    Dasar perhitungan upah lembur adalah <strong className="text-white">Upah Sebulan = Gaji Pokok + Tunjangan Tetap</strong> (seperti tunjangan jabatan, keluarga, atau keahlian). Tunjangan tidak tetap yang besarannya dipengaruhi kehadiran (misal uang makan harian atau transport) <em>tidak dimasukkan</em> sebagai komponen upah lembur.
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7A7A99]">Total Upah Sebulan:</span>
                      <span className="text-white font-bold">{formatRupiah(calcResult.upahSebulan)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#7A7A99]">Upah Sejam (1/173):</span>
                      <span className="text-[#00F0FF] font-bold">{formatRupiah(calcResult.upahSejam)}/jam</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Case 2: Manual Flat Rate per Hour */}
            {modeHitung === 'manual_flat' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-mono text-[#FFE600] font-bold mb-1.5 block">
                    Tarif Lembur Flat Per Jam Perusahaan:
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono text-xs font-bold text-[#FFE600] bg-[#FFE600]/10 px-1.5 py-0.5 rounded border border-[#FFE600]/30">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={manualRatePerJamStr}
                      onChange={(e) => {
                        const raw = parseRupiah(e.target.value);
                        setManualRatePerJam(raw);
                        setManualRatePerJamStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                      }}
                      className="w-full pl-13 pr-3 py-2 rounded bg-[#1A1A2E] border border-[#FFE600]/30 text-white font-mono text-sm focus:outline-none focus:border-[#FFE600]"
                      placeholder="25.000"
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  <span className="text-[#7A7A99] text-[11px]">Pilihan cepat:</span>
                  {[20000, 25000, 30000, 35000, 50000].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        if (settings.audioFeedback) playCyberClick();
                        setManualRatePerJam(rate);
                        setManualRatePerJamStr(rate.toLocaleString('id-ID'));
                      }}
                      className="px-2 py-1 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#FFE600] text-[#b9cacb] hover:text-white"
                    >
                      {formatRupiah(rate)}/jam
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Case 3: Manual Lump Sum Nominal */}
            {modeHitung === 'manual_nominal' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-mono text-[#FF2BD6] font-bold mb-1.5 block">
                    Nominal Borongan Lembur Disepakati:
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono text-xs font-bold text-[#FF2BD6] bg-[#FF2BD6]/10 px-1.5 py-0.5 rounded border border-[#FF2BD6]/30">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={manualTotalNominalStr}
                      onChange={(e) => {
                        const raw = parseRupiah(e.target.value);
                        setManualTotalNominal(raw);
                        setManualTotalNominalStr(raw > 0 ? raw.toLocaleString('id-ID') : '');
                      }}
                      className="w-full pl-13 pr-3 py-2 rounded bg-[#1A1A2E] border border-[#FF2BD6]/30 text-white font-mono text-sm focus:outline-none focus:border-[#FF2BD6]"
                      placeholder="150.000"
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  <span className="text-[#7A7A99] text-[11px]">Pilihan cepat:</span>
                  {[100000, 150000, 200000, 250000, 300000].map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      onClick={() => {
                        if (settings.audioFeedback) playCyberClick();
                        setManualTotalNominal(nom);
                        setManualTotalNominalStr(nom.toLocaleString('id-ID'));
                      }}
                      className="px-2 py-1 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#FF2BD6] text-[#b9cacb] hover:text-white"
                    >
                      {formatRupiah(nom)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Sistem Kerja & Hari Lembur */}
          <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold font-mono text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#FF2BD6]" />
                2. SISTEM KERJA & HARI LEMBUR
              </span>
              <span className="text-[11px] text-[#7A7A99] font-mono">
                Pasal 21 & 31
              </span>
            </div>

            {/* Sistem Kerja Toggle (5 vs 6 Hari) */}
            <div>
              <label className="text-xs font-mono text-[#b9cacb] mb-1.5 block">
                Sistem Hari Kerja Perusahaan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (settings.audioFeedback) playCyberClick();
                    setSistem('5_hari');
                    setJamKerjaReguler(8);
                  }}
                  className={`p-3 rounded text-left transition-all border ${
                    sistem === '5_hari'
                      ? 'bg-[#1A1A2E] border-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.25)] text-white'
                      : 'bg-[#12121F] border-white/10 text-[#7A7A99] hover:border-white/30'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>5 Hari Kerja</span>
                    {sistem === '5_hari' && <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />}
                  </div>
                  <div className="text-[11px] text-[#b9cacb] mt-1 font-mono">
                    8 jam/hari � 40 jam/minggu
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (settings.audioFeedback) playCyberClick();
                    setSistem('6_hari');
                    const day = new Date(tanggal + 'T00:00:00').getDay();
                    setJamKerjaReguler(day === 6 ? 5 : 7);
                  }}
                  className={`p-3 rounded text-left transition-all border ${
                    sistem === '6_hari'
                      ? 'bg-[#1A1A2E] border-[#FF2BD6] shadow-[0_0_16px_rgba(255,43,214,0.25)] text-white'
                      : 'bg-[#12121F] border-white/10 text-[#7A7A99] hover:border-white/30'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>6 Hari Kerja</span>
                    {sistem === '6_hari' && <span className="w-2 h-2 rounded-full bg-[#FF2BD6]" />}
                  </div>
                  <div className="text-[11px] text-[#b9cacb] mt-1 font-mono">
                    7 jam/hari � 40 jam/minggu
                  </div>
                </button>
              </div>
            </div>

            {/* Tanggal & Hari Lembur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-[#b9cacb] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                    Tanggal Lembur
                  </span>
                  {tanggal && (
                    <span className="text-[10px] text-[#00F0FF] font-semibold">
                      {getNamaHari(tanggal)}
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => handleTanggalChange(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#b9cacb] mb-1.5 flex items-center justify-between">
                  <span>Kategori Hari</span>
                  <span className="text-[10px] text-[#7A7A99] font-mono">
                    Deteksi Otomatis & Manual
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (settings.audioFeedback) playCyberClick();
                      setJenisHari('biasa');
                      setLiburResmi(false);
                      setIsHariTerpendek(false);
                    }}
                    className={`p-2.5 rounded text-left font-mono transition-all border ${
                      isBiasaCategoryActive
                        ? 'bg-[#1A1A2E] border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)] text-white'
                        : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Hari Kerja Biasa</span>
                      {isBiasaCategoryActive && <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />}
                    </div>
                    <div className="text-[10px] text-[#00F0FF]/80 mt-1">
                      1,5x jam ke-1 &bull; 2x berikutnya
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (settings.audioFeedback) playCyberClick();
                      setJenisHari('libur');
                    }}
                    className={`p-2.5 rounded text-left font-mono transition-all border ${
                      isLiburCategoryActive
                        ? 'bg-[#1A1A2E] border-[#FF2BD6] shadow-[0_0_12px_rgba(255,43,214,0.25)] text-white'
                        : 'bg-[#0A0A12] border-white/10 text-[#7A7A99] hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Hari Libur / Istirahat</span>
                      {isLiburCategoryActive && (
                        <span className="w-2 h-2 rounded-full bg-[#FF2BD6]" />
                      )}
                    </div>
                    <div className="text-[10px] text-[#FF2BD6]/80 mt-1">
                      2x s.d. 4x upah bertingkat
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox Libur Resmi & Hari Terpendek */}
            <div className="p-3.5 rounded bg-[#161626] border border-white/5 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-white select-none">
                <input
                  type="checkbox"
                  checked={liburResmi}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setLiburResmi(isChecked);
                    if (isChecked) {
                      setJenisHari('libur');
                    } else {
                      setIsHariTerpendek(false);
                      const autoDay = detectAutoDayType(tanggal, sistem);
                      setJenisHari(autoDay);
                    }
                  }}
                  className="accent-[#00F0FF] w-4 h-4 cursor-pointer rounded"
                />
                <span className="font-semibold text-white">
                  Hari Libur Nasional / Resmi Pemerintah
                </span>
                <span className="text-[10px] text-[#00F0FF] font-mono px-1.5 py-0.2 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                  Resmi Pemerintah
                </span>
              </label>

              {/* Checkbox Hari Kerja Terpendek: HANYA muncul untuk sistem 6 hari kerja saat hari libur / istirahat */}
              {sistem === '6_hari' && isLiburCategoryActive && (
                <div className="pt-2 pl-6 border-t border-white/5 space-y-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-white select-none">
                    <input
                      type="checkbox"
                      checked={isHariTerpendek}
                      onChange={(e) => setIsHariTerpendek(e.target.checked)}
                      className="accent-[#FF2BD6] w-4 h-4 cursor-pointer rounded"
                    />
                    <span className="font-semibold text-white">
                      Jatuh pada Hari Kerja Terpendek (5 jam normal)
                    </span>
                    <span className="text-[10px] text-[#FF2BD6] font-mono px-1.5 py-0.2 rounded bg-[#FF2BD6]/15 border border-[#FF2BD6]/40">
                      Pasal 31 ayat (2) b.2
                    </span>
                  </label>
                  <p className="text-[11px] text-[#b9cacb] font-mono leading-relaxed pl-6.5">
                    Centang bila libur resmi jatuh pada hari kerja 5 jam (Sabtu). Pengali: <strong>2x</strong> (jam 1-5), <strong>3x</strong> (jam 6), <strong>4x</strong> (jam 7 dst).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Durasi Jam Lembur */}
          <div className="p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold font-mono text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFE600]" />
                3. DURASI WAKTU LEMBUR
              </span>
              <span className="text-[11px] text-[#39FF14] font-mono">
                Kelipatan 0,5 Jam
              </span>
            </div>

            {/* If hari kerja biasa: Show option between total working hours vs direct overtime */}
            {isBiasaCategoryActive && (
              <div className="p-3 rounded bg-[#1A1A2E] border border-white/10">
                <div className="flex items-center gap-4 text-xs font-mono mb-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="inputMode"
                      checked={inputModeBiasa === 'direct'}
                      onChange={() => setInputModeBiasa('direct')}
                      className="accent-[#00F0FF]"
                    />
                    <span>Input Langsung Jam Lembur</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="inputMode"
                      checked={inputModeBiasa === 'total_jam'}
                      onChange={() => setInputModeBiasa('total_jam')}
                      className="accent-[#00F0FF]"
                    />
                    <span>Hitung dari Total Jam Masuk Kerja</span>
                  </label>
                </div>

                {inputModeBiasa === 'total_jam' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#b9cacb] font-mono mb-1 block">
                          Total Jam Masuk Kerja Hari Itu:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="24"
                            value={totalJamKerja}
                            onChange={(e) => setTotalJamKerja(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 rounded bg-[#0A0A12] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF]"
                            placeholder="Contoh: 10"
                          />
                          <span className="text-xs text-[#7A7A99] font-mono">jam</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#b9cacb] font-mono mb-1 flex items-center justify-between">
                          <span>Jam Kerja Normal Hari Itu:</span>
                          {sistem === '6_hari' && new Date(tanggal + 'T00:00:00').getDay() === 6 && (
                            <span className="text-[10px] text-[#FFE600] font-semibold">
                              (Sabtu = 5 jam)
                            </span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="12"
                            value={jamKerjaReguler}
                            onChange={(e) => setJamKerjaReguler(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 rounded bg-[#0A0A12] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF]"
                          />
                          <span className="text-xs text-[#7A7A99] font-mono">jam</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#161626] border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-[#b9cacb]">
                        Lembur dihitung setelah {jamKerjaReguler} jam kerja normal:
                      </span>
                      <span className="text-white">
                        {totalJamKerja}j - {jamKerjaReguler}j = <strong className="text-[#00F0FF] text-sm">{jamLembur} Jam Lembur</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Direct Jam Lembur Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-[#b9cacb]">
                  Jumlah Jam Lembur Efektif
                </label>
                <span className="text-xs font-mono text-[#00F0FF] font-bold">
                  {jamLembur} Jam
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={jamLembur}
                  onChange={(e) => setJamLembur(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-36 px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-base font-bold focus:outline-none focus:border-[#00F0FF]"
                />

                {/* Quick hour chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[2, 4, 6, 8, 9, 10].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleQuickHour(h)}
                      className={`px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${
                        jamLembur === h
                          ? 'bg-[#00F0FF] text-[#0A0A12] font-bold'
                          : 'bg-[#1A1A2E] text-[#b9cacb] hover:text-white border border-white/10'
                      }`}
                    >
                      {h}j
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setJamLembur((prev) => Math.round((prev + 0.5) * 10) / 10)}
                    className="px-2 py-1.5 rounded text-xs font-mono bg-[#1A1A2E] text-[#39FF14] border border-[#39FF14]/30 hover:bg-[#39FF14]/10"
                    title="Tambah 0.5 jam"
                  >
                    +0.5
                  </button>
                </div>
              </div>
            </div>

            {/* Catatan aktivitas optional */}
            <div>
              <label className="text-xs font-mono text-[#b9cacb] mb-1 block">
                Catatan Pekerjaan (Opsional)
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Deployment sistem produksi, audit inventaris..."
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            {/* Reset button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-mono text-[#7A7A99] hover:text-[#ffb4ab] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Form Hitung
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry & Hourly Breakdown (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Hero Overtime Output Card */}
          <div className="p-6 rounded-lg bg-[#12121F] border border-[#39FF14]/40 shadow-[0_0_24px_rgba(57,255,20,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#39FF14]" />
                TOTAL UPAH LEMBUR (KOTOR)
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                modeHitung === 'pp35'
                  ? 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30'
                  : 'text-[#FFE600] bg-[#FFE600]/10 border-[#FFE600]/30'
              }`}>
                {modeHitung === 'pp35' ? 'PP 35/2021' : 'TARIF PERUSAHAAN'}
              </span>
            </div>

            {/* Hero Number Display */}
            <div className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-[#39FF14] tracking-tight break-words drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]">
              {formatRupiah(calcResult.totalUpahLembur)}
            </div>

            {/* Auxiliary Telemetry Metrics */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[#7A7A99] block text-[11px]">Durasi Hitung:</span>
                <span className="text-white font-bold">{formatJam(jamLembur)}</span>
              </div>
              <div>
                <span className="text-[#7A7A99] block text-[11px]">Upah Sejam:</span>
                <span className="text-[#00F0FF] font-bold">{formatRupiah(calcResult.upahSejam)}</span>
              </div>
            </div>

            {/* Formula display */}
            <div className="mt-3 p-2 rounded bg-black/40 text-[11px] font-mono text-[#b9cacb] border border-white/5">
              📐 Rumus: {calcResult.formula}
            </div>

            {/* Excess Overtime Warning if any */}
            {calcResult.warning && (
              <div className="mt-3 p-2.5 rounded bg-[#FFE600]/10 border border-[#FFE600]/30 text-xs text-[#FFE600] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{calcResult.warning}</span>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <button
              onClick={handleSaveToHistory}
              disabled={calcResult.totalUpahLembur <= 0}
              className={`py-2.5 px-3 rounded font-bold transition-all flex items-center justify-center gap-1.5 ${
                savedSuccess
                  ? 'bg-[#39FF14] text-[#0A0A12]'
                  : 'bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] hover:opacity-95 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
              }`}
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Riwayat'}</span>
            </button>

            <button
              onClick={() => {
                triggerPopunder(isPro);
                onOpenReceipt(calcResult, tanggal, catatan);
              }}
              disabled={calcResult.totalUpahLembur <= 0}
              className="py-2.5 px-3 rounded font-bold text-white bg-gradient-to-r from-[#FF2BD6] to-[#7928CA] hover:opacity-95 transition-all shadow-[0_0_12px_rgba(255,43,214,0.35)] flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" />
              <span>Slip PNG</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="py-2 px-3 rounded bg-[#1A1A2E] border border-white/10 hover:border-[#00F0FF] text-[#00F0FF] transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#39FF14]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-2 px-3 rounded bg-[#1A1A2E] border border-[#39FF14]/30 hover:border-[#39FF14] text-[#39FF14] transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Breakdown Table: Hourly Calculation Matrix */}
          <div className="p-4 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#00F0FF]/20 pb-2">
              <span className="text-xs font-mono font-bold text-white">
                TABEL RINCIAN PER JAM
              </span>
              <span className="text-[10px] font-mono text-[#00F0FF]">
                {calcResult.breakdown.length} Jam Tingkatan
              </span>
            </div>

            {calcResult.breakdown.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7A7A99] font-mono">
                Belum ada jam lembur yang dihitung.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-[#7A7A99] text-[10px] uppercase">
                      <th className="py-1.5 text-left">Jam Ke-</th>
                      <th className="py-1.5 text-center">Pengali</th>
                      <th className="py-1.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {calcResult.breakdown.map((row) => (
                      <tr key={row.hourIndex} className="hover:bg-white/[0.02]">
                        <td className="py-2 text-white">
                          <div className="font-semibold">{row.description}</div>
                          <div className="text-[10px] text-[#7A7A99]">
                            {row.hoursCount} jam � {formatRupiah(row.hourlyRate)}
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${
                              row.multiplier >= 3
                                ? 'border-[#FF2BD6]/40 text-[#FF2BD6] bg-[#FF2BD6]/10'
                                : 'border-[#00F0FF]/40 text-[#00F0FF] bg-[#00F0FF]/10'
                            }`}
                          >
                            {row.multiplier}x
                          </span>
                        </td>
                        <td className="py-2 text-right font-bold text-white">
                          {formatRupiah(row.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#00F0FF]/30 font-bold">
                      <td colSpan={2} className="py-2.5 text-left text-white">
                        TOTAL HASIL
                      </td>
                      <td className="py-2.5 text-right text-[#39FF14] text-sm">
                        {formatRupiah(calcResult.totalUpahLembur)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Statutory Disclaimer Banner */}
          <div className="p-4 rounded bg-[#161626] border-l-4 border-l-[#FFE600] border-t border-r border-b border-white/5 text-xs text-[#b9cacb] space-y-2">
            <div className="flex items-center gap-2 text-[#FFE600] font-bold text-[11px] uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Disclaimer Cara Hitung PP No. 35 Tahun 2021</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              1. Upah per jam menggunakan rumus resmi <strong className="text-white">1/173 � Upah Sebulan</strong> (Gaji Pokok + Tunjangan Tetap).
            </p>
            <p className="text-[11px] leading-relaxed">
              2. Jam istirahat <strong className="text-[#FFE600]">tidak dihitung</strong> sebagai jam kerja efektif.
            </p>
            <p className="text-[11px] leading-relaxed">
              3. Hasil merupakan nilai kotor sebelum potongan pajak PPh 21 atau BPJS. Estimasi mandiri untuk transparansi pekerja.
            </p>
            <div className="pt-1 flex items-center gap-3 text-[10px] text-[#00F0FF] font-mono">
              <a
                href="https://peraturan.bpk.go.id/Details/161904/pp-no-35-tahun-2021"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-0.5"
              >
                PP 35/2021 (BPK) <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span>�</span>
              <a
                href="https://jdih.kemnaker.go.id/peraturan/detail/1723/peraturan-pemerintah-nomor-35-tahun-2021"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-0.5"
              >
                JDIH Kemnaker <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};
