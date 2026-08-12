import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "database.json");

// Default Initial Seed Data
const INITIAL_DATA = {
  users: [
    {
      id: "admin-1",
      fullName: "Super Admin Platform",
      email: "admin@rejekimacan.com",
      password: "admin123", // For demo/initial access
      phoneNumber: "081299008811",
      role: "ADMIN",
      kycStatus: "VERIFIED",
      ktpNumber: "3171010022330001",
      organization: "Rejeki Macan HQ",
      registeredAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      balance: 1000000
    },
    {
      id: "user-1",
      fullName: "Hendra Wijaya",
      email: "hendra@broker.id",
      password: "user123",
      phoneNumber: "081122334455",
      role: "MAKELAR_BARANG",
      kycStatus: "VERIFIED",
      ktpNumber: "3201018899000002",
      organization: "Bumi Sejahtera Property",
      registeredAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      balance: 150000
    },
    {
      id: "user-2",
      fullName: "Amiruddin",
      email: "amir@buyeragent.com",
      password: "user123",
      phoneNumber: "081233445566",
      role: "MAKELAR_BUYER",
      kycStatus: "VERIFIED",
      ktpNumber: "3515027788990003",
      organization: "Jawa Investor Club",
      registeredAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      balance: 200000
    },
    {
      id: "user-3",
      fullName: "Budi Santoso",
      email: "budi@newmember.com",
      password: "user123",
      phoneNumber: "081987654321",
      role: "MAKELAR_BARANG",
      kycStatus: "PENDING",
      ktpNumber: "3172023344550004",
      organization: "Mandiri Brokerage",
      registeredAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      balance: 0
    }
  ],
  supplyListings: [
    {
      id: "SUP-001",
      title: "Lahan Industri Cikarang Barat 5.2 Hektar (Lahan Kosong Siap Bangun)",
      category: "Properti & Tanah",
      specifications: "Sertifikat SHGB atas nama PT, Zoni Industri, Lebar muka 120m, Akses Tol KM 31 (2km)",
      location: "Bekasi, Jawa Barat",
      price: 156000000000,
      brokerId: "user-1",
      brokerName: "Hendra Wijaya",
      brokerPhone: "081122334455",
      status: "VERIFIED",
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 9 * 24 * 3600 * 1000).toISOString(),
      viewsCount: 142,
      isPremium: true,
      premiumUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      isA1Verified: true
    },
    {
      id: "SUP-002",
      title: "Stock CPO Off-Spec / High FFA 500 Metric Ton (Komoditas)",
      category: "Komoditas & Hasil Bumi",
      specifications: "FFA 8-12%, Moisture max 0.5%, Impurities max 0.2%, Franco Gudang Medan",
      location: "Medan, Sumatera Utara",
      price: 6250000000,
      brokerId: "user-1",
      brokerName: "Hendra Wijaya",
      brokerPhone: "081122334455",
      status: "VERIFIED",
      imageUrl: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&q=80&w=1200",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(),
      viewsCount: 89,
      isPremium: false,
      isA1Verified: true
    },
    {
      id: "SUP-003",
      title: "Scrap Besi Berat (Heavy Melting Scrap) 1,200 Ton Eks Pabrik Tekstil",
      category: "Besi & Logam Scrap",
      specifications: "Besi H-Beam, Plate 12mm-25mm, Tanpa timbal/radiasi, Potongan max 1.5m",
      location: "Surabaya, Jawa Timur",
      price: 7800000000,
      brokerId: "user-3",
      brokerName: "Budi Santoso",
      brokerPhone: "081987654321",
      status: "VERIFIED",
      imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200",
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 13 * 24 * 3600 * 1000).toISOString(),
      viewsCount: 45,
      isPremium: false,
      isA1Verified: false
    }
  ],
  demandListings: [
    {
      id: "DEM-001",
      title: "Dicari: Buyer Siap Dana Lahan Pergudangan / Cold Storage Min 2 Ha",
      category: "Properti & Tanah",
      criteria: "Zoning Industri/Komersial, Akses kontainer 40ft, Bebas banjir, Sertifikat SHM/SHGB clear",
      budgetMin: 30000000000,
      budgetMax: 75000000000,
      paymentSystem: "Cash Bertahap / KPR Bank Mandiri Valid",
      brokerId: "user-2",
      brokerName: "Amiruddin",
      brokerPhone: "081233445566",
      status: "VERIFIED",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 11 * 24 * 3600 * 1000).toISOString(),
      isPremium: true,
      fundingCriteria: "Buyer A1 Investor Konsorsium Jakarta - LOI Siap Terbit"
    },
    {
      id: "DEM-002",
      title: "Dibutuhkan Pasokan Rutin Beras IR64 Medium 50 Ton / Minggu",
      category: "Komoditas & Hasil Bumi",
      criteria: "Kadar air max 14%, pecahan max 15%, Kemasan polos 50kg, Kontrak 6 bulan",
      budgetMin: 500000000,
      budgetMax: 650000000,
      paymentSystem: "CBD (Cash Before Delivery) atau SKBDN",
      brokerId: "user-2",
      brokerName: "Amiruddin",
      brokerPhone: "081233445566",
      status: "VERIFIED",
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(),
      isPremium: false,
      fundingCriteria: "Supplier Grosir Pasar Induk Cipinang"
    }
  ],
  interests: [
    {
      id: "INT-101",
      listingId: "SUP-001",
      listingTitle: "Lahan Industri Cikarang Barat 5.2 Hektar",
      listingType: "supply",
      ownerBrokerId: "user-1",
      ownerBrokerName: "Hendra Wijaya",
      interestedBrokerId: "user-2",
      interestedBrokerName: "Amiruddin",
      interestedBrokerPhone: "081233445566",
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      status: "VERIFIED_BY_ADMIN",
      userMessage: "Saya punya buyer konsorsium yang mencari lahan industri di Cikarang. Dana siap di atas 100M.",
      adminNotes: "Buyer & SKBDN terverifikasi valid oleh Admin Platform."
    }
  ]
};

