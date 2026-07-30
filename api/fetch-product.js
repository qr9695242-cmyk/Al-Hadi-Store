// Runs on Vercel as a Serverless Function.
// Purpose: Admin panel "Link Se Add Karein" feature. Admin pastes a product
// link from the supplier / wholesale site ("markaz"), and this function
// fetches that page server-side (browsers can't do this directly — most
// sites block cross-origin fetches) and pulls out whatever product info it
// can find: name, description, price, and a delivery/shipping charge if the
// page mentions one. The admin still adds the photo(s) themselves.
//
// This is best-effort scraping, not a guaranteed exact match — different
// supplier sites structure their pages differently. It tries, in order:
//   1) schema.org "Product" JSON-LD (most Shopify/WooCommerce sites have this)
//   2) Open Graph / standard meta tags
//   3) A loose text search for a delivery/shipping charge mentioned on the page
//
// No external npm packages are used (kept dependency-free like product-og.js).

const MAX_HTML_BYTES = 3 * 1024 * 1024; // don't buffer more than ~3MB of HTML
const FETCH_TIMEOUT_MS = 12000;

function isPrivateHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local')) return true;
  // block IPv4 private / loopback / link-local ranges and the cloud metadata IP
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  if (h === '::1') return true;
  return false;
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .trim();
}

function extractMeta(html, key) {
  // matches <meta property="X" content="Y"> or <meta name="X" content="Y">, either attribute order
  const patterns = [
    new RegExp('<meta[^>]+(?:property|name)=["\']' + key + '["\'][^>]+content=["\']([^"\']*)["\']', 'i'),
    new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']' + key + '["\']', 'i')
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeEntities(m[1]);
  }
  return null;
}

function extractAllMeta(html, key) {
  const out = [];
  const re = new RegExp('<meta[^>]+(?:property|name)=["\']' + key + '["\'][^>]+content=["\']([^"\']*)["\']', 'gi');
  let m;
  while ((m = re.exec(html))) out.push(decodeEntities(m[1]));
  return out;
}

function extractJsonLdProduct(html) {
  const blocks = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) blocks.push(m[1]);

  function flatten(node, out) {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(n => flatten(n, out)); return; }
    if (typeof node !== 'object') return;
    if (node['@graph']) flatten(node['@graph'], out);
    out.push(node);
  }

  for (const raw of blocks) {
    let parsed;
    try { parsed = JSON.parse(raw.trim()); } catch (e) { continue; }
    const flat = [];
    flatten(parsed, flat);
    const product = flat.find(n => {
      const t = n['@type'];
      return t === 'Product' || (Array.isArray(t) && t.includes('Product'));
    });
    if (product) return product;
  }
  return null;
}

function numberFromPriceString(v) {
  if (v == null) return null;
  const cleaned = String(v).replace(/[^\d.]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : Math.round(n);
}

function findDeliveryCharge(plainText) {
  // Looks for phrases like "Delivery Charges: Rs 200" / "Shipping fee PKR 150" etc.
  const re = /(delivery|shipping)[^.\n\d]{0,25}(?:rs\.?|pkr|₨)?\s*([\d,]{2,6})/i;
  const m = plainText.match(re);
  if (!m) return null;
  const n = numberFromPriceString(m[2]);
  if (n == null || n <= 0 || n > 20000) return null; // sanity bounds
  return n;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const rawUrl = (req.query && req.query.url) || '';
  let target;
  try {
    target = new URL(rawUrl);
  } catch (e) {
    return res.status(400).json({ ok: false, message: 'Link sahi format mein nahi hai.' });
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return res.status(400).json({ ok: false, message: 'Sirf http/https links chalte hain.' });
  }
  if (isPrivateHost(target.hostname)) {
    return res.status(400).json({ ok: false, message: 'Yeh link support nahi hota.' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html;
  try {
    const response = await fetch(target.toString(), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AlHadiStoreBot/1.0; +https://alhadi.store)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    clearTimeout(timer);
    if (!response.ok) {
      return res.status(200).json({ ok: false, message: 'Markaz ki site ne page nahi diya (status ' + response.status + '). Link check karein.' });
    }
    const reader = response.body ? response.body.getReader() : null;
    if (reader) {
      const chunks = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX_HTML_BYTES) break;
        chunks.push(value);
      }
      html = Buffer.concat(chunks.map(c => Buffer.from(c))).toString('utf8');
    } else {
      html = await response.text();
    }
  } catch (err) {
    clearTimeout(timer);
    const msg = (err && err.name === 'AbortError')
      ? 'Markaz ki site jawab dene mein bohot time le rahi hai.'
      : 'Is link se detail nahi la saka — site tak pohanch nahi hui.';
    return res.status(200).json({ ok: false, message: msg });
  }

  try {
    const jsonLd = extractJsonLdProduct(html);

    let name = null, description = null, price = null, images = [];

    if (jsonLd) {
      name = decodeEntities(typeof jsonLd.name === 'string' ? jsonLd.name : null);
      description = decodeEntities(typeof jsonLd.description === 'string' ? jsonLd.description : null);
      let offers = jsonLd.offers;
      if (Array.isArray(offers)) offers = offers[0];
      if (offers) {
        price = numberFromPriceString(offers.price || offers.lowPrice);
      }
      let img = jsonLd.image;
      if (typeof img === 'string') images = [img];
      else if (Array.isArray(img)) images = img.filter(x => typeof x === 'string');
      else if (img && img.url) images = [img.url];
    }

    if (!name) name = extractMeta(html, 'og:title');
    if (!description) description = extractMeta(html, 'og:description') || extractMeta(html, 'description');
    if (!price) {
      const priceMeta = extractMeta(html, 'product:price:amount') || extractMeta(html, 'og:price:amount') || extractMeta(html, 'twitter:data1');
      price = numberFromPriceString(priceMeta);
    }
    if (!images.length) {
      const ogImages = extractAllMeta(html, 'og:image');
      if (ogImages.length) images = ogImages;
    }
    if (!name) {
      const t = html.match(/<title>([\s\S]*?)<\/title>/i);
      if (t) name = decodeEntities(t[1]);
    }

    const plainText = decodeEntities(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    const deliveryCharge = findDeliveryCharge(plainText);

    if (!name && !price) {
      return res.status(200).json({ ok: false, message: 'Is page se product ki detail nahi mil saki. Naam/price khud likh lein.' });
    }

    return res.status(200).json({
      ok: true,
      name: name || null,
      description: description || null,
      price: price,
      images: images.slice(0, 5),
      deliveryCharge: deliveryCharge,
      sourceUrl: target.toString()
    });
  } catch (err) {
    return res.status(200).json({ ok: false, message: 'Page parse karte waqt masla hua.' });
  }
};
