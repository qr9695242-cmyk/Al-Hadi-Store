
/* ============================================================
   Al Hadi Store — marketplace front-end
   WITH GOOGLE SHEETS ORDER TRACKING ✅
   ============================================================ */
const DELIVERY_CHARGE = 200;
const CATEGORY_LABELS = {
  kapray:'Clothing', joote:'Footwear', mobile:'Mobile & Accessories',
  exercise:'Fitness', electronics:'Electronics', other:'Lifestyle'
};

const CATEGORY_ICONS = {
  kapray:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 3 4 6l1.5 3L8 8v13h8V8l2.5 1L20 6l-4-3-2 2h-4z"/></svg>',
  joote:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 18v-4c2-.3 3-1 4-2l2-2c1 1.2 2.4 2 4 2h3.5c1.9 0 3.5 1.6 3.5 3.5V18z"/><path d="M3 18h18M6 10l2-3M14 10l2-3"/></svg>',
  mobile:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
  electronics:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.8 2.8M16.2 16.2l2.8 2.8"/></svg>',
  exercise:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6.5 6.5 17.5 17.5M4 9l3-3M17 20l3-3M2 11l3 3M18 5l3 3"/></svg>',
  other:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.6 12.3 12.3 20.6a1.5 1.5 0 0 1-2.1 0l-7-7a1.5 1.5 0 0 1 0-2.1L11.5 3.2a1.5 1.5 0 0 1 2.1 0l7 7c.6.6.6 1.5 0 2.1z"/></svg>'
};

let ALL_PRODUCTS = [];
let CART = [];
let currentFilter = 'all';
let currentSearch = '';
let PD = { product:null, index:0 };
let currentUser = null;
let USER_LIKES = new Set();

/* ---------- Google Sheets Integration ---------- */
// ⚠️ آپ کو اپنا Google Sheets Script URL یہاں paste کرنا ہے
// Setup instructions نیچے دیے ہیں
const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_URL_HERE';

/* ---------- shareable product links (?p=productId) ---------- */
const PRODUCT_URL_PARAM = 'p';
let deepLinkOpened = false;

function productShareURL(id){
  return location.origin + location.pathname + '?' + PRODUCT_URL_PARAM + '=' + encodeURIComponent(id);
}
/* Called after products are loaded (base catalog + Firestore sync) to
   auto-open the product a shared link points to. Safe to call multiple
   times — no-ops once the deep link has been handled. */
function openProductFromURL(){
  if(deepLinkOpened) return;
  const id = new URLSearchParams(location.search).get(PRODUCT_URL_PARAM);
  if(!id) return;
  const p = ALL_PRODUCTS.find(x => x.id === id);
  if(!p) return; // not loaded yet (e.g. admin-added product still syncing) — retried on next call
  deepLinkOpened = true;
  openProduct(id, true);
}
window.addEventListener('popstate', function(){
  const id = new URLSearchParams(location.search).get(PRODUCT_URL_PARAM);
  const p = id ? ALL_PRODUCTS.find(x => x.id === id) : null;
  if(p){ openProduct(id, true); }
  else{
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow='';
  }
});

/* ---------- helpers ---------- */
function money(n){ return 'Rs ' + Number(n||0).toLocaleString('en-PK'); }
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function discountPct(p){ if(!p.oldPrice || p.oldPrice<=p.price) return 0; return Math.round((1 - p.price/p.oldPrice)*100); }
function firstImg(p){ return (p.images && p.images[0] && p.images[0].src) || ''; }
function catLabel(c){ return CATEGORY_LABELS[c] || (c ? c.charAt(0).toUpperCase()+c.slice(1) : 'Lifestyle'); }
function starSvg(){ return '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.7l.9-5.4L4.2 8.7l5.4-.8z"/></svg>'; }

/* ---------- product rendering ---------- */
function heartSvg(filled){
  return '<svg width="16" height="16" viewBox="0 0 24 24" '+(filled?'fill="currentColor" stroke="currentColor"':'fill="none" stroke="currentColor"')+' stroke-width="2"><path d="M12 21s-7.5-4.6-10-7.5C-.3 11.5 1.5 6 5.5 6c2 0 3.5 1 6.5 4 3-3 4.5-4 6.5-4 4 0 5.8 5.5 3.5 7.5-2.5 2.9-10 7.5-10 7.5z"/></svg>';
}

function renderProductCard(p){
  const disc = discountPct(p);
  const wished = USER_LIKES.has(p.id);
  const outOfStock = (p.stockStatus==='out') || (p.stockQty!=null && p.stockQty<=0);
  return (
    '<article class="pcard" onclick="openProduct(\''+p.id+'\')">'+
      '<div class="pcard-img">'+
        '<img src="'+firstImg(p)+'" alt="'+escapeHtml(p.name)+'" loading="lazy">'+
        (disc>0 ? '<span class="badge-disc">-'+disc+'%</span>' : '')+
        (p.badge ? '<span class="badge-tag">'+escapeHtml(p.badge)+'</span>' : '')+
        (outOfStock ? '<span class="badge-tag" style="left:auto;right:9px;top:9px;background:#c0392b;">Out of Stock</span>' : '')+
        '<button class="wish'+(wished?' on':'')+'" onclick="event.stopPropagation();toggleLike(\''+p.id+'\')" aria-label="'+(wished?'Remove from liked products':'Save to liked products')+'">'+heartSvg(wished)+'</button>'+
      '</div>'+
      '<div class="pcard-body">'+
        '<h3 class="pcard-name">'+escapeHtml(p.name)+'</h3>'+
        '<div class="pcard-price"><span class="now">'+money(p.price)+'</span>'+(p.oldPrice&&p.oldPrice>p.price?'<span class="was">'+money(p.oldPrice)+'</span>':'')+'</div>'+
        '<div class="pcard-meta">'+
          (p.rating ? '<span class="rating">'+starSvg()+'<span class="num">'+p.rating+'</span></span><span class="sep">|</span>' : '')+
          '<span class="sold">'+(p.sold?p.sold+' sold':catLabel(p.category))+'</span>'+
        '</div>'+
        (outOfStock
          ? '<button class="pcard-add" disabled style="opacity:.55;cursor:not-allowed;" onclick="event.stopPropagation();">Out of Stock</button>'
          : '<button class="pcard-add" onclick="event.stopPropagation();quickAdd(\''+p.id+'\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>Add</button>')+
      '</div>'+
    '</article>'
  );
}

/* Flash Sale products first, then New, then everything else. Sort is stable
   (native Array#sort preserves relative order within same rank), so within
   each group products keep their existing order. */
function productRank(p){
  if(p.flashSale) return 0;
  if(p.badge === 'New') return 1;
  return 2;
}

function normKey(s){ return String(s||'').trim().toLowerCase(); }
/* Grouping key: two categories are "the same" if their display label matches
   once trimmed/lowercased — this is what stops "Clothing" and "kapray" (or
   "Clothing" typed twice with different spacing) from showing as separate
   category buttons. */
function catKey(c){ return normKey(catLabel(c)); }
/* label(lowercase) -> official predefined category code, e.g. 'clothing' -> 'kapray'.
   Used so a manually-typed category that matches a known one re-uses its code/icon. */
