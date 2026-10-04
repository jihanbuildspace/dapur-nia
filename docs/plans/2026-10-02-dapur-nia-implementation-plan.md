# Dapur Nia App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web katering harian Dapur Nia (Mobile-First) dengan 4 modul utama (Menu, Pelanggan, Pesanan, Laporan) yang mengunci 3 invariant bisnis: anti-minus tagihan, anti-overselling porsi, dan alur status 1 arah dengan rollback stok otomatis, terhubung ke Cloud Firestore dan dihias tema Amber shadcn/ui.

**Architecture:** Next.js 16 (App Router) dengan Tailwind CSS v4, pustaka komponen shadcn/ui (preset bKsEuMcK), Firebase Client SDK v10+ untuk persistensi data Firestore reaktif, dan arsitektur modular per-fitur.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Lucide React, Cloud Firestore.

**Spec:** [docs/plans/2026-10-02-dapur-nia-design.md](file:///d:/DAPUR%20NIA/dapur-nia/docs/plans/2026-10-02-dapur-nia-design.md)

---

## Global Constraints

- **Platform:** Web responsif layar ponsel (mobile-first) siap publikasi Netlify.
- **Basis Data:** Cloud Firestore (Koleksi `menus`, `customers`, `orders`).
- **Akses Pengguna:** Single-role untuk latihan CRUD Sesi 3.
- **Tema Desain:** Amber & Stone dari preset shadcn `bKsEuMcK`.
- **Kunci Keamanan:** Kredensial Firebase dimuat melalui file `.env.local` dan tidak dikomit ke repository publik.

## Review Focus (Defense Matrix Uji Tembus)

1. **Field Kosong:** Formulir divalidasi reaktif; tombol simpan dinonaktifkan jika field wajib belum diisi.
2. **Tipe Salah:** Input harga/porsi dikunci tipe number; sanitasi nilai sebelum dikirim ke Firestore.
3. **Teks Terlalu Panjang:** Pembatasan `maxLength` pada input nama/alamat dan `line-clamp` pada kartu UI.
4. **Nilai Negatif:** Penolakan keras untuk harga < 0, porsi < 0, atau ongkir < 0 dengan pesan jelas.
5. **Nilai di Luar Batas:** Pembatasan stepper porsi pesanan $\le$ sisa porsi menu yang tersedia.
6. **Perubahan Status Ilegal:** Tombol status pesanan hanya menampilkan tahap berikutnya yang diizinkan dalam *finite state machine*.

---

## File Structure

```
dapur-nia/
├── app/
│   ├── globals.css                # Tema Amber, Stone, styling base Tailwind
│   ├── layout.tsx                 # Root layout & Theme provider
│   └── page.tsx                   # Main mobile layout dengan Bottom Navigation & Modul Switcher
├── components/
│   ├── layout/
│   │   ├── bottom-nav.tsx         # Bottom Navigation 4 tab (Menu, Pesanan, Pelanggan, Laporan)
│   │   └── header.tsx             # Header aplikasi katering Dapur Nia
│   ├── modules/
│   │   ├── menu/
│   │   │   ├── menu-list.tsx      # Katalog menu, badge porsi, indikator habis
│   │   │   ├── menu-card.tsx      # Kartu menu individual
│   │   │   └── menu-dialog.tsx    # Modal tambah/edit menu dengan validasi
│   │   ├── customer/
│   │   │   ├── customer-list.tsx  # Daftar pelanggan & pencarian
│   │   │   └── customer-dialog.tsx# Form tambah/edit pelanggan (WA unik)
│   │   ├── order/
│   │   │   ├── order-list.tsx     # Daftar pesanan dengan filter status
│   │   │   ├── order-card.tsx     # Kartu pesanan & aksi transisi status
│   │   │   ├── order-detail.tsx   # Modal rincian snapshot pesanan
│   │   │   └── order-dialog.tsx   # Form buat pesanan cepat (pilih menu + stepper + ongkir)
│   │   └── report/
│   │       ├── daily-report.tsx   # Modul laporan harian dengan Date Picker
│   │       └── metric-card.tsx    # Kartu ringkasan (Porsi Terjual & Uang Masuk)
│   └── ui/                        # Komponen shadcn/ui (button, card, input, badge, dialog, tabs)
├── lib/
│   ├── firebase.ts                # Inisialisasi Firebase & konfigurasi Firestore
│   ├── firestore-service.ts       # Operasi CRUD, transaksi stok, snapshot pesanan
│   ├── types.ts                   # Definisi interface TypeScript (MenuItem, Customer, Order)
│   └── utils.ts                   # Format rupiah, format tanggal, helpers
└── docs/plans/
    ├── 2026-10-02-dapur-nia-design.md
    └── 2026-10-02-dapur-nia-implementation-plan.md
```

---

## Implementation Tasks

### Task 1: Setup Firebase Client & Data Types
- [ ] Install package `firebase` (`npm install firebase`).
- [ ] Buat file `lib/types.ts` berisi tipe data lengkap `MenuItem`, `Customer`, `Order`, `OrderItemSnapshot`, dan `OrderStatus`.
- [ ] Buat file `lib/firebase.ts` yang menginisialisasi Firebase App & Firestore dengan *fallback demo mode* (jika kredensial `.env.local` belum diisi).
- [ ] Buat file `lib/utils.ts` berisi fungsi `formatRupiah(number)` dan `formatDate(date)`.
- [ ] Verifikasi build dengan `npm run typecheck`.

### Task 2: Modul Menu (CRUD & Kontrol Sisa Porsi)
- [ ] Buat layanan Firestore menu di `lib/firestore-service.ts` (`getMenus`, `addMenu`, `updateMenu`, `deleteMenu`).
- [ ] Buat komponen `components/modules/menu/menu-card.tsx` dengan badge status (tersedia / sisa sedikit / habis).
- [ ] Buat komponen `components/modules/menu/menu-dialog.tsx` untuk tambah & edit menu dengan validasi: nama wajib, harga $\ge 0$, porsi $\ge 0$.
- [ ] Buat komponen `components/modules/menu/menu-list.tsx` lengkap dengan *Loading Skeleton*, *Empty State*, dan *Inline Error*.
- [ ] Uji input negatif & porsi nol (memastikan status otomatis menjadi "Habis").

### Task 3: Modul Pelanggan (CRUD & Validasi WhatsApp)
- [ ] Buat layanan Firestore pelanggan di `lib/firestore-service.ts` (`getCustomers`, `addCustomer`, `updateCustomer`, `deleteCustomer`).
- [ ] Buat komponen `components/modules/customer/customer-dialog.tsx` dengan validasi: nama wajib, alamat wajib, nomor WhatsApp unik dan dinormalisasi (`628...`).
- [ ] Buat komponen `components/modules/customer/customer-list.tsx` dengan fitur pencarian nama/no telepon, *Loading Skeleton*, dan *Empty State*.
- [ ] Uji validasi duplikasi nomor WhatsApp.

### Task 4: Modul Pesanan (Engine Transaksi, Snapshot, & State Machine)
- [ ] Buat layanan transaksi pesanan di `lib/firestore-service.ts`:
  - `createOrder`: Simpan snapshot `{ menuId, menuName, priceAtOrder, qty, subtotal }`, kurangi `remainingPortions` pada dokumen menu terkait.
  - `updateOrderStatus`: Perbarui status sesuai rantai linier (`menunggu_pembayaran` ➔ `dikonfirmasi` ➔ `diproses` ➔ `dikirim` ➔ `selesai`).
  - `cancelOrder`: Ubah status menjadi `dibatalkan` dan otomatis kembalikan stok (*stock rollback*) ke menu.
- [ ] Buat komponen `components/modules/order/order-dialog.tsx`:
  - Dropdown pemilih pelanggan atau input langsung.
  - Pemilih menu dengan kuantitas stepper `+ / -` yang terkunci maksimal `sisaPorsi`.
  - Input ongkos kirim $\ge 0$.
  - Kalkulasi total tagihan otomatis secara live ($Total \ge 0$).
- [ ] Buat komponen `components/modules/order/order-card.tsx` dan `order-list.tsx` dengan tab status (`Semua`, `Aktif`, `Selesai`, `Dibatalkan`).

### Task 5: Modul Laporan Harian (Agregasi Penjualan)
- [ ] Buat layanan Firestore laporan di `lib/firestore-service.ts` (`getDailyReport(dateString)`):
  - Query pesanan pada tanggal terkait (`orderDate === selectedDate`).
  - Eksklusi pesanan dengan status `dibatalkan`.
  - Hitung total porsi terjual per menu dan total uang masuk bersih.
- [ ] Buat komponen `components/modules/report/daily-report.tsx` dengan pemilih tanggal, kartu metrik, rincian menu terjual, dan *Empty State* saat belum ada pesanan pada tanggal tersebut.

### Task 6: Integrasi UI Mobile-First & Pengujian Menyeluruh
- [ ] Rangkai Bottom Navigation (`components/layout/bottom-nav.tsx`) dan Header (`components/layout/header.tsx`) di `app/page.tsx`.
- [ ] Hubungkan transisi antar-tab modul (Menu, Pesanan, Pelanggan, Laporan) dengan *smooth switching*.
- [ ] Tambahkan tombol "Seed Data Latihan" opsional agar penguji / mentor dapat langsung mencoba aplikasi dengan menu & pelanggan awal.
- [ ] Lakukan verifikasi terhadap 6 skenario Uji Tembus (Bab 8 PRD).
- [ ] Jalankan `npm run build` dan `npm run typecheck` untuk memastikan zero errors dan kesiapan deploy Netlify.
