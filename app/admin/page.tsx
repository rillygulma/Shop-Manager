"use client";

import { useEffect, useState, ReactNode } from "react";
import Image from "next/image";

import {
  BarChart3,
  Users,
  Wallet,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Menu,
  UserPlus,
  CalendarPlus,
  UserCog,
  FileText,
  LogOut,
  LayoutDashboard,
  Trophy,
  RefreshCw,
  CreditCard,
} from "lucide-react";

interface Sale {
  _id: string;
  totalSales: number;
  date: string;
  recordedBy?: {
    email?: string;
  };
  computer?: {
    typing?: number;
    printing?: number;
    photocopying?: number;
    browsing?: number;
  };
  pos?: {
    charges?: number;
  };
  drinks?: {
    coke?: number;
    water?: number;
  };
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

type POSTransactionType =
  | "withdrawal"
  | "deposit"
  | "transfer"
  | "airtime"
  | "data"
  | "other";

interface POSTransaction {
  _id: string;
  date: string;
  type: POSTransactionType;
  amount: number;
  charge: number;
  recordedBy?: {
    email?: string;
    fullName?: string;
    role?: string;
  };
  createdAt?: string;
}

interface DailyChallenge {
  _id: string;
  title: string;
  description: string;
  createdBy?: {
    email?: string;
    role?: string;
  };
  createdAt: string;
}

type FilterOption = "today" | "week" | "month" | "all";

export default function Admin() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [posTransactions, setPosTransactions] = useState<
    POSTransaction[]
  >([]);

  const [filter, setFilter] =
    useState<FilterOption>("today");

  const [showModal, setShowModal] = useState(false);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState("sales");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [selectedSale, setSelectedSale] =
    useState<Sale | null>(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const [dailyChallenges, setDailyChallenges] =
    useState<DailyChallenge[]>([]);

  const [challengesLoading, setChallengesLoading] =
    useState(false);

  useEffect(() => {
    fetchSalesExpenses();
    fetchDailyChallenges();
  }, []);

  const fetchSalesExpenses = async () => {
    try {
      const [
        salesRes,
        expensesRes,
        posRes,
      ] = await Promise.all([
        fetch("/api/sales", {
          cache: "no-store",
        }),
        fetch("/api/expenses", {
          cache: "no-store",
        }),
        fetch("/api/pos", {
          cache: "no-store",
        }),
      ]);

      const salesData = salesRes.ok
        ? await salesRes.json()
        : [];

      const expensesData = expensesRes.ok
        ? await expensesRes.json()
        : [];

      const posData = posRes.ok
        ? await posRes.json()
        : [];

      const formattedExpenses =
        Array.isArray(expensesData)
          ? expensesData
              .map(
                (
                  e: Partial<Expense> & {
                    createdAt?: string;
                  }
                ) => ({
                  ...e,
                  date:
                    e.date ||
                    e.createdAt ||
                    "",
                })
              )
              .filter(
                (
                  e
                ): e is Expense =>
                  !!e._id
              )
          : [];

      setSales(
        Array.isArray(salesData)
          ? salesData
          : []
      );

      setExpenses(formattedExpenses);

      setPosTransactions(
        Array.isArray(posData)
          ? posData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch dashboard data:",
        error
      );

      setSales([]);
      setExpenses([]);
      setPosTransactions([]);
    }
  };

  const fetchDailyChallenges = async () => {
    setChallengesLoading(true);

    try {
      const res = await fetch(
        "/api/daily-challenges",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        setDailyChallenges([]);
        return;
      }

      const data = await res.json();

      setDailyChallenges(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch daily challenges:",
        error
      );

      setDailyChallenges([]);
    } finally {
      setChallengesLoading(false);
    }
  };

  const handleOpenChallenge = async (
    challenge: DailyChallenge
  ) => {
    setDailyChallenges((prev) =>
      prev.filter(
        (item) =>
          item._id !== challenge._id
      )
    );

    try {
      const res = await fetch(
        `/api/daily-challenges/${challenge._id}/read`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        setDailyChallenges((prev) => {
          if (
            prev.some(
              (item) =>
                item._id === challenge._id
            )
          ) {
            return prev;
          }

          return [challenge, ...prev];
        });
      }
    } catch (error) {
      console.error(
        "Failed to mark daily challenge as read:",
        error
      );

      setDailyChallenges((prev) => {
        if (
          prev.some(
            (item) =>
              item._id === challenge._id
          )
        ) {
          return prev;
        }

        return [challenge, ...prev];
      });
    }
  };

  const handleFetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      setUsers(
        Array.isArray(data) ? data : []
      );

      setShowUsers(true);
      setSidebarOpen(false);
    } catch {
      setUsers([]);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch {}
  };

