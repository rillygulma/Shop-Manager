import { connectDB } from "@/lib/mongodb";

import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import POSTransaction from "@/models/POSTransaction";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  await connectDB();

  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
        { error: "No token" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || typeof user === "string") {
      return Response.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // =========================================================
    // QUERY PARAMETERS
    // =========================================================

    const { searchParams } = new URL(req.url);

    const filter =
      searchParams.get("filter") || "today";

    const startDateQuery =
      searchParams.get("startDate");

    const endDateQuery =
      searchParams.get("endDate");

    const now = new Date();

    let startDate: Date;
    let endDate: Date = new Date();

    // =========================================================
    // DATE RANGE
    // =========================================================

    // Custom date range has priority
    if (startDateQuery && endDateQuery) {
      startDate = new Date(startDateQuery);
      endDate = new Date(endDateQuery);

      // Validate start date
      if (
        Number.isNaN(
          startDate.getTime()
        )
      ) {
        return Response.json(
          {
            error: "Invalid start date",
          },
          { status: 400 }
        );
      }

      // Include the entire end date
      endDate.setHours(
        23,
        59,
        59,
        999
      );

      // Validate end date
      if (
        Number.isNaN(
          endDate.getTime()
        )
      ) {
        return Response.json(
          {
            error: "Invalid end date",
          },
          { status: 400 }
        );
      }

      if (startDate > endDate) {
        return Response.json(
          {
            error:
              "Invalid date range",
          },
          { status: 400 }
        );
      }
    } else {
      // =======================================================
      // PREDEFINED FILTERS
      // =======================================================

      if (filter === "today") {
        startDate = new Date();

        startDate.setHours(
          0,
          0,
          0,
          0
        );
      } else if (filter === "week") {
        startDate = new Date();

        startDate.setDate(
          now.getDate() - 7
        );
      } else if (filter === "month") {
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
      } else {
        // All records
        startDate = new Date(0);
      }
    }

    // =========================================================
    // FETCH DATA
    // =========================================================

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
          "email fullName role"
        )
        .sort({
          createdAt: -1,
        }),

      Expense.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({
        createdAt: -1,
      }),

      POSTransaction.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate(
          "recordedBy",
          "email fullName role"
        )
        .sort({
          createdAt: -1,
        }),
    ]);

    // =========================================================
    // REPORT STRUCTURE
    // =========================================================

    const report = {
      // Final total:
      // Sales Records + POS Amount + POS Charges
      totalSales: 0,

      // Sales collection only
      salesRecordsTotal: 0,

      // POS money handled
      totalPOSAmount: 0,

      // POS income/charges
      totalPOSCharges: 0,

      // Expenses
      totalExpenses: 0,

      // Sales records + POS transactions
      totalTransactions:
        sales.length +
        posTransactions.length,

      // Average value per record
      averageSale: 0,

      // Computer services
      computer: {
        typing: 0,
        printing: 0,
        photocopying: 0,
        browsing: 0,
      },

      // POS breakdown
      pos: {
        amount: 0,
        charges: 0,
      },

      // Drinks
      drinks: {
        coke: 0,
        water: 0,
      },

      // Staff performance
      staff:
        {} as Record<string, number>,

      // Daily trend
      daily:
        {} as Record<string, number>,
    };

    // =========================================================
    // PROCESS SALES
    // =========================================================

    sales.forEach((sale) => {
      const saleAmount =
        Number(sale.totalSales) || 0;

      // -------------------------------------------------------
      // Sales records total
      // -------------------------------------------------------

      report.salesRecordsTotal +=
        saleAmount;

      // -------------------------------------------------------
      // Computer services
      // -------------------------------------------------------

      report.computer.typing +=
        Number(
          sale.computer?.typing
        ) || 0;

      report.computer.printing +=
        Number(
          sale.computer?.printing
        ) || 0;

      report.computer.photocopying +=
        Number(
          sale.computer?.photocopying
        ) || 0;

      report.computer.browsing +=
        Number(
          sale.computer?.browsing
        ) || 0;

      // -------------------------------------------------------
      // Drinks
      // -------------------------------------------------------

      report.drinks.coke +=
        Number(
          sale.drinks?.coke
        ) || 0;

      report.drinks.water +=
        Number(
          sale.drinks?.water
        ) || 0;

      // -------------------------------------------------------
      // STAFF PERFORMANCE
      // -------------------------------------------------------

      const recordedBy =
        sale.recordedBy as
          | {
              email?: string;
            }
          | null
          | undefined;

      const email =
        recordedBy?.email ||
        "unknown";

      report.staff[email] =
        (report.staff[email] || 0) +
        saleAmount;

      // -------------------------------------------------------
      // DAILY SALES
      // -------------------------------------------------------

      const createdAt =
        sale.createdAt;

      if (createdAt) {
        const day = new Date(
          createdAt
        ).toDateString();

        report.daily[day] =
          (report.daily[day] || 0) +
          saleAmount;
      }
    });

    // =========================================================
    // PROCESS POS TRANSACTIONS
    // =========================================================

    posTransactions.forEach(
      (transaction) => {
        const amount =
          Number(
            transaction.amount
          ) || 0;

        const charge =
          Number(
            transaction.charge
          ) || 0;

        // -----------------------------------------------------
        // POS AMOUNT
        // -----------------------------------------------------

        report.totalPOSAmount +=
          amount;

        report.pos.amount +=
          amount;

        // -----------------------------------------------------
        // POS CHARGES
        // -----------------------------------------------------

        report.totalPOSCharges +=
          charge;

        report.pos.charges +=
          charge;

        // -----------------------------------------------------
        // STAFF PERFORMANCE
        // -----------------------------------------------------

        const recordedBy =
          transaction.recordedBy as
            | {
                email?: string;
              }
            | null
            | undefined;

        const email =
          recordedBy?.email ||
          "unknown";

        /*
         * Staff performance follows Total Sales:
         *
         * POS Amount + POS Charge
         */

        report.staff[email] =
          (report.staff[email] || 0) +
          amount +
          charge;

        // -----------------------------------------------------
        // DAILY SALES
        // -----------------------------------------------------

        const createdAt =
          transaction.createdAt;

        if (createdAt) {
          const day = new Date(
            createdAt
          ).toDateString();

          report.daily[day] =
            (report.daily[day] || 0) +
            amount +
            charge;
        }
      }
    );

    // =========================================================
    // TOTAL SALES
    // =========================================================

    /*
     * Total Sales =
     *
     * Sales Records
     * + POS Amount
     * + POS Charges
     */

    report.totalSales =
      report.salesRecordsTotal +
      report.totalPOSAmount +
      report.totalPOSCharges;

    // =========================================================
    // PROCESS EXPENSES
    // =========================================================

    expenses.forEach((expense) => {
      report.totalExpenses +=
        Number(expense.total) || 0;
    });

    // =========================================================
    // AVERAGE SALE
    // =========================================================

    const totalRecords =
      sales.length +
      posTransactions.length;

    report.averageSale =
      totalRecords > 0
        ? report.totalSales /
          totalRecords
        : 0;

    // =========================================================
    // PROFIT
    // =========================================================

    const profit =
      report.totalSales -
      report.totalExpenses;

    // =========================================================
    // CATEGORY BREAKDOWN
    // =========================================================

    const categories = [
      {
        name: "Computer",
        value:
          report.computer.typing +
          report.computer.printing +
          report.computer.photocopying +
          report.computer.browsing,
      },

      {
        name: "POS",
        value:
          report.totalPOSAmount +
          report.totalPOSCharges,
      },

      {
        name: "Drinks",
        value:
          report.drinks.coke +
          report.drinks.water,
      },
    ];

    const topCategory =
      categories.sort(
        (a, b) =>
          b.value - a.value
      )[0];

    // =========================================================
    // RESPONSE
    // =========================================================

    return Response.json({
      ...report,

      profit,

      topCategory,

      // Additional counters
      salesCount:
        sales.length,

      posTransactionCount:
        posTransactions.length,

      expenseCount:
        expenses.length,

      // Detailed POS transactions
      posTransactions,
    });
  } catch (error) {
    console.error(
      "REPORT ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to generate report",
      },
      { status: 500 }
    );
  }
}