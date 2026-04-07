import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    date: String,

    computer: {
      typing: Number,
      printing: Number,
      browsing: Number,
      other: Number,
    },

    pos: {
      charges: Number,
    },

    drinks: {
      coke: Number,
      water: Number,
      other: Number,
    },

    totalSales: Number,
    totalExpenses: Number,
    profit: Number,

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);