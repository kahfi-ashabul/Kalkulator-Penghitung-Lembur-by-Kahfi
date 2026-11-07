const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src');

// 1. Update overtime.ts to include modeAbsensi
{
  const typesPath = path.join(srcDir, 'types', 'overtime.ts');
  let content = fs.readFileSync(typesPath, 'utf8');

  if (!content.includes('modeAbsensi?:')) {
    content = content.replace(
      `  defaultCutoffDay?: number;\n}`,
      `  defaultCutoffDay?: number;\n  modeAbsensi?: 'otomatis' | 'manual';\n}`
    );
    fs.writeFileSync(typesPath, content, 'utf8');
    console.log('✅ Updated overtime.ts with modeAbsensi');
  }
}

// 2. Update storage.ts defaultSettings
{
  const storagePath = path.join(srcDir, 'utils', 'storage.ts');
  let content = fs.readFileSync(storagePath, 'utf8');

  if (!content.includes('modeAbsensi:')) {
    content = content.replace(
      `  defaultCutoffDay: 1, // 1 = kalender, 21 = cut-off 21-20, 26 = cut-off 26-25\n};`,
      `  defaultCutoffDay: 1, // 1 = kalender, 21 = cut-off 21-20, 26 = cut-off 26-25\n  modeAbsensi: 'manual', // 'manual' = hanya tampilkan hari yang dicatat, 'otomatis' = hari kerja otomatis masuk 8j\n};`
    );
    fs.writeFileSync(storagePath, content, 'utf8');
    console.log('✅ Updated storage.ts defaultSettings with modeAbsensi');
  }
}
