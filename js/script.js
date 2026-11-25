// Rockfield Schools: small page behaviours
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var header = document.querySelector('header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
