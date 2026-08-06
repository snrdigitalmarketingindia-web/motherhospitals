# Backlink + Internal Linking Audit — motherhospitals.co.in
**Date:** 2026-08-06
**Analyst:** claude-seo / seo-backlinks skill (Tier 0)
**Credential tier:** 0 — Common Crawl + Verify only (Moz API not configured)

---

## Data Coverage & Confidence

| Source | Status | Confidence |
|---|---|---|
| Common Crawl domain graph | Timed out — no data returned | N/A |
| Moz API (DA, PA, spam score, referring domains) | Not configured | N/A |
| Bing Webmaster | Not configured | N/A |
| DataForSEO | Not available | N/A |
| Local repo internal link analysis | Complete — direct HTML inspection | Parsed (0.95) |

**Backlink Health Score: INSUFFICIENT DATA**
Fewer than 4 of 7 scoring factors have data. A numeric score would be misleading. Recommend configuring Moz API (free tier: 2,500 rows/month at moz.com/products/api) to unlock DA, spam score, referring domain count, and anchor text distribution.

---

## External Backlink Profile

**Common Crawl result:** Command timed out on two attempts. No domain-level PageRank, harmonic centrality, or in-degree data is available for this run.

**Implication:** Cannot assess referring domain count, link velocity, toxic link ratio, or geographic distribution without a paid data source. These factors represent 65% of the Backlink Health Score model.

**Recommendation (Priority: High):** Configure Moz API key at `~/.config/claude-seo/backlinks-api.json` and rerun `/seo backlinks motherhospitals.co.in`. Alternatively, install the DataForSEO extension (`./extensions/dataforseo/install.sh`) for highest-fidelity data.

---

## External Links FROM Homepage

**Outbound external links observed:** 3 functional preconnect/DNS-prefetch targets (not navigational). Navigational outbound links from homepage body: 0 to any external domain other than social profiles and WhatsApp.

| External Destination | Type | Assessment |
|---|---|---|
| facebook.com/motherhospitals | Social profile (`<link rel="me">`) | Pass — entity ownership signal |
| instagram.com/motherhospitalsivf | Social profile (`<link rel="me">`) | Pass — entity ownership signal |
| youtube.com/@motherhospitalsivfcenter | Social profile (`<link rel="me">`) | Pass — entity ownership signal |
| maps.app.goo.gl | Map deep link | Pass — GBP signal |
| justdial.com (in Schema only) | Structured data only | Neutral |
| fonts.googleapis.com / fonts.gstatic.com | CDN (preconnect only) | Neutral |
| images.unsplash.com | CDN (preconnect only) | Neutral |

**Medical authority outbound links: NONE.** No links to PubMed, WHO, ICMR, NMC, FOGSI, or peer-reviewed sources from the homepage body or nav. This is a missed E-E-A-T signal — medical pages benefit from citing authoritative sources.

**Recommendation (Priority: Medium):** Add 2–3 contextual outbound links to authoritative medical sources within body copy. Examples: FOGSI guidelines for IVF, ICMR-NIN fertility nutrition data, or TGMC for license verification. These do not pass significant equity but reinforce trustworthiness signals for AI overviews and E-E-A-T evaluation.

---

## Internal Linking Analysis

### Scale

| Metric | Value | Source |
|---|---|---|
| Total .html files in repo | 462 | Parsed (0.95) |
| Total sitemap entries | 602 | Parsed (0.95) |
| Internal .html links from homepage | 98 | Parsed (0.95) |
| Unique destination pages linked from homepage | ~65 (after deduplication) | Parsed (0.95) |
| Pages in sitemap with no homepage link | ~397+ | Derived (0.90) |

### Navigation Links — Assessment

| Nav Item | Destination | Anchor Text | Rating |
|---|---|---|---|
| Home | / | "Home" | Pass |
| IVF | /ivf-treatment-hyderabad.html | "IVF" | Pass — concise, keyword-relevant |
| Maternity | /maternity-care-hyderabad.html | "Maternity" | Pass |
| Gynaecology | /gynaecology-hyderabad.html | "Gynaecology" | Pass |
| Mother 9 | /mother9-programme.html | "Mother 9" | Pass — branded |
| Our Team | /dr-prashanthi-reddy.html | "Our Team" | Warn — "Dr. Prashanthi Reddy" would be stronger |
| FAQs | /fertility-faq-hyderabad.html | "FAQs" | Pass |
| Free Tools | /fertility-tools.html | "Free Tools" | Pass |
| Blog | /blog/ | "Blog" | Pass |

