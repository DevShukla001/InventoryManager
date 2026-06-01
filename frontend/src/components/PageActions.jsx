export default function PageActions({ count, countLabel, primaryLabel, onPrimary }) {
  return (
    <div className="page-actions-bar">
      <span className="page-actions-count">
        {count} {countLabel}
      </span>
      <button type="button" className="btn btn-primary btn-action-main" onClick={onPrimary}>
        {primaryLabel}
      </button>
    </div>
  );
}
