import { Config } from './config/Config';
import { DiscordClient } from './discord/DiscordClient';
import { MediaProcessor } from './media/MediaProcessor';
import { Logger } from './utils/Logger';

/**
 * Main orchestrator class for Discord Media Saver
 * 
 * This class coordinates all components of the application:
 * - Configuration management
 * - Discord WebSocket connection
 * - Media file processing and downloading
 * 
 * @example
 * ```typescript
 * const saver = new DiscordMediaSaver();
 * await saver.init();
 * ```
 */
export class DiscordMediaSaver {
    private readonly config: Config;
    private readonly mediaProcessor: MediaProcessor;
    private readonly discordClient: DiscordClient;

    /**
     * Initialize the Discord Media Saver with all required components
     */
    constructor() {
        this.config = new Config();
        this.mediaProcessor = new MediaProcessor(this.config.getSaveDirectory());
        this.discordClient = new DiscordClient(this.config, this.mediaProcessor);
    }

    /**
     * Initialize and start the application
     * 
     * This will:
     * 1. Log startup information
     * 2. Connect to Discord Gateway
     * 3. Begin monitoring the specified channel
     * 
     * @throws {Error} If connection to Discord fails
     */
    async init(): Promise<void> {
        Logger.info('🚀 Starting Discord Media Saver...');
        Logger.info(`📁 Save directory: ${this.config.getSaveDirectory()}`);
        
        const channelIds = this.config.getChannelIds();
        if (channelIds.length === 1) {
            Logger.info(`📺 Monitoring channel: ${channelIds[0]}`);
        } else {
            Logger.info(`📺 Monitoring ${channelIds.length} channels: ${channelIds.join(', ')}`);
        }
        
        await this.discordClient.connect();
    }

    /**
     * Cleanup resources and gracefully shutdown
     * 
     * This should be called before application termination
     */
    cleanup(): void {
        this.discordClient.cleanup();
    }
}

// Default export for CommonJS compatibility
export default DiscordMediaSaver;
