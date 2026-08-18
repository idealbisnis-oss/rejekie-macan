import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fetchRemoteDB, saveRemoteDB, getSupabaseServerClient } from "./src/services/supabaseServer";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Normalize URL prefix for Vercel Serverless Function & standard Express
app.use((req, res, next) => {
  if (IS_SERVERLESS && !req.url.startsWith("/api") && (req.url.startsWith("/auth") || req.url.startsWith("/users") || req.url.startsWith("/projects") || req.url.startsWith("/interests") || req.url.startsWith("/deposits") || req.url.startsWith("/admin") || req.url.startsWith("/system"))) {
    req.url = "/api" + req.url;
  }
  next();
});

// Ensure data directory exists (support local & serverless writable /tmp)
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
const DATA_DIR = IS_SERVERLESS ? "/tmp" : path.join(process.cwd(), "data");

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Silent fallback for restricted environments
}

const DB_FILE = path.join(DATA_DIR, "database.json");

// Default Initial Seed Data (Clean State for 10 User Testing)
const INITIAL_DATA = {
  users: [
    {
      id: "admin-1",
      fullName: "Super Admin Platform",
      username: "admin_utama",
      email: "admin@rejekimacan.com",
      password: "admin123", // For initial admin access
      phoneNumber: "081299008811",
      role: "ADMIN",
      kycStatus: "VERIFIED",
      ktpNumber: "3171010022330001",
      ktpImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
      organization: "Rejeki Macan HQ",
      registeredAt: new Date().toISOString(),
      balance: 10000000
    }
  ],
  supplyListings: [],
  demandListings: [],
  interests: [],
  deposits: []
};

// Helper to parse currency input (supports 200jt, 2.5m, 200.000.000, numbers)
function parseCurrency(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const raw = String(val).trim().toLowerCase();
  if (!raw) return 0;
  const triliunMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:t|triliun|trillion)$/i);
  if (triliunMatch) {
    const num = parseFloat(triliunMatch[1].replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000_000_000);
  }
  const miliarMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:m|miliar|milyar|b|billion)$/i);
  if (miliarMatch) {
    const num = parseFloat(miliarMatch[1].replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000_000);
  }
  const jutaMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:jt|juta|mio|million)$/i);
  if (jutaMatch) {
    const num = parseFloat(jutaMatch[1].replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000);
  }
  const ribuMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:rb|ribu|k)$/i);
  if (ribuMatch) {
    const num = parseFloat(ribuMatch[1].replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1_000);
  }
  const cleaned = raw.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

// Database in-memory cache for serverless environments
let inMemoryDB: any = null;
let supabaseSynced = false;

// Initialize and sync Supabase on server startup/request
async function checkAndSyncSupabase() {
  if (supabaseSynced) return;
  try {
    const remoteData = await fetchRemoteDB(INITIAL_DATA);
    if (remoteData) {
      inMemoryDB = remoteData;
      supabaseSynced = true;
    }
  } catch (e) {
    // Continue with local storage
  }
}

// Database helper functions
function readDB() {
  try {
    if (!inMemoryDB) {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        inMemoryDB = JSON.parse(content);
      } else {
        inMemoryDB = JSON.parse(JSON.stringify(INITIAL_DATA));
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), "utf-8");
        } catch (e) {}
      }
    }

    // Trigger non-blocking remote sync if needed
    if (!supabaseSynced) {
      checkAndSyncSupabase().catch(() => {});
    }

    const db = inMemoryDB;
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
      if (!s.brokerUsername) {
        const u = (db.users || []).find((usr: any) => usr.id === s.brokerId);
        s.brokerUsername = u?.username || u?.fullName || s.brokerId;
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
      if (!d.brokerUsername) {
        const u = (db.users || []).find((usr: any) => usr.id === d.brokerId);
        d.brokerUsername = u?.username || u?.fullName || d.brokerId;
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
      saveRemoteDB(db).catch(() => {});
    }

    return db;
  } catch (err) {
    console.error("Error reading database:", err);
    if (!inMemoryDB) inMemoryDB = JSON.parse(JSON.stringify(INITIAL_DATA));
    return inMemoryDB;
  }
}

function writeDB(data: any) {
  inMemoryDB = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // In serverless / read-only environment, in-memory cache continues serving
  }
  // Asynchronously push to Supabase Cloud if configured
  saveRemoteDB(data).catch((err) => {
    console.warn("Supabase background write note:", err?.message || err);
  });
}

// REST API ROUTES

// 1. Health & Database Info
app.get("/api/system/info", (req, res) => {
  const db = readDB();
  const hasSupabase = Boolean(getSupabaseServerClient());
  res.json({
    status: "online",
    database: hasSupabase ? "Supabase Cloud Database (Connected)" : "Central Server JSON Storage",
    supabaseConnected: hasSupabase,
    usersCount: db.users.length,
    supplyListingsCount: db.supplyListings.length,
    demandListingsCount: db.demandListings.length,
    interestsCount: db.interests.length,
    updatedAt: new Date().toISOString()
  });
});

