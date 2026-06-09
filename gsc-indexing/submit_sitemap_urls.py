"""
Mother Hospitals — Google Indexing API: Submit all sitemap URLs
──────────────────────────────────────────────────────────────
Reads sitemap.xml, submits every <loc> URL to Google's Indexing API.

Usage:
  python submit_sitemap_urls.py                     # submit all URLs
  python submit_sitemap_urls.py --changed-only      # only lastmod = today
  python submit_sitemap_urls.py --dry-run           # print URLs, don't send

Requirements:
  pip install google-auth requests

Credentials:
  Set env var GOOGLE_SERVICE_ACCOUNT_JSON with the full JSON content
  of your Google service account key (must have Indexing API enabled).
"""

import argparse
import json
import os
import sys
import time
import xml.etree.ElementTree as ET
from datetime import date

import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleRequest

# ── CONFIG ────────────────────────────────────────────────────────────────────
SITEMAP_URL   = "https://motherhospitals.co.in/sitemap.xml"
SITEMAP_LOCAL = os.path.join(os.path.dirname(__file__), "../sitemap.xml")
INDEXING_API  = "https://indexing.googleapis.com/v3/urlNotifications:publish"
SCOPES        = ["https://www.googleapis.com/auth/indexing"]
DELAY_SECONDS = 1.0   # polite delay between API calls
# ─────────────────────────────────────────────────────────────────────────────


def get_access_token():
    """Get a fresh OAuth2 bearer token from the service account JSON."""
    sa_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not sa_json:
        print("[!] GOOGLE_SERVICE_ACCOUNT_JSON env var not set.")
        print("    Set it to the full JSON content of your service account key file.")
        sys.exit(1)

    try:
        sa_info = json.loads(sa_json)
    except json.JSONDecodeError as e:
        print(f"[!] Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: {e}")
        sys.exit(1)

    credentials = service_account.Credentials.from_service_account_info(
        sa_info, scopes=SCOPES
    )
    credentials.refresh(GoogleRequest())
    return credentials.token


def load_sitemap_urls(changed_only=False):
    """Parse sitemap.xml and return list of URLs. If changed_only, only today's lastmod."""
    today = date.today().isoformat()

    # Try local file first (faster in CI), fall back to live URL
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
        if not loc:
            continue
        if changed_only:
            lastmod = url_el.findtext("sm:lastmod", namespaces=ns) or ""
            if lastmod.strip() != today:
                continue
        urls.append(loc.strip())

    return urls


def submit_url(url, token, dry_run=False):
    """Submit a single URL to the Google Indexing API."""
    if dry_run:
        print(f"  [dry-run] Would submit: {url}")
        return True

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {"url": url, "type": "URL_UPDATED"}

    try:
        resp = requests.post(INDEXING_API, headers=headers, json=payload, timeout=15)
        if resp.status_code == 200:
            return True
        elif resp.status_code == 429:
            print(f"  [rate-limit] {url} — waiting 60s then retrying...")
            time.sleep(60)
            resp = requests.post(INDEXING_API, headers=headers, json=payload, timeout=15)
            return resp.status_code == 200
        else:
            print(f"  [!] HTTP {resp.status_code} for {url}: {resp.text[:200]}")
            return False
    except Exception as e:
        print(f"  [!] Exception for {url}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Submit sitemap URLs to Google Indexing API")
    parser.add_argument("--changed-only", action="store_true",
                        help="Only submit URLs where lastmod = today")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print URLs without actually submitting")
    args = parser.parse_args()

    print(f"\n{'='*55}")
    print(f"  Mother Hospitals — GSC Indexing Submission")
    print(f"  {date.today()} {'[DRY RUN]' if args.dry_run else ''}")
    print(f"{'='*55}\n")

    # Load URLs from sitemap
    urls = load_sitemap_urls(changed_only=args.changed_only)
    if not urls:
        mode = "changed today" if args.changed_only else "total"
        print(f"[*] No URLs found ({mode}). Nothing to submit.")
        return

    print(f"[*] {len(urls)} URL(s) to submit\n")

    # Get OAuth token (skip in dry-run)
    token = None
    if not args.dry_run:
        print("[*] Authenticating with Google...")
        token = get_access_token()
        print("[*] Authenticated.\n")

    # Submit each URL
    success = 0
    failed = 0
    for i, url in enumerate(urls, 1):
        print(f"  [{i:3d}/{len(urls)}] {url}")
        ok = submit_url(url, token, dry_run=args.dry_run)
        if ok:
            success += 1
        else:
            failed += 1
        if not args.dry_run:
            time.sleep(DELAY_SECONDS)

    print(f"\n{'='*55}")
    print(f"  Done — {success} submitted, {failed} failed")
    print(f"{'='*55}\n")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
