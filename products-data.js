
:root{
  --navy:#083743; --navy-2:#0C4A59; --gold:#00AEB8; --gold-2:#5CE1E6;
  --deal:#FF5A36; --deal-soft:#FFE9E2;
  --accent:#FF7A29; --accent-2:#FFB020;
  --bg:#F2FAFB; --card:#FFFFFF; --ink:#0F2A30; --muted:#5C7880; --muted-2:#9FB8BD;
  --line:#DBEEF0; --star:#FFB020; --ok:#1FA36B; --ok-soft:#E7F6EF;
  --shadow-sm:0 1px 2px rgba(8,55,67,.07), 0 1px 3px rgba(8,55,67,.06);
  --shadow-md:0 6px 20px rgba(8,55,67,.12);
  --shadow-lg:0 18px 50px rgba(8,55,67,.22);
  --radius:14px; --radius-sm:10px; --wrap:1240px;
}
*{ box-sizing:border-box; }
html{ scroll-behavior:smooth; -webkit-text-size-adjust:100%; }
body{ margin:0; background:var(--bg); color:var(--ink); font-family:'Plus Jakarta Sans',sans-serif; line-height:1.55; -webkit-font-smoothing:antialiased; }
h1,h2,h3,h4{ font-family:'Sora',sans-serif; margin:0; color:var(--navy); letter-spacing:-.01em; }
a{ color:inherit; text-decoration:none; }
img{ max-width:100%; display:block; }
button{ font-family:inherit; cursor:pointer; }
svg{ display:block; }
::selection{ background:var(--gold); color:var(--navy); }
.wrap{ max-width:var(--wrap); margin:0 auto; padding:0 18px; }

