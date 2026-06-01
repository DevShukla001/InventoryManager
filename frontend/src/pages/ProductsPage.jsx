import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import IdBadge from "../components/IdBadge";
import Modal from "../components/Modal";
import PageActions from "../components/PageActions";
import { api } from "../api";
import { useApp } from "../context/AppContext";

const emptyProduct = { name: "", sku: "", price: "", quantity_in_stock: "" };

function validateProduct(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.sku.trim()) errors.sku = "SKU is required";
  const price = parseFloat(form.price);
  if (!form.price || isNaN(price) || price <= 0) errors.price = "Price must be greater than 0";
  const qty = parseInt(form.quantity_in_stock, 10);
  if (form.quantity_in_stock === "" || isNaN(qty) || qty < 0)
    errors.quantity_in_stock = "Stock cannot be negative";
  return errors;
}

export default function ProductsPage() {
  const { run, loading } = useApp();
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [errors, setErrors] = useState({});

  const load = useCallback(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyProduct);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateProduct(form);
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };
    try {
      if (editing) {
        await run(() => api.updateProduct(editing.id, payload), "Product updated");
      } else {
        await run(() => api.createProduct(payload), "Product created");
      }
      setModalOpen(false);
      load();
    } catch {
      /* toast handled */
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await run(() => api.deleteProduct(id), "Product deleted");
      load();
    } catch {
      /* toast handled */
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Products</h1>
        <p>Each product gets an auto-generated Product ID for lookup in Query</p>
      </header>

      <PageActions
        count={products.length}
        countLabel="product(s)"
        primaryLabel="Add Product"
        onPrimary={openCreate}
      />

      <button type="button" className="fab" onClick={openCreate} aria-label="Add product">
        <Plus size={24} />
      </button>

      <div className="card">
        {products.length === 0 ? (
          <EmptyState
            message="No products yet."
            actionLabel="Add your first product"
            onAction={openCreate}
          />
        ) : (
          <>
            <div className="mobile-list">
              {products.map((p) => (
                <article key={p.id} className="list-card">
                  <div className="list-card-head">
                    <div>
                      <IdBadge label="Product ID" id={p.id} />
                      <strong style={{ display: "block", marginTop: "0.5rem" }}>{p.name}</strong>
                    </div>
                    <span
                      className={`badge ${p.quantity_in_stock <= 10 ? "badge-warning" : "badge-ok"}`}
                    >
                      {p.quantity_in_stock} in stock
                    </span>
                  </div>
                  <p className="list-card-meta">
                    SKU: {p.sku} · ${Number(p.price).toFixed(2)}
                  </p>
                  <div className="list-card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setViewProduct(p)}
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="desktop-table table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <IdBadge label="ID" id={p.id} />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>${Number(p.price).toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${p.quantity_in_stock <= 10 ? "badge-warning" : "badge-ok"}`}
                        >
                          {p.quantity_in_stock}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewProduct(p)}
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={14} /> Delete
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

      {viewProduct && (
        <Modal title="Product details" onClose={() => setViewProduct(null)}>
          <div className="view-details">
            <p>
              <strong>Product ID:</strong> {viewProduct.id}
            </p>
            <p>
              <strong>Name:</strong> {viewProduct.name}
            </p>
            <p>
              <strong>SKU:</strong> {viewProduct.sku}
            </p>
            <p>
              <strong>Price:</strong> ${Number(viewProduct.price).toFixed(2)}
            </p>
            <p>
              <strong>Stock:</strong> {viewProduct.quantity_in_stock}
            </p>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setViewProduct(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setViewProduct(null);
                openEdit(viewProduct);
              }}
            >
              Edit
            </button>
          </div>
        </Modal>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-row">
              <label htmlFor="name">Product Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-row">
              <label htmlFor="sku">SKU / Code</label>
              <input
                id="sku"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
              {errors.sku && <span className="form-error">{errors.sku}</span>}
            </div>
            <div className="form-row">
              <label htmlFor="price">Price ($)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
            <div className="form-row">
              <label htmlFor="qty">Quantity in Stock</label>
              <input
                id="qty"
                type="number"
                min="0"
                value={form.quantity_in_stock}
                onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
              />
              {errors.quantity_in_stock && (
                <span className="form-error">{errors.quantity_in_stock}</span>
              )}
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editing ? "Save Changes" : "Create Product"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
