import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionList } from './components/TransactionList';
import { MonthlyReportView } from './components/MonthlyReportView';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { PublicDisplayBoard } from './components/PublicDisplayBoard';
import { JamaahReportPortal } from './components/JamaahReportPortal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { MosqueSettingsTab } from './components/MosqueSettingsTab';
import { PwaInstallModal } from './components/PwaInstallModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MosqueBusinessTab } from './components/MosqueBusinessTab';
import { FloatingActionButton } from './components/FloatingActionButton';
import { FundCategory, MosqueProfile, Transaction, TransactionType, MosqueBusinessUnit, BusinessRecord, LandTenant, TenantPaymentRecord, AppTab } from './types';
import {
  initialMosqueProfile,
  initialTransactions,
  CATEGORIES_PEMASUKAN,
  CATEGORIES_PENGELUARAN,
  CATEGORIES_SEWA,
  initialBusinessUnits,
  initialBusinessRecords,
  initialLandTenants,
} from './data/initialData';
import { User } from 'firebase/auth';
import {
  auth,
  subscribeAuth,
  subscribeFirestoreData,
  saveSettingsToFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  bulkSaveTransactionsToFirestore,
} from './lib/firebase';

export default function App() {
  // LocalStorage keys
  const STORAGE_KEY_TRANSACTIONS = 'dkm_transactions_v1';
  const STORAGE_KEY_PROFILE = 'dkm_profile_v1';
  const STORAGE_KEY_CATEGORIES_PEMASUKAN = 'dkm_categories_pemasukan_v1';
  const STORAGE_KEY_CATEGORIES_PENGELUARAN = 'dkm_categories_pengeluaran_v1';
  const STORAGE_KEY_CATEGORIES_SEWA = 'dkm_categories_sewa_v1';
  const STORAGE_KEY_POS_DANA = 'dkm_pos_dana_v1';
  const STORAGE_KEY_METODE_PEMBAYARAN = 'dkm_metode_pembayaran_v1';
  const STORAGE_KEY_BUSINESS_UNITS = 'dkm_business_units_v1';
  const STORAGE_KEY_BUSINESS_RECORDS = 'dkm_business_records_v1';
  const STORAGE_KEY_LAND_TENANTS = 'dkm_land_tenants_v1';

  const DEFAULT_POS_DANA = [
    'Kas Operasional',
    'Kas Pembangunan',
  ];

  const DEFAULT_METODE_PEMBAYARAN = [
    'Tunai',
    'Transfer Bank',
    'QRIS',
    'Cek',
  ];

  // Firebase & Local Auth State
  const [currentUser, setCurrentUser] = useState<User | any | null>(null);

  // State: Mosque Profile
  const [mosqueProfile, setMosqueProfile] = useState<MosqueProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialMosqueProfile;
  });

  // State: Transactions List
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t: any) => ({
            ...t,
            danaKat: /yatim|zakat/i.test(t.danaKat || '') ? 'Kas Operasional' : t.danaKat,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialTransactions;
  });

  // State: Transaction Categories
  const [categoriesPemasukan, setCategoriesPemasukan] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES_PEMASUKAN);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return CATEGORIES_PEMASUKAN;
  });

  const [categoriesPengeluaran, setCategoriesPengeluaran] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES_PENGELUARAN);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return CATEGORIES_PENGELUARAN;
  });

  // State: Kategori Sewa
  const [categoriesSewa, setCategoriesSewa] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES_SEWA);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return CATEGORIES_SEWA;
  });

  // State: Pos Dana List
  const [posDanaList, setPosDanaList] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_POS_DANA);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item: string) => !/yatim|zakat/i.test(item));
          if (filtered.length > 0) return filtered;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_POS_DANA;
  });

  // State: Metode Pembayaran List
  const [metodePembayaranList, setMetodePembayaranList] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_METODE_PEMBAYARAN);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_METODE_PEMBAYARAN;
  });

  // State: Unit Usaha Masjid
  const [businessUnits, setBusinessUnits] = useState<MosqueBusinessUnit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BUSINESS_UNITS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialBusinessUnits;
  });

  // State: Rekap Buku Kas & Setoran Unit Usaha
  const [businessRecords, setBusinessRecords] = useState<BusinessRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BUSINESS_RECORDS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialBusinessRecords;
  });

  // State: Penyewa / Sewa Tanah & Lahan Wakaf Masjid
  const [landTenants, setLandTenants] = useState<LandTenant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LAND_TENANTS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialLandTenants;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(mosqueProfile));
  }, [mosqueProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES_PEMASUKAN, JSON.stringify(categoriesPemasukan));
  }, [categoriesPemasukan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES_PENGELUARAN, JSON.stringify(categoriesPengeluaran));
  }, [categoriesPengeluaran]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES_SEWA, JSON.stringify(categoriesSewa));
  }, [categoriesSewa]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POS_DANA, JSON.stringify(posDanaList));
  }, [posDanaList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_METODE_PEMBAYARAN, JSON.stringify(metodePembayaranList));
  }, [metodePembayaranList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BUSINESS_UNITS, JSON.stringify(businessUnits));
  }, [businessUnits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BUSINESS_RECORDS, JSON.stringify(businessRecords));
  }, [businessRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAND_TENANTS, JSON.stringify(landTenants));
  }, [landTenants]);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Shared DKM ID from URL query parameters (e.g. ?dkm=... or ?masjid=...)
  const [dkmParam] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('dkm') || params.get('masjid') || null;
    }
    return null;
  });

  // Subscribe to Firestore Real-Time Data for Shared DKM (when Jamaah opens shared link/QR)
  useEffect(() => {
    if (dkmParam && (!currentUser || currentUser.uid !== dkmParam)) {
      const unsubscribeShared = subscribeFirestoreData(dkmParam, (data) => {
        if (data.mosqueProfile) {
          setMosqueProfile(data.mosqueProfile);
        }
        if (data.categoriesPemasukan && Array.isArray(data.categoriesPemasukan)) {
          setCategoriesPemasukan(data.categoriesPemasukan);
        }
        if (data.categoriesPengeluaran && Array.isArray(data.categoriesPengeluaran)) {
          setCategoriesPengeluaran(data.categoriesPengeluaran);
        }
        if (data.categoriesSewa && Array.isArray(data.categoriesSewa)) {
          setCategoriesSewa(data.categoriesSewa);
        }
        if (data.posDanaList && Array.isArray(data.posDanaList)) {
          setPosDanaList(data.posDanaList);
        }
        if (data.metodePembayaranList && Array.isArray(data.metodePembayaranList)) {
          setMetodePembayaranList(data.metodePembayaranList);
        }
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
        if (data.businessUnits && Array.isArray(data.businessUnits)) {
          setBusinessUnits(data.businessUnits);
        }
        if (data.businessRecords && Array.isArray(data.businessRecords)) {
          setBusinessRecords(data.businessRecords);
        }
        if (data.landTenants && Array.isArray(data.landTenants)) {
          setLandTenants(data.landTenants);
        }
      });
      return () => unsubscribeShared();
    }
  }, [dkmParam, currentUser?.uid]);

  // Subscribe to Firestore Real-Time Data for Authenticated User
  useEffect(() => {
    if (currentUser?.uid && !currentUser?.isLocal && auth.currentUser) {
      const unsubscribeData = subscribeFirestoreData(currentUser.uid, (data) => {
        if (data.mosqueProfile) {
          setMosqueProfile(data.mosqueProfile);
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(data.mosqueProfile));
        }
        if (data.categoriesPemasukan !== undefined && Array.isArray(data.categoriesPemasukan) && data.categoriesPemasukan.length > 0) {
          setCategoriesPemasukan(data.categoriesPemasukan);
          localStorage.setItem(STORAGE_KEY_CATEGORIES_PEMASUKAN, JSON.stringify(data.categoriesPemasukan));
        }
        if (data.categoriesPengeluaran !== undefined && Array.isArray(data.categoriesPengeluaran) && data.categoriesPengeluaran.length > 0) {
          setCategoriesPengeluaran(data.categoriesPengeluaran);
          localStorage.setItem(STORAGE_KEY_CATEGORIES_PENGELUARAN, JSON.stringify(data.categoriesPengeluaran));
        }
        if (data.categoriesSewa !== undefined && Array.isArray(data.categoriesSewa) && data.categoriesSewa.length > 0) {
          setCategoriesSewa(data.categoriesSewa);
          localStorage.setItem(STORAGE_KEY_CATEGORIES_SEWA, JSON.stringify(data.categoriesSewa));
        }
        if (data.posDanaList !== undefined && Array.isArray(data.posDanaList) && data.posDanaList.length > 0) {
          setPosDanaList(data.posDanaList);
          localStorage.setItem(STORAGE_KEY_POS_DANA, JSON.stringify(data.posDanaList));
        }
        if (data.metodePembayaranList !== undefined && Array.isArray(data.metodePembayaranList) && data.metodePembayaranList.length > 0) {
          setMetodePembayaranList(data.metodePembayaranList);
          localStorage.setItem(STORAGE_KEY_METODE_PEMBAYARAN, JSON.stringify(data.metodePembayaranList));
        }
        if (data.transactions !== undefined && Array.isArray(data.transactions)) {
          if (data.transactions.length > 0) {
            setTransactions(data.transactions);
            localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(data.transactions));
          } else {
            // Firestore transactions is empty, but local might have items: back them up to Firestore!
            const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  bulkSaveTransactionsToFirestore(currentUser.uid, parsed);
                }
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
        if (data.businessUnits !== undefined && Array.isArray(data.businessUnits) && data.businessUnits.length > 0) {
          setBusinessUnits(data.businessUnits);
          localStorage.setItem(STORAGE_KEY_BUSINESS_UNITS, JSON.stringify(data.businessUnits));
        }
        if (data.businessRecords !== undefined && Array.isArray(data.businessRecords)) {
          setBusinessRecords(data.businessRecords);
          localStorage.setItem(STORAGE_KEY_BUSINESS_RECORDS, JSON.stringify(data.businessRecords));
        }
        if (data.landTenants !== undefined && Array.isArray(data.landTenants) && data.landTenants.length > 0) {
          setLandTenants(data.landTenants);
          localStorage.setItem(STORAGE_KEY_LAND_TENANTS, JSON.stringify(data.landTenants));
        }
      });

      return () => unsubscribeData();
    }
  }, [currentUser?.uid, currentUser?.isLocal]);

  // Tab State
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'monthlyReport' || tabParam === 'report') {
        return 'monthlyReport';
      }
      if (tabParam === 'transactions' || tabParam === 'jurnal') {
        return 'transactions';
      }
      if (tabParam === 'tvMode' || tabParam === 'public') {
        return 'tvMode';
      }
      if (tabParam === 'analytics') {
        return 'analytics';
      }
      if (tabParam === 'business' || tabParam === 'usaha') {
        return 'business';
      }
      if (tabParam === 'jamaah' || tabParam === 'warga' || tabParam === 'publik') {
        return 'jamaah';
      }
      if (tabParam === 'settings' || tabParam === 'pengaturan') {
        return 'settings';
      }
    }
    return 'dashboard';
  });

  // Selected Fund Filter for Transaction List
  const [selectedFundFilter, setSelectedFundFilter] = useState<FundCategory | 'semua'>('semua');

  // Selected Month/Year for Monthly Report
  const [reportMonth, setReportMonth] = useState<number>(8);
  const [reportYear, setReportYear] = useState<number>(2026);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultAddFundCategory, setDefaultAddFundCategory] =
    useState<FundCategory>('Kas Operasional');

  const [settingsDefaultTab, setSettingsDefaultTab] = useState<
    'profile' | 'categories' | 'account' | 'backup' | 'pwa'
  >('profile');

  // PWA Modal State
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  // Toast Banner for Back Button / System Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lastBackPressTimeRef = useRef<number>(0);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Handle Browser / Android Hardware Back Button Logic
  useEffect(() => {
    window.history.replaceState({ tab: activeTab }, '');
  }, []);

  useEffect(() => {
    window.history.pushState({ tab: activeTab }, '');
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      if (isAddModalOpen) {
        setIsAddModalOpen(false);
        window.history.pushState({ tab: activeTab }, '');
        return;
      }
      if (isPwaModalOpen) {
        setIsPwaModalOpen(false);
        window.history.pushState({ tab: activeTab }, '');
        return;
      }

      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        window.history.pushState({ tab: 'dashboard' }, '');
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastBackPressTimeRef.current;

      if (timeDiff < 2000) {
        setToastMessage('Menutup aplikasi Kas DKM...');
        setTimeout(() => setToastMessage(null), 1500);
      } else {
        lastBackPressTimeRef.current = now;
        window.history.pushState({ tab: 'dashboard' }, '');
        setToastMessage('Tekan sekali lagi untuk keluar dari aplikasi');
        setTimeout(() => setToastMessage(null), 2500);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, isAddModalOpen, isPwaModalOpen]);

  const handleNavigateToSettings = (
    tab: 'profile' | 'account' | 'categories' | 'backup' | 'pwa' = 'profile'
  ) => {
    setSettingsDefaultTab(tab);
    setActiveTab('settings');
  };

  // Transaction Handlers
  const handleOpenAddModal = (defaultFund?: FundCategory) => {
    setEditingTransaction(null);
    if (defaultFund) setDefaultAddFundCategory(defaultFund);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (trx: Transaction) => {
    setEditingTransaction(trx);
    setIsAddModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(next));
      return next;
    });
    if (currentUser?.uid && !currentUser.isLocal && auth.currentUser) {
      deleteTransactionFromFirestore(currentUser.uid, id);
    }
    setToastMessage('Transaksi berhasil dihapus.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveTransaction = (
    trxData: Omit<Transaction, 'id'>,
    editId?: string
  ) => {
    if (editId) {
      const updatedTrx: Transaction = { ...trxData, id: editId };
      setTransactions((prev) => {
        const next = prev.map((t) => (t.id === editId ? updatedTrx : t));
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(next));
        return next;
      });
      if (currentUser?.uid && !currentUser.isLocal && auth.currentUser) {
        saveTransactionToFirestore(currentUser.uid, updatedTrx);
      }
      setToastMessage('Transaksi berhasil diperbarui!');
      setTimeout(() => setToastMessage(null), 2500);
    } else {
      const newId = `TRX-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
      ).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
      const newTrx: Transaction = {
        ...trxData,
        id: newId,
      };
      setTransactions((prev) => {
        const next = [newTrx, ...prev];
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(next));
        return next;
      });
      if (currentUser?.uid && !currentUser.isLocal && auth.currentUser) {
        saveTransactionToFirestore(currentUser.uid, newTrx);
      }
      setToastMessage('Transaksi baru berhasil dicatat & disimpan!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // Profile Handler
  const handleSaveProfile = (updatedProfile: MosqueProfile) => {
    setMosqueProfile(updatedProfile);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { mosqueProfile: updatedProfile });
    }
  };

  // Category Handlers
  const handleAddCategory = (type: TransactionType, name: string) => {
    let updatedPemasukan = categoriesPemasukan;
    let updatedPengeluaran = categoriesPengeluaran;

    if (type === 'pemasukan') {
      if (!categoriesPemasukan.includes(name)) {
        updatedPemasukan = [...categoriesPemasukan, name];
        setCategoriesPemasukan(updatedPemasukan);
      }
    } else {
      if (!categoriesPengeluaran.includes(name)) {
        updatedPengeluaran = [...categoriesPengeluaran, name];
        setCategoriesPengeluaran(updatedPengeluaran);
      }
    }

    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, {
        categoriesPemasukan: updatedPemasukan,
        categoriesPengeluaran: updatedPengeluaran,
      });
    }
  };

  const handleEditCategory = (
    type: TransactionType,
    oldName: string,
    newName: string
  ) => {
    let updatedPemasukan = categoriesPemasukan;
    let updatedPengeluaran = categoriesPengeluaran;

    if (type === 'pemasukan') {
      updatedPemasukan = categoriesPemasukan.map((c) => (c === oldName ? newName : c));
      setCategoriesPemasukan(updatedPemasukan);
    } else {
      updatedPengeluaran = categoriesPengeluaran.map((c) => (c === oldName ? newName : c));
      setCategoriesPengeluaran(updatedPengeluaran);
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.jenis === type && t.kategori === oldName ? { ...t, kategori: newName } : t
      )
    );

    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, {
        categoriesPemasukan: updatedPemasukan,
        categoriesPengeluaran: updatedPengeluaran,
      });
    }
  };

  const handleDeleteCategory = (type: TransactionType, name: string) => {
    let updatedPemasukan = categoriesPemasukan;
    let updatedPengeluaran = categoriesPengeluaran;

    if (type === 'pemasukan') {
      updatedPemasukan = categoriesPemasukan.filter((c) => c !== name);
      setCategoriesPemasukan(updatedPemasukan);
    } else {
      updatedPengeluaran = categoriesPengeluaran.filter((c) => c !== name);
      setCategoriesPengeluaran(updatedPengeluaran);
    }

    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, {
        categoriesPemasukan: updatedPemasukan,
        categoriesPengeluaran: updatedPengeluaran,
      });
    }
  };

  const handleResetCategories = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengembalikan seluruh daftar kategori ke default awal?'
      )
    ) {
      setCategoriesPemasukan(CATEGORIES_PEMASUKAN);
      setCategoriesPengeluaran(CATEGORIES_PENGELUARAN);
      setCategoriesSewa(CATEGORIES_SEWA);
      if (currentUser) {
        saveSettingsToFirestore(currentUser.uid, {
          categoriesPemasukan: CATEGORIES_PEMASUKAN,
          categoriesPengeluaran: CATEGORIES_PENGELUARAN,
          categoriesSewa: CATEGORIES_SEWA,
        });
      }
    }
  };

  // Kategori Sewa Handlers
  const handleAddCategorySewa = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !categoriesSewa.includes(trimmed)) {
      const updated = [...categoriesSewa, trimmed];
      setCategoriesSewa(updated);
      localStorage.setItem(STORAGE_KEY_CATEGORIES_SEWA, JSON.stringify(updated));
      if (currentUser?.uid) {
        saveSettingsToFirestore(currentUser.uid, {
          categoriesSewa: updated,
        });
      }
    }
  };

  const handleEditCategorySewa = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== oldName) {
      const updated = categoriesSewa.map((c) => (c === oldName ? trimmed : c));
      setCategoriesSewa(updated);
      localStorage.setItem(STORAGE_KEY_CATEGORIES_SEWA, JSON.stringify(updated));
      // Also update tenants with this category
      const updatedTenants = landTenants.map((t) =>
        t.kategori === oldName ? { ...t, kategori: trimmed } : t
      );
      setLandTenants(updatedTenants);
      localStorage.setItem(STORAGE_KEY_LAND_TENANTS, JSON.stringify(updatedTenants));

      if (currentUser?.uid) {
        saveSettingsToFirestore(currentUser.uid, {
          categoriesSewa: updated,
          landTenants: updatedTenants,
        });
      }
    }
  };

  const handleDeleteCategorySewa = (name: string) => {
    const updated = categoriesSewa.filter((c) => c !== name);
    setCategoriesSewa(updated);
    localStorage.setItem(STORAGE_KEY_CATEGORIES_SEWA, JSON.stringify(updated));
    if (currentUser?.uid) {
      saveSettingsToFirestore(currentUser.uid, {
        categoriesSewa: updated,
      });
    }
  };

  // Pos Dana Handlers
  const handleAddPosDana = (name: string) => {
    if (!posDanaList.includes(name)) {
      const updated = [...posDanaList, name];
      setPosDanaList(updated);
      if (currentUser) {
        saveSettingsToFirestore(currentUser.uid, { posDanaList: updated });
      }
    }
  };

  const handleEditPosDana = (oldName: string, newName: string) => {
    const updated = posDanaList.map((f) => (f === oldName ? newName : f));
    setPosDanaList(updated);
    setTransactions((prev) =>
      prev.map((t) => (t.danaKat === oldName ? { ...t, danaKat: newName } : t))
    );
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { posDanaList: updated });
    }
  };

  const handleDeletePosDana = (name: string) => {
    const updated = posDanaList.filter((f) => f !== name);
    setPosDanaList(updated);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { posDanaList: updated });
    }
  };

  // Metode Pembayaran Handlers
  const handleAddMetodePembayaran = (name: string) => {
    if (!metodePembayaranList.includes(name)) {
      const updated = [...metodePembayaranList, name];
      setMetodePembayaranList(updated);
      if (currentUser) {
        saveSettingsToFirestore(currentUser.uid, { metodePembayaranList: updated });
      }
    }
  };

  const handleEditMetodePembayaran = (oldName: string, newName: string) => {
    const updated = metodePembayaranList.map((m) => (m === oldName ? newName : m));
    setMetodePembayaranList(updated);
    setTransactions((prev) =>
      prev.map((t) => (t.metodePembayaran === oldName ? { ...t, metodePembayaran: newName } : t))
    );
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { metodePembayaranList: updated });
    }
  };

  const handleDeleteMetodePembayaran = (name: string) => {
    const updated = metodePembayaranList.filter((m) => m !== name);
    setMetodePembayaranList(updated);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { metodePembayaranList: updated });
    }
  };

  // Business Unit Handlers
  const handleAddBusinessUnit = (unitData: Omit<MosqueBusinessUnit, 'id'>) => {
    const newUnit: MosqueBusinessUnit = {
      ...unitData,
      id: `unit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newUnit, ...businessUnits];
    setBusinessUnits(updated);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { businessUnits: updated });
    }
    setToastMessage(`Unit usaha "${newUnit.nama}" berhasil ditambahkan!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEditBusinessUnit = (id: string, unitData: Omit<MosqueBusinessUnit, 'id'>) => {
    const updated = businessUnits.map((u) => (u.id === id ? { ...unitData, id } : u));
    setBusinessUnits(updated);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { businessUnits: updated });
    }
    setToastMessage('Data unit usaha berhasil diperbarui!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteBusinessUnit = (id: string) => {
    const updated = businessUnits.filter((u) => u.id !== id);
    setBusinessUnits(updated);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { businessUnits: updated });
    }
    setToastMessage('Unit usaha berhasil dihapus.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Business Record Handlers & Auto-push to Transactions
  const handleAddBusinessRecord = (
    recordData: Omit<BusinessRecord, 'id'>,
    autoPushToTransactions: boolean
  ) => {
    const recordId = `brec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const unit = businessUnits.find((u) => u.id === recordData.unitId);
    const unitName = unit ? unit.nama : 'Unit Usaha DKM';

    let createdTrxId: string | undefined = undefined;

    // If autoPushToTransactions is true and setoranKasMasjid > 0, generate and insert Transaction into kas
    if (autoPushToTransactions && Number(recordData.setoranKasMasjid) > 0) {
      const newTrxId = `TRX-USH-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
      ).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
      createdTrxId = newTrxId;

      const newTrx: Transaction = {
        id: newTrxId,
        tanggal: recordData.tanggal,
        jenis: 'pemasukan',
        jumlah: Number(recordData.setoranKasMasjid),
        kategori: 'Hasil Usaha Masjid',
        danaKat: (recordData.posDanaTujuan as FundCategory) || (unit?.posDanaTujuan as FundCategory) || 'Kas Operasional',
        keterangan: `Setoran Bagi Hasil Usaha - ${unitName}${recordData.periode ? ` (${recordData.periode})` : ''}${recordData.keterangan ? `: ${recordData.keterangan}` : ''}`,
        petugas: recordData.petugas || mosqueProfile.bendaharaDKM || 'Pengurus DKM',
        metodePembayaran: (recordData.metodePembayaran as any) || 'Tunai',
      };

      setTransactions((prev) => {
        const next = [newTrx, ...prev];
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(next));
        return next;
      });
      if (currentUser?.uid && !currentUser.isLocal && auth.currentUser) {
        saveTransactionToFirestore(currentUser.uid, newTrx);
      }
    }

    const newRecord: BusinessRecord = {
      ...recordData,
      id: recordId,
      unitNama: unitName,
      statusSetor: createdTrxId ? 'sudah_masuk_kas' : 'belum_disetor',
      transactionIdLinked: createdTrxId,
    };

    const updatedRecords = [newRecord, ...businessRecords];
    setBusinessRecords(updatedRecords);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { businessRecords: updatedRecords });
    }

    if (createdTrxId) {
      setToastMessage(`Rekap tersimpan & otomatis disetorkan ke Kas Rp ${Number(recordData.setoranKasMasjid).toLocaleString('id-ID')}`);
    } else {
      setToastMessage('Rekap pembukuan usaha berhasil disimpan!');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEditBusinessRecord = (id: string, partial: Partial<BusinessRecord>) => {
    const updated = businessRecords.map((r) => (r.id === id ? { ...r, ...partial } : r));
    setBusinessRecords(updated);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { businessRecords: updated });
    }
    setToastMessage('Data rekap usaha berhasil diperbarui.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteBusinessRecord = (id: string) => {
    const target = businessRecords.find((r) => r.id === id);
    if (target?.transactionIdLinked) {
      if (
        confirm(
          'Rekap usaha ini telah disetorkan ke buku kas masjid (ID: ' +
            target.transactionIdLinked +
            '). Apakah Anda juga ingin menghapus transaksi tersebut dari buku kas?'
        )
      ) {
        handleDeleteTransaction(target.transactionIdLinked);
      }
    }
    const updated = businessRecords.filter((r) => r.id !== id);
    setBusinessRecords(updated);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { businessRecords: updated });
    }
    setToastMessage('Rekap usaha berhasil dihapus.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePushRecordToTransaction = (recordId: string) => {
    const record = businessRecords.find((r) => r.id === recordId);
    if (!record) return;

    if (record.statusSetor === 'sudah_masuk_kas' && record.transactionIdLinked) {
      alert('Setoran usaha ini sudah tercatat sebelumnya di buku kas utama!');
      return;
    }

    const unit = businessUnits.find((u) => u.id === record.unitId);
    const unitName = unit ? unit.nama : 'Unit Usaha DKM';

    const newTrxId = `TRX-USH-${new Date().getFullYear()}${String(
      new Date().getMonth() + 1
    ).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;

    const newTrx: Transaction = {
      id: newTrxId,
      tanggal: record.tanggal,
      jenis: 'pemasukan',
      jumlah: Number(record.setoranKasMasjid),
      kategori: 'Hasil Usaha Masjid',
      danaKat: (record.posDanaTujuan as FundCategory) || (unit?.posDanaTujuan as FundCategory) || 'Kas Operasional',
      keterangan: `Setoran Bagi Hasil Usaha - ${unitName}${record.periode ? ` (${record.periode})` : ''}${record.keterangan ? ` - ${record.keterangan}` : ''}`,
      petugas: record.petugas || mosqueProfile.bendaharaDKM || 'Pengurus DKM',
      metodePembayaran: (record.metodePembayaran as any) || 'Tunai',
    };

    setTransactions((prev) => {
      const next = [newTrx, ...prev];
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(next));
      return next;
    });
    if (currentUser?.uid && !currentUser.isLocal && auth.currentUser) {
      saveTransactionToFirestore(currentUser.uid, newTrx);
    }

    const updatedRecords = businessRecords.map((r) =>
      r.id === recordId
        ? {
            ...r,
            statusSetor: 'sudah_masuk_kas' as const,
            transactionIdLinked: newTrxId,
          }
        : r
    );
    setBusinessRecords(updatedRecords);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, { businessRecords: updatedRecords });
    }

    setToastMessage(`Berhasil menyetorkan Rp ${Number(record.setoranKasMasjid).toLocaleString('id-ID')} ke Kas Masjid!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Land Tenant Handlers
  const handleAddTenant = async (tenantData: Omit<LandTenant, 'id'>) => {
    const newTenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTenant: LandTenant = {
      ...tenantData,
      id: newTenantId,
    };
    const updatedTenants = [newTenant, ...landTenants];
    setLandTenants(updatedTenants);
    localStorage.setItem(STORAGE_KEY_LAND_TENANTS, JSON.stringify(updatedTenants));

    if (currentUser?.uid) {
      await saveSettingsToFirestore(currentUser.uid, {
        landTenants: updatedTenants,
      });
    }

    setToastMessage(`Data sewa "${newTenant.namaPenyewa}" berhasil ditambahkan!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEditTenant = async (id: string, tenantData: Omit<LandTenant, 'id'>) => {
    const updated = landTenants.map((t) => (t.id === id ? { ...tenantData, id } : t));
    setLandTenants(updated);
    localStorage.setItem(STORAGE_KEY_LAND_TENANTS, JSON.stringify(updated));
    if (currentUser?.uid) {
      await saveSettingsToFirestore(currentUser.uid, { landTenants: updated });
    }
    setToastMessage('Data sewa berhasil diperbarui!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteTenant = async (id: string) => {
    const updated = landTenants.filter((t) => t.id !== id);
    setLandTenants(updated);
    localStorage.setItem(STORAGE_KEY_LAND_TENANTS, JSON.stringify(updated));
    if (currentUser?.uid) {
      await saveSettingsToFirestore(currentUser.uid, { landTenants: updated });
    }
    setToastMessage('Data sewa berhasil dihapus.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePayTenantRent = (
    tenantId: string,
    payment: {
      nominal: number;
      nominalAsli?: number;
      diskonPersen?: number;
      potonganNominal?: number;
      nominalSetorKas?: number;
      tanggal: string;
      periode: string;
      bulanTahunKey?: string;
      metodePembayaran: string;
      posDanaTujuan: string;
      statusBayar?: 'lunas' | 'cicilan';
      sisaKurangBayar?: number;
      keterangan?: string;
      petugas?: string;
      autoPushToKas: boolean;
    }
  ) => {
    const tenant = landTenants.find((t) => t.id === tenantId);
    if (!tenant) return;

    let createdTrxId: string | undefined = undefined;
    const nominal = Number(payment.nominal) || 0;
    const diskonPersen = payment.diskonPersen !== undefined ? payment.diskonPersen : (tenant.diskonPersen || 0);
    const potonganNominal = payment.potonganNominal !== undefined 
      ? Number(payment.potonganNominal) 
      : Math.round((nominal * diskonPersen) / 100);
    const nominalSetorKas = payment.nominalSetorKas !== undefined 
      ? Number(payment.nominalSetorKas) 
      : Math.max(0, nominal - potonganNominal);

    if (payment.autoPushToKas && nominalSetorKas > 0) {
      const newTrxId = `TRX-SEWA-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
      ).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
      createdTrxId = newTrxId;

      const cleanKeterangan = (payment.keterangan || '').trim();

      const newTrx: Transaction = {
        id: newTrxId,
        tanggal: payment.tanggal,
        jenis: 'pemasukan',
        jumlah: nominalSetorKas, // Yang masuk ke kas masjid adalah hasil potongan!
        kategori: 'Hasil Usaha & Pengelolaan Aset Masjid',
        danaKat: (payment.posDanaTujuan as FundCategory) || 'Kas Pembangunan',
        keterangan:
          cleanKeterangan ||
          `Penerimaan Sewa Tanah - ${tenant.namaLahan} (${payment.periode})${
            diskonPersen > 0 ? ` (Hasil Potongan ${diskonPersen}%)` : ''
          }`,
        petugas: payment.petugas || mosqueProfile.bendaharaDKM || 'Sie Aset & Wakaf',
        metodePembayaran: (payment.metodePembayaran as any) || 'Transfer Bank',
      };

      setTransactions((prev) => {
        const next = [newTrx, ...prev];
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(next));
        return next;
      });
      if (currentUser?.uid && !currentUser.isLocal && auth.currentUser) {
        saveTransactionToFirestore(currentUser.uid, newTrx);
      }
    }

    // Also add to Business Records
    const newRecordId = `REC-SEWA-${Date.now()}`;
    const newRecord: BusinessRecord = {
      id: newRecordId,
      unitId: tenant.unitId || 'UNIT-00',
      unitNama: 'Sewa Tanah & Lahan Wakaf Masjid',
      tanggal: payment.tanggal,
      periode: payment.periode,
      pendapatanKotor: nominal,
      biayaOperasional: potonganNominal,
      labaBersih: nominalSetorKas,
      setoranKasMasjid: nominalSetorKas,
      posDanaTujuan: payment.posDanaTujuan as FundCategory,
      metodePembayaran: payment.metodePembayaran as any,
      statusSetor: createdTrxId ? 'sudah_masuk_kas' : 'belum_disetor',
      transactionIdLinked: createdTrxId,
      keterangan: `Sewa Lahan: ${tenant.namaPenyewa} (${tenant.namaLahan})${payment.keterangan ? ` - ${payment.keterangan}` : ''}`,
      petugas: payment.petugas || mosqueProfile.bendaharaDKM || 'Sie Aset DKM',
    };

    const updatedRecords = [newRecord, ...businessRecords];
    setBusinessRecords(updatedRecords);

    // Create a detailed Tenant Payment Record
    const newPaymentRecordId = `PAY-${Date.now()}`;
    const newPaymentRecord: TenantPaymentRecord = {
      id: newPaymentRecordId,
      tenantId: tenant.id,
      tenantNama: tenant.namaPenyewa,
      namaLahan: tenant.namaLahan,
      tanggal: payment.tanggal,
      periode: payment.periode,
      bulanTahunKey: payment.bulanTahunKey || payment.tanggal.slice(0, 7),
      tahunKey: Number(payment.tanggal.slice(0, 4)) || new Date().getFullYear(),
      nominal: nominal,
      nominalAsli: payment.nominalAsli || tenant.tarifSewa,
      diskonPersen: diskonPersen,
      potonganNominal: potonganNominal,
      nominalSetorKas: nominalSetorKas,
      metodePembayaran: payment.metodePembayaran,
      posDanaTujuan: payment.posDanaTujuan,
      keterangan: payment.keterangan,
      petugas: payment.petugas || mosqueProfile.bendaharaDKM || 'Sie Aset DKM',
      noKwitansi: `KW-SEWA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`,
      transactionIdLinked: createdTrxId,
      statusBayar: payment.statusBayar || 'lunas',
      sisaKurangBayar: payment.sisaKurangBayar || 0,
      createdAt: new Date().toISOString(),
    };

    // Update Tenant payment stats and history
    const updatedTenants = landTenants.map((t) => {
      if (t.id === tenantId) {
        const existingHistory = t.riwayatPembayaran || [];
        return {
          ...t,
          terakhirBayar: payment.tanggal,
          totalTerbayar: (t.totalTerbayar || 0) + nominal,
          riwayatPembayaran: [newPaymentRecord, ...existingHistory],
        };
      }
      return t;
    });
    setLandTenants(updatedTenants);

    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, {
        businessRecords: updatedRecords,
        landTenants: updatedTenants,
      });
    }

    setToastMessage(
      diskonPersen > 0
        ? `Pembayaran cicilan Rp ${nominal.toLocaleString('id-ID')} dicatat! Masuk ke kas DKM (hasil potongan): Rp ${nominalSetorKas.toLocaleString('id-ID')}`
        : `Pembayaran sewa Rp ${nominal.toLocaleString('id-ID')} dari ${tenant.namaPenyewa} berhasil dicatat & disetor ke kas!`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteTenantPayment = (tenantId: string, paymentId: string) => {
    const tenant = landTenants.find((t) => t.id === tenantId);
    if (!tenant) return;

    const targetPayment = (tenant.riwayatPembayaran || []).find((p) => p.id === paymentId);
    const payNominal = targetPayment ? targetPayment.nominal : 0;

    const updatedTenants = landTenants.map((t) => {
      if (t.id === tenantId) {
        const nextHistory = (t.riwayatPembayaran || []).filter((p) => p.id !== paymentId);
        const nextTotal = Math.max(0, (t.totalTerbayar || 0) - payNominal);
        const nextTerakhir = nextHistory.length > 0 ? nextHistory[0].tanggal : undefined;
        return {
          ...t,
          riwayatPembayaran: nextHistory,
          totalTerbayar: nextTotal,
          terakhirBayar: nextTerakhir,
        };
      }
      return t;
    });

    setLandTenants(updatedTenants);
    if (currentUser) {
      saveSettingsToFirestore(currentUser.uid, {
        landTenants: updatedTenants,
      });
    }

    setToastMessage('Catatan pembayaran sewa berhasil dihapus.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const backupData = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      mosqueProfile,
      transactions,
      categoriesPemasukan,
      categoriesPengeluaran,
      categoriesSewa,
      posDanaList,
      metodePembayaranList,
      businessUnits,
      businessRecords,
      landTenants,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DKM_Kas_Backup_${mosqueProfile.namaMasjid.replace(
      /\s+/g,
      '_'
    )}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.transactions && Array.isArray(json.transactions)) {
          setTransactions(json.transactions);
          if (json.mosqueProfile) setMosqueProfile(json.mosqueProfile);
          if (json.categoriesPemasukan) setCategoriesPemasukan(json.categoriesPemasukan);
          if (json.categoriesPengeluaran)
            setCategoriesPengeluaran(json.categoriesPengeluaran);
          if (json.categoriesSewa) setCategoriesSewa(json.categoriesSewa);
          if (json.posDanaList) setPosDanaList(json.posDanaList);
          if (json.metodePembayaranList) setMetodePembayaranList(json.metodePembayaranList);
          if (json.businessUnits && Array.isArray(json.businessUnits)) setBusinessUnits(json.businessUnits);
          if (json.businessRecords && Array.isArray(json.businessRecords)) setBusinessRecords(json.businessRecords);
          if (json.landTenants && Array.isArray(json.landTenants)) setLandTenants(json.landTenants);

          if (currentUser) {
            saveSettingsToFirestore(currentUser.uid, {
              mosqueProfile: json.mosqueProfile || mosqueProfile,
              categoriesPemasukan: json.categoriesPemasukan || categoriesPemasukan,
              categoriesPengeluaran: json.categoriesPengeluaran || categoriesPengeluaran,
              categoriesSewa: json.categoriesSewa || categoriesSewa,
              posDanaList: json.posDanaList || posDanaList,
              metodePembayaranList: json.metodePembayaranList || metodePembayaranList,
              businessUnits: json.businessUnits || businessUnits,
              businessRecords: json.businessRecords || businessRecords,
              landTenants: json.landTenants || landTenants,
            });
            bulkSaveTransactionsToFirestore(currentUser.uid, json.transactions);
          }

          alert('Berhasil merestore data kas, usaha & sewa DKM dari file backup!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengembalikan seluruh data transaksi, unit usaha, sewa & kategori ke data contoh awal DKM? Data yang diinput sendiri akan terhapus.'
      )
    ) {
      setTransactions(initialTransactions);
      setMosqueProfile(initialMosqueProfile);
      setCategoriesPemasukan(CATEGORIES_PEMASUKAN);
      setCategoriesPengeluaran(CATEGORIES_PENGELUARAN);
      setCategoriesSewa(CATEGORIES_SEWA);
      setPosDanaList(DEFAULT_POS_DANA);
      setMetodePembayaranList(DEFAULT_METODE_PEMBAYARAN);
      setBusinessUnits(initialBusinessUnits);
      setBusinessRecords(initialBusinessRecords);
      setLandTenants(initialLandTenants);
      localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES_PEMASUKAN);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES_PENGELUARAN);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES_SEWA);
      localStorage.removeItem(STORAGE_KEY_POS_DANA);
      localStorage.removeItem(STORAGE_KEY_METODE_PEMBAYARAN);
      localStorage.removeItem(STORAGE_KEY_BUSINESS_UNITS);
      localStorage.removeItem(STORAGE_KEY_BUSINESS_RECORDS);
      localStorage.removeItem(STORAGE_KEY_LAND_TENANTS);

      if (currentUser) {
        saveSettingsToFirestore(currentUser.uid, {
          mosqueProfile: initialMosqueProfile,
          categoriesPemasukan: CATEGORIES_PEMASUKAN,
          categoriesPengeluaran: CATEGORIES_PENGELUARAN,
          categoriesSewa: CATEGORIES_SEWA,
          posDanaList: DEFAULT_POS_DANA,
          metodePembayaranList: DEFAULT_METODE_PEMBAYARAN,
          businessUnits: initialBusinessUnits,
          businessRecords: initialBusinessRecords,
          landTenants: initialLandTenants,
        });
        bulkSaveTransactionsToFirestore(currentUser.uid, initialTransactions);
      }
    }
  };

  // Determine if the current session is in Read-Only Mode (e.g. accessed by Jamaah via link/QR or explicitly viewing public portal)
  const isSharedOrPublicVisitor = Boolean(
    dkmParam ||
    (typeof window !== 'undefined' &&
      (new URLSearchParams(window.location.search).get('role') === 'jamaah' ||
        new URLSearchParams(window.location.search).get('tab') === 'jamaah'))
  );

  // If user is accessing via shared link or portal without logging in as this DKM owner, enforce read-only
  const isReadOnly = Boolean(
    isSharedOrPublicVisitor && (!currentUser || (dkmParam && currentUser.uid !== dkmParam))
  );

  const effectiveDkmId = dkmParam || currentUser?.uid || undefined;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white print:min-h-0 text-slate-900 font-sans antialiased selection:bg-emerald-200 relative">
      {/* Top App Navbar */}
      <Navbar
        mosqueProfile={mosqueProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettingsModal={(tab) => handleNavigateToSettings(tab || 'profile')}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        currentUser={currentUser}
        readOnly={isReadOnly}
        onOpenLoginModal={() => handleNavigateToSettings('account')}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 print:p-0 print:m-0 print:max-w-none print:bg-white">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            transactions={transactions}
            mosqueProfile={mosqueProfile}
            selectedMonth={reportMonth}
            selectedYear={reportYear}
            posDanaList={posDanaList}
            businessUnits={businessUnits}
            businessRecords={businessRecords}
            onOpenAddModal={handleOpenAddModal}
            onNavigateTab={setActiveTab}
            onSelectFundFilter={(fund) => {
              setSelectedFundFilter(fund);
              setActiveTab('transactions');
            }}
            readOnly={isReadOnly}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            onOpenAddModal={handleOpenAddModal}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            initialFundFilter={selectedFundFilter}
            categoriesPemasukan={categoriesPemasukan}
            categoriesPengeluaran={categoriesPengeluaran}
            posDanaList={posDanaList}
            mosqueProfile={mosqueProfile}
            readOnly={isReadOnly}
          />
        )}

        {activeTab === 'monthlyReport' && (
          <MonthlyReportView
            transactions={transactions}
            mosqueProfile={mosqueProfile}
            selectedMonth={reportMonth}
            selectedYear={reportYear}
            onMonthYearChange={(m, y) => {
              setReportMonth(m);
              setReportYear(y);
            }}
            categoriesPemasukan={categoriesPemasukan}
            categoriesPengeluaran={categoriesPengeluaran}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts transactions={transactions} posDanaList={posDanaList} />
        )}

        {activeTab === 'business' && (
          <MosqueBusinessTab
            businessUnits={businessUnits}
            businessRecords={businessRecords}
            landTenants={landTenants}
            categoriesSewa={categoriesSewa}
            mosqueProfile={mosqueProfile}
            posDanaList={posDanaList}
            metodePembayaranList={metodePembayaranList}
            onAddUnit={handleAddBusinessUnit}
            onEditUnit={handleEditBusinessUnit}
            onDeleteUnit={handleDeleteBusinessUnit}
            onAddRecord={handleAddBusinessRecord}
            onEditRecord={handleEditBusinessRecord}
            onDeleteRecord={handleDeleteBusinessRecord}
            onPushRecordToTransaction={handlePushRecordToTransaction}
            onAddTenant={handleAddTenant}
            onEditTenant={handleEditTenant}
            onDeleteTenant={handleDeleteTenant}
            onPayTenantRent={handlePayTenantRent}
            onDeleteTenantPayment={handleDeleteTenantPayment}
            onNavigateToTransactions={(trxId) => {
              setActiveTab('transactions');
            }}
            readOnly={isReadOnly}
          />
        )}

        {activeTab === 'tvMode' && (
          <PublicDisplayBoard
            transactions={transactions}
            mosqueProfile={mosqueProfile}
          />
        )}

        {activeTab === 'jamaah' && (
          <JamaahReportPortal
            transactions={transactions}
            mosqueProfile={mosqueProfile}
            businessUnits={businessUnits}
            businessRecords={businessRecords}
            landTenants={landTenants}
            posDanaList={posDanaList}
            selectedMonth={reportMonth}
            selectedYear={reportYear}
            onMonthYearChange={(m, y) => {
              setReportMonth(m);
              setReportYear(y);
            }}
            dkmId={effectiveDkmId}
            readOnly={isReadOnly}
            onOpenLoginModal={() => handleNavigateToSettings('account')}
          />
        )}

        {activeTab === 'settings' && (
          <MosqueSettingsTab
            mosqueProfile={mosqueProfile}
            onSaveProfile={handleSaveProfile}
            currentUser={currentUser}
            categoriesPemasukan={categoriesPemasukan}
            categoriesPengeluaran={categoriesPengeluaran}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onResetCategories={handleResetCategories}
            categoriesSewa={categoriesSewa}
            onAddCategorySewa={handleAddCategorySewa}
            onEditCategorySewa={handleEditCategorySewa}
            onDeleteCategorySewa={handleDeleteCategorySewa}
            posDanaList={posDanaList}
            onAddPosDana={handleAddPosDana}
            onEditPosDana={handleEditPosDana}
            onDeletePosDana={handleDeletePosDana}
            metodePembayaranList={metodePembayaranList}
            onAddMetodePembayaran={handleAddMetodePembayaran}
            onEditMetodePembayaran={handleEditMetodePembayaran}
            onDeleteMetodePembayaran={handleDeleteMetodePembayaran}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetData={handleResetData}
            defaultSubTab={settingsDefaultTab}
            onOpenPwaModal={() => setIsPwaModalOpen(true)}
            readOnly={isReadOnly}
            onOpenLoginModal={() => handleNavigateToSettings('account')}
          />
        )}
      </main>

      {/* Floating '+' Action Button - Only visible in Ikhtisar / Dashboard when not in read-only mode */}
      {activeTab === 'dashboard' && !isReadOnly && (
        <FloatingActionButton
          onOpenAddTransaction={(type) => {
            if (type) {
              // open add modal with selected type
            }
            handleOpenAddModal();
          }}
          onNavigateToBusiness={(openNewRecord) => {
            setActiveTab('business');
          }}
          activeTab={activeTab}
        />
      )}

      {/* Back Button Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2 backdrop-blur-sm print:hidden">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenSettingsModal={() => handleNavigateToSettings('profile')}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-800">
              {mosqueProfile.namaMasjid}
            </span>{' '}
            • Sistem Pengelolaan Kas DKM
          </div>
          <div className="text-emerald-700 font-medium">
            Amanah • Akuntabel • Berkelanjutan
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultFundCategory={defaultAddFundCategory}
        categoriesPemasukan={categoriesPemasukan}
        categoriesPengeluaran={categoriesPengeluaran}
        posDanaList={posDanaList}
        metodePembayaranList={metodePembayaranList}
        onOpenCategoryManager={() => {
          setIsAddModalOpen(false);
          handleNavigateToSettings('categories');
        }}
      />

      {/* PWA Installation Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallClick={handleInstallPWA}
      />
    </div>
  );
}
