import React from 'react';
import { Plane, Building2, CheckCircle2, ArrowRight, ShieldCheck, CreditCard, Wallet } from 'lucide-react';
import { CompanyConfig, CompanyId, PeriodInfo, Transaction } from '../types/finance';
import { computePeriodRows } from '../utils/calculations';
import { formatCurrencyIDR } from '../utils/formatters';

interface Props {
  companies: Record<CompanyId, CompanyConfig>;
  activeCompanyId: CompanyId;
  onSelectCompany: (id: CompanyId) => void;
  periods: PeriodInfo[];
  transactions: Transaction[];
}

export const CompanyPortalSelector: React.FC<Props> = ({
  companies,
  activeCompanyId,
  onSelectCompany,
  periods,
  transactions,
}) => {
  const getCompanyStats = (companyId: CompanyId) => {
    const compPeriods = periods.filter((p) => p.companyId === companyId);
    const compTransactions = transactions.filter((t) => t.companyId === companyId);
    const latestPeriod = compPeriods[0];
    const summary = latestPeriod
      ? computePeriodRows(latestPeriod, transactions).summary
      : { saldoAkhirPettyCash: 0, saldoAkhirBank: 0, saldoAkhirCashBank: 0 };

    return {
      periodCount: compPeriods.length,
      txCount: compTransactions.length,
      latestDate: latestPeriod ? latestPeriod.dateRangeLabel : '-',
      saldoKas: summary.saldoAkhirPettyCash,
      saldoBank: summary.saldoAkhirBank,
      totalLikuiditas: summary.saldoAkhirCashBank,
    };
  };

  const sjStats = getCompanyStats('SRIWIJAYA');
  const namStats = getCompanyStats('NAM');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Pilihan Pembukuan Perusahaan (Terpisah & Independen)</span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
            Pilih Perusahaan untuk Pencatatan Kas & Bank Operasional
          </h2>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          Perusahaan Aktif:{' '}
          <strong className="text-blue-900 font-bold">{companies[activeCompanyId].name}</strong>
        </div>
      </div>

      {/* 2 Big Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Choice 1: PT. SRIWIJAYA AIR */}
        <div
          onClick={() => onSelectCompany('SRIWIJAYA')}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            activeCompanyId === 'SRIWIJAYA'
              ? 'border-blue-700 bg-gradient-to-br from-blue-50/60 to-white ring-4 ring-blue-700/10 shadow-md'
              : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/70 hover:shadow-xs'
          }`}
        >
          {/* Active Ribbon */}
          {activeCompanyId === 'SRIWIJAYA' && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-blue-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>BUKU KAS SEDANG DIBUKA</span>
            </div>
          )}

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#002B7F] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
              <Plane className="w-6 h-6" />
            </div>
            <div className="flex-1 pr-16 sm:pr-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                  PT. SRIWIJAYA AIR
                </h3>
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 font-extrabold rounded-md">
                  SJ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan Kas Distrik SUB • Kode Transaksi: KSUB / BSUB
              </p>
            </div>
          </div>

          {/* Details & Bank Account */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 bg-slate-50/80 p-2 rounded-lg">
              <span className="flex items-center gap-1.5 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                Rekening Resmi Bank:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {companies.SRIWIJAYA.bankAccountTitle}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Saldo Kas</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {formatCurrencyIDR(sjStats.saldoKas)}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Saldo Bank</span>
                <span className="font-mono font-bold text-blue-900 text-xs">
                  {formatCurrencyIDR(sjStats.saldoBank)}
                </span>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <span className="text-[10px] text-blue-700 block font-semibold">Total Likuid</span>
                <span className="font-mono font-black text-blue-950 text-xs">
                  {formatCurrencyIDR(sjStats.totalLikuiditas)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {sjStats.periodCount} Periode • {sjStats.txCount} Transaksi
            </span>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeCompanyId === 'SRIWIJAYA'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white'
              }`}
            >
              <span>{activeCompanyId === 'SRIWIJAYA' ? 'Sedang Aktif' : 'Buka Kas Sriwijaya Air'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Choice 2: PT. NAM AIR */}
        <div
          onClick={() => onSelectCompany('NAM')}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            activeCompanyId === 'NAM'
              ? 'border-sky-600 bg-gradient-to-br from-sky-50/60 to-white ring-4 ring-sky-600/10 shadow-md'
              : 'border-slate-200 bg-white hover:border-sky-400 hover:bg-slate-50/70 hover:shadow-xs'
          }`}
        >
          {/* Active Ribbon */}
          {activeCompanyId === 'NAM' && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-sky-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>BUKU KAS SEDANG DIBUKA</span>
            </div>
          )}

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0066B2] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
              <Plane className="w-6 h-6" />
            </div>
            <div className="flex-1 pr-16 sm:pr-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                  PT. NAM AIR
                </h3>
                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 font-extrabold rounded-md">
                  IN
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan Kas Distrik SUB • Kode Transaksi: KSUB / BSUB
              </p>
            </div>
          </div>

          {/* Details & Bank Account */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-600 bg-sky-50/70 p-2 rounded-lg border border-sky-100 gap-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                <span>Rekening Resmi:</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">
                  Mulai Nov 2026
                </span>
              </span>
              <span className="font-mono font-bold text-sky-950">
                BNI VA 9881175300000002
              </span>
            </div>
            <div className="text-[10px] text-slate-400 px-1">
              * Histori s.d Oktober 2026 tercatat pada Rek. Tampungan Mandiri 1410004042206
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Saldo Kas</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {formatCurrencyIDR(namStats.saldoKas)}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Saldo Bank</span>
                <span className="font-mono font-bold text-sky-900 text-xs">
                  {formatCurrencyIDR(namStats.saldoBank)}
                </span>
              </div>
              <div className="bg-sky-50 p-2 rounded-lg">
                <span className="text-[10px] text-sky-700 block font-semibold">Total Likuid</span>
                <span className="font-mono font-black text-sky-950 text-xs">
                  {formatCurrencyIDR(namStats.totalLikuiditas)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {namStats.periodCount} Periode • {namStats.txCount} Transaksi
            </span>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeCompanyId === 'NAM'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 group-hover:bg-sky-600 group-hover:text-white'
              }`}
            >
              <span>{activeCompanyId === 'NAM' ? 'Sedang Aktif' : 'Buka Kas NAM Air'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
