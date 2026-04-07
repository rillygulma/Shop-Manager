import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const total =
    body.fuel +
    body.electricity +
    body.internet +
    body.stock +
    body.other;

  const expense = await Expense.create({
    ...body,
    total,
  });

  return Response.json(expense);
}

export async function GET() {
  await connectDB();
  return Response.json(await Expense.find());
}