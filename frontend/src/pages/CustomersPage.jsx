import { useCallback, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { api } from "../api";
import { useApp } from "../context/AppContext";

const emptyCustomer = { full_name: "", email: "", phone_number: "" };

function validateCustomer(form) {
  const errors = {};
  if (!form.full_name.trim()) errors.full_name = "Full name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Enter a valid email address";
  if (!form.phone_number.trim()) errors.phone_number = "Phone number is required";
  return errors;
}

export default function CustomersPage() {
  const { run, loading } = useApp();
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyCustomer);
  const [errors, setErrors] = useState({});

  const load = useCallback(() => {
    api.getCustomers().then(setCustomers).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateCustomer(form);
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    try {
      await run(
        () =>
          api.createCustomer({
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            phone_number: form.phone_number.trim(),
          }),
        "Customer created"
      );
      setModalOpen(false);
      setForm(emptyCustomer);
      load();
    } catch {
      /* toast handled */
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await run(() => api.deleteCustomer(id), "Customer deleted");
      load();
    } catch {
      /* toast handled */
    }
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="cosmic-title">Customers</h1>
        <p>Manage customer records</p>
      </header>

      <div className="toolbar">
        <span>{customers.length} customer(s)</span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setForm(emptyCustomer);
            setErrors({});
            setModalOpen(true);
          }}
        >
          Add Customer
        </button>
      </div>

      <div className="card card-glow table-wrap">
        {customers.length === 0 ? (
          <p className="empty-state">No customers yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone_number}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(c.id)}
                    >
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
        <Modal title="Add Customer" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-row">
              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
              {errors.full_name && <span className="form-error">{errors.full_name}</span>}
            </div>
            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-row">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              />
              {errors.phone_number && (
                <span className="form-error">{errors.phone_number}</span>
              )}
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Create Customer
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
