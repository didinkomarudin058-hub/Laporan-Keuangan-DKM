import React from 'react';
import {
  Building2,
  ListFilter,
  FileText,
  Settings,
  Plus,
  QrCode,
  BarChart3,
  Tv,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode') => void;
  onOpenAddModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSettingsModal,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 px-2 py-2 shadow-2xl flex justify-around items-center print:hidden">
      {/* 1. Ikhtisar */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-[11px] font-semibold ${
          activeTab === 'dashboard'
            ? 'text-amber-400 bg-slate-800/80'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Building2 className="w-5 h-5 mb-0.5" />
        <span>Ikhtisar</span>
      </button>

      {/* 2. Transaksi */}
      <button
        onClick={() => setActiveTab('transactions')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-[11px] font-semibold ${
          activeTab === 'transactions'
            ? 'text-amber-400 bg-slate-800/80'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <ListFilter className="w-5 h-5 mb-0.5" />
        <span>Jurnal</span>
      </button>

      {/* 3. Center Button: + Tambah Transaksi */}
      <button
        onClick={onOpenAddModal}
        className="flex items-center justify-center -mt-6 bg-amber-500 hover:bg-amber-400 text-emerald-950 w-12 h-12 rounded-full shadow-xl border-4 border-slate-900 active:scale-95 transition-transform shrink-0 cursor-pointer"
        title="Tambah Transaksi Baru (+)"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* 4. Laporan */}
      <button
        onClick={() => setActiveTab('monthlyReport')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-[11px] font-semibold ${
          activeTab === 'monthlyReport'
            ? 'text-amber-400 bg-slate-800/80'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span>Laporan</span>
      </button>

      {/* 5. Menu Pengaturan */}
      <button
        onClick={onOpenSettingsModal}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
        title="Menu Pengaturan DKM"
      >
        <Settings className="w-5 h-5 mb-0.5 text-emerald-400" />
        <span>Menu</span>
      </button>
    </div>
  );
};
