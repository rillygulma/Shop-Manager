import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });

  // Clear the token cookie
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: false,
    path: "/",
    maxAge: 0, // immediately expire
    sameSite: "lax",
  });

  return res;
}