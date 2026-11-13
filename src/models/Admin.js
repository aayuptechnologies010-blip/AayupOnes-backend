const { mongoose } = require('../config/mongo');

const adminSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'hr', 'superadmin'],
      default: 'admin',
    },
    designation: {
      type: String,
      default: 'Super Administrator',
    },
    department: {
      type: String,
      default: 'Management & Operations',
    },
    avatarInitials: {
      type: String,
      default: 'AD',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    collection: 'admins' // Dedicated 'admins' collection in MongoDB
  }
);

module.exports = mongoose.model('Admin', adminSchema);

