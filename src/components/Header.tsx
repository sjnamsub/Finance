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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Branding & Airlines Switcher */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-black text-sm tracking-tighter"
                style={{
                  backgroundColor:
                    activeCompanyId === 'SRIWIJAYA' ? '#002B7F' : '#0066B2',
                }}
              >
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                    {activeCompany.name}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-black text-white ${
                      activeCompanyId === 'SRIWIJAYA' ? 'bg-[#002B7F]' : 'bg-[#0066B2]'
                    }`}
                  >
                    {activeCompany.shortCode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Buku Kas & Bank Distrik SUB (Surabaya) • Terpisah & Terintegrasi
                </div>
              </div>
            </div>

            {/* Prominent 2-Choice Company Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => onSelectCompany('SRIWIJAYA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeCompanyId === 'SRIWIJAYA'
                    ? 'bg-[#002B7F] text-white shadow-sm ring-1 ring-[#002B7F]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>1. SRIWIJAYA AIR</span>
                <span className="text-[10px] opacity-80 font-mono">SJ</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCompany('NAM')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeCompanyId === 'NAM'
                    ? 'bg-[#0066B2] text-white shadow-sm ring-1 ring-[#0066B2]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>2. NAM AIR</span>
                <span className="text-[10px] opacity-80 font-mono">IN</span>
              </button>
            </div>
          </div>

          {/* Right: Period Dropdown, Reminder Bell, New Transaction Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Period Pill Button */}
            <button
              onClick={onOpenPeriodManager}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400 leading-none">Periode Aktif</div>
                <div className="font-bold text-slate-800 leading-tight">
                  {activePeriod.dateRangeLabel}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Daily Reminder Bell with Notification Badge */}
            <button
              onClick={onOpenReminderModal}
              title="Pengaturan Pengingat Harian & Alarm Input Kas"
              className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              {todayTransactionCount === 0 && reminderConfig.enabled ? (
                <BellRing className="w-5 h-5 text-amber-500 animate-pulse" />
              ) : (
                <Bell className="w-5 h-5 text-slate-600" />
              )}
              {todayTransactionCount === 0 && reminderConfig.enabled && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-ping" />
              )}
            </button>

            {/* Quick Add Button */}
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Input Transaksi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
