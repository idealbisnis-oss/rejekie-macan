import { useState } from "react";
import { 
  BookOpen, FileText, Database, GitMerge, Cpu, Terminal, 
  Copy, Check, ChevronRight, Server, Phone, UserCheck, ShieldAlert 
} from "lucide-react";
import { DOCS_MARKDOWN } from "../data/mockData";

export default function DocumentationView() {
  const [activeTab, setActiveTab] = useState<"kyc" | "database" | "matchmaker" | "tech" | "api" | "raw">("kyc");
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const copyFullDocs = () => {
    navigator.clipboard.writeText(DOCS_MARKDOWN);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { id: "kyc" as const, label: "1. User Journey & KYC", icon: UserCheck },
    { id: "database" as const, label: "2. Struktur Database", icon: Database },
    { id: "matchmaker" as const, label: "3. Logika Matchmaker", icon: GitMerge },
    { id: "tech" as const, label: "4. Rekomendasi Tech Stack", icon: Cpu },
    { id: "api" as const, label: "5. Arsitektur & API n8n", icon: Terminal },
    { id: "raw" as const, label: "Lihat Raw Markdown Dokumen", icon: FileText },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl overflow-hidden border border-slate-800" id="tech-docs-section">
      {/* Header Docs */}
      <div className="p-6 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
            System Analyst Workspace
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Dokumen Spesifikasi Teknis Awal</h2>
          <p className="text-sm text-slate-400 mt-0.5">Konsep Mediator & Broker Matchmaking Engine - Rejeki Macan</p>
        </div>
        <button
          onClick={copyFullDocs}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all text-xs font-semibold rounded-lg self-start md:self-center cursor-pointer shadow-md"
        >
          {copied ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} className="stroke-[3]" />}
          {copied ? "Berhasil Disalin!" : "Salin Format Markdown"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 bg-slate-950 border-r border-slate-800 p-4 shrink-0">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-all ${
                    isActive 
                      ? "bg-amber-500 text-slate-950 shadow-md" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={isActive ? "text-slate-950" : "text-slate-600"} />
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 tracking-wide leading-relaxed">
            <span className="font-semibold text-slate-200 block mb-1">💡 Tips Integrator</span>
            Dokumen ini terstruktur sesuai standar rekayasa perangkat lunak untuk mempermudah parsing sistem atau rancangan n8n.
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-6 lg:p-8 bg-slate-900/45 overflow-y-auto max-h-[650px]">
          {activeTab === "kyc" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="text-amber-500" size={20} />
                  1. Alur Registrasi & KYC Verifikasi
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Mencegah mediator fiktif dengan mengamankan data pengguna di awal registrasi dan mengelompokkan spesialisasi broker.
                </p>
              </div>

              {/* Visual Flow Representation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-amber-500 block mb-1">LANGKAH 01</span>
                  <p className="text-xs font-semibold text-slate-200">Registrasi Awal</p>
                  <p className="text-[10px] text-slate-500 mt-1">Nama, Email, WhatsApp & Password</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-amber-500 block mb-1">LANGKAH 02</span>
                  <p className="text-xs font-semibold text-slate-200">Pilih Tipe Peran</p>
                  <p className="text-[10px] text-slate-500 mt-1">Makelar Barang vs Makelar Buyer</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-amber-500 block mb-1">LANGKAH 03</span>
                  <p className="text-xs font-semibold text-slate-200">Unggah KYC/NIK</p>
                  <p className="text-[10px] text-slate-500 mt-1">Foto KTP Elektronik & Verifikasi NIK</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-amber-500/30 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-amber-500 block mb-1">LANGKAH 04</span>
                  <p className="text-xs font-semibold text-slate-100">Status Verified</p>
                  <p className="text-[10px] text-amber-500/80 mt-1">Membuka seluruh detail nomor telepon broker A1</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-200">Mengapa Proteksi KYC Sangat Penting?</h4>
                <div className="bg-slate-950/70 p-4 rounded-lg border-l-4 border-amber-500 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>
                    <strong>Skema Rantai Panjang (Chain Brokerage):</strong> Di Indonesia, transaksi seperti komoditas batu bara atau jual beli tanah korporasi seringkali melibatkan mediator berlapis (mediator dari mediator dari mediator).
                  </p>
                  <p>
                    <strong>Solusi Rejeki Macan:</strong> Hanya memperkenankan registrasi pengguna yang lolos KYC KTP untuk memicu status <strong>Verified Listing</strong>. Hal ini memotong peredaran data palsu di mana makelar memposting barang yang bukan hak kuasanya atau fiktif.
                  </p>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-950 p-3 font-semibold text-slate-300 border-b border-slate-800">
                    Hak Akses Detail Peran
                  </div>
                  <div className="p-4 space-y-3 bg-slate-900/50">
                    <div>
                      <span className="text-amber-500 font-bold block">👤 Makelar Barang (Supply Side)</span>
                      <p className="text-slate-400 mt-0.5">Memiliki akses info barang/lahan lapak langsung (Owner). Diizinkan memposting spesifikasi lengkap barang, koordinat lokasi, dan harga jualan valid.</p>
                    </div>
                    <hr className="border-slate-800" />
                    <div>
                      <span className="text-amber-500 font-bold block">🚨 Makelar Buyer (Demand Side)</span>
                      <p className="text-slate-400 mt-0.5">Memegang pesanan dari Pembeli Utama (End Buyer/Funder) yang memiliki alokasi anggaran jelas. Diizinkan memposting daftar syarat spek dan sistem transaksi bayar yang disetujui (Cth: SKBDN, LC term 100%).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "database" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="text-amber-500" size={20} />
                  2. Struktur Skema Database Relasional
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Sistem database dirancang terindeks dengan hubungan foreign-key yang kokoh untuk memfasilitasi pencocokan matching kriteria secara real-time.
                </p>
              </div>

              {/* Table Schema 1: Users */}
              <div className="space-y-3">
                <span className="text-xs font-semibold bg-slate-800 px-2 py-1 text-slate-300 rounded border border-slate-700 font-mono">
                  TABEL: users
                </span>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Nama Kolom</th>
                        <th className="p-3">Tipe Data</th>
                        <th className="p-3">Keterangan / Constraint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-400">
                      <tr>
                        <td className="p-3 font-mono text-slate-200">id</td>
                        <td className="p-3 font-mono text-amber-500">UUID</td>
                        <td className="p-3">Primary Key, default gen_random_uuid()</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-200">full_name</td>
                        <td className="p-3 font-mono">VARCHAR(100)</td>
                        <td className="p-3">Nama asli KTP pendaftar</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-200">role</td>
                        <td className="p-3 font-mono">ENUM</td>
                        <td className="p-3">"MAKELAR_BARANG" | "MAKELAR_BUYER" | "ADMIN"</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-200">kyc_status</td>
                        <td className="p-3 font-mono">ENUM</td>
                        <td className="p-3">"UNREGISTERED" | "PENDING" | "VERIFIED" | "REJECTED"</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-200">whatsapp_number</td>
                        <td className="p-3 font-mono">VARCHAR(20)</td>
                        <td className="p-3">Format internasional ex: +62811234567</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table Schema 2: Supply Listings */}
              <div className="space-y-3 pt-4">
                <span className="text-xs font-semibold bg-slate-800 px-2 py-1 text-slate-300 rounded border border-slate-700 font-mono">
                  TABEL: supply_listings
                </span>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Nama Kolom</th>
                        <th className="p-3">Tipe Data</th>
                        <th className="p-3">Keterangan / Constraint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-400">
                      <tr>
                        <td className="p-3 font-mono text-slate-200">id</td>
                        <td className="p-3 font-mono text-amber-500">UUID</td>
                        <td className="p-3">Primary Key</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-200">broker_id</td>
                        <td className="p-3 font-mono text-red-400">UUID</td>
                        <td className="p-3">Foreign Key -&gt; users.id</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-200">category</td>
                        <td className="p-3 font-mono">VARCHAR(50)</td>
                        <td className="p-3">Index pencarian (Properti, Alat Berat, Komoditas)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-200">price</td>
                        <td className="p-3 font-mono">DECIMAL(20,2)</td>
                        <td className="p-3">Harga rill atau per satuan unit (ton, m2)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-200">status</td>
                        <td className="p-3 font-mono">ENUM</td>
                        <td className="p-3">"VERIFIED" (Listing Valid) | "ON_PROGRESS" | "CLOSED"</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matchmaker" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitMerge className="text-amber-500" size={20} />
                  3. Logika Penghitungan Matchmaking System
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Protokol komparasi cerdas yang mendeteksi tumpang-tindih (overlap) kriteria suplai barang dengan pesanan pembeli.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Algoritma Penilaian Kompatibilitas (%):</h4>
                
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-4">
                    <span className="w-24 font-mono font-bold text-amber-500 shrink-0">1. KATEGORI (50%)</span>
                    <p className="text-slate-400 leading-relaxed">
                      Kategori wajib sama persis. Jika kategori tidak cocok, skor langsung **0%** (Gagal Saring Akhir).
                    </p>
                  </div>
                  <hr className="border-slate-800" />
                  <div className="flex items-start gap-4">
                    <span className="w-24 font-mono font-bold text-amber-500 shrink-0">2. BUDGET (30%)</span>
                    <p className="text-slate-400 leading-relaxed">
                      Supply Price harus berada dalam kisaran rentang budget pembeli (budgetMin dan budgetMax). 
                      Jika price kurang dari atau sama dengan budgetMax, mendapat 30% penuh. Jika harga melebihi batasan maksimal up-to 10%, skor dipotong setengahnya (15%). Lebih dari 10% di atas anggaran dieliminasi.
                    </p>
                  </div>
                  <hr className="border-slate-800" />
                  <div className="flex items-start gap-4">
                    <span className="w-24 font-mono font-bold text-amber-500 shrink-0">3. DESKRIPSI (20%)</span>
                    <p className="text-slate-400 leading-relaxed">
                      Sistem melakukan sanitasi kata (lowercase) lalu memindai kecocokan kata kunci lokasi dan dokumen pendukung seperti **"SHM"**, **"SKBDN"**, **"FOB"**, atau singkatan kota daerah serupa. Tiap kecocokan menambah poin 5% hingga maksimum 20%.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 text-amber-500 text-xs rounded-lg border border-amber-500/20 font-medium">
                  <strong>Standard Prospek Match:</strong> Transaksi diusulkan bertemu di dashboard antarmuka hanya jika skor total hasil penyaringan bernilai **&gt;= 65%**.
                </div>
              </div>
            </div>
          )}

          {activeTab === "tech" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="text-amber-500" size={20} />
                  4. Rekomendasi Tech Stack untuk Portabilitas Mobile
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Rekomendasi taktis untuk mempermudah pengerjaan produk web modern agar langsung kompatibel dikonversi ke aplikasi mobile Android/iOS tanpa menduplikasi kodingan logika dari nol.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-amber-500 font-bold block">🚀 Option A: React + Tailwind + CapacitorJS (Direkomendasikan)</span>
                  <p className="text-slate-300 leading-relaxed">
                    Menggunakan **CapacitorJS** (Framework modern pengganti Cordova/Phonegap dari tim Ionic). Anda cukup me-wrap file build Vite static (`dist/`) ke dalam pembungkus native. 
                  </p>
                  <p className="text-slate-400 font-medium pt-1">
                    🟢 Keuntungan: 100% kode frontend web yang sama dipakai untuk web AND mobile. Performa tinggi dengan webviews modern.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-amber-500 font-bold block">🌟 Option B: React Native / Expo (Bila butuh Native UI mutlak)</span>
                  <p className="text-slate-300 leading-relaxed">
                    Membangun UI murni seluler menggunakan React Native. Logika TypeScript (`types.ts` dan fungsi kovert/API) dapat langsung disalin ke folder workspace React Native.
                  </p>
                  <p className="text-slate-400 font-medium pt-1">
                    🟢 Keuntungan: UI 100% Native, animasi sangat halus. Namun memerlukan koding ulang komponen visual dari web Tailwind.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-200 font-bold text-xs block">Rekomendasi Alur Tim Developer:</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mulailah pembangunan MVP (Minimum Viable Product) berbasis **React/Vite SPA** yang dioptimalkan dalam format UI mobile-first. Bungkus rilis perdana menggunakan **CapacitorJS** untuk meluncurkan file APK dalam waktu 1 hari pengembangan kerja, menghemat biaya jutaan rupiah di fase awal validasi pasar.
                </p>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="text-amber-500" size={20} />
                  5. Arsitektur API untuk Bot Automasi (n8n Integrasi)
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Dengan mengintegrasikan endpoint ini ke **n8n**, platform dapat secara otomatis menembak pesan peringatan kecocokan transaksi ke grup WhatsApp Makelar atau channel Telegram broadcast.
                </p>
              </div>

              {/* API 1 */}
              <div className="space-y-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-bold text-[10px] rounded border border-green-500/30">POST</span>
                    <span className="font-mono text-xs text-slate-300 font-bold">/api/webhooks/listings</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(`{\n  "event": "listing.created",\n  "type": "SUPPLY",\n  "listing_id": "sup-101",\n  "title": "Tanah Kavling Industri 5 Hektar Serang",\n  "category": "Properti",\n  "price": 35000000000,\n  "location": "Serang, Banten",\n  "broker_name": "Hendra Wijaya",\n  "broker_phone": "+628123456789"\n}`, "api-webhook")}
                    className="text-slate-500 hover:text-amber-500 cursor-pointer p-1"
                  >
                    {copiedText === "api-webhook" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[11px] text-slate-400">Trigger webhook keluar yang dikirimkan oleh sistem ke n8n ketika ada mediator mendaftarkan supply listing baru di website Rejeki Macan.</p>
                  <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto">
{`{
  "event": "listing.created",
  "type": "SUPPLY",
  "listing_id": "sup-101",
  "title": "Tanah Kavling Industri 5 Hektar Serang",
  "category": "Properti",
  "price": 35000000000,
  "location": "Serang, Banten",
  "broker_name": "Hendra Wijaya",
  "broker_phone": "+628123456789"
}`}
                  </pre>
                </div>
              </div>

              {/* API 2 */}
              <div className="space-y-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-bold text-[10px] rounded border border-blue-500/30">GET</span>
                    <span className="font-mono text-xs text-slate-300 font-bold">/api/matchmaker/query-match</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(`/api/matchmaker/query-match?id=dem-201`, "api-get-match")}
                    className="text-slate-500 hover:text-amber-500 cursor-pointer p-1"
                  >
                    {copiedText === "api-get-match" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[11px] text-slate-400">Endpoint query yang digunakan oleh n8n webhook untuk mencocokkan prospek klien secara real-time berdasarkan instruksi chat bot Telegram/WA.</p>
                  <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto">
{`{
  "status": "success",
  "matches_found": 1,
  "data": [
    {
      "match_id": "match-889",
      "score": 85,
      "supply_title": "Tanah Kavling Industri 5 Hektar Serang",
      "demand_title": "Dicari Lahan Industri Min. 3 Hektar Serang",
      "supply_broker_phone": "+628123456789",
      "demand_broker_phone": "+628529988776"
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "raw" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">full_technical_specification.md</span>
                <button
                  onClick={copyFullDocs}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold"
                >
                  <Copy size={12} />
                  Salin Semua
                </button>
              </div>
              <textarea
                value={DOCS_MARKDOWN}
                readOnly
                className="w-full h-96 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500 scrollbar-thin"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
