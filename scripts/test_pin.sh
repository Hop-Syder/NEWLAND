#!/bin/bash
# Test de bout en bout : achat → carte PIN → paramètres sécurité → déconnexion → connexion
set -u
cd /home/z/my-project

pkill -f "next dev" 2>/dev/null || true
sleep 1

(setsid nohup bun run dev > /tmp/dev.log 2>&1 < /dev/null &)
for i in $(seq 1 40); do
  if curl -s -o /dev/null http://localhost:3000; then break; fi
  sleep 1
done
echo "== SERVER READY =="

mkdir -p /tmp/render

fill() {
  agent-browser eval "(() => { const el = document.querySelector('$1'); if (!el) return 'NOT_FOUND $1'; const p = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; p.call(el, '$2'); el.dispatchEvent(new Event('input', { bubbles: true })); return 'FILLED $1'; })()"
}

clickq() {
  agent-browser eval "(() => { const el = document.querySelector('$1'); if (!el) return 'NOT_FOUND $1'; el.click(); return 'CLICKED $1'; })()"
}

clickt() {
  agent-browser eval "(() => { const t = [...document.querySelectorAll('button, a, [role=button]')].filter(x => (x.textContent || '').match(/$1/)); if (!t.length) return 'NOT_FOUND text $1'; t[${2:-0}].click(); return 'CLICKED ' + (t[${2:-0}].textContent || '').trim().slice(0, 40); })()"
}

chk() {
  agent-browser eval "(() => { const t = document.body.innerText; return t.match(/$1/) ? 'FOUND $1' : 'MISSING $1'; })()"
}

echo "=== A. Achat complet ==="
agent-browser set viewport 1280 900
agent-browser open http://localhost:3000
sleep 2
clickq '[aria-label^="Ajouter"]'
sleep 1
clickt 'Panier'
sleep 1
clickt 'Commander'
sleep 1
clickt 'Passer la commande'
sleep 1
fill '#co-name' 'Kossi Amoussou'
fill '#co-phone' '+229 01 97 11 22 33'
fill '#co-email' 'kossi.amoussou@example.bj'
fill '#co-address' 'Rue 12.084, maison bleue'
fill '#co-momo' '0197112233'
clickt 'Confirmer la commande'
sleep 3
chk 'Merci Kossi'
chk 'Sécurisez votre compte'
agent-browser screenshot /tmp/render/01-success-pin-card.png
fill '#sec-pin' '5823'
fill '#sec-confirm' '5823'
fill '#sec-email' 'kossi.amoussou@example.bj'
clickt 'Sécuriser mon compte'
sleep 1.5
chk 'identifiants envoyés'
agent-browser screenshot /tmp/render/02-identifiants.png
agent-browser eval "(() => { const s = JSON.parse(localStorage.getItem('maison-cauris-shop') || '{}').state || {}; return JSON.stringify({ pin: s.pin, session: s.sessionActive, sent: s.credentialsSentTo, points: s.loyaltyPoints, orders: (s.orders || []).length }); })()"

echo "=== B. Paramètres → Sécurité → Déconnexion ==="
clickt 'Suivre ma commande'
sleep 1.5
chk 'Garantie'
clickt 'Paramètres'
sleep 1
chk 'Identifiant de connexion'
chk 'Se déconnecter'
agent-browser screenshot /tmp/render/03-securite-parametres.png
clickt 'Se déconnecter'
sleep 1
chk 'Espace client sécurisé'
agent-browser screenshot /tmp/render/04-porte-verrouillee.png

echo "=== C. Connexion : mauvais PIN puis bon PIN ==="
fill '#lg-phone' '+229 01 97 11 22 33'
fill '#lg-pin' '0000'
clickt 'Déverrouiller mon espace'
sleep 1
chk 'Code PIN incorrect'
fill '#lg-pin' '5823'
clickt 'Déverrouiller mon espace'
sleep 1.5
chk 'Mes coordonnées'
agent-browser screenshot /tmp/render/05-deverrouille.png

echo "=== D. Mobile : dock → compte ==="
agent-browser set viewport 390 844
agent-browser open http://localhost:3000
sleep 1.5
clickt 'Compte'
sleep 1
chk 'Mes coordonnées'
agent-browser screenshot /tmp/render/06-mobile-compte.png

echo "=== Erreurs console ==="
agent-browser errors
agent-browser close
pkill -f "next dev" 2>/dev/null || true
echo "== TEST DONE =="
