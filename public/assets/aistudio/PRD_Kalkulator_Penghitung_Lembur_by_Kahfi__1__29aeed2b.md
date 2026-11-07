# PRD: Kalkulator Penghitung Lembur by Kahfi

**Versi:** 1.0 | **Pemilik:** Kahfi | **Status:** Draft | **Tanggal:** 4 November 2026

## 1. Ringkasan Produk

Kalkulator Penghitung Lembur by Kahfi adalah web statis satu halaman untuk menghitung upah lembur pekerja di Indonesia, khusus **lembur hari Sabtu dan Minggu**, berdasarkan PP No. 35 Tahun 2021. Pengguna memasukkan gaji, sistem hari kerja (5 atau 6 hari), hari lembur, dan jumlah jam. Hasilnya berupa total upah lembur beserta rincian per jam yang transparan. Tampilan bertema dark dengan aksen neon, dan di bawah hasil selalu ada disclaimer cara hitung.

## 2. Latar Belakang dan Masalah

- Aturan pengali lembur (1,5x, 2x, 3x, 4x) membingungkan karena berbeda untuk 5 dan 6 hari kerja.
- Pekerja dan staf HR sering menghitung manual di spreadsheet sehingga rawan salah.
- Belum ada kalkulator ringan yang menampilkan rincian per jam dan menjelaskan dasar hitungannya.

## 3. Tujuan dan Metrik Keberhasilan

| Tujuan | Metrik |
| --- | --- |
| Hasil hitung akurat sesuai aturan | 100% kasus uji pada bagian 9 lulus |
| Cepat dipakai | Hasil muncul kurang dari 3 detik setelah input terisi |
| Transparan | Setiap hasil punya rincian per jam dan rumus yang terlihat |
| Nyaman di HP | Tampilan rapi di layar 360 px ke atas |
| Ringan | Skor Lighthouse performa di atas 90 |

## 4. Target Pengguna

1. **Pekerja/karyawan** yang ingin mengecek apakah upah lembur akhir pekan sudah sesuai.
2. **Staf HR/Payroll** yang butuh estimasi cepat.
3. **Pemilik usaha kecil** yang ingin menghitung lembur karyawan.

## 5. Ruang Lingkup

**Termasuk (v1.0):**

- Lembur hari Sabtu dan Minggu.
- Pilihan sistem kerja 5 hari atau 6 hari kerja (40 jam/minggu).
- Opsi hari libur resmi (checkbox).
- Perhitungan dengan rumus upah sejam = 1/173 x upah sebulan.
- Rincian per jam, total, tombol salin hasil, dan disclaimer.

**Tidak termasuk (v1.0):**

- Lembur hari kerja biasa Senin sampai Jumat.
- Perhitungan pajak (PPh 21), BPJS, dan potongan lain.
- Login, penyimpanan data, dan riwayat.
- Sektor dengan ketentuan lembur khusus.

## 6. Aturan Bisnis Perhitungan

### 6.1 Upah sejam

**Upah sejam = 1/173 x (gaji pokok + tunjangan tetap)**

Angka 173 berasal dari 40 jam x 52 minggu / 12 bulan.

Contoh: Rp6.000.000 / 173 = Rp34.682 per jam (dibulatkan).

### 6.2 Tabel pengali

| Sistem kerja | Hari | Jam ke-1 s.d. batas | Jam berikutnya |
| --- | --- | --- | --- |
| 5 hari kerja | Sabtu dan Minggu (hari istirahat/libur) | Jam 1-8: **2x** | Jam 9: **3x**; jam 10-12: **4x** |
| 6 hari kerja | Minggu (hari istirahat mingguan) | Jam 1-7: **2x** | Jam 8: **3x**; jam 9-11: **4x** |
| 6 hari kerja | Sabtu (hari kerja biasa) | Jam 1: **1,5x** | Jam 2 dst: **2x** |
| 6 hari kerja | Libur resmi jatuh di hari kerja terpendek | Jam 1-5: **2x** | Jam 6: **3x**; jam 7-9: **4x** |

