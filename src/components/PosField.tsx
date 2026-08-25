import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextInputProps,
} from 'react-native';
import { Colors, Radius, Typography, Sizes, Spacing } from '../theme/tokens';
import { formatGrouped, digitsOnly } from '../utils/money';

export interface PosFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

export function PosField({
  label,
  helperText,
  errorText,
  leading,
  trailing,
  containerStyle,
  inputStyle,
  placeholderTextColor = Colors.Text3,
  ...inputProps
}: PosFieldProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          errorText ? styles.errorBorder : styles.defaultBorder,
          inputStyle,
        ]}
      >
        {leading ? <View style={styles.leadingSlot}>{leading}</View> : null}
        <TextInput
          style={styles.textInput}
          placeholderTextColor={placeholderTextColor}
          cursorColor={Colors.BrandInk}
          selectionColor={Colors.BrandSoft}
          {...inputProps}
        />
        {trailing ? <View style={styles.trailingSlot}>{trailing}</View> : null}
      </View>
      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

export interface PosSearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export function PosSearchField({
  value,
  onChangeText,
  placeholder = 'Cari produk…',
  style,
}: PosSearchFieldProps) {
  return (
    <PosField
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      containerStyle={style}
      inputStyle={styles.searchContainer}
      accessibilityLabel={placeholder}
    />
  );
}

export interface MoneyFieldProps {
  label?: string;
  value: number;
  onChangeValue: (amount: number) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export function MoneyField({
  label,
  value,
  onChangeValue,
  placeholder = '0',
  style,
}: MoneyFieldProps) {
  const formattedText = formatGrouped(value);

  const handleChangeText = (raw: string) => {
    const parsed = digitsOnly(raw);
    onChangeValue(parsed);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, styles.defaultBorder]}>
        <Text style={styles.currencyPrefix}>Rp </Text>
        <TextInput
          style={[styles.textInput, styles.moneyInput]}
          value={formattedText}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.Text3}
          keyboardType="numeric"
          cursorColor={Colors.BrandInk}
          accessibilityLabel={label ? `${label}, format rupiah` : 'Nominal rupiah'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Spacing.s3,
  },
  label: {
    ...Typography.Xs,
    color: Colors.Text2,
    marginBottom: 4,
  },
  inputContainer: {
    minHeight: Sizes.control,
    backgroundColor: Colors.Surface,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s3,
  },
  defaultBorder: {
    borderWidth: 1,
    borderColor: Colors.InputBorder,
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: Colors.DangerInk,
  },
  searchContainer: {
    borderRadius: Radius.md,
    backgroundColor: Colors.Surface,
  },
  textInput: {
    flex: 1,
    ...Typography.Md,
    color: Colors.Text,
    paddingVertical: 8,
  },
  moneyInput: {
    ...Typography.MdSemi,
  },
  currencyPrefix: {
    ...Typography.MdSemi,
    color: Colors.Text2,
    marginRight: 4,
  },
  leadingSlot: {
    marginRight: Spacing.s2,
  },
  trailingSlot: {
    marginLeft: Spacing.s2,
  },
  helperText: {
    ...Typography.Xs,
    color: Colors.Text2,
    marginTop: 4,
  },
  errorText: {
    ...Typography.Xs,
    color: Colors.DangerInk,
    marginTop: 4,
  },
});
