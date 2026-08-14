document.getElementById('year').textContent = new Date().getFullYear();

const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  const tryPlay = () => heroVideo.play().catch(() => {});
  tryPlay();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay();
  });
  ['pointerdown', 'touchstart', 'scroll', 'keydown'].forEach((evt) => {
    document.addEventListener(evt, tryPlay, { once: true, passive: true });
  });
}

const header = document.getElementById('siteHeader');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  mobileNav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    mobileNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.factory-tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    const target = document.getElementById(tile.dataset.target);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

if ('IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.factory-block, .stat-card, .about-copy');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  revealTargets.forEach((el) => io.observe(el));
}
