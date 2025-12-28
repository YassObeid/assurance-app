# Assurance App - Frontend

Frontend Next.js moderne pour l'application de gestion d'assurance, connecté à l'API NestJS.

## 🏛️ Stack Technique

- **Framework**: Next.js 15 avec App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Custom components (inspirés de shadcn/ui)
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Auth**: JWT Bearer Token

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+ 
- npm
- Backend API en cours d'exécution sur http://localhost:3000

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Configuration

Fichier `.env.local` (déjà créé) :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Lancer en développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

### 4. Build pour production

```bash
npm run build
npm start
```

## 🔐 Authentification

1. Accéder à `/login`
2. Entrer email et mot de passe
3. Le token JWT est stocké dans `localStorage`
4. Redirection automatique vers `/dashboard`

## 👥 Rôles et Permissions

### GM (General Manager)
- Accès complet : Régions, Managers, Délégués, Membres, Paiements, Rapports

### REGION_MANAGER (Manager Régional)
- Consultation : Délégués, Membres, Paiements, Rapports de sa région

### DELEGATE (Délégué)
- Gestion : Membres et Paiements

## 📄 License

Propriétaire - Usage interne uniquement
