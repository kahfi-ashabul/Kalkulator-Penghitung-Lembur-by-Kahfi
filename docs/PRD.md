# PRD Kalem - Kalkulator Lembur & Estimasi Gaji Karyawan

Diperbarui Nov 11, 2026 · Penyusun: @Kahfi (Kei Project)

---

## 1. Ringkasan eksekutif

**Kalem** (Kalkulator Lembur) adalah aplikasi web PWA presisi tinggi untuk menghitung upah lembur dan estimasi gaji bulanan/harian karyawan di Indonesia. Kalem dirancang bukan sekadar kalkulator angka biasa, melainkan **mesin kepatuhan regulasi ketenagakerjaan** yang secara otomatis memetakan jam lembur ke dalam formula resmi **PP No. 35 Tahun 2021 (Pasal 31)**, skema bertingkat kustom, maupun tarif flat kesepakatan perusahaan.

Alasan arah produk ini:
- Lebih dari 50 juta pekerja formal di Indonesia (buruh pabrik, pekerja shift, staf ritel, logistik, UMKM) kesulitan memverifikasi apakah upah lembur yang dibayarkan HRD/perusahaan sudah sesuai dengan hukum atau belum.
- Kalkulator online yang ada saat ini kebanyakan usang (masih memakai Kepmenakertrans 102/2004), penuh iklan pop-up yang mengganggu, tidak memiliki rekap absensi, dan tidak menghasilkan bukti slip gaji yang sah untuk diserahkan ke manajemen.
- **Kalem menyelesaikan masalah ini dalam hitungan detik:** pekerja cukup memasukkan gaji dan jam kerja/lembur, maka rincian nominal per jam, subtotal kotor, potongan BPJS/PPh21, hingga Take Home Pay langsung tersaji lengkap dengan **Bukti Slip Gaji PNG (Retina 2x)** dan **Ekspor Rekap Excel (.xlsx/.csv)**.

**Prinsip Utama Kalem:**
- **Inti produk:** Engine kalkulasi upah lembur multi-skema (PP 35/2021 5 & 6 hari kerja, lembur bertingkat mandiri, tarif flat/borongan), rekap kehadiran bulanan, dan generator slip gaji instan.
- **Kebijakan Iklan:** **100% Tanpa Iklan (Zero Ads)** baik untuk pengguna Free maupun PRO demi menjaga integritas, keamanan, dan wibawa sebagai aplikasi finansial profesional.
- **Model Bisnis:** Freemium terjangkau: Free (kalkulasi penuh, slip standar, penyimpanan lokal), Pro **Rp5.000 per 30 hari** atau **Rp45.000 per tahun** (setara Rp3.750/bulan, hemat 25%) untuk Sinkronisasi Cloud Antar-Perangkat, 1-Klik Otomasi Absensi, dan Ekspor Rekap Excel/CSV berfitur filter tanggal.
- **Platform:** Web PWA (*Progressive Web App*) terpasang ke layar utama HP/desktop, jalan 100% offline, tanpa unduh APK berat.
- **Stack:** React 19 + Vite 8 (Rolldown) + Tailwind CSS 4 + Cloudflare Pages + Supabase, biaya operasional infrastruktur mendekati Rp0.

---

## 2. Penilaian Lanskap Produk & Keterkaitan dengan Kanak

Kalem dan Kanak bernaung di bawah payung ekosistem yang sama (**Kei Project**). Keduanya memiliki DNA yang saling melengkapi:

