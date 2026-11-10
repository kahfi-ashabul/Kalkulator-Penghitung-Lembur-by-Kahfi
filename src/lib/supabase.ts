import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { UserProfile } from '../types/auth';

// Kunci publik Supabase untuk otentikasi Google OAuth & Sinkronisasi Cloud
const defaultSupabaseUrl = 'https://ohljgtdhcexspfzgpict.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obGpndGRoY2V4c3BmemdwaWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNDg2NTQsImV4cCI6MjEwOTcyNDY1NH0.CvHIdWRBA2xOrt-o_xpi4D4C91Qo27NxUxzZZZCI0Xc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
);

// Fallback aman agar aplikasi tidak crash saat VITE_SUPABASE_URL belum diatur
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * 1. Login menggunakan Google OAuth via Supabase Auth
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    alert(
      'Konfigurasi Supabase belum disetel di file .env.\n\n' +
      'Silakan isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada file .env terlebih dahulu.'
    );
    return { data: null, error: new Error('Supabase belum dikonfigurasi') };
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}

/**
 * Logout dari sesi Supabase
 */
export async function signOutUser() {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.auth.signOut();
}

/**
 * Mengambil profil langganan pengguna dari tabel `profiles`
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Gagal membaca profil dari Supabase:', error.message);
      return null;
    }

    if (!data) {
      // Jika baris profil belum ada (misal trigger belum dibuat), inisialisasi baris profil gratis bawaan
      const { data: userSession } = await supabase.auth.getUser();
      const newProfile: UserProfile = {
        id: userId,
        email: userSession.user?.email || '',
        is_pro: false,
        expires_at: null,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (insertErr) {
        console.warn('Gagal membuat profil bawaan:', insertErr.message);
        return newProfile;
      }
      return inserted as UserProfile;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('Error saat fetch user profile:', err);
    return null;
  }
}
