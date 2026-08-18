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
} from 'lucide-react';
import {
  MosqueBusinessUnit,
  BusinessRecord,
  MosqueProfile,
  FundCategory,
  PaymentMethod,
  Transaction,
} from '../types';

interface MosqueBusinessTabProps {
  businessUnits: MosqueBusinessUnit[];
  businessRecords: BusinessRecord[];
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
  onNavigateToTransactions?: (trxId?: string) => void;
}

export const MosqueBusinessTab: React.FC<MosqueBusinessTabProps> = ({
  businessUnits,
  businessRecords,
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
  onNavigateToTransactions,
}) => {
  const [activeSubView, setActiveSubView] = useState<'records' | 'units'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnitId, setFilterUnitId] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'sudah_masuk_kas' | 'belum_disetor'>('semua');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BusinessRecord | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MosqueBusinessUnit | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

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

  // Financial Calculations
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

  const handleRecordUnitChange = (selectedId: string) => {
    const unit = businessUnits.find((u) => u.id === selectedId);
    if (!unit) return;

    const kotor = Number(recordForm.pendapatanKotor) || 0;
    const biaya = Number(recordForm.biayaOperasional) || 0;
    const laba = Math.max(0, kotor - biaya);
    const calculatedSetor = Math.round((laba * (unit.persentaseBagiHasilKas || 100)) / 100);

    setRecordForm((prev) => ({
      ...prev,
      unitId: selectedId,
      posDanaTujuan: unit.posDanaTujuan || prev.posDanaTujuan,
      petugas: unit.penanggungJawab || prev.petugas,
      setoranKasMasjid: calculatedSetor > 0 ? calculatedSetor : prev.setoranKasMasjid,
    }));
  };

  const handleCalculateSetoran = (kotorVal: number | string, biayaVal: number | string, unitId: string) => {
    const unit = businessUnits.find((u) => u.id === unitId);
    const kotor = Number(kotorVal) || 0;
    const biaya = Number(biayaVal) || 0;
    const laba = Math.max(0, kotor - biaya);
    const percent = unit ? unit.persentaseBagiHasilKas : 100;
    return Math.round((laba * percent) / 100);
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

  const getCategoryBadge = (kategori: string) => {
    switch (kategori) {
      case 'sewa_aset':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Sewa Aset / Aula
          </span>
        );
      case 'perdagangan':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Perdagangan / Kantin
          </span>
        );
      case 'jasa':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            Jasa / AMDK / Parkir
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Usaha DKM
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
                Unit & Hasil Usaha Masjid (DKM Enterprises)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Mandiri & Produktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Pencatatan pendapatan kotor, biaya operasional, dan laba bersih dari unit usaha masjid
              (Sewa Aula, Kantin, Depot Air Minum, Parkir) yang disetor langsung ke Jurnal Transaksi Kas.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Usaha</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewUnit}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer shadow-2xs"
          >
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>+ Unit Usaha Baru</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenNewRecord()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
            <span>Catat Hasil Usaha</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Omzet Pendapatan
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2 font-mono">
            Rp {totalOmzet.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dari {businessRecords.length} catatan pembukuan
          </p>
        </div>

        {/* Card 2: Total Biaya Operasional */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Biaya & Modal Usaha
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-600 mt-2 font-mono">
            Rp {totalBiaya.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bahan baku, kebersihan, listrik, honor pengelola
          </p>
        </div>

        {/* Card 3: Total Laba Bersih */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Laba Bersih Usaha
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-600 mt-2 font-mono">
            Rp {totalLabaBersih.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Margin: {totalOmzet > 0 ? Math.round((totalLabaBersih / totalOmzet) * 100) : 0}% dari omzet
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
            <span>Masuk ke Jurnal Kas DKM</span>
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
          {/* Sub tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
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
              placeholder="Cari catatan, unit, periode..."
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

            {/* Filter Unit */}
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

            {/* Filter Status Setor */}
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

            {(searchQuery || filterUnitId !== 'semua' || filterStatus !== 'semua') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterUnitId('semua');
                  setFilterStatus('semua');
                }}
                className="text-emerald-700 font-bold text-xs hover:underline ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeSubView === 'records' ? (
        /* ================= SUB-VIEW 1: CATATAN HASIL & SETORAN ================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">
                Belum ada catatan hasil usaha yang sesuai filter
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Silakan catat pendapatan kotor dan biaya operasional unit usaha untuk langsung memasukkan labanya ke kas masjid.
              </p>
              <button
                type="button"
                onClick={() => handleOpenNewRecord()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Hasil Usaha Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Tanggal & Periode</th>
                    <th className="py-3 px-4">Unit Usaha & PIC</th>
                    <th className="py-3 px-4 text-right">Omzet Kotor</th>
                    <th className="py-3 px-4 text-right">Biaya Usaha</th>
                    <th className="py-3 px-4 text-right">Laba Bersih</th>
                    <th className="py-3 px-4 text-right">Setoran Kas Masjid</th>
                    <th className="py-3 px-4 text-center">Status Transaksi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => {
                    const unit = businessUnits.find((u) => u.id === record.unitId);

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/70 transition">
                        {/* Tanggal & Periode */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {new Date(record.tanggal).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            {record.periode}
                          </span>
                        </td>

                        {/* Unit Usaha & PIC */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-slate-900">{record.unitNama}</span>
                            {unit && getCategoryBadge(unit.kategori)}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={record.keterangan}>
                            {record.keterangan || `Pengelola: ${record.petugas}`}
                          </p>
                        </td>

                        {/* Omzet Kotor */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                          Rp {record.pendapatanKotor.toLocaleString('id-ID')}
                        </td>

                        {/* Biaya Operasional */}
                        <td className="py-3 px-4 text-right font-mono text-rose-600 font-semibold">
                          -Rp {record.biayaOperasional.toLocaleString('id-ID')}
                        </td>

                        {/* Laba Bersih */}
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-700">
                          Rp {record.labaBersih.toLocaleString('id-ID')}
                        </td>

                        {/* Setoran Kas Masjid */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-mono font-extrabold text-emerald-800 text-sm">
                            Rp {record.setoranKasMasjid.toLocaleString('id-ID')}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            → {record.posDanaTujuan} ({record.metodePembayaran})
                          </span>
                        </td>

                        {/* Status Transaksi Kas */}
                        <td className="py-3 px-4 text-center">
                          {record.statusSetor === 'sudah_masuk_kas' ? (
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                <span>Sudah Masuk Kas</span>
                              </span>
                              {record.transactionIdLinked && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateToTransactions && onNavigateToTransactions(record.transactionIdLinked)}
                                  className="text-[9px] font-mono text-emerald-700 hover:underline cursor-pointer flex items-center gap-0.5"
                                  title="Lihat transaksi di Jurnal"
                                >
                                  <span>{record.transactionIdLinked}</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>Belum Disetor</span>
                              </span>
                              {/* 1-Click Button Masukan ke Transaksi Kas */}
                              <button
                                type="button"
                                onClick={() => onPushRecordToTransaction(record.id)}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="Klik untuk langsung membuat transaksi pemasukan di Kas Masjid"
                              >
                                <ArrowUpRight className="w-3 h-3 text-amber-300 stroke-[3]" />
                                <span>Masukan ke Kas</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRecord(record)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="Edit Catatan Hasil Usaha"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Hapus catatan hasil usaha ${record.unitNama} (${record.periode})?`
                                  )
                                ) {
                                  onDeleteRecord(record.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ================= SUB-VIEW 2: DAFTAR UNIT USAHA ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessUnits.map((unit) => {
            const unitRecords = businessRecords.filter((r) => r.unitId === unit.id);
            const unitOmzet = unitRecords.reduce((sum, r) => sum + r.pendapatanKotor, 0);
            const unitLaba = unitRecords.reduce((sum, r) => sum + r.labaBersih, 0);
            const unitSetor = unitRecords
              .filter((r) => r.statusSetor === 'sudah_masuk_kas')
              .reduce((sum, r) => sum + r.setoranKasMasjid, 0);

            return (
              <div
                key={unit.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getCategoryBadge(unit.kategori)}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          unit.status === 'aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {unit.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {unit.nama}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {unit.keterangan || 'Tidak ada deskripsi'}
                    </p>
                  </div>

                  {/* PIC & Sharing Info */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[11px] text-slate-400">Pengelola (PIC):</span>
                      <span className="font-bold text-slate-800">{unit.penanggungJawab || '-'}</span>
                    </div>
                    {unit.kontak && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[11px] text-slate-400">Kontak:</span>
                        <span className="font-mono text-slate-700 text-[11px]">{unit.kontak}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[11px] text-slate-400">Bagi Hasil Kas:</span>
                      <span className="font-bold text-emerald-700">
                        {unit.persentaseBagiHasilKas}% → {unit.posDanaTujuan}
                      </span>
                    </div>
                  </div>

                  {/* Unit Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                        Total Laba
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        Rp {unitLaba.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="bg-teal-50/50 p-2 rounded-lg border border-teal-100">
                      <span className="text-[10px] text-teal-800 font-bold block uppercase">
                        Masuk Kas
                      </span>
                      <span className="font-mono font-extrabold text-emerald-800 text-xs">
                        Rp {unitSetor.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenNewRecord(unit.id)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer flex-1 justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Catat Hasil</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditUnit(unit)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                      title="Edit Unit Usaha"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus unit usaha ${unit.nama}?`)) {
                          onDeleteUnit(unit.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Unit Usaha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: CATAT HASIL USAHA ================= */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <Coins className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingRecord ? 'Edit Catatan Hasil Usaha' : 'Catat Hasil Usaha & Setoran Kas'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Kalkulasi laba bersih usaha dan masukkan ke transaksi kas masjid
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecordSubmit} className="space-y-3.5 text-xs">
              {/* Unit Usaha Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Unit Usaha <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={recordForm.unitId}
                  onChange={(e) => handleRecordUnitChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {businessUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.persentaseBagiHasilKas}% Bagi Hasil Kas)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal & Periode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Transaksi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={recordForm.tanggal}
                    onChange={(e) => setRecordForm({ ...recordForm, tanggal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Label Periode / Keterangan Waktu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pekan I Agustus 2026"
                    value={recordForm.periode}
                    onChange={(e) => setRecordForm({ ...recordForm, periode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Financial Inputs: Pendapatan Kotor & Biaya Operasional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
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
                      const calculated = handleCalculateSetoran(
                        val,
                        recordForm.biayaOperasional,
                        recordForm.unitId
                      );
                      setRecordForm({
                        ...recordForm,
                        pendapatanKotor: val,
                        setoranKasMasjid: calculated > 0 ? calculated : '',
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Biaya Operasional / Modal (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={recordForm.biayaOperasional}
                    onChange={(e) => {
                      const val = e.target.value;
                      const calculated = handleCalculateSetoran(
                        recordForm.pendapatanKotor,
                        val,
                        recordForm.unitId
                      );
                      setRecordForm({
                        ...recordForm,
                        biayaOperasional: val,
                        setoranKasMasjid: calculated > 0 ? calculated : '',
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-rose-600 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Calculated Net Profit Preview & Setoran Nominal */}
              {(() => {
                const kotor = Number(recordForm.pendapatanKotor) || 0;
                const biaya = Number(recordForm.biayaOperasional) || 0;
                const laba = Math.max(0, kotor - biaya);
                return (
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-bold">Kalkulasi Laba Bersih Usaha:</span>
                      <span className="font-mono font-extrabold text-emerald-900">
                        Rp {laba.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-3">
                      <label className="font-bold text-slate-800">
                        Nominal Disetor ke Kas Masjid (Rp):
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={recordForm.setoranKasMasjid}
                        onChange={(e) =>
                          setRecordForm({ ...recordForm, setoranKasMasjid: e.target.value })
                        }
                        className="w-36 bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-extrabold text-emerald-800 focus:ring-2 focus:ring-emerald-500 text-right"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Pos Kas Tujuan & Metode Pembayaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pos Kas Penerima <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={recordForm.posDanaTujuan}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, posDanaTujuan: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {posDanaList.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={recordForm.metodePembayaran}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, metodePembayaran: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {metodePembayaranList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Petugas & Keterangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Petugas / Penyetor
                  </label>
                  <input
                    type="text"
                    value={recordForm.petugas}
                    onChange={(e) => setRecordForm({ ...recordForm, petugas: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Keterangan Rincian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sewa Aula Akad Pernikahan"
                    value={recordForm.keterangan}
                    onChange={(e) => setRecordForm({ ...recordForm, keterangan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Auto Push Checkbox */}
              {!editingRecord && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordForm.autoPushToKas}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, autoPushToKas: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-slate-300 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Langsung masukkan nominal setoran ini ke Jurnal Transaksi Kas
                    </span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                      Otomatis membuat transaksi pemasukan baru kategori "Hasil Usaha & Pengelolaan Aset Masjid" di pos kas pilihan.
                    </span>
                  </div>
                </label>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs transition shadow-sm"
                >
                  Simpan Catatan Usaha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TAMBAH / EDIT UNIT USAHA ================= */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <Store className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingUnit ? 'Edit Unit Usaha DKM' : 'Tambah Unit Usaha Masjid Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Definisikan unit usaha produktif, pengelola, & persentase bagi hasil
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnitSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Unit Usaha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Depot Air Minum RO / Sewa Aula DKM"
                  value={unitForm.nama}
                  onChange={(e) => setUnitForm({ ...unitForm, nama: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Unit</label>
                  <select
                    value={unitForm.kategori}
                    onChange={(e) => setUnitForm({ ...unitForm, kategori: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="sewa_aset">Sewa Aset / Fasilitas</option>
                    <option value="perdagangan">Perdagangan / Kantin</option>
                    <option value="jasa">Jasa / AMDK / Parkir</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={unitForm.status}
                    onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Non-aktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Penanggung Jawab (PIC)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Pengelola"
                    value={unitForm.penanggungJawab}
                    onChange={(e) => setUnitForm({ ...unitForm, penanggungJawab: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kontak / No HP</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={unitForm.kontak}
                    onChange={(e) => setUnitForm({ ...unitForm, kontak: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bagi Hasil ke Kas (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={unitForm.persentaseBagiHasilKas}
                    onChange={(e) =>
                      setUnitForm({ ...unitForm, persentaseBagiHasilKas: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pos Kas Default</label>
                  <select
                    value={unitForm.posDanaTujuan}
                    onChange={(e) => setUnitForm({ ...unitForm, posDanaTujuan: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {posDanaList.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi / Keterangan Usaha
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat kegiatan usaha..."
                  value={unitForm.keterangan}
                  onChange={(e) => setUnitForm({ ...unitForm, keterangan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs transition shadow-sm"
                >
                  Simpan Unit Usaha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CETAK REKAPITULASI HASIL USAHA ================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Header / Kop */}
            <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                {mosqueProfile.namaMasjid}
              </h2>
              <p className="text-xs text-slate-600">
                {[mosqueProfile.alamat, mosqueProfile.desa ? `Desa ${mosqueProfile.desa}` : '', mosqueProfile.kota]
                  .filter(Boolean)
                  .join(' ')}{' '}
                • Telp: {mosqueProfile.telepon}
              </p>
              <h3 className="text-sm font-extrabold text-emerald-900 pt-2 uppercase tracking-wide">
                Laporan Rekapitulasi Hasil & Unit Usaha DKM
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
              </p>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Omzet</span>
                <span className="font-mono font-extrabold text-slate-900">
                  Rp {totalOmzet.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Biaya Usaha</span>
                <span className="font-mono font-semibold text-rose-600">
                  Rp {totalBiaya.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Laba Bersih</span>
                <span className="font-mono font-extrabold text-amber-700">
                  Rp {totalLabaBersih.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Disetor ke Kas</span>
                <span className="font-mono font-black text-emerald-800">
                  Rp {totalMasukKas.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Unit Usaha / Periode</th>
                    <th className="py-2 px-3 text-right">Omzet</th>
                    <th className="py-2 px-3 text-right">Biaya</th>
                    <th className="py-2 px-3 text-right">Laba Bersih</th>
                    <th className="py-2 px-3 text-right">Setor Kas</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {businessRecords.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 px-3 font-mono">{r.tanggal}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold">{r.unitNama}</span>
                        <span className="text-[11px] text-slate-500 block">{r.periode}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        Rp {r.pendapatanKotor.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-rose-600">
                        Rp {r.biayaOperasional.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">
                        Rp {r.labaBersih.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                        Rp {r.setoranKasMasjid.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-[10px]">
                        {r.statusSetor === 'sudah_masuk_kas' ? 'Sudah Masuk Kas' : 'Belum Disetor'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <span className="text-slate-500 block">Mengetahui,</span>
                <span className="font-bold text-slate-800 mt-1 block">Ketua DKM</span>
                <div className="h-16"></div>
                <span className="font-bold text-slate-900 underline block">
                  {mosqueProfile.ketuaDKM}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Pemeriksa,</span>
                <span className="font-bold text-slate-800 mt-1 block">Bendahara DKM</span>
                <div className="h-16"></div>
                <span className="font-bold text-slate-900 underline block">
                  {mosqueProfile.bendaharaDKM}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Pelaksana,</span>
                <span className="font-bold text-slate-800 mt-1 block">Koordinator Unit Usaha</span>
                <div className="h-16"></div>
                <span className="font-bold text-slate-900 underline block">
                  ( Pengelola Usaha )
                </span>
              </div>
            </div>

            {/* Modal Print Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
