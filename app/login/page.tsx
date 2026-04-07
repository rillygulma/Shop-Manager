"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

if (res.ok) {
  const data = await res.json();

  // 🔥 give browser time to store cookie
  setTimeout(() => {
    window.location.href =
      data.role === "admin" ? "/admin" : "/sales";
  }, 200);
}
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome Back 👋</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full mb-4 rounded-lg outline-none transition" />
        <input type="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full mb-6 rounded-lg outline-none transition" />
        <button onClick={login} disabled={loading}
          className="bg-green-600 hover:bg-green-700 transition text-white w-full p-3 rounded-lg font-semibold disabled:opacity-50">
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-gray-500 text-center mt-4">Secure access to your dashboard</p>
      </div>
    </div>
  );
}