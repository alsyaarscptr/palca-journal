# 🌸 Jurnal Kenangan (Memory Journal)

Sebuah aplikasi jurnal foto harian berbasis web yang dirancang dengan estetika premium dan minimalis. Aplikasi ini memungkinkan pengguna untuk menyimpan satu kenangan indah setiap hari dalam bentuk foto dan catatan singkat, yang ditampilkan dalam antarmuka kalender yang interaktif.

![Design Reference](public/bg-aesthetic.png)

## ✨ Fitur Utama

- **Kalender Interaktif**: Navigasi bulan ke bulan dengan tampilan hari yang bersih.
- **Upload Kenangan**: Simpan foto dan cerita singkat untuk setiap tanggal.
- **Manajemen Memori**: Lihat detail foto, edit teks cerita, atau hapus kenangan yang sudah ada.
- **Estetika Premium**: Desain bertema *warm cream* yang elegan dengan tipografi serif (Lora) dan sans-serif (Outfit).
- **Responsive Design**: Tampilan yang dioptimalkan untuk perangkat desktop maupun smartphone.

## 🚀 Teknologi yang Digunakan

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Bahasa**: TypeScript
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [Aiven MySQL](https://aiven.io/)
- **Penyimpanan Foto**: [Cloudinary](https://cloudinary.com/)
- **Styling**: CSS Modules & Vanilla CSS
- **Font**: Google Fonts (Lora, Outfit, Caveat)

## 🛠️ Persiapan Lingkungan (Setup)

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- Node.js (versi 18 ke atas)
- npm atau yarn

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment (`.env.local`)
Buat file `.env.local` di akar direktori dan tambahkan kredensial berikut:

```env
# Database (Aiven MySQL)
DATABASE_URL="mysql://username:password@host:port/defaultdb"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 4. Sinkronisasi Database
```bash
npx prisma db push
```

## 🏃 Menjalankan Aplikasi

Jalankan server pengembangan:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Struktur Folder Utama

- `src/app`: Logika halaman dan routing (Next.js App Router).
- `src/components`: Komponen UI seperti Kalender dan Modal.
- `src/lib`: Konfigurasi library (Prisma, Cloudinary).
- `prisma/`: Definisi skema database.
- `public/`: Aset statis seperti background dan ikon.

## 📝 Lisensi

Proyek ini dibuat untuk keperluan belajar dan dokumentasi pribadi.

---
*Dibuat dengan ❤️ oleh Antigravity untuk alsyaarscptr.*
