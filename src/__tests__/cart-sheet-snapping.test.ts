import fs from 'node:fs';
import path from 'node:path';
import {
  resolveCartSheetSnap,
  SPRING_CONFIG,
  type SnapAction,
} from '../components/PosCartSheet';

describe('PosCartSheet state machine and snapping behavior', () => {
  describe('resolveCartSheetSnap state machine transitions', () => {
    test('collapsed + swipe up (> 50dp) transitions to expanded', () => {
      const result: SnapAction = resolveCartSheetSnap('collapsed', { dy: -60, vy: 0 });
      expect(result).toBe('expanded');
    });

    test('expanded + swipe down (> 50dp) transitions to collapsed', () => {
      const result: SnapAction = resolveCartSheetSnap('expanded', { dy: 60, vy: 0 });
      expect(result).toBe('collapsed');
    });

    test('collapsed + swipe down (> 60dp) transitions to dismiss', () => {
      const result: SnapAction = resolveCartSheetSnap('collapsed', { dy: 70, vy: 0 });
      expect(result).toBe('dismiss');
    });

    test('small upward gesture from collapsed (< 50dp) snaps back to collapsed', () => {
      const result: SnapAction = resolveCartSheetSnap('collapsed', { dy: -20, vy: 0 });
      expect(result).toBe('collapsed');
    });

    test('small downward gesture from expanded (< 50dp) snaps back to expanded', () => {
      const result: SnapAction = resolveCartSheetSnap('expanded', { dy: 20, vy: 0 });
      expect(result).toBe('expanded');
    });

    test('fast upward velocity flick from collapsed transitions to expanded', () => {
      const result: SnapAction = resolveCartSheetSnap('collapsed', { dy: -10, vy: -0.8 });
      expect(result).toBe('expanded');
    });

    test('fast downward velocity flick from expanded transitions to collapsed', () => {
      const result: SnapAction = resolveCartSheetSnap('expanded', { dy: 10, vy: 0.8 });
      expect(result).toBe('collapsed');
    });

    test('fast downward velocity flick from collapsed transitions to dismiss', () => {
      const result: SnapAction = resolveCartSheetSnap('collapsed', { dy: 10, vy: 1.0 });
      expect(result).toBe('dismiss');
    });
  });

  describe('Animated.spring config invariant check', () => {
    test('SPRING_CONFIG does not mix bounciness/speed with stiffness/damping/tension/friction', () => {
      expect(SPRING_CONFIG).toBeDefined();
      const keys = Object.keys(SPRING_CONFIG);
      const hasBouncinessFamily = keys.includes('bounciness') || keys.includes('speed');
      const hasStiffnessFamily = keys.includes('stiffness') || keys.includes('damping') || keys.includes('mass');
      const hasTensionFamily = keys.includes('tension') || keys.includes('friction');

      // Only one family allowed
      const familiesCount = [hasBouncinessFamily, hasStiffnessFamily, hasTensionFamily].filter(Boolean).length;
      expect(familiesCount).toBe(1);
    });

    test('PosCartSheet source code has no overlapping spring config definitions', () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'src/components/PosCartSheet.tsx'),
        'utf8'
      );

      // Verify no Animated.spring calls contain both bounciness and stiffness
      const springCalls = source.match(/Animated\.spring\([\s\S]*?\)/g) || [];
      for (const call of springCalls) {
        const hasBounciness = call.includes('bounciness');
        const hasStiffness = call.includes('stiffness');
        expect(hasBounciness && hasStiffness).toBe(false);
      }
    });
  });

  describe('Gesture responder isolation and drag handle behavior', () => {
    test('panHandlers are NOT attached to outer container', () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'src/components/PosCartSheet.tsx'),
        'utf8'
      );

      // Outer element should not have {...panHandlers} or {...panResponder.panHandlers}
      const outerPressableMatch = source.match(/<Pressable[^>]*\{...pan/);
      expect(outerPressableMatch).toBeNull();
    });

    test('drag handle does not unconditionally onClose; supports toggleExpand', () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'src/components/PosCartSheet.tsx'),
        'utf8'
      );

      // Drag handle pressable should toggle or handle expansion
      expect(source).not.toContain('<Pressable onPress={onClose} style={styles.dragHandleWrapper}>');
      expect(source).toMatch(/onPress=\{(?:toggleExpand|handleHandlePress)\}/);
    });

    test('uses responsive window height via useWindowDimensions or hook', () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'src/components/PosCartSheet.tsx'),
        'utf8'
      );

      expect(source).toContain('useWindowDimensions');
    });
  });
});
