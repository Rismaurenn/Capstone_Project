# ERD untuk Front-End System POS Capstone Project

> **Visualisasi:** diagram ERD dalam bentuk HTML tersedia di [`erd-visual.html`](./erd-visual.html).
> Generator-nya: [`generate-erd-visual.py`](./generate-erd-visual.py) — ubah koordinat entitas/relasi di
> `E` dan `EDGES`, lalu jalankan `python3 docs/generate-erd-visual.py`.

## Sumber Model

ERD ini disusun untuk **project POS frontend ini** (React + Vite, state di `PosContext`, data mock di
`src/data/initialData.js`). Entitas backend Codasuaka yang **tidak ada di project ini** —
`Instansi`, `Outlet`, `KategoriTransaksi`, `TransaksiKas`, `ApprovalLog` — serta `Stok` sebagai tabel
terpisah **tidak dimuat**. Di project ini stok adalah **kolom** pada `produk`, bukan entitas terpisah.
Multi-tenancy / `TenantScope` juga tidak relevan karena project ini tidak punya backend.

## Entitas

### A. Sudah ada di kode (src/)

#### 1. produk — `INITIAL_PRODUCTS`
- id (PK)
- name
- sku
- category
- price
- stock
- image
- description

#### 2. kategori — `INITIAL_CATEGORIES`
- id (PK)
- name
- icon

#### 3. transaksi — `INITIAL_TRANSACTIONS`
- id (PK)
- date
- cashier
- orderType (`dine-in` / `takeaway`)
- tableNumber
- customerName
- subtotal
- tax
- discount
- total
- paymentMethod (`cash` / `qris` / `debit` / `transfer`)
- amountPaid
- change
- status
- items[] → item_transaksi

#### 4. item_transaksi — `trx.items[]`
- id (PK)
- name
- price
- quantity
- note

#### 5. keranjang — state `cart[]` di `PosContext`
- id
- produk_id
- nama, harga, qty, catatan
- *State sementara, tidak dipersist*

### B. Direncanakan (bagian non-kasir)

#### 6. pelanggan
- id (PK)
- nama
- email
- phone
- alamat
- npwp
- created_at
- updated_at

#### 7. kategori_barang
- id (PK)
- nama
- deskripsi
- created_at
- updated_at

#### 8. diskon
- id (PK)
- kode
- nama
- tipe (persentase/nominal)
- nilai
- mulai_berlaku
- akhir_berlaku
- kuota
- used_quota
- aktif
- created_at
- updated_at

#### 9. loyalty_program
- id (PK)
- nama
- poin_per_rupiah
- rata_poin_ke_rupiah
- aktif
- created_at
- updated_at

#### 10. user
- id (PK)
- nama
- username
- role (`admin` / `kasir`)
- shift
- created_at
- *Sesuai dokumen Perencanaan Sistem (RBAC)*

## Hubungan (Relasi)

| Child | Parent | Kolom FK | Keterangan |
|---|---|---|---|
| produk | kategori | `kategori_id` | planned: ganti `produk.category` (string) |
| item_transaksi | transaksi | `transaksi_id` | sudah implisit via `trx.items[]` |
| item_transaksi | produk | `produk_id` | planned: `item.id` saat ini = id produk |
| item_transaksi | diskon | `diskon_id` (nullable) | planned |
| transaksi | pelanggan | `pelanggan_id` (nullable) | planned: ganti `transaksi.customerName` |
| transaksi | user | `kasir_id` | planned: ganti `transaksi.cashier` (hardcoded) |
| pelanggan | loyalty_program | `loyalty_program_id` (nullable) | planned |
| keranjang | produk | `produk_id` | state sementara |

### Planned changes pada kode existing
1. `transaksi.customerName` (string) → `transaksi.pelanggan_id` (FK, nullable)
2. `produk.category` (string) → `produk.kategori_id` (FK ke `kategori`)
3. `transaksi.cashier` (hardcoded `'Budi Santoso'`) → `transaksi.kasir_id` (FK ke `user`)
4. `transaksi.orderType` & `paymentMethod` tetap literal string (enum), tidak dijadikan tabel

## Catatan Implementasi
- Semua entitas baru menggunakan timestamp fields (created_at, updated_at)
- Foreign key menggunakan konvensi snake_case dengan suffix `_id`
- Relasi bersifat opsional ditandai dengan nullable FK
- Persistensi saat ini `localStorage`: `pos_products`, `pos_transactions`
- Pengurangan stok terjadi di `produk.stock` (`PosContext.completeTransaction`)

*ERD ini dirancang lengkap sebelum memulai implementasi apa pun untuk bagian non-kasir.*