/* ---------- Announcement bar ---------- */
.topbar{ background:var(--navy); color:#fff; font-size:.78rem; }
.topbar .wrap{ display:flex; align-items:center; justify-content:space-between; height:38px; gap:16px; }
.topbar-left{ display:flex; align-items:center; gap:9px; color:rgba(255,255,255,.82); overflow:hidden; white-space:nowrap; }
.topbar-left .dot{ color:var(--gold); }
.topbar-right{ display:flex; align-items:center; gap:20px; color:rgba(255,255,255,.75); }
.topbar-right a{ display:inline-flex; align-items:center; gap:6px; transition:color .2s; }
.topbar-right a:hover{ color:var(--gold-2); }
@media(max-width:760px){ .topbar-right{ display:none; } }

/* ---------- Header ---------- */
.header{ background:var(--card); position:sticky; top:0; z-index:60; box-shadow:var(--shadow-sm); }
.header-main{ display:flex; align-items:center; gap:22px; height:76px; }
.brand{ display:flex; align-items:center; gap:11px; flex-shrink:0; }
.brand img{ height:50px; width:auto; }
.brand-txt{ line-height:1.05; }
.brand-txt b{ font-family:'Sora',sans-serif; font-weight:800; font-size:1.18rem; color:var(--navy); display:block; }
.brand-txt span{ font-size:.58rem; letter-spacing:.32em; color:var(--gold); font-weight:600; }
@media(max-width:520px){ .brand-txt{ display:none; } .brand img{ height:44px; } }

.searchbar{ flex:1; display:flex; align-items:center; background:var(--bg); border:2px solid var(--line); border-radius:999px; padding:4px 4px 4px 18px; transition:border-color .2s, box-shadow .2s; min-width:0; }
.searchbar:focus-within{ border-color:var(--gold); box-shadow:0 0 0 4px rgba(0,174,184,.14); }
.searchbar svg{ color:var(--muted-2); flex-shrink:0; }
.searchbar input{ flex:1; border:none; background:none; outline:none; font-size:.95rem; color:var(--ink); padding:11px 12px; min-width:0; font-family:inherit; }
.searchbar input::placeholder{ color:var(--muted-2); }
.search-btn{ background:var(--navy); color:#fff; border:none; border-radius:999px; padding:11px 24px; font-weight:600; font-size:.9rem; display:inline-flex; align-items:center; gap:8px; transition:background .2s, transform .15s; }
.search-btn:hover{ background:var(--navy-2); }
.search-btn:active{ transform:scale(.97); }
.search-btn span{ display:inline; }
@media(max-width:760px){ .search-btn span{ display:none; } .search-btn{ padding:11px 15px; } }

.header-actions{ display:flex; align-items:center; gap:6px; flex-shrink:0; }
.icon-btn{ position:relative; background:none; border:none; color:var(--navy); width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.icon-btn:hover{ background:var(--bg); }
.icon-btn .label{ display:none; }
.cart-count{ position:absolute; top:5px; right:5px; min-width:18px; height:18px; padding:0 4px; background:var(--deal); color:#fff; font-size:.66rem; font-weight:700; border-radius:999px; display:flex; align-items:center; justify-content:center; border:2px solid var(--card); }
.cart-count:empty, .cart-count[data-n="0"]{ display:none; }
@media(max-width:760px){ .header-main{ flex-wrap:wrap; height:auto; padding:12px 0; gap:12px; } .searchbar{ order:3; flex-basis:100%; } .account-btn{ display:none; } }

/* category strip under header */
.catbar{ background:var(--card); border-top:1px solid var(--line); }
.catbar .wrap{ display:flex; gap:26px; overflow-x:auto; padding:12px 18px; scrollbar-width:none; }
.catbar .wrap::-webkit-scrollbar{ display:none; }
.catbar a{ font-size:.86rem; font-weight:600; color:var(--muted); white-space:nowrap; padding:5px 2px; border-bottom:2px solid transparent; transition:color .2s, border-color .2s; }
.catbar a:hover, .catbar a.active{ color:var(--navy); border-color:var(--gold); }

/* ---------- Marquee sale ribbon ---------- */
.marquee{ background:linear-gradient(90deg,var(--gold),var(--navy-2) 130%); overflow:hidden; position:relative; }
.marquee-track{ display:flex; width:max-content; animation:marquee-scroll 26s linear infinite; }
.marquee-set{ display:flex; flex-shrink:0; }
.marquee-item{ display:inline-flex; align-items:center; gap:9px; padding:9px 30px; color:#fff; font-size:.78rem; font-weight:700; letter-spacing:.04em; text-transform:uppercase; white-space:nowrap; }
.marquee-item .pct{ width:19px; height:19px; border-radius:50%; background:rgba(255,255,255,.24); display:inline-flex; align-items:center; justify-content:center; font-size:.6rem; font-weight:800; flex-shrink:0; }
@keyframes marquee-scroll{ 0%{ transform:translateX(0); } 100%{ transform:translateX(-50%); } }
@media (prefers-reduced-motion: reduce){ .marquee-track{ animation:none; } }

/* ---------- Shop by category (circles) ---------- */
.cat-circles{ padding:20px 0 4px; }
.cat-circles-head{ text-align:center; margin-bottom:16px; }
.cat-circles-head h2{ font-size:1.05rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--navy); }
.cat-circles-row{ display:flex; gap:22px; overflow-x:auto; padding:4px 4px 10px; scrollbar-width:none; justify-content:center; flex-wrap:wrap; }
.cat-circles-row::-webkit-scrollbar{ display:none; }
.cat-circle{ display:flex; flex-direction:column; align-items:center; gap:9px; background:none; border:none; flex-shrink:0; width:88px; }
.cat-circle .ring{ width:74px; height:74px; border-radius:50%; background:linear-gradient(160deg,var(--bg),#fff); border:1.5px solid var(--line); display:flex; align-items:center; justify-content:center; color:var(--gold); transition:border-color .2s, transform .18s, box-shadow .2s; box-shadow:var(--shadow-sm); }
.cat-circle:hover .ring{ border-color:var(--gold); transform:translateY(-3px); box-shadow:var(--shadow-md); }
.cat-circle span{ font-size:.74rem; font-weight:600; color:var(--ink); text-align:center; line-height:1.25; }
.cat-circle.active .ring{ border-color:var(--gold); background:linear-gradient(160deg,var(--gold),var(--gold-2)); color:#fff; }

/* ---------- Hero ---------- */
.hero{ padding:22px 0 8px; }
.hero-grid{ display:grid; grid-template-columns:2fr 1fr; gap:16px; }
.banner{ position:relative; border-radius:var(--radius); overflow:hidden; min-height:300px; background:
  radial-gradient(900px 380px at 78% -20%, rgba(0,174,184,.35), transparent 60%),
  linear-gradient(125deg,var(--navy) 0%, var(--navy-2) 58%, #0F5566 100%);
  color:#fff; display:flex; align-items:center; box-shadow:var(--shadow-md); }
.banner::after{ content:""; position:absolute; inset:0; background-image:radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px); background-size:22px 22px; opacity:.5; pointer-events:none; }
.banner-inner{ position:relative; z-index:2; padding:44px 46px; max-width:560px; }
.banner .kicker{ display:inline-flex; align-items:center; gap:9px; font-size:.72rem; letter-spacing:.28em; text-transform:uppercase; color:var(--gold-2); font-weight:600; margin-bottom:16px; }
.banner .kicker::before{ content:""; width:26px; height:1px; background:var(--gold); }
.banner h1{ color:#fff; font-size:clamp(1.9rem,3.6vw,3rem); font-weight:800; line-height:1.08; }
.banner h1 em{ color:var(--gold); font-style:normal; }
.banner p{ color:rgba(255,255,255,.78); font-size:1rem; margin:16px 0 26px; max-width:400px; }
.banner-cta{ display:inline-flex; gap:12px; flex-wrap:wrap; }
.banner-logo{ position:absolute; right:-30px; bottom:-30px; width:290px; opacity:.14; filter:grayscale(.2); z-index:1; }
.btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:13px 26px; font-weight:700; font-size:.9rem; border-radius:999px; border:2px solid transparent; transition:transform .15s, background .2s, color .2s, border-color .2s, box-shadow .2s; white-space:nowrap; }
.btn:active{ transform:scale(.97); }
.btn-gold{ background:var(--gold); color:var(--navy); }
.btn-gold:hover{ background:var(--gold-2); box-shadow:0 8px 24px rgba(0,174,184,.35); }
.btn-ghost{ background:transparent; color:#fff; border-color:rgba(255,255,255,.4); }
.btn-ghost:hover{ border-color:var(--gold); color:var(--gold-2); }
.btn-navy{ background:var(--navy); color:#fff; }
.btn-navy:hover{ background:var(--navy-2); }
.btn-block{ width:100%; }
.btn-lg{ padding:15px 30px; font-size:.98rem; }

.side-stack{ display:grid; grid-template-rows:1fr 1fr; gap:16px; }
.side-card{ border-radius:var(--radius); padding:22px 24px; color:#fff; position:relative; overflow:hidden; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; justify-content:center; min-height:142px; }
.side-card.a{ background:linear-gradient(135deg,#C4530E,#FF7A29); }
.side-card.b{ background:linear-gradient(135deg,#0A4550,#00AEB8); }
.side-card small{ font-size:.72rem; letter-spacing:.18em; text-transform:uppercase; opacity:.85; font-weight:600; }
.side-card h3{ color:#fff; font-size:1.35rem; margin:6px 0 4px; }
.side-card p{ margin:0; font-size:.84rem; opacity:.9; }
.side-card .arrow{ position:absolute; right:20px; bottom:18px; opacity:.85; }
@media(max-width:860px){ .hero-grid{ grid-template-columns:1fr; } .side-stack{ grid-template-rows:none; grid-template-columns:1fr 1fr; } .banner-inner{ padding:34px 28px; } }
@media(max-width:520px){ .side-stack{ grid-template-columns:1fr; } .banner{ min-height:250px; } }

/* ---------- Trust strip ---------- */
.trust{ margin:18px 0 4px; }
.trust-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.trust-item{ background:var(--card); border-radius:var(--radius-sm); padding:16px 18px; display:flex; align-items:center; gap:13px; box-shadow:var(--shadow-sm); }
.trust-item .ic{ width:42px; height:42px; border-radius:11px; background:var(--bg); color:var(--gold); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.trust-item b{ font-family:'Sora',sans-serif; font-size:.94rem; color:var(--navy); display:block; }
.trust-item span{ font-size:.76rem; color:var(--muted); }
@media(max-width:820px){ .trust-grid{ grid-template-columns:1fr 1fr; } }

/* ---------- Section heading ---------- */
.section{ padding:30px 0; }
.sec-head{ display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:18px; }
.sec-head h2{ font-size:clamp(1.3rem,2.4vw,1.7rem); font-weight:700; display:flex; align-items:center; gap:11px; }
.sec-head h2 .bar{ width:5px; height:24px; background:var(--gold); border-radius:3px; }
.sec-head p{ margin:4px 0 0; color:var(--muted); font-size:.9rem; }

/* filter tabs */
.cat-tabs{ display:flex; gap:9px; overflow-x:auto; padding-bottom:6px; margin-bottom:18px; scrollbar-width:none; }
.cat-tabs::-webkit-scrollbar{ display:none; }
.cat-tabs button{ background:var(--card); border:1.5px solid var(--line); color:var(--muted); padding:9px 18px; border-radius:999px; font-size:.85rem; font-weight:600; white-space:nowrap; transition:all .18s; }
.cat-tabs button:hover{ border-color:var(--gold); color:var(--navy); }
.cat-tabs button.active{ background:var(--navy); border-color:var(--navy); color:#fff; }

/* ---------- Product grid ---------- */
.product-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
@media(min-width:560px){ .product-grid{ grid-template-columns:repeat(3,1fr); } }
@media(min-width:840px){ .product-grid{ grid-template-columns:repeat(4,1fr); } }
@media(min-width:1080px){ .product-grid{ grid-template-columns:repeat(5,1fr); gap:16px; } }

.pcard{ background:var(--card); border-radius:var(--radius-sm); overflow:hidden; box-shadow:var(--shadow-sm); cursor:pointer; display:flex; flex-direction:column; transition:transform .18s, box-shadow .2s; border:1px solid var(--line); }
.pcard:hover{ transform:translateY(-4px); box-shadow:var(--shadow-md); border-color:transparent; }
.pcard-img{ position:relative; aspect-ratio:1/1; background:#f7f7f8; overflow:hidden; }
.pcard-img img{ width:100%; height:100%; object-fit:cover; transition:transform .4s ease; }
.pcard:hover .pcard-img img{ transform:scale(1.06); }
.badge-disc{ position:absolute; top:9px; left:9px; background:var(--deal); color:#fff; font-size:.72rem; font-weight:700; padding:3px 8px; border-radius:7px; box-shadow:0 2px 6px rgba(255,90,54,.35); }
.badge-tag{ position:absolute; top:9px; right:9px; background:rgba(15,27,46,.9); color:var(--gold-2); font-size:.66rem; font-weight:700; padding:4px 9px; border-radius:999px; letter-spacing:.04em; }
.wish{ position:absolute; bottom:9px; right:9px; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.92); border:none; color:var(--muted); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); opacity:.9; transition:all .2s; }
.wish:hover{ opacity:1; transform:translateY(-1px); }
.wish.on{ color:var(--deal); opacity:1; }
.wish.on svg{ animation:wishPop .28s ease; }
@keyframes wishPop{ 0%{ transform:scale(.7); } 60%{ transform:scale(1.2); } 100%{ transform:scale(1); } }

/* ---------- Account modal: login/signup tabs + liked products grid ---------- */
.acc-tabs{ display:flex; gap:8px; margin-bottom:18px; background:var(--bg); border-radius:11px; padding:4px; }
.acc-tab{ flex:1; border:none; background:none; padding:10px 8px; border-radius:8px; font-weight:700; font-size:.85rem; color:var(--muted); transition:background .2s, color .2s; }
.acc-tab.active{ background:var(--card); color:var(--navy); box-shadow:var(--shadow-sm); }
.acc-pane{ display:none; }
.acc-pane.show{ display:block; }
.like-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; max-height:52vh; overflow-y:auto; padding-right:2px; }
@media(min-width:500px){ .like-grid{ grid-template-columns:repeat(3,1fr); } }
.account-btn.logged-in{ color:var(--gold); }
.pcard-body{ padding:12px 13px 14px; display:flex; flex-direction:column; gap:7px; flex:1; }
.pcard-name{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:600; font-size:.9rem; color:var(--ink); line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:2.4em; }
.pcard-price{ display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; }
.pcard-price .now{ font-family:'Sora',sans-serif; font-weight:700; font-size:1.06rem; color:var(--deal); }
.pcard-price .was{ font-size:.8rem; color:var(--muted-2); text-decoration:line-through; }
.pcard-meta{ display:flex; align-items:center; gap:8px; font-size:.75rem; color:var(--muted); margin-top:-1px; }
.rating{ display:inline-flex; align-items:center; gap:3px; color:var(--star); font-weight:600; }
.rating .num{ color:var(--ink); }
.pcard-meta .sep{ color:var(--line); }
.pcard-add{ margin-top:auto; display:flex; align-items:center; justify-content:center; gap:7px; background:var(--accent); color:#fff; border:none; border-radius:9px; padding:10px; font-weight:700; font-size:.84rem; transition:background .2s, transform .12s; }
.pcard-add:hover{ background:#FF8F49; }
.pcard-add:active{ transform:scale(.97); }

/* skeleton */
.sk{ background:var(--card); border-radius:var(--radius-sm); overflow:hidden; border:1px solid var(--line); }
.sk .ln, .sk .box{ background:linear-gradient(90deg,#eee 25%,#f5f5f5 37%,#eee 63%); background-size:400% 100%; animation:sh 1.3s infinite; }
.sk .box{ aspect-ratio:1/1; }
.sk .pad{ padding:12px 13px; display:flex; flex-direction:column; gap:9px; }
.sk .ln{ height:11px; border-radius:5px; }
.sk .ln.w70{ width:70%; } .sk .ln.w40{ width:40%; } .sk .ln.w90{ width:90%; }
@keyframes sh{ 0%{ background-position:100% 0; } 100%{ background-position:-100% 0; } }

.empty{ grid-column:1/-1; text-align:center; padding:70px 20px; color:var(--muted); }
.empty svg{ margin:0 auto 14px; color:var(--muted-2); }
.empty b{ display:block; font-family:'Sora',sans-serif; color:var(--navy); font-size:1.05rem; margin-bottom:5px; }

/* ---------- Payment / trust section ---------- */
.payment-sec{ background:var(--card); border-top:1px solid var(--line); border-bottom:1px solid var(--line); margin-top:16px; }
.pay-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:6px; }
.pay-card{ border:1.5px solid var(--line); border-radius:var(--radius-sm); padding:18px; background:var(--bg); transition:border-color .2s, transform .15s; }
.pay-card:hover{ border-color:var(--gold); transform:translateY(-2px); }
.pay-card h4{ font-size:.95rem; color:var(--navy); margin-bottom:9px; display:flex; align-items:center; gap:8px; }
.pay-card .badge-m{ font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; background:var(--ok-soft); color:var(--ok); padding:2px 7px; border-radius:5px; }
.pay-number{ font-family:'Sora',sans-serif; font-weight:700; color:var(--ink); font-size:1.02rem; letter-spacing:.02em; }
.pay-name{ font-size:.78rem; color:var(--muted); margin-top:3px; }
@media(max-width:820px){ .pay-grid{ grid-template-columns:1fr 1fr; } }

/* ---------- Footer ---------- */
.footer{ background:var(--navy); color:rgba(255,255,255,.72); margin-top:20px; padding:48px 0 26px; }
.foot-grid{ display:grid; grid-template-columns:1.6fr 1fr 1fr; gap:34px; }
.footer .brand-txt b{ color:#fff; } .footer .brand-txt span{ color:var(--gold); }
.footer p{ font-size:.86rem; margin:14px 0 0; max-width:320px; }
.foot-col h5{ font-family:'Sora',sans-serif; color:#fff; font-size:.78rem; letter-spacing:.14em; text-transform:uppercase; margin:0 0 14px; }
.foot-col a, .foot-col div{ display:block; font-size:.86rem; color:rgba(255,255,255,.68); padding:5px 0; transition:color .2s; }
.foot-col a:hover{ color:var(--gold-2); }
.foot-bottom{ border-top:1px solid rgba(255,255,255,.12); margin-top:34px; padding-top:18px; display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; font-size:.78rem; color:rgba(255,255,255,.5); }
@media(max-width:760px){ .foot-grid{ grid-template-columns:1fr 1fr; } .footer{ padding-bottom:90px; } }

/* ---------- Bottom nav (mobile) ---------- */
.botnav{ display:none; position:fixed; bottom:0; left:0; right:0; z-index:70; background:var(--card); border-top:1px solid var(--line); box-shadow:0 -4px 20px rgba(15,27,46,.08); }
.botnav-inner{ display:grid; grid-template-columns:repeat(4,1fr); }
.botnav button{ background:none; border:none; padding:9px 0 8px; display:flex; flex-direction:column; align-items:center; gap:3px; color:var(--muted); font-size:.66rem; font-weight:600; position:relative; }
.botnav button.active{ color:var(--navy); }
.botnav .bn-count{ position:absolute; top:4px; right:calc(50% - 20px); min-width:16px; height:16px; padding:0 4px; background:var(--deal); color:#fff; font-size:.6rem; font-weight:700; border-radius:999px; display:flex; align-items:center; justify-content:center; }
.botnav .bn-count[data-n="0"]{ display:none; }
@media(max-width:760px){ .botnav{ display:block; } body{ padding-bottom:0; } }

/* ---------- Drawer / cart ---------- */
.overlay{ position:fixed; inset:0; background:rgba(15,27,46,.5); backdrop-filter:blur(2px); opacity:0; visibility:hidden; transition:opacity .25s, visibility .25s; z-index:100; }
.overlay.open{ opacity:1; visibility:visible; }
.drawer{ position:fixed; top:0; right:0; height:100%; width:min(420px,100%); background:var(--bg); z-index:101; transform:translateX(100%); transition:transform .3s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; box-shadow:var(--shadow-lg); }
.drawer.open{ transform:none; }
.drawer-head{ background:var(--card); padding:18px 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); }
.drawer-head h3{ font-size:1.1rem; display:flex; align-items:center; gap:9px; }
.drawer-body{ flex:1; overflow-y:auto; padding:16px 16px 8px; }
.drawer-foot{ background:var(--card); border-top:1px solid var(--line); padding:16px 18px 18px; }
.close-x{ background:var(--bg); border:none; width:38px; height:38px; border-radius:10px; color:var(--navy); display:flex; align-items:center; justify-content:center; transition:background .2s; }
.close-x:hover{ background:var(--line); }

.citem{ background:var(--card); border-radius:12px; padding:11px; display:flex; gap:12px; margin-bottom:11px; box-shadow:var(--shadow-sm); }
.citem img{ width:70px; height:70px; border-radius:9px; object-fit:cover; flex-shrink:0; background:#f2f2f2; }
.citem-info{ flex:1; min-width:0; }
.citem-info h4{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:600; font-size:.85rem; line-height:1.3; margin-bottom:3px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.citem-info .csize{ font-size:.72rem; color:var(--muted); }
.citem-info .cprice{ font-family:'Sora',sans-serif; font-weight:700; color:var(--deal); font-size:.95rem; margin-top:4px; }
.citem-bottom{ display:flex; align-items:center; justify-content:space-between; margin-top:7px; }
.stepper{ display:inline-flex; align-items:center; border:1.5px solid var(--line); border-radius:8px; overflow:hidden; }
.stepper button{ width:28px; height:28px; background:var(--card); border:none; color:var(--navy); font-size:1rem; display:flex; align-items:center; justify-content:center; }
.stepper button:hover{ background:var(--bg); }
.stepper span{ min-width:30px; text-align:center; font-weight:600; font-size:.85rem; }
.link-del{ background:none; border:none; color:var(--muted-2); font-size:.76rem; display:inline-flex; align-items:center; gap:5px; padding:4px; }
.link-del:hover{ color:var(--deal); }

.cart-empty{ text-align:center; padding:60px 24px; color:var(--muted); }
.cart-empty svg{ margin:0 auto 16px; color:var(--muted-2); }
.cart-empty b{ display:block; font-family:'Sora',sans-serif; color:var(--navy); margin-bottom:6px; }
.sumrow{ display:flex; justify-content:space-between; font-size:.88rem; color:var(--muted); margin-bottom:8px; }
.sumrow.total{ color:var(--navy); font-family:'Sora',sans-serif; font-weight:700; font-size:1.15rem; padding-top:12px; margin-top:4px; border-top:1px dashed var(--line); }
.sumrow.total .amt{ color:var(--deal); }

/* ---------- Modal ---------- */
.modal{ position:fixed; inset:0; z-index:110; display:flex; align-items:flex-start; justify-content:center; padding:28px 16px; overflow-y:auto; opacity:0; visibility:hidden; transition:opacity .25s, visibility .25s; }
.modal.open{ opacity:1; visibility:visible; }
.modal-bg{ position:fixed; inset:0; background:rgba(15,27,46,.55); backdrop-filter:blur(3px); }
.modal-box{ position:relative; background:var(--card); border-radius:18px; width:100%; max-width:920px; box-shadow:var(--shadow-lg); z-index:2; margin:auto; overflow:hidden; }
.modal-box.sm{ max-width:460px; }
.modal-close{ position:absolute; top:14px; right:14px; z-index:5; background:rgba(255,255,255,.9); border:none; width:40px; height:40px; border-radius:50%; color:var(--navy); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); transition:transform .15s, background .2s; }
.modal-close:hover{ background:#fff; transform:rotate(90deg); }
.modal-pad{ padding:26px 28px 30px; }
@media(max-width:640px){ .modal-pad{ padding:22px 18px 26px; } }

/* product detail */
.pd-grid{ display:grid; grid-template-columns:1fr 1fr; }
@media(max-width:720px){ .pd-grid{ grid-template-columns:1fr; } }
.pd-gallery{ background:#f5f5f6; position:relative; }
.pd-main{ aspect-ratio:1/1; position:relative; overflow:hidden; }
.pd-main img{ width:100%; height:100%; object-fit:cover; }
.pd-nav{ position:absolute; top:50%; transform:translateY(-50%); width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,.9); border:none; color:var(--navy); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); }
.pd-nav.prev{ left:12px; } .pd-nav.next{ right:12px; }
.pd-thumbs{ display:flex; gap:8px; padding:12px; overflow-x:auto; scrollbar-width:none; }
.pd-thumbs::-webkit-scrollbar{ display:none; }
.pd-thumbs img{ width:56px; height:56px; border-radius:8px; object-fit:cover; border:2px solid transparent; cursor:pointer; flex-shrink:0; }
.pd-thumbs img.active{ border-color:var(--gold); }
.pd-info{ padding:26px 28px; display:flex; flex-direction:column; }
.pd-info .pd-badge{ align-self:flex-start; background:var(--deal-soft); color:var(--deal); font-size:.68rem; font-weight:700; padding:4px 10px; border-radius:6px; text-transform:uppercase; letter-spacing:.06em; margin-bottom:12px; }
.pd-info h2{ font-size:1.4rem; font-weight:700; line-height:1.25; }
.pd-rate{ display:flex; align-items:center; gap:10px; margin:10px 0 14px; font-size:.82rem; color:var(--muted); }
.pd-price{ display:flex; align-items:baseline; gap:12px; margin-bottom:4px; }
.pd-price .now{ font-family:'Sora',sans-serif; font-weight:800; font-size:1.9rem; color:var(--deal); }
.pd-price .was{ text-decoration:line-through; color:var(--muted-2); font-size:1rem; }
.pd-price .off{ background:var(--deal); color:#fff; font-size:.72rem; font-weight:700; padding:3px 8px; border-radius:6px; }
.pd-delivery{ font-size:.8rem; color:var(--muted); margin-bottom:18px; }
.pd-field{ margin-bottom:16px; }
.pd-field > label{ display:block; font-size:.74rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--navy); margin-bottom:8px; }
.size-opts{ display:flex; gap:8px; flex-wrap:wrap; }
.size-opts button{ border:1.5px solid var(--line); background:var(--card); color:var(--ink); padding:8px 15px; border-radius:9px; font-size:.83rem; font-weight:600; transition:all .15s; }
.size-opts button:hover{ border-color:var(--gold); }
.size-opts button.active{ background:var(--navy); border-color:var(--navy); color:#fff; }
.pd-actions{ display:flex; gap:10px; margin-top:auto; padding-top:8px; }
.pd-actions .btn{ flex:1; }
.pd-details{ margin-top:18px; border-top:1px solid var(--line); padding-top:16px; }
.pd-details p{ font-size:.86rem; color:var(--muted); margin:0 0 10px; white-space:pre-line; }
.pd-details ul{ margin:0; padding-left:18px; font-size:.84rem; color:var(--ink); line-height:1.8; }
.pd-details .note{ font-style:italic; font-size:.8rem; color:var(--muted-2); margin-top:10px; }
.pd-share{ background:none; border:none; color:var(--navy); font-size:.82rem; font-weight:600; display:inline-flex; align-items:center; gap:7px; margin-top:14px; padding:6px 0; }
.pd-share:hover{ color:var(--gold); }

/* ---------- Order / checkout form ---------- */
.co-head{ padding:24px 28px 6px; }
.co-head .kicker{ font-size:.7rem; letter-spacing:.24em; text-transform:uppercase; color:var(--gold); font-weight:700; }
.co-head h2{ font-size:1.5rem; margin:6px 0 4px; }
.co-head p{ color:var(--muted); font-size:.9rem; margin:0; }
.co-body{ display:grid; grid-template-columns:1fr 1.15fr; gap:0; }
@media(max-width:760px){ .co-body{ grid-template-columns:1fr; } }
.co-summary{ background:var(--bg); padding:22px 24px; border-right:1px solid var(--line); }
.co-summary h4{ font-size:.78rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-bottom:14px; }
.co-line{ display:flex; gap:11px; margin-bottom:13px; }
.co-line img{ width:52px; height:52px; border-radius:8px; object-fit:cover; flex-shrink:0; background:#eee; }
.co-line .m{ flex:1; min-width:0; }
.co-line h5{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:600; font-size:.82rem; line-height:1.3; margin:0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.co-line small{ font-size:.72rem; color:var(--muted); }
.co-line .lp{ font-family:'Sora',sans-serif; font-weight:700; font-size:.85rem; color:var(--navy); white-space:nowrap; }
.co-form{ padding:22px 26px 26px; position:relative; }
.frow{ margin-bottom:14px; }
.frow label{ display:block; font-size:.76rem; font-weight:700; color:var(--navy); margin-bottom:6px; }
.frow input, .frow textarea, .frow select{ width:100%; padding:11px 13px; border:1.5px solid var(--line); border-radius:10px; font-family:inherit; font-size:.9rem; color:var(--ink); background:var(--card); transition:border-color .2s, box-shadow .2s; }
.frow input:focus, .frow textarea:focus, .frow select:focus{ outline:none; border-color:var(--gold); box-shadow:0 0 0 3px rgba(0,174,184,.14); }
.fgrid2{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media(max-width:480px){ .fgrid2{ grid-template-columns:1fr; } }
.pay-choice{ display:grid; gap:9px; }
.pay-opt{ display:flex; align-items:flex-start; gap:11px; border:1.5px solid var(--line); border-radius:11px; padding:13px 14px; cursor:pointer; transition:border-color .2s, background .2s; }
.pay-opt:hover{ border-color:var(--gold); }
.pay-opt input{ margin-top:2px; accent-color:var(--gold); width:auto; }
.pay-opt.sel{ border-color:var(--gold); background:#EAFAFB; }
.pay-opt b{ display:block; font-size:.88rem; color:var(--navy); }
.pay-opt span{ font-size:.76rem; color:var(--muted); }
.form-error{ display:none; background:var(--deal-soft); color:var(--deal); font-size:.82rem; padding:11px 13px; border-radius:9px; margin-top:12px; }
.form-error.show{ display:block; }
.size-group-label{ display:block; font-size:.8rem; font-weight:700; color:var(--navy); margin:14px 0 8px; }
.size-chip-wrap{ display:flex; flex-wrap:wrap; gap:8px; }
.size-chip{ padding:10px 16px; border:1.5px solid var(--line); border-radius:10px; background:var(--card); font-size:.85rem; font-weight:600; color:var(--ink); cursor:pointer; transition:border-color .2s, background .2s, color .2s; }
.size-chip:hover{ border-color:var(--gold); }
.size-chip.active{ border-color:var(--gold); background:var(--gold); color:#fff; }
.admin-plist-row{ display:flex; align-items:center; gap:10px; border:1.5px solid var(--line); border-radius:10px; padding:8px 10px; flex-wrap:wrap; }
.admin-plist-actions{ display:flex; gap:8px; }

.success{ display:none; text-align:center; padding:20px 10px; }
.success.show{ display:block; }
.success .check{ width:64px; height:64px; border-radius:50%; background:var(--ok-soft); color:var(--ok); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
.success h3{ font-size:1.3rem; }
.success p{ color:var(--muted); font-size:.9rem; margin-top:8px; }
.total-pill{ display:inline-flex; align-items:center; gap:9px; background:var(--bg); border:1px solid var(--line); border-radius:10px; padding:11px 18px; margin-top:16px; font-family:'Sora',sans-serif; font-weight:700; color:var(--navy); }
.total-pill .amt{ color:var(--deal); }

.toast{ position:fixed; bottom:82px; left:50%; transform:translateX(-50%) translateY(20px); background:var(--navy); color:#fff; padding:12px 20px; border-radius:999px; font-size:.86rem; font-weight:600; box-shadow:var(--shadow-lg); z-index:200; opacity:0; visibility:hidden; transition:all .3s; display:flex; align-items:center; gap:9px; }
.toast.show{ opacity:1; visibility:visible; transform:translateX(-50%) translateY(0); }
.toast svg{ color:var(--gold-2); }
@media(min-width:761px){ .toast{ bottom:28px; } }
