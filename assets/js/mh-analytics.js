/* Mother Hospitals — GA4 conversion events, loaded on every page.
 * phone_call_click  any tel: link        whatsapp_click  any WhatsApp link
 * `link_location` says where on the page the click happened, e.g. mobile_bar, hero, footer.
 * (Lead-form submissions already send `generate_lead` from the form script.)
 */
(function () {
  var AREAS = [
    ['.mob-cta-bar', 'mobile_bar'],
    ['.wa-float', 'whatsapp_float'],
    ['.top-bar', 'top_bar'],
    ['nav', 'header'],
    ['footer', 'footer'],
    ['.page-hero, .hero, section[style*="#2d1b3d"]', 'hero'],
    ['.cta-box, .cta-section, .cta-strip, .sticky-cta', 'cta_band'],
    ['form, .lead-form', 'form']
  ];

  function locationOf(link) {
    for (var i = 0; i < AREAS.length; i++) {
      if (link.closest(AREAS[i][0])) return AREAS[i][1];
    }
    return 'content';
  }

  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link || typeof window.gtag !== 'function') return;
    var href = link.getAttribute('href') || '';
    var event = href.indexOf('tel:') === 0 ? 'phone_call_click'
      : /(^|\/\/)(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\b/.test(href) ? 'whatsapp_click' : null;
    if (event) window.gtag('event', event, { link_location: locationOf(link) });
  }, true);
})();
