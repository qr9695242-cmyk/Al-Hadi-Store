// Shared helper: reads product documents straight out of Firestore over its
// public REST API (no service-account key needed — firestore.rules already
// allows "read: if true" on /products/*, the same permission the browser
// SDK uses to show the live catalog to shoppers).
//
// WHY THIS EXISTS
// The storefront's real product catalog lives in Firestore ("products"
// collection, edited from the admin panel) and is merged in the browser
// with a small static seed list in js/products-data.js. But two SEO-critical
// server-side pieces — api/product-og.js (link-preview / Googlebot HTML) and
// api/sitemap.js (sitemap.xml) — used to read ONLY the static seed file.
// Any product added purely through the admin panel (i.e. not in the seed
// file) was therefore invisible to Google and showed a generic preview when
// shared on WhatsApp — a real, silent SEO gap. This module fetches the live
// Firestore data so both of those stay in sync with whatever the admin
// panel actually shows shoppers.
//
// Fails soft everywhere: if Firestore is unreachable, callers just fall
// back to the static seed list instead of throwing.

const fs = require('fs');
const path = require('path');

const FIREBASE_PROJECT_ID = 'al-hadi-store-b';
const FIREBASE_API_KEY = 'AIzaSyAo4F7zUDA9mnwPdSXNZEB0B2t8CLZwG2s';
const FIRESTORE_BASE =
  'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT_ID + '/databases/(default)/documents';

function loadStaticProducts() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'js', 'products-data.js'), 'utf8');
    const jsonStr = raw.replace('window.EMBEDDED_PRODUCTS = ', '').trim().replace(/;$/, '');
    return JSON.parse(jsonStr).products || [];
  } catch (e) {
    return [];
  }
}

// Converts one Firestore REST "Value" object into a plain JS value.
function fsValue(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return ((v.arrayValue && v.arrayValue.values) || []).map(fsValue);
  if ('mapValue' in v) return fsFieldsToObject((v.mapValue && v.mapValue.fields) || {});
  return null;
}

function fsFieldsToObject(fields) {
  const out = {};
  Object.keys(fields || {}).forEach(function (k) {
    out[k] = fsValue(fields[k]);
  });
  return out;
}

// doc.name looks like ".../documents/products/prod_abc123" — id is the tail.
function fsDocToProduct(doc) {
  const obj = fsFieldsToObject(doc.fields || {});
  const parts = String(doc.name || '').split('/');
  obj.id = parts[parts.length - 1];
  return obj;
}

async function fetchAllFirestoreProducts() {
  if (typeof fetch !== 'function') return [];
  const out = [];
  let pageToken = '';
  try {
    do {
      const url =
        FIRESTORE_BASE + '/products?pageSize=300&key=' + FIREBASE_API_KEY +
        (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();
      (data.documents || []).forEach(function (doc) { out.push(fsDocToProduct(doc)); });
      pageToken = data.nextPageToken || '';
    } while (pageToken);
  } catch (e) {
    // Network hiccup / Firestore down — caller falls back to static list.
  }
  return out;
}

async function fetchFirestoreProductById(id) {
  if (typeof fetch !== 'function' || !id) return null;
  try {
    const url = FIRESTORE_BASE + '/products/' + encodeURIComponent(id) + '?key=' + FIREBASE_API_KEY;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = await res.json();
    if (!doc || !doc.fields) return null;
    return fsDocToProduct(doc);
  } catch (e) {
    return null;
  }
}

// Static entries are the seed/fallback; live Firestore entries win when the
// same id exists in both, and brand-new admin-added products get included —
// mirrors mergeProducts() in js/app.js so server output matches what
// shoppers actually see in the app.
function mergeProducts(staticList, liveList) {
  const byId = new Map();
  staticList.forEach(function (p) { byId.set(p.id, p); });
  liveList.forEach(function (p) { if (p && p.id) byId.set(p.id, p); });
  return Array.from(byId.values());
}

// Live (visible, sellable) products only — used for sitemap + OG lookups.
function isVisible(p) {
  return p && !p.hidden && !p.deleted;
}

// Keep in sync with slugify()/extractProductId() in js/app.js — same rules,
// so a link built by the browser (share button) and a link built by this
// server code (sitemap) look the same and resolve to the same product.
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/, '');
}

// Every product id in this catalog starts with "prod_" — recovers the real
// id whether the incoming ?p= value is a bare id (old links already shared/
// indexed) or "some-slug-prod_xyz" (new links).
function extractProductId(raw) {
  if (!raw) return raw;
  const m = String(raw).match(/prod_[A-Za-z0-9]+$/);
  return m ? m[0] : raw;
}

function slugUrl(product) {
  const slug = slugify(product.name);
  return slug ? (slug + '-' + product.id) : product.id;
}

module.exports = {
  loadStaticProducts,
  fetchAllFirestoreProducts,
  fetchFirestoreProductById,
  mergeProducts,
  isVisible,
  slugify,
  extractProductId,
  slugUrl,
};
