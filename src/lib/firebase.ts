import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MosqueProfile, Transaction, MosqueBusinessUnit, BusinessRecord, LandTenant } from '../types';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use specified database ID if available
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Map Firebase auth errors to user-friendly Indonesian messages
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Format email tidak valid. Pastikan penulisan email sudah benar (contoh: dkm@gmail.com).';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan oleh administrator.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini belum terdaftar. Silakan buat akun baru di tab "Buat Akun Baru".';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau password yang Anda masukkan salah. Periksa kembali.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan gunakan tab "Masuk Akun" untuk login.';
    case 'auth/weak-password':
      return 'Password terlalu lemah. Masukkan password minimal 6 karakter.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat lalu coba lagi.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke jaringan. Periksa koneksi internet Anda.';
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'Layanan autentikasi email terhubung ke sinkronisasi Cloud DKM.';
    case 'auth/popup-closed-by-user':
      return 'Jendela pendaftaran Google ditutup sebelum selesai.';
    case 'auth/cancelled-popup-request':
      return 'Proses pendaftaran Google dibatalkan.';
    case 'auth/popup-blocked':
      return 'Jendela popup diblokir oleh browser. Izinkan popup untuk melanjutkan.';
    case 'auth/account-exists-with-different-credential':
      return 'Akun dengan email ini sudah ada dengan metode masuk yang berbeda.';
    default:
      return 'Terjadi kesalahan autentikasi: ' + errorCode;
  }
};

// Local User Account Backup Storage
export interface LocalUserAccount {
  uid: string;
  email: string;
  password?: string;
  displayName?: string;
  createdAt: string;
}

const LOCAL_USERS_KEY = 'dkm_local_users_db_v1';
const CURRENT_LOCAL_USER_KEY = 'dkm_current_user_v1';

