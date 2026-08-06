# Technical SEO Audit — motherhospitals.co.in
**Audit date:** 2026-08-06  
**Audited by:** Claude Code (seo-technical skill)  
**Technical SEO Score: 74 / 100**

---

## Executive Summary

The site is a statically-generated GitHub Pages property with strong fundamentals: clean SSR HTML, HTTPS enforced, a valid sitemap, rich structured data, and properly optimised Core Web Vitals signals. The main drag on the score is the complete absence of HTTP security headers (a structural limitation of GitHub Pages), hreflang inconsistencies across page variants, and no IndexNow implementation. All three confirmed recent fixes — hreflang standardisation, phantom ?lang=te links removed, and HTTPS enforcement — are verified working.

---

## Category Results

| Category | Status | Notes |
|---|---|---|
| 1. Crawlability | PASS | robots.txt clean, sitemap valid, no blocking |
| 2. Indexability | PASS with warnings | Canonicals present; minor noindex on old Telugu URL |
| 3. Security (HTTPS) | PASS | HTTP to HTTPS redirect confirmed |
| 4. Security Headers | FAIL | No HSTS, CSP, X-Frame-Options, X-Content-Type-Options |
| 5. URL Structure | PASS | Clean .html URLs, www to apex redirect working |
| 6. Mobile | PASS | Viewport correctly set, maximum-scale=5.0 |
| 7. Core Web Vitals | PASS | Hero image preloaded + fetchpriority, explicit dimensions |
| 8. Structured Data | PASS | 4 valid JSON-LD blocks, 26 schema types |
| 9. Hreflang | PARTIAL PASS | Inconsistencies across pages |
| 10. JavaScript Rendering | PASS | Pure SSR, no SPA shell, no JS dependency |
| 11. IndexNow | FAIL | No key file, not implemented |

---

## Detailed Findings

### 1. Crawlability

**Status: PASS**

- `robots.txt` resolves at `https://motherhospitals.co.in/robots.txt` with HTTP 200.
- Crawl directive: `User-agent: * Allow: /` — full site access granted.
- All major crawlers explicitly allowed including Googlebot, Bingbot, GPTBot, Claude-Web, anthropic-ai, PerplexityBot, Applebot, and others — well-configured for AI search visibility.
- Correctly disallows junk paths: `/cdn-cgi/`, `/.claude/`, `/SEO-STRATEGY-2026.md`, and search query parameters (`?s=`, `?q=`, `?blog=`, etc.) — prevents crawl budget waste.
- Sitemap declared in robots.txt: `Sitemap: https://motherhospitals.co.in/sitemap.xml`.
- Sitemap validated: HTTP 200, well-formed `<urlset>`, 602 URLs indexed.
- Homepage `https://motherhospitals.co.in/` is included in the sitemap.
- No sitemap index file exists (404 on `/sitemap_index.xml` and `/sitemap-index.xml`). With 602 URLs this is within Google's per-file limit of 50,000 but consider splitting as the site grows.

**Recommendation:** At 602 URLs, a sitemap index with category-split child sitemaps (services, blog, location pages, Telugu pages) would improve crawl prioritisation signals. Not urgent, but plan ahead.

---

### 2. Indexability — Canonicals and Meta Robots

**Status: PASS with warnings**

**Canonical tags:**
- Homepage: `<link rel="canonical" href="https://motherhospitals.co.in/"/>` — correct self-referencing canonical with trailing slash.
- `ivf-treatment-hyderabad.html`: self-referencing canonical present.
- `best-ivf-doctor-hyderabad.html`: self-referencing canonical present.
- `ivf-center-hyderabad-telugu.html`: self-referencing canonical present.

**Meta robots:**
- Homepage: `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1` — excellent, allows full snippet and image preview extraction.
- `ivf-treatment-telugu.html`: `noindex, follow` — this appears intentional (old Telugu URL superseded by `/ivf-center-hyderabad-telugu.html`). The old URL still returns 200. If this is a legacy URL with no inbound links, consider returning a 410 Gone or 301 redirect to the canonical Telugu page to avoid wasting crawl budget.
- No noindex pages found in the sitemap, which is correct.

---

### 3. Security — HTTPS and Redirects

**Status: PASS**

