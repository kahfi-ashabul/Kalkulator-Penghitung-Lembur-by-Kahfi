import React from 'react';
import { Sparkles, ExternalLink, Megaphone } from 'lucide-react';

export type AdSlotType = 'leaderboard' | 'rectangle' | 'sponsor_card';

interface AdSlotProps {
  type: AdSlotType;
  title?: string;
  description?: string;
  linkUrl?: string;
  sponsorName?: string;
  className?: string;
}

/**
 * Komponen Slot Iklan & Sponsor Modular
 * Dapat dihubungkan ke Google AdSense, Affiliate Banner, atau Sponsor Langsung.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  type,
  title = 'Pasang Iklan / Sponsor Anda Di Sini',
  description = 'Jangkau ribuan pekerja, praktisi HR, dan payroll specialist setiap hari.',
  linkUrl = 'mailto:373keiii@gmail.com?subject=Inquiry%20Slot%20Iklan%20Kalkulator%20Lembur',
  sponsorName = 'Ruang Iklan',
  className = '',
}) => {
  // 1. Leaderboard Banner (728x90 desktop, 320x50 mobile responsive)
  if (type === 'leaderboard') {
    return (
      <div className={`w-full my-4 ${className}`}>
        <div className="relative overflow-hidden rounded-lg bg-[#0F0F1A] border border-white/10 hover:border-[#00F0FF]/40 transition-all p-3 sm:py-3.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 group">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[#7A7A99] uppercase font-bold tracking-wider">
                  {sponsorName}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                  {title}
                </span>
              </div>
              <p className="text-[11px] text-[#b9cacb] mt-0.5 line-clamp-1 font-sans">
                {description}
              </p>
            </div>
          </div>

          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded text-xs font-mono font-bold bg-[#1A1A2E] border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#0A0A12] transition-all flex items-center gap-1.5 shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
          >
            <span>Hubungi Sponsor</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // 2. Medium Rectangle (300x250 sidebar format)
  if (type === 'rectangle') {
    return (
      <div className={`p-4 rounded-lg bg-[#0F0F1A] border border-white/10 hover:border-[#FF2BD6]/40 transition-all text-center flex flex-col justify-between min-h-[220px] ${className}`}>
        <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7A99] pb-2 border-b border-white/5">
          <span className="flex items-center gap-1 text-[#FF2BD6]">
            <Sparkles className="w-3 h-3" /> SPONSOR / IKLAN
          </span>
          <span className="text-white/30">300x250</span>
        </div>

        <div className="my-auto py-3">
          <div className="w-10 h-10 rounded-full bg-[#FF2BD6]/10 border border-[#FF2BD6]/30 text-[#FF2BD6] flex items-center justify-center mx-auto mb-2">
            <Megaphone className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white mb-1">{title}</h4>
          <p className="text-[11px] text-[#b9cacb] leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 rounded text-xs font-mono font-bold bg-[#1A1A2E] border border-[#FF2BD6]/40 text-[#FF2BD6] hover:bg-[#FF2BD6] hover:text-white transition-all flex items-center justify-center gap-1.5"
        >
          <span>Pasang Iklan / Info</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  // 3. Sponsor Card (In-Feed Card)
  return (
    <div className={`p-4 rounded-lg bg-[#12121F] border border-[#FFE600]/30 shadow-lg ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono text-[#FFE600] mb-2">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> RUANG SPONSOR & REKOMENDASI
        </span>
        <span className="text-[#7A7A99]">Info Kemitraan</span>
      </div>
      <h4 className="text-xs font-bold text-white mb-1">{title}</h4>
      <p className="text-[11px] text-[#b9cacb] leading-relaxed mb-3">
        {description}
      </p>
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00F0FF] hover:underline"
      >
        <span>Pelajari Penawaran Iklan</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
