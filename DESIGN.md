# RotiRopi POS Design System and UX Contract

Status: the single visual, UI, and UX authority for production RotiRopi POS
Android. Originally written as the as-built specification of the Android/Compose
design prototype, and still the visual target for the production rebuild.

This document describes the intended RotiRopi POS UI and UX. It is written for
another implementation agent that has no prior context. Every token, dimension,
hierarchy, and copy value below was measured from the prototype source, not
invented from a generic POS pattern, and remains the visual target.

The target is visual parity with the documented design while preserving
adaptation to window size. Pixel equality across every Android renderer is not a
promise; exact tokens, constraints, hierarchy, copy, state rules, and responsive
branches are.

Production Android has since gained real ERPNext integration through the Mobile
POS v1 gateway. Where a passage below documents prototype-only implementation,
state architecture, fixtures, or business arithmetic, it is historical reference
material that explains how the visual result was produced. It is never a licence
to regress production architecture or to recompute a server-owned value locally.
The boundary is stated next and applies to the whole file.

## Production Authority Boundary

`DESIGN.md` **is** authoritative for:

- visual design and visual language;
- UI hierarchy and screen composition;
- layout, spacing, radii, and fixed dimensions;
- responsive and adaptive behaviour driven by the measured window;
- component appearance and component recipes;
- interaction presentation — what a state looks like, where a control sits, what feedback is shown;
- accessibility and semantics;
- Indonesian UI copy, where the labelled capability still exists in production;
- screenshot visual references in `screenshots/`.

`DESIGN.md` is **not** authoritative for:

- backend endpoints, request/response shapes, or error codes;
- authentication, OAuth, PKCE, or token storage;
- persistence, database schema, or local storage;
- repositories and data sources;
- idempotency keys and replay;
- retry, recovery, and process-death recovery;
- pricing authority;
- tax authority;
- stock, batch, and serial authority;
- UOM conversion authority;
- POS Invoice accounting;
- returns and refund accounting;
- closing authority, closing expected values, and closing state machine;
- ERPNext business rules;
- production ViewModel and repository architecture.

For all of the above, the authorities are, in order: production Android source
and its executable tests, then the Mobile POS gateway contract in
`apps/roti_ropi_pos/docs/mobile-pos/android-integration-guide.md` (with
`api-contract.md`), then backend runtime source and backend tests, which outrank
every document. `PROJECT_STATE.md` remains the single project-state authority;
`docs/android-gateway-compatibility-audit.md` records the current Android↔gateway
compatibility position.

### Conflict rule

When a passage in this document conflicts with current production Android or
with the Mobile POS gateway contract:

1. Preserve the visual intent — hierarchy, tokens, layout, copy tone, responsive branch.
2. Preserve current verified production behaviour.
3. Follow the gateway contract for backend and business authority.
4. Do **not** reintroduce prototype-only architecture, prototype fixtures, or prototype fake behaviour to satisfy a visual passage.

A visual passage that can only be satisfied by inventing a backend field,
recomputing a server-owned amount locally, or shipping a fake action is not
satisfied — it is deferred until the backend capability exists.

## 1. Read This First

Rebuild in this order:

1. Apply visual tokens from `Visual System`.
2. Implement shared primitives and scaffolding.
3. Implement measured-window adaptation.
4. Bind screens to the existing production state owners; never introduce a new global POS state holder.
5. Implement routes and top-level shell.
6. Implement screens in the route order.
7. Run the acceptance checklist before changing visual values.

Rules for any agent:

- Keep Indonesian UI copy exactly as documented for every capability production still ships. Copy for a capability the backend does not provide is not shipped at all.
- Keep user-facing strings in `res/values/strings.xml` with the `values-en` translation, per `AGENTS.md`. Literal Indonesian in this document is the intended wording, not an instruction to hardcode it in Kotlin.
- Use token names, never new raw colors or arbitrary spacing.
- Use actual measured window width and height, never `isTablet`, orientation, or device model flags.
- Format money through the production formatting seam. Rupiah presentation is unchanged; the amounts themselves arrive from the server as decimal strings and are never re-derived.
- Read derived presentation values from the owning ViewModel, not recomputed independently in composables. Authoritative money and closing values come from the server response, not from a local pipeline.
- Reuse existing primitive recipes before creating a new component.
- Keep interactive icon-only controls labelled for accessibility.
- Convey selection and status with text or icon as well as color.
- Do not weaken, bypass, or replace the existing backend, persistence, recovery, or ERPNext integration layers in order to match a visual passage.
- Do not add speculative settings or a control for a capability the gateway does not expose.
- If current source and this document ever diverge, inspect both, resolve the discrepancy deliberately, and update this document with the implementation change. A production behavioural or contract fact wins; a visual detail in this document wins over an unstyled current screen.

## 2. Product Scope

RotiRopi POS is an Android/Jetpack Compose bakery POS. Its visual language was
ported from an HTML bakery POS prototype through an Android/Compose design
prototype, which is what this document originally specified.

Visual and UX scope, still current:

- Indonesian cashier workflow.
- Shift opening and closing workflow.
- Product catalog and cart.
- Payment method presentation, multi-leg payment presentation, and cash entry presentation.
- Transaction history and receipt detail.
- Responsive layouts for compact, medium, and expanded windows.

### 2.0 Prototype scope versus production capability

**Historical prototype scope.** The design prototype had no server. The
statements below described that prototype and are kept because they explain why
certain screens contain a preview control, a fixed constant, or an inert action:

- no backend calls;
- no ERPNext authentication or persistence;
- no database or local storage;
- no real payment processing;
- no real asynchronous shift or payment verification;
- static sample data from `domain/SampleData.kt`;
- no editable split allocations;
- settings, printer, print, return, and add-payment actions inert;
- no dark theme;
- no instrumented or screenshot test suite.

**None of these is a current production limitation.** Current production
capability is defined by:

- current Android source and its unit and instrumentation tests;
- `apps/roti_ropi_pos/docs/mobile-pos/android-integration-guide.md` for the gateway contract;
- `docs/android-gateway-compatibility-audit.md` for the recorded compatibility position.

Production today authenticates through OAuth 2.0 with PKCE, calls the versioned
Mobile POS v1 gateway, persists pending mutations durably with idempotency keys
and exact replay, survives process death, and implements sale, return, and
closing with server-authoritative money. It also ships a functional theme mode
(system/light/dark), accent, and language setting. This document does not
duplicate the gateway guide; read that guide for endpoints, fields, and error
codes.

Where production does **not** provide something, this document says
`NOT PROVIDED BY BACKEND` at the relevant screen rather than describing a control
to ship. A capability with no gateway contract is absent from shipped UI, not
rendered as a fake or inert control.

The HTML reference used during the port was:
`/Users/rotiropi/Downloads/11agustus2026/Preview_primary.html`.
The prototype Android implementation was the executable reference for the
captures in `screenshots/`; the production app is the executable reference for
behaviour.

### 2.1 Visual reference captures

`screenshots/` next to this file holds device captures of the prototype build,
taken from its debug APK on emulators. They are the **visual reference evidence**
for every screen described in section 8 and for the responsive branches in
section 6.

| Folder | Device | Measured window | Branch |
| --- | --- | --- | --- |
| `screenshots/compact/` | Pixel_10 emulator, 1080x2424 @420dpi | 411 x 923dp | compact |
| `screenshots/expanded/` | Medium_Tablet emulator, 2560x1600 @320dpi | 1280 x 800dp | expanded, `hasSidePane` true |
| `screenshots/short-landscape/` | Pixel_10 rotated, 2424x1080 @420dpi | 923 x 411dp | `hasSideRail` true, `hasSidePane` false |

What the captures do and do not settle:

- They define visual hierarchy, composition, tokens in use, and the responsive branch. Reproduce the layout a capture shows, not a reinterpretation of the prose.
- They do **not** define API, business, or accounting behaviour. Any amount, stock figure, transaction identity, or difference badge visible in a capture is prototype fixture data.
- Ceilings captured deliberately (section 6.3) are evidence of a known defect, not a target to reproduce.
- Where prose and a capture disagree, the prose wins: a capture can lag a later change, and the prose resolves the intentional documented exceptions.
- Production functionality may legitimately differ from a capture — real server data, an absent backend capability, a production-only state, accessibility, localization, or dark mode — while the visual intent stays consistent. Retaining an old unstyled layout is not such a difference.

Screen sections below link the relevant capture.

Filenames are ordered by flow, not by screen name, so the folder reads in the
same order a cashier walks the app: login, opening, cashier, payment, history,
closing.

To recapture after a visual change:

```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb exec-out screencap -p > screenshots/compact/05-cashier.png
```

Rotate for the short-landscape set with
`adb shell settings put system user_rotation 1` (`0` to restore).

## 3. Architecture Contract

**PROTOTYPE REFERENCE ARCHITECTURE.** This whole section documents how the
prototype produced the visual result. It is retained because the measured-window
plumbing in 3.1 is still the correct approach and because 3.2 and 3.3 explain
where each visual value came from.

It is **not** a production mandate. Production Android architecture must not be
simplified or replaced merely to match it. In particular, preserve the existing
verified production layers:

- the `data/api/` gateway client and `MobilePosRepository`;
- `auth/` OAuth, PKCE, and Keystore-backed token storage;
- durable persistence of pending mutations;
- `RecoveryCoordinator`, idempotency keys, exact replay, and terminal-only retirement;
- sale, return, and closing recovery;
- lifecycle state and capability gating;
- the separate per-flow ViewModels;
- process-death behaviour.

A visual rebuild may reuse the prototype's layout and component ideas without
reproducing its state architecture. See
`docs/android-gateway-compatibility-audit.md` §2 for the actual production
composition and §7 for the KEEP / KEEP-BUT-PROTECT classification.

### 3.1 Runtime composition

The measured-window approach below is current and must be preserved. In the
prototype `MainActivity` did four things; in production the equivalent
measurement lives at the shell root:

- Calls `enableEdgeToEdge()`.
- Applies the app theme.
- Measures the real root `BoxWithConstraints` width and height.
- Publishes `PosWindow(width, height)` through `LocalPosWindow` before rendering the shell.

There is no device preset decision. Rotation, fold/unfold, split-screen resize,
and tablet resize all produce a new measured `PosWindow` and follow the same
layout code paths.

Prototype reference behaviour: `PosApp` collected one `StateFlow<PosUiState>`
from one `PosViewModel` and owned one `NavHost`; screens received a state
snapshot and callbacks. Production keeps one shell and one navigation graph, but
state is owned by per-flow ViewModels. Do not collapse them into a single
snapshot.

### 3.2 Layers

Prototype reference layer map, kept so a token or recipe can be traced to where
it was defined. These paths belong to the deleted prototype package
`com.rotiropi.pos.prototype`; the production package is
`com.rotiropi.pos_erpnext`. Do not create prototype paths in production.