| Aspek | Kalem (Kalkulator Lembur) | Kanak (Aktivitas Anak) | Sinergi / Peluang Bersama |
| --- | --- | --- | --- |
| **Merek Payung** | Kei Project / Kei Pro | Kei Project / Kei Pro | Satu akun SSO (Google via Supabase) untuk semua produk Kei |
| **Target Pasar** | Pekerja, buruh pabrik, staf kantor (B2C) | Orang tua muda pekerja yang punya balita/anak (B2C) | Pengguna Kalem adalah calon target audiens alami bagi Kanak |
| **Model Bisnis** | Free + Pro Rp5k/bln & Rp45k/thn | Free + Pro Rp5k/bln & Rp45k/thn | Harga dan gateway pembayaran (DOKU/QRIS) seragam |
| **Kebijakan Iklan** | 100% Bebas Iklan | 100% Bebas Iklan | Menjaga reputasi profesional dan ramah keluarga |
| **Fondasi Visual** | Cyber Luxury (`#0A0A12`, Neon Cyan `#00F0FF`, Lime `#39FF14`) | Warm Dark (`#0A0A12`, Accent Purple `#8B7CFF`, Warm Pastels) | Berbagi warna dasar gelap `#0A0A12` dan komponen kartu terangkat |
| **Penyimpanan** | Local-First (LocalStorage) + Supabase Cloud Sync | Database-First (Supabase RLS) + Offline Cache PWA | Kalem sangat cepat & privat di lokal; Kanak aman tersinkron di cloud |

**Temuan Evaluasi SEO Kalem:**
- Kalem saat ini dibangun sebagai murni *Single Page Application* (SPA) React di Cloudflare Pages. Ini membuat kalkulasi di HP super cepat dan offline tanpa internet.
- Namun, crawler Google dan pratinjau tautan media sosial (WhatsApp/Facebook) melihat dokumen awal yang minim teks pra-render. Ke depan, menambahkan halaman statis SSG (seperti artikel panduan PP 35/2021) akan melipatgandakan pengunjung organik tanpa biaya iklan.

---

## 3. Masalah, Target Pengguna, Persona

### Masalah Utama
Karyawan lembur sering merasa nominal gaji akhir bulan tidak sesuai dengan jam kerja ekstra yang telah mereka luangkan, namun mereka tidak memiliki alat hitung independen yang tepercaya untuk membuktikannya.

**Pemicu Masalah:**
1. **Aturan Rumit:** PP No. 35 Tahun 2021 membedakan tarif lembur hari kerja biasa (1.5x di jam pertama, 2x di jam berikutnya) dengan hari libur mingguan/nasional (2x, 3x, hingga 4x dengan pembagian batas 5, 7, atau 8 jam). Karyawan awam bingung menghitungnya secara manual.
2. **Ketiadaan Bukti Tertulis:** Saat komplain ke bagian payroll/keuangan, karyawan hanya berbekal ingatan tanpa rekap tanggal, jam masuk-pulang, dan rincian lembur harian.
3. **Kalkulator Web Penuh Iklan:** Alat hitung yang beredar di Google dipenuhi iklan judi online dan pop-under yang merusak privasi saat dibuka di lingkungan kerja.

### Target Pengguna

| Segmen | Karakteristik | Kebutuhan Utama | Prioritas |
| --- | --- | --- | --- |
| **Buruh Pabrik & Manufaktur** | Shift bergilir, sistem 5 atau 6 hari kerja, lembur sering di akhir pekan/tanggal merah | Kepastian pengali resmi PP 35/2021, simpan bukti jam lembur harian | **Utama (Tier 1)** |
| **Karyawan Ritel, F&B & Logistik** | Upah harian / bulanan UMK, insentif kehadiran, lembur flat/borongan | Rekap kehadiran, hitung uang makan harian, cetak slip gaji gambar | **Utama (Tier 1)** |
| **Staf Administrasi & Payroll UMKM** | Mengelola slip gaji untuk 5–20 karyawan tanpa software HR mahal | Ekspor rekapitulasi ke Excel (.xlsx), slip gaji siap kirim via WhatsApp | **Sekunder (Pro)** |
| **Pekerja Lepas / Freelancer** | Tarif per jam bertingkat atau borongan | Fleksibilitas tarif kustom mandiri | **Tersier** |

### Persona Pengguna
- **Nama:** Mas Budi (29 tahun)
- **Profesi:** Operator Mesin Pabrik Tekstil di Cikarang (Sistem 6 Hari Kerja)
- **Kondisi:** Gaji pokok Rp5.200.000/bulan. Bulan ini ia lembur 18 jam di hari biasa dan 8 jam di hari Minggu (libur resmi).
- **Tujuan (Job to be done):** *"Saya ingin mencatat jam lembur tiap habis shift, tahu persis hak uang lembur yang wajib saya terima di tanggal 25, dan bisa mendownload slip gambar atau file Excel untuk dicocokkan dengan transferan kantor."*

