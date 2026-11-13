const { mongoose } = require('../config/mongo');

const userSchema = new mongoose.Schema(
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
      enum: ['admin', 'hr', 'manager', 'employee'],
      default: 'employee',
    },
    designation: {
      type: String,
      default: 'Team Member',
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    employmentType: {
      type: String,
      default: 'Full Time',
    },
    salary: {
      type: String,
      default: '₹ 7,50,000',
    },
    location: {
      type: String,
      default: 'Lucknow Office',
    },
    joiningDate: {
      type: String,
      default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    onboardingStatus: {
      type: String,
      enum: ['Not Started', 'Submitted', 'Under Review', 'Verified', 'Correction Required'],
      default: 'Not Started',
    },
    onboardingProgress: {
      type: Number,
      default: 10,
    },
    onboardingToken: {
      type: String,
      default: '',
    },
    avatarInitials: {
      type: String,
      default: 'EM',
    },
    phone: {
      type: String,
      default: '+91 98000 00000',
    },
    shift: {
      type: String,
      default: 'General Shift (09:30 AM - 06:30 PM)',
    },
    manager: {
      type: String,
      default: 'Aayup Admin (HR Head)',
    },
    isOnDuty: {
      type: Boolean,
      default: true,
    },
    lastPunchTime: {
      type: String,
      default: '09:00:00 AM',
    },
    // Complete Onboarding Dossier Details
    onboardingDossier: {
      personal: {
        fatherName: { type: String, default: 'Ram Prakash' },
        dob: { type: String, default: '1998-05-15' },
        gender: { type: String, default: 'Male' },
        bloodGroup: { type: String, default: 'O+' },
        maritalStatus: { type: String, default: 'Single' },
        verified: { type: Boolean, default: true },
        remarks: { type: String, default: '' },
      },
      address: {
        currentAddress: { type: String, default: 'Flat 402, Gomti Nagar, Lucknow' },
        permanentAddress: { type: String, default: 'Flat 402, Gomti Nagar, Lucknow' },
        city: { type: String, default: 'Lucknow' },
        state: { type: String, default: 'Uttar Pradesh' },
        pincode: { type: String, default: '226010' },
        verified: { type: Boolean, default: true },
        remarks: { type: String, default: '' },
      },
      education: {
        highestQualification: { type: String, default: 'B.Tech in Computer Science' },
        university: { type: String, default: 'AKTU Lucknow' },
        passingYear: { type: String, default: '2022' },
        percentage: { type: String, default: '82%' },
        verified: { type: Boolean, default: true },
        remarks: { type: String, default: '' },
      },
      bank: {
        accountHolderName: { type: String, default: '' },
        bankName: { type: String, default: 'HDFC Bank' },
        accountNumber: { type: String, default: '50100234567890' },
        ifscCode: { type: String, default: 'HDFC0001234' },
        branch: { type: String, default: 'Gomti Nagar Branch' },
        panNumber: { type: String, default: 'ABCDE1234F' },
        aadhaarNumber: { type: String, default: 'XXXX-XXXX-9876' },
        verified: { type: Boolean, default: true },
        remarks: { type: String, default: '' },
      },
      emergency: {
        contactName: { type: String, default: 'Ram Prakash' },
        relationship: { type: String, default: 'Father' },
        contactPhone: { type: String, default: '+91 94150 12345' },
        verified: { type: Boolean, default: true },
        remarks: { type: String, default: '' },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
