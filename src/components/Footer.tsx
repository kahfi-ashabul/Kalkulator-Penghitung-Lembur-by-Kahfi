import React from 'react';
import { ShieldCheck, ExternalLink, Scale, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenLegal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#07070D] text-xs font-mono text-[#7A7A99] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[#161626] border border-[#00F0FF]/40 shadow-xs p-1">
                <img src="/assets/kei-icon.png" alt="Kei Pro" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-[#0F172A] dark:text-white text-base tracking-tight font-heading">
                Kalkulator Lembur
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gradient-to-r from-[#00F0FF]/15 to-[#39FF14]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-sm shrink-0">
                by Kei Project
              </span>
            </div>
            <p className="text-[11px] text-[#b9cacb] mt-1 font-sans max-w-xl">
              Platform komputasi hak ketenagakerjaan berstandar presisi tinggi sesuai PP No. 35 Tahun 2021. Didesain untuk karyawan, staf HR & penggajian, serta pengusaha UMKM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={onOpenLegal}
              className="text-[#FFE600] hover:underline flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" />
              Dasar Hukum PP 35/2021
            </button>
          </div>
        </div>

        {/* Legal Links Bar */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-[#39FF14]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Privasi Penuh: Data 100% diproses di browser Anda tanpa server pihak ketiga.</span>
          </div>

          <div className="flex items-center gap-4 text-[#00F0FF]">
            <a
              href="https://peraturan.bpk.go.id/Details/161904/pp-no-35-tahun-2021"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              JDIH BPK RI <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://jdih.kemnaker.go.id/peraturan/detail/1723/peraturan-pemerintah-nomor-35-tahun-2021"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              JDIH Kemnaker RI <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="text-center text-[10px] text-[#7A7A99] pt-2">
          Estimasi mandiri, bukan dokumen resmi pemerintah atau nasihat hukum legal. Dibuat dengan presisi oleh Kei Project.
        </div>
      </div>
    </footer>
  );
};
