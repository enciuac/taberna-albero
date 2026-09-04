document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('nav.links');
  if (toggle && links) {
    var setOpen = function (open) {
      links.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () {
      setOpen(!links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setOpen(false);
      });
    });
  }

  /* ---- Keep sticky menu-jump flush under the sticky header ---- */
  var siteHeader = document.querySelector('header');
  var menuJump = document.querySelector('.menu-jump');
  if (siteHeader && menuJump) {
    var syncJumpOffset = function () {
      menuJump.style.top = siteHeader.getBoundingClientRect().height + 'px';
    };
    syncJumpOffset();
    window.addEventListener('resize', syncJumpOffset);
  }
});

window.addEventListener('load', function () {
  var loader = document.getElementById('loader');
  if (!loader) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(function () {
    loader.classList.add('hide');
  }, reduced ? 150 : 700);
});

/* ---- Cookie consent ---- */
function loadMapIfConsented() {
  var slot = document.getElementById('map-slot');
  if (!slot) return;
  if (localStorage.getItem('albero-cookies') === 'accepted') {
    var src = slot.getAttribute('data-src');
    slot.innerHTML = '<iframe class="map-frame" loading="lazy" src="' + src + '"></iframe>';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var banner = document.getElementById('cookie-banner');
  var choice = localStorage.getItem('albero-cookies');

  if (banner && !choice) {
    setTimeout(function () { banner.classList.add('show'); }, 600);
  }

  function setChoice(value) {
    localStorage.setItem('albero-cookies', value);
    if (banner) banner.classList.remove('show');
    loadMapIfConsented();
  }

  var acceptBtn = document.getElementById('cookie-accept');
  var rejectBtn = document.getElementById('cookie-reject');
  var closeBtn = document.getElementById('cookie-close');
  if (acceptBtn) acceptBtn.addEventListener('click', function () { setChoice('accepted'); });
  if (rejectBtn) rejectBtn.addEventListener('click', function () { setChoice('rejected'); });
  if (closeBtn && banner) closeBtn.addEventListener('click', function () { banner.classList.remove('show'); });

  var mapEnableBtn = document.getElementById('map-enable');
  if (mapEnableBtn) mapEnableBtn.addEventListener('click', function () { setChoice('accepted'); });

  var reopenBtn = document.getElementById('reopen-cookies');
  if (reopenBtn && banner) {
    reopenBtn.addEventListener('click', function () {
      banner.classList.add('show');
    });
  }

  loadMapIfConsented();

  /* ---- Menu category scroll-spy ---- */
  var jumpNav = document.querySelector('.menu-jump');
  var jumpLinks = document.querySelectorAll('.menu-jump a');
  if (jumpLinks.length) {
    var cats = Array.prototype.map.call(jumpLinks, function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    });
    var lastActive = -1;
    var setActive = function () {
      var pos = window.scrollY + 140;
      var current = 0;
      cats.forEach(function (cat, i) {
        if (cat && cat.offsetTop <= pos) current = i;
      });
      jumpLinks.forEach(function (a, i) {
        a.classList.toggle('active', i === current);
      });
      if (current !== lastActive) {
        lastActive = current;
        var activeLink = jumpLinks[current];
        if (activeLink && jumpNav) {
          var linkCenter = activeLink.offsetLeft + activeLink.offsetWidth / 2;
          var target = linkCenter - jumpNav.clientWidth / 2;
          jumpNav.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
        }
      }
    };
    document.addEventListener('scroll', setActive, { passive: true });
    setActive();
  }

  initMenuJumpDrag();
  initFeaturedDishes();
  initMenuLightbox();
  initScrollReveal();
});

