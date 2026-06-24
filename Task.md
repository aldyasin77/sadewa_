# Task Breakdown: SADEWA (Sistem Aplikasi Data & Evaluasi Sewa Aset) Pemprov

## Context
Dokumen ini mendefinisikan urutan implementasi teknis untuk membangun platform SADEWA, mulai dari pembentukan basis data, antarmuka manajemen master data (Skema Tarif dan Ruangan), hingga kalkulasi otomatis dan visualisasi pada Dashboard Eksekutif. Tugas harus diselesaikan secara berurutan untuk memastikan integritas relasi data.

---

## Phase 1 — Foundation & Database Setup

### Task 1.1: Setup Skema Database & Relasi
Requirements:
- Buat tabel `opd` (id, nama_opd).
- Buat tabel `skema_tarif` (id, nama_skema, tipe_ruangan, jenis_tarif, harga_dasar, status_aktif).
- Buat tabel `ruangan` (id, opd_id, skema_tarif_id, nama_ruangan, tipe_ruangan, luas, harga_bulan, status_ruangan).
- Definisikan *Foreign Key* (Relasi `ruangan.skema_tarif_id` ke `skema_tarif.id`, dan `ruangan.opd_id` ke `opd.id`).

### Task 1.2: Setup UI Framework & Global Layout
Requirements:
- Terapkan *Material Design 3* dengan tipografi dasar *Montserrat*.
- Atur palet warna global: Primer `Deep Emerald Green (#0F3D3E)`, Aksen `Soft Gold (#D4AF37)`.
- Buat *Sidebar Navigation* yang mencakup 3 menu utama: **Dashboard**, **Skema Tarif**, dan **Ruangan**.

---

## Phase 2 — Modul Skema Tarif

### Task 2.1: Build Tabel Daftar Skema
Requirements:
- Buat tabel data (*data table*) yang menampilkan kolom: **Nama Skema**, **Tipe Ruangan**, **Jenis Tarif**, **Harga Dasar**, dan **Aksi** (Ubah/Hapus).
- Format angka pada kolom Harga Dasar menggunakan standar mata uang (Rp X.XXX.XXX).

### Task 2.2: Build Form Tambah Skema & Validasi
Requirements:
- Implementasi input teks: **Nama Skema**.
- Implementasi *dropdown*: **Tipe Ruangan** (Kantin, Kios, Fotocopy), **Jenis Tarif** (Flat Rate, Cluster, Per Meter Persegi).
- Implementasi input angka *auto-format*: **Harga Dasar** (gunakan *splitter* titik otomatis saat mengetik).
- Buat modal konfirmasi sebelum menyimpan.
Success Criteria:
- Sistem menampilkan *Toast notification* sukses selama 3 detik.
- *Data parsing*: Titik pemisah ribuan otomatis dihapus di *backend* sebelum masuk ke *database* sebagai angka murni.
- Form menolak *submit* jika ada *field* kosong atau angka bernilai negatif.

---

## Phase 3 — Modul Inventaris Ruangan

### Task 3.1: Build Tabel Daftar Ruangan
Requirements:
- Buat tabel data yang menampilkan kolom: **Nama/Kode Ruangan**, **Tipe Ruangan**, **Jenis Tarif**, **Luas**, **Harga/Bulan**, **Status**, dan **Aksi**.
- Berikan indikator visual (*badge/color coding*) pada kolom Status: **Tersedia** (Hijau), **Disewa** (Biru/Emas), **Maintenance** (Merah/Abu-abu).

### Task 3.2: Build Form Tambah Ruangan (Dynamic Inputs)
Requirements:
- Implementasi input teks: **Nama Ruangan**.
- Implementasi *dropdown*: **Tipe Ruangan** dan **Status** (Tersedia, Disewa, Maintenance).
- Implementasi *dropdown* relasional: **Skema Tarif** (Hanya tarik data dari tabel `skema_tarif` yang statusnya Aktif).
- **Logika UI Kondisional:** Munculkan input teks **Luas Ruangan** HANYA jika *dropdown* Skema Tarif yang dipilih memiliki Jenis Tarif "Per Meter Persegi".

### Task 3.3: Build Logic Kalkulasi Harga (Backend)
Requirements:
- Buat *function* untuk memproses data sesaat sebelum disimpan ke `ruangan`.
- **Logika Kalkulasi:** Jika skema "Per Meter Persegi", jalankan rumus: `Harga Dasar (dari relasi skema) * Luas (dari input)`. Hasilnya simpan ke kolom `harga_bulan`. Jika *Flat Rate/Cluster*, langsung ambil `Harga Dasar` dan simpan ke `harga_bulan`.
Success Criteria:
- Data ruangan berhasil tersimpan dengan nominal `harga_bulan` yang 100% akurat tanpa perlu input manual dari Admin.

---

## Phase 4 — Dashboard Evaluasi Eksekutif

### Task 4.1: Build KPI Widgets (Aggregations)
Requirements:
- Buat 4 *card widget* di bagian atas halaman dashboard.
- Tulis *query* aggregasi untuk menghitung:
  - **Total Ruangan:** `COUNT()` dari seluruh tabel ruangan.
  - **Potensi Pendapatan:** `SUM(harga_bulan)` dari seluruh tabel ruangan (Format Rupiah, warna netral).
  - **Realisasi Pendapatan:** `SUM(harga_bulan)` dengan filter `WHERE status = 'Disewa'` (Format Rupiah, teks warna Hijau).
  - **Rasio Utilisasi:** `(Total Disewa / Total Ruangan) * 100%`.

### Task 4.2: Build Asset Distribution Chart
Requirements:
- Integrasikan *library* grafik (misal: Chart.js atau Recharts).
- Buat *Pie Chart* atau *Bar Chart* yang menampilkan jumlah ruangan dikelompokkan berdasarkan **Tipe Ruangan** (Kantin vs Kios vs Fotocopy).

### Task 4.3: Build OPD Performance Table
Requirements:
- Buat tabel komprehensif untuk merangkum performa aset per instansi.
- Tulis *query* `GROUP BY opd_id` dengan penggabungan tabel (*JOIN*).
- Tampilkan kolom: **Nama OPD**, **Total Ruangan**, **Potensi Pendapatan (Rp)**, **Realisasi (Rp)**, dan **Persentase Capaian (%)**.
Success Criteria:
- Dashboard berhasil memuat data (*load time* < 1 detik) dan angka akan otomatis berubah (*real-time/auto-refresh*) apabila ada admin yang menambahkan ruangan baru atau mengubah status sewa.