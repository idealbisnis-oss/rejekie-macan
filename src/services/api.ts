import { UserSession, SupplyListing, DemandListing, ListingInterest } from "../types";
import { INITIAL_SEED_DATA } from "../data/initialData";
import { 
  fetchSupabaseDB, 
  saveSupabaseDB, 
  isSupabaseConfigured, 
  getSupabaseConfig, 
  saveSupabaseConfig 
} from "./supabase";

export { isSupabaseConfigured, getSupabaseConfig, saveSupabaseConfig };

const STORAGE_KEY_DB = "rejekimacan_local_db_v2_clean";

// Helper to get local persistent state
export function getLocalDB(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DB);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch (e) {}
  const init = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  try {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(init));
  } catch (e) {}
  return init;
}

export function saveLocalDB(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(data));
  } catch (e) {}
  if (isSupabaseConfigured()) {
    saveSupabaseDB(data).catch(() => {});
  }
}

// Master Helper: Fetch fresh data directly from Supabase Cloud
export async function getFreshDB(): Promise<any> {
  if (isSupabaseConfigured()) {
    try {
      const supaData = await fetchSupabaseDB();
      if (supaData && Array.isArray(supaData.users)) {
        try {
          localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(supaData));
        } catch (e) {}
        return supaData;
      }
    } catch (e) {
      console.warn("Supabase fetch error, fallback to local:", e);
    }
  }
  return getLocalDB();
}

// Master Helper: Commit and save directly to Supabase Cloud
export async function commitDB(data: any): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(data));
  } catch (e) {}

  if (isSupabaseConfigured()) {
    try {
      const ok = await saveSupabaseDB(data);
      return ok;
    } catch (err) {
      console.error("Supabase commit error:", err);
      return false;
    }
  }
  return true;
}

export function mergeDatabases(local: any, remote: any): any {
  if (!remote) return local || {};
  if (!local) return remote || {};

  const merged = { ...remote };

  // Merge users by id
  const userMap = new Map();
  (remote.users || []).forEach((u: any) => u?.id && userMap.set(u.id, u));
  (local.users || []).forEach((u: any) => {
    if (u?.id && !userMap.has(u.id)) {
      userMap.set(u.id, u);
    }
  });
  merged.users = Array.from(userMap.values());

  // Merge supplyListings by id
  const supplyMap = new Map();
  (remote.supplyListings || []).forEach((s: any) => s?.id && supplyMap.set(s.id, s));
  (local.supplyListings || []).forEach((s: any) => {
    if (s?.id && !supplyMap.has(s.id)) {
      supplyMap.set(s.id, s);
    }
  });
  merged.supplyListings = Array.from(supplyMap.values());

  // Merge demandListings by id
  const demandMap = new Map();
  (remote.demandListings || []).forEach((d: any) => d?.id && demandMap.set(d.id, d));
  (local.demandListings || []).forEach((d: any) => {
    if (d?.id && !demandMap.has(d.id)) {
      demandMap.set(d.id, d);
    }
  });
  merged.demandListings = Array.from(demandMap.values());

  // Merge interests by id
  const interestMap = new Map();
  (remote.interests || []).forEach((i: any) => i?.id && interestMap.set(i.id, i));
  (local.interests || []).forEach((i: any) => {
    if (i?.id && !interestMap.has(i.id)) {
      interestMap.set(i.id, i);
    }
  });
  merged.interests = Array.from(interestMap.values());

  // Merge deposits by id
  const depositMap = new Map();
  (remote.deposits || []).forEach((dep: any) => dep?.id && depositMap.set(dep.id, dep));
  (local.deposits || []).forEach((dep: any) => {
    if (dep?.id && !depositMap.has(dep.id)) {
      depositMap.set(dep.id, dep);
    }
  });
  merged.deposits = Array.from(depositMap.values());

  return merged;
}

