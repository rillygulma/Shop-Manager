import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import Sale from "@/models/Sale";
import "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

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
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Only sales users should create sales records
    if (user.role !== "sales") {
      return NextResponse.json(
        { error: "Only sales users can record sales" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const totalSales =
      Number(body.computer?.typing || 0) +
      Number(body.computer?.printing || 0) +
      Number(body.computer?.photocopying || 0) +
      Number(body.computer?.browsing || 0) +
      Number(body.computer?.other || 0) +
      Number(body.pos?.charges || 0) +
      Number(body.drinks?.softdrinks || 0) +
      Number(body.drinks?.water || 0) +
      Number(body.drinks?.other || 0);

    const sale = await Sale.create({
      ...body,

      // Always calculate total on the server
      totalSales,

      // Always use the authenticated user
      // Never trust recordedBy from the frontend
      recordedBy: user.userId,
    });

    const populatedSale = await Sale.findById(sale._id).populate(
      "recordedBy",
      "fullName email role"
    );

    return NextResponse.json(populatedSale, { status: 201 });
  } catch (error) {
    console.error("POST /api/sales error:", error);

    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

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
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ==========================================
    // GET SINGLE SALE
    // ==========================================
    if (id) {
      const sale = await Sale.findById(id).populate(
        "recordedBy",
        "fullName email role"
      );

      if (!sale) {
        return NextResponse.json(
          { error: "Sale not found" },
          { status: 404 }
        );
      }

      // Sales users can only view their own sale
      if (
        user.role === "sales" &&
        sale.recordedBy &&
        typeof sale.recordedBy === "object" &&
        "_id" in sale.recordedBy
      ) {
        const recordedById = String(
          (sale.recordedBy as { _id: unknown })._id
        );

        if (recordedById !== String(user.userId)) {
          return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
          );
        }
      }

      // Only admin and sales users can access sales
      if (user.role !== "sales" && user.role !== "admin") {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }

      return NextResponse.json(sale);
    }

    // ==========================================
    // GET SALES LIST
    // ==========================================

    // SALES USER → ONLY THEIR OWN SALES
    if (user.role === "sales") {
      const sales = await Sale.find({
        recordedBy: user.userId,
      })
        .populate("recordedBy", "fullName email role")
        .sort({ createdAt: -1 });

      return NextResponse.json(sales);
    }

    // ADMIN → ALL SALES
    if (user.role === "admin") {
      const sales = await Sale.find()
        .populate("recordedBy", "fullName email role")
        .sort({ createdAt: -1 });

      return NextResponse.json(sales);
    }

    // OTHER ROLES → DENIED
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  } catch (error) {
    console.error("GET /api/sales error:", error);

    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}