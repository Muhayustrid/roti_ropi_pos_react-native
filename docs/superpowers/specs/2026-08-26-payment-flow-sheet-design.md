# Payment Flow Sheet Design

## Scope

Convert the Phase 1 payment flow into one continuous presentation owned by the public `/payment` route.

Included steps:

- payment method selection;
- cash entry;
- split payment;
- QRIS or card confirmation;
- payment verification;
- successful payment receipt.

Compact and short-landscape layouts use a collapsible bottom sheet. Expanded tablet keeps the existing full-screen adaptive presentation. This change remains mock-only and does not add backend settlement, transaction persistence, ERP integration, or dependencies.

## Architecture

`/payment` remains the only payment entry route used by cashier checkout. It renders a parent payment-flow component that owns the current step and step history.

The flow reuses the existing payment screen content and calculations. Navigation callbacks change internal flow steps instead of pushing separate routes. The former `/cash-entry`, `/split-payment`, `/checking?mode=payment`, and `/payment-success` routes are not used by the main checkout flow. They may remain as thin compatibility adapters unless removing them is proven safe during implementation.

The parent selects its presentation from the existing responsive layout rules:

- width `<700dp`: sheet presentation opened at `75%`;
- width `>=700dp` with height `<600dp`: sheet presentation opened at `100%`;
- width `>=700dp` with height `>=600dp`: full-screen presentation, including medium and expanded tablets.

A shared flow shell owns the step header and presentation behavior: animated height, drag handle, backdrop, back action, close action, centered title, and a content slot. Payment step components own their scroll content and sticky actions, avoiding duplicate headers.

## Flow

The internal step sequence is:

```text
payment-method
  ├─ cash → cash-entry → checking → success
  ├─ split → split-payment → checking → success
  └─ QRIS/card → confirmation → checking → success
```

Back navigation follows recorded step history rather than route history. Returning to an earlier step preserves payment method, cash input, and split allocations while the flow remains mounted.

QRIS and card confirmation becomes an internal flow step. It does not open a second modal above the payment sheet.

Checking retains the existing simulated Phase 1 completion behavior. Success retains the existing mock receipt and print feedback.

## Header and Navigation

Each nested payment step has one header:

- back button on the left;
- centered step title;
- close button on the right.

The root payment-method step has no back button because it has no previous payment step. Its left slot remains reserved so the centered title does not move.

Navigation behavior:

- back button: return one payment step;
- Android hardware back on a nested step: return one payment step;
- Android hardware back on the root step: close the payment flow;
- close button from any incomplete step: close the entire payment flow and return to cashier;
- backdrop press: same as close;
- downward dismiss gesture from 75%: same as close;
- success close and `Transaksi Baru`: reset the mock session and return to cashier.

Closing an incomplete flow must not reset or clear the cart. Cashier checkout closes the cart sheet before opening payment, preventing stacked cart and payment sheets.

## Sheet Behavior

The sheet follows the established cart interaction pattern:

- compact initial height: `75%` of current window height;
- upward drag or handle activation: expand to `100%`;
- downward drag from `100%`: return to `75%`;
- downward drag past the dismiss threshold from `75%`: close the flow;
- backdrop press: close the flow;
- close button: close the flow.

Short landscape opens at `100%` because `75%` of the short viewport cannot reliably fit the header, sticky footer, keypad, and useful scroll area. It remains draggable down to `75%`, then dismissible with another downward gesture.

Height animation uses `useNativeDriver: false`. Spring configuration uses only the existing `stiffness`, `damping`, and `mass` family. Pan handlers attach only to the drag/header zone, leaving inner `ScrollView`, money fields, keypad, and action buttons interactive.

The sheet backdrop is transparent enough to preserve cashier context but dark enough to show modal ownership. Payment content never receives backdrop presses.

## Step Layouts

Existing content hierarchy remains:

- payment method: amount due, method choices, split action, primary proceed action;
- cash: amount received, total, remaining/change, quick amounts, keypad, completion action;
- split: amount due, method allocations, allocated total, remaining amount, completion action;
- confirmation: total, customer, method, item count, back and confirm actions;
- checking: pending status and cancel action;
- success: receipt, mock print action, and new-transaction action.

Every step keeps its sticky action footer outside its scroll view. No footer overlays scroll content.

Expanded tablet preserves existing adaptive behavior:

- payment methods use the existing multi-column grid;
- cash uses the existing two-pane layout when `hasSidePane` is true;
- split and receipt retain their existing width limits;
- no sheet backdrop, drag handle, or snap animation is rendered.

## State

Global POS state continues to own cart, customer, promotion, payment method, and cash amount. Split allocations move to the parent payment flow or another existing flow-lifetime owner so they survive internal back navigation.

No new persistence layer or transaction settlement model is introduced. Existing Phase 1 mock success and receipt data remain in scope. Any incorrect default cash amount or split receipt semantics are separate behavior changes unless required to prevent the new flow from losing user input.

## Accessibility

- All back and close controls keep at least `48dp` touch targets.
- Back uses accessibility label `Kembali`.
- Close uses accessibility label `Tutup pembayaran`.
- Backdrop exposes a close action without covering the sheet in accessibility order.
- Payment method selection retains selected/radio semantics and does not rely on color alone.
- Drag handle exposes expand or collapse wording matching the current snap state.
- Checking status retains polite live-region behavior where supported.

## Testing

Add executable tests for:

1. sheet snap state transitions: `75%`, `100%`, collapse, and dismiss;
2. compact initial height is `75%`;
3. short landscape initial height is `100%`;
4. expanded tablet selects full-screen presentation;
5. backdrop and close exit the whole incomplete flow without resetting cart;
6. back moves one internal step and preserves input;
7. root Android back closes the flow;
8. nested Android back moves one step;
9. confirmation, checking, and success are internal steps;
10. success close and `Transaksi Baru` reset the mock session;
11. pan handlers remain isolated from scroll and input content;
12. sticky footers remain outside scroll views;
13. payment entry remains the public `/payment` route.

Run the closest payment and sheet tests first, then the full test suite, TypeScript, changed-file lint, and `git diff --check`. Validate manually at `411x923`, `923x411`, and `1280x800` while Metro remains available for the Android debug build.

## Out of Scope

- backend or ERP payment settlement;
- durable transaction records;
- real QRIS, card, or split processing;
- changed receipt schema;
- new animation or gesture dependency;
- unrelated payment calculation fixes;
- redesign of expanded-tablet payment content.
