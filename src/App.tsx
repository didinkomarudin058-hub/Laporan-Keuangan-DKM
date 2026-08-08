import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Download, X, Smartphone } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionList } from './components/TransactionList';
import { MonthlyReportView } from './components/MonthlyReportView';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { PublicDisplayBoard } from './components/PublicDisplayBoard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { MosqueSettingsModal } from './components/MosqueSettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PwaInstallModal } from './components/PwaInstallModal';

import { FundCategory, MosqueProfile, Transaction, TransactionType } from './types';
import {
  initialMosqueProfile,
  initialTransactions,
  CATEGORIES_PEMASUKAN,
  CATEGORIES_PENGELUARAN,
} from './data/initialData';
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

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
        return JSON.parse(saved);
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

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore Real-Time Data when User is Logged In
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeData = subscribeFirestoreData(currentUser.uid, (data) => {
      if (data.mosqueProfile) {
        setMosqueProfile(data.mosqueProfile);
      }
      if (data.categoriesPemasukan) {
        setCategoriesPemasukan(data.categoriesPemasukan);
      }
      if (data.categoriesPengeluaran) {
        setCategoriesPengeluaran(data.categoriesPengeluaran);
      }
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    });

    // If initial cloud sync is empty, upload current local state to cloud
    saveSettingsToFirestore(currentUser.uid, {
      mosqueProfile,
      categoriesPemasukan,
      categoriesPengeluaran,
    });
    bulkSaveTransactionsToFirestore(currentUser.uid, transactions);

    return () => unsubscribeData();
  }, [currentUser?.uid]);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode'
  >('dashboard');

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
    'profile' | 'account' | 'categories' | 'backup' | 'pwa'
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
    // Initialize browser history entry
    window.history.replaceState({ tab: activeTab }, '');
  }, []);

  useEffect(() => {
    // Whenever tab changes, push a state so back button can intercept
    window.history.pushState({ tab: activeTab }, '');
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      // 1. Priority: If Add Modal or Settings Modal is open, close modal
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

      // 2. Priority: If not on Dashboard, switch back to Dashboard (1x back press)
      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        window.history.pushState({ tab: 'dashboard' }, '');
        return;
      }

      // 3. Priority: Already on Dashboard! Check double-press to exit app
      const now = Date.now();
      const timeDiff = now - lastBackPressTimeRef.current;

      if (timeDiff < 2000) {
        // Pressed twice within 2 seconds -> Allow closing / exit
        setToastMessage('Menutup aplikasi Kas DKM...');
        setTimeout(() => setToastMessage(null), 1500);
      } else {
        // First back press -> Notify user to press again within 2 seconds
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
      // Edit existing
      const updatedTrx: Transaction = { ...trxData, id: editId };
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? updatedTrx : t))
      );
      if (currentUser) {
        saveTransactionToFirestore(currentUser.uid, updatedTrx);
      }
    } else {
      // Add new
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

  // Backup & Restore
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      mosqueProfile,
      transactions,
      categoriesPemasukan,
      categoriesPengeluaran,
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

          if (currentUser) {
            saveSettingsToFirestore(currentUser.uid, {
              mosqueProfile: json.mosqueProfile || mosqueProfile,
              categoriesPemasukan: json.categoriesPemasukan || categoriesPemasukan,
              categoriesPengeluaran: json.categoriesPengeluaran || categoriesPengeluaran,
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
      localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES_PEMASUKAN);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES_PENGELUARAN);

      if (currentUser) {
        saveSettingsToFirestore(currentUser.uid, {
          mosqueProfile: initialMosqueProfile,
          categoriesPemasukan: CATEGORIES_PEMASUKAN,
          categoriesPengeluaran: CATEGORIES_PENGELUARAN,
        });
        bulkSaveTransactionsToFirestore(currentUser.uid, initialTransactions);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-emerald-200 relative">
      {/* PWA Installation Prompt Banner */}
      {showInstallBanner && (
        <div className="bg-emerald-800 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md z-50 sticky top-0 border-b border-emerald-700">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-300" />
            <span>Install aplikasi <strong>Kas DKM</strong> di Android / Desktop Anda!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallPWA}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Install App
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-emerald-200 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
          <AnalyticsCharts transactions={transactions} />
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2 backdrop-blur-sm">
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
