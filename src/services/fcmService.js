const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');

let fcmInitialized = false;
let messagingService = null;

function initFirebase() {
  if (fcmInitialized && messagingService) return messagingService;

  try {
    const serviceAccountPath = path.resolve(__dirname, '../../config/firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      if (admin.getApps().length === 0) {
        admin.initializeApp({
          credential: admin.cert(serviceAccount)
        });
      }
      messagingService = getMessaging();
      fcmInitialized = true;
      console.log('🔥 Firebase Admin SDK v14+ initialized successfully for project:', serviceAccount.project_id);
    } else {
      console.warn('⚠️  firebase-service-account.json not found at:', serviceAccountPath);
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
  return messagingService;
}

/**
 * Send Multicast or Single FCM Push Notification
 * Supports high priority data payload for background & closed app delivery
 */
async function sendPushNotification({ tokens, title, body, data = {} }) {
  if (!fcmInitialized || !messagingService) {
    initFirebase();
  }

  if (!messagingService) {
    console.warn('⚠️  FCM Messaging Service not ready. Push skipped.');
    return { success: false, message: 'FCM not initialized' };
  }

  const validTokens = (Array.isArray(tokens) ? tokens : [tokens]).filter(
    t => t && typeof t === 'string' && t.trim().length > 10
  );

  if (validTokens.length === 0) {
    console.log('ℹ️  No valid FCM device tokens available for push.');
    return { success: false, message: 'No registered FCM tokens' };
  }

  const notificationPayload = {
    title: title || 'AayupOnes Update',
    body: body || ''
  };

  const dataPayload = {
    click_action: 'FLUTTER_NOTIFICATION_CLICK',
    route: data.route || 'home',
    title: title || '',
    body: body || '',
    ...Object.keys(data).reduce((acc, k) => {
      acc[k] = String(data[k]);
      return acc;
    }, {})
  };

  const androidConfig = {
    priority: 'high',
    notification: {
      channelId: 'aayup_ones_high_importance_v2',
      sound: 'notification_sound',
      priority: 'high',
      clickAction: 'FLUTTER_NOTIFICATION_CLICK'
    }
  };

  try {
    if (validTokens.length === 1) {
      const res = await messagingService.send({
        token: validTokens[0],
        notification: notificationPayload,
        data: dataPayload,
        android: androidConfig
      });
      console.log('✅ FCM single push sent successfully:', res);
      return { success: true, count: 1, result: res };
    } else {
      const res = await messagingService.sendEachForMulticast({
        tokens: validTokens,
        notification: notificationPayload,
        data: dataPayload,
        android: androidConfig
      });
      console.log(`✅ FCM multicast push sent: ${res.successCount} success, ${res.failureCount} failed`);
      return { success: true, count: res.successCount, result: res };
    }
  } catch (error) {
    console.error('❌ Error sending FCM push notification:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  initFirebase,
  sendPushNotification
};
