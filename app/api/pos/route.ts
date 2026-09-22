import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import POSTransaction from "@/models/POSTransaction";

export async function POST(req: Request) {
  await connectDB();

  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || typeof user === "string") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only sales users can record POS transactions
    if (user.role !== "sales") {
      return NextResponse.json(
        {
          error: "Only sales users can record POS transactions",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const type = body.type?.trim();
    const amount = Number(body.amount);
    const charge = Number(body.charge || 0);

    const validTypes = [
      "withdrawal",
      "deposit",
      "transfer",
      "airtime",
      "data",
      "other",
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: "Valid transaction type is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: "Amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Airtime and Data have no additional charges
    const transactionCharge =
      type === "airtime" || type === "data"
        ? 0
        : charge;

    if (!Number.isFinite(transactionCharge) || transactionCharge < 0) {
      return NextResponse.json(
        {
          error: "Charge cannot be negative",
        },
        { status: 400 }
      );
    }

    // Automatically save the current date using Nigeria time
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
    }).format(new Date());

    // recordedBy comes from the authenticated user
    const transaction = await POSTransaction.create({
      date,
      type,
      amount,
      charge: transactionCharge,
      recordedBy: user.userId,
    });

    const populatedTransaction = await POSTransaction.findById(
      transaction._id
    ).populate(
      "recordedBy",
      "fullName email role"
    );

    return NextResponse.json(
      populatedTransaction,
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/pos error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create POS transaction",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();

  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || typeof user === "string") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // SALES USER
    // Sales users can only see transactions they recorded.
    if (user.role === "sales") {
      const transactions = await POSTransaction.find({
        recordedBy: user.userId,
      })
        .populate(
          "recordedBy",
          "fullName email role"
        )
        .sort({ createdAt: -1 });

      return NextResponse.json(transactions);
    }

    // ADMIN
    // Admin can see all POS transactions.
    if (user.role === "admin") {
      const transactions = await POSTransaction.find()
        .populate(
          "recordedBy",
          "fullName email role"
        )
        .sort({ createdAt: -1 });

      return NextResponse.json(transactions);
    }

    return NextResponse.json(
      {
        error: "Access denied",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error(
      "GET /api/pos error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch POS transactions",
      },
      { status: 500 }
    );
  }
}
