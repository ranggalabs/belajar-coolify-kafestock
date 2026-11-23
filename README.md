<div align="center">

# ☕ KafeStock — Cafe Inventory & Dashboard

**Aplikasi CRUD Inventaris Kafe fullstack yang modern, ringan, dan siap deploy ke Coolify.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Coolify_Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://coolify.io/)

</div>

---

## ✨ Tentang Project

**KafeStock** adalah project latihan fullstack untuk mempraktikkan deployment aplikasi web + database PostgreSQL menggunakan **Coolify** di Virtual Machine.

Project ini dilengkapi dengan dashboard interaktif untuk memantau stok bahan baku kafe secara *real-time*, notifikasi stok menipis, tombol *quick restock*, serta konfigurasi **multi-stage Dockerfile** dan **Docker Compose** agar langsung jalan di Coolify tanpa setup rumit.

### 🎯 Fitur Utama
- **📊 Dashboard Interaktif** — 3 kartu ringkasan kategori (*Biji Kopi & Teh*, *Susu & Sirup*, *Pastry & Kemasan*) lengkap dengan *progress bar* kapasitas stok dan filter instan.
- **📦 CRUD Inventaris Lengkap** — Tambah, lihat, cari (SKU/nama/supplier), edit, dan hapus item bahan kafe langsung tersimpan ke PostgreSQL.
- **⚡ Quick Stock & Restock** — Tambah/kurangi stok (`+/-`) dalam satu klik serta tombol cepat **Restock +10** di panel kanan **Jadwal Restock**.
- **💰 Statistik & Estimasi Aset** — Menghitung otomatis jumlah SKU, item menipis, persentase stok sehat, dan estimasi total nilai inventaris dalam Rupiah.
- **🗄️ Auto-Migration & Seed** — Tabel `inventory_items` beserta 9 data contoh kafe dibuat otomatis saat server pertama kali terhubung ke PostgreSQL.
- **🩺 Coolify Healthcheck Ready** — Tersedia endpoint `GET /api/health` yang memverifikasi status Express dan koneksi PostgreSQL.

---

## 🏗️ Arsitektur & Struktur Folder

```text
belajar_coolify/
├── frontend/                  # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/        # Sidebar, CategoryCards, InventoryList, StatsPanel, RestockTimeline, ItemModal
│   │   ├── services/api.ts    # HTTP client untuk REST API
│   │   └── types/inventory.ts # Tipe data TypeScript & helper format Rupiah
│   └── vite.config.ts
├── backend/                   # Express.js + node-postgres (pg)
│   └── src/
│       ├── index.js           # Entry server, /api/health, static frontend serving
│       ├── db.js              # Connection pool + auto schema & initial seed
│       └── routes/inventory.js# Endpoint CRUD + agregasi dashboard
├── Dockerfile                 # Multi-stage build (React static + Express di port 3000)
└── docker-compose.yml         # Stack App + PostgreSQL 16
```

---

## 🔌 Daftar API Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Cek status server & koneksi PostgreSQL |
| `GET` | `/api/inventory/dashboard` | Ringkasan statistik, kategori, stok menipis & update terbaru |
| `GET` | `/api/inventory` | List seluruh item (mendukung `?search=`, `?category=`, `?status=low`) |
| `GET` | `/api/inventory/:id` | Detail satu item inventaris |
| `POST` | `/api/inventory` | Tambah item inventaris baru |
| `PUT` | `/api/inventory/:id` | Perbarui seluruh data item |
| `PATCH` | `/api/inventory/:id/stock` | Ubah jumlah stok secara cepat (`{ "delta": 10 }` atau `{ "stock": 25 }`) |
| `DELETE` | `/api/inventory/:id` | Hapus item inventaris |

---

## 💻 Menjalankan di Lokal (Development)

### 1. Jalankan PostgreSQL
```bash
docker run -d --name kafestock-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kafestock \
  -p 5432:5432 postgres:16-alpine
```

### 2. Jalankan Backend (Express.js)
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
> Backend berjalan di `http://localhost:3000`

### 3. Jalankan Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
> Frontend berjalan di `http://localhost:5173` (request `/api` otomatis di-proxy ke `http://localhost:3000`).

### Atau Jalankan Sekaligus dengan Docker Compose
```bash
docker compose up --build
```
> Akses aplikasi di `http://localhost:3000`

---

## 🚀 Cara Deploy di Coolify

### Opsi 1: Dockerfile + Coolify PostgreSQL *(Direkomendasikan untuk Belajar)*
Cocok untuk memahami cara menghubungkan **Application** dengan **Managed Database** di Coolify:

1. Buka dashboard **Coolify** → masuk ke Project Anda.
2. Klik **+ Add New Resource** → pilih **PostgreSQL** → klik **Start**.
3. Di halaman resource PostgreSQL tersebut, salin **Postgres URL (internal)**, contoh:
   ```env
   postgres://postgres:password@<container-name>:5432/postgres
   ```
4. Klik **+ Add New Resource** lagi → pilih **Public Repository** → masukkan URL repository GitHub ini.
5. Atur konfigurasi berikut:
   - **Build Pack**: `Dockerfile`
   - **Ports Exposes**: `3000`
6. Masuk ke tab **Environment Variables**, tambahkan:
   | Key | Value |
   | :--- | :--- |
   | `DATABASE_URL` | *(tempel Postgres URL internal dari langkah 3)* |
   | `PORT` | `3000` |
7. *(Opsional)* Masuk ke tab **Healthcheck**, aktifkan healthcheck dengan path `/api/health` pada port `3000`.
8. Klik **Deploy** 🎉 — tabel dan data contoh akan dibuat otomatis saat aplikasi menyala!

### Opsi 2: Docker Compose (Sekali Deploy)
1. Di Coolify, pilih **+ Add New Resource** → **Docker Compose** dari repository GitHub ini.
2. Coolify otomatis mendeteksi `docker-compose.yml` (berisi service `app` dan `postgres`).
3. Atur domain/port untuk service `app` pada port `3000`, lalu klik **Deploy**.

---

## ⚙️ Environment Variables

| Variable | Wajib | Default | Keterangan |
| :--- | :---: | :--- | :--- |
| `PORT` | Tidak | `3000` | Port server Express |
| `DATABASE_URL` | Ya | - | Connection string PostgreSQL |
| `DATABASE_SSL` | Tidak | `false` | Set `true` jika PostgreSQL mewajibkan SSL |

---

<div align="center">
  Dibuat untuk latihan deployment fullstack dengan <b>Coolify</b> 🚀
</div>
