import React, { useState } from 'react';
import { Printer, X, CheckCircle2, Eye, PenTool, Sparkles, Layers } from 'lucide-react';
import { CompanyConfig, Transaction, VoucherItem } from '../types/finance';
import { formatRupiah } from '../utils/formatters';
import { terbilang } from '../utils/terbilang';

interface Props {
  transaction: Transaction | null;
  company: CompanyConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTransaction?: (updatedTx: Transaction) => void;
}

export const BkkBmkSlipModal: React.FC<Props> = ({
  transaction,
  company,
  isOpen,
  onClose,
}) => {
  const [showSignatures, setShowSignatures] = useState(true);
  const [copyColor, setCopyColor] = useState<'WHITE' | 'RED' | 'BLUE'>('WHITE');

  if (!isOpen || !transaction) return null;

  const isBKK = transaction.voucherType === 'BKK';
  // Red color matching scan 011_aee78d03.pdf (#991b1b or #b91c1c), Black for BMK (#0f172a)
  const themeColor = isBKK ? '#991b1b' : '#0f172a';
  const tableBorderColor = isBKK ? '#991b1b' : '#0f172a';

  // Compute total
  const totalAmount =
    isBKK
      ? transaction.kreditOps || transaction.kreditBank || transaction.kreditAdvance || 0
      : transaction.debetOps || transaction.debitBank || transaction.debitAdvance || 0;

  // Flatten / format display items
  let displayItems: {
    no: string | number;
    keterangan: string;
    subLines?: string[];
    dk: string;
    kodeRek: string;
    jumlah?: number;
  }[] = [];

  if (transaction.items && transaction.items.length > 0) {
    displayItems = transaction.items.map((it, idx) => ({
      no: it.no || idx + 1,
      keterangan: it.keterangan,
      dk: it.dk || (isBKK ? 'K' : 'D'),
      kodeRek: it.kodeRek || '',
      jumlah: it.jumlah,
    }));
  } else {
    // If multiple lines in keterangan
    const lines = transaction.keteranganLines || transaction.keterangan.split('\n');
    displayItems = [
      {
        no: 1,
        keterangan: lines[0] || transaction.keterangan,
        subLines: lines.slice(1),
        dk: isBKK ? 'K' : 'D',
        kodeRek: transaction.kodeRek || (isBKK ? '5100-OPS' : '1101-KAS'),
        jumlah: totalAmount,
      },
    ];
  }

  // Exactly 6 rows grid as pre-printed stationery on the physical form
  const fixedRowCount = 6;
  const tableRows = Array.from({ length: fixedRowCount }, (_, i) => displayItems[i] || null);

  const terbilangText = terbilang(totalAmount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="no-print flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isBKK ? 'bg-red-500 ring-4 ring-red-500/20' : 'bg-slate-400 ring-4 ring-slate-400/20'
              }`}
            />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>{isBKK ? 'Pratinjau Cetak BUKTI KELUAR KAS/BANK (BKK)' : 'Pratinjau Cetak BUKTI MASUK KAS/BANK (BMK)'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">
                  {transaction.noBukti}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Ukuran dan Bentuk 1:1 Presisi Menyerupai Formulir Cetak Resmi Tanpa Merubah Skala
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Signature toggle */}
            <button
              onClick={() => setShowSignatures(!showSignatures)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                showSignatures
                  ? 'bg-blue-950 text-blue-200 border-blue-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{showSignatures ? 'Tanda Tangan: Tampil' : 'Tanda Tangan: Kosong'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Voucher (1:1)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container - Scrollable on Screen, Exact Sizing on Print */}
        <div className="overflow-auto p-4 sm:p-8 bg-slate-200/80 flex justify-center">
          {/* EXACT PHYSICAL VOUCHER SLIP (Strict 200mm x 132mm Dimensions) */}
          <div
            id="printable-slip"
            className="printable-area voucher-sheet bg-white p-5 sm:p-6 shadow-xl text-black border border-slate-300 relative"
            style={{
              width: '205mm',
              maxWidth: '100%',
              minHeight: '135mm',
              boxSizing: 'border-box',
              fontFamily: '"Times New Roman", Times, serif',
            }}
          >
            {/* Top Right: No. and Tgl. */}
            <div className="flex justify-end mb-1">
              <div className="w-56 text-xs text-right space-y-0.5">
                <div className="flex items-center justify-end">
                  <span className="font-bold text-slate-800 mr-2">No.</span>
                  <span className="font-bold font-mono text-sm underline tracking-wide text-black px-1">
                    {transaction.noBukti}
                  </span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="font-bold text-slate-800 mr-2">Tgl.</span>
                  <span className="font-bold underline text-xs text-black px-1">
                    {transaction.tanggal}
                  </span>
                </div>
              </div>
            </div>

            {/* Title: BUKTI KELUAR KAS/BANK or BUKTI MASUK KAS/BANK */}
            <div className="text-center -mt-3 mb-2">
              <h1
                className="text-lg sm:text-xl font-bold uppercase tracking-wide inline-block"
                style={{
                  color: themeColor,
                  letterSpacing: '1px',
                }}
              >
                {isBKK ? 'BUKTI KELUAR KAS/BANK' : 'BUKTI MASUK KAS/BANK'}
              </h1>
            </div>

            {/* Recipient / Sender Line */}
            <div className="mb-2 text-xs flex items-center">
              <span className="font-bold whitespace-nowrap text-slate-800">
                {isBKK ? 'Dibayarkan kepada :' : 'Diterima dari :'}
              </span>
              <span className="ml-2 font-bold underline text-sm tracking-wide text-black font-sans">
                {transaction.penerima || '__________________________________________'}
              </span>
            </div>

            {/* Main Table Matching Physical Paper Scan (Exact 6 Rows) */}
            <div
              className="border-2 overflow-hidden"
              style={{ borderColor: tableBorderColor }}
            >
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr
                    className="border-b-2 text-center font-bold"
                    style={{ borderColor: tableBorderColor }}
                  >
                    <th
                      className="border-r-2 p-1 w-10 text-center font-bold"
                      style={{ borderColor: tableBorderColor }}
                    >
                      NO.
                    </th>
                    <th
                      className="border-r-2 p-1 text-center font-bold"
                      style={{ borderColor: tableBorderColor }}
                    >
                      KETERANGAN
                    </th>
                    <th
                      className="border-r-2 p-1 w-12 text-center font-bold"
                      style={{ borderColor: tableBorderColor }}
                    >
                      D / K
                    </th>
                    <th
                      className="border-r-2 p-1 w-24 text-center font-bold"
                      style={{ borderColor: tableBorderColor }}
                    >
                      KODE REK.
                    </th>
                    <th className="p-1 w-32 text-center font-bold">JUMLAH</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b"
                      style={{
                        borderColor: tableBorderColor,
                        height: '24px',
                        minHeight: '24px',
                      }}
                    >
                      <td
                        className="border-r-2 p-0.5 text-center font-medium"
                        style={{ borderColor: tableBorderColor }}
                      >
                        {item ? item.no : ''}
                      </td>
                      <td
                        className="border-r-2 px-2 py-0.5 font-medium leading-tight whitespace-pre-line"
                        style={{ borderColor: tableBorderColor }}
                      >
                        {item ? (
                          <div>
                            <span className="font-semibold text-black">{item.keterangan}</span>
                            {item.subLines && item.subLines.length > 0 && (
                              <div className="pl-3 text-[10px] text-slate-700 space-y-0.5">
                                {item.subLines.map((line, lIdx) => (
                                  <div key={lIdx}>{line}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          ''
                        )}
                      </td>
                      <td
                        className="border-r-2 p-0.5 text-center font-bold"
                        style={{ borderColor: tableBorderColor }}
                      >
                        {item ? item.dk : ''}
                      </td>
                      <td
                        className="border-r-2 px-1 py-0.5 font-mono text-center font-semibold text-[10px]"
                        style={{ borderColor: tableBorderColor }}
                      >
                        {item ? item.kodeRek : ''}
                      </td>
                      <td className="px-2 py-0.5 text-right font-mono font-bold text-xs text-black">
                        {item && item.jumlah !== undefined && item.jumlah > 0
                          ? formatRupiah(item.jumlah, false)
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Sub-table: Bank, A/C No, BG/Cheque, Jumlah & Rupiah */}
              <div
                className="border-t-2 grid grid-cols-12 text-xs"
                style={{ borderColor: tableBorderColor }}
              >
                {/* Left side: Bank, A/C No, BG/Cheque, Terbilang Rupiah */}
                <div
                  className="col-span-8 border-r-2 p-1.5 space-y-1"
                  style={{ borderColor: tableBorderColor }}
                >
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center">
                      <span className="w-12 font-bold text-slate-800">Bank :</span>
                      <span className="underline font-semibold font-sans">
                        {transaction.bankName || company.bankName || '__________________'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-14 font-bold text-slate-800">A/C No. :</span>
                      <span className="underline font-mono text-[10px]">
                        {transaction.acNo || company.bankAccountTitle.split('-')[1]?.trim() || company.bankAccountTitle.split('VA')[1]?.trim() || '__________________'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-1 items-center text-[11px]">
                    <div className="col-span-3 font-bold text-slate-800">BG/Cheque</div>
                    <div className="col-span-9 flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 font-semibold">NO</span>
                      <span className="underline font-mono">
                        {transaction.bgChequeNo || '__________________'}
                      </span>
                      <span className="text-[10px] text-slate-600 font-semibold ml-2">TGL</span>
                      <span className="underline font-mono">
                        {transaction.bgChequeDate || '__________________'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1 pt-0.5 text-[11px]">
                    <span className="font-bold text-slate-800 whitespace-nowrap">Rupiah :</span>
                    <span className="italic font-bold text-xs uppercase leading-tight underline font-serif">
                      {terbilangText}
                    </span>
                  </div>
                </div>

                {/* Right side: Jumlah Grand Total */}
                <div className="col-span-4 p-1.5 flex flex-col justify-between">
                  <div
                    className="flex justify-between items-center text-xs font-bold border-b pb-1"
                    style={{ borderColor: tableBorderColor }}
                  >
                    <span>Jumlah</span>
                    <span className="font-mono text-sm sm:text-base font-black">
                      {formatRupiah(totalAmount, false)}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 text-right">
                    Mata Uang: IDR (Rupiah)
                  </div>
                </div>
              </div>

              {/* 5-Column Signatures Approval Box (Diterima, Diperiksa, Disetujui, Dibayar, Bagian Akt) */}
              <div
                className="border-t-2 grid grid-cols-5 text-center text-xs"
                style={{ borderColor: tableBorderColor }}
              >
                {/* Diterima oleh */}
                <div
                  className="border-r-2 p-1 flex flex-col justify-between h-24"
                  style={{ borderColor: tableBorderColor }}
                >
                  <div className="font-bold text-[11px]">Diterima oleh,</div>
                  {showSignatures ? (
                    <div className="text-center font-bold font-sans text-xs underline">
                      {transaction.diterimaOleh || transaction.penerima || 'DM SUB'}
                    </div>
                  ) : (
                    <div className="h-10" />
                  )}
                  <div className="text-[10px] text-slate-500">( .................... )</div>
                </div>

                {/* Diperiksa oleh */}
                <div
                  className="border-r-2 p-1 flex flex-col justify-between h-24"
                  style={{ borderColor: tableBorderColor }}
                >
                  <div className="font-bold text-[11px]">Diperiksa oleh,</div>
                  {showSignatures ? (
                    <div className="text-center font-bold font-sans text-xs underline">
                      {transaction.diperiksaOleh || company.defaultMakerName}
                    </div>
                  ) : (
                    <div className="h-10" />
                  )}
                  <div className="text-[10px] text-slate-500">{company.defaultMakerTitle}</div>
                </div>

                {/* Disetujui oleh */}
                <div
                  className="border-r-2 p-1 flex flex-col justify-between h-24"
                  style={{ borderColor: tableBorderColor }}
                >
                  <div className="font-bold text-[11px]">Disetujui oleh,</div>
                  {showSignatures ? (
                    <div className="text-center font-bold font-sans text-xs underline">
                      {transaction.disetujuiOleh || company.defaultApproverName}
                    </div>
                  ) : (
                    <div className="h-10" />
                  )}
                  <div className="text-[10px] text-slate-500">{company.defaultApproverTitle}</div>
                </div>

                {/* Dibayar oleh */}
                <div
                  className="border-r-2 p-1 flex flex-col justify-between h-24"
                  style={{ borderColor: tableBorderColor }}
                >
                  <div className="font-bold text-[11px]">Dibayar oleh,</div>
                  {showSignatures ? (
                    <div className="text-center font-bold font-sans text-xs underline">
                      {transaction.dibayarOleh || company.defaultMakerName}
                    </div>
                  ) : (
                    <div className="h-10" />
                  )}
                  <div className="text-[10px] text-slate-500">Kasir / FIN</div>
                </div>

                {/* Bagian Akunting */}
                <div className="p-1 flex flex-col justify-between h-24">
                  <div
                    className="font-bold text-[10px] border-b pb-0.5"
                    style={{ borderColor: tableBorderColor }}
                  >
                    Bagian Akunting
                  </div>
                  <div className="grid grid-cols-2 text-[9px] gap-1 h-full pt-1">
                    <div
                      className="border-r flex flex-col justify-between"
                      style={{ borderColor: tableBorderColor }}
                    >
                      <span className="font-semibold">kode oleh</span>
                      <span className="text-[8px] text-slate-500">Tgl: __/__</span>
                    </div>
                    <div className="flex flex-col justify-between">
                      <span className="font-semibold">input oleh</span>
                      <span className="text-[8px] text-slate-500">Tgl: __/__</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Carbon Copy Distribution Note */}
            <div className="mt-1 text-[9px] font-bold text-slate-600 tracking-wider">
              PUTIH - CSF JKT, &nbsp;&nbsp; MERAH - AGT, &nbsp;&nbsp; BIRU - FILE
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
          <div className="text-xs text-slate-500">
            Form cetak 1:1 terkunci pada ukuran fisik asli (~205mm x 135mm), cocok untuk kertas A5 landscape atau continuous form.
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
              <span>Cetak Sekarang (1:1)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
