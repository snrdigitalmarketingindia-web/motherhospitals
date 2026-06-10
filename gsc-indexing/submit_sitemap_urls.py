"""
Mother Hospitals — Bing Webmaster API: Submit all sitemap URLs
──────────────────────────────────────────────────────────────
Reads sitemap.xml and submits every <loc> URL via Bing Webmaster Tools API.
Site must be verified in Bing Webmaster Tools (already done).

Requires env var: BING_API_KEY (stored as GitHub secret)

Usage:
  python submit_sitemap_urls.py           # submit all URLs
  python submit_sitemap_urls.py --dry-run # print URLs, don't send
"""

import argparse
import os
import sys
import xml.etree.ElementTree as ET
from datetime import date

import requests

# ── CONFIG ────────────────────────────────────────────────────────────────────
SITE_URL      = "https://motherhospitals.co.in/"
BING_API      = "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch"
SITEMAP_LOCAL = os.path.join(os.path.dirname(__file__), "../sitemap.xml")
SITEMAP_URL   = "https://motherhospitals.co.in/sitemap.xml"
BATCH_SIZE    = 500   # Bing allows up to 500 URLs per request
# ─────────────────────────────────────────────────────────────────────────────


def load_sitemap_urls():
    """Parse sitemap.xml and return list of all URLs."""
    if os.path.exists(SITEMAP_LOCAL):
        print(f"[*] Reading local sitemap: {SITEMAP_LOCAL}")
        tree = ET.parse(SITEMAP_LOCAL)
        root = tree.getroot()
    else:
        print(f"[*] Fetching sitemap: {SITEMAP_URL}")
        resp = requests.get(SITEMAP_URL, timeout=15)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for url_el in root.findall("sm:url", ns):
        loc = url_el.findtext("sm:loc", namespaces=ns)
        if loc:
            urls.append(loc.strip())
    return urls


def submit_to_bing(urls, api_key, dry_run=False):
    """Submit URLs to Bing Webmaster Tools API in batches of 500."""
    if dry_run:
        print(f"\n[dry-run] Would submit {len(urls)} URLs to Bing:")
        for u in urls[:5]:
            print(f"  {u}")
        if len(urls) > 5:
            print(f"  ... and {len(urls) - 5} more")
        return True

    headers = {"Content-Type": "application/json; charset=utf-8"}
    endpoint = f"{BING_API}?apikey={api_key}"

    success = True
    for i in range(0, len(urls), BATCH_SIZE):
        batch = urls[i:i + BATCH_SIZE]
        payload = {
            "siteUrl": SITE_URL,
            "urlList": batch,
        }
        print(f"[*] Submitting batch {i // BATCH_SIZE + 1}: {len(batch)} URLs...")
        try:
            resp = requests.post(endpoint, json=payload, headers=headers, timeout=30)
            if resp.status_code == 200:
                print(f"[✓] Batch accepted — HTTP 200")
            else:
                print(f"[!] HTTP {resp.status_code}: {resp.text[:300]}")
                success = False
        except Exception as e:
            print(f"[!] Request failed: {e}")
            success = False

    return success


def main():
    parser = argparse.ArgumentParser(description="Submit sitemap URLs to Bing Webmaster API")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print URLs without actually submitting")
    args = parser.parse_args()

    print(f"\n{'='*55}")
    print(f"  Mother Hospitals — Bing URL Submission")
    print(f"  {date.today()} {'[DRY RUN]' if args.dry_run else ''}")
    print(f"{'='*55}\n")

    # Get API key from env
    api_key = os.environ.get("BING_API_KEY", "")
    if not api_key and not args.dry_run:
        print("[!] BING_API_KEY env var not set. Add it as a GitHub secret.")
        sys.exit(1)

    urls = load_sitemap_urls()
    if not urls:
        print("[*] No URLs found in sitemap.")
        return

    print(f"[*] {len(urls)} URL(s) found in sitemap\n")
    ok = submit_to_bing(urls, api_key, dry_run=args.dry_run)
    print(f"\n{'='*55}")
    print(f"  Done — {'success' if ok else 'FAILED'}")
    print(f"{'='*55}\n")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
