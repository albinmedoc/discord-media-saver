# Development Guide

This guide will help you set up and develop the Discord Media Saver application locally.

## Prerequisites

- **Node.js 18 or higher**
- **pnpm** (Package manager)
- **Personal Discord User Token** (Get from Discord web browser: F12 → Network → Send message → Look for "Authorization: Bearer ...")
- **Discord Channel ID** (Right-click channel → Copy ID with Developer Mode enabled)
- **PostgreSQL** (Optional, for duplicate detection)

## Quick Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd discord-media-saver
pnpm install
```

### 2. Environment Variables
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

See [ENVIRONMENT.md](ENVIRONMENT.md) for all available options.

### 3. Run Development Server
```bash
# Run with TypeScript directly (recommended for development)
pnpm run dev

# Or build and run compiled version
pnpm run build
pnpm start
```

## Development Workflow

### Development Mode
```bash
# Run with hot reload (uses ts-node)
pnpm run dev
```
- Changes are reflected immediately
- No compilation step needed
- TypeScript errors shown in real-time

### Production Build
```bash
# Clean previous builds
pnpm run clean

# Generate Prisma client and compile TypeScript
pnpm run build

# Run compiled JavaScript
pnpm start
```

### Database Development (Optional)

#### Setup PostgreSQL
```bash
# Using Docker
docker run -d \
  --name postgres-dev \
  -e POSTGRES_DB=discord_media_saver \
  -e POSTGRES_USER=discord \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Add to .env
echo "DATABASE_URL=postgresql://discord:password@localhost:5432/discord_media_saver" >> .env
```

#### Database Commands
```bash
# Generate Prisma client
pnpm run db:generate

# Apply schema to database
pnpm run db:push

# Create and apply migrations
pnpm run db:migrate

# Open database GUI
pnpm run db:studio
```

## Testing Locally

### Test with Real Discord
1. Create a test Discord server
2. Create a test channel
3. Configure environment variables
4. Run the application
5. Post media files in the test channel

## Code Quality

### TypeScript
- Strict mode enabled
- All code should be properly typed
- No `any` types without good reason
- Use proper JSDoc comments for public APIs

### Error Handling
- Always handle promise rejections
- Log errors with context
- Graceful degradation when possible
- Don't crash on non-critical errors

## Building for Production

### Local Build
```bash
# Full clean build
pnpm run clean
pnpm run build

# Test production build
pnpm start
```

### Docker Build
```bash
# Build Docker image
docker build -t discord-media-saver .

# Test Docker image
docker run --rm \
  -e DISCORD_TOKEN="your_token" \
  -e CHANNEL_ID="your_channel_id" \
  -v ./test-media:/media \
  discord-media-saver
```

See [DOCKER.md](DOCKER.md) for detailed Docker deployment instructions.

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow TypeScript best practices**
4. **Add JSDoc comments for public APIs**
5. **Update documentation** when adding features
6. **Test thoroughly** with real Discord data
7. **Commit changes**: `git commit -m 'Add amazing feature'`
8. **Push to branch**: `git push origin feature/amazing-feature`
9. **Open Pull Request**

### Code Style
- Use meaningful variable and function names
- Keep functions small and focused
- Add error handling for all async operations
- Update relevant documentation files
- Follow existing patterns and conventions
