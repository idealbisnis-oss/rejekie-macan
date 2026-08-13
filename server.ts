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
      username: "Super Admin",
      email: "admin@rejekimacan.com",
      password: "admin123", // For demo/initial access
      phoneNumber: "081299008811",
      role: "ADMIN",
      kycStatus: "VERIFIED",
      ktpNumber: "3171010022330001",
      ktpImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
      organization: "Rejeki Macan HQ",
      registeredAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      balance: 1000000
    },
    {
      id: "user-1",
      fullName: "Hendra Wijaya",
      username: "Broker Hendra",
      email: "hendra@broker.id",
      password: "user123",
      phoneNumber: "081122334455",
      role: "MAKELAR_BARANG",
      kycStatus: "VERIFIED",
      ktpNumber: "3201018899000002",
      ktpImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
      organization: "Bumi Sejahtera Property",
      registeredAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      balance: 150000
    },
    {
      id: "user-2",
      fullName: "Amiruddin",
      username: "Amir Buyer Agent",
      email: "amir@buyeragent.com",
      password: "user123",
      phoneNumber: "081233445566",
      role: "MAKELAR_BUYER",
      kycStatus: "VERIFIED",
      ktpNumber: "3515027788990003",
      ktpImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
      organization: "Jawa Investor Club",
      registeredAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      balance: 200000
    },
    {
      id: "user-3",
      fullName: "Budi Santoso",
      username: "Budi Properti",
      email: "budi@newmember.com",
      password: "user123",
      phoneNumber: "081987654321",
      role: "MAKELAR_BARANG",
      kycStatus: "PENDING",
      ktpNumber: "3172023344550004",
      ktpImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
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
      brokerName: "Broker Hendra",
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
      brokerName: "Broker Hendra",
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
      brokerName: "Budi Properti",
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
      brokerName: "Amir Buyer Agent",
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
      brokerName: "Amir Buyer Agent",
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
      ownerBrokerName: "Broker Hendra",
      interestedBrokerId: "user-2",
      interestedBrokerName: "Amir Buyer Agent",
      interestedBrokerPhone: "081233445566",
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      status: "VERIFIED_BY_ADMIN",
      userMessage: "Saya punya buyer konsorsium yang mencari lahan industri di Cikarang. Dana siap di atas 100M.",
      adminNotes: "Buyer & SKBDN terverifikasi valid oleh Admin Platform."
    }
  ],
  deposits: [
    {
      id: "DEP-1001",
      userId: "user-1",
      userName: "Hendra Wijaya",
      userEmail: "hendra@broker.id",
      userPhone: "081122334455",
      amount: 100000,
      paymentMethod: "QRIS",
      paymentCode: "QRIS-RM-1001",
      senderName: "Hendra W",
      proofUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=400",
      notes: "Transfer via QRIS Bank BCA",
      status: "PENDING",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
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
    const db = JSON.parse(content);

    const now = Date.now();
    let changed = false;

    // Filter out expired supply listings (auto-delete after 10 days limit / expiresAt)
    const validSupply = (db.supplyListings || []).filter((s: any) => {
      if (s.expiresAt && new Date(s.expiresAt).getTime() < now) {
        changed = true;
        return false;
      }
      if (!s.moderationStatus) {
        s.moderationStatus = "APPROVED";
        changed = true;
      }
      return true;
    });

    // Filter out expired demand listings
    const validDemand = (db.demandListings || []).filter((d: any) => {
      if (d.expiresAt && new Date(d.expiresAt).getTime() < now) {
        changed = true;
        return false;
      }
      if (!d.moderationStatus) {
        d.moderationStatus = "APPROVED";
        changed = true;
      }
      return true;
    });

    if (!db.deposits) {
      db.deposits = [];
      changed = true;
    }

    if (changed) {
      db.supplyListings = validSupply;
      db.demandListings = validDemand;
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
      } catch (e) {}
    }

    return db;
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
  const { fullName, username, email, phoneNumber, password, role, ktpNumber, ktpImageUrl, organization } = req.body;

  if (!fullName || !email || !phoneNumber || !password) {
    return res.status(400).json({ success: false, message: "Harap isi semua kolom wajib (Nama, Email, HP, Password)." });
  }

  if (!ktpNumber || String(ktpNumber).trim().length < 16) {
    return res.status(400).json({ success: false, message: "Nomor KTP / NIK wajib diisi (minimal 16 digit)." });
  }

  if (!ktpImageUrl) {
    return res.status(400).json({ success: false, message: "Upload foto KTP / Identitas wajib dilampirkan untuk verifikasi." });
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
    username: username ? String(username).trim() : fullName,
    email,
    password,
    phoneNumber,
    role: role || "MAKELAR_BARANG",
    kycStatus: "PENDING",
    ktpNumber: String(ktpNumber).trim(),
    ktpImageUrl: ktpImageUrl,
    organization: organization || "",
    registeredAt: new Date().toISOString(),
    balance: 0
  };

  db.users.push(newUser);
  writeDB(db);

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({
    success: true,
    message: "Pendaftaran berhasil! Pengajuan foto KTP Anda sedang ditinjau admin.",
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
  const { kycStatus, ktpNumber, ktpImageUrl, organization, fullName, username, phoneNumber, role } = req.body;

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }

  if (kycStatus) db.users[userIndex].kycStatus = kycStatus;
  if (ktpNumber !== undefined) db.users[userIndex].ktpNumber = ktpNumber;
  if (ktpImageUrl !== undefined) db.users[userIndex].ktpImageUrl = ktpImageUrl;
  if (organization !== undefined) db.users[userIndex].organization = organization;
  if (fullName !== undefined) db.users[userIndex].fullName = fullName;
  if (username !== undefined) db.users[userIndex].username = username;
  if (phoneNumber !== undefined) db.users[userIndex].phoneNumber = phoneNumber;
  if (role !== undefined) db.users[userIndex].role = role;

  writeDB(db);

  const { password: _, ...updatedUser } = db.users[userIndex];
  res.json({ success: true, message: "Status KYC & dokumen berhasil diperbarui.", user: updatedUser });
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
  const { type, category, search, brokerId, publicOnly, includeAll } = req.query;

  let supply = db.supplyListings || [];
  let demand = db.demandListings || [];

  // If public view (no brokerId given and not explicitly asking for includeAll), filter to only APPROVED projects
  if (publicOnly === "true" || (!brokerId && includeAll !== "true")) {
    supply = supply.filter((s: any) => s.moderationStatus === "APPROVED" || (!s.moderationStatus && s.status === "VERIFIED"));
    demand = demand.filter((d: any) => d.moderationStatus === "APPROVED" || (!d.moderationStatus && d.status === "VERIFIED"));
  }

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
  const initialModeration = broker?.role === "ADMIN" ? "APPROVED" : "PENDING";

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
      moderationStatus: initialModeration,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1200",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(), // 10 Hari Limit Masa Aktif Gratis
      viewsCount: 1,
      isPremium: Boolean(isPremium),
      isA1Verified: true
    };
    db.supplyListings.unshift(newSupply);
    writeDB(db);
    return res.json({
      success: true,
      message: initialModeration === "APPROVED" 
        ? "Proyek berhasil dipublikasikan!" 
        : "Proyek berhasil diajukan! Menunggu persetujuan Admin sebelum tampil di Katalog Publik.",
      project: newSupply
    });
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
      moderationStatus: initialModeration,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(), // 10 Hari Limit Masa Aktif Gratis
      isPremium: Boolean(isPremium),
      fundingCriteria: "Verified Buyer Criteria"
    };
    db.demandListings.unshift(newDemand);
    writeDB(db);
    return res.json({
      success: true,
      message: initialModeration === "APPROVED" 
        ? "Proyek pencarian buyer berhasil dipublikasikan!" 
        : "Proyek berhasil diajukan! Menunggu persetujuan Admin sebelum tampil di Katalog Publik.",
      project: newDemand
    });
  }
});

