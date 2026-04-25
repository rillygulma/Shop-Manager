import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// ✅ POST
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const token = cookies().get("token")?.value;

    // ✅ HANDLE NO TOKEN
    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const user = await verifyToken(token);

    // ✅ HANDLE INVALID TOKEN
    if (!user || typeof user === "string") {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const total =
      (body.fuel || 0) +
      (body.internet || 0) +
      (body.other || 0);

    const expense = await Expense.create({
      fuel: body.fuel || 0,
      internet: body.internet || 0,
      other: body.other || 0,
      total,

      // ✅ must match ObjectId in schema
      recordedBy: user.userId,
    });

    return Response.json(expense);
  } catch (error) {
    console.error("POST ERROR:", error);

    // ✅ ALWAYS RETURN JSON
    return Response.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

// ✅ GET
export async function GET() {
  try {
    await connectDB();

    const token = cookies().get("token")?.value;

    // ❌ No token
    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const user = await verifyToken(token);

    // ❌ Invalid token
    if (!user || typeof user === "string") {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    let expenses;

    // ✅ ADMIN → get all
    if (user.role === "admin") {
      expenses = await Expense.find()
        .populate("recordedBy", "email role")
        .sort({ createdAt: -1 });
    } else {
      // ✅ NORMAL USER → only their expenses
      expenses = await Expense.find({ recordedBy: user.userId })
        .populate("recordedBy", "email role")
        .sort({ createdAt: -1 });
    }

    return Response.json(expenses);
  } catch (error) {
    console.error("GET ERROR:", error);

    return Response.json([], { status: 500 });
  }
}