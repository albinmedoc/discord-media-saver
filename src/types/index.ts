import type { APIAttachment } from 'discord-api-types/v9';

/**
 * Configuration interface
 */
export interface IConfig {
    getToken(): string;
    getChannelId(): string;
    getSaveDirectory(): string;
    getDiscordIntents(): number;
    getGatewayUrl(): string;
    getReconnectDelay(): number;
    getIdentifyDelay(): number;
}

/**
 * Media processor interface
 */
export interface IMediaProcessor {
    processAttachments(attachments: APIAttachment[], username: string, timestamp: string): Promise<void>;
}

/**
 * Discord client interface
 */
export interface IDiscordClient {
    connect(): Promise<void>;
    cleanup(): void;
}

/**
 * Logger interface
 */
export interface ILogger {
    info(message: string): void;
    error(message: string, error?: Error | null): void;
    warn(message: string): void;
    success(message: string): void;
}

/**
 * File utilities interface
 */
export interface IFileUtils {
    isMediaFile(filename: string, contentType?: string): boolean;
    generateSafeFilename(attachment: APIAttachment, username: string, timestamp: string): string;
    formatFileSize(bytes: number): string;
    removeFileSafely(filepath: string): void;
}

/**
 * Application interface
 */
export interface IDiscordMediaSaver {
    init(): Promise<void>;
    cleanup(): void;
}
