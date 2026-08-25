import { formatRupiah, formatGrouped, formatSignedRupiah, digitsOnly } from '../utils/money';
import { getWindowClass } from '../utils/layout';
import { calculateCart } from '../utils/cart';
import { Colors, Tone, Typography, Spacing, Radius, Sizes } from '../theme/tokens';
import type { CartLine, Product } from '../types';

describe('Design Tokens', () => {
  test('Color tokens match DESIGN.md exactly', () => {
    expect(Colors.Bg).toBe('#F6F7F9');
    expect(Colors.Surface).toBe('#FFFFFF');
    expect(Colors.SurfaceAlt).toBe('#F1F3F7');
    expect(Colors.Border).toBe('#E2E6EC');
    expect(Colors.InputBorder).toBe('#C6CCD6');
    expect(Colors.Text).toBe('#1E1F22');
    expect(Colors.Text2).toBe('#5F646D');
    expect(Colors.Text3).toBe('#686E75');

    expect(Colors.Brand).toBe('#5F7DF7');
    expect(Colors.BrandFill).toBe('#4A5FD4');
    expect(Colors.BrandStrong).toBe('#3F52C2');
    expect(Colors.BrandInk).toBe('#3A55C0');
    expect(Colors.BrandSoft).toBe('#EEF1FF');
    expect(Colors.OnFill).toBe('#FFFFFF');

    expect(Colors.Success).toBe('#4B9B88');
    expect(Colors.SuccessFill).toBe('#3D8272');
    expect(Colors.SuccessInk).toBe('#2F7062');
    expect(Colors.SuccessSoft).toBe('#E7F3F0');
    expect(Colors.Danger).toBe('#C95763');
    expect(Colors.DangerFill).toBe('#B0424E');
    expect(Colors.DangerInk).toBe('#A8323F');
    expect(Colors.DangerSoft).toBe('#FBECEF');
    expect(Colors.WarningInk).toBe('#8A5416');
    expect(Colors.WarningSoft).toBe('#FDF0E0');
  });

  test('Tone mapping matches DESIGN.md', () => {
    expect(Tone.Bread).toEqual({ bg: '#FDF0E0', ink: '#8A5416', deep: '#7A4A12' });
    expect(Tone.Cake).toEqual({ bg: '#EEF1FF', ink: '#3A55C0', deep: '#33489F' });
    expect(Tone.Card).toEqual({ bg: '#F0EEFB', ink: '#4F42A3', deep: '#453A8C' });
    expect(Tone.Pastry).toEqual({ bg: '#F7EDF6', ink: '#7A3C74', deep: '#6A3465' });
    expect(Tone.Beverage).toEqual({ bg: '#E7F3F0', ink: '#2F7062', deep: '#296157' });
  });

  test('Spacing and Radius tokens match DESIGN.md', () => {
    expect(Spacing.s1).toBe(4);
    expect(Spacing.s2).toBe(8);
    expect(Spacing.s3).toBe(12);
    expect(Spacing.s4).toBe(16);
    expect(Spacing.s5).toBe(20);
    expect(Spacing.s6).toBe(24);
    expect(Spacing.s8).toBe(32);

    expect(Radius.sm).toBe(8);
    expect(Radius.md).toBe(12);
    expect(Radius.lg).toBe(16);
    expect(Radius.xl).toBe(24);
    expect(Radius.full).toBe(9999);

    expect(Sizes.touch).toBe(48);
    expect(Sizes.control).toBe(48);
    expect(Sizes.appBar).toBe(60);
    expect(Sizes.keypadKey).toBe(56);

    expect(Typography.Xs.fontSize).toBe(12);
    expect(Typography.Display.fontSize).toBe(32);
  });
});

describe('Money utilities', () => {
  test('formatRupiah formats positive amounts with Rp prefix and dot grouping', () => {
    expect(formatRupiah(12000)).toBe('Rp 12.000');
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(200000)).toBe('Rp 200.000');
    expect(formatRupiah(4250000)).toBe('Rp 4.250.000');
  });

  test('formatGrouped formats digits with dot grouping and empty string for 0', () => {
    expect(formatGrouped(200000)).toBe('200.000');
    expect(formatGrouped(0)).toBe('');
    expect(formatGrouped(12000)).toBe('12.000');
  });

  test('formatSignedRupiah formats with + or Unicode minus (U+2212)', () => {
    expect(formatSignedRupiah(5000)).toBe('+Rp 5.000');
    expect(formatSignedRupiah(-5000)).toBe('−Rp 5.000');
    expect(formatSignedRupiah(0)).toBe('Rp 0');
  });

  test('digitsOnly parses digits, caps at 12 digits, and returns number', () => {
    expect(digitsOnly('Rp 12.000')).toBe(12000);
    expect(digitsOnly('')).toBe(0);
    expect(digitsOnly('abc')).toBe(0);
    expect(digitsOnly('1234567890123456')).toBe(123456789012);
  });
});

