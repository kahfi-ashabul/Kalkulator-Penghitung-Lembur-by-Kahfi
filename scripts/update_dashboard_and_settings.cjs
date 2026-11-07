const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src');

// ==========================================
// 1. Update DashboardScreen.tsx
// ==========================================
{
  const dashPath = path.join(srcDir, 'components', 'screens', 'DashboardScreen.tsx');
  let content = fs.readFileSync(dashPath, 'utf8');

  // Add Zap, CheckCircle icons if not present
  if (!content.includes('Zap,')) {
    content = content.replace(
      `import { \n  Calendar,`,
      `import { \n  Calendar,\n  Zap,\n  CheckCircle,`
    );
  }

  // Add attendanceFillMode state in DashboardScreen
  if (!content.includes('attendanceFillMode')) {
    content = content.replace(
      `  // Attendance modal state\n  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);`,
      `  // Mode Pengisian Kehadiran: 'manual' (hanya yang dicatat) vs 'otomatis' (hari kerja otomatis masuk 8j)
  const [attendanceFillMode, setAttendanceFillMode] = useState<'manual' | 'otomatis'>(
    settings.modeAbsensi || 'manual'
  );

  // Attendance modal state
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);`
    );
  }

  // Update timelineDays creation to support attendanceFillMode
  const oldTimelineCreation = `      // Get attendance record if exists
      const att = attendanceMap[dateStr];
      let status: AttendanceStatus = att ? att.status : (dayOfWeek === 0 || dayOfWeek === 6 ? 'libur_off' : 'masuk');
      let jamReguler = att ? att.jamKerjaReguler : (dayOfWeek === 0 || dayOfWeek === 6 ? 0 : (settings.defaultSistem === '6_hari' ? 7 : 8));
      let catatan = att?.catatan;`;

  const newTimelineCreation = `      // Get attendance record if exists
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
      }`;

  content = content.replace(oldTimelineCreation, newTimelineCreation);

  // Add helper for batch filling attendance in period
  if (!content.includes('handleAutoFillMonthAttendance')) {
    const helperCode = `  // Handler: Isi Otomatis Masuk untuk seluruh hari kerja dalam periode aktif
  const handleAutoFillMonthAttendance = () => {
    const start = new Date(activeDateRange.startDate);
    const end = new Date(activeDateRange.endDate);
    const pad = (n: number) => String(n).padStart(2, '0');

    let countFilled = 0;
    for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
      const dateStr = \`\${cur.getFullYear()}-\${pad(cur.getMonth() + 1)}-\${pad(cur.getDate())}\`;
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

  `;
    content = content.replace(`  const handleDayBarClick = (dateStr: string) => {`, helperCode + `  const handleDayBarClick = (dateStr: string) => {`);
  }

  // Update Top Banner with Attendance Fill Mode Controls
  const oldHeaderButtons = `          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModalDate(new Date().toISOString().slice(0, 10));
                setAttendanceModalOpen(true);
              }}
              className="px-3 py-2 rounded bg-[#1A1A2E] border border-[#39FF14]/40 hover:border-[#39FF14] text-[#39FF14] font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Catat Absensi</span>
            </button>

            <button
              onClick={onNavigateToCalculator}`;

  const newHeaderButtons = `          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Mode: Manual vs Otomatis Masuk */}
            <div className="flex items-center rounded-lg bg-[#0A0A12] border border-white/10 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAttendanceFillMode('manual')}
                className={\`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all \${
                  attendanceFillMode === 'manual'
                    ? 'bg-[#1A1A2E] text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                    : 'text-[#7A7A99] hover:text-white'
                }\`}
                title="Hanya tampilkan jam kerja hari yang Anda catat secara manual"
              >
                Isi Manual
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFillMode('otomatis')}
                className={\`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all \${
                  attendanceFillMode === 'otomatis'
                    ? 'bg-[#1A1A2E] text-[#39FF14] border border-[#39FF14]/40 shadow-[0_0_8px_rgba(57,255,20,0.2)]'
                    : 'text-[#7A7A99] hover:text-white'
                }\`}
                title="Hari kerja otomatis dianggap masuk 8 jam standar"
              >
                Otomatis Masuk
              </button>
            </div>

            {/* Tombol Isi Otomatis Bulan Ini */}
            <button
              type="button"
              onClick={handleAutoFillMonthAttendance}
              className="px-3 py-2 rounded bg-[#1A1A2E] border border-[#FFE600]/30 hover:border-[#FFE600] text-[#FFE600] font-mono text-xs font-bold transition-all flex items-center gap-1.5"
              title="Isi otomatis semua hari kerja bulan ini yang belum ada absensinya"
            >
              <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
              <span className="hidden xl:inline">Isi Otomatis Bulan Ini</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModalDate(new Date().toISOString().slice(0, 10));
                setAttendanceModalOpen(true);
              }}
              className="px-3 py-2 rounded bg-[#39FF14]/15 border border-[#39FF14]/50 hover:bg-[#39FF14]/25 text-[#39FF14] font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_8px_rgba(57,255,20,0.15)]"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>+ Catat Absensi</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToCalculator}`;

  content = content.replace(oldHeaderButtons, newHeaderButtons);

  // Also fix Indonesian date label display on line 288
  content = content.replace(
    `<span className="text-[11px] text-[#00F0FF] font-bold hidden md:inline ml-1">
                ({activeDateRange.label})
              </span>`,
    `<span className="text-[11px] text-[#00F0FF] font-bold hidden md:inline ml-1">
                ({formatTanggal(activeDateRange.startDate)} s.d. ${`formatTanggal(activeDateRange.endDate)`})
              </span>`
  );

  fs.writeFileSync(dashPath, content, 'utf8');
  console.log('✅ Updated DashboardScreen.tsx with attendance fill mode (manual vs otomatis) & bulk fill');
}

