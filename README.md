# Discord Media Saver

Automatically downloads media files (images and videos) from a specified Discord channel.

## Features

- **Automatic Reconnection**: Handles Discord WebSocket disconnections gracefully
- **Media Filtering**: Only downloads image and video files
- **Safe Filenames**: Generates safe filenames with timestamps and usernames
- **Docker Support**: Ready for containerized deployment
- **Environment Configuration**: Configurable via environment variables

## Environment Variables

- `DISCORD_TOKEN`: Your Discord bot token (required)
- `CHANNEL_ID`: The Discord channel ID to monitor (required)
- `SAVE_DIRECTORY`: Directory to save media files (default: `./media`)

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set environment variables:
   ```bash
   export DISCORD_TOKEN="your_bot_token"
   export CHANNEL_ID="your_channel_id"
   export SAVE_DIRECTORY="./media"  # optional
   ```

3. Run the application:
   ```bash
   pnpm start
   ```

## Docker Usage

1. Update environment variables in `docker-compose.yaml`
2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Supported Media Types

- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .mov, .avi, .mkv, .webm
