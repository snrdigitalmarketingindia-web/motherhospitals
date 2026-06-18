(function(){
  var FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSeApfdnBsBjsoqIU3teeS062EEfuprY-CY8riVIWM8aY0LL9A/formResponse';
  var SK = 'mh_ft_user';

  /* inputs to capture per tool page slug */
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

  function getUser(){
    try{ return JSON.parse(localStorage.getItem(SK)); } catch(e){ return null; }
  }

  function postToSheet(toolLabel, inputSummary){
    var user = getUser();
    var name  = user ? user.name  : 'Guest';
    var email = user ? user.email : '';
    var url = FORM
      + '?entry.1033771490=' + encodeURIComponent(name)
      + '&entry.826156409='  + encodeURIComponent(email)
      + '&entry.1895050244=' + encodeURIComponent(toolLabel)
      + '&entry.957846797='  + encodeURIComponent(inputSummary);
    fetch(url, {method:'POST', mode:'no-cors'}).catch(function(){});
  }

  function collectAndPost(tool){
    var parts = [];
    tool.ids.forEach(function(id){
      var v = val(id);
      if(v) parts.push(id + ': ' + v);
    });
    /* also capture any checked diagnosis chips */
    var chips = document.querySelectorAll('.checkbox-chip.checked');
    if(chips.length){
      var dx = [];
      chips.forEach(function(c){ dx.push(c.textContent.trim()); });
      parts.push('Diagnoses: ' + dx.join(', '));
    }
    /* PCOS / fertility assessment — capture all answered radio/select */
    if(!tool.ids.length){
      var answered = [];
      document.querySelectorAll('select,input[type=radio]:checked').forEach(function(el){
        if(el.value && el.id) answered.push(el.id + ':' + el.value);
      });
      if(answered.length) parts.push(answered.slice(0,8).join(' | '));
    }
    var summary = parts.length ? parts.join(' | ') : '(no inputs captured)';
    postToSheet(tool.label, summary);
    if(typeof gtag !== 'undefined') gtag('event','tool_used',{tool_name: tool.label});
  }

  /* detect current tool from URL */
  function init(){
    var slug = location.pathname.replace(/^\/|\.html$/g,'');
    var tool = TOOL_MAP[slug];
    if(!tool) return;

    var btn = document.querySelector('.btn-calc');
    if(!btn) return;

    btn.addEventListener('click', function(){
      /* delay slightly so the calc function runs first */
      setTimeout(function(){ collectAndPost(tool); }, 600);
    }, {once: false});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
