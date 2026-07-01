import { SupplyListing, DemandListing, UserSession, UserRole, KYCStatus } from "../types";

export const INITIAL_SUPPLY_LISTINGS: SupplyListing[] = [
  {
    id: "sup-101",
    title: "Tanah Kavling Industri 5 Hektar Serang",
    category: "Properti",
    specifications: "Sertifikat SHM, Zona Industri, Akses Kontainer 40ft, Dekat Gerbang Tol Ciujung. Cocok untuk Pabrik atau Gudang.",
    location: "Serang, Banten",
    price: 35000000000,
    brokerId: "user-2",
    brokerName: "Hendra Wijaya",
    brokerPhone: "+628123456789",
    status: "VERIFIED",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=60",
    createdAt: "2026-06-10T10:00:00Z",
    expiresAt: "2026-06-24T10:00:00Z",
    viewsCount: 42,
    isPremium: true,
    premiumUntil: "2026-06-24T10:00:00Z"
  },
  {
    id: "sup-102",
    title: "Excavator Caterpillar 320 GC 2022 (Seken Terawat)",
    category: "Alat Berat",
    specifications: "Hour meter 3400 Jam, Mesin Kering Orisinil, Pompa & Track Link Sehat 85%, Surat Invoice dan Dokumen Pembelian Lengkap.",
    location: "Balikpapan, Kalimantan Timur",
    price: 1250000000,
    brokerId: "user-2",
    brokerName: "Hendra Wijaya",
    brokerPhone: "+628123456789",
    status: "ON_PROGRESS",
    imageUrl: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=600&auto=format&fit=crop&q=60",
    createdAt: "2026-06-12T14:30:00Z",
    expiresAt: "2026-06-26T14:30:00Z",
    viewsCount: 28
  },
  {
    id: "sup-103",
    title: "Batu Bara Kalori GAR 4200 - Ready Stock 50.000 MT",
    category: "Komoditas",
    specifications: "GAR 4200, FOB Barge Jetty Kalteng. Pembayaran LC Lokal atau SKBDN term 100% At Sight. Sudah ada COA Sucofindo.",
    location: "Katingan, Kalimantan Tengah",
    price: 850000, // per ton
    brokerId: "user-4",
    brokerName: "Rudi Siswanto",
    brokerPhone: "+628776655443",
    status: "VERIFIED",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60",
    createdAt: "2026-06-14T08:15:00Z",
    expiresAt: "2026-06-28T08:15:00Z",
    viewsCount: 95,
    isPremium: true,
    premiumUntil: "2026-06-28T08:15:00Z"
  },
  {
    id: "sup-105",
    title: "Pipa Baja Carbon Seamless 10 Inch - ASTM A106 (Hampir Kadaluarsa)",
    category: "Alat Berat",
    specifications: "Sisa proyek pabrik kimia sebanyak 120 batang, gred ASTM A106 Grade B, panjang 6 meter, dokumen sertifikat lengkap.",
    location: "Cilegon, Banten",
    price: 450000000,
    brokerId: "user-2",
    brokerName: "Hendra Wijaya",
    brokerPhone: "+628123456789",
    status: "VERIFIED",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=60",
    createdAt: "2026-06-03T08:00:00Z",
    expiresAt: "2026-06-17T08:00:00Z", // Expiring very soon relative to June 16, 2026
    viewsCount: 78
  },
  {
    id: "sup-104",
    title: "Ruko Strategis 3 Lantai Commercial Area Gading Serpong",
    category: "Properti",
    specifications: "Luas Tanah 90m2, Luas Bangunan 240m2. Hadap Jalan Boulevard Utama. Listrik 4400W, Air PAM. Sertifikat HGB.",
    location: "Tangerang, Banten",
    price: 4800000000,
    brokerId: "user-2",
    brokerName: "Hendra Wijaya",
    brokerPhone: "+628123456789",
    status: "CLOSED",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=60",
    createdAt: "2026-05-20T09:00:00Z",
    expiresAt: "2026-06-03T09:00:00Z", // Already Expired
    viewsCount: 110
  }
];

