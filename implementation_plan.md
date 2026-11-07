# Pembaruan Kategori Hari Lembur: Hari Biasa & Hari Libur dengan Deteksi Otomatis

Penyederhanaan pemilihan kategori hari lembur pada kalkulator dari 3 tombol (`Hari Biasa`, `Sabtu`, `Minggu`) menjadi 2 tombol presisi (`Hari Kerja Biasa` dan `Hari Istirahat / Libur`), dilengkapi deteksi otomatis dari tanggal yang dipilih di kalender serta kontrol manual penuh.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi Anda, kategori hari lembur disederhanakan menjadi 2 pilihan utama yang selaras dengan Pasal 31 PP No. 35 Tahun 2021, dengan perilaku cerdas otomatis:
> 1. **Deteksi Otomatis Tanggal**: Ketika tanggal dipilih pada kalender, sistem mendeteksi hari:
>    - Jika **Senin – Jumat**: Otomatis memilih **Hari Kerja Biasa**.
>    - Jika **Sabtu / Minggu**: Otomatis memilih **Hari Istirahat / Libur**.
> 2. **Fleksibilitas Override Manual**: Pengguna tetap dapat mengklik tombol kapan saja (contohnya jika hari Rabu adalah tanggal merah/libur nasional, pengguna cukup mengklik tombol **Hari Istirahat / Libur**).

---

## 1. Overview & Core Concept

- **Apa yang Berubah**:
  - Mengganti grid 3 tombol yang redundan (`Hari Biasa`, `Sabtu`, `Minggu`) menjadi 2 tombol yang intuitif dan berstandar regulasi:
    1. **Hari Kerja Biasa** (Tarif standar: 1,5× jam ke-1, 2× jam berikutnya).
    2. **Hari Libur / Istirahat** (Tarif lembur akhir pekan/tanggal merah: 2× upah jam ke-1 s.d. 8, 3× jam ke-9, 4× jam ke-10+).
  - Menyederhanakan checkbox tambahan yang sebelumnya membingungkan agar alur kerja pengguna lebih cepat dan minim kesalahan entri.
- **Nilai Tambah (User Value)**:
  - Mengurangi jumlah klik (*fewer clicks*): Pengguna yang memilih tanggal di akhir pekan tidak perlu lagi memikirkan tombol mana yang harus ditekan karena sistem langsung menyesuaikannya.
  - Sesuai dengan pembagian rumus baku ketenagakerjaan Indonesia.

---

## 2. User Experience & Visual Design

### Alur Interaksi Pengguna (User Flow):
1. **Pemilihan Tanggal**:
   - Pengguna memilih tanggal lembur melalui input tanggal (`<input type="date">`).
   - Handler otomatis membaca hari (`new Date(tanggal).getDay()`).
   - Jika hari bernilai `0` (Minggu) atau `6` (Sabtu), kategori langsung beralih ke mode **Hari Libur / Istirahat** dengan animasi transisi halus.
   - Jika hari bernilai `1–5` (Senin–Jumat), kategori otomatis beralih ke mode **Hari Kerja Biasa**.
2. **Koreksi Manual (Manual Override)**:
   - Jika pengguna lembur di hari kerja biasa yang bertepatan dengan Hari Libur Nasional (misal Idul Fitri hari Kamis), pengguna cukup mengklik tombol **Hari Libur / Istirahat**.
   - Tombol aktif menampilkan *glow neon cyan* / *magenta* khas tema cyber-industrial Kahfi Engine.

### Visual Styling & Component Layout:
- Grid 2 kolom seimbang (`grid-cols-2 gap-2`):
  - Tombol 1: **Hari Kerja Biasa** (Aksen Cyan `#00F0FF` saat aktif).
  - Tombol 2: **Hari Libur / Istirahat** (Aksen Magenta `#FF2BD6` / Amber saat aktif, mencakup istirahat mingguan & tanggal merah).
- Label penjelas kontekstual di bawah tombol menampilkan ringkasan pengali aktif secara transparan.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Menggabungkan Sabtu dan Minggu ke dalam satu kategori "Hari Libur / Istirahat"**
  - *Alasan*: Secara hukum ketenagakerjaan PP 35/2021 Pasal 31 ayat (2) dan (3), lembur pada hari Sabtu (untuk sistem 5 hari kerja) dan hari Minggu menggunakan skema pengali yang identik. Memisahkan Sabtu dan Minggu ke dalam 2 tombol berbeda sebelumnya hanya menambah kebingungan tanpa perbedaan matematis.
  - *Trade-off*: Sistem 6 hari kerja tetap diakomodasi dengan opsi "Hari Terpendek" jika berlaku.

- **Keputusan 2: Deteksi Otomatis Non-Destruktif**
  - *Alasan*: Deteksi otomatis dipicu saat input tanggal berubah (`onChange`), tetapi tidak mengunci (*disable*) tombol. Hal ini memberikan kenyamanan otomatisasi tanpa membatasi kebebasan pengguna untuk mengatur hari libur nasional di hari biasa.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 Input Tanggal (Datepicker)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ onChange(e.target.value)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Automatic Day-of-Week Engine                │
│       day = new Date(selectedDate).getDay()                 │
│       • day === 0 || 6 ──► setJenisHari('libur')            │
│       • day === 1..5   ──► setJenisHari('biasa')            │
└──────────────────────────────┬──────────────────────────────┘
                               │ State Sync
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           Dual Category Selector (Manual Toggle)            │
│  [ Hari Kerja Biasa ]         [ Hari Libur / Istirahat ]    │
│  (1.5x upah sejam awal)       (2x s.d. 4x upah bertingkat)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│       Labor Engine PP 35/2021 (src/utils/calculations.ts)    │
│       Perhitungan Upah Lembur & Hourly Breakdown Transparan  │
└─────────────────────────────────────────────────────────────┘
```

### Pemetaan State & Kompatibilitas Data:
- `jenisHari` pada komponen `OvertimeCalculatorScreen.tsx`:
  - `'biasa'`: Hari kerja biasa.
  - `'libur'` (atau pemetaan backward-compatible dengan riwayat sebelumnya): Hari istirahat mingguan / libur resmi.
- Perhitungan pada `calculateOvertimePay`: Seluruh fungsi perhitungan yang sudah lolos 9 unit test tetap terjaga 100% tanpa mengubah keakuratan rumus hukum $1/173 \times \text{upah sebulan}$.
