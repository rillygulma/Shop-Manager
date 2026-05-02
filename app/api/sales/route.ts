import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import "@/models/User";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const token = cookies().get("token")?.value;
  const user = await verifyToken(token!);

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
    recordedBy: user.userId,
  });

  return Response.json(sale);
}

export async function GET(req: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ✅ GET SINGLE SALE
    if (id) {
      const sale = await Sale.findById(id).populate(
        "recordedBy",
        "email role"
      );

      if (!sale) {
        return Response.json({ error: "Sale not found" }, { status: 404 });
      }

      return Response.json(sale);
    }

    // ✅ GET ALL SALES
    const sales = await Sale.find()
      .populate("recordedBy", "email")
      .sort({ createdAt: -1 });

    return Response.json(sales);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}