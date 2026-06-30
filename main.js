/* The Rose Beauty — interactions */
(function () {
  'use strict';

  var header = document.getElementById('siteHeader');

  /* Sticky header */
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Scroll-reveal */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }

  /* Observe one or more `.reveal` elements (or reveal them outright when
     IntersectionObserver is unavailable). Safe to call for content added
     to the page after load, e.g. the pricing cards. */
  function revealEls(els) {
    Array.prototype.forEach.call(els, function (el) {
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  revealEls(document.querySelectorAll('.reveal'));

  /* Footer year */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Cursive SVG handwriting "Get beautified!", arched along the top
        border and drawn one letter at a time. ── */
  (function handwriting() {
    var svg = document.getElementById('heroWrite');
    if (!svg || typeof opentype === 'undefined') return;

    var reduce = window.matchMedia &&
                 window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var TEXT      = 'Get beautified!';
    var SVGNS     = 'http://www.w3.org/2000/svg';
    var FONT_SIZE = 54;           // glyph size, in viewBox units (520×650)
    var CX = 260,  CY = 262;      // centre of the top-border arch
    var R_BASE = 300;             // text baseline radius (just outside the curve)
    var INK    = '#9E1515';       // maroon fill
    var PER    = 0.05;            // seconds between letters

    opentype.load('fonts/GreatVibes-Regular.ttf', function (err, font) {
      if (err || !font) { svg.classList.add('write-failed'); return; }

      var scale  = FONT_SIZE / font.unitsPerEm;
      var glyphs = font.stringToGlyphs(TEXT);

      // per-glyph advance (with kerning) and total run length
      var adv = [], total = 0, i;
      for (i = 0; i < glyphs.length; i++) {
        var a = glyphs[i].advanceWidth * scale;
        if (i < glyphs.length - 1) a += font.getKerningValue(glyphs[i], glyphs[i + 1]) * scale;
        adv.push(a); total += a;
      }

      // lay each glyph along the arch (apex = straight up from centre)
      var items = [], cursor = 0;
      for (i = 0; i < glyphs.length; i++) {
        var sMid  = cursor + adv[i] / 2;
        var alpha = (sMid - total / 2) / R_BASE;            // radians, 0 = apex
        var px = CX + R_BASE * Math.sin(alpha);
        var py = CY - R_BASE * Math.cos(alpha);
        var deg = alpha * 180 / Math.PI;
        var d = glyphs[i].getPath(0, 0, FONT_SIZE).toPathData(2);
        cursor += adv[i];
        if (!d || d.length < 3) continue;                  // skip spaces

        var pe = document.createElementNS(SVGNS, 'path');
        pe.setAttribute('d', d);
        pe.setAttribute('transform',
          'translate(' + px.toFixed(2) + ',' + py.toFixed(2) + ') ' +
          'rotate(' + deg.toFixed(2) + ') ' +
          'translate(' + (-adv[i] / 2).toFixed(2) + ',0)');
        svg.appendChild(pe);
        items.push(pe);
      }

      // each letter is one solid filled shape, hidden until its turn
      items.forEach(function (pe) {
        pe.style.fill = INK;
        pe.style.opacity = reduce ? 1 : 0;
      });
      svg.classList.add('ready');
      if (reduce) return;

      items.forEach(function (pe, idx) {
        setTimeout(function () {
          pe.style.transition = 'opacity .09s linear';
          pe.style.opacity = 1;
        }, idx * PER * 1000);
      });
    });
  })();

  /* ── Strip the Elfsight "Free Instagram Feed Widget" backlink ── */
  (function removeElfsightBacklink() {
    var scope = document.getElementById('gallery');
    if (!scope) return;

    function kill() {
      var links = scope.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var txt  = (a.textContent || '').trim().toLowerCase();
        var href = (a.href || '').toLowerCase();
        if (/instagram feed widget/.test(txt) || /elfsight\.com/.test(href)) {
          // remove the link plus any thin wrapper that holds only the promo,
          // but never the widget container itself
          var el = a;
          while (el.parentElement &&
                 el.parentElement !== scope &&
                 el.parentElement.children.length === 1 &&
                 String(el.parentElement.className).indexOf('elfsight-app') === -1) {
            el = el.parentElement;
          }
          el.remove();
        }
      }
    }

    kill();
    var obs = new MutationObserver(kill);
    obs.observe(scope, { childList: true, subtree: true });
  })();

  /* ── Build the pricing cards from pricing.json ── */
  (function pricing() {
    var grid = document.getElementById('priceGrid');
    if (!grid) return;

    var src = grid.getAttribute('data-src') || 'pricing.json';

    fetch(src, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var groups = (data && data.groups) || [];
        var cards = [];

        groups.forEach(function (group) {
          var card = document.createElement('div');
          card.className = 'price-card reveal';
          if (group.feature) card.classList.add('price-card--feature');

          var h3 = document.createElement('h3');
          h3.textContent = group.title || '';
          card.appendChild(h3);

          var ul = document.createElement('ul');
          ul.className = 'price-list';
          (group.items || []).forEach(function (item) {
            var li = document.createElement('li');
            var label = document.createElement('span');
            label.textContent = item.label || '';
            var price = document.createElement('span');
            price.className = 'price';
            price.textContent = item.price || '';
            li.appendChild(label);
            li.appendChild(price);
            ul.appendChild(li);
          });
          card.appendChild(ul);

          if (group.note) {
            var note = document.createElement('p');
            note.className = 'price-note';
            var strong = document.createElement('strong');
            strong.textContent = group.note;
            note.appendChild(strong);
            card.appendChild(note);
          }

          grid.appendChild(card);
          cards.push(card);
        });

        revealEls(cards);
      })
      .catch(function (err) {
        if (window.console) console.error('Could not load pricing:', err);
      });
  })();
})();