> **Catatan keputusan:** Pada 6 hari kerja, Sabtu diperlakukan sebagai hari kerja biasa (lembur setelah jam kerja normal). Aturan ini perlu diverifikasi kembali dengan teks resmi PP 35/2021 atau Disnaker sebelum rilis.

### 6.3 Algoritma

1. Hitung upah sejam = gaji / 173.
2. Ambil tabel pengali sesuai sistem kerja dan jenis hari.
3. Untuk setiap jam lembur ke-n, tentukan pengalinya, lalu kalikan dengan upah sejam.
4. Jumlahkan semua jam menjadi total upah lembur.
5. Jam desimal (misal 2,5) dihitung proporsional untuk sisa pecahan jam terakhir.

### 6.4 Contoh hitung

- Gaji Rp6.000.000, 5 hari kerja, lembur Minggu 9 jam: (8 x 2 + 1 x 3) x 34.682 = 19 x 34.682 = **sekitar Rp658.958**.
- Gaji Rp6.000.000, 6 hari kerja, lembur Sabtu 3 jam: (1,5 + 2 + 2) x 34.682 = 5,5 x 34.682 = **sekitar Rp190.751**.

## 7. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F1 | Input gaji pokok dan tunjangan tetap (format Rupiah otomatis) | Wajib |
| F2 | Pilih sistem kerja: 5 hari atau 6 hari | Wajib |
| F3 | Pilih hari lembur: Sabtu atau Minggu, plus checkbox libur resmi | Wajib |
| F4 | Input jumlah jam lembur (angka desimal, kelipatan 0,5) | Wajib |
| F5 | Tombol Hitung dan hasil total upah lembur | Wajib |
| F6 | Tabel rincian per jam: jam ke-n, pengali, nominal | Wajib |
| F7 | Menampilkan upah sejam dan rumus yang dipakai | Wajib |
| F8 | Disclaimer cara hitung di bawah hasil | Wajib |
| F9 | Validasi input (gaji kosong, jam melebihi 12, nilai negatif) | Wajib |
| F10 | Tombol salin hasil dan tombol reset | Sebaiknya |
| F11 | Tambah beberapa hari lembur sekaligus (Sabtu + Minggu) dan jumlahkan total | Sebaiknya |
| F12 | Bagikan hasil via WhatsApp | Opsional |

## 8. Kebutuhan Non-Fungsional

- **Privasi:** semua perhitungan di browser, tidak ada data dikirim ke server.
- **Performa:** satu file HTML/CSS/JS, tanpa framework berat.
- **Responsif:** mobile-first.
- **Aksesibilitas:** kontras teks minimal 4,5:1 meski bertema neon, label input jelas, bisa dioperasikan dengan keyboard.
- **Hosting:** GitHub Pages atau Vercel.
- **Bahasa:** Indonesia.

## 9. Kasus Uji (Acceptance Criteria)

| # | Input | Hasil yang diharapkan |
| --- | --- | --- |
| 1 | Rp6.000.000, 5 hari, Minggu, 8 jam | 16 x upah sejam, sekitar Rp554.913 |
| 2 | Rp6.000.000, 5 hari, Sabtu, 9 jam | 19 x upah sejam, sekitar Rp658.958 |
| 3 | Rp6.000.000, 6 hari, Minggu, 8 jam | (7 x 2 + 3) = 17 x upah sejam, sekitar Rp589.594 |
| 4 | Rp6.000.000, 6 hari, Sabtu, 3 jam | 5,5 x upah sejam, sekitar Rp190.751 |
| 5 | Gaji kosong atau 0 | Pesan error, tidak ada hasil |
| 6 | Jam lebih dari 12 | Peringatan batas jam, hasil tetap dihitung sesuai tabel |
| 7 | Jam desimal 2,5 | Setengah jam terakhir dihitung 0,5 x pengali |

## 10. Desain dan UX

### 10.1 Judul

**"Kalkulator Penghitung Lembur"** dengan sub-judul **"by Kahfi"** di bawahnya. Judul memakai efek glow neon (text-shadow berlapis) dengan animasi kedip halus.

