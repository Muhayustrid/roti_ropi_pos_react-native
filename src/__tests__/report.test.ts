import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import type { Transaction } from '../types';
import { buildReport, type ReportPeriod } from '../features/more/report';
import { ReportScreen } from '../features/more/ReportScreen';

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: '#TEST-1',
    time: '14:20',
    date: '24 Okt 2026',
    status: 'Berhasil',
    method: 'QRIS',
    customerName: 'Pelanggan Umum',
    itemCount: 2,
    subtotal: 20000,
    tax: 2000,
    total: 22000,
    lines: [{ productName: 'Roti Manis', quantity: 2, price: 10000 }],
    ...overrides,
  };
}

describe('buildReport', () => {
  test('anchors daily report to latest parseable transaction and excludes drafts', () => {
    const report = buildReport(
      [
        transaction({ id: '#OLD', date: '23 Okt 2026', total: 11000 }),
        transaction({ id: '#LATEST', total: 22000 }),
        transaction({ id: '#DRAFT', status: 'Draf', total: 99000 }),
      ],
      'daily'
    );

    expect(report.rangeLabel).toBe('24 Oktober 2026');
    expect(report.netSales).toBe(22000);
    expect(report.successfulTransactions).toBe(1);
    expect(report.buckets).toHaveLength(6);
    expect(report.buckets.reduce((sum, bucket) => sum + bucket.value, 0)).toBe(
      22000
    );
  });

  test('calculates partial and full refunds without negative sales', () => {
    const report = buildReport(
      [
        transaction({
          id: '#PARTIAL',
          total: 22000,
          status: 'Dikembalikan Sebagian',
          refundedTotal: 7000,
          refundedLines: [
            { productName: 'Roti Manis', quantity: 1, price: 10000 },
          ],
        }),
        transaction({
          id: '#FULL',
          total: 15000,
          status: 'Dikembalikan',
        }),
      ],
      'daily'
    );

    expect(report.netSales).toBe(15000);
    expect(report.refundTotal).toBe(22000);
    expect(report.successfulTransactions).toBe(1);
    expect(report.averageTransaction).toBe(15000);
  });

  test.each([
    ['daily', 6],
    ['weekly', 7],
    ['monthly', 5],
    ['yearly', 12],
  ] as const)(
    '%s report returns stable zero-filled buckets',
    (period, count) => {
      const report = buildReport(
        [transaction()],
        period as ReportPeriod
      );
      expect(report.buckets).toHaveLength(count);
      expect(report.buckets.every((bucket) => bucket.label.length > 0)).toBe(
        true
      );
    }
  );

  test('ranks payment methods by net sales', () => {
    const report = buildReport(
      [
        transaction({ id: '#QRIS', method: 'QRIS', total: 22000 }),
        transaction({ id: '#CASH', method: 'Tunai', total: 33000 }),
      ],
      'daily'
    );

    expect(report.paymentMethods).toEqual([
      { label: 'Tunai', value: 33000 },
      { label: 'QRIS', value: 22000 },
    ]);
  });

  test('subtracts refunded quantities and limits top products to three', () => {
    const report = buildReport(
      [
        transaction({
          id: '#PRODUCTS',
          lines: [
            { productName: 'A', quantity: 5, price: 1000 },
            { productName: 'B', quantity: 4, price: 1000 },
            { productName: 'C', quantity: 3, price: 1000 },
            { productName: 'D', quantity: 2, price: 1000 },
          ],
          refundedLines: [
            { productName: 'A', quantity: 3, price: 1000 },
          ],
          status: 'Dikembalikan Sebagian',
          refundedTotal: 3000,
        }),
      ],
      'daily'
    );

    expect(report.topProducts).toEqual([
      { name: 'B', quantity: 4 },
      { name: 'C', quantity: 3 },
      { name: 'A', quantity: 2 },
    ]);
  });

  test('returns safe empty data when every date is invalid', () => {
    const report = buildReport([transaction({ date: 'invalid' })], 'daily');
    expect(report.anchorDate).toBeNull();
    expect(report.rangeLabel).toBe('Periode tidak tersedia');
    expect(report.netSales).toBe(0);
    expect(report.buckets).toEqual([]);
  });
});

describe('ReportScreen contracts', () => {
  test('exports a report screen using existing POS state', () => {
    expect(ReportScreen).toBeDefined();
    expect(
      React.createElement(ReportScreen, { onBack: jest.fn() })
    ).toBeDefined();
  });

  test('provides four accessible periods and labeled chart values', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/more/ReportScreen.tsx'),
      'utf8'
    );

    expect(source).toContain('REPORT_PERIODS.map');
    expect(source).toContain('accessibilityState={{ selected }}');
    expect(source).toContain(
      'accessibilityLabel={`${bucket.fullLabel}, ${formatRupiah(bucket.value)}`}'
    );
    expect(source).toContain('Belum ada transaksi pada periode ini');
  });

  test('prints daily closing with printer settings and guarded timers', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/more/ReportScreen.tsx'),
      'utf8'
    );

    expect(source).toContain("buildReport(transactions, 'daily')");
    expect(source).toContain('if (isPrinting) return');
    expect(source).toContain('Mencetak laporan…');
    expect(source).toContain('Laporan closing berhasil dicetak');
    expect(source).toMatch(/setTimeout\([\s\S]*?1200\)/);
    expect(source).toMatch(/setTimeout\([\s\S]*?2500\)/);
    expect(source).toContain('clearTimeout');
  });
});

describe('report navigation', () => {
  test('More screen exposes report entry and route callback', () => {
    const moreSource = fs.readFileSync(
      path.join(process.cwd(), 'src/features/more/MoreScreen.tsx'),
      'utf8'
    );
    const tabRouteSource = fs.readFileSync(
      path.join(process.cwd(), 'app/(pos)/more.tsx'),
      'utf8'
    );

    expect(moreSource).toContain('onOpenReport?: () => void');
    expect(moreSource).toContain('Buka laporan penjualan');
    expect(moreSource).toContain('Laporan');
    expect(tabRouteSource).toContain(
      "onOpenReport={() => router.push('/report')}"
    );
  });

  test('report route remains a thin router adapter', () => {
    const routeSource = fs.readFileSync(
      path.join(process.cwd(), 'app/report.tsx'),
      'utf8'
    );

    expect(routeSource).toContain('<ReportScreen');
    expect(routeSource).toContain('router.back()');
  });
});
