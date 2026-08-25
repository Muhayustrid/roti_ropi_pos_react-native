import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme/tokens';
import { PosButton } from './PosButton';
import { PosIcon } from './PosIcon';

export interface StateViewProps {
  type?: 'loading' | 'error' | 'empty' | 'offline';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StateView({
  type = 'empty',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
}: StateViewProps) {
  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole={type === 'loading' ? 'progressbar' : 'alert'}
    >
      <View style={styles.iconContainer}>
        {type === 'loading' ? (
          <ActivityIndicator size="large" color={Colors.Brand} />
        ) : icon ? (
          icon
        ) : (
          <View style={styles.defaultIconCircle}>
            <PosIcon
              name={type === 'error' ? 'warning' : type === 'offline' ? 'offline' : 'search'}
              size={32}
              color={type === 'error' ? Colors.DangerInk : Colors.Text2}
            />
          </View>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}

      {actionLabel && onAction ? (
        <View style={styles.actionWrapper}>
          <PosButton label={actionLabel} onPress={onAction} variant="Tonal" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.s6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: Spacing.s4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultIconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.SurfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultIconText: {
    fontSize: 28,
  },
  title: {
    ...Typography.Lg,
    color: Colors.Text,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 18,
  },
  actionWrapper: {
    marginTop: Spacing.s5,
    minWidth: 160,
  },
});
