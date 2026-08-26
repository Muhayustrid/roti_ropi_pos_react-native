import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Colors, Radius, Sizes, Spacing } from '../theme/tokens';
import {
  resolveSheetSnap,
  SHEET_COLLAPSED_RATIO,
  SHEET_SPRING_CONFIG,
  type SheetSnapState,
} from '../utils/bottomSheet';
import { PosIcon } from './PosIcon';
import { PosTopBar } from './PosBars';

export type PaymentPresentation = 'sheet' | 'fullscreen';

export function getPaymentPresentation(
  width: number,
  height: number
): PaymentPresentation {
  return width >= 700 && height >= 600 ? 'fullscreen' : 'sheet';
}

export function getInitialPaymentSnap(
  _width: number,
  _height: number
): SheetSnapState {
  return 'expanded';
}

export interface PaymentFlowShellProps {
  title: string;
  canGoBack: boolean;
  onBack: () => void;
  onClose: () => void;
  width?: number;
  height?: number;
  flowLabel?: string;
  children: React.ReactNode;
}

export function PaymentFlowShell({
  title,
  canGoBack,
  onBack,
  onClose,
  width: customWidth,
  height: customHeight,
  flowLabel = 'pembayaran',
  children,
}: PaymentFlowShellProps) {
  const windowDimensions = useWindowDimensions();
  const width = customWidth ?? windowDimensions.width;
  const height = customHeight ?? windowDimensions.height;
  const presentation = getPaymentPresentation(width, height);
  const initialSnap = getInitialPaymentSnap(width, height);
  const collapsedHeight = height * SHEET_COLLAPSED_RATIO;
  const expandedHeight = height;
  const [snapState, setSnapState] = useState<SheetSnapState>(initialSnap);
  const snapStateRef = useRef<SheetSnapState>(initialSnap);
  snapStateRef.current = snapState;
  const heightAnim = useRef(
    new Animated.Value(initialSnap === 'expanded' ? expandedHeight : collapsedHeight)
  ).current;
  const startDragHeight = useRef(
    initialSnap === 'expanded' ? expandedHeight : collapsedHeight
  );

  useEffect(() => {
    const nextHeight = initialSnap === 'expanded' ? expandedHeight : collapsedHeight;
    setSnapState(initialSnap);
    snapStateRef.current = initialSnap;
    startDragHeight.current = nextHeight;
    heightAnim.setValue(nextHeight);
  }, [collapsedHeight, expandedHeight, heightAnim, initialSnap]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) onBack();
      else onClose();
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack, onBack, onClose]);

  const animateToState = (nextState: SheetSnapState) => {
    setSnapState(nextState);
    Animated.spring(heightAnim, {
      toValue: nextState === 'expanded' ? expandedHeight : collapsedHeight,
      useNativeDriver: false,
      ...SHEET_SPRING_CONFIG,
    }).start();
  };

  const toggleSnap = () => {
    animateToState(snapStateRef.current === 'expanded' ? 'collapsed' : 'expanded');
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_: unknown, gesture) => Math.abs(gesture.dy) > 5,
        onPanResponderGrant: () => {
          heightAnim.stopAnimation();
          startDragHeight.current =
            snapStateRef.current === 'expanded' ? expandedHeight : collapsedHeight;
        },
        onPanResponderMove: (_: unknown, gesture) => {
          const nextHeight = startDragHeight.current - gesture.dy;
          heightAnim.setValue(
            Math.min(Math.max(nextHeight, collapsedHeight - 60), expandedHeight + 40)
          );
        },
        onPanResponderRelease: (_: unknown, gesture) => {
          const action = resolveSheetSnap(snapStateRef.current, gesture);
          if (action === 'dismiss') {
            Animated.timing(heightAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start(onClose);
          } else {
            animateToState(action);
          }
        },
      }),
    [collapsedHeight, expandedHeight, heightAnim, onClose]
  );

  const closeButton = (
    <Pressable
      onPress={onClose}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Tutup ${flowLabel}`}
      style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
    >
      <PosIcon name="close" size={22} color={Colors.Text} />
    </Pressable>
  );

  const header = (
    <PosTopBar
      title={title}
      onBack={canGoBack ? onBack : undefined}
      trailing={closeButton}
    />
  );

  if (presentation === 'fullscreen') {
    return (
      <View style={styles.fullscreenContainer}>
        {header}
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable
        onPress={onClose}
        style={styles.backdrop}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Tutup ${flowLabel}`}
      />
      <Animated.View style={[styles.sheetContainer, { height: heightAnim }]}>
        <View {...panResponder.panHandlers} style={styles.dragZone}>
          <Pressable
            onPress={toggleSnap}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              snapState === 'expanded'
                ? `Kecilkan ${flowLabel}`
                : `Perbesar ${flowLabel}`
            }
            style={styles.dragHandleButton}
          >
            <View style={styles.dragHandle} />
          </Pressable>
          {header}
        </View>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: Colors.Bg,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dragZone: {
    backgroundColor: Colors.Surface,
  },
  dragHandleButton: {
    minHeight: Sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.s1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.Border,
  },
  closeButton: {
    width: Sizes.touch,
    height: Sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
