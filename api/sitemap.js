// Runs on Vercel as a Serverless Function, served at /sitemap.xml
// (see the rewrite in vercel.json).
//
// SEO FIX: the old sitemap.xml was a hand-written static file listing only
// the 9 products that existed when it was last edited. The storefront's
// real catalog lives in Firestore and grows/shrinks from the admin panel —
// none of that ever reached the sitemap, so Google had no reliable way to
// discover new products (or notice removed ones) without a manual sitemap
// edit every time. This function builds the sitemap fresh on every request
// from the live product list, so it always matches what's actually for
// sale, with zero manual maintenance.

const { loadStaticProducts, fetchAllFirestoreProducts, mergeProducts, isVisible, slugUrl } = require('./_firestore-products');

const SITE_URL = 'https://alhadi.store';

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about-us.html', changefreq: 'monthly', priority: '0.4' },
  { path: '/faq.html', changefreq: 'monthly', priority: '0.4' },
  { path: '/privacy-policy.html', changefreq: 'monthly', priority: '0.3' },
  { path: '/refund-policy.html', changefreq: 'monthly', priority: '0.3' },
  { path: '/shipping-policy.html', changefreq: 'monthly', priority: '0.3' },
  { path: '/terms-conditions.html', changefreq: 'monthly', priority: '0.3' },
];

function xmlEscape(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return (
    '  <url>\n' +
    '    <loc>' + xmlEscape(loc) + '</loc>\n' +
    '    <lastmod>' + lastmod + '</lastmod>\n' +
    '    <changefreq>' + changefreq + '</changefreq>\n' +
    '    <priority>' + priority + '</priority>\n' +
    '  </url>\n'
  );
}

module.exports = async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const staticProducts = loadStaticProducts();
    const liveProducts = await fetchAllFirestoreProducts();
    const products = mergeProducts(staticProducts, liveProducts).filter(isVisible);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    STATIC_PAGES.forEach(function (page) {
      xml += urlEntry(SITE_URL + page.path, today, page.changefreq, page.priority);
    });

    products.forEach(function (p) {
      if (!p || !p.id) return;
      xml += urlEntry(SITE_URL + '/?p=' + encodeURIComponent(slugUrl(p)), today, 'weekly', '0.7');
    });

    xml += '</urlset>\n';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // s-maxage lets Vercel's edge cache serve this instantly while still
    // refreshing at most once an hour — new products show up within the
    // hour instead of needing a manual redeploy.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (err) {
    // Even on total failure, return a minimal valid sitemap rather than a
    // 500 — a sitemap with just the homepage is far better for SEO than a
    // broken response Google will retry and eventually flag as an error.
    const fallback =
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urlEntry(SITE_URL + '/', today, 'daily', '1.0') +
      '</urlset>\n';
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(fallback);
  }
};
