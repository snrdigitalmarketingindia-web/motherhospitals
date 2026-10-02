/* Mother Hospitals — yearly greeting ribbon.
 * Shows automatically every year inside each event's date window (India time),
 * then hides itself. To add an occasion, add an entry to EVENTS.
 * Preview any day with ?season=<id>, e.g. /?season=independence-day
 */
(function () {
  var EVENTS = [
    {
      id: 'independence-day',
      from: '08-15', to: '08-16',            // MM-DD, inclusive, IST
      theme: 'tricolor',
      title: 'Happy Independence Day!',
      message: 'Every life born free is India’s greatest strength.',
      signature: '— Mother Hospitals & IVF Center'
    }
  ];

  var ist = new Date(Date.now() + 330 * 60000);   // UTC -> IST, read with getUTC*
  var today = ('0' + (ist.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + ist.getUTCDate()).slice(-2);
  var forced = (location.search.match(/[?&]season=([\w-]+)/) || [])[1];

  function inWindow(e) {
    return e.from <= e.to ? today >= e.from && today <= e.to : today >= e.from || today <= e.to;
  }
  var ev = EVENTS.filter(function (e) { return forced ? e.id === forced : inWindow(e); })[0];
  if (!ev) return;

  var key = 'mh-season-' + ev.id + '-' + ist.getUTCFullYear();
  if (!forced) {
    try { if (localStorage.getItem(key)) return; } catch (err) {}
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  var bar = el('div', 'mh-season mh-season--' + ev.theme);
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', ev.title);
  var inner = el('div', 'mh-season-inner');

  if (ev.theme === 'tricolor') {
    var flag = el('span', 'mh-season-flag', '🇮🇳');
    flag.setAttribute('aria-hidden', 'true');
    inner.appendChild(flag);
  }
  var text = el('p', 'mh-season-text');
  text.appendChild(el('strong', 'mh-season-title', ev.title));
  text.appendChild(document.createTextNode(' '));
  text.appendChild(el('span', 'mh-season-msg', ev.message));
  text.appendChild(document.createTextNode(' '));
  text.appendChild(el('span', 'mh-season-sig', ev.signature));
  inner.appendChild(text);

  if (ev.theme === 'tricolor') {
    var spokes = '';
    for (var i = 0; i < 24; i++) spokes += '<line x1="12" y1="12" x2="12" y2="2.6" transform="rotate(' + i * 15 + ' 12 12)"/>';
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
