/**
 * Category API Service Layer (Supabase PostgreSQL Operations)
 * SMAPSI Gallery Website
 */

const CategoryService = {
  // Ambil semua daftar kategori dari Supabase
  async getCategories() {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Menggunakan fallback kategori lokal.');
      }
    }
    return this._getFallbackCategories();
  },

  // Tambah kategori baru ke Supabase
  async createCategory(name) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('categories')
          .insert([{ name: name, slug: slug }])
          .select();

        if (error) throw error;
        return { success: true, data: data };
      } catch (e) {
        console.error('Gagal simpan kategori ke Supabase:', e);
      }
    }
    return { success: true, data: [{ id: slug, name: name, slug: slug }] };
  },

  // Edit kategori
  async updateCategory(id, newName) {
    const slug = newName.toLowerCase().replace(/\s+/g, '-');
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('categories')
          .update({ name: newName, slug: slug })
          .eq('id', id)
          .select();

        if (error) throw error;
        return { success: true, data: data };
      } catch (e) {
        console.error('Gagal update kategori ke Supabase:', e);
      }
    }
    return { success: true };
  },

  // Hapus kategori
  async deleteCategory(id) {
    if (window.supabaseClient) {
      try {
        const { error } = await window.supabaseClient
          .from('categories')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (e) {
        console.error('Gagal hapus kategori dari Supabase:', e);
      }
    }
    return { success: true };
  },

  _getFallbackCategories() {
    return [
      { id: 'wisuda', name: 'Wisuda', slug: 'wisuda' },
      { id: 'osis', name: 'OSIS', slug: 'osis' },
      { id: 'olahraga', name: 'Olahraga', slug: 'olahraga' },
      { id: 'seni', name: 'Seni Budaya', slug: 'seni' },
      { id: 'tour', name: 'Study Tour', slug: 'tour' },
      { id: 'lomba', name: 'Lomba', slug: 'lomba' }
    ];
  }
};

window.CategoryService = CategoryService;
