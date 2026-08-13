// api/sendNotification.js
const admin = require('firebase-admin');

// Initialise once, reused across warm invocations
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fcmToken, title, body, data } = req.body;
    if (!fcmToken || !title || !body) {
      return res.status(400).json({ error: 'Missing fcmToken, title, or body' });
    }

    const message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
      android: { notification: { channelId: 'chal_ostaad_channel' }, priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error('FCM send error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};