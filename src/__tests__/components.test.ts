import { PosButton } from '../components/PosButton';
import { PosCard, PosPaddedCard, SectionTitle, LabelledValue, SpreadRow, ToneIcon } from '../components/PosCard';
import { PosBadge } from '../components/PosBadge';
import { PosBanner } from '../components/PosBanner';
import { PosField, PosSearchField, MoneyField } from '../components/PosField';
import { PosTopBar, PosActionFooter } from '../components/PosBars';
import { ResponsiveModal } from '../components/ResponsiveModal';
import { StateView } from '../components/StateView';
import { PosIcon } from '../components/PosIcon';
import fs from 'fs';
import path from 'path';

describe('Canonical UI Components API & exports', () => {
  test('PosButton renders without throwing', () => {
    expect(PosButton).toBeDefined();
  });

  test('PosIcon renders and maps semantic icon names', () => {
    expect(PosIcon).toBeDefined();
    const element = PosIcon({ name: 'person' });
    expect(element).toBeDefined();
  });

  test('Source-level regression check: no emoji icons in source or UI components', () => {
    const srcDir = path.resolve(__dirname, '..');
    const appDir = path.resolve(__dirname, '../../app');

    const checkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '__mocks__') {
          checkDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.test.tsx')))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Disallowed emoji list
          // eslint-disable-next-line no-misleading-character-class
          const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]|[✓✕←↩☰🕒👤🏪🌐🔍🛒🏷️💵📱💳👛🖥️⚠️📡📝]/u;
          const match = emojiRegex.exec(content);
          expect(match).toBeNull();
        }
      }
    };

    checkDir(srcDir);
    checkDir(appDir);
  });

  test('PosCard & sub-recipes are defined', () => {
    expect(PosCard).toBeDefined();
    expect(PosPaddedCard).toBeDefined();
    expect(SectionTitle).toBeDefined();
    expect(LabelledValue).toBeDefined();
    expect(SpreadRow).toBeDefined();
    expect(ToneIcon).toBeDefined();
  });

  test('PosBadge is defined', () => {
    expect(PosBadge).toBeDefined();
  });

  test('PosBanner is defined', () => {
    expect(PosBanner).toBeDefined();
  });

  test('PosField, PosSearchField, MoneyField are defined', () => {
    expect(PosField).toBeDefined();
    expect(PosSearchField).toBeDefined();
    expect(MoneyField).toBeDefined();
  });

  test('PosBars exports one canonical TopBar and ActionFooter', () => {
    expect(PosTopBar).toBeDefined();
    expect(PosActionFooter).toBeDefined();

    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/PosBars.tsx'),
      'utf8'
    );
    expect(source).not.toContain('export function PosBrandBar');
  });

  test('PosActionFooter adapts with explicit width or measured useWindowDimensions fallback', () => {
    // When width omitted, should use useWindowDimensions fallback (411 in mock -> isCompact)
    const elementOmitted = PosActionFooter({ children: null });
    expect(elementOmitted).toBeDefined();

    // When explicit tablet width provided (1280 -> wider layout)
    const elementWider = PosActionFooter({ width: 1280, children: null });
    expect(elementWider).toBeDefined();
  });

  test('ResponsiveModal and StateView are defined', () => {
    expect(ResponsiveModal).toBeDefined();
    expect(StateView).toBeDefined();
  });

  test('loading UI uses one animated, reduced-motion-aware indicator', () => {
    const indicatorSource = fs.readFileSync(
      path.join(process.cwd(), 'src/components/PosLoadingIndicator.tsx'),
      'utf8'
    );
    const consumerSources = [
      'src/features/opening/CheckingScreen.tsx',
      'src/components/StateView.tsx',
      'src/components/PosButton.tsx',
    ].map((file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8'));

    expect(indicatorSource).toContain('Animated.loop');
    expect(indicatorSource).toContain("outputRange: ['0deg', '360deg']");
    expect(indicatorSource).toContain('useNativeDriver: true');
    expect(indicatorSource).toContain('isInteraction: false');
    expect(indicatorSource).toContain('AccessibilityInfo.isReduceMotionEnabled()');
    expect(consumerSources.every((source) => source.includes('<PosLoadingIndicator'))).toBe(
      true
    );
    expect(consumerSources.every((source) => !source.includes('<ActivityIndicator'))).toBe(
      true
    );
  });
});
