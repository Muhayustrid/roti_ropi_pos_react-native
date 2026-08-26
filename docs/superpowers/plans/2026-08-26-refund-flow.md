# Refund Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan workflow pengembalian penuh dan sebagian dari detail transaksi, memperbarui transaksi dan stok secara lokal, lalu memverifikasinya pada Android API 36.

**Architecture:** Route modal `/refund/[id]` merender satu `RefundFlowScreen` dengan reducer lokal untuk seluruh step. `PosContext` tetap menjadi satu sumber state transaksi dan produk; hanya action `COMPLETE_REFUND` yang memutasi global state setelah checking selesai. Presentasi memakai `PaymentFlowShell` canonical dengan label flow opsional agar gesture dan responsive behavior tidak diduplikasi.

**Tech Stack:** Expo SDK 57, Expo Router, React Native 0.86.2, React 19.2.3, strict TypeScript, Jest/ts-jest.

**Spec:** `docs/superpowers/specs/2026-08-26-refund-flow-design.md`

## Global Constraints

- Phase 1 local/mock-only; jangan menambah backend, ERP, printer, atau payment gateway.
- Jangan menambah dependency baru.
- Pertahankan compact phone, short landscape, dan expanded tablet.
- Gunakan `PosContext` sebagai sumber state canonical.
- Gunakan `PaymentFlowShell` canonical; jangan duplikasi bottom-sheet gesture.
- Minimum touch target 48dp dan accessibility label wajib.
- Jangan overwrite perubahan uncommitted existing.
- Jangan commit atau push tanpa permintaan eksplisit user.

---

### Task 1: Model refund dan reducer global

**Files:**
- Modify: `src/types.ts:45-69`
- Modify: `src/state/PosContext.tsx:1-365`
- Test: `src/__tests__/reducer.test.ts:1-170`

**Interfaces:**
- Produces: `RefundLine`, status `Dikembalikan Sebagian`, `CompleteRefundPayload`, `PosActions.completeRefund(payload)`.
- Produces: `PosState.products`, stok mutable canonical, field refund akumulatif pada `Transaction`.

- [ ] **Step 1: Tulis failing reducer tests**

Tambahkan tests dengan payload transaksi `#TRX-9402`:

```ts
const partial = posReducer(initialPosState, {
  type: 'COMPLETE_REFUND',
  payload: {
    transactionId: '#TRX-9402',
    lines: [{ lineIndex: 0, quantity: 1 }],
    reason: 'Salah pesanan',
    method: 'Pengembalian QRIS',
  },
});

expect(partial.transactions.find((t) => t.id === '#TRX-9402')).toMatchObject({
  status: 'Dikembalikan Sebagian',
  refundedSubtotal: 12000,
  refundedTax: 1200,
  refundedTotal: 13200,
  refundReason: 'Salah pesanan',
  refundMethod: 'Pengembalian QRIS',
});
expect(partial.products.find((p) => p.name === 'Roti Manis')?.stock).toBe(43);
```

Tambahkan test refund kedua yang memilih seluruh sisa baris dan memastikan status menjadi `Dikembalikan`, total tidak melebihi transaksi, stok bertambah sekali, lalu dispatch ulang menjadi no-op. Tambahkan test nama produk tidak ditemukan: transaksi tetap berubah, products tidak berubah.

Tambahkan test derived filter:

```ts
const refunded = computePosDerived({ ...partial, historyFilter: 'Refunded' });
expect(refunded.visibleTransactions.map((t) => t.id)).toContain('#TRX-9402');
```

- [ ] **Step 2: Jalankan test dan pastikan RED**

Run:

```bash
npm test -- src/__tests__/reducer.test.ts --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: FAIL karena `COMPLETE_REFUND`, `products`, dan status parsial belum ada.

- [ ] **Step 3: Implementasi model dan reducer minimum**

Di `src/types.ts`:

```ts
export type TransactionStatus =
  | 'Berhasil'
  | 'Dikembalikan Sebagian'
  | 'Dikembalikan'
  | 'Draf';

