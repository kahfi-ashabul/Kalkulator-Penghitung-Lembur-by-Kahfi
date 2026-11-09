import { 
  HourlyMultiplier, 
  JenisHari, 
  OvertimeCalculationResult, 
  SistemKerja, 
  OvertimeCalculationMode,
  DateRangeFilter
} from '../types/overtime';

/**
 * Menghitung upah lembur sesuai PP No. 35 Tahun 2021 ATAU Tarif Manual Khusus Perusahaan
 */
export function calculateOvertime(params: {
  gajiPokok: number;
  tunjanganTetap: number;
  sistem: SistemKerja;
  jenisHari: JenisHari;
  liburResmi: boolean;
  isHariTerpendek?: boolean;
  jamLembur: number;
  modeHitung?: OvertimeCalculationMode;
  manualRatePerJam?: number;
  manualTotalNominal?: number;
  upahHarianPokok?: number;
}): OvertimeCalculationResult {
  const {
    gajiPokok,
    tunjanganTetap,
    sistem,
    jenisHari,
    liburResmi,
    isHariTerpendek = false,
    jamLembur,
    modeHitung = 'pp35',
    manualRatePerJam = 0,
    manualTotalNominal = 0,
    upahHarianPokok = 0,
  } = params;

  const upahSebulan = Math.max(0, (gajiPokok || 0) + (tunjanganTetap || 0));
  const upahSejamPP35Raw = upahSebulan > 0 ? upahSebulan / 173 : 0;
  const upahSejamPP35 = Math.round(upahSejamPP35Raw);

  // KASUS A: Mode Insentif Mandiri (Upah Harian Sendiri + Lembur/Insentif Sendiri)
  if (modeHitung === 'manual_incentive') {
    const dailyBase = Math.max(0, upahHarianPokok || 0);
    // Bisa berupa tarif per jam atau nominal tetap borongan per shift
    const overtimeRate = manualRatePerJam > 0 ? manualRatePerJam : (manualTotalNominal || 0);
    const overtimeTotal = manualRatePerJam > 0 ? Math.round(jamLembur * manualRatePerJam) : (manualTotalNominal || 0);

    const breakdown: HourlyMultiplier[] = [
      {
        hourIndex: 1,
        multiplier: 1,
        hoursCount: jamLembur,
        hourlyRate: manualRatePerJam > 0 ? manualRatePerJam : overtimeTotal,
        subtotal: overtimeTotal,
        description: manualRatePerJam > 0
          ? `Insentif Lembur: ${formatJam(jamLembur)} × ${formatRupiah(manualRatePerJam)}/jam`
          : `Insentif Lembur Tetap/Shift (${formatJam(jamLembur)})`,
      },
    ];

    return {
      upahSebulan,
      upahSejam: manualRatePerJam > 0 ? manualRatePerJam : (jamLembur > 0 ? Math.round(overtimeTotal / jamLembur) : 0),
      jamLembur,
      totalUpahLembur: overtimeTotal,
      breakdown,
      formula: `Mode Insentif Mandiri: Gaji Harian ${formatRupiah(dailyBase)} + Lembur ${formatRupiah(overtimeTotal)}`,
      modeHitung: 'manual_incentive',
      upahHarianPokok: dailyBase,
    };
  }

  // KASUS B: Manual Flat Per Jam (Tarif Khusus Perusahaan)
  if (modeHitung === 'manual_flat') {
    const rate = Math.max(0, manualRatePerJam || 0);
    const totalUpahLembur = Math.round(jamLembur * rate);
    const breakdown: HourlyMultiplier[] = [];
    let remaining = jamLembur;
    let idx = 1;

    while (remaining > 0) {
      const frac = remaining >= 1 ? 1 : remaining;
      breakdown.push({
        hourIndex: idx,
        multiplier: 1,
        hoursCount: frac,
        hourlyRate: rate,
        subtotal: Math.round(frac * rate),
        description: `Jam ke-${idx} (Tarif Flat Perusahaan: ${formatRupiah(rate)}/jam)`,
      });
      remaining = Math.max(0, remaining - frac);
      idx++;
    }

    return {
      upahSebulan,
      upahSejam: rate,
      jamLembur,
      totalUpahLembur,
      breakdown,
      formula: `${formatJam(jamLembur)} × ${formatRupiah(rate)} (Tarif Flat Perusahaan)`,
      modeHitung: 'manual_flat',
    };
  }

  // KASUS C: Manual Nominal Langsung (Borongan / Kesepakatan Khusus)
  if (modeHitung === 'manual_nominal') {
    const total = Math.max(0, manualTotalNominal || 0);
    const effectiveRate = jamLembur > 0 ? Math.round(total / jamLembur) : total;

    return {
      upahSebulan,
      upahSejam: effectiveRate,
      jamLembur,
      totalUpahLembur: total,
      breakdown: [
        {
          hourIndex: 1,
          multiplier: 1,
          hoursCount: jamLembur,
          hourlyRate: effectiveRate,
          subtotal: total,
          description: `Lembur Borongan/Kesepakatan (${formatJam(jamLembur)})`,
        },
      ],
      formula: `Kesepakatan Nominal Khusus: ${formatRupiah(total)}`,
      modeHitung: 'manual_nominal',
    };
  }

  // KASUS C: Sesuai PP No. 35 Tahun 2021 (Default Standar Pemerintah)
  if (jamLembur <= 0 || upahSebulan <= 0) {
    return {
      upahSebulan,
      upahSejam: upahSejamPP35,
      jamLembur: Math.max(0, jamLembur),
      totalUpahLembur: 0,
      breakdown: [],
      formula: `Upah sejam = 1/173 × ${formatRupiah(upahSebulan)} = ${formatRupiah(upahSejamPP35)}`,
      warning: jamLembur <= 0 ? 'Belum ada jam lembur yang terhitung' : 'Gaji pokok atau tunjangan belum diisi',
      modeHitung: 'pp35',
    };
  }

  const breakdown: HourlyMultiplier[] = [];
  let remainingHours = jamLembur;
  let currentHourIdx = 1;

  while (remainingHours > 0) {
    const fraction = remainingHours >= 1 ? 1 : remainingHours;
    const mult = getMultiplierForHour({
      sistem,
      jenisHari,
      liburResmi,
      isHariTerpendek,
      hourIndex: currentHourIdx,
    });

    const subtotal = Math.round(fraction * mult * upahSejamPP35Raw);
    let desc = `Jam ke-${currentHourIdx} (${fraction < 1 ? `${fraction} jam` : '1 jam'})`;

    if ((jenisHari === 'biasa' && !liburResmi) || (sistem === '6_hari' && jenisHari === 'sabtu' && !liburResmi)) {
      desc = currentHourIdx === 1 ? 'Jam pertama lembur kerja (1,5x)' : `Jam ke-${currentHourIdx} lembur kerja (2x)`;
    } else {
      desc = `Jam istirahat/libur ke-${currentHourIdx} (${mult}x)`;
    }

    breakdown.push({
      hourIndex: currentHourIdx,
      multiplier: mult,
      hoursCount: fraction,
      hourlyRate: upahSejamPP35,
      subtotal,
      description: desc,
    });

    remainingHours = Math.max(0, remainingHours - fraction);
    currentHourIdx++;
  }

  const totalUpahLembur = breakdown.reduce((acc, item) => acc + item.subtotal, 0);

  // Check warnings
  let warning: string | undefined;
  let isExcessOvertime = false;

  // Batas maksimal 4 jam HANYA berlaku untuk hari kerja biasa (Pasal 26 ayat 1 PP 35/2021)
  if (jenisHari === 'biasa' && !liburResmi && jamLembur > 4) {
    warning = 'Peringatan PP 35/2021 Pasal 26: Waktu kerja lembur hari biasa melebihi batas maksimal 4 jam/hari.';
    isExcessOvertime = true;
  } else if (jamLembur > 12) {
    warning = 'Peringatan: Lembur melebihi batas maksimal kerja 12 jam dalam 1 hari.';
    isExcessOvertime = true;
  }

  const formula = `1/173 × ${formatRupiah(upahSebulan)} = ${formatRupiah(upahSejamPP35)}/jam`;

  return {
    upahSebulan,
    upahSejam: upahSejamPP35,
    jamLembur,
    totalUpahLembur,
    breakdown,
    formula,
    warning,
    isExcessOvertime,
    modeHitung: 'pp35',
  };
}

