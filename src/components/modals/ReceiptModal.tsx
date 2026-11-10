import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Palette, Sparkles, Building2, User } from 'lucide-react';
import { OvertimeCalculationResult, OvertimeEntry } from '../../types/overtime';
import { generateReceiptImage, downloadReceiptPNG } from '../../utils/receiptGenerator';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OvertimeCalculationResult | OvertimeEntry | null;
  defaultNama?: string;
  defaultPerusahaan?: string;
  appTheme?: 'dark' | 'light';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
  defaultNama = 'Karyawan',
  defaultPerusahaan = 'Perusahaan',
  appTheme = 'dark',
}) => {
  const [theme, setTheme] = useState<'cyber' | 'white'>(appTheme === 'light' ? 'white' : 'cyber');
  const [namaKaryawan, setNamaKaryawan] = useState(defaultNama);
  const [namaPerusahaan, setNamaPerusahaan] = useState(defaultPerusahaan);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Re-sync nama, perusahaan, dan tema dari pengaturan setiap kali modal dibuka atau props berubah
  useEffect(() => {
    if (isOpen) {
      setTheme(appTheme === 'light' ? 'white' : 'cyber');
      setNamaKaryawan(defaultNama || 'Karyawan');
      setNamaPerusahaan(defaultPerusahaan || 'Perusahaan');
    }
  }, [isOpen, appTheme, defaultNama, defaultPerusahaan]);

  useEffect(() => {
    if (isOpen && data) {
      const url = generateReceiptImage(data, {
        theme,
        namaKaryawan,
        namaPerusahaan,
        tanggal: 'tanggal' in data ? (data as OvertimeEntry).tanggal : undefined,
        catatan: 'catatan' in data ? (data as OvertimeEntry).catatan : undefined,
      });
      setPreviewUrl(url);
    }
  }, [isOpen, data, theme, namaKaryawan, namaPerusahaan]);

  if (!isOpen || !data) return null;

  const handleDownload = () => {
    downloadReceiptPNG(
      data,
      {
        theme,
        namaKaryawan,
        namaPerusahaan,
        tanggal: 'tanggal' in data ? (data as OvertimeEntry).tanggal : undefined,
        catatan: 'catatan' in data ? (data as OvertimeEntry).catatan : undefined,
      },
      `slip-lembur-${namaKaryawan.toLowerCase().replace(/\s+/g, '-')}-${theme}.png`
    );
  };

  const handlePrint = () => {
    if (!previewUrl) return;
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
            <title>Cetak Slip Lembur - ${namaKaryawan}</title>
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
              <h3 className="font-bold text-white text-base">Ekspor Bukti Slip Lembur (PNG)</h3>
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
                onClick={() => setTheme('cyber')}
                className={`flex-1 text-xs py-1 rounded font-mono transition-colors ${
                  theme === 'cyber' ? 'bg-[#00F0FF] text-[#0A0A12] font-bold' : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                Cyber Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('white')}
                className={`flex-1 text-xs py-1 rounded font-mono transition-colors ${
                  theme === 'white' ? 'bg-white text-[#0A0A12] font-bold' : 'text-[#7A7A99] hover:text-white'
                }`}
              >
                Cetak Putih
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-[#07070D]">
          {previewUrl ? (
            <div className="max-w-xl shadow-2xl rounded border border-white/10 overflow-hidden">
              <img
                src={previewUrl}
                alt="Pratinjau Slip Lembur"
                className="w-full h-auto block select-none pointer-events-none"
              />
            </div>
          ) : (
            <div className="text-xs text-[#7A7A99]">Membuat pratinjau slip...</div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-[#0A0A12] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-[#7A7A99]">
            💡 Gambar PNG ini dapat dikirim langsung ke HR, Manajer, atau WhatsApp sebagai bukti perhitungan.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded text-xs font-mono text-white bg-[#1A1A2E] border border-white/20 hover:border-[#00F0FF] transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded text-xs font-bold font-mono text-[#0A0A12] bg-gradient-to-r from-[#00F0FF] to-[#0082FB] hover:opacity-95 transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh PNG (2x Resolusi)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