const PREDEFINED_KEY_TO_CODE = {};
Object.keys(CATEGORY_LABELS).forEach(code => { PREDEFINED_KEY_TO_CODE[normKey(CATEGORY_LABELS[code])] = code; });
let CATEGORY_GROUPS = {}; // key -> { label, code }

function renderProducts(){
  const grid = document.getElementById('productGrid');
  const info = document.getElementById('resultInfo');
  let list = ALL_PRODUCTS.filter(p => !p.hidden);
  if(currentFilter !== 'all') list = list.filter(p => catKey(p.category) === currentFilter);
  if(currentSearch){
    const q = currentSearch.toLowerCase();
    list = list.filter(p => (p.name+' '+(p.desc||'')+' '+catLabel(p.category)).toLowerCase().includes(q));
  }
  list = list.slice().sort((a,b) => productRank(a) - productRank(b));
  if(list.length === 0){
    grid.innerHTML = '<div class="empty"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><b>Koi product nahi mila</b><p>Doosri category try karein ya search badlein.</p></div>';
  } else {
    grid.innerHTML = list.map(renderProductCard).join('');
  }
  if(info){
    if(currentSearch) info.textContent = list.length+' result'+(list.length!==1?'s':'')+' for "'+currentSearch+'"';
    else if(currentFilter!=='all') info.textContent = list.length+' item'+(list.length!==1?'s':'')+' in '+((CATEGORY_GROUPS[currentFilter]&&CATEGORY_GROUPS[currentFilter].label)||catLabel(currentFilter));
    else info.textContent = 'Browse the full Al Hadi Store collection';
  }
}

/* ---------- category tabs & nav ---------- */
function buildCategories(){
  // Group every product's category by its display label so near-duplicate
  // category values (different casing/spelling meaning the same thing) collapse
  // into a single tab/circle instead of showing twice.
  const groups = {};
  ALL_PRODUCTS.forEach(p => {
    const raw = p.category || 'other';
    const key = catKey(raw);
    if(!groups[key]) groups[key] = { label: catLabel(raw), code: PREDEFINED_KEY_TO_CODE[key] || raw };
  });
  CATEGORY_GROUPS = groups;
  const keys = Object.keys(groups);

  const tabs = document.getElementById('catTabs');
  let th = '<button class="active" data-cat="all" onclick="setFilter(\'all\')">All Products</button>';
  keys.forEach(k => th += '<button data-cat="'+escapeHtml(k)+'" onclick="setFilter(\''+k+'\')">'+escapeHtml(groups[k].label)+'</button>');
  tabs.innerHTML = th;

  const nav = document.getElementById('catNav');
  let nh = '<a href="#shop" class="active" onclick="setFilter(\'all\')">All</a>';
  keys.forEach(k => nh += '<a href="#shop" onclick="setFilter(\''+k+'\')">'+escapeHtml(groups[k].label)+'</a>');
  nh += '<a href="#payment">Payment</a><a href="mailto:qraza2376@gmail.com">Contact</a>';
  nav.innerHTML = nh;

  const circles = document.getElementById('catCircles');
  if(circles){
    let ch = '<button class="cat-circle active" data-cat="all" onclick="setFilter(\'all\')"><span class="ring">'+
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'+
      '</span><span>All</span></button>';
    keys.forEach(k => {
      ch += '<button class="cat-circle" data-cat="'+escapeHtml(k)+'" onclick="setFilter(\''+k+'\')"><span class="ring">'+
        (CATEGORY_ICONS[groups[k].code]||CATEGORY_ICONS.other)+'</span><span>'+escapeHtml(groups[k].label)+'</span></button>';
    });
    circles.innerHTML = ch;
  }

  const marquee = document.getElementById('marqueeTrack');
  if(marquee){
    const items = ['Sale Is Live','Free Shipping On Orders Over Rs 3000','Cash On Delivery Available','100% Original Products','Easy Returns Within 3 Days'];
    const one = items.map(t => '<span class="marquee-item"><span class="pct">%</span>'+escapeHtml(t)+'</span>').join('');
    marquee.innerHTML = '<span class="marquee-set">'+one+'</span><span class="marquee-set">'+one+'</span>';
  }

  populateCategoryDropdown();
}

/* ---------- admin "add product" category dropdown ---------- */
function populateCategoryDropdown(){
  const sel = document.getElementById('apCategory');
  if(!sel) return;
  const prevValue = sel.value;
  // Predefined categories first (in a fixed, friendly order), then any extra
  // categories that exist in real product data but aren't predefined.
  const order = ['kapray','joote','mobile','exercise','electronics','other'];
  const seen = new Set();
  let oh = '';
  order.forEach(code => {
    const key = normKey(CATEGORY_LABELS[code]);
    seen.add(key);
    oh += '<option value="'+escapeHtml(code)+'">'+escapeHtml(CATEGORY_LABELS[code])+'</option>';
  });
  Object.keys(CATEGORY_GROUPS).forEach(key => {
    if(seen.has(key)) return;
    seen.add(key);
    oh += '<option value="'+escapeHtml(CATEGORY_GROUPS[key].code)+'">'+escapeHtml(CATEGORY_GROUPS[key].label)+'</option>';
  });
  oh += '<option value="__new__">+ Naya Category</option>';
  sel.innerHTML = oh;
  if(prevValue && Array.from(sel.options).some(o=>o.value===prevValue)) sel.value = prevValue;
}

function onCategorySelectChange(){
  const sel = document.getElementById('apCategory');
  const newInput = document.getElementById('apCategoryNew');
  if(!sel || !newInput) return;
  const isNew = sel.value === '__new__';
  newInput.style.display = isNew ? 'block' : 'none';
  if(!isNew) newInput.value = '';
}

/* Selects the dropdown option matching a product's raw category (used when
   opening the edit-product form), falling back to "+ Naya Category" with the
   raw value pre-filled if it truly doesn't match anything known yet. */
function setCategoryFieldValue(rawCategory){
  const sel = document.getElementById('apCategory');
  const newInput = document.getElementById('apCategoryNew');
  if(!sel) return;
  const key = catKey(rawCategory || 'other');
  const code = PREDEFINED_KEY_TO_CODE[key] || (CATEGORY_GROUPS[key] && CATEGORY_GROUPS[key].code) || rawCategory;
  const hasOption = Array.from(sel.options).some(o=>o.value===code);
  if(hasOption){
    sel.value = code;
    if(newInput){ newInput.style.display='none'; newInput.value=''; }
  } else {
    sel.value = '__new__';
    if(newInput){ newInput.style.display='block'; newInput.value = rawCategory || ''; }
  }
}

function setFilter(cat){
  currentFilter = cat;
  document.querySelectorAll('#catTabs button').forEach(b => b.classList.toggle('active', b.dataset.cat===cat));
  document.querySelectorAll('#catCircles button').forEach(b => b.classList.toggle('active', b.dataset.cat===cat));
  document.querySelectorAll('#catNav a').forEach(a => a.classList.remove('active'));
  renderProducts();
  const shop = document.getElementById('shop');
  if(shop) shop.scrollIntoView({behavior:'smooth'});
}


/* ---------- search ---------- */
document.getElementById('searchInput').addEventListener('input', function(){
  currentSearch = this.value.trim();
  renderProducts();
});
function focusResults(){ document.getElementById('shop').scrollIntoView({behavior:'smooth'}); }

