export type SistemKerja = '5_hari' | '6_hari';
export type JenisHari = 'biasa' | 'sabtu' | 'minggu' | 'libur';
export type AttendanceStatus = 'masuk' | 'sakit' | 'izin' | 'cuti' | 'libur_off';
export type OvertimeCalculationMode = 'pp35' | 'manual_flat' | 'manual_nominal' | 'manual_incentive';

export interface HourlyMultiplier {
  hourIndex: number; // 1, 2, 3...
  multiplier: number; // 1.5, 2.0, 3.0, 4.0, or custom
  hoursCount: number; // typically 1, or fractional e.g. 0.5
  hourlyRate: number; // 1/173 x gaji or custom
  subtotal: number;
  description: string;
}

export interface OvertimeCalculationResult {
  upahSebulan: number;
  upahSejam: number;
  jamLembur: number;
  totalUpahLembur: number;
  breakdown: HourlyMultiplier[];
  formula: string;
  warning?: string;
  isExcessOvertime?: boolean;
  modeHitung?: OvertimeCalculationMode;
  upahHarianPokok?: number;
}

export interface OvertimeEntry {
  id: string;
  tanggal: string; // YYYY-MM-DD
  sistem: SistemKerja;
  jenisHari: JenisHari;
  libur: boolean;
  isHariTerpendek?: boolean;
  totalJamKerja?: number;
  jamKerjaReguler?: number; // e.g. 8 jam or 7 jam when masuk
  statusKehadiran?: AttendanceStatus;
  jamLembur: number;
  upahSebulan: number;
  upahSejam: number;
  totalLembur: number;
  catatan?: string;
  dibuat: string; // ISO timestamp
  breakdown?: HourlyMultiplier[];
  modeHitung?: OvertimeCalculationMode;
  manualRatePerJam?: number;
  upahHarianPokok?: number;
}

export interface AttendanceRecord {
  tanggal: string; // YYYY-MM-DD
  status: AttendanceStatus;
  jamKerjaReguler: number;
  catatan?: string;
}

export interface Deductions {
  bpjsKetenagakerjaan: number;
  bpjsKesehatan: number;
  pph21: number;
  kasbon: number;
  lainnya: number;
}

export interface UserSettings {
  namaKaryawan: string;
  namaPerusahaan: string;
  defaultSistem: SistemKerja;
  modeGaji?: 'bulanan' | 'harian';
  defaultGajiPokok: number;
  defaultTunjangan: number;
  defaultUpahHarian?: number;
  audioFeedback: boolean;
  theme?: 'dark' | 'light';
  showOnboardingGuide?: boolean;
  enableMaxOvertimeAlert?: boolean;
  defaultCutoffDay?: number; // e.g. 21, 26, 1
  modeAbsensi?: 'otomatis' | 'manual';
  profileCompleted?: boolean;
}

export interface DateRangeFilter {
  mode: 'kalender' | 'cut_off_20' | 'cut_off_25' | 'custom' | 'semua';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
