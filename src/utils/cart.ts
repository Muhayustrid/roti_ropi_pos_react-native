import type { CartLine, CartTotals, Promo } from '../types';

/**
 * Pure cart calculation pipeline for Phase 1 mockup
 * Following DESIGN.md 9.2:
 * subtotal = sum(product.price * quantity)
 * promoDiscount = round(subtotal * promo.percent / 100)
 * afterPromo = max(0, subtotal - promoDiscount)
 * couponValue:
 *   blank code -> 0
 *   ROPI10K -> 10000
 *   any other non-empty code -> 5000
 * couponApplied = min(max(0, couponValue), afterPromo)
 * taxable = max(0, afterPromo - couponApplied)
 * tax = round(taxable * 10 / 100)
 * total = taxable + tax
 */
export function calculateCart(cart: CartLine[], promo?: Promo, couponCode?: string): CartTotals {
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const promoPercent = promo?.percent ?? 0;
  const promoDiscount = Math.round((subtotal * promoPercent) / 100);
  const afterPromo = Math.max(0, subtotal - promoDiscount);

  let couponValue = 0;
  const trimmedCoupon = couponCode?.trim().toUpperCase() || '';
  if (trimmedCoupon) {
    if (trimmedCoupon === 'ROPI10K') {
      couponValue = 10000;
    } else {
      couponValue = 5000;
    }
  }

  const couponDiscount = Math.min(Math.max(0, couponValue), afterPromo);
  const taxable = Math.max(0, afterPromo - couponDiscount);
  const tax = Math.round((taxable * 10) / 100);
  const total = taxable + tax;

  return {
    subtotal,
    promoDiscount,
    couponDiscount,
    taxable,
    tax,
    total,
    itemCount,
  };
}
