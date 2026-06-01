import { Menu, Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navItems } from "../config/navigation";

export default function Layout({ children, toast }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <button
          type="button"
          className="icon-btn menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="mobile-brand">
          <Package size={20} className="brand-icon" />
          <span>InventoryOS</span>
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Package size={22} strokeWidth={2.25} />
          </div>
          <div>
            <span className="brand-name">InventoryOS</span>
            <span className="brand-tagline">Order Management</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">{children}</main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "bottom-nav-link active" : "bottom-nav-link")}
            >
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.message}
        </div>
      )}
    </div>
  );
}
