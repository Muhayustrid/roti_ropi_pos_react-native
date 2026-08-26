# Dynamic Promotion Integration Handoff

## 1. Status

This document is the Android entry point for Dynamic Promotion integration.
Runtime source and executable tests outrank this document.

The current client uses:

- Expo SDK 57;
- Expo Router;
- React Native 0.86.2;
- React 19.2.3;
- strict TypeScript 6.0.3;
- Jest 29 with `ts-jest`.

The current client is local and mock-only. It has no HTTP transport, OAuth transport, secure token store, durable mutation store, or remote sale request builder.

The current `Promo` and `OfferPicker` implement a local percentage discount. They are not Dynamic Promotion contracts.

The target client will discover, quote, select, and submit backend-owned Dynamic Promotion packages. Both blockers in section 4 closed with executable backend evidence on 2026-08-26. Android transport and UI implementation may now start.

## 2. Working Tree Safety

This repository contains active operator work. At the start of this handoff, tracked files were modified across routing, state, components, screens, mocks, and tests. These refund paths were untracked:

- `app/refund/`;
- `src/features/refund/`;
- `src/__tests__/refund-flow.test.ts`;
- `docs/superpowers/specs/2026-08-26-refund-flow-design.md`;
- `docs/superpowers/plans/2026-08-26-refund-flow.md`.

Before each implementation stage:

1. Run `git status --short --branch`.
2. Save the output as the stage baseline.
3. Edit only the files named by that stage.
4. Review a path-scoped diff after the stage.
5. Compare the final status with the baseline.

Never reset, clean, stash, rewrite, or overwrite unrelated operator work.
Do not modify the refund paths from this handoff.

## 3. Authority Order

Use these authorities in order:

1. Current backend runtime source and executable tests.
2. `roti_ropi_pos` commit `4eaedbfdceb6af9ec6654e2fc7c3b29e82b42753`.
3. `selling_additional` commit `b0bf90d91f1929d6d2086044863632d36d4adfe3`.
4. `roti_ropi_pos/docs/mobile-pos/api-contract.md`.
5. Other backend and Android documentation.

The backend commits close bearer-route and authoritative-quote blockers. They do not implement Android transport, storage, state, or UI.

## 4. Backend Readiness Gates

| Blocker | Current evidence | Exit requirement |
| --- | --- | --- |
| Promotion facade bearer access — CLOSED (2026-08-26) | `roti_ropi_pos/mobile_pos/auth_hook.py` now allowlists 20 exact methods: 17 v1 routes and 3 POST-only `selling_additional` facades. Seventeen HTTP tests passed twice. They cover all exact facade paths, bearer failures, profile scope, method restrictions, alternate dispatch, and generic route rejection. | MET |
| Authoritative combined payable — CLOSED (2026-08-26) | `sales.quote_cart` accepts the same `promotions` object or `null` as `sales.submit`. It returns authoritative totals and payment policy for regular-only, promotion-only, and mixed carts. Twelve quote tests and five quote-submit integration tests passed twice. Quote tests also prove no durable invoice, request, selection, fact, Item Price, stock, or accounting artifact. | MET |

**Stop condition — RETIRED:** Both blockers are now closed. Dynamic Promotion payment and sale submission may now proceed via the authoritative quote.

Promotion read permission does not bypass the route gate. `quote_promotion.total_price` does not authorize Android to calculate tax, rounding, `client_accepted_grand_total`, `payable`, or payments.

## 5. Implemented Backend Contract

### 5.1 Promotion facades

These methods exist in `selling_additional`. They are three POST-only routes within the 20-method Mobile POS bearer allowlist. Android may call them with the configured Mobile POS bearer and an enabled POS Profile assigned via `applicable_for_users`.

```text
/api/method/selling_additional.overrides.pos_promo_api.get_available_promotions
/api/method/selling_additional.overrides.pos_promo_api.get_promotion_detail
/api/method/selling_additional.overrides.pos_promo_api.quote_promotion
```

The decorators are now `@frappe.whitelist(methods=["POST"])`, matching the existing Desk POS `frappe.xcall()` (POST) consumer. All three are POST-only; GET/PUT/DELETE/PATCH are rejected.

They return native Frappe responses:

```json
{
  "message": {}
}
```

They do not return the Mobile POS v1 `ok`, `data`, `error`, and `meta` envelope.

All three facades require:

