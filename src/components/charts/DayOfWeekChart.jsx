import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const SOURCE_COLOR = {
  personal: 'var(--series-3)',
  blended: 'var(--series-4)',
  reference: 'var(--text-muted)',
  'reference-index-only': 'var(--text-muted)',
};

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
      <div className="small muted">{d.count} logged fill-up{d.count === 1 ? '' : 's'}</div>
    </div>
  );
}

export default function DayOfWeekChart({ data }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--baseline)' }} tickLine={false} />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-3)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry) => (
              <Cell key={entry.day} fill={SOURCE_COLOR[entry.source] || 'var(--series-1)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="legend-row">
        <span><span className="dot" style={{ background: 'var(--series-3)' }} />Your data (3+ logs)</span>
        <span><span className="dot" style={{ background: 'var(--series-4)' }} />Blended (1–2 logs)</span>
        <span><span className="dot" style={{ background: 'var(--text-muted)' }} />General pattern (no logs yet)</span>
      </div>
    </div>
  );
}
