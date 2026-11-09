import { OvertimeEntry, AttendanceRecord, AttendanceStatus } from '../types/overtime';
import { calculateOvertime, getNamaHari } from './calculations';

/**
 * Standard CSV Column Headers (Format Laporan Human-Readable & Rapi untuk Excel)
 */
export const CSV_HEADERS = [
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

/**
 * Export entries and attendance records to UTF-8 CSV with BOM for seamless Excel/Google Sheets opening.
 * Simpel, rapi, detail, dan dilengkapi baris TOTAL rekapitulasi.
 */
export function exportToCSV(
  entries: OvertimeEntry[],
  attendanceMap?: Record<string, AttendanceRecord>,
  filenamePrefix = 'laporan-lembur-keipro'
): void {
  // Gabungkan entri lembur dan rekapan kehadiran per tanggal
  const dateMap = new Map<string, { entry?: OvertimeEntry; attendance?: AttendanceRecord }>();

  entries.forEach((e) => {
    dateMap.set(e.tanggal, { entry: e });
  });

  if (attendanceMap) {
    Object.values(attendanceMap).forEach((att) => {
      const existing = dateMap.get(att.tanggal) || {};
      existing.attendance = att;
      dateMap.set(att.tanggal, existing);
    });
  }

  // Urutkan tanggal secara kronologis menurun (terbaru di atas)
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

  let totalJamReguler = 0;
  let totalJamLembur = 0;
  let totalNominalLembur = 0;
  let countHadir = 0;
  let countSakit = 0;
  let countIzin = 0;
  let countCuti = 0;

  const rows = sortedDates.map((date, idx) => {
    const item = dateMap.get(date)!;
    const e = item.entry;
    const att = item.attendance;

    const no = (idx + 1).toString();
    const hari = getNamaHari(date);
    const sistemLabel = e ? (e.sistem === '6_hari' ? '6 Hari Kerja' : '5 Hari Kerja') : '5 Hari Kerja';
    
    // Label jenis hari
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
        countHadir++;
      } else if (att.status === 'sakit') {
        statusLabel = 'Sakit';
        countSakit++;
      } else if (att.status === 'izin') {
        statusLabel = 'Izin';
        countIzin++;
      } else if (att.status === 'cuti') {
        statusLabel = 'Cuti';
        countCuti++;
      } else {
        statusLabel = 'Libur Off';
      }
    } else if (e && e.jamLembur > 0) {
      statusLabel = 'Hadir (Lembur)';
      countHadir++;
    }

    const jamReg = att ? att.jamKerjaReguler : (e?.jamKerjaReguler || 0);
    const jamLbr = e ? e.jamLembur : 0;
    const upahSejamVal = e ? Math.round(e.upahSejam) : 0;
    const totalLbrVal = e ? Math.round(e.totalLembur) : 0;

    totalJamReguler += jamReg;
    totalJamLembur += jamLbr;
    totalNominalLembur += totalLbrVal;

    const notes = [e?.catatan, att?.catatan].filter(Boolean).join(' | ');

    return [
      no,
      date,
      hari,
      sistemLabel,
      jenisHariLabel,
      statusLabel,
      jamReg.toString(),
      jamLbr.toString(),
      upahSejamVal > 0 ? upahSejamVal.toString() : '-',
      totalLbrVal > 0 ? totalLbrVal.toString() : '0',
      `"${notes.replace(/"/g, '""')}"`,
    ];
  });

  // Baris Total Rekapitulasi di paling bawah
  const totalRow = [
    'TOTAL',
    `${sortedDates.length} Hari`,
    '-',
    '-',
    '-',
    `${countHadir} Hadir / ${countSakit} Sakit / ${countIzin} Izin / ${countCuti} Cuti`,
    totalJamReguler.toString(),
    totalJamLembur.toString(),
    '-',
    totalNominalLembur.toString(),
    `"Total Hak Upah Lembur: Rp ${totalNominalLembur.toLocaleString('id-ID')}"`,
  ];

  // Baris Informasi Aplikasi
  const infoRow = [
    'INFO',
    `Diekspor: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '"Laporan dihitung akurat sesuai regulasi PP No. 35/2021 via https://kalembur.vercel.app"',
  ];

  // Delimiter semicolon (;) dengan UTF-8 BOM (\uFEFF) agar Microsoft Excel langsung rapi
  const csvContent =
    '\uFEFF' +
    [
      CSV_HEADERS.join(';'),
      ...rows.map((r) => r.join(';')),
      totalRow.join(';'),
      infoRow.join(';'),
    ].join('\r\n');

  downloadBlob(
    csvContent,
    `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Export entries AND attendance records to JSON backup file
 */
export function exportToJSON(
  entries: OvertimeEntry[],
  attendanceMap?: Record<string, AttendanceRecord>,
  filenamePrefix = 'backup-lembur-keipro'
): void {
  const backupData = {
    versiSkema: '1.2',
    namaAplikasi: 'Kalkulator Lembur by Kei Project',
    waktuEkspor: new Date().toISOString(),
    totalEntri: entries.length,
    totalKehadiran: attendanceMap ? Object.keys(attendanceMap).length : 0,
    entri: entries,
    kehadiran: attendanceMap || {},
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  downloadBlob(jsonStr, `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

/**
 * Helper to download Blob to local disk
 */
function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate blank template CSV for easy imports (100% matches export format)
 */
export function downloadCSVTemplate(): void {
  const sample1 = ['2026-11-08', '5_hari', 'minggu', 'FALSE', 'MASUK', '8', '3', '6000000', '34682', '208092', 'Lembur maintenance mingguan', 'template-01'];
  const sample2 = ['2026-11-09', '5_hari', 'biasa', 'FALSE', 'MASUK', '8', '2', '6000000', '34682', '121387', 'Lembur deployment sistem', 'template-02'];
  const sample3 = ['2026-11-10', '5_hari', 'biasa', 'FALSE', 'SAKIT', '0', '0', '6000000', '34682', '0', 'Surat keterangan dokter', 'template-03'];

  const content = '\uFEFF' + [CSV_HEADERS.join(';'), sample1.join(';'), sample2.join(';'), sample3.join(';')].join('\r\n');
  downloadBlob(content, 'template-import-lembur-kehadiran.csv', 'text/csv;charset=utf-8;');
}

/**
 * Parse imported JSON string containing overtime entries AND attendance records
 */
export function parseImportJSON(jsonText: string): { 
  validEntries: OvertimeEntry[]; 
  attendanceMap: Record<string, AttendanceRecord>;
  errors: string[];
} {
  const errors: string[] = [];
  const validEntries: OvertimeEntry[] = [];
  const attendanceMap: Record<string, AttendanceRecord> = {};

  try {
    const parsed = JSON.parse(jsonText);
    const rawList = Array.isArray(parsed) ? parsed : (parsed.entri || parsed.data || []);
    const rawAttendance = parsed.kehadiran || parsed.attendance || {};

    // 1. Parse Attendance Map
    if (typeof rawAttendance === 'object' && rawAttendance !== null && !Array.isArray(rawAttendance)) {
      Object.entries(rawAttendance).forEach(([key, val]: [string, any]) => {
        if (val && typeof val === 'object' && val.status) {
          const validStatuses: AttendanceStatus[] = ['masuk', 'sakit', 'izin', 'cuti', 'libur_off'];
          const status = validStatuses.includes(val.status) ? val.status : 'masuk';
          attendanceMap[key] = {
            tanggal: val.tanggal || key,
            status,
            jamKerjaReguler: Number(val.jamKerjaReguler) || 0,
            catatan: val.catatan || '',
          };
        }
      });
    }

    // 2. Parse Overtime Entries
    if (Array.isArray(rawList)) {
      rawList.forEach((item: any, idx: number) => {
        const lineNum = idx + 1;
        if (!item.tanggal || typeof item.tanggal !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.tanggal)) {
          errors.push(`Baris ${lineNum}: Format tanggal salah (gunakan YYYY-MM-DD).`);
          return;
        }

        const sistem = item.sistem === '6_hari' ? '6_hari' : '5_hari';
        const jenisHari = ['biasa', 'sabtu', 'minggu', 'libur'].includes(item.jenisHari) ? item.jenisHari : 'biasa';
        const libur = Boolean(item.libur);
        const jamLembur = Number(item.jamLembur) || 0;
        const upahSebulan = Number(item.upahSebulan) || 6000000;

        if (jamLembur <= 0) {
          if (item.statusKehadiran) {
            attendanceMap[item.tanggal] = {
              tanggal: item.tanggal,
              status: item.statusKehadiran,
              jamKerjaReguler: Number(item.jamKerjaReguler) || 0,
              catatan: item.catatan || '',
            };
          }
          return;
        }

        const calc = calculateOvertime({
          gajiPokok: upahSebulan,
          tunjanganTetap: 0,
          sistem,
          jenisHari,
          liburResmi: libur,
          isHariTerpendek: Boolean(item.isHariTerpendek),
          jamLembur,
          modeHitung: item.modeHitung,
          manualRatePerJam: item.manualRatePerJam,
          manualTotalNominal: item.manualTotalNominal,
          upahHarianPokok: item.upahHarianPokok,
        });

        validEntries.push({
          id: item.id || `imp-${Date.now()}-${idx}`,
          tanggal: item.tanggal,
          sistem,
          jenisHari,
          libur,
          isHariTerpendek: item.isHariTerpendek,
          totalJamKerja: item.totalJamKerja,
          jamKerjaReguler: item.jamKerjaReguler,
          statusKehadiran: item.statusKehadiran,
          jamLembur,
          upahSebulan: calc.upahSebulan,
          upahSejam: calc.upahSejam,
          totalLembur: calc.totalUpahLembur,
          catatan: item.catatan || '',
          dibuat: item.dibuat || new Date().toISOString(),
          breakdown: calc.breakdown,
          modeHitung: item.modeHitung,
          manualRatePerJam: item.manualRatePerJam,
          upahHarianPokok: item.upahHarianPokok,
        });
      });
    }
  } catch (err: any) {
    errors.push(`Gagal membaca file JSON: ${err.message}`);
  }

  return { validEntries, attendanceMap, errors };
}

/**
 * Intelligent, bi-directional CSV parser that maps columns dynamically by header name
 * or falls back gracefully to standard position.
 * 100% compatible with files exported by this app AND templates.
 */
export function parseImportCSV(csvText: string): { 
  validEntries: OvertimeEntry[]; 
  attendanceMap: Record<string, AttendanceRecord>;
  errors: string[];
} {
  const errors: string[] = [];
  const validEntries: OvertimeEntry[] = [];
  const attendanceMap: Record<string, AttendanceRecord> = {};

  const rawLines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rawLines.length < 2) {
    errors.push('File CSV kosong atau hanya berisi baris judul.');
    return { validEntries, attendanceMap, errors };
  }

  // Detect delimiter (semicolon or comma or tab)
  const firstLine = rawLines[0].replace(/^\uFEFF/, '');
  let delimiter = ';';
  if (firstLine.includes(';') && (firstLine.split(';').length >= firstLine.split(',').length)) {
    delimiter = ';';
  } else if (firstLine.includes(',')) {
    delimiter = ',';
  } else if (firstLine.includes('\t')) {
    delimiter = '\t';
  }

  // Split tokens safely respecting quoted commas/semicolons
  const parseCSVLine = (line: string): string[] => {
    const tokens: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        if (inQuotes && line[i + 1] === char) {
          cur += char;
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        tokens.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    tokens.push(cur.trim());
    return tokens.map((t) => t.replace(/^["']|["']$/g, '').trim());
  };

  const headerTokens = parseCSVLine(firstLine).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Map header indexes dynamically
  const colTanggal = headerTokens.findIndex((h) => h.includes('tanggal') || h.includes('date'));
  const colSistem = headerTokens.findIndex((h) => h.includes('sistem'));
  const colJenis = headerTokens.findIndex((h) => h.includes('jenishari') || h.includes('hari') || h.includes('kategori'));
  const colLibur = headerTokens.findIndex((h) => h.includes('libur'));
  const colStatus = headerTokens.findIndex((h) => h.includes('status') || h.includes('kehadiran'));
  const colJamReguler = headerTokens.findIndex((h) => h.includes('jamreguler') || h.includes('reguler'));
  const colJam = headerTokens.findIndex((h) => h.includes('jamlembur') || h === 'jam' || h.includes('durasi'));
  const colGaji = headerTokens.findIndex((h) => h.includes('upahsebulan') || h.includes('gajipokok') || h.includes('gaji') || h.includes('upah'));
  const colCatatan = headerTokens.findIndex((h) => h.includes('catatan') || h.includes('note') || h.includes('keterangan'));
  const colId = headerTokens.findIndex((h) => h === 'id' || h.includes('kode'));

  // Fallbacks if header wasn't matched
  const idxTanggal = colTanggal !== -1 ? colTanggal : 0;
  const idxSistem = colSistem !== -1 ? colSistem : 1;
  const idxJenis = colJenis !== -1 ? colJenis : 2;
  const idxLibur = colLibur !== -1 ? colLibur : 3;
  const idxJam = colJam !== -1 ? colJam : 6;
  const idxGaji = colGaji !== -1 ? colGaji : 7;
  const idxCatatan = colCatatan !== -1 ? colCatatan : 10;
  const idxId = colId !== -1 ? colId : 11;

  for (let i = 1; i < rawLines.length; i++) {
    const lineNum = i + 1;
    const parts = parseCSVLine(rawLines[i]);

    if (parts.length < 3) {
      continue; // Skip empty / malformed row
    }

    const rawTanggal = parts[idxTanggal] || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawTanggal)) {
      if (
        rawTanggal.toUpperCase().includes('TOTAL') ||
        rawTanggal.toUpperCase().includes('INFO') ||
        (parts[0] || '').toUpperCase().includes('TOTAL') ||
        (parts[0] || '').toUpperCase().includes('INFO')
      ) {
        continue; // Lewati baris ringkasan / metadata laporan
      }
      errors.push(`Baris ${lineNum}: Format tanggal '${rawTanggal}' tidak valid (wajib YYYY-MM-DD).`);
      continue;
    }

    // Parse Sistem
    const rawSistem = (parts[idxSistem] || '').toLowerCase();
    const sistem: '5_hari' | '6_hari' = rawSistem.includes('6') ? '6_hari' : '5_hari';

    // Parse Jenis Hari
    const rawJenis = (parts[idxJenis] || '').toLowerCase();
    let jenisHari: 'biasa' | 'sabtu' | 'minggu' | 'libur' = 'biasa';
    if (rawJenis.includes('libur') || rawJenis.includes('istirahat')) jenisHari = 'libur';
    else if (rawJenis.includes('sabtu')) jenisHari = 'sabtu';
    else if (rawJenis.includes('minggu')) jenisHari = 'minggu';

    // Parse Libur
    const rawLibur = (parts[idxLibur] || '').toLowerCase();
    const libur = rawLibur === 'true' || rawLibur === 'ya' || rawLibur === '1';

    // Parse Status Kehadiran & Jam Reguler jika ada
    const rawStatus = colStatus !== -1 ? (parts[colStatus] || '').toLowerCase() : '';
    const rawJamReguler = colJamReguler !== -1 ? parseFloat(parts[colJamReguler] || '0') : 0;
    
    if (rawStatus && ['masuk', 'sakit', 'izin', 'cuti', 'libur_off'].includes(rawStatus)) {
      attendanceMap[rawTanggal] = {
        tanggal: rawTanggal,
        status: rawStatus as AttendanceStatus,
        jamKerjaReguler: !isNaN(rawJamReguler) ? rawJamReguler : (rawStatus === 'masuk' ? 8 : 0),
        catatan: parts[idxCatatan] || '',
      };
    }

    // Parse Jam Lembur
    const rawJam = (parts[idxJam] || '').replace(',', '.').replace(/[^0-9.]/g, '');
    const jamLembur = parseFloat(rawJam);
    
    if (isNaN(jamLembur) || jamLembur <= 0) {
      // Baris ini mungkin entri kehadiran murni (sakit/izin/cuti/masuk tanpa lembur)
      continue;
    }

    // Parse Upah Sebulan
    const rawGaji = parts[idxGaji] ? parseFloat(parts[idxGaji].replace(/[^0-9]/g, '')) : 6000000;
    const upahSebulan = !isNaN(rawGaji) && rawGaji > 0 ? rawGaji : 6000000;

    const catatan = parts[idxCatatan] || '';
    const customId = parts[idxId] || `csv-${Date.now()}-${i}`;

    const calc = calculateOvertime({
      gajiPokok: upahSebulan,
      tunjanganTetap: 0,
      sistem,
      jenisHari,
      liburResmi: libur,
      jamLembur,
    });

    validEntries.push({
      id: customId,
      tanggal: rawTanggal,
      sistem,
      jenisHari,
      libur,
      jamLembur,
      upahSebulan: calc.upahSebulan,
      upahSejam: calc.upahSejam,
      totalLembur: calc.totalUpahLembur,
      catatan,
      dibuat: new Date().toISOString(),
      breakdown: calc.breakdown,
    });
  }

  return { validEntries, attendanceMap, errors };
}
