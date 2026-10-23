/* Mother Hospitals — free fertility tools: usage + optional "email me my result".
 * - Every calculation sends only an anonymous GA event (tool_used). No inputs or results leave the browser.
 * - After a result, an optional box lets the visitor ask for their result by email. Only if they enter an
 *   email AND tick consent do we send name, email, tool, their inputs/result summary and the consent record
 *   to the clinic's Google Form (same sheet as consultation enquiries; filter column 3 = "<tool> — email request").
 * - Nothing here sends email. The clinic team replies from the sheet.
 */
(function(){
  var FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSeApfdnBsBjsoqIU3teeS062EEfuprY-CY8riVIWM8aY0LL9A/formResponse';

  /* inputs to include in the result summary, per tool page slug */
  var TOOL_MAP = {
    'period-tracker':            {label:'Period Tracker',       ids:['lmp','cycle','period']},
    'ovulation-calculator':      {label:'Ovulation Calculator', ids:['lmp','cycle']},
    'fertility-window-planner':  {label:'Fertility Window Planner', ids:['lmp','cycle']},
    'best-days-to-conceive':     {label:'Best Days to Conceive', ids:['lmp','cycle']},
    'ivf-success-estimator':     {label:'IVF Success Estimator', ids:['ivfAge','ivfAMH','prevCycles','bmiCat']},
    'ivf-timeline-planner':      {label:'IVF Timeline Planner', ids:['startDate','protocol']},
    'due-date-calculator':       {label:'Due Date Calculator',  ids:['dateMode','mainDate','usWeeks']},
    'endometrial-thickness-calculator': {label:'Endometrial Thickness', ids:['thickness','phase']},
    'conception-calculator':     {label:'Conception Calculator', ids:['dueDate']},
    'pregnancy-week-tracker':    {label:'Pregnancy Week Tracker', ids:['trackMode','trackDate','manualWeeks','manualDays']},
    'semen-analysis-interpreter':{label:'Semen Analysis',       ids:['vol','conc','totMot','progMot','morph','dfi']},
    'amh-interpreter':           {label:'AMH Interpreter',      ids:['amhVal','amhUnit','amhAge']},
    'pcos-assessment':           {label:'PCOS Assessment',      ids:[]},
    'fertility-assessment':      {label:'Fertility Assessment',  ids:[]},
    'bmi-fertility-calculator':  {label:'BMI & Fertility',       ids:['weightKg','heightCm','weightLbs','heightFt','heightIn']}
  };

  function val(id){
    var el = document.getElementById(id);
    if(!el) return null;
    if(el.type === 'checkbox') return el.checked ? 'yes' : 'no';
    var v = el.value;
    return (v && v.trim()) ? v.trim() : null;
  }

  function summary(tool){
    var parts = [];
    tool.ids.forEach(function(id){ var v = val(id); if(v) parts.push(id + ': ' + v); });
    var chips = document.querySelectorAll('.checkbox-chip.checked');
    if(chips.length){ var dx = []; chips.forEach(function(c){ dx.push(c.textContent.trim()); }); parts.push('Diagnoses: ' + dx.join(', ')); }
    if(!tool.ids.length){
      var answered = [];
      document.querySelectorAll('select,input[type=radio]:checked').forEach(function(el){ if(el.value && el.id) answered.push(el.id + ':' + el.value); });
      if(answered.length) parts.push(answered.slice(0,8).join(' | '));
    }
    var res = document.querySelector('.result-box, #result, .results, .result');
    var resText = res ? (res.innerText || '').replace(/\s+/g,' ').trim().slice(0, 600) : '';
    return (parts.length ? parts.join(' | ') : '(no inputs)') + (resText ? ' || Result: ' + resText : '');
  }

  function lang(){ return (window.I18n && I18n.lang === 'te') ? 'te' : 'en'; }

  var T = {
    en: {
      title: 'Email me this result',
      intro: 'Leave your email and our team will send you a copy of this result. You can also ask Dr. E. Prashanthi Reddy\'s team any questions.',
      name: 'Your name (optional)', email: 'Email address',
      consent: 'I agree to share my email and this result with Mother Hospitals & IVF Center so the team can send it to me and contact me about my fertility care. I can ask them to delete it at any time.',
      privacy: 'Privacy Policy', btn: 'Send me my result',
      errEmail: 'Enter a valid email address.', errConsent: 'Tick the box to agree before sending.',
      thanks: 'Thank you. Our team will email your result to you soon. For anything urgent, call 97059 93366.'
    },
    te: {
      title: 'ఈ result ని email లో పొందండి',
      intro: 'మీ email ఇవ్వండి — మా team ఈ result copy మీకు email చేస్తుంది. Dr. E. Prashanthi Reddy team ని మీ questions కూడా అడగవచ్చు.',
      name: 'మీ పేరు (optional)', email: 'Email address',
      consent: 'నా email మరియు ఈ result ని Mother Hospitals & IVF Center తో share చేయడానికి అంగీకరిస్తున్నాను — result పంపడానికి, నా fertility care గురించి contact చేయడానికి. ఎప్పుడైనా delete చేయమని అడగవచ్చు.',
      privacy: 'Privacy Policy', btn: 'నాకు result పంపండి',
      errEmail: 'సరైన email address ఇవ్వండి.', errConsent: 'పంపే ముందు box tick చేయండి.',
      thanks: 'Thank you! మా team త్వరలో మీకు result email చేస్తుంది. Urgent అయితే 97059 93366 కి call చేయండి.'
    }
  };

  function buildBox(tool){
    if(document.getElementById('mh-email-result')) { document.getElementById('mh-email-result').hidden = false; return; }
    var calc = document.querySelector('.calc-box');
    if(!calc) return;
    var box = document.createElement('div');
    box.id = 'mh-email-result';
    box.className = 'mh-email-result';
    box.setAttribute('role','region');
    box.setAttribute('aria-labelledby','mh-er-title');
    box.innerHTML =
      '<h3 id="mh-er-title"></h3><p class="mh-er-intro"></p>' +
      '<form novalidate>' +
        '<label class="mh-er-l"><span class="mh-er-name-l"></span><input type="text" name="name" autocomplete="name"></label>' +
        '<label class="mh-er-l"><span class="mh-er-email-l"></span><input type="email" name="email" autocomplete="email" required inputmode="email" placeholder="name@example.com"></label>' +
        '<label class="mh-er-consent"><input type="checkbox" name="consent"><span><span class="mh-er-consent-t"></span> <a href="/privacy-policy.html#free-tools" target="_blank" rel="noopener" class="mh-er-privacy"></a></span></label>' +
        '<p class="mh-er-err" role="alert" hidden></p>' +
        '<button type="submit" class="mh-er-btn"></button>' +
      '</form><p class="mh-er-thanks" role="status" hidden></p>';
    calc.parentNode.insertBefore(box, calc.nextSibling);
    var form = box.querySelector('form'), err = box.querySelector('.mh-er-err');

    function paint(){
      var t = T[lang()];
      box.querySelector('#mh-er-title').textContent = t.title;
      box.querySelector('.mh-er-intro').textContent = t.intro;
      box.querySelector('.mh-er-name-l').textContent = t.name;
      box.querySelector('.mh-er-email-l').textContent = t.email;
      box.querySelector('.mh-er-consent-t').textContent = t.consent;
      box.querySelector('.mh-er-privacy').textContent = t.privacy;
      box.querySelector('.mh-er-btn').textContent = t.btn;
    }
    paint();
    document.addEventListener('click', function(e){ if(e.target.closest('[data-set-lang],.lang-btn')) setTimeout(paint, 50); });

    form.addEventListener('input', function(){ err.hidden = true; });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var t = T[lang()];
      var email = form.email.value.trim(), name = form.name.value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ err.textContent = t.errEmail; err.hidden = false; form.email.focus(); return; }
      if(!form.consent.checked){ err.textContent = t.errConsent; err.hidden = false; return; }
      var consent = 'Consent given ' + new Date().toISOString() + ' (' + lang() + '): ' + T.en.consent;
      var url = FORM
        + '?entry.1033771490=' + encodeURIComponent(name || '(not given)')
        + '&entry.826156409='  + encodeURIComponent(email)
        + '&entry.1895050244=' + encodeURIComponent(tool.label + ' — email request')
        + '&entry.957846797='  + encodeURIComponent(summary(tool) + ' || ' + consent);
      fetch(url, {method:'POST', mode:'no-cors'}).catch(function(){});
      if(typeof gtag !== 'undefined') gtag('event','generate_lead',{method:'email',form_type:'tool_email_result',tool_name:tool.label});
      form.hidden = true;
      var th = box.querySelector('.mh-er-thanks'); th.textContent = t.thanks; th.hidden = false;
    });
  }

  function init(){
    var slug = location.pathname.replace(/^\/|\.html$/g,'');
    var tool = TOOL_MAP[slug];
    if(!tool) return;
    var btn = document.querySelector('.btn-calc');
    if(!btn) return;
    btn.addEventListener('click', function(){
      setTimeout(function(){
        /* only when a result is actually showing (not after a validation error) */
        var res = document.querySelector('.result-box, #result, .results, .result');
        if(res && !res.offsetParent) return;
        if(typeof gtag !== 'undefined') gtag('event','tool_used',{tool_name: tool.label});
        buildBox(tool);
      }, 600);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
