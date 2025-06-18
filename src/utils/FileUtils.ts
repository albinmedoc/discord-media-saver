import * as fs from 'fs';
import * as path from 'path';
import type { APIAttachment } from 'discord-api-types/v9';

/**
 * File utility functions
 */
export class FileUtils {
    /**
     * Check if a file is a media file based on filename and content type
     */
    static isMediaFile(filename: string, contentType?: string): boolean {
        const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv', '.webm'];
        const mediaContentTypes = ['image/', 'video/'];
        
        const hasMediaExtension = mediaExtensions.some(ext => 
            filename.toLowerCase().endsWith(ext)
        );
        
        const hasMediaContentType = contentType ? mediaContentTypes.some(type => 
            contentType.startsWith(type)
        ) : false;

        return hasMediaExtension || hasMediaContentType;
    }

    /**
     * Check if a file is a video based on filename and content type
     */
    static isVideoFile(filename: string, contentType?: string): boolean {
        const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
        const videoContentTypes = ['video/'];
        
        const hasVideoExtension = videoExtensions.some(ext => 
            filename.toLowerCase().endsWith(ext)
        );
        
        const hasVideoContentType = contentType ? videoContentTypes.some(type => 
            contentType.startsWith(type)
        ) : false;

        return hasVideoExtension || hasVideoContentType;
    }

    /**
     * Generate a safe filename for downloaded media
     */
    static generateSafeFilename(attachment: APIAttachment, username: string, timestamp: string): string {
        const date = new Date(timestamp);
        const dateStr = date.toISOString().slice(0, 19).replace(/[:.]/g, '-');
        
        // Create safe username
        const safeUsername = username.replace(/[^a-zA-Z0-9]/g, '_');
        const extension = path.extname(attachment.filename) || '.unknown';
        const baseName = path.basename(attachment.filename, extension).replace(/[^a-zA-Z0-9._-]/g, '_');
        
        return `${dateStr}_${safeUsername}_${baseName}${extension}`;
    }

    /**
     * Format file size in human readable format
     */
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Parse file size from environment variable
     * Supports formats like: "10MB", "500KB", "1GB", or plain bytes
     * 
     * @param {string | undefined} sizeString - Size string from env var
     * @param {number} defaultValue - Default value if parsing fails
     * @returns {number} Size in bytes
     */
    static parseFileSize(sizeString: string | undefined, defaultValue: number): number {
        if (!sizeString) {
            return defaultValue;
        }

        const sizeStr = sizeString.trim().toUpperCase();
        const numericPart = parseFloat(sizeStr);

        if (isNaN(numericPart)) {
            return defaultValue;
        }

        // If it's just a number, treat as bytes
        if (/^\d+(\.\d+)?$/.test(sizeStr)) {
            return Math.floor(numericPart);
        }

        // Parse size units
        if (sizeStr.endsWith('KB')) {
            return Math.floor(numericPart * 1024);
        } else if (sizeStr.endsWith('MB')) {
            return Math.floor(numericPart * 1024 * 1024);
        } else if (sizeStr.endsWith('GB')) {
            return Math.floor(numericPart * 1024 * 1024 * 1024);
        } else if (sizeStr.endsWith('B')) {
            return Math.floor(numericPart);
        }

        // Default: treat as bytes
        return Math.floor(numericPart);
    }

    /**
     * Remove a file safely (ignores errors)
     */
    static removeFileSafely(filepath: string): void {
        fs.unlink(filepath, () => {}); // Ignore errors
    }
}