  const filterData = <T extends { date: string }>(
    data: T[]
  ): T[] => {
    const now = new Date();

    return data.filter((item) => {
      if (!item.date) {
        return false;
      }

      const date = new Date(item.date);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      if (filter === "today") {
        return (
          date.toDateString() ===
          now.toDateString()
        );
      }

      if (filter === "week") {
        const weekAgo = new Date();

        weekAgo.setDate(
          now.getDate() - 7
        );

        return date >= weekAgo;
      }

      if (filter === "month") {
        return (
          date.getMonth() ===
            now.getMonth() &&
          date.getFullYear() ===
            now.getFullYear()
        );
      }

      return true;
    });
  };

  const filteredSales = filterData(
    sales
  ).filter((sale) => {
    const searchTerm =
      search.toLowerCase();

    return (
      sale.totalSales
        .toString()
        .includes(searchTerm) ||
      sale.recordedBy?.email
        ?.toLowerCase()
        .includes(searchTerm) ||
      new Date(sale.date)
        .toLocaleString()
        .toLowerCase()
        .includes(searchTerm)
    );
  });

  const filteredExpenses =
    filterData(expenses);

  const filteredPOSTransactions =
    filterData(posTransactions);

  /*
   * SALES RECORD TOTAL
   *
   * This is the total recorded from
   * normal sales records such as:
   * typing, printing, photocopying,
   * browsing, drinks, etc.
   */
  const salesRecordsTotal =
    filteredSales.reduce(
      (acc, sale) =>
        acc + (sale.totalSales || 0),
      0
    );

  /*
   * TOTAL POS AMOUNT
   *
   * This is the amount handled through
   * POS transactions.
   */
  const totalPOSAmount =
    filteredPOSTransactions.reduce(
      (acc, transaction) =>
        acc + (transaction.amount || 0),
      0
    );

  /*
   * TOTAL POS CHARGES
   *
   * This is the actual income/charge
   * earned from POS services.
   */
  const totalPOSCharges =
    filteredPOSTransactions.reduce(
      (acc, transaction) =>
        acc + (transaction.charge || 0),
      0
    );

  /*
   * TOTAL SALES
   *
   * Total Sales now includes:
   *
   * Sales Records
   * + POS Amount
   * + POS Charges
   */
  const totalSales =
    salesRecordsTotal +
    totalPOSAmount +
    totalPOSCharges;

  /*
   * TOTAL EXPENSES
   */
  const totalExpenses =
    filteredExpenses.reduce(
      (acc, expense) =>
        acc + (expense.total || 0),
      0
    );

  /*
   * PROFIT
   */
  const profit =
    totalSales - totalExpenses;

  /*
   * TODAY'S TOTALS
   */
  const today = new Date().toDateString();

  const todaySalesTotal =
    sales
      .filter(
        (sale) =>
          new Date(
            sale.date
          ).toDateString() === today
      )
      .reduce(
        (acc, sale) =>
          acc + (sale.totalSales || 0),
        0
      );

  const todayPOSAmount =
    posTransactions
      .filter(
        (transaction) =>
          new Date(
            transaction.date
          ).toDateString() === today
      )
      .reduce(
        (acc, transaction) =>
          acc +
          (transaction.amount || 0),
        0
      );

