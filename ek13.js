/* Pre A1 · s.14 (v9b; eskiden s.13) ekleri — Arapça 9 okuyucusunun odak görünümüne takılır (reader.js'teki window.EK kancası).
   ① 28 harf: okunurken harf yanar (kitapta صَوْت 3 çalarken de), harfe dokununca adı çalar, "sen tekrar et" kipi.
   ② dinle-seç: her maddenin kendi dinle düğmesi, seçilen dairenin harfi çalar, صَوْت 4 çalarken çalan madde vurgulanır.
   Cevaplama, kontrol, cevapları göster okuyucunun kendisinde kalır.
   Koordinatlar sayfa resmine göre: resim 3 mm taşma paylı (201×281 mm); .pg-ek katmanı resmin tamamını kaplar.
   Zamanlama: zaman13.js (ses dosyasından silencedetect ile, demo13_kaynak/kes.py). */
(() => {
'use strict';
const EK = window.EK, Z = window.ZAMAN, SEC = window.CEVAP?.['14.2']?.q[0];
if (!EK || !Z || !SEC) return;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const icon = id => `<svg><use href="#${id}"/></svg>`;
const NUM = 14, TW = 201, TH = 281, BL = 3;
const X = mm => (mm + BL) / TW * 100, Y = mm => (mm + BL) / TH * 100;
const PX = p => X(p * 1.95), PY = p => Y(p * 2.75); // kesimli sayfa yüzdesi (cevaplar.js) → resim yüzdesi
const HARF = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');
const AD = ['أَلِف', 'باء', 'تاء', 'ثاء', 'جيم', 'حاء', 'خاء', 'دال', 'ذال', 'راء', 'زاي', 'سين', 'شين', 'صاد', 'ضاد', 'طاء', 'ظاء', 'عَيْن', 'غَيْن', 'فاء', 'قاف', 'كاف', 'لام', 'ميم', 'نون', 'هاء', 'واو', 'ياء'];
const SECENEK = [['ب', 'ت', 'ث'], ['ج', 'ح', 'خ'], ['د', 'ذ', 'ر'], ['س', 'ش', 'ص'], ['ف', 'ق', 'ك'], ['ط', 'ظ', 'ع']]; // cevaplar.js sırası
const AR = ['١', '٢', '٣', '٤', '٥', '٦'];
const RA = EK.audio; // okuyucunun ses çaları (karekodlar)
const box = (l, t, w, h) => `left:${l}%;top:${t}%;width:${w}%;height:${h}%`;

/* ——— katman: sayfa resminin üstünde karolar ve maddeler (kitapta yalnız görünür, odakta dokunulur) ——— */
const MADDE = AR.map((_, g) => {
 const sag = SEC.x[g * 3], sol = SEC.x[g * 3 + 2];
 const cy = PY(sag[1] + sag[3] / 2), dy = 2.7 * 2889 / 4038, cx = PX(sag[0] + sag[2]) + 2.85; // numara dairesi: sağdaki dairenin 2,85 % sağında (ölçüldü)
 const l = PX(sol[0]) - .9, r = cx + 2, t = PY(sag[1]) - .7, b = PY(sag[1] + sag[3]) + .7;
 return {no: [cx - 1.35, cy - dy / 2, 2.7, dy], grup: [l, t, r - l, b - t]};
});
const LAYER = HARF.map((h, i) => {
 const c = i % 7, r = (i / 7) | 0;
 return `<button class="ek-karo" data-h="${i}" style="${box(X(145 - c * 20.1667), Y(49 + r * 22), 18 / TW * 100, 19 / TH * 100)}" aria-label="Harf ${h} (${AD[i]})" tabindex="-1"><span lang="ar">${h}</span></button>`;
}).join('') + MADDE.map((m, g) => `<div class="ek-grup" data-g="${g}" style="${box(...m.grup)}"></div><button class="ek-no" data-m="${g}" style="${box(...m.no)}" aria-label="${g + 1}. maddeyi dinle" tabindex="-1"><span class="ek-hop">${icon('i-audio')}</span></button>`).join('');
function layer(pg) {
 let el = pg.querySelector('.pg-ek');
 if (!el) { el = document.createElement('div'); el.className = 'pg-ek'; el.innerHTML = LAYER; pg.querySelector('.pg-hot').before(el); }
 return el;
}
const pages = () => $$(`.pg[data-num="${NUM}"]`);
const inFocus = () => $(`#focusFrame .pg[data-num="${NUM}"]`);

/* ——— sesler ——— */
const A = new Audio(); A.preload = 'auto'; // alfabe ve tekrar kipi
let harf = null, madde = null, hiz = 1;
const seed = () => { // dosyalar odak ilk açılınca yüklenir, kitabın açılışını yavaşlatmasın
 harf ||= HARF.map((_, i) => Object.assign(new Audio(`assets/media/s13/harf/${String(i + 1).padStart(2, '0')}.mp3`), {preload: 'auto'}));
 madde ||= AR.map((_, g) => Object.assign(new Audio(`assets/media/s13/madde/${g + 1}.mp3`), {preload: 'auto'}));
};
const all = () => [A, ...(harf || []), ...(madde || [])];
const hush = (keep) => { // bizimki çalarken okuyucunun çaları kapanır (tepsinin üstünü örtmesin)
 all().forEach(a => a !== keep && !a.paused && a.pause());
 if (!$('#player').hidden) $('#player [data-act="pl-close"]').click(); else if (!RA.paused) RA.pause();
};
const play = a => { a.playbackRate = hiz; try { a.currentTime = 0; } catch {} a.play().catch(() => {}); };
RA.addEventListener('play', () => { stop(); mStop(); all().forEach(a => a.paused || a.pause()); tick(); }); // karekod çalınca bizimkiler susar

/* tepsi yazısı (odakta): tekrar kipinde sıranın kimde olduğu */
const MSG = 'Harfe dokun, adını dinle. Sırayla dinlerken okunan harf yanar.';
const say = t => { const m = $('#fq .fq-msg'); if (m && F() === 0) m.textContent = t || MSG; };

/* ——— ① harfler: durum her sayfa kopyasına boyanır ——— */
const D = {kip: null, on: false, i: -1, tekrar: false, tok: 0, t: 0};
function paint(n, speak, turn, idle) { // idle: duraklayınca yanan harf söner, okunanların çizgisi kalır
 pages().forEach(pg => layer(pg).querySelectorAll('.ek-karo').forEach((k, j) => {
  k.classList.toggle('okundu', n >= 28 || j < n);
  k.classList.toggle('etkin', j === n && !turn && !idle);
  k.classList.toggle('konus', j === n && !!speak && !idle);
  k.classList.toggle('sira', j === n && !!turn && !idle);
 }));
}
const at = t => { let n = -1; Z.alfabe.forEach((h, j) => { if (t >= h.a - .06) n = j; }); return n; };
// karekoddan (okuyucu) ya da bizim düğmeden alfabe çalarken: o an okunan harf
let raf = 0, seen = -1;
function tick() {
 cancelAnimationFrame(raf);
 const ra = !RA.paused && /\/alfabe\.mp3$/.test(RA.src), ours = D.on && D.kip === 'alfabe', rq = !RA.paused && /\/harf_sec\.mp3$/.test(RA.src);
 if (ra || ours) {
  const src = ra ? RA : A, t = src.currentTime, n = at(t);
  if (n >= 0) { paint(n, t <= Z.alfabe[n].b + .12); seen = n; if (ours) D.i = n; }
  bar(t / Z.alfabeSure);
 }
 if (rq) { let n = -1; Z.madde.forEach((m, k) => { if (RA.currentTime >= m.a - .05) n = k; }); groups(n); }
 if (ra || ours || rq) raf = requestAnimationFrame(tick);
}
RA.addEventListener('ended', () => { if (/\/alfabe\.mp3$/.test(RA.src)) { paint(28); setTimeout(() => D.on || paint(-1), 1600); } groups(-1); });
RA.addEventListener('pause', () => { if (/\/harf_sec\.mp3$/.test(RA.src)) groups(-1); if (/\/alfabe\.mp3$/.test(RA.src) && !RA.ended && seen >= 0) paint(seen, false, false, true); });

function aStart(from) {
 D.kip = 'alfabe'; D.on = true;
 A.onended = done;
 if (!/\/alfabe\.mp3$/.test(A.src)) A.src = 'assets/media/alfabe.mp3';
 A.playbackRate = hiz;
 const go = () => { try { A.currentTime = Math.max(0, from); } catch {} };
 A.readyState >= 1 ? go() : A.addEventListener('loadedmetadata', go, {once: true});
 A.play().catch(() => { D.on = false; tray(); });
 tray(); tick();
}
function rStep(i) { // tekrar kipi: harf okunur → 2 sn sıra öğrencide → sonraki
 const j = ++D.tok;
 if (i >= 28) return done();
 D.i = i; paint(i, true); say(`${i + 1} / 28 · dinle…`); bar(i / 28);
 A.onended = () => {
  if (j !== D.tok || !D.on) return;
  paint(i, false, true); say('Sıra sende! Harfi sen söyle.');
  D.t = setTimeout(() => { if (j === D.tok) { bar((i + 1) / 28); rStep(i + 1); } }, 2000 / hiz);
 };
 A.src = harf[i].src; A.playbackRate = hiz;
 A.play().catch(() => { D.on = false; tray(); });
}
function start() {
 seed(); mStop(); hush(null);
 if (D.i >= 28) { D.i = -1; paint(-1); }
 const i = Math.max(0, D.i);
 if (D.tekrar) { D.kip = 'tekrar'; D.on = true; tray(); rStep(i); }
 else aStart(D.kip === 'alfabe' && D.i >= 0 ? A.currentTime : D.i > 0 ? Z.alfabe[i].a - .05 : 0);
}
function stop() {
 if (!D.on) return;
 D.on = false; D.tok++; clearTimeout(D.t);
 if (!A.paused) A.pause();
 if (D.i >= 0) paint(D.i, false, false, true);
 tray();
}
function done() { D.on = false; D.tok++; clearTimeout(D.t); D.i = 28; paint(28); bar(1); tray(); }
function again() { stop(); D.kip = null; D.i = -1; paint(-1); bar(0); start(); }

/* odaktaki tepsi (okuyucunun .fq düzeni) */
let api = null, region = -1;
const F = () => (inFocus() ? region : -1);
function tray() {
 const el = $('#fq'); if (F() !== 0) return;
 const label = D.on ? 'Duraklat' : D.i > 0 && D.i < 28 ? 'Devam' : 'Sırayla dinle';
 el.hidden = false;
 el.innerHTML = `<div class="fq-row"><span class="fq-msg">${MSG}</span>
 <button class="fq-btn pri" data-ek="dinle">${icon(D.on ? 'i-pause' : 'i-play')}${label}</button><button class="fq-btn${D.tekrar ? ' pri2' : ''}" data-ek="tekrar" aria-pressed="${D.tekrar}">${icon('i-loop')}Sen tekrar et</button><button class="fq-btn" data-ek="bastan">${icon('i-undo')}Baştan</button><button class="fq-btn" data-ek="hiz" aria-label="Hız">${hiz === 1 ? '1×' : '0,75×'}</button></div><div class="ek-bar"><i></i></div>`;
 bar(D.i >= 28 ? 1 : D.i > 0 ? D.i / 28 : 0);
 api?.fit();
}
function bar(p) { const i = $('#fq .ek-bar i'); if (i) i.style.width = Math.max(0, Math.min(1, p)) * 100 + '%'; }
$('#fq').addEventListener('click', e => {
 const a = e.target.closest('[data-ek]')?.dataset.ek; if (!a) return;
 if (a === 'dinle') D.on ? stop() : start();
 else if (a === 'bastan') again();
 else if (a === 'tekrar') { D.tekrar = !D.tekrar; if (D.on) { stop(); start(); } else tray(); }
 else if (a === 'hiz') { hiz = hiz === 1 ? .75 : 1; A.playbackRate = hiz; tray(); }
});

/* ——— ② maddeler ——— */
let mOn = -1;
function groups(n) { pages().forEach(pg => layer(pg).querySelectorAll('.ek-grup').forEach((g, k) => g.classList.toggle('caliyor', k === n || k === mOn))); }
function mStop() {
 if (mOn < 0) return;
 madde?.[mOn].pause(); mOn = -1;
 groups(-1); $$('.ek-no.caliyor').forEach(b => b.classList.remove('caliyor'));
}
function mPlay(g) {
 seed(); stop();
 const same = mOn === g; mStop(); hush(null);
 if (same) return;
 mOn = g; groups(-1); $$(`.ek-no[data-m="${g}"]`).forEach(b => b.classList.add('caliyor'));
 madde[g].onended = () => { if (mOn === g) mStop(); };
 play(madde[g]);
}

/* ——— dokunuşlar (odakta) ——— */
$('#focusFrame').addEventListener('click', e => {
 if (!inFocus()) return;
 const k = e.target.closest('.ek-karo'), n = e.target.closest('.ek-no'), q = e.target.closest('.qz-p[data-k="14.2"]');
 if (k) {
  const i = +k.dataset.h; seed(); stop(); mStop(); hush(harf[i]); play(harf[i]);
  k.classList.remove('dokun'); void k.offsetWidth; k.classList.add('dokun'); setTimeout(() => k.classList.remove('dokun'), 520);
 } else if (n) mPlay(+n.dataset.m);
 else if (q) { // okuyucu seçimi işledi (önce o dinler); seçildiyse dairenin harfi çalar
  const j = +q.dataset.i, g = SEC.g[j];
  if (!$(`#focusFrame .qz-p[data-k="14.2"][data-i="${j}"].on`) || mOn >= 0 || D.on) return;
  const h = HARF.indexOf(SECENEK[g][j - g * 3]); seed(); hush(harf[h]); setTimeout(() => play(harf[h]), 120);
 }
});
$('#focusFrame').addEventListener('pointerdown', e => { if (e.target.closest('.ek-karo,.ek-no')) e.stopPropagation(); }); // kalem izi bırakmasın
document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); mStop(); } });

/* ——— okuyucu kancası ——— */
EK[NUM] = {
 ac(i, a) {
  api = a; region = i; seed();
  const pg = inFocus(); if (pg) layer(pg);
  if (i === 0) { a.tool('answer'); tray(); if (D.i >= 0) paint(D.i); }
  if (D.on || !RA.paused) tick();
 },
 kapa() { stop(); mStop(); region = -1; }
};
})();
