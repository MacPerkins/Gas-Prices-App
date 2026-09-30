// Client for the U.S. Energy Information Administration's free Open Data API (v2),
// used for the "Seasonal trend" chart: official weekly average retail regular-gasoline
// prices for Utah. This is STATE-level data (EIA doesn't publish city/station-level
// prices), so it's macro context for the seasonal chart, not a substitute for your own
// logged fill-ups.
//
// Get a free key at https://www.eia.gov/opendata/register.php (instant, no cost, no
// billing — it's just a registration token) and paste it into Settings.
//
// IMPORTANT: this was built and integrated against EIA's documented v2 "petroleum/pri/gnd"
// series structure, but outbound access to api.eia.gov was blocked by this build
// environment's network policy, so the exact request below could not be test-fired
// end-to-end before shipping. It runs fine in your own browser (a different network),
// but if Settings reports an error the first time you add your key, the most likely
// fix is the `duoarea` facet below — EIA's state codes follow the pattern "S" + postal
// abbreviation (Utah = SUT); check the response error text against
// https://www.eia.gov/opendata/browser/petroleum/pri/gnd for the exact code if needed.

const EIA_BASE = 'https://api.eia.gov/v2/petroleum/pri/gnd/data/';
const DUOAREA_UTAH = 'SUT';
const PRODUCT_REGULAR = 'EPMR';
const CACHE_KEY = 'fuelforecast:eiaCache';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours — weekly series, no need to refetch often

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(entry) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore — cache is a pure optimization
  }
}

/**
 * Fetch ~2 years of weekly Utah regular-gasoline retail prices.
 * Returns { points: [{date, price}], fetchedAt } sorted oldest → newest.
 * Throws with a human-readable message on failure — callers should catch and fall
 * back to the reference seasonal pattern rather than breaking the UI.
 */
export async function fetchUtahWeeklyGasPrices(apiKey) {
  if (!apiKey) throw new Error('No EIA API key set. Add one in Settings, or rely on the general seasonal pattern.');

  const cached = readCache();
  if (cached && cached.apiKey === apiKey && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { points: cached.points, fetchedAt: cached.fetchedAt, fromCache: true };
  }

  const url = new URL(EIA_BASE);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('frequency', 'weekly');
  url.searchParams.append('data[0]', 'value');
  url.searchParams.append('facets[duoarea][]', DUOAREA_UTAH);
  url.searchParams.append('facets[product][]', PRODUCT_REGULAR);
  url.searchParams.append('sort[0][column]', 'period');
  url.searchParams.append('sort[0][direction]', 'desc');
  url.searchParams.set('length', '104'); // ~2 years of weekly data

  let response;
  try {
    response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new Error(`Could not reach EIA (network error): ${err.message}`);
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.error?.message || body?.error || JSON.stringify(body).slice(0, 200);
    } catch {
      detail = await response.text().catch(() => '');
    }
    throw new Error(`EIA API returned ${response.status}: ${detail || 'no detail'}`);
  }

  const body = await response.json();
  const rows = body?.response?.data;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('EIA API returned no data for Utah regular gasoline — the region/product code may need updating.');
  }

  const points = rows
    .map((row) => ({ date: row.period, price: Number(row.value) }))
    .filter((p) => p.date && Number.isFinite(p.price))
    .sort((a, b) => a.date.localeCompare(b.date));

  const fetchedAt = Date.now();
  writeCache({ apiKey, points, fetchedAt });
  return { points, fetchedAt, fromCache: false };
}

export function clearEiaCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
