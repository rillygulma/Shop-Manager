import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  date: String,
  fuel: Number,
  electricity: Number,
  internet: Number,
  stock: Number,
  other: Number,
  total: Number,
});

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);