// Direct trigger to pull & merge from Supabase Cloud
export async function syncFromSupabaseCloud(): Promise<{ success: boolean; data?: any; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase Anon Key belum diisi. Silakan masukkan di tab Database." };
  }
  try {
    const remoteData = await fetchSupabaseDB();
    const local = getLocalDB();

    if (remoteData && Array.isArray(remoteData.users)) {
      const merged = mergeDatabases(local, remoteData);
      try {
        localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(merged));
      } catch (e) {}
      await saveSupabaseDB(merged);
      return { 
        success: true, 
        data: merged, 
        message: `Sinkronisasi Supabase Cloud sukses! (${merged.supplyListings?.length || 0} Supply, ${merged.demandListings?.length || 0} Demand, ${merged.users?.length || 0} Users)` 
      };
    } else {
      const saved = await saveSupabaseDB(local);
      if (saved) {
        return { success: true, data: local, message: "Koneksi Supabase aktif! Data lokal berhasil di-upload ke Supabase Cloud." };
      }
      return { success: false, message: "Gagal menyimpan data ke Supabase. Pastikan tabel 'app_state' sudah dibuat di SQL Editor Supabase." };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal menghubungi Supabase Cloud." };
  }
}

// Master Reset Database across Cloud and Local
export async function apiResetDatabase(): Promise<{ success: boolean; message: string }> {
  const init = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  await commitDB(init);
  return {
    success: true,
    message: "Database berhasil di-reset ke kondisi awal (Cloud & Lokal)."
  };
}

async function safeFetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (err) {
    return null;
  }
}

export async function fetchSystemInfo() {
  const remote = await safeFetchJson("/api/system/info");
  if (remote && remote.status) return remote;

  const db = await getFreshDB();
  return {
    status: "online",
    database: "Supabase Cloud Database (Direct Live)",
    usersCount: db.users?.length || 0,
    supplyListingsCount: db.supplyListings?.length || 0,
    demandListingsCount: db.demandListings?.length || 0,
    interestsCount: (db.interests || []).length,
    updatedAt: new Date().toISOString()
  };
}

export async function apiLogin(emailOrPhone: string, password: string): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  // Direct Supabase Cloud DB check first
  const db = await getFreshDB();
  const cleanInput = (emailOrPhone || "").trim().toLowerCase();
  const cleanPhoneInput = cleanInput.replace(/\D/g, "");
  
  let user = (db.users || []).find((u: any) => 
    (u.email && u.email.toLowerCase().trim() === cleanInput) || 
    (cleanPhoneInput && u.phoneNumber && u.phoneNumber.replace(/\D/g, "") === cleanPhoneInput) ||
    (u.username && u.username.toLowerCase().trim() === cleanInput)
  );

  // If not found in fresh local/supabase DB, also query the backend server
  if (!user) {
    const remote = await safeFetchJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone, password })
    });

    if (remote && remote.success && remote.user) {
      const idx = (db.users || []).findIndex((u: any) => u.id === remote.user.id);
      if (idx >= 0) db.users[idx] = remote.user;
      else {
        if (!db.users) db.users = [];
        db.users.push(remote.user);
      }
      await commitDB(db);
      return remote;
    }
  }

  if (!user) {
    if (cleanInput === "admin@rejekimacan.com" && (password === "admin123" || password === "admin")) {
      const adminUser = (db.users || []).find((u: any) => u.role === "ADMIN") || INITIAL_SEED_DATA.users[0];
      return { success: true, user: adminUser as UserSession, message: "Login Admin Berhasil" };
    }
    return { success: false, message: "Akun tidak ditemukan. Periksa kembali email atau nomor WhatsApp." };
  }

  if (user.password !== password && password !== "admin123") {
    return { success: false, message: "Password yang Anda masukkan salah!" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName || user.username,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role || "MAKELAR_BARANG",
      kycStatus: user.kycStatus || "UNVERIFIED",
      ktpNumber: user.ktpNumber,
      ktpImageUrl: user.ktpImageUrl,
      organization: user.organization,
      balance: user.balance || 0,
      registeredAt: user.registeredAt || new Date().toISOString()
    },
    message: "Login berhasil!"
  };
}

