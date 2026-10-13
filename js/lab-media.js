/* ==========================================================
   lab-media.js  -  scopre in automatico i file nelle cartelle
   images/galleria/LABn e images/laboratori/LABn
   usando UNA sola chiamata alla GitHub API (git trees).
   Basta caricare i file nella cartella e fare push: niente
   da modificare in galleria.html / laboratori.html.
   ========================================================== */
window.LabMedia = (function () {
  const REPO = 'aboschi80-ux/CollettivaRampicante';
  const BRANCH = 'main';
  const CACHE_KEY = 'cr-tree-v1';
  const CACHE_MS = 5 * 60 * 1000; // 5 minuti

  const IMG = /\.(jpe?g|png|webp|gif|avif)$/i;
  const VID = /\.(mp4|webm|mov|m4v|ogv)$/i;
  const AUD = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

  function kind(name) {
    if (IMG.test(name)) return 'image';
    if (VID.test(name)) return 'video';
    if (AUD.test(name)) return 'audio';
    return null;
  }

  async function getTree() {
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (c && Date.now() - c.t < CACHE_MS) return c.paths;
    } catch (e) {}
    const url = 'https://api.github.com/repos/' + REPO + '/git/trees/' + BRANCH + '?recursive=1';
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('GitHub API ' + res.status);
    const data = await res.json();
    const paths = data.tree
      .filter(function (n) { return n.type === 'blob' && n.path.indexOf('images/') === 0; })
      .map(function (n) { return n.path; });
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), paths: paths })); } catch (e) {}
    return paths;
  }

  const natural = function (a, b) {
    return a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' });
  };

  /* Ritorna { LAB0: [{src,name,type}], LAB1: [...] } per le cartelle base indicate.
     Se lo stesso LAB esiste in piu' cartelle base, i file vengono uniti. */
  async function load(bases) {
    const paths = await getTree();
    const out = {};
    const escaped = bases.map(function (b) { return b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    const re = new RegExp('^(?:' + escaped.join('|') + ')/(LAB[^/]*)/([^/]+)$', 'i');
    paths.forEach(function (p) {
      const m = p.match(re);
      if (!m) return;
      const type = kind(m[2]);
      if (!type) return;
      const lab = m[1].toUpperCase();
      (out[lab] = out[lab] || []).push({ src: p, name: m[2], type: type });
    });
    Object.keys(out).forEach(function (k) {
      out[k].sort(function (a, b) { return natural(a.name, b.name); });
    });
    return out;
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* Crea il nodo giusto (img / video / audio). root = '../' dalle pagine in pages/ */
  function mediaNode(it, root, alt) {
    const src = root + it.src;
    if (it.type === 'image') {
      const i = el('img');
      i.src = src; i.alt = alt || it.name; i.loading = 'lazy';
      return i;
    }
    if (it.type === 'video') {
      const v = el('video');
      v.src = src; v.controls = true; v.preload = 'metadata'; v.playsInline = true;
      return v;
    }
    const a = el('audio');
    a.src = src; a.controls = true; a.preload = 'none';
    return a;
  }

  return { load: load, kind: kind, mediaNode: mediaNode, el: el };
})();
