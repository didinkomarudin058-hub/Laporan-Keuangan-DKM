import React, { useState, useMemo } from 'react';
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
  mosqueProfile,
  posDanaList,
  metodePembayaranList,
  onAddTenant,
  onEditTenant,
  onDeleteTenant,
  onPayTenantRent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'hampir_habis' | 'menunggak' | 'selesai'>('semua');
  const [discountFilter, setDiscountFilter] = useState<'semua' | 'dengan_diskon' | 'tanpa_diskon'>('semua');

  // Modals
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<LandTenant | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<LandTenant | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTenantForReceipt, setSelectedTenantForReceipt] = useState<LandTenant | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Statistics Calculations
  const stats = useMemo(() => {
    const totalPenyewa = landTenants.length;
    const aktifPenyewa = landTenants.filter((t) => t.statusKontrak === 'aktif').length;
    const menunggakPenyewa = landTenants.filter((t) => t.statusKontrak === 'menunggak').length;
    const hampirHabisPenyewa = landTenants.filter((t) => t.statusKontrak === 'hampir_habis').length;

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

      if (t.statusKontrak === 'aktif' || t.statusKontrak === 'hampir_habis') {
        if (t.tipePeriode === 'bulanan') {
          estimasiKasBulanan += bersih;
        } else if (t.tipePeriode === 'tahunan') {
          estimasiKasBulanan += bersih / 12;
        } else {
          estimasiKasBulanan += bersih / 6;
        }
      }
    });

    const penyewaDenganDiskon = landTenants.filter((t) => (t.diskonPersen || 0) > 0).length;

    return {
      totalPenyewa,
      aktifPenyewa,
      menunggakPenyewa,
      hampirHabisPenyewa,
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
        t.nomorTelepon.includes(searchQuery);

      // Status
      const matchStatus = statusFilter === 'semua' || t.statusKontrak === statusFilter;

      // Discount Filter
      const hasDiscount = (t.diskonPersen || 0) > 0;
      const matchDiscount =
        discountFilter === 'semua' ||
        (discountFilter === 'dengan_diskon' && hasDiscount) ||
        (discountFilter === 'tanpa_diskon' && !hasDiscount);

      return matchSearch && matchStatus && matchDiscount;
    });
  }, [landTenants, searchQuery, statusFilter, discountFilter]);

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
        `Apakah Anda yakin ingin menghapus data penyewa "${tenant.namaPenyewa}" (${tenant.namaLahan})? Data pembayaran masa lalu yang sudah masuk ke kas tetap tersimpan.`
      )
    ) {
      if (onDeleteTenant) {
        onDeleteTenant(tenant.id);
      }
    }
  };

  const getStatusBadge = (status: LandTenant['statusKontrak']) => {
    switch (status) {
      case 'aktif':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Aktif</span>
          </span>
        );
      case 'hampir_habis':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            <span>Jatuh Tempo</span>
          </span>
        );
      case 'menunggak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-700" />
            <span>Menunggak</span>
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Selesai Kontrak</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Manajemen Aset & Lahan Wakaf Masjid</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Penyewa Tanah Masjid</span>
            </h1>
            <p className="text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Kelola data penyewa tanah wakaf/kavling usaha masjid, tarif sewa, skema potongan persentase, dan pencatatan kas otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer backdrop-blur-xs"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>Cetak Rekap Sewa</span>
            </button>
            <button
              onClick={handleOpenAddTenant}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tambah Penyewa Tanah</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Penyewa */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Penyewa Tanah</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.totalPenyewa}
            </span>
            <span className="text-xs font-semibold text-slate-500">Kavling</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-600">
            <span className="text-emerald-700 font-bold">{stats.aktifPenyewa} Aktif</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{stats.hampirHabisPenyewa} Jatuh Tempo</span>
            {stats.menunggakPenyewa > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-600 font-bold">{stats.menunggakPenyewa} Nunggak</span>
              </>
            )}
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

        {/* Card 3: Potongan Persentase Diberikan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Potongan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Percent className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-mono">
              {stats.penyewaDenganDiskon}
            </span>
            <span className="text-xs font-semibold text-slate-500">Penyewa Dapat Potongan</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
            <Tag className="w-3 h-3 text-amber-600" />
            <span>Total potongan: Rp {stats.totalPotonganDiskonNominal.toLocaleString('id-ID')}</span>
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
            Tarif bersih sewa tanah setelah potongan
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
            placeholder="Cari nama penyewa, kavling lahan, peruntukan usaha..."
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
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="semua">Semua Status Kontrak</option>
            <option value="aktif">✓ Status Aktif</option>
            <option value="hampir_habis">⚠️ Jatuh Tempo / Hampir Habis</option>
            <option value="menunggak">❌ Menunggak</option>
            <option value="selesai">⚪ Selesai</option>
          </select>

          {/* Discount Filter */}
          <select
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/70 border-amber-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="semua">Semua Skema Tarif</option>
            <option value="dengan_diskon">🏷️ Ada Potongan (%)</option>
            <option value="tanpa_diskon">Tarif Standar (0%)</option>
          </select>
        </div>
      </div>

      {/* Tenant Cards Grid */}
      {filteredTenants.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <UserCheck className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery || statusFilter !== 'semua' || discountFilter !== 'semua'
              ? 'Tidak ada penyewa yang cocok dengan filter'
              : 'Belum Ada Data Penyewa Tanah'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'semua' || discountFilter !== 'semua'
              ? 'Silakan coba ubah kata kunci pencarian atau reset filter di atas.'
              : 'Tambahkan data penyewa kavling tanah wakaf atau stand usaha masjid untuk mulai mencatat penerimaan sewa.'}
          </p>
          <button
            onClick={handleOpenAddTenant}
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tambah Penyewa Pertama</span>
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
                {/* Top Section: Nama Penyewa & Status */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition">
                          {tenant.namaPenyewa}
                        </h3>
                        {getStatusBadge(tenant.statusKontrak)}
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
                        title="Edit Data Penyewa"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant)}
                        title="Hapus Penyewa"
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
                          <span>Potongan {diskonPersen}% (-Rp {nominalPotongan.toLocaleString('id-ID')})</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {diskonPersen > 0 && tenant.keteranganDiskon && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/80 font-medium">
                      <strong>Alasan Potongan:</strong> {tenant.keteranganDiskon}
                    </div>
                  )}

                  {/* Contract Period & Payment Status */}
                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Kontrak: {new Date(tenant.tanggalMulai).toLocaleDateString('id-ID')} s.d.{' '}
                        {new Date(tenant.tanggalSelesai).toLocaleDateString('id-ID')}
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

      {/* Master Printable Report Modal for All Land Tenants */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
              <span className="text-xs font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Laporan Rekapitulasi Sewa Lahan / Tanah Wakaf</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 bg-white text-slate-900 font-sans space-y-6">
              {/* Kop Surat */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="text-xl font-bold uppercase text-emerald-950 font-sans">
                  {mosqueProfile.namaMasjid}
                </h2>
                <p className="text-xs text-slate-600">
                  {mosqueProfile.alamat}, {mosqueProfile.kota} • Telp: {mosqueProfile.telepon}
                </p>
                <h3 className="text-sm font-extrabold uppercase mt-2 tracking-wider underline text-slate-900">
                  REKAPITULASI PENYEWA LAHAN WAKAF & ASET MASJID
                </h3>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-300 text-slate-800 font-bold">
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Penyewa & Kontak</th>
                      <th className="py-2.5 px-3">Objek Lahan / Usaha</th>
                      <th className="py-2.5 px-3 text-right">Tarif Normal</th>
                      <th className="py-2.5 px-3 text-center">Potongan (%)</th>
                      <th className="py-2.5 px-3 text-right">Tarif Bersih</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Total Terbayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {landTenants.map((t, idx) => {
                      const diskon = t.diskonPersen || 0;
                      const normal = t.tarifSewa || 0;
                      const potongan = (normal * diskon) / 100;
                      const bersih =
                        t.tarifSetelahDiskon !== undefined
                          ? t.tarifSetelahDiskon
                          : Math.max(0, normal - potongan);

                      return (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <strong className="text-slate-900 block">{t.namaPenyewa}</strong>
                            <span className="text-[11px] text-slate-500">{t.nomorTelepon}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-800 block">{t.namaLahan}</span>
                            <span className="text-[11px] text-slate-500">{t.peruntukanUsaha}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            Rp {normal.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {diskon > 0 ? (
                              <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                                {diskon}%
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900">
                            Rp {bersih.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-[11px] font-bold uppercase text-slate-700">
                              {t.statusKontrak}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-800">
                            Rp {(t.totalTerbayar || 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={7} className="py-2.5 px-3 text-right">
                        TOTAL AKUMULASI KAS SEWA DITERIMA:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-900 text-sm">
                        Rp {stats.totalKasDiterima.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-800 mt-1">Ketua DKM</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-900 underline underline-offset-2">
                    {mosqueProfile.ketuaDKM || 'H. Ahmad Syarifuddin, Lc'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">
                    {mosqueProfile.kota.split(',')[0] || 'Bekasi'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-bold text-slate-800 mt-1">Bendahara / Sie Aset Wakaf</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-900 underline underline-offset-2">
                    {mosqueProfile.bendaharaDKM || 'H. Mohammad Ridwan, SE'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
