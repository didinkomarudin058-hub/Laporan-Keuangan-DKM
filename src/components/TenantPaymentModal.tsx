import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, ShieldCheck, CheckCircle2, UserCheck, MapPin, Tag, Percent } from 'lucide-react';
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
  const [nominalAsli, setNominalAsli] = useState<number | string>('');
  const [nominal, setNominal] = useState<number | string>('');
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [periode, setPeriode] = useState<string>('');
  const [statusBayar, setStatusBayar] = useState<'lunas' | 'cicilan'>('lunas');
  const [metodePembayaran, setMetodePembayaran] = useState<string>('Transfer Bank');
  const [posDanaTujuan, setPosDanaTujuan] = useState<string>('Kas Operasional');
  const [keterangan, setKeterangan] = useState<string>('');
  const [petugas, setPetugas] = useState<string>('');
  const [autoPushToKas, setAutoPushToKas] = useState<boolean>(true);

  useEffect(() => {
    if (tenant) {
      const rawTarif = tenant.tarifSewa || 0;
      setNominalAsli(rawTarif || '');
      setNominal(rawTarif || '');
      setStatusBayar('lunas');
      setTanggal(new Date().toISOString().split('T')[0]);

      const currMonthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const currentPeriode =
        tenant.tipePeriode === 'bulanan'
          ? `Bulan ${currMonthName}`
          : tenant.tipePeriode === 'tahunan'
          ? `Tahun ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`
          : `Periode Musiman ${currMonthName}`;

      setPeriode(currentPeriode);
      setPosDanaTujuan(tenant.posDanaTujuan || 'Kas Operasional');
      setMetodePembayaran(metodePembayaranList[0] || 'Transfer Bank');
      
      setKeterangan(`Penerimaan Sewa ${tenant.namaLahan} - ${tenant.namaPenyewa}`);
      setPetugas(mosqueProfile.bendaharaDKM || 'Pengurus Aset Wakaf DKM');
      setAutoPushToKas(true);
    }
  }, [tenant, mosqueProfile, metodePembayaranList, isOpen]);

  if (!isOpen || !tenant) return null;

  const numAsli = Number(nominalAsli) || 0;
  const numBayar = Number(nominal) || 0;
  const sisaKurang = Math.max(0, numAsli - numBayar);

  // Handler when admin edits nominal asli
  const handleNominalAsliChange = (val: string) => {
    setNominalAsli(val);
    const n = Number(val) || 0;
    setNominal(n);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(nominal) || 0;
    if (num <= 0) {
      alert('Mohon masukkan nominal sewa yang valid.');
      return;
    }

    const d = new Date(tanggal);
    const bulanTahunKey = !isNaN(d.getTime())
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      : undefined;

    const actualStatus = num >= numAsli && numAsli > 0 ? 'lunas' : statusBayar;

    onConfirmPayment(tenant.id, {
      nominal: num,
      nominalAsli: numAsli,
      diskonPersen: tenant.diskonPersen || 0,
      tanggal,
      periode,
      bulanTahunKey,
      metodePembayaran,
      posDanaTujuan,
      statusBayar: actualStatus,
      sisaKurangBayar: sisaKurang,
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
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20">
              <DollarSign className="w-5 h-5 stroke-[2.5] text-white" />
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
              <span className="text-[10px] text-slate-500 font-medium">Tarif Sewa:</span>
              <div className="text-sm font-mono font-extrabold text-emerald-800">
                Rp {numAsli.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] font-bold text-slate-500">
                / {tenant.tipePeriode === 'bulanan' ? 'bulan' : tenant.tipePeriode === 'tahunan' ? 'tahun' : 'musim'}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nominal Pembayaran Input */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                Nominal Pembayaran Sewa (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  placeholder="Masukkan jumlah yang dibayarkan"
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-mono font-extrabold text-emerald-950 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tanggal Pembayaran & Periode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          {/* Pos Dana & Metode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pos Dana Kas Masjid Tujuan
              </label>
              <select
                value={posDanaTujuan}
                onChange={(e) => setPosDanaTujuan(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
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
                Metode Pembayaran
              </label>
              <select
                value={metodePembayaran}
                onChange={(e) => setMetodePembayaran(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Penerima / Petugas
              </label>
              <input
                type="text"
                placeholder="Nama Bendahara DKM"
                value={petugas}
                onChange={(e) => setPetugas(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Pembayaran
              </label>
              <input
                type="text"
                placeholder="Contoh: Pembayaran sewa lunas via BSI"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Auto Push To Kas Checkbox */}
          <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="autoPushKas"
              checked={autoPushToKas}
              onChange={(e) => setAutoPushToKas(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="autoPushKas" className="text-xs text-slate-700 leading-snug cursor-pointer select-none">
              <span className="font-bold text-emerald-950 block">
                Otomatis Masukkan ke Jurnal Kas Masjid (Pemasukan)
              </span>
              <span className="text-slate-500 text-[11px]">
                Uang sewa akan langsung menambah saldo pos dana kas masjid terpilih secara real-time.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
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
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Catat Pembayaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
