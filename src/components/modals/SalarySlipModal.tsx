import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Palette, Sparkles, Building2, User } from 'lucide-react';
import { SalarySlipData, generateSalarySlipImage, downloadSalarySlipPNG } from '../../utils/salarySlipGenerator';
import { triggerPopunder } from '../../utils/adManager';
import { playCyberClick, playCyberSuccess } from '../../utils/audio';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SalarySlipData | null;
  defaultNama?: string;
  defaultPerusahaan?: string;
  appTheme?: 'dark' | 'light';
  isPro?: boolean;
  onSaveProfileSettings?: (nama: string, perusahaan: string) => void;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  data,
  defaultNama = 'Karyawan',
  defaultPerusahaan = 'Perusahaan',
  appTheme = 'dark',
  isPro = false,
  onSaveProfileSettings,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(appTheme === 'light' ? 'light' : 'dark');
  const [namaKaryawan, setNamaKaryawan] = useState(defaultNama);
  const [namaPerusahaan, setNamaPerusahaan] = useState(defaultPerusahaan);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Re-sync nama, perusahaan, dan tema setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setTheme(appTheme === 'light' ? 'light' : 'dark');
      setNamaKaryawan(defaultNama || 'Karyawan');
      setNamaPerusahaan(defaultPerusahaan || 'Perusahaan');
    }
  }, [isOpen, appTheme, defaultNama, defaultPerusahaan]);

  // Update live preview image saat data atau input berubah
  useEffect(() => {
    if (isOpen && data) {
      const currentData: SalarySlipData = {
        ...data,
        namaKaryawan,
        namaPerusahaan,
        theme,
      };
      const url = generateSalarySlipImage(currentData);
      setPreviewUrl(url);
    }
  }, [isOpen, data, theme, namaKaryawan, namaPerusahaan]);

  if (!isOpen || !data) return null;

  const handleDownload = () => {
    triggerPopunder(isPro);
    playCyberSuccess();

    if (onSaveProfileSettings) {
      onSaveProfileSettings(namaKaryawan, namaPerusahaan);
    }

    const currentData: SalarySlipData = {
      ...data,
      namaKaryawan,
      namaPerusahaan,
      theme,
    };

    const safeName = (namaKaryawan || 'karyawan').toLowerCase().replace(/\s+/g, '-');
    downloadSalarySlipPNG(currentData, `slip-gaji-${safeName}-${theme}.png`);
  };

  const handlePrint = () => {
    if (!previewUrl) return;
    playCyberClick();

    if (onSaveProfileSettings) {
      onSaveProfileSettings(namaKaryawan, namaPerusahaan);
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Cetak Slip Gaji - ${namaKaryawan}</title>
            <style>
              body { margin: 0; padding: 20px; display: flex; justify-content: center; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${previewUrl}" onload="window.print();" />
          </body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {
          // ignore
        }
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#12121F] border border-[#00F0FF]/30 rounded-lg shadow-2xl text-[#E4E1ED] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#00F0FF]/20 bg-[#0A0A12]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00F0FF]" />
            <div>
              <h3 className="font-bold text-white text-base">Ekspor Bukti Slip Lembur & Gaji (PNG)</h3>
              <p className="text-xs text-[#b9cacb]">
                Resolusi tinggi 2x Retina dengan stempel kepatuhan PP No. 35 Tahun 2021
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Inputs */}
        <div className="p-4 bg-[#161626] border-b border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-mono text-[#b9cacb] mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-[#00F0FF]" />
              Nama Karyawan
            </label>
            <input
              type="text"
              value={namaKaryawan}
              onChange={(e) => setNamaKaryawan(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF]"
              placeholder="Nama Karyawan"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#b9cacb] mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#FF2BD6]" />
              Nama Perusahaan
            </label>
            <input
              type="text"
              value={namaPerusahaan}
              onChange={(e) => setNamaPerusahaan(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded bg-[#1A1A2E] border border-white/10 text-white focus:outline-none focus:border-[#FF2BD6]"
              placeholder="Nama Perusahaan"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#b9cacb] mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3 text-[#39FF14]" />
              Tema Slip Gambar
            </label>
            <div className="flex rounded bg-[#1A1A2E] p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 py-1 px-2 rounded text-xs font-mono transition-all ${
                  theme === 'dark'
                    ? 'bg-[#00F0FF] text-[#0A0A12] font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                Cyber Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 py-1 px-2 rounded text-xs font-mono transition-all ${
                  theme === 'light'
                    ? 'bg-white text-[#0A0A12] font-bold shadow-sm'
                    : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                Cetak Putih
              </button>
            </div>
          </div>
        </div>

        {/* Live Canvas Preview Container */}
        <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center bg-[#0A0A12]/80 min-h-[320px]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview Slip Gaji"
              className="max-h-[55vh] w-auto rounded shadow-2xl border border-white/10 object-contain"
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-[#7A7A99]">
              <Sparkles className="w-4 h-4 animate-spin text-[#00F0FF]" />
              <span>Membuat pratinjau slip beresolusi tinggi...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#12121F] border-t border-[#00F0FF]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#b9cacb] font-mono flex items-center gap-1.5">
            <span>💡</span>
            <span>Gambar PNG ini dapat dikirim langsung ke HR, Manajer, atau WhatsApp sebagai bukti perhitungan.</span>
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 rounded bg-[#1A1A2E] hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-5 py-2 rounded bg-gradient-to-r from-[#00F0FF] to-[#0099FF] text-[#0A0A12] text-xs font-mono font-bold hover:shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PNG (2x Resolusi)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
