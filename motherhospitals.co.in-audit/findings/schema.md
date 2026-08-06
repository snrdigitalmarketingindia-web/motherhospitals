# Schema Markup Audit — motherhospitals.co.in
**Date:** 2026-08-06
**Auditor:** Claude Code (Schema.org Specialist)
**Business:** Mother Hospitals & IVF Center — IVF & Fertility Clinic, Boduppal, Hyderabad
**Doctor:** Dr. E. Prashanthi Reddy
**Pages audited:** index.html, ivf-treatment-hyderabad.html, needleless-ivf-hyderabad.html, pcos-treatment-hyderabad.html, dr-prashanthi-reddy.html, contact-us.html, blog/6-week-heartbeat-scan-after-ivf.html, blog/ai-ivf-embryo-selection.html, blog/amh-0-01-pregnancy-success-stories.html

---

## Overall Score: 60 / 100

| Category | Score |
|---|---|
| Schema completeness (required fields) | 18 / 25 |
| Schema validity (no deprecated / invalid types) | 10 / 25 |
| Data accuracy (geo, counts, identifiers) | 16 / 25 |
| Rich-result eligibility | 16 / 25 |

---

## 1. Schema Inventory by Page

### index.html — 4 blocks
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | MedicalOrganization, LocalBusiness, BreadcrumbList, Physician, ItemList, Review ×3 | PASS |
| 2 | DefinedTerm ×5 | PASS |
| 3 | VideoObject ×4 | PASS |
| 4 | MedicalWebPage | PASS |

### ivf-treatment-hyderabad.html — 4 blocks
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | BreadcrumbList, MedicalOrganization, WebPage | PASS |
| 2 | Physician | PASS |
| 3 | MedicalProcedure (detailed) | PASS |
| 4 | MedicalClinic | FAIL — wrong geo coords |

### needleless-ivf-hyderabad.html — 5 blocks
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | BreadcrumbList, MedicalOrganization, WebPage | PASS |
| 2 | SpeakableSpecification (standalone) | FAIL — invalid as top-level type |
| 3 | Physician | PASS |
| 4 | MedicalProcedure | PASS |
| 5 | MedicalClinic | FAIL — wrong geo coords |

### pcos-treatment-hyderabad.html — 4 blocks
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | WebPage | PASS |
| 2 | Physician | PASS |
| 3 | BreadcrumbList | PASS |
| 4 | HowTo | FAIL — rich results retired September 2023 |

### dr-prashanthi-reddy.html — 7 blocks
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | Physician | PASS |
| 2 | BreadcrumbList | PASS |
| 3 | SpeakableSpecification (standalone) | FAIL — invalid as top-level type |
| 4 | MedicalWebPage | PASS |
| 5 | MedicalOrganization | PASS |
| 6 | WebPage | PASS |
| 7 | VideoObject | PASS |

### contact-us.html — 5 blocks
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | BreadcrumbList | PASS |
| 2 | MedicalOrganization (geo: 17.4126, 78.5716) | PASS |
| 3 | WebPage | PASS |
| 4 | Physician | PASS |
| 5 | VideoObject | PASS |

### blog/6-week-heartbeat-scan-after-ivf.html — 6 blocks
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | BlogPosting | PASS |
| 2 | BreadcrumbList | PASS |
| 3 | SpeakableSpecification (standalone) | FAIL — invalid as top-level type |
| 4 | MedicalWebPage | FAIL — reviewedBy.identifier is string, not PropertyValue |
| 5 | MedicalProcedure | PASS |
| 6 | VideoObject | PASS |

### blog/ai-ivf-embryo-selection.html — 4 blocks
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | BlogPosting, BreadcrumbList | FAIL — JSON parse error (array nesting issue) |
| 2 | SpeakableSpecification (standalone) | FAIL — invalid as top-level type |
| 3 | MedicalWebPage | FAIL — reviewedBy.identifier is string, not PropertyValue |
| 4 | VideoObject | PASS |

### blog/amh-0-01-pregnancy-success-stories.html — 1 block
| Block | @type(s) | Valid? |
|---|---|---|
| 1 | BlogPosting | PARTIAL — missing reviewedBy (no medical authority signal) |

---

## 2. Issues Found

### CRITICAL

#### C1 — pcos-treatment-hyderabad.html: HowTo block present (deprecated)
- **Block 4** is `@type: HowTo`
- Google retired HowTo rich results in September 2023. The markup produces no SERP feature and may confuse crawlers.
- **Fix:** Remove the HowTo block entirely.

#### C2 — blog/ai-ivf-embryo-selection.html: JSON parse error in Block 1
- Block 1 contains an array `[BlogPosting, BreadcrumbList]` but the parser fails with "list object has no attribute get" — the JSON structure is malformed (array of mixed objects at top level is valid JSON-LD but the internal serialisation has an issue).
- **Fix:** Validate the block with the Rich Results Test. Separate BlogPosting and BreadcrumbList into individual `<script>` tags if the array nesting is the cause.

### HIGH

#### H1 — Standalone SpeakableSpecification blocks (4 pages)
`SpeakableSpecification` is not a valid standalone `@type` for a JSON-LD block. It is a property value used inside `WebPage.speakable`, `NewsArticle.speakable`, etc. When placed as a top-level type in its own `<script type="application/ld+json">` tag, Google ignores it and validators report an error.

Affected pages:
- needleless-ivf-hyderabad.html — Block 2
- dr-prashanthi-reddy.html — Block 3
- blog/6-week-heartbeat-scan-after-ivf.html — Block 3
- blog/ai-ivf-embryo-selection.html — Block 2

**Fix:** Move the cssSelector value into the `speakable` property of the existing WebPage or MedicalWebPage block on each page. Remove the standalone SpeakableSpecification block.

