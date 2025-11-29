```markdown
📘 Assurance App – Backend NestJS (README Complet)
# Assurance App – Backend NestJS

Backend d’une application de gestion d’assurance basée sur :

- Un **GM** (General Manager)
- Des **Region Managers**
- Des **Delegates**
- Des **Members**
- Des **Payments**

Le backend est construit avec **NestJS**, **Prisma** et **PostgreSQL** (via Docker), avec **authentification JWT** et **contrôle d’accès par rôles**.

---

# 🧱 Stack technique

- **Node.js + TypeScript**
- **NestJS (architecture modulaire)**
- **Prisma ORM**
- **PostgreSQL (Docker)**
- **Auth JWT / Passport**
- **Validation : class-validator & class-transformer**

---

# 🧩 Fonctionnalités

- Gestion des Users (GM, Region Managers, Delegates)
- Gestion des Regions
- Affectation des Region Managers (historique)
- Gestion des Delegates (liés à un Manager & une Region)
- Gestion des Members (liés à un Delegate)
- Gestion des Payments (liés à Member & Delegate)
- Auth JWT : `/auth/login`
- Sécurisation des routes par rôles (RBAC simple)

---

# 🏛️ Architecture (diagramme d’ensemble)

```mermaid
flowchart LR
  C[Client / Front-end]

  subgraph Backend[NestJS API]
    A[AppModule]
    AUTH[AuthModule]
    USERS[UsersModule]
    REG[RegionsModule]
    MAN[ManagersModule]
    DEL[DelegatesModule]
    MEM[MembersModule]
    PAY[PaymentsModule]
    REP[ReportsModule]
    Prisma[PrismaModule]
  end

  subgraph DB[(PostgreSQL)]
    Tables[User, Region, RegionManager, Delegate, Member, Payment]
  end

  C --> A
  A --> AUTH
  A --> USERS
  A --> REG
  A --> MAN
  A --> DEL
  A --> MEM
  A --> PAY
  A --> REP
  A --> Prisma
  Prisma --> DB
```

🗂️ Modèle de données (Prisma)

```mermaid
erDiagram
  USER {
    string id PK
    string name
    string email
    string password
    string role
    datetime createdAt
    datetime updatedAt
  }

  REGION {
    string id PK
    string name
  }

  REGION_MANAGER {
    string id PK
    string userId FK
    string regionId FK
    datetime startAt
    datetime endAt
  }

  DELEGATE {
    string id PK
    string name
    string phone
    string regionId FK
    string managerId FK
    string userId
  }

  MEMBER {
    string id PK
    string cin
    string fullName
    string status
    string delegateId FK
  }

  PAYMENT {
    string id PK
    string memberId FK
    string delegateId FK
    decimal amount
    datetime paidAt
  }

  USER ||--o{ REGION_MANAGER : manages
  REGION ||--o{ REGION_MANAGER : has
  REGION ||--o{ DELEGATE : has
  REGION_MANAGER ||--o{ DELEGATE : supervises
  DELEGATE ||--o{ MEMBER : manages
  MEMBER ||--o{ PAYMENT : pays
  DELEGATE ||--o{ PAYMENT : collects
```

🔐 Authentification – flux JWT
Login (POST /auth/login)

```mermaid
sequenceDiagram
  participant C as Client
  participant AC as AuthController
  participant AS as AuthService
  participant DB as PostgreSQL

  C->>AC: POST /auth/login {email, password}
  AC->>AS: login()
  AS->>DB: select user by email
  DB-->>AS: user + password hash
  AS->>AS: compare password (bcrypt)
  AS-->>C: return { access_token }
```

Contenu du JWT :
```json
{
  "sub": "user.id",
  "email": "user.email",
  "role": "GM | REGION_MANAGER | DELEGATE",
  "delegateId": "id du délégué si applicable"
}
```

📡 Routes principales
Auth
POST /auth/login → retourne un JWT
Users
POST /users
GET /users
Regions
POST /regions
GET /regions
Managers
POST /managers
GET /managers
Delegates
POST /delegates
GET /delegates
GET /delegates/:id
Members
Sécurité renforcée :
délégué → ses membres uniquement
GM & Managers → vue globale
Routes :
POST /members
GET /members
GET /members/:id
DELETE /members/:id
Payments
POST /payments
GET /payments
Reports
GET /reports/members-by-delegate
GET /reports/members-by-region
GET /reports/payments-summary

🚀 Démarrage du projet
1. Cloner
git clone <URL_DU_REPO>
cd assurance-app-main/backend

2. Lancer PostgreSQL (Docker)
docker run -d --name app-postgres \
  -e POSTGRES_USER=app \
  -e POSTGRES_PASSWORD=app \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 \
  postgres:16

3. Configurer .env
Créer un fichier .env :
DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"
JWT_SECRET="change-me-in-prod"
JWT_EXPIRES_IN="1h"

4. Installer
npm install

5. Générer DB (Prisma)
npx prisma migrate dev -n init
npx prisma generate

6. Lancer l’API
npm run start:dev

Accès :
 👉 http://localhost:3000

🧪 Tests (à venir)
Tests unitaires services / guards (Jest)
Tests e2e routes Nest

📌 Notes importantes
Le contrôle d’accès est déjà implémenté (JWT + Roles).
Le délégué ne peut JAMAIS choisir son delegateId : il vient uniquement du JWT.
L’architecture est déjà de niveau production-ready (structure senior + séparation des responsabilités).

---

## 🎉 Tout est réuni dans un seul bloc lisible  
Tu as maintenant **un README professionnel**, complet, prêt pour GitHub, avec :

- architecture
- diagrammes
- explication JWT
- routes
- installation
- base de données
- flux complets

Si tu veux, je peux maintenant t'ajouter :

✅ Un diagramme **UML complet**  
✅ Un schéma **CI/CD GitHub Actions**  
✅ Un script de **seed initial** (GM + Manager + Delegate + Member)  
✅ Ou commencer les **tests unitaires**
```