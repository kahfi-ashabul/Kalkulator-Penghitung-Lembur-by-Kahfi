import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, X, AlertTriangle, Scale, Clock, Calculator } from 'lucide-react';

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#12121F] border border-[#00F0FF]/30 rounded-lg shadow-2xl p-6 text-[#E4E1ED]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00F0FF]/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Dasar Hukum & Ketentuan Lembur
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/30">
                  PP 35/2021
                </span>
              </h2>
              <p className="text-xs text-[#b9cacb]">
                Rujukan baku Peraturan Pemerintah No. 35 Tahun 2021
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-6 text-sm">
          {/* Section 1: Jam Kerja */}
          <div className="p-4 rounded bg-[#1A1A2E] border border-white/10">
            <div className="flex items-center gap-2 text-[#00F0FF] font-semibold mb-2">
              <Clock className="w-4 h-4" />
              <span>Jam Kerja Menurut PP No. 35 Tahun 2021 (Pasal 21 Ayat 2)</span>
            </div>
            <p className="text-xs text-[#b9cacb] leading-relaxed mb-3">
              Waktu kerja karyawan di Indonesia diatur sebagai berikut:
            </p>
            <ul className="space-y-2 text-xs list-disc list-inside text-[#E4E1ED]">
              <li>
                <strong className="text-white">6 Hari Kerja:</strong> 7 jam sehari dan maksimal 40 jam dalam 1 minggu.
              </li>
              <li>
                <strong className="text-white">5 Hari Kerja:</strong> 8 jam sehari dan maksimal 40 jam dalam 1 minggu.
              </li>
            </ul>
            <div className="mt-3 p-2.5 rounded bg-[#FFE600]/10 border border-[#FFE600]/20 flex items-start gap-2 text-xs text-[#FFE600]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Penting:</strong> Jam istirahat <em>tidak dihitung</em> sebagai jam kerja efektif. Pada sistem 5 hari kerja, lembur dihitung setelah 8 jam kerja riil; pada sistem 6 hari kerja, lembur dihitung setelah 7 jam kerja riil.
              </span>
            </div>
          </div>

          {/* Section 2: Batas Waktu Lembur */}
          <div className="p-4 rounded bg-[#1A1A2E] border border-white/10">
            <div className="flex items-center gap-2 text-[#FF2BD6] font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Batas Maksimal Waktu Lembur (Pasal 26 Ayat 1)</span>
            </div>
            <p className="text-xs text-[#b9cacb] leading-relaxed">
              Waktu kerja lembur hanya dapat dilakukan paling banyak <strong className="text-white">4 (empat) jam dalam 1 (satu) hari</strong> dan <strong className="text-white">18 (delapan belas) jam dalam 1 (satu) minggu</strong>. Batasan ini tidak termasuk waktu kerja lembur yang dilakukan pada waktu istirahat mingguan dan/atau hari libur resmi.
            </p>
          </div>

          {/* Section 3: Rumus Upah Sejam */}
          <div className="p-4 rounded bg-[#1A1A2E] border border-white/10">
            <div className="flex items-center gap-2 text-[#39FF14] font-semibold mb-2">
              <Calculator className="w-4 h-4" />
              <span>Rumus Perhitungan Upah Sejam (Pasal 32)</span>
            </div>
            <div className="p-3 my-2 rounded bg-black/40 font-mono text-center text-sm text-[#39FF14] border border-[#39FF14]/20">
              Upah Sejam = 1/173 × (Gaji Pokok + Tunjangan Tetap)
            </div>
            <p className="text-xs text-[#b9cacb]">
              Angka pembagi <strong className="text-white font-mono">173</strong> diperoleh dari perhitungan rata-rata jam kerja per bulan: (40 jam kerja per minggu × 52 minggu per tahun) ÷ 12 bulan = 173,33 jam (dibulatkan menjadi 173). Tunjangan tidak tetap seperti uang makan harian atau transport kehadiran tidak diikutsertakan.
            </p>
          </div>

          {/* Section 4: Tabel Pengali Resmi */}
          <div className="p-4 rounded bg-[#1A1A2E] border border-white/10">
            <div className="flex items-center gap-2 text-white font-semibold mb-3">
              <BookOpen className="w-4 h-4 text-[#00F0FF]" />
              <span>Tabel Pengali Lembur PP 35/2021 (Pasal 31)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#00F0FF]/20 text-[#7A7A99]">
                    <th className="py-2 pr-3">Sistem & Hari</th>
                    <th className="py-2 px-3">Jam Ke-1 s/d Batas</th>
                    <th className="py-2 px-3">Jam Berikutnya</th>
                    <th className="py-2 pl-3">Jam Puncak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2.5 pr-3 text-white">Hari Kerja Biasa (5/6 hari)</td>
                    <td className="py-2.5 px-3 text-[#00F0FF]">Jam 1: <strong>1.5x</strong></td>
                    <td className="py-2.5 px-3 text-[#00F0FF]">Jam 2 dst: <strong>2x</strong></td>
                    <td className="py-2.5 pl-3 text-[#7A7A99]">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 text-white">5 Hari: Hari Libur / Istirahat (Sabtu & Minggu / Tanggal Merah)</td>
                    <td className="py-2.5 px-3 text-[#00F0FF]">Jam 1 - 8: <strong>2x</strong></td>
                    <td className="py-2.5 px-3 text-[#FFE600]">Jam 9: <strong>3x</strong></td>
                    <td className="py-2.5 pl-3 text-[#FF2BD6]">Jam 10 dst: <strong>4x</strong></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 text-white">6 Hari: Minggu (Istirahat Mingguan / Libur Resmi Lainnya)</td>
                    <td className="py-2.5 px-3 text-[#00F0FF]">Jam 1 - 7: <strong>2x</strong></td>
                    <td className="py-2.5 px-3 text-[#FFE600]">Jam 8: <strong>3x</strong></td>
                    <td className="py-2.5 pl-3 text-[#FF2BD6]">Jam 9 dst: <strong>4x</strong></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 text-white">6 Hari: Sabtu (Hari Kerja Biasa)</td>
                    <td className="py-2.5 px-3 text-[#00F0FF]">Jam 1: <strong>1.5x</strong></td>
                    <td className="py-2.5 px-3 text-[#00F0FF]">Jam 2 dst: <strong>2x</strong></td>
                    <td className="py-2.5 pl-3 text-[#7A7A99]">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 text-white">6 Hari: Libur Hari Kerja Terpendek</td>
                    <td className="py-2.5 px-3 text-[#00F0FF]">Jam 1 - 5: <strong>2x</strong></td>
                    <td className="py-2.5 px-3 text-[#FFE600]">Jam 6: <strong>3x</strong></td>
                    <td className="py-2.5 pl-3 text-[#FF2BD6]">Jam 7 dst: <strong>4x</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Tautan Sumber Resmi */}
          <div className="p-4 rounded bg-[#0A0A12] border border-[#00F0FF]/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00F0FF] mb-3">
              Tautan Sumber Resmi Pemerintah RI
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://peraturan.bpk.go.id/Details/161904/pp-no-35-tahun-2021"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded bg-[#161626] border border-white/10 hover:border-[#00F0FF] transition-all group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-[#00F0FF] flex items-center gap-1.5">
                    JDIH BPK RI
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] text-[#7A7A99]">Salinan Resmi PP 35/2021</div>
                </div>
              </a>

              <a
                href="https://jdih.kemnaker.go.id/peraturan/detail/1723/peraturan-pemerintah-nomor-35-tahun-2021"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded bg-[#161626] border border-white/10 hover:border-[#FF2BD6] transition-all group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-[#FF2BD6] flex items-center gap-1.5">
                    JDIH Kemnaker RI
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] text-[#7A7A99]">Kementerian Ketenagakerjaan</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded text-xs font-semibold bg-[#00F0FF] text-[#0A0A12] hover:bg-[#7df4ff] transition-all font-mono"
          >
            TUTUP DOKUMENTASI
          </button>
        </div>
      </div>
    </div>
  );
};
