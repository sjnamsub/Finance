import React, { useState } from 'react';
import {
  Printer,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  FileText,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Building,
} from 'lucide-react';
import { CompanyConfig, ComputedRow, PeriodInfo, PeriodSummary, Transaction } from '../types/finance';
import { computePeriodRows } from '../utils/calculations';
import { exportPeriodToExcel, exportAllPeriodsToExcel } from '../utils/excelExport';
import { formatRupiah, formatCurrencyIDR } from '../utils/formatters';

interface Props {
  company: CompanyConfig;
  period: PeriodInfo;
  allPeriods: PeriodInfo[];
  transactions: Transaction[];
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onPrintSlip: (tx: Transaction) => void;
  onPrintRekap: () => void;
  onManagePeriods: () => void;
}

export const RekapTableView: React.FC<Props> = ({
  company,
  period,
  allPeriods,
  transactions,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onPrintSlip,
  onPrintRekap,
  onManagePeriods,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const { rows, summary } = computePeriodRows(period, transactions);

  // Filtered rows for display
  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.noBukti.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tanggal.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'KAS_KELUAR') return r.kreditOps > 0;
    if (filterType === 'KAS_MASUK') return r.debetOps > 0;
    if (filterType === 'BANK') return r.debitBank > 0 || r.kreditBank > 0;
    if (filterType === 'ADVANCE') return r.debitAdvance > 0 || r.kreditAdvance > 0;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls & Metrics Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Buku Kas & Bank Dwimingguan
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">Distrik {company.stationCode}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {period.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Input Transaksi</span>
            </button>

            <button
              onClick={onPrintRekap}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Rekap 1:1</span>
            </button>

            <div className="relative group">
              <button
                onClick={() => exportPeriodToExcel(company, period, transactions)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>

            <button
              onClick={() => exportAllPeriodsToExcel(company, allPeriods, transactions)}
              title="Download seluruh periode 1-15 & 16-Akhir dalam satu workbook Excel terpadu"
              className="inline-flex items-center gap-1 px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Semua Periode</span>
            </button>

            <button
              onClick={onManagePeriods}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Ganti / Tambah Periode</span>
            </button>
          </div>
        </div>

        {/* Live Liquidity Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Saldo Petty Cash
            </span>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5 font-mono">
              {formatCurrencyIDR(summary.saldoAkhirPettyCash)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
              <span>Awal: {formatRupiah(summary.saldoAwalPettyCash)}</span>
              <span className="text-red-600">Keluar: {formatRupiah(summary.totalKreditOps)}</span>
            </div>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Saldo Bank ({company.bankName})
            </span>
            <div className="text-base sm:text-lg font-black text-blue-900 mt-0.5 font-mono">
              {formatCurrencyIDR(summary.saldoAkhirBank)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
              <span>Awal: {formatRupiah(summary.saldoAwalBank)}</span>
              <span className="text-emerald-600">Masuk: {formatRupiah(summary.totalDebitBank)}</span>
            </div>
          </div>

          <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200/60">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
              Saldo Kasbon (Advance)
            </span>
            <div className="text-base sm:text-lg font-black text-purple-950 mt-0.5 font-mono">
              {formatCurrencyIDR(summary.saldoAkhirAdvance)}
            </div>
            <div className="text-[10px] text-purple-600 mt-1 flex justify-between">
              <span>Debit: {formatRupiah(summary.totalDebetAdvance)}</span>
              <span>Kredit: {formatRupiah(summary.totalKreditAdvance)}</span>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-xs">
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
              Total Likuiditas (Cash + Bank)
            </span>
            <div className="text-base sm:text-lg font-black text-white mt-0.5 font-mono">
              {formatCurrencyIDR(summary.saldoAkhirCashBank)}
            </div>
            <div className="text-[10px] text-blue-200 mt-1 flex justify-between">
              <span>Kas Fisik + Rekening</span>
              <span>100% Cocok</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, nomor bukti, atau penerima..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {[
            { id: 'ALL', label: 'Semua Transaksi' },
            { id: 'KAS_KELUAR', label: 'Kas Keluar (BKK)' },
            { id: 'KAS_MASUK', label: 'Kas Masuk (BMK)' },
            { id: 'BANK', label: 'Bank & Droping' },
            { id: 'ADVANCE', label: 'Kasbon Advance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table - Exact Columns Matching Airline Physical PDF */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
            <thead>
              {/* Row 1 Headers */}
              <tr className="bg-slate-900 text-white text-[11px] font-bold">
                <th rowSpan={2} className="p-2.5 border-r border-slate-800 text-center w-24">
                  TANGGAL
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-slate-800 text-center w-36">
                  NO BUKTI TRANSAKSI
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-slate-800">
                  KETERANGAN
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-slate-800 text-center w-28">
                  PENERIMA
                </th>
                <th colSpan={4} className="p-2 border-r border-slate-800 text-center bg-slate-800">
                  PETTY CASH
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-slate-800 text-right w-28 bg-slate-850">
                  SALDO ADVANCE
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-slate-800 text-right w-32 bg-slate-850">
                  SALDO PETTY CASH
                </th>
                <th colSpan={2} className="p-2 border-r border-slate-800 text-center bg-blue-900">
                  {period.bankAccountTitle || company.bankAccountTitle}
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-slate-800 text-right w-28 bg-blue-950">
                  SALDO BANK
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-slate-800 text-right w-36 bg-indigo-950">
                  SALDO CASH + BANK
                </th>
                <th rowSpan={2} className="p-2.5 text-center w-28">
                  AKSI / SLIP
                </th>
              </tr>
              {/* Row 2 Subheaders */}
              <tr className="bg-slate-800 text-slate-200 text-[10px] font-bold">
                <th className="p-1.5 border-r border-slate-700 text-right w-24">DEBET OPS</th>
                <th className="p-1.5 border-r border-slate-700 text-right w-24">KREDIT OPS</th>
                <th className="p-1.5 border-r border-slate-700 text-right w-24">DEBIT ADVANCE</th>
                <th className="p-1.5 border-r border-slate-700 text-right w-24">KREDIT ADVANCE</th>
                <th className="p-1.5 border-r border-slate-700 text-right w-24 bg-blue-900/80">DEBIT</th>
                <th className="p-1.5 border-r border-slate-700 text-right w-24 bg-blue-900/80">KREDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Row 1: Saldo Awal */}
              <tr className="bg-amber-50/60 font-semibold text-slate-800">
                <td className="p-2 text-center text-slate-400">-</td>
                <td className="p-2 text-center text-slate-400 font-mono">-</td>
                <td className="p-2 font-bold text-amber-900 uppercase">SALDO AWAL PERIODE</td>
                <td className="p-2 text-center text-slate-400">-</td>
                <td className="p-2 text-right font-mono font-bold text-slate-900">
                  {formatRupiah(summary.saldoAwalPettyCash)}
                </td>
                <td className="p-2 text-right font-mono text-slate-400">-</td>
                <td className="p-2 text-right font-mono text-slate-400">
                  {formatRupiah(summary.saldoAwalAdvance)}
                </td>
                <td className="p-2 text-right font-mono text-slate-400">-</td>
                <td className="p-2 text-right font-mono text-slate-700">
                  {formatRupiah(summary.saldoAwalAdvance)}
                </td>
                <td className="p-2 text-right font-mono font-bold text-slate-900 bg-amber-100/40">
                  {formatRupiah(summary.saldoAwalPettyCash)}
                </td>
                <td className="p-2 text-right font-mono text-slate-400">-</td>
                <td className="p-2 text-right font-mono text-slate-400">-</td>
                <td className="p-2 text-right font-mono font-bold text-blue-900 bg-blue-50/40">
                  {formatRupiah(summary.saldoAwalBank)}
                </td>
                <td className="p-2 text-right font-mono font-black text-indigo-900 bg-indigo-50/40">
                  {formatRupiah(summary.saldoAwalTotal)}
                </td>
                <td className="p-2 text-center text-slate-400 text-[10px]">Awal</td>
              </tr>

              {/* Data Rows */}
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 transition-colors group text-slate-800"
                >
                  <td className="p-2.5 text-center whitespace-nowrap font-medium text-slate-600">
                    {row.tanggal}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                    {row.noBukti}
                  </td>
                  <td className="p-2.5 leading-snug">
                    <div className="font-semibold text-slate-900">{row.keterangan}</div>
                    {row.kodeRek && (
                      <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono">
                        {row.kodeRek}
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-700 uppercase">
                    {row.penerima}
                  </td>
                  <td className="p-2.5 text-right font-mono font-medium text-emerald-700">
                    {formatRupiah(row.debetOps)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-medium text-red-700">
                    {formatRupiah(row.kreditOps)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-purple-700">
                    {formatRupiah(row.debitAdvance)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-purple-700">
                    {formatRupiah(row.kreditAdvance)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-600">
                    {formatRupiah(row.saldoAdvance)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                    {formatRupiah(row.saldoPettyCash)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-blue-700">
                    {formatRupiah(row.debitBank)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-amber-700">
                    {formatRupiah(row.kreditBank)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-blue-900 bg-blue-50/30">
                    {formatRupiah(row.saldoBank)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-black text-indigo-900 bg-indigo-50/30">
                    {formatRupiah(row.saldoCashBank)}
                  </td>
                  <td className="p-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onPrintSlip(row)}
                        title={`Cetak Slip ${row.voucherType} 1:1`}
                        className={`p-1.5 rounded-lg border font-bold text-[10px] inline-flex items-center gap-1 ${
                          row.voucherType === 'BKK'
                            ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                            : 'text-slate-800 bg-slate-100 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{row.voucherType}</span>
                      </button>
                      <button
                        onClick={() => onEditTransaction(row)}
                        title="Edit Transaksi"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus transaksi ${row.noBukti} (${row.keterangan})?`)) {
                            onDeleteTransaction(row.id);
                          }
                        }}
                        title="Hapus Transaksi"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-slate-400">
                    Belum ada transaksi pada periode ini atau tidak ada data yang cocok dengan
                    pencarian.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Saldo Akhir Footer */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-700">
                <td colSpan={4} className="p-3 text-center uppercase tracking-wider">
                  SALDO AKHIR (Total Periode)
                </td>
                <td className="p-3 text-right font-mono text-emerald-400">
                  {formatRupiah(summary.totalDebetOps)}
                </td>
                <td className="p-3 text-right font-mono text-red-400">
                  {formatRupiah(summary.totalKreditOps)}
                </td>
                <td className="p-3 text-right font-mono text-purple-300">
                  {formatRupiah(summary.totalDebetAdvance)}
                </td>
                <td className="p-3 text-right font-mono text-purple-300">
                  {formatRupiah(summary.totalKreditAdvance)}
                </td>
                <td className="p-3 text-right font-mono text-slate-300">
                  {formatRupiah(summary.saldoAkhirAdvance)}
                </td>
                <td className="p-3 text-right font-mono text-yellow-300 font-black bg-slate-800">
                  {formatRupiah(summary.saldoAkhirPettyCash)}
                </td>
                <td className="p-3 text-right font-mono text-blue-300">
                  {formatRupiah(summary.totalDebitBank)}
                </td>
                <td className="p-3 text-right font-mono text-blue-300">
                  {formatRupiah(summary.totalKreditBank)}
                </td>
                <td className="p-3 text-right font-mono text-blue-200 font-black bg-blue-950">
                  {formatRupiah(summary.saldoAkhirBank)}
                </td>
                <td className="p-3 text-right font-mono text-emerald-300 font-black bg-indigo-950">
                  {formatRupiah(summary.saldoAkhirCashBank)}
                </td>
                <td className="p-3 text-center text-[10px] text-slate-400">Balance OK</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
