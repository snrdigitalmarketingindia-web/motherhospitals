/* Mother Hospitals — festival & national-day greeting ribbon.
 *
 * Each greeting shows automatically inside its window (India time) and hides afterwards.
 * - `every: 'MM-DD'`  fixed-date days, repeat every year.
 * - `on: {year: 'MM-DD' | ['MM-DD', days]}`  lunar festivals move every year, so their
 *   start dates are listed per year (source: Drik Panchang, computed for Hyderabad).
 *   Add the next years before the table runs out — it currently ends in 2030.
 * - `nth: {month, weekday, n}`  rule-based days, e.g. Mother's Day = 2nd Sunday of May
 *   (weekday 0 = Sunday); computed every year.
 * - `days`  window length; earlier entries win when two windows overlap.
 *
 * Preview a greeting:  ?season=<id>          Simulate a date:  ?season-date=YYYY-MM-DD
 */
(function () {
  var SIGNATURE = '— Mother Hospitals & IVF Center';
  var EVENTS = [
    { id: 'republic-day', theme: 'tricolor', every: '01-26', days: 1,
      title: 'Happy Republic Day!', native: 'గణతంత్ర దినోత్సవ శుభాకాంక్షలు',
      message: 'Celebrating the spirit of our Republic — with care for every family.' },
    { id: 'independence-day', theme: 'tricolor', every: '08-15', days: 2,
      title: 'Happy Independence Day!', native: 'స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు',
      message: 'Every life born free is India’s greatest strength.' },
    { id: 'gandhi-jayanti', theme: 'tricolor', every: '10-02', days: 1,
      title: 'Gandhi Jayanti', native: 'గాంధీ జయంతి',
      message: 'Remembering Bapu — truth, non-violence and selfless service.' },
    { id: 'telangana-day', theme: 'tangedu', icon: '🌼', every: '06-02', days: 1,
      title: 'Happy Telangana Formation Day!', native: 'తెలంగాణ రాష్ట్ర ఆవిర్భావ దినోత్సవ శుభాకాంక్షలు',
      message: 'Proud to care for the families of Telangana.' },


    { id: 'womens-day', theme: 'womens', icon: '💜', every: '03-08', days: 1,
      title: 'Happy Women’s Day!', native: 'మహిళా దినోత్సవ శుభాకాంక్షలు',
      message: 'Celebrating every woman — her strength, her health and her dreams.' },
    { id: 'mothers-day', theme: 'mothers', icon: '💐', nth: { month: 5, weekday: 0, n: 2 }, days: 1,
      title: 'Happy Mother’s Day!', native: 'మాతృ దినోత్సవ శుభాకాంక్షలు',
      message: 'Celebrating every mother — and every woman on her journey to motherhood.' },
    { id: 'doctors-day', theme: 'doctors', icon: '🩺', every: '07-01', days: 1,
      title: 'Happy Doctors’ Day!', native: 'వైద్యుల దినోత్సవ శుభాకాంక్షలు',
      message: 'Thank you to every doctor who puts patients first.' },
    { id: 'world-ivf-day', theme: 'ivf', icon: '👶', every: '07-25', days: 1,
      title: 'Happy World IVF Day!', native: 'ప్రపంచ IVF దినోత్సవ శుభాకాంక్షలు',
      message: 'Since 1978, IVF has given millions of families their miracle — here’s to hope.' },

    { id: 'sankranti', theme: 'sankranti', icon: '🪁', days: 3,          /* Bhogi → Kanuma */
      on: { 2026: '01-13', 2027: '01-14', 2028: '01-14', 2029: '01-13', 2030: '01-13' },
      title: 'Happy Sankranti!', native: 'సంక్రాంతి శుభాకాంక్షలు',
      message: 'May the harvest festival fill your home with joy, health and togetherness.' },
    { id: 'ugadi', theme: 'ugadi', icon: '🌿', days: 1,
      on: { 2026: '03-19', 2027: '04-07', 2028: '03-27', 2029: '04-14', 2030: '04-03' },
      title: 'Happy Ugadi!', native: 'ఉగాది శుభాకాంక్షలు',
      message: 'Wishing you a new year of new beginnings, good health and happiness.' },
    { id: 'bathukamma', theme: 'bathukamma', icon: '🌸',               /* Engili Pula → Saddula */
      on: { 2026: ['10-10', 10], 2027: ['09-29', 9], 2028: ['09-18', 9], 2029: ['10-07', 8], 2030: ['09-27', 8] },
      title: 'Happy Bathukamma!', native: 'బతుకమ్మ పండుగ శుభాకాంక్షలు',
      message: 'Celebrating the women of Telangana — life, colour and togetherness.' },
    { id: 'bonalu', theme: 'bonalu', icon: '🪔',                     /* Lashkar Bonalu → Monday after the last Ashada Sunday */
      on: { 2027: ['07-25', 9] },                                      /* dates are announced each June — add the next year then */
      title: 'Happy Bonalu!', native: 'బోనాల పండుగ శుభాకాంక్షలు',
      message: 'May Goddess Mahankali bless every family with health and happiness.' },
    { id: 'dasara', theme: 'dasara', icon: '🏹', days: 2,               /* Navami → Vijayadashami */
      on: { 2026: '10-19', 2027: '10-08', 2028: '09-26', 2029: '10-15', 2030: '10-05' },
      title: 'Happy Dasara!', native: 'దసరా శుభాకాంక్షలు',
      message: 'May the victory of good over evil bring strength and hope to your family.' },
    { id: 'deepavali', theme: 'diya', icon: '🪔', days: 2,              /* Naraka Chaturdashi eve → Deepavali */
      on: { 2026: '11-07', 2027: '10-28', 2028: '10-16', 2029: '11-04', 2030: '10-25' },
      title: 'Happy Deepavali!', native: 'దీపావళి శుభాకాంక్షలు',
      message: 'May the festival of lights fill your home with joy, health and new beginnings.' },
    { id: 'vinayaka-chavithi', theme: 'ganesha', icon: '🙏', days: 1,
      on: { 2026: '09-14', 2027: '09-04', 2028: '08-23', 2029: '09-11', 2030: '09-01' },
      title: 'Happy Vinayaka Chavithi!', native: 'వినాయక చవితి శుభాకాంక్షలు',
      message: 'May Lord Ganesha remove every obstacle on your path to a happy family.' },
    { id: 'rama-navami', theme: 'rama', icon: '🚩', days: 1,
      on: { 2026: '03-26', 2027: '04-15', 2028: '04-03', 2029: '04-23', 2030: '04-12' },
      title: 'Happy Sri Rama Navami!', native: 'శ్రీ రామ నవమి శుభాకాంక్షలు',
      message: 'May Lord Rama bless your family with health, harmony and happiness.' },
    { id: 'varalakshmi-vratham', theme: 'lakshmi', icon: '🪷', days: 1,
      on: { 2026: '08-28', 2027: '08-13', 2028: '08-04', 2029: '08-24', 2030: '08-09' },
      title: 'Varalakshmi Vratham', native: 'వరలక్ష్మీ వ్రతం శుభాకాంక్షలు',
      message: 'May Goddess Lakshmi bless every woman with health, prosperity and happiness.' },
    { id: 'raksha-bandhan', theme: 'rakhi', icon: '🎀', days: 1,
      on: { 2026: '08-28', 2027: '08-17', 2028: '08-05', 2029: '08-23', 2030: '08-13' },
      title: 'Happy Raksha Bandhan!', native: 'రాఖీ పండుగ శుభాకాంక్షలు',
      message: 'Celebrating the bond of love and care between brothers and sisters.' },
    { id: 'janmashtami', theme: 'krishna', icon: '🦚', days: 1,
      on: { 2026: '09-04', 2027: '08-25', 2028: '08-13', 2029: '09-01', 2030: '08-21' },
      title: 'Happy Krishna Janmashtami!', native: 'శ్రీ కృష్ణ జన్మాష్టమి శుభాకాంక్షలు',
      message: 'May the joy of little Krishna fill every home.' },
    { id: 'maha-shivaratri', theme: 'shiva', icon: '🔱', days: 1,
      on: { 2026: '02-15', 2027: '03-06', 2028: '02-23', 2029: '02-11', 2030: '03-02' },
      title: 'Happy Maha Shivaratri!', native: 'మహా శివరాత్రి శుభాకాంక్షలు',
      message: 'May Lord Shiva bless you with peace, strength and good health.' },
    { id: 'holi', theme: 'holi', icon: '🎨', days: 1,
      on: { 2026: '03-04', 2027: '03-22', 2028: '03-11', 2029: '03-01', 2030: '03-20' },
      title: 'Happy Holi!', native: 'హోలీ శుభాకాంక్షలు',
      message: 'Wishing you a season of colour, laughter and good health.' },
    { id: 'karthika-pournami', theme: 'diya', icon: '🌕', days: 1,
      on: { 2026: '11-24', 2027: '11-14', 2028: '11-02', 2029: '11-21', 2030: '11-10' },
      title: 'Karthika Pournami', native: 'కార్తీక పౌర్ణమి శుభాకాంక్షలు',
      message: 'May the light of the Karthika deepam bring peace and good health to your home.' },
    { id: 'eid-ul-fitr', theme: 'eid', icon: '🌙', days: 3,             /* moon-sighting: eve → day after */
      on: { 2027: '03-09', 2028: '02-26', 2029: '02-14', 2030: '02-04' },
      title: 'Eid Mubarak!', native: 'عید مبارک',
      message: 'Wishing you and your family peace, joy and good health.' },
    { id: 'bakrid', theme: 'eid', icon: '🌙', days: 3,
      on: { 2027: '05-16', 2028: '05-04', 2029: '04-23', 2030: '04-13' },
      title: 'Eid al-Adha Mubarak!', native: 'عید الاضحیٰ مبارک',
      message: 'May this Eid bring peace, togetherness and good health to your family.' },
    { id: 'girl-child-day', theme: 'girlchild', icon: '👧', every: '01-24', days: 1,
      title: 'National Girl Child Day', native: 'జాతీయ బాలికా దినోత్సవం',
      message: 'Every girl deserves health, education and equal opportunity.' },
    { id: 'world-health-day', theme: 'health', icon: '🌍', every: '04-07', days: 1,
      title: 'World Health Day', native: 'ప్రపంచ ఆరోగ్య దినోత్సవం',
      message: 'Good health is the foundation of every happy family.' },
    { id: 'safe-motherhood-day', theme: 'mothers', icon: '🤰', every: '04-11', days: 1,
      title: 'National Safe Motherhood Day', native: 'జాతీయ సురక్షిత మాతృత్వ దినోత్సవం',
      message: 'Every mother deserves safe, respectful care — before, during and after birth.' },
    { id: 'nurses-day', theme: 'doctors', icon: '💙', every: '05-12', days: 1,
      title: 'International Nurses Day', native: 'అంతర్జాతీయ నర్సుల దినోత్సవం',
      message: 'Thank you to every nurse whose care makes healing possible.' },
    { id: 'menstrual-hygiene-day', theme: 'womens', icon: '🌷', every: '05-28', days: 1,
      title: 'Menstrual Hygiene Day', native: 'Periods గురించి మాట్లాడటం సిగ్గు కాదు',
      message: 'Period health is women’s health — let’s talk about it openly.' },
    { id: 'fathers-day', theme: 'fathers', icon: '👔', nth: { month: 6, weekday: 0, n: 3 }, days: 1,
      title: 'Happy Father’s Day!', native: 'పితృ దినోత్సవ శుభాకాంక్షలు',
      message: 'Celebrating every father — and every man on his journey to fatherhood.' },
    { id: 'breastfeeding-week', theme: 'mothers', icon: '🤱', every: '08-01', days: 7,
      title: 'World Breastfeeding Week', native: 'ప్రపంచ తల్లిపాల వారోత్సవాలు',
      message: 'Mother’s milk is a baby’s first protection — every mother deserves support.' },
    { id: 'menopause-day', theme: 'womens', icon: '🌺', every: '10-18', days: 1,
      title: 'World Menopause Day', native: 'Menopause గురించి awareness పెంచుదాం',
      message: 'Menopause is a new chapter — every woman deserves care and understanding.' },
    { id: 'childrens-day', theme: 'kids', icon: '🧸', every: '11-14', days: 1,
      title: 'Happy Children’s Day!', native: 'బాలల దినోత్సవ శుభాకాంక్షలు',
      message: 'Every child is a miracle — here’s to healthy, happy childhoods.' },
    { id: 'prematurity-day', theme: 'ivf', icon: '🍼', every: '11-17', days: 1,
      title: 'World Prematurity Day', native: 'Premature babies చిన్నవాళ్ళు, కానీ పెద్ద fighters',
      message: 'Honouring every little fighter born too soon — and the families who stand by them.' },
    { id: 'mens-day', theme: 'fathers', icon: '💙', every: '11-19', days: 1,
      title: 'International Men’s Day', native: 'అంతర్జాతీయ పురుషుల దినోత్సవం',
      message: 'Men’s health matters too — including fertility. Here’s to every man’s wellbeing.' },
    { id: 'christmas', theme: 'christmas', icon: '🎄', every: '12-24', days: 2,
      title: 'Merry Christmas!', native: 'క్రిస్మస్ శుభాకాంక్షలు',
      message: 'Wishing you joy, peace and good health this season.' },
    { id: 'new-year', theme: 'newyear', icon: '✨', every: '01-01', days: 1,
      title: 'Happy New Year!', native: 'నూతన సంవత్సర శుభాకాంక్షలు',
      message: 'Wishing you a healthy and happy year ahead.' }
  ];

  var DAY = 86400000;
  var query = location.search;
  var forcedId = (query.match(/[?&]season=([\w-]+)/) || [])[1];
  var simulated = (query.match(/[?&]season-date=(\d{4})-(\d{2})-(\d{2})/) || []);
  var today;
  if (simulated.length) {
    today = Date.UTC(+simulated[1], +simulated[2] - 1, +simulated[3]);
  } else {
    var ist = new Date(Date.now() + 330 * 60000);            // UTC → IST, read with getUTC*
    today = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  }
  var year = new Date(today).getUTCFullYear();

  function windowFor(e, y) {
    var start, days = e.days;
    if (e.nth) {
      var first = new Date(Date.UTC(y, e.nth.month - 1, 1)).getUTCDay();
      start = Date.UTC(y, e.nth.month - 1, 1 + (e.nth.weekday - first + 7) % 7 + (e.nth.n - 1) * 7);
    } else {
      var spec = e.every || (e.on && e.on[y]);
      if (!spec) return null;
      var md = Array.isArray(spec) ? spec[0] : spec;
      if (Array.isArray(spec)) days = spec[1];
      start = Date.UTC(y, +md.slice(0, 2) - 1, +md.slice(3, 5));
    }
    return { start: start, end: start + (days - 1) * DAY, year: y };
  }

  var ev = null, win = null;
  for (var i = 0; i < EVENTS.length && !ev; i++) {
    if (forcedId) {
      if (EVENTS[i].id === forcedId) { ev = EVENTS[i]; win = { year: year }; }
      continue;
    }
    for (var y = year - 1; y <= year; y++) {
      var w = windowFor(EVENTS[i], y);
      if (w && today >= w.start && today <= w.end) { ev = EVENTS[i]; win = w; break; }
    }
  }
  if (!ev) return;

  var key = 'mh-season-' + ev.id + '-' + win.year;
  if (!forcedId && !simulated.length) {
    try { if (localStorage.getItem(key)) return; } catch (err) {}
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  var tricolor = ev.theme === 'tricolor';
  var bar = el('div', 'mh-season mh-season--' + ev.theme + (ev.native ? ' has-native' : ''));
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', ev.title);
  bar.setAttribute('data-season', ev.id);
  var inner = el('div', 'mh-season-inner');

  var icon = el('span', 'mh-season-icon', tricolor ? '🇮🇳' : ev.icon);
  icon.setAttribute('aria-hidden', 'true');
  inner.appendChild(icon);

  var text = el('p', 'mh-season-text');
  text.appendChild(el('strong', 'mh-season-title', ev.title));
  if (ev.native) {
    var nat = el('span', 'mh-season-native', ev.native);
    nat.setAttribute('dir', 'auto');
    var sep = el('span', 'mh-season-sep', '·');
    sep.setAttribute('aria-hidden', 'true');
    text.appendChild(sep);
    text.appendChild(nat);
  }
  text.appendChild(document.createTextNode(' '));
  text.appendChild(el('span', 'mh-season-msg', ev.message));
  text.appendChild(document.createTextNode(' '));
  text.appendChild(el('span', 'mh-season-sig', SIGNATURE));
  inner.appendChild(text);

  if (tricolor) {
    var spokes = '';
    for (var s = 0; s < 24; s++) spokes += '<line x1="12" y1="12" x2="12" y2="2.6" transform="rotate(' + s * 15 + ' 12 12)"/>';
    var chakra = el('span', 'mh-season-chakra');
    chakra.setAttribute('aria-hidden', 'true');
    chakra.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><g fill="none" stroke="currentColor" stroke-width="0.9">' +
      '<circle cx="12" cy="12" r="10.2" stroke-width="1.4"/>' + spokes + '</g><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>';
    inner.appendChild(chakra);
  }

  var close = el('button', 'mh-season-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close greeting');
  close.addEventListener('click', function () {
    bar.parentNode.removeChild(bar);
    try { localStorage.setItem(key, '1'); } catch (err) {}
  });

  bar.appendChild(el('span', 'mh-season-shine'));
  bar.appendChild(inner);
  bar.appendChild(close);

  var skip = document.querySelector('a[href="#main-content"]');
  if (skip && skip.parentNode === document.body) skip.insertAdjacentElement('afterend', bar);
  else document.body.insertBefore(bar, document.body.firstChild);
})();
