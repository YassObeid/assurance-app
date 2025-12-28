# Dockerfile pour le frontend Next.js

# Étape 1 : build
FROM node:22-alpine AS build
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copier le reste du code frontend
COPY . ./

# Build Next.js pour production
RUN npm run build

# Étape 2 : runtime
FROM node:22-alpine AS runtime
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --omit=dev

# Copier les fichiers buildés
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/package.json ./package.json

# Variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Port exposé
EXPOSE 3000

# Démarrer Next.js
CMD ["npm", "start"]
