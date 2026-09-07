/* ═══════════════════════════════════════════════
   DARK LUXURY POPUP MODAL & TOAST SYSTEM
═══════════════════════════════════════════════ */

function showLuxuryModal(options = {}) {
  const {
    title = 'Pemberitahuan',
    message = '',
    type = 'info', // 'success', 'error', 'warning', 'confirm', 'danger'
    confirmText = 'OK',
    cancelText = 'Batal',
    onConfirm = null,
    onCancel = null
  } = options;

  let overlay = document.getElementById('luxuryPopupOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'luxuryPopupOverlay';
    overlay.className = 'luxury-overlay';
    document.body.appendChild(overlay);
  }

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else if (type === 'confirm' || type === 'danger' || type === 'warning') {
    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else {
    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  const isConfirm = type === 'confirm' || type === 'danger';
  const confirmBtnClass = type === 'danger' ? 'modal-btn-danger' : 'modal-btn-primary';

  overlay.innerHTML = `
    <div class="luxury-modal">
      <div class="modal-icon-badge ${type}">
        ${iconSvg}
      </div>
      <div class="modal-title">${title}</div>
      <div class="modal-desc">${message}</div>
      <div class="modal-actions">
        ${isConfirm ? `<button class="modal-btn modal-btn-secondary" id="luxuryModalCancel">${cancelText}</button>` : ''}
        <button class="modal-btn ${confirmBtnClass}" id="luxuryModalConfirm">${confirmText}</button>
      </div>
    </div>
  `;

  setTimeout(() => overlay.classList.add('active'), 10);

  const closeModal = () => {
    overlay.classList.remove('active');
  };

  const confirmBtn = document.getElementById('luxuryModalConfirm');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      closeModal();
      if (typeof onConfirm === 'function') onConfirm();
    };
  }

  if (isConfirm) {
    const cancelBtn = document.getElementById('luxuryModalCancel');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        closeModal();
        if (typeof onCancel === 'function') onCancel();
      };
    }
  }
}

function showToast(message, type = 'success') {
  let container = document.getElementById('luxuryToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'luxuryToastContainer';
    container.className = 'luxury-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'luxury-toast';

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  } else {
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon ${type}">${iconSvg}</div>
    <div class="toast-text">${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('active'), 10);

  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}
