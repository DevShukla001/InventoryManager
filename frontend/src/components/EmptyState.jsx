export default function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="empty-state empty-state-cta">
      <p>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
