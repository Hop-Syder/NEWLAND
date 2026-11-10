#!/usr/bin/env bash
# Reconstruction propre + vérification navigateur complète (boutique + back office)
# Pattern sandbox : serveur + tests dans UN SEUL appel Bash.
set -u
cd /home/z/my-project

echo "=== 1. RECONSTRUCTION PROPRE ==="
rm -rf .next
bun run build > /tmp/rebuild.log 2>&1
if [ $? -ne 0 ]; then
  echo "BUILD FAILED"; tail -40 /tmp/rebuild.log; exit 1
fi
tail -8 /tmp/rebuild.log
echo "BUILD_OK"

echo "=== 2. DEMARRAGE SERVEUR ==="
rm -rf /tmp/render && mkdir -p /tmp/render
( setsid nohup bun run dev > /tmp/dev-rebuild.log 2>&1 < /dev/null & )
sleep 10

AB="agent-browser"
$AB set viewport 1440 900 >/dev/null

echo "=== 3. BOUTIQUE / ==="
$AB open http://localhost:3000/ >/dev/null
sleep 3
$AB eval "document.body.innerText.includes('Maison') || document.body.innerText.includes('Cauris') ? 'HOME_OK' : 'HOME_KO'" 2>/dev/null
$AB screenshot /tmp/render/01-home.png >/dev/null

echo "=== 4. CATALOGUE ==="
$AB eval "[...document.querySelectorAll('button, a')].find(b => b.textContent.trim().match(/Catalogue|Boutique/))?.click()" >/dev/null
sleep 2
$AB eval "document.querySelectorAll('[class*=group]').length > 3 ? 'CATALOG_OK' : 'CATALOG_CHECK'" 2>/dev/null
$AB screenshot /tmp/render/02-catalog.png >/dev/null

echo "=== 5. ADMIN LOGIN ==="
$AB open http://localhost:3000/admin >/dev/null
sleep 3
$AB fill "#admin-pass" "cauris2026" >/dev/null
$AB eval "document.querySelector('form button[type=submit]').click()" >/dev/null
sleep 2
$AB eval "document.body.innerText.includes('Tableau de bord') ? 'ADMIN_OK' : 'ADMIN_KO'" 2>/dev/null
$AB screenshot /tmp/render/03-admin-dashboard.png >/dev/null

echo "=== 6. ADMIN PRODUITS ==="
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Produits')).click()" >/dev/null
sleep 1.5
$AB eval "document.body.innerText.includes('Ajouter') || document.body.innerText.includes('produit') ? 'PRODUITS_OK' : 'PRODUITS_KO'" 2>/dev/null
$AB screenshot /tmp/render/04-admin-produits.png >/dev/null

echo "=== 7. ADMIN CLIENTS ==="
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Comptes') || b.textContent.includes('Clients')).click()" >/dev/null
sleep 1.5
$AB screenshot /tmp/render/05-admin-clients.png >/dev/null
$AB eval "document.body.innerText.match(/client|Client|pts/) ? 'CLIENTS_OK' : 'CLIENTS_VIDE(0_compte_en_demo_normale)'" 2>/dev/null

echo "=== 8. ADMIN COMMANDES ==="
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Commandes')).click()" >/dev/null
sleep 1.5
$AB screenshot /tmp/render/06-admin-commandes.png >/dev/null

echo "=== 9. ERREURS CONSOLE ==="
$AB errors 2>&1 | head -10
$AB close >/dev/null
pkill -f "next dev" 2>/dev/null
echo "=== FIN_VERIFICATION ==="
