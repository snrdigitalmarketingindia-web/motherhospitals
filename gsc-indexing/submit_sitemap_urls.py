"""
Mother Hospitals — IndexNow: Submit all sitemap URLs to Google/Bing/Yandex
──────────────────────────────────────────────────────────────────────────
Reads sitemap.xml and submits every <loc> URL via IndexNow protocol.
IndexNow is supported by Google, Bing, and Yandex — no OAuth needed.

Verification: ee61857d31f748f48aa64b652b738a10.txt must be live at:
https://motherhospitals.co.in/ee61857d31f748f48aa64b652b738a10.txt

Usage:
  python submit_sitemap_urls.py              # submit all URLs
  python submit_sitemap_urls.py --dry-run    # print URLs, don't send
"""

import argparse
import json
import os
import sys
import xml.etree.ElementTree as ET
from datetime import date

import requests

# ── CONFIG ────────────────────────────────────────────────────────────────────
SITE_URL      = "https://motherhospitals.co.in"
INDEXNOW_KEY  = "ee61857d31f748f48aa64b652b738a10"
INDEXNOW_API  = "https://yandex.com/indexnow"   # Yandex endpoint — confirmed working
SITEMAP_LOCAL = os.path.join(os.path.dirname(__file__), "../sitemap.xml")
SITEMAP_URL   = "https://motherhospitals.co.in/sitemap.xml"
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


def submit_urls(urls, dry_run=False):
    """Submit all URLs to IndexNow in one batch POST request."""
    if dry_run:
        print(f"\n[dry-run] Would submit {len(urls)} URLs:")
        for u in urls:
            print(f"  {u}")
        return True

    payload = {
        "host": "motherhospitals.co.in",
        "key": INDEXNOW_KEY,
        "keyLocation": f"{SITE_URL}/{INDEXNOW_KEY}.txt",
        "urlList": urls,
    }

    print(f"[*] Submitting {len(urls)} URLs to IndexNow...")
    try:
        resp = requests.post(
            INDEXNOW_API,
            json=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
            timeout=30,
        )
        if resp.status_code in (200, 202):
            print(f"[✓] Success — HTTP {resp.status_code}")
            print(f"    Google, Bing, and Yandex have been notified.")
            return True
        elif resp.status_code == 422:
            print(f"[!] HTTP 422 — Key file not yet accessible at:")
            print(f"    {SITE_URL}/{INDEXNOW_KEY}.txt")
            print(f"    Make sure the key file is deployed and live first.")
            return False
        else:
            print(f"[!] HTTP {resp.status_code}: {resp.text[:300]}")
            return False
    except Exception as e:
        print(f"[!] Request failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Submit sitemap URLs via IndexNow")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print URLs without actually submitting")
    args = parser.parse_args()

    print(f"\n{'='*55}")
    print(f"  Mother Hospitals — IndexNow Submission")
    print(f"  {date.today()} {'[DRY RUN]' if args.dry_run else ''}")
    print(f"{'='*55}\n")

    urls = load_sitemap_urls()
    if not urls:
        print("[*] No URLs found in sitemap. Nothing to submit.")
        return

    print(f"[*] {len(urls)} URL(s) found in sitemap\n")

    ok = submit_urls(urls, dry_run=args.dry_run)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
