const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const bgVideos = document.querySelectorAll('.hero-video, .factory-hero-video');
if (bgVideos.length) {
  const tryPlay = () => bgVideos.forEach((v) => v.play().catch(() => {}));
  tryPlay();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay();
  });
  ['pointerdown', 'touchstart', 'scroll', 'keydown'].forEach((evt) => {
    document.addEventListener(evt, tryPlay, { once: true, passive: true });
  });
}

const header = document.getElementById('siteHeader');
if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  mobileNav.querySelectorAll(':scope > a, .mobile-nav-sub a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const mobileFactoriesItem = document.getElementById('mobileFactoriesItem');
const mobileFactoriesToggle = document.getElementById('mobileFactoriesToggle');
if (mobileFactoriesItem && mobileFactoriesToggle) {
  mobileFactoriesToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const open = mobileFactoriesItem.classList.toggle('open');
    mobileFactoriesToggle.setAttribute('aria-expanded', String(open));
  });
}

if ('IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll(
    '.factory-block, .stat-card, .about-copy, .writing-copy, .cert-card'
  );
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

/* ===== Carousel ===== */
const carousel = document.getElementById('carousel');
if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const dotsWrap = carousel.querySelector('.carousel-dots');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', () => {
      slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);
  if (dots[0]) dots[0].classList.add('active');

  const setActiveByScroll = () => {
    const trackRect = track.getBoundingClientRect();
    let closest = 0;
    let closestDist = Infinity;
    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const dist = Math.abs(rect.left - trackRect.left);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === closest));
  };

  let scrollTimeout;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(setActiveByScroll, 100);
    },
    { passive: true }
  );

  const scrollByOne = (dir) => {
    const amount = slides[0].getBoundingClientRect().width + 20;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };
  if (prevBtn) prevBtn.addEventListener('click', () => scrollByOne(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByOne(1));

  /* Lightbox */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('open');
    };
    const closeLightbox = () => lightbox.classList.remove('open');

    slides.forEach((slide) => {
      const img = slide.querySelector('img');
      slide.addEventListener('click', () => openLightbox(img.src, img.alt));
    });
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }
}
