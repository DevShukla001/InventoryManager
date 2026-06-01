import { AlertTriangle, Package, ShoppingCart, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import IdBadge from "../components/IdBadge";

const statConfig = [
  { key: "total_products", label: "Products", icon: Package },
  { key: "total_customers", label: "Customers", icon: Users },
  { key: "total_orders", label: "Orders", icon: ShoppingCart },
  { key: "low_stock", label: "Low stock", icon: AlertTriangle },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Dashboard</h1>
          <p>Loading summary…</p>
        </header>
      </div>
    );
  }

  const statValues = {
    total_products: stats.total_products,
    total_customers: stats.total_customers,
    total_orders: stats.total_orders,
    low_stock: stats.low_stock_products.length,
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of inventory, customers, and orders</p>
      </header>

      <div className="stats-grid">
        {statConfig.map(({ key, label, icon: Icon }) => (
          <div key={key} className="stat-card">
            <div className="stat-card-icon">
              <Icon size={22} strokeWidth={2} />
            </div>
            <div className="stat-card-body">
              <div className="label">{label}</div>
              <div className="value">{statValues[key]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">Low stock products</h3>
        {stats.low_stock_products.length === 0 ? (
          <p className="empty-state">All products are adequately stocked.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <IdBadge label="ID" id={p.id} />
                    </td>
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
