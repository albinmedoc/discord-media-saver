# Development Guide

This guide will help you set up and develop the Discord Media Saver application.

## Prerequisites

- Node.js 18 or higher
- pnpm
- Discord Token
- Discord Channel ID

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd discord-media-saver
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env` file (optional, or export directly):
   ```bash
   DISCORD_TOKEN=your_token_here
   CHANNEL_ID=your_channel_id_here
   SAVE_DIRECTORY=./media  # optional
   ```

## Development Workflow

### Running in Development Mode
```bash
# Run directly with TypeScript (no compilation needed)
pnpm run dev
```

### Building for Production
```bash
# Clean previous builds
pnpm run clean

# Compile TypeScript to JavaScript
pnpm run build

# Run the compiled version
pnpm start
```

## Docker Development

### Build locally:
```bash
docker build -t discord-media-saver .
```

### Run with environment variables:
```bash
docker run -d \
  --name discord-media-saver \
  -e DISCORD_TOKEN="your_token" \
  -e CHANNEL_ID="your_channel_id" \
  -v /path/to/save:/media \
  discord-media-saver
```

## Debugging

### VS Code Setup
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug TypeScript",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/index.ts",
      "env": {
        "DISCORD_TOKEN": "your_token_here",
        "CHANNEL_ID": "your_channel_id_here"
      },
      "runtimeArgs": ["-r", "ts-node/register"],
      "sourceMaps": true
    }
  ]
}
```

## Contributing

1. Follow TypeScript best practices
2. Maintain type safety
3. Add JSDoc comments for public APIs
4. Update README when adding features
