import { OvertimeCalculationResult, OvertimeEntry } from '../types/overtime';
import { formatRupiah, formatTanggal } from './calculations';

export interface ReceiptOptions {
  theme: 'cyber' | 'white';
  namaKaryawan?: string;
  namaPerusahaan?: string;
  tanggal?: string;
  catatan?: string;
}

/**
 * Generate a PNG data URL using HTML5 Canvas API with crisp 2x resolution
 */
export function generateReceiptImage(
  data: OvertimeCalculationResult | OvertimeEntry,
  options: ReceiptOptions
): string {
  const { theme, namaKaryawan = 'Karyawan', namaPerusahaan = 'Perusahaan', tanggal, catatan } = options;
  const isDark = theme === 'cyber';

  // Canvas settings (Double resolution for retina crispness)
  const width = 800;
  const breakdownRows = (data.breakdown || []).length;
  // Dynamic height based on breakdown rows
  const height = Math.max(950, 720 + breakdownRows * 36);

  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(2, 2);

  // Background
  if (isDark) {
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0A0A12');
    bgGradient.addColorStop(0.5, '#12121F');
    bgGradient.addColorStop(1, '#0D0D1A');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle neon cyber grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer border gradient
    ctx.lineWidth = 2;
    const borderGradient = ctx.createLinearGradient(0, 0, width, height);
    borderGradient.addColorStop(0, '#00F0FF');
    borderGradient.addColorStop(0.5, '#FF2BD6');
    borderGradient.addColorStop(1, '#00F0FF');
    ctx.strokeStyle = borderGradient;
    ctx.strokeRect(16, 16, width - 32, height - 32);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);
  }

  // Verification Hash
  const hash = `KHF-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;

  // Header Title
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.fillStyle = isDark ? '#dbfcff' : '#111827';
  ctx.fillText('BUKTI ESTIMASI UPAH LEMBUR', width / 2, 60);

  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = isDark ? '#00F0FF' : '#0284C7';
  ctx.fillText('KALKULATOR LEMBUR BY KEI PROJECT', width / 2, 82);

  const modeHitung = (data as any).modeHitung || 'pp35';
  const isCustomMode = modeHitung !== 'pp35';

  // Subtitle / compliance badge
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  if (isCustomMode) {
    ctx.fillStyle = isDark ? '#FFE600' : '#D97706';
    ctx.fillText('MODE INSENTIF MANDIRI (NON-PP 35/2021 - KESEPAKATAN INTERNAL PERUSAHAAN)', width / 2, 102);
  } else {
    ctx.fillStyle = isDark ? '#b9cacb' : '#6B7280';
    ctx.fillText('Berdasarkan Peraturan Pemerintah RI No. 35 Tahun 2021 (Pasal 21, 26, 31 & 32)', width / 2, 102);
  }

  // Divider
  ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.2)' : '#E5E7EB';
  ctx.beginPath();
  ctx.moveTo(40, 118);
  ctx.lineTo(width - 40, 118);
  ctx.stroke();

  // Meta Information Box
  const metaY = 138;
  ctx.textAlign = 'left';
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#b9cacb' : '#4B5563';

  // Left column: Karyawan & Perusahaan
  ctx.fillText('Nama Karyawan:', 48, metaY);
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#FFFFFF' : '#111827';
  ctx.fillText(namaKaryawan, 150, metaY);

  ctx.font = '12px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#b9cacb' : '#4B5563';
  ctx.fillText('Perusahaan:', 48, metaY + 24);
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#FFFFFF' : '#111827';
  ctx.fillText(namaPerusahaan, 150, metaY + 24);

  // Right column: Tanggal & Ref Hash
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#b9cacb' : '#4B5563';
  ctx.fillText('Tanggal:', 460, metaY);
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#FFFFFF' : '#111827';
  ctx.fillText(tanggal ? formatTanggal(tanggal) : formatTanggal(new Date().toISOString().slice(0, 10)), 530, metaY);

  ctx.font = '12px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#b9cacb' : '#4B5563';
  ctx.fillText('Kode Verifikasi:', 460, metaY + 24);
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = isDark ? '#FF2BD6' : '#9333EA';
  ctx.fillText(hash, 560, metaY + 24);

  // Parameter Summary Deck (Cards)
  const deckY = metaY + 54;
  const cardWidth = (width - 96 - 24) / 3;

  const drawCard = (x: number, label: string, value: string, highlightColor?: string) => {
    ctx.fillStyle = isDark ? '#161626' : '#F9FAFB';
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.fillRect(x, deckY, cardWidth, 64);
    ctx.strokeRect(x, deckY, cardWidth, 64);

    ctx.font = '11px "Inter", sans-serif';
    ctx.fillStyle = isDark ? '#b9cacb' : '#6B7280';
    ctx.fillText(label, x + 12, deckY + 22);

    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillStyle = highlightColor || (isDark ? '#dbfcff' : '#111827');
    ctx.fillText(value, x + 12, deckY + 46);
  };

  const jamStr = `${(data.jamLembur || 0).toString().replace('.', ',')} Jam`;
  const upahSebulan = 'upahSebulan' in data ? data.upahSebulan : 0;
  const upahSejam = 'upahSejam' in data ? data.upahSejam : 0;

  drawCard(48, 'UPAH SEBULAN (POKOK+TETAP)', formatRupiah(upahSebulan));
  drawCard(48 + cardWidth + 12, 'UPAH SEJAM (1/173)', formatRupiah(upahSejam), isDark ? '#00F0FF' : '#0284C7');
  drawCard(48 + (cardWidth + 12) * 2, 'TOTAL JAM LEMBUR', jamStr, isDark ? '#FF2BD6' : '#7C3AED');

  // Breakdown Table Header
  const tableY = deckY + 86;
  ctx.fillStyle = isDark ? '#1A1A2E' : '#F3F4F6';
  ctx.fillRect(48, tableY, width - 96, 30);
  ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.25)' : '#D1D5DB';
  ctx.strokeRect(48, tableY, width - 96, 30);

  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = isDark ? '#7A7A99' : '#374151';
  ctx.fillText('RINCIAN JAM', 64, tableY + 19);
  ctx.fillText('PENGALI', 300, tableY + 19);
  ctx.fillText('RUMUS HITUNG', 420, tableY + 19);
  ctx.textAlign = 'right';
  ctx.fillText('SUBTOTAL (RP)', width - 64, tableY + 19);

  // Breakdown Rows
  let curY = tableY + 30;
  const rows = data.breakdown || [];
  rows.forEach((row, i) => {
    ctx.fillStyle = i % 2 === 0 ? (isDark ? 'rgba(255,255,255,0.015)' : '#FFFFFF') : (isDark ? 'rgba(0,240,255,0.03)' : '#F9FAFB');
    ctx.fillRect(48, curY, width - 96, 32);

    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E7EB';
    ctx.strokeRect(48, curY, width - 96, 32);

    ctx.textAlign = 'left';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = isDark ? '#E4E1ED' : '#1F2937';
    ctx.fillText(row.description, 64, curY + 21);

    // Multiplier Badge
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = row.multiplier >= 3 ? (isDark ? '#FF2BD6' : '#BE185D') : (isDark ? '#00F0FF' : '#0369A1');
    ctx.fillText(`${row.multiplier}x`, 300, curY + 21);

    // Formula
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = isDark ? '#7A7A99' : '#6B7280';
    ctx.fillText(`${row.hoursCount} jam × ${row.multiplier} × ${formatRupiah(row.hourlyRate)}`, 420, curY + 21);

    // Subtotal
    ctx.textAlign = 'right';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = isDark ? '#E4E1ED' : '#111827';
    ctx.fillText(formatRupiah(row.subtotal), width - 64, curY + 21);

    curY += 32;
  });

  // Total KPI Hero Banner
  const totalLembur = 'totalUpahLembur' in data ? data.totalUpahLembur : 'totalLembur' in data ? (data as OvertimeEntry).totalLembur : 0;
  const totalBoxY = curY + 16;
  ctx.fillStyle = isDark ? '#12121F' : '#F0FDF4';
  ctx.strokeStyle = isDark ? '#39FF14' : '#16A34A';
  ctx.lineWidth = 1.5;
  ctx.fillRect(48, totalBoxY, width - 96, 74);
  ctx.strokeRect(48, totalBoxY, width - 96, 74);

  ctx.textAlign = 'left';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = isDark ? '#39FF14' : '#166534';
  ctx.fillText('TOTAL UPAH LEMBUR (KOTOR)', 68, totalBoxY + 30);

  ctx.font = '11px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#b9cacb' : '#4B5563';
  ctx.fillText('Sesuai ketentuan baku PP No. 35 Tahun 2021', 68, totalBoxY + 52);

  ctx.textAlign = 'right';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillStyle = isDark ? '#39FF14' : '#15803D';
  ctx.fillText(formatRupiah(totalLembur), width - 68, totalBoxY + 46);

  // Catatan if exists
  let afterTotalY = totalBoxY + 90;
  if (catatan) {
    ctx.textAlign = 'left';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillStyle = isDark ? '#b9cacb' : '#6B7280';
    ctx.fillText(`Catatan: "${catatan}"`, 52, afterTotalY);
    afterTotalY += 24;
  }

  // Legal Disclaimer Box
  const discY = afterTotalY;
  ctx.fillStyle = isDark ? 'rgba(255, 230, 0, 0.05)' : '#FEFCE8';
  ctx.strokeStyle = isDark ? 'rgba(255, 230, 0, 0.3)' : '#FDE047';
  ctx.lineWidth = 1;
  ctx.fillRect(48, discY, width - 96, 88);
  ctx.strokeRect(48, discY, width - 96, 88);

  // Yellow bar on left
  ctx.fillStyle = isDark ? '#FFE600' : '#CA8A04';
  ctx.fillRect(48, discY, 4, 88);

  ctx.textAlign = 'left';
  ctx.font = 'bold 11px "Space Grotesk", sans-serif';
  ctx.fillStyle = isDark ? '#FFE600' : '#854D0E';
  ctx.fillText('DASAR HUKUM & DISCLAIMER (PP NO. 35 TAHUN 2021)', 62, discY + 20);

  ctx.font = '10px "Inter", sans-serif';
  ctx.fillStyle = isDark ? '#b9cacb' : '#713F12';
  ctx.fillText('1. Upah sejam dihitung 1/173 × upah sebulan (gaji pokok + tunjangan tetap). Jam istirahat bukan jam kerja.', 62, discY + 38);
  ctx.fillText('2. Pengali lembur: hari kerja biasa jam pertama 1.5x, jam berikutnya 2x. Hari istirahat/libur: 2x, 3x, 4x.', 62, discY + 54);
  ctx.fillText('3. Sumber resmi: jdih.kemnaker.go.id & peraturan.bpk.go.id. Estimasi mandiri untuk transparansi.', 62, discY + 70);

  // Watermark Footer
  ctx.textAlign = 'center';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = isDark ? '#7A7A99' : '#9CA3AF';
  ctx.fillText('ESTIMASI MANDIRI • BUKAN DOKUMEN RESMI PEMERINTAH / PERUSAHAAN • GENERATED BY KEI PROJECT', width / 2, height - 32);

  return canvas.toDataURL('image/png');
}

/**
 * Trigger immediate browser download of the generated receipt image
 */
export function downloadReceiptPNG(
  data: OvertimeCalculationResult | OvertimeEntry,
  options: ReceiptOptions,
  filename?: string
): void {
  const dataUrl = generateReceiptImage(data, options);
  if (!dataUrl) return;

  const dateStr = options.tanggal || new Date().toISOString().slice(0, 10);
  const name = filename || `lembur-keipro-${dateStr}.png`;

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
