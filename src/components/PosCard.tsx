import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography, Spacing, Tone, type ToneName } from '../theme/tokens';

export interface PosCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  selected?: boolean;
  selectedBorderColor?: string;
  backgroundColor?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
}

export const PosCard = React.memo(function PosCard({
  children,
  style,
  onPress,
  selected = false,
  selectedBorderColor = Colors.Brand,
  backgroundColor = Colors.Surface,
  accessibilityLabel,
  accessibilityRole,
}: PosCardProps) {
  const cardStyle = [
    styles.card,
    { backgroundColor },
    selected
      ? { borderColor: selectedBorderColor, borderWidth: 2 }
      : styles.defaultBorder,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessible={true}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected }}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
});

export function PosPaddedCard({
  children,
  style,
  onPress,
  selected,
  selectedBorderColor,
  backgroundColor,
  accessibilityLabel,
}: PosCardProps) {
  return (
    <PosCard
      style={[styles.padded, style]}
      onPress={onPress}
      selected={selected}
      selectedBorderColor={selectedBorderColor}
      backgroundColor={backgroundColor}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </PosCard>
  );
}

export interface SectionTitleProps {
  title: string;
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SectionTitle({ title, trailing, style }: SectionTitleProps) {
  return (
    <View style={[styles.sectionTitleRow, style]}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}

export interface LabelledValueProps {
  label: string;
  value: string | number;
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function LabelledValue({ label, value, valueColor, style }: LabelledValueProps) {
  return (
    <View style={[styles.labelledValue, style]}>
      <Text style={styles.labelText}>{label}</Text>
      <Text style={[styles.valueText, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

export interface SpreadRowProps {
  label: string;
  value: string;
  valueColor?: string;
  boldValue?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SpreadRow({
  label,
  value,
  valueColor,
  boldValue = false,
  style,
}: SpreadRowProps) {
  return (
    <View style={[styles.spreadRow, style]}>
      <Text style={styles.spreadLabel}>{label}</Text>
      <Text
        style={[
          boldValue ? styles.spreadValueBold : styles.spreadValue,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export interface ToneIconProps {
  tone?: ToneName;
  customBg?: string;
  customInk?: string;
  size?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ToneIcon({
  tone = 'Bread',
  customBg,
  _customInk,
  size = 44,
  children,
  style,
}: ToneIconProps & { _customInk?: string }) {
  const bg = customBg || Tone[tone].bg;

  return (
    <View
      style={[
        styles.toneIcon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      {/* Icon child will inherit color or be rendered with tone ink */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  defaultBorder: {
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  padded: {
    padding: Spacing.s4,
  },
  pressed: {
    opacity: 0.85,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.s2,
  },
  sectionTitleText: {
    ...Typography.Lg,
    color: Colors.Text,
  },
  labelledValue: {
    gap: 2,
  },
  labelText: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  valueText: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  spreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  spreadLabel: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  spreadValue: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  spreadValueBold: {
    ...Typography.MdBold,
    color: Colors.Text,
  },
  toneIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