| Layer | Prototype responsibility | Prototype source path |
| --- | --- | --- |
| Domain | Money formatting, cart math, models, sample fixtures | `app/src/main/java/com/rotiropi/pos/prototype/domain/` |
| State | One immutable UI snapshot and mutations | `app/src/main/java/com/rotiropi/pos/prototype/PosViewModel.kt` |
| Theme | Colors, type scale, spacing, radii, sizes, Material mapping | `app/src/main/java/com/rotiropi/pos/prototype/ui/theme/` |
| Window | Measured width/height and adaptive predicates | `app/src/main/java/com/rotiropi/pos/prototype/ui/PosWindow.kt` |
| Components | Cards, buttons, fields, bars, layout helpers | `app/src/main/java/com/rotiropi/pos/prototype/ui/components/` |
| Screens | One file per workflow group | `app/src/main/java/com/rotiropi/pos/prototype/ui/screens/` |
| Navigation | Route graph and top-level shell | `app/src/main/java/com/rotiropi/pos/prototype/ui/PosApp.kt` |

Navigation used `androidx.navigation.compose.NavHost` and `composable`, which is
also what production uses. Do not migrate to Navigation 3 as part of a visual
rebuild; that would change architecture without improving parity.

### 3.3 State shape

**PROTOTYPE REFERENCE ARCHITECTURE — not a production target.** `PosUiState` was
one immutable snapshot with these raw fields. It is recorded because the default
values are what the captures render, which makes the captures readable:

```text
openingCash: Long = 200000
openingQris: Long = 0
selectedCategory: String = "Semua"
searchQuery: String = ""
cart: List<CartLine> = [Roti Manis x1]
customer: Customer = Pelanggan Umum
promo: Promo = Weekend
couponCode: String = ""
paymentMethod: PaymentMethod = Qris
cashReceived: Long = 100000
historyFilter: HistoryFilter = All
selectedTransactionId: String = "#TRX-9402"
closingRows: List<ClosingRow> = SampleData.closingRows
```

Prototype derived properties on that snapshot:

- `openingTotal = openingCash + openingQris`.
- `totals = computeTotals(cart, promo, couponCode)`.
- `change = max(0, cashReceived - totals.total)`.
- `remaining = max(0, totals.total - cashReceived)`.
- `visibleProducts` applies selected category and case-insensitive product-name search.
- `visibleTransactions` applies `HistoryFilter`.
- `selectedTransaction` falls back to the first sample transaction if stored selection is absent.
- `closingExpected`, `closingCounted`, and `closingDifference` sum current closing rows.

The transferable rule is only the last one: two composables must never show
different figures for the same state. In production that is achieved by both
reading the same server-supplied value from the owning ViewModel, not by
recomputing a shared local formula. Totals, change, remaining, expected, and
difference are server-owned (section 9.0).

## 4. Visual System

The visual language is quiet, light, and operational: pale gray canvas, white
surfaces, thin borders, restrained blue brand color, large readable money, and
category tints used only as supporting signals.

### 4.1 Color tokens

All values below are current token values. Implementation code must reference
`PosColors` or `Tone`, not repeat these hex values.

#### Base and text

| Token | Hex | Use |
| --- | --- | --- |
| `Bg` | `#F6F7F9` | App canvas |
| `Surface` | `#FFFFFF` | Cards, bars, fields, dialogs |
| `SurfaceAlt` | `#F1F3F7` | Secondary surfaces, keypad, totals background |
| `Border` | `#E2E6EC` | Card and divider hairline |
| `InputBorder` | `#C6CCD6` | Unfocused outlined field border |
| `Text` | `#1E1F22` | Primary text; 14.5:1 on `Surface` |
| `Text2` | `#5F646D` | Secondary text; 6.4:1 on `Surface` |
| `Text3` | `#686E75` | Placeholder and tertiary text |

#### Brand

| Token | Hex | Use |
| --- | --- | --- |
| `Brand` | `#5F7DF7` | Tint, progress indicator, decorative brand icon |
| `BrandFill` | `#4A5FD4` | Filled primary button and strong filled surfaces behind white text |
| `BrandStrong` | `#3F52C2` | Strong brand accent when needed |
| `BrandInk` | `#3A55C0` | Brand text and icons on light surfaces |
| `BrandSoft` | `#EEF1FF` | Brand-tinted cards, selected state, due card |
| `OnFill` | `#FFFFFF` | Text and icons on filled brand surfaces |

`Brand` is not the same role as `BrandFill` or `BrandInk`. Small text on
`Brand` over white is not the intended use. Use `BrandFill` behind white and
`BrandInk` for readable brand text on light surfaces.

#### Semantic status

| Token | Hex | Use |
| --- | --- | --- |
| `Success` | `#4B9B88` | Soft decorative success tone |
| `SuccessFill` | `#3D8272` | Filled success surface if needed |
| `SuccessInk` | `#2F7062` | Success text and icons |
| `SuccessSoft` | `#E7F3F0` | Success badge and callout background |
| `Danger` | `#C95763` | Soft decorative danger tone |
| `DangerFill` | `#B0424E` | Filled danger surface if needed |
| `DangerInk` | `#A8323F` | Danger text and icons |
| `DangerSoft` | `#FBECEF` | Danger badge, refund card, warning state |
| `WarningInk` | `#8A5416` | Warning text and icons |
| `WarningSoft` | `#FDF0E0` | Warning banner and warning surface |

Green means success. Do not use the beverage or another green tone to mean a
product category and success at the same time.

#### Category and payment tones

Each `Tone` has `bg` for an unselected tint, `ink` for readable text/icon, and
`deep` for a selected fill carrying white text.

| Tone | `bg` | `ink` | `deep` |
| --- | --- | --- | --- |
| `Bread` | `#FDF0E0` | `#8A5416` | `#7A4A12` |
| `Cake` | `#EEF1FF` | `#3A55C0` | `#33489F` |
| `Card` | `#F0EEFB` | `#4F42A3` | `#453A8C` |
| `Pastry` | `#F7EDF6` | `#7A3C74` | `#6A3465` |
| `Beverage` | `#E7F3F0` | `#2F7062` | `#296157` |

The same tone system is used for payment methods and product imagery:

- Cash / Tunai uses `Tone.Bread`.
- QRIS / E-Wallet uses `Tone.Cake`.
- Debit / Kredit uses `Tone.Card`.

### 4.2 Typography

Font family is `FontFamily.Default`. Text motion is static. No text style is
below 12sp.

| Token | Size | Weight | Line height | Tracking |
| --- | ---: | ---: | ---: | ---: |
| `Xs` | 12sp | 400 | 16sp | 0 |
| `XsMedium` | 12sp | 500 | 16sp | 0 |
| `XsSemi` | 12sp | 600 | 16sp | 0 |
| `Overline` | 12sp | 600 | 16sp | 0.6sp |
| `Sm` | 13sp | 400 | 18sp | 0 |
| `SmMedium` | 13sp | 500 | 18sp | 0 |
| `SmSemi` | 13sp | 600 | 18sp | 0 |
| `SmBold` | 13sp | 700 | 18sp | 0 |
| `Md` | 15sp | 400 | 21sp | 0 |
| `MdMedium` | 15sp | 500 | 21sp | 0 |
| `MdSemi` | 15sp | 600 | 21sp | 0 |
| `MdBold` | 15sp | 700 | 21sp | 0 |
| `Lg` | 17sp | 600 | 23sp | 0 |
| `LgBold` | 17sp | 700 | 23sp | 0 |
| `Xl` | 20sp | 700 | 26sp | -0.4sp |
| `Xxl` | 24sp | 700 | 30sp | -0.5sp |
| `Display` | 32sp | 700 | 38sp | -1.0sp |

Use `Display` for the single dominant money figure on a screen: amount due,
amount received, or other primary total. Use `Xl` for secondary prominent
money such as a card total.

### 4.3 Spacing, shape, and dimensions

#### Spacing

| Token | Value |
| --- | ---: |
| `Space.s1` | 4dp |
| `Space.s2` | 8dp |
| `Space.s3` | 12dp |
| `Space.s4` | 16dp |
| `Space.s5` | 20dp |
| `Space.s6` | 24dp |
| `Space.s8` | 32dp |

#### Radius

| Token | Shape |
| --- | --- |
| `Radius.sm` | 8dp |
| `Radius.md` | 12dp |
| `Radius.lg` | 16dp |
| `Radius.xl` | 24dp |
| `Radius.full` | 50% |
| `Radius.sheet` | 24dp on top corners only |

#### Fixed dimensions

| Token | Value | Use |
| --- | ---: | --- |
| `Sizes.touch` | 48dp | Icon controls and general touch target |
| `Sizes.control` | 48dp | Buttons and text fields minimum height |
| `Sizes.appBar` | 60dp | Top and brand bars |
| `Sizes.keypadKey` | 56dp | Cash keypad key minimum and compact fixed height |

Cards use `Radius.lg`, a 1dp `Border`, white `Surface`, and no custom elevation.
`PosPaddedCard` adds 16dp content padding. Buttons have zero elevation.

The current `PosLinkButton` has a 36dp minimum height because it is a compact
text action inside a card. Preserve that value for visual parity; do not use it
as a model for new icon-only controls, which remain 48dp.

## 5. Shared Component Recipes

### 5.1 Cards and rows

- `PosCard`: `Surface`, `Radius.lg`, default `Surface`, default 1dp `Border`.
- `PosPaddedCard`: `PosCard` plus 16dp padding around a `Column`.
- `SectionTitle`: `PosType.Lg`, `PosColors.Text`.
- `LabelledValue`: `Xs` label in `Text2`, 2dp gap, `MdSemi` value in `Text`.
- `SpreadRow`: label left in `Text2`, value right aligned, default `Sm`/`SmSemi`, full width.
- `ToneIcon`: tinted background, centered icon at half the diameter; default diameter 44dp, default shape `Radius.full`.

### 5.2 Buttons

`PosButton` is the only standard filled action recipe.

| Style | Container | Content | Border |
| --- | --- | --- | --- |
| `Primary` | `BrandFill` | `OnFill` | none |
| `Tonal` | `BrandSoft` | `BrandInk` | none |
| `Outline` | `Surface` | `Text` | 1dp `Border` |
| `Danger` | `DangerSoft` | `DangerInk` | none |

All styles use `Radius.md`, minimum height 48dp, horizontal content padding
16dp, and zero elevation. Optional leading/trailing icons are 18dp with 8dp
gap. Primary actions are filled; secondary actions are outline or tonal.

`PosBadge` is a pill using `Radius.full`, horizontal padding 8dp, vertical
padding 4dp, and `XsSemi`. If status has meaning, pass an icon too.

### 5.3 Fields

All outlined fields share these colors:

- Focused and unfocused container: `Surface`.
- Focused border: `Brand`.
- Unfocused border: `InputBorder`.
- Cursor: `BrandInk`.
- Text: `Text`.

