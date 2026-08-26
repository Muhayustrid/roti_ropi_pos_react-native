import type { Transaction } from '../../types';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const REPORT_PERIODS = [
  { key: 'daily', label: 'Harian' },
  { key: 'weekly', label: 'Seminggu' },
  { key: 'monthly', label: 'Bulan' },
  { key: 'yearly', label: 'Tahun' },
] as const;

export interface ReportBucket {
  key: string;
  label: string;
  fullLabel: string;
  value: number;
}

export interface ReportBreakdown {
  label: string;
  value: number;
}

export interface ReportProduct {
  name: string;
  quantity: number;
}

export interface ReportData {
  anchorDate: Date | null;
  rangeLabel: string;
  netSales: number;
  successfulTransactions: number;
  refundTotal: number;
  averageTransaction: number;
  buckets: ReportBucket[];
  paymentMethods: ReportBreakdown[];
  topProducts: ReportProduct[];
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;
const MONTHS_LONG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;
const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;
const DAYS_LONG = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

interface ReportRange {
  start: Date;
  end: Date;
  label: string;
}

export function buildReport(
  transactions: Transaction[],
  period: ReportPeriod
): ReportData {
  const dated = transactions.flatMap((transaction) => {
    const date = parseTransactionDate(transaction.date);
    return date ? [{ transaction, date }] : [];
  });
  const anchorDate = dated.reduce<Date | null>(
    (latest, item) => (!latest || item.date > latest ? item.date : latest),
    null
  );

  if (!anchorDate) return emptyReport();

  const range = getRange(anchorDate, period);
  const buckets = createBuckets(anchorDate, period);
  const paymentTotals = new Map<string, number>();
  const productTotals = new Map<string, number>();
  let netSales = 0;
  let refundTotal = 0;
  let successfulTransactions = 0;

  for (const { transaction, date } of dated) {
    if (date < range.start || date > range.end || transaction.status === 'Draf') {
      continue;
    }

    const amounts = getTransactionAmounts(transaction);
    netSales += amounts.net;
    refundTotal += amounts.refund;
    if (amounts.successful) successfulTransactions += 1;

    const bucket = buckets[getBucketIndex(transaction, date, period)];
    if (bucket) bucket.value += amounts.net;

    if (amounts.net > 0) {
      paymentTotals.set(
        transaction.method,
        (paymentTotals.get(transaction.method) ?? 0) + amounts.net
      );
    }
    if (amounts.successful) addProductQuantities(productTotals, transaction);
  }

  return {
    anchorDate,
    rangeLabel: range.label,
    netSales,
    successfulTransactions,
    refundTotal,
    averageTransaction:
      successfulTransactions > 0
        ? Math.round(netSales / successfulTransactions)
        : 0,
    buckets,
    paymentMethods: [...paymentTotals]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
    topProducts: [...productTotals]
      .map(([name, quantity]) => ({ name, quantity: Math.max(0, quantity) }))
      .filter((product) => product.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
      .slice(0, 3),
  };
}

function parseTransactionDate(value: string): Date | null {
  const match = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS_SHORT.indexOf(match[2] as (typeof MONTHS_SHORT)[number]);
  const year = Number(match[3]);
  if (month < 0) return null;
  const date = new Date(year, month, day);
  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
    ? date
    : null;
}

function getTransactionAmounts(transaction: Transaction) {
  if (transaction.status === 'Draf') {
    return { net: 0, refund: 0, successful: false };
  }
  const refund =
    transaction.status === 'Dikembalikan'
      ? Math.max(0, transaction.refundedTotal ?? transaction.total)
      : Math.max(0, transaction.refundedTotal ?? 0);
  const net =
    transaction.status === 'Dikembalikan'
      ? 0
      : Math.max(0, transaction.total - refund);
  return {
    net,
    refund,
    successful:
      transaction.status === 'Berhasil' ||
      transaction.status === 'Dikembalikan Sebagian',
  };
}

function getRange(anchor: Date, period: ReportPeriod): ReportRange {
  if (period === 'daily') {
    return {
      start: startOfDay(anchor),
      end: endOfDay(anchor),
      label: formatDate(anchor),
    };
  }
  if (period === 'weekly') {
    const mondayOffset = (anchor.getDay() + 6) % 7;
    const start = addDays(startOfDay(anchor), -mondayOffset);
    const end = endOfDay(addDays(start, 6));
    return { start, end, label: formatRange(start, end) };
  }
  if (period === 'monthly') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = endOfDay(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0));
    return {
      start,
      end,
      label: `${MONTHS_LONG[anchor.getMonth()]} ${anchor.getFullYear()}`,
    };
  }
  const start = new Date(anchor.getFullYear(), 0, 1);
  const end = endOfDay(new Date(anchor.getFullYear(), 11, 31));
  return { start, end, label: `${anchor.getFullYear()}` };
}

