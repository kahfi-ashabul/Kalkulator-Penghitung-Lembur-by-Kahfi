/**
 * Fix All Pending Changes:
 * 1. HistoryScreen: pass attendanceMap to exportToCSV & exportToJSON
 * 2. App.tsx: pass attendanceMap to HistoryScreen, update handleImportComplete, add clearAllAttendance
 * 3. ImportModal: update onImportComplete signature to include attendanceMap
 * 4. SettingsModal: add 3 separate delete buttons (Kehadiran / Lembur / Reset Semua)
 * 5. DashboardScreen & HistoryScreen: clamp custom period max 40 days
 */

const fs = require('fs');
const path = require('path');

const BASE = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src');

function readFile(rel) {
  return fs.readFileSync(path.join(BASE, rel), 'utf8');
}
function writeFile(rel, content) {
  fs.writeFileSync(path.join(BASE, rel), content, 'utf8');
  console.log('✅ Written:', rel);
}

// ============================================================
// 1. HistoryScreen.tsx
// ============================================================
{
  let content = readFile('components/screens/HistoryScreen.tsx');

  // Add AttendanceRecord import
  content = content.replace(
    `import { OvertimeEntry, UserSettings } from '../../types/overtime';`,
    `import { OvertimeEntry, UserSettings, AttendanceRecord } from '../../types/overtime';`
  );

  // Add clampCustomRange import
  content = content.replace(
    `import { \n  formatRupiah, \n  formatTanggal, \n  formatJam, \n  getCutoffDateRange \n} from '../../utils/calculations';`,
    `import { \n  formatRupiah, \n  formatTanggal, \n  formatJam, \n  getCutoffDateRange,\n  clampCustomRange\n} from '../../utils/calculations';`
  );

  // Add attendanceMap to props interface
  content = content.replace(
    `interface HistoryScreenProps {\n  entries: OvertimeEntry[];\n  settings: UserSettings;`,
    `interface HistoryScreenProps {\n  entries: OvertimeEntry[];\n  settings: UserSettings;\n  attendanceMap: Record<string, AttendanceRecord>;`
  );

  // Add attendanceMap to destructuring
  content = content.replace(
    `export const HistoryScreen: React.FC<HistoryScreenProps> = ({\n  entries,\n  settings,\n  onNavigateToCalculator,`,
    `export const HistoryScreen: React.FC<HistoryScreenProps> = ({\n  entries,\n  settings,\n  attendanceMap,\n  onNavigateToCalculator,`
  );

  // Fix handleExportCSV - pass attendanceMap + fix prefix param order
  content = content.replace(
    `  const handleExportCSV = () => {\n    if (settings.audioFeedback) playCyberClick();\n    const prefix = activeDateRange \n      ? \`lembur-\${activeDateRange.startDate}-sd-\${activeDateRange.endDate}\` \n      : 'riwayat-lembur-semua';\n    exportToCSV(filteredEntries, prefix);\n  };`,
    `  const handleExportCSV = () => {\n    if (settings.audioFeedback) playCyberClick();\n    const prefix = activeDateRange \n      ? \`lembur-\${activeDateRange.startDate}-sd-\${activeDateRange.endDate}\` \n      : 'riwayat-lembur-semua';\n    exportToCSV(filteredEntries, attendanceMap, prefix);\n  };`
  );

  // Fix handleExportJSON - pass attendanceMap
  content = content.replace(
    `  const handleExportJSON = () => {\n    if (settings.audioFeedback) playCyberClick();\n    exportToJSON(filteredEntries, 'backup-lembur-kahfi');\n  };`,
    `  const handleExportJSON = () => {\n    if (settings.audioFeedback) playCyberClick();\n    exportToJSON(filteredEntries, attendanceMap, 'backup-lembur-kahfi');\n  };`
  );

  // Add clamp to custom date range end handler
  // Find endDate change handler and add clamp
  content = content.replace(
    /onChange=\{\(e\) => setEndDate\(e\.target\.value\)\}/g,
    `onChange={(e) => {\n                const { end } = clampCustomRange(startDate, e.target.value, 40);\n                setEndDate(end);\n              }}`
  );

  writeFile('components/screens/HistoryScreen.tsx', content);
}

