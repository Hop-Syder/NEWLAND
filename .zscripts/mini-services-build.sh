#!/bin/bash
# @author @hopsyder
# @organization Nexus Partners
# @description Script de build groupé pour les mini-services
# @created 2026-11-11
# @site nexus-partners.xyz

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$PROJECT_DIR/mini-services"
DIST_DIR="${DIST_DIR:-$PROJECT_DIR/mini-services-dist}"

main() {
    echo "🚀 Démarrage du build groupé des mini-services..."
    
    # Vérification de l'existence du dossier mini-services
    if [ ! -d "$ROOT_DIR" ]; then
        echo "ℹ️  Le dossier $ROOT_DIR n'existe pas, build ignoré."
        return
    fi
    
    # Création du dossier de sortie
    mkdir -p "$DIST_DIR"
    
    # Compteurs
    success_count=0
    fail_count=0
    
    # Parcours des sous-dossiers dans mini-services
    for dir in "$ROOT_DIR"/*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            project_name=$(basename "$dir")
            
            # Recherche du fichier d'entrée par ordre de priorité
            entry_path=""
            for entry in "src/index.ts" "index.ts" "src/index.js" "index.js"; do
                if [ -f "$dir/$entry" ]; then
                    entry_path="$dir/$entry"
                    break
                fi
            done
            
            if [ -z "$entry_path" ]; then
                echo "⚠️  Ignoré $project_name : aucun point d'entrée trouvé (index.ts/js)"
                continue
            fi
            
            echo ""
            echo "📦 Build en cours : $project_name..."
            
            output_file="$DIST_DIR/mini-service-$project_name.js"
            
            if bun build "$entry_path" \
                --outfile "$output_file" \
                --target bun \
                --minify; then
                echo "✅ $project_name compilé avec succès -> $output_file"
                success_count=$((success_count + 1))
            else
                echo "❌ Échec de compilation pour $project_name"
                fail_count=$((fail_count + 1))
            fi
        fi
    done
    
    if [ -f "$SCRIPT_DIR/mini-services-start.sh" ]; then
        cp "$SCRIPT_DIR/mini-services-start.sh" "$DIST_DIR/mini-services-start.sh"
        chmod +x "$DIST_DIR/mini-services-start.sh"
    fi
    
    echo ""
    echo "🎉 Tous les builds sont terminés !"
    if [ $success_count -gt 0 ] || [ $fail_count -gt 0 ]; then
        echo "✅ Réussis : $success_count"
        if [ $fail_count -gt 0 ]; then
            echo "❌ Échoués : $fail_count"
        fi
    fi
}

main