/**
 * Aturan pengali PP 35/2021 Pasal 31
 */
function getMultiplierForHour(params: {
  sistem: SistemKerja;
  jenisHari: JenisHari;
  liburResmi: boolean;
  isHariTerpendek: boolean;
  hourIndex: number;
}): number {
  const { sistem, jenisHari, liburResmi, isHariTerpendek, hourIndex } = params;

  // Cek apakah merupakan hari istirahat mingguan atau libur nasional
  const isHolidayOrRestDay = jenisHari === 'libur' || jenisHari === 'minggu' || liburResmi || (sistem === '5_hari' && jenisHari === 'sabtu');

  // Kasus 1: 6 hari kerja, Libur Resmi / Istirahat jatuh di hari kerja terpendek (5 jam normal)
  if (sistem === '6_hari' && isHariTerpendek && isHolidayOrRestDay) {
    if (hourIndex <= 5) return 2.0;
    if (hourIndex === 6) return 3.0;
    return 4.0; // Jam 7 dst
  }

  // Kasus 2: 6 hari kerja, Minggu atau Libur Resmi atau Hari Istirahat/Libur lainnya
  if (sistem === '6_hari' && isHolidayOrRestDay) {
    if (hourIndex <= 7) return 2.0;
    if (hourIndex === 8) return 3.0;
    return 4.0; // Jam 9 dst
  }

  // Kasus 3: 5 hari kerja, Sabtu atau Minggu atau Hari Libur / Istirahat atau Libur Resmi
  if (sistem === '5_hari' && isHolidayOrRestDay) {
    if (hourIndex <= 8) return 2.0;
    if (hourIndex === 9) return 3.0;
    return 4.0;
  }

  // Kasus 4: 6 hari kerja, Sabtu (hari kerja biasa setelah jam normal 5 jam)
  if (sistem === '6_hari' && jenisHari === 'sabtu' && !liburResmi) {
    return hourIndex === 1 ? 1.5 : 2.0;
  }

  // Kasus 5: Hari Kerja Biasa (Senin - Jumat)
  return hourIndex === 1 ? 1.5 : 2.0;
}

