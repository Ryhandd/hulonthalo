# Rumah Makan Hulonthalo - Aplikasi Pemesanan Online

Next.js 14 (App Router) + Tailwind CSS + Supabase, di-deploy ke Vercel.

## Struktur folder

```
hulonthalo/
├── supabase/schema.sql          # DDL, RLS, fungsi pemesanan, storage, seed menu
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Font, Navbar, CartProvider, CartDrawer
│   │   ├── page.tsx             # Beranda + menu (server component, ISR 60 dtk)
│   │   ├── globals.css
│   │   ├── pesanan/[id]/page.tsx  # Pelacakan status pesanan pelanggan
│   │   └── admin/page.tsx       # Login admin + pesanan realtime
│   ├── components/              # Navbar, ProductCard, MenuBrowser, CartDrawer, Logo
│   ├── lib/                     # supabase.ts (klien), data.ts (akses data), types.ts, format.ts
│   └── store/cart.tsx           # State keranjang (Context + localStorage)
├── .env.example
├── tailwind.config.ts           # Warna & font dari Design Brief
└── package.json
```

Pemisahan lapisan: komponen UI tidak memanggil Supabase langsung kecuali halaman admin;
seluruh akses data pelanggan lewat `src/lib/data.ts`.

## Langkah 0 - Jalankan di komputer

```bash
npm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
npm run dev                    # buka http://localhost:3000
```

## Langkah 1 - Siapkan Supabase

1. Buka https://supabase.com, buat **New project** (catat password database, pilih region terdekat, mis. Singapore).
2. Buka **SQL Editor > New query**, tempel seluruh isi `supabase/schema.sql`, klik **Run**.
   Hasil yang benar: "Success. No rows returned". Cek **Table Editor**: ada tabel `categories`, `menu_items`, `orders`, `order_items`, `admins` dan 26 baris menu.
3. Buka **Project Settings > API**. Salin **Project URL** dan **anon public key** ke `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   Jangan pernah memakai `service_role` key di aplikasi ini.
4. Buat akun admin: **Authentication > Users > Add user** (isi email + password, centang Auto Confirm).
   Lalu jalankan di SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-admin@anda.com';
   ```
5. Restart `npm run dev`. Menu tampil di `/`, admin di `/admin`.

## Kebijakan keamanan (RLS) - ringkasan

| Tabel / fungsi | Publik (anon)                     | Admin (login + ada di `admins`) |
|----------------|-----------------------------------|---------------------------------|
| categories, menu_items | baca                      | baca, tambah, ubah, hapus       |
| orders, order_items    | tidak ada akses langsung  | baca, ubah status               |
| `place_order()`        | boleh dipanggil (harga dihitung di server) | boleh               |
| `get_order(uuid)`      | boleh, hanya jika tahu UUID pesanan | boleh                 |
| storage `menu-images`  | baca                      | unggah, ubah, hapus             |

Pelanggan tidak bisa mengubah harga atau melihat pesanan orang lain.

## Langkah 2 - Inisialisasi Git dan push ke GitHub

```bash
git init
git add .
git status                      # pastikan .env.local TIDAK ada di daftar
git commit -m "Inisialisasi aplikasi Hulonthalo"
git branch -M main
```
Buat repository kosong di https://github.com/new (tanpa README), lalu:
```bash
git remote add origin https://github.com/USERNAME/hulonthalo.git
git push -u origin main
```
Jika diminta login, gunakan Personal Access Token (Settings > Developer settings > Tokens) sebagai password.

## Langkah 3 - Import ke Vercel

1. Masuk https://vercel.com dengan akun GitHub, klik **Add New > Project**, pilih repository `hulonthalo`.
2. Build Settings (biasanya terdeteksi otomatis):
   - Framework Preset: **Next.js**
   - Build Command: `next build`
   - Output Directory: biarkan default
   - Install Command: `npm install`
   - Node.js Version: 20.x

## Langkah 4 - Environment Variables di Vercel

Pada bagian **Environment Variables** (sebelum klik Deploy), tambahkan:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `NEXT_PUBLIC_WA_NUMBER` | (opsional) nomor WA restoran |

Variabel berawalan `NEXT_PUBLIC_` ditanam saat build. Jika diubah, lakukan **Redeploy**.

## Langkah 5 - Deploy dan validasi

1. Klik **Deploy**, tunggu sampai status *Ready* (1-3 menit).
2. Di Supabase **Authentication > URL Configuration**, isi **Site URL** dengan domain Vercel Anda (mis. `https://hulonthalo.vercel.app`).
3. Uji dari ponsel:
   - [ ] Menu dan harga tampil sesuai brief
   - [ ] Tambah item, keranjang menampilkan jumlah dan total
   - [ ] Kirim pesanan membuka halaman `/pesanan/<id>`
   - [ ] Login di `/admin`, pesanan muncul tanpa refresh
   - [ ] Ubah status di admin, halaman pelanggan berubah dalam 5 detik

## Pemecahan masalah

| Gejala | Penyebab / solusi |
|--------|-------------------|
| "Menu belum bisa dimuat" | `.env.local` kosong/salah, atau `schema.sql` belum dijalankan. Restart dev server setelah mengubah env. |
| Build Vercel gagal "supabaseUrl is required" | Env var belum diisi di Vercel. Tambahkan lalu Redeploy. |
| Pesanan gagal: "permission denied for function" | Bagian GRANT di akhir fungsi belum terjalankan. Jalankan ulang `schema.sql`. |
| Admin login berhasil tapi daftar kosong | Akun belum dimasukkan ke tabel `admins` (Langkah 1, nomor 4). |
| Gambar menu tidak tampil | Unggah ke bucket `menu-images`, lalu isi kolom `image_url` dengan URL publiknya. |
| `git push` ditolak | Remote salah atau token tidak valid: `git remote -v`, buat token baru. |

## Pengembangan lanjutan

Pembayaran (QRIS via Midtrans/Xendit), CRUD menu di halaman admin, notifikasi WhatsApp otomatis,
dan PWA agar bisa dipasang di layar utama ponsel.