### 10.2 Tema dark neon

| Elemen | Warna |
| --- | --- |
| Latar halaman | #0A0A12 (hitam kebiruan) dengan gradient radial ungu gelap samar |
| Kartu/panel | #12121F, border 1 px neon dengan glow |
| Aksen utama | Cyan neon #00F0FF |
| Aksen kedua | Magenta neon #FF2BD6 |
| Aksen sukses/hasil | Hijau neon #39FF14 |
| Peringatan | Kuning neon #FFE600 |
| Teks utama | #E8E8F5; teks sekunder #9A9AB8 |

- **Font:** judul Orbitron atau Rajdhani; isi Inter atau Poppins; fallback sans-serif.
- **Input:** latar gelap, border redup, saat fokus berpendar cyan.
- **Tombol Hitung:** gradient cyan ke magenta, glow saat hover, efek tekan.
- **Hasil:** angka total besar berwarna hijau neon dengan animasi hitung naik (count-up).
- **Tabel rincian:** baris bergantian gelap, kolom pengali diberi warna sesuai level (2x cyan, 3x kuning, 4x magenta).
- **Disclaimer:** kotak dengan border kuning neon putus-putus dan ikon peringatan.
- Hormati `prefers-reduced-motion`: animasi glow dan count-up dimatikan.

### 10.3 Tata letak (mobile-first)

1. Header: judul neon + "by Kahfi".
2. Kartu Input: gaji, tunjangan tetap, sistem kerja (toggle 5/6 hari), hari (Sabtu/Minggu), libur resmi, jam lembur.
3. Tombol **Hitung Lembur**.
4. Kartu Hasil: upah sejam, total lembur, tabel rincian, tombol salin.
5. Kartu Disclaimer.
6. Footer: "Dibuat oleh Kahfi".

### 10.4 Alur pengguna

Buka halaman, isi gaji, pilih sistem kerja dan hari, isi jam, tekan Hitung, baca hasil dan rincian, baca disclaimer, salin atau reset.

## 11. Teks Disclaimer

> **Disclaimer Cara Hitung**
>
> 1. Perhitungan di kalkulator ini merupakan **estimasi** berdasarkan PP No. 35 Tahun 2021 dan **bukan nasihat hukum**.
> 2. Upah sejam dihitung dengan rumus **1/173 x upah sebulan** (gaji pokok + tunjangan tetap). Komponen tidak tetap (bonus, uang makan harian, dll.) tidak dihitung.
> 3. Pengali lembur mengikuti sistem kerja yang dipilih (5 atau 6 hari kerja, 40 jam seminggu). Sektor atau jabatan tertentu dapat memiliki aturan berbeda.
> 4. Hasil adalah nilai kotor sebelum potongan pajak (PPh 21), BPJS, atau potongan lain, dan dapat dibulatkan.
> 5. Peraturan perusahaan atau perjanjian kerja bersama bisa lebih menguntungkan pekerja, tetapi tidak boleh lebih rendah dari ketentuan pemerintah.
> 6. Untuk sengketa atau kepastian hukum, konsultasikan dengan Disnaker, serikat pekerja, atau konsultan hukum. Data yang Anda masukkan tidak disimpan dan diproses hanya di perangkat Anda.

## 12. Rekomendasi Teknis

- **Stack:** HTML + CSS + JavaScript murni dalam satu file (index.html), tanpa backend.
- **Struktur kode:** fungsi `hitungLembur(gaji, sistemKerja, hari, libur, jam)` terpisah dari UI agar mudah diuji.
- **Pengali sebagai data:** simpan tabel pengali dalam objek konfigurasi supaya mudah diperbarui jika aturan berubah.
- **Deploy:** GitHub Pages atau Vercel.
- **Pengujian:** jalankan 7 kasus uji bagian 9 secara manual atau dengan skrip kecil.

## 13. Risiko dan Asumsi

