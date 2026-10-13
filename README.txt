COLLETTIVA RAMPICANTE - Sito del progetto europeo TALEE
Sito statico pubblicato con GitHub Pages: https://aboschi80-ux.github.io/CollettivaRampicante/

CARTELLE
index.html        Home page del sito
pages/            Le altre pagine: chi-siamo, laboratori, galleria, mappa
css/              Stile del sito (style.css = stile generale, laboratori-modal.css = pop up dei laboratori)
js/               script.js = menu, lightbox e caricamento automatico delle foto; laboratori-modal.js = pop up dei laboratori
images/home/      Immagini della home (logo, pianta, SALUS Space...)
images/team/      Foto del team (pagina Chi siamo)
images/laboratori/  Locandine dei laboratori (locandina_LAB0.jpg, locandina_LAB1.jpg, ...)
images/galleria/LAB0, LAB1, ...  Foto e video della pagina Galleria, una cartella per laboratorio
images/media/LAB0, LAB1, ...     Foto, video e audio del pop up (clic sul titolo in pagina Laboratori)
mappa/            Mappa interattiva TALEE (index.html + contributi.geojson)

COME AGGIUNGERE FOTO / VIDEO / AUDIO
Basta copiare i file nella cartella del laboratorio giusto (LAB0 = primo laboratorio, LAB1 = secondo, ...)
e fare il push: galleria.html e laboratori.html NON vanno modificati.
Formati: foto jpg/jpeg/png/webp/gif, video mp4/webm/mov, audio mp3/wav/ogg/m4a.
Dopo il push attendere circa 1-2 minuti che GitHub Pages pubblichi i nuovi file.

Comandi per pushare il nuovo sito su GitHub

1) git add .

2) git commit -m "descrizione"

3) git push origin main
