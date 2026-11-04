const { mongoose } = require('../config/mongo');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['my_document', 'company_document'],
      required: true,
    },
    profileMode: {
      type: String,
      enum: ['Fresher', 'Experienced', 'All'],
      default: 'All',
    },
    category: {
      type: String,
      required: true, // Identity Proof, Tax, Education, Prior Experience, Offer, Payslip, Policy
    },
    title: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    uploadDate: {
      type: String,
      default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    status: {
      type: String,
      enum: ['VERIFIED', 'APPROVED', 'UNDER REVIEW', 'FLAGGED', 'ISSUED', 'GENERATED', 'EXECUTED', 'ACTIVE'],
      default: 'UNDER REVIEW',
    },
    allowDownload: {
      type: Boolean,
      default: false, // false for My Documents (Onboarding), true for Company Documents
    },
    digitalHash: {
      type: String,
      default: 'SHA256:4f8b9e1c3a7d2e5b8c0a9f1e3d5b7a9c',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);