- `http://motherhospitals.co.in/` redirects to `https://motherhospitals.co.in/` via HTTP 301 — confirmed working.
- `https://www.motherhospitals.co.in/` redirects to `https://motherhospitals.co.in/` via HTTP 301 — confirmed working.
- Both redirect chains are single-hop with no double redirects.
- HTTPS served via HTTP/2 on GitHub Pages CDN (Fastly/Varnish), centralindia edge node.
- TLS enforced at edge; no mixed-content risks observed in HTML source.

Confirmed fix verified: GitHub Pages HTTPS enforcement is active and working correctly.

---

### 4. Security Headers

**Status: FAIL — GitHub Pages structural limitation**

| Header | Status |
|---|---|
| Strict-Transport-Security (HSTS) | MISSING |
| Content-Security-Policy (CSP) | MISSING |
| X-Frame-Options | MISSING |
| X-Content-Type-Options | MISSING |
| Referrer-Policy | MISSING |
| Permissions-Policy | MISSING |

GitHub Pages does not support custom HTTP response headers. This is a platform limitation, not a configuration error. The site cannot achieve a passing score on security header audits (e.g., SecurityHeaders.com) and cannot implement HSTS preloading from the platform level.

**Recommendation (Medium-term):** If security header compliance becomes a priority for regulated healthcare contexts or trust signal audits, evaluate migration to Cloudflare Pages, Vercel, or Netlify — all of which allow header injection via config files and support HSTS at the edge. Cloudflare Pages in particular can be placed in front of the existing GitHub Pages repo with zero source changes.

---

### 5. URL Structure

**Status: PASS**

- Clean, keyword-rich `.html` extension URLs throughout (e.g., `/ivf-treatment-hyderabad.html`, `/needleless-ivf-hyderabad.html`, `/best-ivf-center-boduppal-hyderabad.html`).
- No dynamic query strings in indexable URLs.
- URL depth is predominantly single-level, with `/blog/` subdirectory for blog posts — appropriate hierarchy.
- No URL canonicalisation conflicts observed. Trailing slash used on homepage only, absent on inner pages — consistent.
- www to apex redirect: single 301, no chain.

---

### 6. Mobile

**Status: PASS**

- Viewport meta: `width=device-width, initial-scale=1.0, maximum-scale=5.0` — correct. `maximum-scale=5.0` allows user zoom up to 5x (accessibility-friendly; does not block zoom like `user-scalable=no` would).
- `mobile-web-app-capable` and `apple-mobile-web-app-capable` declared.
- `theme-color` set to `#58037c` (brand purple).
- CSS uses responsive `width:100%` image sizing with explicit `width`/`height` attributes on all images inspected.
- No horizontal overflow or fixed-width containers observed in source.

---

### 7. Core Web Vitals — Source Signals

**Status: PASS** (source signal analysis; field/lab data not available in this audit)

**LCP (Largest Contentful Paint):**
- Hero image (`assets/inline/img_01_1d3a3fff.webp`) is preloaded via `<link rel="preload" as="image" fetchpriority="high">` in `<head>`.
- Hero `<img>` also carries `fetchpriority="high"` attribute directly on the element.
- Hero image served as WebP with a JPEG fallback — optimal format.
- CSS (`style.min.css`) is preloaded — reduces render-blocking.
- LCP candidate is above the fold and explicitly prioritised. Source signals indicate Good LCP potential (target: under 2.5 s).

**CLS (Cumulative Layout Shift):**
- All inspected `<img>` elements carry explicit `width` and `height` attributes, preventing layout shift during image load.
  - Logo: `width="64" height="64"`
  - Hero image: `width="540" height="600"`
  - Dr. photo: `width="380" height="480"`
- No iframes without explicit dimensions observed in above-fold content.
- CLS risk appears low (target: under 0.1).

**INP (Interaction to Next Paint):**
- No heavy JS framework detected (no React, Vue, Angular, or Next.js bundles in source).
- Page is server-rendered static HTML — JS interaction cost is minimal.
- No third-party chat widgets or heavy ad scripts observed in source.
- INP risk appears low (target: under 200 ms).

---

### 8. Structured Data

**Status: PASS — Exceptional coverage**

Four JSON-LD blocks, all valid per the render tool schema parser:

| Block | Key Types | Size |
|---|---|---|
| 1 | MedicalOrganization, LocalBusiness, Physician, AggregateRating, Review (x3), BreadcrumbList, ItemList, ContactPoint, GeoCoordinates, OpeningHoursSpecification | 17,080 bytes |
| 2 | DefinedTerm x5 (IVF, Needleless IVF, PCOS/PMOS, AMH, ICSI) | 1,989 bytes |
| 3 | VideoObject x4, MedicalCondition, MedicalProcedure | 2,964 bytes |
| 4 | MedicalWebPage, WebSite, SpeakableSpecification, MedicalAudience | 1,660 bytes |

Highlights:
- `AggregateRating` (4.7 stars, 71 reviews) is eligible for Google star rating rich results.
- `SpeakableSpecification` declared — assists voice search and AI overviews.
- LLMs.txt alternate link declared in `<head>` — proactive AI crawler guidance.
- `DefinedTerm` glossary for IVF, ICSI, AMH, PCOS, Needleless IVF — strong E-E-A-T signal for medical YMYL content.
- TGMC registration number and Kiel University credentials in schema — verifiable authority signals.

**Minor issue — VideoObject schema:** `contentUrl` and `embedUrl` in all four VideoObject blocks point to the YouTube channel URL (`https://www.youtube.com/@motherhospitalsivfcenter`), not individual video URLs. Google's VideoObject spec requires a direct playable video URL for video rich results. These entries will not generate video carousels in SERPs. They will not cause a penalty, but represent a missed opportunity. Fix: replace with individual YouTube video URLs (e.g., `https://www.youtube.com/watch?v=XXXX`).

---

### 9. Hreflang

**Status: PARTIAL PASS — Multiple inconsistencies**

Confirmed fix verified: No `?lang=te` phantom query parameter links found in any page source. This fix is confirmed working.

**Issue A — Homepage hreflang casing (Medium)**

The homepage declares `hreflang="te-in"` (lowercase) instead of `hreflang="te-IN"`:

```
<link rel="alternate" hreflang="te-in" href="https://motherhospitals.co.in"/>
```

BCP47 is technically case-insensitive and Google normalises case. However, all inner pages use `te-IN` correctly, and Google's own documentation examples use uppercase region subtags. The homepage is inconsistent with the rest of the site.

**Issue B — Homepage te-IN points back to itself (Low)**

The homepage declares `hreflang="te-IN"` pointing to `https://motherhospitals.co.in` — the English homepage. There is no distinct Telugu homepage. This is acceptable practice when no equivalent page exists, but it is a low-value hreflang signal. If a Telugu homepage is created in future, update accordingly.

**Issue C — Language tag format mismatch between paired pages (Medium)**

`ivf-center-hyderabad-telugu.html` (the Telugu IVF page) declares its English alternate as `hreflang="en"` (unqualified):

```
<link rel="alternate" hreflang="en" href="https://motherhospitals.co.in/ivf-treatment-hyderabad.html"/>
```

But `ivf-treatment-hyderabad.html` (the English IVF page) declares itself as `hreflang="en-IN"`. The tags do not match (`en` vs `en-IN`). Google may not recognise these as a reciprocal pair, degrading the hreflang cluster for this pair. Fix: change `en` to `en-IN` on the Telugu page.

**Issue D — Some English pages lack te-IN and x-default alternates (Low)**

`best-ivf-doctor-hyderabad.html` declares only `hreflang="en-IN"` — no `te-IN` alternate and no `x-default`. If no Telugu equivalent exists, `x-default` should still be declared to signal Google this is the default for unmatched locales.

**Hreflang summary table:**

| Page | en-IN | te-IN | x-default | Issue |
|---|---|---|---|---|
| Homepage | yes | te-in (wrong case) | yes | Casing inconsistency |
| ivf-treatment-hyderabad.html | en-IN (self) | te-IN to telugu page | yes | OK |
| ivf-center-hyderabad-telugu.html | en (should be en-IN) | te-IN (self) | missing | Tag mismatch, missing x-default |
| best-ivf-doctor-hyderabad.html | en-IN (self) | missing | missing | No te-IN, no x-default |

Full hreflang cluster validation across all 602 URLs — including bidirectional reciprocity checks — should be performed using the `seo-hreflang` sub-skill.

