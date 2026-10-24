// Everything on the page is visible without this file; it adds the live finder, the contact
// message, the clock and the motion layer.
document.documentElement.classList.add('js');

// The live thing: pick the ámbito where the challenge is, see the services that address it.
const tabs = [...document.querySelectorAll('.tab')];
const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
const select = (i, focus) => {
  tabs.forEach((t, j) => {
    const on = i === j;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    panels[j].hidden = !on;
  });
  panels[i].classList.add('is-in');
  if (focus) tabs[i].focus();
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(i));
  t.addEventListener('keydown', (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (step) { e.preventDefault(); select((i + step + tabs.length) % tabs.length, true); }
    if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
  });
});
if (tabs.length) select(0);

// Contact: no form backend, so the bar writes the message, copies it and opens an Instagram DM.
const bar = document.getElementById('bar');
const note = document.getElementById('bar-msg');
bar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('f-name').value.trim();
  const org = document.getElementById('f-org').value.trim();
  const topic = document.querySelector('.tab[aria-selected="true"]')?.firstChild.textContent.trim().toLowerCase();
  const msg = `Hola Human Hub${name ? `, soy ${name}` : ''}${org ? ` de ${org}` : ''}. Me gustaría conversar${topic ? ` sobre ${topic}` : ''}.`;
  let copied = false;
  try { await navigator.clipboard.writeText(msg); copied = true; } catch {}
  note.textContent = copied ? 'Mensaje copiado: pégalo en el chat de Instagram.' : `Copia este mensaje: «${msg}»`;
  window.open('https://ig.me/m/humanhubconsultores', '_blank', 'noopener');
});

// Footer: the time in Chile, live.
const clock = document.getElementById('clock');
const fmt = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit' });
const tick = () => { clock.textContent = fmt.format(new Date()); clock.dateTime = clock.textContent; };
tick();
setInterval(tick, 20000);

// Photo strip: duplicated once so the drift loops without a seam; paused while off screen.
const strip = document.querySelector('.strip-row');
const track = strip.querySelector('.strip-row__track');
track.append(...[...track.children].map((n) => n.cloneNode(true)));
new IntersectionObserver(([en]) => strip.classList.toggle('is-paused', !en.isIntersecting)).observe(strip);

// Entrances: each section's parts arrive in reading order, once.
const seen = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    seen.unobserve(en.target);
  });
}, { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('section').forEach((s) => {
  s.querySelectorAll('[data-in]').forEach((el, i) => el.style.setProperty('--d', `${i * 80}ms`));
});
document.querySelectorAll('.bands').forEach((p) => p.querySelectorAll('.band').forEach((b, i) => b.style.setProperty('--d', `${i * 70}ms`)));
document.querySelectorAll('.spines li').forEach((li, i) => li.style.setProperty('--d', `${i * 25}ms`));
document.querySelectorAll('[data-in], .shutter, .row, .spines, .bands').forEach((el) => seen.observe(el));

