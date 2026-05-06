import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  await connectDB();

  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return Response.json({ error: "No token" }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user || typeof user === "string") {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const filter = searchParams.get("filter") || "today";
    const startDateQuery = searchParams.get("startDate");
    const endDateQuery = searchParams.get("endDate");

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    // ✅ PRIORITY: Custom date range (calendar)
    if (startDateQuery && endDateQuery) {
      startDate = new Date(startDateQuery);
      endDate = new Date(endDateQuery);

      // include full end day
      endDate.setHours(23, 59, 59, 999);

      // optional validation
      if (startDate > endDate) {
        return Response.json(
          { error: "Invalid date range" },
          { status: 400 }
        );
      }
    } else {
      // ✅ fallback to filter
      if (filter === "today") {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      } else if (filter === "week") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
      } else if (filter === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        startDate = new Date(0); // all time
      }
    }

    // ✅ Fetch Data
    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("recordedBy", "email");

    const expenses = await Expense.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const report = {
      totalSales: 0,
      totalExpenses: 0,
      totalTransactions: sales.length,
      averageSale: 0,

      computer: { typing: 0, printing: 0, browsing: 0 },
      pos: { charges: 0 },
      drinks: { coke: 0, water: 0 },

      staff: {} as Record<string, number>,
      daily: {} as Record<string, number>,
    };

    // ✅ Process Sales
    sales.forEach((s) => {
      report.totalSales += s.totalSales || 0;

      report.computer.typing += s.computer?.typing || 0;
      report.computer.printing += s.computer?.printing || 0;
      report.computer.browsing += s.computer?.browsing || 0;

      report.pos.charges += s.pos?.charges || 0;

      report.drinks.coke += s.drinks?.coke || 0;
      report.drinks.water += s.drinks?.water || 0;

      // staff performance
      const email = s.recordedBy?.email || "unknown";
      report.staff[email] = (report.staff[email] || 0) + s.totalSales;

      // daily trend
      const day = new Date(s.createdAt).toDateString();
      report.daily[day] = (report.daily[day] || 0) + s.totalSales;
    });

    // ✅ Process Expenses
    expenses.forEach((e) => {
      report.totalExpenses += e.total || 0;
    });

    report.averageSale =
      sales.length > 0 ? report.totalSales / sales.length : 0;

    const profit = report.totalSales - report.totalExpenses;

    // ✅ Top Category
    const categories = [
      {
        name: "Computer",
        value:
          report.computer.typing +
          report.computer.printing +
          report.computer.browsing,
      },
      { name: "POS", value: report.pos.charges },
      {
        name: "Drinks",
        value: report.drinks.coke + report.drinks.water,
      },
    ];

    const topCategory = categories.sort((a, b) => b.value - a.value)[0];

    return Response.json({
      ...report,
      profit,
      topCategory,
    });
  } catch (error) {
    console.error("REPORT ERROR:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}