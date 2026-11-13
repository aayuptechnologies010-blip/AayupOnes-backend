const { connectDB, mongoose } = require('../src/config/mongo');
const SystemSetting = require('../src/models/SystemSetting');

(async () => {
  await connectDB();
  const updateObj = {};
  updateObj['$set'] = {
    shifts: [
      {
        name: 'General Shift',
        startTime: '09:30 AM',
        endTime: '06:30 PM',
        gracePeriodMinutes: 15,
      }
    ],
    'securitySettings.autoClockoutAtShiftEnd': true,
    'securitySettings.blockLoginAfterShiftEnd': true,
  };
  const res = await mongoose.connection.db.collection('systemsettings').updateMany({}, updateObj);
  console.log('Updated systemsettings count:', res.modifiedCount);
  await mongoose.disconnect();
  process.exit(0);
})();

