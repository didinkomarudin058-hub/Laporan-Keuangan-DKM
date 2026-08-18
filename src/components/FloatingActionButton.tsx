import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, UserCheck, X, Receipt, Sparkles, Building2 } from 'lucide-react';
import { TransactionType } from '../types';

interface FloatingActionButtonProps {
  onOpenAddTransaction: (defaultType?: TransactionType) => void;
  onNavigateToBusiness: (openNewRecord?: boolean) => void;
  activeTab: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onOpenAddTransaction,
  onNavigateToBusiness,
  activeTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  // Only render on dashboard / ikhtisar tab
  if (activeTab !== 'dashboard') {
    return null;
  }

  return (
    <div
      ref={menuRef}
      id="floating-action-container"
      className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-40 flex flex-col items-end print:hidden select-none"
    >
      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* 1. Tambah Pemasukan Kas */}
          <button
            id="fab-action-pemasukan"
            onClick={() => handleAction(() => onOpenAddTransaction('pemasukan'))}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-x-1 active:scale-95 text-xs font-semibold group cursor-pointer border border-emerald-400/30"
          >
            <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-100 group-hover:bg-emerald-900">
              Infaq / Sedekah
            </span>
            <span className="whitespace-nowrap font-bold">+ Pemasukan Kas</span>
            <span className="w-7 h-7 bg-white text-emerald-700 rounded-full flex items-center justify-center shadow-inner">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </span>
          </button>

          {/* 2. Tambah Pengeluaran Kas */}
          <button
            id="fab-action-pengeluaran"
            onClick={() => handleAction(() => onOpenAddTransaction('pengeluaran'))}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-x-1 active:scale-95 text-xs font-semibold group cursor-pointer border border-rose-400/30"
          >
            <span className="bg-rose-800/80 px-2 py-0.5 rounded text-[11px] font-medium text-rose-100 group-hover:bg-rose-900">
              Operasional / Renovasi
            </span>
            <span className="whitespace-nowrap font-bold">- Pengeluaran Kas</span>
            <span className="w-7 h-7 bg-white text-rose-700 rounded-full flex items-center justify-center shadow-inner">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </span>
          </button>

          {/* 3. Penyewa Tanah / Aset Wakaf */}
          <button
            id="fab-action-business"
            onClick={() => handleAction(() => onNavigateToBusiness(true))}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-x-1 active:scale-95 text-xs font-semibold group cursor-pointer border border-amber-300/40"
          >
            <span className="bg-amber-700/30 px-2 py-0.5 rounded text-[11px] font-bold text-amber-950">
              Lahan Wakaf
            </span>
            <span className="whitespace-nowrap font-bold">Penyewa Tanah & Sewa</span>
            <span className="w-7 h-7 bg-slate-900 text-amber-400 rounded-full flex items-center justify-center shadow-inner">
              <UserCheck className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="main-floating-action-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 transform active:scale-90 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/50 ${
          isOpen
            ? 'bg-slate-800 text-white rotate-45 hover:bg-slate-900 border-2 border-slate-700'
            : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 hover:from-emerald-600 hover:to-teal-400 text-white hover:scale-105 shadow-emerald-700/40 hover:shadow-emerald-700/60 ring-2 ring-white/60'
        }`}
        title={isOpen ? 'Tutup menu' : 'Tambah transaksi kas / sewa tanah (+)'}
        aria-label="Tombol Tambah Transaksi Kas Melayang"
      >
        <Plus className="w-7 h-7 stroke-[2.8]" />
      </button>
    </div>
  );
};

