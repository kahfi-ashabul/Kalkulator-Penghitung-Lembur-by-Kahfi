const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src');

// ========================================================
// 1. DashboardScreen.tsx: Rapikan Legend dengan Spasi Lega
// ========================================================
{
  const dashPath = path.join(srcDir, 'components', 'screens', 'DashboardScreen.tsx');
  let content = fs.readFileSync(dashPath, 'utf8');

  const oldLegend = `          {/* Color Legends */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#10B981] border border-emerald-600 shadow-sm" />
              <span>Masuk Kerja (Hijau)</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-300">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#00F0FF] border border-sky-600 shadow-sm" />
              <span>Lembur (Cyan)</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#F59E0B] border border-amber-600 shadow-sm" />
              <span>Sakit (Oranye)</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-pink-800 dark:text-pink-300">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#EC4899] border border-pink-600 shadow-sm" />
              <span>Izin (Pink)</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-purple-800 dark:text-purple-300">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#A855F7] border border-purple-600 shadow-sm" />
              <span>Cuti (Ungu)</span>
            </span>
          </div>`;

  const newLegend = `          {/* Color Legends - Berjarak Lega, Rapi & Elegan */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono pt-1">
            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-emerald-500/30 dark:border-emerald-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-emerald-500/40 shrink-0" />
              <span className="font-bold text-emerald-900 dark:text-[#34D399]">Masuk Kerja</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans">(Hijau)</span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-sky-500/30 dark:border-sky-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#00F0FF] ring-2 ring-sky-500/40 shrink-0" />
              <span className="font-bold text-sky-900 dark:text-[#00F0FF]">Lembur</span>
              <span className="text-[10px] text-sky-700 dark:text-sky-300 font-sans">(Cyan)</span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-amber-500/30 dark:border-amber-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] ring-2 ring-amber-500/40 shrink-0" />
              <span className="font-bold text-amber-900 dark:text-[#F59E0B]">Sakit</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-sans">(Oranye)</span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-pink-500/30 dark:border-pink-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#EC4899] ring-2 ring-pink-500/40 shrink-0" />
              <span className="font-bold text-pink-900 dark:text-[#EC4899]">Izin</span>
              <span className="text-[10px] text-pink-700 dark:text-pink-300 font-sans">(Pink)</span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#161626]/70 dark:bg-[#161626] border border-purple-500/30 dark:border-purple-500/40 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-[#A855F7] ring-2 ring-purple-500/40 shrink-0" />
              <span className="font-bold text-purple-900 dark:text-[#A855F7]">Cuti</span>
              <span className="text-[10px] text-purple-700 dark:text-purple-300 font-sans">(Ungu)</span>
            </div>
          </div>`;

  content = content.replace(oldLegend, newLegend);
  fs.writeFileSync(dashPath, content, 'utf8');
  console.log('✅ Updated DashboardScreen.tsx legend with spacious elegant pills');
}

