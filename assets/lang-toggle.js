(function () {
  'use strict';
  var STORAGE_KEY = 'mh_lang_pref';
  var NOTO_LOADED = false;

  function loadNotoTelugu() {
    if (NOTO_LOADED) return;
    NOTO_LOADED = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }

  window.switchLang = function (targetLang, clickedBtn) {
    if (targetLang === 'te') loadNotoTelugu();

    var allContent = document.querySelectorAll('.lang-content');
    var allBtns = document.querySelectorAll('.lang-btn');

    allContent.forEach(function (block) {
      block.classList.remove('lang-content--visible', 'lang-content--js-visible');
      block.classList.add('lang-content--hidden');
      block.setAttribute('aria-hidden', 'true');
    });

    var targetBlock = document.getElementById('content-' + targetLang);
    if (targetBlock) {
      targetBlock.classList.remove('lang-content--hidden');
      targetBlock.classList.add('lang-content--visible', 'lang-content--js-visible');
      targetBlock.setAttribute('aria-hidden', 'false');
    }

    allBtns.forEach(function (btn) {
      btn.classList.remove('lang-btn--active');
      btn.setAttribute('aria-pressed', 'false');
    });

    if (clickedBtn) {
      clickedBtn.classList.add('lang-btn--active');
      clickedBtn.setAttribute('aria-pressed', 'true');
    }

    try { localStorage.setItem(STORAGE_KEY, targetLang); } catch (e) {}

    document.documentElement.setAttribute('lang', targetLang === 'te' ? 'te' : 'en');

    if (typeof gtag !== 'undefined') {
      gtag('event', 'language_switch', {
        event_category: 'UX',
        event_label: targetLang,
        page_path: window.location.pathname
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var savedLang;
    try { savedLang = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (savedLang === 'te') {
      var teBlock = document.getElementById('content-te');
      var teBtn = document.querySelector('.lang-btn[data-lang="te"]');
      if (teBlock && teBlock.textContent.trim().length > 50) {
        switchLang('te', teBtn);
      }
    }
  });
})();
