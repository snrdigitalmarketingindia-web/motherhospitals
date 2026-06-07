# Telugu i18n Handoff — MotherHospital Session 4 Complete ✅

## Task Overview
Add English ↔ Telugu toggle to ALL 15 free fertility tool pages.
**DO NOT deploy. DO NOT change calculator logic. DO NOT change SEO.**

---

## Architecture (Already Built)

### Engine
`/scripts/i18n.js` — COMPLETE ✅
- Reads `window.pageT = { en: {...}, te: {...} }` defined per-page
- Applies `data-i18n="key"` → innerHTML swap
- Applies `data-i18n-ph="key"` → placeholder swap
- Shows/hides `data-lang="en"` / `data-lang="te"` block elements
- Persists language in `localStorage('mh_lang')`
- Injects toggle UI after `<nav>` automatically
- Exports global `t(key)` helper for JS result strings
- Exports `window._reapplyResults` hook — page sets this to re-render dynamic results on lang switch

### Pattern Per Page
Each page needs:
1. `window.pageT = { en: {...}, te: {...} }` in a `<script>` block BEFORE i18n.js
2. `<script src="/scripts/i18n.js"></script>`
3. `data-i18n="key"` on static UI elements
4. `data-lang="en"` / `data-lang="te"` on long content blocks (FAQs, educational sections)
5. `t('key')` calls in JS result rendering functions
6. `window._reapplyResults = function(){...}` to re-render results on lang switch

### Telugu Writing Style Rule
❌ No textbook/dictionary Telugu
✅ Conversational Tenglish — how a counsellor at Mother Hospitals would speak to a patient
Examples:
- "అండోత్సర్గ తేదీ" → ❌ | "ఓవ్యులేషన్ డేట్" → ✅
- "ఋతుస్రావం" → ❌ | "పీరియడ్" → ✅
- "ఫలితాలను గణించండి" → ❌ | "రిజల్ట్ చూడండి" → ✅

---

## Completion Status — ALL 15 TOOLS DONE ✅

### ✅ Batch 1 (4 tools) — COMMITTED
| File | Status |
|------|--------|
| `period-tracker.html` | ✅ Complete |
| `ovulation-calculator.html` | ✅ Complete |
| `due-date-calculator.html` | ✅ Complete |
| `pregnancy-week-tracker.html` | ✅ Complete (BABY_DATA_TE bilingual data) |

### ✅ Batch 2 (3 tools) — COMMITTED
| File | Status |
|------|--------|
| `amh-interpreter.html` | ✅ Complete |
| `pcos-assessment.html` | ✅ Complete |
| `ivf-success-estimator.html` | ✅ Complete |

### ✅ Batch 3 (4 tools) — COMMITTED
| File | Status |
|------|--------|
| `semen-analysis-interpreter.html` | ✅ Complete |
| `fertility-window-planner.html` | ✅ Complete |
| `best-days-to-conceive.html` | ✅ Complete |
| `conception-calculator.html` | ✅ Complete |

### ✅ Batch 4 (4 tools) — COMMITTED (Session 4)
| File | Notes |
|------|-------|
| `fertility-assessment.html` | ✅ 12-question bilingual quiz; index-based scoring in sels[]; flag conditions converted from score→index |
| `ivf-timeline-planner.html` | ✅ 4 protocols; event_te/desc_te fields on event objects; phaseLabels map inline |
| `endometrial-thickness-calculator.html` | ✅ 6 result states; {mm} placeholder substitution in detail strings |
| `bmi-fertility-calculator.html` | ✅ 6 BMI categories; {p5}/{p10}/{loss}/{gainLow}/{gainHigh}/{idealLow}/{idealHigh}/{target32} placeholders; PCOS suffix keys |

### ⏳ Remaining (lower priority)
- `fertility-tools.html` hub page — add toggle (mostly static, no calculator logic)

---

## Next Steps
1. Review all 15 tools in browser (both EN and TE modes)
2. Add toggle to `fertility-tools.html` hub page
3. Get approval to deploy → push to `main` → Netlify auto-deploys

## Git Log (i18n commits)
```
0248ea7  feat: Telugu i18n toggle — Batch 4 fertility tools
1670d99  Add EN↔TE i18n — Batch 3: 4 tools
828703b  Add EN↔TE i18n — Batch 2 complete: ivf-success-estimator
cd8b831  Add EN↔TE i18n — Batch 2 part 1: amh-interpreter + pcos-assessment
[batch 1 commits before these]
```

---

## Key Files / Paths
- Project root: `/Users/apple/Documents/motherhospitalswebsite/`
- i18n engine: `/Users/apple/Documents/motherhospitalswebsite/scripts/i18n.js`
- All 15 tool pages are in the project root
- Git remote: `snrdigitalmarketingindia-web/motherhospitals` (GitHub)
- Netlify auto-deploys on push to `main`

---

## Reference: Completed Translation Keys (period-tracker.html)
Use this as a template for other pages. Key pattern:

```js
window.pageT = {
  en: {
    hero_badge:'Free Fertility Tool · Mother Hospitals Hyderabad',
    hero_h1:'...',
    hero_sub:'...',
    btn_calc:'Calculate →',
    btn_reset:'↩ Reset',
    cta_h2:'...', cta_p:'...', cta_call:'📞 Call 97059 93366',
    cta_wa:'💬 WhatsApp Appointment',
    cta_sub:'📍 Boduppal, Hyderabad · Mon–Sat 9am–7pm',
    // Alert messages
    alert_enter_lmp:'Please enter...',
    // Dynamic JS strings
    today:'Today!', in_days:'{n} రోజుల్లో',
  },
  te: {
    hero_badge:'ఉచిత టూల్ · మదర్ హాస్పిటల్స్ హైదరాబాద్',
    hero_h1:'...',
    // ... all keys repeated in Telugu
  }
};
```

---

## DO NOT
- DO NOT change any calculator formulas or logic
- DO NOT change SEO (URLs, meta tags, canonical, schema)
- DO NOT deploy until all batches are done and reviewed
- DO NOT use textbook Telugu — use conversational Tenglish