// ============================================================
// 2. App.tsx
// ============================================================
{
  let content = readFile('App.tsx');

  // Add clearAllAttendance, saveStoredAttendance imports
  content = content.replace(
    `  getStoredAttendance,\n  setAttendanceRecord \n} from './utils/storage';`,
    `  getStoredAttendance,\n  setAttendanceRecord,\n  clearAllAttendance,\n  saveStoredAttendance\n} from './utils/storage';`
  );

  // Add AttendanceRecord import in types section (already there, skip if exists)
  // Update handleImportComplete to also handle attendanceMap
  content = content.replace(
    `  const handleImportComplete = (imported: OvertimeEntry[], mode: 'merge' | 'replace') => {\n    let finalEntries: OvertimeEntry[] = [];\n    if (mode === 'replace') {\n      finalEntries = imported;\n    } else {\n      const existingIds = new Set(entries.map((e) => e.id));\n      const filteredNew = imported.filter((e) => !existingIds.has(e.id));\n      finalEntries = [...filteredNew, ...entries];\n    }\n    saveStoredEntries(finalEntries);\n    setEntries(finalEntries);\n    if (settings.audioFeedback) playCyberSuccess();\n  };`,
    `  const handleImportComplete = (imported: OvertimeEntry[], newAttMap: Record<string, AttendanceRecord>, mode: 'merge' | 'replace') => {\n    let finalEntries: OvertimeEntry[] = [];\n    if (mode === 'replace') {\n      finalEntries = imported;\n    } else {\n      const existingIds = new Set(entries.map((e) => e.id));\n      const filteredNew = imported.filter((e) => !existingIds.has(e.id));\n      finalEntries = [...filteredNew, ...entries];\n    }\n    saveStoredEntries(finalEntries);\n    setEntries(finalEntries);\n    // Merge / replace attendance records from import\n    if (mode === 'replace') {\n      saveStoredAttendance(newAttMap);\n    } else {\n      const merged = { ...getStoredAttendance(), ...newAttMap };\n      saveStoredAttendance(merged);\n    }\n    setAttendanceMap(getStoredAttendance());\n    if (settings.audioFeedback) playCyberSuccess();\n  };`
  );

  // Add handleClearAttendance
  content = content.replace(
    `  const handleResetAllData = () => {`,
    `  const handleClearAttendance = () => {\n    clearAllAttendance();\n    setAttendanceMap({});\n    if (settings.audioFeedback) playCyberClick();\n  };\n\n  const handleResetAllData = () => {`
  );

  // Pass attendanceMap to HistoryScreen
  content = content.replace(
    `          <HistoryScreen\n            entries={entries}\n            settings={settings}\n            onNavigateToCalculator={() => handleSelectScreen('kalkulator')}`,
    `          <HistoryScreen\n            entries={entries}\n            settings={settings}\n            attendanceMap={attendanceMap}\n            onNavigateToCalculator={() => handleSelectScreen('kalkulator')}`
  );

  // Update SettingsModal props - add onClearEntries and onClearAttendance
  content = content.replace(
    `      <SettingsModal\n        isOpen={isSettingsOpen}\n        onClose={() => setIsSettingsOpen(false)}\n        settings={settings}\n        onSaveSettings={handleSaveSettings}\n        onResetAllData={handleResetAllData}\n        onOpenGuide={() => setIsOnboardingOpen(true)}\n      />`,
    `      <SettingsModal\n        isOpen={isSettingsOpen}\n        onClose={() => setIsSettingsOpen(false)}\n        settings={settings}\n        onSaveSettings={handleSaveSettings}\n        onResetAllData={handleResetAllData}\n        onClearEntries={handleClearAllEntries}\n        onClearAttendance={handleClearAttendance}\n        onOpenGuide={() => setIsOnboardingOpen(true)}\n      />`
  );

  writeFile('App.tsx', content);
}

