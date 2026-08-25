import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type {
  Product,
  CartLine,
  Customer,
  Promo,
  PaymentMethodType,
  HistoryFilterType,
  ClosingRow,
  CartTotals,
  Transaction,
} from '../types';
import {
  sampleProducts,
  sampleCustomers,
  samplePromos,
  sampleClosingRows,
  sampleTransactions,
} from '../mock/data';
import { calculateCart } from '../utils/cart';

export interface PosState {
  selectedCategory: string;
  searchQuery: string;
  cart: CartLine[];
  customer: Customer;
  promo: Promo;
  couponCode: string;
  paymentMethod: PaymentMethodType;
  cashReceived: number;
  historyFilter: HistoryFilterType;
  selectedTransactionId: string;
  closingRows: ClosingRow[];
  openingCash: number;
  openingQris: number;
  isOfflineDemo: boolean;
  isErrorDemo: boolean;
  transactions: Transaction[];
}

export type PosAction =
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'CHANGE_QUANTITY'; payload: { productId: string; delta: number } }
  | { type: 'REMOVE_LINE'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SELECT_CUSTOMER'; payload: Customer }
  | { type: 'SELECT_PROMO'; payload: Promo }
  | { type: 'APPLY_COUPON'; payload: string }
  | { type: 'CLEAR_COUPON' }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethodType }
  | { type: 'SET_CASH'; payload: number }
  | { type: 'SET_CASH_EXACT'; payload: number }
  | { type: 'APPEND_CASH_DIGITS'; payload: string }
  | { type: 'BACKSPACE_CASH' }
  | { type: 'SET_HISTORY_FILTER'; payload: HistoryFilterType }
  | { type: 'SELECT_TRANSACTION'; payload: string }
  | { type: 'SET_COUNTED'; payload: { method: string; counted: number } }
  | { type: 'SET_OPENING_BALANCES'; payload: { cash: number; qris: number } }
  | { type: 'TOGGLE_OFFLINE_DEMO' }
  | { type: 'TOGGLE_ERROR_DEMO' }
  | { type: 'RESET_SESSION' };

export const initialPosState: PosState = {
  selectedCategory: 'Semua',
  searchQuery: '',
  cart: [{ product: sampleProducts[0], quantity: 1 }],
  customer: sampleCustomers[0],
  promo: samplePromos[0],
  couponCode: '',
  paymentMethod: 'Qris',
  cashReceived: 100000,
  historyFilter: 'All',
  selectedTransactionId: '#TRX-9402',
  closingRows: sampleClosingRows,
  openingCash: 200000,
  openingQris: 0,
  isOfflineDemo: false,
  isErrorDemo: false,
  transactions: sampleTransactions,
};

