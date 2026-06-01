import { useCallback, useEffect, useState } from "react";
import Modal from "../components/Modal";
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
        await run(
          () => api.updateProduct(editing.id, payload),
          "Product updated"
        );
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
    <div>
      <header className="page-header">
        <h1 className="cosmic-title">Products</h1>
        <p>Manage catalog and inventory levels</p>
      </header>

      <div className="toolbar">
        <span>{products.length} product(s)</span>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add Product
        </button>
      </div>

      <div className="card card-glow table-wrap">
        {products.length === 0 ? (
          <p className="empty-state">No products yet. Add your first product.</p>
        ) : (
          <table>
            <thead>
              <tr>
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
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
