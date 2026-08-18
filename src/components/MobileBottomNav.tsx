import React from 'react';
import {
  Building2,
  ListFilter,
  FileText,
  Settings,
  Store,
  BarChart3,
  Tv,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'transactions' | 'business' | 'monthlyReport' | 'analytics' | 'tvMode';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'business' | 'monthlyReport' | 'analytics' | 'tvMode') => void;
  onOpenAddModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettingsModal,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 px-1 py-1.5 shadow-2xl flex justify-around items-center print:hidden">
      {/* 1. Ikhtisar */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[10px] font-semibold ${
          activeTab === 'dashboard'
            ? 'text-amber-400 bg-slate-800/90'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Building2 className="w-5 h-5 mb-0.5" />
        <span>Ikhtisar</span>
      </button>

      {/* 2. Jurnal Transaksi */}
      <button
        onClick={() => setActiveTab('transactions')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[10px] font-semibold ${
          activeTab === 'transactions'
            ? 'text-amber-400 bg-slate-800/90'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <ListFilter className="w-5 h-5 mb-0.5" />
        <span>Jurnal</span>
      </button>

      {/* 3. Laporan Bulanan */}
      <button
        onClick={() => setActiveTab('monthlyReport')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[10px] font-semibold ${
          activeTab === 'monthlyReport'
            ? 'text-emerald-400 bg-slate-800/90 font-bold'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <FileText className="w-5 h-5 mb-0.5 text-emerald-400" />
        <span>Laporan</span>
      </button>

      {/* 4. Usaha DKM / Sewa Tanah */}
      <button
        onClick={() => setActiveTab('business')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[10px] font-semibold ${
          activeTab === 'business'
            ? 'text-white bg-slate-800/90'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Building2 className="w-5 h-5 mb-0.5 text-white" />
        <span>Sewa</span>
      </button>

      {/* 5. Menu Pengaturan / Fitur Lainnya */}
      <button
        onClick={onOpenSettingsModal}
        className="flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition text-[10px] font-semibold text-slate-400 hover:text-white cursor-pointer"
        title="Menu Pengaturan DKM & Opsi"
      >
        <Settings className="w-5 h-5 mb-0.5 text-slate-300" />
        <span>Menu</span>
      </button>
    </div>
  );
};

