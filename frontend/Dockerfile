# =============================================================================
# Swarmtally – Frontend Dockerfile
# Uses Chainguard Node images (Wolfi-OS based) – consistently 0 known CVEs.
# Three-stage build:
#   deps     – cgr.dev/chainguard/node:latest-dev  (npm ci – install deps)
#   builder  – cgr.dev/chainguard/node:latest-dev  (npm run build)
#   runner   – cgr.dev/chainguard/node:latest       (minimal, no shell, non-root)
# =============================================================================

# ── Stage 1: Install dependencies ────────────────────────────────────────────
# latest-dev includes npm, shell, and build tools
FROM cgr.dev/chainguard/node:latest-dev AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM cgr.dev/chainguard/node:latest-dev AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
# These must be prefixed with NEXT_PUBLIC_ to be embedded in the client bundle
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Production runtime ───────────────────────────────────────────────
# cgr.dev/chainguard/node:latest is a distroless-style image:
#   - Wolfi OS base → 0 known CVEs
#   - Runs as built-in non-root 'node' user by default
#   - No shell, no package manager – smallest possible attack surface
FROM cgr.dev/chainguard/node:latest AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone build output
# next.config.js must have output: 'standalone' for this to work.
# Chainguard Node image uses 'node' as the built-in non-root user (no adduser needed).
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the standalone Next.js server (exec form – node is PID 1, signals forwarded)
CMD ["node", "server.js"]
