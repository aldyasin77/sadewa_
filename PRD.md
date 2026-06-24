# PRD: SADEWA (Sistem Aplikasi Data & Evaluasi Sewa Aset) Pemprov

## Product Overview

**SADEWA** (Sistem Aplikasi Data & Evaluasi Sewa Aset) adalah modul inti berbasis web pada platform Retribusi Aset OPD Pemprov. Sistem ini dirancang untuk mendigitalisasi master data aset ruangan sebelum ditawarkan kepada masyarakat, sekaligus memvisualisasikan performa penyewaan aset tersebut.

Modul ini menyediakan antarmuka bagi Admin untuk membakukan skema tarif sewa dan mendata ruangan. SADEWA akan mengkalkulasi harga sewa per bulan secara otomatis, dan menyajikan *executive dashboard* secara *real-time* untuk memantau potensi serta realisasi Pendapatan Asli Daerah (PAD) dari sektor retribusi ruangan.

## Problem Statement

Tantangan yang dihadapi dalam pengelolaan aset OPD saat ini meliputi:
- Pendataan aset ruangan yang dapat disewakan masih tersebar dan belum memiliki standar skema tarif yang terpusat.
- Proses perhitungan harga sewa (terutama yang berbasis luas meter persegi) dilakukan manual sehingga memakan waktu dan rentan *human error*.
- Pimpinan dan pengelola aset kesulitan melacak status aktual ketersediaan ruangan.
- Tidak ada visibilitas data instan mengenai berapa potensi pendapatan aset jika disewakan seluruhnya, dan berapa yang benar-benar terealisasi.

## Product Goals

SADEWA harus membantu pengguna untuk:
- Membuat dan mengelola berbagai parameter skema tarif sewa dengan aman.
- Mendaftarkan ruangan baru dengan proses kalkulasi harga sewa yang terotomatisasi.
- Memantau ketersediaan ruangan secara *real-time*.
- Menganalisis metrik performa penyewaan, distribusi aset OPD, serta realisasi target pendapatan melalui visualisasi dashboard evaluasi.

## Success Metrics

- Waktu penambahan data ruangan baru di bawah 30 detik.
- Akurasi perhitungan harga sewa 100% tanpa intervensi manual.
- Sistem memblokir 100% upaya penyimpanan data *form* yang tidak lengkap/tidak valid.
- Dashboard mampu menyajikan agregasi data (*auto-refresh*) dalam waktu kurang dari 1 detik setelah terjadi perubahan status data ruangan.

## Target Users

1. **Admin Pengelola Aset (Staf OPD)**
   - *Goals:* Melakukan inventarisasi aset dan menentukan tarif sewa secepat dan seakurat mungkin.
   - *Pain Points:* Lelah menghitung luas manual dan melihat angka nol tanpa *formatting* ribuan.
2. **Eksekutif (Kepala OPD / Superadmin Pemprov)**
   - *Goals:* Memantau utilisasi aset dan mengevaluasi kontribusi pendapatan setiap OPD.

## Core Features

### 1. Manajemen Skema Tarif
Modul untuk mengatur standar harga dasar sewa.
- Tabel daftar skema aktif dengan aksi Ubah & Hapus.
- *Form* input dengan dukungan *auto-formatting* pemisah titik untuk mata uang (ribuan).
- *Dropdown* jenis tarif dinamis (*Flat Rate*, *Cluster*, Per Meter Persegi).

### 2. Manajemen Ruangan
Modul untuk mendata fisik ruangan dan statusnya.
- Tabel utama berisi informasi (Nama/Kode, Luas, Harga/Bulan, Status).
- Relasi dinamis ke *database* Skema Tarif (menampilkan skema aktif saja).
- Kalkulator *backend* untuk menetapkan nilai "Harga/Bulan".
- Pelabelan status dengan indikator visual (Tersedia, Disewa, Maintenance).

