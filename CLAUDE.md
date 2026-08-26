# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start Expo/Metro
npm start

# Build, install, and run the Android development app
npm run android

# Start Metro for an already-installed development build
NODE_ENV=development npx expo start --dev-client --lan --port 8081
adb reverse tcp:8081 tcp:8081

# Static checks
npm run lint
npx tsc --noEmit
npx expo-doctor

# Tests
npm test
npm test -- src/__tests__/cart-sheet-snapping.test.ts
npm test -- src/__tests__/cart-sheet-snapping.test.ts -t "test name"

# Native Android debug build
cd android && ./gradlew assembleDebug
```

Debug APKs do not embed the JavaScript bundle; Metro must be running when testing them. On macOS, if Gradle selects an incompatible JDK, use Android Studio's JBR 21:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

Android application ID is `com.rotiropi.pos`. Native configuration targets API 36 and supports API 24 or newer.

## Architecture

This is an Expo SDK 57, Expo Router, React Native, and strict TypeScript POS application. Phase 1 is deliberately local/mock-only; do not introduce backend or ERP integration unless the task explicitly moves beyond Phase 1.

- `app/` is the routing layer. Route files should remain thin adapters that render feature screens. `app/_layout.tsx` installs the shared `PosProvider` around the router stack. The `(pos)` route group contains cashier, history, and More tabs; payment, shift, and transaction-detail flows are top-level routes.
- `src/features/` owns screen and feature composition. Reusable POS controls live in `src/components/`; shared visual values come from `src/theme/tokens.ts` and `StyleSheet.create`.
- `src/state/PosContext.tsx` is the central reducer-driven session store. Consume its separate `usePosState`, `usePosDerived`, and `usePosActions` contexts instead of creating parallel feature state. Pure derived calculations belong in `computePosDerived` or existing helpers, not in route files.
- `src/types.ts` defines the domain model. `src/mock/data.ts` is the current data source. Cart totals and currency behavior are centralized in `src/utils/cart.ts` and `src/utils/money.ts`; preserve these as the single calculation path for cashier, payment, history, and closing flows.
- Responsive behavior is centralized in `src/utils/layout.ts`. Width under 700dp is compact; width 700dp or greater enables the side rail; the cart side pane additionally requires height 600dp or greater. This height gate is what keeps true short landscape (`923x411dp`) usable.
- Compact and short-landscape carts use `PosCartSheet`; expanded layouts use the persistent `CartContent` side pane. The sheet's header owns drag gestures so its inner `ScrollView` can scroll, while checkout stays outside that scroll view. Height animation must use `useNativeDriver: false`, and React Native spring configuration families must not be mixed.

## Design and behavior authority

Use these sources in order when behavior or visuals are ambiguous:

1. `docs/superpowers/specs/2026-08-26-pos-phase-1-design.md`
2. `DESIGN.md`
3. `screenshots/compact/`, `screenshots/expanded/`, and `screenshots/short-landscape/`
4. `docs/superpowers/plans/2026-08-26-pos-phase-1.md` for implementation history, not as authority over the spec

Preserve minimum 48dp touch targets and validate responsive changes in compact phone, expanded tablet, and short landscape rather than inferring one layout from another.

## Backend integration authority

Read `docs/dynamic-promotion-integration-handoff.md` before any Dynamic Promotion networking, state, picker, cart, payment, or persistence work. Backend bearer-route and authoritative-quote blockers closed on 2026-08-26. This documentation task does not authorize source integration, dependency changes, migrate, or deployment. Follow the handoff's gated sequence under a separate approved implementation task.

## Testing conventions

Jest runs through `ts-jest` in a Node environment. React Native, Expo Router, Status Bar, and vector icons are replaced by local mocks under `src/__mocks__/`. Tests live under `src/__tests__/` and include both pure reducer/calculation tests and source-contract tests for layout and component constraints. When changing reducer, money, cart, responsive, navigation, or cart-sheet behavior, update the closest existing test first and run that file before the full suite.

Expo Router group names are internal organization, not public URI segments. For example, the POS root deep link is `rotiropipos:///`, not a URI containing `%28pos%29`.
