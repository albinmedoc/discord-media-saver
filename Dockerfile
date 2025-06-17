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

# Create directory for saved files
RUN mkdir -p /media

# Expose volume for saved files
VOLUME ["/media"]

CMD ["pnpm", "start"]