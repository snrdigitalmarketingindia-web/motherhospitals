/**
 * Mother Hospitals — i18n Engine
 * English <-> Telugu toggle for all fertility tool pages
 * Language stored in localStorage key: mh_lang
 */
(function(){
  'use strict';
  var I18n = window.I18n = {
    lang: localStorage.getItem('mh_lang') || 'en',
    t: function(key){
      var T = window.pageT;
      if(!T) return key;
      return (T[this.lang] && T[this.lang][key]) ? T[this.lang][key]
           : (T['en']      && T['en'][key])      ? T['en'][key]
           : key;
    },
    apply: function(){
      var self = this;
      document.querySelectorAll('[data-i18n]').forEach(function(el){
        var v = self.t(el.getAttribute('data-i18n'));
        if(v) el.innerHTML = v;
      });
      document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
        var v = self.t(el.getAttribute('data-i18n-ph'));
        if(v) el.placeholder = v;
      });
      document.querySelectorAll('[data-lang]').forEach(function(el){
        el.style.display = (el.getAttribute('data-lang') === self.lang) ? '' : 'none';
      });
      document.documentElement.lang = this.lang === 'te' ? 'te' : 'en';
      this._updateToggle();
    },
    setLang: function(l){
      this.lang = l;
      localStorage.setItem('mh_lang', l);
      this.apply();
      if(window._reapplyResults) window._reapplyResults();
    },
    _injectToggle: function(){
      if(document.getElementById('mh-lang-toggle')) return;
      var s = document.createElement('style');
      s.textContent = '.lang-toggle-bar{background:#f8f4ff;border-bottom:1px solid #e0d0f0;padding:0.35rem 5%;display:flex;align-items:center;justify-content:flex-end;gap:0.5rem}.lang-toggle{display:inline-flex;align-items:center;background:#fff;border:2px solid #c8a8e0;border-radius:50px;overflow:hidden}.lang-btn{background:none;border:none;padding:0.3rem 1rem;font-size:0.8rem;font-weight:700;cursor:pointer;color:#6a3a8a;font-family:inherit;transition:all 0.18s}.lang-btn.active{background:#7b2fa0;color:#fff}.lang-label{font-size:0.75rem;color:#6a3a8a;font-weight:600;margin-right:0.3rem}';
      document.head.appendChild(s);
      var bar = document.createElement('div');
      bar.id = 'mh-lang-toggle';
      bar.className = 'lang-toggle-bar';
      bar.innerHTML = '<span class="lang-label">&#127760; Language / భాష:</span><div class="lang-toggle"><button class="lang-btn" id="btn-lang-en" onclick="I18n.setLang(\'en\')">English</button><button class="lang-btn" id="btn-lang-te" onclick="I18n.setLang(\'te\')">&#3108;&#3142;&#3122;&#3137;&#3095;&#3137;</button></div>';
      var nav = document.querySelector('nav');
      if(nav) nav.insertAdjacentElement('afterend', bar);
      else document.body.insertAdjacentElement('afterbegin', bar);
    },
    _updateToggle: function(){
      var en = document.getElementById('btn-lang-en');
      var te = document.getElementById('btn-lang-te');
      if(en) en.classList.toggle('active', this.lang==='en');
      if(te) te.classList.toggle('active', this.lang==='te');
    },
    init: function(){
      var self = this;
      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ self._injectToggle(); self.apply(); });
      else { self._injectToggle(); self.apply(); }
    }
  };
  window.t = function(key){ return I18n.t(key); };
  I18n.init();
})();
