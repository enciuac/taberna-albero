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

