import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  loadSettings, saveSettings,
  loadFillups, saveFillups,
  loadCustomStations, saveCustomStations,
  loadCustomCities, saveCustomCities,
  loadAlerts, saveAlerts,
  loadAlertHistory, saveAlertHistory,
  exportAllData, importAllData,
  makeId,
} from '../lib/storage';
import { getAllCities } from '../data/cities';
import { getAllStations } from '../data/stations';
import { fetchUtahWeeklyGasPrices } from '../lib/eia';
import { effectivePrice } from '../lib/analysis';

const AppStateContext = createContext(null);

const CURRENT_CITY_KEY = 'fuelforecast:currentCity';

export function AppStateProvider({ children }) {
  const [settings, setSettingsState] = useState(loadSettings);
  const [fillups, setFillupsState] = useState(loadFillups);
  const [customStations, setCustomStationsState] = useState(loadCustomStations);
  const [customCities, setCustomCitiesState] = useState(loadCustomCities);
  const [alerts, setAlertsState] = useState(loadAlerts);
  const [alertHistory, setAlertHistoryState] = useState(loadAlertHistory);
  const [currentCityId, setCurrentCityIdState] = useState(
    () => localStorage.getItem(CURRENT_CITY_KEY) || loadSettings().homeCityId
  );

  const [eiaState, setEiaState] = useState({ status: 'idle', points: [], error: null, fetchedAt: null });

  const cities = useMemo(() => getAllCities(customCities), [customCities]);
  const stations = useMemo(() => getAllStations(customStations), [customStations]);
  const stationLookup = useMemo(() => new Map(stations.map((s) => [s.id, s])), [stations]);

  const setSettings = useCallback((patch) => {
    setSettingsState((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const setCurrentCityId = useCallback((id) => {
    setCurrentCityIdState(id);
    try { localStorage.setItem(CURRENT_CITY_KEY, id); } catch { /* ignore */ }
  }, []);

  const checkAlertsForFillup = useCallback((record) => {
    const price = effectivePrice(record);
    const matches = alerts.filter(
      (a) => a.active && Number(a.thresholdPrice) >= price && (!a.stationId || a.stationId === record.stationId)
    );
    if (!matches.length) return;

    setAlertHistoryState((prev) => {
      const additions = matches.map((a) => ({
        id: makeId('hit'),
        alertId: a.id,
        alertLabel: a.label,
        fillupId: record.id,
        date: record.date,
        price,
        threshold: Number(a.thresholdPrice),
      }));
      const next = [...additions, ...prev].slice(0, 30);
      saveAlertHistory(next);
      return next;
    });

    if (settings.notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      for (const a of matches) {
        try {
          new Notification('Good price logged!', {
            body: `$${price.toFixed(3)}/gal — at or below your "${a.label}" alert of $${Number(a.thresholdPrice).toFixed(3)}.`,
          });
        } catch {
          // Notification API can throw in some contexts (e.g. insecure origin) — non-fatal.
        }
      }
    }
  }, [alerts, settings.notificationsEnabled]);

  const addFillup = useCallback((entry) => {
    const record = { id: makeId('fillup'), ...entry };
    setFillupsState((prev) => {
      const next = [...prev, record];
      saveFillups(next);
      return next;
    });
    checkAlertsForFillup(record);
  }, [checkAlertsForFillup]);

  const updateFillup = useCallback((id, patch) => {
    setFillupsState((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...patch } : f));
      saveFillups(next);
      return next;
    });
  }, []);

  const deleteFillup = useCallback((id) => {
    setFillupsState((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFillups(next);
      return next;
    });
  }, []);

  const addCustomStation = useCallback((station) => {
    setCustomStationsState((prev) => {
      const next = [...prev, { id: makeId('station'), ...station }];
      saveCustomStations(next);
      return next;
    });
  }, []);

  const removeCustomStation = useCallback((id) => {
    setCustomStationsState((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveCustomStations(next);
      return next;
    });
  }, []);

  const addCustomCity = useCallback((city) => {
    let newId = null;
    setCustomCitiesState((prev) => {
      newId = makeId('city');
      const next = [...prev, { id: newId, ...city }];
      saveCustomCities(next);
      return next;
    });
    return newId;
  }, []);

  const removeCustomCity = useCallback((id) => {
    setCustomCitiesState((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCustomCities(next);
      return next;
    });
  }, []);

  const addAlert = useCallback((alert) => {
    setAlertsState((prev) => {
      const next = [...prev, { id: makeId('alert'), active: true, ...alert }];
      saveAlerts(next);
      return next;
    });
  }, []);

  const updateAlert = useCallback((id, patch) => {
    setAlertsState((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a));
      saveAlerts(next);
      return next;
    });
  }, []);

  const deleteAlert = useCallback((id) => {
    setAlertsState((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveAlerts(next);
      return next;
    });
  }, []);

  const refreshEia = useCallback(async () => {
    if (!settings.eiaApiKey) {
      setEiaState({ status: 'idle', points: [], error: null, fetchedAt: null });
      return;
    }
    setEiaState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const { points, fetchedAt } = await fetchUtahWeeklyGasPrices(settings.eiaApiKey);
      setEiaState({ status: 'ready', points, error: null, fetchedAt });
    } catch (err) {
      setEiaState({ status: 'error', points: [], error: err.message, fetchedAt: null });
    }
  }, [settings.eiaApiKey]);

  useEffect(() => {
    refreshEia();
  }, [refreshEia]);

  const exportData = useCallback(() => exportAllData(), []);
  const importData = useCallback((data) => {
    importAllData(data);
    setSettingsState(loadSettings());
    setFillupsState(loadFillups());
    setCustomStationsState(loadCustomStations());
    setCustomCitiesState(loadCustomCities());
    setAlertsState(loadAlerts());
    setAlertHistoryState(loadAlertHistory());
  }, []);

  const value = {
    settings, setSettings,
    fillups, addFillup, updateFillup, deleteFillup,
    customStations, addCustomStation, removeCustomStation,
    customCities, addCustomCity, removeCustomCity,
    alerts, addAlert, updateAlert, deleteAlert, alertHistory,
    cities, stations, stationLookup,
    currentCityId, setCurrentCityId,
    eia: { ...eiaState, refresh: refreshEia },
    exportData, importData,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
