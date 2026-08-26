import React from 'react';

const mockComponent = (name: string) => {
  const Component = (props: Record<string, unknown> & { children?: React.ReactNode }) => {
    return React.createElement(name, props, props.children);
  };
  Component.displayName = name;
  return Component;
};

export const View = mockComponent('View');
export const Text = mockComponent('Text');
export const Pressable = mockComponent('Pressable');
export const TextInput = mockComponent('TextInput');
export const Modal = mockComponent('Modal');
export const ActivityIndicator = mockComponent('ActivityIndicator');
export const ScrollView = mockComponent('ScrollView');
export const AccessibilityInfo = {
  isReduceMotionEnabled: () => Promise.resolve(false),
  addEventListener: () => ({ remove: () => {} }),
};
export const Easing = {
  linear: (value: number) => value,
  ease: (value: number) => value,
  inOut: (easing: (value: number) => number) => easing,
};
export const FlatList = mockComponent('FlatList');

export const BackHandler = {
  addEventListener: () => ({ remove: () => {} }),
};

export const Animated = {
  Value: class {
    stopAnimation() {}
    setValue() {}
    interpolate() {
      return 0;
    }
  },
  View: mockComponent('Animated.View'),
  spring: () => ({ start: (callback?: () => void) => callback?.() }),
  timing: () => ({ start: (callback?: () => void) => callback?.(), stop: () => {} }),
  parallel: () => ({ start: (callback?: () => void) => callback?.(), stop: () => {} }),
  loop: () => ({ start: (callback?: () => void) => callback?.(), stop: () => {} }),
};

export const PanResponder = {
  create: () => ({ panHandlers: {} }),
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  absoluteFillObject: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

export const useWindowDimensions = () => ({
  width: 411,
  height: 923,
  scale: 1,
  fontScale: 1,
});

export const Dimensions = {
  get: () => ({ width: 411, height: 923, scale: 1, fontScale: 1 }),
};