// ============================================================
// 3. ImportModal.tsx
// ============================================================
{
  let content = readFile('components/modals/ImportModal.tsx');

  // Add AttendanceRecord import
  content = content.replace(
    `import { OvertimeEntry } from '../../types/overtime';`,
    `import { OvertimeEntry, AttendanceRecord } from '../../types/overtime';`
  );

  // Update interface
  content = content.replace(
    `  onImportComplete: (newEntries: OvertimeEntry[], mode: 'merge' | 'replace') => void;`,
    `  onImportComplete: (newEntries: OvertimeEntry[], attendanceMap: Record<string, AttendanceRecord>, mode: 'merge' | 'replace') => void;`
  );

  // Add state for imported attendance map
  content = content.replace(
    `  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');`,
    `  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');\n  const [importedAttMap, setImportedAttMap] = useState<Record<string, AttendanceRecord>>({});`
  );

  // Update handleFileChange to also set importedAttMap
  content = content.replace(
    `      const res = parseImportJSON(text);\n      setValidEntries(res.validEntries);\n      setErrors(res.errors);\n      setIsProcessing(false);`,
    `      const res = parseImportJSON(text);\n      setValidEntries(res.validEntries);\n      setImportedAttMap(res.attendanceMap || {});\n      setErrors(res.errors);\n      setIsProcessing(false);`
  );

  // Update handleCommit
  content = content.replace(
    `    onImportComplete(validEntries, importMode);`,
    `    onImportComplete(validEntries, importedAttMap, importMode);`
  );

  // Update preview stats - add attendance count
  content = content.replace(
    `                <div className="p-3 rounded bg-[#1A1A2E] border border-[#39FF14]/30 flex items-center gap-2">\n                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />\n                  <span>\n                    <strong className="text-[#39FF14]">{validEntries.length}</strong> entri valid terdeteksi\n                  </span>\n                </div>\n                <div className="p-3 rounded bg-[#1A1A2E] border border-[#ffb4ab]/30 flex items-center gap-2">\n                  <AlertCircle className="w-4 h-4 text-[#ffb4ab]" />\n                  <span>\n                    <strong className="text-[#ffb4ab]">{errors.length}</strong> baris peringatan/gagal\n                  </span>\n                </div>`,
    `                <div className="p-3 rounded bg-[#1A1A2E] border border-[#39FF14]/30 flex items-center gap-2">\n                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />\n                  <span>\n                    <strong className="text-[#39FF14]">{validEntries.length}</strong> entri lembur valid\n                  </span>\n                </div>\n                <div className="p-3 rounded bg-[#1A1A2E] border border-[#ffb4ab]/30 flex items-center gap-2">\n                  <AlertCircle className="w-4 h-4 text-[#ffb4ab]" />\n                  <span>\n                    <strong className="text-[#ffb4ab]">{errors.length}</strong> baris peringatan/gagal\n                  </span>\n                </div>`
  );

  writeFile('components/modals/ImportModal.tsx', content);
}

