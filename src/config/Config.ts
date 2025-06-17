import * as fs from 'fs';

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

    /**
     * Initialize configuration from environment variables
     * 
     * @throws {Error} If required environment variables are missing
     */
    constructor() {
        this.token = process.env.DISCORD_TOKEN || '';
        this.channelIds = this.parseChannelIds(process.env.CHANNEL_ID || '');
        this.saveDirectory = process.env.SAVE_DIRECTORY || './media';
        
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
}
