/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation, ScreenType } from './components/Navigation';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { OvertimeCalculatorScreen } from './components/screens/OvertimeCalculatorScreen';
import { SalaryCalculatorScreen } from './components/screens/SalaryCalculatorScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { LegalInfoModal } from './components/modals/LegalInfoModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { ImportModal } from './components/modals/ImportModal';
import { EditEntryModal } from './components/modals/EditEntryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { SupportModal } from './components/modals/SupportModal';
import { AttendanceModal } from './components/modals/AttendanceModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProModal } from './components/modals/ProModal';
import { 
  OvertimeEntry, 
  OvertimeCalculationResult, 
  UserSettings,
  AttendanceRecord 
} from './types/overtime';
import { 
  getStoredEntries, 
  saveStoredEntries, 
  addStoredEntry, 
  updateStoredEntry, 
  deleteStoredEntry, 
  clearAllStoredEntries, 
  resetAllAppData,
  defaultSettings,
  getStoredSettings, 
  saveStoredSettings,
  getStoredAttendance,
  setAttendanceRecord,
  deleteAttendanceRecord,
  clearAllAttendance,
  saveStoredAttendance
} from './utils/storage';
import { playCyberClick, playCyberSuccess } from './utils/audio';

function AppInner() {
  const { isPro, triggerCloudSync } = useAuth();

  // Screen state - Initial Screen is Dashboard Ringkasan Lembur as requested
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);

  // Stored state
  const [entries, setEntries] = useState<OvertimeEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());

  // Modals state
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<OvertimeEntry | null>(null);

  // Sync theme to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [settings.theme]);

  // Urutan awal: Tampilkan Panduan Penggunaan DULU, baru kemudian Profil Karyawan
  useEffect(() => {
    const loadedSettings = getStoredSettings();
    if (loadedSettings.showOnboardingGuide !== false) {
      setIsOnboardingOpen(true);
    } else if (!loadedSettings.profileCompleted) {
      setIsProfileOpen(true);
    }
  }, []);

  // Receipt Modal state
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<OvertimeCalculationResult | OvertimeEntry | null>(null);

  // Attendance State & Global Modal
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalDate, setAttendanceModalDate] = useState(() => new Date().toISOString().slice(0, 10));

  const handleOpenAttendanceModal = (date?: string) => {
    if (settings.audioFeedback) playCyberClick();
    if (date) {
      setAttendanceModalDate(date);
    } else {
      setAttendanceModalDate(new Date().toISOString().slice(0, 10));
    }
    setIsAttendanceModalOpen(true);
  };

  const handleDeleteAttendance = (tanggal: string) => {
    deleteAttendanceRecord(tanggal);
    setAttendanceMap(getStoredAttendance());
    if (settings.audioFeedback) playCyberClick();
  };

  // Initialize data on mount
  useEffect(() => {
    const loadedEntries = getStoredEntries();
    setEntries(loadedEntries);
    const loadedSettings = getStoredSettings();
    setSettings(loadedSettings);
    const loadedAttendance = getStoredAttendance();
    setAttendanceMap(loadedAttendance);
  }, []);

  const handleSaveAttendance = (record: AttendanceRecord) => {
    setAttendanceRecord(record);
    setAttendanceMap(getStoredAttendance());
    if (settings.audioFeedback) playCyberSuccess();
  };

  const handleSelectScreen = (screen: ScreenType) => {
    if (settings.audioFeedback) playCyberClick();
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEntry = (newEntry: OvertimeEntry) => {
    addStoredEntry(newEntry);
    setEntries(getStoredEntries());

    // Otomatis sinkronkan catatan kehadiran 'masuk' jika belum ada
    const currentAtt = getStoredAttendance();
    const existing = currentAtt[newEntry.tanggal];
    if (!existing || existing.status === 'libur_off') {
      const isOff = newEntry.jenisHari === 'libur';
      const regHours = newEntry.jamKerjaReguler ?? (newEntry.sistem === '6_hari' ? 7 : 8);
      const autoAtt: AttendanceRecord = {
        tanggal: newEntry.tanggal,
        status: isOff ? 'libur_off' : 'masuk',
        jamKerjaReguler: isOff ? 0 : regHours,
        catatan: newEntry.catatan || 'Masuk Kerja & Lembur',
      };
      setAttendanceRecord(autoAtt);
      setAttendanceMap(getStoredAttendance());
    }
  };

  const handleUpdateEntry = (updated: OvertimeEntry) => {
    updateStoredEntry(updated);
    setEntries(getStoredEntries());
    if (settings.audioFeedback) playCyberSuccess();
  };

  const handleDeleteEntry = (id: string) => {
    deleteStoredEntry(id);
    setEntries(getStoredEntries());
    if (settings.audioFeedback) playCyberClick();
  };

  const handleClearAllEntries = () => {
    clearAllStoredEntries();
    setEntries([]);
    if (settings.audioFeedback) playCyberClick();
  };

  const handleClearAttendance = () => {
    clearAllAttendance();
    setAttendanceMap({});
    if (settings.audioFeedback) playCyberClick();
  };

  const handleResetAllData = () => {
    resetAllAppData();
    setEntries([]);
    setAttendanceMap({});
    setSettings(defaultSettings);
    if (settings.audioFeedback) playCyberSuccess();
  };

  const handleImportComplete = (imported: OvertimeEntry[], newAttMap: Record<string, AttendanceRecord>, mode: 'merge' | 'replace') => {
    let finalEntries: OvertimeEntry[] = [];
    if (mode === 'replace') {
      finalEntries = imported;
    } else {
      const existingIds = new Set(entries.map((e) => e.id));
      const filteredNew = imported.filter((e) => !existingIds.has(e.id));
      finalEntries = [...filteredNew, ...entries];
    }
    saveStoredEntries(finalEntries);
    setEntries(finalEntries);
    // Merge / replace attendance records from import
    if (mode === 'replace') {
      saveStoredAttendance(newAttMap);
    } else {
      const merged = { ...getStoredAttendance(), ...newAttMap };
      saveStoredAttendance(merged);
    }
    setAttendanceMap(getStoredAttendance());
    if (settings.audioFeedback) playCyberSuccess();
  };

  const handleOpenReceiptFromCalc = (
    calcResult: OvertimeCalculationResult,
    date: string,
    note?: string
  ) => {
    if (settings.audioFeedback) playCyberClick();
    setReceiptData({
      ...calcResult,
      tanggal: date,
      catatan: note,
    } as any);
    setIsReceiptOpen(true);
  };

  const handleOpenReceiptFromEntry = (entry: OvertimeEntry) => {
    if (settings.audioFeedback) playCyberClick();
    setReceiptData(entry);
    setIsReceiptOpen(true);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    saveStoredSettings(newSettings);
    setSettings(newSettings);
    if (settings.audioFeedback) playCyberSuccess();
  };

  const handleToggleAudio = () => {
    const updated = { ...settings, audioFeedback: !settings.audioFeedback };
    handleSaveSettings(updated);
  };

  // Auto-sync ke cloud setiap kali entries atau attendanceMap berubah (khusus akun PRO)
  useEffect(() => {
    if (isPro) {
      triggerCloudSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, attendanceMap]);

  return (
    <div className="min-h-screen flex flex-col cyber-canvas text-[#E4E1ED] pb-16 md:pb-0">
      {/* Pinned Navigation Deck */}
      <Navigation
        currentScreen={currentScreen}
        onSelectScreen={handleSelectScreen}
        onOpenLegal={() => {
          if (settings.audioFeedback) playCyberClick();
          setIsLegalOpen(true);
        }}
        onOpenSettings={() => {
          if (settings.audioFeedback) playCyberClick();
          setIsSettingsOpen(true);
        }}
        onOpenProfile={() => {
          if (settings.audioFeedback) playCyberClick();
          setIsProfileOpen(true);
        }}
        onOpenSupport={() => {
          if (settings.audioFeedback) playCyberClick();
          setIsSupportOpen(true);
        }}
        onOpenProModal={() => {
          if (settings.audioFeedback) playCyberClick();
          setIsProModalOpen(true);
        }}
        audioFeedback={settings.audioFeedback}
        onToggleAudio={handleToggleAudio}
        theme={settings.theme || 'dark'}
        onToggleTheme={() => {
          const next = settings.theme === 'light' ? 'dark' : 'light';
          handleSaveSettings({ ...settings, theme: next });
        }}
        totalEntriesCount={entries.length}
        namaKaryawan={settings.namaKaryawan}
      />

      {/* Main Screen Container - pb-28 prevents mobile bottom navigation from cutting off content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:p-8 pb-28 md:pb-10">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            entries={entries}
            settings={settings}
            attendanceMap={attendanceMap}
            onUpdateSettings={handleSaveSettings}
            onSaveAttendance={handleSaveAttendance}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onDeleteAttendance={handleDeleteAttendance}
            onNavigateToCalculator={() => handleSelectScreen('kalkulator')}
            onNavigateToHistory={() => handleSelectScreen('riwayat')}
            onNavigateToSalary={() => handleSelectScreen('gaji')}
            onOpenReceipt={handleOpenReceiptFromEntry}
            isPro={isPro}
            onOpenProModal={() => setIsProModalOpen(true)}
          />
        )}

        {currentScreen === 'kalkulator' && (
          <OvertimeCalculatorScreen
            settings={settings}
            onSaveEntry={handleSaveEntry}
            onOpenReceipt={handleOpenReceiptFromCalc}
            onOpenLegal={() => setIsLegalOpen(true)}
          />
        )}

        {currentScreen === 'gaji' && (
          <SalaryCalculatorScreen
            entries={entries}
            settings={settings}
            attendanceMap={attendanceMap}
          />
        )}

        {currentScreen === 'riwayat' && (
          <HistoryScreen
            entries={entries}
            settings={settings}
            attendanceMap={attendanceMap}
            onOpenAttendanceModal={handleOpenAttendanceModal}
            onDeleteAttendance={handleDeleteAttendance}
            onNavigateToCalculator={() => handleSelectScreen('kalkulator')}
            onEditEntry={(entry) => setEditingEntry(entry)}
            onDeleteEntry={handleDeleteEntry}
            onClearAllEntries={handleClearAllEntries}
            onOpenImportModal={() => setIsImportOpen(true)}
            onOpenReceipt={handleOpenReceiptFromEntry}
          />
        )}
      </main>

      {/* Footer without profile settings link */}
      <Footer
        onOpenLegal={() => setIsLegalOpen(true)}
      />

      {/* Onboarding Guide Modal (Tahap 1: Tampil Pertama Kali) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          // Setelah Panduan ditutup, jika Profil belum lengkap, wajibkan buka Profil Karyawan (Tahap 2)
          const currentSettings = getStoredSettings();
          if (!currentSettings.profileCompleted) {
            setIsProfileOpen(true);
          }
        }}
        onDontShowAgain={(dontShow) => {
          handleSaveSettings({
            ...settings,
            showOnboardingGuide: !dontShow,
          });
        }}
      />

      {/* Modals */}
      <LegalInfoModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setReceiptData(null);
        }}
        data={receiptData}
        appTheme={settings.theme}
        defaultNama={settings.namaKaryawan}
        defaultPerusahaan={settings.namaPerusahaan}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <EditEntryModal
        isOpen={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        entry={editingEntry}
        onSave={handleUpdateEntry}
      />

      {/* Global Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        selectedDate={attendanceModalDate}
        attendanceMap={attendanceMap}
        sistem={settings.defaultSistem}
        onSaveRecord={handleSaveAttendance}
        onDeleteRecord={handleDeleteAttendance}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetAllData={handleResetAllData}
        onClearEntries={handleClearAllEntries}
        onClearAttendance={handleClearAttendance}
        onOpenGuide={() => setIsOnboardingOpen(true)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          if (settings.profileCompleted) {
            setIsProfileOpen(false);
          }
        }}
        isMandatory={!settings.profileCompleted}
        settings={settings}
        onSaveProfile={(updated) => {
          handleSaveSettings(updated);
          setIsProfileOpen(false);
        }}
        isPro={isPro}
        onOpenProModal={() => {
          setIsProfileOpen(false);
          setIsProModalOpen(true);
        }}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Modal Upgrade PRO & Login Supabase */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
