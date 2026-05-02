# Laporan Audit UI/UX Holistik — Klinik Pratama Cipatik
**Tanggal:** 1 Mei 2026 | **Scope:** `app/page.tsx`, `app/reservasi/page.tsx`, `app/layout.tsx`

---

## 1. Konsistensi Tema Warna

### Status: ✅ Mayoritas Konsisten — 1 Inkonsistensi Minor

Tema yang ditetapkan: **Slate** (background/text), **Teal** (primary brand action).

| Temuan | Lokasi | Severity | Status |
|---|---|---|---|
| Icon "Asuransi Swasta" di Trust Band menggunakan `blue-50/blue-600` | `page.tsx:189` | 🟡 Minor | Intentional — warna berbeda untuk membedakan 3 provider |
| Icon BPJS fallback menggunakan `emerald-50/emerald-600` | `page.tsx:175` | 🟡 Minor | Intentional — emerald = warna BPJS brand |
| Semua tombol CTA utama konsisten `teal-600` | Semua file | ✅ Pass | — |
| Background card konsisten `slate-50` / `white` | Semua file | ✅ Pass | — |
| Error state konsisten `red-300/red-500` | `reservasi/page.tsx` | ✅ Pass | — |
| Success state `emerald-*` di admin, booking ticket | `admin/page.tsx`, `reservasi/page.tsx` | ✅ Pass | Sesuai konvensi |

> [!NOTE]
> `blue-*` pada icon Asuransi Swasta **disengaja dan tepat** — memberikan diferensiasi visual antara 3 provider (Umum=teal, BPJS=emerald, Swasta=blue). Tidak perlu diubah.

---

## 2. Mobile Touch Target (WCAG 2.5.5 — Target Size)

Standar minimum: **44×44px** (Apple HIG) / **48×48dp** (Material Design).

### `app/page.tsx`

| Elemen | Height Efektif | Status |
|---|---|---|
| Tombol "Reservasi Online" (`py-3.5` = 56px) | ~56px ✅ | Pass |
| Tombol "Konsultasi Online" (`py-3.5` = 56px) | ~56px ✅ | Pass |
| Link nav badge di hero | ~40px | 🟡 Borderline — diperluas dengan padding `py-2` |
| Kartu Layanan (hover-only) — bukan interactive | N/A | Pass |
| Tombol "Daftar Umum (Web)" (`py-2.5` = 40px) | ~40px | 🟡 Borderline |
| Tombol "Pasien BPJS (Aplikasi)" (`py-2.5` = 40px) | ~40px | 🟡 Borderline |

### `app/reservasi/page.tsx`

| Elemen | Height Efektif | Status |
|---|---|---|
| Semua `<input>` form (`py-3` = 48px) | ~48px ✅ | Pass |
| Tombol Jalur Layanan (Umum/BPJS) | ~80px+ ✅ | Pass |
| Toggle Sesi Kedatangan (`py-2.5` = ~40px) | ~40px | 🟡 Borderline pada mobile |
| Tombol Submit (`py-4` = 64px) | ~64px ✅ | Pass |
| Tombol "Kembali ke Beranda" | ~40px | 🟡 Borderline |
| Tombol hapus tiket (X icon) | ~32px | 🔴 Terlalu kecil |

> [!WARNING]
> Tombol **X (hapus tiket)** di ticket wallet menggunakan `p-1.5` — menghasilkan touch target ~28px, di bawah minimum 44px. **Perlu diperbesar ke minimal `p-3`**.

---

## 3. Performa & Beban Animasi Framer Motion

### Analisis `app/page.tsx`

| Animasi | Jumlah Node | `transform` GPU? | Risiko Lag |
|---|---|---|---|
| Hero staggerContainer (5 children) | 5 | ✅ Ya (opacity+y) | Rendah |
| Trust Band staggerContainer (5 children) | 5 | ✅ Ya | Rendah |
| Section Layanan staggerContainer (5 children) | 5 | ✅ Ya | Rendah |
| Section Jadwal staggerContainer (10+ children) | 10 | ✅ Ya | 🟡 Medium |
| Section Alur staggerContainer (5 children) | 5 | ✅ Ya | Rendah |
| Section Tim Medis (per-card whileInView) | N cards | ✅ Ya | 🟡 Medium |
| **Blur blobs** (`blur-[100px]`) di 3 section | 6 divs | ❌ CPU-rendered | 🔴 Berat di HP low-end |

> [!CAUTION]
> **Blur blobs** (`blur-[100px]`, `blur-[80px]`) adalah penyebab render terberat. Filter CSS `blur()` tidak di-hardware-accelerate oleh semua browser mobile. Pada HP low-end, ini bisa menyebabkan frame drop saat scroll.
>
> **Solusi:** Tambahkan `will-change: auto` dan **kurangi ukuran** blob, atau ganti dengan SVG gradient yang di-cache browser.

### Rekomendasi Performa (Urutan Prioritas)

1. **[KRITIS]** Tambahkan `will-change: transform` pada blob containers — atau nonaktifkan di mobile via CSS `@media (max-width: 768px) { .blob { display: none; } }`
2. **[MEDIUM]** Section Jadwal punya 10+ `motion.div` ber-stagger — kurangi dengan tidak membungkus elemen statis (baris jadwal) dengan `motion.div`
3. **[LOW]** `staggerChildren: 0.15` pada 5 section — total delay akumulasi 0.75s per section, cukup ringan

---

## 4. Loading States & Feedback

| Skenario | Indikator | Status |
|---|---|---|
| Submit form reservasi | `Loader2` spinner + teks "Mendaftarkan..." | ✅ Baik |
| Loading Tim Medis | Shimmer skeleton 4 kartu | ✅ Baik |
| Loading admin table | Pulse skeleton 5 baris | ✅ Baik |
| Page transition (sebelum template.tsx) | ❌ Tidak ada | 🔴 Sudah diatasi dengan template.tsx |
| Navigasi Beranda → Reservasi | Flash putih sesaat | ✅ Diatasi template.tsx |
| Error form submit | Banner merah dengan pesan jelas | ✅ Baik |
| Tiket berhasil dibuat | Modal popup dengan kode booking | ✅ Baik |

---

## 5. Ringkasan Perbaikan yang Perlu Dilakukan

| # | Masalah | File | Prioritas |
|---|---|---|---|
| 1 | Tombol X hapus tiket terlalu kecil (~28px) | `reservasi/page.tsx` | 🔴 Kritis |
| 2 | Blur blobs berat di HP low-end | `page.tsx` | 🔴 Kritis |
| 3 | Tombol Alur Pelayanan `py-2.5` borderline | `page.tsx` | 🟡 Medium |
| 4 | Toggle sesi `py-2.5` borderline di mobile | `reservasi/page.tsx` | 🟡 Medium |
| 5 | 10+ motion.div di section jadwal | `page.tsx` | 🟢 Low |

---

## 6. Hal yang Sudah Sangat Baik ✅

- **`useReducedMotion()`** sudah diimplementasikan di `page.tsx` — standar aksesibilitas terpenuhi
- **`viewport={{ once: true }}`** pada semua `whileInView` — mencegah re-animasi saat scroll balik (optimal)
- **GPU-accelerated transforms** — semua animasi menggunakan `opacity` + `y` (transform), bukan `width`/`height` yang memicu layout reflow
- **Skeleton loading** konsisten di semua area data async
- **Error state** jelas dan informatif di semua form
- **Focus ring** (`focus-visible:ring-2 focus-visible:ring-teal-500`) sudah ada di tombol-tombol kritis
