import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "sales"],
    default: "sales",
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);