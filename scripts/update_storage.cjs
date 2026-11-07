const fs = require('fs');
const path = require('path');

const storagePath = path.resolve('D:\\Kahfi\\1. code\\kalkulator-penghitung-lembur\\src\\utils\\storage.ts');
let storageContent = fs.readFileSync(storagePath, 'utf8');

if (!storageContent.includes('deleteAttendanceRecord')) {
  storageContent = storageContent.replace(
    `export function setAttendanceRecord(record: AttendanceRecord): void {
  const current = getStoredAttendance();
  current[record.tanggal] = record;
  saveStoredAttendance(current);
}`,
    `export function setAttendanceRecord(record: AttendanceRecord): void {
  const current = getStoredAttendance();
  current[record.tanggal] = record;
  saveStoredAttendance(current);
}

export function deleteAttendanceRecord(tanggal: string): boolean {
  try {
    const current = getStoredAttendance();
    if (current[tanggal]) {
      delete current[tanggal];
      saveStoredAttendance(current);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Gagal menghapus absensi:', err);
    return false;
  }
}`
  );
  fs.writeFileSync(storagePath, storageContent, 'utf8');
  console.log('✅ Updated storage.ts with deleteAttendanceRecord');
} else {
  console.log('ℹ️ deleteAttendanceRecord already in storage.ts');
}
