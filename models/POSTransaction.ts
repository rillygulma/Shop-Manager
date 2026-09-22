import mongoose, { Schema, Model } from "mongoose";

interface IPOSTransaction {
  date: string;
  type:
    | "withdrawal"
    | "deposit"
    | "transfer"
    | "airtime"
    | "data"
    | "other";
  amount: number;
  charge: number;
  recordedBy?: mongoose.Types.ObjectId;
}

const POSTransactionSchema = new Schema<IPOSTransaction>(
  {
    date: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "withdrawal",
        "deposit",
        "transfer",
        "airtime",
        "data",
        "other",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    charge: {
      type: Number,
      default: 0,
      min: 0,
    },

    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const POSTransaction =
  (mongoose.models.POSTransaction as Model<IPOSTransaction>) ||
  mongoose.model<IPOSTransaction>(
    "POSTransaction",
    POSTransactionSchema
  );

export default POSTransaction;