#!/bin/sh
# @author @hopsyder
# @organization Nexus Partners
# @description Lancement et orchestration des mini-services
# @created 2026-11-11
# @site nexus-partners.xyz

# Configuration
DIST_DIR="./mini-services-dist"

# PIDs des processus enfants
pids=""

# Nettoyage et arrêt propre des services
cleanup() {
    echo ""
    echo "🛑 Arrêt en cours de tous les services..."
    
    # Envoi du signal SIGTERM à tous les processus fils
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
            # Fermeture forcée si nécessaire
            if kill -0 "$pid" 2>/dev/null; then
                echo "   Arrêt forcé du processus $pid..."
                kill -KILL "$pid" 2>/dev/null
            fi
        fi
    done
    
    echo "✅ Tous les services ont été arrêtés"
}

main() {
    echo "🚀 Démarrage de tous les mini-services..."
    
    # Vérification du dossier de distribution
    if [ ! -d "$DIST_DIR" ]; then
        echo "ℹ️  Le dossier $DIST_DIR est introuvable."
        return
    fi
    
    # Liste des bundles mini-service-*.js
    service_files=""
    for file in "$DIST_DIR"/mini-service-*.js; do
        if [ -f "$file" ]; then
            if [ -z "$service_files" ]; then
                service_files="$file"
            else
                service_files="$service_files $file"
            fi
        fi
    done
    
    service_count=0
    for file in $service_files; do
        service_count=$((service_count + 1))
    done
    
    if [ $service_count -eq 0 ]; then
        echo "ℹ️  Aucun bundle de mini-service détecté."
        return
    fi
    
    echo "📦 $service_count service(s) trouvé(s), démarrage..."
    echo ""
    
    # Lancement de chaque service
    for file in $service_files; do
        service_name=$(basename "$file" .js | sed 's/mini-service-//')
        echo "▶️  Démarrage du service : $service_name..."
        
        bun "$file" &
        pid=$!
        if [ -z "$pids" ]; then
            pids="$pid"
        else
            pids="$pids $pid"
        fi
        
        sleep 0.5
        if ! kill -0 "$pid" 2>/dev/null; then
            echo "❌ Échec de démarrage pour $service_name"
            pids=$(echo "$pids" | sed "s/\b$pid\b//" | sed 's/  */ /g' | sed 's/^ *//' | sed 's/ *$//')
        else
            echo "✅ $service_name démarré (PID: $pid)"
        fi
    done
    
    running_count=0
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            running_count=$((running_count + 1))
        fi
    done
    
    echo ""
    echo "🎉 Démarrage terminé : $running_count service(s) en cours d'exécution."
    echo ""
    echo "💡 Appuyez sur Ctrl+C pour arrêter l'ensemble des services."
    echo ""
    
    wait
}

main
