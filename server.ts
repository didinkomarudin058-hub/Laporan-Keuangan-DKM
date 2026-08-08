import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI DKM Monthly Report Narrative Summarizer Route
  app.post("/api/gemini/summarize-report", async (req, res) => {
    try {
      const {
        masjidName,
        monthYear,
        startingBalance,
        totalIncome,
        totalExpense,
        endingBalance,
        fundBreakdown,
        incomeDetails,
        expenseDetails,
      } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "GEMINI_API_KEY belum dikonfigurasi di lingkungan server.",
        });
      }

      const prompt = `
Anda adalah Sekretaris & Bendahara Dewan Kemakmuran Masjid (DKM) yang berpengalaman, santun, dan sangat amanah.
Tolong buatkan narasi laporan keuangan bulanan yang resmi, transparan, dan siap dibacakan saat Pengumuman Shalat Jumat atau dicetak di Buletin / Papan Pengumuman Masjid.

Data Laporan Keuangan:
- Nama Masjid: ${masjidName || "Masjid Al-Ikhlas"}
- Periode Laporan: ${monthYear}
- Saldo Awal Kas: Rp ${Number(startingBalance || 0).toLocaleString("id-ID")}
- Total Pemasukan Bulan Ini: Rp ${Number(totalIncome || 0).toLocaleString("id-ID")}
- Total Pengeluaran Bulan Ini: Rp ${Number(totalExpense || 0).toLocaleString("id-ID")}
- Saldo Akhir Kas: Rp ${Number(endingBalance || 0).toLocaleString("id-ID")}

Rincian Kas Per Katagori Dana:
${JSON.stringify(fundBreakdown || {}, null, 2)}

Ringkasan Pemasukan Utama:
${(incomeDetails || []).slice(0, 6).map((i: any) => `- ${i.keterangan || i.kategori}: Rp ${Number(i.jumlah).toLocaleString("id-ID")}`).join("\n")}

Ringkasan Pengeluaran Utama:
${(expenseDetails || []).slice(0, 6).map((e: any) => `- ${e.keterangan || e.kategori}: Rp ${Number(e.jumlah).toLocaleString("id-ID")}`).join("\n")}

Instruksi Format Output:
1. Awali dengan Salam Islami (Assalamu'alaikum Wr. Wb.) serta Puji Syukur & Shalawat.
2. Sampaikan ringkasan posisi kas masjid secara ringkas, jelas, dan terbuka.
3. Sebutkan ucapan terima kasih & doa (Jazakumullah Khairan Katsiran) untuk para donatur, mukhsinin, dan seluruh jamaah.
4. Berikan highlight penggunaan dana atau catatan amanah pengurus.
5. Tutup dengan ajakan untuk meningkatkan ketakwaan dan infaq, dilanjutkan Salam penutup.
6. Buat dalam format Markdown yang rapi dengan poin-poin bold. Bahasa Indonesia yang santun, islami, profesional, dan menenangkan jamaah.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      const summaryText = response.text || "Tidak ada narasi yang dihasilkan.";
      res.json({ narrative: summaryText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error.message || "Gagal membuat narasi laporan keuangan.",
      });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DKM Financial App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
