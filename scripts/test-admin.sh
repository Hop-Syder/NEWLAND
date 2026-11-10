#!/bin/bash
# Test navigateur de la page admin + storefront (sandbox : tout en un appel).
set -u
cd /home/z/my-project
rm -rf /tmp/render && mkdir -p /tmp/render

( setsid nohup bun run dev > /tmp/dev-admin.log 2>&1 < /dev/null & )
sleep 10

AB="agent-browser"

echo "=== 1. ADMIN LOGIN (desktop) ==="
$AB set viewport 1440 900 >/dev/null
$AB open http://localhost:3000/admin >/dev/null
sleep 3
$AB snapshot -i -c | head -30
$AB screenshot /tmp/render/a1-login.png >/dev/null

echo "=== 2. Connexion ==="
$AB fill "#admin-pass" "cauris2026" >/dev/null
$AB eval "document.querySelector('form button[type=submit]').click()" >/dev/null
sleep 2
$AB screenshot /tmp/render/a2-dashboard.png >/dev/null

echo "=== 3. Onglet Commandes ==="
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Commandes')).click()" >/dev/null
sleep 1
$AB eval "document.querySelector('ul li button[aria-expanded]')?.click()" >/dev/null
sleep 1
$AB screenshot /tmp/render/a3-orders.png >/dev/null

echo "=== 4. Onglet Comptes clients ==="
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Comptes')).click()" >/dev/null
sleep 1
$AB screenshot /tmp/render/a4-clients.png >/dev/null

echo "=== 5. Onglet Produits ==="
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Produits')).click()" >/dev/null
sleep 1
$AB screenshot /tmp/render/a5-products.png >/dev/null

echo "=== 6. Dialog Nouveau produit ==="
$AB eval "[...document.querySelectorAll('button')].find(b => b.textContent.includes('Nouveau produit')).click()" >/dev/null
sleep 1.5
$AB screenshot /tmp/render/a6-dialog.png >/dev/null

echo "=== 7. Ajout d'un produit test ==="
$AB fill "#pf-name" "Test Friteuse Admin" >/dev/null
$AB fill "#pf-price" "27500" >/dev/null
$AB fill "#pf-short" "Friteuse électrique 3 L ajoutée depuis l'admin." >/dev/null
$AB eval "[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Ajouter le produit').click()" >/dev/null
sleep 1.5
$AB screenshot /tmp/render/a7-added.png >/dev/null

echo "=== 8. Produit visible côté boutique ? ==="
$AB open http://localhost:3000/ >/dev/null
sleep 2.5
$AB eval "document.body.innerText.includes('Friteuse Admin') ? 'TROUVÉ_ACCUEIL' : 'pas_accueil'" 2>/dev/null
$AB eval "[...document.querySelectorAll('button')].find(b => b.textContent.includes('Catalogue'))?.click()" >/dev/null
sleep 2
$AB eval "document.body.innerText.includes('Friteuse Admin') ? 'TROUVÉ_CATALOGUE' : 'ABSENT_CATALOGUE'" 2>/dev/null
$AB screenshot /tmp/render/a8-catalog.png >/dev/null

echo "=== 9. Réglages + bandeau ==="
$AB open http://localhost:3000/admin >/dev/null
sleep 2
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Réglages')).click()" >/dev/null
sleep 1
$AB fill "#banner-text" "Livraison OFFERTE à Cotonou cette semaine !" >/dev/null
$AB eval "[...document.querySelectorAll('button')].find(b => b.textContent.includes('Enregistrer')).click()" >/dev/null
sleep 1
$AB screenshot /tmp/render/a9-settings.png >/dev/null

echo "=== 10. Bandeau visible sur le site ? ==="
$AB open http://localhost:3000/ >/dev/null
sleep 2.5
$AB eval "document.body.innerText.includes('Livraison OFFERTE') ? 'BANDEAU_OK' : 'BANDEAU_KO'" 2>/dev/null
$AB screenshot /tmp/render/a10-home.png >/dev/null

echo "=== 11. MOBILE admin ==="
$AB set viewport 390 844 >/dev/null
$AB open http://localhost:3000/admin >/dev/null
sleep 2.5
$AB screenshot /tmp/render/a11-mobile-admin.png >/dev/null

echo "=== 12. Erreurs console ==="
$AB errors | head -15

$AB close >/dev/null
pkill -f "next dev" 2>/dev/null
echo "=== FIN ==="
