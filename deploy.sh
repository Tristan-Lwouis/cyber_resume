#!/bin/bash
set -euo pipefail

trap 'echo "❌ Erreur pendant le déploiement. Le script s’est arrêté."; exit 1' ERR

# Tout le script est dans une fonction : bash la lit entièrement avant de l'exécuter.
# Indispensable car "git reset --hard" réécrit ce fichier pendant son exécution.
main() {

echo "⏬ Récupération de la dernière version du repo..."
git fetch origin
git reset --hard origin/master
git clean -fd

# Construction de la nouvelle image AVANT de toucher au conteneur en service :
# si le build échoue, le script s'arrête (set -e) et l'ancienne version reste en ligne.
echo "🔨 Construction de la nouvelle image..."
docker compose build

echo "🐳 Remplacement du conteneur..."
docker compose up -d --remove-orphans

echo "🧹 Nettoyage des anciennes images..."
docker image prune -f
cat << 'EOF'
_________        ___.                 __________                                    
\_   ___ \___.__.\_ |__   ___________ \______   \ ____   ________ __  _____   ____  
/    \  \<   |  | | __ \_/ __ \_  __ \ |       _// __ \ /  ___/  |  \/     \_/ __ \ 
\     \___\___  | | \_\ \  ___/|  | \/ |    |   \  ___/ \___ \|  |  /  Y Y  \  ___/ 
 \______  / ____| |___  /\___  >__|____|____|_  /\___  >____  >____/|__|_|  /\___  >
        \/\/          \/     \/  /_____/      \/     \/     \/            \/     \/ 
EOF
echo "Déploiement terminé avec succès"
}

main "$@"
exit $?
