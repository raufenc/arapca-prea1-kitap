/* Arapça Pre A1 · s.13 etkileşimli örnek
   Koordinatlar: tasarim8.jsx → p13 (mm, kesimli sayfa 195×275) ve cevaplar.js "13.2" (yüzde, kesimli sayfa).
   Sayfa resmi 3 mm taşma paylı (201×281 mm) → yüzdeye çevrilirken +3 mm kaydırılır. */
(function () {
  'use strict';
  var TW = 201, TH = 281, B = 3;                       // resim: taşma paylı sayfa (mm)
  var X = function (mm) { return (mm + B) / TW * 100; };
  var Y = function (mm) { return (mm + B) / TH * 100; };
  var PX = function (p) { return X(p * 1.95); };        // kesimli yüzde → resim yüzdesi
  var PY = function (p) { return Y(p * 2.75); };

  var HARF = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');
  var AD = ['أَلِف','باء','تاء','ثاء','جيم','حاء','خاء','دال','ذال','راء','زاي','سين','شين','صاد','ضاد','طاء','ظاء','عَيْن','غَيْن','فاء','قاف','كاف','لام','ميم','نون','هاء','واو','ياء'];
  var SECENEK = [['ب','ت','ث'],['ج','ح','خ'],['د','ذ','ر'],['س','ش','ص'],['ف','ق','ك'],['ط','ظ','ع']]; // sağdan sola (cevaplar.js sırası)
  var AR = ['١','٢','٣','٤','٥','٦'];
  var Z = window.ZAMAN, S = window.S13;
  var IK_SES = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';

  var $ = function (id) { return document.getElementById(id); };
  var sayfa = $('sayfa'), katman = $('katman');
  var hata = function (e) { if (e && e.name !== 'AbortError' && e.name !== 'NotAllowedError') console.warn(e); };

  function dugme(cls, l, t, w, h, aria, html) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls;
    b.style.left = l + '%'; b.style.top = t + '%'; b.style.width = w + '%'; b.style.height = h + '%';
    b.setAttribute('aria-label', aria);
    if (html) b.innerHTML = html;
    katman.appendChild(b); return b;
  }

  /* ——— sesler ——— */
  var A = new Audio(); A.preload = 'auto';             // dizi sesleri (alfabe, tekrar kipi, صَوْت 4)
  var harfSes = HARF.map(function (_, i) { var a = new Audio('assets/media/harf/' + ('0' + (i + 1)).slice(-2) + '.mp3'); a.preload = 'auto'; return a; });
  var maddeSes = AR.map(function (_, k) { var a = new Audio('assets/media/madde/' + (k + 1) + '.mp3'); a.preload = 'auto'; return a; });
  var hiz = 1;
  var ctx = null;
  function ctxAc() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(hata);
  }
  document.addEventListener('pointerdown', ctxAc, { passive: true });
  document.addEventListener('keydown', ctxAc);
  function ton(f, t0, d, tip, g) {
    if (!ctx) return;
    var o = ctx.createOscillator(), v = ctx.createGain(), s = ctx.currentTime + t0;
    o.type = tip || 'sine'; o.frequency.setValueAtTime(f, s);
    v.gain.setValueAtTime(0.0001, s); v.gain.exponentialRampToValueAtTime(g || 0.22, s + 0.015); v.gain.exponentialRampToValueAtTime(0.0001, s + d);
    o.connect(v); v.connect(ctx.destination); o.start(s); o.stop(s + d + 0.05);
  }
  var olumlu = function () { ton(784, 0, 0.16); ton(1175, 0.11, 0.26); };
  var olumsuz = function () { ton(196, 0, 0.22, 'triangle', 0.25); ton(165, 0.12, 0.26, 'triangle', 0.2); };
  var fanfar = function () { [523, 659, 784, 1047].forEach(function (f, i) { ton(f, i * 0.12, 0.3); }); ton(1319, 0.5, 0.6, 'sine', 0.18); };
  function sustur(haric) {
    harfSes.concat(maddeSes, [A]).forEach(function (a) { if (a !== haric && !a.paused) a.pause(); });
  }
  function cal(a) { a.playbackRate = hiz; try { a.currentTime = 0; } catch (e) {} var p = a.play(); if (p) p.catch(hata); }

  /* ——— büyük harf balonu ——— */
  var balon = $('balon'), balonT = null;
  function balonYer() {
    var r = sayfa.getBoundingClientRect(), ust = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ust')) || 52;
    balon.style.left = Math.round(r.left + r.width / 2) + 'px';
    balon.style.top = Math.round(Math.max(ust + 10, Math.min(r.top + r.height * (innerWidth < 760 ? 0.115 : 0.13), window.innerHeight - 240))) + 'px';
  }
  function balonGoster(i, sira) {
    clearTimeout(balonT); balonYer();
    $('balonHarf').textContent = HARF[i]; $('balonAd').textContent = AD[i];
    $('balonSira').textContent = (i + 1) + ' / 28';
    balon.classList.toggle('sende', !!sira); balon.classList.add('acik');
  }
  function balonKapa(ms) { clearTimeout(balonT); balonT = setTimeout(function () { balon.classList.remove('acik', 'sende'); }, ms || 0); }
  window.addEventListener('scroll', function () { if (balon.classList.contains('acik')) balonYer(); }, { passive: true });
  window.addEventListener('resize', balonYer);

  /* ——— ① 28 harf karosu ——— */
  var karolar = [];
  for (var i = 0; i < 28; i++) {
    var c = i % 7, r = Math.floor(i / 7), x = 153.4 - c * 19.733, y = 120 + r * 18.6;
    var k = dugme('karo', X(x), Y(y), 17.6 / TW * 100, 16.6 / TH * 100, 'Harf ' + HARF[i] + ' (' + AD[i] + ')', '<span class="h" lang="ar">' + HARF[i] + '</span>');
    k.dataset.i = i; karolar.push(k);
    k.addEventListener('click', karoTik);
  }
  function karoTik(e) {
    var i = +e.currentTarget.dataset.i;
    if (dizi.calisiyor) dur();
    maddeDur();
    sustur(harfSes[i]); cal(harfSes[i]);
    var k = karolar[i]; k.classList.remove('dokun'); void k.offsetWidth; k.classList.add('dokun');
    setTimeout(function () { k.classList.remove('dokun'); }, 500);
    balonGoster(i, false); balonKapa(1300);
  }

  /* karekodlar: صَوْت 3 (alfabe), صَوْت 4 (alıştırma) — yerleri sayfa resminden ölçüldü */
  var qr3 = dugme('karekod', 4.6, 61.0, 9.2, 8.6, 'صَوْت 3: alfabeyi dinle', '<span class="rozet">' + IK_SES + '</span>');
  var qr4 = dugme('karekod', 4.35, 72.2, 9.2, 8.6, 'صَوْت 4: alıştırmanın sesini dinle', '<span class="rozet">' + IK_SES + '</span>');

  /* ——— dizi oynatıcı: alfabe (tek dosya, zaman.js) ya da tekrar kipi ——— */
  var dizi = { kip: null, calisiyor: false, i: -1, faz: '', sayac: null, jeton: 0 };
  var dinleBtn = $('dinle'), dinleYazi = $('dinleYazi'), tekrarKip = $('tekrarKip'), cubuk = $('cubuk');

  function karoDurum(etkin, konusuyor, sira) {
    for (var j = 0; j < 28; j++) {
      var k = karolar[j];
      k.classList.toggle('okundu', j < etkin || (etkin === 28));
      k.classList.toggle('etkin', j === etkin && !sira);
      k.classList.toggle('konusuyor', j === etkin && !!konusuyor);
      k.classList.toggle('sira', j === etkin && !!sira);
    }
  }
  function arayuz() {
    var cal = dizi.calisiyor;
    dinleBtn.classList.toggle('caliyor', cal); qr3.classList.toggle('caliyor', cal);
    dinleYazi.textContent = cal ? 'Duraklat' : (dizi.i > 0 && dizi.i < 28 ? 'Devam' : 'Dinle');
    dinleBtn.setAttribute('aria-label', dinleYazi.textContent);
  }
  function ilerleme(p) { cubuk.style.width = Math.max(0, Math.min(100, p * 100)) + '%'; }

  function alfabeIndeks(t) {
    var n = -1;
    for (var j = 0; j < 28; j++) if (t >= Z.alfabe[j].a - 0.06) n = j;
    return n;
  }
  function alfabeDongu() {
    if (dizi.kip !== 'alfabe' || !dizi.calisiyor) return;
    var t = A.currentTime, n = alfabeIndeks(t);
    if (n >= 0) {
      var konus = t <= Z.alfabe[n].b + 0.12;
      if (n !== dizi.i) { dizi.i = n; balonGoster(n, false); }
      karoDurum(n, konus, false);
    }
    ilerleme(t / Z.alfabeSure);
    requestAnimationFrame(alfabeDongu);
  }
  function alfabeBasla(bas) {
    dizi.kip = 'alfabe'; dizi.calisiyor = true;
    A.onended = function () { bitti(); };
    var kaynak = new URL('assets/media/alfabe.mp3', location.href).href;
    if (A.src !== kaynak) A.src = kaynak;
    A.playbackRate = hiz;
    var git = function () { try { A.currentTime = Math.max(0, bas); } catch (e) {} };
    if (A.readyState >= 1) git(); else A.addEventListener('loadedmetadata', git, { once: true });
    var p = A.play(); if (p) p.catch(function (e) { hata(e); dizi.calisiyor = false; arayuz(); });
    arayuz(); requestAnimationFrame(alfabeDongu);
  }

  function tekrarAdim(i) {
    var j = ++dizi.jeton;
    if (i >= 28) { bitti(); return; }
    dizi.i = i; dizi.faz = 'oku';
    karoDurum(i, true, false); balonGoster(i, false); ilerleme(i / 28);
    A.onended = function () {
      if (j !== dizi.jeton || !dizi.calisiyor) return;
      dizi.faz = 'sira'; karoDurum(i, false, true); balonGoster(i, true);
      var kalan = 2, sy = balon.querySelector('.sayac'); sy.textContent = kalan;
      var adim = 1000 / hiz;
      dizi.sayac = setInterval(function () {
        if (j !== dizi.jeton) { clearInterval(dizi.sayac); return; }
        kalan--; sy.textContent = kalan > 0 ? kalan : '';
        if (kalan <= 0) { clearInterval(dizi.sayac); ilerleme((i + 1) / 28); tekrarAdim(i + 1); }
      }, adim);
    };
    A.src = harfSes[i].src; A.playbackRate = hiz;
    var p = A.play(); if (p) p.catch(function (e) { hata(e); dizi.calisiyor = false; arayuz(); });
  }
  function tekrarBasla(i) { dizi.kip = 'tekrar'; dizi.calisiyor = true; arayuz(); tekrarAdim(i); }

  function basla() {
    maddeDur(); sustur(null);
    var i = (dizi.i >= 0 && dizi.i < 28) ? dizi.i : 0;
    if (dizi.i >= 28) { dizi.i = -1; i = 0; karoDurum(-1); }
    if (tekrarKip.checked) tekrarBasla(i);
    else if (dizi.kip === 'alfabe' && /alfabe\.mp3$/.test(A.src) && dizi.i >= 0) alfabeBasla(A.currentTime);
    else alfabeBasla(dizi.i > 0 ? Math.max(0, Z.alfabe[i].a - 0.05) : 0);
  }
  function dur() {
    dizi.calisiyor = false; dizi.jeton++; clearInterval(dizi.sayac);
    if (!A.paused) A.pause();
    if (dizi.i >= 0) karoDurum(dizi.i, false, false);
    balonKapa(1200); arayuz();
  }
  function bitti() {
    dizi.calisiyor = false; dizi.jeton++; clearInterval(dizi.sayac);
    dizi.i = 28; karoDurum(28); ilerleme(1); balonKapa(900); arayuz();
  }
  function bastan() {
    dur(); dizi.i = -1; karoDurum(-1); ilerleme(0); balonKapa(0);
    try { A.currentTime = 0; } catch (e) {}
    basla();
  }
  function dinleTik() { if (dizi.calisiyor) dur(); else basla(); }
  dinleBtn.addEventListener('click', dinleTik);
  qr3.addEventListener('click', dinleTik);
  $('bastan').addEventListener('click', bastan);
  tekrarKip.addEventListener('change', function () { if (dizi.calisiyor) { dur(); basla(); } });
  Array.prototype.forEach.call(document.querySelectorAll('.hiz button'), function (b) {
    b.addEventListener('click', function () {
      hiz = +b.dataset.hiz;
      document.querySelectorAll('.hiz button').forEach(function (o) { o.classList.toggle('secili', o === b); });
      A.playbackRate = hiz;
    });
  });

  /* ——— ② dinle, harfi seç ——— */
  var daireler = [], gruplar = [], nolar = [];
  S.x.forEach(function (q, j) {
    var g = S.g[j], s = j - g * 3;
    var d = dugme('daire', PX(q[0]), PY(q[1]), q[2] * 1.95 / TW * 100, q[3] * 2.75 / TH * 100, AR[g] + ' — seçenek ' + SECENEK[g][s], '');
    d.dataset.j = j; daireler.push(d);
    d.addEventListener('click', daireTik);
  });
  for (var g = 0; g < 6; g++) {
    var sag = S.x[g * 3], sol = S.x[g * 3 + 2];
    var cy = PY(sag[1] + sag[3] / 2), dy = 2.7 * 2889 / 4038;   // numara dairesi (ölçüldü: sağdaki dairenin 2,85 % sağında)
    var cx = PX(sag[0] + sag[2]) + 2.85;
    var nb = dugme('madde-no', cx - 1.35, cy - dy / 2, 2.7, dy, AR[g] + '. maddeyi dinle', '<span class="ses" lang="ar">' + AR[g] + '</span><span class="hop">' + IK_SES + '</span>');
    nb.dataset.g = g; nolar.push(nb);
    nb.addEventListener('click', maddeTik);
    var gr = document.createElement('div'); gr.className = 'grup';
    var l = PX(sol[0]) - 0.9, rr = cx + 2.0, t = PY(sag[1]) - 0.7, b = PY(sag[1] + sag[3]) + 0.7;
    gr.style.left = l + '%'; gr.style.top = t + '%'; gr.style.width = (rr - l) + '%'; gr.style.height = (b - t) + '%';
    katman.insertBefore(gr, katman.firstChild); gruplar.push(gr);
  }

  var cvp, gosterildi;
  function cvpSifir() {
    cvp = [0, 1, 2, 3, 4, 5].map(function () { return { deneme: 0, tamam: false, ilk: false }; });
    gosterildi = false;
    daireler.forEach(function (d) { d.classList.remove('dogru', 'yanlis', 'cevap'); });
    gruplar.forEach(function (gr) { gr.classList.remove('bos'); });
    mesaj(''); puanYaz();
  }
  function puanYaz() {
    var ilk = cvp.filter(function (c) { return c.ilk; }).length;
    $('puan').textContent = 'Puan ' + ilk + '/6';
    var hepsi = cvp.every(function (c) { return c.deneme > 0; });
    var gb = $('goster');
    gb.disabled = !hepsi || gosterildi;
    gb.title = hepsi ? '' : 'Önce her maddede bir seçim yap';
  }
  function mesaj(t, kotu) { var m = $('mesaj'); m.textContent = t; m.classList.toggle('kotu', !!kotu); }
  function uyari(d, yazi, iyi) {
    var u = document.createElement('div'); u.className = 'uyari' + (iyi ? ' iyi' : '');
    u.textContent = yazi;
    u.style.left = (parseFloat(d.style.left) + parseFloat(d.style.width) / 2) + '%';
    u.style.top = (parseFloat(d.style.top) - 0.4) + '%';
    katman.appendChild(u); setTimeout(function () { u.remove(); }, 1700);
  }
  function daireTik(e) {
    var d = e.currentTarget, j = +d.dataset.j, g = S.g[j], c = cvp[g];
    if (gosterildi || c.tamam) return;
    c.deneme++;
    if (S.ok.indexOf(j) >= 0) {
      c.tamam = true; c.ilk = c.deneme === 1;
      d.classList.remove('yanlis'); d.classList.add('dogru');
      gruplar[g].classList.remove('bos');
      olumlu(); uyari(d, c.ilk ? 'Aferin!' : 'Doğru!', true);
      var h = HARF.indexOf(SECENEK[g][j - g * 3]);
      setTimeout(function () { if (dizi.calisiyor || calanMadde >= 0 || qr4.classList.contains('caliyor')) return; sustur(harfSes[h]); cal(harfSes[h]); }, 380);
      var tamam = cvp.filter(function (x) { return x.tamam; }).length;
      if (tamam === 6) setTimeout(kutla, 700);
      else mesaj(tamam + ' madde tamam, ' + (6 - tamam) + ' kaldı.');
    } else {
      d.classList.remove('yanlis'); void d.offsetWidth; d.classList.add('yanlis');
      olumsuz(); uyari(d, 'Yeniden dene', false);
      setTimeout(function () { d.classList.remove('yanlis'); }, 1100);
    }
    puanYaz();
  }
  var calanMadde = -1;
  function maddeDur() {
    if (calanMadde >= 0) { nolar[calanMadde].classList.remove('caliyor'); gruplar[calanMadde].classList.remove('caliyor'); }
    calanMadde = -1;
    if (qr4.classList.contains('caliyor')) { qr4.classList.remove('caliyor'); if (!A.paused) A.pause(); }
    qr4Gr(-1);
  }
  function maddeTik(e) {
    var g = +e.currentTarget.dataset.g, a = maddeSes[g];
    if (dizi.calisiyor) dur();
    var ayni = calanMadde === g && !a.paused;
    maddeDur(); sustur(null);
    if (ayni) return;
    calanMadde = g; nolar[g].classList.add('caliyor'); gruplar[g].classList.add('caliyor');
    a.onended = function () { if (calanMadde === g) maddeDur(); };
    cal(a);
  }
  /* صَوْت 4: bütün alıştırma sesi; çalan madde vurgulanır */
  function qr4Gr(n) { gruplar.forEach(function (gr, k) { if (k !== calanMadde) gr.classList.toggle('caliyor', k === n); }); }
  function qr4Dongu() {
    if (!qr4.classList.contains('caliyor')) return;
    var t = A.currentTime, n = -1;
    Z.madde.forEach(function (m, k) { if (t >= m.a - 0.05) n = k; });
    qr4Gr(n); requestAnimationFrame(qr4Dongu);
  }
  qr4.addEventListener('click', function () {
    if (qr4.classList.contains('caliyor')) { maddeDur(); return; }
    if (dizi.calisiyor) dur();
    maddeDur(); sustur(null);
    dizi.kip = null;
    A.onended = function () { maddeDur(); };
    A.src = 'assets/media/harf_sec.mp3'; A.playbackRate = hiz;
    qr4.classList.add('caliyor');
    var p = A.play(); if (p) p.catch(function (e2) { hata(e2); maddeDur(); });
    requestAnimationFrame(qr4Dongu);
  });

  $('kontrol').addEventListener('click', function () {
    var bos = [], tamam = 0;
    cvp.forEach(function (c, k) { if (c.tamam) tamam++; else if (!c.deneme) bos.push(k); });
    if (tamam === 6) { mesaj('Hepsi doğru! İlk denemede ' + cvp.filter(function (c) { return c.ilk; }).length + '/6.'); return; }
    gruplar.forEach(function (gr, k) { gr.classList.remove('bos'); if (bos.indexOf(k) >= 0) { void gr.offsetWidth; gr.classList.add('bos'); } });
    var t = 'Doğru: ' + tamam + '/6.';
    if (bos.length) t += ' Boş: ' + bos.map(function (k) { return k + 1; }).join(', ') + '.';
    var yarim = 6 - tamam - bos.length;
    if (yarim) t += ' Yeniden dene: ' + yarim + ' madde.';
    mesaj(t, tamam < 6);
  });
  $('goster').addEventListener('click', function () {
    if (!cvp.every(function (c) { return c.deneme > 0; })) { mesaj('Önce her maddede bir seçim yap.', true); return; }
    gosterildi = true;
    S.ok.forEach(function (j) { var g = S.g[j]; if (!cvp[g].tamam) daireler[j].classList.add('cevap'); });
    mesaj('Doğru cevaplar kesik çizgiyle gösterildi.'); puanYaz();
  });
  $('sifirla').addEventListener('click', function () { maddeDur(); cvpSifir(); });

  function kutla() {
    fanfar(); balonKapa(0);
    var ilk = cvp.filter(function (c) { return c.ilk; }).length;
    mesaj('Tebrikler! 6 maddenin hepsi doğru. İlk denemede ' + ilk + '/6.');
    var k = $('kutlama'); k.innerHTML = '';
    var renk = ['#1f5460', '#d2342e', '#e9dcb8', '#2f9a5b', '#f0a020'];
    for (var n = 0; n < 70; n++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + 'vw'; p.style.background = renk[n % renk.length];
      p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px'); p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      k.appendChild(p);
    }
    var t = document.createElement('div'); t.className = 'tebrik';
    t.innerHTML = '<b>' + ilk + ' / 6</b><span lang="ar">أَحْسَنْتَ!</span>';
    k.appendChild(t);
    setTimeout(function () { k.innerHTML = ''; }, 3200);
  }

  /* أَسْتَطيعُ أَنْ: öz değerlendirme yüzleri (sayfa resminden ölçüldü) */
  var YUZ = [[27.83, 'iyi'], [23.95, 'orta'], [20.16, 'az']], yuzler = [];
  YUZ.forEach(function (y, n) {
    var b = dugme('yuz', y[0] - 1.5, 90.3 - 1.5 * 2889 / 4038, 3.0, 3.0 * 2889 / 4038, 'Öz değerlendirme: ' + y[1], '');
    b.addEventListener('click', function () { yuzler.forEach(function (o) { o.classList.toggle('secili', o === b && !b.classList.contains('secili')); }); });
    yuzler.push(b);
  });

  /* ölçek: --u = sayfa genişliği / 100 */
  function olcek() { document.documentElement.style.setProperty('--u', (sayfa.clientWidth / 100) + 'px'); }
  if (window.ResizeObserver) new ResizeObserver(olcek).observe(sayfa); else window.addEventListener('resize', olcek);
  olcek();
  document.addEventListener('visibilitychange', function () { if (document.hidden) { if (dizi.calisiyor) dur(); maddeDur(); sustur(null); } });
  if (/[?&]cerceve/.test(location.search)) document.body.classList.add('cerceve');

  cvpSifir(); arayuz();
  window.DEMO13 = { karolar: karolar, daireler: daireler, nolar: nolar, harfSes: harfSes, maddeSes: maddeSes, A: A, dizi: dizi, cvp: function () { return cvp; } };
})();
