import React from 'react';
import {
  Building2,
  Tv,
  FileText,
  BarChart3,
  ListFilter,
  Settings,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { MosqueProfile } from '../types';

interface NavbarProps {
  mosqueProfile: MosqueProfile;
  activeTab: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode') => void;
  onOpenSettingsModal: (tab?: 'profile' | 'account' | 'categories' | 'backup' | 'pwa') => void;
  onOpenPwaModal?: () => void;
  currentUser?: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  mosqueProfile,
  activeTab,
  setActiveTab,
  onOpenSettingsModal,
}) => {
  return (
    <header id="dkm-app-navbar" className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-30 print:hidden">
      {/* Main Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand & Mosque Name + Address */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-inner border border-emerald-400/30 shrink-0 overflow-hidden">
            {mosqueProfile.logoUrl ? (
              <img
                src={mosqueProfile.logoUrl}
                alt="Logo Masjid"
                className="w-full h-full object-contain p-0.5 bg-white rounded-xl"
              />
            ) : (
              <Building2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              {mosqueProfile.namaMasjid}
            </h1>
            <p className="text-xs text-emerald-200/90 font-normal">
              {mosqueProfile.alamat}, {mosqueProfile.kota}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar (Desktop & Tablet) */}
      <div className="bg-emerald-950/60 border-t border-emerald-800/70 px-4 sm:px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-1 sm:gap-2 py-1.5 items-center">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-emerald-200/90 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Ikhtisar Kas Utama</span>
          </button>

          <button
            id="nav-tab-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-emerald-200/90 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Jurnal Transaksi</span>
          </button>

          <button
            id="nav-tab-monthly-report"
            onClick={() => setActiveTab('monthlyReport')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'monthlyReport'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-emerald-200/90 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Laporan Bulanan & AI Narasi</span>
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-emerald-200/90 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Grafik & Analisis Kas</span>
          </button>

          <button
            id="nav-tab-tv-mode"
            onClick={() => setActiveTab('tvMode')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tvMode'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                : 'bg-emerald-800/60 text-amber-300 hover:bg-emerald-800 border border-emerald-700/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Tampilan TV Jamaah</span>
          </button>

          <button
            onClick={() => onOpenSettingsModal('profile')}
            className="ml-auto px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-800/60 text-emerald-100 hover:text-white hover:bg-emerald-800 border border-emerald-700/60 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Menu Pengaturan DKM"
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