**Nav verdict:** 9 links, all descriptive. PCOS and needleless IVF are not in the main nav — they are linked from body sections only.

### Key Service Pages — Homepage Link Status

| Page | Linked from Homepage? | Anchor Text Used |
|---|---|---|
| /ivf-treatment-hyderabad.html | Yes (nav + body) | "IVF", "Learn More →", "Explore IVF Services →" |
| /pcos-treatment-hyderabad.html | Yes (body) | "Learn More →" |
| /maternity-care-hyderabad.html | Yes (nav + body) | "Maternity", "Learn More →", "Mother 9 Antenatal Card →" |
| /laparoscopy-hyderabad.html | Yes (body) | "Learn More →" (inferred from link list) |
| /needleless-ivf-hyderabad.html | Yes (body) | "Learn More →" |
| /icsi-treatment-hyderabad.html | Yes (body) | (body section link) |
| /iui-treatment-hyderabad.html | Yes (body) | (body section link) |
| /low-amh-treatment-hyderabad.html | Yes (body) | "Learn More →" |
| /egg-freezing-hyderabad.html | Yes (body) | "Learn More →" |
| /high-risk-pregnancy-hyderabad.html | Yes (body) | (body section link) |
| /male-infertility-treatment-hyderabad.html | Yes (body) | "Learn More →" |
| /recurrent-miscarriage-hyderabad.html | Yes (body) | (body section link) |
| /c-section-hyderabad.html | NO | — |
| /antenatal-care-hyderabad.html | NO | — |
| /donor-egg-ivf-hyderabad.html | NO (egg-donation-hyderabad.html linked instead) | — |
| /fertility-preservation-cancer-hyderabad.html | NO | — |
| /azoospermia-treatment-hyderabad.html | NO | — |

### Anchor Text Quality

**Positive:** Nav anchors ("IVF", "Maternity", "Gynaecology") are concise and keyword-relevant.

**Problem — Generic "Learn More →" overuse:** The majority of body internal links use the anchor text "Learn More →" or "Explore IVF Services →". These are low-value anchors. Googlebot cannot infer the destination page topic from "Learn More →", and the pattern repeats across every service card.

**Recommendation (Priority: High):** Replace body section CTAs with descriptive anchors. Examples:
- "Learn More →" on PCOS card → "PCOS Treatment in Hyderabad"
- "Learn More →" on needleless IVF card → "Needleless IVF — Injection-Free Protocol"
- "Learn More →" on low AMH card → "IVF for Low AMH Patients"
- "Explore IVF Services →" → "IVF Treatment at Mother Hospitals"

### Broken Internal Link — CRITICAL

| Issue | Detail |
|---|---|
| Broken link found | Homepage links to `/ivf-success-rates-hyderabad.html` |
| Actual file | `/ivf-success-rate-hyderabad.html` (no trailing "s") |
| Impact | 404 for users and crawlers following this link |
| Priority | Critical — fix immediately |

**Fix:** In `index.html`, change `href="/ivf-success-rates-hyderabad.html"` to `href="/ivf-success-rate-hyderabad.html"`.

---

## Potential Orphan Pages

Of 462 HTML files in the repo, approximately 397+ receive no direct link from the homepage. The majority fall into these categories:

| Category | Example Pages | Orphan Risk | Note |
|---|---|---|---|
| Geo-variation IVF center pages (50+) | ivf-center-alwal.html, ivf-center-annojiguda.html, ivf-center-bhongir.html | High — most not linked from homepage | Should be linked from a geo-hub page or sitemap footer |
| Geo-variation PCOS pages (30+) | pcos-treatment-alwal.html, pcos-treatment-bhongir.html | High | Same — need a PCOS location hub |
| Geo-variation gynaecologist pages (30+) | gynaecologist-alwal.html, gynaecologist-bhongir.html | High | Need a hub page |
| Geo-variation IUI pages (20+) | iui-treatment-alwal.html, iui-treatment-bandlaguda.html | High | Need a hub page |
| Geo-variation male infertility pages (25+) | male-infertility-alwal.html, male-infertility-bhongir.html | High | Need a hub page |
| Educational/explainer pages | blastocyst-transfer-explained.html, egg-quality-ivf.html, embryo-quality-ivf.html | Medium | Should be linked from blog or service pages |
| Language-variant pages | c-section-telugu.html, icsi-telugu-hyderabad.html, ivf-center-habsiguda-telugu.html | Medium | Correctly handled via hreflang ideally; check alternate tags |
| Hindi-variant pages | baccha-nahi-ho-raha-kya-kare.html, iui-treatment-hindi.html, laparoscopy-hindi.html | Medium | Same — hreflang or language hub needed |
| Condition-specific pages | ashermans-syndrome-hyderabad.html, adolescent-gynaecology-hyderabad.html, vaginismus-treatment-hyderabad.html | Medium — clinically important | Should be linked from gynaecology hub |
| Calculator/tool sub-pages | bmi-fertility-calculator.html, conception-calculator.html, endometrial-thickness-calculator.html | Low — fertility-tools.html linked | Verify fertility-tools.html links to all calculators |

**Priority orphan fix list:**
1. `antenatal-care-hyderabad.html` — link from maternity-care page and homepage maternity section
2. `c-section-hyderabad.html` — link from maternity hub
3. `donor-egg-ivf-hyderabad.html` — confirm egg-donation-hyderabad.html redirects or cross-links
4. All geo IVF center pages — create or expand a geo-hub landing page with a full location grid, or add a sitemap-style footer block on the IVF service page
5. Condition pages (Asherman's, vaginismus, adolescent gynaecology) — link from gynaecology-hyderabad.html hub

---

## Link Equity Assessment

| Page | Priority | Homepage Links | Verdict |
|---|---|---|---|
| /ivf-treatment-hyderabad.html | Highest | 3+ (nav + 2 body) | Pass |
| /needleless-ivf-hyderabad.html | Highest | 1 (body) | Warn — should be in nav or 2nd body mention |
| /pcos-treatment-hyderabad.html | High | 1 (body) | Warn — consider nav inclusion |
| /fertility-tools.html | High (lead gen) | 1 (nav) | Pass |
| /ivf-cost-hyderabad.html | High (conversion) | 1 (body) | Pass |
| /ivf-success-rate-hyderabad.html | High (trust) | 0 (broken link) | Fail — fix broken href |
| /dr-prashanthi-reddy.html | Medium | 1 (nav) | Pass |
| /maternity-care-hyderabad.html | High | 2 (nav + body) | Pass |

---

## Summary of Findings

| Finding | Priority | Action |
|---|---|---|
| Broken internal link: /ivf-success-rates-hyderabad.html (file is singular) | Critical | Fix href in index.html immediately |
| Generic "Learn More →" anchor text on all service card CTAs | High | Replace with descriptive keyword anchors |
| ~397 pages receive no homepage link — geo and condition sub-pages at orphan risk | High | Create geo-hub pages; expand footer location grid |
| No outbound links to medical authority sources (PubMed, ICMR, FOGSI) | Medium | Add 2–3 contextual citations in body copy |
| Needleless IVF and PCOS not in main navigation | Medium | Consider adding to nav or adding a mega-menu |
| Common Crawl data unavailable (timeout) — external backlink profile unknown | High | Configure Moz API or DataForSEO for next audit run |
| Moz API not configured — DA, spam score, referring domains unknown | High | Add free Moz API key to enable Tier 1 analysis |
| "Our Team" nav anchor text — misses Dr. Prashanthi's name as keyword | Low | Consider "Dr. Prashanthi Reddy" or "Meet the Doctor" |

---

## Recommendations for Next Audit Run

- Configure Moz API: `~/.config/claude-seo/backlinks-api.json` → add `moz_api_key`
- Rerun: `/seo backlinks motherhospitals.co.in` to get DA, PA, referring domain count, spam score, anchor distribution
- For E-E-A-T analysis of individual pages: `/seo content <url>`
- For crawlability and indexing: `/seo technical motherhospitals.co.in`