// Update Moderation Status (Admin Approve / Reject)
app.put("/api/projects/:id/moderation", (req, res) => {
  const { id } = req.params;
  const { moderationStatus, rejectionReason } = req.body;

  if (!["APPROVED", "REJECTED", "PENDING"].includes(moderationStatus)) {
    return res.status(400).json({ success: false, message: "Status moderasi tidak valid." });
  }

  const db = readDB();
  let project = db.supplyListings.find((s: any) => s.id === id);
  if (!project) {
    project = db.demandListings.find((d: any) => d.id === id);
  }

  if (!project) {
    return res.status(404).json({ success: false, message: "Proyek tidak ditemukan." });
  }

  project.moderationStatus = moderationStatus;
  if (rejectionReason !== undefined) {
    project.rejectionReason = rejectionReason;
  }

  // Set 10 days active limit from approval time if it was approved
  if (moderationStatus === "APPROVED") {
    project.expiresAt = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString();
  }

  writeDB(db);
  res.json({ success: true, message: `Status proyek berhasil diperbarui menjadi '${moderationStatus}'.`, project });
});

// Top Up Deposit Saldo
app.post("/api/users/:id/deposit", (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: "Jumlah deposit harus lebih dari 0." });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }

  user.balance = (user.balance || 0) + numAmount;
  writeDB(db);

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    message: `Top up deposit berhasil sebesar Rp ${numAmount.toLocaleString("id-ID")}. Saldo aktif: Rp ${user.balance.toLocaleString("id-ID")}`,
    user: safeUser
  });
});

