import { useMemo, useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { getBrand } from '../data/stations';
import { computeStationStats } from '../lib/analysis';
import { formatPricePerGallon, formatShortDate } from '../lib/format';
import StationBarChart from '../components/charts/StationBarChart.jsx';

export default function StationsTab({ city }) {
  const { stations, fillups, stationLookup, addCustomStation, removeCustomStation } = useAppState();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', brand: 'maverik', address: '', hours: '' });

  const cityStations = useMemo(() => stations.filter((s) => s.cityId === city?.id), [stations, city]);
  const cityFillups = useMemo(() => fillups.filter((f) => f.cityId === city?.id), [fillups, city]);
  const stats = useMemo(() => computeStationStats(cityFillups, stationLookup), [cityFillups, stationLookup]);
  const statsByStationId = useMemo(() => new Map(stats.map((s) => [s.station?.id, s])), [stats]);

  const chartData = stats
    .filter((s) => s.avg != null)
    .map((s) => ({ label: s.label, value: s.avg, count: s.count }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !city) return;
    addCustomStation({ ...form, cityId: city.id });
    setForm({ name: '', brand: 'maverik', address: '', hours: '' });
    setShowAddForm(false);
  };

  return (
    <>
      {city?.note && <div className="hint-banner">{city.note}</div>}

      {chartData.length > 0 && (
        <div className="card">
          <h2>Your average price by station — {city?.name}</h2>
          <p className="card-note">From fill-ups you've logged at this city's stations. Lower is better.</p>
          <StationBarChart data={chartData} />
        </div>
      )}

      <div className="card">
        <h2>Station directory — {city?.name}</h2>
        <p className="card-note">
          Addresses are seeded from public listings; prices are never scraped — every $ figure below comes
          from your own logged fill-ups.
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Station</th><th>Brand</th><th>Address</th><th>Your avg</th><th>Logs</th><th>Discount</th>
              </tr>
            </thead>
            <tbody>
              {cityStations.map((s) => {
                const brand = getBrand(s.brand);
                const stat = statsByStationId.get(s.id);
                const isCustom = s.id.startsWith('station-');
                return (
                  <tr key={s.id}>
                    <td>{s.name}{s.hours ? <span className="small muted"> · {s.hours}</span> : ''}</td>
                    <td>{brand.label}</td>
                    <td className="small">{s.address || '—'}</td>
                    <td className="num">{stat?.avg != null ? formatPricePerGallon(stat.avg) : '—'}</td>
                    <td className="num">{stat?.count || 0}</td>
                    <td className="small">
                      {brand.maverikDiscountPerGallon ? `Maverik card: −${(brand.maverikDiscountPerGallon * 100).toFixed(0)}¢/gal` : brand.membershipRequired ? 'Membership required' : brand.loyaltyProgram || '—'}
                      {isCustom && (
                        <button className="btn danger" style={{ marginLeft: 6, padding: '2px 6px' }} onClick={() => removeCustomStation(s.id)}>
                          remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {cityStations.length === 0 && (
                <tr><td colSpan={6} className="muted small">No stations yet for {city?.name}. Add one below.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {!showAddForm ? (
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setShowAddForm(true)}>+ Add a station</button>
        ) : (
          <form onSubmit={submit} className="form-grid" style={{ marginTop: 12 }}>
            <label className="field">
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="field">
              Brand
              <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
                <option value="maverik">Maverik</option>
                <option value="costco">Costco</option>
                <option value="chevron">Chevron</option>
                <option value="sinclair">Sinclair</option>
                <option value="smiths">Smith's Fuel Center</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="field">
              Address
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label className="field">
              Hours (optional)
              <input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="e.g. 24 hours" />
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button className="btn primary" type="submit">Save station</button>
              <button className="btn" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {stats.some((s) => s.last) && (
        <div className="card">
          <h2>Last price seen per station</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Station</th><th>Last price</th><th>Date</th></tr></thead>
              <tbody>
                {stats.filter((s) => s.last).map((s) => (
                  <tr key={s.key}>
                    <td>{s.label}</td>
                    <td className="num">{formatPricePerGallon(s.last.price)}</td>
                    <td>{formatShortDate(s.last.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
