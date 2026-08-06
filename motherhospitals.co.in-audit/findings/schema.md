# Schema Markup Audit — motherhospitals.co.in
**Date:** 2026-08-06
**Auditor:** Claude Code (Schema.org Specialist)
**Business:** Mother Hospitals & IVF Center — IVF & Fertility Clinic, Boduppal, Hyderabad
**Doctor:** Dr. E. Prashanthi Reddy

---

## 1. Schema Inventory

### Homepage (index.html)
| Block | @type | Status |
|---|---|---|
| Block 1 (large array) | MedicalOrganization | Mostly valid — issues noted |
| Block 1 continued | LocalBusiness | FAIL — contains Offer schema (must remove) |
| Block 1 continued | BreadcrumbList | FAIL — hash-only items are invalid |
| Block 1 continued | Physician | Pass |
| Block 1 continued | WebSite + SearchAction | Warn |
| Block 1 continued | ItemList (IVF centers) | Pass |
| Block 1 continued | Review × 3 | Pass |
| Block 2 (line 115) | MedicalClinic | FAIL — duplicate AggregateRating, missing required fields |
| Block 3 (line 117) | DefinedTerm × 5 | Pass (informational) |
| Block 4 (line 126) | VideoObject × 4 | FAIL — channel URL used, not video URL |
| Block 5 (line 134) | MedicalWebPage + speakable | Pass — correctly nested |

### ivf-treatment-hyderabad.html
| Block | @type | Status |
|---|---|---|
| Line 41 | BreadcrumbList + MedicalOrganization + WebPage | Pass |
| Line 95 | **Standalone SpeakableSpecification** | FAIL — must not be standalone |
| Line 96 | Physician | Pass |
| Line 98 | MedicalProcedure | Pass |
| Line 98 (continued) | **HowTo** | FAIL — deprecated rich result (removed Sep 2023) |
| Line 99 | VideoObject | FAIL — channel URL used, not video URL |

### needleless-ivf-hyderabad.html
| Block | @type | Status |
|---|---|---|
| Line 40 | BreadcrumbList + MedicalOrganization + WebPage | Pass |
| Line 94–97 | (not shown — assumed Physician/MedicalProcedure) | Verify |
| Line 100 | MedicalProcedure + **HowTo** | FAIL — HowTo deprecated |
| Line 101 | VideoObject | FAIL — channel URL |

### pcos-treatment-hyderabad.html
| Block | @type | Status |
|---|---|---|
| Line 81 | WebPage + speakable | Pass — correctly nested |
| Line 91 | Physician | Pass |
| Line 104 | BreadcrumbList | Pass |
| Line 105 | VideoObject | FAIL — channel URL |
| Line 106 | **HowTo** | FAIL — deprecated rich result |

### Blog — ivf-success-rate-hyderabad.html
| Block | @type | Status |
|---|---|---|
| Line 29 | BlogPosting + BreadcrumbList | Mostly pass — minor issues |
| Line 33 | MedicalWebPage | FAIL — `identifier` is a raw string, not PropertyValue |
| Line 70 | VideoObject | FAIL — channel URL |

### Blog — low-amh-treatment-guide.html
| Block | @type | Status |
|---|---|---|
| Line 29 | BlogPosting + BreadcrumbList | Pass |
| Line 33 | MedicalWebPage | FAIL — same identifier string issue |
| Line 70 | VideoObject | FAIL — channel URL |

---

## 2. Critical Issues (Fix Immediately)

---

### ISSUE 1 — Offer Schema Present on Homepage (LocalBusiness)
**Priority: Critical**
**File:** index.html — LocalBusiness block
**Problem:** `hasOfferCatalog` contains `Offer` items, including one with `"price":"0"` (free consultation pricing). User instruction: REMOVE all Offer schema — no free consultation pricing.

**Also problematic:** The Mother 9 Antenatal Card Offer with `"price":"500"` attaches a commercial price to a medical service in structured data, which may mislead Google and violates the user's brief.

