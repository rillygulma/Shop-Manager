"use client";

import {
  ArrowLeft,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ReportData = {
  totalSales: number;
  salesRecordsTotal: number;
  totalPOSAmount: number;
  totalPOSCharges: number;
  totalExpenses: number;
  profit: number;
  totalTransactions: number;

  salesCount?: number;
  posTransactionCount?: number;
  expenseCount?: number;

  topCategory?: {
    name: string;
    value: number;
  };

  computer?: {
    typing: number;
    printing: number;
    photocopying: number;
    browsing: number;
  };

  pos?: {
    amount: number;
    charges: number;
  };

  drinks?: {
    coke: number;
    water: number;
  };

  staff?: Record<string, number>;

  daily?: Record<string, number>;

  posTransactions?: POSTransaction[];
};

type POSTransaction = {
  _id: string;
  date: string;
  type:
    | "withdrawal"
    | "deposit"
    | "transfer"
    | "airtime"
    | "data"
    | "other";
  amount: number;
  charge: number;
  recordedBy?: {
    fullName?: string;
    email?: string;
    role?: string;
  };
  createdAt?: string;
};

type CardProps = {
  title: string;
  value: number | string;
  color: "green" | "red" | "purple" | "blue" | "orange";
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export default function ReportPage() {
  const [data, setData] =
    useState<ReportData | null>(null);

  const [filter, setFilter] = useState<
    "today" | "week" | "month" | "all"
  >("today");

  const [loading, setLoading] =
    useState(true);

  const [pdfLoading, setPdfLoading] =
    useState(false);

  const [error, setError] =
    useState<string>("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const router = useRouter();

  // =========================================================
  // FETCH REPORT
  // =========================================================

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `/api/reports?filter=${filter}`;

      if (startDate && endDate) {
        url =
          `/api/reports?startDate=${encodeURIComponent(
            startDate,
          )}&endDate=${encodeURIComponent(
            endDate,
          )}`;
      }

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(
          "Failed to fetch report",
        );
      }

      const json: ReportData =
        await res.json();

      setData(json);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH REPORT WHEN FILTER CHANGES
  // =========================================================

  useEffect(() => {
    fetchReport();
  }, [filter]);

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = async () => {
    try {
      if (
        (startDate && !endDate) ||
        (!startDate && endDate)
      ) {
        alert(
          "Please select both start date and end date.",
        );
        return;
      }

      if (
        startDate &&
        endDate &&
        startDate > endDate
      ) {
        alert(
          "Start date cannot be after end date.",
        );
        return;
      }

      setPdfLoading(true);

      const params =
        new URLSearchParams();

      if (startDate && endDate) {
        params.set(
          "startDate",
          startDate,
        );

        params.set(
          "endDate",
          endDate,
        );

        params.set(
          "filter",
          "custom",
        );
      } else {
        params.set(
          "filter",
          filter,
        );
      }

      const url =
        `/api/reports/pdf?${params.toString()}`;

      const response =
        await fetch(url, {
          method: "GET",
          credentials: "include",
        });

      if (!response.ok) {
        let errorMessage =
          "Failed to generate PDF report.";

        try {
          const errorData =
            await response.json();

          if (errorData?.error) {
            errorMessage =
              errorData.error;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(
          errorMessage,
        );
      }

      const blob =
        await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href = downloadUrl;

      if (
        startDate &&
        endDate
      ) {
        link.download =
          `business-report-${startDate}-to-${endDate}.pdf`;
      } else {
        const today =
          new Date()
            .toISOString()
            .split("T")[0];

        link.download =
          `business-report-${filter}-${today}.pdf`;
      }

      document.body.appendChild(
        link,
      );

      link.click();
      link.remove();

      window.URL.revokeObjectURL(
        downloadUrl,
      );
    } catch (error) {
      console.error(
        "PDF DOWNLOAD ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to download PDF report.",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />

          <p className="text-gray-600">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-5">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-red-500">
            {error}
          </p>

          <button
            onClick={fetchReport}
            className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen space-y-6 bg-gray-100 p-5">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              router.back()
            }
            className="rounded-lg bg-gray-100 p-2 text-amber-600 shadow-sm transition hover:bg-gray-200"
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-amber-600">
              Sales Report
            </h1>

            <p className="text-sm text-gray-500">
              Sales, POS, expenses and
              performance overview
            </p>
          </div>
        </div>

        {/* ===================================================
            FILTERS + PDF
        ==================================================== */}

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => {
              setStartDate("");
              setEndDate("");

              setFilter(
                e.target.value as typeof filter,
              );
            }}
            className="rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          >
            <option value="today">
              Today
            </option>

            <option value="week">
              Week
            </option>

            <option value="month">
              Month
            </option>

            <option value="all">
              All
            </option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setFilter("all");
              setStartDate(
                e.target.value,
              );
            }}
            className="rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setFilter("all");
              setEndDate(
                e.target.value,
              );
            }}
            className="rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />

          <button
            onClick={fetchReport}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Apply
          </button>

          <button
            onClick={downloadPDF}
            disabled={pdfLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pdfLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                Generating...
              </>
            ) : (
              <>
                <Download size={17} />

                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          REPORT PERIOD
      ====================================================== */}

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">
            Report:
          </span>{" "}

          {startDate && endDate
            ? `${startDate} → ${endDate}`
            : filter === "today"
              ? "Today"
              : filter === "week"
                ? "Last 7 Days"
                : filter === "month"
                  ? "This Month"
                  : "All Records"}
        </p>
      </div>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Card
          title="Total Sales"
          value={
            data?.totalSales ?? 0
          }
          color="green"
        />

        <Card
          title="Sales Records"
          value={
            data?.salesRecordsTotal ?? 0
          }
          color="blue"
        />

        <Card
          title="POS Amount"
          value={
            data?.totalPOSAmount ?? 0
          }
          color="orange"
        />

        <Card
          title="POS Charges"
          value={
            data?.totalPOSCharges ?? 0
          }
          color="purple"
        />

        <Card
          title="Expenses"
          value={
            data?.totalExpenses ?? 0
          }
          color="red"
        />

        <Card
          title="Profit"
          value={
            data?.profit ?? 0
          }
          color="purple"
        />
      </div>

      {/* =====================================================
          TRANSACTION SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard
          title="Total Transactions"
          value={
            data?.totalTransactions ?? 0
          }
        />

        <SummaryCard
          title="Sales Records"
          value={
            data?.salesCount ?? 0
          }
        />

        <SummaryCard
          title="POS Transactions"
          value={
            data?.posTransactionCount ?? 0
          }
        />

        <SummaryCard
          title="Expenses"
          value={
            data?.expenseCount ?? 0
          }
        />
      </div>

      {/* =====================================================
          TOP CATEGORY
      ====================================================== */}

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-1 font-semibold text-amber-600">
          Top Category
        </h2>

        <p className="text-lg font-bold text-green-600">
          {data?.topCategory?.name ||
            "N/A"}{" "}

          (
          {formatCurrency(
            data?.topCategory
              ?.value ?? 0,
          )}
          )
        </p>
      </div>

      {/* =====================================================
          BREAKDOWN
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Computer */}

        <Section title="Computer">
          <ReportRow
            label="Typing"
            value={
              data?.computer
                ?.typing ?? 0
            }
          />

          <ReportRow
            label="Printing"
            value={
              data?.computer
                ?.printing ?? 0
            }
          />

          <ReportRow
            label="Photocopying"
            value={
              data?.computer
                ?.photocopying ?? 0
            }
          />

          <ReportRow
            label="Browsing"
            value={
              data?.computer
                ?.browsing ?? 0
            }
          />
        </Section>

        {/* POS */}

        <Section title="POS">
          <ReportRow
            label="Transaction Amount"
            value={
              data?.pos?.amount ?? 0
            }
          />

          <ReportRow
            label="Service Charges"
            value={
              data?.pos?.charges ?? 0
            }
          />

          <ReportRow
            label="Total POS Value"
            value={
              (data?.pos?.amount ?? 0) +
              (data?.pos?.charges ?? 0)
            }
          />
        </Section>

        {/* Drinks */}

        <Section title="Drinks">
          <ReportRow
            label="Coke"
            value={
              data?.drinks?.coke ?? 0
            }
          />

          <ReportRow
            label="Water"
            value={
              data?.drinks?.water ?? 0
            }
          />

          <ReportRow
            label="Total Drinks"
            value={
              (data?.drinks?.coke ?? 0) +
              (data?.drinks?.water ?? 0)
            }
          />
        </Section>
      </div>

      {/* =====================================================
          POS TRANSACTIONS
      ====================================================== */}

      <div className="rounded-xl bg-white p-4 shadow">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-amber-600">
              POS Transactions
            </h2>

            <p className="text-sm text-gray-500">
              Detailed POS transactions for
              the selected period
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
            {data?.posTransactionCount ?? 0}{" "}
            transactions
          </div>
        </div>

        {!data?.posTransactions ||
        data.posTransactions.length === 0 ? (
          <div className="rounded-lg bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm text-gray-500">
              No POS transactions found
              for this period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-3 font-semibold text-gray-600">
                    Date
                  </th>

                  <th className="px-3 py-3 font-semibold text-gray-600">
                    Type
                  </th>

                  <th className="px-3 py-3 font-semibold text-gray-600">
                    Amount
                  </th>

                  <th className="px-3 py-3 font-semibold text-gray-600">
                    Charge
                  </th>

                  <th className="px-3 py-3 font-semibold text-gray-600">
                    Total
                  </th>

                  <th className="px-3 py-3 font-semibold text-gray-600">
                    Recorded By
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.posTransactions.map(
                  (transaction) => (
                    <tr
                      key={transaction._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-3 py-3 text-gray-600">
                        {transaction.date}
                      </td>

                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                          {transaction.type}
                        </span>
                      </td>

                      <td className="px-3 py-3 font-medium text-gray-800">
                        {formatCurrency(
                          transaction.amount,
                        )}
                      </td>

                      <td className="px-3 py-3 font-medium text-green-600">
                        {formatCurrency(
                          transaction.charge,
                        )}
                      </td>

                      <td className="px-3 py-3 font-bold text-gray-900">
                        {formatCurrency(
                          transaction.amount +
                            transaction.charge,
                        )}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {transaction.recordedBy
                          ?.fullName ||
                          transaction.recordedBy
                            ?.email ||
                          "Unknown"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          STAFF PERFORMANCE
      ====================================================== */}

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold text-amber-600">
          Staff Performance
        </h2>

        {Object.entries(
          data?.staff || {},
        ).length === 0 ? (
          <p className="text-sm text-gray-500">
            No staff performance
            data available.
          </p>
        ) : (
          <div className="space-y-2">
            {Object.entries(
              data?.staff || {},
            )
              .sort(
                ([, a], [, b]) =>
                  b - a,
              )
              .map(
                (
                  [email, value],
                  index,
                ) => (
                  <div
                    key={email}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                        {index + 1}
                      </span>

                      <span className="text-gray-700">
                        {email}
                      </span>
                    </div>

                    <span className="font-bold text-gray-900">
                      {formatCurrency(
                        value,
                      )}
                    </span>
                  </div>
                ),
              )}
          </div>
        )}
      </div>

      {/* =====================================================
          DAILY SALES
      ====================================================== */}

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold text-amber-600">
          Daily Sales
        </h2>

        {!data?.daily ||
        Object.keys(data.daily)
          .length === 0 ? (
          <p className="text-sm text-gray-500">
            No daily sales data
            available.
          </p>
        ) : (
          <div className="space-y-2">
            {Object.entries(
              data.daily,
            )
              .sort(
                ([dateA], [dateB]) =>
                  new Date(
                    dateB,
                  ).getTime() -
                  new Date(
                    dateA,
                  ).getTime(),
              )
              .map(
                ([date, value]) => (
                  <div
                    key={date}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3"
                  >
                    <span className="text-sm text-gray-600">
                      {date}
                    </span>

                    <span className="font-bold text-green-600">
                      {formatCurrency(
                        value,
                      )}
                    </span>
                  </div>
                ),
              )}
          </div>
        )}
      </div>

      {/* =====================================================
          PDF INFORMATION
      ====================================================== */}

      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <Download
            size={20}
            className="mt-0.5 text-red-900"
          />

          <div>
            <h3 className="font-semibold text-red-900">
              Full PDF Report
            </h3>

            <p className="mt-1 text-sm text-red-800">
              Download a complete financial
              report containing sales records,
              POS transaction amounts and
              charges, expenses, category
              breakdown, staff performance,
              daily sales, detailed POS
              transactions and final
              profit/loss.
            </p>

            <button
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
            >
              <Download size={16} />

              {pdfLoading
                ? "Generating PDF..."
                : "Download Full Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// KPI CARD
// =========================================================

function Card({
  title,
  value,
  color,
  currency = true,
}: CardProps & {
  currency?: boolean;
}) {
  const colorMap: Record<
    CardProps["color"],
    string
  > = {
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2
        className={`mt-1 text-xl font-bold ${colorMap[color]}`}
      >
        {currency ? "₦" : ""}

        {Number(value).toLocaleString(
          "en-NG",
        )}
      </h2>
    </div>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-800">
        {value.toLocaleString("en-NG")}
      </p>
    </div>
  );
}

// =========================================================
// SECTION
// =========================================================

function Section({
  title,
  children,
}: SectionProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-3 font-semibold text-amber-600">
        {title}
      </h2>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

// =========================================================
// REPORT ROW
// =========================================================

function ReportRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm last:border-0">
      <span className="text-gray-600">
        {label}
      </span>

      <span className="font-semibold text-gray-900">
        {formatCurrency(value)}
      </span>
    </div>
  );
}

// =========================================================
// CURRENCY FORMATTER
// =========================================================

function formatCurrency(
  value: number,
) {
  return `₦${Number(
    value,
  ).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}