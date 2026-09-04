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
  initCarousels();
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

/* ---- Photo carousels ---- */
function initCarousels() {
  document.querySelectorAll('.photo-carousel').forEach(function (carousel) {
    var data;
    try {
      data = JSON.parse(carousel.getAttribute('data-images') || '[]');
    } catch (e) {
      data = [];
    }
    if (!data.length) return;

    var img = carousel.querySelector('.photo-carousel-img');
    var dots = carousel.querySelectorAll('.dot');
    var countEl = carousel.querySelector('.carousel-count');
    var prevBtn = carousel.querySelector('.carousel-arrow.prev');
    var nextBtn = carousel.querySelector('.carousel-arrow.next');
    var idx = 0;

    function render() {
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var apply = function () {
        img.src = data[idx].src;
        img.alt = data[idx].alt || '';
        img.style.opacity = 1;
      };
      if (reduced) {
        apply();
      } else {
        img.style.opacity = 0;
        setTimeout(apply, 150);
      }
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
      if (countEl) countEl.textContent = (idx + 1) + ' / ' + data.length;
    }

    function go(delta) {
      idx = (idx + delta + data.length) % data.length;
      render();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { idx = i; render(); });
    });
  });
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

/* Each rotating slot draws from its own themed pool, so the 3 dishes shown
   always read like a mini menu: para empezar / plato típico / para rematar. */
var FEATURED_STARTERS_ES = [
  { cat: 'Entrante', name: 'Ensalada de brotes de canónigos con queso de cabra y mermelada de tomate', price: '13,00 €', img: IMG_BASE + 'ensalada-brotes-canonigos.jpg' },
  { cat: 'Entrante', name: 'Caracoles en salsa de avellanas', price: '13,00 €', img: IMG_BASE + 'caracoles-salsa-avellanas.jpg' },
  { cat: 'Entrante', name: 'Cazuela de setas en salsa', price: '13,00 €', img: IMG_BASE + 'cazuela-setas-salsa.jpg' },
  { cat: 'Entrante', name: 'Paté de perdiz', price: '13,00 €', img: IMG_BASE + 'pate-perdiz.jpg' },
  { cat: 'Entrante', name: 'Escalivada de pimientos asados con anchoas, berenjena y cebolla', price: '15,00 €', img: IMG_BASE + 'escalivada-pimientos-anchoas.jpg' },
  { cat: 'Entrante', name: 'Paté de queso cremoso con boletus', price: '13,00 €', img: IMG_BASE + 'pate-queso-cremoso-boletus.jpg' },
  { cat: 'Entrante', name: 'Guiso de alcachofas con gambón', price: '13,00 €', img: IMG_BASE + 'guiso-alcachofas-gambon.jpg' },
  { cat: 'Escabeche de la abuela', name: 'Verduritas escabechadas', price: '10,00 €', img: IMG_BASE + 'verduritas-escabechadas.jpg' },
  { cat: 'Escabeche de la abuela', name: 'Timbal de conejo escabechado', price: '13,00 €', img: IMG_BASE + 'timbal-conejo-escabechado.jpg' },
  { cat: 'Escabeche de la abuela', name: 'Lomo escabechado en salsa de perdiz', price: '13,00 €', img: IMG_BASE + 'lomo-escabechado-salsa-perdiz.jpg' },
  { cat: 'Escabeche de la abuela', name: 'Bonito encebollado con vermut a la naranja', price: '14,00 €', img: IMG_BASE + 'bonito-encebollado-vermut-naranja.jpg' }
];

var FEATURED_TYPICAL_ES = [
  { cat: 'Típico conquense', name: 'Morteruelo', price: '13,00 €', img: IMG_BASE + 'morteruelo.jpg' },
  { cat: 'Típico conquense', name: 'Ajoarriero', price: '13,00 €', img: IMG_BASE + 'ajoarriero.jpg' },
  { cat: 'Típico conquense', name: 'Pisto manchego con secreto ibérico', price: '13,00 €', img: IMG_BASE + 'pisto-manchego-secreto-iberico.jpg' },
  { cat: 'Típico conquense', name: 'Ensaladilla', price: '13,00 €', img: IMG_BASE + 'ensaladilla.jpg' },
  { cat: 'Típico conquense', name: 'Oreja en salsa', price: '13,00 €', img: IMG_BASE + 'oreja-en-salsa.jpg' },
  { cat: 'Típico conquense', name: 'Lomo de orza', price: '13,00 €', img: IMG_BASE + 'lomo-de-orza.jpg' },
  { cat: 'Típico conquense', name: 'Zarajos', price: '10,00 €', img: IMG_BASE + 'zarajos.jpg' },
  { cat: 'Típico conquense', name: 'Tabla de quesos manchegos', price: '20,00 €', img: IMG_BASE + 'tabla-quesos-manchegos.jpg' },
  { cat: 'Típico conquense', name: 'Tabla de ibéricos', price: '25,00 €', img: IMG_BASE + 'tabla-ibericos.jpg' },
  { cat: 'Nuestras tostas', name: 'Tosta de jamón ibérico', price: '15,00 €', img: IMG_BASE + 'tosta-jamon-iberico.jpg' },
  { cat: 'Nuestras tostas', name: 'Tosta de sobrasada con miel', price: '12,50 €', img: IMG_BASE + 'tosta-sobrasada-miel.jpg' },
  { cat: 'Nuestras tostas', name: 'Tosta de ahumados', price: '12,50 €', img: IMG_BASE + 'tosta-ahumados.jpg' }
];