/**
 * Format Rupiah rapi
 */
export function formatRupiah(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}

/**
 * Parse string Rupiah ke angka murni
 */
export function parseRupiah(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format Jam Lembur (misal: 8 jam, 2.5 jam)
 */
export function formatJam(val: number): string {
  if (isNaN(val)) return '0 jam';
  const rounded = Math.round(val * 10) / 10;
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1).replace('.', ',')} jam`;
}

/**
 * Format Tanggal Indonesia
 */
export function formatTanggal(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      return `${day} ${months[monthIdx]} ${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Helper menghitung rentang tanggal cut-off penggajian
 */
export function getCutoffDateRange(
  year: number,
  month: number, // 1 - 12
  type: 'kalender' | 'cut_off_20' | 'cut_off_25' | 'custom',
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string; label: string } {
  const pad = (n: number) => String(n).padStart(2, '0');

  if (type === 'custom' && customStart && customEnd) {
    const { start, end } = clampCustomRange(customStart, customEnd, 31);
    return {
      startDate: start,
      endDate: end,
      label: `${formatTanggal(start)} s.d. ${formatTanggal(end)}`,
    };
  }

  // Tipe 1: Bulan Kalender (Tgl 1 - Akhir Bulan)
  if (type === 'kalender') {
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = `${year}-${pad(month)}-01`;
    const endDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;
    return {
      startDate,
      endDate,
      label: `1 - ${daysInMonth} ${formatMonthName(month)} ${year}`,
    };
  }

  // Tipe 2: Cut-Off 21 bulan lalu s.d. 20 bulan ini
  if (type === 'cut_off_20') {
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const startDate = `${prevYear}-${pad(prevMonth)}-21`;
    const endDate = `${year}-${pad(month)}-20`;
    return {
      startDate,
      endDate,
      label: `21 ${formatMonthName(prevMonth)} - 20 ${formatMonthName(month)} ${year}`,
    };
  }

  // Tipe 3: Cut-Off 26 bulan lalu s.d. 25 bulan ini
  if (type === 'cut_off_25') {
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const startDate = `${prevYear}-${pad(prevMonth)}-26`;
    const endDate = `${year}-${pad(month)}-25`;
    return {
      startDate,
      endDate,
      label: `26 ${formatMonthName(prevMonth)} - 25 ${formatMonthName(month)} ${year}`,
    };
  }

  // Fallback
  const daysInMonth = new Date(year, month, 0).getDate();
  return {
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(daysInMonth)}`,
    label: `Bulan ${formatMonthName(month)} ${year}`,
  };
}

export function formatMonthName(m: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return months[(m - 1 + 12) % 12] || '';
}

/**
 * Deteksi otomatis kategori hari lembur berdasarkan tanggal:
 * - Senin - Jumat (1..5): 'biasa'
 * - Sabtu & Minggu (6, 0): 'libur' (pada sistem 5 hari kerja, Sabtu/Minggu adalah hari istirahat mingguan)
 *   *Catatan: Pada sistem 6 hari kerja, Sabtu adalah hari kerja reguler jika bukan libur nasional.
 */
export function detectAutoDayType(dateStr: string, sistem: SistemKerja = '5_hari'): JenisHari {
  if (!dateStr) return 'biasa';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIdx, day);
      const dayOfWeek = d.getDay(); // 0 = Minggu, 6 = Sabtu, 1..5 = Senin..Jumat
      if (dayOfWeek === 0) return 'libur';
      if (dayOfWeek === 6) {
        return sistem === '6_hari' ? 'biasa' : 'libur';
      }
      return 'biasa';
    }
  } catch {
    // fallback
  }
  return 'biasa';
}

/**
 * Dapatkan nama hari dalam bahasa Indonesia (Senin, Selasa, ...)
 */
export function getNamaHari(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIdx, day);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return days[d.getDay()] || '';
    }
  } catch {}
  return '';
}


/**
 * Helper validasi & pembatasan periode kustom maksimal 31 hari
 */
export function clampCustomRange(
  startStr: string,
  endStr: string,
  maxDays = 31
): { start: string; end: string; diffDays: number; isCapped: boolean } {
  let start = startStr;
  let end = endStr;
  if (start > end) {
    const temp = start;
    start = end;
    end = temp;
  }
  const sDate = new Date(start + 'T00:00:00');
  const eDate = new Date(end + 'T00:00:00');
  const rawDiff = Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isCapped = rawDiff > maxDays;
  if (isCapped) {
    const maxDate = new Date(sDate);
    maxDate.setDate(maxDate.getDate() + (maxDays - 1));
    end = maxDate.toISOString().slice(0, 10);
  }
  const diffDays = isCapped ? maxDays : Math.max(1, rawDiff);
  return { start, end, diffDays, isCapped };
}
