import { useMemo, useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { computeDetour, effectivePriceForProgram } from '../lib/analysis';
import { LOYALTY_PROGRAMS } from '../data/loyaltyPrograms';
import { formatMoney, formatPricePerGallon } from '../lib/format';

export default function ToolsTab() {
  const { settings } = useAppState();
  const [detourInputs, setDetourInputs] = useState({
    basePricePerGal: '',
    altPricePerGal: '',
    extraRoundTripMiles: '',
    mpg: settings.vehicle.mpgCombined,
    gallonsToBuy: settings.vehicle.tankGallons,
  });

  const detour = useMemo(() => computeDetour({
    basePricePerGal: Number(detourInputs.basePricePerGal) || 0,
    altPricePerGal: Number(detourInputs.altPricePerGal) || 0,
    extraRoundTripMiles: Number(detourInputs.extraRoundTripMiles) || 0,
    mpg: Number(detourInputs.mpg) || 0,
    gallonsToBuy: Number(detourInputs.gallonsToBuy) || 0,
  }), [detourInputs]);

  const detourReady = detourInputs.basePricePerGal && detourInputs.altPricePerGal;

  const [loyaltyInputs, setLoyaltyInputs] = useState(
    Object.fromEntries(LOYALTY_PROGRAMS.map((p) => [p.id, { postedPrice: '', annualGallons: 600 }]))
  );

  return (
    <>
      <div className="card">
        <h2>Detour cost calculator</h2>
        <p className="card-note">
          Is driving further for a cheaper station actually worth it, after burning gas to get there?
        </p>
        <div className="form-grid">
          <label className="field">
            Price at closer station ($/gal)
            <input type="number" step="0.001" value={detourInputs.basePricePerGal} onChange={(e) => setDetourInputs({ ...detourInputs, basePricePerGal: e.target.value })} />
          </label>
          <label className="field">
            Price at cheaper/farther station ($/gal)
            <input type="number" step="0.001" value={detourInputs.altPricePerGal} onChange={(e) => setDetourInputs({ ...detourInputs, altPricePerGal: e.target.value })} />
          </label>
          <label className="field">
            Extra round-trip miles
            <input type="number" step="0.1" value={detourInputs.extraRoundTripMiles} onChange={(e) => setDetourInputs({ ...detourInputs, extraRoundTripMiles: e.target.value })} />
          </label>
          <label className="field">
            Your car's MPG
            <input type="number" step="0.1" value={detourInputs.mpg} onChange={(e) => setDetourInputs({ ...detourInputs, mpg: e.target.value })} />
          </label>
          <label className="field">
            Gallons you'll buy
            <input type="number" step="0.1" value={detourInputs.gallonsToBuy} onChange={(e) => setDetourInputs({ ...detourInputs, gallonsToBuy: e.target.value })} />
          </label>
        </div>
        {detourReady && (
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="stat-tile">
              <p className="label">Gross savings</p>
              <p className="value">{formatMoney(detour.grossSavings)}</p>
            </div>
            <div className="stat-tile">
              <p className="label">Detour fuel cost</p>
              <p className="value">{formatMoney(detour.detourFuelCost)}</p>
            </div>
            <div className="stat-tile">
              <p className="label">Net savings</p>
              <p className={`value ${detour.worthIt ? 'good' : ''}`}>{formatMoney(detour.netSavings)}</p>
              <p className="sub">{detour.worthIt ? 'Worth the drive' : 'Not worth the drive'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Loyalty &amp; membership comparison</h2>
        <p className="card-note">
          Enter what each brand is posting near you to see the real out-the-door price, including your Maverik
          card and any memberships you're weighing.
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Program</th><th>Posted price</th><th>Annual gal.</th><th>Effective price</th><th>Annual net</th></tr>
            </thead>
            <tbody>
              {LOYALTY_PROGRAMS.map((program) => {
                const input = loyaltyInputs[program.id];
                const posted = Number(input.postedPrice) || null;
                const result = posted != null
                  ? effectivePriceForProgram(program, posted, { annualGallons: Number(input.annualGallons) || 0 })
                  : null;
                return (
                  <tr key={program.id}>
                    <td>{program.label}<div className="small muted">{program.note}</div></td>
                    <td>
                      <input
                        type="number" step="0.001" style={{ width: 90 }}
                        value={input.postedPrice}
                        onChange={(e) => setLoyaltyInputs({ ...loyaltyInputs, [program.id]: { ...input, postedPrice: e.target.value } })}
                      />
                    </td>
                    <td>
                      <input
                        type="number" step="10" style={{ width: 80 }}
                        value={input.annualGallons}
                        onChange={(e) => setLoyaltyInputs({ ...loyaltyInputs, [program.id]: { ...input, annualGallons: e.target.value } })}
                      />
                    </td>
                    <td className="num">{result ? formatPricePerGallon(result.effectivePrice) : '—'}</td>
                    <td className="num">
                      {result?.annualNet != null ? (
                        <span className={result.annualNet >= 0 ? 'rank-1' : ''}>{formatMoney(result.annualNet)}</span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>
          "Annual net" for membership programs (Costco, Sam's Club) is your estimated yearly gas savings from the
          price gap minus the membership fee — negative means the membership doesn't pay for itself at that gallon volume.
        </p>
      </div>
    </>
  );
}
