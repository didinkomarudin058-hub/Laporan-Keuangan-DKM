import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MosqueProfile, Transaction } from '../types';

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
      return 'Format email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini tidak ditemukan.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau password yang Anda masukkan salah.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan masuk.';
    case 'auth/weak-password':
      return 'Password terlalu lemah. Gunakan minimal 6 karakter.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan coba lagi nanti.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke jaringan. Periksa koneksi internet Anda.';
    default:
      return 'Terjadi kesalahan autentikasi: ' + errorCode;
  }
};

// Authentication Services
export const registerWithEmail = async (email: string, pass: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    return { user: null, error: getAuthErrorMessage(err.code || err.message) };
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    return { user: null, error: getAuthErrorMessage(err.code || err.message) };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (err: any) {
    return { error: getAuthErrorMessage(err.code || err.message) };
  }
};

export const subscribeAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore Sync Services for Logged-In Account
export const subscribeFirestoreData = (
  userId: string,
  onDataUpdate: (data: {
    mosqueProfile?: MosqueProfile;
    transactions?: Transaction[];
    categoriesPemasukan?: string[];
    categoriesPengeluaran?: string[];
  }) => void
) => {
  if (!userId) return () => {};

  // Listen to Settings doc
  const settingsRef = doc(db, 'users', userId, 'settings', 'config');
  const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onDataUpdate({
        mosqueProfile: data.mosqueProfile,
        categoriesPemasukan: data.categoriesPemasukan,
        categoriesPengeluaran: data.categoriesPengeluaran,
      });
    }
  });

  // Listen to Transactions Collection
  const transactionsColl = collection(db, 'users', userId, 'transactions');
  const unsubscribeTransactions = onSnapshot(transactionsColl, (querySnap) => {
    const trxs: Transaction[] = [];
    querySnap.forEach((docSnap) => {
      trxs.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
    });
    // Sort by date descending
    trxs.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    onDataUpdate({ transactions: trxs });
  });

  return () => {
    unsubscribeSettings();
    unsubscribeTransactions();
  };
};

// Save Profile & Categories to Firestore
export const saveSettingsToFirestore = async (
  userId: string,
  settings: {
    mosqueProfile?: MosqueProfile;
    categoriesPemasukan?: string[];
    categoriesPengeluaran?: string[];
  }
) => {
  if (!userId) return;
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'config');
    await setDoc(settingsRef, settings, { merge: true });
  } catch (e) {
    console.error('Error saving settings to Firestore:', e);
  }
};

// Save individual or all transactions to Firestore
export const saveTransactionToFirestore = async (userId: string, trx: Transaction) => {
  if (!userId) return;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', trx.id);
    await setDoc(docRef, trx);
  } catch (e) {
    console.error('Error saving transaction to Firestore:', e);
  }
};

export const deleteTransactionFromFirestore = async (userId: string, trxId: string) => {
  if (!userId) return;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', trxId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error('Error deleting transaction from Firestore:', e);
  }
};

// Batch upload all transactions to Firestore (for Initial Sync or Import Backup)
export const bulkSaveTransactionsToFirestore = async (userId: string, transactions: Transaction[]) => {
  if (!userId) return;
  try {
    // Write in chunks of 450 (Firestore batch limit is 500)
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
    console.error('Error bulk saving transactions to Firestore:', e);
  }
};
