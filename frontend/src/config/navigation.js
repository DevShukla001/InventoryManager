import {
  LayoutDashboard,
  Package,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/query", label: "Query", icon: Search },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
];
