export const INITIAL_SEED_DATA = {
  users: [
    {
      id: "admin-1",
      fullName: "Super Admin Platform",
      username: "admin_utama",
      email: "admin@rejekimacan.com",
      password: "admin123",
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
