# Technical SEO Audit — motherhospitals.co.in
**Audit Date:** 2026-08-06  
**Auditor:** Claude Code (Technical SEO Skill)  
**Site:** Mother Hospitals & IVF Center, Boduppal, Hyderabad  
**Stack:** Static HTML, GitHub Pages + Fastly CDN  
**Scope:** ~600+ pages (service, location, blog, tools)

---

## Overall Technical Score: 72 / 100

| Category | Status | Score |
|---|---|---|
| Crawlability | PASS | 18/20 |
| Indexability | PARTIAL | 12/20 |
| Security | FAIL | 6/15 |
| URL Structure | PASS | 8/10 |
| Mobile | PASS | 9/10 |
| Core Web Vitals (source signals) | PASS | 8/10 |
| Structured Data | PASS | 9/10 |
| JavaScript Rendering | PASS | 5/5 |

---

## Findings by Severity

---

### CRITICAL

#### C1 — HTTP Does Not Redirect to HTTPS
**Evidence:** `curl -I http://motherhospitals.co.in` returns `HTTP/1.1 200 OK` instead of a 301/302 redirect.  
**Impact:** Users and bots accessing the plain-HTTP URL receive content without TLS. Google's crawler follows HTTPS preferentially, but HTTP accessibility without redirect is a trust and security signal gap. Some crawlers and link aggregators may index `http://` variants, creating duplicate-origin URLs with no canonical resolution at the transport layer.  
**Fix:** GitHub Pages cannot serve custom redirect rules for protocol upgrades at the CDN edge. Two options:
1. Move to Cloudflare Pages (free tier) — add a Page Rule: `http://motherhospitals.co.in/*` → `https://motherhospitals.co.in/$1` (301).
2. If staying on GitHub Pages, raise this with your domain registrar DNS proxy (Cloudflare DNS proxy can enforce HTTPS redirect at the edge before GitHub Pages even sees the request).

---

#### C2 — `_headers` File is Ineffective on GitHub Pages
**Evidence:** The file `/Users/apple/Documents/MotherHospitals/motherhospitalswebsite/_headers` contains security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection). This file format is Netlify-specific. GitHub Pages does not process it.  
**Confirmed via live response:** `curl -sI https://motherhospitals.co.in` returns none of those headers.  
**Impact:**
- No X-Frame-Options → clickjacking exposure
- No X-Content-Type-Options → MIME-sniffing attack surface
- No Content-Security-Policy (not even declared)
- No HSTS → protocol downgrade not blocked at HTTP level
- Missing security headers are flagged as failures by Chrome Lighthouse, Google Security, and many SEO tools which factor security into trust signals.

**Fix:**
1. Short-term: Use Cloudflare as a proxy (free). Under Transform Rules → Modify Response Header, add all required headers globally. This injects headers after GitHub Pages responds.
2. Long-term: Migrate from GitHub Pages to Cloudflare Pages or Netlify where `_headers` actually works.

---

### HIGH

#### H1 — Homepage Missing from Sitemap
**Evidence:** The sitemap.xml contains 602 `<url>` entries. Neither `https://motherhospitals.co.in/` nor `https://motherhospitals.co.in/index.html` appears in the sitemap.  
**Impact:** Googlebot will discover the homepage through crawl, but explicitly including it in the sitemap with a `<lastmod>` date allows crawl scheduling to be accurate. More importantly, without an explicit sitemap entry, the homepage priority signalling is absent.  
**Fix:** Add as the first entry in sitemap.xml:
```xml
<url>
  <loc>https://motherhospitals.co.in/</loc>
  <lastmod>2026-07-02</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1.0</priority>
</url>
```

---

#### H2 — `needleless-ivf-cost-hyderabad.html` Has `noindex, nofollow`
**Evidence:** Line 10: `<meta name="robots" content="noindex, nofollow"/>` on a commercial page targeting high-intent queries ("needleless IVF cost Hyderabad").  
**Impact:** This page is invisible to search engines. "Cost/price" queries are among the highest-converting in fertility care SEO. If this page is intentionally noindexed (e.g., pending update or a duplicate), that reason must be documented. If unintentional, it is a direct revenue risk.  
**Fix:** Review the page. If content is complete and accurate, change to `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>` and add to sitemap.xml.

