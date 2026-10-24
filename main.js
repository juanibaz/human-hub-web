// Nav: solid after hero, hides on scroll down, mobile toggle.
const nav = document.getElementById('nav');
const toggle = nav.querySelector('.nav__toggle');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('is-solid', y > innerHeight * 0.6);
  nav.classList.toggle('is-hidden', y > lastY && y > innerHeight && !nav.classList.contains('is-open'));
  lastY = y;
}, { passive: true });
const setMenu = (open) => {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
};
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('.nav__menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

// Animations: everything is visible by default; GSAP only animates *from* hidden states,
// so the page still works without JS, without the CDN, or with reduced motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (window.gsap && window.ScrollTrigger && !reduce) {
  gsap.registerPlugin(ScrollTrigger);

  // Hero: split title into masked words.
  const title = document.querySelector('[data-split]');
  title.innerHTML = title.innerHTML.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ');
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero__bg img', { scale: 1.25, duration: 2.4 }, 0)
    .from('.hero__title .w > span', { yPercent: 110, duration: 1.4, stagger: 0.08 }, 0.2)
    .from('.hero__eyebrow, .hero__foot, .nav', { y: 24, opacity: 0, duration: 1.2, stagger: 0.12 }, 0.7);
  gsap.to('.hero__inner', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Generic fade-up reveals.
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.from(els, { y: 48, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }),
  });

  // Image clip reveals.
  gsap.utils.toArray('[data-clip]').forEach((el) => {
    gsap.from(el, { clipPath: 'inset(18% 18% 18% 18% round 20px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // Parallax inside clipped frames.
  gsap.utils.toArray('[data-speed]').forEach((img) => {
    gsap.to(img, { yPercent: parseFloat(img.dataset.speed) * 100, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Counters.
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const to = +el.dataset.count, obj = { v: +(el.dataset.from || 0) };
    gsap.to(obj, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => (el.textContent = Math.round(obj.v)) });
  });

  // Manifesto: words light up as you scroll.
  const text = document.querySelector('[data-words]');
  const words = [];
  text.childNodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    const parts = node.textContent.split(/(\s+)/);
    parts.forEach((p) => {
      if (!p.trim()) return frag.append(p);
      const s = document.createElement(node.nodeType === 1 ? 'strong' : 'span');
      s.textContent = p; words.push(s); frag.append(s);
    });
    node.replaceWith(frag);
  });
  gsap.from(words, { opacity: 0.15, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: true } });

  // Why cards: tilt in.
  gsap.from('.why__card', { y: 80, rotate: (i) => (i % 2 ? 3 : -3), opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.why__grid', start: 'top 85%' } });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1001px)', () => {
    // Stacked service cards: each card recedes as the next one covers it.
    const cards = gsap.utils.toArray('.svc');
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, { scale: 0.94, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true } });
    });
  });
  mm.add('(min-width: 821px)', () => {
    // Pinned horizontal gallery.
    const track = document.querySelector('.gallery__track');
    gsap.to(track, {
      x: () => -(track.scrollWidth - innerWidth),
      ease: 'none',
      scrollTrigger: { trigger: '.gallery', pin: true, scrub: 0.6, start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), invalidateOnRefresh: true },
    });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
}
