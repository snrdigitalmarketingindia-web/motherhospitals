# GEO / AI Search Readiness Audit
**Site:** https://motherhospitals.co.in  
**Business:** Mother Hospitals & IVF Center — IVF & Fertility Clinic, Boduppal, Hyderabad  
**Physician:** Dr. E. Prashanthi Reddy  
**Audit date:** 2026-08-06  
**Auditor:** Claude GEO Specialist (claude-sonnet-4-6)

---

## GEO Readiness Score: 81 / 100

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|---------|
| Citability | 25% | 80/100 | 20.0 |
| Structural Readability | 20% | 80/100 | 16.0 |
| Multi-Modal Content | 15% | 80/100 | 12.0 |
| Authority & Brand Signals | 20% | 70/100 | 14.0 |
| Technical Accessibility | 20% | 95/100 | 19.0 |
| **TOTAL** | | | **81.0** |

---

## Platform-Specific Readiness Scores

| Platform | Score | Primary Factor |
|----------|-------|---------------|
| Google AI Overviews | 83 | Strong SSR + WebPage.speakable + direct-answer blocks + schema depth |
| Perplexity | 80 | PerplexityBot allowed, llms.txt comprehensive, structured FAQs |
| Bing Copilot | 79 | IndexNow meta present, Bingbot allowed, SSR HTML |
| ChatGPT / OAI | 75 | llms.txt + YouTube present, no Wikipedia entity limits scoring |

---

## 1. AI Crawler Access — robots.txt

**Status: EXCELLENT**

All major AI crawlers are explicitly allowed with individual `User-agent` / `Allow: /` entries:

| Crawler | Status | Purpose |
|---------|--------|---------|
| GPTBot | ALLOWED | ChatGPT training + retrieval |
| OAI-SearchBot | ALLOWED | ChatGPT search / Browse |
| ChatGPT-User | ALLOWED | Live ChatGPT browsing |
| Claude-Web | ALLOWED | Claude citation crawling |
| anthropic-ai | ALLOWED | Anthropic AI crawlers |
| PerplexityBot | ALLOWED | Perplexity AI search |
| YouBot | ALLOWED | You.com AI search |
| CCBot | ALLOWED | Common Crawl (training data) |
| cohere-ai | ALLOWED | Cohere AI training |
| Google-Extended | ALLOWED | Gemini / Bard training |
| Bard | ALLOWED | Google Bard |
| Bingbot | ALLOWED | Bing / Copilot |
| Applebot | ALLOWED | Apple Intelligence |
| Bytespider | ALLOWED | TikTok AI |
| FacebookBot | ALLOWED | Meta AI |

The robots.txt also includes a `LLMs: https://motherhospitals.co.in/llms.txt` pointer (non-standard but forward-looking practice). Appropriate admin/junk paths are blocked without restricting AI crawlers.

**No issues found.**

---

## 2. llms.txt — Status: PRESENT, HIGH QUALITY

**File:** `/llms.txt`  
**Linked in HTML head:** Yes — `<link rel="alternate" type="text/plain" title="LLMs.txt" href="/llms.txt"/>`

### Quality Assessment

The llms.txt is exceptionally well-structured and machine-readable. Highlights:

- **Entity block** with `@type: MedicalClinic, FertilityClinic, LocalBusiness` — unambiguous entity classification
- **Primary Physician block** with full credentials, TGMC Reg No., professional memberships (ESHRE, IFS, IMA, ISAR, OGSH, TSMC), and awards
- **Unique differentiators** clearly listed (Needleless IVF, Germany-trained specialist, all-inclusive pricing, single-doctor continuity)
- **Full service taxonomy** across Fertility/IVF, Gynaecology, Maternity, and Male Infertility
- **Service area coverage** with named localities at 3 radius bands (0–10 km, 10–25 km, 25–60 km)
- **Key clinical facts** section with specific numeric data (success rates by age, AMH thresholds, protocol details)
- **8 structured FAQs** in Q: / A: format with self-contained answers — directly extractable by AI
- **15 free calculator links** — strong tool signal for AI assistants
- **Social media profiles** listed with full URLs

**One minor gap:** No RSL 1.0 licensing declaration at the top of the file. Adding `> License: https://creativecommons.org/licenses/by/4.0/` or an RSL 1.0 block would signal licensing terms to LLMs that parse them.

---

## 3. Speakable Implementation

### data-speakable HTML Attributes (index.html)

Present on:
- `<h1 class="hero-h1" data-speakable="true">` — hero headline
- `<p class="hero-tag" data-speakable="true">` — doctor credentials tag line
- `<p class="hero-p" data-speakable="true">` — hero paragraph (first content block)
- All 10 section `<h2 class="section-title" data-speakable="true">` headings