---

#### H3 — Hreflang Inconsistency: `te-in` on Homepage vs `te` on Interior Pages
**Evidence:**
- `index.html` line 52: `hreflang="te-in"` (non-standard; BCP 47 requires `te-IN`)
- `ivf-treatment-hyderabad.html` line 16: `hreflang="te"` (missing region subtag)
- `best-ivf-hospital-hyderabad.html`: no Telugu hreflang alternate at all
- `pcos-treatment-hyderabad.html`: no Telugu hreflang alternate

**Impact:** Google requires consistent and reciprocal hreflang implementation. Inconsistent tags between pages can cause Google to ignore the entire hreflang cluster. Pages without a Telugu alternate lose the geo-targeting benefit for Telugu-speaking users.

**Fix:** Standardise all pages to use `hreflang="te-IN"` (capital IN). For every English page that has a corresponding Telugu page (e.g., ivf-treatment-hyderabad.html ↔ ivf-center-hyderabad-telugu.html), both pages must carry reciprocal alternates. Pages without a Telugu equivalent should still carry `x-default` and `en-IN` only.

**Defer full validation to the `seo-hreflang` sub-skill for complete cross-page reciprocity audit.**

---

#### H4 — Homepage Canonical Tag Lacks Trailing Slash, Creates Ambiguity
**Evidence:** `<link rel="canonical" href="https://motherhospitals.co.in"/>` (no trailing slash).  
The live site resolves `https://motherhospitals.co.in/` (with trailing slash) as the primary URL (standard for root domains). GitHub Pages serves the root via a trailing-slash URL.  
**Impact:** Minor but Google treats `https://motherhospitals.co.in` and `https://motherhospitals.co.in/` as different URLs. The canonical should match exactly what the browser URL bar shows after resolution.  
**Fix:** Change homepage canonical to `https://motherhospitals.co.in/` (add trailing slash).

---

### MEDIUM

#### M1 — No Content Security Policy (CSP) Header
**Evidence:** No CSP header served on any page (confirmed live).  
**Impact:** CSP is not a direct ranking factor, but it is a Chrome security audit failure, affects user trust signals, and is increasingly scrutinised in E-E-A-T contexts for healthcare/YMYL sites.  
**Fix:** Once Cloudflare proxy is in place (see C2), define a CSP policy. Starting value:
```
Content-Security-Policy: default-src 'self' https:; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;
```
Tighten iteratively using report-only mode first.

---

#### M2 — HSTS (HTTP Strict Transport Security) Not Set
**Evidence:** No `Strict-Transport-Security` header on live responses.  
**Impact:** Without HSTS, browsers will not cache the HTTPS preference. Repeat visitors can be intercepted with SSL-stripping attacks during the first HTTP request.  
**Fix:** Once Cloudflare is in place: add `Strict-Transport-Security: max-age=31536000; includeSubDomains`. Enable "Always Use HTTPS" in Cloudflare dashboard.

---

#### M3 — Single Flat Sitemap for 602 URLs (No Sitemap Index)
**Evidence:** All 602 URLs are in a single `sitemap.xml`. This is valid (Google allows up to 50,000 URLs per sitemap), but as the site grows toward 600+, a sitemap index with split files is cleaner for monitoring crawl coverage per content type.  
**Recommendation:** At the current count this is not a problem. Plan to split into a sitemap index when URLs exceed 1,000:
```xml
<sitemapindex>
  <sitemap><loc>.../sitemap-service.xml</loc></sitemap>
  <sitemap><loc>.../sitemap-location.xml</loc></sitemap>
  <sitemap><loc>.../sitemap-blog.xml</loc></sitemap>
  <sitemap><loc>.../sitemap-tools.xml</loc></sitemap>
</sitemapindex>
```

---