- read permission on `Promotion`;
- an enabled POS Profile assigned to the authenticated cashier through `applicable_for_users`;
- a `POST` request through the exact allowlisted path.

All three methods require `pos_profile`. `get_promotion_detail` returns `eligibility.is_eligible == false` for an ineligible promotion on the assigned outlet. Quote and submit reject an ineligible promotion. Missing, unassigned, or disabled profiles fail closed.

`Mobile POS Cashier` has read-only Promotion permission. It has no create, write, delete, report, export, share, or submit permission.

### 5.2 Discovery and detail

`get_available_promotions` requires `pos_profile`. It returns eligible promotion summaries for that exact outlet.

`get_promotion_detail` requires `promotion`. Pass `pos_profile` so the response includes outlet eligibility.

A detail contains fixed components and choice groups. Each choice group contains server row identities in `options[].name`.

### 5.3 Choice and quote shape

Send one entry for every required choice group:

```json
[
  {
    "choice_group_key": "grp_example",
    "options": [
      {
        "option_id": "option-row-name",
        "qty": 1
      }
    ]
  }
]
```

`qty` must be a positive integer. The selected quantities must equal the group's `pick_count`. Respect `max_per_option` when it is greater than zero.

`quote_promotion` validates eligibility and choices. It returns package row descriptors and `total_price`. It does not quote final POS Invoice tax, rounding, payable, or payment policy.

### 5.4 Sale payload

`sales.submit` accepts one optional request-only `promotions` field:

```json
{
  "instances": [
    {
      "promotion": "PROMO-00001",
      "selections": [
        {
          "choice_group_key": "grp_example",
          "options": [
            {
              "option_id": "option-row-name",
              "qty": 1
            }
          ]
        }
      ]
    }
  ]
}
```

Rules:

- Send a JSON object or `null`.
- Omission and `null` preserve the plain-sale path.
- The server serializes the object as compact, deterministic UTF-8 JSON.
- The serialized value must not exceed 64 KiB.
- `roti_ropi_pos` treats the inner shape as opaque.
- `selling_additional` owns semantic validation and materialization.
- A promotion-only request may send `items: []` when `promotions` is non-null.
- A plain request still requires a non-empty `items` array.
- `sales.quote_cart` accepts the same optional `promotions` object/null as `sales.submit` (64 KiB, opaque) and returns authoritative totals for regular, promotion-only, and mixed carts.
- The response remains the standard v1 `SaleDetail`.
- No new response field or error code exists.

The engine materializes Model C rows:

- one non-stock promotion parent carries full package revenue;
- stock components carry zero revenue.

Android sends only the promotion and selection identities. It never sends materialized parent or component rows as regular sale items.

### 5.5 Idempotency and replay

The normalized promotions value participates in the existing `sales.submit` request hash.

1. Build the final request body after the cashier confirms the intent.
2. Generate one lowercase UUID v4.
3. Persist the exact body and key before sending.
4. Reuse both after a timeout, response loss, process death, or token refresh.
5. Persist the terminal response before clearing the pending record.

Changing any promotion selection creates a new intent and requires a new key. Reusing a key with changed selections returns `IDEMPOTENCY_KEY_REUSED`.

Same key plus the same body creates one POS Invoice, one selection set, and one fact set. A successful replay returns `meta.replayed: true` without duplication.

The Android repository has no durable pending-mutation store yet. Keep mutation submission disabled until an approved store exists.

## 6. Deployment Prerequisites

Backend source and tests are committed and pushed on feature branches. This documentation does not authorize a merge, migrate, or deployment.

Before a target site serves Dynamic Promotion sales:

1. Take and record a site backup.
2. Migrate `selling_additional` on that site.
3. Set `Stock Settings.auto_insert_price_list_rate_if_missing` to `0`.
4. Verify every Promotion parent item has zero selling Item Price rows.
5. Verify the site runs POS Invoice mode.

A Promotion parent must never gain a selling Item Price. The engine owns its rate per transaction.

Known suffix-scoped residue `035905d2` remains only on `selling-cutover.localhost`. It came from an earlier test transaction. A safe cleanup attempt hit a normal Frappe link constraint and rolled back fully. This residue does not affect production, backend code readiness, or Android integration. Keep that site test-only. Do not retry cleanup from this workstream.

## 7. Android File Map

