import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IDailyChallenge extends Document {
  title: string;
  description: string;
  createdBy?: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const DailyChallengeSchema = new Schema<IDailyChallenge>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

export default models.DailyChallenge ||
  model<IDailyChallenge>("DailyChallenge", DailyChallengeSchema);