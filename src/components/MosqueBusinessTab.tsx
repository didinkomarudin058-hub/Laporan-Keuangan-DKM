import React, { useState, useMemo } from 'react';
import {
  Store,
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
  TrendingDown,
  DollarSign,
  Tag,
  UserCheck,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  X,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  Receipt,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import {
  MosqueBusinessUnit,
  BusinessRecord,
  MosqueProfile,
  FundCategory,
  PaymentMethod,
  Transaction,
  LandTenant,
} from '../types';
import { TenantModal } from './TenantModal';
import { TenantPaymentModal } from './TenantPaymentModal';
import { TenantReceiptModal } from './TenantReceiptModal';

interface MosqueBusinessTabProps {
  businessUnits: MosqueBusinessUnit[];
  businessRecords: BusinessRecord[];
  landTenants?: LandTenant[];
  mosqueProfile: MosqueProfile;
  posDanaList: string[];
  metodePembayaranList: string[];
  onAddUnit: (unit: Omit<MosqueBusinessUnit, 'id'>) => void;
  onEditUnit: (id: string, unit: Omit<MosqueBusinessUnit, 'id'>) => void;
  onDeleteUnit: (id: string) => void;
  onAddRecord: (
    record: Omit<BusinessRecord, 'id'>,
    autoPushToTransactions: boolean
  ) => void;
  onEditRecord: (id: string, record: Partial<BusinessRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onPushRecordToTransaction: (recordId: string) => void;
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
  businessUnits,
  businessRecords,
  landTenants = [],
  mosqueProfile,
  posDanaList,
  metodePembayaranList,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onPushRecordToTransaction,
  onAddTenant,
  onEditTenant,
  onDeleteTenant,
  onPayTenantRent,
  onNavigateToTransactions,
}) => {
  const [activeSubView, setActiveSubView] = useState<'records' | 'tenants' | 'units'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnitId, setFilterUnitId] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'sudah_masuk_kas' | 'belum_disetor'>('semua');
  const [tenantStatusFilter, setTenantStatusFilter] = useState<'semua' | 'aktif' | 'hampir_habis' | 'menunggak' | 'selesai'>('semua');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BusinessRecord | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MosqueBusinessUnit | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Tenant Modals
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<LandTenant | null>(null);

  const [isPayRentModalOpen, setIsPayRentModalOpen] = useState(false);
  const [payingTenant, setPayingTenant] = useState<LandTenant | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptTenant, setReceiptTenant] = useState<LandTenant | null>(null);

  // Form State for Business Record Modal
  const [recordForm, setRecordForm] = useState<{
    unitId: string;
    tanggal: string;
    periode: string;
    pendapatanKotor: number | string;
    biayaOperasional: number | string;
    setoranKasMasjid: number | string;
    posDanaTujuan: string;
    metodePembayaran: string;
    keterangan: string;
    petugas: string;
    autoPushToKas: boolean;
  }>({
    unitId: businessUnits[0]?.id || '',
    tanggal: new Date().toISOString().split('T')[0],
    periode: `Agustus ${new Date().getFullYear()}`,
    pendapatanKotor: '',
    biayaOperasional: '',
    setoranKasMasjid: '',
    posDanaTujuan: 'Kas Operasional',
    metodePembayaran: 'Tunai',
    keterangan: '',
    petugas: mosqueProfile.bendaharaDKM || '',
    autoPushToKas: true,
  });

  // Form State for Business Unit Modal
  const [unitForm, setUnitForm] = useState<{
    nama: string;
    kategori: 'sewa_aset' | 'perdagangan' | 'jasa' | 'lainnya';
    penanggungJawab: string;
    kontak: string;
    persentaseBagiHasilKas: number | string;
    posDanaTujuan: string;
    keterangan: string;
    status: 'aktif' | 'nonaktif';
  }>({
    nama: '',
    kategori: 'sewa_aset',
    penanggungJawab: '',
    kontak: '',
    persentaseBagiHasilKas: 100,
    posDanaTujuan: 'Kas Operasional',
    keterangan: '',
    status: 'aktif',
  });

  // Financial Calculations for Records
  const totalOmzet = useMemo(() => {
    return businessRecords.reduce((acc, r) => acc + (r.pendapatanKotor || 0), 0);
  }, [businessRecords]);

  const totalBiaya = useMemo(() => {
    return businessRecords.reduce((acc, r) => acc + (r.biayaOperasional || 0), 0);
  }, [businessRecords]);

  const totalLabaBersih = useMemo(() => {
    return businessRecords.reduce((acc, r) => acc + (r.labaBersih || 0), 0);
  }, [businessRecords]);

  const totalMasukKas = useMemo(() => {
    return businessRecords
      .filter((r) => r.statusSetor === 'sudah_masuk_kas')
      .reduce((acc, r) => acc + (r.setoranKasMasjid || 0), 0);
  }, [businessRecords]);

  const totalPendingSetor = useMemo(() => {
    return businessRecords
      .filter((r) => r.statusSetor === 'belum_disetor')
      .reduce((acc, r) => acc + (r.setoranKasMasjid || 0), 0);
  }, [businessRecords]);

  // Tenant Metrics
  const tenantMetrics = useMemo(() => {
    const totalCount = landTenants.length;
    const activeCount = landTenants.filter((t) => t.statusKontrak === 'aktif').length;
    const warningCount = landTenants.filter((t) => t.statusKontrak === 'hampir_habis' || t.statusKontrak === 'menunggak').length;
    const totalPotentialMonthly = landTenants.reduce((acc, t) => {
      if (t.statusKontrak === 'selesai') return acc;
      if (t.tipePeriode === 'bulanan') return acc + t.tarifSewa;
      if (t.tipePeriode === 'tahunan') return acc + Math.round(t.tarifSewa / 12);
      return acc;
    }, 0);
    const totalCollected = landTenants.reduce((acc, t) => acc + (t.totalTerbayar || 0), 0);

    return { totalCount, activeCount, warningCount, totalPotentialMonthly, totalCollected };
  }, [landTenants]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return businessRecords.filter((r) => {
      const matchSearch =
        r.unitNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.petugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.periode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchUnit = filterUnitId === 'semua' || r.unitId === filterUnitId;
      const matchStatus = filterStatus === 'semua' || r.statusSetor === filterStatus;

      return matchSearch && matchUnit && matchStatus;
    });
  }, [businessRecords, searchQuery, filterUnitId, filterStatus]);

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    return landTenants.filter((t) => {
      const matchSearch =
        t.namaPenyewa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.namaLahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.peruntukanUsaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.nomorTelepon && t.nomorTelepon.includes(searchQuery)) ||
        (t.lokasiLahan && t.lokasiLahan.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        tenantStatusFilter === 'semua' || t.statusKontrak === tenantStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [landTenants, searchQuery, tenantStatusFilter]);

  // Handlers for Record Modal
  const handleOpenNewRecord = (preselectedUnitId?: string) => {
    const defaultUnit = businessUnits.find((u) => u.id === preselectedUnitId) || businessUnits[0];
    setEditingRecord(null);
    setRecordForm({
      unitId: defaultUnit ? defaultUnit.id : '',
      tanggal: new Date().toISOString().split('T')[0],
      periode: `Periode ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      pendapatanKotor: '',
      biayaOperasional: '',
      setoranKasMasjid: '',
      posDanaTujuan: defaultUnit ? defaultUnit.posDanaTujuan : 'Kas Operasional',
      metodePembayaran: 'Tunai',
      keterangan: '',
      petugas: defaultUnit ? defaultUnit.penanggungJawab : mosqueProfile.bendaharaDKM || '',
      autoPushToKas: true,
    });
    setIsRecordModalOpen(true);
  };

  const handleOpenEditRecord = (record: BusinessRecord) => {
    setEditingRecord(record);
    setRecordForm({
      unitId: record.unitId,
      tanggal: record.tanggal,
      periode: record.periode,
      pendapatanKotor: record.pendapatanKotor,
      biayaOperasional: record.biayaOperasional,
      setoranKasMasjid: record.setoranKasMasjid,
      posDanaTujuan: record.posDanaTujuan,
      metodePembayaran: record.metodePembayaran,
      keterangan: record.keterangan,
      petugas: record.petugas,
      autoPushToKas: record.statusSetor === 'sudah_masuk_kas',
    });
    setIsRecordModalOpen(true);
  };

  const handleSaveRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = businessUnits.find((u) => u.id === recordForm.unitId);
    if (!unit) return;

    const pendapatanKotor = Number(recordForm.pendapatanKotor) || 0;
    const biayaOperasional = Number(recordForm.biayaOperasional) || 0;
    const labaBersih = pendapatanKotor - biayaOperasional;
    const setoranKasMasjid = Number(recordForm.setoranKasMasjid) || 0;

    if (editingRecord) {
      onEditRecord(editingRecord.id, {
        unitId: unit.id,
        unitNama: unit.nama,
        tanggal: recordForm.tanggal,
        periode: recordForm.periode,
        pendapatanKotor,
        biayaOperasional,
        labaBersih,
        setoranKasMasjid,
        posDanaTujuan: recordForm.posDanaTujuan,
        metodePembayaran: recordForm.metodePembayaran,
        keterangan: recordForm.keterangan,
        petugas: recordForm.petugas,
      });
    } else {
      onAddRecord(
        {
          unitId: unit.id,
          unitNama: unit.nama,
          tanggal: recordForm.tanggal,
          periode: recordForm.periode,
          pendapatanKotor,
          biayaOperasional,
          labaBersih,
          setoranKasMasjid,
          posDanaTujuan: recordForm.posDanaTujuan,
          metodePembayaran: recordForm.metodePembayaran,
          statusSetor: recordForm.autoPushToKas ? 'sudah_masuk_kas' : 'belum_disetor',
          keterangan: recordForm.keterangan,
          petugas: recordForm.petugas,
        },
        recordForm.autoPushToKas
      );
    }

    setIsRecordModalOpen(false);
  };

  // Handlers for Unit Modal
  const handleOpenNewUnit = () => {
    setEditingUnit(null);
    setUnitForm({
      nama: '',
      kategori: 'sewa_aset',
      penanggungJawab: '',
      kontak: '',
      persentaseBagiHasilKas: 100,
      posDanaTujuan: 'Kas Operasional',
      keterangan: '',
      status: 'aktif',
    });
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit: MosqueBusinessUnit) => {
    setEditingUnit(unit);
    setUnitForm({
      nama: unit.nama,
      kategori: unit.kategori,
      penanggungJawab: unit.penanggungJawab,
      kontak: unit.kontak || '',
      persentaseBagiHasilKas: unit.persentaseBagiHasilKas,
      posDanaTujuan: unit.posDanaTujuan,
      keterangan: unit.keterangan,
      status: unit.status,
    });
    setIsUnitModalOpen(true);
  };

  const handleSaveUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.nama.trim()) return;

    if (editingUnit) {
      onEditUnit(editingUnit.id, {
        nama: unitForm.nama.trim(),
        kategori: unitForm.kategori,
        penanggungJawab: unitForm.penanggungJawab.trim(),
        kontak: unitForm.kontak.trim(),
        persentaseBagiHasilKas: Number(unitForm.persentaseBagiHasilKas) || 100,
        posDanaTujuan: unitForm.posDanaTujuan,
        keterangan: unitForm.keterangan.trim(),
        status: unitForm.status,
      });
    } else {
      onAddUnit({
        nama: unitForm.nama.trim(),
        kategori: unitForm.kategori,
        penanggungJawab: unitForm.penanggungJawab.trim(),
        kontak: unitForm.kontak.trim(),
        persentaseBagiHasilKas: Number(unitForm.persentaseBagiHasilKas) || 100,
        posDanaTujuan: unitForm.posDanaTujuan,
        keterangan: unitForm.keterangan.trim(),
        status: unitForm.status,
      });
    }

    setIsUnitModalOpen(false);
  };

  // Handlers for Tenants
  const handleOpenNewTenant = () => {
    setEditingTenant(null);
    setIsTenantModalOpen(true);
  };

  const handleOpenEditTenant = (tenant: LandTenant) => {
    setEditingTenant(tenant);
    setIsTenantModalOpen(true);
  };

  const handleOpenPayRent = (tenant: LandTenant) => {
    setPayingTenant(tenant);
    setIsPayRentModalOpen(true);
  };

  const handleOpenReceipt = (tenant: LandTenant) => {
    setReceiptTenant(tenant);
    setIsReceiptModalOpen(true);
  };

  const getTenantStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Aktif & Berjalan</span>
          </span>
        );
      case 'hampir_habis':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Jatuh Tempo Segera</span>
          </span>
        );
      case 'menunggak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Menunggak / Belum Bayar</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-300">
            <span>Selesai / Berakhir</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Title Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md shrink-0">
            <Store className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Unit Usaha & Pengelolaan Aset Masjid
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Sewa Lahan & Produktivitas DKM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Manajemen sewa tanah & kavling wakaf produktif, pencatatan penyewa, tagihan sewa bulanan/tahunan, serta pembukuan hasil usaha DKM yang disetor langsung ke Kas Masjid.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleOpenNewTenant}
            className="px-3.5 py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-300 stroke-[2.5]" />
            <span>+ Tambah Penyewa Tanah</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenNewRecord()}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
            <span>Catat Hasil Usaha</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Penyewa Tanah / Aset */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Penyewa Tanah & Aset
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2 font-mono">
            {tenantMetrics.totalCount} <span className="text-xs font-sans font-semibold text-slate-500">Kavling</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-700 font-bold">{tenantMetrics.activeCount} Aktif</span>
            {tenantMetrics.warningCount > 0 && (
              <span className="text-amber-600 font-bold">• {tenantMetrics.warningCount} Perlu Perhatian</span>
            )}
          </p>
        </div>

        {/* Card 2: Estimasi Potensi Sewa */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Potensi Sewa / Bulan
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-2 font-mono">
            Rp {tenantMetrics.totalPotentialMonthly.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dari kavling tanah wakaf & kios aktif
          </p>
        </div>

        {/* Card 3: Total Omzet Usaha Keseluruhan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Omzet Usaha DKM
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-600 mt-2 font-mono">
            Rp {totalOmzet.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Laba Bersih: Rp {totalLabaBersih.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Card 4: Masuk ke Kas Transaksi Masjid */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Disetor ke Kas Masjid
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-700/60 text-amber-300 flex items-center justify-center border border-emerald-600/50">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white mt-2 font-mono">
            Rp {totalMasukKas.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-200 mt-1">
            <span>Masuk ke Jurnal Kas Utama</span>
            {totalPendingSetor > 0 && (
              <span className="text-amber-300 font-bold">
                (Pending: Rp {totalPendingSetor.toLocaleString('id-ID')})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sub-view switcher & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Sub tabs navigation */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start flex-wrap gap-1">
            {/* SubTab 1: Catatan Hasil Usaha */}
            <button
              type="button"
              onClick={() => setActiveSubView('records')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'records'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Catatan Hasil & Setoran ({businessRecords.length})</span>
            </button>

            {/* SubTab 2: Penyewa Tanah & Lahan Wakaf */}
            <button
              type="button"
              onClick={() => setActiveSubView('tenants')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'tenants'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Penyewa Tanah & Aset ({landTenants.length})</span>
              {landTenants.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-slate-950 font-black">
                  NEW
                </span>
              )}
            </button>

            {/* SubTab 3: Daftar Unit Usaha */}
            <button
              type="button"
              onClick={() => setActiveSubView('units')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'units'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Daftar Unit Usaha ({businessUnits.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeSubView === 'tenants'
                  ? 'Cari penyewa, kavling, no hp...'
                  : 'Cari catatan, unit, periode...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Filter Row for Records Sub-view */}
        {activeSubView === 'records' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1 text-slate-500 font-bold mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            <select
              value={filterUnitId}
              onChange={(e) => setFilterUnitId(e.target.value)}
              aria-label="Filter Unit Usaha"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="semua">Semua Unit Usaha</option>
              {businessUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              aria-label="Filter Status Setoran"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="semua">Semua Status Setoran</option>
              <option value="sudah_masuk_kas">✓ Sudah Masuk Transaksi Kas</option>
              <option value="belum_disetor">⏳ Belum Disetor (Perlu Masuk Kas)</option>
            </select>
          </div>
        )}

        {/* Filter Row for Tenants Sub-view */}
        {activeSubView === 'tenants' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-slate-500 font-bold mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Status Kontrak:</span>
              </div>

              <select
                value={tenantStatusFilter}
                onChange={(e) => setTenantStatusFilter(e.target.value as any)}
                aria-label="Filter Status Kontrak Penyewa"
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="semua">Semua Status ({landTenants.length})</option>
                <option value="aktif">✓ Aktif ({landTenants.filter(t => t.statusKontrak === 'aktif').length})</option>
                <option value="hampir_habis">⚠️ Hampir Habis ({landTenants.filter(t => t.statusKontrak === 'hampir_habis').length})</option>
                <option value="menunggak">❌ Menunggak ({landTenants.filter(t => t.statusKontrak === 'menunggak').length})</option>
                <option value="selesai">⚪ Selesai ({landTenants.filter(t => t.statusKontrak === 'selesai').length})</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenNewTenant}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Tambah Penyewa Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: PENYEWA TANAH & LAHAN WAKAF MASJID                           */}
      {/* ========================================================================= */}
      {activeSubView === 'tenants' && (
        <div className="space-y-4">
          {/* Akumulasi Summary Banner */}
          {landTenants.length > 0 && (
            <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      Akumulasi Penerimaan Sewa Tanah
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                      Unit Usaha Sewa Tanah (UNIT-00)
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Setiap pembayaran dari penyewa tanah otomatis terakumulasi ke unit usaha & transaksi Kas DKM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 self-stretch sm:self-auto justify-around sm:justify-end">
                <div>
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                    Total Terkumpul
                  </span>
                  <span className="text-sm sm:text-base font-mono font-black text-amber-300">
                    Rp {landTenants.reduce((acc, t) => acc + (t.totalTerbayar || 0), 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                    Penyewa Aktif
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white font-mono">
                    {landTenants.filter((t) => t.statusKontrak === 'aktif').length} / {landTenants.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {filteredTenants.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center shadow-xs">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 mx-auto mb-3">
                <UserCheck className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Belum Ada Data Penyewa Tanah
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Tambahkan data penyewa kavling tanah wakaf, lahan warung/kios sekitar masjid untuk mengelola masa kontrak dan pembayaran sewa secara tertib.
              </p>
              <button
                type="button"
                onClick={handleOpenNewTenant}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Penyewa Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900">
                            {tenant.namaPenyewa}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{tenant.namaLahan}</span>
                        </p>
                      </div>
                      <div>{getTenantStatusBadge(tenant.statusKontrak)}</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 text-xs">
                    {/* Peruntukan & Luas */}
                    <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Peruntukan:</span>
                        <span className="font-bold text-slate-800 text-right">
                          {tenant.peruntukanUsaha}
                        </span>
                      </div>
                      {tenant.luasLahan && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Luas Lahan:</span>
                          <span className="font-bold text-slate-700">{tenant.luasLahan}</span>
                        </div>
                      )}
                      {tenant.lokasiLahan && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Lokasi:</span>
                          <span className="text-slate-600 text-right truncate max-w-[180px]">
                            {tenant.lokasiLahan}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tarif & Siklus */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Tarif Sewa
                        </span>
                        <span className="text-sm font-mono font-extrabold text-emerald-800">
                          Rp {tenant.tarifSewa.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {' '}/ {tenant.tipePeriode}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Pos Dana
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {tenant.posDanaTujuan || 'Kas Pembangunan'}
                        </span>
                      </div>
                    </div>

                    {/* Akumulasi Pembayaran Masuk Unit Usaha */}
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
                          Akumulasi Masuk Unit Usaha
                        </span>
                        <span className="text-xs font-mono font-extrabold text-emerald-950">
                          Rp {(tenant.totalTerbayar || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Terakumulasi
                      </span>
                    </div>

                    {/* Masa Kontrak & Terakhir Bayar */}
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Masa Berlaku:</span>
                        </span>
                        <span className="font-semibold text-slate-800">
                          {new Date(tenant.tanggalMulai).toLocaleDateString('id-ID')} s/d{' '}
                          {new Date(tenant.tanggalSelesai).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Kontak:</span>
                        </span>
                        <span className="font-medium text-slate-700">
                          {tenant.nomorTelepon || '-'}
                        </span>
                      </div>

                      {tenant.terakhirBayar && (
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-emerald-700 font-bold">Terakhir Bayar:</span>
                          <span className="font-bold text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px]">
                            {new Date(tenant.terakhirBayar).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>

                    {tenant.catatan && (
                      <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg italic line-clamp-2">
                        "{tenant.catatan}"
                      </p>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenPayRent(tenant)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs flex-1 justify-center"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-300 stroke-[2.5]" />
                      <span>Bayar Sewa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReceipt(tenant)}
                      title="Cetak Kwitansi Sewa"
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
                    >
                      <Receipt className="w-4 h-4 text-emerald-700" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditTenant(tenant)}
                      title="Edit Data Penyewa"
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-slate-600" />
                    </button>

                    {onDeleteTenant && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Hapus data penyewa "${tenant.namaPenyewa}" (${tenant.namaLahan})?`
                            )
                          ) {
                            onDeleteTenant(tenant.id);
                          }
                        }}
                        title="Hapus Penyewa"
                        className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: CATATAN HASIL & SETORAN USAHA (RECORDS)                       */}
      {/* ========================================================================= */}
      {activeSubView === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Buku Catatan Hasil & Setoran Unit Usaha
              </h3>
              <p className="text-xs text-slate-500">
                Rekap laba bersih & status masuk ke Jurnal Transaksi Kas Masjid
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenNewRecord()}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Hasil Baru</span>
            </button>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Tidak ada catatan hasil usaha yang sesuai dengan filter atau pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tanggal & Periode</th>
                    <th className="py-3 px-4">Unit Usaha</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-right">Pendapatan Kotor</th>
                    <th className="py-3 px-4 text-right">Biaya / Modal</th>
                    <th className="py-3 px-4 text-right">Laba Bersih</th>
                    <th className="py-3 px-4 text-right">Setoran ke Kas</th>
                    <th className="py-3 px-4 text-center">Status Kas</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {new Date(record.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">{record.periode}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">
                          {record.unitNama}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Petugas: {record.petugas}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                        {record.keterangan || '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        Rp {record.pendapatanKotor.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-rose-600">
                        Rp {record.biayaOperasional.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                        Rp {record.labaBersih.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800 bg-emerald-50/40">
                        Rp {record.setoranKasMasjid.toLocaleString('id-ID')}
                        <span className="block text-[9px] font-sans font-semibold text-slate-400">
                          {record.posDanaTujuan}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {record.statusSetor === 'sudah_masuk_kas' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Sudah Masuk Kas</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onPushRecordToTransaction(record.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition cursor-pointer shadow-2xs"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Setor ke Kas</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRecord(record)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Hapus catatan hasil usaha ini?')) {
                                onDeleteRecord(record.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: DAFTAR UNIT USAHA DKM                                         */}
      {/* ========================================================================= */}
      {activeSubView === 'units' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Unit & Bidang Usaha Produktif DKM
              </h3>
              <p className="text-xs text-slate-500">
                Kelola unit bisnis, persentase bagi hasil, dan penanggung jawab
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewUnit}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Unit Usaha Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessUnits.map((unit) => {
              const isLandRental = unit.kategori === 'sewa_aset' || /sewa|tanah|lahan/i.test(unit.nama);
              const relatedTenantsCount = isLandRental ? landTenants.length : 0;
              const unitRecords = businessRecords.filter(
                (r) => r.unitId === unit.id || (unit.id === 'UNIT-00' && /sewa|tanah|lahan/i.test(r.unitNama))
              );
              const unitOmzet = unitRecords.reduce((acc, r) => acc + (r.pendapatanKotor || 0), 0);
              const unitDisetorKas = unitRecords
                .filter((r) => r.statusSetor === 'sudah_masuk_kas')
                .reduce((acc, r) => acc + (r.setoranKasMasjid || 0), 0);
              const unitPendingKas = unitRecords
                .filter((r) => r.statusSetor === 'belum_disetor')
                .reduce((acc, r) => acc + (r.setoranKasMasjid || 0), 0);

              return (
                <div
                  key={unit.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{unit.nama}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Kategori: {unit.kategori.replace('_', ' ')}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          unit.status === 'aktif'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {unit.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {unit.keterangan || 'Unit usaha operasional mandiri DKM.'}
                    </p>

                    {/* Akumulasi Keuangan Unit Usaha */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/80 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-950 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Akumulasi Omzet / Sewa:</span>
                        </span>
                        <span className="font-mono font-black text-emerald-900 text-sm">
                          Rp {unitOmzet.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-600">Disetor ke Kas Masjid:</span>
                        <span className="font-mono font-bold text-emerald-800">
                          Rp {unitDisetorKas.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {unitPendingKas > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <span>Belum Masuk Kas:</span>
                          <span className="font-mono font-bold">
                            Rp {unitPendingKas.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between">
                        <span>{unitRecords.length} Catatan Pembukuan</span>
                        {isLandRental && (
                          <span className="font-bold text-teal-800">
                            {relatedTenantsCount} Penyewa Terdata
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Land Rental Special Banner */}
                    {isLandRental && (
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-teal-900 block">
                            Kelola Penyewa Tanah / Aset
                          </span>
                          <span className="text-[11px] text-teal-700">
                            {relatedTenantsCount} Penyewa Terdaftar
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleOpenNewTenant}
                            className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow-2xs"
                          >
                            + Penyewa
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSubView('tenants')}
                            className="px-2.5 py-1 bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            Lihat
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Penanggung Jawab:</span>
                        <span className="font-bold text-slate-800 text-right">
                          {unit.penanggungJawab}
                        </span>
                      </div>
                      {unit.kontak && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Kontak:</span>
                          <span className="font-medium text-slate-700">{unit.kontak}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Bagi Hasil Kas:</span>
                        <span className="font-extrabold text-emerald-700">
                          {unit.persentaseBagiHasilKas}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Pos Kas Tujuan:</span>
                        <span className="font-bold text-slate-800">{unit.posDanaTujuan}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenNewRecord(unit.id)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Hasil Unit</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditUnit(unit)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus unit usaha "${unit.nama}"?`)) {
                            onDeleteUnit(unit.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CATAT HASIL USAHA MODAL                                          */}
      {/* ========================================================================= */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
                  <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingRecord ? 'Edit Catatan Hasil Usaha' : 'Catat Pendapatan & Hasil Usaha'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Bagi hasil & setoran langsung ke Jurnal Transaksi Kas DKM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecordSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Unit Usaha DKM <span className="text-rose-500">*</span>
                </label>
                <select
                  value={recordForm.unitId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const unit = businessUnits.find((u) => u.id === selectedId);
                    setRecordForm((prev) => ({
                      ...prev,
                      unitId: selectedId,
                      posDanaTujuan: unit?.posDanaTujuan || prev.posDanaTujuan,
                      petugas: unit?.penanggungJawab || prev.petugas,
                    }));
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                >
                  {businessUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.persentaseBagiHasilKas}% Bagi Hasil Kas)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={recordForm.tanggal}
                    onChange={(e) => setRecordForm({ ...recordForm, tanggal: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Periode Pembukuan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pekan I Agustus 2026"
                    value={recordForm.periode}
                    onChange={(e) => setRecordForm({ ...recordForm, periode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pendapatan Kotor / Omzet (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={recordForm.pendapatanKotor}
                    onChange={(e) => {
                      const val = e.target.value;
                      const kotor = Number(val) || 0;
                      const biaya = Number(recordForm.biayaOperasional) || 0;
                      const laba = Math.max(0, kotor - biaya);
                      const unit = businessUnits.find((u) => u.id === recordForm.unitId);
                      const pct = unit ? unit.persentaseBagiHasilKas : 100;
                      const setor = Math.round((laba * pct) / 100);
                      setRecordForm((prev) => ({
                        ...prev,
                        pendapatanKotor: val,
                        setoranKasMasjid: setor,
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biaya Operasional / Modal (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={recordForm.biayaOperasional}
                    onChange={(e) => {
                      const val = e.target.value;
                      const kotor = Number(recordForm.pendapatanKotor) || 0;
                      const biaya = Number(val) || 0;
                      const laba = Math.max(0, kotor - biaya);
                      const unit = businessUnits.find((u) => u.id === recordForm.unitId);
                      const pct = unit ? unit.persentaseBagiHasilKas : 100;
                      const setor = Math.round((laba * pct) / 100);
                      setRecordForm((prev) => ({
                        ...prev,
                        biayaOperasional: val,
                        setoranKasMasjid: setor,
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
                  <span>Jumlah yang Disetor ke Kas Masjid (Rp):</span>
                  <span className="font-mono text-sm">
                    Rp {Number(recordForm.setoranKasMasjid || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={recordForm.setoranKasMasjid}
                  onChange={(e) => setRecordForm({ ...recordForm, setoranKasMasjid: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono font-extrabold text-emerald-950 bg-white border border-emerald-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pos Dana Kas Tujuan
                  </label>
                  <select
                    value={recordForm.posDanaTujuan}
                    onChange={(e) => setRecordForm({ ...recordForm, posDanaTujuan: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {posDanaList.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={recordForm.metodePembayaran}
                    onChange={(e) => setRecordForm({ ...recordForm, metodePembayaran: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {metodePembayaranList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Uraian
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sewa Aula Walimah Keluarga Bpk. Sastro"
                  value={recordForm.keterangan}
                  onChange={(e) => setRecordForm({ ...recordForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  {editingRecord ? 'Simpan Perubahan' : 'Catat & Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UNIT USAHA MODAL                                                 */}
      {/* ========================================================================= */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
                  <Building2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingUnit ? 'Edit Unit Usaha' : 'Tambah Unit Usaha Baru'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Definisi unit bisnis & bagi hasil kas DKM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnitSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Unit Usaha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sewa Tanah & Lahan Wakaf Masjid"
                  value={unitForm.nama}
                  onChange={(e) => setUnitForm({ ...unitForm, nama: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Bidang
                  </label>
                  <select
                    value={unitForm.kategori}
                    onChange={(e) => setUnitForm({ ...unitForm, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                  >
                    <option value="sewa_aset">Sewa Tanah / Aset</option>
                    <option value="perdagangan">Perdagangan / Kantin</option>
                    <option value="jasa">Jasa / AMDK / Parkir</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    % Bagi Hasil Kas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={unitForm.persentaseBagiHasilKas}
                    onChange={(e) => setUnitForm({ ...unitForm, persentaseBagiHasilKas: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penanggung Jawab / Pengelola
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. H. Rahmat Hidayat (Sie Aset)"
                  value={unitForm.penanggungJawab}
                  onChange={(e) => setUnitForm({ ...unitForm, penanggungJawab: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kontak / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-3344-5566"
                  value={unitForm.kontak}
                  onChange={(e) => setUnitForm({ ...unitForm, kontak: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Uraian operasional unit..."
                  value={unitForm.keterangan}
                  onChange={(e) => setUnitForm({ ...unitForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  {editingUnit ? 'Simpan Perubahan' : 'Tambah Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CETAK REKAP USAHA MODAL                                          */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
              <span className="text-xs font-bold flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Pratinjau Cetak Rekap Usaha & Sewa Lahan</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 bg-white text-slate-900 font-sans space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="text-xl font-bold uppercase tracking-wide text-emerald-950">
                  {mosqueProfile.namaMasjid}
                </h2>
                <p className="text-xs font-bold text-slate-700">
                  LAPORAN REKAPITULASI HASIL USAHA & SEWA LAHAN WAKAF
                </p>
                <p className="text-[11px] text-slate-500">
                  {mosqueProfile.alamat}, {mosqueProfile.kota} • Telp: {mosqueProfile.telepon}
                </p>
              </div>

              {/* Summary Table */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-bold">TOTAL OMZET</span>
                  <strong className="font-mono text-emerald-900">
                    Rp {totalOmzet.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-bold">TOTAL BIAYA</span>
                  <strong className="font-mono text-rose-700">
                    Rp {totalBiaya.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-bold">LABA BERSIH</span>
                  <strong className="font-mono text-amber-700">
                    Rp {totalLabaBersih.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div className="p-2.5 bg-emerald-100 rounded-lg">
                  <span className="text-[10px] text-emerald-800 block font-bold">DISETOR KE KAS</span>
                  <strong className="font-mono text-emerald-950">
                    Rp {totalMasukKas.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>

              {/* Detail Records */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">
                  Daftar Transaksi Pembukuan Hasil Usaha
                </h4>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2 border border-slate-200">Tanggal</th>
                      <th className="p-2 border border-slate-200">Unit Usaha</th>
                      <th className="p-2 border border-slate-200">Keterangan</th>
                      <th className="p-2 border border-slate-200 text-right">Laba Bersih</th>
                      <th className="p-2 border border-slate-200 text-right">Setor Kas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessRecords.map((r) => (
                      <tr key={r.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-200">
                          {new Date(r.tanggal).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-2 border border-slate-200 font-bold">{r.unitNama}</td>
                        <td className="p-2 border border-slate-200">{r.keterangan || '-'}</td>
                        <td className="p-2 border border-slate-200 text-right font-mono">
                          Rp {r.labaBersih.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2 border border-slate-200 text-right font-mono font-bold">
                          Rp {r.setoranKasMasjid.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex items-center justify-between text-xs">
                <div className="text-center">
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold">Ketua DKM</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">{mosqueProfile.ketuaDKM}</p>
                </div>

                <div className="text-center">
                  <p className="text-slate-600">
                    {mosqueProfile.kota.split(',')[0]}, {new Date().toLocaleDateString('id-ID')}
                  </p>
                  <p className="font-bold">Bendahara / Sie Usaha</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">{mosqueProfile.bendaharaDKM}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Specialized Modals */}
      <TenantModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        onSave={(tenantData) => {
          if (editingTenant && onEditTenant) {
            onEditTenant(editingTenant.id, tenantData);
          } else if (onAddTenant) {
            onAddTenant(tenantData);
          }
        }}
        editingTenant={editingTenant}
        businessUnits={businessUnits}
        posDanaList={posDanaList}
      />

      <TenantPaymentModal
        isOpen={isPayRentModalOpen}
        onClose={() => setIsPayRentModalOpen(false)}
        tenant={payingTenant}
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
        tenant={receiptTenant}
        mosqueProfile={mosqueProfile}
      />
    </div>
  );
};
