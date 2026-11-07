import React from 'react';
import { X, Heart, Coffee, Download, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownloadQRIS = () => {
    const link = document.createElement('a');
    link.href = '/qris.jpg';
    link.download = 'qris-support-kahfi.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#12121F] border border-[#EC4899]/40 rounded-2xl shadow-[0_0_50px_rgba(236,72,153,0.25)] text-[#E4E1ED] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 border-b border-[#EC4899]/20 bg-[#0A0A12] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EC4899]/15 border border-[#EC4899]/40 flex items-center justify-center text-[#EC4899] shadow-[0_0_12px_rgba(236,72,153,0.3)]">
              <Heart className="w-4 h-4 fill-[#EC4899]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-heading flex items-center gap-1.5">
                Support Me <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
              </h3>
              <p className="text-[10px] text-[#b9cacb] font-mono">Dukungan & Donasi untuk Kahfi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-center">
          <p className="text-[11px] text-[#b9cacb] font-sans leading-relaxed">
            Terima kasih banyak telah menggunakan <strong>Kalkulator Penghitung Lembur</strong>! Dukungan atau traktiran kopi Anda sangat berarti untuk kelangsungan pengembangan aplikasi ini.
          </p>

          {/* QRIS Image Container */}
          <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-[#EC4899]/30 inline-block mx-auto max-w-[260px]">
            <img
              src="/qris.jpg"
              alt="QRIS Donasi Kei Store - Game"
              className="w-full h-auto rounded-lg object-contain select-none"
            />
          </div>

          {/* Merchant Info Badge */}
          <div className="p-3 rounded-lg bg-[#0A0A12] border border-white/10 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#7A7A99]">Merchant:</span>
              <span className="font-bold text-white font-mono">Kei Store - Game</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#7A7A99]">NMID:</span>
              <span className="font-bold text-[#00F0FF] font-mono">ID1026523177396</span>
            </div>
          </div>

          <p className="text-[10px] text-[#7A7A99] font-sans">
            Mendukung semua pembayaran: <strong>BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay, LinkAja</strong>, & aplikasi perbankan lainnya.
          </p>

          {/* Download QRIS Button */}
          <button
            onClick={handleDownloadQRIS}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white font-bold text-xs font-mono hover:opacity-95 transition-all shadow-[0_0_16px_rgba(236,72,153,0.35)] flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Gambar QRIS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
