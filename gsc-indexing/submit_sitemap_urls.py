"""
URL Indexing — Mother Hospitals (motherhospitals.co.in)
-------------------------------------------------------
Submits URLs via TWO channels on every push:

  1. IndexNow  → notifies Bing, Yandex, Seznam, Naver in one call (no auth needed)
  2. Bing Webmaster API → direct Bing submission (requires BING_API_KEY secret)

Reads sitemap.xml, prioritises pages with today's <lastmod>,
then submits up to 100 URLs per run.
"""

import os
import sys
import xml.etree.ElementTree as ET
from datetime import date
import requests

# ── Config ────────────────────────────────────────────────────────────────────
SITE_URL          = "https://motherhospitals.co.in/"
SITE_HOST         = "motherhospitals.co.in"
SITEMAP_PATH      = "sitemap.xml"
DAILY_QUOTA       = 100

# IndexNow — covers Bing, Yandex, Seznam, Naver (key file already live on site)
INDEXNOW_KEY      = "ee61857d31f748f48aa64b652b738a10"
INDEXNOW_URL      = "https://api.indexnow.org/indexnow"
INDEXNOW_KEY_LOC  = f"https://{SITE_HOST}/{INDEXNOW_KEY}.txt"

# Bing Webmaster API (direct)
BING_API_URL      = "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch"
# ─────────────────────────────────────────────────────────────────────────────


def load_urls(sitemap_path: str) -> list[dict]:
    """Parse sitemap and return list of {url, lastmod, priority}."""
    tree = ET.parse(sitemap_path)
    ns   = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for url_el in tree.getroot().findall("sm:url", ns):
        loc      = url_el.findtext("sm:loc",      namespaces=ns) or ""
        lastmod  = url_el.findtext("sm:lastmod",  namespaces=ns) or ""
        priority = url_el.findtext("sm:priority", namespaces=ns) or "0.5"
        urls.append({"url": loc, "lastmod": lastmod, "priority": float(priority)})
    return urls


def prioritise(urls: list[dict]) -> list[str]:
    """
    Sort order:
      1. Pages whose lastmod == today  (freshest first, by priority desc)
      2. All others by priority desc, then alphabetical
    Returns plain URL strings, capped at DAILY_QUOTA.
    """
    today_str = date.today().isoformat()
    today  = [u for u in urls if u["lastmod"] == today_str]
    rest   = [u for u in urls if u["lastmod"] != today_str]
    today.sort(key=lambda u: (-u["priority"], u["url"]))
    rest.sort( key=lambda u: (-u["priority"], u["url"]))
    ordered = today + rest
    return [u["url"] for u in ordered[:DAILY_QUOTA]]


def submit_indexnow(urls: list[str]) -> bool:
    """
    POST to IndexNow — notifies Bing, Yandex, Seznam, Naver simultaneously.
    Returns True on success.
    """
    payload = {
        "host":        SITE_HOST,
        "key":         INDEXNOW_KEY,
        "keyLocation": INDEXNOW_KEY_LOC,
        "urlList":     urls,
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    print(f"\n📡 IndexNow — submitting {len(urls)} URL(s) to Bing + Yandex + more …")
    resp = requests.post(INDEXNOW_URL, json=payload, headers=headers, timeout=30)

    if resp.status_code in (200, 202):
        print(f"✅  IndexNow accepted {len(urls)} URL(s)  [HTTP {resp.status_code}]")
        print(f"   Engines notified: Bing, Yandex, Seznam, Naver")
        return True
    else:
        print(f"⚠️  IndexNow HTTP {resp.status_code}: {resp.text}", file=sys.stderr)
        return False


def submit_bing(api_key: str, urls: list[str]) -> bool:
    """
    POST directly to Bing Webmaster API.
    Returns True on success.
    """
    payload = {"siteUrl": SITE_URL, "urlList": urls}
    params  = {"apikey": api_key}
    headers = {"Content-Type": "application/json; charset=utf-8"}

    print(f"\n🔵 Bing Webmaster API — submitting {len(urls)} URL(s) …")
    resp = requests.post(BING_API_URL, json=payload, params=params, headers=headers, timeout=30)

    if resp.status_code == 200:
        d = resp.json().get("d")
        if d and d.get("ErrorCode", 0) != 0:
            print(f"⚠️  Bing API error: {d}", file=sys.stderr)
            return False
        print(f"✅  Bing API accepted {len(urls)} URL(s).")
        return True
    else:
        print(f"⚠️  Bing API HTTP {resp.status_code}: {resp.text}", file=sys.stderr)
        return False


def main():
    urls    = load_urls(SITEMAP_PATH)
    to_send = prioritise(urls)
    print(f"Sitemap: {len(urls)} URLs → sending {len(to_send)} (quota={DAILY_QUOTA})")

    success = True

    # 1. IndexNow (Bing + Yandex + more) — always runs, no secret needed
    success &= submit_indexnow(to_send)

    # 2. Bing direct API — runs only if BING_API_KEY is set
    bing_key = os.environ.get("BING_API_KEY", "").strip()
    if bing_key:
        success &= submit_bing(bing_key, to_send)
    else:
        print("\n⚠️  BING_API_KEY not set — skipping Bing direct submission.")

    if not success:
        sys.exit(1)

    print(f"\n🎉 Done — {len(to_send)} URLs submitted.")
    for u in to_send:
        print(f"   → {u}")


if __name__ == "__main__":
    main()