---

## 4. Fitur dan Paket Free vs Pro

Kalem menerapkan prinsip: **Fitur kalkulasi hak dasar pekerja 100% gratis dan tanpa iklan.** Paket Pro menjual **efisiensi kerja, otomatisasi waktu, dan keamanan data permanen**.

| Fitur / Kemampuan | Akun Free (Gratis) | Member Kei Pro (Rp5.000) |
| --- | :---: | :---: |
| **Kalkulator Regulasi PP No. 35/2021** (5 & 6 Hari Kerja) | ✅ Penuh | ✅ Penuh |
| **Kalkulator Lembur Bertingkat Mandiri & Flat** | ✅ Penuh | ✅ Penuh |
| **Iklan Pop-up / Banner / Video** | ❌ **0% (Tanpa Iklan)** | ❌ **0% (Tanpa Iklan)** |
| **Penyimpanan Riwayat Lembur** | Browser Lokal (LocalStorage) | Cloud Database (Permanen & Anti-Hilang) |
| **Akses Lintas Perangkat (Multi-Device Sync)** | ❌ Terpisah per perangkat | ✅ HP & Laptop Tersinkron 1 Akun |
| **Generator Slip Gaji Gambar PNG (Retina 2x)** | ✅ Ada (Watermark Standar) | ✅ Desain Eksklusif / Custom Kop Perusahaan |
| **Ekspor Rekap Laporan Bulanan** | Teks WhatsApp | **File Excel (.xlsx) & CSV Rapi + Filter Tanggal** |
| **1-Klik Otomasi Jadwal Absensi Sebulan** | ❌ Manual isi per hari | ✅ **1 Klik Otomatis (21–25 Hari Hadir)** |
| **Komponen Tunjangan Kehadiran & Bonus Tambahan** | ✅ Input Manual | ✅ Tersimpan Otomatis ke Profil |
| **Audio Feedback Cyberpunk & Haptic Click** | ✅ Ada | ✅ Ada |

### Harga dan Penagihan

| Paket | Harga | Setara per Bulan | Keuntungan |
| --- | --- | --- | --- |
| **Kei Pro 30 Hari** | **Rp 5.000** | Rp 5.000 | Sangat murah (harga parkir motor), tanpa komitmen panjang |
| **Kei Pro 1 Tahun (365 Hari)** | **Rp 45.000** | **Rp 3.750** | Hemat 25%, sekali bayar untuk setahun kerja |

- **Metode Pembayaran:** QRIS Dinamis (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay) via Payment Gateway (DOKU / Midtrans).
- **MDR Terjangkau:** QRIS 0,7% (biaya hanya ~Rp35 untuk transaksi Rp5.000), margin bersih tetap maksimal.
- **Tanpa Auto-Debit:** Pembayaran tidak memotong saldo otomatis; user dikirimkan notifikasi 3 hari sebelum masa aktif berakhir.

---

### 4.1 Katalog Fitur & Engine Regulasi

#### A. Mode Kalkulasi Lembur
1. **Regulasi Resmi Pemerintah (PP 35/2021 Pasal 31):**
   - **Hari Kerja Biasa:** Jam ke-1 = 1.5× upah sejam. Jam ke-2 dan seterusnya = 2× upah sejam.
   - **Hari Libur Resmi / Istirahat Mingguan (5 Hari Kerja):**
     - Jam 1 s.d. 8 = 2× upah sejam.
     - Jam ke-9 = 3× upah sejam.
     - Jam ke-10 s.d. 12 = 4× upah sejam.
   - **Hari Libur Resmi / Istirahat Mingguan (6 Hari Kerja):**
     - Jam 1 s.d. 7 = 2× upah sejam (atau 5 jam pertama jika jatuh pada hari terpendek, misal Jumat/Sabtu).
     - Jam berikutnya = 3× upah sejam.
     - Jam ke-9/10 s.d. 12 = 4× upah sejam.
   - **Formula Dasar Upah Sejam:** `1 / 173 × (Gaji Pokok + Tunjangan Tetap)`.