| Risiko/Asumsi | Mitigasi |
| --- | --- |
| Interpretasi aturan Sabtu pada 6 hari kerja bisa berbeda | Verifikasi ke teks resmi/Disnaker; tampilkan catatan di disclaimer |
| Pengguna menganggap hasil sebagai angka pasti | Disclaimer jelas dan terlihat di bawah hasil |
| Aturan berubah | Pengali disimpan sebagai konfigurasi, tampilkan tanggal versi aturan |
| Neon berlebihan mengganggu keterbacaan | Uji kontras dan sediakan reduced-motion |

## 14. Rencana Rilis

1. **Hari 1:** finalkan aturan hitung dan kasus uji.
2. **Hari 2:** bangun UI dark neon dan logika hitung.
3. **Hari 3:** uji kasus, uji mobile, perbaiki, lalu deploy.
4. **Setelah rilis:** tambah lembur hari kerja biasa, mode multi-hari, dan ekspor PDF.

# Pembaruan v1.1 (5 November 2026)

Bagian ini menambah dan menggantikan sebagian isi v1.0. Poin yang berubah dari v1.0: lembur hari kerja biasa, penyimpanan data, dan riwayat sekarang **masuk ruang lingkup** (sebelumnya tidak termasuk).

## A. Ringkasan Perubahan

1. Navigasi tab dan **dashboard** ringkasan lembur.
2. Fitur **hitung gaji harian dan bulanan** (termasuk lembur).
3. **Penyimpanan lokal** di browser, data tidak hilang saat keluar masuk, dan bisa dihapus sendiri oleh pengguna.
4. **Ekspor dan impor** data (Excel, CSV, JSON).
5. **Simpan hasil sebagai gambar (PNG)** sebagai bukti untuk atasan, HR, atau pihak lain.
6. Penjelasan **jam kerja dan jam istirahat** menurut PP No. 35 Tahun 2021 serta **tautan sumber resmi** di dalam web.
7. Lembur hari kerja biasa (Senin sampai Jumat) resmi menjadi bagian produk.

## B. Penjelasan Jam Kerja dan Sumber Hukum

### B.1 Teks penjelasan yang ditampilkan di web

> **Jam kerja menurut PP No. 35 Tahun 2021**
>
> Pasal 21 ayat (2) menyebutkan waktu kerja meliputi:
>
> 1. **7 jam sehari dan 40 jam seminggu** untuk **6 hari kerja** dalam 1 minggu; atau
> 2. **8 jam sehari dan 40 jam seminggu** untuk **5 hari kerja** dalam 1 minggu.
>
> Aturan ini wajib dipatuhi perusahaan swasta maupun instansi lain yang mempekerjakan buruh atau karyawan, kecuali sektor usaha tertentu yang memiliki karakteristik waktu kerja khusus (misalnya migas, pertambangan, atau maritim).
>
> **Jam istirahat tidak dihitung sebagai jam kerja.** Jadi, pada 5 hari kerja, lembur dihitung setelah 8 jam kerja efektif, dan pada 6 hari kerja setelah 7 jam kerja efektif.

Catatan: kutipan pasal di atas berasal dari rujukan yang diberikan pemilik produk. Sebelum rilis, cocokkan bunyinya dengan salinan resmi di tautan sumber pada B.2.

### B.2 Tautan sumber di dalam web

Sumber ditampilkan sebagai tautan yang bisa diklik (buka di tab baru dengan `rel="noopener noreferrer"`) di tiga tempat: tab Info dan Sumber, kotak disclaimer, dan footer.

| Sumber | Tautan |
| --- | --- |
| PP No. 35 Tahun 2021, JDIH BPK | https://peraturan.bpk.go.id/Details/161904/pp-no-35-tahun-2021 |
| PP No. 35 Tahun 2021, JDIH Kemnaker | https://jdih.kemnaker.go.id/peraturan/detail/1723/peraturan-pemerintah-nomor-35-tahun-2021 |

Setiap tautan diberi label nama sumber, nomor peraturan, dan tanggal terakhir dicek (misalnya "dicek 5 Nov 2026"). Tautan diperiksa ulang setiap rilis karena alamat situs pemerintah bisa berubah.

