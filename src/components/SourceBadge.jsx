const LABELS = {
  personal: 'Your data',
  blended: 'Blended (few logs)',
  reference: 'General pattern',
  'reference-index-only': 'General pattern',
  eia: 'EIA official',
};

export default function SourceBadge({ source }) {
  if (!source) return null;
  return <span className={`badge source-${source}`}>{LABELS[source] || source}</span>;
}
