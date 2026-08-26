import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Sizes, Spacing, Radius } from '../theme/tokens';
import { PosIcon } from './PosIcon';

export interface PosTopBarProps {
  title: string;
  onBack?: () => void;
  backIsClose?: boolean;
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function PosTopBar({
  title,
  onBack,
  backIsClose = false,
  trailing,
  style,
}: PosTopBarProps) {
  return (
    <View style={[styles.topBar, style]} accessible={true} accessibilityRole="header">
      <View style={styles.sideSlot}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={backIsClose ? 'Tutup' : 'Kembali'}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <PosIcon
              name={backIsClose ? 'close' : 'back'}
              size={22}
              color={Colors.Text}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.centerSlot}>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.sideSlot}>
        {trailing ? <View style={styles.trailingContainer}>{trailing}</View> : null}
      </View>
    </View>
  );
}

export interface PosActionFooterProps {
  children: React.ReactNode;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

export function PosActionFooter({
  children,
  width,
  style,
}: PosActionFooterProps) {
  const windowDimensions = useWindowDimensions();
  const measuredWidth = width ?? windowDimensions.width;
  const isCompact = measuredWidth < 700;

  return (
    <View
      style={[
        styles.actionFooter,
        isCompact ? styles.footerCompact : styles.footerWider,
        style,
      ]}
    >
      <View style={[styles.actionWrapper, !isCompact && styles.actionWrapperWider]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: Sizes.appBar,
    backgroundColor: Colors.Surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s2,
  },
  sideSlot: {
    width: Sizes.touch,
    height: Sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...Typography.Lg,
    color: Colors.Text,
    textAlign: 'center',
  },
  iconButton: {
    width: Sizes.touch,
    height: Sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  backButtonText: {
    fontSize: 20,
    color: Colors.Text,
    fontWeight: '600',
  },
  trailingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  actionFooter: {
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
    paddingVertical: Spacing.s3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCompact: {
    paddingHorizontal: Spacing.s4,
  },
  footerWider: {
    paddingHorizontal: Spacing.s6,
  },
  actionWrapper: {
    width: '100%',
  },
  actionWrapperWider: {
    width: 320,
  },
});
