import React from 'react';
import { Printer, X } from 'lucide-react';
import { CompanyConfig, PeriodInfo, Transaction } from '../types/finance';
import { computePeriodRows } from '../utils/calculations';
import { formatRupiah } from '../utils/formatters';

interface Props {
  company: CompanyConfig;
  period: PeriodInfo;
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
}

export const RekapPrintView: React.FC<Props> = ({
  company,
  period,
  transactions,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { rows, summary } = computePeriodRows(period, transactions);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Pratinjau Cetak Lembar Rekap Petty Cash & Bank (Format Resmi 1:1)
              </h2>
              <p className="text-xs text-slate-400">{period.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap (Landscape)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container */}
        <div className="overflow-auto p-4 sm:p-8 bg-slate-200/70 flex justify-center">
          <div
            id="printable-rekap"
            className="printable-area bg-white p-6 sm:p-8 shadow-xl text-[10px] w-full min-w-[1000px] max-w-[1250px] border border-slate-300"
            style={{
              fontFamily: '"Arial", "Helvetica", sans-serif',
              color: '#000',
            }}
          >
            {/* Title */}
            <div className="text-center mb-4">
              <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase text-black">
                {period.title}
              </h1>
            </div>

            {/* Official Table */}
            <table className="w-full border-collapse border-2 border-black text-[10px]">
              <thead>
                <tr className="border-b border-black text-center font-bold bg-slate-50">
                  <th rowSpan={2} className="border-r border-black p-1 w-16">
                    TANGGAL
                  </th>
                  <th rowSpan={2} className="border-r border-black p-1 w-24">
                    NO BUKTI<br />TRANSAKSI
                  </th>
                  <th rowSpan={2} className="border-r border-black p-1 text-center">
                    KETERANGAN
                  </th>
                  <th rowSpan={2} className="border-r border-black p-1 w-20">
                    PENERIMA
                  </th>
                  <th colSpan={4} className="border-r border-black p-1 border-b">
                    PETTY CASH
                  </th>
                  <th rowSpan={2} className="border-r border-black p-1 w-20">
                    SALDO<br />ADVANCE
                  </th>
                  <th rowSpan={2} className="border-r border-black p-1 w-20">
                    SALDO<br />PETTY CASH
                  </th>
                  <th colSpan={2} className="border-r border-black p-1 border-b">
                    {period.bankAccountTitle || company.bankAccountTitle}
                  </th>
                  <th rowSpan={2} className="border-r border-black p-1 w-20">
                    SALDO BANK
                  </th>
                  <th rowSpan={2} className="p-1 w-20">
                    SALDO CASH +<br />BANK
                  </th>
                </tr>
                <tr className="border-b-2 border-black text-center font-bold bg-slate-50 text-[9px]">
                  <th className="border-r border-black p-1 w-16">DEBET OPS</th>
                  <th className="border-r border-black p-1 w-16">KREDIT OPS</th>
                  <th className="border-r border-black p-1 w-16">DEBIT ADVANCE</th>
                  <th className="border-r border-black p-1 w-16">KREDIT ADVANCE</th>
                  <th className="border-r border-black p-1 w-16">DEBIT</th>
                  <th className="border-r border-black p-1 w-16">KREDIT</th>
                </tr>
              </thead>
              <tbody>
                {/* Saldo Awal Row */}
                <tr className="border-b border-black font-semibold text-black bg-slate-100/50">
                  <td className="border-r border-black p-1 text-center"></td>
                  <td className="border-r border-black p-1 text-center"></td>
                  <td className="border-r border-black p-1 font-bold text-center">SALDO</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1 text-right font-mono font-bold">
                    {formatRupiah(summary.saldoAwalPettyCash)}
                  </td>
                  <td className="border-r border-black p-1 text-right font-mono">-</td>
                  <td className="border-r border-black p-1 text-right font-mono">
                    {formatRupiah(summary.saldoAwalAdvance)}
                  </td>
                  <td className="border-r border-black p-1 text-right font-mono">-</td>
                  <td className="border-r border-black p-1 text-right font-mono">
                    {formatRupiah(summary.saldoAwalAdvance)}
                  </td>
                  <td className="border-r border-black p-1 text-right font-mono font-bold">
                    {formatRupiah(summary.saldoAwalPettyCash)}
                  </td>
                  <td className="border-r border-black p-1 text-right font-mono">-</td>
                  <td className="border-r border-black p-1 text-right font-mono">-</td>
                  <td className="border-r border-black p-1 text-right font-mono font-bold">
                    {formatRupiah(summary.saldoAwalBank)}
                  </td>
                  <td className="p-1 text-right font-mono font-bold">
                    {formatRupiah(summary.saldoAwalTotal)}
                  </td>
                </tr>

                {/* Transaction Rows */}
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-black/70 hover:bg-slate-50">
                    <td className="border-r border-black p-1 text-center whitespace-nowrap font-medium">
                      {row.tanggal}
                    </td>
                    <td className="border-r border-black p-1 text-center font-mono font-semibold whitespace-nowrap">
                      {row.noBukti}
                    </td>
                    <td className="border-r border-black p-1 leading-tight">
                      <div className="font-medium">{row.keterangan}</div>
                      {row.keteranganLines && row.keteranganLines.length > 1 && (
                        <div className="text-[9px] text-slate-600 mt-0.5 space-y-0.5">
                          {row.keteranganLines.slice(1).map((line, lIdx) => (
                            <div key={lIdx}>{line}</div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="border-r border-black p-1 text-center font-semibold uppercase">
                      {row.penerima}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono">
                      {formatRupiah(row.debetOps)}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono">
                      {formatRupiah(row.kreditOps)}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono">
                      {formatRupiah(row.debitAdvance)}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono">
                      {formatRupiah(row.kreditAdvance)}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono">
                      {formatRupiah(row.saldoAdvance)}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono font-semibold">
                      {formatRupiah(row.saldoPettyCash)}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono">
                      {formatRupiah(row.debitBank)}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono">
                      {formatRupiah(row.kreditBank)}
                    </td>
                    <td className="border-r border-black p-1 text-right font-mono font-semibold">
                      {formatRupiah(row.saldoBank)}
                    </td>
                    <td className="p-1 text-right font-mono font-bold">
                      {formatRupiah(row.saldoCashBank)}
                    </td>
                  </tr>
                ))}

                {/* Saldo Akhir Row */}
                <tr className="border-t-2 border-black font-bold bg-slate-100 text-black">
                  <td colSpan={4} className="border-r border-black p-1.5 text-center uppercase tracking-wider">
                    Saldo Akhir
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    {formatRupiah(summary.totalDebetOps)}
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    {formatRupiah(summary.totalKreditOps)}
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    {formatRupiah(summary.totalDebetAdvance)}
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    {formatRupiah(summary.totalKreditAdvance)}
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    {formatRupiah(summary.saldoAkhirAdvance)}
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono font-bold">
                    {formatRupiah(summary.saldoAkhirPettyCash)}
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    {formatRupiah(summary.totalDebitBank)}
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    {formatRupiah(summary.totalKreditBank)}
                  </td>
                  <td className="border-r border-black p-1.5 text-right font-mono font-bold">
                    {formatRupiah(summary.saldoAkhirBank)}
                  </td>
                  <td className="p-1.5 text-right font-mono font-black">
                    {formatRupiah(summary.saldoAkhirCashBank)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Official Signatures Section matching PDF */}
            <div className="mt-8 grid grid-cols-2 text-xs">
              <div>
                <div className="font-medium mb-1">
                  {period.signedDate || `${company.city}, ${period.dateRangeLabel}`}
                </div>
                <div className="font-semibold mb-12">Dibuat oleh,</div>
                {/* Signature visual placeholder */}
                <div className="w-36 border-b border-black mb-1">
                  <div className="italic text-slate-400 text-[10px] select-none pl-2">
                    {period.makerName || company.defaultMakerName}
                  </div>
                </div>
                <div className="font-bold underline">{period.makerName || company.defaultMakerName}</div>
                <div className="font-semibold text-slate-700">{period.makerTitle || company.defaultMakerTitle}</div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="font-medium mb-1 opacity-0">Placeholder</div>
                <div className="font-semibold mb-12">Disetujui oleh,</div>
                <div className="w-36 border-b border-black mb-1">
                  <div className="italic text-slate-400 text-[10px] select-none pr-2 text-right">
                    {period.approverName || company.defaultApproverName}
                  </div>
                </div>
                <div className="font-bold underline">{period.approverName || company.defaultApproverName}</div>
                <div className="font-semibold text-slate-700">{period.approverTitle || company.defaultApproverTitle}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Orientasi: <strong>Landscape</strong>. Pastikan memilih &apos;Landscape&apos; di dialog printer browser.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
