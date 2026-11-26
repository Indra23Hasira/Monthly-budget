# Monthly Budget (versi pribadi)

Aplikasi budget bulanan pribadi milik Indra. Penjelasan ke Indra selalu dalam Bahasa Indonesia yang sederhana, karena dia tidak menulis kode sendiri.

## Struktur
- PWA satu file: `index.html` berisi HTML + CSS + JavaScript (ES module). Tidak ada build step.
- File lain: `sw.js` (service worker), `manifest.json`, `icon-192.png`, `icon-512.png`.
- Di-host di GitHub Pages dari branch `main`.
- Library dari CDN: Firebase JS SDK 10.12.2 (gstatic) dan Chart.js 4.4.0 (jsDelivr).

## Firebase
- Project: `monthly-budget-7ee9e`. Jangan ubah `firebaseConfig`.
- Firestore Rules: setiap user hanya bisa membaca dan menulis `users/{uid}/**`. Versi ini TIDAK punya sistem berbayar.
- Perubahan Rules tidak bisa di-deploy dari sini. Berikan teksnya ke Indra untuk di-paste di Firebase Console.

## Repo saudara: Budget-Keluarga
- Repo `Budget-Keluarga` adalah versi komersial (Firebase `budget-keluarga-c6807`) dengan sistem aktivasi berbayar.
- Fitur lainnya sama. Kalau mengubah fitur bersama, terapkan di kedua repo kecuali Indra bilang lain.
- Jangan pernah menyalin `firebaseConfig` atau sistem berbayar dari repo itu ke repo ini.

## Data (Firestore)
- `users/{uid}/transactions/{id}`: type, category, amount, details, date (YYYY-MM-DD), periodKey (YYYY-MM), periodManual
- `users/{uid}/budgets/{YYYY-MM}`: `{ [type]: { [kategori]: { amount, destination } } }`
- `users/{uid}/reserveWithdrawals/{id}`: pemakaian Sisa Dana (FIFO, dengan allocations)
- `users/{uid}/settings/categories` dan `users/{uid}/settings/preferences` (`payday`)

## Logika penting
- Periode = siklus gajian sesuai `payday` (1–30, 31 = akhir bulan). Nama periode: gajian tgl 1–15 dinamai bulan gajinya masuk, gajian tgl 16–31 dinamai bulan berikutnya.
- "SISA UANG FREE" (Variable Expenses) dihitung otomatis: Actual Income (kalau sudah ada, kalau belum Planned Income) dikurangi Planned semua kategori lain.
- Nama rekening tujuan diseragamkan lewat `canonicalAccountName()` / `accountKey()`.
- Mode Demo memakai Firestore tiruan in-memory (`DemoFS`). Setiap fungsi Firestore baru yang dipakai app juga harus ditambahkan di `DemoFS`.
- Startup cepat: Firestore persistent cache + `fastGet()` (cache dulu, lalu server).

## Sebelum push
- Cek sintaks script module dengan `node --check`.
- Tes Mode Demo di browser headless dan pastikan tidak ada error.
