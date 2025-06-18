# Docker Deployment Guide

This guide covers running Discord Media Saver using Docker.

## Quick Start

**Note**: This uses your personal Discord user token, not a bot token. To get your token:
1. Open Discord in web browser
2. Press F12 → Network tab  
3. Send a message in any channel
4. Look for "Authorization: Bearer XXXXXXXXXX" in headers
5. Copy the token after "Bearer "

```bash
docker run -d \
  --name discord-media-saver \
  -e DISCORD_TOKEN="your_token" \
  -e CHANNEL_ID="your_channel_id" \
  -v /path/to/your/media:/media \
  ghcr.io/albinmedoc/discord-media-saver:latest
```

## Docker Compose

### Basic Setup
```yaml
# docker-compose.yml

services:
  discord-media-saver:
    image: ghcr.io/albinmedoc/discord-media-saver:latest
    container_name: discord-media-saver
    restart: unless-stopped
    environment:
      - DISCORD_TOKEN=your_token_here
      - CHANNEL_ID=your_channel_id
      - SAVE_DIRECTORY=/media
      - MAX_IMAGE_SIZE=25MB
      - MAX_VIDEO_SIZE=200MB
    volumes:
      - ./media:/media
```

### With PostgreSQL Duplicate Detection
```yaml
# docker-compose.yml

services:
  postgres:
    image: postgres:15
    container_name: discord-media-saver-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=discord_media_saver
      - POSTGRES_USER=discord
      - POSTGRES_PASSWORD=secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  discord-media-saver:
    image: ghcr.io/albinmedoc/discord-media-saver:latest
    container_name: discord-media-saver
    restart: unless-stopped
    depends_on:
      - postgres
    environment:
      - DISCORD_TOKEN=your_token_here
      - CHANNEL_ID=your_channel_id
      - DATABASE_URL=postgresql://discord:secure_password_here@postgres:5432/discord_media_saver
    volumes:
      - ./media:/media

volumes:
  postgres_data:
```

## Environment File

Create a `.env` file for easier environment management:

Then use it with Docker:
```bash
docker run -d --name discord-media-saver --env-file .env -v ./media:/media ghcr.io/albinmedoc/discord-media-saver:latest
```

Or with Docker Compose:
```yaml
# docker-compose.yml

services:
  discord-media-saver:
    image: ghcr.io/albinmedoc/discord-media-saver:latest
    env_file: .env
    volumes:
      - ./media:/media
    ports:
      - "8080:8080"
```

## Volumes

### Media Storage
- **Container Path**: `/media`
- **Purpose**: Store downloaded media files
- **Example**: `-v /host/path/media:/media`

### Backup Considerations
- Media files are organized by date: `/media/YYYY/MM/DD/`
- Consider regular backups of the media volume
- Database backups (if using PostgreSQL) should also be scheduled

## Building from Source

### Build Image
```bash
git clone https://github.com/albinmedoc/discord-media-saver.git
cd discord-media-saver
docker build -t discord-media-saver .
```

### Multi-platform Build
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t discord-media-saver .
```

## Troubleshooting

### Common Issues

#### Container Won't Start
1. Check required environment variables are set
2. Verify Discord token is valid
3. Check container logs: `docker logs discord-media-saver`

#### Files Not Downloading
1. Verify channel ID is correct
2. Review file size limits if configured

#### Database Connection Issues
1. Verify DATABASE_URL format
2. Ensure PostgreSQL container is running
3. Check network connectivity between containers
4. Verify database credentials

### Getting Help
- Check logs with `docker logs discord-media-saver`
- Verify environment variables with `docker inspect discord-media-saver`
- Test Discord connection manually
- Review [ENVIRONMENT.md](ENVIRONMENT.md) for configuration details