**Fix:** Remove the entire `hasOfferCatalog` block from the LocalBusiness entity. Replace `availableService` references if needed using `MedicalProcedure` inside `MedicalOrganization.availableService` (already done there — no duplication needed in LocalBusiness).

```json
// REMOVE this entire block from LocalBusiness:
"hasOfferCatalog": {
  "@type": "OfferCatalog",
  "name": "Fertility & Women's Health Services",
  "itemListElement": [ ... ]
}
```

---

### ISSUE 2 — Duplicate + Conflicting AggregateRating (Standalone MedicalClinic block)
**Priority: Critical**
**File:** index.html — line 115

The standalone block:
```json
{"@context":"https://schema.org","@type":"MedicalClinic","name":"Mother Hospitals & IVF Center",
  "aggregateRating":{"@type":"AggregateRating","ratingValue":4.7,"reviewCount":57,...}}
```

**Problems:**
- `reviewCount: 57` conflicts with `reviewCount: 71` in the MedicalOrganization block. Google may show an incorrect number or suppress both.
- MedicalClinic is missing all required/recommended properties: `address`, `url`, `telephone`.
- This block is redundant — AggregateRating is already on MedicalOrganization and LocalBusiness.

**Fix:** Delete this standalone MedicalClinic block entirely. Consolidate to one AggregateRating on LocalBusiness, using a single authoritative reviewCount. Update both blocks to the same figure (71 appears to be the current count from the main block).

Also update LocalBusiness AggregateRating to match:
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": 4.7,
  "reviewCount": 71,
  "bestRating": 5,
  "worstRating": 1
}
```

---

### ISSUE 3 — HowTo Schema on Three Service Pages (Deprecated)
**Priority: Critical**
**Files:** ivf-treatment-hyderabad.html, needleless-ivf-hyderabad.html, pcos-treatment-hyderabad.html

Google removed HowTo rich results in September 2023. HowTo schema no longer generates any SERP feature. The schema is not harmful but wastes payload and may confuse crawlers.

**Fix:** Remove all `@type: "HowTo"` blocks from all service pages. The step-by-step procedural content is already captured in `MedicalProcedure.howPerformed` which is the correct property for medical procedures.

```json
// DELETE blocks like this from service pages:
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "IVF Treatment Process at Mother Hospitals Hyderabad",
  ...
}
```

If the step content is valuable for AI/GEO visibility, embed it in `MedicalProcedure.howPerformed` as a structured string — already done for IVF page.

---

### ISSUE 4 — Standalone SpeakableSpecification Block
**Priority: Critical**
**File:** ivf-treatment-hyderabad.html — line 95

```json
{"@context":"https://schema.org","@type":"SpeakableSpecification",
  "cssSelector":[".page-h1",".page-sub",".direct-answer",".faq-answer",".section-sub"]}
```

A `SpeakableSpecification` must always be a **property** of a `WebPage` (or subtype), never a standalone entity. A free-floating SpeakableSpecification has no subject and will be ignored by Google.

The same page already has `WebPage.speakable` correctly set at line 41. The standalone block is a duplicate and invalid.

**Fix:** Delete the standalone `SpeakableSpecification` block from ivf-treatment-hyderabad.html line 95. Check all other service pages for the same pattern.

---

### ISSUE 5 — VideoObject contentUrl and embedUrl Point to Channel, Not a Video
**Priority: Critical (Rich Results ineligible)**
**Files:** All pages — every VideoObject block

```json
"contentUrl": "https://www.youtube.com/@motherhospitalsivfcenter",
"embedUrl":   "https://www.youtube.com/@motherhospitalsivfcenter"
```

Both values point to the YouTube channel page, not an actual video. Google's VideoObject rich results require `contentUrl` or `embedUrl` to be a **direct video URL** (e.g. `https://www.youtube.com/watch?v=VIDEO_ID` or `https://www.youtube.com/embed/VIDEO_ID`). A channel URL will never pass validation and the rich result will not show.

**Fix options:**

**Option A — Remove VideoObject blocks** until specific video URLs are available. This is the safest short-term fix.