  const todayPOSCharges =
    posTransactions
      .filter(
        (transaction) =>
          new Date(
            transaction.date
          ).toDateString() === today
      )
      .reduce(
        (acc, transaction) =>
          acc +
          (transaction.charge || 0),
        0
      );

  /*
   * TODAY'S TOTAL SALES
   *
   * Sales records
   * + today's POS amount
   * + today's POS charges
   */
  const todayTotalSales =
    todaySalesTotal +
    todayPOSAmount +
    todayPOSCharges;

  const todayExpenseTotal =
    expenses
      .filter(
        (expense) =>
          new Date(
            expense.date
          ).toDateString() === today
      )
      .reduce(
        (acc, expense) =>
          acc + (expense.total || 0),
        0
      );

  const todayProfit =
    todayTotalSales -
    todayExpenseTotal;

  const handleAddOrEditStaff =
    async () => {
      if (!staffEmail.trim()) {
        setMessage(
          "Email is required"
        );
        return;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(staffEmail)) {
        setMessage(
          "Enter a valid email address"
        );
        return;
      }

      if (!editingUser) {
        if (!staffPassword.trim()) {
          setMessage(
            "Password is required"
          );
          return;
        }

        if (staffPassword.length < 6) {
          setMessage(
            "Password must be at least 6 characters"
          );
          return;
        }
      }

      if (!staffRole) {
        setMessage(
          "Please select a role"
        );
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const url = editingUser
          ? `/api/users/${editingUser._id}`
          : "/api/auth/register";

        const method = editingUser
          ? "PUT"
          : "POST";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: staffEmail,
            password: staffPassword,
            role: staffRole,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessage(
            editingUser
              ? "User updated successfully!"
              : "Staff created successfully!"
          );

          setStaffEmail("");
          setStaffPassword("");
          setStaffRole("sales");
          setEditingUser(null);

          handleFetchUsers();

          setTimeout(() => {
            setShowModal(false);
            setMessage("");
          }, 1000);
        } else {
          setMessage(
            data.error || "Failed"
          );
        }
      } catch {
        setMessage(
          "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

  const handleDeleteUser = async (
    id: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this user?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        handleFetchUsers();
      }
    } catch {}
  };

  const handleEditClick = (
    user: User
  ) => {
    setEditingUser(user);
    setStaffEmail(user.email);
    setStaffRole(user.role);
    setStaffPassword("");
    setMessage("");
    setShowModal(true);
  };

