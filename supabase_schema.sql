-- ====================================================================
-- SKRIP INISIALISASI DATABASE SUPABASE (POSTGRESQL) - SMAPSI GALLERY
-- ====================================================================
-- Salin dan jalankan seluruh isi skrip ini di SQL Editor Supabase Anda.

-- 1. TABEL KATEGORI FOTO
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Data Kategori Default
INSERT INTO public.categories (name, slug) VALUES
('Wisuda', 'wisuda'),
('OSIS', 'osis'),
('Olahraga', 'olahraga'),
('Seni Budaya', 'seni'),
('Study Tour', 'tour'),
('Lomba', 'lomba')
ON CONFLICT (slug) DO NOTHING;

-- 2. TABEL ALBUM FOTO GALERI
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    photo_count INT DEFAULT 0,
    cover_urls TEXT NOT NULL,
    drive_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Data Album Sampel
INSERT INTO public.albums (title, photo_count, cover_urls, drive_url, description) VALUES
('Haflah Akhirussanah 2026', 248, '../assets/haflah1.JPG', 'https://drive.google.com', 'Dokumentasi resmi haflah akhirussanah dan wisuda angkatan 2026 SMAPSI.'),
('Pelantikan OSIS 2024', 64, '../assets/heroimages-osis.jpg', 'https://drive.google.com', 'Upacara pengukuhan dan serah terima pengurus OSIS SMAPSI 2024.')
ON CONFLICT DO NOTHING;

-- 3. TABEL PROFIL USER (Terhubung dengan Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'siswa')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pastikan kolom display_name dan avatar_url ada jika tabel sudah dibuat sebelumnya
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 4. TABEL LOG LOGIN SISTEM
CREATE TABLE IF NOT EXISTS public.login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    status TEXT NOT NULL,
    ip_address TEXT,
    device_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL AKUN GOOGLE DRIVE TERHUBUNG
CREATE TABLE IF NOT EXISTS public.drive_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    folder_url TEXT,
    storage_used_bytes BIGINT DEFAULT 0,
    storage_limit_bytes BIGINT DEFAULT 16106127360, -- 15 GB
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & HAK AKSES ANTI-HACKER (TANPA RECURSION)
-- ====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_accounts ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Public Read Albums" ON public.albums;
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Write Albums" ON public.albums;
DROP POLICY IF EXISTS "Admin Write Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Manage Users" ON public.user_profiles;

-- 1. Hak Akses Baca Publik (Semua Pengunjung Bisa Lihat Album, Kategori & Profile)
CREATE POLICY "Public Read Albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON public.user_profiles FOR SELECT USING (true);

-- 2. Hak Akses Tulis Admin (Insert / Update / Delete)
CREATE POLICY "Authenticated Insert Albums" ON public.albums FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated Update Albums" ON public.albums FOR UPDATE USING (true);
CREATE POLICY "Authenticated Delete Albums" ON public.albums FOR DELETE USING (true);

CREATE POLICY "Authenticated Insert Categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated Update Categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Authenticated Delete Categories" ON public.categories FOR DELETE USING (true);

CREATE POLICY "Enable Insert Profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable Update Profiles" ON public.user_profiles FOR UPDATE USING (true);
CREATE POLICY "Enable Delete Profiles" ON public.user_profiles FOR DELETE USING (true);

CREATE POLICY "Public Read Logs" ON public.login_logs FOR SELECT USING (true);
CREATE POLICY "Enable Insert Logs" ON public.login_logs FOR INSERT WITH CHECK (true);

-- 6. TABEL ALBUM TERSIMPAN USER (FAVORIT / BOOKMARK)
CREATE TABLE IF NOT EXISTS public.saved_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    album_slug TEXT NOT NULL,
    album_title TEXT NOT NULL,
    category TEXT,
    cover_url TEXT,
    photo_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(username, album_slug)
);

ALTER TABLE public.saved_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Saved Albums" ON public.saved_albums FOR SELECT USING (true);
CREATE POLICY "Enable Insert Saved Albums" ON public.saved_albums FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable Delete Saved Albums" ON public.saved_albums FOR DELETE USING (true);
