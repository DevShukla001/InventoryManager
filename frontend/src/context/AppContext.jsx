import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "../api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const run = useCallback(
    async (fn, successMessage) => {
      setLoading(true);
      try {
        const result = await fn();
        if (successMessage) showToast(successMessage, "success");
        return result;
      } catch (err) {
        showToast(err.message || "Something went wrong", "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const value = useMemo(
    () => ({ api, loading, toast, showToast, run }),
    [loading, toast, showToast, run]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