| Existing file | Future responsibility |
| --- | --- |
| `src/types.ts` | Add transport and Dynamic Promotion DTOs. Keep the local percentage discount type separate. |
| `src/state/PosContext.tsx` | Store selections through the existing reducer and `usePosState`, `usePosDerived`, and `usePosActions` hooks. Do not create a parallel store. |
| `src/features/cashier/OfferPicker.tsx` | Reuse the modal interaction pattern for list, detail, choices, quote, loading, empty, retry, and removal states. Replace no local semantics until the stage authorizes it. |
| `src/features/cashier/CashierScreen.tsx` | Connect the picker to existing state and cart entry points. |
| `src/features/cashier/CartContent.tsx` | Render the selected instances in the expanded side pane. |
| `src/components/PosCartSheet.tsx` | Render the same instances in compact and short-landscape carts. |
| `src/features/payment/PaymentFlowScreen.tsx` | Consume the future authoritative combined quote before payment and submission. |
| `src/utils/cart.ts` | Keep mock calculations non-authoritative. Never generate an accepted backend total. |
| `src/utils/money.ts` | Format display values only. Preserve decimal strings at the transport boundary. |
| `src/utils/layout.ts` | Preserve the current responsive thresholds. |

Keep route files under `app/` as thin adapters. Change `ProductCard.tsx` only if an approved design places a Dynamic Promotion entry point in the catalog.

Reuse existing theme tokens, `ResponsiveModal`, `PosButton`, `PosBadge`, `StateView`, and other shared POS controls.

## 8. Gated Implementation Sequence

Do not skip directly to picker work. Backend gates 1 and 2 are complete.

1. Add one shared `fetch` transport.
2. Decode Mobile POS v1 envelopes and native Frappe responses separately.
3. Select and approve Keystore-backed token storage.
4. Select and approve durable pending-mutation storage.
5. Integrate bootstrap, profile, opening, catalog, item quote, and regular cart quote flows.
6. Add Dynamic Promotion DTOs without converting wire decimal strings to floating-point values.
7. Extend the existing reducer and context hooks.
8. Adapt `OfferPicker.tsx` for discovery, detail, choices, quote, retry, and removal.
9. Update both cart presentations from the same state.
10. Replace local payable authority with authoritative `sales.quote_cart` output.
11. Build one final sale body with regular items, promotion instances, and exact payments.
12. Persist the final body and one key before sending.
13. Reuse the same body and key after any unknown outcome.
14. Persist the terminal response before clearing pending data.
15. Test compact phone, expanded tablet, and short landscape layouts.

## 9. UI and Accessibility Rules

- Keep every touch target at least 48dp.
- Use compact behavior below 700dp width.
- Use the side rail at 700dp width or greater.
- Use the cart side pane only at 700dp width or greater and 600dp height or greater.
- Keep the bottom sheet for compact and short-landscape layouts.
- Add accessible names and selection states to every choice control.
- Show explicit loading, empty, unavailable, invalid-choice, price-change, retry, and removal states.
- Do not add a navigation route unless the existing responsive modal fails an approved usability test.

## 10. Future Test Map

Update the closest test first:

- `src/__tests__/reducer.test.ts` for reducer state and cap behavior;
- `src/__tests__/cashier-cart.test.tsx` for picker and both cart presentations;
- `src/__tests__/payment-flow.test.tsx` for quote-to-payment authority;
- `src/__tests__/routing.test.ts` only if routing changes.

Add one focused `src/__tests__/dynamic-promotion-contract.test.ts` when transport work starts. It should cover:

- v1 envelope decoding;
- native Frappe `message` decoding;
- exact promotion request serialization;
- same-body and same-key replay after response loss;
- fail-closed behavior when an authoritative quote is missing, stale, or rejected.

Do not modify `src/__tests__/refund-flow.test.ts` from this workstream.

## 11. Non-Goals

- No application source change in this documentation task.
- No local Dynamic Promotion tax, rounding, grand total, payable, or payment calculation.
- No conversion of the local percentage discount into a backend promotion.
- No generic `/api/resource`, `/api/v2`, `frappe.client.*`, or `cmd=` access.
- No Customer creation or mutation.
- No offline sale ledger.
- No parallel React state store.
- No business logic in route files.
- No Mobile POS response DTO addition.
- No backend error-code addition.
- No refund-flow change.
- No speculative product-card redesign.
- No storage dependency before approval.
- No migrate or deployment from this task.