/* ---------- product detail modal ---------- */
function openProduct(id, fromURL){
  const p = ALL_PRODUCTS.find(x => x.id===id);
  if(!p) return;
  PD = { product:p, index:0, size:(p.sizes&&p.sizes.length?p.sizes[0]:null), qty:1 };
  renderDetail();
  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow='hidden';
  if(!fromURL){
    try{ history.pushState({product:id}, '', productShareURL(id)); }catch(e){}
  }
}
function closeProduct(){
  document.getElementById('productModal').classList.remove('open'); document.body.style.overflow='';
  if(new URLSearchParams(location.search).get(PRODUCT_URL_PARAM)){
    try{ history.pushState({}, '', location.pathname); }catch(e){}
  }
}

function renderDetail(){
  const p = PD.product; if(!p) return;
  const imgs = p.images||[];
  const disc = discountPct(p);
  const el = document.getElementById('productDetail');
  const thumbs = imgs.map((im,i)=>'<img src="'+im.src+'" alt="" class="'+(i===PD.index?'active':'')+'" onclick="pdGo('+i+')">').join('');
  const sizes = (p.sizes||[]).map(s=>'<button class="'+(s===PD.size?'active':'')+'" onclick="pdSize('+JSON.stringify(escapeHtml(s)).replace(/"/g,'&quot;')+')">'+escapeHtml(s)+'</button>').join('');
  const details = (p.details||[]).map(d=>'<li>'+escapeHtml(d)+'</li>').join('');

  el.innerHTML =
    '<div class="pd-gallery">'+
      '<div class="pd-main">'+
        '<img id="pdMainImg" src="'+(imgs[PD.index]?imgs[PD.index].src:'')+'" alt="'+escapeHtml(p.name)+'">'+
        (imgs.length>1 ? '<button class="pd-nav prev" onclick="pdSlide(-1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></button>' : '')+
        (imgs.length>1 ? '<button class="pd-nav next" onclick="pdSlide(1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 18l6-6-6-6"/></svg></button>' : '')+
      '</div>'+
      (imgs.length>1 ? '<div class="pd-thumbs" id="pdThumbs">'+thumbs+'</div>' : '')+
    '</div>'+
    '<div class="pd-info">'+
      (p.badge ? '<span class="pd-badge">'+escapeHtml(p.badge)+'</span>' : '')+
      '<h2 style="display:flex;align-items:center;justify-content:space-between;gap:10px;">'+escapeHtml(p.name)+
        '<button class="wish'+(USER_LIKES.has(p.id)?' on':'')+'" style="position:static;flex-shrink:0;" onclick="toggleLike(\''+p.id+'\')" aria-label="Save to liked products">'+heartSvg(USER_LIKES.has(p.id))+'</button>'+
      '</h2>'+
      '<div class="pd-rate">'+(p.rating?'<span class="rating" style="color:var(--star)">'+starSvg()+'<span class="num" style="color:var(--ink);font-weight:700">'+p.rating+'</span></span>':'')+
        (p.ratingCount?'<span>'+p.ratingCount+' ratings</span>':'')+(p.sold?'<span>· '+p.sold+' sold</span>':'')+'</div>'+
      '<div class="pd-price"><span class="now">'+money(p.price)+'</span>'+
        (p.oldPrice&&p.oldPrice>p.price?'<span class="was">'+money(p.oldPrice)+'</span><span class="off">-'+disc+'%</span>':'')+'</div>'+
      '<div class="pd-delivery">+ '+money(DELIVERY_CHARGE)+' delivery · Cash on Delivery available</div>'+
      (p.sizes&&p.sizes.length ? '<div class="pd-field"><label>'+escapeHtml(p.sizeLabel||'Size')+'</label><div class="size-opts">'+sizes+'</div></div>' : '')+
      '<div class="pd-field"><label>Quantity</label><div class="stepper" style="border-radius:9px;"><button onclick="pdQty(-1)">−</button><span id="pdQty">'+PD.qty+'</span><button onclick="pdQty(1)">+</button></div></div>'+
      '<div class="pd-actions">'+
        '<button class="btn btn-gold" onclick="pdAddToCart(false)">Add to Cart</button>'+
        '<button class="btn btn-navy" onclick="pdAddToCart(true)">Buy Now</button>'+
      '</div>'+
      (p.desc||details||p.note ? '<div class="pd-details">'+
        (p.desc?'<p>'+escapeHtml(p.desc)+'</p>':'')+
        (details?'<ul>'+details+'</ul>':'')+
        (p.note?'<div class="note">'+escapeHtml(p.note)+'</div>':'')+
        (p.productCode?'<div class="note" style="font-style:normal"><b>Product Code:</b> '+escapeHtml(p.productCode)+'</div>':'')+
      '</div>' : '')+
      '<button class="pd-share" onclick="shareProduct()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.8 7.5l6.4 3.7M8.8 16.5l6.4-3.7"/></svg>Share</button>'+
    '</div>';
}
function pdGo(i){ PD.index=i; document.getElementById('pdMainImg').src = PD.product.images[i].src; document.querySelectorAll('#pdThumbs img').forEach((t,idx)=>t.classList.toggle('active',idx===i)); }
function pdSlide(d){ const n=PD.product.images.length; pdGo((PD.index+d+n)%n); }
function pdSize(s){ PD.size=s; document.querySelectorAll('.size-opts button').forEach(b=>b.classList.toggle('active', b.textContent===s)); }
function pdQty(d){ PD.qty=Math.max(1,PD.qty+d); document.getElementById('pdQty').textContent=PD.qty; }
function pdAddToCart(buyNow){
  addToCart(PD.product, PD.size, PD.qty);
  closeProduct();
  if(buyNow){ openCheckout(); } else { openCart(); }
}

/* ---------- cart ---------- */
function loadCart(){ try{ CART = JSON.parse(localStorage.getItem('ahs_cart')||'[]'); }catch(e){ CART=[]; } }
function saveCart(){ try{ localStorage.setItem('ahs_cart', JSON.stringify(CART)); }catch(e){} }
function cartKey(id,size){ return id+'::'+(size||''); }
function addToCart(p, size, qty){
  qty = qty||1;
  const key = cartKey(p.id, size);
  const found = CART.find(i => i.key===key);
  if(found){ found.qty += qty; }
  else { CART.push({ key, id:p.id, name:p.name, price:p.price, size:size||'', img:firstImg(p), qty }); }
  saveCart(); updateCartUI();
  toast('Added to cart');
}
function quickAdd(id){
  const p = ALL_PRODUCTS.find(x=>x.id===id); if(!p) return;
  const outOfStock = (p.stockStatus==='out') || (p.stockQty!=null && p.stockQty<=0);
  if(outOfStock){ toast('Ye product abhi stock mein nahi hai'); return; }
  // if product has sizes, open detail so user can choose; else add directly
  if(p.sizes && p.sizes.length){ openProduct(id); }
  else { addToCart(p, '', 1); }
}
function cartQty(){ return CART.reduce((s,i)=>s+i.qty,0); }
function cartSubtotal(){ return CART.reduce((s,i)=>s+i.price*i.qty,0); }
function changeQty(key, d){
  const it = CART.find(i=>i.key===key); if(!it) return;
  it.qty += d; if(it.qty<1){ CART = CART.filter(i=>i.key!==key); }
  saveCart(); updateCartUI();
}
function removeItem(key){ CART = CART.filter(i=>i.key!==key); saveCart(); updateCartUI(); }

function updateCartUI(){
  const n = cartQty();
  ['cartCount','bnCount'].forEach(id=>{ const el=document.getElementById(id); if(el){ el.textContent=n; el.dataset.n=n; } });

  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  if(CART.length===0){
    body.innerHTML = '<div class="cart-empty"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L22 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg><b>Cart khaali hai</b><p>Products dhundho aur shopping shuru karo!</p></div>';
    foot.style.display='none';
  } else {
    body.innerHTML = CART.map(it =>
      '<div class="citem">'+
        '<img src="'+it.img+'" alt="'+escapeHtml(it.name)+'">'+
        '<div class="citem-info">'+
          '<h4>'+escapeHtml(it.name)+'</h4>'+
          (it.size?'<div class="csize">Size: '+escapeHtml(it.size)+'</div>':'')+
          '<div class="cprice">'+money(it.price)+'</div>'+
          '<div class="citem-bottom">'+
            '<div class="stepper"><button onclick="changeQty(\''+it.key+'\',-1)">−</button><span>'+it.qty+'</span><button onclick="changeQty(\''+it.key+'\',1)">+</button></div>'+
            '<button class="link-del" onclick="removeItem(\''+it.key+'\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 7h16M9 11v6M15 11v6M9 7l.8-2.4c.3-.8 1-1.3 2-1.3h2.4c1 0 1.7.5 2 1.3l.8 2.4"/></svg></button>'+
          '</div>'+
        '</div>'+
      '</div>'
    ).join('');
    foot.style.display='block';
    const sub = cartSubtotal();
    document.getElementById('cartSubtotal').textContent = money(sub);
    document.getElementById('cartDelivery').textContent = money(DELIVERY_CHARGE);
    document.getElementById('cartTotal').textContent = money(sub+DELIVERY_CHARGE);
  }
}
function openCart(){ updateCartUI(); document.getElementById('cartOverlay').classList.add('open'); document.getElementById('cartDrawer').classList.add('open'); document.body.style.overflow='hidden'; }
function closeCart(){ document.getElementById('cartOverlay').classList.remove('open'); document.getElementById('cartDrawer').classList.remove('open'); document.body.style.overflow=''; }

/* ---------- checkout ---------- */
function openCheckout(){
  if(CART.length===0){ closeCart(); openCart(); toast('Your cart is empty'); return; }
  buildCheckoutSummary();
  // reset steps
  document.getElementById('orderForm').style.display='block';
  document.getElementById('paymentStep').classList.remove('show');
  document.getElementById('finalStep').classList.remove('show');
  document.getElementById('slipSection').style.display='none';
  document.getElementById('codSection').style.display='none';
  closeCart();
  document.getElementById('checkoutModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeCheckout(){ document.getElementById('checkoutModal').classList.remove('open'); document.body.style.overflow=''; }

function buildCheckoutSummary(){
  const lines = document.getElementById('coLines');
  lines.innerHTML = CART.map(it =>
    '<div class="co-line"><img src="'+it.img+'" alt=""><div class="m"><h5>'+escapeHtml(it.name)+'</h5><small>'+(it.size?'Size: '+escapeHtml(it.size)+' · ':'')+'Qty: '+it.qty+'</small></div><div class="r">'+money(it.price*it.qty)+'</div></div>'
  ).join('');
  const sub = cartSubtotal();
  const total = sub + DELIVERY_CHARGE;
  document.getElementById('coItems').textContent = money(sub);
  document.getElementById('coDelivery').textContent = money(DELIVERY_CHARGE);
  document.getElementById('coTotal').textContent = money(total);
  // hidden fields for the email
  document.getElementById('fOrderItems').value = CART.map(it => it.name+(it.size?' ('+it.size+')':'')+' x'+it.qty+' = '+money(it.price*it.qty)).join('\n');
  document.getElementById('fItemsTotal').value = money(sub);
  document.getElementById('fTotal').value = money(total);
  document.getElementById('finalTotal').textContent = money(total);
}

function selPay(radio){
  document.querySelectorAll('.pay-opt').forEach(o=>o.classList.remove('sel'));
  radio.closest('.pay-opt').classList.add('sel');
}

/* ========== MODIFIED: Order Form with Google Sheets ========== */
document.getElementById('orderForm').addEventListener('submit', function(e){
  e.preventDefault();
  const form = this;
  const btn = document.getElementById('submitBtn');
  const err = document.getElementById('formError');
  err.classList.remove('show');
  if(!form.checkValidity()){ form.reportValidity(); return; }
  btn.textContent='Placing Order…'; btn.disabled=true;

  // Collect all order data
  const orderData = {
    timestamp: new Date().toLocaleString('en-PK'),
    fullName: document.getElementById('cname').value.trim(),
    phone: document.getElementById('cphone').value.trim(),
    email: document.getElementById('cemail').value.trim() || 'N/A',
    address: document.getElementById('caddress').value.trim(),
    paymentMethod: form.querySelector('input[name="Payment Method"]:checked').value,
    notes: document.getElementById('cnotes').value.trim() || 'N/A',
    orderItems: CART.map(it => it.name+(it.size?' ('+it.size+')':'')+' x'+it.qty).join(', '),
    itemsTotal: cartSubtotal(),
    delivery: DELIVERY_CHARGE,
    totalAmount: cartSubtotal() + DELIVERY_CHARGE,
    adminPhone: '923134586476'
  };

  // Send to Google Sheets first (in background)
  sendOrderToGoogleSheets(orderData);

  // Then send email via formsubmit (existing functionality)
  fetch('https://formsubmit.co/ajax/qraza2376@gmail.com',{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
    body: JSON.stringify(Object.fromEntries(new FormData(form)))
  })
  .then(r=>r.json())
  .then(()=>{
    form.style.display='none';
    document.getElementById('paymentStep').classList.add('show');
    const method = form.querySelector('input[name="Payment Method"]:checked').value;
    if(method==='Online Payment'){
      document.getElementById('payStepMsg').textContent = 'Please send your payment to any account below, then upload the slip.';
      document.getElementById('slipSection').style.display='block';
    } else {
      document.getElementById('payStepMsg').textContent = 'You chose Cash on Delivery — just confirm your order below.';
      document.getElementById('codSection').style.display='block';
    }
  })
  .catch(()=>{ err.classList.add('show'); btn.textContent='Place Order'; btn.disabled=false; });
});

/* ========== Google Sheets Integration Function ========== */
function sendOrderToGoogleSheets(orderData) {
  // اگر URL setup نہیں ہوا تو صرف console میں log کریں
  if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL === 'YOUR_GOOGLE_SHEETS_URL_HERE') {
    console.log('📊 Order Data (Google Sheets setup pending):', orderData);
    return;
  }

  // Google Sheets App Script کو POST request بھیجیں
  fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData)
  })
  .then(() => {
    console.log('✅ Order saved to Google Sheets:', orderData);
  })
  .catch((error) => {
    console.warn('⚠️ Google Sheets sync issue (non-blocking):', error);
  });
}