export interface RefundLine extends TransactionLine {}
```

Tambahkan field refund sesuai spec. Di `PosContext`, tambahkan `products: sampleProducts` pada initial state dan action payload:

```ts
export interface CompleteRefundPayload {
  transactionId: string;
  lines: Array<{ lineIndex: number; quantity: number }>;
  reason: string;
  method: string;
}
```

Implementasikan reducer `COMPLETE_REFUND` dengan helper pure internal yang:

- hanya menerima status `Berhasil`/`Dikembalikan Sebagian`;
- mengurangi already-refunded quantity berdasarkan line index;
- clamp quantity;
- menghitung pajak proporsional dengan `Math.round`;
- mengakumulasi field refund;
- menentukan status penuh/sebagian;
- menambah stok berdasarkan exact `product.name === line.productName`;
- mengembalikan state sama bila tidak ada selection valid.

Ubah `computePosDerived` memakai `state.products` dan filter refunded mencakup dua status. Tambahkan action creator `completeRefund`.

- [ ] **Step 4: Jalankan test dan pastikan GREEN**

Run command Step 2. Expected: semua test reducer lulus.

---

### Task 2: Generalisasi label shell dan route refund

**Files:**
- Modify: `src/components/PaymentFlowShell.tsx:37-191`
- Modify: `app/_layout.tsx:1-21`
- Modify: `app/transaction/[id].tsx:9-31`
- Create: `app/refund/[id].tsx`
- Test: `src/__tests__/routing.test.ts:1-38`
- Test: `src/__tests__/payment-flow.test.tsx:59-94`

**Interfaces:**
- Consumes: `RefundFlowScreen` placeholder interface from Task 3: `{ transaction, onClose }`.
- Produces: `PaymentFlowShellProps.flowLabel?: string`, default `pembayaran`.

- [ ] **Step 1: Tulis failing routing/source tests**

Assertions:

```ts
expect(layoutSource).toContain('name="refund/[id]"');
expect(layoutSource).toContain("presentation: 'transparentModal'");
expect(detailRouteSource).toContain("router.push(`/refund/${encodeURIComponent(transaction.id)}`)");
expect(refundRouteSource).toContain('<RefundFlowScreen');
expect(shellSource).toContain("flowLabel = 'pembayaran'");
expect(shellSource).toContain('Tutup ${flowLabel}');
```

- [ ] **Step 2: Jalankan tests dan pastikan RED**

```bash
npm test -- src/__tests__/routing.test.ts src/__tests__/payment-flow.test.tsx --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: FAIL karena route dan prop belum ada.

- [ ] **Step 3: Implementasi shell dan wiring route**

Tambahkan `flowLabel?: string` ke shell, default `pembayaran`, lalu gunakan untuk tiga accessibility labels. Jangan ubah snap/presentation logic.

Daftarkan `refund/[id]` di stack memakai options sama dengan payment. Ubah callback detail ke route refund. Route refund mencari exact transaction ID tanpa fallback dan merender `RefundFlowScreen` atau empty error state dengan `PosTopBar` back.

- [ ] **Step 4: Jalankan tests dan pastikan GREEN**

Run command Step 2.

---

### Task 3: Pure refund flow reducer dan calculations

**Files:**
- Create: `src/features/refund/refundFlow.ts`
- Create: `src/__tests__/refund-flow.test.ts`

**Interfaces:**
- Consumes: `Transaction`.
- Produces: `RefundFlowStep`, `RefundReasonCode`, `RefundFlowState`, `createInitialRefundFlowState(transaction)`, `refundFlowReducer`, `getRemainingQuantity`, `calculateRefundSummary`, `resolveRefundReason`, `defaultRefundMethod`.

- [ ] **Step 1: Tulis failing pure tests**

Cover:

```ts
expect(defaultRefundMethod('QRIS')).toBe('Pengembalian QRIS');
expect(defaultRefundMethod('Tunai')).toBe('Pengembalian Tunai');
expect(resolveRefundReason('Other', '  Kemasan rusak  ')).toBe('Kemasan rusak');
expect(resolveRefundReason('Other', '   ')).toBeNull();
```

Reducer tests cover push/back/replace, `SELECT_ALL_REMAINING`, quantity clamp, reason/note, method. Summary test memilih satu Roti Manis dari `#TRX-9402` dan expects `{ subtotal: 12000, tax: 1200, total: 13200, quantity: 1 }`.

- [ ] **Step 2: Jalankan test dan pastikan RED**

```bash
npm test -- src/__tests__/refund-flow.test.ts --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: FAIL module belum ada.

- [ ] **Step 3: Implementasi pure module minimum**

Gunakan reducer lokal tanpa React dependency. Reason codes:

```ts
export type RefundReasonCode =
  | 'WrongOrder'
  | 'DamagedProduct'
  | 'CustomerChangedMind'
  | 'Other';
```

Quantities keyed by line index string dalam object. `calculateRefundSummary` menghitung tax proporsional dan mengembalikan selected lines untuk dispatch.

- [ ] **Step 4: Jalankan test dan pastikan GREEN**

Run command Step 2.

---

### Task 4: UI seluruh refund flow

**Files:**
- Create: `src/features/refund/RefundFlowScreen.tsx`
- Create: `src/features/refund/RefundItemSelection.tsx`
- Create: `src/features/refund/RefundReasonScreen.tsx`
- Create: `src/features/refund/RefundMethodScreen.tsx`
- Create: `src/features/refund/RefundConfirmationScreen.tsx`
- Create: `src/features/refund/RefundSuccessScreen.tsx`
- Modify: `src/features/opening/CheckingScreen.tsx` only if its `type` union rejects `refund`
- Test: `src/__tests__/refund-flow.test.ts`
- Test: `src/__tests__/history-closing.test.tsx`

**Interfaces:**
- Consumes: pure APIs Task 3, `PaymentFlowShell`, `CheckingScreen`, `PosActions.completeRefund`.
- Produces: `RefundFlowScreenProps { transaction: Transaction; onClose: () => void; width?: number; height?: number }`.

- [ ] **Step 1: Tambahkan failing composition/source tests**

Assert flow source contains all step components, `flowLabel="pengembalian"`, `type="refund"`, completeRefund hanya di checking completion, dan success close. Assert reason `Other` requires trimmed note and item continue requires selected quantity.

- [ ] **Step 2: Jalankan tests dan pastikan RED**

```bash
npm test -- src/__tests__/refund-flow.test.ts src/__tests__/history-closing.test.tsx --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

- [ ] **Step 3: Implementasi step UI**

Gunakan existing `PosCard`, `PosButton`, `PosIcon`, `SpreadRow`, tokens, `ScrollView`, `Pressable`, dan `TextInput`. Jangan tambah component abstraction selain file step yang punya satu tanggung jawab.

Titles:

```ts
items: 'Pilih Item Pengembalian'
reason: 'Alasan Pengembalian'
method: 'Metode Pengembalian'
confirmation: 'Konfirmasi Pengembalian'
checking: 'Memproses Pengembalian'
success: 'Pengembalian Berhasil'
```

Semua tombol/controls minimum 48dp. `handleCompleteChecking` menghitung summary terbaru, dispatch `actions.completeRefund`, lalu replace success. Dismiss sebelum itu tidak mutasi state.

- [ ] **Step 4: Jalankan tests dan pastikan GREEN**

Run command Step 2.

---

### Task 5: History/detail mendukung refund parsial

**Files:**
- Modify: `src/features/history/HistoryScreen.tsx:27-95`
- Modify: `src/features/history/TransactionDetail.tsx:34-195`
- Test: `src/__tests__/history-closing.test.tsx`