  const fetchSingleSale = async (
    id: string
  ) => {
    try {
      const res = await fetch(
        `/api/sales?id=${id}`
      );

      const data = await res.json();

      setSelectedSale(data);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="BrightStack Digital Solutions"
              width={48}
              height={48}
              className="rounded-xl object-cover"
            />

            <div>
              <h1 className="font-bold">
                BrightStack
              </h1>

              <p className="text-xs text-orange-500">
                Digital Solutions
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 hover:bg-slate-800 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="mb-3 rounded-xl bg-orange-500/10 p-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard
                size={22}
                className="text-orange-500"
              />

              <div>
                <p className="text-sm font-semibold">
                  Admin Dashboard
                </p>

                <p className="text-xs text-slate-400">
                  Management System
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-orange-500 px-4 py-3 font-medium transition hover:bg-orange-600"
          >
            <UserPlus size={20} />
            Add Staff
          </button>

          <button
            onClick={() =>
              (window.location.href =
                "/expenses")
            }
            className="flex w-full items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 font-medium transition hover:border-orange-500 hover:bg-slate-800"
          >
            <CalendarPlus size={20} />
            Add Expense
          </button>

          <button
            onClick={() =>
              (window.location.href =
                "/reports")
            }
            className="flex w-full items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 font-medium transition hover:border-orange-500 hover:bg-slate-800"
          >
            <FileText size={20} />
            View Reports
          </button>

          <button
            onClick={handleFetchUsers}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 font-medium transition hover:border-orange-500 hover:bg-slate-800"
          >
            <UserCog size={20} />
            Manage Users
          </button>

          <button
            onClick={() => {
              document
                .getElementById(
                  "daily-challenges"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                });

              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 font-medium transition hover:border-orange-500 hover:bg-slate-800"
          >
            <Trophy size={20} />

            Daily Challenges

            {dailyChallenges.length >
              0 && (
                <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                  {dailyChallenges.length}
                </span>
              )}
          </button>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-500/30 px-4 py-3 font-medium text-red-400 transition hover:bg-red-500 hover:text-white"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 p-5 text-center">
          <p className="text-xs text-slate-500">
            © 2026 BrightStack Digital Solutions
          </p>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* MAIN */}
      <main className="min-h-screen md:ml-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl border border-slate-200 p-2 hover:border-orange-500 md:hidden"
              >
                <Menu size={22} />
              </button>

              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  <span className="text-orange-500">
                    BrightStack
                  </span>{" "}
                  Management System
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Monitor your business performance
                  and manage your operations.
                </p>
              </div>
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value as FilterOption
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="today">
                Today
              </option>

              <option value="week">
                This Week
              </option>

              <option value="month">
                This Month
              </option>

              <option value="all">
                All Time
              </option>
            </select>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {/* STATS */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card
              title="Total Sales"
              value={totalSales}
              color="orange"
              icon={<Wallet />}
            />

            <Card
              title="POS Amount"
              value={totalPOSAmount}
              color="blue"
              icon={<CreditCard />}
            />

            <Card
              title="POS Charges"
              value={totalPOSCharges}
              color="purple"
              icon={<TrendingUp />}
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
              noCurrency
            />
          </div>

          {/* TODAY SUMMARY */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <h2 className="font-bold">
                Today&apos;s Summary
              </h2>

              <p className="text-sm text-slate-500">
                Overview of today&apos;s business
                activity.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryItem
                label="Total Sales"
                value={todayTotalSales}
                color="text-orange-500"
              />

              <SummaryItem
                label="POS Amount"
                value={todayPOSAmount}
                color="text-blue-500"
              />

              <SummaryItem
                label="POS Charges"
                value={todayPOSCharges}
                color="text-purple-500"
              />

              <SummaryItem
                label="Expenses"
                value={todayExpenseTotal}
                color="text-red-500"
              />

              <SummaryItem
                label="Profit"
                value={todayProfit}
                color="text-green-500"
              />
            </div>
          </div>

          {/* DAILY CHALLENGES */}
          <div
            id="daily-challenges"
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-orange-500/10 p-2">
                    <Trophy
                      size={22}
                      className="text-orange-500"
                    />
                  </div>

                  <h2 className="text-lg font-bold">
                    Daily Challenges
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Challenges posted by sales
                  staff.
                </p>
              </div>

              <button
                onClick={
                  fetchDailyChallenges
                }
                disabled={
                  challengesLoading
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:border-orange-500 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  size={16}
                  className={
                    challengesLoading
                      ? "animate-spin"
                      : ""
                  }
                />

                {challengesLoading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {challengesLoading ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

                <p className="text-sm text-slate-400">
                  Loading daily challenges...
                </p>
              </div>
            ) : dailyChallenges.length ===
              0 ? (
              <div className="rounded-xl bg-slate-50 py-10 text-center dark:bg-slate-800">
                <Trophy
                  size={40}
                  className="mx-auto mb-3 text-slate-400"
                />

                <p className="font-medium text-slate-500">
                  No daily challenges yet.
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Challenges posted by sales
                  staff will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dailyChallenges.map(
                  (challenge) => (
                    <button
                      type="button"
                      key={challenge._id}
                      onClick={() =>
                        handleOpenChallenge(
                          challenge
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 p-5 text-left transition hover:border-orange-400 hover:bg-orange-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-start gap-3">
                            <div className="mt-1 rounded-lg bg-orange-500/10 p-2">
                              <Trophy
                                size={18}
                                className="text-orange-500"
                              />
                            </div>

                            <div>
                              <h3 className="text-base font-bold">
                                {
                                  challenge.title
                                }
                              </h3>

                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                {
                                  challenge.description
                                }
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:gap-5">
                            <span className="break-all">
                              <strong>
                                Posted by:
                              </strong>{" "}
                              {challenge
                                .createdBy
                                ?.email ||
                                "Unknown"}
                            </span>

                            <span>
                              <strong>
                                Role:
                              </strong>{" "}
                              {challenge
                                .createdBy
                                ?.role ||
                                "Sales"}
                            </span>

                            <span>
                              <strong>
                                Date:
                              </strong>{" "}
                              {new Date(
                                challenge.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                            Sales Challenge
                          </span>

                          <span className="text-xs font-medium text-orange-500">
                            Open to mark as read →
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* SALES RECORDS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Sales Records
              </h2>

              <p className="text-sm text-slate-500">
                View and search recorded transactions.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search by email, amount, or date..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800"
            />

            {filteredSales.length ===
            0 ? (
              <div className="py-10 text-center">
                <BarChart3
                  className="mx-auto mb-3 text-slate-400"
                  size={35}
                />

                <p className="text-slate-400">
                  No sales found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSales.map(
                  (sale) => (
                    <div
                      key={sale._id}
                      onClick={() =>
                        fetchSingleSale(
                          sale._id
                        )
                      }
                      className="cursor-pointer rounded-xl border border-slate-200 p-4 transition hover:border-orange-400 hover:bg-orange-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-bold text-orange-500">
                            ₦
                            {sale.totalSales.toLocaleString()}
                          </p>

                          <p className="break-all text-sm text-slate-500">
                            Added by:{" "}
                            {sale.recordedBy
                              ?.email ||
                              "Unknown"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {new Date(
                              sale.date
                            ).toLocaleString()}
                          </p>
                        </div>

                        <span className="text-xs font-medium text-orange-500">
                          View Details →
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* POS TRANSACTION SUMMARY */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  POS Transactions
                </h2>

                <p className="text-sm text-slate-500">
                  POS transaction amounts and charges recorded by staff.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl bg-blue-500/10 px-4 py-2">
                  <p className="text-xs text-slate-500">
                    POS Amount
                  </p>

                  <p className="font-bold text-blue-500">
                    ₦
                    {totalPOSAmount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-purple-500/10 px-4 py-2">
                  <p className="text-xs text-slate-500">
                    POS Charges
                  </p>

                  <p className="font-bold text-purple-500">
                    ₦
                    {totalPOSCharges.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-500/10 px-4 py-2">
                  <p className="text-xs text-slate-500">
                    Total Sales
                  </p>

                  <p className="font-bold text-orange-500">
                    ₦
                    {totalSales.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {filteredPOSTransactions.length ===
            0 ? (
              <div className="rounded-xl bg-slate-50 py-10 text-center dark:bg-slate-800">
                <CreditCard
                  size={35}
                  className="mx-auto mb-3 text-slate-400"
                />

                <p className="font-medium text-slate-500">
                  No POS transactions found.
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  POS transactions will appear here
                  when recorded by sales staff.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPOSTransactions.map(
                  (transaction) => (
                    <div
                      key={transaction._id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                              {transaction.type}
                            </span>

                            <span className="text-xs text-slate-400">
                              {transaction.date}
                            </span>
                          </div>

                          <p className="text-lg font-bold text-blue-500">
                            ₦
                            {transaction.amount.toLocaleString()}
                          </p>

                          <p className="text-sm text-slate-500">
                            Recorded by:{" "}
                            {transaction
                              .recordedBy
                              ?.email ||
                              transaction
                                .recordedBy
                                ?.fullName ||
                              "Unknown"}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-500">
                            POS Charge
                          </p>

                          <p className="text-lg font-bold text-purple-500">
                            ₦
                            {transaction.charge.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* USERS */}
          {showUsers && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5">
                <h2 className="text-lg font-bold">
                  Registered Users
                </h2>

                <p className="text-sm text-slate-500">
                  Manage BrightStack Management
                  System users.
                </p>
              </div>

              {users.length === 0 ? (
                <p className="py-8 text-center text-slate-400">
                  No users found.
                </p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="break-all font-medium">
                          {user.email}
                        </p>

                        <span className="mt-1 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                          {user.role}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleEditClick(
                              user
                            )
                          }
                          className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteUser(
                              user._id
                            )
                          }
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
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
        </div>
      </main>

      {/* SALE DETAILS MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <button
              onClick={() =>
                setSelectedSale(null)
              }
              className="absolute right-4 top-4 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <h2 className="mb-6 text-xl font-bold">
              Sale Details
            </h2>

            <div className="space-y-4 text-sm">
              <Detail
                label="Typing"
                value={
                  selectedSale.computer
                    ?.typing || 0
                }
              />

              <Detail
                label="Printing"
                value={
                  selectedSale.computer
                    ?.printing || 0
                }
              />

              <Detail
                label="Photocopying"
                value={
                  selectedSale.computer
                    ?.photocopying || 0
                }
              />

              <Detail
                label="Browsing"
                value={
                  selectedSale.computer
                    ?.browsing || 0
                }
              />

              <Detail
                label="POS Charges"
                value={
                  selectedSale.pos
                    ?.charges || 0
                }
              />

              <Detail
                label="Coke"
                value={
                  selectedSale.drinks
                    ?.coke || 0
                }
              />

              <Detail
                label="Water"
                value={
                  selectedSale.drinks
                    ?.water || 0
                }
              />

              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <p className="text-lg font-bold text-orange-500">
                  Total: ₦
                  {selectedSale.totalSales.toLocaleString()}
                </p>
              </div>

              <p>
                <span className="font-semibold">
                  Recorded By:
                </span>{" "}
                {selectedSale.recordedBy
                  ?.email ||
                  "Unknown"}
              </p>

              <p>
                <span className="font-semibold">
                  Date:
                </span>{" "}
                {new Date(
                  selectedSale.date
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <button
              onClick={() => {
                setShowModal(false);
                setEditingUser(null);
                setMessage("");
              }}
              className="absolute right-4 top-4 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold">
                {editingUser
                  ? "Edit User"
                  : "Add Staff"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage access to your BrightStack
                Management System.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={staffEmail}
                onChange={(e) =>
                  setStaffEmail(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800"
              />

              <input
                type="password"
                placeholder={
                  editingUser
                    ? "Leave blank to keep current password"
                    : "Password"
                }
                value={staffPassword}
                onChange={(e) => {
                  setStaffPassword(
                    e.target.value
                  );
                  setMessage("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800"
              />

              <select
                value={staffRole}
                onChange={(e) => {
                  setStaffRole(
                    e.target.value
                  );
                  setMessage("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="sales">
                  Sales
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

              {message && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">
                  {message}
                </p>
              )}

              <button
                onClick={
                  handleAddOrEditStaff
                }
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 p-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}

function Card({
  title,
  value,
  color,
  icon,
  noCurrency = false,
}: {
  title: string;
  value: number;
  color: string;
  icon: ReactNode;
  noCurrency?: boolean;
}) {
  const colorMap: Record<
    string,
    string
  > = {
    orange:
      "text-orange-500 bg-orange-500/10",

    red:
      "text-red-500 bg-red-500/10",

    purple:
      "text-purple-500 bg-purple-500/10",

    blue:
      "text-blue-500 bg-blue-500/10",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div
          className={`rounded-xl p-3 ${colorMap[color]}`}
        >
          {icon}
        </div>

        <TrendingUp
          size={18}
          className="text-slate-300"
        />
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <h2
        className={`mt-1 text-2xl font-bold ${
          colorMap[color].split(" ")[0]
        }`}
      >
        {noCurrency
          ? value.toLocaleString()
          : `₦${value.toLocaleString()}`}
      </h2>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <h3
        className={`mt-2 text-2xl font-bold ${color}`}
      >
        ₦{value.toLocaleString()}
      </h3>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold">
        ₦{value.toLocaleString()}
      </span>
    </div>
  );
}