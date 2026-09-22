import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import DailyChallenge from "@/models/DailyChallenge";
import User from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only admins can mark challenges as read
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Only admins can mark challenges as read",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const challenge = await DailyChallenge.findById(id);

    if (!challenge) {
      return NextResponse.json(
        {
          error: "Daily challenge not found",
        },
        { status: 404 }
      );
    }

    // Make sure the challenge was created by a sales user
    const creator = await User.findById(
      challenge.createdBy
    ).select("role");

    if (!creator || creator.role !== "sales") {
      return NextResponse.json(
        {
          error: "Invalid daily challenge",
        },
        { status: 400 }
      );
    }

    // Add this admin to readBy
    await DailyChallenge.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          readBy: user.userId,
        },
      },
      {
        new: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Daily challenge marked as read",
    });
  } catch (error) {
    console.error(
      "PATCH /api/daily-challenges/[id]/read error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to mark daily challenge as read",
      },
      { status: 500 }
    );
  }
}