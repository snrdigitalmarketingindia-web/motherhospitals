# Local SEO Audit — motherhospitals.co.in
**Audit date:** 2026-08-06
**Auditor:** Claude Code (Local SEO Specialist, claude-sonnet-4-6)
**Scope:** 462 HTML pages audited programmatically; homepage and 4 representative pages fetched live via Playwright render.
**Recent fixes acknowledged:** 69 location pages geo-coordinates updated to 17.4126 / 78.5716 / 500092; GBP sameAs updated to kgmid /g/11tjs8_n6q; reviewCount updated to 71.

---

## Local SEO Score: 65 / 100

| Dimension | Weight | Raw % | Weighted |
|-----------|--------|-------|----------|
| GBP Signals | 25% | 68% | 17.0 |
| Reviews & Reputation | 20% | 70% | 14.0 |
| Local On-Page SEO | 20% | 70% | 14.0 |
| NAP Consistency & Citations | 15% | 53% | 8.0 |
| Local Schema Markup | 10% | 60% | 6.0 |
| Local Link & Authority Signals | 10% | 60% | 6.0 |
| **Total** | | | **65 / 100** |

---

## Business Type: Brick-and-Mortar (Primary) + Hybrid signals

- Visible street address on all pages; Google Maps iframe embed on homepage
- hasMap link present site-wide
- Satellite location (Choutuppal) modelled as `department` sub-entity — correct approach
- SAB-style language ("serving East Hyderabad", 100+ area-targeting pages) used for content strategy only; physical address is always the primary entity signal

---

## Industry Vertical: Healthcare — Fertility / Reproductive Medicine

Detection signals: IVF, ICSI, embryo, AMH, ART Act 2021, TGMC Reg 50624, "Dr.", appointment CTAs, Physician schema, medical specialty tags.
Schema subtype used: `MedicalOrganization` (homepage), `["MedicalClinic","LocalBusiness"]` (location pages), `Physician` (doctor page) — all correct for this vertical. `FertilityClinic` does not exist as a schema.org type; `MedicalClinic` is the recommended specific subtype.

---

## NAP Consistency Audit

### Source Comparison

| Field | Homepage JSON-LD | Location Pages (canonical) | Geo meta tag |
|-------|-----------------|---------------------------|--------------|
| Name | Mother Hospitals & IVF Center | Mother Hospitals & IVF Center | — |
| Street | **1st Floor, Unit Nos. 201-204, Block A, Aakruthi Township, Tulip Block, Mallikarjuna Nagar** | Unit Nos. 201-204, Block A, Aakruthi Township, Boduppal | — |
| Locality | Boduppal | Hyderabad | — |
| PostalCode | 500092 | 500092 | — |
| Phone primary | +919705993366 | +919705993366 | — |
| Phone secondary | +919705993355 | — | — |
| Geo lat | 17.4126 | 17.4126 | 17.4126 |
| Geo lon | 78.5716 | 78.5716 | 78.5716 |

### Address Variant Audit (all 462 pages)

| Street Address String | Count | Status |
|-----------------------|-------|--------|
| `Unit Nos. 201-204, Block A, Aakruthi Township, Boduppal` | 503 | Canonical — CORRECT |
| `Unit Nos. 201-204, Block A, Aakruthi Township, Tulip Block, Boduppal` | 19 | Minor — "Tulip Block" is extra token |
| `Unit Nos. 201–204, Block A, Aakruthi Township, Boduppal` | 8 | En-dash vs hyphen — minor parser noise |
| `1st Floor, Unit Nos. 201-204, Block A, Aakruthi Township, Tulip Block, Mallikarjuna Nagar` | 3 | **WRONG locality — homepage uses this** |
| `Unit Nos. 201-204, Block A, Aakruthi Township, Tulip Block, Mallikarjuna Nagar` | 3 | Wrong locality |
| Other variants | 3 | Minor formatting differences |

**Critical flag:** The homepage `MedicalOrganization` schema uses "Mallikarjuna Nagar" as the locality name — not "Boduppal." This is the highest-authority page Google processes first when building the Knowledge Panel entity. The mismatch creates a divergence between the homepage entity and the canonical address used on 503 location pages.

**Secondary phone placement:** +919705993355 (Choutuppal branch) appears in the homepage primary `telephone` array. It should appear only inside the `department` sub-entity. The primary entity's telephone should be the Boduppal number only.

---

## GBP Signals Assessment

