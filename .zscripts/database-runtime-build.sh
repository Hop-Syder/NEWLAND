#!/bin/bash
# @author @hopsyder
# @organization Nexus Partners
# @description Préparation et synchronisation de la base de données de production
# @created 2026-11-11
# @site nexus-partners.xyz

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
BUILD_DIR="${BUILD_DIR:?BUILD_DIR est requis}"
SOURCE_DB_DIR="$PROJECT_DIR/db"
SOURCE_DB_PATH="$SOURCE_DB_DIR/custom.db"
TARGET_DB_DIR="$BUILD_DIR/db"
TARGET_DB_PATH="$TARGET_DB_DIR/custom.db"

mkdir -p "$TARGET_DB_DIR"

if [ -f "$SOURCE_DB_PATH" ]; then
    echo "🗄️  Copie de la base de données Preview vers les artefacts de build..."
    cp -a "$SOURCE_DB_DIR/." "$TARGET_DB_DIR/"
else
    echo "ℹ️  Aucune base Preview trouvée dans db/custom.db, initialisation d'une base vierge..."
fi

echo "🗄️  Synchronisation de la structure de base de données (Prisma db:push)..."
(
    cd "$PROJECT_DIR"
    DATABASE_URL="file:$TARGET_DB_PATH" bun run db:push
)

if [ ! -f "$TARGET_DB_PATH" ]; then
    echo "❌ Erreur : la base n'a pas pu être générée à l'emplacement $TARGET_DB_PATH"
    exit 1
fi

echo "✅ Base de données prête pour la production"
ls -lah "$TARGET_DB_DIR"