**Option B — Update with real video URLs** for each VideoObject. Example for a real video:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "What is Needleless IVF? | Mother Hospitals Hyderabad",
  "description": "Dr. E. Prashanthi Reddy explains Needleless IVF — injection-free IVF protocol at Mother Hospitals, Boduppal, Hyderabad.",
  "thumbnailUrl": "https://motherhospitals.co.in/assets/Prashanthi/Prashanthi2.jpeg",
  "uploadDate": "2026-03-01",
  "duration": "PT6M30S",
  "contentUrl": "https://www.youtube.com/watch?v=ACTUAL_VIDEO_ID",
  "embedUrl": "https://www.youtube.com/embed/ACTUAL_VIDEO_ID",
  "publisher": {
    "@type": "Organization",
    "name": "Mother Hospitals & IVF Center",
    "logo": {
      "@type": "ImageObject",
      "url": "https://motherhospitals.co.in/assets/logo.webp"
    }
  }
}
```

Replace `ACTUAL_VIDEO_ID` with the real YouTube video ID for each video. Each VideoObject should correspond to one specific video — not a channel page.

---

## 3. Warning-Level Issues (Fix Soon)

---

### ISSUE 6 — BreadcrumbList Homepage Uses Hash-Only Anchor URLs
**Priority: Warning**
**File:** index.html

```json
{"@type":"ListItem","position":2,"name":"IVF Treatment","item":"https://motherhospitals.co.in/#services"},
{"@type":"ListItem","position":3,"name":"Dr. E. Prashanthi Reddy","item":"https://motherhospitals.co.in/#doctor"},
{"@type":"ListItem","position":4,"name":"Awards","item":"https://motherhospitals.co.in/#awards"},
{"@type":"ListItem","position":5,"name":"Contact","item":"https://motherhospitals.co.in/#contact"}
```

BreadcrumbList items should represent distinct navigable pages, not anchor sections of the current page. Hash-only URLs (same page with fragment) are not valid breadcrumb destinations. Google may ignore these items.

**Fix:** Simplify the homepage BreadcrumbList to only the root item, or remove it entirely (a homepage has no parent breadcrumb path):

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://motherhospitals.co.in"
    }
  ]
}
```

Or remove the BreadcrumbList from index.html entirely — it is only meaningful on inner pages.

---

### ISSUE 7 — MedicalWebPage reviewedBy.identifier is a Raw String
**Priority: Warning**
**Files:** blog/ivf-success-rate-hyderabad.html (line 33), blog/low-amh-treatment-guide.html (line 33), and likely all other blog pages

Current (invalid):
```json
"reviewedBy": {
  "@type": "Physician",
  "name": "Dr. E. Prashanthi Reddy",
  "honorificSuffix": "MBBS, DGO, Diploma in ART",
  "identifier": "TGMC-50624"
}
```

`identifier` on a Person should be a `PropertyValue`, not a plain string. Compare the homepage Physician block which correctly uses:

Corrected:
```json
"reviewedBy": {
  "@type": "Physician",
  "name": "Dr. E. Prashanthi Reddy",
  "honorificSuffix": "MBBS, DGO, Diploma in ART",
  "identifier": {
    "@type": "PropertyValue",
    "name": "TGMC Registration",
    "value": "50624"
  },
  "url": "https://motherhospitals.co.in/dr-prashanthi-reddy.html"
}
```

Apply this fix to the `MedicalWebPage.reviewedBy` block on all blog posts. A global component/include for this block would prevent recurrence.

---

### ISSUE 8 — WebSite SearchAction URL Template May Not Resolve
**Priority: Warning**
**File:** index.html

```json
"potentialAction": {
  "@type": "SearchAction",
  "target": {"@type":"EntryPoint","urlTemplate":"https://motherhospitals.co.in/?s={search_term_string}"},
  "query-input": "required name=search_term_string"
}
```

The `/?s=` parameter is a WordPress search convention. If this is a static HTML site, `/?s=query` will not return search results. Google's Sitelinks Searchbox requires the target URL to actually return results. If the search page does not work, remove this `potentialAction` block.

