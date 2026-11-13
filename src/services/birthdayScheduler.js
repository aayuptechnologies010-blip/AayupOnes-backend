const cron = require('node-cron');
const Employee = require('../models/Employee');
const Post = require('../models/Post');

/**
 * Check and broadcast daily birthdays at midnight (12:00 AM)
 * Runs automatically every day at 00:00:00 server time.
 */
async function checkAndBroadcastBirthdays() {
  try {
    const today = new Date();
    const currentDay = today.getDate(); // 1 - 31
    const currentMonth = today.getMonth() + 1; // 1 - 12

    console.log(`\n🎉 [Birthday Scheduler] Checking birthdays for Date: ${currentDay}, Month: ${currentMonth}...`);

    // Find all active employees whose dob matches today's day and month
    const employees = await Employee.find({
      status: 'ACTIVE',
      $or: [
        { dobDay: currentDay, dobMonth: currentMonth },
        // Fallback matching if dob is stored as string (e.g. YYYY-MM-DD or DD/MM/YYYY)
        { dob: { $regex: new RegExp(`-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}$`) } },
        { dob: { $regex: new RegExp(`^${String(currentDay).padStart(2, '0')}/${String(currentMonth).padStart(2, '0')}/`) } }
      ]
    });

    if (employees.length === 0) {
      console.log('ℹ️  No employee birthdays found for today.');
      return;
    }

    console.log(`🎂 Found ${employees.length} employee(s) celebrating birthday today!`);

    for (const emp of employees) {
      const year = today.getFullYear();
      const circularTitle = `Happy Birthday to ${emp.name}! 🎂🎉`;

      // Check if post already created for today to prevent duplicates
      const existingPost = await Post.findOne({
        title: circularTitle,
        createdAt: {
          $gte: new Date(year, today.getMonth(), currentDay, 0, 0, 0),
          $lte: new Date(year, today.getMonth(), currentDay, 23, 59, 59)
        }
      });

      if (!existingPost) {
        await Post.create({
          author: 'AayupOnes People Desk',
          authorAvatar: 'AP',
          title: circularTitle,
          content: `Wishing ${emp.name} (${emp.designation || 'Team Member'}, ${emp.department || 'Engineering'}) a very Happy Birthday! May you have a joyful day and a fantastic year ahead with great achievements! 🎈🎁`,
          badge: 'Official Birthday Celebration',
          priority: 'Kudos',
          likes: 1,
          commentsCount: 0,
          likedBy: []
        });
        console.log(`✅ Created public birthday celebration feed post for: ${emp.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error executing birthday broadcast scheduler:', error.message);
  }
}

/**
 * Returns today's birthday celebration payload for the requesting user
 * If employee itself -> "Happy Birthday to You!"
 * If other employees -> "Today is [Name]'s Birthday!"
 */
async function getTodayCelebrationsForUser(currentUserId) {
  try {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;

    const bdayEmployees = await Employee.find({
      status: 'ACTIVE',
      $or: [
        { dobDay: currentDay, dobMonth: currentMonth },
        { dob: { $regex: new RegExp(`-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}$`) } },
        { dob: { $regex: new RegExp(`^${String(currentDay).padStart(2, '0')}/${String(currentMonth).padStart(2, '0')}/`) } }
      ]
    });

    return bdayEmployees.map(emp => {
      const isMe = currentUserId && (
        emp._id.toString() === currentUserId.toString() ||
        emp.employeeId === currentUserId
      );

      return {
        id: emp._id.toString(),
        employeeId: emp.employeeId,
        name: isMe ? 'You' : emp.name,
        actualName: emp.name,
        isSelf: isMe,
        greeting: isMe 
          ? 'Happy Birthday to You! 🎂 Wishing you a fantastic year ahead!' 
          : `Today is ${emp.name}'s Birthday! 🎂`,
        subText: isMe ? 'Have a wonderful day ahead! 🎉' : 'Tap to send wishes 🎈',
        avatar: emp.avatarInitials || (emp.name ? emp.name.slice(0, 2).toUpperCase() : 'BD'),
        department: emp.department
      };
    });
  } catch (err) {
    console.error('Error fetching today celebrations:', err.message);
    return [];
  }
}

/**
 * Initialize 12:00 AM Cron Job: '0 0 * * *'
 */
function initBirthdayCron() {
  // '0 0 * * *' triggers every midnight at 12:00 AM
  cron.schedule('0 0 * * *', () => {
    console.log('⏰ [12:00 AM Midnight] Triggering daily birthday celebrations broadcast...');
    checkAndBroadcastBirthdays();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  // Also run a quick check on backend startup
  checkAndBroadcastBirthdays();
  console.log('📅 Midnight Birthday Notification Scheduler initialized (Timezone: Asia/Kolkata).');
}

module.exports = {
  initBirthdayCron,
  checkAndBroadcastBirthdays,
  getTodayCelebrationsForUser
};