/* slip upload via hidden iframe */
const slipForm = document.getElementById('slipForm');
const slipIframe = document.querySelector('iframe[name="slipIframe"]');
let slipSubmitted = false;
slipForm.addEventListener('submit', function(){
  const btn=document.getElementById('slipBtn');
  document.getElementById('slipError').classList.remove('show');
  btn.textContent='Sending…'; btn.disabled=true; slipSubmitted=true;
});
slipIframe.addEventListener('load', function(){ if(slipSubmitted) finalSuccess(); });

function finalSuccess(){
  document.getElementById('paymentStep').classList.remove('show');
  document.getElementById('finalStep').classList.add('show');
  CART = []; saveCart(); updateCartUI();
}

/* ---------- share ---------- */
/* Turns a base64 data: URI (how product photos are stored) into a File,
   synchronously — kept sync so it runs inside the same click gesture that
   navigator.share() needs; an await/fetch() here can make some browsers
   (notably iOS Safari) reject the share as "not user-initiated". */
function dataURLtoFile(dataURL, baseName){
  const commaIdx = dataURL.indexOf(',');
  const header = dataURL.slice(0, commaIdx);
  const base64 = dataURL.slice(commaIdx+1);
  const mimeMatch = /:(.*?);/.exec(header);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg','jpg');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++){ bytes[i] = binary.charCodeAt(i); }
  return new File([bytes], baseName+'.'+ext, {type: mime});
}
function slugify(s){
  return String(s||'product').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,40) || 'product';
}
function shareProduct(){
  const p = PD.product; if(!p) return;
  const url = productShareURL(p.id);
  const text = p.name+' — '+money(p.price)+'\n'+(p.desc?p.desc+'\n':'')+'\nAl Hadi Store: '+url;
  const imgSrc = firstImg(p);

  // Try sharing WITH the product photo attached, so apps like WhatsApp show the picture inline.
  if(navigator.share && imgSrc){
    try{
      const file = dataURLtoFile(imgSrc, slugify(p.name || p.id));
      if(navigator.canShare && navigator.canShare({files:[file]})){
        navigator.share({title:p.name, text, files:[file]}).catch(()=>{});
        return;
      }
    }catch(e){ /* fall through to text/link share below */ }
  }
  // Fallback: text + link only (device/browser can't attach a file to a share)
  if(navigator.share){ navigator.share({title:p.name, text, url}).catch(()=>{}); }
  else if(navigator.clipboard){ navigator.clipboard.writeText(text).then(()=>toast('Copied — paste to share')).catch(()=>prompt('Copy to share:',text)); }
  else { prompt('Copy to share:', text); }
}