2. **Lembur Bertingkat Mandiri (Kustom):**
   - Pengguna bebas memasukkan tarif kustom Jam ke-1, Jam ke-2, Jam ke-3, dst. untuk perusahaan dengan Perjanjian Kerja Bersama (PKB) khusus.
3. **Lembur Flat / Borongan:**
   - Opsi tarif flat per jam (dikali total jam) atau borongan per shift/panggilan.

#### B. Fitur Unggulan Slip Gaji & Rekap Absensi
- **Tunjangan Kehadiran Otomatis:** Perhitungan uang makan & transport berdasarkan kehadiran riil (`Hari Masuk × Tarif Harian`).
- **Tambahan & Bonus Lainnya:** Kolom untuk insentif performa, uang kerajinan, THR, atau bonus proyek.
- **Potongan Terintegrasi:** Simulasi potongan BPJS Ketenagakerjaan (3%), BPJS Kesehatan (1%), PPh 21, dan kasbon/pinjaman kantor.
- **Ekspor Excel Multi-Kolom:** Output file spreadsheet bersih berisi: No, Tanggal, Hari, Kategori, Jam Lembur, Pengali Efektif, Upah Lembur, Catatan, dan Baris Total Akumulasi.

---

## 5. Struktur Halaman (Sitemap)

Aplikasi Kalem dirancang sebagai PWA responsif dengan sistem navigasi tab bawah (Mobile Bottom Bar) dan navigasi atas (Desktop Header):

```
[KALEM PWA ROOT]
│
├── 1. Tab Kalkulator (/calculator)
│   ├── Pemilihan Skema: Bulanan vs Harian
│   ├── Pilihan Sistem Kerja: 5 Hari vs 6 Hari Kerja
│   ├── Input Gaji Pokok & Tunjangan Tetap (Auto-save)
│   ├── Tab Kategori: PP 35 / Bertingkat / Flat
│   ├── Rincian Hasil Interaktif & Bar Pengali Visual
│   └── Tombol Simpan ke Riwayat & Salin Teks WA
│
├── 2. Tab Riwayat Lembur (/history)
│   ├── Filter Rentang Tanggal Cut-off (Kalender vs Kustom)
│   ├── Kartu Ringkasan: Total Jam, Total Uang, Rata-rata/Hari
│   ├── Daftar Kartu Riwayat Harian (Bisa diedit / dihapus)
│   ├── Tombol Ekspor Excel (.xlsx / .csv) [PRO]
│   └── Tombol Bersihkan / Backup Data
│
├── 3. Tab Hitung Gaji & Slip (/salary)
│   ├── Section 1: Komponen Penghasilan Dasar & Tunjangan Tidak Tetap
│   │   ├── Gaji Pokok / Upah Harian
│   │   ├── Rekap Absensi (Hadir, Sakit, Izin, Cuti) + Tombol Otomasi Bulan Ini [PRO]
│   │   ├── Tunjangan Kehadiran / Uang Harian (Preset 15k, 20k, 25k, 50k)
│   │   └── Tambahan & Bonus Lainnya
│   ├── Section 2: Akumulasi Upah Lembur (Otomatis dari Riwayat vs Manual)
│   ├── Section 3: Potongan Gaji (BPJS, PPh 21, Kasbon)
│   ├── Ringkasan Kanan: Take Home Pay (Net)
│   └── Aksi: Unduh Slip PNG (2x Retina), Kirim WhatsApp, Salin Teks
│
├── 4. Tab Kalender Absensi (/calendar)
│   ├── Grid Kalender Bulanan Interaktif
│   ├── Penanda Status: Hadir, Lembur, Libur Off, Sakit, Izin, Cuti
│   └── Modal Catat Kehadiran Cepat
│
└── 5. Modal & Utilitas
    ├── Modal Upgrade Kei Pro (QRIS Payment)
    ├── Modal Profil Karyawan & Pengaturan Perusahaan
    ├── Modal Ekspor Excel Berfilter Tanggal
    └── Modal Onboarding Pengguna Baru
```

---

## 6. Alur Pengguna (User Flow)

