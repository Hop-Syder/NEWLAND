#!/bin/sh
# @author @hopsyder
# @organization Nexus Partners
# @description Lancement de production pour les services Next.js, mini-services et reverse-proxy Caddy
# @created 2026-11-11
# @site nexus-partners.xyz

set -e

# Dossier du script et répertoire de build
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR"

# PIDs des processus enfants
pids=""

# Nettoyage et arrêt propre des services
cleanup() {
    echo ""
    echo "🛑 Arrêt en cours de tous les services..."
    
    # Envoi de SIGTERM
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            service_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "inconnu")
            echo "   Arrêt du processus $pid ($service_name)..."
            kill -TERM "$pid" 2>/dev/null
        fi
    done
    
    # Attente de terminaison
    sleep 1
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            timeout=4
            while [ $timeout -gt 0 ] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                timeout=$((timeout - 1))
            done
            if kill -0 "$pid" 2>/dev/null; then
                echo "   Arrêt forcé du processus $pid..."
                kill -KILL "$pid" 2>/dev/null
            fi
        fi
    done
    
    echo "✅ Tous les services ont été arrêtés"
    exit 0
}

echo "🚀 Démarrage de tous les services..."
echo ""

cd "$BUILD_DIR" || exit 1

ls -lah

DEFAULT_PACKAGED_DB_PATH="/app/db/custom.db"
DEFAULT_PACKAGED_DATABASE_URL="file:$DEFAULT_PACKAGED_DB_PATH"

# Configuration de l'environnement Python si présent
if [ -d "/app/python-runtime/site-packages" ]; then
    export PYTHONPATH="/app/python-runtime/site-packages:/app/next-service-dist${PYTHONPATH:+:$PYTHONPATH}"
    export PATH="/app/python-runtime/site-packages/bin:$PATH"
    export PYTHONDONTWRITEBYTECODE=1
    export PYTHONUNBUFFERED=1
    echo "🐍 Runtime Python actif : $(python --version 2>&1)"
fi

# Démarrage du serveur Next.js en production
if [ -f "./next-service-dist/server.js" ]; then
    echo "🚀 Démarrage du serveur Next.js..."
    cd next-service-dist/ || exit 1
    
    export NODE_ENV=production
    export PORT="${PORT:-3000}"
    export HOSTNAME="${HOSTNAME:-0.0.0.0}"
    export DATABASE_URL="${DATABASE_URL:-$DEFAULT_PACKAGED_DATABASE_URL}"

    if [ "$DATABASE_URL" = "$DEFAULT_PACKAGED_DATABASE_URL" ]; then
        if [ ! -f "$DEFAULT_PACKAGED_DB_PATH" ]; then
            echo "❌ Fichier de base de données packagé introuvable : $DEFAULT_PACKAGED_DB_PATH"
            echo "   Arrêt pour éviter un démarrage sur une base de données vide."
            exit 1
        fi

        echo "🗄️  Base de données packagée utilisée : $DEFAULT_PACKAGED_DB_PATH"
    else
        echo "🗄️  Base de données externe spécifiée : $DATABASE_URL"
    fi
    
    bun server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"
    
    sleep 1
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ Échec de démarrage du serveur Next.js"
        exit 1
    else
        echo "✅ Serveur Next.js démarré avec succès (PID: $NEXT_PID, Port: $PORT)"
    fi
    
    cd ../
else
    echo "⚠️  Fichier serveur Next.js introuvable : ./next-service-dist/server.js"
fi

# Démarrage des mini-services
if [ -f "./mini-services-start.sh" ]; then
    echo "🚀 Démarrage des mini-services..."
    
    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"
    
    sleep 1
    if ! kill -0 "$MINI_PID" 2>/dev/null; then
        echo "⚠️  Avertissement : les mini-services peuvent avoir rencontré une erreur au démarrage..."
    else
        echo "✅ Mini-services démarrés (PID: $MINI_PID)"
    fi
elif [ -d "./mini-services-dist" ]; then
    echo "⚠️  Dossier mini-services-dist présent mais sans script de démarrage"
else
    echo "ℹ️  Aucun mini-service à exécuter, étape ignorée."
fi

# Lancement de Caddy (reverse-proxy)
echo "🚀 Lancement de Caddy..."
echo "✅ Caddy démarré (processus de premier plan)"
echo ""
echo "🎉 Tous les services sont opérationnels !"
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter l'ensemble des services."
echo ""

exec caddy run --config Caddyfile --adapter caddyfile
