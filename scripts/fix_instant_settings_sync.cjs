const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src');

// ==========================================
// 1. Update DashboardScreen.tsx
// ==========================================
{
  const dashPath = path.join(srcDir, 'components', 'screens', 'DashboardScreen.tsx');
  let content = fs.readFileSync(dashPath, 'utf8');

  // Add onUpdateSettings to interface
  if (!content.includes('onUpdateSettings?:')) {
    content = content.replace(
      `  onOpenReceipt: (entry: OvertimeEntry) => void;\n}`,
      `  onOpenReceipt: (entry: OvertimeEntry) => void;\n  onUpdateSettings?: (newSettings: UserSettings) => void;\n}`
    );
  }

  // Add onUpdateSettings to destructuring
  if (!content.includes('onUpdateSettings,')) {
    content = content.replace(
      `  onOpenReceipt,\n}) => {`,
      `  onOpenReceipt,\n  onUpdateSettings,\n}) => {`
    );
  }

  // Add useEffect to sync attendanceFillMode from settings.modeAbsensi immediately when settings are saved
  if (!content.includes('setAttendanceFillMode(settings.modeAbsensi);')) {
    const syncEffect = `  // Sinkronkan mode pengisian absensi langsung saat pengaturan disimpan tanpa perlu refresh
  useEffect(() => {
    if (settings.modeAbsensi) {
      setAttendanceFillMode(settings.modeAbsensi);
    }
  }, [settings.modeAbsensi]);

`;
    content = content.replace(
      `  // Mode Pengisian Kehadiran: 'manual' (hanya yang dicatat) vs 'otomatis' (hari kerja otomatis masuk 8j)`,
      syncEffect + `  // Mode Pengisian Kehadiran: 'manual' (hanya yang dicatat) vs 'otomatis' (hari kerja otomatis masuk 8j)`
    );
  }

  // Add attendanceFillMode to timelineDays useMemo dependencies!
  content = content.replace(
    `  }, [activeDateRange, attendanceMap, rangeEntries, settings.defaultSistem]);`,
    `  }, [activeDateRange, attendanceMap, rangeEntries, settings.defaultSistem, attendanceFillMode]);`
  );

  // Add handleToggleFillMode function
  if (!content.includes('handleToggleFillMode')) {
    const toggleFunc = `  const handleToggleFillMode = (mode: 'manual' | 'otomatis') => {
    setAttendanceFillMode(mode);
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        modeAbsensi: mode,
      });
    }
  };

`;
    content = content.replace(
      `  // Handler: Isi Otomatis Masuk untuk seluruh hari kerja dalam periode aktif`,
      toggleFunc + `  // Handler: Isi Otomatis Masuk untuk seluruh hari kerja dalam periode aktif`
    );

    // Replace onClick on buttons to use handleToggleFillMode
    content = content.replace(
      `onClick={() => setAttendanceFillMode('manual')}`,
      `onClick={() => handleToggleFillMode('manual')}`
    );
    content = content.replace(
      `onClick={() => setAttendanceFillMode('otomatis')}`,
      `onClick={() => handleToggleFillMode('otomatis')}`
    );
  }

  fs.writeFileSync(dashPath, content, 'utf8');
  console.log('✅ Updated DashboardScreen.tsx with reactive settings sync & useMemo dependency');
}

// ==========================================
// 2. Update App.tsx
// ==========================================
{
  const appPath = path.join(srcDir, 'App.tsx');
  let content = fs.readFileSync(appPath, 'utf8');

  // Pass onUpdateSettings to DashboardScreen
  if (!content.includes('onUpdateSettings={handleSaveSettings}')) {
    content = content.replace(
      `          <DashboardScreen
            entries={entries}
            settings={settings}
            attendanceMap={attendanceMap}`,
      `          <DashboardScreen
            entries={entries}
            settings={settings}
            attendanceMap={attendanceMap}
            onUpdateSettings={handleSaveSettings}`
    );
    fs.writeFileSync(appPath, content, 'utf8');
    console.log('✅ Updated App.tsx to pass onUpdateSettings to DashboardScreen');
  }
}

// ==========================================
// 3. Update OvertimeCalculatorScreen.tsx
// ==========================================
{
  const calcPath = path.join(srcDir, 'components', 'screens', 'OvertimeCalculatorScreen.tsx');
  let content = fs.readFileSync(calcPath, 'utf8');

  if (!content.includes('// Sinkronkan default settings ke form saat diubah di Pengaturan')) {
    const syncEffect = `  // Sinkronkan default settings ke form saat diubah di Pengaturan tanpa refresh
  useEffect(() => {
    setGajiPokok(settings.defaultGajiPokok);
    setGajiPokokStr(settings.defaultGajiPokok.toLocaleString('id-ID'));
    setTunjanganTetap(settings.defaultTunjangan || 0);
    setTunjanganTetapStr((settings.defaultTunjangan || 0).toLocaleString('id-ID'));
    setSistem(settings.defaultSistem || '5_hari');
    if (settings.defaultUpahHarian) {
      setUpahHarianPokok(settings.defaultUpahHarian);
      setUpahHarianPokokStr(settings.defaultUpahHarian.toLocaleString('id-ID'));
    }
  }, [settings.defaultGajiPokok, settings.defaultTunjangan, settings.defaultSistem, settings.defaultUpahHarian]);

`;
    content = content.replace(
      `  // UI feedback states\n  const [copied, setCopied] = useState<boolean>(false);`,
      syncEffect + `  // UI feedback states\n  const [copied, setCopied] = useState<boolean>(false);`
    );
    fs.writeFileSync(calcPath, content, 'utf8');
    console.log('✅ Updated OvertimeCalculatorScreen.tsx with reactive settings sync');
  }
}

// ==========================================
// 4. Update SalaryCalculatorScreen.tsx
// ==========================================
{
  const salaryPath = path.join(srcDir, 'components', 'screens', 'SalaryCalculatorScreen.tsx');
  let content = fs.readFileSync(salaryPath, 'utf8');

  if (!content.includes('// Sinkronkan default settings ke form gaji')) {
    const syncEffect = `  // Sinkronkan default settings ke form gaji saat diubah di Pengaturan tanpa refresh
  useEffect(() => {
    setGajiPokok(settings.defaultGajiPokok || 6000000);
    setGajiPokokStr((settings.defaultGajiPokok || 6000000).toLocaleString('id-ID'));
    setTunjanganTetap(settings.defaultTunjangan || 0);
    setTunjanganTetapStr((settings.defaultTunjangan || 0).toLocaleString('id-ID'));
    setPembagiHari(settings.defaultSistem === '6_hari' ? 25 : 21);
  }, [settings.defaultGajiPokok, settings.defaultTunjangan, settings.defaultSistem]);

`;
    content = content.replace(
      `  // Bulanan inputs\n  const [gajiPokok, setGajiPokok]`,
      syncEffect + `  // Bulanan inputs\n  const [gajiPokok, setGajiPokok]`
    );
    fs.writeFileSync(salaryPath, content, 'utf8');
    console.log('✅ Updated SalaryCalculatorScreen.tsx with reactive settings sync');
  }
}
