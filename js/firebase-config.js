export const defaultFirebaseConfig = {
  apiKey: "AIzaSyBZyf_3GMVCOCrywojnqVURyh8IFkZsgc4",
  authDomain: "turedtv-f2c33.firebaseapp.com",
  projectId: "turedtv-f2c33",
  storageBucket: "turedtv-f2c33.firebasestorage.app",
  messagingSenderId: "645043378152",
  appId: "1:645043378152:web:24a1b015785a78190e765d",
  measurementId: "G-RMWKF88JM0"
};

// Default fallback App Configuration
export const DEFAULT_APP_DATA = {
  appName: "TuRed TV",
  version: "2.5.0",
  fileSize: "45.2 MB",
  downloadUrl: "",
  downloaderCode: "",
  minAndroid: "Android 5.0+",
  releaseDate: "17 de Agosto, 2026",
  changelog: "• Transmisión ultra rápida en FHD y 4K\n• Nueva guía de programación interactiva\n• Optimizado para controles de Firestick y Smart TV",
  updatedAt: new Date().toISOString()
};

// Key for LocalStorage fallback
const STORAGE_KEY = 'tured_tv_app_config';
const FIREBASE_CONFIG_KEY = 'tured_tv_firebase_keys';

/**
 * Retrieves the stored Firebase Config or returns defaults
 */
export function getFirebaseCredentials() {
  const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (saved) {
    try { 
      const parsed = JSON.parse(saved); 
      if (parsed && parsed.apiKey) return parsed;
    } catch (e) { console.error(e); }
  }
  return defaultFirebaseConfig;
}

/**
 * Saves new Firebase credentials to LocalStorage
 */
export function saveFirebaseCredentials(config) {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Loads current App details (First tries Firebase if initialized, else LocalStorage/Default)
 */
export async function loadAppConfig() {
  // First check LocalStorage override
  const localData = localStorage.getItem(STORAGE_KEY);
  let appData = localData ? JSON.parse(localData) : { ...DEFAULT_APP_DATA };

  // Attempt Firebase load if configured
  const fbConfig = getFirebaseCredentials();
  if (fbConfig && fbConfig.apiKey && fbConfig.projectId) {
    try {
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      const { getFirestore, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      
      const app = initializeApp(fbConfig, "tured-reader");
      const db = getFirestore(app);
      const docRef = doc(db, "appStore", "currentApp");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        appData = { ...appData, ...docSnap.data() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      }
    } catch (err) {
      console.warn("Firebase load fallback to local data:", err);
    }
  }

  return appData;
}

/**
 * Saves updated App details (Updates LocalStorage and Firebase if available)
 */
export async function saveAppConfig(newConfig, authUser = null) {
  // Save to LocalStorage
  const current = await loadAppConfig();
  const updated = { ...current, ...newConfig, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Try saving to Firebase Firestore if configured
  const fbConfig = getFirebaseCredentials();
  if (fbConfig && fbConfig.apiKey && fbConfig.projectId) {
    try {
      const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      const { getFirestore, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

      const apps = getApps();
      const app = apps.length ? apps[0] : initializeApp(fbConfig);
      const db = getFirestore(app);
      
      await setDoc(doc(db, "appStore", "currentApp"), updated, { merge: true });
    } catch (err) {
      console.error("Error saving to Firebase Firestore:", err);
    }
  }

  return updated;
}
