export enum UserRole {
  MAKELAR_BARANG = "MAKELAR_BARANG", // Broker Penjual
  MAKELAR_BUYER = "MAKELAR_BUYER",   // Broker Pembeli
  ADMIN = "ADMIN"                     // Validator Platform
}

export enum KYCStatus {
  UNREGISTERED = "UNREGISTERED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED"
}

export interface UserSession {
  id: string;
  fullName: string;
  username?: string; // Username / Nama Panggilan Broker (Public Display Name)
  email: string;
  phoneNumber: string;
  role: UserRole;
  kycStatus: KYCStatus;
  ktpNumber?: string;
  ktpImageUrl?: string;
  organization?: string;
  registeredAt?: string;
  balance?: number; // Saldo Deposit untuk Fitur Berbayar (e.g. Premium Ads Rp 5.000/hari)
}

export type ListingStatus = "VERIFIED" | "ON_PROGRESS" | "CLOSED";
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type DepositStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentMethod = "QRIS" | "VA_BCA" | "VA_MANDIRI" | "VA_BRI" | "BANK_TRANSFER";

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentCode: string;
  senderName?: string;
  proofUrl?: string;
  notes?: string;
  status: DepositStatus;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface SupplyListing {
  id: string;
  title: string;
  category: string;
  specifications: string;
  location: string;
  price: number;
  brokerId: string;
  brokerName: string;
  brokerPhone: string;
  status: ListingStatus;
  moderationStatus?: ModerationStatus; // Status Moderasi Admin: PENDING | APPROVED | REJECTED
  rejectionReason?: string;
  imageUrl?: string;
  createdAt: string;
  expiresAt: string; // Expiration timestamp (10 days limit)
  viewsCount: number;
  isPremium?: boolean; // Penanda Iklan Berbayar / Premium
  premiumUntil?: string; // Tanggal kedaluwarsa masa premium
  isSuspicious?: boolean; // Deteksi penyerobotan kontak langsung
  isA1Verified?: boolean; // Validasi kepemilikan langsung A1/Pemilik Lahan
}

export interface DemandListing {
  id: string;
  title: string;
  category: string;
  criteria: string;
  budgetMin: number;
  budgetMax: number;
  paymentSystem: string;
  brokerId: string;
  brokerName: string;
  brokerPhone: string;
  status: ListingStatus;
  moderationStatus?: ModerationStatus; // Status Moderasi Admin: PENDING | APPROVED | REJECTED
  rejectionReason?: string;
  createdAt: string;
  expiresAt: string; // Expiration timestamp (10 days limit)
  isPremium?: boolean; // Penanda Iklan Berbayar / Premium
  premiumUntil?: string; // Tanggal kedaluwarsa masa premium
  isSuspicious?: boolean; // Deteksi penyerobotan kontak langsung
  fundingCriteria?: string; // Kriteria pendanaan konkret
}

export type InterestStatus = "PENDING_VERIFICATION" | "VERIFIED_BY_ADMIN" | "RELAYED_TO_OWNER";

export interface ListingInterest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingType: "supply" | "demand";
  ownerBrokerId: string;
  ownerBrokerName: string;
  interestedBrokerId: string;
  interestedBrokerName: string;
  interestedBrokerPhone: string;
  createdAt: string;
  status: InterestStatus;
  userMessage: string;
  adminNotes?: string;
}

export interface MatchmakingResult {
  id: string;
  supply: SupplyListing;
  demand: DemandListing;
  matchScore: number; // 0 - 100
  matchFactors: string[];
  createdAt: string;
}
