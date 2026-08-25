import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { CartLine as CartLineType, Customer, Promo } from '../../types';
import { Colors, Radius, Typography, Sizes, Spacing } from '../../theme/tokens';
import { PosCard, SectionTitle, SpreadRow } from '../../components/PosCard';
import { PosButton } from '../../components/PosButton';
import { PosBadge } from '../../components/PosBadge';
import { PosIcon } from '../../components/PosIcon';
import { CartLine } from './CartLine';
import { formatRupiah } from '../../utils/money';
import { calculateCart } from '../../utils/cart';

export interface CartContentProps {
  cart: CartLineType[];
  customer: Customer;
  promo: Promo;
  couponCode: string;
  onSelectCustomerClick: () => void;
  onSelectOfferClick: () => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  onSaveDraft?: () => void;
  isSidePane?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CartContent({
  cart,
  customer,
  promo,
  couponCode,
  onSelectCustomerClick,
  onSelectOfferClick,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
  onSaveDraft,
  isSidePane = false,
  style,
}: CartContentProps) {
  const totals = calculateCart(cart, promo, couponCode);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const hasDiscounts = totals.promoDiscount > 0 || totals.couponDiscount > 0;

  return (
    <View style={[styles.container, isSidePane && styles.sidePaneContainer, style]}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Selector Card */}
        <PosCard
          style={styles.customerCard}
          onPress={onSelectCustomerClick}
          accessibilityLabel="Ubah pelanggan"
        >
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <PosIcon name="person" size={20} color={Colors.BrandInk} />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName} numberOfLines={1}>
                {customer.name}
              </Text>
              <Text style={styles.customerPhone} numberOfLines={1}>
                {customer.detail || 'Pelanggan Umum'}
              </Text>
            </View>
            <Pressable
              onPress={onSelectCustomerClick}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ubah pelanggan"
              style={({ pressed }) => [styles.changeTextBtn, pressed && styles.pressed]}
            >
              <Text style={styles.changeActionText}>Ubah</Text>
            </Pressable>
          </View>
        </PosCard>

        {/* Section: Item */}
        <SectionTitle
          title="Item"
          trailing={
            totalItemCount > 0 ? (
              <PosBadge label={`${totalItemCount} item`} variant="Neutral" />
            ) : null
          }
          style={styles.itemSectionTitle}
        />

        {/* Cart Item Rows or Empty State */}
        {cart.length === 0 ? (
          <View style={styles.emptyCartCard}>
            <PosIcon name="cart" size={32} color={Colors.Text2} />
            <Text style={styles.emptyCartTitle}>Keranjang masih kosong</Text>
            <Text style={styles.emptyCartBody}>
              Pilih produk di katalog untuk mulai transaksi.
            </Text>
          </View>
        ) : (
          <View style={styles.cartListContainer}>
            {cart.map((line) => (
              <CartLine
                key={line.product.id}
                productId={line.product.id}
                name={line.product.name}
                price={line.product.price}
                quantity={line.quantity}
                tone={line.product.tone}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onRemove={onRemove}
              />
            ))}
          </View>
        )}

        {/* Penawaran / Offers Card */}
        <PosCard style={styles.offerCard} onPress={onSelectOfferClick}>
          <View style={styles.offerHeader}>
            <View style={styles.offerTitleRow}>
              <PosIcon name="offer" size={18} color={Colors.BrandInk} />
              <Text style={styles.offerTitleText}>Penawaran</Text>
            </View>
            {hasDiscounts ? (
              <PosBadge label="Hemat terbaik" variant="Success" />
            ) : null}
          </View>

          <View style={styles.offerDivider} />

          <View style={styles.offerRow}>
            <View style={styles.offerCol}>
              <Text style={styles.offerSubLabel}>Promo</Text>
              <Text style={styles.offerValueText}>{promo.name}</Text>
            </View>
            <Pressable
              onPress={onSelectOfferClick}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ubah promo"
              style={({ pressed }) => [styles.changeTextBtn, pressed && styles.pressed]}
            >
              <Text style={styles.changeActionText}>Ubah</Text>
            </Pressable>
          </View>