/* ---------- toast ---------- */
let toastT;
function toast(msg){
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.classList.add('show'); clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ---------- misc ---------- */
function scrollTop(){ window.scrollTo({top:0,behavior:'smooth'}); }
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeProduct(); closeCheckout(); closeCart(); closeAdminLogin(); closeAdminPanel(); closeAccount(); } });
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- account (Firebase Auth) + liked products ---------- */
let likesUnsub = null;

function friendlyAuthError(error){
  const code = error && error.code;
  // Always log the real Firebase error code/message to console — makes future
  // debugging fast instead of guessing from the generic fallback message.
  console.error('Firebase Auth error:', code, error && error.message);
  const map = {
    'auth/email-already-in-use':'Ye email pehle se registered hai — Login karein.',
    'auth/invalid-email':'Email sahi format mein likhein.',
    'auth/weak-password':'Password kam az kam 6 characters ka hona chahiye.',
    'auth/user-not-found':'Ye email registered nahi hai — pehle account banayein.',
    'auth/wrong-password':'Password ghalat hai.',
    'auth/invalid-credential':'Email ya password ghalat hai.',
    'auth/too-many-requests':'Bohot zyada koshishein — thori dair baad try karein.',
    'auth/network-request-failed':'Internet connection check karein.',
    'auth/unauthorized-domain':'Ye website domain Firebase mein authorize nahi hai. Firebase Console > Authentication > Settings > Authorized domains mein ye domain add karein.',
    'auth/operation-not-allowed':'Email/Password login abhi Firebase Console mein enable nahi hai. Authentication > Sign-in method mein Email/Password ko enable karein.',
    'auth/user-disabled':'Ye account disable kar diya gaya hai.',
    'auth/requires-recent-login':'Security ke liye dobara login karein.'
  };
  return (code && map[code]) || ('Kuch masla ho gaya, dobara koshish karein.' + (code ? ' (' + code + ')' : ''));
}

function openAccount(){
  document.getElementById('accountModal').classList.add('open');
  document.body.style.overflow='hidden';
  updateAccountUI();
}
function closeAccount(){
  document.getElementById('accountModal').classList.remove('open');
  document.body.style.overflow='';
  ['liError','suError'].forEach(id=>{ const e=document.getElementById(id); if(e){ e.classList.remove('show'); e.textContent=''; } });
}
function switchAccTab(tab){
  document.querySelectorAll('.acc-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.acc-pane').forEach(p=>p.classList.toggle('show', p.id==='accPane-'+tab));
}

function updateAccountUI(){
  const out = document.getElementById('accLoggedOut');
  const inn = document.getElementById('accLoggedIn');
  const btn = document.querySelector('.account-btn');
  if(!out || !inn) return;
  if(currentUser){
    out.style.display='none';
    inn.style.display='block';
    document.getElementById('accEmail').textContent = currentUser.email || '';
    renderLikedGrid();
  } else {
    out.style.display='block';
    inn.style.display='none';
  }
  if(btn) btn.classList.toggle('logged-in', !!currentUser);
}

function submitLogin(e){
  e.preventDefault();
  const email = document.getElementById('liEmail').value.trim();
  const pass = document.getElementById('liPass').value;
  const err = document.getElementById('liError');
  err.classList.remove('show');
  if(typeof firebase === 'undefined' || !firebase.auth){
    err.textContent = 'Login abhi kaam nahi kar raha — internet check karein.';
    err.classList.add('show');
    return false;
  }
  firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(function(){
      closeAccount();
      document.getElementById('loginForm').reset();
      toast('Login ho gaye — khush aamdeed!');
    })
    .catch(function(error){
      err.textContent = friendlyAuthError(error);
      err.classList.add('show');
    });
  return false;
}

function submitSignup(e){
  e.preventDefault();
  const email = document.getElementById('suEmail').value.trim();
  const pass = document.getElementById('suPass').value;
  const err = document.getElementById('suError');
  err.classList.remove('show');
  if(typeof firebase === 'undefined' || !firebase.auth){
    err.textContent = 'Account banana abhi kaam nahi kar raha — internet check karein.';
    err.classList.add('show');
    return false;
  }
  if(pass.length < 6){
    err.textContent = 'Password kam az kam 6 characters ka hona chahiye.';
    err.classList.add('show');
    return false;
  }
  firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(function(){
      closeAccount();
      document.getElementById('signupForm').reset();
      toast('Account ban gaya — khush aamdeed!');
    })
    .catch(function(error){
      err.textContent = friendlyAuthError(error);
      err.classList.add('show');
    });
  return false;
}

function logoutUser(){
  if(typeof firebase === 'undefined' || !firebase.auth) return;
  firebase.auth().signOut().then(function(){
    closeAccount();
    toast('Aap logout ho gaye');
  });
}

