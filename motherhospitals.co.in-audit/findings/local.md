# Local SEO Audit — Mother Hospitals & IVF Centre
**URL:** https://motherhospitals.co.in
**Audit Date:** 2026-08-06
**Auditor:** Claude Local SEO Agent (claude-sonnet-4-6)

---

## Local SEO Score: 68 / 100

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| GBP Signals | 25% | 15/25 | Maps embed present; GBP CID URL malformed; no review widget |
| Reviews & Reputation | 20% | 13/20 | 4.7★ strong; reviewCount mismatch across pages; last schema review May 2026 |
| Local On-Page SEO | 20% | 16/20 | Excellent location page count; keyword-rich titles/H1s; address formatting variance |
| NAP Consistency & Citations | 15% | 9/15 | Phones consistent; address abridged on sub-pages; reviewCount inconsistency |
| Local Schema Markup | 10% | 8/10 | Strong dual schema; geo 4-decimal (not 5); one price:"0" error; WhatsApp in contactPoint |
| Local Link & Authority Signals | 10% | 7/10 | Justdial, Facebook, Instagram, YouTube sameAs present; BBB N/A (India); Practo absent |

---

## Business Type
**Brick-and-mortar (with satellite location)**
- Primary: Unit 201-204, Aakruthi Township, Boduppal, Hyderabad 500092
- Satellite: Prashanthi Hospital, Choutuppal (modelled as `department` in schema)
- Evidence: Full street address visible on page, Maps embed, directions link, opening hours specific to building

---

## Industry Vertical
**Healthcare — Fertility Clinic / Reproductive Medicine**
- Signals: IVF, ICSI, PCOS, embryo, AMH, ART Act 2021 certification, Dr. title, TGMC registration, appointment-focus CTA, HIPAA-equivalent TGMC mention, antenatal care
- Schema subtype used: `MedicalOrganization` (primary), `MedicalClinic` + `LocalBusiness` (location pages)
- Recommended primary type for fertility clinics: `MedicalClinic` (more specific than `MedicalOrganization`); schema.org does not have a native `FertilityClinic` subtype so `MedicalClinic` is correct

---

## NAP Consistency Audit

| Field | Homepage Schema (MedicalOrganization) | Homepage Schema (LocalBusiness) | Location Pages Schema | Visible HTML |
|-------|-----------------------------------------|----------------------------------|----------------------|--------------|
| Name | Mother Hospitals & IVF Center | Mother Hospitals & IVF Center | Mother Hospitals & IVF Center | Mother Hospitals & IVF Center |
| Street | 1st Floor, Unit Nos. 201-204, Block A, Aakruthi Township, Tulip Block, Mallikarjuna Nagar | Same | Unit Nos. 201-204, Block A, Aakruthi Township, Boduppal (abridged) | 1st Floor, Unit Nos. 201–204, Block A, Aakruthi Township, Tulip Block, Mallikarjuna Nagar, Boduppal |
| Locality | Boduppal | Boduppal | Hyderabad | Boduppal |
| PostalCode | 500092 | 500092 | 500092 (boduppal); 500003 (secunderabad) | 500092 |
| Phone 1 | +919705993366 | +919705993366 | +919705993366 | 97059 93366 |
| Phone 2 | +919705993355 | +919705993355 | — | 97059 93355 |

### NAP Flags

1. **CRITICAL — WhatsApp number exposed against client policy.** The number +919052074999 (WhatsApp-only line) appears in:
   - Visible HTML body (line 280, 751, 781, and 10+ other instances)
   - Schema `contactPoint` array with `contactType: "WhatsApp"`
   - `sameAs` array on MedicalOrganization
   - Client requirement: "voice only — do NOT expose WhatsApp number." Remove all wa.me/919052074999 and the contactPoint entry; use @motherhospitals alias only if absolutely needed.

2. **HIGH — addressLocality inconsistency.** `Physician` schema block uses `"addressLocality": "Hyderabad"` while `MedicalOrganization` correctly uses `"addressLocality": "Boduppal"`. Standardise to "Boduppal".

3. **MEDIUM — Street address abridged on location sub-pages.** Sub-pages omit "1st Floor", "Tulip Block", and "Mallikarjuna Nagar" from `streetAddress`. Google compares the GBP address; abbreviated versions may cause citation mismatches. Use the full canonical address on all pages.

4. **MEDIUM — ReviewCount mismatch.** Homepage `LocalBusiness` schema: `reviewCount: 71`. Location page schemas (boduppal, secunderabad): `reviewCount: 57`. Pick one source of truth and propagate consistently.

