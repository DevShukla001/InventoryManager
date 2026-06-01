import { useCallback, useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import PageActions from "../components/PageActions";
import { api } from "../api";
import { useApp } from "../context/AppContext";

const emptyLine = { product_id: "", quantity: "" };

export default function OrdersPage() {
  const { run, loading } = useApp();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [errors, setErrors] = useState({});

  const load = useCallback(() => {
    api.getOrders().then(setOrders).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    api.getCustomers().then(setCustomers).catch(() => {});
    api.getProducts().then(setProducts).catch(() => {});
  }, [load]);

  function addLine() {
    setLines([...lines, { ...emptyLine }]);
  }

  function removeLine(index) {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  function updateLine(index, field, value) {
    setLines(lines.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  }

  async function handleCreate(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!customerId) nextErrors.customer = "Select a customer";
    const items = [];
    lines.forEach((line, i) => {
      const pid = parseInt(line.product_id, 10);
      const qty = parseInt(line.quantity, 10);
      if (!line.product_id || isNaN(pid)) nextErrors[`line_${i}`] = "Select a product";
      else if (!line.quantity || isNaN(qty) || qty <= 0)
        nextErrors[`line_${i}`] = "Quantity must be at least 1";
      else items.push({ product_id: pid, quantity: qty });
    });
    if (items.length === 0) nextErrors.items = "Add at least one product";
    const productIds = items.map((x) => x.product_id);
    if (new Set(productIds).size !== productIds.length)
      nextErrors.items = "Duplicate products are not allowed in one order";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      await run(
        () => api.createOrder({ customer_id: parseInt(customerId, 10), items }),
        "Order created"
      );
      setCreateOpen(false);
      setCustomerId("");
      setLines([{ ...emptyLine }]);
      setErrors({});
      load();
      api.getProducts().then(setProducts).catch(() => {});
    } catch {
      /* toast handled */
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await run(() => api.deleteOrder(id), "Order cancelled");
      setDetailOrder(null);
      load();
      api.getProducts().then(setProducts).catch(() => {});
    } catch {
      /* toast handled */
    }
  }

  function openCreate() {
    setCreateOpen(true);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="cosmic-title">Orders</h1>
        <p>Create and track customer orders</p>
      </header>

      <PageActions
        count={orders.length}
        countLabel="order(s)"
        primaryLabel="+ Create Order"
        onPrimary={openCreate}
      />

      <button type="button" className="fab" onClick={openCreate} aria-label="Create order">
        +
      </button>

      <div className="card card-glow">
        {orders.length === 0 ? (
          <EmptyState
            message="No orders yet. Add products and customers first, then create an order."
            actionLabel="Create order"
            onAction={openCreate}
          />
        ) : (
          <>
            <div className="mobile-list">
              {orders.map((o) => (
                <article key={o.id} className="list-card">
                  <div className="list-card-head">
                    <strong>Order #{o.id}</strong>
                    <span className="badge badge-ok">${Number(o.total_amount).toFixed(2)}</span>
                  </div>
                  <p className="list-card-meta">{o.customer_name}</p>
                  <p className="list-card-meta">{new Date(o.created_at).toLocaleString()}</p>
                  <div className="list-card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setDetailOrder(o)}
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(o.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="desktop-table table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.customer_name}</td>
                      <td>${Number(o.total_amount).toFixed(2)}</td>
                      <td>{new Date(o.created_at).toLocaleString()}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDetailOrder(o)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(o.id)}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {createOpen && (
        <Modal title="Create Order" onClose={() => setCreateOpen(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-row" style={{ marginBottom: "1rem" }}>
              <label htmlFor="customer">Customer</label>
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
              {errors.customer && <span className="form-error">{errors.customer}</span>}
            </div>

            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Order lines</p>
            {lines.map((line, index) => (
              <div key={index} className="order-line">
                <div className="form-row">
                  <label>Product</label>
                  <select
                    value={line.product_id}
                    onChange={(e) => updateLine(index, "product_id", e.target.value)}
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (stock: {p.quantity_in_stock}) — ${Number(p.price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, "quantity", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeLine(index)}
                  disabled={lines.length === 1}
                >
                  Remove
                </button>
                {errors[`line_${index}`] && (
                  <span className="form-error" style={{ gridColumn: "1 / -1" }}>
                    {errors[`line_${index}`]}
                  </span>
                )}
              </div>
            ))}
            {errors.items && <span className="form-error">{errors.items}</span>}

            <button type="button" className="btn btn-secondary btn-sm" onClick={addLine} style={{ marginBottom: "1rem" }}>
              + Add line
            </button>

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Place Order
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detailOrder && (
        <Modal title={`Order #${detailOrder.id}`} onClose={() => setDetailOrder(null)}>
          <p>
            <strong>Customer:</strong> {detailOrder.customer_name}
          </p>
          <p>
            <strong>Total:</strong> ${Number(detailOrder.total_amount).toFixed(2)}
          </p>
          <p>
            <strong>Placed:</strong> {new Date(detailOrder.created_at).toLocaleString()}
          </p>
          <div className="table-wrap" style={{ marginTop: "1rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {detailOrder.items.map((item) => (
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
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleCancel(detailOrder.id)}
            >
              Cancel Order
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setDetailOrder(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
