import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type ReportPDFProps = {
  startDate: Date;
  endDate: Date;

  totalSales: number;
  totalExpenses: number;
  profit: number;
  averageSale: number;
  totalTransactions: number;

  computer: {
    typing: number;
    printing: number;
    photocopying: number;
    browsing: number;
  };

  pos: {
    charges: number;
  };

  drinks: {
    coke: number;
    water: number;
  };

  // =========================
  // EXPENSE DETAILS
  // =========================
  expenses: {
    fuel: number;
    internet: number;
    other: number;
    total: number;
  };

  staff: Record<string, number>;

  daily: Record<string, number>;

  categories: {
    name: string;
    value: number;
  }[];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 45,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#991B1B",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#991B1B",
    marginBottom: 5,
    alignContent: "center",
  },

  subtitle: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 4,
  },

  period: {
    fontSize: 9,
    color: "#374151",
  },

  section: {
    marginTop: 15,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#991B1B",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#D1D5DB",
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  summaryCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 5,
  },

  summaryTitle: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 5,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1F2937",
  },

  salesValue: {
    color: "#166534",
  },

  expenseValue: {
    color: "#B91C1C",
  },

  profitValue: {
    color: "#7C3AED",
  },

  table: {
    width: "100%",
    marginTop: 5,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#991B1B",
    color: "#FFFFFF",
    padding: 6,
    fontWeight: "bold",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 6,
  },

  tableCell: {
    paddingHorizontal: 4,
  },

  colName: {
    width: "55%",
  },

  colAmount: {
    width: "45%",
    textAlign: "right",
  },

  twoColumns: {
    flexDirection: "row",
    gap: 15,
  },

  column: {
    flex: 1,
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  breakdownLabel: {
    color: "#4B5563",
  },

  breakdownValue: {
    fontWeight: "bold",
    color: "#111827",
  },

  // =========================
  // EXPENSE STYLES
  // =========================

  expenseSection: {
    marginTop: 15,
    marginBottom: 8,
  },

  expenseBox: {
    padding: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: "#FECACA",
  },

  expenseTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#FCA5A5",
  },

  expenseTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#991B1B",
  },

  expenseTotalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#B91C1C",
  },

  profitBox: {
    marginTop: 15,
    padding: 15,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  profitLabel: {
    fontSize: 13,
    fontWeight: "bold",
  },

  profitAmount: {
    fontSize: 15,
    fontWeight: "bold",
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#6B7280",
  },

  pageNumber: {
    position: "absolute",
    bottom: 10,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#9CA3AF",
  },

  empty: {
    color: "#6B7280",
    fontSize: 8,
    paddingVertical: 5,
  },

  smallHeading: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

const money = (value: number) => {
  return `NGN ${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function ReportPDF({
  startDate,
  endDate,
  totalSales,
  totalExpenses,
  profit,
  averageSale,
  totalTransactions,
  computer,
  pos,
  drinks,
  expenses,
  staff,
  daily,
  categories,
}: ReportPDFProps) {
  return (
    <Document
      title="Business Financial Report"
      author="BrightStack Shop Manager"
      subject="Sales and Expense Report"
      creator="BrightStack Shop Manager"
    >
      <Page size="A4" style={styles.page}>
        {/* =====================================================
            HEADER
        ====================================================== */}
        <View style={styles.header}>
          <Text style={styles.title}>
            BRIGHTSTACK SHOP MANAGER
          </Text>

          <Text style={styles.title}>
            BUSINESS FINANCIAL REPORT
          </Text>

          <Text style={styles.subtitle}>
            Sales, Expenses & Performance Analysis
          </Text>

          <Text style={styles.period}>
            Report Period: {formatDate(startDate)} -{" "}
            {formatDate(endDate)}
          </Text>
        </View>

        {/* =====================================================
            SUMMARY
        ====================================================== */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              TOTAL SALES
            </Text>

            <Text
              style={[
                styles.summaryValue,
                styles.salesValue,
              ]}
            >
              {money(totalSales)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              TOTAL EXPENSES
            </Text>

            <Text
              style={[
                styles.summaryValue,
                styles.expenseValue,
              ]}
            >
              {money(totalExpenses)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              NET PROFIT / LOSS
            </Text>

            <Text
              style={[
                styles.summaryValue,
                styles.profitValue,
              ]}
            >
              {money(profit)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              TRANSACTIONS
            </Text>

            <Text style={styles.summaryValue}>
              {totalTransactions.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* =====================================================
            SALES OVERVIEW
        ====================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Sales Overview
          </Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Average Sale
            </Text>

            <Text style={styles.breakdownValue}>
              {money(averageSale)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Total Transactions
            </Text>

            <Text style={styles.breakdownValue}>
              {totalTransactions.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* =====================================================
            CATEGORY PERFORMANCE
        ====================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Category Performance
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.tableCell,
                  styles.colName,
                ]}
              >
                Category
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  styles.colAmount,
                ]}
              >
                Amount
              </Text>
            </View>

            {categories.length === 0 ? (
              <Text style={styles.empty}>
                No category data available.
              </Text>
            ) : (
              categories.map((category) => (
                <View
                  key={category.name}
                  style={styles.tableRow}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colName,
                    ]}
                  >
                    {category.name}
                  </Text>

                  <Text
                    style={[
                      styles.tableCell,
                      styles.colAmount,
                    ]}
                  >
                    {money(category.value)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* =====================================================
            SERVICE BREAKDOWN
        ====================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Service Breakdown
          </Text>

          <View style={styles.twoColumns}>
            {/* COMPUTER */}
            <View style={styles.column}>
              <Text style={styles.smallHeading}>
                Computer Services
              </Text>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Typing
                </Text>

                <Text style={styles.breakdownValue}>
                  {money(computer.typing)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Printing
                </Text>

                <Text style={styles.breakdownValue}>
                  {money(computer.printing)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Photocopying
                </Text>

                <Text style={styles.breakdownValue}>
                  {money(computer.photocopying)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Browsing
                </Text>

                <Text style={styles.breakdownValue}>
                  {money(computer.browsing)}
                </Text>
              </View>
            </View>

            {/* POS + DRINKS */}
            <View style={styles.column}>
              <Text style={styles.smallHeading}>
                POS
              </Text>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Charges
                </Text>

                <Text style={styles.breakdownValue}>
                  {money(pos.charges)}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  marginTop: 15,
                  marginBottom: 5,
                }}
              >
                Drinks
              </Text>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Coke
                </Text>

                <Text style={styles.breakdownValue}>
                  {money(drinks.coke)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Water
                </Text>

                <Text style={styles.breakdownValue}>
                  {money(drinks.water)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            EXPENSE DETAILS
        ====================================================== */}
        <View style={styles.expenseSection}>
          <Text style={styles.sectionTitle}>
            Expense Details
          </Text>

          <View style={styles.expenseBox}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Fuel
              </Text>

              <Text style={styles.breakdownValue}>
                {money(expenses.fuel)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Internet
              </Text>

              <Text style={styles.breakdownValue}>
                {money(expenses.internet)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Other Expenses
              </Text>

              <Text style={styles.breakdownValue}>
                {money(expenses.other)}
              </Text>
            </View>

            <View style={styles.expenseTotalRow}>
              <Text style={styles.expenseTotalLabel}>
                TOTAL EXPENSES
              </Text>

              <Text style={styles.expenseTotalValue}>
                {money(expenses.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            STAFF PERFORMANCE
        ====================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Staff Performance
          </Text>

          {Object.entries(staff).length === 0 ? (
            <Text style={styles.empty}>
              No staff performance data available.
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colName,
                  ]}
                >
                  Staff
                </Text>

                <Text
                  style={[
                    styles.tableCell,
                    styles.colAmount,
                  ]}
                >
                  Sales
                </Text>
              </View>

              {Object.entries(staff)
                .sort(([, a], [, b]) => b - a)
                .map(([email, amount]) => (
                  <View
                    key={email}
                    style={styles.tableRow}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        styles.colName,
                      ]}
                    >
                      {email}
                    </Text>

                    <Text
                      style={[
                        styles.tableCell,
                        styles.colAmount,
                      ]}
                    >
                      {money(amount)}
                    </Text>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* =====================================================
            DAILY SALES
        ====================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Daily Sales
          </Text>

          {Object.entries(daily).length === 0 ? (
            <Text style={styles.empty}>
              No daily sales data available.
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colName,
                  ]}
                >
                  Date
                </Text>

                <Text
                  style={[
                    styles.tableCell,
                    styles.colAmount,
                  ]}
                >
                  Sales
                </Text>
              </View>

              {Object.entries(daily).map(
                ([date, amount]) => (
                  <View
                    key={date}
                    style={styles.tableRow}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        styles.colName,
                      ]}
                    >
                      {date}
                    </Text>

                    <Text
                      style={[
                        styles.tableCell,
                        styles.colAmount,
                      ]}
                    >
                      {money(amount)}
                    </Text>
                  </View>
                ),
              )}
            </View>
          )}
        </View>

        {/* =====================================================
            PROFIT
        ====================================================== */}
        <View style={styles.profitBox}>
          <Text style={styles.profitLabel}>
            {profit >= 0
              ? "NET PROFIT"
              : "NET LOSS"}
          </Text>

          <Text
            style={[
              styles.profitAmount,
              {
                color:
                  profit >= 0
                    ? "#166534"
                    : "#B91C1C",
              },
            ]}
          >
            {money(Math.abs(profit))}
          </Text>
        </View>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <Text
          style={styles.footer}
          fixed
        >
          Generated by BrightStack Shop Manager •{" "}
          {new Date().toLocaleString("en-NG")}
        </Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}