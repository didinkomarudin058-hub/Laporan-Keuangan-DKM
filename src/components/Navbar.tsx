import React from 'react';
import {
  Building2,
  Tv,
  FileText,
  BarChart3,
  ListFilter,
  Settings,
  Users,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { MosqueProfile, AppTab } from '../types';

interface NavbarProps {
  mosqueProfile: MosqueProfile;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenSettingsModal?: (tab?: 'profile' | 'account' | 'categories' | 'backup' | 'pwa') => void;
  onOpenPwaModal?: () => void;
  currentUser?: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  mosqueProfile,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header id="dkm-app-navbar" className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-30 print:hidden">
      {/* Main Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand & Mosque Name + Address */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-inner border border-white/25 shrink-0 overflow-hidden">
            {mosqueProfile.logoUrl ? (
              <img
                src={mosqueProfile.logoUrl}
                alt="Logo Masjid"
                className="w-full h-full object-contain p-0.5 bg-white rounded-xl"
              />
            ) : (
              <Building2 className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-tight">
              {mosqueProfile.namaMasjid}
            </h1>
            <p className="text-[11px] sm:text-xs text-emerald-200/90 font-normal">
              {[mosqueProfile.alamat, mosqueProfile.desa ? `Desa ${mosqueProfile.desa}` : '', mosqueProfile.kota].filter(Boolean).join(' ')}
            </p>
          </div>
        </div>

        {/* Quick Jamaah Link Badge on Header */}
        <div className="flex items-center gap-2">
          <button
            id="nav-quick-jamaah-btn"
            onClick={() => setActiveTab('jamaah')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'jamaah'
                ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-sm'
                : 'bg-emerald-800/80 text-amber-300 hover:bg-emerald-700/80 border-amber-400/40'
            }`}
            title="Buka Portal Transparansi Laporan Kas untuk Jamaah"
          >
            <Users className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden sm:inline">Portal Jamaah</span>
            <span className="sm:hidden">Jamaah</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar (Desktop & Tablet) */}
      <div className="bg-emerald-950/70 border-t border-emerald-800/70 px-4 sm:px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-1 sm:gap-1.5 py-1.5 items-center">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-950 text-amber-300 font-bold border-b-2 border-amber-400 shadow-xs'
                : 'text-emerald-100/90 font-medium hover:text-amber-200 hover:bg-emerald-800/50'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-amber-300' : 'text-emerald-200'}`} />
            <span>Ikhtisar Kas Utama</span>
          </button>

          <button
            id="nav-tab-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-emerald-950 text-amber-300 font-bold border-b-2 border-amber-400 shadow-xs'
                : 'text-emerald-100/90 font-medium hover:text-amber-200 hover:bg-emerald-800/50'
            }`}
          >
            <ListFilter className={`w-4 h-4 ${activeTab === 'transactions' ? 'text-amber-300' : 'text-emerald-200'}`} />
            <span>Jurnal Transaksi</span>
          </button>

          <button
            id="nav-tab-business"
            onClick={() => setActiveTab('business')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'business'
                ? 'bg-emerald-950 text-amber-300 font-bold border-b-2 border-amber-400 shadow-xs'
                : 'text-emerald-100/90 font-medium hover:text-amber-200 hover:bg-emerald-800/50'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'business' ? 'text-amber-300' : 'text-emerald-200'}`} />
            <span>Sewa</span>
          </button>

          <button
            id="nav-tab-monthly-report"
            onClick={() => setActiveTab('monthlyReport')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'monthlyReport'
                ? 'bg-emerald-950 text-amber-300 font-bold border-b-2 border-amber-400 shadow-xs'
                : 'text-emerald-100/90 font-medium hover:text-amber-200 hover:bg-emerald-800/50'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'monthlyReport' ? 'text-amber-300' : 'text-emerald-200'}`} />
            <span>Laporan Bulanan & AI Narasi</span>
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-emerald-950 text-amber-300 font-bold border-b-2 border-amber-400 shadow-xs'
                : 'text-emerald-100/90 font-medium hover:text-amber-200 hover:bg-emerald-800/50'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-amber-300' : 'text-emerald-200'}`} />
            <span>Grafik & Analisis Kas</span>
          </button>

          <button
            id="nav-tab-jamaah"
            onClick={() => setActiveTab('jamaah')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'jamaah'
                ? 'bg-emerald-950 text-amber-300 font-bold border-b-2 border-amber-400 shadow-xs'
                : 'text-amber-300 font-medium hover:text-amber-200 hover:bg-emerald-800/50'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'jamaah' ? 'text-amber-300' : 'text-amber-300'}`} />
            <span>Laporan Jamaah</span>
          </button>

          <button
            id="nav-tab-tv-mode"
            onClick={() => setActiveTab('tvMode')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'tvMode'
                ? 'bg-emerald-950 text-amber-300 font-bold border-b-2 border-amber-400 shadow-xs'
                : 'bg-emerald-800/60 text-amber-300 font-medium hover:bg-emerald-800 border border-emerald-700/60'
            }`}
          >
            <Tv className="w-4 h-4 text-amber-300" />
            <span>Tampilan TV Kas</span>
          </button>

          <button
            id="nav-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`ml-auto px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-950 text-amber-300 font-bold border-b-2 border-amber-400 shadow-xs'
                : 'text-emerald-100/90 font-medium hover:text-amber-200 hover:bg-emerald-800/50'
            }`}
            title="Menu Pengaturan DKM"
            aria-label="Pengaturan"
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-amber-300' : 'text-amber-300/90'}`} />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