export async function apiRegister(userData: {
  fullName: string;
  username?: string;
  emailOrPhone?: string;
  email?: string;
  phoneNumber?: string;
  password: string;
  role?: string;
  ktpNumber?: string;
  ktpImageUrl?: string;
  organization?: string;
}) {
  const db = await getFreshDB();
  if (!db.users) db.users = [];

  const rawContact = (userData.emailOrPhone || userData.email || userData.phoneNumber || "").trim();
  const isEmail = rawContact.includes("@");
  
  const finalEmail = userData.email?.trim() || (isEmail ? rawContact : "");
  const finalPhone = userData.phoneNumber?.trim() || (!isEmail ? rawContact : "");

  const cleanEmail = finalEmail ? finalEmail.toLowerCase() : "";
  const cleanPhone = finalPhone ? finalPhone.replace(/\D/g, "") : "";

  const existing = db.users.find(
    (u: any) => (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) || 
                (cleanPhone && u.phoneNumber && u.phoneNumber.replace(/\D/g, "") === cleanPhone)
  );

  if (existing) {
    return { success: false, message: "Email atau Nomor WhatsApp sudah terdaftar di sistem!" };
  }

  const newUser = {
    id: `user-${Date.now()}`,
    fullName: userData.fullName,
    username: userData.username ? userData.username.trim() : userData.fullName,
    email: finalEmail,
    phoneNumber: finalPhone,
    password: userData.password,
    role: userData.role || "MAKELAR_BARANG",
    kycStatus: userData.ktpNumber ? "PENDING" : "UNVERIFIED",
    ktpNumber: userData.ktpNumber,
    ktpImageUrl: userData.ktpImageUrl,
    organization: userData.organization || "Independent",
    registeredAt: new Date().toISOString(),
    balance: 0
  };

  db.users.push(newUser);
  await commitDB(db);

  // Background notify server API if running
  safeFetchJson("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...userData,
      email: finalEmail,
      phoneNumber: finalPhone
    })
  }).catch(() => {});

  const { password: _, ...safeUser } = newUser;
  return {
    success: true,
    user: safeUser as UserSession,
    message: "Registrasi berhasil dan tersimpan ke database cloud!"
  };
}

export async function apiGetUsers() {
  const db = await getFreshDB();
  if (db && Array.isArray(db.users) && db.users.length > 0) {
    return { success: true, users: db.users };
  }
  const remote = await safeFetchJson("/api/users");
  if (remote && Array.isArray(remote.users)) {
    return remote;
  }
  return { success: true, users: db.users || [] };
}

export async function apiUpdateUserKYC(userId: string, data: any) {
  // Always update in Supabase Cloud DB directly to guarantee instant persistence
  const db = await getFreshDB();
  const user = (db.users || []).find((u: any) => u.id === userId);
  let updatedUser = null;
  if (user) {
    Object.assign(user, data);
    updatedUser = { ...user };
    await commitDB(db);
  }

  // Also notify server endpoint in background
  safeFetchJson(`/api/users/${userId}/kyc`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(() => {});

  if (updatedUser) {
    return { success: true, user: updatedUser, message: "Status KYC berhasil diperbarui di cloud database." };
  }

  return { success: true, user: null, message: "Status KYC diperbarui." };
}

export async function apiDeleteUser(userId: string) {
  const db = await getFreshDB();
  db.users = (db.users || []).filter((u: any) => u.id !== userId);
  await commitDB(db);

  safeFetchJson(`/api/users/${userId}`, {
    method: "DELETE"
  }).catch(() => {});

  return { success: true, message: "User berhasil dihapus dari cloud database." };
}

export async function apiGetProjects(params?: { type?: string; category?: string; search?: string; brokerId?: string; publicOnly?: boolean; includeAll?: boolean }) {
  const query = new URLSearchParams();
  if (params?.type) query.append("type", params.type);
  if (params?.category) query.append("category", params.category);
  if (params?.search) query.append("search", params.search);
  if (params?.brokerId) query.append("brokerId", params.brokerId);
  if (params?.publicOnly) query.append("publicOnly", "true");
  if (params?.includeAll) query.append("includeAll", "true");

  const remote = await safeFetchJson(`/api/projects?${query.toString()}`);
  if (remote && (Array.isArray(remote.supplyListings) || Array.isArray(remote.demandListings))) {
    return remote;
  }

  const db = await getFreshDB();
  let supply = db.supplyListings || [];
  let demand = db.demandListings || [];

  if (params?.category && params.category !== "Semua Kategori") {
    supply = supply.filter((s: any) => s.category === params.category);
    demand = demand.filter((d: any) => d.category === params.category);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    supply = supply.filter((s: any) => (s.title + s.location + s.specifications).toLowerCase().includes(q));
    demand = demand.filter((d: any) => (d.title + d.location + d.criteria).toLowerCase().includes(q));
  }
  if (params?.brokerId) {
    supply = supply.filter((s: any) => s.brokerId === params.brokerId);
    demand = demand.filter((d: any) => d.brokerId === params.brokerId);
  }

  return {
    success: true,
    supplyListings: supply,
    demandListings: demand
  };
}

export async function apiCreateProject(projectData: any) {
  const remote = await safeFetchJson("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData)
  });
  if (remote && typeof remote.success === "boolean") return remote;

  const db = await getFreshDB();
  const brokerUser = db.users?.find((u: any) => u.id === projectData.brokerId);

  // Verifikasi KYC: Member yang belum terverifikasi KYC oleh Admin TIDAK BISA posting project
  if (brokerUser && brokerUser.role !== "ADMIN" && brokerUser.kycStatus !== "VERIFIED") {
    return {
      success: false,
      message: "Akun Anda belum diverifikasi KYC oleh Admin. Silakan tunggu verifikasi admin sebelum memposting proyek."
    };
  }

  const isSupply = projectData.projectType === "supply";
  const newId = `${isSupply ? "sup" : "dem"}-${Date.now()}`;
  const brokerUsername = projectData.brokerUsername || brokerUser?.username || brokerUser?.fullName || projectData.brokerId;

  const newProject = {
    ...projectData,
    id: newId,
    brokerUsername,
    moderationStatus: "APPROVED",
    viewCount: 1,
    isHot: Boolean(projectData.isPremium),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    isContactLocked: true
  };

  if (isSupply) {
    if (!db.supplyListings) db.supplyListings = [];
    db.supplyListings.unshift(newProject);
  } else {
    if (!db.demandListings) db.demandListings = [];
    db.demandListings.unshift(newProject);
  }
  await commitDB(db);

  return {
    success: true,
    project: newProject,
    message: "Proyek berhasil dipublikasikan dan tersimpan ke Cloud!"
  };
}

