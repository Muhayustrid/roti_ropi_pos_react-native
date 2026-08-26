import fs from 'node:fs';
import path from 'node:path';
import { initialPosState, posReducer } from '../state/PosContext';

const readSource = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('printer settings', () => {
  test('route and More screen link to printer settings', () => {
    const route = readSource('app/printer.tsx');
    const moreRoute = readSource('app/(pos)/more.tsx');
    const moreScreen = readSource('src/features/more/MoreScreen.tsx');

    expect(route).toContain('<PrinterSettingsScreen');
    expect(route).toContain('router.back()');
    expect(moreRoute).toContain("router.push('/printer')");
    expect(moreScreen).toContain('onOpenPrinter');
    expect(moreScreen).toContain('Terhubung (Mock)');
  });

  test('printer screen offers immediate settings and Test Print feedback', () => {
    const source = readSource('src/features/more/PrinterSettingsScreen.tsx');

    expect(source).toContain('title="Pengaturan Printer"');
    expect(source).toContain('Printer Kasir Utama');
    expect(source).toContain("(['58 mm', '80 mm']");
    expect(source).toContain('([1, 2, 3]');
    expect(source).toContain('actions.setAutoPrint');
    expect(source).toContain('}, 1200)');
    expect(source).toContain('Test print berhasil');
    expect(source).not.toContain('label="Simpan"');
  });

  test('printer settings remain in-memory reducer state', () => {
    const changed = posReducer(initialPosState, {
      type: 'SET_PRINTER_AUTO_PRINT',
      payload: true,
    });

    expect(changed.printerSettings.autoPrint).toBe(true);
  });

  test('successful payment forwards one-shot Auto-print settings to receipt', () => {
    const successSource = readSource(
      'src/features/payment/PaymentSuccessScreen.tsx'
    );
    const receiptSource = readSource('src/features/payment/ReceiptContent.tsx');

    expect(successSource).toContain('autoPrint={state.printerSettings.autoPrint}');
    expect(successSource).toContain('paperWidth={state.printerSettings.paperWidth}');
    expect(successSource).toContain('copies={state.printerSettings.copies}');
    expect(receiptSource).toContain('hasAutoPrinted');
    expect(receiptSource).toContain('if (!autoPrint || hasAutoPrinted.current) return;');
    expect(receiptSource).toContain('Struk berhasil dicetak');
    expect(receiptSource).toContain('${copies}x, ${paperWidth}');
  });
});
