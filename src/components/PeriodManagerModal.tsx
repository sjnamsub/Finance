import React, { useState } from 'react';
import { Plus, Calendar, ArrowRight, Check, History, Sparkles, Building2 } from 'lucide-react';
import { CompanyConfig, PeriodInfo, Transaction } from '../types/finance';
import { computePeriodRows } from '../utils/calculations';
import { formatCurrencyIDR, MONTH_NAMES_ID } from '../utils/formatters';

interface Props {
  company: CompanyConfig;
  periods: PeriodInfo[];
  currentPeriodId: string;
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPeriod: (periodId: string) => void;
  onCreatePeriod: (newPeriod: PeriodInfo) => void;
}

export const PeriodManagerModal: React.FC<Props> = ({
  company,
  periods,
  currentPeriodId,
  transactions,
  isOpen,
  onClose,
  onSelectPeriod,
  onCreatePeriod,
}) => {
  if (!isOpen) return null;

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New period form state
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // November
  const [selectedHalf, setSelectedHalf] = useState<1 | 2>(1); // 01-15
  const [makerName, setMakerName] = useState(company.defaultMakerName);
  const [approverName, setApproverName] = useState(company.defaultApproverName);

  // Filter periods for this company
  const companyPeriods = periods
    .filter((p) => p.companyId === company.id)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Determine starting balances carry-over
  const findPreviousEndingBalances = () => {
    if (companyPeriods.length === 0) return { pc: 0, bank: 0, adv: 0 };
    // Get latest period
    const latest = companyPeriods[0];
    const { summary } = computePeriodRows(latest, transactions);
    return {
      pc: summary.saldoAkhirPettyCash,
      bank: summary.saldoAkhirBank,
      adv: summary.saldoAkhirAdvance,
    };
  };

  const prevBalances = findPreviousEndingBalances();
  const [saldoAwalPC, setSaldoAwalPC] = useState<number>(prevBalances.pc);
  const [saldoAwalBank, setSaldoAwalBank] = useState<number>(prevBalances.bank);
  const [saldoAwalAdv, setSaldoAwalAdv] = useState<number>(prevBalances.adv);
  const [periodBankTitle, setPeriodBankTitle] = useState<string>(() => {
    if (company.id === 'NAM') {
      return selectedYear < 2026 || (selectedYear === 2026 && selectedMonth < 11)
        ? 'Rekening Tampungan (PIC) DMSUB - 1410004042206'
        : 'BNI VA 9881175300000002';
    }
    return company.bankAccountTitle;
  });

  const handleMonthChange = (m: number) => {
    setSelectedMonth(m);
    if (company.id === 'NAM') {
      if (selectedYear < 2026 || (selectedYear === 2026 && m < 11)) {
        setPeriodBankTitle('Rekening Tampungan (PIC) DMSUB - 1410004042206');
      } else {
        setPeriodBankTitle('BNI VA 9881175300000002');
      }
    }
  };

  const handleYearChange = (y: number) => {
    setSelectedYear(y);
    if (company.id === 'NAM') {
      if (y < 2026 || (y === 2026 && selectedMonth < 11)) {
        setPeriodBankTitle('Rekening Tampungan (PIC) DMSUB - 1410004042206');
      } else {
        setPeriodBankTitle('BNI VA 9881175300000002');
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const monthStr = selectedMonth.toString().padStart(2, '0');
    const periodHalfStr = `P${selectedHalf}`;
    const periodId = `${company.shortCode}-${selectedYear}-${monthStr}-${periodHalfStr}`;

    // Calculate dates
    const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const startDate = selectedHalf === 1
      ? `${selectedYear}-${monthStr}-01`
      : `${selectedYear}-${monthStr}-16`;
    const endDate = selectedHalf === 1
      ? `${selectedYear}-${monthStr}-15`
      : `${selectedYear}-${monthStr}-${lastDayOfMonth}`;

    const monthName = MONTH_NAMES_ID[selectedMonth - 1];
    const dateRangeLabel = selectedHalf === 1
      ? `01-15 ${monthName} ${selectedYear}`
      : `16-${lastDayOfMonth} ${monthName} ${selectedYear}`;

    const titlePrefix = company.id === 'SRIWIJAYA' ? 'PETTY CASH PT. SRIWIJAYA AIR PERIODE' : 'PETTY CASH PT.NAM AIR';
    const title = `${titlePrefix} ${dateRangeLabel}`.toUpperCase();

    const newPeriod: PeriodInfo = {
      id: periodId,
      companyId: company.id,
      year: selectedYear,
      month: selectedMonth,
      periodHalf: selectedHalf,
      title,
      dateRangeLabel,
      startDate,
      endDate,
      saldoAwalPettyCash: Number(saldoAwalPC) || 0,
      saldoAwalAdvance: Number(saldoAwalAdv) || 0,
      saldoAwalBank: Number(saldoAwalBank) || 0,
      signedDate: `${company.city}, ${selectedHalf === 1 ? '16' : '03'} ${selectedHalf === 1 ? monthName : MONTH_NAMES_ID[selectedMonth % 12]} ${selectedHalf === 1 ? selectedYear : (selectedMonth === 12 ? selectedYear + 1 : selectedYear)}`,
      makerName,
      makerTitle: company.defaultMakerTitle,
      approverName,
      approverTitle: company.defaultApproverTitle,
      bankAccountTitle: periodBankTitle,
    };

    onCreatePeriod(newPeriod);
    setIsCreatingNew(false);
    onSelectPeriod(periodId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Kelola Periode Pembukuan Kas (01-15 & 16-Akhir)</h3>
              <p className="text-xs text-slate-400">
                {company.name} • Bersambung Berkelanjutan per Bulan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isCreatingNew ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Daftar Periode Aktif ({companyPeriods.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const b = findPreviousEndingBalances();
                    setSaldoAwalPC(b.pc);
                    setSaldoAwalBank(b.bank);
                    setSaldoAwalAdv(b.adv);
                    setIsCreatingNew(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Periode Baru</span>
                </button>
              </div>

              {/* Periods List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {companyPeriods.map((period) => {
                  const { summary } = computePeriodRows(period, transactions);
                  const isSelected = period.id === currentPeriodId;
                  const txCount = transactions.filter((t) => t.periodId === period.id).length;

                  return (
                    <div
                      key={period.id}
                      onClick={() => {
                        onSelectPeriod(period.id);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {period.dateRangeLabel}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              period.periodHalf === 1
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            Periode {period.periodHalf} (
                            {period.periodHalf === 1 ? '01-15' : '16-Akhir'})
                          </span>
                          {isSelected && (
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                              Sedang Dibuka
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3">
                          <span>{txCount} Transaksi</span>
                          <span>•</span>
                          <span>Saldo Kas: {formatCurrencyIDR(summary.saldoAkhirPettyCash)}</span>
                          <span>•</span>
                          <span>Saldo Bank: {formatCurrencyIDR(summary.saldoAkhirBank)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Create New Period Form */
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong>Otomatisasi Saldo Berkelanjutan:</strong> Saldo akhir dari periode
                  sebelumnya akan langsung dibawa ke periode ini sebagai Saldo Awal, menjamin
                  keutuhan pencatatan dwimingguan PT. SRIWIJAYA AIR / PT. NAM AIR.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    {[2025, 2026, 2027, 2028].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bulan</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    {MONTH_NAMES_ID.map((name, idx) => (
                      <option key={idx} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Half */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bagian Periode
                  </label>
                  <select
                    value={selectedHalf}
                    onChange={(e) => setSelectedHalf(Number(e.target.value) as 1 | 2)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value={1}>01 - 15 (Bagian 1)</option>
                    <option value={2}>16 - 30/31 (Bagian 2)</option>
                  </select>
                </div>
              </div>

              {/* Bank Account for this Period */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rekening Bank / VA Resmi untuk Periode Ini
                </label>
                <input
                  type="text"
                  value={periodBankTitle}
                  onChange={(e) => setPeriodBankTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                />
                {company.id === 'NAM' && (
                  <p className="text-[11px] text-sky-700 mt-1">
                    💡 Rekening PT. NAM AIR resmi berubah ke <strong>BNI VA 9881175300000002</strong> mulai periode November 2026.
                  </p>
                )}
              </div>

              {/* Saldo Awal Settings */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Saldo Awal Periode Ini (Diteruskan dari Saldo Akhir Sebelumnya)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Saldo Kas Kecil (PC)
                    </label>
                    <input
                      type="number"
                      value={saldoAwalPC}
                      onChange={(e) => setSaldoAwalPC(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Saldo Rekening Bank
                    </label>
                    <input
                      type="number"
                      value={saldoAwalBank}
                      onChange={(e) => setSaldoAwalBank(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Saldo Advance / Kasbon
                    </label>
                    <input
                      type="number"
                      value={saldoAwalAdv}
                      onChange={(e) => setSaldoAwalAdv(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Signers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dibuat Oleh (FIN & GA)
                  </label>
                  <input
                    type="text"
                    value={makerName}
                    onChange={(e) => setMakerName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disetujui Oleh (District Manager)
                  </label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Buat & Buka Periode
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
