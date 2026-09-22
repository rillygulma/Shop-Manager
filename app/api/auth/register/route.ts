
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { email, password, role } = await req.json();

  // check if user exists
  const existing = await User.findOne({ email });

  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    role: role || "sales",
  });

  return NextResponse.json({
    message: "User created successfully",
    user,
  });
}