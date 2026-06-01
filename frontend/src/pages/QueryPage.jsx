import { Search } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import IdBadge from "../components/IdBadge";

const ENTITY_OPTIONS = [
  {
    value: "product",
    label: "Product",
    idLabel: "Product ID",
    placeholder: "Enter product ID (e.g. 1)",
    hint: "Each product receives an auto-generated numeric ID when created.",
  },
  {
    value: "customer",
    label: "Customer",
    idLabel: "Customer ID",
    placeholder: "Enter customer ID (e.g. 1)",
    hint: "Each customer receives an auto-generated numeric ID when created.",
  },
  {
    value: "order",
    label: "Order",
    idLabel: "Order ID",
    placeholder: "Enter order ID (e.g. 1)",
    hint: "Each order receives an auto-generated numeric ID when placed.",
  },
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
      <DetailRow label="Product ID" value={data.id} />
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
      <DetailRow label="Customer ID" value={data.id} />
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
        <DetailRow label="Order ID" value={data.id} />
        <DetailRow label="Customer ID" value={data.customer_id} />
        <DetailRow label="Customer" value={data.customer_name} />
        <DetailRow label="Total" value={`$${Number(data.total_amount).toFixed(2)}`} />
        <DetailRow label="Placed" value={new Date(data.created_at).toLocaleString()} />
      </div>
      {data.items?.length > 0 && (
        <div className="table-wrap query-items-table">
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Line</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <IdBadge label="ID" id={item.product_id} />
                  </td>
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

  const selected = ENTITY_OPTIONS.find((o) => o.value === entity) || ENTITY_OPTIONS[0];

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const id = parseInt(recordId, 10);
    if (!recordId.trim() || isNaN(id) || id <= 0) {
      setError(`Enter a valid ${selected.idLabel}`);
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
    <div className="page">
      <header className="page-header">
        <h1>Query</h1>
        <p>Look up records by auto-generated Product ID, Customer ID, or Order ID</p>
      </header>

      <div className="card query-card">
        <form onSubmit={handleSearch} className="query-form">
          <div className="query-form-row">
            <div className="form-row">
              <label htmlFor="entity">Record type</label>
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
              <label htmlFor="record-id">{selected.idLabel}</label>
              <input
                id="record-id"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder={selected.placeholder}
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
              />
              <span className="field-hint">{selected.hint}</span>
            </div>
            <button type="submit" className="btn btn-primary btn-query" disabled={searching}>
              <Search size={18} />
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
          {error && <p className="form-error query-error">{error}</p>}
        </form>
      </div>

      {result && (
        <div className="card query-result-card">
          <div className="query-result-header">
            <IdBadge
              label={
                result.entity === "product"
                  ? "Product ID"
                  : result.entity === "customer"
                    ? "Customer ID"
                    : "Order ID"
              }
              id={result.id}
            />
            <span className="entity-pill">{result.entity}</span>
          </div>
          {result.entity === "product" && <ProductResult data={result.data} />}
          {result.entity === "customer" && <CustomerResult data={result.data} />}
          {result.entity === "order" && <OrderResult data={result.data} />}
        </div>
      )}
    </div>
  );
}
