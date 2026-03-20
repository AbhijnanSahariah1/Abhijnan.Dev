/* ─────────────────────────────────────────
   LOADER
   Hide the loader overlay once the page
   has fully loaded (images, fonts, etc.)
───────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('out');
  }, 750);
});

/* ─────────────────────────────────────────
   HEADER — add frosted glass on scroll
───────────────────────────────────────── */
const hdr = document.getElementById('hdr');

window.addEventListener('scroll', () => {
  hdr.classList.toggle('sc', window.scrollY > 30);
}, { passive: true });

/* ─────────────────────────────────────────
   SCROLL REVEAL
   Elements with class .rv fade + slide up
   when they enter the viewport
───────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.rv').forEach(el => revealObserver.observe(el));

/* ─────────────────────────────────────────
   MOBILE MENU
   Toggle the full-screen clip-path menu
───────────────────────────────────────── */
const mm   = document.getElementById('mm');
const ht   = document.getElementById('ht');
let menuOpen = false;

function closeMob() {
  menuOpen = false;
  mm.classList.remove('op');
  ht.classList.remove('op');
  document.body.style.overflow = '';
}

ht.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mm.classList.toggle('op', menuOpen);
  ht.classList.toggle('op', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
});
