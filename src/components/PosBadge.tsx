import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { Colors, Radius, Typography, Spacing } from '../theme/tokens';

export type PosBadgeVariant = 'Success' | 'Danger' | 'Warning' | 'Brand' | 'Neutral';

export interface PosBadgeProps {
  label: string;
  variant?: PosBadgeVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const PosBadge = React.memo(function PosBadge({
  label,
  variant = 'Neutral',
  icon,
  style,
  textStyle,
}: PosBadgeProps) {
  const containerStyle = [styles.badge, styles[variant], style];
  const labelStyle = [styles.text, textStyles[variant], textStyle];

  return (
    <View style={containerStyle} accessible={true} accessibilityRole="text">
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <Text style={labelStyle} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.s2,
    paddingVertical: Spacing.s1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconSlot: {
    marginRight: 4,
  },
  text: {
    ...Typography.XsSemi,
  },
  Success: {
    backgroundColor: Colors.SuccessSoft,
  },
  Danger: {
    backgroundColor: Colors.DangerSoft,
  },
  Warning: {
    backgroundColor: Colors.WarningSoft,
  },
  Brand: {
    backgroundColor: Colors.BrandSoft,
  },
  Neutral: {
    backgroundColor: Colors.SurfaceAlt,
  },
});

const textStyles = StyleSheet.create({
  Success: {
    color: Colors.SuccessInk,
  },
  Danger: {
    color: Colors.DangerInk,
  },
  Warning: {
    color: Colors.WarningInk,
  },
  Brand: {
    color: Colors.BrandInk,
  },
  Neutral: {
    color: Colors.Text2,
  },
});