`PosSearchField` is single line, 48dp minimum, `Radius.md`, `Md` text, leading
search icon, and placeholder in `Text3`.

`MoneyField` is single line numeric input with a `Rp ` prefix. Digits are
parsed through `digitsOnly` and displayed through `formatGrouped`, so
`200000` appears as `200.000`. It may show an `Xs` label above the field.

### 5.4 Banners

`PosBanner` is a full-width `Radius.md` tinted surface with 16dp padding. It
contains a 40dp `ToneIcon` with a semi-transparent white circle, `MdSemi`
title, and `Sm` body at 0.9 alpha of the content color.

### 5.5 Top bars and navigation

`PosTopBar`:

- White `Surface`, 60dp high, bottom divider in `Border`.
- 8dp horizontal padding.
- Optional leading 48dp slot; back icon is AutoMirrored arrow or close icon when `backIsClose` is true.
- Centered `Lg` title.
- Fixed trailing 48dp slot so title remains optically centered even with an action.
- Back content descriptions are `Kembali` or `Tutup`.

`PosBrandBar`:

- White `Surface`, 60dp high, bottom divider.
- Storefront icon 22dp in `Brand`.
- `Roti Ropi POS` in `LgBold` and `Text`.
- Live `HH:mm:ss` clock on the right in `SmMedium` and `Text2`.

`PosBottomNav` and `PosSideRail` share three destinations:

| Destination | Label | Icon |
| --- | --- | --- |
| `Cashier` | `Kasir` | Point of sale |
| `History` | `Riwayat` | Schedule |
| `More` | `Lainnya` | More horizontal |

Selected navigation uses `BrandInk` plus `BrandSoft` indicator. Unselected
navigation uses `Text2`. Selection is conveyed by icon, label, and indicator.

### 5.6 Sticky action footer

`PosActionFooter` is a real sibling below scrolling content, never an absolute
overlay. It has a top divider and white surface.

- Compact horizontal padding: 16dp.
- Wider horizontal padding: 24dp.
- Vertical padding: 12dp.
- Compact action width: full available width.
- Wider action width: fixed 320dp, centered.

This guarantees the last scroll row cannot be covered by the primary action.

### 5.7 Layout helpers

- `MaxColumn = 560dp`: narrow form/body cap.
- `WideColumn = 980dp`: two-column body cap.
- `PosScrollBody`: full-size vertical scroll, centered column, `widthIn(max)`, full width, 16dp default padding, 16dp default vertical spacing.
- `PosTwoUp`: stack first then second below compact; equal-width row with 16dp gap at or above medium.
- `PosButtonPair`: stack primary then secondary compact; side-by-side with secondary on the left and primary on the right when wider.

## 6. Adaptive Window Contract

This section is a **visual contract** and stays authoritative. Adaptation is
decided from the measured window only. Do not replace any predicate below with
`isTablet`, a phone/tablet model check, an orientation check, or a device-name
flag. The current audit found the production adaptive infrastructure healthy —
one `BoxWithConstraints` at the shell root publishing through `LocalPosWindow`,
plus a width-driven layout mode and the `PosWindow.isTall` 600dp height gate
(`docs/android-gateway-compatibility-audit.md` §8) — so this is a contract to
extend, not to rebuild.

### 6.1 Predicates

`PosWindow` is derived from actual available width and height.

| Predicate | Exact rule | Meaning |
| --- | --- | --- |
| `isCompact` | `width < 700dp` | Bottom nav, single-column flows, bottom sheets |
| `isMedium` | `700dp <= width < 1000dp` | Side rail, medium pane widths, two-column method grid |
| `isExpanded` | `width >= 1000dp` | Wider panes and three-column payment method grid |
| `hasSideRail` | `width >= 700dp` | Side rail replaces bottom nav |
| `hasSidePane` | `hasSideRail && height >= 600dp` | Safe full-height two-pane cash layout |

The height check is required. A landscape phone can be about 910dp wide but
less than 600dp tall; splitting it into full-height panes clips content. It
must use the stacked, scrollable arrangement instead.

Production implementation status, for orientation only — these values are the
target, not a record of what is already wired: production currently expresses
the width half as a single 600dp compact/expanded threshold
(`posLayoutModeForWidth`) and the height half as `PosWindow.isTall` at 600dp.
Adopting the three-band table above is an approved foundation migration in the
redesign plan, and it is the only approved change to the `shell-${mode}` test
tags. Migrate the thresholds through that plan; do not silently change a
breakpoint in either direction, and do not treat this note as evidence that the
documented values were superseded.

Prototype reference behaviour: the prototype applied `hasSidePane` only to cash
entry, while the cashier cart pane and the history detail pane keyed off
`hasSideRail`, so a short landscape window did receive two panes. See section 6.3
for what that looks like, which parts of it are accepted, and the documented fix.

### 6.2 Adaptive decisions by area

| Area | Compact | Medium | Expanded |
| --- | --- | --- | --- |
| Top-level navigation | Bottom bar | Side rail | Side rail |
| Cashier cart | Bottom cart bar + modal sheet | 320dp permanent cart pane | 380dp permanent cart pane |
| History | Full list then detail route | 320dp list + detail pane | 380dp list + detail pane |
| Payment methods | 1 column | 2 columns | 3 columns |
| Cash entry | Figures above keypad, one scroll | Same unless `hasSidePane` false | Two panes when `hasSidePane` true |
| Customer/promo/coupon picker | Bottom sheet | Dialog | Dialog |
| `PosTwoUp` | Stacked | Two equal columns | Two equal columns |
| `PosButtonPair` | Primary above secondary | Secondary left, primary right | Secondary left, primary right |

Cashier compact cart sheet uses `skipPartiallyExpanded = true`, top radius
24dp, white surface, a `Keranjang Anda` header, and explicit content height of
70% of the current window height. The checkout action remains visible while
the item list scrolls.

History pane selection follows the filtered list. If the stored selected ID is
not in the current filtered result, the first visible transaction becomes the
pane transaction. Pane scroll state resets when transaction ID changes.

Verified captures of each branch, from the prototype build:

| Area | Compact | Expanded |
| --- | --- | --- |
| Cashier cart | `screenshots/compact/05-cashier.png` (cart bar) and `06-cart-sheet.png` (sheet) | `screenshots/expanded/05-cashier-cart-pane.png` |
| History | `screenshots/compact/17-history.png` then `18-detail-success.png` | `screenshots/expanded/11-history-detail-pane.png` |
| Payment methods | `screenshots/compact/11-payment.png` (1 column) | `screenshots/expanded/08-payment-3-columns.png` (3 columns) |
| Cash entry | `screenshots/compact/14-cash-entry.png` (one scroll) | `screenshots/expanded/10-cash-entry-two-pane.png` |
| Picker | `screenshots/compact/08-promo-picker.png` (sheet) | `screenshots/expanded/06-promo-dialog.png` (dialog) |
| `PosTwoUp` | `screenshots/compact/22-closing.png` (stacked) | `screenshots/expanded/13-closing-two-up.png` |
| `PosButtonPair` | `screenshots/compact/03-confirm-opening.png` (stacked) | `screenshots/expanded/03-confirm-opening.png` (side by side) |

### 6.3 Short landscape behaviour

A rotated phone measures roughly 923 x 411dp: wide enough for the side rail,
too short for full-height panes. Captures are in
`screenshots/short-landscape/`.

These findings are retained as **visual evidence** of what this window does to
the documented layout. They describe the prototype build. Keep them until the
listed fix is deliberately taken in production and re-verified; do not treat a
captured ceiling as a layout to reproduce, and do not remove one just because
production differs.

Accepted, because roughly 300dp of body height cannot hold a full task screen
and scrolling is the correct answer:

- Task screens need two or three scroll gestures. The top bar and the sticky footer each consume fixed height, so the visible body is short by design (`screenshots/short-landscape/05-opening-scroll-required.png`).
- The cash keypad does not fit in one viewport and is reached by scrolling (`screenshots/short-landscape/04-cash-entry-keypad-scrolled.png`). The `Selesaikan Pembayaran` footer stays visible throughout.
- A card can end flush against the footer divider mid-row. The footer is a sibling, so the row is reachable by scrolling; it is not covered.
- The history detail pane still renders and is usable (`screenshots/short-landscape/06-history-detail-pane.png`).

Known ceilings at this window, listed so they are not mistaken for bugs to fix
silently:

- Cashier shows the permanent cart pane because it branches on `hasSideRail`. In a 411dp-tall window the cart line card is vertically compressed: the `Hapus` action and the stepper render shorter than their compact heights, and the pinned checkout button leaves little room for the item list (`screenshots/short-landscape/01-cashier-cart-pane-clipped.png`). Applying `hasSidePane` here instead would fall back to the cart bar plus sheet.
- The payment confirmation dialog loses its detail rows. Total, customer, method, and item count collapse to an empty tinted strip because the dialog text slot has less height than the content needs (`screenshots/short-landscape/02-payment-confirm-dialog-clipped.png`). This one does hide information the cashier is asked to confirm, so it is the highest-value fix of the group.
- Cash entry can leave the `Kembalian` row half-visible above the footer until scrolled (`screenshots/short-landscape/03-cash-entry-figures-clipped.png`).

Do not resolve these by adding a device-type flag. The fix, when taken, is to
extend the existing `hasSidePane` predicate to the cashier cart and to give
the confirmation dialog a scrollable, height-bounded content slot.

### 6.4 Insets

Task screens use:

```text
Column(fillMaxSize + WindowInsets.safeDrawing) {
    PosTopBar(...)
    PosScrollBody(weight = 1f) { ... }
    PosActionFooter { ... }
}
```

Top-level `Kasir`, `Riwayat`, and `Lainnya` screens are wrapped by
`TopLevelShell`. They add no app bar and no top inset padding. The shell owns:

- Status-bar inset on `PosBrandBar`.
- Safe-drawing inset on the side rail.
- Navigation-bar inset on the bottom bar in compact mode.
- Navigation-bar inset on content in rail mode because no bottom bar absorbs it.

Do not add a second app bar or duplicate top/bottom insets inside top-level
screens.

## 7. Navigation and Workflow

**Screen inventory and step ordering are a visual contract. Route strings and the
back-stack graph are PROTOTYPE REFERENCE.** The prototype simulated the whole
workflow as 15 sibling routes whose strings were intentionally identical to the
HTML `showScreen()` keys. Production navigates three root destinations —
`cashier`, `history`, `more` — with `sale/{name}`, `return/{name}`, and `closing`
as child routes, and it reaches sign-in, profile selection, and opening through
the host rather than through POS routes. Do not restructure production navigation
to recreate the 15-route table; use the table to know which screens exist and in
what order the cashier meets them.

