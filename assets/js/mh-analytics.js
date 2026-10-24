/* Mother Hospitals — GA4 conversion events + enquiry reference, loaded on every page.
 * phone_call_click  any tel: link        whatsapp_click  any WhatsApp link
 * `link_location` says where on the page the click happened, e.g. mobile_bar, hero, footer.
 * (Lead-form submissions already send `generate_lead` from the form script.)
 * WhatsApp links inside a free-tool result card are shares, not enquiries, and are skipped.
 *
 * Enquiry reference: each browser gets one random code (e.g. MH-7K2QX, no personal data).
 * It is added to the WhatsApp message the visitor sends, to every Google Form enquiry
 * (consultation forms and tool email requests), and to the GA4 events as `enquiry_ref`,
 * so online enquiries can be matched with clinic registrations.
 */
(function () {
  var AREAS = [
    ['.mh-mid-cta', 'blog_mid_cta'],
    ['.mob-cta-bar', 'mobile_bar'],
    ['.wa-float', 'whatsapp_float'],
    ['.top-bar', 'top_bar'],
    ['nav', 'header'],
    ['footer', 'footer'],
    ['.page-hero, .hero, section[style*="#2d1b3d"]', 'hero'],
    ['.cta-box, .cta-section, .cta-strip, .sticky-cta', 'cta_band'],
    ['form, .lead-form', 'form']
  ];
  var WA = /(^|\/\/)(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\b/;

  function locationOf(link) {
    for (var i = 0; i < AREAS.length; i++) {
      if (link.closest(AREAS[i][0])) return AREAS[i][1];
    }
    return 'content';
  }

  var ref = (function () {
    var k = 'mh_ref', v = null;
    try { v = localStorage.getItem(k); } catch (e) {}
    if (!v || !/^MH-[A-Z2-9]{5}$/.test(v)) {
      var a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', s = 'MH-';
      for (var i = 0; i < 5; i++) s += a.charAt(Math.floor(Math.random() * a.length));
      v = s;
      try { localStorage.setItem(k, v); } catch (e) {}
    }
    return v;
  })();
  window.MH_REF = ref;

  function pageName() {
    var t = (document.title || '').split(/\s[|–—-]\s/)[0].trim();
    return t.length > 45 ? t.slice(0, 44) + '…' : (t || location.pathname);
  }
  function tag() { return '(Ref ' + ref + ' · ' + pageName() + ')'; }

  /* WhatsApp: start the chat with the reference so reception sees where it came from */
  function addRefToWhatsApp(link) {
    try {
      var u = new URL(link.href);
      var t = u.searchParams.get('text');
      if (t && t.indexOf(ref) > -1) return;
      u.searchParams.set('text', (t ? t + ' ' : "Hi, I'd like to book a consultation at Mother Hospitals. ") + tag());
      link.href = u.toString();
    } catch (e) {}
  }

  /* Google Form enquiries: append the reference to the message field (entry.957846797) */
  var MSG = 'entry.957846797';
  if (window.fetch) {
    var origFetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : '';
        if (url.indexOf('docs.google.com/forms') > -1 && url.indexOf('formResponse') > -1) {
          if (init && init.body && typeof init.body.get === 'function') {
            if (String(init.body.get(MSG) || '').indexOf(ref) < 0) init.body.set(MSG, ((init.body.get(MSG) || '') + ' ' + tag()).trim());
          } else {
            var u = new URL(url), m = u.searchParams.get(MSG) || '';
            if (m.indexOf(ref) < 0) { u.searchParams.set(MSG, (m + ' ' + tag()).trim()); input = u.toString(); }
          }
        }
      } catch (e) {}
      return origFetch.call(this, input, init);
    };
  }

  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link) return;
    /* sharing a free-tool result with friends is not an enquiry (tool-card.js sends a 'share' event) */
    if (link.closest('.mhc')) return;
    var href = link.getAttribute('href') || '';
    var isWa = WA.test(href);
    if (isWa) addRefToWhatsApp(link);
    if (typeof window.gtag !== 'function') return;
    var event = href.indexOf('tel:') === 0 ? 'phone_call_click' : isWa ? 'whatsapp_click' : null;
    if (event) window.gtag('event', event, { link_location: locationOf(link), enquiry_ref: ref });
  }, true);
})();
