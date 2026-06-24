---
version: 1.0
name: SADEWA-design-system
description: Design system untuk SADEWA (Sistem Aplikasi Data & Evaluasi Sewa Aset) Pemprov Jawa Barat. Menggabungkan filosofi kejernihan data tingkat institusional (diadaptasi dari struktur Coinbase) dengan wibawa dan identitas visual pemerintahan daerah. Mengutamakan kanvas putih yang bersih, spasi yang bernapas, tipografi angka *monospace* untuk akurasi finansial, dan *Deep Emerald Green* sebagai warna aksi utama.

colors:
  primary: "#0F3D3E" # Deep Emerald Green - Warna utama aksi & brand
  primary-active: "#0A292A" 
  primary-disabled: "#9CA3AF"
  accent: "#D4AF37" # Soft Gold - Warna aksen sekunder & highlight
  ink: "#0A0B0D" # Teks utama & heading
  body: "#5B616E" # Teks paragraf / sekunder
  muted: "#7C828A" # Teks placeholder / breadcrumb
  hairline: "#E2E8F0" # Garis batas (border) tabel/card
  canvas: "#FFFFFF" # Background utama halaman
  surface-soft: "#F8FAFC" # Background tabel header / zebra stripe
  surface-card: "#FFFFFF" # Background card widget
  semantic-up: "#05B169" # Hijau positif (Realisasi/Tersedia)
  semantic-down: "#CF202F" # Merah negatif (Alert/Maintenance)
  semantic-warning: "#F59E0B" # Kuning peringatan (Disewa/Pending)

typography:
  # Menggunakan Montserrat sebagai typeface utama, JetBrains Mono khusus angka
  title-lg:
    fontFamily: "'Montserrat', 'Inter', sans-serif"
    fontSize: "24px"
    fontWeight: "600"
    lineHeight: "1.2"
  title-md:
    fontFamily: "'Montserrat', 'Inter', sans-serif"
    fontSize: "18px"
    fontWeight: "600"
    lineHeight: "1.33"
  body-md:
    fontFamily: "'Montserrat', 'Inter', sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.5"
  body-strong:
    fontFamily: "'Montserrat', 'Inter', sans-serif"
    fontSize: "14px"
    fontWeight: "600"
    lineHeight: "1.5"
  number-display:
    # ADOPSI LANGSUNG DARI COINBASE: Monospace untuk semua data finansial/angka
    fontFamily: "'JetBrains Mono', 'Geist Mono', monospace"
    fontSize: "15px"
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: "0"
  button:
    fontFamily: "'Montserrat', 'Inter', sans-serif"
    fontSize: "14px"
    fontWeight: "600"
    letterSpacing: "0.5px"

rounded:
  sm: "4px" # Checkbox / Tag kecil
  md: "8px" # Form input
  lg: "16px" # Card / Modal / Panel Tabel
  pill: "100px" # Tombol Aksi Utama (Adopsi Coinbase)

spacing:
  # Base unit 4px (Adopsi Coinbase) untuk ritme yang konsisten
  xs: "8px"
  sm: "12px"
  base: "16px" # Padding standar dalam sel tabel
  md: "24px" # Jarak antar komponen/widget
  lg: "32px" # Jarak antar section

components:
  top-app-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderBottom: "1px solid {colors.hairline}"
    height: "64px"
    
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
    height: "40px"
    
  card-widget:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: "24px"
    border: "1px solid {colors.hairline}"
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" # Sangat halus
    
  data-table-header:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    padding: "12px 16px"
    
  data-table-cell-currency:
    typography: "{typography.number-display}"
    textColor: "{colors.ink}"
    textAlign: "right"
---

# SADEWA Design System Guidelines

Dokumen ini adalah panduan implementasi antarmuka untuk SADEWA. Desain ini mengadopsi ketegasan *layout* institusional ala Coinbase, namun disesuaikan (dimodifikasi) penuh untuk kebutuhan *dashboard* administratif aparatur pemerintah (seperti Admin OPD dan Bendahara Penerimaan Pembantu / BPP).

## 🟢 ELEMEN YANG DIADOPSI LANGSUNG (Dari Referensi Coinbase)