export const INITIAL_DEMAND_LISTINGS: DemandListing[] = [
  {
    id: "dem-201",
    title: "Dicari Lahan Industri Min. 3 Hektar daerah Serang / Cilegon",
    category: "Properti",
    criteria: "Sertifikat wajib Clean & Clear (minimal SHM/HGB). Akses jalan lebar bisa dilewati kontainer trailer. Budget budget max 40 Miliar.",
    budgetMin: 20000000000,
    budgetMax: 40000000000,
    paymentSystem: "Cash Bertahap / SKBDN",
    brokerId: "user-3",
    brokerName: "Amiruddin",
    brokerPhone: "+628529988776",
    status: "VERIFIED",
    createdAt: "2026-06-15T11:00:00Z",
    expiresAt: "2026-06-29T11:00:00Z",
    isPremium: true,
    premiumUntil: "2026-06-29T11:00:00Z"
  },
  {
    id: "dem-202",
    title: "Kebutuhan Unit Excavator 20 Ton Seken Komatsu/Caterpillar",
    category: "Alat Berat",
    criteria: "Unit tahun 2018 ke atas, siap kerja, mesin orisinil dan kering. Lokasi Kalimantan diutamakan agar hemat ongkos kirim.",
    budgetMin: 800000000,
    budgetMax: 1300000000,
    paymentSystem: "Cash Keras setelah Gesek No Rangka & No Mesin",
    brokerId: "user-3",
    brokerName: "Amiruddin",
    brokerPhone: "+628529988776",
    status: "VERIFIED",
    createdAt: "2026-06-16T12:00:00Z",
    expiresAt: "2026-06-30T12:00:00Z"
  },
  {
    id: "dem-204",
    title: "Butuh Scrap Besi Tua Kualitas Peleburan Tangerang (Hampir Kadaluarsa)",
    category: "Komoditas",
    criteria: "Dibutuhkan mendesak limbah Scrap Besi Tua Kelas A sebanyak 500 Ton untuk pabrik peleburan daerah Tangerang. Skema timbang bayar.",
    budgetMin: 3000000000,
    budgetMax: 3500000000,
    paymentSystem: "Cash Timbang Bayar",
    brokerId: "user-5",
    brokerName: "Irfan Kurniawan",
    brokerPhone: "+628991122334",
    status: "VERIFIED",
    createdAt: "2026-06-03T10:15:00Z",
    expiresAt: "2026-06-17T10:15:00Z" // Expiring very soon relative to June 16, 2026
  },
  {
    id: "dem-203",
    title: "Butuh Supply Batu Bara GAR 4200 Continuously 100.000 MT/Bulan",
    category: "Komoditas",
    criteria: "Untuk Domestik (PLTU Swasta). Wajib FOB Jetty Kalimantan yang draft aman untuk tongkang 300 feet. Pembayaran SKBDN Usance.",
    budgetMin: 800000,
    budgetMax: 900000, // per ton
    paymentSystem: "SKBDN Usance 90 days",
    brokerId: "user-5",
    brokerName: "Irfan Kurniawan",
    brokerPhone: "+628991122334",
    status: "ON_PROGRESS",
    createdAt: "2026-06-16T10:00:00Z",
    expiresAt: "2026-06-30T10:00:00Z"
  }
];

export const CATEGORIES = [
  "Properti",
  "Alat Berat",
  "Komoditas",
  "Otomotif",
  "Perkebunan & Pertanian",
  "Peluang Bisnis / F&B"
];

