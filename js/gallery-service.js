/**
 * Gallery API Service Layer (Direct Supabase PostgreSQL Operations)
 * SMAPSI Gallery Website
 * Menyimpan dan mengelola data album secara murni langsung di database PostgreSQL Supabase
 */

const GalleryService = {
  // Ambil semua daftar album foto langsung dari database Supabase PostgreSQL (Urut berdasarkan Tanggal Kegiatan Terbaru)
  async getAlbums() {
    if (window.supabaseClient) {
      try {
        let { data, error } = await window.supabaseClient
          .from('albums')
          .select('*, categories(id, name, slug)')
          .order('event_date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error && error.message.includes('event_date')) {
          const fallback = await window.supabaseClient
            .from('albums')
            .select('*, categories(id, name, slug)')
            .order('created_at', { ascending: false });
          data = fallback.data;
          error = fallback.error;
        }

        if (error) {
          console.warn('Supabase fetch warning:', error.message);
          return [];
        }

        return data || [];
      } catch (e) {
        console.error('Gagal mengambil album dari Supabase:', e);
        return [];
      }
    }
    return [];
  },

  // Upload file Cover Album ke Supabase Storage (Bucket: album-covers)
  async uploadCoverFile(file, albumTitle = 'album') {
    if (!file) return '../assets/haflah1.JPG';

    const ext = file.name.split('.').pop().toLowerCase();
    const cleanSlug = (albumTitle || 'cover')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const filename = `cover-${cleanSlug}-${Date.now()}.${ext}`;

    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient.storage
          .from('album-covers')
          .upload(`covers/${filename}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: publicUrlData } = window.supabaseClient.storage
            .from('album-covers')
            .getPublicUrl(`covers/${filename}`);

          if (publicUrlData && publicUrlData.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload error, fallback to local URL:', err);
      }
    }

    // Fallback Data URL jika storage bucket belum dibuat
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve('../assets/haflah1.JPG');
      reader.readAsDataURL(file);
    });
  },

  // Simpan album baru langsung ke PostgreSQL Supabase
  async createAlbum(albumData) {
    if (!window.supabaseClient) {
      throw new Error('Supabase client belum terhubung');
    }

    try {
      // Dapatkan Category UUID jika category_id berupa slug/nama
      let categoryId = albumData.category_id || null;
      if (categoryId && typeof categoryId === 'string' && !categoryId.includes('-')) {
        try {
          const { data: catData } = await window.supabaseClient
            .from('categories')
            .select('id')
            .eq('slug', categoryId.toLowerCase())
            .maybeSingle();
          if (catData && catData.id) {
            categoryId = catData.id;
          } else {
            categoryId = null;
          }
        } catch (catErr) {
          categoryId = null;
        }
      }

      const eventDate = albumData.event_date || new Date().toISOString().split('T')[0];
      const year = eventDate ? new Date(eventDate).getFullYear() : (parseInt(albumData.year) || new Date().getFullYear());

      let insertPayload = {
        title: albumData.title,
        category_id: categoryId,
        photo_count: parseInt(albumData.photo_count) || 0,
        cover_urls: albumData.cover_urls || albumData.cover_url || '../assets/haflah1.JPG',
        drive_url: albumData.drive_url,
        description: albumData.description || '',
        event_date: eventDate,
        year: year,
        is_featured: !!albumData.is_featured
      };

      let { data, error } = await window.supabaseClient
        .from('albums')
        .insert([insertPayload])
        .select('*, categories(id, name, slug)');

      // Jika kolom event_date / year / is_featured belum dibuat di Supabase, coba tanpa kolom tersebut
      if (error && (error.message.includes('event_date') || error.message.includes('year') || error.message.includes('is_featured'))) {
        console.warn('Kolom event_date/year/is_featured belum ada di database, menyimpan kolom standar...');
        delete insertPayload.event_date;
        delete insertPayload.year;
        delete insertPayload.is_featured;
        const retryRes = await window.supabaseClient
          .from('albums')
          .insert([insertPayload])
          .select('*, categories(id, name, slug)');
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) throw error;
      return { success: true, data: (data && data[0]) || insertPayload };
    } catch (e) {
      console.error('Gagal menyimpan album ke Supabase:', e);
      throw e;
    }
  },

  // Edit/Update album foto di PostgreSQL Supabase
  async updateAlbum(id, albumData) {
    if (!window.supabaseClient) {
      throw new Error('Supabase client belum terhubung');
    }

    try {
      let categoryId = albumData.category_id || null;
      if (categoryId && typeof categoryId === 'string' && !categoryId.includes('-')) {
        try {
          const { data: catData } = await window.supabaseClient
            .from('categories')
            .select('id')
            .eq('slug', categoryId.toLowerCase())
            .maybeSingle();
          if (catData && catData.id) categoryId = catData.id;
        } catch (catErr) {}
      }

      const eventDate = albumData.event_date || new Date().toISOString().split('T')[0];
      const year = eventDate ? new Date(eventDate).getFullYear() : (parseInt(albumData.year) || new Date().getFullYear());

      let updatePayload = {
        title: albumData.title,
        category_id: categoryId,
        photo_count: parseInt(albumData.photo_count) || 0,
        cover_urls: albumData.cover_urls || albumData.cover_url,
        drive_url: albumData.drive_url,
        description: albumData.description || '',
        event_date: eventDate,
        year: year,
        is_featured: !!albumData.is_featured,
        updated_at: new Date().toISOString()
      };

      let { data, error } = await window.supabaseClient
        .from('albums')
        .update(updatePayload)
        .eq('id', id)
        .select('*, categories(id, name, slug)');

      if (error && (error.message.includes('event_date') || error.message.includes('year') || error.message.includes('is_featured'))) {
        delete updatePayload.event_date;
        delete updatePayload.year;
        delete updatePayload.is_featured;
        const retryRes = await window.supabaseClient
          .from('albums')
          .update(updatePayload)
          .eq('id', id)
          .select('*, categories(id, name, slug)');
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) throw error;
      return { success: true, data: (data && data[0]) || updatePayload };
    } catch (e) {
      console.error('Gagal update album di Supabase:', e);
      throw e;
    }
  },

  // Hapus album foto langsung dari PostgreSQL Supabase
  async deleteAlbum(id) {
    if (!window.supabaseClient) {
      throw new Error('Supabase client belum terhubung');
    }

    try {
      const { error } = await window.supabaseClient
        .from('albums')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error('Gagal menghapus album dari Supabase:', e);
      throw e;
    }
  }
};

window.GalleryService = GalleryService;
