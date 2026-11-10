import * as XLSX from 'xlsx';
import { OvertimeEntry, AttendanceRecord, UserSettings } from '../types/overtime';
import { getNamaHari, formatTanggal, formatRupiah } from './calculations';

export interface ExportFilterOptions {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  sortOrder?: 'desc' | 'asc'; // 'desc': terbaru ke terlama, 'asc': terlama ke terbaru
}

interface ExportRowData {
  no: number;
  tanggal: string;
  hari: string;
  sistem: string;
  jenisHari: string;
  statusKehadiran: string;
  jamReguler: number;
  jamLembur: number;
  upahSejam: number;
  totalLembur: number;
  catatan: string;
}

/**
 * Mempersiapkan & menyaring data gabungan lembur dan kehadiran sesuai rentang tanggal dan sorting
 */
export function prepareExportData(
  entries: OvertimeEntry[],
  attendanceMap: Record<string, AttendanceRecord> = {},
  options: ExportFilterOptions = {}
): {
  rows: ExportRowData[];
  totals: {
    totalHari: number;
    totalHadir: number;
    totalSakit: number;
    totalIzin: number;
    totalCuti: number;
    totalJamReguler: number;
    totalJamLembur: number;
    totalNominalLembur: number;
  };
  filterLabel: string;
} {
  const { startDate, endDate, sortOrder = 'desc' } = options;

  // Gabungkan tanggal unik dari entri lembur dan kehadiran
  const dateMap = new Map<string, { entry?: OvertimeEntry; attendance?: AttendanceRecord }>();

  entries.forEach((e) => {
    dateMap.set(e.tanggal, { entry: e });
  });

  Object.values(attendanceMap).forEach((att) => {
    const existing = dateMap.get(att.tanggal) || {};
    existing.attendance = att;
    dateMap.set(att.tanggal, existing);
  });

  // Filter berdasarkan rentang tanggal jika disetel
  let dates = Array.from(dateMap.keys());
  if (startDate && endDate) {
    dates = dates.filter((d) => d >= startDate && d <= endDate);
  } else if (startDate) {
    dates = dates.filter((d) => d >= startDate);
  } else if (endDate) {
    dates = dates.filter((d) => d <= endDate);
  }

  // Urutkan tanggal
  dates.sort((a, b) => {
    return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
  });

  let totalJamReguler = 0;
  let totalJamLembur = 0;
  let totalNominalLembur = 0;
  let totalHadir = 0;
  let totalSakit = 0;
  let totalIzin = 0;
  let totalCuti = 0;

  const rows: ExportRowData[] = dates.map((date, idx) => {
    const item = dateMap.get(date)!;
    const e = item.entry;
    const att = item.attendance;

    const hari = getNamaHari(date);
    const sistemLabel = e ? (e.sistem === '6_hari' ? '6 Hari Kerja' : '5 Hari Kerja') : '5 Hari Kerja';

    // Jenis hari
    let jenisHariLabel = 'Hari Biasa';
    if (e?.libur) {
      jenisHariLabel = 'Libur Resmi';
    } else if (e?.jenisHari === 'minggu') {
      jenisHariLabel = 'Istirahat Minggu';
    } else if (e?.jenisHari === 'sabtu') {
      jenisHariLabel = 'Istirahat Sabtu';
    }

    // Status kehadiran
    let statusLabel = '-';
    if (att) {
      if (att.status === 'masuk') {
        statusLabel = 'Hadir';
        totalHadir++;
      } else if (att.status === 'sakit') {
        statusLabel = 'Sakit';
        totalSakit++;
      } else if (att.status === 'izin') {
        statusLabel = 'Izin';
        totalIzin++;
      } else if (att.status === 'cuti') {
        statusLabel = 'Cuti';
        totalCuti++;
      } else {
        statusLabel = 'Libur Off';
      }
    } else if (e && e.jamLembur > 0) {
      statusLabel = 'Hadir (Lembur)';
      totalHadir++;
    }

    const jamReg = att ? att.jamKerjaReguler : (e?.jamKerjaReguler || 0);
    const jamLbr = e ? e.jamLembur : 0;
    const upahSejamVal = e ? Math.round(e.upahSejam) : 0;
    const totalLbrVal = e ? Math.round(e.totalLembur) : 0;

    totalJamReguler += jamReg;
    totalJamLembur += jamLbr;
    totalNominalLembur += totalLbrVal;

    const notes = [e?.catatan, att?.catatan].filter(Boolean).join(' | ');

    return {
      no: idx + 1,
      tanggal: date,
      hari,
      sistem: sistemLabel,
      jenisHari: jenisHariLabel,
      statusKehadiran: statusLabel,
      jamReguler: jamReg,
      jamLembur: jamLbr,
      upahSejam: upahSejamVal,
      totalLembur: totalLbrVal,
      catatan: notes,
    };
  });

  const filterLabel =
    startDate && endDate
      ? `${formatTanggal(startDate)} s/d ${formatTanggal(endDate)}`
      : 'Semua Periode Tercatat';

  return {
    rows,
    totals: {
      totalHari: dates.length,
      totalHadir,
      totalSakit,
      totalIzin,
      totalCuti,
      totalJamReguler,
      totalJamLembur,
      totalNominalLembur,
    },
    filterLabel,
  };
}