// Database helper functions
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), "utf-8");
      return INITIAL_DATA;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading database:", err);
    return INITIAL_DATA;
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// REST API ROUTES

// 1. Health & Database Info
app.get("/api/system/info", (req, res) => {
  const db = readDB();
  res.json({
    status: "online",
    database: "Central Server JSON Storage",
    usersCount: db.users.length,
    supplyListingsCount: db.supplyListings.length,
    demandListingsCount: db.demandListings.length,
    interestsCount: db.interests.length,
    updatedAt: new Date().toISOString()
  });
});

// 2. Auth Endpoints
app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, password } = req.body;
  const db = readDB();
  const user = db.users.find(
    (u: any) =>
      (u.email?.toLowerCase() === emailOrPhone?.toLowerCase() || u.phoneNumber === emailOrPhone) &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Email / No. HP atau Password salah." });
  }

  // Omit password from response
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

app.post("/api/auth/register", (req, res) => {
  const { fullName, email, phoneNumber, password, role, ktpNumber, organization } = req.body;

  if (!fullName || !email || !phoneNumber || !password) {
    return res.status(400).json({ success: false, message: "Harap isi semua kolom wajib." });
  }

  const db = readDB();
  const existing = db.users.find(
    (u: any) => u.email?.toLowerCase() === email?.toLowerCase() || u.phoneNumber === phoneNumber
  );

  if (existing) {
    return res.status(400).json({ success: false, message: "Email atau Nomor HP sudah terdaftar." });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    fullName,
    email,
    password,
    phoneNumber,
    role: role || "MAKELAR_BARANG",
    kycStatus: "PENDING",
    ktpNumber: ktpNumber || "",
    organization: organization || "",
    registeredAt: new Date().toISOString(),
    balance: 0
  };

  db.users.push(newUser);
  writeDB(db);

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({
    success: true,
    message: "Pendaftaran berhasil! Pengajuan KYC Anda sedang ditinjau admin.",
    user: userWithoutPassword
  });
});

// 3. User Management (Admin & Self)
app.get("/api/users", (req, res) => {
  const db = readDB();
  const safeUsers = db.users.map(({ password, ...u }: any) => u);
  res.json({ success: true, users: safeUsers });
});

app.put("/api/users/:id/kyc", (req, res) => {
  const { id } = req.params;
  const { kycStatus, ktpNumber, organization } = req.body;

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }

  if (kycStatus) db.users[userIndex].kycStatus = kycStatus;
  if (ktpNumber !== undefined) db.users[userIndex].ktpNumber = ktpNumber;
  if (organization !== undefined) db.users[userIndex].organization = organization;

  writeDB(db);

  const { password: _, ...updatedUser } = db.users[userIndex];
  res.json({ success: true, message: "Status KYC berhasil diperbarui.", user: updatedUser });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.users = db.users.filter((u: any) => u.id !== id);
  writeDB(db);
  res.json({ success: true, message: "User berhasil dihapus." });
});

// 4. Projects / Listings Endpoints
app.get("/api/projects", (req, res) => {
  const db = readDB();
  const { type, category, search, brokerId } = req.query;

  let supply = db.supplyListings || [];
  let demand = db.demandListings || [];

  if (category) {
    supply = supply.filter((s: any) => s.category === category);
    demand = demand.filter((d: any) => d.category === category);
  }

  if (search) {
    const q = String(search).toLowerCase();
    supply = supply.filter(
      (s: any) =>
        s.title.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.specifications.toLowerCase().includes(q)
    );
    demand = demand.filter(
      (d: any) =>
        d.title.toLowerCase().includes(q) ||
        d.criteria.toLowerCase().includes(q)
    );
  }

  if (brokerId) {
    supply = supply.filter((s: any) => s.brokerId === brokerId);
    demand = demand.filter((d: any) => d.brokerId === brokerId);
  }

  if (type === "supply") {
    return res.json({ success: true, supplyListings: supply, demandListings: [] });
  } else if (type === "demand") {
    return res.json({ success: true, supplyListings: [], demandListings: demand });
  }

  res.json({ success: true, supplyListings: supply, demandListings: demand });
});

