import * as fs from 'fs';
import { FileUtils } from '../utils/FileUtils';

/**
 * Configuration manager for Discord Media Saver
 * 
 * Handles environment variable validation and provides
 * centralized access to all application configuration.
 * 
 * @example
 * ```typescript
 * const config = new Config();
 * console.log(config.getSaveDirectory()); // "./media"
 * ```
 */
export class Config {
    private readonly token: string;
    private readonly channelIds: string[];
    private readonly saveDirectory: string;
    private readonly healthCheckPort: number;
    private readonly databaseUrl: string | undefined;
    private readonly duplicateCacheSize: number;
    private readonly minImageSize: number;
    private readonly maxImageSize: number;
    private readonly minVideoSize: number;
    private readonly maxVideoSize: number;
    private readonly blacklistedUserIds: string[];

    /**
     * Initialize configuration from environment variables
     * 
     * @throws {Error} If required environment variables are missing
     */
    constructor() {
        this.token = process.env.DISCORD_TOKEN || '';
        this.channelIds = this.parseChannelIds(process.env.CHANNEL_ID || '');
        this.saveDirectory = process.env.SAVE_DIRECTORY || './media';
        this.healthCheckPort = parseInt(process.env.HEALTH_CHECK_PORT || '8080', 10);
        this.databaseUrl = process.env.DATABASE_URL;
        this.duplicateCacheSize = parseInt(process.env.DUPLICATE_CACHE_SIZE || '1000', 10);

        // File size limits (in bytes)
        this.minImageSize = FileUtils.parseFileSize(process.env.MIN_IMAGE_SIZE, 0);
        this.maxImageSize = FileUtils.parseFileSize(process.env.MAX_IMAGE_SIZE, 50 * 1024 * 1024); // 50MB default
        this.minVideoSize = FileUtils.parseFileSize(process.env.MIN_VIDEO_SIZE, 0);
        this.maxVideoSize = FileUtils.parseFileSize(process.env.MAX_VIDEO_SIZE, 500 * 1024 * 1024); // 500MB default
        
        // Blacklisted user IDs
        this.blacklistedUserIds = this.parseUserIds(process.env.BLACKLISTED_USER_IDS || '');
        
        this.validateConfig();
        this.ensureDirectoryExists();
    }

