import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radius, Typography, Spacing } from '../theme/tokens';

export type PosBannerVariant = 'Brand' | 'Warning' | 'Danger' | 'Success';

export interface PosBannerProps {
  title: string;
  body?: string;
  variant?: PosBannerVariant;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const PosBanner = React.memo(function PosBanner({
  title,
  body,
  variant = 'Brand',
  icon,
  action,
  style,
}: PosBannerProps) {
  return (
    <View
      style={[styles.container, styles[variant], style]}
      accessible={true}
      accessibilityRole="summary"
    >
      {icon ? (
        <View style={[styles.iconCircle, iconCircleStyles[variant]]}>{icon}</View>
      ) : null}
      <View style={styles.textColumn}>
        <Text style={[styles.title, titleStyles[variant]]}>{title}</Text>
        {body ? <Text style={[styles.body, bodyStyles[variant]]}>{body}</Text> : null}
      </View>
      {action ? <View style={styles.actionSlot}>{action}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    padding: Spacing.s4,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s3,
  },
  textColumn: {
    flex: 1,
  },
  actionSlot: {
    marginLeft: Spacing.s3,
  },
  title: {
    ...Typography.MdSemi,
  },
  body: {
    ...Typography.Sm,
    marginTop: 2,
  },
  Brand: {
    backgroundColor: Colors.BrandSoft,
  },
  Warning: {
    backgroundColor: Colors.WarningSoft,
  },
  Danger: {
    backgroundColor: Colors.DangerSoft,
  },
  Success: {
    backgroundColor: Colors.SuccessSoft,
  },
});

const iconCircleStyles = StyleSheet.create({
  Brand: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  Warning: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  Danger: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  Success: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

const titleStyles = StyleSheet.create({
  Brand: {
    color: Colors.BrandInk,
  },
  Warning: {
    color: Colors.WarningInk,
  },
  Danger: {
    color: Colors.DangerInk,
  },
  Success: {
    color: Colors.SuccessInk,
  },
});

const bodyStyles = StyleSheet.create({
  Brand: {
    color: Colors.BrandInk,
    opacity: 0.9,
  },
  Warning: {
    color: Colors.WarningInk,
    opacity: 0.9,
  },
  Danger: {
    color: Colors.DangerInk,
    opacity: 0.9,
  },
  Success: {
    color: Colors.SuccessInk,
    opacity: 0.9,
  },
});
