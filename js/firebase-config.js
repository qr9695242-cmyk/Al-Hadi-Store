// Firebase configuration for Al Hadi Store
const firebaseConfig = {
  apiKey: "AIzaSyAo4F7zUDA9mnwPdSXNZEB0B2t8CLZwG2s",
  authDomain: "al-hadi-store-b.firebaseapp.com",
  projectId: "al-hadi-store-b",
  storageBucket: "al-hadi-store-b.firebasestorage.app",
  messagingSenderId: "773720271675",
  appId: "1:773720271675:web:01c1c2d5caa4e8a87c251e"
};

// Initialize Firebase (requires Firebase SDK <script> tags loaded in index.html first)
firebase.initializeApp(firebaseConfig);

// ---------- Push Notifications (Firebase Cloud Messaging) ----------
// 1) Get this from: Firebase Console → Project Settings → Cloud Messaging
//    → "Web Push certificates" → generate/copy the key pair (the long string).
// 2) Paste it below, replacing the placeholder. Without this, push
//    notifications silently stay off (rest of the site works fine).
const FCM_VAPID_KEY = 'BL9fVE5PnCJctGW6hfCWA8mXfkw_-Aic1ls2mXH1NmR6MxnI3l3_xIDuF56BIbW0BtVyUbkBZWj273k_Cs7ihKA';

// A shared secret so /api/notify only accepts requests from this site.
// It lives in public JS (anyone can read it) so it's not real security —
// just a filter against random bots hitting the endpoint. Set the SAME
// value as the NOTIFY_SECRET environment variable in Vercel.
const NOTIFY_SECRET = 'al-hadi-notify-2026';
