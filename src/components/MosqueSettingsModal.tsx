import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Building2,
  Save,
  UserCheck,
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
  QrCode,
  Printer,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Tv,
  ListFilter,
  Share2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { User } from 'firebase/auth';
import { MosqueProfile, TransactionType, Transaction } from '../types';
import { AuthAccountTab } from './AuthAccountTab';

interface MosqueSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueProfile: MosqueProfile;
  onSaveProfile: (updatedProfile: MosqueProfile) => void;

  // Auth & Mosque ID
  currentUser: User | null;
  mosqueId?: string;
  transactions?: Transaction[];
  onOpenJamaahView?: (tab?: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode') => void;

  // Categories
  categoriesPemasukan: string[];
  categoriesPengeluaran: string[];
  onAddCategory: (type: TransactionType, name: string) => void;
  onEditCategory: (type: TransactionType, oldName: string, newName: string) => void;
  onDeleteCategory: (type: TransactionType, name: string) => void;
  onResetCategories: () => void;

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

  // Optional tab selector
  defaultTab?: 'profile' | 'barcode' | 'categories' | 'account' | 'backup' | 'pwa';
  onOpenPwaModal?: () => void;
}

export const MosqueSettingsModal: React.FC<MosqueSettingsModalProps> = ({
  isOpen,
  onClose,
  mosqueProfile,
  onSaveProfile,
  currentUser,
  mosqueId,
  transactions = [],
  onOpenJamaahView,
  categoriesPemasukan,
  categoriesPengeluaran,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onResetCategories,
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
  defaultTab = 'profile',
  onOpenPwaModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'barcode' | 'categories' | 'account' | 'backup' | 'pwa'
  >(defaultTab);

  // Profile Form State
  const [profile, setProfile] = useState<MosqueProfile>({ ...mosqueProfile });

  // Barcode / QR State
  const [selectedDestination, setSelectedDestination] = useState<
    'portal' | 'monthlyReport' | 'transactions' | 'tvMode'
  >('portal');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      setBaseUrl(`${origin}${pathname}`);
    }
  }, []);

  // Compute full URL with real Mosque ID for Jamaican Transparency
  const effectiveMid = mosqueId || currentUser?.uid || 'dkm_masjid_utama';
  const getFullJamaahUrl = () => {
    if (!baseUrl) return '';
    const midParam = `&mid=${encodeURIComponent(effectiveMid)}`;
    if (selectedDestination === 'portal') {
      return `${baseUrl}?view=jamaah${midParam}`;
    }
    return `${baseUrl}?view=jamaah&tab=${selectedDestination}${midParam}`;
  };

  const currentUrl = getFullJamaahUrl();

  // Generate QR Code
  useEffect(() => {
    if (!currentUrl) return;
    QRCode.toDataURL(currentUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR in Settings:', err));
  }, [currentUrl]);

  // Master Data Sub-Tab State: 'pemasukan' | 'pengeluaran' | 'posDana' | 'metodePembayaran'
  const [activeCatType, setActiveCatType] = useState<
    'pemasukan' | 'pengeluaran' | 'posDana' | 'metodePembayaran'
  >('pemasukan');
  const [newItemName, setNewItemName] = useState('');
  const [editingItemName, setEditingItemName] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState('');

  useEffect(() => {
    setProfile({ ...mosqueProfile });
  }, [mosqueProfile, isOpen]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

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
    alert('Profil DKM berhasil diperbarui!');
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    if (activeCatType === 'pemasukan' || activeCatType === 'pengeluaran') {
      onAddCategory(activeCatType, trimmed);
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
      : activeCatType === 'posDana'
      ? posDanaList
      : metodePembayaranList;

  const getSubTabLabel = () => {
    switch (activeCatType) {
      case 'pemasukan':
        return 'Kategori Pemasukan';
      case 'pengeluaran':
        return 'Kategori Pengeluaran';
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
      case 'posDana':
        return 'Tambah nama Pos Dana Kas baru (misal: Kas Ambulance)...';
      case 'metodePembayaran':
        return 'Tambah metode pembayaran baru (misal: DANA, OVO)...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white">
                Pengaturan Sistem & Profil DKM
              </h3>
              <p className="text-xs text-emerald-200">
                Kelola profil masjid, pos dana kas, metode pembayaran, akun & backup data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-6 pt-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-700 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil DKM</span>
          </button>

          <button
            onClick={() => setActiveTab('barcode')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'barcode'
                ? 'border-emerald-700 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            <span>Barcode Jamaah (QR)</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'border-emerald-700 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Kelola Pos Dana & Metode</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'account'
                ? 'border-emerald-700 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Akun & Sync Cloud</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'backup'
                ? 'border-emerald-700 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Backup & Restore</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-emerald-700 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Install App PWA</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PROFIL DKM MASJID */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Upload Section */}
                <div className="sm:col-span-2 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                  <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-2">
                    Logo Resmi Masjid / Musholla
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-20 h-20 bg-white rounded-2xl border-2 border-emerald-300 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                      {profile.logoUrl ? (
                        <img
                          src={profile.logoUrl}
                          alt="Logo Masjid"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-emerald-700 p-1 text-center">
                          <Building2 className="w-8 h-8" />
                          <span className="text-[9px] font-bold mt-0.5 leading-tight">Tanpa Logo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Logo ini otomatis ditampilkan pada bilah navigasi utama, papan TV informasi, dan Kop Surat laporan keuangan PDF.
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <label className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{profile.logoUrl ? 'Ganti Logo' : 'Upload Logo Masjid'}</span>
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
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Logo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Resmi Masjid / Musholla
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.namaMasjid}
                    onChange={(e) => setProfile({ ...profile, namaMasjid: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Jalan / RT / RW
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.alamat}
                    placeholder="Jl. Masjid No. 15, RT 02/05"
                    onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Desa <span className="text-emerald-700 font-normal">(Untuk Titimangsa Cetak)</span>
                  </label>
                  <input
                    type="text"
                    value={profile.desa || ''}
                    placeholder="Misal: Sumberjaya"
                    onChange={(e) => setProfile({ ...profile, desa: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    value={profile.kecamatan || ''}
                    placeholder="Misal: Tambun Selatan"
                    onChange={(e) => setProfile({ ...profile, kecamatan: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Kabupaten & Provinsi
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.kota}
                    placeholder="Misal: Kab. Bekasi, Prov. Jawa Barat"
                    onChange={(e) => setProfile({ ...profile, kota: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telepon Kontak DKM / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.telepon}
                    onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Resmi DKM
                  </label>
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Bank Rekening Infaq
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.namaBank}
                    onChange={(e) => setProfile({ ...profile, namaBank: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Rekening Bank
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.nomorRekening}
                    onChange={(e) => setProfile({ ...profile, nomorRekening: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Atas Nama Rekening Infaq (a.n)
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.anRekening}
                    onChange={(e) => setProfile({ ...profile, anRekening: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Pengurus DKM (Untuk Tanda Tangan Laporan Real-Time)
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Ketua DKM
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.ketuaDKM}
                    onChange={(e) => setProfile({ ...profile, ketuaDKM: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Bendahara DKM
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.bendaharaDKM}
                    onChange={(e) => setProfile({ ...profile, bendaharaDKM: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Sekretaris DKM
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.sekretarisDKM}
                    onChange={(e) => setProfile({ ...profile, sekretarisDKM: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motto / Slogan DKM Masjid
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.motto}
                    onChange={(e) => setProfile({ ...profile, motto: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil DKM</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: BARCODE TRANSPARANSI JAMAAH */}
          {activeTab === 'barcode' && (
            <div className="space-y-6">
              {/* Banner Info */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      <QrCode className="w-3.5 h-3.5" />
                      QR Code Transparansi Kas Jamaah
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      Buku Kas Riil {mosqueProfile.namaMasjid}
                    </h4>
                    <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xl">
                      Jamaah dapat memindai barcode ini langsung dengan kamera smartphone mereka untuk melihat buku kas riil yang Anda kelola. Hak akses jamaah adalah <strong>Hanya Lihat (Read-Only)</strong> tanpa izin mengedit/menghapus data.
                    </p>
                  </div>
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-amber-400 text-emerald-950 items-center justify-center shrink-0 shadow-inner">
                    <QrCode className="w-7 h-7" />
                  </div>
                </div>
              </div>

              {/* Destination Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Halaman Tujuan Saat Barcode Dipindai:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDestination('portal')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      selectedDestination === 'portal'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${selectedDestination === 'portal' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">1. Ringkasan Kas Utama</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Saldo kas operasional, pembangunan & grafik keuangan</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDestination('monthlyReport')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      selectedDestination === 'monthlyReport'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${selectedDestination === 'monthlyReport' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">2. Laporan Bulanan & AI Narasi</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Laporan kas resmi bulanan lengkap dengan narasi DKM</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDestination('transactions')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      selectedDestination === 'transactions'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${selectedDestination === 'transactions' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <ListFilter className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">3. Jurnal Kas & Bukti Foto Nota</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Daftar rincian mutasi kas dan lampiran foto kwitansi/nota</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDestination('tvMode')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      selectedDestination === 'tvMode'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${selectedDestination === 'tvMode' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Tv className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">4. Tampilan TV Display Mading</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Mode tayang layar digital masjid / mading elektronik</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* QR Code Card & Actions */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                {/* QR Visual */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center shrink-0">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Barcode QR Transparansi Kas"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                      Membuat Barcode...
                    </div>
                  )}
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 mt-1">
                    Scan Barcode Jamaah
                  </span>
                </div>

                {/* Information & Action Buttons */}
                <div className="space-y-3.5 flex-1 w-full text-left">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Terhubung Langsung ke Database Kas Riil</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Barcode ini memuat tanda pengenal unik kas masjid Anda. Siapapun yang memindai akan disajikan pembukuan kas yang sama persis seperti yang diinput DKM.
                    </p>
                  </div>

                  {/* Copy Link Input */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Tautan Langsung Jamaah:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={currentUrl}
                        className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-amber-300" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {qrDataUrl && (
                      <a
                        href={qrDataUrl}
                        download={`QR_Kas_${mosqueProfile.namaMasjid.replace(/\s+/g, '_')}.png`}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <Download className="w-4 h-4 text-emerald-700" />
                        <span>Unduh Barcode (PNG)</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenJamaahView) {
                          onOpenJamaahView(selectedDestination === 'portal' ? 'dashboard' : selectedDestination);
                        } else {
                          window.open(currentUrl, '_blank');
                        }
                      }}
                      className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Uji Tampilan Jamaah</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AKUN & CLOUD SYNC */}
          {activeTab === 'account' && (
            <AuthAccountTab currentUser={currentUser} />
          )}

          {/* TAB 3: KELOLA MASTER DATA (KATEGORI, POS KAS & METODE PEMBAYARAN) */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              {/* Sub-Tabs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCatType('pemasukan');
                    setEditingItemName(null);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                    activeCatType === 'pemasukan'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
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
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                    activeCatType === 'pengeluaran'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Pengeluaran ({categoriesPengeluaran.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCatType('posDana');
                    setEditingItemName(null);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                    activeCatType === 'posDana'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Pos Dana Kas ({posDanaList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCatType('metodePembayaran');
                    setEditingItemName(null);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                    activeCatType === 'metodePembayaran'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Metode Bayar ({metodePembayaranList.length})</span>
                </button>
              </div>

              {/* Form Add Item */}
              <form onSubmit={handleAddItemSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={getPlaceholder()}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeCatType === 'pemasukan'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : activeCatType === 'pengeluaran'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : activeCatType === 'posDana'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah {getSubTabLabel()}</span>
                </button>
              </form>

              {/* Item List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {currentList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    Belum ada data untuk {getSubTabLabel()}.
                  </p>
                ) : (
                  currentList.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {editingItemName === item ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editInputValue}
                            onChange={(e) => setEditInputValue(e.target.value)}
                            className="flex-1 py-1 px-2 text-xs border border-emerald-500 rounded bg-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveItemEdit(item)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                            title="Simpan perubahan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItemName(null)}
                            className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-800">{item}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemName(item);
                                setEditInputValue(item);
                              }}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-200 rounded transition cursor-pointer"
                              title={`Edit nama ${getSubTabLabel()}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title={`Hapus ${getSubTabLabel()}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {(activeCatType === 'pemasukan' || activeCatType === 'pengeluaran') && (
                <div className="pt-3 border-t border-slate-200 flex justify-start">
                  <button
                    type="button"
                    onClick={onResetCategories}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Kategori Pemasukan/Pengeluaran ke Bawaan</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BACKUP, RESTORE & RESET */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>1. Ekspor Backup File JSON</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unduh seluruh riwayat transaksi kas, profil DKM, dan daftar kategori ke dalam satu file cadangan `.json` di penyimpanan perangkat Anda.
                </p>
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup Data (JSON)</span>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>2. Impor / Restore File Backup JSON</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pulihkan data kas masjid dari file `.json` cadangan yang telah diekspor sebelumnya.
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Backup JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>3. Reset ke Data Sampel Awal</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Kembalikan seluruh transaksi kas ke data percontohan bawaan DKM.
                  <span className="font-bold"> Perhatian: Data yang telah Anda masukkan sendiri akan dihapus.</span>
                </p>
                <button
                  type="button"
                  onClick={onResetData}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Seluruh Data Kas</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: INSTALL PWA ANDROID & DESKTOP */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-xl space-y-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                    <Download className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Aplikasi Web Progresif (PWA)</h4>
                    <p className="text-xs text-emerald-200">Dukungan Lintas Perangkat: Android, Windows, Mac, iOS</p>
                  </div>
                </div>

                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Install aplikasi Kas DKM ke layar utama smartphone atau PC Anda. Tanpa PlayStore/AppStore, langsung berjalan cepat dan dapat diakses offline saat sinyal tidak stabil.
                </p>

                {onOpenPwaModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPwaModal();
                    }}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>BUKA PANDUAN & TOMBOL INSTALL PWA</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    📱 HP Android (Chrome):
                  </h5>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Buka Chrome di HP -&gt; Ketuk menu titik 3 di pojok kanan atas -&gt; Pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    💻 Komputer / PC (Chrome & Edge):
                  </h5>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Buka website di Chrome/Edge PC -&gt; Klik ikon <strong>Install</strong> di address bar kanan atas -&gt; Pilih <strong>Instal</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Masjid: <strong className="text-slate-800">{mosqueProfile.namaMasjid}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
