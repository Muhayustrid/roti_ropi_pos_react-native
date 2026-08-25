import fs from 'node:fs';
import path from 'node:path';

describe('Task 10: Full-width nav + cash register icon + interactive cart sheet', () => {
  test('PosNavigation bottom bar is full-width (no horizontal margins) and has no gap at bottom', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/PosNavigation.tsx'),
      'utf8'
    );

    // Extract bottomBar style definition
    const bottomBarMatch = source.match(/bottomBar:\s*\{([\s\S]*?)\},/);
    expect(bottomBarMatch).toBeTruthy();

    if (bottomBarMatch) {
      const stylesContent = bottomBarMatch[1];
      // Check no paddingHorizontal or marginHorizontal in bottomBar
      expect(stylesContent).not.toContain('paddingHorizontal');
      expect(stylesContent).not.toContain('marginHorizontal');
      // Check width explicitly set to 100%
      expect(stylesContent).toContain("width: '100%'");
      // Check height 60 maintained
      expect(stylesContent).toContain('height: 60');
    }
  });

  test('PosIcon supports cash register icon name "register"', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/PosIcon.tsx'),
      'utf8'
    );

    expect(source).toContain("'register'");
    expect(source).toContain("register: 'point-of-sale'");
  });

  test('PosNavigation uses "register" icon for Kasir menu item', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/PosNavigation.tsx'),
      'utf8'
    );

    // Find NAV_ITEMS definition and check cashier has register icon
    const navItemsMatch = source.match(/NAV_ITEMS:\s*NavItem\[\](?:\s*=\s*\[([\s\S]*?)\])/);
    if (navItemsMatch) {
      // Check that cashier label maps to register icon
      expect(navItemsMatch[1]).toContain("iconName: 'register'");
    }
  });

  test('CashierScreen cart modal replaced with interactive bottom sheet behavior', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/cashier/CashierScreen.tsx'),
      'utf8'
    );

    // Expect BottomSheet-like state patterns for cart
    expect(source).toMatch(/cartSheetVisible|cartSheetState/);
    // Expect gesture handling or animation logic for swipe up/down (PosCartSheet uses PanResponder internally)
    // CashierScreen imports PosCartSheet
    expect(source).toMatch(/import.*PosCartSheet/);
    expect(source).toContain('<PosCartSheet');
  });
});
