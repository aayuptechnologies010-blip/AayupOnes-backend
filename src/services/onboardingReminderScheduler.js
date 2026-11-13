const cron = require('node-cron');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { sendPushNotification } = require('./fcmService');

/**
 * Check and send daily Onboarding Reminder notifications
 * Runs every day at 12:00 PM (Noon).
 * Target: Active employees whose onboarding is NOT complete
 * (e.g. status != 'Submitted' && status != 'Verified' && progress < 100).
 * Once completed, the reminder stops for that employee.
 */
async function checkAndSendOnboardingReminders() {
  try {
    console.log('\n📋 [Onboarding Reminder Scheduler] Checking pending onboardings...');

    // Find employees whose onboarding is incomplete:
    // status is 'Not Started' or 'Correction Required' or progress < 100
    // and status is not 'Submitted' / 'Verified' / 'Approved'
    const pendingEmployees = await Employee.find({
      status: 'ACTIVE',
      $and: [
        {
          $or: [
            { onboardingStatus: { $in: ['Not Started', 'Correction Required'] } },
            { onboardingProgress: { $lt: 100 } }
          ]
        },
        {
          onboardingStatus: { $nin: ['Submitted', 'Verified', 'Approved'] }
        }
      ]
    });

    if (pendingEmployees.length === 0) {
      console.log('ℹ️  All active employees have completed or submitted onboarding. No reminders needed.');
      return;
    }

    console.log(`🔔 Found ${pendingEmployees.length} employee(s) with incomplete onboarding. Dispatching 12:00 PM reminders...`);

    for (const emp of pendingEmployees) {
      const title = 'Complete Your Onboarding Dossier 📝';
      const message = `Hi ${emp.name.split(' ')[0]}, your employee onboarding profile is currently at ${emp.onboardingProgress || 0}%. Please complete your details and submit for HR verification.`;

      // 1. Insert in-app notification in MongoDB
      await Notification.create({
        userId: emp._id,
        employeeId: emp.employeeId,
        type: 'ONBOARDING',
        title,
        desc: message,
        isUnread: true,
        route: 'onboarding',
        createdAt: new Date()
      });

      // 2. Dispatch FCM Push Notification (if token is registered)
      if (emp.fcmToken && emp.fcmToken.trim().length > 10) {
        await sendPushNotification({
          tokens: [emp.fcmToken.trim()],
          title,
          body: message,
          data: {
            route: 'onboarding',
            type: 'ONBOARDING',
            employeeId: emp.employeeId
          }
        });
        console.log(`📱 Push reminder sent to ${emp.name} (${emp.employeeId})`);
      } else {
        console.log(`ℹ️  In-app notification saved for ${emp.name} (no active FCM token yet)`);
      }
    }
  } catch (error) {
    console.error('❌ Error executing onboarding reminder scheduler:', error.message);
  }
}

/**
 * Initialize 12:00 PM Daily Cron Job: '0 12 * * *'
 * Timezone: Asia/Kolkata
 */
function initOnboardingReminderCron() {
  // '0 12 * * *' fires every day at 12:00 PM
  cron.schedule('0 12 * * *', () => {
    console.log('⏰ [12:00 PM Noon] Triggering daily onboarding reminder notifications...');
    checkAndSendOnboardingReminders();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  console.log('📅 Daily 12:00 PM Onboarding Reminder Scheduler initialized (Timezone: Asia/Kolkata).');
}

module.exports = {
  initOnboardingReminderCron,
  checkAndSendOnboardingReminders
};

