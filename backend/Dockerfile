# syntax=docker/dockerfile:1

# Multi-stage build for a monorepo using npm workspaces.
# IMPORTANT: build context must be the repository root:
#   docker build -f backend/Dockerfile .

FROM node:20-alpine AS deps
WORKDIR /repo

# Copy manifests first (better layer caching).
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY backend/prisma backend/prisma

# Install deps for the backend workspace (includes dev deps needed for build).
RUN npm ci --workspace backend

FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY backend backend

WORKDIR /repo/backend
RUN npx prisma generate
RUN npm run build

WORKDIR /repo
# Slim down runtime deps (keeps generated Prisma client).
RUN npm prune --omit=dev --workspace backend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/backend/dist ./dist
COPY --from=build /repo/backend/prisma ./prisma
COPY --from=build /repo/backend/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", "dist/main"]

