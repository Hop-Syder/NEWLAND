#!/bin/bash
# Recherche d'images séquentielle avec reprise (évite les 429)
cd /home/z/my-project/scripts/img

search() {
  local name="$1"; local query="$2"
  if [ -f "$name.json" ] && grep -q '"success": true' "$name.json" 2>/dev/null; then
    echo "SKIP $name (déjà fait)"
    return 0
  fi
  for attempt in 1 2 3 4; do
    echo ">>> $name (essai $attempt)"
    z-ai image-search -q "$query" -c 3 --gl us --no-rank -o "$name.json" > "$name.log" 2>&1
    if [ -f "$name.json" ] && grep -q '"success": true' "$name.json"; then
      echo "OK $name"
      sleep 3
      return 0
    fi
    echo "FAIL $name, attente avant reprise..."
    sleep 20
  done
  echo "GIVEUP $name"
  return 1
}

search hero "bright modern kitchen interior warm light wooden counter plants"
search cat_appareils "modern kitchen appliances collection in showroom"
search cat_cuisine "colorful cookware pots and pans on stove kitchen"
search cat_maison "cozy modern living room with sofa and warm decoration"
search p_microondes "white microwave oven on kitchen countertop"
search p_frigo "silver two door refrigerator in bright kitchen"
search p_lavelinge "front load washing machine white modern"
search p_blender "large food blender with glass jar on kitchen counter"
search p_blender2 "small electric grinder blender kitchen appliance"
search p_ventbrum "misting fan water spray standing fan"
search p_ventpince "small clip on desk fan white"
search p_batterie23 "nonstick cookware set pots pans set many pieces"
search p_batterie13 "black nonstick pot set cookware granite"
search p_casseroles "stainless steel casserole pot set kitchen"
search p_kitcuisine "kitchen utensils set peeler scissors knife sharpener"
search p_seaux "plastic basin bowl set colorful household"
search p_bureau "wooden office desk modern workspace"
search p_fauteuil "ergonomic office chair black mesh"
search p_chaise "comfortable swivel office chair padded"
search p_canape "modern sofa living room wooden frame"
search p_plaque "built in gas hob stove countertop black"
search p_hotte "kitchen range hood stainless steel"

echo "ALL_SEARCHES_DONE"