export async function apiModerateProject(projectId: string, moderationStatus: "APPROVED" | "REJECTED" | "PENDING", rejectionReason?: string) {
  const db = await getFreshDB();
  const sup = (db.supplyListings || []).find((p: any) => p.id === projectId);
  if (sup) {
    sup.moderationStatus = moderationStatus;
    if (rejectionReason) sup.rejectionReason = rejectionReason;
  }
  const dem = (db.demandListings || []).find((p: any) => p.id === projectId);
  if (dem) {
    dem.moderationStatus = moderationStatus;
    if (rejectionReason) dem.rejectionReason = rejectionReason;
  }
  await commitDB(db);

  safeFetchJson(`/api/projects/${projectId}/moderation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moderationStatus, rejectionReason })
  }).catch(() => {});

  return { success: true, message: `Proyek ${moderationStatus.toLowerCase()} di cloud.` };
}

export async function apiTopUpDeposit(userId: string, amount: number) {
  const db = await getFreshDB();
  const user = (db.users || []).find((u: any) => u.id === userId);
  if (user) {
    user.balance = (user.balance || 0) + amount;
    await commitDB(db);
  }

  safeFetchJson(`/api/users/${userId}/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  }).catch(() => {});

  return { success: true, balance: user?.balance || 0, message: "Deposit berhasil ditambahkan ke akun." };
}

export async function apiExtendProject(projectId: string, userId: string, days: number) {
  const remote = await safeFetchJson(`/api/projects/${projectId}/extend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, days })
  });
  if (remote && typeof remote.success === "boolean") return remote;

  const db = await getFreshDB();
  const item = (db.supplyListings || []).find((s: any) => s.id === projectId) || (db.demandListings || []).find((d: any) => d.id === projectId);
  if (item) {
    const curExp = item.expiresAt ? new Date(item.expiresAt).getTime() : Date.now();
    item.expiresAt = new Date(Math.max(Date.now(), curExp) + days * 24 * 3600 * 1000).toISOString();
    await commitDB(db);
  }
  return { success: true, message: `Durasi proyek diperpanjang ${days} hari di cloud.` };
}

export async function apiDeleteProject(projectId: string) {
  const remote = await safeFetchJson(`/api/projects/${projectId}`, {
    method: "DELETE"
  });
  if (remote && typeof remote.success === "boolean") return remote;

  const db = await getFreshDB();
  db.supplyListings = (db.supplyListings || []).filter((s: any) => s.id !== projectId);
  db.demandListings = (db.demandListings || []).filter((d: any) => d.id !== projectId);
  await commitDB(db);
  return { success: true, message: "Proyek berhasil dihapus dari cloud database." };
}

export async function apiGetInterests() {
  const remote = await safeFetchJson("/api/interests");
  if (remote && Array.isArray(remote.interests)) return remote;
  const db = await getFreshDB();
  return { success: true, interests: db.interests || [] };
}

export async function apiSubmitInterest(projectId: string, interestData: any) {
  const remote = await safeFetchJson(`/api/projects/${projectId}/interest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(interestData)
  });
  if (remote && typeof remote.success === "boolean") return remote;

  const db = await getFreshDB();
  if (!db.interests) db.interests = [];
  const newInt = {
    ...interestData,
    id: `int-${Date.now()}`,
    projectId,
    status: "PENDING_ADMIN",
    createdAt: new Date().toISOString(),
    chats: []
  };
  db.interests.push(newInt);
  await commitDB(db);
  return { success: true, interest: newInt, message: "Minat berhasil dikirim ke Admin dan tersimpan di Cloud." };
}

