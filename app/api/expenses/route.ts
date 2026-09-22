import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import "@/models/User";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// ✅ POST
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const token = cookies().get("token")?.value;

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const user = await verifyToken(token);

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
      recordedBy: user.userId,
    });

    return Response.json(expense);
  } catch (error) {
    console.error("POST ERROR:", error);

    return Response.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

// ✅ GET (MATCHES YOUR SALES LOGIC)
export async function GET(req: Request) {
  await connectDB();

  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const user = await verifyToken(token);

    // ✅ handle expired or invalid token
    if (!user || typeof user === "string") {
      return Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ✅ GET SINGLE EXPENSE (LIKE SALES)
    if (id) {
      const expense = await Expense.findById(id).populate(
        "recordedBy",
        "email role"
      );

      if (!expense) {
        return Response.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      return Response.json(expense);
    }

    // ✅ GET ALL EXPENSES
    let expenses;

    if (user.role === "admin") {
      expenses = await Expense.find()
        .populate("recordedBy", "email role")
        .sort({ createdAt: -1 });
    } else {
      expenses = await Expense.find({ recordedBy: user.userId })
        .populate("recordedBy", "email role")
        .sort({ createdAt: -1 });
    }

    return Response.json(expenses);
  } catch (error) {
    console.error("GET ERROR:", error);

    return Response.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}