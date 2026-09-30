import { useState } from 'react';
import { useAppState } from '../state/AppState.jsx';

export default function CitySelector() {
  const { cities, currentCityId, setCurrentCityId, addCustomCity } = useAppState();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const handleChange = (e) => {
    if (e.target.value === '__add__') {
      setAdding(true);
      return;
    }
    setCurrentCityId(e.target.value);
  };

  const submitNewCity = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = addCustomCity({ name: trimmed, state: 'UT' });
    setCurrentCityId(id);
    setName('');
    setAdding(false);
  };

  if (adding) {
    return (
      <form className="city-picker" onSubmit={submitNewCity} style={{ display: 'flex', gap: 6 }}>
        <input
          autoFocus
          placeholder="City name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: 140 }}
        />
        <button className="btn primary" type="submit">Add</button>
        <button className="btn" type="button" onClick={() => setAdding(false)}>Cancel</button>
      </form>
    );
  }

  return (
    <div className="city-picker">
      <select value={currentCityId} onChange={handleChange} aria-label="Viewing city">
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}{c.isHome ? ' (home)' : ''}
          </option>
        ))}
        <option value="__add__">+ Add a city…</option>
      </select>
    </div>
  );
}
