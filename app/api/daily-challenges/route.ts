import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import DailyChallenge from "@/models/DailyChallenge";
import User from "@/models/User";

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

    // Only sales users can create challenges
    if (user.role !== "sales") {
      return NextResponse.json(
        {
          error: "Only sales users can post daily challenges",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const title = body.title?.trim();
    const description = body.description?.trim();

    if (!title || !description) {
      return NextResponse.json(
        {
          error: "Title and description are required",
        },
        { status: 400 }
      );
    }

    const challenge = await DailyChallenge.create({
      title,
      description,
      createdBy: user.userId,
      readBy: [],
    });

    const populatedChallenge = await DailyChallenge.findById(
      challenge._id
    ).populate("createdBy", "email role");

    return NextResponse.json(
      populatedChallenge,
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/daily-challenges error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create daily challenge",
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
    // Sales users can see their own challenges.
    if (user.role === "sales") {
      const challenges = await DailyChallenge.find({
        createdBy: user.userId,
      })
        .populate("createdBy", "email role")
        .sort({ createdAt: -1 });

      return NextResponse.json(challenges);
    }

    // ADMIN
    // Only return challenges that this admin has NOT read.
    if (user.role === "admin") {
      const salesUsers = await User.find({
        role: "sales",
      }).select("_id");

      const salesIds = salesUsers.map(
        (salesUser) => salesUser._id
      );

      const challenges = await DailyChallenge.find({
        createdBy: {
          $in: salesIds,
        },

        // Current admin has not read this challenge
        readBy: {
          $ne: user.userId,
        },
      })
        .populate("createdBy", "email role")
        .sort({ createdAt: -1 });

      return NextResponse.json(challenges);
    }

    return NextResponse.json(
      {
        error: "Access denied",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error(
      "GET /api/daily-challenges error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch daily challenges",
      },
      { status: 500 }
    );
  }
}