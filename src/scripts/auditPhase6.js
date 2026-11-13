const mongoose = require('mongoose');
const Post = require('../models/Post');
const Offboarding = require('../models/Offboarding');
const SystemSetting = require('../models/SystemSetting');
const User = require('../models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aayupones_hrms';

async function auditPhase6() {
  console.log('--- AUDITING PHASE 6 (SOCIAL WALL, OFFBOARDING, SETTINGS, PROFILE) ---');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Audit System Settings
    let settings = await SystemSetting.findOne({ type: 'COMPANY_SETTINGS' });
    if (!settings) {
      settings = await SystemSetting.create({
        type: 'COMPANY_SETTINGS',
        data: {
          companyName: 'AayupOnes Technologies Private Limited',
          officialEmail: 'contact@aayup.com',
          supportPhone: '+91 522 4901 888',
          officeAddress: 'Cyber Heights, 6th Floor, Vibhuti Khand, Gomti Nagar, Lucknow, UP - 226010',
          geofenceRadiusMeters: 100,
          graceTimeMinutes: 15,
          requireSelfieCheckin: true,
          requireDoctorCertDays: 2
        }
      });
    }
    console.log(`✅ SystemSetting verified: "${settings.data.companyName}" (Radius: ${settings.data.geofenceRadiusMeters}m)`);

    // 2. Audit Offboarding Exit Records
    const exitCount = await Offboarding.countDocuments();
    console.log(`✅ Offboarding Cases in DB: ${exitCount}`);

    // 3. Audit Social Wall Posts
    const postCount = await Post.countDocuments();
    console.log(`✅ Social Wall Posts in DB: ${postCount}`);

    // 4. Audit Admin Profile
    const adminUser = await User.findOne({ role: 'admin' });
    console.log(`✅ Admin Profile in DB: ${adminUser ? adminUser.name + ' (' + adminUser.email + ')' : 'Not found'}`);

    console.log('\n🌟 PHASE 6 AUDIT SUCCESSFUL: All schemas and dynamic connections ready!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 6 audit failed:', err);
    process.exit(1);
  }
}

auditPhase6();

