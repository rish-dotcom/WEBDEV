const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// 1. Mobile menu
const nb = $('#navbtn');
if (nb) nb.onclick = () => nb.setAttribute('aria-expanded', $('#nav').classList.toggle('open'));

// 2. Monthly / yearly price toggle
const tg = $('#billing');
if (tg) {
  tg.onchange = () => {
    const y = tg.checked;
    $$('.price').forEach(p => p.textContent = '\u20B9' + Number(y ? p.dataset.y : p.dataset.m).toLocaleString('en-IN'));
    $$('.per').forEach(p => p.textContent = y ? '/year' : '/month');
    $('#lblM').classList.toggle('on', !y);
    $('#lblY').classList.toggle('on', y);
  };
  tg.onchange();
}

// 3. BMI calculator
const bf = $('#bmiForm');
if (bf) bf.onsubmit = e => {
  e.preventDefault();
  const h = +$('#bh').value / 100, w = +$('#bw').value, out = $('#bmiOut');
  if (!(h >= 0.5 && h <= 2.5 && w >= 10 && w <= 400)) {
    out.textContent = 'Enter height in cm (50 to 250) and weight in kg (10 to 400).';
    return;
  }
  const b = w / (h * h);
  const c = b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy weight' : b < 30 ? 'Overweight' : 'Obese';
  out.innerHTML = 'Your BMI is <strong>' + b.toFixed(1) + '</strong> (' + c + ')';
};

// 4. Calorie calculator (Mifflin-St Jeor)
const cf = $('#calForm');
if (cf) cf.onsubmit = e => {
  e.preventDefault();
  const a = +$('#ca').value, h = +$('#ch').value, w = +$('#cw').value, out = $('#calOut');
  if (!(a >= 14 && a <= 90 && h >= 100 && h <= 250 && w >= 25 && w <= 300)) {
    out.textContent = 'Enter a valid age, height (cm) and weight (kg).';
    return;
  }
  const bmr = 10 * w + 6.25 * h - 5 * a + ($('#cs').value === 'm' ? 5 : -161);
  const maint = bmr * +$('#cact').value;
  const target = maint + +$('#cg').value;
  out.innerHTML = 'Maintenance: <strong>' + Math.round(maint) + '</strong> kcal/day<br>Your target: <strong>' + Math.round(target) + '</strong> kcal/day';
};

// 5. Timetable filter by day
$$('.fbtn').forEach(b => b.onclick = () => {
  $$('.fbtn').forEach(x => x.classList.toggle('on', x === b));
  const d = b.dataset.day;
  $$('#tt tbody tr').forEach(r => r.hidden = d !== 'all' && r.dataset.day !== d);
});

// 6. Workout stopwatch
const sw = $('#swTime');
if (sw) {
  let st = 0, acc = 0, tm = null;
  const p = n => String(n).padStart(2, '0');
  const fmt = ms => p(Math.floor(ms / 60000)) + ':' + p(Math.floor(ms / 1000) % 60) + '.' + p(Math.floor(ms / 10) % 100);
  const cur = () => acc + (tm ? Date.now() - st : 0);
  const draw = () => sw.textContent = fmt(cur());
  $('#swStart').onclick = () => { if (!tm) { st = Date.now(); tm = setInterval(draw, 30); } };
  $('#swStop').onclick = () => { if (tm) { acc = cur(); clearInterval(tm); tm = null; draw(); } };
  $('#swLap').onclick = () => {
    if (!tm) return;
    const li = document.createElement('li');
    li.textContent = fmt(cur());
    $('#laps').prepend(li);
  };
  $('#swReset').onclick = () => { clearInterval(tm); tm = null; acc = 0; $('#laps').innerHTML = ''; draw(); };
}

// 7. Form validation (join-now and contact forms)
const rules = {
  name: v => v.trim().length >= 2 || 'Enter your full name.',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email address.',
  phone: v => /^[6-9]\d{9}$/.test(v) || 'Enter a 10-digit mobile number starting with 6 to 9.',
  plan: v => !!v || 'Choose a plan.',
  message: v => v.trim().length >= 10 || 'Write at least 10 characters.',
  terms: (v, el) => el.checked || 'Please accept the terms to continue.'
};
$$('form[data-validate]').forEach(f => {
  const check = el => {
    const rule = rules[el.name];
    if (!rule) return true;
    const res = rule(el.value, el);
    el.closest('.field').querySelector('.err').textContent = res === true ? '' : res;
    el.setAttribute('aria-invalid', res !== true);
    return res === true;
  };
  f.addEventListener('focusout', e => { if (e.target.name) check(e.target); });
  f.onsubmit = e => {
    e.preventDefault();
    const ok = $$('[name]', f).map(check).every(Boolean);
    $('.ok', f).hidden = !ok;
    if (ok) f.reset();
  };
});
