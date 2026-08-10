export type TransactionType = 'pemasukan' | 'pengeluaran';

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
  petugas: string; // Name of DKM officer who logged it
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