          <View style={styles.offerRow}>
            <View style={styles.offerCol}>
              <Text style={styles.offerSubLabel}>Kupon</Text>
              <Text style={styles.offerValueText}>
                {couponCode
                  ? `${couponCode} · ${formatRupiah(totals.couponDiscount)} off`
                  : 'Belum ada kupon'}
              </Text>
            </View>
            <Pressable
              onPress={onSelectOfferClick}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={couponCode ? 'Ubah kupon' : 'Tambah kupon'}
              style={({ pressed }) => [styles.changeTextBtn, pressed && styles.pressed]}
            >
              <Text style={styles.changeActionText}>
                {couponCode ? 'Ubah' : 'Tambah'}
              </Text>
            </Pressable>
          </View>
        </PosCard>

        {/* Summary Card */}
        <PosCard style={styles.summaryCard} backgroundColor={Colors.SurfaceAlt}>
          <SpreadRow label="Subtotal" value={formatRupiah(totals.subtotal)} />

          {totals.promoDiscount > 0 ? (
            <SpreadRow
              label="Promosi"
              value={`−${formatRupiah(totals.promoDiscount)}`}
              valueColor={Colors.SuccessInk}
            />
          ) : null}

          {totals.couponDiscount > 0 ? (
            <SpreadRow
              label="Kupon"
              value={`−${formatRupiah(totals.couponDiscount)}`}
              valueColor={Colors.SuccessInk}
            />
          ) : null}

          <SpreadRow label="Pajak (PB1 10%)" value={formatRupiah(totals.tax)} />

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRupiah(totals.total)}</Text>
          </View>
        </PosCard>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.actionFooter}>
        {onSaveDraft ? (
          <PosButton
            label="Simpan Draft"
            variant="Outline"
            onPress={onSaveDraft}
            disabled={cart.length === 0}
            style={styles.draftButton}
          />
        ) : null}
        <PosButton
          label="Lanjut ke Pembayaran"
          variant="Primary"
          onPress={onCheckout}
          disabled={cart.length === 0}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  sidePaneContainer: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.Border,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.s4,
    paddingBottom: Spacing.s6,
    gap: Spacing.s3,
  },
  customerCard: {
    padding: Spacing.s3,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BrandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s3,
  },
  customerAvatarText: {
    fontSize: 18,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  customerPhone: {
    ...Typography.Xs,
    color: Colors.Text2,
    marginTop: 2,
  },
  changeTextBtn: {
    minHeight: Sizes.touch,
    justifyContent: 'center',
    paddingHorizontal: Spacing.s2,
  },
  changeActionText: {
    ...Typography.SmMedium,
    color: Colors.BrandInk,
  },
  itemSectionTitle: {
    marginTop: Spacing.s1,
    marginBottom: Spacing.s1,
  },
  emptyCartCard: {
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: Spacing.s6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.s2,
  },
  emptyCartIcon: {
    fontSize: 32,
    marginBottom: Spacing.s2,
  },
  emptyCartTitle: {
    ...Typography.MdSemi,
    color: Colors.Text,
    marginBottom: 4,
  },
  emptyCartBody: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
  },
  cartListContainer: {
    gap: Spacing.s2,
  },
  offerCard: {
    padding: Spacing.s4,
    gap: Spacing.s2,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
  },
  offerIcon: {
    fontSize: 16,
  },
  offerTitleText: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  offerDivider: {
    height: 1,
    backgroundColor: Colors.Border,
    marginVertical: 4,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  offerCol: {
    flex: 1,
  },
  offerSubLabel: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  offerValueText: {
    ...Typography.SmSemi,
    color: Colors.Text,
    marginTop: 2,
  },
  summaryCard: {
    padding: Spacing.s4,
    gap: Spacing.s2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.Border,
    marginVertical: Spacing.s1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalLabel: {
    ...Typography.LgBold,
    color: Colors.Text,
  },
  totalValue: {
    ...Typography.LgBold,
    color: Colors.BrandInk,
  },
  actionFooter: {
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
    padding: Spacing.s3,
    gap: Spacing.s2,
  },
  draftButton: {
    width: '100%',
  },
  checkoutButton: {
    width: '100%',
  },
  pressed: {
    opacity: 0.6,
  },
});
