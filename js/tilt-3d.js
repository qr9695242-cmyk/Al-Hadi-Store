/* ============================================================
   AL HADI STORE — 3D interaction layer (2026)
   Purely additive: does not call or override any function in
   app.js, does not touch existing IDs' logic. Only reads the
   DOM and sets CSS custom properties / classes for theme-3d.css.
   ============================================================ */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;

  /* ---- Scroll-reveal for top-level sections (works regardless of touch) ---- */
  document.addEventListener('DOMContentLoaded', function(){
    var main = document.querySelector('main.wrap') || document.querySelector('main');
    if(main){
      Array.prototype.forEach.call(main.children, function(el){
        if(el.tagName === 'SECTION' || el.classList.contains('cat-circles')){
          el.classList.add('section-reveal');
        }
      });
    }
    var sio = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in-view'); sio.unobserve(entry.target); }
      });
    }, { threshold: 0.08 }) : null;
    if(sio) document.querySelectorAll('.section-reveal').forEach(function(el){ sio.observe(el); });
  });

  if(reduceMotion || isTouch) return; // tilt/parallax are pointer-only enhancements

  var MAX_TILT = 10; // degrees

  /* ---- Product card tilt (event delegation, works for cards added later) ---- */
  document.addEventListener('mousemove', function(e){
    var card = e.target.closest && e.target.closest('.pcard');
    if(!card) return;
    var r = card.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width;
    var py = (e.clientY - r.top) / r.height;
    var ry = (px - 0.5) * MAX_TILT * 2;
    var rx = (0.5 - py) * MAX_TILT * 2;
    card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
  }, { passive: true });

  document.addEventListener('mouseout', function(e){
    var card = e.target.closest && e.target.closest('.pcard');
    if(!card) return;
    if(card.contains(e.relatedTarget)) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });

  /* ---- Hero parallax ---- */
  var hero = document.getElementById('heroBanner');
  if(hero){
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      var text = hero.querySelector('.hero-slide.active .hero-text');
      if(text){
        text.style.transform = 'translateZ(60px) rotateX(' + (py * -6).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg)';
      }
    }, { passive: true });
    hero.addEventListener('mouseleave', function(){
      var text = hero.querySelector('.hero-slide.active .hero-text');
      if(text) text.style.transform = 'translateZ(60px)';
    });
  }

  /* ---- Scroll-reveal for product cards ---- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){ entry.target.classList.add('in-view'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

  function observeNewCards(root){
    if(!io || !root) return;
    root.querySelectorAll('.pcard:not(.in-view)').forEach(function(card){ io.observe(card); });
  }

  ['productGrid','flashSaleRow','newArrivalsRow','bestSellersRow','recentlyViewedRow'].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    observeNewCards(el);
    new MutationObserver(function(){ observeNewCards(el); }).observe(el, { childList: true });
  });
})();