// Perpanjang Masa Tayang Proyek (Rp 500 / hari)
app.post("/api/projects/:id/extend", (req, res) => {
  const { id } = req.params;
  const { userId, days } = req.body;

  const numDays = Math.max(1, Number(days) || 1);
  const cost = numDays * 500; // Rp 500 per hari

  const db = readDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }

  if ((user.balance || 0) < cost) {
    return res.status(400).json({
      success: false,
      message: `Saldo deposit Anda (Rp ${(user.balance || 0).toLocaleString("id-ID")}) tidak cukup untuk perpanjangan ${numDays} hari (Biaya: Rp ${cost.toLocaleString("id-ID")}). Silakan top up deposit terlebih dahulu.`
    });
  }

  let project = db.supplyListings.find((s: any) => s.id === id);
  if (!project) {
    project = db.demandListings.find((d: any) => d.id === id);
  }

  if (!project) {
    return res.status(404).json({ success: false, message: "Proyek tidak ditemukan." });
  }

  // Deduct balance
  user.balance = (user.balance || 0) - cost;

  // Extend expiration date
  const currentExpiry = new Date(project.expiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiry = new Date(baseTime + numDays * 24 * 3600 * 1000).toISOString();
  project.expiresAt = newExpiry;

  writeDB(db);

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    message: `Masa tayang proyek berhasil diperpanjang ${numDays} hari seharga Rp ${cost.toLocaleString("id-ID")}. Masa aktif berlaku hingga ${new Date(newExpiry).toLocaleDateString("id-ID")}.`,
    user: safeUser,
    project
  });
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.supplyListings = db.supplyListings.filter((s: any) => s.id !== id);
  db.demandListings = db.demandListings.filter((d: any) => d.id !== id);
  writeDB(db);
  res.json({ success: true, message: "Proyek berhasil dihapus dari database." });
});

// Helper for Anti-Bypass Contact Masking
function maskSensitiveContactInfo(text: string): { maskedText: string; hasContactAttempt: boolean } {
  if (!text) return { maskedText: "", hasContactAttempt: false };

  let maskedText = text;
  let hasContactAttempt = false;

  // Phone numbers (e.g. 0812..., +62..., 08xx-xxxx-xxxx)
  const phoneRegex = /(?:\+?62|0)[2-9]\d{1,4}[-.\s]?\d{3,5}[-.\s]?\d{3,5}\b/gi;
  const genericDigitsRegex = /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{3,6}\b/g;

  // URLs & Emails
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:wa\.me|whatsapp\.com|t\.me|telegram\.me|instagram\.com|facebook\.com|[a-zA-Z0-9-]+\.(?:com|co\.id|id|net|org|io|me))\b[\w/?=&#.-]*/gi;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

  // Bypass Keywords
  const bypassKeywordsRegex = /\b(hubungi\s*wa|chat\s*wa|no\s*wa|nomor\s*hp|wa\s*saya|call\s*me|telfon\s*ke|telepon\s*ke|kontak\s*wa)\b/gi;

  if (
    phoneRegex.test(maskedText) ||
    genericDigitsRegex.test(maskedText) ||
    urlRegex.test(maskedText) ||
    emailRegex.test(maskedText) ||
    bypassKeywordsRegex.test(maskedText)
  ) {
    hasContactAttempt = true;
  }

  maskedText = maskedText
    .replace(phoneRegex, '🔒 [KONTAK DIBLOKIR SISTEM]')
    .replace(genericDigitsRegex, '🔒 [NOMOR DIBLOKIR SISTEM]')
    .replace(urlRegex, '🔒 [LINK DIBLOKIR SISTEM]')
    .replace(emailRegex, '🔒 [EMAIL DIBLOKIR SISTEM]')
    .replace(bypassKeywordsRegex, '🔒 [KATA KUNCI BYPASS DIBLOKIR]');

  return { maskedText, hasContactAttempt };
}

