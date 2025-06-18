# Discord Media Saver

Automatically downloads media files (images and videos) from a specified Discord channel.

## Features

- **TypeScript**: Fully typed with Discord API types for better reliability
- **Modular Architecture**: Clean separation of concerns with dependency injection
- **Multiple Channels**: Monitor multiple Discord channels simultaneously
- **Automatic Reconnection**: Handles Discord WebSocket disconnections gracefully
- **Media Filtering**: Only downloads image and video files
- **Date-based Organization**: Files are automatically organized by date (YYYY/MM/DD)
- **Safe Filenames**: Generates safe filenames with timestamps and usernames
- **Docker Support**: Ready for containerized deployment
- **Environment Configuration**: Configurable via environment variables

## Environment Variables

- `DISCORD_TOKEN`: Your Discord bot token (required)
- `CHANNEL_ID`: Discord channel ID(s) to monitor (required)
  - Single channel: `"123456789012345678"`
  - Multiple channels: `"123456789012345678,987654321098765432,555666777888999000"`
- `SAVE_DIRECTORY`: Directory to save media files (default: `./media`)
- `HEALTH_CHECK_PORT`: Port for health check HTTP server (default: `8080`)
- `DATABASE_URL`: PostgreSQL connection string for duplicate detection (optional)
- `DUPLICATE_CACHE_SIZE`: Maximum number of file hashes to keep in memory cache (default: `1000`)
- `MIN_IMAGE_SIZE`: Minimum image file size (default: `0`, supports: `100KB`, `1MB`, `500B`)
- `MAX_IMAGE_SIZE`: Maximum image file size (default: `50MB`, supports: `100KB`, `1MB`, `1GB`)
- `MIN_VIDEO_SIZE`: Minimum video file size (default: `0`, supports: `1MB`, `10MB`, `100MB`)
- `MAX_VIDEO_SIZE`: Maximum video file size (default: `500MB`, supports: `100MB`, `1GB`, `2GB`)

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set environment variables:
   ```bash
   export DISCORD_TOKEN="your_token"
   
   # Single channel
   export CHANNEL_ID="123456789012345678"
   
   # Or multiple channels (comma-separated)
   export CHANNEL_ID="123456789012345678,987654321098765432,555666777888999000"
   
   export SAVE_DIRECTORY="./media"  # optional
   
   # File size limits (optional)
   export MIN_IMAGE_SIZE="100KB"    # Skip images smaller than 100KB
   export MAX_IMAGE_SIZE="25MB"     # Skip images larger than 25MB
   export MIN_VIDEO_SIZE="1MB"      # Skip videos smaller than 1MB
   export MAX_VIDEO_SIZE="200MB"    # Skip videos larger than 200MB
   ```

3. Build and run the application:
   ```bash
   # Build TypeScript to JavaScript
   pnpm run build
   
   # Run the compiled application
   pnpm start
   
   # Or run directly with TypeScript (development)
   pnpm run dev
   ```

## Docker Usage

Run the pre-built image:
```bash
docker run -d \
  --name discord-media-saver \
  -e DISCORD_TOKEN="your_token" \
  -e CHANNEL_ID="your_channel_id" \
  -e SAVE_DIRECTORY="/media" \
  -v /media:/media \
  albinmedoc/discord-media-saver:latest
```

## Health Monitoring

The application includes a comprehensive health monitoring system with HTTP endpoints for real-time status information about Discord connection, duplicate detection, and overall application health.

### Health Check Endpoints

- **`GET /health`** - Comprehensive health status including:
  - Discord WebSocket connection status
  - Last heartbeat timestamp and reconnection count
  - Duplicate detection statistics (cache size, database count)
  - Application uptime and version
  - Overall health status (healthy/unhealthy)

### Health Status Criteria

The application is considered **unhealthy** if:
- Discord WebSocket is not connected
- Last heartbeat was more than 2 minutes ago

### Docker Health Monitoring

The Docker image includes built-in health monitoring that directly uses the `/health` endpoint every 60 seconds. The health check provides detailed status information and proper exit codes for container orchestration.

## Duplicate Detection

The application includes optional duplicate detection using MD5 hashing with **Prisma ORM** to prevent downloading the same file multiple times.

### Features
- **Hash-based detection**: Uses MD5 hashes to identify duplicate files
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **In-memory cache**: Fast lookup for recently processed files (configurable size, default: 1000 files)
- **Optional**: Gracefully disables if no database connection is available

### Setup
1. **Install PostgreSQL** (or use a hosted service)
2. **Set DATABASE_URL** environment variable:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/discord_media_saver"
   ```
3. **Push database schema** (creates tables automatically):
   ```bash
   pnpm run db:push
   ```
4. **Run the application** - Prisma client will be generated automatically during build

### Docker with PostgreSQL
```bash
# Start PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_DB=discord_media_saver \
  -e POSTGRES_USER=discord \
  -e POSTGRES_PASSWORD=password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

# Start Discord Media Saver with duplicate detection
docker run -d \
  --name discord-media-saver \
  --link postgres \
  -e DISCORD_TOKEN="your_token" \
  -e CHANNEL_ID="your_channel_id" \
  -e DATABASE_URL="postgresql://discord:password@postgres:5432/discord_media_saver" \
  -e DUPLICATE_CACHE_SIZE="2000" \
  -e SAVE_DIRECTORY="/media" \
  -v /media:/media \
  albinmedoc/discord-media-saver:latest
```

### How it works
1. **File downloaded** → Calculate MD5 hash
2. **Check cache** → Fast lookup in memory (last N files, configurable)
3. **Check database** → Query PostgreSQL via Prisma for hash
4. **If duplicate** → Delete downloaded file, log as duplicate
5. **If unique** → Keep file, record hash in database and cache

### Database Management
```bash
# Generate Prisma client (auto-runs during build)
pnpm run db:generate

# Push schema to database (create/update tables)
pnpm run db:push

# Create and run migrations (for production)
pnpm run db:migrate

# Open Prisma Studio (database GUI)
pnpm run db:studio
```

## Supported Media Types

- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .mov, .avi, .mkv, .webm