5. **LOW — Secunderabad sub-page postalCode.** `ivf-center-secunderabad.html` uses postalCode `500003` (Secunderabad Cantonment) in its LocalBusiness block. The hospital is in 500092. The page correctly notes it is "accessible from Secunderabad" but a different postcode in schema can confuse crawlers.

---

## GBP Signals Assessment

| Signal | Present | Notes |
|--------|---------|-------|
| Google Maps embed | Yes | Homepage and boduppal location page |
| Maps embed on contact page | Yes | Standard embed |
| GBP short URL / place reference | Partial | `sameAs` includes `https://g.page/mother-hospitals-ivf-boduppal` (LocalBusiness) and `https://www.google.com/maps?cid=motherhospitals` (MedicalOrganization) — the latter is not a valid CID URL; fix to actual CID |
| Directions link | Yes | Open in Google Maps → present |
| Review widget / embedded Google reviews | No | Only static schema Reviews; no live review carousel |
| GBP Post indicators | No | Not visible on page |
| Photo evidence section | Partial | Awards and doctor photos; no patient-outcome gallery labelled as GBP-sourced |
| Phone click tracking | Yes | gtag phone_call_click event implemented |

**GBP category note (Whitespark #1 factor):** Primary GBP category cannot be verified from the website alone — this must be checked directly in GBP. Recommended primary: "Fertility Clinic". Secondary: "Obstetrician-Gynecologist", "Maternity Hospital". Wrong category is the #1 negative factor.

---

## Review Health Snapshot

| Metric | Value | Assessment |
|--------|-------|------------|
| Schema AggregateRating | 4.7 / 5 | Strong |
| reviewCount (homepage schema) | 71 | Moderate — industry leaders typically have 200+ |
| reviewCount (location pages) | 57 | Inconsistent with homepage |
| Schema Review entities | 3 (all 5★) | All from 2026 — recent but all 5★ only may look curated |
| Latest schema review date | 2026-03-15 | ~5 months before audit — approaching 18-week velocity threshold |
| Review response rate visible | Not visible | No on-page evidence of GBP responses |
| worstRating present | Yes (1) | Correct; required for valid AggregateRating |
| bestRating present | Yes (5) | Correct |

**Sterling Sky 18-day rule:** No visible evidence of a recent review (since March 2026 in schema). If GBP reviews have also paused, rankings in the local pack will begin to decline. Prioritise a review generation campaign immediately.

**Policy risk:** Three schema Review entries (Priya Sharma, Kavitha Reddy, Anitha Nair) are all 5-star and appear curated. Google's structured data policy prohibits markup for reviews solicited specifically for schema display or testimonials not reflecting genuine third-party reviews. If these are real Google reviews, the markup is fine; if they are collected testimonials, remove the `Review` schema.

---

## Local Schema Validation

### Homepage — MedicalOrganization block
| Property | Status | Notes |
|----------|--------|-------|
| @type | MedicalOrganization | Acceptable; MedicalClinic preferred as primary for a fertility clinic |
| name | Present | |
| address (PostalAddress) | Present | Full address |
| geo (GeoCoordinates) | Present | 4 decimal places (17.4126, 78.5716) — recommend 5 decimals (17.41260, 78.57160 minimum; verify exact coords via Google Maps) |
| telephone | Present | Both numbers |
| url | Present | |
| openingHoursSpecification | Partial | MedicalOrganization block only has morning session (10:30-13:30). Afternoon (16:00-20:00) only in LocalBusiness block. Consolidate. |
| aggregateRating | Present on LocalBusiness block | |
| hasMap | Present | |
| availableService | Present | 16 MedicalProcedure entries |
| medicalSpecialty | Present | Obstetrics, Gynecology, ReproductiveMedicine |
| areaServed | Present | 37 City entities + State |
| serviceArea (GeoCircle) | Present | geoRadius 100,000m (100km) — overly broad; reduces local relevance signal; recommend 30,000-50,000m |
| founder (Physician) | Present | |
| hasCredential | Present | ART Act 2021, TGMC registration, Kiel University |
| contactPoint WhatsApp | FLAG | Exposes restricted number — remove per client policy |
| sameAs Google Maps CID | FLAG | `https://www.google.com/maps?cid=motherhospitals` is not a valid CID URL |
| Offer price: "0" | FLAG | `"price":"0"` on IVF offer is incorrect — IVF is not free. Use actual price range or remove price field |

### Location Pages — boduppal sample
| Property | Status | Notes |
|----------|--------|-------|
| @type | ["MedicalClinic","LocalBusiness"] | Correct dual typing |
| geo | Present | Same 4-decimal coords as homepage |
| openingHoursSpecification | Morning only | Afternoon hours missing on location pages |
| aggregateRating | reviewCount: 57 | Differs from homepage (71) |
| Duplicate MedicalClinic block | FLAG | Line 89: a second bare `MedicalClinic` block with only name and url — redundant, delete |

### Location Pages — secunderabad sample
| Property | Status | Notes |
|----------|--------|-------|
| geo | 17.4399, 78.4983 | These are Secunderabad coords, not the hospital's coords — misrepresents physical location |
| postalCode | 500003 | Wrong; hospital is 500092 |
| streetAddress | "Boduppal, Hyderabad (accessible from Secunderabad)" | Not a real street address |

**Secunderabad schema is effectively creating a phantom location.** If this page ranks and a patient clicks to navigate, geo data will direct them to the wrong place. Remove the location-specific `geo` and `postalCode` from non-primary location pages; use the actual hospital coordinates and postcode, or omit geo entirely from SAB-style pages.

---

## ART Act 2021 Certification Visibility

**Status: Well implemented**
- Hero section trust badge: "ART Act 2021 Certified"
- Credentials section: dedicated `hasCredential` entry in schema
- Footer badge present on all pages
- Body copy references on multiple sections
- Schema `hasCredential` correctly names recognising body as "National ART & Surrogacy Registry, India"
- Recommendation: Add a linked badge or scan of the certificate number once issued, as a visible image asset (helps E-E-A-T)

---

## Contact Page Assessment

**URL:** /contact-us.html — Present and functional

| Element | Present |
|---------|---------|
| Both phone numbers | Yes (97059 93366, 97059 93355) |
| Email | Yes (motherhospitals.ivfcenter@gmail.com) |
| Full address | Yes |
| Google Maps embed | Yes |
| Maps link ("Open in Google Maps") | Yes |
| ART Act 2021 badge | Yes |
| Contact form | Yes (Google Forms backend) |
| Opening hours on contact page | Not explicitly stated |
| Schema on contact page | Yes (MedicalOrganization + Physician) |

**Gap:** Opening hours not displayed as visible text on the contact page. Add a simple hours table (Morning: 10:30–13:30 daily; Evening: 16:00–20:00 Tue–Sun at Choutuppal) — this is frequently the highest-value addition to a contact page for voice/AI search.

---

## Service Area Coverage

37 localities listed in `areaServed` across East, North, and South Hyderabad:

**East (core zone):** Boduppal, Uppal, Ghatkesar, Nacharam, Habsiguda, Tarnaka, ECIL, Kapra, Kushaiguda, Yapral, Dammaiguda, Keesara, Medipally, Peerzadiguda, Mallapur, Cherlapally, Ramanthapur, AS Rao Nagar, Neredmet, Sainikpuri, Bibinagar

**South:** LB Nagar, Nagole, Kothapet, Vanasthalipuram, Dilsukhnagar, Saroornagar, Hayathnagar

**North:** Malkajgiri, Alwal, Secunderabad, Trimulgherry

**Central:** Amberpet, Moosarambagh, Himayathnagar, Vidyanagar, Hyderabad

Location pages exist for most of these localities. Coverage is comprehensive for East Hyderabad (the highest-priority zone given the physical location).

---

## Location Page Quality Assessment

| Metric | Finding |
|--------|---------|
| Total location-specific pages found | 50+ (filtered by boduppal, uppal, lb-nagar, secunderabad, dilsukhnagar match) |
| Total pages across all localities (site-wide) | ~300+ (full ls output) |
| H1 localisation | Yes — "Best IVF & Test Tube Baby Center near Secunderabad Hyderabad" |
| Unique content per page | Partial — structure and FAQs appear templated; neighborhood-specific why-choose section varies |
| Maps embed on location pages | Yes (boduppal); not verified on all pages |
| Internal linking depth from homepage | Homepage ItemList links 9 primary location pages; further pages may need better internal links |
| Doorway page risk | MEDIUM — Pages like ivf-center-secunderabad.html with phantom geo and templatised content could trigger Google's doorway page classifier if there is insufficient unique content. Add at least one locality-specific paragraph (travel time, landmark, patient story) |
| Schema reviewCount | 57 on location pages vs 71 on homepage — update to match |

---

## Citation Presence (Tier 1 Directories — India)

| Directory | Status | Notes |
|-----------|--------|-------|
| Justdial | Present in sameAs | URL in schema |
| Google Business Profile | Linked via sameAs (short URL + maps link) | Cannot verify live GBP status without login |
| Facebook | Present in sameAs | |
| Instagram | Present in sameAs | |
| YouTube | Present in sameAs | |
| Practo | Not found in schema/sameAs | High-priority citation for healthcare in India |
| Sulekha | Not found | Should be added for fertility/gynaecology |
| IndiaMART | Not found | Lower priority but common for clinics |
| BBB | N/A | US/Canada directory; not relevant for India |
| Yelp | N/A | Minimal India presence |

---

## Top 10 Prioritised Actions

### CRITICAL

**1. Remove WhatsApp number from all public-facing pages**
The number +919052074999 appears 10+ times in visible HTML and once in schema `contactPoint`. Per client instruction, this number must not be exposed. Replace all wa.me/919052074999 links with the @motherhospitals alias or remove entirely. Also delete the WhatsApp `contactPoint` from the schema block.

**2. Fix phantom geo on non-primary location pages**
Pages like ivf-center-secunderabad.html declare geo coordinates for Secunderabad (17.4399, 78.4983) and a wrong postalCode (500003). This represents a location the hospital does not occupy and could mislead navigation. Remove location-specific geo and postalCode from all "near [area]" pages; use the canonical Boduppal coordinates or omit geo on those pages.

### HIGH

**3. Fix the Google Maps CID URL in MedicalOrganization sameAs**
`https://www.google.com/maps?cid=motherhospitals` is not a valid CID URL. Replace with the actual GBP URL in the format `https://www.google.com/maps/place/?q=place_id:ChIJ...` or the short link from GBP dashboard.

**4. Resolve reviewCount discrepancy across all schema blocks**
Homepage LocalBusiness says 71, location pages say 57. Decide the canonical count (should reflect actual live Google review count) and update all pages consistently.

**5. Remove price:"0" from IVF Offer schema**
Setting `"price":"0"` on an IVF offer implies the service is free, which is factually incorrect and a structured data policy risk. Either add the actual INR price range or remove the `price` field from that Offer.

**6. Activate a review generation campaign immediately**
Latest schema review is dated 2026-03-15 (~5 months ago). Under the Sterling Sky 18-day velocity model, a 5-month gap is a significant risk to local pack rankings. Send WhatsApp/SMS follow-up to recent patients requesting a Google review within 48 hours of discharge/consultation.

### MEDIUM

**7. Increase geo coordinate precision to 5 decimal places**
All schema geo blocks use 4-decimal coordinates (17.4126, 78.5716). Verify the precise location via Google Maps (right-click the pin) and use at least 5 decimals (e.g. 17.41263, 78.57158). This improves proximity matching precision.

**8. Add Practo listing and link in sameAs**
Practo is the dominant healthcare directory in India for fertility/gynaecology search. Create or claim the Practo profile, ensure NAP matches exactly, and add the Practo URL to `sameAs` in all schema blocks.

**9. Add opening hours to visible contact page content**
Contact page has hours in schema only. Add a visible hours table — helps voice search, AI overviews, and patients who do not read schema.

**10. Reduce GeoCircle geoRadius from 100km to 30–50km**
A 100,000m radius covers virtually all of Telangana. This dilutes the geographic relevance signal. Set to 30,000–50,000m to match realistic drive-time catchment for east Hyderabad.

### LOW

- Standardise `streetAddress` on all location sub-pages to the full canonical address
- Fix the redundant bare MedicalClinic block (name/url only) in ivf-center-boduppal.html line 89
- Add `addressLocality: "Boduppal"` (not "Hyderabad") in the Physician schema block
- Add unique locality-specific content paragraphs to the highest-traffic location pages to reduce doorway page risk
- Add `openingHoursSpecification` afternoon session to the MedicalOrganization homepage schema block (currently only morning hours present there)

---

## Limitations Disclaimer

The following could not be assessed without authenticated access or paid tools:
- Live GBP listing status, primary category, and Q&A (requires GBP login)
- Actual live Google review count and response rate (requires GBP or DataForSEO)
- Local pack ranking positions for target keywords (requires DataForSEO `serp_organic_live_advanced` or similar)
- Citation accuracy on Practo, Sulekha, and other third-party directories (requires manual login or directory scraping)
- Review velocity trend beyond what is visible in schema
- Competitor local pack co-occurrence analysis
- GBP post history and photo count
