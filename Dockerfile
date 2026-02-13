# ============================================
# Stage 1: Builder — Install deps & build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================
# Stage 2: Runner — Serve with next start
# ============================================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app ./

RUN npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start"]
