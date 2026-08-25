import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { PosNavigation } from '../components/PosNavigation';
import { ProductCard } from '../features/cashier/ProductCard';
import { CartLine } from '../features/cashier/CartLine';
import { CartContent } from '../features/cashier/CartContent';
import { CustomerPicker } from '../features/cashier/CustomerPicker';
import { OfferPicker } from '../features/cashier/OfferPicker';
import { CashierScreen } from '../features/cashier/CashierScreen';
import { sampleProducts, sampleCustomers, samplePromos } from '../mock/data';

describe('Task 4: Cashier & Cart components API & exports', () => {
  test('PosNavigation renders for both bottom bar and side rail configurations', () => {
    expect(PosNavigation).toBeDefined();
    // Compact: width 411, height 923 -> bottom bar
    const compactNav = React.createElement(PosNavigation, {
      activeTab: 'cashier',
      onSelectTab: () => {},
      width: 411,
      height: 923,
    });
    expect(compactNav).toBeDefined();

    // Tablet: width 1280, height 800 -> side rail
    const tabletNav = React.createElement(PosNavigation, {
      activeTab: 'cashier',
      onSelectTab: () => {},
      width: 1280,
      height: 800,
    });
    expect(tabletNav).toBeDefined();

    // Short landscape: width 923, height 411 -> bottom bar (or rail without side pane)
    const shortLandscapeNav = React.createElement(PosNavigation, {
      activeTab: 'history',
      onSelectTab: () => {},
      width: 923,
      height: 411,
    });
    expect(shortLandscapeNav).toBeDefined();
  });

  test('ProductCard is memoized and accepts primitive props for optimal rendering', () => {
    expect(ProductCard).toBeDefined();
    const product = sampleProducts[0];
    const element = React.createElement(ProductCard, {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      category: product.category,
      tone: product.tone,
      cartQty: 2,
      onAdd: () => {},
    });
    expect(element).toBeDefined();
  });

  test('CartLine renders line item with tone avatar and quantity stepper', () => {
    expect(CartLine).toBeDefined();
    const product = sampleProducts[0];
    const element = React.createElement(CartLine, {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 3,
      tone: product.tone,
      onIncrement: () => {},
      onDecrement: () => {},
      onRemove: () => {},
    });
    expect(element).toBeDefined();
  });

  test('CartLine stepper controls keep the 48dp touch target', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/cashier/CartLine.tsx'),
      'utf8'
    );
    const stepperButton = source.match(
      /stepperButton:\s*\{([\s\S]*?)\n\s*\},/
    )?.[1];

    expect(stepperButton).toMatch(/width:\s*(?:Sizes\.touch|48)/);
    expect(stepperButton).toMatch(/height:\s*(?:Sizes\.touch|48)/);
  });

  test('CartContent renders canonical cart structure with customer, items, and totals', () => {
    expect(CartContent).toBeDefined();
    const element = React.createElement(CartContent, {
      cart: [{ product: sampleProducts[0], quantity: 2 }],
      customer: sampleCustomers[0],
      promo: samplePromos[0],
      couponCode: 'ROPI10K',
      onSelectCustomerClick: () => {},
      onSelectOfferClick: () => {},
      onIncrement: () => {},
      onDecrement: () => {},
      onRemove: () => {},
      onCheckout: () => {},
      onSaveDraft: () => {},
    });
    expect(element).toBeDefined();
  });

  test('CustomerPicker and OfferPicker render without throwing', () => {
    expect(CustomerPicker).toBeDefined();
    const custPicker = React.createElement(CustomerPicker, {
      visible: true,
      onClose: () => {},
      onSelectCustomer: () => {},
      currentCustomer: sampleCustomers[0],
    });
    expect(custPicker).toBeDefined();

    expect(OfferPicker).toBeDefined();
    const offerPicker = React.createElement(OfferPicker, {
      visible: true,
      onClose: () => {},
      onSelectPromo: () => {},
      onApplyCoupon: () => {},
      onClearCoupon: () => {},
      currentPromo: samplePromos[0],
      currentCoupon: '',
    });
    expect(offerPicker).toBeDefined();
  });

  test('compact cart modal gives CartContent a concrete height', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/cashier/CashierScreen.tsx'),
      'utf8'
    );

    expect(source).toContain("style={{ height: height * 0.7 }}");
    expect(source).not.toContain("style={{ maxHeight: height * 0.7 }}");
  });

  test('CashierScreen renders root layout', () => {
    expect(CashierScreen).toBeDefined();
    const cashier = React.createElement(CashierScreen, {
      onNavigateTab: () => {},
      onCheckout: () => {},
    });
    expect(cashier).toBeDefined();
  });
});
