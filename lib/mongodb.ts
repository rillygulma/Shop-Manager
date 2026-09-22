import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI!); // no options needed
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}