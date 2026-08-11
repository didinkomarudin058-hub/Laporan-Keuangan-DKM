import React from 'react';
import {
  Building2,
  ListFilter,
  FileText,
  QrCode,
  Plus,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode') => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenQrModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenQrModal,
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
        <span>Transaksi</span>
      </button>

      {/* 3. Center + Button */}
      <button
        onClick={onOpenAddModal}
        className="flex items-center justify-center -mt-6 bg-amber-500 hover:bg-amber-400 text-emerald-950 w-12 h-12 rounded-full shadow-xl border-4 border-slate-900 active:scale-95 transition-transform shrink-0"
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

      {/* 5. Scan QR Barcode */}
      {onOpenQrModal ? (
        <button
          onClick={onOpenQrModal}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-[11px] font-bold text-amber-400 hover:text-amber-300"
          title="Scan Barcode / QR Laporan Keuangan"
        >
          <QrCode className="w-5 h-5 mb-0.5 text-amber-400" />
          <span>Scan QR</span>
        </button>
      ) : null}
    </div>
  );
};
