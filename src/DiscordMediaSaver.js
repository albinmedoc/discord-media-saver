const Config = require('./config/Config');
const DiscordClient = require('./discord/DiscordClient');
const MediaProcessor = require('./media/MediaProcessor');
const Logger = require('./utils/Logger');

/**
 * Main orchestrator class for Discord Media Saver
 */
class DiscordMediaSaver {
    constructor() {
        this.config = new Config();
        this.mediaProcessor = new MediaProcessor(this.config.getSaveDirectory());
        this.discordClient = new DiscordClient(this.config, this.mediaProcessor);
    }

    /**
     * Initialize and start the application
     */
    async init() {
        Logger.info('🚀 Starting Discord Media Saver...');
        Logger.info(`📁 Save directory: ${this.config.getSaveDirectory()}`);
        Logger.info(`📺 Channel ID: ${this.config.getChannelId()}`);
        
        await this.discordClient.connect();
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.discordClient.cleanup();
    }
}

module.exports = DiscordMediaSaver;