var FEATURED_MAINS_ES = [
  { cat: 'Especialidad de la casa', name: 'Tacos de carrillada de ternera con cebolla encurtida a la naranja', price: '13,00 €', img: IMG_BASE + 'tacos-carrillada-ternera.jpg' },
  { cat: 'Especialidad de la casa', name: 'Canelones de rabo de toro', price: '15,00 €', img: IMG_BASE + 'canelones-rabo-toro.jpg' },
  { cat: 'Especialidad de la casa', name: 'Albóndigas de jabalí', price: '13,00 €', img: IMG_BASE + 'albondigas-jabali.jpg' },
  { cat: 'Especialidad de la casa', name: 'Albóndigas de secreto ibérico con morcilla', price: '13,00 €', img: IMG_BASE + 'albondigas-secreto-iberico-morcilla.jpg' },
  { cat: 'Especialidad de la casa', name: 'Pan bao relleno de codillo de cerdo con mostaza y manzana', price: '13,00 €', img: IMG_BASE + 'pan-bao-codillo-cerdo.jpg' },
  { cat: 'Especialidad de la casa', name: 'Quesadilla de carne de ciervo', price: '10,00 €', img: IMG_BASE + 'quesadilla-carne-ciervo.jpg' },
  { cat: 'Especialidad de la casa', name: 'Estofado de ciervo', price: '13,00 €', img: IMG_BASE + 'estofado-ciervo.jpg' },
  { cat: 'Postre', name: 'Alajú', price: '6,50 €', img: IMG_BASE + 'alaju.jpg' },
  { cat: 'Postre', name: 'Salchichón de chocolate', price: '6,50 €', img: IMG_BASE + 'salchichon-postre.jpg' },
  { cat: 'Postre', name: 'Yogur de leche de cabra con mermelada de arándanos', price: '6,50 €', img: IMG_BASE + 'yogur-leche-cabra-arandanos.jpg' },
  { cat: 'Postre', name: 'Tarta de queso con avellanas y chocolate', price: '6,50 €', img: IMG_BASE + 'tarta-queso-avellanas-chocolate.jpg' }
];

var FEATURED_STARTERS_EN = [
  { cat: 'Starter', name: "Lamb's lettuce salad with goat cheese and tomato jam", price: '€13.00', img: IMG_BASE + 'ensalada-brotes-canonigos.jpg' },
  { cat: 'Starter', name: 'Snails in hazelnut sauce', price: '€13.00', img: IMG_BASE + 'caracoles-salsa-avellanas.jpg' },
  { cat: 'Starter', name: 'Wild mushroom casserole in sauce', price: '€13.00', img: IMG_BASE + 'cazuela-setas-salsa.jpg' },
  { cat: 'Starter', name: 'Partridge pâté', price: '€13.00', img: IMG_BASE + 'pate-perdiz.jpg' },
  { cat: 'Starter', name: 'Roasted pepper escalivada with anchovies, aubergine and onion', price: '€15.00', img: IMG_BASE + 'escalivada-pimientos-anchoas.jpg' },
  { cat: 'Starter', name: 'Creamy cheese pâté with porcini mushrooms', price: '€13.00', img: IMG_BASE + 'pate-queso-cremoso-boletus.jpg' },
  { cat: 'Starter', name: 'Artichoke stew with king prawn', price: '€13.00', img: IMG_BASE + 'guiso-alcachofas-gambon.jpg' },
  { cat: "Grandma's escabeche", name: 'Pickled vegetables', price: '€10.00', img: IMG_BASE + 'verduritas-escabechadas.jpg' },
  { cat: "Grandma's escabeche", name: 'Pickled rabbit timbale', price: '€13.00', img: IMG_BASE + 'timbal-conejo-escabechado.jpg' },
  { cat: "Grandma's escabeche", name: 'Pickled pork loin in partridge sauce', price: '€13.00', img: IMG_BASE + 'lomo-escabechado-salsa-perdiz.jpg' },
  { cat: "Grandma's escabeche", name: 'Bonito tuna with caramelised onion and orange vermouth', price: '€14.00', img: IMG_BASE + 'bonito-encebollado-vermut-naranja.jpg' }
];