// 5. Interest / Matchmaking Endpoints
app.get("/api/interests", (req, res) => {
  const db = readDB();
  res.json({ success: true, interests: db.interests || [] });
});

app.post("/api/projects/:id/interest", (req, res) => {
  const { id } = req.params;
  const { listingType, listingTitle, ownerBrokerId, ownerBrokerName, interestedBrokerId, interestedBrokerName, interestedBrokerPhone, userMessage } = req.body;

  const db = readDB();
  
  // 1. Check if user exists and is KYC VERIFIED
  const user = db.users.find((u: any) => u.id === interestedBrokerId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Akun pengaju minat tidak ditemukan. Silakan login terlebih dahulu."
    });
  }

  if (user.role !== "ADMIN" && user.kycStatus !== "VERIFIED") {
    return res.status(403).json({
      success: false,
      message: "⚠️ Akses Dibatasi: Anda wajib melengkapi & lulus verifikasi KYC (KTP & PT) sebelum dapat mengajukan minat transaksi ke proyek ini."
    });
  }

  // 2. Commitment Fee Deposit Check (Rp 5.000)
  const COMMITMENT_FEE = 5000;
  if (user.role !== "ADMIN" && (user.balance || 0) < COMMITMENT_FEE) {
    return res.status(400).json({
      success: false,
      message: `⚠️ Saldo Deposit Kurang: Pengajuan minat membutuhkan biaya komitmen deposit Rp ${COMMITMENT_FEE.toLocaleString("id-ID")}. Saldo Anda saat ini: Rp ${(user.balance || 0).toLocaleString("id-ID")}. Silakan Top Up Deposit terlebih dahulu.`
    });
  }

  // Deduct commitment fee if not admin
  if (user.role !== "ADMIN") {
    user.balance = (user.balance || 0) - COMMITMENT_FEE;
  }

  // 3. Mask contact info automatically
  const { maskedText, hasContactAttempt } = maskSensitiveContactInfo(userMessage || "");

  const newInterest = {
    id: `INT-${Date.now().toString().slice(-4)}`,
    listingId: id,
    listingTitle: listingTitle || "Proyek Platform",
    listingType: listingType || "supply",
    ownerBrokerId: ownerBrokerId || "admin-1",
    ownerBrokerName: ownerBrokerName || "Pemilik Proyek",
    interestedBrokerId: interestedBrokerId,
    interestedBrokerName: user.username || user.fullName || interestedBrokerName || "Member Pengaju",
    interestedBrokerPhone: user.phoneNumber || interestedBrokerPhone || "-",
    createdAt: new Date().toISOString(),
    status: "PENDING_VERIFICATION",
    userMessage: maskedText || "Mengajukan minat kerjasama transaksi.",
    originalMessage: userMessage,
    hasContactAttempt,
    commitmentFee: user.role !== "ADMIN" ? COMMITMENT_FEE : 0,
    isContactRevealed: false,
    adminNotes: hasContactAttempt 
      ? "⚠️ Perhatian Admin: Pesan awal pengaju terdeteksi mencoba mengirim kontak langsung. Pesan telah disensor otomatis oleh sistem."
      : "Menunggu verifikasi kesiapan oleh Admin Central.",
    chatMessages: [
      {
        id: `MSG-${Date.now()}-1`,
        senderId: interestedBrokerId,
        senderName: user.username || user.fullName || "Member Pengaju",
        senderRole: "REQUESTER",
        message: maskedText,
        createdAt: new Date().toISOString(),
        hasContactAttempt
      },
      {
        id: `MSG-${Date.now()}-2`,
        senderId: "system",
        senderName: "Sistem Proteksi Rejeki Macan",
        senderRole: "SYSTEM",
        message: `Biaya komitmen Rp ${COMMITMENT_FEE.toLocaleString("id-ID")} berhasil terpotong dari saldo deposit pengaju. Seluruh pesan dalam ruang ini terenkripsi & difasilitasi oleh Admin Platform.`,
        createdAt: new Date().toISOString()
      }
    ]
  };

  db.interests.unshift(newInterest);
  writeDB(db);

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    message: `Pengajuan minat berhasil dicatat! Saldo terpotong Rp ${COMMITMENT_FEE.toLocaleString("id-ID")}. Admin platform akan memverifikasi kesiapan kedua belah pihak di Ruang Mediasi Chat.`,
    interest: newInterest,
    user: safeUser
  });
});