export const DEMO_USERS: UserSession[] = [
  {
    id: "user-1",
    fullName: "Doni Pratama (Demo Biasa)",
    email: "doni@rejekimacan.com",
    phoneNumber: "+6281122334455",
    role: UserRole.MAKELAR_BARANG,
    kycStatus: KYCStatus.UNREGISTERED,
    balance: 15000 // Saldo awal Rp 15k
  },
  {
    id: "user-2",
    fullName: "Hendra Wijaya",
    email: "hendra.broker@gmail.com",
    phoneNumber: "+628123456789",
    role: UserRole.MAKELAR_BARANG,
    kycStatus: KYCStatus.VERIFIED,
    ktpNumber: "3273012345670001",
    organization: "CV Indo Berkah Makmur",
    registeredAt: "2026-01-15",
    balance: 150000 // Saldo awal Rp 150k
  },
  {
    id: "user-3",
    fullName: "Amiruddin",
    email: "amir.buyeragent@yahoo.com",
    phoneNumber: "+628529988776",
    role: UserRole.MAKELAR_BUYER,
    kycStatus: KYCStatus.VERIFIED,
    ktpNumber: "3174023456780003",
    organization: "Amir & Partners Brokerage",
    registeredAt: "2026-02-10",
    balance: 200000 // Saldo awal Rp 200k
  },
  {
    id: "user-4",
    fullName: "Rudi Siswanto",
    email: "rudi.coal@gamil.com",
    phoneNumber: "+628776655443",
    role: UserRole.MAKELAR_BARANG,
    kycStatus: KYCStatus.VERIFIED,
    ktpNumber: "6472013456780002",
    organization: "Mitra Tambang Borneo",
    registeredAt: "2026-03-01",
    balance: 75000 // Saldo awal Rp 75k
  }
];
export const DOCS_MARKDOWN = `
# DOKUMEN SPESIFIKASI TEKNIS AWAL: REJEKI MACAN
### Konsep: "Mediator & Broker Matchmaking Platform"
**Disusun Oleh**: Senior System Analyst & Full-Stack Developer
**Tanggal**: Juni 2026
**Target Distribusi**: Developer, Integrator n8n, & Stakeholder Bisnis

---

## 1. USER JOURNEY & ALUR REGISTRASI (KYC)

Platform Rejeki Macan mengutamakan **validitas info** dan **reputasi mediator**. Keberadaan mediator fiktif atau listing bodong adalah risiko operasional terbesar ("buyer palsu" atau "owner modal foto Google"). Oleh karena itu, diterapkan sistem verifikasi berlapis.

### A. Alur Registrasi & KYC (Know Your Customer)
1. **Registrasi Awal**: Pengguna mendaftar dengan menginput *Nama Lengkap, No. WhatsApp Aktif, Email*, dan *Kata Sandi*.
2. **Pemilihan Hak Akses Akun (Spesialisasi)**:
   - **Makelar Barang (Supply Broker)**: Pengguna yang ahli mencari/memiliki akses ke tangan pertama (A1) pemilik barang/lahan.
   - **Makelar Buyer (Demand Broker)**: Pengguna yang memiliki pembeli konkret (Funder/Buyer) yang siap bertransaksi dengan kriteria tertentu.
3. **Prosedur Unggah Dokumen KYC**:
   - Foto KTP & Selfie memegang KTP.
   - Pengisian Nomor NIK (KTP Elektronik).
   - Nama Perusahaan / Nama Asosiasi Broker (Opsional, cth: AREBI atau independen).
4. **Pemeriksaan Administrasi**:
   - Sistem menahan akun dalam status \`PENDING_KYC\`.
   - Admin/Sistem Verifikator melakukan verifikasi keaslian NIK dan validasi foto wajah.
   - Setelah sukses, status naik menjadi \`VERIFIED\` dan berhak mengaktifkan fitur pencatatan listing transaksi bernilai besar.

### B. Matriks Hak Akses Akun

| Peran Akun | Hak Akses Dashboard | Limitasi Posting | Notifikasi Kecocokan |
| :--- | :--- | :--- | :--- |
| **Makelar Barang** | Melihat pasar demand, memposting supply barang valid. | Wajib melampirkan minimal 3 parameter validitas (Dokumen, Lokasi, Harga). | Notifikasi bila pembeli memposting kriteria yang pas. |
| **Makelar Buyer** | Melihat pasar supply, memposting kriteria pencarian buyer. | Wajib melampirkan rentang anggaran, tenggat waktu, dan skema bayar. | Notifikasi bila ada penjual mengunggah barang yang sesuai. |
| **Guest (Non-KYC)**| Read-Only ringkasan listing, sensor informasi detail nomor HP broker. | Tidak bisa memposting listing baru. | Tidak mendapat sinyal pencarian otomatis. |

---

## 2. STRUKTUR DATABASE & FITUR UTAMA

Arsitektur database dirancang relasional untuk mendukung integrasi matchmaking yang presisi dan cepat.

### A. Struktur Skema Database Utama (Referensi Relasional)

#### 1. Tabel: \`users\`
| Nama Kolom | Tipe Data | Deskripsi / Constraint |
| :--- | :--- | :--- |
| \`id\` | UUID | Primary Key |
| \`full_name\` | VARCHAR(100)| Nama lengkap sesuai KTP |
| \`email\` | VARCHAR(100)| Unique, index untuk login |
| \`phone_number\`| VARCHAR(20) | Nomor WhatsApp utama |
| \`role\` | ENUM | \`"MAKELAR_BARANG"\` atau \`"MAKELAR_BUYER"\` |
| \`kyc_status\` | ENUM | \`"UNREGISTERED"\`, \`"PENDING"\`, \`"VERIFIED"\`, \`"REJECTED"\` |
| \`nik\` | VARCHAR(16) | NIK KTP, Dienkripsi |
| \`is_active\` | BOOLEAN | Penangguhan akun (\`default: true\`) |

#### 2. Tabel: \`supply_listings\` (Info Barang)
| Nama Kolom | Tipe Data | Deskripsi / Constraint |
| :--- | :--- | :--- |
| \`id\` | UUID | Primary Key |
| \`broker_id\` | UUID | Foreign Key -> \`users.id\` |
| \`title\` | VARCHAR(150)| Judul penawaran barang |
| \`category\` | VARCHAR(50) | Cth: \`"Properti"\`, \`"Alat Berat"\`, \`"Komoditas"\` |
| \`specifications\`| TEXT | Spesifikasi detail, kondisi barang, kelengkapan surat |
| \`location\` | VARCHAR(100)| Lokasi fisik barang/lahan |
| \`price\` | DECIMAL(20,2)| Nilai penawaran harga |
| \`status\` | ENUM | \`"VERIFIED"\`, \`"ON_PROGRESS"\`, \`"CLOSED"\` |
| \`views_count\` | INT | Statistik kunjungan |
| \`created_at\` | TIMESTAMP | Waktu pembuatan proposal |

#### 3. Tabel: \`demand_listings\` (Info Pencarian Buyer)
| Nama Kolom | Tipe Data | Deskripsi / Constraint |
| :--- | :--- | :--- |
| \`id\` | UUID | Primary Key |
| \`broker_id\` | UUID | Foreign Key -> \`users.id\` |
| \`title\` | VARCHAR(150)| Kebutuhan buyer utama |
| \`category\` | VARCHAR(50) | Cth: \`"Properti"\`, \`"Alat Berat"\`, \`"Komoditas"\` |
| \`criteria\` | TEXT | Deskripsi kriteria yang dicari dan batas toleransi |
| \`budget_min\` | DECIMAL(20,2)| Batas bawah anggaran belanja |
| \`budget_max\` | DECIMAL(20,2)| Batas atas anggaran belanja |
| \`payment_system\`| VARCHAR(100)| Cth: \`"Cash Keras"\`, \`"SKBDN"\`, \`"LC At Sight"\`, \`"Termin"\` |
| \`status\` | ENUM | \`"VERIFIED"\`, \`"ON_PROGRESS"\`, \`"CLOSED"\` |

---

## 3. SISTEM MATCHMAKING (CORE MATCH SYSTEM)

Sistem Rejeki Macan mengidentifikasi ketertarikan silang secara instan. Algoritme pencocokan bekerja dalam 3 fase berikut:

\`\`\`
[Listing Baru Diinput]
          │
          ▼
[Filter Kategori & Lokasi]
          │
          ▼
[Pengecekan Rentang Harga vs Anggaran]
          │
          ▼
[Analisis Teks / Keyword Kemiripan Kriteria]
          │
          ▼
[Skor Matchmaking > Threshold 65%]
          │
          ▼
[Kirim Notifikasi Otomatis (Web Push / WA Bot via n8n)]
\`\`\`

### Aturan Kalkulasi Logika Matchmaker (Pencocokan Otomatis)
Bila Makelar Buyer mendaftarkan pencarian baru, sistem menjalankan query pencarian silang otomatis pada tabel \`supply_listings\`:
1. **Aturan Kategori (Batas Mati)**: Kategori wajib sama eksak (\`supply.category == demand.category\`). Jika berbeda, kecocokan = 0%.
2. **Aturan Anggaran**:
   - Harga Penjual harus berada di dalam rentang anggaran Pembeli (\`price >= budget_min\` DAN \`price <= budget_max\`).
   - Toleransi Over-budget maksimal 10% dari \`budget_max\` dengan penurunan skor 20%.
3. **Analisis Keyword**: Kesamaan kata kunci (Semantik sederhana) antara kolom \`specifications\` dan \`criteria\` (misal korelasi kata kunci seperti "Serang", "SHM", "FOB", "LC").
4. **Trigger Event**: Jika Skor Kompatibilitas Akhir **>= 65%**, pasangkan ID kedua belah pihak di tabel transaksi prospek, lalu kirimkan payload webhook ke broker masing-masing.

---

## 4. REKOMENDASI TECH STACK (EFISIENSI & PORTABILITAS MOBILE)

Untuk menghemat biaya pembuatan dan mempercepat proses *convert* ke aplikasi Android/iOS tanpa perlu menulis ulang (rewrite) logika bisnis dari nol, arsitektur berikut adalah pilihan terbaik:

### A. Frontend Mobile-First Ready
* **Teknologi Utama**: **React** dengan **Vite** dan **Tailwind CSS**.
* **Alasan Mobile-Ready**:
  - Dikombinasikan dengan wrapper seperti **CapacitorJS** (dikembangkan oleh Ionic), seluruh aset HTML/JS/CSS buatan React dapat dikompilasi langsung menjadi aplikasi native Android (.apk/.aab) dan iOS (.ipa) yang mengakses fitur smartphone (seperti Camera untuk KYC, WhatsApp Share, Push Notification) secara instan.
  - Sangat ramah performa, waktu startup cepat, dan tidak memerlukan tim developer iOS & Android terpisah (cukup Developer Web React umum).

### B. Backend API & Automasi n8n
* **Framework Backend**: **Node.js (Express)** dengan **TypeScript**.
* **ORM / Database**: 
  - **PostgreSQL** atau **SQLite / Cloud Firestore** untuk penayangan data relasional yang stabil.
  - Menghasilkan respon JSON RESTful murni untuk dibaca oleh platform mobile maupun node *Integrator Automation*.

---

## 5. ARSITEKTUR API & INTEGRASI AUTOMASI BOT (Telegram/WhatsApp via n8n)

Sistem dirancang sebagai **API-First Engine** yang memudahkan n8n (atau Zapier/Make) melakukan sinkronisasi dengan bot WhatsApp Business / Telegram Group secara instan tanpa mengganggu inti web app.

### API Endpoints Spesifik untuk Integrasi n8n

#### 1. POLLING / WEBHOOK LISTING NEW (\`POST /api/webhooks/listings\`)
Mengirim notifikasi ke n8n ketika ada mediator yang memposting Supply baru atau Demand baru agar n8n bisa memposting info tersebut secara otomatis ke channel Telegram Broker.
* **Payload Format (JSON)**:
\`\`\`json
{
  "event": "listing.created",
  "type": "SUPPLY",
  "listing_id": "sup-101",
  "title": "Tanah Kavling Industri 5 Hektar Serang",
  "category": "Properti",
  "price": 35000000000,
  "location": "Serang, Banten",
  "broker_name": "Hendra Wijaya",
  "broker_phone": "+628123456789",
  "specifications": "SHM, Zona Industri..."
}
\`\`\`

#### 2. SEARCH MUTUAL MATCH (\`GET /api/matchmaker/query-match?id=...\`)
Dipanggil oleh n8n untuk mendapatkan daftar supply terdekat yang cocok saat pemicu bot WhatsApp menerima kata kunci pesan dari broker di lapangan. Hal ini berguna untuk membuat fitur query interaktif "Ketik /cari properti Serang" di WA/Telegram.
* **Response Format (JSON)**:
\`\`\`json
{
  "status": "success",
  "matches_found": 1,
  "data": [
    {
      "match_id": "match-889",
      "score": 85,
      "supply_title": "Tanah Kavling Industri 5 Hektar Serang",
      "demand_title": "Dicari Lahan Industri Min. 3 Hektar Serang",
      "supply_broker_phone": "+628123456789",
      "demand_broker_phone": "+628529988776",
      "match_details": ["Kategori Properti Cocok", "Anggaran 35M Masuk Batas Maksimum 40M", "Lokasi Serang Sesuai"]
    }
  ]
}
\`\`\`

#### 3. UPDATE TRANSACTION STATUS (\`PATCH /api/listings/:id/status\`)
Dipanggil untuk merubah status transaksi/listing saat ada perubahan kesepakatan lewat obrolan grup WA Broker, sehingga sistem web otomatis terupdate (Verified -> On Progress -> Closed).
* **Request Header**: \`X-RejekiMacan-Token: dev-n8n-token-secured\`
* **Payload Format**:
\`\`\`json
{
  "status": "ON_PROGRESS"
}
\`\`\`
* **Response**:
\`\`\`json
{
  "status": "success",
  "message": "Listing status updated to ON_PROGRESS",
  "updated_at": "2026-06-16T21:30:26Z"
}
\`\`\`
`;