1. **Tipografi Angka Monospace (`number-display`)**
   - **Aturan:** Seluruh data nominal uang (Harga Dasar, Harga/Bulan, Potensi, Realisasi), persentase, dan angka luas ruangan **WAJIB** menggunakan font *monospace* (JetBrains Mono).
   - **Alasan:** Memastikan angka desimal dan ribuan sejajar sempurna di dalam tabel, mencegah salah baca oleh pengguna.

2. **Ruang Bernapas (Generous Whitespace & Base 4px Grid)**
   - **Aturan:** Gunakan kelipatan 4px untuk *margin* dan *padding*. Berikan ruang minimal 16px (`spacing.base`) di dalam sel tabel, dan 24px (`spacing.md`) antar *card widget*. 
   - **Alasan:** Menghindari antarmuka yang sesak (*cluttered*), sehingga admin tidak pusing saat melakukan rekapitulasi data.

3. **Geometri Tombol (Pill Shape)**
   - **Aturan:** Semua tombol aksi utama ("Tambah Skema", "Simpan Ruangan") wajib menggunakan *border-radius* 100px (`rounded.pill`).
   - **Alasan:** Memberikan sentuhan modern yang membedakan titik interaksi (tombol) dengan titik informasi (kartu/tabel yang bersudut lebih tegas).

4. **Ketergantungan pada Garis Tipis (Hairlines), Bukan Bayangan**
   - **Aturan:** Pemisah antar baris tabel dan tepi *card* menggunakan garis 1px berwarna abu-abu sangat terang (`#E2E8F0`). Gunakan bayangan (*drop shadow*) pada level yang nyaris tak terlihat (maksimal 5% *opacity*), itupun hanya untuk melayang-kan *modal* atau *dropdown*.

## 🟡 ELEMEN YANG DIMODIFIKASI UNTUK SADEWA

1. **Identitas Warna Utama (Dari Biru ke Hijau Zamrud)**
   - **Modifikasi:** Menggantikan *Coinbase Blue* dengan **Deep Emerald Green (`#0F3D3E`)** sebagai aksen primer, dan **Soft Gold (`#D4AF37`)** sebagai pelengkap.
   - **Implementasi:** Gunakan `#0F3D3E` pada tombol utama, warna ikon aktif di *sidebar*, dan elemen *branding* di *header*.

2. **Penghapusan "Dark Hero Section"**
   - **Modifikasi:** SADEWA adalah *internal dashboard* operasional, bukan halaman *marketing* bursa kripto. Oleh karena itu, *banner* besar berwarna gelap pekat (`#0A0B0D`) ditiadakan.
   - **Implementasi:** Halaman langsung dibuka dengan *Top Bar* putih bersih dan deretan *Card Widgets* atau Tabel Data dengan latar belakang halaman putih keabu-abuan (`#F8FAFC`).

3. **Hierarki Tipografi Reguler**
   - **Modifikasi:** Menggantikan *Coinbase Display/Sans* dengan **Montserrat** (atau Inter sebagai fallback) untuk *heading* dan teks bodi reguler. 
   - **Implementasi:** Jaga ketebalan teks bodi di angka 400 (Reguler) dan teks *header* tabel di 600 (Semi-Bold).

## Do's and Don'ts

### Do
- Pastikan setiap nominal Rupiah (Rp) di *dashboard* menggunakan font *monospace* (`JetBrains Mono`).
- Gunakan warna *semantic* fungsional **hanya pada teks atau teks-badge berlatar transparan/sangat pudar**, jangan gunakan blok merah/hijau solid menyala pada tabel.
- Pastikan input formulir untuk Harga Dasar menggunakan auto-format ribuan saat admin mengetik.
- Desain antarmuka dengan mempertimbangkan kenyamanan BPP (Bendahara Penerimaan Pembantu) yang akan melihat layar ini berjam-jam.

### Don't
- Jangan membuat tabel dengan *padding* sempit di bawah 12px.
- Jangan gunakan warna *Deep Emerald Green* untuk *background* halaman penuh, gunakan hanya sebagai aksen aksi.
- Jangan menggunakan sudut tajam (0px) pada elemen interaktif apa pun.
