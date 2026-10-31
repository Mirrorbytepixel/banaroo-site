(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky nav border
  var nav = document.getElementById('nav');
  var mbar = document.getElementById('mbar'), book = document.getElementById('book');
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

  // Netlify form via fetch, then show thanks
  var form = document.getElementById('demo-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
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