## C. Navigasi dan Dashboard

**Tab bar** (menu tab) berada di bawah layar pada HP dan di atas pada desktop, dengan label dan ikon. Memakai `role="tablist"` agar bisa dipakai dengan keyboard dan pembaca layar.

| Tab | Isi |
| --- | --- |
| Dashboard | Ringkasan bulan terpilih |
| Hitung Lembur | Kalkulator lembur (Sabtu, Minggu, hari kerja biasa) |
| Hitung Gaji | Mode harian dan mode bulanan |
| Riwayat | Daftar entri tersimpan, hapus, ekspor, impor |
| Info dan Sumber | Penjelasan jam kerja, rumus, disclaimer, tautan sumber |

**Widget dashboard** (dengan pemilih bulan dan tahun):

- Total upah lembur bulan ini (angka besar hijau neon).
- Total jam lembur dan jumlah hari lembur.
- Rata-rata lembur per hari dan perbandingan dengan bulan lalu.
- Grafik batang jam atau nominal lembur per minggu atau per hari (SVG sendiri, tanpa library berat).
- Estimasi total gaji bulan ini (gaji tetap + lembur).
- Lima entri terbaru dengan pintasan ke Riwayat.
- Keadaan kosong yang ramah: ajakan menghitung lembur pertama.

## D. Fitur Hitung Gaji Harian dan Bulanan

### D.1 Mode bulanan

Input: gaji pokok, tunjangan tetap, bulan, dan lembur yang dipilih dari Riwayat (otomatis dijumlah untuk bulan itu). Potongan (BPJS, pajak, kasbon, lainnya) diisi manual oleh pengguna, karena kalkulator tidak menghitung PPh 21 dan BPJS otomatis.

**Estimasi gaji = gaji pokok + tunjangan tetap + total lembur bulan itu - potongan manual**

### D.2 Mode harian

Input: upah harian (diisi langsung atau diturunkan dari gaji bulanan), jumlah hari masuk, dan opsi menambahkan lembur hari itu.

**Upah harian = gaji bulanan / pembagi hari kerja**

Pembagi bisa diubah pengguna, dengan nilai awal 21 untuk 5 hari kerja dan 25 untuk 6 hari kerja. Nilai awal ini adalah asumsi yang harus diverifikasi ke ketentuan perusahaan atau Disnaker sebelum rilis, dan ditampilkan di disclaimer.

**Estimasi = upah harian x hari masuk + total lembur - potongan manual**

### D.3 Keluaran

Rincian per komponen (upah pokok, lembur, potongan, total), rumus yang dipakai, dan opsi disimpan ke Riwayat atau disimpan sebagai gambar.

## E. Penyimpanan Data Lokal

- Data disimpan di **localStorage** browser (atau IndexedDB bila data besar), tanpa server dan tanpa login.
- **Simpan otomatis** setiap entri; **muat otomatis** saat halaman dibuka lagi, jadi data tidak hilang saat keluar masuk browser.
- Pengguna dapat **menghapus satu entri** (ikon hapus per baris) dan **menghapus semua data** dengan dialog konfirmasi dua langkah.
- Pengaturan yang ikut tersimpan: sistem hari kerja terakhir, gaji dan tunjangan (opsional, bisa dimatikan), nama dan perusahaan untuk bukti.
- Semua akses storage dibungkus `try/catch`; bila storage tidak tersedia (mode privat, kuota penuh), tampil pesan dan aplikasi tetap bisa dipakai tanpa penyimpanan.
- Catatan privasi yang tampil di web: data hanya ada di browser dan perangkat ini. Data hilang bila cache atau data situs dibersihkan, dan tidak ikut berpindah ke perangkat lain. Karena itu disarankan ekspor cadangan berkala.

**Skema entri (JSON):**

