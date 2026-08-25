import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography, Sizes, Spacing } from '../theme/tokens';
import { getWindowClass } from '../utils/layout';
import { PosIcon } from './PosIcon';

export interface ResponsiveModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export function ResponsiveModal({
  visible,
  onClose,
  title,
  children,
  footer,
  maxWidth = 480,
  style,
}: ResponsiveModalProps) {
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);
  const isCompact = windowClass.isCompact;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType={isCompact ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <View style={styles.scrim}>
        <Pressable
          style={styles.backdropPressable}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Tutup dialog"
          accessibilityRole="button"
        />

        <View
          style={[
            isCompact ? styles.bottomSheet : styles.dialog,
            !isCompact && { maxWidth },
            isCompact && { maxHeight: height * 0.85 },
            style,
          ]}
          accessible={true}
          accessibilityRole="alert"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Tutup"
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <PosIcon name="close" size={20} color={Colors.Text2} />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.body}>{children}</View>

          {/* Optional Footer */}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    width: '90%',
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.Surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    overflow: 'hidden',
  },
  header: {
    height: Sizes.appBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  titleText: {
    ...Typography.Lg,
    color: Colors.Text,
  },
  closeButton: {
    width: Sizes.touch,
    height: Sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: Colors.Text2,
    fontWeight: '600',
  },
  body: {
    padding: Spacing.s4,
  },
  footer: {
    padding: Spacing.s4,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
  },
  pressed: {
    opacity: 0.7,
  },
});
