// SoulBox results, Enter Your House and sales (Build Brief Parts J, K and L).
// Registers window.SoulBoxResults; the quiz app calls render() on its results screen.
(function () {
  'use strict';
  var HOUSE_IMAGES = {
    Heart: 'house_of_heart.jpg', Body: 'house_of_body.jpg', Soul: 'house_of_soul.jpg', Mind: 'house_of_mind.jpg'
  };
  var GRADIENTS = { Heart: 'gradient_heart.jpg', Body: 'gradient_body.jpg', Soul: 'gradient_soul.jpg', Mind: 'gradient_mind.jpg' };
  var BENEFITS = [
    ['Monthly Book Recommendations', "A free pick from your House's curators, every month."],
    ['100% Human Touch', 'Every report, email and letter is personally reviewed or written by our curators.'],
    ['House Community', 'Monthly book clubs, House conversations and readers like you.'],
    ['First Access', 'Be first to every SoulBox drop.']
  ];
  var UK = ['GB', 'United Kingdom'];
  var CHECKOUT_API = 'https://soulbox-backend-new.vercel.app/api/create-checkout-session';
  // ISO 3166 country codes; names come from the browser (Intl.DisplayNames) in English.
  var CODES = 'AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW'.split(' ');

  function countryName(code) {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch (_) { return code; }
  }
  function isUK(country) { return UK.indexOf(country) !== -1; }

  var Q, state, root, experience;

  function render(container) {
    Q = window.SoulBoxQuiz; state = Q.state(); root = container;
    var r = state.results;
    if (!r) { container.innerHTML = '<p class="q-copy">We could not load your results.</p>'; return; }
    document.getElementById('q-app').hidden = true;
    if (experience) experience.remove();
    experience = document.createElement('main');
    experience.className = 'r-experience';
    experience.setAttribute('aria-label', 'Your Soul results');
    experience.style.setProperty('--house', r.house_colour);
    var cards = [
      { name: 'result_character', file: r.files.character, alt: 'Your SoulCharacter: ' + r.soul_character, kind: 'SoulCharacter', value: r.soul_character },
      { name: 'result_archetype', file: r.files.archetype, alt: 'Your Archetype: ' + r.final_archetype, kind: 'Archetype', value: r.final_archetype },
      { name: 'result_grade', file: r.files.grade, alt: 'Your Literary Grade: ' + r.literary_grade, kind: 'Literary Grade', value: r.literary_grade + ' · ' + r.literary_grade_name },
      { name: 'result_moral', file: r.files.moral, alt: 'Your Moral Score: ' + r.moral_tier, kind: 'Moral Score', value: r.moral_tier },
      { name: 'pre_house', file: 'pre_house_reveal.jpg', alt: 'The four Reading Houses' },
      { name: 'result_house', file: HOUSE_IMAGES[r.house], alt: 'The House of ' + r.house, kind: 'House', value: 'House of ' + r.house }
    ];
    experience.innerHTML =
      panel('results_intro', '<div class="r-intro"><h1>YOUR SOUL RESULTS</h1><p>Swipe through to discover your SoulCharacter, Archetype, Literary Grade, Moral Score and House.</p></div>') +
      cards.map(function (c) { return panel(c.name, card(c), Q.imageUrl(c.file)); }).join('') +
      '<section class="r-panel r-gradient" data-screen="gradient_bridge">' + (Q.imageUrl(GRADIENTS[r.house]) ? '<img data-src="' + Q.esc(Q.imageUrl(GRADIENTS[r.house])) + '" alt="">' : '') + nextButton() + '</section>' +
      '<section class="r-panel r-house" data-screen="house_section" id="r-house"></section>' +
      '<section class="r-panel r-sales" data-screen="sales_page" id="r-sales" hidden></section>';
    document.body.appendChild(experience);
    lazyPanels(cards);
    renderHouse(r, cards);
    experience.querySelectorAll('.r-next').forEach(function (b) { b.addEventListener('click', function () {
      var next = b.parentElement.nextElementSibling; if (next) next.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }); });
    Q.track.milestone('results_reached', { reader_id: state.reader_id });
    detectCountry();
  }

  function panel(name, inner, bg) {
    return '<section class="r-panel" data-screen="' + name + '">' +
      (bg ? '<div class="r-bg" data-bg="' + Q.esc(bg) + '"></div>' : '') + '<div class="r-content">' + inner + '</div>' + nextButton() + '</section>';
  }
  function nextButton() { return '<button class="r-next" type="button" aria-label="Next result">Next ↓</button>'; }
  // A result card: the 4:5 image, or until it is delivered, a placeholder showing the result.
  function card(c) {
    var url = Q.imageUrl(c.file);
    if (url) return '<img class="r-card" data-src="' + Q.esc(url) + '" alt="' + Q.esc(c.alt) + '">';
    return '<div class="r-card r-card--placeholder" role="img" aria-label="' + Q.esc(c.alt) + '"><span>' + Q.esc(c.kind || '') + '</span><strong>' + Q.esc(c.value || '') + '</strong><em>' + Q.esc(c.file) + '</em></div>';
  }
  // Lazy-load each panel's images as it comes into view, with a soft fade (J4).
  function lazyPanels() {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var p = e.target;
        p.querySelectorAll('[data-src]').forEach(function (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); img.addEventListener('load', function () { img.classList.add('is-in'); }, { once: true }); });
        var bg = p.querySelector('[data-bg]'); if (bg) { bg.style.backgroundImage = 'url("' + bg.getAttribute('data-bg') + '")'; bg.removeAttribute('data-bg'); }
        p.classList.add('is-visible');
        var name = p.getAttribute('data-screen');
        if (!seen[name]) { seen[name] = true; Q.track.screenView(name, { reader_id: state.reader_id }); Q.save({ last_screen_reached: name });
          if (name === 'house_section') Q.track.milestone('house_section_reached', { reader_id: state.reader_id });
          if (name === 'sales_page') Q.track.milestone('sales_page_reached', { reader_id: state.reader_id }); }
        // Preload the next panel's image.
        var next = p.nextElementSibling; if (next) next.querySelectorAll('[data-src]').forEach(function (img) { var i = new Image(); i.src = img.getAttribute('data-src'); });
      });
    }, { root: experience, threshold: 0.35 });
    experience.querySelectorAll('.r-panel').forEach(function (p) { io.observe(p); });
  }

  // ── Part K: Save My Results and Enter Your House ──────────────────────────
  function renderHouse(r, cards) {
    var house = document.getElementById('r-house');
    house.innerHTML = '<div class="r-house-inner">' +
      '<button class="q-btn q-btn--main" id="r-save" type="button">Save My Results</button><p class="q-status" id="r-save-status" aria-live="polite"></p><div class="r-links" id="r-links" hidden></div>' +
      '<div class="r-emblem">' + Q.media(r.files.emblem, 'Emblem of the House of ' + r.house, { index: 0 }) + '</div>' +
      '<h2 class="r-welcome">Welcome to the House of ' + Q.esc(r.house) + '</h2>' +
      '<div class="r-benefits">' + BENEFITS.map(function (b) { return '<div><strong>' + Q.esc(b[0]) + '</strong><span>' + Q.esc(b[1]) + '</span></div>'; }).join('') + '</div>' +
      '<form class="r-form" id="r-form" novalidate><h3>Enter Your House</h3>' +
      '<label><span>First name</span><input class="q-field" id="r-name" autocomplete="given-name" value="' + Q.esc(state.a.first_name || '') + '"></label><p class="q-error" id="r-name-err" hidden>Please fill this in.</p>' +
      '<label><span>Email</span><input class="q-field" id="r-email" type="email" autocomplete="email" value="' + Q.esc(state.a.email || '') + '"></label><p class="q-error" id="r-email-err" hidden>Please enter a valid email.</p>' +
      '<label><span>Country or region</span><select class="q-field" id="r-country" autocomplete="country-name">' + countryOptions() + '</select></label>' +
      '<button class="q-btn q-btn--main" type="submit">Enter My House</button><p class="r-small">You\'ll receive emails from SoulBox. Unsubscribe any time.</p></form>' +
      '<button class="r-skip" id="r-skip" type="button">Skip and see your products</button></div>';
    Q.revealImages(house);
    selectCountry(state.a.country || state.a.country_detected || 'United Kingdom');
    document.getElementById('r-save').addEventListener('click', function () { saveResults(cards); });
    document.getElementById('r-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('r-name').value.trim(), email = document.getElementById('r-email').value.trim();
      var okName = !!name, okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      document.getElementById('r-name-err').hidden = okName; document.getElementById('r-email-err').hidden = okEmail;
      if (!okName || !okEmail) return;
      var country = document.getElementById('r-country').value;
      Q.save({ first_name: name, email: email, country: country, house_joined: 'yes' });
      Q.track.milestone('house_joined', { reader_id: state.reader_id });
      showSales(country, email);
    });
    document.getElementById('r-skip').addEventListener('click', function () {
      Q.save({ house_joined: 'no', country: state.a.country_detected || 'United Kingdom' });
      Q.track.milestone('skipped_to_products', { reader_id: state.reader_id });
      showSales(state.a.country_detected || 'United Kingdom', null);
    });
  }
  function countryOptions() {
    var names = CODES.map(function (c) { return countryName(c); }).sort(function (x, y) { return x.localeCompare(y); });
    return names.map(function (n) { return '<option>' + Q.esc(n) + '</option>'; }).join('');
  }
  function selectCountry(name) {
    var select = document.getElementById('r-country'); if (!select) return;
    for (var i = 0; i < select.options.length; i++) if (select.options[i].value === name) { select.selectedIndex = i; return; }
  }
  // Country detection: Vercel tells the backend the visitor's country; default United Kingdom.
  function detectCountry() {
    if (state.a.country_detected) return;
    fetch(Q.api + '/country').then(function (r) { return r.json(); }).then(function (d) {
      var name = d && d.code ? countryName(d.code) : 'United Kingdom';
      Q.save({ country_detected: name }); if (!state.a.country) selectCountry(name);
    }).catch(function () { Q.save({ country_detected: 'United Kingdom' }); });
  }
  // Save My Results: the four result cards plus the House card (K2.1).
  function saveResults(cards) {
    var status = document.getElementById('r-save-status');
    Q.track.milestone('save_results_tapped', { reader_id: state.reader_id });
    Q.save({ results_saved: 'yes' });
    var files = cards.filter(function (c) { return c.name !== 'pre_house'; }).map(function (c) { return { name: c.file, url: Q.imageUrl(c.file) }; }).filter(function (f) { return f.url; });
    if (!files.length) { status.textContent = 'Your result cards are being finished and will be ready to save soon.'; return; }
    status.textContent = 'Preparing your cards…';
    Promise.all(files.map(function (f) { return fetch(f.url).then(function (r) { return r.blob(); }).then(function (b) { return new File([b], f.name, { type: b.type || 'image/png' }); }); }))
      .then(function (list) {
        if (navigator.canShare && navigator.canShare({ files: list })) return navigator.share({ files: list, title: 'My SoulBox results' }).then(function () { status.textContent = 'Saved.'; });
        throw new Error('no share');
      }).catch(function () {
        var links = document.getElementById('r-links');
        links.innerHTML = files.map(function (f) { return '<a href="' + Q.esc(f.url) + '" download="' + Q.esc(f.name) + '" target="_blank" rel="noopener">' + Q.esc(f.name) + '</a>'; }).join('');
        links.hidden = false; status.textContent = 'Tap each card to save it.';
      });
  }

  // ── Part L: the sales page ────────────────────────────────────────────────
  function showSales(country, email) {
    var sales = document.getElementById('r-sales');
    var uk = isUK(country);
    sales.hidden = false;
    sales.innerHTML = '<div class="r-sales-inner"><h1>Your House has space for you.</h1>' +
      '<p class="r-offer-label">The Digital</p>' +
      '<article class="r-offer"><h2>The Soul Report</h2><p class="r-price">£19</p><ul><li><strong>Your Reading Profile</strong><span>A deeper analysis of your reading identity.</span></li><li><strong>Your Curator Note</strong><span>A human-written interpretation of what your results mean.</span></li><li><strong>Your Soul Book</strong><span>The one book chosen for your soul (Not including physical book).</span></li></ul>' +
      '<button class="q-btn q-btn--main" data-plan="soul_report_september" type="button">Get My Soul Report</button></article>' +
      '<p class="r-offer-label">The Physical</p>' +
      '<article class="r-offer"><h2>The SoulBox</h2><p class="r-price">£50</p><ul><li><strong>Your Printed Soul Report</strong><span>Your Curator written profile of your reading life.</span></li><li><strong>Your Soul Book</strong><span>The book chosen for your soul.</span></li><li><strong>Your Emblems</strong><span>Artefacts from your Reading House and more.</span></li></ul>' +
      (uk ? '<button class="q-btn q-btn--main" data-plan="soulbox_september" type="button">Get My SoulBox</button>'
        : '<p class="r-coming" aria-disabled="true">Coming soon to your country.</p>') + '</article>' +
      '<a class="r-not-now" href="/">Not now</a><p class="q-status" id="r-checkout-status" aria-live="polite"></p></div>';
    sales.querySelectorAll('[data-plan]').forEach(function (button) { button.addEventListener('click', function () {
      var plan = button.getAttribute('data-plan'), status = document.getElementById('r-checkout-status');
      Q.track.milestone(plan === 'soulbox_september' ? 'buy_tapped_soulbox' : 'buy_tapped_soul_report', { reader_id: state.reader_id });
      button.disabled = true; status.textContent = 'Opening secure checkout…';
      Q.flushAll().catch(function () {}).then(function () {
        return fetch(CHECKOUT_API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: plan, email: email || state.a.email, submission: { id: state.reader_id, country: uk ? 'United Kingdom' : country } }) });
      }).then(function (r) { return r.json().then(function (d) { if (!r.ok || !d.url) throw new Error(d.error || 'Checkout unavailable'); return d; }); })
        .then(function (d) {
          var url = new URL(d.url); if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('Invalid checkout destination');
          window.location.assign(url.href);
        }).catch(function () { status.textContent = 'We could not open checkout. Please try again shortly.'; button.disabled = false; });
    }); });
    sales.scrollIntoView({ behavior: 'smooth' });
  }

  window.SoulBoxResults = { render: render, isUK: isUK };
})();
