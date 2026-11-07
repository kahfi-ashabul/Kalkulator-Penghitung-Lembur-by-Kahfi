const fs = require('fs');
const path = require('path');

const histPath = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src\\components\\screens\\HistoryScreen.tsx');
let content = fs.readFileSync(histPath, 'utf8');

// 1. Add Briefcase to imports from lucide-react if not present
if (!content.includes('Briefcase,')) {
  content = content.replace(
    `import { \n  History,`,
    `import { \n  History,\n  Briefcase,`
  );
}

// 2. Add props to HistoryScreenProps
if (!content.includes('onOpenAttendanceModal?:')) {
  content = content.replace(
    `  onOpenReceipt: (entry: OvertimeEntry) => void;\n}`,
    `  onOpenReceipt: (entry: OvertimeEntry) => void;\n  onOpenAttendanceModal?: (date?: string) => void;\n  onDeleteAttendance?: (tanggal: string) => void;\n}`
  );
}

// 3. Add to destructuring
if (!content.includes('onOpenAttendanceModal,')) {
  content = content.replace(
    `  onOpenImportModal,\n  onOpenReceipt,\n}) => {`,
    `  onOpenImportModal,\n  onOpenReceipt,\n  onOpenAttendanceModal,\n  onDeleteAttendance,\n}) => {`
  );
}

// 4. Add activeHistoryTab state
if (!content.includes('activeHistoryTab')) {
  content = content.replace(
    `  const [copiedId, setCopiedId] = useState<string | null>(null);`,
    `  const [copiedId, setCopiedId] = useState<string | null>(null);\n  const [activeHistoryTab, setActiveHistoryTab] = useState<'lembur' | 'kehadiran'>('lembur');`
  );
}

// 5. Add attendance list memo
if (!content.includes('filteredAttendanceList')) {
  const insertBefore = `  // Aggregates of filtered entries`;
  const attendanceLogic = `  // Filtered attendance list
  const filteredAttendanceList = useMemo(() => {
    const list = Object.values(attendanceMap || {});
    return list.filter((att) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = (att.catatan || '').toLowerCase().includes(q);
        const matchDate = att.tanggal.includes(q);
        const matchStatus = att.status.toLowerCase().includes(q);
        if (!matchNote && !matchDate && !matchStatus) return false;
      }
      if (activeDateRange) {
        if (att.tanggal < activeDateRange.startDate || att.tanggal > activeDateRange.endDate) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [attendanceMap, searchQuery, activeDateRange]);

  `;
  content = content.replace(insertBefore, attendanceLogic + insertBefore);
}

// 6. Add "+ Catat Kehadiran" button to Action Buttons in toolbar
const oldActionButtons = `<div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNavigateToCalculator}`;

const newActionButtons = `<div className="flex flex-wrap items-center gap-2">
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
            onClick={onNavigateToCalculator}`;

content = content.replace(oldActionButtons, newActionButtons);

// 7. Add Tab Switcher above Filter & Metric Strip
const targetAboveFilter = `{/* Filter & Metric Strip */}`;
const tabSwitcher = `{/* Tab Switcher: Riwayat Lembur vs Log Catatan Kehadiran */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveHistoryTab('lembur')}
          className={\`px-4 py-2 rounded-t-lg font-mono text-xs font-bold flex items-center gap-2 transition-all \${
            activeHistoryTab === 'lembur'
              ? 'bg-[#12121F] text-[#00F0FF] border-t-2 border-t-[#00F0FF] border-x border-white/10 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-[#7A7A99] hover:text-white hover:bg-white/5'
          }\`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Lembur</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#00F0FF]/20 text-[#00F0FF]">
            {filteredEntries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHistoryTab('kehadiran')}
          className={\`px-4 py-2 rounded-t-lg font-mono text-xs font-bold flex items-center gap-2 transition-all \${
            activeHistoryTab === 'kehadiran'
              ? 'bg-[#12121F] text-[#39FF14] border-t-2 border-t-[#39FF14] border-x border-white/10 shadow-[0_0_12px_rgba(57,255,20,0.2)]'
              : 'text-[#7A7A99] hover:text-white hover:bg-white/5'
          }\`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Log Catatan Kehadiran</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#39FF14]/20 text-[#39FF14]">
            {filteredAttendanceList.length}
          </span>
        </button>
      </div>

      `;

