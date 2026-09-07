/**
 * User Profile Modal & Password Management Component
 * SMAPSI Gallery Website
 */

(function () {
  // Inject CSS Styles for Profile Button & Profile Modal
  const style = document.createElement('style');
  style.id = 'user-profile-modal-styles';
  style.textContent = `
    /* Profile Button in Navbar - Google Style Clean Circular Avatar */
    .nav-profile-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      border-radius: 50% !important;
      color: var(--white, #f0efe9);
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      text-decoration: none;
      outline: none;
      box-shadow: none !important;
    }

    .nav-profile-btn:hover {
      background: transparent !important;
      border: none !important;
      transform: scale(1.08);
    }

    @media (max-width: 768px) {
      .nav-profile-btn {
        margin-left: auto !important;
        margin-right: 12px !important;
      }
    }

    .nav-avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #09090b;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: #ffffff;
      font-weight: 600;
      font-size: 13px;
      flex-shrink: 0;
      border: 2px solid #3b82f6 !important;
      padding: 1.5px;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.35);
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .nav-avatar-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    /* Light Theme Adjustments for Navbar Button */
    body.light-theme .nav-profile-btn {
      background: transparent !important;
      border: none !important;
    }
    body.light-theme .nav-profile-btn:hover {
      background: transparent !important;
      border: none !important;
    }

    /* Modal Overlay & Card */
    .profile-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .profile-modal-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    .profile-modal-card {
      width: 100%;
      max-width: 440px;
      background: #141418;
      border: 0.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 255, 255, 0.03);
      overflow: hidden;
      transform: scale(0.94) translateY(10px);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      color: #f0efe9;
      font-family: var(--sans, 'DM Sans', sans-serif);
    }

    .profile-modal-overlay.active .profile-modal-card {
      transform: scale(1) translateY(0);
    }

    /* Header Banner */
    .profile-modal-header {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
      padding: 24px 20px 18px;
      text-align: center;
      position: relative;
      border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
    }

    .profile-modal-close {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(255, 255, 255, 0.08);
      border: 0.5px solid rgba(255, 255, 255, 0.12);
      color: #94a3b8;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .profile-modal-close:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }

    .profile-large-avatar-wrap {
      width: 72px;
      height: 72px;
      margin: 0 auto 12px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
      position: relative;
    }

    .profile-large-avatar-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-user-name {
      font-family: var(--serif, 'Cormorant Garamond', Georgia, serif);
      font-size: 20px;
      font-weight: 600;
      color: #f8fafc;
      letter-spacing: -0.01em;
    }

    .profile-user-handle {
      font-family: var(--mono, 'DM Mono', monospace);
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }

    .profile-role-badge {
      display: inline-block;
      margin-top: 8px;
      font-family: var(--mono, 'DM Mono', monospace);
      font-size: 10px;
      padding: 3px 10px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .profile-role-badge.admin {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 0.5px solid rgba(245, 158, 11, 0.3);
    }

    .profile-role-badge.user {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 0.5px solid rgba(16, 185, 129, 0.3);
    }

    /* Modal Navigation Tabs */
    .profile-tabs {
      display: flex;
      border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
    }

    .profile-tab-btn {
      flex: 1;
      padding: 11px 12px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: #94a3b8;
      font-family: var(--sans, 'DM Sans', sans-serif);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .profile-tab-btn.active {
      color: #ffffff;
      border-bottom-color: #3b82f6;
      background: rgba(255, 255, 255, 0.02);
    }

    /* Modal Body Content */
    .profile-modal-body {
      padding: 20px;
      max-height: 380px;
      overflow-y: auto;
    }

    .profile-tab-content {
      display: none;
    }

    .profile-tab-content.active {
      display: block;
    }

    .profile-form-group {
      margin-bottom: 14px;
    }

    .profile-form-group label {
      display: block;
      font-size: 11px;
      font-family: var(--mono, 'DM Mono', monospace);
      color: #94a3b8;
      margin-bottom: 5px;
    }

    .profile-form-input {
      width: 100%;
      background: #09090b;
      border: 0.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #f8fafc;
      font-family: var(--sans, 'DM Sans', sans-serif);
      font-size: 12.5px;
      outline: none;
      transition: border-color 0.2s;
    }

    .profile-form-input:focus {
      border-color: #3b82f6;
    }

    /* Avatar Presets Grid */
    .avatar-presets-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-top: 8px;
    }

    .avatar-preset-item {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1.5px solid transparent;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.2s;
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-preset-item:hover, .avatar-preset-item.selected {
      border-color: #3b82f6;
      transform: scale(1.08);
    }

    .avatar-preset-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Footer Action Buttons */
    .profile-modal-footer {
      padding: 14px 20px;
      background: rgba(0, 0, 0, 0.3);
      border-top: 0.5px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .btn-profile-save {
      background: #3b82f6;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 9px 16px;
      font-family: var(--sans, 'DM Sans', sans-serif);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-profile-save:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-profile-logout {
      background: rgba(239, 68, 68, 0.12);
      color: #f87171;
      border: 0.5px solid rgba(239, 68, 68, 0.25);
      border-radius: 6px;
      padding: 9px 14px;
      font-family: var(--sans, 'DM Sans', sans-serif);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-profile-logout:hover {
      background: rgba(239, 68, 68, 0.22);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.4);
    }
  `;
  document.head.appendChild(style);
})();

