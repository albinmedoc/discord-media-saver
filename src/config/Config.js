const fs = require('fs');

/**
 * Configuration manager for Discord Media Saver
 */
class Config {
    constructor() {
        this.token = process.env.DISCORD_TOKEN;
        this.channelId = process.env.CHANNEL_ID;
        this.saveDirectory = process.env.SAVE_DIRECTORY || '/media';
        
        this.validateConfig();
        this.ensureDirectoryExists();
    }

    validateConfig() {
        if (!this.token) {
            console.error('❌ DISCORD_TOKEN environment variable is required!');
            process.exit(1);
        }

        if (!this.channelId) {
            console.error('❌ CHANNEL_ID environment variable is required!');
            process.exit(1);
        }
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.saveDirectory)) {
            fs.mkdirSync(this.saveDirectory, { recursive: true });
        }
    }

    getToken() {
        return this.token;
    }

    getChannelId() {
        return this.channelId;
    }

    getSaveDirectory() {
        return this.saveDirectory;
    }

    getDiscordIntents() {
        return 32768 + 1 + 512; // MESSAGE_CONTENT + GUILDS + GUILD_MESSAGES
    }

    getGatewayUrl() {
        return 'wss://gateway.discord.gg/?v=9&encoding=json';
    }

    getReconnectDelay() {
        return 5000; // 5 seconds
    }

    getIdentifyDelay() {
        return 2000; // 2 seconds
    }
}

module.exports = Config;
