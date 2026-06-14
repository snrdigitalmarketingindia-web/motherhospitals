#!/usr/bin/env python3
"""
build.py — Component injection for motherhospitals.co.in
=========================================================
Reads canonical HTML components from _components/ and replaces
the matching sections in every HTML page.

Usage:
  python3 build.py            # replace components in all pages
  python3 build.py --check    # report which pages differ from canonical

How markers work:
  Pages contain HTML comment markers around each component:
    <!-- NAV_START -->  ...nav HTML...  <!-- NAV_END -->
    <!-- TRUST_START -->  ...  <!-- TRUST_END -->
    <!-- FOOTER_START -->  ...  <!-- FOOTER_END -->
    <!-- MOB_START -->  ...  <!-- MOB_END -->
    <!-- WA_START -->  ...  <!-- WA_END -->

  If markers are absent, build.py detects the block by pattern
  and inserts markers on the first run (bootstrapping).
"""

import re, glob, os, sys, argparse

BASE = os.path.dirname(os.path.abspath(__file__))

# ── Load canonical components ──────────────────────────────────────────────
def load_component(name):
    path = os.path.join(BASE, '_components', name)
    if not os.path.exists(path):
        return None
    return open(path, encoding='utf-8').read().strip()

NAV       = load_component('nav.html')
TRUST     = load_component('trust-bar.html')
FOOTER    = load_component('footer.html')
MOB       = load_component('mob-cta-bar.html')
WA        = load_component('wa-float.html')

# ── Detection patterns (used for bootstrap — first run only) ───────────────
DETECT = {
    'NAV':    (r'<div class="top-bar"[\s\S]*?</nav>',         NAV),
    'TRUST':  (r'<div class="trust-bar"[\s\S]*?</div>\s*</div>', TRUST),
    'FOOTER': (r'<footer>[\s\S]*?</footer>',                   FOOTER),
    'MOB':    (r'<div[^>]+class="mob-cta-bar"[\s\S]*?</div>\s*</div>', MOB),
    'WA':     (r'<a[^>]+class="wa-float"[\s\S]*?</a>',         WA),
}

def wrap(name, content):
    return f'<!-- {name}_START -->\n{content}\n<!-- {name}_END -->'

def inject_markers(html):
    """Bootstrap: detect component blocks and wrap with markers."""
    for name, (pattern, canonical) in DETECT.items():
        if f'<!-- {name}_START -->' in html:
            continue  # already marked
        if canonical is None:
            continue
        m = re.search(pattern, html, re.DOTALL)
        if m:
            html = html[:m.start()] + wrap(name, m.group(0)) + html[m.end():]
    return html

def replace_components(html):
    """Replace content between existing markers with canonical version."""
    for name, (_, canonical) in DETECT.items():
        if canonical is None:
            continue
        pattern = rf'<!-- {name}_START -->[\s\S]*?<!-- {name}_END -->'
        if re.search(pattern, html):
            html = re.sub(pattern, wrap(name, canonical), html)
    return html

def process_file(path, check_only=False):
    original = open(path, encoding='utf-8', errors='replace').read()

    # Skip non-pages and special files
    if '<html' not in original and '<!DOCTYPE' not in original.upper():
        return False
    if len(original) < 500:
        return False

    # Skip pages that should keep custom nav (404, offer-manager-test)
    basename = os.path.basename(path)
    if basename in ('404.html', 'offer-manager-test.html', 'mother_hospitals_v10.html'):
        return False

    # Step 1: bootstrap markers if absent
    html = inject_markers(original)
    # Step 2: replace between markers with canonical
    html = replace_components(html)

    if html == original:
        return False

    if check_only:
        return True  # differs but don't write

    open(path, 'w', encoding='utf-8').write(html)
    return True

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='report diffs without writing')
    args = parser.parse_args()

    os.chdir(BASE)
    pages = sorted(glob.glob('*.html') + glob.glob('blog/*.html'))

    changed = 0
    for path in pages:
        if process_file(path, check_only=args.check):
            changed += 1
            if args.check:
                print(f'  DIFFERS: {path}')

    action = 'would update' if args.check else 'updated'
    print(f'\nbuild.py: {action} {changed}/{len(pages)} pages')
    if args.check and changed > 0:
        print('Run `python3 build.py` to apply.')

if __name__ == '__main__':
    main()
