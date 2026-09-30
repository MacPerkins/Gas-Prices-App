import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card" style={{ margin: 0, padding: '8px 12px' }}>
      <strong>{d.label}</strong>
      <div className="small muted">${d.value.toFixed(3)}/gal avg</div>
      <div className="small muted">{d.count} fill-up{d.count === 1 ? '' : 's'} logged</div>
    </div>
  );
}

export default function StationBarChart({ data }) {
  const height = Math.max(160, data.length * 36 + 40);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }} barCategoryGap="24%">
        <CartesianGrid horizontal={false} stroke="var(--gridline)" />
        <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--baseline)' }} tickLine={false} domain={['auto', 'auto']} />
        <YAxis type="category" dataKey="label" width={150} tick={{ fill: 'var(--text-primary)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-3)' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="var(--series-1)" maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
