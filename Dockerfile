FROM node:18-alpine

# Install pnpm globally and wget for health checks
RUN npm install -g pnpm && apk add --no-cache wget

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Copy source code and Prisma schema
COPY src/ ./src/
COPY tsconfig.json ./
COPY docker-entrypoint.sh ./

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Build TypeScript (includes Prisma generation and file copying)
RUN pnpm run build


# Set default environment variables
ENV SAVE_DIRECTORY=/media
ENV HEALTH_CHECK_PORT=8080

# Create directory for saved files
RUN mkdir -p /media

# Expose health check port
EXPOSE 8080

# Expose volume for saved files
VOLUME ["/media"]

# Add health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Use custom entrypoint that sets up database schema
ENTRYPOINT ["./docker-entrypoint.sh"]