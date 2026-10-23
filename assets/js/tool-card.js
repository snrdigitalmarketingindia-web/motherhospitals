/* Mother Hospitals — free fertility tools: picture-style result card.
 * After a tool shows its result, a branded card is placed above it with the key answer, a visual
 * (cycle ring / progress ring / gauge / donut / steps) and 2–3 key facts. "Save image" draws the same
 * card on a canvas in the browser (nothing is uploaded); "Share" opens WhatsApp with a short text.
 * Each tool's numbers are read from the result the page already shows, so the card never disagrees with it.
 */
(function(){
  var DAY = 864e5, MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var C = {period:'#ff7eb6', fertile:'#5eead4', ov:'#ffd166', idle:'rgba(255,255,255,.16)', good:'#5eead4', warn:'#ffd166', bad:'#ff7e9d', info:'#9cc9ff'};

  var L = {
    en: {brand:'Mother Hospitals & IVF Center', foot:'Estimate only · not a diagnosis', save:'Save image', share:'WhatsApp',
      ov:'Your next ovulation', fertile:'Fertile window', next:'Next period', ovDay:'Ovulation', best:'Your best days to try',
      cycleDay:'Today in your cycle', window:'Your next fertile window', now:'Happening now', inDays:'in {n} days', today:'Today',
      due:'Your due date', pregnant:'pregnant', left:'to go', weeks:'weeks', week:'Week', size:'Baby is about the size of',
      conc:'Estimated conception', lmp:'Last period', amh:'Your AMH', bmi:'Your BMI', ideal:'Healthy weight', lining:'Your lining',
      score:'Your score', outOf:'out of {n}', ivf:'IVF estimate', perTransfer:'per transfer', cum:'Over 3 cycles',
      ivfNote:'General estimate from published data — not Mother Hospitals results', semen:'Semen analysis', normal:'Normal',
      border:'Borderline', below:'Below ref.', params:'parameters normal', plan:'Your IVF plan', transfer:'Embryo transfer', test:'Pregnancy test', start:'Cycle start',
      shareMsg:'My result from the free {tool} at Mother Hospitals:',
      thisCycle:'This cycle', cycle2:'Next cycle', cycle3:'Cycle after',
      copied:'Result picture copied ✓', pasteHint:'Open WhatsApp, pick the chat and press {k} to attach the picture.',
      saved:'Result picture saved to your Downloads ✓', attachHint:'Open WhatsApp and attach the saved picture to your message.', openWa:'Open WhatsApp'},
    te: {brand:'Mother Hospitals & IVF Center', foot:'అంచనా మాత్రమే · diagnosis కాదు', save:'Image save', share:'WhatsApp',
      ov:'మీ నెక్స్ట్ ఓవ్యులేషన్', fertile:'ఫెర్టైల్ విండో', next:'నెక్స్ట్ పీరియడ్', ovDay:'ఓవ్యులేషన్', best:'Try చేయడానికి best days',
      cycleDay:'ఈ రోజు మీ సైకిల్‌లో', window:'మీ నెక్స్ట్ ఫెర్టైల్ విండో', now:'ఇప్పుడే నడుస్తోంది', inDays:'{n} రోజుల్లో', today:'ఈ రోజే',
      due:'మీ డ్యూ డేట్', pregnant:'ప్రెగ్నెన్సీ', left:'మిగిలాయి', weeks:'వారాలు', week:'వారం', size:'బేబీ సైజు సుమారు',
      conc:'Conception అంచనా', lmp:'చివరి పీరియడ్', amh:'మీ AMH', bmi:'మీ BMI', ideal:'Healthy weight', lining:'మీ lining',
      score:'మీ స్కోర్', outOf:'{n} లో', ivf:'IVF అంచనా', perTransfer:'ఒక transfer కి', cum:'3 cycles లో',
      ivfNote:'Published data ఆధారంగా సాధారణ అంచనా — Mother Hospitals results కాదు', semen:'Semen analysis', normal:'Normal',
      border:'Borderline', below:'తక్కువ', params:'parameters normal', plan:'మీ IVF ప్లాన్', transfer:'Embryo transfer', test:'ప్రెగ్నెన్సీ టెస్ట్', start:'సైకిల్ మొదలు',
      shareMsg:'Mother Hospitals ఉచిత {tool} లో నా result:',
      thisCycle:'ఈ సైకిల్', cycle2:'నెక్స్ట్ సైకిల్', cycle3:'ఆ తర్వాత సైకిల్',
      copied:'Result picture copy అయింది ✓', pasteHint:'WhatsApp open చేసి, chat select చేసి {k} నొక్కండి — picture attach అవుతుంది.',
      saved:'Result picture మీ Downloads లో save అయింది ✓', attachHint:'WhatsApp open చేసి, save అయిన picture ని message కి attach చేయండి.', openWa:'WhatsApp open చేయండి'}
  };
  function lang(){ return (window.I18n && I18n.lang === 'te') ? 'te' : 'en'; }
  function l(k, n){ return (L[lang()][k] || L.en[k]).replace('{n}', n); }

  /* ---------- reading the page ---------- */
  function el(id){ return document.getElementById(id); }
  function tx(id){ var e = el(id); return e ? (e.innerText || e.textContent || '').replace(/\s+/g,' ').trim() : ''; }
  function iv(id){ var e = el(id); return e ? e.value : ''; }
  function pd(s){ var m = /(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/.exec(s || ''); if(!m) return null;
    var mi = MON.map(function(x){return x.toLowerCase();}).indexOf(m[2].toLowerCase()); return mi < 0 ? null : new Date(+m[3], mi, +m[1]); }
  function iso(s){ if(!s) return null; var p = s.split('-'); return new Date(+p[0], p[1]-1, +p[2]); }
  function today(){ var d = new Date(); d.setHours(0,0,0,0); return d; }
  function add(d, n){ return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function diff(a, b){ return Math.round((b - a) / DAY); }
  function dm(d){ return d.getDate() + ' ' + MON[d.getMonth()]; }
  function dmy(d){ return dm(d) + ' ' + d.getFullYear(); }
  function rng(a, b){ return a.getMonth() === b.getMonth() ? a.getDate() + '–' + dm(b) : dm(a) + ' – ' + dm(b); }
  function away(d){ var n = diff(today(), d); return n === 0 ? l('today') : n === 1 && lang() === 'en' ? 'in 1 day' : n > 0 ? l('inDays', n) : ''; }
  function num(s){ var m = /-?\d+(\.\d+)?/.exec(s || ''); return m ? parseFloat(m[0]) : NaN; }

  /* next ovulation on or after today, from LMP + cycle length (same rule the calculators use) */
  function nextCycle(lmp, len){
    var t = today(), k = Math.max(0, Math.floor(diff(lmp, t) / len)), ov = add(lmp, len - 14 + k * len);
    if(add(ov, 1) < t) { k++; ov = add(lmp, len - 14 + k * len); }
    return {start: add(lmp, k * len), ov: ov};
  }
  function cycleVis(start, ov, len, plen){ var ti = diff(start, today()); return {type:'cycle', len:len, plen:plen || 5, ov:diff(start, ov), today: ti >= 0 && ti < len ? ti : -1}; }

  /* the two cycles after the one shown, for the 3-ring view; fn(start, ov) gives [big, sub] */
  function more(start, ov, len, plen, fn){
    return [1, 2].map(function(k){ var st = add(start, k * len), o = add(ov, k * len), t = fn(st, o);
      return {label:l(k === 1 ? 'cycle2' : 'cycle3'), vis:cycleVis(st, o, len, plen), big:t[0], sub:t[1]}; });
  }

  /* ---------- one spec per tool ---------- */
  var SPEC = {
    'ovulation-calculator': function(){
      var ov = pd(tx('ovDateMain')), np = pd(tx('nextPeriod')), len = +iv('cycle') || 28; if(!ov || !np) return null;
      var start = add(np, -len);
      return {kicker:'🥚 ' + l('ov'), vis:cycleVis(start, ov, len), big:dm(ov), sub:away(ov),
        more:more(start, ov, len, 5, function(st, o){ return [dm(o), l('fertile') + ' ' + rng(add(o, -5), add(o, 1))]; }),
        chips:[['🌸', l('fertile'), rng(pd(tx('fertStart')), pd(tx('fertEnd')))], ['🩸', l('next'), dm(np)]],
        share:l('ov') + ': ' + dmy(ov) + ' · ' + l('fertile') + ': ' + rng(pd(tx('fertStart')), pd(tx('fertEnd')))};
    },
    'period-tracker': function(){
      var day = num(tx('cycleDay')), len = +iv('cycle') || 28, plen = +iv('period') || 5, np = pd(tx('nextPeriod')), ov = pd(tx('ovDate'));
      if(!day || !np || !ov) return null;
      var start = add(today(), -(day - 1)), fs = pd(tx('fertStart')), fe = pd(tx('fertEnd').replace(/^\D+/, ''));
      return {kicker:'🌙 ' + l('cycleDay'), vis:cycleVis(start, ov, len, plen), big:tx('cycleDay'), sub:tx('phaseLabel'),
        more:more(start, ov, len, plen, function(st, o){ return ['🩸 ' + dm(st), l('ovDay') + ' ' + dm(o)]; }),
        chips:[['🩸', l('next'), dm(np) + ' · ' + tx('nextPeriodSub')], ['🥚', l('ovDay'), dm(ov)], fs && fe ? ['🌸', l('fertile'), rng(fs, fe)] : null],
        share:l('next') + ': ' + dmy(np) + ' · ' + l('ovDay') + ': ' + dmy(ov)};
    },
    'fertility-window-planner': function(){
      var lmp = iso(iv('lmp')), len = +iv('cycle') || 28; if(!lmp) return null;
      var c = nextCycle(lmp, len), fs = add(c.ov, -5), fe = add(c.ov, 1), t = today();
      return {kicker:'🌸 ' + l('window'), vis:cycleVis(c.start, c.ov, len), big:rng(fs, fe), sub: t >= fs && t <= fe ? l('now') : away(fs),
        more:more(c.start, c.ov, len, 5, function(st, o){ return [rng(add(o, -5), add(o, 1)), l('ovDay') + ' ' + dm(o)]; }),
        chips:[['🥚', l('ovDay'), dm(c.ov)], ['🩸', l('next'), dm(add(c.start, len))]],
        share:l('window') + ': ' + rng(fs, fe) + ' · ' + l('ovDay') + ': ' + dmy(c.ov)};
    },
    'best-days-to-conceive': function(){
      var lmp = iso(iv('lmp')), len = +iv('cycle') || 28; if(!lmp) return null;
      var c = nextCycle(lmp, len);
      return {kicker:'💞 ' + l('best'), vis:cycleVis(c.start, c.ov, len), big:rng(add(c.ov, -1), c.ov), sub:away(add(c.ov, -1)),
        more:more(c.start, c.ov, len, 5, function(st, o){ return [rng(add(o, -1), o), l('ovDay') + ' ' + dm(o)]; }),
        chips:[['🥚', l('ovDay'), dm(c.ov)], ['🌸', l('fertile'), rng(add(c.ov, -5), add(c.ov, 1))]],
        share:l('best') + ': ' + rng(add(c.ov, -1), c.ov) + ' · ' + l('ovDay') + ': ' + dmy(c.ov)};
    },
    'due-date-calculator': function(){
      var edd = pd(tx('eddDisplay')), pct = num(tx('progressLabel')); if(!edd) return null;
      return {kicker:'👶 ' + l('due'), vis:{type:'ring', pct:pct}, big:dm(edd), sub:String(edd.getFullYear()),
        chips:[['🤰', l('pregnant'), tx('gestAge')], ['⏳', l('left'), tx('daysLeft') + ' d'], ['🗓', '', tx('trimesterBadge')]],
        share:l('due') + ': ' + dmy(edd) + ' (' + tx('gestAge') + ')'};
    },
    'pregnancy-week-tracker': function(){
      var w = num(tx('weekNum')), pct = num(tx('progressLabel')); if(!w) return null;
      return {kicker:'🤰 ' + l('week') + ' ' + w, vis:{type:'ring', pct:pct}, big:String(w), sub:l('weeks'),
        head: tx('babySize') ? tx('babyEmoji') + ' ' + l('size') + ' ' + tx('babySize').replace(/\s*\(.*\)/, '').toLowerCase() : '',
        chips:[['👶', l('due'), tx('eddStat')], ['⏳', l('left'), tx('daysRemain')], ['🗓', '', tx('trimBadge')]],
        share:l('week') + ' ' + w + ' · ' + l('due') + ': ' + tx('eddStat')};
    },
    'conception-calculator': function(){
      var d = pd(tx('concDateDisplay')); if(!d) return null;
      var pct = Math.max(0, Math.min(100, num(tx('gestDisplay')) / 40 * 100));
      return {kicker:'💫 ' + l('conc'), vis:{type:'ring', pct:pct}, big:dm(d), sub:String(d.getFullYear()),
        chips:[['🩸', l('lmp'), tx('lmpDisplay')], ['👶', l('due'), tx('eddDisplay')], ['🤰', l('pregnant'), tx('gestDisplay')]],
        share:l('conc') + ': ' + dmy(d) + ' · ' + l('due') + ': ' + tx('eddDisplay')};
    },
    'amh-interpreter': function(){
      var raw = num(tx('amhDisplay')), ng = /pmol/i.test(tx('amhDisplay')) ? raw / 7.14 : raw; if(isNaN(ng)) return null;
      return {kicker:'🧪 ' + l('amh'), vis:{type:'gauge', min:0, max:6, v:ng, zones:[[0.5,C.bad],[1,C.warn],[5,C.good],[6,C.info]]},
        big:tx('amhDisplay').replace(/\s*\(.*\)/, ''), sub:'', head:tx('amhLabel'), chips:[],
        share:l('amh') + ': ' + tx('amhDisplay') + ' — ' + tx('amhLabel')};
    },
    'bmi-fertility-calculator': function(){
      var b = num(tx('bmiNumber')); if(!b) return null;
      var m = /([\d.]+\s*[–-]\s*[\d.]+\s*kg)/.exec(tx('idealWeightBox'));
      return {kicker:'⚖️ ' + l('bmi'), vis:{type:'gauge', min:15, max:40, v:b, zones:[[18.5,C.warn],[25,C.good],[30,C.warn],[40,C.bad]]},
        big:String(b), sub:'', head:tx('bmiCategory'), chips: m ? [['🎯', l('ideal'), m[1]]] : [],
        share:l('bmi') + ': ' + b + ' — ' + tx('bmiCategory')};
    },
    'endometrial-thickness-calculator': function(){
      var mm = parseFloat(iv('thickness')), card = el('resultCard'); if(!mm || !card) return null;
      var first = (card.innerText || '').split('\n').map(function(s){return s.trim();}).filter(Boolean)[0] || '';
      return {kicker:'🌷 ' + l('lining'), vis:{type:'gauge', min:0, max:16, v:mm, zones:[[6,C.bad],[7,C.warn],[8,C.warn],[14,C.good],[16,C.info]]},
        big:mm + ' mm', sub:'', head:first.replace(/^[^\wఀ-౿]+/, '').replace(/\s*✓$/, ''), chips:[],
        share:l('lining') + ': ' + mm + ' mm — ' + first.replace(/^[^\wఀ-౿]+/, '')};
    },
    'pcos-assessment': function(){
      var s = num(tx('scoreNum')); if(isNaN(s)) return null;
      return {kicker:'🩺 ' + l('score'), vis:{type:'gauge', min:0, max:90, v:s, zones:[[30,C.good],[60,C.warn],[90,C.bad]]},
        big:String(s), sub:l('outOf', 90), head:tx('scoreLabel'), chips:[], share:l('score') + ': ' + s + '/90 — ' + tx('scoreLabel')};
    },
    'fertility-assessment': function(){
      var s = num(tx('scoreNum')); if(isNaN(s)) return null;
      return {kicker:'🌱 ' + l('score'), vis:{type:'gauge', min:0, max:120, v:s, zones:[[40,C.bad],[60,C.warn],[80,C.info],[120,C.good]]},
        big:String(s), sub:l('outOf', 120), head:tx('scoreGrade'), chips:[], share:l('score') + ': ' + s + '/120 — ' + tx('scoreGrade')};
    },
    'ivf-success-estimator': function(){
      var p = num(tx('perRate')); if(isNaN(p)) return null;
      return {kicker:'🔬 ' + l('ivf'), vis:{type:'gauge', min:0, max:100, v:p, zones:[[20,C.bad],[35,C.warn],[100,C.good]]},
        big:p + '%', sub:l('perTransfer'), head:tx('gradeLabel'), chips:[['📈', l('cum'), tx('cumRate')]], note:l('ivfNote'), noShare:true};
    },
    'semen-analysis-interpreter': function(){
      var n = {g:0, w:0, b:0};
      document.querySelectorAll('#paramBody tr').forEach(function(r){ var t = r.innerText; if(/✅/.test(t)) n.g++; else if(/⚠/.test(t)) n.w++; else if(/🔴/.test(t)) n.b++; });
      var tot = n.g + n.w + n.b; if(!tot) return null;
      return {kicker:'🔬 ' + l('semen'), vis:{type:'donut', parts:[[n.g,C.good],[n.w,C.warn],[n.b,C.bad]]}, big:n.g + '/' + tot, sub:l('params'), head:tx('dxLabel'),
        chips:[['🟢', l('normal'), String(n.g)], ['🟡', l('border'), String(n.w)], ['🔴', l('below'), String(n.b)]],
        share:l('semen') + ': ' + tx('dxLabel')};
    },
    'ivf-timeline-planner': function(){
      var items = [].slice.call(document.querySelectorAll('#timelineContainer .tl-item')); if(!items.length) return null;
      function find(ph){ for(var i = items.length - 1; i >= 0; i--) if(items[i].className.indexOf('ph-' + ph) > -1) return pd(items[i].querySelector('.tl-date').textContent); return null; }
      var tr = find('transfer'), te = find('test'), st = iso(iv('cycleStart'));
      var phases = []; items.forEach(function(i){ var p = (/ph-(\w+)/.exec(i.className) || [])[1]; if(p && phases.indexOf(p) < 0) phases.push(p); });
      return {kicker:'🧬 ' + l('plan'), vis:{type:'steps', n:phases.length, at:phases.indexOf('transfer')}, big: tr ? dm(tr) : '—', sub:l('transfer'),
        chips:[st ? ['🩸', l('start'), dm(st)] : null, te ? ['🧪', l('test'), dm(te)] : null],
        share: tr ? l('transfer') + ': ' + dmy(tr) + (te ? ' · ' + l('test') + ': ' + dmy(te) : '') : ''};
    }
  };

  /* ---------- visuals (SVG, reused for the saved image) ---------- */
  function arc(cx, cy, r, a0, a1){
    var p = function(a){ return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }, s = p(a0), e = p(a1);
    return 'M' + s[0].toFixed(2) + ' ' + s[1].toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + e[0].toFixed(2) + ' ' + e[1].toFixed(2);
  }
  function svg(v){
    var o = '', W = 220, H = 220, cx = 110, cy = 110, r = 92, A = -Math.PI / 2;
    if(v.type === 'cycle'){
      var g = 0.035, step = 2 * Math.PI / v.len;
      for(var i = 0; i < v.len; i++){
        var c = i < v.plen ? C.period : i === v.ov ? C.ov : (i >= v.ov - 5 && i <= v.ov + 1) ? C.fertile : C.idle;
        o += '<path d="' + arc(cx, cy, r, A + i * step + g, A + (i + 1) * step - g) + '" stroke="' + c + '" stroke-width="' + (i === v.ov ? 22 : 15) + '" fill="none" stroke-linecap="round"/>';
      }
      if(v.today >= 0){ var a = A + (v.today + 0.5) * step;
        o += '<circle cx="' + (cx + r * Math.cos(a)).toFixed(1) + '" cy="' + (cy + r * Math.sin(a)).toFixed(1) + '" r="10" fill="#fff" stroke="#58037c" stroke-width="4"/>'; }
    } else if(v.type === 'ring'){
      var p = Math.max(0.5, Math.min(99.5, v.pct || 0)) / 100;
      o += '<circle cx="110" cy="110" r="' + r + '" stroke="' + C.idle + '" stroke-width="16" fill="none"/>' +
           '<path d="' + arc(cx, cy, r, A, A + p * 2 * Math.PI) + '" stroke="url(#mhcg)" stroke-width="16" fill="none" stroke-linecap="round"/>';
    } else if(v.type === 'donut'){
      var tot = v.parts.reduce(function(s, x){ return s + x[0]; }, 0), at = A;
      v.parts.forEach(function(x){ if(!x[0]) return; var e = at + x[0] / tot * 2 * Math.PI;
        o += '<path d="' + (x[0] === tot ? arc(cx, cy, r, A, A + 2 * Math.PI - 0.001) : arc(cx, cy, r, at + 0.04, e - 0.04)) + '" stroke="' + x[1] + '" stroke-width="16" fill="none" stroke-linecap="round"/>'; at = e; });
    } else if(v.type === 'gauge'){
      H = 140; cy = 120; var a0 = Math.PI, span = Math.PI, lo = v.min, f = function(x){ return a0 + (Math.max(v.min, Math.min(v.max, x)) - v.min) / (v.max - v.min) * span; };
      v.zones.forEach(function(z){ o += '<path d="' + arc(cx, cy, r, f(lo) + 0.02, f(z[0]) - 0.02) + '" stroke="' + z[1] + '" stroke-width="16" fill="none" stroke-opacity=".9"/>'; lo = z[0]; });
      var na = f(v.v), nx = cx + (r - 26) * Math.cos(na), ny = cy + (r - 26) * Math.sin(na);
      o += '<line x1="110" y1="120" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="110" cy="120" r="10" fill="#fff"/>' +
           '<circle cx="' + (cx + r * Math.cos(na)).toFixed(1) + '" cy="' + (cy + r * Math.sin(na)).toFixed(1) + '" r="11" fill="#fff" stroke="#58037c" stroke-width="4"/>';
    } else if(v.type === 'steps'){
      H = 60; var n = Math.max(2, v.n);
      o += '<line x1="20" y1="30" x2="200" y2="30" stroke="' + C.idle + '" stroke-width="6" stroke-linecap="round"/>';
      for(var j = 0; j < n; j++){ var x = 20 + j * 180 / (n - 1);
        o += '<circle cx="' + x.toFixed(1) + '" cy="30" r="' + (j === v.at ? 13 : 8) + '" fill="' + (j === v.at ? C.ov : j < v.at ? C.fertile : '#fff') + '"/>'; }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs><linearGradient id="mhcg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#ffd166"/></linearGradient></defs>' + o + '</svg>';
  }
  function legend(v){
    if(v.type !== 'cycle') return '';
    var t = lang() === 'te' ? ['పీరియడ్','ఫెర్టైల్','ఓవ్యులేషన్','ఈ రోజు'] : ['Period','Fertile','Ovulation','Today'];
    return '<div class="mhc-leg"><i style="background:' + C.period + '"></i>' + t[0] + '<i style="background:' + C.fertile + '"></i>' + t[1] +
      '<i style="background:' + C.ov + '"></i>' + t[2] + (v.today >= 0 ? '<i class="mhc-leg-t"></i>' + t[3] : '') + '</div>';
  }

  /* ---------- card ---------- */
  var CSS = '.mhc{margin:1.4rem 0 1rem}' +
    '.mhc-card{position:relative;overflow:hidden;border-radius:24px;padding:20px 18px 16px;color:#fff;background:radial-gradient(circle at 85% 0%,rgba(255,126,182,.45),transparent 45%),radial-gradient(circle at 0% 100%,rgba(94,234,212,.28),transparent 45%),linear-gradient(150deg,#2a0c45 0%,#58037c 55%,#aa045a 100%);box-shadow:0 18px 40px -18px rgba(88,3,124,.65)}' +
    '.mhc-card::after{content:"";position:absolute;right:-70px;bottom:-60px;width:300px;height:300px;background:url(/assets/logo-variants/logo-mark-white.png) center/contain no-repeat;opacity:.09;pointer-events:none}.mhc-card>*{position:relative;z-index:1}' +
    '.mhc-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}' +
    '.mhc-kicker{font-size:.8rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.92)}' +
    '.mhc-brand{display:flex;align-items:center;gap:5px;font-size:.75rem;font-weight:700;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);border-radius:50px;padding:2px 9px 2px 2px;white-space:nowrap}.mhc-brand img{width:24px;height:24px;border-radius:50%;background:#fff}' +
    '.mhc-vis{position:relative;width:220px;max-width:100%;margin:6px auto 0}.mhc-vis svg{display:block;width:100%;height:auto}' +
    '.mhc-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 40px}' +
    '.mhc-gauge .mhc-center{position:static;padding:0;margin-top:-6px}.mhc-steps .mhc-center{position:static;padding:0;margin-top:8px}' +
    '.mhc{container-type:inline-size}.mhc-rings{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;align-items:end}.mhc-rmain{grid-column:1/-1}' +
    '.mhc-rl{text-align:center;font-size:.75rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.75);margin-top:6px}' +
    '.mhc-rsm .mhc-vis{width:100%;max-width:190px}.mhc-rsm .mhc-center{padding:0 13%}.mhc-rsm .mhc-big{font-size:1.05rem;letter-spacing:0;white-space:nowrap}.mhc-rsm .mhc-sub{font-size:.75rem;font-weight:600;line-height:1.25;color:rgba(255,255,255,.85)}' +
    '@container (min-width:640px){.mhc-rings{grid-template-columns:1.35fr 1fr 1fr;gap:12px 28px;align-items:center}.mhc-rmain{grid-column:auto}.mhc-rmain .mhc-vis{width:260px}.mhc-rsm .mhc-vis{max-width:210px}.mhc-rsm .mhc-big{font-size:1.35rem}}' +
    '.mhc-big{font-size:2.3rem;font-weight:900;line-height:1.05;letter-spacing:-.02em;color:#fff}' +
    '.mhc-sub{font-size:.88rem;font-weight:700;color:#ffd166;margin-top:4px}' +
    '.mhc-head{text-align:center;font-size:1.02rem;font-weight:800;margin:12px auto 2px;max-width:30ch;color:#fff}' +
    '.mhc-leg{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 12px;font-size:.78rem;font-weight:600;color:rgba(255,255,255,.85);margin:8px 0 2px}' +
    '.mhc-leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:-6px;vertical-align:-1px}.mhc-leg i.mhc-leg-t{background:#fff;box-shadow:0 0 0 2px #58037c inset}' +
    '.mhc-chips{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:14px}' +
    '.mhc-chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:9px 11px;display:flex;gap:8px;align-items:center;min-width:0}' +
    '.mhc-chip b{display:block;font-size:.95rem;font-weight:800;color:#fff;line-height:1.2}.mhc-chip small{display:block;font-size:.75rem;font-weight:600;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:.04em}' +
    '.mhc-chip span.e{font-size:1.25rem;line-height:1}' +
    '.mhc-note{font-size:.78rem;color:rgba(255,255,255,.8);text-align:center;margin:10px 0 0}' +
    '.mhc-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 8px;font-size:.75rem;color:rgba(255,255,255,.7);margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,.15)}' +
    '.mhc-act{display:flex;gap:8px;margin-top:10px}.mhc-act button,.mhc-act a{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;min-height:46px;border-radius:50px;font-size:.86rem;font-weight:700;cursor:pointer;text-decoration:none!important;text-align:center;padding:4px 10px;line-height:1.2}' +
    '.mhc-save{background:#fff;color:#58037c;border:2px solid #58037c}.mhc-wa{background:#25d366;color:#fff!important;border:2px solid #25d366}' +
    '.mhc-desk{margin-top:10px;padding:12px 14px;border-radius:14px;background:#effcf3;border:1px solid #25d366;color:#0b3d22;font-size:.86rem;line-height:1.45;text-align:center}' +
    '.mhc-desk a{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:8px 18px;border-radius:50px;background:#25d366;color:#fff!important;font-weight:700;text-decoration:none!important}' +
    '@media(min-width:700px){.mhc-card{padding:24px 26px 18px}.mhc-vis{width:240px}}';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function html(s){
    var chips = (s.chips || []).filter(function(c){ return c && c[2]; }).map(function(c){
      return '<div class="mhc-chip"><span class="e">' + c[0] + '</span><div>' + (c[1] ? '<small>' + esc(c[1]) + '</small>' : '') + '<b>' + esc(c[2]) + '</b></div></div>'; }).join('');
    return '<div class="mhc-card" id="mhc-card">' +
      '<div class="mhc-top"><span class="mhc-kicker">' + esc(s.kicker) + '</span><span class="mhc-brand"><img src="/assets/logo.webp" alt="" width="24" height="24">Mother Hospitals</span></div>' +
      (s.more ? '<div class="mhc-rings"><div class="mhc-rmain"><div class="mhc-rl">' + esc(l('thisCycle')) + '</div>' : '') +
      '<div class="mhc-vis mhc-' + s.vis.type + '">' + svg(s.vis) + '<div class="mhc-center"><div class="mhc-big">' + esc(s.big) + '</div>' + (s.sub ? '<div class="mhc-sub">' + esc(s.sub) + '</div>' : '') + '</div></div>' +
      (s.more ? '</div>' + s.more.map(function(m){ return '<div class="mhc-rsm"><div class="mhc-rl">' + esc(m.label) + '</div><div class="mhc-vis mhc-cycle">' + svg(m.vis) +
        '<div class="mhc-center"><div class="mhc-big">' + esc(m.big) + '</div><div class="mhc-sub">' + esc(m.sub) + '</div></div></div></div>'; }).join('') + '</div>' : '') +
      legend(s.vis) + (s.head ? '<div class="mhc-head">' + esc(s.head) + '</div>' : '') +
      (chips ? '<div class="mhc-chips">' + chips + '</div>' : '') + (s.note ? '<p class="mhc-note">' + esc(s.note) + '</p>' : '') +
      '<div class="mhc-foot"><span>motherhospitals.co.in</span><span>' + esc(l('foot')) + '</span></div></div>' +
      '<div class="mhc-act"><button type="button" class="mhc-save">📥 ' + esc(l('save')) + '</button>' +
      (s.noShare || !s.share ? '' : '<a class="mhc-wa" target="_blank" rel="noopener noreferrer">💬 ' + esc(l('share')) + '</a>') + '</div>' +
      '<div class="mhc-desk" hidden></div>';
  }

  /* ---------- saved image: the same card drawn on a canvas ---------- */
  function wrapLines(ctx, t, w){ var out = [], line = ''; String(t).split(' ').forEach(function(word){ var tr = line ? line + ' ' + word : word; if(ctx.measureText(tr).width > w && line){ out.push(line); line = word; } else line = tr; }); if(line) out.push(line); return out; }
  function rr(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  var LOGOS = {};
  function logo(k, src, cb){ if(LOGOS[k]) return cb(LOGOS[k]); var i = new Image(); i.onload = function(){ LOGOS[k] = i; cb(i); }; i.onerror = function(){ cb(null); }; i.src = src; }
  function draw(s, done){
    logo('mark', '/assets/logo-variants/logo-mark-white.png', function(mark){ logo('logo', '/assets/logo.png', function(lg){ paint(s, mark, lg, done); }); });
  }
  function paint(s, mark, lg, done){
    var W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d'), F = '"Segoe UI",Roboto,"Noto Sans Telugu","Helvetica Neue",Arial,sans-serif';
    var g = ctx.createLinearGradient(0, 0, W * 0.6, H); g.addColorStop(0, '#2a0c45'); g.addColorStop(0.55, '#58037c'); g.addColorStop(1, '#aa045a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    [[W * 0.9, 0, 520, 'rgba(255,126,182,.35)'], [0, H, 560, 'rgba(94,234,212,.22)']].forEach(function(b){ var r = ctx.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]); r.addColorStop(0, b[3]); r.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H); });
    if(mark){ ctx.globalAlpha = 0.08; ctx.drawImage(mark, W - 620, H - 700, 760, 760); ctx.globalAlpha = 1; }
    if(lg){ ctx.save(); ctx.beginPath(); ctx.arc(W - 72 - 60, 120, 60, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip(); ctx.drawImage(lg, W - 72 - 120, 60, 120, 120); ctx.restore(); }
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic';
    ctx.font = '800 38px ' + F; ctx.fillText(wrapLines(ctx, s.kicker.toUpperCase(), 760)[0], 72, 120);
    ctx.font = '700 30px ' + F; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(l('brand'), 72, 170);
    var list = [s.vis].concat((s.more || []).map(function(m){ return m.vis; })), imgs = [], left = list.length;
    function fit(t, weight, size, maxW){ ctx.font = weight + ' ' + size + 'px ' + F; while(size > 40 && ctx.measureText(t).width > maxW){ size -= 4; ctx.font = weight + ' ' + size + 'px ' + F; } }
    list.forEach(function(v, i){ var im = new Image(); im.onload = function(){ imgs[i] = im; if(--left === 0) go(); }; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(v)); });
    function go(){
      var img = imgs[0];
      var inside = s.vis.type === 'cycle' || s.vis.type === 'ring' || s.vis.type === 'donut';
      var vw = s.more ? 430 : s.vis.type === 'steps' ? 760 : 640, vh = vw * img.height / img.width, SW = 300, extra = s.more ? 60 + SW + 20 : 0;
      var head = [], chips = (s.chips || []).filter(function(c){ return c && c[2]; }), cols = Math.min(chips.length, 2), rows = Math.ceil(chips.length / 2);
      if(s.head){ ctx.font = '800 50px ' + F; head = wrapLines(ctx, s.head, 900).slice(0, 2); }
      var hText = inside ? 0 : 140 + (s.sub ? 64 : 0), rest = extra + hText + (head.length ? 50 + head.length * 64 : 0) + (rows ? 60 + rows * 170 - 20 : 0), avail = H - 160 - 230;
      if(vh + rest > avail){ vh = Math.max(380, avail - rest); vw = vh * img.width / img.height; }
      var total = vh + rest;
      var y = 210 + Math.max(0, (H - 160 - 210 - total) / 2);
      ctx.drawImage(img, (W - vw) / 2, y, vw, vh);
      ctx.textAlign = 'center';
      var bigY = inside ? y + vh / 2 + (s.sub ? 20 : 40) : y + vh + 120;
      ctx.fillStyle = '#fff'; fit(s.big, '900', 128, inside ? vw * 0.6 : 900); ctx.fillText(s.big, W / 2, bigY);
      if(s.sub){ ctx.fillStyle = '#ffd166'; ctx.font = '700 44px ' + F; ctx.fillText(s.sub, W / 2, bigY + 66); }
      y += vh + hText;
      if(s.more){
        y += 60;
        s.more.forEach(function(m, i){ var cx = W / 2 + (i ? 1 : -1) * (SW / 2 + 40);
          ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '800 26px ' + F; ctx.fillText(m.label.toUpperCase(), cx, y - 14);
          ctx.drawImage(imgs[i + 1], cx - SW / 2, y, SW, SW);
          ctx.fillStyle = '#fff'; fit(m.big, '900', 52, SW * 0.6); ctx.fillText(m.big, cx, y + SW / 2 + 8);
          ctx.fillStyle = 'rgba(255,255,255,.85)'; fit(m.sub, '600', 24, SW * 0.62); ctx.fillText(m.sub, cx, y + SW / 2 + 46);
        });
        y += SW + 20;
      }
      if(head.length){ y += 50; ctx.fillStyle = '#fff'; ctx.font = '800 50px ' + F; head.forEach(function(t){ ctx.fillText(t, W / 2, y + 40); y += 64; }); }
      if(rows){
        y += 60; var gap = 24, cw = (W - 144 - gap * (cols - 1)) / cols;
        chips.forEach(function(c, i){ var x = 72 + (i % cols) * (cw + gap), yy = y + Math.floor(i / cols) * 170;
          ctx.fillStyle = 'rgba(255,255,255,.13)'; rr(ctx, x, yy, cw, 150, 30); ctx.fill();
          ctx.textAlign = 'left'; ctx.font = '56px ' + F; ctx.fillStyle = '#fff'; ctx.fillText(c[0], x + 28, yy + 96);
          if(c[1]){ ctx.font = '700 26px ' + F; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillText(wrapLines(ctx, String(c[1]).toUpperCase(), cw - 140)[0], x + 112, yy + 62); }
          ctx.font = '800 40px ' + F; ctx.fillStyle = '#fff'; ctx.fillText(wrapLines(ctx, c[2], cw - 140)[0], x + 112, c[1] ? yy + 112 : yy + 90);
        });
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(72, H - 130, W - 144, 2);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = '700 30px ' + F; ctx.fillText('motherhospitals.co.in', 72, H - 72);
      ctx.textAlign = 'right'; ctx.font = '600 26px ' + F; ctx.fillText(l('foot'), W - 72, H - 72);
      done(cv);
    }
  }

  /* The image is made as soon as the card appears, so a tap can save or share it straight away
     (browsers only allow sharing a file directly inside the tap, not after waiting for a drawing). */
  var png = null;
  function prepare(s, slug, cb){
    png = null;
    draw(s, function(cv){ cv.toBlob(function(blob){
      var name = 'mother-hospitals-' + slug + '.jpg', file = null;
      try { file = new File([blob], name, {type:'image/jpeg'}); } catch(e) {}
      png = {blob:blob, name:name, file:file, spec:s};
      /* computers paste pictures from the clipboard, and the clipboard only takes PNG */
      if(!touch) cv.toBlob(function(pb){ if(png && png.spec === s) png.pngBlob = pb; }, 'image/png');
      if(cb) cb(png);
    }, 'image/jpeg', 0.92); });
  }
  function canShareFile(p){ try { return !!(p.file && navigator.canShare && navigator.canShare({files:[p.file]})); } catch(e) { return false; } }
  var touch = window.matchMedia && matchMedia('(pointer:coarse)').matches, ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function download(p){
    var a = document.createElement('a'); a.href = URL.createObjectURL(p.blob); a.download = p.name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  function track(method, slug){ if(typeof gtag !== 'undefined') gtag('event', 'share', {method:method, content_type:'tool_result', item_id:slug}); }
  function withPng(s, slug, fn){ if(png && png.spec === s) fn(png); else prepare(s, slug, fn); }

  /* Save: iPhone/iPad → share sheet ("Save Image" puts it in Photos); everything else → downloads the image */
  function save(s, slug){
    track('image', slug);
    withPng(s, slug, function(p){
      if(ios && canShareFile(p)) navigator.share({files:[p.file]}).catch(function(err){ if(err && err.name !== 'AbortError') download(p); });
      else download(p);
    });
  }
  /* Computers: a wa.me link can only carry text, so copy the result picture to the clipboard
     (or save it if copying isn't supported) and offer an "Open WhatsApp" button to paste it into. */
  function shareDesktop(s, slug, text){
    var panel = box && box.querySelector('.mhc-desk'); if(!panel) return false;
    var key = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘V' : 'Ctrl+V';
    var waUrl = 'https://wa.me/?text=' + encodeURIComponent(text);
    function show(msg, hint){
      panel.innerHTML = '<b>' + esc(l(msg)) + '</b><br>' + esc(l(hint).replace('{k}', key)) +
        '<br><a href="' + waUrl + '" target="_blank" rel="noopener noreferrer">💬 ' + esc(l('openWa')) + '</a>';
      panel.hidden = false;
    }
    function saveInstead(){ withPng(s, slug, function(p){ download(p); show('saved', 'attachHint'); track('whatsapp_saved', slug); }); }
    var pngBlob = png && png.spec === s && png.pngBlob ? png.pngBlob : new Promise(function(res){ draw(s, function(cv){ cv.toBlob(res, 'image/png'); }); });
    try {
      if(!navigator.clipboard || !navigator.clipboard.write || !window.ClipboardItem) throw new Error('no clipboard');
      navigator.clipboard.write([new ClipboardItem({'image/png': pngBlob})])
        .then(function(){ show('copied', 'pasteHint'); track('whatsapp_copied', slug); }, saveInstead);
    } catch(err) { saveInstead(); }
    return true;
  }

  /* WhatsApp: phones that can share files → share sheet with the image attached (pick WhatsApp);
     computers → picture copied to the clipboard + "Open WhatsApp"; otherwise the plain wa.me text link */
  function shareWa(s, slug, text, e){
    track('whatsapp', slug);
    if(!touch){ if(shareDesktop(s, slug, text)) e.preventDefault(); return; }
    if(touch && png && png.spec === s && canShareFile(png)){
      e.preventDefault();
      /* iPhone WhatsApp drops the picture when text comes with it, so send the picture alone there */
      navigator.share(ios ? {files:[png.file]} : {files:[png.file], text:text}).catch(function(err){
        if(err && err.name === 'NotAllowedError') location.href = 'https://wa.me/?text=' + encodeURIComponent(text);
      });
    }
  }

  /* ---------- wiring ---------- */
  var slug = location.pathname.replace(/^\/|\.html$/g, ''), make = SPEC[slug], box, last = '';
  function render(){
    var res = el('result'); if(!make || !res) return;
    var shown = !!res.offsetParent, s = null;
    if(shown){ try { s = make(); } catch(e) { s = null; } }
    if(!s){ if(box) box.hidden = true; return; }
    var key = JSON.stringify(s) + lang(); if(box && key === last){ box.hidden = false; return; }
    last = key;
    if(!box){
      var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      box = document.createElement('div'); box.className = 'mhc'; box.setAttribute('aria-live', 'polite');
      res.parentNode.insertBefore(box, res);
    }
    box.hidden = false; box.innerHTML = html(s);
    prepare(s, slug);
    box.querySelector('.mhc-save').onclick = function(){ save(s, slug); };
    var wa = box.querySelector('.mhc-wa');
    if(wa){
      var title = (document.querySelector('h1') || {}).innerText || '';
      var text = l('shareMsg').replace('{tool}', title.split('\n')[0].trim()) + '\n' + s.share + '\n' + location.origin + location.pathname;
      wa.href = 'https://wa.me/?text=' + encodeURIComponent(text);
      wa.onclick = function(e){ shareWa(s, slug, text, e); };
    }
  }
  var timer; function soon(){ clearTimeout(timer); timer = setTimeout(render, 150); }
  function init(){
    var res = el('result'); if(!make || !res) return;
    new MutationObserver(soon).observe(res, {attributes:true, attributeFilter:['style','class','hidden'], childList:true, subtree:true, characterData:true});
    document.addEventListener('click', function(e){ if(e.target.closest('.btn-calc,.btn-reset,[data-set-lang],.lang-btn')) setTimeout(soon, 120); });
    soon();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