export function posReducer(state: PosState, action: PosAction): PosState {
  switch (action.type) {
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'ADD_PRODUCT': {
      const existing = state.cart.find((l) => l.product.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((l) =>
            l.product.id === action.payload.id ? { ...l, quantity: l.quantity + 1 } : l
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload, quantity: 1 }],
      };
    }

    case 'CHANGE_QUANTITY': {
      const { productId, delta } = action.payload;
      const updated = state.cart
        .map((l) => (l.product.id === productId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0);
      return { ...state, cart: updated };
    }

    case 'REMOVE_LINE':
      return {
        ...state,
        cart: state.cart.filter((l) => l.product.id !== action.payload),
      };

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'SELECT_CUSTOMER':
      return { ...state, customer: action.payload };

    case 'SELECT_PROMO':
      return { ...state, promo: action.payload };

    case 'APPLY_COUPON':
      return { ...state, couponCode: action.payload.trim().toUpperCase() };

    case 'CLEAR_COUPON':
      return { ...state, couponCode: '' };

    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };

    case 'SET_CASH':
      return { ...state, cashReceived: Math.max(0, action.payload) };

    case 'SET_CASH_EXACT':
      return { ...state, cashReceived: Math.max(0, action.payload) };

    case 'APPEND_CASH_DIGITS': {
      const currentStr = state.cashReceived === 0 ? '' : state.cashReceived.toString();
      const newStr = (currentStr + action.payload).slice(0, 12);
      const parsed = parseInt(newStr, 10) || 0;
      return { ...state, cashReceived: parsed };
    }

    case 'BACKSPACE_CASH': {
      const str = state.cashReceived.toString();
      if (str.length <= 1) {
        return { ...state, cashReceived: 0 };
      }
      const newStr = str.slice(0, -1);
      return { ...state, cashReceived: parseInt(newStr, 10) || 0 };
    }

    case 'SET_HISTORY_FILTER':
      return { ...state, historyFilter: action.payload };

    case 'SELECT_TRANSACTION':
      return { ...state, selectedTransactionId: action.payload };

    case 'SET_COUNTED': {
      const { method, counted } = action.payload;
      const updatedRows = state.closingRows.map((row) => {
        if (row.method === method) {
          return {
            ...row,
            counted,
            // ponytail: local difference calculation for Phase 1 mockup presentation; Phase 2 replaces with ERPNext preview/submit values
            difference: counted - row.expected,
          };
        }
        return row;
      });
      return { ...state, closingRows: updatedRows };
    }

    case 'SET_OPENING_BALANCES':
      return {
        ...state,
        openingCash: action.payload.cash,
        openingQris: action.payload.qris,
      };

    case 'TOGGLE_OFFLINE_DEMO':
      return { ...state, isOfflineDemo: !state.isOfflineDemo };

    case 'TOGGLE_ERROR_DEMO':
      return { ...state, isErrorDemo: !state.isErrorDemo };

    case 'RESET_SESSION':
      return {
        ...initialPosState,
        cart: [{ product: sampleProducts[0], quantity: 1 }],
      };

    default:
      return state;
  }
}

export interface PosDerivedState {
  totals: CartTotals;
  change: number;
  remaining: number;
  openingTotal: number;
  visibleProducts: Product[];
  visibleTransactions: Transaction[];
  selectedTransaction: Transaction | undefined;
  closingExpected: number;
  closingCounted: number;
  closingDifference: number;
}