**Assessment:** Correct implementation. The hero paragraph is a prime AI citation candidate — it packs entity, location, credentials, and services into one speakable block.

### WebPage.speakable Schema (index.html)

```json
"speakable": {
  "@type": "SpeakableSpecification",
  "cssSelector": [".hero-h1",".hero-tag",".hero-p",".section-title",".section-sub",
                  ".direct-answer",".dept-name",".trust-strip",".tbadge",
                  ".cred-title",".stat-num",".stat-label"]
}
```

**Assessment:** Well-targeted. Includes `.direct-answer` (AI answer blocks) and credential/stat classes. This is correctly nested as a property of the `WebPage` object.

### Speakable on Service Pages (ivf-treatment-hyderabad.html)

Two speakable implementations exist on this page — one correct, one with a schema error:

- **Correct:** WebPage schema at line 41 has `"speakable": {"@type":"SpeakableSpecification","cssSelector":[...]}` nested as WebPage property.
- **Error:** A standalone `{"@context":"https://schema.org","@type":"SpeakableSpecification","cssSelector":[...]}` object at line 95 is emitted as a top-level JSON-LD entity. `SpeakableSpecification` is not a valid standalone type — it must be a property value of a `WebPage` or `Article`. This causes a schema validation warning and the standalone block will be ignored by Google.

**Fix required:** Remove the standalone `SpeakableSpecification` JSON-LD block from service pages. The WebPage-nested version is sufficient and correct.

---

## 4. IndexNow

**Status: PRESENT**

```html
<meta name="IndexNow-verification" content="ee61857d31f748f48aa64b652b738a10"/>
```

Present on index.html. Verify the corresponding key file exists at `https://motherhospitals.co.in/ee61857d31f748f48aa64b652b738a10.txt` and that IndexNow ping calls are being made on content updates. The meta tag alone does not auto-submit URLs — pings must be sent via the IndexNow API or a CMS plugin.

---

## 5. Passage-Level Citability

### Homepage Hero (index.html)

The hero paragraph (`data-speakable="true"`) reads:

> "Germany-trained IVF specialist with 20+ years and 5,000+ cycles. Personal care — your embryos, your journey, our complete focus. IVF, Needleless IVF, PCOS, male infertility, high-risk pregnancy and safe delivery. ART Act 2021 certified · Boduppal, Hyderabad."

Word count: ~42 words. Below the optimal 134–167 word range for AI citation, but appropriate as an anchor summary. Entity (who), location (where), and key differentiators (what) are present.

### IVF Service Page — Direct Answer Block

The `.direct-answer` block answers "what, who, where" in the first visible paragraph:

> "Mother Hospitals & IVF Center in Boduppal, Hyderabad offers IVF (In Vitro Fertilisation) at all-inclusive — covering medications, egg retrieval, ICSI, embryo transfer, and all monitoring scans. Led by Dr. E. Prashanthi Reddy (MBBS, DGO, Diploma in ART — Kiel University, Germany, TGMC Reg: 50624) with 20+ Years of experience..."

Word count: ~75 words. Self-contained. Includes all four AI Overview signals: what (IVF, all-inclusive), who (Dr. Prashanthi Reddy, credentials), where (Boduppal, Hyderabad), with cost framing ("all-inclusive, no hidden charges").

**Gap — Cost specificity:** The IVF cost page exists (`/ivf-cost-hyderabad.html`) but the LocalBusiness schema has `"price":"0"` for the IVF Treatment offer — a placeholder that is factually incorrect and may suppress trust signals in AI responses. The schema should either state the actual package price or use `priceSpecification` with a range. The `"price":"0"` value is potentially cited verbatim by some AI scrapers as "free."

### FAQ Passages

The llms.txt contains 8 FAQ pairs. On-page FAQ sections use `<details>/<summary>` markup which is rendered in SSR HTML. These are prime AI citation candidates for informational queries. Average answer length appears 60–120 words — within acceptable citability range but the longer the self-contained answer, the better.

**Recommendation:** Expand 3–4 key FAQ answers (Needleless IVF, Low AMH, ART compliance) to reach 134–167 words each for optimal passage-level citation probability.

### H2 Headings — Question Format Assessment

Current H2 headings on index.html are brand-marketing headlines ("Our Specialised Services", "Complete Women's Healthcare", "Medical Authority You Can Rely On"). None are question-format headings.

Question-format H2s (e.g. "What is Needleless IVF?", "Can I get pregnant with Low AMH?", "How much does IVF cost in Hyderabad?") significantly increase AI Overview and Perplexity citation rates. Service pages should prioritise these, especially above the fold.

