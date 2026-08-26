import type { ToneName } from './theme/tokens';

export type ProductCategory = 'Semua' | 'Roti' | 'Pastry' | 'Kue' | 'Minuman' | string;

export interface Product {
  id: string;
  name: string;
  initials: string;
  unit: string;
  category: ProductCategory;
  price: number;
  stock: number;
  lowStock?: boolean;
  tone: ToneName;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  detail: string;
  isDefault?: boolean;
}

export interface Promo {
  id: string;
  name: string;
  percent: number;
  isBest?: boolean;
}

export type PaymentMethodType = 'Cash' | 'Qris' | 'CardPayment' | string;

export type PaperWidth = '58 mm' | '80 mm';
export type PrintCopies = 1 | 2 | 3;

export interface PrinterSettings {
  paperWidth: PaperWidth;
  copies: PrintCopies;
  autoPrint: boolean;
}

export interface PaymentMethodOption {
  id: PaymentMethodType;
  label: string;
  detail: string;
  tone: ToneName;
}

export type HistoryFilterType = 'All' | 'Success' | 'Refunded' | 'Draft';

export type TransactionStatus =
  | 'Berhasil'
  | 'Dikembalikan Sebagian'
  | 'Dikembalikan'
  | 'Draf';

export interface TransactionLine {
  productName: string;
  quantity: number;
  price: number;
}

export type RefundLine = TransactionLine;

export interface Transaction {
  id: string;
  time: string;
  date: string;
  status: TransactionStatus;
  method: string;
  customerName: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  lines: TransactionLine[];
  refundReason?: string;
  refundMethod?: string;
  refundedLines?: RefundLine[];
  refundedSubtotal?: number;
  refundedTax?: number;
  refundedTotal?: number;
}

export interface SessionInfo {
  cashier: string;
  posProfile: string;
  outlet: string;
  currency: string;
  openingRef: string;
  duration: string;
}

export interface CartTotals {
  subtotal: number;
  promoDiscount: number;
  couponDiscount: number;
  taxable: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface ClosingRow {
  method: string;
  opening: number;
  expected: number;
  counted: number;
  difference?: number;
}

export interface WindowClass {
  width: number;
  height: number;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  hasSideRail: boolean;
  hasSidePane: boolean;
}
