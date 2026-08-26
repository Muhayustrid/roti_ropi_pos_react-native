import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, Radius, Typography, Sizes, Spacing } from '../theme/tokens';
import { PosLoadingIndicator } from './PosLoadingIndicator';

export type PosButtonStyle = 'Primary' | 'Tonal' | 'Outline' | 'Danger';

export interface PosButtonProps {
  label: string;
  onPress: () => void;
  variant?: PosButtonStyle;
  disabled?: boolean;
  loading?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  minHeight?: number;
}

export const PosButton = React.memo(function PosButton({
  label,
  onPress,
  variant = 'Primary',
  disabled = false,
  loading = false,
  leading,
  trailing,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
  fullWidth = false,
  minHeight = Sizes.control,
}: PosButtonProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    fullWidth && styles.fullWidth,
    { minHeight },
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.baseText,
    textStyles[variant],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        containerStyle,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? (
        <PosLoadingIndicator
          size="small"
          color={variant === 'Primary' ? Colors.OnFill : Colors.BrandInk}
          accessibilityLabel={`${label} sedang diproses`}
        />
      ) : (
        <View style={styles.contentRow}>
          {leading ? <View style={styles.leadingSlot}>{leading}</View> : null}
          <Text style={labelStyle} numberOfLines={1}>
            {label}
          </Text>
          {trailing ? <View style={styles.trailingSlot}>{trailing}</View> : null}
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.s4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadingSlot: {
    marginRight: Spacing.s2,
  },
  trailingSlot: {
    marginLeft: Spacing.s2,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
  disabledText: {
    opacity: 0.8,
  },
  Primary: {
    backgroundColor: Colors.BrandFill,
  },
  Tonal: {
    backgroundColor: Colors.BrandSoft,
  },
  Outline: {
    backgroundColor: Colors.Surface,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  Danger: {
    backgroundColor: Colors.DangerSoft,
  },
  baseText: {
    ...Typography.MdSemi,
    textAlign: 'center',
  },
});

const textStyles = StyleSheet.create({
  Primary: {
    color: Colors.OnFill,
  },
  Tonal: {
    color: Colors.BrandInk,
  },
  Outline: {
    color: Colors.Text,
  },
  Danger: {
    color: Colors.DangerInk,
  },
});
