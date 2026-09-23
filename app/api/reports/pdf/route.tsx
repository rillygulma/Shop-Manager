import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import POSTransaction from "@/models/POSTransaction";
import User from "@/models/User";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import ReportPDF from "@/components/reports/ReportPDF";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// TYPES
// =====================================================

type RecordedBy = {
  email?: string;
  fullName?: string;
  role?: string;
} | null;

type SaleDocument = {
  totalSales?: number;
  computer?: {
    typing?: number;
    printing?: number;
    photocopying?: number;
    browsing?: number;
  };
  drinks?: {
    coke?: number;
    water?: number;
  };
  recordedBy?: RecordedBy;
  createdAt: Date | string;
};

type ExpenseDocument = {
  fuel?: number;
  internet?: number;
  other?: number;
  total?: number;
  createdAt: Date | string;
};

type POSTransactionDocument = {
  amount?: number;
  charge?: number;
  recordedBy?: RecordedBy;
  createdAt: Date | string;
};

// =====================================================
// GET REPORT PDF
// =====================================================

export async function GET(req: Request) {
  try {
    // ===================================================
    // DATABASE
    // ===================================================

    await connectDB();

    // Make sure User model is registered
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

    // ---------------------------------------------------
    // CUSTOM DATE RANGE
    // ---------------------------------------------------

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
      // -------------------------------------------------
      // PREDEFINED FILTERS
      // -------------------------------------------------

      if (filter === "today") {
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
      } else if (filter === "week") {
        startDate = new Date();

        startDate.setDate(
          now.getDate() - 7,
        );

        endDate = new Date();

        endDate.setHours(
          23,
          59,
          59,
          999,
        );
      } else if (filter === "month") {
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
      } else {
        // ALL RECORDS
        startDate = new Date(0);

        endDate = new Date();

        endDate.setHours(
          23,
          59,
          59,
          999,
        );
      }
    }

    // ===================================================
    // FETCH DATA
    // ===================================================

    const [
      sales,
      expenses,
      posTransactions,
    ] = await Promise.all([
      Sale.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate(
          "recordedBy",
          "email fullName role",
        )
        .sort({
          createdAt: -1,
        })
        .lean() as unknown as Promise<
        SaleDocument[]
      >,

      Expense.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({
          createdAt: -1,
        })
        .lean() as unknown as Promise<
        ExpenseDocument[]
      >,

      POSTransaction.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate(
          "recordedBy",
          "email fullName role",
        )
        .sort({
          createdAt: -1,
        })
        .lean() as unknown as Promise<
        POSTransactionDocument[]
      >,
    ]);

    // ===================================================
    // REPORT STRUCTURE
    // ===================================================

    let totalSales = 0;

    let salesRecordsTotal = 0;

    let totalPOSAmount = 0;

    let totalPOSCharges = 0;

    let totalExpenses = 0;

    // ===================================================
    // COMPUTER SERVICES
    // ===================================================

    const computer = {
      typing: 0,
      printing: 0,
      photocopying: 0,
      browsing: 0,
    };

    // ===================================================
    // POS
    // ===================================================

    const pos = {
      amount: 0,
      charges: 0,
    };

    // ===================================================
    // DRINKS
    // ===================================================

    const drinks = {
      coke: 0,
      water: 0,
    };

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
    // STAFF
    // ===================================================

    const staff: Record<
      string,
      number
    > = {};

    // ===================================================
    // DAILY
    // ===================================================

    const daily: Record<
      string,
      number
    > = {};

    // ===================================================
    // PROCESS SALES
    // ===================================================

    sales.forEach((sale) => {
      const saleAmount =
        Number(sale.totalSales) || 0;

      // -------------------------------------------------
      // SALES RECORD TOTAL
      // -------------------------------------------------

      salesRecordsTotal +=
        saleAmount;

      // -------------------------------------------------
      // COMPUTER SERVICES
      // -------------------------------------------------

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

      // -------------------------------------------------
      // DRINKS
      // -------------------------------------------------

      drinks.coke +=
        Number(
          sale.drinks?.coke,
        ) || 0;

      drinks.water +=
        Number(
          sale.drinks?.water,
        ) || 0;

      // -------------------------------------------------
      // STAFF
      // -------------------------------------------------

      const email =
        sale.recordedBy?.email ||
        "unknown";

      staff[email] =
        (staff[email] || 0) +
        saleAmount;

      // -------------------------------------------------
      // DAILY SALES
      // -------------------------------------------------

      if (sale.createdAt) {
        const day =
          new Date(
            sale.createdAt,
          ).toDateString();

        daily[day] =
          (daily[day] || 0) +
          saleAmount;
      }
    });

    // ===================================================
    // PROCESS POS TRANSACTIONS
    // ===================================================

    posTransactions.forEach(
      (transaction) => {
        const amount =
          Number(
            transaction.amount,
          ) || 0;

        const charge =
          Number(
            transaction.charge,
          ) || 0;

        // ------------------------------------------------
        // POS AMOUNT
        // ------------------------------------------------

        totalPOSAmount +=
          amount;

        pos.amount +=
          amount;

        // ------------------------------------------------
        // POS CHARGES
        // ------------------------------------------------

        totalPOSCharges +=
          charge;

        pos.charges +=
          charge;

        // ------------------------------------------------
        // STAFF PERFORMANCE
        // ------------------------------------------------

        const email =
          transaction.recordedBy
            ?.email ||
          "unknown";

        staff[email] =
          (staff[email] || 0) +
          amount +
          charge;

        // ------------------------------------------------
        // DAILY SALES
        // ------------------------------------------------

        if (
          transaction.createdAt
        ) {
          const day =
            new Date(
              transaction.createdAt,
            ).toDateString();

          daily[day] =
            (daily[day] || 0) +
            amount +
            charge;
        }
      },
    );

    // ===================================================
    // TOTAL SALES
    // ===================================================

    totalSales =
      salesRecordsTotal +
      totalPOSAmount +
      totalPOSCharges;

    // ===================================================
    // PROCESS EXPENSES
    // ===================================================

    expenses.forEach(
      (expense) => {
        const fuel =
          Number(
            expense.fuel,
          ) || 0;

        const internet =
          Number(
            expense.internet,
          ) || 0;

        const other =
          Number(
            expense.other,
          ) || 0;

        const total =
          Number(
            expense.total,
          ) || 0;

        expenseDetails.fuel +=
          fuel;

        expenseDetails.internet +=
          internet;

        expenseDetails.other +=
          other;

        totalExpenses +=
          total;
      },
    );

    expenseDetails.total =
      totalExpenses;

    // ===================================================
    // TOTAL TRANSACTIONS
    // ===================================================

    const totalTransactions =
      sales.length +
      posTransactions.length;

    // ===================================================
    // AVERAGE SALE
    // ===================================================

    const averageSale =
      totalTransactions > 0
        ? totalSales /
          totalTransactions
        : 0;

    // ===================================================
    // PROFIT
    // =====================================================

    const profit =
      totalSales -
      totalExpenses;

    // ===================================================
    // CATEGORY TOTALS
    // ===================================================

    const computerTotal =
      computer.typing +
      computer.printing +
      computer.photocopying +
      computer.browsing;

    const posTotal =
      totalPOSAmount +
      totalPOSCharges;

    const drinksTotal =
      drinks.coke +
      drinks.water;

    const categories = [
      {
        name: "Computer",
        value: computerTotal,
      },
      {
        name: "POS",
        value: posTotal,
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
    // GENERATE PDF
    // ===================================================

    const document = (
      <ReportPDF
        startDate={startDate}
        endDate={endDate}

        // Financial Summary
        totalSales={totalSales}
        totalExpenses={
          totalExpenses
        }
        profit={profit}
        averageSale={
          averageSale
        }
        totalTransactions={
          totalTransactions
        }

        // Sales Breakdown
        computer={computer}
        pos={pos}
        drinks={drinks}

        // Expenses
        expenses={
          expenseDetails
        }

        // Staff
        staff={staff}

        // Daily Sales
        daily={daily}

        // Categories
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
    // =====================================================

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