/* Real-time listener on this user's liked-product ids, synced across every device they log into. */
function watchUserLikes(uid){
  if(likesUnsub){ likesUnsub(); likesUnsub=null; }
  if(typeof firebase === 'undefined' || !firebase.firestore) return;
  likesUnsub = firebase.firestore().collection('users').doc(uid).onSnapshot(function(doc){
    const data = (doc && doc.data()) || {};
    USER_LIKES = new Set(data.likes || []);
    renderProducts();
    if(PD.product) renderDetail();
    renderLikedGrid();
  }, function(err){
    console.error('Liked products sync error:', err);
  });
}

async function toggleLike(id){
  if(!currentUser){
    openAccount();
    toast('Pehle apna account banayein ya login karein');
    return;
  }
  if(typeof firebase === 'undefined' || !firebase.firestore){
    toast('Internet check karein — like save nahi ho saka');
    return;
  }
  const liked = USER_LIKES.has(id);
  // optimistic UI update
  if(liked) USER_LIKES.delete(id); else USER_LIKES.add(id);
  renderProducts();
  if(PD.product) renderDetail();
  renderLikedGrid();
  try{
    const ref = firebase.firestore().collection('users').doc(currentUser.uid);
    await ref.set({
      likes: liked ? firebase.firestore.FieldValue.arrayRemove(id) : firebase.firestore.FieldValue.arrayUnion(id),
      email: currentUser.email || null
    }, {merge:true});
  }catch(err){
    // revert on failure
    if(liked) USER_LIKES.add(id); else USER_LIKES.delete(id);
    renderProducts();
    if(PD.product) renderDetail();
    renderLikedGrid();
    toast('Like save nahi ho saka — internet check karein');
  }
}

function renderLikedGrid(){
  const wrap = document.getElementById('likedGrid');
  if(!wrap || !currentUser) return;
  const liked = ALL_PRODUCTS.filter(p => USER_LIKES.has(p.id) && !p.hidden);
  if(!liked.length){
    wrap.innerHTML = '<p style="grid-column:1/-1;color:var(--muted);font-size:.85rem;margin:0;">Abhi tak koi product pasand nahi kiya — har product ke heart icon ' +
      heartSvg(false) + ' par tap karke save karein.</p>';
    return;
  }
  wrap.innerHTML = liked.map(renderProductCard).join('');
}

if(typeof firebase !== 'undefined' && firebase.auth){
  firebase.auth().onAuthStateChanged(function(user){
    currentUser = user;
    updateAccountUI();
    if(user){
      watchUserLikes(user.uid);
    } else {
      if(likesUnsub){ likesUnsub(); likesUnsub=null; }
      USER_LIKES = new Set();
      renderProducts();
      if(PD.product) renderDetail();
      renderLikedGrid();
    }
  });
}

/* ---------- admin ---------- */
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'alhadi2026';

let adminSessionMemory = false; // in-memory fallback for browsers (e.g. WhatsApp's in-app browser) that block sessionStorage
function isAdminLoggedIn(){
  try{ return sessionStorage.getItem('ahs_admin') === '1'; }
  catch(e){ return adminSessionMemory; }
}

function adminIconClick(){ isAdminLoggedIn() ? openAdminPanel() : openAdminLogin(); }

function openAdminLogin(){ document.getElementById('adminLoginModal').classList.add('open'); document.body.style.overflow='hidden'; }
function closeAdminLogin(){
  document.getElementById('adminLoginModal').classList.remove('open');
  document.body.style.overflow='';
  document.getElementById('adminLoginError').classList.remove('show');
  document.getElementById('adminLoginForm').reset();
}

function submitAdminLogin(e){
  e.preventDefault();
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPass').value;
  if(u === ADMIN_USER && p === ADMIN_PASS){
    adminSessionMemory = true;
    try{ sessionStorage.setItem('ahs_admin','1'); }catch(e){}
    closeAdminLogin();
    openAdminPanel();
    toast('Welcome, admin!');
  } else {
    document.getElementById('adminLoginError').classList.add('show');
  }
  return false;
}

function adminLogout(){
  adminSessionMemory = false;
  try{ sessionStorage.removeItem('ahs_admin'); }catch(e){}
  closeAdminPanel();
  toast('Logged out');
}

