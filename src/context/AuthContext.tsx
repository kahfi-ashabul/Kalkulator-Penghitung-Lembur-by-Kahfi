import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, signInWithGoogle, signOutUser, fetchUserProfile } from '../lib/supabase';
import { UserProfile, SubscriptionCountdown, calculateRemainingSubscription } from '../types/auth';
import { syncLocalToCloud, syncCloudToLocal, clearCloudData, SyncStatus } from '../services/cloudSync';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isPro: boolean;
  countdown: SubscriptionCountdown;
  syncStatus: SyncStatus;
  isLoading: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  triggerCloudSync: () => Promise<boolean>;
  clearCloudData: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSynced: localStorage.getItem('lembur_last_cloud_sync'),
    inProgress: false,
    error: null,
    count: 0,
  });

  // Deteksi akun Founder / Owner aplikasi untuk akses PRO permanen
  const isFounder = user?.email?.toLowerCase() === '373keiii@gmail.com';

  // Hitung sisa masa aktif langganan Pro secara reaktif
  const countdown: SubscriptionCountdown = isFounder
    ? {
        isExpired: false,
        isLifetime: true,
        days: 99999,
        hours: 23,
        minutes: 59,
        formatted: 'Aktif Selamanya (Founder)',
      }
    : calculateRemainingSubscription(profile?.expires_at);

  const isPro: boolean = isFounder || Boolean(profile?.is_pro && !countdown.isExpired);

  const loadProfile = useCallback(async (userId: string) => {
    const prof = await fetchUserProfile(userId);
    setProfile(prof);
    return prof;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  // Fungsi trigger sync otomatis jika user adalah PRO
  const triggerCloudSync = useCallback(async (): Promise<boolean> => {
    if (!user || !isPro) return false;

    setSyncStatus((prev) => ({ ...prev, inProgress: true, error: null }));
    const res = await syncLocalToCloud(user.id);

    if (res.success) {
      setSyncStatus({
        lastSynced: new Date().toISOString(),
        inProgress: false,
        error: null,
        count: res.count,
      });
      return true;
    } else {
      setSyncStatus((prev) => ({
        ...prev,
        inProgress: false,
        error: res.error || 'Gagal sinkronisasi',
      }));
      return false;
    }
  }, [user, isPro]);

  // Fungsi untuk menghapus seluruh data cloud jika pengguna mereset aplikasi
  const handleClearCloudData = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    setSyncStatus((prev) => ({ ...prev, inProgress: true, error: null }));
    const res = await clearCloudData(user.id);
    if (res.success) {
      setSyncStatus({
        lastSynced: null,
        inProgress: false,
        error: null,
        count: 0,
      });
      return true;
    } else {
      setSyncStatus((prev) => ({
        ...prev,
        inProgress: false,
        error: res.error || 'Gagal menghapus data cloud',
      }));
      return false;
    }
  }, [user]);

  // Inisialisasi Auth Listener dari Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Periksa sesi yang sedang aktif
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        loadProfile(currentSession.user.id).then((prof) => {
          // Jika akun Pro, tarik data terbaru dari cloud ke local
          if (prof?.is_pro) {
            syncCloudToLocal(currentSession.user.id);
          }
        });
      }
      setIsLoading(false);
    });

    // Dengarkan perubahan state autentikasi (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession?.user) {
        const prof = await loadProfile(newSession.user.id);
        if (prof?.is_pro) {
          await syncCloudToLocal(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const handleLoginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isPro,
        countdown,
        syncStatus,
        isLoading,
        isConfigured: isSupabaseConfigured,
        loginWithGoogle: handleLoginWithGoogle,
        logout: handleLogout,
        refreshProfile,
        triggerCloudSync,
        clearCloudData: handleClearCloudData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
