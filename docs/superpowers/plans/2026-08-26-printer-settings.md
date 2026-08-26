# Printer Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add session-only mock printer settings, test print feedback, and one-shot payment Auto-print.

**Architecture:** Keep printer settings in the existing reducer-driven `PosContext`. Add one responsive settings screen and thin Expo Router adapter. Extend canonical receipt mock printing rather than introducing a printer service or provider.

**Tech Stack:** Expo SDK 57, React Native, Expo Router, strict TypeScript, Jest/ts-jest.

**Spec:** `docs/superpowers/specs/2026-08-26-printer-settings-design.md`

## Global Constraints

- Phase 1 remains local/mock-only and in-memory.
- No persistence, Bluetooth, LAN, USB, iMin SDK, native printing, backend, permissions, or dependency changes.
- Default printer is `Printer Kasir Utama`, `Terhubung (Mock)`, `80 mm`, `1` copy, Auto-print disabled.
- Settings apply immediately and reset with `RESET_SESSION`.
- Auto-print runs exactly once when successful-payment receipt appears; refund and transaction-detail printing remain manual.
- Preserve minimum 48dp touch targets and compact, expanded, and short-landscape layouts.
- Do not commit, push, or overwrite unrelated uncommitted work.

---

### Task 1: Printer State

**Files:**
- Modify: `src/types.ts`
- Modify: `src/state/PosContext.tsx`
- Test: `src/__tests__/reducer.test.ts`

**Interfaces:**
- Produces `PaperWidth = '58 mm' | '80 mm'`, `PrintCopies = 1 | 2 | 3`, and `PrinterSettings`.
- Produces `PosState.printerSettings` and actions `setPaperWidth`, `setCopies`, `setAutoPrint`.

- [ ] Write reducer tests asserting initial defaults, all three setting actions, and reset defaults.
- [ ] Run `npm test -- src/__tests__/reducer.test.ts --runInBand --modulePathIgnorePatterns='<rootDir>/.claude/'`; expect failure because printer state/actions do not exist.
- [ ] Add printer types, initial state, reducer actions, and action creators. Keep payloads constrained by TypeScript unions.
- [ ] Re-run focused reducer tests; expect pass.

### Task 2: Printer Settings Route and UI

**Files:**
- Create: `src/features/more/PrinterSettingsScreen.tsx`
- Create: `app/printer.tsx`
- Modify: `src/features/more/MoreScreen.tsx`
- Modify: `app/(pos)/more.tsx`
- Test: `src/__tests__/printer-settings.test.tsx`

**Interfaces:**
- Consumes `usePosState().printerSettings` and printer actions from Task 1.
- Produces `PrinterSettingsScreen({ onBack? })` and `MoreScreenProps.onOpenPrinter`.

- [ ] Write source/component contract tests asserting route existence, shared `PosTopBar`, More callback to `/printer`, paper/copy controls, Auto-print switch, and 1.2-second Test Print feedback containing current copy count and paper width.
- [ ] Run `npm test -- src/__tests__/printer-settings.test.tsx --runInBand --modulePathIgnorePatterns='<rootDir>/.claude/'`; expect failure because screen and route do not exist.
- [ ] Implement a scrollable responsive screen using `PosTopBar`, `PosCard`, `PosBadge`, `PosButton`, native `Pressable` and `Switch`. Changes dispatch immediately; no Save button.
- [ ] Replace static More printer row with an accessible 48dp pressable entry showing `Terhubung (Mock)` and route it through `router.push('/printer')`.
- [ ] Implement Test Print timer cleanup, loading button state, and success message `Test print berhasil (${copies}x, ${paperWidth})`.
- [ ] Re-run focused printer tests; expect pass.

### Task 3: Receipt Mock Printing and Auto-print

**Files:**
- Modify: `src/features/payment/ReceiptContent.tsx`
- Modify: `src/features/payment/PaymentSuccessScreen.tsx`
- Test: `src/__tests__/printer-settings.test.tsx`
- Test: `src/__tests__/payment.test.tsx`

**Interfaces:**
- `ReceiptContent` consumes `paperWidth?: PaperWidth`, `copies?: PrintCopies`, and `autoPrint?: boolean`.
- `PaymentSuccessScreen` forwards current printer settings.

- [ ] Add tests/contracts asserting disabled Auto-print does not schedule printing, enabled Auto-print invokes the existing print path once, and feedback includes copy count and paper width.
- [ ] Run focused printer/payment tests; expect failure because receipt props and one-shot effect do not exist.
- [ ] Extend `ReceiptContent` with settings props, a stable `handlePrint`, timer cleanup, and `useRef` one-shot Auto-print guard. Reuse the same mock path for manual and automatic printing.
- [ ] Forward `state.printerSettings` from `PaymentSuccessScreen`. Do not alter refund or transaction-detail behavior.
- [ ] Re-run focused tests; expect pass.

### Task 4: Full Verification

**Files:**
- Verify all modified files only.

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run lint -- --no-cache --ignore-pattern '.claude/**'`.
- [ ] Run `npm test -- --runInBand --modulePathIgnorePatterns='<rootDir>/.claude/'`.
- [ ] Run `git diff --check`.
- [ ] Run Metro on port 8081, set `adb reverse tcp:8081 tcp:8081`, and open `/printer` on emulator-5554 API 36.
- [ ] Verify compact and expanded UI, Test Print feedback, Auto-print receipt feedback, foreground activity, and logcat without `FATAL EXCEPTION`, `Unable to load script`, or `loadJSBundleFromAssets`.
