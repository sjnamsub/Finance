import React from 'react';
import {
  Plane,
  Bell,
  BellRing,
  Calendar,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  Plus,
  Printer,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CompanyConfig, CompanyId, PeriodInfo, ReminderConfig } from '../types/finance';

interface Props {
  companies: Record<CompanyId, CompanyConfig>;
  activeCompanyId: CompanyId;
  onSelectCompany: (id: CompanyId) => void;
  activePeriod: PeriodInfo;
  allPeriods: PeriodInfo[];
  onOpenPeriodManager: () => void;
  onOpenReminderModal: () => void;
  onOpenNewTransaction: () => void;
  onOpenGuide?: () => void;
  reminderConfig: ReminderConfig;
  todayTransactionCount: number;
}

export const Header: React.FC<Props> = ({
  companies,
  activeCompanyId,
  onSelectCompany,
  activePeriod,
  onOpenPeriodManager,
  onOpenReminderModal,
  onOpenNewTransaction,
  onOpenGuide,
  reminderConfig,
  todayTransactionCount,
}) => {
  const activeCompany = companies[activeCompanyId];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      {/* Top Banner Alert if Today has not been recorded */}
      {todayTransactionCount === 0 && reminderConfig.enabled && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 mx-auto">
            <AlertCircle className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>
              <strong>Pengingat Harian Keuangan:</strong> Belum ada transaksi kas yang dicatat hari
              ini untuk {activeCompany.name}. Pastikan BKK/BMK diinput sebelum tutup kas!
            </span>
            <button
              onClick={onOpenNewTransaction}
              className="ml-2 underline font-bold hover:text-white transition-colors"
            >
              + Catat Sekarang
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 sm:py-3 gap-2.5">
          {/* Top/Left: Branding & Airline Switcher */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-md font-black text-sm shrink-0"
                style={{
                  backgroundColor:
                    activeCompanyId === 'SRIWIJAYA' ? '#002B7F' : '#0066B2',
                }}
              >
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 whitespace-nowrap">
                    {activeCompany.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-black text-white ${
                      activeCompanyId === 'SRIWIJAYA' ? 'bg-[#002B7F]' : 'bg-[#0066B2]'
                    }`}
                  >
                    {activeCompany.shortCode}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium hidden md:block">
                  Kas & Bank Distrik SUB (Surabaya)
                </div>
              </div>
            </div>

            {/* 2-Choice Company Switcher */}
            <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1] shadow-2xs">
              <button
                type="button"
                onClick={() => onSelectCompany('SRIWIJAYA')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCompanyId === 'SRIWIJAYA'
                    ? 'bg-[#002B7F] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-[#e2e8f0]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span>1. SRIWIJAYA</span>
                <span className="text-[10px] opacity-80 font-mono">SJ</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCompany('NAM')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCompanyId === 'NAM'
                    ? 'bg-[#0066B2] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-[#e2e8f0]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span>2. NAM AIR</span>
                <span className="text-[10px] opacity-80 font-mono">IN</span>
              </button>
            </div>
          </div>

          {/* Bottom/Right: Action Buttons & Period */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-wrap">
            {/* Guide Button */}
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                title="Panduan Cara Buat Transaksi KSUB & BSUB"
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#1e293b] transition-all text-xs font-bold shadow-2xs cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#1d4ed8]" />
                <span className="hidden sm:inline">Panduan</span>
              </button>
            )}

            {/* Active Period Pill Button */}
            <button
              onClick={onOpenPeriodManager}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white border border-[#334155] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#fbbf24]" />
              <span className="text-white text-xs">{activePeriod.dateRangeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {/* Daily Reminder Bell */}
            <button
              onClick={onOpenReminderModal}
              title="Pengaturan Pengingat Harian & Alarm Input Kas"
              className="relative p-2 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#e2e8f0] text-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              {todayTransactionCount === 0 && reminderConfig.enabled ? (
                <BellRing className="w-4 h-4 text-[#d97706] animate-pulse" />
              ) : (
                <Bell className="w-4 h-4 text-slate-700" />
              )}
              {todayTransactionCount === 0 && reminderConfig.enabled && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#dc2626] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Prominent Solid TAMBAH TRANSAKSI Button */}
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl text-xs sm:text-sm font-black shadow-md border-2 border-[#1e40af] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] text-white" />
              <span className="tracking-wide whitespace-nowrap">+ TRANSAKSI</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
