'use strict';
document.addEventListener('DOMContentLoaded', () => {
  /* =====================
   * Part 1 — JavaScript Basics
   * ===================== */
  const app = {
    siteName: 'LABUBU TOURS AND TRAVEL',       // string
    taxRate: 0.16,                              // number — example VAT
    discountThreshold: 5,                       // number — nights
    discountRate: 0.10,                         // number — 10% off if nights >= threshold
    currency: '$'                               // string
  };

  // Simple conditional + operators
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');

  // Show a friendly banner at the top (DOM write + demonstrates data types)
  const banner = document.createElement('div');
  banner.id = 'labubu-banner';
  banner.style.cssText = 'position:sticky;top:0;z-index:9999;padding:10px 16px;background:#f6f6f6;border-bottom:1px solid #ddd;font:14px/1.4 system-ui;';
  banner.textContent = `${greeting}! Welcome to ${app.siteName}.`;
  document.body.prepend(banner);

  console.log(`[LABUBU] taxRate type is`, typeof app.taxRate); // number
  console.log(`[LABUBU] discount applies from`, app.discountThreshold, 'nights');

  /* =====================
   * Part 2 — Functions (Reusability)
   * ===================== */
  const formatCurrency = (n) => `${app.currency}${Number(n).toFixed(2)}`;

  function calculateTripTotal(pricePerNight, nights) {
    // Validate/normalize inputs (defensive programming)
    const p = Number(pricePerNight) || 0;
    const n = Math.max(1, Math.floor(Number(nights) || 1));

    const subtotal = p * n;                                   // operator: *
    const discount = n >= app.discountThreshold ? subtotal * app.discountRate : 0; // condition + operator
    const taxable = subtotal - discount;
    const vat = taxable * app.taxRate;
    const total = taxable + vat;

    return { subtotal, discount, vat, total, nights: n };
  }

  function toggleSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.hidden = !el.hidden;                                   // DOM update
  }

  function smoothScrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function getPasswordStrength(pass) {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const levels = ['Weak', 'Okay', 'Good', 'Strong'];
    const level = levels[Math.max(0, score - 1)];
    return { score, level, message: `Password strength: ${level}` };
  }

  /* =====================
   * Part 3 — Loops
   * ===================== */
  // A) Build a "Quick Trip Estimator" UI from the PRICES table rows
  const priceTable = document.querySelector('#pricelist table');
  if (priceTable) {
    const hotels = [];                                         // will hold parsed table data

    // Loop through rows to extract data
    const rows = priceTable.querySelectorAll('tr');
    rows.forEach((tr, idx) => {
      if (idx === 0) return; // skip header
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 4) {
        const name = tds[0].textContent.trim();
        const location = tds[1].textContent.trim();
        const nightsRange = tds[2].textContent.trim();
        const pricePerNight = parseFloat(tds[3].textContent.replace(/[^0-9.]/g, '')) || 0;
        hotels.push({ name, location, nightsRange, pricePerNight });

        // Click a row to preselect it in the estimator
        tr.style.cursor = 'pointer';
        tr.title = 'Click to estimate a trip for this hotel';
        tr.addEventListener('click', () => {
          const sel = document.getElementById('estimator-select');
          const nightsInput = document.getElementById('estimator-nights');
          if (sel && nightsInput) {
            sel.value = String(idx - 1);
            nightsInput.focus();
          }
        });
      }
    });

    // Build estimator widget
    const box = document.createElement('div');
    box.id = 'estimator';
    box.style.cssText = 'margin:16px 0;padding:16px;border:1px solid #ddd;border-radius:12px;background:#fafafa;';
    box.innerHTML = `
      <h3 style="margin:0 0 8px;">Quick Trip Estimator</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <label>Hotel:
          <select id="estimator-select" style="padding:6px;border:1px solid #ccc;border-radius:8px;"></select>
        </label>
        <label>Nights:
          <input id="estimator-nights" type="number" min="1" value="2" style="width:90px;padding:6px;border:1px solid #ccc;border-radius:8px;">
        </label>
        <button id="estimate-btn" type="button" style="padding:8px 14px;border:0;border-radius:10px;background:#111;color:#fff;cursor:pointer;">Estimate</button>
      </div>
      <div id="estimate-output" style="margin-top:10px;font:14px/1.5 system-ui;"></div>
      <small style="display:block;margin-top:8px;color:#555;">Discount: 10% for stays of ${app.discountThreshold}+ nights. VAT: ${(app.taxRate * 100).toFixed(0)}%.</small>
    `;

    priceTable.after(box);

    // Populate select (loop)
    const sel = document.getElementById('estimator-select');
    hotels.forEach((h, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${h.name} — ${formatCurrency(h.pricePerNight)}/night`;
      sel.appendChild(opt);
    });

    // Estimate button handler
    document.getElementById('estimate-btn').addEventListener('click', () => {
      const i = parseInt(sel.value, 10);
      const nights = parseInt(document.getElementById('estimator-nights').value, 10);
      const hotel = hotels[i];
      if (!hotel || !Number.isFinite(nights) || nights < 1) return;
      const { subtotal, discount, vat, total } = calculateTripTotal(hotel.pricePerNight, nights);
      const out = document.getElementById('estimate-output');
      out.textContent = `${hotel.name}: ${nights} night(s) ⇒ Subtotal ${formatCurrency(subtotal)}, Discount ${formatCurrency(discount)}, VAT ${formatCurrency(vat)} ⇒ Total ${formatCurrency(total)}`;
    });
  }

  // B) Generate a small tips list (array + forEach loop)
  const tips = [
    'Book early to lock better rates.',
    'Travel light to save time at airports.',
    'Keep digital copies of your documents.',
    'Tell your bank before using your card abroad.'
  ];
  const home = document.getElementById('home');
  if (home) {
    const tipsBox = document.createElement('div');
    tipsBox.style.cssText = 'margin:16px 0;padding:12px;border:1px dashed #bbb;border-radius:10px;';
    tipsBox.innerHTML = '<h3 style="margin:0 0 6px;">Quick Travel Tips</h3>';
    const ul = document.createElement('ul');
    tips.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    tipsBox.appendChild(ul);
    home.appendChild(tipsBox);
  }

  // C) Sweep images and ensure alt text (loop)
  document.querySelectorAll('img').forEach(img => {
    if (!img.alt || img.alt.trim() === '') img.alt = 'Travel image';
  });

  /* =====================
   * Part 4 — DOM: Events & Dynamic Updates
   * ===================== */
  // Smooth-scroll nav
  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      smoothScrollToId(id);
    });
  });

  // Add a toggle button for the ABOUT section
  const about = document.getElementById('about');
  if (about) {
    const btn = document.createElement('button');
    btn.textContent = 'Toggle About Text';
    btn.style.cssText = 'margin:8px 0;padding:8px 12px;border:0;border-radius:10px;background:#444;color:#fff;cursor:pointer;';
    btn.addEventListener('click', () => toggleSection('about'));
    about.prepend(btn);
  }

  // Registration form validation + live enhancements
  const form = document.querySelector('#registration form');
  if (form) {
    const pwd = form.querySelector('#password');
    const confirmPwd = form.querySelector('[id="confirm password"]'); // id contains a space
    const tel = form.querySelector('#contact');
    const dateInput = form.querySelector('[id="travel date"]');        // id contains a space

    // Error box
    const errors = document.createElement('div');
    errors.id = 'form-errors';
    errors.style.cssText = 'color:#c00;margin:6px 0;';
    form.prepend(errors);
    const showError = (msg) => { errors.textContent = msg; };
    const clearError = () => { errors.textContent = ''; };

    // Live password strength indicator
    const strengthEl = document.createElement('small');
    strengthEl.style.display = 'block';
    strengthEl.style.marginTop = '4px';
    pwd.after(strengthEl);
    pwd.addEventListener('input', () => {
      const { message, level } = getPasswordStrength(pwd.value);
      strengthEl.textContent = message;
      // Simple visual cue on the input border
      const colors = { Weak: '#c00', Okay: '#d98324', Good: '#1877f2', Strong: '#2a9d8f' };
      pwd.style.border = `2px solid ${colors[level] || '#ccc'}`;
    });

    // Countdown to selected travel date
    const countdownBox = document.createElement('div');
    countdownBox.id = 'countdown';
    countdownBox.style.cssText = 'margin:6px 0 0;color:#333;font-size:14px;';
    if (dateInput) dateInput.after(countdownBox);

    const updateCountdown = () => {
      if (!dateInput || !dateInput.value) { countdownBox.textContent = ''; return; }
      const target = new Date(`${dateInput.value}T00:00:00`);
      const now = new Date();
      const diff = target - now;
      if (Number.isNaN(target.getTime())) { countdownBox.textContent = ''; return; }
      if (diff <= 0) { countdownBox.textContent = 'Your travel date is today or in the past. Karibu safari!'; return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      countdownBox.textContent = `⏳ ${days} day(s) to your trip.`;
    };
    if (dateInput) {
      updateCountdown();
      dateInput.addEventListener('input', updateCountdown);
    }

    // Form submit validation
    form.addEventListener('submit', (e) => {
      clearError();

      // Passwords match?
      if (pwd && confirmPwd && pwd.value !== confirmPwd.value) {
        e.preventDefault();
        showError('Passwords do not match.');
        confirmPwd.focus();
        return;
      }

      // Phone format (very light validation)
      if (tel && !/^\+?\d{10,15}$/.test(tel.value.trim())) {
        e.preventDefault();
        showError('Enter a valid phone in international format, e.g., +254712345678.');
        tel.focus();
        return;
      }

      // Persist a tiny summary so you can show it later (localStorage demo)
      try {
        const summary = {
          name: form.fullname?.value?.trim() || '',
          email: form.email?.value?.trim() || '',
          contact: tel?.value?.trim() || '',
          travelDate: dateInput?.value || '',
          agent: form.agent?.value || ''
        };
        localStorage.setItem('labubu-registration', JSON.stringify(summary));
        // Friendly confirmation
        alert(`Asante, ${summary.name}! Your preferred date is ${summary.travelDate}. We\'ll email you at ${summary.email}.`);
      } catch (_) {
        // ignore storage errors
      }
    });
  }
});
