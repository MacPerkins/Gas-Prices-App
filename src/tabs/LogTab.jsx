import { useMemo, useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { getBrand } from '../data/stations';
import { effectivePrice, totalCost, computeSpendStats } from '../lib/analysis';
import { formatMoney, formatPricePerGallon, formatShortDate } from '../lib/format';
import StatTile from '../components/StatTile.jsx';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function suggestedDiscount(brand, loyalty) {
  if (brand === 'maverik' && loyalty.maverik) return 0.02;
  if (brand === 'chevron' && loyalty.chevronTechron) return 0.03;
  return 0;
}

const emptyForm = (cityId) => ({
  date: todayIso(),
  cityId,
  stationId: '',
  customStationLabel: '',
  postedPricePerGallon: '',
  discountPerGallon: 0,
  gallons: '',
  odometer: '',
  notes: '',
});

export default function LogTab({ city }) {
  const { fillups, addFillup, deleteFillup, stations, cities, settings, stationLookup } = useAppState();
  const [form, setForm] = useState(() => emptyForm(city?.id));
  const [cityForForm, setCityForForm] = useState(city?.id);

  const allStationsForForm = useMemo(() => stations.filter((s) => s.cityId === cityForForm), [stations, cityForForm]);

  const sortedFillups = useMemo(() => [...fillups].sort((a, b) => (a.date < b.date ? 1 : -1)), [fillups]);
  const spend = useMemo(() => computeSpendStats(fillups), [fillups]);

  const handleCityChange = (cityId) => {
    setCityForForm(cityId);
    setForm((f) => ({ ...f, cityId, stationId: '', customStationLabel: '' }));
  };

  const handleStationChange = (stationId) => {
    if (stationId === '__custom__') {
      setForm((f) => ({ ...f, stationId: '', customStationLabel: '' }));
      return;
    }
    const station = allStationsForForm.find((s) => s.id === stationId);
    const discount = station ? suggestedDiscount(station.brand, settings.loyalty) : 0;
    setForm((f) => ({ ...f, stationId, customStationLabel: '', discountPerGallon: discount }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.postedPricePerGallon || !form.gallons || !form.cityId) return;
    addFillup({
      date: form.date,
      cityId: form.cityId,
      stationId: form.stationId || null,
      customStationLabel: form.stationId ? null : (form.customStationLabel.trim() || null),
      postedPricePerGallon: Number(form.postedPricePerGallon),
      discountPerGallon: Number(form.discountPerGallon) || 0,
      gallons: Number(form.gallons),
      odometer: form.odometer ? Number(form.odometer) : null,
      notes: form.notes.trim() || null,
    });
    setForm(emptyForm(cityForForm));
  };

  return (
    <>
      <div className="card">
        <h2>Log a fill-up</h2>
        <p className="card-note">Takes 10 seconds. This is what powers every chart in the app — the more you log, the more personalized it gets.</p>
        <form onSubmit={submit} className="form-grid">
          <label className="field">
            Date
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </label>
          <label className="field">
            City
            <select value={cityForForm} onChange={(e) => handleCityChange(e.target.value)}>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="field">
            Station
            <select value={form.stationId || '__custom__'} onChange={(e) => handleStationChange(e.target.value)}>
              <option value="__custom__">Other / type name below</option>
              {allStationsForForm.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          {!form.stationId && (
            <label className="field">
              Station name
              <input
                value={form.customStationLabel}
                onChange={(e) => setForm({ ...form, customStationLabel: e.target.value })}
                placeholder="e.g. Costco Lehi"
              />
            </label>
          )}
          <label className="field">
            Posted price ($/gal)
            <input type="number" step="0.001" min="0" value={form.postedPricePerGallon} onChange={(e) => setForm({ ...form, postedPricePerGallon: e.target.value })} required />
          </label>
          <label className="field">
            Discount applied ($/gal)
            <input type="number" step="0.001" value={form.discountPerGallon} onChange={(e) => setForm({ ...form, discountPerGallon: e.target.value })} />
          </label>
          <label className="field">
            Gallons
            <input type="number" step="0.01" min="0" value={form.gallons} onChange={(e) => setForm({ ...form, gallons: e.target.value })} required />
          </label>
          <label className="field">
            Odometer (optional)
            <input type="number" step="1" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            Notes (optional)
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn primary" type="submit">Save fill-up</button>
          </div>
        </form>
      </div>

      <div className="grid" style={{ marginBottom: 16 }}>
        <StatTile label="Total logged" value={formatMoney(spend.totalSpent)} />
        <StatTile label="Your avg price paid" value={spend.avgPrice != null ? formatPricePerGallon(spend.avgPrice) : '—'} />
        <StatTile label="Estimated MPG" value={spend.estimatedMpg != null ? spend.estimatedMpg.toFixed(1) : '—'} />
      </div>

      <div className="card">
        <h2>History</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Station</th><th>Paid</th><th>Gallons</th><th>Total</th><th></th></tr>
            </thead>
            <tbody>
              {sortedFillups.map((f) => {
                const station = f.stationId ? stationLookup.get(f.stationId) : null;
                const label = station?.name || f.customStationLabel || 'Unknown';
                const brand = station ? getBrand(station.brand).label : '';
                return (
                  <tr key={f.id}>
                    <td>{formatShortDate(f.date)}</td>
                    <td>{label}{brand ? <span className="small muted"> · {brand}</span> : ''}</td>
                    <td className="num">{formatPricePerGallon(effectivePrice(f))}</td>
                    <td className="num">{Number(f.gallons).toFixed(2)}</td>
                    <td className="num">{formatMoney(totalCost(f))}</td>
                    <td><button className="btn danger" style={{ padding: '2px 8px' }} onClick={() => deleteFillup(f.id)}>delete</button></td>
                  </tr>
                );
              })}
              {sortedFillups.length === 0 && (
                <tr><td colSpan={6} className="muted small">No fill-ups logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