function openAdminPanel(){
  renderAdminProductList();
  document.getElementById('adminPanelModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAdminPanel(){ document.getElementById('adminPanelModal').classList.remove('open'); document.body.style.overflow=''; }

/* ---------- custom products (Firestore-backed, syncs on every device) ---------- */
let CUSTOM_PRODUCTS = [];
let BASE_PRODUCTS = [];

function loadCustomProducts(){
  return CUSTOM_PRODUCTS;
}

/* Real-time listener: koi bhi admin product add/edit/delete kare,
   har visitor/device par bina refresh ke turant update ho jata hai. */
function watchCustomProducts(){
  if(typeof firebase === 'undefined' || !firebase.firestore){
    console.warn('Firebase Firestore load nahi hua — custom products sirf is device par dikhenge.');
    return;
  }
  firebase.firestore().collection('products').onSnapshot(function(snap){
    CUSTOM_PRODUCTS = snap.docs.map(function(d){
      return Object.assign({}, d.data(), {id:d.id});
    });
    ALL_PRODUCTS = BASE_PRODUCTS.concat(CUSTOM_PRODUCTS);
    buildCategories();
    renderProducts();
    renderAdminProductList();
    openProductFromURL();
  }, function(err){
    console.error('Firestore sync error:', err);
    toast('Products sync mein masla — internet ya Firebase settings check karein');
  });
}

/* Recursively strips anything Firestore cannot store (undefined values,
   Files/DOM nodes/class instances, functions) and guarantees arrays never
   directly contain another bare array (Firestore only allows primitives or
   maps as array entries). This is what fixes:
   "FirebaseError: Property array contains an invalid nested entity" /
   "Unsupported field value: undefined" — both come from unsanitized data
   (e.g. oldPrice/stockQty left as `undefined`, or a stray non-plain object
   inside images/colors/sizes/details) being handed straight to .set(). */
function sanitizeForFirestore(value){
  if(value === undefined || value === null) return null;
  const t = typeof value;
  if(t === 'string'){
    return value.trim() === '' ? null : value;
  }
  if(t === 'boolean') return value;
  if(t === 'number') return Number.isFinite(value) ? value : null;
  if(value instanceof Date) return value;
  if(Array.isArray(value)){
    return value
      .filter(v => v !== undefined && v !== null && v !== '')
      .map(v => sanitizeForFirestore(v))
      .filter(v => v !== null)
      .map(v => Array.isArray(v) ? {list:v} : v); // no arrays-in-arrays
  }
  if(value instanceof Set) return sanitizeForFirestore(Array.from(value));
  if(value instanceof Map) return sanitizeForFirestore(Object.fromEntries(value));
  if(t === 'object'){
    // Firestore FieldValue sentinels (arrayUnion/serverTimestamp/etc.) must
    // pass through untouched — they are not plain data and aren't used by
    // saveCustomProduct, but this keeps the helper safe to reuse elsewhere.
    if(value && value._methodName) return value;
    const out = {};
    Object.keys(value).forEach(function(k){
      if(value[k] === undefined || value[k] === null) return; // drop the key instead of storing null noise
      const clean = sanitizeForFirestore(value[k]);
      if(clean !== null && clean !== undefined) out[k] = clean;
    });
    return Object.keys(out).length ? out : null;
  }
  return null; // functions, symbols, DOM nodes, File objects, etc.
}

async function saveCustomProduct(product){
  const clean = sanitizeForFirestore(product);
  try{
    await firebase.firestore().collection('products').doc(clean.id).set(clean);
  }catch(err){
    console.error('saveCustomProduct failed. Payload sent to Firestore:', clean, 'Original error:', err);
    throw err;
  }
  return clean;
}
async function deleteCustomProduct(id){
  await firebase.firestore().collection('products').doc(id).delete();
}

function fileToDataUrl(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* Resizes/compresses an uploaded photo before it leaves the device — a raw
   phone-camera photo can be several MB, which blows past Firestore's 1MB
   per-document limit if embedded directly. Shrinking to maxDim px + JPEG
   compression keeps it small whether it ends up in Storage or (as a
   fallback) inline. */
function compressImageFile(file, maxDim, quality){
  maxDim = maxDim || 1600;
  quality = quality || 0.82;
  return new Promise((resolve, reject) => {
    const objUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth, height = img.naturalHeight;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else { width = Math.round(width * (maxDim / height)); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objUrl);
        if (blob) resolve(blob); else reject(new Error('Image compress nahi ho saka'));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Photo load nahi ho saki')); };
    img.src = objUrl;
  });
}

function blobToDataUrl(blob){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/* Keeps shrinking a photo (smaller dimensions, lower JPEG quality) until its
   base64 form fits comfortably inside Firestore's 1MB-per-document limit.
   Firebase Storage would be the "proper" way to host images, but it now
   requires the paid Blaze plan just to enable — this avoids that entirely
   by keeping images small enough to live directly in the product document. */
async function compressImageUnderLimit(file, maxBytes){
  maxBytes = maxBytes || 350000; // per-image budget (bytes of the base64 string)
  const attempts = [
    {maxDim:1100, quality:0.7},
    {maxDim:900,  quality:0.55},
    {maxDim:700,  quality:0.45},
    {maxDim:500,  quality:0.4}
  ];
  let lastDataUrl = null;
  for(let i=0;i<attempts.length;i++){
    const blob = await compressImageFile(file, attempts[i].maxDim, attempts[i].quality);
    const dataUrl = await blobToDataUrl(blob);
    lastDataUrl = dataUrl;
    if(dataUrl.length <= maxBytes) return dataUrl;
  }
  throw new Error('Photo bohot bari hai — chhoti ya kam-resolution wali photo try karein, ya kam photos add karein.');
}

/* ---------- size chip helpers ---------- */
function toggleSizeChip(btn){
  const sizesInput = document.getElementById('apSizes');
  let list = sizesInput.value.split(',').map(s=>s.trim()).filter(Boolean);
  const val = btn.getAttribute('data-size');
  const idx = list.indexOf(val);
  if(idx === -1){
    list.push(val);
    btn.classList.add('active');
  } else {
    list.splice(idx,1);
    btn.classList.remove('active');
  }
  sizesInput.value = list.join(', ');
}
function clearSizeChips(){
  document.getElementById('apSizes').value = '';
  document.querySelectorAll('.size-chip.active').forEach(b=>b.classList.remove('active'));
}
function syncSizeChipsFromInput(){
  const list = document.getElementById('apSizes').value.split(',').map(s=>s.trim()).filter(Boolean);
  document.querySelectorAll('.size-chip').forEach(b=>{
    b.classList.toggle('active', list.includes(b.getAttribute('data-size')));
  });
}

async function submitAddProduct(e){
  e.preventDefault();
  const errEl = document.getElementById('addProductError');
  errEl.classList.remove('show');

  const editId = document.getElementById('apEditId').value;
  const name = document.getElementById('apName').value.trim();
  const categorySel = document.getElementById('apCategory').value;
  const category = (categorySel === '__new__'
    ? (document.getElementById('apCategoryNew').value.trim() || 'other')
    : (categorySel || 'other'));
  const price = Number(document.getElementById('apPrice').value);
  const oldPriceRaw = document.getElementById('apOldPrice').value;
  const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : null;
  const imageUrlsRaw = document.getElementById('apImageUrls').value.trim();
  const imageUrls = imageUrlsRaw ? imageUrlsRaw.split(',').map(s=>s.trim()).filter(s => s.length > 0) : [];
  const files = Array.from(document.getElementById('apImageFiles').files || []);
  const videoUrl = document.getElementById('apVideoUrl').value.trim() || null;
  const colorsRaw = document.getElementById('apColors').value.trim();
  const colors = colorsRaw ? colorsRaw.split(',').map(s=>s.trim()).filter(s => s.length > 0) : [];
  const sizesRaw = document.getElementById('apSizes').value.trim();
  const sizes = sizesRaw ? sizesRaw.split(',').map(s=>s.trim()).filter(s => s.length > 0) : ['Standard'];
  const flashSale = document.getElementById('apFlashSale').value === 'yes';
  const stockStatus = document.getElementById('apStock').value;
  const stockQtyRaw = document.getElementById('apStockQty').value.trim().replace(/[^\d]/g,'');
  const stockQty = stockQtyRaw !== '' ? Math.max(0, parseInt(stockQtyRaw,10)||0) : null;
  const hidden = document.getElementById('apVisible').value === 'no';
  const deliveryRaw = document.getElementById('apDelivery').value;
  const deliveryCharge = deliveryRaw ? Number(deliveryRaw) : DELIVERY_CHARGE;
  const desc = document.getElementById('apDesc').value.trim() || null;

  const existing = editId ? ALL_PRODUCTS.find(p=>p.id===editId) : null;

  if(!name || !price || (!imageUrls.length && !files.length && !(existing && existing.images && existing.images.length))){
    errEl.textContent = 'Please fill in the product name, price, and at least one image (URL or upload).';
    errEl.classList.add('show');
    return false;
  }

  if(files.length > 4){
    errEl.textContent = 'Ek dafa mein zyada se zyada 4 photos upload karein (document size limit ki wajah se).';
    errEl.classList.add('show');
    return false;
  }

  const productId = editId || ('admin_' + Date.now() + '_' + Math.random().toString(36).slice(2,7));

  let uploadedImages = [];
  try{
    const perImageBudget = Math.floor(600000 / Math.max(files.length, 1)); // shared budget so total stays well under 1MB
    uploadedImages = await Promise.all(files.map(f=>compressImageUnderLimit(f, perImageBudget).then(src=>({src:src, alt:name}))));
  }catch(err){
    errEl.textContent = (err && err.message) || 'Photo process nahi ho saki.';
    errEl.classList.add('show');
    return false;
  }

  const urlImages = imageUrls.map(u=>({src:u, alt:name}));
  let images = urlImages.concat(uploadedImages);
  if(!images.length && existing) images = existing.images;

  const product = {
    id: productId,
    category: category,
    name: name,
    price: price,
    oldPrice: oldPrice,
    desc: desc,
    sizes: sizes,
    sizeLabel: 'Size',
    colors: colors,
    videoUrl: videoUrl,
    stockStatus: stockStatus,
    stockQty: stockQty,
    hidden: hidden,
    deliveryCharge: deliveryCharge,
    flashSale: flashSale,
    details: [],
    note: null,
    productCode: null,
    images: images,
    badge: flashSale ? 'Flash Sale' : 'New',
    addedByAdmin: true
  };

  let savedProduct;
  try{
    savedProduct = await saveCustomProduct(product);
  }catch(err){
    errEl.textContent = 'Product save nahi ho saka. Internet check karein ya Firebase Firestore settings dekhein. (' + ((err && err.message) || 'unknown error') + ')';
    errEl.classList.add('show');
    return false;
  }

  /* Optimistic local update — real-time listener bhi isi data se sab visitors ko update karega */
  ALL_PRODUCTS = ALL_PRODUCTS.filter(p=>p.id !== savedProduct.id).concat([savedProduct]);
  buildCategories();
  renderProducts();
  renderAdminProductList();

  document.getElementById('addProductForm').reset();
  document.getElementById('apEditId').value = '';
  document.getElementById('apCategoryNew').style.display = 'none';
  document.getElementById('apCategoryNew').value = '';
  document.getElementById('apDelivery').value = 200;
  document.getElementById('apStockQty').value = '';
  document.getElementById('apVisible').value = 'yes';
  clearSizeChips();
  document.getElementById('addProductSubmitBtn').textContent = 'Product Add Karein';
  toast(existing ? 'Product update ho gaya!' : 'Product Add ho gaya!');
  return false;
}

function editAdminProduct(id){
  const p = ALL_PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('apEditId').value = p.id;
  document.getElementById('apName').value = p.name || '';
  setCategoryFieldValue(p.category);
  document.getElementById('apPrice').value = p.price || '';
  document.getElementById('apOldPrice').value = p.oldPrice || '';
  document.getElementById('apImageUrls').value = (p.images||[]).map(im=>im.src).filter(s=>s && !s.startsWith('data:')).join(', ');
  document.getElementById('apVideoUrl').value = p.videoUrl || '';
  document.getElementById('apColors').value = (p.colors||[]).join(', ');
  document.getElementById('apSizes').value = (p.sizes||[]).join(', ');
  document.getElementById('apFlashSale').value = p.flashSale ? 'yes' : 'no';
  document.getElementById('apStock').value = p.stockStatus || 'in';
  document.getElementById('apStockQty').value = (p.stockQty!=null ? p.stockQty : '');
  document.getElementById('apVisible').value = p.hidden ? 'no' : 'yes';
  document.getElementById('apDelivery').value = (p.deliveryCharge!=null ? p.deliveryCharge : DELIVERY_CHARGE);
  document.getElementById('apDesc').value = p.desc || '';
  syncSizeChipsFromInput();
  document.getElementById('addProductSubmitBtn').textContent = 'Product Update Karein';
  document.getElementById('addProductForm').scrollIntoView({behavior:'smooth', block:'start'});
}

function renderAdminProductList(){
  const wrap = document.getElementById('adminProductList');
  if(!ALL_PRODUCTS.length){
    wrap.innerHTML = '<p style="color:#667;margin:0;">Abhi tak koi product nahi hai.</p>';
    return;
  }
  wrap.innerHTML = ALL_PRODUCTS.map(p=>{
    const stockTxt = (p.stockQty!=null) ? ('Stock: '+p.stockQty) : (p.stockStatus==='out' ? 'Out of Stock' : 'In Stock');
    const stockColor = (p.stockQty===0 || p.stockStatus==='out') ? '#c0392b' : '#2f8f4e';
    const hiddenTxt = p.hidden ? ' · <span style="color:#c0392b;">Hidden</span>' : '';
    return '<div class="admin-plist-row">'+
      '<img src="'+firstImg(p)+'" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:8px;">'+
      '<div style="flex:1;min-width:0;">'+
        '<b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+escapeHtml(p.name)+' — '+money(p.price)+'</b>'+
        '<span style="color:#667;font-size:13px;">'+catLabel(p.category)+' · <span style="color:'+stockColor+';">'+stockTxt+'</span>'+hiddenTxt+'</span>'+
      '</div>'+
      '<div class="admin-plist-actions">'+
        '<button type="button" class="btn btn-ghost" style="padding:6px 12px;" onclick="editAdminProduct(\''+p.id+'\')">Edit Karein</button>'+
        '<button type="button" class="btn btn-ghost" style="padding:6px 12px;" onclick="toggleAdminVisibility(\''+p.id+'\')">'+(p.hidden?'Show Karein':'Hide Karein')+'</button>'+
        '<button type="button" class="btn btn-navy" style="padding:6px 12px;" onclick="deleteAdminProduct(\''+p.id+'\')">Hatayein</button>'+
      '</div>'+
    '</div>';
  }).join('');
}

async function toggleAdminVisibility(id){
  const p = ALL_PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const updated = Object.assign({}, p, {hidden: !p.hidden});
  let saved;
  try{
    saved = await saveCustomProduct(updated);
  }catch(err){
    toast('Update fail ho gaya — internet ya Firebase settings check karein');
    return;
  }
  ALL_PRODUCTS = ALL_PRODUCTS.filter(x=>x.id!==id).concat([saved]);
  buildCategories();
  renderProducts();
  renderAdminProductList();
  toast(updated.hidden ? 'Product site se hide ho gaya' : 'Product site par show ho gaya');
}

async function deleteAdminProduct(id){
  const wasCustomOnly = String(id).startsWith('admin_');
  try{
    if(wasCustomOnly){
      await deleteCustomProduct(id);
      ALL_PRODUCTS = ALL_PRODUCTS.filter(p=>p.id !== id);
    } else {
      const base = ALL_PRODUCTS.find(p=>p.id===id);
      if(!base) return;
      const updated = Object.assign({}, base, {hidden:true});
      const saved = await saveCustomProduct(updated);
      ALL_PRODUCTS = ALL_PRODUCTS.filter(x=>x.id!==id).concat([saved]);
    }
  }catch(err){
    toast('Delete fail ho gaya — internet ya Firebase settings check karein');
    return;
  }
  buildCategories();
  renderProducts();
  renderAdminProductList();
  toast('Product hata diya gaya');
}

/* ---------- load products ---------- */
function applyProducts(data){
  BASE_PRODUCTS = (data && data.products) || [];
  ALL_PRODUCTS = BASE_PRODUCTS.concat(loadCustomProducts());
  buildCategories();
  renderProducts();
  openProductFromURL();
}
function skeletons(){
  const g=document.getElementById('productGrid');
  g.innerHTML = Array.from({length:10}).map(()=>'<div class="sk"><div class="box"></div><div class="pad"><div class="ln w90"></div><div class="ln w40"></div><div class="ln w70"></div></div></div>').join('');
}
function loadProducts(){
  skeletons();
  Promise.reject() // use embedded data
    .then(r=>{ if(!r.ok) throw new Error('http'); return r.json(); })
    .then(applyProducts)
    .catch(()=>{ if(window.EMBEDDED_PRODUCTS) applyProducts(window.EMBEDDED_PRODUCTS);
      else document.getElementById('productGrid').innerHTML='<div class="empty"><b>Couldn\'t load products</b>Please refresh the page.</div>'; });
}

loadCart();
updateCartUI();
loadProducts();
watchCustomProducts();
