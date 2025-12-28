# 🐳 Guide Docker - Assurance App

## Lancer l'application complète avec Docker

### Prérequis
- Docker installé
- Docker Compose installé

### Architecture Docker

L'application est composée de 3 services :

1. **db** (PostgreSQL) - Base de données sur le port 5432
2. **api** (NestJS) - Backend API sur le port 3000
3. **frontend** (Next.js) - Frontend sur le port 3001

### 🚀 Commandes principales

#### 1. Lancer tous les services

```bash
docker-compose up -d
```

Cette commande va :
- Créer et démarrer la base de données PostgreSQL
- Builder et démarrer le backend NestJS
- Builder et démarrer le frontend Next.js

#### 2. Voir les logs

```bash
# Logs de tous les services
docker-compose logs -f

# Logs du frontend uniquement
docker-compose logs -f frontend

# Logs du backend uniquement
docker-compose logs -f api

# Logs de la base de données
docker-compose logs -f db
```

#### 3. Arrêter les services

```bash
# Arrêter sans supprimer les conteneurs
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs + volumes (supprime la DB)
docker-compose down -v
```

#### 4. Rebuilder les images

Si vous modifiez le code, il faut rebuilder les images :

```bash
# Rebuilder tout
docker-compose up -d --build

# Rebuilder uniquement le frontend
docker-compose up -d --build frontend

# Rebuilder uniquement le backend
docker-compose up -d --build api
```

### 📍 Accès aux services

Une fois les conteneurs lancés :

- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000
- **API Swagger Docs** : http://localhost:3000/docs
- **PostgreSQL** : localhost:5432
  - User: `app`
  - Password: `app`
  - Database: `appdb`

### 🔧 Commandes utiles

#### Exécuter une commande dans un conteneur

```bash
# Accéder au shell du frontend
docker-compose exec frontend sh

# Accéder au shell du backend
docker-compose exec api sh

# Accéder à PostgreSQL
docker-compose exec db psql -U app -d appdb
```

#### Vérifier le statut des conteneurs

```bash
docker-compose ps
```

#### Redémarrer un service spécifique

```bash
docker-compose restart frontend
docker-compose restart api
docker-compose restart db
```

### 🐛 Troubleshooting

#### Le frontend ne se connecte pas au backend

Vérifier que l'URL de l'API est correcte dans le frontend. L'environnement Docker est configuré pour utiliser `http://localhost:3000`.

Si vous êtes sur Windows avec WSL, vous devrez peut-être utiliser l'IP de votre machine au lieu de `localhost`.

#### Erreur "port already allocated"

Un autre service utilise déjà le port. Options :

1. Arrêter le service qui utilise le port
2. Modifier les ports dans `docker-compose.yml`

#### Le build échoue

```bash
# Nettoyer les images et rebuilder
docker-compose down
docker system prune -a
docker-compose up -d --build
```

#### La base de données ne démarre pas

```bash
# Vérifier les logs
docker-compose logs db

# Supprimer le volume et recréer
docker-compose down -v
docker-compose up -d
```

### 📝 Migrations de la base de données

Les migrations Prisma doivent être exécutées dans le conteneur backend :

```bash
# Générer le client Prisma
docker-compose exec api npx prisma generate

# Exécuter les migrations
docker-compose exec api npx prisma migrate deploy

# Seed la base de données
docker-compose exec api npm run seed:prod
```

### 🔄 Workflow de développement avec Docker

#### Développement local (recommandé)

Pour le développement actif, il est plus pratique d'utiliser les commandes npm localement :

```bash
# Terminal 1 : Backend
npm run start:dev

# Terminal 2 : Frontend
cd frontend
npm run dev
```

#### Tests avec Docker

Pour tester l'application complète en environnement "production-like" :

```bash
docker-compose up -d --build
```

### 📦 Structure des Dockerfiles

#### Backend (Dockerfile)
- Build multi-stage
- Stage 1 : Build TypeScript + Prisma
- Stage 2 : Runtime avec seulement les deps production

#### Frontend (frontend/Dockerfile)
- Build multi-stage
- Stage 1 : Build Next.js
- Stage 2 : Runtime avec Next.js optimisé

### 🌐 Variables d'environnement

Les variables d'environnement sont définies dans :

1. **Backend** : `.env.docker`
   ```env
   DATABASE_URL="******localhost:5432/appdb"
   JWT_SECRET="your-secret-key"
   JWT_EXPIRES_IN="1h"
   ```

2. **Frontend** : Définies dans `docker-compose.yml`
   ```yaml
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### 🎯 Commandes rapides

```bash
# Lancer tout
docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f

# Redémarrer après modification du code
docker-compose up -d --build

# Arrêter tout
docker-compose down

# Tout supprimer (conteneurs + volumes + images)
docker-compose down -v --rmi all
```

### ✅ Vérification rapide

Après avoir lancé les conteneurs, vérifier que tout fonctionne :

```bash
# Vérifier le statut
docker-compose ps

# Tous les conteneurs doivent être "Up" et "healthy"
```

Puis ouvrir dans le navigateur :
- http://localhost:3001 (Frontend)
- http://localhost:3000/health (Backend health check)
- http://localhost:3000/docs (API documentation)

### 🔐 Premier login

Utilisez les credentials d'un utilisateur seed (si vous avez exécuté le seed) ou créez un utilisateur via l'API.

---

Pour toute question, consultez la documentation principale dans `README.md` ou `FRONTEND_IMPLEMENTATION.md`.
