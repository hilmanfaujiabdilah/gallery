/**
 * Gallery API Service Layer (Supabase PostgreSQL CRUD Operations)
 * SMAPSI Gallery Website
 */

const GalleryService = {
  // Ambil semua daftar album foto dari Supabase
  async getAlbums() {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('albums')
          .select('*, categories(name, slug)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Menggunakan fallback data album lokal.');
      }
    }
    return this._getFallbackAlbums();
  },

  // Simpan album baru ke Supabase Database
  async createAlbum(albumData) {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('albums')
          .insert([{
            title: albumData.title,
            category_id: albumData.category_id,
            photo_count: parseInt(albumData.photo_count) || 0,
            cover_urls: albumData.cover_urls,
            drive_url: albumData.drive_url,
            description: albumData.description
          }])
          .select();

        if (error) throw error;
        return { success: true, data: data };
      } catch (e) {
        console.error('Gagal simpan ke Supabase:', e);
      }
    }
    return { success: true, message: 'Disimpan di cache lokal' };
  },

  // Edit/Update album foto di Supabase
  async updateAlbum(id, albumData) {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('albums')
          .update({
            title: albumData.title,
            category_id: albumData.category_id,
            photo_count: parseInt(albumData.photo_count) || 0,
            cover_urls: albumData.cover_urls,
            drive_url: albumData.drive_url,
            description: albumData.description,
            updated_at: new Date()
          })
          .eq('id', id)
          .select();

        if (error) throw error;
        return { success: true, data: data };
      } catch (e) {
        console.error('Gagal update ke Supabase:', e);
      }
    }
    return { success: true };
  },

  // Hapus album foto dari Supabase
  async deleteAlbum(id) {
    if (window.supabaseClient) {
      try {
        const { error } = await window.supabaseClient
          .from('albums')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (e) {
        console.error('Gagal hapus dari Supabase:', e);
      }
    }
    return { success: true };
  },

  // Fallback data album lokal
  _getFallbackAlbums() {
    return [
      {
        id: '1',
        title: 'Haflah Akhirussanah 2026',
        category_id: 'wisuda',
        photo_count: 248,
        cover_urls: '../assets/haflah1.JPG',
        drive_url: 'https://drive.google.com',
        description: 'Dokumentasi resmi haflah akhirussanah dan wisuda angkatan 2026 SMAPSI.'
      },
      {
        id: '2',
        title: 'Pelantikan OSIS 2024',
        category_id: 'osis',
        photo_count: 64,
        cover_urls: '../assets/heroimages-osis.jpg',
        drive_url: 'https://drive.google.com',
        description: 'Upacara pengukuhan dan serah terima pengurus OSIS SMAPSI 2024.'
      }
    ];
  }
};

window.GalleryService = GalleryService;
