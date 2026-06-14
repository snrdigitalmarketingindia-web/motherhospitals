#!/usr/bin/env python3
"""Second pass — catch remaining ₹99,000 patterns missed by pass 1."""

import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

RULES = [
    # Schema.org price fields
    (re.compile(r'"price":\s*"99000"'), '"price": "0"'),  # keep field, zero out
    (re.compile(r'"price":\s*99000\b'), '"price": 0'),
    (re.compile(r'"99000"'), '""'),

    # FAQ questions mentioning the price
    (re.compile(r'Is ₹99,000 the cheapest IVF[^?"]*\?', re.I),
     'Is IVF at Mother Hospitals affordable?'),
    (re.compile(r"Mother Hospitals[''']? ₹99[,.]?000 package", re.I),
     "Mother Hospitals' all-inclusive IVF package"),

    # "₹99,000 all-inclusive" with any separator (space, /, -)
    (re.compile(r'₹99[,.]?000/?\s*-?\s*all-inclusive', re.I), 'all-inclusive'),
    (re.compile(r'all-inclusive\s+₹99[,.]?000', re.I), 'all-inclusive'),

    # "The ₹99,000 package" / "The ₹99,000 all-inclusive … package"
    (re.compile(r'[Tt]he ₹99[,.]?000 ', re.I), 'The all-inclusive IVF '),

    # "starting from ₹99,000" / "priced … from ₹99,000"
    (re.compile(r'starting from ₹99[,.]?000/-?', re.I), 'competitively priced'),
    (re.compile(r'priced similarly.*?₹99[,.]?000/-?', re.I),
     'priced similarly to our standard IVF packages'),

    # "IVF all-inclusive ₹99,000"
    (re.compile(r'IVF all-inclusive ₹99[,.]?000', re.I), 'all-inclusive IVF'),

    # Generic: "₹99,000 —" / "₹99,000." / "₹99,000," / "₹99,000 " etc
    # Must come after specific rules above
    (re.compile(r'₹99[,.]?000/-?'), ''),

    # Clean-up artefacts
    (re.compile(r'\bat a transparent, all-inclusive price\b', re.I),
     'at an all-inclusive, transparent price'),
    (re.compile(r'  +'), ' '),
    (re.compile(r',\s*\.'), '.'),
    (re.compile(r'—\s*\.'), '.'),
    (re.compile(r'\. \.'), '.'),
    (re.compile(r'\(\s*\)'), ''),
    (re.compile(r'\s+\.'), '.'),
]


def clean_file(path):
    with open(path, encoding='utf-8') as f:
        original = f.read()
    content = original
    for pat, repl in RULES:
        content = pat.sub(repl, content)
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


changed = []
for root, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
    for fname in sorted(files):
        if not fname.endswith('.html'):
            continue
        path = os.path.join(root, fname)
        rel = os.path.relpath(path, ROOT)
        if clean_file(path):
            changed.append(rel)
            print(f'  ✅ {rel}')

print(f'\nPass 2 modified: {len(changed)} files')