### 3. Dashboard Evaluasi & Potensi Retribusi
Modul visualisasi data *real-time*.
- **KPI Widgets:** Menampilkan total ruangan, rasio utilisasi (%), potensi pendapatan (Rp), dan realisasi pendapatan aktual (Rp).
- **Asset Distribution Chart:** Visualisasi grafik sebaran ruangan berdasarkan Tipenya (Kantin, Kios, Fotocopy).
- **OPD Performance Table:** Tabel detail pencapaian per nama OPD (Total Ruangan, Potensi Pendapatan, Realisasi, dan Persentase Capaian).

## Information Architecture

SADEWA Dashboard Hub
├── Modul Skema Tarif
│   ├── Tabel Daftar Skema
│   ├── Form Tambah Skema
│   └── Modal Konfirmasi
├── Modul Inventaris Ruangan
│   ├── Tabel Daftar Ruangan
│   ├── Form Tambah Ruangan (Relasi ke Skema Tarif)
│   └── Modal Konfirmasi
└── Dashboard Evaluasi Eksekutif
    ├── KPI Widgets (Potensi, Realisasi, Total Aset, Utilisasi)
    ├── Chart Area (Distribusi per Kategori Ruangan)
    └── Tabel Kontribusi OPD (Detail metrik per Nama OPD)

## User Flows

**Flow 1: Tambah Skema Tarif**
1. Admin membuka menu Skema Tarif -> Klik "Tambah Skema Baru".
2. Mengisi form (Nama, Tipe, Jenis Tarif, Harga Dasar dengan *auto-format*).
3. Klik "Tambah Skema" -> Konfirmasi Modal -> Data tersimpan & *Toast Success*.

**Flow 2: Tambah Ruangan Baru**
1. Admin membuka menu Ruangan -> Klik "Tambah Ruangan".
2. Mengisi Nama & Tipe -> Memilih Skema Tarif aktif.
3. *Conditional:* Jika Skema = Per Meter, input Luas Ruangan.
4. Memilih Status -> Konfirmasi Modal.
5. Sistem menghitung `Harga/Bulan` secara latar belakang -> Simpan ke DB -> *Toast Success*.

**Flow 3: Monitoring Dashboard Evaluasi**
1. Eksekutif membuka halaman Dashboard SADEWA.
2. Sistem menjalankan *query* agregasi total nilai berdasarkan data ruangan.
3. Eksekutif melihat visualisasi performa OPD dan persentase ketercapaian target.

## Functional Requirements

- **Sanitasi Data:** Sistem wajib mem- *parsing* nilai Harga Dasar (menghapus titik separator) sebelum disimpan ke *database* dalam bentuk *integer/decimal*.
- **Kalkulasi Otomatis:** Eksekusi rumus `Harga/Bulan = Harga Dasar * Luas` saat penyimpanan data ruangan (untuk jenis tarif Per Meter Persegi).
- **Validasi Form:** Cegah *submit* apabila ada *field* kosong atau bernilai negatif.
- **Kalkulasi Dashboard:**
  - Potensi Pendapatan: `SUM(harga_bulan)` dari seluruh ruangan.
  - Realisasi: `SUM(harga_bulan)` khusus ruangan berstatus 'Disewa'.
  - Pengelompokan Data (Group By): Pengurutan dan kalkulasi pada tabel berdasarkan `opd_id`.

## Non-Functional Requirements

### UI/UX & Design System
- Menerapkan prinsip *Material Design 3* untuk struktur *layout* yang rapi, *clutter-free*, dan modern.
- Tipografi menggunakan keluarga font sans-serif seperti Montserrat untuk menjaga keterbacaan tinggi pada tabel yang padat informasi.
- Skema warna elegan menggunakan Deep Emerald Green (#0F3D3E) sebagai warna dominan/primer, dipadukan dengan Soft Gold (#D4AF37) sebagai aksen pada tombol aksi utama atau status esensial. Warna hijau/positif digunakan untuk metrik Realisasi, sedangkan warna netral untuk Potensi.
- Format *currency* wajib menggunakan standar Rupiah (Rp X.XXX.XXX).

### Performance
- Waktu muat tabel dan kalkulasi *widget* agregasi harus di bawah 1 detik.
- *Toast notification* memiliki *auto-dismiss* dalam 3 detik.