| Prototype route | Screen | Main behaviour |
| --- | --- | --- |
| `login` | Login | Continue to opening |
| `opening` | Opening balance | Edit opening amounts, continue to confirmation |
| `confirm-opening` | Confirm opening | Review, go back to edit or confirm |
| `checking-opening` | Checking state | Await opening verification, then enter cashier |
| `cashier` | Cashier | Catalog, cart, checkout |
| `payment` | Payment method | Select method, allocate, or continue |
| `split` | Split payment | Review allocations and finish |
| `cash-entry` | Cash entry | Enter received amount and finish when settled |
| `checking-payment` | Checking state | Await payment result, then history |
| `history` | Transaction history | Filter and select transaction |
| `transaction-detail` | Full-screen detail | Inspect receipt |
| `more` | More/settings | Inspect session and close shift |
| `closing` | Closing count | Enter counted amounts |
| `confirm-closing` | Closing confirmation | Review and close shift |
| `shift-closed` | Completion | View submitted shift and reset session |

Prototype back-stack rules, kept because they describe the intended forward-only
flow shape:

- After opening verification, navigate to the cashier and remove login/opening routes.
- After payment verification, navigate to history and remove payment steps up to the cashier.
- Shift closed back action returns to More.
- Shift closed done ends the session and returns to sign-in, clearing the stack.

Production equivalents of those rules are decided by the real session and
authentication state — opening routing reconciles the authoritative current
session, and logout is gated by unresolved pending mutations — not by popping a
simulated stack. Preserve the visual consequence (no way back into a completed
shift step) and leave the routing implementation alone.

The one rule here that is purely visual and stays binding: task screens own
their top bar; top-level screens do not.

## 8. Screen Specifications

Each screen below has two kinds of content:

- **VISUAL CONTRACT** — container, hierarchy, order, tokens, copy, responsive branch, accessibility. Authoritative.
- **PROTOTYPE DATA/BEHAVIOUR EXAMPLE** — the specific amounts, product names, transaction identities, session values, and any simulated action. Reference only. Real values come from the gateway.

Unless a passage is explicitly marked as an example or as
`NOT PROVIDED BY BACKEND`, read it as the visual contract.

### 8.1 Login

Captures: `screenshots/compact/01-login.png`,
`screenshots/expanded/01-login.png`.

Container:

- Full screen, safe drawing padding, vertical scroll, content centered.
- Main `PosCard` max width 420dp, full available width, 16dp outer padding.

Hierarchy:

1. Storefront `ToneIcon`, 64dp, `BrandSoft` background, `BrandInk` icon.
2. `Roti Ropi` in `Xxl`.
3. `Sistem Point of Sale` in `Sm` and `Text2`.
4. Server card in `SurfaceAlt` with `Server ERPNext`, edit icon, DNS icon, and `oauth-staging.rotiropi.web.id`.
5. Note: `Anda akan masuk dengan aman melalui ERPNext.`
6. Primary button: `Lanjut dengan ERPNext`, leading login icon.
7. Note: `Kata sandi hanya dimasukkan di halaman masuk ERPNext yang aman.`
8. Divider.
9. Footer: `v1.2.0` on left and `Staging` in `WarningInk` on right.

Prototype data example: the version string, the environment badge text, and the
displayed origin are prototype literals. Production shows its own build version
and its configured environment. The site host is environment configuration and is
never hardcoded in a release build.

The edit-server action was inert in the prototype. A cashier-facing server switch
is `NOT PROVIDED BY BACKEND`: the canonical HTTPS origin is fixed configuration
and every request is re-checked against it. Do not ship an inert edit control —
render the origin as read-only information.

Production also owns the sign-in mechanics behind the primary button: OAuth 2.0
Authorization Code with PKCE S256 in a Custom Tab, never a WebView credential
capture. The visual contract here is the card, the hierarchy, and the reassurance
copy, not the flow.

### 8.2 Opening balance

Captures: `screenshots/compact/02-opening.png`,
`screenshots/compact/03-confirm-opening.png`,
`screenshots/expanded/02-opening.png`,
`screenshots/expanded/03-confirm-opening.png`.

`OpeningScreen` uses a task skeleton with top title `Saldo Pembukaan`.

Scrollable content:

- Centered hero with wallet icon, title `Mulai shift Anda`, body `Masukkan saldo awal setiap metode pembayaran sebelum kasir aktif.`
- `Detail Sesi` card with Kasir, Outlet, Profil POS, Mata Uang.
- `Dana Pembukaan` card with one numeric field per payment mode.
- Brand-soft `Total Pembukaan` card.

Sticky primary action: `Mulai Shift` with forward icon.

`ConfirmOpeningScreen` changes the title to `Konfirmasi Pembukaan`, uses a
point-of-sale hero, and states:
`Cek sekali lagi. Saldo pembukaan tidak dapat diubah setelah shift dimulai.`

It shows each amount and the total, then a button pair:

- Primary: `Konfirmasi & Mulai`.
- Secondary outline: `Ubah Saldo`.

Prototype data example: the prototype hardcoded exactly two fields, `Tunai` and
`QRIS`, and the session values in `Detail Sesi` were fixtures. Production renders
one field per payment mode returned for the selected POS profile, with the
server's own mode names, and fills `Detail Sesi` from the bootstrap response. The
visual contract is the card, the field recipe, the field count adapting to the
data, and the brand-soft total card. Amount input format is canonicalized by
production; the server owns whether an opening balance is accepted, and an
already-open or stale session is resolved by server-authoritative routing rather
than by this screen.

### 8.3 Checking state

Captures: `screenshots/compact/04-checking-opening.png` (opening values),
`screenshots/compact/16-checking-payment.png` (payment values),
`screenshots/expanded/04-checking-opening.png`.

`CheckingScreen` is shared for opening and payment verification.

Visual contract for any pending/verifying state:

- Full-screen centered card, max width 420dp.
- Safe drawing padding and 16dp outer padding.
- Card content has horizontal 24dp and vertical 32dp padding.
- 56dp `CircularProgressIndicator` with 3dp stroke and centered refresh icon.
- Centered title in `Lg`.
- Centered body in `Sm` and `Text2`.
- Brand-soft pill status in `XsSemi`.
- Content is a polite live region.

Opening copy:

- Title: `Memeriksa status shift`.
- Body: `Permintaan pembukaan sudah dikirim. Hasilnya sedang diverifikasi.`
- Status: `Memulai shift…`.

Payment copy:

- Title: `Memeriksa hasil pembayaran…`.
- Body: `Tunggu sebentar, transaksi sedang diverifikasi. Jangan tutup aplikasi.`
- Status: `Transaksi #POS-8849-TRX` — the identity shown is the real server
  reference for the pending request; `#POS-8849-TRX` is a prototype literal.

**Prototype reference behaviour, not production authority.** The prototype had a
tonal `Pratinjau berhasil` button on this card, because with no server a spinner
with no exit would have made the review flow impossible. That is a simulation
control. Do **not** ship it, and do not treat this screen's completion as a
client-side decision.

Production resolves a pending state from the server only: a terminal response,
the documented status-polling endpoint with bounded backoff, or the durable
recovery path. Because the pending mutation is persisted before it is sent and
replayed with the same idempotency key, this screen must be safe to leave and
return to; that behaviour belongs to the recovery layer and must not be
reimplemented here. If a pending state needs an exit, it is a real action —
retry, reconcile, or escalate — whose availability comes from the recovery state,
never a preview shortcut.

### 8.4 Cashier and catalog

Captures: `screenshots/compact/05-cashier.png` (catalog plus cart bar),
`screenshots/compact/06-cart-sheet.png` (sheet, item list),
`screenshots/compact/07-cart-sheet-totals.png` (sheet scrolled to offers and
summary), `screenshots/expanded/05-cashier-cart-pane.png` (380dp permanent
pane), `screenshots/short-landscape/01-cashier-cart-pane-clipped.png` (known
ceiling, see 6.3).

The compact grid renders two columns at 411dp and four at 1280dp from the same
`GridCells.Adaptive(minSize = 160dp)`; do not hardcode a column count.

The top-level shell supplies brand bar and navigation. `CashierScreen` adds no
app bar and no top insets.

Catalog order:

1. Search field `Cari produk…`, horizontal padding 16dp and vertical padding 12dp.
2. Horizontally scrollable category chips with 8dp gaps.
3. Product grid with `GridCells.Adaptive(minSize = 160dp)`, 16dp content padding, 12dp horizontal and vertical gaps.

Selected category chip uses `BrandSoft`, `BrandInk`, and a check icon.

Prototype data example: the category set was exactly `Semua`, `Roti`, `Pastry`,
`Kue`, `Minuman`. Production renders the item groups the server returns, with
`Semua` as the unfiltered option. The visual contract is the chip recipe, the
horizontal scroll, the gap, and the selected treatment — not that list.

Product card:

- White bordered `PosCard`, minimum height 48dp, clickable as `Tambah ke keranjang`.
- Product visual area uses the product tone background and `aspectRatio(1.35f)`.
- Centered initials.
- Stock pill at top-left showing the server quantity and UOM.
- Quantity pill at top-right only when quantity is greater than zero.
- Product name in `MdSemi`, max two lines with ellipsis.
- Secondary line: `${unit} · ${category}` in `Xs`.
- Price in `MdBold` and `BrandInk`.

Real products, prices, stock, UOM, and item groups come from the gateway catalog
endpoints; never reintroduce `SampleData` or any built-in product list. Price and
stock are display snapshots — the server re-derives both at quote and submit time,
and an authoritative change during submit is a documented rejection, not a UI
inconsistency to hide.

Low-stock treatment (`Sisa N unit` plus a warning icon in the stock pill) is a
prototype behaviour driven by a fixture `lowStock` flag. It is
`NOT PROVIDED BY BACKEND`: there is no server low-stock signal or capability, and
Android must not invent a threshold. Keep the pill recipe; ship the plain
`N unit` form until the backend returns an explicit warning. When it does, the
documented warning treatment applies unchanged.

Empty catalog state:

- Search-off icon in 56dp secondary tone icon.
- Title `Produk tidak ditemukan`.
- Body `Coba kata kunci lain atau pilih kategori Semua.`.

Compact cart:

- Cart bar is a sibling below catalog, with horizontal padding 16dp and vertical padding 12dp.
- `BrandFill` rounded surface.
- White circular item count, `Lihat Keranjang`, and subtotal in white.
- Opens a full cart bottom sheet.

Wider cart:

- Catalog and cart share a row.
- Divider between them.
- Cart pane is 320dp at medium and 380dp at expanded.
- Cart pane fills height and uses `Bg`.

Cart content order:

1. Customer card with person icon, customer name/detail, and `Ubah pelanggan` icon action.
2. `Item` section title.
3. Cart line cards or empty cart state.
4. `Penawaran` card — see the offers note below before shipping this.
5. Totals summary card.
6. Sticky/pinned `Lanjut ke Pembayaran` action inside the cart column.

Cart line card:

- 44dp product-initial tile in product tone.
- Product name, quantity x unit price, line total.
- Text action `Hapus`.
- Full-pill stepper with 48dp minus and plus controls.
- Quantity below one removes the line; no zero-quantity row exists.

