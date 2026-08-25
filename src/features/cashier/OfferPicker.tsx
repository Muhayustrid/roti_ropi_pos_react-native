import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import type { Promo } from '../../types';
import { samplePromos } from '../../mock/data';
import { Colors, Radius, Typography, Sizes, Spacing } from '../../theme/tokens';
import { ResponsiveModal } from '../../components/ResponsiveModal';
import { PosField } from '../../components/PosField';
import { PosButton } from '../../components/PosButton';
import { PosBadge } from '../../components/PosBadge';

export interface OfferPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectPromo: (promo: Promo) => void;
  onApplyCoupon: (code: string) => void;
  onClearCoupon: () => void;
  currentPromo: Promo;
  currentCoupon: string;
}

export function OfferPicker({
  visible,
  onClose,
  onSelectPromo,
  onApplyCoupon,
  onClearCoupon,
  currentPromo,
  currentCoupon,
}: OfferPickerProps) {
  const [couponInput, setCouponInput] = useState(currentCoupon);
  const [pendingPromo, setPendingPromo] = useState<Promo>(currentPromo);

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      onApplyCoupon(couponInput.trim());
    } else {
      onClearCoupon();
    }
  };

  const handleApplyAll = () => {
    onSelectPromo(pendingPromo);
    handleApplyCoupon();
    onClose();
  };

  return (
    <ResponsiveModal
      visible={visible}
      onClose={onClose}
      title="Penawaran & Diskon"
      maxWidth={440}
      footer={
        <PosButton
          label="Terapkan Penawaran"
          variant="Primary"
          onPress={handleApplyAll}
          fullWidth
        />
      }
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Section: Promo */}
        <Text style={styles.sectionHeader}>Pilih Promo</Text>
        <View style={styles.promoList}>
          {samplePromos.map((promo) => {
            const isSelected = pendingPromo.id === promo.id;
            return (
              <Pressable
                key={promo.id}
                onPress={() => setPendingPromo(promo)}
                accessible={true}
                accessibilityRole="radio"
                accessibilityLabel={promo.name}
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.promoRow,
                  isSelected && styles.promoRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.promoInfoCol}>
                  <View style={styles.promoTitleRow}>
                    <Text style={styles.promoNameText}>{promo.name}</Text>
                    {promo.isBest ? (
                      <PosBadge label="Terbaik" variant="Success" />
                    ) : null}
                  </View>
                  <Text style={styles.promoDescText}>
                    {promo.percent > 0
                      ? `Potongan langsung ${promo.percent}% dari subtotal`
                      : 'Transaksi normal tanpa diskon'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Section: Kupon */}
        <Text style={styles.sectionHeader}>Kode Kupon</Text>
        <View style={styles.couponCard}>
          <PosField
            value={couponInput}
            onChangeText={setCouponInput}
            placeholder="Masukkan kode (cth: ROPI10K)"
            autoCapitalize="characters"
          />
          <View style={styles.couponHintRow}>
            <Text style={styles.couponHintText}>
              Gunakan kupon promosi yang valid untuk diskon tambahan.
            </Text>
            {currentCoupon ? (
              <Pressable
                onPress={() => {
                  setCouponInput('');
                  onClearCoupon();
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Hapus kupon"
                style={styles.clearCouponBtn}
              >
                <Text style={styles.clearCouponText}>Hapus Kupon</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </ResponsiveModal>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 420,
  },
  sectionHeader: {
    ...Typography.SmSemi,
    color: Colors.Text,
    marginBottom: Spacing.s2,
    marginTop: Spacing.s2,
  },
  promoList: {
    gap: Spacing.s2,
    marginBottom: Spacing.s3,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.Border,
    backgroundColor: Colors.Surface,
  },
  promoRowSelected: {
    borderColor: Colors.Brand,
    backgroundColor: Colors.BrandSoft,
  },
  promoInfoCol: {
    flex: 1,
    gap: 2,
  },
  promoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
  },
  promoNameText: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  promoDescText: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.InputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.s2,
  },
  radioCircleSelected: {
    borderColor: Colors.Brand,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.BrandFill,
  },
  couponCard: {
    gap: Spacing.s2,
    marginBottom: Spacing.s2,
  },
  couponHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponHintText: {
    ...Typography.Xs,
    color: Colors.Text2,
    flex: 1,
  },
  clearCouponBtn: {
    minHeight: Sizes.touch,
    justifyContent: 'center',
    paddingHorizontal: Spacing.s2,
  },
  clearCouponText: {
    ...Typography.XsSemi,
    color: Colors.DangerInk,
  },
  pressed: {
    opacity: 0.7,
  },
});
