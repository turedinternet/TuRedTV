import { loadAppConfig, saveAppConfig, getFirebaseCredentials, saveFirebaseCredentials } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Sections
  const authContainer = document.getElementById('auth-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const statusBadge = document.getElementById('status-badge');

  // Auth Elements
  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const btnLogout = document.getElementById('btn-logout');

  // App Form Elements
  const appForm = document.getElementById('app-config-form');
  const adminUrlInput = document.getElementById('admin-download-url');
  const adminApkFileInput = document.getElementById('admin-apk-file');
  const adminVersionInput = document.getElementById('admin-version');
  const adminDownloaderCodeInput = document.getElementById('admin-downloader-code');
  const adminFileSizeInput = document.getElementById('admin-file-size');
  const adminMinAndroidInput = document.getElementById('admin-min-android');
  const adminChangelogInput = document.getElementById('admin-changelog');

  // Firebase Config Modal Elements
  const firebaseModal = document.getElementById('firebase-modal');
  const btnOpenFbSettings = document.getElementById('btn-open-firebase-settings');
  const btnCloseFbModal = document.getElementById('close-firebase-btn');
  const fbForm = document.getElementById('firebase-credentials-form');
  const fbApiKeyInput = document.getElementById('fb-api-key');
  const fbAuthDomainInput = document.getElementById('fb-auth-domain');
  const fbProjectIdInput = document.getElementById('fb-project-id');
  const fbStorageBucketInput = document.getElementById('fb-storage-bucket');

  let currentAuthUser = null;

  // Permanent link display elements
  const permanentLinkEl = document.getElementById('permanent-download-link');
  const copyPermanentLinkBtn = document.getElementById('copy-permanent-link');

  // Build permanent link based on current page location
  function getPermanentLink() {
    const base = window.location.origin + window.location.pathname.replace(/admin\.html$/, '');
    return base + 'Download.html';
  }

  // Initialize UI & load initial config
  const currentConfig = await loadAppConfig();
  populateForm(currentConfig);
  checkFirebaseStatus();

  // Show permanent link
  if (permanentLinkEl) permanentLinkEl.textContent = getPermanentLink();

  function populateForm(data) {
    if (adminUrlInput) adminUrlInput.value = data.downloadUrl || '';
    if (adminVersionInput) adminVersionInput.value = data.version || '2.5.0';
    if (adminDownloaderCodeInput) adminDownloaderCodeInput.value = data.downloaderCode || '';
    if (adminFileSizeInput) adminFileSizeInput.value = data.fileSize || '45.2 MB';
    if (adminMinAndroidInput) adminMinAndroidInput.value = data.minAndroid || 'Android 5.0+';
    if (adminChangelogInput) adminChangelogInput.value = data.changelog || '';
  }

  function checkFirebaseStatus() {
    const creds = getFirebaseCredentials();
    if (creds && creds.apiKey && creds.projectId) {
      if (statusBadge) {
        statusBadge.textContent = '⚡ Firebase Conectado';
        statusBadge.className = 'badge-status connected';
      }
    } else {
      if (statusBadge) {
        statusBadge.textContent = '⚙ Modo Local (Demo)';
        statusBadge.className = 'badge-status local';
      }
    }
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();

      const creds = getFirebaseCredentials();

      if (creds && creds.apiKey && creds.projectId) {
        try {
          const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
          const { getAuth, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

          const app = initializeApp(creds, "admin-auth");
          const auth = getAuth(app);
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          currentAuthUser = userCredential.user;

          showToast(`¡Bienvenido ${currentAuthUser.email}!`);
          showDashboard();
        } catch (err) {
          console.error("Error Firebase Auth:", err);
          showToast(`Error al autenticar: ${err.message || 'Verifica credenciales'}`);
        }
      } else {
        showToast('Firebase no está configurado. Configura las credenciales de Firebase para acceder al panel.');
      }
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      currentAuthUser = null;
      authContainer.style.display = 'block';
      dashboardContainer.style.display = 'none';
      showToast('Sesión cerrada correctamente');
    });
  }

  function showDashboard() {
    authContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
  }

  // Copy permanent link
  if (copyPermanentLinkBtn && permanentLinkEl) {
    copyPermanentLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(permanentLinkEl.textContent).then(() => {
        showToast('Enlace permanente copiado');
        copyPermanentLinkBtn.textContent = '¡Copiado!';
        setTimeout(() => copyPermanentLinkBtn.textContent = 'Copiar', 2000);
      }).catch(() => {
        showToast('No se pudo copiar');
      });
    });
  }

  // Handle APK file upload - show file info only (actual upload is via GitHub Releases)
  if (adminApkFileInput) {
    adminApkFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Auto update size input
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
        adminFileSizeInput.value = `${sizeInMB} MB`;

        showToast(`Archivo seleccionado: ${file.name} (${sizeInMB} MB) — Sube este archivo a GitHub Releases.`);
      }
    });
  }

  // Save App Configuration
  if (appForm) {
    appForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedData = {
        downloadUrl: adminUrlInput.value.trim(),
        version: adminVersionInput.value.trim(),
        downloaderCode: adminDownloaderCodeInput.value.trim(),
        fileSize: adminFileSizeInput.value.trim(),
        minAndroid: adminMinAndroidInput.value.trim(),
        changelog: adminChangelogInput.value.trim()
      };

      const btnSave = document.getElementById('btn-save-app');
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.textContent = 'Guardando cambios...';
      }

      try {
        await saveAppConfig(updatedData, currentAuthUser);
        showToast('¡App actualizada exitosamente! Los cambios ya están en vivo.');
      } catch (err) {
        showToast('Error al guardar la configuración');
        console.error(err);
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.textContent = '💾 Publicar y Actualizar App';
        }
      }
    });
  }

  // Firebase Modal Handlers
  if (btnOpenFbSettings && firebaseModal) {
    btnOpenFbSettings.addEventListener('click', () => {
      const creds = getFirebaseCredentials();
      if (fbApiKeyInput) fbApiKeyInput.value = creds.apiKey || '';
      if (fbAuthDomainInput) fbAuthDomainInput.value = creds.authDomain || '';
      if (fbProjectIdInput) fbProjectIdInput.value = creds.projectId || '';
      if (fbStorageBucketInput) fbStorageBucketInput.value = creds.storageBucket || '';

      firebaseModal.classList.add('active');
    });
  }

  if (btnCloseFbModal && firebaseModal) {
    btnCloseFbModal.addEventListener('click', () => firebaseModal.classList.remove('active'));
  }

  if (fbForm) {
    fbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newCreds = {
        apiKey: fbApiKeyInput.value.trim(),
        authDomain: fbAuthDomainInput.value.trim(),
        projectId: fbProjectIdInput.value.trim(),
        storageBucket: fbStorageBucketInput.value.trim()
      };
      saveFirebaseCredentials(newCreds);
      checkFirebaseStatus();
      firebaseModal.classList.remove('active');
      showToast('Credenciales de Firebase guardadas');
    });
  }

  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
