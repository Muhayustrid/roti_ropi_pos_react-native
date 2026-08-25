# RotiRopi POS Phase 1 Design

## Scope

Build Android-first POS mockup with React Native, TypeScript, Expo SDK 57, and Expo Router. Phase 1 uses in-memory fixtures only. Screenshots are visual authority, followed by `DESIGN.md`. Legacy POS supplies behavior and edge cases only.

Included flows: login, opening shift, catalog/search/category, cart/customer/promo/coupon, payment/split/cash, success receipt, history/detail/return states, more, closing shift, loading/error/offline mock states.

Excluded: backend/API, OAuth PKCE, ERPNext quote logic, persistence, offline queue, device printing, and iMin SDK.

## Platform

- Android target; minimum SDK remains API 24 where Expo and selected dependencies allow it.
- No dependency or native module may raise `minSdk` above 24 without explicit reason and approval.
- Phase 2 iMin/printing integration must verify vendor SDK compatibility with API 24 before adoption.
- Use Expo prebuild only when native Android integration starts.

## Architecture

- Expo Router owns stack and tab routes.
- One React Context with `useReducer` owns mock POS state.
- `src/mock` owns static fixtures.
- `src/theme` owns design tokens from `DESIGN.md`.
- `src/utils` owns pure money, cart, and breakpoint functions.
- Feature folders own screen-specific components.
- Shared UI uses one canonical component per function; no duplicate V2/Modern/Enhanced variants.

No API client, repository, persistence adapter, service interface, or speculative integration layer in Phase 1.

## Adaptive UI

- Width `<700dp`: bottom navigation; cart and pickers use modal sheets.
- Width `700–999dp`: side rail; side pane width `320dp`.
- Width `>=1000dp`: side rail; side pane width `380dp`; wider grids.
- Side panes require height `>=600dp`.
- Short landscape uses scrollable single-pane layouts and modals, fixing clipping shown in defect references.

Minimum touch target is `48dp`; minimum text is `12sp`. Status uses icon and text, never color alone.

## State and Mock Calculations

Reducer stores session, catalog filters, cart, selected customer/promo/coupon, payment inputs, transaction selection, shift counts, and mock connectivity/error states. Local tax, promotion, and totals exist only to demonstrate UI. ERPNext replaces them in Phase 2.

Receipt printing is a mock action with visible feedback. Loading uses short simulated transitions. Offline and error states are manually selectable demo states, not persistence or network behavior.

## Performance

- Use React Native primitives, `StyleSheet.create`, `Pressable`, and virtualized lists for catalog/history.
- Memoize repeated product/cart/history rows and keep callbacks stable where lists benefit.
- Avoid blur, gradients, large shadows, heavy animation, large assets, and unnecessary state subscriptions.
- Use system font and compact fixture data. Existing logo is only bundled image.
- Design controls for older low-end Android devices first.

## Verification

- Test pure Rupiah formatting, cart reducer/calculation, and breakpoint predicates.
- Run TypeScript, lint, tests, Expo diagnostics, and Android build/export available in environment.
- Check compact `411x923`, expanded `1280x800`, short landscape `923x411`, and Android 7/API 24 compatibility.
- Compare major screens against all corresponding screenshot references after each feature group.
