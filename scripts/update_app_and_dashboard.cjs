const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src');

// ==========================================
// 1. Update App.tsx
// ==========================================
{
  const appPath = path.join(srcDir, 'App.tsx');
  let content = fs.readFileSync(appPath, 'utf8');

  // Add AttendanceModal import if not present
  if (!content.includes(`import { AttendanceModal }`)) {
    content = content.replace(
      `import { SettingsModal } from './components/modals/SettingsModal';`,
      `import { SettingsModal } from './components/modals/SettingsModal';\nimport { AttendanceModal } from './components/modals/AttendanceModal';`
    );
  }

  // Add deleteAttendanceRecord import
  if (!content.includes('deleteAttendanceRecord')) {
    content = content.replace(
      `  setAttendanceRecord,`,
      `  setAttendanceRecord,\n  deleteAttendanceRecord,`
    );
  }

  // Add state & handlers for global AttendanceModal
  if (!content.includes('isAttendanceModalOpen')) {
    const targetState = `  // Attendance State\n  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});`;
    const replacementState = `  // Attendance State & Global Modal
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalDate, setAttendanceModalDate] = useState(() => new Date().toISOString().slice(0, 10));

  const handleOpenAttendanceModal = (date?: string) => {
    if (settings.audioFeedback) playCyberClick();
    if (date) {
      setAttendanceModalDate(date);
    } else {
      setAttendanceModalDate(new Date().toISOString().slice(0, 10));
    }
    setIsAttendanceModalOpen(true);
  };

  const handleDeleteAttendance = (tanggal: string) => {
    deleteAttendanceRecord(tanggal);
    setAttendanceMap(getStoredAttendance());
    if (settings.audioFeedback) playCyberClick();
  };`;
    content = content.replace(targetState, replacementState);
  }

  // Update handleSaveEntry to auto-sync attendance
  const oldSaveEntry = `  const handleSaveEntry = (newEntry: OvertimeEntry) => {
    addStoredEntry(newEntry);
    setEntries(getStoredEntries());
  };`;

  const newSaveEntry = `  const handleSaveEntry = (newEntry: OvertimeEntry) => {
    addStoredEntry(newEntry);
    setEntries(getStoredEntries());

    // Otomatis sinkronkan catatan kehadiran 'masuk' jika belum ada
    const currentAtt = getStoredAttendance();
    const existing = currentAtt[newEntry.tanggal];
    if (!existing || existing.status === 'libur_off') {
      const isOff = newEntry.jenisHari === 'libur';
      const regHours = newEntry.jamKerjaReguler ?? (newEntry.sistem === '6_hari' ? 7 : 8);
      const autoAtt: AttendanceRecord = {
        tanggal: newEntry.tanggal,
        status: isOff ? 'libur_off' : 'masuk',
        jamKerjaReguler: isOff ? 0 : regHours,
        catatan: newEntry.catatan || 'Masuk Kerja & Lembur',
      };
      setAttendanceRecord(autoAtt);
      setAttendanceMap(getStoredAttendance());
    }
  };`;
  content = content.replace(oldSaveEntry, newSaveEntry);

  // Pass handlers to HistoryScreen and DashboardScreen
  content = content.replace(
    `            attendanceMap={attendanceMap}
            onNavigateToCalculator={() => handleSelectScreen('kalkulator')}`,
    `            attendanceMap={attendanceMap}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onDeleteAttendance={handleDeleteAttendance}
            onNavigateToCalculator={() => handleSelectScreen('kalkulator')}`
  );

  content = content.replace(
    `            attendanceMap={attendanceMap}
            onSaveAttendance={handleSaveAttendance}
            onNavigateToCalculator=`,
    `            attendanceMap={attendanceMap}
            onSaveAttendance={handleSaveAttendance}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onDeleteAttendance={handleDeleteAttendance}
            onNavigateToCalculator=`
  );

  // Add AttendanceModal before closing div
  if (!content.includes('<AttendanceModal')) {
    content = content.replace(
      `      <SettingsModal`,
      `      {/* Global Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        selectedDate={attendanceModalDate}
        attendanceMap={attendanceMap}
        sistem={settings.defaultSistem}
        onSaveRecord={handleSaveAttendance}
        onDeleteRecord={handleDeleteAttendance}
      />

      <SettingsModal`
    );
  }

  fs.writeFileSync(appPath, content, 'utf8');
  console.log('✅ Updated App.tsx');
}

// ==========================================
// 2. Update DashboardScreen.tsx
// ==========================================
{
  const dashPath = path.join(srcDir, 'components', 'screens', 'DashboardScreen.tsx');
  let content = fs.readFileSync(dashPath, 'utf8');

  // Add onOpenAttendanceModal and onDeleteAttendance to interface
  if (!content.includes('onOpenAttendanceModal?:')) {
    content = content.replace(
      `  onSaveAttendance: (record: AttendanceRecord) => void;`,
      `  onSaveAttendance: (record: AttendanceRecord) => void;
  onOpenAttendanceModal?: (date?: string) => void;
  onDeleteAttendance?: (tanggal: string) => void;`
    );
  }

  // Add to destructuring
  if (!content.includes('onOpenAttendanceModal,')) {
    content = content.replace(
      `  onSaveAttendance,\n  onNavigateToCalculator,`,
      `  onSaveAttendance,\n  onOpenAttendanceModal,\n  onDeleteAttendance,\n  onNavigateToCalculator,`
    );
  }

  // Update AttendanceModal invocation in DashboardScreen to pass attendanceMap & onDeleteRecord
  content = content.replace(
    `      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        selectedDate={modalDate}
        currentRecord={attendanceMap[modalDate]}
        sistem={settings.defaultSistem}
        onSaveRecord={onSaveAttendance}
      />`,
    `      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        selectedDate={modalDate}
        attendanceMap={attendanceMap}
        sistem={settings.defaultSistem}
        onSaveRecord={onSaveAttendance}
        onDeleteRecord={onDeleteAttendance}
      />`
  );

  fs.writeFileSync(dashPath, content, 'utf8');
  console.log('✅ Updated DashboardScreen.tsx');
}
