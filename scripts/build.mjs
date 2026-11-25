// Génère toutes les images SVG du profil GitHub (bannière, terminal, cartes, parcours 42, stack).
// Lancer depuis la racine du dépôt :  node scripts/build.mjs
// Les SVG utilisent seulement des polices système : GitHub les affiche dans une balise <img>,
// qui ne charge aucune police externe.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const OUT = 'assets';
mkdirSync(OUT, { recursive: true });

// ---- Palette (pas de violet) ----
const C = {
  canvas: '#12141a', surface: '#1a1d25', line: '#2a2f3a',
  ink: '#f3f4f6', muted: '#9aa3b2', dim: '#5d6573',
  coral: '#ff5f45', amber: '#ffb21e', teal: '#14c8a8', sky: '#3d9bff',
};
const SANS = `'Segoe UI', -apple-system, 'Helvetica Neue', Ubuntu, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r = (n) => Math.round(n * 100) / 100;
const MW = 0.6; // largeur d'un caractère mono, imposée par textLength

// Texte mono à largeur exacte (même rendu sous Windows, macOS, Linux)
function mono(x, y, str, size, fill, extra = '') {
  const w = r(str.length * size * MW);
  return `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${fill}" textLength="${w}" lengthAdjust="spacingAndGlyphs" xml:space="preserve" ${extra}>${esc(str)}</text>`;
}

// Animation discrète d'une largeur de 0 à n caractères (frappe), maintien, puis effacement.
// windows: [{start, type, hold, erase}] en secondes sur une boucle de `dur`.
function typingValues(n, cw, win, dur) {
  const kt = [0], vals = [0];
  const push = (t, v) => { kt.push(r(Math.min(t / dur, 1))); vals.push(r(v)); };
  const { start, type, hold, erase } = win;
  for (let i = 1; i <= n; i++) push(start + (type * i) / n, i * cw);
  if (erase) {
    const e0 = start + type + hold;
    const steps = Math.min(n, 12);
    for (let i = 1; i <= steps; i++) push(e0 + (erase * i) / steps, (n - Math.round((n * i) / steps)) * cw);
  }
  if (kt[kt.length - 1] < 1) { kt.push(1); vals.push(vals[vals.length - 1]); }
  // keyTimes strictement croissants
  for (let i = 1; i < kt.length; i++) if (kt[i] <= kt[i - 1]) kt[i] = r(kt[i - 1] + 0.0001);
  kt[kt.length - 1] = 1;
  return { keyTimes: kt.join(';'), values: vals.join(';') };
}

// =============== BANNIÈRE ===============
function banner() {
  const W = 1200, H = 320, dur = 13.5;
  const phrases = [
    'Game Master who codes his own tools',
    '42 Lyon student · C and C++',
    'now building ft_transcendence with my team',
  ];
  const size = 22, cw = size * MW, x0 = 72, y0 = 240;
  let typed = '', clips = '';
  phrases.forEach((p, i) => {
    const v = typingValues(p.length, cw, { start: i * 4.5 + 0.2, type: 1.6, hold: 2, erase: 0.5 }, dur);
    clips += `<clipPath id="tp${i}"><rect x="${x0}" y="${y0 - 26}" height="36" width="0"><animate attributeName="width" dur="${dur}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${v.keyTimes}" values="${v.values}"/></rect></clipPath>`;
    typed += `<g clip-path="url(#tp${i})">${mono(x0, y0, p, size, C.ink)}</g>`;
    typed += `<rect y="${y0 - 19}" width="11" height="24" fill="${C.amber}" x="${x0}"><animate attributeName="x" dur="${dur}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${v.keyTimes}" values="${v.values.split(';').map((w) => r(x0 + +w + 3)).join(';')}"/>`
      + `<animate attributeName="opacity" dur="${dur}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${r((i * 4.5) / dur) || 0.0001};${r(((i + 1) * 4.5) / dur)};1" values="0;1;0;0"/></rect>`;
  });
  const blob = (cx, cy, rad, col, path, d) =>
    `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${col}" opacity=".75"><animateTransform attributeName="transform" type="translate" dur="${d}s" repeatCount="indefinite" values="${path}" calcMode="spline" keySplines="${Array(path.split(';').length - 1).fill('.45 0 .55 1').join(';')}"/></circle>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Nave20: Game Master, 42 Lyon student">
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#ffffff" opacity=".07"/></pattern>
  <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${C.canvas}" stop-opacity="1"/><stop offset=".45" stop-color="${C.canvas}" stop-opacity=".85"/><stop offset="1" stop-color="${C.canvas}" stop-opacity="0"/></linearGradient>
  <linearGradient id="name" x1="0" x2="1"><stop offset="0" stop-color="${C.coral}"/><stop offset=".5" stop-color="${C.amber}"/><stop offset="1" stop-color="${C.teal}"/></linearGradient>
  ${clips}
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${C.canvas}"/>
  <g filter="url(#soft)">
    ${blob(780, 140, 160, C.coral, '0 0;-60 40;30 70;0 0', 16)}
    ${blob(1040, 230, 140, C.amber, '0 0;50 -50;-40 -20;0 0', 19)}
    ${blob(960, 300, 130, C.teal, '0 0;-70 -30;20 -60;0 0', 22)}
    ${blob(1130, 70, 110, C.sky, '0 0;-40 50;-80 10;0 0', 17)}
  </g>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W * 0.75}" height="${H}" fill="url(#fade)"/>
  ${mono(x0, 80, '~/42lyon $ whoami', 18, C.muted)}
  <text x="${x0 - 4}" y="190" font-family="${SANS}" font-size="112" font-weight="800" letter-spacing="-4" fill="url(#name)">Nave20</text>
  ${mono(x0, y0, '>', size, C.teal, `transform="translate(-26 0)"`)}
  ${typed}
  ${mono(x0, 288, '28 is the new 42', 15, C.dim)}
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${C.line}"/>
</g>
</svg>`;
}

