import { Config } from './config/Config';
import { DiscordClient } from './discord/DiscordClient';
import { MediaProcessor } from './media/MediaProcessor';
import { Logger } from './utils/Logger';
import { HealthCheckServer } from './health/HealthCheckServer';
import { DuplicateDetectionService } from './deduplication/DuplicateDetectionService';

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
    private readonly duplicateDetection: DuplicateDetectionService;
    private readonly mediaProcessor: MediaProcessor;
    private readonly discordClient: DiscordClient;
    private readonly healthCheckServer: HealthCheckServer;

    /**
     * Initialize the Discord Media Saver with all required components
     */
    constructor() {
        this.config = new Config();
        this.duplicateDetection = new DuplicateDetectionService(this.config.getDuplicateCacheSize());
        this.mediaProcessor = new MediaProcessor(this.config, this.duplicateDetection);
        this.healthCheckServer = new HealthCheckServer(this.config.getHealthCheckPort());
        this.healthCheckServer.setDuplicateDetectionService(this.duplicateDetection);
        this.discordClient = new DiscordClient(this.config, this.mediaProcessor, this.healthCheckServer);
    }

    /**
     * Initialize and start the application
     * 
     * This will:
     * 1. Initialize duplicate detection service
     * 2. Start the health check server
     * 3. Log startup information
     * 4. Connect to Discord Gateway
     * 5. Begin monitoring the specified channel
     * 
     * @throws {Error} If connection to Discord fails or health server cannot start
     */
    async init(): Promise<void> {
        Logger.info('🚀 Starting Discord Media Saver...');
        
        // Initialize duplicate detection service
        try {
            await this.duplicateDetection.init(this.config.getDatabaseUrl());
        } catch (error) {
            Logger.error('❌ Failed to initialize duplicate detection:', error as Error);
            // Continue without duplicate detection - it will be disabled
        }
        
        // Start health check server
        try {
            await this.healthCheckServer.start();
        } catch (error) {
            Logger.error('❌ Failed to start health check server:', error as Error);
            throw error;
        }
        
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
    async cleanup(): Promise<void> {
        Logger.info('🛑 Shutting down Discord Media Saver...');
        
        this.discordClient.cleanup();
        
        try {
            await this.healthCheckServer.stop();
        } catch (error) {
            Logger.error('❌ Error stopping health check server:', error as Error);
        }
        
        try {
            await this.duplicateDetection.cleanup();
        } catch (error) {
            Logger.error('❌ Error cleaning up duplicate detection:', error as Error);
        }
        
        Logger.info('✓ Cleanup completed');
    }
}

// Default export for CommonJS compatibility
export default DiscordMediaSaver;
