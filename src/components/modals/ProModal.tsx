import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Cloud,
  ShieldCheck,
  Smartphone,
  EyeOff,
  Clock,
  Sparkles,
  ExternalLink,
  CreditCard,
  QrCode,
  LogOut,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '../../types/auth';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    profile,
    isPro,
    countdown,
    syncStatus,
    isConfigured,
    loginWithGoogle,
    logout,
    triggerCloudSync,
  } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handler Pembayaran DOKU (Simulasi & Integrasi Checkout)
  const handlePayWithDoku = async () => {
    if (!user) {
      await loginWithGoogle();
      return;
    }

    setIsProcessingPayment(true);
    setPaymentMessage(null);

    try {
      const plan = SUBSCRIPTION_PLANS[selectedPlan];
      
      // Simulasi panggilan endpoint DOKU Payment Gateway
      // Pada lingkungan produksi, lakukan POST request ke backend / Supabase Edge Function Anda
      // yang memanggil API https://api.doku.com/checkout/v1/payment
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPaymentMessage(
        `Memproses pembayaran ${plan.name} (${plan.priceFormatted}) via DOKU Gateway... Siapkan QRIS atau nomor Virtual Account.`
      );

      // Contoh redirect ke Invoice URL DOKU (atau pemicu Doku Checkout Pop-up JS)
      // window.location.href = `https://checkout.doku.com/payment/...`;
    } catch (err: any) {
      setPaymentMessage('Gagal menghubungi gateway DOKU: ' + (err?.message || 'Koneksi error'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121F] border border-[#00F0FF]/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] text-[#E4E1ED] overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0A0A12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE600]/20 to-[#FF2BD6]/20 border border-[#FFE600]/40 flex items-center justify-center text-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.3)]">
              <Crown className="w-5 h-5 fill-[#FFE600]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg font-heading flex items-center gap-2">
                {isPro ? 'Keanggotaan Pro Aktif' : 'Upgrade ke Akun Pro'}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFE600] to-[#FF2BD6] text-[#0A0A12]">
                  PRO TIER
                </span>
              </h3>
              <p className="text-xs text-[#b9cacb] font-mono">
                {isPro ? 'Akses penuh cloud & fitur premium' : 'Buka sinkronisasi cloud, bebas iklan, & multi-perangkat'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {/* User Status Card */}
          <div className="p-3.5 rounded-xl bg-[#0A0A12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7A7A99]">Status Akun:</span>
              {user ? (
                <span className="text-white font-bold truncate max-w-[200px]">{user.email}</span>
              ) : (
                <span className="text-[#FFE600] font-bold">Tamu (Data di Browser Saja)</span>
              )}
            </div>

            {user && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <span className="text-[#7A7A99]">Masa Aktif Pro:</span>
                {isPro ? (
                  <span className="text-[#39FF14] font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {countdown.formatted} tersisa
                  </span>
                ) : (
                  <span className="text-[#7A7A99]">Akun Standar Gratis</span>
                )}
              </div>
            )}

            {user && isPro && (
              <div className="flex items-center justify-between text-[11px] pt-1 text-[#00F0FF]">
                <span>Cloud Sync Terakhir:</span>
                <span className="font-mono">
                  {syncStatus.lastSynced ? new Date(syncStatus.lastSynced).toLocaleTimeString('id-ID') : 'Belum sync'}
                </span>
              </div>
            )}
          </div>

          {/* Prompt Login jika Belum Masuk */}
          {!user && (
            <div className="p-4 rounded-xl bg-[#1A1A2E] border border-[#00F0FF]/30 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center mx-auto">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Masuk dengan Akun Google</h4>
                <p className="text-[11px] text-[#b9cacb] mt-0.5 font-sans">
                  Hubungkan akun untuk mengaktifkan sinkronisasi otomatis dan aktivasi paket Pro.
                </p>
              </div>
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk Sekarang dengan Google</span>
              </button>
            </div>
          )}

          {/* Keuntungan Fitur PRO */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b9cacb] block">
              Fitur Eksklusif Member PRO:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
              <div className="p-2.5 rounded-lg bg-[#161626] border border-white/5 flex items-start gap-2">
                <Cloud className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">Sinkronisasi Cloud</strong>
                  <span className="text-[#b9cacb]">Data tersimpan otomatis di database Supabase PostgreSQL aman.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#161626] border border-white/5 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">Akses Multi-Device</strong>
                  <span className="text-[#b9cacb]">Akses riwayat lembur dari HP, tablet, maupun laptop kantor.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#161626] border border-white/5 flex items-start gap-2">
                <EyeOff className="w-4 h-4 text-[#FF2BD6] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">Bebas Iklan 100%</strong>
                  <span className="text-[#b9cacb]">Tanpa popunder, banner, atau iklan social bar apapun.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#161626] border border-white/5 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFE600] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">Anti Kehilangan Data</strong>
                  <span className="text-[#b9cacb]">Cache browser terhapus? Data tetap aman tersinkron di akun Anda.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pilihan Paket Langganan */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b9cacb] block">
              Pilih Paket Langganan:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Paket Bulanan */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                  selectedPlan === 'monthly'
                    ? 'bg-[#1A1A2E] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#0A0A12] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Paket Bulanan</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'monthly'
                        ? 'border-[#00F0FF] bg-[#00F0FF] text-[#0A0A12]'
                        : 'border-white/20'
                    }`}
                  >
                    {selectedPlan === 'monthly' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <div className="mt-2 text-xl font-extrabold text-[#00F0FF] font-mono">
                  Rp 10.000 <span className="text-xs text-[#b9cacb] font-normal">/ 30 hari</span>
                </div>
                <p className="mt-1 text-[11px] text-[#7A7A99] font-sans">
                  Sangat terjangkau untuk kebutuhan bulanan karyawan.
                </p>
              </div>

              {/* Paket Tahunan */}
              <div
                onClick={() => setSelectedPlan('yearly')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                  selectedPlan === 'yearly'
                    ? 'bg-[#1A1A2E] border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.25)]'
                    : 'bg-[#0A0A12] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FFE600] to-[#FF2BD6] text-[#0A0A12] text-[9px] font-bold px-2 py-0.5 rounded-bl">
                  HEMAT 2 BULAN
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Paket Tahunan</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'yearly'
                        ? 'border-[#FFE600] bg-[#FFE600] text-[#0A0A12]'
                        : 'border-white/20'
                    }`}
                  >
                    {selectedPlan === 'yearly' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <div className="mt-2 text-xl font-extrabold text-[#FFE600] font-mono">
                  Rp 100.000 <span className="text-xs text-[#b9cacb] font-normal">/ 365 hari</span>
                </div>
                <p className="mt-1 text-[11px] text-[#7A7A99] font-sans">
                  Hanya Rp 8.300/bln, aktif 1 tahun penuh tanpa repot.
                </p>
              </div>
            </div>
          </div>

          {/* Notifikasi feedback pembayaran */}
          {paymentMessage && (
            <div className="p-3 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-mono animate-in fade-in">
              {paymentMessage}
            </div>
          )}

          {/* Tombol Aksi Pembayaran DOKU */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handlePayWithDoku}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF] via-[#0082FB] to-[#FF2BD6] text-[#0A0A12] font-black text-sm font-mono hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <QrCode className="w-4 h-4 text-[#0A0A12]" />
              <span>
                {isProcessingPayment
                  ? 'Menghubungkan ke DOKU...'
                  : user
                  ? `Bayar via DOKU (QRIS / VA) • ${SUBSCRIPTION_PLANS[selectedPlan].priceFormatted}`
                  : 'Masuk dengan Google Dahulu'}
              </span>
            </button>

            <div className="flex items-center justify-between text-[10px] text-[#7A7A99]">
              <span>Mendukung: QRIS (BCA, Gopay, OVO, Dana) & Virtual Account Bank</span>
              <span className="flex items-center gap-1 text-[#39FF14]">
                <ShieldCheck className="w-3 h-3" /> Transaksi Terenkripsi
              </span>
            </div>
          </div>

          {/* Tombol Sync & Logout Jika User Login */}
          {user && (
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              {isPro && (
                <button
                  type="button"
                  onClick={() => triggerCloudSync()}
                  disabled={syncStatus.inProgress}
                  className="text-[#00F0FF] hover:underline flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.inProgress ? 'animate-spin' : ''}`} />
                  <span>Sinkronkan Sekarang</span>
                </button>
              )}

              <button
                type="button"
                onClick={logout}
                className="text-[#ffb4ab] hover:underline flex items-center gap-1 ml-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
