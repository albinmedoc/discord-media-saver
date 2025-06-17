FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY src/ ./src/

# Debug: Show what was copied and what's in each directory
RUN echo "=== Main src directory ===" && ls -la src/
RUN echo "=== Config directory ===" && ls -la src/config/ || echo "config dir missing"
RUN echo "=== Discord directory ===" && ls -la src/discord/ || echo "discord dir missing"  
RUN echo "=== Media directory ===" && ls -la src/media/ || echo "media dir missing"
RUN echo "=== Utils directory ===" && ls -la src/utils/ || echo "utils dir missing"

# Create directory for saved files
RUN mkdir -p /media

# Expose volume for saved files
VOLUME ["/media"]

CMD ["pnpm", "start"]