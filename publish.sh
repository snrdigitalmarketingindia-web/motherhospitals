#!/bin/bash
# ────────────────────────────────────────────────────────────────
# publish.sh — Run this AFTER uploading files to the server
# Does: IndexNow + Bing Webmaster + Google Sitemap ping
# Usage: bash publish.sh
# ────────────────────────────────────────────────────────────────

cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════"
echo "  Mother Hospitals — Post-Upload Indexing"
echo "  $(date)"
echo "═══════════════════════════════════════════════"

# 1. IndexNow + Bing Webmaster API
echo ""
echo "1. Submitting to IndexNow (Bing/Yandex/Naver) + Bing API..."
python3 gsc-indexing/submit_sitemap_urls.py

# 2. Google — ping sitemap (signals crawler to revisit)
echo ""
echo "2. Pinging Google Sitemap..."
SITEMAP_URL="https://motherhospitals.co.in/sitemap.xml"
GOOGLE_PING="https://www.google.com/ping?sitemap=${SITEMAP_URL}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$GOOGLE_PING")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅  Google sitemap ping accepted [HTTP 200]"
else
  echo "⚠️  Google ping HTTP $HTTP_CODE"
fi

# 3. Also ping blog sitemap if it exists
BLOG_SITEMAP="https://motherhospitals.co.in/blog/sitemap.xml"
HTTP_BLOG=$(curl -s -o /dev/null -w "%{http_code}" "https://www.google.com/ping?sitemap=${BLOG_SITEMAP}")
if [ "$HTTP_BLOG" = "200" ]; then
  echo "✅  Google blog sitemap ping accepted [HTTP 200]"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  Done. Next steps:"
echo "  • GSC UI → Sitemaps → Resubmit sitemap.xml"
echo "  • GSC UI → URL Inspection → Test individual new pages"
echo "═══════════════════════════════════════════════"
