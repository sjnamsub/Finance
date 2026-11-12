/**
 * Converts numbers into Indonesian words (Terbilang)
 * e.g. 2000000 -> "Dua Juta Rupiah"
 */

const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

export function terbilang(n: number): string {
  if (isNaN(n) || n === 0) return 'Nol Rupiah';
  
  const num = Math.floor(Math.abs(n));
  const words = convert(num).trim();
  
  return `${words} Rupiah`;
}

function convert(n: number): string {
  if (n < 12) {
    return ' ' + satuan[n];
  } else if (n < 20) {
    return convert(n - 10) + ' Belas';
  } else if (n < 100) {
    return convert(Math.floor(n / 10)) + ' Puluh' + convert(n % 10);
  } else if (n < 200) {
    return ' Seratus' + convert(n - 100);
  } else if (n < 1000) {
    return convert(Math.floor(n / 100)) + ' Ratus' + convert(n % 100);
  } else if (n < 2000) {
    return ' Seribu' + convert(n - 1000);
  } else if (n < 1000000) {
    return convert(Math.floor(n / 1000)) + ' Ribu' + convert(n % 1000);
  } else if (n < 1000000000) {
    return convert(Math.floor(n / 1000000)) + ' Juta' + convert(n % 1000000);
  } else if (n < 1000000000000) {
    return convert(Math.floor(n / 1000000000)) + ' Milyar' + convert(n % 1000000000);
  } else {
    return convert(Math.floor(n / 1000000000000)) + ' Triliun' + convert(n % 1000000000000);
  }
}
