import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

type User = {
  role: "admin" | "sales";
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  let user: User | null = null;

  // Decode token safely
  if (token) {
    try {
      user = jwt.decode(token) as User;
    } catch (err) {
      user = null;
    }
  }

  const role = user?.role;

  // Redirect logged-in users away from login page
  if (pathname === "/login") {
    if (token) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (role === "sales") {
        return NextResponse.redirect(new URL("/sales", req.url));
      }
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/sales", req.url)); // or /unauthorized
    }
  }

  // Protect sales routes
  if (pathname.startsWith("/sales")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "sales") {
      return NextResponse.redirect(new URL("/admin", req.url)); // or /unauthorized
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sales/:path*", "/login"],
};