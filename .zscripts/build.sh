#!/bin/bash
# @author @hopsyder
# @organization Nexus Partners
# @description Script de build principal pour Next.js, mini-services et packaging de déploiement
# @created 2026-11-11
# @site nexus-partners.xyz

exec 2>&1
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NEXTJS_PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ Erreur : le dossier du projet Next.js est introuvable : $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Démarrage de la compilation de l'application Next.js et des services..."
echo "📁 Répertoire du projet : $NEXTJS_PROJECT_DIR"

cd "$NEXTJS_PROJECT_DIR" || exit 1

export NEXT_TELEMETRY_DISABLED=1

BUILD_ID="${BUILD_ID:-$(date +%s)}"
BUILD_DIR="${BUILD_DIR:-/tmp/build_fullstack_$BUILD_ID}"
echo "📁 Dossier de build : $BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "📦 Installation des dépendances (Bun)..."
bun install

echo "🔨 Compilation du projet Next.js..."
bun run build

# Vérification de l'entrée serveur standalone Next.js
if [ ! -f ".next/standalone/server.js" ]; then
    echo "⚠️  L'entrée .next/standalone/server.js n'a pas été générée, vérification de next.config..."
    NEXT_CONFIG_FILE="$(ls next.config.ts next.config.js next.config.mjs next.config.cjs 2>/dev/null | head -1)"

    if [ -z "$NEXT_CONFIG_FILE" ]; then
        echo "❌ Échec : aucun fichier next.config.* trouvé pour générer les artefacts standalone."
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        echo "❌ Échec : output:\"standalone\" est déjà configuré mais server.js est manquant."
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]" "$NEXT_CONFIG_FILE"; then
        echo "❌ Échec : un output alternatif non-standalone est déjà configuré."
        exit 1
    fi

    echo "🔧 Ajout automatique de output:\"standalone\" dans $NEXT_CONFIG_FILE et recompilation..."
    cp "$NEXT_CONFIG_FILE" "${NEXT_CONFIG_FILE}.bak"
    perl -0pi -e 's/((?:const\s+\w+[^=]*=|export\s+default|module\.exports\s*=)\s*\{)/$1\n  output: "standalone",/' "$NEXT_CONFIG_FILE"

    if ! grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        echo "❌ Impossible d'injecter automatiquement output:\"standalone\"."
        mv "${NEXT_CONFIG_FILE}.bak" "$NEXT_CONFIG_FILE"
        exit 1
    fi

    echo "🔨 Nouvelle compilation après injection de standalone..."
    bun run build

    if [ ! -f ".next/standalone/server.js" ]; then
        echo "❌ Toujours aucun server.js généré après recompilation."
        exit 1
    fi
    echo "✅ Entrée serveur standalone générée avec succès."
fi

# Compilation des mini-services
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
    echo "🔨 Compilation des mini-services..."
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    echo "  - Copie de mini-services-start.sh vers $BUILD_DIR"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️  Aucun mini-service détecté, étape ignorée."
fi

# Rassemblement des artefacts
echo "📦 Collecte des artefacts de build dans $BUILD_DIR..."

if [ -d ".next/standalone" ]; then
    echo "  - Copie de .next/standalone"
    cp -r .next/standalone "$BUILD_DIR/next-service-dist/"
fi

if [ -d ".next/static" ]; then
    echo "  - Copie de .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

if [ -d "public" ]; then
    echo "  - Copie du dossier public"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# Runtime Python si présent
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/python-runtime-build.sh"

# Base de données de production SQLite / Prisma
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/database-runtime-build.sh"

# Caddyfile (Reverse-proxy)
if [ -f "Caddyfile" ]; then
    echo "  - Copie de Caddyfile"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️  Aucun Caddyfile trouvé, étape ignorée."
fi

# Script de démarrage en production
echo "  - Copie de start.sh vers $BUILD_DIR"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 Archivage des artefacts dans $PACKAGE_FILE..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

echo ""
echo "✅ Compilation terminée avec succès ! Artefacts disponibles dans $PACKAGE_FILE"
echo "📊 Taille de l'archive :"
ls -lh "$PACKAGE_FILE"
