import { useState } from "react";
import { api } from "../api";

const ENTITY_OPTIONS = [
  { value: "product", label: "Product" },
  { value: "customer", label: "Customer" },
  { value: "order", label: "Order" },
];

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function ProductResult({ data }) {
  return (
    <div className="query-result-grid">
      <DetailRow label="ID" value={data.id} />
      <DetailRow label="Name" value={data.name} />
      <DetailRow label="SKU" value={data.sku} />
      <DetailRow label="Price" value={`$${Number(data.price).toFixed(2)}`} />
      <DetailRow label="Stock" value={data.quantity_in_stock} />
    </div>
  );
}

function CustomerResult({ data }) {
  return (
    <div className="query-result-grid">
      <DetailRow label="ID" value={data.id} />
      <DetailRow label="Full Name" value={data.full_name} />
      <DetailRow label="Email" value={data.email} />
      <DetailRow label="Phone" value={data.phone_number} />
    </div>
  );
}

function OrderResult({ data }) {
  return (
    <>
      <div className="query-result-grid">
        <DetailRow label="Order ID" value={`#${data.id}`} />
        <DetailRow label="Customer" value={data.customer_name} />
        <DetailRow label="Customer ID" value={data.customer_id} />
        <DetailRow label="Total" value={`$${Number(data.total_amount).toFixed(2)}`} />
        <DetailRow label="Placed" value={new Date(data.created_at).toLocaleString()} />
      </div>
      {data.items?.length > 0 && (
        <div className="table-wrap" style={{ marginTop: "1rem" }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Line</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(item.unit_price).toFixed(2)}</td>
                  <td>${Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function QueryPage() {
  const [entity, setEntity] = useState("product");
  const [recordId, setRecordId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const id = parseInt(recordId, 10);
    if (!recordId.trim() || isNaN(id) || id <= 0) {
      setError("Enter a valid numeric ID greater than 0");
      return;
    }

    setSearching(true);
    try {
      const data = await api.queryById(entity, id);
      setResult(data);
    } catch (err) {
      setError(err.message || "Record not found");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="cosmic-title">Stellar Query</h1>
        <p>Look up any product, customer, or order by ID across the cosmos</p>
      </header>

      <div className="card card-glow query-card">
        <form onSubmit={handleSearch} className="query-form">
          <div className="query-form-row">
            <div className="form-row">
              <label htmlFor="entity">Entity type</label>
              <select
                id="entity"
                value={entity}
                onChange={(e) => {
                  setEntity(e.target.value);
                  setResult(null);
                  setError("");
                }}
              >
                {ENTITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="record-id">Record ID</label>
              <input
                id="record-id"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="e.g. 42"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-query" disabled={searching}>
              {searching ? "Scanning…" : "Query"}
            </button>
          </div>
          {error && <p className="form-error query-error">{error}</p>}
        </form>
      </div>

      {result && (
        <div className="card card-glow query-result-card">
          <div className="query-result-header">
            <span className="entity-badge">{result.entity}</span>
            <h2>ID {result.id}</h2>
          </div>
          {result.entity === "product" && <ProductResult data={result.data} />}
          {result.entity === "customer" && <CustomerResult data={result.data} />}
          {result.entity === "order" && <OrderResult data={result.data} />}
        </div>
      )}

      <div className="card query-hints">
        <h3>API quick reference</h3>
        <ul className="hint-list">
          <li>
            <code>GET /query?entity=product&amp;id=1</code>
          </li>
          <li>
            <code>GET /products?id=1</code>
          </li>
          <li>
            <code>GET /customers?id=1</code>
          </li>
          <li>
            <code>GET /orders?id=1</code>
          </li>
        </ul>
      </div>
    </div>
  );
}
