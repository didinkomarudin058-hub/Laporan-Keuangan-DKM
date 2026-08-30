export type TransactionType = 'pemasukan' | 'pengeluaran';

export type AppTab =
  | 'dashboard'
  | 'transactions'
  | 'business'
  | 'monthlyReport'
  | 'analytics'
  | 'tvMode'
  | 'settings';

export type FundCategory = string;
export type PaymentMethod = string;

export interface Transaction {
  id: string;
  tanggal: string; // ISO format YYYY-MM-DD
  jenis: TransactionType;
  danaKat: FundCategory;
  kategori: string; // e.g., 'Infaq Kotak Jumat', 'Listrik & Kebersihan', 'Honor Penceramah', 'Donatur Pembangunan'
  keterangan: string;
  jumlah: number;
  petugas?: string; // Optional name of DKM officer
  donatur?: string; // Optional name or 'Hamba Allah'
  metodePembayaran: PaymentMethod;
  buktiUrl?: string; // Optional receipt/note image url or preview
  statusVerification?: 'Terverifikasi' | 'Pending';
}

export interface MosqueProfile {
  namaMasjid: string;
  alamat: string;
  desa?: string;
  kecamatan?: string;
  kota: string;
  telepon: string;
  email: string;
  nomorRekening: string;
  namaBank: string;
  anRekening: string;
  ketuaDKM: string;
  bendaharaDKM: string;
  sekretarisDKM: string;
  motto: string;
  qrisImageUrl?: string;
  logoUrl?: string;
}

export interface MonthlyReport {
  tahun: number;
  bulan: number; // 1 - 12
  saldoAwal: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoAkhir: number;
  narasiAI?: string;
  diketahuiOleh?: string;
}

export interface FundSummary {
  kategori: FundCategory;
  deskripsi: string;
  saldoAwal: number;
  pemasukan: number;
  pengeluaran: number;
  saldoAkhir: number;
  warnaBadge: string;
  iconName: string;
}

export type BusinessUnitCategory = 'sewa_aset' | 'perdagangan' | 'jasa' | 'lainnya';

export interface MosqueBusinessUnit {
  id: string;
  nama: string;
  kategori: BusinessUnitCategory;
  penanggungJawab: string;
  kontak?: string;
  persentaseBagiHasilKas: number; // e.g. 100 for 100%, 80 for 80%
  posDanaTujuan: FundCategory; // e.g. 'Kas Operasional' or 'Kas Pembangunan'
  keterangan: string;
  status: 'aktif' | 'nonaktif';
}

export interface BusinessRecord {
  id: string;
  unitId: string;
  unitNama: string;
  tanggal: string; // YYYY-MM-DD
  periode: string; // e.g. 'Agustus 2026', 'Pekan I Agustus 2026'
  pendapatanKotor: number; // Gross Revenue / Omzet
  biayaOperasional: number; // Operational Costs / Modal / Biaya
  labaBersih: number; // pendapatanKotor - biayaOperasional
  setoranKasMasjid: number; // Amount given to Kas Masjid
  posDanaTujuan: FundCategory;
  metodePembayaran: PaymentMethod;
  statusSetor: 'sudah_masuk_kas' | 'belum_disetor';
  transactionIdLinked?: string; // Linked Transaction ID in Jurnal Kas
  keterangan: string;
  petugas: string;
}

export interface TenantPaymentRecord {
  id: string;
  tenantId: string;
  tenantNama: string;
  namaLahan: string;
  tanggal: string; // YYYY-MM-DD
  periode: string; // e.g. "Bulan Agustus 2026", "Tahun 2026"
  bulanTahunKey?: string; // "YYYY-MM"
  tahunKey?: number; // YYYY
  nominal: number; // Jumlah dibayar / dicicil oleh penyewa
  nominalAsli?: number; // Nilai tarif sewa asli
  diskonPersen?: number; // Persentase potongan
  potonganNominal?: number; // Nominal potongan yang diambil dari jumlah dicicil/dibayar
  nominalSetorKas?: number; // Uang yang masuk ke kas masjid (hasil potongan)
  metodePembayaran: PaymentMethod | string;
  posDanaTujuan: FundCategory | string;
  keterangan?: string;
  petugas?: string;
  noKwitansi?: string;
  transactionIdLinked?: string;
  statusBayar?: 'lunas' | 'cicilan';
  sisaKurangBayar?: number;
  createdAt?: string;
}

export interface LandTenant {
  id: string;
  unitId?: string; // Reference to unit usaha or 'UNIT-SEWA'
  namaPenyewa: string;
  nomorTelepon: string;
  nomorKTP?: string;
  alamatPenyewa?: string;
  kategori: string; // e.g. 'Kios Kuliner & Warung', 'Stand UMKM & Toko', 'Bengkel & Jasa Otomotif', 'Kavling Tanah Wakaf'
  namaLahan: string; // e.g. 'Kavling Tanah Wakaf Barat Blok A-01', 'Lahan Usaha Stand Kuliner Depan'
  lokasiLahan?: string; // e.g. 'Jl. Masjid Sisi Barat RT 02'
  luasLahan?: string; // e.g. '50 m²', '120 m²', '1 Rante / 400 m²'
  peruntukanUsaha: string; // e.g. 'Kios Kuliner / Warung Makan', 'Bengkel Motor', 'Toko Kelontong'
  tarifSewa: number; // Nilai sewa normal per siklus (Rp)
  diskonPersen?: number; // Persentase Potongan Sewa (0 - 100%)
  keteranganDiskon?: string; // Alasan potongan
  tarifSetelahDiskon?: number; // Tarif bersih setelah potongan persentase
  tipePeriode: 'bulanan' | 'tahunan' | 'musiman';
  jatuhTempoTanggal?: number; // Tanggal jatuh tempo (e.g. 5, 10, 20)
  tanggalMulaiSewa?: string; // YYYY-MM-DD
  tanggalAkhirSewa?: string; // YYYY-MM-DD
  posDanaTujuan?: FundCategory;
  terakhirBayar?: string;
  totalTerbayar?: number;
  riwayatPembayaran?: TenantPaymentRecord[];
  catatan?: string;
}

