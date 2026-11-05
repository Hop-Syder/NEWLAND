#!/bin/bash
# Recherche d'images réelles pour la boutique (parallèle)
cd /home/z/my-project/scripts/img

z-ai image-search -q "bright modern kitchen interior warm light wooden counter plants" -c 4 --gl us --no-rank -o hero.json &
z-ai image-search -q "modern kitchen appliances collection in showroom" -c 3 --gl us --no-rank -o cat_appareils.json &
z-ai image-search -q "colorful cookware pots and pans on stove kitchen" -c 3 --gl us --no-rank -o cat_cuisine.json &
z-ai image-search -q "cozy modern living room with sofa and warm decoration" -c 3 --gl us --no-rank -o cat_maison.json &
z-ai image-search -q "white microwave oven on kitchen countertop" -c 3 --gl us --no-rank -o p_microondes.json &
z-ai image-search -q "silver two door refrigerator in bright kitchen" -c 3 --gl us --no-rank -o p_frigo.json &
z-ai image-search -q "front load washing machine white modern" -c 3 --gl us --no-rank -o p_laveinge.json &
z-ai image-search -q "large food blender with glass jar on kitchen counter" -c 3 --gl us --no-rank -o p_blender.json &
wait
echo "BATCH1_DONE"