**Fix:** Either implement a working site search at `/?s=` and test it, or remove the `potentialAction` block from the WebSite entity entirely.

---

### ISSUE 9 — BlogPosting Author URL Points to Homepage Anchor
**Priority: Info**
**Files:** All blog pages

```json
"author": {
  "@type": "Person",
  "name": "Dr. E. Prashanthi Reddy",
  "jobTitle": "Fertility Specialist",
  "url": "https://motherhospitals.co.in/#doctor"
}
```

The author URL is `#doctor` (a homepage anchor). Google's E-E-A-T signals are stronger when the author URL points to a dedicated author/bio page.

**Recommended fix:** Update to the dedicated doctor page:
```json
"author": {
  "@type": "Person",
  "name": "Dr. E. Prashanthi Reddy",
  "jobTitle": "Fertility Specialist & IVF Consultant",
  "url": "https://motherhospitals.co.in/dr-prashanthi-reddy.html",
  "sameAs": "https://motherhospitals.co.in/dr-prashanthi-reddy.html"
}
```

---

## 4. Confirmed Passes

The following are validated and correctly implemented:

- **MedicalOrganization** — all required fields present (name, address, telephone, url, medicalSpecialty). HTTPS context. Absolute URLs. ISO 8601 times. ART Act 2021 credential correctly modelled.
- **Physician block (homepage)** — qualifications, TGMC identifier (PropertyValue), alumniOf, hasCredential, knowsLanguage all correctly structured.
- **MedicalProcedure blocks (ivf-treatment-hyderabad.html, needleless-ivf-hyderabad.html)** — rich detail: procedureType, indication (MedicalIndication), contraindication, recognizingAuthority, performer, location, howPerformed. Well above minimum requirements.
- **BreadcrumbList (service pages)** — 2-level breadcrumbs (Home → Page) with absolute URLs. Correct.
- **WebPage.speakable** — correctly nested as a property of WebPage/MedicalWebPage on index.html, pcos-treatment-hyderabad.html, ivf-treatment-hyderabad.html (via WebPage block), and needleless-ivf-hyderabad.html. Format is valid.
- **BlogPosting** — headline, datePublished, dateModified, author, publisher (with ImageObject logo), mainEntityOfPage, image, description all present. Correct.
- **BreadcrumbList on blog pages** — 3-level (Home → Blog → Post). Correct.
- **Review × 3 (homepage)** — itemReviewed (MedicalOrganization), reviewRating (Rating with bestRating), author (Person), datePublished (ISO 8601), reviewBody all present. Valid.
- **DefinedTerm blocks** — non-rich-result informational schema, valid structure.
- **MedicalWebPage** — reviewedBy, medicalAudience, lastReviewed, datePublished, dateModified, specialty present on homepage.

---

## 5. Missing Schema Opportunities

