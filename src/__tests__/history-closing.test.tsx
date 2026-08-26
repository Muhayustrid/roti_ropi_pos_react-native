import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { HistoryScreen } from '../features/history/HistoryScreen';
import { TransactionDetail } from '../features/history/TransactionDetail';
import { MoreScreen } from '../features/more/MoreScreen';
import { ClosingScreen } from '../features/more/ClosingScreen';
import { ClosingConfirmScreen } from '../features/more/ClosingConfirmScreen';
import { ShiftClosedScreen } from '../features/more/ShiftClosedScreen';
import { sampleTransactions } from '../mock/data';
import { posReducer, initialPosState } from '../state/PosContext';

describe('Task 6: History, More/Session & Shift Closing Component Exports & Reducer', () => {
  describe('Component Definitions & Instantiation', () => {
    test('TransactionDetail is defined and instantiates with different transaction statuses', () => {
      expect(TransactionDetail).toBeDefined();

      // Success state
      const successTrx = sampleTransactions[0];
      const successEl = React.createElement(TransactionDetail, {
        transaction: successTrx,
        onRefund: jest.fn(),
      });
      expect(successEl).toBeDefined();

      // Refunded state
      const refundTrx = sampleTransactions.find((t) => t.status === 'Dikembalikan')!;
      const refundEl = React.createElement(TransactionDetail, {
        transaction: refundTrx,
      });
      expect(refundEl).toBeDefined();

      // Draft state
      const draftTrx = sampleTransactions.find((t) => t.status === 'Draf')!;
      const draftEl = React.createElement(TransactionDetail, {
        transaction: draftTrx,
        onResumeDraft: jest.fn(),
      });
      expect(draftEl).toBeDefined();
    });

    test('Transaction detail centers status and provides back and print actions for every status', () => {
      const detailSource = fs.readFileSync(
        path.join(process.cwd(), 'src/features/history/TransactionDetail.tsx'),
        'utf8'
      );
      const routeSource = fs.readFileSync(
        path.join(process.cwd(), 'app/transaction/[id].tsx'),
        'utf8'
      );

      expect(detailSource).toContain("alignSelf: 'center'");
      expect(detailSource).toContain('{onPrint ? (');
      expect(detailSource).not.toContain('{isSuccess && onPrint ? (');
      expect(routeSource).toContain('onPrint={handlePrint}');
      expect(routeSource).not.toContain('backIsClose');
    });

    test('History and detail support partial refunds and remaining refund action', () => {
      const historySource = fs.readFileSync(
        path.join(process.cwd(), 'src/features/history/HistoryScreen.tsx'),
        'utf8'
      );
      const detailSource = fs.readFileSync(
        path.join(process.cwd(), 'src/features/history/TransactionDetail.tsx'),
        'utf8'
      );
      const partialTransaction = {
        ...sampleTransactions[0],
        status: 'Dikembalikan Sebagian' as const,
        refundReason: 'Salah pesanan',
        refundMethod: 'Pengembalian QRIS',
        refundedLines: [{ productName: 'Roti Manis', quantity: 1, price: 12000 }],
        refundedSubtotal: 12000,
        refundedTax: 1200,
        refundedTotal: 13200,
      };

      expect(
        React.createElement(TransactionDetail, {
          transaction: partialTransaction,
          onRefund: jest.fn(),
          onPrint: jest.fn(),
        })
      ).toBeDefined();
      expect(historySource).toContain("item.status === 'Dikembalikan Sebagian'");
      expect(detailSource).toContain(
        "transaction.status === 'Dikembalikan Sebagian'"
      );
      expect(detailSource).toContain('refundedTotal');
    });

    test('HistoryScreen is defined and instantiates with navigation callbacks', () => {
      expect(HistoryScreen).toBeDefined();
      const element = React.createElement(HistoryScreen, {
        onSelectTransaction: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('MoreScreen is defined and instantiates with closing and demo callbacks', () => {
      expect(MoreScreen).toBeDefined();
      const element = React.createElement(MoreScreen, {
        onCloseShift: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('ClosingScreen is defined and instantiates with review callback', () => {
      expect(ClosingScreen).toBeDefined();
      const element = React.createElement(ClosingScreen, {
        onBack: jest.fn(),
        onReviewClosing: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('ClosingConfirmScreen is defined and instantiates with confirm callback', () => {
      expect(ClosingConfirmScreen).toBeDefined();
      const element = React.createElement(ClosingConfirmScreen, {
        onBack: jest.fn(),
        onConfirmClosing: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('ShiftClosedScreen is defined and instantiates with finish callback', () => {
      expect(ShiftClosedScreen).toBeDefined();
      const element = React.createElement(ShiftClosedScreen, {
        onFinish: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('ShiftClosedScreen centers the sent status badge', () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'src/features/more/ShiftClosedScreen.tsx'),
        'utf8'
      );
      const badgeStyle = source.match(/badge:\s*\{([\s\S]*?)\},/);

      expect(badgeStyle).toBeTruthy();
      expect(badgeStyle?.[1]).toContain("alignSelf: 'center'");
    });
  });

  describe('History & Closing Reducer State Transitions', () => {
    test('SET_HISTORY_FILTER updates filter accurately', () => {
      let state = posReducer(initialPosState, {
        type: 'SET_HISTORY_FILTER',
        payload: 'Refunded',
      });
      expect(state.historyFilter).toBe('Refunded');

      state = posReducer(state, {
        type: 'SET_HISTORY_FILTER',
        payload: 'Draft',
      });
      expect(state.historyFilter).toBe('Draft');

      state = posReducer(state, {
        type: 'SET_HISTORY_FILTER',
        payload: 'All',
      });
      expect(state.historyFilter).toBe('All');
    });

    test('SELECT_TRANSACTION updates selectedTransactionId', () => {
      const state = posReducer(initialPosState, {
        type: 'SELECT_TRANSACTION',
        payload: '#TRX-9400',
      });
      expect(state.selectedTransactionId).toBe('#TRX-9400');
    });

    test('SET_COUNTED updates closing row counted and difference', () => {
      const state = posReducer(initialPosState, {
        type: 'SET_COUNTED',
        payload: { method: 'Tunai', counted: 865000 },
      });
      const tunaiRow = state.closingRows.find((r) => r.method === 'Tunai');
      expect(tunaiRow).toBeDefined();
      expect(tunaiRow?.counted).toBe(865000);
      expect(tunaiRow?.difference).toBe(0); // 865000 - 865000
    });

    test('Demo toggles TOGGLE_OFFLINE_DEMO and TOGGLE_ERROR_DEMO operate correctly', () => {
      let state = posReducer(initialPosState, { type: 'TOGGLE_OFFLINE_DEMO' });
      expect(state.isOfflineDemo).toBe(true);
      state = posReducer(state, { type: 'TOGGLE_OFFLINE_DEMO' });
      expect(state.isOfflineDemo).toBe(false);

      state = posReducer(state, { type: 'TOGGLE_ERROR_DEMO' });
      expect(state.isErrorDemo).toBe(true);
      state = posReducer(state, { type: 'TOGGLE_ERROR_DEMO' });
      expect(state.isErrorDemo).toBe(false);
    });

    test('MoreScreen renders visible offline and error demo feedback', () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'src/features/more/MoreScreen.tsx'),
        'utf8'
      );

      expect(source).toContain('Anda sedang offline');
      expect(source).toContain('Simulasi error aktif');
    });

    test('MoreScreen provides a short visible loading simulation', () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'src/features/more/MoreScreen.tsx'),
        'utf8'
      );

      expect(source).toContain('Jalankan Simulasi Loading');
      expect(source).toContain('Memuat simulasi POS');
      expect(source).toMatch(/setTimeout\([\s\S]*?1200\)/);
    });

    test('RESET_SESSION restores initial session defaults', () => {
      let state = posReducer(initialPosState, {
        type: 'SET_HISTORY_FILTER',
        payload: 'Draft',
      });
      state = posReducer(state, { type: 'TOGGLE_OFFLINE_DEMO' });
      expect(state.isOfflineDemo).toBe(true);

      const resetState = posReducer(state, { type: 'RESET_SESSION' });
      expect(resetState.historyFilter).toBe('All');
      expect(resetState.isOfflineDemo).toBe(false);
      expect(resetState.cart.length).toBe(1);
    });
  });
});
