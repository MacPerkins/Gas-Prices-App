import { useEffect, useRef, useState } from 'react';
import { useAppState } from '../state/AppState.jsx';

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fuelforecast:theme') || 'system');
  useEffect(() => {
    if (theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('fuelforecast:theme', theme); } catch { /* ignore */ }
  }, [theme]);
  return [theme, setTheme];
}

export default function SettingsTab() {
  const { settings, setSettings, cities, eia, exportData, importData, customCities, removeCustomCity } = useAppState();
  const [theme, setTheme] = useTheme();
  const fileInputRef = useRef(null);
  const [importMessage, setImportMessage] = useState('');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-forecast-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importData(JSON.parse(text));
      setImportMessage('Backup restored.');
    } catch (err) {
      setImportMessage(`Could not import: ${err.message}`);
    }
    e.target.value = '';
  };

  return (
    <>
      <div className="card">
        <h2>Regional data (EIA)</h2>
        <p className="card-note">
          Free official U.S. EIA weekly Utah retail gasoline price data, used for the seasonal trend chart.
          Register a free key at{' '}
          <a href="https://www.eia.gov/opendata/register.php" target="_blank" rel="noreferrer">eia.gov/opendata/register.php</a> — instant, no cost.
        </p>
        <div className="form-grid">
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            EIA API key
            <input
              type="text"
              value={settings.eiaApiKey}
              onChange={(e) => setSettings({ eiaApiKey: e.target.value.trim() })}
              placeholder="paste your key here"
            />
          </label>
        </div>
        <div style={{ marginTop: 10 }}>
          {eia.status === 'idle' && <span className="badge">No key set — using general seasonal pattern</span>}
          {eia.status === 'loading' && <span className="badge">Checking EIA…</span>}
          {eia.status === 'ready' && <span className="badge source-eia">Connected — {eia.points.length} weeks of data{eia.fromCache ? ' (cached)' : ''}</span>}
          {eia.status === 'error' && (
            <div className="error-banner" style={{ marginTop: 8 }}>
              <strong>EIA request failed:</strong> {eia.error}
              <div className="small" style={{ marginTop: 6 }}>
                This app couldn't be tested against api.eia.gov from its build environment (network policy blocked
                it there), so if this is a region-code issue, check the exact area/product codes at{' '}
                <a href="https://www.eia.gov/opendata/browser/petroleum/pri/gnd" target="_blank" rel="noreferrer">
                  the EIA data browser
                </a>{' '}
                and let me know what it should be. Everything else in the app works fine without this — it just
                falls back to the general seasonal pattern.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Home &amp; cities</h2>
        <div className="form-grid">
          <label className="field">
            Home city
            <select value={settings.homeCityId} onChange={(e) => setSettings({ homeCityId: e.target.value })}>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        {customCities.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p className="small muted">Cities you've added:</p>
            {customCities.map((c) => (
              <span key={c.id} className="badge" style={{ marginRight: 6 }}>
                {c.name}
                <button className="btn danger" style={{ padding: '0 4px', marginLeft: 4, border: 'none' }} onClick={() => removeCustomCity(c.id)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Vehicle</h2>
        <div className="form-grid">
          <label className="field">
            Name
            <input value={settings.vehicle.name} onChange={(e) => setSettings((s) => ({ ...s, vehicle: { ...s.vehicle, name: e.target.value } }))} />
          </label>
          <label className="field">
            Combined MPG
            <input type="number" step="0.1" value={settings.vehicle.mpgCombined} onChange={(e) => setSettings((s) => ({ ...s, vehicle: { ...s.vehicle, mpgCombined: Number(e.target.value) } }))} />
          </label>
          <label className="field">
            Tank size (gallons)
            <input type="number" step="0.1" value={settings.vehicle.tankGallons} onChange={(e) => setSettings((s) => ({ ...s, vehicle: { ...s.vehicle, tankGallons: Number(e.target.value) } }))} />
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Loyalty programs you carry</h2>
        <p className="card-note">Used to auto-suggest the discount when you log a fill-up.</p>
        {[
          ['maverik', 'Maverik Adventure Club card (2¢/gal)'],
          ['chevronTechron', 'Chevron Techron Advantage'],
          ['costco', 'Costco membership'],
          ['samsClub', "Sam's Club membership"],
          ['smithsFuelPoints', "Smith's Fuel Points"],
        ].map(([key, label]) => (
          <label className="field checkbox-field" key={key} style={{ marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.loyalty[key]}
              onChange={(e) => setSettings((s) => ({ ...s, loyalty: { ...s.loyalty, [key]: e.target.checked } }))}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="card">
        <h2>Appearance</h2>
        <div className="form-grid">
          <label className="field">
            Theme
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="system">Match device</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Backup &amp; restore</h2>
        <p className="card-note">
          Everything lives only in this browser's local storage — nothing is sent anywhere. Export a backup before
          clearing browser data or switching devices.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleExport}>Export backup (.json)</button>
          <button className="btn" onClick={() => fileInputRef.current?.click()}>Import backup</button>
          <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
        {importMessage && <p className="small muted" style={{ marginTop: 8 }}>{importMessage}</p>}
      </div>
    </>
  );
}
