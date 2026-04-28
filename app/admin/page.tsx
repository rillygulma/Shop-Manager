"use client";

import { useEffect, useState, ReactNode } from "react";
import {
  BarChart3,
  Users,
  Wallet,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Menu,
} from "lucide-react";

interface Sale {
  _id: string;
  totalSales: number;
  date: string;
  recordedBy?: { email: string };
}
interface Expense {
  _id: string;
  total: number;
  date: string;
}
interface User {
  _id: string;
  email: string;
  role: string;
}
type FilterOption = "today" | "week" | "month" | "all";

export default function Admin() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<FilterOption>("today");
  const [showModal, setShowModal] = useState(false);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState("sales");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSalesExpenses();
  }, []);

  const fetchSalesExpenses = async () => {
    try {
      const [salesRes, expensesRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/expenses"),
      ]);
      const salesData = salesRes.ok ? await salesRes.json() : [];
      const expensesData = expensesRes.ok ? await expensesRes.json() : [];

      const formattedExpenses = Array.isArray(expensesData)
        ? expensesData
            .map((e: Partial<Expense> & { createdAt?: string }) => ({
              ...e,
              date: e.date || e.createdAt || "",
            }))
            .filter((e): e is Expense => !!e._id)
        : [];

      setSales(Array.isArray(salesData) ? salesData : []);
      setExpenses(formattedExpenses);
    } catch {
      setSales([]);
      setExpenses([]);
    }
  };

  const handleFetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setShowUsers(true);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {}
  };

  const filterData = <T extends { date: string }>(data: T[]): T[] => {
    const now = new Date();
    return data.filter((item) => {
      const date = new Date(item.date);
      if (filter === "today") return date.toDateString() === now.toDateString();
      if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }
      if (filter === "month")
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      return true;
    });
  };

  const filteredSales = filterData(sales).filter((sale) => {
    const searchTerm = search.toLowerCase();

    return (
      sale.totalSales.toString().includes(searchTerm) ||
      sale.recordedBy?.email?.toLowerCase().includes(searchTerm) ||
      new Date(sale.date).toLocaleString().toLowerCase().includes(searchTerm)
    );
  });
  const filteredExpenses = filterData(expenses);

  const totalSales = filteredSales.reduce((acc, s) => acc + s.totalSales, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.total, 0);
  const profit = totalSales - totalExpenses;

  const today = new Date().toDateString();
  const todaySalesTotal = sales
    .filter((s) => new Date(s.date).toDateString() === today)
    .reduce((acc, s) => acc + s.totalSales, 0);
  const todayExpenseTotal = expenses
    .filter((e) => new Date(e.date).toDateString() === today)
    .reduce((acc, e) => acc + e.total, 0);
  const todayProfit = todaySalesTotal - todayExpenseTotal;

  const handleAddOrEditStaff = async () => {
    setLoading(true);
    setMessage("");
    try {
      const url = editingUser
        ? `/api/users/${editingUser._id}`
        : "/api/auth/register";
      const method = editingUser ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: staffEmail,
          password: staffPassword,
          role: staffRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(editingUser ? "User updated!" : "Staff created!");
        setStaffEmail("");
        setStaffPassword("");
        setStaffRole("sales");
        setEditingUser(null);
        handleFetchUsers();
      } else setMessage(data.error || "Failed");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) handleFetchUsers();
    } catch {}
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setStaffEmail(user.email);
    setStaffRole(user.role);
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      {/* Sidebar */}
<div
  className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white shadow-md p-5 flex flex-col gap-4 transform transition-transform ${
    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  }`}
>
  {/* ✅ MOBILE CLOSE BUTTON (ADDED) */}
  <div className="flex justify-end md:hidden">
    <button
      onClick={() => setSidebarOpen(false)}
      className="p-2 rounded-lg hover:bg-gray-100"
    >
      <X size={22} />
    </button>
  </div>

  <h1 className="mt-3 text-2xl font-bold">
    <span className="text-green-600">Admin</span>{" "}
    <span className="text-gray-800">Dashboard</span>
  </h1>

  <button
    onClick={() => setShowModal(true)}
    className="w-full text-left bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
  >
    Add Staff
  </button>

  <button
    onClick={() => (window.location.href = "/expenses")}
    className="w-full text-left bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
  >
    Add Expense
  </button>

  <button
    onClick={handleFetchUsers}
    className="w-full text-left bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
  >
    Manage Users
  </button>

  <button
    onClick={handleLogout}
    className="w-full text-left bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
  >
    Logout
  </button>
</div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Main */}
      <div className="flex-1 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden">
              <Menu />
            </button>
            <div>
              <h1 className="mt-3 text-2xl font-bold">
                <span className="text-green-600">Admin</span>{" "}
                <span className="text-gray-800">Dashboard</span>
              </h1>
              <p className="text-gray-500 text-sm">
                Monitor your shop performance 📊
              </p>
            </div>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="border p-2 rounded-lg w-full md:w-auto"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card
            title="Total Sales"
            value={totalSales}
            color="green"
            icon={<Wallet />}
          />
          <Card
            title="Expenses"
            value={totalExpenses}
            color="red"
            icon={<BarChart3 />}
          />
          <Card
            title="Profit"
            value={profit}
            color="purple"
            icon={<TrendingUp />}
          />
          <Card
            title="Transactions"
            value={filteredSales.length}
            color="blue"
            icon={<Users />}
          />
        </div>

        {/* Today */}
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-3 text-gray-700">Today Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Sales</p>
              <h3 className="font-bold text-green-600">₦{todaySalesTotal}</h3>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expenses</p>
              <h3 className="font-bold text-red-600">₦{todayExpenseTotal}</h3>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profit</p>
              <h3 className="font-bold text-purple-600">₦{todayProfit}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Sales Records
          </h2>
          <input
            type="text"
            placeholder="Search by email, amount, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-4 border p-2 rounded-lg"
          />

          {filteredSales.length === 0 ? (
            <p className="text-gray-400">No sales found</p>
          ) : (
            <div className="space-y-3">
              {filteredSales.map((sale) => (
                <div
                  key={sale._id}
                  className="border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      ₦{sale.totalSales}
                    </p>

                    {/* ✅ THIS IS THE IMPORTANT PART */}
                    <p className="text-sm text-gray-500 break-all">
                      Added by: {sale.recordedBy?.email || "Unknown"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(sale.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users */}
        {showUsers && (
          <div className="bg-white p-5 rounded-xl shadow mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Registered Users
            </h2>
            {users.length === 0 ? (
              <p className="text-gray-400">No users found</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800 break-all">
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                }}
                className="absolute top-3 right-3"
              >
                <X />
              </button>
              <h2 className="text-xl font-bold mb-4">
                {editingUser ? "Edit User" : "Add Staff"}
              </h2>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                >
                  <option value="sales">Sales</option>
                  <option value="admin">Admin</option>
                </select>
                {message && <p className="text-sm text-red-600">{message}</p>}
                <button
                  onClick={handleAddOrEditStaff}
                  className="w-full bg-blue-600 text-white p-2 rounded-lg"
                >
                  {loading
                    ? "Processing..."
                    : editingUser
                      ? "Update User"
                      : "Add Staff"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: ReactNode;
}) {
  const colorMap: Record<string, string> = {
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
      <div className={colorMap[color]}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className={`text-xl font-bold ${colorMap[color]}`}>₦{value}</h2>
      </div>
    </div>
  );
}
