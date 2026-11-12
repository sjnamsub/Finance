import React, { useState, useEffect } from 'react';
import {
  CompanyId,
  PeriodInfo,
  ReminderConfig,
  Transaction,
} from './types/finance';
import { COMPANY_CONFIGS, INITIAL_PERIODS, INITIAL_TRANSACTIONS } from './utils/initialData';
import { Header } from './components/Header';
import { RekapTableView } from './components/RekapTableView';
import { TransactionModal } from './components/TransactionModal';
import { BkkBmkSlipModal } from './components/BkkBmkSlipModal';
import { RekapPrintView } from './components/RekapPrintView';
import { PeriodManagerModal } from './components/PeriodManagerModal';
import { DailyReminderModal } from './components/DailyReminderModal';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { CompanyPortalSelector } from './components/CompanyPortalSelector';
import { formatDisplayDate } from './utils/formatters';
import {
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  BarChart3,
  ListOrdered,
} from 'lucide-react';

const STORAGE_KEY_PERIODS = 'sj_nam_finance_periods_v1';
const STORAGE_KEY_TRANSACTIONS = 'sj_nam_finance_transactions_v1';
const STORAGE_KEY_REMINDER = 'sj_nam_finance_reminder_v1';
const STORAGE_KEY_ACTIVE_COMPANY = 'sj_nam_finance_active_company_v1';
const STORAGE_KEY_ACTIVE_PERIOD = 'sj_nam_finance_active_period_v1';

