(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky nav border
  var nav = document.getElementById('nav');
  var mbar = document.getElementById('mbar'), book = document.getElementById('start');
  var onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 8);
    if (mbar && book) {
      var show = window.scrollY > 640 && book.getBoundingClientRect().top > window.innerHeight * 0.6;
      mbar.classList.toggle('on', show);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Reveal on scroll
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // Live lead feed in the hero
  var feed = document.getElementById('feed');
  if (feed) {
    var items = Array.prototype.slice.call(feed.querySelectorAll('li'));
    var labelNew = feed.dataset.new, labelClaim = feed.dataset.claim, labelNow = feed.dataset.now, lMin = feed.dataset.min, lH = feed.dataset.h;
    items.forEach(function (li) {
      li.innerHTML = '<div class="f-txt"><small><i>' + labelNew + '</i><span class="ago"></span></small><b></b><span class="meta"></span></div><em>' + labelClaim + '</em>';
      li.querySelector('b').textContent = li.dataset.name;
      li.querySelector('.meta').textContent = li.dataset.meta;
    });
    var shown = [], next = 0, MAX = 3, minutes = [];
    var ago = function (m) { return m < 1 ? labelNow : (m < 60 ? m + ' ' + lMin : Math.round(m / 60) + ' ' + lH); };
    var push = function () {
      var li = items[next % items.length]; next++;
      var idx = shown.indexOf(li); if (idx > -1) { shown.splice(idx, 1); minutes.splice(idx, 1); }
      shown.unshift(li); minutes.unshift(0);
      minutes = minutes.map(function (m, i) { return i === 0 ? 0 : m + 17 + i * 9; });
      if (shown.length > MAX) { var gone = shown.pop(); minutes.pop(); gone.classList.remove('on', 'old'); }
      shown.forEach(function (el, i) {
        el.querySelector('.ago').textContent = ago(minutes[i]);
        el.classList.toggle('old', i === MAX - 1);
        el.querySelector('i').style.display = i === 0 ? '' : 'none';
        feed.appendChild(el);
      });
      li.classList.remove('on'); void li.offsetWidth; li.classList.add('on');
    };
    push(); push(); push();
    if (!reduce) setInterval(push, 3200);
  }

  // Send-to-client animation
  var sa = document.getElementById('sendanim');
  if (sa) {
    var tap = sa.querySelector('.sa-tap'), steps = sa.querySelectorAll('.sa-steps li');
    // [classes on, tap x%, tap y%, press?, phase, duration ms]
    var seq = [
      ['', 70, 115, 0, 0, 700],
      ['', 84, 26, 0, 0, 450],
      ['has1', 84, 26, 1, 0, 550],
      ['has1', 84, 43, 0, 0, 380],
      ['has1 has2', 84, 43, 1, 0, 550],
      ['has1 has2', 84, 60, 0, 0, 380],
      ['has1 has2 has3', 84, 60, 1, 0, 650],
      ['has1 has2 has3', 50, 90, 0, 1, 420],
      ['has1 has2 has3', 50, 90, 1, 1, 380],
      ['has1 has2 has3 sheet', 22, 84, 0, 1, 700],
      ['has1 has2 has3 sheet line', 22, 84, 1, 1, 600],
      ['chat', 60, 120, 0, 2, 500],
      ['chat msg', 60, 120, 0, 2, 800],
      ['chat msg link', 66, 62, 0, 2, 900],
      ['chat msg link', 66, 62, 1, 2, 450],
      ['page', 60, 120, 0, 2, 1500],
      ['page', 50, 92, 0, 2, 500],
      ['page cta', 50, 92, 1, 2, 1500]
    ];
    var base = sa.className, i = 0, timer = null, running = false;
    var show = function () {
      var st = seq[i];
      sa.className = base + ' ' + st[0];
      tap.style.setProperty('--tx', st[1] + '%'); tap.style.setProperty('--ty', st[2] + '%');
      tap.style.opacity = st[2] > 100 ? 0 : 1;
      tap.classList.remove('press'); if (st[3]) { void tap.offsetWidth; tap.classList.add('press'); }
      steps.forEach(function (li, k) { li.classList.toggle('on', k === st[4]); });
      sa.querySelector('.sa-count i').textContent = (st[0].match(/has\d/g) || []).length;
      timer = setTimeout(function () { i = (i + 1) % seq.length; if (running) show(); }, st[5]);
    };
    if (reduce) { i = 15; show(); clearTimeout(timer); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; show(); }
          else if (!e.isIntersecting && running) { running = false; clearTimeout(timer); }
        });
      }, { threshold: 0.3 }).observe(sa);
    } else { running = true; show(); }
  }

  // Lead-bot animation
  var ba = document.getElementById('botanim');
  if (ba) {
    var btap = ba.querySelector('.ba-tap'), bbase = ba.className, bi = 0, btimer = null, brun = false, bsrc = '';
    // [classes, tap x%, tap y%, press?, ms]
    var bseq = [
      ['', 88, 110, 0, 500],
      ['post', 88, 110, 0, 700],
      ['post scan', 88, 110, 0, 900],
      ['post scan m', 88, 110, 0, 900],
      ['post m k1', 88, 110, 0, 500],
      ['post m k1 k2', 88, 110, 0, 1100],
      ['fly', 88, 110, 0, 900],
      ['fly', 86, 0, 0, 450],
      ['fly claim', 86, 0, 1, 1800],
      ['fly claim', 88, 110, 0, 500],
      ['fly claim out', 88, 110, 0, 400]
    ];
    var bshow = function () {
      var st = bseq[bi];
      ba.className = bbase + bsrc + ' ' + st[0];
      var c = ba.querySelector('.ba-claim');
      var y = st[2];
      if (y === 0 && c) { var r = c.getBoundingClientRect(), R = ba.getBoundingClientRect(); y = ((r.top + r.height / 2 - R.top) / R.height) * 100; }
      btap.style.setProperty('--tx', st[1] + '%'); btap.style.setProperty('--ty', y + '%');
      btap.style.opacity = st[2] > 100 ? 0 : 1;
      btap.classList.remove('press'); if (st[3]) { void btap.offsetWidth; btap.classList.add('press'); }
      btimer = setTimeout(function () { bi = (bi + 1) % bseq.length; if (bi === 0) bsrc = bsrc ? '' : ' tg'; if (brun) bshow(); }, st[4]);
    };
    if (reduce) { ba.className = bbase + ' post m k1 k2'; }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !brun) { brun = true; bshow(); }
          else if (!e.isIntersecting && brun) { brun = false; clearTimeout(btimer); }
        });
      }, { threshold: 0.3 }).observe(ba);
    } else { brun = true; bshow(); }
  }

  // Website language animation
  var lp = document.getElementById('langanim');
  if (lp) {
    var ltap = lp.querySelector('.lp-tap'), lbase = lp.className, lcur = 0, lstep = 0, ltimer = null, lrun = false;
    var opts = lp.querySelectorAll('.lp-menu span');
    var at = function (el) {
      var r = el.getBoundingClientRect(), R = lp.getBoundingClientRect();
      return [((r.left + r.width / 2 - R.left) / R.width) * 100, ((r.top + r.height / 2 - R.top) / R.height) * 100];
    };
    var tapTo = function (el, press) {
      if (!el) { ltap.style.opacity = 0; return; }
      var xy = at(el); ltap.style.setProperty('--tx', xy[0] + '%'); ltap.style.setProperty('--ty', xy[1] + '%'); ltap.style.opacity = 1;
      ltap.classList.remove('press'); if (press) { void ltap.offsetWidth; ltap.classList.add('press'); }
    };
    var lset = function (open, hl) {
      lp.className = lbase + ' l' + lcur + (open ? ' open' : '');
      opts.forEach(function (o, k) { o.classList.toggle('hl', k === hl); });
    };
    var ltick = function () {
      var nxt = (lcur + 1) % 3, d = 600;
      var pill = lp.querySelectorAll('.lp-pill')[lcur];
      if (lstep === 0) { lset(false, -1); tapTo(null); d = 1900; }
      else if (lstep === 1) { tapTo(pill, false); d = 450; }
      else if (lstep === 2) { tapTo(pill, true); lset(true, -1); d = 500; }
      else if (lstep === 3) { tapTo(opts[nxt], false); d = 400; }
      else if (lstep === 4) { tapTo(opts[nxt], true); lset(true, nxt); d = 300; }
      else { lcur = nxt; lset(false, -1); tapTo(null); d = 300; lstep = -1; }
      lstep++;
      ltimer = setTimeout(function () { if (lrun) ltick(); }, d);
    };
    lset(false, -1);
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !lrun) { lrun = true; ltick(); }
          else if (!e.isIntersecting && lrun) { lrun = false; clearTimeout(ltimer); }
        });
      }, { threshold: 0.4 }).observe(lp);
    }
  }

  // Launch offer: days-left counter; the banner hides itself after the end date
  var offer = document.getElementById('offer');
  if (offer) {
    var left = Math.ceil((new Date(offer.dataset.end) - new Date()) / 864e5);
    var days = document.getElementById('offer-days');
    if (left <= 0) offer.remove();
    else if (days && left <= 120) { days.textContent = days.dataset.t.replace('{n}', left); days.hidden = false; }
  }

  // Plan buttons preselect the form
  var sel = document.getElementById('plan-select');
  document.querySelectorAll('[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () { if (sel) sel.value = a.dataset.plan; });
  });

  // LINE / WhatsApp: real links once the accounts exist (set in build config)
  var cfg = window.BANAROO || {};
  [['c-line', cfg.line], ['c-wa', cfg.whatsapp]].forEach(function (p) {
    var el = document.getElementById(p[0]);
    if (el && p[1]) {
      el.href = p[1]; el.target = '_blank'; el.rel = 'noopener';
      var s = el.querySelector('small'); if (s) s.remove();
    }
  });

  // Get started form: Netlify form with files, sent via fetch, then show thanks
  var form = document.getElementById('start-form');
  if (form) {
    var note = document.getElementById('files-note'), MAX = 8 * 1024 * 1024;
    var tooBig = function () {
      var total = 0;
      form.querySelectorAll('input[type=file]').forEach(function (f) { if (f.files && f.files[0]) total += f.files[0].size; });
      return total > MAX;
    };
    form.querySelectorAll('input[type=file]').forEach(function (f) {
      f.addEventListener('change', function () { if (note) note.classList.toggle('warn', tooBig()); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (tooBig()) { if (note) { note.classList.add('warn'); note.scrollIntoView({ block: 'center' }); } return; }
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
      fetch('/', { method: 'POST', body: new FormData(form) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.querySelector('.thanks').hidden = false; })
        .catch(function () { btn.disabled = false; form.submit(); });
    });
  }

  // Close popovers on outside click, Escape, or picking a link
  var pops = document.querySelectorAll('details.pop');
  document.addEventListener('click', function (e) {
    pops.forEach(function (d) { if (d.open && (!d.contains(e.target) || e.target.closest('.pop-menu a'))) d.open = false; });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pops.forEach(function (d) { d.open = false; }); });

  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
