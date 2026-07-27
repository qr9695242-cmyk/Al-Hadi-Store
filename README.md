# Al Hadi Store

## Phase 3 Progress: CSV Bulk Upload + Analytics

- **CSV Bulk Upload**: Admin Panel → "Bulk Upload" tab. Pehle "Sample CSV
  Download Karein" se format dekh lein, phir apni products list usi
  format mein CSV file mein bana kar upload kar dein — ek sath saare
  products add ho jayenge. Har product ki image(s) ka link (URL) dena
  zaroori hai; ek se zyada links ho to unke darmiyan `;` (semicolon)
  lagayein.
- **Analytics**: Admin Panel → "Analytics" tab — total site visits,
  product views, add-to-cart count, total orders aur revenue, aur sab se
  zyada dekhe/cart mein dale gaye products ki list. Ye Firestore ke
  `analytics/summary` document mein counters ke tor par save hota hai.
  `FIRESTORE_RULES.txt` mein iske liye naya rule shamil kar diya gaya
  hai — Firebase Console → Firestore Database → Rules mein updated file
  paste kar ke "Publish" dabana na bhoolein.
- **Cloudinary image migration**: Abhi baaqi hai — iske liye Cloudinary
  (cloudinary.com) par free account bana kar Cloud Name, API Key, aur
  API Secret dena hoga.

## Phase 2 Update: File Size Optimization

Pehle `js/products-data.js` mein har product ki tasveer seedha base64 text
ke tor par likhi hui thi — is wajah se ye file akele 1.6MB ki ho gayi thi,
aur `index.html` bhi 568KB tak pohnch gaya tha (usme bhi logo base64 mein
tha). Is wajah se site load hone mein time lagta tha, kyunki poori file ek
sath download honi parti thi.

Ab saari tasveerein alag chhoti files ke tor par `assets/products/` aur
`assets/icons/` mein rakhi gayi hain, aur code sirf unka path use karta
hai:

- `index.html`: 568KB → 36KB
- `js/products-data.js`: 1.6MB → 16KB
- Tasveerein ab browser cache kar sakta hai aur zaroorat ke mutabiq
  parallel mein load hoti hain — site pehle se kaafi tez khulegi.

Koi functionality nahi badli — admin panel, cart, orders, likes, sab
pehle jaisa hi kaam karega. Ye sirf backend/file-structure ki behtari hai.

## Folder Structure
- index.html            -> Main HTML file (Firebase SDK + config linked)
- css/style.css          -> All page styling
- js/products-data.js    -> Default/base product catalog (embedded)
- js/app.js              -> Main application logic (cart, admin panel, rendering)
- js/firebase-config.js  -> Firebase project configuration + initialization

## IMPORTANT: Firestore setup zaroori hai (product-sync fix)

Pehle admin panel se add kiya hua product sirf usi device/browser par dikhta
tha (kyunki woh `localStorage` mein save hota tha). Ab ye Firebase Firestore
mein save hota hai — is wajah se HAR device/browser par, jahan bhi site
khulegi, wahi product turant (real-time) dikhega.

Isay kaam karne ke liye Firebase Console mein 2 kaam karne hain:

### 1) Firestore Database enable karein
1. https://console.firebase.google.com par jayein → apna project
   (`al-hadi-store-b`) kholein.
2. Left menu se "Firestore Database" → "Create database" click karein.
3. "Start in test mode" select karein (abhi ke liye) → Enable.