app.put("/api/interests/:id", (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, isContactRevealed, ownerBrokerName, interestedBrokerName, listingTitle } = req.body;

  const db = readDB();
  const idx = db.interests.findIndex((i: any) => i.id === id);
  if (idx !== -1) {
    if (status) db.interests[idx].status = status;
    if (adminNotes) db.interests[idx].adminNotes = adminNotes;
    if (typeof isContactRevealed === "boolean") db.interests[idx].isContactRevealed = isContactRevealed;
    if (ownerBrokerName !== undefined) db.interests[idx].ownerBrokerName = ownerBrokerName;
    if (interestedBrokerName !== undefined) db.interests[idx].interestedBrokerName = interestedBrokerName;
    if (listingTitle !== undefined) db.interests[idx].listingTitle = listingTitle;

    // Add system chat notification if status or names change
    if (!db.interests[idx].chatMessages) db.interests[idx].chatMessages = [];
    if (status || ownerBrokerName || interestedBrokerName) {
      db.interests[idx].chatMessages.push({
        id: `MSG-${Date.now()}`,
        senderId: "admin",
        senderName: "Admin Central Platform",
        senderRole: "ADMIN",
        message: `Pembaruan Informasi Mediasi: ${ownerBrokerName ? `Pemilik: "${ownerBrokerName}" ` : ""}${interestedBrokerName ? `Pengaju: "${interestedBrokerName}" ` : ""}${status ? `Status: ${status}` : ""}`,
        createdAt: new Date().toISOString()
      });
    }

    writeDB(db);
    return res.json({ success: true, message: "Data minat & ruang mediasi berhasil diperbarui.", interest: db.interests[idx] });
  }

  res.status(404).json({ success: false, message: "Data minat tidak ditemukan." });
});

// Endpoint Chat Mediasi 3-Arah
app.post("/api/interests/:id/chat", (req, res) => {
  const { id } = req.params;
  const { senderId, senderName, senderRole, message } = req.body;

  const db = readDB();
  const interest = db.interests.find((i: any) => i.id === id);
  if (!interest) {
    return res.status(404).json({ success: false, message: "Data minat tidak ditemukan." });
  }

  if (!interest.chatMessages) {
    interest.chatMessages = [];
  }

  // Mask message if sender is not ADMIN and contact is not yet officially revealed
  let finalMessage = message;
  let attemptDetected = false;
  if (senderRole !== "ADMIN" && !interest.isContactRevealed) {
    const { maskedText, hasContactAttempt } = maskSensitiveContactInfo(message);
    finalMessage = maskedText;
    attemptDetected = hasContactAttempt;
  }

  const newMsg = {
    id: `MSG-${Date.now()}`,
    senderId: senderId || "user",
    senderName: senderName || "Pengirim",
    senderRole: senderRole || "MEMBER",
    message: finalMessage,
    createdAt: new Date().toISOString(),
    hasContactAttempt: attemptDetected
  };

  interest.chatMessages.push(newMsg);
  if (attemptDetected) {
    interest.hasContactAttempt = true;
    interest.adminNotes = "⚠️ Terdeteksi percobaan bypass kontak baru di Ruang Chat Mediasi.";
  }

  writeDB(db);
  res.json({ success: true, message: "Pesan dikirim ke Ruang Mediasi.", chatMessage: newMsg, interest });
});

