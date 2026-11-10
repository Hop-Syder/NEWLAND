#!/bin/bash
# Re-test ciblé : graphique CA, solde client, bandeau activé.
set -u
cd /home/z/my-project
rm -rf /tmp/render && mkdir -p /tmp/render

( setsid nohup bun run dev > /tmp/dev-admin2.log 2>&1 < /dev/null & )
sleep 10

AB="agent-browser"
$AB set viewport 1440 900 >/dev/null
$AB open http://localhost:3000/admin >/dev/null
sleep 3
$AB fill "#admin-pass" "cauris2026" >/dev/null
$AB eval "document.querySelector('form button[type=submit]').click()" >/dev/null
sleep 2

echo "=== Graphique CA (barres) ==="
$AB eval "(() => { const bars = document.querySelectorAll('[aria-label=\"Chiffre d\\'affaires des 7 derniers jours\"] .rounded-sm'); return [...bars].map(b => Math.round(b.getBoundingClientRect().height)).join(','); })()" 2>/dev/null
$AB screenshot /tmp/render/b1-dashboard.png >/dev/null

echo "=== Client Adjoa (solde points) ==="
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Comptes')).click()" >/dev/null
sleep 1
$AB eval "(() => { const card = [...document.querySelectorAll('div')].find(d => d.className.includes && d.className.includes('rounded-md border border-[#2a2a2a] bg-[#161616] p-4') && d.innerText.startsWith('A\\nAdjoa')); return card ? card.innerText.split('\\n').filter(l => l.includes('pts')).join(' | ') : 'NON_TROUVÉ'; })()" 2>/dev/null

echo "=== Bandeau : activer + enregistrer + vérifier site ==="
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Réglages')).click()" >/dev/null
sleep 1
$AB fill "#banner-text" "Livraison OFFERTE à Cotonou cette semaine !" >/dev/null
$AB eval "document.querySelector('#banner-enabled').click()" >/dev/null
sleep 0.5
$AB eval "[...document.querySelectorAll('button')].find(b => b.textContent.includes('Enregistrer')).click()" >/dev/null
sleep 1
$AB open http://localhost:3000/ >/dev/null
sleep 2.5
$AB eval "document.body.innerText.includes('Livraison OFFERTE') ? 'BANDEAU_OK' : 'BANDEAU_KO'" 2>/dev/null
$AB screenshot /tmp/render/b2-home-banner.png >/dev/null

echo "=== Désactiver le bandeau ==="
$AB open http://localhost:3000/admin >/dev/null
sleep 2
$AB eval "[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Réglages')).click()" >/dev/null
sleep 1
$AB eval "document.querySelector('#banner-enabled').click()" >/dev/null
sleep 0.5
$AB eval "[...document.querySelectorAll('button')].find(b => b.textContent.includes('Enregistrer')).click()" >/dev/null

echo "=== Erreurs console ==="
$AB errors | head -10
$AB close >/dev/null
pkill -f "next dev" 2>/dev/null
echo "=== FIN ==="
