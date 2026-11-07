const fs = require('fs');
const path = require('path');

const histPath = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src\\components\\screens\\HistoryScreen.tsx');
let content = fs.readFileSync(histPath, 'utf8');

// 1. Fix date format to Indonesian (Poin 1)
content = content.replace(
  `              {activeDateRange && (
                <span className="text-[11px] text-[#00F0FF] font-bold">
                  ({activeDateRange.startDate} s.d. {activeDateRange.endDate})
                </span>
              )}`,
  `              {activeDateRange && (
                <span className="text-[11px] text-[#00F0FF] font-bold">
                  ({formatTanggal(activeDateRange.startDate)} s.d. {formatTanggal(activeDateRange.endDate)})
                </span>
              )}`
);

content = content.replace(
  `              <span className="text-[10px] text-[#7A7A99]">
                ({startDate} s.d. {endDate})
              </span>`,
  `              <span className="text-[10px] text-[#00F0FF] font-bold">
                ({formatTanggal(startDate)} s.d. {formatTanggal(endDate)})
              </span>`
);

// 2. Fix Toolbar formatting so it is completely even and aligned (Poin 3)
const oldToolbarHeader = `      {/* Header & Main Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#12121F] border border-white/10 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-heading">
            Riwayat Entri Lembur
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
              {entries.length} Entri Tersimpan
            </span>
          </h1>
          <p className="text-xs text-[#b9cacb] mt-0.5 font-sans">
            Data tersimpan aman di browser Anda. Ekspor ke file CSV atau backup JSON secara berkala.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Catat Kehadiran */}
          <button
            onClick={() => onOpenAttendanceModal?.()}
            className="px-3.5 py-2 rounded bg-[#39FF14]/15 border border-[#39FF14]/50 hover:bg-[#39FF14]/25 text-[#39FF14] font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(57,255,20,0.2)]"
            title="Catat status kehadiran (Masuk, Sakit, Izin, Cuti, Off)"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>+ Catat Kehadiran</span>
          </button>

          <button
            onClick={onNavigateToCalculator}
            className="px-3.5 py-2 rounded bg-gradient-to-r from-[#00F0FF] to-[#0082FB] text-[#0A0A12] font-bold text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.35)] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Entri</span>
          </button>

          <button
            onClick={onOpenImportModal}
            className="px-3 py-2 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-white text-xs font-mono transition-all flex items-center gap-1.5"
            title="Pulihkan data riwayat dari berkas cadangan .JSON"
          >
            <Upload className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Pulihkan JSON</span>
          </button>

          {/* Export Buttons: CSV & JSON */}
          <div className="flex items-center rounded bg-[#1A1A2E] border border-white/15 p-0.5">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded text-xs font-mono text-white hover:text-[#00F0FF] hover:bg-white/5 transition-colors flex items-center gap-1.5"
              title="Unduh file CSV (Kompatibel dengan Microsoft Excel & Google Sheets)"
            >
              <FileText className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded text-xs font-mono text-white hover:text-[#FF2BD6] hover:bg-white/5 transition-colors flex items-center gap-1.5"
              title="Backup JSON lengkap (dapat dipulihkan kapan saja)"
            >
              <FileCode className="w-3.5 h-3.5 text-[#FF2BD6]" />
              <span>Backup JSON</span>
            </button>
          </div>
        </div>
      </div>`;

const newToolbarHeader = `      {/* Header & Main Toolbar - Rata, Proporsional & Rapi */}
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

content = content.replace(oldToolbarHeader, newToolbarHeader);

fs.writeFileSync(histPath, content, 'utf8');
console.log('✅ Updated HistoryScreen.tsx with Indonesian date format and clean aligned toolbar');
