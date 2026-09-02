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
  if (acceptBtn) acceptBtn.addEventListener('click', function () { setChoice('accepted'); });
  if (rejectBtn) rejectBtn.addEventListener('click', function () { setChoice('rejected'); });

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
});


