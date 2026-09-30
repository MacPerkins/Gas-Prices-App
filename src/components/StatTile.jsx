export default function StatTile({ label, value, sub, good }) {
  return (
    <div className="stat-tile">
      <p className="label">{label}</p>
      <p className={`value${good ? ' good' : ''}`}>{value}</p>
      {sub ? <p className="sub">{sub}</p> : null}
    </div>
  );
}