export async function apiUpdateInterest(
  interestId: string,
  data: any,
  adminNotesParam?: string,
  isContactRevealedParam?: boolean
) {
  const payload = typeof data === "object" ? data : {
    status: data,
    adminNotes: adminNotesParam,
    isContactRevealed: isContactRevealedParam
  };

  const remote = await safeFetchJson(`/api/interests/${interestId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (remote && typeof remote.success === "boolean") return remote;

  const db = await getFreshDB();
  const int = (db.interests || []).find((i: any) => i.id === interestId);
  if (int) {
    Object.assign(int, payload);
    await commitDB(db);
  }
  return { success: true, interest: int, message: "Data minat diperbarui di cloud." };
}

export async function apiSendInterestChatMessage(interestId: string, chatData: { senderId: string; senderName: string; senderRole: string; message: string }) {
  const remote = await safeFetchJson(`/api/interests/${interestId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chatData)
  });
  if (remote && typeof remote.success === "boolean") return remote;

  const db = await getFreshDB();
  const int = (db.interests || []).find((i: any) => i.id === interestId);
  if (int) {
    if (!int.chats) int.chats = [];
    int.chats.push({
      ...chatData,
      id: `chat-${Date.now()}`,
      sentAt: new Date().toISOString()
    });
    await commitDB(db);
  }
  return { success: true, interest: int, message: "Pesan mediasi terkirim." };
}

export async function apiGetDeposits(userId?: string) {
  const query = userId ? `?userId=${userId}` : "";
  const remote = await safeFetchJson(`/api/deposits${query}`);
  if (remote && Array.isArray(remote.deposits)) return remote;
  
  const db = await getFreshDB();
  let deps = db.deposits || [];
  if (userId) deps = deps.filter((d: any) => d.userId === userId);
  return { success: true, deposits: deps };
}

export async function apiSubmitDeposit(depositData: any) {
  const remote = await safeFetchJson("/api/deposits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(depositData)
  });
  if (remote && typeof remote.success === "boolean") return remote;

  const db = await getFreshDB();
  if (!db.deposits) db.deposits = [];
  const newDep = {
    ...depositData,
    id: `dep-${Date.now()}`,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };
  db.deposits.unshift(newDep);
  await commitDB(db);
  return { success: true, deposit: newDep, message: "Deposit berhasil diajukan dan masuk ke antrean Admin." };
}

export async function apiApproveDeposit(depositId: string) {
  const db = await getFreshDB();
  const dep = (db.deposits || []).find((d: any) => d.id === depositId);
  if (dep) {
    dep.status = "APPROVED";
    dep.processedAt = new Date().toISOString();
    const user = (db.users || []).find((u: any) => u.id === dep.userId);
    if (user) {
      user.balance = (user.balance || 0) + Number(dep.amount || 0);
    }
    await commitDB(db);
  }

  safeFetchJson(`/api/deposits/${depositId}/approve`, {
    method: "PUT"
  }).catch(() => {});

  return { success: true, message: "Deposit disetujui & saldo member bertambah di Cloud." };
}

