const { mongoose } = require('../config/mongo');

const systemSettingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Aayup Technologies Private Limited',
    },
    workplaceLocations: [
      {
        name: { type: String, default: 'Lucknow HQ' },
        latitude: { type: Number, default: 26.8467 },
        longitude: { type: Number, default: 80.9462 },
        radiusMeters: { type: Number, default: 500 },
      },
      {
        name: { type: String, default: 'Noida Office' },
        latitude: { type: Number, default: 28.5355 },
        longitude: { type: Number, default: 77.3910 },
        radiusMeters: { type: Number, default: 500 },
      },
    ],
    shifts: [
      {
        name: { type: String, default: 'General Shift' },
        startTime: { type: String, default: '09:30 AM' },
        endTime: { type: String, default: '06:30 PM' },
        gracePeriodMinutes: { type: Number, default: 15 },
      },
      {
        name: { type: String, default: '24/7 Operational Shift' },
        startTime: { type: String, default: '00:00 AM' },
        endTime: { type: String, default: '11:59 PM' },
        gracePeriodMinutes: { type: Number, default: 0 },
      },
    ],
    leavePolicies: {
      casualLeavesPerYear: { type: Number, default: 12 },
      sickLeavesPerYear: { type: Number, default: 10 },
      earnedLeavesPerYear: { type: Number, default: 15 },
      halfDayAllowed: { type: Boolean, default: true },
    },
    payrollSettings: {
      pfEmployerPercentage: { type: Number, default: 12 },
      pfEmployeePercentage: { type: Number, default: 12 },
      esicThreshold: { type: Number, default: 21000 },
      standardPayDay: { type: Number, default: 31 },
    },
    securitySettings: {
      enforceBiometricsOnMobile: { type: Boolean, default: true },
      sessionTimeoutMinutes: { type: Number, default: 10080 }, // 7 days
      allowSelfOnboarding: { type: Boolean, default: true },
      autoClockoutAtShiftEnd: { type: Boolean, default: true },
      blockLoginAfterShiftEnd: { type: Boolean, default: true },
    },
    type: { type: String, default: 'COMPANY_SETTINGS' },
    data: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema);

