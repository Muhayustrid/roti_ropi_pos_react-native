/**
 * Pure money formatting utilities for RotiRopi POS
 * Following DESIGN.md 9.1:
 * - formatRupiah(12000) -> "Rp 12.000"
 * - formatGrouped(200000) -> "200.000" (0 becomes "")
 * - formatSignedRupiah(5000) -> "+Rp 5.000"
 * - formatSignedRupiah(-5000) -> "−Rp 5.000" (Unicode minus U+2212)
 * - digitsOnly(raw) -> number
 */

export function formatGrouped(amount: number): string {
  if (amount === 0) return '';
  const isNegative = amount < 0;
  const absStr = Math.abs(Math.round(amount)).toString();
  const grouped = absStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return isNegative ? `−${grouped}` : grouped;
}

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const absStr = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (rounded < 0) {
    return `−Rp ${absStr}`;
  }
  return `Rp ${absStr}`;
}

export function formatSignedRupiah(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) {
    return 'Rp 0';
  }
  const absStr = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (rounded > 0) {
    return `+Rp ${absStr}`;
  }
  return `−Rp ${absStr}`; // Using U+2212 Unicode minus
}

export function digitsOnly(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/\D/g, '').slice(0, 12);
  if (!cleaned) return 0;
  return parseInt(cleaned, 10) || 0;
}
