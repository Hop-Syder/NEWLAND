#!/bin/bash
# Recherche d'images réelles pour la boutique (parallèle) - lot 3
cd /home/z/my-project/scripts/img

z-ai image-search -q "wooden office desk modern workspace" -c 3 --gl us --no-rank -o p_bureau.json &
z-ai image-search -q "ergonomic office chair black mesh" -c 3 --gl us --no-rank -o p_fauteuil.json &
z-ai image-search -q "comfortable office chair swivel" -c 3 --gl us --no-rank -o p_chaise.json &
z-ai image-search -q "modern sofa living room wooden frame" -c 3 --gl us --no-rank -o p_canape.json &
z-ai image-search -q "built in gas hob stove countertop black" -c 3 --gl us --no-rank -o p_plaque.json &
z-ai image-search -q "kitchen range hood stainless steel" -c 3 --gl us --no-rank -o p_hotte.json &
z-ai image-search -q "electric kettle stainless steel on counter" -c 3 --gl us --no-rank -o p_bouilloire.json &
z-ai image-search -q "stand mixer kitchen food processor" -c 3 --gl us --no-rank -o p_robot.json &
wait
echo "BATCH3_DONE"