function createBuckets(anchor: Date, period: ReportPeriod): ReportBucket[] {
  if (period === 'daily') {
    return Array.from({ length: 6 }, (_, index) => {
      const hour = index * 4;
      return {
        key: `${hour}`,
        label: `${hour.toString().padStart(2, '0')}`,
        fullLabel: `Pukul ${hour.toString().padStart(2, '0')}.00 sampai ${(hour + 3).toString().padStart(2, '0')}.59`,
        value: 0,
      };
    });
  }
  if (period === 'weekly') {
    const mondayOffset = (anchor.getDay() + 6) % 7;
    const monday = addDays(startOfDay(anchor), -mondayOffset);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(monday, index);
      return {
        key: dateKey(date),
        label: DAYS_SHORT[date.getDay()],
        fullLabel: `${DAYS_LONG[date.getDay()]}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]}`,
        value: 0,
      };
    });
  }
  if (period === 'monthly') {
    return Array.from({ length: 5 }, (_, index) => ({
      key: `${index + 1}`,
      label: `M${index + 1}`,
      fullLabel: `Minggu ke-${index + 1}`,
      value: 0,
    }));
  }
  return MONTHS_SHORT.map((label, index) => ({
    key: `${index}`,
    label,
    fullLabel: `${MONTHS_LONG[index]} ${anchor.getFullYear()}`,
    value: 0,
  }));
}

function getBucketIndex(
  transaction: Transaction,
  date: Date,
  period: ReportPeriod
): number {
  if (period === 'daily') {
    const hour = Number(transaction.time.split(':')[0]);
    return Number.isFinite(hour) && hour >= 0 && hour <= 23
      ? Math.floor(hour / 4)
      : 0;
  }
  if (period === 'weekly') return (date.getDay() + 6) % 7;
  if (period === 'monthly') return Math.floor((date.getDate() - 1) / 7);
  return date.getMonth();
}

function addProductQuantities(
  totals: Map<string, number>,
  transaction: Transaction
) {
  for (const line of transaction.lines) {
    totals.set(line.productName, (totals.get(line.productName) ?? 0) + line.quantity);
  }
  for (const line of transaction.refundedLines ?? []) {
    totals.set(line.productName, (totals.get(line.productName) ?? 0) - line.quantity);
  }
}

function emptyReport(): ReportData {
  return {
    anchorDate: null,
    rangeLabel: 'Periode tidak tersedia',
    netSales: 0,
    successfulTransactions: 0,
    refundTotal: 0,
    averageTransaction: 0,
    buckets: [],
    paymentMethods: [],
    topProducts: [],
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDate(date: Date) {
  return `${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

function formatRange(start: Date, end: Date) {
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_LONG[end.getMonth()]} ${end.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_LONG[start.getMonth()]}–${end.getDate()} ${MONTHS_LONG[end.getMonth()]} ${end.getFullYear()}`;
}