The stepper and remove action edit the cashier's intent. Line rate and line total
are rendered from the server's authoritative quote for the current cart; a
quantity change invalidates the previous quote rather than adjusting a local
total.

Empty cart state:

- Shopping cart icon.
- Title `Keranjang masih kosong`.
- Body `Pilih produk di katalog untuk mulai transaksi.`.
- Checkout disabled while cart is empty.

Offers card — `NOT PROVIDED BY BACKEND`:

- Title `Penawaran`.
- Optional success badge `Hemat terbaik` only when promo or coupon produces a discount.
- Promo row: title `Promo`, current promo label, action `Ubah`.
- Coupon row: title `Kupon`, either `Belum ada kupon` or `${CODE} · Rp X off`, action `Tambah` or `Ubah`.

Promotions and coupons have no bootstrap capability and no versioned endpoint.
The card recipe above stays documented and is the design to use the day one
exists, together with the discount rows in the summary card. Until then the
`Penawaran` section is absent from shipped UI — not rendered empty, disabled, or
fake — because discounts are server-authoritative and Android must never apply
one locally.

Summary card order:

- `Subtotal`.
- `Promosi` as signed negative value in `SuccessInk` — only with the backend discount capability above.
- `Kupon` only when applied and greater than zero — same condition.
- Tax row, labelled from the server's own tax description; render one row per returned tax.
- `Total` in `MdSemi`/`Xl` and `BrandInk`.

Every value in this card is server-owned. Subtotal, each tax, and the total come
from the authoritative cart quote; the fixed `Pajak (10%)` label is prototype
fixture wording, not a rate Android may assume or compute (section 9.0).

`screenshots/compact/10-cart-coupon-applied.png` is a **prototype visual fixture**
of the discount rows: `Tanpa Promo` selected, so `Promosi` reads `Rp 0`, `Kupon`
reads `−Rp 10.000`, and the tax row is charged on the reduced taxable amount. Use
it for row order, sign, and color only.

### 8.5 Cashier pickers

Captures: `screenshots/compact/08-promo-picker.png`,
`screenshots/compact/09-coupon-picker.png`,
`screenshots/expanded/06-promo-dialog.png`,
`screenshots/expanded/07-customer-dialog.png`.

Picker container is responsive:

- Compact: modal bottom sheet, top radius 24dp, close header, scrollable content.
- Medium/expanded: `AlertDialog`, `Radius.lg`, white surface, scrollable text slot.

A picker opened from the compact cart sheet stacks above it; the sheet stays
visible and dimmed behind the picker rather than being replaced.

Customer picker:

- Title `Pilih Pelanggan`.
- Search placeholder `Cari pelanggan terdaftar…`.
- Radio-like selectable rows with person icon and check on selected item.
- Pending selection does not mutate cart until `Gunakan Pelanggan`.
- Primary `Gunakan Pelanggan` applies selection.
- Empty result text: `Pelanggan tidak ditemukan.`.

Production behaviour: rows are the paginated result of the gateway customer
search, with debounce and cancellation of obsolete requests. No selection means
the POS profile default walk-in customer, with an optional walk-in display name
that the server accepts only for that default.

`Tambah Pelanggan Baru` was an inert prototype outline action. Creating a
Customer is `NOT PROVIDED BY BACKEND` and is prohibited by the project rules:
Android selects a registered customer or uses the profile default. Do not ship
the button.

Promo and coupon pickers — `NOT PROVIDED BY BACKEND`, same condition as the
`Penawaran` card in 8.4. The recipes below are the design to use once a discount
capability and endpoint exist; neither picker is shipped before that.

Promo picker:

- Title `Pilih Promo`.
- Radio rows for the available promotions.
- The recommended option carries a `Terbaik` success badge.
- Option labels and descriptions come from the data, not from UI literals.

Coupon picker:

- Title `Terapkan Kupon`.
- Field label `Kode kupon`, placeholder `ROPI5K`.
- Primary `Terapkan Kupon`.
- If an existing code exists, danger action `Hapus Kupon`.

Prototype data example: the prototype's promotions were the three `Promo.entries`
fixtures (`Weekend`, `Member`, `None`, with `Weekend` badged), and a coupon code
resolved to a hardcoded discount. Both are fixtures, never a production rule.

### 8.6 Payment method

Captures: `screenshots/compact/11-payment.png`,
`screenshots/compact/12-payment-confirm-dialog.png`,
`screenshots/expanded/08-payment-3-columns.png`,
`screenshots/short-landscape/02-payment-confirm-dialog-clipped.png` (known
ceiling, see 6.3).

`PaymentScreen` uses task skeleton with title `Pilih Pembayaran` and close-style
back action.

Content order:

1. Brand-soft due card: overline `Total Tagihan`, dominant total, and `${itemCount} item · termasuk pajak`.
2. Payment method cards.
3. Button pair: primary `Lanjut`, secondary outline `Pembayaran Terpisah`.

The due-card amount is the server's authoritative payable for the current quote.
Android renders it; it does not compute or adjust it.

Payment method card:

- `Radius.lg`, white surface.
- 2dp `Brand` border when selected, 1dp `Border` otherwise.
- 40dp method-tone icon.
- Method label and detail.
- Selected check circle in a reserved 20dp slot so text never shifts.

Prototype data example — the prototype's three hardcoded methods, kept because
they define the tone mapping:

| Prototype method | Label | Detail | Tone |
| --- | --- | --- | --- |
| `Cash` | `Tunai` | `Uang fisik` | `Bread` |
| `Qris` | `QRIS / E-Wallet` | `GoPay, OVO, dll.` | `Cake` |
| `CardPayment` | `Debit / Kredit` | `Visa, Mastercard, GPN` | `Card` |

Production renders one card per payment mode the server returns for the profile,
using the server's own mode name as the label. Mode names are server-owned text
and stay literal per `AGENTS.md`. Map a returned mode onto a documented tone by
kind — cash-like to `Bread`, wallet/QR-like to `Cake`, card-like to `Card` — and
fall back to a neutral documented tone for an unrecognized mode rather than
inventing a color. Do not hardcode the three rows above, and do not offer a mode
the server did not return.

`Lanjut` opens the cash-entry presentation for a cash-like mode; otherwise it
opens the confirmation dialog. The dialog has shield icon, title
`Selesaikan pembayaran ini?`, body `Periksa detail sebelum mengonfirmasi.`,
total, customer, method, item count, and buttons `Konfirmasi Pembayaran` and
`Kembali`. Confirming submits the sale through the production checkout path;
whether the sale is accepted, and the resulting document, are server decisions.

### 8.7 Split payment

Captures: `screenshots/compact/13-split.png`,
`screenshots/expanded/09-split.png`.

`SplitScreen` title: `Pembayaran Terpisah`.

- Reuses due card.
- Section title `Metode Pembayaran`.
- One allocation card per available payment mode.
- Secondary surface shows `Total Dialokasikan` and `Sisa`.
- Sticky primary: `Selesaikan Pembayaran`.

Production capability: multi-leg payment is real. Production already submits a
list of payment legs and renders the server's payment modes, so this screen is
functional from the first redesign release. Each returned mode gets an **editable**
allocation card governed by the server's payment-amount policy; Android validates
input syntax, scale, and the policy minimum, and may summarize the entered
allocations for presentation.

`Total Dialokasikan` and `Sisa` are presentation summaries of the cashier's own
entered legs against the server's payable. They are not a settlement decision.
Settlement is server-authoritative: the sum of the legs must equal the payable
exactly, underpayment and overpayment are both server rejections, and the sale is
terminally accepted only when the server confirms full settlement. Partially paid
invoices are outside the MVP.

Adding or removing modes beyond those the server returns is out of scope, so a
generic `Tambah Metode Pembayaran` action is not shipped; the prototype's outline
button and its delete icons were inert placeholders for a split model it did not
have.

**PROTOTYPE / VISUAL FIXTURE CALCULATION.** The prototype derived its two legs
from the live total instead of storing editable state:

```text
cash = min(10000, total)
qris = total - cash
```

That produced a screenshot where the legs always summed to the total. Never use
it in production — allocations are cashier input validated against the server's
policy, and the split is settled by the server.

### 8.8 Cash entry

Captures: `screenshots/compact/14-cash-entry.png` (paid in full, action
enabled), `screenshots/compact/15-cash-entry-underpaid.png` (`Sisa` in danger
ink, `Kembalian Rp 0`, action disabled),
`screenshots/expanded/10-cash-entry-two-pane.png`,
`screenshots/short-landscape/04-cash-entry-keypad-scrolled.png`.

Title: `Pembayaran · Tunai`, using the server's own mode name after the separator.

Figures column order:

1. Dominant `Jumlah Diterima` card.
2. Summary rows `Total Tagihan`, `Sisa`, `Kembalian`.
3. Outline quick amount buttons.

Keypad:

```text
1  2  3
4  5  6
7  8  9
000 0 backspace
```

Keys use `SurfaceAlt`, `Radius.md`, `Sizes.keypadKey = 56dp`, and `Xl` labels.
Backspace has content description `Hapus satu angka`.

Layout:

- If `hasSidePane`: bounded `WideColumn`, figures and keypad as two equal columns, 16dp gap; keypad rows stretch with minimum 56dp.
- Otherwise: figures above keypad in one `MaxColumn`-capped vertical scroll.

The keypad, the dominant received-amount card, `Total Tagihan`, and the sticky
action are the visual contract and stay. `Total Tagihan` is the server's payable.

Pre-submit `Sisa`, `Kembalian`, and the quick-amount buttons are **deferred**, not
inert. The current quote contract accepts no tender input and returns neither a
pre-submit remaining nor a change amount; `change_amount` exists only in the
submitted sale. Android must not derive either value locally, so these rows and
buttons are omitted until a versioned backend preview contract returns
remaining/change for a tender amount. When it does, the documented presentation
applies unchanged, including `Sisa` in danger ink while short. The post-submit
receipt shows the server's `change_amount`; in v1 exact settlement is required, so
that value is normally zero.

The prototype's quick buttons were `Pas`, `20k`, `50k`, `100k`, `200k`, `500k` in
rows of three, with `Pas` resolving against the live local total at click time —
a **prototype visual fixture**, and exactly the kind of local settlement math
production must not perform.

The sticky `Selesaikan Pembayaran` remains disabled until the entered amount
satisfies the production validation for the payable; the prototype expressed this
as `state.remaining == 0L`, which is the same intent computed locally.

Captures `14-cash-entry.png` and `15-cash-entry-underpaid.png` therefore show a
richer figures column than the first production release: use them for the card
hierarchy, row order, danger-ink treatment, and disabled-action presentation.

### 8.9 History list and detail

Captures: `screenshots/compact/17-history.png`,
`screenshots/compact/18-detail-success.png`,
`screenshots/compact/19-detail-refunded.png`,
`screenshots/compact/20-detail-draft.png`,
`screenshots/expanded/11-history-detail-pane.png`.

