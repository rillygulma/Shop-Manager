import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BrightStack Management System",
    template: "%s | BrightStack Management System",
  },
  description:
    "BrightStack Management System is a modern business management platform developed by BrightStack Digital Solutions for managing inventory, sales, customers, expenses, reports and more.",
  keywords: [
    "BrightStack",
    "BrightStack Digital Solutions",
    "Business Management System",
    "Inventory Management",
    "POS System",
    "Store Management",
    "Sales Management",
    "Nigeria",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          {/* ✅ GLOBAL TOASTER */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#1e293b",
                color: "#ffffff",
                border: "1px solid #334155",
                padding: "14px 18px",
              },
              success: {
                iconTheme: {
                  primary: "#f97316",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}