| Field | Keterangan |
| --- | --- |
| id | Pengenal unik entri |
| tanggal | Tanggal lembur (YYYY-MM-DD) |
| jenisHari | biasa, sabtu, minggu |
| libur | true atau false (libur resmi) |
| sistem | 5 atau 6 hari kerja |
| totalJamKerja | Total jam kerja hari itu (untuk hari biasa) |
| jamLembur | Jam lembur hasil hitung |
| upahSebulan | Gaji pokok + tunjangan tetap |
| upahSejam | 1/173 x upah sebulan |
| totalLembur | Nominal lembur (Rp) |
| catatan | Catatan bebas |
| dibuat | Waktu entri dibuat |

File cadangan JSON menyertakan nomor `versiSkema` agar impor tetap kompatibel di versi berikutnya.

## F. Ekspor dan Impor

**Ekspor:**

- **Excel (.xlsx)** berisi satu sheet Riwayat dan satu sheet Ringkasan bulanan.
- **CSV** untuk dibuka di aplikasi spreadsheet lain.
- **JSON** sebagai cadangan lengkap yang bisa dipulihkan.
- Pilihan rentang: semua data, bulan terpilih, atau entri yang dicentang.

**Impor:**

- Mendukung .xlsx, .csv, dan .json dengan kolom sesuai skema.
- Tersedia tombol **unduh template kosong** agar format benar.
- Validasi per baris (tanggal, angka, jenis hari); baris salah ditandai dan dilewati dengan laporan jumlah berhasil dan gagal.
- Pratinjau sebelum disimpan, dengan pilihan **gabung** (lewati duplikat berdasarkan id) atau **ganti semua**.
- Pembuatan dan pembacaan Excel memakai pustaka SheetJS yang dimuat dari cdnjs dengan versi dikunci. Seluruh proses tetap di browser.

## G. Simpan sebagai Gambar (Bukti)

- Tombol **Simpan sebagai gambar** pada hasil hitung, dashboard, dan Riwayat, menghasilkan **PNG** beresolusi tinggi (skala 2x).
- Isi kartu bukti: judul "Kalkulator Penghitung Lembur by Kahfi", tanggal dan jam pembuatan, nama dan perusahaan (opsional, diisi pengguna), rincian per jam, total, rumus, ringkasan dasar hukum, dan tautan sumber dalam bentuk teks.
- Watermark kecil: "Estimasi mandiri, bukan dokumen resmi".
- Tema gambar bisa dipilih: neon gelap atau putih untuk dicetak.
- Nama file otomatis, misalnya `lembur-2026-11-05.png`.
- Pembuatan gambar memakai html2canvas (versi dikunci, dimuat dari cdnjs) atau Canvas API sendiri.
- Opsional: cetak atau simpan PDF lewat dialog cetak browser dengan gaya cetak khusus.

## H. Kebutuhan Fungsional Tambahan

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F13 | Lembur hari kerja biasa dengan input total jam kerja dan jam normal otomatis | Wajib |
| F14 | Tab bar dengan lima tab dan status tab aktif | Wajib |
| F15 | Dashboard ringkasan bulanan dengan pemilih bulan | Wajib |
| F16 | Hitung gaji mode bulanan | Wajib |
| F17 | Hitung gaji mode harian dengan pembagi yang bisa diubah | Wajib |
| F18 | Simpan entri ke Riwayat dan muat otomatis saat dibuka | Wajib |
| F19 | Hapus satu entri dan hapus semua dengan konfirmasi | Wajib |
| F20 | Ekspor Excel, CSV, JSON | Wajib |
| F21 | Impor Excel, CSV, JSON dengan validasi dan pratinjau | Wajib |
| F22 | Simpan hasil sebagai gambar PNG | Wajib |
| F23 | Penjelasan jam kerja PP 35/2021 Pasal 21 ayat (2) dan catatan jam istirahat | Wajib |
| F24 | Tautan sumber resmi di tab Info, disclaimer, dan footer | Wajib |
| F25 | Edit entri yang sudah tersimpan | Sebaiknya |
| F26 | Filter dan cari di Riwayat (bulan, jenis hari) | Sebaiknya |
| F27 | Nama dan perusahaan opsional pada gambar bukti | Sebaiknya |
| F28 | Tema cetak putih untuk gambar dan PDF | Opsional |
| F29 | Bisa dipasang sebagai PWA dan dipakai offline | Opsional |

