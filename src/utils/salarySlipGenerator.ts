import { formatRupiah } from './calculations';

export interface SalarySlipData {
  namaKaryawan: string;
  namaPerusahaan: string;
  periode: string;
  tanggalCetak: string;
  theme?: 'light' | 'dark';
  gajiPokok: number;
  tunjanganTetap: number;
  totalUangLembur: number;
  totalJamLembur: number;
  totalTunjanganKehadiran: number;
  hariMasuk: number;
  totalTambahanLain: number;
  totalPotongan: number;
  potonganDetail?: Array<{ nama: string; nominal: number }>;
  takeHomePay: number;
}

/**
 * Generate high-resolution (2x retina) PNG Slip Gaji using HTML5 Canvas API
 * Mendukung Tema Terang (Light Mode) dan Tema Gelap Cyber (Dark Mode)
 */
export function generateSalarySlipCanvas(data: SalarySlipData): HTMLCanvasElement {
  const isLight = data.theme === 'light';
  const width = 800;
  const height = 1050;

  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(2, 2);

  // Background Canvas
  if (isLight) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Subtle light grid lines
    ctx.strokeStyle = '#F1F5F9';
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

    // Outer border
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Top Header Banner
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(20, 20, width - 40, 110);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(20, 20, width - 40, 110);

    // Brand Name
    ctx.fillStyle = '#0284C7';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('SLIP GAJI KARYAWAN', 44, 62);

    ctx.fillStyle = '#64748B';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Standar Kepatuhan Ketenagakerjaan PP No. 35 Tahun 2021', 44, 82);

    // Kei Pro Tag
    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('● ENGINE BY KEI PROJECT', 44, 104);

    // Periode Badge (Right side)
    ctx.fillStyle = '#F0F9FF';
    ctx.fillRect(width - 240, 42, 200, 64);
    ctx.strokeStyle = '#BAE6FD';
    ctx.strokeRect(width - 240, 42, 200, 64);

    ctx.fillStyle = '#0369A1';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('PERIODE ESTIMASI', width - 225, 62);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(data.periode || 'Bulan Berjalan', width - 225, 84);
  } else {
    // Dark Cyber Luxury
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0A0A14');
    bgGrad.addColorStop(0.5, '#121224');
    bgGrad.addColorStop(1, '#0D0D1A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle dark neon grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
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

    // Outer border with neon glow
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Top Header Banner
    ctx.fillStyle = 'rgba(22, 22, 38, 0.9)';
    ctx.fillRect(20, 20, width - 40, 110);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(20, 20, width - 40, 110);

    // Brand Name
    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('SLIP GAJI KARYAWAN', 44, 62);

    ctx.fillStyle = '#A0A0C0';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Standar Kepatuhan Ketenagakerjaan PP No. 35 Tahun 2021', 44, 82);

    // Kei Pro Tag
    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('● ENGINE BY KEI PROJECT', 44, 104);

    // Periode Badge (Right side)
    ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.fillRect(width - 240, 42, 200, 64);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.strokeRect(width - 240, 42, 200, 64);

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('PERIODE ESTIMASI', width - 225, 62);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(data.periode || 'Bulan Berjalan', width - 225, 84);
  }

  // Identity Card Section
  let curY = 155;
  ctx.fillStyle = isLight ? '#F8FAFC' : 'rgba(26, 26, 46, 0.6)';
  ctx.fillRect(36, curY, width - 72, 70);
  ctx.strokeStyle = isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)';
  ctx.strokeRect(36, curY, width - 72, 70);

  ctx.fillStyle = isLight ? '#64748B' : '#7A7A99';
  ctx.font = '11px monospace';
  ctx.fillText('NAMA KARYAWAN', 52, curY + 26);
  ctx.fillText('PERUSAHAAN / KANTOR', 420, curY + 26);

  ctx.fillStyle = isLight ? '#0F172A' : '#FFFFFF';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(data.namaKaryawan || 'Karyawan', 52, curY + 50);
  ctx.fillText(data.namaPerusahaan || 'Perusahaan', 420, curY + 50);

  // Section 1: PENERIMAAN (EARNINGS)
  curY = 250;
  ctx.fillStyle = isLight ? '#15803D' : '#39FF14';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('[A] KOMPONEN PENERIMAAN (PENDAPATAN KOTOR)', 36, curY);

  curY += 12;
  const earnings: Array<{ label: string; sub?: string; val: number }> = [
    { label: 'Gaji Pokok Bulanan', sub: 'Upah Pokok Sesuai PKWT/PKWTT', val: data.gajiPokok },
    { label: 'Tunjangan Tetap', sub: 'Tunjangan Jabatan / Keahlian Tertulis', val: data.tunjanganTetap },
    {
      label: `Upah Kerja Lembur (${data.totalJamLembur.toFixed(1)} Jam)`,
      sub: 'Dihitung berdasar pengali resmi Pasal 31 PP 35/2021',
      val: data.totalUangLembur,
    },
    {
      label: `Tunjangan Kehadiran / Uang Harian (${data.hariMasuk} Hari)`,
      sub: 'Uang makan & transport berdasarkan absensi masuk',
      val: data.totalTunjanganKehadiran,
    },
    { label: 'Tambahan & Bonus Lainnya', sub: 'Insentif / Tunjangan tidak tetap', val: data.totalTambahanLain },
  ];

  let totalGross = 0;
  earnings.forEach((item) => {
    totalGross += item.val;
    curY += 24;

    ctx.fillStyle = isLight ? '#1E293B' : '#E4E1ED';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(item.label, 44, curY);

    ctx.fillStyle = isLight ? '#15803D' : '#39FF14';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(item.val), width - 44, curY);
    ctx.textAlign = 'left';

    curY += 14;
    ctx.fillStyle = isLight ? '#94A3B8' : '#64748B';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(item.sub || '', 44, curY);

    curY += 6;
    ctx.strokeStyle = isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(44, curY);
    ctx.lineTo(width - 44, curY);
    ctx.stroke();
  });

  // Gross Subtotal Row
  curY += 18;
  ctx.fillStyle = isLight ? '#DCFCE7' : 'rgba(57, 255, 20, 0.08)';
  ctx.fillRect(36, curY - 14, width - 72, 28);
  ctx.fillStyle = isLight ? '#0F172A' : '#FFFFFF';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('SUBTOTAL PENDAPATAN KOTOR (GROSS)', 44, curY + 4);
  ctx.fillStyle = isLight ? '#15803D' : '#39FF14';
  ctx.textAlign = 'right';
  ctx.fillText(formatRupiah(totalGross), width - 44, curY + 4);
  ctx.textAlign = 'left';

  // Section 2: POTONGAN (DEDUCTIONS)
  curY += 40;
  ctx.fillStyle = isLight ? '#BE185D' : '#FF2BD6';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('[B] KOMPONEN POTONGAN', 36, curY);

  curY += 16;
  const deductions = data.potonganDetail && data.potonganDetail.length > 0
    ? data.potonganDetail
    : [{ nama: 'Total Potongan (BPJS, Pajak, Kasbon, dll)', nominal: data.totalPotongan }];

  deductions.forEach((item) => {
    curY += 18;
    ctx.fillStyle = isLight ? '#1E293B' : '#E4E1ED';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(item.nama, 44, curY);

    ctx.fillStyle = isLight ? '#E11D48' : '#FF2BD6';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`- ${formatRupiah(item.nominal)}`, width - 44, curY);
    ctx.textAlign = 'left';

    curY += 8;
    ctx.strokeStyle = isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(44, curY);
    ctx.lineTo(width - 44, curY);
    ctx.stroke();
  });

  // Deductions Subtotal Row
  curY += 18;
  ctx.fillStyle = isLight ? '#FFE4E6' : 'rgba(255, 43, 214, 0.08)';
  ctx.fillRect(36, curY - 14, width - 72, 28);
  ctx.fillStyle = isLight ? '#0F172A' : '#FFFFFF';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('SUBTOTAL POTONGAN', 44, curY + 4);
  ctx.fillStyle = isLight ? '#BE185D' : '#FF2BD6';
  ctx.textAlign = 'right';
  ctx.fillText(`- ${formatRupiah(data.totalPotongan)}`, width - 44, curY + 4);
  ctx.textAlign = 'left';

  // Section 3: TAKE HOME PAY (NET) HERO
  curY += 45;
  const heroH = 80;
  if (isLight) {
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(36, curY, width - 72, heroH);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, curY, width - 72, heroH);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('GAJI BERSIH DITERIMA (TAKE HOME PAY / NET)', 52, curY + 28);

    ctx.fillStyle = '#64748B';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('Rumus: Pendapatan Kotor (A) - Total Potongan (B)', 52, curY + 54);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(data.takeHomePay), width - 52, curY + 48);
    ctx.textAlign = 'left';
  } else {
    const netGrad = ctx.createLinearGradient(36, curY, width - 36, curY + heroH);
    netGrad.addColorStop(0, '#102A1E');
    netGrad.addColorStop(1, '#0A1E14');
    ctx.fillStyle = netGrad;
    ctx.fillRect(36, curY, width - 72, heroH);

    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, curY, width - 72, heroH);

    ctx.fillStyle = '#7A7A99';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('GAJI BERSIH DITERIMA (TAKE HOME PAY / NET)', 52, curY + 28);

    ctx.fillStyle = '#A0A0C0';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('Rumus: Pendapatan Kotor (A) - Total Potongan (B)', 52, curY + 54);

    ctx.fillStyle = '#39FF14';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(data.takeHomePay), width - 52, curY + 48);
    ctx.textAlign = 'left';
  }

  // Footer & Disclaimer
  curY += heroH + 35;
  ctx.fillStyle = isLight ? '#64748B' : '#64748B';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText(
    `Dokumen digital ini dihasilkan secara otomatis oleh Kalkulator Lembur by Kei Project (${data.tanggalCetak}).`,
    44,
    curY
  );
  ctx.fillText(
    'Perhitungan upah lembur resmi berlandaskan regulasi Peraturan Pemerintah Republik Indonesia No. 35 Tahun 2021.',
    44,
    curY + 16
  );

  return canvas;
}

/**
 * Trigger download slip gaji as PNG directly
 */
export function downloadSalarySlipPNG(data: SalarySlipData, filename?: string): void {
  const canvas = generateSalarySlipCanvas(data);
  const dataUrl = canvas.toDataURL('image/png');
  const safeName = (data.namaKaryawan || 'karyawan').toLowerCase().replace(/\s+/g, '-');
  const actualFilename = filename || `slip-gaji-${safeName}.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = actualFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
