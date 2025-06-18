# Discord Media Saver

Automatically downloads media files (images and videos) from Discord channels with advanced filtering and duplicate detection.

## ✨ Features

- **🔄 Real-time Monitoring**: Automatically downloads media as it's posted
- **📁 Smart Organization**: Files organized by date (YYYY/MM/DD structure)
- **🚫 User Blacklisting**: Ignore specific users completely  
- **📏 File Size Filtering**: Set min/max limits for images and videos
- **🔍 Duplicate Detection**: Optional PostgreSQL-based duplicate prevention
- **🏥 Health Monitoring**: Built-in HTTP health checks for monitoring
- **🐳 Docker Ready**: Full Docker and Docker Compose support
- **⚡ TypeScript**: Fully typed for reliability and maintainability

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
docker run -d \
  --name discord-media-saver \
  -e DISCORD_TOKEN="your_token_here" \
  -e CHANNEL_ID="your_channel_id_here" \
  -v /path/to/save/media:/media \
  ghcr.io/albinmedoc/discord-media-saver:latest
```

### Option 2: Local
```bash
git clone <repository-url>
cd discord-media-saver
pnpm install
cp .env.example .env  # Edit with your values
pnpm run build
pnpmt run start
```

## 📋 Prerequisites

### Discord Setup
1. **Create Discord Application**: Visit [Discord Developer Portal](https://discord.com/developers/applications)
2. **Create Bot**: Go to "Bot" section and create a bot
3. **Get Token**: Copy the bot token (keep it secure!)
4. **Get Channel ID**: Right-click Discord channel → "Copy ID" (requires Developer Mode)
5. **Invite Bot**: Generate invite URL with appropriate permissions

### Required Permissions
Your Discord bot needs these permissions in the target channel:
- ✅ View Channel
- ✅ Read Message History

## ⚙️ Configuration

### Essential Variables
```bash
DISCORD_TOKEN="your_token_here"     # Required
CHANNEL_ID="123456789012345678"     # Required
```

📖 **See [ENVIRONMENT.md](ENVIRONMENT.md) for complete configuration reference**

## 🎯 Supported Media Types

| Type | Extensions |
|------|------------|
| **Images** | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` |
| **Videos** | `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm` |

## 🔍 Duplicate Detection (Optional)

Enable PostgreSQL-based duplicate detection to prevent downloading the same file multiple times:

1. **Setup PostgreSQL database**
2. **Set `DATABASE_URL` environment variable**  
3. **Run schema migration**: `pnpm run db:push`

Files are compared using MD5 hashes with fast in-memory caching.

## 🐳 Docker Examples

### Basic Usage
```bash
docker run -d \
  --name discord-media-saver \
  -e DISCORD_TOKEN="your_token" \
  -e CHANNEL_ID="your_channel_id" \
  -v ./media:/media \
  ghcr.io/albinmedoc/discord-media-saver:latest
```

### With Docker Compose
```yaml
version: '3.8'
services:
  discord-media-saver:
    image: ghcr.io/albinmedoc/discord-media-saver:latest
    environment:
      - DISCORD_TOKEN=your_token
      - CHANNEL_ID=your_channel_id
      - MAX_IMAGE_SIZE=25MB
    volumes:
      - ./media:/media
    restart: unless-stopped
```

📖 **See [DOCKER.md](DOCKER.md) for complete Docker deployment guide**

## 🛠️ Development

For local development, testing, and contributing:

```bash
git clone https://github.com/albinmedoc/discord-media-saver.git
cd discord-media-saver
pnpm install
cp .env.example .env  # Configure your environment
pnpm run dev          # Start development server
```

📖 **See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development guide**

## 🤝 Contributing

Contributions are welcome! Please see [DEVELOPMENT.md](DEVELOPMENT.md) for guidelines.

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Need help?** Check the documentation files or open an issue with detailed information about your setup and the problem you're experiencing.
