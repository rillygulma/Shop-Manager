import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ message: "Wrong password" }, { status: 401 });

  // 🔑 Await the token
  const token = await signToken({ userId: user._id.toString(), role: user.role });

  const res = NextResponse.json({ message: "Login successful", role: user.role });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: false, // false locally
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return res;
}