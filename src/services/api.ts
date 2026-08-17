import { UserSession, SupplyListing, DemandListing, ListingInterest } from "../types";

export async function fetchSystemInfo() {
  const res = await fetch("/api/system/info");
  return res.json();
}

export async function apiLogin(emailOrPhone: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrPhone, password })
  });
  return res.json();
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
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  return res.json();
}

export async function apiGetUsers() {
  const res = await fetch("/api/users");
  return res.json();
}

export async function apiUpdateUserKYC(userId: string, data: { kycStatus?: string; ktpNumber?: string; ktpImageUrl?: string; organization?: string; fullName?: string; username?: string; phoneNumber?: string; role?: string }) {
  const res = await fetch(`/api/users/${userId}/kyc`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiDeleteUser(userId: string) {
  const res = await fetch(`/api/users/${userId}`, {
    method: "DELETE"
  });
  return res.json();
}

export async function apiGetProjects(params?: { type?: string; category?: string; search?: string; brokerId?: string; publicOnly?: boolean; includeAll?: boolean }) {
  const query = new URLSearchParams();
  if (params?.type) query.append("type", params.type);
  if (params?.category) query.append("category", params.category);
  if (params?.search) query.append("search", params.search);
  if (params?.brokerId) query.append("brokerId", params.brokerId);
  if (params?.publicOnly) query.append("publicOnly", "true");
  if (params?.includeAll) query.append("includeAll", "true");

  const res = await fetch(`/api/projects?${query.toString()}`);
  return res.json();
}

export async function apiCreateProject(projectData: any) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData)
  });
  return res.json();
}

export async function apiModerateProject(projectId: string, moderationStatus: "APPROVED" | "REJECTED" | "PENDING", rejectionReason?: string) {
  const res = await fetch(`/api/projects/${projectId}/moderation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moderationStatus, rejectionReason })
  });
  return res.json();
}

export async function apiTopUpDeposit(userId: string, amount: number) {
  const res = await fetch(`/api/users/${userId}/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });
  return res.json();
}

export async function apiExtendProject(projectId: string, userId: string, days: number) {
  const res = await fetch(`/api/projects/${projectId}/extend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, days })
  });
  return res.json();
}

export async function apiDeleteProject(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: "DELETE"
  });
  return res.json();
}

export async function apiGetInterests() {
  const res = await fetch("/api/interests");
  return res.json();
}

export async function apiSubmitInterest(projectId: string, interestData: any) {
  const res = await fetch(`/api/projects/${projectId}/interest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(interestData)
  });
  return res.json();
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
  return res.json();
}

export async function apiSendInterestChatMessage(interestId: string, chatData: { senderId: string; senderName: string; senderRole: string; message: string }) {
  const res = await fetch(`/api/interests/${interestId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chatData)
  });
  return res.json();
}

export async function apiGetDeposits(userId?: string) {
  const query = userId ? `?userId=${userId}` : "";
  const res = await fetch(`/api/deposits${query}`);
  return res.json();
}

export async function apiSubmitDeposit(depositData: {
  userId: string;
  amount: number;
  paymentMethod: string;
  senderName?: string;
  proofUrl?: string;
  notes?: string;
}) {
  const res = await fetch("/api/deposits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(depositData)
  });
  return res.json();
}

export async function apiApproveDeposit(depositId: string) {
  const res = await fetch(`/api/deposits/${depositId}/approve`, {
    method: "PUT"
  });
  return res.json();
}

export async function apiRejectDeposit(depositId: string, rejectionReason?: string) {
  const res = await fetch(`/api/deposits/${depositId}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rejectionReason })
  });
  return res.json();
}

export async function apiGetAdminStats() {
  const res = await fetch("/api/admin/stats");
  return res.json();
}

export async function apiAdminResetWebsite(resetType: "FULL_FACTORY_RESET" | "TRANSACTIONS_ONLY" | "LISTINGS_ONLY") {
  const res = await fetch("/api/admin/reset-website", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetType })
  });
  return res.json();
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
  const res = await fetch("/api/admin/update-credentials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiAdminCreateAccount(data: {
  fullName: string;
  username?: string;
  email: string;
  phoneNumber: string;
  password: string;
}) {
  const res = await fetch("/api/admin/create-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}