export const getStoredLocalUsers = (): LocalUserAccount[] => {
  try {
    const saved = localStorage.getItem(LOCAL_USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const getStoredCurrentLocalUser = (): any | null => {
  try {
    const saved = localStorage.getItem(CURRENT_LOCAL_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const setStoredCurrentLocalUser = (user: any | null) => {
  if (user) {
    localStorage.setItem(CURRENT_LOCAL_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_LOCAL_USER_KEY);
  }
  window.dispatchEvent(new Event('dkm_auth_state_changed'));
};

// Helper: generate consistent deterministic UID based on email for multi-device sync
export const generateDeterministicUid = (email: string): string => {
  const clean = email.trim().toLowerCase();
  const sanitized = clean.replace(/[^a-z0-9]/g, '_');
  return `dkm_user_${sanitized}`;
};

// Register Account with Email & Password across all devices
export const registerWithEmail = async (email: string, pass: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const defaultUid = generateDeterministicUid(cleanEmail);
  const localUsers = getStoredLocalUsers();

  // 1. Check if email already exists in Firestore dkm_accounts
  try {
    const accRef = doc(db, 'dkm_accounts', cleanEmail);
    const accSnap = await getDoc(accRef);
    if (accSnap.exists()) {
      return {
        user: null,
        error: 'Email ini sudah terdaftar di sistem DKM. Silakan gunakan tab "Masuk Akun" untuk login dari perangkat mana pun.',
      };
    }
  } catch (err) {
    console.warn('Firestore dkm_accounts check notice:', err);
  }

  let finalUid = defaultUid;

  // 2. Try Firebase Auth createUser
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    finalUid = userCredential.user.uid;
  } catch (err: any) {
    console.warn('Firebase createUser notice:', err?.code || err);
    if (err.code === 'auth/email-already-in-use') {
      return {
        user: null,
        error: 'Email ini sudah terdaftar. Silakan berpindah ke tab "Masuk Akun" untuk login.',
      };
    }
    if (err.code === 'auth/invalid-email') {
      return {
        user: null,
        error: 'Format email tidak valid. Pastikan penulisan email sudah benar (contoh: dkm@gmail.com).',
      };
    }
    if (err.code === 'auth/weak-password') {
      return {
        user: null,
        error: 'Password terlalu lemah. Masukkan password minimal 6 karakter.',
      };
    }
  }

  // 3. Save to Cloud Firestore dkm_accounts so ANY other device (HP/Laptop) can log in with this email & password
  try {
    const accRef = doc(db, 'dkm_accounts', cleanEmail);
    await setDoc(accRef, {
      uid: finalUid,
      email: cleanEmail,
      password: pass,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Initialize user profile doc in Firestore
    const userDocRef = doc(db, 'users', finalUid, 'settings', 'config');
    await setDoc(userDocRef, {
      accountEmail: cleanEmail,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Saving dkm_accounts to Firestore notice:', err);
  }

  // 4. Save to Local Cache
  const newUser: LocalUserAccount = {
    uid: finalUid,
    email: cleanEmail,
    password: pass,
    createdAt: new Date().toISOString(),
  };
  const existingLocalIndex = localUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (existingLocalIndex >= 0) {
    localUsers[existingLocalIndex] = newUser;
  } else {
    localUsers.push(newUser);
  }
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

  const userObj = {
    uid: finalUid,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
  };
  setStoredCurrentLocalUser(userObj);

  return { user: userObj, error: null };
};

// Login with Email & Password (works across multiple devices seamlessly)
export const loginWithEmail = async (email: string, pass: string) => {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Try Firebase Auth signIn first
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const loggedUser = {
      uid: userCredential.user.uid,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
    };
    
    // Sync to Firestore dkm_accounts
    try {
      const accRef = doc(db, 'dkm_accounts', cleanEmail);
      await setDoc(accRef, {
        uid: userCredential.user.uid,
        email: cleanEmail,
        password: pass,
        lastLoginAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Syncing login to dkm_accounts notice:', e);
    }

    setStoredCurrentLocalUser(loggedUser);
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    console.warn('Firebase signInWithEmailAndPassword notice:', err?.code || err);

    // If wrong password returned directly by Firebase Auth
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      // Check cloud dkm_accounts as secondary verification
      try {
        const accRef = doc(db, 'dkm_accounts', cleanEmail);
        const accSnap = await getDoc(accRef);
        if (accSnap.exists()) {
          const accData = accSnap.data();
          if (accData.password === pass) {
            const uid = accData.uid || generateDeterministicUid(cleanEmail);
            const userObj = {
              uid,
              email: cleanEmail,
              displayName: cleanEmail.split('@')[0],
            };
            setStoredCurrentLocalUser(userObj);
            return { user: userObj, error: null };
          }
        }
      } catch (cloudErr) {
        console.warn('Cloud account check error:', cloudErr);
      }
      return { user: null, error: 'Password yang Anda masukkan salah. Periksa kembali.' };
    }

    // 2. Check Firestore dkm_accounts for multi-device credentials
    try {
      const accRef = doc(db, 'dkm_accounts', cleanEmail);
      const accSnap = await getDoc(accRef);
      if (accSnap.exists()) {
        const accData = accSnap.data();
        if (accData.password === pass) {
          const uid = accData.uid || generateDeterministicUid(cleanEmail);
          const userObj = {
            uid,
            email: cleanEmail,
            displayName: cleanEmail.split('@')[0],
          };
          setStoredCurrentLocalUser(userObj);
          return { user: userObj, error: null };
        } else {
          return { user: null, error: 'Password yang Anda masukkan salah. Periksa kembali.' };
        }
      }
    } catch (firestoreErr) {
      console.warn('Firestore dkm_accounts read error:', firestoreErr);
    }

    // 3. Check Local Device Cache
    const localUsers = getStoredLocalUsers();
    const localUser = localUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === pass
    );

    if (localUser) {
      const userObj = {
        uid: localUser.uid,
        email: localUser.email,
        displayName: cleanEmail.split('@')[0],
      };
      // Push to Firestore dkm_accounts so other devices will have it immediately
      try {
        const accRef = doc(db, 'dkm_accounts', cleanEmail);
        setDoc(accRef, {
          uid: localUser.uid,
          email: cleanEmail,
          password: pass,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (e) {
        console.warn('Syncing local user to Firestore notice:', e);
      }

      setStoredCurrentLocalUser(userObj);
      return { user: userObj, error: null };
    }

    const emailFoundLocally = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (emailFoundLocally) {
      return { user: null, error: 'Password yang Anda masukkan salah. Periksa kembali.' };
    }

    return {
      user: null,
      error: 'Akun dengan email ini belum terdaftar. Silakan buat akun baru di tab "Buat Akun Baru".',
    };
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    const cleanEmail = (userCredential.user.email || '').toLowerCase();
    
    // Register Google account in Firestore dkm_accounts
    if (cleanEmail) {
      try {
        const accRef = doc(db, 'dkm_accounts', cleanEmail);
        await setDoc(accRef, {
          uid: userCredential.user.uid,
          email: cleanEmail,
          authProvider: 'google',
          displayName: userCredential.user.displayName || cleanEmail.split('@')[0],
          lastLoginAt: new Date().toISOString(),
        }, { merge: true });
      } catch (e) {
        console.warn('Syncing Google user to dkm_accounts notice:', e);
      }
    }

    const userObj = {
      uid: userCredential.user.uid,
      email: cleanEmail,
      displayName: userCredential.user.displayName || cleanEmail.split('@')[0],
    };
    setStoredCurrentLocalUser(userObj);

    return { user: userCredential.user, error: null };
  } catch (err: any) {
    return { user: null, error: getAuthErrorMessage(err.code || err.message) };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (err: any) {
    console.warn('SignOut warning:', err);
  }
  setStoredCurrentLocalUser(null);
  return { error: null };
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (err: any) {
    return { error: getAuthErrorMessage(err.code || err.message) };
  }
};

export const recoverOrActivateAccount = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const uid = generateDeterministicUid(cleanEmail);

  // Check if exists in cloud dkm_accounts
  try {
    const accRef = doc(db, 'dkm_accounts', cleanEmail);
    const accSnap = await getDoc(accRef);
    if (!accSnap.exists()) {
      await setDoc(accRef, {
        uid,
        email: cleanEmail,
        createdAt: new Date().toISOString(),
        recoveredAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (e) {
    console.warn('recoverOrActivateAccount firestore notice:', e);
  }

  const userObj = {
    uid,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
  };
  setStoredCurrentLocalUser(userObj);
  return userObj;
};

export const subscribeAuth = (callback: (user: any | null) => void) => {
  const checkCurrentState = (fbUser: User | null) => {
    if (fbUser) {
      const userObj = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0],
      };
      setStoredCurrentLocalUser(userObj);
      callback(userObj);
    } else {
      const localUser = getStoredCurrentLocalUser();
      callback(localUser);
    }
  };

  const unsubscribeFb = onAuthStateChanged(auth, (user) => {
    checkCurrentState(user);
  });

  const handleCustomAuthEvent = () => {
    checkCurrentState(auth.currentUser);
  };

  window.addEventListener('dkm_auth_state_changed', handleCustomAuthEvent);

  return () => {
    unsubscribeFb();
    window.removeEventListener('dkm_auth_state_changed', handleCustomAuthEvent);
  };
};

// Persistent Mosque Public Cloud ID for Barcode Sharing
const MOSQUE_CLOUD_ID_KEY = 'dkm_mosque_cloud_public_id_v1';

export const getOrCreateMosquePublicId = (): string => {
  try {
    let saved = localStorage.getItem(MOSQUE_CLOUD_ID_KEY);
    if (!saved) {
      // Generate a stable unique ID for this DKM mosque instance
      saved = 'dkm_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(MOSQUE_CLOUD_ID_KEY, saved);
    }
    return saved;
  } catch {
    return 'dkm_masjid_utama';
  }
};

// Firestore Sync Services for Logged-In Account or Public Mosque ID
export const subscribeFirestoreData = (
  userId: string,
  onDataUpdate: (data: {
    mosqueProfile?: MosqueProfile;
    transactions?: Transaction[];
    categoriesPemasukan?: string[];
    categoriesPengeluaran?: string[];
    categoriesSewa?: string[];
    posDanaList?: string[];
    metodePembayaranList?: string[];
    businessUnits?: MosqueBusinessUnit[];
    businessRecords?: BusinessRecord[];
    landTenants?: LandTenant[];
  }) => void
) => {
  if (!userId) return () => {};

  // Listen to Settings doc
  const settingsRef = doc(db, 'users', userId, 'settings', 'config');
  const unsubscribeSettings = onSnapshot(
    settingsRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onDataUpdate({
          mosqueProfile: data.mosqueProfile,
          categoriesPemasukan: data.categoriesPemasukan,
          categoriesPengeluaran: data.categoriesPengeluaran,
          categoriesSewa: data.categoriesSewa,
          posDanaList: data.posDanaList,
          metodePembayaranList: data.metodePembayaranList,
          businessUnits: data.businessUnits,
          businessRecords: data.businessRecords,
          landTenants: data.landTenants,
        });
      }
    },
    (err) => {
      console.warn('Firestore settings subscription notice:', err);
    }
  );

  // Listen to Transactions Collection
  const transactionsColl = collection(db, 'users', userId, 'transactions');
  const unsubscribeTransactions = onSnapshot(
    transactionsColl,
    (querySnap) => {
      const trxs: Transaction[] = [];
      querySnap.forEach((docSnap) => {
        trxs.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
      });
      // Sort by date descending
      trxs.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      onDataUpdate({ transactions: trxs });
    },
    (err) => {
      console.warn('Firestore transactions subscription notice:', err);
    }
  );

  return () => {
    unsubscribeSettings();
    unsubscribeTransactions();
  };
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Save Profile, Categories, Business Data & Land Tenants to Firestore
export const saveSettingsToFirestore = async (
  userId: string,
  settings: {
    mosqueProfile?: MosqueProfile;
    categoriesPemasukan?: string[];
    categoriesPengeluaran?: string[];
    categoriesSewa?: string[];
    posDanaList?: string[];
    metodePembayaranList?: string[];
    businessUnits?: MosqueBusinessUnit[];
    businessRecords?: BusinessRecord[];
    landTenants?: LandTenant[];
  }
) => {
  if (!userId) return;
  const path = `users/${userId}/settings/config`;
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'config');
    await setDoc(settingsRef, settings, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
};

// Save individual or all transactions to Firestore
export const saveTransactionToFirestore = async (userId: string, trx: Transaction) => {
  if (!userId) return;
  const path = `users/${userId}/transactions/${trx.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', trx.id);
    await setDoc(docRef, trx);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
};

export const deleteTransactionFromFirestore = async (userId: string, trxId: string) => {
  if (!userId) return;
  const path = `users/${userId}/transactions/${trxId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', trxId);
    await deleteDoc(docRef);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
};

// Batch upload all transactions to Firestore (for Initial Sync or Import Backup)
export const bulkSaveTransactionsToFirestore = async (userId: string, transactions: Transaction[]) => {
  if (!userId) return;
  const path = `users/${userId}/transactions`;
  try {
    // Write in chunks of 400 (Firestore batch limit is 500)
    const chunkSize = 400;
    for (let i = 0; i < transactions.length; i += chunkSize) {
      const chunk = transactions.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((trx) => {
        const docRef = doc(db, 'users', userId, 'transactions', trx.id);
        batch.set(docRef, trx);
      });
      await batch.commit();
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
};
