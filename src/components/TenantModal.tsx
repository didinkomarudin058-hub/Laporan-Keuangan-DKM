import React, { useState, useEffect } from 'react';
import { X, UserCheck, MapPin, Calendar, DollarSign, FileText, Phone, CreditCard, ShieldCheck, Percent, Sparkles, Tag } from 'lucide-react';
import { LandTenant, MosqueBusinessUnit, FundCategory } from '../types';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenantData: Omit<LandTenant, 'id'>) => void;
  editingTenant: LandTenant | null;
  businessUnits?: MosqueBusinessUnit[];
  posDanaList: string[];
}

export const TenantModal: React.FC<TenantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTenant,
  businessUnits = [],
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
    diskonPersen: number | string;
    keteranganDiskon: string;
    tipePeriode: 'bulanan' | 'tahunan' | 'musiman';
    tanggalMulai: string;
    tanggalSelesai: string;
    statusKontrak: 'aktif' | 'hampir_habis' | 'menunggak' | 'selesai';
    posDanaTujuan: string;
    catatan: string;
  }>({
    unitId: 'UNIT-SEWA',
    namaPenyewa: '',
    nomorTelepon: '',
    nomorKTP: '',
    alamatPenyewa: '',
    namaLahan: '',
    lokasiLahan: '',
    luasLahan: '',
    peruntukanUsaha: '',
    tarifSewa: '',
    diskonPersen: 0,
    keteranganDiskon: '',
    tipePeriode: 'bulanan',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split('T')[0],
    statusKontrak: 'aktif',
    posDanaTujuan: 'Kas Operasional',
    catatan: '',
  });

  useEffect(() => {
    if (editingTenant) {
      setFormData({
        unitId: editingTenant.unitId || 'UNIT-SEWA',
        namaPenyewa: editingTenant.namaPenyewa,
        nomorTelepon: editingTenant.nomorTelepon,
        nomorKTP: editingTenant.nomorKTP || '',
        alamatPenyewa: editingTenant.alamatPenyewa || '',
        namaLahan: editingTenant.namaLahan,
        lokasiLahan: editingTenant.lokasiLahan || '',
        luasLahan: editingTenant.luasLahan || '',
        peruntukanUsaha: editingTenant.peruntukanUsaha,
        tarifSewa: editingTenant.tarifSewa,
        diskonPersen: editingTenant.diskonPersen ?? 0,
        keteranganDiskon: editingTenant.keteranganDiskon || '',
        tipePeriode: editingTenant.tipePeriode,
        tanggalMulai: editingTenant.tanggalMulai,
        tanggalSelesai: editingTenant.tanggalSelesai,
        statusKontrak: editingTenant.statusKontrak,
        posDanaTujuan: editingTenant.posDanaTujuan || 'Kas Operasional',
        catatan: editingTenant.catatan || '',
      });
    } else {
      setFormData({
        unitId: 'UNIT-SEWA',
        namaPenyewa: '',
        nomorTelepon: '',
        nomorKTP: '',
        alamatPenyewa: '',
        namaLahan: '',
        lokasiLahan: '',
        luasLahan: '',
        peruntukanUsaha: '',
        tarifSewa: '',
        diskonPersen: 0,
        keteranganDiskon: '',
        tipePeriode: 'bulanan',
        tanggalMulai: new Date().toISOString().split('T')[0],
        tanggalSelesai: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split('T')[0],
        statusKontrak: 'aktif',
        posDanaTujuan: 'Kas Operasional',
        catatan: '',
      });
    }
  }, [editingTenant, isOpen]);

  if (!isOpen) return null;

  const rawTarif = Number(formData.tarifSewa) || 0;
  const rawDiskonPersen = Math.min(100, Math.max(0, Number(formData.diskonPersen) || 0));
  const nominalPotongan = (rawTarif * rawDiskonPersen) / 100;
  const tarifBersih = Math.max(0, rawTarif - nominalPotongan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPenyewa.trim() || !formData.namaLahan.trim()) {
      alert('Mohon lengkapi Nama Penyewa dan Nama/Nomor Kavling Lahan.');
      return;
    }

    onSave({
      unitId: formData.unitId || 'UNIT-SEWA',
      namaPenyewa: formData.namaPenyewa.trim(),
      nomorTelepon: formData.nomorTelepon.trim(),
      nomorKTP: formData.nomorKTP.trim(),
      alamatPenyewa: formData.alamatPenyewa.trim(),
      namaLahan: formData.namaLahan.trim(),
      lokasiLahan: formData.lokasiLahan.trim(),
      luasLahan: formData.luasLahan.trim(),
      peruntukanUsaha: formData.peruntukanUsaha.trim() || 'Usaha Mandiri Jamaah',
      tarifSewa: rawTarif,
      diskonPersen: rawDiskonPersen,
      keteranganDiskon: rawDiskonPersen > 0 ? formData.keteranganDiskon.trim() : '',
      tarifSetelahDiskon: tarifBersih,
      tipePeriode: formData.tipePeriode,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      statusKontrak: formData.statusKontrak,
      posDanaTujuan: (formData.posDanaTujuan as FundCategory) || 'Kas Operasional',
      catatan: formData.catatan.trim(),
      totalTerbayar: editingTenant ? editingTenant.totalTerbayar : 0,
      terakhirBayar: editingTenant ? editingTenant.terakhirBayar : undefined,
    });

    onClose();
  };

  const presetDiscounts = [0, 5, 10, 15, 20, 25, 50];

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
                Pencatatan penyewa tanah, tarif sewa, fitur potongan persentase, dan masa kontrak DKM
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

          {/* Section 3: Tarif Sewa & Potongan Biaya Operasional */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-700" />
                <span>Tarif Sewa & Potongan Biaya Operasional (%)</span>
              </h4>
            </div>

            {/* Tarif Normal & Siklus */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tarif Sewa Normal (Rp) <span className="text-rose-500">*</span>
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
                    onChange={(e) => setFormData({ ...formData, tarifSewa: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
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

            {/* Potongan Operasional Input & Quick Pills */}
            <div className="space-y-2 pt-2 border-t border-amber-200/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-700" />
                  <span>Potongan Biaya Operasional (%)</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {presetDiscounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, diskonPersen: preset })}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        Number(formData.diskonPersen) === preset
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-100 hover:border-amber-400'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="0"
                    value={formData.diskonPersen}
                    onChange={(e) => setFormData({ ...formData, diskonPersen: e.target.value })}
                    className="w-full pr-8 pl-3 py-2 text-xs bg-white font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">
                    %
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Rincian biaya operasional (e.g. Biaya Pembersihan, Keamanan & Pemeliharaan Fasilitas Lahan)"
                    value={formData.keteranganDiskon}
                    onChange={(e) => setFormData({ ...formData, keteranganDiskon: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary Box */}
              {rawTarif > 0 && (
                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Tarif Sewa Normal:</span>
                    <span className="font-mono font-bold text-slate-700">
                      Rp {rawTarif.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {rawDiskonPersen > 0 && (
                    <div className="flex items-center justify-between text-amber-800 text-[11px] font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>Potongan Biaya Operasional ({rawDiskonPersen}%):</span>
                      </span>
                      <span className="font-mono font-bold text-rose-600">
                        - Rp {nominalPotongan.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs">
                      Tarif Bersih Masuk Kas DKM:
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-800">
                      Rp {tarifBersih.toLocaleString('id-ID')}
                      <span className="text-[10px] font-normal text-slate-500">
                        {' '}/ {formData.tipePeriode}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Masa Kontrak & Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Masa Kontrak & Pos Dana</span>
            </h4>

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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              {editingTenant ? 'Simpan Perubahan' : 'Simpan Data Penyewa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

