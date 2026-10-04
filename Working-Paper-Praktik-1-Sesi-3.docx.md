**Working Paper: Praktik 1 Sesi 3**

Kasus Aplikasi Pemesanan Katering Dapur Nia

**Identitas**

| Keterangan | Isian |
| :---- | :---- |
| Nama peserta | Jihan |
| Tanggal | 2 Oktober 2026 |
| Sesi | Sesi 3 (Praktik 1) |
| Nama proyek Antigravity | App 2 Dapur Nia (dapur-nia) |

**A. Pemeriksaan UI CRUD**

| Pemeriksaan | Hasil | Catatan perbaikan |
| :---- | :---- | :---- |
| Daftar data | Berfungsi dengan baik | Tampilan daftar menu, pesanan, dan pelanggan tertata rapi dalam kartu mobile-first; dilengkapi badge status porsi, label pesanan, dan bar pencarian cepat. |
| Formulir | Berfungsi dengan baik | Formulir dialog tersusun rapi dengan label di atas field, validasi reaktif, batasan input numerik non-negatif, serta tombol tindakan berbasis hasil (result-oriented). |
| Create | Berfungsi dengan baik | Berhasil menambah data menu, pelanggan baru (dengan validasi nomor WhatsApp unik), dan membuat pesanan baru dengan snapshot harga serta pemotongan sisa porsi otomatis (anti-overselling). |
| Read | Berfungsi dengan baik | Data dari Firestore berhasil dimuat secara reaktif, konsisten setelah refresh, serta kalkulasi laporan harian memformat angka ke Rupiah dan tanggal Indonesia secara tepat. |
| Update | Berfungsi dengan baik | Fitur ubah data menu, ubah profil pelanggan, dan pembaruan status pesanan berjalan lancar sesuai rantai linier Finite State Machine 1 arah tanpa melompat/mundur. |
| Delete | Berfungsi dengan baik | Tersedia dialog konfirmasi sebelum menghapus menu/pelanggan; pembatalan pesanan otomatis memicu *stock rollback* untuk mengembalikan kuota porsi ke menu terkait. |
| Loading state | Berfungsi dengan baik | Menampilkan animasi *Skeleton loader shimmer* di semua tab saat memuat data, menjaga tata letak tetap stabil dan mencegah pergeseran layout (CLS). |
| Empty state | Berfungsi dengan baik | Menampilkan ilustrasi ikon yang relevan, pesan informatif ramah, dan tombol aksi (CTA) untuk membuat data pertama kali atau mereset filter pencarian. |
| Error state | Berfungsi dengan baik | Menampilkan peringatan inline (alert) dengan warna pembeda yang jelas dan tombol "Coba Lagi" / "Muat Ulang" tanpa memperlihatkan kode teknis rumit ke pengguna. |

**B. Tiga State Tampilan**

| State | Kondisi pemicu | Pesan | Tindakan pengguna | Sudah |
| :---- | :---- | :---- | :---- | :---- |
| Loading | Aplikasi sedang membaca atau menyinkronkan data dari Cloud Firestore secara asinkron saat halaman atau tab pertama kali dibuka. | Menampilkan animasi Skeleton Loader (shimmer kartu menu, pesanan, dan pelanggan). | Menunggu proses pembacaan data selesai secara otomatis tanpa perlu memuat ulang peramban. | \[x\] |
| Empty | Query database berhasil dijalankan tetapi belum ada data tersimpan, atau hasil pencarian kata kunci/filter status tidak ditemukan. | "Belum Ada Menu Katering" / "Belum Ada Pesanan Masuk" / "Belum Ada Data Pelanggan" / "Belum Ada Penjualan Pada Tanggal Ini" (atau "Menu/Pesanan/Pelanggan Tidak Ditemukan"). | Menekan tombol tindakan (CTA) seperti "Tambah Menu Pertama", "Buat Pesanan Pertama", atau menyesuaikan kata kunci pencarian. | \[x\] |
| Error | Gagal menghubungi server Firestore, sambungan internet terputus, atau validasi input data ditolak oleh sistem. | Banner galat inline: "Gagal memuat data..." atau pesan perbaikan formulir (misal: "Nama menu wajib diisi", "Harga tidak boleh kurang dari 0"). | Menekan tombol "Coba Lagi" / "Muat Ulang", memeriksa sambungan internet, atau memperbaiki isian formulir sesuai petunjuk. | \[x\] |

