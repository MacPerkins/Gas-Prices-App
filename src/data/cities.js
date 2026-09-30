// Seed cities in northern Utah County, centered on American Fork (the home base).
// Each city carries an EIA region so regional trend charts can pick the right series.
// Users can add any other city from Settings — it just won't have seeded stations yet.

export const EIA_REGION_UTAH = 'UT';

export const SEED_CITIES = [
  {
    id: 'american-fork',
    name: 'American Fork',
    state: 'UT',
    zip: '84003',
    eiaRegion: EIA_REGION_UTAH,
    lat: 40.3769,
    lon: -111.7959,
    isHome: true,
  },
  {
    id: 'lehi',
    name: 'Lehi',
    state: 'UT',
    zip: '84043',
    eiaRegion: EIA_REGION_UTAH,
    lat: 40.3916,
    lon: -111.8508,
  },
  {
    id: 'pleasant-grove',
    name: 'Pleasant Grove',
    state: 'UT',
    zip: '84062',
    eiaRegion: EIA_REGION_UTAH,
    lat: 40.3641,
    lon: -111.7385,
  },
  {
    id: 'orem',
    name: 'Orem',
    state: 'UT',
    zip: '84057',
    eiaRegion: EIA_REGION_UTAH,
    lat: 40.2969,
    lon: -111.6946,
  },
  {
    id: 'highland',
    name: 'Highland',
    state: 'UT',
    zip: '84003',
    eiaRegion: EIA_REGION_UTAH,
    lat: 40.4227,
    lon: -111.7938,
    note: 'Highland has no gas stations inside city limits — nearest options are in American Fork and Alpine.',
  },
];

export function getAllCities(customCities = []) {
  return [...SEED_CITIES, ...customCities];
}
