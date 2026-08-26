# POS Report Design

## Scope

Add a local, read-only sales report to Phase 1. The report uses transactions already held by `PosContext` and introduces no backend, ERP integration, persistence, chart dependency, export file, date picker, or physical printer integration.

The feature includes:

- A `Laporan` entry under the general section of `Lainnya`
- A dedicated `/report` route
- Daily, weekly, monthly, and yearly period filters
- Sales summary cards
- A revenue chart
- Payment-method and top-product breakdowns
- A mock `Cetak Laporan Closing` action

## Navigation

`Lainnya` exposes `Laporan` using the same interactive row pattern as `Printer`. Selecting it opens `/report`. The route remains a thin Expo Router adapter and renders `ReportScreen` with `router.back()` as its back action.

`ReportScreen` uses the shared `PosTopBar`. The back action is always available on the left. The report is not added to bottom navigation because it is a secondary workflow.

## Period Model

The report supports four fixed filters:

- `Harian`
- `Seminggu`
- `Bulan`
- `Tahun`

The selected period is local component state and defaults to `Harian`. No custom date picker is added.

Mock transaction dates determine the reporting anchor. The most recent parseable transaction date is the anchor, which keeps the report deterministic even when sample data does not match the device date. If no transaction has a parseable date, the screen shows an empty report instead of substituting fabricated values.

Period boundaries are:

- Daily: the anchor calendar day; chart buckets group revenue by transaction time
- Weekly: Monday through Sunday containing the anchor; chart buckets are seven calendar days
- Monthly: the anchor calendar month; chart buckets group days into weeks of month
- Yearly: the anchor calendar year; chart buckets are twelve calendar months

Every bucket remains present when its value is zero. The visible date-range label states the active boundary.

## Transaction Semantics

Draft transactions are excluded from every report metric.

Completed sale value is derived from transaction totals and refunds:

- `Berhasil`: net sales equal `total`; refund equals zero
- `Dikembalikan Sebagian`: net sales equal `total - refundedTotal`; refund equals `refundedTotal`
- `Dikembalikan`: net sales equal zero; refund equals `refundedTotal` when present, otherwise `total`

All monetary results are clamped to zero where inconsistent mock values would otherwise make a transaction negative.

Summary metrics are:

- `Penjualan Bersih`: sum of net sales
- `Transaksi Berhasil`: count of `Berhasil` and `Dikembalikan Sebagian` transactions
- `Total Refund`: sum of refunded value
- `Rata-rata Transaksi`: net sales divided by successful transaction count, or zero when no successful transactions exist

Payment-method totals use each transaction's net sales and exclude zero-value methods. Top products use sold quantities minus matching refunded quantities, aggregate by product identity, omit zero quantities, sort by quantity descending, and return at most three products.

## Screen Layout

The screen is one vertical `ScrollView` with adaptive gutters and enough bottom padding to clear system and navigation areas.

Content order:

1. Shared top bar
2. Four-option period control
3. Active date-range label
4. Summary metric cards
5. `Tren Omzet` chart
6. Payment-method breakdown
7. Top-products ranking
8. `Cetak Laporan Closing` button
9. Temporary print feedback

Compact phone layouts show summary cards in a two-column grid. Expanded layouts show four cards in one row when space permits. Large text or insufficient width may reduce the grid to one column. Short landscape remains vertically scrollable and never requires horizontal page scrolling.

Existing `Colors`, `Typography`, `Spacing`, `Radius`, `PosCard`, `PosButton`, `PosIcon`, and `PosTopBar` remain the visual authority. Generator-recommended colors and fonts are not adopted because they conflict with the established application design system.

## Period Control

The period control uses four `Pressable` segments. Every segment has at least a 48dp touch target, visible pressed feedback, `accessibilityRole="button"`, selected state, and a descriptive accessibility label.

Selection changes the report immediately. No Apply button or loading state is needed because aggregation is local and synchronous.

## Revenue Chart

The chart is a dependency-free vertical column chart built with React Native `View`, `Text`, and `StyleSheet`.

Each bucket displays:

- A visible period label
- A proportional bar
- A formatted revenue value or compact value label
- An accessibility label containing the full bucket name and amount

Bars use the existing brand color, but height, text labels, and reading order carry the meaning so color is not the only signal. Zero-value buckets keep their label and render a zero state without disappearing.

The chart uses the maximum bucket value as its scale. When every bucket is zero, it renders `Belum ada transaksi pada periode ini` instead of an empty plot. No tooltip, zoom, horizontal chart scrolling, or animation is added.

## Breakdown Sections

Payment methods use compact spread rows ordered by net sales descending. The section displays an empty message when no net payment exists for the period.

Top products use a numbered list with product name and net quantity, ordered by quantity descending. Equal quantities use product name as a stable tie-breaker. The section displays an empty message when no product remains after refunds.

## Print Closing

`Cetak Laporan Closing` is an operational action independent from the selected analytics filter. It always prints the daily closing report for the anchor day.

The mock print action:

1. Disables the button
2. Shows the existing loading treatment with `Mencetak laporan…`
3. Waits 1.2 seconds
4. Shows `Laporan closing berhasil dicetak (<copies>x, <paperWidth>)`
5. Clears the feedback after 2.5 seconds

Copy count and paper width come from `state.printerSettings`. The mock does not generate PDF or CSV output and does not contact a printer. Repeated presses while busy are ignored. Timers are cleared when the screen unmounts.

## Accessibility and Interaction

- All interactive targets are at least 48dp
- New interactions use `Pressable` or the shared `PosButton`
- Icon-only controls have accessibility labels
- Selected and busy states are exposed to assistive technology
- Text and chart labels use existing contrast-tested semantic tokens
- Screen-reader order matches visual order
- Information never depends on color alone
- No decorative motion is introduced
- Dynamic text may wrap without clipping values or controls

## Empty and Invalid Data

The report never throws because a date is malformed or report data is absent. Invalid-date transactions are omitted from period calculations. Empty summary cards show zero values, while chart and breakdown sections show explicit empty messages.

The report is read-only. It does not mutate transactions, printer settings, cart state, payment state, or shift state.

## File Boundaries

- `app/report.tsx`: thin route adapter
- `src/features/more/ReportScreen.tsx`: report composition, filter interaction, and print feedback
- `src/features/more/report.ts`: pure period parsing and aggregation helpers
- `src/features/more/MoreScreen.tsx`: report menu entry and callback
- `app/(pos)/more.tsx`: `/report` navigation wiring
- `src/__tests__/report.test.ts`: pure aggregation and source-contract coverage

No new provider, service, chart abstraction, or dependency is introduced.

## Testing

Focused tests cover:

- Default daily period and period boundaries
- Draft exclusion
- Successful, partial-refund, and full-refund calculations
- Zero-safe averages
- Revenue bucket construction for all four filters
- Payment-method ranking
- Net top-product ranking and three-item limit
- Route and More-screen navigation wiring
- Accessible period controls and chart labels
- Daily-only closing print semantics
- Printer copy and paper-width feedback
- Timer cleanup and busy-state protection through source/component contracts where direct rendering is impractical in the current Node Jest setup

Verification runs focused Jest first, then TypeScript, lint, full canonical Jest with `.claude/` excluded, `git diff --check`, and API 36 runtime checks on compact portrait, short landscape, and expanded dimensions.

## Deferred

Custom date ranges, server-backed analytics, shift-specific persisted snapshots, targets, comparisons with prior periods, tax reports, cashier reports, exports, physical printing, scheduled reports, and chart interaction remain deferred until requested and supported by authoritative data sources.
