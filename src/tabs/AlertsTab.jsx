import { useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { formatShortDate } from '../lib/format';

const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;

export default function AlertsTab() {
  const { alerts, addAlert, updateAlert, deleteAlert, alertHistory, stations, settings, setSettings } = useAppState();
  const [form, setForm] = useState({ label: '', stationId: '', thresholdPrice: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.thresholdPrice) return;
    addAlert({
      label: form.label.trim(),
      stationId: form.stationId || null,
      thresholdPrice: Number(form.thresholdPrice),
    });
    setForm({ label: '', stationId: '', thresholdPrice: '' });
  };

  const enableNotifications = async () => {
    if (!notificationsSupported) return;
    const perm = await Notification.requestPermission();
    setSettings({ notificationsEnabled: perm === 'granted' });
  };

  return (
    <>
      <div className="card">
        <h2>Price-drop alerts</h2>
        <p className="card-note">
          There's no live price feed (see Settings for why), so alerts check the price <em>you log</em> against your
          threshold — a quick "yes, that was a good one" confirmation, and a running list of your best buys.
        </p>

        {notificationsSupported && !settings.notificationsEnabled && (
          <button className="btn" onClick={enableNotifications}>Enable browser notifications</button>
        )}
        {settings.notificationsEnabled && <span className="badge source-personal">Notifications on</span>}

        <form onSubmit={submit} className="form-grid" style={{ marginTop: 14 }}>
          <label className="field">
            Alert name
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Maverik AF under $3" required />
          </label>
          <label className="field">
            Station (optional)
            <select value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })}>
              <option value="">Any station</option>
              {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="field">
            Alert me at or below ($/gal)
            <input type="number" step="0.001" value={form.thresholdPrice} onChange={(e) => setForm({ ...form, thresholdPrice: e.target.value })} required />
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn primary" type="submit">Add alert</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Your alerts</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Station</th><th>Threshold</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {alerts.map((a) => {
                const station = stations.find((s) => s.id === a.stationId);
                return (
                  <tr key={a.id}>
                    <td>{a.label}</td>
                    <td>{station?.name || 'Any'}</td>
                    <td className="num">${Number(a.thresholdPrice).toFixed(3)}</td>
                    <td>
                      <input type="checkbox" checked={a.active} onChange={(e) => updateAlert(a.id, { active: e.target.checked })} />
                    </td>
                    <td><button className="btn danger" style={{ padding: '2px 8px' }} onClick={() => deleteAlert(a.id)}>delete</button></td>
                  </tr>
                );
              })}
              {alerts.length === 0 && <tr><td colSpan={5} className="muted small">No alerts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Triggered history</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Alert</th><th>Price logged</th><th>Threshold</th></tr></thead>
            <tbody>
              {alertHistory.map((h) => (
                <tr key={h.id}>
                  <td>{formatShortDate(h.date)}</td>
                  <td>{h.alertLabel}</td>
                  <td className="num rank-1">${h.price.toFixed(3)}</td>
                  <td className="num">${h.threshold.toFixed(3)}</td>
                </tr>
              ))}
              {alertHistory.length === 0 && <tr><td colSpan={4} className="muted small">Nothing yet — log a fill-up at or below one of your thresholds to see it here.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
