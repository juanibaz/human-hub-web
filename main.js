// Nav: solid after hero, hides on scroll down, mobile toggle.
const nav = document.getElementById('nav');
const toggle = nav.querySelector('.nav__toggle');
const menuLinks = nav.querySelectorAll('.nav__menu a');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('is-solid', y > innerHeight * 0.6);
  nav.classList.toggle('is-hidden', y > lastY && y > innerHeight && !nav.classList.contains('is-open'));
  lastY = y;
}, { passive: true });
const setMenu = (open, returnFocus) => {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) menuLinks[0].focus();
  else if (returnFocus) toggle.focus();
};
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
menuLinks.forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && nav.classList.contains('is-open') && setMenu(false, true));

// Animations: everything is visible by default; GSAP only hides what it is about to reveal,
// so the page still works without JS or without the CDN.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (window.gsap && window.ScrollTrigger && reduce) {
  // Reduced motion: no movement, just a short cross-fade as sections arrive.
  gsap.registerPlugin(ScrollTrigger);
  gsap.set('[data-reveal]', { opacity: 0 });
  const fade = (els) => gsap.to(els, { opacity: 1, duration: 0.4 });
  ScrollTrigger.batch('[data-reveal]', { start: 'top bottom', onEnter: fade, onEnterBack: fade });
} else if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // Hero: split title into masked words.
  const title = document.querySelector('[data-split]');
  title.innerHTML = title.innerHTML.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ');
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero__bg img', { scale: 1.25, duration: 2.4 }, 0)
    .from('.hero__title .w > span', { yPercent: 110, duration: 1.4, stagger: 0.08 }, 0.2)
    .from('.hero__foot', { y: 24, opacity: 0, duration: 1.2 }, 0.7)
    .from('.nav', { opacity: 0, duration: 1.2, clearProps: 'opacity' }, 0.9); // never transform .nav: it breaks its fixed mobile menu
  gsap.to('.hero__inner', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Generic fade-up reveals (hidden up front so they don't flash before entering).
  gsap.set('[data-reveal]', { y: 48, opacity: 0 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top bottom-=40', // as soon as it peeks in, so the screen below the hero is never blank
    // Revealed going down (onEnter) and also going up (onEnterBack): a visitor who lands mid-page
    // (deep link, reload) never "entered" the sections above, and they would stay hidden.
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 }),
    onEnterBack: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }),
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
    el.textContent = obj.v;
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

  mm.add('(min-width: 1001px)', () => {
    // Stacked service cards: each card recedes as the next one covers it.
    const cards = gsap.utils.toArray('.svc');
    // Cards taller than the viewport stick by their bottom edge, so their last lines stay readable.
    // All heights are read before any top is written, so layout is computed once.
    const fitTops = () => {
      const heights = cards.map((c) => c.offsetHeight);
      cards.forEach((c, i) => (c.style.top = Math.min(110 + i * 14, innerHeight - heights[i] - 24) + 'px'));
    };
    fitTops();
    ScrollTrigger.addEventListener('refreshInit', fitTops);
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, { scale: 0.94, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true } });
    });
    return () => { ScrollTrigger.removeEventListener('refreshInit', fitTops); cards.forEach((c) => (c.style.top = '')); };
  });

  addEventListener('load', () => ScrollTrigger.refresh());
}
