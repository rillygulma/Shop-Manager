"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ReportData = {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  totalTransactions: number;
  topCategory?: {
    name: string;
    value: number;
  };
  computer?: {
    typing: number;
    printing: number;
    browsing: number;
  };
  pos?: {
    charges: number;
  };
  drinks?: {
    coke: number;
    water: number;
  };
  staff?: Record<string, number>;
};

type CardProps = {
  title: string;
  value: number | string;
  color: "green" | "red" | "purple" | "blue";
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [filter, setFilter] = useState<"today" | "week" | "month" | "all">(
    "today",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `/api/reports?filter=${filter}`;

      if (startDate && endDate) {
        url = `/api/reports?startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch report");
      }

      const json: ReportData = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filter]);

  if (loading) return <p className="p-5">Loading...</p>;
  if (error) return <p className="p-5 text-red-500">{error}</p>;

  return (
    <div className="p-5 space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <button
          onClick={() => router.back()}
          className="p-2 bg-white rounded-lg shadow"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold">Sales Report</h1>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Default Filter */}
          <select
            value={filter}
            onChange={(e) => {
              setStartDate("");
              setEndDate("");
              setFilter(e.target.value as typeof filter);
            }}
            className="border p-2 rounded-lg"
          >
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="all">All</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setFilter("all");
              setStartDate(e.target.value);
            }}
            className="border p-2 rounded-lg"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setFilter("all");
              setEndDate(e.target.value);
            }}
            className="border p-2 rounded-lg"
          />

          {/* Button to trigger */}
          <button
            onClick={fetchReport}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Sales" value={data?.totalSales ?? 0} color="green" />
        <Card title="Expenses" value={data?.totalExpenses ?? 0} color="red" />
        <Card title="Profit" value={data?.profit ?? 0} color="purple" />
        <Card
          title="Transactions"
          value={data?.totalTransactions ?? 0}
          color="blue"
        />
      </div>

      {/* Top Category */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold">Top Category</h2>
        <p className="text-lg font-bold text-green-600">
          {data?.topCategory?.name || "N/A"} (₦{data?.topCategory?.value ?? 0})
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <Section title="Computer">
          <p>Typing: ₦{data?.computer?.typing ?? 0}</p>
          <p>Printing: ₦{data?.computer?.printing ?? 0}</p>
          <p>Browsing: ₦{data?.computer?.browsing ?? 0}</p>
        </Section>

        <Section title="POS">
          <p>Charges: ₦{data?.pos?.charges ?? 0}</p>
        </Section>

        <Section title="Drinks">
          <p>Coke: ₦{data?.drinks?.coke ?? 0}</p>
          <p>Water: ₦{data?.drinks?.water ?? 0}</p>
        </Section>
      </div>

      {/* Staff Performance */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Staff Performance</h2>
        {Object.entries(data?.staff || {}).map(([email, value]) => (
          <div key={email} className="flex justify-between text-sm">
            <span>{email}</span>
            <span className="font-bold">₦{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value, color }: CardProps) {
  const colorMap: Record<CardProps["color"], string> = {
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className={`text-xl font-bold ${colorMap[color]}`}>
        ₦{Number(value).toLocaleString()}
      </h2>
    </div>
  );
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}