app.post("/api/projects", (req, res) => {
  const { projectType, title, category, location, specifications, price, budgetMin, budgetMax, criteria, paymentSystem, brokerId, imageUrl, isPremium } = req.body;

  if (!title || !category || !brokerId) {
    return res.status(400).json({ success: false, message: "Judul, kategori, dan ID pemosting wajib diisi." });
  }

  const db = readDB();
  const broker = db.users.find((u: any) => u.id === brokerId);
  const brokerName = broker ? broker.fullName : "Member Platform";
  const brokerPhone = broker ? broker.phoneNumber : "08123456789";

  if (projectType === "supply") {
    const newSupply = {
      id: `SUP-${String(db.supplyListings.length + 1).padStart(3, "0")}`,
      title,
      category,
      specifications: specifications || "",
      location: location || "Indonesia",
      price: Number(price) || 0,
      brokerId,
      brokerName,
      brokerPhone,
      status: "VERIFIED",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1200",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      viewsCount: 1,
      isPremium: Boolean(isPremium),
      isA1Verified: true
    };
    db.supplyListings.unshift(newSupply);
    writeDB(db);
    return res.json({ success: true, message: "Proyek Penawaran Barang berhasil diposting ke database!", project: newSupply });
  } else {
    const newDemand = {
      id: `DEM-${String(db.demandListings.length + 1).padStart(3, "0")}`,
      title,
      category,
      criteria: criteria || specifications || "",
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || Number(price) || 0,
      paymentSystem: paymentSystem || "Cash Bertahap",
      brokerId,
      brokerName,
      brokerPhone,
      status: "VERIFIED",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      isPremium: Boolean(isPremium),
      fundingCriteria: "Verified Buyer Criteria"
    };
    db.demandListings.unshift(newDemand);
    writeDB(db);
    return res.json({ success: true, message: "Proyek Pencarian Buyer berhasil diposting ke database!", project: newDemand });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.supplyListings = db.supplyListings.filter((s: any) => s.id !== id);
  db.demandListings = db.demandListings.filter((d: any) => d.id !== id);
  writeDB(db);
  res.json({ success: true, message: "Proyek berhasil dihapus dari database." });
});

// 5. Interest / Matchmaking Endpoints
app.get("/api/interests", (req, res) => {
  const db = readDB();
  res.json({ success: true, interests: db.interests || [] });
});

app.post("/api/projects/:id/interest", (req, res) => {
  const { id } = req.params;
  const { listingType, listingTitle, ownerBrokerId, ownerBrokerName, interestedBrokerId, interestedBrokerName, interestedBrokerPhone, userMessage } = req.body;

  const db = readDB();
  const newInterest = {
    id: `INT-${Date.now().toString().slice(-4)}`,
    listingId: id,
    listingTitle: listingTitle || "Proyek Platform",
    listingType: listingType || "supply",
    ownerBrokerId: ownerBrokerId || "admin-1",
    ownerBrokerName: ownerBrokerName || "Pemilik Proyek",
    interestedBrokerId: interestedBrokerId || "guest",
    interestedBrokerName: interestedBrokerName || "Member Pengaju",
    interestedBrokerPhone: interestedBrokerPhone || "-",
    createdAt: new Date().toISOString(),
    status: "PENDING_VERIFICATION",
    userMessage: userMessage || "Mengajukan minat kerjasama transaksi.",
    adminNotes: "Menunggu verifikasi admin"
  };

  db.interests.unshift(newInterest);
  writeDB(db);

  res.json({
    success: true,
    message: "Pengajuan minat berhasil dicatat ke database! Admin platform akan memverifikasi kesiapan transaksi.",
    interest: newInterest
  });
});

app.put("/api/interests/:id", (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const db = readDB();
  const idx = db.interests.findIndex((i: any) => i.id === id);
  if (idx !== -1) {
    if (status) db.interests[idx].status = status;
    if (adminNotes) db.interests[idx].adminNotes = adminNotes;
    writeDB(db);
    return res.json({ success: true, message: "Status minat diperbarui.", interest: db.interests[idx] });
  }

  res.status(404).json({ success: false, message: "Data minat tidak ditemukan." });
});

// 6. Admin Overview Stats
app.get("/api/admin/stats", (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    totalMembers: db.users.filter((u: any) => u.role !== "ADMIN").length,
    pendingKYC: db.users.filter((u: any) => u.kycStatus === "PENDING").length,
    verifiedMembers: db.users.filter((u: any) => u.kycStatus === "VERIFIED").length,
    totalSupplyProjects: db.supplyListings.length,
    totalDemandProjects: db.demandListings.length,
    totalInterests: db.interests.length,
    pendingInterests: db.interests.filter((i: any) => i.status === "PENDING_VERIFICATION").length
  });
});

// Start Express Server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server Rejeki Macan running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