Top-level history has no additional app bar.

List header:

- Four equal filter tabs: `Semua`, `Berhasil`, `Dikembalikan`, `Draf`.
- Selected tab uses `BrandInk`, semibold text, and a 2dp `BrandFill` bottom line.
- All tabs have a minimum 48dp height and tab semantics.
- Tools row with a period label and a trailing outline button with calendar icon.

Production behaviour: the tab set maps onto the server's mandatory sale status
filter, and the list is the paginated gateway history result with a bounded page
size and a deep-pagination ceiling. The tab labels above stay; the statuses they
request come from the contract, and an unrecognized server status string is
informational text, never a business branch.

Prototype data example: the tools row read `Hari ini, 24 Okt` with an inert
`Semua Waktu` button. A server-side date-range filter is
`NOT PROVIDED BY BACKEND`: the history endpoint is profile-scoped, not
opening-scoped, and any "this shift" narrowing is an approximate client-side
filter against the opening session start. Show the real scope the list is
displaying and do not ship an inert range button — either wire the label to the
scope actually in force or omit the control.

Transaction row:

- Transaction ID, time, item count, amount, status pill, and payment/status line.
- Success: check icon, `SuccessSoft`, `SuccessInk`, `Berhasil`.
- Refunded: undo icon, `DangerSoft`, `DangerInk`, `Dikembalikan`.
- Draft: info icon, `SurfaceAlt`, `Text2`, `Draf`.
- Draft method line says `Lanjutkan pesanan` and uses shopping-bag icon.
- Refunded method line uses danger text and the refund mode name when refund data exists.
- Selected row in pane mode uses 2dp `Brand` border and removes the normal hairline.

Row identity, time, amount, status, and payment mode are server values.
`Pengembalian Tunai` in the capture is the prototype's literal for a cash refund;
render the server's own refund mode name.

Compact interaction: selecting a row opens the full-screen sale detail.

Medium/expanded interaction: selecting a row only changes the right detail pane.
The list width is 320dp at medium and 380dp at expanded.

Full-screen detail top bar:

- Title `Detail Transaksi`, or `Pesanan Draf` for draft.
- Close-style back action.

Print is `NOT PROVIDED BY BACKEND`: no capability and no endpoint support it, so
the prototype's inert print icon is not shipped. Reprinting, when it arrives, is
rendered from the persisted terminal response or a fresh sale read — both are the
server's own numbers — and it requires an explicit backend capability plus print
behaviour first. The `Cetak struk` content description is retained for that day.

Successful detail:

- Centered status hero with 64dp icon, status badge, transaction ID, date/time.
- Card containing customer, item count, total paid, and payment method.
- Section `Item Pesanan` with line list, and the server's taxes and payments.
- Outline `Mulai Pengembalian`.

**`Mulai Pengembalian` is a real production capability.** The prototype's inert
outline button is obsolete and that instruction is withdrawn. Return is
implemented end to end: server-authoritative remaining-returnable quantities, a
server return quote, refund-mode selection, a durable idempotent return mutation
with exact replay, return receipt recovery, and `RETURN_LIMIT_EXCEEDED` handling.
The action is shown when the return capability and the invoice's returnability
permit it, and hidden otherwise — visibility is capability-gated, never a
permanently disabled control. See section 8.11 for the return screen.

Refunded detail:

- Status hero.
- Danger card titled `Informasi Pengembalian` with refund amount, reason, method, original reference.
- Section `Item Dikembalikan` with line list.
- Totals box with `Subtotal`, the server's tax rows, and `Total Dikembalikan` in danger ink.

Refund amount, allocations, eligibility, and the refunded totals are all
server-authoritative. `Pajak (10%)` in the capture is prototype fixture wording;
label tax rows from the server's own tax description.

Draft detail — presentation retained, capability deferred:

- Header with ID, date/time, and draft badge.
- Customer card.
- Warning banner titled `Belum dikirim atau dibayar`, body `Lanjutkan pesanan ini untuk menyelesaikan pembayaran.`.
- Section `Ringkasan Pesanan` with line list and totals box.
- Primary `Lanjutkan Pesanan` returns to the cashier.

Resuming a draft into the cart has no bootstrap capability and no versioned
endpoint, so the resume action is not shipped yet. Keep the banner and totals-box
recipes; the draft totals box labels its tax row `Perkiraan Pajak` rather than a
submitted-tax label, because nothing has been submitted yet.

Receipt totals are rendered from the server's own summary and lines. Never
hardcode a total, and never recompute one that could disagree with the server.

### 8.10 More and settings

Captures: `screenshots/compact/21-more.png`,
`screenshots/expanded/12-more-two-columns.png`.

`MoreScreen` is top-level content without its own app bar.

At wide windows it uses two columns inside `WideColumn`; compact stacks them.

First card:

- Person tone icon, session cashier, `Kasir` role.
- `Outlet`, session status in success ink, `Durasi Sesi`.
- Tonal action `Tutup Shift` with lock icon.

Session identity, outlet, profile, status, and duration come from the server
session; `Aktif` is the wording for an active session, not a constant. `Tutup Shift`
enters the real closing flow (section 8.12), and closing remains a child of More
rather than a root destination. Sign-out also lives here and is blocked while an
unresolved pending mutation exists — that block is production behaviour and must
stay visible rather than being hidden by a restyle.

Second area:

- `Tampilan`: `Tema` and `Warna Aksen`, the accent value in brand ink.
- `Umum`: `Bahasa`, plus printer and support rows.

Theme mode (system/light/dark), accent, and language are **functional production
settings** and are not inert. The prototype's `Terang` and `Biru` are the values
its fixture happened to show, and `Tema` in production offers the system option
too.

Printer, synchronization, and help have no backend capability. Present them as
clearly disabled rows rather than as active controls, or omit them; do not make a
row look tappable and do nothing. The prototype's blanket "setting rows are
visually clickable but inert" no longer applies to the appearance and language
rows.

Dark mode: the captures are light-mode only, so light mode is the visual parity
reference. Dark mode mirrors the same role hierarchy through a dedicated dark role
palette with equivalent contrast and state distinction, never a mechanical
inversion of the light hex values.

### 8.11 Return

No prototype capture exists: the prototype had no return flow, only an inert
`Mulai Pengembalian` button (section 8.9). This screen is therefore specified by
composition rather than by a capture, and it reuses the documented recipes without
inventing a new visual language.

Visual contract:

- Task-screen skeleton: top bar, scroll body, sticky footer, per section 6.4.
- Header identifying the original sale being returned.
- One item-return card per returnable line, using the cart-line-card recipe: item identity, purchased quantity, already-returned quantity, available quantity, and a numeric quantity field or stepper bounded by the available amount.
- A reason input.
- Refund-mode selection using the payment-method-card recipe from 8.6 when more than one mode is allowed.
- A refund totals box using the summary-card recipe, with refunded amounts in danger ink as in 8.9.
- Sticky primary action, disabled until the input is valid.
- Danger tone for refund amounts and destructive confirmation; success tone only after the server confirms.

Server authority: purchased, already-returned, and remaining-returnable
quantities, refund eligibility, allowed refund modes, the refund quote, refund
allocations, and the accounting outcome are all server-owned. Android bounds the
input against the server's remaining quantity and refuses a stale quote; it never
computes a refund. `RETURN_LIMIT_EXCEEDED` re-reads the server rows rather than
arguing with them. The return mutation is durable and idempotent, so this screen
must survive process death and resume through the recovery path.

### 8.12 Closing

Captures: `screenshots/compact/22-closing.png`,
`screenshots/compact/23-closing-summary.png`,
`screenshots/compact/24-confirm-closing.png`,
`screenshots/compact/25-shift-closed.png`,
`screenshots/expanded/13-closing-two-up.png`,
`screenshots/expanded/14-confirm-closing-4-columns.png`,
`screenshots/expanded/15-shift-closed.png`.

`ClosingScreen` title: `Saldo Penutupan`.

Content:

1. Brand banner `Hitung setiap metode pembayaran`, body `Periksa selisihnya sebelum menutup shift.`.
2. `Detail Sesi` card with POS profile, cashier, opening reference, outlet.
3. One counting card per server payment mode. With two modes, cards use `PosTwoUp`; the count follows the data.
4. `Ringkasan Shift` totals card.

Each counting card shows the mode, opening, expected, and a numeric counted field.

Counting values are server-owned: expected amounts come from the closing preview,
the counted field is cashier input validated against the server's counted-amount
policy, and the closing is submitted against the preview's identity. Android never
subtracts expected from counted to produce authority.

Difference badge presentation — the visual contract, applied wherever the server
returns a difference:

- Zero: success badge `Seimbang` with check icon.
- Negative: danger badge `Kurang Rp X` with warning icon.
- Positive: danger badge `Lebih Rp X` with warning icon.
- Total difference is rendered with a signed amount plus check/warning icon.

The current preview contract returns no per-mode or total difference, so the
pre-submit counting and confirmation screens show expected and counted values
**without** a verdict badge. The badges render only once the closing submit or
status response carries the server's own per-mode difference and difference total.
Pre-submit badges are backend work; do not subtract locally to fill the gap. The
prototype's `Selisih` figures in the captures are fixture values.

Sticky action: `Tinjau Penutupan`.

`ConfirmClosingScreen` title: `Konfirmasi Penutupan`.

- Warning banner `Peringatan penutupan`.
- Body `Ini menutup sesi saat ini. Penjualan baru tidak dapat ditambahkan setelahnya.`.
- Two-up cards `Detail Sesi` and `Terkumpul`.
- `Rincian Pembayaran` table.
- `Total Penutupan` card.
- Sticky `Konfirmasi & Tutup Shift` with lock icon.

Breakdown table columns are `Metode`, `Perkiraan`, `Terhitung`, `Selisih` when
the card width is at least 420dp. Below 420dp, drop `Perkiraan` and retain the
three legible columns. Measure the card, not the window; a two-up half can be
narrow even on a non-compact window. The `Selisih` column follows the same
server-difference condition as the badges above.

Both width states are captured: the three-column fallback in
`screenshots/compact/24-confirm-closing.png` and the full four columns in
`screenshots/expanded/14-confirm-closing-4-columns.png`.

`ShiftClosedScreen` title: `Shift Ditutup`.

- Centered 72dp success check icon.
- `Shift berhasil dikirim`, reference ID, `Terkirim` badge.
- Two-up `Detail Struk` and payment breakdown.
- Success or danger callout follows the server's total difference; never show green with a nonzero difference.
- Timestamp.
- Sticky `Selesai`.

Prototype data example: the closed-shift fixture was balanced, so the rendered
callout is `Shift seimbang` with body `Laporan sistem otomatis`. Production shows
the server's reference, totals, timestamp, and difference.

Production closing states this screen set must accommodate, all owned by existing
production logic and not by this document:

