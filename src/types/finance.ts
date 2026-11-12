export type CompanyId = 'SRIWIJAYA' | 'NAM';

export interface CompanyConfig {
  id: CompanyId;
  name: string;
  shortCode: string; // 'SJ' | 'IN'
  stationCode: string; // 'SUB'
  bankName: string;
  bankAccountTitle: string; // 'BNI VA 9888787710000002' or 'Rekening Tampungan (PIC) DMSUB - 1410004042206'
  primaryColor: string;
  accentColor: string;
  defaultMakerName: string;
  defaultMakerTitle: string;
  defaultApproverName: string;
  defaultApproverTitle: string;
  city: string;
}

export interface PeriodInfo {
  id: string; // e.g. 'SJ-2026-10-P1'
  companyId: CompanyId;
  year: number;
  month: number; // 1-12
  periodHalf: 1 | 2; // 1 = 01-15, 2 = 16-30/31
  title: string; // 'PETTY CASH PT. SRIWIJAYA AIR PERIODE 01-15 OKTOBER 2026'
  dateRangeLabel: string; // '01-15 Oktober 2026'
  startDate: string; // '2026-10-01'
  endDate: string; // '2026-10-15'
  saldoAwalPettyCash: number;
  saldoAwalAdvance: number;
  saldoAwalBank: number;
  signedDate: string; // e.g. 'Surabaya, 16 Oktober 2026'
  makerName: string;
  makerTitle: string;
  approverName: string;
  approverTitle: string;
  bankAccountTitle?: string; // e.g. 'BNI VA 9881175300000002' (starts Nov 2026 for NAM)
}

export type TransactionType =
  | 'KREDIT_OPS' // Pengeluaran Kas Kecil (BKK)
  | 'DEBET_OPS' // Penerimaan Kas Kecil (BMK / Tarik Tunai)
  | 'DEBIT_ADVANCE' // Pemberian Kasbon / Advance
  | 'KREDIT_ADVANCE' // Penyelesaian Kasbon / Advance
  | 'BANK_DEBIT' // Penerimaan di Bank (Droping HO)
  | 'BANK_KREDIT' // Pengeluaran di Bank (misal Tarik Tunai VA)
  | 'TARIK_TUNAI_BANK_TO_CASH'; // Tarik Tunai VA ke Cash (Atomic: Bank Kredit & Debet Ops)

export interface VoucherItem {
  no: number;
  keterangan: string;
  dk: 'D' | 'K';
  kodeRek: string;
  jumlah: number;
}

export interface Transaction {
  id: string;
  companyId: CompanyId;
  periodId: string;
  tanggal: string; // '2026-10-02' or format '2-Oct-26'
  noBukti: string; // e.g. 'KSUB.26.10.001' or 'BSUB.26.10.001'
  keterangan: string;
  keteranganLines?: string[]; // Extra notes or FP number
  penerima: string;
  type: TransactionType;
  debetOps: number;
  kreditOps: number;
  debitAdvance: number;
  kreditAdvance: number;
  debitBank: number;
  kreditBank: number;
  // Voucher metadata for 1:1 BKK/BMK slip print
  voucherType: 'BKK' | 'BMK';
  kodeRek: string;
  bankName?: string;
  acNo?: string;
  bgChequeNo?: string;
  bgChequeDate?: string;
  items?: VoucherItem[];
  diterimaOleh?: string;
  diperiksaOleh?: string;
  disetujuiOleh?: string;
  dibayarOleh?: string;
  createdAt: string;
}

export interface ComputedRow extends Transaction {
  saldoAdvance: number;
  saldoPettyCash: number;
  saldoBank: number;
  saldoCashBank: number;
}

export interface PeriodSummary {
  saldoAwalPettyCash: number;
  saldoAwalAdvance: number;
  saldoAwalBank: number;
  saldoAwalTotal: number;

  totalDebetOps: number; // Includes saldo awal in official bank summary
  totalKreditOps: number;
  totalDebetAdvance: number;
  totalKreditAdvance: number;
  totalDebitBank: number;
  totalKreditBank: number;

  saldoAkhirAdvance: number;
  saldoAkhirPettyCash: number;
  saldoAkhirBank: number;
  saldoAkhirCashBank: number;
}

export interface ReminderConfig {
  enabled: boolean;
  time: string; // '16:30'
  audioEnabled: boolean;
  browserNotificationsEnabled: boolean;
  lastCheckedDate: string;
}
