# ─── Multi-Stage Production Dockerfile for HPMS Frontend ───────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time API URL argument
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Build optimized production bundle
RUN npm run build

# ─── Runtime Nginx Stage ──────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy custom Nginx SPA routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