### 2) Firestore Rules set karein
Firestore Database → "Rules" tab mein ye paste karein (sab visitors
products PADH saken, sirf jinke paas admin panel access hai woh WRITE
kar saken — abhi ke liye simple open-write rule diya hai, jise baad mein
Firebase Auth se aur secure kiya ja sakta hai):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if true;   // TODO: baad mein admin-only banayein
    }
  }
}
```

"Publish" dabayein.

> Security note: `allow write: if true` ka matlab hai koi bhi (jo Firestore
> ka URL/keys jaanta ho) products likh sakta hai. Filhaal admin panel
> pehle se hi ek password se protected hai (site ke andar), lekin behtar
> hoga ke aage chal kar Firebase Authentication (email/password) admin
> login ke sath jorein aur rule ko `allow write: if request.auth != null;`
> kar dein. Agar ye chahiye ho to bata dein, main add kar dunga.

Deploy (Vercel/GitHub Pages) karne ke baad bas upar wale 2 steps karein —
uske baad admin panel se add/edit/delete/hide kiya gaya har product turant
har visitor/device par nazar aayega.

## User Accounts + Liked ("pasandeeda") Products

Ab site par har visitor "My Account" (header ka account icon, ya bottom
nav ka "Account" button) se apna email/password account bana sakta hai.
Login karne ke baad har product card aur product detail page par ek heart
icon dikhta hai — usay tap karke product ko "liked" list mein save kiya
ja sakta hai. Ye list Firebase Firestore mein (`users/{uid}` document,
field `likes`) save hoti hai, is liye jis bhi device se woh user login
kare, usay apni saari liked products wahin milengi.

Isay kaam karne ke liye Firebase Console mein Firestore Rules update
karni zaroori hain (upar wale `products` collection ke rules ke sath,
ye naya block bhi shamil karein):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if true;   // TODO: baad mein admin-only banayein
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Aur Firebase Console mein "Authentication" section kholkar
"Email/Password" sign-in method ko enable karna zaroori hai (Authentication
→ Sign-in method → Email/Password → Enable → Save). Iske baghair
sign up/login kaam nahi karega.

## Orders Dashboard (Admin) + Order Tracking (Customer)

Ab jab customer checkout complete karta hai, order Firestore ke `orders`
collection mein bhi save hota hai (email aur Google Sheets ke sath-sath,
jo pehle se kaam kar rahe thay).

- **Admin ke liye**: Admin Panel kholein → upar "Orders" tab par tap karein.
  Har order ka naam, phone, address, items, total aur ek status dropdown
  (Pending / Confirmed / Shipped / Delivered / Cancelled) dikhta hai —
  dropdown change karte hi status turant save ho jata hai aur customer
  bhi apni taraf status update dekh sakta hai.
- **Customer ke liye**: Account icon → "Mera Order Track Karein" par tap
  karein. Jis device se order place kiya usi par order list khud dikh
  jati hai; kisi doosray device se dekhna ho to apna phone number daal
  kar "Dhoondain" dabayein.

Isay kaam karne ke liye Firestore Rules mein `orders` collection ka block
add karna zaroori hai — `FIRESTORE_RULES.txt` file mein updated rules
already maujood hain, Firebase Console → Firestore Database → Rules mein
paste karke "Publish" dabayein.

> Security note: filhaal `orders` collection bhi products ki tarah open
> hai (`allow read, write: if true`) — admin panel sirf app ke andar
> password se protected hai, Firebase Auth session nahi banata. Zyada
> security chahiye ho to Firebase Authentication admin login ke sath
> jorna hoga; agar ye chahiye ho to bata dein.

## Product share (photo ke sath) aur website link preview

- **"Share this product" button** ab (jahan phone/browser support kare, jaise
  Android/WhatsApp) product ki tasveer bhi sath attach karta hai, aur link
  us specific product ko point karta hai (`?p=product-id`) — jo kholega,
  seedha wahi product open hoga. Agar file-share support na ho to text +
  link hi jayega jaisa pehle hota tha.
- **Website ka link** (jaise home page) jab WhatsApp/Facebook/Instagram
  mein paste kiya jaye to ab title, description, aur store logo wala
  preview card banta hai (`assets/og-image.png`, favicon se banaya gaya
  hai — chahen to isay apni marzi ki tasveer se replace kar sakte hain).
- Deploy karne ke baad, `index.html` ke `<head>` mein `og:url` wala
  comment dekh kar apna live domain add kar dein (optional hai, iske
  baghair bhi preview kaam karega).
- **Limitation:** yeh site static hai, is liye agar koi product ka link
  seedha copy karke WhatsApp mein paste kare (Share button use kiye
  baghair), to us waqt bhi generic store wala preview hi dikhega — us
  specific product ki tasveer wala preview nahi. Har product ka apna
  alag preview (link paste karne par bhi) chahiye ho to iske liye server
  side par ek chhota function chahiye hoga (Vercel par possible hai) —
  agar ye chahiye ho to bata dein.
