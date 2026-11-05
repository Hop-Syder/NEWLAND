#!/usr/bin/env python3
"""Recherche d'images via le CLI z-ai, parsing stdout, génération de images.ts."""
import json
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

QUERIES = {
    "hero": "bright modern kitchen interior warm light wooden counter plants",
    "cat_appareils": "modern kitchen appliances collection in showroom",
    "cat_cuisine": "colorful cookware pots and pans on stove kitchen",
    "cat_maison": "cozy modern living room with sofa and warm decoration",
    "p_microondes": "white microwave oven on kitchen countertop",
    "p_frigo": "silver two door refrigerator in bright kitchen",
    "p_lavelinge": "front load washing machine white modern",
    "p_blender": "large food blender with glass jar on kitchen counter",
    "p_blender2": "small electric grinder blender kitchen appliance",
    "p_ventbrum": "misting fan water spray standing fan",
    "p_ventpince": "small clip on desk fan white",
    "p_batterie23": "nonstick cookware set pots pans set many pieces",
    "p_batterie13": "black nonstick pot set cookware granite",
    "p_casseroles": "stainless steel casserole pot set kitchen",
    "p_kitcuisine": "kitchen utensils set peeler scissors knife sharpener",
    "p_seaux": "plastic basin bowl set colorful household",
    "p_bureau": "wooden office desk modern workspace",
    "p_fauteuil": "ergonomic office chair black mesh",
    "p_chaise": "comfortable swivel office chair padded",
    "p_canape": "modern sofa living room wooden frame",
    "p_plaque": "built in gas hob stove countertop black",
    "p_hotte": "kitchen range hood stainless steel",
}

MAX_WORKERS = 3


def extract_json(text: str):
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None


def search(key: str, query: str):
    for attempt in range(1, 5):
        try:
            proc = subprocess.run(
                [
                    "z-ai", "image-search",
                    "-q", query,
                    "-c", "3",
                    "--gl", "us",
                    "--no-rank",
                ],
                capture_output=True,
                text=True,
                timeout=180,
            )
            data = extract_json(proc.stdout or "")
            if data and data.get("success") and data.get("results"):
                urls = [r["original_url"] for r in data["results"] if r.get("original_url")]
                if urls:
                    print(f"OK   {key}: {len(urls)} images", flush=True)
                    return key, urls
            status = (data or {}).get("error") or proc.stderr[-120:] if (proc.stderr or "") else "no results"
            print(f"RETRY {key} (essai {attempt}): {str(status)[:100]}", flush=True)
        except subprocess.TimeoutExpired:
            print(f"RETRY {key} (essai {attempt}): timeout", flush=True)
        except Exception as exc:  # noqa: BLE001
            print(f"RETRY {key} (essai {attempt}): {exc}", flush=True)
        time.sleep(8 * attempt)
    print(f"FAIL {key}", flush=True)
    return key, []


def main():
    results = {}
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(search, k, q): k for k, q in QUERIES.items()}
        for fut in as_completed(futures):
            key, urls = fut.result()
            results[key] = urls

    missing = [k for k, v in results.items() if not v]
    if missing:
        print(f"Manquants après 1re passe : {missing}")
        # 2e passe séquentielle pour les manquants
        for k in missing:
            _, urls = search(k, QUERIES[k])
            results[k] = urls

    # Génération du fichier images.ts
    lines = [
        "/**",
        " * Correspondance entre clés d'illustrations et URLs réelles (recherche d'images).",
        " * Généré automatiquement par scripts/build_images.py — ne pas éditer à la main.",
        " */",
        "",
        "export const IMG: Record<string, string[]> = {",
    ]
    for key in QUERIES:
        urls = results.get(key, [])
        items = ",\n    ".join(f'"{u}"' for u in urls)
        lines.append(f"  {key}: [{items}],")
    lines.append("};")
    lines.append("")

    out = "/home/z/my-project/src/lib/images.ts"
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    total = sum(len(v) for v in results.values())
    empty = [k for k, v in results.items() if not v]
    print(f"\nimages.ts écrit : {total} images, clés vides : {empty if empty else 'aucune'}")
    return 0 if not empty else 1


if __name__ == "__main__":
    sys.exit(main())