## I. Pembaruan Disclaimer

Tambahan poin pada teks disclaimer:

> 7. Gambar, Excel, dan file lain yang dihasilkan kalkulator ini adalah **hasil hitung mandiri** dan bukan dokumen resmi perusahaan atau pemerintah.
> 8. Data tersimpan di browser perangkat Anda. Data bisa hilang bila data situs dibersihkan; lakukan ekspor cadangan secara berkala.
> 9. Jam istirahat tidak dihitung sebagai jam kerja. Hitungan memakai jam kerja efektif.
> 10. Pembagi hari kerja pada mode harian adalah asumsi bawaan yang dapat Anda ubah sesuai ketentuan perusahaan.
> 11. Dasar hukum dapat dicek langsung pada tautan sumber di halaman ini.

## J. Kasus Uji Tambahan

| # | Skenario | Hasil yang diharapkan |
| --- | --- | --- |
| 8 | 5 hari kerja, Senin kerja 12 jam, gaji Rp6.000.000 | Lembur 4 jam = 7,5 x upah sejam, sekitar Rp260.116 |
| 9 | 6 hari kerja, Senin kerja 12 jam | Lembur 5 jam = 9,5 x upah sejam, plus peringatan batas 4 jam |
| 10 | Total jam kerja 7 jam pada 5 hari kerja | Pesan belum ada lembur |
| 11 | Simpan entri lalu muat ulang halaman | Entri masih ada |
| 12 | Hapus satu entri, lalu hapus semua | Entri hilang dari daftar dan dashboard terbarui |
| 13 | Ekspor JSON, hapus semua, impor JSON | Data kembali identik |
| 14 | Impor CSV berisi baris tidak valid | Baris valid masuk, baris salah dilaporkan |
| 15 | Simpan gambar | PNG terunduh berisi rincian, disclaimer, dan sumber |
| 16 | Buka dengan storage diblokir | Pesan peringatan, kalkulator tetap berfungsi |
| 17 | Klik tautan sumber | Terbuka di tab baru ke halaman peraturan |

## K. Rekomendasi Teknis v1.1

- Struktur file: `index.html`, `style.css`, dan `script.js` (boleh dipecah menjadi `storage.js`, `export.js`, dan `dashboard.js` bila kode membesar).
- Pemisahan lapisan: fungsi hitung murni, lapisan data (storage), dan lapisan tampilan, agar mudah diuji.
- Pustaka eksternal: SheetJS dan html2canvas dari cdnjs dengan versi dikunci; selain itu JavaScript murni.
- Perutean tab sederhana dengan hash (`#dashboard`, `#lembur`, `#gaji`, `#riwayat`, `#info`).
- Aksesibilitas: kontras minimal 4,5:1, fokus terlihat, dan `prefers-reduced-motion` dihormati.

## L. Risiko Tambahan

| Risiko | Mitigasi |
| --- | --- |
| Data hilang karena cache dibersihkan | Pengingat ekspor cadangan dan tombol ekspor yang mudah dijangkau |
| Gambar dianggap dokumen resmi | Watermark dan disclaimer pada gambar |
| Pembagi hari kerja mode harian keliru | Dapat diubah pengguna dan diverifikasi ke Disnaker |
| Tautan sumber berubah atau mati | Cek tautan tiap rilis dan sediakan dua sumber |
| Impor file rusak atau berbahaya | Validasi ketat, batasi ukuran file, dan tidak menjalankan isi file |

## M. Rencana Rilis v1.1

1. **Tahap 1:** tab bar, penyimpanan lokal, Riwayat, dan hapus data.
2. **Tahap 2:** dashboard dan hitung gaji harian serta bulanan.
3. **Tahap 3:** ekspor dan impor, gambar PNG, serta bagian Info dan Sumber.
4. **Tahap 4:** uji kasus 8 sampai 17, uji di HP, lalu deploy ke GitHub Pages atau Vercel.
