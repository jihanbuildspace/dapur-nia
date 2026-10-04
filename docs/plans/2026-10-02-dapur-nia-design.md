# Design Specification: App 2 Dapur Nia

- **Status:** DRAFT (Menunggu Persetujuan / Review)
- **Tanggal:** 2026-10-02
- **Metodologi:** Superpowers Brainstorming (Architectural Path)
- **Sumber Referensi:** [PRD-App-2-Dapur-Nia.docx.md](file:///d:/DAPUR%20NIA/dapur-nia/PRD-App-2-Dapur-Nia.docx.md)
- **Lingkup:** Sesi 3 — Single-Role CRUD + Cloud Firestore + Netlify Mobile-First

---

## 1. Ringkasan Eksekutif & Tujuan

Dapur Nia adalah bisnis katering harian yang mengalami kendala operasional akibat pencatatan manual di buku tulis:
1. Pesanan terlewat dan data tercecer.
2. Sisa porsi tidak terpantau secara real-time sehingga terjadi kelebihan pesanan (*overselling*).
3. Total tagihan berpotensi salah hitung atau bernilai minus.
4. Pesanan tidak sah (0 porsi) mengotori laporan penjualan.

**Tujuan Sistem:**
Membangun aplikasi web mobile-first yang mengintegrasikan alur data Menu, Pelanggan, Pesanan, dan Laporan Harian secara terpusat dengan integritas data yang kokoh.

---

## 2. Tiga Invariant Bisnis (The Golden Invariants)

Aturan ini mengikat seluruh logika formulir, mutasi data, dan keamanan Firestore:

```
[ Invariant 1: Anti-Minus Tagihan ]
Setiap item.qty > 0 AND item.price >= 0 AND shippingFee >= 0
Total = (Σ item.subtotal) + shippingFee (Selalu >= 0)

[ Invariant 2: Anti-Overselling Stok ]
pesanan.qty <= menu.sisaPorsi
Saat pesanan dibuat: menu.sisaPorsi = menu.sisaPorsi - pesanan.qty (sisaPorsi >= 0)

[ Invariant 3: Finite State Machine (Transisi Status 1 Arah) ]
[Menunggu Bayar] ──▶ [Dikonfirmasi] ──▶ [Diproses/Dimasak] ──▶ [Dikirim] ──▶ [Selesai]
         │                     │
         └─────────┬───────────┘
                   ▼
             [Dibatalkan] ──▶ (Otomatis: Kembalikan sisaPorsi menu / Stock Rollback)
```

### Aturan Tambahan Kritis:
* **Order Snapshotting:** Dokumen pesanan **wajib menyalin data snapshot** `{ menuId, menuName, priceAtOrder, qty, subtotal }`. Perubahan harga menu di masa depan tidak boleh mengubah nilai transaksi masa lalu.
* **Format Tanggal Laporan:** Tanggal pesanan disimpan dalam format ISO date string `YYYY-MM-DD` (misal: `"2026-10-02"`) untuk mempermudah agregasi dan menghindari ketidakcocokan zona waktu.

---

## 3. Arsitektur Data & Skema Cloud Firestore

### 3.1 Koleksi `menus`
Menyimpan katalog menu katering harian dan kuota porsi.

```typescript
interface MenuItem {
  id?: string;
  name: string;               // Nama menu (e.g. "Ayam Bakar Madu")
  price: number;              // Harga satuan (>= 0)
  remainingPortions: number;  // Sisa porsi (>= 0)
  category?: string;          // Kategori (e.g. "Paket Nasi", "Lauk", "Minuman")
  description?: string;       // Deskripsi singkat
  imageUrl?: string;          // URL foto menu
  isAvailable: boolean;       // Otomatis false jika remainingPortions === 0
  createdAt: any;             // Firestore Timestamp
  updatedAt: any;             // Firestore Timestamp
}
```

### 3.2 Koleksi `customers`
Menyimpan basis data pelanggan katering untuk pengiriman berulang.

```typescript
interface Customer {
  id?: string;
  name: string;               // Nama pelanggan (Wajib)
  whatsapp: string;           // Nomor WA unik terformat (e.g. "628123456789")
  address: string;            // Alamat lengkap pengiriman (Wajib)
  notes?: string;             // Catatan pengiriman (e.g. "Pagar hitam")
  createdAt: any;             // Firestore Timestamp
}
```

### 3.3 Koleksi `orders`
Menyimpan transaksi pesanan lengkap dengan riwayat snapshot dan status.

```typescript
type OrderStatus = 
  | 'menunggu_pembayaran' 
  | 'dikonfirmasi' 
  | 'diproses' 
  | 'dikirim' 
  | 'selesai' 
  | 'dibatalkan';

interface OrderItemSnapshot {
  menuId: string;
  menuName: string;
  priceAtOrder: number;       // Harga saat pesanan dibuat
  qty: number;                // Jumlah porsi (> 0)
  subtotal: number;           // priceAtOrder * qty
}

interface Order {
  id?: string;
  orderNumber: string;        // Nomor referensi (e.g. "ORD-20261002-001")
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  customerAddress: string;
  items: OrderItemSnapshot[];
  subtotal: number;           // Total harga makanan
  shippingFee: number;        // Biaya ongkir (>= 0)
  totalAmount: number;        // subtotal + shippingFee
  status: OrderStatus;
  orderDate: string;          // Format "YYYY-MM-DD" untuk query filter laporan
  paymentProofUrl?: string;   // Bukti transfer pembayaran
  notes?: string;
  createdAt: any;
  updatedAt: any;
}
```

---

## 4. Spesifikasi UI/UX & Design System

Aplikasi dioptimalkan untuk pengoperasian satu tangan di layar ponsel (mobile-first):

* **Preset Desain:** `bKsEuMcK` (shadcn/ui)
  * **Warna Tema:** `Amber` (hangat, ramah kuliner, membangkitkan selera)
  * **Base Neutral:** `Stone` (lembut, elegan, tidak silau)
  * **Radius:** `Large` (`0.875rem` / `rounded-xl`)
  * **Ikon:** Lucide Icons (`UtensilsCrossed`, `Users`, `Receipt`, `BarChart3`, dll.)
  * **Tipografi:** Sans-serif (Inter)

### Tata Letak Navigasi Mobile (Bottom Navigation Bar):
1. 🍽️ **Menu:** Daftar menu aktif, badge sisa porsi, tombol ubah porsi cepat, dan form tambah/edit menu.
2. 📝 **Pesanan:** Daftar pesanan harian berdasarkan status tab, modal detail pesanan, tombol pembaruan status linier, dan tombol buat pesanan baru.
3. 👥 **Pelanggan:** Direktori pelanggan, pintasan chat WA, form tambah/edit pelanggan dengan validasi WA unik.
4. 📊 **Laporan:** Pemilih tanggal (*date picker*), kartu ringkasan (Total Porsi Terjual & Total Uang Masuk), rincian penjualan per menu, dan status pesanan dibatalkan yang dieksklusi.

### 3 Wajah State Wajib di Setiap Modul:
* **Loading State:** Skeleton loader shimmer untuk kartu menu, tabel pesanan, dan ringkasan metrik.
* **Empty State:** Ilustrasi ramah + pesan edukatif + tombol ajakan bertindak (CTA).
* **Error State:** Banner/alert inline yang menjelaskan penyebab masalah dan langkah solutifnya.

---

## 5. Matriks Pertahanan Uji Tembus (Peer-Testing Defense)

| Masukan Tidak Sah | Respon UI / Validasi | Respon Database / Firestore |
| :--- | :--- | :--- |
| **1. Field Kosong** | Pesan error inline di bawah field yang bersangkutan; tombol simpan dinonaktifkan. | Ditolak bila field mandatory (`name`, `price`, `address`, dll) null/empty. |
| **2. Tipe Salah** | Input angka memakai type number; string yang dimasukkan otomatis diblokir/disanitasi. | Validasi tipe data ketat pada payload sebelum `setDoc`/`addDoc`. |
| **3. Teks Terlalu Panjang** | Atribut `maxLength` pada input nama/alamat; kartu UI menggunakan `line-clamp` untuk mencegah overflow. | Validasi string length. |
| **4. Nilai Negatif** | Validasi input `min="0"`; jika nilai < 0, muncul error *"Nilai tidak boleh kurang dari 0"*. | Ditolak bila harga, porsi, atau ongkir < 0. |
| **5. Nilai di Luar Batas** | Stepper kuantitas porsi dinonaktifkan saat mencapai sisa porsi menu. Pesan: *"Maksimal pesanan: X porsi"*. | Perhitungan porsi divalidasi terhadap `remainingPortions`. |
| **6. Perubahan Status Ilegal** | Tombol status hanya memunculkan opsi berikutnya yang diizinkan (atau batalkan). | Pengecekan alur status transisi. |

---

## 6. Rencana Implementasi Bertahap (Roadmap)

1. **Fase 1: Konfigurasi Firebase & State Management**
   * Buat `lib/firebase.ts` untuk inisialisasi Firestore SDK.
   * Siapkan hook/layanan Firestore untuk membaca dan menulis data secara reaktif.
2. **Fase 2: Modul Menu (CRUD & Kontrol Porsi)**
   * UI Daftar Menu dengan kartu responsif & badge stok.
   * Form Dialog Tambah/Edit Menu dengan validasi angka non-negatif.
3. **Fase 3: Modul Pelanggan (CRUD & Validasi WhatsApp)**
   * UI Daftar Pelanggan dengan pencarian cepat.
   * Form Tambah Pelanggan dengan validasi nomor WA unik.
4. **Fase 4: Modul Pesanan (Engine Transaksi & State Machine)**
   * Form Pesanan Cepat (pilih pelanggan, pilih menu dengan stepper, input ongkir, kalkulasi otomatis).
   * Snapshot item pesanan dan pengurangan otomatis stok menu.
   * Kartu Detail Pesanan dengan tombol transisi status linier dan pembatalan (kembalikan stok).
5. **Fase 5: Modul Laporan Harian**
   * Filter tanggal (`YYYY-MM-DD`).
   * Agregasi jumlah porsi per menu & total pendapatan bersih (mengecualikan pesanan dibatalkan).
   * Empty state bila belum ada pesanan pada tanggal terkait.
6. **Fase 6: Validasi Uji Tembus & Kesiapan Publikasi Netlify**
   * Uji 6 skenario masukan tidak sah.
   * Build test produksi (`npm run build`) untuk verifikasi Netlify.
