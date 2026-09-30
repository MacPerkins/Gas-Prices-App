import { useMemo } from 'react';
import { useAppState } from '../state/AppState.jsx';
import StatTile from '../components/StatTile.jsx';
import SourceBadge from '../components/SourceBadge.jsx';
import {
  computeDayOfWeekAnalysis, bestDayFromAnalysis, worstDayFromAnalysis,
  computeStationStats, computeSpendStats,
} from '../lib/analysis';
import { formatMoney, formatPricePerGallon } from '../lib/format';

export default function OverviewTab({ city, goTo }) {
  const { fillups, stationLookup, eia, settings } = useAppState();

  const latestEiaPrice = eia.points.length ? eia.points[eia.points.length - 1].price : null;
  const dayAnalysis = useMemo(() => computeDayOfWeekAnalysis(fillups, latestEiaPrice), [fillups, latestEiaPrice]);
  const bestDay = bestDayFromAnalysis(dayAnalysis);
  const worstDay = worstDayFromAnalysis(dayAnalysis);
  const spend = useMemo(() => computeSpendStats(fillups), [fillups]);

  const cityFillups = useMemo(() => fillups.filter((f) => f.cityId === city?.id), [fillups, city]);
  const stationStats = useMemo(() => computeStationStats(cityFillups, stationLookup), [cityFillups, stationLookup]);
  const bestStation = stationStats[0] || null;

  const hasEnoughForConfidence = fillups.length >= 6;
  const potentialSavingsPerFill = bestDay && worstDay ? (worstDay.value - bestDay.value) : null;

  return (
    <>
      {!settings.eiaApiKey && (
        <div className="hint-banner">
          Add a free EIA API key in <button className="btn" style={{ padding: '2px 8px' }} onClick={() => goTo('settings')}>Settings</button> to
          layer official Utah seasonal trend data on top of your own fill-ups.
        </div>
      )}
      {eia.status === 'error' && (
        <div className="error-banner">EIA data unavailable: {eia.error}</div>
      )}

      <div className="card">
        <h2>Best day to fill up</h2>
        <p className="card-note">
          {hasEnoughForConfidence
            ? 'Based on your own logged fill-ups, blended with general market patterns where you have gaps.'
            : 'Mostly general market pattern for now — log a few more fill-ups on different days to personalize this.'}
        </p>
        <div className="grid">
          <StatTile
            label="Cheapest, historically"
            value={bestDay ? bestDay.label : '—'}
            sub={bestDay ? <SourceBadge source={bestDay.source} /> : null}
            good
          />
          <StatTile
            label="Priciest, historically"
            value={worstDay ? worstDay.label : '—'}
            sub={worstDay ? <SourceBadge source={worstDay.source} /> : null}
          />
          <StatTile
            label="Potential swing"
            value={potentialSavingsPerFill != null && potentialSavingsPerFill > 0.0005 ? `${(potentialSavingsPerFill * 100).toFixed(1)}¢/gal` : '< 1¢/gal'}
            sub="Best day vs. worst day"
          />
        </div>
        <p className="small muted" style={{ marginTop: 10 }}>
          Note: retail gas prices are typically set once a day (sometimes once every day or two) rather than
          changing hour to hour — so which <em>day</em> you buy matters far more than what time of day. Fill up
          in the morning purely out of convenience, not because morning prices run lower.
        </p>
      </div>

      <div className="card">
        <h2>Best bet in {city?.name || 'your city'}</h2>
        {bestStation ? (
          <>
            <div className="grid">
              <StatTile label="Station" value={bestStation.label} sub={bestStation.station?.address} good />
              <StatTile label="Your avg price there" value={formatPricePerGallon(bestStation.avg)} />
              <StatTile label="Fill-ups logged" value={bestStation.count} />
            </div>
          </>
        ) : (
          <p className="muted small">
            No fill-ups logged in {city?.name} yet. Head to the <button className="btn" style={{ padding: '2px 8px' }} onClick={() => goTo('log')}>Log</button> tab
            after your next fill-up — the more you log, the sharper this gets.
          </p>
        )}
      </div>

      <div className="card">
        <h2>Your spending</h2>
        <div className="grid">
          <StatTile label="Total logged" value={formatMoney(spend.totalSpent)} sub={`${spend.totalGallons.toFixed(1)} gal across ${spend.count} fill-ups`} />
          <StatTile label="Last 30 days" value={formatMoney(spend.last30DaysSpent)} />
          <StatTile label="Your avg price paid" value={spend.avgPrice != null ? formatPricePerGallon(spend.avgPrice) : '—'} />
          <StatTile label="Estimated MPG" value={spend.estimatedMpg != null ? spend.estimatedMpg.toFixed(1) : '—'} sub="From odometer readings you've logged" />
        </div>
      </div>
    </>
  );
}
