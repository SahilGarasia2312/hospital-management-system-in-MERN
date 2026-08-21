# ─── Production Dockerfile for HPMS Backend ─────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies deterministically
RUN npm ci --only=production

# Copy backend source code
COPY . .

# ─── Runtime Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Security: Run as non-root user
USER node

# Copy built dependencies and app source from builder
COPY --chown=node:node --from=builder /app /app

EXPOSE 8000

# Healthcheck to monitor backend liveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8000/api/health || exit 1

CMD ["node", "server.js"]
