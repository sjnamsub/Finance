import React from 'react';
import {
  HelpCircle,
  X,
  FileText,
  CreditCard,
  Car,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTransaction: () => void;
}

export const GuideModal: React.FC<Props> = ({ isOpen, onClose, onOpenNewTransaction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white px-6 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Panduan Lengkap: Cara Buat Transaksi KSUB & BSUB</h3>
              <p className="text-xs text-blue-200">
                Pencatatan Keuangan Terintegrasi PT. SRIWIJAYA AIR & PT. NAM AIR (Distrik SUB)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Perbedaan KSUB vs BSUB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KSUB Card */}
            <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-red-700 text-white text-xs font-black rounded-md font-mono">
                  KSUB
                </span>
                <span className="text-[11px] font-bold text-red-800 uppercase">Kas Kecil (Fisik)</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Transaksi Kas Kecil / Tunai (Petty Cash)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digunakan untuk seluruh perputaran uang <strong>tunai fisik</strong> di brankas/kasir distrik Surabaya.
              </p>
              <div className="pt-2 border-t border-red-200/60 text-[11px] space-y-1 text-slate-700">
                <div>• <strong>KSUB Kas Keluar (BKK):</strong> BBM, Tol, Parkir, Listrik/Token PLN, Pulsa CS, Air Galon, Cuci Mobil, Bagasi Rusak.</div>
                <div>• <strong>KSUB Kas Masuk (BMK):</strong> Saat kasir menerima fisik uang tunai (misal setelah tarik tunai dari ATM VA).</div>
              </div>
            </div>

            {/* BSUB Card */}
            <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-700 text-white text-xs font-black rounded-md font-mono">
                  BSUB
                </span>
                <span className="text-[11px] font-bold text-blue-800 uppercase">Rekening Bank / VA</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Transaksi Mutasi Rekening Bank (Virtual Account)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digunakan untuk perputaran dana di <strong>rekening resmi bank</strong> (BNI VA Sriwijaya 9888787710000002 atau BNI VA NAM Air 9881175300000002).
              </p>
              <div className="pt-2 border-t border-blue-200/60 text-[11px] space-y-1 text-slate-700">
                <div>• <strong>BSUB Bank Masuk / Debit Bank (BMK):</strong> Dana Droping transfer dari Head Office (HO) Jakarta masuk ke rekening VA.</div>
                <div>• <strong>BSUB Bank Keluar / Kredit Bank (BKK):</strong> Penarikan tunai dana VA di ATM / Teller Bank.</div>
              </div>
            </div>
          </div>

          {/* Langkah-langkah Praktis */}
          <div className="space-y-4">
            <h4 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Langkah-Langkah Membuat Transaksi ke Catatan Keuangan:
            </h4>

            {/* Case 1: KSUB Biaya Operasional & BBM */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-mono">
                  1
                </span>
                <span>Cara Input KSUB (Pengeluaran Operasional Harian / BBM):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-2 text-xs text-slate-700 leading-relaxed">
                <li>
                  Klik tombol biru <strong>&ldquo;+ Input Transaksi&rdquo;</strong> di pojok kanan atas.
                </li>
                <li>
                  <strong>Untuk Biaya Umum (Token Listrik, Pulsa CS, Air, Pas Bandara):</strong>
                  <div className="pl-4 mt-0.5 text-slate-600">
                    Pilih kategori <strong>&ldquo;Kas Keluar (BKK)&rdquo;</strong>. Nomor bukti otomatis diawali <code>KSUB...</code>. Isi Tanggal, Keterangan, Penerima, dan Nominal.
                  </div>
                </li>
                <li>
                  <strong>Khusus Biaya BBM &amp; Kendaraan Operasional (1 BKK Rinci):</strong>
                  <div className="pl-4 mt-0.5 text-slate-600">
                    Klik tab tombol merah <strong>&ldquo;🚗 Rincian BBM &amp; Kendaraan Ops (1 BKK)&rdquo;</strong>. Masukkan Nopol (contoh: <code>DMSUB B1960 PYZ</code>), isi tanggal BBM 1, BBM 2, biaya Tol, Parkir, dan Cuci Mobil. Total akan dihitung otomatis menjadi 1 transaksi BKK dengan rincian per bagian persis seperti dokumen asli!
                  </div>
                </li>
                <li>
                  Klik tombol <strong>&ldquo;Simpan Transaksi&rdquo;</strong>. Transaksi langsung masuk ke kolom <strong>KREDIT OPS</strong> dan mengurangi Saldo Petty Cash.
                </li>
              </ol>
            </div>

            {/* Case 2: BSUB Terima Droping HO */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-mono">
                  2
                </span>
                <span>Cara Input BSUB (Terima Dana Droping dari HO Jakarta ke Rekening Bank):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-2 text-xs text-slate-700 leading-relaxed">
                <li>
                  Klik tombol <strong>&ldquo;+ Input Transaksi&rdquo;</strong>.
                </li>
                <li>
                  Pilih kategori kotak biru: <strong>&ldquo;Droping HO (Bank Debit)&rdquo;</strong>.
                </li>
                <li>
                  Nomor bukti otomatis disiapkan dengan prefix <strong><code>BSUB.26.xx.xxx</code></strong>.
                </li>
                <li>
                  Keterangan: isi keterangan transfer, contoh: <code>Terima dana droping HO Petty Cash periode 01-15 Okt 26 ke VA</code>.
                </li>
                <li>
                  Penerima: isi <code>HO JAKARTA</code> atau <code>HO</code>. Masukkan nominal uang yang masuk ke rekening bank.
                </li>
                <li>
                  Klik <strong>&ldquo;Simpan Transaksi&rdquo;</strong>. Nilai otomatis masuk ke kolom <strong>DEBIT BANK</strong> dan menambah Saldo Bank.
                </li>
              </ol>
            </div>

            {/* Case 3: Siklus Tarik Tunai Bank ke Kasir */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-mono">
                  3
                </span>
                <span>Cara Input Siklus Penarikan Dana (Tarik Tunai dari VA ke Kasir):</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-2">
                Saat uang ditarik dari ATM VA untuk mengisi brankas kas kecil, catat 2 transaksi berpasangan sesuai bukti fisik:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="font-bold text-amber-900 mb-1">A. Transaksi BSUB (Bank Keluar):</div>
                  <div className="text-slate-600 space-y-0.5">
                    <div>• Kategori: <strong>Bank Keluar (Bank Kredit)</strong></div>
                    <div>• No Bukti: <code>BSUB.26.xx.xxx</code></div>
                    <div>• Keterangan: <em>Tarik Tunai Dana Petty Cash VA...</em></div>
                    <div>• Mengurangi <strong>Saldo Bank</strong>.</div>
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="font-bold text-emerald-900 mb-1">B. Transaksi KSUB (Kas Masuk):</div>
                  <div className="text-slate-600 space-y-0.5">
                    <div>• Kategori: <strong>Kas Masuk (BMK)</strong></div>
                    <div>• No Bukti: <code>KSUB.26.xx.xxx</code></div>
                    <div>• Keterangan: <em>Terima Tunai Dana Petty Cash VA...</em></div>
                    <div>• Menambah <strong>Saldo Petty Cash</strong> fisik kasir.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cetak & Ekspor Tips */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <h5 className="font-bold text-blue-950 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Printer className="w-4 h-4 text-blue-700" />
              Tips Cetak Slip 1:1 dan Ekspor Excel:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-900">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cetak Voucher 1:1:</strong> Klik tombol <strong>BKK</strong> atau <strong>BMK</strong> di kolom paling kanan tabel untuk mencetak formulir fisik presisi tanpa distorsi.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Ekspor Excel:</strong> Klik tombol hijau <strong>&ldquo;Export Excel&rdquo;</strong> untuk mengunduh rekap berformat resmi dwimingguan (01–15 / 16–30/31).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Sistem Keuangan Distrik SUB • PT. Sriwijaya Air &amp; PT. NAM Air
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenNewTransaction();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <span>Mulai Input Transaksi Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
