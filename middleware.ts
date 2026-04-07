import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  // Make sure token is a string, not a Promise
  const token = req.cookies.get("token")?.value ?? null;

  const { pathname } = req.nextUrl;

  let user = null;

  if (token && typeof token === "string") {
    try {
      user = await verifyToken(token);
    } catch (err) {
      console.log("Token verification failed:", err);
      user = null;
    }
  }

  console.log("TOKEN:", token);
  console.log("USER:", user);
  console.log("PATH:", pathname);

  // Public route
  if (pathname === "/login") {
    if (user) {
      return NextResponse.redirect(
        new URL(user.role === "admin" ? "/admin" : "/sales", req.url)
      );
    }
    return NextResponse.next();
  }

  // Protect /admin
  if (pathname.startsWith("/admin") && (!user || user.role !== "admin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect /sales
  if (pathname.startsWith("/sales") && (!user || user.role !== "sales")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sales/:path*", "/login"],
};