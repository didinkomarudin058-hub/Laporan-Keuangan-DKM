import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { User } from 'firebase/auth';
import { MosqueProfile, TransactionType } from '../types';
import { AuthAccountTab } from './AuthAccountTab';

interface MosqueSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueProfile: MosqueProfile;
  onSaveProfile: (updatedProfile: MosqueProfile) => void;

  // Auth
  currentUser: User | null;

  // Categories
  categoriesPemasukan: string[];
  categoriesPengeluaran: string[];
  onAddCategory: (type: TransactionType, name: string) => void;
  onEditCategory: (type: TransactionType, oldName: string, newName: string) => void;
  onDeleteCategory: (type: TransactionType, name: string) => void;
  onResetCategories: () => void;

  // Backup & Restore
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;

  // Optional tab selector
  defaultTab?: 'profile' | 'account' | 'categories' | 'backup';
}

export const MosqueSettingsModal: React.FC<MosqueSettingsModalProps> = ({
  isOpen,
  onClose,
  mosqueProfile,
  onSaveProfile,
  currentUser,
  categoriesPemasukan,
  categoriesPengeluaran,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onResetCategories,
  onExportBackup,
  onImportBackup,
  onResetData,
  defaultTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'categories' | 'backup'>(defaultTab);

  // Profile Form State
  const [profile, setProfile] = useState<MosqueProfile>({ ...mosqueProfile });

  // Category State
  const [activeCatType, setActiveCatType] = useState<TransactionType>('pemasukan');
  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState('');

  useEffect(() => {
    setProfile({ ...mosqueProfile });
  }, [mosqueProfile, isOpen]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  const currentCategories =
    activeCatType === 'pemasukan' ? categoriesPemasukan : categoriesPengeluaran;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    alert('Profil DKM berhasil diperbarui!');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (currentCategories.includes(newCatName.trim())) {
      alert('Nama kategori ini sudah ada!');
      return;
    }
    onAddCategory(activeCatType, newCatName.trim());
    setNewCatName('');
  };

  const handleSaveCategoryEdit = (oldName: string) => {
    if (!editInputValue.trim()) return;
    if (
      editInputValue.trim() !== oldName &&
      currentCategories.includes(editInputValue.trim())
    ) {
      alert('Nama kategori ini sudah ada!');
      return;
    }
    onEditCategory(activeCatType, oldName, editInputValue.trim());
    setEditingCatName(null);
  };

  const handleDeleteCat = (cat: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat}"?`)) {
      onDeleteCategory(activeCatType, cat);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">
              Menu Pengaturan DKM & Sistem Kas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <div className="bg-slate-100 px-4 pt-3 border-b border-slate-200 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? 'bg-white text-emerald-900 border-t-2 border-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Profil DKM</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'account'
                ? 'bg-white text-emerald-900 border-t-2 border-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Akun & Cloud Sync</span>
            {currentUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'categories'
                ? 'bg-white text-emerald-900 border-t-2 border-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-700" />
            <span>Kelola Kategori</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'backup'
                ? 'bg-white text-emerald-900 border-t-2 border-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-700" />
            <span>Backup & Reset</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PROFIL DKM */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Identitas & Alamat Masjid
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Masjid</label>
                  <input
                    type="text"
                    required
                    value={profile.namaMasjid}
                    onChange={(e) => setProfile({ ...profile, namaMasjid: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      required
                      value={profile.alamat}
                      onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      required
                      value={profile.kota}
                      onChange={(e) => setProfile({ ...profile, kota: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WA / Telepon DKM</label>
                    <input
                      type="text"
                      value={profile.telepon}
                      onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi DKM</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Motto / Slogan DKM</label>
                  <input
                    type="text"
                    value={profile.motto}
                    onChange={(e) => setProfile({ ...profile, motto: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Rekening Bank */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Rekening Infaq Bank Resmi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank</label>
                    <input
                      type="text"
                      required
                      value={profile.namaBank}
                      onChange={(e) => setProfile({ ...profile, namaBank: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      required
                      value={profile.nomorRekening}
                      onChange={(e) => setProfile({ ...profile, nomorRekening: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Atas Nama Rekening</label>
                    <input
                      type="text"
                      required
                      value={profile.anRekening}
                      onChange={(e) => setProfile({ ...profile, anRekening: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Pengurus DKM */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Pengurus DKM (Tanda Tangan Laporan)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ketua DKM</label>
                    <input
                      type="text"
                      required
                      value={profile.ketuaDKM}
                      onChange={(e) => setProfile({ ...profile, ketuaDKM: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bendahara DKM</label>
                    <input
                      type="text"
                      required
                      value={profile.bendaharaDKM}
                      onChange={(e) => setProfile({ ...profile, bendaharaDKM: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sekretaris DKM</label>
                    <input
                      type="text"
                      required
                      value={profile.sekretarisDKM}
                      onChange={(e) => setProfile({ ...profile, sekretarisDKM: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil DKM</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: AKUN & CLOUD SYNC */}
          {activeTab === 'account' && (
            <AuthAccountTab currentUser={currentUser} />
          )}

          {/* TAB 3: KELOLA KATEGORI */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveCatType('pemasukan')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeCatType === 'pemasukan'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kategori Pemasukan ({categoriesPemasukan.length})
                </button>
                <button
                  onClick={() => setActiveCatType('pengeluaran')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeCatType === 'pengeluaran'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kategori Pengeluaran ({categoriesPengeluaran.length})
                </button>
              </div>

              {/* Form Add Category */}
              <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Tambah nama kategori ${activeCatType} baru...`}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeCatType === 'pemasukan'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kategori</span>
                </button>
              </form>

              {/* Category List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {currentCategories.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    Belum ada kategori disetting.
                  </p>
                ) : (
                  currentCategories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {editingCatName === cat ? (
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
                            onClick={() => handleSaveCategoryEdit(cat)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatName(null)}
                            className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-800">{cat}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatName(cat);
                                setEditInputValue(cat);
                              }}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-200 rounded transition cursor-pointer"
                              title="Edit nama kategori"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCat(cat)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title="Hapus kategori"
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

              <div className="pt-3 border-t border-slate-200 flex justify-start">
                <button
                  type="button"
                  onClick={onResetCategories}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Kategori ke Bawaan Default</span>
                </button>
              </div>
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
