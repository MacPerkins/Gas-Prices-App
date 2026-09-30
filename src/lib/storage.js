// Thin localStorage persistence layer. Everything the app stores is namespaced under
// one key prefix so export/import (Settings tab) can snapshot the whole app in one go.

const PREFIX = 'fuelforecast:';

const KEYS = {
  settings: `${PREFIX}settings`,
  fillups: `${PREFIX}fillups`,
  customStations: `${PREFIX}customStations`,
  customCities: `${PREFIX}customCities`,
  alerts: `${PREFIX}alerts`,
  alertHistory: `${PREFIX}alertHistory`,
};

export const DEFAULT_SETTINGS = {
  homeCityId: 'american-fork',
  eiaApiKey: '',
  vehicle: {
    name: 'My car',
    mpgCombined: 28,
    tankGallons: 13,
  },
  loyalty: {
    maverik: true,
    costco: false,
    samsClub: false,
    smithsFuelPoints: false,
    chevronTechron: false,
  },
  notificationsEnabled: false,
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function read(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    return safeParse(localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private browsing) — fail silently, in-memory state still works.
  }
}

export function loadSettings() {
  const stored = read(KEYS.settings, {});
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    vehicle: { ...DEFAULT_SETTINGS.vehicle, ...(stored.vehicle || {}) },
    loyalty: { ...DEFAULT_SETTINGS.loyalty, ...(stored.loyalty || {}) },
  };
}

export function saveSettings(settings) {
  write(KEYS.settings, settings);
}

export function loadFillups() {
  return read(KEYS.fillups, []);
}

export function saveFillups(fillups) {
  write(KEYS.fillups, fillups);
}

export function loadCustomStations() {
  return read(KEYS.customStations, []);
}

export function saveCustomStations(stations) {
  write(KEYS.customStations, stations);
}

export function loadCustomCities() {
  return read(KEYS.customCities, []);
}

export function saveCustomCities(cities) {
  write(KEYS.customCities, cities);
}

export function loadAlerts() {
  return read(KEYS.alerts, []);
}

export function saveAlerts(alerts) {
  write(KEYS.alerts, alerts);
}

export function loadAlertHistory() {
  return read(KEYS.alertHistory, []);
}

export function saveAlertHistory(history) {
  write(KEYS.alertHistory, history);
}

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    settings: loadSettings(),
    fillups: loadFillups(),
    customStations: loadCustomStations(),
    customCities: loadCustomCities(),
    alerts: loadAlerts(),
    alertHistory: loadAlertHistory(),
  };
}

export function importAllData(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
  if (data.settings) saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
  if (Array.isArray(data.fillups)) saveFillups(data.fillups);
  if (Array.isArray(data.customStations)) saveCustomStations(data.customStations);
  if (Array.isArray(data.customCities)) saveCustomCities(data.customCities);
  if (Array.isArray(data.alerts)) saveAlerts(data.alerts);
  if (Array.isArray(data.alertHistory)) saveAlertHistory(data.alertHistory);
}

export function makeId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