// =============== TERMINAL ===============
function terminal() {
  const W = 1200, size = 17, cw = size * MW, lh = 30, x0 = 40, top = 92, dur = 16;
  // [type, texte, couleur]  type: cmd = tapé, out = apparaît d'un coup
  const L = [
    ['cmd', 'whoami'],
    ['out', [['Nave20', C.ink], [' · student at 42 Lyon · Game Master · tool builder', C.muted]]],
    ['cmd', 'cat now.md'],
    ['out', [['▸ ', C.amber], ['ft_transcendence', C.ink], ['   web app with a team of five, in progress', C.muted]]],
    ['out', [['▸ ', C.coral], ['campaign-console', C.ink], ['   my GM desk for a Mage: the Ascension table', C.muted]]],
    ['out', [['▸ ', C.teal], ['exam rank 06', C.ink], ['       mini_serv, sockets and select()', C.muted]]],
    ['cmd', 'echo $MOTTO'],
    ['out', [['28 is the new 42', C.amber]]],
  ];
  const H = top + L.length * lh + 50;
  let t = 0.4, body = '', defs = '';
  const appear = (at) => `<animate attributeName="opacity" dur="${dur}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${r(at / dur)};${r((dur - 0.6) / dur)};1" values="0;1;0;0"/>`;
  L.forEach((l, i) => {
    const y = top + i * lh;
    if (l[0] === 'cmd') {
      const s = l[1], typeT = s.length * 0.07;
      const v = typingValues(s.length, cw, { start: t + 0.25, type: typeT, hold: dur, erase: 0 }, dur);
      // la ligne s'efface en fin de boucle : on cache tout le groupe
      defs += `<clipPath id="c${i}"><rect x="${x0 + 30}" y="${y - 20}" height="28" width="0"><animate attributeName="width" dur="${dur}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${v.keyTimes}" values="${v.values}"/></rect></clipPath>`;
      body += `<g opacity="0">${appear(t)}${mono(x0, y, '$', size, C.teal)}<g clip-path="url(#c${i})">${mono(x0 + 30, y, s, size, C.ink)}</g></g>`;
      t += 0.25 + typeT + 0.35;
    } else {
      let x = x0, parts = '';
      for (const [s, col] of l[1]) { parts += mono(r(x), y, s, size, col); x += s.length * cw; }
      body += `<g opacity="0">${appear(t)}${parts}</g>`;
      t += 0.18;
      if (L[i + 1] && L[i + 1][0] === 'cmd') t += 0.5;
    }
  });
  // curseur final
  const yEnd = top + L.length * lh;
  body += `<g opacity="0">${appear(t)}${mono(x0, yEnd, '$', size, C.teal)}<rect x="${x0 + 30}" y="${yEnd - 16}" width="10" height="20" fill="${C.amber}"><animate attributeName="opacity" values="1;0;1" keyTimes="0;.5;1" calcMode="discrete" dur="1s" repeatCount="indefinite"/></rect></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Terminal: whoami, current projects, motto">
<defs>${defs}</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.canvas}" stroke="${C.line}"/>
<path d="M14.5 .5h${W - 29}a14 14 0 0 1 14 14v31.5h-${W - 1}v-31.5a14 14 0 0 1 14-14z" fill="${C.surface}"/>
<line x1="1" x2="${W - 1}" y1="46" y2="46" stroke="${C.line}"/>
<circle cx="30" cy="23" r="6.5" fill="${C.coral}"/><circle cx="52" cy="23" r="6.5" fill="${C.amber}"/><circle cx="74" cy="23" r="6.5" fill="${C.teal}"/>
${mono(W / 2 - 9 * 14 * MW, 28, 'nave20@42lyon: ~', 14, C.muted)}
${body}
</svg>`;
}