/**
 * Ekspor ke Microsoft Excel (.xlsx) murni dengan format tabel profesional, lebar kolom pas, dan tipe data numerik
 */
export function exportOvertimeToExcel(
  entries: OvertimeEntry[],
  attendanceMap: Record<string, AttendanceRecord> = {},
  settings: UserSettings,
  options: ExportFilterOptions = {}
): void {
  const { rows, totals, filterLabel } = prepareExportData(entries, attendanceMap, options);

  const namaKaryawan = settings.namaKaryawan || 'Karyawan';
  const namaPerusahaan = settings.namaPerusahaan || 'PT Perusahaan';
  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Metadata Header (Baris 1-4)
  const headerData = [
    ['REKAPITULASI UPAH LEMBUR & LOG KEHADIRAN KARYAWAN'],
    [`Perusahaan: ${namaPerusahaan}`, '', `Nama Karyawan: ${namaKaryawan}`],
    [`Periode Rekap: ${filterLabel}`, '', `Tanggal Unduh: ${tanggalCetak}`],
    ['Regulasi: PP No. 35 Tahun 2021 (Pasal 31 & 32)', '', 'Dibuat dengan: Kalkulator Lembur by Kei Project'],
    [], // Baris kosong pemisah
    [
      'No',
      'Tanggal',
      'Hari',
      'Sistem Kerja',
      'Jenis Hari',
      'Status Kehadiran',
      'Jam Reguler',
      'Jam Lembur',
      'Upah Sejam (Rp)',
      'Total Upah Lembur (Rp)',
      'Catatan / Keterangan',
    ],
  ];

  // Baris Tabel Isi
  const tableRows = rows.map((r) => [
    r.no,
    r.tanggal,
    r.hari,
    r.sistem,
    r.jenisHari,
    r.statusKehadiran,
    r.jamReguler,
    r.jamLembur,
    r.upahSejam,
    r.totalLembur,
    r.catatan,
  ]);

  // Baris Total Rekapitulasi di bagian bawah
  const summaryRow = [
    'TOTAL',
    `${totals.totalHari} Hari`,
    '',
    '',
    '',
    `${totals.totalHadir} Hadir, ${totals.totalSakit} Sakit, ${totals.totalIzin} Izin, ${totals.totalCuti} Cuti`,
    totals.totalJamReguler,
    totals.totalJamLembur,
    '',
    totals.totalNominalLembur,
    `Total Hak Upah Lembur: Rp ${totals.totalNominalLembur.toLocaleString('id-ID')}`,
  ];

  const fullSheetData = [...headerData, ...tableRows, summaryRow];

  // Buat Worksheet & Workbook XLSX
  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Atur Lebar Kolom (Cols Width) agar teks tidak terpotong / ### di Excel
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 13 }, // Tanggal
    { wch: 10 }, // Hari
    { wch: 14 }, // Sistem Kerja
    { wch: 18 }, // Jenis Hari
    { wch: 16 }, // Status Kehadiran
    { wch: 14 }, // Jam Reguler
    { wch: 13 }, // Jam Lembur
    { wch: 16 }, // Upah Sejam
    { wch: 22 }, // Total Upah Lembur
    { wch: 35 }, // Catatan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Lembur');

  // Generate berkas dan trigger download
  const cleanName = namaKaryawan.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `rekap-lembur-${cleanName}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Ekspor ke file CSV bersih dengan UTF-8 BOM (\uFEFF) & Delimiter Titik Koma (;)
 * Kompatibel langsung dengan Microsoft Excel Indonesia & Google Sheets tanpa teks acak
 */
export function exportOvertimeToCSV(
  entries: OvertimeEntry[],
  attendanceMap: Record<string, AttendanceRecord> = {},
  settings: UserSettings,
  options: ExportFilterOptions = {}
): void {
  const { rows, totals, filterLabel } = prepareExportData(entries, attendanceMap, options);

  const namaKaryawan = settings.namaKaryawan || 'Karyawan';
  const namaPerusahaan = settings.namaPerusahaan || 'PT Perusahaan';
  const tanggalCetak = new Date().toISOString().slice(0, 10);

  const csvHeaders = [
    'No',
    'Tanggal',
    'Hari',
    'Sistem Kerja',
    'Jenis Hari',
    'Status Kehadiran',
    'Jam Kerja Reguler',
    'Jam Lembur',
    'Upah Sejam (Rp)',
    'Total Upah Lembur (Rp)',
    'Catatan / Keterangan',
  ];

  const escapeCSV = (str: string | number) => {
    const val = String(str ?? '');
    if (val.includes(';') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines: string[] = [];

  // Metadata di baris pembuka
  csvLines.push(escapeCSV(`REKAPITULASI UPAH LEMBUR - ${namaPerusahaan}`));
  csvLines.push(`${escapeCSV(`Karyawan: ${namaKaryawan}`)};${escapeCSV(`Periode: ${filterLabel}`)};${escapeCSV(`Dicetak: ${tanggalCetak}`)}`);
  csvLines.push(''); // baris kosong

  // Header Kolom
  csvLines.push(csvHeaders.map(escapeCSV).join(';'));

  // Isi Data
  rows.forEach((r) => {
    const line = [
      r.no,
      r.tanggal,
      r.hari,
      r.sistem,
      r.jenisHari,
      r.statusKehadiran,
      r.jamReguler,
      r.jamLembur,
      r.upahSejam > 0 ? r.upahSejam : '-',
      r.totalLembur,
      r.catatan,
    ].map(escapeCSV).join(';');
    csvLines.push(line);
  });

  // Baris Total
  const summaryLine = [
    'TOTAL',
    `${totals.totalHari} Hari`,
    '-',
    '-',
    '-',
    `${totals.totalHadir} Hadir / ${totals.totalSakit} Sakit / ${totals.totalIzin} Izin / ${totals.totalCuti} Cuti`,
    totals.totalJamReguler,
    totals.totalJamLembur,
    '-',
    totals.totalNominalLembur,
    `Total Upah Lembur: Rp ${totals.totalNominalLembur.toLocaleString('id-ID')}`,
  ].map(escapeCSV).join(';');
  csvLines.push(summaryLine);

  // Gabungkan dengan BOM UTF-8 (\uFEFF)
  const csvContent = '\uFEFF' + csvLines.join('\r\n');

  const cleanName = namaKaryawan.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `rekap-lembur-${cleanName}-${tanggalCetak}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
