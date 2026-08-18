import React, { useState, useEffect } from 'react';
import { X, UserCheck, MapPin, Calendar, DollarSign, FileText, Phone, CreditCard, ShieldCheck, CheckCircle2, Coins } from 'lucide-react';
import { LandTenant, MosqueBusinessUnit, FundCategory } from '../types';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    tenantData: Omit<LandTenant, 'id'>,
    initialPayment?: {
      nominal: number;
      tanggal: string;
      periode: string;
      metodePembayaran: string;
      posDanaTujuan: string;
      keterangan?: string;
      autoPushToKas: boolean;
    }
  ) => void;
  editingTenant: LandTenant | null;
  businessUnits: MosqueBusinessUnit[];
  posDanaList: string[];
}

export const TenantModal: React.FC<TenantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTenant,
  businessUnits,
  posDanaList,
}) => {
  const [formData, setFormData] = useState<{
    unitId: string;
    namaPenyewa: string;
    nomorTelepon: string;
    nomorKTP: string;
    alamatPenyewa: string;
    namaLahan: string;
    lokasiLahan: string;
    luasLahan: string;
    peruntukanUsaha: string;
    tarifSewa: number | string;
    tipePeriode: 'bulanan' | 'tahunan' | 'musiman';
    tanggalMulai: string;
    tanggalSelesai: string;
    statusKontrak: 'aktif' | 'hampir_habis' | 'menunggak' | 'selesai';
    posDanaTujuan: string;
    catatan: string;
  }>({
    unitId: '',
    namaPenyewa: '',
    nomorTelepon: '',
    nomorKTP: '',
    alamatPenyewa: '',
    namaLahan: '',
    lokasiLahan: '',
    luasLahan: '',
    peruntukanUsaha: '',
    tarifSewa: '',
    tipePeriode: 'bulanan',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split('T')[0],
    statusKontrak: 'aktif',
    posDanaTujuan: 'Kas Operasional',
    catatan: '',
  });

  // Initial payment state when creating new tenant
  const [recordInitialPayment, setRecordInitialPayment] = useState<boolean>(false);
  const [initialPaymentNominal, setInitialPaymentNominal] = useState<number | string>('');
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<string>('Transfer Bank');

  const sewaUnits = businessUnits.filter((u) => u.kategori === 'sewa_aset' || /sewa|tanah|lahan|kios/i.test(u.nama));
  const defaultUnit = sewaUnits[0] || businessUnits[0];

  useEffect(() => {
    if (editingTenant) {
      setFormData({
        unitId: editingTenant.unitId || defaultUnit?.id || '',
        namaPenyewa: editingTenant.namaPenyewa,
        nomorTelepon: editingTenant.nomorTelepon,
        nomorKTP: editingTenant.nomorKTP || '',
        alamatPenyewa: editingTenant.alamatPenyewa || '',
        namaLahan: editingTenant.namaLahan,
        lokasiLahan: editingTenant.lokasiLahan || '',
        luasLahan: editingTenant.luasLahan || '',
        peruntukanUsaha: editingTenant.peruntukanUsaha,
        tarifSewa: editingTenant.tarifSewa,
        tipePeriode: editingTenant.tipePeriode,
        tanggalMulai: editingTenant.tanggalMulai,
        tanggalSelesai: editingTenant.tanggalSelesai,
        statusKontrak: editingTenant.statusKontrak,
        posDanaTujuan: editingTenant.posDanaTujuan || 'Kas Operasional',
        catatan: editingTenant.catatan || '',
      });
      setRecordInitialPayment(false);
      setInitialPaymentNominal('');
    } else {
      setFormData({
        unitId: defaultUnit?.id || '',
        namaPenyewa: '',
        nomorTelepon: '',
        nomorKTP: '',
        alamatPenyewa: '',
        namaLahan: '',
        lokasiLahan: '',
        luasLahan: '',
        peruntukanUsaha: '',
        tarifSewa: '',
        tipePeriode: 'bulanan',
        tanggalMulai: new Date().toISOString().split('T')[0],
        tanggalSelesai: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split('T')[0],
        statusKontrak: 'aktif',
        posDanaTujuan: defaultUnit?.posDanaTujuan || 'Kas Operasional',
        catatan: '',
      });
      setRecordInitialPayment(false);
      setInitialPaymentNominal('');
    }
  }, [editingTenant, defaultUnit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPenyewa.trim() || !formData.namaLahan.trim()) {
      alert('Mohon lengkapi Nama Penyewa dan Nama/Nomor Kavling Lahan.');
      return;
    }

    const initNominal = Number(initialPaymentNominal) || 0;
    const initialPaymentData =
      !editingTenant && recordInitialPayment && initNominal > 0
        ? {
            nominal: initNominal,
            tanggal: formData.tanggalMulai,
            periode: `Periode Awal (${formData.tipePeriode === 'bulanan' ? 'Bulan 1' : 'Tahun 1'})`,
            metodePembayaran: initialPaymentMethod,
            posDanaTujuan: formData.posDanaTujuan,
            keterangan: `Pembayaran Sewa Awal: ${formData.namaPenyewa} (${formData.namaLahan})`,
            autoPushToKas: true,
          }
        : undefined;

    onSave(
      {
        unitId: formData.unitId || defaultUnit?.id || 'UNIT-00',
        namaPenyewa: formData.namaPenyewa.trim(),
        nomorTelepon: formData.nomorTelepon.trim(),
        nomorKTP: formData.nomorKTP.trim(),
        alamatPenyewa: formData.alamatPenyewa.trim(),
        namaLahan: formData.namaLahan.trim(),
        lokasiLahan: formData.lokasiLahan.trim(),
        luasLahan: formData.luasLahan.trim(),
        peruntukanUsaha: formData.peruntukanUsaha.trim() || 'Usaha Mandiri Jamaah',
        tarifSewa: Number(formData.tarifSewa) || 0,
        tipePeriode: formData.tipePeriode,
        tanggalMulai: formData.tanggalMulai,
        tanggalSelesai: formData.tanggalSelesai,
        statusKontrak: formData.statusKontrak,
        posDanaTujuan: (formData.posDanaTujuan as FundCategory) || 'Kas Operasional',
        catatan: formData.catatan.trim(),
        totalTerbayar: editingTenant ? editingTenant.totalTerbayar : initNominal,
        terakhirBayar: editingTenant
          ? editingTenant.terakhirBayar
          : initNominal > 0
          ? formData.tanggalMulai
          : undefined,
      },
      initialPaymentData
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {editingTenant ? 'Edit Data Penyewa Lahan/Tanah' : 'Tambah Penyewa Tanah & Aset Wakaf'}
              </h3>
              <p className="text-xs text-emerald-200">
                Pencatatan penyewa tanah, tarif sewa, dan akumulasi hasil ke Unit Usaha Sewa Tanah DKM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Identitas Penyewa */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Identitas & Kontak Penyewa</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Penyewa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. H. Suparno"
                  value={formData.namaPenyewa}
                  onChange={(e) => setFormData({ ...formData, namaPenyewa: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Telepon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0812-3456-7890"
                  value={formData.nomorTelepon}
                  onChange={(e) => setFormData({ ...formData, nomorTelepon: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  No. KTP / NIK (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="3275..."
                  value={formData.nomorKTP}
                  onChange={(e) => setFormData({ ...formData, nomorKTP: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Alamat Asal Penyewa
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Melati No. 12 RT 01/03"
                  value={formData.alamatPenyewa}
                  onChange={(e) => setFormData({ ...formData, alamatPenyewa: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Objek & Lokasi Lahan */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Objek Lahan & Peruntukan Usaha</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama / Nomor Kavling Lahan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kavling Barat Blok A-01"
                  value={formData.namaLahan}
                  onChange={(e) => setFormData({ ...formData, namaLahan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Luas Lahan / Objek Sewa
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 60 m² (6 x 10 m)"
                  value={formData.luasLahan}
                  onChange={(e) => setFormData({ ...formData, luasLahan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peruntukan Usaha
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Warung Kuliner, Bengkel, Kios Buah"
                  value={formData.peruntukanUsaha}
                  onChange={(e) => setFormData({ ...formData, peruntukanUsaha: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patokan / Lokasi Detail
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sisi Barat Pagar Utama Masjid"
                  value={formData.lokasiLahan}
                  onChange={(e) => setFormData({ ...formData, lokasiLahan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tarif Sewa & Pos Dana */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Tarif Sewa & Masa Kontrak</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarif Sewa (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    required
                    placeholder="1500000"
                    value={formData.tarifSewa}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, tarifSewa: val });
                      if (!editingTenant && recordInitialPayment && !initialPaymentNominal) {
                        setInitialPaymentNominal(val);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Siklus Pembayaran
                </label>
                <select
                  value={formData.tipePeriode}
                  onChange={(e) => setFormData({ ...formData, tipePeriode: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                >
                  <option value="bulanan">Per Bulan</option>
                  <option value="tahunan">Per Tahun</option>
                  <option value="musiman">Musiman / Acara</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Mulai Sewa
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalMulai}
                  onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Selesai Sewa
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalSelesai}
                  onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Kontrak Sewa
                </label>
                <select
                  value={formData.statusKontrak}
                  onChange={(e) => setFormData({ ...formData, statusKontrak: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                >
                  <option value="aktif">✓ Aktif (Berjalan Lancar)</option>
                  <option value="hampir_habis">⚠️ Hampir Habis / Jatuh Tempo</option>
                  <option value="menunggak">❌ Menunggak (Perlu Konfirmasi)</option>
                  <option value="selesai">⚪ Selesai / Kontrak Berakhir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pos Dana Kas Masjid Tujuan
                </label>
                <select
                  value={formData.posDanaTujuan}
                  onChange={(e) => setFormData({ ...formData, posDanaTujuan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                >
                  {posDanaList.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Akumulasi Pembayaran Awal (Saat Tambah Penyewa Baru) */}
          {!editingTenant && (
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/90 space-y-3">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="record-initial-pay"
                  checked={recordInitialPayment}
                  onChange={(e) => {
                    setRecordInitialPayment(e.target.checked);
                    if (e.target.checked && !initialPaymentNominal && formData.tarifSewa) {
                      setInitialPaymentNominal(formData.tarifSewa);
                    }
                  }}
                  className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <label htmlFor="record-initial-pay" className="cursor-pointer">
                  <span className="text-xs font-bold text-amber-950 block flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-700 inline" />
                    <span>Catat Pembayaran Sewa Awal / Uang Muka Sekarang</span>
                  </span>
                  <span className="text-[11px] text-amber-800 block mt-0.5">
                    Centang untuk langsung memasukkan rupiah pembayaran pertama ke <strong>Akumulasi Unit Usaha Sewa Tanah</strong> & setor ke Jurnal Kas Masjid.
                  </span>
                </label>
              </div>

              {recordInitialPayment && (
                <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Jumlah Rupiah Diterima (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Contoh: 1500000"
                        value={initialPaymentNominal}
                        onChange={(e) => setInitialPaymentNominal(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={initialPaymentMethod}
                      onChange={(e) => setInitialPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                    >
                      <option value="Transfer Bank">Transfer Bank (BSI)</option>
                      <option value="Tunai">Tunai / Cash</option>
                      <option value="QRIS">QRIS DKM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Catatan & Syarat */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Kesepakatan Khusus Sewa Lahan
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Pembayaran setiap awal bulan tanggal 1. Listrik & kebersihan ditanggung penyewa."
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{editingTenant ? 'Simpan Perubahan' : 'Tambah Penyewa & Akumulasi Hasil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
