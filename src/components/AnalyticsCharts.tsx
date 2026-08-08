import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Wallet } from 'lucide-react';
import { Transaction, FundCategory } from '../types';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  posDanaList?: string[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  posDanaList = ['Kas Operasional', 'Kas Pembangunan', 'Kas Yatim & Sosial', 'Kas Zakat & Shadaqah'],
}) => {
  // 1. Monthly Cashflow Data (Grouping by YYYY-MM)
  const monthlyDataMap: Record<string, { month: string; pemasukan: number; pengeluaran: number; surplus: number }> = {};

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  transactions.forEach((t) => {
    const dateObj = new Date(t.tanggal);
    const year = dateObj.getFullYear();
    const monthIdx = dateObj.getMonth();
    const key = `${monthNamesShort[monthIdx]} ${year}`;

    if (!monthlyDataMap[key]) {
      monthlyDataMap[key] = { month: key, pemasukan: 0, pengeluaran: 0, surplus: 0 };
    }

    if (t.jenis === 'pemasukan') {
      monthlyDataMap[key].pemasukan += t.jumlah;
    } else {
      monthlyDataMap[key].pengeluaran += t.jumlah;
    }
    monthlyDataMap[key].surplus = monthlyDataMap[key].pemasukan - monthlyDataMap[key].pengeluaran;
  });

  const monthlyTrendData = Object.values(monthlyDataMap);

  // 2. Fund Category Distribution (Dynamic Pos Dana)
  const fundCategories: FundCategory[] = posDanaList;

  const fundColors = ['#059669', '#2563eb', '#d97706', '#9333ea', '#0d9488', '#0284c7', '#7c3aed', '#db2777'];

  const fundDistributionData = fundCategories.map((cat, idx) => {
    const catT = transactions.filter((t) => t.danaKat === cat);
    const inc = catT.filter((t) => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const exp = catT.filter((t) => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
    return {
      name: cat,
      value: Math.max(inc - exp, 0),
      color: fundColors[idx % fundColors.length],
    };
  });

  // 3. Top Expense Categories
  const expenseCatMap: Record<string, number> = {};
  transactions
    .filter((t) => t.jenis === 'pengeluaran')
    .forEach((t) => {
      expenseCatMap[t.kategori] = (expenseCatMap[t.kategori] || 0) + t.jumlah;
    });

  const topExpenseColors = ['#f43f5e', '#fb7185', '#fda4af', '#f43f5e', '#e11d48', '#be123c'];

  const expenseCategoryData = Object.entries(expenseCatMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // 4. Top Income Categories
  const incomeCatMap: Record<string, number> = {};
  transactions
    .filter((t) => t.jenis === 'pemasukan' && t.kategori !== 'Saldo Awal Kas')
    .forEach((t) => {
      incomeCatMap[t.kategori] = (incomeCatMap[t.kategori] || 0) + t.jumlah;
    });

  const incomeCategoryData = Object.entries(incomeCatMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Custom Rupiah Tooltip Formatter
  const formatRupiahTooltip = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-700" />
          Grafik Analisis & Visualisasi Kas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tren penerimaan infaq vs pengeluaran, distribusi saldo pos kas, dan komposisi belanja operasional.
        </p>
      </div>

      {/* Row 1: Monthly Cashflow Trend */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              Perbandingan Pemasukan vs Pengeluaran per Bulan
            </h3>
            <p className="text-xs text-slate-500">Pertumbuhan infaq dan ritme pengeluaran operasional</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip 
                formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="pemasukan" name="Total Pemasukan (+)" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Total Pengeluaran (-)" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Pie Charts (Fund Distribution & Top Expense Categories) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie 1: Saldo Kas per Pos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-700" />
              Distribusi Saldo per Pos Dana Kas
            </h3>
            <p className="text-xs text-slate-500">Proporsi kas operasional, pembangunan, yatim, & ZIS</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {fundDistributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatRupiahTooltip(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie 2: Top Expense Categories */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-rose-600" />
              Pos Pengeluaran Terbesar
            </h3>
            <p className="text-xs text-slate-500">Kategori alokasi biaya terbesar di DKM</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  label={({ name }) => name}
                >
                  {expenseCategoryData.map((_, idx) => (
                    <Cell key={`exp-${idx}`} fill={topExpenseColors[idx % topExpenseColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatRupiahTooltip(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