/* ---- Manual drag-to-scroll for the menu category bar (desktop mouse) ---- */
function initMenuJumpDrag() {
  var el = document.querySelector('.menu-jump');
  if (!el) return;
  var isDown = false, startX = 0, startScroll = 0, moved = false;

  el.addEventListener('mousedown', function (e) {
    isDown = true;
    moved = false;
    startX = e.pageX;
    startScroll = el.scrollLeft;
  });
  window.addEventListener('mousemove', function (e) {
    if (!isDown) return;
    var dx = e.pageX - startX;
    if (!moved && Math.abs(dx) > 6) {
      moved = true;
      el.classList.add('dragging');
    }
    if (moved) el.scrollLeft = startScroll - dx;
  });
  window.addEventListener('mouseup', function () {
    if (!isDown) return;
    isDown = false;
    el.classList.remove('dragging');
  });
  el.addEventListener('click', function (e) {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
  el.addEventListener('dragstart', function (e) { e.preventDefault(); });
}

/* ---- Scroll-reveal ---- */
function initScrollReveal() {
  var selectors = [
    '.section-head',
    '.about-grid > *',
    '.diet-card',
    '.dish-grid-outer',
    '.testi',
    '.review-card',
    '.wine-list',
    '.gallery-grid > *',
    '.menu-cat',
    '.info-block'
  ];
  var elements = [];
  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { elements.push(el); });
  });
  if (!elements.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('reveal', 'revealed'); });
    return;
  }

  elements.forEach(function (el) { el.classList.add('reveal'); });

  var byParent = new Map();
  elements.forEach(function (el) {
    var p = el.parentElement;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(el);
  });
  byParent.forEach(function (siblings) {
    siblings.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i, 5) * 90) + 'ms';
    });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(function (el) { io.observe(el); });
}

/* ---- Featured dishes rotation ---- */
var IS_EN_PAGE = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
var IMG_BASE = IS_EN_PAGE ? '../img/' : 'img/';

var FEATURED_DISHES_ES = [
  { cat: 'Especialidad de la casa', name: 'Canelones de rabo de toro', price: '15,00 €', img: IMG_BASE + 'canelones-rabo-toro.jpg' },
  { cat: 'Típico conquense', name: 'Morteruelo', price: '13,00 €', img: IMG_BASE + 'morteruelo.jpg' },
  { cat: 'Postre', name: 'Salchichón de chocolate', price: '6,50 €', img: IMG_BASE + 'salchichon-postre.jpg' },
  { cat: 'Especialidad de la casa', name: 'Albóndigas de jabalí', price: '13,00 €', img: IMG_BASE + 'albondigas-jabali.jpg' },
  { cat: 'Típico conquense', name: 'Zarajos', price: '10,00 €', img: IMG_BASE + 'zarajos.jpg' },
  { cat: 'Entrante', name: 'Tabla de quesos manchegos', price: '20,00 €', img: IMG_BASE + 'tabla-quesos-manchegos.jpg' },
  { cat: 'Especialidad de la casa', name: 'Estofado de ciervo', price: '13,00 €', img: null },
  { cat: 'Nuestras tostas', name: 'Tosta de jamón ibérico', price: '15,00 €', img: null }
];

var FEATURED_DISHES_EN = [
  { cat: 'House specialty', name: 'Oxtail cannelloni', price: '€15.00', img: IMG_BASE + 'canelones-rabo-toro.jpg' },
  { cat: 'Cuenca classic', name: 'Morteruelo', price: '€13.00', img: IMG_BASE + 'morteruelo.jpg' },
  { cat: 'Dessert', name: 'Chocolate salchichón', price: '€6.50', img: IMG_BASE + 'salchichon-postre.jpg' },
  { cat: 'House specialty', name: 'Wild boar meatballs', price: '€13.00', img: IMG_BASE + 'albondigas-jabali.jpg' },
  { cat: 'Cuenca classic', name: 'Zarajos', price: '€10.00', img: IMG_BASE + 'zarajos.jpg' },
  { cat: 'Starter', name: 'La Mancha cheese board', price: '€20.00', img: IMG_BASE + 'tabla-quesos-manchegos.jpg' },
  { cat: 'House specialty', name: 'Venison stew', price: '€13.00', img: null },
  { cat: 'Our tostas', name: 'Iberian ham tosta', price: '€15.00', img: null }
];