export default function App() {
  // 1. Core State
  const [activeCompanyId, setActiveCompanyId] = useState<CompanyId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_COMPANY);
    return saved === 'NAM' ? 'NAM' : 'SRIWIJAYA';
  });

  const [periods, setPeriods] = useState<PeriodInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PERIODS);
      if (saved) {
        const parsed: PeriodInfo[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = INITIAL_PERIODS.filter((p) => !existingIds.has(p.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PERIODS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TRANSACTIONS;
  });

  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMINDER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      enabled: true,
      time: '16:30',
      audioEnabled: true,
      browserNotificationsEnabled: false,
      lastCheckedDate: '',
    };
  });

  // Active period for the selected company
  const [currentPeriodId, setCurrentPeriodId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_PERIOD);
    if (saved) return saved;
    return 'SJ-2026-10-P1';
  });

  // Active Tab: Table view vs Analytics
  const [activeViewTab, setActiveViewTab] = useState<'TABLE' | 'ANALYTICS'>('TABLE');

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedSlipTransaction, setSelectedSlipTransaction] = useState<Transaction | null>(null);

  const [isRekapPrintOpen, setIsRekapPrintOpen] = useState(false);
  const [isPeriodManagerOpen, setIsPeriodManagerOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PERIODS, JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REMINDER, JSON.stringify(reminderConfig));
  }, [reminderConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_COMPANY, activeCompanyId);
  }, [activeCompanyId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PERIOD, currentPeriodId);
  }, [currentPeriodId]);

  // Ensure currentPeriodId belongs to activeCompany
  const companyPeriods = periods.filter((p) => p.companyId === activeCompanyId);
  const activePeriod =
    companyPeriods.find((p) => p.id === currentPeriodId) || companyPeriods[0] || INITIAL_PERIODS[0];

  // If switched company and period id mismatch, update
  useEffect(() => {
    if (!companyPeriods.some((p) => p.id === currentPeriodId) && companyPeriods.length > 0) {
      setCurrentPeriodId(companyPeriods[0].id);
    }
  }, [activeCompanyId, companyPeriods, currentPeriodId]);

  // Count transactions today for reminder logic
  const todayFormatted = formatDisplayDate(new Date().toISOString().slice(0, 10));
  const todayTransactions = transactions.filter(
    (t) =>
      t.companyId === activeCompanyId &&
      (t.tanggal === todayFormatted ||
        t.tanggal.toLowerCase().includes(new Date().getDate().toString()))
  );
  const todayTransactionCount = todayTransactions.length;

  // Background reminder scheduler check
  useEffect(() => {
    if (!reminderConfig.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMins = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;
      const todayDateStr = now.toISOString().slice(0, 10);

      if (
        currentTimeStr === reminderConfig.time &&
        reminderConfig.lastCheckedDate !== todayDateStr
      ) {
        // Trigger notification if no transactions today
        if (todayTransactionCount === 0) {
          if (reminderConfig.audioEnabled) {
            try {
              const audioCtx = new (window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
              gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.5);
            } catch {
              // ignore
            }
          }

          if (
            'Notification' in window &&
            Notification.permission === 'granted' &&
            reminderConfig.browserNotificationsEnabled
          ) {
            new Notification('Peringatan Kas Harian PT Sriwijaya Air & PT NAM Air', {
              body: 'Waktu tutup kas operasional telah tiba. Belum ada transaksi kas yang dicatat hari ini!',
            });
          }
        }

        setReminderConfig((prev) => ({
          ...prev,
          lastCheckedDate: todayDateStr,
        }));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [reminderConfig, todayTransactionCount]);

  // Transaction Handlers
  const handleSaveTransaction = (savedTx: Transaction) => {
    if (editingTransaction) {
      setTransactions((prev) => prev.map((t) => (t.id === savedTx.id ? savedTx : t)));
    } else {
      setTransactions((prev) => [...prev, savedTx]);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handlePrintSlip = (tx: Transaction) => {
    setSelectedSlipTransaction(tx);
    setIsSlipModalOpen(true);
  };

  const handleCreatePeriod = (newPeriod: PeriodInfo) => {
    setPeriods((prev) => [newPeriod, ...prev]);
    setCurrentPeriodId(newPeriod.id);
  };

  const handleResetData = () => {
    if (confirm('Kembalikan data ke contoh asli PT. SRIWIJAYA AIR & PT. NAM AIR Oktober 2026?')) {
      setPeriods(INITIAL_PERIODS);
      setTransactions(INITIAL_TRANSACTIONS);
      setCurrentPeriodId('SJ-2026-10-P1');
      setActiveCompanyId('SRIWIJAYA');
    }
  };

  const handleExportBackup = () => {
    const dataStr = JSON.stringify({ periods, transactions }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Keuangan_SJ_NAM_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.periods && parsed.transactions) {
          setPeriods(parsed.periods);
          setTransactions(parsed.transactions);
          alert('Data berhasil dipulihkan!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch {
        alert('Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
  };

  const activeCompany = COMPANY_CONFIGS[activeCompanyId];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header with navigation & reminder badge */}
      <Header
        companies={COMPANY_CONFIGS}
        activeCompanyId={activeCompanyId}
        onSelectCompany={setActiveCompanyId}
        activePeriod={activePeriod}
        allPeriods={periods}
        onOpenPeriodManager={() => setIsPeriodManagerOpen(true)}
        onOpenReminderModal={() => setIsReminderModalOpen(true)}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        reminderConfig={reminderConfig}
        todayTransactionCount={todayTransactionCount}
      />

      {/* Main App Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Prominent 2-Choice Company Portal Gateway */}
        <CompanyPortalSelector
          companies={COMPANY_CONFIGS}
          activeCompanyId={activeCompanyId}
          onSelectCompany={setActiveCompanyId}
          periods={periods}
          transactions={transactions}
        />

        {/* Sub-navigation tabs: Rekap Tabel vs Analitik */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => setActiveViewTab('TABLE')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewTab === 'TABLE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Buku Kas & Bank (Tabel 1:1)</span>
            </button>

            <button
              onClick={() => setActiveViewTab('ANALYTICS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewTab === 'ANALYTICS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analisis & Ringkasan Biaya</span>
            </button>
          </div>

          {/* Backup & System Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              title="Backup Data JSON"
              className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-semibold">Backup</span>
            </button>

            <label
              title="Restore Data JSON"
              className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-xs flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-semibold">Restore</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              onClick={handleResetData}
              title="Kembalikan Data Contoh Asli SJ & NAM"
              className="p-1.5 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-semibold">Reset Contoh</span>
            </button>
          </div>
        </div>

        {/* View Switch */}
        {activeViewTab === 'TABLE' ? (
          <RekapTableView
            company={activeCompany}
            period={activePeriod}
            allPeriods={periods}
            transactions={transactions}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            onEditTransaction={handleOpenEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onPrintSlip={handlePrintSlip}
            onPrintRekap={() => setIsRekapPrintOpen(true)}
            onManagePeriods={() => setIsPeriodManagerOpen(true)}
          />
        ) : (
          <DashboardAnalytics
            company={activeCompany}
            period={activePeriod}
            transactions={transactions}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">PT. SRIWIJAYA AIR & PT. NAM AIR</span>
            <span>•</span>
            <span>Sistem Operasional Keuangan Distrik Surabaya (SUB)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Mendukung Siklus Dwimingguan (1-15 & 16-30/31), BKK, BMK, dan Integrasi Excel
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        company={activeCompany}
        period={activePeriod}
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currentTransactionsCount={transactions.length}
      />

      <BkkBmkSlipModal
        transaction={selectedSlipTransaction}
        company={activeCompany}
        isOpen={isSlipModalOpen}
        onClose={() => {
          setIsSlipModalOpen(false);
          setSelectedSlipTransaction(null);
        }}
      />

      <RekapPrintView
        company={activeCompany}
        period={activePeriod}
        transactions={transactions}
        isOpen={isRekapPrintOpen}
        onClose={() => setIsRekapPrintOpen(false)}
      />

      <PeriodManagerModal
        company={activeCompany}
        periods={periods}
        currentPeriodId={activePeriod.id}
        transactions={transactions}
        isOpen={isPeriodManagerOpen}
        onClose={() => setIsPeriodManagerOpen(false)}
        onSelectPeriod={setCurrentPeriodId}
        onCreatePeriod={handleCreatePeriod}
      />

      <DailyReminderModal
        config={reminderConfig}
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSaveConfig={setReminderConfig}
        todayTransactionCount={todayTransactionCount}
      />
    </div>
  );
}
