"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Wallet, ShieldCheck, ArrowRight, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

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
      className={`min-h-screen transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-wide">StoreManager</h1>
        <nav className="flex items-center gap-6">
          <a href="#features" className="hover:text-blue-400">Features</a>
          <a href="#about" className="hover:text-blue-400">About</a>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {mounted && (darkMode ? <Sun size={18} /> : <Moon size={18} />)}
          </button>

          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white"
          >
            Login
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold leading-tight"
        >
          Manage Your Store <br /> Smarter & Faster
        </motion.h2>
        <p className={`mt-6 text-lg max-w-2xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Track sales, manage users, monitor expenses, and grow your business
          with an all-in-one store management system.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 px-6 py-3 rounded-2xl hover:bg-blue-700 flex items-center gap-2 text-white"
          >
            Get Started <ArrowRight size={18} />
          </button>
          <button
            className={`px-6 py-3 rounded-2xl border ${
              darkMode
                ? "border-gray-500 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-200"
            }`}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
        <h3 className="text-3xl font-semibold text-center mb-12">Core Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-2xl shadow-lg ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <feature.icon className="text-blue-500 mb-4" size={32} />
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className={`py-20 px-6 text-center ${
          darkMode ? "bg-slate-800" : "bg-gray-200"
        }`}
      >
        <h3 className="text-3xl font-semibold mb-6">Why StoreManager?</h3>
        <p className={`max-w-3xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          Built for modern businesses, StoreManager helps you stay organized,
          make data-driven decisions, and scale efficiently without stress.
        </p>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h3 className="text-3xl font-bold mb-6">Ready to grow your business?</h3>
        <button
          onClick={() => router.push('/login')}
          className="bg-green-600 px-8 py-4 rounded-2xl text-lg hover:bg-green-700 text-white"
        >
          Start Managing Now
        </button>
      </section>

      {/* Footer */}
      <footer
        className={`text-center py-6 border-t ${
          darkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
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