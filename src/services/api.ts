import { UserSession, SupplyListing, DemandListing, ListingInterest } from "../types";

async function parseJsonResponse(res: Response, fallbackData?: any) {
  try {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return fallbackData || { success: res.ok, message: res.statusText || "Response non-JSON" };
    }
  } catch (err) {
    console.error("API response parsing error:", err);
    return fallbackData || { success: false, message: "Gagal memproses data dari server." };
  }
}

export async function fetchSystemInfo() {
  try {
    const res = await fetch("/api/system/info");
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi server gagal" };
  }
}

export async function apiLogin(emailOrPhone: string, password: string) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone, password })
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi ke server gagal." };
  }
}

export async function apiRegister(userData: {
  fullName: string;
  username?: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: string;
  ktpNumber?: string;
  ktpImageUrl?: string;
  organization?: string;
}) {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi ke server gagal." };
  }
}

export async function apiGetUsers() {
  try {
    const res = await fetch("/api/users");
    return await parseJsonResponse(res, { success: true, users: [] });
  } catch (err) {
    return { success: true, users: [] };
  }
}

export async function apiUpdateUserKYC(userId: string, data: { kycStatus?: string; ktpNumber?: string; ktpImageUrl?: string; organization?: string; fullName?: string; username?: string; phoneNumber?: string; role?: string }) {
  try {
    const res = await fetch(`/api/users/${userId}/kyc`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiDeleteUser(userId: string) {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: "DELETE"
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiGetProjects(params?: { type?: string; category?: string; search?: string; brokerId?: string; publicOnly?: boolean; includeAll?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.category) query.append("category", params.category);
    if (params?.search) query.append("search", params.search);
    if (params?.brokerId) query.append("brokerId", params.brokerId);
    if (params?.publicOnly) query.append("publicOnly", "true");
    if (params?.includeAll) query.append("includeAll", "true");

    const res = await fetch(`/api/projects?${query.toString()}`);
    return await parseJsonResponse(res, { success: true, supplyListings: [], demandListings: [] });
  } catch (err) {
    return { success: true, supplyListings: [], demandListings: [] };
  }
}

export async function apiCreateProject(projectData: any) {
  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal saat membuat proyek." };
  }
}

export async function apiModerateProject(projectId: string, moderationStatus: "APPROVED" | "REJECTED" | "PENDING", rejectionReason?: string) {
  try {
    const res = await fetch(`/api/projects/${projectId}/moderation`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moderationStatus, rejectionReason })
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiTopUpDeposit(userId: string, amount: number) {
  try {
    const res = await fetch(`/api/users/${userId}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiExtendProject(projectId: string, userId: string, days: number) {
  try {
    const res = await fetch(`/api/projects/${projectId}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, days })
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiDeleteProject(projectId: string) {
  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE"
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiGetInterests() {
  try {
    const res = await fetch("/api/interests");
    return await parseJsonResponse(res, { success: true, interests: [] });
  } catch (err) {
    return { success: true, interests: [] };
  }
}

export async function apiSubmitInterest(projectId: string, interestData: any) {
  try {
    const res = await fetch(`/api/projects/${projectId}/interest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interestData)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiUpdateInterest(
  interestId: string, 
  data: {
    status?: string; 
    adminNotes?: string; 
    isContactRevealed?: boolean;
    ownerBrokerName?: string;
    interestedBrokerName?: string;
    listingTitle?: string;
  } | string,
  adminNotesParam?: string,
  isContactRevealedParam?: boolean
) {
  try {
    const payload = typeof data === "object" ? data : {
      status: data,
      adminNotes: adminNotesParam,
      isContactRevealed: isContactRevealedParam
    };

    const res = await fetch(`/api/interests/${interestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiSendInterestChatMessage(interestId: string, chatData: { senderId: string; senderName: string; senderRole: string; message: string }) {
  try {
    const res = await fetch(`/api/interests/${interestId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chatData)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiGetDeposits(userId?: string) {
  try {
    const query = userId ? `?userId=${userId}` : "";
    const res = await fetch(`/api/deposits${query}`);
    return await parseJsonResponse(res, { success: true, deposits: [] });
  } catch (err) {
    return { success: true, deposits: [] };
  }
}

export async function apiSubmitDeposit(depositData: {
  userId: string;
  amount: number;
  paymentMethod: string;
  senderName?: string;
  proofUrl?: string;
  notes?: string;
}) {
  try {
    const res = await fetch("/api/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(depositData)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiApproveDeposit(depositId: string) {
  try {
    const res = await fetch(`/api/deposits/${depositId}/approve`, {
      method: "PUT"
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiRejectDeposit(depositId: string, rejectionReason?: string) {
  try {
    const res = await fetch(`/api/deposits/${depositId}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason })
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiGetAdminStats() {
  try {
    const res = await fetch("/api/admin/stats");
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiAdminResetWebsite(resetType: "FULL_FACTORY_RESET" | "TRANSACTIONS_ONLY" | "LISTINGS_ONLY") {
  try {
    const res = await fetch("/api/admin/reset-website", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetType })
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiAdminUpdateCredentials(data: {
  adminId?: string;
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  try {
    const res = await fetch("/api/admin/update-credentials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}

export async function apiAdminCreateAccount(data: {
  fullName: string;
  username?: string;
  email: string;
  phoneNumber: string;
  password: string;
}) {
  try {
    const res = await fetch("/api/admin/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: "Koneksi gagal." };
  }
}
