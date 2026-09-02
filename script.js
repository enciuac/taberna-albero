document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('nav.links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
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
  var jumpLinks = document.querySelectorAll('.menu-jump a');
  if (jumpLinks.length) {
    var cats = Array.prototype.map.call(jumpLinks, function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    });
    var setActive = function () {
      var pos = window.scrollY + 140;
      var current = 0;
      cats.forEach(function (cat, i) {
        if (cat && cat.offsetTop <= pos) current = i;
      });
      jumpLinks.forEach(function (a, i) {
        a.classList.toggle('active', i === current);
      });
    };
    document.addEventListener('scroll', setActive, { passive: true });
    setActive();
  }

  initFeaturedDishes();
  initMenuLightbox();
});

/* ---- Featured dishes rotation ---- */
var FEATURED_DISHES = [
  { cat: 'Especialidad de la casa', name: 'Canelones de rabo de toro', price: '15,00 €', img: null },
  { cat: 'Típico conquense', name: 'Morteruelo', price: '13,00 €', img: null },
  { cat: 'Postre', name: 'Salchichón de chocolate', price: '6,50 €', img: 'img/salchichon-postre.jpg' },
  { cat: 'Especialidad de la casa', name: 'Albóndigas de jabalí', price: '13,00 €', img: null },
  { cat: 'Típico conquense', name: 'Zarajos', price: '10,00 €', img: null },
  { cat: 'Entrante', name: 'Tabla de quesos manchegos', price: '20,00 €', img: null },
  { cat: 'Especialidad de la casa', name: 'Estofado de ciervo', price: '13,00 €', img: null },
  { cat: 'Nuestras tostas', name: 'Tosta de jamón ibérico', price: '15,00 €', img: null }
];
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
  if (reduced) return;

  setInterval(function () {
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

