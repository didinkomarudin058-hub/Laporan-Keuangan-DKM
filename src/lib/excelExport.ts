import ExcelJS from 'exceljs';
import { Transaction } from '../types';

// Helper to format date into "4 Mei 2023"
const formatDateIndo = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const mIdx = parseInt(m, 10) - 1;
    return `${parseInt(d, 10)} ${monthNames[mIdx] || m} ${y}`;
  }
  return dateStr;
};

export interface ExportExcelOptions {
  transactions: Transaction[];
  mosqueName?: string;
  periodText?: string;
  filename?: string;
}

export const exportTransactionsToExcel = async ({
  transactions,
  mosqueName = 'Masjid',
  periodText = '',
  filename = 'Laporan_Keuangan_Masjid',
}: ExportExcelOptions) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DKM App';
  workbook.lastModifiedBy = 'DKM App';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Rincian Transaksi', {
    views: [{ showGridLines: true }]
  });

  // Border style definitions
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'D1D5DB' } },
    left: { style: 'thin', color: { argb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
    right: { style: 'thin', color: { argb: 'D1D5DB' } },
  };

  const headerBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'medium', color: { argb: '065F46' } },
    left: { style: 'thin', color: { argb: '065F46' } },
    bottom: { style: 'medium', color: { argb: '065F46' } },
    right: { style: 'thin', color: { argb: '065F46' } },
  };

  const totalBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: 'D1D5DB' } },
    bottom: { style: 'double', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: 'D1D5DB' } },
  };

  // Title section
  worksheet.addRow([]);
  const titleRow = worksheet.addRow([`LAPORAN TRANSAKSI KEUANGAN`]);
  titleRow.getCell(1).font = { name: 'Calibri', size: 14, bold: true, color: { argb: '065F46' } };
  
  const mosqueRow = worksheet.addRow([mosqueName]);
  mosqueRow.getCell(1).font = { name: 'Calibri', size: 12, bold: true, color: { argb: '1F2937' } };

  if (periodText) {
    const periodRow = worksheet.addRow([`Periode: ${periodText}`]);
    periodRow.getCell(1).font = { name: 'Calibri', size: 10, italic: true, color: { argb: '4B5563' } };
  } else {
    const periodRow = worksheet.addRow([`Total: ${transactions.length} Transaksi`]);
    periodRow.getCell(1).font = { name: 'Calibri', size: 10, italic: true, color: { argb: '4B5563' } };
  }

  worksheet.addRow([]); // Blank line

  // Column definitions
  const columns = [
    { header: 'NO', key: 'no', width: 6 },
    { header: 'TANGGAL', key: 'tanggal', width: 16 },
    { header: 'KETERANGAN', key: 'keterangan', width: 45 },
    { header: 'KATEGORI', key: 'kategori', width: 26 },
    { header: 'KAS', key: 'kas', width: 18 },
    { header: 'PEMASUKAN (RP)', key: 'pemasukan', width: 22 },
    { header: 'PENGELUARAN (RP)', key: 'pengeluaran', width: 22 },
  ];

  // Header Row
  const headerRowValues = columns.map(c => c.header);
  const tableHeaderRow = worksheet.addRow(headerRowValues);
  tableHeaderRow.height = 26;

  tableHeaderRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '065F46' }, // Dark Emerald
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFF' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber === 6 || colNumber === 7 ? 'right' : colNumber === 1 || colNumber === 2 ? 'center' : 'left',
    };
    cell.border = headerBorder;
  });

  let totalInflow = 0;
  let totalOutflow = 0;

  // Add Data Rows
  transactions.forEach((trx, index) => {
    const isPemasukan = trx.jenis === 'pemasukan';
    const isPengeluaran = trx.jenis === 'pengeluaran';

    const pmt = isPemasukan ? trx.jumlah : null;
    const pgt = isPengeluaran ? trx.jumlah : null;

    if (isPemasukan) totalInflow += trx.jumlah;
    if (isPengeluaran) totalOutflow += trx.jumlah;

    let ket = trx.keterangan || '';
    if (trx.donatur) {
      ket += ` (Donatur: ${trx.donatur})`;
    }

    const rowData = [
      index + 1,
      formatDateIndo(trx.tanggal),
      ket,
      trx.kategori || '-',
      trx.danaKat || 'Kas Tunai',
      pmt,
      pgt,
    ];

    const row = worksheet.addRow(rowData);
    row.height = 20;

    // Apply styles to each cell in data row
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = thinBorder;
      cell.alignment = { vertical: 'middle' };

      if (colNumber === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      } else if (colNumber === 4 || colNumber === 5) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (colNumber === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = 'Rp #,##0';
        if (cell.value) {
          cell.font = { name: 'Calibri', size: 10, color: { argb: '047857' }, bold: true };
        }
      } else if (colNumber === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = 'Rp #,##0';
        if (cell.value) {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'E11D48' }, bold: true };
        }
      }
    });
  });

  // Total Summary Row
  const totalRow = worksheet.addRow([
    '',
    '',
    'TOTAL',
    '',
    '',
    totalInflow,
    totalOutflow,
  ]);
  totalRow.height = 24;

  totalRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F3F4F6' },
    };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '111827' } };
    cell.border = totalBorder;

    if (colNumber === 3) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
    } else if (colNumber === 6) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = 'Rp #,##0';
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '047857' } };
    } else if (colNumber === 7) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = 'Rp #,##0';
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'E11D48' } };
    }
  });

  // Net Balance Row
  const netBalance = totalInflow - totalOutflow;
  const netRow = worksheet.addRow([
    '',
    '',
    'SALDO AKHIR (PEMASUKAN - PENGELUARAN)',
    '',
    '',
    netBalance,
    '',
  ]);
  netRow.height = 24;

  // Merge cell for Net Balance title
  worksheet.mergeCells(`C${netRow.number}:E${netRow.number}`);

  netRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ECFDF5' },
    };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '065F46' } };
    cell.border = totalBorder;

    if (colNumber === 3) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
    } else if (colNumber === 6) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = 'Rp #,##0';
    }
  });

  // Set explicit column widths
  columns.forEach((col, idx) => {
    worksheet.getColumn(idx + 1).width = col.width;
  });

  // Generate buffer & trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const dateTag = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filename}_${dateTag}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fullFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};
