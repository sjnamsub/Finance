export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats a number into Indonesian Rupiah without decimals for clean display
 * e.g. 2000000 -> "2.000.000"
 */
export function formatRupiah(amount: number | undefined | null, showDashForZero: boolean = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) return showDashForZero ? '-' : '0';
  if (amount === 0) return showDashForZero ? '-' : '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number into Indonesian Rupiah with Currency Prefix
 * e.g. 2000000 -> "Rp 2.000.000"
 */
export function formatCurrencyIDR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return `Rp ${formatRupiah(amount, false)}`;
}

/**
 * Converts standard date YYYY-MM-DD into display format '16-Oct-26'
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  // If already in short format like '16-Oct-26', return as is
  if (dateStr.includes('-Oct-') || dateStr.includes('-Sep-') || dateStr.includes('-Nov-')) {
    return dateStr;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES_SHORT[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
}

/**
 * Returns formal date string e.g. "Surabaya, 16 Oktober 2026"
 */
export function formatSigningDate(city: string, date: Date = new Date()): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES_ID[date.getMonth()];
  const year = date.getFullYear();
  return `${city}, ${day} ${month} ${year}`;
}

/**
 * Generates automated transaction voucher code based on year, month, type and sequence
 * e.g. KSUB.26.10.001 (Kas Keluar) or BSUB.26.10.001 (Bank/Masuk)
 */
export function generateVoucherCode(
  station: string = 'SUB',
  voucherType: 'BKK' | 'BMK',
  date: Date = new Date(),
  seq: number = 1
): string {
  const prefix = voucherType === 'BKK' ? 'KSUB' : 'BSUB';
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const num = seq.toString().padStart(3, '0');
  return `${prefix}.${year}.${month}.${num}`;
}
