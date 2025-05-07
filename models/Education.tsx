import mongoose from "mongoose";
const { Schema } = mongoose;

const educationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: String, required: true },
  description: { type: String },
  gpa: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Education || mongoose.model('Education', educationSchema);
