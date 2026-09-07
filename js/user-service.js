/**
 * User Management API Service Layer (Supabase Auth & user_profiles PostgreSQL)
 * SMAPSI Gallery Website
 */

const UserService = {
  // Ambil semua daftar user dari public.user_profiles
  async getUsers() {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        console.warn('Menggunakan fallback data user lokal.');
      }
    }
    return this._getFallbackUsers();
  },

  // Tambah akun user baru ke Supabase
  async createUser(username, password, role) {
    if (window.supabaseClient) {
      try {
        const { data: profileData, error: profileErr } = await window.supabaseClient
          .from('user_profiles')
          .insert([{
            username: username,
            role: role,
            is_active: true
          }])
          .select();

        if (profileErr) throw profileErr;

        return { success: true, data: profileData };
      } catch (err) {
        console.error('Gagal membuat user di Supabase:', err);
        return { success: false, message: err.message };
      }
    }
    return { success: true };
  },

  // Mengubah status aktif / nonaktifkan akun
  async toggleUserStatus(id, currentStatus) {
    const newStatus = !currentStatus;
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('user_profiles')
          .update({ is_active: newStatus })
          .eq('id', id)
          .select();

        if (error) throw error;
        return { success: true, is_active: newStatus };
      } catch (err) {
        console.error('Gagal update status user di Supabase:', err);
      }
    }
    return { success: true, is_active: newStatus };
  },

  // Update profil user (nama lengkap, avatar, dll) ke database Supabase
  async updateUserProfile(username, updates = {}) {
    if (!username) return { success: false };
    if (window.supabaseClient) {
      try {
        const payload = {};
        if (updates.displayName !== undefined) payload.display_name = updates.displayName;
        if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;

        const { data, error } = await window.supabaseClient
          .from('user_profiles')
          .update(payload)
          .ilike('username', username)
          .select();

        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.warn('Simpan profil ke database Supabase offline/error:', err);
      }
    }
    return { success: true };
  },

  // Get all saved albums for a user from Supabase saved_albums table
  async getSavedAlbums(username) {
    if (!username) return [];
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('saved_albums')
          .select('*')
          .ilike('username', username)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          localStorage.setItem(`saved_albums_${username}`, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Gagal membaca saved_albums dari Supabase, memakai data lokal.');
      }
    }
    try {
      const local = localStorage.getItem(`saved_albums_${username}`);
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  },

  // Toggle save / unsave album in Supabase saved_albums table
  async toggleSaveAlbum(username, album) {
    if (!username || !album || !album.slug) return { success: false, isSaved: false };
    
    const currentList = await this.getSavedAlbums(username);
    const existing = currentList.find(item => item.album_slug === album.slug);

    if (existing) {
      if (window.supabaseClient) {
        try {
          await window.supabaseClient
            .from('saved_albums')
            .delete()
            .ilike('username', username)
            .eq('album_slug', album.slug);
        } catch (e) {
          console.warn('Gagal menghapus dari Supabase:', e);
        }
      }
      const newList = currentList.filter(item => item.album_slug !== album.slug);
      localStorage.setItem(`saved_albums_${username}`, JSON.stringify(newList));
      return { success: true, isSaved: false, action: 'removed' };
    } else {
      const newItem = {
        username: username,
        album_slug: album.slug,
        album_title: album.title || 'Album',
        category: album.category || 'Galeri',
        cover_url: album.coverUrl || album.cover_url || '',
        photo_count: album.photoCount || album.photo_count || 0,
        created_at: new Date().toISOString()
      };

      if (window.supabaseClient) {
        try {
          await window.supabaseClient
            .from('saved_albums')
            .insert([newItem]);
        } catch (e) {
          console.warn('Gagal menyimpan ke Supabase:', e);
        }
      }
      currentList.unshift(newItem);
      localStorage.setItem(`saved_albums_${username}`, JSON.stringify(currentList));
      return { success: true, isSaved: true, action: 'saved' };
    }
  },

  // Fallback data user lokal
  _getFallbackUsers() {
    return [
      { id: 'usr_1', username: 'admin_sekolah', role: 'admin', is_active: true, created_at: '2026-09-04T12:00:00Z' },
      { id: 'usr_2', username: 'siswa_xi_ipa1', role: 'siswa', is_active: true, created_at: '2026-09-04T14:30:00Z' },
      { id: 'usr_3', username: 'guru_bhs_indo', role: 'guru', is_active: true, created_at: '2026-09-04T15:10:00Z' }
    ];
  }
};

window.UserService = UserService;
