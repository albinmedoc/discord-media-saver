FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN pnpm run build

# Set default environment variable
ENV SAVE_DIRECTORY=/media

# Create directory for saved files
RUN mkdir -p /media

# Expose volume for saved files
VOLUME ["/media"]

CMD ["pnpm", "start"]