// Helper to extract first name
function getFirstName(fullName) {
  if (!fullName) return 'User';
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
}

// Get user session data safely
function getUserSession() {
  try {
    const s = localStorage.getItem('user_session');
    if (!s) return null;
    const session = JSON.parse(s);
    if (session.expiry && Date.now() > session.expiry) {
      localStorage.removeItem('user_session');
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

// Render or Update Navbar Profile Button
function updateNavbarProfileUI() {
  const session = getUserSession();
  const ctaBtn = document.querySelector('.nav-cta') || document.getElementById('navCtaBtn');

  if (!ctaBtn) return;

  if (session) {
    const rawName = session.displayName || session.name || session.user || 'User';
    const firstName = getFirstName(rawName);
    const avatarUrl = session.avatar || '';

    let avatarInner = '';
    if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:') || avatarUrl.startsWith('.') || avatarUrl.startsWith('assets/'))) {
      avatarInner = `<img src="${avatarUrl}" alt="${firstName}">`;
    } else {
      avatarInner = firstName.charAt(0).toUpperCase();
    }

    // Convert nav-cta to profile button
    const targetPath = window.location.pathname.includes('/admin/') ? '../profile.html' : 'profile.html';
    ctaBtn.className = 'nav-profile-btn';
    ctaBtn.href = targetPath;
    ctaBtn.title = rawName;
    ctaBtn.onclick = null;

    ctaBtn.innerHTML = `
      <div class="nav-avatar-circle">
        ${avatarInner}
      </div>
    `;
  } else {
    // Default logged out state
    ctaBtn.className = 'nav-cta';
    ctaBtn.href = window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
    ctaBtn.onclick = null;
    ctaBtn.textContent = 'Masuk';
  }
}

// Open User Profile - Navigate to Dedicated Page
function openUserProfileModal() {
  const targetPath = window.location.pathname.includes('/admin/') ? '../profile.html' : 'profile.html';
  window.location.href = targetPath;
}

// Logout Action
function handleProfileLogout() {
  if (window.showLuxuryModal) {
    showLuxuryModal({
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari sesi akun Anda?',
      type: 'confirm',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      onConfirm: () => {
        localStorage.removeItem('user_session');
        if (window.showToast) showToast('Anda telah keluar akun.', 'info');
        setTimeout(() => {
          window.location.href = window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
        }, 500);
      }
    });
  } else {
    localStorage.removeItem('user_session');
    window.location.href = window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
  }
}

// Auto update navbar on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarProfileUI();
});