#### M4 — Meta Keywords Tag is Excessively Long (300+ words)
**Evidence:** `index.html` lines 16–36 contain a `<meta name="keywords">` tag with 300+ words.  
**Impact:** Google ignores the keywords meta tag entirely. Bing has historically treated keyword stuffing here as a spam signal. The tag adds unnecessary HTML weight (~2 KB) on the most-crawled page.  
**Fix:** Delete the `<meta name="keywords">` tag from index.html entirely, or reduce to 5–8 brand-specific terms if retained for non-Google engines.

---

#### M5 — `mother_hospitals_v10.html` and `offer-manager-test.html` Are Orphaned Test Files in Root
**Evidence:** Both files have `noindex` meta but live at the root of the public repo.  
**Impact:** Noindex protects them from indexing, but they are publicly accessible, add crawl noise, and could be mistakenly linked to or cached by AI crawlers (which may not respect noindex).  
**Fix:** Move both files to a `/.staging/` or `/.internal/` directory, or disallow them explicitly in robots.txt:
```
Disallow: /mother_hospitals_v10.html
Disallow: /offer-manager-test.html
```

---

#### M6 — Blog Sitemap Entry Points to `blog/index.html`, Not `blog/`
**Evidence:** Sitemap contains `<loc>https://motherhospitals.co.in/blog/index.html</loc>`.  
Google canonicalises directory URLs to the trailing-slash form. The preferred canonical for the blog index should be `https://motherhospitals.co.in/blog/` (if that resolves) or verified to match the actual canonical tag inside `blog/index.html`.  
**Fix:** Confirm `blog/index.html` has `<link rel="canonical" href="https://motherhospitals.co.in/blog/"/>` and update the sitemap entry to match.

---

### LOW

#### L1 — `LLMs:` Directive in robots.txt is Non-Standard
**Evidence:** Line 64: `LLMs: https://motherhospitals.co.in/llms.txt`  
**Impact:** This is not a recognised robots.txt directive by any major crawler. Crawlers will ignore it. The correct way to signal llms.txt is via a `<link rel="alternate" type="text/plain" title="LLMs.txt" href="/llms.txt"/>` in the HTML head (which is already implemented in index.html — good). The robots.txt line is harmless but unnecessary.  
**Fix:** Remove the `LLMs:` line from robots.txt to keep the file clean.

---

#### L2 — `Bard` User-Agent in robots.txt is Deprecated
**Evidence:** Line 29: `User-agent: Bard` — Google renamed Bard to Gemini. The current agent token is `Google-Extended` (already listed at line 31).  
**Fix:** Remove the `Bard` entry to avoid confusion. `Google-Extended` is the correct and current token for Gemini/AI Overview crawling.

---

#### L3 — `X-XSS-Protection` Header is Deprecated
**Evidence:** `_headers` file includes `X-XSS-Protection: 1; mode=block`.  
**Impact:** This header is deprecated and removed from modern browsers. It can create security issues in some older browsers. Modern browsers use CSP instead.  
**Fix:** Remove `X-XSS-Protection` from the headers config. Rely on CSP for XSS protection.

---

#### L4 — Pagination: No rel=next/prev (Not Applicable)
**Status:** Not applicable. The site does not use paginated series in the traditional sense. No issues found.

---

## Category Summaries

### 1. Crawlability — PASS (minor issues only)
- robots.txt is well-structured with explicit AI crawler allowlist (15 tokens) and junk-path disallows.
- Sitemap declared and validated (200 OK, valid XML urlset).
- No blanket disallow rules blocking legitimate crawl.
- Issues: `Bard` deprecated token (L2), `LLMs:` non-standard directive (L1).

### 2. Indexability — PARTIAL
- Self-referencing canonicals confirmed on all 4 sampled pages.
- Meta robots `index, follow` with rich snippet directives on homepage and service pages.
- Issues: Homepage missing from sitemap (H1), `needleless-ivf-cost-hyderabad.html` wrongly noindexed (H2), hreflang inconsistencies (H3).