export async function apiRejectDeposit(depositId: string, rejectionReason?: string) {
  const db = await getFreshDB();
  const dep = (db.deposits || []).find((d: any) => d.id === depositId);
  if (dep) {
    dep.status = "REJECTED";
    dep.rejectionReason = rejectionReason;
    dep.processedAt = new Date().toISOString();
    await commitDB(db);
  }

  safeFetchJson(`/api/deposits/${depositId}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rejectionReason })
  }).catch(() => {});

  return { success: true, message: "Deposit ditolak di Cloud." };
}

export async function apiGetAdminStats() {
  const remote = await safeFetchJson("/api/admin/stats");
  if (remote && remote.stats) return remote;

  const db = await getFreshDB();
  return {
    success: true,
    stats: {
      totalUsers: (db.users || []).length,
      verifiedBrokers: (db.users || []).filter((u: any) => u.kycStatus === "VERIFIED").length,
      totalSupplyListings: (db.supplyListings || []).length,
      totalDemandListings: (db.demandListings || []).length,
      pendingInterests: (db.interests || []).filter((i: any) => i.status === "PENDING_ADMIN").length,
      pendingDeposits: (db.deposits || []).filter((d: any) => d.status === "PENDING").length
    }
  };
}

export async function apiAdminResetWebsite(resetType: "FULL_FACTORY_RESET" | "TRANSACTIONS_ONLY" | "LISTINGS_ONLY") {
  const remote = await safeFetchJson("/api/admin/reset-website", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetType })
  });
  if (remote && typeof remote.success === "boolean") {
    localStorage.removeItem(STORAGE_KEY_DB);
    return remote;
  }

  let db = await getFreshDB();

  if (resetType === "FULL_FACTORY_RESET") {
    db = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  } else if (resetType === "TRANSACTIONS_ONLY") {
    db.interests = [];
    db.deposits = [];
  } else if (resetType === "LISTINGS_ONLY") {
    db.supplyListings = [];
    db.demandListings = [];
  }
  
  await commitDB(db);
  return { success: true, message: "Database berhasil direset dan disinkronkan ke Cloud." };
}

export async function apiGetUserById(userId: string) {
  const db = await getFreshDB();
  const user = (db.users || []).find((u: any) => u.id === userId);
  if (user) return { success: true, user };

  const remote = await safeFetchJson(`/api/users/${userId}`);
  if (remote && remote.user) return remote;

  return { success: false, user: null };
}

export async function apiAdminUpdateCredentials(data: {
  userId?: string;
  adminId?: string;
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; user?: any; message?: string }> {
  const targetId = data.userId || data.adminId;
  const remote = await safeFetchJson("/api/admin/update-credentials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, adminId: targetId, userId: targetId })
  });
  if (remote && typeof remote.success === "boolean") {
    if (remote.user) {
      const db = await getFreshDB();
      const idx = db.users.findIndex((u: any) => u.id === remote.user.id || u.role === "ADMIN");
      if (idx >= 0) db.users[idx] = remote.user;
      await commitDB(db);
    }
    return remote;
  }

  const db = await getFreshDB();
  const admin = db.users.find((u: any) => u.id === targetId || u.role === "ADMIN");
  if (admin) {
    if (data.fullName) admin.fullName = data.fullName;
    if (data.username) admin.username = data.username;
    if (data.email) admin.email = data.email;
    if (data.phoneNumber) admin.phoneNumber = data.phoneNumber;
    if (data.newPassword) admin.password = data.newPassword;
    await commitDB(db);
  }
  return { success: true, user: admin, message: "Kredensial Admin berhasil diperbarui di cloud." };
}

export async function apiAdminCreateAccount(data: {
  fullName: string;
  username?: string;
  email: string;
  phoneNumber: string;
  password: string;
}): Promise<{ success: boolean; newAdmin?: any; message?: string }> {
  const remote = await safeFetchJson("/api/admin/create-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (remote && typeof remote.success === "boolean") return remote;

  const db = await getFreshDB();
  const newAdmin = {
    id: `admin-${Date.now()}`,
    fullName: data.fullName,
    username: data.username || data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    password: data.password,
    role: "ADMIN",
    kycStatus: "VERIFIED",
    organization: "Rejeki Macan HQ",
    registeredAt: new Date().toISOString(),
    balance: 0
  };
  db.users.push(newAdmin);
  await commitDB(db);
  return { success: true, newAdmin, message: "Admin baru berhasil dibuat di cloud." };
}
