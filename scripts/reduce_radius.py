#!/usr/bin/env python3
"""Réduit tous les rayons de bordure de l'interface Maison Cauris.

Échelle cible (sobre, cohérente) :
  - Cartes / blocs        : rounded-md (6 px)
  - Boutons / champs      : rounded-md (6 px)
  - Conteneurs larges     : rounded-lg (8 px)
  - Petits indicateurs fins (barre 4 px) : rounded-sm (2 px)

rounded-full disparaît au profit de formes quasi carrées,
conformément à la demande « réduire tous les rayons ».
"""

import pathlib
import re

ROOTS = [
    pathlib.Path("src/components/shop"),
    pathlib.Path("src/app"),
]

# Ordre important : des plus longs/spécifiques aux plus courts.
MAPPING = [
    ("rounded-[2rem]", "rounded-lg"),
    ("rounded-[1.75rem]", "rounded-lg"),
    ("rounded-3xl", "rounded-lg"),
    ("rounded-2xl", "rounded-md"),
    ("rounded-xl", "rounded-md"),
    ("rounded-lg", "rounded-md"),
    ("rounded-full", "rounded-md"),
    ("rounded-md", "rounded-md"),  # no-op, gardé pour clarté
]

# Exceptions : éléments très fins où rounded-md ferait des formes bizarres.
EXCEPTIONS = [
    # Barre active du dock (h-1) : rounded-sm suffit et reste discret.
    ("h-1 w-6 rounded-md", "h-1 w-6 rounded-sm"),
]

changed_files = 0
for root in ROOTS:
    for path in sorted(root.rglob("*.tsx")):
        text = path.read_text(encoding="utf-8")
        original = text
        for old, new in MAPPING:
            text = text.replace(old, new)
        for old, new in EXCEPTIONS:
            text = text.replace(old, new)
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed_files += 1
            print(f"modifié : {path}")

# globals.css : --radius 0.75rem -> 0.5rem + scrollbar 999px -> 4px
css = pathlib.Path("src/app/globals.css")
text = css.read_text(encoding="utf-8")
text2 = text.replace("--radius: 0.75rem;", "--radius: 0.5rem;")
text2 = text2.replace(
    ".nice-scroll::-webkit-scrollbar-thumb {\n  background: #d8d4ca;\n  border-radius: 999px;",
    ".nice-scroll::-webkit-scrollbar-thumb {\n  background: #d8d4ca;\n  border-radius: 4px;",
)
if text2 != text:
    css.write_text(text2, encoding="utf-8")
    print("modifié : src/app/globals.css")
    changed_files += 1

print(f"\n{changed_files} fichier(s) modifié(s)")

# Vérification : plus aucun grand rayon ne doit subsister
leftover = []
for root in ROOTS:
    for path in root.rglob("*.tsx"):
        for m in re.finditer(r"rounded-(?!md|sm|lg\b)[a-z0-9.\[\]/-]+", path.read_text(encoding="utf-8")):
            leftover.append(f"{path}: {m.group(0)}")
print("restes à corriger :", leftover if leftover else "aucun")