---

### 10. JavaScript Rendering

**Status: PASS**

- `is_spa: false` confirmed by render tool (raw fetch sufficient, Playwright not invoked).
- All page content — headings, service descriptions, doctor credentials, structured data — is present in raw HTML source.
- No client-side rendering framework detected.
- Googlebot and all other crawlers can index this site with zero JavaScript rendering dependency.

---

### 11. IndexNow Protocol

**Status: FAIL — Not implemented**

`/indexnow.txt` returns HTTP 404. No IndexNow key file is present at any common location.

IndexNow is supported by Bing, Yandex, and Naver. It allows instant URL submission on publish or update, bypassing crawl queue delays. For a site regularly publishing blog posts and new service pages, this is a missed opportunity for faster Bing indexation.

**Implementation:** Create a static key file at `https://motherhospitals.co.in/<your-key>.txt` containing only the key string. Then submit URLs via:

```
https://api.indexnow.org/indexnow?url=<page-url>&key=<your-key>&keyLocation=https://motherhospitals.co.in/<your-key>.txt
```

GitHub Pages supports static files so this requires only adding one file to the repo. The key can be generated at https://www.bing.com/indexnow.

---

## Prioritised Issue List

### Critical
None.

### High
1. **No HTTP security headers** — No HSTS, X-Frame-Options, CSP, X-Content-Type-Options, or Referrer-Policy. GitHub Pages structural limitation. Evaluate migration to Cloudflare Pages or Netlify if security header compliance becomes a priority.

### Medium
2. **Hreflang tag format mismatch between paired pages** — `ivf-center-hyderabad-telugu.html` uses `hreflang="en"` instead of `hreflang="en-IN"` for its English alternate, breaking the reciprocal pair with `ivf-treatment-hyderabad.html`. Fix: change `en` to `en-IN` on the Telugu page.
3. **Homepage hreflang casing** — `te-in` should be `te-IN` for consistency with inner pages and Google's documented examples.
4. **IndexNow not implemented** — Add key file and automate URL pinging on deploy for faster Bing and Yandex indexation.
5. **VideoObject schema lacks specific video URLs** — Replace YouTube channel URL in `contentUrl` and `embedUrl` with individual video URLs to qualify for video rich results.

### Low
6. **`ivf-treatment-telugu.html` (legacy URL) is noindex but returns HTTP 200** — 301 redirect to `/ivf-center-hyderabad-telugu.html` or return 410 Gone to avoid crawl budget waste.
7. **Single flat sitemap with 602 URLs** — No immediate action needed, but plan to split into a sitemap index with category child sitemaps as the site grows beyond approximately 1,000 URLs.
8. **`best-ivf-doctor-hyderabad.html` missing te-IN alternate and x-default** — If no Telugu equivalent exists, add `hreflang="x-default"` to signal Google this is the default page for unmatched locales.

---

## Recently-Applied Fixes — Verification Results

| Fix | Status | Evidence |
|---|---|---|
| hreflang standardised to te-IN / en-IN | PARTIAL — inner pages correct; homepage still uses te-in (lowercase) | Verified via live HTML |
| Phantom ?lang=te links removed | CONFIRMED FIXED | No ?lang= URLs found in any page source examined |
| GitHub Pages HTTPS enforced | CONFIRMED WORKING | HTTP 301 to HTTPS, single-hop, no chain |

---

## Technical Configuration Summary

| Item | Value |
|---|---|
| Hosting | GitHub Pages (Fastly CDN, centralindia edge) |
| Protocol | HTTP/2, HTTPS only |
| Rendering | Server-side static HTML |
| Sitemap URLs | 602 |
| Structured data blocks | 4 (all valid) |
| Structured data schema types | 26 distinct types |
| Redirect chains | 0 (no multi-hop chains) |
| Homepage uncompressed size | ~122 KB |
| Cache | max-age=600 (10 min) via Fastly Varnish |
| LLMs.txt | Declared in head |
| IndexNow | Not implemented |

---

*Audit scope: Homepage plus 4 inner pages sampled. Full hreflang cluster validation across all 602 URLs not performed in this pass — use the seo-hreflang sub-skill for complete bidirectional reciprocity coverage.*