// 6. Deposit Requests Endpoints
app.get("/api/deposits", (req, res) => {
  const { userId } = req.query;
  const db = readDB();
  let deposits = db.deposits || [];

  if (userId) {
    deposits = deposits.filter((d: any) => d.userId === userId);
  }

  res.json({ success: true, deposits });
});

app.post("/api/deposits", (req, res) => {
  const { userId, amount, paymentMethod, senderName, proofUrl, notes } = req.body;

  const numAmount = Number(amount);
  if (!userId || !numAmount || numAmount <= 0 || !paymentMethod) {
    return res.status(400).json({ success: false, message: "User ID, nominal top up, dan metode pembayaran wajib diisi." });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }

  let codePrefix = "QRIS";
  if (paymentMethod === "VA_BCA") codePrefix = "880010" + user.phoneNumber;
  else if (paymentMethod === "VA_MANDIRI") codePrefix = "890080" + user.phoneNumber;
  else if (paymentMethod === "VA_BRI") codePrefix = "888100" + user.phoneNumber;
  else if (paymentMethod === "BANK_TRANSFER") codePrefix = "BCA-8830192833";
  else codePrefix = `QRIS-RM-${Date.now().toString().slice(-4)}`;

  const newDeposit = {
    id: `DEP-${Date.now().toString().slice(-5)}`,
    userId,
    userName: user.fullName,
    userEmail: user.email,
    userPhone: user.phoneNumber,
    amount: numAmount,
    paymentMethod,
    paymentCode: codePrefix,
    senderName: senderName || user.fullName,
    proofUrl: proofUrl || "",
    notes: notes || `Top Up Saldo Deposit via ${paymentMethod}`,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };

  db.deposits.unshift(newDeposit);
  writeDB(db);

  res.json({
    success: true,
    message: `Konfirmasi Top Up Deposit Rp ${numAmount.toLocaleString("id-ID")} berhasil dikirimkan ke Admin! Saldo akan bertambah otomatis setelah diverifikasi Admin.`,
    deposit: newDeposit
  });
});

app.put("/api/deposits/:id/approve", (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const deposit = db.deposits.find((d: any) => d.id === id);
  if (!deposit) {
    return res.status(404).json({ success: false, message: "Pengajuan deposit tidak ditemukan." });
  }

  if (deposit.status === "APPROVED") {
    return res.status(400).json({ success: false, message: "Pengajuan deposit ini sudah disetujui sebelumnya." });
  }

  const user = db.users.find((u: any) => u.id === deposit.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "Member pemilik deposit tidak ditemukan." });
  }

  // Credit balance to user
  user.balance = (user.balance || 0) + deposit.amount;

  // Update deposit status
  deposit.status = "APPROVED";
  deposit.approvedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    success: true,
    message: `Top up deposit Rp ${deposit.amount.toLocaleString("id-ID")} untuk ${user.fullName} telah disetujui! Saldo member kini: Rp ${user.balance.toLocaleString("id-ID")}`,
    deposit,
    userBalance: user.balance
  });
});

app.put("/api/deposits/:id/reject", (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const db = readDB();

  const deposit = db.deposits.find((d: any) => d.id === id);
  if (!deposit) {
    return res.status(404).json({ success: false, message: "Pengajuan deposit tidak ditemukan." });
  }

  deposit.status = "REJECTED";
  deposit.rejectionReason = rejectionReason || "Bukti transfer tidak dapat diverifikasi.";

  writeDB(db);

  res.json({
    success: true,
    message: "Pengajuan deposit ditolak.",
    deposit
  });
});

// 7. Admin Overview Stats
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
    pendingInterests: db.interests.filter((i: any) => i.status === "PENDING_VERIFICATION").length,
    totalDeposits: (db.deposits || []).length,
    pendingDeposits: (db.deposits || []).filter((d: any) => d.status === "PENDING").length
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
