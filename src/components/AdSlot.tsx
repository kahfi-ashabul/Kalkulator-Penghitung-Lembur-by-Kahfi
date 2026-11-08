import React, { useEffect, useRef } from 'react';
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
 * Komponen Slot Iklan Adsterra & Sponsor Modular
 * - Leaderboard 728x90: Adsterra Unit (Placement ID: 32149172)
 * - Social Bar diatur via index.html (Placement ID: 32149171)
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  type,
  title = 'Pasang Iklan / Sponsor Anda Di Sini',
  description = 'Jangkau ribuan pekerja, praktisi HR, dan payroll specialist setiap hari.',
  linkUrl = 'mailto:373keiii@gmail.com?subject=Inquiry%20Slot%20Iklan%20Kalkulator%20Lembur',
  sponsorName = 'Ruang Iklan',
  className = '',
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === 'leaderboard' && adContainerRef.current) {
      adContainerRef.current.innerHTML = '';

      const iframe = document.createElement('iframe');
      iframe.title = 'Adsterra 728x90 Banner';
      iframe.width = '100%';
      iframe.height = '90';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.style.display = 'block';
      iframe.style.margin = '0 auto';
      iframe.style.maxWidth = '728px';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <base target="_blank" />
            <style>
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background: transparent;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '3d0a86e23e3cd7c0886854e772d156ae',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bicea.org/22/3d0a86e23e3cd7c0886854e772d156ae"></script>
          </body>
        </html>
      `;

      iframe.srcdoc = htmlContent;
      adContainerRef.current.appendChild(iframe);
    }
  }, [type]);

  // 1. Leaderboard Banner (728x90 Adsterra Resmi: Placement ID 32149172)
  if (type === 'leaderboard') {
    return (
      <div className={`w-full my-4 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <div 
          ref={adContainerRef} 
          className="w-full max-w-[728px] min-h-[90px] flex items-center justify-center overflow-hidden rounded-lg bg-[#0F0F1A]/80 border border-white/10 shadow-md"
        />
        <div className="w-full max-w-[728px] flex justify-between items-center px-1 text-[9px] font-mono text-[#7A7A99] mt-1">
          <span>Sponsored Ad</span>
          <span>Placement 728x90</span>
        </div>
      </div>
    );
  }

  // 2. Medium Rectangle (300x250 format)
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
    <div className={`p-4 rounded-lg bg-gradient-to-br from-[#12121F] to-[#1A1A2E] border border-white/10 ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono mb-2">
        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-[#00F0FF] font-bold">
          {sponsorName}
        </span>
        <span className="text-[10px] text-[#7A7A99]">Sponsorship</span>
      </div>
      <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-[#b9cacb] mb-3">{description}</p>
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-mono text-[#00F0FF] hover:underline"
      >
        <span>Pelajari Selengkapnya</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
