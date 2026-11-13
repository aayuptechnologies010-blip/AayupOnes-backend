const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { sendPushNotification } = require('../services/fcmService');

/**
 * Superadmin Broadcast Announcement & Notification Dispatcher
 * Sends in-app notifications and Firebase Cloud Messaging (FCM) background push
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      targetType = 'ALL', // 'ALL', 'DEPARTMENT', 'INDIVIDUAL'
      department = 'All',
      targetEmployeeIds = [],
      route = 'home', // 'home', 'onboarding', 'attendance', 'leave', 'work', 'payslips', 'helpdesk'
      priority = 'HIGH',
      sendPush = true
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title and message body are required.'
      });
    }

    let targetEmployees = [];

    if (targetType === 'ALL') {
      targetEmployees = await Employee.find({ status: 'ACTIVE' });
    } else if (targetType === 'DEPARTMENT') {
      targetEmployees = await Employee.find({
        status: 'ACTIVE',
        department: department === 'All' ? { $exists: true } : department
      });
    } else if (targetType === 'INDIVIDUAL') {
      targetEmployees = await Employee.find({
        status: 'ACTIVE',
        $or: [
          { employeeId: { $in: targetEmployeeIds } },
          { _id: { $in: targetEmployeeIds.filter(id => id.match(/^[0-9a-fA-F]{24}$/)) } }
        ]
      });
    }

    if (targetEmployees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active employees matched the selected target criteria.'
      });
    }

    // 1. Create In-App Notifications in MongoDB
    const notificationsToInsert = targetEmployees.map(emp => ({
      userId: emp._id,
      employeeId: emp.employeeId,
      type: 'HR',
      title: title.trim(),
      desc: message.trim(),
      isUnread: true,
      route: route || 'home',
      createdAt: new Date()
    }));

    await Notification.insertMany(notificationsToInsert);

    // 2. Dispatch FCM Push Notifications to devices
    let pushResult = { count: 0 };
    if (sendPush) {
      const tokens = targetEmployees
        .map(e => e.fcmToken)
        .filter(t => t && typeof t === 'string' && t.trim().length > 10);

      if (tokens.length > 0) {
        pushResult = await sendPushNotification({
          tokens,
          title: title.trim(),
          body: message.trim(),
          data: {
            route: route || 'home',
            targetType,
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Announcement successfully dispatched to ${targetEmployees.length} employee(s)!`,
      details: {
        totalTargeted: targetEmployees.length,
        inAppCreated: notificationsToInsert.length,
        pushDispatched: pushResult?.count || 0
      }
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to broadcast announcement.'
    });
  }
};

/**
 * Register or update device FCM token for logged-in employee or explicit employeeId
 */
exports.registerDeviceToken = async (req, res) => {
  try {
    const { fcmToken, employeeId } = req.body;
    const empId = employeeId || req.user?.employeeId;
    const userId = req.user?.id || req.user?.userId;

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'fcmToken is required.' });
    }

    const query = [];
    if (empId) query.push({ employeeId: empId.toUpperCase() });
    if (userId) query.push({ _id: userId });

    let emp = null;
    if (query.length > 0) {
      emp = await Employee.findOne({ $or: query });
    }

    // Fallback: If no employee found but token provided, assign to first active employee
    if (!emp) {
      emp = await Employee.findOne({ status: 'ACTIVE' });
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    emp.fcmToken = fcmToken.trim();
    await emp.save();
    console.log(`📱 [FCM] Device Token registered for ${emp.name} (${emp.employeeId}): ${fcmToken.substring(0, 15)}...`);

    return res.status(200).json({
      success: true,
      message: 'Device FCM token registered successfully.',
      employeeId: emp.employeeId
    });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return res.status(500).json({ success: false, message: 'Failed to register token.' });
  }
};

/**
 * Get recent announcement logs for admin dashboard
 */
exports.getAnnouncementsList = async (req, res) => {
  try {
    const list = await Notification.find({ type: 'HR' })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load announcements.' });
  }
};

