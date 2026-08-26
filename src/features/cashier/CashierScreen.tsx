import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  useWindowDimensions,
  type ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Product } from '../../types';
import { sampleCategories, sampleProducts } from '../../mock/data';
import { Colors, Radius, Typography, Sizes, Spacing } from '../../theme/tokens';
import { getWindowClass } from '../../utils/layout';
import { formatRupiah } from '../../utils/money';
import { usePosState, usePosDerived, usePosActions } from '../../state/PosContext';
import { PosSearchField } from '../../components/PosField';
import { PosCartSheet } from '../../components/PosCartSheet';
import { ProductCard } from './ProductCard';
import { CartContent } from './CartContent';
import { CustomerPicker } from './CustomerPicker';
import { OfferPicker } from './OfferPicker';
import { PosIcon } from '../../components/PosIcon';

export interface CashierScreenProps {
  onNavigateTab?: (tab: 'cashier' | 'history' | 'more') => void;
  onCheckout?: () => void;
}

export function CashierScreen({ onCheckout }: CashierScreenProps) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);

  const state = usePosState();
  const derived = usePosDerived();
  const actions = usePosActions();

  // Modals state
  const [_cartModalVisible, _setCartModalVisible] = useState(false);
  const [cartSheetVisible, setCartSheetVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);

  const handleCheckout = useCallback(() => {
    setCartSheetVisible(false);
    _setCartModalVisible(false);
    if (onCheckout) {
      onCheckout();
    } else {
      router.push('/payment');
    }
  }, [onCheckout, router]);

  // Stable callbacks for product card and cart operations
  const handleAddProduct = useCallback(
    (productId: string) => {
      const product = sampleProducts.find((p) => p.id === productId);
      if (product) {
        actions.addProduct(product);
      }
    },
    [actions]
  );

  const handleIncrement = useCallback(
    (productId: string) => {
      actions.changeQuantity(productId, 1);
    },
    [actions]
  );

  const handleDecrement = useCallback(
    (productId: string) => {
      actions.changeQuantity(productId, -1);
    },
    [actions]
  );

  const handleRemove = useCallback(
    (productId: string) => {
      actions.removeLine(productId);
    },
    [actions]
  );

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of state.cart) {
      map.set(item.product.id, item.quantity);
    }
    return map;
  }, [state.cart]);

  // Compute adaptive column count for catalog grid
  const numColumns = useMemo(() => {
    if (windowClass.isCompact) return 2;
    if (windowClass.isExpanded) return 4;
    return 3;
  }, [windowClass.isCompact, windowClass.isExpanded]);

  const renderProductItem: ListRenderItem<Product> = useCallback(
    ({ item }) => {
      const qty = cartQtyMap.get(item.id) || 0;
      return (
        <View style={styles.gridItemWrapper}>
          <ProductCard
            id={item.id}
            name={item.name}
            price={item.price}
            stock={item.stock}
            unit={item.unit}
            category={item.category}
            tone={item.tone}
            cartQty={qty}
            onAdd={handleAddProduct}
          />
        </View>
      );
    },
    [cartQtyMap, handleAddProduct]
  );

  const totalCartCount = useMemo(() => {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.cart]);

  const sidePaneWidth = windowClass.isExpanded ? 380 : 320;

  return (
    <View style={styles.rootContainer}>
      <View style={styles.mainLayoutRow}>
        {/* Center: Catalog */}
        <View style={styles.centerContainer}>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <PosSearchField
              value={state.searchQuery}
              onChangeText={actions.setSearchQuery}
              placeholder="Cari produk…"
            />
          </View>

          {/* Category Filter Chips */}
          <View style={styles.categoryChipsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryChipsContent}
            >
              {sampleCategories.map((cat) => {
                const isSelected = state.selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => actions.setCategory(cat)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Kategori ${cat}`}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      isSelected ? styles.categoryChipSelected : styles.categoryChipDefault,
                      pressed && styles.pressed,
                    ]}
                  >
                    {isSelected ? (
                      <PosIcon name="check" size={14} color={Colors.BrandInk} style={{ marginRight: 4 }} />
                    ) : null}
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected
                          ? styles.categoryChipTextSelected
                          : styles.categoryChipTextDefault,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Catalog Grid */}
          <FlatList
            key={`grid-${numColumns}`}
            data={derived.visibleProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderProductItem}
            numColumns={numColumns}
            contentContainerStyle={styles.catalogGridContent}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={
              <View style={styles.emptyCatalogContainer}>
                <View style={styles.emptyCatalogIconBox}>
                  <PosIcon name="search" size={28} color={Colors.Text2} />
                </View>
                <Text style={styles.emptyCatalogTitle}>Produk tidak ditemukan</Text>
                <Text style={styles.emptyCatalogBody}>
                  Coba kata kunci lain atau pilih kategori Semua.
                </Text>
              </View>
            }
          />

          {/* Compact / Short Landscape Floating Cart Button */}
          {!windowClass.hasSidePane && state.cart.length > 0 ? (
            <View style={styles.compactCartBarWrapper}>
              <Pressable
                onPress={() => {
          setCartSheetVisible(true);
          _setCartModalVisible(false);
        }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Lihat keranjang, ${totalCartCount} item, total ${formatRupiah(
                  derived.totals.total
                )}`}
                style={({ pressed }) => [
                  styles.compactCartBar,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.cartBarCountPill}>
                  <Text style={styles.cartBarCountText}>{totalCartCount}</Text>
                </View>
                <Text style={styles.cartBarTitle}>Lihat Keranjang</Text>
                <Text style={styles.cartBarTotal}>
                  {formatRupiah(derived.totals.total)}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Right Side Pane (Active ONLY when width >= 700 && height >= 600) */}
        {windowClass.hasSidePane ? (
          <View style={[styles.sidePaneWrapper, { width: sidePaneWidth }]}>
            <CartContent
              cart={state.cart}
              customer={state.customer}
              promo={state.promo}
              couponCode={state.couponCode}
              onSelectCustomerClick={() => setCustomerModalVisible(true)}
              onSelectOfferClick={() => setOfferModalVisible(true)}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
              onCheckout={handleCheckout}
              isSidePane={true}
            />
          </View>
        ) : null}
      </View>

      {/* Compact / Short Landscape Interactive Cart Bottom Sheet */}
      {!windowClass.hasSidePane && cartSheetVisible ? (
        <PosCartSheet
          visible={true}
          cart={state.cart}
          customer={state.customer}
          promo={state.promo}
          couponCode={state.couponCode}
          onSelectCustomerClick={() => setCustomerModalVisible(true)}
          onSelectOfferClick={() => setOfferModalVisible(true)}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
          onCheckout={handleCheckout}
          onClose={() => {
            setCartSheetVisible(false);
            _setCartModalVisible(false);
          }}
        />
      ) : null}

      {/* Customer Picker Modal */}
      <CustomerPicker
        visible={customerModalVisible}
        onClose={() => setCustomerModalVisible(false)}
        onSelectCustomer={actions.selectCustomer}
        currentCustomer={state.customer}
      />

      {/* Offer / Promo / Coupon Picker Modal */}
      <OfferPicker
        visible={offerModalVisible}
        onClose={() => setOfferModalVisible(false)}
        onSelectPromo={actions.selectPromo}
        onApplyCoupon={actions.applyCoupon}
        onClearCoupon={actions.clearCoupon}
        currentPromo={state.promo}
        currentCoupon={state.couponCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  mainLayoutRow: {
    flex: 1,
    flexDirection: 'row',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s2,
    backgroundColor: Colors.Surface,
  },
  categoryChipsContainer: {
    backgroundColor: Colors.Surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    paddingVertical: Spacing.s2,
  },
  categoryChipsContent: {
    paddingHorizontal: Spacing.s4,
    gap: Spacing.s2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s1,
    borderRadius: Radius.full,
    minHeight: 36,
  },
  categoryChipDefault: {
    backgroundColor: Colors.Surface,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.BrandSoft,
    borderWidth: 1,
    borderColor: Colors.Brand,
  },
  checkIcon: {
    ...Typography.SmBold,
    color: Colors.BrandInk,
  },
  categoryChipText: {
    ...Typography.SmSemi,
  },
  categoryChipTextDefault: {
    color: Colors.Text2,
  },
  categoryChipTextSelected: {
    color: Colors.BrandInk,
  },
  catalogGridContent: {
    padding: Spacing.s3,
    paddingBottom: Spacing.s8,
  },
  gridItemWrapper: {
    flex: 1,
    padding: Spacing.s1,
  },
  emptyCatalogContainer: {
    padding: Spacing.s8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCatalogIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.SurfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s3,
  },
  emptyCatalogIcon: {
    fontSize: 24,
  },
  emptyCatalogTitle: {
    ...Typography.MdBold,
    color: Colors.Text,
    marginBottom: 4,
  },
  emptyCatalogBody: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
  },
  compactCartBarWrapper: {
    position: 'absolute',
    bottom: Spacing.s3,
    left: Spacing.s4,
    right: Spacing.s4,
  },
  compactCartBar: {
    backgroundColor: Colors.BrandFill,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    minHeight: Sizes.control,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  cartBarCountPill: {
    backgroundColor: Colors.OnFill,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBarCountText: {
    ...Typography.SmBold,
    color: Colors.BrandInk,
  },
  cartBarTitle: {
    ...Typography.MdBold,
    color: Colors.OnFill,
    flex: 1,
    marginLeft: Spacing.s3,
  },
  cartBarTotal: {
    ...Typography.MdBold,
    color: Colors.OnFill,
  },
  sidePaneWrapper: {
    height: '100%',
    backgroundColor: Colors.Bg,
  },
  pressed: {
    opacity: 0.8,
  },
});
