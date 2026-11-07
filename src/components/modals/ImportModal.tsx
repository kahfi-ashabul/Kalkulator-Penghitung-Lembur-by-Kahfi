import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Briefcase, Calendar } from 'lucide-react';
import { OvertimeEntry, AttendanceRecord } from '../../types/overtime';
import { parseImportJSON } from '../../utils/exportImport';
import { formatRupiah, formatTanggal } from '../../utils/calculations';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newEntries: OvertimeEntry[], attendanceMap: Record<string, AttendanceRecord>, mode: 'merge' | 'replace') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [validEntries, setValidEntries] = useState<OvertimeEntry[]>([]);
  const [importedAttMap, setImportedAttMap] = useState<Record<string, AttendanceRecord>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setErrors(['File kosong atau tidak dapat dibaca.']);
        setIsProcessing(false);
        return;
      }

      if (!selected.name.endsWith('.json')) {
        setErrors(['Format berkas tidak didukung. Mohon pilih berkas cadangan resmi berformat .JSON']);
        setIsProcessing(false);
        return;
      }

      const res = parseImportJSON(text);
      setValidEntries(res.validEntries);
      setImportedAttMap(res.attendanceMap || {});
      setErrors(res.errors);
      setIsProcessing(false);
    };

    reader.onerror = () => {
      setErrors(['Terjadi kesalahan membaca file lokal.']);
      setIsProcessing(false);
    };

    reader.readAsText(selected);
  };

  const attList = Object.values(importedAttMap);
  const hasDataToImport = validEntries.length > 0 || attList.length > 0;

  const handleCommit = () => {
    if (!hasDataToImport) return;
    onImportComplete(validEntries, importedAttMap, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#12121F] border border-[#00F0FF]/30 rounded-lg shadow-2xl text-[#E4E1ED] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#00F0FF]/20 bg-[#0A0A12]">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#00F0FF]" />
            <div>
              <h3 className="font-bold text-white text-base">Pulihkan Cadangan Riwayat & Catatan Kehadiran (JSON)</h3>
              <p className="text-xs text-[#b9cacb]">Memulihkan riwayat lembur dan catatan absensi harian dari berkas cadangan .JSON</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#7A7A99] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#00F0FF]/30 hover:border-[#00F0FF] rounded-lg p-6 text-center cursor-pointer bg-[#0A0A12] transition-colors group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileText className="w-10 h-10 mx-auto text-[#7A7A99] group-hover:text-[#00F0FF] mb-2 transition-colors" />
            <div className="text-sm font-semibold text-white">
              {file ? file.name : 'Pilih berkas cadangan (.JSON)'}
            </div>
            <div className="text-xs text-[#7A7A99] mt-1 font-sans">
              Data diproses secara lokal 100% di browser Anda tanpa diunggah ke server eksternal
            </div>
          </div>

          {/* Parse Results */}
          {file && (
            <div className="space-y-3">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded bg-[#1A1A2E] border border-[#00F0FF]/30 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <div>
                    <div className="text-white font-bold text-sm">{validEntries.length}</div>
                    <div className="text-[10px] text-[#7A7A99]">Entri Lembur</div>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#1A1A2E] border border-[#39FF14]/30 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <div>
                    <div className="text-white font-bold text-sm">{attList.length}</div>
                    <div className="text-[10px] text-[#7A7A99]">Catatan Kehadiran</div>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#1A1A2E] border border-[#ffb4ab]/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#ffb4ab] shrink-0" />
                  <div>
                    <div className="text-white font-bold text-sm">{errors.length}</div>
                    <div className="text-[10px] text-[#7A7A99]">Baris Gagal/Peringatan</div>
                  </div>
                </div>
              </div>

              {/* Error details if any */}
              {errors.length > 0 && (
                <div className="p-3 rounded bg-[#93000a]/20 border border-[#ffb4ab]/30 text-xs text-[#ffb4ab] max-h-28 overflow-y-auto space-y-1">
                  <div className="font-bold">Laporan Baris Tidak Valid:</div>
                  {errors.slice(0, 5).map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                  {errors.length > 5 && <div>...dan {errors.length - 5} kesalahan lainnya.</div>}
                </div>
              )}

              {/* Preview Lembur */}
              {validEntries.length > 0 && (
                <div className="border border-white/10 rounded overflow-hidden">
                  <div className="bg-[#1A1A2E] px-3 py-1.5 text-xs text-[#00F0FF] font-bold border-b border-white/10 flex items-center justify-between">
                    <span>Pratinjau Entri Lembur ({validEntries.length} total)</span>
                    <span className="text-[10px] text-[#7A7A99]">3 entri teratas</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {validEntries.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between bg-[#12121F]">
                        <div>
                          <div className="text-white font-semibold">{formatTanggal(item.tanggal)}</div>
                          <div className="text-[10px] text-[#7A7A99]">
                            {item.sistem === '5_hari' ? '5 Hari' : '6 Hari'} • {item.jenisHari.toUpperCase()} • {item.jamLembur} jam
                          </div>
                        </div>
                        <div className="text-[#39FF14] font-bold">
                          {formatRupiah(item.totalLembur)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Kehadiran */}
              {attList.length > 0 && (
                <div className="border border-white/10 rounded overflow-hidden">
                  <div className="bg-[#1A1A2E] px-3 py-1.5 text-xs text-[#39FF14] font-bold border-b border-white/10 flex items-center justify-between">
                    <span>Pratinjau Catatan Kehadiran ({attList.length} total)</span>
                    <span className="text-[10px] text-[#7A7A99]">3 catatan teratas</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {attList.slice(0, 3).map((att, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between bg-[#12121F]">
                        <div>
                          <div className="text-white font-semibold">{formatTanggal(att.tanggal)}</div>
                          <div className="text-[10px] text-[#b9cacb]">
                            {att.catatan || 'Tanpa keterangan'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                            att.status === 'masuk'
                              ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/40'
                              : att.status === 'sakit'
                              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
                              : att.status === 'izin'
                              ? 'bg-[#EC4899]/15 text-[#EC4899] border-[#EC4899]/40'
                              : att.status === 'cuti'
                              ? 'bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/40'
                              : 'bg-white/5 text-[#b9cacb] border-white/10'
                          }`}>
                            {att.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode choice */}
              {hasDataToImport && (
                <div className="p-3 rounded bg-[#1A1A2E] border border-white/10">
                  <label className="text-xs text-[#b9cacb] block mb-2 font-bold text-white">
                    Metode Penyimpanan Data:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="accent-[#00F0FF]"
                      />
                      <span className="text-white">Gabung Data (Pertahankan data yang sudah ada)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="accent-[#FF2BD6]"
                      />
                      <span className="text-[#ffb4ab]">Ganti Seluruh Data (Timpa riwayat & kehadiran lama)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A0A12] border-t border-white/10 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-mono text-[#7A7A99] hover:text-white hover:bg-white/5 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={!hasDataToImport || isProcessing}
            className="px-5 py-2 rounded text-xs font-bold font-mono text-[#0A0A12] bg-[#00F0FF] hover:bg-[#7df4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center gap-1.5"
          >
            <span>Terapkan ({validEntries.length} Lembur + {attList.length} Kehadiran)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