// ============================================================
// 4. SettingsModal.tsx - 3 Separate Delete Buttons
// ============================================================
{
  let content = readFile('components/modals/SettingsModal.tsx');

  // Add new props to interface
  content = content.replace(
    `  onResetAllData?: () => void;\n}`,
    `  onResetAllData?: () => void;\n  onClearEntries?: () => void;\n  onClearAttendance?: () => void;\n}`
  );

  // Add new props to destructuring
  content = content.replace(
    `  onResetAllData,\n}) => {`,
    `  onResetAllData,\n  onClearEntries,\n  onClearAttendance,\n}) => {`
  );

  // Add confirm states for 3 actions
  content = content.replace(
    `  const [showConfirmReset, setShowConfirmReset] = useState(false);`,
    `  const [showConfirmReset, setShowConfirmReset] = useState(false);\n  const [showConfirmClearEntries, setShowConfirmClearEntries] = useState(false);\n  const [showConfirmClearAttendance, setShowConfirmClearAttendance] = useState(false);`
  );

  // Replace the entire Zona Berbahaya section
  const oldZonaBerbahaya = `          {/* Zona Berbahaya: Reset Data All */}
          <div className="pt-2 border-t border-white/10">
            <div className="p-3.5 rounded-lg border border-[#FF0055]/30 bg-[#FF0055]/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#FF0055] font-bold text-xs uppercase tracking-wider">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Zona Berbahaya: Reset Data All</span>
                </div>
                <span className="text-[10px] text-[#FF0055]/70 font-mono">
                  Permanent Delete
                </span>
              </div>
              <p className="text-[11px] text-[#b9cacb] leading-relaxed">
                Menghapus seluruh riwayat entri lembur, data absensi kehadiran harian, serta mengembalikan seluruh profil dan preferensi ke setelan awal pabrik.
              </p>

              {!showConfirmReset ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full py-2.5 px-3 rounded bg-[#FF0055]/15 border border-[#FF0055]/40 hover:bg-[#FF0055]/25 text-[#FF0055] hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(255,0,85,0.15)]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset Seluruh Data Aplikasi (Reset All)</span>
                </button>
              ) : (
                <div className="p-3 rounded bg-[#161626] border border-[#FF0055] space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2 text-xs text-[#FFE600]">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Konfirmasi:</strong> Anda yakin ingin menghapus <strong>SEMUA</strong> riwayat lembur, log absensi, dan pengaturan? Tindakan ini <strong>tidak dapat dibatalkan</strong>!
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-[#b9cacb] text-xs font-mono transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResetAll}
                      className="px-4 py-1.5 rounded bg-[#FF0055] hover:bg-[#ff3377] text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,0,85,0.4)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Semua Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>`;

  const newZonaBerbahaya = `          {/* Zona Berbahaya: 3 Pilihan Hapus */}
          <div className="pt-2 border-t border-white/10">
            <div className="p-3.5 rounded-lg border border-[#FF0055]/30 bg-[#FF0055]/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#FF0055] font-bold text-xs uppercase tracking-wider">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Zona Berbahaya</span>
                </div>
                <span className="text-[10px] text-[#FF0055]/70 font-mono">Permanent Delete</span>
              </div>
              <p className="text-[11px] text-[#b9cacb] leading-relaxed">
                Pilih data yang ingin dihapus permanen. Semua tindakan <strong className="text-[#FFE600]">tidak dapat dibatalkan</strong>.
              </p>

              {/* Tombol 1: Hapus Catatan Kehadiran */}
              <div className="space-y-1.5">
                {!showConfirmClearAttendance ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmClearAttendance(true)}
                    className="w-full py-2 px-3 rounded bg-[#FF8C00]/10 border border-[#FF8C00]/40 hover:bg-[#FF8C00]/20 text-[#FF8C00] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Catatan Kehadiran Saja</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded bg-[#161626] border border-[#FF8C00] space-y-2 animate-in fade-in duration-200">
                    <div className="text-xs text-[#FFE600] flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Hapus <strong>semua catatan kehadiran</strong> (absen, sakit, cuti)? Data lembur tetap aman.</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowConfirmClearAttendance(false)} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-[#b9cacb] text-xs font-mono transition-colors">Batal</button>
                      <button type="button" onClick={() => { if (onClearAttendance) onClearAttendance(); setShowConfirmClearAttendance(false); }} className="px-3 py-1 rounded bg-[#FF8C00] hover:bg-[#FFA040] text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5">
                        <Trash2 className="w-3 h-3" />Ya, Hapus Kehadiran
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol 2: Hapus Riwayat Lembur */}
              <div className="space-y-1.5">
                {!showConfirmClearEntries ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmClearEntries(true)}
                    className="w-full py-2 px-3 rounded bg-[#FF2BD6]/10 border border-[#FF2BD6]/40 hover:bg-[#FF2BD6]/20 text-[#FF2BD6] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Riwayat Lembur Saja</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded bg-[#161626] border border-[#FF2BD6] space-y-2 animate-in fade-in duration-200">
                    <div className="text-xs text-[#FFE600] flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Hapus <strong>semua riwayat lembur</strong>? Catatan kehadiran tetap aman.</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowConfirmClearEntries(false)} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-[#b9cacb] text-xs font-mono transition-colors">Batal</button>
                      <button type="button" onClick={() => { if (onClearEntries) onClearEntries(); setShowConfirmClearEntries(false); onClose(); }} className="px-3 py-1 rounded bg-[#FF2BD6] hover:bg-[#ff55e0] text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5">
                        <Trash2 className="w-3 h-3" />Ya, Hapus Lembur
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol 3: Reset Semua */}
              <div className="space-y-1.5 pt-1 border-t border-[#FF0055]/20">
                {!showConfirmReset ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    className="w-full py-2.5 px-3 rounded bg-[#FF0055]/15 border border-[#FF0055]/40 hover:bg-[#FF0055]/25 text-[#FF0055] hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(255,0,85,0.15)]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset Semua Data + Pengaturan (Factory Reset)</span>
                  </button>
                ) : (
                  <div className="p-3 rounded bg-[#161626] border border-[#FF0055] space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2 text-xs text-[#FFE600]">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Konfirmasi:</strong> Anda yakin ingin menghapus <strong>SEMUA</strong> riwayat lembur, log absensi, dan pengaturan? Tindakan ini <strong>tidak dapat dibatalkan</strong>!
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button type="button" onClick={() => setShowConfirmReset(false)} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-[#b9cacb] text-xs font-mono transition-colors">Batal</button>
                      <button type="button" onClick={handleConfirmResetAll} className="px-4 py-1.5 rounded bg-[#FF0055] hover:bg-[#ff3377] text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,0,85,0.4)]">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Ya, Hapus Semua Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>`;

  content = content.replace(oldZonaBerbahaya, newZonaBerbahaya);
  writeFile('components/modals/SettingsModal.tsx', content);
}

// ============================================================
// 5. DashboardScreen.tsx - clamp custom period max 40 days
// ============================================================
{
  let content = readFile('components/screens/DashboardScreen.tsx');

  // Add clampCustomRange to calculations import
  if (!content.includes('clampCustomRange')) {
    content = content.replace(
      /import \{([^}]+)\} from '\.\.\/\.\.\/utils\/calculations';/,
      (match, imports) => {
        return `import {${imports}, clampCustomRange} from '../../utils/calculations';`;
      }
    );
  }

  // Find and patch the customEnd date input's onChange
  // Look for onChange that sets endDate in custom date range context
  content = content.replace(
    /onChange=\{\(e\) => setCustomEnd\(e\.target\.value\)\}/g,
    `onChange={(e) => {\n                const { end } = clampCustomRange(customStart, e.target.value, 40);\n                setCustomEnd(end);\n              }}`
  );

  writeFile('components/screens/DashboardScreen.tsx', content);
}

console.log('\n🎉 All done! Run npm run lint to verify.');
