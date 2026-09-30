import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isIndexOnly = d.source === 'reference-index-only';
  return (
    <div className="card" style={{ margin: 0, padding: '8px 12px' }}>
      <strong>{d.label}</strong>
      <div className="small muted">
        {isIndexOnly ? `Index ${d.value.toFixed(3)} (relative)` : `$${d.value.toFixed(3)}/gal`}
      </div>
      <div className="small muted">
        {d.source === 'eia' ? 'Official EIA regional average' : d.source === 'personal' ? `${d.count} of your fill-ups` : 'General seasonal pattern'}
      </div>
    </div>
  );
}

export default function SeasonalChart({ data }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--baseline)' }} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={44} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--series-1)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--series-1)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="legend-row">
        <span><span className="dot" style={{ background: 'var(--series-1)' }} />Monthly average (EIA where available, else your logs, else general pattern)</span>
      </div>
    </div>
  );
}