// ========================================================
// 2. HistoryScreen.tsx: Rapikan Toolbar (tengah kosong, kanan mentok)
// ========================================================
{
  const histPath = path.join(srcDir, 'components', 'screens', 'HistoryScreen.tsx');
  let content = fs.readFileSync(histPath, 'utf8');

  const oldToolbar = `      {/* Header & Main Toolbar - Rata, Proporsional & Rapi */}
      <div className="p-4 sm:p-5 rounded-lg bg-[#12121F] border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
                Riwayat & Log Kehadiran
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                {entries.length} Lembur
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
                {Object.keys(attendanceMap || {}).length} Absensi
              </span>
            </div>
            <p className="text-xs text-[#b9cacb] mt-1 font-sans">
              Semua data tersimpan aman di browser Anda. Ekspor ke CSV Excel atau pulihkan dari cadangan JSON.
            </p>
          </div>

          {/* Action Buttons - 2 Kelompok Aksi Rapi & Rata */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Kelompok 1: Aksi Tambah Data (Catat Kehadiran & Lembur) */}
            <button
              type="button"
              onClick={() => onOpenAttendanceModal?.()}
              className="h-9 px-3.5 rounded bg-[#39FF14]/15 border border-[#39FF14]/50 hover:bg-[#39FF14]/25 text-[#39FF14] font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(57,255,20,0.15)]"
              title="Catat absensi masuk, sakit, izin, atau cuti"
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>+ Catat Kehadiran</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToCalculator}
              className="h-9 px-3.5 rounded bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>+ Hitung Lembur</span>
            </button>

            {/* Kelompok 2: Kelola Berkas (Pulihkan, CSV, JSON) */}
            <div className="flex items-center gap-1.5 pl-1 sm:border-l border-white/10">
              <button
                type="button"
                onClick={onOpenImportModal}
                className="h-9 px-3 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-xs font-mono transition-all flex items-center gap-1.5"
                title="Pulihkan data lembur dan catatan absensi dari berkas .JSON"
              >
                <Upload className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                <span>Pulihkan</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="h-9 px-3 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-xs font-mono transition-all flex items-center gap-1.5"
                title="Unduh file CSV Excel lengkap"
              >
                <FileText className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                <span>Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="h-9 px-3 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#FF2BD6] text-white hover:text-[#FF2BD6] text-xs font-mono transition-all flex items-center gap-1.5"
                title="Backup berkas JSON lengkap"
              >
                <FileCode className="w-3.5 h-3.5 text-[#FF2BD6] shrink-0" />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;

  const newToolbar = `      {/* Header & Main Toolbar - Kiri Judul, Kanan Mentok Tombol, Tengah Space */}
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

          {/* Sisi Kanan: Seluruh Tombol Rata Mentok ke Kanan */}
          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 shrink-0">
            {/* Aksi Input Data */}
            <button
              type="button"
              onClick={() => onOpenAttendanceModal?.()}
              className="h-9 px-3.5 rounded bg-[#39FF14]/15 border border-[#39FF14]/50 hover:bg-[#39FF14]/25 text-[#39FF14] font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(57,255,20,0.15)]"
              title="Catat absensi masuk, sakit, izin, atau cuti"
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>+ Catat Kehadiran</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToCalculator}
              className="h-9 px-3.5 rounded bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>+ Hitung Lembur</span>
            </button>

            {/* Aksi Berkas */}
            <div className="flex items-center gap-1.5 pl-1.5 sm:border-l border-white/10">
              <button
                type="button"
                onClick={onOpenImportModal}
                className="h-9 px-3 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-xs font-mono transition-all flex items-center gap-1.5"
                title="Pulihkan data lembur dan catatan absensi dari berkas .JSON"
              >
                <Upload className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                <span>Pulihkan</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="h-9 px-3 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-xs font-mono transition-all flex items-center gap-1.5"
                title="Unduh file CSV Excel lengkap"
              >
                <FileText className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                <span>Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="h-9 px-3 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#FF2BD6] text-white hover:text-[#FF2BD6] text-xs font-mono transition-all flex items-center gap-1.5"
                title="Backup berkas JSON lengkap"
              >
                <FileCode className="w-3.5 h-3.5 text-[#FF2BD6] shrink-0" />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;

  content = content.replace(oldToolbar, newToolbar);
  fs.writeFileSync(histPath, content, 'utf8');
  console.log('✅ Updated HistoryScreen.tsx toolbar layout: right-aligned buttons, middle space');
}

