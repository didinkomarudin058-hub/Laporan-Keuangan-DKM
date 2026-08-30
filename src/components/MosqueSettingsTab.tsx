import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Tag,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Check,
  Edit2,
  Trash2,
  Database,
  ShieldCheck,
  Settings,
  AlertTriangle,
  Wallet,
  CreditCard,
  CheckCircle2,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { MosqueProfile, TransactionType } from '../types';
import { AuthAccountTab } from './AuthAccountTab';

export interface MosqueSettingsTabProps {
  mosqueProfile: MosqueProfile;
  onSaveProfile: (updatedProfile: MosqueProfile) => void;

  // Auth & Mosque ID
  currentUser: User | null;

  // Categories
  categoriesPemasukan: string[];
  categoriesPengeluaran: string[];
  onAddCategory: (type: TransactionType, name: string) => void;
  onEditCategory: (type: TransactionType, oldName: string, newName: string) => void;
  onDeleteCategory: (type: TransactionType, name: string) => void;
  onResetCategories: () => void;

  // Kategori Sewa
  categoriesSewa?: string[];
  onAddCategorySewa?: (name: string) => void;
  onEditCategorySewa?: (oldName: string, newName: string) => void;
  onDeleteCategorySewa?: (name: string) => void;

  // Pos Dana Kas
  posDanaList?: string[];
  onAddPosDana?: (name: string) => void;
  onEditPosDana?: (oldName: string, newName: string) => void;
  onDeletePosDana?: (name: string) => void;

  // Metode Pembayaran
  metodePembayaranList?: string[];
  onAddMetodePembayaran?: (name: string) => void;
  onEditMetodePembayaran?: (oldName: string, newName: string) => void;
  onDeleteMetodePembayaran?: (name: string) => void;

  // Backup & Restore
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;

  // Initial sub-tab
  defaultSubTab?: 'profile' | 'categories' | 'account' | 'backup' | 'pwa';
  onOpenPwaModal?: () => void;
  readOnly?: boolean;
  onOpenLoginModal?: () => void;
}

