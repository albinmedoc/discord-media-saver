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
    private readonly channelId: string;
    private readonly saveDirectory: string;

    /**
     * Initialize configuration from environment variables
     * 
     * @throws {Error} If required environment variables are missing
     */
    constructor() {
        this.token = process.env.DISCORD_TOKEN || '';
        this.channelId = process.env.CHANNEL_ID || '';
        this.saveDirectory = process.env.SAVE_DIRECTORY || './media';
        
        this.validateConfig();
        this.ensureDirectoryExists();
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

        if (!this.channelId) {
            console.error('❌ CHANNEL_ID environment variable is required!');
            process.exit(1);
        }

        // Validate channel ID format (should be a snowflake)
        if (!/^\d{17,19}$/.test(this.channelId)) {
            console.error('❌ CHANNEL_ID must be a valid Discord snowflake (17-19 digits)');
            process.exit(1);
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
     * Get the Discord channel ID to monitor
     * 
     * @returns {string} The Discord channel ID
     */
    getChannelId(): string {
        return this.channelId;
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
