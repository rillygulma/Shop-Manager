"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast"; // ✅ NEW
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    // ✅ Email Validation
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    // ✅ Password Validation
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful 🎉");

        setTimeout(() => {
          window.location.href = data.role === "admin" ? "/admin" : "/sales";
        }, 500);
      } else {
        toast.error(data.error || "Invalid login");
        setError(data.error || "Invalid login");
      }
    } catch (err: unknown) {
      toast.error("Something went wrong");
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 px-6 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
      {/* Logo */}

      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
            Secure Login
          </span>
        </div>

        <div className="inline-flex rounded-3xl bg-white p-3 shadow-xl dark:bg-slate-800">
          <Image
            src="/logo.jpeg"
            alt="BrightStack Digital Solutions"
            width={90}
            height={90}
            priority
            className="rounded-2xl object-contain"
          />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
          BrightStack
        </h1>

        <p className="mt-1 font-semibold tracking-wide text-orange-500">
          Management System
        </p>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Powered by BrightStack Digital Solutions
        </p>
      </div>

      {/* Login Card */}

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90">
        <h2 className="mb-2 text-center text-3xl font-bold">
          Welcome Back 👋
        </h2>

        <p className="mb-8 text-center text-slate-500 dark:text-slate-400">
          Sign in to continue to your dashboard.
        </p>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Email */}

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-500/20"
          />
        </div>

        {/* Password */}

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-500/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-500"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Login Button */}

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Secure access powered by
          </p>

          <p className="mt-1 font-semibold text-orange-500">
            BrightStack Digital Solutions
          </p>
        </div>
      </div>

      {/* Footer */}

      <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} BrightStack Digital Solutions
        <br />
        Innovate • Create • Solve
            </div>
          </div>
        </div>
        );
      }