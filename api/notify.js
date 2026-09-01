// POST /api/notify — sends a real push notification (Firebase Cloud
// Messaging) either to the admin (new order) or to a customer (order
// status changed). Called from js/app.js right after the relevant
// Firestore write; failures here never block the order/status update
// itself.
//
// Required Vercel env vars (Project Settings → Environment Variables):
//   FIREBASE_SERVICE_ACCOUNT  — full JSON from Firebase Console →
//                                Project Settings → Service Accounts →
//                                "Generate new private key" (paste the
//                                whole file content as one string).
//   NOTIFY_SECRET              — any random string; must match the
//                                NOTIFY_SECRET constant in
//                                js/firebase-config.js.

const admin = require('firebase-admin');

function getAdmin() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
  }
  return admin;
}

const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  try {
    const { type, orderId, secret } = req.body || {};
    if (!process.env.NOTIFY_SECRET || secret !== process.env.NOTIFY_SECRET) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    if (!type || !orderId) {
      res.status(400).json({ error: 'type and orderId are required' });
      return;
    }

    const app = getAdmin();
    const db = app.firestore();
    const orderSnap = await db.collection('orders').doc(orderId).get();
    if (!orderSnap.exists) {
      res.status(404).json({ error: 'order not found' });
      return;
    }
    const order = orderSnap.data();
    const link = '/';

    if (type === 'new_order') {
      const tokensSnap = await db.collection('admin_tokens').get();
      const tokens = tokensSnap.docs.map((d) => d.id).filter(Boolean);
      if (!tokens.length) { res.status(200).json({ sent: 0, reason: 'no admin tokens registered' }); return; }

      const message = {
        notification: {
          title: 'New order — Al Hadi Store',
          body: (order.fullName || 'Customer') + ' · ' + (order.totalAmount ? 'Rs. ' + order.totalAmount : '')
        },
        webpush: { fcmOptions: { link } },
        tokens
      };
      const result = await app.messaging().sendEachForMulticast(message);
      await cleanupInvalidTokens(db, 'admin_tokens', tokens, result);
      res.status(200).json({ sent: result.successCount, failed: result.failureCount });
      return;
    }

    if (type === 'order_status') {
      const token = order.customerFcmToken;
      if (!token) { res.status(200).json({ sent: 0, reason: 'customer has no push token' }); return; }
      const statusLabel = ORDER_STATUS_LABELS[String(order.status || 'pending').toLowerCase()] || order.status;

      const message = {
        notification: {
          title: 'Al Hadi Store — Order Update',
          body: 'Your order status: ' + statusLabel
        },
        webpush: { fcmOptions: { link } },
        token
      };
      try {
        await app.messaging().send(message);
        res.status(200).json({ sent: 1 });
      } catch (err) {
        if (err && (err.code === 'messaging/registration-token-not-registered')) {
          await db.collection('orders').doc(orderId).update({ customerFcmToken: admin.firestore.FieldValue.delete() });
        }
        res.status(200).json({ sent: 0, error: err.message });
      }
      return;
    }

    res.status(400).json({ error: 'unknown type' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function cleanupInvalidTokens(db, collection, tokens, result) {
  const deletes = [];
  result.responses.forEach((r, i) => {
    if (!r.success && r.error && r.error.code === 'messaging/registration-token-not-registered') {
      deletes.push(db.collection(collection).doc(tokens[i]).delete().catch(() => {}));
    }
  });
  if (deletes.length) await Promise.all(deletes);
}
