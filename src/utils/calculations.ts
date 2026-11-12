import { ComputedRow, PeriodInfo, PeriodSummary, Transaction } from '../types/finance';

export function computePeriodRows(
  period: PeriodInfo,
  transactions: Transaction[]
): {
  rows: ComputedRow[];
  summary: PeriodSummary;
} {
  // Filter for this period
  const periodTxs = transactions.filter((t) => t.periodId === period.id);

  let curAdvance = period.saldoAwalAdvance || 0;
  let curPettyCash = period.saldoAwalPettyCash || 0;
  let curBank = period.saldoAwalBank || 0;

  let sumDebetOps = 0;
  let sumKreditOps = 0;
  let sumDebetAdvance = 0;
  let sumKreditAdvance = 0;
  let sumDebitBank = 0;
  let sumKreditBank = 0;

  const rows: ComputedRow[] = periodTxs.map((tx) => {
    // Add/subtract balances
    const debetOps = tx.debetOps || 0;
    const kreditOps = tx.kreditOps || 0;
    const debitAdvance = tx.debitAdvance || 0;
    const kreditAdvance = tx.kreditAdvance || 0;
    const debitBank = tx.debitBank || 0;
    const kreditBank = tx.kreditBank || 0;

    curPettyCash += debetOps - kreditOps;
    curAdvance += debitAdvance - kreditAdvance;
    curBank += debitBank - kreditBank;

    sumDebetOps += debetOps;
    sumKreditOps += kreditOps;
    sumDebetAdvance += debitAdvance;
    sumKreditAdvance += kreditAdvance;
    sumDebitBank += debitBank;
    sumKreditBank += kreditBank;

    return {
      ...tx,
      saldoAdvance: curAdvance,
      saldoPettyCash: curPettyCash,
      saldoBank: curBank,
      saldoCashBank: curPettyCash + curBank,
    };
  });

  // Note: in the Sriwijaya & NAM Air PDF summaries:
  // The bottom row "Saldo Akhir" column for DEBET OPS displays: Saldo Awal + sum(Debet Ops)
  // DEBIT BANK displays: Saldo Awal Bank + sum(Debit Bank)
  const summary: PeriodSummary = {
    saldoAwalPettyCash: period.saldoAwalPettyCash || 0,
    saldoAwalAdvance: period.saldoAwalAdvance || 0,
    saldoAwalBank: period.saldoAwalBank || 0,
    saldoAwalTotal: (period.saldoAwalPettyCash || 0) + (period.saldoAwalBank || 0),

    totalDebetOps: (period.saldoAwalPettyCash || 0) + sumDebetOps,
    totalKreditOps: sumKreditOps,
    totalDebetAdvance: (period.saldoAwalAdvance || 0) + sumDebetAdvance,
    totalKreditAdvance: sumKreditAdvance,
    totalDebitBank: (period.saldoAwalBank || 0) + sumDebitBank,
    totalKreditBank: sumKreditBank,

    saldoAkhirAdvance: curAdvance,
    saldoAkhirPettyCash: curPettyCash,
    saldoAkhirBank: curBank,
    saldoAkhirCashBank: curPettyCash + curBank,
  };

  return { rows, summary };
}
