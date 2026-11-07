const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src');

// ========================================================
// 1. Fix literal formatTanggal in DashboardScreen.tsx
// ========================================================
{
  const dashPath = path.join(srcDir, 'components', 'screens', 'DashboardScreen.tsx');
  let content = fs.readFileSync(dashPath, 'utf8');

  // Fix literal missing brackets
  content = content.replace(
    `({formatTanggal(activeDateRange.startDate)} s.d. formatTanggal(activeDateRange.endDate))`,
    `({formatTanggal(activeDateRange.startDate)} s.d. {formatTanggal(activeDateRange.endDate)})`
  );

  // Increase note text contrast in DashboardScreen
  content = content.replace(
    `                    {entry.catatan && (
                      <div className="text-[11px] text-[#7A7A99] font-sans mt-0.5 truncate max-w-md">
                        {entry.catatan}
                      </div>
                    )}`,
    `                    {entry.catatan && (
                      <div className="text-xs text-white/90 font-sans font-medium mt-1 truncate max-w-md">
                        Catatan: <span className="text-[#00F0FF]">{entry.catatan}</span>
                      </div>
                    )}`
  );

  fs.writeFileSync(dashPath, content, 'utf8');
  console.log('✅ Updated DashboardScreen.tsx date format and note contrast');
}

// ========================================================
// 2. Update Navigation.tsx header title
// ========================================================
{
  const navPath = path.join(srcDir, 'components', 'Navigation.tsx');
  let content = fs.readFileSync(navPath, 'utf8');

  content = content.replace(
    `                <span className="font-extrabold text-white text-base tracking-tight font-heading">
                  KALKULATOR LEMBUR
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FF2BD6] to-[#7928CA] text-white">
                  by Kahfi
                </span>`,
    `                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight font-heading">
                  Kalkulator Penghitung Lembur
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FF2BD6] to-[#7928CA] text-white shrink-0">
                  by Kahfi
                </span>`
  );

  fs.writeFileSync(navPath, content, 'utf8');
  console.log('✅ Updated Navigation.tsx header title to "Kalkulator Penghitung Lembur by Kahfi"');
}

// ========================================================
// 3. Improve Note/Text Contrast in HistoryScreen.tsx
// ========================================================
{
  const histPath = path.join(srcDir, 'components', 'screens', 'HistoryScreen.tsx');
  let content = fs.readFileSync(histPath, 'utf8');

  // Overtime table notes contrast
  content = content.replace(
    `                      {item.catatan && (
                        <div className="text-[11px] text-[#7A7A99] font-sans mt-1 max-w-xs truncate">
                          {item.catatan}
                        </div>
                      )}`,
    `                      {item.catatan && (
                        <div className="text-xs text-white/90 font-sans font-medium mt-1 max-w-sm">
                          Catatan: <span className="text-[#00F0FF]">{item.catatan}</span>
                        </div>
                      )}`
  );

  // Attendance table notes contrast
  content = content.replace(
    `                        <td className="py-3 px-4 text-[#b9cacb] font-sans">
                          {att.catatan || <span className="text-[#7A7A99] italic">-</span>}
                        </td>`,
    `                        <td className="py-3 px-4 text-white/90 font-sans text-xs font-medium">
                          {att.catatan ? (
                            <span className="text-[#00F0FF] font-semibold">{att.catatan}</span>
                          ) : (
                            <span className="text-[#7A7A99] italic">-</span>
                          )}
                        </td>`
  );

  fs.writeFileSync(histPath, content, 'utf8');
  console.log('✅ Updated HistoryScreen.tsx text contrast');
}
