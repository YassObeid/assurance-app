#!/bin/bash

# Script pour supprimer toutes les données et relancer avec les données de test
# Usage: ./scripts/reset-and-seed.sh

set -e

echo "🗑️  Suppression de la base de données et recréation..."

# Reset the database (drop all tables and recreate)
npx prisma migrate reset --force

echo ""
echo "✅ Base de données réinitialisée avec succès!"
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
