import mongoose from "mongoose";
const { Schema } = mongoose;

const certificationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who owns the certification
  name: { type: String, required: true }, 
  skills: { type: [String], required: true }, // Array of skills associated with the certification
  issuingOrganization: { type: String, required: true }, // Organization that issued the certification
  issueDate: { type: Date, required: true }, // Issue date of the certification
  expirationDate: { type: Date }, // Expiration date (optional)
  credentialId: { type: String, required: true }, // Unique credential ID
  credentialURL: { type: String }, // URL for the credential (optional)
  description: { type: String }, // Description of the certification (optional)
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the certification is created
});

export default mongoose.models.Certification || mongoose.model('Certification', certificationSchema);