var FEATURED_DISHES = IS_EN_PAGE ? FEATURED_DISHES_EN : FEATURED_DISHES_ES;
var DISH_ROTATE_MS = 7000;

function renderDish(el, dish) {
  var photo = el.querySelector('.dish-photo');
  if (photo) {
    if (dish.img) {
      photo.innerHTML = '<img src="' + dish.img + '" alt="' + dish.name + '" style="height:100%;width:100%;object-fit:cover;">';
    } else {
      photo.innerHTML = '<div class="dish-ph"><span class="mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="14" r="3.5"/></svg></span></div>';
    }
  }
  var catEl = el.querySelector('.cat');
  var nameEl = el.querySelector('h3');
  var priceEl = el.querySelector('.price');
  if (catEl) catEl.textContent = dish.cat;
  if (nameEl) nameEl.textContent = dish.name;
  if (priceEl) priceEl.textContent = dish.price;

  el.classList.toggle('has-photo', !!dish.img);
  if (dish.img) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Ver foto de ' + dish.name);
    el.onclick = function () { openLightbox(dish.img, dish.name); };
    el.onkeydown = function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(dish.img, dish.name); }
    };
  } else {
    el.removeAttribute('tabindex');
    el.removeAttribute('role');
    el.removeAttribute('aria-label');
    el.onclick = null;
    el.onkeydown = null;
  }
}

function initFeaturedDishes() {
  var dishEls = document.querySelectorAll('.dish-grid .dish');
  if (!dishEls.length || dishEls.length >= FEATURED_DISHES.length) return;

  var n = dishEls.length;
  var idx = 0;

  function showSet(startIdx) {
    for (var i = 0; i < n; i++) {
      renderDish(dishEls[i], FEATURED_DISHES[(startIdx + i) % FEATURED_DISHES.length]);
    }
  }

  showSet(0);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  setInterval(function () {
    if (reduced) {
      idx = (idx + n) % FEATURED_DISHES.length;
      showSet(idx);
      return;
    }
    dishEls.forEach(function (el) { el.classList.add('fading'); });
    setTimeout(function () {
      idx = (idx + n) % FEATURED_DISHES.length;
      showSet(idx);
      dishEls.forEach(function (el) { el.classList.remove('fading'); });
    }, 400);
  }, DISH_ROTATE_MS);
}

/* ---- Menu thumbnail lightbox ---- */
var lightboxEl, lightboxImg, lightboxCaption;

function ensureLightbox() {
  if (lightboxEl) return;
  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.innerHTML =
    '<div class="lightbox-inner">' +
      '<button class="lightbox-close" type="button" aria-label="Cerrar">&times;</button>' +
      '<img alt="">' +
      '<div class="lightbox-caption"></div>' +
    '</div>';
  document.body.appendChild(lightboxEl);
  lightboxImg = lightboxEl.querySelector('img');
  lightboxCaption = lightboxEl.querySelector('.lightbox-caption');
  lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', function (e) {
    if (e.target === lightboxEl) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(src, caption) {
  ensureLightbox();
  lightboxImg.src = src;
  lightboxImg.alt = caption;
  lightboxCaption.textContent = caption;
  lightboxEl.classList.add('show');
}

function closeLightbox() {
  if (lightboxEl) lightboxEl.classList.remove('show');
}

function initMenuLightbox() {
  var items = document.querySelectorAll('.menu-item');
  items.forEach(function (item) {
    var thumb = item.querySelector('.menu-item-thumb img');
    if (!thumb) return;
    var nameEl = item.querySelector('.name');
    var caption = nameEl ? nameEl.childNodes[0].textContent.trim() : thumb.alt;

    item.classList.add('has-photo');
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Ver foto de ' + caption);

    item.addEventListener('click', function () {
      openLightbox(thumb.src, caption);
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(thumb.src, caption);
      }
    });
  });
}