---

## 6. Entity Clarity — Dr. E. Prashanthi Reddy

**Status: EXCELLENT**

The physician entity is defined comprehensively across multiple schema contexts:

| Schema Property | Value | Present |
|----------------|-------|---------|
| @type | Physician | Yes |
| givenName / familyName | Prashanthi / Reddy | Yes |
| honorificSuffix | MBBS, DGO, Diploma in ART | Yes |
| identifier (TGMC) | 50624 | Yes |
| medicalSpecialty | Obstetrics, Gynecology, ReproductiveMedicine | Yes |
| worksFor | Mother Hospitals & IVF Center | Yes |
| alumniOf | Mamatha MC, Gandhi MC, Kiel University | Yes |
| hasCredential | MBBS, DGO, PG Diploma ART, Cosmetic Gyn | Yes |
| award | STV Suman TV, Gufic, AICOG 2024 | Yes |
| knowsLanguage | English, Telugu, Hindi | Yes |
| hasOccupation | Fertility Specialist & IVF Consultant | Yes |

A standalone `Physician` JSON-LD block exists on both the homepage and the IVF service page, reinforcing the entity signal. The MedicalOrganization schema also has `founder: {Physician}` linking the clinic to the doctor.

**Gap:** No `sameAs` pointing to external physician profiles (Practo, Lybrate, Doctorspring, or a LinkedIn profile) on the Physician entity. Adding `"sameAs": ["https://www.practo.com/...", "https://www.linkedin.com/in/..."]` would strengthen entity disambiguation across AI knowledge graphs.

---

## 7. AI Overview Readiness — Service Pages

Tested against the four-signal framework (What, Who, Where, Cost):

| Service Page | What | Who | Where | Cost | AIO Ready |
|-------------|------|-----|-------|------|-----------|
| IVF Treatment | Yes | Yes | Yes | Partial (no figure) | Mostly |
| Needleless IVF | Yes | Yes | Yes | No | Partially |
| Low AMH | Yes | Yes | Yes | No | Partially |
| IVF Cost | Yes | Yes | Yes | Yes (price page exists) | Yes |
| Dr. Prashanthi profile | Yes | Yes | Yes | N/A | Yes |

The main gap across service pages is explicit cost information. AI Overviews for medical queries frequently include price ranges when they are present in the source content. The IVF cost page handles this, but the main IVF treatment page and the Needleless IVF page should include at least a cost range anchor ("starting from ₹X" or "all-inclusive package") in the first paragraph and in schema.

---

## 8. Brand Mention Analysis

| Platform | Status | Notes |
|----------|--------|-------|
| YouTube | PRESENT | @motherhospitalsivfcenter — highest AI citation correlation (~0.737). VideoObject schema present on IVF page. |
| Google Maps / GMB | PRESENT | 4.7 stars, listed in sameAs. AggregateRating in schema. |
| Justdial | PRESENT | Listed in sameAs on LocalBusiness and MedicalOrganization |
| Facebook | PRESENT | sameAs link present, `<link rel="me">` in head |
| Instagram | PRESENT | sameAs link present, `<link rel="me">` in head |
| Wikipedia | ABSENT | No Wikipedia entity for Mother Hospitals or Dr. Prashanthi Reddy. This is the highest-value missing signal for AI citation at scale. |
| Reddit | ABSENT | No detected Reddit presence (r/IVF, r/infertility, r/india). High correlation with AI citations for medical topics. |
| Practo | NOT CITED | Practo profile not referenced in schema sameAs. May exist but not linked. |
| LinkedIn | NOT CITED | No LinkedIn profile for Dr. Prashanthi or the clinic linked in schema |

**AggregateRating inconsistency:** The `LocalBusiness` schema shows `reviewCount: 71` while the `MedicalOrganization` schema shows `reviewCount: 57`. These should be consistent. Inconsistent counts across schema blocks can reduce trust in structured data parsers.

---

## 9. Technical Accessibility for AI Crawlers

| Signal | Status | Detail |
|--------|--------|--------|
| Server-Side Rendering | YES | 462 static HTML files — no SPA shell detected |
| IndexNow meta tag | YES | Verification token present in head |
| llms.txt accessible | YES | Present at root, linked in head and robots.txt |
| Sitemap | YES | Declared in robots.txt at `/sitemap.xml` |
| Canonical tags | YES | Present on all checked pages |
| hreflang | YES | en-in, te-in, x-default on homepage |
| Geo meta tags | YES | geo.region, geo.placename, geo.position, ICBM |
| OG / Twitter Card | YES | Complete on all checked pages |
| PWA manifest | YES | `/manifest.json` linked |
| Schema validation | MOSTLY | Standalone SpeakableSpecification error on service pages |

