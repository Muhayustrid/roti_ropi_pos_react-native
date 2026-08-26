import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
  type ColorValue,
} from 'react-native';
import { Colors } from '../theme/tokens';

export interface PosLoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: ColorValue;
  accessibilityLabel?: string;
}

export function PosLoadingIndicator({
  size = 'large',
  color = Colors.Brand,
  accessibilityLabel = 'Sedang memuat',
}: PosLoadingIndicatorProps) {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const diameter = size === 'small' ? 20 : 36;

  useEffect(() => {
    let mounted = true;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    rotation.setValue(0);
    pulse.setValue(0);
    if (reduceMotion !== false) return;

    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
          isInteraction: false,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse, reduceMotion, rotation]);

  return (
    <View
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={{ width: diameter, height: diameter }}
    >
      <Animated.View
        style={[
          styles.pulse,
          {
            borderRadius: diameter / 2,
            backgroundColor: color,
            opacity: pulse.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.12, 0.24, 0.12],
            }),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.82, 1, 0.82],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            borderWidth: size === 'small' ? 2 : 4,
            borderColor: color,
            borderRightColor: 'transparent',
            transform: [
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
