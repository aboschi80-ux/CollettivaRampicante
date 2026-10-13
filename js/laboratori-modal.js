// Pop up dei laboratori: click sul titolo -> foto, video e audio di images/media/LAB<n>
// (LAB0 = primo laboratorio della pagina, LAB1 = secondo, ...). Usa listaFile() e il lightbox di script.js
(function () {
    const el = (tag, props, parent) => Object.assign(parent.appendChild(document.createElement(tag)), props);

    const modal = document.createElement('div');
    modal.className = 'lab-modal';
    modal.hidden = true;
    modal.innerHTML = '<div class="lab-modal-box"><button class="lab-modal-close" aria-label="Chiudi">&times;</button><h2></h2><div></div></div>';
    document.body.appendChild(modal);
    const titolo = modal.querySelector('h2'), corpo = modal.querySelector('.lab-modal-box > div');

    const chiudi = () => { modal.hidden = true; document.body.style.overflow = ''; };
    modal.addEventListener('click', e => { if (e.target === modal || e.target.className === 'lab-modal-close') chiudi(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.querySelector('.lightbox')) chiudi(); });

    document.querySelectorAll('.lab-event').forEach((evento, n) => {
        const h = evento.querySelector('h3');
        h.classList.add('lab-clickable');
        h.title = 'Apri foto, video e audio';
        h.addEventListener('click', () => {
            const cartella = 'images/media/LAB' + n;
            titolo.textContent = h.textContent.trim();
            corpo.textContent = 'Caricamento…';
            modal.hidden = false;
            document.body.style.overflow = 'hidden';

            listaFile(cartella).then(files => {
                corpo.textContent = '';
                [[EST_MEDIA.vid, 'Video'], [EST_MEDIA.aud, 'Audio'], [EST_MEDIA.img, 'Foto']].forEach(([re, nome]) => {
                    const lista = files.filter(f => re.test(f));
                    if (!lista.length) return;
                    el('h3', { textContent: nome }, corpo);
                    const box = re === EST_MEDIA.img ? el('div', { className: 'gallery-grid' }, corpo) : corpo;
                    lista.forEach(f => {
                        const url = '../' + cartella + '/' + encodeURIComponent(f);
                        if (re === EST_MEDIA.img) el('img', { src: url, alt: f, loading: 'lazy' }, el('div', { className: 'gallery-item' }, box));
                        else if (re === EST_MEDIA.vid) el('video', { src: url, controls: true, preload: 'metadata' }, box);
                        else el('audio', { src: url, controls: true, preload: 'none' }, box);
                    });
                });
                if (!corpo.firstChild) corpo.textContent = 'Il materiale di questo laboratorio sarà caricato a breve.';
                setupGalleryLightbox();
            }).catch(() => { corpo.textContent = 'Impossibile caricare i materiali, riprova tra poco.'; });
        });
    });
})();
