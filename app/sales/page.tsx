"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PlusCircle,
  BarChart3,
  ShoppingCart,
  LogOut,
  Wallet,
  Menu,
  X,
  LayoutDashboard,
  Trophy,
  Send,
  CreditCard,
} from "lucide-react";

type Sale = {
  _id: string;
  date: string;
  totalSales: number;
  recordedBy?: {
    email?: string;
  };
};

type POSTransactionType =
  | "withdrawal"
  | "deposit"
  | "transfer"
  | "airtime"
  | "data"
  | "other";

type POSTransaction = {
  _id: string;
  date: string;
  type: POSTransactionType;
  amount: number;
  charge: number;
  recordedBy?: {
    fullName?: string;
    email?: string;
    role?: string;
  };
  createdAt?: string;
};

type DailyChallenge = {
  _id: string;
  title: string;
  description: string;
  createdBy?: {
    email?: string;
    role?: string;
  };
  createdAt: string;
};

export default function Sales() {
  const router = useRouter();

  // =========================
  // SALES STATE
  // =========================
  const [sales, setSales] = useState<Sale[]>([]);

  const [filter, setFilter] = useState<
    "today" | "week" | "month" | "all"
  >("today");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // =========================
  // POS STATE
  // =========================
  const [posTransactions, setPosTransactions] = useState<
    POSTransaction[]
  >([]);

  const [posSearch, setPosSearch] = useState("");
  const [posDateFilter, setPosDateFilter] = useState("");
  const [posCurrentPage, setPosCurrentPage] = useState(1);

  const POS_ITEMS_PER_PAGE = 5;

  // =========================
  // DAILY CHALLENGE STATE
  // =========================
  const [dailyChallenges, setDailyChallenges] = useState<
    DailyChallenge[]
  >([]);

  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] =
    useState("");

  const [showChallengeForm, setShowChallengeForm] =
    useState(false);

  const [challengeLoading, setChallengeLoading] =
    useState(false);

  const [challengeMessage, setChallengeMessage] =
    useState("");

  // =========================
  // SIDEBAR
  // =========================
  const [openSidebar, setOpenSidebar] = useState(false);

  // =========================
  // FETCH SALES
  // =========================
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("/api/sales");

        if (!res.ok) {
          setSales([]);
          return;
        }

        const data = await res.json();

        setSales(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
        setSales([]);
      }
    };

    fetchSales();
  }, []);

  // =========================
  // FETCH POS TRANSACTIONS
  // =========================
  useEffect(() => {
    const fetchPOSTransactions = async () => {
      try {
        const res = await fetch("/api/pos");

        if (!res.ok) {
          setPosTransactions([]);
          return;
        }

        const data = await res.json();

        setPosTransactions(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to fetch POS transactions:",
          error
        );

        setPosTransactions([]);
      }
    };

    fetchPOSTransactions();
  }, []);

  // =========================
  // FETCH DAILY CHALLENGES
  // =========================
  const fetchDailyChallenges = async () => {
    try {
      const res = await fetch("/api/daily-challenges");
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setDailyChallenges(data);
      } else {
        setDailyChallenges([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch daily challenges:",
        error
      );

      setDailyChallenges([]);
    }
  };

  useEffect(() => {
    fetchDailyChallenges();
  }, []);

  // =========================
  // POST DAILY CHALLENGE
  // =========================
  const handleCreateChallenge = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !challengeTitle.trim() ||
      !challengeDescription.trim()
    ) {
      setChallengeMessage(
        "Title and description are required."
      );
      return;
    }

    try {
      setChallengeLoading(true);
      setChallengeMessage("");

      const res = await fetch(
        "/api/daily-challenges",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: challengeTitle,
            description: challengeDescription,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setChallengeMessage(
          data.error ||
            "Failed to post challenge."
        );
        return;
      }

      setChallengeTitle("");
      setChallengeDescription("");
      setShowChallengeForm(false);

      setChallengeMessage(
        "Daily challenge posted successfully."
      );

      await fetchDailyChallenges();
    } catch (error) {
      console.error(
        "Create challenge error:",
        error
      );

      setChallengeMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setChallengeLoading(false);
    }
  };

  // =========================
  // SALES FILTER
  // =========================
  const filterSales = (data: Sale[]) => {
    const now = new Date();

    return data.filter((sale) => {
      const date = new Date(sale.date);

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

  const filteredSales = filterSales(sales).filter(
    (sale) => {
      const term = search.toLowerCase().trim();

      const matchesSearch =
        sale.totalSales
          .toString()
          .includes(term) ||
        sale.recordedBy?.email
          ?.toLowerCase()
          .includes(term) ||
        new Date(sale.date)
          .toLocaleString()
          .toLowerCase()
          .includes(term);

      const matchesDate = dateFilter
        ? new Date(sale.date)
            .toISOString()
            .split("T")[0] === dateFilter
        : true;

      return matchesSearch && matchesDate;
    }
  );

  // =========================
  // SALES PAGINATION
  // =========================
  const totalPages = Math.ceil(
    filteredSales.length /
      ITEMS_PER_PAGE
  );

  const paginatedSales =
    filteredSales.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  // =========================
  // POS FILTER
  // =========================
  const filteredPOSTransactions =
    posTransactions.filter(
      (transaction) => {
        const searchTerm =
          posSearch.toLowerCase().trim();

        const matchesSearch =
          transaction.type
            .toLowerCase()
            .includes(searchTerm) ||
          transaction.amount
            .toString()
            .includes(searchTerm) ||
          transaction.charge
            .toString()
            .includes(searchTerm) ||
          transaction.recordedBy?.email
            ?.toLowerCase()
            .includes(searchTerm) ||
          transaction.recordedBy?.fullName
            ?.toLowerCase()
            .includes(searchTerm);

        const matchesDate = posDateFilter
          ? transaction.date ===
            posDateFilter
          : true;

        return (
          matchesSearch &&
          matchesDate
        );
      }
    );

  // =========================
  // POS PAGINATION
  // =========================
  const posTotalPages = Math.ceil(
    filteredPOSTransactions.length /
      POS_ITEMS_PER_PAGE
  );

  const paginatedPOSTransactions =
    filteredPOSTransactions.slice(
      (posCurrentPage - 1) *
        POS_ITEMS_PER_PAGE,
      posCurrentPage *
        POS_ITEMS_PER_PAGE
    );

  // =========================
  // TOTAL POS AMOUNT
  // =========================
  // This is the actual amount of money
  // handled through POS transactions.
  const totalPOSAmount =
    filteredPOSTransactions.reduce(
      (total, transaction) =>
        total +
        (transaction.amount || 0),
      0
    );

  // =========================
  // TOTAL POS CHARGES
  // =========================
  // This is the actual income/profit
  // generated from POS charges.
  const totalPOSCharges =
    filteredPOSTransactions.reduce(
      (total, transaction) =>
        total +
        (transaction.charge || 0),
      0
    );

  // =========================
  // TOTAL SALES RECORDS
  // =========================
  const totalSalesRecords =
    filteredSales.reduce(
      (total, sale) =>
        total +
        (sale.totalSales || 0),
      0
    );

  // =========================
  // TOTAL SALES
  // =========================
  // Total Sales now includes:
  //
  // Sales Records
  // +
  // POS Transaction Amount
  //
  // Example:
  // Sales Records = ₦50,000
  // POS Amount    = ₦30,000
  // Total Sales   = ₦80,000
  const totalToday =
    totalSalesRecords +
    totalPOSAmount +
    totalPOSCharges;

  // =========================
  // TOTAL TRANSACTIONS
  // =========================
  const totalTransactions =
    filteredSales.length;

  // =========================
  // LATEST CHALLENGE
  // =========================
  const latestChallenge =
    dailyChallenges.length > 0
      ? dailyChallenges[0]
      : null;

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {/* MOBILE OVERLAY */}
      {openSidebar && (
        <div
          onClick={() =>
            setOpenSidebar(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm sm:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-slate-950 p-5 text-white shadow-2xl transition-transform duration-300 ${
          openSidebar
            ? "translate-x-0"
            : "-translate-x-full sm:translate-x-0"
        }`}
      >

        {/* LOGO */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="BrightStack Digital Solutions"
              width={52}
              height={52}
              className="rounded-xl object-cover"
            />

            <div>
              <h1 className="font-bold">
                BrightStack
              </h1>

              <p className="text-xs text-orange-400">
                Digital Solutions
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setOpenSidebar(false)
            }
            className="rounded-lg p-2 hover:bg-white/10 sm:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* DASHBOARD TITLE */}
        <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard
              size={22}
              className="text-orange-500"
            />

            <div>
              <p className="text-sm font-semibold">
                Sales Dashboard
              </p>

              <p className="text-xs text-slate-400">
                Manage your daily sales
              </p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex flex-1 flex-col gap-3">

          <SidebarButton
            icon={<PlusCircle size={20} />}
            label="Add Sales"
            onClick={() =>
              router.push("/sales/add")
            }
          />

          <SidebarButton
            icon={<Wallet size={20} />}
            label="Add Expenses"
            onClick={() =>
              router.push("/expenses")
            }
          />

          <SidebarButton
            icon={<Trophy size={20} />}
            label="Daily Challenge"
            onClick={() =>
              setShowChallengeForm(true)
            }
          />

          <SidebarButton
            icon={<BarChart3 size={20} />}
            label="View Reports"
            onClick={() =>
              router.push("/reports")
            }
          />
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="min-h-screen sm:ml-72">

        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-8">
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setOpenSidebar(true)
                }
                className="rounded-xl bg-slate-950 p-2 text-white sm:hidden"
              >
                <Menu size={22} />
              </button>

              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  <span className="text-orange-500">
                    Sales
                  </span>{" "}
                  Dashboard
                </h1>

                <p className="text-xs text-slate-500 sm:text-sm">
                  Welcome back 👋, manage your daily sales
                </p>
              </div>
            </div>

            <select
              value={filter}
              onChange={(e) => {
                setFilter(
                  e.target.value as
                    | "today"
                    | "week"
                    | "month"
                    | "all"
                );

                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
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
                All
              </option>
            </select>
          </div>
        </header>

        <div className="p-4 sm:p-8">

          {/* STATS */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <StatCard
              title="Total Sales"
              value={`₦${totalToday.toLocaleString()}`}
              color="orange"
            />

            <StatCard
              title="Transactions"
              value={totalTransactions.toString()}
              color="blue"
            />

            <StatCard
              title="Total Records"
              value={filteredSales.length.toString()}
              color="purple"
            />

            <StatCard
              title="POS Amount"
              value={`₦${totalPOSAmount.toLocaleString()}`}
              color="blue"
            />

            <StatCard
              title="POS Charges"
              value={`₦${totalPOSCharges.toLocaleString()}`}
              color="orange"
            />
          </div>

          {/* DAILY CHALLENGE */}
          <section className="mb-8 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                  <Trophy size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Daily Challenge
                  </h2>

                  <p className="text-xs text-slate-500">
                    Sales team challenge
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setShowChallengeForm(
                    !showChallengeForm
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                <PlusCircle size={18} />
                Post Challenge
              </button>
            </div>

            {/* CHALLENGE FORM */}
            {showChallengeForm && (
              <form
                onSubmit={
                  handleCreateChallenge
                }
                className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Challenge Title
                  </label>

                  <input
                    type="text"
                    value={
                      challengeTitle
                    }
                    onChange={(e) =>
                      setChallengeTitle(
                        e.target.value
                      )
                    }
                    placeholder="Enter challenge title"
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={
                      challengeDescription
                    }
                    onChange={(e) =>
                      setChallengeDescription(
                        e.target.value
                      )
                    }
                    placeholder="Describe today's challenge..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                {challengeMessage && (
                  <p className="mb-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-600">
                    {challengeMessage}
                  </p>
                )}

                <div className="flex gap-3">

                  <button
                    type="submit"
                    disabled={
                      challengeLoading
                    }
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={18} />

                    {challengeLoading
                      ? "Posting..."
                      : "Post Challenge"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowChallengeForm(
                        false
                      );

                      setChallengeMessage(
                        ""
                      );
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* LATEST CHALLENGE */}
            {latestChallenge ? (
              <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-5">

                <div className="flex items-start gap-4">

                  <div className="hidden rounded-xl bg-orange-500 p-3 text-white sm:block">
                    <Trophy size={24} />
                  </div>

                  <div className="flex-1">

                    <h3 className="text-lg font-bold text-slate-800">
                      {
                        latestChallenge.title
                      }
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {
                        latestChallenge.description
                      }
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">

                      <span>
                        Posted by:{" "}
                        <span className="font-medium text-slate-600">
                          {
                            latestChallenge
                              .createdBy
                              ?.email ||
                            "Unknown"
                          }
                        </span>
                      </span>

                      <span>
                        {new Date(
                          latestChallenge.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                <Trophy
                  size={40}
                  className="mx-auto mb-3 text-slate-300"
                />

                <h3 className="font-semibold text-slate-700">
                  No Daily Challenge
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Be the first to post today&apos;s challenge.
                </p>
              </div>
            )}
          </section>

          {/* QUICK ACTIONS */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <h2 className="mb-5 text-lg font-bold text-slate-800">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <ActionButton
                icon={
                  <ShoppingCart size={20} />
                }
                label="Record Sale"
                className="bg-orange-50 text-orange-600 hover:bg-orange-100"
                onClick={() =>
                  router.push(
                    "/sales/add"
                  )
                }
              />

              <ActionButton
                icon={
                  <BarChart3 size={20} />
                }
                label="View Reports"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                onClick={() =>
                  router.push(
                    "/reports"
                  )
                }
              />

              <ActionButton
                icon={
                  <Wallet size={20} />
                }
                label="Manage Expenses"
                className="bg-purple-50 text-purple-600 hover:bg-purple-100"
                onClick={() =>
                  router.push(
                    "/expenses"
                  )
                }
              />

              <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-4 text-slate-500">
                📦 Inventory
                <span className="text-xs">
                  Coming Soon
                </span>
              </div>
            </div>
          </section>

          {/* RECENT SALES */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <h2 className="mb-5 text-lg font-bold text-slate-800">
              Recent Sales
            </h2>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                placeholder="Search sales..."
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-orange-500"
              />
            </div>

            {filteredSales.length ===
            0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No sales recorded yet...
              </p>
            ) : (
              <>
                <div className="space-y-3">

                  {paginatedSales.map(
                    (sale) => (
                      <div
                        key={sale._id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-orange-300 hover:bg-orange-50 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div>
                          <p className="font-bold text-orange-500">
                            ₦
                            {sale.totalSales.toLocaleString()}
                          </p>

                          <p className="text-xs text-slate-500 sm:text-sm">
                            {new Date(
                              sale.date
                            ).toLocaleString()}
                          </p>
                        </div>

                        <p className="break-all text-xs text-slate-600 sm:text-sm">
                          {sale.recordedBy
                            ?.email ||
                            "Unknown"}
                        </p>
                      </div>
                    )
                  )}
                </div>

                {/* SALES PAGINATION */}
                <div className="mt-6 flex items-center justify-between">

                  <button
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.max(
                            prev - 1,
                            1
                          )
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <span className="text-sm text-slate-500">
                    Page{" "}
                    {currentPage} of{" "}
                    {totalPages || 1}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.min(
                            prev + 1,
                            totalPages
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>

          {/* POS TRANSACTIONS */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            {/* HEADER */}
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    POS Transactions
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your recorded POS transactions
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">

                <span className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-600">
                  Amount: ₦
                  {totalPOSAmount.toLocaleString()}
                </span>

                <span className="rounded-lg bg-green-50 px-3 py-2 font-medium text-green-600">
                  Charges: ₦
                  {totalPOSCharges.toLocaleString()}
                </span>
              </div>
            </div>

            {/* SEARCH & DATE */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                placeholder="Search POS transactions..."
                value={posSearch}
                onChange={(e) => {
                  setPosSearch(
                    e.target.value
                  );

                  setPosCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <input
                type="date"
                value={posDateFilter}
                onChange={(e) => {
                  setPosDateFilter(
                    e.target.value
                  );

                  setPosCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* POS TRANSACTIONS LIST */}
            {filteredPOSTransactions.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">

                <CreditCard
                  size={40}
                  className="mx-auto mb-3 text-slate-300"
                />

                <h3 className="font-semibold text-slate-700">
                  No POS transactions
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Your POS transactions will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">

                  {paginatedPOSTransactions.map(
                    (transaction) => (
                      <div
                        key={transaction._id}
                        className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          {/* LEFT */}
                          <div className="flex items-center gap-3">

                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                              <CreditCard size={20} />
                            </div>

                            <div>
                              <p className="font-bold capitalize text-slate-800">
                                {
                                  transaction.type
                                }
                              </p>

                              <p className="text-xs text-slate-500">
                                {
                                  transaction.date
                                }
                              </p>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="text-left sm:text-right">

                            <p className="font-bold text-blue-600">
                              ₦
                              {transaction.amount.toLocaleString()}
                            </p>

                            <p className="text-sm font-medium text-green-600">
                              Charge: ₦
                              {transaction.charge.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* DETAILS */}
                        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:grid-cols-3">

                          <div>
                            <span className="font-medium text-slate-700">
                              Transaction:
                            </span>{" "}
                            <span className="capitalize">
                              {
                                transaction.type
                              }
                            </span>
                          </div>

                          <div>
                            <span className="font-medium text-slate-700">
                              Amount:
                            </span>{" "}
                            ₦
                            {transaction.amount.toLocaleString()}
                          </div>

                          <div>
                            <span className="font-medium text-slate-700">
                              Charge:
                            </span>{" "}
                            ₦
                            {transaction.charge.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* POS PAGINATION */}
                <div className="mt-6 flex items-center justify-between">

                  <button
                    onClick={() =>
                      setPosCurrentPage(
                        (prev) =>
                          Math.max(
                            prev - 1,
                            1
                          )
                      )
                    }
                    disabled={
                      posCurrentPage === 1
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <span className="text-sm text-slate-500">
                    Page{" "}
                    {posCurrentPage} of{" "}
                    {posTotalPages || 1}
                  </span>

                  <button
                    onClick={() =>
                      setPosCurrentPage(
                        (prev) =>
                          Math.min(
                            prev + 1,
                            posTotalPages || 1
                          )
                      )
                    }
                    disabled={
                      posCurrentPage ===
                        posTotalPages ||
                      posTotalPages === 0
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// =========================
// SIDEBAR BUTTON
// =========================
function SidebarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-orange-500 hover:text-white"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// =========================
// STAT CARD
// =========================
function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    orange:
      "bg-orange-50 text-orange-500",
    blue:
      "bg-blue-50 text-blue-600",
    purple:
      "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div
        className={`mb-4 inline-flex rounded-xl p-3 ${colors[color]}`}
      >
        <BarChart3 size={22} />
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2
        className={`mt-1 text-2xl font-bold ${
          colors[color].split(" ")[1]
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

// =========================
// ACTION BUTTON
// =========================
function ActionButton({
  icon,
  label,
  className,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl p-4 font-medium transition ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}