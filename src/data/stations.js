// Seed station directory for northern Utah County.
// Sourced from public station listings (GasBuddy / Maverik / brand store locators),
// September 2026. Addresses are the durable part; POSTED PRICES are NOT included here —
// this app has no live price feed, so every price shown elsewhere comes from what you log
// under "Fill-up log". Brands and loyalty flags drive the discount math.

export const BRANDS = {
  maverik: { label: 'Maverik', maverikDiscountPerGallon: 0.02 },
  costco: { label: 'Costco', membershipRequired: true },
  chevron: { label: 'Chevron', loyaltyProgram: 'Techron Advantage' },
  sinclair: { label: 'Sinclair', loyaltyProgram: null },
  smiths: { label: "Smith's Fuel Center", loyaltyProgram: 'Smith\'s Fuel Points' },
  other: { label: 'Other' },
};

export const SEED_STATIONS = [
  // American Fork
  { id: 'af-maverik-state-rd', cityId: 'american-fork', brand: 'maverik', name: 'Maverik #516', address: '1078 E State Rd, American Fork, UT 84003', hours: '24 hours' },
  { id: 'af-maverik-500e', cityId: 'american-fork', brand: 'maverik', name: 'Maverik', address: '1046 S 500 E, American Fork, UT 84003' },
  { id: 'af-chevron-main', cityId: 'american-fork', brand: 'chevron', name: 'Chevron', address: '290 W Main St, American Fork, UT 84003', hours: '24 hours' },
  { id: 'af-sinclair-main', cityId: 'american-fork', brand: 'sinclair', name: 'Sinclair', address: '309 W Main St, American Fork, UT 84003' },

  // Lehi
  { id: 'lehi-costco', cityId: 'lehi', brand: 'costco', name: 'Costco Gas', address: '198 N 1200 E, Lehi, UT 84043' },
  { id: 'lehi-sinclair-main', cityId: 'lehi', brand: 'sinclair', name: 'Sinclair', address: '1195 E Main St, Lehi, UT 84043' },
  { id: 'lehi-sinclair-thanksgiving', cityId: 'lehi', brand: 'sinclair', name: 'Sinclair', address: '2121 N Thanksgiving Way, Lehi, UT 84043' },
  { id: 'lehi-sinclair-wmain', cityId: 'lehi', brand: 'sinclair', name: 'Sinclair', address: '1750 W Main St, Lehi, UT 84043' },
  { id: 'lehi-smiths', cityId: 'lehi', brand: 'smiths', name: "Smith's Fuel Center", address: '1971 N 3600 W, Lehi, UT 84048', hours: '24 hours' },

  // Pleasant Grove
  { id: 'pg-maverik', cityId: 'pleasant-grove', brand: 'maverik', name: 'Maverik #459', address: '705 S State St, Pleasant Grove, UT 84062' },
  { id: 'pg-chevron', cityId: 'pleasant-grove', brand: 'chevron', name: 'Chevron', address: '95 W Center St, Pleasant Grove, UT 84062' },
  { id: 'pg-sinclair', cityId: 'pleasant-grove', brand: 'sinclair', name: 'Sinclair', address: '579 S Pleasant Grove Blvd, Pleasant Grove, UT 84062' },

  // Orem
  { id: 'orem-maverik-1600n', cityId: 'orem', brand: 'maverik', name: 'Maverik #554', address: '1395 W 1600 N, Orem, UT 84057' },
  { id: 'orem-maverik-1200w', cityId: 'orem', brand: 'maverik', name: 'Maverik', address: '833 N 1200 W, Orem, UT 84057' },
  { id: 'orem-maverik-800n', cityId: 'orem', brand: 'maverik', name: 'Maverik #736', address: '85 W 800 N, Orem, UT 84057' },
  { id: 'orem-maverik-state', cityId: 'orem', brand: 'maverik', name: 'Maverik', address: '795 S State St, Orem, UT 84058' },
  { id: 'orem-maverik-800e', cityId: 'orem', brand: 'maverik', name: 'Maverik', address: '1240 S 800 E, Orem, UT 84097' },
  { id: 'orem-maverik-geneva', cityId: 'orem', brand: 'maverik', name: 'Maverik #757', address: '1249 S Geneva Rd, Orem, UT 84058' },
];

export function getBrand(brandKey) {
  return BRANDS[brandKey] || BRANDS.other;
}

export function getStationsForCity(cityId, customStations = []) {
  return [...SEED_STATIONS, ...customStations].filter((s) => s.cityId === cityId);
}

export function getAllStations(customStations = []) {
  return [...SEED_STATIONS, ...customStations];
}
