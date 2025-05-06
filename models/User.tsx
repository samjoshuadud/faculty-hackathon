import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String },
  role: { type: String, required: true, default: "Guest" },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model('User', userSchema);
