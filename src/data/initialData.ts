import { MosqueProfile, Transaction } from '../types';

export const initialMosqueProfile: MosqueProfile = {
  namaMasjid: "Masjid Raya Al-Barokah",
  alamat: "Jl. Masjid No. 15, Komplek Kebayoran Baru",
  kota: "Jakarta Selatan, DKI Jakarta",
  telepon: "(021) 7280-4921 / 0812-9876-5432",
  email: "dkm.albarokah@gmail.com",
  nomorRekening: "127-00-0987654-3",
  namaBank: "Bank Syariah Indonesia (BSI)",
  anRekening: "DKM Masjid Raya Al-Barokah",
  ketuaDKM: "H. Ahmad Dahlan, S.Ag",
  bendaharaDKM: "H. Mohammad Ridwan, SE",
  sekretarisDKM: "Ustadz Ridho Romadhon, M.Pd",
  motto: "Amanah, Transparan, Berkelanjutan untuk Kemakmuran Umat",
};

export const initialTransactions: Transaction[] = [
  // --- AGUSTUS 2026 ---
  {
    id: "TRX-202608-001",
    tanggal: "2026-08-01",
    jenis: "pemasukan",
    danaKat: "Kas Operasional",
    kategori: "Saldo Awal Kas",
    keterangan: "Sisa Saldo Kas Operasional Bulan Juli 2026",
    jumlah: 18450000,
    petugas: "H. Mohammad Ridwan",
    metodePembayaran: "Transfer Bank",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202608-002",
    tanggal: "2026-08-01",
    jenis: "pemasukan",
    danaKat: "Kas Pembangunan",
    kategori: "Donatur Pembangunan",
    keterangan: "Donasi Wakaf Keramik R. Wudhu Wanita dari H. Teguh Setiawan",
    jumlah: 5000000,
    petugas: "H. Mohammad Ridwan",
    donatur: "H. Teguh Setiawan",
    metodePembayaran: "Transfer Bank",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202608-02",
    tanggal: "2026-08-02",
    jenis: "pengeluaran",
    danaKat: "Kas Operasional",
    kategori: "Listrik & Air PLN/PDAM",
    keterangan: "Pembayaran Tagihan Listrik PLN Token Utama & Pompa Air",
    jumlah: 1420000,
    petugas: "Ustadz Ridho",
    metodePembayaran: "Transfer Bank",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202608-07",
    tanggal: "2026-08-07",
    jenis: "pemasukan",
    danaKat: "Kas Operasional",
    kategori: "Infaq Kotak Jumat",
    keterangan: "Hasil Penghitungan Kotak Infaq Shalat Jumat Pekan I Agustus",
    jumlah: 4850000,
    petugas: "Panitia Jumat (H. Ridwan & Bpk. Hendra)",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202608-07B",
    tanggal: "2026-08-07",
    jenis: "pemasukan",
    danaKat: "Kas Operasional",
    kategori: "Infaq QRIS Digital",
    keterangan: "Penerimaan Infaq QRIS Barcode Masjid Pekan I",
    jumlah: 1250000,
    petugas: "Bsi QRIS Gateway",
    metodePembayaran: "QRIS",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202608-08",
    tanggal: "2026-08-07",
    jenis: "pengeluaran",
    danaKat: "Kas Operasional",
    kategori: "Honorarium & Syahriyah",
    keterangan: "Honorarium Khatib Jumat Ustadz DR. K.H. Syarifuddin, M.A & Imam",
    jumlah: 850000,
    petugas: "H. Mohammad Ridwan",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202608-10",
    tanggal: "2026-08-05",
    jenis: "pemasukan",
    danaKat: "Kas Yatim & Sosial",
    kategori: "Donasi Yatim",
    keterangan: "Santunan Bulanan Anak Yatim dari Ibu Hj. Nurhayati",
    jumlah: 2500000,
    petugas: "Sdr. Faisal (Div. Sosial)",
    donatur: "Ibu Hj. Nurhayati",
    metodePembayaran: "Transfer Bank",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202608-11",
    tanggal: "2026-08-06",
    jenis: "pengeluaran",
    danaKat: "Kas Yatim & Sosial",
    kategori: "Santunan & Paket Sembako",
    keterangan: "Penyaluran Beasiswa & Santunan untuk 15 Anak Yatim Binaan DKM",
    jumlah: 3750000,
    petugas: "Sdr. Faisal (Div. Sosial)",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },

  // --- JULI 2026 ---
  {
    id: "TRX-202607-01",
    tanggal: "2026-07-03",
    jenis: "pemasukan",
    danaKat: "Kas Operasional",
    kategori: "Infaq Kotak Jumat",
    keterangan: "Infaq Jumat Pekan I Juli 2026",
    jumlah: 4200000,
    petugas: "Panitia Jumat",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-02",
    tanggal: "2026-07-05",
    jenis: "pengeluaran",
    danaKat: "Kas Operasional",
    kategori: "Kebersihan & Perlengkapan",
    keterangan: "Pembelian Cairan Pembersih Lantai, Karbol, dan Parfum Karpet Masjid",
    jumlah: 650000,
    petugas: "Marbot Pak Sulaeman",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-10",
    tanggal: "2026-07-10",
    jenis: "pemasukan",
    danaKat: "Kas Operasional",
    kategori: "Infaq Kotak Jumat",
    keterangan: "Infaq Jumat Pekan II Juli 2026",
    jumlah: 4600000,
    petugas: "Panitia Jumat",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-12",
    tanggal: "2026-07-12",
    jenis: "pengeluaran",
    danaKat: "Kas Pembangunan",
    kategori: "Material & Bahan Bangunan",
    keterangan: "Pembelian Cat Tembok Exterior Dulux Weathershield & Kuas Roda",
    jumlah: 2850000,
    petugas: "Div. Pembangunan (Pak Bambang)",
    metodePembayaran: "Transfer Bank",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-15",
    tanggal: "2026-07-15",
    jenis: "pengeluaran",
    danaKat: "Kas Pembangunan",
    kategori: "Upah Tukang & Pekerja",
    keterangan: "Upah Pengecatan Kubah & Menara Masjid Pekan 2",
    jumlah: 3200000,
    petugas: "Div. Pembangunan (Pak Bambang)",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-17",
    tanggal: "2026-07-17",
    jenis: "pemasukan",
    danaKat: "Kas Operasional",
    kategori: "Infaq Kotak Jumat",
    keterangan: "Infaq Jumat Pekan III Juli 2026",
    jumlah: 5100000,
    petugas: "Panitia Jumat",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-20",
    tanggal: "2026-07-20",
    jenis: "pengeluaran",
    danaKat: "Kas Operasional",
    kategori: "Perbaikan AC & Sound System",
    keterangan: "Cuci 6 Unit AC Ruang Utama & Servis Amp Mic Imam",
    jumlah: 1100000,
    petugas: "Ustadz Ridho",
    metodePembayaran: "Transfer Bank",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-24",
    tanggal: "2026-07-24",
    jenis: "pemasukan",
    danaKat: "Kas Operasional",
    kategori: "Infaq Kotak Jumat",
    keterangan: "Infaq Jumat Pekan IV Juli 2026",
    jumlah: 4900000,
    petugas: "Panitia Jumat",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-28",
    tanggal: "2026-07-28",
    jenis: "pemasukan",
    danaKat: "Kas Zakat & Shadaqah",
    kategori: "Zakat Maal",
    keterangan: "Zakat Maal Usaha dari H. Lukman Hakim & Keluarga",
    jumlah: 12000000,
    petugas: "H. Mohammad Ridwan",
    donatur: "H. Lukman Hakim",
    metodePembayaran: "Transfer Bank",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202607-30",
    tanggal: "2026-07-30",
    jenis: "pengeluaran",
    danaKat: "Kas Operasional",
    kategori: "Gaji & Syahriyah Marbot",
    keterangan: "Syahriyah Bulanan 2 Orang Marbot & Security Masjid",
    jumlah: 4500000,
    petugas: "H. Mohammad Ridwan",
    metodePembayaran: "Transfer Bank",
    statusVerification: "Terverifikasi"
  },

  // --- JUNI 2026 ---
  {
    id: "TRX-202606-05",
    tanggal: "2026-06-05",
    jenis: "pemasukan",
    danaKat: "Kas Operasional",
    kategori: "Infaq Kotak Jumat",
    keterangan: "Hasil Kotak Infaq Shalat Jumat Pekan I Juni",
    jumlah: 4150000,
    petugas: "Panitia Jumat",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202606-15",
    tanggal: "2026-06-15",
    jenis: "pemasukan",
    danaKat: "Kas Pembangunan",
    kategori: "Infaq Pembangunan",
    keterangan: "Infaq Harian Kotak Pembangunan Menara",
    jumlah: 3450000,
    petugas: "H. Mohammad Ridwan",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  },
  {
    id: "TRX-202606-20",
    tanggal: "2026-06-20",
    jenis: "pengeluaran",
    danaKat: "Kas Operasional",
    kategori: "Kajian & Majelis Taklim",
    keterangan: "Konsumsi & Snack Jamaah Kajian Subuh Ahad Ceria",
    jumlah: 950000,
    petugas: "Ibu-ibu Majelis Taklim",
    metodePembayaran: "Tunai",
    statusVerification: "Terverifikasi"
  }
];

export const CATEGORIES_PEMASUKAN = [
  "Infaq Kotak Jumat",
  "Infaq Kotak Harian / Trombol",
  "Infaq QRIS Digital",
  "Donatur Tetap Bulanan",
  "Infaq Pembangunan & Renovasi",
  "Donasi Santunan Yatim & Dhuafa",
  "Zakat Maal",
  "Zakat Fitrah",
  "Sewa Aula / Peralatan DKM",
  "Sumbangan Hamba Allah",
  "Saldo Awal Kas",
];

export const CATEGORIES_PENGELUARAN = [
  "Listrik & Air PLN/PDAM",
  "Honorarium & Syahriyah Penceramah/Imam",
  "Gaji & Syahriyah Marbot / Security",
  "Kebersihan & Perlengkapan Sanitasi",
  "Perbaikan AC & Sound System",
  "Material & Bahan Bangunan",
  "Upah Tukang & Pekerja",
  "Santunan & Paket Sembako Dhuafa",
  "Penyaluran Zakat Kepada Mustahik",
  "Kajian & Majelis Taklim (Snack/Spanduk)",
  "Peralatan Kantor DKM & WiFi",
  "Lain-lain / Biaya Tak Terduga",
];
