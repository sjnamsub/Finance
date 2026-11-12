import * as XLSX from 'xlsx';
import { CompanyConfig, PeriodInfo, Transaction } from '../types/finance';
import { computePeriodRows } from './calculations';

export function exportPeriodToExcel(
  company: CompanyConfig,
  period: PeriodInfo,
  transactions: Transaction[]
) {
  const wb = XLSX.utils.book_new();
  const ws = createWorksheetForPeriod(company, period, transactions);
  
  const sheetName = period.dateRangeLabel.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const safeFilename = `${company.shortCode}_Rekap_PC_${period.dateRangeLabel.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}

export function exportAllPeriodsToExcel(
  company: CompanyConfig,
  periods: PeriodInfo[],
  transactions: Transaction[]
) {
  const wb = XLSX.utils.book_new();

  const sortedPeriods = [...periods]
    .filter((p) => p.companyId === company.id)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  sortedPeriods.forEach((period) => {
    const ws = createWorksheetForPeriod(company, period, transactions);
    let sheetName = `${period.dateRangeLabel.replace(/[^a-zA-Z0-9]/g, '_')}`.slice(0, 31);
    if (wb.SheetNames.includes(sheetName)) {
      sheetName = `${sheetName}_${period.periodHalf}`;
    }
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const safeFilename = `${company.shortCode}_Rekap_PC_Semua_Periode.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}

function createWorksheetForPeriod(
  company: CompanyConfig,
  period: PeriodInfo,
  transactions: Transaction[]
): XLSX.WorkSheet {
  const { rows, summary } = computePeriodRows(period, transactions);

  // Prepare 2D matrix data for SheetJS
  const sheetData: (string | number | null)[][] = [];

  // Row 0: Empty spacer
  sheetData.push([]);

  // Row 1: Title (Merged A2:N2)
  sheetData.push([period.title.toUpperCase()]);

  // Row 2: Empty spacer
  sheetData.push([]);

  // Row 3: Header Row 1
  sheetData.push([
    'TANGGAL',
    'NO BUKTI TRANSAKSI',
    'KETERANGAN',
    'PENERIMA',
    'PETTY CASH',
    null,
    null,
    null,
    'SALDO ADVANCE',
    'SALDO PETTY CASH',
    period.bankAccountTitle || (company.id === 'NAM' && period.month < 11 && period.year <= 2026 ? 'Rekening Tampungan (PIC) DMSUB - 1410004042206' : company.bankAccountTitle),
    null,
    'SALDO BANK',
    'SALDO CASH + BANK',
  ]);

  // Row 4: Header Row 2 (Sub-headers)
  sheetData.push([
    null,
    null,
    null,
    null,
    'DEBET OPS',
    'KREDIT OPS',
    'DEBIT ADVANCE',
    'KREDIT ADVANCE',
    null,
    null,
    'DEBIT',
    'KREDIT',
    null,
    null,
  ]);

  // Row 5: Saldo Awal row
  sheetData.push([
    '',
    '',
    'SALDO AWAL',
    '',
    summary.saldoAwalPettyCash || null,
    null,
    summary.saldoAwalAdvance || null,
    null,
    summary.saldoAwalAdvance || 0,
    summary.saldoAwalPettyCash || 0,
    null,
    null,
    summary.saldoAwalBank || 0,
    summary.saldoAwalTotal || 0,
  ]);

  // Rows 6+: Data rows
  rows.forEach((row) => {
    sheetData.push([
      row.tanggal,
      row.noBukti,
      row.keterangan,
      row.penerima,
      row.debetOps > 0 ? row.debetOps : null,
      row.kreditOps > 0 ? row.kreditOps : null,
      row.debitAdvance > 0 ? row.debitAdvance : null,
      row.kreditAdvance > 0 ? row.kreditAdvance : null,
      row.saldoAdvance !== undefined ? row.saldoAdvance : null,
      row.saldoPettyCash !== undefined ? row.saldoPettyCash : null,
      row.debitBank > 0 ? row.debitBank : null,
      row.kreditBank > 0 ? row.kreditBank : null,
      row.saldoBank !== undefined ? row.saldoBank : null,
      row.saldoCashBank !== undefined ? row.saldoCashBank : null,
    ]);
  });

  // Row: Saldo Akhir / Total
  sheetData.push([
    '',
    '',
    'Saldo Akhir',
    '',
    summary.totalDebetOps || null,
    summary.totalKreditOps || null,
    summary.totalDebetAdvance || null,
    summary.totalKreditAdvance || null,
    summary.saldoAkhirAdvance || 0,
    summary.saldoAkhirPettyCash || 0,
    summary.totalDebitBank || null,
    summary.totalKreditBank || null,
    summary.saldoAkhirBank || 0,
    summary.saldoAkhirCashBank || 0,
  ]);

  // Signatures section (surabaya, [date], dibuat oleh, disetujui oleh)
  sheetData.push([]);
  sheetData.push([period.signedDate || `${company.city}, ${period.dateRangeLabel}`]);
  sheetData.push(['Dibuat oleh,', null, null, null, null, null, null, null, null, null, 'Disetujui oleh,']);
  sheetData.push([]);
  sheetData.push([]);
  sheetData.push([
    period.makerName || company.defaultMakerName,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    period.approverName || company.defaultApproverName,
  ]);
  sheetData.push([
    period.makerTitle || company.defaultMakerTitle,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    period.approverTitle || company.defaultApproverTitle,
  ]);

  // Create sheet from array of arrays
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Column width definitions
  ws['!cols'] = [
    { wch: 12 }, // Tanggal
    { wch: 17 }, // No Bukti
    { wch: 50 }, // Keterangan
    { wch: 15 }, // Penerima
    { wch: 14 }, // Debet Ops
    { wch: 14 }, // Kredit Ops
    { wch: 14 }, // Debit Advance
    { wch: 14 }, // Kredit Advance
    { wch: 15 }, // Saldo Advance
    { wch: 16 }, // Saldo Petty Cash
    { wch: 14 }, // Debit Bank
    { wch: 14 }, // Kredit Bank
    { wch: 16 }, // Saldo Bank
    { wch: 18 }, // Saldo Cash + Bank
  ];

  // Set merges
  ws['!merges'] = [
    // Title banner
    { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
    // Headers: TANGGAL, NO BUKTI, KETERANGAN, PENERIMA
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } },
    { s: { r: 3, c: 3 }, e: { r: 4, c: 3 } },
    // PETTY CASH (Debet Ops, Kredit Ops, Debit Adv, Kredit Adv)
    { s: { r: 3, c: 4 }, e: { r: 3, c: 7 } },
    // Saldo Advance
    { s: { r: 3, c: 8 }, e: { r: 4, c: 8 } },
    // Saldo Petty Cash
    { s: { r: 3, c: 9 }, e: { r: 4, c: 9 } },
    // Bank Title (Debit, Kredit)
    { s: { r: 3, c: 10 }, e: { r: 3, c: 11 } },
    // Saldo Bank
    { s: { r: 3, c: 12 }, e: { r: 4, c: 12 } },
    // Saldo Cash + Bank
    { s: { r: 3, c: 13 }, e: { r: 4, c: 13 } },
  ];

  return ws;
}