describe('Layout breakpoint utilities', () => {
  test('compact window (411x923) has bottom nav, no side rail, no side pane', () => {
    const layout = getWindowClass(411, 923);
    expect(layout.isCompact).toBe(true);
    expect(layout.isMedium).toBe(false);
    expect(layout.isExpanded).toBe(false);
    expect(layout.hasSideRail).toBe(false);
    expect(layout.hasSidePane).toBe(false);
  });

  test('short landscape window (923x411) has side rail but REJECTS side pane due to height < 600', () => {
    const layout = getWindowClass(923, 411);
    expect(layout.isCompact).toBe(false);
    expect(layout.isMedium).toBe(true);
    expect(layout.isExpanded).toBe(false);
    expect(layout.hasSideRail).toBe(true);
    expect(layout.hasSidePane).toBe(false); // Side pane requires height >= 600
  });

  test('expanded tablet window (1280x800) has side rail and side pane', () => {
    const layout = getWindowClass(1280, 800);
    expect(layout.isCompact).toBe(false);
    expect(layout.isMedium).toBe(false);
    expect(layout.isExpanded).toBe(true);
    expect(layout.hasSideRail).toBe(true);
    expect(layout.hasSidePane).toBe(true);
  });

  test('medium tall window (800x700) has side rail and side pane', () => {
    const layout = getWindowClass(800, 700);
    expect(layout.isCompact).toBe(false);
    expect(layout.isMedium).toBe(true);
    expect(layout.isExpanded).toBe(false);
    expect(layout.hasSideRail).toBe(true);
    expect(layout.hasSidePane).toBe(true);
  });
});

describe('Cart calculation (DESIGN.md 9.2 prototype reference calculation)', () => {
  const sampleProduct: Product = {
    id: 'roti-manis',
    name: 'Roti Manis',
    initials: 'RM',
    unit: '1 unit',
    category: 'Roti',
    price: 12000,
    stock: 42,
    lowStock: false,
    tone: 'Bread',
  };

  test('calculates single item without promo/coupon correctly (10% tax)', () => {
    const cart: CartLine[] = [{ product: sampleProduct, quantity: 1 }];
    const totals = calculateCart(cart, { id: 'None', name: 'Tanpa Promo', percent: 0 }, '');
    expect(totals.subtotal).toBe(12000);
    expect(totals.promoDiscount).toBe(0);
    expect(totals.couponDiscount).toBe(0);
    expect(totals.taxable).toBe(12000);
    expect(totals.tax).toBe(1200);
    expect(totals.total).toBe(13200);
    expect(totals.itemCount).toBe(1);
  });

  test('matches DESIGN.md section 9.2 default-state check with Weekend promo (10%)', () => {
    const cart: CartLine[] = [{ product: sampleProduct, quantity: 1 }];
    const totals = calculateCart(cart, { id: 'Weekend', name: 'Promo Akhir Pekan 10%', percent: 10 }, '');
    expect(totals.subtotal).toBe(12000);
    expect(totals.promoDiscount).toBe(1200);
    expect(totals.couponDiscount).toBe(0);
    expect(totals.taxable).toBe(10800);
    expect(totals.tax).toBe(1080);
    expect(totals.total).toBe(11880);
    expect(totals.itemCount).toBe(1);
  });

  test('applies coupon and clamps discount to avoid negative taxable amount', () => {
    const cart: CartLine[] = [{ product: sampleProduct, quantity: 1 }];
    const totals = calculateCart(cart, { id: 'None', name: 'Tanpa Promo', percent: 0 }, 'ROPI10K');
    expect(totals.subtotal).toBe(12000);
    expect(totals.promoDiscount).toBe(0);
    expect(totals.couponDiscount).toBe(10000);
    expect(totals.taxable).toBe(2000);
    expect(totals.tax).toBe(200);
    expect(totals.total).toBe(2200);
  });

  test('handles empty cart cleanly', () => {
    const totals = calculateCart([], { id: 'None', name: 'Tanpa Promo', percent: 0 }, '');
    expect(totals.subtotal).toBe(0);
    expect(totals.promoDiscount).toBe(0);
    expect(totals.couponDiscount).toBe(0);
    expect(totals.taxable).toBe(0);
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(0);
    expect(totals.itemCount).toBe(0);
  });
});
