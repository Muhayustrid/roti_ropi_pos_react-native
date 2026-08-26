# Refund Flow Design

**Date:** 2026-08-26

## Goal

Saat kasir menekan **Mulai Pengembalian** pada transaksi berhasil, aplikasi membuka workflow pengembalian yang mendukung refund penuh dan sebagian, mencatat alasan dan metode dana, mengembalikan stok, lalu memperbarui transaksi secara lokal.

## Scope

- Phase 1 local/mock-only.
- Tidak ada backend, ERP, printer, payment gateway, atau dependency baru.
- Hanya transaksi berstatus `Berhasil` atau `Dikembalikan Sebagian` yang dapat memulai refund.
- Transaksi `Dikembalikan` dan `Draf` tidak dapat memulai refund.
- Refund penuh dan sebagian didukung.
- Stok produk yang ditemukan berdasarkan nama produk dikembalikan sesuai jumlah refund.
- Baris transaksi yang tidak cocok dengan produk mock tetap dapat direfund, tetapi stok tidak diubah karena tidak ada produk target.

## Entry and route

`TransactionDetail` tetap menerima callback `onRefund`. Route `app/transaction/[id].tsx` mengubah callback itu dari `router.back()` menjadi:

```ts
router.push(`/refund/${encodeURIComponent(transaction.id)}`)
```

Route baru `app/refund/[id].tsx` mencari transaksi dari `PosContext` berdasarkan route parameter. Jika tidak ditemukan atau status tidak memenuhi syarat, route menampilkan pesan yang jelas dan tombol kembali. Route tidak boleh diam-diam memakai transaksi pertama sebagai fallback.

## Presentation

Refund memakai shell bottom sheet yang sama dengan pembayaran melalui perluasan generik minimum pada `PaymentFlowShell`:

- Compact portrait: sheet mulai 75%, dapat naik ke 100%, turun ke 75%, atau dismiss.
- Short landscape: sheet mulai 100%, dapat turun ke 75%, atau dismiss.
- Expanded `width >= 700` dan `height >= 600`: full-screen.
- Tombol kembali di kiri hanya tampil setelah step pertama.
- Tombol X berada di kanan.
- Android hardware back kembali satu step; pada step pertama menutup flow.
- Tap backdrop dan drag dismiss menutup flow tanpa perubahan transaksi.
- Copy accessibility refund memakai kata `pengembalian`, bukan `pembayaran`.

`PaymentFlowShell` memperoleh prop opsional `flowLabel` dengan default `pembayaran`. Existing payment behavior dan tests tetap berlaku tanpa perubahan consumer pembayaran.

## Data model

### Transaction status

```ts
export type TransactionStatus =
  | 'Berhasil'
  | 'Dikembalikan Sebagian'
  | 'Dikembalikan'
  | 'Draf';
```

### Refund line

```ts
export interface RefundLine {
  productName: string;
  quantity: number;
  price: number;
}
```

### Transaction refund fields

```ts
refundReason?: string;
refundMethod?: string;
refundedLines?: RefundLine[];
refundedSubtotal?: number;
refundedTax?: number;
refundedTotal?: number;
```

Nilai `subtotal`, `tax`, `total`, `itemCount`, dan `lines` tetap merepresentasikan transaksi asli. Field refund menyimpan akumulasi jumlah yang sudah dikembalikan. Ini mencegah hilangnya audit sederhana dan memungkinkan refund lanjutan pada transaksi parsial.

### Product state

Produk harus menjadi bagian `PosState` sebagai `products: Product[]`. `computePosDerived` membaca `state.products`, bukan langsung `sampleProducts`, agar stok yang dikembalikan terlihat di kasir.

## Local flow state

```ts
export type RefundFlowStep =
  | 'items'
  | 'reason'
  | 'method'
  | 'confirmation'
  | 'checking'
  | 'success';

export interface RefundFlowState {
  step: RefundFlowStep;
  history: RefundFlowStep[];
  quantities: Record<number, number>;
  reasonCode: RefundReasonCode | null;
  note: string;
  method: string;
}
```

`quantities` memakai index baris transaksi karena model saat ini tidak memiliki product ID dan nama produk dapat berulang. Kuantitas maksimum per baris adalah:

```ts
original quantity - already refunded quantity for the same line index
```

State lokal berubah selama workflow. Global `PosContext` hanya berubah setelah checking selesai.

## Steps

### 1. Pilih item

- Segmented choice: `Semua item tersisa` atau `Pilih sebagian`.
- Semua item tersisa mengisi jumlah maksimum setiap baris.
- Mode sebagian menampilkan setiap baris dengan kontrol kurang/tambah.
- Minimum 0, maksimum sisa jumlah baris.
- Tombol `Lanjutkan` disabled bila total quantity 0.
- Baris dengan sisa 0 tidak dapat ditambah.

### 2. Alasan

Pilihan:

- `Salah pesanan`
- `Produk rusak`
- `Pelanggan berubah pikiran`
- `Lainnya`

Satu alasan wajib dipilih. Bila `Lainnya`, catatan trimmed wajib terisi. Untuk pilihan lain, note opsional tidak disimpan; `refundReason` memakai label pilihan.

