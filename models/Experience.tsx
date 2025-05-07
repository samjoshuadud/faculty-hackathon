import mongoose from "mongoose";
const { Schema } = mongoose;

const experienceSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  employmentType: { type: String, required: true },
  company: { type: String, required: true },
  isCurrentRole: { type: Boolean, default: false },
  startDate: { type: String, required: true },
  endDate: { type: String },
  location: { type: String, required: true },
  locationType: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Experience || mongoose.model('Experience', experienceSchema);
