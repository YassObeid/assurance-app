# Assurance App - Application de Gestion d'Assurance

Application complète de gestion d'assurance avec :

- **Frontend Next.js** : Interface moderne et responsive
- **Backend NestJS** : API REST avec authentification JWT
- **PostgreSQL** : Base de données
- Gestion des **GM** (General Manager), **Region Managers**, **Delegates**, **Members** et **Payments**

---

## 🚀 Lancement Rapide avec Docker

### Option 1 : Tout lancer avec Docker (Recommandé pour tests)

```bash
# Lancer tous les services (DB + API + Frontend)
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

**Accès :**
- 🌐 **Frontend** : http://localhost:3001
- 🔌 **Backend API** : http://localhost:3000
- 📚 **API Docs (Swagger)** : http://localhost:3000/docs

### Option 2 : Développement local (Recommandé pour dev actif)

```bash
# Terminal 1 : Backend
npm install
npm run start:dev

# Terminal 2 : Frontend
cd frontend
npm install
npm run dev
```

**📖 Documentation Docker complète** : Voir [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---

## 🧱 Stack Technique

### Backend
- **Node.js + TypeScript**
- **NestJS (architecture modulaire)**
- **Prisma ORM**
- **PostgreSQL**
- **Auth JWT / Passport**
- **Validation : class-validator & class-transformer**

### Frontend
- **Next.js 15 (App Router)**
- **TypeScript**
- **TailwindCSS**
- **TanStack Query (React Query)**
- **React Hook Form + Zod**
- **Axios**

---

## 🐳 Docker - Commandes Principales

```bash
# Lancer tout
docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f

# Arrêter tout
docker-compose down

# Rebuilder après modification du code
docker-compose up -d --build

# Accéder au shell d'un conteneur
docker-compose exec frontend sh
docker-compose exec api sh

# Exécuter les migrations Prisma
docker-compose exec api npx prisma migrate deploy
```

---

## 🚀 Démarrage sans Docker

### 1. Base de données

```bash
# Docker uniquement pour PostgreSQL
docker run -d --name app-postgres \
  -e POSTGRES_USER=app \
  -e POSTGRES_PASSWORD=app \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 \
  postgres:16
```

### 2. Backend

```bash
npm install

# Configurer .env
echo 'DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"' > .env
echo 'JWT_SECRET="change-me-in-prod"' >> .env
echo 'JWT_EXPIRES_IN="1h"' >> .env

# Migrations
npx prisma generate
npx prisma migrate deploy

# Lancer
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Documentation

- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Guide complet Docker
- **[frontend/README.md](./frontend/README.md)** - Documentation frontend
- **[FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md)** - Détails techniques

---

## 🔐 Rôles et Permissions

### GM (General Manager)
- Accès complet à toutes les fonctionnalités
- Création/gestion : Régions, Managers, Délégués

### REGION_MANAGER
- Vue sur les délégués de sa région
- Consultation des membres et paiements

### DELEGATE
- Gestion de ses membres uniquement
- Création de paiements pour ses membres

---

## 📡 Endpoints API

- `POST /auth/login` - Connexion
- `GET /auth/me` - Utilisateur connecté
- `GET /regions` - Régions
- `GET /managers` - Managers
- `GET /delegates` - Délégués
- `GET /members` - Membres
- `GET /payments` - Paiements
- `GET /reports/summary` - Résumé global

Documentation complète : http://localhost:3000/docs

---

## 📄 License

Propriétaire - Usage interne uniquement