### Alur 1: Hitung & Simpan Lembur Harian (30 Detik)
1. Buka Kalem dari Homescreen HP (PWA).
2. Masukkan jam lembur (misal: 3.5 jam di hari kerja).
3. Aplikasi langsung menampilkan nominal upah (misal: Rp121.387).
4. Klik **"Simpan ke Riwayat"** $\rightarrow$ Tersimpan otomatis ke riwayat & kalender.

### Alur 2: Rekap Akhir Bulan & Cetak Slip Gaji (1 Menit)
1. Masuk ke tab **Hitung Gaji**.
2. Pilih periode cut-off (misal: 1–30 November).
3. Lembur ditarik otomatis dari riwayat beserta total jamnya.
4. Klik **"Slip PNG"** $\rightarrow$ Slip beresolusi tinggi langsung terunduh dan siap dikirim via WhatsApp ke HRD/keluarga.

### Alur 3: Ekspor Excel Laporan Lembur (Khusus PRO)
1. Buka tab **Riwayat Lembur** $\rightarrow$ Klik tombol **"Ekspor Excel"**.
2. Pilih rentang tanggal (Semua Riwayat atau Kustom Dari–Sampai).
3. Klik **"Download Excel (.xlsx)"** $\rightarrow$ File spreadsheet profesional langsung tersimpan di HP/laptop.

---

## 7. Palet Warna Final & Gaya Visual

Kalem mengusung tema **Cyber Luxury Dark-First** yang memadukan estetika modern ketepatan instrumen digital dengan kenyamanan mata saat digunakan di tempat kerja temaram/malam hari.

### Token Warna Resmi Kalem

| Token CSS | Kode Hex | Peruntukan di Aplikasi | Rasio Kontras WCAG |
| --- | --- | --- | :---: |
| `--bg-base` | `#0A0A12` | Latar belakang kanvas utama (Near-black kebiruan) | - |
| `--surface-card` | `#12121F` | Kartu utama, panel instrumen kalkulator | - |
| `--surface-elevated`| `#1A1A2E` | Input field, panel aktif, dropdown | - |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Garis batas antar komponen | - |
| `--text-primary` | `#FFFFFF` / `#E4E1ED` | Teks judul, angka utama | 18.5 : 1 (Lolos AAA) |
| `--text-secondary` | `#b9cacb` / `#7A7A99` | Label keterangan, satuan jam, placeholder | 7.8 : 1 (Lolos AA) |
| `--accent-cyan` | `#00F0FF` | Tombol utama, indikator lembur, garis aktif | 13.2 : 1 (Lolos AAA) |
| `--accent-magenta`| `#FF2BD6` | Lencana PRO, tombol aksi sekunder, highlight cut-off | 6.5 : 1 (Lolos AA) |
| `--accent-lime` | `#39FF14` | Take Home Pay, pendapatan kotor, status hadir | 14.1 : 1 (Lolos AAA) |
| `--accent-gold` | `#FFE600` | Tombol 1-Klik Otomasi, peringatan jam bertingkat | 13.9 : 1 (Lolos AAA) |
| `--accent-orange`| `#FF8C00` | Hari Terpendek (6 hari kerja), peringatan limit | 8.2 : 1 (Lolos AA) |
| `--deduction-red`| `#ffb4ab` / `#F87171` | Potongan BPJS, kasbon, pajak PPh 21 | 8.9 : 1 (Lolos AA) |

### Mode Terang (Light Mode Fallback)
Kalem juga mendukung **Light Mode** untuk lingkungan perkantoran terang benderang:
- Latar Belakang: `#F8FAFC` (Slate cerah)
- Kartu: `#FFFFFF` dengan bayangan halus
- Aksen Cyan bergeser ke: `#0284C7` (Sky Blue formal)
- Aksen Lime bergeser ke: `#16A34A` (Emerald Green)

### Tipografi
- **Headings & Judul:** `'Space Grotesk'`, sans-serif (Tegas, berkarakter industri modern).
- **Body & Label:** `'Inter'`, system-ui, sans-serif (Sangat mudah dibaca di layar kecil).
- **Angka Nominal & Jam:** `'JetBrains Mono'`, monospace (Setiap digit memiliki lebar identik sehingga tabel angka tidak bergeser).

---

## 8. Skema Database Supabase & Sinkronisasi Lokal

