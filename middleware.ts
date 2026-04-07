import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value ?? null;
  const { pathname } = req.nextUrl;

  console.log("TOKEN:", token);
  console.log("PATH:", pathname);

  // Public route
  if (pathname === "/login") {
    // If user has token, assume logged in → redirect
    if (token) {
      return NextResponse.redirect(new URL("/admin", req.url)); // or "/sales"
    }
    return NextResponse.next();
  }

  // Protect /admin
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect /sales
  if (pathname.startsWith("/sales") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sales/:path*", "/login"],
};