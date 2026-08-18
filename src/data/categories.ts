export const PROJECT_CATEGORIES = [
  "Lahan / Tanah Komersial & Industri",
  "Tanah Kavling & Perumahan",
  "Pabrik & Gudang Siap Pakai",
  "Otomotif & Kendaraan Niaga",
  "Alat Berat & Mesin Konstruksi",
  "Besi, Logam & Scrap Pabrik",
  "Komoditas & Hasil Bumi",
  "Pertambangan, Kuari & Mineral",
  "SPBU & Energi / Gas",
  "Hotel, Resort & Tempat Wisata",
  "Gedung Kantor & Ruko Komersial",
  "Rumah Mewah & Villa Eksklusif",
  "Akuisisi Perusahaan & Saham Bisnis",
  "Lainnya"
] as const;

export type ProjectCategory = typeof PROJECT_CATEGORIES[number];

export const HOMEPAGE_FILTER_CATEGORIES = [
  "ALL",
  ...PROJECT_CATEGORIES
];
