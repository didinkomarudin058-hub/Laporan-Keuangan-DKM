import React, { useState, useMemo, useEffect } from 'react';
import {
  UserCheck,
  Plus,
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
  Clock,
  MessageSquare,
  History,
  Check,
  HelpCircle,
} from 'lucide-react';
import {
  LandTenant,
  MosqueProfile,
  FundCategory,
  PaymentMethod,
  TenantPaymentRecord,
} from '../types';
import { TenantModal } from './TenantModal';
import { TenantPaymentModal } from './TenantPaymentModal';
import { TenantPaymentHistoryModal } from './TenantPaymentHistoryModal';
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
      nominalAsli?: number;
      diskonPersen?: number;
      tanggal: string;
      periode: string;
      bulanTahunKey?: string;
      metodePembayaran: string;
      posDanaTujuan: string;
      statusBayar?: 'lunas' | 'cicilan';
      sisaKurangBayar?: number;
      keterangan?: string;
      petugas?: string;
      autoPushToKas: boolean;
    }
  ) => void;
  onDeleteTenantPayment?: (tenantId: string, paymentId: string) => void;
  onNavigateToTransactions?: (trxId?: string) => void;
  readOnly?: boolean;
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
  onDeleteTenantPayment,
  readOnly = false,
}) => {
  // Main Sub-Tab View Switcher
  const [activeView, setActiveView] = useState<'paymentStatus' | 'tenantList'>('paymentStatus');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    'semua' | 'lunas' | 'cicilan' | 'belum_bayar'
  >('semua');
  const [discountFilter, setDiscountFilter] = useState<'semua' | 'dengan_diskon' | 'tanpa_diskon'>('semua');

  // Monitoring Period for Payment Status
  const [monitorMonth, setMonitorMonth] = useState<number>(new Date().getMonth() + 1);
  const [monitorYear, setMonitorYear] = useState<number>(new Date().getFullYear());

  // Modals
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<LandTenant | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<LandTenant | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTenantForHistory, setSelectedTenantForHistory] = useState<LandTenant | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTenantForReceipt, setSelectedTenantForReceipt] = useState<LandTenant | null>(null);
  const [selectedPaymentRecordForReceipt, setSelectedPaymentRecordForReceipt] =
    useState<TenantPaymentRecord | null>(null);

  // Rekap Print Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [rekapPeriodMode, setRekapPeriodMode] = useState<'bulanan' | 'tahunan' | 'semua'>('bulanan');
  const [rekapSelectedMonth, setRekapSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [rekapSelectedYear, setRekapSelectedYear] = useState<number>(new Date().getFullYear());

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const monitorMonthName = MONTH_NAMES[monitorMonth - 1] || 'Bulan Berjalan';
  const monitorMonthYearKey = `${monitorYear}-${String(monitorMonth).padStart(2, '0')}`;
  const monitorPeriodLabel = `Bulan ${monitorMonthName} ${monitorYear}`;

  // Helper to calculate tenant status for the monitored period (Nominal Asli murni)
  const getTenantPaymentStatus = (tenant: LandTenant) => {
    const rawTarif = tenant.tarifSewa || 0;
    const payments = tenant.riwayatPembayaran || [];

    // Filter payments relevant for the monitored period
    const periodPayments = payments.filter((p) => {
      if (tenant.tipePeriode === 'tahunan') {
        return (
          p.tahunKey === monitorYear ||
          p.periode.includes(String(monitorYear)) ||
          p.tanggal.startsWith(String(monitorYear))
        );
      }
      return p.bulanTahunKey === monitorMonthYearKey || p.tanggal.startsWith(monitorMonthYearKey);
    });

    const totalTerbayarPeriode = periodPayments.reduce((sum, p) => sum + (p.nominal || 0), 0);
    const sisaKurangBayar = Math.max(0, rawTarif - totalTerbayarPeriode);

    let status: 'lunas' | 'cicilan' | 'belum_bayar' = 'belum_bayar';
    if (totalTerbayarPeriode >= rawTarif && rawTarif > 0) {
      status = 'lunas';
    } else if (totalTerbayarPeriode > 0) {
      status = 'cicilan';
    }

    const persentaseBayar = rawTarif > 0 ? Math.min(100, Math.round((totalTerbayarPeriode / rawTarif) * 100)) : 100;

    // Cek apakah menunggak (jika tanggal sekarang lewat dari jatuh tempo)
    const today = new Date();
    const isCurrentOrPastMonth =
      today.getFullYear() > monitorYear ||
      (today.getFullYear() === monitorYear && today.getMonth() + 1 >= monitorMonth);
    const jatuhTempo = tenant.jatuhTempoTanggal || 5;
    const isPastDue = isCurrentOrPastMonth && today.getDate() > jatuhTempo && status !== 'lunas';

    return {
      rawTarif,
      tarifBersih: rawTarif,
      totalTerbayarPeriode,
      sisaKurangBayar,
      status,
      persentaseBayar,
      periodPaymentsCount: periodPayments.length,
      jatuhTempo,
      isPastDue,
    };
  };

  // Helper to calculate tenant data specifically for Rekapitulasi Report
  const getTenantRekapData = (
    tenant: LandTenant,
    mode: 'bulanan' | 'tahunan' | 'semua',
    month: number,
    year: number
  ) => {
    const rawTarif = tenant.tarifSewa || 0;
    const diskonPersen = tenant.diskonPersen || 0;

    let targetTarifAsli = rawTarif;
    if (mode === 'tahunan' && tenant.tipePeriode === 'bulanan') {
      targetTarifAsli = rawTarif * 12;
    }
    const nominalPotongan = (targetTarifAsli * diskonPersen) / 100;
    const targetTagihanBersih = Math.max(0, targetTarifAsli - nominalPotongan);

    const payments = tenant.riwayatPembayaran || [];
    let hasilBayar = 0;

    if (mode === 'bulanan') {
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const periodPayments = payments.filter((p) => {
        if (tenant.tipePeriode === 'tahunan') {
          return (
            p.tahunKey === year ||
            p.periode.includes(String(year)) ||
            p.tanggal.startsWith(String(year))
          );
        }
        return p.bulanTahunKey === monthKey || p.tanggal.startsWith(monthKey);
      });
      hasilBayar = periodPayments.reduce((sum, p) => sum + (p.nominal || 0), 0);
    } else if (mode === 'tahunan') {
      const yearStr = String(year);
      const periodPayments = payments.filter(
        (p) => p.tahunKey === year || p.periode.includes(yearStr) || p.tanggal.startsWith(yearStr)
      );
      hasilBayar = periodPayments.reduce((sum, p) => sum + (p.nominal || 0), 0);
    } else {
      // semua
      hasilBayar = tenant.totalTerbayar || payments.reduce((sum, p) => sum + (p.nominal || 0), 0);
    }

    const belumBayar = Math.max(0, targetTarifAsli - hasilBayar);
    let status: 'lunas' | 'cicilan' | 'belum_bayar' = 'belum_bayar';
    if (hasilBayar >= targetTarifAsli && targetTarifAsli > 0) {
      status = 'lunas';
    } else if (hasilBayar > 0) {
      status = 'cicilan';
    }

    // Kolom sesuai format tabel rekap:
    // Tagihan = targetTarifAsli
    // Bayar = nominal yang dibayarkan/dicicil oleh penyewa
    // Potongan = potongan yang diambil dari jumlah yang dicicil/dibayar (diskonPersen % dari nilai bayar)
    // Jumlah Setelah Dipotong = kas bersih yang masuk kas masjid (hasil potongan dari cicilan)
    let nilaiBayar = 0;
    let nilaiPotongan = 0;
    let nilaiSetelahPotong = 0;

    if (hasilBayar > 0) {
      nilaiBayar = hasilBayar;
      nilaiPotongan = Math.round((hasilBayar * diskonPersen) / 100);
      nilaiSetelahPotong = Math.max(0, hasilBayar - nilaiPotongan);
    } else {
      nilaiBayar = 0;
      nilaiPotongan = 0;
      nilaiSetelahPotong = 0;
    }

    return {
      rawTarif,
      diskonPersen,
      nominalPotongan,
      targetTarifAsli,
      targetTagihanBersih,
      hasilBayar,
      belumBayar,
      status,
      nilaiBayar,
      nilaiPotongan,
      nilaiSetelahPotong,
    };
  };

  // Payment Status Statistics for Header
  const paymentStats = useMemo(() => {
    let targetTagihanTotal = 0;
    let uangTerkumpulTotal = 0;
    let sisaPiutangTotal = 0;
    let countLunas = 0;
    let countCicilan = 0;
    let countBelumBayar = 0;

    landTenants.forEach((t) => {
      const calc = getTenantPaymentStatus(t);
      targetTagihanTotal += calc.tarifBersih;
      uangTerkumpulTotal += calc.totalTerbayarPeriode;
      sisaPiutangTotal += calc.sisaKurangBayar;

      if (calc.status === 'lunas') countLunas++;
      else if (calc.status === 'cicilan') countCicilan++;
      else countBelumBayar++;
    });

    const percentTerkumpul =
      targetTagihanTotal > 0
        ? Math.min(100, Math.round((uangTerkumpulTotal / targetTagihanTotal) * 100))
        : 0;

    return {
      targetTagihanTotal,
      uangTerkumpulTotal,
      sisaPiutangTotal,
      percentTerkumpul,
      countLunas,
      countCicilan,
      countBelumBayar,
      totalTenants: landTenants.length,
    };
  }, [landTenants, monitorMonth, monitorYear]);

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

      // Payment Status Filter
      if (activeView === 'paymentStatus' && paymentStatusFilter !== 'semua') {
        const calc = getTenantPaymentStatus(t);
        if (paymentStatusFilter === 'lunas' && calc.status !== 'lunas') return false;
        if (paymentStatusFilter === 'cicilan' && calc.status !== 'cicilan') return false;
        if (paymentStatusFilter === 'belum_bayar' && calc.status !== 'belum_bayar') return false;
      }

      return matchSearch && matchCategory && matchDiscount;
    });
  }, [
    landTenants,
    searchQuery,
    categoryFilter,
    discountFilter,
    activeView,
    paymentStatusFilter,
    monitorMonth,
    monitorYear,
  ]);

  // Filtered tenants for rekap report based on selected period
  const rekapFilteredTenants = useMemo(() => {
    return landTenants;
  }, [landTenants]);

  const rekapStats = useMemo(() => {
    let totalTagihan = 0;
    let totalBayar = 0;
    let totalPotongan = 0;
    let totalSetelahDipotong = 0;
    let totalBelumBayar = 0;
    let countLunas = 0;
    let countCicilan = 0;
    let countBelumBayar = 0;

    landTenants.forEach((t) => {
      const data = getTenantRekapData(t, rekapPeriodMode, rekapSelectedMonth, rekapSelectedYear);
      totalTagihan += data.targetTarifAsli;
      totalBayar += data.nilaiBayar;
      totalPotongan += data.nilaiPotongan;
      totalSetelahDipotong += data.nilaiSetelahPotong;
      totalBelumBayar += data.belumBayar;
      if (data.status === 'lunas') countLunas++;
      else if (data.status === 'cicilan') countCicilan++;
      else countBelumBayar++;
    });

    return {
      totalTagihan,
      totalBayar,
      totalPotongan,
      totalSetelahDipotong,
      totalBelumBayar,
      countLunas,
      countCicilan,
      countBelumBayar,
      totalPenyewa: landTenants.length,
    };
  }, [landTenants, rekapPeriodMode, rekapSelectedMonth, rekapSelectedYear]);

  const handlePrintRekapSewa = () => {
    window.print();
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

  const handleOpenHistory = (tenant: LandTenant) => {
    setSelectedTenantForHistory(tenant);
    setIsHistoryModalOpen(true);
  };

  const handleOpenReceipt = (tenant: LandTenant, paymentRecord?: TenantPaymentRecord) => {
    setSelectedTenantForReceipt(tenant);
    setSelectedPaymentRecordForReceipt(paymentRecord || null);
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

  // WhatsApp quick notification generator
  const handleSendWhatsAppNotification = (tenant: LandTenant) => {
    const rawPhone = (tenant.nomorTelepon || '').replace(/[^0-9]/g, '');
    if (!rawPhone) {
      alert('Nomor telepon penyewa belum tersedia.');
      return;
    }
    const formattedPhone = rawPhone.startsWith('0')
      ? '62' + rawPhone.slice(1)
      : rawPhone.startsWith('62')
      ? rawPhone
      : '62' + rawPhone;

    const calc = getTenantPaymentStatus(tenant);

    let msg =
      `*PEMBERITAHUAN SEWA LAHAN - ${mosqueProfile.namaMasjid.toUpperCase()}*\n\n` +
      `Assalamu'alaikum Wr. Wb.\n` +
      `Kepada Yth. *${tenant.namaPenyewa}*\n\n` +
      `Berikut rincian status pembayaran sewa lahan *${tenant.namaLahan}* (${tenant.peruntukanUsaha}):\n` +
      `• Periode: *${monitorPeriodLabel}*\n` +
      `• Tarif Sewa: Rp ${calc.tarifBersih.toLocaleString('id-ID')}\n` +
      `• Telah Dibayar: Rp ${calc.totalTerbayarPeriode.toLocaleString('id-ID')}\n` +
      `• Sisa Tagihan: *Rp ${calc.sisaKurangBayar.toLocaleString('id-ID')}*\n` +
      `• Status: *${
        calc.status === 'lunas'
          ? '✅ LUNAS'
          : calc.status === 'cicilan'
          ? '🟡 SEBAGIAN / BELUM LUNAS'
          : '⚠️ BELUM BAYAR'
      }*\n\n`;

    if (calc.sisaKurangBayar > 0) {
      msg +=
        `Pembayaran dapat disetorkan langsung ke Bendahara DKM atau ditransfer melalui rekening kas masjid:\n` +
        `🏦 *${mosqueProfile.namaBank || 'Bank Syariah'}*\n` +
        `💳 No. Rekening: *${mosqueProfile.nomorRekening || '-'}*\n` +
        `👤 Atas Nama: *${mosqueProfile.anRekening || mosqueProfile.namaMasjid}*\n\n` +
        `Jatuh tempo setiap tanggal *${calc.jatuhTempo}*.\n` +
        `Mohon konfirmasi setelah melakukan pembayaran. Terima kasih atas kerjasamanya.\n\n` +
        `Wassalamu'alaikum Wr. Wb.\n` +
        `*Pengurus DKM / Sie Aset & Wakaf*`;
    } else {
      msg +=
        `Alhamdulillah, terima kasih atas pembayaran sewa yang telah lunas tepat waktu. Semoga usaha dan rezeki Bapak/Ibu selalu berkah dan lancar.\n\n` +
        `Wassalamu'alaikum Wr. Wb.\n` +
        `*Pengurus DKM / Sie Aset & Wakaf*`;
    }

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Interactive Main View Content (Hidden during Print) */}
      <div id="mosque-business-main-content" className="space-y-6 print:hidden">
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
              Kelola hasil pembayaran sewa tanah wakaf, pantau siapa yang sudah lunas atau belum bayar, catat setoran kas, dan cetak kuitansi resmi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer backdrop-blur-xs shadow-2xs"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Cetak Rekap Sewa</span>
            </button>
            {!readOnly && (
              <button
                onClick={handleOpenAddTenant}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer border border-emerald-500/50 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Tambah Penyewa Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Sub-Tab View Switcher */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveView('paymentStatus')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'paymentStatus'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Kelola Hasil Pembayaran (Lunas / Belum)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('tenantList')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'tenantList'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Daftar Objek & Data Penyewa ({landTenants.length})</span>
          </button>
        </div>

        {/* Quick helper note */}
        <div className="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Otomatis terhubung dengan Jurnal Kas Masjid & Buku Besar</span>
        </div>
      </div>

      {/* TAB 1: KELOLA HASIL PEMBAYARAN */}
      {activeView === 'paymentStatus' && (
        <div className="space-y-6">
          {/* Period Selector & Monitoring Controller */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                    Periode Monitoring Pembayaran
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                    <span>{monitorPeriodLabel}</span>
                  </h3>
                </div>
              </div>

              {/* Month & Year Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <select
                    value={monitorMonth}
                    onChange={(e) => setMonitorMonth(Number(e.target.value))}
                    className="bg-white border border-slate-300 text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={monitorYear}
                    onChange={(e) => setMonitorYear(Number(e.target.value))}
                    className="bg-white border border-slate-300 text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMonitorMonth(new Date().getMonth() + 1);
                    setMonitorYear(new Date().getFullYear());
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200 cursor-pointer"
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            {/* 4 Financial & Collection Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              {/* Target Tagihan */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Target Tagihan Periode Ini
                </span>
                <div className="text-lg font-black font-mono text-slate-900 mt-1">
                  Rp {paymentStats.targetTagihanTotal.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dari {paymentStats.totalTenants} objek sewa aktif</span>
                </div>
              </div>

              {/* Uang Masuk Kas */}
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Uang Sewa Terkumpul
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-800 font-mono bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                    {paymentStats.percentTerkumpul}%
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-emerald-900 mt-1">
                  Rp {paymentStats.uangTerkumpulTotal.toLocaleString('id-ID')}
                </div>
                {/* Progress bar */}
                <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                    style={{ width: `${paymentStats.percentTerkumpul}%` }}
                  />
                </div>
              </div>

              {/* Sisa Piutang / Belum Bayar */}
              <div
                className={`p-3.5 rounded-xl border ${
                  paymentStats.sisaPiutangTotal > 0
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block ${
                    paymentStats.sisaPiutangTotal > 0 ? 'text-rose-800' : 'text-slate-500'
                  }`}
                >
                  Sisa Belum Terbayar (Piutang)
                </span>
                <div
                  className={`text-lg font-black font-mono mt-1 ${
                    paymentStats.sisaPiutangTotal > 0 ? 'text-rose-700' : 'text-slate-700'
                  }`}
                >
                  Rp {paymentStats.sisaPiutangTotal.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  {paymentStats.countBelumBayar + paymentStats.countCicilan} penyewa belum tuntas
                </div>
              </div>

              {/* Status Breakdown Mini Pills */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pencapaian Pelunasan
                </span>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 text-xs font-extrabold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🟢 Lunas: {paymentStats.countLunas}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-extrabold rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                    🟡 Cicilan: {paymentStats.countCicilan}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-extrabold rounded-lg bg-rose-100 text-rose-800 border border-rose-300">
                    🔴 Belum: {paymentStats.countBelumBayar}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">
                  Tingkat Pelunasan: {paymentStats.totalTenants > 0 ? Math.round((paymentStats.countLunas / paymentStats.totalTenants) * 100) : 0}% Lunas
                </span>
              </div>
            </div>
          </div>

          {/* Quick Filter Bar (Status Chips & Search) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter('semua')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    paymentStatusFilter === 'semua'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({paymentStats.totalTenants})
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter('lunas')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    paymentStatusFilter === 'lunas'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sudah Lunas ({paymentStats.countLunas})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter('cicilan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    paymentStatusFilter === 'cicilan'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Kurang Bayar / Cicilan ({paymentStats.countCicilan})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter('belum_bayar')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    paymentStatusFilter === 'belum_bayar'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Belum Bayar / Menunggak ({paymentStats.countBelumBayar})</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari penyewa, lahan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Cards List of Tenants with Payment Management */}
          {filteredTenants.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Tidak ada penyewa yang cocok dengan filter</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Coba ubah status filter (Semua, Lunas, Belum Bayar) atau kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTenants.map((tenant) => {
                const calc = getTenantPaymentStatus(tenant);

                return (
                  <div
                    key={tenant.id}
                    className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${
                      calc.status === 'lunas'
                        ? 'border-emerald-200/90'
                        : calc.status === 'cicilan'
                        ? 'border-amber-200'
                        : calc.isPastDue
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Card Top: Tenant Info & Status Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{tenant.namaPenyewa}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
                              {tenant.kategori || 'Sewa'}
                            </span>
                          </div>
                          <h4 className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{tenant.namaLahan}</span>
                          </h4>
                          {tenant.nomorTelepon && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{tenant.nomorTelepon}</span>
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="text-right shrink-0">
                          {calc.status === 'lunas' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>LUNAS</span>
                            </span>
                          ) : calc.status === 'cicilan' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>CICILAN ({calc.persentaseBayar}%)</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-2xs ${
                                calc.isPastDue
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              <AlertCircle
                                className={`w-3.5 h-3.5 ${calc.isPastDue ? 'text-rose-600' : 'text-slate-500'}`}
                              />
                              <span>{calc.isPastDue ? 'MENUNGGAK' : 'BELUM BAYAR'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Financial Detail Box */}
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Tarif Sewa Periode Ini:</span>
                          <span className="font-mono font-bold text-slate-800">
                            Rp {calc.tarifBersih.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Sudah Dibayar:</span>
                          <span className="font-mono font-bold text-emerald-700">
                            Rp {calc.totalTerbayarPeriode.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                          <span
                            className={`text-[11px] font-bold ${
                              calc.sisaKurangBayar > 0 ? 'text-rose-700' : 'text-slate-700'
                            }`}
                          >
                            Sisa Kurang Bayar:
                          </span>
                          <span
                            className={`font-mono font-black ${
                              calc.sisaKurangBayar > 0 ? 'text-rose-700' : 'text-slate-700'
                            }`}
                          >
                            Rp {calc.sisaKurangBayar.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              calc.status === 'lunas'
                                ? 'bg-emerald-600'
                                : calc.status === 'cicilan'
                                ? 'bg-amber-500'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${calc.persentaseBayar}%` }}
                          />
                        </div>

                        {/* Due Date & Last Payment note */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>Jatuh Tempo: Tgl {calc.jatuhTempo} tiap bulan</span>
                          <span>
                            {tenant.terakhirBayar
                              ? `Bayar terakhir: ${new Date(tenant.terakhirBayar).toLocaleDateString('id-ID')}`
                              : 'Belum pernah bayar'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppNotification(tenant)}
                          title="Kirim pemberitahuan tagihan atau konfirmasi via WhatsApp"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Kirim WA</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenHistory(tenant)}
                          title="Lihat seluruh riwayat pembayaran sewa"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        >
                          <History className="w-3.5 h-3.5 text-slate-600" />
                          <span>Riwayat</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(tenant)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Kwitansi</span>
                        </button>

                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(tenant)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 cursor-pointer active:scale-95"
                          >
                            <Coins className="w-3.5 h-3.5 text-amber-300" />
                            <span>Catat Bayar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DAFTAR OBJEK & DATA PENYEWA LAHAN */}
      {activeView === 'tenantList' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama pihak sewa, objek lahan, nomor kontak..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="semua">Semua Kategori</option>
                {categoriesSewa.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="semua">Semua Skema Potongan</option>
                <option value="dengan_diskon">Dengan Potongan Operasional (%)</option>
                <option value="tanpa_diskon">Tanpa Potongan</option>
              </select>
            </div>
          </div>

          {/* Tenants Cards Grid */}
          {filteredTenants.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Tidak ada data penyewa yang sesuai</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol &quot;+ Tambah Penyewa Baru&quot; di atas untuk mendaftarkan penyewa tanah wakaf baru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTenants.map((tenant) => {
                const diskon = tenant.diskonPersen || 0;
                const normal = tenant.tarifSewa || 0;
                const nominalPotongan = (normal * diskon) / 100;
                const bersih =
                  tenant.tarifSetelahDiskon !== undefined
                    ? tenant.tarifSetelahDiskon
                    : Math.max(0, normal - nominalPotongan);

                return (
                  <div
                    key={tenant.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    {/* Top Section */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-900 border border-teal-200 mb-1">
                            {tenant.kategori || 'Sewa Lahan'}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {tenant.namaPenyewa}
                          </h3>
                        </div>

                        {!readOnly && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditTenant(tenant)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit Data Penyewa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTenant(tenant)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Data Penyewa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Detail Lahan & Peruntukan */}
                      <div className="space-y-1 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800">{tenant.namaLahan}</strong>
                            {tenant.lokasiLahan && (
                              <p className="text-[11px] text-slate-500">{tenant.lokasiLahan}</p>
                            )}
                          </div>
                        </div>

                        <div className="pt-1 text-[11px] flex items-center justify-between text-slate-500">
                          <span>Luas: {tenant.luasLahan || '-'}</span>
                          <span>Usaha: {tenant.peruntukanUsaha}</span>
                        </div>
                      </div>

                      {/* Tarif Sewa Box */}
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950">
                          Tarif Sewa / {tenant.tipePeriode === 'bulanan' ? 'bln' : tenant.tipePeriode === 'tahunan' ? 'thn' : 'periode'}:
                        </span>
                        <span className="text-sm font-mono font-black text-emerald-900">
                          Rp {normal.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Total Terbayar info */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>
                          {tenant.terakhirBayar
                            ? `Terakhir: ${new Date(tenant.terakhirBayar).toLocaleDateString('id-ID')}`
                            : 'Belum ada pembayaran'}
                        </span>
                        <span className="font-mono font-bold text-emerald-800">
                          Total: Rp {(tenant.totalTerbayar || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(tenant)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Kwitansi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenPayment(tenant)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 cursor-pointer active:scale-95"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-300" />
                        <span>Catat Bayar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>

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

      <TenantPaymentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        tenant={selectedTenantForHistory}
        mosqueProfile={mosqueProfile}
        activePeriodLabel={monitorPeriodLabel}
        activeMonthYearKey={monitorMonthYearKey}
        onOpenPaymentModal={(t) => {
          setSelectedTenantForPayment(t);
          setIsPaymentModalOpen(true);
        }}
        onOpenReceiptModal={(t, pay) => {
          setSelectedTenantForReceipt(t);
          setSelectedPaymentRecordForReceipt(pay || null);
          setIsReceiptModalOpen(true);
        }}
        onDeletePaymentRecord={onDeleteTenantPayment}
      />

      <TenantReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedPaymentRecordForReceipt(null);
        }}
        tenant={selectedTenantForReceipt}
        paymentRecord={selectedPaymentRecordForReceipt}
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
                  onClick={() => setIsReportModalOpen(false)}
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
                      mosqueProfile.kota || '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    {mosqueProfile.telepon ? ` • Telp: ${mosqueProfile.telepon}` : ''}
                  </p>
                  {mosqueProfile.nomorRekening && (
                    <p className="text-[11px] text-slate-500 italic">
                      Rek. Infaq/Kas: {mosqueProfile.namaBank || 'Bank'} {mosqueProfile.nomorRekening} a.n{' '}
                      {mosqueProfile.anRekening || mosqueProfile.namaMasjid}
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
                        <th className="py-2.5 px-2 border-r border-slate-300 text-center w-9">NO</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Nama Penyewa</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Objek Lahan</th>
                        <th className="py-2.5 px-3 text-right border-r border-slate-300">Tagihan</th>
                        <th className="py-2.5 px-3 text-right border-r border-slate-300 text-blue-950">
                          Bayar
                        </th>
                        <th className="py-2.5 px-3 text-right border-r border-slate-300 text-amber-950">
                          Potongan
                        </th>
                        <th className="py-2.5 px-3 text-right border-r border-slate-300 text-emerald-950">
                          Jumlah Setelah Dipotong
                        </th>
                        <th className="py-2.5 px-2.5 text-center w-28">Status</th>
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
                          const d = getTenantRekapData(
                            t,
                            rekapPeriodMode,
                            rekapSelectedMonth,
                            rekapSelectedYear
                          );

                          return (
                            <tr key={t.id} className="hover:bg-slate-50 bg-white">
                              <td className="py-2.5 px-2 text-center font-medium text-slate-600 border-r border-slate-200">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200">
                                <strong className="text-slate-900 block font-semibold text-xs">
                                  {t.namaPenyewa}
                                </strong>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {t.nomorTelepon || '-'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200">
                                <span className="font-semibold text-slate-800 block text-xs">
                                  {t.namaLahan}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {t.peruntukanUsaha || '-'}
                                  {t.luasLahan ? ` (${t.luasLahan})` : ''}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 border-r border-slate-200">
                                Rp {d.targetTarifAsli.toLocaleString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-900 border-r border-slate-200">
                                {d.nilaiBayar > 0 ? (
                                  `Rp ${d.nilaiBayar.toLocaleString('id-ID')}`
                                ) : (
                                  <span className="text-slate-400 font-normal">-----</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-900 border-r border-slate-200">
                                {d.nilaiPotongan > 0 ? (
                                  `Rp ${d.nilaiPotongan.toLocaleString('id-ID')}`
                                ) : (
                                  <span className="text-slate-400 font-normal">-----</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900 border-r border-slate-200">
                                {d.nilaiSetelahPotong > 0 ? (
                                  `Rp ${d.nilaiSetelahPotong.toLocaleString('id-ID')}`
                                ) : (
                                  <span className="text-slate-400 font-normal">-----</span>
                                )}
                              </td>
                              <td className="py-2.5 px-2.5 text-center">
                                {d.status === 'lunas' && (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    Lunas
                                  </span>
                                )}
                                {d.status === 'cicilan' && (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    Kurang Bayar
                                  </span>
                                )}
                                {d.status === 'belum_bayar' && (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                    Belum Bayar
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                        <td colSpan={3} className="py-2.5 px-3 text-right border-r border-slate-300 uppercase tracking-wider text-[11px]">
                          TOTAL KESELURUHAN:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-300 text-xs">
                          Rp {rekapStats.totalTagihan.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-950 border-r border-slate-300 text-xs">
                          Rp {rekapStats.totalBayar.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-950 border-r border-slate-300 text-xs">
                          Rp {rekapStats.totalPotongan.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-950 border-r border-slate-300 text-xs">
                          Rp {rekapStats.totalSetelahDipotong.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-2.5 text-center text-[10px] font-bold text-slate-700">
                          {rekapStats.countLunas}/{rekapStats.totalPenyewa} Lunas
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Summary Ringkasan Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-300 p-3.5 rounded-lg text-xs">
                  <div className="border-b sm:border-b-0 sm:border-r border-slate-300 pb-2.5 sm:pb-0 sm:pr-2.5">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Total Tagihan (Tarif Asli):</p>
                    <p className="text-sm font-mono font-extrabold text-slate-900 mt-0.5">
                      Rp {rekapStats.totalTagihan.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {rekapStats.totalPenyewa} Total Objek Sewa
                    </p>
                  </div>
                  <div className="border-b sm:border-b-0 sm:border-r border-slate-300 pb-2.5 sm:pb-0 sm:pr-2.5">
                    <p className="text-[10px] uppercase font-bold text-emerald-800">Jumlah Setelah Dipotong (Kas Masuk):</p>
                    <p className="text-sm font-mono font-extrabold text-emerald-950 mt-0.5">
                      Rp {rekapStats.totalSetelahDipotong.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      {rekapStats.countLunas} Lunas • Potongan: Rp {rekapStats.totalPotongan.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-rose-800">Sisa Belum Bayar (Piutang):</p>
                    <p className="text-sm font-mono font-extrabold text-rose-950 mt-0.5">
                      Rp {rekapStats.totalBelumBayar.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                      {rekapStats.countBelumBayar} Belum Bayar Sama Sekali
                    </p>
                  </div>
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
                      {titimangsaKota},{' '}
                      {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
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