// =============== CARTES DE PROJETS ===============
const LANG = { TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5', 'C++': '#f34b7d', C: '#555555' };
function wrap(text, max) {
  const out = []; let line = '';
  for (const w of text.split(' ')) { if ((line + ' ' + w).trim().length > max) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }
  if (line) out.push(line); return out;
}
function card({ file, name, desc, langs, tag, accent }) {
  const W = 590, H = 190;
  const lines = wrap(desc, 58).slice(0, 2);
  let x = 28, foot = '';
  for (const l of langs) {
    foot += `<circle cx="${x + 6}" cy="${H - 31}" r="6" fill="${LANG[l] || C.muted}"/><text x="${x + 18}" y="${H - 26}" font-family="${SANS}" font-size="14" fill="${C.muted}">${esc(l)}</text>`;
    x += 30 + l.length * 8.2;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(name)}: ${esc(desc)}">
<defs>
  <radialGradient id="g" cx="1" cy="0" r="1"><stop offset="0" stop-color="${accent}" stop-opacity=".38"/><stop offset=".6" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  <clipPath id="k"><rect width="${W}" height="${H}" rx="14"/></clipPath>
</defs>
<g clip-path="url(#k)">
  <rect width="${W}" height="${H}" fill="${C.surface}"/>
  <rect width="${W}" height="${H}" fill="url(#g)"><animate attributeName="opacity" values=".7;1;.7" dur="6s" repeatCount="indefinite"/></rect>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>
${tag ? `<rect x="28" y="24" rx="11" height="22" width="${tag.length * 7.4 + 22}" fill="${accent}" fill-opacity=".16"/><text x="39" y="39.5" font-family="${MONO}" font-size="12" fill="${accent}">${esc(tag)}</text>` : ''}
<text x="28" y="${tag ? 82 : 58}" font-family="${SANS}" font-size="25" font-weight="700" letter-spacing="-.5" fill="${C.ink}">${esc(name)}</text>
${lines.map((l, i) => `<text x="28" y="${(tag ? 110 : 88) + i * 21}" font-family="${SANS}" font-size="15" fill="${C.muted}">${esc(l)}</text>`).join('')}
${foot}
<text x="${W - 30}" y="${H - 25}" text-anchor="end" font-family="${SANS}" font-size="20" fill="${accent}">→</text>
</svg>`;
  writeFileSync(`${OUT}/${file}`, svg);
}

// =============== PARCOURS 42 ===============
function path42() {
  const W = 1200, H = 206;
  const steps = [
    { c: 'Circle 0', p: ['libft'] },
    { c: 'Circle 1', p: ['ft_printf', 'get_next_line'] },
    { c: 'Circle 2', p: ['push_swap', 'pipex', 'so_long'] },
    { c: 'Circle 3', p: ['philosophers', 'minishell'] },
    { c: 'Circle 4', p: ['cub3d', 'NetPractice', 'CPP 00–04'] },
    { c: 'Circle 5', p: ['CPP 05–09', 'Inception'] },
    { c: 'Circle 6', p: ['ft_transcendence'], now: true },
  ];
  const x0 = 96, x1 = W - 110, y = 82, gap = (x1 - x0) / (steps.length - 1);
  const xNow = x1;
  let nodes = '';
  steps.forEach((s, i) => {
    const x = r(x0 + i * gap);
    const col = s.now ? C.amber : C.teal;
    if (s.now) {
      nodes += `<circle cx="${x}" cy="${y}" r="14" fill="none" stroke="${C.amber}" stroke-width="2"><animate attributeName="r" values="12;24" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="2s" repeatCount="indefinite"/></circle>`;
    }
    nodes += `<circle cx="${x}" cy="${y}" r="12" fill="${s.now ? C.canvas : col}" stroke="${col}" stroke-width="3"/>`;
    if (!s.now) nodes += `<path d="M${x - 5} ${y}l3.5 3.5 6.5-7" fill="none" stroke="${C.canvas}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    nodes += `<text x="${x}" y="${y - 30}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${s.now ? C.amber : C.muted}">${s.c}</text>`;
    s.p.forEach((p, j) => {
      nodes += `<text x="${x}" y="${y + 42 + j * 22}" text-anchor="middle" font-family="${SANS}" font-size="15" font-weight="${s.now ? 700 : 500}" fill="${s.now ? C.ink : '#c9ced8'}">${esc(p)}</text>`;
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="42 common core: circles 0 to 5 done, ft_transcendence in progress">
<defs><linearGradient id="tr" x1="0" x2="1"><stop offset="0" stop-color="${C.teal}"/><stop offset=".85" stop-color="${C.teal}"/><stop offset="1" stop-color="${C.amber}"/></linearGradient></defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="${C.canvas}" stroke="${C.line}"/>
<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="${C.line}" stroke-width="4" stroke-linecap="round"/>
<line x1="${x0}" x2="${xNow}" y1="${y}" y2="${y}" stroke="url(#tr)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${xNow - x0}" stroke-dashoffset="${xNow - x0}"><animate attributeName="stroke-dashoffset" values="${xNow - x0};0;0" keyTimes="0;.35;1" dur="7s" repeatCount="indefinite"/></line>
${nodes}
</svg>`;
}

// =============== STACK (vraies icônes sur tuiles claires) ===============
function stack() {
  const items = [
    ['c', 'C'], ['c-plusplus', 'C++'],
  ];
  const tile = 76, gap = 40, H = 130;
  const total = items.length * tile + (items.length - 1) * gap;
  const W = total + 8;
  let x = 4, out = '';
  for (const [f, label] of items) {
    const raw = readFileSync(`${OUT}/icons/${f}.svg`, 'utf8');
    const data = Buffer.from(raw).toString('base64');
    out += `<rect x="${r(x)}" y="8" width="${tile}" height="${tile}" rx="18" fill="#f3f4f6"/>`
      + `<image x="${r(x + 18)}" y="26" width="${tile - 36}" height="${tile - 36}" href="data:image/svg+xml;base64,${data}" preserveAspectRatio="xMidYMid meet"/>`
      + `<text x="${r(x + tile / 2)}" y="114" text-anchor="middle" font-family="${SANS}" font-size="14" fill="${C.muted}">${esc(label)}</text>`;
    x += tile + gap;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack: ${items.map((i) => i[1]).join(', ')}">${out}</svg>`;
}

writeFileSync(`${OUT}/banner.svg`, banner());
writeFileSync(`${OUT}/terminal.svg`, terminal());
writeFileSync(`${OUT}/path-42.svg`, path42());
writeFileSync(`${OUT}/stack.svg`, stack());
card({ file: 'card-campaign-console.svg', name: 'Campaign Console', tag: 'main project', accent: C.coral, langs: ['TypeScript', 'Python'],
  desc: 'The GM desk for my World of Darkness campaign: a Python control-room server and a Tauri desktop app.' });
card({ file: 'card-control-room.svg', name: 'Paris Control Room', tag: 'Foundry VTT V14', accent: C.sky, langs: ['JavaScript'],
  desc: 'A holographic 3D map of Paris built from IGN open data, with live units synced to the table.' });
card({ file: 'card-wod-homebrew.svg', name: 'WoD Homebrew', tag: 'Foundry VTT V14', accent: C.teal, langs: ['JavaScript'],
  desc: 'A home-made game system for Foundry: Mortal, Vampire, Ghoul, Garou and Mage sheets and rolls.' });
card({ file: 'card-foundry-skill.svg', name: 'Foundry V14 Skill', tag: 'Claude skill', accent: C.amber, langs: ['JavaScript'],
  desc: 'Teaches Claude to build Foundry VTT V14 game systems, checked against build 14.369.' });
console.log('SVG écrits dans', OUT);
