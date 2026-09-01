// Runs on Vercel as a Serverless Function.
// Purpose: link-preview crawlers (WhatsApp, Facebook, Instagram, Telegram,
// Googlebot, etc.) do NOT execute JavaScript — they only read the raw HTML
// of the page. Our SPA updates <meta property="og:..."> tags via js/app.js
// after the page loads, which works fine for real visitors but is invisible
// to those crawlers. So every shared product link was showing the site's
// default homepage image instead of the product photo.
//
// vercel.json rewrites requests that (a) contain ?p=<productId> AND
// (b) come from a known crawler User-Agent to this function instead of the
// static index.html. This function reads the product, swaps in its title /
// description / photo into the HTML's <head>, and returns that — so the
// crawler sees the right picture. Everyone else still gets the normal SPA.
//
// SEO FIX: this used to only look up products in the static
// js/products-data.js seed file. Any product added purely from the admin
// panel (stored in Firestore, not in that seed file) fell through silently
// — Googlebot and WhatsApp/Facebook crawlers got the generic homepage
// instead of that product's title/photo/price. Now it also checks the live
// Firestore "products" collection (public read, see firestore.rules) so
// every product the admin adds gets a correct preview and a Product
// JSON-LD block for Google, not just the original seed products.

const fs = require('fs');
const path = require('path');
const { loadStaticProducts, fetchFirestoreProductById, isVisible, extractProductId, slugUrl } = require('./_firestore-products');

const SITE_URL = 'https://al-hadi-store.vercel.app';

function escapeAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function absoluteUrl(p) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  return SITE_URL + '/' + String(p).replace(/^\//, '');
}

async function findProduct(id) {
  if (!id) return null;
  const fromStatic = loadStaticProducts().find((x) => x.id === id);
  // Firestore is the source of truth when the admin has edited this exact
  // product (price/name/photo changes, or hides/deletes it) — prefer it,
  // but don't let a Firestore hiccup hide a perfectly good seed product.
  const fromLive = await fetchFirestoreProductById(id);
  const product = fromLive || fromStatic || null;
  if (!product || !isVisible(product)) return null;
  return product;
}

function buildProductJsonLd(product, url, img) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: img,
    description: (product.desc ? String(product.desc).replace(/\s+/g, ' ').trim() : product.name).slice(0, 500),
    sku: product.productCode || product.id,
    url: url,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: Number(product.price || 0),
      availability: product.stockStatus === 'out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: url,
    },
  };
  if (product.rating) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating),
      reviewCount: Number(product.ratingCount || 1),
    };
  }
  // JSON.stringify + escaping "</" avoids the string ever accidentally
  // closing the surrounding <script> tag if a title/desc contains it.
  return JSON.stringify(data).replace(/<\//g, '<\\/');
}

module.exports = async (req, res) => {
  try {
    const rawParam = (req.query && req.query.p) || '';
    const id = extractProductId(rawParam);
    const indexPath = path.join(process.cwd(), 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    const product = await findProduct(id);

    if (product) {
      const title = escapeAttr(product.name + ' | Al Hadi Store');
      const rawDesc = product.desc
        ? String(product.desc).replace(/\s+/g, ' ').trim()
        : (product.name + ' — available now at Al Hadi Store. Rs ' + Number(product.price || 0).toLocaleString('en-PK') + '.');
      const desc = escapeAttr(rawDesc.length > 160 ? rawDesc.slice(0, 157) + '...' : rawDesc);
      const firstImage = product.images && product.images[0] && product.images[0].src;
      const img = escapeAttr(absoluteUrl(firstImage) || (SITE_URL + '/assets/og-image.png'));
      const url = escapeAttr(SITE_URL + '/?p=' + encodeURIComponent(slugUrl(product)));

      html = html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
        .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`)
        .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
        .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
        .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
        .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${desc}">`)
        .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${img}">`)
        .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${title}">`)
        .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${desc}">`)
        .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${img}">`);

      // Server-rendered Product schema so Google can pick up price/stock/
      // rating for this product even before/without executing app.js's
      // client-side injectProductSchema().
      const jsonLd = `<script type="application/ld+json">${buildProductJsonLd(product, url, img)}</script>\n</head>`;
      html = html.replace('</head>', jsonLd);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.status(200).send(html);
  } catch (err) {
    // On any failure, fall back to the plain homepage rather than erroring out.
    try {
      const fallback = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(fallback);
    } catch (e2) {
      res.status(500).send('Error generating preview');
    }
  }
};