    /**
     * Parse channel IDs from environment variable (comma-separated)
     * 
     * @private
     * @param {string} channelIdString - Comma-separated channel IDs
     * @returns {string[]} Array of channel IDs
     */
    private parseChannelIds(channelIdString: string): string[] {
        if (!channelIdString.trim()) {
            return [];
        }

        return channelIdString
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0);
    }

    /**
     * Parse user IDs from environment variable (comma-separated)
     * 
     * @private
     * @param {string} userIdString - Comma-separated user IDs
     * @returns {string[]} Array of user IDs
     */
    private parseUserIds(userIdString: string): string[] {
        if (!userIdString.trim()) {
            return [];
        }

        return userIdString
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0 && /^\d{17,19}$/.test(id)); // Validate Discord snowflake format
    }

    /**
     * Validate that all required configuration is present
     * 
     * @private
     * @throws {Error} If validation fails
     */
    private validateConfig(): void {
        if (!this.token) {
            console.error('❌ DISCORD_TOKEN environment variable is required!');
            process.exit(1);
        }

        if (this.channelIds.length === 0) {
            console.error('❌ CHANNEL_ID environment variable is required!');
            console.error('   Format: "123456789012345678" or "123456789012345678,987654321098765432"');
            process.exit(1);
        }

        // Validate each channel ID format (should be a snowflake)
        for (const channelId of this.channelIds) {
            if (!/^\d{17,19}$/.test(channelId)) {
                console.error(`❌ Invalid CHANNEL_ID: "${channelId}" must be a valid Discord snowflake (17-19 digits)`);
                process.exit(1);
            }
        }
    }

    /**
     * Ensure the save directory exists, creating it if necessary
     * 
     * @private
     */
    private ensureDirectoryExists(): void {
        if (!fs.existsSync(this.saveDirectory)) {
            fs.mkdirSync(this.saveDirectory, { recursive: true });
        }
    }

    /**
     * Get the Discord bot token
     * 
     * @returns {string} The Discord bot token
     */
    getToken(): string {
        return this.token;
    }

    /**
     * Get the Discord channel IDs to monitor
     * 
     * @returns {string[]} Array of Discord channel IDs
     */
    getChannelIds(): string[] {
        return this.channelIds;
    }

    /**
     * Check if a channel ID is being monitored
     * 
     * @param {string} channelId - The channel ID to check
     * @returns {boolean} True if the channel is being monitored
     */
    isMonitoredChannel(channelId: string): boolean {
        return this.channelIds.includes(channelId);
    }

    /**
     * Get the directory where media files will be saved
     * 
     * @returns {string} The save directory path
     */
    getSaveDirectory(): string {
        return this.saveDirectory;
    }

    /**
     * Get Discord Gateway intents
     * 
     * @returns {number} Combined intent flags for Discord Gateway
     */
    getDiscordIntents(): number {
        return 32768 + 1 + 512; // MESSAGE_CONTENT + GUILDS + GUILD_MESSAGES
    }

    /**
     * Get Discord Gateway WebSocket URL
     * 
     * @returns {string} The Discord Gateway URL
     */
    getGatewayUrl(): string {
        return 'wss://gateway.discord.gg/?v=9&encoding=json';
    }

    /**
     * Get reconnection delay in milliseconds
     * 
     * @returns {number} Delay before attempting reconnection
     */
    getReconnectDelay(): number {
        return 5000; // 5 seconds
    }

    /**
     * Get identification delay in milliseconds
     * 
     * @returns {number} Delay before sending identification
     */
    getIdentifyDelay(): number {
        return 2000; // 2 seconds
    }

    /**
     * Get the health check server port
     * 
     * @returns {number} Port for the health check HTTP server
     */
    getHealthCheckPort(): number {
        return this.healthCheckPort;
    }
    /**
     * Get the database URL for duplicate detection
     * 
     * @returns {string | undefined} Database URL or undefined if not set
     */
    getDatabaseUrl(): string | undefined {
        return this.databaseUrl;
    }

    /**
     * Get the duplicate detection cache size
     * 
     * @returns {number} Maximum number of file hashes to keep in memory cache
     */
    getDuplicateCacheSize(): number {
        return this.duplicateCacheSize;
    }

    /**
     * Get maximum image file size in bytes
     * 
     * @returns {number} Maximum image size in bytes
     */
    getMinImageSize(): number {
        return this.minImageSize;
    }

    /**
     * Get maximum image file size in bytes
     * 
     * @returns {number} Maximum image size in bytes
     */
    getMaxImageSize(): number {
        return this.maxImageSize;
    }

    /**
     * Get minimum video file size in bytes
     * 
     * @returns {number} Minimum video size in bytes
     */
    getMinVideoSize(): number {
        return this.minVideoSize;
    }

    /**
     * Get maximum video file size in bytes
     * 
     * @returns {number} Maximum video size in bytes
     */
    getMaxVideoSize(): number {
        return this.maxVideoSize;
    }

    /**
     * Check if a file size is within limits for the given media type
     * 
     * @param {number} fileSize - File size in bytes
     * @param {boolean} isVideo - Whether the file is a video (false for images)
     * @returns {boolean} True if file size is within limits
     */
    isFileSizeValid(fileSize: number, isVideo: boolean): boolean {
        if (isVideo) {
            return fileSize >= this.minVideoSize && fileSize <= this.maxVideoSize;
        } else {
            return fileSize >= this.minImageSize && fileSize <= this.maxImageSize;
        }
    }

    /**
     * Get the blacklisted user IDs
     * 
     * @returns {string[]} Array of blacklisted user IDs
     */
    getBlacklistedUserIds(): string[] {
        return this.blacklistedUserIds;
    }

    /**
     * Check if a user ID is blacklisted
     * 
     * @param {string} userId - The user ID to check
     * @returns {boolean} True if the user is blacklisted
     */
    isUserBlacklisted(userId: string): boolean {
        return this.blacklistedUserIds.includes(userId);
    }
}
