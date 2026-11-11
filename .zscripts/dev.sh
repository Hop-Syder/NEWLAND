#!/bin/bash
# @author @hopsyder
# @organization Nexus Partners
# @description Lancement de l'environnement de développement local
# @created 2026-11-11
# @site nexus-partners.xyz

set -euo pipefail

# Récupération du dossier du script et du répertoire racine du projet
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log_step_start() {
	local step_name="$1"
	echo "=========================================="
	echo "[$(date '+%Y-%m-%d %H:%M:%S')] Démarrage : $step_name"
	echo "=========================================="
	export STEP_START_TIME
	STEP_START_TIME=$(date +%s)
}

log_step_end() {
	local step_name="${1:-Étape inconnue}"
	local end_time
	end_time=$(date +%s)
	local duration=$((end_time - STEP_START_TIME))
	echo "=========================================="
	echo "[$(date '+%Y-%m-%d %H:%M:%S')] Terminé : $step_name"
	echo "[LOG] Étape : $step_name | Durée : ${duration}s"
	echo "=========================================="
	echo ""
}

start_mini_services() {
	local mini_services_dir="$PROJECT_DIR/mini-services"
	local started_count=0

	log_step_start "Démarrage des mini-services"
	if [ ! -d "$mini_services_dir" ]; then
		echo "Aucun dossier mini-services trouvé, étape ignorée..."
		log_step_end "Démarrage des mini-services"
		return 0
	fi

	echo "Dossier mini-services détecté, analyse des sous-services..."

	for service_dir in "$mini_services_dir"/*; do
		if [ ! -d "$service_dir" ]; then
			continue
		fi

		local service_name
		service_name=$(basename "$service_dir")
		echo "Vérification du service : $service_name"

		if [ ! -f "$service_dir/package.json" ]; then
			echo "[$service_name] Aucun package.json trouvé, ignoré..."
			continue
		fi

		if ! grep -q '"dev"' "$service_dir/package.json"; then
			echo "[$service_name] Aucun script dev trouvé, ignoré..."
			continue
		fi

		echo "Lancement de $service_name en arrière-plan..."
		(
			cd "$service_dir"
			echo "[$service_name] Installation des dépendances..."
			bun install
			echo "[$service_name] Exécution de bun run dev..."
			exec bun run dev
		) >"$PROJECT_DIR/.zscripts/mini-service-${service_name}.log" 2>&1 &

		local service_pid=$!
		echo "[$service_name] Démarré en arrière-plan (PID: $service_pid)"
		echo "[$service_name] Fichier journal : $PROJECT_DIR/.zscripts/mini-service-${service_name}.log"
		disown "$service_pid" 2>/dev/null || true
		started_count=$((started_count + 1))
	done

	echo "Démarrage des mini-services terminé ($started_count service(s) actif(s))."
	log_step_end "Démarrage des mini-services"
}

wait_for_service() {
	local host="$1"
	local port="$2"
	local service_name="$3"
	local max_attempts="${4:-60}"
	local attempt=1

	echo "Attente de disponibilité de $service_name sur $host:$port..."

	while [ "$attempt" -le "$max_attempts" ]; do
		if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
			echo "$service_name est prêt !"
			return 0
		fi

		echo "Tentative $attempt/$max_attempts : $service_name pas encore prêt, attente..."
		sleep 1
		attempt=$((attempt + 1))
	done

	echo "ERREUR : $service_name n'a pas répondu dans le délai de $max_attempts secondes"
	return 1
}

cleanup() {
	if [ -n "${DEV_PID:-}" ] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
		echo "Arrêt du serveur de développement Next.js (PID: $DEV_PID)..."
		kill "$DEV_PID" >/dev/null 2>&1 || true
	fi
}

trap cleanup EXIT INT TERM

cd "$PROJECT_DIR"

if ! command -v bun >/dev/null 2>&1; then
	echo "ERREUR : bun n'est pas installé ou n'est pas dans le PATH"
	exit 1
fi

log_step_start "bun install"
echo "[BUN] Installation des dépendances..."
bun install
log_step_end "bun install"

log_step_start "bun run db:push"
echo "[BUN] Synchronisation de la base de données..."
bun run db:push
log_step_end "bun run db:push"

log_step_start "Démarrage du serveur Next.js"
echo "[BUN] Lancement du serveur de dev..."
bun run dev &
DEV_PID=$!
log_step_end "Démarrage du serveur Next.js"

log_step_start "Attente du serveur Next.js"
wait_for_service "localhost" "3000" "Serveur Next.js"
log_step_end "Attente du serveur Next.js"

log_step_start "Vérification de santé (Health check)"
echo "[BUN] Exécution du health check..."
curl -fsS localhost:3000 >/dev/null
echo "[BUN] Health check réussi"
log_step_end "Vérification de santé (Health check)"

start_mini_services

echo "Le serveur Next.js tourne en arrière-plan (PID: $DEV_PID)."
echo "Utilisez 'kill $DEV_PID' pour l'arrêter."
disown "$DEV_PID" 2>/dev/null || true
unset DEV_PID
