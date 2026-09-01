# Push Notifications Setup (FCM — bilkul free)

Code ready hai. Kaam karne ke liye 4 one-time steps hain:

## 1) VAPID key banayein (Firebase Console)
Firebase Console → apna project (`al-hadi-store-b`) → ⚙️ Project Settings →
"Cloud Messaging" tab → "Web Push certificates" → **Generate key pair**.
Jo long string milegi, usay `js/firebase-config.js` mein paste karein:
```js
const FCM_VAPID_KEY = 'yahan_paste_karein';
```

## 2) Service account key banayein (Vercel ke liye)
Firebase Console → ⚙️ Project Settings → "Service accounts" tab →
**Generate new private key** → ek `.json` file download hogi.

Vercel Dashboard → apna project → Settings → Environment Variables →
naya variable add karein:
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: us JSON file ka **poora content** copy-paste karein (ek line mein)

## 3) Ek secret set karein
Vercel Environment Variables mein ek aur variable add karein:
- Name: `NOTIFY_SECRET`
- Value: koi bhi random string (jaise `al-hadi-notify-2026`)

Yehi value `js/firebase-config.js` mein `NOTIFY_SECRET` constant mein bhi
honi chahiye (dono match hone chahiye).

## 4) Firestore rules deploy karein
Firebase Console → Firestore Database → Rules → `firestore.rules` file
ka content paste karein → Publish.

Uske baad Vercel par redeploy karein (git push, ya "Redeploy" button) —
`firebase-admin` package apne aap install ho jayega.

## Ye system kya karta hai
- **Customer**: order place karte waqt browser notification permission
  maangega (allow karna optional hai). Allow karne par, jab admin order
  ka status change karega (Confirmed/Shipped/Delivered), customer ke
  phone par push notification aa jayegi — app khula ho ya band.
- **Admin**: admin panel mein login karte waqt permission maangega.
  Allow karne ke baad, har naya order aane par foran push notification
  milegi — chahe admin ka phone site par na ho.
- Sab kuch fail-silent hai: agar permission deny ho ya setup adhoora
  ho, baaqi site (checkout, admin panel, orders) normal kaam karta
  rahega — sirf push notification skip ho jayegi.

## Note
- Offline support pehle se hi maujood hai (`service-worker.js`) — site
  ek dafa khulne ke baad bina internet ke bhi khulti hai (products,
  design sab cached hain). Ye alag se kuch karne ki zaroorat nahi thi.
- Push notifications sirf HTTPS par kaam karti hain (Vercel already
  HTTPS hai, so ye theek hai) — localhost pe test karna ho to
  `localhost` bhi allowed hai by browsers.
