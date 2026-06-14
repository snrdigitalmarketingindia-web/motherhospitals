#!/usr/bin/env python3
"""
Site health scanner — run before every deploy.
Catches JS bugs, wrong IDs, broken form fields, missing scripts.
Exit code 1 if any FAIL found (blocks CI deploy).
"""

import glob, sys, re

CHECKS = [
    # (description, pattern_to_find, is_bad=True means finding it is a failure)
    ("Wrong GA4 ID (not G-RBR9NWNXGN)",    r"G-[A-Z0-9]{8,10}(?!>|')",     "wrong_ga4"),
    ("Bitwise OR instead of ||",             r"\w\|\[\]",                      "bad_pattern"),
    ("Missing () on function declaration",   r"function\w*\{",                 "bad_pattern"),
    ("Arrow fn missing () before =>",        r"'click',=>",                    "bad_pattern"),
    ("Wrong form entry field names",         r"entry\.(name|phone|service|message|email)=", "bad_pattern"),
]

CORRECT_GA4   = "G-RBR9NWNXGN"
CORRECT_FORM  = "1FAIpQLSeApfdnBsBjsoqIU3teeS062EEfuprY-CY8riVIWM8aY0LL9A"
CLARITY_TAG   = "wqa31zckot"
GTAG_SCRIPT   = "googletagmanager.com/gtag/js"

def scan_file(path):
    issues = []
    try:
        content = open(path, encoding="utf-8", errors="replace").read()
    except Exception as e:
        return [f"Could not read file: {e}"]

    # Skip non-page files (tiny files, fragments)
    if len(content) < 500:
        return []

    is_html = "<html" in content or "<!DOCTYPE" in content.lower()
    if not is_html:
        return []

    # 1. GA4 ID check
    ids = re.findall(r"G-[A-Z0-9]{8,10}", content)
    for gid in ids:
        if gid != CORRECT_GA4:
            issues.append(f"Wrong GA4 ID: {gid} (expected {CORRECT_GA4})")

    # 2. Bitwise OR instead of logical OR before array
    if re.search(r"[a-zA-Z\]]\|\[\]", content):
        issues.append("Bitwise OR `|[]` found — should be `||[]`")

    # 3. function declaration missing ()
    bad_fn = re.findall(r"function\s+\w*\s*\{", content)
    # filter out legit named functions like "function foo() {" — only flag "function foo{"
    for fn in bad_fn:
        if "(" not in fn:
            issues.append(f"Missing () on function: `{fn.strip()}`")

    # 4. Arrow function missing ()
    if re.search(r"'(click|submit|change|input)',\s*=>", content):
        issues.append("Arrow function missing (): `'click',=>` should be `'click',()=>`")

    # 5. Wrong form entry field names
    bad_fields = re.findall(r"entry\.(name|phone|service|message|email)=", content)
    if bad_fields:
        issues.append(f"Wrong form entry fields: {set(bad_fields)} — use numeric IDs")

    # 6. Missing GA4 script (warning only — Hindi/stub pages may not have it yet)
    if GTAG_SCRIPT not in content:
        issues.append("WARN: Missing GA4 gtag.js script")

    # 7. Missing Clarity (warning only)
    if CLARITY_TAG not in content:
        issues.append("WARN: Missing Microsoft Clarity tag")

    # 8. Wrong form ID
    if "formResponse" in content and CORRECT_FORM not in content:
        issues.append("Wrong Google Form ID in formResponse URL")

    # 9. dataLayer not initialized as array
    if "window.dataLayer" in content:
        if re.search(r"window\.dataLayer\s*=\s*window\.dataLayer\s*\|\s*\[", content):
            issues.append("dataLayer initialized with `|` instead of `||`")

    return issues


def main():
    files = sorted(glob.glob("*.html"))
    if not files:
        # try from repo root
        import os
        os.chdir("/Users/apple/Documents/motherhospitalswebsite")
        files = sorted(glob.glob("*.html"))

    total = len(files)
    failed = []
    passed = 0

    for path in files:
        issues = scan_file(path)
        if issues:
            failed.append((path, issues))
        else:
            passed += 1

    # Report
    print(f"\n{'='*60}")
    print(f"SITE HEALTH SCAN — {total} pages")
    print(f"{'='*60}")

    warnings = [(p, [i for i in iss if i.startswith("WARN")]) for p, iss in failed]
    errors   = [(p, [i for i in iss if not i.startswith("WARN")]) for p, iss in failed]
    errors   = [(p, iss) for p, iss in errors if iss]

    if errors:
        print("\n── ERRORS (blocks deploy) ──")
        for path, issues in errors:
            print(f"\nFAIL  {path}")
            for issue in issues:
                print(f"      • {issue}")

    warn_pages = [(p, iss) for p, iss in warnings if iss]
    if warn_pages:
        print(f"\n── WARNINGS ({len(warn_pages)} pages missing GA4/Clarity — add tracking when ready) ──")
        for path, _ in warn_pages:
            print(f"      {path}")

    if not errors and not warn_pages:
        print("\nAll checks passed!")

    print(f"\n{'='*60}")
    print(f"PASS: {passed}   FAIL: {len(failed)}   TOTAL: {total}")
    print(f"{'='*60}\n")

    if errors:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
