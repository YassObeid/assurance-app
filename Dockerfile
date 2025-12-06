# Étape 1 : build (TS -> JS + Prisma client)
FROM node:22-alpine AS build
WORKDIR /usr/src/app

# 1) Installer toutes les deps (prod + dev)
COPY package*.json ./
RUN npm ci

# 2) Copier prisma et générer le client
COPY prisma ./prisma
RUN npx prisma generate

# 3) Copier le reste du code et builder Nest
COPY . .
RUN npm run build

# Étape 2 : runtime (image finale, plus légère)
FROM node:22-alpine AS runtime
WORKDIR /usr/src/app

# 1) Installer seulement les deps de production
COPY package*.json ./
RUN npm ci --omit=dev

# 2) Copier UNIQUEMENT ce qui est nécessaire pour Prisma
#    (client généré + engines)
COPY --from=build /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# 3) Copier le code compilé et le schema prisma (utile si tu fais des migrations)
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma

# 4) Port exposé et commande de démarrage
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
