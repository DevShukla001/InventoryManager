import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ApiBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => setOffline(!r.ok))
      .catch(() => setOffline(true));
  }, []);

  if (!offline) return null;

  return (
    <div className="api-banner" role="alert">
      Cannot reach the API at <strong>{API_BASE}</strong>. Lists and forms will not save until the
      backend is running and <code>VITE_API_URL</code> is set correctly.
    </div>
  );
}
