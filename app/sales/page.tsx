"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusCircle, BarChart3, ShoppingCart, LogOut } from "lucide-react";

type Sale = {
  _id: string;
  date: string;
  totalSales: number;
  recordedBy?: { email?: string };
};

export default function Sales() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => setSales(data));
  }, []);

  const today = new Date().toDateString();
  const todaySales = sales.filter(
    (s) => new Date(s.date).toDateString() === today
  );
  const totalToday = todaySales.reduce((acc, s) => acc + (s.totalSales || 0), 0);
  const totalTransactions = todaySales.length;

  // ✅ Logout handler
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back 👋, manage your daily sales</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            Logout
          </button>

          <button
            onClick={() => router.push("/sales/add")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            <PlusCircle size={18} />
            Add Sales
          </button>
        </div>
      </div>
      {/* 📊 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Today Sales</p>
          <h2 className="text-xl font-bold text-green-600">
            ₦{totalToday}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Transactions</p>
          <h2 className="text-xl font-bold text-blue-600">
            {totalTransactions}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Records</p>
          <h2 className="text-xl font-bold text-purple-600">
            {sales.length}
          </h2>
        </div>
      </div>

      {/* ⚡ Quick Actions */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/sales/add")}
            className="flex items-center justify-center gap-2 bg-green-100 text-green-700 p-4 rounded-lg hover:bg-green-200 transition"
          >
            <ShoppingCart size={18} />
            Record Sale
          </button>

          <button
            onClick={() => router.push("/admin")}
            className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 p-4 rounded-lg hover:bg-blue-200 transition"
          >
            <BarChart3 size={18} />
            View Reports
          </button>

          <button className="bg-gray-100 p-4 rounded-lg text-gray-600">
            📦 Inventory (Coming Soon)
          </button>
        </div>
      </div>

      {/* 📜 Recent Sales */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Recent Sales
        </h2>

        {sales.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No sales recorded yet...
          </p>
        ) : (
          <div className="space-y-3">
            {sales.slice(0, 5).map((s: Sale) => (
              <div
                key={s._id}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    ₦{s.totalSales}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(s.date).toDateString()}
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  {s.recordedBy?.email || "Unknown"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}