Kalem menerapkan prinsip **Local-First Architecture**: pengguna gratis dapat menggunakan aplikasi secara instan tanpa login. Saat upgrade ke Kei Pro, data disinkronkan ke cloud Supabase secara aman.

### Skema Tabel Supabase (PostgreSQL)

```sql
-- 1. Tabel Profil Pengguna & Status Langganan
create table public.profiles (
  id uuid references auth.users primary key,
  nama_karyawan text,
  nama_perusahaan text,
  mode_gaji text default 'bulanan', -- 'bulanan' | 'harian'
  sistem_kerja text default '5_hari',  -- '5_hari' | '6_hari'
  default_gaji_pokok numeric default 0,
  default_tunjangan numeric default 0,
  default_upah_harian numeric default 0,
  is_pro boolean default false,
  pro_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Tabel Riwayat Lembur Karyawan
create table public.overtime_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  tanggal date not null,
  hari text not null,
  jenis_hari text not null, -- 'kerja' | 'libur'
  skema text not null,      -- 'pp35' | 'bertingkat' | 'flat'
  jam_lembur numeric(4,2) not null,
  total_lembur numeric(12,2) not null,
  catatan text,
  created_at timestamptz default now()
);

-- 3. Tabel Catatan Absensi Bulanan
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  tanggal date not null,
  status text not null,     -- 'masuk' | 'libur_off' | 'sakit' | 'izin' | 'cuti'
  jam_kerja_reguler numeric(4,2) default 8,
  catatan text,
  created_at timestamptz default now(),
  unique(user_id, tanggal)
);

-- Row Level Security (RLS) Wajib Aktif
alter table public.profiles enable row level security;
alter table public.overtime_entries enable row level security;
alter table public.attendance_records enable row level security;

create policy "User can manage their own profile"
  on public.profiles for all using (auth.uid() = id);

create policy "User can manage their own overtime entries"
  on public.overtime_entries for all using (auth.uid() = user_id);

create policy "User can manage their own attendance"
  on public.attendance_records for all using (auth.uid() = user_id);
```

---

## 9. Arsitektur Teknis dan Pembayaran

### Evaluasi Arsitektur Kalem Saat Ini
Kalem dibangun di atas fondasi teknologi paling modern per akhir 2026:
- **Core Runtime & Bundler:** **React 19.0.1** + **Vite 8.3.0** (Engine Rolldown ultra-cepat) + **TypeScript 7**.
- **Styling Engine:** **Tailwind CSS 4.3.3** via plugin `@tailwindcss/vite` (Tanpa file config lama, kompilasi instan).
- **Hosting & CDN:** **Cloudflare Pages** (`kalem.pages.dev`) dengan edge network global berlatensi <20ms di Indonesia.
- **Client Offline Storage:** LocalStorage terenkripsi ringan + Service Worker PWA.
- **Export Engines:** HTML5 2D Canvas API (Render gambar slip 2x retina) + `xlsx` v0.18.5 (Pembuat file biner Excel native).

```
┌────────────────────────────────────────────────────────┐
│                   PENGGUNA (HP / DESKTOP)               │
└───────────────────────────┬────────────────────────────┘
                            │
               PWA Offline / Cloudflare CDN
                            │
┌───────────────────────────▼────────────────────────────┐
│                    KALEM FRONT-END                     │
│  - React 19 + TypeScript + Tailwind 4                  │
│  - Engine Perhitungan PP 35/2021                       │
│  - Canvas Generator (PNG Slip)                         │
│  - SheetJS Exporter (.xlsx / .csv)                     │
│  - Local-First Cache (LocalStorage)                    │
└───────────────────────────┬────────────────────────────┘
                            │
                 Auth & Sinkronisasi Data (PRO)
                            │
┌───────────────────────────▼────────────────────────────┐
│                  SUPABASE CLOUD BACKEND                │
│  - Auth (Google SSO & Magic Link)                      │
│  - Postgres DB with Row-Level Security (RLS)           │
│  - Edge Functions (Verifikasi Webhook QRIS)            │
└────────────────────────────────────────────────────────┘
```

