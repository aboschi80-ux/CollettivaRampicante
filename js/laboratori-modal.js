/* ==========================================================================
   Collettiva Rampicante – Pop up materiali dei laboratori
   Pagina: pages/laboratori.html
   Cartelle: images/laboratori/LAB0, LAB1, LAB2 ...  (stesso ordine della pagina)
   Ogni cartella contiene:  locandina.jpg  +  foto / video / audio a piacere
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- CONFIGURAZIONE ---------- */
  var CONFIG = {
    owner: 'aboschi80-ux',
    repo: 'CollettivaRampicante',
    branch: 'main',
    folderBase: '../images/laboratori/',   // relativo a pages/laboratori.html
    folderPrefix: 'LAB',                   // LAB0, LAB1, ...
    posterName: 'locandina',               // locandina.jpg (vedi POSTER_EXT)
    posterExt: ['jpg', 'jpeg', 'png', 'webp'],
    // Immagini attuali della pagina: servono per riconoscere i laboratori
    // e come ripiego se la locandina nuova non è ancora stata caricata.
    legacyPosterSelector: 'img[src*="images/laboratori/evento"]'
  };

  var IMG = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
  var VID = ['mp4', 'webm', 'mov', 'm4v'];
  var AUD = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];

  function ext(name) { return (name.split('.').pop() || '').toLowerCase(); }
  function kind(name) {
    var e = ext(name);
    if (IMG.indexOf(e) > -1) return 'img';
    if (VID.indexOf(e) > -1) return 'vid';
    if (AUD.indexOf(e) > -1) return 'aud';
    return null;
  }
  function isPoster(name) {
    var base = name.replace(/\.[^.]+$/, '').toLowerCase();
    return base === CONFIG.posterName && IMG.indexOf(ext(name)) > -1;
  }
  function labFolder(n) { return CONFIG.folderBase + CONFIG.folderPrefix + n + '/'; }
  function fileUrl(n, name) { return labFolder(n) + encodeURIComponent(name); }
  function naturalSort(a, b) {
    return a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' });
  }

  /* ---------- ELENCO FILE DI UNA CARTELLA ----------
     1) manifest.json (se presente) -> ["foto1.jpg", "video.mp4", ...]
     2) altrimenti API pubblica di GitHub (nessuna manutenzione)          */
  function listFiles(n) {
    var cacheKey = 'lab-files-' + n;
    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) return Promise.resolve(JSON.parse(cached));
    } catch (e) {}

    function store(list) {
      try { sessionStorage.setItem(cacheKey, JSON.stringify(list)); } catch (e) {}
      return list;
    }

    return fetch(labFolder(n) + 'manifest.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('no manifest'); return r.json(); })
      .then(function (arr) { return store(arr); })
      .catch(function () {
        var api = 'https://api.github.com/repos/' + CONFIG.owner + '/' + CONFIG.repo +
          '/contents/images/laboratori/' + CONFIG.folderPrefix + n + '?ref=' + CONFIG.branch;
        return fetch(api)
          .then(function (r) {
            if (r.status === 404) return [];
            if (!r.ok) throw new Error('api ' + r.status);
            return r.json();
          })
          .then(function (items) {
            return store(items.filter(function (i) { return i.type === 'file'; })
              .map(function (i) { return i.name; }));
          });
      });
  }

  /* ---------- MODAL ---------- */
  var modal, bodyEl, titleEl, lastFocus;

  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'lab-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'lab-modal-title');
    modal.hidden = true;
    modal.innerHTML =
      '<div class="lab-modal__backdrop" data-close></div>' +
      '<div class="lab-modal__box">' +
        '<button type="button" class="lab-modal__close" data-close aria-label="Chiudi">&times;</button>' +
        '<h2 id="lab-modal-title" class="lab-modal__title"></h2>' +
        '<div class="lab-modal__body"></div>' +
      '</div>';
    document.body.appendChild(modal);
    bodyEl = modal.querySelector('.lab-modal__body');
    titleEl = modal.querySelector('.lab-modal__title');

    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') {
        var lb = document.querySelector('.lab-lightbox');
        if (lb) lb.remove(); else closeModal();
      }
    });
  }

  function closeModal() {
    modal.hidden = true;
    document.documentElement.classList.remove('lab-modal-open');
    bodyEl.innerHTML = '';
    if (lastFocus) lastFocus.focus();
  }

  function lightbox(src, alt) {
    var lb = document.createElement('div');
    lb.className = 'lab-lightbox';
    lb.innerHTML = '<img alt="">';
    lb.querySelector('img').src = src;
    lb.querySelector('img').alt = alt || '';
    lb.addEventListener('click', function () { lb.remove(); });
    document.body.appendChild(lb);
  }

  function openLab(n, title) {
    lastFocus = document.activeElement;
    titleEl.textContent = title;
    bodyEl.innerHTML = '<p class="lab-modal__msg">Caricamento materiali…</p>';
    modal.hidden = false;
    document.documentElement.classList.add('lab-modal-open');
    modal.querySelector('.lab-modal__close').focus();

    listFiles(n).then(function (names) {
      names = names.filter(function (f) { return !isPoster(f) && kind(f); }).sort(naturalSort);
      bodyEl.innerHTML = '';

      if (!names.length) {
        var p = document.createElement('p');
        p.className = 'lab-modal__msg';
        p.textContent = 'Il materiale di questo laboratorio sarà caricato a breve.';
        bodyEl.appendChild(p);
        return;
      }

      var groups = { vid: [], aud: [], img: [] };
      names.forEach(function (f) { groups[kind(f)].push(f); });

      if (groups.vid.length) {
        bodyEl.appendChild(section('Video', groups.vid.map(function (f) {
          var v = document.createElement('video');
          v.controls = true; v.preload = 'metadata'; v.playsInline = true;
          v.src = fileUrl(n, f);
          return v;
        }), 'lab-modal__videos'));
      }
      if (groups.aud.length) {
        bodyEl.appendChild(section('Audio', groups.aud.map(function (f) {
          var w = document.createElement('div');
          w.className = 'lab-modal__audio';
          var l = document.createElement('span');
          l.textContent = f.replace(/\.[^.]+$/, '');
          var a = document.createElement('audio');
          a.controls = true; a.preload = 'none'; a.src = fileUrl(n, f);
          w.appendChild(l); w.appendChild(a);
          return w;
        }), 'lab-modal__audios'));
      }
      if (groups.img.length) {
        bodyEl.appendChild(section('Foto', groups.img.map(function (f) {
          var i = document.createElement('img');
          i.loading = 'lazy'; i.alt = f; i.src = fileUrl(n, f);
          i.addEventListener('click', function () { lightbox(i.src, f); });
          return i;
        }), 'lab-modal__photos'));
      }
    }).catch(function () {
      bodyEl.innerHTML = '<p class="lab-modal__msg">Impossibile caricare i materiali. Riprova tra poco.</p>';
    });
  }

  function section(label, nodes, cls) {
    var s = document.createElement('section');
    var h = document.createElement('h3');
    h.className = 'lab-modal__label';
    h.textContent = label;
    var g = document.createElement('div');
    g.className = cls;
    nodes.forEach(function (n) { g.appendChild(n); });
    s.appendChild(h); s.appendChild(g);
    return s;
  }

  /* ---------- COLLEGAMENTO ALLA PAGINA ---------- */
  function nextHeading(img) {
    var el = img;
    while (el && el !== document.body) {
      var sib = el.nextElementSibling;
      while (sib) {
        if (/^H[1-6]$/.test(sib.tagName)) return sib;
        var inner = sib.querySelector && sib.querySelector('h1,h2,h3,h4,h5,h6');
        if (inner) return inner;
        sib = sib.nextElementSibling;
      }
      el = el.parentElement;
    }
    return null;
  }

  function init() {
    var imgs = document.querySelectorAll(CONFIG.legacyPosterSelector);
    if (!imgs.length) return;
    buildModal();

    Array.prototype.forEach.call(imgs, function (img, n) {
      var h = nextHeading(img);
      if (!h) return;
      var title = h.textContent.trim();
      // Riga del laboratorio: locandina a sinistra (pari) / a destra (dispari)
      var row = img.parentElement;
      row.classList.add('lab-item');
      if (n % 2 === 1) row.classList.add('lab-item--right');
      var legacy = img.getAttribute('src');

      // Locandina nuova (LABn/locandina.*) con ripiego sulla vecchia immagine
      var tries = CONFIG.posterExt.map(function (e) {
        return labFolder(n) + CONFIG.posterName + '.' + e;
      });
      var t = 0;
      img.onerror = function () {
        t++;
        if (t < tries.length) img.src = tries[t];
        else { img.onerror = null; img.src = legacy; }
      };
      img.src = tries[0];

      function open() {
        openLab(n, title);
      }
      h.classList.add('lab-clickable');
      h.setAttribute('role', 'button');
      h.setAttribute('tabindex', '0');
      h.setAttribute('aria-haspopup', 'dialog');
      h.title = 'Apri foto, video e audio del laboratorio';
      h.addEventListener('click', open);
      h.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
      img.classList.add('lab-clickable');
      img.addEventListener('click', open);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();