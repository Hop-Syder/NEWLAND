#!/usr/bin/env python3
"""Télécharge les woff2 variables (subset latin) et nettoie les CSS temporaires."""
import pathlib
import re
import subprocess

FONTS = pathlib.Path("/home/z/my-project/src/app/fonts")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

JOBS = [
    ("nunito.css", "NunitoSans-Variable.woff2"),
    ("geist.css", "GeistMono-Variable.woff2"),
]

for css_name, out_name in JOBS:
    css_path = FONTS / css_name
    css = css_path.read_text(encoding="utf-8")
    # Blocs @font-face ; le subset latin commence par unicode-range: U+0000-00FF
    blocks = re.findall(r"@font-face\s*\{[^}]+\}", css)
    latin_url = None
    for block in blocks:
        if "U+0000-00FF" in block:
            m = re.search(r"url\((https://[^)]+\.woff2)\)", block)
            if m:
                latin_url = m.group(1)
                break
    if not latin_url:
        raise SystemExit(f"Subset latin introuvable dans {css_name}")
    out = FONTS / out_name
    subprocess.run(
        ["curl", "-s", "-A", UA, "-o", str(out), latin_url], check=True
    )
    size = out.stat().st_size
    print(f"{out_name}: {size/1024:.1f} Ko  <- {latin_url[:60]}…")
    css_path.unlink()

print("OK")