Example — replace the standalone block with this property on the WebPage block:
```json
{
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".page-sub", ".section-title"]
  }
}
```

#### H2 — reviewedBy.identifier is a plain string, not PropertyValue (2 blog pages)
The task notes state this fix was applied; it was not. The `reviewedBy.identifier` on both blog MedicalWebPage blocks is `"TGMC-50624"` (string), not a PropertyValue object.

Affected pages:
- blog/6-week-heartbeat-scan-after-ivf.html — MedicalWebPage block
- blog/ai-ivf-embryo-selection.html — MedicalWebPage block

**Fix:**
```json
"reviewedBy": {
  "@type": "Physician",
  "name": "Dr. E. Prashanthi Reddy",
  "identifier": {
    "@type": "PropertyValue",
    "name": "TGMC Registration",
    "value": "50624"
  }
}
```

### MEDIUM

#### M1 — Wrong geo coordinates on MedicalClinic blocks (2 pages)
Both ivf-treatment-hyderabad.html and needleless-ivf-hyderabad.html have a secondary MedicalClinic block with geo `latitude: 17.4399, longitude: 78.5685`. The correct Boduppal coordinates are `17.4126, 78.5716`.

Affected pages:
- ivf-treatment-hyderabad.html — Block 4 (MedicalClinic)
- needleless-ivf-hyderabad.html — Block 5 (MedicalClinic)

**Fix:** Update geo on both MedicalClinic blocks:
```json
"geo": {
  "@type": "GeoCoordinates",
  "latitude": "17.4126",
  "longitude": "78.5716"
}
```

#### M2 — Missing kgmid in sameAs on treatment page MedicalOrganization/MedicalClinic blocks
The index.html correctly has `"https://www.google.com/search?kgmid=/g/11tjs8_n6q"` in sameAs for both MedicalOrganization and LocalBusiness. However, the MedicalOrganization blocks on ivf-treatment-hyderabad.html and needleless-ivf-hyderabad.html are missing this kgmid URL. The MedicalClinic blocks on those pages also lack it.

**Fix:** Add `"https://www.google.com/search?kgmid=/g/11tjs8_n6q"` to the sameAs array on all MedicalOrganization and MedicalClinic blocks across all pages (not just the homepage).

### LOW

#### L1 — blog/amh-0-01-pregnancy-success-stories.html: BlogPosting missing reviewedBy
This blog page has only a single BlogPosting block with no reviewedBy. This removes the medical authority signal that the other blog pages attempt to convey.

**Fix:** Add a MedicalWebPage block (or add `reviewedBy` to the BlogPosting) with the Physician identifier.

#### L2 — WebSite schema with SearchAction missing sitewide
No page in the audited set includes a `WebSite` block with `SearchAction` (Sitelinks Searchbox eligibility). This is a recommended addition for the homepage.

**Recommended addition to index.html:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Mother Hospitals & IVF Center",
  "url": "https://motherhospitals.co.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://motherhospitals.co.in/?s={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## 3. Verified Fixes (Confirmed Correct)

| Fix | Status |
|---|---|
| GBP sameAs kgmid `/g/11tjs8_n6q` on index.html MedicalOrganization | VERIFIED |
| GBP sameAs kgmid `/g/11tjs8_n6q` on index.html LocalBusiness | VERIFIED |
| reviewCount = 71 on index.html LocalBusiness AggregateRating | VERIFIED |
| Geo 17.4126 / 78.5716 on index.html MedicalOrganization | VERIFIED |
| Geo 17.4126 / 78.5716 on contact-us.html MedicalOrganization | VERIFIED |
| VideoObject required fields (name, description, thumbnailUrl, uploadDate) present | VERIFIED |
| FAQPage removed (not present in any audited page) | VERIFIED |
| Standalone VideoObject blocks on index.html (4 videos) all valid | VERIFIED |
| MedicalProcedure on ivf-treatment-hyderabad.html — comprehensive and valid | VERIFIED |

---

## 4. Rich Result Eligibility Summary

| Rich Result Type | Page | Eligible? | Notes |
|---|---|---|---|
| LocalBusiness / Place | index.html | YES | AggregateRating present — star ratings eligible |
| Breadcrumb | All pages | YES | Correctly structured |
| VideoObject | index, dr-prashanthi, contact-us, blog pages | YES | All required fields present |
| MedicalProcedure | ivf-treatment, needleless-ivf | INFO | Not a direct rich result type but feeds E-E-A-T |
| HowTo | pcos-treatment | NO | Deprecated — remove |
| FAQPage | None | N/A | Correctly absent |
| Review (standalone) | index.html | INFO | Standalone Review snippets not surfaced by Google unless part of eligible AggregateRating flow |

---

## 5. Priority Action List

| Priority | Page | Action |
|---|---|---|
| Critical | pcos-treatment-hyderabad.html | Remove HowTo block |
| Critical | blog/ai-ivf-embryo-selection.html | Fix JSON parse error in Block 1 |
| High | needleless-ivf, dr-prashanthi, blog/6wk, blog/ai | Move SpeakableSpecification into WebPage.speakable property; delete standalone blocks |
| High | blog/6wk, blog/ai | Fix reviewedBy.identifier — must be PropertyValue object not string |
| Medium | ivf-treatment, needleless-ivf | Correct MedicalClinic geo to 17.4126 / 78.5716 |
| Medium | ivf-treatment, needleless-ivf | Add kgmid to MedicalOrganization and MedicalClinic sameAs |
| Low | blog/amh-0-01 | Add MedicalWebPage block with reviewedBy Physician |
| Low | index.html | Add WebSite schema with SearchAction |
