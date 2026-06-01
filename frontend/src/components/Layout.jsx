import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApiBanner from "./ApiBanner";
import CosmicBackground from "./CosmicBackground";

const navItems = [
  { to: "/", label: "Dashboard", icon: "◈", end: true },
  { to: "/query", label: "Query", icon: "◎" },
  { to: "/products", label: "Products", icon: "▣" },
  { to: "/customers", label: "Customers", icon: "◉" },
  { to: "/orders", label: "Orders", icon: "⬡" },
];

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
      <CosmicBackground />

      <header className="mobile-header">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className="menu-bar" />
          <span className="menu-bar" />
          <span className="menu-bar" />
        </button>
        <span className="mobile-brand">InventoryOS</span>
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
          <span className="brand-glow">InventoryOS</span>
          <span className="brand-tagline">Cosmic Commerce</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <ApiBanner />
        {children}
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? "bottom-nav-link active" : "bottom-nav-link")}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.message}
        </div>
      )}
    </div>
  );
}
