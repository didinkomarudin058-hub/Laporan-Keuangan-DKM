import React from 'react';
import {
  Building2,
  ListFilter,
  FileText,
  Settings,
} from 'lucide-react';
import { AppTab } from '../types';

interface MobileBottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenAddModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 px-1 py-1.5 shadow-2xl flex justify-around items-center print:hidden select-none">
      {/* 1. Ikhtisar */}
      <button
        id="mobile-nav-dashboard"
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[9.5px] cursor-pointer ${
          activeTab === 'dashboard'
            ? 'text-amber-400 bg-slate-800/90 font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <Building2 className={`w-4.5 h-4.5 mb-0.5 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'}`} />
        <span>Ikhtisar</span>
      </button>

      {/* 2. Jurnal Transaksi */}
      <button
        id="mobile-nav-transactions"
        onClick={() => setActiveTab('transactions')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[9.5px] cursor-pointer ${
          activeTab === 'transactions'
            ? 'text-amber-400 bg-slate-800/90 font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <ListFilter className={`w-4.5 h-4.5 mb-0.5 ${activeTab === 'transactions' ? 'text-amber-400' : 'text-slate-400'}`} />
        <span>Jurnal</span>
      </button>

      {/* 3. Laporan Bulanan */}
      <button
        id="mobile-nav-monthly-report"
        onClick={() => setActiveTab('monthlyReport')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[9.5px] cursor-pointer ${
          activeTab === 'monthlyReport'
            ? 'text-amber-400 bg-slate-800/90 font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <FileText className={`w-4.5 h-4.5 mb-0.5 ${activeTab === 'monthlyReport' ? 'text-amber-400' : 'text-slate-400'}`} />
        <span>Laporan</span>
      </button>

      {/* 4. Usaha DKM / Sewa Tanah */}
      <button
        id="mobile-nav-business"
        onClick={() => setActiveTab('business')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[9.5px] cursor-pointer ${
          activeTab === 'business'
            ? 'text-amber-400 bg-slate-800/90 font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <Building2 className={`w-4.5 h-4.5 mb-0.5 ${activeTab === 'business' ? 'text-amber-400' : 'text-slate-400'}`} />
        <span>Sewa</span>
      </button>

      {/* 5. Menu Pengaturan */}
      <button
        id="mobile-nav-settings"
        onClick={() => setActiveTab('settings')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[9.5px] cursor-pointer ${
          activeTab === 'settings'
            ? 'text-amber-400 bg-slate-800/90 font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
        title="Menu Pengaturan DKM & Opsi"
      >
        <Settings className={`w-4.5 h-4.5 mb-0.5 ${activeTab === 'settings' ? 'text-amber-400' : 'text-slate-400'}`} />
        <span>Pengaturan</span>
      </button>
    </div>
  );
};