// ==========================================
// 2. Update SettingsModal.tsx
// ==========================================
{
  const setPath = path.join(srcDir, 'components', 'modals', 'SettingsModal.tsx');
  let content = fs.readFileSync(setPath, 'utf8');

  if (!content.includes('modeAbsensi')) {
    // Add modeAbsensi state
    content = content.replace(
      `  const [enableMaxOvertimeAlert, setEnableMaxOvertimeAlert] = useState(settings.enableMaxOvertimeAlert ?? true);`,
      `  const [enableMaxOvertimeAlert, setEnableMaxOvertimeAlert] = useState(settings.enableMaxOvertimeAlert ?? true);
  const [modeAbsensi, setModeAbsensi] = useState<'manual' | 'otomatis'>(settings.modeAbsensi || 'manual');`
    );

    // Add to handleSubmit
    content = content.replace(
      `      showOnboardingGuide,
      enableMaxOvertimeAlert,
    });`,
      `      showOnboardingGuide,
      enableMaxOvertimeAlert,
      modeAbsensi,
    });`
    );

    // Add to default reset
    content = content.replace(
      `    setShowOnboardingGuide(defaultSettings.showOnboardingGuide ?? true);
    setEnableMaxOvertimeAlert(defaultSettings.enableMaxOvertimeAlert ?? true);`,
      `    setShowOnboardingGuide(defaultSettings.showOnboardingGuide ?? true);
    setEnableMaxOvertimeAlert(defaultSettings.enableMaxOvertimeAlert ?? true);
    setModeAbsensi(defaultSettings.modeAbsensi || 'manual');`
    );

    // Add selector UI before preferences toggles
    const targetUI = `          {/* Preferences Toggles */}`;
    const newUI = `          {/* Mode Pengisian Absensi */}
          <div>
            <label className="text-[#b9cacb] mb-1 block">Mode Pengisian Absensi Kehadiran</label>
            <select
              value={modeAbsensi}
              onChange={(e) => setModeAbsensi(e.target.value as any)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
            >
              <option value="manual">Manual Masuk (Hanya tampilkan hari yang Anda catat kehadiran)</option>
              <option value="otomatis">Otomatis Masuk (Semua hari kerja otomatis dihitung 8 jam normal)</option>
            </select>
          </div>

          `;
    content = content.replace(targetUI, newUI + targetUI);

    fs.writeFileSync(setPath, content, 'utf8');
    console.log('✅ Updated SettingsModal.tsx with modeAbsensi option');
  }
}