// ========================================================
// 3. Navigation.tsx & Footer.tsx: Judul Kontras Tinggi & Seragam
// ========================================================
{
  const navPath = path.join(srcDir, 'components', 'Navigation.tsx');
  let content = fs.readFileSync(navPath, 'utf8');

  // Replace header logo & title with ultra high-contrast styling
  const oldNavBrand = `            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight font-heading">
                  Kalkulator Penghitung Lembur
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FF2BD6] to-[#7928CA] text-white shrink-0">
                  by Kahfi
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#7A7A99] font-mono">
                <span className="text-[#39FF14]">●</span>
                <span>PP 35/2021 COMPLIANT</span>
                <span className="hidden md:inline text-white/20">|</span>
                <span className="hidden md:inline text-[#b9cacb]">Labor Engine v1.1</span>
              </div>
            </div>`;

  const newNavBrand = `            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[#0F172A] dark:text-white text-base sm:text-lg tracking-tight font-heading drop-shadow-xs">
                  Kalkulator Penghitung Lembur
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#9333EA] dark:bg-[#7928CA] text-white border border-[#9333EA]/40 dark:border-purple-500/50 shadow-sm shrink-0">
                  by Kahfi
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#334155] dark:text-[#b9cacb] font-mono font-semibold">
                <span className="text-[#16A34A] dark:text-[#39FF14]">●</span>
                <span className="text-[#0F172A] dark:text-white font-bold">PP 35/2021 COMPLIANT</span>
                <span className="hidden md:inline text-[#64748B] dark:text-white/30">|</span>
                <span className="hidden md:inline text-[#475569] dark:text-[#b9cacb]">Labor Engine v1.1</span>
              </div>
            </div>`;

  content = content.replace(oldNavBrand, newNavBrand);
  fs.writeFileSync(navPath, content, 'utf8');
  console.log('✅ Updated Navigation.tsx with high-contrast title and badge');
}

// Update Footer.tsx to match Navigation.tsx exactly
{
  const footPath = path.join(srcDir, 'components', 'Footer.tsx');
  let content = fs.readFileSync(footPath, 'utf8');

  const oldFootBrand = `            <div className="flex items-center gap-2 text-white font-bold text-sm font-heading">
              <Sparkles className="w-4 h-4 text-[#00F0FF]" />
              <span>Kalkulator Penghitung Lembur</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FF2BD6]/20 text-[#FF2BD6] border border-[#FF2BD6]/30">
                by Kahfi
              </span>
            </div>`;

  const newFootBrand = `            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-7 h-7 rounded bg-[#161626] border border-[#00F0FF]/40 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <span className="font-black text-[#0F172A] dark:text-white text-base tracking-tight font-heading">
                Kalkulator Penghitung Lembur
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#9333EA] dark:bg-[#7928CA] text-white border border-[#9333EA]/40 dark:border-purple-500/50 shadow-sm shrink-0">
                by Kahfi
              </span>
            </div>`;

  content = content.replace(oldFootBrand, newFootBrand);
  fs.writeFileSync(footPath, content, 'utf8');
  console.log('✅ Updated Footer.tsx brand title and badge to match Navigation.tsx exactly');
}

// ========================================================
// 4. Update index.css for Light Mode Footer & Header Contrast
// ========================================================
{
  const cssPath = path.join(srcDir, 'index.css');
  let content = fs.readFileSync(cssPath, 'utf8');

  if (!content.includes('/* Footer in Light Mode */')) {
    const footerStyle = `
/* Footer in Light Mode */
html.light footer {
  background-color: #FFFFFF !important;
  border-top-color: #E2E8F0 !important;
  color: #334155 !important;
}

html.light footer .text-white {
  color: #0F172A !important;
}

html.light footer .text-\\[\\#b9cacb\\] {
  color: #475569 !important;
}

html.light footer .text-\\[\\#7A7A99\\] {
  color: #64748B !important;
}

/* Brand badge in Light Mode */
html.light span.bg-\\[\\#9333EA\\] {
  background-color: #7E22CE !important;
  color: #FFFFFF !important;
}
`;
    content += footerStyle;
    fs.writeFileSync(cssPath, content, 'utf8');
    console.log('✅ Updated index.css with Light Mode Footer & Badge overrides');
  }
}
