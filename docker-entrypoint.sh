#!/bin/sh

# Docker entrypoint script for Discord Media Saver
# This script ensures the database schema is set up before starting the application

echo "🚀 Starting Discord Media Saver..."

# Check if DATABASE_URL is provided
if [ -n "$DATABASE_URL" ]; then
    echo "📊 Database URL provided, setting up schema..."
    
    # Wait a moment for database to be ready (in case it's starting up)
    sleep 2
    
    # Apply database migrations (creates tables if they don't exist)
    echo "🔧 Applying database migrations..."
    npx prisma migrate deploy --schema=src/prisma/schema.prisma
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema applied successfully"
    else
        echo "⚠️ Failed to apply database schema, but continuing (duplicate detection will be disabled)"
    fi
else
    echo "ℹ️ No DATABASE_URL provided, duplicate detection will be disabled"
fi

# Start the application
echo "🎯 Starting Discord Media Saver application..."
exec pnpm start
