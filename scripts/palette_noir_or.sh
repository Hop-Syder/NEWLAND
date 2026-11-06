#!/bin/bash
# Bascule de la palette vert/orange vers NOIR & OR (Maison Cauris)
# Cible : composants + page + layout. globals.css est réécrit à part.

FILES=$(ls /home/z/my-project/src/components/shop/*.tsx /home/z/my-project/src/app/page.tsx /home/z/my-project/src/app/layout.tsx)

for f in $FILES; do
  sed -i \
    -e 's|#123d29|#0b0b0b|g' \
    -e 's|#21301f|#111111|g' \
    -e 's|#43503f|#3d3d3d|g' \
    -e 's|#5f6d5e|#6c6c6c|g' \
    -e 's|#8a9a86|#8f8f8f|g' \
    -e 's|#7a8a75|#808080|g' \
    -e 's|#faf6ee|#faf9f6|g' \
    -e 's|#efe7d6|#eeebe4|g' \
    -e 's|#f2ecdf|#f1efe9|g' \
    -e 's|#e6ddc9|#e6e3db|g' \
    -e 's|#d9cfba|#d8d4ca|g' \
    -e 's|#f2b56b|#d4af37|g' \
    -e 's|#f8f3e7|#f4eeda|g' \
    -e 's|#f6e3c9|#e9dcb4|g' \
    -e 's|#8a8163|#8a7a4d|g' \
    -e 's|#e4efe4|#f4eeda|g' \
    -e 's|#f8e8d4|#f4eeda|g' \
    -e 's|#8a4d10|#7a5f10|g' \
    -e 's|bg-\[#1b5e3f\]/10|bg-[#d4af37]/15|g' \
    -e 's|to-\[#1b5e3f\]/20|to-[#0b0b0b]/15|g' \
    -e 's|bg-\[#1b5e3f\]|bg-[#141414]|g' \
    -e 's|#14503a|#2e2e2e|g' \
    -e 's|border-\[#1b5e3f\]|border-[#111111]|g' \
    -e 's|text-\[#1b5e3f\]|text-[#8a6a14]|g' \
    -e 's|#1b5e3f|#141414|g' \
    -e 's|bg-\[#e8842c\]|bg-[#d4af37]|g' \
    -e 's|#d9741f|#bfa032|g' \
    -e 's|text-\[#e8842c\]|text-[#d4af37]|g' \
    -e 's|border-\[#e8842c\]|border-[#d4af37]|g' \
    -e 's|outline-\[#e8842c\]|outline-[#d4af37]|g' \
    -e 's|accent-\[#e8842c\]|accent-[#d4af37]|g' \
    -e 's|shadow-\[#e8842c\]|shadow-[#d4af37]|g' \
    -e 's|from-\[#e8842c\]|from-[#d4af37]|g' \
    -e 's|#e8842c|#d4af37|g' \
    "$f"
done

echo "OK — remplacements appliqués."
