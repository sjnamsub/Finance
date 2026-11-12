import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Users,
  CheckCircle2,
  DollarSign,
  Fuel,
  Zap,
  Phone,
  Briefcase,
} from 'lucide-react';
import { CompanyConfig, PeriodInfo, Transaction } from '../types/finance';
import { computePeriodRows } from '../utils/calculations';
import { formatCurrencyIDR, formatRupiah } from '../utils/formatters';

interface Props {
  company: CompanyConfig;
  period: PeriodInfo;
  transactions: Transaction[];
}

export const DashboardAnalytics: React.FC<Props> = ({ company, period, transactions }) => {
  const { rows, summary } = computePeriodRows(period, transactions);

  // Group expenses by category / keyword
  const categoryMap: Record<string, number> = {};
  const recipientMap: Record<string, number> = {};

  rows.forEach((r) => {
    const expense = r.kreditOps;
    if (expense > 0) {
      // Guess category from keterangan or kodeRek
      let cat = 'Lain-lain / Umum';
      const desc = r.keterangan.toLowerCase();
      if (desc.includes('bbm') || desc.includes('tol') || desc.includes('parkir') || desc.includes('mobil') || desc.includes('kend')) {
        cat = 'BBM & Kendaraan Operasional';
      } else if (desc.includes('listrik') || desc.includes('token') || desc.includes('pdam') || desc.includes('ipl')) {
        cat = 'Listrik, PDAM & Utilitas';
      } else if (desc.includes('pulsa') || desc.includes('hp') || desc.includes('cs')) {
        cat = 'Komunikasi & Pulsa CS';
      } else if (desc.includes('koper') || desc.includes('bagasi') || desc.includes('kompensasi')) {
        cat = 'Klaim & Kompensasi Bagasi';
      } else if (desc.includes('crew') || desc.includes('lounge')) {
        cat = 'Lounge & Akomodasi Crew';
      } else if (desc.includes('wafer') || desc.includes('roti') || desc.includes('onboard')) {
        cat = 'Service Onboard / Konsumsi';
      } else if (desc.includes('pas') || desc.includes('sk5c') || desc.includes('lanudal')) {
        cat = 'Perijinan & Pas Bandara';
      }

      categoryMap[cat] = (categoryMap[cat] || 0) + expense;

      // Recipient
      const rec = r.penerima.trim() || 'LAINNYA';
      recipientMap[rec] = (recipientMap[rec] || 0) + expense;
    }
  });

  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topRecipients = Object.entries(recipientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalExpense = summary.totalKreditOps || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Distribusi Biaya Operasional</h3>
              <p className="text-xs text-slate-500">Berdasarkan pos pengeluaran periode ini</p>
            </div>
          </div>
          <span className="text-xs font-black text-slate-800 font-mono">
            {formatCurrencyIDR(summary.totalKreditOps)}
          </span>
        </div>

        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map(([name, amount], idx) => {
              const pct = Math.round((amount / totalExpense) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{name}</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {formatCurrencyIDR(amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400 py-4 text-center">
              Belum ada data pengeluaran operasional pada periode ini.
            </div>
          )}
        </div>
      </div>

      {/* Audit Reconciliation & Top Disbursers */}
      <div className="space-y-4">
        {/* Real-time Math Integrity Box */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm">Status Rekonsiliasi & Audit Kas</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-white/10 p-3 rounded-xl backdrop-blur-md">
            <div>
              <span className="text-slate-300 block text-[11px]">Total Masuk (Cash + Bank):</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">
                + {formatCurrencyIDR(summary.totalDebetOps + summary.totalDebitBank)}
              </span>
            </div>
            <div>
              <span className="text-slate-300 block text-[11px]">Total Keluar (Cash + Bank):</span>
              <span className="font-mono font-bold text-rose-300 text-sm">
                - {formatCurrencyIDR(summary.totalKreditOps + summary.totalKreditBank)}
              </span>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-300 leading-relaxed">
            Perhitungan saldo awal ditambah seluruh mutasi kas dan bank secara konsisten
            menghasilkan Saldo Akhir{' '}
            <strong className="text-white font-mono">
              {formatCurrencyIDR(summary.saldoAkhirCashBank)}
            </strong>
            . Selaras untuk pelaporan ke Head Office (HO).
          </div>
        </div>

        {/* Top Recipients */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Penerima Dana Terbanyak (Petugas Operasional)
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {topRecipients.map(([name, amt], i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-black text-slate-900">{name}</div>
                <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                  {formatCurrencyIDR(amt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
