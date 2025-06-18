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

The application includes a built-in HTTP health check server that provides real-time status information about the Discord connection and application health.

### Health Check Endpoint

- **`GET /health`** - Basic health status (200 = healthy, 503 = unhealthy) - Used by Docker HEALTHCHECK

### Docker Health Checks

The Docker image includes built-in health monitoring using the `/health` endpoint:

```bash
# Check container health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# View detailed health check logs
docker inspect discord-media-saver --format='{{json .State.Health}}' | jq

# Monitor health events in real-time
docker events --filter container=discord-media-saver --filter event=health_status
```

**Health Check Configuration:**
- **Interval**: Every 60 seconds
- **Timeout**: 10 seconds per check
- **Start Period**: 30 seconds (grace period after container start)
- **Retries**: 3 failed checks before marking unhealthy

### Health Check Configuration

The health check server runs on port 8080 by default, configurable via the `HEALTH_CHECK_PORT` environment variable.

The application is considered **unhealthy** if:
- Discord WebSocket is not connected
- Last heartbeat was more than 2 minutes ago

## Supported Media Types

- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .mov, .avi, .mkv, .webm
