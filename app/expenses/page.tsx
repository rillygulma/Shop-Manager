"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import toast from "react-hot-toast";

type Expense = {
  _id: string;
  fuel: number;
  internet: number;
  other: number;
  total: number;
  createdAt?: string;
  recordedBy?: {
    role?: string;
    email?: string;
  };
};

type ExpenseForm = {
  fuel: string;
  internet: string;
  other: string;
};

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // ✅ Search
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<ExpenseForm>({
    fuel: "",
    internet: "",
    other: "",
  });
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const fields: (keyof ExpenseForm)[] = ["fuel", "internet", "other"];

  // ✅ SAFE FETCH
  const safeFetchJSON = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error");
    }
  };

  // ✅ LOAD EXPENSES
  const loadExpenses = async () => {
    try {
      const data = await safeFetchJSON("/api/expenses");
      setExpenses(data || []);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load expenses",
      );
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // reset page on reload
  useEffect(() => {
    setCurrentPage(1);
  }, [expenses.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ FILTER (SEARCH)
  const filteredExpenses = expenses.filter((exp) => {
    const term = search.toLowerCase();

    return (
      exp.recordedBy?.email?.toLowerCase().includes(term) ||
      exp.recordedBy?.role?.toLowerCase().includes(term) ||
      exp.fuel.toString().includes(term) ||
      exp.internet.toString().includes(term) ||
      exp.other.toString().includes(term) ||
      exp.total.toString().includes(term)
    );
  });

  // pagination logic (UPDATED)
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);

  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ✅ SUBMIT WITH TOAST
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loading = toast.loading("Saving expense...");

    try {
      await safeFetchJSON("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fuel: Number(form.fuel) || 0,
          internet: Number(form.internet) || 0,
          other: Number(form.other) || 0,
        }),
      });

      toast.success("Expense saved successfully!", { id: loading });

      setForm({ fuel: "", internet: "", other: "" });

      await loadExpenses();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save expense",
        { id: loading },
      );
    }
  };

  const fetchSingleExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`);
      const data = await res.json();
      setSelectedExpense(data);
    } catch {
      toast.error("Failed to load expense details");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white rounded-lg shadow"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg sm:text-2xl font-bold">Expenses</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-5 rounded-xl shadow mb-6 space-y-4"
      >
        <h2 className="text-base sm:text-lg font-semibold">Add Expense</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map((field) => (
            <input
              key={field}
              type="number"
              name={field}
              value={form[field]}
              onChange={handleChange}
              placeholder={field}
              className="border p-3 rounded-lg text-sm w-full"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600"
        >
          Save Expense
        </button>
      </form>

      {/* Expense List */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow">
        {/* ✅ SEARCH INPUT */}
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded-lg w-full mb-4 text-sm"
        />

        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Expense History
        </h2>

        {expenses.length === 0 ? (
          <p className="text-gray-400 text-sm">No expenses yet...</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedExpenses.map((exp) => (
                <div
                  key={exp._id}
                  onClick={() => fetchSingleExpense(exp._id)}
                  className="border p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between gap-2 cursor-pointer hover:bg-gray-50"
                >
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p>Fuel: ₦{exp.fuel}</p>
                    <p>Internet: ₦{exp.internet}</p>
                    <p>Other: ₦{exp.other}</p>

                    <p className="text-gray-500 mt-2">
                      By: {exp.recordedBy?.role || "Unknown"} (
                      {exp.recordedBy?.email || "no-email"})
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm sm:text-base text-red-600">
                      ₦{exp.total}
                    </p>
                    <p className="text-xs text-gray-400">
                      {exp.createdAt
                        ? new Date(exp.createdAt).toDateString()
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setSelectedExpense(null)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4">Expense Details</h2>

            <div className="space-y-3 text-sm">
              <p>
                <span className="font-semibold">Fuel:</span> ₦
                {selectedExpense.fuel}
              </p>

              <p>
                <span className="font-semibold">Internet:</span> ₦
                {selectedExpense.internet}
              </p>

              <p>
                <span className="font-semibold">Other:</span> ₦
                {selectedExpense.other}
              </p>

              <p className="font-bold text-red-600">
                Total: ₦{selectedExpense.total}
              </p>

              <p>
                <span className="font-semibold">Recorded By:</span>{" "}
                {selectedExpense.recordedBy?.role || "Unknown"} (
                {selectedExpense.recordedBy?.email || "no-email"})
              </p>

              <p>
                <span className="font-semibold">Date:</span>{" "}
                {selectedExpense.createdAt
                  ? new Date(selectedExpense.createdAt).toLocaleString()
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
