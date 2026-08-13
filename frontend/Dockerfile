# --- Build stage ---
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Baked in at build time (Vite inlines VITE_* env vars into the bundle).
# Override with --build-arg in docker-compose.yml or `docker build --build-arg`
# to point at a non-localhost API in staging/production.
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm run build

# --- Serve stage ---
# nginx-unprivileged instead of the standard nginx image: the standard image
# starts its master process as root (only workers drop to the nginx user),
# and needs root to bind port 80. This variant runs the whole process as an
# unprivileged user from the start and listens on 8080 instead, matching
# the Docker non-root execution requirement without giving up the ability
# to bind a port below 1024 on the host (compose maps host:5173 -> 8080).
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
          CMD wget -qO- http://localhost:8080/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