var FEATURED_TYPICAL_EN = [
  { cat: 'Cuenca classic', name: 'Morteruelo', price: '€13.00', img: IMG_BASE + 'morteruelo.jpg' },
  { cat: 'Cuenca classic', name: 'Ajoarriero', price: '€13.00', img: IMG_BASE + 'ajoarriero.jpg' },
  { cat: 'Cuenca classic', name: 'La Mancha-style ratatouille with Iberian pork secreto', price: '€13.00', img: IMG_BASE + 'pisto-manchego-secreto-iberico.jpg' },
  { cat: 'Cuenca classic', name: 'Ensaladilla', price: '€13.00', img: IMG_BASE + 'ensaladilla.jpg' },
  { cat: 'Cuenca classic', name: 'Pork ear in sauce', price: '€13.00', img: IMG_BASE + 'oreja-en-salsa.jpg' },
  { cat: 'Cuenca classic', name: 'Orza-preserved pork loin', price: '€13.00', img: IMG_BASE + 'lomo-de-orza.jpg' },
  { cat: 'Cuenca classic', name: 'Zarajos', price: '€10.00', img: IMG_BASE + 'zarajos.jpg' },
  { cat: 'Cuenca classic', name: 'La Mancha cheese board', price: '€20.00', img: IMG_BASE + 'tabla-quesos-manchegos.jpg' },
  { cat: 'Cuenca classic', name: 'Iberian cold cuts board', price: '€25.00', img: IMG_BASE + 'tabla-ibericos.jpg' },
  { cat: 'Our tostas', name: 'Iberian ham tosta', price: '€15.00', img: IMG_BASE + 'tosta-jamon-iberico.jpg' },
  { cat: 'Our tostas', name: 'Sobrasada tosta with honey', price: '€12.50', img: IMG_BASE + 'tosta-sobrasada-miel.jpg' },
  { cat: 'Our tostas', name: 'Smoked fish tosta', price: '€12.50', img: IMG_BASE + 'tosta-ahumados.jpg' }
];

var FEATURED_MAINS_EN = [
  { cat: 'House specialty', name: 'Braised beef cheek bites with orange-pickled onion', price: '€13.00', img: IMG_BASE + 'tacos-carrillada-ternera.jpg' },
  { cat: 'House specialty', name: 'Oxtail cannelloni', price: '€15.00', img: IMG_BASE + 'canelones-rabo-toro.jpg' },
  { cat: 'House specialty', name: 'Wild boar meatballs', price: '€13.00', img: IMG_BASE + 'albondigas-jabali.jpg' },
  { cat: 'House specialty', name: 'Iberian pork secreto meatballs with black pudding', price: '€13.00', img: IMG_BASE + 'albondigas-secreto-iberico-morcilla.jpg' },
  { cat: 'House specialty', name: 'Bao bun filled with pork knuckle, mustard and apple', price: '€13.00', img: IMG_BASE + 'pan-bao-codillo-cerdo.jpg' },
  { cat: 'House specialty', name: 'Venison quesadilla', price: '€10.00', img: IMG_BASE + 'quesadilla-carne-ciervo.jpg' },
  { cat: 'House specialty', name: 'Venison stew', price: '€13.00', img: IMG_BASE + 'estofado-ciervo.jpg' },
  { cat: 'Dessert', name: 'Alajú', price: '€6.50', img: IMG_BASE + 'alaju.jpg' },
  { cat: 'Dessert', name: 'Chocolate salchichón', price: '€6.50', img: IMG_BASE + 'salchichon-postre.jpg' },
  { cat: 'Dessert', name: "Goat's milk yoghurt with blueberry jam", price: '€6.50', img: IMG_BASE + 'yogur-leche-cabra-arandanos.jpg' },
  { cat: 'Dessert', name: 'Cheesecake with hazelnuts and chocolate', price: '€6.50', img: IMG_BASE + 'tarta-queso-avellanas-chocolate.jpg' }
];

var FEATURED_GROUPS = IS_EN_PAGE
  ? [FEATURED_STARTERS_EN, FEATURED_TYPICAL_EN, FEATURED_MAINS_EN]
  : [FEATURED_STARTERS_ES, FEATURED_TYPICAL_ES, FEATURED_MAINS_ES];
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
  if (dishEls.length !== FEATURED_GROUPS.length) return;

  var idx = FEATURED_GROUPS.map(function () { return 0; });

  function showAll() {
    dishEls.forEach(function (el, i) {
      var group = FEATURED_GROUPS[i];
      renderDish(el, group[idx[i] % group.length]);
    });
  }

  showAll();

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function advance() {
    idx = idx.map(function (v, i) { return (v + 1) % FEATURED_GROUPS[i].length; });
    showAll();
  }

  setInterval(function () {
    if (reduced) {
      advance();
      return;
    }
    dishEls.forEach(function (el) { el.classList.add('fading'); });
    setTimeout(function () {
      advance();
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