### 5A — MedicalCondition for PCOS/PMOS page
The PCOS page currently has WebPage, Physician, BreadcrumbList, VideoObject, and HowTo. There is no `MedicalCondition` entity describing PCOS itself.

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalCondition",
  "name": "Polycystic Ovary Syndrome",
  "alternateName": ["PCOS", "PMOS", "Polycystic Ovarian Morphology Syndrome"],
  "description": "PCOS (renamed PMOS by the Endocrine Society in 2026) is a hormonal disorder in women characterised by irregular or absent periods, elevated androgens, and polycystic ovaries. It is the leading cause of anovulatory infertility.",
  "code": {
    "@type": "MedicalCode",
    "code": "E28.2",
    "codingSystem": "ICD-10"
  },
  "possibleTreatment": [
    {
      "@type": "MedicalTherapy",
      "name": "Ovulation Induction with Letrozole"
    },
    {
      "@type": "MedicalTherapy",
      "name": "IUI — Intrauterine Insemination"
    },
    {
      "@type": "MedicalTherapy",
      "name": "IVF with Freeze-All Strategy"
    }
  ],
  "recognizingAuthority": {
    "@type": "Organization",
    "name": "Endocrine Society"
  },
  "relevantSpecialty": {
    "@type": "MedicalSpecialty",
    "name": "ReproductiveMedicine"
  }
}
```

### 5B — Person (Physician) sameAs to Google Knowledge Panel / LinkedIn
The Physician block on the homepage does not have a `sameAs` pointing to an external authoritative source (Google Business Profile, LinkedIn, Practo). This would strengthen E-E-A-T.

```json
"sameAs": [
  "https://motherhospitals.co.in/dr-prashanthi-reddy.html",
  "https://www.practo.com/hyderabad/doctor/prashanthi-reddy-gynecologist"
]
```

### 5C — Event schema for fertility awareness camps or consultation days
If Mother Hospitals runs periodic fertility camps or open consultation events, `Event` schema would be appropriate and eligible for rich results.

### 5D — MedicalWebPage on all service pages (not just homepage)
Most service pages have a `WebPage` block. Upgrading these to `MedicalWebPage` (with `reviewedBy`, `medicalAudience: Patient`, `lastReviewed`, `specialty`) strengthens medical E-E-A-T signals for YMYL (Your Money Your Life) content.

Corrected template for service pages:
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "PAGE TITLE",
  "url": "https://motherhospitals.co.in/PAGE-SLUG.html",
  "description": "PAGE META DESCRIPTION",
  "datePublished": "2024-01-01",
  "dateModified": "2026-07-01",
  "lastReviewed": "2026-07-01",
  "reviewedBy": {
    "@type": "Physician",
    "name": "Dr. E. Prashanthi Reddy",
    "honorificSuffix": "MBBS, DGO, Diploma in ART",
    "identifier": {
      "@type": "PropertyValue",
      "name": "TGMC Registration",
      "value": "50624"
    },
    "url": "https://motherhospitals.co.in/dr-prashanthi-reddy.html"
  },
  "medicalAudience": {
    "@type": "MedicalAudience",
    "audienceType": "Patient"
  },
  "specialty": "ReproductiveMedicine",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Mother Hospitals & IVF Center",
    "url": "https://motherhospitals.co.in"
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".page-sub", ".section-title", ".direct-answer"]
  }
}
```

---

## 6. Summary Action List

| # | Issue | Priority | File(s) | Action |
|---|---|---|---|---|
| 1 | Offer / hasOfferCatalog schema | Critical | index.html | Remove entire hasOfferCatalog block |
| 2 | Duplicate conflicting AggregateRating | Critical | index.html | Delete standalone MedicalClinic block; unify reviewCount to 71 |
| 3 | HowTo schema (deprecated Sep 2023) | Critical | ivf-treatment, needleless-ivf, pcos-treatment | Remove all HowTo blocks |
| 4 | Standalone SpeakableSpecification | Critical | ivf-treatment-hyderabad.html line 95 | Delete the standalone block |
| 5 | VideoObject channel URL (not video URL) | Critical | All pages | Either supply real video URLs or remove VideoObject blocks |
| 6 | BreadcrumbList hash-only items | Warning | index.html | Simplify to position 1 only or remove |
| 7 | MedicalWebPage reviewedBy.identifier string | Warning | All blog pages | Replace string with PropertyValue object |
| 8 | WebSite SearchAction non-functional URL | Warning | index.html | Test or remove potentialAction |
| 9 | BlogPosting author URL is anchor | Info | All blog pages | Point to /dr-prashanthi-reddy.html |
| 10 | MedicalCondition missing on PCOS page | Opportunity | pcos-treatment-hyderabad.html | Add MedicalCondition block |
| 11 | WebPage → MedicalWebPage upgrade | Opportunity | All service pages | Upgrade for YMYL E-E-A-T |

---

## 7. FAQPage Note

No FAQPage schema was found in the sampled pages. This is correct — Google retired FAQ rich results for all sites on 7 May 2026. Do not add FAQPage schema to any page.

---

*Audit generated by Claude Code Schema Specialist — 2026-08-06*
