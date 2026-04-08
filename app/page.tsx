"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMounted(true);
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) setDarkMode(savedTheme === "dark");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode, mounted]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 selection:bg-green-400 selection:text-black ${
        darkMode
          ? "bg-gradient-to-br from-green-100 via-green-800 to-green-900 text-white"
          : "bg-gray-500 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Store
          </span>
          <span className="text-white/90">Manager</span>
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="hover:text-green-300 transition-colors"
          >
            Features
          </a>
          <a href="#about" className="hover:text-green-300 transition-colors">
            About
          </a>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
          >
            {mounted && (darkMode ? <Sun size={18} /> : <Moon size={18} />)}
          </button>

          <button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-4 py-2 rounded-xl text-white"
          >
            Login
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4 bg-black/20 backdrop-blur-xl rounded-2xl mx-4">
          <a href="#features">Features</a>
          <a href="#about">About</a>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2"
          >
            {mounted && (darkMode ? <Sun size={18} /> : <Moon size={18} />)}
            Toggle Theme
          </button>

          <button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-xl text-white"
          >
            Login
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center py-16 sm:py-20 px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
        >
          Manage Your Store <br /> Smarter & Faster
        </motion.h2>

        <p className="mt-6 text-base sm:text-lg max-w-2xl mx-auto text-green-100/80">
          Track sales, manage users, monitor expenses, and grow your business
          with an all-in-one store management system.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 text-white"
          >
            Get Started <ArrowRight size={18} />
          </button>

          <button className="px-6 py-3 rounded-2xl border border-white/20 hover:bg-white/10 backdrop-blur-sm">
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto"
      >
        <h3 className="text-2xl sm:text-3xl font-semibold text-center mb-12">
          Core Features
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl shadow-lg bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <feature.icon className="text-green-400 mb-4" size={28} />
              <h4 className="text-lg sm:text-xl font-semibold mb-2">
                {feature.title}
              </h4>
              <p className="text-green-100/70">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-16 sm:py-20 px-4 sm:px-6 text-center bg-black/20 backdrop-blur-xl"
      >
        <h3 className="text-2xl sm:text-3xl font-semibold mb-6">
          Why StoreManager?
        </h3>

        <p className="max-w-3xl mx-auto text-green-100/80">
          Built for modern businesses, StoreManager helps you stay organized,
          make data-driven decisions, and scale efficiently without stress.
        </p>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 text-center px-4 sm:px-6">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6">
          Ready to grow your business?
        </h3>

        <button
          onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-green-900/30 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg text-white"
        >
          Start Managing Now
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-white/10">
        <p className="text-green-100/70">
          © {new Date().getFullYear()} StoreManager. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: BarChart3,
    title: "Sales Tracking",
    desc: "Monitor your daily sales performance with real-time analytics.",
  },
  {
    icon: Users,
    title: "User Management",
    desc: "Easily manage staff, roles, and permissions.",
  },
  {
    icon: Wallet,
    title: "Expense Control",
    desc: "Track expenses and keep your finances in check.",
  },
  {
    icon: ShieldCheck,
    title: "Secure System",
    desc: "Your data is protected with modern security practices.",
  },
];
