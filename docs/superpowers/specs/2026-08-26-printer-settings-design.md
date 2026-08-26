# Printer Settings Design

## Scope

Add local mock receipt-printer settings to Phase 1. No Bluetooth, LAN, USB, iMin SDK, native printing, discovery, pairing, permissions, backend, persistence, or dependency changes.

Settings live only for the current app session and reset when the app restarts or the POS session is reset.

## User Flow

The existing `Lainnya` screen exposes a `Printer` entry under general settings. Selecting it opens a dedicated printer-settings route using the existing shared top bar and responsive POS shell.

The screen shows:

- Printer: `Printer Kasir Utama`
- Status: `Terhubung (Mock)` using text and status styling
- Paper width: `58 mm` or `80 mm`; default `80 mm`
- Copies: `1`, `2`, or `3`; default `1`
- Auto-print after successful payment; default disabled
- `Test Print` action

Changes apply immediately. There is no Save button.

## State

`PosContext` remains the single state owner. Add one printer settings object containing paper width, copy count, and auto-print state. Printer name and mock connection status are fixed presentation values, not configurable state.

Reducer actions update each setting. `RESET_SESSION` restores printer defaults. No storage adapter or separate printer provider is introduced.

## Printing Behavior

Manual printing remains available from receipt and transaction-detail flows.

`Test Print` starts a 1.2-second local loading state, then shows visible success feedback. No failure simulation is added because no real device is contacted.

When Auto-print is enabled, the successful-payment receipt triggers the existing mock print operation exactly once when the success receipt is shown. Refund completion does not auto-print; refund and transaction-detail printing remain manual.

Paper width and copy count appear in mock print feedback so users can verify their settings. They do not change native print output because Phase 1 has no device integration.

## UI and Accessibility

Use existing tokens, `PosCard`, `PosButton`, `PosBadge`, `PosIcon`, and `PosLoadingIndicator`. Selection controls preserve minimum 48dp touch targets and expose selected/disabled/busy accessibility state.

Compact and short-landscape layouts use one scrollable column. Expanded layouts may use the existing centered content width; no new navigation variant is introduced.

## Testing

Add reducer tests for defaults, each setting update, validation, and reset behavior. Add source/component contracts for the route, More-screen navigation, Test Print feedback, and one-shot Auto-print behavior.

Run focused tests first, then TypeScript, lint, full Jest, `git diff --check`, and API 36 runtime checks for compact and expanded layouts.

## Deferred

Real printer discovery, pairing, connection health, retry, failure handling, persisted preferences, printer profiles, receipt templates, device permissions, and native SDK integration belong to a later phase after hardware and SDK requirements are known.