No JavaScript-wall rendering detected. Content is fully accessible to non-JS crawlers. This is a significant advantage over React/Next.js SPA competitors.

---

## Top 5 Highest-Impact Recommendations

### 1. Wikipedia Entity Creation
**Impact: HIGH | Effort: HIGH | Correlation: ~0.70+ with AI citation**

Dr. Prashanthi Reddy and/or Mother Hospitals do not have a Wikipedia presence. Wikipedia entities are among the strongest signals for AI knowledge graph inclusion (ChatGPT, Gemini, Perplexity all weight Wikipedia entities highly). The clinic's credentials — 20+ years, 5,000+ IVF cycles, Germany-trained ART specialist, ART Act 2021 certified, national awards — are sufficient for notability under Wikipedia's general notability guidelines. A stub article for Dr. Prashanthi Reddy as a fertility specialist with sourced references (STV Suman TV award, AICOG 2024 delegation, Kiel University training) should be created and maintained.

### 2. Fix Schema Errors — reviewCount Inconsistency and Standalone SpeakableSpecification
**Impact: MEDIUM-HIGH | Effort: LOW | Risk if ignored: AI scrapers may misreport review count or skip speakable signal**

Two fixes required:
- Standardise `reviewCount` across all schema blocks to one consistent number (update the lower value of 57 to match the 71 in LocalBusiness, or vice versa — whichever reflects current Google rating count).
- Remove all standalone `{"@type":"SpeakableSpecification"}` JSON-LD blocks from service pages. They are schema-invalid as top-level entities. The correct speakable is already nested inside the WebPage schema on those pages.

### 3. Add Question-Format H2s to Top Service Pages
**Impact: HIGH | Effort: LOW | Directly affects Google AIO and Perplexity citation rate**

Convert at least 3–5 H2 headings per service page from marketing copy to natural-language questions that patients ask. Examples:
- "What is Needleless IVF and how does it work?" (on `/needleless-ivf-hyderabad.html`)
- "Can I get pregnant with Low AMH?" (on `/low-amh-treatment-hyderabad.html`)
- "How much does IVF cost in Hyderabad?" (on `/ivf-treatment-hyderabad.html`)
- "What is the IVF success rate at Mother Hospitals?" (homepage FAQ section)

These headings map directly to user search queries and trigger AI Overview answer extraction.

### 4. Add Reddit Presence for Medical Q&A
**Impact: MEDIUM | Effort: MEDIUM | High correlation with AI medical citations**

Reddit posts and comments are heavily indexed by Perplexity and cited by ChatGPT for medical queries. An authentic Reddit presence (answering questions on r/IVF, r/infertility, r/india, r/hyderabad) where Dr. Prashanthi or a team member provides educational answers citing Mother Hospitals would create high-value backlink and citation signals. This is distinct from promotional posting — it requires genuine clinical educational value.

### 5. Add Practo / LinkedIn sameAs to Physician Schema and Expand FAQ Passage Length
**Impact: MEDIUM | Effort: LOW | Strengthens entity disambiguation**

Add Practo profile URL and Dr. Prashanthi's LinkedIn URL to the Physician schema's `sameAs` array. This cross-links the entity across platforms that AI knowledge graphs aggregate. Also: expand the 3 most-queried FAQ answers (Needleless IVF, Low AMH, IVF cost) to 134–167 words each — the range shown to maximise passage-level citation in AI Overviews. The current answers average 60–100 words and lose citation competition to longer self-contained passages.

---

## Issues Summary Table

| Issue | Severity | File / Location |
|-------|----------|----------------|
| Standalone `SpeakableSpecification` JSON-LD blocks on service pages | Medium | `ivf-treatment-hyderabad.html` line 95 (and likely other service pages) |
| `reviewCount` inconsistency: 57 vs 71 across schema blocks | Medium | `index.html` — MedicalOrganization vs LocalBusiness |
| IVF Offer in schema has `"price":"0"` — incorrect placeholder | Medium | `index.html` LocalBusiness OfferCatalog |
| No Wikipedia entity for clinic or physician | High | Off-site |
| No Reddit brand presence | Medium | Off-site |
| No Practo / LinkedIn in Physician `sameAs` | Low | `index.html`, `dr-prashanthi-reddy.html` |
| No RSL 1.0 / CC license declaration in llms.txt | Low | `/llms.txt` |
| H2 headings on service pages not question-format | Medium | All service pages |
| IndexNow ping implementation unverified | Low | Deployment pipeline |
| FAQ answer length below 134-word optimal range | Low | Service pages, llms.txt FAQs |
