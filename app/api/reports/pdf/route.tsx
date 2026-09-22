import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import User from "@/models/User";
import Expense from "@/models/Expense";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import ReportPDF from "@/components/reports/ReportPDF";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// TYPES
// =====================================================

type SaleDocument = {
  totalSales?: number;

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

  recordedBy?: {
    email?: string;
  } | null;

  createdAt: Date | string;
};

type ExpenseDocument = {
  fuel?: number;
  internet?: number;
  other?: number;
  total?: number;
  createdAt: Date | string;
};

// =====================================================
// GET REPORT
// =====================================================

export async function GET(req: Request) {
  try {
    // ===================================================
    // DATABASE
    // ===================================================

    await connectDB();

    // ===================================================
    // REGISTER USER MODEL
    // ===================================================

    // This ensures the User model is registered before
    // Sale.populate("recordedBy") is executed.
    void User;

    // ===================================================
    // AUTHENTICATION
    // ===================================================

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
        {
          error: "No token",
        },
        {
          status: 401,
        },
      );
    }

    const user = await verifyToken(token);

    if (!user || typeof user === "string") {
      return Response.json(
        {
          error: "Invalid token",
        },
        {
          status: 401,
        },
      );
    }

    // ===================================================
    // QUERY PARAMETERS
    // ===================================================

    const { searchParams } = new URL(req.url);

    const filter =
      searchParams.get("filter") || "today";

    const startDateQuery =
      searchParams.get("startDate");

    const endDateQuery =
      searchParams.get("endDate");

    // ===================================================
    // DATE RANGE
    // ===================================================

    const now = new Date();

    let startDate: Date;
    let endDate: Date;

    if (startDateQuery && endDateQuery) {
      startDate = new Date(startDateQuery);
      endDate = new Date(endDateQuery);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        return Response.json(
          {
            error: "Invalid date range",
          },
          {
            status: 400,
          },
        );
      }

      startDate.setHours(
        0,
        0,
        0,
        0,
      );

      endDate.setHours(
        23,
        59,
        59,
        999,
      );

      if (startDate > endDate) {
        return Response.json(
          {
            error:
              "Start date cannot be after end date",
          },
          {
            status: 400,
          },
        );
      }
    } else {
      switch (filter) {
        // ===============================================
        // TODAY
        // ===============================================

        case "today": {
          startDate = new Date();

          startDate.setHours(
            0,
            0,
            0,
            0,
          );

          endDate = new Date();

          endDate.setHours(
            23,
            59,
            59,
            999,
          );

          break;
        }

        // ===============================================
        // LAST 7 DAYS
        // ===============================================

        case "week": {
          startDate = new Date();

          startDate.setDate(
            now.getDate() - 7,
          );

          startDate.setHours(
            0,
            0,
            0,
            0,
          );

          endDate = new Date();

          endDate.setHours(
            23,
            59,
            59,
            999,
          );

          break;
        }

        // ===============================================
        // CURRENT MONTH
        // ===============================================

        case "month": {
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
          );

          startDate.setHours(
            0,
            0,
            0,
            0,
          );

          endDate = new Date();

          endDate.setHours(
            23,
            59,
            59,
            999,
          );

          break;
        }

        // ===============================================
        // ALL
        // ===============================================

        case "all":
        default: {
          startDate = new Date(0);

          endDate = new Date();

          endDate.setHours(
            23,
            59,
            59,
            999,
          );

          break;
        }
      }
    }

    // ===================================================
    // FETCH SALES
    // ===================================================

    const sales =
      (await Sale.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate({
          path: "recordedBy",
          select: "email",
          model: User,
        })
        .sort({
          createdAt: 1,
        })
        .lean()) as unknown as SaleDocument[];

    // ===================================================
    // FETCH EXPENSES
    // ===================================================

    const expenses =
      (await Expense.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({
          createdAt: 1,
        })
        .lean()) as unknown as ExpenseDocument[];

    // ===================================================
    // INITIAL VALUES
    // ===================================================

    let totalSales = 0;
    let totalExpenses = 0;

    // ===================================================
    // EXPENSE DETAILS
    // ===================================================

    const expenseDetails = {
      fuel: 0,
      internet: 0,
      other: 0,
      total: 0,
    };

    // ===================================================
    // SALES BREAKDOWN
    // ===================================================

    const computer = {
      typing: 0,
      printing: 0,
      photocopying: 0,
      browsing: 0,
    };

    const pos = {
      charges: 0,
    };

    const drinks = {
      coke: 0,
      water: 0,
    };

    // ===================================================
    // STAFF & DAILY SALES
    // ===================================================

    const staff: Record<
      string,
      number
    > = {};

    const daily: Record<
      string,
      number
    > = {};

    // ===================================================
    // PROCESS SALES
    // ===================================================

    sales.forEach((sale) => {
      // ===============================================
      // TOTAL SALE
      // ===============================================

      const amount =
        Number(sale.totalSales) || 0;

      totalSales += amount;

      // ===============================================
      // COMPUTER SERVICES
      // ===============================================

      computer.typing +=
        Number(
          sale.computer?.typing,
        ) || 0;

      computer.printing +=
        Number(
          sale.computer?.printing,
        ) || 0;

      computer.photocopying +=
        Number(
          sale.computer?.photocopying,
        ) || 0;

      computer.browsing +=
        Number(
          sale.computer?.browsing,
        ) || 0;

      // ===============================================
      // POS
      // ===============================================

      pos.charges +=
        Number(
          sale.pos?.charges,
        ) || 0;

      // ===============================================
      // DRINKS
      // ===============================================

      drinks.coke +=
        Number(
          sale.drinks?.coke,
        ) || 0;

      drinks.water +=
        Number(
          sale.drinks?.water,
        ) || 0;

      // ===============================================
      // STAFF PERFORMANCE
      // ===============================================

      const email =
        sale.recordedBy?.email ||
        "Unknown Staff";

      staff[email] =
        (staff[email] || 0) +
        amount;

      // ===============================================
      // DAILY SALES
      // ===============================================

      const saleDate = new Date(
        sale.createdAt,
      );

      const date =
        saleDate.toLocaleDateString(
          "en-NG",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          },
        );

      daily[date] =
        (daily[date] || 0) +
        amount;
    });

    // ===================================================
    // PROCESS EXPENSES
    // ===================================================

    expenses.forEach((expense) => {
      // ===============================================
      // EXPENSE CATEGORIES
      // ===============================================

      const fuel =
        Number(expense.fuel) || 0;

      const internet =
        Number(expense.internet) || 0;

      const other =
        Number(expense.other) || 0;

      // ===============================================
      // USE STORED TOTAL
      // ===============================================

      const storedTotal =
        Number(expense.total) || 0;

      // ===============================================
      // ADD EXPENSE DETAILS
      // ===============================================

      expenseDetails.fuel += fuel;

      expenseDetails.internet +=
        internet;

      expenseDetails.other += other;

      // ===============================================
      // TOTAL EXPENSES
      // ===============================================

      totalExpenses += storedTotal;
    });

    // ===================================================
    // SET EXPENSE TOTAL
    // ===================================================

    expenseDetails.total =
      totalExpenses;

    // ===================================================
    // FINANCIAL CALCULATIONS
    // ===================================================

    const profit =
      totalSales -
      totalExpenses;

    const averageSale =
      sales.length > 0
        ? totalSales /
          sales.length
        : 0;

    // ===================================================
    // CATEGORY TOTALS
    // ===================================================

    const computerTotal =
      computer.typing +
      computer.printing +
      computer.photocopying +
      computer.browsing;

    const drinksTotal =
      drinks.coke +
      drinks.water;

    const categories = [
      {
        name: "Computer Services",
        value: computerTotal,
      },

      {
        name: "POS",
        value: pos.charges,
      },

      {
        name: "Drinks",
        value: drinksTotal,
      },
    ].sort(
      (a, b) =>
        b.value - a.value,
    );

    // ===================================================
    // GENERATE PDF DOCUMENT
    // ===================================================

    const document = (
      <ReportPDF
        startDate={startDate}
        endDate={endDate}

        // ===============================================
        // FINANCIAL SUMMARY
        // ===============================================

        totalSales={totalSales}
        totalExpenses={
          totalExpenses
        }

        profit={profit}

        averageSale={
          averageSale
        }

        totalTransactions={
          sales.length
        }

        // ===============================================
        // SALES BREAKDOWN
        // ===============================================

        computer={computer}

        pos={pos}

        drinks={drinks}

        // ===============================================
        // EXPENSE DETAILS
        // ===============================================

        expenses={
          expenseDetails
        }

        // ===============================================
        // STAFF
        // ===============================================

        staff={staff}

        // ===============================================
        // DAILY SALES
        // ===============================================

        daily={daily}

        // ===============================================
        // CATEGORIES
        // ===============================================

        categories={
          categories
        }
      />
    );

    // ===================================================
    // RENDER PDF
    // ===================================================

    const pdfBuffer =
      await renderToBuffer(
        document,
      );

    // ===================================================
    // FILE NAME
    // ===================================================

    const filename =
      `business-report-${startDate
        .toISOString()
        .slice(0, 10)}-to-${endDate
        .toISOString()
        .slice(0, 10)}.pdf`;

    // ===================================================
    // RESPONSE
    // ===================================================

    return new Response(
      new Uint8Array(pdfBuffer),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Content-Length":
            pdfBuffer.length.toString(),

          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    // ===================================================
    // ERROR
    // ===================================================

    console.error(
      "PDF REPORT ERROR:",
      error,
    );

    return Response.json(
      {
        error:
          "Failed to generate PDF report",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}