import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionList } from './components/TransactionList';
import { MonthlyReportView } from './components/MonthlyReportView';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { PublicDisplayBoard } from './components/PublicDisplayBoard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { MosqueSettingsModal } from './components/MosqueSettingsModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FundCategory, MosqueProfile, Transaction, TransactionType } from './types';
import {
  initialMosqueProfile,
  initialTransactions,
  CATEGORIES_PEMASUKAN,
  CATEGORIES_PENGELUARAN,
} from './data/initialData';
import { User } from 'firebase/auth';
import {
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
  const STORAGE_KEY_POS_DANA = 'dkm_pos_dana_v1';
  const STORAGE_KEY_METODE_PEMBAYARAN = 'dkm_metode_pembayaran_v1';

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
    if (saved) {
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
    if (saved) {
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
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return CATEGORIES_PEMASUKAN;
  });

  const [categoriesPengeluaran, setCategoriesPengeluaran] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES_PENGELUARAN);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return CATEGORIES_PENGELUARAN;
  });

  // State: Pos Dana List
  const [posDanaList, setPosDanaList] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_POS_DANA);
    if (saved) {
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
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_METODE_PEMBAYARAN;
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
    localStorage.setItem(STORAGE_KEY_POS_DANA, JSON.stringify(posDanaList));
  }, [posDanaList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_METODE_PEMBAYARAN, JSON.stringify(metodePembayaranList));
  }, [metodePembayaranList]);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore Real-Time Data for Authenticated User
  useEffect(() => {
    if (currentUser?.uid) {
      const unsubscribeData = subscribeFirestoreData(currentUser.uid, (data) => {
        if (data.mosqueProfile) {
          setMosqueProfile(data.mosqueProfile);
        }
        if (data.categoriesPemasukan && data.categoriesPemasukan.length > 0) {
          setCategoriesPemasukan(data.categoriesPemasukan);
        }
        if (data.categoriesPengeluaran && data.categoriesPengeluaran.length > 0) {
          setCategoriesPengeluaran(data.categoriesPengeluaran);
        }
        if (data.posDanaList && data.posDanaList.length > 0) {
          setPosDanaList(data.posDanaList);
        }
        if (data.metodePembayaranList && data.metodePembayaranList.length > 0) {
          setMetodePembayaranList(data.metodePembayaranList);
        }
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      });

      return () => unsubscribeData();
    }
  }, [currentUser?.uid]);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode'
  >(() => {
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

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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
      if (isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
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
  }, [activeTab, isAddModalOpen, isSettingsModalOpen, isPwaModalOpen]);

  const handleOpenSettingsModal = (
    tab: 'profile' | 'account' | 'categories' | 'backup' | 'pwa' = 'profile'
  ) => {
    setSettingsDefaultTab(tab);
    setIsSettingsModalOpen(true);
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
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (currentUser) {
      deleteTransactionFromFirestore(currentUser.uid, id);
    }
  };

  const handleSaveTransaction = (
    trxData: Omit<Transaction, 'id'>,
    editId?: string
  ) => {
    if (editId) {
      const updatedTrx: Transaction = { ...trxData, id: editId };
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? updatedTrx : t))
      );
      if (currentUser) {
        saveTransactionToFirestore(currentUser.uid, updatedTrx);
      }
    } else {
      const newId = `TRX-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
      ).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
      const newTrx: Transaction = {
        ...trxData,
        id: newId,
      };
      setTransactions((prev) => [newTrx, ...prev]);
      if (currentUser) {
        saveTransactionToFirestore(currentUser.uid, newTrx);
      }
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
      if (currentUser) {
        saveSettingsToFirestore(currentUser.uid, {
          categoriesPemasukan: CATEGORIES_PEMASUKAN,
          categoriesPengeluaran: CATEGORIES_PENGELUARAN,
        });
      }
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

  // Backup & Restore
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      mosqueProfile,
      transactions,
      categoriesPemasukan,
      categoriesPengeluaran,
      posDanaList,
      metodePembayaranList,
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
          if (json.posDanaList) setPosDanaList(json.posDanaList);
          if (json.metodePembayaranList) setMetodePembayaranList(json.metodePembayaranList);

          if (currentUser) {
            saveSettingsToFirestore(currentUser.uid, {
              mosqueProfile: json.mosqueProfile || mosqueProfile,
              categoriesPemasukan: json.categoriesPemasukan || categoriesPemasukan,
              categoriesPengeluaran: json.categoriesPengeluaran || categoriesPengeluaran,
              posDanaList: json.posDanaList || posDanaList,
              metodePembayaranList: json.metodePembayaranList || metodePembayaranList,
            });
            bulkSaveTransactionsToFirestore(currentUser.uid, json.transactions);
          }

          alert('Berhasil merestore data kas DKM dari file backup!');
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
        'Apakah Anda yakin ingin mengembalikan seluruh data transaksi & kategori ke data contoh awal DKM? Data yang diinput sendiri akan terhapus.'
      )
    ) {
      setTransactions(initialTransactions);
      setMosqueProfile(initialMosqueProfile);
      setCategoriesPemasukan(CATEGORIES_PEMASUKAN);
      setCategoriesPengeluaran(CATEGORIES_PENGELUARAN);
      setPosDanaList(DEFAULT_POS_DANA);
      setMetodePembayaranList(DEFAULT_METODE_PEMBAYARAN);
      localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES_PEMASUKAN);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES_PENGELUARAN);
      localStorage.removeItem(STORAGE_KEY_POS_DANA);
      localStorage.removeItem(STORAGE_KEY_METODE_PEMBAYARAN);

      if (currentUser) {
        saveSettingsToFirestore(currentUser.uid, {
          mosqueProfile: initialMosqueProfile,
          categoriesPemasukan: CATEGORIES_PEMASUKAN,
          categoriesPengeluaran: CATEGORIES_PENGELUARAN,
          posDanaList: DEFAULT_POS_DANA,
          metodePembayaranList: DEFAULT_METODE_PEMBAYARAN,
        });
        bulkSaveTransactionsToFirestore(currentUser.uid, initialTransactions);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-emerald-200 relative">
      {/* Top App Navbar */}
      <Navbar
        mosqueProfile={mosqueProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettingsModal={(tab) => handleOpenSettingsModal(tab || 'profile')}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            transactions={transactions}
            mosqueProfile={mosqueProfile}
            selectedMonth={reportMonth}
            selectedYear={reportYear}
            posDanaList={posDanaList}
            onOpenAddModal={handleOpenAddModal}
            onNavigateTab={setActiveTab}
            onSelectFundFilter={(fund) => {
              setSelectedFundFilter(fund);
              setActiveTab('transactions');
            }}
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

        {activeTab === 'tvMode' && (
          <PublicDisplayBoard
            transactions={transactions}
            mosqueProfile={mosqueProfile}
          />
        )}
      </main>

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
        onOpenSettingsModal={() => handleOpenSettingsModal('profile')}
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
          handleOpenSettingsModal('categories');
        }}
      />

      {/* Consolidated Menu Pengaturan Modal */}
      <MosqueSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        mosqueProfile={mosqueProfile}
        onSaveProfile={handleSaveProfile}
        currentUser={currentUser}
        categoriesPemasukan={categoriesPemasukan}
        categoriesPengeluaran={categoriesPengeluaran}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onResetCategories={handleResetCategories}
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
        defaultTab={settingsDefaultTab}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
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
