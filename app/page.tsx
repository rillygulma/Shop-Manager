"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();

  const darkMode = resolvedTheme === "dark";

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          {/* Logo */}

          <Link href="/" className="flex items-center gap-3">

            <Image
              src="/logo.jpeg"
              alt="BrightStack"
              width={55}
              height={55}
              priority
              className="rounded-xl"
            />

            <div>

              <h1 className="text-xl font-bold">
                BrightStack
              </h1>

              <p className="text-xs font-medium text-orange-500">
                Digital Solutions
              </p>

            </div>

          </Link>

          {/* Desktop Menu */}

          <nav className="hidden items-center gap-8 lg:flex">

            <Link
              href="#home"
              className="font-medium transition hover:text-orange-500"
            >
              Home
            </Link>

            <Link
              href="#features"
              className="font-medium transition hover:text-orange-500"
            >
              Features
            </Link>

            <Link
              href="#about"
              className="font-medium transition hover:text-orange-500"
            >
              About
            </Link>

            <Link
              href="#contact"
              className="font-medium transition hover:text-orange-500"
            >
              Contact
            </Link>

            <button
              onClick={() =>
                setTheme(
                  darkMode ? "light" : "dark"
                )
              }
              className="rounded-full border border-slate-300 p-2 transition hover:bg-orange-500 hover:text-white dark:border-slate-700"
            >
              {darkMode ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            <button
              onClick={() =>
                router.push("/login")
              }
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Login
            </button>

          </nav>

          {/* Mobile Buttons */}

          <div className="flex items-center gap-3 lg:hidden">

            <button
              onClick={() =>
                setTheme(
                  darkMode ? "light" : "dark"
                )
              }
              className="rounded-full border border-slate-300 p-2 dark:border-slate-700"
            >
              {darkMode ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            <button
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
            >
              {menuOpen ? (
                <X size={30} />
              ) : (
                <Menu size={30} />
              )}
            </button>

          </div>

        </div>

        {/* ================= MOBILE MENU ================= */}

        {menuOpen && (

          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:hidden"
          >

            <nav className="flex flex-col p-6">

              <Link
                href="#home"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="py-3"
              >
                Home
              </Link>

              <Link
                href="#features"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="py-3"
              >
                Features
              </Link>

              <Link
                href="#about"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="py-3"
              >
                About
              </Link>

              <Link
                href="#contact"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="py-3"
              >
                Contact
              </Link>

              <button
                onClick={() =>
                  router.push("/login")
                }
                className="mt-6 rounded-xl bg-orange-500 py-3 font-semibold text-white"
              >
                Login
              </button>

            </nav>

          </motion.div>

        )}

      </header>
            {/* ================= HERO ================= */}

      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-slate-100 py-20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      >
        {/* Background Blur */}

        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

          {/* ================= LEFT ================= */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
          >
            <span className="inline-flex rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
              🚀 BrightStack Management System • Since 2025
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight lg:text-7xl">
              Smart Business
              <span className="block text-orange-500">
                Management System
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              BrightStack Management System is an all-in-one business platform
              developed by <strong>BrightStack Digital Solutions</strong> to
              help businesses simplify daily operations, manage inventory,
              monitor sales, organize customers, track expenses, generate
              reports and improve productivity from anywhere.
            </p>

            {/* Feature Pills */}

            <div className="mt-10 flex flex-wrap gap-3">

              {[
                "Inventory",
                "Sales",
                "Customers",
                "Reports",
                "Expenses",
                "Cloud Access",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-orange-300 bg-orange-50 px-5 py-2 text-sm font-medium text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300"
                >
                  ✓ {item}
                </span>
              ))}

            </div>

            {/* Buttons */}

            <div className="mt-12 flex flex-wrap gap-5">

              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition hover:bg-orange-600"
              >
                Get Started

                <ArrowRight size={20} />
              </button>

              <button
                onClick={() => router.push("/contact")}
                className="rounded-xl border border-orange-500 px-8 py-4 font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white"
              >
                Request Demo
              </button>

            </div>

            {/* Quick Stats */}

            <div className="mt-14 grid grid-cols-3 gap-6">

              <div>
                <h2 className="text-3xl font-bold text-orange-500">
                  100%
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Secure
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-orange-500">
                  24/7
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Cloud Access
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-orange-500">
                  All-in-One
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Business Solution
                </p>
              </div>

            </div>

          </motion.div>

          {/* ================= RIGHT ================= */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
            className="relative flex justify-center"
          >

            <Image
              src="/hero.png"
              alt="BrightStack Management System"
              width={700}
              height={700}
              priority
              className="w-full max-w-2xl"
            />

            {/* Floating Card */}

            <motion.div
              animate={{
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute left-0 top-10 rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
            >
              <h3 className="text-lg font-bold text-orange-500">
                Sales
              </h3>

              <p className="mt-2 text-3xl font-bold">
                ₦2.5M
              </p>

              <span className="text-sm text-green-600">
                ↑ +18% This Month
              </span>
            </motion.div>

            <motion.div
              animate={{
                y: [10, -10, 10],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="absolute bottom-10 right-0 rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
            >
              <h3 className="font-semibold">
                Inventory
              </h3>

              <p className="mt-2 text-3xl font-bold text-orange-500">
                1,250
              </p>

              <span className="text-sm text-slate-500">
                Products Available
              </span>
            </motion.div>

          </motion.div>

        </div>
      </section>
            {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="bg-slate-50 py-24 dark:bg-slate-900"
      >
        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto mb-16 max-w-3xl text-center">

            <span className="rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
              WHY CHOOSE BRIGHTSTACK
            </span>

            <h2 className="mt-6 text-4xl font-bold lg:text-5xl">
              Everything You Need To
              <span className="text-orange-500">
                {" "}Run Your Business
              </span>
            </h2>

            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
              BrightStack Management System provides powerful tools that help
              businesses automate operations, improve productivity and increase
              profitability.
            </p>

          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {[
              {
                title: "Inventory Management",
                desc: "Track stock levels, purchases and product movement in real-time.",
                icon: "📦",
              },
              {
                title: "Sales & POS",
                desc: "Process sales quickly and generate professional receipts.",
                icon: "💰",
              },
              {
                title: "Customer Management",
                desc: "Store customer information and monitor purchase history.",
                icon: "👥",
              },
              {
                title: "Expense Tracking",
                desc: "Monitor expenses and improve financial management.",
                icon: "📊",
              },
              {
                title: "Business Reports",
                desc: "Generate detailed reports for better decision making.",
                icon: "📈",
              },
              {
                title: "Secure Cloud System",
                desc: "Access your business anywhere with secure authentication.",
                icon: "🔒",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{
                  y: -8,
                }}
                transition={{
                  duration: .3,
                }}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition hover:border-orange-500 dark:border-slate-700 dark:bg-slate-950"
              >

                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl dark:bg-orange-500/20">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>

              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}

      <section
        id="contact"
        className="relative overflow-hidden bg-orange-500 py-24 text-white"
      >

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.15),transparent_40%)]" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">

          <h2 className="text-4xl font-bold lg:text-5xl">
            Ready To Transform Your Business?
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-orange-100">
            Join businesses using BrightStack Management System to manage
            inventory, customers, sales, expenses and business reports from one
            modern platform.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">

            <button
              onClick={() => router.push("/login")}
              className="rounded-xl bg-white px-8 py-4 font-semibold text-orange-600 transition hover:scale-105"
            >
              Login Now
            </button>

            <button
              onClick={() => router.push("/contact")}
              className="rounded-xl border border-white px-8 py-4 font-semibold transition hover:bg-white hover:text-orange-600"
            >
              Request Demo
            </button>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">

            <div>
              <h3 className="text-4xl font-bold">100%</h3>
              <p className="mt-2 text-orange-100">
                Secure Platform
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold">24/7</h3>
              <p className="mt-2 text-orange-100">
                Cloud Access
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold">Easy</h3>
              <p className="mt-2 text-orange-100">
                User Friendly
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold">Fast</h3>
              <p className="mt-2 text-orange-100">
                Business Growth
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
