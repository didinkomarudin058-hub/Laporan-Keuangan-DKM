import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, ShieldCheck, CheckCircle2, UserCheck, MapPin } from 'lucide-react';
import { LandTenant, MosqueProfile, PaymentMethod, FundCategory } from '../types';

interface TenantPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: LandTenant | null;
  mosqueProfile: MosqueProfile;
  posDanaList: string[];
  metodePembayaranList: string[];
  onConfirmPayment: (
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
}

export const TenantPaymentModal: React.FC<TenantPaymentModalProps> = ({
  isOpen,
  onClose,
  tenant,
  mosqueProfile,
  posDanaList,
  metodePembayaranList,
  onConfirmPayment,
}) => {
  const [nominal, setNominal] = useState<number | string>('');
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [periode, setPeriode] = useState<string>('');
  const [metodePembayaran, setMetodePembayaran] = useState<string>('Transfer Bank');
  const [posDanaTujuan, setPosDanaTujuan] = useState<string>('Kas Pembangunan');
  const [keterangan, setKeterangan] = useState<string>('');
  const [petugas, setPetugas] = useState<string>('');
  const [autoPushToKas, setAutoPushToKas] = useState<boolean>(true);

  useEffect(() => {
    if (tenant) {
      setNominal(tenant.tarifSewa || '');
      setTanggal(new Date().toISOString().split('T')[0]);
      
      const currMonthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      setPeriode(
        tenant.tipePeriode === 'bulanan'
          ? `Bulan ${currMonthName}`
          : tenant.tipePeriode === 'tahunan'
          ? `Tahun ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`
          : `Periode Musiman ${currMonthName}`
      );
      
      setPosDanaTujuan(tenant.posDanaTujuan || 'Kas Pembangunan');
      setMetodePembayaran(metodePembayaranList[0] || 'Transfer Bank');
      setKeterangan(`Pembayaran Sewa ${tenant.namaLahan} (${tenant.peruntukanUsaha})`);
      setPetugas(mosqueProfile.bendaharaDKM || 'Pengurus Aset Wakaf DKM');
      setAutoPushToKas(true);
    }
  }, [tenant, mosqueProfile, metodePembayaranList, isOpen]);

  if (!isOpen || !tenant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(nominal) || 0;
    if (num <= 0) {
      alert('Mohon masukkan nominal sewa yang valid.');
      return;
    }

    onConfirmPayment(tenant.id, {
      nominal: num,
      tanggal,
      periode,
      metodePembayaran,
      posDanaTujuan,
      keterangan,
      petugas,
      autoPushToKas,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Catat Pembayaran Sewa Tanah
              </h3>
              <p className="text-xs text-emerald-200">
                Penerimaan sewa lahan & otomatis setor ke Jurnal Kas Masjid
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

        {/* Tenant Summary Info Box */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Penyewa Terpilih
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>{tenant.namaPenyewa}</span>
              </h4>
              <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{tenant.namaLahan} ({tenant.luasLahan || 'Lahan Wakaf'})</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-500 font-medium">Tarif Normal:</span>
              <div className="text-sm font-mono font-extrabold text-emerald-800">
                Rp {tenant.tarifSewa.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                / {tenant.tipePeriode === 'bulanan' ? 'bulan' : tenant.tipePeriode === 'tahunan' ? 'tahun' : 'musim'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nominal & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nominal Diterima (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Pembayaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Periode & Metode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Untuk Periode Sewa
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bulan Agustus 2026"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={metodePembayaran}
                onChange={(e) => setMetodePembayaran(e.target.value)}
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

          {/* Pos Dana Tujuan & Petugas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pos Dana Kas Tujuan
              </label>
              <select
                value={posDanaTujuan}
                onChange={(e) => setPosDanaTujuan(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              >
                {posDanaList.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Petugas Penerima DKM
              </label>
              <input
                type="text"
                placeholder="Bendahara / Sie Aset DKM"
                value={petugas}
                onChange={(e) => setPetugas(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Tambahan / Catatan Bukti
            </label>
            <input
              type="text"
              placeholder="Contoh: Lunas via transfer BSI a.n. Bpk Suparno"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Auto Push To Kas Checkbox */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="tenant-auto-push-kas"
              checked={autoPushToKas}
              onChange={(e) => setAutoPushToKas(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600"
            />
            <label htmlFor="tenant-auto-push-kas" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-emerald-900 block">
                Otomatis setor langsung ke Transaksi Kas Masjid
              </span>
              <span className="text-[11px] text-slate-500">
                Pemasukan sewa tanah akan langsung menambah saldo riil Kas Masjid dan tercatat di Laporan Bulanan.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
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
              <span>Simpan & Setor ke Kas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