### Integrasi Pembayaran QRIS (Kei Pro)
- **Mitra Gateway:** DOKU / Midtrans (QRIS Dinamis).
- **Alur Transaksi:**
  1. Pengguna klik **"Upgrade Kei Pro Rp 5.000"**.
  2. Front-end memanggil Edge Function `create-payment-order`.
  3. Layar memunculkan QRIS dinamis di dalam modal.
  4. Pengguna memindai QRIS via m-Banking atau E-Wallet.
  5. Webhook gateway mengirim sinyal ke Supabase Edge Function $\rightarrow$ Status akun otomatis berubah menjadi `is_pro: true` dan masa aktif bertambah 30 hari atau 365 hari.

---

## 10. Regulasi Ketenagakerjaan & Dasar Hukum

Semua formula perhitungan Kalem merujuk langsung pada naskah hukum resmi Republik Indonesia:
1. **Undang-Undang No. 11 Tahun 2020 tentang Cipta Kerja** kluster Ketenagakerjaan.
2. **Peraturan Pemerintah (PP) No. 35 Tahun 2021**:
   - **Pasal 26 – 29:** Ketentuan waktu kerja lembur (maksimal 4 jam sehari dan 18 jam seminggu di luar hari libur).
   - **Pasal 31:** Rincian tabel pengali upah lembur per jam untuk hari kerja biasa dan hari libur resmi.
   - **Pasal 32:** Dasar perhitungan upah per jam adalah `1/173 × Upah Sebulan` (Gaji Pokok + Tunjangan Tetap). Jika komponen terdiri dari upah pokok dan tunjangan tidak tetap, upah pokok tidak boleh kurang dari 75% total upah.

---

## 11. Roadmap, Metrik, dan Rencana Rilis

### Fase Pengembangan (4 Sprint)
1. **Sprint 1 (Fondasi & Kepatuhan - Selesai):** Engine PP 35/2021, input bulanan/harian, 3 skema lembur, slip canvas PNG Retina, bebas iklan 100%.
2. **Sprint 2 (Produktivitas & Fitur PRO - Selesai):** Ekspor Excel/CSV berfilter tanggal kustom, 1-klik otomasi absensi sebulan, tunjangan kehadiran & bonus tambahan.
3. **Sprint 3 (Payment Gateway & Cloud Sync - Sedang Berjalan):** Integrasi DOKU QRIS checkout di Supabase Edge Function, multi-device sync.
4. **Sprint 4 (SEO & Pertumbuhan Publik):** Pembuatan sub-halaman panduan hukum statis untuk menangkap traffic pencarian Google.

### Metrik Keberhasilan (KPI)
- **Kecepatan Hitung:** < 5 detik dari buka aplikasi hingga hasil lembur tampil.
- **Rasio Konversi PRO:** 3% - 5% dari pengguna aktif bulanan mengupgrade ke Rp5.000/bulan.
- **Ketepatan Rumus:** 100% lulus 13/13 tes otomatis verifikasi hukum ketenagakerjaan.

---

## 12. Panduan Vibe Coding dengan Antigravity

Untuk mempertahankan konsistensi kode saat mengembangkan fitur lanjutan Kalem menggunakan agen Antigravity:

### Isi `AGENTS.md` untuk Kalem
```markdown
# Kalem (Kalkulator Lembur) - Aturan Proyek
- UI, pesan kesalahan, dan teks laporan dalam Bahasa Indonesia yang profesional dan ramah pekerja.
- Nama variabel, fungsi logika, dan commit git dalam Bahasa Inggris.
- Stack: React 19, TypeScript strict, Vite 8 (Rolldown), Tailwind CSS 4, Cloudflare Pages.
- Sumber Kebenaran: docs/PRD-Kalem.md dan regulasi PP No. 35 Tahun 2021.
- Kebijakan Iklan: Zero Ads (100% tanpa iklan).
- Token Warna: Gunakan warna resmi di src/index.css (#0A0A12, #00F0FF, #FF2BD6, #39FF14, #FFE600).
- Setiap perubahan perhitungan wajib menjalankan `bun test` dan memverifikasi 13 unit tests lolos.
- Commit git dilakukan secara berkala dengan deskripsi yang jelas sebelum push ke origin.
```
