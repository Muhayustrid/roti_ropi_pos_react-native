import type {
  Product,
  Customer,
  Promo,
  PaymentMethodOption,
  Transaction,
  ClosingRow,
  SessionInfo,
} from '../types';

/**
 * Realistic Mock Fixtures matching DESIGN.md Section 9.4 and Screenshots
 */

export const sampleProducts: Product[] = [
  {
    id: 'roti-manis',
    name: 'Roti Manis',
    initials: 'RM',
    unit: '1 unit',
    category: 'Roti',
    price: 12000,
    stock: 42,
    lowStock: false,
    tone: 'Bread',
  },
  {
    id: 'croissant-butter',
    name: 'Croissant Butter',
    initials: 'CB',
    unit: '1 unit',
    category: 'Pastry',
    price: 18500,
    stock: 18,
    lowStock: false,
    tone: 'Pastry',
  },
  {
    id: 'choco-bun',
    name: 'Choco Bun',
    initials: 'CH',
    unit: '1 unit',
    category: 'Roti',
    price: 15000,
    stock: 5,
    lowStock: true,
    tone: 'Bread',
  },
  {
    id: 'pound-cake',
    name: 'Pound Cake Slice',
    initials: 'PC',
    unit: '1 potong',
    category: 'Kue',
    price: 22000,
    stock: 1,
    lowStock: true,
    tone: 'Cake',
  },
  {
    id: 'americano',
    name: 'Americano',
    initials: 'AM',
    unit: '1 cup',
    category: 'Minuman',
    price: 25000,
    stock: 28,
    lowStock: false,
    tone: 'Beverage',
  },
  {
    id: 'choco-croissant',
    name: 'Chocolate Croissant',
    initials: 'CC',
    unit: '1 unit',
    category: 'Pastry',
    price: 35000,
    stock: 15,
    lowStock: false,
    tone: 'Pastry',
  },
];

export const sampleCategories = ['Semua', 'Roti', 'Pastry', 'Kue', 'Minuman'] as const;

export const sampleCustomers: Customer[] = [
  {
    id: 'cust-default',
    name: 'Pelanggan Umum',
    detail: 'Profil default',
    isDefault: true,
  },
  {
    id: 'cust-1',
    name: 'Ahmad Rizky',
    detail: '08123456789',
  },
  {
    id: 'cust-2',
    name: 'Maria Rodriguez',
    detail: '08987654321',
  },
];

export const samplePromos: Promo[] = [
  {
    id: 'Weekend',
    name: 'Promo Akhir Pekan 10%',
    percent: 10,
    isBest: true,
  },
  {
    id: 'Member',
    name: 'Diskon Member 5%',
    percent: 5,
  },
  {
    id: 'None',
    name: 'Tanpa Promo',
    percent: 0,
  },
];

export const samplePaymentMethods: PaymentMethodOption[] = [
  {
    id: 'Cash',
    label: 'Tunai',
    detail: 'Uang fisik',
    tone: 'Bread',
  },
  {
    id: 'Qris',
    label: 'QRIS / E-Wallet',
    detail: 'GoPay, OVO, dll.',
    tone: 'Cake',
  },
  {
    id: 'CardPayment',
    label: 'Debit / Kredit',
    detail: 'Visa, Mastercard, GPN',
    tone: 'Card',
  },
];

export const sampleTransactions: Transaction[] = [
  {
    id: '#TRX-9402',
    time: '14:20',
    date: '24 Okt 2026',
    status: 'Berhasil',
    method: 'QRIS',
    customerName: 'Pelanggan Umum',
    itemCount: 5,
    subtotal: 79500,
    tax: 7950,
    total: 87450,
    lines: [
      { productName: 'Roti Manis', quantity: 2, price: 12000 },
      { productName: 'Croissant Butter', quantity: 3, price: 18500 },
    ],
  },
  {
    id: '#TRX-9401',
    time: '13:45',
    date: '24 Okt 2026',
    status: 'Berhasil',
    method: 'Debit / Kredit',
    customerName: 'Ahmad Rizky',
    itemCount: 1,
    subtotal: 25000,
    tax: 2500,
    total: 27500,
    lines: [
      { productName: 'Americano', quantity: 1, price: 25000 },
    ],
  },
  {
    id: '#TRX-9400',
    time: '12:15',
    date: '24 Okt 2026',
    status: 'Dikembalikan',
    method: 'Tunai',
    customerName: 'Maria Rodriguez',
    itemCount: 4,
    subtotal: 105000,
    tax: 10500,
    total: 115500,
    refundReason: 'Salah pesan rasa kue',
    refundMethod: 'Pengembalian Tunai',
    lines: [
      { productName: 'Artisan Sourdough Loaf', quantity: 1, price: 35000 },
      { productName: 'Chocolate Croissant', quantity: 2, price: 35000 },
      { productName: 'Mixed Fruit Tart', quantity: 1, price: 35000 },
    ],
  },
  {
    id: '#TRX-9399',
    time: '11:30',
    date: '24 Okt 2026',
    status: 'Draf',
    method: 'Tunai',
    customerName: 'Pelanggan Umum',
    itemCount: 4,
    subtotal: 74000,
    tax: 7400,
    total: 81400,
    lines: [
      { productName: 'Roti Manis', quantity: 1, price: 12000 },
      { productName: 'Croissant Butter', quantity: 2, price: 18500 },
      { productName: 'Americano (Iced)', quantity: 1, price: 25000 },
    ],
  },
];

export const sampleClosingRows: ClosingRow[] = [
  {
    method: 'Tunai',
    opening: 200000,
    expected: 865000,
    counted: 860000,
    difference: -5000,
  },
  {
    method: 'QRIS',
    opening: 0,
    expected: 350000,
    counted: 350000,
    difference: 0,
  },
];

export const sampleSession: SessionInfo = {
  cashier: 'Siti Rahma',
  posProfile: 'Main Counter 01',
  outlet: 'Roti Ropi Bakery',
  currency: 'IDR',
  openingRef: 'REF-8492-A',
  duration: '02:45:12',
};

export const sampleClosedShift = {
  reference: 'RR-20231027-04',
  cashier: 'Ahmad S.',
  posProfile: 'Main Counter',
  openingRef: 'OB-99210',
  invoiceCount: 142,
  grandTotal: 4250000,
  timestamp: '27 Okt 2023 · 22:15:42',
  rows: [
    { method: 'Tunai', total: 1250000, balanced: true },
    { method: 'QRIS', total: 3000000, balanced: true },
  ],
};
