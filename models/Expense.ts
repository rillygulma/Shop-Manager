import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    date: String,
    fuel: {
      type: Number,
      default: 0,
    },
    internet: {
      type: Number,
      default: 0,
    },
    other: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },

    // ✅ ADD THIS (CRITICAL FIX)
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true } // ✅ for createdAt
);

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);