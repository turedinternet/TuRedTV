import { loadAppConfig } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
  // UI Elements
  const appVersionEl = document.getElementById('app-version');
  const appSizeEl = document.getElementById('app-size');
  const appMinAndroidEl = document.getElementById('app-min-android');
  const downloadBtn = document.getElementById('main-download-btn');
  const downloaderCodeEl = document.getElementById('downloader-code');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const changelogEl = document.getElementById('changelog-content');
  
  // Modals
  const qrModal = document.getElementById('qr-modal');
  const openQrBtn = document.getElementById('open-qr-btn');
  const closeQrBtn = document.getElementById('close-qr-btn');
  const qrContainer = document.getElementById('qr-code-img');

  // Load active app configuration
  const config = await loadAppConfig();
  renderAppDetails(config);

  function renderAppDetails(data) {
    if (appVersionEl) appVersionEl.textContent = `v${data.version || '2.5.0'}`;
    if (appSizeEl) appSizeEl.textContent = data.fileSize || '45.2 MB';
    if (appMinAndroidEl) appMinAndroidEl.textContent = data.minAndroid || 'Android 5.0+';
    if (downloaderCodeEl) downloaderCodeEl.textContent = data.downloaderCode || '---';
    
    if (downloadBtn) {
      const base = window.location.origin + window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '/');
      const downloadLink = base + 'download.html';

      if (data.downloadUrl) {
        downloadBtn.href = downloadLink;
      } else {
        downloadBtn.href = '#';
        downloadBtn.textContent = 'Configura la URL de descarga en el panel de administración';
        downloadBtn.style.opacity = '0.6';
        downloadBtn.style.cursor = 'not-allowed';
      }
    }

    if (changelogEl && data.changelog) {
      changelogEl.textContent = data.changelog;
    }

    // Generate QR Code image URL pointing to download.html
    if (qrContainer) {
      const base = window.location.origin + window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '/');
      const downloadLink = base + 'download.html';
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(downloadLink)}&color=007cc3&bgcolor=ffffff`;
      qrContainer.src = qrApiUrl;
    }
  }

  // Copy Downloader Code logic
  if (copyCodeBtn && downloaderCodeEl) {
    copyCodeBtn.addEventListener('click', () => {
      const code = downloaderCodeEl.textContent.trim();
      navigator.clipboard.writeText(code).then(() => {
        showToast('¡Código copiado al portapapeles! Usa este código en la App Downloader de tu Smart TV.');
        copyCodeBtn.textContent = '¡Copiado!';
        setTimeout(() => copyCodeBtn.textContent = 'Copiar', 2000);
      }).catch(err => {
        showToast(`Código: ${code}`);
      });
    });
  }

  // QR Modal Handlers
  if (openQrBtn && qrModal) {
    openQrBtn.addEventListener('click', () => qrModal.classList.add('active'));
  }
  if (closeQrBtn && qrModal) {
    closeQrBtn.addEventListener('click', () => qrModal.classList.remove('active'));
  }
  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) qrModal.classList.remove('active');
    });
  }

  // Toast notification helper
  function showToast(message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
