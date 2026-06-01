export default function IdBadge({ label, id }) {
  return (
    <span className="id-badge" title={label}>
      <span className="id-badge-label">{label}</span>
      <span className="id-badge-value">{id}</span>
    </span>
  );
}