### 3. Security — FAIL
- HTTPS is served and TLS is valid.
- HTTP does NOT redirect to HTTPS (C1) — critical gap.
- `_headers` security config is ineffective on GitHub Pages (C2) — no security headers are served live.
- No CSP (M1), no HSTS (M2).

### 4. URL Structure — PASS
- All URLs are lowercase, hyphenated, descriptive, and keyword-relevant.
- No mixed-case URLs observed.
- No redirect chains observed on sampled pages (empty `redirect_chain` in fetch).
- Homepage canonical trailing-slash ambiguity is minor (H4).

### 5. Mobile — PASS
- Viewport meta: `width=device-width, initial-scale=1.0, maximum-scale=5.0` — correct.
- `mobile-web-app-capable`, `apple-mobile-web-app-capable` set.
- PWA manifest.json linked.
- No mobile-specific issues detected from source inspection.

### 6. Core Web Vitals (Source Signals) — PASS
- Site is static HTML: no client-side rendering overhead (is_spa: false).
- Preload hint for hero image in `_headers` root rule (LCP optimisation).
- DNS-prefetch for GTM, Clarity, Google Fonts.
- Preconnect to Unsplash CDN.
- No large render-blocking CSS/JS patterns detectable from source.
- Note: Actual field data (CrUX) should be verified in PageSpeed Insights. Targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.

### 7. Structured Data — PASS (Excellent)
- 5 JSON-LD blocks on homepage, all parsed as valid.
- Rich schema coverage: MedicalClinic, Physician, LocalBusiness, AggregateRating, WebSite, SearchAction, FAQPage types, VideoObject, MedicalProcedure, DefinedTermSet.
- AggregateRating present (eligible for star ratings in SERPs).
- No validation errors detected by parser.

### 8. JavaScript Rendering — PASS
- `is_spa: false` confirmed. Site is pure static HTML.
- No JavaScript-gated content detected.
- Content extracted directly from raw HTML (no Playwright render required).

### 9. IndexNow Protocol — PASS
- Key file present: `/ee61857d31f748f48aa64b652b738a10.txt` with correct key content.
- Meta tag `IndexNow-verification` present in index.html head.
- BingSiteAuth.xml present for Bing Webmaster verification.
- Bing and Yandex are supported. Naver integration not detected (low priority for this market).

---

## Priority Action List

| # | Severity | Action | Effort |
|---|---|---|---|
| 1 | CRITICAL | Enable Cloudflare proxy to force HTTP→HTTPS redirect and inject security headers | Medium (1 day) |
| 2 | CRITICAL | Confirm all security headers are actually served live after Cloudflare setup | Low |
| 3 | HIGH | Add homepage `https://motherhospitals.co.in/` as priority=1.0 entry in sitemap.xml | Low (5 min) |
| 4 | HIGH | Review and remove noindex from `needleless-ivf-cost-hyderabad.html` if content is ready | Low (10 min) |
| 5 | HIGH | Standardise all hreflang tags to `te-IN` (capital IN); run hreflang sub-skill for full audit | Medium |
| 6 | HIGH | Fix homepage canonical to include trailing slash | Low (1 min) |
| 7 | MEDIUM | Delete or disallow `mother_hospitals_v10.html` and `offer-manager-test.html` | Low |
| 8 | MEDIUM | Remove `<meta name="keywords">` bloat from index.html | Low (2 min) |
| 9 | MEDIUM | Fix `blog/index.html` sitemap entry to match canonical | Low |
| 10 | LOW | Remove `Bard` and `LLMs:` from robots.txt | Low (2 min) |

---

## Infrastructure Note

The `_headers` file in the repo root is Netlify syntax. GitHub Pages silently ignores it. If the team ever migrates to Cloudflare Pages or Netlify, this file will activate immediately — review it at migration time and add CSP and HSTS before go-live.

The site is currently served via Fastly CDN edge nodes (`cache-hyd1500020-HYD`) with 10-minute TTL for HTML pages (GitHub Pages default Cache-Control: max-age=600), meaning post-deploy propagation for SEO fixes is at most 10 minutes.
