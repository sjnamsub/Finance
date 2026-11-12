import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Zap, Car, FileText, CheckCircle2, Calculator } from 'lucide-react';
import { CompanyConfig, PeriodInfo, Transaction, TransactionType, VoucherItem } from '../types/finance';
import { generateVoucherCode, formatDisplayDate, formatRupiah } from '../utils/formatters';
import { terbilang } from '../utils/terbilang';

interface Props {
  company: CompanyConfig;
  period: PeriodInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  editingTransaction?: Transaction | null;
  currentTransactionsCount: number;
}

export const TransactionModal: React.FC<Props> = ({
  company,
  period,
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  currentTransactionsCount,
}) => {
  if (!isOpen) return null;

  // Active Tab Mode: Standard vs Dedicated BBM & Kendaraan 1 BKK Form
  const [modalMode, setModalMode] = useState<'STANDARD' | 'BBM_BUNDLE'>('STANDARD');

  // Standard Form states
  const [tanggal, setTanggal] = useState<string>('');
  const [noBukti, setNoBukti] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [penerima, setPenerima] = useState<string>('');
  const [type, setType] = useState<TransactionType>('KREDIT_OPS');
  const [nominal, setNominal] = useState<number | ''>('');
  const [kodeRek, setKodeRek] = useState<string>('5100-OPS');

  // Breakdown items
  const [hasBreakdown, setHasBreakdown] = useState<boolean>(false);
  const [items, setItems] = useState<VoucherItem[]>([
    { no: 1, keterangan: '', dk: 'K', kodeRek: '5100-OPS', jumlah: 0 },
  ]);

  // Dedicated BBM Bundle Form States (Matching scan 011_aee78d03.pdf)
  const defaultNopol = company.id === 'SRIWIJAYA' ? 'DMSUB B1960 PYZ' : 'SMIN B1090PRN';
  const [bbmNopol, setBbmNopol] = useState<string>(defaultNopol);
  const [bbmPenerima, setBbmPenerima] = useState<string>('DM SUB');
  const [bbmDate1, setBbmDate1] = useState<string>('22-10-26');
  const [bbmAmount1, setBbmAmount1] = useState<number | ''>(250000);
  const [bbmDate2, setBbmDate2] = useState<string>('27-10-26');
  const [bbmAmount2, setBbmAmount2] = useState<number | ''>(300000);
  const [tolAmount, setTolAmount] = useState<number | ''>(56000);
  const [parkirAmount, setParkirAmount] = useState<number | ''>(39000);
  const [cuciMobilAmount, setCuciMobilAmount] = useState<number | ''>(50000);

  // Compute BBM total
  const bbmTotalCalculated =
    (Number(bbmAmount1) || 0) +
    (Number(bbmAmount2) || 0) +
    (Number(tolAmount) || 0) +
    (Number(parkirAmount) || 0) +
    (Number(cuciMobilAmount) || 0);

  useEffect(() => {
    if (editingTransaction) {
      setTanggal(editingTransaction.tanggal);
      setNoBukti(editingTransaction.noBukti);
      setKeterangan(editingTransaction.keterangan);
      setPenerima(editingTransaction.penerima);
      setType(editingTransaction.type);
      setKodeRek(editingTransaction.kodeRek || '5100-OPS');

      const amount =
        editingTransaction.kreditOps ||
        editingTransaction.debetOps ||
        editingTransaction.debitBank ||
        editingTransaction.kreditBank ||
        editingTransaction.debitAdvance ||
        editingTransaction.kreditAdvance ||
        0;
      setNominal(amount);

      if (editingTransaction.items && editingTransaction.items.length > 0) {
        setItems(editingTransaction.items);
        setHasBreakdown(true);
      }
    } else {
      const today = new Date();
      setTanggal(formatDisplayDate(today.toISOString().slice(0, 10)));
      setType('KREDIT_OPS');
      const autoCode = generateVoucherCode('SUB', 'BKK', today, currentTransactionsCount + 1);
      setNoBukti(autoCode);
      setKeterangan('');
      setPenerima('');
      setNominal('');
      setKodeRek(company.id === 'SRIWIJAYA' ? '5103-BBM' : '5204-BBM');
      setHasBreakdown(false);
      setItems([{ no: 1, keterangan: '', dk: 'K', kodeRek: '5100-OPS', jumlah: 0 }]);
    }
  }, [editingTransaction, period, currentTransactionsCount, company]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const isVoucherBKK =
      newType === 'KREDIT_OPS' ||
      newType === 'DEBIT_ADVANCE' ||
      newType === 'BANK_KREDIT' ||
      newType === 'TARIK_TUNAI_BANK_TO_CASH';
    const autoCode = generateVoucherCode(
      'SUB',
      isVoucherBKK ? 'BKK' : 'BMK',
      new Date(),
      currentTransactionsCount + 1
    );
    setNoBukti(autoCode);
  };

  const applyTemplate = (
    tmplTitle: string,
    tmplPenerima: string,
    tmplKode: string,
    tmplType: TransactionType
  ) => {
    setKeterangan(tmplTitle);
    setPenerima(tmplPenerima);
    setKodeRek(tmplKode);
    handleTypeChange(tmplType);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        no: items.length + 1,
        keterangan: '',
        dk: type === 'DEBET_OPS' || type === 'BANK_DEBIT' ? 'D' : 'K',
        kodeRek: kodeRek,
        jumlah: 0,
      },
    ]);
  };

  const removeItemRow = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, no: i + 1 }));
    setItems(updated);
  };

  const updateItemRow = (idx: number, field: keyof VoucherItem, val: unknown) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    setItems(updated);

    const sum = updated.reduce((acc, it) => acc + (Number(it.jumlah) || 0), 0);
    if (sum > 0) setNominal(sum);
  };

  // Submit for Standard Form
  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numNominal = Number(nominal) || 0;
    if (numNominal <= 0) {
      alert('Mohon masukkan nominal yang valid.');
      return;
    }

    const isBKK =
      type === 'KREDIT_OPS' ||
      type === 'DEBIT_ADVANCE' ||
      type === 'BANK_KREDIT';

    const voucherType = isBKK ? 'BKK' : 'BMK';

    let debetOps = 0;
    let kreditOps = 0;
    let debitAdvance = 0;
    let kreditAdvance = 0;
    let debitBank = 0;
    let kreditBank = 0;

    switch (type) {
      case 'KREDIT_OPS':
        kreditOps = numNominal;
        break;
      case 'DEBET_OPS':
        debetOps = numNominal;
        break;
      case 'DEBIT_ADVANCE':
        debitAdvance = numNominal;
        break;
      case 'KREDIT_ADVANCE':
        kreditAdvance = numNominal;
        break;
      case 'BANK_DEBIT':
        debitBank = numNominal;
        break;
      case 'BANK_KREDIT':
        kreditBank = numNominal;
        break;
      case 'TARIK_TUNAI_BANK_TO_CASH':
        kreditBank = numNominal;
        debetOps = numNominal;
        break;
    }

    const finalItems: VoucherItem[] =
      hasBreakdown && items.length > 0
        ? items
        : [
            {
              no: 1,
              keterangan: keterangan,
              dk: voucherType === 'BKK' ? 'K' : 'D',
              kodeRek: kodeRek,
              jumlah: numNominal,
            },
          ];

    const tx: Transaction = {
      id: editingTransaction
        ? editingTransaction.id
        : `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      companyId: company.id,
      periodId: period.id,
      tanggal,
      noBukti,
      keterangan,
      keteranganLines: keterangan.split('\n'),
      penerima: penerima.toUpperCase(),
      type,
      debetOps,
      kreditOps,
      debitAdvance,
      kreditAdvance,
      debitBank,
      kreditBank,
      voucherType,
      kodeRek,
      items: finalItems,
      createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString(),
    };

    onSave(tx);
    onClose();
  };

  // Submit for Dedicated BBM Bundle into 1 BKK (matching 011_aee78d03.pdf)
  const handleBbmBundleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bbmTotalCalculated <= 0) {
      alert('Mohon masukkan rincian nominal BBM/Tol/Parkir.');
      return;
    }

    // Build multi-line description matching image_2a554b37.png
    const lines: string[] = [];
    if (bbmAmount1) lines.push(`By BBM Kend Ops ${bbmNopol} (${bbmDate1})`);
    if (bbmAmount2) lines.push(`By BBM Kend Ops ${bbmNopol} (${bbmDate2})`);
    if (tolAmount) lines.push('By Tol');
    if (parkirAmount) lines.push('By parkir');
    if (cuciMobilAmount) lines.push('By Cuci Mobil');

    const fullKeterangan = lines.join('\n');

    // Build individual items for 1:1 physical BKK slip print matching scan 011_aee78d03.pdf
    const voucherItems: VoucherItem[] = [];
    let itemIdx = 1;

    if (bbmAmount1) {
      voucherItems.push({
        no: itemIdx++,
        keterangan: `By BBM Kend Ops ${bbmNopol}\n  - ${bbmDate1}`,
        dk: 'K',
        kodeRek: '5103-BBM',
        jumlah: Number(bbmAmount1),
      });
    }

    if (bbmAmount2) {
      voucherItems.push({
        no: itemIdx++,
        keterangan: `  - ${bbmDate2}`,
        dk: 'K',
        kodeRek: '5103-BBM',
        jumlah: Number(bbmAmount2),
      });
    }

    if (tolAmount) {
      voucherItems.push({
        no: itemIdx++,
        keterangan: 'By TOL',
        dk: 'K',
        kodeRek: '5103-BBM',
        jumlah: Number(tolAmount),
      });
    }

    if (parkirAmount) {
      voucherItems.push({
        no: itemIdx++,
        keterangan: 'By PARKIR',
        dk: 'K',
        kodeRek: '5103-BBM',
        jumlah: Number(parkirAmount),
      });
    }

    if (cuciMobilAmount) {
      voucherItems.push({
        no: itemIdx++,
        keterangan: 'By CUCI MOBIL',
        dk: 'K',
        kodeRek: '5103-BBM',
        jumlah: Number(cuciMobilAmount),
      });
    }

    const tx: Transaction = {
      id: editingTransaction
        ? editingTransaction.id
        : `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      companyId: company.id,
      periodId: period.id,
      tanggal,
      noBukti,
      keterangan: fullKeterangan,
      keteranganLines: lines,
      penerima: bbmPenerima.toUpperCase(),
      type: 'KREDIT_OPS',
      debetOps: 0,
      kreditOps: bbmTotalCalculated,
      debitAdvance: 0,
      kreditAdvance: 0,
      debitBank: 0,
      kreditBank: 0,
      voucherType: 'BKK',
      kodeRek: '5103-BBM',
      diterimaOleh: bbmPenerima.toUpperCase(),
      diperiksaOleh: 'Aziz',
      disetujuiOleh: 'Rika',
      dibayarOleh: 'Aziz',
      items: voucherItems,
      createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString(),
    };

    onSave(tx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>{editingTransaction ? 'Ubah Catatan Transaksi' : 'Input Transaksi Kas & Bank'}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600 font-normal">
                {company.shortCode} • {period.dateRangeLabel}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Mendukung transaksi umum serta perincian BBM & Kendaraan dalam 1 BKK resmi
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Form Mode Selector: Standard vs Dedicated BBM in 1 BKK */}
        <div className="bg-slate-200 p-2.5 border-b border-slate-300 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setModalMode('STANDARD')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              modalMode === 'STANDARD'
                ? 'bg-blue-600 text-white shadow-md border-blue-700'
                : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 text-inherit" />
            <span>Form Transaksi Standar (Umum)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('BBM_BUNDLE')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              modalMode === 'BBM_BUNDLE'
                ? 'bg-red-700 text-white shadow-md border-red-800'
                : 'bg-white text-red-800 hover:bg-red-50 border-red-300'
            }`}
          >
            <Car className="w-4 h-4 text-inherit" />
            <span>🚗 Rincian BBM & Kendaraan Ops (1 BKK)</span>
          </button>
        </div>

        {/* Mode 1: DEDICATED BBM BUNDLE IN 1 BKK */}
        {modalMode === 'BBM_BUNDLE' ? (
          <form onSubmit={handleBbmBundleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {/* Banner matching scan 011_aee78d03.pdf */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5">
              <Car className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-950 leading-relaxed">
                <strong>Format Standar 1 BKK:</strong> Seluruh biaya BBM (beberapa tanggal), Tol,
                Parkir, dan Cuci Mobil operasional digabungkan dalam <strong>1 Nomor BKK tunggal</strong>.
                Rincian otomatis tampil pada voucher fisik BKK (1:1) dan lembar rekap kas dwimingguan.
              </div>
            </div>

            {/* Row: Tanggal & No Bukti */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal BKK
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 27-10-26"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Bukti BKK
                </label>
                <input
                  type="text"
                  value={noBukti}
                  onChange={(e) => setNoBukti(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-slate-50"
                />
              </div>
            </div>

            {/* Kendaraan & Dibayarkan Kepada */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Kendaraan Operasional
                </label>
                <input
                  type="text"
                  placeholder="Contoh: DMSUB B1960 PYZ"
                  value={bbmNopol}
                  onChange={(e) => setBbmNopol(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dibayarkan Kepada (Penerima)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: DM SUB / RIKA"
                  value={bbmPenerima}
                  onChange={(e) => setBbmPenerima(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold uppercase"
                />
              </div>
            </div>

            {/* Rincian Bagian-Bagian dalam 1 BKK */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Rincian Komponen Biaya dalam 1 BKK
              </span>

              {/* BBM 1 */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-4 text-xs font-medium text-slate-700">1. Pengisian BBM (1)</span>
                <input
                  type="text"
                  placeholder="Tgl: 22-10-26"
                  value={bbmDate1}
                  onChange={(e) => setBbmDate1(e.target.value)}
                  className="col-span-3 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-center"
                />
                <input
                  type="number"
                  placeholder="Rp 250.000"
                  value={bbmAmount1}
                  onChange={(e) => setBbmAmount1(e.target.value ? Number(e.target.value) : '')}
                  className="col-span-5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-right bg-white"
                />
              </div>

              {/* BBM 2 */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-4 text-xs font-medium text-slate-700">2. Pengisian BBM (2)</span>
                <input
                  type="text"
                  placeholder="Tgl: 27-10-26"
                  value={bbmDate2}
                  onChange={(e) => setBbmDate2(e.target.value)}
                  className="col-span-3 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-center"
                />
                <input
                  type="number"
                  placeholder="Rp 300.000"
                  value={bbmAmount2}
                  onChange={(e) => setBbmAmount2(e.target.value ? Number(e.target.value) : '')}
                  className="col-span-5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-right bg-white"
                />
              </div>

              {/* TOL */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-7 text-xs font-medium text-slate-700">3. Biaya TOL (E-Money)</span>
                <input
                  type="number"
                  placeholder="Rp 56.000"
                  value={tolAmount}
                  onChange={(e) => setTolAmount(e.target.value ? Number(e.target.value) : '')}
                  className="col-span-5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-right bg-white"
                />
              </div>

              {/* PARKIR */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-7 text-xs font-medium text-slate-700">4. Biaya Parkir (Tiket & Karcis)</span>
                <input
                  type="number"
                  placeholder="Rp 39.000"
                  value={parkirAmount}
                  onChange={(e) => setParkirAmount(e.target.value ? Number(e.target.value) : '')}
                  className="col-span-5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-right bg-white"
                />
              </div>

              {/* CUCI MOBIL */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-7 text-xs font-medium text-slate-700">5. Biaya Cuci Mobil</span>
                <input
                  type="number"
                  placeholder="Rp 50.000"
                  value={cuciMobilAmount}
                  onChange={(e) => setCuciMobilAmount(e.target.value ? Number(e.target.value) : '')}
                  className="col-span-5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-right bg-white"
                />
              </div>

              {/* Total Calculation Display */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-800">TOTAL 1 BKK:</span>
                <span className="font-mono text-base font-black text-red-700">
                  Rp {formatRupiah(bbmTotalCalculated, false)}
                </span>
              </div>
              <div className="text-[11px] italic text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                Terbilang: <strong>{terbilang(bbmTotalCalculated)}</strong>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-black shadow-md cursor-pointer border border-[#b91c1c]"
              >
                Simpan ke 1 BKK (Otomatis Rinci)
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: STANDARD TRANSACTION FORM */
          <form onSubmit={handleStandardSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Template Cepat Transaksi Bandara & Operasional
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      'By Pembelian token listrik (Flops & LL)',
                      'FARIH',
                      '5102-UTILITAS',
                      'KREDIT_OPS'
                    )
                  }
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-lg font-medium border border-slate-200"
                >
                  + Token Listrik PLN
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      'Terima Tunai Dana Petty Cash dari penarikan VA-SJ2',
                      'AZIZ',
                      '1101-KAS',
                      'DEBET_OPS'
                    )
                  }
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-lg font-medium border border-slate-200"
                >
                  + Tarik Tunai VA ke PC
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      'Terima droping HO Petty Cash ke Rekening Bank',
                      'HO JAKARTA',
                      '1102-BANK',
                      'BANK_DEBIT'
                    )
                  }
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-lg font-medium border border-slate-200"
                >
                  + Droping HO ke Bank
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      'By Pembelian pulsa HP CS u/ Pre Flight',
                      'ANDIK',
                      '5101-KOMUNIKASI',
                      'KREDIT_OPS'
                    )
                  }
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-lg font-medium border border-slate-200"
                >
                  + Pulsa HP CS Pre Flight
                </button>
              </div>
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori & Aliran Kas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('KREDIT_OPS')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    type === 'KREDIT_OPS'
                      ? 'border-red-600 bg-red-50 text-red-950 ring-2 ring-red-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Kas Keluar (BKK)</div>
                  <div className="text-[10px] text-slate-500">Biaya Ops / Rutin</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('DEBET_OPS')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    type === 'DEBET_OPS'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Kas Masuk (BMK)</div>
                  <div className="text-[10px] text-slate-500">Penerimaan Kas Fisik</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('BANK_DEBIT')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    type === 'BANK_DEBIT'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Droping HO (Bank Debit)</div>
                  <div className="text-[10px] text-slate-500">Transfer dari Pusat</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('BANK_KREDIT')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    type === 'BANK_KREDIT'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Bank Keluar (Bank Kredit)</div>
                  <div className="text-[10px] text-slate-500">Penarikan Rekening</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('DEBIT_ADVANCE')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    type === 'DEBIT_ADVANCE'
                      ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Pemberian Kasbon</div>
                  <div className="text-[10px] text-slate-500">Advance Operasional</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('KREDIT_ADVANCE')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    type === 'KREDIT_ADVANCE'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Penyelesaian Kasbon</div>
                  <div className="text-[10px] text-slate-500">Realisasi Advance</div>
                </button>
              </div>
            </div>

            {/* Tanggal & No Bukti */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Transaksi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 16-Oct-26"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Bukti Transaksi
                </label>
                <input
                  type="text"
                  value={noBukti}
                  onChange={(e) => setNoBukti(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-slate-50"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan Transaksi
              </label>
              <textarea
                rows={2}
                placeholder="Keterangan pengeluaran atau pemasukan kas..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Penerima & Nominal */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penerima / Pembayar
                </label>
                <input
                  type="text"
                  placeholder="Contoh: FARIH / AZIZ"
                  value={penerima}
                  onChange={(e) => setPenerima(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Rekening
                </label>
                <input
                  type="text"
                  value={kodeRek}
                  onChange={(e) => setKodeRek(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rupiah)
                </label>
                <input
                  type="number"
                  placeholder="250000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-900 bg-blue-50/40"
                />
              </div>
            </div>

            {/* Multi-item Breakdown Option */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasBreakdown}
                    onChange={(e) => setHasBreakdown(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Rincian Multi-Baris untuk Bukti Fisik Voucher (BKK/BMK)</span>
                </label>
                {hasBreakdown && (
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Baris
                  </button>
                )}
              </div>

              {hasBreakdown && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-44 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-xs">
                      <span className="w-5 text-center font-bold text-slate-500">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="Keterangan rincian"
                        value={item.keterangan}
                        onChange={(e) => updateItemRow(idx, 'keterangan', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Kode"
                        value={item.kodeRek}
                        onChange={(e) => updateItemRow(idx, 'kodeRek', e.target.value)}
                        className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-center"
                      />
                      <input
                        type="number"
                        placeholder="Jumlah"
                        value={item.jumlah || ''}
                        onChange={(e) => updateItemRow(idx, 'jumlah', Number(e.target.value))}
                        className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-right bg-white"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg text-xs font-black shadow-md cursor-pointer border border-[#1e40af]"
              >
                Simpan Transaksi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
