import React, { useState, useMemo, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  ShieldCheck,
  Building2,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Printer,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Tag,
  Percent,
  MapPin,
  Phone,
  FileText,
  AlertTriangle,
  Receipt,
  Sparkles,
  Layers,
  X,
  CreditCard,
} from 'lucide-react';
import {
  LandTenant,
  MosqueProfile,
  FundCategory,
  PaymentMethod,
} from '../types';
import { TenantModal } from './TenantModal';
import { TenantPaymentModal } from './TenantPaymentModal';
import { TenantReceiptModal } from './TenantReceiptModal';

interface MosqueBusinessTabProps {
  businessUnits?: any[];
  businessRecords?: any[];
  landTenants?: LandTenant[];
  categoriesSewa?: string[];
  mosqueProfile: MosqueProfile;
  posDanaList: string[];
  metodePembayaranList: string[];
  onAddUnit?: any;
  onEditUnit?: any;
  onDeleteUnit?: any;
  onAddRecord?: any;
  onEditRecord?: any;
  onDeleteRecord?: any;
  onPushRecordToTransaction?: any;
  onAddTenant?: (tenant: Omit<LandTenant, 'id'>) => void;
  onEditTenant?: (id: string, tenant: Omit<LandTenant, 'id'>) => void;
  onDeleteTenant?: (id: string) => void;
  onPayTenantRent?: (
    tenantId: string,
    payment: {
      nominal: number;
      tanggal: string;
      periode: string;
      metodePembayaran: string;
      posDanaTujuan: string;
      keterangan?: string;
      petugas?: string;
      autoPushToKas: boolean;
    }
  ) => void;
  onNavigateToTransactions?: (trxId?: string) => void;
}