**Interfaces:**
- Consumes: status dan refund fields Task 1.
- Produces: partial status row/detail, remaining refund action.

- [ ] **Step 1: Tulis failing tests**

Tambah source/instantiation assertions:

```ts
expect(historySource).toContain("item.status === 'Dikembalikan Sebagian'");
expect(detailSource).toContain("transaction.status === 'Dikembalikan Sebagian'");
expect(detailSource).toContain('refundedTotal');
```

Render/instantiate partial transaction dan pastikan component terbentuk dengan `onRefund` dan `onPrint`.

- [ ] **Step 2: Jalankan test dan pastikan RED**

```bash
npm test -- src/__tests__/history-closing.test.tsx --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

- [ ] **Step 3: Implementasi partial UI minimum**

History filter refunded mencakup full dan partial dari derived state. History row memakai danger badge dan refund method untuk keduanya. Detail menampilkan refund card untuk keduanya, total refund akumulatif, refunded lines, dan tombol mulai refund hanya untuk `Berhasil` atau partial dengan quantity tersisa. Full refund tidak menampilkan action.

- [ ] **Step 4: Jalankan test dan pastikan GREEN**

Run command Step 2.

---

### Task 6: Verifikasi lengkap dan API 36

**Files:**
- Verify all changed files.

- [ ] **Step 1: Jalankan static dan full automated checks**

```bash
npm test -- --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
npx tsc --noEmit
npx eslint app/_layout.tsx 'app/refund/[id].tsx' 'app/transaction/[id].tsx' src/components/PaymentFlowShell.tsx src/features/refund src/features/history/HistoryScreen.tsx src/features/history/TransactionDetail.tsx src/state/PosContext.tsx src/types.ts src/__tests__/refund-flow.test.ts src/__tests__/reducer.test.ts src/__tests__/routing.test.ts src/__tests__/history-closing.test.tsx
git diff --check
```

Expected: semua exit 0.

- [ ] **Step 2: Jalankan runtime API 36**

Pastikan emulator `mobile-pos-api36`, Metro port 8081, dan `adb reverse tcp:8081 tcp:8081` aktif. Buka transaksi `#TRX-9402`, tekan `Mulai Pengembalian`.

- [ ] **Step 3: Verifikasi partial refund**

Pilih satu `Roti Manis`, alasan `Salah pesanan`, default `Pengembalian QRIS`, konfirmasi Rp13.200, proses, success. Pastikan detail berubah ke `Dikembalikan Sebagian`, print tetap ada, action refund tetap ada, history refunded memuat transaksi, dan stok Roti Manis 43.

- [ ] **Step 4: Verifikasi full remaining refund**

Buka refund lagi, pilih semua item tersisa, alasan `Lainnya` dengan note wajib, pilih `Pengembalian Tunai`, selesai. Pastikan status `Dikembalikan`, total refund kumulatif Rp87.450, action mulai refund hilang, dan stok bertambah hanya sesuai item yang dikembalikan.

- [ ] **Step 5: Verifikasi dismiss dan runtime health**

Pada transaksi lain, masuk refund lalu tap backdrop; pastikan status/stok tidak berubah. Verifikasi MainActivity foreground, Metro running, dan logcat tanpa `Unable to load script`, `Could not connect`, `FATAL EXCEPTION`, atau target `ReactNativeJS` error.

---

## Self-review

- Spec coverage: route, responsive shell, six steps, full/partial, reason validation, default/cash method, proportional tax, global mutation timing, cumulative refund, stock, partial history/detail, accessibility, API 36 all mapped to Tasks 1-6.
- Placeholder scan: no TBD/TODO/"similar to" instructions.
- Type consistency: `CompleteRefundPayload`, refund statuses, field names, and `RefundFlowScreenProps` consistent across tasks.
- Deliberate deviation from generic plan template: no commit steps because user did not request commit and global constraints forbid it.
