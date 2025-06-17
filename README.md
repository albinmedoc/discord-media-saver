# Discord Media Saver

Automatically downloads media files (images and videos) from a specified Discord channel.

## Features

- **TypeScript**: Fully typed with Discord API types for better reliability
- **Modular Architecture**: Clean separation of concerns with dependency injection
- **Automatic Reconnection**: Handles Discord WebSocket disconnections gracefully
- **Media Filtering**: Only downloads image and video files
- **Safe Filenames**: Generates safe filenames with timestamps and usernames
- **Docker Support**: Ready for containerized deployment
- **Environment Configuration**: Configurable via environment variables

## Environment Variables

- `DISCORD_TOKEN`: Your Discord bot token (required)
- `CHANNEL_ID`: Discord channel ID(s) to monitor (required)
  - Single channel: `"123456789012345678"`
  - Multiple channels: `"123456789012345678,987654321098765432,555666777888999000"`
- `SAVE_DIRECTORY`: Directory to save media files (default: `./media`)

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

## Supported Media Types

- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .mov, .avi, .mkv, .webm
