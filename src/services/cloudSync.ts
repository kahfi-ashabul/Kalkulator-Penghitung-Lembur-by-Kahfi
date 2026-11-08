import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AttendanceRecord, OvertimeEntry } from '../types/overtime';
import {
  getStoredAttendance,
  saveStoredAttendance,
  getStoredEntries,
  saveStoredEntries,
} from '../utils/storage';

export interface CloudAttendanceRecord {
  id?: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  shift_data: {
    attendance?: AttendanceRecord;
    overtimeEntries?: OvertimeEntry[];
    syncedAt: string;
  };
  updated_at: string;
}

export interface SyncStatus {
  lastSynced: string | null;
  inProgress: boolean;
  error: string | null;
  count: number;
}

/**
 * 3. Sinkronisasi Data dari LocalStorage ke Supabase (Cloud Sync)
 * Hanya aktif jika user terautentikasi dan memiliki status Pro yang masih aktif.
 */
export async function syncLocalToCloud(userId: string): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, count: 0, error: 'Klien Supabase belum siap atau user belum login' };
  }

  try {
    const attendanceMap = getStoredAttendance();
    const overtimeEntries = getStoredEntries();

    // Kumpulkan semua tanggal unik dari catatan absensi dan entri lembur
    const dateSet = new Set<string>();
    Object.keys(attendanceMap).forEach((d) => dateSet.add(d));
    overtimeEntries.forEach((e) => dateSet.add(e.tanggal));

    if (dateSet.size === 0) {
      return { success: true, count: 0 };
    }

    const nowIso = new Date().toISOString();
    const rowsToUpsert: CloudAttendanceRecord[] = Array.from(dateSet).map((date) => {
      const dayAttendance = attendanceMap[date];
      const dayOvertimes = overtimeEntries.filter((e) => e.tanggal === date);

      return {
        user_id: userId,
        date: date,
        shift_data: {
          attendance: dayAttendance,
          overtimeEntries: dayOvertimes,
          syncedAt: nowIso,
        },
        updated_at: nowIso,
      };
    });

    // Lakukan upsert batch ke tabel `attendance_records` (conflict target: user_id, date)
    const { error } = await supabase
      .from('attendance_records')
      .upsert(rowsToUpsert, { onConflict: 'user_id,date' });

    if (error) {
      console.error('Gagal sinkronisasi data ke cloud:', error);
      return { success: false, count: 0, error: error.message };
    }

    localStorage.setItem('lembur_last_cloud_sync', nowIso);
    return { success: true, count: rowsToUpsert.length };
  } catch (err: any) {
    console.error('Error saat proses syncLocalToCloud:', err);
    return { success: false, count: 0, error: err?.message || 'Terjadi kesalahan sinkronisasi' };
  }
}

/**
 * Mengunduh & menggabungkan data dari Supabase Cloud ke LocalStorage browser
 * (Berguna saat user login di HP/Laptop baru)
 */
export async function syncCloudToLocal(userId: string): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, count: 0, error: 'Klien Supabase belum siap' };
  }

  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Gagal mengambil data dari cloud:', error);
      return { success: false, count: 0, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: true, count: 0 };
    }

    const currentAttendance = getStoredAttendance();
    const currentEntries = getStoredEntries();

    const mergedAttendance = { ...currentAttendance };
    const overtimeMap = new Map<string, OvertimeEntry>();
    currentEntries.forEach((e) => overtimeMap.set(e.id, e));

    data.forEach((row: CloudAttendanceRecord) => {
      const shiftData = row.shift_data;
      if (shiftData?.attendance) {
        mergedAttendance[row.date] = shiftData.attendance;
      }
      if (Array.isArray(shiftData?.overtimeEntries)) {
        shiftData.overtimeEntries.forEach((oe) => {
          overtimeMap.set(oe.id, oe);
        });
      }
    });

    saveStoredAttendance(mergedAttendance);
    const sortedEntries = Array.from(overtimeMap.values()).sort(
      (a, b) => b.tanggal.localeCompare(a.tanggal)
    );
    saveStoredEntries(sortedEntries);

    const nowIso = new Date().toISOString();
    localStorage.setItem('lembur_last_cloud_sync', nowIso);

    return { success: true, count: data.length };
  } catch (err: any) {
    console.error('Error saat syncCloudToLocal:', err);
    return { success: false, count: 0, error: err?.message || 'Gagal memuat data cloud' };
  }
}
