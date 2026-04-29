import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import "@/models/User";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const token = cookies().get("token")?.value;

  const user = await verifyToken(token!); // ✅ FIXED (added await)

  if (!user || typeof user === "string") {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const totalSales =
    body.computer.typing +
    body.computer.printing +
    body.pos.charges +
    body.drinks.coke;

  const sale = await Sale.create({
    ...body,
    totalSales,
    recordedBy: user.userId, // ✅ now works
  });

  return Response.json(sale);
}

export async function GET() {
  await connectDB();

  const sales = await Sale.find()
    .populate("recordedBy", "email")
    .sort({ createdAt: -1 });

  return Response.json(sales);
}