- a submit accepted immediately versus a queued consolidation that is polled with bounded backoff;
- a stale preview, whose only correct action is reloading the preview before any resubmit;
- an unresolved closing adopted through the server's own recovery path, never by submitting a second closing;
- a manager hold or incident state, where every capability is withheld and the cashier needs an explicit "manager action required" message rather than a generic unavailable state;
- a receipt shown only after the terminal server response is durably persisted.

Render these as real states using the documented banner, empty-state, and callout
recipes. A closing receipt must never be shown optimistically.

## 9. Domain and Interaction Contract

### 9.0 Money and business authority in production

This section is the boundary that governs everything in 9.1 to 9.4. The
formatting rules are a visual contract. The calculations and fixtures are
prototype reference material.

For production Android, the gateway and ERPNext response is authoritative for:

- item price and rate;
- discounts and pricing rules;
- taxes;
- UOM conversion;
- stock, batch, and serial validation;
- cart subtotal, payable, and grand total;
- payment settlement and payment validation;
- change amount;
- return eligibility, remaining-returnable quantity, refund amount, and refund allocations;
- closing expected values, per-mode difference, difference total, and the closing outcome;
- session and closing lifecycle state, and capability gating.

Android may derive presentation-only values when it is safe — formatting,
grouping, sign display, a summary of the cashier's own entered input, an
input-validity check against a server-supplied policy — but it must never
override, pre-empt, or substitute for the authoritative server result. Money is
carried as the server's decimal strings across the API boundary; do not re-derive
an amount the server already sent, and never persist a locally computed
authoritative total.

Where this document shows a formula or a number, it is a
**PROTOTYPE / VISUAL FIXTURE CALCULATION**: it explains what the captures render
and nothing more.

### 9.1 Money formatting

Rupiah presentation is a visual contract and unchanged. The prototype expressed it
as these functions over `Long`:

- `formatRupiah(12000L)` -> `Rp 12.000`.
- `formatGrouped(200000L)` -> `200.000`; zero becomes empty string for editable fields.
- `formatSignedRupiah(5000L)` -> `+Rp 5.000`.
- `formatSignedRupiah(-5000L)` -> `−Rp 5.000` using U+2212.
- `digitsOnly(raw)` keeps digits, caps input at 12 digits, and returns `Long`.

Keep the rendered output exactly: `Rp ` prefix, `.` thousands grouping, U+2212 for
a negative sign, empty rather than `0` in an editable field. Route it through the
production formatting seam over the server's decimal amounts rather than
reintroducing a `Long`-only money type; a server amount must never be narrowed in
a way that loses scale. Do not concatenate currency strings manually in UI code.

### 9.2 Cart calculation

**PROTOTYPE / VISUAL FIXTURE CALCULATION — never production business authority.**
This is the pipeline the prototype used to produce the amounts in the cart,
payment, and cash-entry captures:

```text
subtotal = sum(product.price * quantity)
promoDiscount = round(subtotal * promo.percent / 100)
afterPromo = max(0, subtotal - promoDiscount)
couponValue:
  blank code -> 0
  ROPI10K -> 10000
  any other non-empty code -> 5000
couponApplied = min(max(0, couponValue), afterPromo)
taxable = max(0, afterPromo - couponApplied)
tax = round(taxable * 10 / 100)
total = taxable + tax
```

The coupon clamp was load-bearing in the prototype: without it a large coupon made
the taxable amount and tax negative.

In production every line of the above is server-owned per 9.0. The fixed 10% tax
in particular is a prototype constant standing in for an absent tax template — not
a rate Android may assume, apply, or label as fact. Do not port this pipeline, and
do not keep a reduced version of it "just for preview".

Default-state check:

Default-state check, showing what the cart captures render:

```text
Roti Manis x1 = Rp 12.000 subtotal
Weekend promo = Rp 1.200 discount
Taxable = Rp 10.800
Tax = Rp 1.080
Total = Rp 11.880
```

### 9.3 Mutation rules

**PROTOTYPE REFERENCE ARCHITECTURE.** These were the mutations on the single
prototype snapshot. They are kept because they name the interactions each screen
must still offer, and because they show which interactions are pure UI intent.

- `selectCategory` stores selected category.
- `setSearchQuery` stores raw query; product matching ignores case.
- `addProduct` adds a line at quantity 1 or increments existing quantity.
- `changeQuantity` applies delta; quantity at or below zero removes the line.
- `removeLine` deletes the line.
- `selectCustomer` replaces customer.
- `selectPromo` replaces promo.
- `applyCoupon` trims and uppercases the code.
- `clearCoupon` clears it.
- `selectPaymentMethod` replaces method.
- `setCashExact` sets received cash to current live total.
- `setCash` replaces received cash.
- `appendCashDigits` appends keypad digits to current raw amount.
- `backspaceCash` removes one raw digit, never below zero.
- `selectHistoryFilter` replaces history filter.
- `selectTransaction` stores transaction ID.
- `setCounted` changes counted amount for the matching closing method.
- `resetSession` replaces state with default `PosUiState`.

Do not recreate these as methods on a single POS state holder. In production:

- catalog search and category selection are server queries with debounce and cancellation, not local list filtering;
- cart edits invalidate the authoritative quote instead of adjusting a local total;
- `setCashExact` and the promo/coupon mutations belong to capabilities that are deferred or absent (8.4, 8.5, 8.8);
- history filtering is a server status filter with pagination;
- `setCounted` is validated against the server's counted-amount policy;
- `resetSession` is not a local state reset — ending a session is a server-side closing plus the production logout path, which is blocked while an unresolved mutation exists.

### 9.4 Fixtures

**PROTOTYPE / VISUAL FIXTURE DATA — reference only.** These tables are what the
captures show. They are retained so a reader can match a number in a screenshot to
its source, and for nothing else. Production data comes from the gateway. Do not
reintroduce `SampleData` or any equivalent shipped fixture; `ReleaseFixtureExclusionTest`
guards against a demo-data seam reappearing in shipped sources.

#### Products

| ID | Name | Initials | Unit | Category | Price | Stock | Low stock | Tone |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |
| `roti-manis` | Roti Manis | RM | 1 unit | Roti | 12.000 | 42 | no | Bread |
| `croissant-butter` | Croissant Butter | CB | 1 unit | Pastry | 18.500 | 18 | no | Pastry |
| `choco-bun` | Choco Bun | CH | 1 unit | Roti | 15.000 | 5 | yes | Bread |
| `pound-cake` | Pound Cake Slice | PC | 1 potong | Kue | 22.000 | 1 | yes | Cake |
| `americano` | Americano | AM | 1 cup | Minuman | 25.000 | 28 | no | Beverage |
| `choco-croissant` | Chocolate Croissant | CC | 1 unit | Pastry | 35.000 | 15 | no | Pastry |

The `Low stock` column is a fixture flag with no backend counterpart (8.4).

#### Session

| Field | Value |
| --- | --- |
| Cashier | Siti Rahma |
| POS profile | Main Counter 01 |
| Outlet | Roti Ropi Bakery |
| Currency | IDR |
| Opening reference | REF-8492-A |
| Duration | 02:45:12 |

#### Customers and promotions

Customers:

- `Pelanggan Umum` / `Profil default`.
- `Ahmad Rizky` / `08123456789`.
- `Maria Rodriguez` / `08987654321`.

Promos:

- `Weekend` / `Promo Akhir Pekan 10%` / 10%.
- `Member` / `Diskon Member 5%` / 5%.
- `None` / `Tanpa Promo` / 0%.

#### Transactions

| ID | Time | Date | Status | Method | Line items |
| --- | --- | --- | --- | --- | --- |
| `#TRX-9402` | 14:20 | 24 Okt 2026 | Berhasil | QRIS | Roti Manis x2, Croissant x3 |
| `#TRX-9401` | 13:45 | 24 Okt 2026 | Berhasil | Debit/Kredit | Americano x1 |
| `#TRX-9400` | 12:15 | 24 Okt 2026 | Dikembalikan | Tunai | Artisan Sourdough Loaf x1, Chocolate Croissant x2, Mixed Fruit Tart x1 |
| `#TRX-9399` | 11:30 | 24 Okt 2026 | Draf | Tunai | Roti Manis x1, Croissant x2, Americano (Iced) x1 |

Transaction amount, item count, subtotal, and tax were derived from the fixture
receipt lines rather than stored as independent literals. In production all of
them are read from the server's sale payload. Transaction identities of the
`#TRX-####` shape are prototype fixtures; production shows real ERPNext document
names.

#### Closing fixtures

Prototype open-shift rows:

| Method | Opening | Expected | Counted | Difference |
| --- | ---: | ---: | ---: | ---: |
| Tunai | 200.000 | 865.000 | 860.000 | -5.000 |
| QRIS | 0 | 350.000 | 350.000 | 0 |

Prototype closed-shift fixture:

- Reference: `RR-20231027-04`.
- Cashier: `Ahmad S.`.
- POS profile: `Main Counter`.
- Opening reference: `OB-99210`.
- Invoice count: 142.
- Grand total: `Rp 4.250.000`.
- Timestamp: `27 Okt 2023 · 22:15:42`.
- Closed rows: Tunai `Rp 1.250.000`, QRIS `Rp 3.000.000`, both balanced.

Expected amounts and the `Difference` column above are fixture arithmetic. In
production both are server-owned, and the difference is only shown once the server
returns it (section 8.12).

## 10. Accessibility and Semantics

Fully authoritative. Accessibility is never simplified away to match a visual or
to fit a smaller diff.

- Every interactive icon-only control has a meaningful content description, such as `Kembali`, `Tutup`, `Ubah pelanggan`, `Kurangi jumlah`, `Tambah jumlah`, `Hapus satu angka`, or `Cetak struk`.
- Decorative icons may use no content description and must not become the only status signal.
- Selected products, categories, customers, payment modes, and refund modes use check, radio, selected semantics, or a selected border in addition to color.
- History filters use tab role and selectable group semantics.
- Payment and customer choices use radio-button semantics.
- Status badges pair color with status text and an icon.
- Difference states say `Seimbang`, `Kurang`, or `Lebih` and use check/warning icons; sign alone is insufficient. This applies wherever a server-returned difference is rendered.
- Touch targets for icon controls and primary controls are at least 48dp, except the documented compact 36dp text-link action.
- Numeric money fields request numeric keyboard input.
- Pending and verifying content uses a polite live region.
- Text never drops below 12sp.
- Directional icons use AutoMirrored variants.
- Icons are proper vector assets. Never use emoji as an icon.
- Do not make success, danger, or selected meaning depend on color alone.
- Content descriptions and every other user-facing string live in `res/values/strings.xml` with the `values-en` translation, so accessibility text is localized too.

## 11. Agent Rebuild Checklist

Before coding:

