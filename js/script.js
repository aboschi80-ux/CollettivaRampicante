// ===== Scroll to Top Button =====
window.addEventListener('scroll', function() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }
});

const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== Toggle Menu Mobile =====
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu on hamburger click
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(10px, 10px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // Highlight current page in navigation
    highlightCurrentPage();

    // Smooth scroll on link clicks
    setupSmoothScroll();
});

// ===== Highlight Current Page =====
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkPage = href.split('/').pop();
        
        link.classList.remove('active');
        
        if (linkPage === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ===== Smooth Scroll =====
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ===== Image Lazy Loading (optional) =====
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== Gallery Lightbox con frecce (naviga nella stessa sezione) =====
function setupGalleryLightbox() {
    const grids = document.querySelectorAll('.gallery-grid');

    grids.forEach(grid => {
        const items = Array.from(grid.querySelectorAll('.gallery-item'));
        items.forEach((item, idx) => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => openLightbox(grid, idx));
        });
    });
}

function openLightbox(grid, startIndex) {
    // Solo le immagini realmente caricate (salta eventuali placeholder rotti)
    const imgs = Array.from(grid.querySelectorAll('.gallery-item img'))
        .filter(img => !(img.complete && img.naturalWidth === 0));
    if (!imgs.length) return;

    const clicked = grid.querySelectorAll('.gallery-item img')[startIndex];
    let current = Math.max(0, imgs.indexOf(clicked));

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-btn lightbox-close" aria-label="Chiudi">&times;</button>
        <button class="lightbox-btn lightbox-prev" aria-label="Foto precedente">&#10094;</button>
        <img class="lightbox-img" alt="">
        <button class="lightbox-btn lightbox-next" aria-label="Foto successiva">&#10095;</button>
        <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    const imgEl = lightbox.querySelector('.lightbox-img');
    const counter = lightbox.querySelector('.lightbox-counter');
    const multi = imgs.length > 1;

    function show(i) {
        current = (i + imgs.length) % imgs.length;   // giro continuo
        imgEl.src = imgs[current].src;
        imgEl.alt = imgs[current].alt;
        counter.textContent = (current + 1) + ' / ' + imgs.length;
    }
    function close() {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
        lightbox.remove();
    }
    function onKey(e) {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight' && multi) show(current + 1);
        else if (e.key === 'ArrowLeft' && multi) show(current - 1);
    }

    lightbox.querySelector('.lightbox-prev').addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
    lightbox.querySelector('.lightbox-close').addEventListener('click', e => { e.stopPropagation(); close(); });
    imgEl.addEventListener('click', e => e.stopPropagation());
    lightbox.addEventListener('click', close);          // click sullo sfondo = chiudi
    document.addEventListener('keydown', onKey);

    // Swipe su mobile
    let touchX = null;
    lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        if (touchX === null || !multi) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) show(dx < 0 ? current + 1 : current - 1);
        touchX = null;
    });

    if (!multi) {
        lightbox.querySelector('.lightbox-prev').style.display = 'none';
        lightbox.querySelector('.lightbox-next').style.display = 'none';
    }
    show(current);
}

// Call gallery setup if we're on the gallery page
if (document.querySelector('.gallery-grid')) {
    document.addEventListener('DOMContentLoaded', setupGalleryLightbox);
}

console.log('Script caricato correttamente');
