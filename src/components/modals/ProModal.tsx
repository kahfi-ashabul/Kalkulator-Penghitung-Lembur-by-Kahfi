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
  AlertCircle,
  Heart,
  Coffee,
  Download,
  Send,
  FileSpreadsheet,
  Zap
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
    isPro,
    countdown,
    syncStatus,
    isConfigured,
    loginWithGoogle,
    logout,
    triggerCloudSync,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'pro' | 'support'>('pro');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handler Pembayaran DOKU (Integrasi Otomatis Checkout Gateway)
  const handlePayWithDoku = async () => {
    if (!user) {
      await loginWithGoogle();
      return;
    }

    setIsProcessingPayment(true);
    setPaymentMessage(null);

    try {
      const plan = SUBSCRIPTION_PLANS[selectedPlan];
      
      const res = await fetch('/api/doku-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || 'Gagal menghubungi DOKU');
      }

      setPaymentMessage(`Membuka halaman pembayaran resmi DOKU (${plan.priceFormatted})...`);
      
      // Buka URL Checkout DOKU resmi (Halaman Pembayaran QRIS / VA)
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setPaymentMessage('Pemberitahuan: ' + (err?.message || 'Gagal membuat tagihan DOKU'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadQRIS = () => {
    const link = document.createElement('a');
    link.href = '/qris.jpg';
    link.download = 'qris-support-kei-project.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121F] border border-[#00F0FF]/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] text-[#E4E1ED] overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0A0A12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#39FF14]/20 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Crown className="w-5 h-5 fill-[#39FF14] text-[#39FF14]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg font-heading flex items-center gap-2">
                {isPro ? 'Keanggotaan PRO Aktif' : 'Upgrade ke Akun PRO'}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#39FF14] text-[#0A0A12]">
                  KEI PRO
                </span>
              </h3>
              <p className="text-xs text-[#b9cacb] font-mono">
                {isPro ? 'Akses penuh cloud & fitur premium' : 'Buka sinkronisasi cloud, otomasi absensi, & ekspor Excel'}
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

        {/* Tab Switcher: PRO vs Dukungan Sukarela */}
        <div className="flex border-b border-white/10 bg-[#0D0D18] px-4 pt-2">
          <button
            onClick={() => setActiveTab('pro')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'pro'
                ? 'border-[#00F0FF] text-[#00F0FF] bg-[#161626]'
                : 'border-transparent text-[#7A7A99] hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Fitur PRO (5K)</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'support'
                ? 'border-[#EC4899] text-[#EC4899] bg-[#161626]'
                : 'border-transparent text-[#7A7A99] hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 fill-[#EC4899]" />
            <span>Traktir Kopi / QRIS</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {/* TAB 1: PRO SUBSCRIPTION */}
          {activeTab === 'pro' && (
            <>
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
                        <Clock className="w-3.5 h-3.5" /> {countdown.formatted}
                      </span>
                    ) : (
                      <span className="text-[#EC4899]">Belum Berlangganan (Akun Gratis)</span>
                    )}
                  </div>
                )}

                {/* Cloud Sync Status */}
                {isPro && (
                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#00F0FF]">
                    <span className="flex items-center gap-1">
                      <Cloud className="w-3 h-3" /> Sinkronisasi Cloud:
                    </span>
                    <button
                      onClick={() => triggerCloudSync()}
                      disabled={syncStatus.inProgress}
                      className="hover:underline flex items-center gap-1 text-[#39FF14]"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncStatus.inProgress ? 'animate-spin' : ''}`} />
                      {syncStatus.inProgress ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                    </button>
                  </div>
                )}
              </div>

              {/* Login CTA jika belum login */}
              {!user && (
                <div className="p-3.5 rounded-xl bg-[#161626] border border-[#00F0FF]/30 space-y-2.5">
                  <p className="text-[#b9cacb] leading-relaxed">
                    Masuk dengan akun Google untuk mengikat riwayat lembur ke cloud dan menikmati akses dari HP maupun laptop.
                  </p>
                  <button
                    onClick={loginWithGoogle}
                    className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-100 text-[#0F172A] font-bold flex items-center justify-center gap-2.5 transition-all shadow-md"
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
                    <span>Masuk dengan Google</span>
                  </button>
                </div>
              )}

              {/* Fitur Unggulan Pro */}
              <div className="space-y-2">
                <span className="text-[#7A7A99] font-bold uppercase tracking-wider text-[10px]">
                  Benefit Spesial Member PRO:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#161626] border border-white/5 flex items-start gap-2">
                    <Cloud className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Sinkronisasi Cloud Google</div>
                      <div className="text-[#7A7A99]">Data lembur & gaji aman permanen</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#161626] border border-white/5 flex items-start gap-2">
                    <Smartphone className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Akses Multi-Device</div>
                      <div className="text-[#7A7A99]">Akses tersinkron dari HP & laptop</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#161626] border border-white/5 flex items-start gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#FFE600] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Ekspor Excel & CSV</div>
                      <div className="text-[#7A7A99]">Rekap rapi siap serah ke HRD</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#161626] border border-white/5 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-[#FF2BD6] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Otomasi Absensi Bulanan</div>
                      <div className="text-[#7A7A99]">1 klik isi jadwal kerja sebulan penuh</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pilihan Paket Langganan */}
              <div className="space-y-2.5">
                <span className="text-[#7A7A99] font-bold uppercase tracking-wider text-[10px]">
                  Pilih Paket Langganan:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[]).map((planKey) => {
                    const plan = SUBSCRIPTION_PLANS[planKey];
                    const isSelected = selectedPlan === planKey;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(planKey)}
                        className={`relative p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'bg-[#161626] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                            : 'bg-[#0A0A12] border-white/10 hover:border-white/30'
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[8px] bg-gradient-to-r from-[#FFE600] to-[#FF2BD6] text-[#0A0A12] font-black uppercase">
                            {plan.badge}
                          </span>
                        )}
                        <div className="text-white font-bold">{plan.name}</div>
                        <div className="text-base font-black text-[#00F0FF] my-1">
                          {plan.priceFormatted}
                        </div>
                        <div className="text-[10px] text-[#7A7A99]">{plan.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Feedback */}
              {paymentMessage && (
                <div className="p-3 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-xs">
                  {paymentMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handlePayWithDoku}
                  disabled={isProcessingPayment}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#39FF14] text-[#0A0A12] font-black text-sm hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isProcessingPayment
                      ? 'Menghubungkan DOKU...'
                      : `Bayar via DOKU (${SUBSCRIPTION_PLANS[selectedPlan].priceFormatted})`}
                  </span>
                </button>
              </div>

              {/* User Logged in - Sign Out link */}
              {user && (
                <div className="pt-2 text-center border-t border-white/10">
                  <button
                    onClick={logout}
                    className="text-[#7A7A99] hover:text-[#EC4899] text-xs transition-colors inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" /> Keluar dari Akun ({user.email})
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB 2: SUPPORT & DONASI SUKARELA */}
          {activeTab === 'support' && (
            <div className="space-y-4 text-center">
              <p className="text-[11px] text-[#b9cacb] leading-relaxed">
                Terima kasih telah menggunakan <strong>Kalkulator Lembur by Kei Project</strong>! Traktiran kopi atau donasi seikhlasnya sangat berarti untuk operasional server dan pengembangan fitur selanjutnya.
              </p>

              {/* QRIS Container */}
              <div className="bg-white p-3 rounded-xl shadow-xl border-2 border-[#EC4899]/30 inline-block mx-auto max-w-[240px]">
                <img
                  src="/qris.jpg"
                  alt="QRIS Kei Project"
                  className="w-full h-auto rounded-lg object-contain select-none"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#161626] border border-white/10 text-[11px] text-white">
                <span className="text-[#EC4899] font-bold">NMID: ID1024346850493</span>
                <div className="text-[10px] text-[#7A7A99]">A.N KEI STORE - GAME (Semua Bank & E-Wallet)</div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleDownloadQRIS}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#161626] border border-[#EC4899]/50 hover:border-[#EC4899] text-[#EC4899] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(236,72,153,0.2)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar QRIS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