- Read this document for the visual and UX contract.
- Read `apps/roti_ropi_pos/docs/mobile-pos/android-integration-guide.md` for endpoints, fields, error codes, and the server/client authority split.
- Read `AGENTS.md`, `CLAUDE.md`, and `PROJECT_STATE.md`; `PROJECT_STATE.md` is the project-state authority.
- Inspect the current production implementation of the exact flow being changed — ViewModel, repository call, recovery spec, tests — before writing UI.
- Identify the protected business and recovery behaviour that must survive: idempotency, exact replay, terminal-only retirement, polling ladders, capability gating, logout blocking, process-death paths. `docs/android-gateway-compatibility-audit.md` §7 lists the KEEP and KEEP-BUT-PROTECT set.
- Confirm which capabilities the backend actually provides for the screen, and treat an absent one as absent UI rather than an inert control.
- Copy token values exactly.
- Copy Indonesian labels exactly, through string resources.
- Use the measured window (width and height) for every adaptive decision.
- Decide which screens are task screens and which are top-level screens.
- Use `screenshots/` as the visual reference, remembering it is prototype-era evidence, not a behaviour spec.

While coding:

- Preserve current API, domain, and recovery semantics exactly; wrap them in new visuals rather than reaching around them.
- Do not invent a backend field, endpoint, capability, or error code.
- Do not recreate ERPNext business logic locally — no local pricing, discount, tax, settlement, refund, or closing-difference arithmetic.
- Use the design tokens: colors, typography, spacing, radii, and dimensions.
- Use the shared layout and component recipes instead of one-off forks.
- Format money through the production formatting seam; keep the documented rupiah output.
- Keep the sticky footer a sibling of the scroll body.
- Avoid duplicated app bars and insets.
- Preserve adaptive behaviour across compact, medium, expanded, and short windows, with no device-type flag.
- Preserve accessibility semantics, touch targets, and existing `testTag` values.

Before completion:

- Visual parity checked against the relevant `screenshots/` captures for hierarchy, order, tokens, copy, and responsive branch, with any difference explained by real server data, an absent backend capability, a production-only state, accessibility, localization, or dark mode.
- Compact, medium, expanded, and short-window branches all verified; no screen uses a device-type flag.
- Sign-in reaches profile selection and opening, and opening reconciles the authoritative current session.
- Opening renders one field per server payment mode and the total updates.
- Confirmation can return to edit.
- Cashier search, category filter, add, stepper, and remove all update visible state through the production flows; empty cart disables checkout.
- Payment mode selection changes selected semantics; the due card shows the server payable.
- Payment submission remains blocked until production validation passes, and the entered legs are validated against the server's policy.
- Return is reachable where the capability and returnability permit, and blocked where they do not.
- History filters drive the server status filter and affect both the list and the pane fallback.
- Closing renders expected and counted per server mode; a difference verdict appears only from a server-returned difference; the receipt appears only after the terminal response is persisted.
- Recovery, manual-recovery, and manager-hold states are reachable and legible.
- Current functional tests remain green: the full unit suite, lint, and assemble, plus the device runs when a device is available.
- Sale, return, and closing semantics are unchanged unless the task explicitly changes them: idempotency key minting, exact replay, terminal-only retirement, polling ladder, logout blocking, and process-death behaviour all still hold.
- No prototype fixture or prototype business authority leaked into production: no `SampleData` or equivalent, no local tax rate, no local settlement or difference arithmetic, no simulated completion action.

## 12. Verification Contract

The project build requires the Android Studio JBR because a newer system JDK is
not accepted by the configured AGP. `CLAUDE.md` holds the current command set and
is authoritative for it; the commands here are the visual-work subset.

```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew :app:assembleDebug :app:testDebugUnitTest
./gradlew :app:lintDebug
```

**Prototype-era verification, retained as history.** The statements that this
project has no instrumentation tests, and that its unit coverage is cart math,
single-ViewModel mutations, transaction derived values, and window predicates,
described the prototype. They are not the current position: production carries a
substantially larger unit and instrumentation suite, including recovery and
process-death harnesses and device runs at API 23 and a current target API. Read
`PROJECT_STATE.md` for the verified counts and results, and `CLAUDE.md` for how to
run them; no test count is asserted here.

Screenshot captures remain visual evidence. There is **no** automated screenshot
or golden-image suite, so visual parity is a manual comparison against
`screenshots/`. Do not claim automated visual parity, and do not describe a manual
comparison as a passing test.

Manual visual pass recorded against the prototype captures:

- Compact (411 x 923dp): every documented screen renders without clipping or overlap; sticky footers never cover the last scroll row.
- Expanded (1280 x 800dp): side rail, permanent cart pane, history detail pane, three-column payment grid, two-pane cash entry, and dialog pickers all render as specified in section 6.2.
- Short landscape (923 x 411dp): behaves as documented in section 6.3, including its listed ceilings.

## 13. Intentional Gaps and Known Ceilings

Two different kinds of entry live here. Neither is an invitation to add an
abstraction before a concrete requirement exists.

### 13.1 Visual and layout ceilings — still current

- Compact cash entry intentionally stacks and scrolls; only a bounded tall/wide window receives the two-pane keypad layout.
- Short landscape task screens require multiple scroll gestures and a card can end flush against the footer divider. Accepted: about 300dp of body height cannot hold a full task screen.
- The prototype applied the permanent cart pane on `hasSideRail` rather than `hasSidePane`, so a short landscape window shows a vertically compressed cart pane (section 6.3). The documented fix is to extend `hasSidePane` to the cashier cart.
- The payment confirmation dialog drops its detail rows on a short landscape window (section 6.3). Of the short landscape ceilings this is the one that hides information; fix it before the others if this window becomes a target, by giving the dialog a scrollable height-bounded content slot.
- `PosLinkButton` is a compact 36dp text action; new interactive icon controls still require 48dp.
- Light mode is the visual parity reference because the captures contain no dark reference; dark mode is verified separately for contrast and equivalent hierarchy.

### 13.2 Capability gaps — absent, not inert

These are absent from shipped UI because no bootstrap capability and/or versioned
endpoint exists. Each returns as designed once the backend provides it. Do not
ship a fake, inert, or empty control for any of them:

- promotions and coupons, including the `Penawaran` card and the discount rows (8.4, 8.5);
- low-stock warning treatment (8.4);
- pre-submit `Sisa`, `Kembalian`, and quick-amount buttons on cash entry (8.8);
- draft resumption (8.9);
- printing and reprinting (8.9);
- a server-side history date-range filter (8.9);
- creating a Customer (8.5) — prohibited by project rules, not merely missing;
- a cashier-facing server origin switch (8.1);
- sale cancellation — the capability is permanently false server-side, so no cancel action is rendered;
- pre-submit closing difference verdicts (8.12);
- server-side token revocation on logout, which remains a manager ERPNext Desk operation.

### 13.3 Withdrawn prototype gaps

These entries described the prototype and are **no longer** current limitations:

- "No ERPNext backend exists" — production integrates the Mobile POS v1 gateway.
- "`SampleData` is plain in-memory data" — deleted; a demo-data seam is guarded against.
- "Tax is a fixed 10% constant" — taxes are server-authoritative.
- "Split payment allocation is derived and not editable" — multi-leg payment is real, with editable allocations under the server's policy (8.7).
- "`Mulai Pengembalian` is inert" — return is a full production capability (8.9, 8.11).
- "Checking screens simulate completion through `Pratinjau berhasil`" — pending states resolve from the server only (8.3).
- "Settings rows are inert" — theme, accent, and language are functional (8.10).
- "No dark mode exists" — a dark role palette ships.

## 14. Source Map

**PROTOTYPE REFERENCE.** This table maps each design responsibility to the
prototype file that implemented it, so a token, recipe, or layout rule can be
traced to its origin. These files and the `com.rotiropi.pos.prototype` package are
gone. Do not recreate them or treat this as the production structure; for the
actual production composition and the KEEP / PROTECT / REFACTOR classification,
read `docs/android-gateway-compatibility-audit.md` §2 and §7.

| Prototype file | Design responsibility |
| --- | --- |
| `app/src/main/java/com/rotiropi/pos/prototype/MainActivity.kt` | Edge-to-edge root measurement and composition local |
| `app/src/main/java/com/rotiropi/pos/prototype/PosViewModel.kt` | `PosUiState`, derived values, mutations |
| `app/src/main/java/com/rotiropi/pos/prototype/domain/Money.kt` | Rupiah formatting/parsing |
| `app/src/main/java/com/rotiropi/pos/prototype/domain/Cart.kt` | Cart models, payment methods, promo and calculation pipeline |
| `app/src/main/java/com/rotiropi/pos/prototype/domain/SampleData.kt` | All fixture data and derived transaction models |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/PosWindow.kt` | Width/height predicates |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/Routes.kt` | Route strings and top-level destinations |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/PosApp.kt` | NavHost and top-level shell |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/theme/Color.kt` | Color tokens and tones |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/theme/Type.kt` | Typography tokens |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/theme/Theme.kt` | Spacing, radii, dimensions, Material theme mapping |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/components/Primitives.kt` | Reusable visual primitives |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/components/Scaffolding.kt` | Top bars, footers, brand bar, navigation |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/components/Layout.kt` | Scroll, width caps, two-up, button pair |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/screens/Onboarding.kt` | Login, opening, checking |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/screens/Cashier.kt` | Catalog, cart, offers, pickers |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/screens/Payment.kt` | Payment method, split payment, cash entry |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/screens/History.kt` | History list, pane, transaction detail |
| `app/src/main/java/com/rotiropi/pos/prototype/ui/screens/Closing.kt` | More, closing, confirmation, shift closed |

## 15. Document Boundary

`DESIGN.md` is the single UI/UX visual authority for this repository. Do not
create a parallel design document — `DESIGN_V2.md`, `NEW_DESIGN.md`,
`ui_design.md`, `redesign.md` — to hold a competing version of this content.
Amend this file instead, in place, and keep the visual detail.

Companion authorities, none of which this file overrides:

| Document | Authoritative for |
| --- | --- |
| `PROJECT_STATE.md` | Current project state, phase, and verification results |
| `AGENTS.md` | Repository rules: security, API boundary, change control, testing, Android stack |
| `CLAUDE.md` | Working instructions and the current command set |
| `apps/roti_ropi_pos/docs/mobile-pos/android-integration-guide.md` | Mobile POS gateway integration: endpoints, fields, errors, authority split |
| `apps/roti_ropi_pos/docs/mobile-pos/api-contract.md` | Normative v1 envelope and per-endpoint schema |
| `docs/android-gateway-compatibility-audit.md` | Recorded Android↔gateway compatibility position and code classification |
| `docs/superpowers/specs/` and `docs/superpowers/plans/` | The approved redesign spec and its task plan |

This file originally completed approach 1: a self-contained visual, UX, and
responsive contract for the prototype. Approach 2, screenshot-first verification,
added the visual evidence in `screenshots/`. Neither approach may silently change
the tokens, breakpoints, or behaviour documented here, and no visual change may be
made by editing this document alone — update implementation and documentation
together, with approval.
