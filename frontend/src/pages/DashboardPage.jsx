import { useEffect, useState } from "react";
import { api } from "../api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div>
        <header className="page-header">
          <h1 className="cosmic-title">Mission Control</h1>
          <p>Loading summary…</p>
        </header>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="cosmic-title">Mission Control</h1>
        <p>Overview of your inventory and orders</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Products</div>
          <div className="value">{stats.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Customers</div>
          <div className="value">{stats.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{stats.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Low Stock Items</div>
          <div className="value">{stats.low_stock_products.length}</div>
        </div>
      </div>

      <div className="card card-glow">
        <h3 style={{ marginTop: 0 }}>Low Stock Products</h3>
        {stats.low_stock_products.length === 0 ? (
          <p className="empty-state" style={{ padding: "1rem 0" }}>
            All products are adequately stocked.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className="badge badge-warning">{p.quantity_in_stock}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