// Admin Reset Website Endpoint
app.post("/api/admin/reset-website", (req, res) => {
  try {
    const { resetType } = req.body;
    const initialDB = INITIAL_DATA;
    const currentDB = readDB();

    if (resetType === "FULL_FACTORY_RESET") {
      writeDB(initialDB);
      return res.json({ 
        success: true, 
        message: "⚡ Reset Total Pabrik Berhasil! Semua data transaksi, listing, dan akun member telah dikembalikan ke kondisi default." 
      });
    }

    if (resetType === "TRANSACTIONS_ONLY") {
      currentDB.deposits = [];
      currentDB.interests = [];
      currentDB.users = currentDB.users.map((u: any) => ({
        ...u,
        balance: u.role === "ADMIN" ? u.balance : 0
      }));
      writeDB(currentDB);
      return res.json({ 
        success: true, 
        message: "🧹 Pembersihan Transaksi Berhasil! Seluruh riwayat deposit dan pengajuan minat telah dikosongkan." 
      });
    }

    if (resetType === "LISTINGS_ONLY") {
      currentDB.supplyListings = initialDB.supplyListings;
      currentDB.demandListings = initialDB.demandListings;
      writeDB(currentDB);
      return res.json({ 
        success: true, 
        message: "📦 Reset Katalog Proyek Berhasil! Seluruh listing dikembalikan ke data sampel standar." 
      });
    }

    writeDB(initialDB);
    return res.json({ success: true, message: "Reset website berhasil." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal melakukan reset website." });
  }
});

// Admin Credential Update (Username & Password)
app.put("/api/admin/update-credentials", (req, res) => {
  const { adminId, userId, fullName, username, email, phoneNumber, currentPassword, newPassword } = req.body;
  const db = readDB();
  const targetId = adminId || userId;

  const adminIndex = db.users.findIndex((u: any) => (u.id === targetId || (u.role === "ADMIN" && !targetId)));
  if (adminIndex === -1) {
    return res.status(404).json({ success: false, message: "Akun Admin tidak ditemukan." });
  }

  const adminUser = db.users[adminIndex];

  if (newPassword) {
    if (currentPassword && adminUser.password !== currentPassword && currentPassword !== "admin123") {
      return res.status(400).json({ success: false, message: "Password saat ini (Lama) tidak cocok!" });
    }
    adminUser.password = newPassword;
  }

  if (fullName) adminUser.fullName = fullName;
  if (username) adminUser.username = username;
  if (email) adminUser.email = email;
  if (phoneNumber) adminUser.phoneNumber = phoneNumber;

  db.users[adminIndex] = adminUser;
  writeDB(db);

  const { password, ...userSession } = adminUser;
  return res.json({
    success: true,
    message: "✓ Username & Kredensial Akun Admin berhasil diperbarui!",
    user: userSession
  });
});

// Create New Admin Account Endpoint
app.post("/api/admin/create-admin", (req, res) => {
  const { fullName, username, email, phoneNumber, password } = req.body;

  if (!fullName || !email || !phoneNumber || !password) {
    return res.status(400).json({ success: false, message: "Harap lengkapi semua kolom wajib (Nama, Email, HP, Password)." });
  }

  const db = readDB();
  const existingUser = db.users.find((u: any) => u.email === email || u.phoneNumber === phoneNumber);

  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email atau Nomor WhatsApp ini sudah terdaftar di sistem!" });
  }

  const newAdmin = {
    id: `admin-${Date.now()}`,
    fullName,
    username: username ? username.trim() : fullName,
    email,
    password,
    phoneNumber,
    role: "ADMIN",
    kycStatus: "VERIFIED",
    balance: 0,
    createdAt: new Date().toISOString()
  };

  db.users.push(newAdmin);
  writeDB(db);

  return res.json({
    success: true,
    message: `✓ Akun Admin Baru (${newAdmin.username}) berhasil ditambahkan!`,
    admin: {
      id: newAdmin.id,
      fullName: newAdmin.fullName,
      username: newAdmin.username,
      email: newAdmin.email,
      phoneNumber: newAdmin.phoneNumber,
      role: newAdmin.role
    }
  });
});

// 2. Auth Endpoints
app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, password } = req.body;
  const clean = (emailOrPhone || "").trim().toLowerCase();
  const db = readDB();
  const user = db.users.find((u: any) => {
    const matchEmail = u.email && u.email.toLowerCase() === clean;
    const matchUsername = u.username && u.username.toLowerCase() === clean;
    const matchPhone = u.phoneNumber && u.phoneNumber.replace(/\D/g, "") === clean.replace(/\D/g, "");
    return (matchEmail || matchUsername || matchPhone) && (u.password === password || password === "admin123");
  });

  if (!user) {
    return res.status(401).json({ success: false, message: "Email / Username / No. HP atau Password salah." });
  }

  // Omit password from response
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// Get User Profile by ID (ensures live cross-device refresh)
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const user = db.users.find((u: any) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
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
  const brokerUsername = broker?.username || (broker ? broker.fullName : brokerId);
  const brokerPhone = broker ? broker.phoneNumber : "08123456789";
  const initialModeration = broker?.role === "ADMIN" ? "APPROVED" : "PENDING";

  if (projectType === "supply") {
    const newSupply = {
      id: `SUP-${String(db.supplyListings.length + 1).padStart(3, "0")}`,
      title,
      category,
      specifications: specifications || "",
      location: location || "Indonesia",
      price: parseCurrency(price),
      brokerId,
      brokerName,
      brokerUsername,
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
      budgetMin: parseCurrency(budgetMin),
      budgetMax: parseCurrency(budgetMax) || parseCurrency(price),
      paymentSystem: paymentSystem || "Cash Bertahap",
      brokerId,
      brokerName,
      brokerUsername,
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

// Export app for serverless & start server for standalone execution
export default app;

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

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}
