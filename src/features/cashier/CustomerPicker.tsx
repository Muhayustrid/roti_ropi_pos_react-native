import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import type { Customer } from '../../types';
import { sampleCustomers } from '../../mock/data';
import { Colors, Radius, Typography, Spacing } from '../../theme/tokens';
import { ResponsiveModal } from '../../components/ResponsiveModal';
import { PosSearchField } from '../../components/PosField';
import { PosButton } from '../../components/PosButton';
import { PosIcon } from '../../components/PosIcon';

export interface CustomerPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
  currentCustomer: Customer;
}

export function CustomerPicker({
  visible,
  onClose,
  onSelectCustomer,
  currentCustomer,
}: CustomerPickerProps) {
  const [search, setSearch] = useState('');
  const [pendingSelection, setPendingSelection] = useState<Customer>(currentCustomer);

  const filteredCustomers = sampleCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.detail && c.detail.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = () => {
    onSelectCustomer(pendingSelection);
    onClose();
  };

  return (
    <ResponsiveModal
      visible={visible}
      onClose={onClose}
      title="Pilih Pelanggan"
      maxWidth={440}
      footer={
        <PosButton
          label="Gunakan Pelanggan"
          variant="Primary"
          onPress={handleApply}
          fullWidth
        />
      }
    >
      <View style={styles.container}>
        <PosSearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Cari pelanggan terdaftar…"
          style={styles.searchField}
        />

        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredCustomers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Pelanggan tidak ditemukan.</Text>
            </View>
          ) : (
            filteredCustomers.map((cust) => {
              const isSelected = pendingSelection.id === cust.id;
              return (
                <Pressable
                  key={cust.id}
                  onPress={() => setPendingSelection(cust)}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel={cust.name}
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.row,
                    isSelected && styles.rowSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.avatarBox}>
                    <PosIcon name="person" size={20} color={Colors.BrandInk} />
                  </View>

                  <View style={styles.infoCol}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {cust.name}
                    </Text>
                    <Text style={styles.detailText} numberOfLines={1}>
                      {cust.detail || 'Pelanggan Terdaftar'}
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
            })
          )}
        </ScrollView>
      </View>
    </ResponsiveModal>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 380,
    gap: Spacing.s3,
  },
  searchField: {
    marginBottom: Spacing.s1,
  },
  listContainer: {
    maxHeight: 280,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.Border,
    backgroundColor: Colors.Surface,
    marginBottom: Spacing.s2,
  },
  rowSelected: {
    borderColor: Colors.Brand,
    backgroundColor: Colors.BrandSoft,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s3,
  },
  avatarIcon: {
    fontSize: 16,
  },
  infoCol: {
    flex: 1,
  },
  nameText: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  detailText: {
    ...Typography.Xs,
    color: Colors.Text2,
    marginTop: 2,
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
  emptyState: {
    padding: Spacing.s6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  pressed: {
    opacity: 0.7,
  },
});
