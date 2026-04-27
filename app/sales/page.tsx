"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PlusCircle,
  BarChart3,
  ShoppingCart,
  LogOut,
  Wallet,
} from "lucide-react";

type Sale = {
  _id: string;
  date: string;
  totalSales: number;
  recordedBy?: { email?: string };
};

export default function Sales() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<"today" | "week" | "month" | "all">(
    "today",
  );
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => setSales(data));
  }, []);

  const filterSales = (data: Sale[]) => {
    const now = new Date();

    return data.filter((s) => {
      const date = new Date(s.date);

      if (filter === "today") {
        return date.toDateString() === now.toDateString();
      }

      if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }

      if (filter === "month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  };

  const filteredSales = filterSales(sales);

  const totalToday = filteredSales.reduce(
    (acc, s) => acc + (s.totalSales || 0),
    0,
  );

  const totalTransactions = filteredSales.length;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ✅ SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-60 bg-white shadow p-4 gap-4 transform transition-transform z-50
  ${openSidebar ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 sm:static sm:flex flex-col`}
      >
        {/* CLOSE BUTTON (MOBILE ONLY) */}
        <button
          onClick={() => setOpenSidebar(false)}
          className="sm:hidden mb-4 text-gray-600"
        >
          ✖ Close
        </button>

        <div className="flex flex-col gap-4 mt-10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={16} />
            Logout
          </button>

          <button
            onClick={() => router.push("/sales/add")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <PlusCircle size={16} />
            Add Sales
          </button>

          <button
            onClick={() => router.push("/expenses")}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            <Wallet size={16} />
            Expenses
          </button>
        </div>
      </div>

      {/* ✅ MAIN CONTENT */}
      <div className="flex-1 p-3 sm:p-5">
        {/* ✅ MOBILE MENU BUTTON */}
        <button
          onClick={() => setOpenSidebar(true)}
          className="sm:hidden mb-4 bg-gray-800 text-white px-3 py-2 rounded-lg"
        >
          ☰ Menu
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Sales Dashboard
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Welcome back 👋, manage your daily sales
            </p>
          </div>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "today" | "week" | "month" | "all")
            }
            className="border p-2 rounded-lg"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-xs sm:text-sm">Today Sales</p>
            <h2 className="text-lg sm:text-xl font-bold text-green-600">
              ₦{totalToday}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-xs sm:text-sm">Transactions</p>
            <h2 className="text-lg sm:text-xl font-bold text-blue-600">
              {totalTransactions}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-xs sm:text-sm">Total Records</p>
            <h2 className="text-lg sm:text-xl font-bold text-purple-600">
              {filteredSales.length}
            </h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/sales/add")}
              className="flex items-center justify-center gap-2 bg-green-100 text-green-700 p-3 sm:p-4 rounded-lg hover:bg-green-200 transition text-sm sm:text-base"
            >
              <ShoppingCart size={16} />
              Record Sale
            </button>

            <button className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 p-3 sm:p-4 rounded-lg hover:bg-blue-200 transition text-sm sm:text-base">
              <BarChart3 size={16} />
              View Reports
            </button>

            <button
              onClick={() => router.push("/expenses")}
              className="flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 p-3 sm:p-4 rounded-lg hover:bg-yellow-200 transition text-sm sm:text-base"
            >
              <Wallet size={16} />
              Manage Expenses
            </button>

            <button className="bg-gray-100 p-3 sm:p-4 rounded-lg text-gray-600 text-sm sm:text-base">
              📦 Inventory (Coming Soon)
            </button>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
            Recent Sales
          </h2>

          {filteredSales.length === 0 ? (
            <p className="text-gray-400 text-sm">No sales recorded yet...</p>
          ) : (
            <div className="space-y-3">
              {filteredSales.slice(0, 5).map((s: Sale) => (
                <div
                  key={s._id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border p-3 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      ₦{s.totalSales}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(s.date).toDateString()}
                    </p>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-600 break-all">
                    {s.recordedBy?.email || "Unknown"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}