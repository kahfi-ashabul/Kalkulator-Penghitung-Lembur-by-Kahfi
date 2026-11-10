import { OvertimeEntry, UserSettings, AttendanceRecord, AttendanceStatus } from '../types/overtime';
import { calculateOvertime } from './calculations';

const ENTRIES_KEY = 'lembur_entries_v1.1';
const SETTINGS_KEY = 'lembur_settings_v1.1';
const ATTENDANCE_KEY = 'kehadiran_records_v1.1';

export const defaultSettings: UserSettings = {
  namaKaryawan: '',
  namaPerusahaan: '',
  defaultSistem: '5_hari',
  modeGaji: 'bulanan',
  defaultGajiPokok: 6000000,
  defaultTunjangan: 0,
  defaultUpahHarian: 250000,
  audioFeedback: true,
  theme: 'dark',
  showOnboardingGuide: true,
  enableMaxOvertimeAlert: true,
  defaultCutoffDay: 1, // 1 = kalender, 21 = cut-off 21-20, 26 = cut-off 26-25
  modeAbsensi: 'manual', // 'manual' = hanya tampilkan hari yang dicatat, 'otomatis' = hari kerja otomatis masuk 8j
  profileCompleted: false,
};

// Pure blank initial entries (0 data bawaan - pengguna mengisi dari awal)
function generateSeedEntries(): OvertimeEntry[] {
  return [];
}

function generateSeedAttendance(): Record<string, AttendanceRecord> {
  return {};
}

export function getStoredEntries(): OvertimeEntry[] {
  try {
    const data = localStorage.getItem(ENTRIES_KEY);
    if (!data) {
      const seeds = generateSeedEntries();
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(seeds));
      return seeds;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('LocalStorage tidak dapat diakses, memakai memori sementara:', err);
    return generateSeedEntries();
  }
}

export function saveStoredEntries(entries: OvertimeEntry[]): boolean {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    return true;
  } catch (err) {
    console.error('Gagal menyimpan entri ke localStorage:', err);
    return false;
  }
}

export function addStoredEntry(entry: OvertimeEntry): boolean {
  const current = getStoredEntries();
  const updated = [entry, ...current.filter((e) => e.id !== entry.id)];
  return saveStoredEntries(updated);
}

export function updateStoredEntry(entry: OvertimeEntry): boolean {
  const current = getStoredEntries();
  const index = current.findIndex((e) => e.id === entry.id);
  if (index === -1) return false;
  current[index] = entry;
  return saveStoredEntries([...current]);
}

export function deleteStoredEntry(id: string): boolean {
  const current = getStoredEntries();
  const filtered = current.filter((e) => e.id !== id);
  return saveStoredEntries(filtered);
}

export function clearAllStoredEntries(): boolean {
  try {
    localStorage.removeItem(ENTRIES_KEY);
    return true;
  } catch (err) {
    console.error('Gagal membersihkan entri:', err);
    return false;
  }
}

export function clearAllAttendance(): boolean {
  try {
    localStorage.removeItem(ATTENDANCE_KEY);
    return true;
  } catch (err) {
    console.error('Gagal membersihkan absensi:', err);
    return false;
  }
}

export function resetAllAppData(): boolean {
  try {
    localStorage.removeItem(ENTRIES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(ATTENDANCE_KEY);
    return true;
  } catch (err) {
    console.error('Gagal reset all data:', err);
    return false;
  }
}

export function getStoredSettings(): UserSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: UserSettings): boolean {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Gagal menyimpan pengaturan:', err);
    return false;
  }
}

export function getStoredAttendance(): Record<string, AttendanceRecord> {
  try {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    if (!data) {
      const seed = generateSeedAttendance();
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(data);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return generateSeedAttendance();
  }
}

export function saveStoredAttendance(map: Record<string, AttendanceRecord>): boolean {
  try {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(map));
    return true;
  } catch (err) {
    console.error('Gagal menyimpan absensi:', err);
    return false;
  }
}

export function setAttendanceRecord(record: AttendanceRecord): void {
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
}
