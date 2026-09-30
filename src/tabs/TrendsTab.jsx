import { useMemo } from 'react';
import { useAppState } from '../state/AppState.jsx';
import DayOfWeekChart from '../components/charts/DayOfWeekChart.jsx';
import SeasonalChart from '../components/charts/SeasonalChart.jsx';
import SourceBadge from '../components/SourceBadge.jsx';
import { computeDayOfWeekAnalysis, computeSeasonalAnalysis } from '../lib/analysis';
import { REFERENCE_SOURCE_NOTE } from '../data/referencePatterns';

export default function TrendsTab() {
  const { fillups, eia } = useAppState();

  const latestEiaPrice = eia.points.length ? eia.points[eia.points.length - 1].price : null;
  const dayAnalysis = useMemo(() => computeDayOfWeekAnalysis(fillups, latestEiaPrice), [fillups, latestEiaPrice]);
  const seasonalAnalysis = useMemo(() => computeSeasonalAnalysis(fillups, eia.points), [fillups, eia.points]);

  return (
    <>
      <div className="card">
        <h2>Price by day of the week</h2>
        <p className="card-note">Across all cities and stations you've logged. {REFERENCE_SOURCE_NOTE}</p>
        <DayOfWeekChart data={dayAnalysis} />
        <details style={{ marginTop: 10 }}>
          <summary className="small muted" style={{ cursor: 'pointer' }}>Table view</summary>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Day</th><th>Value</th><th>Source</th><th>Your logs</th></tr>
              </thead>
              <tbody>
                {dayAnalysis.map((d) => (
                  <tr key={d.day}>
                    <td>{d.label}</td>
                    <td className="num">{d.source === 'reference-index-only' ? d.value.toFixed(3) : `$${d.value.toFixed(3)}`}</td>
                    <td><SourceBadge source={d.source} /></td>
                    <td className="num">{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <div className="card">
        <h2>Seasonal trend by month</h2>
        <p className="card-note">
          Uses official EIA weekly Utah regular-gasoline averages where available, your own logs otherwise, and
          a general national seasonal pattern (driving-season summer-blend markup) as a last resort.
        </p>
        <SeasonalChart data={seasonalAnalysis} />
        <details style={{ marginTop: 10 }}>
          <summary className="small muted" style={{ cursor: 'pointer' }}>Table view</summary>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Month</th><th>Value</th><th>Source</th></tr>
              </thead>
              <tbody>
                {seasonalAnalysis.map((m) => (
                  <tr key={m.month}>
                    <td>{m.label}</td>
                    <td className="num">{m.source === 'reference-index-only' ? m.value.toFixed(3) : `$${m.value.toFixed(3)}`}</td>
                    <td><SourceBadge source={m.source} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </>
  );
}
