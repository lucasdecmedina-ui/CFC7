const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#nav-links');

function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
}

document.documentElement.classList.add('menu-ready');
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-wrap')) setMenu(false);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('will-reveal');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });

  document.querySelectorAll('.reveal').forEach((element) => {
    if (element.getBoundingClientRect().top >= window.innerHeight) {
      element.classList.add('will-reveal');
      observer.observe(element);
    }
  });
}

const gallery = document.querySelector('.gallery');
const photos = [...gallery.querySelectorAll('[data-photo]')];
const galleryControls = document.querySelector('.gallery-controls');
const previous = galleryControls.querySelector('.previous');
const next = galleryControls.querySelector('.next');

function updateGalleryControls() {
  previous.disabled = gallery.scrollLeft < 2;
  next.disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
}

function moveGallery(direction) {
  const step = photos[1].offsetLeft - photos[0].offsetLeft;
  gallery.scrollBy({ left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

galleryControls.hidden = false;
previous.addEventListener('click', () => moveGallery(-1));
next.addEventListener('click', () => moveGallery(1));
gallery.addEventListener('scroll', updateGalleryControls, { passive: true });
window.addEventListener('resize', updateGalleryControls);
updateGalleryControls();

const lightbox = document.querySelector('.lightbox');
if (typeof lightbox.showModal === 'function') {
  const image = lightbox.querySelector('img');
  const caption = lightbox.querySelector('figcaption');
  let current = 0;
  let opener;

  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    image.src = photo.href;
    image.alt = photo.querySelector('img').alt;
    caption.textContent = photo.textContent.trim();
  }

  photos.forEach((photo, index) => photo.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = photo;
    showPhoto(index);
    lightbox.showModal();
  }));
  lightbox.querySelector('.close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.previous').addEventListener('click', () => showPhoto(current - 1));
  lightbox.querySelector('.next').addEventListener('click', () => showPhoto(current + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showPhoto(current - 1);
    if (event.key === 'ArrowRight') showPhoto(current + 1);
  });
  lightbox.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}
