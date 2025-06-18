# Environment Variables

This document lists all available environment variables for Discord Media Saver.

## Required Variables

### `DISCORD_TOKEN`
- **Description**: Your personal Discord user token (not a bot token)
- **Required**: Yes
- **Example**: `"your_token_here"`
- **How to get**: 
  1. Open Discord in your web browser
  2. Press F12 → Go to Network tab
  3. Send a message in any channel
  4. Look for "Authorization: Bearer XXXXXXXXXX" in the headers
  5. Copy the token after "Bearer "

### `CHANNEL_ID`
- **Description**: Discord channel ID(s) to monitor
- **Required**: Yes
- **Format**: 
  - Single channel: `"123456789012345678"`
  - Multiple channels: `"123456789012345678,987654321098765432,555666777888999000"`
- **How to get**: Right-click channel → Copy ID (requires Developer Mode enabled in Discord)

## Optional Variables

### Basic Configuration

#### `SAVE_DIRECTORY`
- **Description**: Directory to save media files
- **Default**: `./media`
- **Example**: `"/path/to/media"`

#### `HEALTH_CHECK_PORT`
- **Description**: Port for health check HTTP server
- **Default**: `8080`
- **Example**: `"3000"`

### User Filtering

#### `BLACKLISTED_USER_IDS`
- **Description**: Comma-separated list of Discord user IDs to ignore
- **Default**: None (empty)
- **Example**: `"123456789012345678,987654321098765432"`
- **How to get**: Right-click user → Copy ID (requires Developer Mode enabled in Discord)

### File Size Limits

#### `MIN_IMAGE_SIZE`
- **Description**: Minimum image file size to download
- **Default**: `0` (no minimum)
- **Formats**: `100KB`, `1MB`, `500B`, or plain bytes
- **Example**: `"100KB"`

#### `MAX_IMAGE_SIZE`
- **Description**: Maximum image file size to download
- **Default**: `50MB`
- **Formats**: `100KB`, `1MB`, `1GB`, or plain bytes
- **Example**: `"25MB"`

#### `MIN_VIDEO_SIZE`
- **Description**: Minimum video file size to download
- **Default**: `0` (no minimum)
- **Formats**: `1MB`, `10MB`, `100MB`, or plain bytes
- **Example**: `"1MB"`

#### `MAX_VIDEO_SIZE`
- **Description**: Maximum video file size to download
- **Default**: `500MB`
- **Formats**: `100MB`, `1GB`, `2GB`, or plain bytes
- **Example**: `"200MB"`

### Duplicate Detection

#### `DATABASE_URL`
- **Description**: PostgreSQL connection string for duplicate detection
- **Default**: None (duplicate detection disabled)
- **Example**: `"postgresql://username:password@localhost:5432/discord_media_saver"`

#### `DUPLICATE_CACHE_SIZE`
- **Description**: Maximum number of file hashes to keep in memory cache
- **Default**: `1000`
- **Example**: `"2000"`
