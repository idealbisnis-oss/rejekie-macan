/**
 * Indonesian Rupiah Parsing & Formatting Utilities
 * Supports:
 * - Direct digits with auto-thousand separators: "200000000" -> "200.000.000"
 * - Shorthand inputs: "200jt" -> 200.000.000, "2.5m" -> 2.500.000.000, "500rb" -> 500.000, "1t" -> 1.000.000.000.000
 * - Live Terbilang & short Indonesian reading
 */

export function parseRupiahInput(input: string | number | undefined | null): number {
  if (input === undefined || input === null) return 0;
  if (typeof input === "number") return isNaN(input) ? 0 : input;

  const raw = String(input).trim().toLowerCase();
  if (!raw) return 0;

  // Check for Triliun (t / triliun)
  const triliunMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:t|triliun|trillion)$/i);
  if (triliunMatch) {
    const num = parseFloat(triliunMatch[1].replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000_000_000);
  }

  // Check for Miliar / Milyar (m / milyar / miliar / b / billion)
  const miliarMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:m|miliar|milyar|b|billion)$/i);
  if (miliarMatch) {
    const num = parseFloat(miliarMatch[1].replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000_000);
  }

  // Check for Juta (jt / juta / million)
  const jutaMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:jt|juta|mio|million)$/i);
  if (jutaMatch) {
    const num = parseFloat(jutaMatch[1].replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000);
  }

  // Check for Ribu (rb / ribu / k)
  const ribuMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:rb|ribu|k)$/i);
  if (ribuMatch) {
    const num = parseFloat(ribuMatch[1].replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1_000);
  }

  // Plain number with dot/comma separators e.g. "200.000.000" or "200,000,000"
  const cleaned = raw.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

export function formatRupiah(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === "") return "";
  const num = typeof amount === "number" ? amount : parseRupiahInput(amount);
  if (!num && num !== 0) return "";
  return num.toLocaleString("id-ID");
}

export function formatRupiahShort(amount: number): string {
  if (!amount || isNaN(amount)) return "Rp 0";

  if (amount >= 1_000_000_000_000) {
    const val = amount / 1_000_000_000_000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)} Triliun`;
  }
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)} Miliar`;
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)} Juta`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(0)} Ribu`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

function terbilangHelper(n: number): string {
  if (n < 12) return satuan[n];
  if (n < 20) return terbilangHelper(n - 10) + " Belas";
  if (n < 100) return terbilangHelper(Math.floor(n / 10)) + " Puluh " + terbilangHelper(n % 10);
  if (n < 200) return "Seratus " + terbilangHelper(n - 100);
  if (n < 1000) return terbilangHelper(Math.floor(n / 100)) + " Ratus " + terbilangHelper(n % 100);
  if (n < 2000) return "Seribu " + terbilangHelper(n - 1000);
  if (n < 1_000_000) return terbilangHelper(Math.floor(n / 1000)) + " Ribu " + terbilangHelper(n % 1000);
  if (n < 1_000_000_000) return terbilangHelper(Math.floor(n / 1_000_000)) + " Juta " + terbilangHelper(n % 1_000_000);
  if (n < 1_000_000_000_000) return terbilangHelper(Math.floor(n / 1_000_000_000)) + " Miliar " + terbilangHelper(n % 1_000_000_000);
  if (n < 1_000_000_000_000_000) return terbilangHelper(Math.floor(n / 1_000_000_000_000)) + " Triliun " + terbilangHelper(n % 1_000_000_000_000);
  return "";
}

export function terbilangRupiah(amount: number): string {
  if (!amount || amount === 0) return "Nol Rupiah";
  const result = terbilangHelper(Math.abs(Math.floor(amount))).replace(/\s+/g, " ").trim();
  return result ? `${result} Rupiah` : "";
}
