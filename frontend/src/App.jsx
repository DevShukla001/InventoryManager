import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useApp } from "./context/AppContext";
import CustomersPage from "./pages/CustomersPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import QueryPage from "./pages/QueryPage";

export default function App() {
  const { toast } = useApp();

  return (
    <Layout toast={toast}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/query" element={<QueryPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </Layout>
  );
}