### 3. Metode dana

Default mengikuti metode transaksi:

- `Tunai` menjadi `Pengembalian Tunai`.
- `QRIS` menjadi `Pengembalian QRIS`.
- `Debit / Kredit` menjadi `Pengembalian Debit / Kredit`.
- Nilai metode lain menjadi `Pengembalian <metode asli>`.

Kasir dapat mengganti pilihan menjadi `Pengembalian Tunai`. Tidak ada opsi mengirim dana nyata.

### 4. Konfirmasi

Menampilkan:

- item dan jumlah yang dipilih;
- subtotal refund;
- pajak refund;
- total refund;
- alasan;
- metode dana.

Perhitungan memakai proporsi pajak transaksi asli:

```ts
refundSubtotal = sum(quantity * line.price)
refundTax = Math.round(transaction.tax * refundSubtotal / transaction.subtotal)
refundTotal = refundSubtotal + refundTax
```

Jika `transaction.subtotal` bernilai 0, `refundTax` adalah 0. Total refund akumulatif tidak boleh melebihi total transaksi.

### 5. Memproses

Memakai `CheckingScreen` dengan `type="refund"`, durasi mock 1200 ms, dan cancel kembali ke konfirmasi. Selesai memanggil satu action global `completeRefund(payload)` lalu mengganti step menjadi `success`.

### 6. Berhasil

Menampilkan status, total yang baru dikembalikan, metode, dan tombol `Kembali ke Detail`. Tombol menutup route refund sehingga detail transaksi yang sama terlihat dengan state terbaru.

## State transition

Action baru:

```ts
completeRefund(payload: {
  transactionId: string;
  lines: Array<{ lineIndex: number; quantity: number }>;
  reason: string;
  method: string;
}): void;
```

Reducer `COMPLETE_REFUND`:

1. Memvalidasi transaksi ada dan statusnya refundable.
2. Clamp setiap quantity ke sisa quantity baris.
3. Mengabaikan baris quantity 0 atau index invalid.
4. Bila tidak ada quantity valid, mengembalikan state yang sama.
5. Menghitung refund subtotal, tax, dan total.
6. Mengakumulasi `refundedLines`, `refundedSubtotal`, `refundedTax`, dan `refundedTotal`.
7. Menetapkan status:
   - `Dikembalikan` bila seluruh quantity asli telah direfund.
   - `Dikembalikan Sebagian` bila masih ada quantity tersisa.
8. Mengisi `refundReason` dan `refundMethod` dari refund terbaru.
9. Menambah stok produk sesuai nama produk dan jumlah valid.
10. Menjaga transaksi, cart, dan state lain tetap utuh.

Dispatch kedua dengan payload sama setelah refund penuh menjadi no-op karena tidak ada quantity tersisa.

## History and detail behavior

- Filter `Dikembalikan` mencakup `Dikembalikan` dan `Dikembalikan Sebagian`.
- Badge parsial memakai variant `Danger` dan label lengkap `Dikembalikan Sebagian`.
- Detail parsial menampilkan banner informasi refund, jumlah refund akumulatif, item yang sudah direfund, dan tombol `Mulai Pengembalian` untuk sisa item.
- Detail penuh tidak menampilkan tombol mulai refund.
- List row parsial menampilkan `refundMethod` seperti refund penuh.
- Tombol print tetap tersedia pada semua status.

## Error handling

- Route ID invalid: tampilkan `Transaksi tidak ditemukan` dan tombol kembali.
- Status tidak refundable: tampilkan `Transaksi tidak dapat dikembalikan` dan tombol kembali.
- Submit tanpa item, alasan, atau note `Lainnya`: tombol lanjut disabled; tidak dispatch.
- Dismiss sebelum success: tidak ada perubahan global.
- Product name tidak cocok: refund tetap tercatat, stok tidak diubah untuk baris itu.

## Accessibility

- Semua kontrol jumlah minimum 48dp.
- Pilihan item, alasan, dan metode memakai role sesuai kontrol dan selected state.
- Tombol kurang/tambah memiliki label produk dan jumlah saat ini.
- Shell memakai label `Tutup pengembalian`, `Perbesar pengembalian`, dan `Kecilkan pengembalian`.
- Success action memakai label `Kembali ke detail transaksi`.

## Testing

- Pure refund calculations: jumlah sisa, clamp, subtotal, pajak proporsional, total, status parsial/penuh.
- `posReducer`: refund parsial, refund lanjutan hingga penuh, stok bertambah, duplicate/full refund no-op, product tidak ditemukan.
- Derived history: filter refunded mencakup dua status; produk memakai state products.
- Flow reducer: push, back, replace, quantity clamp, alasan, note, metode.
- Presentation contract: refund memakai shell canonical dan route transparent modal.
- Source/component contracts: detail hanya memulai refund pada status valid, partial detail/banner, tombol print tetap tersedia.
- Runtime API 36: full refund dan partial refund, internal back, dismiss tanpa mutation, status/detail/history, stok, success close, dan logcat bersih.
