/**
 * Google Drive API Service Layer
 * SMAPSI Gallery Website
 * Struktur Hirarki: Master Folder (5TB) -> Subfolder Kategori -> Subfolder Album
 * Mendukung pembacaan via API Key & pengelolaan folder via Google Apps Script Bridge
 */

const GoogleDriveService = {
  API_KEY: 'AIzaSyAfgQXIABFmokD3oU-Wur2ycr3uAEdtqf8',
  MASTER_FOLDER_ID: '1iFCY5EkdVfV11P2eJ0rjmEqozan1rkyI',
  MASTER_FOLDER_URL: 'https://drive.google.com/drive/folders/1iFCY5EkdVfV11P2eJ0rjmEqozan1rkyI?usp=sharing',
  
  // Google Apps Script Web App URL (untuk membuat/mengedit/menghapus folder secara langsung di Drive)
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxh1MgKrIbZ3jcNLUdwrZayxRomRn5RE_Nd_6u71-eycCFI2AUPYS56V6F5bJzMg0LSDg/exec',

  setAppsScriptUrl(url) {
    this.APPS_SCRIPT_URL = (url || 'https://script.google.com/macros/s/AKfycbxh1MgKrIbZ3jcNLUdwrZayxRomRn5RE_Nd_6u71-eycCFI2AUPYS56V6F5bJzMg0LSDg/exec').trim();
    if (this.APPS_SCRIPT_URL) {
      localStorage.setItem('gdrive_apps_script_url', this.APPS_SCRIPT_URL);
    } else {
      localStorage.removeItem('gdrive_apps_script_url');
    }
  },

  // Ekstrak Folder ID dari berbagai format link Google Drive
  extractFolderId(urlOrId) {
    if (!urlOrId) return null;
    const str = String(urlOrId).trim();
    
    if (/^[a-zA-Z0-9_-]{25,}$/.test(str)) {
      return str;
    }

    const folderMatch = str.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
      return folderMatch[1];
    }

    const idParamMatch = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return idParamMatch[1];
    }

    return null;
  },

  // Ambil subfolder di dalam suatu folder ID tertentu via Google Drive API v3
  async getSubfolders(parentFolderId = this.MASTER_FOLDER_ID) {
    const folderId = this.extractFolderId(parentFolderId) || this.MASTER_FOLDER_ID;
    try {
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`);
      const fields = encodeURIComponent('files(id, name, createdTime, modifiedTime, webViewLink)');
      const endpoint = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=100&orderBy=name&key=${this.API_KEY}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      if (!result.files || !Array.isArray(result.files)) {
        return [];
      }

      return result.files.map(folder => ({
        id: folder.id,
        name: folder.name,
        url: `https://drive.google.com/drive/folders/${folder.id}?usp=sharing`,
        createdTime: folder.createdTime || new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  },

  // Ambil hirarki 2 level: Master -> Folder Kategori -> Folder Album
  async getCategoryAndAlbumTree() {
    // 1. Ambil langsung via Apps Script (Sinkronisasi penuh Google Drive Live)
    if (this.APPS_SCRIPT_URL) {
      try {
        const res = await fetch(`${this.APPS_SCRIPT_URL}?action=getTree`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (e) {
        console.warn('Apps Script getTree request failed:', e);
      }
    }

    // 2. Coba via Google Drive API Key v3 jika Apps Script belum merespons
    try {
      const catFolders = await this.getSubfolders(this.MASTER_FOLDER_ID);
      
      if (catFolders && catFolders.length > 0) {
        const tree = [];
        for (const cat of catFolders) {
          const albumFolders = await this.getSubfolders(cat.id);
          tree.push({
            categoryId: cat.id,
            categoryName: cat.name,
            categoryUrl: cat.url,
            albums: albumFolders.length > 0 ? albumFolders.map(a => ({ ...a, categoryName: cat.name })) : []
          });
        }
        return tree;
      }
    } catch (e) {
      console.warn('API Key getSubfolders error:', e);
    }

    return [];
  },

  // Buat folder album baru di bawah kategori
  async createAlbumFolder(categoryName, folderName) {
    if (!folderName) throw new Error('Nama folder album tidak boleh kosong');

    if (!this.APPS_SCRIPT_URL) {
      throw new Error('Google Apps Script URL belum dikonfigurasi');
    }

    try {
      const url = `${this.APPS_SCRIPT_URL}?action=createFolder&category=${encodeURIComponent(categoryName)}&name=${encodeURIComponent(folderName)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        return { success: true, data: json.data };
      } else {
        throw new Error(json.error || 'Gagal membuat folder di Google Drive');
      }
    } catch (e) {
      console.error('Apps Script createFolder error:', e);
      throw e;
    }
  },

  // Edit nama folder album
  async renameAlbumFolder(folderId, newName, categoryName) {
    if (!folderId || !newName) throw new Error('Parameter tidak lengkap');

    if (!this.APPS_SCRIPT_URL) {
      throw new Error('Google Apps Script URL belum dikonfigurasi');
    }

    try {
      const url = `${this.APPS_SCRIPT_URL}?action=renameFolder&folderId=${encodeURIComponent(folderId)}&newName=${encodeURIComponent(newName)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        return { success: true };
      } else {
        throw new Error(json.error || 'Gagal mengubah nama folder di Google Drive');
      }
    } catch (e) {
      console.error('Apps Script renameFolder error:', e);
      throw e;
    }
  },

  // Hapus folder album
  async deleteAlbumFolder(folderId, categoryName) {
    if (!folderId) throw new Error('Folder ID diperlukan');

    if (!this.APPS_SCRIPT_URL) {
      throw new Error('Google Apps Script URL belum dikonfigurasi');
    }

    try {
      const url = `${this.APPS_SCRIPT_URL}?action=deleteFolder&folderId=${encodeURIComponent(folderId)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        return { success: true };
      } else {
        throw new Error(json.error || 'Gagal menghapus folder di Google Drive');
      }
    } catch (e) {
      console.error('Apps Script deleteFolder error:', e);
      throw e;
    }
  },

  // Ambil daftar foto dari folder Google Drive (Mendukung folder dengan ratusan/ribuan foto)
  async getPhotosFromFolder(folderUrlOrId) {
    const folderId = this.extractFolderId(folderUrlOrId);
    if (!folderId) {
      return [];
    }

    try {
      let allFiles = [];
      let pageToken = null;

      do {
        const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType contains 'image/'`);
        const fields = encodeURIComponent('nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, imageMediaMetadata)');
        let endpoint = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=100&orderBy=createdTime&key=${this.API_KEY}`;
        if (pageToken) {
          endpoint += `&pageToken=${encodeURIComponent(pageToken)}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) break;

        const result = await response.json();
        if (result.files && Array.isArray(result.files)) {
          allFiles.push(...result.files);
        }
        pageToken = result.nextPageToken || null;
      } while (pageToken);

      return allFiles.map(file => {
        let highResUrl = `https://lh3.googleusercontent.com/d/${file.id}=s1600`;
        let thumbUrl = `https://lh3.googleusercontent.com/d/${file.id}=s400`;

        if (file.thumbnailLink) {
          highResUrl = file.thumbnailLink.replace(/=s\d+/, '=s1600');
          thumbUrl = file.thumbnailLink.replace(/=s\d+/, '=s400');
        }

        return {
          id: file.id,
          name: file.name,
          url: highResUrl,
          thumbnail: thumbUrl,
          directLink: `https://drive.google.com/file/d/${file.id}/view`,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`
        };
      });
    } catch (err) {
      console.warn('Gagal memuat foto dari Google Drive:', err);
      return [];
    }
  }
};

window.GoogleDriveService = GoogleDriveService;
