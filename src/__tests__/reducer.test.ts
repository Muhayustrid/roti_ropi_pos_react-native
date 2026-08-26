import { posReducer, initialPosState, computePosDerived } from '../state/PosContext';
import { sampleProducts, sampleCustomers, samplePromos } from '../mock/data';

describe('posReducer', () => {
  test('initial state matches expected defaults from DESIGN.md 3.3', () => {
    expect(initialPosState.selectedCategory).toBe('Semua');
    expect(initialPosState.searchQuery).toBe('');
    expect(initialPosState.cart.length).toBe(1);
    expect(initialPosState.cart[0].product.name).toBe('Roti Manis');
    expect(initialPosState.cart[0].quantity).toBe(1);
    expect(initialPosState.customer.name).toBe('Pelanggan Umum');
    expect(initialPosState.promo.id).toBe('Weekend');
    expect(initialPosState.couponCode).toBe('');
    expect(initialPosState.paymentMethod).toBe('Qris');
    expect(initialPosState.cashReceived).toBe(100000);
    expect(initialPosState.historyFilter).toBe('All');
    expect(initialPosState.selectedTransactionId).toBe('#TRX-9402');
    expect(initialPosState.closingRows.length).toBeGreaterThan(0);
    expect(initialPosState.openingCash).toBe(200000);
    expect(initialPosState.openingQris).toBe(0);
    expect(initialPosState.isOfflineDemo).toBe(false);
    expect(initialPosState.isErrorDemo).toBe(false);
    expect(initialPosState.printerSettings).toEqual({
      paperWidth: '80 mm',
      copies: 1,
      autoPrint: false,
    });
  });

  test('SET_CATEGORY updates selectedCategory', () => {
    const nextState = posReducer(initialPosState, { type: 'SET_CATEGORY', payload: 'Pastry' });
    expect(nextState.selectedCategory).toBe('Pastry');
  });

  test('SET_SEARCH_QUERY updates searchQuery', () => {
    const nextState = posReducer(initialPosState, { type: 'SET_SEARCH_QUERY', payload: 'croissant' });
    expect(nextState.searchQuery).toBe('croissant');
  });

  test('ADD_PRODUCT adds new product or increments existing', () => {
    // Add existing (Roti Manis)
    const state1 = posReducer(initialPosState, { type: 'ADD_PRODUCT', payload: sampleProducts[0] });
    expect(state1.cart.find((l) => l.product.id === sampleProducts[0].id)?.quantity).toBe(2);

    // Add new product (Croissant Butter)
    const state2 = posReducer(state1, { type: 'ADD_PRODUCT', payload: sampleProducts[1] });
    expect(state2.cart.find((l) => l.product.id === sampleProducts[1].id)?.quantity).toBe(1);
    expect(state2.cart.length).toBe(2);
  });

  test('CHANGE_QUANTITY updates quantity or removes line when quantity <= 0', () => {
    const state1 = posReducer(initialPosState, {
      type: 'CHANGE_QUANTITY',
      payload: { productId: sampleProducts[0].id, delta: 2 },
    });
    expect(state1.cart[0].quantity).toBe(3);

    const state2 = posReducer(state1, {
      type: 'CHANGE_QUANTITY',
      payload: { productId: sampleProducts[0].id, delta: -3 },
    });
    expect(state2.cart.length).toBe(0);
  });

  test('REMOVE_LINE removes item from cart', () => {
    const nextState = posReducer(initialPosState, { type: 'REMOVE_LINE', payload: sampleProducts[0].id });
    expect(nextState.cart.length).toBe(0);
  });

  test('CLEAR_CART empties cart', () => {
    const nextState = posReducer(initialPosState, { type: 'CLEAR_CART' });
    expect(nextState.cart).toEqual([]);
  });

  test('SELECT_CUSTOMER, SELECT_PROMO, APPLY_COUPON, CLEAR_COUPON', () => {
    const stateWithCustomer = posReducer(initialPosState, {
      type: 'SELECT_CUSTOMER',
      payload: sampleCustomers[1],
    });
    expect(stateWithCustomer.customer.name).toBe('Ahmad Rizky');

    const stateWithPromo = posReducer(initialPosState, {
      type: 'SELECT_PROMO',
      payload: samplePromos[1],
    });
    expect(stateWithPromo.promo.name).toBe('Diskon Member 5%');

    const stateWithCoupon = posReducer(initialPosState, {
      type: 'APPLY_COUPON',
      payload: 'ropi10k',
    });
    expect(stateWithCoupon.couponCode).toBe('ROPI10K');

    const stateClearedCoupon = posReducer(stateWithCoupon, { type: 'CLEAR_COUPON' });
    expect(stateClearedCoupon.couponCode).toBe('');
  });

  test('SET_PAYMENT_METHOD and cash entry actions', () => {
    const state1 = posReducer(initialPosState, { type: 'SET_PAYMENT_METHOD', payload: 'Cash' });
    expect(state1.paymentMethod).toBe('Cash');

    const state2 = posReducer(state1, { type: 'SET_CASH', payload: 50000 });
    expect(state2.cashReceived).toBe(50000);

    const state3 = posReducer(state2, { type: 'SET_CASH_EXACT', payload: 12000 });
    expect(state3.cashReceived).toBe(12000);

    const state4 = posReducer(state3, { type: 'APPEND_CASH_DIGITS', payload: '000' });
    expect(state4.cashReceived).toBe(12000000);

    const state5 = posReducer(state4, { type: 'BACKSPACE_CASH' });
    expect(state5.cashReceived).toBe(1200000);
  });

  test('SET_HISTORY_FILTER and SELECT_TRANSACTION', () => {
    const state1 = posReducer(initialPosState, { type: 'SET_HISTORY_FILTER', payload: 'Refunded' });
    expect(state1.historyFilter).toBe('Refunded');

    const state2 = posReducer(state1, { type: 'SELECT_TRANSACTION', payload: '#TRX-9400' });
    expect(state2.selectedTransactionId).toBe('#TRX-9400');
  });

  test('COMPLETE_REFUND accumulates partial and full refunds and restores stock once', () => {
    const partial = posReducer(initialPosState, {
      type: 'COMPLETE_REFUND',
      payload: {
        transactionId: '#TRX-9402',
        lines: [{ lineIndex: 0, quantity: 1 }],
        reason: 'Salah pesanan',
        method: 'Pengembalian QRIS',
      },
    });

    expect(partial.transactions.find((t) => t.id === '#TRX-9402')).toMatchObject({
      status: 'Dikembalikan Sebagian',
      refundedSubtotal: 12000,
      refundedTax: 1200,
      refundedTotal: 13200,
      refundReason: 'Salah pesanan',
      refundMethod: 'Pengembalian QRIS',
    });
    expect(partial.products.find((p) => p.name === 'Roti Manis')?.stock).toBe(43);

    const full = posReducer(partial, {
      type: 'COMPLETE_REFUND',
      payload: {
        transactionId: '#TRX-9402',
        lines: [
          { lineIndex: 0, quantity: 1 },
          { lineIndex: 1, quantity: 3 },
        ],
        reason: 'Produk rusak',
        method: 'Pengembalian Tunai',
      },
    });
    const transaction = full.transactions.find((t) => t.id === '#TRX-9402');
    expect(transaction).toMatchObject({
      status: 'Dikembalikan',
      refundedSubtotal: 79500,
      refundedTax: 7950,
      refundedTotal: 87450,
      refundReason: 'Produk rusak',
      refundMethod: 'Pengembalian Tunai',
    });
    expect(full.products.find((p) => p.name === 'Roti Manis')?.stock).toBe(44);
    expect(full.products.find((p) => p.name === 'Croissant Butter')?.stock).toBe(21);

    const duplicate = posReducer(full, {
      type: 'COMPLETE_REFUND',
      payload: {
        transactionId: '#TRX-9402',
        lines: [{ lineIndex: 0, quantity: 1 }],
        reason: 'Salah pesanan',
        method: 'Pengembalian QRIS',
      },
    });
    expect(duplicate).toBe(full);
  });

  test('COMPLETE_REFUND records unmatched products without changing product stock', () => {
    const nextState = posReducer(initialPosState, {
      type: 'COMPLETE_REFUND',
      payload: {
        transactionId: '#TRX-9400',
        lines: [{ lineIndex: 0, quantity: 1 }],
        reason: 'Produk rusak',
        method: 'Pengembalian Tunai',
      },
    });

    expect(nextState).toBe(initialPosState);
    expect(nextState.products).toEqual(initialPosState.products);
  });

  test('Refunded filter includes partial refunds', () => {
    const partial = posReducer(initialPosState, {
      type: 'COMPLETE_REFUND',
      payload: {
        transactionId: '#TRX-9402',
        lines: [{ lineIndex: 0, quantity: 1 }],
        reason: 'Salah pesanan',
        method: 'Pengembalian QRIS',
      },
    });
    const refunded = computePosDerived({ ...partial, historyFilter: 'Refunded' });

    expect(refunded.visibleTransactions.map((t) => t.id)).toContain('#TRX-9402');
  });

  test('SET_COUNTED updates counted row and recalculates difference', () => {
    const state1 = posReducer(initialPosState, {
      type: 'SET_COUNTED',
      payload: { method: 'Tunai', counted: 865000 },
    });
    const row = state1.closingRows.find((r) => r.method === 'Tunai');
    expect(row?.counted).toBe(865000);
    expect(row?.difference).toBe(0);
  });

  test('SET_OPENING_BALANCES updates openingCash and openingQris', () => {
    const state1 = posReducer(initialPosState, {
      type: 'SET_OPENING_BALANCES',
      payload: { cash: 300000, qris: 50000 },
    });
    expect(state1.openingCash).toBe(300000);
    expect(state1.openingQris).toBe(50000);
  });

  test('TOGGLE_OFFLINE_DEMO and TOGGLE_ERROR_DEMO', () => {
    const s1 = posReducer(initialPosState, { type: 'TOGGLE_OFFLINE_DEMO' });
    expect(s1.isOfflineDemo).toBe(true);

    const s2 = posReducer(initialPosState, { type: 'TOGGLE_ERROR_DEMO' });
    expect(s2.isErrorDemo).toBe(true);
  });

  test('printer actions update paper width, copies, and Auto-print', () => {
    const withPaper = posReducer(initialPosState, {
      type: 'SET_PRINTER_PAPER_WIDTH',
      payload: '58 mm',
    });
    const withCopies = posReducer(withPaper, {
      type: 'SET_PRINTER_COPIES',
      payload: 3,
    });
    const withAutoPrint = posReducer(withCopies, {
      type: 'SET_PRINTER_AUTO_PRINT',
      payload: true,
    });

    expect(withAutoPrint.printerSettings).toEqual({
      paperWidth: '58 mm',
      copies: 3,
      autoPrint: true,
    });
  });

  test('RESET_SESSION restores default state', () => {
    const modified = posReducer(
      posReducer(initialPosState, {
        type: 'SET_PRINTER_AUTO_PRINT',
        payload: true,
      }),
      { type: 'CLEAR_CART' }
    );
    expect(modified.cart.length).toBe(0);

    const reset = posReducer(modified, { type: 'RESET_SESSION' });
    expect(reset.cart.length).toBe(1);
    expect(reset.cart[0].product.name).toBe('Roti Manis');
    expect(reset.printerSettings).toEqual({
      paperWidth: '80 mm',
      copies: 1,
      autoPrint: false,
    });
  });

  test('computePosDerived selectedTransaction must search visibleTransactions, then fallback visibleTransactions[0]', () => {
    // Initial state: selected is #TRX-9402 (Success status)
    // When filter changes to Refunded, #TRX-9402 is hidden in visibleTransactions.
    // The derived selectedTransaction MUST be #TRX-9400 (first item in Refunded visibleTransactions), NOT #TRX-9402.
    const refundedState = posReducer(initialPosState, { type: 'SET_HISTORY_FILTER', payload: 'Refunded' });
    const derived = computePosDerived(refundedState);

    expect(derived.visibleTransactions.length).toBe(1);
    expect(derived.visibleTransactions[0].id).toBe('#TRX-9400');
    expect(derived.selectedTransaction?.id).toBe('#TRX-9400');

    // When selecting a transaction within the visible list
    const stateSelectedRefund = posReducer(refundedState, { type: 'SELECT_TRANSACTION', payload: '#TRX-9400' });
    const derivedSelected = computePosDerived(stateSelectedRefund);
    expect(derivedSelected.selectedTransaction?.id).toBe('#TRX-9400');
  });
});
