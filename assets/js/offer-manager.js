/**
 * MOTHER HOSPITALS — OFFER MANAGER
 * ==================================
 * Reads window.MH_OFFERS (defined in offer-config.js),
 * finds the highest-priority active offer, and injects
 * UI into the page — no template edits required.
 *
 * Inject points:
 *   top_banner  → <div id="mh-offer-banner"> injected before <nav>
 *   navbar      → <li> injected into .nav-links + link into .mob-menu
 *   popup       → <div id="mh-offer-popup"> appended to <body>
 *
 * Session storage key: "mh_popup_dismissed_<offer_id>"
 * Banner dismiss key:  "mh_banner_dismissed_<offer_id>"
 */

(function () {
  'use strict';

  /* ── 1. Find active offer ─────────────────────────────────────────────── */
  function getActiveOffer() {
    var offers = window.MH_OFFERS;
    if (!offers || !offers.length) return null;

    var now = new Date();
    var active = offers.filter(function (o) {
      if (!o.enabled) return false;
      var start = new Date(o.start_datetime);
      var end   = new Date(o.end_datetime);
      return now >= start && now <= end;
    });

    if (!active.length) return null;

    /* highest priority first */
    active.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
    return active[0];
  }

  /* ── 2. Top banner ───────────────────────────────────────────────────── */
  function injectBanner(offer) {
    var dismissKey = 'mh_banner_dismissed_' + offer.id;
    if (sessionStorage.getItem(dismissKey)) return;

    var banner = document.createElement('div');
    banner.id        = 'mh-offer-banner';
    banner.className = 'offer-banner';
    banner.setAttribute('role', 'banner');
    banner.innerHTML =
      '<div class="offer-inner">' +
        '<span class="offer-badge">' + _esc(offer.badge) + '</span>' +
        '<span class="offer-text">' + _esc(offer.title) + '</span>' +
        '<span class="offer-detail">' + _esc(offer.description) + '</span>' +
        '<a href="' + _esc(offer.cta_url) + '" class="offer-cta">' + _esc(offer.cta_text) + '</a>' +
        '<button class="offer-close" aria-label="Dismiss offer" onclick="' +
          'sessionStorage.setItem(\'mh_banner_dismissed_' + offer.id + '\',\'1\');' +
          'document.getElementById(\'mh-offer-banner\').remove()' +
        '">✕</button>' +
      '</div>';

    /* insert after .trust-bar (original position on site), fallback to before <nav> */
    var trustBar = document.querySelector('.trust-bar');
    if (trustBar && trustBar.nextSibling) {
      trustBar.parentNode.insertBefore(banner, trustBar.nextSibling);
    } else {
      var nav = document.querySelector('nav');
      nav ? nav.parentNode.insertBefore(banner, nav) : document.body.insertBefore(banner, document.body.firstChild);
    }
  }

  /* ── 3. Navbar item ──────────────────────────────────────────────────── */
  function injectNavbar(offer) {
    /* desktop nav */
    var navLinks = document.querySelector('nav .nav-links');
    if (navLinks) {
      var li = document.createElement('li');
      li.innerHTML =
        '<a href="' + _esc(offer.cta_url) + '" class="offer-nav-link">' +
          '🎁 ' + _esc(offer.title) +
        '</a>';
      /* insert before the last item (WhatsApp button) */
      var lastItem = navLinks.querySelector('li:last-child');
      navLinks.insertBefore(li, lastItem);
    }

    /* mobile menu */
    var mobMenu = document.querySelector('nav .mob-menu');
    if (mobMenu) {
      var a = document.createElement('a');
      a.href      = offer.cta_url;
      a.className = 'offer-mob-link';
      a.textContent = '🎁 ' + offer.title;
      mobMenu.insertBefore(a, mobMenu.firstChild);
    }
  }

  /* ── 4. Popup ────────────────────────────────────────────────────────── */
  function injectPopup(offer) {
    var dismissKey = 'mh_popup_dismissed_' + offer.id;
    if (sessionStorage.getItem(dismissKey)) return;

    setTimeout(function () {
      /* don't show if user has already scrolled deep (engaged) */
      var scrollPct = (window.scrollY || 0) / Math.max(document.body.scrollHeight - window.innerHeight, 1);
      if (scrollPct > 0.6) return;

      var popup = document.createElement('div');
      popup.id        = 'mh-offer-popup';
      popup.className = 'offer-popup-overlay';
      popup.setAttribute('role', 'dialog');
      popup.setAttribute('aria-modal', 'true');
      popup.innerHTML =
        '<div class="offer-popup-card">' +
          '<button class="offer-popup-close" aria-label="Close" onclick="MHOfferManager.closePopup(\'' + offer.id + '\')">&times;</button>' +
          '<div class="offer-popup-badge">' + _esc(offer.badge) + '</div>' +
          '<h2 class="offer-popup-title">' + _esc(offer.title) + '</h2>' +
          (offer.popup_subtitle ? '<p class="offer-popup-sub">' + _esc(offer.popup_subtitle) + '</p>' : '') +
          '<p class="offer-popup-desc">' + _esc(offer.description) + '</p>' +
          '<a href="' + _esc(offer.cta_url) + '" class="offer-popup-cta" onclick="MHOfferManager.closePopup(\'' + offer.id + '\')">' +
            _esc(offer.cta_text) +
          '</a>' +
          '<p class="offer-popup-dismiss"><button onclick="MHOfferManager.closePopup(\'' + offer.id + '\')">No thanks, maybe later</button></p>' +
        '</div>';

      /* close on backdrop click */
      popup.addEventListener('click', function (e) {
        if (e.target === popup) MHOfferManager.closePopup(offer.id);
      });

      document.body.appendChild(popup);
      /* animate in */
      requestAnimationFrame(function () { popup.classList.add('offer-popup-visible'); });

    }, offer.popup_delay_ms || 4000);
  }

  /* ── 5. Public API ───────────────────────────────────────────────────── */
  window.MHOfferManager = {
    closePopup: function (offerId) {
      sessionStorage.setItem('mh_popup_dismissed_' + offerId, '1');
      var el = document.getElementById('mh-offer-popup');
      if (el) { el.classList.remove('offer-popup-visible'); setTimeout(function () { el.remove(); }, 300); }
    }
  };

  /* ── 6. Bootstrap ────────────────────────────────────────────────────── */
  function init() {
    var offer = getActiveOffer();
    if (!offer) return; /* no active offer → nothing injected, layout stays clean */

    var locs = offer.display_locations || [];
    if (locs.indexOf('top_banner') !== -1) injectBanner(offer);
    if (locs.indexOf('navbar')     !== -1) injectNavbar(offer);
    if (locs.indexOf('popup')      !== -1) injectPopup(offer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Utility ─────────────────────────────────────────────────────────── */
  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
