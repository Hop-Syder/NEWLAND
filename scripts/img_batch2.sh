#!/bin/bash
# Recherche d'images réelles pour la boutique (parallèle) - lot 2
cd /home/z/my-project/scripts/img

z-ai image-search -q "small kitchen blender grinder 350 watt" -c 3 --gl us --no-rank -o p_blender2.json &
z-ai image-search -q "misting fan water spray outdoor fan" -c 3 --gl us --no-rank -o p_ventilateur_brum.json &
z-ai image-search -q "small clip on desk fan white" -c 3 --gl us --no-rank -o p_ventilateur_pince.json &
z-ai image-search -q "nonstick cookware set pots pans set many pieces" -c 3 --gl us --no-rank -o p_batterie23.json &
z-ai image-search -q "black nonstick pot set 13 pieces cookware" -c 3 --gl us --no-rank -o p_batterie13.json &
z-ai image-search -q "stainless steel casserole pot set kitchen" -c 3 --gl us --no-rank -o p_casseroles.json &
z-ai image-search -q "kitchen utensils set peeler scissors knife sharpener" -c 3 --gl us --no-rank -o p_kitcuisine.json &
z-ai image-search -q "plastic basin bowl set colorful household" -c 3 --gl us --no-rank -o p_seaux.json &
wait
echo "BATCH2_DONE"