if (!content.includes('setActiveHistoryTab(')) {
  content = content.replace(targetAboveFilter, tabSwitcher + targetAboveFilter);
}

// 8. In Entries Table area, render either Overtime Table or Attendance Table based on activeHistoryTab
const oldTableArea = `{/* Entries Table */}
      <div className="rounded-lg bg-[#12121F] border border-white/10 shadow-lg overflow-hidden">
        {filteredEntries.length === 0 ? (`;

const newTableArea = `{/* Entries Table & Attendance Table */}
      {activeHistoryTab === 'kehadiran' ? (
        <div className="rounded-lg bg-[#12121F] border border-white/10 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A12]">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#39FF14]" />
              <h3 className="font-bold text-white text-xs font-mono">Daftar Catatan Absensi & Kehadiran</h3>
              <span className="text-[10px] text-[#7A7A99]">({filteredAttendanceList.length} hari tercatat)</span>
            </div>
            <button
              onClick={() => onOpenAttendanceModal?.()}
              className="px-3 py-1 rounded bg-[#39FF14]/15 border border-[#39FF14]/40 hover:bg-[#39FF14]/25 text-[#39FF14] font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Kehadiran Baru</span>
            </button>
          </div>

          {filteredAttendanceList.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-[#7A7A99] space-y-3">
              <Briefcase className="w-8 h-8 text-[#39FF14] mx-auto opacity-50" />
              <div>Belum ada catatan kehadiran yang tersimpan untuk filter tanggal ini.</div>
              <button
                onClick={() => onOpenAttendanceModal?.()}
                className="px-4 py-2 rounded bg-[#39FF14] text-[#0A0A12] font-bold text-xs font-mono hover:bg-[#5aff3c] transition-all"
              >
                + Catat Kehadiran Hari Ini
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-[#39FF14]/20 bg-[#0A0A12] text-[#7A7A99] uppercase text-[10px]">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-3">Status Kehadiran</th>
                    <th className="py-3 px-3 text-center">Jam Kerja Reguler</th>
                    <th className="py-3 px-4">Catatan / Keterangan</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAttendanceList.map((att) => {
                    const badgeStyles: Record<string, string> = {
                      masuk: 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/40',
                      sakit: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40',
                      izin: 'bg-[#EC4899]/15 text-[#EC4899] border-[#EC4899]/40',
                      cuti: 'bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/40',
                      libur_off: 'bg-white/5 text-[#b9cacb] border-white/10',
                    };
                    const labels: Record<string, string> = {
                      masuk: 'Masuk Kerja',
                      sakit: 'Sakit',
                      izin: 'Izin',
                      cuti: 'Cuti Resmi',
                      libur_off: 'Libur / Off',
                    };

                    return (
                      <tr key={att.tanggal} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          {formatTanggal(att.tanggal)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={\`text-[10px] px-2 py-0.5 rounded border uppercase font-bold \${badgeStyles[att.status] || ''}\`}>
                            {labels[att.status] || att.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-white">
                          {att.status === 'masuk' ? \`\${att.jamKerjaReguler} jam\` : '-'}
                        </td>
                        <td className="py-3 px-4 text-[#b9cacb] font-sans">
                          {att.catatan || <span className="text-[#7A7A99] italic">-</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenAttendanceModal?.(att.tanggal)}
                              className="px-2.5 py-1 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#00F0FF] text-[#00F0FF] text-xs transition-all flex items-center gap-1"
                              title="Edit Data Kehadiran"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            {onDeleteAttendance && (
                              <button
                                onClick={() => onDeleteAttendance(att.tanggal)}
                                className="p-1 rounded bg-[#1A1A2E] border border-white/15 hover:border-[#ffb4ab] text-[#ffb4ab] transition-all"
                                title="Hapus Data Kehadiran Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
      <div className="rounded-lg bg-[#12121F] border border-white/10 shadow-lg overflow-hidden">
        {filteredEntries.length === 0 ? (`;

content = content.replace(oldTableArea, newTableArea);

// Add closing parenthesis to the conditional render at the end of the table
const oldTableEnd = `                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>`;

const newTableEnd = `                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}`;

content = content.replace(oldTableEnd, newTableEnd);

fs.writeFileSync(histPath, content, 'utf8');
console.log('✅ Updated HistoryScreen.tsx with attendance management tab and quick buttons');