| Signal | Status | Notes |
|--------|--------|-------|
| Google Maps iframe embed | PRESENT | Homepage has functional embed via `maps.google.com/maps?q=...` |
| kgmid in sameAs | PRESENT — homepage only | `/g/11tjs8_n6q` in homepage MedicalOrganization sameAs |
| kgmid on location pages | MISSING | 228 pages have sameAs arrays without kgmid; only 1 page carries it |
| GBP short URL / Place ID embed | MISSING | Maps embed uses query-string (text search) not Place ID — non-deterministic |
| YouTube channel linked | PRESENT | `@motherhospitalsivfcenter` in sameAs + VideoObject schema |
| Facebook linked | PRESENT | `facebook.com/motherhospitals/` |
| Instagram linked | PRESENT | `instagram.com/motherhospitalsivf/` |
| Justdial in sameAs | PRESENT — homepage only | Tier 1 India citation confirmed |
| Review widget on page | NOT DETECTED | aggregateRating in schema only; no live review carousel widget |
| GBP Posts indicators | NOT DETECTED | No embedded posts or post indicators |
| Photo gallery | PRESENT | `/gallery.html`, doctor photos, VideoObject thumbnails |
| Appointment / booking CTA | PRESENT | WhatsApp + call CTAs site-wide |

**GBP primary category (Whitespark 2026 #1 ranking factor):** Cannot be verified from page HTML — must be checked inside the GBP dashboard. Recommended: Primary = "Fertility Clinic" (if available in India GBP listings) or "Obstetrician-Gynecologist Clinic". Secondary = "Maternity Hospital", "Women's Health Clinic". Wrong primary category is the single largest negative local ranking factor.

---

## Review Health Snapshot

| Metric | Value | Assessment |
|--------|-------|------------|
| AggregateRating — schema (location pages) | 4.7 / 5 | Strong |
| reviewCount — location pages | 71 | Consistent — recent update applied correctly across 296 pages |
| AggregateRating — homepage schema | **MISSING** | Homepage MedicalOrganization has no aggregateRating |
| Review velocity | Unknown | Cannot assess without GBP dashboard access |
| Owner response rate | Unknown | Not assessable from page HTML |
| Review count vs competitors | Unknown | Typical top IVF clinics in Hyderabad have 150–350+ reviews |

**Highest-priority gap:** The homepage `MedicalOrganization` schema lacks `aggregateRating` entirely. This is the page that Google most directly associates with the Knowledge Panel and rich results. Without it, star ratings cannot appear on the homepage SERP entry even though the schema is technically correct on location pages.

**Review velocity — Sterling Sky 18-day rule:** Verify inside GBP that at least one new review has been received within the last 18 days. If the last review is older than 3 weeks, local pack rankings are at elevated risk. A review generation campaign (WhatsApp/SMS follow-up to recent patients) should be running continuously.

---

## Local Schema Validation

### Homepage — MedicalOrganization

| Property | Status | Detail |
|----------|--------|--------|
| `@type` | MedicalOrganization | Correct; MedicalClinic would be more specific |
| `name` | Pass | |
| `address.streetAddress` | FAIL | "Mallikarjuna Nagar" — wrong locality in address |
| `address.postalCode` | Pass | 500092 |
| `telephone` | Pass | Both numbers present |
| `geo` | Pass — 4 decimal precision | 17.4126, 78.5716; 5 decimals recommended |
| `openingHoursSpecification` | PARTIAL | Morning only (10:30–13:30, all 7 days); evening session absent from this block |
| `aggregateRating` | **MISSING** | Critical gap — must add (4.7, 71 reviews) |
| `sameAs` | Pass — 5 profiles + kgmid | Justdial, Facebook, Instagram, YouTube, kgmid present |
| `hasMap` | Pass | |
| `availableService` | Pass | 16 MedicalProcedure entries |
| `medicalSpecialty` | Pass | Obstetrics, Gynecology, ReproductiveMedicine |

### Location Pages — MedicalClinic + LocalBusiness

| Property | Status | Detail |
|----------|--------|--------|
| `@type` | Pass | ["MedicalClinic","LocalBusiness"] — correct dual typing |
| `address.streetAddress` | Pass | Canonical address used |
| `geo` | Pass | 17.4126, 78.5716 on checked pages |
| `openingHoursSpecification` | PARTIAL | Morning only on most pages; evening session absent |
| `aggregateRating` | Pass | 4.7, 71 — consistent |
| `sameAs` | PARTIAL | Facebook, Instagram, YouTube present; kgmid absent |
| Duplicate schema block | PRESENT | `ivf-center-boduppal.html` carries a second bare `MedicalClinic` block with only `name` and `url` — redundant, should be removed |

### Opening Hours — Critical Inconsistency

| Hours value in schema | Page count | Assessment |
|-----------------------|------------|------------|
| `10:30–13:30` (morning only) | 176 pages | Incomplete — missing evening |
| `Mo-Sa 09:00–18:00` (full day, string format) | 31 pages | Conflicts with actual sessions |
| `17:30–20:30` (evening only) | 10 pages | Incomplete — missing morning |
| `16:00–20:00` | 2 pages | Different evening time |
| Other variants | 3 pages | |

If the clinic operates two daily sessions (e.g. 10:30–13:30 and 17:30–20:30), each session must be a separate `OpeningHoursSpecification` object. A single-object schema showing only one session tells Google the clinic is open for half a day only. The `Mo-Sa 09:00-18:00` string format on 31 pages conflicts with the `openingHoursSpecification` objects on the same pages, creating a structured data conflict.

### Geo Coordinate Coverage

| Status | Page count | % of total |
|--------|------------|------------|
| Correct geo (17.4126 / 78.5716) | 399 | 86.4% |
| Missing geo coordinates | 63 | 13.6% |

63 pages did not receive the coordinate update applied to the other 399. These fail geo schema validation. The recent bulk fix was not fully comprehensive.

---

## Citation Presence — Tier 1 Directories (India)

| Directory | Status | Notes |
|-----------|--------|-------|
| Google Business Profile | CONFIRMED (kgmid) | `/g/11tjs8_n6q` — entity linked |
| Justdial | CONFIRMED | In homepage sameAs |
| Facebook | CONFIRMED | In sameAs |
| YouTube | CONFIRMED | In sameAs |
| Practo | NOT CONFIRMED | Not in sameAs; highest-priority missing citation for India healthcare |
| Lybrate | NOT CONFIRMED | Relevant for IVF/fertility |
| 1mg Doctor | NOT CONFIRMED | Growing relevance for specialist search |
| Sulekha | NOT CONFIRMED | Tier 2; worth auditing |
| Yelp | NOT APPLICABLE | Minimal India presence |
| BBB | NOT APPLICABLE | US/Canada only |

**Citation gap:** Per Whitespark 2026, 3 of the top 5 AI visibility factors are citation-related. Practo is India's dominant healthcare directory. Its absence from sameAs (and possibly from the listing itself) is the most actionable citation gap. Claim or verify the Practo listing, ensure NAP matches exactly (Boduppal, not Mallikarjuna Nagar), and add the Practo URL to sameAs on the homepage schema.

---

## Location Page Quality

The site has 400+ location/area-targeting pages across East, South, and North Hyderabad.

**Positive signals:**
- Each page has a unique H1 targeting the specific locality
- BreadcrumbList schema present on all checked pages
- `areaServed` field used on many location pages
- Multilingual variants (Telugu, Hindi) add genuine differentiation
- 399 of 462 pages now carry correct canonical geo coordinates

**Concerns:**
- 63 pages still lack correct geo — the bulk update was incomplete
- Opening hours vary across location pages (same clinic, multiple conflicting values)
- sameAs on location pages omits kgmid — entity signal not propagated
- Doorway page risk: Pages for very small localities (Ramalayam, Annojiguda, Tukaram Gate, Bibinagar) with heavily templated content may be assessed under Google's Helpful Content guidelines. Each should have at least one genuinely locality-specific paragraph (travel time from landmark, patient journey, neighbourhood context).
- Internal linking: Checked pages link back to homepage and core service pages; adequate for crawl depth.

---

## Top 10 Prioritised Actions

### Critical

**1. Add aggregateRating to homepage MedicalOrganization schema**
The homepage primary schema block has no `aggregateRating`. Add:
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": 4.7,
  "reviewCount": 71,
  "bestRating": 5,
  "worstRating": 1
}
```
Without this, the homepage — the highest-authority page on the domain — cannot display star ratings in Google SERPs.

**2. Fix homepage streetAddress — replace "Mallikarjuna Nagar" with "Boduppal"**
The homepage `MedicalOrganization` schema uses a different locality name than the 503 canonical instances on location pages. Google weights the homepage entity schema most heavily when building the Knowledge Panel. This single inconsistency is the biggest NAP signal mismatch on the site.
Canonical address: `Unit Nos. 201-204, Block A, Aakruthi Township, Boduppal, Hyderabad, Telangana 500092, IN`

**3. Standardise opening hours — fix all 462 pages to two-session format**
Decide the definitive hours (e.g. Morning: 10:30–13:30 daily; Evening: 17:30–20:30 Mon–Sat) and apply two `OpeningHoursSpecification` objects on every page. Remove all conflicting `"openingHours":"Mo-Sa 09:00-18:00"` string-format entries. Currently three or more conflicting variants exist — Google will display incorrect hours in the local panel.

### High

**4. Add kgmid to sameAs on all location pages**
`/g/11tjs8_n6q` currently appears only on the homepage sameAs. Add `"https://www.google.com/search?kgmid=/g/11tjs8_n6q"` to the sameAs array in every location page schema block. This strengthens entity disambiguation and connects all location pages back to the verified GBP entity.

**5. Fix geo coordinates on the remaining 63 pages**
63 pages did not receive the geo update applied to the other 399. Run the same coordinate injection used in the recent bulk fix. These pages currently fail geo schema validation.

**6. Add and link Practo listing**
Claim or create the Practo clinic profile. Ensure NAP matches exactly (Boduppal address, +919705993366). Add the Practo profile URL to `sameAs` in the homepage MedicalOrganization schema. Practo is India's most authoritative healthcare citation and impacts both classic local pack rankings and AI-driven health searches.

**7. Replace Maps query-string embed with Place ID embed**
The homepage Maps iframe uses `?q=Mother+Hospitals+IVF+Center+Boduppal` — a text search that may resolve to a different result if a competitor optimises for the same query string. Replace with a Place ID-based embed using the GBP Place ID to create a deterministic, always-correct map pin.

### Medium

**8. Move Choutuppal phone to department sub-entity only**
+919705993355 should appear exclusively inside the `department` sub-entity (Prashanthi Hospital, Choutuppal) and not in the primary Boduppal entity's `telephone` array. Mixed primary numbers confuse citation matching.

**9. Remove duplicate bare MedicalClinic schema block on ivf-center-boduppal.html**
A second `MedicalClinic` block with only `name` and `url` is redundant and creates a conflicting duplicate entity signal. Remove it.

**10. Increase geo coordinate precision to 5 decimal places**
All schema geo blocks use 4-decimal coordinates (17.4126, 78.5716). Right-click the exact clinic pin on Google Maps to obtain 5–6 decimal precision (e.g. 17.41263, 78.57158) and update all schema blocks. Relevant for proximity match precision in AI-driven local search.

### Low (log and schedule)

- Standardise "Tulip Block" token — decide whether it is part of the canonical address and apply uniformly across all 19 affected pages
- Fix en-dash vs hyphen in 8 pages (`201–204` → `201-204`)
- Add unique locality-specific content paragraphs to small-locality doorway-risk pages
- Add `addressLocality: "Boduppal"` to the Physician schema block (currently uses "Hyderabad")
- Add Lybrate and 1mg Doctor citations; add URLs to homepage sameAs once claimed

---

## Proximity Note

Proximity accounts for 55.2% of local ranking variance (Search Atlas ML study, 2025). This is entirely outside on-page and schema control. The 44.8% within control — GBP signals, reviews, citations, schema, on-page content — is where all actions above apply.

---

## Limitations Disclaimer

The following could not be assessed without authenticated access or paid tools:

- **GBP dashboard:** Primary category selection, Q&A section, post frequency, photo count and quality score, review velocity (exact last-review date), owner response rate — all require GBP account login.
- **Live Google review count:** Current GBP review count must be verified inside GBP; schema reviewCount (71) is assumed current per the brief.
- **Local pack rankings:** Real-time local pack positions for "IVF center Boduppal", "IVF hospital Hyderabad", and related queries require DataForSEO or equivalent SERP API.
- **Practo / Lybrate / 1mg live listing status:** NAP accuracy on these platforms requires direct login or a paid citation audit tool (BrightLocal, Whitespark).
- **Competitor benchmarking:** Review count, schema quality, and local pack co-occurrence vs Nova IVF, Oasis, Ankura not assessed.
- **Core Web Vitals / PageSpeed:** Not in scope for this local SEO audit.
- **Full backlink profile:** Local authority assessed qualitatively only; full link audit requires Ahrefs or Semrush.