export const MosqueBusinessTab: React.FC<MosqueBusinessTabProps> = ({
  landTenants = [],
  categoriesSewa = [
    'Kios Kuliner & Warung',
    'Stand UMKM & Toko',
    'Bengkel & Jasa Otomotif',
    'Kavling Tanah Wakaf',
    'Lahan Pertanian / Kebun',
    'Aula & Tempat Usaha',
    'Lainnya',
  ],
  mosqueProfile,
  posDanaList,
  metodePembayaranList,
  onAddTenant,
  onEditTenant,
  onDeleteTenant,
  onPayTenantRent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [discountFilter, setDiscountFilter] = useState<'semua' | 'dengan_diskon' | 'tanpa_diskon'>('semua');

  // Modals
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<LandTenant | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<LandTenant | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTenantForReceipt, setSelectedTenantForReceipt] = useState<LandTenant | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [rekapPeriodMode, setRekapPeriodMode] = useState<'bulanan' | 'tahunan' | 'semua'>('bulanan');
  const [rekapSelectedMonth, setRekapSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [rekapSelectedYear, setRekapSelectedYear] = useState<number>(new Date().getFullYear());

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Filtered tenants for rekap report based on selected period
  const rekapFilteredTenants = useMemo(() => {
    if (rekapPeriodMode === 'semua') {
      return landTenants;
    }
    if (rekapPeriodMode === 'tahunan') {
      const yearStr = String(rekapSelectedYear);
      return landTenants.filter((t) => {
        if (!t.terakhirBayar) return true;
        return t.terakhirBayar.startsWith(yearStr);
      });
    }
    // Bulanan
    const monthPrefix = `${rekapSelectedYear}-${String(rekapSelectedMonth).padStart(2, '0')}`;
    return landTenants.filter((t) => {
      if (!t.terakhirBayar) return true;
      return t.terakhirBayar.startsWith(monthPrefix);
    });
  }, [landTenants, rekapPeriodMode, rekapSelectedMonth, rekapSelectedYear]);

  const rekapStats = useMemo(() => {
    let totalNormal = 0;
    let totalBersih = 0;
    let totalTerbayar = 0;
    rekapFilteredTenants.forEach((t) => {
      const diskon = t.diskonPersen || 0;
      const normal = t.tarifSewa || 0;
      const potongan = (normal * diskon) / 100;
      const bersih =
        t.tarifSetelahDiskon !== undefined
          ? t.tarifSetelahDiskon
          : Math.max(0, normal - potongan);
      totalNormal += normal;
      totalBersih += bersih;
      totalTerbayar += t.totalTerbayar || 0;
    });
    return { totalNormal, totalBersih, totalTerbayar };
  }, [rekapFilteredTenants]);

  // Clean up any lingering print classes on modal toggle
  useEffect(() => {
    return () => {
      document.body.classList.remove('print-rekap-sewa-active');
    };
  }, [isReportModalOpen]);

  const handlePrintRekapSewa = () => {
    document.body.classList.add('print-rekap-sewa-active');

    const handleAfterPrint = () => {
      document.body.classList.remove('print-rekap-sewa-active');
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-rekap-sewa-active');
      }, 2000);
    }, 100);
  };

  // Titimangsa desa / kota
  const titimangsaKota = (() => {
    if (mosqueProfile.desa) {
      const d = mosqueProfile.desa.replace(/^desa\s+/gi, '').replace(/^kelurahan\s+/gi, '').trim();
      return d;
    }
    if (mosqueProfile.kota) {
      return mosqueProfile.kota.split(',')[0].trim();
    }
    return 'Bekasi';
  })();

  // Statistics Calculations
  const stats = useMemo(() => {
    const totalPenyewa = landTenants.length;
    const totalKasDiterima = landTenants.reduce((acc, t) => acc + (t.totalTerbayar || 0), 0);

    // Calculate monthly and annual potential
    let estimasiKasBulanan = 0;
    let totalPotonganDiskonNominal = 0;

    landTenants.forEach((t) => {
      const diskon = t.diskonPersen || 0;
      const normal = t.tarifSewa || 0;
      const potongan = (normal * diskon) / 100;
      const bersih = t.tarifSetelahDiskon !== undefined ? t.tarifSetelahDiskon : normal - potongan;

      totalPotonganDiskonNominal += potongan;

      if (t.tipePeriode === 'bulanan') {
        estimasiKasBulanan += bersih;
      } else if (t.tipePeriode === 'tahunan') {
        estimasiKasBulanan += bersih / 12;
      } else {
        estimasiKasBulanan += bersih / 6;
      }
    });

    const penyewaDenganDiskon = landTenants.filter((t) => (t.diskonPersen || 0) > 0).length;

    return {
      totalPenyewa,
      totalKasDiterima,
      estimasiKasBulanan,
      penyewaDenganDiskon,
      totalPotonganDiskonNominal,
    };
  }, [landTenants]);

  // Filtered Tenants List
  const filteredTenants = useMemo(() => {
    return landTenants.filter((t) => {
      // Search
      const matchSearch =
        searchQuery === '' ||
        t.namaPenyewa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.namaLahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.peruntukanUsaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.kategori && t.kategori.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.nomorTelepon.includes(searchQuery);

      // Category
      const matchCategory = categoryFilter === 'semua' || t.kategori === categoryFilter;

      // Discount Filter
      const hasDiscount = (t.diskonPersen || 0) > 0;
      const matchDiscount =
        discountFilter === 'semua' ||
        (discountFilter === 'dengan_diskon' && hasDiscount) ||
        (discountFilter === 'tanpa_diskon' && !hasDiscount);

      return matchSearch && matchCategory && matchDiscount;
    });
  }, [landTenants, searchQuery, categoryFilter, discountFilter]);

  // Handlers
  const handleOpenAddTenant = () => {
    setEditingTenant(null);
    setIsTenantModalOpen(true);
  };

  const handleOpenEditTenant = (tenant: LandTenant) => {
    setEditingTenant(tenant);
    setIsTenantModalOpen(true);
  };

  const handleOpenPayment = (tenant: LandTenant) => {
    setSelectedTenantForPayment(tenant);
    setIsPaymentModalOpen(true);
  };

  const handleOpenReceipt = (tenant: LandTenant) => {
    setSelectedTenantForReceipt(tenant);
    setIsReceiptModalOpen(true);
  };

  const handleDeleteTenant = (tenant: LandTenant) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus data sewa "${tenant.namaPenyewa}" (${tenant.namaLahan})? Data pembayaran masa lalu yang sudah masuk ke kas tetap tersimpan.`
      )
    ) {
      if (onDeleteTenant) {
        onDeleteTenant(tenant.id);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-white" />
              <span>Manajemen Aset & Lahan Wakaf Masjid</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Sewa Tanah Masjid</span>
            </h1>
            <p className="text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Kelola data sewa tanah wakaf/kavling usaha masjid, kategori sewa, tarif sewa, skema potongan biaya operasional, dan pencatatan kas otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer backdrop-blur-xs"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Cetak Rekap Sewa</span>
            </button>
            <button
              onClick={handleOpenAddTenant}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tambah Sewa Tanah</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sewa */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sewa Tanah</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.totalPenyewa}
            </span>
            <span className="text-xs font-semibold text-slate-500">Objek Sewa</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-600">
            <span className="text-emerald-700 font-bold">{categoriesSewa.length} Kategori Tersedia</span>
          </div>
        </div>

        {/* Card 2: Total Realisasi Masuk Kas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kas Diterima</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Coins className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
            Rp {stats.totalKasDiterima.toLocaleString('id-ID')}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Akumulasi sewa masuk ke Jurnal Kas</span>
          </p>
        </div>

        {/* Card 3: Potongan Biaya Operasional */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Potongan Operasional</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Percent className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-mono">
              {stats.penyewaDenganDiskon}
            </span>
            <span className="text-xs font-semibold text-slate-500">Sewa Ada Potongan</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
            <Tag className="w-3 h-3 text-amber-600" />
            <span>Biaya operasional: Rp {stats.totalPotonganDiskonNominal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Card 4: Estimasi Potensi Kas Bulanan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Potensi Kas / Bulan</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono">
            Rp {Math.round(stats.estimasiKasBulanan).toLocaleString('id-ID')}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">
            Tarif bersih sewa setelah potongan operasional
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pihak sewa, kavling lahan, peruntukan usaha, kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="semua">Semua Kategori Sewa</option>
            {categoriesSewa.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Discount Filter */}
          <select
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/70 border-amber-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="semua">Semua Skema Tarif</option>
            <option value="dengan_diskon">🏷️ Ada Potongan Operasional (%)</option>
            <option value="tanpa_diskon">Tarif Standar (Tanpa Potongan)</option>
          </select>
        </div>
      </div>

      {/* Tenant Cards Grid */}
      {filteredTenants.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Building2 className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery || categoryFilter !== 'semua' || discountFilter !== 'semua'
              ? 'Tidak ada data sewa yang cocok dengan filter'
              : 'Belum Ada Data Sewa Tanah'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery || categoryFilter !== 'semua' || discountFilter !== 'semua'
              ? 'Silakan coba ubah kata kunci pencarian atau reset filter di atas.'
              : 'Tambahkan data sewa tanah wakaf atau stand usaha masjid untuk mulai mencatat penerimaan sewa.'}
          </p>
          <button
            onClick={handleOpenAddTenant}
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tambah Data Sewa Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredTenants.map((tenant) => {
            const diskonPersen = tenant.diskonPersen || 0;
            const tarifNormal = tenant.tarifSewa || 0;
            const nominalPotongan = (tarifNormal * diskonPersen) / 100;
            const tarifBersih =
              tenant.tarifSetelahDiskon !== undefined
                ? tenant.tarifSetelahDiskon
                : Math.max(0, tarifNormal - nominalPotongan);

            return (
              <div
                key={tenant.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative group"
              >
                {/* Top Section: Nama Pihak Sewa & Kategori Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition">
                          {tenant.namaPenyewa}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
                          <Building2 className="w-3 h-3 text-teal-700" />
                          <span>{tenant.kategori || 'Sewa Lahan'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{tenant.nomorTelepon || '-'}</span>
                        {tenant.alamatPenyewa && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="truncate max-w-[200px] text-slate-500">
                              {tenant.alamatPenyewa}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditTenant(tenant)}
                        title="Edit Data Sewa"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant)}
                        title="Hapus Data Sewa"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lahan & Objek Info Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1.5 text-xs mt-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{tenant.namaLahan}</span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {tenant.luasLahan || 'Lahan Wakaf'}
                      </span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1 pl-5 text-[11px]">
                      <span>Peruntukan:</span>
                      <strong className="text-slate-800">{tenant.peruntukanUsaha}</strong>
                    </div>
                    {tenant.lokasiLahan && (
                      <div className="text-slate-500 text-[11px] pl-5 italic">
                        Patokan: {tenant.lokasiLahan}
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Pricing & Discount Breakdown */}
                <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200/70 space-y-2">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                        Tarif Sewa Tagihan:
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-lg sm:text-xl font-mono font-black text-emerald-900">
                          Rp {tarifBersih.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          / {tenant.tipePeriode === 'bulanan' ? 'bulan' : tenant.tipePeriode === 'tahunan' ? 'tahun' : 'musim'}
                        </span>
                      </div>
                    </div>

                    {diskonPersen > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] line-through text-slate-400 font-mono block">
                          Normal: Rp {tarifNormal.toLocaleString('id-ID')}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <Tag className="w-3 h-3 text-amber-700" />
                          <span>Potongan Operasional {diskonPersen}% (-Rp {nominalPotongan.toLocaleString('id-ID')})</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {diskonPersen > 0 && tenant.keteranganDiskon && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/80 font-medium">
                      <strong>Rincian Biaya Operasional:</strong> {tenant.keteranganDiskon}
                    </div>
                  )}

                  {/* Payment Status Info */}
                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {tenant.terakhirBayar
                          ? `Terakhir Bayar: ${new Date(tenant.terakhirBayar).toLocaleDateString('id-ID')}`
                          : 'Belum ada pembayaran sewa'}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      Total Lunas: Rp {(tenant.totalTerbayar || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenReceipt(tenant)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Kwitansi</span>
                  </button>

                  <button
                    onClick={() => handleOpenPayment(tenant)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 cursor-pointer active:scale-95"
                  >
                    <Coins className="w-4 h-4 text-amber-300" />
                    <span>Catat Bayar Sewa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TenantModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        onSave={(data) => {
          if (editingTenant) {
            if (onEditTenant) onEditTenant(editingTenant.id, data);
          } else {
            if (onAddTenant) onAddTenant(data);
          }
        }}
        editingTenant={editingTenant}
        posDanaList={posDanaList}
        categoriesSewa={categoriesSewa}
      />

      <TenantPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        tenant={selectedTenantForPayment}
        mosqueProfile={mosqueProfile}
        posDanaList={posDanaList}
        metodePembayaranList={metodePembayaranList}
        onConfirmPayment={(tenantId, payment) => {
          if (onPayTenantRent) {
            onPayTenantRent(tenantId, payment);
          }
        }}
      />

      <TenantReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        tenant={selectedTenantForReceipt}
        mosqueProfile={mosqueProfile}
      />

      {/* Master Printable Report Modal for Land Rent (Monthly, Yearly, All) */}
      {isReportModalOpen && (
        <div
          id="report-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
        >
          <div
            id="report-modal-dialog"
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
          >
            {/* Control Bar (Hidden in Print) */}
            <div
              id="rekap-sewa-control-bar"
              className="bg-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden shrink-0 border-b border-slate-800"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Laporan Rekapitulasi Sewa Lahan Wakaf</span>
              </div>

              {/* Period Mode Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setRekapPeriodMode('bulanan')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      rekapPeriodMode === 'bulanan'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setRekapPeriodMode('tahunan')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      rekapPeriodMode === 'tahunan'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Tahunan
                  </button>
                  <button
                    type="button"
                    onClick={() => setRekapPeriodMode('semua')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      rekapPeriodMode === 'semua'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                </div>

                {/* Month Dropdown if Bulanan */}
                {rekapPeriodMode === 'bulanan' && (
                  <select
                    value={rekapSelectedMonth}
                    onChange={(e) => setRekapSelectedMonth(Number(e.target.value))}
                    className="bg-slate-800 text-white border border-slate-700 text-xs font-semibold px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Year Dropdown if Bulanan or Tahunan */}
                {rekapPeriodMode !== 'semua' && (
                  <select
                    value={rekapSelectedYear}
                    onChange={(e) => setRekapSelectedYear(Number(e.target.value))}
                    className="bg-slate-800 text-white border border-slate-700 text-xs font-semibold px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={handlePrintRekapSewa}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0 shadow-xs"
                  title="Cetak atau Simpan PDF Laporan Rekap"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.body.classList.remove('print-rekap-sewa-active');
                    setIsReportModalOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-slate-50/50">
              <div
                id="report-modal-sheet"
                className="p-6 sm:p-8 bg-white text-slate-900 font-sans space-y-5 rounded-xl border border-slate-200 shadow-sm"
              >
                {/* Kop Surat Masjid */}
                <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    {mosqueProfile.logoUrl ? (
                      <img
                        src={mosqueProfile.logoUrl}
                        alt="Logo Masjid"
                        className="w-12 h-12 object-contain rounded-full border border-emerald-700 p-0.5 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 bg-emerald-800 text-white rounded-full flex items-center justify-center font-bold border border-emerald-600 shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="text-left sm:text-center">
                      <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700">
                        DEWAN KEMAKMURAN MASJID (DKM)
                      </h1>
                      <h2 className="text-lg sm:text-xl font-black uppercase text-emerald-950 tracking-tight leading-tight">
                        {mosqueProfile.namaMasjid}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {[
                      mosqueProfile.alamat ? mosqueProfile.alamat.replace(/,\s*$/, '') : '',
                      mosqueProfile.desa ? `Desa ${mosqueProfile.desa.replace(/^desa\s+/gi, '')}` : '',
                      mosqueProfile.kecamatan ? `Kec. ${mosqueProfile.kecamatan.replace(/^kec\.?\s+/gi, '')}` : '',
                      mosqueProfile.kota || ''
                    ].filter(Boolean).join(' ')}
                    {mosqueProfile.telepon ? ` • Telp: ${mosqueProfile.telepon}` : ''}
                  </p>
                  {mosqueProfile.nomorRekening && (
                    <p className="text-[11px] text-slate-500 italic">
                      Rek. Infaq/Kas: {mosqueProfile.namaBank || 'Bank'} {mosqueProfile.nomorRekening} a.n {mosqueProfile.anRekening || mosqueProfile.namaMasjid}
                    </p>
                  )}
                  <div className="pt-2">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider underline text-slate-900">
                      REKAPITULASI SEWA LAHAN WAKAF & ASET MASJID
                    </h3>
                    <p className="text-xs font-bold text-emerald-800 uppercase mt-0.5">
                      {rekapPeriodMode === 'bulanan'
                        ? `Periode: Bulan ${MONTH_NAMES[rekapSelectedMonth - 1]} ${rekapSelectedYear}`
                        : rekapPeriodMode === 'tahunan'
                        ? `Periode: Tahun ${rekapSelectedYear}`
                        : 'Periode: Semua Data Sewa Lahan'}
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-bold">
                        <th className="py-2.5 px-2.5 border-r border-slate-300 text-center w-10">No</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Nama Pihak Sewa & Kontak</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Objek Lahan / Usaha</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Kategori Sewa</th>
                        <th className="py-2.5 px-3 text-right border-r border-slate-300">Tarif Normal</th>
                        <th className="py-2.5 px-2.5 text-center border-r border-slate-300">Potongan (%)</th>
                        <th className="py-2.5 px-3 text-right border-r border-slate-300">Tarif Bersih</th>
                        <th className="py-2.5 px-3 text-right">Total Terbayar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rekapFilteredTenants.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                            Tidak ada data sewa lahan pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        rekapFilteredTenants.map((t, idx) => {
                          const diskon = t.diskonPersen || 0;
                          const normal = t.tarifSewa || 0;
                          const potongan = (normal * diskon) / 100;
                          const bersih =
                            t.tarifSetelahDiskon !== undefined
                              ? t.tarifSetelahDiskon
                              : Math.max(0, normal - potongan);

                          return (
                            <tr key={t.id} className="hover:bg-slate-50">
                              <td className="py-2 px-2.5 text-center font-medium text-slate-500 border-r border-slate-200">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200">
                                <strong className="text-slate-900 block font-semibold">{t.namaPenyewa}</strong>
                                <span className="text-[11px] text-slate-500">{t.nomorTelepon || '-'}</span>
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200">
                                <span className="font-semibold text-slate-800 block">{t.namaLahan}</span>
                                <span className="text-[11px] text-slate-500">{t.peruntukanUsaha || '-'}</span>
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
                                  {t.kategori || 'Sewa Lahan'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono border-r border-slate-200">
                                Rp {normal.toLocaleString('id-ID')}
                              </td>
                              <td className="py-2 px-2.5 text-center border-r border-slate-200">
                                {diskon > 0 ? (
                                  <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                                    {diskon}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900 border-r border-slate-200">
                                Rp {bersih.toLocaleString('id-ID')}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-800">
                                Rp {(t.totalTerbayar || 0).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                        <td colSpan={7} className="py-2.5 px-3 text-right border-r border-slate-300">
                          TOTAL AKUMULASI KAS SEWA DITERIMA:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-900 text-sm">
                          Rp {rekapStats.totalTerbayar.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Signatures */}
                <div className="pt-6 grid grid-cols-2 text-center text-xs">
                  <div>
                    <p className="text-slate-600">Mengetahui,</p>
                    <p className="font-bold text-slate-800 mt-1">Ketua DKM</p>
                    <div className="h-16" />
                    <p className="font-bold text-slate-900 underline underline-offset-2">
                      ( {mosqueProfile.ketuaDKM || 'H. Ahmad Syarifuddin, Lc'} )
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">
                      {titimangsaKota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="font-bold text-slate-800 mt-1">Bendahara / Sie Aset Wakaf</p>
                    <div className="h-16" />
                    <p className="font-bold text-slate-900 underline underline-offset-2">
                      ( {mosqueProfile.bendaharaDKM || 'H. Mohammad Ridwan, SE'} )
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
