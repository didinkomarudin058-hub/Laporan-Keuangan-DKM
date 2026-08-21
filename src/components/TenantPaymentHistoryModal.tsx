import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Building2,
  Calendar,
  DollarSign,
  Receipt,
  Plus,
  Trash2,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
  CreditCard,
  Percent,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { LandTenant, TenantPaymentRecord, MosqueProfile } from '../types';

interface TenantPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: LandTenant | null;
  mosqueProfile: MosqueProfile;
  activePeriodLabel: string;
  activeMonthYearKey: string;
  onOpenPaymentModal: (tenant: LandTenant) => void;
  onOpenReceiptModal: (tenant: LandTenant, paymentRecord?: TenantPaymentRecord) => void;
  onDeletePaymentRecord?: (tenantId: string, paymentId: string) => void;
}

export const TenantPaymentHistoryModal: React.FC<TenantPaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  tenant,
  mosqueProfile,
  activePeriodLabel,
  activeMonthYearKey,
  onOpenPaymentModal,
  onOpenReceiptModal,
  onDeletePaymentRecord,
}) => {
  const [filterYear, setFilterYear] = useState<string>('semua');

  if (!isOpen || !tenant) return null;

  const rawTarif = tenant.tarifSewa || 0;
  const payments = tenant.riwayatPembayaran || [];

  // Hitung pembayaran untuk periode aktif yang sedang dimonitor
  const periodPayments = payments.filter((p) => {
    if (tenant.tipePeriode === 'tahunan') {
      const activeYear = Number(activeMonthYearKey.split('-')[0]) || new Date().getFullYear();
      return p.tahunKey === activeYear || p.periode.includes(String(activeYear)) || p.tanggal.startsWith(String(activeYear));
    }
    return p.bulanTahunKey === activeMonthYearKey || p.tanggal.startsWith(activeMonthYearKey);
  });

  const totalTerbayarPeriodeAktif = periodPayments.reduce((sum, p) => sum + (p.nominal || 0), 0);
  const sisaKurangBayarPeriodeAktif = Math.max(0, rawTarif - totalTerbayarPeriodeAktif);

  let statusPeriodeAktif: 'lunas' | 'cicilan' | 'belum_bayar' = 'belum_bayar';
  if (totalTerbayarPeriodeAktif >= rawTarif && rawTarif > 0) {
    statusPeriodeAktif = 'lunas';
  } else if (totalTerbayarPeriodeAktif > 0) {
    statusPeriodeAktif = 'cicilan';
  }

  // Filter riwayat untuk tabel
  const filteredPayments = payments.filter((p) => {
    if (filterYear === 'semua') return true;
    return p.tanggal.startsWith(filterYear) || String(p.tahunKey) === filterYear;
  });

  // Unique years from payments
  const availableYears: string[] = Array.from(
    new Set<string>(
      payments
        .map((p) => p.tanggal.split('-')[0])
        .filter(Boolean)
        .concat([String(new Date().getFullYear())])
    )
  ).sort((a, b) => b.localeCompare(a));

  const handleSendWhatsApp = () => {
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

    let msg =
      `*PEMBERITAHUAN STATUS SEWA LAHAN - ${mosqueProfile.namaMasjid.toUpperCase()}*\n\n` +
      `Assalamu'alaikum Wr. Wb.\n` +
      `Kepada Yth. *${tenant.namaPenyewa}*\n\n` +
      `Berikut rincian status pembayaran sewa lahan *${tenant.namaLahan}* (${tenant.peruntukanUsaha}):\n` +
      `• Periode: *${activePeriodLabel}*\n` +
      `• Tarif Sewa Asli: Rp ${rawTarif.toLocaleString('id-ID')}\n` +
      `• Total Terbayar: Rp ${totalTerbayarPeriodeAktif.toLocaleString('id-ID')}\n` +
      `• Sisa Tagihan: *Rp ${sisaKurangBayarPeriodeAktif.toLocaleString('id-ID')}*\n` +
      `• Status: *${
        statusPeriodeAktif === 'lunas'
          ? '✅ SUDAH LUNAS'
          : statusPeriodeAktif === 'cicilan'
          ? '🟡 BELUM LUNAS (SEBAGIAN / CICILAN)'
          : '⚠️ BELUM BAYAR'
      }*\n\n`;

    if (sisaKurangBayarPeriodeAktif > 0) {
      msg +=
        `Pembayaran dapat disetorkan langsung ke Bendahara DKM atau transfer via rekening kas masjid:\n` +
        `🏦 *${mosqueProfile.namaBank || 'Bank Syariah'}*\n` +
        `💳 No. Rekening: *${mosqueProfile.nomorRekening || '-'}*\n` +
        `👤 Atas Nama: *${mosqueProfile.anRekening || mosqueProfile.namaMasjid}*\n\n` +
        `Jatuh tempo setiap tanggal: *${tenant.jatuhTempoTanggal || 5}*.\n` +
        `Mohon konfirmasi kembali setelah melakukan pembayaran. Terima kasih.\n\n` +
        `Wassalamu'alaikum Wr. Wb.\n` +
        `*Pengurus DKM / Sie Aset & Wakaf*`;
    } else {
      msg +=
        `Alhamdulillah, terima kasih atas pembayaran sewa yang telah lunas. Semoga usaha dan rezeki Bapak/Ibu selalu berkah dan lancar.\n\n` +
        `Wassalamu'alaikum Wr. Wb.\n` +
        `*Pengurus DKM / Sie Aset & Wakaf*`;
    }

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      id="tenant-payment-history-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20">
              <UserCheck className="w-5 h-5 stroke-[2.5] text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Kelola Pembayaran Sewa</span>
                <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-100 font-semibold">
                  {tenant.kategori || 'Sewa Lahan'}
                </span>
              </h3>
              <p className="text-xs text-emerald-200">
                Penyewa: <strong className="text-white">{tenant.namaPenyewa}</strong> • {tenant.namaLahan}
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

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {/* Top Status Card: Active Period Billing & Payment Status */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Status Pembayaran Periode Terpilih
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{activePeriodLabel}</span>
                </h4>
              </div>

              <div>
                {statusPeriodeAktif === 'lunas' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>SUDAH LUNAS</span>
                  </span>
                ) : statusPeriodeAktif === 'cicilan' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>BELUM LUNAS (ADA SISA)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>BELUM BAYAR</span>
                  </span>
                )}
              </div>
            </div>

            {/* 3 Metric Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Tarif Sewa Asli</span>
                <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                  Rp {rawTarif.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {tenant.tipePeriode === 'bulanan' ? 'Per Bulan' : tenant.tipePeriode === 'tahunan' ? 'Per Tahun' : 'Per Periode'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Sudah Dibayar</span>
                <div className="text-base font-black font-mono text-emerald-800 mt-0.5">
                  Rp {totalTerbayarPeriodeAktif.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {periodPayments.length} kali pencatatan
                </span>
              </div>

              <div className={`bg-white p-3 rounded-xl border ${sisaKurangBayarPeriodeAktif > 0 ? 'border-rose-200' : 'border-slate-200'}`}>
                <span className={`text-[10px] font-bold uppercase block ${sisaKurangBayarPeriodeAktif > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                  Sisa Kurang Bayar
                </span>
                <div className={`text-base font-black font-mono mt-0.5 ${sisaKurangBayarPeriodeAktif > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  Rp {sisaKurangBayarPeriodeAktif.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Jatuh tempo tgl {tenant.jatuhTempoTanggal || 5}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons inside Card */}
            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Kirim pemberitahuan tagihan atau ucapan terima kasih via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kirim WhatsApp {sisaKurangBayarPeriodeAktif > 0 ? 'Tagihan' : 'Status'}</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPaymentModal(tenant);
                  }}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Catat Pembayaran Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* Payment History Log Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  <span>Riwayat Seluruh Pembayaran ({payments.length})</span>
                </h4>
              </div>

              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Tahun:</span>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="semua">Semua Tahun</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-300">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-semibold">Belum ada riwayat pembayaran yang tercatat.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik tombol &quot;+ Catat Pembayaran Baru&quot; di atas untuk mencatat penerimaan sewa.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3">Tanggal & No. Kwitansi</th>
                        <th className="py-2.5 px-3">Periode Sewa</th>
                        <th className="py-2.5 px-3">Metode & Kas</th>
                        <th className="py-2.5 px-3 text-right">Nominal Bayar</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredPayments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">
                              {new Date(pay.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                              {pay.noKwitansi || pay.id}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 block">{pay.periode}</span>
                            {pay.keterangan && (
                              <span className="text-[11px] text-slate-500 truncate max-w-[200px] block">
                                {pay.keterangan}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-slate-700 block">{pay.metodePembayaran}</span>
                            <span className="text-[10px] text-slate-500">{pay.posDanaTujuan}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <div className="font-bold text-slate-900 text-xs">
                              Rp {pay.nominal.toLocaleString('id-ID')}
                            </div>
                            {pay.diskonPersen && pay.diskonPersen > 0 ? (
                              <div className="text-[10px] space-y-0.5 mt-0.5">
                                <span className="text-amber-700 block font-semibold">
                                  Potongan ({pay.diskonPersen}%): -Rp {(pay.potonganNominal || Math.round((pay.nominal * pay.diskonPersen) / 100)).toLocaleString('id-ID')}
                                </span>
                                <span className="text-emerald-700 block font-extrabold">
                                  Masuk Kas: Rp {(pay.nominalSetorKas || (pay.nominal - (pay.potonganNominal || Math.round((pay.nominal * pay.diskonPersen) / 100)))).toLocaleString('id-ID')}
                                </span>
                              </div>
                            ) : null}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {pay.statusBayar === 'cicilan' ? (
                              <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                Sebagian
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                Lunas
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenReceiptModal(tenant, pay);
                                }}
                                title="Cetak Kwitansi Pembayaran Ini"
                                className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer border border-emerald-200"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>
                              {onDeletePaymentRecord && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Hapus data pembayaran ini (Rp ${pay.nominal.toLocaleString('id-ID')})?`
                                      )
                                    ) {
                                      onDeletePaymentRecord(tenant.id, pay.id);
                                    }
                                  }}
                                  title="Hapus Pembayaran"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                        <td colSpan={3} className="py-2.5 px-3 text-right">
                          Total Akumulasi Terbayar ({filterYear === 'semua' ? 'Semua' : `Tahun ${filterYear}`}):
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-900">
                          Rp {filteredPayments.reduce((s, p) => s + p.nominal, 0).toLocaleString('id-ID')}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Total Kumulatif: <strong className="text-emerald-800 font-mono">Rp {(tenant.totalTerbayar || 0).toLocaleString('id-ID')}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
