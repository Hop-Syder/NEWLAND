#!/bin/bash
# @author @hopsyder
# @organization Nexus Partners
# @description Installation des dépendances des mini-services
# @created 2026-11-11
# @site nexus-partners.xyz

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/mini-services"

main() {
    echo "🚀 Démarrage de l'installation groupée des dépendances..."
    
    # Vérification de l'existence du dossier mini-services
    if [ ! -d "$ROOT_DIR" ]; then
        echo "ℹ️  Le dossier $ROOT_DIR n'existe pas, étape ignorée."
        return
    fi
    
    # Compteurs et suivi
    success_count=0
    fail_count=0
    failed_projects=""
    
    # Parcours des sous-dossiers dans mini-services
    for dir in "$ROOT_DIR"/*; do
        # Vérification dossier et présence de package.json
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            project_name=$(basename "$dir")
            echo ""
            echo "📦 Installation des dépendances pour : $project_name..."
            
            # Installation via Bun
            if (cd "$dir" && bun install); then
                echo "✅ $project_name : dépendances installées avec succès"
                success_count=$((success_count + 1))
            else
                echo "❌ $project_name : échec de l'installation des dépendances"
                fail_count=$((fail_count + 1))
                if [ -z "$failed_projects" ]; then
                    failed_projects="$project_name"
                else
                    failed_projects="$failed_projects $project_name"
                fi
            fi
        fi
    done
    
    # Résumé
    echo ""
    echo "=================================================="
    if [ $success_count -gt 0 ] || [ $fail_count -gt 0 ]; then
        echo "🎉 Installation terminée !"
        echo "✅ Réussis : $success_count"
        if [ $fail_count -gt 0 ]; then
            echo "❌ Échoués : $fail_count"
            echo ""
            echo "Projets en échec :"
            for project in $failed_projects; do
                echo "  - $project"
            done
        fi
    else
        echo "ℹ️  Aucun projet contenant un package.json trouvé."
    fi
    echo "=================================================="
}

main
