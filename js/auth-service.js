/**
 * Authentication Service Layer (Supabase Auth & Session Security)
 * SMAPSI Gallery Website
 */

const AuthService = {
  // Login dengan memeriksa database public.user_profiles di Supabase
  async login(emailOrUsername, password) {
    const inputUser = (emailOrUsername || '').trim();
    if (!inputUser) {
      return { success: false, message: 'Username atau email harus diisi.' };
    }

    if (window.supabaseClient) {
      try {
        // 1. Cari user di public.user_profiles di Supabase (case-insensitive)
        const { data: profiles, error } = await window.supabaseClient
          .from('user_profiles')
          .select('*')
          .ilike('username', inputUser)
          .limit(1);

        if (!error && profiles && profiles.length > 0) {
          const profile = profiles[0];

          // 2. Cek apakah password cocok secara ketat sesuai yang didaftarkan
          if (!profile.password || profile.password !== password) {
            await this.logActivity(profile.username, 'Gagal (Sandi Salah)', profile.role);
            return {
              success: false,
              message: 'Kata sandi yang Anda masukkan salah.'
            };
          }

          // 3. Cek apakah status akun aktif
          if (profile.is_active === false) {
            await this.logActivity(profile.username, 'Gagal (Nonaktif)', profile.role);
            return {
              success: false,
              message: 'Akun Anda sedang dinonaktifkan oleh Administrator.'
            };
          }

          // 4. Set Session Data & Role berdasarkan data asli di Supabase
          const role = (profile.role || 'siswa').toLowerCase();
          const sessionData = {
            user: profile.username,
            role: role,
            userId: profile.id,
            displayName: profile.display_name || profile.name || profile.username,
            avatar: profile.avatar_url || profile.avatar || '',
            expiry: Date.now() + (2 * 60 * 60 * 1000) // 2 jam sesi
          };

          localStorage.setItem('user_session', JSON.stringify(sessionData));
          
          // Await pencatatan log login
          await this.logActivity(profile.username, 'Berhasil', role);

          return { success: true, role: role, data: profile };
        } else {
          await this.logActivity(inputUser, 'Gagal (User Tidak Ditemukan)', 'guest');
        }
      } catch (err) {
        console.warn('Query ke Supabase error, beralih ke fallback:', err);
      }
    }

    // Fallback jika tidak ditemukan di Supabase / offline
    return this._fallbackLogin(inputUser, password);
  },

  // Ambil riwayat log login dari public.login_logs / localStorage
  async getLogs() {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('login_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Query log login error:', e);
      }
    }
    return this._getFallbackLogs();
  },

  // Logout aman
  async logout() {
    if (window.supabaseClient) {
      await window.supabaseClient.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('user_session');
    window.location.href = '../login.html';
  },

  // Catat Log Login ke public.login_logs dan localStorage
  async logActivity(username, status, role = 'user') {
    const newLog = {
      id: 'log_' + Date.now(),
      created_at: new Date().toISOString(),
      username: username,
      status: status,
      ip_address: '127.0.0.1',
      device_info: navigator.userAgent.includes('Chrome') ? 'Chrome (Desktop)' : 'Browser Desktop'
    };

    try {
      const localLogs = JSON.parse(localStorage.getItem('system_login_logs') || '[]');
      localLogs.unshift(newLog);
      localStorage.setItem('system_login_logs', JSON.stringify(localLogs.slice(0, 100)));
    } catch (e) {
      console.warn('Error saving local log:', e);
    }

    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('login_logs').insert([{
          username: username,
          status: status,
          ip_address: newLog.ip_address,
          device_info: newLog.device_info
        }]);
      } catch (err) {
        console.warn('Gagal catat log ke Supabase:', err);
      }
    }
  },

  async _fallbackLogin(username, password) {
    if ((username === 'admin' || username === 'admin_sekolah') && password === 'admin123') {
      const sessionData = {
        user: username,
        role: 'admin',
        expiry: Date.now() + (2 * 60 * 60 * 1000)
      };
      localStorage.setItem('user_session', JSON.stringify(sessionData));
      await this.logActivity(username, 'Berhasil', 'admin');
      return { success: true, role: 'admin' };
    } else if (username === 'siswa' && password === 'siswa123') {
      const sessionData = {
        user: username,
        role: 'siswa',
        expiry: Date.now() + (2 * 60 * 60 * 1000)
      };
      localStorage.setItem('user_session', JSON.stringify(sessionData));
      await this.logActivity(username, 'Berhasil', 'siswa');
      return { success: true, role: 'siswa' };
    } else {
      await this.logActivity(username, 'Gagal (Sandi Salah)', 'guest');
      return { success: false, message: 'Username atau kata sandi tidak cocok!' };
    }
  },

  _getFallbackLogs() {
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem('system_login_logs') || '[]');
    } catch (e) {}

    if (local.length > 0) return local;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const initialLogs = [
      // Hari Ini (5 Sep)
      { created_at: new Date(now - 1000 * 60 * 20).toISOString(), username: 'hilmanfauziabdilah', status: 'Berhasil', ip_address: '127.0.0.1', device_info: 'Chrome (Desktop)' },
      { created_at: new Date(now - 1000 * 60 * 55).toISOString(), username: 'admin_sekolah', status: 'Berhasil', ip_address: '192.168.1.15', device_info: 'Chrome (Windows 11)' },
      { created_at: new Date(now - 1000 * 60 * 150).toISOString(), username: 'siswa_01', status: 'Berhasil', ip_address: '192.168.1.44', device_info: 'Safari (iPhone)' },
      { created_at: new Date(now - 1000 * 60 * 280).toISOString(), username: 'guru_matematika', status: 'Berhasil', ip_address: '192.168.1.88', device_info: 'Chrome (Macintosh)' },
      
      // Kemarin (4 Sep)
      { created_at: new Date(now - dayMs - 1000 * 3600 * 2).toISOString(), username: 'hilmanfauziabdilah', status: 'Berhasil', ip_address: '127.0.0.1', device_info: 'Chrome (Desktop)' },
      { created_at: new Date(now - dayMs - 1000 * 3600 * 4).toISOString(), username: 'admin_sekolah', status: 'Berhasil', ip_address: '192.168.1.15', device_info: 'Chrome (Windows 11)' },
      { created_at: new Date(now - dayMs - 1000 * 3600 * 7).toISOString(), username: 'siswa_02', status: 'Berhasil', ip_address: '192.168.1.50', device_info: 'Chrome (Android)' },

      // 3 Sep
      { created_at: new Date(now - dayMs * 2 - 1000 * 3600 * 3).toISOString(), username: 'guru_fisika', status: 'Berhasil', ip_address: '192.168.1.90', device_info: 'Firefox (Windows)' },
      { created_at: new Date(now - dayMs * 2 - 1000 * 3600 * 6).toISOString(), username: 'admin_sekolah', status: 'Berhasil', ip_address: '192.168.1.15', device_info: 'Chrome (Windows 11)' },

      // 2 Sep
      { created_at: new Date(now - dayMs * 3 - 1000 * 3600 * 4).toISOString(), username: 'siswa_04', status: 'Berhasil', ip_address: '192.168.1.60', device_info: 'Chrome (Android)' },
      { created_at: new Date(now - dayMs * 3 - 1000 * 3600 * 7).toISOString(), username: 'admin', status: 'Berhasil', ip_address: '192.168.1.10', device_info: 'Edge (Windows)' },

      // 1 Sep
      { created_at: new Date(now - dayMs * 4 - 1000 * 3600 * 5).toISOString(), username: 'hilmanfauziabdilah', status: 'Berhasil', ip_address: '127.0.0.1', device_info: 'Chrome (Desktop)' },

      // 31 Agu
      { created_at: new Date(now - dayMs * 5 - 1000 * 3600 * 6).toISOString(), username: 'admin_sekolah', status: 'Berhasil', ip_address: '192.168.1.15', device_info: 'Chrome (Windows 11)' },
      { created_at: new Date(now - dayMs * 5 - 1000 * 3600 * 8).toISOString(), username: 'guru_biologi', status: 'Berhasil', ip_address: '192.168.1.92', device_info: 'Chrome (Windows)' },

      // 30 Agu
      { created_at: new Date(now - dayMs * 6 - 1000 * 3600 * 7).toISOString(), username: 'hilmanfauziabdilah', status: 'Berhasil', ip_address: '127.0.0.1', device_info: 'Chrome (Desktop)' }
    ];

    try {
      localStorage.setItem('system_login_logs', JSON.stringify(initialLogs));
    } catch (e) {}

    return initialLogs;
  }
};

window.AuthService = AuthService;