export const MosqueSettingsTab: React.FC<MosqueSettingsTabProps> = ({
  mosqueProfile,
  onSaveProfile,
  currentUser,
  categoriesPemasukan,
  categoriesPengeluaran,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onResetCategories,
  categoriesSewa = [],
  onAddCategorySewa,
  onEditCategorySewa,
  onDeleteCategorySewa,
  posDanaList = ['Kas Operasional', 'Kas Pembangunan'],
  onAddPosDana,
  onEditPosDana,
  onDeletePosDana,
  metodePembayaranList = ['Tunai', 'Transfer Bank', 'QRIS', 'Cek'],
  onAddMetodePembayaran,
  onEditMetodePembayaran,
  onDeleteMetodePembayaran,
  onExportBackup,
  onImportBackup,
  onResetData,
  defaultSubTab = 'profile',
  onOpenPwaModal,
  readOnly = false,
  onOpenLoginModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'profile' | 'categories' | 'account' | 'backup' | 'pwa'
  >(defaultSubTab);

  // Profile Form State
  const [profile, setProfile] = useState<MosqueProfile>({ ...mosqueProfile });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Master Data Sub-Tab State
  const [activeCatType, setActiveCatType] = useState<
    'pemasukan' | 'pengeluaran' | 'posDana' | 'metodePembayaran' | 'kategoriSewa'
  >('pemasukan');
  const [newItemName, setNewItemName] = useState('');
  const [editingItemName, setEditingItemName] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState('');

  useEffect(() => {
    setProfile({ ...mosqueProfile });
  }, [mosqueProfile]);

  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setProfile((prev) => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setProfile((prev) => ({ ...prev, logoUrl: undefined }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    if (activeCatType === 'pemasukan' || activeCatType === 'pengeluaran') {
      onAddCategory(activeCatType, trimmed);
    } else if (activeCatType === 'kategoriSewa' && onAddCategorySewa) {
      onAddCategorySewa(trimmed);
    } else if (activeCatType === 'posDana' && onAddPosDana) {
      onAddPosDana(trimmed);
    } else if (activeCatType === 'metodePembayaran' && onAddMetodePembayaran) {
      onAddMetodePembayaran(trimmed);
    }

    setNewItemName('');
  };

  const handleSaveItemEdit = (oldName: string) => {
    const trimmed = editInputValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingItemName(null);
      return;
    }

    if (activeCatType === 'pemasukan' || activeCatType === 'pengeluaran') {
      onEditCategory(activeCatType, oldName, trimmed);
    } else if (activeCatType === 'kategoriSewa' && onAddCategorySewa) {
      if (onEditCategorySewa) onEditCategorySewa(oldName, trimmed);
    } else if (activeCatType === 'posDana' && onEditPosDana) {
      onEditPosDana(oldName, trimmed);
    } else if (activeCatType === 'metodePembayaran' && onEditMetodePembayaran) {
      onEditMetodePembayaran(oldName, trimmed);
    }

    setEditingItemName(null);
  };

  const handleDeleteItem = (item: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${item}"?`)) return;

    if (activeCatType === 'pemasukan' || activeCatType === 'pengeluaran') {
      onDeleteCategory(activeCatType, item);
    } else if (activeCatType === 'kategoriSewa' && onDeleteCategorySewa) {
      onDeleteCategorySewa(item);
    } else if (activeCatType === 'posDana' && onDeletePosDana) {
      onDeletePosDana(item);
    } else if (activeCatType === 'metodePembayaran' && onDeleteMetodePembayaran) {
      onDeleteMetodePembayaran(item);
    }
  };

  const currentList =
    activeCatType === 'pemasukan'
      ? categoriesPemasukan
      : activeCatType === 'pengeluaran'
      ? categoriesPengeluaran
      : activeCatType === 'kategoriSewa'
      ? categoriesSewa
      : activeCatType === 'posDana'
      ? posDanaList
      : metodePembayaranList;

  const getSubTabLabel = () => {
    switch (activeCatType) {
      case 'pemasukan':
        return 'Kategori Pemasukan';
      case 'pengeluaran':
        return 'Kategori Pengeluaran';
      case 'kategoriSewa':
        return 'Kategori Sewa';
      case 'posDana':
        return 'Pos Dana Kas';
      case 'metodePembayaran':
        return 'Metode Pembayaran';
    }
  };

  const getPlaceholder = () => {
    switch (activeCatType) {
      case 'pemasukan':
        return 'Tambah nama kategori pemasukan baru...';
      case 'pengeluaran':
        return 'Tambah nama kategori pengeluaran baru...';
      case 'kategoriSewa':
        return 'Tambah nama kategori sewa baru (misal: Sewa Booth UMKM)...';
      case 'posDana':
        return 'Tambah nama Pos Dana Kas baru (misal: Kas Ambulance)...';
      case 'metodePembayaran':
        return 'Tambah metode pembayaran baru (misal: DANA, OVO)...';
    }
  };

  return (
    <div id="mosque-settings-tab-view" className="space-y-6 animate-fade-in pb-12">
      {/* Read-Only Mode Banner */}
      {readOnly && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <span>Pengaturan Terproteksi (Mode Jamaah)</span>
                <span className="bg-amber-200/80 text-amber-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  Hanya Lihat
                </span>
              </div>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Pengubahan profil masjid, nomor rekening, penambahan pos dana, impor cadangan, serta reset data kas dikhususkan bagi Pengurus DKM terdaftar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenLoginModal) {
                onOpenLoginModal();
              } else {
                setActiveSubTab('account');
              }
            }}
            className="shrink-0 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Masuk Pengurus DKM</span>
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md shrink-0">
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Menu Pengaturan DKM
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 font-normal">
              Kelola identitas masjid, struktur pos dana, kategori transaksi, akun sinkronisasi cloud, serta pencadangan data.
            </p>
          </div>
        </div>

        <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-4 py-2 text-xs text-emerald-200 shrink-0">
          <span className="text-slate-300">Masjid Terdaftar:</span>{' '}
          <strong className="text-amber-300 font-bold">{mosqueProfile.namaMasjid}</strong>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs flex overflow-x-auto no-scrollbar gap-1.5">
        <button
          id="settings-tab-profile"
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil DKM</span>
        </button>

        <button
          id="settings-tab-categories"
          type="button"
          onClick={() => setActiveSubTab('categories')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'categories'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Pos Dana & Kategori</span>
        </button>

        <button
          id="settings-tab-account"
          type="button"
          onClick={() => setActiveSubTab('account')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'account'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Akun & Cloud Sync</span>
        </button>

        <button
          id="settings-tab-backup"
          type="button"
          onClick={() => setActiveSubTab('backup')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'backup'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup & Reset</span>
        </button>

        <button
          id="settings-tab-pwa"
          type="button"
          onClick={() => setActiveSubTab('pwa')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'pwa'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Install Aplikasi</span>
        </button>
      </div>

      {/* Main Container Card for Sub-Tab Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {/* SUB-TAB 1: PROFIL DKM MASJID */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Informasi & Legalitas Profil Masjid
              </h3>
              <p className="text-xs text-slate-500">
                Informasi ini otomatis disematkan pada kop surat laporan bulanan, kwitansi sewa, dan bilah atas aplikasi.
              </p>
            </div>

            {profileSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profil DKM berhasil disimpan dan diperbarui di seluruh modul aplikasi!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Logo Upload Section */}
              <div className="sm:col-span-2 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-2">
                  Logo Resmi Masjid / Musholla
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-24 h-24 bg-white rounded-2xl border-2 border-emerald-300 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {profile.logoUrl ? (
                      <img
                        src={profile.logoUrl}
                        alt="Logo Masjid"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-emerald-700 p-1 text-center">
                        <Building2 className="w-9 h-9" />
                        <span className="text-[10px] font-bold mt-1 leading-tight">Tanpa Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Logo ini ditampilkan pada bilah navigasi utama, tampilan TV informasi kas, dan kop surat cetak PDF.
                    </p>
                    {!readOnly && (
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <label className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>{profile.logoUrl ? 'Ganti Logo Masjid' : 'Upload File Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {profile.logoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus Logo</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Resmi Masjid / Musholla *
                </label>
                <input
                  type="text"
                  required
                  value={profile.namaMasjid}
                  onChange={(e) => setProfile({ ...profile, namaMasjid: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap / Jalan / RT / RW *
                </label>
                <input
                  type="text"
                  required
                  value={profile.alamat}
                  placeholder="Jl. Raya Pasar Sumur Rt. 002/001"
                  onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Desa / Kelurahan <span className="text-emerald-700 font-normal">(Untuk Titimangsa Cetak)</span>
                </label>
                <input
                  type="text"
                  value={profile.desa || ''}
                  placeholder="Misal: Sumberjaya"
                  onChange={(e) => setProfile({ ...profile, desa: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={profile.kecamatan || ''}
                  placeholder="Misal: Sumur"
                  onChange={(e) => setProfile({ ...profile, kecamatan: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota / Kabupaten & Provinsi *
                </label>
                <input
                  type="text"
                  required
                  value={profile.kota}
                  placeholder="Misal: Pandeglang - Banten"
                  onChange={(e) => setProfile({ ...profile, kota: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telepon / WhatsApp DKM *
                </label>
                <input
                  type="text"
                  required
                  value={profile.telepon}
                  placeholder="085718247389"
                  onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Resmi DKM
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Bank Rekening Infaq
                </label>
                <input
                  type="text"
                  value={profile.namaBank}
                  placeholder="BSI / BRI / Bank Mandiri"
                  onChange={(e) => setProfile({ ...profile, namaBank: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Rekening Bank
                </label>
                <input
                  type="text"
                  value={profile.nomorRekening}
                  onChange={(e) => setProfile({ ...profile, nomorRekening: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Atas Nama Rekening Infaq (a.n)
                </label>
                <input
                  type="text"
                  value={profile.anRekening}
                  onChange={(e) => setProfile({ ...profile, anRekening: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                />
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                  Pengurus DKM (Untuk Tanda Tangan Laporan Real-Time)
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Ketua DKM *
                </label>
                <input
                  type="text"
                  required
                  value={profile.ketuaDKM}
                  onChange={(e) => setProfile({ ...profile, ketuaDKM: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Bendahara DKM *
                </label>
                <input
                  type="text"
                  required
                  value={profile.bendaharaDKM}
                  onChange={(e) => setProfile({ ...profile, bendaharaDKM: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Sekretaris DKM *
                </label>
                <input
                  type="text"
                  required
                  value={profile.sekretarisDKM}
                  onChange={(e) => setProfile({ ...profile, sekretarisDKM: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motto / Slogan Masjid
                </label>
                <input
                  type="text"
                  value={profile.motto}
                  placeholder="Amanah, Transparan, Berkelanjutan"
                  onChange={(e) => setProfile({ ...profile, motto: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              {!readOnly ? (
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil DKM</span>
                </button>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Mode Jamaah (Hanya Lihat): Masuk dengan Akun Pengurus DKM untuk mengubah identitas masjid.
                </p>
              )}
            </div>
          </form>
        )}

        {/* SUB-TAB 2: MASTER DATA & POS KAS */}
        {activeSubTab === 'categories' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Kelola Pos Dana Kas & Kategori Transaksi
              </h3>
              <p className="text-xs text-slate-500">
                Atur nama-nama pos dana kas masjid, kategori penerimaan infaq, pengeluaran, sewa lahan, serta metode pembayaran.
              </p>
            </div>

            {/* Sub-Pills Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveCatType('pemasukan');
                  setEditingItemName(null);
                }}
                className={`py-2.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCatType === 'pemasukan'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Pemasukan ({categoriesPemasukan.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCatType('pengeluaran');
                  setEditingItemName(null);
                }}
                className={`py-2.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCatType === 'pengeluaran'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Pengeluaran ({categoriesPengeluaran.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCatType('kategoriSewa');
                  setEditingItemName(null);
                }}
                className={`py-2.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCatType === 'kategoriSewa'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Sewa ({categoriesSewa.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCatType('posDana');
                  setEditingItemName(null);
                }}
                className={`py-2.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCatType === 'posDana'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Pos Dana ({posDanaList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCatType('metodePembayaran');
                  setEditingItemName(null);
                }}
                className={`py-2.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1 ${
                  activeCatType === 'metodePembayaran'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Metode ({metodePembayaranList.length})</span>
              </button>
            </div>

            {/* Form Add New Item */}
            {!readOnly ? (
              <form onSubmit={handleAddItemSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={getPlaceholder()}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 py-2.5 px-3.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    activeCatType === 'pemasukan'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : activeCatType === 'pengeluaran'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : activeCatType === 'kategoriSewa'
                      ? 'bg-teal-700 hover:bg-teal-800'
                      : activeCatType === 'posDana'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah {getSubTabLabel()}</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Mode Jamaah (Hanya Lihat): Struktur pos dana & kategori di bawah ini bersifat informatif.
              </p>
            )}

            {/* Current Items List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {currentList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-400 italic">
                    Belum ada data untuk {getSubTabLabel()}.
                  </p>
                </div>
              ) : (
                currentList.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm transition"
                  >
                    {editingItemName === item ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editInputValue}
                          onChange={(e) => setEditInputValue(e.target.value)}
                          className="flex-1 py-1.5 px-3 text-xs sm:text-sm border border-emerald-500 rounded-lg bg-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveItemEdit(item)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                          title="Simpan perubahan"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItemName(null)}
                          className="p-1.5 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 cursor-pointer"
                          title="Batal"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-slate-800">{item}</span>
                        {!readOnly && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemName(item);
                                setEditInputValue(item);
                              }}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer"
                              title={`Edit nama ${getSubTabLabel()}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
                              title={`Hapus ${getSubTabLabel()}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {!readOnly && (activeCatType === 'pemasukan' || activeCatType === 'pengeluaran') && (
              <div className="pt-4 border-t border-slate-200 flex justify-start">
                <button
                  type="button"
                  onClick={onResetCategories}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Kategori Pemasukan & Pengeluaran ke Format Standar DKM</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: AKUN & CLOUD SYNC */}
        {activeSubTab === 'account' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Otentikasi Akun & Sinkronisasi Cloud
              </h3>
              <p className="text-xs text-slate-500">
                Masuk dengan akun Google untuk menyinkronkan seluruh pembukuan kas masjid secara otomatis dan aman di Firebase Cloud.
              </p>
            </div>

            <AuthAccountTab currentUser={currentUser} />
          </div>
        )}

        {/* SUB-TAB 4: BACKUP, RESTORE & RESET */}
        {activeSubTab === 'backup' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Pencadangan, Pemulihan & Reset Data Kas
              </h3>
              <p className="text-xs text-slate-500">
                Simpan berkas cadangan offline atau pulihkan data kas jika Anda berganti perangkat komputer/HP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2.5 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <span>1. Ekspor Backup JSON</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unduh seluruh riwayat transaksi kas, profil DKM, unit usaha sewa, dan daftar kategori ke dalam satu file cadangan `.json` di penyimpanan perangkat Anda.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Backup Data (JSON)</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2.5 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span>2. Impor / Restore File JSON</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pulihkan data kas masjid dari file `.json` cadangan yang telah diekspor sebelumnya.
                </p>
                <div className="pt-2">
                  {!readOnly ? (
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95">
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Backup JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={onImportBackup}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Fitur impor data cadangan dikhususkan bagi Pengurus DKM.
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 bg-rose-50 p-5 rounded-2xl border border-rose-200 space-y-3">
                <div className="flex items-center gap-2.5 text-rose-900 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <span>3. Reset ke Data Sampel Bawaan</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Kembalikan seluruh pembukuan kas masjid ke data percontohan awal DKM.
                  <span className="font-bold"> Perhatian: Seluruh data transaksi yang telah Anda masukkan akan diganti dengan data sampel.</span>
                </p>
                <div className="pt-2">
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={onResetData}
                      className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Seluruh Data Kas Masjid</span>
                    </button>
                  ) : (
                    <p className="text-xs text-rose-600 italic font-medium">
                      Reset data kas dikunci untuk akun Pengurus DKM.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 5: INSTALL PWA ANDROID & DESKTOP */}
        {activeSubTab === 'pwa' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Aplikasi Web Mandiri (PWA)
              </h3>
              <p className="text-xs text-slate-500">
                Jalankan aplikasi Kas DKM layaknya aplikasi bawaan smartphone (APK) atau komputer tanpa perlu browser terbuka.
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md shrink-0">
                  <Download className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white">Aplikasi Web Progresif (PWA)</h4>
                  <p className="text-xs text-emerald-200">Dukungan Lintas Platform: Android, Windows, macOS, iOS</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Install aplikasi Kas DKM ke layar utama smartphone atau desktop PC Anda. Tanpa PlayStore/AppStore, aplikasi langsung terpasang cepat, hemat memori, dan dapat dibuka offline ketika koneksi internet sedang lambat.
              </p>

              {onOpenPwaModal && (
                <button
                  type="button"
                  onClick={onOpenPwaModal}
                  className="w-full sm:w-auto py-3 px-6 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>BUKA PANDUAN & TOMBOL INSTALL PWA</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>📱 HP Android (Google Chrome):</span>
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Buka Chrome di HP -&gt; Ketuk menu titik 3 di pojok kanan atas -&gt; Pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>💻 Komputer / PC (Chrome & Edge):</span>
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Buka website di Chrome/Edge PC -&gt; Klik ikon <strong>Install</strong> di address bar kanan atas -&gt; Pilih <strong>Instal</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