export type PosActions = {
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  addProduct: (product: Product) => void;
  changeQuantity: (productId: string, delta: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  selectCustomer: (customer: Customer) => void;
  selectPromo: (promo: Promo) => void;
  applyCoupon: (code: string) => void;
  clearCoupon: () => void;
  setPaymentMethod: (method: PaymentMethodType) => void;
  setCash: (amount: number) => void;
  setCashExact: (amount: number) => void;
  appendCashDigits: (digits: string) => void;
  backspaceCash: () => void;
  setHistoryFilter: (filter: HistoryFilterType) => void;
  selectTransaction: (id: string) => void;
  setCounted: (method: string, counted: number) => void;
  setOpeningBalances: (cash: number, qris: number) => void;
  toggleOfflineDemo: () => void;
  toggleErrorDemo: () => void;
  resetSession: () => void;
};

const PosStateContext = createContext<PosState | null>(null);
const PosDerivedContext = createContext<PosDerivedState | null>(null);
const PosActionsContext = createContext<PosActions | null>(null);

export function computePosDerived(state: PosState): PosDerivedState {
  const totals = calculateCart(state.cart, state.promo, state.couponCode);
  const change = Math.max(0, state.cashReceived - totals.total);
  const remaining = Math.max(0, totals.total - state.cashReceived);
  const openingTotal = state.openingCash + state.openingQris;

  const visibleProducts = sampleProducts.filter((p) => {
    const matchCategory =
      state.selectedCategory === 'Semua' || p.category === state.selectedCategory;
    const matchQuery =
      !state.searchQuery ||
      p.name.toLowerCase().includes(state.searchQuery.trim().toLowerCase());
    return matchCategory && matchQuery;
  });

  const visibleTransactions = state.transactions.filter((t) => {
    if (state.historyFilter === 'All') return true;
    if (state.historyFilter === 'Success') return t.status === 'Berhasil';
    if (state.historyFilter === 'Refunded') return t.status === 'Dikembalikan';
    if (state.historyFilter === 'Draft') return t.status === 'Draf';
    return true;
  });

  const selectedTransaction =
    visibleTransactions.find((t) => t.id === state.selectedTransactionId) ||
    visibleTransactions[0];

  const closingExpected = state.closingRows.reduce((sum, r) => sum + r.expected, 0);
  const closingCounted = state.closingRows.reduce((sum, r) => sum + r.counted, 0);
  // ponytail: local difference calculation for Phase 1 mockup presentation; Phase 2 replaces with ERPNext preview/submit values
  const closingDifference = state.closingRows.reduce(
    (sum, r) => sum + (r.difference ?? r.counted - r.expected),
    0
  );

  return {
    totals,
    change,
    remaining,
    openingTotal,
    visibleProducts,
    visibleTransactions,
    selectedTransaction,
    closingExpected,
    closingCounted,
    closingDifference,
  };
}

export function PosProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, initialPosState);

  const derived = useMemo<PosDerivedState>(() => computePosDerived(state), [state]);

  const actions = useMemo<PosActions>(() => {
    return {
      setCategory: (category: string) => dispatch({ type: 'SET_CATEGORY', payload: category }),
      setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
      addProduct: (product: Product) => dispatch({ type: 'ADD_PRODUCT', payload: product }),
      changeQuantity: (productId: string, delta: number) =>
        dispatch({ type: 'CHANGE_QUANTITY', payload: { productId, delta } }),
      removeLine: (productId: string) => dispatch({ type: 'REMOVE_LINE', payload: productId }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      selectCustomer: (customer: Customer) =>
        dispatch({ type: 'SELECT_CUSTOMER', payload: customer }),
      selectPromo: (promo: Promo) => dispatch({ type: 'SELECT_PROMO', payload: promo }),
      applyCoupon: (code: string) => dispatch({ type: 'APPLY_COUPON', payload: code }),
      clearCoupon: () => dispatch({ type: 'CLEAR_COUPON' }),
      setPaymentMethod: (method: PaymentMethodType) =>
        dispatch({ type: 'SET_PAYMENT_METHOD', payload: method }),
      setCash: (amount: number) => dispatch({ type: 'SET_CASH', payload: amount }),
      setCashExact: (amount: number) => dispatch({ type: 'SET_CASH_EXACT', payload: amount }),
      appendCashDigits: (digits: string) =>
        dispatch({ type: 'APPEND_CASH_DIGITS', payload: digits }),
      backspaceCash: () => dispatch({ type: 'BACKSPACE_CASH' }),
      setHistoryFilter: (filter: HistoryFilterType) =>
        dispatch({ type: 'SET_HISTORY_FILTER', payload: filter }),
      selectTransaction: (id: string) =>
        dispatch({ type: 'SELECT_TRANSACTION', payload: id }),
      setCounted: (method: string, counted: number) =>
        dispatch({ type: 'SET_COUNTED', payload: { method, counted } }),
      setOpeningBalances: (cash: number, qris: number) =>
        dispatch({ type: 'SET_OPENING_BALANCES', payload: { cash, qris } }),
      toggleOfflineDemo: () => dispatch({ type: 'TOGGLE_OFFLINE_DEMO' }),
      toggleErrorDemo: () => dispatch({ type: 'TOGGLE_ERROR_DEMO' }),
      resetSession: () => dispatch({ type: 'RESET_SESSION' }),
    };
  }, []);

  return (
    <PosStateContext.Provider value={state}>
      <PosDerivedContext.Provider value={derived}>
        <PosActionsContext.Provider value={actions}>{children}</PosActionsContext.Provider>
      </PosDerivedContext.Provider>
    </PosStateContext.Provider>
  );
}

export function usePosState(): PosState {
  const context = useContext(PosStateContext);
  if (!context) throw new Error('usePosState must be used within PosProvider');
  return context;
}

export function usePosDerived(): PosDerivedState {
  const context = useContext(PosDerivedContext);
  if (!context) throw new Error('usePosDerived must be used within PosProvider');
  return context;
}

export function usePosActions(): PosActions {
  const context = useContext(PosActionsContext);
  if (!context) throw new Error('usePosActions must be used within PosProvider');
  return context;
}
