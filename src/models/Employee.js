const { mongoose } = require('../config/mongo');

const employeeSchema = new mongoose.Schema(
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
      enum: ['employee', 'manager'],
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
    dob: {
      type: String, // Stored format: YYYY-MM-DD or DD/MM/YYYY
      default: '',
    },
    dobDay: {
      type: Number, // 1 to 31
      default: null,
    },
    dobMonth: {
      type: Number, // 1 to 12
      default: null,
    },
    fcmToken: {
      type: String,
      default: '',
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
    profilePic: {
      type: String,
      default: '',
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
      default: false,
    },
    lastPunchTime: {
      type: String,
      default: '09:00:00 AM',
    },
    onboardingDossier: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        personalDetails: { verified: false, remarks: '' },
        contactAddress: { verified: false, remarks: '' },
        identityKyc: { verified: false, remarks: '' },
        panDetails: { verified: false, remarks: '' },
        bankAccount: { verified: false, remarks: '' },
        academicCredentials: { verified: false, remarks: '' },
        priorEmployment: { verified: false, remarks: '' },
        emergencyContact: { verified: false, remarks: '' },
        medicalFitness: { verified: false, remarks: '' },
        codeOfConduct: { verified: false, remarks: '' },
        assetsIssued: { verified: false, remarks: '' },
        salaryStructure: { verified: false, remarks: '' },
        statutoryDeclarations: { verified: false, remarks: '' },
      }),
    },
  },
  {
    timestamps: true,
    collection: 'employees' // Dedicated 'employees' collection in MongoDB
  }
);

module.exports = mongoose.model('Employee', employeeSchema);

