#!/bin/bash

# Script pour supprimer toutes les données et relancer avec les données de test
# Usage: ./scripts/reset-and-seed.sh [--docker]
# Options:
#   --docker    Reset aussi les containers Docker, images et volumes

set -e

# Check if Docker reset is requested
if [ "$1" == "--docker" ]; then
    echo "🐳 Mode Docker activé - Reset complet Docker + DB"
    echo ""
    
    echo "🛑 Arrêt des containers Docker..."
    docker-compose down -v 2>/dev/null || true
    
    echo "🗑️  Suppression des containers..."
    docker rm -f assurance-postgres assurance-api assurance-frontend 2>/dev/null || true
    
    echo "🗑️  Suppression des images..."
    docker rmi -f $(docker images -q "assurance-app*" 2>/dev/null) 2>/dev/null || true
    docker rmi -f $(docker images -q "*assurance*" 2>/dev/null) 2>/dev/null || true
    
    echo "🗑️  Suppression des volumes Docker..."
    docker volume rm assurance-app_dbdata 2>/dev/null || true
    docker volume rm $(docker volume ls -q --filter name=assurance) 2>/dev/null || true
    
    echo "🧹 Nettoyage Docker (images/containers orphelins)..."
    docker system prune -f 2>/dev/null || true
    
    echo ""
    echo "🔄 Reconstruction et démarrage des containers..."
    docker-compose up -d --build
    
    echo ""
    echo "⏳ Attente du démarrage de la base de données (10s)..."
    sleep 10
    
    echo ""
    echo "🌱 Exécution du seed dans le container API..."
    docker exec assurance-api npx prisma migrate deploy
    docker exec assurance-api npm run seed:prod
    
else
    echo "🗑️  Suppression de la base de données et recréation (mode local)..."
    
    # Reset the database (drop all tables and recreate)
    npx prisma migrate reset --force
fi

echo ""
echo "✅ Environnement réinitialisé avec succès!"
echo ""
echo "📝 Comptes disponibles pour tester:"
echo ""
echo "🔐 GM (super admin):"
echo "   Email: gm@example.com"
echo "   Password: gm123456"
echo ""
echo "🔐 Region Managers:"
echo "   - manager.beirut@example.com / manager123_1 (Beyrouth)"
echo "   - manager.north@example.com / manager123_2 (Nord)"
echo "   - manager.south@example.com / manager123_3 (Sud)"
echo ""
echo "🔐 Délégués (2 par région):"
echo "   - delegate.beyrouth.1@example.com / delegate123_1"
echo "   - delegate.beyrouth.2@example.com / delegate123_2"
echo "   - delegate.nord.1@example.com / delegate123_3"
echo "   - delegate.nord.2@example.com / delegate123_4"
echo "   - delegate.sud.1@example.com / delegate123_5"
echo "   - delegate.sud.2@example.com / delegate123_6"
echo ""
echo "🎯 Test de la correction:"
echo "   1. Connectez-vous avec manager.south@example.com / manager123_3"
echo "   2. Vérifiez que vous ne voyez que les délégués et membres de la région Sud"
echo "   3. Vous ne devriez PAS voir les délégués/membres de Beyrouth ou Nord"
echo ""
if [ "$1" == "--docker" ]; then
    echo "🌐 URLs:"
    echo "   - Frontend: http://localhost:3001"
    echo "   - API: http://localhost:3000"
    echo ""
fi
