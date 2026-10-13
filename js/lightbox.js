/* lightbox.js - ingrandisce le foto con frecce avanti/indietro (tastiera e swipe) */
window.CRLightbox = (function () {
  let box, img, count, list = [], idx = 0, startX = null;

  function build() {
    if (box) return;
    box = document.createElement('div');
    box.className = 'cr-lightbox';
    box.innerHTML =
      '<button class="cr-lb-btn cr-lb-close" aria-label="Chiudi">&times;</button>' +
      '<button class="cr-lb-btn cr-lb-prev" aria-label="Foto precedente">&#10094;</button>' +
      '<img alt="">' +
      '<button class="cr-lb-btn cr-lb-next" aria-label="Foto successiva">&#10095;</button>' +
      '<div class="cr-lb-count"></div>';
    document.body.appendChild(box);
    img = box.querySelector('img');
    count = box.querySelector('.cr-lb-count');
    box.querySelector('.cr-lb-close').onclick = close;
    box.querySelector('.cr-lb-prev').onclick = function (e) { e.stopPropagation(); step(-1); };
    box.querySelector('.cr-lb-next').onclick = function (e) { e.stopPropagation(); step(1); };
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      startX = null;
    });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  function show() {
    img.src = list[idx];
    count.textContent = (idx + 1) + ' / ' + list.length;
  }
  function step(d) {
    idx = (idx + d + list.length) % list.length;   // si resta nel visualizzatore, si torna all'inizio/fine
    show();
  }
  function open(urls, start) {
    build();
    list = urls; idx = start || 0;
    show();
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
  }
  return { open: open };
})();
