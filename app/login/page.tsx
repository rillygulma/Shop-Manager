"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast"; // ✅ NEW

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful 🎉"); // ✅ SUCCESS TOAST

        setTimeout(() => {
          window.location.href =
            data.role === "admin" ? "/admin" : "/sales";
        }, 500);
      } else {
        toast.error(data.error || "Invalid login"); // ❌ ERROR TOAST
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
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back 👋
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full mb-4 rounded-lg outline-none transition"
        />

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg outline-none transition pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 transition text-white w-full p-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          Secure access to your dashboard
        </p>
      </div>
    </div>
  );
}