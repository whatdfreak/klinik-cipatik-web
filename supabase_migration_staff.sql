-- ============================================================================
-- MIGRATION: Buat tabel staff untuk Tim Medis Klinik Pratama Cipatik
-- Jalankan script ini di: Supabase Dashboard > SQL Editor > New Query
-- ============================================================================

-- 1. Buat tabel staff
CREATE TABLE IF NOT EXISTS staff (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        VARCHAR(150) NOT NULL,
  jabatan     VARCHAR(100) NOT NULL,
  kategori    VARCHAR(80)  NOT NULL,
  deskripsi   TEXT         NOT NULL,
  foto_url    TEXT,
  lisensi     VARCHAR(100),
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  urutan      INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 3. Buat policy: siapa saja (anonymous) boleh membaca data yang aktif
CREATE POLICY "public_read_active_staff"
  ON staff
  FOR SELECT
  USING (is_active = TRUE);

-- 4. Seed data: 9 anggota tim medis
INSERT INTO staff (nama, jabatan, kategori, deskripsi, foto_url, lisensi, urutan) VALUES
  (
    'dr. Elviana R. Hermanus',
    'Dokter Umum',
    'Dokter Umum',
    'Pelayanan medis primer berkelanjutan, menangani kasus klinis keluarga dengan pendekatan holistik.',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
    NULL,
    1
  ),
  (
    'dr. Roery S. Kriswihadi',
    'Dokter Umum',
    'Dokter Umum',
    'Pemeriksaan medis dasar, diagnosis, dan kuratif penyakit umum untuk pasien anak hingga dewasa.',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
    NULL,
    2
  ),
  (
    'drg. Atika Suryadewi',
    'Dokter Gigi',
    'Dokter Gigi',
    'Spesialis perawatan preventif, konservasi gigi, dan edukasi kesehatan mulut keluarga.',
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop',
    NULL,
    3
  ),
  (
    'Apt. Syifa Fatasyaa, S.Farm',
    'Apoteker',
    'Farmasi',
    'Bertanggung jawab atas pengelolaan, peracikan, dan pemberian edukasi informasi obat kepada pasien.',
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop',
    NULL,
    4
  ),
  (
    'Puri Puspita Sari, A.Md.Kep',
    'Perawat',
    'Keperawatan',
    'Penanggung jawab tindakan keperawatan, skrining tanda vital pasien, dan pendampingan medis.',
    'https://images.unsplash.com/photo-1584820927498-cafe8c1c9842?q=80&w=1974&auto=format&fit=crop',
    NULL,
    5
  ),
  (
    'Annisa Sarah Agustina, A.Md.Kes',
    'Perawat',
    'Keperawatan',
    'Memberikan asuhan keperawatan komprehensif serta mendukung prosedur medis dokter di klinik.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
    NULL,
    6
  ),
  (
    'Aljan, A.Md.Farm',
    'Asisten Apoteker',
    'Farmasi',
    'Membantu apoteker dalam penyiapan resep, manajemen stok ketersediaan obat, dan pelayanan farmasi.',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop',
    NULL,
    7
  ),
  (
    'Maya Siti Nurbaya',
    'Administrasi 1',
    'Front Office',
    'Melayani proses pendaftaran pasien, pengelolaan rekam medis, dan pusat informasi operasional klinik.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop',
    NULL,
    8
  ),
  (
    'Irma Marlina',
    'Administrasi 2',
    'Front Office',
    'Membantu kelancaran alur administrasi, manajemen antrean, dan validasi data pasien BPJS.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
    NULL,
    9
  );

-- 5. Verifikasi hasil
SELECT id, nama, jabatan, kategori, urutan FROM staff ORDER BY urutan;
